import { r as e } from "./index-11ca32cf.js";
import { h as a } from "./helperFunctions-e372c494.js";
const t = "rgbdDecodePixelShader", n = `varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=vec4f(fromRGBD(textureSample(textureSampler,textureSamplerSampler,input.vUV)),1.0);}`;
e.ShadersStoreWGSL[t] || (e.ShadersStoreWGSL[t] = n);
const S = [a];
for (const r of S)
  e.IncludesShadersStoreWGSL[r.name] || (e.IncludesShadersStoreWGSL[r.name] = r.shader);
