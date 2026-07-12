import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Engine } from '@babylonjs/core/Engines/engine'
import type { Scene } from '@babylonjs/core/scene'
import type { ResolvedThemeConfig, DisplayMode, DisplayRenderer, NormalizedDisplayRequest, RendererContext, RequiredViewerOptions } from '../types'
import { DisplayCancelledError } from '../errors'
import { createSeededRandom } from '../random'
import { CoinFactory } from './coin'
import { PolyhedralFactory } from './PolyhedralFactory'
import { DISPLAY_CAMERA_FOV, DISPLAY_CAMERA_HEIGHT, SceneEnvironment } from './sceneEnvironment'
import {
	clampHorizontalPosition,
	clampValue,
	computeDisplayViewportBounds,
	getHorizontalCenterBounds,
	type DisplayViewportBounds
} from './viewportBounds'

export interface VisualEntry {
	readonly node: AbstractMesh | TransformNode
	readonly physicsCollider?: Mesh
	readonly sides: number
	readonly start: Vector3
	readonly end: Vector3
	readonly launchVelocity: Vector3
	readonly supportHeight: number
	readonly horizontalRadius: number
	readonly launchEdge: LaunchEdge
	readonly launchDelayMs: number
	readonly target: Quaternion
	readonly spinX: number
	readonly spinY: number
	readonly spinZ: number
}

const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3)
const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const MINIMUM_LAUNCH_HEIGHT = 2.8
const MAXIMUM_LAUNCH_HEIGHT = DISPLAY_CAMERA_HEIGHT * 0.27
const MAXIMUM_AXIAL_LAUNCH_ROWS = 2
const MINIMUM_PORTAL_SPEED = 2.4

export type LaunchEdge = 'left' | 'right' | 'north' | 'south'

export const selectPresentationLaunchEdge = (
	seed: string,
	_width: number,
	_height: number
): LaunchEdge => {
	// Use an isolated stream so choosing the group edge never changes the
	// established seeded landing, yaw or spin sequence.
	const edgeRandom = createSeededRandom(`${seed}:launch-edge`)
	return (['left', 'right', 'north', 'south'] as const)[
		Math.min(3, Math.floor(edgeRandom.next() * 4))
	]!
}

export interface TrajectoryLayoutInput {
	readonly index: number
	readonly count: number
	readonly scale: number
	readonly startingHeight: number
	readonly coin: boolean
	readonly objectRadius: number
	readonly bounds: DisplayViewportBounds
	readonly launchEdge: LaunchEdge
	readonly spawnSpacing: number
	readonly spawnHeightStep: number
	readonly spawnOverscan: number
}

export interface LaunchPacking {
	readonly tangent: number
	readonly row: number
	readonly wave: number
	readonly waveCapacity: number
	readonly spacing: number
}

/** Packs a throw into radius-aware tangent lanes and a small number of rows
 * behind the clipped edge. When those slots are full, a later wave reuses them
 * only after the previous body has had enough time to clear the portal. */
export const createLaunchPacking = (
	input: TrajectoryLayoutInput,
	minimumTangent: number,
	maximumTangent: number
): LaunchPacking => {
	const spacing = Math.max(
		0.01,
		input.spawnSpacing,
		input.objectRadius * 2.1,
		input.scale * 0.286
	)
	const span = Math.max(0, maximumTangent - minimumTangent)
	const tangentSlots = Math.max(1, Math.floor(span / spacing) + 1)
	const rowCount = MAXIMUM_AXIAL_LAUNCH_ROWS
	const waveCapacity = tangentSlots * rowCount
	const localIndex = input.index % waveCapacity
	const row = Math.floor(localIndex / tangentSlots)
	const tangentSlot = localIndex % tangentSlots
	const usedSpan = (tangentSlots - 1) * spacing
	const tangentStart = (minimumTangent + maximumTangent - usedSpan) / 2
	return {
		tangent: clampValue(tangentStart + tangentSlot * spacing, minimumTangent, maximumTangent),
		row,
		wave: Math.floor(input.index / waveCapacity),
		waveCapacity,
		spacing
	}
}

