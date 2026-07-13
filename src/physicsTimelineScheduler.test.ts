import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createPhysicsExplosionScheduler } from './physicsTimelineScheduler'

describe('physics explosion scheduler', () => {
	it('releases each branch when its own parent settles', () => {
		const scheduler = createPhysicsExplosionScheduler([
			{ phaseIndex: 0, actionIndex: 0, parentDieId: 'root-a', dieId: 'child-a' },
			{ phaseIndex: 0, actionIndex: 1, parentDieId: 'root-b', dieId: 'child-b' },
			{ phaseIndex: 1, actionIndex: 0, parentDieId: 'child-a', dieId: 'grandchild-a' }
		])

		assert.deepEqual(scheduler.settle('root-a'), {
			completed: null,
			spawned: [{ phaseIndex: 0, actionIndex: 0, parentDieId: 'root-a', dieId: 'child-a' }]
		})
		assert.deepEqual(scheduler.settle('root-b'), {
			completed: null,
			spawned: [{ phaseIndex: 0, actionIndex: 1, parentDieId: 'root-b', dieId: 'child-b' }]
		})
		assert.deepEqual(scheduler.settle('child-a'), {
			completed: { phaseIndex: 0, actionIndex: 0, parentDieId: 'root-a', dieId: 'child-a' },
			spawned: [{ phaseIndex: 1, actionIndex: 0, parentDieId: 'child-a', dieId: 'grandchild-a' }]
		})
		assert.deepEqual(scheduler.settle('root-a'), { completed: null, spawned: [] })
	})
})
