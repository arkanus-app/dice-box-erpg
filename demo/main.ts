import {
  DiceResultViewer,
  createMixedDisplayRequest,
  createSystemDisplayRequest,
  isDisplayCancelledError
} from '../src'
import type { DisplayMode, DisplayTimelineRequest } from '../src'

const viewer = new DiceResultViewer({
  container: '#stage',
  assetPath: '/assets/dice-box/',
  theme: 'default',
  duration: 1200,
  settleTimeout: 2600,
  scale: 4.6
})

await viewer.init()

const show = (mode: DisplayMode) => viewer.display({
  id: `${mode}-${Date.now()}`,
  seed: 'demo-seed',
  mode,
  dice: [
    { id: 'coin-one', sides: 2, value: 1 },
    { id: 'coin-two', sides: 2, value: 2 },
    { id: 'd6', sides: 6, value: 4 },
    { id: 'd20', sides: 20, value: 17 }
  ]
})

const showFromControl = (mode: DisplayMode): void => {
  void show(mode).catch(error => {
    if(!isDisplayCancelledError(error)) console.error(error)
  })
}

const eventBase = { subject: 'die' as const, rollIndex: 1, sourceNodeId: 'demo-node' }
const timelinePresets: Record<string, DisplayTimelineRequest> = {
  explode: {
    id: 'timeline-explode', dice: [{ id: 'root', sides: 6 }, { id: 'child', sides: 6 }], events: [
      { ...eventBase, sequence: 1, type: 'roll', dieId: 'root', parentDieId: null, value: 6 },
      { ...eventBase, sequence: 2, type: 'roll', dieId: 'child', parentDieId: 'root', value: 4 },
      { ...eventBase, sequence: 3, type: 'explode', dieId: 'root', parentDieId: null, childDieId: 'child', value: 4, reason: 'explode' }
    ]
  },
  reroll: {
    id: 'timeline-reroll', dice: [{ id: 'die', sides: 20 }], events: [
      { ...eventBase, sequence: 1, type: 'roll', dieId: 'die', parentDieId: null, value: 1 },
      { ...eventBase, sequence: 2, type: 'reroll', dieId: 'die', parentDieId: null, from: 1, to: 17, reason: 'reroll' }
    ]
  },
  compound: {
    id: 'timeline-compound', dice: [{ id: 'root', sides: 6 }, { id: 'child', sides: 6 }], events: [
      { ...eventBase, sequence: 1, type: 'roll', dieId: 'root', parentDieId: null, value: 6 },
      { ...eventBase, sequence: 2, type: 'roll', dieId: 'child', parentDieId: 'root', value: 4 },
      { ...eventBase, sequence: 3, type: 'explode', dieId: 'root', parentDieId: null, childDieId: 'child', value: 4, reason: 'compound' },
      { ...eventBase, sequence: 4, type: 'transform', dieId: 'root', parentDieId: null, from: 6, to: 10, reason: 'compound' },
      { ...eventBase, sequence: 5, type: 'exclude', dieId: 'child', parentDieId: 'root', reason: 'compound-absorbed' }
    ]
  },
  penetrate: {
    id: 'timeline-penetrate', dice: [{ id: 'root', sides: 6 }, { id: 'child', sides: 6 }], events: [
      { ...eventBase, sequence: 1, type: 'roll', dieId: 'root', parentDieId: null, value: 6 },
      { ...eventBase, sequence: 2, type: 'roll', dieId: 'child', parentDieId: 'root', value: 5 },
      { ...eventBase, sequence: 3, type: 'transform', dieId: 'child', parentDieId: 'root', from: 5, to: 4, reason: 'penetrate' },
      { ...eventBase, sequence: 4, type: 'explode', dieId: 'root', parentDieId: null, childDieId: 'child', value: 4, reason: 'penetrate' }
    ]
  },
  selection: {
    id: 'timeline-selection', dice: [{ id: 'kept', sides: 6 }, { id: 'dropped', sides: 6 }], events: [
      { ...eventBase, sequence: 1, type: 'roll', dieId: 'kept', parentDieId: null, value: 6 },
      { ...eventBase, sequence: 2, type: 'roll', dieId: 'dropped', parentDieId: null, value: 2 },
      { ...eventBase, sequence: 3, type: 'exclude', dieId: 'dropped', parentDieId: null, reason: 'keep' }
    ]
  },
  critical: {
    id: 'timeline-critical', dice: [{ id: 'critical', sides: 20 }], events: [
      { ...eventBase, sequence: 1, type: 'roll', dieId: 'critical', parentDieId: null, value: 20 },
      { ...eventBase, sequence: 2, type: 'classify', dieId: 'critical', parentDieId: null, outcome: 'critical-success' }
    ]
  }
}

