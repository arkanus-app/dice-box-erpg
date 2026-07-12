import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'
import type { DisplayViewportBounds } from './viewportBounds'

export interface PhysicsBoundsSize {
	readonly width: number
	readonly height: number
	readonly depth: number
}

export interface StaticPhysicsBox {
	readonly body: PhysicsBody
	readonly mesh: Mesh
}

export interface PhysicsBoundsBox {
	readonly name: string
	readonly size: PhysicsBoundsSize
	readonly position: Vector3
}

export interface PhysicsBoundsLayout {
	readonly floor: PhysicsBoundsBox
	readonly walls: readonly [PhysicsBoundsBox, PhysicsBoundsBox, PhysicsBoundsBox, PhysicsBoundsBox]
}

export interface PhysicsBoundsLayoutInput {
	readonly bounds: DisplayViewportBounds
	readonly startingHeight: number
	readonly largestRadius: number
}

export const PHYSICS_WALL_THICKNESS = 0.6
const PHYSICS_FLOOR_THICKNESS = 2
const PHYSICS_BOUNDS_BOTTOM = -2

export const createPhysicsBoundsLayout = (
	input: PhysicsBoundsLayoutInput
): PhysicsBoundsLayout => {
	const { bounds } = input
	const thickness = PHYSICS_WALL_THICKNESS
	const spanX = Math.max(0.01, bounds.right - bounds.left)
	const spanZ = Math.max(0.01, bounds.south - bounds.north)
	const centerX = (bounds.left + bounds.right) / 2
	const centerZ = (bounds.north + bounds.south) / 2
	const largestRadius = Number.isFinite(input.largestRadius) ? Math.max(0, input.largestRadius) : 0
	const startingHeight = Number.isFinite(input.startingHeight) ? Math.max(0, input.startingHeight) : 0
	const top = Math.max(12, startingHeight + 5 + largestRadius)
	const wallHeight = top - PHYSICS_BOUNDS_BOTTOM
	const wallY = (top + PHYSICS_BOUNDS_BOTTOM) / 2
	const floor: PhysicsBoundsBox = {
		name: 'display-floor',
		size: {
			// Keep the large safety apron from v2.0.2. The walls define the
			// playable viewport, while the wider floor catches any temporary
			// solver overlap instead of allowing an endless fall.
			width: Math.max(24, spanX + thickness * 2),
			height: PHYSICS_FLOOR_THICKNESS,
			depth: Math.max(24, spanZ + thickness * 2)
		},
		position: new Vector3(centerX, -PHYSICS_FLOOR_THICKNESS / 2, centerZ)
	}
	const north: PhysicsBoundsBox = {
		name: 'display-wall-north',
		size: { width: spanX + thickness * 2, height: wallHeight, depth: thickness },
		position: new Vector3(centerX, wallY, bounds.north - thickness / 2)
	}
	const south: PhysicsBoundsBox = {
		name: 'display-wall-south',
		size: { width: spanX + thickness * 2, height: wallHeight, depth: thickness },
		position: new Vector3(centerX, wallY, bounds.south + thickness / 2)
	}
	const west: PhysicsBoundsBox = {
		name: 'display-wall-west',
		size: { width: thickness, height: wallHeight, depth: spanZ + thickness * 2 },
		position: new Vector3(bounds.left - thickness / 2, wallY, centerZ)
	}
	const east: PhysicsBoundsBox = {
		name: 'display-wall-east',
		size: { width: thickness, height: wallHeight, depth: spanZ + thickness * 2 },
		position: new Vector3(bounds.right + thickness / 2, wallY, centerZ)
	}
	return { floor, walls: [north, south, west, east] }
}

export const createStaticPhysicsBox = (
	scene: Scene,
	name: string,
	size: PhysicsBoundsSize,
	position: Vector3,
	material: { readonly friction: number; readonly restitution: number }
): StaticPhysicsBox => {
	const mesh = CreateBox(name, size, scene)
	mesh.position.copyFrom(position)
	mesh.isVisible = false
	mesh.isPickable = false
	const body = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene)
	// FromMesh uses the complete local dimensions. Passing size / 2 here creates
	// a collider with only half the intended width, height, and depth.
	const shape = PhysicsShapeBox.FromMesh(mesh)
	shape.material = material
	body.shape = shape
	body.setMassProperties({ mass: 0 })
	return { body, mesh }
}
