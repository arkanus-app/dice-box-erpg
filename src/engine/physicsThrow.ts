import { DisplayCancelledError } from '../errors'
import { dcos, dsin } from './dmath'
import { createSeededRandom } from '../random'
import { LAUNCH_EDGE_WALL } from './launch'
import { simulateSteps, type SimulationBody, type SimulationOptions, type SimulationResult } from './simulation'
import { planThrow, stageBounds, type ThrowBody, type ThrowOptions } from './throw'
import { normalize, quatFromYawPitchRoll, type ReadonlyQuat, type ReadonlyVec3, type Vec3 } from './vector'

/** Explosion child released from `parent` (index into the root bodies or earlier children). */
export interface ThrowChild extends ThrowBody {
	readonly parent: number
	/** Enters through the throw edge instead of bursting out of its parent. */
	readonly fromEdge?: boolean
}

export type ThrowResult = SimulationResult & { readonly attempts: number }
type Steps<T> = Generator<void, T, void>

/** v3 physics runs a little faster than the v2 Havok world. */
export const GRAVITY_SCALE = 2
/**
 * How much each physical throw aims at the group's centre instead of its own
 * scattered landing. The v2 plan spreads landings to avoid contact; physics
 * converges them so dice actually meet, collide and scatter.
 */
export const PHYSICS_CONVERGENCE = 0.55
/** Per-die spread of release energy (±), so dice leave the hand at different speeds. */
export const PHYSICS_ENERGY_SPREAD = 0.22
/** Above this many bodies re-sampling is limited and a few leaning dice are accepted. */
export const CROWDED_THROW = 16
/** Above this many bodies the table is packed: one attempt, coarser steps, resting dice stay put. */
export const PACKED_THROW = 40

interface ThrowPolicy {
	readonly attempts: number
	/** Bodies allowed to end leaning before the choreography is re-sampled. */
	readonly tolerance: number
	readonly convergence: number
	readonly readyAlignment: number
	readonly dt: number
	readonly iterations: number
	readonly permanentSleep: boolean
}

/** Accuracy/cost trade-off by body count. */
export const throwPolicy = (bodies: number): ThrowPolicy => {
	if(bodies > PACKED_THROW) {
		return { attempts: 1, tolerance: bodies, convergence: 0, readyAlignment: 0.9, dt: 1 / 90, iterations: 8, permanentSleep: true }
	}
	if(bodies > CROWDED_THROW) {
		return {
			attempts: 2,
			tolerance: Math.floor(bodies * 0.06),
			convergence: PHYSICS_CONVERGENCE * Math.max(0.3, 10 / bodies),
			readyAlignment: 0.94,
			dt: 1 / 120,
			iterations: 10,
			permanentSleep: false
		}
	}
	return {
		attempts: 6,
		tolerance: 0,
		convergence: PHYSICS_CONVERGENCE * Math.min(1, 10 / Math.max(1, bodies)),
		readyAlignment: 0.966,
		dt: 1 / 120,
		iterations: 12,
		permanentSleep: false
	}
}

/** Seconds a throw normally needs to settle after the last release (a budget, never a cut). */
const settleBudget = (options: ThrowOptions): number => Math.max(2, options.settleTimeout / 1000) + 1.7

/** World parameters shared by every simulation of a presentation. */
const worldOptions = (options: ThrowOptions, radius: number, seed: string, maxTime: number, policy: ThrowPolicy): SimulationOptions => {
	const bounds = stageBounds(options, radius)
	return {
		halfX: bounds.halfX,
		halfZ: bounds.halfZ,
		gravity: 9.81 * options.gravity * GRAVITY_SCALE,
		floorFriction: options.friction,
		floorRestitution: options.restitution,
		wallFriction: 0.1,
		wallRestitution: 0.54,
		diceFriction: 0.35,
		diceRestitution: 0.45,
		linearDamping: options.linearDamping * 2,
		angularDamping: options.angularDamping * 9.4,
		maxTime,
		seed,
		burstHeight: options.burstHeight,
		spread: options.spread,
		explodeSpeed: Math.max(2.4, options.throwForce * 0.55),
		edgeHeight: options.startingHeight,
		dt: policy.dt,
		iterations: policy.iterations,
		readyAlignment: policy.readyAlignment,
		permanentSleep: policy.permanentSleep
	}
}

