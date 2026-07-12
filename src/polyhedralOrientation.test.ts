import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Scene } from '@babylonjs/core/scene'
import {
	getFaceNormal,
	getSupportHeight,
	getTargetQuaternion
} from './renderers/PolyhedralFactory'

interface SerializedMesh {
	readonly name: string
	readonly [key: string]: unknown
}

interface DiceModel {
	readonly meshes: readonly SerializedMesh[]
	readonly colliderFaceMap: Readonly<Record<string, Readonly<Record<string, number>>>>
}

const SUPPORTED_POLYHEDRA = [4, 6, 8, 10, 12, 20] as const
// Babylon's anti-parallel unit-vector path keeps a tiny residual for faces
// whose source normal is almost exactly opposite the requested direction.
const ALIGNMENT_EPSILON = 1e-4

const loadDefaultModel = (): DiceModel => JSON.parse(readFileSync(
	new URL('../public/assets/dice-box/themes/default/default.json', import.meta.url),
	'utf8'
)) as DiceModel

const createCollider = (source: SerializedMesh, scene: Scene): Mesh => {
	const parsed = { ...source }
	delete parsed.physicsImpostor
	return Mesh.Parse(parsed, scene, '')
}

const getAggregateFaceNormal = (
	collider: Mesh,
	faceMap: Readonly<Record<string, number>>,
	value: number
): Vector3 => {
	const aggregate = Vector3.Zero()
	let triangleCount = 0
	for(const [triangle, faceValue] of Object.entries(faceMap)) {
		if(faceValue !== value) continue
		const normal = getFaceNormal(collider, Number(triangle))
		assert.ok(normal, `triangle ${triangle} for value ${String(value)} must have a valid normal`)
		aggregate.addInPlace(normal)
		triangleCount += 1
	}
	assert.ok(triangleCount > 0, `value ${String(value)} must have at least one mapped triangle`)
	assert.ok(aggregate.lengthSquared() > 0, `value ${String(value)} must have a non-zero aggregate normal`)
	return aggregate.normalize()
}

const getFaceValues = (faceMap: Readonly<Record<string, number>>): number[] =>
	[...new Set(Object.values(faceMap))].sort((left, right) => left - right)

describe('default polyhedral orientation data', () => {
	it('aligns every mapped result face with the expected vertical direction', () => {
		const model = loadDefaultModel()
		const engine = new NullEngine()
		const scene = new Scene(engine)

		try {
			for(const sides of SUPPORTED_POLYHEDRA) {
				const type = `d${String(sides)}`
				const source = model.meshes.find(mesh => mesh.name === `${type}_collider`)
				const faceMap = model.colliderFaceMap[type]
				assert.ok(source, `${type} collider must exist in the default model`)
				assert.ok(faceMap, `${type} face map must exist in the default model`)
				const collider = createCollider(source, scene)
				const expectedDirection = sides === 4 ? Vector3.Down() : Vector3.Up()

				for(const value of getFaceValues(faceMap)) {
					const aggregate = getAggregateFaceNormal(collider, faceMap, value)
					const target = getTargetQuaternion(collider, faceMap, value, sides === 4)
					const aligned = aggregate.applyRotationQuaternion(target)
					assert.ok(
						Vector3.Dot(aligned, expectedDirection) >= 1 - ALIGNMENT_EPSILON,
						`${type} value ${String(value)} was not aligned with ${sides === 4 ? 'Down' : 'Up'}`
					)
				}
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('computes a positive finite support height for every result orientation', () => {
		const model = loadDefaultModel()
		const engine = new NullEngine()
		const scene = new Scene(engine)

		try {
			for(const sides of SUPPORTED_POLYHEDRA) {
				const type = `d${String(sides)}`
				const source = model.meshes.find(mesh => mesh.name === `${type}_collider`)
				const faceMap = model.colliderFaceMap[type]
				assert.ok(source)
				assert.ok(faceMap)
				const collider = createCollider(source, scene)

				for(const value of getFaceValues(faceMap)) {
					const target = getTargetQuaternion(collider, faceMap, value, sides === 4)
					const height = getSupportHeight(collider, target)
					assert.ok(Number.isFinite(height), `${type} value ${String(value)} support height must be finite`)
					assert.ok(height > 0, `${type} value ${String(value)} support height must be positive`)
				}
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('preserves the selected result face after an arbitrary global yaw', () => {
		const model = loadDefaultModel()
		const engine = new NullEngine()
		const scene = new Scene(engine)
		const globalYaw = Quaternion.RotationAxis(Vector3.Up(), Math.PI * 0.731).normalize()

		try {
			for(const sides of SUPPORTED_POLYHEDRA) {
				const type = `d${String(sides)}`
				const source = model.meshes.find(mesh => mesh.name === `${type}_collider`)
				const faceMap = model.colliderFaceMap[type]
				assert.ok(source)
				assert.ok(faceMap)
				const collider = createCollider(source, scene)
				const expectedDirection = sides === 4 ? Vector3.Down() : Vector3.Up()
				const values = getFaceValues(faceMap)

				for(const selectedValue of values) {
					const target = getTargetQuaternion(collider, faceMap, selectedValue, sides === 4)
					const yawedTarget = globalYaw.multiply(target).normalize()
					const scores = values.map(value => ({
						score: Vector3.Dot(
							getAggregateFaceNormal(collider, faceMap, value).applyRotationQuaternion(yawedTarget),
							expectedDirection
						),
						value
					})).sort((left, right) => right.score - left.score)

					assert.equal(scores[0]?.value, selectedValue, `${type} yaw changed selected value ${String(selectedValue)}`)
					assert.ok(
						(scores[0]?.score ?? 0) >= 1 - ALIGNMENT_EPSILON,
						`${type} yaw tilted selected value ${String(selectedValue)} away from vertical`
					)
				}
			}
		} finally {
			scene.dispose()
			engine.dispose()
		}
	})

	it('covers each native polyhedron once and intentionally leaves d100 to its d10 geometry path', () => {
		assert.deepEqual(SUPPORTED_POLYHEDRA, [4, 6, 8, 10, 12, 20])
		assert.equal(SUPPORTED_POLYHEDRA.includes(100 as never), false)
	})
})
