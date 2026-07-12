import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'

export type PhysicsGuidanceState = 'freeFall' | 'guidedSettle' | 'finalLock' | 'commit' | 'complete'

export interface PhysicsGuidanceProfile {
	readonly minElapsedMs: number
	readonly forceGuideElapsedMs: number
	readonly minGroundImpacts: number
	readonly bounceGraceMs: number
	readonly durationMs: number
	readonly angleThreshold: number
	readonly finalLockDurationMs: number
	readonly initialBias: number
	readonly launchSpinBias: number
	readonly launchAlignmentStrength: number
	readonly angularStrength: number
	readonly maxAngularVelocity: number
	readonly motorBlend: number
	readonly linearDampingStart: number
	readonly linearDampingEnd: number
	readonly angularDampingStart: number
	readonly angularDampingEnd: number
	readonly maxLockHeight: number
	readonly maxGuideStartHeight: number
	readonly bodyContactSettleDelayMs: number
	readonly timeoutWindowMs: number
}

export interface QuaternionCorrection {
	readonly angle: number
	readonly axis: Vector3
}

interface GuidanceStartInput {
	readonly elapsedMs: number
	readonly firstGroundImpactElapsedMs?: number
	readonly groundImpactCount: number
	readonly positionY: number
	readonly timeoutRemainingMs: number
}

interface FinalLockInput {
	readonly angle: number
	readonly elapsedMs: number
	readonly groundContactElapsedMs: number
	readonly hasGroundContact: boolean
	readonly lastBodyContactElapsedMs?: number
	readonly positionY: number
	readonly timeoutRemainingMs: number
}

const BASE_PROFILE: PhysicsGuidanceProfile = {
	minElapsedMs: 500,
	forceGuideElapsedMs: 1320,
	minGroundImpacts: 1,
	bounceGraceMs: 130,
	durationMs: 1080,
	angleThreshold: 0.04,
	finalLockDurationMs: 140,
	initialBias: 0.24,
	launchSpinBias: 0.14,
	launchAlignmentStrength: 1.25,
	angularStrength: 5.8,
	maxAngularVelocity: 7,
	motorBlend: 0.16,
	linearDampingStart: 0.72,
	linearDampingEnd: 0.58,
	angularDampingStart: 0.78,
	angularDampingEnd: 0.62,
	maxLockHeight: 2.05,
	maxGuideStartHeight: 3.2,
	bodyContactSettleDelayMs: 180,
	timeoutWindowMs: 650
}

const profile = (overrides: Partial<PhysicsGuidanceProfile> = {}): PhysicsGuidanceProfile => ({
	...BASE_PROFILE,
	...overrides
})

const PROFILES: Readonly<Record<number, PhysicsGuidanceProfile>> = {
	2: profile({
		minElapsedMs: 450,
		forceGuideElapsedMs: 1120,
		durationMs: 920,
		angularStrength: 4.2,
		maxAngularVelocity: 5.2,
		initialBias: 0.16,
		launchSpinBias: 0.1,
		launchAlignmentStrength: 0.9,
		maxGuideStartHeight: 2.6
	}),
	4: profile({
		minElapsedMs: 580,
		forceGuideElapsedMs: 1500,
		durationMs: 1240,
		angularStrength: 4.6,
		maxAngularVelocity: 5.5,
		initialBias: 0.18,
		launchSpinBias: 0.1,
		launchAlignmentStrength: 1,
		maxGuideStartHeight: 2.8
	}),
	6: profile({
		minElapsedMs: 540,
		forceGuideElapsedMs: 1400,
		durationMs: 1160,
		angularStrength: 5.1,
		maxAngularVelocity: 6.1,
		initialBias: 0.22,
		launchSpinBias: 0.12,
		launchAlignmentStrength: 1.12
	}),
	8: profile(),
	10: profile({
		forceGuideElapsedMs: 1300,
		durationMs: 1040,
		angularStrength: 6,
		maxAngularVelocity: 7.2,
		initialBias: 0.27,
		launchSpinBias: 0.17,
		launchAlignmentStrength: 1.35
	}),
	12: profile(),
	20: profile({
		minElapsedMs: 460,
		forceGuideElapsedMs: 1220,
		durationMs: 980,
		angularStrength: 6.6,
		maxAngularVelocity: 7.8,
		initialBias: 0.3,
		launchSpinBias: 0.18,
		launchAlignmentStrength: 1.45
	}),
	100: profile({
		forceGuideElapsedMs: 1300,
		durationMs: 1040,
		angularStrength: 6,
		maxAngularVelocity: 7.2,
		initialBias: 0.27,
		launchSpinBias: 0.17,
		launchAlignmentStrength: 1.35
	})
}

