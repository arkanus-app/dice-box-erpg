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
import type {
	NormalizedResolvedDie,
	RendererContext,
	RequiredViewerOptions,
	ResolvedThemeConfig
} from '../types'
import {
	dispatchTimelineProgress,
	type TimelineEffectName,
	type TimelineSpawnAction
} from '../timeline'
import { DisplayCancelledError } from '../errors'
import { createSeededRandom } from '../random'
import { createPhysicsExplosionScheduler } from '../physicsTimelineScheduler'
import type { PhysicsPerformanceRecorder } from '../physicsPerformance'
import {
	canStartFinalLock,
	canBodyContactActAsSupport,
	chooseShortestQuaternion,
	createLandingApproachQuaternion,
	createPrecomputedFlightQuaternion,
	estimateBallisticFlightSeconds,
	getFaceAlignment,
	getFaceGuidedAngularVelocity,
	getFinalLockDurationMs,
	getGuidedLinearVelocity,
	getLandingRollAxis,
	getPlannedFlightAngularVelocity,
	getPlannedFlightQuaternion,
	getPlannedFlightSpin,
	getPhysicsGuidanceProfile,
	getPhysicsMassMultiplier,
	getResultFaceFrame,
	getSoftLandingLinearVelocity,
	getSustainedRollAngularVelocity,
	getTolerantFaceAlignment,
	getThrownAngularVelocity,
	getVisibleFlightAngularVelocity,
	shouldStartGuidance,
	smoothStep,
	type PhysicsGuidanceProfile,
	type PhysicsGuidanceState
} from '../physicsGuidance'
import {
	DICE_PHYSICS_SUB_TIME_STEP_MS,
	DICE_PHYSICS_TIME_STEP,
	getAdaptiveDicePhysicsStep,
	getDicePhysicsStep,
	hasPhysicsLaunchPairClearance,
	planPhysicsAppendLanding,
	planPhysicsAppendLaunch,
	shouldRecoverPhysicsBody
} from '../physicsSafety'
import KinematicRenderer, {
	hasEnteredLaunchPortal,
	type TimelineVisualHandle,
	type TimelinePlaybackContext,
	type VisualEntry
} from './KinematicRenderer'
import {
	createPhysicsBoundsLayout,
	createStaticPhysicsBox,
	getLaunchCollisionMask,
	PHYSICS_ACTIVE_COLLISION_MASK,
	PHYSICS_DICE_LAYER,
	PHYSICS_FLOOR_LAYER,
	PHYSICS_WALL_FRICTION,
	PHYSICS_WALL_LAYERS,
	PHYSICS_WALL_RESTITUTION
} from './physicsBounds'
import { DISPLAY_CAMERA_FOV, DISPLAY_CAMERA_HEIGHT } from './sceneEnvironment'
import {
	clampHorizontalPosition,
	computeDisplayViewportBounds,
	getHorizontalCenterBounds,
	type DisplayViewportBounds
} from './viewportBounds'

interface ActiveBody {
	readonly body: PhysicsBody
	readonly shape: PhysicsShapeConvexHull
	readonly entry: VisualEntry
	readonly profile: PhysicsGuidanceProfile
	readonly localFaceNormal: Vector3
	readonly restDirection: Vector3
	readonly flightStartQuaternion: Quaternion
	readonly launchAngularVelocity: Vector3
	readonly launchLinearVelocity: Vector3
	readonly launchDelayMs: number
	readonly settleRollAxis: Vector3
	readonly flightDurationMs: number
	readonly currentQuaternionScratch: Quaternion
	readonly lockRotationScratch: Quaternion
	readonly lockPositionScratch: Vector3
	readonly guidanceStartInput: MutableGuidanceStartInput
	readonly finalLockInput: MutableFinalLockInput
	flightCorrectionVelocity: Vector3
	launchDelayElapsedMs: number
	launched: boolean
	collisionsArmed: boolean
	collisionObserver: Observer<IPhysicsCollisionEvent> | undefined
	state: PhysicsGuidanceState
	locked: boolean
	elapsedMs: number
	guidanceElapsedMs: number
	stableElapsedMs: number
	lockElapsedMs: number
	lockDurationMs: number
	lockSourcePosition: Vector3 | undefined
	lockTargetPosition: Vector3 | undefined
	lockSourceQuaternion: Quaternion | undefined
	lockTargetQuaternion: Quaternion | undefined
	groundImpactCount: number
	firstGroundImpactElapsedMs: number | undefined
	groundContactStartedElapsedMs: number | undefined
	lastGroundContactElapsedMs: number | undefined
	bodySupportImpactCount: number
	firstBodySupportImpactElapsedMs: number | undefined
	bodyContactStartedElapsedMs: number | undefined
	lastBodyContactElapsedMs: number | undefined
	lastBodyCollisionElapsedMs: number | undefined
	bodyCollisionStartedElapsedMs: number | undefined
	bodySupport: ActiveBody | undefined
	wallImpactCount: number
	lastWallImpactElapsedMs: number | undefined
	forcedLock: boolean
	forcedLockBodyCollision: boolean
	settledReported: boolean
}

const CONTACT_GRACE_MS = DICE_PHYSICS_SUB_TIME_STEP_MS * 3.5
const ZERO_VECTOR = Vector3.Zero()
const IDENTITY_QUATERNION = Quaternion.Identity()

export interface PhysicsBodyBuildPlan {
	readonly disposeExisting: boolean
	readonly totalBodyCount: number
}

interface ScheduledPhysicsExplosion {
	readonly phaseIndex: number
	readonly actionIndex: number
	readonly action: TimelineSpawnAction
	readonly handle: TimelineVisualHandle
}

export const planPhysicsBodyBuild = (
	existingBodyCount: number,
	incomingBodyCount: number,
	append: boolean
): PhysicsBodyBuildPlan => ({
	disposeExisting: !append,
	totalBodyCount: (append ? Math.max(0, existingBodyCount) : 0) + Math.max(0, incomingBodyCount)
})

const currentQuaternionToRef = (entry: VisualEntry, result: Quaternion): Quaternion => {
	result.copyFrom(entry.node.rotationQuaternion ?? IDENTITY_QUATERNION)
	return result.normalize()
}

interface PhysicsPerformanceSession {
	readonly recorder: PhysicsPerformanceRecorder
	readonly publish: () => void
}

interface MutableGuidanceStartInput {
	elapsedMs: number
	firstGroundImpactElapsedMs: number | undefined
	groundImpactCount: number
	positionY: number
	timeoutRemainingMs: number
}

interface MutableFinalLockInput {
	angle: number
	angularSpeed: number
	elapsedMs: number
	groundContactElapsedMs: number
	hasGroundContact: boolean
	bodyContactElapsedMs: number
	lastBodyContactElapsedMs: number | undefined
	linearSpeed: number
	positionY: number
	stableElapsedMs: number
}

const hasFiniteQuaternion = (entry: VisualEntry): boolean => {
	const rotation = entry.node.rotationQuaternion
	return rotation !== null
		&& rotation !== undefined
		&& Number.isFinite(rotation.x)
		&& Number.isFinite(rotation.y)
		&& Number.isFinite(rotation.z)
		&& Number.isFinite(rotation.w)
		&& rotation.lengthSquared() > 1e-12
}

