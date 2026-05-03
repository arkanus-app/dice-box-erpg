# ERPG Dice Box Fork

This fork keeps the public `@3d-dice/dice-box` source as the base and adds ERPG-specific visual roll controls.

## Changes

- Accept resolved dice values through roll notation (`value`, `values`, `faceValues`, `discarded`).
- Synchronize the visual top face with externally resolved roll values.
- Smooth the final correction instead of snapping the die at the end of the simulation.
- Fade discarded dice toward grayscale for keep/drop notation such as `kh` and `kl`.
- Remove the install-time asset copy prompt so CI and Cloudflare builds can run unattended.

## Packaging

The app should consume this fork as a git dependency or published package. The generated `dist/` output is committed so installers do not need to run the build pipeline.
