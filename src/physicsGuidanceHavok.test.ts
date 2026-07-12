import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import HavokPhysics from '@babylonjs/havok'
import '@babylonjs/core/Physics/physicsEngineComponent'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import { PhysicsShapeBox, PhysicsShapeConvexHull } from '@babylonjs/core/Physics/v2/physicsShape'
import { Scene } from '@babylonjs/core/scene'
import {
	createPrecomputedFlightQuaternion,
	createLandingApproachQuaternion,
	estimateBallisticFlightSeconds,
	getFaceAlignment,
	getFaceGuidedAngularVelocity,
	getGuidedLinearVelocity,
	getLandingRollAxis,
	getPlannedFlightAngularVelocity,
	getPlannedFlightQuaternion,
	getPlannedFlightSpin,
	getPhysicsGuidanceProfile,
	getResultFaceFrame,
	getSoftLandingLinearVelocity,
	getSustainedRollAngularVelocity,
	getThrownAngularVelocity,
	getVisibleFlightAngularVelocity
} from './physicsGuidance'
import { createThrownLinearVelocity } from './renderers/KinematicRenderer'
import { createStaticPhysicsBox } from './renderers/physicsBounds'
import {
	getFaceNormal,
	getSupportHeight,
	getTargetQuaternion
} from './renderers/PolyhedralFactory'

const require = createRequire(import.meta.url)
const havokEntry = require.resolve('@babylonjs/havok')
const havokWasm = join(dirname(havokEntry), '..', 'esm', 'HavokPhysics.wasm')
const STEP_SECONDS = 1 / 120
const STEP_MS = STEP_SECONDS * 1000

interface SerializedMesh {
	readonly name: string
	readonly [key: string]: unknown
}

interface DiceModel {
	readonly meshes: readonly SerializedMesh[]
	readonly colliderFaceMap: Readonly<Record<string, Readonly<Record<string, number>>>>
}

const loadDefaultModel = (): DiceModel => JSON.parse(readFileSync(
	new URL('../public/assets/dice-box/themes/default/default.json', import.meta.url),
	'utf8'
)) as DiceModel

const parseModelMesh = (source: SerializedMesh, scene: Scene): Mesh => {
	const parsed = { ...source }
	delete parsed.physicsImpostor
	return Mesh.Parse(parsed, scene, '')
}

const getRotation = (mesh: { rotationQuaternion: Quaternion | null }): Quaternion => {
	assert.ok(mesh.rotationQuaternion, 'Havok should keep the dynamic mesh quaternion available')
	return mesh.rotationQuaternion.clone().normalize()
}

const quaternionDistance = (from: Quaternion, to: Quaternion): number =>
	2 * Math.acos(Math.min(1, Math.abs(Quaternion.Dot(from.normalize(), to.normalize()))))

const getIcoFaceNormals = (mesh: ReturnType<typeof CreateIcoSphere>): Vector3[] => {
	const positions = mesh.getVerticesData(VertexBuffer.PositionKind)
	const indices = mesh.getIndices()
	assert.ok(positions && indices)
	const normals: Vector3[] = []
	for(let index = 0; index < indices.length; index += 3) {
		const a = Vector3.FromArray(positions, indices[index]! * 3)
		const b = Vector3.FromArray(positions, indices[index + 1]! * 3)
		const c = Vector3.FromArray(positions, indices[index + 2]! * 3)
		const normal = Vector3.Cross(b.subtract(a), c.subtract(a)).normalize()
		const center = a.add(b).add(c).scale(1 / 3)
		if(Vector3.Dot(normal, center) < 0) normal.scaleInPlace(-1)
		normals.push(normal)
	}
	return normals
}

const getTopFaceValue = (
	collider: Mesh,
	faceMap: Readonly<Record<string, number>>,
	rotation: Quaternion
): number => {
	const scores = new Map<number, Vector3>()
	for(const [triangle, value] of Object.entries(faceMap)) {
		const normal = getFaceNormal(collider, Number(triangle))
		if(!normal) continue
		const aggregate = scores.get(value) ?? Vector3.Zero()
		aggregate.addInPlace(normal)
		scores.set(value, aggregate)
	}
	let topValue = -1
	let topScore = Number.NEGATIVE_INFINITY
	for(const [value, aggregate] of scores) {
		const score = Vector3.Dot(
			aggregate.normalize().applyRotationQuaternion(rotation),
			Vector3.Up()
		)
		if(score > topScore) {
			topValue = value
			topScore = score
		}
	}
	return topValue
}

