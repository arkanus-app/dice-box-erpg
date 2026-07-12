import HavokPhysics from '@babylonjs/havok'
import '@babylonjs/core/Physics/physicsEngineComponent'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { PhysicsMotionType, type IPhysicsCollisionEvent } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeBox, PhysicsShapeConvexHull } from '@babylonjs/core/Physics/v2/physicsShape'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Observer } from '@babylonjs/core/Misc/observable'
import type { RendererContext } from '../types'
import { DisplayCancelledError } from '../errors'
import KinematicRenderer, { type VisualEntry } from './KinematicRenderer'

interface ActiveBody {
	readonly body: PhysicsBody
	readonly entry: VisualEntry
	readonly collisionObserver: Observer<IPhysicsCollisionEvent>
}

export class PhysicsRenderer extends KinematicRenderer {
	readonly mode = 'physics' as const
	readonly #bodies: ActiveBody[] = []
	#staticBodies: Array<{ body: PhysicsBody; mesh: AbstractMesh }> = []

	override async init(context: RendererContext): Promise<void> {
		await super.init(context)
		const wasmUrl = context.options.physicsWasmUrl
			|| `${context.options.origin}${context.options.assetPath}havok/HavokPhysics.wasm`
		const havok = await HavokPhysics({ locateFile: () => wasmUrl })
		const plugin = new HavokPlugin(true, havok)
		this.scene!.enablePhysics(new Vector3(0, -9.81 * context.options.gravity, 0), plugin)
		this.buildBounds()
	}

	protected override animate(entries: readonly VisualEntry[], signal: AbortSignal): Promise<void> {
		this.createBodies(entries)
		const engine = this.engine!
		const scene = this.scene!
		const duration = Math.max(1000, this.options!.settleTimeout)
		const startedAt = performance.now()
		return new Promise<void>((resolve, reject) => {
			let settled = false
			const finish = (error?: unknown): void => {
				if(settled) return
				settled = true
				engine.stopRenderLoop(render)
				signal.removeEventListener('abort', abort)
				if(error) reject(error)
				else resolve()
			}
			const abort = (): void => finish(new DisplayCancelledError())
			const render = (): void => {
				if(signal.aborted) return abort()
				const elapsed = performance.now() - startedAt
				const progress = Math.min(1, elapsed / duration)
				for(const { body, entry } of this.#bodies) {
					if(progress > 0.58 && progress < 0.9) {
						const current = entry.node.rotationQuaternion ?? Quaternion.Identity()
						entry.node.rotationQuaternion = Quaternion.Slerp(current, entry.target, 0.055)
						body.setAngularVelocity(body.getAngularVelocity()?.scale(0.92) ?? Vector3.Zero())
						body.setLinearDamping(0.68)
						body.setAngularDamping(0.72)
					}
					if(progress >= 0.9) {
						body.setLinearVelocity(Vector3.Zero())
						body.setAngularVelocity(Vector3.Zero())
						entry.node.position.copyFrom(entry.end)
						entry.node.rotationQuaternion = entry.target.clone()
						body.setMotionType(PhysicsMotionType.STATIC)
					}
				}
				scene.render()
				if(progress >= 1) finish()
			}
			signal.addEventListener('abort', abort, { once: true })
			engine.runRenderLoop(render)
		})
	}

	#createShape(entry: VisualEntry): PhysicsShapeConvexHull {
		const candidate = 'getVerticesData' in entry.node
			? entry.node as AbstractMesh
			: entry.node.getChildMeshes(false)[0]
		if(!candidate) throw new Error(`Unable to create physics shape for '${entry.node.name}'.`)
		candidate.computeWorldMatrix(true)
		return new PhysicsShapeConvexHull(candidate as Mesh, this.scene!)
	}

	createBodies(entries: readonly VisualEntry[]): void {
		this.disposeDynamicBodies()
		for(const entry of entries) {
			const body = new PhysicsBody(entry.node, PhysicsMotionType.DYNAMIC, false, this.scene!)
			const shape = this.#createShape(entry)
			shape.material = { friction: this.options!.friction, restitution: this.options!.restitution }
			body.shape = shape
			body.setMassProperties({ mass: this.options!.mass })
			body.setLinearDamping(this.options!.linearDamping)
			body.setAngularDamping(this.options!.angularDamping)
			body.setLinearVelocity(new Vector3(
				(entry.end.x - entry.start.x) * this.options!.throwForce * 0.28,
				2.5,
				(entry.end.z - entry.start.z) * this.options!.throwForce * 0.28
			))
			body.setAngularVelocity(new Vector3(entry.spinX * 0.08, entry.spinY * 0.08, entry.spinZ * 0.08))
			body.setCollisionCallbackEnabled(true)
			const collisionObserver = body.getCollisionObservable().add(event => {
				this.options!.onCollision({
					action: 'collision',
					body0Id: event.collider.transformNode.name,
					body1Id: event.collidedAgainst.transformNode.name,
					force: Math.abs(event.impulse)
				})
			})
			this.#bodies.push({ body, entry, collisionObserver })
		}
	}

	buildBounds(): void {
		const scene = this.scene!
		const make = (name: string, size: { width: number; height: number; depth: number }, position: Vector3): void => {
			const mesh = CreateBox(name, size, scene)
			mesh.position.copyFrom(position)
			mesh.isVisible = false
			const body = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene)
			const shape = new PhysicsShapeBox(Vector3.Zero(), Quaternion.Identity(), new Vector3(size.width / 2, size.height / 2, size.depth / 2), scene)
			shape.material = { friction: this.options!.friction, restitution: this.options!.restitution }
			body.shape = shape
			body.setMassProperties({ mass: 0 })
			this.#staticBodies.push({ body, mesh })
		}
		make('display-floor', { width: 24, height: 1, depth: 24 }, new Vector3(0, -0.5, 0))
		make('display-wall-north', { width: 24, height: 12, depth: 1 }, new Vector3(0, 5, -10))
		make('display-wall-south', { width: 24, height: 12, depth: 1 }, new Vector3(0, 5, 10))
		make('display-wall-east', { width: 1, height: 12, depth: 24 }, new Vector3(-10, 5, 0))
		make('display-wall-west', { width: 1, height: 12, depth: 24 }, new Vector3(10, 5, 0))
	}

	disposeDynamicBodies(): void {
		for(const { body, collisionObserver } of this.#bodies.splice(0)) {
			body.getCollisionObservable().remove(collisionObserver)
			body.setCollisionCallbackEnabled(false)
			try { body.shape?.dispose() } catch {}
			body.dispose()
		}
	}

	override clear(): void {
		this.disposeDynamicBodies()
		super.clear()
	}

	override dispose(): void {
		this.disposeDynamicBodies()
		for(const { body, mesh } of this.#staticBodies.splice(0)) {
			try { body.shape?.dispose() } catch {}
			body.dispose()
			mesh.dispose()
		}
		super.dispose()
	}
}

export default PhysicsRenderer
