import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import {
	canStartFinalLock,
	canBodyContactActAsSupport,
	chooseShortestQuaternion,
	createLandingApproachQuaternion,
	createPrecomputedFlightQuaternion,
	getFaceAlignment,
	getFaceGuidedAngularVelocity,
	getFinalLockDurationMs,
	getGuidedLinearVelocity,
	getLandingRollAxis,
	getPlannedFlightAngularVelocity,
	getPlannedFlightQuaternion,
	getPlannedFlightSpin,
	getPhysicsGuidanceProfile,
	getPhysicsMassMultiplier,
	getQuaternionCorrection,
	getResultFaceFrame,
	getSoftLandingLinearVelocity,
	getSustainedRollAngularVelocity,
	getThrownAngularVelocity,
	getVisibleFlightAngularVelocity,
	getTolerantFaceAlignment,
	shouldStartGuidance
} from './physicsGuidance'

const EPSILON = 1e-9

const assertApproximately = (actual: number, expected: number, epsilon = EPSILON): void => {
	assert.ok(
		Math.abs(actual - expected) <= epsilon,
		`expected ${String(actual)} to be within ${String(epsilon)} of ${String(expected)}`
	)
}

const assertVectorApproximately = (actual: Vector3, expected: Vector3, epsilon = EPSILON): void => {
	assertApproximately(actual.x, expected.x, epsilon)
	assertApproximately(actual.y, expected.y, epsilon)
	assertApproximately(actual.z, expected.z, epsilon)
}

const assertQuaternionEquivalent = (
	actual: Quaternion,
	expected: Quaternion,
	epsilon = EPSILON
): void => {
	const normalizedActual = actual.clone().normalize()
	const normalizedExpected = expected.clone().normalize()
	assertApproximately(Math.abs(Quaternion.Dot(normalizedActual, normalizedExpected)), 1, epsilon)
}

