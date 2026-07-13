import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	DISPLAY_CANCELLED_CODE,
	DisplayCancelledError,
	rethrowPresentationError
} from './errors'

describe('presentation error propagation', () => {
	it('rethrows the original non-cancellation failure', () => {
		const failure = new Error('renderer failed')

		assert.throws(
			() => rethrowPresentationError(failure, false),
			(error: unknown) => error === failure
		)
	})

	it('normalizes explicit and signal-driven cancellation failures', () => {
		for(const invoke of [
			() => rethrowPresentationError(new DisplayCancelledError(), false),
			() => rethrowPresentationError(new Error('aborted renderer'), true)
		]) {
			assert.throws(invoke, (error: unknown) => (
				error instanceof DisplayCancelledError
				&& error.code === DISPLAY_CANCELLED_CODE
			))
		}
	})
})
