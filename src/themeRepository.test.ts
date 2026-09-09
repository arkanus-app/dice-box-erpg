import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ThemeRepository } from './themeRepository'
import { createUpdatedViewerOptions, createViewerOptions } from './timelineOptions'

const response = (): Response => Response.json({ material: { type: 'color' }, diceAvailable: ['d6'] })

describe('theme repository cache lifecycle', () => {
	it('reuses pending and loaded configurations after visual option updates', async context => {
		const fetch = context.mock.method(globalThis, 'fetch', async () => response())
		const initial = createViewerOptions({ externalThemes: { custom: '/themes/custom' } })
		const repository = new ThemeRepository(initial)
		const pending = repository.load('custom')
		assert.equal(repository.load('custom'), pending)
		repository.updateOptions(createUpdatedViewerOptions(initial, { themeColor: '#ffffff', lightIntensity: 0.8 }))
		assert.equal(repository.load('custom'), pending)
		const config = await pending
		assert.equal(await repository.load('custom'), config)
		assert.equal(fetch.mock.callCount(), 1)
	})

	it('invalidates only changed external theme mappings', async context => {
		const fetch = context.mock.method(globalThis, 'fetch', async () => response())
		const initial = createViewerOptions({ externalThemes: { a: '/a', b: '/b' } })
		const repository = new ThemeRepository(initial)
		const [a, b, standard] = await Promise.all(['a', 'b', 'default'].map(theme => repository.load(theme)))
		repository.updateOptions(createUpdatedViewerOptions(initial, { externalThemes: { a: '/a-v2', b: '/b' } }))
		assert.notEqual(await repository.load('a'), a)
		assert.equal(await repository.load('b'), b)
		assert.equal(await repository.load('default'), standard)
		assert.equal(fetch.mock.callCount(), 4)
	})

	it('does not let a stale failure evict a newer request for the same theme', async context => {
		const requests = [Promise.withResolvers<Response>(), Promise.withResolvers<Response>()]
		let index = 0
		const fetch = context.mock.method(globalThis, 'fetch', () => requests[index++]!.promise)
		const initial = createViewerOptions({ assetPath: '/old/' })
		const repository = new ThemeRepository(initial)
		const stale = repository.load('default')
		const rejected = assert.rejects(stale, /old request failed/)
		repository.updateOptions(createUpdatedViewerOptions(initial, { assetPath: '/new/' }))
		const current = repository.load('default')
		requests[0]!.reject(new Error('old request failed'))
		await rejected
		assert.equal(repository.load('default'), current)
		requests[1]!.resolve(response())
		await current
		assert.equal(fetch.mock.callCount(), 2)
	})

	it('resolves all asset paths from the options captured when the request started', async context => {
		const request = Promise.withResolvers<Response>()
		context.mock.method(globalThis, 'fetch', () => request.promise)
		const initial = createViewerOptions({ origin: 'https://old.example', assetPath: '/old/' })
		const repository = new ThemeRepository(initial)
		const pending = repository.load('custom')
		repository.updateOptions(createUpdatedViewerOptions(initial, { origin: 'https://new.example', assetPath: '/new/' }))
		request.resolve(response())
		const config = await pending
		assert.equal(config.basePath, 'https://old.example/old/themes/custom')
		assert.equal(config.meshFilePath, 'https://old.example/old/themes/default/default.json')
		assert.equal(config.coin.front.texture, 'https://old.example/old/themes/default/coin-1.svg')
	})

	it('invalidates fallback assets when the origin changes, including external themes', async context => {
		context.mock.method(globalThis, 'fetch', async () => response())
		const initial = createViewerOptions({ origin: 'https://old.example', externalThemes: { custom: 'https://themes.example/custom' } })
		const repository = new ThemeRepository(initial)
		const old = await repository.load('custom')
		repository.updateOptions(createUpdatedViewerOptions(initial, { origin: 'https://new.example' }))
		const current = await repository.load('custom')
		assert.notEqual(current, old)
		assert.equal(current.basePath, old.basePath)
		assert.match(current.meshFilePath, /^https:\/\/new\.example\//)
	})

	it('retries failed requests without retaining the rejection', async context => {
		let attempts = 0
		context.mock.method(globalThis, 'fetch', async () => ++attempts === 1 ? new Response(null, { status: 503 }) : response())
		const repository = new ThemeRepository(createViewerOptions({}))
		await assert.rejects(repository.load('default'), /503/)
		assert.equal((await repository.load('default')).theme, 'default')
		assert.equal(attempts, 2)
	})
})