export interface PresentationLaunchDynamics {
	readonly aggressive: boolean
	readonly intensity: number
	readonly energyScale: number
	readonly headingRadians: number
}

/** Selects one shared throw character for the complete presentation. The
 * aggressive tail changes energy and heading, but never selects a wall or
 * guarantees a collision. */
export const createPresentationLaunchDynamics = (
	seed: string,
	aggressiveChance: number
): PresentationLaunchDynamics => {
	const random = createSeededRandom(`${seed}:launch-dynamics`)
	const chance = Number.isFinite(aggressiveChance)
		? clampValue(aggressiveChance, 0, 1)
		: 0
	const aggressive = random.next() < chance
	const intensity = aggressive ? random.range(0.55, 1) : 0
	const normalEnergy = 0.9 + 0.18 * ((random.next() + random.next()) / 2)
	const headingEnvelope = (10 + (aggressive ? 46 * intensity : 0)) * Math.PI / 180
	return {
		aggressive,
		intensity,
		energyScale: normalEnergy + (aggressive ? 0.62 * intensity : 0),
		headingRadians: (random.next() + random.next() - 1) * headingEnvelope
	}
}

const normalizeAngle = (angle: number): number => {
	let normalized = angle
	while(normalized > Math.PI) normalized -= Math.PI * 2
	while(normalized < -Math.PI) normalized += Math.PI * 2
	return normalized
}

/** Varies the real launch vector continuously. Most throws remain direct;
 * higher force plus the seeded energy/direction tail may reach any wall or a
 * corner, and Havok alone decides whether contact actually occurs. */
export const createNaturalLaunchVelocity = (
	start: Vector3,
	landing: Vector3,
	random: ReturnType<typeof createSeededRandom>,
	throwForce: number,
	dynamics: PresentationLaunchDynamics
): Vector3 => {
	const base = createThrownLinearVelocity(start, landing, throwForce)
	const horizontalSpeed = Math.hypot(base.x, base.z)
	if(horizontalSpeed <= 1e-6) return base
	const deltaX = landing.x - start.x
	const deltaZ = landing.z - start.z
	const inwardAngle = Math.abs(deltaX) >= Math.abs(deltaZ)
		? deltaX >= 0 ? 0 : Math.PI
		: deltaZ >= 0 ? Math.PI / 2 : -Math.PI / 2
	const baseAngle = Math.atan2(base.z, base.x)
	const bodyHeadingJitter = (random.next() + random.next() - 1) * 4 * Math.PI / 180
	const desiredRelativeAngle = normalizeAngle(
		baseAngle + dynamics.headingRadians + bodyHeadingJitter - inwardAngle
	)
	const maximumInwardAngle = 45 * Math.PI / 180
	const finalAngle = inwardAngle + clampValue(
		desiredRelativeAngle,
		-maximumInwardAngle,
		maximumInwardAngle
	)
	const bodyEnergy = 0.96 + 0.08 * ((random.next() + random.next()) / 2)
	let finalSpeed = Math.min(19.5, horizontalSpeed * dynamics.energyScale * bodyEnergy)
	const baseInwardSpeed = Math.cos(normalizeAngle(baseAngle - inwardAngle)) * horizontalSpeed
	const plannedInwardSpeed = Math.cos(finalAngle - inwardAngle) * finalSpeed
	if(plannedInwardSpeed > 1e-6 && plannedInwardSpeed < baseInwardSpeed) {
		finalSpeed = Math.min(19.5, finalSpeed * baseInwardSpeed / plannedInwardSpeed)
	}
	return new Vector3(
		Math.cos(finalAngle) * finalSpeed,
		base.y,
		Math.sin(finalAngle) * finalSpeed
	)
}

/** Recreates the immediate v1-style release without an artificial ease-in:
 * the body enters fast, already descending, and gravity adds speed until the
 * first impact. The horizontal component still targets the resolved visual
 * landing so the result-aware preflight remains deterministic. */
