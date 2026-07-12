import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import HavokPhysics from '@babylonjs/havok'
import '@babylonjs/core/Physics/physicsEngineComponent'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import {
	PhysicsActivationControl,
	PhysicsEventType,
	PhysicsMotionType
} from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape'
import { Scene } from '@babylonjs/core/scene'
import { createStaticPhysicsBox } from './renderers/physicsBounds'

const require = createRequire(import.meta.url)
const havokEntry = require.resolve('@babylonjs/havok')
const havokWasm = join(dirname(havokEntry), '..', 'esm', 'HavokPhysics.wasm')
const STEP_SECONDS = 1 / 120

const createDynamicCube = (
	scene: Scene,
	name: string,
	position: Vector3,
	velocity = Vector3.Zero()
): { readonly body: PhysicsBody; readonly mesh: ReturnType<typeof CreateBox> } => {
	const mesh = CreateBox(name, { size: 1 }, scene)
	mesh.position.copyFrom(position)
	const body = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene)
	const shape = PhysicsShapeBox.FromMesh(mesh)
	shape.material = { friction: 0.78, restitution: 0.12 }
	body.shape = shape
	body.setMassProperties({ mass: 1 })
	body.setLinearDamping(0.04)
	body.setAngularDamping(0.28)
	body.setLinearVelocity(velocity)
	return { body, mesh }
}

