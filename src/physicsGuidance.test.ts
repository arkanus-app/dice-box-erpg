import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import {
	canStartFinalLock,
	chooseShortestQuaternion,
	createBiasedInitialQuaternion,
	getBiasedLaunchAngularVelocity,
	getGuidedAngularVelocity,
	getPhysicsGuidanceProfile,
	getPhysicsMassMultiplier,
	getQuaternionCorrection,
	shouldStartGuidance,
	type PhysicsGuidanceProfile
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

const assertQuaternionApproximately = (
	actual: Quaternion,
	expected: Quaternion,
	epsilon = EPSILON
): void => {
	assertApproximately(actual.x, expected.x, epsilon)
	assertApproximately(actual.y, expected.y, epsilon)
	assertApproximately(actual.z, expected.z, epsilon)
	assertApproximately(actual.w, expected.w, epsilon)
}

describe('physics guidance profiles', () => {
	it('preserves the historical per-die correction tuning', () => {
		const expectations = [
			[4, 580, 1500, 1240, 4.6, 5.5, 0.18, 0.1, 1, 2.8],
			[6, 540, 1400, 1160, 5.1, 6.1, 0.22, 0.12, 1.12, 3.2],
			[8, 500, 1320, 1080, 5.8, 7, 0.24, 0.14, 1.25, 3.2],
			[10, 500, 1300, 1040, 6, 7.2, 0.27, 0.17, 1.35, 3.2],
			[12, 500, 1320, 1080, 5.8, 7, 0.24, 0.14, 1.25, 3.2],
			[20, 460, 1220, 980, 6.6, 7.8, 0.3, 0.18, 1.45, 3.2],
			[100, 500, 1300, 1040, 6, 7.2, 0.27, 0.17, 1.35, 3.2]
		] as const

		for(const [
			sides,
			minElapsedMs,
			forceGuideElapsedMs,
			durationMs,
			angularStrength,
			maxAngularVelocity,
			initialBias,
			launchSpinBias,
			launchAlignmentStrength,
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
					initialBias: actual.initialBias,
					launchSpinBias: actual.launchSpinBias,
					launchAlignmentStrength: actual.launchAlignmentStrength,
					maxGuideStartHeight: actual.maxGuideStartHeight
				},
				{
					minElapsedMs,
					forceGuideElapsedMs,
					durationMs,
					angularStrength,
					maxAngularVelocity,
					initialBias,
					launchSpinBias,
					launchAlignmentStrength,
					maxGuideStartHeight
				},
				`d${String(sides)} profile changed`
			)
		}
	})

	it('keeps common settling constants and mass multipliers stable', () => {
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			const actual = getPhysicsGuidanceProfile(sides)
			assert.equal(actual.minGroundImpacts, 1)
			assert.equal(actual.bounceGraceMs, 130)
			assert.equal(actual.angleThreshold, 0.04)
			assert.equal(actual.finalLockDurationMs, 140)
			assert.equal(actual.maxLockHeight, 2.05)
			assert.equal(actual.bodyContactSettleDelayMs, 180)
			assert.equal(actual.timeoutWindowMs, 650)
		}

		assert.deepEqual(
			[2, 4, 6, 8, 10, 12, 20, 100].map(sides => getPhysicsMassMultiplier(sides)),
			[0.7, 0.82, 1, 0.92, 0.88, 1.08, 1.18, 0.88]
		)
		assert.equal(getPhysicsMassMultiplier(30), 1)
	})
})

describe('quaternion corrections', () => {
	it('chooses the equivalent quaternion on the shortest hemisphere', () => {
		const source = Quaternion.Identity()
		const equivalentNegative = new Quaternion(0, 0, 0, -1)
		const chosen = chooseShortestQuaternion(source, equivalentNegative)

		assertQuaternionApproximately(chosen, Quaternion.Identity())
		assert.notStrictEqual(chosen, equivalentNegative)
		assert.equal(getQuaternionCorrection(source, equivalentNegative), null)
	})

	it('returns the shortest axis-angle correction for rotations beyond half a turn', () => {
		const source = Quaternion.Identity()
		const target = Quaternion.RotationAxis(Vector3.Up(), Math.PI * 1.5)
		const correction = getQuaternionCorrection(source, target)

		assert.ok(correction)
		assertApproximately(correction.angle, Math.PI / 2)
		assertApproximately(Math.abs(Vector3.Dot(correction.axis, Vector3.Up())), 1)
		assert.ok(correction.axis.y < 0, 'the 270-degree turn should become a -90-degree turn')
	})

	it('drives the angular motor toward the target and respects its speed cap', () => {
		const profile = getPhysicsGuidanceProfile(20)
		const current = Quaternion.Identity()
		const target = Quaternion.RotationAxis(Vector3.Right(), Math.PI / 2)
		const result = getGuidedAngularVelocity(
			new Vector3(0, 0.2, 0),
			current,
			target,
			profile,
			1,
			1000 / 60
		)

		assertApproximately(result.angle, Math.PI / 2)
		assert.ok(Vector3.Dot(result.velocity, Vector3.Right()) > 0)
		assert.ok(result.velocity.length() <= profile.maxAngularVelocity + EPSILON)
	})

	it('returns no motor motion once the target orientation is reached', () => {
		const target = Quaternion.RotationYawPitchRoll(0.4, -0.2, 1.1).normalize()
		const result = getGuidedAngularVelocity(
			new Vector3(2, 1, -3),
			target,
			target,
			getPhysicsGuidanceProfile(6),
			0.7,
			1000 / 60
		)

		assert.equal(result.angle, 0)
		assertVectorApproximately(result.velocity, Vector3.Zero())
	})
})