export const createThrownLinearVelocity = (
	start: Vector3,
	end: Vector3,
	throwForce: number
): Vector3 => {
	const force = Number.isFinite(throwForce) ? Math.max(0, throwForce) : 0
	const horizontal = new Vector3(end.x - start.x, 0, end.z - start.z)
	const distance = horizontal.length()
	if(distance <= 0.0001 || force <= 0) {
		return Vector3.Zero()
	}
	const forceRatio = Math.min(2, force / 4.55)
	const minimumImpulse = (
		3.4 + Math.min(distance, 3.3) * 0.5
	) * Math.min(1.15, force / 6.4)
	const horizontalSpeed = Math.min(
		17.5,
		Math.max(distance * force * 0.22, minimumImpulse)
	)
	horizontal.normalize().scaleInPlace(horizontalSpeed)
	horizontal.y = -Math.min(6, (1.4 + force * 0.38) * Math.sqrt(forceRatio))
	return horizontal
}

export const createScatteredLanding = (
	input: TrajectoryLayoutInput,
	random: ReturnType<typeof createSeededRandom>
): Vector3 => {
	const naturalSpacing = Math.max(0.78, input.scale * (input.coin ? 0.25 : 0.29))
	const fittedSpacing = Math.min(naturalSpacing, 7.2 / Math.sqrt(Math.max(1, input.count)))
	const radius = input.count === 1
		? random.range(0.15, 0.55)
		: fittedSpacing * Math.sqrt(input.index + 0.65)
	const angle = input.index * GOLDEN_ANGLE + random.range(-0.38, 0.38)
	const jitter = fittedSpacing * 0.16
	const rawX = Math.cos(angle) * radius + random.range(-jitter, jitter)
	const rawZ = Math.sin(angle) * radius + random.range(-jitter, jitter)
	const maximumRawRadius = input.count === 1
		? 0.55 + jitter
		: fittedSpacing * Math.sqrt(input.count - 0.35) + jitter
	const centerBounds = getHorizontalCenterBounds(input.bounds, input.objectRadius)
	const availableX = Math.max(0, (centerBounds.maxX - centerBounds.minX) / 2)
	const availableZ = Math.max(0, (centerBounds.maxZ - centerBounds.minZ) / 2)
	const landing = new Vector3(
		rawX * Math.min(1, availableX / Math.max(0.01, maximumRawRadius)),
		input.coin ? input.scale * 0.01 : input.scale * 0.12,
		rawZ * Math.min(1, availableZ / Math.max(0.01, maximumRawRadius))
	)
	clampHorizontalPosition(landing, input.bounds, input.objectRadius)
	return landing
}

