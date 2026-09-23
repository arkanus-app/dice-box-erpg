/**
 * Particle shaders, shipped with the lazy particle engine (the core renderer
 * compiles them on the first particle draw).
 *
 * Point sprites with premultiplied colors, drawn as one of six shapes and
 * rotated by their angle; the camera looks straight down, so world x/z are
 * screen x/y. The vertex stage also derives the confetti flip, which turns at
 * its own rate so a strip tumbles instead of only spinning. In sprite space
 * (`q`) x runs along the particle's heading.
 */
export const PARTICLE_VERTEX = `
attribute vec3 aPos;
attribute float aSize;
attribute vec4 aColor;
attribute float aShape;
attribute float aAngle;
uniform mat4 uViewProj;
uniform float uPointScale;
uniform float uMaxPoint;
varying vec4 vColor;
varying float vShape;
varying vec3 vTurn;
void main() {
	gl_Position = uViewProj * vec4(aPos, 1.0);
	gl_PointSize = clamp(aSize * uPointScale / gl_Position.w, 1.0, uMaxPoint);
	vColor = aColor;
	vShape = aShape;
	vTurn = vec3(cos(aAngle), sin(aAngle), abs(cos(aAngle * 1.7 + 0.6)));
}`

// Shapes: 0 soft glow, 1 spark (thin streak with a hot middle), 2 star (small
// core and four fading rays), 3 ring, 4 confetti (paper strip that narrows and
// darkens edge-on), 5 smoke (lumpy puff).
export const PARTICLE_FRAGMENT = `
precision mediump float;
varying vec4 vColor;
varying float vShape;
varying vec3 vTurn;
uniform float uAdditive;
void main() {
	vec2 p = gl_PointCoord * 2.0 - 1.0;
	vec2 q = vec2(p.x * vTurn.x + p.y * vTurn.y, p.y * vTurn.x - p.x * vTurn.y);
	float r2 = dot(p, p);
	float a = 0.0;
	float shade = 1.0;
	if(vShape < 0.5) {
		a = pow(max(0.0, 1.0 - r2), 1.5);
	} else if(vShape < 1.5) {
		float along = max(0.0, 1.0 - abs(q.x));
		float across = q.y * 6.0;
		a = along * sqrt(along) * max(0.0, 1.0 - across * across);
	} else if(vShape < 2.5) {
		float core = max(0.0, 1.0 - r2 * 5.0);
		float rays = max(0.0, 1.0 - abs(q.y) * 10.0) * (1.0 - abs(q.x)) + max(0.0, 1.0 - abs(q.x) * 10.0) * (1.0 - abs(q.y));
		a = min(1.0, core * core + rays);
	} else if(vShape < 3.5) {
		float band = max(0.0, 1.0 - abs(sqrt(r2) - 0.72) * 5.0);
		a = band * band;
	} else if(vShape < 4.5) {
		vec2 s = abs(q) / vec2(0.85, max(0.08, 0.5 * vTurn.z));
		a = 1.0 - smoothstep(0.8, 1.0, max(s.x, s.y));
		shade = 0.55 + 0.45 * vTurn.z;
	} else {
		float angle = atan(q.y, q.x);
		float lumps = 0.78 + 0.22 * sin(angle * 3.0) * sin(angle * 5.0 + 1.3);
		a = pow(max(0.0, 1.0 - r2 / (lumps * lumps)), 1.4);
	}
	if(a <= 0.003) discard;
	vec4 c = vColor * a;
	c.rgb *= shade;
	gl_FragColor = uAdditive > 0.5 ? vec4(c.rgb, 0.0) : c;
}`
