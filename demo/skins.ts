/**
 * Procedural sample skins for the test page and the workshop (no image files
 * needed). Each one is a tileable 256² canvas exported as a data URL, like an
 * uploaded image.
 */

type Rgb = readonly [number, number, number]

const SIZE = 256

/** Tileable value noise with `period` cells per side. */
const valueNoise = (seed: number, period: number): ((x: number, y: number) => number) => {
	const grid = Float32Array.from({ length: period * period }, (_, index) => {
		const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453
		return value - Math.floor(value)
	})
	const at = (i: number, j: number): number => grid[((j % period + period) % period) * period + ((i % period + period) % period)]!
	return (x: number, y: number): number => {
		const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0
		const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
		const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx
		const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx
		return top + (bottom - top) * sy
	}
}

/** Fractal noise in 0..1 over a tile of SIZE pixels. */
const fractal = (seed: number, base: number, octaves = 5): ((x: number, y: number) => number) => {
	const layers = Array.from({ length: octaves }, (_, octave) => valueNoise(seed + octave * 17, base << octave))
	return (x: number, y: number): number => {
		let value = 0, amplitude = 0.5, total = 0
		layers.forEach((noise, octave) => {
			const cells = base << octave
			value += noise(x / SIZE * cells, y / SIZE * cells) * amplitude
			total += amplitude
			amplitude *= 0.5
		})
		return value / total
	}
}

