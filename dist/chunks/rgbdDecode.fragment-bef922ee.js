import { o as e } from "./index-9e4816e5.js";
import "./helperFunctions-91d90c8e.js";
const r = "rgbdDecodePixelShader", o = `varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;
e.ShadersStore[r] || (e.ShadersStore[r] = o);
