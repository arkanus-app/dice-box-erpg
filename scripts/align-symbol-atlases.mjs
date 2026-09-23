// Corrige a orientação dos glyphs nos atlas simbólicos (V5, Assimilação, Fate).
//
// O atlas numérico padrão tem cada dígito girado para acompanhar a sua face;
// os SVGs simbólicos foram gerados só com translate + scale, então o glyph
// fica torto em relação à face (a cruz do V5 atravessa a pipa do d10 na
// diagonal). Para cada face, este script calcula pelo UV do modelo:
//   - o centro da face no atlas;
//   - a direção "para cima" da face (d10: rumo ao ápice; d6: aresta mais
//     próxima; d8/d12/d20: vértice mais próximo) convertida para o atlas;
// e reescreve o transform de cada glyph girando-o em torno do centro da face.
//
// Idempotente: glyphs já alinhados não casam mais com os padrões originais.
// Também grava glyph-orientation.json e faceAtlas.orientation no tema.
//
// Uso: node scripts/align-symbol-atlases.mjs [pasta-dos-temas] [pasta-de-saída]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const positional = process.argv.slice(2).filter(argument => !argument.startsWith('--'))
const themesDir = path.resolve(positional[0] ?? path.join(root, 'public/assets/dice-box/themes'))
const outDir = path.resolve(positional[1] ?? themesDir)
const ATLAS = 1024

const model = JSON.parse(fs.readFileSync(path.join(themesDir, 'default', 'default.json'), 'utf8'))
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = a => scale(a, 1 / Math.hypot(...a))

// Espaço destro, como no render (o .babylon é canhoto).
const P = (mesh, i) => [mesh.positions[i * 3], mesh.positions[i * 3 + 1], -mesh.positions[i * 3 + 2]]
// Pixel do atlas: flipY (v = 1 no topo da imagem), como Texture(invertY) do Babylon.
const px = (mesh, i) => [mesh.uvs[i * 2] * ATLAS, (1 - mesh.uvs[i * 2 + 1]) * ATLAS]

const facesOf = type => {
	const collider = model.meshes.find(m => m.name === `${type}_collider`)
	const visual = model.meshes.find(m => m.name === type)
	const byValue = new Map()
	for(const [triangle, value] of Object.entries(model.colliderFaceMap[type])) {
		const t = Number(triangle)
		const [a, b, c] = [0, 1, 2].map(k => P(collider, collider.indices[t * 3 + k]))
		let n = cross(sub(b, a), sub(c, a))
		if(dot(n, add(add(a, b), c)) < 0) n = scale(n, -1)
		byValue.set(value, add(byValue.get(value) ?? [0, 0, 0], n))
	}
	// Vértices do collider (sem repetição) para achar ápices/arestas.
	const colliderVerts = []
	for(let i = 0; i < collider.positions.length / 3; i++) {
		const v = P(collider, i)
		if(!colliderVerts.some(u => Math.hypot(...sub(u, v)) < 1e-3)) colliderVerts.push(v)
	}
	const faces = []
	for(const [value, sum] of byValue) {
		const normal = norm(sum)
		const d = Math.max(...colliderVerts.map(v => dot(normal, v)))
		const members = colliderVerts.filter(v => Math.abs(dot(normal, v) - d) < 0.004)
		// Triângulos visuais da face: centro no atlas e jacobiano 3D -> pixel.
		let area = 0, center = [0, 0], best = null
		for(let t = 0; t < visual.indices.length / 3; t++) {
			const ids = [0, 1, 2].map(k => visual.indices[t * 3 + k])
			const [p0, p1, p2] = ids.map(i => P(visual, i))
			let n = cross(sub(p1, p0), sub(p2, p0))
			const a = Math.hypot(...n) / 2
			if(a < 1e-12) continue
			if(dot(n, add(add(p0, p1), p2)) < 0) n = scale(n, -1)
			if(dot(norm(n), normal) < 0.985) continue
			const [q0, q1, q2] = ids.map(i => px(visual, i))
			center = [center[0] + (q0[0] + q1[0] + q2[0]) / 3 * a, center[1] + (q0[1] + q1[1] + q2[1]) / 3 * a]
			area += a
			if(!best || a > best.area) best = { area: a, e1: sub(p1, p0), e2: sub(p2, p0), d1: [q1[0] - q0[0], q1[1] - q0[1]], d2: [q2[0] - q0[0], q2[1] - q0[1]] }
		}
		center = [center[0] / area, center[1] / area]
		const { e1, e2, d1, d2 } = best
		const g11 = dot(e1, e1), g12 = dot(e1, e2), g22 = dot(e2, e2), det = g11 * g22 - g12 * g12
		const toPixel = w => {
			const b1 = dot(e1, w), b2 = dot(e2, w)
			const c1 = (g22 * b1 - g12 * b2) / det, c2 = (g11 * b2 - g12 * b1) / det
			return [c1 * d1[0] + c2 * d2[0], c1 * d1[1] + c2 * d2[1]]
		}
		// Espelhamento: direita x cima (em 3D) precisa apontar para fora da face.
		const inPlane = w => sub(w, scale(normal, dot(w, normal)))
		const toModel = pixel => {
			// Inverte o jacobiano no plano da face (dois vetores de base).
			const a1 = toPixel(inPlane(norm(e1))), a2 = toPixel(inPlane(norm(cross(normal, e1))))
			const detA = a1[0] * a2[1] - a1[1] * a2[0]
			const s = (pixel[0] * a2[1] - pixel[1] * a2[0]) / detA, r = (a1[0] * pixel[1] - a1[1] * pixel[0]) / detA
			return add(scale(norm(e1), s), scale(norm(cross(normal, e1)), r))
		}
		const mirrored = dot(cross(toModel([1, 0]), toModel([0, -1])), normal) < 0
		faces.push({ type, value, normal, members, center, toPixel, toModel, mirrored })
	}
	// Ápices do d10: vértices compartilhados por 5 faces.
	for(const face of faces) {
		const pairs = face.members.flatMap((v, i) => face.members.slice(i + 1).map(u => [v, u, Math.hypot(...sub(u, v))]))
		const edge = Math.min(...pairs.map(p => p[2]))
		face.candidates = type === 'd10' || type === 'd100'
			? [face.members.reduce((best, v) => {
				const count = faces.filter(f => f.members.some(u => Math.hypot(...sub(u, v)) < 1e-3)).length
				return count > best.count ? { v, count } : best
			}, { v: null, count: -1 }).v]
			: type === 'd6'
				? pairs.filter(p => p[2] < edge * 1.2).map(([v, u]) => scale(add(v, u), 0.5))
				: face.members
		const centroid = scale(face.members.reduce(add, [0, 0, 0]), 1 / face.members.length)
		face.directions = face.candidates.map(point => {
			const d = sub(point, centroid)
			return norm(sub(d, scale(face.normal, dot(d, face.normal))))
		})
	}
	return faces
}