const MASS_MULTIPLIERS: Readonly<Record<number, number>> = {
	2: 0.7,
	4: 0.82,
	6: 1,
	8: 0.92,
	10: 0.88,
	12: 1.08,
	20: 1.18,
	100: 0.88
}

const clamp = (value: number, minimum: number, maximum: number): number =>
	Math.max(minimum, Math.min(maximum, value))

export const clamp01 = (value: number): number => clamp(value, 0, 1)
export const smoothStep = (value: number): number => {
	const clamped = clamp01(value)
	return clamped * clamped * (3 - 2 * clamped)
}

const lerp = (start: number, end: number, amount: number): number =>
	start + (end - start) * amount

export const getPhysicsGuidanceProfile = (sides: number): PhysicsGuidanceProfile =>
	PROFILES[sides] ?? BASE_PROFILE

export const getPhysicsMassMultiplier = (sides: number): number =>
	MASS_MULTIPLIERS[sides] ?? 1

export const chooseShortestQuaternion = (source: Quaternion, target: Quaternion): Quaternion =>
	Quaternion.Dot(source, target) < 0 ? target.scale(-1) : target.clone()

export const getQuaternionCorrection = (
	current: Quaternion,
	target: Quaternion
): QuaternionCorrection | null => {
	const shortestTarget = chooseShortestQuaternion(current, target).normalize()
	const error = shortestTarget.multiply(current.conjugate()).normalize()
	if(error.w < 0) error.scaleInPlace(-1)
	const angle = 2 * Math.acos(clamp(error.w, -1, 1))
	if(angle < 0.0001) return null
	const sinHalfAngle = Math.sqrt(Math.max(0.000001, 1 - error.w * error.w))
	return {
		angle,
		axis: new Vector3(
			error.x / sinHalfAngle,
			error.y / sinHalfAngle,
			error.z / sinHalfAngle
		).normalize()
	}
}

const frameAdjustedFactor = (factor: number, deltaMs: number): number =>
	Math.pow(clamp(factor, 0, 1), Math.max(0.01, deltaMs / (1000 / 60)))

export const getGuidedAngularVelocity = (
	currentVelocity: Vector3,
	currentQuaternion: Quaternion,
	targetQuaternion: Quaternion,
	profileValue: PhysicsGuidanceProfile,
	progress: number,
	deltaMs: number
): { readonly angle: number; readonly velocity: Vector3 } => {
	const correction = getQuaternionCorrection(currentQuaternion, targetQuaternion)
	if(!correction) return { angle: 0, velocity: Vector3.Zero() }
	const eased = smoothStep(progress)
	const assistProgress = smoothStep((progress - 0.18) / 0.82)
	const desiredSpeed = Math.min(
		profileValue.maxAngularVelocity,
		correction.angle * profileValue.angularStrength * lerp(0.24, 1, eased)
	)
	const desired = correction.axis.scale(desiredSpeed)
	const angularDamping = frameAdjustedFactor(
		lerp(profileValue.angularDampingStart, profileValue.angularDampingEnd, assistProgress),
		deltaMs
	)
	const baseBlend = clamp(profileValue.motorBlend + assistProgress * 0.26, 0, 0.42)
	const blend = 1 - Math.pow(1 - baseBlend, Math.max(0.01, deltaMs / (1000 / 60)))
	return {
		angle: correction.angle,
		velocity: Vector3.Lerp(currentVelocity.scale(angularDamping), desired, blend)
	}
}

