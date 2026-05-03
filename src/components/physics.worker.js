import { lerp } from '../helpers'
import AmmoJS from "../ammo/ammo.wasm.es.js"

// Firefox limitation: https://github.com/vitejs/vite/issues/4586

// there's probably a better place for these variables
let bodies = []
let sleepingBodies = []
let colliders = {}
let physicsWorld
let Ammo
let worldWorkerPort
let tmpBtTrans
let sharedVector3
let width = 150
let height = 150
let aspect = 1
let stopLoop = false

const defaultOptions = {
	size: 9.5,
	startingHeight: 8,
	spinForce: 6,
	throwForce: 5,
	gravity: 1,
	mass: 1,
	friction: .8,
	restitution: .1,
	linearDamping: .5,
	angularDamping: .4,
	settleTimeout: 5000,
	// TODO: toss: "center", "edge", "allEdges"
}

let config = {...defaultOptions}

const forcedGuideOptions = {
	minElapsed: 120,
	timeoutWindow: 1600,
	speedThreshold: 1.6,
	tiltThreshold: 1.4,
	duration: 1350,
	angleThreshold: 0.028,
	initialBias: .34,
	angularStrength: 3.2,
	maxAngularVelocity: 3.8,
	motorBlend: .12,
	linearDampingStart: .99,
	linearDampingEnd: .82,
	angularDampingStart: .985,
	angularDampingEnd: .78,
	centerPull: .01,
	centerMaxVelocity: .42,
	maxLockHeight: 2.4
}

const forcedGuideByDieType = {
	d4: {
		minElapsed: 160,
		duration: 1500,
		angularStrength: 2.8,
		maxAngularVelocity: 3.2,
		initialBias: .26,
		centerPull: .014
	},
	d6: {
		minElapsed: 140,
		duration: 1420,
		angularStrength: 2.9,
		maxAngularVelocity: 3.3,
		initialBias: .3
	},
	d10: {
		minElapsed: 110,
		duration: 1280,
		angularStrength: 3.5,
		maxAngularVelocity: 4.1,
		initialBias: .36
	},
	d100: {
		minElapsed: 110,
		duration: 1280,
		angularStrength: 3.5,
		maxAngularVelocity: 4.1,
		initialBias: .36
	},
	d20: {
		minElapsed: 90,
		duration: 1220,
		angularStrength: 3.8,
		maxAngularVelocity: 4.5,
		initialBias: .4
	}
}

let emptyVector
let diceBufferView

self.onmessage = (e) => {
  switch (e.data.action) {
    case "rollDie":
      rollDie(e.data.sides)
      break;
    case "init":
      init(e.data).then(()=>{
        self.postMessage({
          action:"init-complete"
        })
      })
      break
    case "clearDice":
			clearDice()
      break
		case "removeDie":
			removeDie(e.data.id)
			break;
		case "resize":
			width = e.data.width
			height = e.data.height
			aspect = width / height
			addBoxToWorld(config.size, config.startingHeight + 10)
			break
		case "updateConfig":
			updateConfig(e.data.options)
			break
    case "connect":
      worldWorkerPort = e.ports[0]
      worldWorkerPort.onmessage = (e) => {
        switch (e.data.action) {
					case "initBuffer":
						diceBufferView = new Float32Array(e.data.diceBuffer)
						diceBufferView[0] = -1
						break;
					case "loadModels":
						// console.log('e.data', e.data)
						loadModels(e.data.options)
						break;
          case "addDie":
						// toss from all edges
						// setStartPosition()
						if(e.data.options.newStartPoint){
							setStartPosition()
						}
            const newDie = addDie(e.data.options)
						rollDie(newDie)
            break;
          case "rollDie":
						// TODO: this won't work, need a die object
            rollDie(e.data.id)
            break;
					case "removeDie":
						removeDie(e.data.id)
						break;
					case "guideDie":
						guideDie(e.data)
						break;
          case "stopSimulation":
            stopLoop = true
						
            break;
          case "resumeSimulation":
						if(e.data.newStartPoint){
							setStartPosition()
						}
            stopLoop = false
						loop()
            break;
					case "stepSimulation":
						diceBufferView = new Float32Array(e.data.diceBuffer)
						loop()
						break;
          default:
            console.error("action not found in physics worker from worldOffscreen worker:", e.data.action)
        }
      }
      break
    default:
      console.error("action not found in physics worker:", e.data.action)
  }
}


