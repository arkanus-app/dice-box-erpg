import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { createCoinShape, getCoinAccentColor, getCoinTargetQuaternion, getCoinTemplateKey } from './render/coinTheme'
import { readFace } from './engine/shape'
import { qmul, qrot, quatFromAxisAngle } from './engine/vector'
import { DEFAULT_COIN_THEME } from './themeRepository'

describe('coin face orientation', () => {
	it('turns the modeled front face up for value 1', () => {
		assert.ok(qrot(getCoinTargetQuaternion(1), [0, 1, 0])[1] > 0.999)
	})

	it('turns the modeled back face up for value 2', () => {
		assert.ok(qrot(getCoinTargetQuaternion(2), [0, 1, 0])[1] < -0.999)
	})

	it('reads a slightly tilted coin without confusing it with the opposite face', () => {
		const shape = createCoinShape(0.35, 0.042)
		for(const value of [1, 2] as const) {
			const pose = qmul(quatFromAxisAngle([0, 1, 0], 1.7), qmul(quatFromAxisAngle([0, 0, 1], 0.12), getCoinTargetQuaternion(value)))
			const reading = readFace(shape, pose)
			assert.equal(reading.face.value, value)
			assert.ok(reading.alignment > 0.99)
		}
	})

	it('treats a coin standing on its edge as unreadable', () => {
		const shape = createCoinShape(0.35, 0.042)
		assert.equal(readFace(shape, quatFromAxisAngle([1, 0, 0], Math.PI / 2)).alignment, 0)
	})

	it('has a symmetry that swaps the faces, so any landing can show either value', () => {
		const shape = createCoinShape(0.35, 0.042)
		assert.ok(shape.symmetries.some(g => qrot(g, [0, 1, 0])[1] < -0.999))
		assert.ok(shape.symmetries.length >= 48)
	})
})

describe('coin skin presentation', () => {
	it('uses the selected dice color for the tintable numeric coin', () => {
		assert.equal(DEFAULT_COIN_THEME.colorize, true)
		assert.equal(getCoinAccentColor(DEFAULT_COIN_THEME, '#ff007a'), '#ff007a')
		assert.notEqual(getCoinTemplateKey('default', '#ff007a', false), getCoinTemplateKey('default', '#315d9b', false))
		assert.notEqual(getCoinTemplateKey('default', '#ff007a', false), getCoinTemplateKey('default', '#ff007a', true))
	})

	it('preserves the configured edge color for full-art coin themes', () => {
		assert.equal(getCoinAccentColor({ ...DEFAULT_COIN_THEME, colorize: false, edgeColor: '#8a5a24' }, '#ff007a'), '#8a5a24')
	})

	it('keeps bundled coin SVGs as number-only alpha artwork', () => {
		const config = JSON.parse(readFileSync(new URL('../public/assets/dice-box/themes/default/theme.config.json', import.meta.url), 'utf8')) as { coin?: { colorize?: boolean } }
		assert.equal(config.coin?.colorize, true)
		for(const value of [1, 2] as const) {
			const svg = readFileSync(new URL(`../public/assets/dice-box/themes/default/coin-${String(value)}.svg`, import.meta.url), 'utf8')
			assert.match(svg, new RegExp(`>${String(value)}</text>`))
			assert.doesNotMatch(svg, /<circle\b|#d6ae52|#c89b3c/i)
		}
	})
})
