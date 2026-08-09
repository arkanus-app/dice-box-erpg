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
	readonly origin: 'source' | 'overhead' | 'edge'
}

export interface PhysicsLandingBounds {
	readonly minX: number
	readonly maxX: number
	readonly minZ: number
	readonly maxZ: number
}

export interface DicePhysicsStep {
	readonly seconds: number
	readonly milliseconds: number
}

export interface AdaptiveDicePhysicsSituation {
	readonly totalBodyCount: number
	readonly activeBodyCount: number
	readonly requiresDenseResolution: boolean
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

/** Keeps the dense 180 Hz step only while several dice can still converge
 * without support. Once every unresolved die has made a real support contact,
 * 120 Hz is sufficient for settling; a lone remaining die uses the established
 * 90 Hz single-die step. The monotonic support signal prevents per-frame
 * oscillation, while appended timeline dice can opt back into 180 Hz. */
export const getAdaptiveDicePhysicsStep = (
	situation: AdaptiveDicePhysicsSituation
): DicePhysicsStep => {
	const activeBodyCount = Number.isFinite(situation.activeBodyCount)
		? Math.max(0, Math.floor(situation.activeBodyCount))
		: 0
	if(activeBodyCount <= 1) return getDicePhysicsStep(activeBodyCount)

	const totalBodyCount = Number.isFinite(situation.totalBodyCount)
		? Math.max(activeBodyCount, Math.floor(situation.totalBodyCount))
		: activeBodyCount
	if(totalBodyCount > DENSE_DICE_BODY_LIMIT || !situation.requiresDenseResolution) {
		return {
			seconds: LARGE_DICE_PHYSICS_TIME_STEP,
			milliseconds: LARGE_DICE_PHYSICS_SUB_TIME_STEP_MS
		}
	}
	return {
		seconds: DENSE_DICE_PHYSICS_TIME_STEP,
		milliseconds: DENSE_DICE_PHYSICS_SUB_TIME_STEP_MS
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

const hasPhysicsHorizontalClearance = (
	position: PhysicsBodyPosition,
	radius: number,
	occupants: readonly PhysicsLaunchOccupant[]
): boolean => {
	const safeRadius = Number.isFinite(radius) ? Math.max(0, radius) : 0
	for(const occupant of occupants) {
		const occupantRadius = Number.isFinite(occupant.radius)
			? Math.max(0, occupant.radius)
			: 0
		const minimumDistance = (safeRadius + occupantRadius)
			* PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
		const deltaX = position.x - occupant.position.x
		const deltaZ = position.z - occupant.position.z
		if(deltaX * deltaX + deltaZ * deltaZ < minimumDistance * minimumDistance) return false
	}
	return true
}

const clampLandingCoordinate = (value: number, minimum: number, maximum: number): number =>
	Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : 0))

/** Reserves a deterministic visible landing slot for an appended die. Timeline
 * children are planned separately from the initial throw, so their original
 * target often overlaps a root. The expanding golden-angle search keeps the
 * closest clear slot and lets Havok handle the genuinely full-board case. */
export const planPhysicsAppendLanding = (
	desiredPosition: PhysicsBodyPosition,
	radius: number,
	occupants: readonly PhysicsLaunchOccupant[],
	bounds: PhysicsLandingBounds
): PhysicsBodyPosition => {
	const clampCandidate = (x: number, z: number): PhysicsBodyPosition => ({
		x: clampLandingCoordinate(x, bounds.minX, bounds.maxX),
		y: desiredPosition.y,
		z: clampLandingCoordinate(z, bounds.minZ, bounds.maxZ)
	})
	const desired = clampCandidate(desiredPosition.x, desiredPosition.z)
	if(hasPhysicsHorizontalClearance(desired, radius, occupants)) return desired

	const safeRadius = Number.isFinite(radius) ? Math.max(0.01, radius) : 0.01
	const spacing = safeRadius * 2 * PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
	const goldenAngle = Math.PI * (3 - Math.sqrt(5))
	for(let index = 1; index <= 96; index++) {
		const distance = spacing * Math.sqrt(index)
		const angle = goldenAngle * index
		const candidate = clampCandidate(
			desired.x + Math.cos(angle) * distance,
			desired.z + Math.sin(angle) * distance
		)
		if(hasPhysicsHorizontalClearance(candidate, safeRadius, occupants)) return candidate
	}
	return desired
}

/** Finds the lowest point directly above a requested source that clears every
 * active collider. Explosive children prefer that source, then fall vertically
 * over their reserved landing slot. The original edge trajectory remains only
 * as an emergency for invalid geometry. */
export const planPhysicsAppendLaunch = (
	desiredPosition: PhysicsBodyPosition,
	overheadPosition: PhysicsBodyPosition,
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
	if(source) return { position: source, origin: 'source' }
	const overhead = liftAboveOccupants({
		x: overheadPosition.x,
		y: Math.max(overheadPosition.y, maximumSourceY),
		z: overheadPosition.z
	}, Number.POSITIVE_INFINITY)
	if(overhead) return { position: overhead, origin: 'overhead' }
	return {
		position: liftAboveOccupants(fallbackPosition, Number.POSITIVE_INFINITY)
			?? { ...fallbackPosition },
		origin: 'edge'
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
