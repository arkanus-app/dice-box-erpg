import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer'
import { Scene } from '@babylonjs/core/scene'
import './renderers/KinematicRenderer'

describe('semantic timeline renderer dependencies', () => {
	it('registers the Babylon effect-layer scene component used by timeline cues', () => {
		const engine = new NullEngine({ renderWidth: 64, renderHeight: 64 })
		const scene = new Scene(engine)
		let layer: HighlightLayer | undefined
		try {
			assert.doesNotThrow(() => {
				layer = new HighlightLayer('timeline-cue-test', scene)
			})
			assert.equal(scene.effectLayers.includes(layer!), true)
		} finally {
			layer?.dispose()
			scene.dispose()
			engine.dispose()
		}
	})
})
