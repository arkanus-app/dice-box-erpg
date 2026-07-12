export interface DisplayViewportBoundsInput {
	readonly width: number
	readonly height: number
	readonly cameraHeight: number
	readonly cameraFov: number
	readonly wallPadding?: number
	readonly planeY?: number
	readonly minimumRadius?: number
}

export interface DisplayViewportBounds {
	readonly width: number
	readonly height: number
	readonly aspect: number
	readonly planeY: number
	readonly visibleHalfX: number
	readonly visibleHalfZ: number
	readonly halfX: number
	readonly halfZ: number
	readonly left: number
	readonly right: number
	readonly north: number
	readonly south: number
}

export interface HorizontalCenterBounds {
	readonly minX: number
	readonly maxX: number
	readonly minZ: number
	readonly maxZ: number
}

const MINIMUM_HALF_SPAN = 0.55
export const VIEWPORT_COLLISION_GAP = 0.06

const positiveFinite = (value: number, fallback: number): number =>
	Number.isFinite(value) && value > 0 ? value : fallback

const nonNegativeFinite = (value: number | undefined): number =>
	Number.isFinite(value) ? Math.max(0, value ?? 0) : 0

export const clampValue = (value: number, minimum: number, maximum: number): number =>
	Math.max(minimum, Math.min(maximum, value))

/**
 * Projects the full canvas rectangle onto a horizontal plane for the fixed
 * top-down display camera. The returned inner faces are inset by wallPadding,
 * while always retaining enough room for at least one requested body.
 */
export const computeDisplayViewportBounds = (
	input: DisplayViewportBoundsInput
): DisplayViewportBounds => {
	const width = positiveFinite(input.width, 1)
	const height = positiveFinite(input.height, 1)
	const cameraHeight = positiveFinite(input.cameraHeight, 1)
	const cameraFov = clampValue(positiveFinite(input.cameraFov, 0.28), 0.01, Math.PI - 0.01)
	const planeY = Number.isFinite(input.planeY) ? Math.min(input.planeY ?? 0, cameraHeight - 0.01) : 0
	const distance = Math.max(0.01, cameraHeight - planeY)
	const aspect = width / height
	const visibleHalfZ = distance * Math.tan(cameraFov / 2)
	const visibleHalfX = visibleHalfZ * aspect
	const wallPadding = nonNegativeFinite(input.wallPadding)
	const minimumRadius = nonNegativeFinite(input.minimumRadius)
	// When a host becomes narrower than a die, keeping the body physically
	// valid takes precedence over placing both walls inside that impossible
	// projection. The wall may sit just outside the clipped viewport, but it
	// never starts intersecting the body or creates an inverted enclosure.
	const minimumHalfX = Math.max(MINIMUM_HALF_SPAN, minimumRadius + VIEWPORT_COLLISION_GAP)
	const minimumHalfZ = Math.max(MINIMUM_HALF_SPAN, minimumRadius + VIEWPORT_COLLISION_GAP)
	const halfX = Math.max(minimumHalfX, visibleHalfX - wallPadding)
	const halfZ = Math.max(minimumHalfZ, visibleHalfZ - wallPadding)

	return {
		width,
		height,
		aspect,
		planeY,
		visibleHalfX,
		visibleHalfZ,
		halfX,
		halfZ,
		left: -halfX,
		right: halfX,
		north: -halfZ,
		south: halfZ
	}
}

export const getHorizontalCenterBounds = (
	bounds: DisplayViewportBounds,
	radius: number,
	gap = VIEWPORT_COLLISION_GAP
): HorizontalCenterBounds => {
	const inset = nonNegativeFinite(radius) + nonNegativeFinite(gap)
	const minX = bounds.left + inset
	const maxX = bounds.right - inset
	const minZ = bounds.north + inset
	const maxZ = bounds.south - inset
	const centerX = (bounds.left + bounds.right) / 2
	const centerZ = (bounds.north + bounds.south) / 2
	return {
		minX: minX <= maxX ? minX : centerX,
		maxX: minX <= maxX ? maxX : centerX,
		minZ: minZ <= maxZ ? minZ : centerZ,
		maxZ: minZ <= maxZ ? maxZ : centerZ
	}
}

export const clampHorizontalPosition = (
	position: { x: number; z: number },
	bounds: DisplayViewportBounds,
	radius: number
): boolean => {
	const centerBounds = getHorizontalCenterBounds(bounds, radius)
	const x = clampValue(Number.isFinite(position.x) ? position.x : 0, centerBounds.minX, centerBounds.maxX)
	const z = clampValue(Number.isFinite(position.z) ? position.z : 0, centerBounds.minZ, centerBounds.maxZ)
	const changed = x !== position.x || z !== position.z
	position.x = x
	position.z = z
	return changed
}
