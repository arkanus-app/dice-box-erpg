import { createShape, type DiceShape, type FacePlane } from '../engine/shape'
import type { Quat, ReadonlyVec3 } from '../engine/vector'
import type { CoinTheme } from '../types'

/** Accent used for coin highlights: the die color when colorized, else the edge color. */
export const getCoinAccentColor = (theme: CoinTheme, themeColor: string): string =>
	theme.colorize ? themeColor : theme.edgeColor || themeColor

export const getCoinTemplateKey = (
	theme: string,
	themeColor: string,
	discarded: boolean
): string => `${theme}|${themeColor.toLowerCase()}|${String(discarded)}`

/** Value 1 is the modeled front (+Y); value 2 turns the back up with a half turn about Z. */
export const getCoinTargetQuaternion = (value: number): Quat =>
	value === 1 ? [0, 0, 0, 1] : [0, 0, 1, 0]

/**
 * Physics hull of the d2: a 24-sided prism. Value 1 is the +Y cap, value 2 the
 * -Y cap; the side faces carry no value (a coin on its edge is re-thrown).
 */
export const createCoinShape = (radius: number, halfThickness: number): DiceShape => {
	const sides = 24
	const planes: FacePlane[] = [
		{ value: 1, normal: [0, 1, 0], d: halfThickness },
		{ value: 2, normal: [0, -1, 0], d: halfThickness },
		...Array.from({ length: sides }, (_, i): FacePlane => {
			const angle = (i + 0.5) / sides * Math.PI * 2
			return { value: null, normal: [Math.cos(angle), 0, Math.sin(angle)], d: radius }
		})
	]
	return createShape(planes, { readUps: new Map<number, ReadonlyVec3>([[1, [0, 0, -1]], [2, [0, 0, -1]]]), inertiaK: 0.35 })
}
