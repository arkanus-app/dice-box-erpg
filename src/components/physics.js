/**
 * Havok physics integration for Babylon Physics V2.
 * Dice bodies live in the Babylon scene instead of the legacy split-worker path.
 */
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { PhysicsEventType, PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeConvexHull } from '@babylonjs/core/Physics/v2/physicsShape'
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape'
import { lerp } from '../helpers'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'

export const DICE_PHYSICS_TIME_STEP = 1 / 90
export const DICE_PHYSICS_SUB_TIME_STEP_MS = 1000 / 90

const defaultOptions = {
	size: 9.5,
	startingHeight: 8,
	spinForce: 6,
	throwForce: 5,
	gravity: 1,
	mass: 1,
	friction: .8,
	restitution: .1,
	linearDamping: .22,
	angularDamping: .18,
	settleTimeout: 5000,
}

const forcedGuideOptions = {
	minElapsed: 520,
	forceGuideElapsed: 1450,
	minGroundImpacts: 1,
	bounceGrace: 160,
	speedThreshold: 1.6,
	tiltThreshold: 1.4,
	duration: 1260,
	angleThreshold: 0.035,
	finalLockDuration: 220,
	initialBias: .28,
	launchSpinBias: .18,
	launchAlignmentStrength: 1.35,
	angularStrength: 5.2,
	maxAngularVelocity: 6.4,
	motorBlend: .14,
	linearDampingStart: 1,
	linearDampingEnd: .76,
	angularDampingStart: .995,
	angularDampingEnd: .72,
	centerPull: .012,
	centerMaxVelocity: .42,
	maxLockHeight: 2.4
}

const forcedGuideByDieType = {
	d4: { minElapsed:620, forceGuideElapsed:1600, duration:1380, angularStrength:4.2, maxAngularVelocity:5.2, initialBias:.2, launchSpinBias:.12, launchAlignmentStrength:1.05, centerPull:.014 },
	d6: { minElapsed:580, forceGuideElapsed:1500, duration:1320, angularStrength:4.8, maxAngularVelocity:5.8, initialBias:.24, launchSpinBias:.15, launchAlignmentStrength:1.2 },
	d10: { minElapsed:520, forceGuideElapsed:1400, duration:1200, angularStrength:5.6, maxAngularVelocity:7, initialBias:.3, launchSpinBias:.2, launchAlignmentStrength:1.45 },
	d100: { minElapsed:520, forceGuideElapsed:1400, duration:1200, angularStrength:5.6, maxAngularVelocity:7, initialBias:.3, launchSpinBias:.2, launchAlignmentStrength:1.45 },
	d20: { minElapsed:480, forceGuideElapsed:1320, duration:1160, angularStrength:6.1, maxAngularVelocity:7.6, initialBias:.34, launchSpinBias:.22, launchAlignmentStrength:1.6 },
}

// --- Math helpers (independentes de engine, portados do worker) ---
const clamp = (v,a,b) => Math.max(a, Math.min(b, v))
const smoothStep = v => { const c = clamp(v,0,1); return c*c*(3-2*c) }
const normalizeQuat = q => { const l = Math.hypot(q.x,q.y,q.z,q.w)||1; return {x:q.x/l,y:q.y/l,z:q.z/l,w:q.w/l} }
const dotQuat = (a,b) => a.x*b.x+a.y*b.y+a.z*b.z+a.w*b.w
const getShortestTargetQuat = (s,t) => dotQuat(s,t)<0 ? {x:-t.x,y:-t.y,z:-t.z,w:-t.w} : t
const multiplyQuat = (a,b) => normalizeQuat({ x:a.w*b.x+a.x*b.w+a.y*b.z-a.z*b.y, y:a.w*b.y-a.x*b.z+a.y*b.w+a.z*b.x, z:a.w*b.z+a.x*b.y-a.y*b.x+a.z*b.w, w:a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z })
const conjugateQuat = q => ({x:-q.x,y:-q.y,z:-q.z,w:q.w})