describe('deterministic initial and launch bias', () => {
	it('produces the same biased initial orientation for the same precomputed spins', () => {
		const target = Quaternion.RotationYawPitchRoll(-0.5, 0.9, 0.2).normalize()
		const profile = getPhysicsGuidanceProfile(20)
		const first = createBiasedInitialQuaternion(target, 4.2, -2.3, 7.8, profile)
		const second = createBiasedInitialQuaternion(target, 4.2, -2.3, 7.8, profile)
		const unbiasedProfile: PhysicsGuidanceProfile = { ...profile, initialBias: 0 }
		const source = createBiasedInitialQuaternion(target, 4.2, -2.3, 7.8, unbiasedProfile)

		assertQuaternionApproximately(first, second)
		assert.ok([first.x, first.y, first.z, first.w].every(Number.isFinite))
		assertApproximately(Math.hypot(first.x, first.y, first.z, first.w), 1)
		assert.ok(
			(getQuaternionCorrection(first, target)?.angle ?? 0)
			< (getQuaternionCorrection(source, target)?.angle ?? 0),
			'initial bias should start closer to the requested result orientation'
		)
	})

	it('produces a deterministic launch correction aimed at the result orientation', () => {
		const profile = getPhysicsGuidanceProfile(10)
		const currentQuaternion = Quaternion.Identity()
		const targetQuaternion = Quaternion.RotationAxis(Vector3.Forward(), Math.PI / 2)
		const currentVelocity = new Vector3(1.2, -0.3, 0.4)
		const first = getBiasedLaunchAngularVelocity(
			currentVelocity,
			currentQuaternion,
			targetQuaternion,
			profile
		)
		const second = getBiasedLaunchAngularVelocity(
			currentVelocity,
			currentQuaternion,
			targetQuaternion,
			profile
		)
		const correction = getQuaternionCorrection(currentQuaternion, targetQuaternion)

		assert.ok(correction)
		assertVectorApproximately(first, second)
		assert.ok(
			Vector3.Dot(first, correction.axis) > Vector3.Dot(currentVelocity, correction.axis),
			'launch bias should add angular velocity along the shortest correction axis'
		)
	})
})

describe('guidance transition criteria', () => {
	const profile = getPhysicsGuidanceProfile(6)

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

	it('can force guidance near the floor or near timeout without an impact', () => {
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

	it('starts final lock only when aligned, supported, low and clear of recent bodies', () => {
		const ready = {
			angle: profile.angleThreshold - 0.001,
			elapsedMs: 1000,
			groundContactElapsedMs: 200,
			hasGroundContact: true,
			positionY: profile.maxLockHeight,
			timeoutRemainingMs: 1000
		} as const

		assert.equal(canStartFinalLock(ready, profile), true)
		assert.equal(canStartFinalLock({ ...ready, angle: profile.angleThreshold + 0.001 }, profile), false)
		assert.equal(canStartFinalLock({ ...ready, hasGroundContact: false, groundContactElapsedMs: 180 }, profile), false)
		assert.equal(canStartFinalLock({ ...ready, positionY: profile.maxLockHeight + 0.001 }, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			lastBodyContactElapsedMs: ready.elapsedMs - profile.bodyContactSettleDelayMs + 1
		}, profile), false)
		assert.equal(canStartFinalLock({
			...ready,
			lastBodyContactElapsedMs: ready.elapsedMs - profile.bodyContactSettleDelayMs
		}, profile), true)
	})

	it('uses the final timeout as a deterministic escape hatch but still requires floor height', () => {
		const timeoutInput = {
			angle: Math.PI,
			elapsedMs: 2000,
			groundContactElapsedMs: 0,
			hasGroundContact: false,
			lastBodyContactElapsedMs: 1999,
			positionY: profile.maxLockHeight,
			timeoutRemainingMs: 79
		} as const

		assert.equal(canStartFinalLock(timeoutInput, profile), true)
		assert.equal(canStartFinalLock({
			...timeoutInput,
			positionY: profile.maxLockHeight + 0.001
		}, profile), false)
	})
})