export const createSideLaunch = (
	input: TrajectoryLayoutInput,
	landing: Vector3,
	_random: ReturnType<typeof createSeededRandom>
): Vector3 => {
	const fromLeft = input.launchEdge === 'left'
	const fromRight = input.launchEdge === 'right'
	const fromNorth = input.launchEdge === 'north'
	// startingHeight is the actual release plane, not merely a ceiling over a
	// lower random height. The default step is zero so a whole throw shares one
	// stable, higher plane; callers may still opt into a small group offset.
	const baseHeight = Number.isFinite(input.startingHeight)
		? input.startingHeight
		: 7.6
	const launchHeight = clampValue(
		baseHeight + Math.min(input.index, 3) * Math.max(0, input.spawnHeightStep),
		MINIMUM_LAUNCH_HEIGHT,
		MAXIMUM_LAUNCH_HEIGHT
	)
	const groundCenters = getHorizontalCenterBounds(input.bounds, input.objectRadius)
	const airborneBounds = computeDisplayViewportBounds({
		width: input.bounds.width,
		height: input.bounds.height,
		cameraHeight: DISPLAY_CAMERA_HEIGHT,
		cameraFov: DISPLAY_CAMERA_FOV,
		planeY: launchHeight,
		minimumRadius: input.objectRadius
	})
	const airborneCenters = getHorizontalCenterBounds(airborneBounds, input.objectRadius)
	const minX = Math.max(groundCenters.minX, airborneCenters.minX)
	const maxX = Math.min(groundCenters.maxX, airborneCenters.maxX)
	const minZ = Math.max(groundCenters.minZ, airborneCenters.minZ)
	const maxZ = Math.min(groundCenters.maxZ, airborneCenters.maxZ)
	const safeMinX = minX <= maxX ? minX : 0
	const safeMaxX = minX <= maxX ? maxX : 0
	const safeMinZ = minZ <= maxZ ? minZ : 0
	const safeMaxZ = minZ <= maxZ ? maxZ : 0
	// Start with the complete body beyond the launch-plane projection. The
	// canvas clips this short staging segment, so the die visibly crosses the
	// page edge instead of being enabled fully formed inside the viewport.
	const overscan = input.objectRadius * (1 + Math.max(0, input.spawnOverscan))
	if(fromLeft || fromRight) {
		const packing = createLaunchPacking(input, safeMinZ, safeMaxZ)
		const startX = fromLeft
			? -airborneBounds.visibleHalfX - overscan - packing.row * packing.spacing
			: airborneBounds.visibleHalfX + overscan + packing.row * packing.spacing
		const axialSpan = Math.max(0, groundCenters.maxX - groundCenters.minX)
		const minimumTravel = Math.min(3.1, axialSpan * 0.46)
		const groundSpan = Math.max(0.0001, groundCenters.maxX - groundCenters.minX)
		const landingRatio = clampValue(
			(landing.x - groundCenters.minX) / groundSpan,
			0,
			1
		)
		if(fromLeft) {
			const minimumLanding = Math.min(groundCenters.maxX, startX + minimumTravel)
			landing.x = minimumLanding
				+ (groundCenters.maxX - minimumLanding) * landingRatio
		} else {
			const maximumLanding = Math.max(groundCenters.minX, startX - minimumTravel)
			landing.x = groundCenters.minX
				+ (maximumLanding - groundCenters.minX) * landingRatio
		}
		const startTangent = packing.tangent
		const axialDistance = Math.abs(landing.x - startX)
		landing.z = clampValue(
			landing.z,
			Math.max(groundCenters.minZ, startTangent - axialDistance),
			Math.min(groundCenters.maxZ, startTangent + axialDistance)
		)
		clampHorizontalPosition(landing, input.bounds, input.objectRadius)
		return new Vector3(
			startX,
			launchHeight,
			startTangent
		)
	}
	const packing = createLaunchPacking(input, safeMinX, safeMaxX)
	const startZ = fromNorth
		? -airborneBounds.visibleHalfZ - overscan - packing.row * packing.spacing
		: airborneBounds.visibleHalfZ + overscan + packing.row * packing.spacing
	const axialSpan = Math.max(0, groundCenters.maxZ - groundCenters.minZ)
	const minimumTravel = Math.min(3.1, axialSpan * 0.46)
	const groundSpan = Math.max(0.0001, groundCenters.maxZ - groundCenters.minZ)
	const landingRatio = clampValue(
		(landing.z - groundCenters.minZ) / groundSpan,
		0,
		1
	)
	if(fromNorth) {
		const minimumLanding = Math.min(groundCenters.maxZ, startZ + minimumTravel)
		landing.z = minimumLanding
			+ (groundCenters.maxZ - minimumLanding) * landingRatio
	} else {
		const maximumLanding = Math.max(groundCenters.minZ, startZ - minimumTravel)
		landing.z = groundCenters.minZ
			+ (maximumLanding - groundCenters.minZ) * landingRatio
	}
	const startTangent = packing.tangent
	const axialDistance = Math.abs(landing.z - startZ)
	landing.x = clampValue(
		landing.x,
		Math.max(groundCenters.minX, startTangent - axialDistance),
		Math.min(groundCenters.maxX, startTangent + axialDistance)
	)
	clampHorizontalPosition(landing, input.bounds, input.objectRadius)
	return new Vector3(
		startTangent,
		launchHeight,
		startZ
	)
}

/** Returns true once an off-screen body has completely crossed the launch
 * wall. Physics keeps the entry portal collision-free until this point. */
export const hasEnteredLaunchPortal = (
	position: Pick<Vector3, 'x' | 'z'>,
	bounds: DisplayViewportBounds,
	radius: number,
	edge: LaunchEdge
): boolean => {
	const centers = getHorizontalCenterBounds(bounds, radius)
	if(edge === 'left') return position.x >= centers.minX
	if(edge === 'right') return position.x <= centers.maxX
	if(edge === 'north') return position.z >= centers.minZ
	return position.z <= centers.maxZ
}

