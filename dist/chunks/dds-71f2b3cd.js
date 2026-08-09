import { D as N } from "./dds.pure-075505e5.js";
import { K as x, Y as R, Z as b, $ as A, a0 as W, n as y } from "./index-11ca32cf.js";
import "./cubemapToSphericalPolynomial-744eba96.js";
function $(e) {
  const o = e.split("?")[0], t = o.lastIndexOf(".");
  return t > -1 ? o.substring(t).toLowerCase() : "";
}
let G = !1;
function B() {
  G || (G = !0, x.prototype._partialLoadFile = function(e, o, t, n, a = null) {
    const r = (s) => {
      t[o] = s, t._internalCount++, t._internalCount === 6 && n(t);
    }, l = (s, f) => {
      a && s && a(s.status + " " + s.statusText, f);
    };
    this._loadFile(e, r, void 0, void 0, !0, l);
  }, x.prototype._cascadeLoadFiles = function(e, o, t, n = null) {
    const a = [];
    a._internalCount = 0;
    for (let r = 0; r < 6; r++)
      this._partialLoadFile(t[r], r, a, o, n);
  }, x.prototype._cascadeLoadImgs = function(e, o, t, n, a = null, r) {
    const l = [];
    l._internalCount = 0;
    for (let s = 0; s < 6; s++)
      this._partialLoadImg(n[s], s, l, e, o, t, a, r);
  }, x.prototype._partialLoadImg = function(e, o, t, n, a, r, l = null, s) {
    const f = R();
    b(e, (p) => {
      t[o] = p, t._internalCount++, n && n.removePendingData(f), t._internalCount === 6 && r && r(a, t);
    }, (p, h) => {
      n && n.removePendingData(f), l && l(p, h);
    }, n ? n.offlineProvider : null, s), n && n.addPendingData(f);
  }, x.prototype.createCubeTextureBase = function(e, o, t, n, a = null, r = null, l, s = null, f = !1, T = 0, m = 0, p = null, h = null, C = null, w = !1, g = null) {
    const i = p || new A(
      this,
      7
      /* InternalTextureSource.Cube */
    );
    i.isCube = !0, i.url = e, i.generateMipMaps = !n, i._lodGenerationScale = T, i._lodGenerationOffset = m, i._useSRGBBuffer = !!w && this._caps.supportSRGBBuffers && (this.version > 1 || this.isWebGPU || !!n), i !== p && (i.label = e.substring(0, 60)), this._doNotHandleContextLost || (i._extension = s, i._files = t, i._buffer = g);
    const L = e;
    this._transformTextureUrl && !p && (e = this._transformTextureUrl(e));
    const I = s ?? $(e), P = W(I), _ = (u, d) => {
      i.dispose(), r ? r(u, d) : u && y.Warn(u);
    }, F = (u, d) => {
      e === L ? u && _(u.status + " " + u.statusText, d) : (y.Warn(`Failed to load ${e}, falling back to the ${L}`), this.createCubeTextureBase(L, o, t, !!n, a, _, l, s, f, T, m, i, h, C, w, g));
    };
    if (P)
      P.then((u) => {
        const d = (c) => {
          h && h(i, c), u.loadCubeData(c, i, f, a, (D, v) => {
            _(D, v);
          });
        };
        g ? d(g) : t && t.length === 6 ? u.supportCascades ? this._cascadeLoadFiles(o, (c) => d(c.map((D) => new Uint8Array(D))), t, _) : _("Textures type does not support cascades.") : this._loadFile(e, (c) => d(new Uint8Array(c)), void 0, o ? o.offlineProvider || null : void 0, !0, F);
      });
    else {
      if (!t || t.length === 0)
        throw new Error("Cannot load cubemap because files were not defined, or the correct loader was not found.");
      this._cascadeLoadImgs(o, i, (u, d) => {
        C && C(u, d);
      }, t, _);
    }
    return this._internalTexturesCache.push(i), i;
  });
}
B();
export {
  N as DDSTools
};
