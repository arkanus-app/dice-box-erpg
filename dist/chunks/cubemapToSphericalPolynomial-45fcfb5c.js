import { w as V, x as D, V as n, y as H, p as P, z as _ } from "./index-ba22601e.js";
class A {
  constructor(e, i, w, c) {
    this.name = e, this.worldAxisForNormal = i, this.worldAxisForFileX = w, this.worldAxisForFileY = c;
  }
}
class T {
  /**
   * Converts a texture to the according Spherical Polynomial data.
   * This extracts the first 3 orders only as they are the only one used in the lighting.
   *
   * @param texture The texture to extract the information from.
   * @returns The Spherical Polynomial data.
   */
  static ConvertCubeMapTextureToSphericalPolynomial(e) {
    var h;
    if (!e.isCube)
      return null;
    (h = e.getScene()) == null || h.getEngine().flushFramebuffer();
    const i = e.getSize().width, w = e.readPixels(0, void 0, void 0, !1), c = e.readPixels(1, void 0, void 0, !1);
    let S, a;
    e.isRenderTarget ? (S = e.readPixels(3, void 0, void 0, !1), a = e.readPixels(2, void 0, void 0, !1)) : (S = e.readPixels(2, void 0, void 0, !1), a = e.readPixels(3, void 0, void 0, !1));
    const E = e.readPixels(4, void 0, void 0, !1), x = e.readPixels(5, void 0, void 0, !1), R = e.gammaSpace, y = 5;
    let M = 0;
    return (e.textureType == 1 || e.textureType == 2) && (M = 1), new Promise((p) => {
      Promise.all([c, w, S, a, E, x]).then(([F, r, t, f, d, m]) => {
        const u = {
          size: i,
          right: r,
          left: F,
          up: t,
          down: f,
          front: d,
          back: m,
          format: y,
          type: M,
          gammaSpace: R
        };
        p(this.ConvertCubeMapToSphericalPolynomial(u));
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
  static _AreaElement(e, i) {
    return Math.atan2(e * i, Math.sqrt(e * e + i * i + 1));
  }
  /**
   * Converts a cubemap to the according Spherical Polynomial data.
   * This extracts the first 3 orders only as they are the only one used in the lighting.
   *
   * @param cubeInfo The Cube map to extract the information from.
   * @returns The Spherical Polynomial data.
   */
  static ConvertCubeMapToSphericalPolynomial(e) {
    const i = new V();
    let w = 0;
    const c = 2 / e.size, S = c, a = 0.5 * c, E = a - 1;
    for (let h = 0; h < 6; h++) {
      const p = this._FileFaces[h], F = e[p.name];
      let r = E;
      const t = e.format === 5 ? 4 : 3;
      for (let f = 0; f < e.size; f++) {
        let d = E;
        for (let m = 0; m < e.size; m++) {
          const u = p.worldAxisForFileX.scale(d).add(p.worldAxisForFileY.scale(r)).add(p.worldAxisForNormal);
          u.normalize();
          const z = this._AreaElement(d - a, r - a) - this._AreaElement(d - a, r + a) - this._AreaElement(d + a, r - a) + this._AreaElement(d + a, r + a);
          let s = F[f * e.size * t + m * t + 0], o = F[f * e.size * t + m * t + 1], l = F[f * e.size * t + m * t + 2];
          isNaN(s) && (s = 0), isNaN(o) && (o = 0), isNaN(l) && (l = 0), e.type === 0 && (s /= 255, o /= 255, l /= 255), e.gammaSpace && (s = Math.pow(P(s), _), o = Math.pow(P(o), _), l = Math.pow(P(l), _));
          const g = this.MAX_HDRI_VALUE;
          if (this.PRESERVE_CLAMPED_COLORS) {
            const L = Math.max(s, o, l);
            if (L > g) {
              const C = g / L;
              s *= C, o *= C, l *= C;
            }
          } else
            s = P(s, 0, g), o = P(o, 0, g), l = P(l, 0, g);
          const v = new H(s, o, l);
          i.addLight(u, v, z), w += z, d += c;
        }
        r += S;
      }
    }
    const M = 4 * Math.PI * 6 / 6 / w;
    return i.scaleInPlace(M), i.convertIncidentRadianceToIrradiance(), i.convertIrradianceToLambertianRadiance(), D.FromHarmonics(i);
  }
}
T._FileFaces = [
  new A("right", new n(1, 0, 0), new n(0, 0, -1), new n(0, -1, 0)),
  // +X east
  new A("left", new n(-1, 0, 0), new n(0, 0, 1), new n(0, -1, 0)),
  // -X west
  new A("up", new n(0, 1, 0), new n(1, 0, 0), new n(0, 0, 1)),
  // +Y north
  new A("down", new n(0, -1, 0), new n(1, 0, 0), new n(0, 0, -1)),
  // -Y south
  new A("front", new n(0, 0, 1), new n(1, 0, 0), new n(0, -1, 0)),
  // +Z top
  new A("back", new n(0, 0, -1), new n(-1, 0, 0), new n(0, -1, 0))
  // -Z bottom
];
T.MAX_HDRI_VALUE = 4096;
T.PRESERVE_CLAMPED_COLORS = !1;
export {
  T as C
};