export class KinematicRenderer implements DisplayRenderer {
	readonly mode: DisplayMode = 'kinematic'
	protected context?: RendererContext
	protected options?: Readonly<RequiredViewerOptions>
	protected engine?: Engine
	protected scene?: Scene
	protected environment?: SceneEnvironment
	protected polyhedra?: PolyhedralFactory
	protected coinFactory?: CoinFactory
	protected readonly activeNodes: Array<AbstractMesh | TransformNode> = []
	protected initialized = false

	async init(context: RendererContext): Promise<void> {
		if(this.initialized) return
		this.context = context
		this.options = context.options
		const width = Math.max(1, context.canvas.clientWidth || context.canvas.parentElement?.clientWidth || 300)
		const height = Math.max(1, context.canvas.clientHeight || context.canvas.parentElement?.clientHeight || 150)
		context.canvas.width = width
		context.canvas.height = height
		this.environment = new SceneEnvironment(context.canvas, context.options)
		this.engine = this.environment.engine
		this.scene = this.environment.scene
		this.polyhedra = new PolyhedralFactory(this.scene)
		this.coinFactory = new CoinFactory(this.scene)
		this.scene.render()
		this.initialized = true
	}

	async display(request: NormalizedDisplayRequest, signal: AbortSignal): Promise<void> {
		this.assertReady()
		this.clear()
		if(signal.aborted) throw new DisplayCancelledError()
		const configs = new Map<string, ResolvedThemeConfig>()
		for(const theme of new Set(request.dice.map(die => die.theme))) {
			const config = await this.context!.loadTheme(theme)
			configs.set(theme, config)
			if(request.dice.some(die => die.theme === theme && die.sides !== 2)) {
				await this.ensurePolyhedralTheme(config)
			}
			this.options!.onThemeLoaded(config)
		}
		if(signal.aborted) throw new DisplayCancelledError()
		const random = createSeededRandom(request.seed)
		// One presentation is one throw: every body enters through the same
		// seeded edge, with small per-body offsets to keep the group organic.
		const canvas = this.context!.canvas
		const launchEdge = selectPresentationLaunchEdge(
			request.seed,
			Math.max(1, canvas.clientWidth || canvas.width || 300),
			Math.max(1, canvas.clientHeight || canvas.height || 150)
		)
		const launchDynamics = createPresentationLaunchDynamics(
			request.seed,
			this.options!.aggressiveThrowChance
		)
		const entries: VisualEntry[] = []
		const bodyCount = request.dice.reduce((count, die) => count + (die.sides === 100 ? 2 : 1), 0)
		let bodyIndex = 0
		for(const die of request.dice) {
			const theme = configs.get(die.theme)!
			if(die.sides === 2) {
				entries.push(this.createCoinEntry(theme, die.id, die.value, die.discarded, bodyIndex++, bodyCount, random, launchEdge, launchDynamics))
				continue
			}
			if(die.sides === 100) {
				const tens = Math.floor((die.value - 1) / 10) * 10
				const ones = die.value - tens
				entries.push(await this.createDieEntry(theme, die, 100, tens, `${die.id}-tens`, bodyIndex++, bodyCount, random, launchEdge, launchDynamics))
				entries.push(await this.createDieEntry(theme, die, 10, ones, `${die.id}-ones`, bodyIndex++, bodyCount, random, launchEdge, launchDynamics))
				continue
			}
			entries.push(await this.createDieEntry(theme, die, die.sides, die.value, die.id, bodyIndex++, bodyCount, random, launchEdge, launchDynamics))
		}
		await this.animate(entries, signal)
	}

	protected async ensurePolyhedralTheme(config: ResolvedThemeConfig): Promise<void> {
		await this.polyhedra!.load(config)
	}

