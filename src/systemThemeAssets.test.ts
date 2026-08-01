import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import type { ThemeConfig } from './types'

const themesRoot = new URL('../public/assets/dice-box/themes/', import.meta.url)

const loadTheme = (theme: string): ThemeConfig => JSON.parse(readFileSync(
	new URL(`${theme}/theme.config.json`, themesRoot),
	'utf8'
)) as ThemeConfig

const symbols = (config: ThemeConfig, sides: number, value: number): readonly string[] =>
	config.faceMetadata?.dice[`d${sides}`]?.[String(value)]?.symbols ?? []

describe('bundled symbolic theme assets', () => {
	it('ships light and dark face atlases without retaining the numbered bump map', () => {
		for(const theme of ['vampire-v5-normal', 'vampire-v5-hunger', 'assimilation', 'fate']) {
			const config = loadTheme(theme)
			assert.equal(config.material.bumpTexture, undefined)
			assert.deepEqual(config.faceAtlas, {
				layoutId: 'erpg-default-v1',
				width: 1024,
				height: 1024,
				model: '../default/default.json'
			})
			assert.equal(config.material.type, 'color')
			assert.deepEqual(config.material.diffuseTexture, {
				light: 'faces-light.svg',
				dark: 'faces-dark.svg'
			})
			for(const name of ['faces-light.svg', 'faces-dark.svg']) {
				const target = new URL(`${theme}/${name}`, themesRoot)
				assert.equal(existsSync(fileURLToPath(target)), true)
				const svg = readFileSync(target, 'utf8')
				assert.match(svg, /<svg[^>]+viewBox="0 0 1024 1024"/)
				assert.doesNotMatch(svg, /<text\b/)
			}
		}
	})

	it('matches the current Assimilação d6, d10, and d12 face table', () => {
		const config = loadTheme('assimilation')
		assert.deepEqual(config.diceAvailable, ['d6', 'd10', 'd12'])
		const expected = {
			1: [],
			2: [],
			3: ['pressure'],
			4: ['pressure'],
			5: ['adaptation', 'pressure'],
			6: ['success'],
			7: ['success', 'success'],
			8: ['success', 'adaptation'],
			9: ['success', 'adaptation', 'pressure'],
			10: ['success', 'success', 'pressure'],
			11: ['success', 'adaptation', 'adaptation', 'pressure'],
			12: ['pressure', 'pressure']
		} as const
		for(const sides of [6, 10, 12] as const) {
			for(let value = 1; value <= sides; value += 1) {
				assert.deepEqual(symbols(config, sides, value), expected[value])
			}
		}
	})

	it('uses the project-supplied Assimilação SVG glyphs', () => {
		const config = loadTheme('assimilation')
		const artwork = config.artwork as {
			readonly kind: string
			readonly license: string
			readonly glyphSources: Readonly<Record<string, string>>
		}
		assert.equal(artwork.kind, 'project-supplied-vector-glyphs')
		assert.match(artwork.license, /Project-supplied/)
		assert.deepEqual(artwork.glyphSources, {
			success: 'scripts/theme-artwork/assimilation-success-ladybug.svg',
			adaptation: 'scripts/theme-artwork/assimilation-adaptation-deer.svg',
			pressure: 'scripts/theme-artwork/assimilation-pressure-owl.svg'
		})
		for(const source of Object.values(artwork.glyphSources)) {
			const svg = readFileSync(new URL(`../${source}`, import.meta.url), 'utf8')
			assert.match(svg, /^<svg\b/)
			assert.match(svg, /fill="white"/)
			assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b/i)
		}
	})

	it('describes the semantic V5 faces and uses the supplied SVG glyphs', () => {
		const normal = loadTheme('vampire-v5-normal')
		const hunger = loadTheme('vampire-v5-hunger')
		for(let value = 1; value <= 5; value += 1) {
			assert.deepEqual(symbols(normal, 10, value), [])
		}
		for(let value = 6; value <= 9; value += 1) {
			assert.deepEqual(symbols(normal, 10, value), ['success'])
			assert.deepEqual(symbols(hunger, 10, value), ['success'])
		}
		assert.deepEqual(symbols(normal, 10, 10), ['success', 'critical'])
		assert.deepEqual(symbols(hunger, 10, 1), ['bestial-failure'])
		assert.deepEqual(symbols(hunger, 10, 10), ['success', 'critical', 'messy-critical'])

		const expectedSources = {
			'vampire-v5-normal': {
				success: 'scripts/theme-artwork/vampire-v5-success.svg',
				critical: 'scripts/theme-artwork/vampire-v5-critical.svg'
			},
			'vampire-v5-hunger': {
				success: 'scripts/theme-artwork/vampire-v5-success.svg',
				'bestial-failure': 'scripts/theme-artwork/vampire-v5-hunger-failure.svg',
				'messy-critical': 'scripts/theme-artwork/vampire-v5-hunger-critical.svg'
			}
		} as const
		for(const [themeName, glyphSources] of Object.entries(expectedSources)) {
			const config = loadTheme(themeName)
			const artwork = config.artwork as {
				readonly kind: string
				readonly glyphSources: Readonly<Record<string, string>>
			}
			assert.equal(artwork.kind, 'project-supplied-vector-glyphs')
			assert.deepEqual(artwork.glyphSources, glyphSources)
			for(const source of Object.values(glyphSources)) {
				const svg = readFileSync(new URL(`../${source}`, import.meta.url), 'utf8')
				assert.match(svg, /^<svg\b/)
				assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b/i)
			}
		}

		const normalAtlas = readFileSync(
			new URL('vampire-v5-normal/faces-light.svg', themesRoot),
			'utf8'
		)
		const hungerAtlas = readFileSync(
			new URL('vampire-v5-hunger/faces-light.svg', themesRoot),
			'utf8'
		)
		for(const face of [6, 7, 8, 9]) {
			assert.match(normalAtlas, new RegExp(`data-face="${face}" data-glyph="success"`))
			assert.match(hungerAtlas, new RegExp(`data-face="${face}" data-glyph="success"`))
		}
		assert.match(normalAtlas, /data-face="10" data-glyph="critical"/)
		assert.match(hungerAtlas, /data-face="1" data-glyph="hunger-failure"/)
		assert.match(hungerAtlas, /data-face="10" data-glyph="hunger-critical"/)
	})

	it('maps the six physical Fate faces to two minus, two blank, and two plus faces', () => {
		const config = loadTheme('fate')
		assert.deepEqual(config.diceAvailable, ['d6'])
		assert.deepEqual(
			Array.from({ length: 6 }, (_value, index) => symbols(config, 6, index + 1)),
			[['minus'], ['minus'], [], [], ['plus'], ['plus']]
		)
		assert.equal(config.faceMetadata?.dice.d6?.['1']?.label, 'Menos (−1)')
		assert.equal(config.faceMetadata?.dice.d6?.['3']?.label, 'Vazio (0)')
		assert.equal(config.faceMetadata?.dice.d6?.['6']?.label, 'Mais (+1)')
	})
})
