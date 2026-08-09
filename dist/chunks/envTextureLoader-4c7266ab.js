import { n as U, V as m, $ as O, a1 as A, a2 as z, a3 as G, a4 as V, j as k } from "./index-11ca32cf.js";
import { P as H } from "./postProcess.pure-bf549f59.js";
import { C as E } from "./cubemapToSphericalPolynomial-744eba96.js";
const M = "image/png", P = 2, F = [134, 22, 135, 150, 246, 214, 150, 54];
function $(e) {
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength);
  let r = 0;
  for (let a = 0; a < F.length; a++)
    if (n.getUint8(r++) !== F[a])
      return U.Error("Not a babylon environment map"), null;
  let i = "", o;
  for (; o = n.getUint8(r++); )
    i += String.fromCharCode(o);
  let t = JSON.parse(i);
  return t = R(t), t.binaryDataPosition = r, t.specular && (t.specular.lodGenerationScale = t.specular.lodGenerationScale || 0.8), t;
}
function R(e) {
  if (e.version > P)
    throw new Error(`Unsupported babylon environment map version "${e.version}". Latest supported version is "${P}".`);
  return e.version === 2 || (e = { ...e, version: 2, imageType: M }), e;
}
function N(e, n) {
  n = R(n);
  const r = n.specular;
  let i = Math.log2(n.width);
  if (i = Math.round(i) + 1, r.mipmaps.length !== 6 * i)
    throw new Error(`Unsupported specular mipmaps number "${r.mipmaps.length}"`);
  const o = new Array(i);
  for (let t = 0; t < i; t++) {
    o[t] = new Array(6);
    for (let a = 0; a < 6; a++) {
      const l = r.mipmaps[t * 6 + a];
      o[t][a] = new Uint8Array(e.buffer, e.byteOffset + n.binaryDataPosition + l.position, l.length);
    }
  }
  return o;
}
function j(e, n) {
  var o;
  n = R(n);
  const r = new Array(6), i = (o = n.irradiance) == null ? void 0 : o.irradianceTexture;
  if (i) {
    if (i.faces.length !== 6)
      throw new Error(`Incorrect irradiance texture faces number "${i.faces.length}"`);
    for (let t = 0; t < 6; t++) {
      const a = i.faces[t];
      r[t] = new Uint8Array(e.buffer, e.byteOffset + n.binaryDataPosition + a.position, a.length);
    }
  }
  return r;
}
function Y(e, n, r) {
  var l, f, c;
  r = R(r);
  const i = r.specular;
  if (!i)
    return Promise.resolve([]);
  e._lodGenerationScale = i.lodGenerationScale;
  const o = [], t = N(n, r);
  o.push(W(e, t, r.imageType));
  const a = (l = r.irradiance) == null ? void 0 : l.irradianceTexture;
  if (a) {
    const _ = j(n, r);
    let p = null;
    (c = (f = r.irradiance) == null ? void 0 : f.irradianceTexture) != null && c.dominantDirection && (p = m.FromArray(r.irradiance.irradianceTexture.dominantDirection)), o.push(J(e, _, a.size, r.imageType, p));
  }
  return Promise.all(o);
}
async function S(e, n, r, i, o, t, a, l, f, c, _) {
  return await new Promise((p, C) => {
    if (r) {
      const g = n.createTexture(null, !0, !0, null, 1, null, (s) => {
        C(s);
      }, e);
      i == null || i.onEffectCreatedObservable.addOnce((s) => {
        s.executeWhenCompiled(() => {
          i.externalTextureSamplerBinding = !0, i.onApply = (u) => {
            u._bindTexture("textureSampler", g), u.setFloat2("scale", 1, n._features.needsInvertingBitmap && e instanceof ImageBitmap ? -1 : 1);
          }, n.scenes.length && (n.scenes[0].postProcessManager.directRender([i], c, !0, t, a), n.restoreDefaultFramebuffer(), g.dispose(), URL.revokeObjectURL(o), p());
        });
      });
    } else {
      if (n._uploadImageToTexture(_, e, t, a), l) {
        const g = f[a];
        g && n._uploadImageToTexture(g._texture, e, t, 0);
      }
      p();
    }
  });
}
async function W(e, n, r = M) {
  const i = e.getEngine();
  e.format = 5, e.type = 0, e.generateMipMaps = !0, e._cachedAnisotropicFilteringLevel = null, i.updateTextureSamplingMode(3, e), await B(e, n, !0, r), e.isReady = !0;
}
async function J(e, n, r, i = M, o = null) {
  const t = e.getEngine(), a = new O(
    t,
    5
    /* InternalTextureSource.RenderTarget */
  ), l = new A(t, a);
  e._irradianceTexture = l, l._dominantDirection = o, a.isCube = !0, a.format = 5, a.type = 0, a.generateMipMaps = !0, a._cachedAnisotropicFilteringLevel = null, a.generateMipMaps = !0, a.width = r, a.height = r, t.updateTextureSamplingMode(3, a), await B(a, [n], !1, i), t.generateMipMapsForCubemap(a), a.isReady = !0;
}
async function B(e, n, r, i = M) {
  if (!z(e.width))
    throw new Error("Texture size must be a power of two");
  const o = G(e.width) + 1, t = e.getEngine();
  let a = !1, l = !1, f = null, c = null, _ = null;
  const p = t.getCaps();
  p.textureLOD ? t._features.supportRenderAndCopyToLodForFloatTextures ? p.textureHalfFloatRender && p.textureHalfFloatLinearFiltering ? (a = !0, e.type = 2) : p.textureFloatRender && p.textureFloatLinearFiltering && (a = !0, e.type = 1) : a = !1 : (a = !1, l = r);
  let C = 0;
  if (a)
    t.isWebGPU ? (C = 1, await import("./rgbdDecode.fragment-a7759ca2.js")) : await import("./rgbdDecode.fragment-d6e46f39.js"), f = new H("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, t, !1, void 0, e.type, void 0, null, !1, void 0, C), e._isRGBD = !1, e.invertY = !1, c = t.createRenderTargetCubeTexture(e.width, {
      generateDepthBuffer: !1,
      generateMipMaps: !0,
      generateStencilBuffer: !1,
      samplingMode: 3,
      type: e.type,
      format: 5
    });
  else if (e._isRGBD = !0, e.invertY = !0, l) {
    _ = {};
    const u = e._lodGenerationScale, T = e._lodGenerationOffset;
    for (let d = 0; d < 3; d++) {
      const v = 1 - d / 2, w = T, h = (o - 1) * u + T, I = w + (h - w) * v, L = Math.round(Math.min(Math.max(I, 0), h)), y = new O(
        t,
        2
        /* InternalTextureSource.Temp */
      );
      y.isCube = !0, y.invertY = !0, y.generateMipMaps = !1, t.updateTextureSamplingMode(2, y);
      const b = new A(null);
      switch (b._isCube = !0, b._texture = y, _[L] = b, d) {
        case 0:
          e._lodTextureLow = b;
          break;
        case 1:
          e._lodTextureMid = b;
          break;
        case 2:
          e._lodTextureHigh = b;
          break;
      }
    }
  }
  const g = [];
  for (let s = 0; s < n.length; s++)
    for (let u = 0; u < 6; u++) {
      const T = n[s][u], d = V(T), x = new Blob([d], { type: i }), v = URL.createObjectURL(x);
      let w;
      if (t._features.forceBitmapOverHTMLImageElement)
        w = t.createImageBitmap(x, { premultiplyAlpha: "none", colorSpaceConversion: "none" }).then(async (h) => await S(h, t, a, f, v, u, s, l, _, c, e));
      else {
        const h = new Image();
        h.src = v, w = new Promise((I, L) => {
          h.onload = () => {
            S(h, t, a, f, v, u, s, l, _, c, e).then(() => I()).catch((y) => {
              L(y);
            });
          }, h.onerror = (y) => {
            L(y);
          };
        });
      }
      g.push(w);
    }
  if (await Promise.all(g), n.length < o) {
    let s;
    const u = Math.pow(2, o - 1 - n.length), T = u * u * 4;
    switch (e.type) {
      case 0: {
        s = new Uint8Array(T);
        break;
      }
      case 2: {
        s = new Uint16Array(T);
        break;
      }
      case 1: {
        s = new Float32Array(T);
        break;
      }
    }
    for (let d = n.length; d < o; d++)
      for (let x = 0; x < 6; x++)
        t._uploadArrayBufferViewToTexture((c == null ? void 0 : c.texture) || e, s, x, d);
  }
  if (c) {
    const s = e._irradianceTexture;
    e._irradianceTexture = null, t._releaseTexture(e), c._swapAndDie(e), e._irradianceTexture = s;
  }
  f && f.dispose(), l && (e._lodTextureHigh && e._lodTextureHigh._texture && (e._lodTextureHigh._texture.isReady = !0), e._lodTextureMid && e._lodTextureMid._texture && (e._lodTextureMid._texture.isReady = !0), e._lodTextureLow && e._lodTextureLow._texture && (e._lodTextureLow._texture.isReady = !0));
}
function q(e, n) {
  n = R(n);
  const r = n.irradiance;
  if (!r)
    return;
  const i = new k();
  m.FromArrayToRef(r.x, 0, i.x), m.FromArrayToRef(r.y, 0, i.y), m.FromArrayToRef(r.z, 0, i.z), m.FromArrayToRef(r.xx, 0, i.xx), m.FromArrayToRef(r.yy, 0, i.yy), m.FromArrayToRef(r.zz, 0, i.zz), m.FromArrayToRef(r.yz, 0, i.yz), m.FromArrayToRef(r.zx, 0, i.zx), m.FromArrayToRef(r.xy, 0, i.xy), e._sphericalPolynomial = i;
}
let D = !1;
function K() {
  D || (D = !0, A.prototype._sphericalPolynomialTargetSize = 0, A.prototype.forceSphericalPolynomialsRecompute = function() {
    this._texture && (this._texture._sphericalPolynomial = null, this._texture._sphericalPolynomialPromise = null, this._texture._sphericalPolynomialComputed = !1);
  }, Object.defineProperty(A.prototype, "sphericalPolynomial", {
    get: function() {
      if (this._texture) {
        if (this._texture._sphericalPolynomial || this._texture._sphericalPolynomialComputed)
          return this._texture._sphericalPolynomial;
        if (this._texture.isReady)
          return this._texture._sphericalPolynomialPromise || (this._texture._sphericalPolynomialPromise = E.ConvertCubeMapTextureToSphericalPolynomial(this), this._texture._sphericalPolynomialPromise === null ? this._texture._sphericalPolynomialComputed = !0 : this._texture._sphericalPolynomialPromise.then((e) => {
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
  }));
}
class ee {
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
  loadCubeData(n, r, i, o, t) {
    if (Array.isArray(n))
      return;
    const a = $(n);
    if (a) {
      r.width = a.width, r.height = a.width;
      try {
        K(), q(r, a), Y(r, n, a).then(() => {
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
  ee as _ENVTextureLoader
};
