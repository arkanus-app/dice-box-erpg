// Strips theme models to what the v3 renderer reads: positions, normals, uvs
// and indices of each die, positions and indices of each collider, and the
// collider face map. Tangents, collider normals and Babylon scene metadata
// are dropped, and similar meshes are stored side by side (d100 after d10,
// colliders together) so gzip's 32 KB window finds what they share. Usage: node scripts/slim-models.mjs [model.json ...]
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const themes = path.join(root, 'public/assets/dice-box/themes')

const models = process.argv.slice(2).length
	? process.argv.slice(2).map(file => path.resolve(file))
	: readdirSync(themes).flatMap(theme => {
		const directory = path.join(themes, theme)
		if(!statSync(directory).isDirectory()) return []
		return readdirSync(directory).filter(file => file.endsWith('.json') && file !== 'theme.config.json' && !file.startsWith('glyph-'))
			.map(file => path.join(directory, file))
	})

const order = mesh => {
	const collider = mesh.name.endsWith('_collider')
	const sides = Number(mesh.name.replace(/_collider$/, '').slice(1))
	return (collider ? 1000 : 0) + (sides === 100 ? 10.5 : Number.isFinite(sides) ? sides : 500)
}

for(const file of models) {
	const source = readFileSync(file)
	const model = JSON.parse(source.toString('utf8'))
	if(!Array.isArray(model.meshes) || !model.colliderFaceMap) continue
	const slim = {
		meshes: [...model.meshes].sort((a, b) => order(a) - order(b)).map(mesh => mesh.name.endsWith('_collider')
			? { name: mesh.name, positions: mesh.positions, indices: mesh.indices }
			: { name: mesh.name, positions: mesh.positions, normals: mesh.normals, uvs: mesh.uvs, indices: mesh.indices }),
		colliderFaceMap: model.colliderFaceMap
	}
	const output = Buffer.from(JSON.stringify(slim))
	writeFileSync(file, output)
	const gzip = buffer => gzipSync(buffer, { level: 9 }).length
	console.log(`${path.relative(root, file)}: ${source.length} → ${output.length} B (gzip ${gzip(source)} → ${gzip(output)} B)`)
}
