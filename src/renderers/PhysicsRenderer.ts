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
import type { TimelineEffectName } from '../timeline'
import { DisplayCancelledError } from '../errors'
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
	getDicePhysicsStep,
	hasPhysicsLaunchPairClearance,
	planPhysicsAppendLanding,
	planPhysicsAppendLaunch,
	shouldRecoverPhysicsBody
} from '../physicsSafety'
import KinematicRenderer, {
	hasEnteredLaunchPortal,
	type TimelineVisualHandle,
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
	bodySupportName: string | undefined
	wallImpactCount: number
	lastWallImpactElapsedMs: number | undefined
	forcedLock: boolean
	forcedLockBodyCollision: boolean
}

const CONTACT_GRACE_MS = DICE_PHYSICS_SUB_TIME_STEP_MS * 3.5

export interface PhysicsBodyBuildPlan {
	readonly disposeExisting: boolean
	readonly totalBodyCount: number
}

export const planPhysicsBodyBuild = (
	existingBodyCount: number,
	incomingBodyCount: number,
	append: boolean
): PhysicsBodyBuildPlan => ({
	disposeExisting: !append,
	totalBodyCount: (append ? Math.max(0, existingBodyCount) : 0) + Math.max(0, incomingBodyCount)
})

const currentQuaternion = (entry: VisualEntry): Quaternion =>
	(entry.node.rotationQuaternion ?? Quaternion.Identity()).clone().normalize()

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
	readonly #dynamicBodyNames = new Set<string>()
	#staticBodies: Array<{ body: PhysicsBody; mesh: AbstractMesh }> = []
	#physicsPlugin: HavokPlugin | undefined
	#bounds: DisplayViewportBounds | undefined
	#boundsSignature = ''
	#largestRadius = 0
	#physicsStepMs = DICE_PHYSICS_SUB_TIME_STEP_MS
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
			for(const activeBody of this.#bodies) {
				if(!entries.includes(activeBody.entry)) continue
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
				try {
					this.#physicsPlugin?.setActivationControl(body, PhysicsActivationControl.ALWAYS_INACTIVE)
				} catch {}
			}
			this.scene?.render()
			return Promise.resolve()
		}
		return this.#runPhysicsAnimation(signal, durationMs)
	}

	#runPhysicsAnimation(signal: AbortSignal, requestedDurationMs: number): Promise<void> {
		const engine = this.engine!
		const scene = this.scene!
		const duration = Math.max(250, requestedDurationMs)
		return new Promise<void>((resolve, reject) => {
			let settled = false
		const beforePhysicsObserver = scene.onBeforePhysicsObservable.add(() => {
				for(const activeBody of this.#bodies) {
					this.#updateGuidance(activeBody, this.#physicsStepMs, duration)
				}
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
				if(error) reject(error)
				else resolve()
			}
			const abort = (): void => finish(new DisplayCancelledError())
			const render = (): void => {
				if(signal.aborted) return abort()
				const forcedLockActive = this.#bodies.some(activeBody =>
					activeBody.state === 'finalLock' && activeBody.forcedLock
				)
				const overdueBodies: ActiveBody[] = []
				for(const activeBody of this.#bodies) {
					if(activeBody.locked || activeBody.state === 'commit') continue
					if(!activeBody.launched) continue
					if(
						this.#shouldRecover(activeBody)
						|| !hasFiniteQuaternion(activeBody.entry)
					) {
						this.#beginEmergencyRecovery(activeBody)
					} else if(activeBody.elapsedMs >= duration + activeBody.profile.timeoutExtensionMs) {
						overdueBodies.push(activeBody)
					}
				}
				if(!forcedLockActive) {
					const candidate = overdueBodies
						.filter(activeBody => !this.#hasRecentBodyCollision(activeBody))
						.sort((left, right) => left.entry.node.position.y - right.entry.node.position.y)[0]
					if(candidate) this.#startFinalLock(candidate, true)
				}
				scene.render()
				if(this.#bodies.every(activeBody => activeBody.locked)) finish()
			}
			signal.addEventListener('abort', abort, { once: true })
			engine.runRenderLoop(render)
		})
	}

	protected override animateTimelineReroll(
		entries: readonly VisualEntry[],
		effectName: TimelineEffectName,
		durationMs: number,
		signal: AbortSignal
	): Promise<void> {
		const activeBodies = entries
			.map(entry => this.#bodies.find(candidate => candidate.entry === entry))
			.filter((body): body is ActiveBody => body !== undefined)
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
					activeBody.entry.node.rotationQuaternion ?? Quaternion.Identity()
				)
				activeBody.body.setLinearVelocity(Vector3.Zero())
				activeBody.body.setAngularVelocity(Vector3.Zero())
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
		for(const candidate of this.#bodies) {
			if(candidate === activeBody || !candidate.launched) continue
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
			activeBody.bodySupportName = undefined
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
				body.getAngularVelocity() ?? Vector3.Zero(),
				currentQuaternion(entry),
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
			const firstSupportImpactElapsedMs = [
				activeBody.firstGroundImpactElapsedMs,
				activeBody.firstBodySupportImpactElapsedMs
			].filter((value): value is number => value !== undefined)
				.reduce<number | undefined>(
					(earliest, value) => earliest === undefined ? value : Math.min(earliest, value),
					undefined
				)
			if(!shouldStartGuidance({
				elapsedMs: activeBody.elapsedMs,
				...(firstSupportImpactElapsedMs === undefined
					? {}
					: { firstGroundImpactElapsedMs: firstSupportImpactElapsedMs }),
				groundImpactCount: activeBody.groundImpactCount + activeBody.bodySupportImpactCount,
				positionY: entry.node.position.y,
				timeoutRemainingMs
			}, profile)) return
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
			const orientation = currentQuaternion(entry)
			const sustainedAngularVelocity = getSustainedRollAngularVelocity(
				body.getAngularVelocity() ?? Vector3.Zero(),
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
			let linearVelocity = body.getLinearVelocity() ?? Vector3.Zero()
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
			const supportingBody = activeBody.bodySupportName === undefined
				? undefined
				: this.#bodies.find(candidate => candidate.entry.node.name === activeBody.bodySupportName)
			const hasStableBodySupport = hasBodyContact && supportingBody?.locked === true
			const bodyContactElapsedMs = hasBodyCollision && activeBody.bodyCollisionStartedElapsedMs !== undefined
				? activeBody.elapsedMs - activeBody.bodyCollisionStartedElapsedMs
				: 0
			const readiness = {
				angle: guidedAngular.angle,
				angularSpeed: guidedAngular.velocity.length(),
				elapsedMs: activeBody.elapsedMs,
				groundContactElapsedMs,
				hasGroundContact: hasGroundContact || hasStableBodySupport,
				bodyContactElapsedMs,
				...(activeBody.lastBodyCollisionElapsedMs === undefined
					? {}
					: { lastBodyContactElapsedMs: activeBody.lastBodyCollisionElapsedMs }),
				linearSpeed: linearVelocity.length(),
				positionY: entry.node.position.y
			}
			const stableThisStep = canStartFinalLock({
				...readiness,
				stableElapsedMs: profile.stableDurationMs
			}, profile)
			activeBody.stableElapsedMs = stableThisStep
				? activeBody.stableElapsedMs + deltaMs
				: 0
			if(canStartFinalLock({
				...readiness,
				stableElapsedMs: activeBody.stableElapsedMs
			}, profile)) this.#startFinalLock(activeBody, false)
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
			const source = activeBody.lockSourceQuaternion ?? currentQuaternion(entry)
			const target = activeBody.lockTargetQuaternion ?? source
			const rotation = Quaternion.Slerp(source, target, progress).normalize()
			const sourcePosition = activeBody.lockSourcePosition ?? entry.node.position
			const targetPosition = activeBody.lockTargetPosition ?? sourcePosition
			body.setTargetTransform(Vector3.Lerp(sourcePosition, targetPosition, progress), rotation)
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
		const orientation = currentQuaternion(activeBody.entry)
		// A normal settle is already inside the accepted face cone. Commit the
		// real Havok pose in place instead of animating neighbours through one
		// another; the small remaining yaw/tilt is intentionally natural.
		if(!forced) {
			activeBody.body.setLinearVelocity(Vector3.Zero())
			activeBody.body.setAngularVelocity(Vector3.Zero())
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
		activeBody.lockSourceQuaternion = orientation
		activeBody.lockTargetQuaternion = chooseShortestQuaternion(orientation, alignment.targetQuaternion)
		activeBody.body.setLinearVelocity(Vector3.Zero())
		activeBody.body.setAngularVelocity(Vector3.Zero())
		activeBody.body.setMotionType(PhysicsMotionType.ANIMATED)
		activeBody.body.setTargetTransform(sourcePosition, orientation)
	}

	#abortForcedFinalLock(activeBody: ActiveBody): void {
		const { body } = activeBody
		const linearVelocity = body.getLinearVelocity()?.clone() ?? Vector3.Zero()
		const angularVelocity = body.getAngularVelocity()?.clone() ?? Vector3.Zero()
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
				currentQuaternion(entry),
				activeBody.localFaceNormal,
				activeBody.restDirection
			).targetQuaternion
			: entry.target.clone()
		body.setMotionType(PhysicsMotionType.ANIMATED)
		body.setLinearVelocity(Vector3.Zero())
		body.setAngularVelocity(Vector3.Zero())
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
		body.setLinearVelocity(Vector3.Zero())
		body.setAngularVelocity(Vector3.Zero())
		body.setMotionType(PhysicsMotionType.STATIC)
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
		for(const entry of entries) this.#dynamicBodyNames.add(entry.node.name)
		for(const entry of entries) {
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
			body.setLinearVelocity(Vector3.Zero())
			body.setAngularVelocity(Vector3.Zero())
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
				bodySupportName: undefined,
				wallImpactCount: 0,
				lastWallImpactElapsedMs: undefined,
				forcedLock: false,
				forcedLockBodyCollision: false
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
		if(otherName !== ownName && this.#dynamicBodyNames.has(otherName)) {
			if(activeBody.state === 'finalLock' && activeBody.forcedLock) {
				activeBody.forcedLockBodyCollision = true
			}
			const bodyCollisionWasInterrupted = activeBody.lastBodyCollisionElapsedMs === undefined
				|| activeBody.elapsedMs - activeBody.lastBodyCollisionElapsedMs > CONTACT_GRACE_MS
			if(bodyCollisionWasInterrupted) activeBody.bodyCollisionStartedElapsedMs = activeBody.elapsedMs
			activeBody.lastBodyCollisionElapsedMs = activeBody.elapsedMs
			const otherBody = this.#bodies.find(candidate => candidate.entry.node.name === otherName)
			const normalY = Math.abs(event.normal?.y ?? 0)
			const contactPoint = event.point
			const contactIsBelowCenter = contactPoint !== undefined
				&& contactPoint !== null
				&& contactPoint.y <= activeBody.entry.node.position.y
					- Math.min(0.06, activeBody.entry.supportHeight * 0.08)
			const otherBodyIsBelow = otherBody !== undefined
				&& otherBody.entry.node.position.y + 0.02 < activeBody.entry.node.position.y
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
			activeBody.bodySupportName = otherName
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
					activeBody.lockSourceQuaternion = currentQuaternion(entry)
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
