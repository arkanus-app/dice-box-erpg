import { n as e } from "./index-c6dc4169.js";
const n = "sceneUboDeclaration", r = `struct Scene {viewProjection : mat4x4<f32>,
#ifdef MULTIVIEW
viewProjectionR : mat4x4<f32>,
#endif 
view : mat4x4<f32>,
projection : mat4x4<f32>,
vEyePosition : vec4<f32>,};
#define SCENE_UBO
var<uniform> scene : Scene;
`;
e.IncludesShadersStoreWGSL[n] || (e.IncludesShadersStoreWGSL[n] = r);
const o = "meshUboDeclaration", t = `struct Mesh {world : mat4x4<f32>,
visibility : f32,};var<uniform> mesh : Mesh;
#define WORLD_UBO
`;
e.IncludesShadersStoreWGSL[o] || (e.IncludesShadersStoreWGSL[o] = t);
