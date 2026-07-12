import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type {
	RendererContext,
	RequiredViewerOptions
} from './types'
import { createSeededRandom } from './random'
import {
	getDicePhysicsStep,
	hasPhysicsLaunchClearance,
	PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER,
	type PhysicsLaunchOccupant
} from './physicsSafety'
import KinematicRenderer, {
	createPresentationLaunchDynamics,
	selectPresentationLaunchEdge,
	type VisualEntry
} from './renderers/KinematicRenderer'

const OBJECT_RADIUS = 0.817
const VIEWPORT_WIDTH = 1440
const VIEWPORT_HEIGHT = 720
const GRAVITY = 9.81 * 1.3

const createProbeNode = (index: number): AbstractMesh => ({
	name: `admission-die-${String(index)}`,
	position: Vector3.Zero(),
	rotationQuaternion: Quaternion.Identity()
} as unknown as AbstractMesh)

class LaunchAdmissionProbe extends KinematicRenderer {
	createEntries(seed: string, count: number): readonly VisualEntry[] {
		this.context = {
			canvas: {
				clientWidth: VIEWPORT_WIDTH,
				clientHeight: VIEWPORT_HEIGHT,
				width: VIEWPORT_WIDTH,
				height: VIEWPORT_HEIGHT
			}
		} as unknown as RendererContext
		this.options = {
			scale: 6,
			delay: 10,
			wallPadding: 0.25,
			startingHeight: 7.6,
			spawnSpacing: 1.72,
			spawnHeightStep: 0,
			spawnOverscan: 0.15,
			throwForce: 6.4,
			aggressiveThrowChance: 0.12
		} as RequiredViewerOptions
		const random = createSeededRandom(seed)
		const launchEdge = selectPresentationLaunchEdge(
			seed,
			VIEWPORT_WIDTH,
			VIEWPORT_HEIGHT
		)
		const dynamics = createPresentationLaunchDynamics(seed, this.options.aggressiveThrowChance)
		return Array.from({ length: count }, (_, index) => this.createTrajectory(
			createProbeNode(index),
			Quaternion.Identity(),
			index,
			count,
			random,
			launchEdge,
			dynamics,
			false,
			6,
			0.5,
			OBJECT_RADIUS
		))
	}
}

interface SimulatedLaunchBody {
	readonly entry: VisualEntry
	readonly position: Vector3
	readonly velocity: Vector3
	launched: boolean
}

const advanceBody = (body: SimulatedLaunchBody, seconds: number): void => {
	body.position.addInPlace(body.velocity.scale(seconds))
	body.position.y -= GRAVITY * seconds * seconds / 2
	body.velocity.y -= GRAVITY * seconds
}

describe('launch admission spacing', () => {
	it('blocks the audited twelve-d6 admission that the nominal 10 ms delay overlaps', () => {
		const entries = new LaunchAdmissionProbe().createEntries('audit-1440-12-4', 12)
		assert.equal(entries[0]!.launchEdge, 'south')
		const physicsStep = getDicePhysicsStep(entries.length)
		assert.equal(physicsStep.seconds, 1 / 180)
		const first = entries[0]!
		const second = entries[1]!
		const firstPosition = first.start.clone()
		const firstVelocity = first.launchVelocity.clone()
		const activeFirst: SimulatedLaunchBody = {
			entry: first,
			position: firstPosition,
			velocity: firstVelocity,
			launched: true
		}
		// Body 1 first becomes due before the second 180 Hz substep. Body 0 has
		// advanced once by then, consuming the initial packing margin.
		advanceBody(activeFirst, physicsStep.seconds)
		const occupants: readonly PhysicsLaunchOccupant[] = [{
			position: activeFirst.position,
			radius: first.horizontalRadius
		}]
		const distance = Vector3.Distance(second.start, firstPosition)
		const required = (first.horizontalRadius + second.horizontalRadius)
			* PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
		assert.ok(distance < required, `${String(distance)} unexpectedly retained launch clearance`)
		assert.equal(
			hasPhysicsLaunchClearance(second.start, second.horizontalRadius, occupants),
			false
		)
	})

	it('retries blocked bodies by substep and never admits an overlapping envelope', () => {
		const entries = new LaunchAdmissionProbe().createEntries('audit-1440-12-4', 12)
		const physicsStep = getDicePhysicsStep(entries.length)
		const bodies: SimulatedLaunchBody[] = entries.map(entry => ({
			entry,
			position: entry.start.clone(),
			velocity: entry.launchVelocity.clone(),
			launched: false
		}))
		let blockedAttempts = 0
		let elapsedDelayMs = 0
		let simulationSteps = 0

		while(bodies.some(body => !body.launched) && simulationSteps < 720) {
			elapsedDelayMs += physicsStep.milliseconds
			for(const body of bodies) {
				if(body.launched || elapsedDelayMs + 1e-6 < body.entry.launchDelayMs) continue
				const occupants = bodies
					.filter(candidate => candidate !== body && candidate.launched)
					.map(candidate => ({
						position: candidate.position,
						radius: candidate.entry.horizontalRadius
					}))
				if(!hasPhysicsLaunchClearance(
					body.position,
					body.entry.horizontalRadius,
					occupants
				)) {
					blockedAttempts++
					continue
				}
				for(const occupant of occupants) {
					const requiredDistance = (
						body.entry.horizontalRadius + occupant.radius
					) * PHYSICS_LAUNCH_CLEARANCE_MULTIPLIER
					assert.ok(
						Vector3.Distance(body.position, occupant.position) >= requiredDistance - 1e-9,
						`body ${body.entry.node.name} was admitted into an active envelope`
					)
				}
				body.launched = true
			}
			for(const body of bodies) {
				if(body.launched) advanceBody(body, physicsStep.seconds)
			}
			simulationSteps++
		}

		assert.ok(blockedAttempts > 0, 'the audited overlapping admission was never deferred')
		assert.equal(bodies.filter(body => body.launched).length, entries.length)
		assert.ok(simulationSteps < 720, 'the admission gate deadlocked the launch queue')
	})
})