/** Bodies that would not read cleanly (leaning, unreadable or outside). */
const defects = (result: SimulationResult): number => result.landed.reduce((count, body) => count + (body.readable ? 0 : 1), 0)

/** Runs a stepping computation to completion. */
export const drain = <T>(steps: Steps<T>): T => {
	for(;;) {
		const next = steps.next()
		if(next.done) return next.value
	}
}

/**
 * Runs a stepping computation in slices of `sliceMs`, yielding to the page in
 * between, so a large throw never blocks rendering or input. Small throws end
 * within the first slice.
 */
export const runSliced = async <T>(steps: Steps<T>, signal?: AbortSignal, sliceMs = 8): Promise<T> => {
	for(;;) {
		const started = performance.now()
		for(;;) {
			const next = steps.next()
			if(next.done) return next.value
			if(performance.now() - started >= sliceMs) break
		}
		await new Promise<void>(resolve => setTimeout(resolve, 0))
		if(signal?.aborted) throw new DisplayCancelledError()
	}
}

/**
 * The first throw of a presentation: the v2 launch plan feeds a deterministic
 * simulation. When bodies end leaning, outside the stage or unreadable, the
 * choreography is re-sampled with `seed#n` (the displayed values never change).
 */
export function* physicsThrowSteps(
	bodies: readonly ThrowBody[],
	seed: string,
	options: ThrowOptions,
	children: readonly ThrowChild[] = []
): Steps<ThrowResult> {
	const all = [...bodies, ...children]
	const radius = Math.max(...all.map(body => body.shape.radius))
	const policy = throwPolicy(all.length)
	let best: SimulationResult | undefined
	let used = 0
	for(let attempt = 0; attempt < policy.attempts; attempt++) {
		used = attempt + 1
		const attemptSeed = attempt ? `${seed}#${attempt}` : seed
		const plan = planThrow(bodies, attemptSeed, options)
		const spin = createSeededRandom(`${attemptSeed}:spin`)
		const energy = createSeededRandom(`${attemptSeed}:energy`)
		const centerX = plan.launches.reduce((sum, launch) => sum + launch.end.x, 0) / Math.max(1, plan.launches.length)
		const centerZ = plan.launches.reduce((sum, launch) => sum + launch.end.z, 0) / Math.max(1, plan.launches.length)
		/** Release velocity aimed between the own landing and the group centre. */
		const velocities = plan.launches.map((launch): Vec3 => {
			const aimX = launch.end.x + (centerX - launch.end.x) * policy.convergence
			const aimZ = launch.end.z + (centerZ - launch.end.z) * policy.convergence
			const dx = aimX - launch.start.x, dz = aimZ - launch.start.z
			const distance = Math.sqrt(dx * dx + dz * dz)
			const horizontal = Math.sqrt(launch.velocity.x * launch.velocity.x + launch.velocity.z * launch.velocity.z)
			const speed = horizontal * (1 + (energy.next() * 2 - 1) * PHYSICS_ENERGY_SPREAD)
			if(distance < 1e-6) return launch.velocity.toArray()
			return [dx / distance * speed, launch.velocity.y, dz / distance * speed]
		})
		// v2 spaces launch waves for the slowest admissible portal speed; the
		// release speeds are known here, so a wave follows as soon as the
		// previous one has cleared its slot.
		let slowest = Infinity
		for(const velocity of velocities) slowest = Math.min(slowest, Math.sqrt(velocity[0] * velocity[0] + velocity[2] * velocity[2]))
		const delays = plan.launches.map((launch, index) => {
			if(!launch.packing.wave) return launch.delayMs
			const gap = launch.packing.spacing / Math.max(1, slowest) * 1000 * 1.2
			return index * Math.max(0, options.delay) + launch.packing.wave * Math.max(0, gap - launch.packing.waveCapacity * Math.max(0, options.delay))
		})
		const input = (body: ThrowBody, index: number | null, child?: ThrowChild): SimulationBody => {
			const launch = index === null ? undefined : plan.launches[index]
			const axis: Vec3 = launch ? normalize([launch.spin[0], launch.spin[1], launch.spin[2]]) : [0, 1, 0]
			const speed = options.spinForce * (2.5 + spin.next() * 2)
			return {
				shape: body.shape,
				value: body.value,
				...(body.readUp ? { readUp: body.readUp } : {}),
				position: launch ? launch.start.toArray() : [0, -50, 0],
				orientation: quatFromYawPitchRoll(spin.range(-Math.PI, Math.PI), spin.range(-Math.PI, Math.PI), spin.range(-Math.PI, Math.PI)),
				velocity: index === null ? [0, 0, 0] : velocities[index]!,
				angularVelocity: [axis[0] * speed, axis[1] * speed, axis[2] * speed],
				releaseTime: index === null ? 0 : delays[index]! / 1000,
				portal: LAUNCH_EDGE_WALL[plan.edge],
				mass: body.mass,
				...(child ? { spawnParent: child.parent, spawnFromEdge: Boolean(child.fromEdge) } : {})
			}
		}
		// Large throws enter in waves: the settle budget starts at the last release.
		const lastRelease = delays.reduce((latest, delay) => Math.max(latest, delay), 0) / 1000
		const result = yield* simulateSteps([
			...bodies.map((body, index) => input(body, index)),
			...children.map(child => input(child, null, child))
		], worldOptions(options, radius, attemptSeed, lastRelease + settleBudget(options), policy))
		if(!best || defects(result) < defects(best)) best = result
		if(defects(result) <= policy.tolerance) break
	}
	return { ...best!, attempts: used }
}

