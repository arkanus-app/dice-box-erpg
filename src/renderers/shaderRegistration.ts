import { defaultPixelShader } from '@babylonjs/core/Shaders/default.fragment'
import { defaultVertexShader } from '@babylonjs/core/Shaders/default.vertex'
import { shadowMapPixelShader } from '@babylonjs/core/Shaders/shadowMap.fragment'
import { shadowMapVertexShader } from '@babylonjs/core/Shaders/shadowMap.vertex'

/**
 * Babylon's modular shaders register their sources and includes through module
 * side effects. Consumer bundlers must see these exports as live before the
 * first StandardMaterial effect is compiled, otherwise Babylon falls back to
 * requesting development-only `.fx` files from `src/Shaders`.
 */
export const registerDiceMaterialShaders = (): void => {
	void defaultPixelShader
	void defaultVertexShader
	void shadowMapPixelShader
	void shadowMapVertexShader
}
