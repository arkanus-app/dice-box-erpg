import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { chooseSymmetry, createShape, faceTargetQuaternion, findFace, planesFromCollider } from './engine/shape'
import { qmul, qrot, quatFromAxisAngle, type Vec3 } from './engine/vector'

interface SerializedMesh { readonly name: string; readonly positions: number[]; readonly indices: number[] }
const themes = new URL('../public/assets/dice-box/themes/', import.meta.url)
const model = JSON.parse(readFileSync(new URL('default/default.json', themes), 'utf8')) as {
	readonly meshes: readonly SerializedMesh[]
	readonly colliderFaceMap: Readonly<Record<string, Readonly<Record<string, number>>>>
}
const orientation = JSON.parse(readFileSync(new URL('default/glyph-orientation.json', themes), 'utf8')) as Record<string, Record<string, Vec3>>
const mirror = (values: readonly number[]): Float32Array => Float32Array.from(values, (value, index) => index % 3 === 2 ? -value : value)

const shapeOf = (type: string) => {
	const collider = model.meshes.find(mesh => mesh.name === `${type}_collider`)!
	return createShape(planesFromCollider(mirror(collider.positions), collider.indices, model.colliderFaceMap[type]!, 1), {})
}

describe('label orientation of the default theme', () => {
	it('is declared by both numeric themes', () => {
		for(const theme of ['default', 'default-v2']) {
			const config = JSON.parse(readFileSync(new URL(`${theme}/theme.config.json`, themes), 'utf8')) as { faceAtlas?: { orientation?: string } }
			assert.match(config.faceAtlas?.orientation ?? '', /glyph-orientation\.json$/, theme)
		}
	})

	it('gives every numbered face an up direction on its own plane', () => {
		for(const type of ['d6', 'd8', 'd10', 'd12', 'd20', 'd100']) {
			const shape = shapeOf(type)
			const valued = shape.faces.filter(face => face.value !== null)
			assert.equal(Object.keys(orientation[type] ?? {}).length, valued.length, `${type}: one direction per face`)
			for(const face of valued) {
				const up = orientation[type]![String(face.value)]!
				assert.ok(Math.abs(Math.hypot(...up) - 1) < 1e-4, `${type} ${face.value}: unit length`)
				assert.ok(Math.abs(up[0] * face.normal[0] + up[1] * face.normal[1] + up[2] * face.normal[2]) < 1e-4, `${type} ${face.value}: lies on the face`)
			}
		}
	})

	it('turns a landed die so its label reads upright whatever its yaw', () => {
		// Symmetric faces allow a choice: 4-fold squares keep the label within 45°, 3-fold triangles within 60°,
		// 5-fold pentagons within 36° (plus 2° for the measured directions and the model's own asymmetry).
		for(const [type, limit] of [['d6', 45], ['d8', 60], ['d12', 36], ['d20', 60]] as const) {
			const shape = shapeOf(type)
			for(const face of shape.faces) {
				if(face.value === null) continue
				const up = orientation[type]![String(face.value)]!
				const target = findFace(shape, face.value)!
				for(let step = 0; step < 12; step++) {
					const landed = qmul(quatFromAxisAngle([0, 1, 0], step * Math.PI / 6 + 0.17), faceTargetQuaternion(shape, face.value))
					const g = chooseSymmetry(shape, landed, target, target, up)!
					const screenUp = qrot(landed, qrot(g, up))
					// The camera looks down with -z up on screen.
					assert.ok(-screenUp[2] >= Math.cos((limit + 2) * Math.PI / 180), `${type} ${face.value}, yaw step ${step}`)
				}
			}
		}
	})
})
