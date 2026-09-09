import assert from 'node:assert/strict'
import { it } from 'node:test'
import { build } from 'vite'
import { minifyLibrary } from '../build/minifyLibrary'

it('keeps annotations for consumer tree shaking, required registrations and license comments', async () => {
	const library = `
		/*! Fixture @license MIT */
		import { createOptional, registerRequired } from 'fixture-runtime';
		export const optional = /* @__PURE__ */ createOptional('unused-marker');
		registerRequired('required-marker');
		export const selected = 42;
	`
	const bundle = async (modules: Record<string, string>, minified: boolean): Promise<string> => {
		const result = await build({
			configFile: false,
			publicDir: false,
			logLevel: 'silent',
			plugins: [{
				name: 'minification-fixture',
				resolveId(id) {
					if(id in modules) return `\0${id}`
					if(id === 'fixture-runtime') return { id, external: true, moduleSideEffects: false }
					return null
				},
				load(id) { return modules[id.slice(1)] }
			}, ...(minified ? [minifyLibrary()] : [])],
			build: {
				write: false,
				minify: false,
				lib: { entry: 'fixture-entry', formats: ['es'] },
				rollupOptions: { input: 'fixture-entry', output: { banner: '/*! Fixture @license MIT */' } }
			}
		})
		const output = (Array.isArray(result) ? result[0] : result) as import('rollup').RollupOutput
		const chunk = output.output.find(item => item.type === 'chunk')
		assert.ok(chunk && chunk.type === 'chunk')
		return chunk.code
	}
	const minified = await bundle({ 'fixture-entry': library }, true)
	assert.match(minified, /@license MIT/)
	assert.match(minified, /[@#]__PURE__/)
	const consumed = await bundle({
		'fixture-entry': "export { selected } from 'fixture-library'",
		'fixture-library': minified
	}, false)
	assert.doesNotMatch(consumed, /unused-marker|createOptional/)
	assert.match(consumed, /required-marker/)
	assert.match(consumed, /42/)
})
