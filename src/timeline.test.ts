import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	createTimelineProgressTracker,
	dispatchTimelineProgress,
	getTimelineTransformBadge,
	normalizeDisplayTimelineRequest,
	planDiceTimeline,
	type TimelineTransformAction
} from './timeline'
import {
	createViewerOptions,
	mergeTimelineOptions,
	validateTimelineOptions,
	validateViewerOptions
} from './timelineOptions'
import type { DiceTimelineEvent, DisplayTimelineRequest } from './types'
import { planPhysicsBodyBuild } from './renderers/PhysicsRenderer'

const viewerOptions = createViewerOptions({})

const plan = (
	request: DisplayTimelineRequest,
	timeline = viewerOptions.timeline
) => planDiceTimeline(
	normalizeDisplayTimelineRequest(request, viewerOptions),
	timeline,
	viewerOptions.duration
)

const dieEvent = {
	subject: 'die' as const,
	rollIndex: 1,
	sourceNodeId: 'node-d6'
}

describe('semantic dice timeline planner', () => {
	it('indexes an explosion causally even though the child roll precedes explode', () => {
		const result = plan({
			id: 'explosion',
			dice: [
				{ id: 'root-a', sides: 6 },
				{ id: 'root-b', sides: 6 },
				{ id: 'child', sides: 6 }
			],
			events: [
				{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'root-a', parentDieId: null, value: 6 },
				{ ...dieEvent, sequence: 2, type: 'roll', dieId: 'root-b', parentDieId: null, value: 2 },
				{ ...dieEvent, sequence: 4, type: 'roll', dieId: 'child', parentDieId: 'root-a', value: 4 },
				{ ...dieEvent, sequence: 7, type: 'explode', dieId: 'root-a', parentDieId: null, childDieId: 'child', value: 4, reason: 'explode' }
			]
		})

		assert.deepEqual(result.initialDice.map(die => die.id), ['root-a', 'root-b'])
		assert.equal(result.phases[0]?.effect, 'explode')
		assert.deepEqual(result.phases[0]?.actions.map(action => action.dieId), ['child'])
		assert.equal(result.eventCount, 4)
		assert.equal(result.degraded, false)

		const progress = createTimelineProgressTracker(result)
		const initial = progress.initial()
		assert.equal(initial.stage, 'initial')
		assert.equal(initial.phaseIndex, null)
		assert.deepEqual(initial.revealedDieIds, ['root-a', 'root-b'])
		assert.deepEqual(initial.dice.map(die => [die.id, die.value]), [['root-a', 6], ['root-b', 2]])
		assert.deepEqual(initial.completedEventSequences, [1, 2])

		const explosion = progress.completePhase(0)
		assert.equal(explosion.stage, 'phase')
		assert.equal(explosion.phaseIndex, 0)
		assert.equal(explosion.phaseId, 'explode-depth-1')
		assert.equal(explosion.effect, 'explode')
		assert.deepEqual(explosion.revealedDieIds, ['child'])
		assert.deepEqual(explosion.dice.map(die => [die.id, die.value]), [
			['root-a', 6], ['root-b', 2], ['child', 4]
		])
		assert.deepEqual(explosion.completedEventSequences, [1, 2, 4, 7])

		const complete = progress.complete()
		assert.equal(complete.stage, 'complete')
		assert.deepEqual(complete.completedEventSequences, [1, 2, 4, 7])
		assert.equal(Object.isFrozen(complete), true)
		assert.equal(Object.isFrozen(complete.dice), true)
		assert.equal(Object.isFrozen(complete.dice[0]), true)
	})

	it('folds disabled rerolls into the first appearance without losing final faces', () => {
		const options = mergeTimelineOptions(viewerOptions.timeline, {
			effects: { reroll: { enabled: false } }
		})
		const result = plan({
			id: 'reroll-off',
			dice: [{ id: 'die', sides: 6 }],
			events: [
				{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'die', parentDieId: null, value: 1 },
				{ ...dieEvent, sequence: 2, type: 'reroll', dieId: 'die', parentDieId: null, from: 1, to: 5, reason: 'reroll' }
			]
		}, options)

		assert.equal(result.initialDice[0]?.value, 5)
		assert.equal(result.finalDice[0]?.value, 5)
		assert.equal(result.phases.some(phase => phase.effect === 'reroll'), false)
	})

	it('reveals an enabled drop only in its selection phase', () => {
		const request: DisplayTimelineRequest = {
			id: 'drop',
			dice: [{ id: 'die', sides: 6 }],
			events: [
				{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'die', parentDieId: null, value: 2 },
				{ ...dieEvent, sequence: 2, type: 'exclude', dieId: 'die', parentDieId: null, reason: 'drop' }
			]
		}
		const enabled = plan(request)
		assert.equal(enabled.initialDice[0]?.discarded, false)
		assert.equal(enabled.finalDice[0]?.discarded, true)
		assert.equal(enabled.phases.some(phase => phase.effect === 'drop'), true)

		const disabled = plan(request, mergeTimelineOptions(viewerOptions.timeline, {
			effects: { drop: { enabled: false } }
		}))
		assert.equal(disabled.initialDice[0]?.discarded, true)
		assert.equal(disabled.phases.some(phase => phase.effect === 'drop'), false)
	})

	it('keeps semantic penetrate and compound values out of physical faces', () => {
		const result = plan({
			id: 'compound',
			dice: [{ id: 'root', sides: 6 }, { id: 'child', sides: 6 }],
			events: [
				{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'root', parentDieId: null, value: 6 },
				{ ...dieEvent, sequence: 2, type: 'roll', dieId: 'child', parentDieId: 'root', value: 5 },
				{ ...dieEvent, sequence: 3, type: 'explode', dieId: 'root', parentDieId: null, childDieId: 'child', value: 5, reason: 'compound' },
				{ ...dieEvent, sequence: 4, type: 'transform', dieId: 'root', parentDieId: null, from: 6, to: 11, reason: 'compound' },
				{ ...dieEvent, sequence: 5, type: 'exclude', dieId: 'child', parentDieId: 'root', reason: 'compound-absorbed' }
			]
		})
		assert.equal(result.finalDice.find(die => die.id === 'root')?.value, 6)
		assert.equal(result.finalDice.find(die => die.id === 'child')?.discarded, true)
		assert.equal(result.phases.some(phase => phase.effect === 'compound'), true)
	})

	it('batches independent classifications into one phase', () => {
		const dice = Array.from({ length: 20 }, (_, index) => ({ id: `die-${index}`, sides: 10 as const }))
		const events: DiceTimelineEvent[] = []
		for(let index = 0; index < dice.length; index++) events.push({
			...dieEvent, sequence: index + 1, type: 'roll', dieId: dice[index]!.id,
			parentDieId: null, value: index % 10 + 1
		})
		for(let index = 0; index < dice.length; index++) events.push({
			...dieEvent, sequence: dice.length + index + 1, type: 'classify', dieId: dice[index]!.id,
			parentDieId: null, outcome: 'success'
		})
		const result = plan({ id: 'target-pool', dice, events })
		const classification = result.phases.filter(phase => phase.effect === 'success')
		assert.equal(classification.length, 1)
		assert.equal(classification[0]?.actions.length, 20)
		assert.equal(result.degraded, false)
	})

	it('degrades before rendering when an event or duration budget is exceeded', () => {
		const request: DisplayTimelineRequest = {
			id: 'budget',
			dice: [{ id: 'die', sides: 6 }],
			events: [{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'die', parentDieId: null, value: 4 }]
		}
		const result = plan(request, mergeTimelineOptions(viewerOptions.timeline, { maxDurationMs: 100 }))
		assert.equal(result.degraded, true)
		assert.equal(result.phases.length, 0)
		assert.equal(result.finalDice[0]?.value, 4)
	})

	it('rejects invalid transitions, duplicate ids, missing rolls, and lineage cycles', () => {
		assert.throws(() => normalizeDisplayTimelineRequest({
			id: 'duplicate', dice: [{ id: 'x', sides: 6 }, { id: 'x', sides: 6 }],
			events: [{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'x', parentDieId: null, value: 1 }]
		}, viewerOptions), /duplicated/)

		assert.throws(() => plan({
			id: 'bad-transition', dice: [{ id: 'x', sides: 6 }], events: [
				{ ...dieEvent, sequence: 1, type: 'roll', dieId: 'x', parentDieId: null, value: 1 },
				{ ...dieEvent, sequence: 2, type: 'reroll', dieId: 'x', parentDieId: null, from: 2, to: 4, reason: 'reroll' }
			]
		}), /expected from 1/)

		assert.throws(() => plan({
			id: 'sequence', dice: [{ id: 'x', sides: 6 }], events: [
				{ ...dieEvent, sequence: 2, type: 'roll', dieId: 'x', parentDieId: null, value: 1 },
				{ ...dieEvent, sequence: 1, type: 'classify', dieId: 'x', parentDieId: null, outcome: 'success' }
			]
		}), /strictly increasing/)
	})
})