	protected createCoinEntry(
		theme: ResolvedThemeConfig,
		id: string,
		value: number,
		discarded: boolean,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>,
		launchEdge: LaunchEdge,
		launchDynamics: PresentationLaunchDynamics
	): VisualEntry {
		const coin = this.coinFactory!.create(theme, id, value, this.options!.scale, discarded)
		this.activeNodes.push(coin.root)
		for(const mesh of coin.meshes) this.environment?.addShadowCaster(mesh)
		return this.createTrajectory(
			coin.root,
			coin.targetQuaternion,
			index,
			count,
			random,
			launchEdge,
			launchDynamics,
			true,
			2,
			coin.supportHeight,
			coin.horizontalRadius
		)
	}

	protected async createDieEntry(
		theme: ResolvedThemeConfig,
		die: NormalizedDisplayRequest['dice'][number],
		sides: number,
		faceValue: number,
		id: string,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>,
		launchEdge: LaunchEdge,
		launchDynamics: PresentationLaunchDynamics
	): Promise<VisualEntry> {
		const instance = await this.polyhedra!.create(
			theme,
			die,
			sides,
			faceValue,
			id,
			this.options!.scale,
			this.options!.colliderScale
		)
		this.environment?.addShadowCaster(instance.mesh)
		this.activeNodes.push(instance.mesh)
		return this.createTrajectory(
			instance.mesh,
			instance.targetQuaternion,
			index,
			count,
			random,
			launchEdge,
			launchDynamics,
			false,
			sides,
			instance.supportHeight,
			instance.horizontalRadius,
			instance.physicsCollider
		)
	}

	protected createTrajectory(
		node: AbstractMesh | TransformNode,
		canonicalTarget: Quaternion,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>,
		launchEdge: LaunchEdge,
		launchDynamics: PresentationLaunchDynamics,
		coin: boolean,
		sides: number,
		supportHeight: number,
		horizontalRadius: number,
		physicsCollider?: Mesh
	): VisualEntry {
		const canvas = this.context!.canvas
		const width = Math.max(1, canvas.clientWidth || canvas.width || 300)
		const height = Math.max(1, canvas.clientHeight || canvas.height || 150)
		const bounds = computeDisplayViewportBounds({
			width,
			height,
			cameraHeight: DISPLAY_CAMERA_HEIGHT,
			cameraFov: DISPLAY_CAMERA_FOV,
			wallPadding: this.options!.wallPadding,
			minimumRadius: horizontalRadius
		})
		const layout = {
			index,
			count,
			scale: this.options!.scale,
			startingHeight: this.options!.startingHeight,
			coin,
			objectRadius: horizontalRadius,
			bounds,
			launchEdge,
			spawnSpacing: this.options!.spawnSpacing,
			spawnHeightStep: this.options!.spawnHeightStep,
			spawnOverscan: this.options!.spawnOverscan
		}
		const end = createScatteredLanding(layout, random)
		end.y = supportHeight
		const start = createSideLaunch(layout, end, random)
		const target = Quaternion.RotationAxis(Vector3.Up(), random.range(-Math.PI, Math.PI))
			.multiply(canonicalTarget)
			.normalize()
		const signedSpin = (minimum: number, maximum: number): number =>
			random.range(minimum, maximum) * Math.PI * (random.next() < 0.5 ? -1 : 1)
		const spinX = signedSpin(coin ? 8 : 3, coin ? 14 : 7)
		const spinY = signedSpin(2, 7)
		const spinZ = signedSpin(2, 7)
		const launchVelocity = createNaturalLaunchVelocity(
			start,
			end,
			random,
			this.options!.throwForce,
			launchDynamics
		)
		const groundCenters = getHorizontalCenterBounds(bounds, horizontalRadius)
		const airborneCenters = getHorizontalCenterBounds(computeDisplayViewportBounds({
			width,
			height,
			cameraHeight: DISPLAY_CAMERA_HEIGHT,
			cameraFov: DISPLAY_CAMERA_FOV,
			planeY: start.y,
			minimumRadius: horizontalRadius
		}), horizontalRadius)
		const tangentBounds = launchEdge === 'left' || launchEdge === 'right'
			? {
				minimum: Math.max(groundCenters.minZ, airborneCenters.minZ),
				maximum: Math.min(groundCenters.maxZ, airborneCenters.maxZ)
			}
			: {
				minimum: Math.max(groundCenters.minX, airborneCenters.minX),
				maximum: Math.min(groundCenters.maxX, airborneCenters.maxX)
			}
		if(tangentBounds.minimum > tangentBounds.maximum) {
			tangentBounds.minimum = 0
			tangentBounds.maximum = 0
		}
		const packing = createLaunchPacking(layout, tangentBounds.minimum, tangentBounds.maximum)
		const minimumWaveGapMs = packing.spacing / MINIMUM_PORTAL_SPEED * 1000 * 1.12
		const configuredDelayMs = Math.max(0, this.options!.delay)
		const automaticWaveDelayMs = Math.max(
			0,
			minimumWaveGapMs - packing.waveCapacity * configuredDelayMs
		)
		node.position.copyFrom(start)
		node.rotationQuaternion = Quaternion.Identity()
		return {
			node,
			...(physicsCollider ? { physicsCollider } : {}),
			sides,
			start,
			end,
			launchVelocity,
			supportHeight,
			horizontalRadius,
			launchEdge,
			launchDelayMs: index * configuredDelayMs + packing.wave * automaticWaveDelayMs,
			target,
			spinX,
			spinY,
			spinZ
		}
	}