const computeGravity = (gravity = defaultOptions.gravity, mass = defaultOptions.mass) => {
	// make gravity a little bit stronger for heavy objects, so they seem heavier
	return gravity === 0 ? 0 : gravity + mass / 3
}

const computeMass = (mass = defaultOptions.mass) => {
	// high values in mass are pretty ineffective, but whole intigers make better config values, so we shave down the value
	// also prevents mass from ever being zero
	return 1 + mass / 3
}

const computeSpin = (spin = defaultOptions.spinForce, spinScale = 40) => {
	// scale down the actual spin value from a nice intiger in config to a fractional value
	return spin/spinScale
}

const computeThrowForce = (throwForce = defaultOptions.throwForce, mass = defaultOptions.mass, scale = defaultOptions.scale) => {
	return throwForce / 2 / mass * (1 + scale / 6)
}

const computeStartingHeight = (height = defaultOptions.startingHeight) => {
	// ensure minimum startingHeight of 1
	return height < 1 ? 1 : height
}



// runs when the worker loads to set up the Ammo physics world and load our colliders
// loaded colliders will be cached and added to the world in a later post message
const init = async (data) => {
	width = data.width
	height = data.height
	aspect = width / height

	config = {...config,...data.options}
	config.gravity = computeGravity(config.gravity, config.mass)
	config.mass = computeMass(config.mass)
	config.spinForce = computeSpin(config.spinForce)
	config.throwForce = computeThrowForce(config.throwForce,config.mass,config.scale)
	config.startingHeight = computeStartingHeight(config.startingHeight)

	const ammoWASM = {
		// locateFile: () => '../../node_modules/ammo.js/builds/ammo.wasm.wasm'
		locateFile: () => `${config.origin + config.assetPath}ammo/ammo.wasm.wasm`
	}

	Ammo = await new AmmoJS(ammoWASM)

	tmpBtTrans = new Ammo.btTransform()
	sharedVector3 = new Ammo.btVector3(0, 0, 0)
	emptyVector = setVector3(0,0,0)

	setStartPosition()
	
	physicsWorld = setupPhysicsWorld()

	addBoxToWorld(config.size, config.startingHeight + 10)
}

const updateConfig = (options) => {
	config = {...config, ...options}
	if(options.mass){
		config.mass = computeMass(config.mass)
	}
	if(options.mass || options.gravity) {
		config.gravity = computeGravity(config.gravity, config.mass)
	}
	
	if(options.spinForce) {
		config.spinForce = computeSpin(config.spinForce)
	}
	if(options.throwForce || options.mass || options.scale){
		config.throwForce = computeThrowForce(config.throwForce, config.mass, config.scale)
	}
	if(options.startingHeight) {
		computeStartingHeight(config.startingHeight)
	}

	removeBoxFromWorld()
	addBoxToWorld(config.size, config.startingHeight + 10)
	physicsWorld.setGravity(setVector3(0, -9.81 * config.gravity, 0))
	Object.values(colliders).map((collider) => {
		collider.convexHull.setLocalScaling(setVector3(collider.scaling[0] * config.scale, collider.scaling[1] * config.scale, collider.scaling[2] * config.scale))
	})
}

// options object with colliders and meshName are required
const loadModels = async ({colliders: modelData, meshName}) => {

	let has_d100 = false
	let has_d10 = false

	// turn our model data into convex hull items for the physics world
	modelData.forEach((model,i) => {
		colliders[meshName + '_' + model.name] = model
		colliders[meshName + '_' + model.name].convexHull = createConvexHull(model)
		if (!has_d10) {
			has_d10 = model.id === "d10_collider"
		}
		if (!has_d100) {
			has_d100 = model.id === "d100_collider"
		}
	})
	if (!has_d100 && has_d10) {
		colliders[`${meshName}_d100_collider`] = colliders[`${meshName}_d10_collider`]
	}
}

const setVector3 = (x,y,z) => {
	sharedVector3.setValue(x,y,z)
	return sharedVector3
}

