import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it, mock } from 'node:test'
import HavokPhysics from '@babylonjs/havok'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import '@babylonjs/core/Physics/physicsEngineComponent'
import { createHavokRuntimeLoader } from './havokRuntime'

const wasmBinary = readFileSync(new URL('../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm', import.meta.url))

describe('shared Havok initialization', () => {
	it('rejects malformed browser URLs asynchronously so scene cleanup can finish', async () => {
		Object.defineProperty(globalThis, 'document', { configurable: true, value: { baseURI: 'https://erpg.app/' } })
		try {
			const create = mock.fn(async () => HavokPhysics({ wasmBinary }))
			const load = createHavokRuntimeLoader(create)
			await assert.rejects(load('http://['), /Invalid URL/)
			assert.equal(create.mock.callCount(), 0)
		} finally {
			Reflect.deleteProperty(globalThis, 'document')
		}
	})

	it('deduplicates concurrent loads while preserving independent world disposal', async () => {
		let calls = 0
		const load = createHavokRuntimeLoader(async () => {
			calls++
			return HavokPhysics({ wasmBinary })
		})
		const [first, second] = await Promise.all([load('/havok.wasm?v=1'), load('/havok.wasm?v=1')])
		assert.equal(calls, 1)
		assert.equal(first, second)
		const engine = new NullEngine()
		const sceneA = new Scene(engine)
		const sceneB = new Scene(engine)
		try {
			const pluginA = new HavokPlugin(true, first)
			const pluginB = new HavokPlugin(true, second)
			sceneA.enablePhysics(new Vector3(0, -1, 0), pluginA)
			sceneB.enablePhysics(new Vector3(0, -9.81, 0), pluginB)
			assert.notDeepEqual(pluginA.world, pluginB.world)
			const worldB = pluginB.world
			sceneA.dispose()
			assert.equal(pluginA.world, undefined)
			assert.equal(pluginB.world, worldB)
			assert.equal(second.HP_World_Step(worldB, 1 / 60), second.Result.RESULT_OK)
			assert.equal(await load('/havok.wasm?v=1'), first)
		} finally {
			sceneB.dispose()
			engine.dispose()
		}
	})

	it('retries failures and keys successful loads by the complete WASM URL', async () => {
		const urls: string[] = []
		const load = createHavokRuntimeLoader(async url => {
			urls.push(url)
			if(urls.length === 1) throw new Error('temporary network failure')
			return HavokPhysics({ wasmBinary })
		})
		await assert.rejects(load('/havok.wasm?v=1'), /network failure/)
		const first = await load('/havok.wasm?v=1')
		assert.equal(await load('/havok.wasm?v=1'), first)
		assert.notEqual(await load('/havok.wasm?v=2'), first)
		assert.deepEqual(urls, ['/havok.wasm?v=1', '/havok.wasm?v=1', '/havok.wasm?v=2'])
	})
})
