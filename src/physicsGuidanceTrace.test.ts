import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import {
	getFaceAlignment,
	getFaceGuidedAngularVelocity,
	getPhysicsGuidanceProfile,
	getResultFaceFrame,
	type FaceGuidancePhase
} from './physicsGuidance'

const FREQUENCY_HZ = 90
const DELTA_SECONDS = 1 / FREQUENCY_HZ
const DELTA_MS = DELTA_SECONDS * 1000
const FLIGHT_STEPS = Math.round(FREQUENCY_HZ * 0.6)
const TOTAL_STEPS = Math.round(FREQUENCY_HZ * 5)

const RESOLVED_FACE_POSES = [
	Quaternion.Identity(),
	Quaternion.RotationAxis(Vector3.Right(), Math.PI / 2),
	Quaternion.RotationAxis(Vector3.Right(), -Math.PI / 2),
	Quaternion.RotationAxis(Vector3.Forward(), Math.PI / 2),
	Quaternion.RotationAxis(Vector3.Forward(), -Math.PI / 2),
	Quaternion.RotationAxis(Vector3.Right(), Math.PI)
].map((tilt, index) => Quaternion.RotationAxis(Vector3.Up(), index * 0.47)
	.multiply(tilt)
	.normalize())

const integrateWorldAngularVelocity = (
	orientation: Quaternion,
	angularVelocity: Vector3
): Quaternion => {
	const speed = angularVelocity.length()
	if(speed < 1e-10) return orientation
	return Quaternion.RotationAxis(
		angularVelocity.scale(1 / speed),
		speed * DELTA_SECONDS
	).multiply(orientation).normalize()
}

describe('90Hz continuous-guidance trace', () => {
	it('converges the resolved face for every supported die profile and face pose', () => {
		for(const sides of [2, 4, 6, 8, 10, 12, 20, 100]) {
			for(const [faceIndex, target] of RESOLVED_FACE_POSES.entries()) {
				const profile = getPhysicsGuidanceProfile(sides)
				const frame = getResultFaceFrame(target, sides)
				let orientation = Quaternion.RotationYawPitchRoll(
					-2.2 + faceIndex * 0.31,
					1.8 - faceIndex * 0.17,
					2.7 - faceIndex * 0.23
				).normalize()
				let angularVelocity = new Vector3(3.7, -2.6, 4.1)

				for(let step = 0; step < TOTAL_STEPS; step += 1) {
					const phase: FaceGuidancePhase = step < FLIGHT_STEPS ? 'flight' : 'settle'
					const progress = phase === 'flight'
						? step / FLIGHT_STEPS
						: Math.min(
							1,
							(step - FLIGHT_STEPS) / (profile.durationMs / 1000 * FREQUENCY_HZ)
						)
					const guidance = getFaceGuidedAngularVelocity(
						angularVelocity,
						orientation,
						frame.localNormal,
						frame.restDirection,
						profile,
						progress,
						DELTA_MS,
						phase
					)
					angularVelocity = guidance.velocity
					orientation = integrateWorldAngularVelocity(orientation, angularVelocity)
				}

				const finalAlignment = getFaceAlignment(
					orientation,
					frame.localNormal,
					frame.restDirection
				)
				const finalWorldNormal = frame.localNormal
					.applyRotationQuaternion(orientation)
					.normalize()
				assert.ok(
					finalAlignment.angle <= profile.angleThreshold,
					`d${String(sides)} face ${String(faceIndex + 1)} retained ${String(finalAlignment.angle)} rad`
				)
				assert.ok(
					Vector3.Dot(finalWorldNormal, frame.restDirection)
						>= Math.cos(profile.angleThreshold),
					`d${String(sides)} face ${String(faceIndex + 1)} did not reach its rest direction`
				)
				assert.ok(
					angularVelocity.length() <= profile.maxSettleAngularVelocity,
					`d${String(sides)} face ${String(faceIndex + 1)} did not settle its spin`
				)
			}
		}
	})
})