	protected animate(entries: readonly VisualEntry[], signal: AbortSignal): Promise<void> {
		const engine = this.engine!
		const scene = this.scene!
		const dieDuration = Math.max(250, this.options!.duration)
		const duration = dieDuration + entries.reduce(
			(maximum, entry) => Math.max(maximum, entry.launchDelayMs),
			0
		)
		const startedAt = performance.now()
		for(const entry of entries) entry.node.setEnabled(entry.launchDelayMs <= 0)
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
				const elapsedMs = performance.now() - startedAt
				for(const entry of entries) {
					const progress = clamp01((elapsedMs - entry.launchDelayMs) / dieDuration)
					if(elapsedMs < entry.launchDelayMs) continue
					entry.node.setEnabled(true)
					const positionProgress = easeOutCubic(progress)
					entry.node.position.set(
						entry.start.x + (entry.end.x - entry.start.x) * positionProgress,
						entry.start.y + (entry.end.y - entry.start.y) * positionProgress + Math.sin(progress * Math.PI) * 2.4,
						entry.start.z + (entry.end.z - entry.start.z) * positionProgress
					)
					const spinning = Quaternion.RotationYawPitchRoll(
						entry.spinY * progress,
						entry.spinX * progress,
						entry.spinZ * progress
					)
					const settle = easeOutCubic(clamp01((progress - 0.84) / 0.16))
					entry.node.rotationQuaternion = Quaternion.Slerp(spinning, entry.target, settle)
				}
				scene.render()
				if(elapsedMs >= duration) finish()
			}
			signal.addEventListener('abort', abort, { once: true })
			engine.runRenderLoop(render)
		})
	}

	async updateOptions(options: Readonly<RequiredViewerOptions>): Promise<void> {
		this.options = options
		this.environment?.update(options)
	}

	resize(width: number, height: number): void {
		if(!this.context || !this.engine) return
		this.context.canvas.width = Math.max(1, width)
		this.context.canvas.height = Math.max(1, height)
		this.environment?.resize()
	}

	clear(): void {
		this.engine?.stopRenderLoop()
		for(const node of this.activeNodes.splice(0)) {
			if(node.metadata?.displayFactory === 'coin') this.coinFactory?.release(node)
			else if(node instanceof Mesh && node.metadata?.displayFactory === 'polyhedron') this.polyhedra?.release(node)
			else node.dispose(false, false)
		}
		this.scene?.render()
	}

	dispose(): void {
		this.clear()
		this.coinFactory?.dispose()
		this.polyhedra?.dispose()
		this.environment?.dispose()
		this.initialized = false
	}

	protected assertReady(): void {
		if(!this.initialized || !this.scene || !this.engine || !this.options || !this.context) {
			throw new Error('Renderer must be initialized before display().')
		}
	}
}

export default KinematicRenderer
