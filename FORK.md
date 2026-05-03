# ERPG Dice Box Fork

This fork keeps the public `@3d-dice/dice-box` source as the base and adds ERPG-specific visual roll controls.

## Changes

- Accept resolved dice values through roll notation (`value`, `values`, `faceValues`, `discarded`).
- Synchronize the top face with externally resolved roll values.
- Guide the physics body toward the resolved value by default (`forcedResultMode: 'physics'`), with the older visual correction available through `forcedResultMode: 'visual'`.
- Fade discarded dice toward grayscale for keep/drop notation such as `kh` and `kl`.
- Remove the install-time asset copy prompt so CI and Cloudflare builds can run unattended.

## Packaging

The app should consume this fork as a git dependency or published package. The generated `dist/` output is committed so installers do not need to run the build pipeline.
