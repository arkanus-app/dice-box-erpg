import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'

export type PhysicsGuidanceState = 'freeFall' | 'guidedSettle' | 'finalLock' | 'commit' | 'complete'

export interface PhysicsGuidanceProfile {
	readonly minElapsedMs: number
	readonly forceGuideElapsedMs: number
	readonly minGroundImpacts: number
	readonly bounceGraceMs: number
	readonly durationMs: number
	readonly angleThreshold: number
	readonly settleDeadZoneAngle: number
	readonly landingSpinRetention: number
	readonly landingApproachAngle: number
	readonly finalLockDurationMs: number
	readonly angularStrength: number
	readonly maxAngularVelocity: number
	readonly linearDampingStart: number
	readonly linearDampingEnd: number
	readonly settleAngularDampingStart: number
	readonly settleAngularDampingEnd: number
	readonly maxLockHeight: number
	readonly maxGuideStartHeight: number
	readonly bodyContactSettleDelayMs: number
	readonly timeoutWindowMs: number
	readonly timeoutExtensionMs: number
	readonly flightAngularStrength: number
	readonly flightMaxAngularAcceleration: number
	readonly settleMaxAngularAcceleration: number
	readonly stableDurationMs: number
	readonly minFinalLockElapsedMs: number
	readonly maxSettleLinearVelocity: number
	readonly maxSettleAngularVelocity: number
	readonly finalLockMaxAngularSpeed: number
	readonly forcedLockMaxAngularSpeed: number
	readonly landingBrakeStart: number
	readonly maxLandingVerticalSpeed: number
}

export interface QuaternionCorrection {
	readonly angle: number
	readonly axis: Vector3
}

export interface ResultFaceFrame {
	readonly localNormal: Vector3
	readonly restDirection: Vector3
}

export interface FaceAlignment {
	readonly angle: number
	readonly axis: Vector3
	readonly targetQuaternion: Quaternion
}

export interface TolerantFaceAlignment extends FaceAlignment {
	/** Face error intentionally retained at the target pose. */
	readonly remainingAngle: number
}

export type FaceGuidancePhase = 'flight' | 'settle'

export interface FaceGuidanceResult extends FaceAlignment {
	readonly velocity: Vector3
}

export interface PlannedFlightGuidanceResult extends FaceGuidanceResult {
	readonly correctionVelocity: Vector3
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
	readonly angularSpeed: number
	readonly elapsedMs: number
	readonly groundContactElapsedMs: number
	readonly hasGroundContact: boolean
	readonly bodyContactElapsedMs?: number
	readonly lastBodyContactElapsedMs?: number
	readonly linearSpeed: number
	readonly positionY: number
	readonly stableElapsedMs: number
}

const BASE_PROFILE: PhysicsGuidanceProfile = {
	minElapsedMs: 500,
	forceGuideElapsedMs: 1320,
	minGroundImpacts: 1,
	bounceGraceMs: 130,
	durationMs: 1800,
	angleThreshold: 0.04,
	settleDeadZoneAngle: 0.024,
	landingSpinRetention: 0.28,
	landingApproachAngle: 0.12,
	finalLockDurationMs: 220,
	angularStrength: 7.2,
	maxAngularVelocity: 7,
	linearDampingStart: 0.985,
	linearDampingEnd: 0.955,
	settleAngularDampingStart: 0.998,
	settleAngularDampingEnd: 0.965,
	maxLockHeight: 2.05,
	maxGuideStartHeight: 3.2,
	bodyContactSettleDelayMs: 180,
	timeoutWindowMs: 650,
	timeoutExtensionMs: 900,
	flightAngularStrength: 0.72,
	flightMaxAngularAcceleration: 2.2,
	settleMaxAngularAcceleration: 32,
	stableDurationMs: 180,
	minFinalLockElapsedMs: 2300,
	maxSettleLinearVelocity: 0.28,
	maxSettleAngularVelocity: 0.38,
	finalLockMaxAngularSpeed: 0.75,
	forcedLockMaxAngularSpeed: 1.8,
	landingBrakeStart: 0.86,
	maxLandingVerticalSpeed: 2.6
}

const profile = (overrides: Partial<PhysicsGuidanceProfile> = {}): PhysicsGuidanceProfile => ({
	...BASE_PROFILE,
	...overrides
})

