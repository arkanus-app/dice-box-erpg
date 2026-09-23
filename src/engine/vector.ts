/**
 * Minimal vector and quaternion math on plain tuples.
 *
 * The simulation path only uses +, -, *, / and Math.sqrt, which IEEE 754
 * defines exactly; the same seed therefore produces bit-identical keyframes in
 * every JavaScript engine. Trigonometric helpers are reserved for presentation
 * (kinematic trajectories and render-time interpolation).
 */
export type Vec3 = [number, number, number]
export type Quat = [number, number, number, number]
export type ReadonlyVec3 = Readonly<Vec3>
export type ReadonlyQuat = Readonly<Quat>

export const IDENTITY_QUAT: ReadonlyQuat = Object.freeze([0, 0, 0, 1]) as ReadonlyQuat

export const dot = (a: ReadonlyVec3, b: ReadonlyVec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross = (a: ReadonlyVec3, b: ReadonlyVec3): Vec3 => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
]
export const add = (a: ReadonlyVec3, b: ReadonlyVec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: ReadonlyVec3, b: ReadonlyVec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: ReadonlyVec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
export const length = (a: ReadonlyVec3): number => Math.sqrt(dot(a, a))
export const normalize = (a: ReadonlyVec3): Vec3 => {
	const l = length(a)
	return l > 0 ? scale(a, 1 / l) : [0, 0, 0]
}
export const lerp3 = (a: ReadonlyVec3, b: ReadonlyVec3, t: number): Vec3 => [
	a[0] + (b[0] - a[0]) * t,
	a[1] + (b[1] - a[1]) * t,
	a[2] + (b[2] - a[2]) * t
]

export const qmul = (a: ReadonlyQuat, b: ReadonlyQuat): Quat => [
	a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
	a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
	a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
	a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
]
export const qrot = (q: ReadonlyQuat, v: ReadonlyVec3): Vec3 => {
	const [x, y, z, w] = q
	const tx = 2 * (y * v[2] - z * v[1])
	const ty = 2 * (z * v[0] - x * v[2])
	const tz = 2 * (x * v[1] - y * v[0])
	return [
		v[0] + w * tx + (y * tz - z * ty),
		v[1] + w * ty + (z * tx - x * tz),
		v[2] + w * tz + (x * ty - y * tx)
	]
}
export const qconj = (q: ReadonlyQuat): Quat => [-q[0], -q[1], -q[2], q[3]]
export const qdot = (a: ReadonlyQuat, b: ReadonlyQuat): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
export const qnormalize = (q: ReadonlyQuat): Quat => {
	const l = Math.sqrt(qdot(q, q))
	return l > 0 ? [q[0] / l, q[1] / l, q[2] / l, q[3] / l] : [0, 0, 0, 1]
}

/** Rotation matrix given by its columns → quaternion (sqrt only). */
export const quatFromBasis = (c0: ReadonlyVec3, c1: ReadonlyVec3, c2: ReadonlyVec3): Quat => {
	const m00 = c0[0], m10 = c0[1], m20 = c0[2]
	const m01 = c1[0], m11 = c1[1], m21 = c1[2]
	const m02 = c2[0], m12 = c2[1], m22 = c2[2]
	const trace = m00 + m11 + m22
	if(trace > 0) {
		const s = Math.sqrt(trace + 1) * 2
		return qnormalize([(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, s / 4])
	}
	if(m00 > m11 && m00 > m22) {
		const s = Math.sqrt(1 + m00 - m11 - m22) * 2
		return qnormalize([s / 4, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s])
	}
	if(m11 > m22) {
		const s = Math.sqrt(1 + m11 - m00 - m22) * 2
		return qnormalize([(m01 + m10) / s, s / 4, (m12 + m21) / s, (m02 - m20) / s])
	}
	const s = Math.sqrt(1 + m22 - m00 - m11) * 2
	return qnormalize([(m02 + m20) / s, (m12 + m21) / s, s / 4, (m10 - m01) / s])
}

/** Shortest rotation taking unit vector a onto unit vector b (sqrt only). */
export const quatFromUnitVectors = (a: ReadonlyVec3, b: ReadonlyVec3): Quat => {
	const d = dot(a, b)
	if(d < -0.999999) {
		const axis = Math.abs(a[0]) < 0.9 ? normalize(cross([1, 0, 0], a)) : normalize(cross([0, 1, 0], a))
		return [axis[0], axis[1], axis[2], 0]
	}
	const c = cross(a, b)
	return qnormalize([c[0], c[1], c[2], 1 + d])
}

export const quatFromAxisAngle = (axis: ReadonlyVec3, angle: number): Quat => {
	const n = normalize(axis)
	const s = Math.sin(angle / 2)
	return [n[0] * s, n[1] * s, n[2] * s, Math.cos(angle / 2)]
}

/** Same composition as Babylon's Quaternion.RotationYawPitchRoll. */
export const quatFromYawPitchRoll = (yaw: number, pitch: number, roll: number): Quat => {
	const sr = Math.sin(roll / 2), cr = Math.cos(roll / 2)
	const sp = Math.sin(pitch / 2), cp = Math.cos(pitch / 2)
	const sy = Math.sin(yaw / 2), cy = Math.cos(yaw / 2)
	return [
		cy * sp * cr + sy * cp * sr,
		sy * cp * cr - cy * sp * sr,
		cy * cp * sr - sy * sp * cr,
		cy * cp * cr + sy * sp * sr
	]
}

export const qslerp = (a: ReadonlyQuat, b: ReadonlyQuat, t: number): Quat => {
	let cos = qdot(a, b)
	let end: ReadonlyQuat = b
	if(cos < 0) { cos = -cos; end = [-b[0], -b[1], -b[2], -b[3]] }
	if(cos > 0.9995) return qnormalize([
		a[0] + (end[0] - a[0]) * t,
		a[1] + (end[1] - a[1]) * t,
		a[2] + (end[2] - a[2]) * t,
		a[3] + (end[3] - a[3]) * t
	])
	const angle = Math.acos(cos)
	const sin = Math.sin(angle)
	const wa = Math.sin((1 - t) * angle) / sin
	const wb = Math.sin(t * angle) / sin
	return [a[0] * wa + end[0] * wb, a[1] * wa + end[1] * wb, a[2] * wa + end[2] * wb, a[3] * wa + end[3] * wb]
}

/** Normalized linear interpolation, enough between consecutive keyframes. */
export const qnlerp = (a: ReadonlyQuat, b: ReadonlyQuat, t: number): Quat => {
	const sign = qdot(a, b) < 0 ? -1 : 1
	return qnormalize([
		a[0] + (b[0] * sign - a[0]) * t,
		a[1] + (b[1] * sign - a[1]) * t,
		a[2] + (b[2] * sign - a[2]) * t,
		a[3] + (b[3] * sign - a[3]) * t
	])
}
