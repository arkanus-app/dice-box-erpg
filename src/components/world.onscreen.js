import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector'
import HavokPhysics from '@babylonjs/havok'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import { createEngine } from './world/engine'
import { createScene } from './world/scene'
import { createCamera } from './world/camera'
import { createLights } from './world/lights'
import Container from './Container'
import Dice from './Dice'
import ThemeLoader from './ThemeLoader'
import { DICE_PHYSICS_SUB_TIME_STEP_MS, DicePhysics } from './physics'

class WorldOnscreen {
	config
	initialized = false
	#dieCache = {}
	#count = 0
	#sleeperCount = 0
	#dieRollTimer = []
	#canvas
	#engine
	#scene
	#camera
	#lights
	#container
	#themeLoader
	#meshList = {}
	#physics = null
	#physicsObserver = null
	noop = () => {}

	constructor(options){
		this.onInitComplete = options.onInitComplete || this.noop
		this.onThemeLoaded = options.onThemeLoaded || this.noop
		this.onRollResult = options.onRollResult || this.noop
		this.onRollError = options.onRollError || this.noop
		this.onRollComplete = options.onRollComplete || this.noop
		this.onDieRemoved = options.onDieRemoved || this.noop
		this.onCollision = options.onCollision || this.noop
		this.initialized = this.initScene(options)
	}

