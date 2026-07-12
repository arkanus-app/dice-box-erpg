import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = path.dirname(fileURLToPath(import.meta.url))
const havokWasmPath = path.resolve(root, 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm')

export default defineConfig({
	base: './',
	build: {
		lib: {
			entry: path.resolve(root, 'src/index.ts'),
			name: 'dice3dview',
			formats: ['es'],
			fileName: () => 'dice3dview.es.js'
		},
		minify: 'esbuild',
		sourcemap: false,
		rollupOptions: {
			output: {
				entryFileNames: 'dice3dview.es.js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			}
		}
	},
	plugins: [dts({
		include: ['src/**/*.ts'],
		exclude: ['src/**/*.test.ts'],
		rollupTypes: true,
		insertTypesEntry: true
	}), {
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
	}]
})