const slerpQuat = (s, t, amount) => {
	const tt = clamp(amount, 0, 1)
	let end = getShortestTargetQuat(s, t)
	let cosHalf = dotQuat(s, end)
	if(cosHalf < 0) { end = {x:-end.x,y:-end.y,z:-end.z,w:-end.w}; cosHalf=-cosHalf }
	if(cosHalf > 0.9995) return normalizeQuat({x:lerp(s.x,end.x,tt),y:lerp(s.y,end.y,tt),z:lerp(s.z,end.z,tt),w:lerp(s.w,end.w,tt)})
	const half = Math.acos(clamp(cosHalf,-1,1))
	const sinHalf = Math.sqrt(1-cosHalf*cosHalf)
	const rA = Math.sin((1-tt)*half)/sinHalf
	const rB = Math.sin(tt*half)/sinHalf
	return normalizeQuat({x:s.x*rA+end.x*rB,y:s.y*rA+end.y*rB,z:s.z*rA+end.z*rB,w:s.w*rA+end.w*rB})
}

const getQuatCorrection = (cur, tgt) => {
	const target = getShortestTargetQuat(cur, tgt)
	let err = multiplyQuat(target, conjugateQuat(cur))
	if(err.w < 0) err = {x:-err.x,y:-err.y,z:-err.z,w:-err.w}
	const angle = 2*Math.acos(clamp(err.w,-1,1))
	if(angle < 0.0001) return null
	const sinHA = Math.sqrt(Math.max(0.000001, 1-err.w*err.w))
	return { angle, axis:{x:err.x/sinHA, y:err.y/sinHA, z:err.z/sinHA} }
}

const randomQuat = () => normalizeQuat({x:lerp(-1.5,1.5,Math.random()),y:lerp(-1.5,1.5,Math.random()),z:lerp(-1.5,1.5,Math.random()),w:-1})

const getGuideProfile = (dieType) => ({...forcedGuideOptions, ...(forcedGuideByDieType[dieType]||{})})

const createBiasedInitialQuat = (targetQuat, profile) => {
	if(!targetQuat || !profile.initialBias) return undefined
	const src = randomQuat()
	const tgt = getShortestTargetQuat(src, normalizeQuat(targetQuat))
	const bias = clamp(profile.initialBias, 0, .45)
	return normalizeQuat({x:lerp(src.x,tgt.x,bias),y:lerp(src.y,tgt.y,bias),z:lerp(src.z,tgt.z,bias),w:lerp(src.w,tgt.w,bias)})
}

// --- Physics Engine Class ---
export class DicePhysics {
	#scene
	#config = {...defaultOptions}
	#bodies = []   // {id, dieType, physicsBody, mesh, elapsed, timeout, guidedTarget, ...}
	#boxBodies = []
	#width = 150
	#height = 150
	#aspect = 1
	#startPosition = [0, 8, 0]
	#colliders = {}  // meshName_dType_collider -> BJS mesh
	#floorBody = null
	#sleepingBodies = []
	#onCollision
	#last = Date.now()

	constructor({ scene, config, onCollision }) {
		this.#scene = scene
		this.#config = { ...this.#config, ...config }
		this.#onCollision = onCollision || (() => {})
		this.#applyComputedConfig()
		this.#syncPhysicsEngine()
		this.#setStartPosition()
	}

