import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'
import type { NormalizedResolvedDie, ResolvedThemeConfig } from '../types'

interface BabylonModelSource {
	readonly meshes: readonly Record<string, unknown>[]
	readonly colliderFaceMap: Readonly<Record<string, Readonly<Record<string, number>>>>
}

interface LoadedModel {
	readonly visualMeshes: ReadonlyMap<string, Mesh>
	readonly colliderMeshes: ReadonlyMap<string, Mesh>
	readonly faceMaps: BabylonModelSource['colliderFaceMap']
}

/**
 * Color themes store the labels in the diffuse texture alpha channel. The
 * transparent texels mean "use the selected dice color", not "hide the die".
 * Keeping this composition in a core material plugin preserves the original
 * theme contract without pulling @babylonjs/materials back into the bundle.
 */
class ColorTextureMaskPlugin extends MaterialPluginBase {
	constructor(material: StandardMaterial) {
		super(material, 'dice-color-texture-mask', 200, {}, true, true)
	}

	override getCustomCode(shaderType: string): Record<string, string> | null {
		if(shaderType !== 'fragment') return null
		return {
			CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
#ifdef DIFFUSE
	baseColor.rgb = mix(diffuseColor, baseColor.rgb, baseColor.a);
	baseColor.a = 1.0;
	diffuseColor = vec3(1.0);
#endif
`
		}
	}
}

export interface PolyhedralInstance {
	readonly mesh: Mesh
	readonly physicsCollider: Mesh
	readonly supportHeight: number
	readonly targetQuaternion: Quaternion
}

interface CachedOrientation {
	readonly supportHeight: number
	readonly targetQuaternion: Quaternion
}

const resolveAsset = (basePath: string, value: string): string =>
	/^(?:data:|https?:|\/)/.test(value) ? value : `${basePath}/${value}`

const isLightColor = (hex: string): boolean => {
	const value = hex.replace('#', '')
	if(!/^[0-9a-f]{6}$/i.test(value)) return false
	const red = Number.parseInt(value.slice(0, 2), 16)
	const green = Number.parseInt(value.slice(2, 4), 16)
	const blue = Number.parseInt(value.slice(4, 6), 16)
	return red * 0.299 + green * 0.587 + blue * 0.114 > 175
}

const getPoint = (positions: ArrayLike<number>, indices: ArrayLike<number> | null, triangle: number, offset: number): Vector3 => {
	const index = indices?.[triangle * 3 + offset] ?? triangle * 3 + offset
	return new Vector3(positions[index * 3] ?? 0, positions[index * 3 + 1] ?? 0, positions[index * 3 + 2] ?? 0)
}

export const getFaceNormal = (collider: Mesh, triangle: number): Vector3 | null => {
	const positions = collider.getVerticesData('position')
	if(!positions) return null
	const indices = collider.getIndices()
	const p0 = getPoint(positions, indices, triangle, 0)
	const p1 = getPoint(positions, indices, triangle, 1)
	const p2 = getPoint(positions, indices, triangle, 2)
	const normal = Vector3.Cross(p1.subtract(p0), p2.subtract(p0))
	if(normal.lengthSquared() < 1e-10) return null
	const center = p0.add(p1).add(p2).scale(1 / 3)
	if(Vector3.Dot(normal, center) < 0) normal.scaleInPlace(-1)
	return normal.normalize()
}

export const getTargetQuaternion = (collider: Mesh, faceMap: Readonly<Record<string, number>>, value: number, d4: boolean): Quaternion => {
	const aggregate = Vector3.Zero()
	let matches = 0
	for(const [triangle, faceValue] of Object.entries(faceMap)) {
		if(Number(faceValue) !== value) continue
		const normal = getFaceNormal(collider, Number(triangle))
		if(normal) {
			aggregate.addInPlace(normal)
			matches++
		}
	}
	if(matches === 0 || aggregate.lengthSquared() < 1e-10) {
		throw new Error(`No orientation was found for face ${value}.`)
	}
	const targetDirection = d4 ? Vector3.Down() : Vector3.Up()
	return Quaternion.FromUnitVectorsToRef(aggregate.normalize(), targetDirection, Quaternion.Identity()).normalize()
}

export const getSupportHeight = (collider: Mesh, targetQuaternion: Quaternion): number => {
	const positions = collider.getVerticesData('position')
	if(!positions?.length) throw new Error(`Collider '${collider.name}' has no positions.`)
	const rotation = Matrix.Identity()
	Matrix.FromQuaternionToRef(targetQuaternion, rotation)
	let minimumY = Number.POSITIVE_INFINITY
	for(let index = 0; index < positions.length; index += 3) {
		const point = Vector3.TransformCoordinates(new Vector3(
			positions[index] ?? 0,
			positions[index + 1] ?? 0,
			positions[index + 2] ?? 0
		), rotation)
		minimumY = Math.min(minimumY, point.y)
	}
	if(!Number.isFinite(minimumY)) throw new Error(`Collider '${collider.name}' has invalid positions.`)
	return Math.max(0, -minimumY)
}

export class PolyhedralFactory {
	readonly #scene: Scene
	readonly #models = new Map<string, Promise<LoadedModel>>()
	readonly #materials = new Map<string, StandardMaterial>()
	readonly #orientations = new Map<string, CachedOrientation>()
	readonly #pool = new Map<string, Mesh[]>()

	constructor(scene: Scene) {
		this.#scene = scene
	}

	load(config: ResolvedThemeConfig): Promise<LoadedModel> {
		const cached = this.#models.get(config.meshName)
		if(cached) return cached
		const pending = this.#load(config)
		this.#models.set(config.meshName, pending)
		pending.catch(() => this.#models.delete(config.meshName))
		return pending
	}

	async create(
		config: ResolvedThemeConfig,
		die: NormalizedResolvedDie,
		sides: number,
		faceValue: number,
		id: string,
		scale: number,
		colliderScale: number
	): Promise<PolyhedralInstance> {
		const model = await this.load(config)
		const type = `d${sides}`
		const source = model.visualMeshes.get(type)
		const collider = model.colliderMeshes.get(type)
		const faceMap = model.faceMaps[type]
		if(!source || !collider || !faceMap) throw new Error(`${type} is unavailable in theme '${config.theme}'.`)
		const poolKey = `${config.meshName}|${type}`
		const mesh = this.#pool.get(poolKey)?.pop() ?? source.clone(`${config.theme}-${type}-${id}`, null, false)
		if(!mesh) throw new Error(`Unable to instantiate ${type}.`)
		mesh.name = `${config.theme}-${type}-${id}`
		mesh.metadata = { ...mesh.metadata, displayFactory: 'polyhedron', poolKey }
		mesh.setEnabled(true)
		mesh.isPickable = false
		mesh.doNotSyncBoundingInfo = false
		mesh.unfreezeWorldMatrix()
		// Pooled meshes may have been displayed before. Scale is an absolute
		// viewer option and must never compound across presentations.
		mesh.scaling.setAll(scale)
		mesh.rotationQuaternion = Quaternion.Identity()
		mesh.material = this.#getMaterial(config, die.themeColor, die.discarded)
		const orientationKey = `${config.meshName}|${type}|${faceValue}`
		let orientation = this.#orientations.get(orientationKey)
		if(!orientation) {
			const targetQuaternion = getTargetQuaternion(collider, faceMap, faceValue, sides === 4)
			orientation = {
				supportHeight: getSupportHeight(collider, targetQuaternion),
				targetQuaternion
			}
			this.#orientations.set(orientationKey, orientation)
		}
		return {
			mesh,
			physicsCollider: collider,
			supportHeight: orientation.supportHeight * scale * colliderScale,
			targetQuaternion: orientation.targetQuaternion.clone()
		}
	}

	release(mesh: Mesh): void {
		const key = typeof mesh.metadata?.poolKey === 'string' ? mesh.metadata.poolKey : undefined
		if(!key) {
			mesh.dispose(false, false)
			return
		}
		mesh.setEnabled(false)
		mesh.position.set(0, -100, 0)
		mesh.rotationQuaternion = Quaternion.Identity()
		mesh.scaling.setAll(1)
		const pool = this.#pool.get(key) ?? []
		pool.push(mesh)
		this.#pool.set(key, pool)
	}

	async #load(config: ResolvedThemeConfig): Promise<LoadedModel> {
		const response = await fetch(config.meshFilePath)
		if(!response.ok) throw new Error(`Unable to fetch dice model '${config.meshFilePath}'.`)
		const source = await response.json() as BabylonModelSource
		if(!source.colliderFaceMap) throw new Error(`Dice model '${config.meshFilePath}' has no colliderFaceMap.`)
		const visualMeshes = new Map<string, Mesh>()
		const colliderMeshes = new Map<string, Mesh>()
		for(const meshSource of source.meshes) {
			const parsedSource = { ...meshSource }
			delete parsedSource.physicsImpostor
			const mesh = Mesh.Parse(parsedSource, this.#scene, '')
			const originalName = mesh.name
			mesh.name = `${config.meshName}_${originalName}`
			mesh.setEnabled(false)
			mesh.isPickable = false
			mesh.freezeNormals()
			mesh.computeWorldMatrix(true)
			if(originalName.endsWith('_collider')) colliderMeshes.set(originalName.replace('_collider', ''), mesh)
			else visualMeshes.set(originalName, mesh)
		}
		if(!visualMeshes.has('d100') && visualMeshes.has('d10')) visualMeshes.set('d100', visualMeshes.get('d10')!)
		if(!colliderMeshes.has('d100') && colliderMeshes.has('d10')) colliderMeshes.set('d100', colliderMeshes.get('d10')!)
		return { visualMeshes, colliderMeshes, faceMaps: source.colliderFaceMap }
	}

	#getMaterial(config: ResolvedThemeConfig, themeColor: string, discarded: boolean): StandardMaterial {
		const key = `${config.theme}|${themeColor}|${discarded}`
		const cached = this.#materials.get(key)
		if(cached) return cached
		const material = new StandardMaterial(`display-material-${key}`, this.#scene)
		const baseColor = discarded ? new Color3(0.45, 0.45, 0.45) : Color3.FromHexString(themeColor)
		material.diffuseColor = config.material.type === 'color'
			? baseColor
			: discarded ? baseColor : Color3.White()
		material.emissiveColor = baseColor.scale(0.18)
		material.specularColor = discarded ? new Color3(0.1, 0.1, 0.1) : new Color3(0.35, 0.35, 0.35)
		const diffuseDefinition = config.material.diffuseTexture
		const diffuse = typeof diffuseDefinition === 'string'
			? diffuseDefinition
			: diffuseDefinition?.[isLightColor(themeColor) ? 'dark' : 'light']
		if(diffuse) {
			material.diffuseTexture = new Texture(resolveAsset(config.basePath, diffuse), this.#scene, false, true)
			material.diffuseTexture.level = config.material.diffuseLevel ?? 1
			if(config.material.type === 'color') new ColorTextureMaskPlugin(material)
		}
		if(config.material.bumpTexture) {
			material.bumpTexture = new Texture(resolveAsset(config.basePath, config.material.bumpTexture), this.#scene, false, true)
			material.bumpTexture.level = config.material.bumpLevel ?? 1
		}
		if(config.material.specularTexture) {
			material.specularTexture = new Texture(resolveAsset(config.basePath, config.material.specularTexture), this.#scene, false, true)
		}
		material.freeze()
		this.#materials.set(key, material)
		return material
	}

	dispose(): void {
		for(const pool of this.#pool.values()) {
			for(const mesh of pool) mesh.dispose(false, false)
		}
		this.#pool.clear()
		for(const material of this.#materials.values()) material.dispose(true, true)
		this.#materials.clear()
		this.#orientations.clear()
		this.#models.clear()
	}
}
