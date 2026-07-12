import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getDisplayBodyCount, normalizeDisplayRequest, normalizeDisplaySides, normalizeDisplayValue } from './displayRequest'
import type { RequiredViewerOptions } from './types'

const defaults = {
	mode: 'kinematic',
	theme: 'default',
	themeColor: '#2e8555'
} as Pick<RequiredViewerOptions, 'mode' | 'theme' | 'themeColor'>

describe('display-only request contract', () => {
	it('accepts d2 values 1 and 2', () => {
		assert.equal(normalizeDisplaySides(2), 2)
		assert.equal(normalizeDisplayValue(1, 2), 1)
		assert.equal(normalizeDisplayValue(2, 2), 2)
	})

	it('rejects invalid d2 values', () => {
		for(const value of [0, 3, 1.5, undefined]) {
			assert.throws(() => normalizeDisplayValue(value, 2), /outside 1-2|missing an integer value/)
		}
	})

	it('normalizes immutable resolved values without recalculating them', () => {
		const request = normalizeDisplayRequest({
			id: 'resolved-1',
			seed: 'visual-seed',
			dice: [
				{ id: 'coin', sides: 2, value: 2 },
				{ id: 'd20', sides: 20, value: 17, discarded: true }
			]
		}, defaults)
		assert.equal(request.mode, 'kinematic')
		assert.equal(request.seed, 'visual-seed')
		assert.deepEqual(request.dice.map(die => die.value), [2, 17])
		assert.equal(request.dice[1]?.discarded, true)
		assert.equal(Object.isFrozen(request), true)
		assert.equal(Object.isFrozen(request.dice), true)
	})

	it('supports the lazy physics mode', () => {
		const request = normalizeDisplayRequest({
			id: 'physics-1',
			mode: 'physics',
			dice: [{ id: 'coin', sides: 2, value: 1 }]
		}, defaults)
		assert.equal(request.mode, 'physics')
	})

	it('counts a semantic d100 as two visual bodies', () => {
		assert.equal(getDisplayBodyCount([
			{ sides: 2 },
			{ sides: 20 },
			{ sides: 100 }
		]), 4)
	})
})