	async initScene(config) {
		this.#canvas = config.canvas
		const width = Math.max(1, config.width || this.#canvas.clientWidth || this.#canvas.parentElement?.clientWidth || this.#canvas.width || 300)
		const height = Math.max(1, config.height || this.#canvas.clientHeight || this.#canvas.parentElement?.clientHeight || this.#canvas.height || 150)
		this.#canvas.width = width
		this.#canvas.height = height

		this.config = config.options

		// setup babylonJS scene
		this.#engine = createEngine(this.#canvas, { antialias: this.config.antialias })
		this.#scene = createScene({ engine: this.#engine })
		this.#camera = createCamera({ engine: this.#engine, scene: this.#scene })
		this.#lights = createLights({
			enableShadows: this.config.enableShadows,
			shadowTransparency: this.config.shadowTransparency,
			shadowResolution: this.config.shadowResolution,
			intensity: this.config.lightIntensity,
			scene: this.#scene
		})

		// Initialize Havok Physics V2
		try {
			const havokInstance = await HavokPhysics()
			const havokPlugin = new HavokPlugin(true, havokInstance)
			this.#scene.enablePhysics(new Vector3(0, -9.81 * (this.config.gravity || 1), 0), havokPlugin)
		} catch(err) {
			console.error('[DiceBox] Havok init failed:', err)
		}

		// create the box that provides surfaces for shadows to render on
		this.#container = new Container({
			enableShadows: this.config.enableShadows,
			aspect: this.#canvas.width / this.#canvas.height,
			lights: this.#lights,
			scene: this.#scene
		})

		this.#themeLoader = new ThemeLoader({ scene: this.#scene })

		// Create DicePhysics manager (runs on main thread via Havok)
		this.#physics = new DicePhysics({
			scene: this.#scene,
			config: this.config,
			onCollision: event => this.onCollision(event)
		})
		this.#physics.buildBox()

		// Hook into Babylon's before-physics step to run our guidance system
		this.#physicsObserver = this.#scene.onBeforePhysicsObservable.add(() => {
			const delta = this.#scene.getPhysicsEngine?.()?.getSubTimeStep?.() || DICE_PHYSICS_SUB_TIME_STEP_MS
			this.#tickPhysics(delta)
		})

		this.onInitComplete()
	}

	#tickPhysics(delta) {
		if(!this.#physics) return
		const sleeping = this.#physics.update(delta)
		if(sleeping) {
			const die = this.#dieCache[`${sleeping.id}`]
			if(die) {
				// Copy final transform from physics mesh to visual mesh
				if(sleeping.physMesh?.rotationQuaternion && die.mesh?.rotationQuaternion) {
					die.mesh.rotationQuaternion.copyFrom(sleeping.physMesh.rotationQuaternion)
				}
				this.handleAsleep(die)
			}
		}

		// Sync all live physics bodies -> visual meshes
		const bodies = this.#physics.getBodiesState()
		for(const b of bodies) {
			const die = this.#dieCache[`${b.id}`]
			if(!die?.mesh) continue
			die.mesh.position.copyFrom(b.position)
			if(b.rotationQuaternion) {
				const rawQ = die.__rawRotationQuaternion || new Quaternion()
				rawQ.copyFrom(b.rotationQuaternion)
				die.__rawRotationQuaternion = rawQ
				if(!die.asleep) die.mesh.rotationQuaternion.copyFrom(b.rotationQuaternion)
			}
			// Trigger guide update if this die needs a forced result
			const hasForcedFace = die.config.forcedFaceValue !== undefined || die.config.forcedValue !== undefined
			if(hasForcedFace) {
				die.__forcedSyncFrames = (die.__forcedSyncFrames || 0) + 1
				this.#guideForcedDie(die)
			}
		}
	}

	updateConfig(options) {
		const prevConfig = this.config
		this.config = { ...this.config, ...(options || {}) }
		if(prevConfig.enableShadows !== this.config.enableShadows) {
			Object.values(this.#lights).forEach(light => light.dispose())
			this.#lights = createLights({
				enableShadows: this.config.enableShadows,
				shadowTransparency: this.config.shadowTransparency,
				shadowResolution: this.config.shadowResolution,
				intensity: this.config.lightIntensity,
				scene: this.#scene
			})
		}
		if(prevConfig.scale !== this.config.scale) {
			Object.values(this.#dieCache).forEach(({mesh}) => {
				if(mesh) {
					const {x=1,y=1,z=1} = mesh?.metadata?.baseScale
					mesh.scaling = new Vector3(this.config.scale*x, this.config.scale*y, this.config.scale*z)
				}
			})
		}
		if(prevConfig.shadowTransparency !== this.config.shadowTransparency) {
			this.#lights.directional.shadowGenerator.darkness = this.config.shadowTransparency
		}
		if(prevConfig.lightIntensity !== this.config.lightIntensity) {
			this.#lights.directional.intensity = .65 * this.config.lightIntensity
			this.#lights.hemispheric.intensity = .4 * this.config.lightIntensity
		}
		this.#physics?.updateConfig(this.config)
	}

	render(newStartPoint) {
		this.#engine.runRenderLoop(this.renderLoop.bind(this))
	}

	renderLoop() {
		if(this.#sleeperCount > 0 && this.#sleeperCount === Object.keys(this.#dieCache).length) {
			this.#engine.stopRenderLoop()
			this.onRollComplete()
		} else {
			this.#scene.render()
		}
	}

	async loadTheme(options) {
		const {theme, basePath, material, meshFilePath, meshName} = options
		await this.#themeLoader.load({theme, basePath, material})

		if(!Object.keys(this.#meshList).includes(meshName)) {
			this.#meshList[meshName] = meshFilePath
			const colliders = await Dice.loadModels({meshFilePath, meshName}, this.#scene)
			if(!colliders) {
				throw new Error("No colliders returned from the 3D mesh file.")
			}
			// Register each collider mesh in the physics engine
			colliders.forEach(colliderData => {
				const key = `${meshName}_${colliderData.name}`
				const colliderMesh = this.#scene.getMeshByName(key)
				if(colliderMesh) {
					this.#physics?.registerColliderMesh(key, colliderMesh, colliderData)
				}
			})
		}
		this.onThemeLoaded({ id: theme })
	}

	clear() {
		if(!Object.keys(this.#dieCache).length && !this.#sleeperCount) return
		this.#dieRollTimer.forEach(timer => clearTimeout(timer))
		this.#engine.stopRenderLoop()
		Object.values(this.#dieCache).forEach(die => {
			if(die.mesh) die.mesh.dispose()
		})
		this.#physics?.clearDice()
		this.#dieCache = {}
		this.#count = 0
		this.#sleeperCount = 0
		this.#scene.render()
	}

	dispose() {
		if(this.#physicsObserver) {
			this.#scene.onBeforePhysicsObservable.remove(this.#physicsObserver)
		}
		this.clear()
		this.#engine.stopRenderLoop()
		this.#engine.dispose()
	}

	resize({ width, height }) {
		const nextWidth = Math.max(1, width || this.#canvas?.clientWidth || this.#canvas?.parentElement?.clientWidth || this.#canvas?.width || 300)
		const nextHeight = Math.max(1, height || this.#canvas?.clientHeight || this.#canvas?.parentElement?.clientHeight || this.#canvas?.height || 150)
		this.#canvas.width = nextWidth
		this.#canvas.height = nextHeight
		this.#engine.resize()
		this.#container?.create({ aspect: nextWidth / nextHeight })
		this.#physics?.resize(nextWidth, nextHeight)
	}

	add(options) {
		Dice.loadDie(options, this.#scene).then(resp => {
			this.#dieRollTimer.push(setTimeout(() => {
				this.#add(resp)
			}, this.#count++ * this.config.delay))
		})
	}

	addNonDie(die) {
		if(this.#engine.activeRenderLoops.length === 0) this.render(false)
		const {id, value, ...rest} = die
		const newDie = { id, value, config: rest }
		this.#dieCache[id] = newDie
		setTimeout(() => {
			this.#dieRollTimer.push(setTimeout(() => {
				this.handleAsleep(newDie)
			}, this.#count++ * this.config.delay))
		}, 10)
	}

	async #add(options) {
		if(this.#engine.activeRenderLoops.length === 0) this.render(options.newStartPoint)

		const diceOptions = {
			...options,
			assetPath: this.config.assetPath,
			enableShadows: this.config.enableShadows,
			scale: this.config.scale,
			lights: this.#lights,
		}

		const newDie = new Dice(diceOptions, this.#scene)
		this.#dieCache[newDie.id] = newDie

		const forcedTargetQuaternion = this.#getForcedPhysicsTarget(newDie)

		// Add to Havok physics
		this.#physics?.addDie({
			sides: options.sides,
			scale: this.config.scale,
			id: newDie.id,
			meshName: options.meshName,
			forcedTargetQuaternion,
			newStartPoint: options.newStartPoint
		})

		// Handle d100 = d100 + d10 pair
		if(options.sides === 100 && options.data !== 'single') {
			const forcedValue = Number(options.forcedValue)
			const forcedD100Value = Number.isFinite(forcedValue) ? Math.max(1, Math.min(100, Math.trunc(forcedValue))) : undefined
			const forcedD10FaceValue = forcedD100Value === undefined ? undefined : forcedD100Value - Math.floor((forcedD100Value-1)/10)*10

			newDie.d10Instance = await Dice.loadDie({
				...diceOptions,
				dieType: 'd10',
				sides: 10,
				id: newDie.id + 10000,
				forcedValue: forcedD10FaceValue,
				forcedFaceValue: forcedD10FaceValue,
				forcedDiscarded: options.forcedDiscarded
			}, this.#scene).then(response => {
				const d10Instance = new Dice(response, this.#scene)
				d10Instance.dieParent = newDie
				return d10Instance
			})

			this.#dieCache[`${newDie.d10Instance.id}`] = newDie.d10Instance
			const forcedD10Q = this.#getForcedPhysicsTarget(newDie.d10Instance)
			this.#physics?.addDie({
				sides: 10,
				scale: this.config.scale,
				id: newDie.d10Instance.id,
				meshName: options.meshName,
				forcedTargetQuaternion: forcedD10Q
			})
		}

		return newDie
	}

	remove(data) {
		const dieData = this.#dieCache[data.id]

		if(dieData.hasOwnProperty('d10Instance')) {
			if(this.#dieCache[dieData.d10Instance.id].mesh) {
				this.#dieCache[dieData.d10Instance.id].mesh.dispose()
				this.#physics?.removeDie(dieData.d10Instance.id)
			}
			delete this.#dieCache[dieData.d10Instance.id]
			this.#sleeperCount--
		}

		if(this.#dieCache[data.id].mesh) this.#dieCache[data.id].mesh.dispose()
		this.#physics?.removeDie(data.id)
		delete this.#dieCache[data.id]
		this.#sleeperCount--
		this.#scene.render()
		this.onDieRemoved(data.rollId)
	}

	#usesPhysicsForcedResult(die) {
		return die.config.forcedFaceValue !== undefined || die.config.forcedValue !== undefined
	}

	#guideForcedDie(die) {
		if(die.__forcedPhysicsGuided || die.__forcedPhysicsGuideFailed) return
		const frames = die.__forcedSyncFrames || 0
		if(frames < 14) return

		const resolvedTarget = Dice.getForcedTargetQuaternion(die, this.#scene)
		if(!resolvedTarget) {
			die.__forcedPhysicsGuideFailed = true
			die.config.forcedResultMode = 'visual'
			return
		}

		const { targetQuaternion } = resolvedTarget
		die.__forcedPhysicsGuided = true
		this.#physics?.guideDie({
			id: die.id,
			quaternion: { x: targetQuaternion.x, y: targetQuaternion.y, z: targetQuaternion.z, w: targetQuaternion.w },
			dieType: die.dieType
		})
	}

	#getForcedPhysicsTarget(die) {
		if(!this.#usesPhysicsForcedResult(die)) return null
		const resolvedTarget = Dice.getForcedTargetQuaternion(die, this.#scene)
		if(!resolvedTarget) return null
		const q = resolvedTarget.targetQuaternion
		return { x: q.x, y: q.y, z: q.z, w: q.w }
	}

	async handleAsleep(die) {
		die.asleep = true

		try {
			await Dice.getRollResult(die, this.#scene)
		} catch(error) {
			this.onRollError(error)
			return
		}

		if(die.d10Instance || die.dieParent) {
			if(die?.d10Instance?.asleep || die?.dieParent?.asleep) {
				const d100 = die.config.sides === 100 ? die : die.dieParent
				const d10  = die.config.sides === 10  ? die : die.d10Instance
				if(d100.rawValue) d100.value = d100.rawValue
				d100.rawValue = d100.value
				d100.value = d100.value + d10.value
				if(d100.value > 100) d100.value = d100.value - 100
				if(d100.value === 0) d100.value = 100
				this.#sleeperCount++
				this.onRollResult(d100)
			}
		} else {
			this.#sleeperCount++
			this.onRollResult(die)
		}
	}
}

export default WorldOnscreen
