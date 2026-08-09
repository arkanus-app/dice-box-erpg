import { n as R, Q as _ } from "./index-11ca32cf.js";
class d {
  /**
   * Creates a new KhronosTextureContainer
   * @param data contents of the KTX container file
   * @param facesExpected should be either 1 or 6, based whether a cube texture or or
   */
  constructor(s, e) {
    if (this.data = s, this.isInvalid = !1, !d.IsValid(s)) {
      this.isInvalid = !0, R.Error("texture missing KTX identifier");
      return;
    }
    const i = Uint32Array.BYTES_PER_ELEMENT, a = new DataView(this.data.buffer, this.data.byteOffset + 12, 13 * i), r = a.getUint32(0, !0) === 67305985;
    if (this.glType = a.getUint32(1 * i, r), this.glTypeSize = a.getUint32(2 * i, r), this.glFormat = a.getUint32(3 * i, r), this.glInternalFormat = a.getUint32(4 * i, r), this.glBaseInternalFormat = a.getUint32(5 * i, r), this.pixelWidth = a.getUint32(6 * i, r), this.pixelHeight = a.getUint32(7 * i, r), this.pixelDepth = a.getUint32(8 * i, r), this.numberOfArrayElements = a.getUint32(9 * i, r), this.numberOfFaces = a.getUint32(10 * i, r), this.numberOfMipmapLevels = a.getUint32(11 * i, r), this.bytesOfKeyValueData = a.getUint32(12 * i, r), this.glType !== 0) {
      R.Error("only compressed formats currently supported"), this.isInvalid = !0;
      return;
    } else
      this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
    if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
      R.Error("only 2D textures currently supported"), this.isInvalid = !0;
      return;
    }
    if (this.numberOfArrayElements !== 0) {
      R.Error("texture arrays not currently supported"), this.isInvalid = !0;
      return;
    }
    if (this.numberOfFaces !== e) {
      R.Error("number of faces expected" + e + ", but found " + this.numberOfFaces), this.isInvalid = !0;
      return;
    }
    this.loadType = d.COMPRESSED_2D;
  }
  /**
   * Uploads KTX content to a Babylon Texture.
   * It is assumed that the texture has already been created & is currently bound
   * @internal
   */
  uploadLevels(s, e) {
    switch (this.loadType) {
      case d.COMPRESSED_2D:
        this._upload2DCompressedLevels(s, e);
        break;
      case d.TEX_2D:
      case d.COMPRESSED_3D:
      case d.TEX_3D:
    }
  }
  _upload2DCompressedLevels(s, e) {
    let i = d.HEADER_LEN + this.bytesOfKeyValueData, a = this.pixelWidth, o = this.pixelHeight;
    const r = e ? this.numberOfMipmapLevels : 1;
    for (let f = 0; f < r; f++) {
      const n = new Int32Array(this.data.buffer, this.data.byteOffset + i, 1)[0];
      i += 4;
      for (let l = 0; l < this.numberOfFaces; l++) {
        const p = new Uint8Array(this.data.buffer, this.data.byteOffset + i, n);
        s.getEngine()._uploadCompressedDataToTextureDirectly(s, s.format, a, o, p, l, f), i += n, i += 3 - (n + 3) % 4;
      }
      a = Math.max(1, a * 0.5), o = Math.max(1, o * 0.5);
    }
  }
  /**
   * Checks if the given data starts with a KTX file identifier.
   * @param data the data to check
   * @returns true if the data is a KTX file or false otherwise
   */
  static IsValid(s) {
    if (s.byteLength >= 12) {
      const e = new Uint8Array(s.buffer, s.byteOffset, 12);
      if (e[0] === 171 && e[1] === 75 && e[2] === 84 && e[3] === 88 && e[4] === 32 && e[5] === 49 && e[6] === 49 && e[7] === 187 && e[8] === 13 && e[9] === 10 && e[10] === 26 && e[11] === 10)
        return !0;
    }
    return !1;
  }
}
d.HEADER_LEN = 12 + 13 * 4;
d.COMPRESSED_2D = 0;
d.COMPRESSED_3D = 1;
d.TEX_2D = 2;
d.TEX_3D = 3;
class M {
  /**
   * Constructor
   * @param workers Array of workers to use for actions
   */
  constructor(s) {
    this._pendingActions = new Array(), this._workerInfos = s.map((e) => ({
      workerPromise: Promise.resolve(e),
      idle: !0
    }));
  }
  /**
   * Terminates all workers and clears any pending actions.
   */
  dispose() {
    for (const s of this._workerInfos)
      s.workerPromise.then((e) => {
        e.terminate();
      });
    this._workerInfos.length = 0, this._pendingActions.length = 0;
  }
  /**
   * Pushes an action to the worker pool. If all the workers are active, the action will be
   * pended until a worker has completed its action.
   * @param action The action to perform. Call onComplete when the action is complete.
   */
  push(s) {
    this._executeOnIdleWorker(s) || this._pendingActions.push(s);
  }
  _executeOnIdleWorker(s) {
    for (const e of this._workerInfos)
      if (e.idle)
        return this._execute(e, s), !0;
    return !1;
  }
  _execute(s, e) {
    s.idle = !1, s.workerPromise.then((i) => {
      e(i, () => {
        const a = this._pendingActions.shift();
        a ? this._execute(s, a) : s.idle = !0;
      });
    });
  }
}
class A extends M {
  constructor(s, e, i = A.DefaultOptions) {
    super([]), this._maxWorkers = s, this._createWorkerAsync = e, this._options = i;
  }
  push(s) {
    if (!this._executeOnIdleWorker(s))
      if (this._workerInfos.length < this._maxWorkers) {
        const e = {
          workerPromise: this._createWorkerAsync(),
          idle: !1
        };
        this._workerInfos.push(e), this._execute(e, s);
      } else
        this._pendingActions.push(s);
  }
  _execute(s, e) {
    s.timeoutId && (clearTimeout(s.timeoutId), delete s.timeoutId), super._execute(s, (i, a) => {
      e(i, () => {
        a(), s.idle && (s.timeoutId = setTimeout(() => {
          s.workerPromise.then((r) => {
            r.terminate();
          });
          const o = this._workerInfos.indexOf(s);
          o !== -1 && this._workerInfos.splice(o, 1);
        }, this._options.idleTimeElapsedBeforeRelease));
      });
    });
  }
}
A.DefaultOptions = {
  idleTimeElapsedBeforeRelease: 1e3
};
var u;
(function(t) {
  t[t.ETC1S = 0] = "ETC1S", t[t.UASTC4x4 = 1] = "UASTC4x4";
})(u || (u = {}));
var S;
(function(t) {
  t[t.ASTC_4X4_RGBA = 0] = "ASTC_4X4_RGBA", t[t.ASTC_4x4_RGBA = 0] = "ASTC_4x4_RGBA", t[t.BC7_RGBA = 1] = "BC7_RGBA", t[t.BC3_RGBA = 2] = "BC3_RGBA", t[t.BC1_RGB = 3] = "BC1_RGB", t[t.PVRTC1_4_RGBA = 4] = "PVRTC1_4_RGBA", t[t.PVRTC1_4_RGB = 5] = "PVRTC1_4_RGB", t[t.ETC2_RGBA = 6] = "ETC2_RGBA", t[t.ETC1_RGB = 7] = "ETC1_RGB", t[t.RGBA32 = 8] = "RGBA32", t[t.R8 = 9] = "R8", t[t.RG8 = 10] = "RG8";
})(S || (S = {}));
var D;
(function(t) {
  t[t.COMPRESSED_RGBA_BPTC_UNORM_EXT = 36492] = "COMPRESSED_RGBA_BPTC_UNORM_EXT", t[t.COMPRESSED_RGBA_ASTC_4X4_KHR = 37808] = "COMPRESSED_RGBA_ASTC_4X4_KHR", t[t.COMPRESSED_RGB_S3TC_DXT1_EXT = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT", t[t.COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT", t[t.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG", t[t.COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG", t[t.COMPRESSED_RGBA8_ETC2_EAC = 37496] = "COMPRESSED_RGBA8_ETC2_EAC", t[t.COMPRESSED_RGB8_ETC2 = 37492] = "COMPRESSED_RGB8_ETC2", t[t.COMPRESSED_RGB_ETC1_WEBGL = 36196] = "COMPRESSED_RGB_ETC1_WEBGL", t[t.RGBA8Format = 32856] = "RGBA8Format", t[t.R8Format = 33321] = "R8Format", t[t.RG8Format = 33323] = "RG8Format";
})(D || (D = {}));
function T(t, s) {
  const e = (s == null ? void 0 : s.jsDecoderModule) || KTX2DECODER;
  t && (t.wasmBaseUrl && (e.Transcoder.WasmBaseUrl = t.wasmBaseUrl), t.wasmUASTCToASTC && (e.LiteTranscoder_UASTC_ASTC.WasmModuleURL = t.wasmUASTCToASTC), t.wasmUASTCToBC7 && (e.LiteTranscoder_UASTC_BC7.WasmModuleURL = t.wasmUASTCToBC7), t.wasmUASTCToRGBA_UNORM && (e.LiteTranscoder_UASTC_RGBA_UNORM.WasmModuleURL = t.wasmUASTCToRGBA_UNORM), t.wasmUASTCToRGBA_SRGB && (e.LiteTranscoder_UASTC_RGBA_SRGB.WasmModuleURL = t.wasmUASTCToRGBA_SRGB), t.wasmUASTCToR8_UNORM && (e.LiteTranscoder_UASTC_R8_UNORM.WasmModuleURL = t.wasmUASTCToR8_UNORM), t.wasmUASTCToRG8_UNORM && (e.LiteTranscoder_UASTC_RG8_UNORM.WasmModuleURL = t.wasmUASTCToRG8_UNORM), t.jsMSCTranscoder && (e.MSCTranscoder.JSModuleURL = t.jsMSCTranscoder), t.wasmMSCTranscoder && (e.MSCTranscoder.WasmModuleURL = t.wasmMSCTranscoder), t.wasmZSTDDecoder && (e.ZSTDDecoder.WasmModuleURL = t.wasmZSTDDecoder)), s && (s.wasmUASTCToASTC && (e.LiteTranscoder_UASTC_ASTC.WasmBinary = s.wasmUASTCToASTC), s.wasmUASTCToBC7 && (e.LiteTranscoder_UASTC_BC7.WasmBinary = s.wasmUASTCToBC7), s.wasmUASTCToRGBA_UNORM && (e.LiteTranscoder_UASTC_RGBA_UNORM.WasmBinary = s.wasmUASTCToRGBA_UNORM), s.wasmUASTCToRGBA_SRGB && (e.LiteTranscoder_UASTC_RGBA_SRGB.WasmBinary = s.wasmUASTCToRGBA_SRGB), s.wasmUASTCToR8_UNORM && (e.LiteTranscoder_UASTC_R8_UNORM.WasmBinary = s.wasmUASTCToR8_UNORM), s.wasmUASTCToRG8_UNORM && (e.LiteTranscoder_UASTC_RG8_UNORM.WasmBinary = s.wasmUASTCToRG8_UNORM), s.jsMSCTranscoder && (e.MSCTranscoder.JSModule = s.jsMSCTranscoder), s.wasmMSCTranscoder && (e.MSCTranscoder.WasmBinary = s.wasmMSCTranscoder), s.wasmZSTDDecoder && (e.ZSTDDecoder.WasmBinary = s.wasmZSTDDecoder));
}
function y(t) {
  typeof t > "u" && typeof KTX2DECODER < "u" && (t = KTX2DECODER);
  let s;
  onmessage = (e) => {
    if (e.data)
      switch (e.data.action) {
        case "init": {
          const i = e.data.urls;
          i && (i.jsDecoderModule && typeof t > "u" && (importScripts(i.jsDecoderModule), t = KTX2DECODER), T(i)), e.data.wasmBinaries && T(void 0, { ...e.data.wasmBinaries, jsDecoderModule: t }), s = new t.KTX2Decoder(), postMessage({ action: "init" });
          break;
        }
        case "setDefaultDecoderOptions": {
          t.KTX2Decoder.DefaultDecoderOptions = e.data.options;
          break;
        }
        case "decode":
          s.decode(e.data.data, e.data.caps, e.data.options).then((i) => {
            const a = [];
            for (let o = 0; o < i.mipmaps.length; ++o) {
              const r = i.mipmaps[o];
              r && r.data && a.push(r.data.buffer);
            }
            postMessage({ action: "decoded", success: !0, decodedData: i }, a);
          }).catch((i) => {
            postMessage({ action: "decoded", success: !1, msg: i });
          });
          break;
      }
  };
}
async function w(t, s, e) {
  return await new Promise((i, a) => {
    const o = (f) => {
      t.removeEventListener("error", o), t.removeEventListener("message", r), a(f);
    }, r = (f) => {
      f.data.action === "init" && (t.removeEventListener("error", o), t.removeEventListener("message", r), i(t));
    };
    t.addEventListener("error", o), t.addEventListener("message", r), t.postMessage({
      action: "init",
      urls: e,
      wasmBinaries: s
    });
  });
}
class E {
  constructor() {
    this._isDirty = !0, this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC = !0, this._ktx2DecoderOptions = {};
  }
  /**
   * Gets the dirty flag
   */
  get isDirty() {
    return this._isDirty;
  }
  /**
   * force a (uncompressed) RGBA transcoded format if transcoding a UASTC source format and ASTC + BC7 are not available as a compressed transcoded format
   */
  get useRGBAIfASTCBC7NotAvailableWhenUASTC() {
    return this._useRGBAIfASTCBC7NotAvailableWhenUASTC;
  }
  set useRGBAIfASTCBC7NotAvailableWhenUASTC(s) {
    this._useRGBAIfASTCBC7NotAvailableWhenUASTC !== s && (this._useRGBAIfASTCBC7NotAvailableWhenUASTC = s, this._isDirty = !0);
  }
  /**
   * force a (uncompressed) RGBA transcoded format if transcoding a UASTC source format and only BC1 or BC3 are available as a compressed transcoded format.
   * This property is true by default to favor speed over memory, because currently transcoding from UASTC to BC1/3 is slow because the transcoder transcodes
   * to uncompressed and then recompresses the texture
   */
  get useRGBAIfOnlyBC1BC3AvailableWhenUASTC() {
    return this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC;
  }
  set useRGBAIfOnlyBC1BC3AvailableWhenUASTC(s) {
    this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC !== s && (this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC = s, this._isDirty = !0);
  }
  /**
   * force to always use (uncompressed) RGBA for transcoded format
   */
  get forceRGBA() {
    return this._forceRGBA;
  }
  set forceRGBA(s) {
    this._forceRGBA !== s && (this._forceRGBA = s, this._isDirty = !0);
  }
  /**
   * force to always use (uncompressed) R8 for transcoded format
   */
  get forceR8() {
    return this._forceR8;
  }
  set forceR8(s) {
    this._forceR8 !== s && (this._forceR8 = s, this._isDirty = !0);
  }
  /**
   * force to always use (uncompressed) RG8 for transcoded format
   */
  get forceRG8() {
    return this._forceRG8;
  }
  set forceRG8(s) {
    this._forceRG8 !== s && (this._forceRG8 = s, this._isDirty = !0);
  }
  /**
   * list of transcoders to bypass when looking for a suitable transcoder. The available transcoders are:
   *      UniversalTranscoder_UASTC_ASTC
   *      UniversalTranscoder_UASTC_BC7
   *      UniversalTranscoder_UASTC_RGBA_UNORM
   *      UniversalTranscoder_UASTC_RGBA_SRGB
   *      UniversalTranscoder_UASTC_R8_UNORM
   *      UniversalTranscoder_UASTC_RG8_UNORM
   *      MSCTranscoder
   */
  get bypassTranscoders() {
    return this._bypassTranscoders;
  }
  set bypassTranscoders(s) {
    this._bypassTranscoders !== s && (this._bypassTranscoders = s, this._isDirty = !0);
  }
  /** @internal */
  _getKTX2DecoderOptions() {
    if (!this._isDirty)
      return this._ktx2DecoderOptions;
    this._isDirty = !1;
    const s = {};
    return this._useRGBAIfASTCBC7NotAvailableWhenUASTC !== void 0 && (s.useRGBAIfASTCBC7NotAvailableWhenUASTC = this._useRGBAIfASTCBC7NotAvailableWhenUASTC), this._forceRGBA !== void 0 && (s.forceRGBA = this._forceRGBA), this._forceR8 !== void 0 && (s.forceR8 = this._forceR8), this._forceRG8 !== void 0 && (s.forceRG8 = this._forceRG8), this._bypassTranscoders !== void 0 && (s.bypassTranscoders = this._bypassTranscoders), this.useRGBAIfOnlyBC1BC3AvailableWhenUASTC && (s.transcodeFormatDecisionTree = {
      UASTC: {
        transcodeFormat: [S.BC1_RGB, S.BC3_RGBA],
        yes: {
          transcodeFormat: S.RGBA32,
          engineFormat: 32856,
          roundToMultiple4: !1
        }
      }
    }), this._ktx2DecoderOptions = s, s;
  }
}
class c {
  static GetDefaultNumWorkers() {
    return typeof navigator != "object" || !navigator.hardwareConcurrency ? 1 : Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
  }
  static _Initialize(s) {
    if (c._WorkerPoolPromise || c._DecoderModulePromise)
      return;
    const e = {
      wasmBaseUrl: _.ScriptBaseUrl,
      jsDecoderModule: _.GetBabylonScriptURL(this.URLConfig.jsDecoderModule, !0),
      wasmUASTCToASTC: _.GetBabylonScriptURL(this.URLConfig.wasmUASTCToASTC, !0),
      wasmUASTCToBC7: _.GetBabylonScriptURL(this.URLConfig.wasmUASTCToBC7, !0),
      wasmUASTCToRGBA_UNORM: _.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_UNORM, !0),
      wasmUASTCToRGBA_SRGB: _.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_SRGB, !0),
      wasmUASTCToR8_UNORM: _.GetBabylonScriptURL(this.URLConfig.wasmUASTCToR8_UNORM, !0),
      wasmUASTCToRG8_UNORM: _.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRG8_UNORM, !0),
      jsMSCTranscoder: _.GetBabylonScriptURL(this.URLConfig.jsMSCTranscoder, !0),
      wasmMSCTranscoder: _.GetBabylonScriptURL(this.URLConfig.wasmMSCTranscoder, !0),
      wasmZSTDDecoder: _.GetBabylonScriptURL(this.URLConfig.wasmZSTDDecoder, !0)
    };
    s && typeof Worker == "function" && typeof URL < "u" ? c._WorkerPoolPromise = new Promise((i) => {
      const a = `${T}(${y})()`, o = URL.createObjectURL(new Blob([a], { type: "application/javascript" }));
      i(new A(s, async () => await w(new Worker(o), void 0, e)));
    }) : typeof c._KTX2DecoderModule > "u" ? c._DecoderModulePromise = _.LoadBabylonScriptAsync(e.jsDecoderModule).then(() => (c._KTX2DecoderModule = KTX2DECODER, c._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread = !1, c._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread = !0, T(e, c._KTX2DecoderModule), new c._KTX2DecoderModule.KTX2Decoder())) : (c._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread = !1, c._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread = !0, c._DecoderModulePromise = Promise.resolve(new c._KTX2DecoderModule.KTX2Decoder()));
  }
  /**
   * Constructor
   * @param engine The engine to use
   * @param numWorkersOrOptions The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
   */
  constructor(s, e = c.DefaultNumWorkers) {
    var a;
    this._engine = s;
    const i = typeof e == "object" && e.workerPool || c.WorkerPool;
    if (i)
      c._WorkerPoolPromise = Promise.resolve(i);
    else {
      typeof e == "object" ? c._KTX2DecoderModule = (a = e == null ? void 0 : e.binariesAndModulesContainer) == null ? void 0 : a.jsDecoderModule : typeof KTX2DECODER < "u" && (c._KTX2DecoderModule = KTX2DECODER);
      const o = typeof e == "number" ? e : e.numWorkers ?? c.DefaultNumWorkers;
      c._Initialize(o);
    }
  }
  /**
   * @internal
   */
  async _uploadAsync(s, e, i) {
    const a = this._engine.getCaps(), o = {
      astc: !!a.astc,
      bptc: !!a.bptc,
      s3tc: !!a.s3tc,
      pvrtc: !!a.pvrtc,
      etc2: !!a.etc2,
      etc1: !!a.etc1
    };
    if (c._WorkerPoolPromise) {
      const r = await c._WorkerPoolPromise;
      return await new Promise((f, n) => {
        r.push((l, p) => {
          const h = (m) => {
            l.removeEventListener("error", h), l.removeEventListener("message", B), n(m), p();
          }, B = (m) => {
            if (m.data.action === "decoded") {
              if (l.removeEventListener("error", h), l.removeEventListener("message", B), !m.data.success)
                n({ message: m.data.msg });
              else
                try {
                  this._createTexture(m.data.decodedData, e, i), f();
                } catch (G) {
                  n({ message: G });
                }
              p();
            }
          };
          l.addEventListener("error", h), l.addEventListener("message", B), l.postMessage({ action: "setDefaultDecoderOptions", options: c.DefaultDecoderOptions._getKTX2DecoderOptions() });
          const C = new Uint8Array(s.byteLength);
          C.set(new Uint8Array(s.buffer, s.byteOffset, s.byteLength)), l.postMessage({ action: "decode", data: C, caps: o, options: i }, [C.buffer]);
        });
      });
    } else if (c._DecoderModulePromise) {
      const r = await c._DecoderModulePromise;
      return c.DefaultDecoderOptions.isDirty && (c._KTX2DecoderModule.KTX2Decoder.DefaultDecoderOptions = c.DefaultDecoderOptions._getKTX2DecoderOptions()), await new Promise((f, n) => {
        r.decode(s, a).then((l) => {
          this._createTexture(l, e), f();
        }).catch((l) => {
          n({ message: l });
        });
      });
    }
    throw new Error("KTX2 decoder module is not available");
  }
  _createTexture(s, e, i) {
    this._engine._bindTextureDirectly(3553, e), i && (i.transcodedFormat = s.transcodedFormat, i.isInGammaSpace = s.isInGammaSpace, i.hasAlpha = s.hasAlpha, i.transcoderName = s.transcoderName);
    let o = !0;
    switch (s.transcodedFormat) {
      case 32856:
        e.type = 0, e.format = 5;
        break;
      case 33321:
        e.type = 0, e.format = 6;
        break;
      case 33323:
        e.type = 0, e.format = 7;
        break;
      default:
        e.format = s.transcodedFormat, o = !1;
        break;
    }
    if (e._gammaSpace = s.isInGammaSpace, e.generateMipMaps = s.mipmaps.length > 1, e.width = s.mipmaps[0].width, e.height = s.mipmaps[0].height, s.errors)
      throw new Error("KTX2 container - could not transcode the data. " + s.errors);
    for (let r = 0; r < s.mipmaps.length; ++r) {
      const f = s.mipmaps[r];
      if (!f || !f.data)
        throw new Error("KTX2 container - could not transcode one of the image");
      o ? (e.width = f.width, e.height = f.height, this._engine._uploadDataToTextureDirectly(e, f.data, 0, r, void 0, !0)) : this._engine._uploadCompressedDataToTextureDirectly(e, s.transcodedFormat, f.width, f.height, f.data, 0, r);
    }
    e._extension = ".ktx2", e.isReady = !0, this._engine._bindTextureDirectly(3553, null);
  }
  /**
   * Checks if the given data starts with a KTX2 file identifier.
   * @param data the data to check
   * @returns true if the data is a KTX2 file or false otherwise
   */
  static IsValid(s) {
    if (s.byteLength >= 12) {
      const e = new Uint8Array(s.buffer, s.byteOffset, 12);
      if (e[0] === 171 && e[1] === 75 && e[2] === 84 && e[3] === 88 && e[4] === 32 && e[5] === 50 && e[6] === 48 && e[7] === 187 && e[8] === 13 && e[9] === 10 && e[10] === 26 && e[11] === 10)
        return !0;
    }
    return !1;
  }
}
c.URLConfig = {
  jsDecoderModule: "https://cdn.babylonjs.com/babylon.ktx2Decoder.js",
  wasmUASTCToASTC: null,
  wasmUASTCToBC7: null,
  wasmUASTCToRGBA_UNORM: null,
  wasmUASTCToRGBA_SRGB: null,
  wasmUASTCToR8_UNORM: null,
  wasmUASTCToRG8_UNORM: null,
  jsMSCTranscoder: null,
  wasmMSCTranscoder: null,
  wasmZSTDDecoder: null
};
c.DefaultNumWorkers = c.GetDefaultNumWorkers();
c.DefaultDecoderOptions = new E();
function U(t) {
  switch (t) {
    case 35916:
      return 33776;
    case 35918:
      return 33778;
    case 35919:
      return 33779;
    case 37493:
      return 37492;
    case 37497:
      return 37496;
    case 37495:
      return 37494;
    case 37840:
      return 37808;
    case 37841:
      return 37809;
    case 37842:
      return 37810;
    case 37843:
      return 37811;
    case 37844:
      return 37812;
    case 37845:
      return 37813;
    case 37846:
      return 37814;
    case 37847:
      return 37815;
    case 37848:
      return 37816;
    case 37849:
      return 37817;
    case 37850:
      return 37818;
    case 37851:
      return 37819;
    case 37852:
      return 37820;
    case 37853:
      return 37821;
    case 36493:
      return 36492;
  }
  return null;
}
class g {
  constructor() {
    this.supportCascades = !1;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param createPolynomials will be true if polynomials have been requested
   * @param onLoad defines the callback to trigger once the texture is ready
   */
  loadCubeData(s, e, i, a) {
    if (Array.isArray(s))
      return;
    e._invertVScale = !e.invertY;
    const o = e.getEngine(), r = new d(s, 6), f = U(r.glInternalFormat);
    f !== null ? (e.format = f, e._useSRGBBuffer = o._getUseSRGBBuffer(!0, !e.generateMipMaps), e._gammaSpace = !0) : e.format = r.glInternalFormat;
    const n = r.numberOfMipmapLevels > 1 && e.generateMipMaps;
    o._unpackFlipY(!0), r.uploadLevels(e, e.generateMipMaps), e.width = r.pixelWidth, e.height = r.pixelHeight, o._setCubeMapTextureParams(e, n, r.numberOfMipmapLevels - 1), e.isReady = !0, e.onLoadedObservable.notifyObservers(e), e.onLoadedObservable.clear(), a && a();
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   * @param options
   */
  loadData(s, e, i, a) {
    if (d.IsValid(s)) {
      e._invertVScale = !e.invertY;
      const o = new d(s, 1), r = U(o.glInternalFormat);
      r !== null ? (e.format = r, e._useSRGBBuffer = e.getEngine()._getUseSRGBBuffer(!0, !e.generateMipMaps), e._gammaSpace = !0) : e.format = o.glInternalFormat, i(o.pixelWidth, o.pixelHeight, e.generateMipMaps, !0, () => {
        o.uploadLevels(e, e.generateMipMaps);
      }, o.isInvalid);
    } else
      c.IsValid(s) ? new c(e.getEngine())._uploadAsync(s, e, a).then(() => {
        i(e.width, e.height, e.generateMipMaps, !0, () => {
        }, !1);
      }, (r) => {
        R.Warn(`Failed to load KTX2 texture data: ${r.message}`), i(0, 0, !1, !1, () => {
        }, !0);
      }) : (R.Error("texture missing KTX identifier"), i(0, 0, !1, !1, () => {
      }, !0));
  }
}
export {
  g as _KTXTextureLoader
};
