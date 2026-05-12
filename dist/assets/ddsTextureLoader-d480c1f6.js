import { a as t } from "./offscreenCanvas.worker-e2a35027.js";
import { DDSTools as n } from "./dds-52c04a4d.js";
import "./passPostProcess-7f0a589e.js";
class f {
  constructor() {
    this.supportCascades = !0;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   * @param imgs contains the cube maps
   * @param texture defines the BabylonJS internal texture
   * @param createPolynomials will be true if polynomials have been requested
   * @param onLoad defines the callback to trigger once the texture is ready
   */
  loadCubeData(e, i, m, o) {
    const p = i.getEngine();
    let a, l = !1, d = 1e3;
    if (Array.isArray(e))
      for (let s = 0; s < e.length; s++) {
        const h = e[s];
        a = n.GetDDSInfo(h), i.width = a.width, i.height = a.height, l = (a.isRGB || a.isLuminance || a.mipmapCount > 1) && i.generateMipMaps, p._unpackFlipY(a.isCompressed), n.UploadDDSLevels(p, i, h, a, l, 6, -1, s), !a.isFourCC && a.mipmapCount === 1 ? p.generateMipMapsForCubemap(i) : d = a.mipmapCount - 1;
      }
    else {
      const s = e;
      a = n.GetDDSInfo(s), i.width = a.width, i.height = a.height, m && (a.sphericalPolynomial = new t()), l = (a.isRGB || a.isLuminance || a.mipmapCount > 1) && i.generateMipMaps, p._unpackFlipY(a.isCompressed), n.UploadDDSLevels(p, i, s, a, l, 6), !a.isFourCC && a.mipmapCount === 1 ? p.generateMipMapsForCubemap(i, !1) : d = a.mipmapCount - 1;
    }
    p._setCubeMapTextureParams(i, l, d), i.isReady = !0, i.onLoadedObservable.notifyObservers(i), i.onLoadedObservable.clear(), o && o({ isDDS: !0, width: i.width, info: a, data: e, texture: i });
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   */
  loadData(e, i, m) {
    const o = n.GetDDSInfo(e), p = (o.isRGB || o.isLuminance || o.mipmapCount > 1) && i.generateMipMaps && Math.max(o.width, o.height) >> o.mipmapCount - 1 === 1;
    m(o.width, o.height, p, o.isFourCC, () => {
      n.UploadDDSLevels(i.getEngine(), i, e, o, p, 1);
    });
  }
}
export {
  f as _DDSTextureLoader
};