export const createPhysicsThrow = (
	bodies: readonly ThrowBody[],
	seed: string,
	options: ThrowOptions,
	children: readonly ThrowChild[] = []
): ThrowResult => drain(physicsThrowSteps(bodies, seed, options, children))

/** A die already resting on the table. */
export interface RestingBody extends ThrowBody {
	readonly position: ReadonlyVec3
	readonly orientation: ReadonlyQuat
}

export type RerollStyle = 'hop' | 'edge' | 'spin'

export interface FollowUpReroll {
	/** Index into `resting`. */
	readonly index: number
	/** The die with its new value. */
	readonly body: ThrowBody
	readonly style: RerollStyle
	readonly hopHeight: number
	readonly intensity: number
}

export interface FollowUpThrow {
	/** Every die on the table, in presentation order; the ones not rerolled stay fixed. */
	readonly resting: readonly RestingBody[]
	readonly rerolls?: readonly FollowUpReroll[]
	/** New explosion children; `parent` indexes `resting`. */
	readonly children?: readonly ThrowChild[]
}

/**
 * A later timeline phase: rerolled dice are thrown again from where they rest
 * (or from the edge) and explosion children burst from their parents, while
 * every other die is an immovable obstacle, so results already shown never
 * change. Bodies: `resting` (same order) followed by `children`.
 */
