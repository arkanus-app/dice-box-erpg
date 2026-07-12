import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createSeededRandom } from './random'

describe('visual seeded random', () => {
	it('is deterministic without representing a dice result', () => {
		const first = createSeededRandom('presentation-1')
		const second = createSeededRandom('presentation-1')
		assert.deepEqual(
			[first.next(), first.next(), first.next()],
			[second.next(), second.next(), second.next()]
		)
	})
})
