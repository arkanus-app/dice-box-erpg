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
