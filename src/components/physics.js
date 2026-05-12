/**
 * Havok physics integration for Babylon Physics V2.
 * Dice bodies live in the Babylon scene instead of the legacy split-worker path.
 */
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { PhysicsActivationControl, PhysicsEventType, PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeConvexHull } from '@babylonjs/core/Physics/v2/physicsShape'
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape'
import { lerp } from '../helpers'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'

export const DICE_PHYSICS_TIME_STEP = 1 / 90
export const DICE_PHYSICS_SUB_TIME_STEP_MS = 1000 / 90
const DICE_COLLISION_MASK = 0xffff

const defaultOptions = {
	size: 9.5,
	startingHeight: 6.4,
	spinForce: 5.8,
	throwForce: 4.55,
	gravity: 1.85,
	mass: 1.08,
	scale: 5,
	wallPadding: 1.35,
	spawnSpacing: .72,
	spawnHeightStep: .18,
	friction: .86,
	restitution: .16,
	linearDamping: .28,
	angularDamping: .24,
	settleTimeout: 4200,
}

const forcedGuideOptions = {
	minElapsed: 500,
	forceGuideElapsed: 1320,
	minGroundImpacts: 1,
	bounceGrace: 130,
	speedThreshold: 1.6,
	tiltThreshold: 1.4,
	duration: 1080,
	angleThreshold: 0.04,
	finalLockDuration: 140,
	initialBias: .24,
	launchSpinBias: .14,
	launchAlignmentStrength: 1.25,
	angularStrength: 5.8,
	maxAngularVelocity: 7,
	motorBlend: .16,
	linearDampingStart: .92,
	linearDampingEnd: .68,
	angularDampingStart: .94,
	angularDampingEnd: .66,
	centerPull: .007,
	centerMaxVelocity: .3,
	maxLockHeight: 2.05,
	maxGuideStartHeight: 3.2,
	bodyContactSettleDelay: 180,
	timeoutWindow: 650
}

