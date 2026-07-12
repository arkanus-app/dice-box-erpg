import HavokPhysics from '@babylonjs/havok'
import '@babylonjs/core/Physics/physicsEngineComponent'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import {
	PhysicsActivationControl,
	PhysicsEventType,
	PhysicsMotionType,
	type IPhysicsCollisionEvent
} from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeConvexHull } from '@babylonjs/core/Physics/v2/physicsShape'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Observer } from '@babylonjs/core/Misc/observable'
import type { RendererContext, RequiredViewerOptions } from '../types'
import { DisplayCancelledError } from '../errors'
import {
	canStartFinalLock,
	chooseShortestQuaternion,
	createBiasedInitialQuaternion,
	getBiasedLaunchAngularVelocity,
	getGuidedAngularVelocity,
	getGuidedLinearVelocity,
	getPhysicsGuidanceProfile,
	getPhysicsMassMultiplier,
	shouldStartGuidance,
	smoothStep,
	type PhysicsGuidanceProfile,
	type PhysicsGuidanceState
} from '../physicsGuidance'
import {
	DICE_PHYSICS_SUB_TIME_STEP_MS,
	DICE_PHYSICS_TIME_STEP,
	shouldRecoverPhysicsBody
} from '../physicsSafety'
import KinematicRenderer, { type VisualEntry } from './KinematicRenderer'
import { createPhysicsBoundsLayout, createStaticPhysicsBox } from './physicsBounds'
import { DISPLAY_CAMERA_FOV, DISPLAY_CAMERA_HEIGHT } from './sceneEnvironment'
import {
	clampHorizontalPosition,
	computeDisplayViewportBounds,
	type DisplayViewportBounds
} from './viewportBounds'

interface ActiveBody {
	readonly body: PhysicsBody
	readonly entry: VisualEntry
	readonly profile: PhysicsGuidanceProfile
	collisionObserver: Observer<IPhysicsCollisionEvent> | undefined
	state: PhysicsGuidanceState
	locked: boolean
	elapsedMs: number
	guidanceElapsedMs: number
	lockElapsedMs: number
	lockSourceQuaternion: Quaternion | undefined
	groundImpactCount: number
	firstGroundImpactElapsedMs: number | undefined
	groundContactStartedElapsedMs: number | undefined
	lastGroundContactElapsedMs: number | undefined
	lastBodyContactElapsedMs: number | undefined
}

const CONTACT_GRACE_MS = DICE_PHYSICS_SUB_TIME_STEP_MS * 3.5

const currentQuaternion = (entry: VisualEntry): Quaternion =>
	(entry.node.rotationQuaternion ?? Quaternion.Identity()).clone().normalize()

const finiteHorizontalPosition = (position: Vector3): boolean =>
	Number.isFinite(position.x) && Number.isFinite(position.z)

export class PhysicsRenderer extends KinematicRenderer {
	readonly mode = 'physics' as const
	readonly #bodies: ActiveBody[] = []
	readonly #dynamicBodyNames = new Set<string>()
	#staticBodies: Array<{ body: PhysicsBody; mesh: AbstractMesh }> = []
	#physicsPlugin: HavokPlugin | undefined
	#bounds: DisplayViewportBounds | undefined
	#boundsSignature = ''
	#largestRadius = 0

