import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Material } from '@babylonjs/core/Materials/material'
import type { Scene } from '@babylonjs/core/scene'
import type { CoinTheme, NormalizedResolvedDie, ResolvedThemeConfig } from '../types'

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

const isBundledNumericCoinTexture = (textureUrl: string): boolean =>
	/\/coin-[12]\.svg(?:\?|$)/.test(textureUrl)

const parseColor = (value: string, fallback: string): Color3 => {
	try {
		return Color3.FromHexString(value)
	} catch {
		return Color3.FromHexString(fallback)
	}
}

export const getCoinAccentColor = (theme: CoinTheme, themeColor: string): string =>
	theme.colorize ? themeColor : theme.edgeColor || themeColor

export const getCoinTemplateKey = (
	theme: string,
	themeColor: string,
	discarded: boolean
): string => `${theme}|${themeColor.toLowerCase()}|${String(discarded)}`

const createFallbackTexture = (
	scene: Scene,
	name: string,
	value: 1 | 2,
	rotateText: boolean
): DynamicTexture => {
	const texture = new DynamicTexture(name, { width: 256, height: 256 }, scene, false)
	const context = texture.getContext() as unknown as CanvasRenderingContext2D
	context.clearRect(0, 0, 256, 256)
	context.save()
	context.font = 'bold 148px sans-serif'
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	context.lineJoin = 'round'
	if(rotateText) {
		context.translate(128, 128)
		context.rotate(Math.PI)
		context.translate(-128, -128)
	}
	context.strokeStyle = '#111827'
	context.lineWidth = 12
	context.strokeText(String(value), 128, 139)
	context.fillStyle = '#f8fafc'
	context.fillText(String(value), 128, 139)
	context.restore()
	texture.hasAlpha = true
	texture.update(false)
	return texture
}

const createFaceMaterial = (
	scene: Scene,
	name: string,
	basePath: string,
	theme: CoinTheme,
	face: 'front' | 'back',
	themeColor: string,
	discarded: boolean
): StandardMaterial => {
	const definition = theme[face]
	const material = new StandardMaterial(name, scene)
	material.specularColor = new Color3(0.3, 0.3, 0.3)
	const textureUrl = definition.texture ? resolveTextureUrl(basePath, definition.texture) : ''
	if(theme.colorize) {
		const surfaceColor = discarded
			? new Color3(0.45, 0.45, 0.45)
			: parseColor(themeColor, '#2e8555')
		material.disableLighting = true
		material.diffuseColor = surfaceColor
		material.emissiveColor = surfaceColor
	} else {
		const texture = textureUrl
			? new Texture(textureUrl, scene, false, false)
			: createFallbackTexture(scene, `${name}-fallback`, definition.value, face === 'front')
		texture.hasAlpha = true
		if(face === 'front') texture.wAng = Math.PI
		material.diffuseColor = discarded ? new Color3(0.45, 0.45, 0.45) : Color3.White()
		material.emissiveColor = new Color3(0.22, 0.22, 0.22)
		material.diffuseTexture = texture
		material.emissiveTexture = texture
	}
	material.freeze()
	return material
}

