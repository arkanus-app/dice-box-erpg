import { createShape, planesFromCollider } from '../../src/engine/shape'

/**
 * Finds how each label is drawn in a raster face atlas, so the viewer can
 * present numbers upright: for every face it renders the face's value as text
 * at every angle and keeps the one that best matches the atlas pixels of that
 * face. The value is known, so a 6 is never taken for a 9. The result is the
 * label's "up" in the model frame, the `faceAtlas.orientation` format.
 *
 * Runs in a browser (canvas text and image decoding): import it from a page
 * served by `npm run dev`, pass the model and atlas URLs and save the returned
 * `orientation` as the theme's `glyph-orientation.json`.
 */

interface SerializedMesh {
	readonly name: string
	readonly positions: readonly number[]
	readonly normals?: readonly number[]
	readonly uvs?: readonly number[]
	readonly indices: readonly number[]
}

interface SerializedModel {
	readonly meshes: readonly SerializedMesh[]
	readonly colliderFaceMap: Readonly<Record<string, Readonly<Record<string, number>>>>
}

export interface GlyphMatch {
	readonly type: string
	readonly value: number
	/** Clockwise rotation of the label in the atlas image, degrees. */
	readonly angle: number
	/** Cosine similarity of the best match (1 = identical masks). */
	readonly score: number
	/** Best score at least 30° away (how clear the choice was). */
	readonly runnerUp: number
}

export interface GlyphOrientationResult {
	readonly orientation: Record<string, Record<string, [number, number, number]>>
	readonly matches: readonly GlyphMatch[]
}

const GRID = 40
const FONT = '"Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif'

/** Texts a face may carry: d100 tens show 00–90, a d10 may show 10 or 0. */
const labelsFor = (type: string, value: number): string[] => {
	if(type === 'd100') return [value === 0 || value === 100 ? '00' : String(value)]
	if(type === 'd10' && value === 10) return ['10', '0']
	return [String(value)]
}

const mirrorZ = (values: readonly number[]): Float32Array => Float32Array.from(values, (value, index) => index % 3 === 2 ? -value : value)

/** Coverage grid of a label rendered as text, rotated clockwise by `angle` and fitted to the grid. */
const templateGrid = (text: string, angle: number): Float32Array => {
	const size = 160
	const canvas = document.createElement('canvas')
	canvas.width = canvas.height = size * 2
	const context = canvas.getContext('2d', { willReadFrequently: true })!
	context.font = `bold 120px ${FONT}`
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	context.fillStyle = '#fff'
	context.translate(size, size)
	context.rotate(angle * Math.PI / 180)
	context.fillText(text, 0, 0)
	const pixels = context.getImageData(0, 0, size * 2, size * 2).data
	const points: [number, number][] = []
	for(let y = 0; y < size * 2; y++) for(let x = 0; x < size * 2; x++) if(pixels[(y * size * 2 + x) * 4 + 3]! > 127) points.push([x, y])
	return rasterize(points, (x, y) => {
		const ix = Math.round(x), iy = Math.round(y)
		return ix >= 0 && iy >= 0 && ix < size * 2 && iy < size * 2 && pixels[(iy * size * 2 + ix) * 4 + 3]! > 127 ? 1 : 0
	})
}

/** Samples a mask around the centroid of its points, scaled to the farthest point. */
const rasterize = (points: readonly [number, number][], inside: (x: number, y: number) => number): Float32Array => {
	let cx = 0, cy = 0
	for(const [x, y] of points) { cx += x; cy += y }
	cx /= Math.max(1, points.length); cy /= Math.max(1, points.length)
	let radius = 1
	for(const [x, y] of points) radius = Math.max(radius, Math.hypot(x - cx, y - cy))
	const grid = new Float32Array(GRID * GRID)
	for(let gy = 0; gy < GRID; gy++) for(let gx = 0; gx < GRID; gx++) {
		grid[gy * GRID + gx] = inside(cx + ((gx + 0.5) / GRID * 2 - 1) * radius, cy + ((gy + 0.5) / GRID * 2 - 1) * radius)
	}
	return grid
}

