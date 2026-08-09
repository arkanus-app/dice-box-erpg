import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { TargetCamera } from '@babylonjs/core/Cameras/targetCamera'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import type { RequiredViewerOptions } from '../types'

export interface SceneLights {
	readonly directional: DirectionalLight
	readonly hemispheric: HemisphericLight
}

export const DISPLAY_CAMERA_HEIGHT = 30
export const DISPLAY_CAMERA_FOV = 0.28
const DISPLAY_GROUND_SIZE = 24

export class SceneEnvironment {
	readonly engine: Engine
	readonly scene: Scene
	readonly camera: TargetCamera
	readonly lights: SceneLights
	readonly #floorMaterial: StandardMaterial
	readonly #floor: AbstractMesh
	#shadowGenerator: ShadowGenerator | undefined
	#shadowResolution = 0
	#options: Readonly<RequiredViewerOptions>

	private constructor(canvas: HTMLCanvasElement, options: Readonly<RequiredViewerOptions>) {
		this.#options = options
		this.engine = new Engine(canvas, options.antialias, {
			alpha: true,
			preserveDrawingBuffer: false,
			stencil: true,
			disableWebGL2Support: false
		})
		this.scene = new Scene(this.engine)
		this.scene.clearColor = new Color4(0, 0, 0, 0)
		this.scene.skipPointerMovePicking = true
		this.camera = new TargetCamera('display-camera', new Vector3(0, DISPLAY_CAMERA_HEIGHT, 0), this.scene)
		this.camera.setTarget(Vector3.Zero())
		this.camera.fov = DISPLAY_CAMERA_FOV
		this.scene.activeCamera = this.camera
		const directional = new DirectionalLight('display-directional', new Vector3(-0.35, -1, 0.25), this.scene)
		directional.position = new Vector3(4, 12, -4)
		directional.intensity = 0.72 * options.lightIntensity
		const hemispheric = new HemisphericLight('display-hemispheric', Vector3.Up(), this.scene)
		hemispheric.intensity = 0.42 * options.lightIntensity
		this.lights = { directional, hemispheric }
		this.#floor = CreateGround('display-ground', { width: DISPLAY_GROUND_SIZE, height: DISPLAY_GROUND_SIZE }, this.scene)
		this.#floor.receiveShadows = options.enableShadows
		this.#floorMaterial = new StandardMaterial('display-ground-material', this.scene)
		this.#floorMaterial.diffuseColor = new Color3(0.05, 0.05, 0.05)
		this.#floorMaterial.specularColor = Color3.Black()
		this.#floorMaterial.alpha = options.enableShadows ? 0.14 : 0
		this.#floor.material = this.#floorMaterial
	}

	static async create(
		canvas: HTMLCanvasElement,
		options: Readonly<RequiredViewerOptions>
	): Promise<SceneEnvironment> {
		const environment = new SceneEnvironment(canvas, options)
		await environment.#updateShadows(options)
		return environment
	}

	addShadowCaster(mesh: AbstractMesh): void {
		this.#shadowGenerator?.addShadowCaster(mesh)
	}

	async update(options: Readonly<RequiredViewerOptions>): Promise<void> {
		this.#options = options
		this.lights.directional.intensity = 0.72 * options.lightIntensity
		this.lights.hemispheric.intensity = 0.42 * options.lightIntensity
		await this.#updateShadows(options)
	}

	async #updateShadows(options: Readonly<RequiredViewerOptions>): Promise<void> {
		if(!options.enableShadows) {
			this.#shadowGenerator?.dispose()
			this.#shadowGenerator = undefined
			this.#shadowResolution = 0
			this.#floor.receiveShadows = false
			this.#floorMaterial.alpha = 0
			return
		}
		if(!this.#shadowGenerator || this.#shadowResolution !== options.shadowResolution) {
			this.#shadowGenerator?.dispose()
			await import('@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent')
			const { ShadowGenerator } = await import('@babylonjs/core/Lights/Shadows/shadowGenerator')
			const generator = new ShadowGenerator(options.shadowResolution, this.lights.directional)
			generator.useBlurExponentialShadowMap = true
			generator.blurKernel = 16
			for(const mesh of this.scene.meshes) {
				if(mesh !== this.#floor && mesh.isEnabled() && mesh.isVisible) generator.addShadowCaster(mesh)
			}
			this.#shadowGenerator = generator
			this.#shadowResolution = options.shadowResolution
		}
		this.#shadowGenerator.darkness = options.shadowTransparency
		this.#floor.receiveShadows = true
		this.#floorMaterial.alpha = 0.14
	}

	resize(): void {
		this.engine.resize()
	}

	ensureGroundCoverage(width: number, depth: number): void {
		this.#floor.scaling.x = Math.max(1, width / DISPLAY_GROUND_SIZE)
		this.#floor.scaling.z = Math.max(1, depth / DISPLAY_GROUND_SIZE)
	}

	dispose(): void {
		this.engine.stopRenderLoop()
		this.#shadowGenerator?.dispose()
		this.#shadowGenerator = undefined
		this.scene.dispose()
		this.engine.dispose()
	}
}
