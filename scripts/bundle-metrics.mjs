import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

const visit = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
	const target = path.join(directory, entry.name)
	return entry.isDirectory() ? visit(target) : [target]
})

const compressedMetrics = files => {
	const unique = [...new Set(files)].filter(existsSync)
	return unique.reduce((metrics, file) => {
		const source = readFileSync(file)
		metrics.files++
		metrics.rawBytes += source.length
		metrics.gzipBytes += gzipSync(source, { level: 9 }).length
		metrics.brotliBytes += brotliCompressSync(source).length
		return metrics
	}, { files: 0, rawBytes: 0, gzipBytes: 0, brotliBytes: 0 })
}

const readManifest = directory => JSON.parse(readFileSync(path.join(directory, 'manifest.json'), 'utf8'))

const findEntry = (manifest, source) => {
	const key = Object.keys(manifest).find(candidate => candidate === source)
	if(!key) throw new Error(`Bundle manifest is missing '${source}'.`)
	return key
}

const staticClosure = (manifest, directory, roots) => {
	const visited = new Set()
	const files = new Set()
	const walk = key => {
		if(visited.has(key)) return
		visited.add(key)
		const entry = manifest[key]
		if(!entry) throw new Error(`Bundle manifest references missing entry '${key}'.`)
		files.add(path.join(directory, entry.file))
		for(const dependency of entry.imports ?? []) walk(dependency)
	}
	for(const entry of roots) walk(findEntry(manifest, entry))
	return files
}

const subtract = (files, excluded) => [...files].filter(file => !excluded.has(file))

const graphMetrics = (directory, excludedPhysicsFiles = new Set()) => {
	const manifest = readManifest(directory)
	const initial = staticClosure(manifest, directory, ['src/index.ts'])
	const physics = staticClosure(manifest, directory, ['src/renderers/PhysicsRenderer.ts'])
	const profiling = Object.hasOwn(manifest, 'src/physicsPerformance.ts')
		? staticClosure(manifest, directory, ['src/physicsPerformance.ts'])
		: new Set()
	const timeline = staticClosure(manifest, directory, ['src/renderers/timelineHighlightRuntime.ts'])
	const shadowRoots = [
		'node_modules/@babylonjs/core/Lights/Shadows/shadowGenerator.js',
		'node_modules/@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent.js'
	]
	const availableShadows = shadowRoots.filter(source => Object.hasOwn(manifest, source))
	const shadows = availableShadows.length
		? staticClosure(manifest, directory, availableShadows)
		: new Set()
	return {
		initial: compressedMetrics([...initial]),
		physicsIncremental: compressedMetrics(subtract(physics, new Set([...initial, ...excludedPhysicsFiles]))),
		profilingIncremental: compressedMetrics(subtract(
			profiling,
			new Set([...initial, ...physics, ...excludedPhysicsFiles])
		)),
		timelineIncremental: compressedMetrics(subtract(timeline, initial)),
		shadowsIncremental: compressedMetrics(subtract(shadows, initial)),
		allJavaScript: compressedMetrics(visit(directory).filter(file => file.endsWith('.js'))),
		_initialFiles: initial
	}
}

const runNpmPackDryRun = () => process.platform === 'win32'
	? execFileSync(process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe', [
		'/d', '/s', '/c', 'npm pack --dry-run --json'
	], { cwd: root, encoding: 'utf8' })
	: execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: root, encoding: 'utf8' })

export const collectBundleMetrics = () => {
	const legacyJavaScript = visit(dist).filter(file => file.endsWith('.js'))
	const havokJsFiles = legacyJavaScript.filter(file => path.basename(file).startsWith('havok-'))
	const legacy = graphMetrics(dist, new Set(havokJsFiles))
	const external = graphMetrics(path.join(dist, 'external'))
	const adapterDirectory = path.join(dist, 'adapters')
	const allFiles = visit(dist)
	const wasmFiles = allFiles.filter(file => file.endsWith('.wasm'))
	const assetFiles = allFiles.filter(file => file.includes(`${path.sep}assets${path.sep}`) && !file.endsWith('.wasm'))
	const packed = JSON.parse(runNpmPackDryRun())[0]
	delete legacy._initialFiles
	delete external._initialFiles
	return {
		generatedAt: new Date().toISOString(),
		legacy,
		external,
		adapters: compressedMetrics(visit(adapterDirectory).filter(file => file.endsWith('.js'))),
		havokJs: compressedMetrics(havokJsFiles),
		wasm: compressedMetrics(wasmFiles),
		assets: compressedMetrics(assetFiles),
		dist: compressedMetrics(allFiles),
		package: {
			files: packed.entryCount,
			packedBytes: packed.size,
			unpackedBytes: packed.unpackedSize
		}
	}
}

if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	console.log(JSON.stringify(collectBundleMetrics(), null, 2))
}
