// v2 × v3 without a browser, on the same machine: what each first load
// downloads, how long V8 takes to compile it and how long the Havok WASM takes
// to compile. Needs `npm run build` and `node scripts/prepare-v2-benchmark.mjs`.
// Usage: node scripts/compare-v2-v3.mjs [runs] [--write]
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runs = Math.max(1, Number(process.argv.find(arg => /^\d+$/.test(arg)) ?? 7))
const write = process.argv.includes('--write')
const v2Dir = path.join(root, 'benchmarks/compare/v2')
const v3Dir = path.join(root, 'dist')
if(!existsSync(path.join(v2Dir, 'manifest.json'))) throw new Error('Run node scripts/prepare-v2-benchmark.mjs first.')

/** Files reached by static imports from the manifest keys. */
const closure = (dir, keys) => {
	const manifest = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'))
	const files = new Set()
	const walk = key => {
		const entry = manifest[key]
		if(!entry || files.has(path.join(dir, entry.file))) return
		files.add(path.join(dir, entry.file))
		for(const dependency of entry.imports ?? []) walk(dependency)
	}
	for(const key of keys) walk(key)
	return files
}
const keyOf = (dir, pattern) => {
	const manifest = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'))
	const key = Object.keys(manifest).find(candidate => pattern.test(candidate))
	if(!key) throw new Error(`No manifest entry matches ${pattern} in ${dir}.`)
	return key
}

const v2Entry = keyOf(v2Dir, /^src\/index\.ts$/)
const v2Kinematic = closure(v2Dir, [v2Entry])
const v2Physics = new Set([...v2Kinematic, ...closure(v2Dir, [keyOf(v2Dir, /PhysicsRenderer\.ts$/), keyOf(v2Dir, /havok/i)])])
const v3Core = closure(v3Dir, ['src/index.ts'])
const v3Effects = new Set([...v3Core, ...closure(v3Dir, ['src/render/particles.ts', 'src/render/particlePresets.ts'])])
const wasm = path.join(v2Dir, 'assets/dice-box/havok/HavokPhysics.wasm')

const bytes = files => [...files].reduce((sum, file) => {
	const source = readFileSync(file)
	return {
		files: sum.files + 1,
		rawBytes: sum.rawBytes + source.length,
		gzipBytes: sum.gzipBytes + gzipSync(source, { level: 9 }).length,
		brotliBytes: sum.brotliBytes + brotliCompressSync(source).length
	}
}, { files: 0, rawBytes: 0, gzipBytes: 0, brotliBytes: 0 })

const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

// Each measurement runs in a fresh Node process: no compilation cache is shared.
const COMPILE = `
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const files = JSON.parse(process.argv[1])
const sources = files.map(file => readFileSync(file, 'utf8'))
const started = performance.now()
for(const source of sources) new vm.SourceTextModule(source)
process.stdout.write(String(performance.now() - started))
`
const WASM = `
const bytes = require('node:fs').readFileSync(process.argv[1])
const started = performance.now()
WebAssembly.compile(bytes).then(() => process.stdout.write(String(performance.now() - started)))
`
const measure = (script, argument) => median(Array.from({ length: runs }, () =>
	Number(execFileSync(process.execPath, ['--experimental-vm-modules', '--no-warnings', '-e', script, argument], { encoding: 'utf8' }))))
const compileMs = files => Math.round(measure(COMPILE, JSON.stringify([...files])) * 10) / 10

const report = {
	schemaVersion: 1,
	capturedAt: new Date().toISOString(),
	environment: { node: process.versions.node, v8: process.versions.v8, platform: `${process.platform}-${process.arch}`, runs },
	v2: {
		kinematic: { ...bytes(v2Kinematic), compileMs: compileMs(v2Kinematic) },
		physics: { ...bytes(new Set([...v2Physics, wasm])), compileMs: compileMs(v2Physics), wasmCompileMs: Math.round(measure(WASM, wasm) * 10) / 10 }
	},
	v3: {
		core: { ...bytes(v3Core), compileMs: compileMs(v3Core) },
		withEffects: { ...bytes(v3Effects), compileMs: compileMs(v3Effects) }
	}
}

console.log(JSON.stringify(report, null, 2))
if(write) writeFileSync(path.join(root, 'benchmarks/v2-v3-comparison.json'), `${JSON.stringify(report, null, 2)}\n`)
