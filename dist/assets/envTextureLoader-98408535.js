import { B as C, c as U, I as D, T as B, e as z, P as G, a as V, V as m } from "./offscreenCanvas.worker-e2a35027.js";
import { C as k } from "./passPostProcess-7f0a589e.js";
import "./dumpTools-7044faca.js";
C.prototype.forceSphericalPolynomialsRecompute = function() {
  this._texture && (this._texture._sphericalPolynomial = null, this._texture._sphericalPolynomialPromise = null, this._texture._sphericalPolynomialComputed = !1);
};
Object.defineProperty(C.prototype, "sphericalPolynomial", {
  get: function() {
    if (this._texture) {
      if (this._texture._sphericalPolynomial || this._texture._sphericalPolynomialComputed)
        return this._texture._sphericalPolynomial;
      if (this._texture.isReady)
        return this._texture._sphericalPolynomialPromise || (this._texture._sphericalPolynomialPromise = k.ConvertCubeMapTextureToSphericalPolynomial(this), this._texture._sphericalPolynomialPromise === null ? this._texture._sphericalPolynomialComputed = !0 : this._texture._sphericalPolynomialPromise.then((e) => {
          this._texture._sphericalPolynomial = e, this._texture._sphericalPolynomialComputed = !0;
        })), null;
    }
    return null;
  },
  set: function(e) {
    this._texture && (this._texture._sphericalPolynomial = e);
  },
  enumerable: !0,
  configurable: !0
});
const R = "image/png", P = 2, F = [134, 22, 135, 150, 246, 214, 150, 54];
function H(e) {
  const a = new DataView(e.buffer, e.byteOffset, e.byteLength);
  let r = 0;
  for (let i = 0; i < F.length; i++)
    if (a.getUint8(r++) !== F[i])
      return U.Error("Not a babylon environment map"), null;
  let n = "", o = 0;
  for (; o = a.getUint8(r++); )
    n += String.fromCharCode(o);
  let t = JSON.parse(n);
  return t = A(t), t.binaryDataPosition = r, t.specular && (t.specular.lodGenerationScale = t.specular.lodGenerationScale || 0.8), t;
}
function A(e) {
  if (e.version > P)
    throw new Error(`Unsupported babylon environment map version "${e.version}". Latest supported version is "${P}".`);
  return e.version === 2 || (e = { ...e, version: 2, imageType: R }), e;
}
function E(e, a) {
  a = A(a);
  const r = a.specular;
  let n = Math.log2(a.width);
  if (n = Math.round(n) + 1, r.mipmaps.length !== 6 * n)
    throw new Error(`Unsupported specular mipmaps number "${r.mipmaps.length}"`);
  const o = new Array(n);
  for (let t = 0; t < n; t++) {
    o[t] = new Array(6);
    for (let i = 0; i < 6; i++) {
      const l = r.mipmaps[t * 6 + i];
      o[t][i] = new Uint8Array(e.buffer, e.byteOffset + a.binaryDataPosition + l.position, l.length);
    }
  }
  return o;
}
function N(e, a) {
  var o;
  a = A(a);
  const r = new Array(6), n = (o = a.irradiance) == null ? void 0 : o.irradianceTexture;
  if (n) {
    if (n.faces.length !== 6)
      throw new Error(`Incorrect irradiance texture faces number "${n.faces.length}"`);
    for (let t = 0; t < 6; t++) {
      const i = n.faces[t];
      r[t] = new Uint8Array(e.buffer, e.byteOffset + a.binaryDataPosition + i.position, i.length);
    }
  }
  return r;
}
function $(e, a, r) {
  var l;
  r = A(r);
  const n = r.specular;
  if (!n)
    return Promise.resolve([]);
  e._lodGenerationScale = n.lodGenerationScale;
  const o = [], t = E(a, r);
  o.push(Y(e, t, r.imageType));
  const i = (l = r.irradiance) == null ? void 0 : l.irradianceTexture;
  if (i) {
    const f = N(a, r);
    o.push(j(e, f, i.size, r.imageType));
  }
  return Promise.all(o);
}
function S(e, a, r, n, o, t, i, l, f, p, T) {
  return new Promise((h, I) => {
    if (r) {
      const y = a.createTexture(null, !0, !0, null, 1, null, (s) => {
        I(s);
      }, e);
      n == null || n.onEffectCreatedObservable.addOnce((s) => {
        s.executeWhenCompiled(() => {
          n.externalTextureSamplerBinding = !0, n.onApply = (c) => {
            c._bindTexture("textureSampler", y), c.setFloat2("scale", 1, a._features.needsInvertingBitmap && e instanceof ImageBitmap ? -1 : 1);
          }, a.scenes.length && (a.scenes[0].postProcessManager.directRender([n], p, !0, t, i), a.restoreDefaultFramebuffer(), y.dispose(), URL.revokeObjectURL(o), h());
        });
      });
    } else {
      if (a._uploadImageToTexture(T, e, t, i), l) {
        const y = f[i];
        y && a._uploadImageToTexture(y._texture, e, t, 0);
      }
      h();
    }
  });
}
async function Y(e, a, r = R) {
  const n = e.getEngine();
  e.format = 5, e.type = 0, e.generateMipMaps = !0, e._cachedAnisotropicFilteringLevel = null, n.updateTextureSamplingMode(3, e), await O(e, a, !0, r), e.isReady = !0;
}
async function j(e, a, r, n = R) {
  const o = e.getEngine(), t = new D(
    o,
    5
    /* InternalTextureSource.RenderTarget */
  ), i = new C(o, t);
  e._irradianceTexture = i, t.isCube = !0, t.format = 5, t.type = 0, t.generateMipMaps = !0, t._cachedAnisotropicFilteringLevel = null, t.generateMipMaps = !0, t.width = r, t.height = r, o.updateTextureSamplingMode(3, t), await O(t, [a], !1, n), o.generateMipMapsForCubemap(t), t.isReady = !0;
}
async function O(e, a, r, n = R) {
  if (!B.IsExponentOfTwo(e.width))
    throw new Error("Texture size must be a power of two");
  const o = z(e.width) + 1, t = e.getEngine();
  let i = !1, l = !1, f = null, p = null, T = null;
  const h = t.getCaps();
  h.textureLOD ? t._features.supportRenderAndCopyToLodForFloatTextures ? h.textureHalfFloatRender && h.textureHalfFloatLinearFiltering ? (i = !0, e.type = 2) : h.textureFloatRender && h.textureFloatLinearFiltering && (i = !0, e.type = 1) : i = !1 : (i = !1, l = r);
  let I = 0;
  if (i)
    t.isWebGPU ? (I = 1, await import("./rgbdDecode.fragment-affbf720.js")) : await import("./rgbdDecode.fragment-0b274fdf.js"), f = new G("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, t, !1, void 0, e.type, void 0, null, !1, void 0, I), e._isRGBD = !1, e.invertY = !1, p = t.createRenderTargetCubeTexture(e.width, {
      generateDepthBuffer: !1,
      generateMipMaps: !0,
      generateStencilBuffer: !1,
      samplingMode: 3,
      type: e.type,
      format: 5
    });
  else if (e._isRGBD = !0, e.invertY = !0, l) {
    T = {};
    const c = e._lodGenerationScale, _ = e._lodGenerationOffset;
    for (let u = 0; u < 3; u++) {
      const w = 1 - u / 2, d = _, L = (o - 1) * c + _, M = d + (L - d) * w, b = Math.round(Math.min(Math.max(M, 0), L)), v = new D(
        t,
        2
        /* InternalTextureSource.Temp */
      );
      v.isCube = !0, v.invertY = !0, v.generateMipMaps = !1, t.updateTextureSamplingMode(2, v);
      const x = new C(null);
      switch (x._isCube = !0, x._texture = v, T[b] = x, u) {
        case 0:
          e._lodTextureLow = x;
          break;
        case 1:
          e._lodTextureMid = x;
          break;
        case 2:
          e._lodTextureHigh = x;
          break;
      }
    }
  }
  const y = [];
  for (let s = 0; s < a.length; s++)
    for (let c = 0; c < 6; c++) {
      const _ = a[s][c], u = new Blob([_], { type: n }), g = URL.createObjectURL(u);
      let w;
      if (t._features.forceBitmapOverHTMLImageElement)
        w = t.createImageBitmap(u, { premultiplyAlpha: "none" }).then((d) => S(d, t, i, f, g, c, s, l, T, p, e));
      else {
        const d = new Image();
        d.src = g, w = new Promise((L, M) => {
          d.onload = () => {
            S(d, t, i, f, g, c, s, l, T, p, e).then(() => L()).catch((b) => {
              M(b);
            });
          }, d.onerror = (b) => {
            M(b);
          };
        });
      }
      y.push(w);
    }
  if (await Promise.all(y), a.length < o) {
    let s;
    const c = Math.pow(2, o - 1 - a.length), _ = c * c * 4;
    switch (e.type) {
      case 0: {
        s = new Uint8Array(_);
        break;
      }
      case 2: {
        s = new Uint16Array(_);
        break;
      }
      case 1: {
        s = new Float32Array(_);
        break;
      }
    }
    for (let u = a.length; u < o; u++)
      for (let g = 0; g < 6; g++)
        t._uploadArrayBufferViewToTexture((p == null ? void 0 : p.texture) || e, s, g, u);
  }
  if (p) {
    const s = e._irradianceTexture;
    e._irradianceTexture = null, t._releaseTexture(e), p._swapAndDie(e), e._irradianceTexture = s;
  }
  f && f.dispose(), l && (e._lodTextureHigh && e._lodTextureHigh._texture && (e._lodTextureHigh._texture.isReady = !0), e._lodTextureMid && e._lodTextureMid._texture && (e._lodTextureMid._texture.isReady = !0), e._lodTextureLow && e._lodTextureLow._texture && (e._lodTextureLow._texture.isReady = !0));
}
function W(e, a) {
  a = A(a);
  const r = a.irradiance;
  if (!r)
    return;
  const n = new V();
  m.FromArrayToRef(r.x, 0, n.x), m.FromArrayToRef(r.y, 0, n.y), m.FromArrayToRef(r.z, 0, n.z), m.FromArrayToRef(r.xx, 0, n.xx), m.FromArrayToRef(r.yy, 0, n.yy), m.FromArrayToRef(r.zz, 0, n.zz), m.FromArrayToRef(r.yz, 0, n.yz), m.FromArrayToRef(r.zx, 0, n.zx), m.FromArrayToRef(r.xy, 0, n.xy), e._sphericalPolynomial = n;
}
class Q {
  constructor() {
    this.supportCascades = !1;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param createPolynomials will be true if polynomials have been requested
   * @param onLoad defines the callback to trigger once the texture is ready
   * @param onError defines the callback to trigger in case of error
   */
  loadCubeData(a, r, n, o, t) {
    if (Array.isArray(a))
      return;
    const i = H(a);
    if (i) {
      r.width = i.width, r.height = i.width;
      try {
        W(r, i), $(r, a, i).then(() => {
          r.isReady = !0, r.onLoadedObservable.notifyObservers(r), r.onLoadedObservable.clear(), o && o();
        }, (l) => {
          t == null || t("Can not upload environment levels", l);
        });
      } catch (l) {
        t == null || t("Can not upload environment file", l);
      }
    } else
      t && t("Can not parse the environment file", null);
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   */
  loadData() {
    throw ".env not supported in 2d.";
  }
}
export {
  Q as _ENVTextureLoader
};
