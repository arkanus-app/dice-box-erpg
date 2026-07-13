import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import {
	canStartFinalLock,
	getFaceAlignment,
	getFaceGuidedAngularVelocity,
	getPhysicsGuidanceProfile,
	getResultFaceFrame
} from './physicsGuidance'
import { getCoinTargetQuaternion } from './renderers/coin'

describe('coin face orientation', () => {
	it('turns the modeled front face up for value 1', () => {
		const up = Vector3.Up().applyRotationQuaternion(getCoinTargetQuaternion(1))
		assert.ok(Vector3.Dot(up, Vector3.Up()) > 0.999)
	})

	it('turns the modeled back face up for value 2', () => {
		const up = Vector3.Up().applyRotationQuaternion(getCoinTargetQuaternion(2))
		assert.ok(Vector3.Dot(up, Vector3.Down()) > 0.999)
	})

	it('settles an inferable tilted face without confusing it with the opposite face', () => {
		const profile = getPhysicsGuidanceProfile(2)
		const target = getCoinTargetQuaternion(2)
		const frame = getResultFaceFrame(target, 2)
		const yaw = Quaternion.RotationAxis(Vector3.Up(), 1.7)
		const tilt = Quaternion.RotationAxis(
			Vector3.Forward(),
			profile.settleDeadZoneAngle * 0.9
		)
		const readablePose = yaw.multiply(tilt).multiply(target)
		const oppositePose = yaw.multiply(tilt).multiply(getCoinTargetQuaternion(1))
		const readableAlignment = getFaceAlignment(
			readablePose,
			frame.localNormal,
			frame.restDirection
		)
		const oppositeAlignment = getFaceAlignment(
			oppositePose,
			frame.localNormal,
			frame.restDirection
		)
		const readiness = {
			angle: readableAlignment.angle,
			angularSpeed: 0,
			elapsedMs: profile.minFinalLockElapsedMs,
			groundContactElapsedMs: 220,
			hasGroundContact: true,
			linearSpeed: 0,
			positionY: profile.maxLockHeight,
			stableElapsedMs: profile.stableDurationMs
		}

		assert.ok(readableAlignment.angle < profile.angleThreshold)
		assert.equal(getFaceGuidedAngularVelocity(
			Vector3.Zero(),
			readablePose,
			frame.localNormal,
			frame.restDirection,
			profile,
			1,
			1000 / 90,
			'settle'
		).velocity.length(), 0)
		assert.equal(canStartFinalLock(readiness, profile), true)
		assert.ok(oppositeAlignment.angle > profile.angleThreshold)
		assert.equal(canStartFinalLock({ ...readiness, angle: oppositeAlignment.angle }, profile), false)
	})
})
