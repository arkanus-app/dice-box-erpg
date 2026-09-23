import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { createShape, faceTargetQuaternion, planesFromCollider, readFace, supportHeight, type DiceShape } from './engine/shape'
import { qmul, qrot, quatFromAxisAngle } from './engine/vector'

interface SerializedMesh { readonly name: string; readonly positions: number[]; readonly indices: number[] }
interface DiceModel {
	readonly meshes: readonly SerializedMesh[]
	readonly colliderFaceMap: Readonly<Record<string, Readonly<Record<string, number>>>>
}

const model = JSON.parse(readFileSync(new URL('../public/assets/dice-box/themes/default/default.json', import.meta.url), 'utf8')) as DiceModel
const toRightHanded = (values: readonly number[]): number[] => values.map((v, i) => i % 3 === 2 ? -v : v)
const shapeOf = (type: string, scale = 5.1): DiceShape => {
	const collider = model.meshes.find(mesh => mesh.name === `${type}_collider`)!
	return createShape(planesFromCollider(toRightHanded(collider.positions), collider.indices, model.colliderFaceMap[type]!, scale), { readDown: type === 'd4' })
}
const EXPECTED = { d4: [4, 12], d6: [6, 24], d8: [8, 24], d10: [10, 10], d12: [12, 60], d20: [20, 60], d100: [10, 10] } as const

describe('default polyhedral orientation data', () => {
	it('builds each hull with every mapped value and its full rotation group', () => {
		for(const [type, [faces, group]] of Object.entries(EXPECTED)) {
			const shape = shapeOf(type)
			assert.equal(shape.faces.length, faces, `${type} faces`)
			assert.equal(shape.symmetries.length, group, `${type} symmetry group`)
			assert.deepEqual(
				shape.faces.map(face => face.value ?? -1).sort((a, b) => a - b),
				[...new Set(Object.values(model.colliderFaceMap[type]!))].sort((a, b) => a - b)
			)
		}
	})

	it('aligns every mapped result face with the reading direction', () => {
		for(const type of Object.keys(EXPECTED)) {
			const shape = shapeOf(type)
			for(const face of shape.faces) {
				const reading = readFace(shape, faceTargetQuaternion(shape, face.value!))
				assert.equal(reading.face.value, face.value, `${type}=${String(face.value)}`)
				assert.ok(reading.alignment > 1 - 1e-4, `${type}=${String(face.value)} alignment ${reading.alignment}`)
			}
		}
	})

	it('computes a positive finite support height for every result orientation', () => {
		for(const type of Object.keys(EXPECTED)) {
			const shape = shapeOf(type)
			for(const face of shape.faces) {
				const height = supportHeight(shape, faceTargetQuaternion(shape, face.value!))
				assert.ok(Number.isFinite(height) && height > 0, `${type}=${String(face.value)} support ${height}`)
			}
		}
	})

	it('preserves the selected result face after an arbitrary global yaw', () => {
		for(const type of Object.keys(EXPECTED)) {
			const shape = shapeOf(type)
			for(const face of shape.faces) {
				const pose = qmul(quatFromAxisAngle([0, 1, 0], 2.37), faceTargetQuaternion(shape, face.value!))
				assert.equal(readFace(shape, pose).face.value, face.value)
			}
		}
	})

	it('maps any landed face onto any requested face with a symmetry of the hull', () => {
		for(const type of Object.keys(EXPECTED)) {
			const shape = shapeOf(type)
			for(const target of shape.faces) for(const landed of shape.faces) {
				const found = shape.symmetries.some(q => {
					const mapped = qrot(q, target.normal)
					return mapped[0] * landed.normal[0] + mapped[1] * landed.normal[1] + mapped[2] * landed.normal[2] > 0.99
				})
				assert.ok(found, `${type}: ${String(target.value)} -> ${String(landed.value)}`)
			}
		}
	})
})