const setStartPosition = () => {
	let size = config.size
	// let envelopeSize = size * .6 / 2
	let edgeOffset = .5
	let xMin = size * aspect / 2 - edgeOffset
	let xMax = size * aspect / -2 + edgeOffset
	let yMin = size / 2 - edgeOffset
	let yMax = size / -2 + edgeOffset
	// let xEnvelope = lerp(envelopeSize * aspect - edgeOffset * aspect, -envelopeSize * aspect + edgeOffset * aspect, Math.random())
	let xEnvelope = lerp(xMin, xMax, Math.random())
	let yEnvelope = lerp(yMin, yMax, Math.random())
	let tossFromTop = Math.round(Math.random())
	let tossFromLeft = Math.round(Math.random())
	let tossX = Math.round(Math.random())
	// console.log(`throw coming from`, tossX ? tossFromTop ? "top" : "bottom" : tossFromLeft ? "left" : "right")

	// forces = {
	// 	xMinForce: tossX ? -config.throwForce * aspect : tossFromLeft ? config.throwForce * aspect * .3 : -config.throwForce * aspect * .3,
	// 	xMaxForce: tossX ? config.throwForce * aspect : tossFromLeft ? config.throwForce * aspect * 1 : -config.throwForce * aspect * 1,
	// 	zMinForce: tossX ? tossFromTop ? config.throwForce * .3 : -config.throwForce * .3 : -config.throwForce,
	// 	zMaxForce: tossX ? tossFromTop ? config.throwForce * 1 : -config.throwForce * 1 : config.throwForce,
	// }

	config.startPosition = [
		// tossing on x axis then z should be locked to top or bottom
		// not tossing on x axis then x should be locked to the left or right
		tossX ? xEnvelope : tossFromLeft ? xMax : xMin,
		config.startingHeight,
		tossX ? tossFromTop ? yMax : yMin : yEnvelope
	]

	// console.log(`startPosition`, config.startPosition)
}

const createConvexHull = (mesh) => {
	const convexMesh = new Ammo.btConvexHullShape()

	let count = mesh.positions.length

	for (let i = 0; i < count; i+=3) {
		let v = setVector3(mesh.positions[i], mesh.positions[i+1], mesh.positions[i+2])
		convexMesh.addPoint(v, true)
	}
	
	convexMesh.setLocalScaling(setVector3(mesh.scaling[0] * config.scale, mesh.scaling[1] * config.scale, mesh.scaling[2] * config.scale))

	return convexMesh
}