const createFaceArtworkMaterial = (
	scene: Scene,
	name: string,
	basePath: string,
	theme: CoinTheme,
	face: 'front' | 'back'
): StandardMaterial => {
	const definition = theme[face]
	const textureUrl = definition.texture ? resolveTextureUrl(basePath, definition.texture) : ''
	const texture = textureUrl && !isBundledNumericCoinTexture(textureUrl)
		? new Texture(textureUrl, scene, false, true)
		: createFallbackTexture(scene, `${name}-fallback`, definition.value, face === 'front')
	texture.hasAlpha = true
	if(face === 'front') texture.wAng = Math.PI
	const material = new StandardMaterial(name, scene)
	material.backFaceCulling = false
	material.disableLighting = true
	material.diffuseColor = Color3.White()
	material.diffuseTexture = texture
	material.emissiveColor = Color3.White()
	material.emissiveTexture = texture
	material.specularColor = Color3.Black()
	material.transparencyMode = Material.MATERIAL_ALPHABLEND
	material.useAlphaFromDiffuseTexture = true
	material.freeze()
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

	create(themeConfig: ResolvedThemeConfig, die: NormalizedResolvedDie, scale: number): CoinInstance {
		const templateKey = getCoinTemplateKey(themeConfig.theme, die.themeColor, die.discarded)
		const template = this.#getTemplate(themeConfig, die.themeColor, die.discarded)
		const available = this.#pool.get(templateKey)
		const root = available?.pop() ?? template.root.clone(`coin-${die.id}`, null, false) as TransformNode
		root.name = `coin-${die.id}`
		root.metadata = { displayFactory: 'coin', poolKey: templateKey }
		root.setEnabled(true)
		root.scaling.setAll(scale * 0.14)
		root.rotationQuaternion = Quaternion.Identity()
		const meshes = root.getChildMeshes(false)
		for(const mesh of meshes) mesh.visibility = die.discarded ? 0.42 : 1
		return {
			root,
			meshes,
			supportHeight: thicknessSupport(template.thickness, scale),
			horizontalRadius: template.diameter * scale * 0.14 / 2,
			targetQuaternion: getCoinTargetQuaternion(die.value)
		}
	}

	#getTemplate(config: ResolvedThemeConfig, themeColor: string, discarded: boolean): CoinTemplate {
		const templateKey = getCoinTemplateKey(config.theme, themeColor, discarded)
		const cached = this.#templates.get(templateKey)
		if(cached) return cached
		const coin = config.coin
		const diameter = Math.max(0.3, Number(coin.diameter) || 1)
		const thickness = Math.max(0.04, Number(coin.thickness) || 0.12)
		const styleName = templateKey.replace(/[^a-z0-9-]+/gi, '-')
		const root = new TransformNode(`coin-template-${styleName}`, this.#scene)
		const edgeMaterial = new StandardMaterial(`coin-edge-${styleName}`, this.#scene)
		const edgeBaseColor = discarded
			? new Color3(0.45, 0.45, 0.45)
			: parseColor(getCoinAccentColor(coin, themeColor), '#2e8555')
		edgeMaterial.diffuseColor = coin.colorize ? edgeBaseColor.scale(0.72) : edgeBaseColor
		edgeMaterial.emissiveColor = edgeMaterial.diffuseColor.scale(0.12)
		edgeMaterial.specularColor = new Color3(0.65, 0.65, 0.65)
		edgeMaterial.freeze()
		const frontMaterial = createFaceMaterial(
			this.#scene,
			`coin-front-${styleName}`,
			config.basePath,
			coin,
			'front',
			themeColor,
			discarded
		)
		const backMaterial = createFaceMaterial(
			this.#scene,
			`coin-back-${styleName}`,
			config.basePath,
			coin,
			'back',
			themeColor,
			discarded
		)
		const frontArtworkMaterial = coin.colorize
			? createFaceArtworkMaterial(this.#scene, `coin-front-artwork-${styleName}`, config.basePath, coin, 'front')
			: null
		const backArtworkMaterial = coin.colorize
			? createFaceArtworkMaterial(this.#scene, `coin-back-artwork-${styleName}`, config.basePath, coin, 'back')
			: null
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
		if(frontArtworkMaterial) {
			const frontArtwork = CreateDisc(
				`${root.name}-front-artwork`,
				{ radius, tessellation: 48, sideOrientation: 2 },
				this.#scene
			)
			frontArtwork.rotation.x = Math.PI / 2
			frontArtwork.position.y = thickness / 2 + 0.003
			frontArtwork.material = frontArtworkMaterial
			frontArtwork.parent = root
		}
		if(backArtworkMaterial) {
			const backArtwork = CreateDisc(
				`${root.name}-back-artwork`,
				{ radius, tessellation: 48, sideOrientation: 2 },
				this.#scene
			)
			backArtwork.rotation.x = -Math.PI / 2
			backArtwork.position.y = -thickness / 2 - 0.003
			backArtwork.material = backArtworkMaterial
			backArtwork.parent = root
		}
		root.setEnabled(false)
		const template = {
			root,
			materials: [
				edgeMaterial,
				frontMaterial,
				backMaterial,
				...(frontArtworkMaterial ? [frontArtworkMaterial] : []),
				...(backArtworkMaterial ? [backArtworkMaterial] : [])
			],
			diameter,
			thickness
		}
		this.#templates.set(templateKey, template)
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
