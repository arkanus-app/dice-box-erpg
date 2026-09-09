import { minify } from 'terser'
import type { Plugin } from 'vite'

/** Vite 4 skips complete ES library minification to protect PURE annotations. */
export const minifyLibrary = (): Plugin => ({
	name: 'dice3dview-minify-library',
	apply: 'build',
	renderChunk: {
		order: 'post',
		async handler(code, chunk, options) {
			if(options.format !== 'es') return null
			const result = await minify({ [chunk.fileName]: code }, {
				module: true,
				ecma: 2020,
				compress: { passes: 2 },
				format: { comments: /@license|@preserve|copyright|^!/i, preserve_annotations: true }
			})
			if(!result.code) this.error(`Minification produced no code for ${chunk.fileName}.`)
			return { code: result.code, map: null }
		}
	}
})