describe('timeline options and renderer decisions', () => {
	it('deep-merges effects without sharing mutable state', () => {
		const first = mergeTimelineOptions(viewerOptions.timeline, {
			phaseGapMs: 80,
			effects: { explode: { enabled: false }, criticalSuccess: { pulses: 3 } }
		})
		const second = mergeTimelineOptions(viewerOptions.timeline, { effects: { explode: { durationMs: 123 } } })
		assert.equal(first.effects.explode.enabled, false)
		assert.equal(first.effects.explode.durationMs, viewerOptions.timeline.effects.explode.durationMs)
		assert.equal(first.effects.criticalSuccess.pulses, 3)
		assert.equal(second.effects.explode.enabled, true)
		assert.equal(second.effects.explode.durationMs, 123)
	})

	it('keeps progress callbacks optional, configurable, and isolated from presentation', () => {
		const callback = (): void => { throw new Error('consumer failed') }
		const configured = createViewerOptions({ onTimelineProgress: callback })
		assert.equal(configured.onTimelineProgress, callback)
		assert.equal(typeof viewerOptions.onTimelineProgress, 'function')

		const originalError = console.error
		const reported: unknown[][] = []
		console.error = (...args: unknown[]): void => { reported.push(args) }
		try {
			assert.doesNotThrow(() => dispatchTimelineProgress(callback, Object.freeze({
				id: 'isolated',
				stage: 'complete',
				phaseIndex: null,
				phaseCount: 0,
				phaseId: null,
				effect: null,
				revealedDieIds: Object.freeze([]),
				dice: Object.freeze([]),
				completedEventSequences: Object.freeze([])
			})))
		} finally {
			console.error = originalError
		}
		assert.equal(reported.length, 1)
	})

	it('rejects invalid durations, intensity, colors, styles, and pulses', () => {
		for(const timeline of [
			mergeTimelineOptions(viewerOptions.timeline, { effects: { reroll: { durationMs: -1 } } }),
			mergeTimelineOptions(viewerOptions.timeline, { effects: { success: { intensity: 2 } } }),
			mergeTimelineOptions(viewerOptions.timeline, { effects: { neutral: { color: '' } } }),
			mergeTimelineOptions(viewerOptions.timeline, { effects: { reroll: { style: 'bad' as 'hop' } } }),
			mergeTimelineOptions(viewerOptions.timeline, { effects: { criticalFailure: { pulses: 0 } } })
		]) assert.throws(() => validateTimelineOptions(timeline))
		assert.doesNotThrow(() => validateViewerOptions(viewerOptions))
	})

	it('honors compound and penetrate badge flags', () => {
		const compound: TimelineTransformAction = {
			kind: 'transform', effect: 'compound', dieId: 'die', from: 6, to: 11, eventSequences: []
		}
		const penetrate: TimelineTransformAction = {
			kind: 'transform', effect: 'penetrate', dieId: 'die', from: 5, to: 4, eventSequences: []
		}
		assert.equal(getTimelineTransformBadge(compound, viewerOptions.timeline), 'Σ 11')
		assert.equal(getTimelineTransformBadge(penetrate, viewerOptions.timeline), '−1')
		const hidden = mergeTimelineOptions(viewerOptions.timeline, {
			effects: { compound: { showBadge: false }, penetrate: { showBadge: false } }
		})
		assert.equal(getTimelineTransformBadge(compound, hidden), null)
		assert.equal(getTimelineTransformBadge(penetrate, hidden), null)
	})

	it('keeps locked parents when physics appends explosive children', () => {
		assert.deepEqual(planPhysicsBodyBuild(2, 1, true), {
			disposeExisting: false,
			totalBodyCount: 3
		})
		assert.deepEqual(planPhysicsBodyBuild(2, 1, false), {
			disposeExisting: true,
			totalBodyCount: 1
		})
	})
})