const createRigidBody = (collisionShape, params) => {
	// apply params
	const {
		mass = .1,
		collisionFlags = 0,
		// pos = { x: 0, y: 0, z: 0 },
		// quat = { x: 0, y: 0, z: 0, w: 1 }
		pos = [0,0,0],
		// quat = [0,0,0,-1],
		quat = [
			lerp(-1.5, 1.5, Math.random()),
			lerp(-1.5, 1.5, Math.random()),
			lerp(-1.5, 1.5, Math.random()),
			-1
		],
		scale = [1,1,1],
		friction = config.friction,
		restitution = config.restitution
	} = params

	// apply position and rotation
	const transform = new Ammo.btTransform()
	// console.log(`collisionShape scaling `, collisionShape.getLocalScaling().x(),collisionShape.getLocalScaling().y(),collisionShape.getLocalScaling().z())
	transform.setIdentity()
	transform.setOrigin(setVector3(pos[0], pos[1], pos[2]))
	transform.setRotation(
		new Ammo.btQuaternion(quat[0], quat[1], quat[2], quat[3])
	)
	// collisionShape.setLocalScaling(new Ammo.btVector3(1.1, -1.1, 1.1))
	// transform.ScalingToRef()
	// set the scale of the collider
	// collisionShape.setLocalScaling(new Ammo.btVector3(scale[0],scale[1],scale[2]))

	// create the rigid body
	const motionState = new Ammo.btDefaultMotionState(transform)
	const localInertia = setVector3(0, 0, 0)
	if (mass > 0) collisionShape.calculateLocalInertia(mass, localInertia)
	const rbInfo = new Ammo.btRigidBodyConstructionInfo(
		mass,
		motionState,
		collisionShape,
		localInertia
	)
	const rigidBody = new Ammo.btRigidBody(rbInfo)
	
	// rigid body properties
	if (mass > 0) rigidBody.setActivationState(4) // Disable deactivation
	rigidBody.setCollisionFlags(collisionFlags)
	rigidBody.setFriction(friction)
	rigidBody.setRestitution(restitution)
	rigidBody.setDamping(config.linearDamping, config.angularDamping)

	// ad rigid body to physics world
	// physicsWorld.addRigidBody(rigidBody)

	return rigidBody

}
// cache for box parts so it can be removed after a new one has been made
let boxParts = []
const addBoxToWorld = (size, height) => {
	const tempParts = []
	// ground
	const localInertia = setVector3(0, 0, 0);

	const groundTransform = new Ammo.btTransform()
	groundTransform.setIdentity()
	groundTransform.setOrigin(setVector3(0, -.5, 0))
	const groundShape = new Ammo.btBoxShape(setVector3(size * aspect, 1, size))
	const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
	const groundInfo = new Ammo.btRigidBodyConstructionInfo(0, groundMotionState, groundShape, localInertia)
	const groundBody = new Ammo.btRigidBody(groundInfo)
	groundBody.id='box_bottom'
	groundBody.setFriction(config.friction)
	groundBody.setRestitution(config.restitution)
	physicsWorld.addRigidBody(groundBody)
	tempParts.push(groundBody)

	const ceilingTransform = new Ammo.btTransform()
	ceilingTransform.setIdentity()
	ceilingTransform.setOrigin(setVector3(0, height - .5, 0))
	const ceilingShape = new Ammo.btBoxShape(setVector3(size * aspect, 1, size))
	const ceilingMotionState = new Ammo.btDefaultMotionState(ceilingTransform)
	const ceilingInfo = new Ammo.btRigidBodyConstructionInfo(0, ceilingMotionState, ceilingShape, localInertia)
	const ceilingBody = new Ammo.btRigidBody(ceilingInfo)
	ceilingBody.id='box_top'
	ceilingBody.setFriction(config.friction)
	ceilingBody.setRestitution(config.restitution)
	physicsWorld.addRigidBody(ceilingBody)
	tempParts.push(ceilingBody)

	const wallTopTransform = new Ammo.btTransform()
	wallTopTransform.setIdentity()
	wallTopTransform.setOrigin(setVector3(0, 0, (size/-2) - .5))
	const wallTopShape = new Ammo.btBoxShape(setVector3(size * aspect, height, 1))
	const topMotionState = new Ammo.btDefaultMotionState(wallTopTransform)
	const topInfo = new Ammo.btRigidBodyConstructionInfo(0, topMotionState, wallTopShape, localInertia)
	const topBody = new Ammo.btRigidBody(topInfo)
	topBody.id='box_wall_north'
	topBody.setFriction(config.friction)
	topBody.setRestitution(config.restitution)
	physicsWorld.addRigidBody(topBody)
	tempParts.push(topBody)

	const wallBottomTransform = new Ammo.btTransform()
	wallBottomTransform.setIdentity()
	wallBottomTransform.setOrigin(setVector3(0, 0, (size/2) + .5))
	const wallBottomShape = new Ammo.btBoxShape(setVector3(size * aspect, height, 1))
	const bottomMotionState = new Ammo.btDefaultMotionState(wallBottomTransform)
	const bottomInfo = new Ammo.btRigidBodyConstructionInfo(0, bottomMotionState, wallBottomShape, localInertia)
	const bottomBody = new Ammo.btRigidBody(bottomInfo)
	bottomBody.id='box_wall_south'
	bottomBody.setFriction(config.friction)
	bottomBody.setRestitution(config.restitution)
	physicsWorld.addRigidBody(bottomBody)
	tempParts.push(bottomBody)

	const wallRightTransform = new Ammo.btTransform()
	wallRightTransform.setIdentity()
	wallRightTransform.setOrigin(setVector3((size * aspect / -2) - .5, 0, 0))
	const wallRightShape = new Ammo.btBoxShape(setVector3(1, height, size))
	const rightMotionState = new Ammo.btDefaultMotionState(wallRightTransform)
	const rightInfo = new Ammo.btRigidBodyConstructionInfo(0, rightMotionState, wallRightShape, localInertia)
	const rightBody = new Ammo.btRigidBody(rightInfo)
	rightBody.id='box_wall_east'
	rightBody.setFriction(config.friction)
	rightBody.setRestitution(config.restitution)
	physicsWorld.addRigidBody(rightBody)
	tempParts.push(rightBody)

	const wallLeftTransform = new Ammo.btTransform()
	wallLeftTransform.setIdentity()
	wallLeftTransform.setOrigin(setVector3((size * aspect / 2) + .5, 0, 0))
	const wallLeftShape = new Ammo.btBoxShape(setVector3(1, height, size))
	const leftMotionState = new Ammo.btDefaultMotionState(wallLeftTransform)
	const leftInfo = new Ammo.btRigidBodyConstructionInfo(0, leftMotionState, wallLeftShape, localInertia)
	const leftBody = new Ammo.btRigidBody(leftInfo)
	leftBody.id='box_wall_west'
	leftBody.setFriction(config.friction)
	leftBody.setRestitution(config.restitution)
	physicsWorld.addRigidBody(leftBody)
	tempParts.push(leftBody)

	if(boxParts.length){
		removeBoxFromWorld()
	}
	boxParts = [...tempParts]
}

