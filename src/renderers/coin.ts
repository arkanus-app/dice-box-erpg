import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { Material } from '@babylonjs/core/Materials/material'
import type { Scene } from '@babylonjs/core/scene'
import type { CoinTheme, ResolvedThemeConfig } from '../types'

export interface CoinInstance {
	readonly root: TransformNode
	readonly meshes: readonly AbstractMesh[]
	readonly supportHeight: number
	readonly horizontalRadius: number
	readonly targetQuaternion: Quaternion
}

interface CoinTemplate {
	readonly root: TransformNode
	readonly materials: readonly Material[]
	readonly diameter: number
	readonly thickness: number
}

const resolveTextureUrl = (basePath: string, texture: string): string =>
	/^(?:data:|https?:|\/)/.test(texture) ? texture : `${basePath}/${texture}`

const createFallbackTexture = (scene: Scene, name: string, value: 1 | 2, color: string, rotateText: boolean): DynamicTexture => {
	const texture = new DynamicTexture(name, { width: 256, height: 256 }, scene, false)
	const context = texture.getContext() as unknown as CanvasRenderingContext2D
	context.fillStyle = color
	context.fillRect(0, 0, 256, 256)
	context.strokeStyle = '#5f4218'
	context.lineWidth = 14
	context.beginPath()
	context.arc(128, 128, 112, 0, Math.PI * 2)
	context.stroke()
	context.fillStyle = '#24180a'
	context.font = 'bold 148px sans-serif'
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	if(rotateText) {
		context.translate(128, 128)
		context.rotate(Math.PI)
		context.translate(-128, -128)
	}
	context.fillText(String(value), 128, 139)
	texture.update(false)
	return texture
}

const createFaceMaterial = (
	scene: Scene,
	name: string,
	basePath: string,
	theme: CoinTheme,
	face: 'front' | 'back'
): StandardMaterial => {
	const definition = theme[face]
	const material = new StandardMaterial(name, scene)
	material.diffuseColor = Color3.White()
	material.emissiveColor = new Color3(0.22, 0.22, 0.22)
	material.specularColor = new Color3(0.3, 0.3, 0.3)
	const textureUrl = definition.texture ? resolveTextureUrl(basePath, definition.texture) : ''
	if(textureUrl && !/\/coin-[12]\.svg(?:\?|$)/.test(textureUrl)) {
		const texture = new Texture(textureUrl, scene, false, false)
		texture.hasAlpha = true
		if(face === 'front') texture.wAng = Math.PI
		material.diffuseTexture = texture
		material.emissiveTexture = texture
	} else {
		material.diffuseTexture = createFallbackTexture(scene, `${name}-fallback`, definition.value, '#d6ae52', face === 'front')
	}
	return material
}

export const getCoinTargetQuaternion = (value: number): Quaternion =>
	value === 1 ? Quaternion.Identity() : Quaternion.RotationAxis(Vector3.Forward(), Math.PI)

const thicknessSupport = (thickness: number, scale: number): number =>
	thickness * scale * 0.14 / 2

export class CoinFactory {
	readonly #templates = new Map<string, CoinTemplate>()
	readonly #pool = new Map<string, TransformNode[]>()
	readonly #scene: Scene

	constructor(scene: Scene) {
		this.#scene = scene
	}

	create(themeConfig: ResolvedThemeConfig, id: string, value: number, scale: number, discarded = false): CoinInstance {
		const template = this.#getTemplate(themeConfig)
		const available = this.#pool.get(themeConfig.theme)
		const root = available?.pop() ?? template.root.clone(`coin-${id}`, null, false) as TransformNode
		root.name = `coin-${id}`
		root.metadata = { displayFactory: 'coin', poolKey: themeConfig.theme }
		root.setEnabled(true)
		root.scaling.setAll(scale * 0.14)
		root.rotationQuaternion = Quaternion.Identity()
		const meshes = root.getChildMeshes(false)
		for(const mesh of meshes) mesh.visibility = discarded ? 0.42 : 1
		return {
			root,
			meshes,
			supportHeight: thicknessSupport(template.thickness, scale),
			horizontalRadius: template.diameter * scale * 0.14 / 2,
			targetQuaternion: getCoinTargetQuaternion(value)
		}
	}

	#getTemplate(config: ResolvedThemeConfig): CoinTemplate {
		const cached = this.#templates.get(config.theme)
		if(cached) return cached
		const coin = config.coin
		const diameter = Math.max(0.3, Number(coin.diameter) || 1)
		const thickness = Math.max(0.04, Number(coin.thickness) || 0.12)
		const root = new TransformNode(`coin-template-${config.theme}`, this.#scene)
		const edgeMaterial = new StandardMaterial(`coin-edge-${config.theme}`, this.#scene)
		edgeMaterial.diffuseColor = Color3.FromHexString(coin.edgeColor || '#c89b3c')
		edgeMaterial.specularColor = new Color3(0.65, 0.65, 0.65)
		const frontMaterial = createFaceMaterial(this.#scene, `coin-front-${config.theme}`, config.basePath, coin, 'front')
		const backMaterial = createFaceMaterial(this.#scene, `coin-back-${config.theme}`, config.basePath, coin, 'back')
		const edge = CreateCylinder(`${root.name}-edge`, { diameter, height: thickness, tessellation: 48, cap: 0 }, this.#scene)
		edge.material = edgeMaterial
		edge.parent = root
		const radius = diameter * 0.48
		const front = CreateDisc(`${root.name}-front`, { radius, tessellation: 48, sideOrientation: 2 }, this.#scene)
		front.rotation.x = Math.PI / 2
		front.position.y = thickness / 2 + 0.001
		front.material = frontMaterial
		front.parent = root
		const back = CreateDisc(`${root.name}-back`, { radius, tessellation: 48, sideOrientation: 2 }, this.#scene)
		back.rotation.x = -Math.PI / 2
		back.position.y = -thickness / 2 - 0.001
		back.material = backMaterial
		back.parent = root
		root.setEnabled(false)
		const template = { root, materials: [edgeMaterial, frontMaterial, backMaterial], diameter, thickness }
		this.#templates.set(config.theme, template)
		return template
	}

	release(root: TransformNode): void {
		const key = typeof root.metadata?.poolKey === 'string' ? root.metadata.poolKey : undefined
		if(!key) {
			root.dispose(false, false)
			return
		}
		root.setEnabled(false)
		root.position.set(0, -100, 0)
		root.rotationQuaternion = Quaternion.Identity()
		const pool = this.#pool.get(key) ?? []
		pool.push(root)
		this.#pool.set(key, pool)
	}

	dispose(): void {
		for(const pool of this.#pool.values()) {
			for(const root of pool) root.dispose(false, false)
		}
		this.#pool.clear()
		for(const template of this.#templates.values()) {
			template.root.dispose(false, true)
			for(const material of template.materials) material.dispose(true, true)
		}
		this.#templates.clear()
	}
}
