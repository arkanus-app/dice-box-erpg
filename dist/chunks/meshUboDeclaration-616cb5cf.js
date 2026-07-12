import { n as e } from "./index-c6dc4169.js";
const o = "sceneUboDeclaration", n = `layout(std140,column_major) uniform;uniform Scene {mat4 viewProjection;
#ifdef MULTIVIEW
mat4 viewProjectionR;
#endif 
mat4 view;mat4 projection;vec4 vEyePosition;};
`;
e.IncludesShadersStore[o] || (e.IncludesShadersStore[o] = n);
const i = "meshUboDeclaration", t = `#ifdef WEBGL2
uniform mat4 world;uniform float visibility;
#else
layout(std140,column_major) uniform;uniform Mesh
{mat4 world;float visibility;};
#endif
#define WORLD_UBO
`;
e.IncludesShadersStore[i] || (e.IncludesShadersStore[i] = t);
