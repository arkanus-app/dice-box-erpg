import { r as e } from "./index-d880ba66.js";
import "./helperFunctions-2fcf3a6c.js";
const r = "rgbdDecodePixelShader", o = `varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;
e.ShadersStore[r] || (e.ShadersStore[r] = o);
