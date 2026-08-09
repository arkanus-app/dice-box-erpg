import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PhysicsPerformanceRecorder } from './physicsPerformance'

describe('physics hot-path instrumentation', () => {
	it('records frame, guidance, collision, and admission work without wall-clock assumptions', () => {
		let now = 100
		const recorder = new PhysicsPerformanceRecorder(() => now)
		recorder.recordBodies(12)
		recorder.recordPhysicsStep(2.5, 12, 1000 / 120)
		recorder.recordFrame(4)
		recorder.recordCollision()
		recorder.recordLaunchClearanceQuery()
		recorder.recordLaunchPairCheck()
		now = 120

		assert.deepEqual(recorder.complete(), {
			bodies: 12,
			durationMs: 20,
			frames: 1,
			physicsSteps: 1,
			physicsSteps90Hz: 0,
			physicsSteps120Hz: 1,
			physicsSteps180Hz: 0,
			guidanceCalls: 12,
			guidanceMs: 2.5,
			renderMs: 4,
			maxRenderMs: 4,
			collisionEvents: 1,
			launchClearanceQueries: 1,
			launchPairChecks: 1
		})
	})
})
