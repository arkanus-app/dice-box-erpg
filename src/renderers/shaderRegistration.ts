import '@babylonjs/core/Shaders/default.fragment'
import '@babylonjs/core/Shaders/default.vertex'
import '@babylonjs/core/Shaders/shadowMap.fragment'
import '@babylonjs/core/Shaders/shadowMap.vertex'

/**
 * Babylon's modular shaders register their sources and includes through module
 * side effects. Consumer bundlers must see these exports as live before the
 * first StandardMaterial effect is compiled, otherwise Babylon falls back to
 * requesting development-only `.fx` files from `src/Shaders`.
 */
export const registerDiceMaterialShaders = (): void => {
	// Registration happens through the imports above. Keeping an explicit
	// function preserves the factory boundary and makes the intent testable.
}
