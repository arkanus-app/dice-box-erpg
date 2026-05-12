# @erpg/dice3dview

ERPG Dice 3D View is the visual dice display package used by ERPG projects.
It is responsible for rendering already-resolved dice results in 3D with BabylonJS and Havok.

It is not the authority for dice math.
Use `@erpg/dicecore` to resolve notation and pass the final die values into this package.

## Install

```bash
npm install @erpg/dice3dview
```

For ERPG internal projects the package can also be consumed from Git:

```json
{
  "@erpg/dice3dview": "git+https://github.com/arkanus-app/dice-box-erpg.git"
}
```

## Quickstart

```js
import DiceBox from '@erpg/dice3dview';

const diceBox = new DiceBox({
  container: '#dice-box',
  assetPath: '/assets/dice-box/',
  forcedResultMode: 'physics',
});

await diceBox.init();

await diceBox.displayRoll({
  id: 'roll-1',
  dice: [
    { id: 'die-1', sides: 20, value: 17 },
    { id: 'die-2', sides: 6, value: 4, discarded: true },
  ],
});
```

## Role in ERPG

`@erpg/dice3dview` is intentionally display-only for advanced ERPG rolling flows:

- accepts resolved die values from `@erpg/dicecore`
- animates dice through Babylon Physics V2 and Havok
- supports assisted physical landing through `forcedResultMode: "physics"`
- supports visual correction through `forcedResultMode: "visual"`
- exposes `displayRoll(request)` for deterministic result display
- keeps 3D concerns separate from parsing, normalization, Discord formatting, and chat output

The default `assetPath` remains `/assets/dice-box/` for compatibility with existing ERPG static assets.

## Forced Result Modes

`forcedResultMode` is optional and defaults to `"physics"`.

- `"physics"`: guides the physical body toward the requested face while it is still rolling.
- `"visual"`: lets the die roll freely, then applies the requested face before the roll result is emitted.

Both modes keep `displayRoll()` display-only. The caller still provides the resolved die values; this package only renders those values.

## Attribution

This package is an ERPG-owned derivative of the open-source `@3d-dice/dice-box` project by 3Ddice.
The original project provided the BabylonJS dice-rendering foundation; ERPG has since adapted the package for Havok-only runtime usage, install-time simplicity, result-display workflows, forced resolved values, and ERPG integration.

The original project remains credited in `LICENSE`.
This package keeps the MIT license and preserves the upstream copyright notice.

## License

MIT.