describe('physics guidance profiles', () => {
	it('preserves the per-die timing and correction tuning', () => {
		const expectations = [
			[4, 580, 1500, 1900, 4.6, 5.5, 2.8],
			[6, 540, 1400, 1850, 7.2, 6.1, 3.2],
			[8, 500, 1320, 1800, 7.2, 7, 3.2],
			[10, 500, 1300, 1750, 8, 7.2, 3.2],
			[12, 500, 1320, 1800, 7.2, 7, 3.2],
			[20, 460, 1220, 1700, 8, 7.8, 3.2],
			[100, 500, 1300, 1750, 8, 7.2, 3.2]
		] as const

		for(const [
			sides,
			minElapsedMs,
			forceGuideElapsedMs,
			durationMs,
			angularStrength,
			maxAngularVelocity,
			maxGuideStartHeight
		] of expectations) {
			const actual = getPhysicsGuidanceProfile(sides)
			assert.deepEqual(
				{
					minElapsedMs: actual.minElapsedMs,
					forceGuideElapsedMs: actual.forceGuideElapsedMs,
					durationMs: actual.durationMs,
					angularStrength: actual.angularStrength,
					maxAngularVelocity: actual.maxAngularVelocity,
					maxGuideStartHeight: actual.maxGuideStartHeight
				},
				{
					minElapsedMs,
					forceGuideElapsedMs,
					durationMs,
					angularStrength,
					maxAngularVelocity,
					maxGuideStartHeight
				},
				`d${String(sides)} profile changed`
			)
		}
	})

	it('uses the longer final lock and bounded continuous-guidance limits', () => {
		const expectations = [
			[2, 1.6, 12, 220, 0.22, 0.28, 0.6, 1900, 0.1],
			[4, 2.2, 18, 200, 0.24, 0.32, 0.75, 2400, 0.18],
			[6, 2.2, 32, 180, 0.28, 0.38, 0.75, 2300, 0.28],
			[8, 2.2, 32, 180, 0.28, 0.38, 0.75, 2300, 0.28],
			[10, 2.2, 36, 180, 0.28, 0.38, 0.75, 2300, 0.28],
			[12, 2.2, 32, 180, 0.28, 0.38, 0.75, 2300, 0.28],
			[20, 2.8, 36, 180, 0.28, 0.38, 0.75, 2400, 0.32],
			[100, 2.2, 36, 180, 0.28, 0.38, 0.75, 2300, 0.28]
		] as const

		for(const [
			sides,
			flightMaxAngularAcceleration,
			settleMaxAngularAcceleration,
			stableDurationMs,
			maxSettleLinearVelocity,
			maxSettleAngularVelocity,
			finalLockMaxAngularSpeed,
			minFinalLockElapsedMs,
			landingSpinRetention
		] of expectations) {
			const actual = getPhysicsGuidanceProfile(sides)
			assert.deepEqual({
				finalLockDurationMs: actual.finalLockDurationMs,
				timeoutExtensionMs: actual.timeoutExtensionMs,
				flightAngularStrength: actual.flightAngularStrength,
				flightMaxAngularAcceleration: actual.flightMaxAngularAcceleration,
				settleMaxAngularAcceleration: actual.settleMaxAngularAcceleration,
				stableDurationMs: actual.stableDurationMs,
				minFinalLockElapsedMs: actual.minFinalLockElapsedMs,
				maxSettleLinearVelocity: actual.maxSettleLinearVelocity,
				maxSettleAngularVelocity: actual.maxSettleAngularVelocity,
				landingSpinRetention: actual.landingSpinRetention,
				finalLockMaxAngularSpeed: actual.finalLockMaxAngularSpeed,
				forcedLockMaxAngularSpeed: actual.forcedLockMaxAngularSpeed
			}, {
				finalLockDurationMs: 220,
				timeoutExtensionMs: 900,
				flightAngularStrength: 0.72,
				flightMaxAngularAcceleration,
				settleMaxAngularAcceleration,
				stableDurationMs,
				minFinalLockElapsedMs,
				maxSettleLinearVelocity,
				maxSettleAngularVelocity,
				landingSpinRetention,
				finalLockMaxAngularSpeed,
				forcedLockMaxAngularSpeed: 1.8
			}, `d${String(sides)} continuous-guidance limits changed`)
		}
	})

	it('keeps contact rules and mass multipliers stable', () => {
		const brakeStarts = new Map<number, number>([
			[2, 0.8], [4, 0.83], [6, 0.86], [8, 0.86],
			[10, 0.85], [12, 0.86], [20, 0.92], [100, 0.85]
		])
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const actual = getPhysicsGuidanceProfile(sides)
			assert.equal(actual.minGroundImpacts, 1)
			assert.equal(actual.bounceGraceMs, 130)
			assertApproximately(actual.angleThreshold, sides === 2 ? Math.PI / 9 : Math.PI / 12)
			assertApproximately(actual.settleDeadZoneAngle, sides === 2 ? Math.PI / 12 : Math.PI / 18)
			assert.equal(actual.maxLockHeight, 2.05)
			assert.equal(actual.bodyContactSettleDelayMs, 180)
			assert.equal(actual.timeoutWindowMs, 650)
			assert.equal(actual.landingBrakeStart, brakeStarts.get(sides))
		}

		assert.deepEqual(
			[2, 4, 6, 8, 10, 12, 20, 100].map(sides => getPhysicsMassMultiplier(sides)),
			[0.7, 0.82, 1, 0.92, 0.88, 1.08, 1.18, 0.88]
		)
		assert.equal(getPhysicsMassMultiplier(30), 1)
	})
})