	#applyComputedConfig() {
		const c = this.#config
		c.gravity = c.gravity === 0 ? 0 : c.gravity + (c.mass||1)/3
		c.mass = 1 + (c.mass||1)/3
		c.spinForce = (c.spinForce||6) / 40
		c.throwForce = (c.throwForce||5) / 2 / c.mass * (1 + (c.scale||5)/6)
		c.startingHeight = Math.max(1, c.startingHeight||8)
	}

	#syncPhysicsEngine() {
		const engine = this.#scene.getPhysicsEngine?.()
		if(!engine) return
		engine.setTimeStep?.(DICE_PHYSICS_TIME_STEP)
		engine.setSubTimeStep?.(DICE_PHYSICS_SUB_TIME_STEP_MS)
		engine.setGravity?.(new Vector3(0, -9.81 * this.#config.gravity, 0))
	}

	updateConfig(options) {
		this.#config = { ...this.#config, ...options }
		this.#applyComputedConfig()
		this.#rebuildBox()
		this.#syncPhysicsEngine()
	}

	resize(width, height) {
		this.#width = width
		this.#height = height
		this.#aspect = width / height
		this.#rebuildBox()
	}

	#setStartPosition() {
		const { size = 9.5, startingHeight = 8 } = this.#config
		const aspect = this.#aspect
		const edge = .5
		const xMin = size*aspect/2-edge, xMax = size*aspect/-2+edge
		const yMin = size/2-edge, yMax = size/-2+edge
		const tossX = Math.round(Math.random())
		const fromTop = Math.round(Math.random())
		const fromLeft = Math.round(Math.random())
		this.#startPosition = [
			tossX ? lerp(xMin,xMax,Math.random()) : fromLeft ? xMax : xMin,
			startingHeight,
			tossX ? (fromTop ? yMax : yMin) : lerp(yMin,yMax,Math.random())
		]
	}

	// Build the invisible box walls as static physics bodies
	buildBox() {
		const { size = 9.5, startingHeight = 8 } = this.#config
		const height = startingHeight + 10
		const a = this.#aspect
		const sc = this.#scene
		const make = (name, pos, halfSize) => {
			const m = MeshBuilder.CreateBox(name, { width: halfSize[0]*2, height: halfSize[1]*2, depth: halfSize[2]*2 }, sc)
			m.position.set(...pos)
			m.isVisible = false
			m.isPickable = false
			const pb = new PhysicsBody(m, PhysicsMotionType.STATIC, false, sc)
			const shape = new PhysicsShapeBox(Vector3.Zero(), Quaternion.Identity(), new Vector3(...halfSize), sc)
			shape.material = { friction: this.#config.friction, restitution: this.#config.restitution }
			pb.shape = shape
			pb.setMassProperties({ mass: 0 })
			if(name === 'dice_floor') {
				this.#floorBody = pb
			}
			this.#boxBodies.push({ name, mesh: m, body: pb })
		}
		make('dice_floor',   [0, -.5, 0],                [size*a, 1, size])
		make('dice_ceiling', [0, height-.5, 0],           [size*a, 1, size])
		make('dice_wallN',   [0, 0, -size/2-.5],          [size*a, height, 1])
		make('dice_wallS',   [0, 0, size/2+.5],           [size*a, height, 1])
		make('dice_wallE',   [-size*a/2-.5, 0, 0],        [1, height, size])
		make('dice_wallW',   [size*a/2+.5, 0, 0],         [1, height, size])
	}

	#rebuildBox() {
		this.#boxBodies.forEach(({mesh,body}) => { body.dispose(); mesh.dispose() })
		this.#boxBodies = []
		this.#floorBody = null
		this.buildBox()
	}

	registerColliderMesh(key, mesh) {
		this.#colliders[key] = mesh
	}

	addDie(options) {
		const { sides, id, meshName, forcedTargetQuaternion } = options
		const dieType = Number.isInteger(sides) ? `d${sides}` : sides
		const comboKey = `${meshName}_${dieType}_collider`
		const colliderMesh = this.#colliders[comboKey]
		if(!colliderMesh) {
			console.error(`No collider found for ${comboKey}`)
			return null
		}

		const profile = getGuideProfile(dieType)
		const biasedQ = createBiasedInitialQuat(forcedTargetQuaternion, profile)
		const startPos = [...this.#startPosition]

		// Clone for physics (Havok needs individual body per die)
		const physMesh = colliderMesh.clone(`phys_${dieType}_${id}`)
		physMesh.isVisible = false
		physMesh.isPickable = false
		physMesh.setEnabled(true)
		physMesh.position.set(startPos[0], startPos[1], startPos[2])
		if(biasedQ) {
			physMesh.rotationQuaternion = new Quaternion(biasedQ.x, biasedQ.y, biasedQ.z, biasedQ.w)
		} else {
			physMesh.rotationQuaternion = Quaternion.Random()
		}

		const colliderMass = colliderMesh.metadata?.physicsMass || .1
		const mass = colliderMass * this.#config.mass * this.#config.scale

		const pb = new PhysicsBody(physMesh, PhysicsMotionType.DYNAMIC, false, this.#scene)
		const shape = new PhysicsShapeConvexHull(physMesh, this.#scene)
		shape.material = { friction: this.#config.friction, restitution: this.#config.restitution }
		pb.shape = shape
		pb.setMassProperties({ mass, restitution: this.#config.restitution })
		pb.setLinearDamping(this.#config.linearDamping)
		pb.setAngularDamping(this.#config.angularDamping)
		pb.disablePreStep = false

		const bodyEntry = {
			id, dieType, physicsBody: pb, physMesh,
			timeout: this.#config.settleTimeout,
			elapsed: 0, mass,
			guidanceProfile: profile,
			guidedTarget: null,
			guidedSleepReady: false,
			groundImpactCount: 0,
			groundContactElapsed: 0,
			firstGroundContactElapsed: null,
			hasGroundContact: false,
			wasGroundContact: false,
			currentGroundContact: false,
			currentGroundImpactForce: 0,
			lastGroundImpactForce: 0,
			collisionObserver: null,
		}

		if(forcedTargetQuaternion) {
			bodyEntry.guidedTarget = {
				quaternion: normalizeQuat(forcedTargetQuaternion),
				profile,
				active: false,
				complete: false,
				elapsed: 0,
				state: 'spawn',
			}
		}

		pb.setCollisionCallbackEnabled?.(true)
		bodyEntry.collisionObserver = pb.getCollisionObservable?.().add(event => {
			this.#handleCollision(bodyEntry, event)
		})

		this.#bodies.push(bodyEntry)
		this.#rollDie(bodyEntry)
		return bodyEntry
	}

	#rollDie(entry) {
		const pb = entry.physicsBody
		const sp = this.#startPosition
		const c = this.#config
		const lv = new Vector3(
			lerp(-sp[0]*.5, -sp[0]*c.throwForce, Math.random()),
			lerp(-sp[1], -sp[1]*2, Math.random()),
			lerp(-sp[2]*.5, -sp[2]*c.throwForce, Math.random())
		)
		pb.setLinearVelocity(lv)

		const flippy = Math.random()>.5?1:-1
		const spinny = lerp(c.spinForce*.5, c.spinForce, Math.random())
		const impulse = new Vector3(spinny*flippy, spinny*-flippy, spinny*flippy)
		const impulseOffset = Math.abs(c.scale - 1) + c.scale*c.scale*(entry.mass/c.mass)*.75
		pb.applyImpulse(
			impulse,
			entry.physMesh.position.add(new Vector3(impulseOffset, impulseOffset, impulseOffset))
		)

		this.#applyLaunchGuidance(entry, spinny)
	}

	#handleCollision(entry, event) {
		if(!entry || entry.asleep || event?.type === PhysicsEventType.COLLISION_FINISHED) return
		const floor = this.#floorBody
		if(!floor || (event.collider !== floor && event.collidedAgainst !== floor)) return

		const force = Math.abs(Number(event.impulse) || 0)
		entry.currentGroundContact = true
		entry.currentGroundImpactForce = Math.max(entry.currentGroundImpactForce || 0, force)
		if(force > 0) {
			this.#onCollision({
				action: 'collision',
				body0Id: event.collider?.transformNode?.name,
				body1Id: event.collidedAgainst?.transformNode?.name,
				force
			})
		}
	}

	#syncGroundContactState(entry, delta) {
		const hasContact = Boolean(entry.currentGroundContact)
		if(hasContact) {
			entry.groundContactElapsed = (entry.groundContactElapsed || 0) + delta
			if(!entry.wasGroundContact) {
				entry.groundImpactCount = (entry.groundImpactCount || 0) + 1
				entry.firstGroundContactElapsed ??= entry.elapsed
			}
		} else {
			entry.groundContactElapsed = 0
		}

		entry.lastGroundImpactForce = Math.max(entry.lastGroundImpactForce || 0, entry.currentGroundImpactForce || 0)
		entry.hasGroundContact = hasContact
		entry.wasGroundContact = hasContact
		entry.currentGroundContact = false
		entry.currentGroundImpactForce = 0
	}

	#disposeEntry(entry) {
		try {
			if(entry.collisionObserver) {
				entry.physicsBody.getCollisionObservable?.().remove(entry.collisionObserver)
				entry.collisionObserver = null
			}
			entry.physicsBody.setCollisionCallbackEnabled?.(false)
		} catch{}
		try { entry.physicsBody.dispose() } catch{}
		try { entry.physMesh.dispose() } catch{}
	}

	#sleepEntry(entry) {
		entry.asleep = true
		try {
			entry.physicsBody.setLinearVelocity(Vector3.Zero())
			entry.physicsBody.setAngularVelocity(Vector3.Zero())
			entry.physicsBody.setMassProperties({ mass: 0 })
			entry.physicsBody.setMotionType?.(PhysicsMotionType.STATIC)
			entry.physicsBody.setCollisionCallbackEnabled?.(false)
		} catch{}
		this.#sleepingBodies.push(entry)
	}

	guideDie({ id, quaternion, dieType }) {
		const entry = this.#bodies.find(b => b.id === id)
		if(!entry) return
		const profile = getGuideProfile(dieType || entry.dieType)
		const existing = entry.guidedTarget
		entry.guidedTarget = {
			quaternion: normalizeQuat(quaternion),
			profile,
			active: existing?.active || false,
			complete: false,
			elapsed: existing?.elapsed || 0,
			state: existing?.state || 'spawn',
		}
		entry.guidanceProfile = profile
		entry.guidedSleepReady = false
	}

	removeDie(id) {
		const idx = this.#bodies.findIndex(b => b.id === id)
		if(idx >= 0) {
			const entry = this.#bodies.splice(idx, 1)[0]
			this.#disposeEntry(entry)
			return
		}
		const sleepingIdx = this.#sleepingBodies.findIndex(b => b.id === id)
		if(sleepingIdx >= 0) {
			const entry = this.#sleepingBodies.splice(sleepingIdx, 1)[0]
			this.#disposeEntry(entry)
		}
	}

	clearDice() {
		this.#bodies.forEach(entry => this.#disposeEntry(entry))
		this.#sleepingBodies.forEach(entry => this.#disposeEntry(entry))
		this.#bodies = []
		this.#sleepingBodies = []
	}

	// Called every frame from the scene's onBeforePhysicsObservable or renderLoop
	update(deltaMs) {
		const delta = deltaMs || (Date.now() - this.#last)
		this.#last = Date.now()

		for(let i = this.#bodies.length-1; i>=0; i--) {
			const entry = this.#bodies[i]
			entry.elapsed = (entry.elapsed||0) + delta

			const lv = entry.physicsBody.getLinearVelocity()
			const av = entry.physicsBody.getAngularVelocity()
			const speed = lv ? Math.sqrt(lv.x*lv.x+lv.y*lv.y+lv.z*lv.z) : 0
			const tilt  = av ? Math.sqrt(av.x*av.x+av.y*av.y+av.z*av.z) : 0

			this.#syncGroundContactState(entry, delta)
			this.#applyGuidance(entry, delta, speed, tilt)

			// If guided and final frame synced, mark sleep-ready
			if(entry.guidedTarget?.complete && entry.guidedFinalFrameSynced) {
				entry.guidedSleepReady = true
			}

			const shouldSleep = entry.guidedSleepReady ||
				(!entry.guidedTarget && (speed < .01 && tilt < .005 || entry.timeout < 0))

			if(shouldSleep) {
				this.#bodies.splice(i, 1)
				this.#sleepEntry(entry)
				return { id: entry.id, physMesh: entry.physMesh, asleep: true }
			}
			entry.timeout -= delta
		}
		return null
	}

	// Returns array of { id, position, quaternion } for each live body
	getBodiesState() {
		return this.#bodies.map(entry => {
			const m = entry.physMesh
			return {
				id: entry.id,
				position: m.position,
				rotationQuaternion: m.rotationQuaternion,
				asleep: false,
			}
		})
	}

	getSleepingIds() {
		return []
	}

	// ----- Guidance System (portado do worker) -----
	#getBodyQuat(entry) {
		const q = entry.physMesh.rotationQuaternion
		if(!q) return null
		return normalizeQuat({x:q.x, y:q.y, z:q.z, w:q.w})
	}

	#setBodyQuat(entry, quat) {
		const m = entry.physMesh
		if(m.rotationQuaternion) {
			m.rotationQuaternion.set(quat.x, quat.y, quat.z, quat.w)
		} else {
			m.rotationQuaternion = new Quaternion(quat.x, quat.y, quat.z, quat.w)
		}
		entry.physicsBody.setTargetTransform?.(m.position, m.rotationQuaternion)
	}

	#dampVelocity(entry, profile, progress) {
		const av = entry.physicsBody.getAngularVelocity()
		if(!av) return
		const d = lerp(profile.angularDampingStart, profile.angularDampingEnd, progress)
		entry.physicsBody.setAngularVelocity(new Vector3(av.x*d, av.y*d, av.z*d))
	}

	#applyLandingAssist(entry, profile, progress) {
		const m = entry.physMesh
		const lv = entry.physicsBody.getLinearVelocity()
		if(!lv) return
		const ld = lerp(profile.linearDampingStart, profile.linearDampingEnd, progress)
		const cp = profile.centerPull * progress
		const pullX = clamp(-m.position.x*cp, -profile.centerMaxVelocity, profile.centerMaxVelocity)
		const pullZ = clamp(-m.position.z*cp, -profile.centerMaxVelocity, profile.centerMaxVelocity)
		entry.physicsBody.setLinearVelocity(new Vector3(lv.x*ld+pullX, lv.y*lerp(.98,ld,progress), lv.z*ld+pullZ))
	}

	#applyAngularMotor(entry, curQ, guide, profile, progress) {
		const correction = getQuatCorrection(curQ, guide.quaternion)
		if(!correction) return 0
		const eased = smoothStep(progress)
		const assistP = smoothStep((progress-.18)/.82)
		const desiredSpeed = Math.min(profile.maxAngularVelocity, correction.angle*profile.angularStrength*lerp(.24,1,eased))
		const desired = { x:correction.axis.x*desiredSpeed, y:correction.axis.y*desiredSpeed, z:correction.axis.z*desiredSpeed }
		const cur = entry.physicsBody.getAngularVelocity() || {x:0,y:0,z:0}
		const angD = lerp(profile.angularDampingStart, profile.angularDampingEnd, assistP)
		const blend = clamp(profile.motorBlend + assistP*.26, 0, .42)
		entry.physicsBody.setAngularVelocity(new Vector3(
			lerp(cur.x*angD, desired.x, blend),
			lerp(cur.y*angD, desired.y, blend),
			lerp(cur.z*angD, desired.z, blend)
		))
		return correction.angle
	}

	#applyLaunchGuidance(entry, spin) {
		const guide = entry.guidedTarget
		const profile = entry.guidanceProfile || guide?.profile
		if(!guide?.quaternion || !profile?.launchSpinBias) return
		const curQ = this.#getBodyQuat(entry)
		if(!curQ) return
		const correction = getQuatCorrection(curQ, guide.quaternion)
		if(!correction) return
		const cur = entry.physicsBody.getAngularVelocity() || {x:0,y:0,z:0}
		const blend = clamp(profile.launchSpinBias, 0, .35)
		const targetSpeed = Math.min(profile.maxAngularVelocity*.75, Math.max(spin*18, correction.angle*profile.launchAlignmentStrength))
		const desired = { x:correction.axis.x*targetSpeed, y:correction.axis.y*targetSpeed, z:correction.axis.z*targetSpeed }
		entry.physicsBody.setAngularVelocity(new Vector3(
			lerp(cur.x, desired.x, blend),
			lerp(cur.y, desired.y, blend),
			lerp(cur.z, desired.z, blend)
		))
	}

	#shouldStartGuidance(entry, speed, tilt) {
		const profile = entry.guidedTarget?.profile || entry.guidanceProfile || forcedGuideOptions
		if(entry.elapsed < profile.minElapsed) return false
		if(entry.elapsed >= profile.forceGuideElapsed || entry.timeout < (profile.timeoutWindow||0)) return true
		if((entry.groundImpactCount||0) < profile.minGroundImpacts) return false
		if(entry.firstGroundContactElapsed !== null && entry.elapsed - entry.firstGroundContactElapsed < profile.bounceGrace) return false
		return true
	}

	#finalizeGuided(entry) {
		entry.physicsBody.setLinearVelocity(Vector3.Zero())
		entry.physicsBody.setAngularVelocity(Vector3.Zero())
		entry.guidedTarget.lockSourceQuaternion = this.#getBodyQuat(entry) || entry.guidedTarget.quaternion
		entry.guidedTarget.lockElapsed = 0
		entry.guidedFinalFrameSynced = false
		entry.guidedTarget.state = 'finalLock'
	}

	#applyFinalLock(entry, delta) {
		const guide = entry.guidedTarget
		const profile = guide.profile || entry.guidanceProfile || forcedGuideOptions
		guide.lockElapsed = (guide.lockElapsed||0) + delta
		const duration = profile.finalLockDuration || forcedGuideOptions.finalLockDuration
		const progress = smoothStep(guide.lockElapsed / duration)
		const src = guide.lockSourceQuaternion || this.#getBodyQuat(entry) || guide.quaternion
		const q = slerpQuat(src, guide.quaternion, progress)
		this.#setBodyQuat(entry, q)
		entry.physicsBody.setLinearVelocity(Vector3.Zero())
		entry.physicsBody.setAngularVelocity(Vector3.Zero())
		if(progress >= 1) {
			this.#setBodyQuat(entry, guide.quaternion)
			guide.complete = true
			guide.state = 'complete'
			entry.guidedFinalFrameSynced = true
		}
	}

	#applyGuidance(entry, delta, speed, tilt) {
		const guide = entry.guidedTarget
		if(!guide) return
		if(guide.complete && entry.guidedFinalFrameSynced) { entry.guidedSleepReady = true; return }
		if(guide.state === 'finalLock') { this.#applyFinalLock(entry, delta); return }
		if(!guide.active) {
			if(!this.#shouldStartGuidance(entry, speed, tilt)) { guide.state = 'freeFall'; return }
			guide.active = true; guide.elapsed = 0; guide.state = 'guidedSettle'
		}
		guide.elapsed += delta
		const profile = guide.profile || entry.guidanceProfile || forcedGuideOptions
		const progress = Math.min(1, guide.elapsed / profile.duration)
		const assistP = smoothStep((progress-.18)/.82)
		if(assistP > 0) { this.#dampVelocity(entry, profile, assistP); this.#applyLandingAssist(entry, profile, assistP) }
		const curQ = this.#getBodyQuat(entry)
		if(!curQ) return
		const angle = this.#applyAngularMotor(entry, curQ, guide, profile, progress)
		const posY = entry.physMesh.position.y
		const nearFloor = posY <= profile.maxLockHeight
		const nearlyAligned = angle < profile.angleThreshold
		const finalTimeout = entry.timeout < 80
		const canLock = nearFloor && (entry.hasGroundContact || entry.groundContactElapsed > 180 || entry.timeout < 80)
		if(canLock && (nearlyAligned || finalTimeout)) this.#finalizeGuided(entry)
	}
}