const forcedGuideByDieType = {
	d4: { minElapsed:580, forceGuideElapsed:1500, duration:1240, angularStrength:4.6, maxAngularVelocity:5.5, initialBias:.18, launchSpinBias:.1, launchAlignmentStrength:1, centerPull:.009, maxGuideStartHeight:2.8 },
	d6: { minElapsed:540, forceGuideElapsed:1400, duration:1160, angularStrength:5.1, maxAngularVelocity:6.1, initialBias:.22, launchSpinBias:.12, launchAlignmentStrength:1.12 },
	d10: { minElapsed:500, forceGuideElapsed:1300, duration:1040, angularStrength:6, maxAngularVelocity:7.2, initialBias:.27, launchSpinBias:.17, launchAlignmentStrength:1.35 },
	d100: { minElapsed:500, forceGuideElapsed:1300, duration:1040, angularStrength:6, maxAngularVelocity:7.2, initialBias:.27, launchSpinBias:.17, launchAlignmentStrength:1.35 },
	d20: { minElapsed:460, forceGuideElapsed:1220, duration:980, angularStrength:6.6, maxAngularVelocity:7.8, initialBias:.3, launchSpinBias:.18, launchAlignmentStrength:1.45 },
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
	#rawConfig = {...defaultOptions}
	#config = {...defaultOptions}
	#bodies = []   // {id, dieType, physicsBody, mesh, elapsed, timeout, guidedTarget, ...}
	#bodyIndexById = new Map()
	#boxBodies = []
	#width = 150
	#height = 150
	#aspect = 1
	#startPosition = [0, 8, 0]
	#colliders = {}  // meshName_dType_collider -> BJS mesh
	#floorBody = null
	#sleepingBodies = []
	#sleepingBodyIndexById = new Map()
	#onCollision
	#last = Date.now()

	constructor({ scene, config, onCollision }) {
		this.#scene = scene
		this.#rawConfig = { ...this.#rawConfig, ...(config || {}) }
		this.#onCollision = onCollision || (() => {})
		this.#applyComputedConfig()
		this.#syncPhysicsEngine()
		this.#setStartPosition()
	}

	#applyComputedConfig() {
		const c = { ...this.#rawConfig }
		c.gravity = c.gravity === 0 ? 0 : c.gravity + (c.mass||1)/3
		c.mass = 1 + (c.mass||1)/3
		c.spinForce = (c.spinForce||6) / 40
		c.throwForce = (c.throwForce||5) / 2 / c.mass * (1 + (c.scale||5)/6)
		c.startingHeight = Math.max(1, c.startingHeight||8)
		this.#config = c
	}

	#syncPhysicsEngine() {
		const engine = this.#scene.getPhysicsEngine?.()
		if(!engine) return
		engine.setTimeStep?.(DICE_PHYSICS_TIME_STEP)
		engine.setSubTimeStep?.(DICE_PHYSICS_SUB_TIME_STEP_MS)
		engine.setGravity?.(new Vector3(0, -9.81 * this.#config.gravity, 0))
	}

	updateConfig(options) {
		const previousScale = this.#config.scale
		this.#rawConfig = { ...this.#rawConfig, ...(options || {}) }
		this.#applyComputedConfig()
		this.#rebuildBox()
		this.#syncPhysicsEngine()
		this.#setStartPosition()
		if(previousScale !== this.#config.scale) {
			this.#rescaleActiveBodies()
		}
	}

	resize(width, height) {
		this.#width = width
		this.#height = height
		this.#aspect = width / height
		this.#rebuildBox()
		this.#setStartPosition()
	}

	#setStartPosition() {
		const { startingHeight = 8 } = this.#config
		const { halfX, halfZ } = this.#getBounds()
		const edge = .5
		const xMin = halfX-edge, xMax = -halfX+edge
		const yMin = halfZ-edge, yMax = -halfZ+edge
		const tossX = Math.round(Math.random())
		const fromTop = Math.round(Math.random())
		const fromLeft = Math.round(Math.random())
		this.#startPosition = [
			tossX ? lerp(xMin,xMax,Math.random()) : fromLeft ? xMax : xMin,
			startingHeight,
			tossX ? (fromTop ? yMax : yMin) : lerp(yMin,yMax,Math.random())
		]
	}

	#getSpawnPosition() {
		const position = [...this.#startPosition]
		const bodyIndex = this.#bodies.length + this.#sleepingBodies.length
		const spacing = Math.max(0, Number(this.#config.spawnSpacing) || 0)
		if(bodyIndex <= 0 || spacing <= 0) {
			return position
		}

		const lane = Math.ceil(bodyIndex / 2) * (bodyIndex % 2 === 1 ? 1 : -1)
		const spreadOnX = Math.abs(position[0]) <= Math.abs(position[2])
		if(spreadOnX) {
			position[0] += lane * spacing
		} else {
			position[2] += lane * spacing
		}

		const heightStep = Math.max(0, Number(this.#config.spawnHeightStep) || 0)
		position[1] += Math.min(bodyIndex, 3) * heightStep

		const { halfX, halfZ } = this.#getBounds()
		const dieRadius = Math.max(.45, (Number(this.#config.scale) || 5) * .12)
		position[0] = clamp(position[0], -Math.max(.5, halfX - dieRadius), Math.max(.5, halfX - dieRadius))
		position[2] = clamp(position[2], -Math.max(.5, halfZ - dieRadius), Math.max(.5, halfZ - dieRadius))
		return position
	}

	#getBounds() {
		const { size = 9.5 } = this.#config
		const padding = clamp(Number(this.#config.wallPadding) || 0, 0, size * .35)
		return {
			halfX: Math.max(1, size * this.#aspect / 2 - padding),
			halfZ: Math.max(1, size / 2 - padding)
		}
	}

	// Build the invisible box walls as static physics bodies
	buildBox() {
		const { size = 9.5, startingHeight = 8 } = this.#config
		const height = startingHeight + 10
		const a = this.#aspect
		const { halfX, halfZ } = this.#getBounds()
		const sc = this.#scene
		const make = (name, pos, halfSize) => {
			const m = MeshBuilder.CreateBox(name, { width: halfSize[0]*2, height: halfSize[1]*2, depth: halfSize[2]*2 }, sc)
			m.position.set(...pos)
			m.isVisible = false
			m.isPickable = false
			const pb = new PhysicsBody(m, PhysicsMotionType.STATIC, false, sc)
			const shape = new PhysicsShapeBox(Vector3.Zero(), Quaternion.Identity(), new Vector3(...halfSize), sc)
			shape.material = { friction: this.#config.friction, restitution: this.#config.restitution }
			shape.filterMembershipMask = DICE_COLLISION_MASK
			shape.filterCollideMask = DICE_COLLISION_MASK
			pb.shape = shape
			pb.setMassProperties({ mass: 0 })
			if(name === 'dice_floor') {
				this.#floorBody = pb
			}
			this.#boxBodies.push({ name, mesh: m, body: pb })
		}
		make('dice_floor',   [0, -.5, 0],                [size*a, 1, size])
		make('dice_ceiling', [0, height-.5, 0],           [size*a, 1, size])
		make('dice_wallN',   [0, 0, -halfZ-1],            [size*a, height, 1])
		make('dice_wallS',   [0, 0, halfZ+1],             [size*a, height, 1])
		make('dice_wallE',   [-halfX-1, 0, 0],            [1, height, size])
		make('dice_wallW',   [halfX+1, 0, 0],             [1, height, size])
	}

	#rebuildBox() {
		this.#boxBodies.forEach(({mesh,body}) => { body.dispose(); mesh.dispose() })
		this.#boxBodies = []
		this.#floorBody = null
		this.buildBox()
	}

	registerColliderMesh(key, mesh, colliderData = {}) {
		mesh.metadata = {
			...mesh.metadata,
			physicsMass: colliderData.physicsMass ?? mesh.metadata?.physicsMass,
			physicsFriction: colliderData.physicsFriction ?? mesh.metadata?.physicsFriction,
			physicsRestitution: colliderData.physicsRestitution ?? mesh.metadata?.physicsRestitution,
		}
		this.#colliders[key] = mesh
	}

	#setActivationControl(body, controlMode) {
		try {
			this.#scene.getPhysicsEngine?.()?.getPhysicsPlugin?.()?.setActivationControl?.(body, controlMode)
		} catch {}
	}

	#applyShapeMaterial(shape) {
		shape.material = {
			friction: this.#config.friction,
			restitution: this.#config.restitution
		}
		shape.filterMembershipMask = DICE_COLLISION_MASK
		shape.filterCollideMask = DICE_COLLISION_MASK
	}

	#getColliderMass(colliderMesh) {
		return colliderMesh.metadata?.physicsMass || .1
	}

	#getBodyMass(colliderMesh) {
		return this.#getColliderMass(colliderMesh) * this.#config.mass * this.#config.scale
	}

	#scalePhysicsMesh(physMesh, colliderMesh) {
		physMesh.scaling.set(
			colliderMesh.scaling.x * this.#config.scale,
			colliderMesh.scaling.y * this.#config.scale,
			colliderMesh.scaling.z * this.#config.scale
		)
	}

	#rescaleActiveBodies() {
		for(const entry of this.#bodies) {
			if(!entry.colliderMesh || !entry.physicsBody || entry.asleep) continue
			this.#scalePhysicsMesh(entry.physMesh, entry.colliderMesh)
			const shape = new PhysicsShapeConvexHull(entry.physMesh, this.#scene)
			this.#applyShapeMaterial(shape)
			try { entry.physicsBody.shape?.dispose?.() } catch {}
			entry.physicsBody.shape = shape
			entry.mass = this.#getBodyMass(entry.colliderMesh)
			entry.physicsBody.setMassProperties({ mass: entry.mass })
			this.#setActivationControl(entry.physicsBody, PhysicsActivationControl.ALWAYS_ACTIVE)
		}
	}

	#storeActiveEntry(entry) {
		entry.activeIndex = this.#bodies.length
		entry.sleepingIndex = -1
		this.#bodies.push(entry)
		this.#bodyIndexById.set(entry.id, entry.activeIndex)
	}

	#storeSleepingEntry(entry) {
		entry.sleepingIndex = this.#sleepingBodies.length
		entry.activeIndex = -1
		this.#sleepingBodies.push(entry)
		this.#sleepingBodyIndexById.set(entry.id, entry.sleepingIndex)
	}

	#removeActiveEntryAt(index) {
		if(index < 0 || index >= this.#bodies.length) {
			return null
		}

		const removedEntry = this.#bodies[index]
		const lastIndex = this.#bodies.length - 1
		if(index !== lastIndex) {
			const lastEntry = this.#bodies[lastIndex]
			this.#bodies[index] = lastEntry
			lastEntry.activeIndex = index
			this.#bodyIndexById.set(lastEntry.id, index)
		}
		this.#bodies.pop()
		this.#bodyIndexById.delete(removedEntry.id)
		removedEntry.activeIndex = -1
		return removedEntry
	}

	#removeSleepingEntryAt(index) {
		if(index < 0 || index >= this.#sleepingBodies.length) {
			return null
		}

		const removedEntry = this.#sleepingBodies[index]
		const lastIndex = this.#sleepingBodies.length - 1
		if(index !== lastIndex) {
			const lastEntry = this.#sleepingBodies[lastIndex]
			this.#sleepingBodies[index] = lastEntry
			lastEntry.sleepingIndex = index
			this.#sleepingBodyIndexById.set(lastEntry.id, index)
		}
		this.#sleepingBodies.pop()
		this.#sleepingBodyIndexById.delete(removedEntry.id)
		removedEntry.sleepingIndex = -1
		return removedEntry
	}

	addDie(options) {
		const { sides, id, meshName, forcedTargetQuaternion, newStartPoint } = options
		if(newStartPoint) {
			this.#setStartPosition()
		}
		const dieType = Number.isInteger(sides) ? `d${sides}` : sides
		const comboKey = `${meshName}_${dieType}_collider`
		const colliderMesh = this.#colliders[comboKey]
		if(!colliderMesh) {
			console.error(`No collider found for ${comboKey}`)
			return null
		}

		const profile = getGuideProfile(dieType)
		const biasedQ = createBiasedInitialQuat(forcedTargetQuaternion, profile)
		const startPos = this.#getSpawnPosition()

		// Clone for physics (Havok needs individual body per die)
		const physMesh = colliderMesh.clone(`phys_${dieType}_${id}`)
		physMesh.isVisible = false
		physMesh.isPickable = false
		physMesh.doNotSyncBoundingInfo = false
		physMesh.unfreezeWorldMatrix?.()
		physMesh.setEnabled(true)
		this.#scalePhysicsMesh(physMesh, colliderMesh)
		physMesh.position.set(startPos[0], startPos[1], startPos[2])
		if(biasedQ) {
			physMesh.rotationQuaternion = new Quaternion(biasedQ.x, biasedQ.y, biasedQ.z, biasedQ.w)
		} else {
			physMesh.rotationQuaternion = Quaternion.Random()
		}
		physMesh.refreshBoundingInfo?.()
		physMesh.computeWorldMatrix(true)

		const mass = this.#getBodyMass(colliderMesh)

		const pb = new PhysicsBody(physMesh, PhysicsMotionType.DYNAMIC, false, this.#scene)
		const shape = new PhysicsShapeConvexHull(physMesh, this.#scene)
		this.#applyShapeMaterial(shape)
		pb.shape = shape
		pb.setMassProperties({ mass })
		pb.setLinearDamping(this.#config.linearDamping)
		pb.setAngularDamping(this.#config.angularDamping)
		pb.disablePreStep = false
		this.#setActivationControl(pb, PhysicsActivationControl.ALWAYS_ACTIVE)

		const bodyEntry = {
			id, dieType, physicsBody: pb, physMesh, colliderMesh,
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
			bodyContactElapsed: 0,
			lastBodyContactElapsed: null,
			hasBodyContact: false,
			wasBodyContact: false,
			currentBodyContact: false,
			currentBodyImpactForce: 0,
			lastBodyImpactForce: 0,
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

		this.#storeActiveEntry(bodyEntry)
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

	#isDiceBodyName(name) {
		return typeof name === 'string' && name.startsWith('phys_')
	}

	#handleCollision(entry, event) {
		if(!entry || entry.asleep || event?.type === PhysicsEventType.COLLISION_FINISHED) return
		const floor = this.#floorBody
		const force = this.#getCollisionForce(event)
		const colliderName = event.collider?.transformNode?.name
		const collidedName = event.collidedAgainst?.transformNode?.name

		if(force > 0) {
			this.#onCollision({
				action: 'collision',
				body0Id: colliderName,
				body1Id: collidedName,
				force
			})
		}

		if(this.#isDiceBodyName(colliderName) && this.#isDiceBodyName(collidedName)) {
			entry.currentBodyContact = true
			entry.currentBodyImpactForce = Math.max(entry.currentBodyImpactForce || 0, force)
		}

		if(!floor || (event.collider !== floor && event.collidedAgainst !== floor)) return
		entry.currentGroundContact = true
		entry.currentGroundImpactForce = Math.max(entry.currentGroundImpactForce || 0, force)
	}

	#getCollisionForce(event) {
		const impulseForce = Math.abs(Number(event?.impulse) || 0)
		const normal = event?.normal
		if(!normal) return impulseForce

		const colliderVelocity = event.collider?.getLinearVelocity?.() || Vector3.Zero()
		const collidedVelocity = event.collidedAgainst?.getLinearVelocity?.() || Vector3.Zero()
		const relativeVelocity = colliderVelocity.subtract(collidedVelocity)
		const velocityForce = Math.abs(Vector3.Dot(normal, relativeVelocity))
		return Number.isFinite(velocityForce) && velocityForce > 0 ? velocityForce : impulseForce
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

		const hasBodyContact = Boolean(entry.currentBodyContact)
		if(hasBodyContact) {
			entry.bodyContactElapsed = (entry.bodyContactElapsed || 0) + delta
			entry.lastBodyContactElapsed = entry.elapsed
		} else {
			entry.bodyContactElapsed = 0
		}

		entry.lastBodyImpactForce = Math.max(entry.lastBodyImpactForce || 0, entry.currentBodyImpactForce || 0)
		entry.hasBodyContact = hasBodyContact
		entry.wasBodyContact = hasBodyContact
		entry.currentBodyContact = false
		entry.currentBodyImpactForce = 0
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
			this.#setActivationControl(entry.physicsBody, PhysicsActivationControl.ALWAYS_INACTIVE)
			entry.physicsBody.setLinearVelocity(Vector3.Zero())
			entry.physicsBody.setAngularVelocity(Vector3.Zero())
			entry.physicsBody.setMassProperties({ mass: 0 })
			entry.physicsBody.setMotionType?.(PhysicsMotionType.STATIC)
			entry.physicsBody.setCollisionCallbackEnabled?.(false)
		} catch{}
		this.#storeSleepingEntry(entry)
	}

	guideDie({ id, quaternion, dieType }) {
		const activeIndex = this.#bodyIndexById.get(id)
		const entry = activeIndex === undefined ? null : this.#bodies[activeIndex]
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
		const activeIndex = this.#bodyIndexById.get(id)
		if(activeIndex !== undefined) {
			const entry = this.#removeActiveEntryAt(activeIndex)
			this.#disposeEntry(entry)
			return
		}
		const sleepingIndex = this.#sleepingBodyIndexById.get(id)
		if(sleepingIndex !== undefined) {
			const entry = this.#removeSleepingEntryAt(sleepingIndex)
			this.#disposeEntry(entry)
		}
	}

	forceSleepDie(id) {
		const activeIndex = this.#bodyIndexById.get(id)
		if(activeIndex === undefined) {
			return null
		}
		const entry = this.#removeActiveEntryAt(activeIndex)
		this.#sleepEntry(entry)
		return { id: entry.id, physMesh: entry.physMesh, asleep: true }
	}

	clearDice() {
		this.#bodies.forEach(entry => this.#disposeEntry(entry))
		this.#sleepingBodies.forEach(entry => this.#disposeEntry(entry))
		this.#bodies = []
		this.#bodyIndexById.clear()
		this.#sleepingBodies = []
		this.#sleepingBodyIndexById.clear()
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

			const guidedTimedOut = entry.guidedTarget && entry.timeout < 0
			const shouldSleep = entry.guidedSleepReady || guidedTimedOut ||
				(!entry.guidedTarget && (speed < .01 && tilt < .005 || entry.timeout < 0))

			if(shouldSleep) {
				this.#removeActiveEntryAt(i)
				this.#sleepEntry(entry)
				return { id: entry.id, physMesh: entry.physMesh, asleep: true }
			}
			entry.timeout -= delta
		}
		return null
	}

	forEachActiveBody(callback) {
		for(const entry of this.#bodies) {
			callback(entry)
		}
	}

	getActiveBodyCount() {
		return this.#bodies.length
	}

	getSleepingBodyCount() {
		return this.#sleepingBodies.length
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
		const nearGuideHeight = entry.physMesh.position.y <= (profile.maxGuideStartHeight || profile.maxLockHeight || forcedGuideOptions.maxGuideStartHeight)
		if(entry.timeout < (profile.timeoutWindow||0)) return true
		if(entry.elapsed >= profile.forceGuideElapsed) {
			return (entry.groundImpactCount||0) >= profile.minGroundImpacts || nearGuideHeight
		}
		if((entry.groundImpactCount||0) < profile.minGroundImpacts) return false
		if(entry.firstGroundContactElapsed !== null && entry.elapsed - entry.firstGroundContactElapsed < profile.bounceGrace) return false
		return true
	}

	#hasRecentBodyContact(entry, profile) {
		const delay = profile.bodyContactSettleDelay ?? forcedGuideOptions.bodyContactSettleDelay
		return entry.lastBodyContactElapsed !== null && entry.elapsed - entry.lastBodyContactElapsed < delay
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
		const nearGuideHeight = entry.physMesh.position.y <= (profile.maxGuideStartHeight || profile.maxLockHeight || forcedGuideOptions.maxGuideStartHeight)
		const canAssistLanding = entry.hasGroundContact || (entry.groundImpactCount||0) > 0 || nearGuideHeight
		if(assistP > 0) {
			this.#dampVelocity(entry, profile, assistP)
			if(canAssistLanding) {
				this.#applyLandingAssist(entry, profile, assistP)
			}
		}
		const curQ = this.#getBodyQuat(entry)
		if(!curQ) return
		const angle = this.#applyAngularMotor(entry, curQ, guide, profile, progress)
		const posY = entry.physMesh.position.y
		const nearFloor = posY <= profile.maxLockHeight
		const nearlyAligned = angle < profile.angleThreshold
		const finalTimeout = entry.timeout < 80
		const recentBodyContact = this.#hasRecentBodyContact(entry, profile)
		const canLock = nearFloor && (entry.hasGroundContact || entry.groundContactElapsed > 180 || finalTimeout) && (!recentBodyContact || finalTimeout)
		if(canLock && (nearlyAligned || finalTimeout)) this.#finalizeGuided(entry)
	}
}