describe('real Havok collisions between displayed dice', () => {
	it('applies launch velocity only after waking a previously inactive Havok body', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		const plugin = new HavokPlugin(true, havok)
		scene.enablePhysics(Vector3.Zero(), plugin)

		try {
			const intendedVelocity = new Vector3(11, -3.5, 2.25)
			const die = createDynamicCube(scene, 'activation-die', new Vector3(-3, 2, 0))
			die.body.setMotionType(PhysicsMotionType.ANIMATED)
			plugin.setActivationControl(die.body, PhysicsActivationControl.ALWAYS_INACTIVE)

			// Havok clears velocity while changing activation control. The release
			// lifecycle must therefore wake the body before installing its impulse.
			die.body.setMotionType(PhysicsMotionType.DYNAMIC)
			plugin.setActivationControl(die.body, PhysicsActivationControl.ALWAYS_ACTIVE)
			die.body.setLinearVelocity(intendedVelocity)

			assert.ok(
				(die.body.getLinearVelocity() ?? Vector3.Zero()).equalsWithEpsilon(intendedVelocity, 1e-6),
				'launch velocity was cleared while waking the body'
			)
			const initialPosition = die.mesh.position.clone()
			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			physics._step(STEP_SECONDS)
			assert.ok(
				die.mesh.position.x > initialPosition.x + 0.07,
				`woken body did not carry its launch impulse: ${JSON.stringify(die.mesh.position.asArray())}`
			)
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('keeps simultaneous high-speed bodies separated instead of letting them pass through one another', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(Vector3.Zero(), new HavokPlugin(true, havok))

		try {
			const dice = [
				createDynamicCube(scene, 'collision-die-0', new Vector3(-2.4, 2, 0), new Vector3(7.5, 0, 0)),
				createDynamicCube(scene, 'collision-die-1', new Vector3(-0.8, 2, 0), new Vector3(2.5, 0, 0)),
				createDynamicCube(scene, 'collision-die-2', new Vector3(0.8, 2, 0), new Vector3(-2.5, 0, 0)),
				createDynamicCube(scene, 'collision-die-3', new Vector3(2.4, 2, 0), new Vector3(-7.5, 0, 0))
			]
			const collisionPairs = new Set<string>()
			for(const die of dice) {
				die.body.setCollisionCallbackEnabled(true)
				die.body.getCollisionObservable().add(event => {
					if(
						event.type === PhysicsEventType.COLLISION_STARTED
						&& event.collidedAgainst.transformNode.name.startsWith('collision-die-')
					) collisionPairs.add([
						event.collider.transformNode.name,
						event.collidedAgainst.transformNode.name
					].sort().join('|'))
				})
			}

			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			let minimumCenterDistance = Number.POSITIVE_INFINITY
			for(let step = 0; step < 180; step += 1) {
				physics._step(STEP_SECONDS)
				for(let left = 0; left < dice.length; left += 1) {
					for(let right = left + 1; right < dice.length; right += 1) {
						minimumCenterDistance = Math.min(
							minimumCenterDistance,
							Vector3.Distance(dice[left]!.mesh.position, dice[right]!.mesh.position)
						)
					}
				}
				for(let index = 1; index < dice.length; index += 1) {
					assert.ok(
						dice[index - 1]!.mesh.position.x <= dice[index]!.mesh.position.x + 0.02,
						`bodies tunneled through one another: ${dice.map(die => die.mesh.position.x.toFixed(3)).join(', ')}`
					)
				}
			}

			assert.ok(collisionPairs.size >= 3, `only ${String(collisionPairs.size)} unique body pairs collided`)
			assert.ok(
				minimumCenterDistance >= 0.94,
				`dynamic colliders interpenetrated: minimum center distance ${String(minimumCenterDistance)}`
			)
			for(let index = 1; index < dice.length; index += 1) {
				assert.ok(
					dice[index]!.mesh.position.x - dice[index - 1]!.mesh.position.x >= 0.94,
					`resting bodies overlap at x=${String(dice[index - 1]!.mesh.position.x)}/${String(dice[index]!.mesh.position.x)}`
				)
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('keeps a twelve-d6 high-speed edge burst from tunneling or remaining interpenetrated', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(Vector3.Zero(), new HavokPlugin(true, havok))

		try {
			const dice = Array.from({ length: 6 }, (_, lane) => {
				const z = (lane - 2.5) * 1.18
				return [
					createDynamicCube(
						scene,
						`burst-die-${String(lane * 2)}`,
						new Vector3(-4.45, 2, z),
						new Vector3(16, 0, 0)
					),
					createDynamicCube(
						scene,
						`burst-die-${String(lane * 2 + 1)}`,
						new Vector3(-3, 2, z),
						new Vector3(7, 0, 0)
					)
				]
			}).flat()
			const plannedPairKeys = Array.from({ length: 6 }, (_, lane) => [
				`burst-die-${String(lane * 2)}`,
				`burst-die-${String(lane * 2 + 1)}`
			].sort().join('|'))
			const collisionPairs = new Set<string>()
			for(const die of dice) {
				die.body.setCollisionCallbackEnabled(true)
				die.body.getCollisionObservable().add(event => {
					if(
						event.type === PhysicsEventType.COLLISION_STARTED
						&& event.collidedAgainst.transformNode.name.startsWith('burst-die-')
					) collisionPairs.add([
						event.collider.transformNode.name,
						event.collidedAgainst.transformNode.name
					].sort().join('|'))
				})
			}

			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			const deepOverlapStreaks = new Map<string, number>()
			let longestDeepOverlap = 0
			for(let step = 0; step < 150; step += 1) {
				physics._step(STEP_SECONDS)
				for(let left = 0; left < dice.length; left += 1) {
					for(let right = left + 1; right < dice.length; right += 1) {
						const key = `${String(left)}|${String(right)}`
						const deeplyOverlapping = Vector3.Distance(
							dice[left]!.mesh.position,
							dice[right]!.mesh.position
						) < 0.9
						const streak = deeplyOverlapping
							? (deepOverlapStreaks.get(key) ?? 0) + 1
							: 0
						deepOverlapStreaks.set(key, streak)
						longestDeepOverlap = Math.max(longestDeepOverlap, streak)
					}
				}
				for(let lane = 0; lane < 6; lane += 1) {
					const rear = dice[lane * 2]!
					const front = dice[lane * 2 + 1]!
					assert.ok(
						rear.mesh.position.x <= front.mesh.position.x + 0.08
							|| collisionPairs.has(plannedPairKeys[lane]!),
						`lane ${String(lane)} tunneled without contact: ${rear.mesh.position.x.toFixed(3)} > ${front.mesh.position.x.toFixed(3)}`
					)
				}
			}

			for(const pair of plannedPairKeys) {
				assert.ok(collisionPairs.has(pair), `high-speed launch missed the expected body contact ${pair}`)
			}
			assert.ok(
				longestDeepOverlap <= 2,
				`a pair remained deeply interpenetrated for ${String(longestDeepOverlap)} physics steps`
			)
			for(let left = 0; left < dice.length; left += 1) {
				for(let right = left + 1; right < dice.length; right += 1) {
					assert.ok(
						Vector3.Distance(dice[left]!.mesh.position, dice[right]!.mesh.position) >= 0.94,
						`burst bodies ${String(left)}/${String(right)} remained overlapped after resolving`
					)
				}
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('allows a die to remain physically supported on other dice after settling', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok))

		try {
			createStaticPhysicsBox(
				scene,
				'stack-floor',
				{ width: 12, height: 2, depth: 12 },
				new Vector3(0, -1, 0),
				{ friction: 0.86, restitution: 0.08 }
			)
			const dice = [
				createDynamicCube(scene, 'stack-die-0', new Vector3(0, 1.3, 0)),
				createDynamicCube(scene, 'stack-die-1', new Vector3(0, 2.7, 0)),
				createDynamicCube(scene, 'stack-die-2', new Vector3(0, 4.1, 0))
			]
			const collisionPairs = new Set<string>()
			for(const die of dice) {
				die.body.setCollisionCallbackEnabled(true)
				die.body.getCollisionObservable().add(event => {
					if(
						event.type === PhysicsEventType.COLLISION_STARTED
						&& event.collidedAgainst.transformNode.name.startsWith('stack-die-')
					) collisionPairs.add([
						event.collider.transformNode.name,
						event.collidedAgainst.transformNode.name
					].sort().join('|'))
				})
			}

			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			for(let step = 0; step < 720; step += 1) physics._step(STEP_SECONDS)

			const settled = dice
				.map(die => die.mesh.position.clone())
				.sort((a, b) => a.y - b.y)
			assert.ok(collisionPairs.size >= 2, `only ${String(collisionPairs.size)} unique stack pairs touched`)
			assert.ok(settled[0]!.y >= 0.47 && settled[0]!.y <= 0.54)
			assert.ok(
				settled[2]!.y >= 2.4,
				`top die was flattened into the pile at y=${String(settled[2]!.y)}`
			)
			for(let index = 1; index < settled.length; index += 1) {
				const lower = settled[index - 1]!
				const upper = settled[index]!
				assert.ok(
					upper.y - lower.y >= 0.94,
					`stack interpenetrated vertically: ${String(lower.y)} -> ${String(upper.y)}`
				)
				assert.ok(
					Math.hypot(upper.x - lower.x, upper.z - lower.z) <= 0.2,
					`stack slid apart horizontally: ${JSON.stringify(settled.map(position => position.asArray()))}`
				)
			}
			for(const die of dice) {
				assert.ok((die.body.getLinearVelocity() ?? Vector3.Zero()).length() < 0.05)
				assert.ok((die.body.getAngularVelocity() ?? Vector3.Zero()).length() < 0.05)
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('keeps twelve d6 separated while four three-die towers settle and support one another', async () => {
		const havok = await HavokPhysics({ wasmBinary: readFileSync(havokWasm) })
		const engine = new NullEngine()
		const scene = new Scene(engine)
		scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok))

		try {
			createStaticPhysicsBox(
				scene,
				'multi-stack-floor',
				{ width: 12, height: 2, depth: 12 },
				new Vector3(0, -1, 0),
				{ friction: 0.86, restitution: 0.08 }
			)
			const towerCenters = [
				new Vector3(-1.25, 0, -1.25),
				new Vector3(1.25, 0, -1.25),
				new Vector3(-1.25, 0, 1.25),
				new Vector3(1.25, 0, 1.25)
			]
			const towers = towerCenters.map((center, tower) => Array.from(
				{ length: 3 },
				(_, level) => createDynamicCube(
					scene,
					`multi-stack-die-${String(tower)}-${String(level)}`,
					new Vector3(center.x, 1.3 + level * 1.4, center.z)
				)
			))
			const dice = towers.flat()
			const collisionPairs = new Set<string>()
			for(const die of dice) {
				die.body.setCollisionCallbackEnabled(true)
				die.body.getCollisionObservable().add(event => {
					if(
						event.type === PhysicsEventType.COLLISION_STARTED
						&& event.collidedAgainst.transformNode.name.startsWith('multi-stack-die-')
					) collisionPairs.add([
						event.collider.transformNode.name,
						event.collidedAgainst.transformNode.name
					].sort().join('|'))
				})
			}

			const physics = scene.getPhysicsEngine() as unknown as { _step(delta: number): void }
			for(let step = 0; step < 720; step += 1) physics._step(STEP_SECONDS)

			assert.ok(collisionPairs.size >= 8, `only ${String(collisionPairs.size)} die support pairs touched`)
			for(let tower = 0; tower < towers.length; tower += 1) {
				const center = towerCenters[tower]!
				const settled = towers[tower]!
					.map(die => die.mesh.position.clone())
					.sort((a, b) => a.y - b.y)
				assert.ok(settled[0]!.y >= 0.47 && settled[0]!.y <= 0.54)
				assert.ok(settled[2]!.y >= 2.4, `tower ${String(tower)} collapsed to y=${String(settled[2]!.y)}`)
				for(let level = 0; level < settled.length; level += 1) {
					const position = settled[level]!
					assert.ok(
						Math.hypot(position.x - center.x, position.z - center.z) <= 0.2,
						`tower ${String(tower)} slid apart: ${JSON.stringify(settled.map(point => point.asArray()))}`
					)
					if(level === 0) continue
					assert.ok(
						position.y - settled[level - 1]!.y >= 0.94,
						`tower ${String(tower)} interpenetrated vertically: ${JSON.stringify(settled.map(point => point.y))}`
					)
				}
			}
			for(let left = 0; left < dice.length; left += 1) {
				for(let right = left + 1; right < dice.length; right += 1) {
					assert.ok(
						Vector3.Distance(dice[left]!.mesh.position, dice[right]!.mesh.position) >= 0.94,
						`settled bodies ${String(left)}/${String(right)} remained overlapped`
					)
				}
			}
			for(const die of dice) {
				assert.ok((die.body.getLinearVelocity() ?? Vector3.Zero()).length() < 0.05)
				assert.ok((die.body.getAngularVelocity() ?? Vector3.Zero()).length() < 0.05)
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})
})