for(const name of Object.keys(timelinePresets)) document.querySelector(`#${name}`)?.addEventListener('click', () => {
  const preset = timelinePresets[name]
  if(!preset) return
  void viewer.displayTimeline({ ...preset, id: `${preset.id}-${Date.now()}`, seed: 'timeline-demo' }).catch(error => {
    if(!isDisplayCancelledError(error)) console.error(error)
  })
})

document.querySelector('#kinematic')?.addEventListener('click', () => showFromControl('kinematic'))
document.querySelector('#physics')?.addEventListener('click', () => showFromControl('physics'))
document.querySelector('#vampire')?.addEventListener('click', () => {
  const requestId = `vampire-${Date.now()}`
  void viewer.display(createSystemDisplayRequest({
    id: requestId,
    seed: requestId,
    dice: [
      { id: 'normal-success', sides: 10, value: 8, profileId: 'vampire-v5-normal-d10' },
      { id: 'normal-critical', sides: 10, value: 10, profileId: 'vampire-v5-normal-d10' },
      { id: 'hunger-bestial', sides: 10, value: 1, profileId: 'vampire-v5-hunger-d10' },
      { id: 'hunger-critical', sides: 10, value: 10, profileId: 'vampire-v5-hunger-d10' }
    ]
  })).catch(error => {
    if(!isDisplayCancelledError(error)) console.error(error)
  })
})
document.querySelector('#assimilation')?.addEventListener('click', () => {
  const requestId = `assimilation-${Date.now()}`
  void viewer.display(createSystemDisplayRequest({
    id: requestId,
    seed: requestId,
    keptIds: ['assimilation-d12'],
    dice: [
      { id: 'assimilation-d6', sides: 6, value: 5, profileId: 'assimilation-d6' },
      { id: 'assimilation-d10', sides: 10, value: 9, profileId: 'assimilation-d10' },
      { id: 'assimilation-d12', sides: 12, value: 11, profileId: 'assimilation-d12' }
    ]
  })).catch(error => {
    if(!isDisplayCancelledError(error)) console.error(error)
  })
})
document.querySelector('#fate')?.addEventListener('click', () => {
  const requestId = `fate-${Date.now()}`
  void viewer.display(createSystemDisplayRequest({
    id: requestId,
    seed: requestId,
    dice: [
      { id: 'fate-minus', sides: 6, value: 1, profileId: 'fate-df' },
      { id: 'fate-blank-one', sides: 6, value: 3, profileId: 'fate-df' },
      { id: 'fate-blank-two', sides: 6, value: 4, profileId: 'fate-df' },
      { id: 'fate-plus', sides: 6, value: 6, profileId: 'fate-df' }
    ]
  })).catch(error => {
    if(!isDisplayCancelledError(error)) console.error(error)
  })
})
document.querySelector('#mixed')?.addEventListener('click', () => {
  const requestId = `mixed-${Date.now()}`
  void viewer.display(createMixedDisplayRequest({
    id: requestId,
    seed: requestId,
    dice: [
      { id: 'mixed-d20', sides: 20, value: 17, physicalValue: 17, included: true },
      {
        id: 'mixed-hunger',
        sides: 10,
        value: 10,
        physicalValue: 10,
        profileId: 'vampire-v5-hunger-d10'
      },
      {
        id: 'mixed-fate',
        sides: 6,
        value: 5,
        physicalValue: 5,
        profileId: 'fate-df'
      },
      {
        id: 'mixed-assimilation',
        sides: 12,
        value: 11,
        physicalValue: 11,
        profileId: 'assimilation-d12'
      }
    ]
  })).catch(error => {
    if(!isDisplayCancelledError(error)) console.error(error)
  })
})
await show('kinematic')
