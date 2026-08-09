import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getPolyhedralModelCacheKey } from './renderers/PolyhedralFactory'
import { assertThemeConfig } from './themeRepository'
import {
	createUpdatedViewerOptions,
	createViewerOptions,
	validateViewerOptions
} from './timelineOptions'
import type { ResolvedThemeConfig, ViewerOptions } from './types'

describe('viewer and theme configuration boundaries', () => {
	it('rejects invalid numeric viewer options before they reach Babylon or Havok', () => {
		const invalid: readonly ViewerOptions[] = [
			{ scale: 0 },
			{ mass: Number.NaN },
			{ startingHeight: -1 },
			{ colliderScale: 0 },
			{ shadowResolution: 0 },
			{ shadowTransparency: 1.1 },
			{ friction: -0.1 },
			{ settleTimeout: 0 }
		]
		for(const options of invalid) {
			assert.throws(() => validateViewerOptions(createViewerOptions(options)))
		}
	})

	it('keeps the last valid options when a merged update is rejected', () => {
		const current = createViewerOptions({ scale: 5, gravity: 1.3 })
		validateViewerOptions(current)
		assert.throws(() => createUpdatedViewerOptions(current, { scale: -2 }))
		assert.equal(current.scale, 5)
		assert.equal(current.gravity, 1.3)
		const updated = createUpdatedViewerOptions(current, { gravity: 0 })
		assert.equal(updated.gravity, 0)
	})

	it('validates material and coin structures at the fetch boundary', () => {
		assert.doesNotThrow(() => assertThemeConfig({
			material: { type: 'color', diffuseTexture: { light: 'light.webp', dark: 'dark.webp' } },
			diceAvailable: ['d6'],
			coin: {
				front: { value: 1, texture: 'front.svg' },
				back: { value: 2, texture: 'back.svg' },
				diameter: 1,
				thickness: 0.12
			}
		}, 'valid'))
		assert.throws(() => assertThemeConfig({
			material: { type: 'unknown' },
			diceAvailable: ['d6']
		}, 'invalid'), /material\.type/)
		assert.throws(() => assertThemeConfig({
			material: { type: 'color' },
			diceAvailable: ['d6'],
			coin: {
				front: { value: 2, texture: 'front.svg' },
				back: { value: 1, texture: 'back.svg' }
			}
		}, 'invalid-coin'), /coin\.front/)
	})

	it('separates external models with identical file names by their full URL', () => {
		const first = {
			meshName: 'default',
			meshFilePath: 'https://themes.example/first/default.json'
		} as ResolvedThemeConfig
		const second = {
			meshName: 'default',
			meshFilePath: 'https://themes.example/second/default.json'
		} as ResolvedThemeConfig
		assert.notEqual(getPolyhedralModelCacheKey(first), getPolyhedralModelCacheKey(second))
	})
})