export function* followUpThrowSteps(input: FollowUpThrow, seed: string, options: ThrowOptions): Steps<ThrowResult> {
	const rerolls = new Map((input.rerolls ?? []).map(reroll => [reroll.index, reroll]))
	const children = input.children ?? []
	const radius = Math.max(...[...input.resting, ...children].map(body => body.shape.radius))
	const policy = { ...throwPolicy(rerolls.size + children.length), readyAlignment: 0.94 }
	const gravity = 9.81 * options.gravity * GRAVITY_SCALE
	let best: SimulationResult | undefined
	let used = 0
	for(let attempt = 0; attempt < Math.min(4, policy.attempts); attempt++) {
		used = attempt + 1
		const attemptSeed = attempt ? `${seed}#${attempt}` : seed
		const random = createSeededRandom(`${attemptSeed}:follow-up`)
		const edgePlan = planThrow(input.resting, `${attemptSeed}:edge`, options)
		const bodies: SimulationBody[] = input.resting.map((resting, index): SimulationBody => {
			const base = { shape: resting.shape, position: resting.position, orientation: resting.orientation, releaseTime: 0, mass: resting.mass }
			const reroll = rerolls.get(index)
			if(!reroll) return { ...base, value: resting.value, velocity: [0, 0, 0], angularVelocity: [0, 0, 0], portal: -1, fixed: true }
			const body = reroll.body
			const readUp = body.readUp ? { readUp: body.readUp } : {}
			const axis = normalize([random.next() * 2 - 1, random.next() * 2 - 1, random.next() * 2 - 1])
			if(reroll.style === 'edge') {
				// Picked up and thrown again from the edge, aimed back at its place.
				const launch = edgePlan.launches[index]!
				const dx = resting.position[0] - launch.start.x, dz = resting.position[2] - launch.start.z
				const distance = Math.sqrt(dx * dx + dz * dz) || 1
				const horizontal = Math.sqrt(launch.velocity.x * launch.velocity.x + launch.velocity.z * launch.velocity.z)
				const spin = options.spinForce * (2.5 + random.next() * 2)
				return {
					...base, ...readUp,
					value: body.value,
					position: launch.start.toArray(),
					orientation: quatFromYawPitchRoll(random.range(-Math.PI, Math.PI), random.range(-Math.PI, Math.PI), random.range(-Math.PI, Math.PI)),
					velocity: [dx / distance * horizontal, launch.velocity.y, dz / distance * horizontal],
					angularVelocity: [axis[0] * spin, axis[1] * spin, axis[2] * spin],
					portal: LAUNCH_EDGE_WALL[edgePlan.edge]
				}
			}
			// Tossed up from where it rests; G blends in while it is airborne.
			const height = Math.max(0.8, reroll.hopHeight * (reroll.style === 'spin' ? 0.45 : 1))
			const up = Math.sqrt(2 * gravity * height)
			const drift = 0.35 + random.next() * 0.5, heading = random.range(-Math.PI, Math.PI)
			const tumble = (reroll.style === 'spin' ? 8 : 14 + random.next() * 8) * Math.max(0.4, reroll.intensity)
			const yaw = reroll.style === 'spin' ? (random.next() < 0.5 ? -1 : 1) * (26 + random.next() * 8) : 0
			return {
				...base, ...readUp,
				value: body.value,
				velocity: [dcos(heading) * drift, up, dsin(heading) * drift],
				angularVelocity: [axis[0] * tumble, axis[1] * tumble + yaw, axis[2] * tumble],
				portal: -1,
				retoss: true
			}
		})
		for(const child of children) {
			bodies.push({
				shape: child.shape,
				value: child.value,
				...(child.readUp ? { readUp: child.readUp } : {}),
				position: [0, -50, 0],
				orientation: quatFromYawPitchRoll(random.range(-Math.PI, Math.PI), random.range(-Math.PI, Math.PI), random.range(-Math.PI, Math.PI)),
				velocity: [0, 0, 0],
				angularVelocity: [0, 0, 0],
				releaseTime: 0,
				portal: LAUNCH_EDGE_WALL[edgePlan.edge],
				mass: child.mass,
				spawnParent: child.parent,
				spawnFromEdge: Boolean(child.fromEdge)
			})
		}
		const result = yield* simulateSteps(bodies, worldOptions(options, radius, attemptSeed, settleBudget(options), policy))
		if(!best || defects(result) < defects(best)) best = result
		if(defects(result) <= policy.tolerance) break
	}
	return { ...best!, attempts: used }
}

export const createFollowUpThrow = (input: FollowUpThrow, seed: string, options: ThrowOptions): ThrowResult =>
	drain(followUpThrowSteps(input, seed, options))
