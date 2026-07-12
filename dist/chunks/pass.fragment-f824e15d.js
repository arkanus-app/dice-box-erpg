import { n as r } from "./index-c6dc4169.js";
const e = "passPixelShader", a = `varying vec2 vUV;uniform sampler2D textureSampler;
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=texture2D(textureSampler,vUV);}`;
r.ShadersStore[e] || (r.ShadersStore[e] = a);
const t = { name: e, shader: a };
export {
  t as passPixelShader
};
