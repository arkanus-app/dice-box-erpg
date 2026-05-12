import { J as o } from "./Dice-f63fdd4d.js";
import "./world.onscreen-e470226e.js";
import "./postProcess-1c1e23eb.js";
import "./texture-1ebdc842.js";
import "./helperFunctions-64436466.js";
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
