export const DICE_PHYSICS_TIME_STEP = 1 / 90
export const DICE_PHYSICS_SUB_TIME_STEP_MS = 1000 / 90
export const DICE_FALL_RECOVERY_Y = -2
export const DICE_HORIZONTAL_RECOVERY_LIMIT = 11.5

export interface PhysicsBodyPosition {
	readonly x: number
	readonly y: number
	readonly z: number
}

export const shouldRecoverPhysicsBody = (position: PhysicsBodyPosition): boolean =>
	!Number.isFinite(position.x)
	|| !Number.isFinite(position.y)
	|| !Number.isFinite(position.z)
	|| position.y < DICE_FALL_RECOVERY_Y
	|| Math.abs(position.x) > DICE_HORIZONTAL_RECOVERY_LIMIT
	|| Math.abs(position.z) > DICE_HORIZONTAL_RECOVERY_LIMIT
