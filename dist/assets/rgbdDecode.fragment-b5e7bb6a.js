import { S as e } from "./offscreenCanvas.worker-5e1bcfa9.js";
import "./helperFunctions-bec2d8bd.js";
const r = "rgbdDecodePixelShader", t = `varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=vec4f(fromRGBD(textureSample(textureSampler,textureSamplerSampler,input.vUV)),1.0);}`;
e.ShadersStoreWGSL[r] || (e.ShadersStoreWGSL[r] = t);
