import { IDENTITY_QUAT, lerp3, qnlerp, qslerp, type Quat, type ReadonlyQuat, type ReadonlyVec3, type Vec3 } from './vector'
import type { SimulationMarker } from './simulation'

/**
 * Precomputed physical motion: keyframes of position and physical orientation
 * per body, plus the visual rotation G applied on top of it.
 */
export interface Track {
	/** Per frame: x, y, z, qx, qy, qz, qw for each body. */
	readonly frames: readonly Float32Array[]
	readonly fps: number
	readonly bodyCount: number
	readonly releaseFrames: readonly number[]
	readonly visualOffsets: readonly Quat[]
	/** Frames over which G is blended in from identity (re-tossed bodies); null = G from the start. */
	readonly remapWindows?: readonly (readonly [number, number] | null)[]
	/** Explosion children: they grow out of their parent's centre from this frame on. */
	readonly births?: readonly ({ readonly frame: number; readonly from: ReadonlyVec3 } | null)[]
	readonly markers: readonly SimulationMarker[]
	readonly durationSeconds: number
}

export interface TrackPose {
	readonly visible: boolean
	readonly position: Vec3
	readonly rotation: Quat
	/** Visual size factor (explosion children grow into place). */
	readonly scale: number
}

/** How long an explosion child takes to grow out of its parent. */
export const BIRTH_SECONDS = 0.2

const smoothstep = (value: number): number => value <= 0 ? 0 : value >= 1 ? 1 : value * value * (3 - 2 * value)

/** Interpolated pose of one body at a (fractional) frame. */
export const sampleTrack = (track: Track, body: number, frame: number): TrackPose => {
	const last = track.frames.length - 1
	const f = Math.min(last, Math.max(0, frame))
	const i0 = Math.floor(f), i1 = Math.min(last, i0 + 1), t = f - i0
	const a = track.frames[i0]!, b = track.frames[i1]!, o = body * 7
	let position = lerp3([a[o]!, a[o + 1]!, a[o + 2]!], [b[o]!, b[o + 1]!, b[o + 2]!], t)
	const physical = qnlerp([a[o + 3]!, a[o + 4]!, a[o + 5]!, a[o + 6]!], [b[o + 3]!, b[o + 4]!, b[o + 5]!, b[o + 6]!], t)
	let offset: ReadonlyQuat = track.visualOffsets[body] ?? IDENTITY_QUAT
	const window = track.remapWindows?.[body]
	if(window) offset = qslerp(IDENTITY_QUAT, offset, smoothstep((f - window[0]) / Math.max(1, window[1] - window[0])))
	let scale = 1
	const birth = track.births?.[body]
	if(birth) {
		const growth = (f - birth.frame) / Math.max(1, BIRTH_SECONDS * track.fps)
		if(growth < 1) {
			const k = smoothstep(growth)
			position = lerp3(birth.from, position, k)
			scale = 0.25 + 0.75 * k
		}
	}
	return {
		visible: f >= (track.releaseFrames[body] ?? 0),
		position,
		rotation: multiplyQuat(physical, offset),
		scale
	}
}

const multiplyQuat = (a: ReadonlyQuat, b: ReadonlyQuat): Quat => [
	a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
	a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
	a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
	a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
]
