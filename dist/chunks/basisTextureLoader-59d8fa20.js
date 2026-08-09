import { Q as F, $ as v, n as D, a as R } from "./index-11ca32cf.js";
function U() {
  const e = {
    cTFETC1: 0,
    cTFETC2: 1,
    cTFBC1: 2,
    cTFBC3: 3,
    cTFBC4: 4,
    cTFBC5: 5,
    cTFBC7: 6,
    cTFPVRTC1_4_RGB: 8,
    cTFPVRTC1_4_RGBA: 9,
    cTFASTC_4x4: 10,
    cTFATC_RGB: 11,
    cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
    cTFRGBA32: 13,
    cTFRGB565: 14,
    cTFBGR565: 15,
    cTFRGBA4444: 16,
    cTFFXT1_RGB: 17,
    cTFPVRTC2_4_RGB: 18,
    cTFPVRTC2_4_RGBA: 19,
    cTFETC2_EAC_R11: 20,
    cTFETC2_EAC_RG11: 21
  };
  let n = null;
  onmessage = (t) => {
    if (t.data.action === "init") {
      if (t.data.url)
        try {
          importScripts(t.data.url);
        } catch (o) {
          postMessage({ action: "error", error: o });
        }
      n || (n = BASIS({
        // Override wasm binary
        wasmBinary: t.data.wasmBinary
      })), n !== null && n.then((o) => {
        BASIS = o, o.initializeBasis(), postMessage({ action: "init" });
      });
    } else if (t.data.action === "transcode") {
      const o = t.data.config, a = t.data.imageData, d = new BASIS.BasisFile(a), i = l(d);
      let f = t.data.ignoreSupportedFormats ? null : s(t.data.config, i), T = !1;
      f === null && (T = !0, f = i.hasAlpha ? e.cTFBC3 : e.cTFBC1);
      let g = !0;
      d.startTranscoding() || (g = !1);
      const p = [];
      for (let C = 0; C < i.images.length && g; C++) {
        const u = i.images[C];
        if (o.loadSingleImage === void 0 || o.loadSingleImage === C) {
          let _ = u.levels.length;
          o.loadMipmapLevels === !1 && (_ = 1);
          for (let m = 0; m < _; m++) {
            const b = u.levels[m], P = c(d, C, m, f, T);
            if (!P) {
              g = !1;
              break;
            }
            b.transcodedPixels = P, p.push(b.transcodedPixels.buffer);
          }
        }
      }
      d.close(), d.delete(), T && (f = -1), g ? postMessage({ action: "transcode", success: g, id: t.data.id, fileInfo: i, format: f }, p) : postMessage({ action: "transcode", success: g, id: t.data.id });
    }
  };
  function s(t, o) {
    let a = null;
    return t.supportedCompressionFormats && (t.supportedCompressionFormats.astc ? a = e.cTFASTC_4x4 : t.supportedCompressionFormats.bc7 ? a = e.cTFBC7 : t.supportedCompressionFormats.s3tc ? a = o.hasAlpha ? e.cTFBC3 : e.cTFBC1 : t.supportedCompressionFormats.pvrtc ? a = o.hasAlpha ? e.cTFPVRTC1_4_RGBA : e.cTFPVRTC1_4_RGB : t.supportedCompressionFormats.etc2 ? a = e.cTFETC2 : t.supportedCompressionFormats.etc1 ? a = e.cTFETC1 : a = e.cTFRGB565), a;
  }
  function l(t) {
    const o = t.getHasAlpha(), a = t.getNumImages(), d = [];
    for (let f = 0; f < a; f++) {
      const T = {
        levels: []
      }, g = t.getNumLevels(f);
      for (let p = 0; p < g; p++) {
        const C = {
          width: t.getImageWidth(f, p),
          height: t.getImageHeight(f, p)
        };
        T.levels.push(C);
      }
      d.push(T);
    }
    return { hasAlpha: o, images: d };
  }
  function c(t, o, a, d, i) {
    const f = t.getImageTranscodedSizeInBytes(o, a, d);
    let T = new Uint8Array(f);
    if (!t.transcodeImage(T, o, a, d, 1, 0))
      return null;
    if (i) {
      const g = t.getImageWidth(o, a) + 3 & -4, p = t.getImageHeight(o, a) + 3 & -4;
      T = r(T, 0, g, p);
    }
    return T;
  }
  function r(t, o, a, d) {
    const i = new Uint16Array(4), f = new Uint16Array(a * d), T = a / 4, g = d / 4;
    for (let p = 0; p < g; p++)
      for (let C = 0; C < T; C++) {
        const u = o + 8 * (p * T + C);
        i[0] = t[u] | t[u + 1] << 8, i[1] = t[u + 2] | t[u + 3] << 8, i[2] = (2 * (i[0] & 31) + 1 * (i[1] & 31)) / 3 | (2 * (i[0] & 2016) + 1 * (i[1] & 2016)) / 3 & 2016 | (2 * (i[0] & 63488) + 1 * (i[1] & 63488)) / 3 & 63488, i[3] = (2 * (i[1] & 31) + 1 * (i[0] & 31)) / 3 | (2 * (i[1] & 2016) + 1 * (i[0] & 2016)) / 3 & 2016 | (2 * (i[1] & 63488) + 1 * (i[0] & 63488)) / 3 & 63488;
        for (let _ = 0; _ < 4; _++) {
          const m = t[u + 4 + _];
          let b = (p * 4 + _) * a + C * 4;
          f[b++] = i[m & 3], f[b++] = i[m >> 2 & 3], f[b++] = i[m >> 4 & 3], f[b] = i[m >> 6 & 3];
        }
      }
    return f;
  }
}
async function V(e, n, s) {
  return await new Promise((l, c) => {
    const r = (t) => {
      t.data.action === "init" ? (e.removeEventListener("message", r), l(e)) : t.data.action === "error" && c(t.data.error || "error initializing worker");
    };
    e.addEventListener("message", r), e.postMessage({ action: "init", url: s ? F.GetBabylonScriptURL(s) : void 0, wasmBinary: n }, [n]);
  });
}
var h;
(function(e) {
  e[e.cTFETC1 = 0] = "cTFETC1", e[e.cTFETC2 = 1] = "cTFETC2", e[e.cTFBC1 = 2] = "cTFBC1", e[e.cTFBC3 = 3] = "cTFBC3", e[e.cTFBC4 = 4] = "cTFBC4", e[e.cTFBC5 = 5] = "cTFBC5", e[e.cTFBC7 = 6] = "cTFBC7", e[e.cTFPVRTC1_4_RGB = 8] = "cTFPVRTC1_4_RGB", e[e.cTFPVRTC1_4_RGBA = 9] = "cTFPVRTC1_4_RGBA", e[e.cTFASTC_4x4 = 10] = "cTFASTC_4x4", e[e.cTFATC_RGB = 11] = "cTFATC_RGB", e[e.cTFATC_RGBA_INTERPOLATED_ALPHA = 12] = "cTFATC_RGBA_INTERPOLATED_ALPHA", e[e.cTFRGBA32 = 13] = "cTFRGBA32", e[e.cTFRGB565 = 14] = "cTFRGB565", e[e.cTFBGR565 = 15] = "cTFBGR565", e[e.cTFRGBA4444 = 16] = "cTFRGBA4444", e[e.cTFFXT1_RGB = 17] = "cTFFXT1_RGB", e[e.cTFPVRTC2_4_RGB = 18] = "cTFPVRTC2_4_RGB", e[e.cTFPVRTC2_4_RGBA = 19] = "cTFPVRTC2_4_RGBA", e[e.cTFETC2_EAC_R11 = 20] = "cTFETC2_EAC_R11", e[e.cTFETC2_EAC_RG11 = 21] = "cTFETC2_EAC_RG11";
})(h || (h = {}));
const B = {
  /**
   * URL to use when loading the basis transcoder
   */
  JSModuleURL: `${F._DefaultCdnUrl}/basisTranscoder/1/basis_transcoder.js`,
  /**
   * URL to use when loading the wasm module for the transcoder
   */
  WasmModuleURL: `${F._DefaultCdnUrl}/basisTranscoder/1/basis_transcoder.wasm`
}, W = (e, n) => {
  let s;
  switch (e) {
    case h.cTFETC1:
      s = 36196;
      break;
    case h.cTFBC1:
      s = 33776;
      break;
    case h.cTFBC4:
      s = 33779;
      break;
    case h.cTFASTC_4x4:
      s = 37808;
      break;
    case h.cTFETC2:
      s = 37496;
      break;
    case h.cTFBC7:
      s = 36492;
      break;
  }
  if (s === void 0)
    throw "The chosen Basis transcoder format is not currently supported";
  return s;
};
let w = null, G = null, k = 0;
const H = !1, x = async () => (w || (w = new Promise((e, n) => {
  G ? e(G) : F.LoadFileAsync(F.GetBabylonScriptURL(B.WasmModuleURL)).then((s) => {
    if (typeof URL != "function")
      return n("Basis transcoder requires an environment with a URL constructor");
    const l = URL.createObjectURL(new Blob([`(${U})()`], { type: "application/javascript" }));
    G = new Worker(l), V(G, s, B.JSModuleURL).then(e, n);
  }).catch(n);
})), await w), y = async (e, n) => {
  const s = e instanceof ArrayBuffer ? new Uint8Array(e) : e;
  return await new Promise((l, c) => {
    x().then(() => {
      const r = k++, t = (a) => {
        a.data.action === "transcode" && a.data.id === r && (G.removeEventListener("message", t), a.data.success ? l(a.data) : c("Transcode is not supported on this device"));
      };
      G.addEventListener("message", t);
      const o = new Uint8Array(s.byteLength);
      o.set(new Uint8Array(s.buffer, s.byteOffset, s.byteLength)), G.postMessage({ action: "transcode", id: r, imageData: o, config: n, ignoreSupportedFormats: H }, [
        o.buffer
      ]);
    }, (r) => {
      c(r);
    });
  });
}, E = (e, n) => {
  var l, c;
  let s = (l = n._gl) == null ? void 0 : l.TEXTURE_2D;
  e.isCube && (s = (c = n._gl) == null ? void 0 : c.TEXTURE_CUBE_MAP), n._bindTextureDirectly(s, e, !0);
}, L = (e, n) => {
  const s = e.getEngine();
  for (let l = 0; l < n.fileInfo.images.length; l++) {
    const c = n.fileInfo.images[l].levels[0];
    if (e._invertVScale = e.invertY, n.format === -1 || n.format === h.cTFRGB565)
      if (e.type = 10, e.format = 4, s._features.basisNeedsPOT && (Math.log2(c.width) % 1 !== 0 || Math.log2(c.height) % 1 !== 0)) {
        const r = new v(
          s,
          2
          /* InternalTextureSource.Temp */
        );
        e._invertVScale = e.invertY, r.type = 10, r.format = 4, r.width = c.width + 3 & -4, r.height = c.height + 3 & -4, E(r, s), s._uploadDataToTextureDirectly(r, new Uint16Array(c.transcodedPixels.buffer), l, 0, 4, !0), s._rescaleTexture(r, e, s.scenes[0], s._getInternalFormat(4), () => {
          s._releaseTexture(r), E(e, s);
        });
      } else
        e._invertVScale = !e.invertY, e.width = c.width + 3 & -4, e.height = c.height + 3 & -4, e.samplingMode = 2, E(e, s), s._uploadDataToTextureDirectly(e, new Uint16Array(c.transcodedPixels.buffer), l, 0, 4, !0);
    else {
      e.width = c.width, e.height = c.height, e.generateMipMaps = n.fileInfo.images[l].levels.length > 1;
      const r = N.GetInternalFormatFromBasisFormat(n.format, s);
      e.format = r, E(e, s);
      const t = n.fileInfo.images[l].levels;
      for (let o = 0; o < t.length; o++) {
        const a = t[o];
        s._uploadCompressedDataToTextureDirectly(e, r, a.width, a.height, a.transcodedPixels, l, o);
      }
      s._features.basisNeedsPOT && (Math.log2(e.width) % 1 !== 0 || Math.log2(e.height) % 1 !== 0) && (D.Warn("Loaded .basis texture width and height are not a power of two. Texture wrapping will be set to Texture.CLAMP_ADDRESSMODE as other modes are not supported with non power of two dimensions in webGL 1."), e._cachedWrapU = R.CLAMP_ADDRESSMODE, e._cachedWrapV = R.CLAMP_ADDRESSMODE);
    }
  }
}, N = {
  /**
   * URL to use when loading the basis transcoder
   */
  JSModuleURL: B.JSModuleURL,
  /**
   * URL to use when loading the wasm module for the transcoder
   */
  WasmModuleURL: B.WasmModuleURL,
  /**
   * Get the internal format to be passed to texImage2D corresponding to the .basis format value
   * @param basisFormat format chosen from GetSupportedTranscodeFormat
   * @returns internal format corresponding to the Basis format
   */
  GetInternalFormatFromBasisFormat: W,
  /**
   * Transcodes a loaded image file to compressed pixel data
   * @param data image data to transcode
   * @param config configuration options for the transcoding
   * @returns a promise resulting in the transcoded image
   */
  TranscodeAsync: y,
  /**
   * Loads a texture from the transcode result
   * @param texture texture load to
   * @param transcodeResult the result of transcoding the basis file to load from
   */
  LoadTextureFromTranscodeResult: L
};
class z {
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
  loadCubeData(n, s, l, c, r) {
    if (Array.isArray(n))
      return;
    const t = s.getEngine().getCaps(), o = {
      supportedCompressionFormats: {
        etc1: !!t.etc1,
        s3tc: !!t.s3tc,
        pvrtc: !!t.pvrtc,
        etc2: !!t.etc2,
        astc: !!t.astc,
        bc7: !!t.bptc
      }
    };
    y(n, o).then((a) => {
      const d = a.fileInfo.images[0].levels.length > 1 && s.generateMipMaps;
      L(s, a), s.getEngine()._setCubeMapTextureParams(s, d), s.isReady = !0, s.onLoadedObservable.notifyObservers(s), s.onLoadedObservable.clear(), c && c();
    }).catch((a) => {
      const d = "Failed to transcode Basis file, transcoding may not be supported on this device";
      F.Warn(d), s.isReady = !0, r && r(a);
    });
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   */
  loadData(n, s, l) {
    const c = s.getEngine().getCaps(), r = {
      supportedCompressionFormats: {
        etc1: !!c.etc1,
        s3tc: !!c.s3tc,
        pvrtc: !!c.pvrtc,
        etc2: !!c.etc2,
        astc: !!c.astc,
        bc7: !!c.bptc
      }
    };
    y(n, r).then((t) => {
      const o = t.fileInfo.images[0].levels[0], a = t.fileInfo.images[0].levels.length > 1 && s.generateMipMaps;
      l(o.width, o.height, a, t.format !== -1, () => {
        L(s, t);
      });
    }).catch((t) => {
      F.Warn("Failed to transcode Basis file, transcoding may not be supported on this device"), F.Warn(`Failed to transcode Basis file: ${t}`), l(0, 0, !1, !1, () => {
      }, !0);
    });
  }
}
export {
  z as _BasisTextureLoader
};
