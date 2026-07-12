import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createSeededRandom } from './random'
import { createScatteredLanding, createSideLaunch } from './renderers/KinematicRenderer'
import { DISPLAY_CAMERA_FOV, DISPLAY_CAMERA_HEIGHT } from './renderers/sceneEnvironment'

const buildLayout = (seed: string) => {
	const random = createSeededRandom(seed)
	return Array.from({ length: 6 }, (_, index) => {
		const input = { index, count: 6, scale: 5, startingHeight: 6.4, coin: false }
		const landing = createScatteredLanding(input, random)
		return { landing, launch: createSideLaunch(input, landing, random) }
	})
}

describe('natural presentation layout', () => {
	it('scatters resting positions instead of placing dice in rows', () => {
		const entries = buildLayout('layout-seed')
		const xPositions = new Set(entries.map(entry => entry.landing.x.toFixed(3)))
		const zPositions = new Set(entries.map(entry => entry.landing.z.toFixed(3)))
		assert.ok(xPositions.size >= 5)
		assert.ok(zPositions.size >= 5)
	})

	it('launches alternately from the left and right edges', () => {
		const entries = buildLayout('launch-seed')
		entries.forEach(({ launch }, index) => {
			assert.ok(Math.abs(launch.x) > 6.5)
			assert.equal(Math.sign(launch.x), index % 2 === 0 ? -1 : 1)
		})
	})

	it('remains deterministic for the visual seed', () => {
		const first = buildLayout('repeatable').map(entry => entry.launch.asArray())
		const second = buildLayout('repeatable').map(entry => entry.launch.asArray())
		assert.deepEqual(first, second)
	})

	it('keeps launch perspective close to the resting dice size', () => {
		for(const scale of [5.1, 6]) {
			const random = createSeededRandom(`perspective-${scale}`)
			for(let index = 0; index < 12; index += 1) {
				const input = { index, count: 12, scale, startingHeight: 6.4, coin: false }
				const landing = createScatteredLanding(input, random)
				const launch = createSideLaunch(input, landing, random)
				const apparentScale = (DISPLAY_CAMERA_HEIGHT - landing.y) / (DISPLAY_CAMERA_HEIGHT - launch.y)
				assert.ok(apparentScale <= 1.25, `launch scale ${apparentScale.toFixed(3)} for scale ${scale}`)
			}
		}
	})

	it('preserves the existing ground framing with the more distant camera', () => {
		const verticalHalfSpan = DISPLAY_CAMERA_HEIGHT * Math.tan(DISPLAY_CAMERA_FOV / 2)
		assert.ok(verticalHalfSpan > 4.1)
		assert.ok(verticalHalfSpan < 4.4)
	})
})