describe('resolved-face alignment', () => {
	it('uses Down as the d4 rest direction and Up for every other supported die', () => {
		const target = Quaternion.RotationYawPitchRoll(0.7, -0.4, 1.2).normalize()
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const frame = getResultFaceFrame(target, sides)
			const expectedRestDirection = sides === 4 ? Vector3.Down() : Vector3.Up()
			assertVectorApproximately(frame.restDirection, expectedRestDirection)
			assert.ok(
				Vector3.Dot(
					frame.localNormal.applyRotationQuaternion(target).normalize(),
					expectedRestDirection
				) > 1 - EPSILON,
				`d${String(sides)} target must put its resolved face on the rest direction`
			)
		}
	})

	it('corrects only face tilt while preserving yaw around the resting face', () => {
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			for(const yaw of [-2.1, 0.7]) {
				const resolvedTarget = Quaternion.RotationYawPitchRoll(yaw, 0, 0).normalize()
				const frame = getResultFaceFrame(resolvedTarget, sides)
				const tilted = Quaternion.RotationAxis(Vector3.Right(), 0.83)
					.multiply(resolvedTarget)
					.normalize()
				const alignment = getFaceAlignment(
					tilted,
					frame.localNormal,
					frame.restDirection
				)

				assertApproximately(alignment.angle, 0.83, 1e-8)
				assertQuaternionEquivalent(alignment.targetQuaternion, resolvedTarget, 1e-8)
				assert.ok(
					Vector3.Dot(
						frame.localNormal
							.applyRotationQuaternion(alignment.targetQuaternion)
							.normalize(),
						frame.restDirection
					) > 1 - 1e-8
				)
			}
		}
	})

	it('keeps an already-correct face orientation instead of snapping to the full result pose', () => {
		const resultTarget = Quaternion.Identity()
		const frame = getResultFaceFrame(resultTarget, 20)
		const yawed = Quaternion.RotationAxis(Vector3.Up(), 1.37).normalize()
		const alignment = getFaceAlignment(yawed, frame.localNormal, frame.restDirection)

		assert.equal(alignment.angle, 0)
		assertQuaternionEquivalent(alignment.targetQuaternion, yawed)
	})

	it('keeps a naturally tilted top face and only corrects poses outside the safe cone', () => {
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const profile = getPhysicsGuidanceProfile(sides)
			const frame = getResultFaceFrame(Quaternion.Identity(), sides)
			for(const yaw of [-1.2, 1.1]) {
				const safePose = Quaternion.RotationAxis(Vector3.Forward(), 0.03)
					.multiply(Quaternion.RotationAxis(Vector3.Up(), yaw))
					.normalize()
				const natural = getTolerantFaceAlignment(
					safePose,
					frame.localNormal,
					frame.restDirection,
					profile.angleThreshold
				)
				assert.equal(natural.angle, 0)
				assertApproximately(natural.remainingAngle, 0.03, 1e-8)
				assertQuaternionEquivalent(natural.targetQuaternion, safePose, 1e-10)

				const tiltedPose = Quaternion.RotationAxis(
					Vector3.Forward(),
					profile.settleDeadZoneAngle + 0.12
				)
					.multiply(Quaternion.RotationAxis(Vector3.Up(), yaw))
					.normalize()
				const corrected = getTolerantFaceAlignment(
					tiltedPose,
					frame.localNormal,
					frame.restDirection,
					profile.settleDeadZoneAngle
				)
				const residual = getFaceAlignment(
					corrected.targetQuaternion,
					frame.localNormal,
					frame.restDirection
				)
				assertApproximately(corrected.remainingAngle, profile.settleDeadZoneAngle, 1e-8)
				assertApproximately(residual.angle, profile.settleDeadZoneAngle, 1e-8)
			}
		}
	})
})