const removeBoxFromWorld = () => {
	boxParts.forEach(part => physicsWorld.removeRigidBody(part))
}

const addDie = (options) => {
	const { sides, id, meshName, scale} = options
	const dieType = Number.isInteger(sides) ? `d${sides}` : sides
	let cType = `${dieType}_collider`
	const comboKey = `${meshName}_${cType}`
	const colliderMass = colliders[comboKey]?.physicsMass || .1
	const mass = colliderMass * config.mass * config.scale // feature? mass should go up with scale, but it throws off the throwForce and spinForce scaling
	const guidanceProfile = getGuideProfile(dieType)
	const initialQuaternion = createBiasedInitialQuaternion(options.forcedTargetQuaternion, guidanceProfile)
	// TODO: incorporate colliders physicsFriction and physicsRestitution settings
	// clone the collider
	const newDie = createRigidBody(colliders[comboKey].convexHull, {
		mass,
		scaling: colliders[comboKey].scaling,
		pos: config.startPosition,
		quat: initialQuaternion,
	})
	newDie.id = id
	newDie.dieType = dieType
	newDie.timeout = config.settleTimeout
	newDie.elapsed = 0
	newDie.mass = mass
	newDie.guidanceProfile = guidanceProfile
	if(options.forcedTargetQuaternion) {
		setGuidedTarget(newDie, options.forcedTargetQuaternion, dieType)
	}
	physicsWorld.addRigidBody(newDie)
	bodies.push(newDie)

	return newDie
	// console.log(`added collider for `, type)
	// rollDie(newDie)
}

const rollDie = (die) => {

	// lerp picks a random number between two values
	die.setLinearVelocity(setVector3(
		lerp(-config.startPosition[0] * .5, -config.startPosition[0] * config.throwForce, Math.random()),
		lerp(-config.startPosition[1], -config.startPosition[1] * 2, Math.random()), // limit the y force to 2
		lerp(-config.startPosition[2] * .5, -config.startPosition[2] * config.throwForce, Math.random()),
	))

	const flippy = Math.random() > .5 ? 1 : -1 // random positive or negative number
	const spinny = lerp(config.spinForce * .5, config.spinForce, Math.random())
	const force = new Ammo.btVector3(
		spinny * flippy,
		spinny * -flippy, // flip the flippy to avoid gimble lock
		spinny * flippy
	)

	// attempting to create an envelope for the force influence based on scale and mass
	// linear scale was no good - this creates a nice power curve
	const scale = Math.abs(config.scale - 1) + config.scale * config.scale * (die.mass/config.mass) * .75

	// console.log('scale', scale)
	
	die.applyImpulse(force, setVector3(scale, scale, scale))

}

const removeDie = (id) => {
	sleepingBodies = sleepingBodies.filter((die) => {
		let match = die.id === id
		if(match){
			// remove the mesh from the scene
			physicsWorld.removeRigidBody(die)
		}
		return !match
	})

	// step the animation forward
	// requestAnimationFrame(loop)
}

const findBody = (id) => {
	return bodies.find(die => die.id === id) || sleepingBodies.find(die => die.id === id)
}

const clamp = (value, min, max) => {
	return Math.max(min, Math.min(max, value))
}

const smoothStep = (value) => {
	const clamped = clamp(value, 0, 1)
	return clamped * clamped * (3 - 2 * clamped)
}

const normalizeQuaternion = (q) => {
	const length = Math.hypot(q.x, q.y, q.z, q.w) || 1
	return {
		x: q.x / length,
		y: q.y / length,
		z: q.z / length,
		w: q.w / length
	}
}

const dotQuaternion = (a, b) => {
	return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w
}

const getShortestTargetQuaternion = (source, target) => {
	return dotQuaternion(source, target) < 0
		? {x: -target.x, y: -target.y, z: -target.z, w: -target.w}
		: target
}

const multiplyQuaternion = (a, b) => {
	return normalizeQuaternion({
		x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
		y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
		z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
		w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
	})
}

const conjugateQuaternion = (q) => {
	return {
		x: -q.x,
		y: -q.y,
		z: -q.z,
		w: q.w
	}
}

