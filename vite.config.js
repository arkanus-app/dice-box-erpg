import path from 'path'
import { defineConfig } from 'vite'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import minifyEs from './rollup-plugin-minifyEs'

const assetFileNames = (assetInfo) => assetInfo.name === 'style.css'
	? 'style.css'
	: 'assets/[name]-[hash][extname]'

export default defineConfig({
	base: process.env.NODE_ENV === 'production' ? './' : './src',
	worker: {
		format: 'es',
	},
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'dice3dview',
			fileName: (format) => ({
        es: `dice3dview.es.js`,
        esm: `dice3dview.es.min.js`,
      })[format]
    },
    rollupOptions: {
			preserveEntrySignatures: 'allow-extension',
      input: {
				main: path.resolve(__dirname, 'src/index.js')
			},
			output: [
				{
					format: "es",
					entryFileNames: 'dice3dview.es.js',
					chunkFileNames: 'chunks/[name]-[hash].js',
					assetFileNames,
					sourcemap: false,
				},
				{
					format: "esm",
					entryFileNames: 'dice3dview.es.min.js',
					chunkFileNames: 'chunks/[name]-[hash].min.js',
					assetFileNames,
					sourcemap: false,
					plugins: [
						minifyEs(),
					]
				}
			],
			plugins: [
				copy({
					targets: [
						{
							src: [
								path.resolve(__dirname, 'dist/assets/dice-box/*')
							],
							dest: path.resolve(__dirname, 'dist/assets')
						}
					],
					hook: 'writeBundle'
				}),
				del({ 
					targets: path.resolve(__dirname, 'dist/assets/dice-box'),
					hook: 'closeBundle'
				})
			]
    },
  }
})
