import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { prepareThemes } from './renderers/prepareThemes'
import { isDisplayCancelledError } from './errors'
import type { ResolvedThemeConfig } from './types'

const config = (theme: string): ResolvedThemeConfig => ({ theme } as ResolvedThemeConfig)
const tick = async (): Promise<void> => { await Promise.resolve(); await Promise.resolve() }

describe('shared presentation theme preparation', () => {
	it('loads independent themes concurrently with at most four active pipelines', async () => {
		const gate = Promise.withResolvers<void>()
		const started: string[] = []
		const callbacks: string[] = []
		let active = 0
		let maximum = 0
		const dice = Array.from({ length: 9 }, (_, index) => ({ theme: String(index), sides: 6 as const }))
		const pending = prepareThemes(dice, {
			loadTheme: async theme => {
				started.push(theme)
				maximum = Math.max(maximum, ++active)
				await gate.promise
				return config(theme)
			},
			loadModel: async () => { active-- },
			onThemeLoaded: value => callbacks.push(value.theme)
		}, new AbortController().signal)
		await tick()
		assert.equal(started.length, 4)
		gate.resolve()
		const result = await pending
		assert.equal(maximum, 4)
		assert.deepEqual([...result.keys()], dice.map(die => die.theme))
		assert.deepEqual(callbacks, dice.map(die => die.theme))
	})

	it('deduplicates themes in one pass and skips models for coin-only themes', async () => {
		const fetched: string[] = []
		const models: string[] = []
		await prepareThemes([
			{ theme: 'mixed', sides: 2 }, { theme: 'coin', sides: 2 },
			{ theme: 'mixed', sides: 6 }, { theme: 'coin', sides: 2 }
		], {
			loadTheme: async theme => { fetched.push(theme); return config(theme) },
			loadModel: async value => { models.push(value.theme) },
			onThemeLoaded: () => undefined
		}, new AbortController().signal)
		assert.deepEqual(fetched, ['mixed', 'coin'])
		assert.deepEqual(models, ['mixed'])
	})

	it('keeps callbacks in die order even when downloads finish out of order', async () => {
		const slow = Promise.withResolvers<ResolvedThemeConfig>()
		const callbacks: string[] = []
		const pending = prepareThemes([{ theme: 'slow', sides: 6 }, { theme: 'fast', sides: 6 }], {
			loadTheme: async theme => theme === 'slow' ? slow.promise : config(theme),
			loadModel: async () => undefined,
			onThemeLoaded: value => callbacks.push(value.theme)
		}, new AbortController().signal)
		await tick()
		assert.deepEqual(callbacks, [])
		slow.resolve(config('slow'))
		await pending
		assert.deepEqual(callbacks, ['slow', 'fast'])
	})

	it('stops model creation and callbacks when cancelled during a configuration fetch', async () => {
		const controller = new AbortController()
		const gate = Promise.withResolvers<ResolvedThemeConfig>()
		let models = 0
		let callbacks = 0
		const pending = prepareThemes([{ theme: 'slow', sides: 6 }], {
			loadTheme: () => gate.promise,
			loadModel: async () => { models++ },
			onThemeLoaded: () => { callbacks++ }
		}, controller.signal)
		controller.abort()
		gate.resolve(config('slow'))
		await assert.rejects(pending, isDisplayCancelledError)
		assert.equal(models, 0)
		assert.equal(callbacks, 0)
	})

	it('settles ongoing work after failure without starting queued themes', async () => {
		const gate = Promise.withResolvers<ResolvedThemeConfig>()
		const fetched: string[] = []
		let settled = false
		const pending = prepareThemes(Array.from({ length: 8 }, (_, index) => ({ theme: String(index), sides: 6 as const })), {
			loadTheme: async theme => {
				fetched.push(theme)
				if(theme === '0') throw new Error('theme unavailable')
				return gate.promise
			},
			loadModel: async () => assert.fail('model should not start after failure'),
			onThemeLoaded: () => assert.fail('incomplete preparation must not emit loaded callbacks')
		}, new AbortController().signal)
		const rejected = assert.rejects(pending, /theme unavailable/).then(() => { settled = true })
		await tick()
		assert.equal(settled, false)
		gate.resolve(config('remaining'))
		await rejected
		assert.deepEqual(fetched, ['0', '1', '2', '3'])
	})

	it('honors cancellation from a theme callback before dispatching the next one', async () => {
		const controller = new AbortController()
		let callbacks = 0
		await assert.rejects(prepareThemes([{ theme: 'a', sides: 2 }, { theme: 'b', sides: 2 }], {
			loadTheme: async theme => config(theme),
			loadModel: async () => undefined,
			onThemeLoaded: () => { callbacks++; controller.abort() }
		}, controller.signal), isDisplayCancelledError)
		assert.equal(callbacks, 1)
	})
})