const randomQuaternion = () => {
	const x = lerp(-1.5, 1.5, Math.random())
	const y = lerp(-1.5, 1.5, Math.random())
	const z = lerp(-1.5, 1.5, Math.random())
	return normalizeQuaternion({x, y, z, w: -1})
}

const createBiasedInitialQuaternion = (targetQuaternion, profile) => {
	if(!targetQuaternion || !profile.initialBias) {
		return undefined
	}

	const source = randomQuaternion()
	const target = getShortestTargetQuaternion(source, normalizeQuaternion(targetQuaternion))
	const bias = clamp(profile.initialBias, 0, .45)
	const quaternion = normalizeQuaternion({
		x: lerp(source.x, target.x, bias),
		y: lerp(source.y, target.y, bias),
		z: lerp(source.z, target.z, bias),
		w: lerp(source.w, target.w, bias)
	})

	return [quaternion.x, quaternion.y, quaternion.z, quaternion.w]
}

const getGuideProfile = (dieType) => {
	return {
		...forcedGuideOptions,
		...(forcedGuideByDieType[dieType] || {})
	}
}

const getBodyQuaternion = (body) => {
	const ms = body.getMotionState()
	if(!ms) {
		return null
	}

	ms.getWorldTransform(tmpBtTrans)
	const q = tmpBtTrans.getRotation()
	return normalizeQuaternion({
		x: q.x(),
		y: q.y(),
		z: q.z(),
		w: q.w()
	})
}

const getBodyPositionY = (body) => {
	const ms = body.getMotionState()
	if(!ms) {
		return Number.POSITIVE_INFINITY
	}

	ms.getWorldTransform(tmpBtTrans)
	return tmpBtTrans.getOrigin().y()
}

const setBodyQuaternion = (body, quaternion) => {
	const ms = body.getMotionState()
	if(!ms) {
		return
	}

	ms.getWorldTransform(tmpBtTrans)
	tmpBtTrans.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
	body.setWorldTransform(tmpBtTrans)
	ms.setWorldTransform(tmpBtTrans)
}

const dampBodyVelocity = (body, profile, progress) => {
	const angular = body.getAngularVelocity()
	const angularDamping = lerp(profile.angularDampingStart, profile.angularDampingEnd, progress)
	body.setAngularVelocity(setVector3(
		angular.x() * angularDamping,
		angular.y() * angularDamping,
		angular.z() * angularDamping
	))
}

const applyLandingAssist = (body, profile, progress) => {
	const ms = body.getMotionState()
	if(!ms) {
		return
	}

	ms.getWorldTransform(tmpBtTrans)
	const position = tmpBtTrans.getOrigin()
	const linear = body.getLinearVelocity()
	const linearDamping = lerp(profile.linearDampingStart, profile.linearDampingEnd, progress)
	const centerPull = profile.centerPull * progress
	const pullX = clamp(-position.x() * centerPull, -profile.centerMaxVelocity, profile.centerMaxVelocity)
	const pullZ = clamp(-position.z() * centerPull, -profile.centerMaxVelocity, profile.centerMaxVelocity)

	body.setLinearVelocity(setVector3(
		linear.x() * linearDamping + pullX,
		linear.y() * lerp(.98, linearDamping, progress),
		linear.z() * linearDamping + pullZ
	))
}

const applyAngularMotor = (body, currentQuaternion, guide, profile, progress) => {
	const target = getShortestTargetQuaternion(currentQuaternion, guide.quaternion)
	let error = multiplyQuaternion(target, conjugateQuaternion(currentQuaternion))
	if(error.w < 0) {
		error = {x: -error.x, y: -error.y, z: -error.z, w: -error.w}
	}

	const angle = 2 * Math.acos(clamp(error.w, -1, 1))
	if(angle < 0.0001) {
		return angle
	}

	const sinHalfAngle = Math.sqrt(Math.max(0.000001, 1 - error.w * error.w))
	const axis = {
		x: error.x / sinHalfAngle,
		y: error.y / sinHalfAngle,
		z: error.z / sinHalfAngle
	}
	const easedProgress = smoothStep(progress)
	const desiredSpeed = Math.min(
		profile.maxAngularVelocity,
		angle * profile.angularStrength * lerp(.38, 1, easedProgress)
	)
	const desired = {
		x: axis.x * desiredSpeed,
		y: axis.y * desiredSpeed,
		z: axis.z * desiredSpeed
	}
	const current = body.getAngularVelocity()
	const angularDamping = lerp(profile.angularDampingStart, profile.angularDampingEnd, progress)
	const blend = clamp(profile.motorBlend + easedProgress * .24, 0, .44)

	body.setAngularVelocity(setVector3(
		lerp(current.x() * angularDamping, desired.x, blend),
		lerp(current.y() * angularDamping, desired.y, blend),
		lerp(current.z() * angularDamping, desired.z, blend)
	))

	return angle
}

