import { o as H, j as O, V as t, p as X, m as x, q as R } from "./index-11ca32cf.js";
class D {
  constructor(e, o, n, s) {
    this.name = e, this.worldAxisForNormal = o, this.worldAxisForFileX = n, this.worldAxisForFileY = s;
  }
}
class u {
  /**
   * Clamp a value to the nearest power of two (rounding down).
   * @param value The value to clamp
   * @returns The nearest power of two less than or equal to value
   */
  static _NearestPow2Floor(e) {
    return e <= 1 ? 1 : 1 << Math.floor(Math.log2(e));
  }
  /**
   * Converts a texture to the according Spherical Polynomial data.
   * This extracts the first 3 orders only as they are the only one used in the lighting.
   *
   * @param texture The texture to extract the information from.
   * @returns The Spherical Polynomial data.
   */
  static ConvertCubeMapTextureToSphericalPolynomial(e) {
    var F, w;
    if (!e.isCube)
      return null;
    (F = e.getScene()) == null || F.getEngine().flushFramebuffer();
    const o = e.getSize().width, n = e._sphericalPolynomialTargetSize, s = n > 0 ? this._NearestPow2Floor(n) : 0, y = !e.noMipmap && ((w = e._texture) == null ? void 0 : w.generateMipMaps) === !0, p = s > 0 && s < o && y, i = p ? Math.max(0, Math.round(Math.log2(o / s))) : 0, a = p ? Math.max(1, Math.floor(o / Math.pow(2, i))) : o, C = e.readPixels(0, i, void 0, !1), z = e.readPixels(1, i, void 0, !1);
    let S, r;
    e.isRenderTarget ? (S = e.readPixels(3, i, void 0, !1), r = e.readPixels(2, i, void 0, !1)) : (S = e.readPixels(2, i, void 0, !1), r = e.readPixels(3, i, void 0, !1));
    const T = e.readPixels(4, i, void 0, !1), _ = e.readPixels(5, i, void 0, !1), l = e.gammaSpace, P = 5, f = s > 0 && s < o && !p;
    return new Promise((M) => {
      Promise.all([z, C, S, r, T, _]).then(([c, A, E, d, m, h]) => {
        let g = a;
        f && (c = this._DownsampleFace(c, o, s, 4), A = this._DownsampleFace(A, o, s, 4), E = this._DownsampleFace(E, o, s, 4), d = this._DownsampleFace(d, o, s, 4), m = this._DownsampleFace(m, o, s, 4), h = this._DownsampleFace(h, o, s, 4), g = s);
        const v = {
          size: g,
          right: A,
          left: c,
          up: E,
          down: d,
          front: m,
          back: h,
          format: P,
          type: c instanceof Float32Array ? 1 : 0,
          gammaSpace: l
        };
        M(this.ConvertCubeMapToSphericalPolynomial(v));
      });
    });
  }
  /**
   * Compute the area on the unit sphere of the rectangle defined by (x,y) and the origin
   * See https://www.rorydriscoll.com/2012/01/15/cubemap-texel-solid-angle/
   * @param x
   * @param y
   * @returns the area
   */
  static _AreaElement(e, o) {
    return Math.atan2(e * o, Math.sqrt(e * e + o * o + 1));
  }
  /**
   * Box-filter downsample a single cubemap face.
   * @param data Source face data
   * @param srcSize Source face width/height
   * @param dstSize Target face width/height
   * @param stride Number of components per pixel
   * @returns Downsampled face data
   */
  static _DownsampleFace(e, o, n, s) {
    const y = e instanceof Float32Array ? e : Float32Array.from(e), p = n * n * s, i = new Float32Array(p), a = o / n, C = 1 / (a * a);
    for (let r = 0; r < n; r++) {
      const T = Math.floor(r * a), _ = Math.floor((r + 1) * a);
      for (let l = 0; l < n; l++) {
        const P = Math.floor(l * a), f = Math.floor((l + 1) * a), F = (r * n + l) * s;
        for (let w = 0; w < s; w++) {
          let M = 0;
          for (let c = T; c < _; c++)
            for (let A = P; A < f; A++)
              M += y[(c * o + A) * s + w];
          i[F + w] = M * C;
        }
      }
    }
    if (e instanceof Float32Array)
      return i;
    const z = e.constructor, S = new z(p);
    for (let r = 0; r < p; r++)
      S[r] = i[r] + 0.5 | 0;
    return S;
  }
  /**
   * Converts a cubemap to the according Spherical Polynomial data.
   * This extracts the first 3 orders only as they are the only one used in the lighting.
   *
   * @param cubeInfo The Cube map to extract the information from.
   * @param targetSize Optional target face size for downsampling before integration. 0 = no downsampling (default).
   * @returns The Spherical Polynomial data.
   */
  static ConvertCubeMapToSphericalPolynomial(e, o = 0) {
    const n = o > 0 ? this._NearestPow2Floor(o) : 0;
    if (n > 0 && e.size > n) {
      const _ = e.format === 5 ? 4 : 3, l = ["right", "left", "up", "down", "front", "back"], P = {};
      for (const f of l)
        P[f] = this._DownsampleFace(e[f], e.size, n, _);
      e = { ...e, ...P, size: n };
    }
    const s = new H();
    let y = 0;
    const p = 2 / e.size, i = p, a = 0.5 * p, C = a - 1;
    for (let _ = 0; _ < 6; _++) {
      const l = this._FileFaces[_], P = e[l.name];
      let f = C;
      const F = e.format === 5 ? 4 : 3;
      for (let w = 0; w < e.size; w++) {
        let M = C;
        for (let c = 0; c < e.size; c++) {
          const A = l.worldAxisForFileX.scale(M).add(l.worldAxisForFileY.scale(f)).add(l.worldAxisForNormal);
          A.normalize();
          const E = this._AreaElement(M - a, f - a) - this._AreaElement(M - a, f + a) - this._AreaElement(M + a, f - a) + this._AreaElement(M + a, f + a);
          let d = P[w * e.size * F + c * F + 0], m = P[w * e.size * F + c * F + 1], h = P[w * e.size * F + c * F + 2];
          isNaN(d) && (d = 0), isNaN(m) && (m = 0), isNaN(h) && (h = 0), e.type === 0 && (d /= 255, m /= 255, h /= 255), e.gammaSpace && (d = Math.pow(x(d), R), m = Math.pow(x(m), R), h = Math.pow(x(h), R));
          const g = this.MAX_HDRI_VALUE;
          if (this.PRESERVE_CLAMPED_COLORS) {
            const L = Math.max(d, m, h);
            if (L > g) {
              const N = g / L;
              d *= N, m *= N, h *= N;
            }
          } else
            d = x(d, 0, g), m = x(m, 0, g), h = x(h, 0, g);
          const v = new X(d, m, h);
          s.addLight(A, v, E), y += E, M += p;
        }
        f += i;
      }
    }
    const T = 4 * Math.PI * 6 / 6 / y;
    return s.scaleInPlace(T), s.convertIncidentRadianceToIrradiance(), s.convertIrradianceToLambertianRadiance(), O.FromHarmonics(s);
  }
}
u._FileFaces = [
  new D("right", new t(1, 0, 0), new t(0, 0, -1), new t(0, -1, 0)),
  // +X east
  new D("left", new t(-1, 0, 0), new t(0, 0, 1), new t(0, -1, 0)),
  // -X west
  new D("up", new t(0, 1, 0), new t(1, 0, 0), new t(0, 0, 1)),
  // +Y north
  new D("down", new t(0, -1, 0), new t(1, 0, 0), new t(0, 0, -1)),
  // -Y south
  new D("front", new t(0, 0, 1), new t(1, 0, 0), new t(0, -1, 0)),
  // +Z top
  new D("back", new t(0, 0, -1), new t(-1, 0, 0), new t(0, -1, 0))
  // -Z bottom
];
u.MAX_HDRI_VALUE = 4096;
u.PRESERVE_CLAMPED_COLORS = !1;
export {
  u as C
};
