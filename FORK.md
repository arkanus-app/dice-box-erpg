# ERPG Dice 3D View v2

Version 2 replaces the inherited roll-authority architecture with a TypeScript display pipeline.

## ERPG changes

- accepts only resolved values from `@erpg/dicecore`;
- exposes `DiceResultViewer.display()` instead of notation or roll APIs;
- supports a lightweight kinematic renderer and a lazy Havok physics renderer;
- renders d2 as a procedural, theme-configurable coin;
- precomputes target orientations from model face maps without reading a result back from the scene;
- publishes strict TypeScript declarations and a single ESM distribution;
- removes OffscreenCanvas and no-WebGL world duplicates from the inherited implementation.

The generated `dist/` remains committed because ERPG can consume the package directly from Git and jsDelivr.
