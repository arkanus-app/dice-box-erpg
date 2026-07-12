import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createSeededRandom } from './random'
import {
	createScatteredLanding,
	createSideLaunch,
	type TrajectoryLayoutInput
} from './renderers/KinematicRenderer'
import { DISPLAY_CAMERA_FOV, DISPLAY_CAMERA_HEIGHT } from './renderers/sceneEnvironment'
import {
	computeDisplayViewportBounds,
	getHorizontalCenterBounds,
	type DisplayViewportBounds
} from './renderers/viewportBounds'

const OBJECT_RADIUS = 0.62

const createBounds = (width: number, height: number): DisplayViewportBounds =>
	computeDisplayViewportBounds({
		width,
		height,
		cameraHeight: DISPLAY_CAMERA_HEIGHT,
		cameraFov: DISPLAY_CAMERA_FOV,
		wallPadding: 0.4,
		minimumRadius: OBJECT_RADIUS
	})

const buildLayout = (seed: string, width = 1200, height = 800, count = 6) => {
	const random = createSeededRandom(seed)
	const bounds = createBounds(width, height)
	return Array.from({ length: count }, (_, index) => {
		const input: TrajectoryLayoutInput = {
			index,
			count,
			scale: 5,
			startingHeight: 6.4,
			coin: false,
			objectRadius: OBJECT_RADIUS,
			bounds
		}
		const landing = createScatteredLanding(input, random)
		return { input, landing, launch: createSideLaunch(input, landing, random) }
	})
}

const assertInside = (
	position: { readonly x: number; readonly z: number },
	bounds: DisplayViewportBounds,
	radius: number,
	label: string
): void => {
	const centers = getHorizontalCenterBounds(bounds, radius)
	assert.ok(position.x >= centers.minX - 1e-9, `${label}.x=${position.x} crossed left=${centers.minX}`)
	assert.ok(position.x <= centers.maxX + 1e-9, `${label}.x=${position.x} crossed right=${centers.maxX}`)
	assert.ok(position.z >= centers.minZ - 1e-9, `${label}.z=${position.z} crossed north=${centers.minZ}`)
	assert.ok(position.z <= centers.maxZ + 1e-9, `${label}.z=${position.z} crossed south=${centers.maxZ}`)
}

describe('natural presentation layout', () => {
	it('scatters resting positions instead of placing dice in rows', () => {
		const entries = buildLayout('layout-seed')
		const xPositions = new Set(entries.map(entry => entry.landing.x.toFixed(3)))
		const zPositions = new Set(entries.map(entry => entry.landing.z.toFixed(3)))
		assert.ok(xPositions.size >= 5)
		assert.ok(zPositions.size >= 5)
	})

	it('launches alternately from the responsive left and right edges', () => {
		const entries = buildLayout('launch-seed')
		entries.forEach(({ input, launch }, index) => {
			const groundCenters = getHorizontalCenterBounds(input.bounds, input.objectRadius)
			const airborneBounds = computeDisplayViewportBounds({
				width: input.bounds.width,
				height: input.bounds.height,
				cameraHeight: DISPLAY_CAMERA_HEIGHT,
				cameraFov: DISPLAY_CAMERA_FOV,
				planeY: launch.y,
				minimumRadius: input.objectRadius
			})
			const airborneCenters = getHorizontalCenterBounds(airborneBounds, input.objectRadius)
			const expectedEdge = index % 2 === 0
				? Math.max(groundCenters.minX, airborneCenters.minX)
				: Math.min(groundCenters.maxX, airborneCenters.maxX)
			assert.ok(Math.abs(launch.x - expectedEdge) <= 0.23)
			assert.equal(Math.sign(launch.x), index % 2 === 0 ? -1 : 1)
		})
	})

	it('remains deterministic for the visual seed', () => {
		const first = buildLayout('repeatable').map(entry => entry.launch.asArray())
		const second = buildLayout('repeatable').map(entry => entry.launch.asArray())
		assert.deepEqual(first, second)
	})

	it('keeps launch perspective close to the resting dice size', () => {
		for(const scale of [5.1, 6]) {
			const random = createSeededRandom(`perspective-${scale}`)
			const bounds = createBounds(1200, 800)
			for(let index = 0; index < 12; index += 1) {
				const input: TrajectoryLayoutInput = {
					index,
					count: 12,
					scale,
					startingHeight: 6.4,
					coin: false,
					objectRadius: OBJECT_RADIUS,
					bounds
				}
				const landing = createScatteredLanding(input, random)
				const launch = createSideLaunch(input, landing, random)
				const apparentScale = (DISPLAY_CAMERA_HEIGHT - landing.y) / (DISPLAY_CAMERA_HEIGHT - launch.y)
				assert.ok(apparentScale <= 1.25, `launch scale ${apparentScale.toFixed(3)} for scale ${scale}`)
			}
		}
	})

	it('keeps all launches and landings inside desktop and portrait barriers', () => {
		for(const viewport of [
			{ label: 'desktop', width: 1440, height: 720 },
			{ label: 'portrait', width: 390, height: 844 }
		]) {
			const entries = buildLayout(`bounded-${viewport.label}`, viewport.width, viewport.height, 120)
			for(const [index, entry] of entries.entries()) {
				assertInside(entry.landing, entry.input.bounds, entry.input.objectRadius, `${viewport.label} landing ${index}`)
				assertInside(entry.launch, entry.input.bounds, entry.input.objectRadius, `${viewport.label} launch ${index}`)
			}
		}
	})

	it('reflows the same seeded presentation when the canvas is resized', () => {
		const desktop = buildLayout('resize-seed', 1440, 720, 20)
		const portrait = buildLayout('resize-seed', 390, 844, 20)
		const desktopCenters = getHorizontalCenterBounds(desktop[0].input.bounds, OBJECT_RADIUS)
		const portraitCenters = getHorizontalCenterBounds(portrait[0].input.bounds, OBJECT_RADIUS)

		assert.ok(desktopCenters.maxX > portraitCenters.maxX * 3)
		assert.ok(desktop.some((entry, index) => Math.abs(entry.landing.x - portrait[index].landing.x) > 0.5))
		portrait.forEach((entry, index) => {
			assertInside(entry.landing, entry.input.bounds, OBJECT_RADIUS, `resized landing ${index}`)
			assertInside(entry.launch, entry.input.bounds, OBJECT_RADIUS, `resized launch ${index}`)
		})
	})

	it('keeps a non-inverted enclosure when the host is narrower than one body', () => {
		const radius = 0.9
		const bounds = computeDisplayViewportBounds({
			width: 80,
			height: 800,
			cameraHeight: DISPLAY_CAMERA_HEIGHT,
			cameraFov: DISPLAY_CAMERA_FOV,
			wallPadding: 1.35,
			minimumRadius: radius
		})
		const centers = getHorizontalCenterBounds(bounds, radius)
		assert.ok(bounds.halfX >= radius)
		assert.ok(centers.minX <= centers.maxX)
		assert.ok(centers.minZ <= centers.maxZ)
	})

	it('preserves the existing ground framing with the more distant camera', () => {
		const verticalHalfSpan = DISPLAY_CAMERA_HEIGHT * Math.tan(DISPLAY_CAMERA_FOV / 2)
		assert.ok(verticalHalfSpan > 4.1)
		assert.ok(verticalHalfSpan < 4.4)
	})
})
