import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { dacos, datan, datan2, dcos, dsin } from './engine/dmath'

/** Pseudo-random samples without Math.random, so failures are reproducible. */
const samples = (count: number, span: number): number[] => {
	let state = 12345
	return Array.from({ length: count }, () => {
		state = (state * 1103515245 + 12345) % 2147483648
		return (state / 2147483648 * 2 - 1) * span
	})
}

describe('deterministic trigonometry', () => {
	it('matches Math within a few units in the last place', () => {
		for(const x of [...samples(4000, 20), 0, Math.PI / 2, Math.PI, -Math.PI, 1e-9, 1e3]) {
			assert.ok(Math.abs(dsin(x) - Math.sin(x)) < 4e-16 * Math.max(1, Math.abs(x)), `sin(${x})`)
			assert.ok(Math.abs(dcos(x) - Math.cos(x)) < 4e-16 * Math.max(1, Math.abs(x)), `cos(${x})`)
		}
		for(const x of [...samples(4000, 50), 0, 0.4375, 1.1875, 2.4375, 1e9, -1e9]) {
			assert.ok(Math.abs(datan(x) - Math.atan(x)) < 3e-16, `atan(${x})`)
		}
		for(const [y, x] of samples(2000, 10).map((value, index, all) => [value, all[(index * 7 + 3) % all.length]!] as const)) {
			assert.ok(Math.abs(datan2(y, x) - Math.atan2(y, x)) < 5e-16, `atan2(${y}, ${x})`)
		}
		for(const x of [...samples(2000, 1), 1, -1, 0]) {
			assert.ok(Math.abs(dacos(x) - Math.acos(x)) < 5e-15, `acos(${x})`)
		}
	})

	it('handles the axes and special values', () => {
		assert.equal(dsin(0), 0)
		assert.equal(dcos(0), 1)
		assert.equal(datan2(0, 1), 0)
		assert.ok(Math.abs(datan2(1, 0) - Math.PI / 2) < 1e-16)
		assert.ok(Math.abs(datan2(-1, 0) + Math.PI / 2) < 1e-16)
		assert.ok(Math.abs(datan2(0, -1) - Math.PI) < 1e-15)
		assert.ok(Number.isNaN(dsin(Number.POSITIVE_INFINITY)))
		assert.ok(Number.isNaN(datan2(Number.NaN, 1)))
	})

	it('is the only trigonometry the physics uses', () => {
		// Engines may round these differently, which would make a throw land differently from one browser to another.
		const forbidden = /Math\.(sin|cos|tan|asin|acos|atan|atan2|hypot|exp|expm1|log|log1p|log2|log10|pow|cbrt|sinh|cosh|tanh)\(|[\w)\]]\s*\*\*\s*[\w(]/
		const engine = new URL('./engine/', import.meta.url)
		for(const file of readdirSync(engine).filter(name => name.endsWith('.ts') && name !== 'dmath.ts')) {
			const code = readFileSync(new URL(file, engine), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
			assert.doesNotMatch(code, forbidden, file)
		}
	})
})
