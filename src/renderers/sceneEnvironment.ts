import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { TargetCamera } from '@babylonjs/core/Cameras/targetCamera'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { RequiredViewerOptions } from '../types'

export interface SceneLights {
	readonly directional: DirectionalLight & { shadowGenerator: ShadowGenerator }
	readonly hemispheric: HemisphericLight
}

export const DISPLAY_CAMERA_HEIGHT = 30
export const DISPLAY_CAMERA_FOV = 0.28

export class SceneEnvironment {
	readonly engine: Engine
	readonly scene: Scene
	readonly camera: TargetCamera
	readonly lights: SceneLights
	readonly #floorMaterial: StandardMaterial
	readonly #floor: AbstractMesh
	#options: Readonly<RequiredViewerOptions>

	constructor(canvas: HTMLCanvasElement, options: Readonly<RequiredViewerOptions>) {
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
		const directional = new DirectionalLight('display-directional', new Vector3(-0.35, -1, 0.25), this.scene) as SceneLights['directional']
		directional.position = new Vector3(4, 12, -4)
		directional.intensity = 0.72 * options.lightIntensity
		directional.shadowGenerator = new ShadowGenerator(options.shadowResolution, directional)
		directional.shadowGenerator.darkness = options.shadowTransparency
		directional.shadowGenerator.useBlurExponentialShadowMap = true
		directional.shadowGenerator.blurKernel = 16
		const hemispheric = new HemisphericLight('display-hemispheric', Vector3.Up(), this.scene)
		hemispheric.intensity = 0.42 * options.lightIntensity
		this.lights = { directional, hemispheric }
		this.#floor = CreateGround('display-ground', { width: 24, height: 24 }, this.scene)
		this.#floor.receiveShadows = options.enableShadows
		this.#floorMaterial = new StandardMaterial('display-ground-material', this.scene)
		this.#floorMaterial.diffuseColor = new Color3(0.05, 0.05, 0.05)
		this.#floorMaterial.specularColor = Color3.Black()
		this.#floorMaterial.alpha = options.enableShadows ? 0.14 : 0
		this.#floor.material = this.#floorMaterial
	}

	addShadowCaster(mesh: AbstractMesh): void {
		if(this.#options.enableShadows) this.lights.directional.shadowGenerator.addShadowCaster(mesh)
	}

	update(options: Readonly<RequiredViewerOptions>): void {
		this.#options = options
		this.lights.directional.intensity = 0.72 * options.lightIntensity
		this.lights.hemispheric.intensity = 0.42 * options.lightIntensity
		this.lights.directional.shadowGenerator.darkness = options.shadowTransparency
		this.#floor.receiveShadows = options.enableShadows
		this.#floorMaterial.alpha = options.enableShadows ? 0.14 : 0
	}

	resize(): void {
		this.engine.resize()
	}

	dispose(): void {
		this.engine.stopRenderLoop()
		this.scene.dispose()
		this.engine.dispose()
	}
}
