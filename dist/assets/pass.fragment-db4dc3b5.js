import { S as r } from "./offscreenCanvas.worker-e2a35027.js";
const e = "passPixelShader", a = `varying vec2 vUV;uniform sampler2D textureSampler;
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=texture2D(textureSampler,vUV);}`;
r.ShadersStore[e] || (r.ShadersStore[e] = a);
const t = { name: e, shader: a };
export {
  t as passPixelShader
};
