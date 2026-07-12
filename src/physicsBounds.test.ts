import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import HavokPhysics from '@babylonjs/havok'
import '@babylonjs/core/Physics/physicsEngineComponent'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Scene } from '@babylonjs/core/scene'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { createStaticPhysicsBox } from './renderers/physicsBounds'

const require = createRequire(import.meta.url)
const havokEntry = require.resolve('@babylonjs/havok')
const havokWasm = join(dirname(havokEntry), '..', 'esm', 'HavokPhysics.wasm')

describe('physics floor bounds', () => {
	it('supports a die outside the former half-sized floor', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok))

		createStaticPhysicsBox(
			scene,
			'test-floor',
			{ width: 24, height: 2, depth: 24 },
			new Vector3(0, -1, 0),
			{ friction: 0.86, restitution: 0.16 }
		)

		const die = CreateBox('test-die', { size: 1 }, scene)
		die.position.set(7, 2, 0)
		const dieBody = new PhysicsBody(die, PhysicsMotionType.DYNAMIC, false, scene)
		dieBody.shape = PhysicsShapeBox.FromMesh(die)
		dieBody.setMassProperties({ mass: 1 })

		const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
		for(let index = 0; index < 180; index += 1) physics._step(1 / 60)

		assert.ok(die.position.y > 0.45, `die fell through the floor to y=${die.position.y}`)
		assert.ok(die.position.y < 0.55, `die stopped above the floor at y=${die.position.y}`)
		scene.dispose()
		engine.dispose()
	})
})
