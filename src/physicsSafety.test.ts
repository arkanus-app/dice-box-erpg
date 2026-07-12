import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	DICE_FALL_RECOVERY_Y,
	DICE_HORIZONTAL_RECOVERY_LIMIT,
	shouldRecoverPhysicsBody
} from './physicsSafety'

describe('physics fall recovery', () => {
	it('keeps bodies inside the playable volume untouched', () => {
		assert.equal(shouldRecoverPhysicsBody({ x: 7.2, y: 0.4, z: -7.2 }), false)
	})

	it('recovers bodies that escaped below or beside the bounds', () => {
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: DICE_FALL_RECOVERY_Y - 0.01, z: 0 }), true)
		assert.equal(shouldRecoverPhysicsBody({ x: DICE_HORIZONTAL_RECOVERY_LIMIT + 0.01, y: 1, z: 0 }), true)
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: 1, z: -DICE_HORIZONTAL_RECOVERY_LIMIT - 0.01 }), true)
	})

	it('recovers invalid transforms instead of rendering them forever', () => {
		assert.equal(shouldRecoverPhysicsBody({ x: Number.NaN, y: 1, z: 0 }), true)
		assert.equal(shouldRecoverPhysicsBody({ x: 0, y: Number.NEGATIVE_INFINITY, z: 0 }), true)
	})
})