describe('precomputed flight orientation', () => {
	it('reaches the resolved target under its unperturbed world-space spin', () => {
		const target = Quaternion.RotationYawPitchRoll(-0.7, 1.1, 0.35).normalize()
		const cases = [
			{ velocity: new Vector3(3.2, -1.7, 2.4), seconds: 0.83 },
			{ velocity: new Vector3(-0.4, 5.6, 1.2), seconds: 1.27 },
			{ velocity: new Vector3(0, 0, -7.1), seconds: 0.45 }
		]

		for(const { velocity, seconds } of cases) {
			const start = createPrecomputedFlightQuaternion(target, velocity, seconds)
			const speed = velocity.length()
			const forwardFlight = Quaternion.RotationAxis(
				velocity.scale(1 / speed),
				speed * seconds
			)
			const landed = forwardFlight.multiply(start).normalize()
			assertQuaternionEquivalent(landed, target, 1e-8)
		}
	})

	it('tracks the moving plan without braking its feed-forward launch spin', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const target = Quaternion.RotationYawPitchRoll(-0.4, 0.9, 0.2).normalize()
		const velocity = new Vector3(0.52, -0.31, 0.44)
		const seconds = 0.92
		const start = createPrecomputedFlightQuaternion(target, velocity, seconds)
		const elapsedSeconds = 0.37
		const planned = getPlannedFlightQuaternion(start, velocity, elapsedSeconds, seconds)
		const plannedSpin = getPlannedFlightSpin(velocity, elapsedSeconds, seconds)
		const frame = getResultFaceFrame(target, 20)
		const guided = getPlannedFlightAngularVelocity(
			plannedSpin,
			planned,
			frame.localNormal,
			planned,
			plannedSpin,
			Vector3.Zero(),
			seconds - elapsedSeconds,
			profile,
			elapsedSeconds / seconds,
			1000 / 120
		)

		assert.equal(guided.angle, 0)
		assertVectorApproximately(guided.velocity, plannedSpin)
		const plannedFaceDirection = frame.localNormal
			.applyRotationQuaternion(planned)
			.normalize()
		const tiltDisturbance = Vector3.Cross(
			plannedFaceDirection,
			Math.abs(plannedFaceDirection.y) < 0.9 ? Vector3.Up() : Vector3.Right()
		).normalize().scale(4)
		const recovered = getPlannedFlightAngularVelocity(
			plannedSpin.add(tiltDisturbance),
			planned,
			frame.localNormal,
			planned,
			plannedSpin,
			Vector3.Zero(),
			seconds - elapsedSeconds,
			profile,
			elapsedSeconds / seconds,
			1000 / 120
		)
		assertVectorApproximately(recovered.velocity, plannedSpin, 1e-8)
		assertVectorApproximately(getPlannedFlightSpin(velocity, seconds, seconds), Vector3.Zero())
		assertQuaternionEquivalent(
			getPlannedFlightQuaternion(start, velocity, seconds, seconds),
			target,
			1e-8
		)
	})

	it('reaches the same resolved pose while retaining per-profile spin at contact', () => {
		const target = Quaternion.RotationYawPitchRoll(-0.6, 0.8, 0.25).normalize()
		const averageVelocity = new Vector3(1.3, -0.9, 1.7)
		const seconds = 0.86
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const profile = getPhysicsGuidanceProfile(sides)
			const start = createPrecomputedFlightQuaternion(target, averageVelocity, seconds)
			const landed = getPlannedFlightQuaternion(
				start,
				averageVelocity,
				seconds,
				seconds,
				profile.landingSpinRetention
			)
			const contactSpin = getPlannedFlightSpin(
				averageVelocity,
				seconds,
				seconds,
				profile.landingSpinRetention
			)

			assertQuaternionEquivalent(landed, target, 1e-8)
			const plateau = 0.72
			const normalization = 1 / (
				plateau + (1 - plateau) * (1 + profile.landingSpinRetention) / 2
			)
			assertVectorApproximately(
				contactSpin,
				averageVelocity.scale(profile.landingSpinRetention * normalization),
				1e-8
			)
			assert.ok(contactSpin.length() > 0)
		}
	})

	it('turns the historical off-centre impulse into a precomputed roll kick', () => {
		const target = Quaternion.RotationYawPitchRoll(0.4, -0.2, 0.7).normalize()
		const travel = new Vector3(7, 0, -1.2)
		const rollAxis = getLandingRollAxis(travel)
		const seeded = rollAxis.scale(-0.8).add(Vector3.Up().scale(1.1))
		const d20Kick = getThrownAngularVelocity(seeded, travel, 12, 0.62, 20)
		const coinKick = getThrownAngularVelocity(seeded, travel, 12, 0.62, 2)

		assert.ok(Vector3.Dot(d20Kick, rollAxis) < Vector3.Dot(seeded, rollAxis))
		assert.ok(d20Kick.subtract(seeded).length() <= 5.5 + EPSILON)
		assert.ok(coinKick.subtract(seeded).length() <= 1.8 + EPSILON)
		const flightSeconds = 0.58
		const start = createPrecomputedFlightQuaternion(target, d20Kick, flightSeconds)
		assertQuaternionEquivalent(
			getPlannedFlightQuaternion(start, d20Kick, flightSeconds, flightSeconds),
			target,
			1e-8
		)
	})

	it('keeps a visible tumble plateau across the resolved flight', () => {
		const sides = 20
		const seconds = 0.75
		const travel = new Vector3(7, 0, -1.2)
		const rollAxis = getLandingRollAxis(travel)
		const seeded = new Vector3(2.2, 3.4, -1.7)
		const thrown = getThrownAngularVelocity(seeded, travel, 13, 0.62, sides)
		const velocity = getVisibleFlightAngularVelocity(thrown, travel, seconds, sides, 5.8)
		const turns = velocity.length() * seconds / (Math.PI * 2)
		assert.ok(turns >= 2.25 && turns <= 2.5)
		assert.ok(Math.abs(Vector3.Dot(velocity.normalizeToNew(), rollAxis)) >= 0.9)
		assert.ok(getPlannedFlightSpin(
			velocity,
			seconds,
			seconds,
			getPhysicsGuidanceProfile(sides).landingSpinRetention
		).length() <= 2.6 + EPSILON)

		const target = Quaternion.RotationYawPitchRoll(0.35, -0.7, 0.2).normalize()
		const frame = getResultFaceFrame(target, sides)
		const start = createPrecomputedFlightQuaternion(target, velocity, seconds)
		assert.ok(getFaceAlignment(
			start,
			frame.localNormal,
			frame.restDirection
		).angle >= 0.9)
		let previous = start
		let previousNormal = frame.localNormal.applyRotationQuaternion(start).normalize()
		let accumulatedRotation = 0
		let normalTravel = 0
		for(let index = 1; index <= 90; index += 1) {
			const current = getPlannedFlightQuaternion(
				start,
				velocity,
				seconds * index / 90,
				seconds,
				getPhysicsGuidanceProfile(sides).landingSpinRetention
			)
			accumulatedRotation += 2 * Math.acos(Math.min(
				1,
				Math.abs(Quaternion.Dot(previous, current))
			))
			const currentNormal = frame.localNormal.applyRotationQuaternion(current).normalize()
			normalTravel += Math.acos(Math.max(-1, Math.min(1,
				Vector3.Dot(previousNormal, currentNormal),
			)))
			previous = current
			previousNormal = currentNormal
		}
		assert.ok(accumulatedRotation >= Math.PI * 3.8)
		assert.ok(normalTravel >= Math.PI * 3)
		assertQuaternionEquivalent(previous, target, 1e-8)
	})

	it('starts every supported die away from its resolved resting face', () => {
		const seconds = 0.75
		const travel = new Vector3(6.5, 0, -1.4)
		const target = Quaternion.RotationYawPitchRoll(-0.45, 0.7, -0.2).normalize()
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const thrown = getThrownAngularVelocity(
				new Vector3(2.4, -1.8, 3.1),
				travel,
				13,
				0.62,
				sides
			)
			const velocity = getVisibleFlightAngularVelocity(
				thrown,
				travel,
				seconds,
				sides,
				5.8
			)
			const start = createPrecomputedFlightQuaternion(target, velocity, seconds)
			const frame = getResultFaceFrame(target, sides)
			assert.ok(
				getFaceAlignment(start, frame.localNormal, frame.restDirection).angle >= 0.9,
				`d${String(sides)} exposed the resolved face before launch`
			)
			assertQuaternionEquivalent(
				getPlannedFlightQuaternion(
					start,
					velocity,
					seconds,
					seconds,
					getPhysicsGuidanceProfile(sides).landingSpinRetention
				),
				target,
				1e-8
			)
		}
	})

	it('approaches on a safe edge tilt instead of landing mathematically flat', () => {
		const target = Quaternion.RotationYawPitchRoll(0.7, -0.2, 0.35).normalize()
		const travel = new Vector3(5, 0, -1.5)
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const profile = getPhysicsGuidanceProfile(sides)
			const frame = getResultFaceFrame(target, sides)
			const approach = createLandingApproachQuaternion(
				target,
				travel,
				profile.landingApproachAngle
			)
			const alignment = getFaceAlignment(
				approach,
				frame.localNormal,
				frame.restDirection
			)
			assertApproximately(alignment.angle, profile.landingApproachAngle, 1e-8)
			assert.ok(alignment.angle < 0.2)
		}
	})

	it('accumulates a deadline-aware correction after an in-flight tilt', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const target = Quaternion.RotationYawPitchRoll(0.35, -0.7, 0.2).normalize()
		const velocity = new Vector3(1.6, -1.1, 1.3)
		const seconds = 1
		const stepSeconds = 1 / 120
		const frame = getResultFaceFrame(target, 20)
		const start = createPrecomputedFlightQuaternion(target, velocity, seconds)
		let current = start.clone()
		let correctionVelocity = Vector3.Zero()

		for(let index = 0; index < 120; index += 1) {
			const elapsedSeconds = index * stepSeconds
			if(index === 60) {
				current = Quaternion.RotationAxis(Vector3.Right(), 0.5)
					.multiply(current)
					.normalize()
			}
			const planned = getPlannedFlightQuaternion(start, velocity, elapsedSeconds, seconds)
			const plannedSpin = getPlannedFlightSpin(velocity, elapsedSeconds, seconds)
			const guided = getPlannedFlightAngularVelocity(
				plannedSpin.add(correctionVelocity),
				current,
				frame.localNormal,
				planned,
				plannedSpin,
				correctionVelocity,
				seconds - elapsedSeconds,
				profile,
				(index + 1) / 120,
				stepSeconds * 1000
			)
			correctionVelocity = guided.correctionVelocity
			const speed = guided.velocity.length()
			if(speed > 0.0001) current = Quaternion.RotationAxis(
				guided.velocity.scale(1 / speed),
				speed * stepSeconds
			).multiply(current).normalize()
		}

		assert.ok(
			getFaceAlignment(current, frame.localNormal, frame.restDirection).angle
				< profile.angleThreshold
		)
	})

	it('falls back to the target for a stationary or invalid spin', () => {
		const target = Quaternion.RotationYawPitchRoll(0.3, -0.8, 1.4).normalize()
		assertQuaternionEquivalent(
			createPrecomputedFlightQuaternion(target, Vector3.Zero(), 1),
			target
		)
		assertQuaternionEquivalent(
			createPrecomputedFlightQuaternion(target, new Vector3(Number.NaN, 0, 0), 1),
			target
		)
	})

	it('softens only the final downward contact speed', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const falling = new Vector3(3.2, -11.8, -1.7)
		const position = new Vector3(-2, 3, 1)
		const target = new Vector3(0.2, 0.5, -0.1)
		assertVectorApproximately(
			getSoftLandingLinearVelocity(
				falling,
				position,
				target,
				profile,
				profile.landingBrakeStart
			),
			falling
		)
		const landed = getSoftLandingLinearVelocity(
			falling,
			target,
			target,
			profile,
			1
		)
		assertVectorApproximately(landed, new Vector3(0, -profile.maxLandingVerticalSpeed, 0))
		const retainedImpact = getSoftLandingLinearVelocity(
			falling,
			target,
			target,
			profile,
			1,
			4
		)
		const fallingHorizontal = new Vector3(falling.x, 0, falling.z).normalize().scale(4)
		assertVectorApproximately(
			retainedImpact,
			new Vector3(fallingHorizontal.x, -profile.maxLandingVerticalSpeed, fallingHorizontal.z)
		)

		let simulatedPosition = new Vector3(-4, 4, 1)
		let simulatedVelocity = new Vector3(6, -3, -1.4)
		for(let index = 0; index < 240; index += 1) {
			simulatedVelocity = getSoftLandingLinearVelocity(
				simulatedVelocity,
				simulatedPosition,
				target,
				profile,
				Math.min(1, index / 90)
			)
			simulatedPosition.addInPlace(simulatedVelocity.scale(1 / 120))
		}
		assert.ok(
			Math.hypot(
				simulatedPosition.x - target.x,
				simulatedPosition.z - target.z
			) < 0.15,
			'soft landing must converge on the scattered target instead of crossing the opposite wall'
		)
	})
})

