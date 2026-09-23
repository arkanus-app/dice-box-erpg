/**
 * Deterministic trigonometry for the throw planning. JavaScript leaves
 * Math.sin, Math.cos, Math.atan2 and friends implementation-defined, so their
 * last bit can differ between engines (V8, SpiderMonkey, JavaScriptCore), and
 * a chaotic simulation amplifies that into a different throw. These functions
 * only use + − × ÷ and √, which IEEE 754 fixes in every engine: the same seed
 * plans the same throw in any browser.
 *
 * Kernels and coefficients from fdlibm (Sun Microsystems, freely
 * redistributable), accurate to about one unit in the last place.
 */

// π/2 split for the Cody–Waite reduction: HI has 33 significant bits, so k·HI is exact.
const PIO2_HI = 1.57079632673412561417e+00
const PIO2_LO = 6.07710050650619224932e-11
const TWO_OVER_PI = 6.36619772367581382433e-01
const PI = 3.14159265358979311600e+00
const PI_LO = 1.2246467991473531772e-16

const S1 = -1.66666666666666324348e-01
const S2 = 8.33333333332248946124e-03
const S3 = -1.98412698298579493134e-04
const S4 = 2.75573137070700676789e-06
const S5 = -2.50507602534068634195e-08
const S6 = 1.58969099521155010221e-10

const C1 = 4.16666666666666019037e-02
const C2 = -1.38888888888741095749e-03
const C3 = 2.48015872894767294178e-05
const C4 = -2.75573143513906633035e-07
const C5 = 2.08757232129817482790e-09
const C6 = -1.13596475577881948265e-11

const ATAN_HI = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00]
const ATAN_LO = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17]
const AT = [
	3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
	9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
	4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02
]

/** sin on [-π/4, π/4]. */
const kernelSin = (x: number): number => {
	const z = x * x
	return x + x * z * (S1 + z * (S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)))))
}

/** cos on [-π/4, π/4]. */
const kernelCos = (x: number): number => {
	const z = x * x
	const hz = 0.5 * z
	const w = 1 - hz
	return w + (((1 - w) - hz) + z * z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6))))))
}

/** Quadrant of x (k) and the remainder in [-π/4, π/4]; accurate for |x| up to about 1e5. */
let quadrant = 0
const reduce = (x: number): number => {
	const k = Math.round(x * TWO_OVER_PI)
	quadrant = ((k % 4) + 4) % 4
	return (x - k * PIO2_HI) - k * PIO2_LO
}

export const dsin = (x: number): number => {
	if(!Number.isFinite(x)) return Number.NaN
	const r = reduce(x)
	return quadrant === 0 ? kernelSin(r) : quadrant === 1 ? kernelCos(r) : quadrant === 2 ? -kernelSin(r) : -kernelCos(r)
}

export const dcos = (x: number): number => {
	if(!Number.isFinite(x)) return Number.NaN
	const r = reduce(x)
	return quadrant === 0 ? kernelCos(r) : quadrant === 1 ? -kernelSin(r) : quadrant === 2 ? -kernelCos(r) : kernelSin(r)
}

export const datan = (value: number): number => {
	if(Number.isNaN(value)) return Number.NaN
	const negative = value < 0
	let x = negative ? -value : value
	if(x === Infinity) return negative ? -ATAN_HI[3]! : ATAN_HI[3]!
	let id = -1
	if(x >= 0.4375) {
		if(x < 1.1875) {
			if(x < 0.6875) { id = 0; x = (2 * x - 1) / (2 + x) }
			else { id = 1; x = (x - 1) / (x + 1) }
		} else if(x < 2.4375) { id = 2; x = (x - 1.5) / (1 + 1.5 * x) }
		else { id = 3; x = -1 / x }
	}
	const z = x * x, w = z * z
	const s1 = z * (AT[0]! + w * (AT[2]! + w * (AT[4]! + w * (AT[6]! + w * (AT[8]! + w * AT[10]!)))))
	const s2 = w * (AT[1]! + w * (AT[3]! + w * (AT[5]! + w * (AT[7]! + w * AT[9]!))))
	const result = id < 0 ? x - x * (s1 + s2) : ATAN_HI[id]! - ((x * (s1 + s2) - ATAN_LO[id]!) - x)
	return negative ? -result : result
}

export const datan2 = (y: number, x: number): number => {
	if(Number.isNaN(x) || Number.isNaN(y)) return Number.NaN
	if(x === 0) return y > 0 ? PIO2_HI + PIO2_LO : y < 0 ? -(PIO2_HI + PIO2_LO) : 0
	const a = datan(y / x)
	if(x > 0) return a
	// Left half-plane: π added in two parts keeps the full precision.
	return y >= 0 ? (a + PI_LO) + PI : (a - PI_LO) - PI
}

export const dacos = (x: number): number => {
	if(x >= 1) return 0
	if(x <= -1) return PI + PI_LO
	return datan2(Math.sqrt((1 - x) * (1 + x)), x)
}