const allFaces = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].flatMap(facesOf)

// Rotação SVG (graus, horário com y para baixo) que leva o "para cima" do glyph
// (0,-1) até a direção desejada em pixels.
const rotationFor = (face, glyphUp = [0, -1]) => {
	let bestDir = null, bestAngle = Infinity
	for(const dir of face.directions) {
		const p = face.toPixel(dir)
		const angle = Math.atan2(p[0], -p[1]) - Math.atan2(glyphUp[0], -glyphUp[1])
		const wrapped = Math.atan2(Math.sin(angle), Math.cos(angle))
		if(Math.abs(wrapped) < Math.abs(bestAngle)) { bestAngle = wrapped; bestDir = dir }
	}
	return { degrees: bestAngle * 180 / Math.PI, up3d: bestDir }
}

const report = []
for(const theme of fs.readdirSync(themesDir)) {
	const configPath = path.join(themesDir, theme, 'theme.config.json')
	if(!fs.existsSync(configPath)) continue
	const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
	if(!config.faceAtlas) continue
	const types = config.diceAvailable
	const faces = allFaces.filter(f => types.includes(f.type))
	const orientation = {}
	for(const file of new Set(Object.values(config.material.diffuseTexture))) {
		const source = fs.readFileSync(path.join(themesDir, theme, file), 'utf8')
		// Três formatos gerados hoje:
		//  V5:  <g data-face=".." transform="translate(X Y) scale(S)"><use href="#v5-.."/></g>  (caixa 250×250)
		//  Fate: <g .. transform="translate(X Y) scale(S)"><path d="M-.76 0H.76"/></g>          (centrado na origem)
		//  Assimilação: <use href="#glyph-.." x=".." y=".." width=".." height=".."/>
		const glyphs = []
		for(const m of source.matchAll(/<g([^>]*?)transform="translate\(([-\d.]+)[ ,]+([-\d.]+)\)\s*scale\(([-\d.]+)\)"([^>]*)>(<use href="#v5-[^"]*"\/>|<path[^>]*\/>)/g)) {
			const [text, before, x, y, sc, after, inner] = m
			const S = Number(sc)
			const box = inner.startsWith('<use') ? 125 * S : 0
			glyphs.push({ text, kind: 'g', before, after, inner, S, cx: Number(x) + box, cy: Number(y) + box, box, face: /data-face="(\d+)"/.exec(before)?.[1] })
		}
		for(const m of source.matchAll(/<use href="(#glyph-[^"]*)" x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"\/>/g)) {
			const [text, href, x, y, w, h] = m
			glyphs.push({ text, kind: 'use', href, w: Number(w), h: Number(h), cx: Number(x) + Number(w) / 2, cy: Number(y) + Number(h) / 2 })
		}
		// Cada glyph pertence à face cujo centro no atlas está mais perto.
		const byFace = new Map()
		for(const glyph of glyphs) {
			const face = faces.reduce((best, f) => Math.hypot(f.center[0] - glyph.cx, f.center[1] - glyph.cy) < Math.hypot(best.center[0] - glyph.cx, best.center[1] - glyph.cy) ? f : best)
			if(!byFace.has(face)) byFace.set(face, [])
			byFace.get(face).push(glyph)
		}
		let output = source
		for(const [face, list] of byFace) {
			const { degrees, up3d } = rotationFor(face)
			orientation[face.type] ??= {}
			orientation[face.type][face.value] = up3d.map(v => Number(v.toFixed(5)))
			// Centro do arranjo (1 ou mais glyphs) vai para o centro da face, girado.
			const ax = list.reduce((a, g) => a + g.cx, 0) / list.length
			const ay = list.reduce((a, g) => a + g.cy, 0) / list.length
			const [cx, cy] = face.center
			const mirror = face.mirrored ? ' scale(-1 1)' : ''
			const place = `translate(${cx.toFixed(3)} ${cy.toFixed(3)}) rotate(${degrees.toFixed(2)})${mirror}`
			for(const g of list) {
				const ox = g.cx - ax, oy = g.cy - ay
				const replacement = g.kind === 'g'
					? `<g${g.before}transform="${place} translate(${(ox - g.box).toFixed(3)} ${(oy - g.box).toFixed(3)}) scale(${g.S})"${g.after}>${g.inner}`
					: `<use href="${g.href}" x="${(ox - g.w / 2).toFixed(3)}" y="${(oy - g.h / 2).toFixed(3)}" width="${g.w}" height="${g.h}" transform="${place}"/>`
				output = output.replace(g.text, replacement)
				report.push({ theme, file, face: `${face.type}=${face.value}`, rotation: Number(degrees.toFixed(1)), offsetFromFaceCenter: Number(Math.hypot(ax - cx, ay - cy).toFixed(1)), glyphs: list.length, mirrored: face.mirrored, dataFace: g.face })
			}
		}
		fs.mkdirSync(path.join(outDir, theme), { recursive: true })
		fs.writeFileSync(path.join(outDir, theme, file), output)
	}
	// Direção "para cima" de cada glyph no espaço do modelo (destro), para o
	// render escolher a rotação de simetria que deixa o símbolo de pé na tela.
	// Sem glyphs novos (atlas já alinhado), mantém o arquivo existente.
	if(Object.keys(orientation).length) {
		fs.writeFileSync(path.join(outDir, theme, 'glyph-orientation.json'), `${JSON.stringify(orientation, null, '\t')}\n`)
		const outConfig = path.join(outDir, theme, 'theme.config.json')
		const current = JSON.parse(fs.readFileSync(fs.existsSync(outConfig) ? outConfig : configPath, 'utf8'))
		if(current.faceAtlas && current.faceAtlas.orientation !== 'glyph-orientation.json') {
			current.faceAtlas = { ...current.faceAtlas, orientation: 'glyph-orientation.json' }
			fs.writeFileSync(outConfig, `${JSON.stringify(current, null, 2)}\n`)
		}
	}
}

const byTheme = {}
for(const r of report) (byTheme[r.theme] ??= []).push(r)
for(const [theme, rows] of Object.entries(byTheme)) {
	const rotations = rows.map(r => Math.abs(r.rotation))
	console.log(`${theme}: ${rows.length} glyphs | rotação aplicada média ${(rotations.reduce((a, b) => a + b, 0) / rows.length).toFixed(0)}°, máx ${Math.max(...rotations).toFixed(0)}° | espelhados ${rows.filter(r => r.mirrored).length} | maior distância glyph-centro ${Math.max(...rows.map(r => r.offsetFromFaceCenter)).toFixed(0)} px`)
}
if(process.argv.includes('--verbose')) console.table(report.filter(r => r.file.includes('light')))