export class PhysicsRenderer extends KinematicRenderer {
	readonly mode = 'physics' as const
	readonly #bodies: ActiveBody[] = []
	readonly #bodyByEntry = new Map<VisualEntry, ActiveBody>()
	readonly #bodyByNodeName = new Map<string, ActiveBody>()
	#staticBodies: Array<{ body: PhysicsBody; mesh: AbstractMesh }> = []
	#physicsPlugin: HavokPlugin | undefined
	#bounds: DisplayViewportBounds | undefined
	#boundsSignature = ''
	#largestRadius = 0
	#physicsStepMs = DICE_PHYSICS_SUB_TIME_STEP_MS
	#remainingBodyCount = 0
	#performanceRecorder: PhysicsPerformanceRecorder | undefined
	readonly #timelineEdgeLaunch = new WeakMap<VisualEntry, {
		readonly position: Vector3
		readonly velocity: Vector3
	}>()

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

	protected override async createTimelineEntries(
		die: NormalizedResolvedDie,
		theme: ResolvedThemeConfig,
		startIndex: number,
		bodyCount: number,
		seed: string
	): Promise<TimelineVisualHandle> {
		const handle = await super.createTimelineEntries(die, theme, startIndex, bodyCount, seed)
		for(const entry of handle.entries) this.#timelineEdgeLaunch.set(entry, {
			position: entry.start.clone(),
			velocity: entry.launchVelocity.clone()
		})
		return handle
	}

	protected override animate(
		entries: readonly VisualEntry[],
		signal: AbortSignal,
		durationMs = this.options!.settleTimeout,
		_minimumDurationMs = 1000
	): Promise<void> {
		this.createBodies(entries)
		return this.#runPhysicsAnimation(signal, durationMs)
	}

	protected override animateAdditional(
		entries: readonly VisualEntry[],
		signal: AbortSignal,
		durationMs: number
	): Promise<void> {
		this.createBodies(entries, true)
		if(durationMs <= 0) {
			if(signal.aborted) return Promise.reject(new DisplayCancelledError())
			for(const entryToComplete of entries) {
				const activeBody = this.#bodyByEntry.get(entryToComplete)
				if(!activeBody) continue
				const { body, entry, shape } = activeBody
				entry.node.setEnabled(true)
				entry.node.position.copyFrom(entry.end)
				entry.node.rotationQuaternion = entry.target.clone()
				entry.node.computeWorldMatrix(true)
				shape.filterMembershipMask = PHYSICS_DICE_LAYER
				shape.filterCollideMask = PHYSICS_ACTIVE_COLLISION_MASK
				body.setMotionType(PhysicsMotionType.ANIMATED)
				body.disablePreStep = false
				body.setTargetTransform(entry.end, entry.target)
				body.setMotionType(PhysicsMotionType.STATIC)
				body.disablePreStep = true
				activeBody.launched = true
				activeBody.collisionsArmed = true
				activeBody.state = 'complete'
				activeBody.locked = true
				this.#remainingBodyCount = Math.max(0, this.#remainingBodyCount - 1)
				try {
					this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_INACTIVE)
				} catch {}
			}
			this.scene?.render()
			return Promise.resolve()
		}
		return this.#runPhysicsAnimation(signal, durationMs)
	}

	protected override async displayInitialAndExplosionTimeline(
		playback: TimelinePlaybackContext
	): Promise<number> {
		let explosionPhaseCount = 0
		while(playback.plan.phases[explosionPhaseCount]?.actions[0]?.kind === 'explode') {
			explosionPhaseCount++
		}
		if(explosionPhaseCount === 0) {
			return super.displayInitialAndExplosionTimeline(playback)
		}

		const scheduledByChild = new Map<string, ScheduledPhysicsExplosion>()
		const scheduledItems: ScheduledPhysicsExplosion[] = []
		const entriesByDieId = new Map<string, readonly VisualEntry[]>()
		const dieIdByEntry = new Map<VisualEntry, string>()
		for(const [dieId, handle] of playback.handles) {
			entriesByDieId.set(dieId, handle.entries)
			for(const entry of handle.entries) dieIdByEntry.set(entry, dieId)
		}

		for(let phaseIndex = 0; phaseIndex < explosionPhaseCount; phaseIndex++) {
			const phase = playback.plan.phases[phaseIndex]!
			const spawnBodyCount = phase.actions.reduce((count, action) => {
				if(action.kind !== 'explode') return count
				return count + (playback.plan.definitions.get(action.dieId)?.sides === 100 ? 2 : 1)
			}, 0)
			let spawnIndex = 0
			for(let actionIndex = 0; actionIndex < phase.actions.length; actionIndex++) {
				const action = phase.actions[actionIndex]!
				if(action.kind !== 'explode') continue
				const definition = playback.plan.definitions.get(action.dieId)!
				const die = {
					...definition,
					value: action.value,
					discarded: action.discarded
				} as NormalizedResolvedDie
				const handle = await this.createTimelineEntries(
					die,
					playback.configs.get(definition.theme)!,
					spawnIndex,
					spawnBodyCount,
					`${playback.plan.seed}:${phase.id}:${action.dieId}`
				)
				spawnIndex += handle.entries.length
				for(const entry of handle.entries) {
					entry.launchDelayMs = 0
					entry.node.setEnabled(false)
				}
				playback.handles.set(action.dieId, handle)
				entriesByDieId.set(action.dieId, handle.entries)
				for(const entry of handle.entries) dieIdByEntry.set(entry, action.dieId)
				const scheduled = { phaseIndex, actionIndex, action, handle }
				scheduledByChild.set(action.dieId, scheduled)
				scheduledItems.push(scheduled)
			}
		}

		const settledEntries = new Set<VisualEntry>()
		const settledDice = new Set<string>()
		const scheduler = createPhysicsExplosionScheduler(scheduledItems.map(scheduled => ({
			phaseIndex: scheduled.phaseIndex,
			actionIndex: scheduled.actionIndex,
			parentDieId: scheduled.action.parentDieId,
			dieId: scheduled.action.dieId
		})))
		const configureSourceLaunch = (scheduled: ScheduledPhysicsExplosion): void => {
			const parent = playback.handles.get(scheduled.action.parentDieId)
			if(this.options!.timeline.effects.explode.origin !== 'source' || !parent?.entries[0]) return
			const phase = playback.plan.phases[scheduled.phaseIndex]!
			const random = createSeededRandom(
				`${playback.plan.seed}:${phase.id}:${scheduled.action.dieId}:source`
			)
			for(let index = 0; index < scheduled.handle.entries.length; index++) {
				const entry = scheduled.handle.entries[index]!
				const parentEntry = parent.entries[index % parent.entries.length]!
				entry.start.set(
					parentEntry.node.position.x
						+ random.range(-1, 1) * this.options!.timeline.effects.explode.spread,
					parentEntry.node.position.y + parentEntry.supportHeight + entry.supportHeight
						+ this.options!.timeline.effects.explode.burstHeight,
					parentEntry.node.position.z
						+ random.range(-1, 1) * this.options!.timeline.effects.explode.spread
				)
				entry.node.position.copyFrom(entry.start)
				const direction = entry.end.subtract(entry.start).normalize()
				entry.launchVelocity.copyFrom(
					direction.scale(Math.max(2.4, this.options!.throwForce * 0.55))
				)
				entry.launchVelocity.y = Math.max(
					2.8,
					this.options!.timeline.effects.explode.burstHeight * 2
				)
			}
		}
		const spawnChildren = (items: readonly { readonly dieId: string }[]): void => {
			for(const item of items) {
				const scheduled = scheduledByChild.get(item.dieId)
				if(!scheduled) continue
				configureSourceLaunch(scheduled)
				this.createBodies(scheduled.handle.entries, true)
			}
		}
		const reportSettledEntry = (entry: VisualEntry): void => {
			settledEntries.add(entry)
			const dieId = dieIdByEntry.get(entry)
			if(!dieId || settledDice.has(dieId)) return
			const entries = entriesByDieId.get(dieId) ?? []
			if(entries.some(candidate => !settledEntries.has(candidate))) return
			settledDice.add(dieId)
			const transition = scheduler.settle(dieId)
			if(transition.completed) {
				dispatchTimelineProgress(
					this.options!.onTimelineProgress,
					playback.progress.completePhaseAction(
						transition.completed.phaseIndex,
						transition.completed.actionIndex
					)
				)
			}
			spawnChildren(transition.spawned)
		}

		dispatchTimelineProgress(this.options!.onTimelineProgress, playback.progress.initial())
		this.createBodies(playback.initialEntries)
		await this.#runPhysicsAnimation(
			playback.signal,
			this.options!.settleTimeout,
			reportSettledEntry
		)
		return explosionPhaseCount
	}

	#runPhysicsAnimation(
		signal: AbortSignal,
		requestedDurationMs: number,
		onEntrySettled?: (entry: VisualEntry) => void
	): Promise<void> {
		const profilingEnabled = (
			globalThis as typeof globalThis & { __DICE3DVIEW_PHYSICS_PROFILE__?: boolean }
		).__DICE3DVIEW_PHYSICS_PROFILE__ === true
		if(profilingEnabled) return import('../physicsPerformance').then(module => {
			const recorder = new module.PhysicsPerformanceRecorder()
			return this.#executePhysicsAnimation(signal, requestedDurationMs, onEntrySettled, {
				recorder,
				publish: () => module.publishPhysicsPerformanceSnapshot(recorder.complete())
			})
		})
		return this.#executePhysicsAnimation(signal, requestedDurationMs, onEntrySettled)
	}

	#executePhysicsAnimation(
		signal: AbortSignal,
		requestedDurationMs: number,
		onEntrySettled?: (entry: VisualEntry) => void,
		performanceSession?: PhysicsPerformanceSession
	): Promise<void> {
		const engine = this.engine!
		const scene = this.scene!
		const duration = Math.max(250, requestedDurationMs)
		const performanceRecorder = performanceSession?.recorder
		this.#performanceRecorder = performanceRecorder
		performanceRecorder?.recordBodies(this.#bodies.length)
		return new Promise<void>((resolve, reject) => {
			let settled = false
			const beforePhysicsObserver = scene.onBeforePhysicsObservable.add(() => {
				const startedAt = performanceRecorder?.now() ?? 0
				for(const activeBody of this.#bodies) {
					this.#updateGuidance(activeBody, this.#physicsStepMs, duration)
				}
				if(performanceRecorder) performanceRecorder.recordPhysicsStep(
					performanceRecorder.now() - startedAt,
					this.#bodies.length,
					this.#physicsStepMs
				)
			})
			const afterPhysicsObserver = scene.onAfterPhysicsObservable.add(() => {
				for(const activeBody of this.#bodies) {
					if(activeBody.state === 'commit') this.#completeSmoothCommit(activeBody)
				}
			})
			const finish = (error?: unknown): void => {
				if(settled) return
				settled = true
				engine.stopRenderLoop(render)
				scene.onBeforePhysicsObservable.remove(beforePhysicsObserver)
				scene.onAfterPhysicsObservable.remove(afterPhysicsObserver)
				signal.removeEventListener('abort', abort)
				if(performanceRecorder) {
					performanceSession?.publish()
					if(this.#performanceRecorder === performanceRecorder) this.#performanceRecorder = undefined
				}
				if(error) reject(error)
				else resolve()
			}
			const abort = (): void => finish(new DisplayCancelledError())
			const render = (): void => {
				const frameStartedAt = performanceRecorder?.now() ?? 0
				if(signal.aborted) return abort()
				this.#updatePhysicsResolution()
				let forcedLockActive = false
				let overdueCandidate: ActiveBody | undefined
				for(const activeBody of this.#bodies) {
					if(activeBody.state === 'finalLock' && activeBody.forcedLock) forcedLockActive = true
					if(activeBody.locked || activeBody.state === 'commit') continue
					if(!activeBody.launched) continue
					if(
						this.#shouldRecover(activeBody)
						|| !hasFiniteQuaternion(activeBody.entry)
					) {
						this.#beginEmergencyRecovery(activeBody)
					} else if(
						activeBody.elapsedMs >= duration + activeBody.profile.timeoutExtensionMs
						&& !this.#hasRecentBodyCollision(activeBody)
						&& (
							overdueCandidate === undefined
							|| activeBody.entry.node.position.y < overdueCandidate.entry.node.position.y
						)
					) {
						overdueCandidate = activeBody
					}
				}
				if(!forcedLockActive && overdueCandidate) this.#startFinalLock(overdueCandidate, true)
				scene.render()
				performanceRecorder?.recordFrame(performanceRecorder.now() - frameStartedAt)
				if(onEntrySettled) {
					try {
						for(const activeBody of this.#bodies) {
							if(!activeBody.locked || activeBody.settledReported) continue
							activeBody.settledReported = true
							onEntrySettled(activeBody.entry)
						}
					} catch(error) {
						finish(error)
						return
					}
				}
				if(this.#remainingBodyCount === 0) finish()
			}
			signal.addEventListener('abort', abort, { once: true })
			engine.runRenderLoop(render)
		})
	}

	#updatePhysicsResolution(): void {
		let activeBodyCount = 0
		let requiresDenseResolution = false
		for(const activeBody of this.#bodies) {
			if(activeBody.locked || activeBody.state === 'commit' || activeBody.state === 'complete') {
				continue
			}
			activeBodyCount++
			if(
				!activeBody.launched
				|| activeBody.groundImpactCount + activeBody.bodySupportImpactCount === 0
			) requiresDenseResolution = true
		}
		const physicsStep = getAdaptiveDicePhysicsStep({
			totalBodyCount: this.#bodies.length,
			activeBodyCount,
			requiresDenseResolution
		})
		if(Math.abs(this.#physicsStepMs - physicsStep.milliseconds) <= 1e-6) return
		this.#physicsStepMs = physicsStep.milliseconds
		const physicsEngine = this.scene?.getPhysicsEngine()
		physicsEngine?.setTimeStep(physicsStep.seconds)
		physicsEngine?.setSubTimeStep(physicsStep.milliseconds)
	}

	protected override animateTimelineReroll(
		entries: readonly VisualEntry[],
		effectName: TimelineEffectName,
		durationMs: number,
		signal: AbortSignal
	): Promise<void> {
		const activeBodies: ActiveBody[] = []
		for(const entry of entries) {
			const activeBody = this.#bodyByEntry.get(entry)
			if(activeBody) activeBodies.push(activeBody)
		}
		for(const activeBody of activeBodies) {
			activeBody.body.setMotionType(PhysicsMotionType.ANIMATED)
			activeBody.body.disablePreStep = false
			try {
				this.#physicsPlugin?.setActivationControl(activeBody.body, PhysicsActivationControl.ALWAYS_ACTIVE)
			} catch {}
		}
		return super.animateTimelineReroll(entries, effectName, durationMs, signal).finally(() => {
			for(const activeBody of activeBodies) {
				activeBody.body.setTargetTransform(
					activeBody.entry.node.position,
					activeBody.entry.node.rotationQuaternion ?? IDENTITY_QUATERNION
				)
				activeBody.body.setLinearVelocity(ZERO_VECTOR)
				activeBody.body.setAngularVelocity(ZERO_VECTOR)
				activeBody.body.setMotionType(PhysicsMotionType.STATIC)
				activeBody.body.disablePreStep = true
				try {
					this.#physicsPlugin?.setActivationControl(activeBody.body, PhysicsActivationControl.ALWAYS_INACTIVE)
				} catch {}
			}
		})
	}

	#releaseLaunch(activeBody: ActiveBody): void {
		if(activeBody.launched) return
		const { body, entry, profile, shape } = activeBody
		entry.node.setEnabled(true)
		entry.node.computeWorldMatrix(true)
		// Released dice collide with one another immediately. Only the wall used
		// as the entry portal is excluded until the whole collider has crossed it.
		shape.filterMembershipMask = PHYSICS_DICE_LAYER
		shape.filterCollideMask = getLaunchCollisionMask(entry.launchEdge)
		body.setMotionType(PhysicsMotionType.DYNAMIC)
		body.disablePreStep = true
		body.setLinearDamping(this.options!.linearDamping)
		body.setAngularDamping(0)
		// Havok clears native velocities when a body transitions from
		// ALWAYS_INACTIVE to ALWAYS_ACTIVE. Activate first, then apply the throw.
		try {
			this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_ACTIVE)
		} catch {}
		body.setLinearVelocity(activeBody.launchLinearVelocity)
		body.setAngularVelocity(getPlannedFlightSpin(
			activeBody.launchAngularVelocity,
			0,
			activeBody.flightDurationMs / 1000,
			profile.landingSpinRetention
		))
		activeBody.launched = true
		this.#armEntryCollisions(activeBody)
	}

	#hasLaunchClearance(activeBody: ActiveBody): boolean {
		this.#performanceRecorder?.recordLaunchClearanceQuery()
		for(const candidate of this.#bodies) {
			if(candidate === activeBody || !candidate.launched) continue
			this.#performanceRecorder?.recordLaunchPairCheck()
			if(!hasPhysicsLaunchPairClearance(
				activeBody.entry.node.position,
				activeBody.entry.horizontalRadius,
				candidate.entry.node.position,
				candidate.entry.horizontalRadius
			)) return false
		}
		return true
	}

	#hasRecentBodyCollision = (activeBody: ActiveBody): boolean =>
		activeBody.lastBodyCollisionElapsedMs !== undefined
		&& activeBody.elapsedMs - activeBody.lastBodyCollisionElapsedMs
			<= Math.max(CONTACT_GRACE_MS, activeBody.profile.bodyContactSettleDelayMs)

	#armEntryCollisions(activeBody: ActiveBody): void {
		if(activeBody.collisionsArmed || !activeBody.launched) return
		if(this.#bounds && !hasEnteredLaunchPortal(
			activeBody.entry.node.position,
			this.#bounds,
			activeBody.entry.horizontalRadius,
			activeBody.entry.launchEdge
		)) return
		activeBody.shape.filterCollideMask = PHYSICS_ACTIVE_COLLISION_MASK
		activeBody.collisionsArmed = true
	}

	#shouldRecover(activeBody: ActiveBody): boolean {
		const position = activeBody.entry.node.position
		if(!activeBody.collisionsArmed) {
			return !Number.isFinite(position.x)
				|| !Number.isFinite(position.y)
				|| !Number.isFinite(position.z)
				|| position.y < -2
		}
		const responsiveLimit = this.#bounds
			? Math.max(
				11.5,
				Math.abs(this.#bounds.left),
				Math.abs(this.#bounds.right),
				Math.abs(this.#bounds.north),
				Math.abs(this.#bounds.south)
			) + activeBody.entry.horizontalRadius + 1
			: undefined
		return shouldRecoverPhysicsBody(position, responsiveLimit)
	}

	#updateGuidance(activeBody: ActiveBody, deltaMs: number, timeoutMs: number): void {
		if(activeBody.locked || activeBody.state === 'commit' || activeBody.state === 'complete') return
		if(!activeBody.launched) {
			activeBody.launchDelayElapsedMs += deltaMs
			if(activeBody.launchDelayElapsedMs + 1e-6 < activeBody.launchDelayMs) return
			if(!this.#hasLaunchClearance(activeBody)) return
			this.#releaseLaunch(activeBody)
		}
		this.#armEntryCollisions(activeBody)
		const { body, entry, profile } = activeBody
		if(this.#shouldRecover(activeBody) || !hasFiniteQuaternion(entry)) return
		activeBody.elapsedMs += deltaMs
		const timeoutRemainingMs = Math.max(0, timeoutMs - activeBody.elapsedMs)
		const hasGroundContact = activeBody.lastGroundContactElapsedMs !== undefined
			&& activeBody.elapsedMs - activeBody.lastGroundContactElapsedMs <= CONTACT_GRACE_MS
		if(!hasGroundContact) activeBody.groundContactStartedElapsedMs = undefined
		const hasBodyContact = activeBody.lastBodyContactElapsedMs !== undefined
			&& activeBody.elapsedMs - activeBody.lastBodyContactElapsedMs <= CONTACT_GRACE_MS
		if(!hasBodyContact) {
			activeBody.bodyContactStartedElapsedMs = undefined
			activeBody.bodySupport = undefined
		}
		const hasBodyCollision = activeBody.lastBodyCollisionElapsedMs !== undefined
			&& activeBody.elapsedMs - activeBody.lastBodyCollisionElapsedMs <= CONTACT_GRACE_MS
		if(!hasBodyCollision) activeBody.bodyCollisionStartedElapsedMs = undefined

		if(activeBody.state === 'freeFall') {
			const plannedElapsedSeconds = Math.max(0, activeBody.elapsedMs - deltaMs) / 1000
			const flightDurationSeconds = activeBody.flightDurationMs / 1000
			const plannedOrientation = getPlannedFlightQuaternion(
				activeBody.flightStartQuaternion,
				activeBody.launchAngularVelocity,
				plannedElapsedSeconds,
				flightDurationSeconds,
				profile.landingSpinRetention
			)
			const plannedVelocity = getPlannedFlightSpin(
				activeBody.launchAngularVelocity,
				plannedElapsedSeconds,
				flightDurationSeconds,
				profile.landingSpinRetention
			)
			const flightAssist = getPlannedFlightAngularVelocity(
				body.getAngularVelocity() ?? ZERO_VECTOR,
				currentQuaternionToRef(entry, activeBody.currentQuaternionScratch),
				activeBody.localFaceNormal,
				plannedOrientation,
				plannedVelocity,
				activeBody.flightCorrectionVelocity,
				Math.max(0, flightDurationSeconds - plannedElapsedSeconds),
				profile,
				Math.min(1, activeBody.elapsedMs / Math.max(1, activeBody.flightDurationMs)),
				deltaMs
			)
			activeBody.flightCorrectionVelocity = flightAssist.correctionVelocity
			body.setAngularVelocity(flightAssist.velocity)
			const flightLinearVelocity = body.getLinearVelocity()
			if(flightLinearVelocity) {
				const softenedVelocity = getSoftLandingLinearVelocity(
					flightLinearVelocity,
					entry.node.position,
					entry.end,
					profile,
					Math.min(1, activeBody.elapsedMs / Math.max(1, activeBody.flightDurationMs)),
					Math.max(
						2.2,
						Math.hypot(
							activeBody.launchLinearVelocity.x,
							activeBody.launchLinearVelocity.z
						) * 0.4
					)
				)
				// Preserve real Havok ricochets and body-separation impulses. Before
				// the first contact only, the synthetic target may soften the approach.
				if(activeBody.wallImpactCount > 0
					|| activeBody.groundImpactCount > 0
					|| activeBody.lastBodyCollisionElapsedMs !== undefined) {
					softenedVelocity.x = flightLinearVelocity.x
					softenedVelocity.z = flightLinearVelocity.z
				}
				body.setLinearVelocity(softenedVelocity)
			}
			// A slowed contact can occur after the original ballistic ETA. Keep the
			// landing plan active until a real impact; only the timeout safety window
			// may start settle guidance without one.
			if(
				activeBody.groundImpactCount + activeBody.bodySupportImpactCount === 0
				&& timeoutRemainingMs >= profile.timeoutWindowMs
			) return
			const groundImpactElapsedMs = activeBody.firstGroundImpactElapsedMs
			const bodyImpactElapsedMs = activeBody.firstBodySupportImpactElapsedMs
			const firstSupportImpactElapsedMs = groundImpactElapsedMs === undefined
				? bodyImpactElapsedMs
				: bodyImpactElapsedMs === undefined
					? groundImpactElapsedMs
					: Math.min(groundImpactElapsedMs, bodyImpactElapsedMs)
			const guidanceStartInput = activeBody.guidanceStartInput
			guidanceStartInput.elapsedMs = activeBody.elapsedMs
			guidanceStartInput.firstGroundImpactElapsedMs = firstSupportImpactElapsedMs
			guidanceStartInput.groundImpactCount = activeBody.groundImpactCount
				+ activeBody.bodySupportImpactCount
			guidanceStartInput.positionY = entry.node.position.y
			guidanceStartInput.timeoutRemainingMs = timeoutRemainingMs
			if(!shouldStartGuidance(guidanceStartInput, profile)) return
			activeBody.state = 'guidedSettle'
			activeBody.guidanceElapsedMs = 0
			body.setAngularDamping(this.options!.angularDamping)
		}

		if(activeBody.state === 'guidedSettle') {
			activeBody.guidanceElapsedMs += deltaMs
			const timeoutUrgency = 1 - Math.min(1, timeoutRemainingMs / Math.max(1, profile.timeoutWindowMs))
			const progress = Math.max(
				Math.min(1, activeBody.guidanceElapsedMs / profile.durationMs),
				timeoutUrgency
			)
			const orientation = currentQuaternionToRef(entry, activeBody.currentQuaternionScratch)
			const sustainedAngularVelocity = getSustainedRollAngularVelocity(
				body.getAngularVelocity() ?? ZERO_VECTOR,
				activeBody.settleRollAxis,
				profile,
				activeBody.guidanceElapsedMs,
				deltaMs
			)
			const guidedAngular = getFaceGuidedAngularVelocity(
				sustainedAngularVelocity,
				orientation,
				activeBody.localFaceNormal,
				activeBody.restDirection,
				profile,
				progress,
				deltaMs,
				'settle'
			)
			body.setAngularVelocity(guidedAngular.velocity)
			let linearVelocity = body.getLinearVelocity() ?? ZERO_VECTOR
			if(
				hasGroundContact
				|| hasBodyContact
				|| activeBody.groundImpactCount + activeBody.bodySupportImpactCount > 0
				|| entry.node.position.y <= profile.maxGuideStartHeight
			) {
				linearVelocity = getGuidedLinearVelocity(
					linearVelocity,
					profile,
					progress,
					deltaMs
				)
				body.setLinearVelocity(linearVelocity)
			}
			const groundContactElapsedMs = hasGroundContact && activeBody.groundContactStartedElapsedMs !== undefined
				? activeBody.elapsedMs - activeBody.groundContactStartedElapsedMs
				: 0
			const hasStableBodySupport = hasBodyContact && activeBody.bodySupport?.locked === true
			const bodyContactElapsedMs = hasBodyCollision && activeBody.bodyCollisionStartedElapsedMs !== undefined
				? activeBody.elapsedMs - activeBody.bodyCollisionStartedElapsedMs
				: 0
			const finalLockInput = activeBody.finalLockInput
			finalLockInput.angle = guidedAngular.angle
			finalLockInput.angularSpeed = guidedAngular.velocity.length()
			finalLockInput.elapsedMs = activeBody.elapsedMs
			finalLockInput.groundContactElapsedMs = groundContactElapsedMs
			finalLockInput.hasGroundContact = hasGroundContact || hasStableBodySupport
			finalLockInput.bodyContactElapsedMs = bodyContactElapsedMs
			finalLockInput.lastBodyContactElapsedMs = activeBody.lastBodyCollisionElapsedMs
			finalLockInput.linearSpeed = linearVelocity.length()
			finalLockInput.positionY = entry.node.position.y
			finalLockInput.stableElapsedMs = profile.stableDurationMs
			const stableThisStep = canStartFinalLock(finalLockInput, profile)
			activeBody.stableElapsedMs = stableThisStep
				? activeBody.stableElapsedMs + deltaMs
				: 0
			if(stableThisStep && activeBody.stableElapsedMs >= profile.stableDurationMs) {
				this.#startFinalLock(activeBody, false)
			}
			return
		}

		if(activeBody.state === 'finalLock') {
			if(activeBody.forcedLock && activeBody.forcedLockBodyCollision) {
				this.#abortForcedFinalLock(activeBody)
				return
			}
			activeBody.lockElapsedMs += deltaMs
			const rawProgress = Math.min(1, activeBody.lockElapsedMs / Math.max(1, activeBody.lockDurationMs))
			const progress = smoothStep(rawProgress)
			const source = activeBody.lockSourceQuaternion
				?? currentQuaternionToRef(entry, activeBody.currentQuaternionScratch)
			const target = activeBody.lockTargetQuaternion ?? source
			const rotation = Quaternion.SlerpToRef(source, target, progress, activeBody.lockRotationScratch).normalize()
			const sourcePosition = activeBody.lockSourcePosition ?? entry.node.position
			const targetPosition = activeBody.lockTargetPosition ?? sourcePosition
			const position = Vector3.LerpToRef(sourcePosition, targetPosition, progress, activeBody.lockPositionScratch)
			body.setTargetTransform(position, rotation)
			if(rawProgress >= 1) activeBody.state = 'commit'
		}
	}

	#startFinalLock(activeBody: ActiveBody, forced: boolean): void {
		if(
			activeBody.locked
			|| activeBody.state === 'finalLock'
			|| activeBody.state === 'commit'
			|| activeBody.state === 'complete'
			|| (!forced && activeBody.state !== 'guidedSettle')
		) return
		const orientation = currentQuaternionToRef(activeBody.entry, activeBody.currentQuaternionScratch)
		// A normal settle is already inside the accepted face cone. Commit the
		// real Havok pose in place instead of animating neighbours through one
		// another; the small remaining yaw/tilt is intentionally natural.
		if(!forced) {
			activeBody.body.setLinearVelocity(ZERO_VECTOR)
			activeBody.body.setAngularVelocity(ZERO_VECTOR)
			activeBody.state = 'commit'
			return
		}
		const alignment = getTolerantFaceAlignment(
			orientation,
			activeBody.localFaceNormal,
			activeBody.restDirection,
			forced
				? activeBody.profile.settleDeadZoneAngle
				: activeBody.profile.angleThreshold
		)
		const sourcePosition = activeBody.entry.node.position.clone()
		const hasRecentGroundSupport = activeBody.lastGroundContactElapsedMs !== undefined
			&& activeBody.elapsedMs - activeBody.lastGroundContactElapsedMs <= CONTACT_GRACE_MS
		// A normal lock freezes the real resting transform. Only the timeout
		// fallback is allowed to bring an unsupported body back to support height.
		const targetPosition = forced
			? new Vector3(
				sourcePosition.x,
				hasRecentGroundSupport
					? activeBody.entry.supportHeight
					: Math.max(activeBody.entry.supportHeight, sourcePosition.y),
				sourcePosition.z
			)
			: sourcePosition.clone()
		if(forced && this.#bounds) clampHorizontalPosition(
			targetPosition,
			this.#bounds,
			activeBody.entry.horizontalRadius
		)
		activeBody.state = 'finalLock'
		activeBody.forcedLock = forced
		activeBody.forcedLockBodyCollision = false
		activeBody.lockElapsedMs = 0
		activeBody.lockDurationMs = getFinalLockDurationMs(alignment.angle, activeBody.profile, forced)
		activeBody.lockSourcePosition = sourcePosition
		activeBody.lockTargetPosition = targetPosition
		activeBody.lockSourceQuaternion = orientation.clone()
		activeBody.lockTargetQuaternion = chooseShortestQuaternion(orientation, alignment.targetQuaternion)
		activeBody.body.setLinearVelocity(ZERO_VECTOR)
		activeBody.body.setAngularVelocity(ZERO_VECTOR)
		activeBody.body.setMotionType(PhysicsMotionType.ANIMATED)
		activeBody.body.setTargetTransform(sourcePosition, orientation)
	}

	#abortForcedFinalLock(activeBody: ActiveBody): void {
		const { body } = activeBody
		const linearVelocity = body.getLinearVelocity()?.clone() ?? ZERO_VECTOR
		const angularVelocity = body.getAngularVelocity()?.clone() ?? ZERO_VECTOR
		body.setMotionType(PhysicsMotionType.DYNAMIC)
		body.disablePreStep = true
		try {
			this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_ACTIVE)
		} catch {}
		body.setLinearVelocity(linearVelocity)
		body.setAngularVelocity(angularVelocity)
		activeBody.state = 'guidedSettle'
		activeBody.forcedLock = false
		activeBody.forcedLockBodyCollision = false
		activeBody.stableElapsedMs = 0
		activeBody.lockElapsedMs = 0
		activeBody.lockSourcePosition = undefined
		activeBody.lockTargetPosition = undefined
		activeBody.lockSourceQuaternion = undefined
		activeBody.lockTargetQuaternion = undefined
	}

	#beginEmergencyRecovery(activeBody: ActiveBody): void {
		if(activeBody.locked || activeBody.state === 'commit' || activeBody.state === 'complete') return
		const { body, entry } = activeBody
		const targetPosition = entry.end.clone()
		if(this.#bounds) clampHorizontalPosition(targetPosition, this.#bounds, entry.horizontalRadius)
		const recoveryTarget = hasFiniteQuaternion(entry)
			? getFaceAlignment(
				currentQuaternionToRef(entry, activeBody.currentQuaternionScratch),
				activeBody.localFaceNormal,
				activeBody.restDirection
			).targetQuaternion
			: entry.target.clone()
		body.setMotionType(PhysicsMotionType.ANIMATED)
		body.setLinearVelocity(ZERO_VECTOR)
		body.setAngularVelocity(ZERO_VECTOR)
		entry.node.position.copyFrom(targetPosition)
		entry.node.rotationQuaternion = recoveryTarget
		entry.node.computeWorldMatrix(true)
		// This is the only TELEPORT path and only runs after the body has already
		// escaped the visible stage or produced a non-finite transform.
		body.disablePreStep = false
		activeBody.state = 'commit'
	}

	#completeSmoothCommit(activeBody: ActiveBody): void {
		if(activeBody.state !== 'commit') return
		const { body } = activeBody
		body.disablePreStep = true
		body.setLinearVelocity(ZERO_VECTOR)
		body.setAngularVelocity(ZERO_VECTOR)
		body.setMotionType(PhysicsMotionType.STATIC)
		try {
			this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_INACTIVE)
		} catch {}
		activeBody.state = 'complete'
		activeBody.locked = true
		this.#remainingBodyCount = Math.max(0, this.#remainingBodyCount - 1)
	}

	#createShape(entry: VisualEntry): PhysicsShapeConvexHull {
		if(entry.physicsCollider) {
			const collider = entry.physicsCollider.clone(`${entry.node.name}-physics-collider`, null, false)
			if(!collider) throw new Error(`Unable to clone physics collider for '${entry.node.name}'.`)
			collider.setEnabled(true)
			collider.isVisible = false
			collider.position.setAll(0)
			collider.rotationQuaternion = IDENTITY_QUATERNION.clone()
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

	createBodies(entries: readonly VisualEntry[], append = false): void {
		const build = planPhysicsBodyBuild(this.#bodies.length, entries.length, append)
		if(build.disposeExisting) this.disposeDynamicBodies()
		const physicsStep = getDicePhysicsStep(build.totalBodyCount)
		this.#physicsStepMs = physicsStep.milliseconds
		const physicsEngine = this.scene?.getPhysicsEngine()
		physicsEngine?.setTimeStep(physicsStep.seconds)
		physicsEngine?.setSubTimeStep(physicsStep.milliseconds)
		this.#largestRadius = entries.reduce(
			(radius, entry) => Math.max(radius, entry.horizontalRadius),
			append ? this.#largestRadius : 0
		)
		this.buildBounds(undefined, undefined, this.#largestRadius)
		if(append) this.#prepareAppendLaunches(entries)
		for(const entry of entries) {
			if(this.#bodyByEntry.has(entry) || this.#bodyByNodeName.has(entry.node.name)) {
				throw new Error(`Duplicate physics body identity '${entry.node.name}'.`)
			}
			if(this.#bounds) {
				clampHorizontalPosition(entry.end, this.#bounds, entry.horizontalRadius)
				entry.node.position.copyFrom(entry.start)
			}
			const profile = getPhysicsGuidanceProfile(entry.sides)
			const linearVelocity = entry.launchVelocity.clone()
			const flightSeconds = estimateBallisticFlightSeconds(
				entry.node.position.y,
				entry.supportHeight,
				linearVelocity.y,
				9.81 * this.options!.gravity
			)
			const travel = new Vector3(
				linearVelocity.x * flightSeconds,
				entry.end.y - entry.node.position.y,
				linearVelocity.z * flightSeconds
			)
			const spinScale = Math.max(0, this.options!.spinForce * 0.05)
			const seededSpin = new Vector3(
				entry.spinX * spinScale,
				entry.spinY * spinScale,
				entry.spinZ * spinScale
			)
			const thrownSpin = getThrownAngularVelocity(
				seededSpin,
				travel,
				Math.hypot(linearVelocity.x, linearVelocity.z),
				entry.horizontalRadius,
				entry.sides
			)
			const launchSpin = getVisibleFlightAngularVelocity(
				thrownSpin,
				travel,
				flightSeconds,
				entry.sides,
				this.options!.spinForce
			)
			const landingApproachQuaternion = createLandingApproachQuaternion(
				entry.target,
				travel,
				profile.landingApproachAngle
			)
			const flightStartQuaternion = createPrecomputedFlightQuaternion(
				landingApproachQuaternion,
				launchSpin,
				flightSeconds
			)
			entry.node.rotationQuaternion = flightStartQuaternion
			entry.node.computeWorldMatrix(true)
			const resultFaceFrame = getResultFaceFrame(entry.target, entry.sides)
			const body = new PhysicsBody(entry.node, PhysicsMotionType.DYNAMIC, false, this.scene!)
			const shape = this.#createShape(entry)
			shape.material = { friction: this.options!.friction, restitution: this.options!.restitution }
			shape.filterMembershipMask = 0
			shape.filterCollideMask = 0
			body.shape = shape
			body.setMassProperties({ mass: this.options!.mass * getPhysicsMassMultiplier(entry.sides) })
			body.setMotionType(PhysicsMotionType.ANIMATED)
			body.setLinearDamping(this.options!.linearDamping)
			body.setAngularDamping(0)
			body.setLinearVelocity(ZERO_VECTOR)
			body.setAngularVelocity(ZERO_VECTOR)
			entry.node.setEnabled(false)
			try {
				this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_INACTIVE)
			} catch {}
			const activeBody: ActiveBody = {
				body,
				shape,
				entry,
				profile,
				localFaceNormal: resultFaceFrame.localNormal,
				restDirection: resultFaceFrame.restDirection,
				flightStartQuaternion: flightStartQuaternion.clone(),
				launchAngularVelocity: launchSpin.clone(),
				launchLinearVelocity: linearVelocity.clone(),
				launchDelayMs: entry.launchDelayMs,
				settleRollAxis: getLandingRollAxis(travel)
					.scale(0.35)
					.add(resultFaceFrame.restDirection.scale(0.65))
					.normalize(),
				flightDurationMs: flightSeconds * 1000,
				currentQuaternionScratch: Quaternion.Identity(),
				lockRotationScratch: Quaternion.Identity(),
				lockPositionScratch: Vector3.Zero(),
				guidanceStartInput: {
					elapsedMs: 0,
					firstGroundImpactElapsedMs: undefined,
					groundImpactCount: 0,
					positionY: 0,
					timeoutRemainingMs: 0
				},
				finalLockInput: {
					angle: 0,
					angularSpeed: 0,
					elapsedMs: 0,
					groundContactElapsedMs: 0,
					hasGroundContact: false,
					bodyContactElapsedMs: 0,
					lastBodyContactElapsedMs: undefined,
					linearSpeed: 0,
					positionY: 0,
					stableElapsedMs: 0
				},
				flightCorrectionVelocity: Vector3.Zero(),
				launchDelayElapsedMs: 0,
				launched: false,
				collisionsArmed: false,
				collisionObserver: undefined,
				state: 'freeFall',
				locked: false,
				elapsedMs: 0,
				guidanceElapsedMs: 0,
				stableElapsedMs: 0,
				lockElapsedMs: 0,
				lockDurationMs: profile.finalLockDurationMs,
				lockSourcePosition: undefined,
				lockTargetPosition: undefined,
				lockSourceQuaternion: undefined,
				lockTargetQuaternion: undefined,
				groundImpactCount: 0,
				firstGroundImpactElapsedMs: undefined,
				groundContactStartedElapsedMs: undefined,
				lastGroundContactElapsedMs: undefined,
				bodySupportImpactCount: 0,
				firstBodySupportImpactElapsedMs: undefined,
				bodyContactStartedElapsedMs: undefined,
				lastBodyContactElapsedMs: undefined,
				lastBodyCollisionElapsedMs: undefined,
				bodyCollisionStartedElapsedMs: undefined,
				bodySupport: undefined,
				wallImpactCount: 0,
				lastWallImpactElapsedMs: undefined,
				forcedLock: false,
				forcedLockBodyCollision: false,
				settledReported: false
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
			this.#bodyByEntry.set(entry, activeBody)
			this.#bodyByNodeName.set(entry.node.name, activeBody)
			this.#remainingBodyCount++
		}
		this.#performanceRecorder?.recordBodies(this.#bodies.length)
	}

	#prepareAppendLaunches(entries: readonly VisualEntry[]): void {
		const launchOccupants = this.#bodies.map(activeBody => ({
			position: activeBody.entry.node.position,
			radius: activeBody.entry.horizontalRadius
		}))
		const landingOccupants = this.#bodies.map(activeBody => ({
			position: activeBody.entry.node.position,
			radius: activeBody.entry.horizontalRadius
		}))
		for(const entry of entries) {
			const edgeLaunch = this.#timelineEdgeLaunch.get(entry)
			if(this.#bounds) {
				const landing = planPhysicsAppendLanding(
					entry.end,
					entry.horizontalRadius,
					landingOccupants,
					getHorizontalCenterBounds(this.#bounds, entry.horizontalRadius)
				)
				entry.end.set(landing.x, entry.supportHeight, landing.z)
			}
			const maximumSourceY = Math.max(entry.start.y, this.options!.startingHeight)
			const plan = planPhysicsAppendLaunch(
				entry.start,
				{ x: entry.end.x, y: maximumSourceY, z: entry.end.z },
				edgeLaunch?.position ?? entry.start,
				entry.horizontalRadius,
				launchOccupants,
				maximumSourceY
			)
			entry.start.set(plan.position.x, plan.position.y, plan.position.z)
			entry.node.position.copyFrom(entry.start)
			if(plan.origin === 'overhead') {
				entry.launchVelocity.set(0, -Math.max(1.4, this.options!.throwForce * 0.25), 0)
			} else if(plan.origin === 'edge' && edgeLaunch) {
				entry.launchVelocity.copyFrom(edgeLaunch.velocity)
			} else if(plan.origin === 'source') {
				const deltaX = entry.end.x - entry.start.x
				const deltaZ = entry.end.z - entry.start.z
				const distance = Math.hypot(deltaX, deltaZ)
				if(distance > 0.0001) {
					const horizontalSpeed = Math.max(
						2.4,
						Math.hypot(entry.launchVelocity.x, entry.launchVelocity.z)
					)
					entry.launchVelocity.x = deltaX / distance * horizontalSpeed
					entry.launchVelocity.z = deltaZ / distance * horizontalSpeed
				}
			}
			launchOccupants.push({ position: entry.start, radius: entry.horizontalRadius })
			landingOccupants.push({ position: entry.end, radius: entry.horizontalRadius })
		}
	}

	#recordCollision(activeBody: ActiveBody, event: IPhysicsCollisionEvent): void {
		if(event.type === PhysicsEventType.COLLISION_FINISHED) return
		this.#performanceRecorder?.recordCollision()
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
		if(otherName.startsWith('display-wall-')) {
			const contactWasInterrupted = activeBody.lastWallImpactElapsedMs === undefined
				|| activeBody.elapsedMs - activeBody.lastWallImpactElapsedMs > CONTACT_GRACE_MS
			if(contactWasInterrupted) activeBody.wallImpactCount++
			activeBody.lastWallImpactElapsedMs = activeBody.elapsedMs
			return
		}
		const otherBody = this.#bodyByNodeName.get(otherName)
		if(otherName !== ownName && otherBody) {
			if(activeBody.state === 'finalLock' && activeBody.forcedLock) {
				activeBody.forcedLockBodyCollision = true
			}
			const bodyCollisionWasInterrupted = activeBody.lastBodyCollisionElapsedMs === undefined
				|| activeBody.elapsedMs - activeBody.lastBodyCollisionElapsedMs > CONTACT_GRACE_MS
			if(bodyCollisionWasInterrupted) activeBody.bodyCollisionStartedElapsedMs = activeBody.elapsedMs
			activeBody.lastBodyCollisionElapsedMs = activeBody.elapsedMs
			const normalY = Math.abs(event.normal?.y ?? 0)
			const contactPoint = event.point
			const contactIsBelowCenter = contactPoint !== undefined
				&& contactPoint !== null
				&& contactPoint.y <= activeBody.entry.node.position.y
					- Math.min(0.06, activeBody.entry.supportHeight * 0.08)
			const otherBodyIsBelow = otherBody.entry.node.position.y + 0.02 < activeBody.entry.node.position.y
			if(normalY < 0.45 || !contactIsBelowCenter || !otherBodyIsBelow) return
			const contactWasInterrupted = activeBody.lastBodyContactElapsedMs === undefined
				|| activeBody.elapsedMs - activeBody.lastBodyContactElapsedMs > CONTACT_GRACE_MS
			const canActAsSupport = canBodyContactActAsSupport(
				activeBody.elapsedMs,
				activeBody.flightDurationMs,
				activeBody.entry.node.position.y,
				activeBody.profile
			)
			if(contactWasInterrupted) activeBody.bodyContactStartedElapsedMs = activeBody.elapsedMs
			if(canActAsSupport && (contactWasInterrupted || activeBody.bodySupportImpactCount === 0)) {
				activeBody.bodySupportImpactCount++
				activeBody.firstBodySupportImpactElapsedMs ??= activeBody.elapsedMs
			}
			activeBody.bodySupport = otherBody
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
		const make = (
			name: string,
			size: { width: number; height: number; depth: number },
			position: Vector3,
			material: { readonly friction: number; readonly restitution: number },
			membershipMask: number
		): void => {
			const staticBox = createStaticPhysicsBox(
				scene,
				name,
				size,
				position,
				material
			)
			if(staticBox.body.shape) {
				staticBox.body.shape.filterMembershipMask = membershipMask
				staticBox.body.shape.filterCollideMask = PHYSICS_DICE_LAYER
			}
			this.#staticBodies.push(staticBox)
		}
		const layout = createPhysicsBoundsLayout({
			bounds,
			startingHeight: this.options.startingHeight,
			largestRadius
		})
		try {
			make(layout.floor.name, layout.floor.size, layout.floor.position, {
				friction: this.options.friction,
				restitution: this.options.restitution
			}, PHYSICS_FLOOR_LAYER)
			const [north, south, west, east] = layout.walls
			for(const [wall, membershipMask] of [
				[north, PHYSICS_WALL_LAYERS.north],
				[south, PHYSICS_WALL_LAYERS.south],
				[west, PHYSICS_WALL_LAYERS.left],
				[east, PHYSICS_WALL_LAYERS.right]
			] as const) make(wall.name, wall.size, wall.position, {
				friction: PHYSICS_WALL_FRICTION,
				restitution: PHYSICS_WALL_RESTITUTION
			}, membershipMask)
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
			clampHorizontalPosition(entry.end, this.#bounds, entry.horizontalRadius)
			const positionChanged = activeBody.collisionsArmed
				&& (activeBody.locked
					|| activeBody.state === 'finalLock'
					|| activeBody.state === 'commit'
					|| activeBody.state === 'complete')
				? clampHorizontalPosition(
					entry.node.position,
					this.#bounds,
					entry.horizontalRadius
				)
				: false
			if(activeBody.state === 'finalLock') {
				const remainingDurationMs = Math.max(
					1,
					activeBody.lockDurationMs - activeBody.lockElapsedMs
				)
				const targetPosition = activeBody.lockTargetPosition?.clone()
					?? new Vector3(entry.node.position.x, entry.supportHeight, entry.node.position.z)
				const targetChanged = clampHorizontalPosition(
					targetPosition,
					this.#bounds,
					entry.horizontalRadius
				)
				if(positionChanged || targetChanged) {
					activeBody.lockSourcePosition = entry.node.position.clone()
					activeBody.lockTargetPosition = targetPosition
					activeBody.lockSourceQuaternion = currentQuaternionToRef(
						entry,
						activeBody.currentQuaternionScratch
					).clone()
					activeBody.lockDurationMs = remainingDurationMs
					activeBody.lockElapsedMs = 0
				}
			}
			if(!positionChanged) continue
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
		this.#bodyByEntry.clear()
		this.#bodyByNodeName.clear()
		this.#remainingBodyCount = 0
		this.#performanceRecorder = undefined
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
