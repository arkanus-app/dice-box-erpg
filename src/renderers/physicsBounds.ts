import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody'
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape'
import type { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

export interface PhysicsBoundsSize {
	readonly width: number
	readonly height: number
	readonly depth: number
}

export interface StaticPhysicsBox {
	readonly body: PhysicsBody
	readonly mesh: Mesh
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
