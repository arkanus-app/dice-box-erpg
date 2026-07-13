export const DICE_PHYSICS_TIME_STEP = 1 / 90
export const DICE_PHYSICS_SUB_TIME_STEP_MS = 1000 / 90
export const DENSE_DICE_PHYSICS_TIME_STEP = 1 / 180
export const DENSE_DICE_PHYSICS_SUB_TIME_STEP_MS = 1000 / 180
export const LARGE_DICE_PHYSICS_TIME_STEP = 1 / 120
export const LARGE_DICE_PHYSICS_SUB_TIME_STEP_MS = 1000 / 120
export const DENSE_DICE_BODY_LIMIT = 24
export const PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER = 1.04
export const DICE_FALL_RECOVERY_Y = -2
export const DICE_HORIZONTAL_RECOVERY_LIMIT = 11.5

export interface PhysicsBodyPosition {
	readonly x: number
	readonly y: number
	readonly z: number
}

export interface PhysicsLaunchOccupant {
	readonly position: PhysicsBodyPosition
	readonly radius: number
}

export interface PhysicsAppendLaunchPlan {
	readonly position: PhysicsBodyPosition
	readonly useFallback: boolean
}

export interface DicePhysicsStep {
	readonly seconds: number
	readonly milliseconds: number
}

/** Uses extra Havok resolution while several bodies can converge in the air.
 * Very large presentations use 120 Hz to keep the solver cost bounded. */
export const getDicePhysicsStep = (bodyCount: number): DicePhysicsStep => {
	const count = Number.isFinite(bodyCount) ? Math.max(0, Math.floor(bodyCount)) : 0
	if(count <= 1) {
		return {
			seconds: DICE_PHYSICS_TIME_STEP,
			milliseconds: DICE_PHYSICS_SUB_TIME_STEP_MS
		}
	}
	if(count <= DENSE_DICE_BODY_LIMIT) {
		return {
			seconds: DENSE_DICE_PHYSICS_TIME_STEP,
			milliseconds: DENSE_DICE_PHYSICS_SUB_TIME_STEP_MS
		}
	}
	return {
		seconds: LARGE_DICE_PHYSICS_TIME_STEP,
		milliseconds: LARGE_DICE_PHYSICS_SUB_TIME_STEP_MS
	}
}

/** Prevents a delayed body from being enabled inside one that has already
 * crossed the launch lane. The circumscribed radii make this conservative for
 * every supported polyhedron while preserving real contacts after admission. */
export const hasPhysicsLaunchClearance = (
	position: PhysicsBodyPosition,
	radius: number,
	occupants: readonly PhysicsLaunchOccupant[]
): boolean => {
	for(const occupant of occupants) {
		if(!hasPhysicsLaunchPairClearance(
			position,
			radius,
			occupant.position,
			occupant.radius
		)) return false
	}
	return true
}

export const hasPhysicsLaunchPairClearance = (
	position: PhysicsBodyPosition,
	radius: number,
	occupantPosition: PhysicsBodyPosition,
	occupantRadius: number
): boolean => {
	const safeRadius = Number.isFinite(radius) ? Math.max(0, radius) : 0
	const safeOccupantRadius = Number.isFinite(occupantRadius)
		? Math.max(0, occupantRadius)
		: 0
	const minimumDistance = (safeRadius + safeOccupantRadius)
		* PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
	const deltaX = position.x - occupantPosition.x
	const deltaY = position.y - occupantPosition.y
	const deltaZ = position.z - occupantPosition.z
	return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
		>= minimumDistance * minimumDistance
}

const PHYSICS_APPEND_CLEARANCE_EPSILON = 0.001

/** Finds the lowest point directly above a requested source that clears every
 * active collider. Explosive children prefer that source, but use their
 * original edge launch when a safe source would leave the normal launch
 * volume. The fallback is lifted as a final safety measure and therefore
 * cannot deadlock admission behind a settled body. */
export const planPhysicsAppendLaunch = (
	desiredPosition: PhysicsBodyPosition,
	fallbackPosition: PhysicsBodyPosition,
	radius: number,
	occupants: readonly PhysicsLaunchOccupant[],
	maximumSourceY: number
): PhysicsAppendLaunchPlan => {
	const liftAboveOccupants = (
		position: PhysicsBodyPosition,
		maximumY: number
	): PhysicsBodyPosition | undefined => {
		let y = position.y
		const safeRadius = Number.isFinite(radius) ? Math.max(0, radius) : 0
		for(const occupant of occupants) {
			const occupantRadius = Number.isFinite(occupant.radius)
				? Math.max(0, occupant.radius)
				: 0
			const minimumDistance = (safeRadius + occupantRadius)
				* PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
			const deltaX = position.x - occupant.position.x
			const deltaZ = position.z - occupant.position.z
			const horizontalDistanceSquared = deltaX * deltaX + deltaZ * deltaZ
			const minimumDistanceSquared = minimumDistance * minimumDistance
			if(horizontalDistanceSquared >= minimumDistanceSquared) continue
			const verticalClearance = Math.sqrt(
				Math.max(0, minimumDistanceSquared - horizontalDistanceSquared)
			)
			y = Math.max(
				y,
				occupant.position.y + verticalClearance + PHYSICS_APPEND_CLEARANCE_EPSILON
			)
		}
		if(!Number.isFinite(y) || y > maximumY) return undefined
		const candidate = { x: position.x, y, z: position.z }
		return hasPhysicsLaunchClearance(candidate, safeRadius, occupants)
			? candidate
			: undefined
	}

	const source = liftAboveOccupants(desiredPosition, maximumSourceY)
	if(source) return { position: source, useFallback: false }
	return {
		position: liftAboveOccupants(fallbackPosition, Number.POSITIVE_INFINITY)
			?? { ...fallbackPosition },
		useFallback: true
	}
}

export const shouldRecoverPhysicsBody = (
	position: PhysicsBodyPosition,
	horizontalLimit = DICE_HORIZONTAL_RECOVERY_LIMIT
): boolean => {
	const limit = Number.isFinite(horizontalLimit)
		? Math.max(DICE_HORIZONTAL_RECOVERY_LIMIT, horizontalLimit)
		: DICE_HORIZONTAL_RECOVERY_LIMIT
	return !Number.isFinite(position.x)
		|| !Number.isFinite(position.y)
		|| !Number.isFinite(position.z)
		|| position.y < DICE_FALL_RECOVERY_Y
		|| Math.abs(position.x) > limit
		|| Math.abs(position.z) > limit
}
