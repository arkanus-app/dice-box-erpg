import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	DENSE_DICE_BODY_LIMIT,
	DENSE_DICE_PHYSICS_SUB_TIME_STEP_MS,
	DENSE_DICE_PHYSICS_TIME_STEP,
	DICE_FALL_RECOVERY_Y,
	DICE_HORIZONTAL_RECOVERY_LIMIT,
	DICE_PHYSICS_SUB_TIME_STEP_MS,
	DICE_PHYSICS_TIME_STEP,
	getDicePhysicsStep,
	hasPhysicsLaunchClearance,
	LARGE_DICE_PHYSICS_SUB_TIME_STEP_MS,
	LARGE_DICE_PHYSICS_TIME_STEP,
	PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER,
	shouldRecoverPhysicsBody
} from './physicsSafety'

describe('adaptive physics resolution and launch clearance', () => {
	it('selects 90, 180 and 120 Hz for single, dense and very large presentations', () => {
		for(const count of [0, 1, Number.NaN]) {
			assert.deepEqual(getDicePhysicsStep(count), {
				seconds: DICE_PHYSICS_TIME_STEP,
				milliseconds: DICE_PHYSICS_SUB_TIME_STEP_MS
			})
		}
		for(const count of [2, 12, DENSE_DICE_BODY_LIMIT]) {
			assert.deepEqual(getDicePhysicsStep(count), {
				seconds: DENSE_DICE_PHYSICS_TIME_STEP,
				milliseconds: DENSE_DICE_PHYSICS_SUB_TIME_STEP_MS
			})
		}
		for(const count of [DENSE_DICE_BODY_LIMIT + 1, 120]) {
			assert.deepEqual(getDicePhysicsStep(count), {
				seconds: LARGE_DICE_PHYSICS_TIME_STEP,
				milliseconds: LARGE_DICE_PHYSICS_SUB_TIME_STEP_MS
			})
		}
		assert.equal(1 / DICE_PHYSICS_TIME_STEP, 90)
		assert.equal(1 / DENSE_DICE_PHYSICS_TIME_STEP, 180)
		assert.equal(1 / LARGE_DICE_PHYSICS_TIME_STEP, 120)
	})

	it('rejects intersecting launch envelopes and accepts a cleared portal', () => {
		const radius = 0.817
		const minimumDistance = radius * 2 * PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
		const occupants = [{ position: { x: 0, y: 7.6, z: 0 }, radius }]
		assert.equal(hasPhysicsLaunchClearance(
			{ x: minimumDistance - 0.001, y: 7.6, z: 0 },
			radius,
			occupants
		), false)
		assert.equal(hasPhysicsLaunchClearance(
			{ x: minimumDistance, y: 7.6, z: 0 },
			radius,
			occupants
		), true)
		assert.equal(hasPhysicsLaunchClearance(
			{ x: minimumDistance + 0.001, y: 7.6, z: 0 },
			radius,
			occupants
		), true)
	})
})

describe('physics fall recovery', () => {
	it('keeps bodies inside the playable volume untouched', () => {
		assert.equal(shouldRecoverPhysicsBody({ x: 7.2, y: 0.4, z: -7.2 }), false)
	})

	it('recovers bodies that escaped below or beside the bounds', () => {
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: DICE_FALL_RECOVERY_Y - 0.01, z: 0 }), true)
		assert.equal(shouldRecoverPhysicsBody({ x: DICE_HORIZONTAL_RECOVERY_LIMIT + 0.01, y: 1, z: 0 }), true)
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: 1, z: -DICE_HORIZONTAL_RECOVERY_LIMIT - 0.01 }), true)
	})

	it('accepts a responsive horizontal limit for wide off-screen entries', () => {
		const wideLimit = 18
		assert.equal(shouldRecoverPhysicsBody({ x: 15, y: 4, z: 0 }, wideLimit), false)
		assert.equal(shouldRecoverPhysicsBody({ x: wideLimit + 0.01, y: 4, z: 0 }, wideLimit), true)
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: DICE_FALL_RECOVERY_Y - 0.01, z: 0 }, wideLimit), true)
	})

	it('recovers invalid transforms instead of rendering them forever', () => {
		assert.equal(shouldRecoverPhysicsBody({ x: Number.NaN, y: 1, z: 0 }), true)
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: Number.NEGATIVE_INFINITY, z: 0 }), true)
	})
})