const similarity = (a: Float32Array, b: Float32Array): number => {
	let ab = 0, aa = 0, bb = 0
	for(let i = 0; i < a.length; i++) { ab += a[i]! * b[i]!; aa += a[i]! * a[i]!; bb += b[i]! * b[i]! }
	return ab / Math.sqrt(Math.max(1e-9, aa * bb))
}

const insideTriangle = (px: number, py: number, t: readonly number[]): boolean => {
	const [ax, ay, bx, by, cx, cy] = t as [number, number, number, number, number, number]
	const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by)
	const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy)
	const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay)
	return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))
}

export const detectGlyphOrientation = async (options: {
	readonly model: string
	readonly atlas: string
	readonly types?: readonly string[]
}): Promise<GlyphOrientationResult> => {
	const model = await (await fetch(options.model)).json() as SerializedModel
	const image = new Image()
	image.src = options.atlas
	await image.decode()
	const width = image.naturalWidth, height = image.naturalHeight
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const context = canvas.getContext('2d', { willReadFrequently: true })!
	context.drawImage(image, 0, 0)
	const alpha = context.getImageData(0, 0, width, height).data
	const orientation: Record<string, Record<string, [number, number, number]>> = {}
	const matches: GlyphMatch[] = []
	const templates = new Map<string, Float32Array>()
	const template = (text: string, angle: number): Float32Array => {
		const key = `${text}@${angle}`
		let grid = templates.get(key)
		if(!grid) templates.set(key, grid = templateGrid(text, angle))
		return grid
	}

	for(const type of options.types ?? ['d6', 'd8', 'd10', 'd12', 'd20', 'd100']) {
		const visual = model.meshes.find(mesh => mesh.name === type)
		const collider = model.meshes.find(mesh => mesh.name === `${type}_collider`)
		const faceMap = model.colliderFaceMap[type]
		if(!visual?.normals || !visual.uvs || !collider || !faceMap) continue
		const shape = createShape(planesFromCollider(mirrorZ(collider.positions), collider.indices, faceMap, 1), {})
		const positions = mirrorZ(visual.positions), normals = mirrorZ(visual.normals), uvs = visual.uvs, indices = visual.indices
		// Per face: its triangles in atlas pixels and the model-space directions of +u and +v.
		const faces = new Map<number, { triangles: number[][]; tu: number[]; tv: number[]; normal: readonly number[] }>()
		for(let t = 0; t + 2 < indices.length; t += 3) {
			const a = indices[t]!, b = indices[t + 1]!, c = indices[t + 2]!
			let nx = normals[a * 3]! + normals[b * 3]! + normals[c * 3]!
			let ny = normals[a * 3 + 1]! + normals[b * 3 + 1]! + normals[c * 3 + 1]!
			let nz = normals[a * 3 + 2]! + normals[b * 3 + 2]! + normals[c * 3 + 2]!
			const nl = Math.hypot(nx, ny, nz) || 1
			nx /= nl; ny /= nl; nz /= nl
			let face: (typeof shape.faces)[number] | undefined, best = 0.97
			for(const candidate of shape.faces) {
				const d = nx * candidate.normal[0] + ny * candidate.normal[1] + nz * candidate.normal[2]
				if(d > best) { best = d; face = candidate }
			}
			if(!face || face.value === null) continue
			const e1 = [0, 1, 2].map(k => positions[b * 3 + k]! - positions[a * 3 + k]!)
			const e2 = [0, 1, 2].map(k => positions[c * 3 + k]! - positions[a * 3 + k]!)
			const du1 = uvs[b * 2]! - uvs[a * 2]!, dv1 = uvs[b * 2 + 1]! - uvs[a * 2 + 1]!
			const du2 = uvs[c * 2]! - uvs[a * 2]!, dv2 = uvs[c * 2 + 1]! - uvs[a * 2 + 1]!
			const det = du1 * dv2 - du2 * dv1
			if(Math.abs(det) < 1e-12) continue
			const area = Math.hypot(e1[1]! * e2[2]! - e1[2]! * e2[1]!, e1[2]! * e2[0]! - e1[0]! * e2[2]!, e1[0]! * e2[1]! - e1[1]! * e2[0]!)
			const entry = faces.get(face.value) ?? { triangles: [], tu: [0, 0, 0], tv: [0, 0, 0], normal: face.normal }
			for(let k = 0; k < 3; k++) {
				entry.tu[k]! += (e1[k]! * dv2 - e2[k]! * dv1) / det * area
				entry.tv[k]! += (e2[k]! * du1 - e1[k]! * du2) / det * area
			}
			// Texture v grows upwards (images are uploaded flipped): pixel y = (1 − v) · height.
			entry.triangles.push([a, b, c].flatMap(index => [uvs[index * 2]! * width, (1 - uvs[index * 2 + 1]!) * height]))
			faces.set(face.value, entry)
		}

		for(const [value, face] of faces) {
			const points: [number, number][] = []
			const inFace = (x: number, y: number): boolean => face.triangles.some(triangle => insideTriangle(x, y, triangle))
			let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
			for(const triangle of face.triangles) for(let k = 0; k < 6; k += 2) {
				minX = Math.min(minX, triangle[k]!); maxX = Math.max(maxX, triangle[k]!)
				minY = Math.min(minY, triangle[k + 1]!); maxY = Math.max(maxY, triangle[k + 1]!)
			}
			for(let y = Math.max(0, Math.floor(minY)); y <= Math.min(height - 1, Math.ceil(maxY)); y++) {
				for(let x = Math.max(0, Math.floor(minX)); x <= Math.min(width - 1, Math.ceil(maxX)); x++) {
					if(alpha[(y * width + x) * 4 + 3]! > 127 && inFace(x + 0.5, y + 0.5)) points.push([x, y])
				}
			}
			if(points.length < 12) continue
			const glyph = rasterize(points, (x, y) => {
				const ix = Math.round(x), iy = Math.round(y)
				return ix >= 0 && iy >= 0 && ix < width && iy < height && alpha[(iy * width + ix) * 4 + 3]! > 127 && inFace(ix + 0.5, iy + 0.5) ? 1 : 0
			})
			let bestAngle = 0, bestScore = -1
			const scores = new Map<number, number>()
			for(const text of labelsFor(type, value)) {
				for(let angle = 0; angle < 360; angle += 3) {
					const score = similarity(glyph, template(text, angle))
					scores.set(angle, Math.max(scores.get(angle) ?? -1, score))
					if(score > bestScore) { bestScore = score; bestAngle = angle }
				}
				for(let angle = bestAngle - 3; angle <= bestAngle + 3; angle += 0.5) {
					const score = similarity(glyph, template(text, angle))
					if(score > bestScore) { bestScore = score; bestAngle = angle }
				}
			}
			let runnerUp = -1
			for(const [angle, score] of scores) {
				const gap = Math.abs(((angle - bestAngle) % 360 + 540) % 360 - 180)
				if(gap >= 30) runnerUp = Math.max(runnerUp, score)
			}
			// The label's up in the image, as a texture-space direction, then in the model frame.
			const radians = bestAngle * Math.PI / 180
			const du = Math.sin(radians) / width, dv = Math.cos(radians) / height
			let up = [0, 1, 2].map(k => face.tu[k]! * du + face.tv[k]! * dv)
			const along = up[0]! * face.normal[0]! + up[1]! * face.normal[1]! + up[2]! * face.normal[2]!
			up = up.map((component, k) => component - face.normal[k]! * along)
			const length = Math.hypot(up[0]!, up[1]!, up[2]!) || 1
			orientation[type] ??= {}
			orientation[type]![String(value)] = up.map(component => Math.round(component / length * 1e5) / 1e5) as [number, number, number]
			matches.push({ type, value, angle: bestAngle, score: Math.round(bestScore * 1000) / 1000, runnerUp: Math.round(runnerUp * 1000) / 1000 })
		}
	}
	return { orientation, matches }
}