describe('face guidance with real Havok integration', () => {
	it('imperceptibly steers a launched convex body onto its resolved face', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(Vector3.Zero(), new HavokPlugin(true, havok))

		try {
			const mesh = CreateBox('guided-die', { size: 1 }, scene)
			mesh.position.set(-2, 4, 1)
			mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(0.72, 1.08, -0.63).normalize()
			const body = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene)
			body.shape = PhysicsShapeBox.FromMesh(mesh)
			body.setMassProperties({ mass: 1 })
			body.setLinearVelocity(new Vector3(2.4, 0.35, -1.2))
			body.setAngularVelocity(new Vector3(0.42, -0.24, 0.31))

			const profile = getPhysicsGuidanceProfile(20)
			const localResolvedFaceNormal = Vector3.Up()
			const restDirection = Vector3.Up()
			const initialAngle = getFaceAlignment(
				getRotation(mesh),
				localResolvedFaceNormal,
				restDirection
			).angle
			assert.ok(initialAngle > 0.8, `test must begin visibly misaligned, got ${String(initialAngle)}`)

			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			const orientationSteps: number[] = []
			let greatestFlightVelocityDelta = 0
			let previousRotation = getRotation(mesh)
			const totalSteps = 360

			for(let index = 0; index < totalSteps; index += 1) {
				const phase = index < 48 ? 'flight' : 'settle'
				const progress = Math.min(1, index / 180)
				const currentRotation = getRotation(mesh)
				const currentVelocity = body.getAngularVelocity() ?? Vector3.Zero()
				const guided = getFaceGuidedAngularVelocity(
					currentVelocity,
					currentRotation,
					localResolvedFaceNormal,
					restDirection,
					profile,
					progress,
					STEP_MS,
					phase
				)

				if(phase === 'flight') {
					const velocityDelta = guided.velocity.subtract(currentVelocity).length()
					greatestFlightVelocityDelta = Math.max(greatestFlightVelocityDelta, velocityDelta)
					assert.ok(
						velocityDelta <= profile.flightMaxAngularAcceleration * STEP_SECONDS + 1e-8,
						`flight correction exceeded its per-step acceleration cap: ${String(velocityDelta)}`
					)
				}

				body.setAngularVelocity(guided.velocity)
				physics._step(STEP_SECONDS)
				const nextRotation = getRotation(mesh)
				orientationSteps.push(quaternionDistance(previousRotation, nextRotation))
				previousRotation = nextRotation
			}

			const finalRotation = getRotation(mesh)
			const finalAngle = getFaceAlignment(
				finalRotation,
				localResolvedFaceNormal,
				restDirection
			).angle
			const tailSteps = orientationSteps.slice(-30)
			const largestTailStep = Math.max(...tailSteps)

			assert.ok(greatestFlightVelocityDelta > 0, 'guidance should apply a real micro-correction')
			assert.ok(
				finalAngle <= profile.angleThreshold,
				`resolved face left the safe top cone: ${String(finalAngle)} rad`
			)
			assert.ok(
				largestTailStep < 0.004,
				`orientation still contained a visible final jump: ${String(largestTailStep)} rad`
			)
			assert.ok(
				orientationSteps.at(-1)! <= largestTailStep,
				'the final frame must remain part of the continuous physical convergence'
			)
			assert.ok(mesh.position.x > 3, 'the body should remain a genuinely launched dynamic body')
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('steers an actual d20-like convex hull while it remains in contact with a high-friction floor', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok))

		try {
			createStaticPhysicsBox(
				scene,
				'display-floor',
				{ width: 20, height: 2, depth: 20 },
				new Vector3(0, -1, 0),
				{ friction: 0.86, restitution: 0.16 }
			)
			const mesh = CreateIcoSphere('contact-d20', {
				radius: 0.65,
				subdivisions: 1,
				flat: true
			}, scene)
			mesh.position.set(-1.5, 2.2, 0.6)
			mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(0.3, -0.18, 0.12)
			const faceNormals = getIcoFaceNormals(mesh)
			const body = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene)
			const shape = new PhysicsShapeConvexHull(mesh, scene)
			shape.material = { friction: 0.86, restitution: 0.16 }
			body.shape = shape
			body.setMassProperties({ mass: 1.18 })
			body.setLinearDamping(0.28)
			body.setAngularDamping(0.24)
			body.setLinearVelocity(new Vector3(1.1, 0.2, -0.35))
			body.setAngularVelocity(new Vector3(0.3, -0.22, 0.26))

			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			const contactStepSeconds = 1 / 90
			const contactStepMs = contactStepSeconds * 1000
			for(let index = 0; index < 180; index += 1) physics._step(contactStepSeconds)

			const settledRotation = getRotation(mesh)
			const localResolvedFaceNormal = faceNormals.reduce((selected, candidate) => {
				const selectedAngle = getFaceAlignment(
					settledRotation,
					selected,
					Vector3.Up()
				).angle
				const candidateAngle = getFaceAlignment(
					settledRotation,
					candidate,
					Vector3.Up()
				).angle
				return Math.abs(candidateAngle - 0.72) < Math.abs(selectedAngle - 0.72)
					? candidate
					: selected
			}, faceNormals[0]!)
			const profile = getPhysicsGuidanceProfile(20)
			const initialContactAngle = getFaceAlignment(
				settledRotation,
				localResolvedFaceNormal,
				Vector3.Up()
			).angle
			assert.ok(initialContactAngle > 0.5 && initialContactAngle < 0.9)

			const samples: number[] = []
			for(let index = 0; index < 360; index += 1) {
				const currentRotation = getRotation(mesh)
				const guided = getFaceGuidedAngularVelocity(
					body.getAngularVelocity() ?? Vector3.Zero(),
					currentRotation,
					localResolvedFaceNormal,
					Vector3.Up(),
					profile,
					Math.min(1, index * contactStepMs / profile.durationMs),
					contactStepMs,
					'settle'
				)
				body.setAngularVelocity(guided.velocity)
				body.setLinearVelocity(getGuidedLinearVelocity(
					body.getLinearVelocity() ?? Vector3.Zero(),
					profile,
					Math.min(1, index * contactStepMs / profile.durationMs),
					contactStepMs
				))
				physics._step(contactStepSeconds)
				if(index % 90 === 89) {
					samples.push(getFaceAlignment(
						getRotation(mesh),
						localResolvedFaceNormal,
						Vector3.Up()
					).angle)
				}
			}

			const finalAngle = samples.at(-1)!
			assert.ok(
				finalAngle < profile.angleThreshold,
				`floor-contact guidance plateaued (radians after each second: ${samples.map(value => value.toFixed(3)).join(', ')})`
			)
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('lands varied results using the serialized d20 collider and decelerated flight plan', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const model = loadDefaultModel()
		const visualSource = model.meshes.find(mesh => mesh.name === 'd20')
		const colliderSource = model.meshes.find(mesh => mesh.name === 'd20_collider')
		const faceMap = model.colliderFaceMap.d20
		assert.ok(visualSource && colliderSource && faceMap)
		const profile = getPhysicsGuidanceProfile(20)
		const cases = [
			{ value: 1, height: 6.4, yaw: -2.1, spin: new Vector3(1.1, -0.8, 1.4) },
			{ value: 4, height: 6.4, yaw: -1.2, spin: new Vector3(-1.6, 1.2, -0.9) },
			{ value: 7, height: 6.4, yaw: -0.35, spin: new Vector3(2.2, 1.8, -1.1) },
			{ value: 10, height: 6.4, yaw: 0.5, spin: new Vector3(-1.3, -2.1, 1.9) },
			{ value: 13, height: 6.4, yaw: 1.35, spin: new Vector3(1.9, -0.7, -2.25) },
			{ value: 20, height: 6.4, yaw: 2.2, spin: new Vector3(-2.25, 1.45, 0.75) }
		] as const

		const simulate = (testCase: typeof cases[number]) => {
			const engine = new NullEngine()
			const scene = new Scene(engine)
			scene.enablePhysics(new Vector3(0, -9.81 * 1.3, 0), new HavokPlugin(true, havok))
			try {
				createStaticPhysicsBox(
					scene,
					'display-floor',
					{ width: 40, height: 2, depth: 40 },
					new Vector3(0, -1, 0),
					{ friction: 0.54, restitution: 0.29 }
				)
				const mesh = parseModelMesh(visualSource, scene)
				const collider = parseModelMesh(colliderSource, scene)
				collider.position.setAll(0)
				collider.rotationQuaternion = Quaternion.Identity()
				collider.scaling.setAll(5 * 1.02)
				collider.setEnabled(true)
				collider.computeWorldMatrix(true)
				const canonicalTarget = getTargetQuaternion(collider, faceMap, testCase.value, false)
				const target = Quaternion.RotationAxis(Vector3.Up(), testCase.yaw)
					.multiply(canonicalTarget)
					.normalize()
				const supportHeight = getSupportHeight(collider, canonicalTarget) * 5 * 1.02
				const { localNormal } = getResultFaceFrame(target, 20)
				const startPosition = new Vector3(-4.2, testCase.height, 0.8)
				const landingTarget = new Vector3(0.3, supportHeight, 0)
				const launchVelocity = createThrownLinearVelocity(startPosition, landingTarget, 5.15)
				const flightTravel = landingTarget.subtract(startPosition)
				const flightSeconds = estimateBallisticFlightSeconds(
					testCase.height,
					supportHeight,
					launchVelocity.y,
					9.81 * 1.3
				)
				const thrownSpin = getThrownAngularVelocity(
					testCase.spin,
					flightTravel,
					Math.hypot(launchVelocity.x, launchVelocity.z),
					0.62,
					20
				)
				const launchSpin = getVisibleFlightAngularVelocity(
					thrownSpin,
					flightTravel,
					flightSeconds,
					20,
					5.8
				)
				const settleRollAxis = getLandingRollAxis(flightTravel)
					.scale(0.35)
					.add(Vector3.Up().scale(0.65))
					.normalize()
				const landingApproachQuaternion = createLandingApproachQuaternion(
					target,
					flightTravel,
					profile.landingApproachAngle
				)
				const flightStartQuaternion = createPrecomputedFlightQuaternion(
					landingApproachQuaternion,
					launchSpin,
					flightSeconds
				)
				mesh.position.copyFrom(startPosition)
				mesh.scaling.setAll(5)
				mesh.rotationQuaternion = flightStartQuaternion.clone()
				mesh.setEnabled(true)
				mesh.computeWorldMatrix(true)
				const body = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene)
				const shape = new PhysicsShapeConvexHull(collider, scene)
				shape.material = { friction: 0.54, restitution: 0.29 }
				body.shape = shape
				body.setMassProperties({ mass: 1.08 * 1.18 })
				body.setLinearDamping(0.1)
				body.setAngularDamping(0)
				body.setLinearVelocity(launchVelocity)
				body.setAngularVelocity(getPlannedFlightSpin(
					launchSpin,
					0,
					flightSeconds,
					profile.landingSpinRetention
				))
				let contacted = false
				body.setCollisionCallbackEnabled(true)
				body.getCollisionObservable().add(() => {
					contacted = true
				})
				const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
				const stepSeconds = 1 / 90
				const stepMs = stepSeconds * 1000
				let beforeContactAngle = Number.NaN
				let contactAngle = Number.NaN
				let contactTiltSpeed = Number.NaN
				let contactAngularSpeed = Number.NaN
				let contactElapsedSeconds = Number.NaN
				let contactTopValue = -1
				let horizontalSpeedBeforeContact = Number.NaN
				let verticalSpeedBeforeContact = Number.NaN
				let correctionVelocity = Vector3.Zero()
				const initialFaceAngle = getFaceAlignment(
					flightStartQuaternion,
					localNormal,
					Vector3.Up()
				).angle
				let previousFlightRotation = getRotation(mesh)
				let previousFaceDirection = localNormal
					.applyRotationQuaternion(previousFlightRotation)
					.normalize()
				let accumulatedFlightRotation = 0
				let accumulatedFaceTravel = 0
				let visiblyRotatingSteps = 0
				let flightSteps = 0
				let maximumFlightStep = 0
				for(let index = 0; index < 180; index += 1) {
					const elapsedSeconds = index * stepSeconds
					const rotation = getRotation(mesh)
					beforeContactAngle = getFaceAlignment(
						rotation,
						localNormal,
						Vector3.Up()
					).angle
					const plannedQuaternion = getPlannedFlightQuaternion(
						flightStartQuaternion,
						launchSpin,
						elapsedSeconds,
						flightSeconds,
						profile.landingSpinRetention
					)
					const plannedVelocity = getPlannedFlightSpin(
						launchSpin,
						elapsedSeconds,
						flightSeconds,
						profile.landingSpinRetention
					)
					const tracked = getPlannedFlightAngularVelocity(
						body.getAngularVelocity() ?? Vector3.Zero(),
						rotation,
						localNormal,
						plannedQuaternion,
						plannedVelocity,
						correctionVelocity,
						Math.max(0, flightSeconds - elapsedSeconds),
						profile,
						Math.min(1, (index + 1) * stepSeconds / flightSeconds),
						stepMs
					)
					correctionVelocity = tracked.correctionVelocity
					body.setAngularVelocity(tracked.velocity)
					const flightProgress = Math.min(1, (index + 1) * stepSeconds / flightSeconds)
					const softLandingVelocity = getSoftLandingLinearVelocity(
						body.getLinearVelocity() ?? Vector3.Zero(),
						mesh.position,
						landingTarget,
						profile,
						flightProgress,
						Math.max(2.2, Math.hypot(launchVelocity.x, launchVelocity.z) * 0.4)
					)
					verticalSpeedBeforeContact = softLandingVelocity.y
					horizontalSpeedBeforeContact = Math.hypot(
						softLandingVelocity.x,
						softLandingVelocity.z
					)
					body.setLinearVelocity(softLandingVelocity)
					physics._step(stepSeconds)
					const sampledRotation = getRotation(mesh)
					const rotationStep = 2 * Math.acos(Math.min(
						1,
						Math.abs(Quaternion.Dot(previousFlightRotation, sampledRotation))
					))
					const sampledFaceDirection = localNormal
						.applyRotationQuaternion(sampledRotation)
						.normalize()
					const faceStep = Math.acos(Math.max(-1, Math.min(
						1,
						Vector3.Dot(previousFaceDirection, sampledFaceDirection)
					)))
					accumulatedFlightRotation += rotationStep
					accumulatedFaceTravel += faceStep
					maximumFlightStep = Math.max(maximumFlightStep, rotationStep)
					if(rotationStep >= 0.01) visiblyRotatingSteps++
					flightSteps++
					previousFlightRotation = sampledRotation
					previousFaceDirection = sampledFaceDirection
					if(contacted) {
						contactElapsedSeconds = (index + 1) * stepSeconds
						const contactRotation = getRotation(mesh)
						contactAngle = getFaceAlignment(
							contactRotation,
							localNormal,
							Vector3.Up()
						).angle
						const contactVelocity = body.getAngularVelocity() ?? Vector3.Zero()
						const faceDirection = localNormal
							.applyRotationQuaternion(contactRotation)
							.normalize()
						contactTiltSpeed = contactVelocity
							.subtract(faceDirection.scale(Vector3.Dot(contactVelocity, faceDirection)))
							.length()
						contactAngularSpeed = contactVelocity.length()
						contactTopValue = getTopFaceValue(collider, faceMap, contactRotation)
						break
					}
				}
				assert.ok(contacted, `value ${String(testCase.value)} did not contact the floor`)
				body.setAngularDamping(0.08)
				let lowMotionStartedMs: number | undefined
				let settledAfterContactMs: number | undefined
				for(let index = 0; index < 360; index += 1) {
					if(index >= 12) {
						const guidanceProgress = Math.min(1, (index - 12) * stepMs / profile.durationMs)
						const sustainedVelocity = getSustainedRollAngularVelocity(
							body.getAngularVelocity() ?? Vector3.Zero(),
							settleRollAxis,
							profile,
							(index - 12) * stepMs,
							stepMs
						)
						const guided = getFaceGuidedAngularVelocity(
							sustainedVelocity,
							getRotation(mesh),
							localNormal,
							Vector3.Up(),
							profile,
							guidanceProgress,
							stepMs,
							'settle'
						)
						body.setAngularVelocity(guided.velocity)
						body.setLinearVelocity(getGuidedLinearVelocity(
							body.getLinearVelocity() ?? Vector3.Zero(),
							profile,
							guidanceProgress,
							stepMs
						))
					}
					physics._step(stepSeconds)
					const postContactElapsedMs = (index + 1) * stepMs
					const angularSpeed = (body.getAngularVelocity() ?? Vector3.Zero()).length()
					const linearSpeed = (body.getLinearVelocity() ?? Vector3.Zero()).length()
					if(
						angularSpeed <= 0.08
						&& linearSpeed <= 0.08
					) {
						lowMotionStartedMs ??= postContactElapsedMs
						if(postContactElapsedMs - lowMotionStartedMs >= 150) {
							settledAfterContactMs ??= lowMotionStartedMs
						}
					} else {
						lowMotionStartedMs = undefined
						settledAfterContactMs = undefined
					}
				}
				const restRotation = getRotation(mesh)
				return {
					value: testCase.value,
					initialFaceAngle,
					accumulatedFlightRotation,
					accumulatedFaceTravel,
					visiblyRotatingRatio: visiblyRotatingSteps / Math.max(1, flightSteps),
					maximumFlightStep,
					contactElapsedSeconds,
					verticalSpeedBeforeContact,
					beforeContactAngle,
					contactAngle,
					contactTiltSpeed,
					contactAngularSpeed,
					contactTopValue,
					contactHorizontalSpeed: horizontalSpeedBeforeContact,
					initialHorizontalSpeed: Math.hypot(launchVelocity.x, launchVelocity.z),
					settledAfterContactMs,
					restAngle: getFaceAlignment(
						restRotation,
						localNormal,
						Vector3.Up()
					).angle,
					restTopValue: getTopFaceValue(collider, faceMap, restRotation),
					restAngularSpeed: (body.getAngularVelocity() ?? Vector3.Zero()).length(),
					restLinearSpeed: (body.getLinearVelocity() ?? Vector3.Zero()).length()
				}
			} finally {
				scene.dispose()
				engine.dispose()
			}
		}

		const results = cases.map(simulate)
		for(const result of results) {
			assert.ok(
				result.initialFaceAngle >= 0.9,
				`value ${String(result.value)} exposed its resolved face at launch`
			)
			assert.ok(
				result.accumulatedFlightRotation >= 11,
				`value ${String(result.value)} rotated only ${String(result.accumulatedFlightRotation)}rad in flight`
			)
			assert.ok(
				result.accumulatedFaceTravel >= 5.5,
				`value ${String(result.value)} tumbled only ${String(result.accumulatedFaceTravel)}rad in flight`
			)
			assert.ok(result.visiblyRotatingRatio >= 0.7)
			assert.ok(result.maximumFlightStep <= 0.3)
			assert.ok(
				result.contactElapsedSeconds >= 0.7 && result.contactElapsedSeconds <= 0.95,
				`value ${String(result.value)} soft landing took ${String(result.contactElapsedSeconds)}s`
			)
			assert.ok(
				result.contactHorizontalSpeed >= Math.max(2.2, result.initialHorizontalSpeed * 0.35),
				`value ${String(result.value)} lost the launch impulse before contact`
			)
			assert.ok(
				result.verticalSpeedBeforeContact >= -profile.maxLandingVerticalSpeed - 1e-6,
				`value ${String(result.value)} exceeded the landing speed cap`
			)
			assert.ok(
				result.beforeContactAngle <= profile.landingApproachAngle + 0.12
					&& result.contactAngle < 0.32,
				`value ${String(result.value)} exceeded the safe contact cone (before=${String(result.beforeContactAngle)}, contact=${String(result.contactAngle)}, top=${String(result.contactTopValue)}, spin=${String(result.contactAngularSpeed)})`
			)
			assert.equal(result.contactTopValue, result.value)
			assert.ok(Number.isFinite(result.contactTiltSpeed))
			assert.ok(
				result.contactAngularSpeed >= 0.2,
				`value ${String(result.value)} reached contact without visible spin`
			)
			assert.ok(
				result.settledAfterContactMs === undefined || result.settledAfterContactMs >= 700,
				`value ${String(result.value)} stopped after only ${String(result.settledAfterContactMs)}ms; matrix ${JSON.stringify(results.map(sample => ({ value: sample.value, settled: sample.settledAfterContactMs, contactSpin: sample.contactAngularSpeed })))}`
			)
			assert.equal(result.restTopValue, result.value)
			assert.ok(
				result.restAngle < profile.angleThreshold,
				`value ${String(result.value)} rested ${String(result.restAngle)}rad off target`
			)
			assert.ok(result.restAngularSpeed < profile.maxSettleAngularVelocity)
			assert.ok(result.restLinearSpeed < profile.maxSettleLinearVelocity)
		}
	})
})
