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
import {
	createPhysicsBoundsLayout,
	createStaticPhysicsBox,
	PHYSICS_WALL_THICKNESS,
	type PhysicsBoundsLayout
} from './renderers/physicsBounds'
import { DISPLAY_CAMERA_FOV, DISPLAY_CAMERA_HEIGHT } from './renderers/sceneEnvironment'
import { computeDisplayViewportBounds } from './renderers/viewportBounds'

const require = createRequire(import.meta.url)
const havokEntry = require.resolve('@babylonjs/havok')
const havokWasm = join(dirname(havokEntry), '..', 'esm', 'HavokPhysics.wasm')

const createLayout = (width = 1200, height = 800): PhysicsBoundsLayout => {
	const bounds = computeDisplayViewportBounds({
		width,
		height,
		cameraHeight: DISPLAY_CAMERA_HEIGHT,
		cameraFov: DISPLAY_CAMERA_FOV,
		wallPadding: 0.4,
		minimumRadius: 0.62
	})
	return createPhysicsBoundsLayout({ bounds, startingHeight: 6.4, largestRadius: 0.62 })
}

describe('responsive physics bounds layout', () => {
	it('places the inner faces of all four walls exactly on the projected page limits', () => {
		for(const viewport of [
			{ width: 1440, height: 720 },
			{ width: 390, height: 844 }
		]) {
			const bounds = computeDisplayViewportBounds({
				...viewport,
				cameraHeight: DISPLAY_CAMERA_HEIGHT,
				cameraFov: DISPLAY_CAMERA_FOV,
				wallPadding: 0.4,
				minimumRadius: 0.62
			})
			const layout = createPhysicsBoundsLayout({ bounds, startingHeight: 6.4, largestRadius: 0.62 })
			const [north, south, west, east] = layout.walls

			assert.equal(north.size.depth, PHYSICS_WALL_THICKNESS)
			assert.equal(south.size.depth, PHYSICS_WALL_THICKNESS)
			assert.equal(west.size.width, PHYSICS_WALL_THICKNESS)
			assert.equal(east.size.width, PHYSICS_WALL_THICKNESS)
			assert.ok(Math.abs(north.position.z + north.size.depth / 2 - bounds.north) < 1e-12)
			assert.ok(Math.abs(south.position.z - south.size.depth / 2 - bounds.south) < 1e-12)
			assert.ok(Math.abs(west.position.x + west.size.width / 2 - bounds.left) < 1e-12)
			assert.ok(Math.abs(east.position.x - east.size.width / 2 - bounds.right) < 1e-12)

			const spanX = bounds.right - bounds.left
			const spanZ = bounds.south - bounds.north
			assert.ok(north.size.width >= spanX + PHYSICS_WALL_THICKNESS * 2)
			assert.ok(west.size.depth >= spanZ + PHYSICS_WALL_THICKNESS * 2)
			assert.ok(layout.floor.size.width >= spanX + PHYSICS_WALL_THICKNESS * 2)
			assert.ok(layout.floor.size.depth >= spanZ + PHYSICS_WALL_THICKNESS * 2)
			assert.ok(layout.floor.size.width >= 24)
			assert.ok(layout.floor.size.depth >= 24)
		}
	})
})

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

	it('keeps dynamic bodies inside all four responsive walls', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(Vector3.Zero(), new HavokPlugin(true, havok))
		const layout = createLayout(900, 600)
		for(const box of layout.walls) {
			createStaticPhysicsBox(scene, box.name, box.size, box.position, { friction: 0.86, restitution: 0.1 })
		}

		const halfBody = 0.25
		const cases = [
			{ name: 'north', velocity: new Vector3(0, 0, -10) },
			{ name: 'south', velocity: new Vector3(0, 0, 10) },
			{ name: 'west', velocity: new Vector3(-10, 0, 0) },
			{ name: 'east', velocity: new Vector3(10, 0, 0) }
		] as const
		const bodies = cases.map(testCase => {
			const mesh = CreateBox(`test-die-${testCase.name}`, { size: halfBody * 2 }, scene)
			mesh.position.set(0, 2, 0)
			const body = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene)
			body.shape = PhysicsShapeBox.FromMesh(mesh)
			body.setMassProperties({ mass: 1 })
			body.setLinearVelocity(testCase.velocity)
			return { ...testCase, mesh }
		})

		const [north, south, west, east] = layout.walls
		const northFace = north.position.z + north.size.depth / 2
		const southFace = south.position.z - south.size.depth / 2
		const westFace = west.position.x + west.size.width / 2
		const eastFace = east.position.x - east.size.width / 2
		const tolerance = 0.035
		const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
		for(let index = 0; index < 180; index += 1) {
			physics._step(1 / 120)
			for(const { name, mesh } of bodies) {
				assert.ok(mesh.position.z - halfBody >= northFace - tolerance, `${name} crossed north at z=${mesh.position.z}`)
				assert.ok(mesh.position.z + halfBody <= southFace + tolerance, `${name} crossed south at z=${mesh.position.z}`)
				assert.ok(mesh.position.x - halfBody >= westFace - tolerance, `${name} crossed west at x=${mesh.position.x}`)
				assert.ok(mesh.position.x + halfBody <= eastFace + tolerance, `${name} crossed east at x=${mesh.position.x}`)
			}
		}

		scene.dispose()
		engine.dispose()
	})
})
