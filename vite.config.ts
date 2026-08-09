import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = path.dirname(fileURLToPath(import.meta.url))
const havokWasmPath = path.resolve(root, 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm')
const havokWasmUrlExpression = 'new URL("HavokPhysics.wasm",import.meta.url).href'

const externalizeBundledHavokWasm = (): Plugin => ({
	name: 'dice3dview-external-havok-wasm',
	enforce: 'pre',
	transform(code, id) {
		const normalizedId = id.replaceAll('\\', '/').split('?', 1)[0] ?? ''
		if(!normalizedId.endsWith('/@babylonjs/havok/lib/esm/HavokPhysics_es.js')) return
		const occurrenceCount = code.split(havokWasmUrlExpression).length - 1
		if(occurrenceCount !== 1) this.error(
			`Expected one Havok WASM URL expression, found ${occurrenceCount}. `
			+ 'Review the @babylonjs/havok integration before building.'
		)
		// PhysicsRenderer always supplies locateFile with the public asset URL.
		// Removing Emscripten's unused fallback prevents Vite library mode from
		// embedding the same 2 MiB WASM that is already emitted below.
		return {
			code: code.replace(havokWasmUrlExpression, '"HavokPhysics.wasm"'),
			map: null
		}
	}
})

export default defineConfig(({ mode }): UserConfig => {
	const externalBuild = mode === 'external'
	const adaptersBuild = mode === 'adapters'
	const outDir = adaptersBuild ? 'dist/adapters' : externalBuild ? 'dist/external' : 'dist'
	const entry = path.resolve(root, adaptersBuild ? 'src/adapters.ts' : 'src/index.ts')
	const entryFileName = adaptersBuild ? 'index.js' : 'dice3dview.es.js'
	const plugins: Plugin[] = []
	if(!externalBuild && !adaptersBuild) plugins.push(externalizeBundledHavokWasm())
	if(!externalBuild) plugins.push(dts(adaptersBuild ? {
		include: ['src/adapters.ts', 'src/systemThemes.ts', 'src/types.ts'],
		exclude: ['src/**/*.test.ts'],
		outDir,
		rollupTypes: false,
		insertTypesEntry: false
	} : {
		include: ['src/**/*.ts'],
		exclude: ['src/**/*.test.ts'],
		rollupTypes: true,
		insertTypesEntry: true
	}))
	if(!externalBuild && !adaptersBuild) plugins.push({
		name: 'dice3dview-havok-wasm',
		configureServer(server) {
			server.middlewares.use('/assets/dice-box/havok/HavokPhysics.wasm', (_request, response) => {
				response.setHeader('Content-Type', 'application/wasm')
				response.end(fs.readFileSync(havokWasmPath))
			})
		},
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'assets/dice-box/havok/HavokPhysics.wasm',
				source: fs.readFileSync(havokWasmPath)
			})
		}
	})

	return {
		base: './',
		build: {
			outDir,
			emptyOutDir: !externalBuild && !adaptersBuild,
			copyPublicDir: !externalBuild && !adaptersBuild,
			manifest: 'manifest.json',
			lib: {
				entry,
				name: adaptersBuild ? 'dice3dviewAdapters' : 'dice3dview',
				formats: ['es'],
				fileName: () => entryFileName
			},
			minify: 'esbuild',
			sourcemap: false,
			rollupOptions: {
				...(externalBuild ? {
					external: (id: string): boolean =>
						id === '@babylonjs/havok' || id.startsWith('@babylonjs/core/')
				} : {}),
				output: {
					entryFileNames: entryFileName,
					chunkFileNames: 'chunks/[name]-[hash].js',
					...(!externalBuild && !adaptersBuild ? {
						manualChunks: (id: string) => id.includes('@babylonjs/havok') ? 'havok' : undefined
					} : {}),
					assetFileNames: assetInfo => assetInfo.name === 'style.css'
						? 'dice3dview.css'
						: 'assets/[name]-[hash][extname]'
				}
			}
		},
		plugins
	}
})
