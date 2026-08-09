import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { collectBundleMetrics } from './bundle-metrics.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const baselinePath = path.join(root, 'benchmarks/bundle-baseline.json')
if(!existsSync(baselinePath)) throw new Error('The versioned bundle baseline is missing.')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
for(const section of ['legacy', 'external', 'adapters', 'havokJs', 'wasm', 'assets', 'package', 'browserMobile', 'frontendMobileBuild']) {
	if(!baseline[section]) throw new Error(`Bundle baseline is missing '${section}'.`)
}
const requiredFiles = [
	'dice3dview.es.js',
	'index.d.ts',
	'manifest.json',
	'external/dice3dview.es.js',
	'external/manifest.json',
	'adapters/index.js',
	'adapters/adapters.d.ts',
	'adapters/manifest.json',
	'assets/dice-box/havok/HavokPhysics.wasm'
]
for(const file of requiredFiles) {
	if(!existsSync(path.join(dist, file))) throw new Error(`Required package artifact is missing: dist/${file}`)
}

const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
for(const subpath of ['.', './external', './adapters', './style.css']) {
	if(!packageJson.exports?.[subpath]) throw new Error(`Package export '${subpath}' is missing.`)
}

const adapterSource = readFileSync(path.join(dist, 'adapters/index.js'), 'utf8')
if(/@babylonjs|Havok|DiceResultViewer/.test(adapterSource)) {
	throw new Error('The adapters entrypoint unexpectedly contains renderer dependencies.')
}

const externalFiles = [
	path.join(dist, 'external/dice3dview.es.js'),
	...Object.values(JSON.parse(readFileSync(path.join(dist, 'external/manifest.json'), 'utf8')))
		.map(entry => path.join(dist, 'external', entry.file))
		.filter(file => file.endsWith('.js'))
]
const externalSource = [...new Set(externalFiles)].map(file => readFileSync(file, 'utf8')).join('\n')
if(!externalSource.includes('@babylonjs/core/')) {
	throw new Error('The external entrypoint does not preserve bare Babylon imports for host deduplication.')
}
if(!externalSource.includes('@babylonjs/havok')) {
	throw new Error('The external physics chunk does not preserve the bare Havok import.')
}

const legacyManifest = JSON.parse(readFileSync(path.join(dist, 'manifest.json'), 'utf8'))
const legacyHavokFiles = Object.values(legacyManifest)
	.map(entry => entry.file)
	.filter(file => /^chunks\/havok-.+\.js$/.test(file))
if(legacyHavokFiles.length !== 1) {
	throw new Error(`Expected one legacy Havok JS chunk, found ${legacyHavokFiles.length}.`)
}
const legacyHavokSource = readFileSync(path.join(dist, legacyHavokFiles[0]), 'utf8')
if(/data:application\/octet-stream;base64,[A-Za-z0-9+/]{1024}/.test(legacyHavokSource)) {
	throw new Error('The legacy Havok JS chunk contains an embedded duplicate of the WASM binary.')
}
const initialEntry = legacyManifest['src/index.ts']
const initialFiles = [initialEntry.file]
const visitImports = entry => {
	for(const dependency of entry.imports ?? []) {
		const dependencyEntry = legacyManifest[dependency]
		initialFiles.push(dependencyEntry.file)
		visitImports(dependencyEntry)
	}
}
visitImports(initialEntry)
const initialSource = [...new Set(initialFiles)]
	.map(file => readFileSync(path.join(dist, file), 'utf8'))
	.join('\n')
if(initialSource.includes('HavokPlugin') || initialSource.includes('HavokPhysics.wasm')) {
	throw new Error('The legacy initial graph unexpectedly contains Havok physics code.')
}
if(initialFiles.some(file => file.includes('timelineHighlightRuntime') || file.includes('shadowGenerator-'))) {
	throw new Error('Timeline highlights or shadow generation leaked into the initial static graph.')
}

const adapters = await import(pathToFileURL(path.join(dist, 'adapters/index.js')).href)
for(const name of ['createMixedDisplayRequest', 'createSystemDisplayRequest', 'toMixedResolvedDice']) {
	if(typeof adapters[name] !== 'function') throw new Error(`Adapters entrypoint is missing '${name}'.`)
}

const metrics = collectBundleMetrics()
console.log(JSON.stringify(metrics, null, 2))
console.log('Bundle structure passed: legacy standalone, external peer graph, adapters-only entrypoint, and lazy optional features.')
