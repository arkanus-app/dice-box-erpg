import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'esbuild'
import { defineConfig, searchForWorkspaceRoot, type Plugin, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = path.dirname(fileURLToPath(import.meta.url))

/** Drops comments and indentation from the GLSL sources (template literals with `void main`). */
const minifyGlsl = (): Plugin => ({
	name: 'dice3dview:minify-glsl',
	apply: 'build',
	enforce: 'pre',
	transform(code, id) {
		if(!/[\\/]src[\\/]render[\\/][^\\/]+\.ts$/.test(id)) return null
		const minified = code.replace(/`([^`$]*\bvoid main\b[^`$]*)`/g, (_, source: string) =>
			`\`${source.split('\n').map(line => line.replace(/\/\/.*$/, '').trim()).filter(Boolean).join('\n')}\``)
		return minified === code ? null : { code: minified, map: null }
	}
})

/**
 * Vite keeps whitespace in ES library output (for pure annotations); the
 * library is one self-contained module, so the final chunks are compacted.
 */
const minifyWhitespace = (): Plugin => ({
	name: 'dice3dview:minify-whitespace',
	apply: 'build',
	async generateBundle(_, bundle) {
		for(const output of Object.values(bundle)) {
			if(output.type !== 'chunk') continue
			output.code = (await transform(output.code, { minifyWhitespace: true, format: 'esm', target: 'es2022', legalComments: 'none', charset: 'utf8' })).code
		}
	}
})

// v3 has no runtime dependencies: one self-contained ESM graph serves CDN and
// bundlers alike (`./external` is kept as an alias of the root entrypoint).
export default defineConfig(({ mode }): UserConfig => {
	const adaptersBuild = mode === 'adapters'
	const outDir = adaptersBuild ? 'dist/adapters' : 'dist'
	const entry = path.resolve(root, adaptersBuild ? 'src/adapters.ts' : 'src/index.ts')
	const entryFileName = adaptersBuild ? 'index.js' : 'dice3dview.es.js'
	const plugins: Plugin[] = [minifyGlsl(), minifyWhitespace(), dts(adaptersBuild ? {
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
	})]

	return {
		base: './',
		build: {
			outDir,
			emptyOutDir: !adaptersBuild,
			copyPublicDir: !adaptersBuild,
			manifest: 'manifest.json',
			// ES2022 keeps native private fields: lowered to WeakMap helpers they made
			// the particle loop 10x slower (1.36 ms vs 0.13 ms per frame at 2,400 particles).
			target: 'es2022',
			lib: {
				entry,
				name: adaptersBuild ? 'dice3dviewAdapters' : 'dice3dview',
				formats: ['es'],
				fileName: () => entryFileName
			},
			minify: 'esbuild',
			sourcemap: false,
			rollupOptions: {
				// The lazy particle chunk imports shared helpers from the entry itself,
				// so the core stays one file instead of a stub plus a shared chunk.
				preserveEntrySignatures: 'allow-extension',
				output: {
					entryFileNames: entryFileName,
					chunkFileNames: 'chunks/[name]-[hash].js',
					assetFileNames: assetInfo => assetInfo.name === 'style.css'
						? 'dice3dview.css'
						: 'assets/[name]-[hash][extname]'
				}
			}
		},
		plugins,
		server: {
			fs: {
				// demo/ and example/ resolve rolls with @erpg/dicecore from the sibling checkout.
				allow: [searchForWorkspaceRoot(root), path.resolve(root, '../rpg-dice-roller')]
			}
		}
	}
})
