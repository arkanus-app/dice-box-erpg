import { V as r, n as D, aS as S, b6 as x, j as W, s as Y, a1 as G, p as U, R as B } from "./Dice-b8dad4fa.js";
import { d as Z, S as j, a as k, E as X, P as H } from "./postProcess-ee182885.js";
class A {
  constructor(e, a, n, t) {
    this.name = e, this.worldAxisForNormal = a, this.worldAxisForFileX = n, this.worldAxisForFileY = t;
  }
}
class N {
  /**
   * Converts a texture to the according Spherical Polynomial data.
   * This extracts the first 3 orders only as they are the only one used in the lighting.
   *
   * @param texture The texture to extract the information from.
   * @returns The Spherical Polynomial data.
   */
  static ConvertCubeMapTextureToSphericalPolynomial(e) {
    var P;
    if (!e.isCube)
      return null;
    (P = e.getScene()) == null || P.getEngine().flushFramebuffer();
    const a = e.getSize().width, n = e.readPixels(0, void 0, void 0, !1), t = e.readPixels(1, void 0, void 0, !1);
    let i, s;
    e.isRenderTarget ? (i = e.readPixels(3, void 0, void 0, !1), s = e.readPixels(2, void 0, void 0, !1)) : (i = e.readPixels(2, void 0, void 0, !1), s = e.readPixels(3, void 0, void 0, !1));
    const d = e.readPixels(4, void 0, void 0, !1), g = e.readPixels(5, void 0, void 0, !1), f = e.gammaSpace, z = 5;
    let T = 0;
    return (e.textureType == 1 || e.textureType == 2) && (T = 1), new Promise((E) => {
      Promise.all([t, n, i, s, d, g]).then(([F, m, u, h, p, w]) => {
        const b = {
          size: a,
          right: m,
          left: F,
          up: u,
          down: h,
          front: p,
          back: w,
          format: z,
          type: T,
          gammaSpace: f
        };
        E(this.ConvertCubeMapToSphericalPolynomial(b));
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
  static _AreaElement(e, a) {
    return Math.atan2(e * a, Math.sqrt(e * e + a * a + 1));
  }
  /**
   * Converts a cubemap to the according Spherical Polynomial data.
   * This extracts the first 3 orders only as they are the only one used in the lighting.
   *
   * @param cubeInfo The Cube map to extract the information from.
   * @returns The Spherical Polynomial data.
   */
  static ConvertCubeMapToSphericalPolynomial(e) {
    const a = new Z();
    let n = 0;
    const t = 2 / e.size, i = t, s = 0.5 * t, d = s - 1;
    for (let P = 0; P < 6; P++) {
      const E = this._FileFaces[P], F = e[E.name];
      let m = d;
      const u = e.format === 5 ? 4 : 3;
      for (let h = 0; h < e.size; h++) {
        let p = d;
        for (let w = 0; w < e.size; w++) {
          const b = E.worldAxisForFileX.scale(p).add(E.worldAxisForFileY.scale(m)).add(E.worldAxisForNormal);
          b.normalize();
          const L = this._AreaElement(p - s, m - s) - this._AreaElement(p - s, m + s) - this._AreaElement(p + s, m - s) + this._AreaElement(p + s, m + s);
          let l = F[h * e.size * u + w * u + 0], o = F[h * e.size * u + w * u + 1], c = F[h * e.size * u + w * u + 2];
          isNaN(l) && (l = 0), isNaN(o) && (o = 0), isNaN(c) && (c = 0), e.type === 0 && (l /= 255, o /= 255, c /= 255), e.gammaSpace && (l = Math.pow(S(l), x), o = Math.pow(S(o), x), c = Math.pow(S(c), x));
          const C = this.MAX_HDRI_VALUE;
          if (this.PRESERVE_CLAMPED_COLORS) {
            const O = Math.max(l, o, c);
            if (O > C) {
              const I = C / O;
              l *= I, o *= I, c *= I;
            }
          } else
            l = S(l, 0, C), o = S(o, 0, C), c = S(c, 0, C);
          const v = new D(l, o, c);
          a.addLight(b, v, L), n += L, p += t;
        }
        m += i;
      }
    }
    const T = 4 * Math.PI * 6 / 6 / n;
    return a.scaleInPlace(T), a.convertIncidentRadianceToIrradiance(), a.convertIrradianceToLambertianRadiance(), j.FromHarmonics(a);
  }
}
N._FileFaces = [
  new A("right", new r(1, 0, 0), new r(0, 0, -1), new r(0, -1, 0)),
  // +X east
  new A("left", new r(-1, 0, 0), new r(0, 0, 1), new r(0, -1, 0)),
  // -X west
  new A("up", new r(0, 1, 0), new r(1, 0, 0), new r(0, 0, 1)),
  // +Y north
  new A("down", new r(0, -1, 0), new r(1, 0, 0), new r(0, 0, -1)),
  // -Y south
  new A("front", new r(0, 0, 1), new r(1, 0, 0), new r(0, -1, 0)),
  // +Z top
  new A("back", new r(0, 0, -1), new r(-1, 0, 0), new r(0, -1, 0))
  // -Z bottom
];
N.MAX_HDRI_VALUE = 4096;
N.PRESERVE_CLAMPED_COLORS = !1;
class _ extends k {
  _gatherImports(e, a) {
    e ? (this._webGPUReady = !0, a.push(Promise.all([import("./pass.fragment-fa23a157.js")]))) : a.push(Promise.all([import("./pass.fragment-40176876.js")])), super._gatherImports(e, a);
  }
  /**
   * Constructs a new pass post process
   * @param name Name of the effect
   * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
   * @param options Options to configure the effect
   */
  constructor(e, a = null, n) {
    super({
      ...n,
      name: e,
      engine: a || X.LastCreatedEngine,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: _.FragmentUrl
    });
  }
}
_.FragmentUrl = "pass";
class M extends k {
  _gatherImports(e, a) {
    e ? (this._webGPUReady = !0, a.push(Promise.all([import("./passCube.fragment-13260279.js")]))) : a.push(Promise.all([import("./passCube.fragment-12867d49.js")])), super._gatherImports(e, a);
  }
  /**
   * Creates the PassCubePostProcess
   * @param name Name of the effect
   * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
   * @param options Options to configure the effect
   */
  constructor(e, a = null, n) {
    super({
      ...n,
      name: e,
      engine: a || X.LastCreatedEngine,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: M.FragmentUrl,
      defines: "#define POSITIVEX"
    }), this._face = 0;
  }
  /**
   * Gets or sets the cube face to display.
   *  * 0 is +X
   *  * 1 is -X
   *  * 2 is +Y
   *  * 3 is -Y
   *  * 4 is +Z
   *  * 5 is -Z
   */
  get face() {
    return this._face;
  }
  set face(e) {
    if (!(e < 0 || e > 5))
      switch (this._face = e, this._face) {
        case 0:
          this.updateEffect("#define POSITIVEX");
          break;
        case 1:
          this.updateEffect("#define NEGATIVEX");
          break;
        case 2:
          this.updateEffect("#define POSITIVEY");
          break;
        case 3:
          this.updateEffect("#define NEGATIVEY");
          break;
        case 4:
          this.updateEffect("#define POSITIVEZ");
          break;
        case 5:
          this.updateEffect("#define NEGATIVEZ");
          break;
      }
  }
}
M.FragmentUrl = "passCube";
class y extends H {
  /**
   * Gets a string identifying the name of the class
   * @returns "PassPostProcess" string
   */
  getClassName() {
    return "PassPostProcess";
  }
  /**
   * Creates the PassPostProcess
   * @param name The name of the effect.
   * @param options The required width/height ratio to downsize to before computing the render pass.
   * @param camera The camera to apply the render pass to.
   * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
   * @param engine The engine which the post process will be applied. (default: current engine)
   * @param reusable If the post process can be reused on the same frame. (default: false)
   * @param textureType The type of texture to be used when performing the post processing.
   * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
   */
  constructor(e, a, n = null, t, i, s, d = 0, g = !1) {
    const f = {
      size: typeof a == "number" ? a : void 0,
      camera: n,
      samplingMode: t,
      engine: i,
      reusable: s,
      textureType: d,
      blockCompilation: g,
      ...a
    };
    super(e, _.FragmentUrl, {
      effectWrapper: typeof a == "number" || !a.effectWrapper ? new _(e, i, f) : void 0,
      ...f
    });
  }
  /**
   * @internal
   */
  static _Parse(e, a, n, t) {
    return U.Parse(() => new y(e.name, e.options, a, e.renderTargetSamplingMode, e._engine, e.reusable), e, n, t);
  }
}
B("BABYLON.PassPostProcess", y);
class V extends H {
  /**
   * Gets or sets the cube face to display.
   *  * 0 is +X
   *  * 1 is -X
   *  * 2 is +Y
   *  * 3 is -Y
   *  * 4 is +Z
   *  * 5 is -Z
   */
  get face() {
    return this._effectWrapper.face;
  }
  set face(e) {
    this._effectWrapper.face = e;
  }
  /**
   * Gets a string identifying the name of the class
   * @returns "PassCubePostProcess" string
   */
  getClassName() {
    return "PassCubePostProcess";
  }
  /**
   * Creates the PassCubePostProcess
   * @param name The name of the effect.
   * @param options The required width/height ratio to downsize to before computing the render pass.
   * @param camera The camera to apply the render pass to.
   * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
   * @param engine The engine which the post process will be applied. (default: current engine)
   * @param reusable If the post process can be reused on the same frame. (default: false)
   * @param textureType The type of texture to be used when performing the post processing.
   * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
   */
  constructor(e, a, n = null, t, i, s, d = 0, g = !1) {
    const f = {
      size: typeof a == "number" ? a : void 0,
      camera: n,
      samplingMode: t,
      engine: i,
      reusable: s,
      textureType: d,
      blockCompilation: g,
      ...a
    };
    super(e, _.FragmentUrl, {
      effectWrapper: typeof a == "number" || !a.effectWrapper ? new M(e, i, f) : void 0,
      ...f
    });
  }
  /**
   * @internal
   */
  static _Parse(e, a, n, t) {
    return U.Parse(() => new V(e.name, e.options, a, e.renderTargetSamplingMode, e._engine, e.reusable), e, n, t);
  }
}
W([
  Y()
], V.prototype, "face", null);
G._RescalePostProcessFactory = (R) => new y("rescale", 1, null, 2, R, !1, 0);
export {
  N as C
};
