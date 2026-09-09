import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it, type TestContext } from 'node:test'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Scene } from '@babylonjs/core/scene'
import { PolyhedralFactory } from './renderers/PolyhedralFactory'
import { DEFAULT_COIN_THEME } from './themeRepository'
import type { ResolvedThemeConfig } from './types'

const modelSource = readFileSync(new URL('../public/assets/dice-box/themes/default/default.json', import.meta.url), 'utf8')
const config: ResolvedThemeConfig = {
	theme: 'default', basePath: '/themes/default', meshName: 'default', meshFilePath: '/themes/default/default.json',
	material: { type: 'color' }, diceAvailable: ['d6'], coin: DEFAULT_COIN_THEME
}
const createFactory = (context: TestContext) => {
	const engine = new NullEngine()
	const scene = new Scene(engine)
	const factory = new PolyhedralFactory(scene)
	context.after(() => { factory.dispose(); scene.dispose(); engine.dispose() })
	return { factory, scene }
}

describe('polyhedral model ownership', () => {
	it('shares a model URL across themes and releases its hidden templates on dispose', async context => {
		const fetch = context.mock.method(globalThis, 'fetch', async () => new Response(modelSource))
		const { factory, scene } = createFactory(context)
		const first = factory.load(config)
		assert.equal(factory.load({ ...config, theme: 'another' }), first)
		await first
		assert.ok(scene.meshes.length > 0)
		assert.equal(fetch.mock.callCount(), 1)
		factory.dispose()
		assert.equal(scene.meshes.length, 0)
		factory.dispose()
		await assert.rejects(factory.load(config), /disposed/)
		assert.equal(fetch.mock.callCount(), 1)
	})

	it('aborts downloads and prevents late model parsing after disposal', async context => {
		const response = Promise.withResolvers<Response>()
		let signal: AbortSignal | undefined
		context.mock.method(globalThis, 'fetch', (_url, options) => { signal = options?.signal; return response.promise })
		const { factory, scene } = createFactory(context)
		const pending = factory.load(config)
		factory.dispose()
		response.resolve(new Response(modelSource))
		await assert.rejects(pending, /disposed|abort/i)
		assert.equal(signal?.aborted, true)
		assert.equal(scene.meshes.length, 0)
	})

	it('rolls back parsed templates after a model error and allows a clean retry', async context => {
		context.mock.method(globalThis, 'fetch', async () => new Response(modelSource))
		const { factory, scene } = createFactory(context)
		const parse = Mesh.Parse
		let parsed = 0
		const mocked = context.mock.method(Mesh, 'Parse', (...args) => {
			if(++parsed === 2) throw new Error('malformed mesh')
			return parse.apply(Mesh, args)
		})
		await assert.rejects(factory.load(config), /malformed mesh/)
		assert.equal(scene.meshes.length, 0)
		mocked.mock.restore()
		await factory.load(config)
		assert.ok(scene.meshes.length > 0)
	})
})
