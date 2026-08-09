export const PHYSICS_PERFORMANCE_ENTRY = 'dice3dview:physics-hot-path'

export interface PhysicsPerformanceSnapshot {
	readonly bodies: number
	readonly durationMs: number
	readonly frames: number
	readonly physicsSteps: number
	readonly physicsSteps90Hz: number
	readonly physicsSteps120Hz: number
	readonly physicsSteps180Hz: number
	readonly guidanceCalls: number
	readonly guidanceMs: number
	readonly renderMs: number
	readonly maxRenderMs: number
	readonly collisionEvents: number
	readonly launchClearanceQueries: number
	readonly launchPairChecks: number
}

type Clock = () => number

const defaultClock: Clock = () => globalThis.performance?.now() ?? Date.now()

export const isPhysicsPerformanceProfilingEnabled = (): boolean =>
	(globalThis as typeof globalThis & { __DICE3DVIEW_PHYSICS_PROFILE__?: boolean })
		.__DICE3DVIEW_PHYSICS_PROFILE__ === true

export class PhysicsPerformanceRecorder {
	readonly #clock: Clock
	readonly #startedAt: number
	#bodies = 0
	#frames = 0
	#physicsSteps = 0
	#physicsSteps90Hz = 0
	#physicsSteps120Hz = 0
	#physicsSteps180Hz = 0
	#guidanceCalls = 0
	#guidanceMs = 0
	#renderMs = 0
	#maxRenderMs = 0
	#collisionEvents = 0
	#launchClearanceQueries = 0
	#launchPairChecks = 0

	constructor(clock: Clock = defaultClock) {
		this.#clock = clock
		this.#startedAt = clock()
	}

	now(): number {
		return this.#clock()
	}

	recordBodies(count: number): void {
		this.#bodies = Math.max(this.#bodies, count)
	}

	recordPhysicsStep(durationMs: number, guidanceCalls: number, stepMs: number): void {
		this.#physicsSteps++
		const frequency = Math.round(1000 / Math.max(0.001, stepMs))
		if(frequency === 90) this.#physicsSteps90Hz++
		else if(frequency === 120) this.#physicsSteps120Hz++
		else if(frequency === 180) this.#physicsSteps180Hz++
		this.#guidanceCalls += guidanceCalls
		this.#guidanceMs += Math.max(0, durationMs)
	}

	recordFrame(durationMs: number): void {
		const safeDuration = Math.max(0, durationMs)
		this.#frames++
		this.#renderMs += safeDuration
		this.#maxRenderMs = Math.max(this.#maxRenderMs, safeDuration)
	}

	recordCollision(): void {
		this.#collisionEvents++
	}

	recordLaunchClearanceQuery(): void {
		this.#launchClearanceQueries++
	}

	recordLaunchPairCheck(): void {
		this.#launchPairChecks++
	}

	complete(): PhysicsPerformanceSnapshot {
		return Object.freeze({
			bodies: this.#bodies,
			durationMs: Math.max(0, this.#clock() - this.#startedAt),
			frames: this.#frames,
			physicsSteps: this.#physicsSteps,
			physicsSteps90Hz: this.#physicsSteps90Hz,
			physicsSteps120Hz: this.#physicsSteps120Hz,
			physicsSteps180Hz: this.#physicsSteps180Hz,
			guidanceCalls: this.#guidanceCalls,
			guidanceMs: this.#guidanceMs,
			renderMs: this.#renderMs,
			maxRenderMs: this.#maxRenderMs,
			collisionEvents: this.#collisionEvents,
			launchClearanceQueries: this.#launchClearanceQueries,
			launchPairChecks: this.#launchPairChecks
		})
	}
}

export const publishPhysicsPerformanceSnapshot = (snapshot: PhysicsPerformanceSnapshot): void => {
	try {
		globalThis.performance?.measure(PHYSICS_PERFORMANCE_ENTRY, {
			start: globalThis.performance.now() - snapshot.durationMs,
			duration: snapshot.durationMs,
			detail: snapshot
		})
	} catch {}
}
