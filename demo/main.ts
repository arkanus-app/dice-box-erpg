import { DiceResultViewer, isDisplayCancelledError } from '../src'
import type { DisplayMode } from '../src'

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

document.querySelector('#kinematic')?.addEventListener('click', () => showFromControl('kinematic'))
document.querySelector('#physics')?.addEventListener('click', () => showFromControl('physics'))
await show('kinematic')