describe('continuous face guidance controller', () => {
	it('limits angular-velocity changes in flight and settle', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const target = Quaternion.Identity()
		const frame = getResultFaceFrame(target, 20)
		const current = Quaternion.RotationAxis(Vector3.Right(), Math.PI * 0.8)
		const deltaMs = 1000 / 90

		for(const phase of ['flight', 'settle'] as const) {
			const result = getFaceGuidedAngularVelocity(
				Vector3.Zero(),
				current,
				frame.localNormal,
				frame.restDirection,
				profile,
				1,
				deltaMs,
				phase
			)
			const accelerationLimit = phase === 'flight'
				? profile.flightMaxAngularAcceleration
				: profile.settleMaxAngularAcceleration
			assert.ok(
				result.velocity.length() <= accelerationLimit * deltaMs / 1000 + EPSILON,
				`${phase} exceeded its angular acceleration budget`
			)
		}
	})

	it('does not erase visible spin when the resolved face is already aligned', () => {
		const profile = getPhysicsGuidanceProfile(6)
		const target = Quaternion.RotationYawPitchRoll(0.4, -0.2, 1.1).normalize()
		const frame = getResultFaceFrame(target, 6)
		const currentVelocity = new Vector3(2, 1, -3)
		const flight = getFaceGuidedAngularVelocity(
			currentVelocity,
			target,
			frame.localNormal,
			frame.restDirection,
			profile,
			0.7,
			1000 / 60,
			'flight'
		)
		const settle = getFaceGuidedAngularVelocity(
			currentVelocity,
			target,
			frame.localNormal,
			frame.restDirection,
			profile,
			0.7,
			1000 / 60,
			'settle'
		)

		assert.equal(flight.angle, 0)
		assertVectorApproximately(flight.velocity, currentVelocity)
		assert.equal(settle.angle, 0)
		assert.ok(settle.velocity.length() > 0)
		assert.ok(settle.velocity.length() < currentVelocity.length())
	})

	it('stops steering inside the natural top-face cone while retaining damping', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const frame = getResultFaceFrame(Quaternion.Identity(), 20)
		const insideDeadZone = Quaternion.RotationAxis(
			Vector3.Forward(),
			profile.settleDeadZoneAngle * 0.8
		)
		const outsideDeadZone = Quaternion.RotationAxis(
			Vector3.Forward(),
			profile.settleDeadZoneAngle * 1.2
		)
		const inside = getFaceGuidedAngularVelocity(
			Vector3.Zero(),
			insideDeadZone,
			frame.localNormal,
			frame.restDirection,
			profile,
			1,
			1000 / 90,
			'settle'
		)
		const outside = getFaceGuidedAngularVelocity(
			Vector3.Zero(),
			outsideDeadZone,
			frame.localNormal,
			frame.restDirection,
			profile,
			1,
			1000 / 90,
			'settle'
		)

		assert.equal(inside.velocity.length(), 0)
		assert.ok(outside.velocity.length() > 0)
	})

	it('preserves visible early momentum and dissipates it progressively', () => {
		const profile = getPhysicsGuidanceProfile(6)
		const frame = getResultFaceFrame(Quaternion.Identity(), 6)
		let linearVelocity = new Vector3(5, 0, 0)
		let angularVelocity = new Vector3(0, 5, 0)
		const deltaMs = 1000 / 60
		for(let frameIndex = 0; frameIndex < 30; frameIndex += 1) {
			linearVelocity = getGuidedLinearVelocity(
				linearVelocity,
				profile,
				0.05,
				deltaMs
			)
			angularVelocity = getFaceGuidedAngularVelocity(
				angularVelocity,
				Quaternion.Identity(),
				frame.localNormal,
				frame.restDirection,
				profile,
				0.05,
				deltaMs,
				'settle'
			).velocity
		}
		assert.ok(linearVelocity.length() >= 3)
		assert.ok(angularVelocity.length() >= 4.5)

		for(let frameIndex = 0; frameIndex < 150; frameIndex += 1) {
			linearVelocity = getGuidedLinearVelocity(linearVelocity, profile, 1, deltaMs)
			angularVelocity = getFaceGuidedAngularVelocity(
				angularVelocity,
				Quaternion.Identity(),
				frame.localNormal,
				frame.restDirection,
				profile,
				1,
				deltaMs,
				'settle'
			).velocity
		}
		assert.ok(linearVelocity.length() < 0.01)
		assert.ok(angularVelocity.length() < 0.03)
	})

	it('sustains a fading post-impact roll without overriding stronger collisions', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const axis = getLandingRollAxis(new Vector3(5, 0, -1))
		const firstStep = getSustainedRollAngularVelocity(
			Vector3.Zero(),
			axis,
			profile,
			0,
			1000 / 90
		)
		assert.ok(Vector3.Dot(firstStep, axis) > 0)

		const collisionVelocity = axis.scale(3)
		const preserved = getSustainedRollAngularVelocity(
			collisionVelocity,
			axis,
			profile,
			0,
			1000 / 90
		)
		assertVectorApproximately(preserved, collisionVelocity)

		const reverseImpact = axis.scale(-0.12)
		const reverseSustained = getSustainedRollAngularVelocity(
			reverseImpact,
			axis,
			profile,
			80,
			1000 / 90
		)
		assert.ok(Vector3.Dot(reverseSustained, axis) < -0.12)

		const expired = getSustainedRollAngularVelocity(
			Vector3.Zero(),
			axis,
			profile,
			profile.durationMs,
			1000 / 90
		)
		assertVectorApproximately(expired, Vector3.Zero())
	})
})