/** Hash of an integer cell in 0..1. */
const hash = (x: number, y: number, seed: number): number => {
	const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
	return value - Math.floor(value)
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const smooth = (edge0: number, edge1: number, value: number): number => {
	const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
	return t * t * (3 - 2 * t)
}
/** 1 on the mid-line of a noise field, 0 far from it: veins and cracks. */
const ridge = (value: number): number => 1 - Math.abs(value * 2 - 1)

const paint = (pixel: (x: number, y: number) => Rgb): string => {
	const canvas = document.createElement('canvas')
	canvas.width = canvas.height = SIZE
	const context = canvas.getContext('2d')!
	const image = context.createImageData(SIZE, SIZE)
	for(let y = 0; y < SIZE; y++) for(let x = 0; x < SIZE; x++) {
		const [r, g, b] = pixel(x, y)
		const offset = (y * SIZE + x) * 4
		image.data[offset] = r
		image.data[offset + 1] = g
		image.data[offset + 2] = b
		image.data[offset + 3] = 255
	}
	context.putImageData(image, 0, 0)
	return canvas.toDataURL('image/png')
}

const marble = (): string => {
	const noise = fractal(3, 4)
	return paint((x, y) => {
		const vein = Math.abs(Math.sin((x + y) / SIZE * Math.PI * 4 + noise(x, y) * 9))
		const base = mix([236, 233, 228], [196, 200, 207], noise(y, x))
		return mix([88, 92, 104], base, Math.pow(vein, 0.35))
	})
}

const wood = (): string => {
	const noise = fractal(11, 4)
	return paint((x, y) => {
		const rings = (y / SIZE * 9 + noise(x, y) * 2.2) % 1
		const grain = noise(x * 3, y * 0.5)
		return mix(mix([92, 54, 28], [168, 110, 62], rings), [60, 34, 18], grain * 0.35)
	})
}

const galaxy = (): string => {
	const nebula = fractal(21, 3)
	const tint = fractal(29, 2)
	const stars = valueNoise(37, SIZE)
	return paint((x, y) => {
		const cloud = Math.pow(nebula(x, y), 2.2) * 1.6
		const color = mix([14, 8, 38], mix([120, 40, 160], [40, 120, 200], tint(x, y)), Math.min(1, cloud))
		const star = stars(x, y) > 0.985 ? 1 : 0
		return mix(color, [255, 255, 255], star)
	})
}

const carbon = (): string => paint((x, y) => {
	const cell = 16
	const u = (x % cell) / cell, v = (y % cell) / cell
	const horizontal = (Math.floor(x / cell) + Math.floor(y / cell)) % 2 === 0
	const t = horizontal ? u : v
	const shade = 0.35 + 0.65 * Math.pow(Math.sin(t * Math.PI), 1.5)
	return mix([16, 17, 20], [70, 74, 82], shade)
})

/** Dark basalt split by glowing cracks. */
const lava = (): string => {
	const cracks = fractal(41, 3)
	const rock = fractal(43, 8, 3)
	return paint((x, y) => {
		const line = ridge(cracks(x, y)) + (rock(x, y) - 0.5) * 0.08
		const glow = smooth(0.84, 0.97, line)
		const stone = mix([26, 20, 20], [66, 52, 46], rock(x, y))
		const hot = mix([230, 60, 12], [255, 214, 110], smooth(0.95, 1, line))
		return mix(stone, hot, glow)
	})
}

/** Pale blue ice with white fractures. */
const ice = (): string => {
	const body = fractal(47, 3)
	const fracture = fractal(49, 4, 4)
	return paint((x, y) => {
		const base = mix([126, 184, 232], [214, 238, 252], body(x, y))
		const crack = smooth(0.9, 0.98, ridge(fracture(x, y)))
		return mix(base, [255, 255, 255], crack * 0.85)
	})
}

/** Brushed gold: fine horizontal streaks over a soft sheen. */
const gold = (): string => {
	const streaks = valueNoise(51, 128)
	const sheen = fractal(53, 2, 3)
	return paint((x, y) => {
		const t = streaks(0.5, y / SIZE * 128) * 0.55 + sheen(x, y) * 0.45
		return mix([128, 88, 22], [252, 218, 118], Math.min(1, t * 1.15))
	})
}

/** Grey granite with dark, light and pink specks. */
const stone = (): string => {
	const body = fractal(57, 4)
	const specks = valueNoise(59, 128)
	const pink = valueNoise(61, 64)
	return paint((x, y) => {
		let color = mix([108, 106, 104], [172, 168, 162], body(x, y))
		const speck = specks(x / SIZE * 128, y / SIZE * 128)
		if(speck > 0.82) color = mix(color, [34, 32, 34], smooth(0.82, 0.9, speck))
		else if(speck < 0.12) color = mix(color, [236, 234, 230], smooth(0.12, 0.04, speck))
		if(pink(x / SIZE * 64, y / SIZE * 64) > 0.86) color = mix(color, [196, 140, 130], 0.6)
		return color
	})
}

/** Pebbled brown leather. */
const leather = (): string => {
	const pebbles = valueNoise(63, 48)
	const tone = fractal(65, 3)
	return paint((x, y) => {
		const bump = pebbles(x / SIZE * 48, y / SIZE * 48)
		const crease = smooth(0.35, 0.5, ridge(bump))
		const base = mix([74, 40, 22], [140, 86, 48], tone(x, y))
		return mix(base, [46, 24, 14], crease * 0.55)
	})
}

/** Overlapping dragon scales: rows of 16 px, 8 scales per row, upper rows on top. */
const scales = (): string => {
	const tone = fractal(67, 2, 3)
	const width = 32, height = 16, radius = 18.5
	return paint((x, y) => {
		const row = Math.floor(y / height)
		for(let r = row - 1; r <= row + 1; r++) {
			const shift = (((r % 2) + 2) % 2) * (width / 2)
			const left = Math.floor((x - shift) / width) * width + shift
			for(const center of [left + width / 2, left - width / 2, left + width * 1.5]) {
				const dx = x - center, dy = y - r * height
				const distance = Math.sqrt(dx * dx + dy * dy) / radius
				if(distance >= 1) continue
				const base = mix([18, 70, 64], [60, 170, 140], tone(x, y))
				const shaded = mix([8, 30, 28], base, 1 - Math.pow(distance, 3))
				return mix(shaded, [190, 240, 210], Math.max(0, 0.45 - distance) * 0.8)
			}
		}
		return [8, 30, 28]
	})
}

/** Circuit board: copper traces and pads on a dark green board. */
const circuit = (): string => {
	const cell = 16
	return paint((x, y) => {
		const i = Math.floor(x / cell), j = Math.floor(y / cell)
		const u = x % cell, v = y % cell
		let color: Rgb = mix([10, 38, 30], [16, 52, 42], hash(i, j, 3))
		const kind = hash(i, j, 7)
		const trace = (kind < 0.4 && Math.abs(v - cell / 2) < 1.2) || (kind > 0.6 && Math.abs(u - cell / 2) < 1.2)
		if(trace) color = [64, 200, 170]
		if(hash(i, j, 11) > 0.8) {
			const d = Math.hypot(u - cell / 2, v - cell / 2)
			if(d < 3.2) color = d < 1.6 ? [20, 60, 50] : [210, 180, 90]
		}
		return color
	})
}

/** Black volcanic glass with a violet sheen. */
const obsidian = (): string => {
	const sheen = fractal(71, 3)
	const glint = fractal(73, 6, 3)
	return paint((x, y) => {
		const s = Math.pow(sheen(x, y), 3)
		const base = mix([8, 6, 12], [70, 50, 120], s)
		return mix(base, [170, 150, 220], smooth(0.9, 0.99, ridge(glint(x, y))) * 0.45)
	})
}

/** Green jade veined like marble. */
const jade = (): string => {
	const noise = fractal(77, 4)
	return paint((x, y) => {
		const vein = Math.abs(Math.sin((x - y) / SIZE * Math.PI * 4 + noise(x, y) * 8))
		const base = mix([38, 120, 82], [118, 196, 150], noise(y, x))
		return mix([16, 64, 44], base, Math.pow(vein, 0.4))
	})
}

/** Corroded iron: orange rust with dark pits. */
const rust = (): string => {
	const body = fractal(79, 4)
	const pits = valueNoise(81, 64)
	return paint((x, y) => {
		let color = mix([96, 46, 22], [200, 112, 52], body(x, y))
		const pit = pits(x / SIZE * 64, y / SIZE * 64)
		if(pit > 0.78) color = mix(color, [44, 22, 14], smooth(0.78, 0.9, pit))
		return color
	})
}

/** Old parchment with fibers and blotches. */
const parchment = (): string => {
	const blotch = fractal(83, 3)
	const fibers = valueNoise(85, 128)
	return paint((x, y) => {
		const base = mix([240, 226, 188], [196, 170, 120], Math.pow(blotch(x, y), 2.2))
		return mix(base, [168, 140, 96], smooth(0.75, 0.95, fibers(x / SIZE * 128, y / SIZE * 128)) * 0.3)
	})
}

/** Deep water with light caustics. */
const ocean = (): string => {
	const depth = fractal(87, 2, 4)
	const caustic = fractal(89, 4, 4)
	return paint((x, y) => {
		const base = mix([8, 40, 88], [24, 104, 160], depth(x, y))
		return mix(base, [170, 236, 250], smooth(0.86, 0.98, ridge(caustic(x, y))) * 0.8)
	})
}

/** Moss: greens with dark hollows and bright tips. */
const moss = (): string => {
	const body = fractal(91, 4)
	const tips = valueNoise(93, 96)
	return paint((x, y) => {
		let color = mix([30, 64, 22], [104, 150, 48], body(x, y))
		const tip = tips(x / SIZE * 96, y / SIZE * 96)
		if(tip > 0.8) color = mix(color, [170, 206, 90], smooth(0.8, 0.92, tip))
		if(tip < 0.15) color = mix(color, [14, 30, 10], smooth(0.15, 0.05, tip))
		return color
	})
}

/** Toxic slime: neon green swirls with bubbles. */
const toxic = (): string => {
	const swirl = fractal(95, 3)
	const cell = 32
	return paint((x, y) => {
		const s = swirl(x, y)
		let color = mix([30, 90, 16], [150, 255, 70], Math.pow(s, 1.6))
		const i = Math.floor(x / cell), j = Math.floor(y / cell)
		// Bubbles stay inside their cell, so the tile repeats without seams.
		const r = 3 + hash(i, j, 13) * 6
		const cx = i * cell + r + 1 + hash(i, j, 5) * (cell - 2 * r - 2), cy = j * cell + r + 1 + hash(i, j, 9) * (cell - 2 * r - 2)
		const d = Math.hypot(x - cx, y - cy)
		if(d < r) color = mix(color, [210, 255, 170], d > r - 1.6 ? 0.85 : 0.18)
		return color
	})
}

const generators: Readonly<Record<string, () => string>> = {
	marble, wood, galaxy, carbon, lava, ice, gold, stone, leather, scales, circuit, obsidian, jade, rust, parchment, ocean, moss, toxic
}

/** Sample skins with their labels, in display order. */
export const SKIN_SAMPLES: readonly (readonly [string, string])[] = [
	['marble', 'mármore'], ['jade', 'jade'], ['gold', 'ouro escovado'], ['wood', 'madeira'], ['stone', 'granito'],
	['obsidian', 'obsidiana'], ['lava', 'lava'], ['ice', 'gelo'], ['ocean', 'oceano'], ['galaxy', 'galáxia'],
	['scales', 'escamas de dragão'], ['leather', 'couro'], ['rust', 'ferrugem'], ['parchment', 'pergaminho'],
	['moss', 'musgo'], ['toxic', 'gosma tóxica'], ['circuit', 'circuito'], ['carbon', 'fibra de carbono']
]

const cache = new Map<string, string>()

/** Data URL of a built-in sample skin. */
export const sampleSkin = (name: string): string | null => {
	const cached = cache.get(name)
	if(cached) return cached
	const generator = generators[name]
	if(!generator) return null
	const url = generator()
	cache.set(name, url)
	return url
}