export const getGuidedLinearVelocity = (
	currentVelocity: Vector3,
	profileValue: PhysicsGuidanceProfile,
	progress: number,
	deltaMs: number
): Vector3 => {
	const assistProgress = smoothStep((progress - 0.18) / 0.82)
	const rawDamping = lerp(profileValue.linearDampingStart, profileValue.linearDampingEnd, assistProgress)
	const damping = frameAdjustedFactor(rawDamping, deltaMs)
	const verticalDamping = frameAdjustedFactor(lerp(0.98, rawDamping, assistProgress), deltaMs)
	return new Vector3(
		currentVelocity.x * damping,
		currentVelocity.y * verticalDamping,
		currentVelocity.z * damping
	)
}

export const getBiasedLaunchAngularVelocity = (
	currentVelocity: Vector3,
	currentQuaternion: Quaternion,
	targetQuaternion: Quaternion,
	profileValue: PhysicsGuidanceProfile
): Vector3 => {
	const correction = getQuaternionCorrection(currentQuaternion, targetQuaternion)
	if(!correction) return currentVelocity.clone()
	const targetSpeed = Math.min(
		profileValue.maxAngularVelocity * 0.75,
		Math.max(currentVelocity.length(), correction.angle * profileValue.launchAlignmentStrength)
	)
	return Vector3.Lerp(
		currentVelocity,
		correction.axis.scale(targetSpeed),
		clamp(profileValue.launchSpinBias, 0, 0.3)
	)
}

export const createBiasedInitialQuaternion = (
	target: Quaternion,
	spinX: number,
	spinY: number,
	spinZ: number,
	profileValue: PhysicsGuidanceProfile
): Quaternion => {
	const source = Quaternion.RotationYawPitchRoll(
		spinY % (Math.PI * 2),
		spinX % (Math.PI * 2),
		spinZ % (Math.PI * 2)
	).normalize()
	return Quaternion.Slerp(
		source,
		chooseShortestQuaternion(source, target),
		clamp(profileValue.initialBias, 0, 0.45)
	).normalize()
}

export const shouldStartGuidance = (
	input: GuidanceStartInput,
	profileValue: PhysicsGuidanceProfile
): boolean => {
	if(input.elapsedMs < profileValue.minElapsedMs) return false
	const nearGuideHeight = input.positionY <= profileValue.maxGuideStartHeight
	if(input.timeoutRemainingMs < profileValue.timeoutWindowMs) return true
	if(input.elapsedMs >= profileValue.forceGuideElapsedMs) {
		return input.groundImpactCount >= profileValue.minGroundImpacts || nearGuideHeight
	}
	if(input.groundImpactCount < profileValue.minGroundImpacts) return false
	if(
		input.firstGroundImpactElapsedMs !== undefined
		&& input.elapsedMs - input.firstGroundImpactElapsedMs < profileValue.bounceGraceMs
	) return false
	return true
}

export const canStartFinalLock = (
	input: FinalLockInput,
	profileValue: PhysicsGuidanceProfile
): boolean => {
	const finalTimeout = input.timeoutRemainingMs < 80
	const nearFloor = input.positionY <= profileValue.maxLockHeight
	const recentBodyContact = input.lastBodyContactElapsedMs !== undefined
		&& input.elapsedMs - input.lastBodyContactElapsedMs < profileValue.bodyContactSettleDelayMs
	const hasFloorSupport = input.hasGroundContact || input.groundContactElapsedMs > 180 || finalTimeout
	return nearFloor
		&& hasFloorSupport
		&& (!recentBodyContact || finalTimeout)
		&& (input.angle < profileValue.angleThreshold || finalTimeout)
}