const PROFILES: Readonly<Record<number, PhysicsGuidanceProfile>> = {
	2: profile({
		minElapsedMs: 450,
		forceGuideElapsedMs: 1120,
		durationMs: 1450,
		angularStrength: 4.2,
		maxAngularVelocity: 5.2,
		landingSpinRetention: 0.1,
		landingApproachAngle: 0.055,
		linearDampingStart: 0.98,
		linearDampingEnd: 0.94,
		settleAngularDampingStart: 0.996,
		settleAngularDampingEnd: 0.955,
		maxGuideStartHeight: 2.6,
		flightMaxAngularAcceleration: 1.6,
		settleMaxAngularAcceleration: 12,
		stableDurationMs: 220,
		minFinalLockElapsedMs: 1900,
		settleDeadZoneAngle: 0.018,
		maxSettleLinearVelocity: 0.22,
		maxSettleAngularVelocity: 0.28,
		finalLockMaxAngularSpeed: 0.6,
		landingBrakeStart: 0.8,
		maxLandingVerticalSpeed: 1.4
	}),
	4: profile({
		minElapsedMs: 580,
		forceGuideElapsedMs: 1500,
		durationMs: 1900,
		angularStrength: 4.6,
		maxAngularVelocity: 5.5,
		landingSpinRetention: 0.18,
		landingApproachAngle: 0.08,
		linearDampingStart: 0.983,
		linearDampingEnd: 0.95,
		settleAngularDampingStart: 0.997,
		settleAngularDampingEnd: 0.962,
		maxGuideStartHeight: 2.8,
		settleMaxAngularAcceleration: 18,
		stableDurationMs: 200,
		minFinalLockElapsedMs: 2400,
		maxSettleLinearVelocity: 0.24,
		maxSettleAngularVelocity: 0.32,
		landingBrakeStart: 0.83,
		maxLandingVerticalSpeed: 2
	}),
	6: profile({
		minElapsedMs: 540,
		forceGuideElapsedMs: 1400,
		durationMs: 1850,
		angularStrength: 7.2,
		maxAngularVelocity: 6.1,
		maxLandingVerticalSpeed: 2.5
	}),
	8: profile(),
	10: profile({
		forceGuideElapsedMs: 1300,
		durationMs: 1750,
		angularStrength: 8,
		maxAngularVelocity: 7.2,
		settleMaxAngularAcceleration: 36,
		landingBrakeStart: 0.85,
		maxLandingVerticalSpeed: 2.2
	}),
	12: profile(),
	20: profile({
		minElapsedMs: 460,
		forceGuideElapsedMs: 1220,
		durationMs: 1700,
		angularStrength: 8,
		maxAngularVelocity: 7.8,
		landingSpinRetention: 0.32,
		landingApproachAngle: 0.19,
		minFinalLockElapsedMs: 2400,
		flightMaxAngularAcceleration: 2.8,
		settleMaxAngularAcceleration: 36,
		landingBrakeStart: 0.92,
		maxLandingVerticalSpeed: 3.6
	}),
	100: profile({
		forceGuideElapsedMs: 1300,
		durationMs: 1750,
		angularStrength: 8,
		maxAngularVelocity: 7.2,
		settleMaxAngularAcceleration: 36,
		landingBrakeStart: 0.85,
		maxLandingVerticalSpeed: 2.2
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

const TAU = Math.PI * 2
const FLIGHT_SPIN_PLATEAU = 0.72
const MAX_PLANNED_CONTACT_ANGULAR_SPEED = 2.6

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

export const getResultFaceFrame = (
	targetQuaternion: Quaternion,
	sides: number
): ResultFaceFrame => {
	const restDirection = sides === 4 ? Vector3.Down() : Vector3.Up()
	return {
		localNormal: restDirection.applyRotationQuaternion(targetQuaternion.conjugate()).normalize(),
		restDirection
	}
}

/** Returns the smallest world-space rotation that puts only the resolved face
 * upright. Rotation around that face is intentionally left untouched. */
export const getFaceAlignment = (
	currentQuaternion: Quaternion,
	localNormal: Vector3,
	restDirection: Vector3
): FaceAlignment => {
	const current = currentQuaternion.clone().normalize()
	const worldNormal = localNormal.applyRotationQuaternion(current).normalize()
	const rest = restDirection.clone().normalize()
	const delta = Quaternion.Identity()
	Quaternion.FromUnitVectorsToRef(worldNormal, rest, delta)
	const targetQuaternion = delta.multiply(current).normalize()
	const correction = getQuaternionCorrection(current, targetQuaternion)
	return correction
		? { angle: correction.angle, axis: correction.axis, targetQuaternion }
		: { angle: 0, axis: Vector3.Zero(), targetQuaternion: current }
}

/** Builds the smallest correction that enters a safe top-face cone instead of
 * flattening the resolved face to a mathematically perfect pose. */
export const getTolerantFaceAlignment = (
	currentQuaternion: Quaternion,
	localNormal: Vector3,
	restDirection: Vector3,
	allowedAngle: number
): TolerantFaceAlignment => {
	const current = currentQuaternion.clone().normalize()
	const alignment = getFaceAlignment(current, localNormal, restDirection)
	const remainingAngle = Math.min(
		alignment.angle,
		Math.max(0, Number.isFinite(allowedAngle) ? allowedAngle : 0)
	)
	const correctionAngle = Math.max(0, alignment.angle - remainingAngle)
	if(correctionAngle <= 0.0001) return {
		angle: 0,
		axis: Vector3.Zero(),
		targetQuaternion: current,
		remainingAngle: alignment.angle
	}
	return {
		angle: correctionAngle,
		axis: alignment.axis,
		targetQuaternion: Quaternion.RotationAxis(alignment.axis, correctionAngle)
			.multiply(current)
			.normalize(),
		remainingAngle
	}
}

export const estimateBallisticFlightSeconds = (
	startHeight: number,
	supportHeight: number,
	initialVerticalVelocity: number,
	gravity: number
): number => {
	const height = Math.max(0, startHeight - supportHeight)
	const downwardGravity = Math.max(0.001, Math.abs(gravity))
	const velocity = Number.isFinite(initialVerticalVelocity) ? initialVerticalVelocity : 0
	return clamp((
		velocity + Math.sqrt(Math.max(0, velocity * velocity + 2 * downwardGravity * height))
	) / downwardGravity, 0.05, 4)
}

/** Precomputes an arbitrary-looking starting pose whose unperturbed spin reaches
 * the known result pose at the estimated first contact. */
export const createPrecomputedFlightQuaternion = (
	targetQuaternion: Quaternion,
	angularVelocity: Vector3,
	flightSeconds: number
): Quaternion => {
	const speed = angularVelocity.length()
	if(!Number.isFinite(speed) || speed < 0.0001 || !Number.isFinite(flightSeconds)) {
		return targetQuaternion.clone().normalize()
	}
	const reverseFlight = Quaternion.RotationAxis(
		angularVelocity.scale(1 / speed),
		-speed * Math.max(0, flightSeconds)
	)
	return reverseFlight.multiply(targetQuaternion).normalize()
}

/** Tilts the resolved face slightly into the horizontal travel direction so
 * first contact happens on an edge instead of dissipating all motion on a
 * perfectly flat face. The angle remains far inside every supported face cone. */
export const createLandingApproachQuaternion = (
	targetQuaternion: Quaternion,
	horizontalTravel: Vector3,
	approachAngle: number
): Quaternion => {
	const direction = new Vector3(horizontalTravel.x, 0, horizontalTravel.z)
	const angle = clamp(
		Number.isFinite(approachAngle) ? Math.max(0, approachAngle) : 0,
		0,
		0.2
	)
	if(direction.lengthSquared() <= 1e-8 || angle <= 0.0001) {
		return targetQuaternion.clone().normalize()
	}
	direction.normalize()
	const rollAxis = Vector3.Cross(Vector3.Up(), direction).normalize()
	return Quaternion.RotationAxis(rollAxis, angle)
		.multiply(targetQuaternion)
		.normalize()
}

export const getLandingRollAxis = (horizontalTravel: Vector3): Vector3 => {
	const direction = new Vector3(horizontalTravel.x, 0, horizontalTravel.z)
	if(direction.lengthSquared() <= 1e-8) return Vector3.Right()
	direction.normalize()
	return Vector3.Cross(Vector3.Up(), direction).normalize()
}

/** Converts the old off-centre impulse into deterministic angular velocity.
 * The roll kick is included before preflight, so it produces the immediate
 * tumble of v1 without invalidating the known result orientation. */
export const getThrownAngularVelocity = (
	seededVelocity: Vector3,
	horizontalTravel: Vector3,
	horizontalSpeed: number,
	horizontalRadius: number,
	sides: number
): Vector3 => {
	const rollAxis = getLandingRollAxis(horizontalTravel)
	const safeRadius = Math.max(0.45, Number.isFinite(horizontalRadius) ? horizontalRadius : 0)
	const speed = Math.max(0, Number.isFinite(horizontalSpeed) ? horizontalSpeed : 0)
	const maximumKick = sides === 2 ? 1.8 : 5.5
	const kickMagnitude = Math.min(maximumKick, speed / safeRadius * 0.28)
	if(kickMagnitude <= 0.0001) return seededVelocity.clone()
	const projectedSpin = Vector3.Dot(seededVelocity, rollAxis)
	const direction = projectedSpin < 0 ? -1 : 1
	return seededVelocity.add(rollAxis.scale(kickMagnitude * direction))
}

/** Converts the seeded throw into a visible, deterministic tumble plan. The
 * dominant axis follows the old off-centre roll impulse, while small seeded
 * travel/twist components keep throws from looking identical. The magnitude
 * is expressed as complete turns over the planned flight, so a higher launch
 * cannot silently dilute the animation. */
export const getVisibleFlightAngularVelocity = (
	seededVelocity: Vector3,
	horizontalTravel: Vector3,
	flightSeconds: number,
	sides: number,
	spinForce = 5.8
): Vector3 => {
	const duration = Math.max(0.05, Number.isFinite(flightSeconds) ? flightSeconds : 0)
	const configuredScale = clamp(
		(Number.isFinite(spinForce) ? Math.max(0, spinForce) : 0) / 5.8,
		0,
		1.5
	)
	if(configuredScale <= 0) return Vector3.Zero()
	// Deliberately use a non-integer number of turns. An integer preflight can
	// place the resolved face upward at both ends, making the die look already
	// solved before physics starts even though its quaternion is changing.
	const desiredTurns = (sides === 2
		? 2.5
		: sides === 20
			? 2.45
			: 2.35) * configuredScale
	const maximumAverageSpeed = sides === 2 ? 22 : 20
	const averageSpeed = clamp(
		TAU * desiredTurns / duration,
		Math.min(12, maximumAverageSpeed * configuredScale),
		maximumAverageSpeed * Math.max(0.35, configuredScale)
	)
	const rollAxis = getLandingRollAxis(horizontalTravel)
	const travelAxis = new Vector3(horizontalTravel.x, 0, horizontalTravel.z)
	if(travelAxis.lengthSquared() <= 1e-8) travelAxis.copyFrom(Vector3.Forward())
	else travelAxis.normalize()
	const seedDirection = seededVelocity.lengthSquared() > 1e-8
		? seededVelocity.normalizeToNew()
		: rollAxis
	const projectedRoll = Vector3.Dot(seedDirection, rollAxis)
	const rollSign = projectedRoll < -0.0001 ? -1 : 1
	const travelWeight = clamp(Vector3.Dot(seedDirection, travelAxis), -0.28, 0.28)
	const twistWeight = clamp(Vector3.Dot(seedDirection, Vector3.Up()), -0.22, 0.22)
	return rollAxis.scale(rollSign)
		.add(travelAxis.scale(travelWeight))
		.add(Vector3.Up().scale(twistWeight))
		.normalize()
		.scale(averageSpeed)
}

const getFlightSpinCurve = (
	progress: number,
	landingSpinRetention: number,
	averageSpeed: number
): { readonly rotationProgress: number; readonly velocityScale: number } => {
	const p = clamp(progress, 0, 1)
	const plateau = FLIGHT_SPIN_PLATEAU
	const requestedRetention = clamp(landingSpinRetention, 0, 1)
	const safeAverageSpeed = Math.max(0, Number.isFinite(averageSpeed) ? averageSpeed : 0)
	const baseIntegral = plateau + (1 - plateau) / 2
	const retentionIntegral = (1 - plateau) / 2
	const cappedRetention = safeAverageSpeed > MAX_PLANNED_CONTACT_ANGULAR_SPEED
		? MAX_PLANNED_CONTACT_ANGULAR_SPEED * baseIntegral / Math.max(
			0.0001,
			safeAverageSpeed - MAX_PLANNED_CONTACT_ANGULAR_SPEED * retentionIntegral
		)
		: 1
	const retainedSpin = Math.min(requestedRetention, cappedRetention)
	const normalization = 1 / (
		plateau + (1 - plateau) * (1 + retainedSpin) / 2
	)
	if(p <= plateau) return {
		rotationProgress: normalization * p,
		velocityScale: normalization
	}
	const tailProgress = (p - plateau) / (1 - plateau)
	const smoothTail = smoothStep(tailProgress)
	// Integral of smoothStep(u) = 3u² - 2u³ over [0, t].
	const integratedSmoothTail = Math.pow(tailProgress, 3)
		- Math.pow(tailProgress, 4) / 2
	return {
		rotationProgress: normalization * (
			plateau + (1 - plateau) * (
				tailProgress - (1 - retainedSpin) * integratedSmoothTail
			)
		),
		velocityScale: normalization * (
			1 - (1 - retainedSpin) * smoothTail
		)
	}
}

/** Keeps a small rolling component alive after the impact solver dissipates
 * the first edge contact. It fades during the first 60% of guidance and never
 * removes stronger motion produced by real collisions. */
export const getSustainedRollAngularVelocity = (
	currentVelocity: Vector3,
	rollAxis: Vector3,
	profileValue: PhysicsGuidanceProfile,
	guidanceElapsedMs: number,
	deltaMs: number
): Vector3 => {
	const axis = rollAxis.clone()
	if(axis.lengthSquared() <= 1e-8) return currentVelocity.clone()
	axis.normalize()
	const sustainDurationMs = Math.max(1, profileValue.durationMs * 0.6)
	const sustainProgress = smoothStep(guidanceElapsedMs / sustainDurationMs)
	const desiredRollSpeed = profileValue.landingSpinRetention * 3.2 * (1 - sustainProgress)
	const currentRollSpeed = Vector3.Dot(currentVelocity, axis)
	const currentRollMagnitude = Math.abs(currentRollSpeed)
	if(currentRollMagnitude >= desiredRollSpeed || desiredRollSpeed <= 0.0001) {
		return currentVelocity.clone()
	}
	// Keep whichever direction the actual impact produced. Selecting a fixed
	// sign here would visibly brake and reverse half of the seeded throws.
	const rollDirection = currentRollSpeed < -0.0001 ? -1 : 1
	const maximumDelta = profileValue.flightMaxAngularAcceleration
		* 12
		* Math.max(0.0001, deltaMs / 1000)
	return currentVelocity.add(axis.scale(
		rollDirection * Math.min(desiredRollSpeed - currentRollMagnitude, maximumDelta)
	))
}

/** Replays the result-aware launch plan without steering toward the final pose
 * ahead of schedule. A correction motor can compare against this moving pose
 * and only compensate for real disturbances such as wall or body contacts. */
export const getPlannedFlightQuaternion = (
	startQuaternion: Quaternion,
	angularVelocity: Vector3,
	elapsedSeconds: number,
	flightSeconds: number,
	landingSpinRetention = 0
): Quaternion => {
	const speed = angularVelocity.length()
	if(!Number.isFinite(speed) || speed < 0.0001) return startQuaternion.clone().normalize()
	const duration = Math.max(0, Number.isFinite(flightSeconds) ? flightSeconds : 0)
	const progress = duration > 0
		? clamp((Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0) / duration, 0, 1)
		: 1
	// The eased segment keeps the same total rotation used by the preflight solve,
	// while the linear tail deliberately preserves a small spin at contact. This
	// lets the first edge/corner impact become a visible roll instead of a stop.
	const { rotationProgress } = getFlightSpinCurve(
		progress,
		landingSpinRetention,
		speed
	)
	return Quaternion.RotationAxis(
		angularVelocity.scale(1 / speed),
		speed * duration * rotationProgress
	).multiply(startQuaternion).normalize()
}

/** Angular feed-forward for the eased flight plan with retained contact spin.
 * The supplied velocity is the average spin used by the preflight solve. */
export const getPlannedFlightSpin = (
	averageVelocity: Vector3,
	elapsedSeconds: number,
	flightSeconds: number,
	landingSpinRetention = 0
): Vector3 => {
	const duration = Math.max(0, Number.isFinite(flightSeconds) ? flightSeconds : 0)
	const progress = duration > 0
		? clamp((Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0) / duration, 0, 1)
		: 1
	return averageVelocity.scale(
		getFlightSpinCurve(
			progress,
			landingSpinRetention,
			averageVelocity.length()
		).velocityScale
	)
}

/** Preserves the initial throw, then converges horizontal motion on the planned
 * landing while limiting final downward speed. This prevents wall overshoot
 * and keeps a correct face from being kicked onto a neighbour at contact. */
export const getSoftLandingLinearVelocity = (
	currentVelocity: Vector3,
	currentPosition: Vector3,
	targetPosition: Vector3,
	profileValue: PhysicsGuidanceProfile,
	progress: number,
	minimumHorizontalSpeed = 0
): Vector3 => {
	const brakeProgress = smoothStep(
		(clamp01(progress) - profileValue.landingBrakeStart)
		/ Math.max(0.001, 1 - profileValue.landingBrakeStart)
	)
	const limitedVerticalVelocity = Math.max(
		currentVelocity.y,
		-profileValue.maxLandingVerticalSpeed
	)
	const horizontalSpeed = Math.max(
		0.5,
		Math.hypot(currentVelocity.x, currentVelocity.z)
	)
	const desiredHorizontal = new Vector3(
		(targetPosition.x - currentPosition.x) / 0.28,
		0,
		(targetPosition.z - currentPosition.z) / 0.28
	)
	if(desiredHorizontal.length() > horizontalSpeed) {
		desiredHorizontal.normalize().scaleInPlace(horizontalSpeed)
	}
	const retainedSpeed = Math.max(
		0,
		Number.isFinite(minimumHorizontalSpeed) ? minimumHorizontalSpeed : 0
	)
	if(desiredHorizontal.length() < retainedSpeed) {
		const currentHorizontal = new Vector3(currentVelocity.x, 0, currentVelocity.z)
		const canContinueTowardTarget = desiredHorizontal.lengthSquared() > 1e-8
			&& Vector3.Dot(desiredHorizontal, currentHorizontal) > 0
		const retainedDirection = canContinueTowardTarget ? desiredHorizontal : currentHorizontal
		if(retainedDirection.lengthSquared() > 1e-8) {
			desiredHorizontal.copyFrom(retainedDirection.normalize().scale(retainedSpeed))
		}
	}
	return new Vector3(
		lerp(currentVelocity.x, desiredHorizontal.x, brakeProgress),
		lerp(currentVelocity.y, limitedVerticalVelocity, brakeProgress),
		lerp(currentVelocity.z, desiredHorizontal.z, brakeProgress)
	)
}

/** Tracks the moving launch plan instead of pulling the die toward its final
 * face too early. The launch spin is feed-forward velocity, so the controller
 * changes only the disturbance component introduced by real collisions. */
export const getPlannedFlightAngularVelocity = (
	currentVelocity: Vector3,
	currentQuaternion: Quaternion,
	localNormal: Vector3,
	plannedQuaternion: Quaternion,
	plannedVelocity: Vector3,
	previousCorrectionVelocity: Vector3,
	remainingFlightSeconds: number,
	profileValue: PhysicsGuidanceProfile,
	progress: number,
	deltaMs: number
): PlannedFlightGuidanceResult => {
	const plannedFaceDirection = localNormal
		.applyRotationQuaternion(plannedQuaternion)
		.normalize()
	const alignment = getFaceAlignment(
		currentQuaternion,
		localNormal,
		plannedFaceDirection
	)
	const disturbanceVelocity = currentVelocity.subtract(plannedVelocity)
	const twistSpeed = clamp(
		Vector3.Dot(disturbanceVelocity, plannedFaceDirection),
		-profileValue.maxAngularVelocity,
		profileValue.maxAngularVelocity
	)
	if(alignment.angle <= 0.0001) return {
		...alignment,
		velocity: plannedVelocity.add(plannedFaceDirection.scale(twistSpeed)),
		correctionVelocity: Vector3.Zero()
	}
	const eased = smoothStep(progress)
	const remainingSeconds = Math.max(
		0.05,
		Number.isFinite(remainingFlightSeconds) ? remainingFlightSeconds : 0
	)
	const strength = Math.max(
		profileValue.flightAngularStrength * lerp(0.35, 1, eased),
		3 / remainingSeconds
	)
	const desiredSpeed = Math.min(
		profileValue.maxAngularVelocity,
		alignment.angle * strength
	)
	const deadlineAcceleration = 8 * alignment.angle / (remainingSeconds * remainingSeconds)
	const maximumAcceleration = Math.max(
		profileValue.flightMaxAngularAcceleration,
		Math.min(profileValue.settleMaxAngularAcceleration, deadlineAcceleration)
	)
	const maximumDelta = Math.max(0, maximumAcceleration)
		* Math.max(0.0001, deltaMs / 1000)
	const currentCorrectionSpeed = Vector3.Dot(previousCorrectionVelocity, alignment.axis)
	const correctionSpeed = clamp(
		currentCorrectionSpeed + clamp(
			desiredSpeed - currentCorrectionSpeed,
			-maximumDelta,
			maximumDelta
		),
		-profileValue.maxAngularVelocity,
		profileValue.maxAngularVelocity
	)
	const correctionVelocity = alignment.axis.scale(correctionSpeed)
	return {
		...alignment,
		velocity: plannedVelocity
			.add(plannedFaceDirection.scale(twistSpeed))
			.add(correctionVelocity),
		correctionVelocity
	}
}

export const getFaceGuidedAngularVelocity = (
	currentVelocity: Vector3,
	currentQuaternion: Quaternion,
	localNormal: Vector3,
	restDirection: Vector3,
	profileValue: PhysicsGuidanceProfile,
	progress: number,
	deltaMs: number,
	phase: FaceGuidancePhase
): FaceGuidanceResult => {
	const alignment = getFaceAlignment(currentQuaternion, localNormal, restDirection)
	const eased = smoothStep(progress)
	const damping = phase === 'flight'
		? 1
		: frameAdjustedFactor(lerp(
			profileValue.settleAngularDampingStart,
			profileValue.settleAngularDampingEnd,
			eased
		), deltaMs)
	const velocity = currentVelocity.scale(damping)
	const correctionDeadZone = phase === 'settle'
		? profileValue.settleDeadZoneAngle
		: 0.0001
	if(alignment.angle <= correctionDeadZone) return { ...alignment, velocity }

	const strength = phase === 'flight'
		? profileValue.flightAngularStrength * lerp(0.35, 1, eased)
		: profileValue.angularStrength * lerp(0.3, 1, eased)
	const desiredSpeed = Math.min(profileValue.maxAngularVelocity, alignment.angle * strength)
	const currentCorrectionSpeed = Vector3.Dot(velocity, alignment.axis)
	const maximumAcceleration = phase === 'flight'
		? profileValue.flightMaxAngularAcceleration
		: lerp(profileValue.flightMaxAngularAcceleration, profileValue.settleMaxAngularAcceleration, eased)
	const maximumDelta = Math.max(0, maximumAcceleration) * Math.max(0.0001, deltaMs / 1000)
	const correctionDelta = clamp(
		desiredSpeed - currentCorrectionSpeed,
		-maximumDelta,
		maximumDelta
	)
	velocity.addInPlace(alignment.axis.scale(correctionDelta))
	return { ...alignment, velocity }
}

export const getFinalLockDurationMs = (
	angle: number,
	profileValue: PhysicsGuidanceProfile,
	forced: boolean
): number => {
	const maximumSpeed = forced
		? profileValue.forcedLockMaxAngularSpeed
		: profileValue.finalLockMaxAngularSpeed
	return Math.max(
		profileValue.finalLockDurationMs,
		Math.max(0, angle) / Math.max(0.05, maximumSpeed) * 1000
	)
}

const frameAdjustedFactor = (factor: number, deltaMs: number): number =>
	Math.pow(clamp(factor, 0, 1), Math.max(0.01, deltaMs / (1000 / 60)))

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

export const canBodyContactActAsSupport = (
	elapsedMs: number,
	flightDurationMs: number,
	positionY: number,
	profileValue: PhysicsGuidanceProfile
): boolean => elapsedMs >= Math.max(0, flightDurationMs) * 0.75
	|| positionY <= profileValue.maxGuideStartHeight

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
	if(input.elapsedMs < profileValue.minFinalLockElapsedMs) return false
	const nearFloor = input.positionY <= profileValue.maxLockHeight
	const recentBodyContact = input.lastBodyContactElapsedMs !== undefined
		&& input.elapsedMs - input.lastBodyContactElapsedMs < profileValue.bodyContactSettleDelayMs
		&& (input.bodyContactElapsedMs ?? 0) < profileValue.bodyContactSettleDelayMs
	const hasFloorSupport = input.hasGroundContact || input.groundContactElapsedMs > 180
	return nearFloor
		&& hasFloorSupport
		&& !recentBodyContact
		&& input.angle < profileValue.angleThreshold
		&& input.linearSpeed <= profileValue.maxSettleLinearVelocity
		&& input.angularSpeed <= profileValue.maxSettleAngularVelocity
		&& input.stableElapsedMs >= profileValue.stableDurationMs
}