const finalizeGuidedBody = (body) => {
	body.guidedTarget.state = 'finalLock'
	setBodyQuaternion(body, body.guidedTarget.quaternion)
	body.setLinearVelocity(emptyVector)
	body.setAngularVelocity(emptyVector)
	body.guidedTarget.complete = true
	body.guidedFinalFrameSynced = false
	body.guidedTarget.state = 'complete'
}

const shouldStartGuidance = (body, speed, tilt) => {
	const profile = body.guidedTarget?.profile || body.guidanceProfile || forcedGuideOptions
	if(body.elapsed < profile.minElapsed) {
		return false
	}

	return true
}

const applyGuidance = (body, delta, speed, tilt) => {
	const guide = body.guidedTarget
	if(!guide) {
		return
	}

	if(guide.complete && body.guidedFinalFrameSynced) {
		body.guidedSleepReady = true
		return
	}

	if(!guide.active) {
		if(!shouldStartGuidance(body, speed, tilt)) {
			guide.state = 'freeFall'
			return
		}
		guide.active = true
		guide.elapsed = 0
		guide.state = 'guidedSettle'
	}

	guide.elapsed += delta
	const profile = guide.profile || body.guidanceProfile || forcedGuideOptions
	const progress = Math.min(1, guide.elapsed / profile.duration)
	dampBodyVelocity(body, profile, progress)
	applyLandingAssist(body, profile, progress)

	const currentQuaternion = getBodyQuaternion(body)
	if(!currentQuaternion) {
		return
	}

	const angle = applyAngularMotor(body, currentQuaternion, guide, profile, progress)

	const nearFloor = getBodyPositionY(body) <= profile.maxLockHeight
	const canLock = nearFloor && (body.hasGroundContact || progress >= .7 || body.timeout < 80)
	if(canLock && (angle < profile.angleThreshold || body.timeout < 80)) {
		finalizeGuidedBody(body)
	}
}

const setGuidedTarget = (body, quaternion, dieType = body.dieType) => {
	if(!body || !quaternion) {
		return
	}

	const profile = getGuideProfile(dieType)
	const existingGuide = body.guidedTarget
	body.guidedTarget = {
		quaternion: normalizeQuaternion(quaternion),
		profile,
		active: existingGuide?.active || false,
		complete: false,
		elapsed: existingGuide?.elapsed || 0,
		state: existingGuide?.state || 'spawn',
	}
	body.guidanceProfile = profile
	body.guidedSleepReady = false
}

const guideDie = ({id, quaternion, dieType}) => {
	setGuidedTarget(findBody(id), quaternion, dieType)
}

const writeBodyTransformToBuffer = (body, bufferIndex) => {
	const ms = body.getMotionState()
	if(!ms) {
		return false
	}

	ms.getWorldTransform(tmpBtTrans)
	let p = tmpBtTrans.getOrigin()
	let q = tmpBtTrans.getRotation()

	diceBufferView[bufferIndex] = body.id
	diceBufferView[bufferIndex + 1] = p.x()
	diceBufferView[bufferIndex + 2] = p.y()
	diceBufferView[bufferIndex + 3] = p.z()
	diceBufferView[bufferIndex + 4] = q.x()
	diceBufferView[bufferIndex + 5] = q.y()
	diceBufferView[bufferIndex + 6] = q.z()
	diceBufferView[bufferIndex + 7] = q.w()
	return true
}

const clearDice = () => {
	if(diceBufferView.byteLength){
		diceBufferView.fill(0)
	}
	stopLoop = true
	// clear all bodies
	bodies.forEach(body => physicsWorld.removeRigidBody(body))
	sleepingBodies.forEach(body => physicsWorld.removeRigidBody(body))
	// clear cache arrays
	bodies = []
	sleepingBodies = []
}


