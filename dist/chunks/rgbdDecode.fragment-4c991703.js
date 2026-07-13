import { p as e } from "./index-5c1585cf.js";
import "./helperFunctions-1bc1e05f.js";
const r = "rgbdDecodePixelShader", o = `varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;
e.ShadersStore[r] || (e.ShadersStore[r] = o);
