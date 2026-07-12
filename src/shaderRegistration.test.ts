import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ShaderStore } from '@babylonjs/core/Engines/shaderStore'
import { registerDiceMaterialShaders } from './renderers/shaderRegistration'

describe('Babylon shader registration', () => {
	it('registers StandardMaterial and shadow shaders without runtime .fx requests', () => {
		registerDiceMaterialShaders()

		assert.equal(typeof ShaderStore.ShadersStore.defaultVertexShader, 'string')
		assert.equal(typeof ShaderStore.ShadersStore.defaultPixelShader, 'string')
		assert.equal(typeof ShaderStore.ShadersStore.shadowMapVertexShader, 'string')
		assert.equal(typeof ShaderStore.ShadersStore.shadowMapPixelShader, 'string')
		assert.equal(typeof ShaderStore.IncludesShadersStore.defaultUboDeclaration, 'string')
		assert.equal(typeof ShaderStore.IncludesShadersStore.defaultVertexDeclaration, 'string')
		assert.equal(typeof ShaderStore.IncludesShadersStore.defaultFragmentDeclaration, 'string')
		assert.equal(typeof ShaderStore.IncludesShadersStore.lightVxFragmentDeclaration, 'string')
	})
})
