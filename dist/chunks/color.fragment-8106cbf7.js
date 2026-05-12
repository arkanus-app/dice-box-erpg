import { J as o } from "./Dice-b8dad4fa.js";
import "./world.onscreen-7bb050b6.js";
import "./postProcess-ee182885.js";
import "./texture-f572944e.js";
import "./helperFunctions-9a331e7d.js";
import "../dice3dview.es.js";
const e = "colorPixelShader", r = `#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
#define VERTEXCOLOR
varying vec4 vColor;
#else
uniform vec4 color;
#endif
#include<clipPlaneFragmentDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
gl_FragColor=vColor;
#else
gl_FragColor=color;
#endif
#include<fogFragment>(color,gl_FragColor)
#define CUSTOM_FRAGMENT_MAIN_END
}`;
o.ShadersStore[e] || (o.ShadersStore[e] = r);
const f = { name: e, shader: r };
export {
  f as colorPixelShader
};