describe('adaptive final lock', () => {
	it('keeps small corrections at 220ms and caps the apparent speed of larger corrections', () => {
		const profile = getPhysicsGuidanceProfile(6)
		assert.equal(getFinalLockDurationMs(0.05, profile, false), 220)

		const angle = Math.PI
		const normalDurationMs = getFinalLockDurationMs(angle, profile, false)
		const forcedDurationMs = getFinalLockDurationMs(angle, profile, true)
		assert.ok(angle / (normalDurationMs / 1000) <= profile.finalLockMaxAngularSpeed + EPSILON)
		assert.ok(angle / (forcedDurationMs / 1000) <= profile.forcedLockMaxAngularSpeed + EPSILON)
		assert.ok(normalDurationMs > forcedDurationMs)
	})
})

describe('guidance transition criteria', () => {
	const profile = getPhysicsGuidanceProfile(6)

	it('treats a late or low body collision as support without mistaking an early aerial hit', () => {
		const flightDurationMs = 1000
		assert.equal(canBodyContactActAsSupport(200, flightDurationMs, 6, profile), false)
		assert.equal(canBodyContactActAsSupport(750, flightDurationMs, 6, profile), true)
		assert.equal(
			canBodyContactActAsSupport(200, flightDurationMs, profile.maxGuideStartHeight, profile),
			true
		)
	})

	it('waits for minimum elapsed time, an impact and the bounce grace period', () => {
		assert.equal(shouldStartGuidance({
			elapsedMs: profile.minElapsedMs - 1,
			groundImpactCount: 1,
			firstGroundImpactElapsedMs: 0,
			positionY: 1,
			timeoutRemainingMs: 100
		}, profile), false)

		assert.equal(shouldStartGuidance({
			elapsedMs: profile.minElapsedMs,
			groundImpactCount: 1,
			firstGroundImpactElapsedMs: profile.minElapsedMs - profile.bounceGraceMs + 1,
			positionY: 1,
			timeoutRemainingMs: 2000
		}, profile), false)

		assert.equal(shouldStartGuidance({
			elapsedMs: profile.minElapsedMs,
			groundImpactCount: 1,
			firstGroundImpactElapsedMs: profile.minElapsedMs - profile.bounceGraceMs,
			positionY: 1,
			timeoutRemainingMs: 2000
		}, profile), true)
	})

	it('can start continuous guidance near the floor or near timeout without an impact', () => {
		assert.equal(shouldStartGuidance({
			elapsedMs: profile.forceGuideElapsedMs,
			groundImpactCount: 0,
			positionY: profile.maxGuideStartHeight,
			timeoutRemainingMs: 2000
		}, profile), true)

		assert.equal(shouldStartGuidance({
			elapsedMs: profile.forceGuideElapsedMs,
			groundImpactCount: 0,
			positionY: profile.maxGuideStartHeight + 1,
			timeoutRemainingMs: 2000
		}, profile), false)

		assert.equal(shouldStartGuidance({
			elapsedMs: profile.minElapsedMs,
			groundImpactCount: 0,
			positionY: 20,
			timeoutRemainingMs: profile.timeoutWindowMs - 1
		}, profile), true)
	})

	it('starts final lock only after face, motion, support and stability gates pass', () => {
		const ready = {
			angle: profile.angleThreshold - 0.001,
			angularSpeed: profile.maxSettleAngularVelocity,
			elapsedMs: profile.minFinalLockElapsedMs,
			groundContactElapsedMs: 200,
			hasGroundContact: true,
			linearSpeed: profile.maxSettleLinearVelocity,
			positionY: profile.maxLockHeight,
			stableElapsedMs: profile.stableDurationMs
		} as const

		assert.equal(canStartFinalLock(ready, profile), true)
		assert.equal(canStartFinalLock({
			...ready,
			elapsedMs: profile.minFinalLockElapsedMs - 1
		}, profile), false)
		assert.equal(canStartFinalLock({ ...ready, angle: profile.angleThreshold + 0.001 }, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			angularSpeed: profile.maxSettleAngularVelocity + 0.001
		}, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			linearSpeed: profile.maxSettleLinearVelocity + 0.001
		}, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			stableElapsedMs: profile.stableDurationMs - 0.001
		}, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			hasGroundContact: false,
			groundContactElapsedMs: 180
		}, profile), false)
		assert.equal(canStartFinalLock({ ...ready, positionY: profile.maxLockHeight + 0.001 }, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			lastBodyContactElapsedMs: ready.elapsedMs - profile.bodyContactSettleDelayMs + 1
		}, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			bodyContactElapsedMs: profile.bodyContactSettleDelayMs,
			lastBodyContactElapsedMs: ready.elapsedMs
		}, profile), true)
	})

	it('accepts readable collision tilt for every supported die profile', () => {
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const dieProfile = getPhysicsGuidanceProfile(sides)
			const readiness = {
				angle: dieProfile.settleDeadZoneAngle * 0.95,
				angularSpeed: 0,
				elapsedMs: dieProfile.minFinalLockElapsedMs,
				groundContactElapsedMs: 220,
				hasGroundContact: true,
				linearSpeed: 0,
				positionY: dieProfile.maxLockHeight,
				stableElapsedMs: dieProfile.stableDurationMs
			}

			assert.equal(
				canStartFinalLock(readiness, dieProfile),
				true,
				`d${String(sides)} should settle with a readable collision tilt`
			)
			assert.equal(
				canStartFinalLock({ ...readiness, angle: dieProfile.angleThreshold + 0.001 }, dieProfile),
				false,
				`d${String(sides)} should reject a pose outside its inference cone`
			)
		}
	})

	it('never releases the lock gate merely because timeout expired while the angle is large', () => {
		const timedOutButMisaligned = {
			angle: Math.PI,
			angularSpeed: 0,
			elapsedMs: 2000,
			groundContactElapsedMs: 500,
			hasGroundContact: true,
			linearSpeed: 0,
			positionY: profile.maxLockHeight,
			stableElapsedMs: profile.stableDurationMs,
			timeoutRemainingMs: 0
		}

		assert.equal(canStartFinalLock(timedOutButMisaligned, profile), false)
	})
})

describe('quaternion correction primitives', () => {
	it('chooses the equivalent quaternion on the shortest hemisphere', () => {
		const source = Quaternion.Identity()
		const equivalentNegative = new Quaternion(0, 0, 0, -1)
		const chosen = chooseShortestQuaternion(source, equivalentNegative)

		assertQuaternionEquivalent(chosen, Quaternion.Identity())
		assert.notStrictEqual(chosen, equivalentNegative)
		assert.equal(getQuaternionCorrection(source, equivalentNegative), null)
	})
})
