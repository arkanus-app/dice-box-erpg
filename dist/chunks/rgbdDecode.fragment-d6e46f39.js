import { r as e } from "./index-11ca32cf.js";
import { h as n } from "./helperFunctions-d48976dd.js";
const o = "rgbdDecodePixelShader", a = `varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;
e.ShadersStore[o] || (e.ShadersStore[o] = a);
const t = [n];
for (const r of t)
  e.IncludesShadersStore[r.name] || (e.IncludesShadersStore[r.name] = r.shader);
