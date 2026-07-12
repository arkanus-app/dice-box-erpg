# @erpg/dice3dview

TypeScript-first 3D presentation layer for dice results already resolved by `@erpg/dicecore`.
This package never parses notation, generates random results, or changes a supplied value.

## Install

```bash
npm install @erpg/dice3dview
```

## Usage

```ts
import { DiceResultViewer } from '@erpg/dice3dview'

const viewer = new DiceResultViewer({
  container: '#dice-stage',
  assetPath: '/assets/dice-box/',
  mode: 'kinematic'
})

await viewer.init()

await viewer.display({
  id: 'resolved-result-1',
  seed: 'visual-animation-1',
  dice: [
    { id: 'coin', sides: 2, value: 1 },
    { id: 'attack', sides: 20, value: 17 },
    { id: 'discarded', sides: 6, value: 2, discarded: true }
  ]
})
```

`display()` accepts only resolved values and returns those same values with the presentation duration.
Starting a new presentation or calling `clear()` rejects the previous presentation with a typed
`DisplayCancelledError` whose code is `DISPLAY_CANCELLED`.

## Display modes

- `kinematic` is the default. It uses a seeded, directed animation and does not load Havok.
- `physics` dynamically loads the optional physics chunk, applies collisions, and assists every body toward the supplied face.

Neither mode determines the dice result. If graphical initialization or an asset fails, `display()`
keeps the caller's resolved values authoritative and completes as a best-effort presentation.

## d2 coins

d2 is rendered as a procedural coin. Value `1` maps to the front and value `2` to the back.
Themes can replace the artwork without changing the numeric contract:

```json
{
  "diceAvailable": ["d2", "d4", "d6", "d8", "d10", "d12", "d20", "d100"],
  "coin": {
    "front": { "value": 1, "texture": "coin-heads.webp" },
    "back": { "value": 2, "texture": "coin-tails.webp" },
    "edgeColor": "#c89b3c",
    "diameter": 1,
    "thickness": 0.12
  }
}
```

Themes without a `coin` block use the numeric coin artwork from the default theme.

## Supported dice

d2, d4, d6, d8, d10, d12, d20, and d100. A d100 is one semantic result presented by two visual bodies.

## Attribution and license

This ERPG-owned package derives from the MIT-licensed `@3d-dice/dice-box` project by 3Ddice.
The original copyright notice is preserved in [LICENSE](LICENSE). MIT.