	override async init(context: RendererContext): Promise<void> {
		await super.init(context)
		const wasmUrl = context.options.physicsWasmUrl
			|| `${context.options.origin}${context.options.assetPath}havok/HavokPhysics.wasm`
		const havok = await HavokPhysics({ locateFile: () => wasmUrl })
		const plugin = new HavokPlugin(true, havok)
		this.#physicsPlugin = plugin
		this.scene!.enablePhysics(new Vector3(0, -9.81 * context.options.gravity, 0), plugin)
		const physicsEngine = this.scene!.getPhysicsEngine()
		physicsEngine?.setTimeStep(DICE_PHYSICS_TIME_STEP)
		physicsEngine?.setSubTimeStep(DICE_PHYSICS_SUB_TIME_STEP_MS)
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
			const beforePhysicsObserver = scene.onBeforePhysicsObservable.add(() => {
				for(const activeBody of this.#bodies) {
					this.#updateGuidance(activeBody, DICE_PHYSICS_SUB_TIME_STEP_MS, duration)
				}
			})
			const afterPhysicsObserver = scene.onAfterPhysicsObservable.add(() => {
				for(const activeBody of this.#bodies) {
					if(activeBody.state === 'commit') this.#completeExactCommit(activeBody)
				}
			})
			const finish = (error?: unknown): void => {
				if(settled) return
				settled = true
				engine.stopRenderLoop(render)
				scene.onBeforePhysicsObservable.remove(beforePhysicsObserver)
				scene.onAfterPhysicsObservable.remove(afterPhysicsObserver)
				signal.removeEventListener('abort', abort)
				if(error) reject(error)
				else resolve()
			}
			const abort = (): void => finish(new DisplayCancelledError())
			const render = (): void => {
				if(signal.aborted) return abort()
				const timedOut = performance.now() - startedAt >= duration
				for(const activeBody of this.#bodies) {
					if(activeBody.locked || activeBody.state === 'commit') continue
					if(shouldRecoverPhysicsBody(activeBody.entry.node.position)) {
						this.#beginExactCommit(activeBody, false)
					} else if(timedOut) {
						this.#beginExactCommit(activeBody, true)
					}
				}
				scene.render()
				if(this.#bodies.every(activeBody => activeBody.locked)) finish()
			}
			signal.addEventListener('abort', abort, { once: true })
			engine.runRenderLoop(render)
		})
	}

	#updateGuidance(activeBody: ActiveBody, deltaMs: number, timeoutMs: number): void {
		if(activeBody.locked || activeBody.state === 'commit' || activeBody.state === 'complete') return
		const { body, entry, profile } = activeBody
		activeBody.elapsedMs += deltaMs
		const timeoutRemainingMs = Math.max(0, timeoutMs - activeBody.elapsedMs)
		const hasGroundContact = activeBody.lastGroundContactElapsedMs !== undefined
			&& activeBody.elapsedMs - activeBody.lastGroundContactElapsedMs <= CONTACT_GRACE_MS
		if(!hasGroundContact) activeBody.groundContactStartedElapsedMs = undefined

		if(activeBody.state === 'freeFall') {
			if(!shouldStartGuidance({
				elapsedMs: activeBody.elapsedMs,
				...(activeBody.firstGroundImpactElapsedMs === undefined
					? {}
					: { firstGroundImpactElapsedMs: activeBody.firstGroundImpactElapsedMs }),
				groundImpactCount: activeBody.groundImpactCount,
				positionY: entry.node.position.y,
				timeoutRemainingMs
			}, profile)) return
			activeBody.state = 'guidedSettle'
			activeBody.guidanceElapsedMs = 0
		}

		if(activeBody.state === 'guidedSettle') {
			activeBody.guidanceElapsedMs += deltaMs
			const progress = Math.min(1, activeBody.guidanceElapsedMs / profile.durationMs)
			const orientation = currentQuaternion(entry)
			const guidedAngular = getGuidedAngularVelocity(
				body.getAngularVelocity() ?? Vector3.Zero(),
				orientation,
				entry.target,
				profile,
				progress,
				deltaMs
			)
			body.setAngularVelocity(guidedAngular.velocity)
			if(hasGroundContact || activeBody.groundImpactCount > 0 || entry.node.position.y <= profile.maxGuideStartHeight) {
				body.setLinearVelocity(getGuidedLinearVelocity(
					body.getLinearVelocity() ?? Vector3.Zero(),
					profile,
					progress,
					deltaMs
				))
			}
			const groundContactElapsedMs = hasGroundContact && activeBody.groundContactStartedElapsedMs !== undefined
				? activeBody.elapsedMs - activeBody.groundContactStartedElapsedMs
				: 0
			if(canStartFinalLock({
				angle: guidedAngular.angle,
				elapsedMs: activeBody.elapsedMs,
				groundContactElapsedMs,
				hasGroundContact,
				...(activeBody.lastBodyContactElapsedMs === undefined
					? {}
					: { lastBodyContactElapsedMs: activeBody.lastBodyContactElapsedMs }),
				positionY: entry.node.position.y,
				timeoutRemainingMs
			}, profile)) this.#startFinalLock(activeBody)
			return
		}

		if(activeBody.state === 'finalLock') {
			activeBody.lockElapsedMs += deltaMs
			const progress = smoothStep(activeBody.lockElapsedMs / profile.finalLockDurationMs)
			const source = activeBody.lockSourceQuaternion ?? currentQuaternion(entry)
			const target = chooseShortestQuaternion(source, entry.target)
			const rotation = Quaternion.Slerp(source, target, progress).normalize()
			body.setLinearVelocity(Vector3.Zero())
			body.setAngularVelocity(Vector3.Zero())
			body.setTargetTransform(entry.node.position, rotation)
			if(progress >= 1) this.#beginExactCommit(activeBody, true)
		}
	}

	#startFinalLock(activeBody: ActiveBody): void {
		if(activeBody.state !== 'guidedSettle') return
		const orientation = currentQuaternion(activeBody.entry)
		activeBody.state = 'finalLock'
		activeBody.lockElapsedMs = 0
		activeBody.lockSourceQuaternion = orientation
		activeBody.body.setLinearVelocity(Vector3.Zero())
		activeBody.body.setAngularVelocity(Vector3.Zero())
		activeBody.body.setMotionType(PhysicsMotionType.ANIMATED)
		activeBody.body.setTargetTransform(activeBody.entry.node.position, orientation)
	}

	#beginExactCommit(activeBody: ActiveBody, preserveHorizontalPosition: boolean): void {
		if(activeBody.locked || activeBody.state === 'commit' || activeBody.state === 'complete') return
		const { body, entry } = activeBody
		const targetPosition = preserveHorizontalPosition && finiteHorizontalPosition(entry.node.position)
			? new Vector3(entry.node.position.x, entry.supportHeight, entry.node.position.z)
			: entry.end.clone()
		if(this.#bounds) clampHorizontalPosition(targetPosition, this.#bounds, entry.horizontalRadius)
		body.setMotionType(PhysicsMotionType.ANIMATED)
		body.setLinearVelocity(Vector3.Zero())
		body.setAngularVelocity(Vector3.Zero())
		entry.node.position.copyFrom(targetPosition)
		entry.node.rotationQuaternion = entry.target.clone()
		entry.node.computeWorldMatrix(true)
		// TELEPORT the exact resolved face into Havok. The commit is only
		// considered complete after a real physics substep confirms the sync.
		body.disablePreStep = false
		activeBody.state = 'commit'
	}

	#completeExactCommit(activeBody: ActiveBody): void {
		if(activeBody.state !== 'commit') return
		const { body, entry } = activeBody
		body.disablePreStep = true
		body.setLinearVelocity(Vector3.Zero())
		body.setAngularVelocity(Vector3.Zero())
		body.setMotionType(PhysicsMotionType.STATIC)
		entry.node.position.y = entry.supportHeight
		entry.node.rotationQuaternion = entry.target.clone()
		entry.node.computeWorldMatrix(true)
		try {
			this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_INACTIVE)
		} catch {}
		activeBody.state = 'complete'
		activeBody.locked = true
	}

	#createShape(entry: VisualEntry): PhysicsShapeConvexHull {
		if(entry.physicsCollider) {
			const collider = entry.physicsCollider.clone(`${entry.node.name}-physics-collider`, null, false)
			if(!collider) throw new Error(`Unable to clone physics collider for '${entry.node.name}'.`)
			collider.setEnabled(true)
			collider.isVisible = false
			collider.position.setAll(0)
			collider.rotationQuaternion = Quaternion.Identity()
			collider.scaling.set(
				entry.node.scaling.x * this.options!.colliderScale,
				entry.node.scaling.y * this.options!.colliderScale,
				entry.node.scaling.z * this.options!.colliderScale
			)
			collider.computeWorldMatrix(true)
			try {
				return new PhysicsShapeConvexHull(collider, this.scene!)
			} finally {
				collider.dispose(false, false)
			}
		}
		const candidate = 'getVerticesData' in entry.node
			? entry.node as AbstractMesh
			: entry.node.getChildMeshes(false)[0]
		if(!candidate) throw new Error(`Unable to create physics shape for '${entry.node.name}'.`)
		candidate.computeWorldMatrix(true)
		return new PhysicsShapeConvexHull(candidate as Mesh, this.scene!)
	}

	createBodies(entries: readonly VisualEntry[]): void {
		this.disposeDynamicBodies()
		this.#largestRadius = entries.reduce(
			(radius, entry) => Math.max(radius, entry.horizontalRadius),
			0
		)
		this.buildBounds(undefined, undefined, this.#largestRadius)
		for(const entry of entries) this.#dynamicBodyNames.add(entry.node.name)
		for(const entry of entries) {
			if(this.#bounds) {
				clampHorizontalPosition(entry.start, this.#bounds, entry.horizontalRadius)
				clampHorizontalPosition(entry.end, this.#bounds, entry.horizontalRadius)
				entry.node.position.copyFrom(entry.start)
			}
			const profile = getPhysicsGuidanceProfile(entry.sides)
			entry.node.rotationQuaternion = createBiasedInitialQuaternion(
				entry.target,
				entry.spinX,
				entry.spinY,
				entry.spinZ,
				profile
			)
			entry.node.computeWorldMatrix(true)
			const body = new PhysicsBody(entry.node, PhysicsMotionType.DYNAMIC, false, this.scene!)
			const shape = this.#createShape(entry)
			shape.material = { friction: this.options!.friction, restitution: this.options!.restitution }
			body.shape = shape
			body.setMassProperties({ mass: this.options!.mass * getPhysicsMassMultiplier(entry.sides) })
			body.setLinearDamping(this.options!.linearDamping)
			body.setAngularDamping(this.options!.angularDamping)
			body.setLinearVelocity(new Vector3(
				(entry.end.x - entry.node.position.x) * this.options!.throwForce * 0.32,
				2.2 + this.options!.throwForce * 0.22,
				(entry.end.z - entry.node.position.z) * this.options!.throwForce * 0.32
			))
			const spinScale = Math.max(0.07, this.options!.spinForce * 0.018)
			const launchSpin = new Vector3(
				entry.spinX * spinScale,
				entry.spinY * spinScale,
				entry.spinZ * spinScale
			)
			body.setAngularVelocity(getBiasedLaunchAngularVelocity(
				launchSpin,
				currentQuaternion(entry),
				entry.target,
				profile
			))
			try {
				this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_ACTIVE)
			} catch {}
			const activeBody: ActiveBody = {
				body,
				entry,
				profile,
				collisionObserver: undefined,
				state: 'freeFall',
				locked: false,
				elapsedMs: 0,
				guidanceElapsedMs: 0,
				lockElapsedMs: 0,
				lockSourceQuaternion: undefined,
				groundImpactCount: 0,
				firstGroundImpactElapsedMs: undefined,
				groundContactStartedElapsedMs: undefined,
				lastGroundContactElapsedMs: undefined,
				lastBodyContactElapsedMs: undefined
			}
			body.setCollisionCallbackEnabled(true)
			activeBody.collisionObserver = body.getCollisionObservable().add(event => {
				this.#recordCollision(activeBody, event)
				if(event.type === PhysicsEventType.COLLISION_FINISHED) return
				this.options!.onCollision({
					action: 'collision',
					body0Id: event.collider.transformNode.name,
					body1Id: event.collidedAgainst.transformNode.name,
					force: Math.abs(event.impulse)
				})
			})
			this.#bodies.push(activeBody)
		}
	}

	#recordCollision(activeBody: ActiveBody, event: IPhysicsCollisionEvent): void {
		if(event.type === PhysicsEventType.COLLISION_FINISHED) return
		const ownName = activeBody.entry.node.name
		const colliderName = event.collider.transformNode.name
		const collidedName = event.collidedAgainst.transformNode.name
		const otherName = colliderName === ownName ? collidedName : colliderName
		if(otherName === 'display-floor') {
			const contactWasInterrupted = activeBody.lastGroundContactElapsedMs === undefined
				|| activeBody.elapsedMs - activeBody.lastGroundContactElapsedMs > CONTACT_GRACE_MS
			if(contactWasInterrupted) {
				activeBody.groundImpactCount++
				activeBody.firstGroundImpactElapsedMs ??= activeBody.elapsedMs
				activeBody.groundContactStartedElapsedMs = activeBody.elapsedMs
			}
			activeBody.lastGroundContactElapsedMs = activeBody.elapsedMs
			return
		}
		if(otherName !== ownName && this.#dynamicBodyNames.has(otherName)) {
			activeBody.lastBodyContactElapsedMs = activeBody.elapsedMs
		}
	}

	buildBounds(width?: number, height?: number, largestRadius = this.#largestRadius): void {
		if(!this.context || !this.scene || !this.options || !this.#physicsPlugin || !this.scene.getPhysicsEngine()) return
		const canvas = this.context.canvas
		const viewportWidth = Math.max(1, (width ?? canvas.clientWidth) || canvas.width || 300)
		const viewportHeight = Math.max(1, (height ?? canvas.clientHeight) || canvas.height || 150)
		const bounds = computeDisplayViewportBounds({
			width: viewportWidth,
			height: viewportHeight,
			cameraHeight: DISPLAY_CAMERA_HEIGHT,
			cameraFov: DISPLAY_CAMERA_FOV,
			wallPadding: this.options.wallPadding,
			minimumRadius: largestRadius
		})
		const signature = [
			viewportWidth,
			viewportHeight,
			this.options.wallPadding,
			this.options.startingHeight,
			this.options.friction,
			this.options.restitution,
			largestRadius
		].join('|')
		if(signature === this.#boundsSignature) return
		this.#disposeStaticBounds()
		const scene = this.scene!
		const make = (name: string, size: { width: number; height: number; depth: number }, position: Vector3): void => {
			this.#staticBodies.push(createStaticPhysicsBox(
				scene,
				name,
				size,
				position,
				{ friction: this.options!.friction, restitution: this.options!.restitution }
			))
		}
		const layout = createPhysicsBoundsLayout({
			bounds,
			startingHeight: this.options.startingHeight,
			largestRadius
		})
		try {
			make(layout.floor.name, layout.floor.size, layout.floor.position)
			for(const wall of layout.walls) make(wall.name, wall.size, wall.position)
		} catch(error) {
			this.#disposeStaticBounds()
			this.#bounds = undefined
			this.#boundsSignature = ''
			throw error
		}
		this.environment?.ensureGroundCoverage(layout.floor.size.width, layout.floor.size.depth)
		this.#bounds = bounds
		this.#boundsSignature = signature
	}

	#disposeStaticBounds(): void {
		for(const { body, mesh } of this.#staticBodies.splice(0)) {
			try { body.shape?.dispose() } catch {}
			body.dispose()
			mesh.dispose()
		}
	}

	#constrainActiveBodies(): void {
		if(!this.#bounds) return
		for(const activeBody of this.#bodies) {
			const { body, entry } = activeBody
			clampHorizontalPosition(entry.start, this.#bounds, entry.horizontalRadius)
			clampHorizontalPosition(entry.end, this.#bounds, entry.horizontalRadius)
			if(!clampHorizontalPosition(entry.node.position, this.#bounds, entry.horizontalRadius)) continue
			entry.node.computeWorldMatrix(true)
			const prestepType = body.getPrestepType()
			try {
				body.disablePreStep = false
				this.#physicsPlugin?.setPhysicsBodyTransformation(body, entry.node)
			} catch {} finally {
				body.setPrestepType(prestepType)
			}
		}
	}

	override resize(width: number, height: number): void {
		super.resize(width, height)
		this.buildBounds(width, height, this.#largestRadius)
		this.#constrainActiveBodies()
	}

	override async updateOptions(options: Readonly<RequiredViewerOptions>): Promise<void> {
		await super.updateOptions(options)
		this.scene?.getPhysicsEngine()?.setGravity(new Vector3(0, -9.81 * options.gravity, 0))
		this.#boundsSignature = ''
		this.buildBounds(undefined, undefined, this.#largestRadius)
		this.#constrainActiveBodies()
	}

	disposeDynamicBodies(): void {
		for(const { body, collisionObserver } of this.#bodies.splice(0)) {
			if(collisionObserver) body.getCollisionObservable().remove(collisionObserver)
			body.setCollisionCallbackEnabled(false)
			try { body.shape?.dispose() } catch {}
			body.dispose()
		}
		this.#dynamicBodyNames.clear()
	}

	override clear(): void {
		this.disposeDynamicBodies()
		this.#largestRadius = 0
		super.clear()
	}

	override dispose(): void {
		this.disposeDynamicBodies()
		this.#disposeStaticBounds()
		this.#bounds = undefined
		this.#boundsSignature = ''
		this.#largestRadius = 0
		this.#physicsPlugin = undefined
		super.dispose()
	}
}

export default PhysicsRenderer
