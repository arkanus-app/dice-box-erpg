import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	getDisplayRollBodyCount,
	normalizeDisplayRollRequest
} from './displayRoll.js'

describe('normalizeDisplayRollRequest', () => {
	it('rejects dice without a value', () => {
		assert.throws(
			() => normalizeDisplayRollRequest({dice: [{sides: 20}]}),
			/missing an integer value/
		)
	})

	it('rejects values outside the die range', () => {
		assert.throws(
			() => normalizeDisplayRollRequest({dice: [{sides: 6, value: 7}]}),
			/outside 1-6/
		)
	})

	it('preserves discarded dice', () => {
		const request = normalizeDisplayRollRequest({
			id: 'roll-1',
			dice: [{id: 'die-1', sides: 20, value: 13, discarded: true}]
		})

		assert.equal(request.dice[0].discarded, true)
		assert.equal(request.dice[0].value, 13)
		assert.equal(request.dice[0].faceValue, 13)
	})

	it('expands d100 values into a tens face and two physics bodies', () => {
		const request = normalizeDisplayRollRequest({
			id: 'roll-100',
			dice: [
				{sides: 100, value: 1},
				{sides: 100, value: 10},
				{sides: 100, value: 37},
				{sides: 100, value: 100}
			]
		})

		assert.deepEqual(
			request.dice.map(die => die.faceValue),
			[0, 0, 30, 90]
		)
		assert.equal(getDisplayRollBodyCount(request.dice), 8)
	})
})
