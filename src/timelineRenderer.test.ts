import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Scene } from '@babylonjs/core/scene'

describe('semantic timeline renderer dependencies', () => {
	it('loads the Babylon effect-layer scene component only with timeline highlights', async () => {
		const engine = new NullEngine({ renderWidth: 64, renderHeight: 64 })
		const scene = new Scene(engine)
		let layer: import('@babylonjs/core/Layers/highlightLayer').HighlightLayer | undefined
		try {
			const { HighlightLayer } = await import('./renderers/timelineHighlightRuntime')
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
