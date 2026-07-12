import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { getCoinTargetQuaternion } from './renderers/coin'

describe('coin face orientation', () => {
	it('turns the modeled front face up for value 1', () => {
		const up = Vector3.Up().applyRotationQuaternion(getCoinTargetQuaternion(1))
		assert.ok(Vector3.Dot(up, Vector3.Down()) > 0.999)
	})

	it('keeps the modeled back face up for value 2', () => {
		const up = Vector3.Up().applyRotationQuaternion(getCoinTargetQuaternion(2))
		assert.ok(Vector3.Dot(up, Vector3.Up()) > 0.999)
	})
})