const setupPhysicsWorld = () => {
	const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
	const broadphase = new Ammo.btDbvtBroadphase()
	const solver = new Ammo.btSequentialImpulseConstraintSolver()
	const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
	const World = new Ammo.btDiscreteDynamicsWorld(
		dispatcher,
		broadphase,
		solver,
		collisionConfiguration
	)
	World.setGravity(setVector3(0, -9.81 * config.gravity, 0))

	return World
}

const update = (delta) => {
	// step world
	const deltaTime = delta / 1000
	
	// console.time("stepSimulation")
	physicsWorld.stepSimulation(deltaTime, 2, 1 / 90) // higher number = slow motion
	// console.timeEnd("stepSimulation")

	diceBufferView[0] = bodies.length

	// Detect collisions
	bodies.forEach(body => {
		body.hasGroundContact = false
	})
    const numManifolds = physicsWorld.getDispatcher().getNumManifolds();
    for (let i = 0; i < numManifolds; i++) {
        const contactManifold = physicsWorld.getDispatcher().getManifoldByIndexInternal(i);
        const body0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        const body1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

        const rb0Id = body0.id;
        const rb1Id = body1.id;
				if(rb0Id === 'box_bottom' && body1.guidedTarget) {
					body1.hasGroundContact = true
				}
				if(rb1Id === 'box_bottom' && body0.guidedTarget) {
					body0.hasGroundContact = true
				}

        let totalForce = 0;

        // Calculate collision force
        const numContacts = contactManifold.getNumContacts();
        for (let j = 0; j < numContacts; j++) {
            const contactPoint = contactManifold.getContactPoint(j);

            // Check if the contact point indicates collision (penetration depth)
            if (contactPoint.getDistance() < 0) {
                // Relative velocity of the two bodies at the contact point
                const normal = contactPoint.get_m_normalWorldOnB();

                const velocity0 = body0.getLinearVelocity();
                const velocity1 = body1.getLinearVelocity();

                // Calculate relative velocity
                const relativeVelocity = new Ammo.btVector3();
                relativeVelocity.setValue(
                    velocity0.x() - velocity1.x(),
                    velocity0.y() - velocity1.y(),
                    velocity0.z() - velocity1.z()
                );

                // Calculate the force (F = m * a) based on velocity and collision normal
                const collisionForce = normal.dot(relativeVelocity);
                totalForce += Math.abs(collisionForce);  // Add to total collision force
							}
						}
						
        if (totalForce > 0) {
            // Send the collision data to the main thread
            self.postMessage({
                action: "collision",
                body0Id: rb0Id,
                body1Id: rb1Id,
                force: totalForce
            });
        }
    }

	// looping backwards since bodies are removed as they are put to sleep
	for (let i = bodies.length - 1; i >= 0; i--) {
		const rb = bodies[i]
		rb.elapsed = (rb.elapsed || 0) + delta
		applyGuidance(rb, delta, rb.getLinearVelocity().length(), rb.getAngularVelocity().length())
		const speed = rb.getLinearVelocity().length()
		const tilt = rb.getAngularVelocity().length()

		if(rb.guidedTarget?.complete && !rb.guidedFinalFrameSynced) {
			if(writeBodyTransformToBuffer(rb, (i * 8) + 1)) {
				rb.guidedFinalFrameSynced = true
				rb.timeout -= delta
				continue
			}
		}

		if(rb.guidedSleepReady || (!rb.guidedTarget && (speed < .01 && tilt < .005 || rb.timeout < 0))) {
			// flag the second param for this body so it can be processed in World, first param will be the roll.id
			diceBufferView[(i*8) + 1] = rb.id
			diceBufferView[(i*8) + 2] = -1
			rb.asleep = true
			rb.setMassProps(0)
			rb.forceActivationState(3)
			// zero out anything left
			rb.setLinearVelocity(emptyVector)
			rb.setAngularVelocity(emptyVector)
			sleepingBodies.push(bodies.splice(i,1)[0])
			continue
		}
		// tick down the movement timeout on this die
		rb.timeout -= delta
		writeBodyTransformToBuffer(rb, (i * 8) + 1)
	}
}

let last = new Date().getTime()
const loop = () => {
	let now = new Date().getTime()
	const delta = now - last
	last = now

	if(!stopLoop && diceBufferView.byteLength) {
		// console.time("physics")
		update(delta)
		// console.timeEnd("physics")
			worldWorkerPort.postMessage({
				action: 'updates',
				diceBuffer: diceBufferView.buffer
			}, [diceBufferView.buffer])
	}
}
