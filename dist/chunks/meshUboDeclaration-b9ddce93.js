import { r as e } from "./index-11ca32cf.js";
const o = "sceneUboDeclaration", n = `struct Scene {viewProjection : mat4x4<f32>,
#ifdef MULTIVIEW
viewProjectionR : mat4x4<f32>,
#endif 
view : mat4x4<f32>,
projection : mat4x4<f32>,
vEyePosition : vec4<f32>,
inverseProjection : mat4x4<f32>,};
#define SCENE_UBO
var<uniform> scene : Scene;
`;
e.IncludesShadersStoreWGSL[o] || (e.IncludesShadersStoreWGSL[o] = n);
const a = { name: o, shader: n }, s = "meshUboDeclaration", r = `struct Mesh {world : mat4x4<f32>,
visibility : f32,};var<uniform> mesh : Mesh;
#define WORLD_UBO
`;
e.IncludesShadersStoreWGSL[s] || (e.IncludesShadersStoreWGSL[s] = r);
const i = { name: s, shader: r };
export {
  i as m,
  a as s
};
