export const DISPLAY_CANCELLED_CODE = 'DISPLAY_CANCELLED' as const

export class DisplayCancelledError extends Error {
	readonly code = DISPLAY_CANCELLED_CODE

	constructor(message = 'Display presentation was cancelled.') {
		super(message)
		this.name = 'DisplayCancelledError'
	}
}

export const isDisplayCancelledError = (error: unknown): error is DisplayCancelledError =>
	error instanceof DisplayCancelledError || (
		typeof error === 'object'
		&& error !== null
		&& 'code' in error
		&& error.code === DISPLAY_CANCELLED_CODE
	)

/**
 * Keeps cancellation errors stable while preserving the original cause for
 * genuine presentation failures. Callers may log the failure before invoking
 * this helper, but must not turn it into a successful display result.
 */
export const rethrowPresentationError = (error: unknown, aborted: boolean): never => {
	if(isDisplayCancelledError(error) || aborted) throw new DisplayCancelledError()
	throw error
}
