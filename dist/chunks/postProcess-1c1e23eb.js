import { ax as Me, ay as ye, a1 as b, ap as Y, az as ae, L as B, aA as q, aB as Be, aC as Oe, aD as Le, aE as Ue, aF as De, aG as we, aH as ve, aI as Ne, aJ as Ge, aK as Xe, av as k, aL as Q, aM as Ve, aN as fe, aO as ke, aP as re, aQ as We, V as R, M as ue, aR as he, h as le, Q as oe, g as X, aS as He, T as M, aT as Re, E as te, aU as ze, aV as je, aW as Ye, O, u as qe, W as Ze, aX as Ke, aY as Qe, J as de, aZ as $e, b as K, v as Je, j as L, s as w, a_ as et, a6 as ge, p as pe, G as tt, R as rt } from "./Dice-f63fdd4d.js";
import { B as st, T as j } from "./texture-1ebdc842.js";
function it(n) {
  return n.getPipelineContext === void 0;
}
class nt {
  constructor() {
    this.shaderLanguage = 0;
  }
  postProcessor(e, t, r, s, i) {
    if (i.drawBuffersExtensionDisabled) {
      const a = /#extension.+GL_EXT_draw_buffers.+(enable|require)/g;
      e = e.replace(a, "");
    }
    return e;
  }
}
const at = /(flat\s)?\s*varying\s*.*/;
class ht {
  constructor() {
    this.shaderLanguage = 0;
  }
  attributeProcessor(e) {
    return e.replace("attribute", "in");
  }
  varyingCheck(e, t) {
    return at.test(e);
  }
  varyingProcessor(e, t) {
    return e.replace("varying", t ? "in" : "out");
  }
  postProcessor(e, t, r) {
    const s = e.search(/#extension.+GL_EXT_draw_buffers.+require/) !== -1, i = /#extension.+(GL_OVR_multiview2|GL_OES_standard_derivatives|GL_EXT_shader_texture_lod|GL_EXT_frag_depth|GL_EXT_draw_buffers).+(enable|require)/g;
    if (e = e.replace(i, ""), e = e.replace(/texture2D\s*\(/g, "texture("), r) {
      const a = e.search(/layout *\(location *= *0\) *out/g) !== -1;
      e = e.replace(/texture2DLodEXT\s*\(/g, "textureLod("), e = e.replace(/textureCubeLodEXT\s*\(/g, "textureLod("), e = e.replace(/textureCube\s*\(/g, "texture("), e = e.replace(/gl_FragDepthEXT/g, "gl_FragDepth"), e = e.replace(/gl_FragColor/g, "glFragColor"), e = e.replace(/gl_FragData/g, "glFragData"), e = e.replace(/void\s+?main\s*\(/g, (s || a ? "" : `layout(location = 0) out vec4 glFragColor;
`) + "void main(");
    } else if (t.indexOf("#define MULTIVIEW") !== -1)
      return `#extension GL_OVR_multiview2 : require
layout (num_views = 2) in;
` + e;
    return e;
  }
}
class $ extends Me {
  constructor(e) {
    super(), this._buffer = e;
  }
  get underlyingResource() {
    return this._buffer;
  }
}
class be {
  get underlyingResource() {
    return this._webGLTexture;
  }
  constructor(e = null, t) {
    if (this._MSAARenderBuffers = null, this._context = t, !e && (e = t.createTexture(), !e))
      throw new Error("Unable to create webGL texture");
    this.set(e);
  }
  setUsage() {
  }
  set(e) {
    this._webGLTexture = e;
  }
  reset() {
    this._webGLTexture = null, this._MSAARenderBuffers = null;
  }
  addMSAARenderBuffer(e) {
    this._MSAARenderBuffers || (this._MSAARenderBuffers = []), this._MSAARenderBuffers.push(e);
  }
  releaseMSAARenderBuffers() {
    if (this._MSAARenderBuffers) {
      for (const e of this._MSAARenderBuffers)
        this._context.deleteRenderbuffer(e);
      this._MSAARenderBuffers = null;
    }
  }
  getMSAARenderBuffer(e = 0) {
    var t;
    return ((t = this._MSAARenderBuffers) == null ? void 0 : t[e]) ?? null;
  }
  release() {
    this.releaseMSAARenderBuffers(), this._webGLTexture && this._context.deleteTexture(this._webGLTexture), this.reset();
  }
}
function Te(n) {
  return n === 13 || n === 14 || n === 15 || n === 16 || n === 17 || n === 18 || n === 19;
}
function J(n) {
  return n === 13 || n === 17 || n === 18 || n === 19;
}
class lt {
}
class S extends b {
  /**
   * Gets or sets the name of the engine
   */
  get name() {
    return this._name;
  }
  set name(e) {
    this._name = e;
  }
  /**
   * Returns the version of the engine
   */
  get version() {
    return this._webGLVersion;
  }
  /**
   * Gets or sets the relative url used to load shaders if using the engine in non-minified mode
   */
  static get ShadersRepository() {
    return Y.ShadersRepository;
  }
  static set ShadersRepository(e) {
    Y.ShadersRepository = e;
  }
  /**
   * Gets a boolean indicating that the engine supports uniform buffers
   * @see https://doc.babylonjs.com/setup/support/webGL2#uniform-buffer-objets
   */
  get supportsUniformBuffers() {
    return this.webGLVersion > 1 && !this.disableUniformBuffers;
  }
  /**
   * Gets a boolean indicating that only power of 2 textures are supported
   * Please note that you can still use non power of 2 textures but in this case the engine will forcefully convert them
   */
  get needPOTTextures() {
    return this._webGLVersion < 2 || this.forcePOTTextures;
  }
  get _supportsHardwareTextureRescaling() {
    return !1;
  }
  /**
   * sets the object from which width and height will be taken from when getting render width and height
   * Will fallback to the gl object
   * @param dimensions the framebuffer width and height that will be used.
   */
  set framebufferDimensionsObject(e) {
    this._framebufferDimensionsObject = e;
  }
  /**
   * Creates a new snapshot at the next frame using the current snapshotRenderingMode
   */
  snapshotRenderingReset() {
    this.snapshotRendering = !1;
  }
  /**
   * Creates a new engine
   * @param canvasOrContext defines the canvas or WebGL context to use for rendering. If you provide a WebGL context, Babylon.js will not hook events on the canvas (like pointers, keyboards, etc...) so no event observables will be available. This is mostly used when Babylon.js is used as a plugin on a system which already used the WebGL context
   * @param antialias defines whether anti-aliasing should be enabled (default value is "undefined", meaning that the browser may or may not enable it)
   * @param options defines further options to be sent to the getContext() function
   * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
   */
  constructor(e, t, r, s) {
    if (r = r || {}, super(t ?? r.antialias, r, s), this._name = "WebGL", this.forcePOTTextures = !1, this.validateShaderPrograms = !1, this.disableUniformBuffers = !1, this._webGLVersion = 1, this._vertexAttribArraysEnabled = [], this._uintIndicesCurrentlySet = !1, this._currentBoundBuffer = new Array(), this._currentFramebuffer = null, this._dummyFramebuffer = null, this._currentBufferPointers = new Array(), this._currentInstanceLocations = new Array(), this._currentInstanceBuffers = new Array(), this._vaoRecordInProgress = !1, this._mustWipeVertexAttributes = !1, this._nextFreeTextureSlots = new Array(), this._maxSimultaneousTextures = 0, this._maxMSAASamplesOverride = null, this._unpackFlipYCached = null, this.enableUnpackFlipYCached = !0, this._boundUniforms = {}, !e)
      return;
    let i = null;
    if (e.getContext) {
      if (i = e, r.preserveDrawingBuffer === void 0 && (r.preserveDrawingBuffer = !1), r.xrCompatible === void 0 && (r.xrCompatible = !1), navigator && navigator.userAgent) {
        this._setupMobileChecks();
        const h = navigator.userAgent;
        for (const l of S.ExceptionList) {
          const _ = l.key, u = l.targets;
          if (new RegExp(_).test(h)) {
            if (l.capture && l.captureConstraint) {
              const c = l.capture, p = l.captureConstraint, E = new RegExp(c).exec(h);
              if (E && E.length > 0 && parseInt(E[E.length - 1]) >= p)
                continue;
            }
            for (const c of u)
              switch (c) {
                case "uniformBuffer":
                  this.disableUniformBuffers = !0;
                  break;
                case "vao":
                  this.disableVertexArrayObjects = !0;
                  break;
                case "antialias":
                  r.antialias = !1;
                  break;
                case "maxMSAASamples":
                  this._maxMSAASamplesOverride = 1;
                  break;
              }
          }
        }
      }
      if (this._doNotHandleContextLost ? this._onContextLost = () => {
        ae(this._gl);
      } : (this._onContextLost = (h) => {
        h.preventDefault(), this._contextWasLost = !0, ae(this._gl), B.Warn("WebGL context lost."), this.onContextLostObservable.notifyObservers(this);
      }, this._onContextRestored = () => {
        this._restoreEngineAfterContextLost(() => this._initGLContext());
      }, i.addEventListener("webglcontextrestored", this._onContextRestored, !1), r.powerPreference = r.powerPreference || "high-performance"), i.addEventListener("webglcontextlost", this._onContextLost, !1), this._badDesktopOS && (r.xrCompatible = !1), !r.disableWebGL2Support)
        try {
          this._gl = i.getContext("webgl2", r) || i.getContext("experimental-webgl2", r), this._gl && (this._webGLVersion = 2, this._shaderPlatformName = "WEBGL2", this._gl.deleteQuery || (this._webGLVersion = 1, this._shaderPlatformName = "WEBGL1"));
        } catch {
        }
      if (!this._gl) {
        if (!i)
          throw new Error("The provided canvas is null or undefined.");
        try {
          this._gl = i.getContext("webgl", r) || i.getContext("experimental-webgl", r);
        } catch {
          throw new Error("WebGL not supported");
        }
      }
      if (!this._gl)
        throw new Error("WebGL not supported");
    } else {
      this._gl = e, i = this._gl.canvas, this._gl.renderbufferStorageMultisample ? (this._webGLVersion = 2, this._shaderPlatformName = "WEBGL2") : this._shaderPlatformName = "WEBGL1";
      const h = this._gl.getContextAttributes();
      h && (r.stencil = h.stencil);
    }
    this._sharedInit(i), this._gl.pixelStorei(this._gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this._gl.NONE), r.useHighPrecisionFloats !== void 0 && (this._highPrecisionShadersAllowed = r.useHighPrecisionFloats), this.resize(), this._initGLContext(), this._initFeatures();
    for (let h = 0; h < this._caps.maxVertexAttribs; h++)
      this._currentBufferPointers[h] = new lt();
    this._shaderProcessor = this.webGLVersion > 1 ? new ht() : new nt();
    const a = `Babylon.js v${S.Version}`;
    B.Log(a + ` - ${this.description}`), this._renderingCanvas && this._renderingCanvas.setAttribute && this._renderingCanvas.setAttribute("data-engine", a);
    const o = q(this._gl);
    o.validateShaderPrograms = this.validateShaderPrograms, o.parallelShaderCompile = this._caps.parallelShaderCompile;
  }
  _clearEmptyResources() {
    this._dummyFramebuffer = null, super._clearEmptyResources();
  }
  /**
   * @internal
   */
  _getShaderProcessingContext(e) {
    return null;
  }
  /**
   * Gets a boolean indicating if all created effects are ready
   * @returns true if all effects are ready
   */
  areAllEffectsReady() {
    for (const e in this._compiledEffects)
      if (!this._compiledEffects[e].isReady())
        return !1;
    return !0;
  }
  _initGLContext() {
    this._caps = {
      maxTexturesImageUnits: this._gl.getParameter(this._gl.MAX_TEXTURE_IMAGE_UNITS),
      maxCombinedTexturesImageUnits: this._gl.getParameter(this._gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
      maxVertexTextureImageUnits: this._gl.getParameter(this._gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxTextureSize: this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE),
      maxSamples: this._webGLVersion > 1 ? this._gl.getParameter(this._gl.MAX_SAMPLES) : 1,
      maxCubemapTextureSize: this._gl.getParameter(this._gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxRenderTextureSize: this._gl.getParameter(this._gl.MAX_RENDERBUFFER_SIZE),
      maxVertexAttribs: this._gl.getParameter(this._gl.MAX_VERTEX_ATTRIBS),
      maxVaryingVectors: this._gl.getParameter(this._gl.MAX_VARYING_VECTORS),
      maxFragmentUniformVectors: this._gl.getParameter(this._gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVertexUniformVectors: this._gl.getParameter(this._gl.MAX_VERTEX_UNIFORM_VECTORS),
      parallelShaderCompile: this._gl.getExtension("KHR_parallel_shader_compile") || void 0,
      standardDerivatives: this._webGLVersion > 1 || this._gl.getExtension("OES_standard_derivatives") !== null,
      maxAnisotropy: 1,
      astc: this._gl.getExtension("WEBGL_compressed_texture_astc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_astc"),
      bptc: this._gl.getExtension("EXT_texture_compression_bptc") || this._gl.getExtension("WEBKIT_EXT_texture_compression_bptc"),
      s3tc: this._gl.getExtension("WEBGL_compressed_texture_s3tc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      s3tc_srgb: this._gl.getExtension("WEBGL_compressed_texture_s3tc_srgb") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc_srgb"),
      pvrtc: this._gl.getExtension("WEBGL_compressed_texture_pvrtc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
      etc1: this._gl.getExtension("WEBGL_compressed_texture_etc1") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_etc1"),
      etc2: this._gl.getExtension("WEBGL_compressed_texture_etc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_etc") || this._gl.getExtension("WEBGL_compressed_texture_es3_0"),
      // also a requirement of OpenGL ES 3
      textureAnisotropicFilterExtension: this._gl.getExtension("EXT_texture_filter_anisotropic") || this._gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || this._gl.getExtension("MOZ_EXT_texture_filter_anisotropic"),
      uintIndices: this._webGLVersion > 1 || this._gl.getExtension("OES_element_index_uint") !== null,
      fragmentDepthSupported: this._webGLVersion > 1 || this._gl.getExtension("EXT_frag_depth") !== null,
      highPrecisionShaderSupported: !1,
      timerQuery: this._gl.getExtension("EXT_disjoint_timer_query_webgl2") || this._gl.getExtension("EXT_disjoint_timer_query"),
      supportOcclusionQuery: this._webGLVersion > 1,
      canUseTimestampForTimerQuery: !1,
      drawBuffersExtension: !1,
      maxMSAASamples: 1,
      colorBufferFloat: !!(this._webGLVersion > 1 && this._gl.getExtension("EXT_color_buffer_float")),
      supportFloatTexturesResolve: !1,
      rg11b10ufColorRenderable: !1,
      colorBufferHalfFloat: !!(this._webGLVersion > 1 && this._gl.getExtension("EXT_color_buffer_half_float")),
      textureFloat: !!(this._webGLVersion > 1 || this._gl.getExtension("OES_texture_float")),
      textureHalfFloat: !!(this._webGLVersion > 1 || this._gl.getExtension("OES_texture_half_float")),
      textureHalfFloatRender: !1,
      textureFloatLinearFiltering: !1,
      textureFloatRender: !1,
      textureHalfFloatLinearFiltering: !1,
      vertexArrayObject: !1,
      instancedArrays: !1,
      textureLOD: !!(this._webGLVersion > 1 || this._gl.getExtension("EXT_shader_texture_lod")),
      texelFetch: this._webGLVersion !== 1,
      blendMinMax: !1,
      multiview: this._gl.getExtension("OVR_multiview2"),
      oculusMultiview: this._gl.getExtension("OCULUS_multiview"),
      depthTextureExtension: !1,
      canUseGLInstanceID: this._webGLVersion > 1,
      canUseGLVertexID: this._webGLVersion > 1,
      supportComputeShaders: !1,
      supportSRGBBuffers: !1,
      supportTransformFeedbacks: this._webGLVersion > 1,
      textureMaxLevel: this._webGLVersion > 1,
      texture2DArrayMaxLayerCount: this._webGLVersion > 1 ? this._gl.getParameter(this._gl.MAX_ARRAY_TEXTURE_LAYERS) : 128,
      disableMorphTargetTexture: !1,
      textureNorm16: !!this._gl.getExtension("EXT_texture_norm16")
    }, this._caps.supportFloatTexturesResolve = this._caps.colorBufferFloat, this._caps.rg11b10ufColorRenderable = this._caps.colorBufferFloat, this._glVersion = this._gl.getParameter(this._gl.VERSION);
    const e = this._gl.getExtension("WEBGL_debug_renderer_info");
    if (e != null && (this._glRenderer = this._gl.getParameter(e.UNMASKED_RENDERER_WEBGL), this._glVendor = this._gl.getParameter(e.UNMASKED_VENDOR_WEBGL)), this._glVendor || (this._glVendor = this._gl.getParameter(this._gl.VENDOR) || "Unknown vendor"), this._glRenderer || (this._glRenderer = this._gl.getParameter(this._gl.RENDERER) || "Unknown renderer"), this._gl.HALF_FLOAT_OES !== 36193 && (this._gl.HALF_FLOAT_OES = 36193), this._gl.RGBA16F !== 34842 && (this._gl.RGBA16F = 34842), this._gl.RGBA32F !== 34836 && (this._gl.RGBA32F = 34836), this._gl.DEPTH24_STENCIL8 !== 35056 && (this._gl.DEPTH24_STENCIL8 = 35056), this._caps.timerQuery && (this._webGLVersion === 1 && (this._gl.getQuery = this._caps.timerQuery.getQueryEXT.bind(this._caps.timerQuery)), this._caps.canUseTimestampForTimerQuery = (this._gl.getQuery(this._caps.timerQuery.TIMESTAMP_EXT, this._caps.timerQuery.QUERY_COUNTER_BITS_EXT) ?? 0) > 0), this._caps.maxAnisotropy = this._caps.textureAnisotropicFilterExtension ? this._gl.getParameter(this._caps.textureAnisotropicFilterExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0, this._caps.textureFloatLinearFiltering = !!(this._caps.textureFloat && this._gl.getExtension("OES_texture_float_linear")), this._caps.textureFloatRender = !!(this._caps.textureFloat && this._canRenderToFloatFramebuffer()), this._caps.textureHalfFloatLinearFiltering = !!(this._webGLVersion > 1 || this._caps.textureHalfFloat && this._gl.getExtension("OES_texture_half_float_linear")), this._caps.textureNorm16 && (this._gl.R16_EXT = 33322, this._gl.RG16_EXT = 33324, this._gl.RGB16_EXT = 32852, this._gl.RGBA16_EXT = 32859, this._gl.R16_SNORM_EXT = 36760, this._gl.RG16_SNORM_EXT = 36761, this._gl.RGB16_SNORM_EXT = 36762, this._gl.RGBA16_SNORM_EXT = 36763), this._caps.astc && (this._gl.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = this._caps.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR), this._caps.bptc && (this._gl.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = this._caps.bptc.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT), this._caps.s3tc_srgb && (this._gl.COMPRESSED_SRGB_S3TC_DXT1_EXT = this._caps.s3tc_srgb.COMPRESSED_SRGB_S3TC_DXT1_EXT, this._gl.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = this._caps.s3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT, this._gl.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = this._caps.s3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT), this._caps.etc2 && (this._gl.COMPRESSED_SRGB8_ETC2 = this._caps.etc2.COMPRESSED_SRGB8_ETC2, this._gl.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = this._caps.etc2.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC), this._webGLVersion > 1 && this._gl.HALF_FLOAT_OES !== 5131 && (this._gl.HALF_FLOAT_OES = 5131), this._caps.textureHalfFloatRender = this._caps.textureHalfFloat && this._canRenderToHalfFloatFramebuffer(), this._webGLVersion > 1)
      this._caps.drawBuffersExtension = !0, this._caps.maxMSAASamples = this._maxMSAASamplesOverride !== null ? this._maxMSAASamplesOverride : this._gl.getParameter(this._gl.MAX_SAMPLES), this._caps.maxDrawBuffers = this._gl.getParameter(this._gl.MAX_DRAW_BUFFERS);
    else {
      const t = this._gl.getExtension("WEBGL_draw_buffers");
      if (t !== null) {
        this._caps.drawBuffersExtension = !0, this._gl.drawBuffers = t.drawBuffersWEBGL.bind(t), this._caps.maxDrawBuffers = this._gl.getParameter(t.MAX_DRAW_BUFFERS_WEBGL), this._gl.DRAW_FRAMEBUFFER = this._gl.FRAMEBUFFER;
        for (let r = 0; r < 16; r++)
          this._gl["COLOR_ATTACHMENT" + r + "_WEBGL"] = t["COLOR_ATTACHMENT" + r + "_WEBGL"];
      }
    }
    if (this._webGLVersion > 1)
      this._caps.depthTextureExtension = !0;
    else {
      const t = this._gl.getExtension("WEBGL_depth_texture");
      t != null && (this._caps.depthTextureExtension = !0, this._gl.UNSIGNED_INT_24_8 = t.UNSIGNED_INT_24_8_WEBGL);
    }
    if (this.disableVertexArrayObjects)
      this._caps.vertexArrayObject = !1;
    else if (this._webGLVersion > 1)
      this._caps.vertexArrayObject = !0;
    else {
      const t = this._gl.getExtension("OES_vertex_array_object");
      t != null && (this._caps.vertexArrayObject = !0, this._gl.createVertexArray = t.createVertexArrayOES.bind(t), this._gl.bindVertexArray = t.bindVertexArrayOES.bind(t), this._gl.deleteVertexArray = t.deleteVertexArrayOES.bind(t));
    }
    if (this._webGLVersion > 1)
      this._caps.instancedArrays = !0;
    else {
      const t = this._gl.getExtension("ANGLE_instanced_arrays");
      t != null ? (this._caps.instancedArrays = !0, this._gl.drawArraysInstanced = t.drawArraysInstancedANGLE.bind(t), this._gl.drawElementsInstanced = t.drawElementsInstancedANGLE.bind(t), this._gl.vertexAttribDivisor = t.vertexAttribDivisorANGLE.bind(t)) : this._caps.instancedArrays = !1;
    }
    if (this._gl.getShaderPrecisionFormat) {
      const t = this._gl.getShaderPrecisionFormat(this._gl.VERTEX_SHADER, this._gl.HIGH_FLOAT), r = this._gl.getShaderPrecisionFormat(this._gl.FRAGMENT_SHADER, this._gl.HIGH_FLOAT);
      t && r && (this._caps.highPrecisionShaderSupported = t.precision !== 0 && r.precision !== 0);
    }
    if (this._webGLVersion > 1)
      this._caps.blendMinMax = !0;
    else {
      const t = this._gl.getExtension("EXT_blend_minmax");
      t != null && (this._caps.blendMinMax = !0, this._gl.MAX = t.MAX_EXT, this._gl.MIN = t.MIN_EXT);
    }
    if (!this._caps.supportSRGBBuffers) {
      if (this._webGLVersion > 1)
        this._caps.supportSRGBBuffers = !0, this._glSRGBExtensionValues = {
          SRGB: WebGL2RenderingContext.SRGB,
          SRGB8: WebGL2RenderingContext.SRGB8,
          SRGB8_ALPHA8: WebGL2RenderingContext.SRGB8_ALPHA8
        };
      else {
        const t = this._gl.getExtension("EXT_sRGB");
        t != null && (this._caps.supportSRGBBuffers = !0, this._glSRGBExtensionValues = {
          SRGB: t.SRGB_EXT,
          SRGB8: t.SRGB_ALPHA_EXT,
          SRGB8_ALPHA8: t.SRGB_ALPHA_EXT
        });
      }
      if (this._creationOptions) {
        const t = this._creationOptions.forceSRGBBufferSupportState;
        t !== void 0 && (this._caps.supportSRGBBuffers = this._caps.supportSRGBBuffers && t);
      }
    }
    this._depthCullingState.depthTest = !0, this._depthCullingState.depthFunc = this._gl.LEQUAL, this._depthCullingState.depthMask = !0, this._maxSimultaneousTextures = this._caps.maxCombinedTexturesImageUnits;
    for (let t = 0; t < this._maxSimultaneousTextures; t++)
      this._nextFreeTextureSlots.push(t);
    this._glRenderer === "Mali-G72" && (this._caps.disableMorphTargetTexture = !0);
  }
  _initFeatures() {
    this._features = {
      forceBitmapOverHTMLImageElement: typeof HTMLImageElement > "u",
      supportRenderAndCopyToLodForFloatTextures: this._webGLVersion !== 1,
      supportDepthStencilTexture: this._webGLVersion !== 1,
      supportShadowSamplers: this._webGLVersion !== 1,
      uniformBufferHardCheckMatrix: !1,
      allowTexturePrefiltering: this._webGLVersion !== 1,
      trackUbosInFrame: !1,
      checkUbosContentBeforeUpload: !1,
      supportCSM: this._webGLVersion !== 1,
      basisNeedsPOT: this._webGLVersion === 1,
      support3DTextures: this._webGLVersion !== 1,
      needTypeSuffixInShaderConstants: this._webGLVersion !== 1,
      supportMSAA: this._webGLVersion !== 1,
      supportSSAO2: this._webGLVersion !== 1,
      supportIBLShadows: this._webGLVersion !== 1,
      supportExtendedTextureFormats: this._webGLVersion !== 1,
      supportSwitchCaseInShader: this._webGLVersion !== 1,
      supportSyncTextureRead: !0,
      needsInvertingBitmap: !0,
      useUBOBindingCache: !0,
      needShaderCodeInlining: !1,
      needToAlwaysBindUniformBuffers: !1,
      supportRenderPasses: !1,
      supportSpriteInstancing: !0,
      forceVertexBufferStrideAndOffsetMultiple4Bytes: !1,
      _checkNonFloatVertexBuffersDontRecreatePipelineContext: !1,
      _collectUbosUpdatedInFrame: !1
    };
  }
  /**
   * Gets version of the current webGL context
   * Keep it for back compat - use version instead
   */
  get webGLVersion() {
    return this._webGLVersion;
  }
  /**
   * Gets a string identifying the name of the class
   * @returns "Engine" string
   */
  getClassName() {
    return "ThinEngine";
  }
  /** @internal */
  _prepareWorkingCanvas() {
    if (this._workingCanvas)
      return;
    this._workingCanvas = this.createCanvas(1, 1);
    const e = this._workingCanvas.getContext("2d");
    e && (this._workingContext = e);
  }
  /**
   * Gets an object containing information about the current engine context
   * @returns an object containing the vendor, the renderer and the version of the current engine context
   */
  getInfo() {
    return this.getGlInfo();
  }
  /**
   * Gets an object containing information about the current webGL context
   * @returns an object containing the vendor, the renderer and the version of the current webGL context
   */
  getGlInfo() {
    return {
      vendor: this._glVendor,
      renderer: this._glRenderer,
      version: this._glVersion
    };
  }
  /**Gets driver info if available */
  extractDriverInfo() {
    const e = this.getGlInfo();
    return e && e.renderer ? e.renderer : "";
  }
  /**
   * Gets the current render width
   * @param useScreen defines if screen size must be used (or the current render target if any)
   * @returns a number defining the current render width
   */
  getRenderWidth(e = !1) {
    return !e && this._currentRenderTarget ? this._currentRenderTarget.width : this._framebufferDimensionsObject ? this._framebufferDimensionsObject.framebufferWidth : this._gl.drawingBufferWidth;
  }
  /**
   * Gets the current render height
   * @param useScreen defines if screen size must be used (or the current render target if any)
   * @returns a number defining the current render height
   */
  getRenderHeight(e = !1) {
    return !e && this._currentRenderTarget ? this._currentRenderTarget.height : this._framebufferDimensionsObject ? this._framebufferDimensionsObject.framebufferHeight : this._gl.drawingBufferHeight;
  }
  /**
   * Clear the current render buffer or the current render target (if any is set up)
   * @param color defines the color to use
   * @param backBuffer defines if the back buffer must be cleared
   * @param depth defines if the depth buffer must be cleared
   * @param stencil defines if the stencil buffer must be cleared
   */
  clear(e, t, r, s = !1) {
    var o, h;
    const i = this.stencilStateComposer.useStencilGlobalOnly;
    this.stencilStateComposer.useStencilGlobalOnly = !0, this.applyStates(), this.stencilStateComposer.useStencilGlobalOnly = i;
    let a = 0;
    if (t && e) {
      let l = !0;
      if (this._currentRenderTarget) {
        const _ = (o = this._currentRenderTarget.texture) == null ? void 0 : o.format;
        if (_ === 8 || _ === 9 || _ === 10 || _ === 11) {
          const u = (h = this._currentRenderTarget.texture) == null ? void 0 : h.type;
          u === 7 || u === 5 ? (S._TempClearColorUint32[0] = e.r * 255, S._TempClearColorUint32[1] = e.g * 255, S._TempClearColorUint32[2] = e.b * 255, S._TempClearColorUint32[3] = e.a * 255, this._gl.clearBufferuiv(this._gl.COLOR, 0, S._TempClearColorUint32), l = !1) : (S._TempClearColorInt32[0] = e.r * 255, S._TempClearColorInt32[1] = e.g * 255, S._TempClearColorInt32[2] = e.b * 255, S._TempClearColorInt32[3] = e.a * 255, this._gl.clearBufferiv(this._gl.COLOR, 0, S._TempClearColorInt32), l = !1);
        }
      }
      l && (this._gl.clearColor(e.r, e.g, e.b, e.a !== void 0 ? e.a : 1), a |= this._gl.COLOR_BUFFER_BIT);
    }
    r && (this.useReverseDepthBuffer ? (this._depthCullingState.depthFunc = this._gl.GEQUAL, this._gl.clearDepth(0)) : this._gl.clearDepth(1), a |= this._gl.DEPTH_BUFFER_BIT), s && (this._gl.clearStencil(0), a |= this._gl.STENCIL_BUFFER_BIT), this._gl.clear(a);
  }
  /**
   * @internal
   */
  _viewport(e, t, r, s) {
    (e !== this._viewportCached.x || t !== this._viewportCached.y || r !== this._viewportCached.z || s !== this._viewportCached.w) && (this._viewportCached.x = e, this._viewportCached.y = t, this._viewportCached.z = r, this._viewportCached.w = s, this._gl.viewport(e, t, r, s));
  }
  /**
   * End the current frame
   */
  endFrame() {
    super.endFrame(), this._badOS && this.flushFramebuffer();
  }
  /**
   * Gets the performance monitor attached to this engine
   * @see https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene#engineinstrumentation
   */
  get performanceMonitor() {
    throw new Error("Not Supported by ThinEngine");
  }
  /**
   * Binds the frame buffer to the specified texture.
   * @param rtWrapper The render target wrapper to render to
   * @param faceIndex The face of the texture to render to in case of cube texture and if the render target wrapper is not a multi render target
   * @param requiredWidth The width of the target to render to
   * @param requiredHeight The height of the target to render to
   * @param forceFullscreenViewport Forces the viewport to be the entire texture/screen if true
   * @param lodLevel Defines the lod level to bind to the frame buffer
   * @param layer Defines the 2d array index to bind to the frame buffer if the render target wrapper is not a multi render target
   */
  bindFramebuffer(e, t = 0, r, s, i, a = 0, o = 0) {
    var u, f, c, p, m, E;
    const h = e;
    this._currentRenderTarget && this.unBindFramebuffer(this._currentRenderTarget), this._currentRenderTarget = e, this._bindUnboundFramebuffer(h._framebuffer);
    const l = this._gl;
    e.isMulti || (e.is2DArray || e.is3D ? (l.framebufferTextureLayer(l.FRAMEBUFFER, l.COLOR_ATTACHMENT0, (u = e.texture._hardwareTexture) == null ? void 0 : u.underlyingResource, a, o), h._currentLOD = a) : e.isCube ? l.framebufferTexture2D(l.FRAMEBUFFER, l.COLOR_ATTACHMENT0, l.TEXTURE_CUBE_MAP_POSITIVE_X + t, (f = e.texture._hardwareTexture) == null ? void 0 : f.underlyingResource, a) : h._currentLOD !== a && (l.framebufferTexture2D(l.FRAMEBUFFER, l.COLOR_ATTACHMENT0, l.TEXTURE_2D, (c = e.texture._hardwareTexture) == null ? void 0 : c.underlyingResource, a), h._currentLOD = a));
    const _ = e._depthStencilTexture;
    if (_) {
      e.is3D && (e.texture.width !== _.width || e.texture.height !== _.height || e.texture.depth !== _.depth) && B.Warn("Depth/Stencil attachment for 3D target must have same dimensions as color attachment");
      const T = e._depthStencilTextureWithStencil ? l.DEPTH_STENCIL_ATTACHMENT : l.DEPTH_ATTACHMENT;
      e.is2DArray || e.is3D ? l.framebufferTextureLayer(l.FRAMEBUFFER, T, (p = _._hardwareTexture) == null ? void 0 : p.underlyingResource, a, o) : e.isCube ? l.framebufferTexture2D(l.FRAMEBUFFER, T, l.TEXTURE_CUBE_MAP_POSITIVE_X + t, (m = _._hardwareTexture) == null ? void 0 : m.underlyingResource, a) : l.framebufferTexture2D(l.FRAMEBUFFER, T, l.TEXTURE_2D, (E = _._hardwareTexture) == null ? void 0 : E.underlyingResource, a);
    }
    h._MSAAFramebuffer && this._bindUnboundFramebuffer(h._MSAAFramebuffer), this._cachedViewport && !i ? this.setViewport(this._cachedViewport, r, s) : (r || (r = e.width, a && (r = r / Math.pow(2, a))), s || (s = e.height, a && (s = s / Math.pow(2, a))), this._viewport(0, 0, r, s)), this.wipeCaches();
  }
  setStateCullFaceType(e, t) {
    const r = this.cullBackFaces ?? e ?? !0 ? this._gl.BACK : this._gl.FRONT;
    (this._depthCullingState.cullFace !== r || t) && (this._depthCullingState.cullFace = r);
  }
  /**
   * Set various states to the webGL context
   * @param culling defines culling state: true to enable culling, false to disable it
   * @param zOffset defines the value to apply to zOffset (0 by default)
   * @param force defines if states must be applied even if cache is up to date
   * @param reverseSide defines if culling must be reversed (CCW if false, CW if true)
   * @param cullBackFaces true to cull back faces, false to cull front faces (if culling is enabled)
   * @param stencil stencil states to set
   * @param zOffsetUnits defines the value to apply to zOffsetUnits (0 by default)
   */
  setState(e, t = 0, r, s = !1, i, a, o = 0) {
    (this._depthCullingState.cull !== e || r) && (this._depthCullingState.cull = e), this.setStateCullFaceType(i, r), this.setZOffset(t), this.setZOffsetUnits(o);
    const h = s ? this._gl.CW : this._gl.CCW;
    (this._depthCullingState.frontFace !== h || r) && (this._depthCullingState.frontFace = h), this._stencilStateComposer.stencilMaterial = a;
  }
  /**
   * @internal
   */
  _bindUnboundFramebuffer(e) {
    this._currentFramebuffer !== e && (this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, e), this._currentFramebuffer = e);
  }
  /** @internal */
  _currentFrameBufferIsDefaultFrameBuffer() {
    return this._currentFramebuffer === null;
  }
  /**
   * Generates the mipmaps for a texture
   * @param texture texture to generate the mipmaps for
   */
  generateMipmaps(e) {
    const t = this._getTextureTarget(e);
    this._bindTextureDirectly(t, e, !0), this._gl.generateMipmap(t), this._bindTextureDirectly(t, null);
  }
  /**
   * Unbind the current render target texture from the webGL context
   * @param texture defines the render target wrapper to unbind
   * @param disableGenerateMipMaps defines a boolean indicating that mipmaps must not be generated
   * @param onBeforeUnbind defines a function which will be called before the effective unbind
   */
  unBindFramebuffer(e, t = !1, r) {
    const s = e;
    this._currentRenderTarget = null, s.disableAutomaticMSAAResolve || (e.isMulti ? this.resolveMultiFramebuffer(e) : this.resolveFramebuffer(e)), t || (e.isMulti ? this.generateMipMapsMultiFramebuffer(e) : this.generateMipMapsFramebuffer(e)), r && (s._MSAAFramebuffer && this._bindUnboundFramebuffer(s._framebuffer), r()), this._bindUnboundFramebuffer(null);
  }
  /**
   * Generates mipmaps for the texture of the (single) render target
   * @param texture The render target containing the texture to generate the mipmaps for
   */
  generateMipMapsFramebuffer(e) {
    var t;
    !e.isMulti && ((t = e.texture) != null && t.generateMipMaps) && !e.isCube && this.generateMipmaps(e.texture);
  }
  /**
   * Resolves the MSAA texture of the (single) render target into its non-MSAA version.
   * Note that if "texture" is not a MSAA render target, no resolve is performed.
   * @param texture  The render target texture containing the MSAA textures to resolve
   */
  resolveFramebuffer(e) {
    const t = e, r = this._gl;
    if (!t._MSAAFramebuffer || t.isMulti)
      return;
    let s = t.resolveMSAAColors ? r.COLOR_BUFFER_BIT : 0;
    s |= t._generateDepthBuffer && t.resolveMSAADepth ? r.DEPTH_BUFFER_BIT : 0, s |= t._generateStencilBuffer && t.resolveMSAAStencil ? r.STENCIL_BUFFER_BIT : 0, r.bindFramebuffer(r.READ_FRAMEBUFFER, t._MSAAFramebuffer), r.bindFramebuffer(r.DRAW_FRAMEBUFFER, t._framebuffer), r.blitFramebuffer(0, 0, e.width, e.height, 0, 0, e.width, e.height, s, r.NEAREST);
  }
  /**
   * Force a webGL flush (ie. a flush of all waiting webGL commands)
   */
  flushFramebuffer() {
    this._gl.flush();
  }
  /**
   * Unbind the current render target and bind the default framebuffer
   */
  restoreDefaultFramebuffer() {
    this._currentRenderTarget ? this.unBindFramebuffer(this._currentRenderTarget) : this._bindUnboundFramebuffer(null), this._cachedViewport && this.setViewport(this._cachedViewport), this.wipeCaches();
  }
  // VBOs
  /** @internal */
  _resetVertexBufferBinding() {
    this.bindArrayBuffer(null), this._cachedVertexBuffers = null;
  }
  /**
   * Creates a vertex buffer
   * @param data the data or size for the vertex buffer
   * @param _updatable whether the buffer should be created as updatable
   * @param _label defines the label of the buffer (for debug purpose)
   * @returns the new WebGL static buffer
   */
  createVertexBuffer(e, t, r) {
    return this._createVertexBuffer(e, this._gl.STATIC_DRAW);
  }
  _createVertexBuffer(e, t) {
    const r = this._gl.createBuffer();
    if (!r)
      throw new Error("Unable to create vertex buffer");
    const s = new $(r);
    return this.bindArrayBuffer(s), typeof e != "number" ? e instanceof Array ? (this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(e), t), s.capacity = e.length * 4) : (this._gl.bufferData(this._gl.ARRAY_BUFFER, e, t), s.capacity = e.byteLength) : (this._gl.bufferData(this._gl.ARRAY_BUFFER, new Uint8Array(e), t), s.capacity = e), this._resetVertexBufferBinding(), s.references = 1, s;
  }
  /**
   * Creates a dynamic vertex buffer
   * @param data the data for the dynamic vertex buffer
   * @param _label defines the label of the buffer (for debug purpose)
   * @returns the new WebGL dynamic buffer
   */
  createDynamicVertexBuffer(e, t) {
    return this._createVertexBuffer(e, this._gl.DYNAMIC_DRAW);
  }
  _resetIndexBufferBinding() {
    this.bindIndexBuffer(null), this._cachedIndexBuffer = null;
  }
  /**
   * Creates a new index buffer
   * @param indices defines the content of the index buffer
   * @param updatable defines if the index buffer must be updatable
   * @param _label defines the label of the buffer (for debug purpose)
   * @returns a new webGL buffer
   */
  createIndexBuffer(e, t, r) {
    const s = this._gl.createBuffer(), i = new $(s);
    if (!s)
      throw new Error("Unable to create index buffer");
    this.bindIndexBuffer(i);
    const a = this._normalizeIndexData(e);
    return this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, a, t ? this._gl.DYNAMIC_DRAW : this._gl.STATIC_DRAW), this._resetIndexBufferBinding(), i.references = 1, i.is32Bits = a.BYTES_PER_ELEMENT === 4, i;
  }
  _normalizeIndexData(e) {
    if (e.BYTES_PER_ELEMENT === 2)
      return e;
    if (this._caps.uintIndices) {
      if (e instanceof Uint32Array)
        return e;
      for (let r = 0; r < e.length; r++)
        if (e[r] >= 65535)
          return new Uint32Array(e);
      return new Uint16Array(e);
    }
    return new Uint16Array(e);
  }
  /**
   * Bind a webGL buffer to the webGL context
   * @param buffer defines the buffer to bind
   */
  bindArrayBuffer(e) {
    this._vaoRecordInProgress || this._unbindVertexArrayObject(), this._bindBuffer(e, this._gl.ARRAY_BUFFER);
  }
  /**
   * Bind a specific block at a given index in a specific shader program
   * @param pipelineContext defines the pipeline context to use
   * @param blockName defines the block name
   * @param index defines the index where to bind the block
   */
  bindUniformBlock(e, t, r) {
    const s = e.program, i = this._gl.getUniformBlockIndex(s, t);
    this._gl.uniformBlockBinding(s, i, r);
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  bindIndexBuffer(e) {
    this._vaoRecordInProgress || this._unbindVertexArrayObject(), this._bindBuffer(e, this._gl.ELEMENT_ARRAY_BUFFER);
  }
  _bindBuffer(e, t) {
    (this._vaoRecordInProgress || this._currentBoundBuffer[t] !== e) && (this._gl.bindBuffer(t, e ? e.underlyingResource : null), this._currentBoundBuffer[t] = e);
  }
  /**
   * update the bound buffer with the given data
   * @param data defines the data to update
   */
  updateArrayBuffer(e) {
    this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, e);
  }
  _vertexAttribPointer(e, t, r, s, i, a, o) {
    const h = this._currentBufferPointers[t];
    if (!h)
      return;
    let l = !1;
    h.active ? (h.buffer !== e && (h.buffer = e, l = !0), h.size !== r && (h.size = r, l = !0), h.type !== s && (h.type = s, l = !0), h.normalized !== i && (h.normalized = i, l = !0), h.stride !== a && (h.stride = a, l = !0), h.offset !== o && (h.offset = o, l = !0)) : (l = !0, h.active = !0, h.index = t, h.size = r, h.type = s, h.normalized = i, h.stride = a, h.offset = o, h.buffer = e), (l || this._vaoRecordInProgress) && (this.bindArrayBuffer(e), s === this._gl.UNSIGNED_INT || s === this._gl.INT ? this._gl.vertexAttribIPointer(t, r, s, a, o) : this._gl.vertexAttribPointer(t, r, s, i, a, o));
  }
  /**
   * @internal
   */
  _bindIndexBufferWithCache(e) {
    e != null && this._cachedIndexBuffer !== e && (this._cachedIndexBuffer = e, this.bindIndexBuffer(e), this._uintIndicesCurrentlySet = e.is32Bits);
  }
  _bindVertexBuffersAttributes(e, t, r) {
    const s = t.getAttributesNames();
    this._vaoRecordInProgress || this._unbindVertexArrayObject(), this.unbindAllAttributes();
    for (let i = 0; i < s.length; i++) {
      const a = t.getAttributeLocation(i);
      if (a >= 0) {
        const o = s[i];
        let h = null;
        if (r && (h = r[o]), h || (h = e[o]), !h)
          continue;
        this._gl.enableVertexAttribArray(a), this._vaoRecordInProgress || (this._vertexAttribArraysEnabled[a] = !0);
        const l = h.getBuffer();
        l && (this._vertexAttribPointer(l, a, h.getSize(), h.type, h.normalized, h.byteStride, h.byteOffset), h.getIsInstanced() && (this._gl.vertexAttribDivisor(a, h.getInstanceDivisor()), this._vaoRecordInProgress || (this._currentInstanceLocations.push(a), this._currentInstanceBuffers.push(l))));
      }
    }
  }
  /**
   * Records a vertex array object
   * @see https://doc.babylonjs.com/setup/support/webGL2#vertex-array-objects
   * @param vertexBuffers defines the list of vertex buffers to store
   * @param indexBuffer defines the index buffer to store
   * @param effect defines the effect to store
   * @param overrideVertexBuffers defines optional list of avertex buffers that overrides the entries in vertexBuffers
   * @returns the new vertex array object
   */
  recordVertexArrayObject(e, t, r, s) {
    const i = this._gl.createVertexArray();
    if (!i)
      throw new Error("Unable to create VAO");
    return this._vaoRecordInProgress = !0, this._gl.bindVertexArray(i), this._mustWipeVertexAttributes = !0, this._bindVertexBuffersAttributes(e, r, s), this.bindIndexBuffer(t), this._vaoRecordInProgress = !1, this._gl.bindVertexArray(null), i;
  }
  /**
   * Bind a specific vertex array object
   * @see https://doc.babylonjs.com/setup/support/webGL2#vertex-array-objects
   * @param vertexArrayObject defines the vertex array object to bind
   * @param indexBuffer defines the index buffer to bind
   */
  bindVertexArrayObject(e, t) {
    this._cachedVertexArrayObject !== e && (this._cachedVertexArrayObject = e, this._gl.bindVertexArray(e), this._cachedVertexBuffers = null, this._cachedIndexBuffer = null, this._uintIndicesCurrentlySet = t != null && t.is32Bits, this._mustWipeVertexAttributes = !0);
  }
  /**
   * Bind webGl buffers directly to the webGL context
   * @param vertexBuffer defines the vertex buffer to bind
   * @param indexBuffer defines the index buffer to bind
   * @param vertexDeclaration defines the vertex declaration to use with the vertex buffer
   * @param vertexStrideSize defines the vertex stride of the vertex buffer
   * @param effect defines the effect associated with the vertex buffer
   */
  bindBuffersDirectly(e, t, r, s, i) {
    if (this._cachedVertexBuffers !== e || this._cachedEffectForVertexBuffers !== i) {
      this._cachedVertexBuffers = e, this._cachedEffectForVertexBuffers = i;
      const a = i.getAttributesCount();
      this._unbindVertexArrayObject(), this.unbindAllAttributes();
      let o = 0;
      for (let h = 0; h < a; h++)
        if (h < r.length) {
          const l = i.getAttributeLocation(h);
          l >= 0 && (this._gl.enableVertexAttribArray(l), this._vertexAttribArraysEnabled[l] = !0, this._vertexAttribPointer(e, l, r[h], this._gl.FLOAT, !1, s, o)), o += r[h] * 4;
        }
    }
    this._bindIndexBufferWithCache(t);
  }
  _unbindVertexArrayObject() {
    this._cachedVertexArrayObject && (this._cachedVertexArrayObject = null, this._gl.bindVertexArray(null));
  }
  /**
   * Bind a list of vertex buffers to the webGL context
   * @param vertexBuffers defines the list of vertex buffers to bind
   * @param indexBuffer defines the index buffer to bind
   * @param effect defines the effect associated with the vertex buffers
   * @param overrideVertexBuffers defines optional list of avertex buffers that overrides the entries in vertexBuffers
   */
  bindBuffers(e, t, r, s) {
    (this._cachedVertexBuffers !== e || this._cachedEffectForVertexBuffers !== r) && (this._cachedVertexBuffers = e, this._cachedEffectForVertexBuffers = r, this._bindVertexBuffersAttributes(e, r, s)), this._bindIndexBufferWithCache(t);
  }
  /**
   * Unbind all instance attributes
   */
  unbindInstanceAttributes() {
    let e;
    for (let t = 0, r = this._currentInstanceLocations.length; t < r; t++) {
      const s = this._currentInstanceBuffers[t];
      e != s && s.references && (e = s, this.bindArrayBuffer(s));
      const i = this._currentInstanceLocations[t];
      this._gl.vertexAttribDivisor(i, 0);
    }
    this._currentInstanceBuffers.length = 0, this._currentInstanceLocations.length = 0;
  }
  /**
   * Release and free the memory of a vertex array object
   * @param vao defines the vertex array object to delete
   */
  releaseVertexArrayObject(e) {
    this._gl.deleteVertexArray(e);
  }
  /**
   * @internal
   */
  _releaseBuffer(e) {
    return e.references--, e.references === 0 ? (this._deleteBuffer(e), !0) : !1;
  }
  _deleteBuffer(e) {
    this._gl.deleteBuffer(e.underlyingResource);
  }
  /**
   * Update the content of a webGL buffer used with instantiation and bind it to the webGL context
   * @param instancesBuffer defines the webGL buffer to update and bind
   * @param data defines the data to store in the buffer
   * @param offsetLocations defines the offsets or attributes information used to determine where data must be stored in the buffer
   */
  updateAndBindInstancesBuffer(e, t, r) {
    if (this.bindArrayBuffer(e), t && this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, t), r[0].index !== void 0)
      this.bindInstancesBuffer(e, r, !0);
    else
      for (let s = 0; s < 4; s++) {
        const i = r[s];
        this._vertexAttribArraysEnabled[i] || (this._gl.enableVertexAttribArray(i), this._vertexAttribArraysEnabled[i] = !0), this._vertexAttribPointer(e, i, 4, this._gl.FLOAT, !1, 64, s * 16), this._gl.vertexAttribDivisor(i, 1), this._currentInstanceLocations.push(i), this._currentInstanceBuffers.push(e);
      }
  }
  /**
   * Bind the content of a webGL buffer used with instantiation
   * @param instancesBuffer defines the webGL buffer to bind
   * @param attributesInfo defines the offsets or attributes information used to determine where data must be stored in the buffer
   * @param computeStride defines Whether to compute the strides from the info or use the default 0
   */
  bindInstancesBuffer(e, t, r = !0) {
    this.bindArrayBuffer(e);
    let s = 0;
    if (r)
      for (let i = 0; i < t.length; i++) {
        const a = t[i];
        s += a.attributeSize * 4;
      }
    for (let i = 0; i < t.length; i++) {
      const a = t[i];
      a.index === void 0 && (a.index = this._currentEffect.getAttributeLocationByName(a.attributeName)), !(a.index < 0) && (this._vertexAttribArraysEnabled[a.index] || (this._gl.enableVertexAttribArray(a.index), this._vertexAttribArraysEnabled[a.index] = !0), this._vertexAttribPointer(e, a.index, a.attributeSize, a.attributeType || this._gl.FLOAT, a.normalized || !1, s, a.offset), this._gl.vertexAttribDivisor(a.index, a.divisor === void 0 ? 1 : a.divisor), this._currentInstanceLocations.push(a.index), this._currentInstanceBuffers.push(e));
    }
  }
  /**
   * Disable the instance attribute corresponding to the name in parameter
   * @param name defines the name of the attribute to disable
   */
  disableInstanceAttributeByName(e) {
    if (!this._currentEffect)
      return;
    const t = this._currentEffect.getAttributeLocationByName(e);
    this.disableInstanceAttribute(t);
  }
  /**
   * Disable the instance attribute corresponding to the location in parameter
   * @param attributeLocation defines the attribute location of the attribute to disable
   */
  disableInstanceAttribute(e) {
    let t = !1, r;
    for (; (r = this._currentInstanceLocations.indexOf(e)) !== -1; )
      this._currentInstanceLocations.splice(r, 1), this._currentInstanceBuffers.splice(r, 1), t = !0, r = this._currentInstanceLocations.indexOf(e);
    t && (this._gl.vertexAttribDivisor(e, 0), this.disableAttributeByIndex(e));
  }
  /**
   * Disable the attribute corresponding to the location in parameter
   * @param attributeLocation defines the attribute location of the attribute to disable
   */
  disableAttributeByIndex(e) {
    this._gl.disableVertexAttribArray(e), this._vertexAttribArraysEnabled[e] = !1, this._currentBufferPointers[e].active = !1;
  }
  /**
   * Send a draw order
   * @param useTriangles defines if triangles must be used to draw (else wireframe will be used)
   * @param indexStart defines the starting index
   * @param indexCount defines the number of index to draw
   * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
   */
  draw(e, t, r, s) {
    this.drawElementsType(e ? 0 : 1, t, r, s);
  }
  /**
   * Draw a list of points
   * @param verticesStart defines the index of first vertex to draw
   * @param verticesCount defines the count of vertices to draw
   * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
   */
  drawPointClouds(e, t, r) {
    this.drawArraysType(2, e, t, r);
  }
  /**
   * Draw a list of unindexed primitives
   * @param useTriangles defines if triangles must be used to draw (else wireframe will be used)
   * @param verticesStart defines the index of first vertex to draw
   * @param verticesCount defines the count of vertices to draw
   * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
   */
  drawUnIndexed(e, t, r, s) {
    this.drawArraysType(e ? 0 : 1, t, r, s);
  }
  /**
   * Draw a list of indexed primitives
   * @param fillMode defines the primitive to use
   * @param indexStart defines the starting index
   * @param indexCount defines the number of index to draw
   * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
   */
  drawElementsType(e, t, r, s) {
    this.applyStates(), this._reportDrawCall();
    const i = this._drawMode(e), a = this._uintIndicesCurrentlySet ? this._gl.UNSIGNED_INT : this._gl.UNSIGNED_SHORT, o = this._uintIndicesCurrentlySet ? 4 : 2;
    s ? this._gl.drawElementsInstanced(i, r, a, t * o, s) : this._gl.drawElements(i, r, a, t * o);
  }
  /**
   * Draw a list of unindexed primitives
   * @param fillMode defines the primitive to use
   * @param verticesStart defines the index of first vertex to draw
   * @param verticesCount defines the count of vertices to draw
   * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
   */
  drawArraysType(e, t, r, s) {
    this.applyStates(), this._reportDrawCall();
    const i = this._drawMode(e);
    s ? this._gl.drawArraysInstanced(i, t, r, s) : this._gl.drawArrays(i, t, r);
  }
  _drawMode(e) {
    switch (e) {
      case 0:
        return this._gl.TRIANGLES;
      case 2:
        return this._gl.POINTS;
      case 1:
        return this._gl.LINES;
      case 3:
        return this._gl.POINTS;
      case 4:
        return this._gl.LINES;
      case 5:
        return this._gl.LINE_LOOP;
      case 6:
        return this._gl.LINE_STRIP;
      case 7:
        return this._gl.TRIANGLE_STRIP;
      case 8:
        return this._gl.TRIANGLE_FAN;
      default:
        return this._gl.TRIANGLES;
    }
  }
  // Shaders
  /**
   * @internal
   */
  _releaseEffect(e) {
    this._compiledEffects[e._key] && delete this._compiledEffects[e._key];
    const t = e.getPipelineContext();
    t && this._deletePipelineContext(t);
  }
  /**
   * @internal
   */
  _deletePipelineContext(e) {
    const t = e;
    t && t.program && (t.program.__SPECTOR_rebuildProgram = null, Be(t), this._gl && this._gl.deleteProgram(t.program));
  }
  /**
   * @internal
   */
  _getGlobalDefines(e) {
    return Oe(e, this.isNDCHalfZRange, this.useReverseDepthBuffer, this.useExactSrgbConversions);
  }
  /**
   * Create a new effect (used to store vertex/fragment shaders)
   * @param baseName defines the base name of the effect (The name of file without .fragment.fx or .vertex.fx)
   * @param attributesNamesOrOptions defines either a list of attribute names or an IEffectCreationOptions object
   * @param uniformsNamesOrEngine defines either a list of uniform names or the engine to use
   * @param samplers defines an array of string used to represent textures
   * @param defines defines the string containing the defines to use to compile the shaders
   * @param fallbacks defines the list of potential fallbacks to use if shader compilation fails
   * @param onCompiled defines a function to call when the effect creation is successful
   * @param onError defines a function to call when the effect creation has failed
   * @param indexParameters defines an object containing the index values to use to compile shaders (like the maximum number of simultaneous lights)
   * @param shaderLanguage the language the shader is written in (default: GLSL)
   * @param extraInitializationsAsync additional async code to run before preparing the effect
   * @returns the new Effect
   */
  createEffect(e, t, r, s, i, a, o, h, l, _ = 0, u) {
    const f = typeof e == "string" ? e : e.vertexToken || e.vertexSource || e.vertexElement || e.vertex, c = typeof e == "string" ? e : e.fragmentToken || e.fragmentSource || e.fragmentElement || e.fragment, p = this._getGlobalDefines(), m = t.attributes !== void 0;
    let E = i ?? t.defines ?? "";
    p && (E += p);
    const T = f + "+" + c + "@" + E;
    if (this._compiledEffects[T]) {
      const I = this._compiledEffects[T];
      return o && I.isReady() && o(I), I._refCount++, I;
    }
    this._gl && q(this._gl);
    const g = new Y(e, t, m ? this : r, s, this, i, a, o, h, l, T, t.shaderLanguage ?? _, t.extraInitializationsAsync ?? u);
    return this._compiledEffects[T] = g, g;
  }
  /**
   * @internal
   */
  _getShaderSource(e) {
    return this._gl.getShaderSource(e);
  }
  /**
   * Directly creates a webGL program
   * @param pipelineContext  defines the pipeline context to attach to
   * @param vertexCode defines the vertex shader code to use
   * @param fragmentCode defines the fragment shader code to use
   * @param context defines the webGL context to use (if not set, the current one will be used)
   * @param transformFeedbackVaryings defines the list of transform feedback varyings to use
   * @returns the new webGL program
   */
  createRawShaderProgram(e, t, r, s, i = null) {
    const a = q(this._gl);
    return a._contextWasLost = this._contextWasLost, a.validateShaderPrograms = this.validateShaderPrograms, Le(e, t, r, s || this._gl, i);
  }
  /**
   * Creates a webGL program
   * @param pipelineContext  defines the pipeline context to attach to
   * @param vertexCode  defines the vertex shader code to use
   * @param fragmentCode defines the fragment shader code to use
   * @param defines defines the string containing the defines to use to compile the shaders
   * @param context defines the webGL context to use (if not set, the current one will be used)
   * @param transformFeedbackVaryings defines the list of transform feedback varyings to use
   * @returns the new webGL program
   */
  createShaderProgram(e, t, r, s, i, a = null) {
    const o = q(this._gl);
    return o._contextWasLost = this._contextWasLost, o.validateShaderPrograms = this.validateShaderPrograms, Ue(e, t, r, s, i || this._gl, a);
  }
  /**
   * Inline functions in shader code that are marked to be inlined
   * @param code code to inline
   * @returns inlined code
   */
  inlineShaderCode(e) {
    return e;
  }
  /**
   * Creates a new pipeline context
   * @param shaderProcessingContext defines the shader processing context used during the processing if available
   * @returns the new pipeline
   */
  createPipelineContext(e) {
    if (this._gl) {
      const r = q(this._gl);
      r.parallelShaderCompile = this._caps.parallelShaderCompile;
    }
    const t = De(this._gl);
    return t.engine = this, t;
  }
  /**
   * Creates a new material context
   * @returns the new context
   */
  createMaterialContext() {
  }
  /**
   * Creates a new draw context
   * @returns the new context
   */
  createDrawContext() {
  }
  _finalizePipelineContext(e) {
    return we(e, this._gl, this.validateShaderPrograms);
  }
  /**
   * @internal
   */
  _preparePipelineContext(e, t, r, s, i, a, o, h, l, _, u) {
    const f = q(this._gl);
    return f._contextWasLost = this._contextWasLost, f.validateShaderPrograms = this.validateShaderPrograms, f._createShaderProgramInjection = this._createShaderProgram.bind(this), f.createRawShaderProgramInjection = this.createRawShaderProgram.bind(this), f.createShaderProgramInjection = this.createShaderProgram.bind(this), f.loadFileInjection = this._loadFile.bind(this), ve(e, t, r, s, i, a, o, h, l, _, u);
  }
  _createShaderProgram(e, t, r, s, i = null) {
    return Ne(e, t, r, s, i);
  }
  /**
   * @internal
   */
  _isRenderingStateCompiled(e) {
    return this._isDisposed ? !1 : Ge(e, this._gl, this.validateShaderPrograms);
  }
  /**
   * @internal
   */
  _executeWhenRenderingStateIsCompiled(e, t) {
    Xe(e, t);
  }
  /**
   * Gets the list of webGL uniform locations associated with a specific program based on a list of uniform names
   * @param pipelineContext defines the pipeline context to use
   * @param uniformsNames defines the list of uniform names
   * @returns an array of webGL uniform locations
   */
  getUniforms(e, t) {
    const r = new Array(), s = e;
    for (let i = 0; i < t.length; i++)
      r.push(this._gl.getUniformLocation(s.program, t[i]));
    return r;
  }
  /**
   * Gets the list of active attributes for a given webGL program
   * @param pipelineContext defines the pipeline context to use
   * @param attributesNames defines the list of attribute names to get
   * @returns an array of indices indicating the offset of each attribute
   */
  getAttributes(e, t) {
    const r = [], s = e;
    for (let i = 0; i < t.length; i++)
      try {
        r.push(this._gl.getAttribLocation(s.program, t[i]));
      } catch {
        r.push(-1);
      }
    return r;
  }
  /**
   * Activates an effect, making it the current one (ie. the one used for rendering)
   * @param effect defines the effect to activate
   */
  enableEffect(e) {
    e = e !== null && it(e) ? e.effect : e, !(!e || e === this._currentEffect) && (this._stencilStateComposer.stencilMaterial = void 0, e = e, this.bindSamplers(e), this._currentEffect = e, e.onBind && e.onBind(e), e._onBindObservable && e._onBindObservable.notifyObservers(e));
  }
  /**
   * Set the value of an uniform to a number (int)
   * @param uniform defines the webGL uniform location where to store the value
   * @param value defines the int number to store
   * @returns true if the value was set
   */
  setInt(e, t) {
    return e ? (this._gl.uniform1i(e, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to a int2
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @returns true if the value was set
   */
  setInt2(e, t, r) {
    return e ? (this._gl.uniform2i(e, t, r), !0) : !1;
  }
  /**
   * Set the value of an uniform to a int3
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @param z defines the 3rd component of the value
   * @returns true if the value was set
   */
  setInt3(e, t, r, s) {
    return e ? (this._gl.uniform3i(e, t, r, s), !0) : !1;
  }
  /**
   * Set the value of an uniform to a int4
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @param z defines the 3rd component of the value
   * @param w defines the 4th component of the value
   * @returns true if the value was set
   */
  setInt4(e, t, r, s, i) {
    return e ? (this._gl.uniform4i(e, t, r, s, i), !0) : !1;
  }
  /**
   * Set the value of an uniform to an array of int32
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of int32 to store
   * @returns true if the value was set
   */
  setIntArray(e, t) {
    return e ? (this._gl.uniform1iv(e, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to an array of int32 (stored as vec2)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of int32 to store
   * @returns true if the value was set
   */
  setIntArray2(e, t) {
    return !e || t.length % 2 !== 0 ? !1 : (this._gl.uniform2iv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of int32 (stored as vec3)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of int32 to store
   * @returns true if the value was set
   */
  setIntArray3(e, t) {
    return !e || t.length % 3 !== 0 ? !1 : (this._gl.uniform3iv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of int32 (stored as vec4)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of int32 to store
   * @returns true if the value was set
   */
  setIntArray4(e, t) {
    return !e || t.length % 4 !== 0 ? !1 : (this._gl.uniform4iv(e, t), !0);
  }
  /**
   * Set the value of an uniform to a number (unsigned int)
   * @param uniform defines the webGL uniform location where to store the value
   * @param value defines the unsigned int number to store
   * @returns true if the value was set
   */
  setUInt(e, t) {
    return e ? (this._gl.uniform1ui(e, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to a unsigned int2
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @returns true if the value was set
   */
  setUInt2(e, t, r) {
    return e ? (this._gl.uniform2ui(e, t, r), !0) : !1;
  }
  /**
   * Set the value of an uniform to a unsigned int3
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @param z defines the 3rd component of the value
   * @returns true if the value was set
   */
  setUInt3(e, t, r, s) {
    return e ? (this._gl.uniform3ui(e, t, r, s), !0) : !1;
  }
  /**
   * Set the value of an uniform to a unsigned int4
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @param z defines the 3rd component of the value
   * @param w defines the 4th component of the value
   * @returns true if the value was set
   */
  setUInt4(e, t, r, s, i) {
    return e ? (this._gl.uniform4ui(e, t, r, s, i), !0) : !1;
  }
  /**
   * Set the value of an uniform to an array of unsigned int32
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of unsigned int32 to store
   * @returns true if the value was set
   */
  setUIntArray(e, t) {
    return e ? (this._gl.uniform1uiv(e, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to an array of unsigned int32 (stored as vec2)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of unsigned int32 to store
   * @returns true if the value was set
   */
  setUIntArray2(e, t) {
    return !e || t.length % 2 !== 0 ? !1 : (this._gl.uniform2uiv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of unsigned int32 (stored as vec3)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of unsigned int32 to store
   * @returns true if the value was set
   */
  setUIntArray3(e, t) {
    return !e || t.length % 3 !== 0 ? !1 : (this._gl.uniform3uiv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of unsigned int32 (stored as vec4)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of unsigned int32 to store
   * @returns true if the value was set
   */
  setUIntArray4(e, t) {
    return !e || t.length % 4 !== 0 ? !1 : (this._gl.uniform4uiv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of number
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of number to store
   * @returns true if the value was set
   */
  setArray(e, t) {
    return !e || t.length < 1 ? !1 : (this._gl.uniform1fv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of number (stored as vec2)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of number to store
   * @returns true if the value was set
   */
  setArray2(e, t) {
    return !e || t.length % 2 !== 0 ? !1 : (this._gl.uniform2fv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of number (stored as vec3)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of number to store
   * @returns true if the value was set
   */
  setArray3(e, t) {
    return !e || t.length % 3 !== 0 ? !1 : (this._gl.uniform3fv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of number (stored as vec4)
   * @param uniform defines the webGL uniform location where to store the value
   * @param array defines the array of number to store
   * @returns true if the value was set
   */
  setArray4(e, t) {
    return !e || t.length % 4 !== 0 ? !1 : (this._gl.uniform4fv(e, t), !0);
  }
  /**
   * Set the value of an uniform to an array of float32 (stored as matrices)
   * @param uniform defines the webGL uniform location where to store the value
   * @param matrices defines the array of float32 to store
   * @returns true if the value was set
   */
  setMatrices(e, t) {
    return e ? (this._gl.uniformMatrix4fv(e, !1, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to a matrix (3x3)
   * @param uniform defines the webGL uniform location where to store the value
   * @param matrix defines the Float32Array representing the 3x3 matrix to store
   * @returns true if the value was set
   */
  setMatrix3x3(e, t) {
    return e ? (this._gl.uniformMatrix3fv(e, !1, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to a matrix (2x2)
   * @param uniform defines the webGL uniform location where to store the value
   * @param matrix defines the Float32Array representing the 2x2 matrix to store
   * @returns true if the value was set
   */
  setMatrix2x2(e, t) {
    return e ? (this._gl.uniformMatrix2fv(e, !1, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to a number (float)
   * @param uniform defines the webGL uniform location where to store the value
   * @param value defines the float number to store
   * @returns true if the value was transferred
   */
  setFloat(e, t) {
    return e ? (this._gl.uniform1f(e, t), !0) : !1;
  }
  /**
   * Set the value of an uniform to a vec2
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @returns true if the value was set
   */
  setFloat2(e, t, r) {
    return e ? (this._gl.uniform2f(e, t, r), !0) : !1;
  }
  /**
   * Set the value of an uniform to a vec3
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @param z defines the 3rd component of the value
   * @returns true if the value was set
   */
  setFloat3(e, t, r, s) {
    return e ? (this._gl.uniform3f(e, t, r, s), !0) : !1;
  }
  /**
   * Set the value of an uniform to a vec4
   * @param uniform defines the webGL uniform location where to store the value
   * @param x defines the 1st component of the value
   * @param y defines the 2nd component of the value
   * @param z defines the 3rd component of the value
   * @param w defines the 4th component of the value
   * @returns true if the value was set
   */
  setFloat4(e, t, r, s, i) {
    return e ? (this._gl.uniform4f(e, t, r, s, i), !0) : !1;
  }
  // States
  /**
   * Apply all cached states (depth, culling, stencil and alpha)
   */
  applyStates() {
    if (this._depthCullingState.apply(this._gl), this._stencilStateComposer.apply(this._gl), this._alphaState.apply(this._gl), this._colorWriteChanged) {
      this._colorWriteChanged = !1;
      const e = this._colorWrite;
      this._gl.colorMask(e, e, e, e);
    }
  }
  // Textures
  /**
   * Force the entire cache to be cleared
   * You should not have to use this function unless your engine needs to share the webGL context with another engine
   * @param bruteForce defines a boolean to force clearing ALL caches (including stencil, detoh and alpha states)
   */
  wipeCaches(e) {
    this.preventCacheWipeBetweenFrames && !e || (this._currentEffect = null, this._viewportCached.x = 0, this._viewportCached.y = 0, this._viewportCached.z = 0, this._viewportCached.w = 0, this._unbindVertexArrayObject(), e && (this._currentProgram = null, this.resetTextureCache(), this._stencilStateComposer.reset(), this._depthCullingState.reset(), this._depthCullingState.depthFunc = this._gl.LEQUAL, this._alphaState.reset(), this._alphaMode = 1, this._alphaEquation = 0, this._colorWrite = !0, this._colorWriteChanged = !0, this._unpackFlipYCached = null, this._gl.pixelStorei(this._gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this._gl.NONE), this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0), this._mustWipeVertexAttributes = !0, this.unbindAllAttributes()), this._resetVertexBufferBinding(), this._cachedIndexBuffer = null, this._cachedEffectForVertexBuffers = null, this.bindIndexBuffer(null));
  }
  /**
   * @internal
   */
  _getSamplingParameters(e, t) {
    const r = this._gl;
    let s = r.NEAREST, i = r.NEAREST;
    switch (e) {
      case 11:
        s = r.LINEAR, t ? i = r.LINEAR_MIPMAP_NEAREST : i = r.LINEAR;
        break;
      case 3:
        s = r.LINEAR, t ? i = r.LINEAR_MIPMAP_LINEAR : i = r.LINEAR;
        break;
      case 8:
        s = r.NEAREST, t ? i = r.NEAREST_MIPMAP_LINEAR : i = r.NEAREST;
        break;
      case 4:
        s = r.NEAREST, t ? i = r.NEAREST_MIPMAP_NEAREST : i = r.NEAREST;
        break;
      case 5:
        s = r.NEAREST, t ? i = r.LINEAR_MIPMAP_NEAREST : i = r.LINEAR;
        break;
      case 6:
        s = r.NEAREST, t ? i = r.LINEAR_MIPMAP_LINEAR : i = r.LINEAR;
        break;
      case 7:
        s = r.NEAREST, i = r.LINEAR;
        break;
      case 1:
        s = r.NEAREST, i = r.NEAREST;
        break;
      case 9:
        s = r.LINEAR, t ? i = r.NEAREST_MIPMAP_NEAREST : i = r.NEAREST;
        break;
      case 10:
        s = r.LINEAR, t ? i = r.NEAREST_MIPMAP_LINEAR : i = r.NEAREST;
        break;
      case 2:
        s = r.LINEAR, i = r.LINEAR;
        break;
      case 12:
        s = r.LINEAR, i = r.NEAREST;
        break;
    }
    return {
      min: i,
      mag: s
    };
  }
  /** @internal */
  _createTexture() {
    const e = this._gl.createTexture();
    if (!e)
      throw new Error("Unable to create texture");
    return e;
  }
  /** @internal */
  _createHardwareTexture() {
    return new be(this._createTexture(), this._gl);
  }
  /**
   * Creates an internal texture without binding it to a framebuffer
   * @internal
   * @param size defines the size of the texture
   * @param options defines the options used to create the texture
   * @param delayGPUTextureCreation true to delay the texture creation the first time it is really needed. false to create it right away
   * @param source source type of the texture
   * @returns a new internal texture
   */
  _createInternalTexture(e, t, r = !0, s = 0) {
    let i = !1, a = !1, o = 0, h = 3, l = 5, _ = !1, u = 1, f, c = !1, p = 0;
    t !== void 0 && typeof t == "object" ? (i = !!t.generateMipMaps, a = !!t.createMipMaps, o = t.type === void 0 ? 0 : t.type, h = t.samplingMode === void 0 ? 3 : t.samplingMode, l = t.format === void 0 ? 5 : t.format, _ = t.useSRGBBuffer === void 0 ? !1 : t.useSRGBBuffer, u = t.samples ?? 1, f = t.label, c = !!t.createMSAATexture, p = t.comparisonFunction || 0) : i = !!t, _ && (_ = this._caps.supportSRGBBuffers && (this.webGLVersion > 1 || this.isWebGPU)), (o === 1 && !this._caps.textureFloatLinearFiltering || o === 2 && !this._caps.textureHalfFloatLinearFiltering) && (h = 1), o === 1 && !this._caps.textureFloat && (o = 0, B.Warn("Float textures are not supported. Type forced to TEXTURETYPE_UNSIGNED_BYTE"));
    const m = Te(l), E = J(l), T = this._gl, g = new k(this, s), I = e.width || e, F = e.height || e, P = e.depth || 0, A = e.layers || 0, C = this._getSamplingParameters(h, (i || a) && !m), x = A !== 0 ? T.TEXTURE_2D_ARRAY : P !== 0 ? T.TEXTURE_3D : T.TEXTURE_2D, U = m ? this._getInternalFormatFromDepthTextureFormat(l, !0, E) : this._getRGBABufferInternalSizedFormat(o, l, _), D = m ? E ? T.DEPTH_STENCIL : T.DEPTH_COMPONENT : this._getInternalFormat(l), W = m ? this._getWebGLTextureTypeFromDepthTextureFormat(l) : this._getWebGLTextureType(o);
    if (this._bindTextureDirectly(x, g), A !== 0 ? (g.is2DArray = !0, T.texImage3D(x, 0, U, I, F, A, 0, D, W, null)) : P !== 0 ? (g.is3D = !0, T.texImage3D(x, 0, U, I, F, P, 0, D, W, null)) : T.texImage2D(x, 0, U, I, F, 0, D, W, null), T.texParameteri(x, T.TEXTURE_MAG_FILTER, C.mag), T.texParameteri(x, T.TEXTURE_MIN_FILTER, C.min), T.texParameteri(x, T.TEXTURE_WRAP_S, T.CLAMP_TO_EDGE), T.texParameteri(x, T.TEXTURE_WRAP_T, T.CLAMP_TO_EDGE), m && this.webGLVersion > 1 && (p === 0 ? (T.texParameteri(x, T.TEXTURE_COMPARE_FUNC, 515), T.texParameteri(x, T.TEXTURE_COMPARE_MODE, T.NONE)) : (T.texParameteri(x, T.TEXTURE_COMPARE_FUNC, p), T.texParameteri(x, T.TEXTURE_COMPARE_MODE, T.COMPARE_REF_TO_TEXTURE))), (i || a) && this._gl.generateMipmap(x), this._bindTextureDirectly(x, null), g._useSRGBBuffer = _, g.baseWidth = I, g.baseHeight = F, g.width = I, g.height = F, g.depth = A || P, g.isReady = !0, g.samples = u, g.generateMipMaps = i, g.samplingMode = h, g.type = o, g.format = l, g.label = f, g.comparisonFunction = p, this._internalTexturesCache.push(g), c) {
      let ee = null;
      if (Te(g.format) ? ee = this._setupFramebufferDepthAttachments(J(g.format), g.format !== 19, g.width, g.height, u, g.format, !0) : ee = this._createRenderBuffer(
        g.width,
        g.height,
        u,
        -1,
        this._getRGBABufferInternalSizedFormat(g.type, g.format, g._useSRGBBuffer),
        -1
        /* attachment */
      ), !ee)
        throw new Error("Unable to create render buffer");
      g._autoMSAAManagement = !0;
      let ne = g._hardwareTexture;
      ne || (ne = g._hardwareTexture = this._createHardwareTexture()), ne.addMSAARenderBuffer(ee);
    }
    return g;
  }
  /**
   * @internal
   */
  _getUseSRGBBuffer(e, t) {
    return e && this._caps.supportSRGBBuffers && (this.webGLVersion > 1 || t);
  }
  /**
   * Usually called from Texture.ts.
   * Passed information to create a WebGLTexture
   * @param url defines a value which contains one of the following:
   * * A conventional http URL, e.g. 'http://...' or 'file://...'
   * * A base64 string of in-line texture data, e.g. 'data:image/jpg;base64,/...'
   * * An indicator that data being passed using the buffer parameter, e.g. 'data:mytexture.jpg'
   * @param noMipmap defines a boolean indicating that no mipmaps shall be generated.  Ignored for compressed textures.  They must be in the file
   * @param invertY when true, image is flipped when loaded.  You probably want true. Certain compressed textures may invert this if their default is inverted (eg. ktx)
   * @param scene needed for loading to the correct scene
   * @param samplingMode mode with should be used sample / access the texture (Default: Texture.TRILINEAR_SAMPLINGMODE)
   * @param onLoad optional callback to be called upon successful completion
   * @param onError optional callback to be called upon failure
   * @param buffer a source of a file previously fetched as either a base64 string, an ArrayBuffer (compressed or image format), HTMLImageElement (image format), or a Blob
   * @param fallback an internal argument in case the function must be called again, due to etc1 not having alpha capabilities
   * @param format internal format.  Default: RGB when extension is '.jpg' else RGBA.  Ignored for compressed textures
   * @param forcedExtension defines the extension to use to pick the right loader
   * @param mimeType defines an optional mime type
   * @param loaderOptions options to be passed to the loader
   * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
   * @param useSRGBBuffer defines if the texture must be loaded in a sRGB GPU buffer (if supported by the GPU).
   * @returns a InternalTexture for assignment back into BABYLON.Texture
   */
  createTexture(e, t, r, s, i = 3, a = null, o = null, h = null, l = null, _ = null, u = null, f, c, p, m) {
    return this._createTextureBase(e, t, r, s, i, a, o, (...E) => this._prepareWebGLTexture(...E, _), (E, T, g, I, F, P) => {
      const A = this._gl, C = g.width === E && g.height === T;
      F._creationFlags = p ?? 0;
      const x = this._getTexImageParametersForCreateTexture(F.format, F._useSRGBBuffer);
      if (C)
        return A.texImage2D(A.TEXTURE_2D, 0, x.internalFormat, x.format, x.type, g), !1;
      const U = this._caps.maxTextureSize;
      if (g.width > U || g.height > U || !this._supportsHardwareTextureRescaling)
        return this._prepareWorkingCanvas(), !this._workingCanvas || !this._workingContext || (this._workingCanvas.width = E, this._workingCanvas.height = T, this._workingContext.drawImage(g, 0, 0, g.width, g.height, 0, 0, E, T), A.texImage2D(A.TEXTURE_2D, 0, x.internalFormat, x.format, x.type, this._workingCanvas), F.width = E, F.height = T), !1;
      {
        const D = new k(
          this,
          2
          /* InternalTextureSource.Temp */
        );
        this._bindTextureDirectly(A.TEXTURE_2D, D, !0), A.texImage2D(A.TEXTURE_2D, 0, x.internalFormat, x.format, x.type, g), this._rescaleTexture(D, F, s, x.format, () => {
          this._releaseTexture(D), this._bindTextureDirectly(A.TEXTURE_2D, F, !0), P();
        });
      }
      return !0;
    }, h, l, _, u, f, c, m);
  }
  /**
   * Calls to the GL texImage2D and texImage3D functions require three arguments describing the pixel format of the texture.
   * createTexture derives these from the babylonFormat and useSRGBBuffer arguments and also the file extension of the URL it's working with.
   * This function encapsulates that derivation for easy unit testing.
   * @param babylonFormat Babylon's format enum, as specified in ITextureCreationOptions.
   * @param fileExtension The file extension including the dot, e.g. .jpg.
   * @param useSRGBBuffer Use SRGB not linear.
   * @returns The options to pass to texImage2D or texImage3D calls.
   * @internal
   */
  _getTexImageParametersForCreateTexture(e, t) {
    let r, s;
    return this.webGLVersion === 1 ? (r = this._getInternalFormat(e, t), s = r) : (r = this._getInternalFormat(e, !1), s = this._getRGBABufferInternalSizedFormat(0, e, t)), {
      internalFormat: s,
      format: r,
      type: this._gl.UNSIGNED_BYTE
    };
  }
  /**
   * @internal
   */
  _rescaleTexture(e, t, r, s, i) {
  }
  /**
   * @internal
   */
  _unpackFlipY(e) {
    this._unpackFlipYCached !== e && (this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, e ? 1 : 0), this.enableUnpackFlipYCached && (this._unpackFlipYCached = e));
  }
  /** @internal */
  _getUnpackAlignement() {
    return this._gl.getParameter(this._gl.UNPACK_ALIGNMENT);
  }
  /** @internal */
  _getTextureTarget(e) {
    return e.isCube ? this._gl.TEXTURE_CUBE_MAP : e.is3D ? this._gl.TEXTURE_3D : e.is2DArray || e.isMultiview ? this._gl.TEXTURE_2D_ARRAY : this._gl.TEXTURE_2D;
  }
  /**
   * Update the sampling mode of a given texture
   * @param samplingMode defines the required sampling mode
   * @param texture defines the texture to update
   * @param generateMipMaps defines whether to generate mipmaps for the texture
   */
  updateTextureSamplingMode(e, t, r = !1) {
    const s = this._getTextureTarget(t), i = this._getSamplingParameters(e, t.useMipMaps || r);
    this._setTextureParameterInteger(s, this._gl.TEXTURE_MAG_FILTER, i.mag, t), this._setTextureParameterInteger(s, this._gl.TEXTURE_MIN_FILTER, i.min), r && (t.generateMipMaps = !0, this._gl.generateMipmap(s)), this._bindTextureDirectly(s, null), t.samplingMode = e;
  }
  /**
   * Update the dimensions of a texture
   * @param texture texture to update
   * @param width new width of the texture
   * @param height new height of the texture
   * @param depth new depth of the texture
   */
  updateTextureDimensions(e, t, r, s = 1) {
  }
  /**
   * Update the sampling mode of a given texture
   * @param texture defines the texture to update
   * @param wrapU defines the texture wrap mode of the u coordinates
   * @param wrapV defines the texture wrap mode of the v coordinates
   * @param wrapR defines the texture wrap mode of the r coordinates
   */
  updateTextureWrappingMode(e, t, r = null, s = null) {
    const i = this._getTextureTarget(e);
    t !== null && (this._setTextureParameterInteger(i, this._gl.TEXTURE_WRAP_S, this._getTextureWrapMode(t), e), e._cachedWrapU = t), r !== null && (this._setTextureParameterInteger(i, this._gl.TEXTURE_WRAP_T, this._getTextureWrapMode(r), e), e._cachedWrapV = r), (e.is2DArray || e.is3D) && s !== null && (this._setTextureParameterInteger(i, this._gl.TEXTURE_WRAP_R, this._getTextureWrapMode(s), e), e._cachedWrapR = s), this._bindTextureDirectly(i, null);
  }
  /**
   * @internal
   */
  _uploadCompressedDataToTextureDirectly(e, t, r, s, i, a = 0, o = 0) {
    const h = this._gl;
    let l = h.TEXTURE_2D;
    if (e.isCube && (l = h.TEXTURE_CUBE_MAP_POSITIVE_X + a), e._useSRGBBuffer)
      switch (t) {
        case 37492:
        case 36196:
          this._caps.etc2 ? t = h.COMPRESSED_SRGB8_ETC2 : e._useSRGBBuffer = !1;
          break;
        case 37496:
          this._caps.etc2 ? t = h.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : e._useSRGBBuffer = !1;
          break;
        case 36492:
          t = h.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
          break;
        case 37808:
          t = h.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
          break;
        case 33776:
          this._caps.s3tc_srgb ? t = h.COMPRESSED_SRGB_S3TC_DXT1_EXT : e._useSRGBBuffer = !1;
          break;
        case 33777:
          this._caps.s3tc_srgb ? t = h.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT : e._useSRGBBuffer = !1;
          break;
        case 33779:
          this._caps.s3tc_srgb ? t = h.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT : e._useSRGBBuffer = !1;
          break;
        default:
          e._useSRGBBuffer = !1;
          break;
      }
    this._gl.compressedTexImage2D(l, o, t, r, s, 0, i);
  }
  /**
   * @internal
   */
  _uploadDataToTextureDirectly(e, t, r = 0, s = 0, i, a = !1) {
    const o = this._gl, h = this._getWebGLTextureType(e.type), l = this._getInternalFormat(e.format), _ = i === void 0 ? this._getRGBABufferInternalSizedFormat(e.type, e.format, e._useSRGBBuffer) : this._getInternalFormat(i, e._useSRGBBuffer);
    this._unpackFlipY(e.invertY);
    let u = o.TEXTURE_2D;
    e.isCube && (u = o.TEXTURE_CUBE_MAP_POSITIVE_X + r);
    const f = Math.round(Math.log(e.width) * Math.LOG2E), c = Math.round(Math.log(e.height) * Math.LOG2E), p = a ? e.width : Math.pow(2, Math.max(f - s, 0)), m = a ? e.height : Math.pow(2, Math.max(c - s, 0));
    o.texImage2D(u, s, _, p, m, 0, l, h, t);
  }
  /**
   * Update a portion of an internal texture
   * @param texture defines the texture to update
   * @param imageData defines the data to store into the texture
   * @param xOffset defines the x coordinates of the update rectangle
   * @param yOffset defines the y coordinates of the update rectangle
   * @param width defines the width of the update rectangle
   * @param height defines the height of the update rectangle
   * @param faceIndex defines the face index if texture is a cube (0 by default)
   * @param lod defines the lod level to update (0 by default)
   * @param generateMipMaps defines whether to generate mipmaps or not
   */
  updateTextureData(e, t, r, s, i, a, o = 0, h = 0, l = !1) {
    const _ = this._gl, u = this._getWebGLTextureType(e.type), f = this._getInternalFormat(e.format);
    this._unpackFlipY(e.invertY);
    let c = _.TEXTURE_2D, p = _.TEXTURE_2D;
    e.isCube && (p = _.TEXTURE_CUBE_MAP_POSITIVE_X + o, c = _.TEXTURE_CUBE_MAP), this._bindTextureDirectly(c, e, !0), _.texSubImage2D(p, h, r, s, i, a, f, u, t), l && this._gl.generateMipmap(p), this._bindTextureDirectly(c, null);
  }
  /**
   * @internal
   */
  _uploadArrayBufferViewToTexture(e, t, r = 0, s = 0) {
    const i = this._gl, a = e.isCube ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D;
    this._bindTextureDirectly(a, e, !0), this._uploadDataToTextureDirectly(e, t, r, s), this._bindTextureDirectly(a, null, !0);
  }
  _prepareWebGLTextureContinuation(e, t, r, s, i) {
    const a = this._gl;
    if (!a)
      return;
    const o = this._getSamplingParameters(i, !r);
    a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, o.mag), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, o.min), !r && !s && a.generateMipmap(a.TEXTURE_2D), this._bindTextureDirectly(a.TEXTURE_2D, null), t && t.removePendingData(e), e.onLoadedObservable.notifyObservers(e), e.onLoadedObservable.clear();
  }
  _prepareWebGLTexture(e, t, r, s, i, a, o, h, l, _) {
    const u = this.getCaps().maxTextureSize, f = Math.min(u, this.needPOTTextures ? Q(s.width, u) : s.width), c = Math.min(u, this.needPOTTextures ? Q(s.height, u) : s.height), p = this._gl;
    if (p) {
      if (!e._hardwareTexture) {
        r && r.removePendingData(e);
        return;
      }
      this._bindTextureDirectly(p.TEXTURE_2D, e, !0), this._unpackFlipY(i === void 0 ? !0 : !!i), e.baseWidth = s.width, e.baseHeight = s.height, e.width = f, e.height = c, e.isReady = !0, e.type = e.type !== -1 ? e.type : 0, e.format = e.format !== -1 ? e.format : _ ?? (t === ".jpg" && !e._useSRGBBuffer ? 4 : 5), !h(f, c, s, t, e, () => {
        this._prepareWebGLTextureContinuation(e, r, a, o, l);
      }) && this._prepareWebGLTextureContinuation(e, r, a, o, l);
    }
  }
  _getInternalFormatFromDepthTextureFormat(e, t, r) {
    const s = this._gl;
    if (!t)
      return s.STENCIL_INDEX8;
    let a = r ? s.DEPTH_STENCIL : s.DEPTH_COMPONENT;
    return this.webGLVersion > 1 ? e === 15 ? a = s.DEPTH_COMPONENT16 : e === 16 ? a = s.DEPTH_COMPONENT24 : e === 17 || e === 13 ? a = r ? s.DEPTH24_STENCIL8 : s.DEPTH_COMPONENT24 : e === 14 ? a = s.DEPTH_COMPONENT32F : e === 18 && (a = r ? s.DEPTH32F_STENCIL8 : s.DEPTH_COMPONENT32F) : a = s.DEPTH_COMPONENT16, a;
  }
  _getWebGLTextureTypeFromDepthTextureFormat(e) {
    const t = this._gl;
    let r = t.UNSIGNED_INT;
    return e === 15 ? r = t.UNSIGNED_SHORT : e === 17 || e === 13 ? r = t.UNSIGNED_INT_24_8 : e === 14 ? r = t.FLOAT : e === 18 ? r = t.FLOAT_32_UNSIGNED_INT_24_8_REV : e === 19 && (r = t.UNSIGNED_BYTE), r;
  }
  /**
   * @internal
   */
  _setupFramebufferDepthAttachments(e, t, r, s, i = 1, a, o = !1) {
    const h = this._gl;
    a = a ?? (e ? 13 : 14);
    const l = this._getInternalFormatFromDepthTextureFormat(a, t, e);
    return e && t ? this._createRenderBuffer(r, s, i, h.DEPTH_STENCIL, l, o ? -1 : h.DEPTH_STENCIL_ATTACHMENT) : t ? this._createRenderBuffer(r, s, i, l, l, o ? -1 : h.DEPTH_ATTACHMENT) : e ? this._createRenderBuffer(r, s, i, l, l, o ? -1 : h.STENCIL_ATTACHMENT) : null;
  }
  /**
   * @internal
   */
  _createRenderBuffer(e, t, r, s, i, a, o = !0) {
    const l = this._gl.createRenderbuffer();
    return this._updateRenderBuffer(l, e, t, r, s, i, a, o);
  }
  _updateRenderBuffer(e, t, r, s, i, a, o, h = !0) {
    const l = this._gl;
    return l.bindRenderbuffer(l.RENDERBUFFER, e), s > 1 && l.renderbufferStorageMultisample ? l.renderbufferStorageMultisample(l.RENDERBUFFER, s, a, t, r) : l.renderbufferStorage(l.RENDERBUFFER, i, t, r), o !== -1 && l.framebufferRenderbuffer(l.FRAMEBUFFER, o, l.RENDERBUFFER, e), h && l.bindRenderbuffer(l.RENDERBUFFER, null), e;
  }
  /**
   * @internal
   */
  _releaseTexture(e) {
    this._deleteTexture(e._hardwareTexture), this.unbindAllTextures();
    const t = this._internalTexturesCache.indexOf(e);
    t !== -1 && this._internalTexturesCache.splice(t, 1), e._lodTextureHigh && e._lodTextureHigh.dispose(), e._lodTextureMid && e._lodTextureMid.dispose(), e._lodTextureLow && e._lodTextureLow.dispose(), e._irradianceTexture && e._irradianceTexture.dispose();
  }
  _deleteTexture(e) {
    e == null || e.release();
  }
  _setProgram(e) {
    this._currentProgram !== e && (Ve(e, this._gl), this._currentProgram = e);
  }
  /**
   * Binds an effect to the webGL context
   * @param effect defines the effect to bind
   */
  bindSamplers(e) {
    const t = e.getPipelineContext();
    this._setProgram(t.program);
    const r = e.getSamplers();
    for (let s = 0; s < r.length; s++) {
      const i = e.getUniform(r[s]);
      i && (this._boundUniforms[s] = i);
    }
    this._currentEffect = null;
  }
  _activateCurrentTexture() {
    this._currentTextureChannel !== this._activeChannel && (this._gl.activeTexture(this._gl.TEXTURE0 + this._activeChannel), this._currentTextureChannel = this._activeChannel);
  }
  /**
   * @internal
   */
  _bindTextureDirectly(e, t, r = !1, s = !1) {
    var h;
    let i = !1;
    const a = t && t._associatedChannel > -1;
    if (r && a && (this._activeChannel = t._associatedChannel), this._boundTexturesCache[this._activeChannel] !== t || s) {
      if (this._activateCurrentTexture(), t && t.isMultiview)
        throw B.Error(["_bindTextureDirectly called with a multiview texture!", e, t]), "_bindTextureDirectly called with a multiview texture!";
      this._gl.bindTexture(e, ((h = t == null ? void 0 : t._hardwareTexture) == null ? void 0 : h.underlyingResource) ?? null), this._boundTexturesCache[this._activeChannel] = t, t && (t._associatedChannel = this._activeChannel);
    } else
      r && (i = !0, this._activateCurrentTexture());
    return a && !r && this._bindSamplerUniformToChannel(t._associatedChannel, this._activeChannel), i;
  }
  /**
   * @internal
   */
  _bindTexture(e, t, r) {
    if (e === void 0)
      return;
    t && (t._associatedChannel = e), this._activeChannel = e;
    const s = t ? this._getTextureTarget(t) : this._gl.TEXTURE_2D;
    this._bindTextureDirectly(s, t);
  }
  /**
   * Unbind all textures from the webGL context
   */
  unbindAllTextures() {
    for (let e = 0; e < this._maxSimultaneousTextures; e++)
      this._activeChannel = e, this._bindTextureDirectly(this._gl.TEXTURE_2D, null), this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null), this.webGLVersion > 1 && (this._bindTextureDirectly(this._gl.TEXTURE_3D, null), this._bindTextureDirectly(this._gl.TEXTURE_2D_ARRAY, null));
  }
  /**
   * Sets a texture to the according uniform.
   * @param channel The texture channel
   * @param uniform The uniform to set
   * @param texture The texture to apply
   * @param name The name of the uniform in the effect
   */
  setTexture(e, t, r, s) {
    e !== void 0 && (t && (this._boundUniforms[e] = t), this._setTexture(e, r));
  }
  _bindSamplerUniformToChannel(e, t) {
    const r = this._boundUniforms[e];
    !r || r._currentState === t || (this._gl.uniform1i(r, t), r._currentState = t);
  }
  _getTextureWrapMode(e) {
    switch (e) {
      case 1:
        return this._gl.REPEAT;
      case 0:
        return this._gl.CLAMP_TO_EDGE;
      case 2:
        return this._gl.MIRRORED_REPEAT;
    }
    return this._gl.REPEAT;
  }
  _setTexture(e, t, r = !1, s = !1, i = "") {
    if (!t)
      return this._boundTexturesCache[e] != null && (this._activeChannel = e, this._bindTextureDirectly(this._gl.TEXTURE_2D, null), this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null), this.webGLVersion > 1 && (this._bindTextureDirectly(this._gl.TEXTURE_3D, null), this._bindTextureDirectly(this._gl.TEXTURE_2D_ARRAY, null))), !1;
    if (t.video) {
      this._activeChannel = e;
      const l = t.getInternalTexture();
      l && (l._associatedChannel = e), t.update();
    } else if (t.delayLoadState === 4)
      return t.delayLoad(), !1;
    let a;
    s ? a = t.depthStencilTexture : t.isReady() ? a = t.getInternalTexture() : t.isCube ? a = this.emptyCubeTexture : t.is3D ? a = this.emptyTexture3D : t.is2DArray ? a = this.emptyTexture2DArray : a = this.emptyTexture, !r && a && (a._associatedChannel = e);
    let o = !0;
    this._boundTexturesCache[e] === a && (r || this._bindSamplerUniformToChannel(a._associatedChannel, e), o = !1), this._activeChannel = e;
    const h = this._getTextureTarget(a);
    if (o && this._bindTextureDirectly(h, a, r), a && !a.isMultiview) {
      if (a.isCube && a._cachedCoordinatesMode !== t.coordinatesMode) {
        a._cachedCoordinatesMode = t.coordinatesMode;
        const l = t.coordinatesMode !== 3 && t.coordinatesMode !== 5 ? 1 : 0;
        t.wrapU = l, t.wrapV = l;
      }
      a._cachedWrapU !== t.wrapU && (a._cachedWrapU = t.wrapU, this._setTextureParameterInteger(h, this._gl.TEXTURE_WRAP_S, this._getTextureWrapMode(t.wrapU), a)), a._cachedWrapV !== t.wrapV && (a._cachedWrapV = t.wrapV, this._setTextureParameterInteger(h, this._gl.TEXTURE_WRAP_T, this._getTextureWrapMode(t.wrapV), a)), a.is3D && a._cachedWrapR !== t.wrapR && (a._cachedWrapR = t.wrapR, this._setTextureParameterInteger(h, this._gl.TEXTURE_WRAP_R, this._getTextureWrapMode(t.wrapR), a)), this._setAnisotropicLevel(h, a, t.anisotropicFilteringLevel);
    }
    return !0;
  }
  /**
   * Sets an array of texture to the webGL context
   * @param channel defines the channel where the texture array must be set
   * @param uniform defines the associated uniform location
   * @param textures defines the array of textures to bind
   * @param name name of the channel
   */
  setTextureArray(e, t, r, s) {
    if (!(e === void 0 || !t)) {
      (!this._textureUnits || this._textureUnits.length !== r.length) && (this._textureUnits = new Int32Array(r.length));
      for (let i = 0; i < r.length; i++) {
        const a = r[i].getInternalTexture();
        a ? (this._textureUnits[i] = e + i, a._associatedChannel = e + i) : this._textureUnits[i] = -1;
      }
      this._gl.uniform1iv(t, this._textureUnits);
      for (let i = 0; i < r.length; i++)
        this._setTexture(this._textureUnits[i], r[i], !0);
    }
  }
  /**
   * @internal
   */
  _setAnisotropicLevel(e, t, r) {
    const s = this._caps.textureAnisotropicFilterExtension;
    t.samplingMode !== 11 && t.samplingMode !== 3 && t.samplingMode !== 2 && (r = 1), s && t._cachedAnisotropicFilteringLevel !== r && (this._setTextureParameterFloat(e, s.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(r, this._caps.maxAnisotropy), t), t._cachedAnisotropicFilteringLevel = r);
  }
  _setTextureParameterFloat(e, t, r, s) {
    this._bindTextureDirectly(e, s, !0, !0), this._gl.texParameterf(e, t, r);
  }
  _setTextureParameterInteger(e, t, r, s) {
    s && this._bindTextureDirectly(e, s, !0, !0), this._gl.texParameteri(e, t, r);
  }
  /**
   * Unbind all vertex attributes from the webGL context
   */
  unbindAllAttributes() {
    if (this._mustWipeVertexAttributes) {
      this._mustWipeVertexAttributes = !1;
      for (let e = 0; e < this._caps.maxVertexAttribs; e++)
        this.disableAttributeByIndex(e);
      return;
    }
    for (let e = 0, t = this._vertexAttribArraysEnabled.length; e < t; e++)
      e >= this._caps.maxVertexAttribs || !this._vertexAttribArraysEnabled[e] || this.disableAttributeByIndex(e);
  }
  /**
   * Force the engine to release all cached effects. This means that next effect compilation will have to be done completely even if a similar effect was already compiled
   */
  releaseEffects() {
    this._compiledEffects = {}, this.onReleaseEffectsObservable.notifyObservers(this);
  }
  /**
   * Dispose and release all associated resources
   */
  dispose() {
    var e;
    fe() && this._renderingCanvas && (this._renderingCanvas.removeEventListener("webglcontextlost", this._onContextLost), this._onContextRestored && this._renderingCanvas.removeEventListener("webglcontextrestored", this._onContextRestored)), super.dispose(), this._dummyFramebuffer && this._gl.deleteFramebuffer(this._dummyFramebuffer), this.unbindAllAttributes(), this._boundUniforms = {}, this._workingCanvas = null, this._workingContext = null, this._currentBufferPointers.length = 0, this._currentProgram = null, this._creationOptions.loseContextOnDispose && ((e = this._gl.getExtension("WEBGL_lose_context")) == null || e.loseContext()), ae(this._gl);
  }
  /**
   * Attach a new callback raised when context lost event is fired
   * @param callback defines the callback to call
   */
  attachContextLostEvent(e) {
    this._renderingCanvas && this._renderingCanvas.addEventListener("webglcontextlost", e, !1);
  }
  /**
   * Attach a new callback raised when context restored event is fired
   * @param callback defines the callback to call
   */
  attachContextRestoredEvent(e) {
    this._renderingCanvas && this._renderingCanvas.addEventListener("webglcontextrestored", e, !1);
  }
  /**
   * Get the current error code of the webGL context
   * @returns the error code
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getError
   */
  getError() {
    return this._gl.getError();
  }
  _canRenderToFloatFramebuffer() {
    return this._webGLVersion > 1 ? this._caps.colorBufferFloat : this._canRenderToFramebuffer(1);
  }
  _canRenderToHalfFloatFramebuffer() {
    return this._webGLVersion > 1 ? this._caps.colorBufferFloat : this._canRenderToFramebuffer(2);
  }
  // Thank you : http://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture
  _canRenderToFramebuffer(e) {
    const t = this._gl;
    for (; t.getError() !== t.NO_ERROR; )
      ;
    let r = !0;
    const s = t.createTexture();
    t.bindTexture(t.TEXTURE_2D, s), t.texImage2D(t.TEXTURE_2D, 0, this._getRGBABufferInternalSizedFormat(e), 1, 1, 0, t.RGBA, this._getWebGLTextureType(e), null), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST);
    const i = t.createFramebuffer();
    t.bindFramebuffer(t.FRAMEBUFFER, i), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, s, 0);
    const a = t.checkFramebufferStatus(t.FRAMEBUFFER);
    if (r = r && a === t.FRAMEBUFFER_COMPLETE, r = r && t.getError() === t.NO_ERROR, r && (t.clear(t.COLOR_BUFFER_BIT), r = r && t.getError() === t.NO_ERROR), r) {
      t.bindFramebuffer(t.FRAMEBUFFER, null);
      const o = t.RGBA, h = t.UNSIGNED_BYTE, l = new Uint8Array(4);
      t.readPixels(0, 0, 1, 1, o, h, l), r = r && t.getError() === t.NO_ERROR;
    }
    for (t.deleteTexture(s), t.deleteFramebuffer(i), t.bindFramebuffer(t.FRAMEBUFFER, null); !r && t.getError() !== t.NO_ERROR; )
      ;
    return r;
  }
  /**
   * @internal
   */
  _getWebGLTextureType(e) {
    if (this._webGLVersion === 1) {
      switch (e) {
        case 1:
          return this._gl.FLOAT;
        case 2:
          return this._gl.HALF_FLOAT_OES;
        case 0:
          return this._gl.UNSIGNED_BYTE;
        case 8:
          return this._gl.UNSIGNED_SHORT_4_4_4_4;
        case 9:
          return this._gl.UNSIGNED_SHORT_5_5_5_1;
        case 10:
          return this._gl.UNSIGNED_SHORT_5_6_5;
      }
      return this._gl.UNSIGNED_BYTE;
    }
    switch (e) {
      case 3:
        return this._gl.BYTE;
      case 0:
        return this._gl.UNSIGNED_BYTE;
      case 4:
        return this._gl.SHORT;
      case 5:
        return this._gl.UNSIGNED_SHORT;
      case 6:
        return this._gl.INT;
      case 7:
        return this._gl.UNSIGNED_INT;
      case 1:
        return this._gl.FLOAT;
      case 2:
        return this._gl.HALF_FLOAT;
      case 8:
        return this._gl.UNSIGNED_SHORT_4_4_4_4;
      case 9:
        return this._gl.UNSIGNED_SHORT_5_5_5_1;
      case 10:
        return this._gl.UNSIGNED_SHORT_5_6_5;
      case 11:
        return this._gl.UNSIGNED_INT_2_10_10_10_REV;
      case 12:
        return this._gl.UNSIGNED_INT_24_8;
      case 13:
        return this._gl.UNSIGNED_INT_10F_11F_11F_REV;
      case 14:
        return this._gl.UNSIGNED_INT_5_9_9_9_REV;
      case 15:
        return this._gl.FLOAT_32_UNSIGNED_INT_24_8_REV;
    }
    return this._gl.UNSIGNED_BYTE;
  }
  /**
   * @internal
   */
  _getInternalFormat(e, t = !1) {
    let r = t ? this._glSRGBExtensionValues.SRGB8_ALPHA8 : this._gl.RGBA;
    switch (e) {
      case 0:
        r = this._gl.ALPHA;
        break;
      case 1:
        r = this._gl.LUMINANCE;
        break;
      case 2:
        r = this._gl.LUMINANCE_ALPHA;
        break;
      case 6:
      case 33322:
      case 36760:
        r = this._gl.RED;
        break;
      case 7:
      case 33324:
      case 36761:
        r = this._gl.RG;
        break;
      case 4:
      case 32852:
      case 36762:
        r = t ? this._glSRGBExtensionValues.SRGB : this._gl.RGB;
        break;
      case 5:
      case 32859:
      case 36763:
        r = t ? this._glSRGBExtensionValues.SRGB8_ALPHA8 : this._gl.RGBA;
        break;
    }
    if (this._webGLVersion > 1)
      switch (e) {
        case 8:
          r = this._gl.RED_INTEGER;
          break;
        case 9:
          r = this._gl.RG_INTEGER;
          break;
        case 10:
          r = this._gl.RGB_INTEGER;
          break;
        case 11:
          r = this._gl.RGBA_INTEGER;
          break;
      }
    return r;
  }
  /**
   * @internal
   */
  _getRGBABufferInternalSizedFormat(e, t, r = !1) {
    if (this._webGLVersion === 1) {
      if (t !== void 0)
        switch (t) {
          case 0:
            return this._gl.ALPHA;
          case 1:
            return this._gl.LUMINANCE;
          case 2:
            return this._gl.LUMINANCE_ALPHA;
          case 4:
            return r ? this._glSRGBExtensionValues.SRGB : this._gl.RGB;
        }
      return this._gl.RGBA;
    }
    switch (e) {
      case 3:
        switch (t) {
          case 6:
            return this._gl.R8_SNORM;
          case 7:
            return this._gl.RG8_SNORM;
          case 4:
            return this._gl.RGB8_SNORM;
          case 8:
            return this._gl.R8I;
          case 9:
            return this._gl.RG8I;
          case 10:
            return this._gl.RGB8I;
          case 11:
            return this._gl.RGBA8I;
          default:
            return this._gl.RGBA8_SNORM;
        }
      case 0:
        switch (t) {
          case 6:
            return this._gl.R8;
          case 7:
            return this._gl.RG8;
          case 4:
            return r ? this._glSRGBExtensionValues.SRGB8 : this._gl.RGB8;
          case 5:
            return r ? this._glSRGBExtensionValues.SRGB8_ALPHA8 : this._gl.RGBA8;
          case 8:
            return this._gl.R8UI;
          case 9:
            return this._gl.RG8UI;
          case 10:
            return this._gl.RGB8UI;
          case 11:
            return this._gl.RGBA8UI;
          case 0:
            return this._gl.ALPHA;
          case 1:
            return this._gl.LUMINANCE;
          case 2:
            return this._gl.LUMINANCE_ALPHA;
          default:
            return this._gl.RGBA8;
        }
      case 4:
        switch (t) {
          case 8:
            return this._gl.R16I;
          case 36760:
            return this._gl.R16_SNORM_EXT;
          case 36761:
            return this._gl.RG16_SNORM_EXT;
          case 36762:
            return this._gl.RGB16_SNORM_EXT;
          case 36763:
            return this._gl.RGBA16_SNORM_EXT;
          case 9:
            return this._gl.RG16I;
          case 10:
            return this._gl.RGB16I;
          case 11:
            return this._gl.RGBA16I;
          default:
            return this._gl.RGBA16I;
        }
      case 5:
        switch (t) {
          case 8:
            return this._gl.R16UI;
          case 33322:
            return this._gl.R16_EXT;
          case 33324:
            return this._gl.RG16_EXT;
          case 32852:
            return this._gl.RGB16_EXT;
          case 32859:
            return this._gl.RGBA16_EXT;
          case 9:
            return this._gl.RG16UI;
          case 10:
            return this._gl.RGB16UI;
          case 11:
            return this._gl.RGBA16UI;
          default:
            return this._gl.RGBA16UI;
        }
      case 6:
        switch (t) {
          case 8:
            return this._gl.R32I;
          case 9:
            return this._gl.RG32I;
          case 10:
            return this._gl.RGB32I;
          case 11:
            return this._gl.RGBA32I;
          default:
            return this._gl.RGBA32I;
        }
      case 7:
        switch (t) {
          case 8:
            return this._gl.R32UI;
          case 9:
            return this._gl.RG32UI;
          case 10:
            return this._gl.RGB32UI;
          case 11:
            return this._gl.RGBA32UI;
          default:
            return this._gl.RGBA32UI;
        }
      case 1:
        switch (t) {
          case 6:
            return this._gl.R32F;
          case 7:
            return this._gl.RG32F;
          case 4:
            return this._gl.RGB32F;
          case 5:
            return this._gl.RGBA32F;
          default:
            return this._gl.RGBA32F;
        }
      case 2:
        switch (t) {
          case 6:
            return this._gl.R16F;
          case 7:
            return this._gl.RG16F;
          case 4:
            return this._gl.RGB16F;
          case 5:
            return this._gl.RGBA16F;
          default:
            return this._gl.RGBA16F;
        }
      case 10:
        return this._gl.RGB565;
      case 13:
        return this._gl.R11F_G11F_B10F;
      case 14:
        return this._gl.RGB9_E5;
      case 8:
        return this._gl.RGBA4;
      case 9:
        return this._gl.RGB5_A1;
      case 11:
        switch (t) {
          case 5:
            return this._gl.RGB10_A2;
          case 11:
            return this._gl.RGB10_A2UI;
          default:
            return this._gl.RGB10_A2;
        }
    }
    return r ? this._glSRGBExtensionValues.SRGB8_ALPHA8 : this._gl.RGBA8;
  }
  /**
   * Reads pixels from the current frame buffer. Please note that this function can be slow
   * @param x defines the x coordinate of the rectangle where pixels must be read
   * @param y defines the y coordinate of the rectangle where pixels must be read
   * @param width defines the width of the rectangle where pixels must be read
   * @param height defines the height of the rectangle where pixels must be read
   * @param hasAlpha defines whether the output should have alpha or not (defaults to true)
   * @param flushRenderer true to flush the renderer from the pending commands before reading the pixels
   * @param data defines the data to fill with the read pixels (if not provided, a new one will be created)
   * @returns a ArrayBufferView promise (Uint8Array) containing RGBA colors
   */
  readPixels(e, t, r, s, i = !0, a = !0, o = null) {
    const h = i ? 4 : 3, l = i ? this._gl.RGBA : this._gl.RGB, _ = r * s * h;
    if (!o)
      o = new Uint8Array(_);
    else if (o.length < _)
      return B.Error(`Data buffer is too small to store the read pixels (${o.length} should be more than ${_})`), Promise.resolve(o);
    return a && this.flushFramebuffer(), this._gl.readPixels(e, t, r, s, l, this._gl.UNSIGNED_BYTE, o), Promise.resolve(o);
  }
  /**
   * Gets a Promise<boolean> indicating if the engine can be instantiated (ie. if a webGL context can be found)
   */
  static get IsSupportedAsync() {
    return Promise.resolve(this.isSupported());
  }
  /**
   * Gets a boolean indicating if the engine can be instantiated (ie. if a webGL context can be found)
   */
  static get IsSupported() {
    return this.isSupported();
  }
  /**
   * Gets a boolean indicating if the engine can be instantiated (ie. if a webGL context can be found)
   * @returns true if the engine can be created
   * @ignorenaming
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  static isSupported() {
    if (this._HasMajorPerformanceCaveat !== null)
      return !this._HasMajorPerformanceCaveat;
    if (this._IsSupported === null)
      try {
        const e = b._CreateCanvas(1, 1), t = e.getContext("webgl") || e.getContext("experimental-webgl");
        this._IsSupported = t != null && !!window.WebGLRenderingContext;
      } catch {
        this._IsSupported = !1;
      }
    return this._IsSupported;
  }
  /**
   * Gets a boolean indicating if the engine can be instantiated on a performant device (ie. if a webGL context can be found and it does not use a slow implementation)
   */
  static get HasMajorPerformanceCaveat() {
    if (this._HasMajorPerformanceCaveat === null)
      try {
        const e = b._CreateCanvas(1, 1), t = e.getContext("webgl", { failIfMajorPerformanceCaveat: !0 }) || e.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: !0 });
        this._HasMajorPerformanceCaveat = !t;
      } catch {
        this._HasMajorPerformanceCaveat = !1;
      }
    return this._HasMajorPerformanceCaveat;
  }
}
S._TempClearColorUint32 = new Uint32Array(4);
S._TempClearColorInt32 = new Int32Array(4);
S.ExceptionList = [
  { key: "Chrome/63.0", capture: "63\\.0\\.3239\\.(\\d+)", captureConstraint: 108, targets: ["uniformBuffer"] },
  { key: "Firefox/58", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
  { key: "Firefox/59", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
  { key: "Chrome/72.+?Mobile", capture: null, captureConstraint: null, targets: ["vao"] },
  { key: "Chrome/73.+?Mobile", capture: null, captureConstraint: null, targets: ["vao"] },
  { key: "Chrome/74.+?Mobile", capture: null, captureConstraint: null, targets: ["vao"] },
  { key: "Mac OS.+Chrome/71", capture: null, captureConstraint: null, targets: ["vao"] },
  { key: "Mac OS.+Chrome/72", capture: null, captureConstraint: null, targets: ["vao"] },
  { key: "Mac OS.+Chrome", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
  { key: "Chrome/12\\d\\..+?Mobile", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
  // desktop osx safari 15.4
  { key: ".*AppleWebKit.*(15.4).*Safari", capture: null, captureConstraint: null, targets: ["antialias", "maxMSAASamples"] },
  // mobile browsers using safari 15.4 on ios
  { key: ".*(15.4).*AppleWebKit.*Safari", capture: null, captureConstraint: null, targets: ["antialias", "maxMSAASamples"] }
];
S._ConcatenateShader = ye;
S._IsSupported = null;
S._HasMajorPerformanceCaveat = null;
const Ft = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ThinEngine: S
}, Symbol.toStringTag, { value: "Module" }));
class ot {
  /**
   * constructor
   * @param frameSampleSize The number of samples required to saturate the sliding window
   */
  constructor(e = 30) {
    this._enabled = !0, this._rollingFrameTime = new _t(e);
  }
  /**
   * Samples current frame
   * @param timeMs A timestamp in milliseconds of the current frame to compare with other frames
   */
  sampleFrame(e = ke.Now) {
    if (this._enabled) {
      if (this._lastFrameTimeMs != null) {
        const t = e - this._lastFrameTimeMs;
        this._rollingFrameTime.add(t);
      }
      this._lastFrameTimeMs = e;
    }
  }
  /**
   * Returns the average frame time in milliseconds over the sliding window (or the subset of frames sampled so far)
   */
  get averageFrameTime() {
    return this._rollingFrameTime.average;
  }
  /**
   * Returns the variance frame time in milliseconds over the sliding window (or the subset of frames sampled so far)
   */
  get averageFrameTimeVariance() {
    return this._rollingFrameTime.variance;
  }
  /**
   * Returns the frame time of the most recent frame
   */
  get instantaneousFrameTime() {
    return this._rollingFrameTime.history(0);
  }
  /**
   * Returns the average framerate in frames per second over the sliding window (or the subset of frames sampled so far)
   */
  get averageFPS() {
    return 1e3 / this._rollingFrameTime.average;
  }
  /**
   * Returns the average framerate in frames per second using the most recent frame time
   */
  get instantaneousFPS() {
    const e = this._rollingFrameTime.history(0);
    return e === 0 ? 0 : 1e3 / e;
  }
  /**
   * Returns true if enough samples have been taken to completely fill the sliding window
   */
  get isSaturated() {
    return this._rollingFrameTime.isSaturated();
  }
  /**
   * Enables contributions to the sliding window sample set
   */
  enable() {
    this._enabled = !0;
  }
  /**
   * Disables contributions to the sliding window sample set
   * Samples will not be interpolated over the disabled period
   */
  disable() {
    this._enabled = !1, this._lastFrameTimeMs = null;
  }
  /**
   * Returns true if sampling is enabled
   */
  get isEnabled() {
    return this._enabled;
  }
  /**
   * Resets performance monitor
   */
  reset() {
    this._lastFrameTimeMs = null, this._rollingFrameTime.reset();
  }
}
class _t {
  /**
   * constructor
   * @param length The number of samples required to saturate the sliding window
   */
  constructor(e) {
    this._samples = new Array(e), this.reset();
  }
  /**
   * Adds a sample to the sample set
   * @param v The sample value
   */
  add(e) {
    let t;
    if (this.isSaturated()) {
      const r = this._samples[this._pos];
      t = r - this.average, this.average -= t / (this._sampleCount - 1), this._m2 -= t * (r - this.average);
    } else
      this._sampleCount++;
    t = e - this.average, this.average += t / this._sampleCount, this._m2 += t * (e - this.average), this.variance = this._m2 / (this._sampleCount - 1), this._samples[this._pos] = e, this._pos++, this._pos %= this._samples.length;
  }
  /**
   * Returns previously added values or null if outside of history or outside the sliding window domain
   * @param i Index in history. For example, pass 0 for the most recent value and 1 for the value before that
   * @returns Value previously recorded with add() or null if outside of range
   */
  history(e) {
    if (e >= this._sampleCount || e >= this._samples.length)
      return 0;
    const t = this._wrapPosition(this._pos - 1);
    return this._samples[this._wrapPosition(t - e)];
  }
  /**
   * Returns true if enough samples have been taken to completely fill the sliding window
   * @returns true if sample-set saturated
   */
  isSaturated() {
    return this._sampleCount >= this._samples.length;
  }
  /**
   * Resets the rolling average (equivalent to 0 samples taken so far)
   */
  reset() {
    this.average = 0, this.variance = 0, this._sampleCount = 0, this._pos = 0, this._m2 = 0;
  }
  /**
   * Wraps a value around the sample range boundaries
   * @param i Position in sample range, for example if the sample length is 5, and i is -3, then 2 will be returned.
   * @returns Wrapped position in sample range
   */
  _wrapPosition(e) {
    const t = this._samples.length;
    return (e % t + t) % t;
  }
}
S.prototype.setAlphaMode = function(n, e = !1) {
  if (this._alphaMode === n) {
    if (!e) {
      const t = n === 0;
      this.depthCullingState.depthMask !== t && (this.depthCullingState.depthMask = t);
    }
    return;
  }
  switch (n) {
    case 0:
      this._alphaState.alphaBlend = !1;
      break;
    case 7:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 8:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA), this._alphaState.alphaBlend = !0;
      break;
    case 2:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 6:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE, this._gl.ZERO, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 1:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.SRC_ALPHA, this._gl.ONE, this._gl.ZERO, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 3:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ZERO, this._gl.ONE_MINUS_SRC_COLOR, this._gl.ONE, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 4:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.DST_COLOR, this._gl.ZERO, this._gl.ONE, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 5:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_COLOR, this._gl.ONE, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 9:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.CONSTANT_COLOR, this._gl.ONE_MINUS_CONSTANT_COLOR, this._gl.CONSTANT_ALPHA, this._gl.ONE_MINUS_CONSTANT_ALPHA), this._alphaState.alphaBlend = !0;
      break;
    case 10:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE_MINUS_SRC_COLOR, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA), this._alphaState.alphaBlend = !0;
      break;
    case 11:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE, this._gl.ONE, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 12:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.DST_ALPHA, this._gl.ONE, this._gl.ZERO, this._gl.ZERO), this._alphaState.alphaBlend = !0;
      break;
    case 13:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE_MINUS_DST_COLOR, this._gl.ONE_MINUS_SRC_COLOR, this._gl.ONE_MINUS_DST_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA), this._alphaState.alphaBlend = !0;
      break;
    case 14:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA), this._alphaState.alphaBlend = !0;
      break;
    case 15:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE, this._gl.ONE, this._gl.ZERO), this._alphaState.alphaBlend = !0;
      break;
    case 16:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE_MINUS_DST_COLOR, this._gl.ONE_MINUS_SRC_COLOR, this._gl.ZERO, this._gl.ONE), this._alphaState.alphaBlend = !0;
      break;
    case 17:
      this._alphaState.setAlphaBlendFunctionParameters(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA), this._alphaState.alphaBlend = !0;
      break;
  }
  e || (this.depthCullingState.depthMask = n === 0), this._alphaMode = n;
};
S.prototype.updateRawTexture = function(n, e, t, r, s = null, i = 0, a = !1) {
  if (!n)
    return;
  const o = this._getRGBABufferInternalSizedFormat(i, t, a), h = this._getInternalFormat(t), l = this._getWebGLTextureType(i);
  this._bindTextureDirectly(this._gl.TEXTURE_2D, n, !0), this._unpackFlipY(r === void 0 ? !0 : !!r), this._doNotHandleContextLost || (n._bufferView = e, n.format = t, n.type = i, n.invertY = r, n._compression = s), n.width % 4 !== 0 && this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1), s && e ? this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this.getCaps().s3tc[s], n.width, n.height, 0, e) : this._gl.texImage2D(this._gl.TEXTURE_2D, 0, o, n.width, n.height, 0, h, l, e), n.generateMipMaps && this._gl.generateMipmap(this._gl.TEXTURE_2D), this._bindTextureDirectly(this._gl.TEXTURE_2D, null), n.isReady = !0;
};
S.prototype.createRawTexture = function(n, e, t, r, s, i, a, o = null, h = 0, l = 0, _ = !1) {
  const u = new k(
    this,
    3
    /* InternalTextureSource.Raw */
  );
  u.baseWidth = e, u.baseHeight = t, u.width = e, u.height = t, u.format = r, u.generateMipMaps = s, u.samplingMode = a, u.invertY = i, u._compression = o, u.type = h, u._useSRGBBuffer = this._getUseSRGBBuffer(_, !s), this._doNotHandleContextLost || (u._bufferView = n), this.updateRawTexture(u, n, r, i, o, h, u._useSRGBBuffer), this._bindTextureDirectly(this._gl.TEXTURE_2D, u, !0);
  const f = this._getSamplingParameters(a, s);
  return this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, f.mag), this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, f.min), s && this._gl.generateMipmap(this._gl.TEXTURE_2D), this._bindTextureDirectly(this._gl.TEXTURE_2D, null), this._internalTexturesCache.push(u), u;
};
S.prototype.createRawCubeTexture = function(n, e, t, r, s, i, a, o = null) {
  const h = this._gl, l = new k(
    this,
    8
    /* InternalTextureSource.CubeRaw */
  );
  l.isCube = !0, l.format = t, l.type = r, this._doNotHandleContextLost || (l._bufferViewArray = n);
  const _ = this._getWebGLTextureType(r);
  let u = this._getInternalFormat(t);
  u === h.RGB && (u = h.RGBA), _ === h.FLOAT && !this._caps.textureFloatLinearFiltering ? (s = !1, a = 1, B.Warn("Float texture filtering is not supported. Mipmap generation and sampling mode are forced to false and TEXTURE_NEAREST_SAMPLINGMODE, respectively.")) : _ === this._gl.HALF_FLOAT_OES && !this._caps.textureHalfFloatLinearFiltering ? (s = !1, a = 1, B.Warn("Half float texture filtering is not supported. Mipmap generation and sampling mode are forced to false and TEXTURE_NEAREST_SAMPLINGMODE, respectively.")) : _ === h.FLOAT && !this._caps.textureFloatRender ? (s = !1, B.Warn("Render to float textures is not supported. Mipmap generation forced to false.")) : _ === h.HALF_FLOAT && !this._caps.colorBufferFloat && (s = !1, B.Warn("Render to half float textures is not supported. Mipmap generation forced to false."));
  const f = e, c = f;
  if (l.width = f, l.height = c, l.invertY = i, l._compression = o, !this.needPOTTextures || re(l.width) && re(l.height) || (s = !1), n)
    this.updateRawCubeTexture(l, n, t, r, i, o);
  else {
    const E = this._getRGBABufferInternalSizedFormat(r), T = 0;
    this._bindTextureDirectly(h.TEXTURE_CUBE_MAP, l, !0);
    for (let g = 0; g < 6; g++)
      o ? h.compressedTexImage2D(h.TEXTURE_CUBE_MAP_POSITIVE_X + g, T, this.getCaps().s3tc[o], l.width, l.height, 0, void 0) : h.texImage2D(h.TEXTURE_CUBE_MAP_POSITIVE_X + g, T, E, l.width, l.height, 0, u, _, null);
    this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null);
  }
  this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, l, !0), n && s && this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
  const m = this._getSamplingParameters(a, s);
  return h.texParameteri(h.TEXTURE_CUBE_MAP, h.TEXTURE_MAG_FILTER, m.mag), h.texParameteri(h.TEXTURE_CUBE_MAP, h.TEXTURE_MIN_FILTER, m.min), h.texParameteri(h.TEXTURE_CUBE_MAP, h.TEXTURE_WRAP_S, h.CLAMP_TO_EDGE), h.texParameteri(h.TEXTURE_CUBE_MAP, h.TEXTURE_WRAP_T, h.CLAMP_TO_EDGE), this._bindTextureDirectly(h.TEXTURE_CUBE_MAP, null), l.generateMipMaps = s, l.samplingMode = a, l.isReady = !0, l;
};
S.prototype.updateRawCubeTexture = function(n, e, t, r, s, i = null, a = 0) {
  n._bufferViewArray = e, n.format = t, n.type = r, n.invertY = s, n._compression = i;
  const o = this._gl, h = this._getWebGLTextureType(r);
  let l = this._getInternalFormat(t);
  const _ = this._getRGBABufferInternalSizedFormat(r);
  let u = !1;
  l === o.RGB && (l = o.RGBA, u = !0), this._bindTextureDirectly(o.TEXTURE_CUBE_MAP, n, !0), this._unpackFlipY(s === void 0 ? !0 : !!s), n.width % 4 !== 0 && o.pixelStorei(o.UNPACK_ALIGNMENT, 1);
  for (let c = 0; c < 6; c++) {
    let p = e[c];
    i ? o.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + c, a, this.getCaps().s3tc[i], n.width, n.height, 0, p) : (u && (p = me(p, n.width, n.height, r)), o.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + c, a, _, n.width, n.height, 0, l, h, p));
  }
  (!this.needPOTTextures || re(n.width) && re(n.height)) && n.generateMipMaps && a === 0 && this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP), this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null), n.isReady = !0;
};
S.prototype.createRawCubeTextureFromUrl = function(n, e, t, r, s, i, a, o, h = null, l = null, _ = 3, u = !1) {
  const f = this._gl, c = this.createRawCubeTexture(null, t, r, s, !i, u, _, null);
  e == null || e.addPendingData(c), c.url = n, c.isReady = !1, this._internalTexturesCache.push(c);
  const p = (E, T) => {
    e == null || e.removePendingData(c), l && E && l(E.status + " " + E.statusText, T);
  }, m = (E) => {
    if (!c._hardwareTexture)
      return;
    const T = c.width, g = a(E);
    if (g) {
      if (o) {
        const I = this._getWebGLTextureType(s);
        let F = this._getInternalFormat(r);
        const P = this._getRGBABufferInternalSizedFormat(s);
        let A = !1;
        F === f.RGB && (F = f.RGBA, A = !0), this._bindTextureDirectly(f.TEXTURE_CUBE_MAP, c, !0), this._unpackFlipY(!1);
        const C = o(g);
        for (let x = 0; x < C.length; x++) {
          const U = T >> x;
          for (let D = 0; D < 6; D++) {
            let W = C[x][D];
            A && (W = me(W, U, U, s)), f.texImage2D(D, x, P, U, U, 0, F, I, W);
          }
        }
        this._bindTextureDirectly(f.TEXTURE_CUBE_MAP, null);
      } else
        this.updateRawCubeTexture(c, g, r, s, u);
      c.isReady = !0, e == null || e.removePendingData(c), c.onLoadedObservable.notifyObservers(c), c.onLoadedObservable.clear(), h && h();
    }
  };
  return this._loadFile(n, (E) => {
    m(E);
  }, void 0, e == null ? void 0 : e.offlineProvider, !0, p), c;
};
function me(n, e, t, r) {
  let s, i = 1;
  r === 1 ? s = new Float32Array(e * t * 4) : r === 2 ? (s = new Uint16Array(e * t * 4), i = 15360) : r === 7 ? s = new Uint32Array(e * t * 4) : s = new Uint8Array(e * t * 4);
  for (let a = 0; a < e; a++)
    for (let o = 0; o < t; o++) {
      const h = (o * e + a) * 3, l = (o * e + a) * 4;
      s[l + 0] = n[h + 0], s[l + 1] = n[h + 1], s[l + 2] = n[h + 2], s[l + 3] = i;
    }
  return s;
}
function Ae(n) {
  return function(e, t, r, s, i, a, o, h, l = null, _ = 0) {
    const u = n ? this._gl.TEXTURE_3D : this._gl.TEXTURE_2D_ARRAY, f = n ? 10 : 11, c = new k(this, f);
    c.baseWidth = t, c.baseHeight = r, c.baseDepth = s, c.width = t, c.height = r, c.depth = s, c.format = i, c.type = _, c.generateMipMaps = a, c.samplingMode = h, n ? c.is3D = !0 : c.is2DArray = !0, this._doNotHandleContextLost || (c._bufferView = e), n ? this.updateRawTexture3D(c, e, i, o, l, _) : this.updateRawTexture2DArray(c, e, i, o, l, _), this._bindTextureDirectly(u, c, !0);
    const p = this._getSamplingParameters(h, a);
    return this._gl.texParameteri(u, this._gl.TEXTURE_MAG_FILTER, p.mag), this._gl.texParameteri(u, this._gl.TEXTURE_MIN_FILTER, p.min), a && this._gl.generateMipmap(u), this._bindTextureDirectly(u, null), this._internalTexturesCache.push(c), c;
  };
}
S.prototype.createRawTexture2DArray = Ae(!1);
S.prototype.createRawTexture3D = Ae(!0);
function Se(n) {
  return function(e, t, r, s, i = null, a = 0) {
    const o = n ? this._gl.TEXTURE_3D : this._gl.TEXTURE_2D_ARRAY, h = this._getWebGLTextureType(a), l = this._getInternalFormat(r), _ = this._getRGBABufferInternalSizedFormat(a, r);
    this._bindTextureDirectly(o, e, !0), this._unpackFlipY(s === void 0 ? !0 : !!s), this._doNotHandleContextLost || (e._bufferView = t, e.format = r, e.invertY = s, e._compression = i), e.width % 4 !== 0 && this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1), i && t ? this._gl.compressedTexImage3D(o, 0, this.getCaps().s3tc[i], e.width, e.height, e.depth, 0, t) : this._gl.texImage3D(o, 0, _, e.width, e.height, e.depth, 0, l, h, t), e.generateMipMaps && this._gl.generateMipmap(o), this._bindTextureDirectly(o, null), e.isReady = !0;
  };
}
S.prototype.updateRawTexture2DArray = Se(!1);
S.prototype.updateRawTexture3D = Se(!0);
S.prototype._readTexturePixelsSync = function(n, e, t, r = -1, s = 0, i = null, a = !0, o = !1, h = 0, l = 0) {
  var f, c;
  const _ = this._gl;
  if (!_)
    throw new Error("Engine does not have gl rendering context.");
  if (!this._dummyFramebuffer) {
    const p = _.createFramebuffer();
    if (!p)
      throw new Error("Unable to create dummy framebuffer");
    this._dummyFramebuffer = p;
  }
  _.bindFramebuffer(_.FRAMEBUFFER, this._dummyFramebuffer), r > -1 ? _.framebufferTexture2D(_.FRAMEBUFFER, _.COLOR_ATTACHMENT0, _.TEXTURE_CUBE_MAP_POSITIVE_X + r, (f = n._hardwareTexture) == null ? void 0 : f.underlyingResource, s) : _.framebufferTexture2D(_.FRAMEBUFFER, _.COLOR_ATTACHMENT0, _.TEXTURE_2D, (c = n._hardwareTexture) == null ? void 0 : c.underlyingResource, s);
  let u = n.type !== void 0 ? this._getWebGLTextureType(n.type) : _.UNSIGNED_BYTE;
  if (o)
    i || (i = We(n.type, 4 * e * t));
  else
    switch (u) {
      case _.UNSIGNED_BYTE:
        i || (i = new Uint8Array(4 * e * t)), u = _.UNSIGNED_BYTE;
        break;
      default:
        i || (i = new Float32Array(4 * e * t)), u = _.FLOAT;
        break;
    }
  return a && this.flushFramebuffer(), _.readPixels(h, l, e, t, _.RGBA, u, i), _.bindFramebuffer(_.FRAMEBUFFER, this._currentFramebuffer), i;
};
S.prototype._readTexturePixels = function(n, e, t, r = -1, s = 0, i = null, a = !0, o = !1, h = 0, l = 0) {
  return Promise.resolve(this._readTexturePixelsSync(n, e, t, r, s, i, a, o, h, l));
};
S.prototype.updateDynamicIndexBuffer = function(n, e, t = 0) {
  this._currentBoundBuffer[this._gl.ELEMENT_ARRAY_BUFFER] = null, this.bindIndexBuffer(n);
  let r;
  n.is32Bits ? r = e instanceof Uint32Array ? e : new Uint32Array(e) : r = e instanceof Uint16Array ? e : new Uint16Array(e), this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, r, this._gl.DYNAMIC_DRAW), this._resetIndexBufferBinding();
};
S.prototype.updateDynamicVertexBuffer = function(n, e, t, r) {
  this.bindArrayBuffer(n), t === void 0 && (t = 0);
  const s = e.byteLength || e.length;
  r === void 0 || r >= s && t === 0 ? e instanceof Array ? this._gl.bufferSubData(this._gl.ARRAY_BUFFER, t, new Float32Array(e)) : this._gl.bufferSubData(this._gl.ARRAY_BUFFER, t, e) : e instanceof Array ? this._gl.bufferSubData(this._gl.ARRAY_BUFFER, t, new Float32Array(e).subarray(0, r / 4)) : (e instanceof ArrayBuffer ? e = new Uint8Array(e, 0, r) : e = new Uint8Array(e.buffer, e.byteOffset, r), this._gl.bufferSubData(this._gl.ARRAY_BUFFER, t, e)), this._resetVertexBufferBinding();
};
S.prototype._createDepthStencilCubeTexture = function(n, e) {
  const t = new k(
    this,
    12
    /* InternalTextureSource.DepthStencil */
  );
  if (t.isCube = !0, this.webGLVersion === 1)
    return B.Error("Depth cube texture is not supported by WebGL 1."), t;
  const r = {
    bilinearFiltering: !1,
    comparisonFunction: 0,
    generateStencil: !1,
    ...e
  }, s = this._gl;
  this._bindTextureDirectly(s.TEXTURE_CUBE_MAP, t, !0), this._setupDepthStencilTexture(t, n, r.bilinearFiltering, r.comparisonFunction);
  for (let i = 0; i < 6; i++)
    r.generateStencil ? s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, s.DEPTH24_STENCIL8, n, n, 0, s.DEPTH_STENCIL, s.UNSIGNED_INT_24_8, null) : s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, s.DEPTH_COMPONENT24, n, n, 0, s.DEPTH_COMPONENT, s.UNSIGNED_INT, null);
  return this._bindTextureDirectly(s.TEXTURE_CUBE_MAP, null), this._internalTexturesCache.push(t), t;
};
S.prototype._setCubeMapTextureParams = function(n, e, t) {
  const r = this._gl;
  r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MAG_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MIN_FILTER, e ? r.LINEAR_MIPMAP_LINEAR : r.LINEAR), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), n.samplingMode = e ? 3 : 2, e && this.getCaps().textureMaxLevel && t !== void 0 && t > 0 && (r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MAX_LEVEL, t), n._maxLodLevel = t), this._bindTextureDirectly(r.TEXTURE_CUBE_MAP, null);
};
S.prototype.createCubeTexture = function(n, e, t, r, s = null, i = null, a, o = null, h = !1, l = 0, _ = 0, u = null, f, c = !1, p = null) {
  const m = this._gl;
  return this.createCubeTextureBase(n, e, t, !!r, s, i, a, o, h, l, _, u, (E) => this._bindTextureDirectly(m.TEXTURE_CUBE_MAP, E, !0), (E, T) => {
    const g = this.needPOTTextures ? Q(T[0].width, this._caps.maxCubemapTextureSize) : T[0].width, I = g, F = [
      m.TEXTURE_CUBE_MAP_POSITIVE_X,
      m.TEXTURE_CUBE_MAP_POSITIVE_Y,
      m.TEXTURE_CUBE_MAP_POSITIVE_Z,
      m.TEXTURE_CUBE_MAP_NEGATIVE_X,
      m.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      m.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];
    this._bindTextureDirectly(m.TEXTURE_CUBE_MAP, E, !0), this._unpackFlipY(!1);
    const P = a ? this._getInternalFormat(a, E._useSRGBBuffer) : E._useSRGBBuffer ? this._glSRGBExtensionValues.SRGB8_ALPHA8 : m.RGBA;
    let A = a ? this._getInternalFormat(a) : m.RGBA;
    E._useSRGBBuffer && this.webGLVersion === 1 && (A = P);
    for (let C = 0; C < F.length; C++)
      if (T[C].width !== g || T[C].height !== I) {
        if (this._prepareWorkingCanvas(), !this._workingCanvas || !this._workingContext) {
          B.Warn("Cannot create canvas to resize texture.");
          return;
        }
        this._workingCanvas.width = g, this._workingCanvas.height = I, this._workingContext.drawImage(T[C], 0, 0, T[C].width, T[C].height, 0, 0, g, I), m.texImage2D(F[C], 0, P, A, m.UNSIGNED_BYTE, this._workingCanvas);
      } else
        m.texImage2D(F[C], 0, P, A, m.UNSIGNED_BYTE, T[C]);
    r || m.generateMipmap(m.TEXTURE_CUBE_MAP), this._setCubeMapTextureParams(E, !r), E.width = g, E.height = I, E.isReady = !0, a && (E.format = a), E.onLoadedObservable.notifyObservers(E), E.onLoadedObservable.clear(), s && s();
  }, !!c, p);
};
S.prototype.generateMipMapsForCubemap = function(n, e = !0) {
  if (n.generateMipMaps) {
    const t = this._gl;
    this._bindTextureDirectly(t.TEXTURE_CUBE_MAP, n, !0), t.generateMipmap(t.TEXTURE_CUBE_MAP), e && this._bindTextureDirectly(t.TEXTURE_CUBE_MAP, null);
  }
};
class ut {
  /**
   * Gets the depth/stencil texture
   */
  get depthStencilTexture() {
    return this._depthStencilTexture;
  }
  /**
   * Sets the depth/stencil texture
   * @param texture The depth/stencil texture to set
   * @param disposeExisting True to dispose the existing depth/stencil texture (if any) before replacing it (default: true)
   */
  setDepthStencilTexture(e, t = !0) {
    t && this._depthStencilTexture && this._depthStencilTexture.dispose(), this._depthStencilTexture = e, this._generateDepthBuffer = this._generateStencilBuffer = this._depthStencilTextureWithStencil = !1, e && (this._generateDepthBuffer = !0, this._generateStencilBuffer = this._depthStencilTextureWithStencil = J(e.format));
  }
  /**
   * Indicates if the depth/stencil texture has a stencil aspect
   */
  get depthStencilTextureWithStencil() {
    return this._depthStencilTextureWithStencil;
  }
  /**
   * Defines if the render target wrapper is for a cube texture or if false a 2d texture
   */
  get isCube() {
    return this._isCube;
  }
  /**
   * Defines if the render target wrapper is for a single or multi target render wrapper
   */
  get isMulti() {
    return this._isMulti;
  }
  /**
   * Defines if the render target wrapper is for a single or an array of textures
   */
  get is2DArray() {
    return this.layers > 0;
  }
  /**
   * Defines if the render target wrapper is for a 3D texture
   */
  get is3D() {
    return this.depth > 0;
  }
  /**
   * Gets the size of the render target wrapper (used for cubes, as width=height in this case)
   */
  get size() {
    return this.width;
  }
  /**
   * Gets the width of the render target wrapper
   */
  get width() {
    return this._size.width ?? this._size;
  }
  /**
   * Gets the height of the render target wrapper
   */
  get height() {
    return this._size.height ?? this._size;
  }
  /**
   * Gets the number of layers of the render target wrapper (only used if is2DArray is true and wrapper is not a multi render target)
   */
  get layers() {
    return this._size.layers || 0;
  }
  /**
   * Gets the depth of the render target wrapper (only used if is3D is true and wrapper is not a multi render target)
   */
  get depth() {
    return this._size.depth || 0;
  }
  /**
   * Gets the render texture. If this is a multi render target, gets the first texture
   */
  get texture() {
    var e;
    return ((e = this._textures) == null ? void 0 : e[0]) ?? null;
  }
  /**
   * Gets the list of render textures. If we are not in a multi render target, the list will be null (use the texture getter instead)
   */
  get textures() {
    return this._textures;
  }
  /**
   * Gets the face indices that correspond to the list of render textures. If we are not in a multi render target, the list will be null
   */
  get faceIndices() {
    return this._faceIndices;
  }
  /**
   * Gets the layer indices that correspond to the list of render textures. If we are not in a multi render target, the list will be null
   */
  get layerIndices() {
    return this._layerIndices;
  }
  /**
   * Gets the base array layer of a texture in the textures array
   * This is an number that is calculated based on the layer and face indices set for this texture at that index
   * @param index The index of the texture in the textures array to get the base array layer for
   * @returns the base array layer of the texture at the given index
   */
  getBaseArrayLayer(e) {
    var i, a;
    if (!this._textures)
      return -1;
    const t = this._textures[e], r = ((i = this._layerIndices) == null ? void 0 : i[e]) ?? 0, s = ((a = this._faceIndices) == null ? void 0 : a[e]) ?? 0;
    return t.isCube ? r * 6 + s : t.is3D ? 0 : r;
  }
  /**
   * Gets the sample count of the render target
   */
  get samples() {
    return this._samples;
  }
  /**
   * Sets the sample count of the render target
   * @param value sample count
   * @param initializeBuffers If set to true, the engine will make an initializing call to drawBuffers (only used when isMulti=true).
   * @param force true to force calling the update sample count engine function even if the current sample count is equal to value
   * @returns the sample count that has been set
   */
  setSamples(e, t = !0, r = !1) {
    if (this.samples === e && !r)
      return e;
    const s = this._isMulti ? this._engine.updateMultipleRenderTargetTextureSampleCount(this, e, t) : this._engine.updateRenderTargetTextureSampleCount(this, e);
    return this._samples = e, s;
  }
  /**
   * Resolves the MSAA textures into their non-MSAA version.
   * Note that if samples equals 1 (no MSAA), no resolve is performed.
   */
  resolveMSAATextures() {
    this.isMulti ? this._engine.resolveMultiFramebuffer(this) : this._engine.resolveFramebuffer(this);
  }
  /**
   * Generates mipmaps for each texture of the render target
   */
  generateMipMaps() {
    this._engine._currentRenderTarget === this && this._engine.unBindFramebuffer(this, !0), this.isMulti ? this._engine.generateMipMapsMultiFramebuffer(this) : this._engine.generateMipMapsFramebuffer(this);
  }
  /**
   * Initializes the render target wrapper
   * @param isMulti true if the wrapper is a multi render target
   * @param isCube true if the wrapper should render to a cube texture
   * @param size size of the render target (width/height/layers)
   * @param engine engine used to create the render target
   * @param label defines the label to use for the wrapper (for debugging purpose only)
   */
  constructor(e, t, r, s, i) {
    this._textures = null, this._faceIndices = null, this._layerIndices = null, this._samples = 1, this._attachments = null, this._generateStencilBuffer = !1, this._generateDepthBuffer = !1, this._depthStencilTextureWithStencil = !1, this.disableAutomaticMSAAResolve = !1, this.resolveMSAAColors = !0, this.resolveMSAADepth = !1, this.resolveMSAAStencil = !1, this._isMulti = e, this._isCube = t, this._size = r, this._engine = s, this._depthStencilTexture = null, this.label = i;
  }
  /**
   * Sets the render target texture(s)
   * @param textures texture(s) to set
   */
  setTextures(e) {
    Array.isArray(e) ? this._textures = e : e ? this._textures = [e] : this._textures = null;
  }
  /**
   * Set a texture in the textures array
   * @param texture The texture to set
   * @param index The index in the textures array to set
   * @param disposePrevious If this function should dispose the previous texture
   */
  setTexture(e, t = 0, r = !0) {
    this._textures || (this._textures = []), this._textures[t] !== e && (this._textures[t] && r && this._textures[t].dispose(), this._textures[t] = e);
  }
  /**
   * Sets the layer and face indices of every render target texture bound to each color attachment
   * @param layers The layers of each texture to be set
   * @param faces The faces of each texture to be set
   */
  setLayerAndFaceIndices(e, t) {
    this._layerIndices = e, this._faceIndices = t;
  }
  /**
   * Sets the layer and face indices of a texture in the textures array that should be bound to each color attachment
   * @param index The index of the texture in the textures array to modify
   * @param layer The layer of the texture to be set
   * @param face The face of the texture to be set
   */
  setLayerAndFaceIndex(e = 0, t, r) {
    this._layerIndices || (this._layerIndices = []), this._faceIndices || (this._faceIndices = []), t !== void 0 && t >= 0 && (this._layerIndices[e] = t), r !== void 0 && r >= 0 && (this._faceIndices[e] = r);
  }
  /**
   * Creates the depth/stencil texture
   * @param comparisonFunction Comparison function to use for the texture
   * @param bilinearFiltering true if bilinear filtering should be used when sampling the texture
   * @param generateStencil Not used anymore. "format" will be used to determine if stencil should be created
   * @param samples sample count to use when creating the texture (default: 1)
   * @param format format of the depth texture (default: 14)
   * @param label defines the label to use for the texture (for debugging purpose only)
   * @returns the depth/stencil created texture
   */
  createDepthStencilTexture(e = 0, t = !0, r = !1, s = 1, i = 14, a) {
    var o;
    return (o = this._depthStencilTexture) == null || o.dispose(), this._depthStencilTextureWithStencil = r, this._depthStencilTextureLabel = a, this._depthStencilTexture = this._engine.createDepthStencilTexture(this._size, {
      bilinearFiltering: t,
      comparisonFunction: e,
      generateStencil: r,
      isCube: this._isCube,
      samples: s,
      depthTextureFormat: i,
      label: a
    }, this), this._depthStencilTexture;
  }
  /**
   * @deprecated Use shareDepth instead
   * @param renderTarget Destination renderTarget
   */
  _shareDepth(e) {
    this.shareDepth(e);
  }
  /**
   * Shares the depth buffer of this render target with another render target.
   * @param renderTarget Destination renderTarget
   */
  shareDepth(e) {
    this._depthStencilTexture && (e._depthStencilTexture && e._depthStencilTexture.dispose(), e._depthStencilTexture = this._depthStencilTexture, e._depthStencilTextureWithStencil = this._depthStencilTextureWithStencil, this._depthStencilTexture.incrementReferences());
  }
  /**
   * @internal
   */
  _swapAndDie(e) {
    this.texture && this.texture._swapAndDie(e), this._textures = null, this.dispose(!0);
  }
  _cloneRenderTargetWrapper() {
    var t, r, s, i, a;
    let e = null;
    if (this._isMulti) {
      const o = this.textures;
      if (o && o.length > 0) {
        let h = !1, l = o.length, _ = -1;
        const u = o[o.length - 1]._source;
        (u === 14 || u === 12) && (h = !0, _ = o[o.length - 1].format, l--);
        const f = [], c = [], p = [], m = [], E = [], T = [], g = [], I = {};
        for (let A = 0; A < l; ++A) {
          const C = o[A];
          f.push(C.samplingMode), c.push(C.type), p.push(C.format), I[C.uniqueId] !== void 0 ? (m.push(-1), g.push(0)) : (I[C.uniqueId] = A, C.is2DArray ? (m.push(35866), g.push(C.depth)) : C.isCube ? (m.push(34067), g.push(0)) : C.is3D ? (m.push(32879), g.push(C.depth)) : (m.push(3553), g.push(0))), this._faceIndices && E.push(this._faceIndices[A] ?? 0), this._layerIndices && T.push(this._layerIndices[A] ?? 0);
        }
        const F = {
          samplingModes: f,
          generateMipMaps: o[0].generateMipMaps,
          generateDepthBuffer: this._generateDepthBuffer,
          generateStencilBuffer: this._generateStencilBuffer,
          generateDepthTexture: h,
          depthTextureFormat: _,
          types: c,
          formats: p,
          textureCount: l,
          targetTypes: m,
          faceIndex: E,
          layerIndex: T,
          layerCounts: g,
          label: this.label
        }, P = {
          width: this.width,
          height: this.height,
          depth: this.depth
        };
        e = this._engine.createMultipleRenderTarget(P, F);
        for (let A = 0; A < l; ++A) {
          if (m[A] !== -1)
            continue;
          const C = I[o[A].uniqueId];
          e.setTexture(e.textures[C], A);
        }
      }
    } else {
      const o = {};
      if (o.generateDepthBuffer = this._generateDepthBuffer, o.generateMipMaps = ((t = this.texture) == null ? void 0 : t.generateMipMaps) ?? !1, o.generateStencilBuffer = this._generateStencilBuffer, o.samplingMode = (r = this.texture) == null ? void 0 : r.samplingMode, o.type = (s = this.texture) == null ? void 0 : s.type, o.format = (i = this.texture) == null ? void 0 : i.format, o.noColorAttachment = !this._textures, o.label = this.label, this.isCube)
        e = this._engine.createRenderTargetCubeTexture(this.width, o);
      else {
        const h = {
          width: this.width,
          height: this.height,
          layers: this.is2DArray || this.is3D ? (a = this.texture) == null ? void 0 : a.depth : void 0
        };
        e = this._engine.createRenderTargetTexture(h, o);
      }
      e.texture && (e.texture.isReady = !0);
    }
    return e;
  }
  _swapRenderTargetWrapper(e) {
    if (this._textures && e._textures)
      for (let t = 0; t < this._textures.length; ++t)
        this._textures[t]._swapAndDie(e._textures[t], !1), e._textures[t].isReady = !0;
    this._depthStencilTexture && e._depthStencilTexture && (this._depthStencilTexture._swapAndDie(e._depthStencilTexture), e._depthStencilTexture.isReady = !0), this._textures = null, this._depthStencilTexture = null;
  }
  /** @internal */
  _rebuild() {
    const e = this._cloneRenderTargetWrapper();
    if (e) {
      if (this._depthStencilTexture) {
        const t = this._depthStencilTexture.samplingMode, r = this._depthStencilTexture.format, s = t === 2 || t === 3 || t === 11;
        e.createDepthStencilTexture(this._depthStencilTexture._comparisonFunction, s, this._depthStencilTextureWithStencil, this._depthStencilTexture.samples, r, this._depthStencilTextureLabel);
      }
      this.samples > 1 && e.setSamples(this.samples), e._swapRenderTargetWrapper(this), e.dispose();
    }
  }
  /**
   * Releases the internal render textures
   */
  releaseTextures() {
    if (this._textures)
      for (let e = 0; e < this._textures.length; ++e)
        this._textures[e].dispose();
    this._textures = null;
  }
  /**
   * Disposes the whole render target wrapper
   * @param disposeOnlyFramebuffers true if only the frame buffers should be released (used for the WebGL engine). If false, all the textures will also be released
   */
  dispose(e = !1) {
    var t;
    e || ((t = this._depthStencilTexture) == null || t.dispose(), this._depthStencilTexture = null, this.releaseTextures()), this._engine._releaseRenderTargetWrapper(this);
  }
}
class ct extends ut {
  setDepthStencilTexture(e, t = !0) {
    if (super.setDepthStencilTexture(e, t), !e)
      return;
    const r = this._engine, s = this._context, i = e._hardwareTexture;
    if (i && e._autoMSAAManagement && this._MSAAFramebuffer) {
      const a = r._currentFramebuffer;
      r._bindUnboundFramebuffer(this._MSAAFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, J(e.format) ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, s.RENDERBUFFER, i.getMSAARenderBuffer()), r._bindUnboundFramebuffer(a);
    }
  }
  constructor(e, t, r, s, i) {
    super(e, t, r, s), this._framebuffer = null, this._depthStencilBuffer = null, this._MSAAFramebuffer = null, this._colorTextureArray = null, this._depthStencilTextureArray = null, this._disposeOnlyFramebuffers = !1, this._currentLOD = 0, this._context = i;
  }
  _cloneRenderTargetWrapper() {
    let e = null;
    return this._colorTextureArray && this._depthStencilTextureArray ? (e = this._engine.createMultiviewRenderTargetTexture(this.width, this.height), e.texture.isReady = !0) : e = super._cloneRenderTargetWrapper(), e;
  }
  _swapRenderTargetWrapper(e) {
    super._swapRenderTargetWrapper(e), e._framebuffer = this._framebuffer, e._depthStencilBuffer = this._depthStencilBuffer, e._MSAAFramebuffer = this._MSAAFramebuffer, e._colorTextureArray = this._colorTextureArray, e._depthStencilTextureArray = this._depthStencilTextureArray, this._framebuffer = this._depthStencilBuffer = this._MSAAFramebuffer = this._colorTextureArray = this._depthStencilTextureArray = null;
  }
  /**
   * Creates the depth/stencil texture
   * @param comparisonFunction Comparison function to use for the texture
   * @param bilinearFiltering true if bilinear filtering should be used when sampling the texture
   * @param generateStencil true if the stencil aspect should also be created
   * @param samples sample count to use when creating the texture
   * @param format format of the depth texture
   * @param label defines the label to use for the texture (for debugging purpose only)
   * @returns the depth/stencil created texture
   */
  createDepthStencilTexture(e = 0, t = !0, r = !1, s = 1, i = 14, a) {
    if (this._depthStencilBuffer) {
      const o = this._engine, h = o._currentFramebuffer, l = this._context;
      o._bindUnboundFramebuffer(this._framebuffer), l.framebufferRenderbuffer(l.FRAMEBUFFER, l.DEPTH_STENCIL_ATTACHMENT, l.RENDERBUFFER, null), l.framebufferRenderbuffer(l.FRAMEBUFFER, l.DEPTH_ATTACHMENT, l.RENDERBUFFER, null), l.framebufferRenderbuffer(l.FRAMEBUFFER, l.STENCIL_ATTACHMENT, l.RENDERBUFFER, null), o._bindUnboundFramebuffer(h), l.deleteRenderbuffer(this._depthStencilBuffer), this._depthStencilBuffer = null;
    }
    return super.createDepthStencilTexture(e, t, r, s, i, a);
  }
  /**
   * Shares the depth buffer of this render target with another render target.
   * @param renderTarget Destination renderTarget
   */
  shareDepth(e) {
    super.shareDepth(e);
    const t = this._context, r = this._depthStencilBuffer, s = e._MSAAFramebuffer || e._framebuffer, i = this._engine;
    e._depthStencilBuffer && e._depthStencilBuffer !== r && t.deleteRenderbuffer(e._depthStencilBuffer), e._depthStencilBuffer = r;
    const a = e._generateStencilBuffer ? t.DEPTH_STENCIL_ATTACHMENT : t.DEPTH_ATTACHMENT;
    i._bindUnboundFramebuffer(s), t.framebufferRenderbuffer(t.FRAMEBUFFER, a, t.RENDERBUFFER, r), i._bindUnboundFramebuffer(null);
  }
  /**
   * Binds a texture to this render target on a specific attachment
   * @param texture The texture to bind to the framebuffer
   * @param attachmentIndex Index of the attachment
   * @param faceIndexOrLayer The face or layer of the texture to render to in case of cube texture or array texture
   * @param lodLevel defines the lod level to bind to the frame buffer
   */
  _bindTextureRenderTarget(e, t = 0, r, s = 0) {
    var _, u;
    const i = e._hardwareTexture;
    if (!i)
      return;
    const a = this._framebuffer, o = this._engine, h = o._currentFramebuffer;
    o._bindUnboundFramebuffer(a);
    let l;
    if (o.webGLVersion > 1) {
      const f = this._context;
      l = f["COLOR_ATTACHMENT" + t], e.is2DArray || e.is3D ? (r = r ?? ((_ = this.layerIndices) == null ? void 0 : _[t]) ?? 0, f.framebufferTextureLayer(f.FRAMEBUFFER, l, i.underlyingResource, s, r)) : e.isCube ? (r = r ?? ((u = this.faceIndices) == null ? void 0 : u[t]) ?? 0, f.framebufferTexture2D(f.FRAMEBUFFER, l, f.TEXTURE_CUBE_MAP_POSITIVE_X + r, i.underlyingResource, s)) : f.framebufferTexture2D(f.FRAMEBUFFER, l, f.TEXTURE_2D, i.underlyingResource, s);
    } else {
      const f = this._context;
      l = f["COLOR_ATTACHMENT" + t + "_WEBGL"];
      const c = r !== void 0 ? f.TEXTURE_CUBE_MAP_POSITIVE_X + r : f.TEXTURE_2D;
      f.framebufferTexture2D(f.FRAMEBUFFER, l, c, i.underlyingResource, s);
    }
    if (e._autoMSAAManagement && this._MSAAFramebuffer) {
      const f = this._context;
      o._bindUnboundFramebuffer(this._MSAAFramebuffer), f.framebufferRenderbuffer(f.FRAMEBUFFER, l, f.RENDERBUFFER, i.getMSAARenderBuffer());
    }
    o._bindUnboundFramebuffer(h);
  }
  /**
   * Set a texture in the textures array
   * @param texture the texture to set
   * @param index the index in the textures array to set
   * @param disposePrevious If this function should dispose the previous texture
   */
  setTexture(e, t = 0, r = !0) {
    super.setTexture(e, t, r), this._bindTextureRenderTarget(e, t);
  }
  /**
   * Sets the layer and face indices of every render target texture
   * @param layers The layer of the texture to be set (make negative to not modify)
   * @param faces The face of the texture to be set (make negative to not modify)
   */
  setLayerAndFaceIndices(e, t) {
    var s;
    if (super.setLayerAndFaceIndices(e, t), !this.textures || !this.layerIndices || !this.faceIndices)
      return;
    const r = ((s = this._attachments) == null ? void 0 : s.length) ?? this.textures.length;
    for (let i = 0; i < r; i++) {
      const a = this.textures[i];
      a && (a.is2DArray || a.is3D ? this._bindTextureRenderTarget(a, i, this.layerIndices[i]) : a.isCube ? this._bindTextureRenderTarget(a, i, this.faceIndices[i]) : this._bindTextureRenderTarget(a, i));
    }
  }
  /**
   * Set the face and layer indices of a texture in the textures array
   * @param index The index of the texture in the textures array to modify
   * @param layer The layer of the texture to be set
   * @param face The face of the texture to be set
   */
  setLayerAndFaceIndex(e = 0, t, r) {
    if (super.setLayerAndFaceIndex(e, t, r), !this.textures || !this.layerIndices || !this.faceIndices)
      return;
    const s = this.textures[e];
    s.is2DArray || s.is3D ? this._bindTextureRenderTarget(this.textures[e], e, this.layerIndices[e]) : s.isCube && this._bindTextureRenderTarget(this.textures[e], e, this.faceIndices[e]);
  }
  resolveMSAATextures() {
    const e = this._engine, t = e._currentFramebuffer;
    e._bindUnboundFramebuffer(this._MSAAFramebuffer), super.resolveMSAATextures(), e._bindUnboundFramebuffer(t);
  }
  dispose(e = this._disposeOnlyFramebuffers) {
    const t = this._context;
    e || (this._colorTextureArray && (this._context.deleteTexture(this._colorTextureArray), this._colorTextureArray = null), this._depthStencilTextureArray && (this._context.deleteTexture(this._depthStencilTextureArray), this._depthStencilTextureArray = null)), this._framebuffer && (t.deleteFramebuffer(this._framebuffer), this._framebuffer = null), this._depthStencilBuffer && (t.deleteRenderbuffer(this._depthStencilBuffer), this._depthStencilBuffer = null), this._MSAAFramebuffer && (t.deleteFramebuffer(this._MSAAFramebuffer), this._MSAAFramebuffer = null), super.dispose(e);
  }
}
b.prototype.createDepthStencilTexture = function(n, e, t) {
  if (e.isCube) {
    const r = n.width || n;
    return this._createDepthStencilCubeTexture(r, e);
  } else
    return this._createDepthStencilTexture(n, e, t);
};
S.prototype._createHardwareRenderTargetWrapper = function(n, e, t) {
  const r = new ct(n, e, t, this, this._gl);
  return this._renderTargetWrapperCache.push(r), r;
};
S.prototype.createRenderTargetTexture = function(n, e) {
  const t = this._createHardwareRenderTargetWrapper(!1, !1, n);
  let r = !0, s = !1, i = !1, a, o = 1, h;
  e !== void 0 && typeof e == "object" && (r = e.generateDepthBuffer ?? !0, s = !!e.generateStencilBuffer, i = !!e.noColorAttachment, a = e.colorAttachment, o = e.samples ?? 1, h = e.label);
  const l = a || (i ? null : this._createInternalTexture(
    n,
    e,
    !0,
    5
    /* InternalTextureSource.RenderTarget */
  )), _ = n.width || n, u = n.height || n, f = this._currentFramebuffer, c = this._gl, p = c.createFramebuffer();
  if (this._bindUnboundFramebuffer(p), t._depthStencilBuffer = this._setupFramebufferDepthAttachments(s, r, _, u), l && !l.is2DArray && !l.is3D && c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, l._hardwareTexture.underlyingResource, 0), this._bindUnboundFramebuffer(f), t.label = h ?? "RenderTargetWrapper", t._framebuffer = p, t._generateDepthBuffer = r, t._generateStencilBuffer = s, t.setTextures(l), !a)
    this.updateRenderTargetTextureSampleCount(t, o);
  else if (t._samples = a.samples, a.samples > 1) {
    const m = a._hardwareTexture.getMSAARenderBuffer(0);
    t._MSAAFramebuffer = c.createFramebuffer(), this._bindUnboundFramebuffer(t._MSAAFramebuffer), c.framebufferRenderbuffer(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.RENDERBUFFER, m), this._bindUnboundFramebuffer(null);
  }
  return t;
};
S.prototype._createDepthStencilTexture = function(n, e, t) {
  const r = this._gl, s = n.layers || 0, i = n.depth || 0;
  let a = r.TEXTURE_2D;
  s !== 0 ? a = r.TEXTURE_2D_ARRAY : i !== 0 && (a = r.TEXTURE_3D);
  const o = new k(
    this,
    12
    /* InternalTextureSource.DepthStencil */
  );
  if (o.label = e.label, !this._caps.depthTextureExtension)
    return B.Error("Depth texture is not supported by your browser or hardware."), o;
  const h = {
    bilinearFiltering: !1,
    comparisonFunction: 0,
    generateStencil: !1,
    ...e
  };
  if (this._bindTextureDirectly(a, o, !0), this._setupDepthStencilTexture(o, n, h.comparisonFunction === 0 ? !1 : h.bilinearFiltering, h.comparisonFunction, h.samples), h.depthTextureFormat !== void 0) {
    if (h.depthTextureFormat !== 15 && h.depthTextureFormat !== 16 && h.depthTextureFormat !== 17 && h.depthTextureFormat !== 13 && h.depthTextureFormat !== 14 && h.depthTextureFormat !== 18)
      return B.Error(`Depth texture ${h.depthTextureFormat} format is not supported.`), o;
    o.format = h.depthTextureFormat;
  } else
    o.format = h.generateStencil ? 13 : 16;
  const l = J(o.format), _ = this._getWebGLTextureTypeFromDepthTextureFormat(o.format), u = l ? r.DEPTH_STENCIL : r.DEPTH_COMPONENT, f = this._getInternalFormatFromDepthTextureFormat(o.format, !0, l);
  return o.is2DArray ? r.texImage3D(a, 0, f, o.width, o.height, s, 0, u, _, null) : o.is3D ? r.texImage3D(a, 0, f, o.width, o.height, i, 0, u, _, null) : r.texImage2D(a, 0, f, o.width, o.height, 0, u, _, null), this._bindTextureDirectly(a, null), this._internalTexturesCache.push(o), t._depthStencilBuffer && (r.deleteRenderbuffer(t._depthStencilBuffer), t._depthStencilBuffer = null), this._bindUnboundFramebuffer(t._MSAAFramebuffer ?? t._framebuffer), t._generateStencilBuffer = l, t._depthStencilTextureWithStencil = l, t._depthStencilBuffer = this._setupFramebufferDepthAttachments(t._generateStencilBuffer, t._generateDepthBuffer, t.width, t.height, t.samples, o.format), this._bindUnboundFramebuffer(null), o;
};
S.prototype.updateRenderTargetTextureSampleCount = function(n, e) {
  var i;
  if (this.webGLVersion < 2 || !n)
    return 1;
  if (n.samples === e)
    return e;
  const t = this._gl;
  e = Math.min(e, this.getCaps().maxMSAASamples), n._depthStencilBuffer && (t.deleteRenderbuffer(n._depthStencilBuffer), n._depthStencilBuffer = null), n._MSAAFramebuffer && (t.deleteFramebuffer(n._MSAAFramebuffer), n._MSAAFramebuffer = null);
  const r = (i = n.texture) == null ? void 0 : i._hardwareTexture;
  if (r == null || r.releaseMSAARenderBuffers(), n.texture && e > 1 && typeof t.renderbufferStorageMultisample == "function") {
    const a = t.createFramebuffer();
    if (!a)
      throw new Error("Unable to create multi sampled framebuffer");
    n._MSAAFramebuffer = a, this._bindUnboundFramebuffer(n._MSAAFramebuffer);
    const o = this._createRenderBuffer(n.texture.width, n.texture.height, e, -1, this._getRGBABufferInternalSizedFormat(n.texture.type, n.texture.format, n.texture._useSRGBBuffer), t.COLOR_ATTACHMENT0, !1);
    if (!o)
      throw new Error("Unable to create multi sampled framebuffer");
    r == null || r.addMSAARenderBuffer(o);
  }
  this._bindUnboundFramebuffer(n._MSAAFramebuffer ?? n._framebuffer), n.texture && (n.texture.samples = e), n._samples = e;
  const s = n._depthStencilTexture ? n._depthStencilTexture.format : void 0;
  return n._depthStencilBuffer = this._setupFramebufferDepthAttachments(n._generateStencilBuffer, n._generateDepthBuffer, n.width, n.height, e, s), this._bindUnboundFramebuffer(null), e;
};
S.prototype._setupDepthStencilTexture = function(n, e, t, r, s = 1) {
  const i = e.width ?? e, a = e.height ?? e, o = e.layers || 0, h = e.depth || 0;
  n.baseWidth = i, n.baseHeight = a, n.width = i, n.height = a, n.is2DArray = o > 0, n.depth = o || h, n.isReady = !0, n.samples = s, n.generateMipMaps = !1, n.samplingMode = t ? 2 : 1, n.type = 0, n._comparisonFunction = r;
  const l = this._gl, _ = this._getTextureTarget(n), u = this._getSamplingParameters(n.samplingMode, !1);
  l.texParameteri(_, l.TEXTURE_MAG_FILTER, u.mag), l.texParameteri(_, l.TEXTURE_MIN_FILTER, u.min), l.texParameteri(_, l.TEXTURE_WRAP_S, l.CLAMP_TO_EDGE), l.texParameteri(_, l.TEXTURE_WRAP_T, l.CLAMP_TO_EDGE), this.webGLVersion > 1 && (r === 0 ? (l.texParameteri(_, l.TEXTURE_COMPARE_FUNC, 515), l.texParameteri(_, l.TEXTURE_COMPARE_MODE, l.NONE)) : (l.texParameteri(_, l.TEXTURE_COMPARE_FUNC, r), l.texParameteri(_, l.TEXTURE_COMPARE_MODE, l.COMPARE_REF_TO_TEXTURE)));
};
S.prototype.setDepthStencilTexture = function(n, e, t, r) {
  n !== void 0 && (e && (this._boundUniforms[n] = e), !t || !t.depthStencilTexture ? this._setTexture(n, null, void 0, void 0, r) : this._setTexture(n, t, !1, !0, r));
};
S.prototype.createRenderTargetCubeTexture = function(n, e) {
  const t = this._createHardwareRenderTargetWrapper(!1, !0, n), r = {
    generateMipMaps: !0,
    generateDepthBuffer: !0,
    generateStencilBuffer: !1,
    type: 0,
    samplingMode: 3,
    format: 5,
    ...e
  };
  r.generateStencilBuffer = r.generateDepthBuffer && r.generateStencilBuffer, (r.type === 1 && !this._caps.textureFloatLinearFiltering || r.type === 2 && !this._caps.textureHalfFloatLinearFiltering) && (r.samplingMode = 1);
  const s = this._gl, i = new k(
    this,
    5
    /* InternalTextureSource.RenderTarget */
  );
  this._bindTextureDirectly(s.TEXTURE_CUBE_MAP, i, !0);
  const a = this._getSamplingParameters(r.samplingMode, r.generateMipMaps);
  r.type === 1 && !this._caps.textureFloat && (r.type = 0, B.Warn("Float textures are not supported. Cube render target forced to TEXTURETYPE_UNESIGNED_BYTE type")), s.texParameteri(s.TEXTURE_CUBE_MAP, s.TEXTURE_MAG_FILTER, a.mag), s.texParameteri(s.TEXTURE_CUBE_MAP, s.TEXTURE_MIN_FILTER, a.min), s.texParameteri(s.TEXTURE_CUBE_MAP, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_CUBE_MAP, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE);
  for (let h = 0; h < 6; h++)
    s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + h, 0, this._getRGBABufferInternalSizedFormat(r.type, r.format), n, n, 0, this._getInternalFormat(r.format), this._getWebGLTextureType(r.type), null);
  const o = s.createFramebuffer();
  return this._bindUnboundFramebuffer(o), t._depthStencilBuffer = this._setupFramebufferDepthAttachments(r.generateStencilBuffer, r.generateDepthBuffer, n, n), r.generateMipMaps && s.generateMipmap(s.TEXTURE_CUBE_MAP), this._bindTextureDirectly(s.TEXTURE_CUBE_MAP, null), this._bindUnboundFramebuffer(null), t._framebuffer = o, t._generateDepthBuffer = r.generateDepthBuffer, t._generateStencilBuffer = r.generateStencilBuffer, i.width = n, i.height = n, i.isReady = !0, i.isCube = !0, i.samples = 1, i.generateMipMaps = r.generateMipMaps, i.samplingMode = r.samplingMode, i.type = r.type, i.format = r.format, this._internalTexturesCache.push(i), t.setTextures(i), t;
};
var Ee;
(function(n) {
  n[n.CW = 0] = "CW", n[n.CCW = 1] = "CCW";
})(Ee || (Ee = {}));
class V {
  /**
   * Creates an Angle object of "radians" radians (float).
   * @param radians the angle in radians
   */
  constructor(e) {
    this._radians = e, this._radians < 0 && (this._radians += 2 * Math.PI);
  }
  /**
   * Get value in degrees
   * @returns the Angle value in degrees (float)
   */
  degrees() {
    return this._radians * 180 / Math.PI;
  }
  /**
   * Get value in radians
   * @returns the Angle value in radians (float)
   */
  radians() {
    return this._radians;
  }
  /**
   * Gets a new Angle object with a value of the angle (in radians) between the line connecting the two points and the x-axis
   * @param a defines first point as the origin
   * @param b defines point
   * @returns a new Angle
   */
  static BetweenTwoPoints(e, t) {
    const r = t.subtract(e), s = Math.atan2(r.y, r.x);
    return new V(s);
  }
  /**
   * Gets the angle between the two vectors
   * @param a defines first vector
   * @param b defines vector
   * @returns Returns an new Angle between 0 and PI
   */
  static BetweenTwoVectors(e, t) {
    let r = e.lengthSquared() * t.lengthSquared();
    if (r === 0)
      return new V(Math.PI / 2);
    r = Math.sqrt(r);
    let s = e.dot(t) / r;
    s = He(s, -1, 1);
    const i = Math.acos(s);
    return new V(i);
  }
  /**
   * Gets a new Angle object from the given float in radians
   * @param radians defines the angle value in radians
   * @returns a new Angle
   */
  static FromRadians(e) {
    return new V(e);
  }
  /**
   * Gets a new Angle object from the given float in degrees
   * @param degrees defines the angle value in degrees
   * @returns a new Angle
   */
  static FromDegrees(e) {
    return new V(e * Math.PI / 180);
  }
}
class ft {
  /**
   * Creates an Arc object from the three given points : start, middle and end.
   * @param startPoint Defines the start point of the arc
   * @param midPoint Defines the middle point of the arc
   * @param endPoint Defines the end point of the arc
   */
  constructor(e, t, r) {
    this.startPoint = e, this.midPoint = t, this.endPoint = r;
    const s = Math.pow(t.x, 2) + Math.pow(t.y, 2), i = (Math.pow(e.x, 2) + Math.pow(e.y, 2) - s) / 2, a = (s - Math.pow(r.x, 2) - Math.pow(r.y, 2)) / 2, o = (e.x - t.x) * (t.y - r.y) - (t.x - r.x) * (e.y - t.y);
    this.centerPoint = new X((i * (t.y - r.y) - a * (e.y - t.y)) / o, ((e.x - t.x) * a - (t.x - r.x) * i) / o), this.radius = this.centerPoint.subtract(this.startPoint).length(), this.startAngle = V.BetweenTwoPoints(this.centerPoint, this.startPoint);
    const h = this.startAngle.degrees();
    let l = V.BetweenTwoPoints(this.centerPoint, this.midPoint).degrees(), _ = V.BetweenTwoPoints(this.centerPoint, this.endPoint).degrees();
    l - h > 180 && (l -= 360), l - h < -180 && (l += 360), _ - l > 180 && (_ -= 360), _ - l < -180 && (_ += 360), this.orientation = l - h < 0 ? 0 : 1, this.angle = V.FromDegrees(this.orientation === 0 ? h - _ : _ - h);
  }
}
class xe {
  /**
   * Creates a Path2 object from the starting 2D coordinates x and y.
   * @param x the starting points x value
   * @param y the starting points y value
   */
  constructor(e, t) {
    this._points = new Array(), this._length = 0, this.closed = !1, this._points.push(new X(e, t));
  }
  /**
   * Adds a new segment until the given coordinates (x, y) to the current Path2.
   * @param x the added points x value
   * @param y the added points y value
   * @returns the updated Path2.
   */
  addLineTo(e, t) {
    if (this.closed)
      return this;
    const r = new X(e, t), s = this._points[this._points.length - 1];
    return this._points.push(r), this._length += r.subtract(s).length(), this;
  }
  /**
   * Adds _numberOfSegments_ segments according to the arc definition (middle point coordinates, end point coordinates, the arc start point being the current Path2 last point) to the current Path2.
   * @param midX middle point x value
   * @param midY middle point y value
   * @param endX end point x value
   * @param endY end point y value
   * @param numberOfSegments (default: 36)
   * @returns the updated Path2.
   */
  addArcTo(e, t, r, s, i = 36) {
    if (this.closed)
      return this;
    const a = this._points[this._points.length - 1], o = new X(e, t), h = new X(r, s), l = new ft(a, o, h);
    let _ = l.angle.radians() / i;
    l.orientation === 0 && (_ *= -1);
    let u = l.startAngle.radians() + _;
    for (let f = 0; f < i; f++) {
      const c = Math.cos(u) * l.radius + l.centerPoint.x, p = Math.sin(u) * l.radius + l.centerPoint.y;
      this.addLineTo(c, p), u += _;
    }
    return this;
  }
  /**
   * Adds _numberOfSegments_ segments according to the quadratic curve definition to the current Path2.
   * @param controlX control point x value
   * @param controlY control point y value
   * @param endX end point x value
   * @param endY end point y value
   * @param numberOfSegments (default: 36)
   * @returns the updated Path2.
   */
  addQuadraticCurveTo(e, t, r, s, i = 36) {
    if (this.closed)
      return this;
    const a = (h, l, _, u) => (1 - h) * (1 - h) * l + 2 * h * (1 - h) * _ + h * h * u, o = this._points[this._points.length - 1];
    for (let h = 0; h <= i; h++) {
      const l = h / i, _ = a(l, o.x, e, r), u = a(l, o.y, t, s);
      this.addLineTo(_, u);
    }
    return this;
  }
  /**
   * Adds _numberOfSegments_ segments according to the bezier curve definition to the current Path2.
   * @param originTangentX tangent vector at the origin point x value
   * @param originTangentY tangent vector at the origin point y value
   * @param destinationTangentX tangent vector at the destination point x value
   * @param destinationTangentY tangent vector at the destination point y value
   * @param endX end point x value
   * @param endY end point y value
   * @param numberOfSegments (default: 36)
   * @returns the updated Path2.
   */
  addBezierCurveTo(e, t, r, s, i, a, o = 36) {
    if (this.closed)
      return this;
    const h = (_, u, f, c, p) => (1 - _) * (1 - _) * (1 - _) * u + 3 * _ * (1 - _) * (1 - _) * f + 3 * _ * _ * (1 - _) * c + _ * _ * _ * p, l = this._points[this._points.length - 1];
    for (let _ = 0; _ <= o; _++) {
      const u = _ / o, f = h(u, l.x, e, r, i), c = h(u, l.y, t, s, a);
      this.addLineTo(f, c);
    }
    return this;
  }
  /**
   * Defines if a given point is inside the polygon defines by the path
   * @param point defines the point to test
   * @returns true if the point is inside
   */
  isPointInside(e) {
    let t = !1;
    const r = this._points.length;
    for (let s = r - 1, i = 0; i < r; s = i++) {
      let a = this._points[s], o = this._points[i], h = o.x - a.x, l = o.y - a.y;
      if (Math.abs(l) > Number.EPSILON) {
        if (l < 0 && (a = this._points[i], h = -h, o = this._points[s], l = -l), e.y < a.y || e.y > o.y)
          continue;
        if (e.y === a.y && e.x === a.x)
          return !0;
        {
          const _ = l * (e.x - a.x) - h * (e.y - a.y);
          if (_ === 0)
            return !0;
          if (_ < 0)
            continue;
          t = !t;
        }
      } else {
        if (e.y !== a.y)
          continue;
        if (o.x <= e.x && e.x <= a.x || a.x <= e.x && e.x <= o.x)
          return !0;
      }
    }
    return t;
  }
  /**
   * Closes the Path2.
   * @returns the Path2.
   */
  close() {
    return this.closed = !0, this;
  }
  /**
   * Gets the sum of the distance between each sequential point in the path
   * @returns the Path2 total length (float).
   */
  length() {
    let e = this._length;
    if (this.closed) {
      const t = this._points[this._points.length - 1], r = this._points[0];
      e += r.subtract(t).length();
    }
    return e;
  }
  /**
   * Gets the area of the polygon defined by the path
   * @returns area value
   */
  area() {
    const e = this._points.length;
    let t = 0;
    for (let r = e - 1, s = 0; s < e; r = s++)
      t += this._points[r].x * this._points[s].y - this._points[s].x * this._points[r].y;
    return t * 0.5;
  }
  /**
   * Gets the points which construct the path
   * @returns the Path2 internal array of points.
   */
  getPoints() {
    return this._points;
  }
  /**
   * Retrieves the point at the distance aways from the starting point
   * @param normalizedLengthPosition the length along the path to retrieve the point from
   * @returns a new Vector2 located at a percentage of the Path2 total length on this path.
   */
  getPointAtLengthPosition(e) {
    if (e < 0 || e > 1)
      return X.Zero();
    const t = e * this.length();
    let r = 0;
    for (let s = 0; s < this._points.length; s++) {
      const i = (s + 1) % this._points.length, a = this._points[s], h = this._points[i].subtract(a), l = h.length() + r;
      if (t >= r && t <= l) {
        const _ = h.normalize(), u = t - r;
        return new X(a.x + _.x * u, a.y + _.y * u);
      }
      r = l;
    }
    return X.Zero();
  }
  /**
   * Creates a new path starting from an x and y position
   * @param x starting x value
   * @param y starting y value
   * @returns a new Path2 starting at the coordinates (x, y).
   */
  static StartingAt(e, t) {
    return new xe(e, t);
  }
}
class Pe {
  /**
   * new Path3D(path, normal, raw)
   * Creates a Path3D. A Path3D is a logical math object, so not a mesh.
   * please read the description in the tutorial : https://doc.babylonjs.com/features/featuresDeepDive/mesh/path3D
   * @param path an array of Vector3, the curve axis of the Path3D
   * @param firstNormal (options) Vector3, the first wanted normal to the curve. Ex (0, 1, 0) for a vertical normal.
   * @param raw (optional, default false) : boolean, if true the returned Path3D isn't normalized. Useful to depict path acceleration or speed.
   * @param alignTangentsWithPath (optional, default false) : boolean, if true the tangents will be aligned with the path.
   */
  constructor(e, t = null, r, s = !1) {
    this.path = e, this._curve = new Array(), this._distances = new Array(), this._tangents = new Array(), this._normals = new Array(), this._binormals = new Array(), this._pointAtData = {
      id: 0,
      point: R.Zero(),
      previousPointArrayIndex: 0,
      position: 0,
      subPosition: 0,
      interpolateReady: !1,
      interpolationMatrix: ue.Identity()
    };
    for (let i = 0; i < e.length; i++)
      this._curve[i] = e[i].clone();
    this._raw = r || !1, this._alignTangentsWithPath = s, this._compute(t, s);
  }
  /**
   * Returns the Path3D array of successive Vector3 designing its curve.
   * @returns the Path3D array of successive Vector3 designing its curve.
   */
  getCurve() {
    return this._curve;
  }
  /**
   * Returns the Path3D array of successive Vector3 designing its curve.
   * @returns the Path3D array of successive Vector3 designing its curve.
   */
  getPoints() {
    return this._curve;
  }
  /**
   * @returns the computed length (float) of the path.
   */
  length() {
    return this._distances[this._distances.length - 1];
  }
  /**
   * Returns an array populated with tangent vectors on each Path3D curve point.
   * @returns an array populated with tangent vectors on each Path3D curve point.
   */
  getTangents() {
    return this._tangents;
  }
  /**
   * Returns an array populated with normal vectors on each Path3D curve point.
   * @returns an array populated with normal vectors on each Path3D curve point.
   */
  getNormals() {
    return this._normals;
  }
  /**
   * Returns an array populated with binormal vectors on each Path3D curve point.
   * @returns an array populated with binormal vectors on each Path3D curve point.
   */
  getBinormals() {
    return this._binormals;
  }
  /**
   * Returns an array populated with distances (float) of the i-th point from the first curve point.
   * @returns an array populated with distances (float) of the i-th point from the first curve point.
   */
  getDistances() {
    return this._distances;
  }
  /**
   * Returns an interpolated point along this path
   * @param position the position of the point along this path, from 0.0 to 1.0
   * @returns a new Vector3 as the point
   */
  getPointAt(e) {
    return this._updatePointAtData(e).point;
  }
  /**
   * Returns the tangent vector of an interpolated Path3D curve point at the specified position along this path.
   * @param position the position of the point along this path, from 0.0 to 1.0
   * @param interpolated (optional, default false) : boolean, if true returns an interpolated tangent instead of the tangent of the previous path point.
   * @returns a tangent vector corresponding to the interpolated Path3D curve point, if not interpolated, the tangent is taken from the precomputed tangents array.
   */
  getTangentAt(e, t = !1) {
    return this._updatePointAtData(e, t), t ? R.TransformCoordinates(R.Forward(), this._pointAtData.interpolationMatrix) : this._tangents[this._pointAtData.previousPointArrayIndex];
  }
  /**
   * Returns the tangent vector of an interpolated Path3D curve point at the specified position along this path.
   * @param position the position of the point along this path, from 0.0 to 1.0
   * @param interpolated (optional, default false) : boolean, if true returns an interpolated normal instead of the normal of the previous path point.
   * @returns a normal vector corresponding to the interpolated Path3D curve point, if not interpolated, the normal is taken from the precomputed normals array.
   */
  getNormalAt(e, t = !1) {
    return this._updatePointAtData(e, t), t ? R.TransformCoordinates(R.Right(), this._pointAtData.interpolationMatrix) : this._normals[this._pointAtData.previousPointArrayIndex];
  }
  /**
   * Returns the binormal vector of an interpolated Path3D curve point at the specified position along this path.
   * @param position the position of the point along this path, from 0.0 to 1.0
   * @param interpolated (optional, default false) : boolean, if true returns an interpolated binormal instead of the binormal of the previous path point.
   * @returns a binormal vector corresponding to the interpolated Path3D curve point, if not interpolated, the binormal is taken from the precomputed binormals array.
   */
  getBinormalAt(e, t = !1) {
    return this._updatePointAtData(e, t), t ? R.TransformCoordinates(R.UpReadOnly, this._pointAtData.interpolationMatrix) : this._binormals[this._pointAtData.previousPointArrayIndex];
  }
  /**
   * Returns the distance (float) of an interpolated Path3D curve point at the specified position along this path.
   * @param position the position of the point along this path, from 0.0 to 1.0
   * @returns the distance of the interpolated Path3D curve point at the specified position along this path.
   */
  getDistanceAt(e) {
    return this.length() * e;
  }
  /**
   * Returns the array index of the previous point of an interpolated point along this path
   * @param position the position of the point to interpolate along this path, from 0.0 to 1.0
   * @returns the array index
   */
  getPreviousPointIndexAt(e) {
    return this._updatePointAtData(e), this._pointAtData.previousPointArrayIndex;
  }
  /**
   * Returns the position of an interpolated point relative to the two path points it lies between, from 0.0 (point A) to 1.0 (point B)
   * @param position the position of the point to interpolate along this path, from 0.0 to 1.0
   * @returns the sub position
   */
  getSubPositionAt(e) {
    return this._updatePointAtData(e), this._pointAtData.subPosition;
  }
  /**
   * Returns the position of the closest virtual point on this path to an arbitrary Vector3, from 0.0 to 1.0
   * @param target the vector of which to get the closest position to
   * @returns the position of the closest virtual point on this path to the target vector
   */
  getClosestPositionTo(e) {
    let t = Number.MAX_VALUE, r = 0;
    for (let s = 0; s < this._curve.length - 1; s++) {
      const i = this._curve[s + 0], a = this._curve[s + 1].subtract(i).normalize(), o = this._distances[s + 1] - this._distances[s + 0], h = Math.min(Math.max(R.Dot(a, e.subtract(i).normalize()), 0) * R.Distance(i, e) / o, 1), l = R.Distance(i.add(a.scale(h * o)), e);
      l < t && (t = l, r = (this._distances[s + 0] + o * h) / this.length());
    }
    return r;
  }
  /**
   * Returns a sub path (slice) of this path
   * @param start the position of the fist path point, from 0.0 to 1.0, or a negative value, which will get wrapped around from the end of the path to 0.0 to 1.0 values
   * @param end the position of the last path point, from 0.0 to 1.0, or a negative value, which will get wrapped around from the end of the path to 0.0 to 1.0 values
   * @returns a sub path (slice) of this path
   */
  slice(e = 0, t = 1) {
    if (e < 0 && (e = 1 - e * -1 % 1), t < 0 && (t = 1 - t * -1 % 1), e > t) {
      const l = e;
      e = t, t = l;
    }
    const r = this.getCurve(), s = this.getPointAt(e);
    let i = this.getPreviousPointIndexAt(e);
    const a = this.getPointAt(t), o = this.getPreviousPointIndexAt(t) + 1, h = [];
    return e !== 0 && (i++, h.push(s)), h.push(...r.slice(i, o)), (t !== 1 || e === 1) && h.push(a), new Pe(h, this.getNormalAt(e), this._raw, this._alignTangentsWithPath);
  }
  /**
   * Forces the Path3D tangent, normal, binormal and distance recomputation.
   * @param path path which all values are copied into the curves points
   * @param firstNormal which should be projected onto the curve
   * @param alignTangentsWithPath (optional, default false) : boolean, if true the tangents will be aligned with the path
   * @returns the same object updated.
   */
  update(e, t = null, r = !1) {
    for (let s = 0; s < e.length; s++)
      this._curve[s].x = e[s].x, this._curve[s].y = e[s].y, this._curve[s].z = e[s].z;
    return this._compute(t, r), this;
  }
  // private function compute() : computes tangents, normals and binormals
  _compute(e, t = !1) {
    const r = this._curve.length;
    if (r < 2)
      return;
    this._tangents[0] = this._getFirstNonNullVector(0), this._raw || this._tangents[0].normalize(), this._tangents[r - 1] = this._curve[r - 1].subtract(this._curve[r - 2]), this._raw || this._tangents[r - 1].normalize();
    const s = this._tangents[0], i = this._normalVector(s, e);
    this._normals[0] = i, this._raw || this._normals[0].normalize(), this._binormals[0] = R.Cross(s, this._normals[0]), this._raw || this._binormals[0].normalize(), this._distances[0] = 0;
    let a, o, h, l, _;
    for (let u = 1; u < r; u++)
      a = this._getLastNonNullVector(u), u < r - 1 && (o = this._getFirstNonNullVector(u), this._tangents[u] = t ? o : a.add(o), this._tangents[u].normalize()), this._distances[u] = this._distances[u - 1] + this._curve[u].subtract(this._curve[u - 1]).length(), h = this._tangents[u], _ = this._binormals[u - 1], this._normals[u] = R.Cross(_, h), this._raw || (this._normals[u].length() === 0 ? (l = this._normals[u - 1], this._normals[u] = l.clone()) : this._normals[u].normalize()), this._binormals[u] = R.Cross(h, this._normals[u]), this._raw || this._binormals[u].normalize();
    this._pointAtData.id = NaN;
  }
  // private function getFirstNonNullVector(index)
  // returns the first non null vector from index : curve[index + N].subtract(curve[index])
  _getFirstNonNullVector(e) {
    let t = 1, r = this._curve[e + t].subtract(this._curve[e]);
    for (; r.length() === 0 && e + t + 1 < this._curve.length; )
      t++, r = this._curve[e + t].subtract(this._curve[e]);
    return r;
  }
  // private function getLastNonNullVector(index)
  // returns the last non null vector from index : curve[index].subtract(curve[index - N])
  _getLastNonNullVector(e) {
    let t = 1, r = this._curve[e].subtract(this._curve[e - t]);
    for (; r.length() === 0 && e > t + 1; )
      t++, r = this._curve[e].subtract(this._curve[e - t]);
    return r;
  }
  // private function normalVector(v0, vt, va) :
  // returns an arbitrary point in the plane defined by the point v0 and the vector vt orthogonal to this plane
  // if va is passed, it returns the va projection on the plane orthogonal to vt at the point v0
  _normalVector(e, t) {
    let r, s = e.length();
    if (s === 0 && (s = 1), t == null) {
      let i;
      he(Math.abs(e.y) / s, 1, le) ? he(Math.abs(e.x) / s, 1, le) ? he(Math.abs(e.z) / s, 1, le) ? i = R.Zero() : i = new R(0, 0, 1) : i = new R(1, 0, 0) : i = new R(0, -1, 0), r = R.Cross(e, i);
    } else
      r = R.Cross(e, t), R.CrossToRef(r, e, r);
    return r.normalize(), r;
  }
  /**
   * Updates the point at data for an interpolated point along this curve
   * @param position the position of the point along this curve, from 0.0 to 1.0
   * @param interpolateTNB
   * @interpolateTNB whether to compute the interpolated tangent, normal and binormal
   * @returns the (updated) point at data
   */
  _updatePointAtData(e, t = !1) {
    if (this._pointAtData.id === e)
      return this._pointAtData.interpolateReady || this._updateInterpolationMatrix(), this._pointAtData;
    this._pointAtData.id = e;
    const r = this.getPoints();
    if (e <= 0)
      return this._setPointAtData(0, 0, r[0], 0, t);
    if (e >= 1)
      return this._setPointAtData(1, 1, r[r.length - 1], r.length - 1, t);
    let s = r[0], i, a = 0;
    const o = e * this.length();
    for (let h = 1; h < r.length; h++) {
      i = r[h];
      const l = R.Distance(s, i);
      if (a += l, a === o)
        return this._setPointAtData(e, 1, i, h, t);
      if (a > o) {
        const u = (a - o) / l, f = s.subtract(i), c = i.add(f.scaleInPlace(u));
        return this._setPointAtData(e, 1 - u, c, h - 1, t);
      }
      s = i;
    }
    return this._pointAtData;
  }
  /**
   * Updates the point at data from the specified parameters
   * @param position where along the path the interpolated point is, from 0.0 to 1.0
   * @param subPosition
   * @param point the interpolated point
   * @param parentIndex the index of an existing curve point that is on, or else positionally the first behind, the interpolated point
   * @param interpolateTNB whether to compute the interpolated tangent, normal and binormal
   * @returns the (updated) point at data
   */
  _setPointAtData(e, t, r, s, i) {
    return this._pointAtData.point = r, this._pointAtData.position = e, this._pointAtData.subPosition = t, this._pointAtData.previousPointArrayIndex = s, this._pointAtData.interpolateReady = i, i && this._updateInterpolationMatrix(), this._pointAtData;
  }
  /**
   * Updates the point at interpolation matrix for the tangents, normals and binormals
   */
  _updateInterpolationMatrix() {
    this._pointAtData.interpolationMatrix = ue.Identity();
    const e = this._pointAtData.previousPointArrayIndex;
    if (e !== this._tangents.length - 1) {
      const t = e + 1, r = this._tangents[e].clone(), s = this._normals[e].clone(), i = this._binormals[e].clone(), a = this._tangents[t].clone(), o = this._normals[t].clone(), h = this._binormals[t].clone(), l = oe.RotationQuaternionFromAxis(s, i, r), _ = oe.RotationQuaternionFromAxis(o, h, a);
      oe.Slerp(l, _, this._pointAtData.subPosition).toRotationMatrix(this._pointAtData.interpolationMatrix);
    }
  }
}
const G = [
  Math.sqrt(1 / (4 * Math.PI)),
  // l00
  -Math.sqrt(3 / (4 * Math.PI)),
  // l1_1
  Math.sqrt(3 / (4 * Math.PI)),
  // l10
  -Math.sqrt(3 / (4 * Math.PI)),
  // l11
  Math.sqrt(15 / (4 * Math.PI)),
  // l2_2
  -Math.sqrt(15 / (4 * Math.PI)),
  // l2_1
  Math.sqrt(5 / (16 * Math.PI)),
  // l20
  -Math.sqrt(15 / (4 * Math.PI)),
  // l21
  Math.sqrt(15 / (16 * Math.PI))
  // l22
], dt = [
  () => 1,
  // l00
  (n) => n.y,
  // l1_1
  (n) => n.z,
  // l10
  (n) => n.x,
  // l11
  (n) => n.x * n.y,
  // l2_2
  (n) => n.y * n.z,
  // l2_1
  (n) => 3 * n.z * n.z - 1,
  // l20
  (n) => n.x * n.z,
  // l21
  (n) => n.x * n.x - n.y * n.y
  // l22
], H = (n, e) => G[n] * dt[n](e), z = [Math.PI, 2 * Math.PI / 3, 2 * Math.PI / 3, 2 * Math.PI / 3, Math.PI / 4, Math.PI / 4, Math.PI / 4, Math.PI / 4, Math.PI / 4];
class se {
  constructor() {
    this.preScaled = !1, this.l00 = R.Zero(), this.l1_1 = R.Zero(), this.l10 = R.Zero(), this.l11 = R.Zero(), this.l2_2 = R.Zero(), this.l2_1 = R.Zero(), this.l20 = R.Zero(), this.l21 = R.Zero(), this.l22 = R.Zero();
  }
  /**
   * Adds a light to the spherical harmonics
   * @param direction the direction of the light
   * @param color the color of the light
   * @param deltaSolidAngle the delta solid angle of the light
   */
  addLight(e, t, r) {
    M.Vector3[0].set(t.r, t.g, t.b);
    const s = M.Vector3[0], i = M.Vector3[1];
    s.scaleToRef(r, i), i.scaleToRef(H(0, e), M.Vector3[2]), this.l00.addInPlace(M.Vector3[2]), i.scaleToRef(H(1, e), M.Vector3[2]), this.l1_1.addInPlace(M.Vector3[2]), i.scaleToRef(H(2, e), M.Vector3[2]), this.l10.addInPlace(M.Vector3[2]), i.scaleToRef(H(3, e), M.Vector3[2]), this.l11.addInPlace(M.Vector3[2]), i.scaleToRef(H(4, e), M.Vector3[2]), this.l2_2.addInPlace(M.Vector3[2]), i.scaleToRef(H(5, e), M.Vector3[2]), this.l2_1.addInPlace(M.Vector3[2]), i.scaleToRef(H(6, e), M.Vector3[2]), this.l20.addInPlace(M.Vector3[2]), i.scaleToRef(H(7, e), M.Vector3[2]), this.l21.addInPlace(M.Vector3[2]), i.scaleToRef(H(8, e), M.Vector3[2]), this.l22.addInPlace(M.Vector3[2]);
  }
  /**
   * Scales the spherical harmonics by the given amount
   * @param scale the amount to scale
   */
  scaleInPlace(e) {
    this.l00.scaleInPlace(e), this.l1_1.scaleInPlace(e), this.l10.scaleInPlace(e), this.l11.scaleInPlace(e), this.l2_2.scaleInPlace(e), this.l2_1.scaleInPlace(e), this.l20.scaleInPlace(e), this.l21.scaleInPlace(e), this.l22.scaleInPlace(e);
  }
  /**
   * Convert from incident radiance (Li) to irradiance (E) by applying convolution with the cosine-weighted hemisphere.
   *
   * ```
   * E_lm = A_l * L_lm
   * ```
   *
   * In spherical harmonics this convolution amounts to scaling factors for each frequency band.
   * This corresponds to equation 5 in "An Efficient Representation for Irradiance Environment Maps", where
   * the scaling factors are given in equation 9.
   */
  convertIncidentRadianceToIrradiance() {
    this.l00.scaleInPlace(z[0]), this.l1_1.scaleInPlace(z[1]), this.l10.scaleInPlace(z[2]), this.l11.scaleInPlace(z[3]), this.l2_2.scaleInPlace(z[4]), this.l2_1.scaleInPlace(z[5]), this.l20.scaleInPlace(z[6]), this.l21.scaleInPlace(z[7]), this.l22.scaleInPlace(z[8]);
  }
  /**
   * Convert from irradiance to outgoing radiance for Lambertian BDRF, suitable for efficient shader evaluation.
   *
   * ```
   * L = (1/pi) * E * rho
   * ```
   *
   * This is done by an additional scale by 1/pi, so is a fairly trivial operation but important conceptually.
   */
  convertIrradianceToLambertianRadiance() {
    this.scaleInPlace(1 / Math.PI);
  }
  /**
   * Integrates the reconstruction coefficients directly in to the SH preventing further
   * required operations at run time.
   *
   * This is simply done by scaling back the SH with Ylm constants parameter.
   * The trigonometric part being applied by the shader at run time.
   */
  preScaleForRendering() {
    this.preScaled = !0, this.l00.scaleInPlace(G[0]), this.l1_1.scaleInPlace(G[1]), this.l10.scaleInPlace(G[2]), this.l11.scaleInPlace(G[3]), this.l2_2.scaleInPlace(G[4]), this.l2_1.scaleInPlace(G[5]), this.l20.scaleInPlace(G[6]), this.l21.scaleInPlace(G[7]), this.l22.scaleInPlace(G[8]);
  }
  /**
   * update the spherical harmonics coefficients from the given array
   * @param data defines the 9x3 coefficients (l00, l1-1, l10, l11, l2-2, l2-1, l20, l21, l22)
   * @returns the spherical harmonics (this)
   */
  updateFromArray(e) {
    return R.FromArrayToRef(e[0], 0, this.l00), R.FromArrayToRef(e[1], 0, this.l1_1), R.FromArrayToRef(e[2], 0, this.l10), R.FromArrayToRef(e[3], 0, this.l11), R.FromArrayToRef(e[4], 0, this.l2_2), R.FromArrayToRef(e[5], 0, this.l2_1), R.FromArrayToRef(e[6], 0, this.l20), R.FromArrayToRef(e[7], 0, this.l21), R.FromArrayToRef(e[8], 0, this.l22), this;
  }
  /**
   * update the spherical harmonics coefficients from the given floats array
   * @param data defines the 9x3 coefficients (l00, l1-1, l10, l11, l2-2, l2-1, l20, l21, l22)
   * @returns the spherical harmonics (this)
   */
  updateFromFloatsArray(e) {
    return R.FromFloatsToRef(e[0], e[1], e[2], this.l00), R.FromFloatsToRef(e[3], e[4], e[5], this.l1_1), R.FromFloatsToRef(e[6], e[7], e[8], this.l10), R.FromFloatsToRef(e[9], e[10], e[11], this.l11), R.FromFloatsToRef(e[12], e[13], e[14], this.l2_2), R.FromFloatsToRef(e[15], e[16], e[17], this.l2_1), R.FromFloatsToRef(e[18], e[19], e[20], this.l20), R.FromFloatsToRef(e[21], e[22], e[23], this.l21), R.FromFloatsToRef(e[24], e[25], e[26], this.l22), this;
  }
  /**
   * Constructs a spherical harmonics from an array.
   * @param data defines the 9x3 coefficients (l00, l1-1, l10, l11, l2-2, l2-1, l20, l21, l22)
   * @returns the spherical harmonics
   */
  static FromArray(e) {
    return new se().updateFromArray(e);
  }
  // Keep for references.
  /**
   * Gets the spherical harmonics from polynomial
   * @param polynomial the spherical polynomial
   * @returns the spherical harmonics
   */
  static FromPolynomial(e) {
    const t = new se();
    return t.l00 = e.xx.scale(0.376127).add(e.yy.scale(0.376127)).add(e.zz.scale(0.376126)), t.l1_1 = e.y.scale(0.977204), t.l10 = e.z.scale(0.977204), t.l11 = e.x.scale(0.977204), t.l2_2 = e.xy.scale(1.16538), t.l2_1 = e.yz.scale(1.16538), t.l20 = e.zz.scale(1.34567).subtract(e.xx.scale(0.672834)).subtract(e.yy.scale(0.672834)), t.l21 = e.zx.scale(1.16538), t.l22 = e.xx.scale(1.16538).subtract(e.yy.scale(1.16538)), t.l1_1.scaleInPlace(-1), t.l11.scaleInPlace(-1), t.l2_1.scaleInPlace(-1), t.l21.scaleInPlace(-1), t.scaleInPlace(Math.PI), t;
  }
}
class ie {
  constructor() {
    this.x = R.Zero(), this.y = R.Zero(), this.z = R.Zero(), this.xx = R.Zero(), this.yy = R.Zero(), this.zz = R.Zero(), this.xy = R.Zero(), this.yz = R.Zero(), this.zx = R.Zero();
  }
  /**
   * The spherical harmonics used to create the polynomials.
   */
  get preScaledHarmonics() {
    return this._harmonics || (this._harmonics = se.FromPolynomial(this)), this._harmonics.preScaled || this._harmonics.preScaleForRendering(), this._harmonics;
  }
  /**
   * Adds an ambient color to the spherical polynomial
   * @param color the color to add
   */
  addAmbient(e) {
    M.Vector3[0].copyFromFloats(e.r, e.g, e.b);
    const t = M.Vector3[0];
    this.xx.addInPlace(t), this.yy.addInPlace(t), this.zz.addInPlace(t);
  }
  /**
   * Scales the spherical polynomial by the given amount
   * @param scale the amount to scale
   */
  scaleInPlace(e) {
    this.x.scaleInPlace(e), this.y.scaleInPlace(e), this.z.scaleInPlace(e), this.xx.scaleInPlace(e), this.yy.scaleInPlace(e), this.zz.scaleInPlace(e), this.yz.scaleInPlace(e), this.zx.scaleInPlace(e), this.xy.scaleInPlace(e);
  }
  /**
   * Updates the spherical polynomial from harmonics
   * @param harmonics the spherical harmonics
   * @returns the spherical polynomial
   */
  updateFromHarmonics(e) {
    return this._harmonics = e, this.x.copyFrom(e.l11), this.x.scaleInPlace(1.02333).scaleInPlace(-1), this.y.copyFrom(e.l1_1), this.y.scaleInPlace(1.02333).scaleInPlace(-1), this.z.copyFrom(e.l10), this.z.scaleInPlace(1.02333), this.xx.copyFrom(e.l00), M.Vector3[0].copyFrom(e.l20).scaleInPlace(0.247708), M.Vector3[1].copyFrom(e.l22).scaleInPlace(0.429043), this.xx.scaleInPlace(0.886277).subtractInPlace(M.Vector3[0]).addInPlace(M.Vector3[1]), this.yy.copyFrom(e.l00), this.yy.scaleInPlace(0.886277).subtractInPlace(M.Vector3[0]).subtractInPlace(M.Vector3[1]), this.zz.copyFrom(e.l00), M.Vector3[0].copyFrom(e.l20).scaleInPlace(0.495417), this.zz.scaleInPlace(0.886277).addInPlace(M.Vector3[0]), this.yz.copyFrom(e.l2_1), this.yz.scaleInPlace(0.858086).scaleInPlace(-1), this.zx.copyFrom(e.l21), this.zx.scaleInPlace(0.858086).scaleInPlace(-1), this.xy.copyFrom(e.l2_2), this.xy.scaleInPlace(0.858086), this.scaleInPlace(1 / Math.PI), this;
  }
  /**
   * Gets the spherical polynomial from harmonics
   * @param harmonics the spherical harmonics
   * @returns the spherical polynomial
   */
  static FromHarmonics(e) {
    return new ie().updateFromHarmonics(e);
  }
  /**
   * Constructs a spherical polynomial from an array.
   * @param data defines the 9x3 coefficients (x, y, z, xx, yy, zz, yz, zx, xy)
   * @returns the spherical polynomial
   */
  static FromArray(e) {
    const t = new ie();
    return R.FromArrayToRef(e[0], 0, t.x), R.FromArrayToRef(e[1], 0, t.y), R.FromArrayToRef(e[2], 0, t.z), R.FromArrayToRef(e[3], 0, t.xx), R.FromArrayToRef(e[4], 0, t.yy), R.FromArrayToRef(e[5], 0, t.zz), R.FromArrayToRef(e[6], 0, t.yz), R.FromArrayToRef(e[7], 0, t.zx), R.FromArrayToRef(e[8], 0, t.xy), t;
  }
}
S.prototype.createPrefilteredCubeTexture = function(n, e, t, r, s = null, i = null, a, o = null, h = !0) {
  const l = async (_) => {
    if (!_) {
      s && s(null);
      return;
    }
    const u = _.texture;
    if (h ? _.info.sphericalPolynomial && (u._sphericalPolynomial = _.info.sphericalPolynomial) : u._sphericalPolynomial = new ie(), u._source = 9, this.getCaps().textureLOD) {
      s && s(u);
      return;
    }
    const f = 3, c = this._gl, p = _.width;
    if (!p)
      return;
    const { DDSTools: m } = await import("./dds-7b103a2d.js"), E = [];
    for (let T = 0; T < f; T++) {
      const I = 1 - T / (f - 1), F = r, P = Math.log2(p) * t + r, A = F + (P - F) * I, C = Math.round(Math.min(Math.max(A, 0), P)), x = new k(
        this,
        2
        /* InternalTextureSource.Temp */
      );
      if (x.type = u.type, x.format = u.format, x.width = Math.pow(2, Math.max(Math.log2(p) - C, 0)), x.height = x.width, x.isCube = !0, x._cachedWrapU = 0, x._cachedWrapV = 0, this._bindTextureDirectly(c.TEXTURE_CUBE_MAP, x, !0), x.samplingMode = 2, c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_MAG_FILTER, c.LINEAR), c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_MIN_FILTER, c.LINEAR), c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE), c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE), _.isDDS) {
        const D = _.info, W = _.data;
        this._unpackFlipY(D.isCompressed), m.UploadDDSLevels(this, x, W, D, !0, 6, C);
      } else
        B.Warn("DDS is the only prefiltered cube map supported so far.");
      this._bindTextureDirectly(c.TEXTURE_CUBE_MAP, null);
      const U = new st(e);
      U._isCube = !0, U._texture = x, x.isReady = !0, E.push(U);
    }
    u._lodTextureHigh = E[2], u._lodTextureMid = E[1], u._lodTextureLow = E[0], s && s(u);
  };
  return this.createCubeTexture(n, e, null, !1, l, i, a, o, h, t, r);
};
S.prototype.createUniformBuffer = function(n, e) {
  const t = this._gl.createBuffer();
  if (!t)
    throw new Error("Unable to create uniform buffer");
  const r = new $(t);
  return this.bindUniformBuffer(r), n instanceof Float32Array ? this._gl.bufferData(this._gl.UNIFORM_BUFFER, n, this._gl.STATIC_DRAW) : this._gl.bufferData(this._gl.UNIFORM_BUFFER, new Float32Array(n), this._gl.STATIC_DRAW), this.bindUniformBuffer(null), r.references = 1, r;
};
S.prototype.createDynamicUniformBuffer = function(n, e) {
  const t = this._gl.createBuffer();
  if (!t)
    throw new Error("Unable to create dynamic uniform buffer");
  const r = new $(t);
  return this.bindUniformBuffer(r), n instanceof Float32Array ? this._gl.bufferData(this._gl.UNIFORM_BUFFER, n, this._gl.DYNAMIC_DRAW) : this._gl.bufferData(this._gl.UNIFORM_BUFFER, new Float32Array(n), this._gl.DYNAMIC_DRAW), this.bindUniformBuffer(null), r.references = 1, r;
};
S.prototype.updateUniformBuffer = function(n, e, t, r) {
  this.bindUniformBuffer(n), t === void 0 && (t = 0), r === void 0 ? e instanceof Float32Array ? this._gl.bufferSubData(this._gl.UNIFORM_BUFFER, t, e) : this._gl.bufferSubData(this._gl.UNIFORM_BUFFER, t, new Float32Array(e)) : e instanceof Float32Array ? this._gl.bufferSubData(this._gl.UNIFORM_BUFFER, 0, e.subarray(t, t + r)) : this._gl.bufferSubData(this._gl.UNIFORM_BUFFER, 0, new Float32Array(e).subarray(t, t + r)), this.bindUniformBuffer(null);
};
S.prototype.bindUniformBuffer = function(n) {
  this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, n ? n.underlyingResource : null);
};
S.prototype.bindUniformBufferBase = function(n, e, t) {
  this._gl.bindBufferBase(this._gl.UNIFORM_BUFFER, e, n ? n.underlyingResource : null);
};
S.prototype.bindUniformBlock = function(n, e, t) {
  const r = n.program, s = this._gl.getUniformBlockIndex(r, e);
  s !== 4294967295 && this._gl.uniformBlockBinding(r, s, t);
};
b.prototype.displayLoadingUI = function() {
  if (!fe())
    return;
  const n = this.loadingScreen;
  n && n.displayLoadingUI();
};
b.prototype.hideLoadingUI = function() {
  if (!fe())
    return;
  const n = this._loadingScreen;
  n && n.hideLoadingUI();
};
Object.defineProperty(b.prototype, "loadingScreen", {
  get: function() {
    return !this._loadingScreen && this._renderingCanvas && (this._loadingScreen = b.DefaultLoadingScreenFactory(this._renderingCanvas)), this._loadingScreen;
  },
  set: function(n) {
    this._loadingScreen = n;
  },
  enumerable: !0,
  configurable: !0
});
Object.defineProperty(b.prototype, "loadingUIText", {
  set: function(n) {
    this.loadingScreen.loadingUIText = n;
  },
  enumerable: !0,
  configurable: !0
});
Object.defineProperty(b.prototype, "loadingUIBackgroundColor", {
  set: function(n) {
    this.loadingScreen.loadingUIBackgroundColor = n;
  },
  enumerable: !0,
  configurable: !0
});
b.prototype.getInputElement = function() {
  return this._renderingCanvas;
};
b.prototype.getRenderingCanvasClientRect = function() {
  return this._renderingCanvas ? this._renderingCanvas.getBoundingClientRect() : null;
};
b.prototype.getInputElementClientRect = function() {
  return this._renderingCanvas ? this.getInputElement().getBoundingClientRect() : null;
};
b.prototype.getAspectRatio = function(n, e = !1) {
  const t = n.viewport;
  return this.getRenderWidth(e) * t.width / (this.getRenderHeight(e) * t.height);
};
b.prototype.getScreenAspectRatio = function() {
  return this.getRenderWidth(!0) / this.getRenderHeight(!0);
};
b.prototype._verifyPointerLock = function() {
  var n;
  (n = this._onPointerLockChange) == null || n.call(this);
};
b.prototype.setAlphaEquation = function(n) {
  if (this._alphaEquation !== n) {
    switch (n) {
      case 0:
        this._alphaState.setAlphaEquationParameters(32774, 32774);
        break;
      case 1:
        this._alphaState.setAlphaEquationParameters(32778, 32778);
        break;
      case 2:
        this._alphaState.setAlphaEquationParameters(32779, 32779);
        break;
      case 3:
        this._alphaState.setAlphaEquationParameters(32776, 32776);
        break;
      case 4:
        this._alphaState.setAlphaEquationParameters(32775, 32775);
        break;
      case 5:
        this._alphaState.setAlphaEquationParameters(32775, 32774);
        break;
    }
    this._alphaEquation = n;
  }
};
b.prototype.getInputElement = function() {
  return this._renderingCanvas;
};
b.prototype.getDepthFunction = function() {
  return this._depthCullingState.depthFunc;
};
b.prototype.setDepthFunction = function(n) {
  this._depthCullingState.depthFunc = n;
};
b.prototype.setDepthFunctionToGreater = function() {
  this.setDepthFunction(516);
};
b.prototype.setDepthFunctionToGreaterOrEqual = function() {
  this.setDepthFunction(518);
};
b.prototype.setDepthFunctionToLess = function() {
  this.setDepthFunction(513);
};
b.prototype.setDepthFunctionToLessOrEqual = function() {
  this.setDepthFunction(515);
};
b.prototype.getDepthWrite = function() {
  return this._depthCullingState.depthMask;
};
b.prototype.setDepthWrite = function(n) {
  this._depthCullingState.depthMask = n;
};
b.prototype.getStencilBuffer = function() {
  return this._stencilState.stencilTest;
};
b.prototype.setStencilBuffer = function(n) {
  this._stencilState.stencilTest = n;
};
b.prototype.getStencilMask = function() {
  return this._stencilState.stencilMask;
};
b.prototype.setStencilMask = function(n) {
  this._stencilState.stencilMask = n;
};
b.prototype.getStencilFunction = function() {
  return this._stencilState.stencilFunc;
};
b.prototype.getStencilFunctionReference = function() {
  return this._stencilState.stencilFuncRef;
};
b.prototype.getStencilFunctionMask = function() {
  return this._stencilState.stencilFuncMask;
};
b.prototype.setStencilFunction = function(n) {
  this._stencilState.stencilFunc = n;
};
b.prototype.setStencilFunctionReference = function(n) {
  this._stencilState.stencilFuncRef = n;
};
b.prototype.setStencilFunctionMask = function(n) {
  this._stencilState.stencilFuncMask = n;
};
b.prototype.getStencilOperationFail = function() {
  return this._stencilState.stencilOpStencilFail;
};
b.prototype.getStencilOperationDepthFail = function() {
  return this._stencilState.stencilOpDepthFail;
};
b.prototype.getStencilOperationPass = function() {
  return this._stencilState.stencilOpStencilDepthPass;
};
b.prototype.setStencilOperationFail = function(n) {
  this._stencilState.stencilOpStencilFail = n;
};
b.prototype.setStencilOperationDepthFail = function(n) {
  this._stencilState.stencilOpDepthFail = n;
};
b.prototype.setStencilOperationPass = function(n) {
  this._stencilState.stencilOpStencilDepthPass = n;
};
b.prototype.cacheStencilState = function() {
  this._cachedStencilBuffer = this.getStencilBuffer(), this._cachedStencilFunction = this.getStencilFunction(), this._cachedStencilMask = this.getStencilMask(), this._cachedStencilOperationPass = this.getStencilOperationPass(), this._cachedStencilOperationFail = this.getStencilOperationFail(), this._cachedStencilOperationDepthFail = this.getStencilOperationDepthFail(), this._cachedStencilReference = this.getStencilFunctionReference();
};
b.prototype.restoreStencilState = function() {
  this.setStencilFunction(this._cachedStencilFunction), this.setStencilMask(this._cachedStencilMask), this.setStencilBuffer(this._cachedStencilBuffer), this.setStencilOperationPass(this._cachedStencilOperationPass), this.setStencilOperationFail(this._cachedStencilOperationFail), this.setStencilOperationDepthFail(this._cachedStencilOperationDepthFail), this.setStencilFunctionReference(this._cachedStencilReference);
};
b.prototype.setAlphaConstants = function(n, e, t, r) {
  this._alphaState.setAlphaBlendConstants(n, e, t, r);
};
b.prototype.getAlphaMode = function() {
  return this._alphaMode;
};
b.prototype.getAlphaEquation = function() {
  return this._alphaEquation;
};
b.prototype.getRenderPassNames = function() {
  return this._renderPassNames;
};
b.prototype.getCurrentRenderPassName = function() {
  return this._renderPassNames[this.currentRenderPassId];
};
b.prototype.createRenderPassId = function(n) {
  const e = ++b._RenderPassIdCounter;
  return this._renderPassNames[e] = n ?? "NONAME", e;
};
b.prototype.releaseRenderPassId = function(n) {
  this._renderPassNames[n] = void 0;
  for (let e = 0; e < this.scenes.length; ++e) {
    const t = this.scenes[e];
    for (let r = 0; r < t.meshes.length; ++r) {
      const s = t.meshes[r];
      if (s.subMeshes)
        for (let i = 0; i < s.subMeshes.length; ++i)
          s.subMeshes[i]._removeDrawWrapper(n);
    }
  }
};
function gt(n) {
  !n || !n.setAttribute || (n.setAttribute("touch-action", "none"), n.style.touchAction = "none", n.style.webkitTapHighlightColor = "transparent");
}
function pt(n, e, t) {
  n._onCanvasFocus = () => {
    n.onCanvasFocusObservable.notifyObservers(n);
  }, n._onCanvasBlur = () => {
    n.onCanvasBlurObservable.notifyObservers(n);
  }, n._onCanvasContextMenu = (s) => {
    n.disableContextMenu && s.preventDefault();
  }, e.addEventListener("focus", n._onCanvasFocus), e.addEventListener("blur", n._onCanvasBlur), e.addEventListener("contextmenu", n._onCanvasContextMenu), n._onBlur = () => {
    n.disablePerformanceMonitorInBackground && n.performanceMonitor.disable(), n._windowIsBackground = !0;
  }, n._onFocus = () => {
    n.disablePerformanceMonitorInBackground && n.performanceMonitor.enable(), n._windowIsBackground = !1;
  }, n._onCanvasPointerOut = (s) => {
    document.elementFromPoint(s.clientX, s.clientY) !== e && n.onCanvasPointerOutObservable.notifyObservers(s);
  };
  const r = n.getHostWindow();
  r && typeof r.addEventListener == "function" && (r.addEventListener("blur", n._onBlur), r.addEventListener("focus", n._onFocus)), e.addEventListener("pointerout", n._onCanvasPointerOut), t.doNotHandleTouchAction || gt(e), !b.audioEngine && t.audioEngine && b.AudioEngineFactory && (b.audioEngine = b.AudioEngineFactory(n.getRenderingCanvas(), n.getAudioContext(), n.getAudioDestination())), Re() && (n._onFullscreenChange = () => {
    n.isFullscreen = !!document.fullscreenElement, n.isFullscreen && n._pointerLockRequested && e && Ce(e);
  }, document.addEventListener("fullscreenchange", n._onFullscreenChange, !1), document.addEventListener("webkitfullscreenchange", n._onFullscreenChange, !1), n._onPointerLockChange = () => {
    n.isPointerLock = document.pointerLockElement === e;
  }, document.addEventListener("pointerlockchange", n._onPointerLockChange, !1), document.addEventListener("webkitpointerlockchange", n._onPointerLockChange, !1)), n.enableOfflineSupport = b.OfflineProviderFactory !== void 0, n._deterministicLockstep = !!t.deterministicLockstep, n._lockstepMaxSteps = t.lockstepMaxSteps || 0, n._timeStep = t.timeStep || 1 / 60;
}
function Tt(n, e) {
  te.Instances.length === 1 && b.audioEngine && (b.audioEngine.dispose(), b.audioEngine = null);
  const t = n.getHostWindow();
  t && typeof t.removeEventListener == "function" && (t.removeEventListener("blur", n._onBlur), t.removeEventListener("focus", n._onFocus)), e && (e.removeEventListener("focus", n._onCanvasFocus), e.removeEventListener("blur", n._onCanvasBlur), e.removeEventListener("pointerout", n._onCanvasPointerOut), e.removeEventListener("contextmenu", n._onCanvasContextMenu)), Re() && (document.removeEventListener("fullscreenchange", n._onFullscreenChange), document.removeEventListener("mozfullscreenchange", n._onFullscreenChange), document.removeEventListener("webkitfullscreenchange", n._onFullscreenChange), document.removeEventListener("msfullscreenchange", n._onFullscreenChange), document.removeEventListener("pointerlockchange", n._onPointerLockChange), document.removeEventListener("mspointerlockchange", n._onPointerLockChange), document.removeEventListener("mozpointerlockchange", n._onPointerLockChange), document.removeEventListener("webkitpointerlockchange", n._onPointerLockChange));
}
function Et(n) {
  const e = document.createElement("span");
  e.textContent = "Hg", e.style.font = n;
  const t = document.createElement("div");
  t.style.display = "inline-block", t.style.width = "1px", t.style.height = "0px", t.style.verticalAlign = "bottom";
  const r = document.createElement("div");
  r.style.whiteSpace = "nowrap", r.appendChild(e), r.appendChild(t), document.body.appendChild(r);
  let s = 0, i = 0;
  try {
    i = t.getBoundingClientRect().top - e.getBoundingClientRect().top, t.style.verticalAlign = "baseline", s = t.getBoundingClientRect().top - e.getBoundingClientRect().top;
  } finally {
    document.body.removeChild(r);
  }
  return { ascent: s, height: i, descent: i - s };
}
function Rt(n, e, t) {
  return new Promise((s, i) => {
    const a = new Image();
    a.onload = () => {
      a.decode().then(() => {
        n.createImageBitmap(a, t).then((o) => {
          s(o);
        });
      });
    }, a.onerror = () => {
      i(`Error loading image ${a.src}`);
    }, a.src = e;
  });
}
function bt(n, e, t, r) {
  const i = n.createCanvas(t, r).getContext("2d");
  if (!i)
    throw new Error("Unable to get 2d context for resizeImageBitmap");
  return i.drawImage(e, 0, 0), i.getImageData(0, 0, t, r).data;
}
function mt(n) {
  const e = n.requestFullscreen || n.webkitRequestFullscreen;
  e && e.call(n);
}
function At() {
  const n = document;
  document.exitFullscreen ? document.exitFullscreen() : n.webkitCancelFullScreen && n.webkitCancelFullScreen();
}
function Ce(n) {
  if (n.requestPointerLock) {
    const e = n.requestPointerLock();
    e instanceof Promise ? e.then(() => {
      n.focus();
    }).catch(() => {
    }) : n.focus();
  }
}
function St() {
  document.exitPointerLock && document.exitPointerLock();
}
class d extends S {
  /**
   * Returns the current npm package of the sdk
   */
  // Not mixed with Version for tooling purpose.
  static get NpmPackage() {
    return b.NpmPackage;
  }
  /**
   * Returns the current version of the framework
   */
  static get Version() {
    return b.Version;
  }
  /** Gets the list of created engines */
  static get Instances() {
    return te.Instances;
  }
  /**
   * Gets the latest created engine
   */
  static get LastCreatedEngine() {
    return te.LastCreatedEngine;
  }
  /**
   * Gets the latest created scene
   */
  static get LastCreatedScene() {
    return te.LastCreatedScene;
  }
  /** @internal */
  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * Method called to create the default loading screen.
   * This can be overridden in your own app.
   * @param canvas The rendering canvas element
   * @returns The loading screen
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static DefaultLoadingScreenFactory(e) {
    return b.DefaultLoadingScreenFactory(e);
  }
  get _supportsHardwareTextureRescaling() {
    return !!d._RescalePostProcessFactory;
  }
  _measureFps() {
    this._performanceMonitor.sampleFrame(), this._fps = this._performanceMonitor.averageFPS, this._deltaTime = this._performanceMonitor.instantaneousFrameTime || 0;
  }
  /**
   * Gets the performance monitor attached to this engine
   * @see https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene#engineinstrumentation
   */
  get performanceMonitor() {
    return this._performanceMonitor;
  }
  // Events
  /**
   * Creates a new engine
   * @param canvasOrContext defines the canvas or WebGL context to use for rendering. If you provide a WebGL context, Babylon.js will not hook events on the canvas (like pointers, keyboards, etc...) so no event observables will be available. This is mostly used when Babylon.js is used as a plugin on a system which already used the WebGL context
   * @param antialias defines enable antialiasing (default: false)
   * @param options defines further options to be sent to the getContext() function
   * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
   */
  constructor(e, t, r, s = !1) {
    super(e, t, r, s), this.customAnimationFrameRequester = null, this._performanceMonitor = new ot(), this._drawCalls = new ze(), e && (this._features.supportRenderPasses = !0, r = this._creationOptions);
  }
  _initGLContext() {
    super._initGLContext(), this._rescalePostProcess = null;
  }
  /**
   * Shared initialization across engines types.
   * @param canvas The canvas associated with this instance of the engine.
   */
  _sharedInit(e) {
    super._sharedInit(e), pt(this, e, this._creationOptions);
  }
  /**
   * Resize an image and returns the image data as an uint8array
   * @param image image to resize
   * @param bufferWidth destination buffer width
   * @param bufferHeight destination buffer height
   * @returns an uint8array containing RGBA values of bufferWidth * bufferHeight size
   */
  resizeImageBitmap(e, t, r) {
    return bt(this, e, t, r);
  }
  /**
   * Engine abstraction for loading and creating an image bitmap from a given source string.
   * @param imageSource source to load the image from.
   * @param options An object that sets options for the image's extraction.
   * @returns ImageBitmap
   */
  _createImageBitmapFromSource(e, t) {
    return Rt(this, e, t);
  }
  /**
   * Toggle full screen mode
   * @param requestPointerLock defines if a pointer lock should be requested from the user
   */
  switchFullscreen(e) {
    this.isFullscreen ? this.exitFullscreen() : this.enterFullscreen(e);
  }
  /**
   * Enters full screen mode
   * @param requestPointerLock defines if a pointer lock should be requested from the user
   */
  enterFullscreen(e) {
    this.isFullscreen || (this._pointerLockRequested = e, this._renderingCanvas && mt(this._renderingCanvas));
  }
  /**
   * Exits full screen mode
   */
  exitFullscreen() {
    this.isFullscreen && At();
  }
  /** States */
  /**
   * Sets a boolean indicating if the dithering state is enabled or disabled
   * @param value defines the dithering state
   */
  setDitheringState(e) {
    e ? this._gl.enable(this._gl.DITHER) : this._gl.disable(this._gl.DITHER);
  }
  /**
   * Sets a boolean indicating if the rasterizer state is enabled or disabled
   * @param value defines the rasterizer state
   */
  setRasterizerState(e) {
    e ? this._gl.disable(this._gl.RASTERIZER_DISCARD) : this._gl.enable(this._gl.RASTERIZER_DISCARD);
  }
  /**
   * Directly set the WebGL Viewport
   * @param x defines the x coordinate of the viewport (in screen space)
   * @param y defines the y coordinate of the viewport (in screen space)
   * @param width defines the width of the viewport (in screen space)
   * @param height defines the height of the viewport (in screen space)
   * @returns the current viewport Object (if any) that is being replaced by this call. You can restore this viewport later on to go back to the original state
   */
  setDirectViewport(e, t, r, s) {
    const i = this._cachedViewport;
    return this._cachedViewport = null, this._viewport(e, t, r, s), i;
  }
  /**
   * Executes a scissor clear (ie. a clear on a specific portion of the screen)
   * @param x defines the x-coordinate of the bottom left corner of the clear rectangle
   * @param y defines the y-coordinate of the corner of the clear rectangle
   * @param width defines the width of the clear rectangle
   * @param height defines the height of the clear rectangle
   * @param clearColor defines the clear color
   */
  scissorClear(e, t, r, s, i) {
    this.enableScissor(e, t, r, s), this.clear(i, !0, !0, !0), this.disableScissor();
  }
  /**
   * Enable scissor test on a specific rectangle (ie. render will only be executed on a specific portion of the screen)
   * @param x defines the x-coordinate of the bottom left corner of the clear rectangle
   * @param y defines the y-coordinate of the corner of the clear rectangle
   * @param width defines the width of the clear rectangle
   * @param height defines the height of the clear rectangle
   */
  enableScissor(e, t, r, s) {
    const i = this._gl;
    i.enable(i.SCISSOR_TEST), i.scissor(e, t, r, s);
  }
  /**
   * Disable previously set scissor test rectangle
   */
  disableScissor() {
    const e = this._gl;
    e.disable(e.SCISSOR_TEST);
  }
  /**
   * @internal
   */
  _loadFileAsync(e, t, r) {
    return new Promise((s, i) => {
      this._loadFile(e, (a) => {
        s(a);
      }, void 0, t, r, (a, o) => {
        i(o);
      });
    });
  }
  /**
   * Gets the source code of the vertex shader associated with a specific webGL program
   * @param program defines the program to use
   * @returns a string containing the source code of the vertex shader associated with the program
   */
  getVertexShaderSource(e) {
    const t = this._gl.getAttachedShaders(e);
    return t ? this._gl.getShaderSource(t[0]) : null;
  }
  /**
   * Gets the source code of the fragment shader associated with a specific webGL program
   * @param program defines the program to use
   * @returns a string containing the source code of the fragment shader associated with the program
   */
  getFragmentShaderSource(e) {
    const t = this._gl.getAttachedShaders(e);
    return t ? this._gl.getShaderSource(t[1]) : null;
  }
  /**
   * sets the object from which width and height will be taken from when getting render width and height
   * Will fallback to the gl object
   * @param dimensions the framebuffer width and height that will be used.
   */
  set framebufferDimensionsObject(e) {
    this._framebufferDimensionsObject = e, this._framebufferDimensionsObject && this.onResizeObservable.notifyObservers(this);
  }
  _rebuildBuffers() {
    for (const e of this.scenes)
      e.resetCachedMaterial(), e._rebuildGeometries();
    for (const e of this._virtualScenes)
      e.resetCachedMaterial(), e._rebuildGeometries();
    super._rebuildBuffers();
  }
  /**
   * Get Font size information
   * @param font font name
   * @returns an object containing ascent, height and descent
   */
  getFontOffset(e) {
    return Et(e);
  }
  _cancelFrame() {
    if (this.customAnimationFrameRequester) {
      if (this._frameHandler !== 0) {
        this._frameHandler = 0;
        const { cancelAnimationFrame: e } = this.customAnimationFrameRequester;
        e && e(this.customAnimationFrameRequester.requestID);
      }
    } else
      super._cancelFrame();
  }
  _renderLoop(e) {
    this._processFrame(e), this._activeRenderLoops.length > 0 && this._frameHandler === 0 && (this.customAnimationFrameRequester ? (this.customAnimationFrameRequester.requestID = this._queueNewFrame(this.customAnimationFrameRequester.renderFunction || this._boundRenderFunction, this.customAnimationFrameRequester), this._frameHandler = this.customAnimationFrameRequester.requestID) : this._frameHandler = this._queueNewFrame(this._boundRenderFunction, this.getHostWindow()));
  }
  /**
   * Enters Pointerlock mode
   */
  enterPointerlock() {
    this._renderingCanvas && Ce(this._renderingCanvas);
  }
  /**
   * Exits Pointerlock mode
   */
  exitPointerlock() {
    St();
  }
  /**
   * Begin a new frame
   */
  beginFrame() {
    this._measureFps(), super.beginFrame();
  }
  _deletePipelineContext(e) {
    const t = e;
    t && t.program && t.transformFeedback && (this.deleteTransformFeedback(t.transformFeedback), t.transformFeedback = null), super._deletePipelineContext(e);
  }
  createShaderProgram(e, t, r, s, i, a = null) {
    i = i || this._gl, this.onBeforeShaderCompilationObservable.notifyObservers(this);
    const o = super.createShaderProgram(e, t, r, s, i, a);
    return this.onAfterShaderCompilationObservable.notifyObservers(this), o;
  }
  _createShaderProgram(e, t, r, s, i = null) {
    const a = s.createProgram();
    if (e.program = a, !a)
      throw new Error("Unable to create program");
    if (s.attachShader(a, t), s.attachShader(a, r), this.webGLVersion > 1 && i) {
      const o = this.createTransformFeedback();
      this.bindTransformFeedback(o), this.setTranformFeedbackVaryings(a, i), e.transformFeedback = o;
    }
    return s.linkProgram(a), this.webGLVersion > 1 && i && this.bindTransformFeedback(null), e.context = s, e.vertexShader = t, e.fragmentShader = r, e.isParallelCompiled || this._finalizePipelineContext(e), a;
  }
  /**
   * @internal
   */
  _releaseTexture(e) {
    super._releaseTexture(e);
  }
  /**
   * @internal
   */
  _releaseRenderTargetWrapper(e) {
    super._releaseRenderTargetWrapper(e), this.scenes.forEach((t) => {
      t.postProcesses.forEach((r) => {
        r._outputTexture === e && (r._outputTexture = null);
      }), t.cameras.forEach((r) => {
        r._postProcesses.forEach((s) => {
          s && s._outputTexture === e && (s._outputTexture = null);
        });
      });
    });
  }
  /**
   * @internal
   * Rescales a texture
   * @param source input texture
   * @param destination destination texture
   * @param scene scene to use to render the resize
   * @param internalFormat format to use when resizing
   * @param onComplete callback to be called when resize has completed
   */
  _rescaleTexture(e, t, r, s, i) {
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR), this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR), this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE), this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
    const a = this.createRenderTargetTexture({
      width: t.width,
      height: t.height
    }, {
      generateMipMaps: !1,
      type: 0,
      samplingMode: 2,
      generateDepthBuffer: !1,
      generateStencilBuffer: !1
    });
    if (!this._rescalePostProcess && d._RescalePostProcessFactory && (this._rescalePostProcess = d._RescalePostProcessFactory(this)), this._rescalePostProcess) {
      this._rescalePostProcess.externalTextureSamplerBinding = !0;
      const o = () => {
        this._rescalePostProcess.onApply = function(_) {
          _._bindTexture("textureSampler", e);
        };
        let l = r;
        l || (l = this.scenes[this.scenes.length - 1]), l.postProcessManager.directRender([this._rescalePostProcess], a, !0), this._bindTextureDirectly(this._gl.TEXTURE_2D, t, !0), this._gl.copyTexImage2D(this._gl.TEXTURE_2D, 0, s, 0, 0, t.width, t.height, 0), this.unBindFramebuffer(a), a.dispose(), i && i();
      }, h = this._rescalePostProcess.getEffect();
      h ? h.executeWhenCompiled(o) : this._rescalePostProcess.onEffectCreatedObservable.addOnce((l) => {
        l.executeWhenCompiled(o);
      });
    }
  }
  /**
   * Wraps an external web gl texture in a Babylon texture.
   * @param texture defines the external texture
   * @param hasMipMaps defines whether the external texture has mip maps (default: false)
   * @param samplingMode defines the sampling mode for the external texture (default: 3)
   * @param width defines the width for the external texture (default: 0)
   * @param height defines the height for the external texture (default: 0)
   * @returns the babylon internal texture
   */
  wrapWebGLTexture(e, t = !1, r = 3, s = 0, i = 0) {
    const a = new be(e, this._gl), o = new k(this, 0, !0);
    return o._hardwareTexture = a, o.baseWidth = s, o.baseHeight = i, o.width = s, o.height = i, o.isReady = !0, o.useMipMaps = t, this.updateTextureSamplingMode(r, o), o;
  }
  /**
   * @internal
   */
  _uploadImageToTexture(e, t, r = 0, s = 0) {
    const i = this._gl, a = this._getWebGLTextureType(e.type), o = this._getInternalFormat(e.format), h = this._getRGBABufferInternalSizedFormat(e.type, o), l = e.isCube ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D;
    this._bindTextureDirectly(l, e, !0), this._unpackFlipY(e.invertY);
    let _ = i.TEXTURE_2D;
    e.isCube && (_ = i.TEXTURE_CUBE_MAP_POSITIVE_X + r), i.texImage2D(_, s, h, o, a, t), this._bindTextureDirectly(l, null, !0);
  }
  /**
   * Updates a depth texture Comparison Mode and Function.
   * If the comparison Function is equal to 0, the mode will be set to none.
   * Otherwise, this only works in webgl 2 and requires a shadow sampler in the shader.
   * @param texture The texture to set the comparison function for
   * @param comparisonFunction The comparison function to set, 0 if no comparison required
   */
  updateTextureComparisonFunction(e, t) {
    if (this.webGLVersion === 1) {
      B.Error("WebGL 1 does not support texture comparison.");
      return;
    }
    const r = this._gl;
    e.isCube ? (this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, e, !0), t === 0 ? (r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_COMPARE_FUNC, 515), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_COMPARE_MODE, r.NONE)) : (r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_COMPARE_FUNC, t), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_COMPARE_MODE, r.COMPARE_REF_TO_TEXTURE)), this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null)) : (this._bindTextureDirectly(this._gl.TEXTURE_2D, e, !0), t === 0 ? (r.texParameteri(r.TEXTURE_2D, r.TEXTURE_COMPARE_FUNC, 515), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_COMPARE_MODE, r.NONE)) : (r.texParameteri(r.TEXTURE_2D, r.TEXTURE_COMPARE_FUNC, t), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_COMPARE_MODE, r.COMPARE_REF_TO_TEXTURE)), this._bindTextureDirectly(this._gl.TEXTURE_2D, null)), e._comparisonFunction = t;
  }
  /**
   * Creates a webGL buffer to use with instantiation
   * @param capacity defines the size of the buffer
   * @returns the webGL buffer
   */
  createInstancesBuffer(e) {
    const t = this._gl.createBuffer();
    if (!t)
      throw new Error("Unable to create instance buffer");
    const r = new $(t);
    return r.capacity = e, this.bindArrayBuffer(r), this._gl.bufferData(this._gl.ARRAY_BUFFER, e, this._gl.DYNAMIC_DRAW), r.references = 1, r;
  }
  /**
   * Delete a webGL buffer used with instantiation
   * @param buffer defines the webGL buffer to delete
   */
  deleteInstancesBuffer(e) {
    this._gl.deleteBuffer(e);
  }
  _clientWaitAsync(e, t = 0, r = 10) {
    const s = this._gl;
    return new Promise((i, a) => {
      je(() => {
        const o = s.clientWaitSync(e, t, 0);
        if (o == s.WAIT_FAILED)
          throw new Error("clientWaitSync failed");
        return o != s.TIMEOUT_EXPIRED;
      }, i, a, r);
    });
  }
  /**
   * @internal
   */
  _readPixelsAsync(e, t, r, s, i, a, o) {
    if (this._webGLVersion < 2)
      throw new Error("_readPixelsAsync only work on WebGL2+");
    const h = this._gl, l = h.createBuffer();
    h.bindBuffer(h.PIXEL_PACK_BUFFER, l), h.bufferData(h.PIXEL_PACK_BUFFER, o.byteLength, h.STREAM_READ), h.readPixels(e, t, r, s, i, a, 0), h.bindBuffer(h.PIXEL_PACK_BUFFER, null);
    const _ = h.fenceSync(h.SYNC_GPU_COMMANDS_COMPLETE, 0);
    return _ ? (h.flush(), this._clientWaitAsync(_, 0, 10).then(() => (h.deleteSync(_), h.bindBuffer(h.PIXEL_PACK_BUFFER, l), h.getBufferSubData(h.PIXEL_PACK_BUFFER, 0, o), h.bindBuffer(h.PIXEL_PACK_BUFFER, null), h.deleteBuffer(l), o))) : null;
  }
  dispose() {
    this.hideLoadingUI(), this._rescalePostProcess && this._rescalePostProcess.dispose(), Tt(this, this._renderingCanvas), super.dispose();
  }
}
d.ALPHA_DISABLE = 0;
d.ALPHA_ADD = 1;
d.ALPHA_COMBINE = 2;
d.ALPHA_SUBTRACT = 3;
d.ALPHA_MULTIPLY = 4;
d.ALPHA_MAXIMIZED = 5;
d.ALPHA_ONEONE = 6;
d.ALPHA_PREMULTIPLIED = 7;
d.ALPHA_PREMULTIPLIED_PORTERDUFF = 8;
d.ALPHA_INTERPOLATE = 9;
d.ALPHA_SCREENMODE = 10;
d.DELAYLOADSTATE_NONE = 0;
d.DELAYLOADSTATE_LOADED = 1;
d.DELAYLOADSTATE_LOADING = 2;
d.DELAYLOADSTATE_NOTLOADED = 4;
d.NEVER = 512;
d.ALWAYS = 519;
d.LESS = 513;
d.EQUAL = 514;
d.LEQUAL = 515;
d.GREATER = 516;
d.GEQUAL = 518;
d.NOTEQUAL = 517;
d.KEEP = 7680;
d.REPLACE = 7681;
d.INCR = 7682;
d.DECR = 7683;
d.INVERT = 5386;
d.INCR_WRAP = 34055;
d.DECR_WRAP = 34056;
d.TEXTURE_CLAMP_ADDRESSMODE = 0;
d.TEXTURE_WRAP_ADDRESSMODE = 1;
d.TEXTURE_MIRROR_ADDRESSMODE = 2;
d.TEXTUREFORMAT_ALPHA = 0;
d.TEXTUREFORMAT_LUMINANCE = 1;
d.TEXTUREFORMAT_LUMINANCE_ALPHA = 2;
d.TEXTUREFORMAT_RGB = 4;
d.TEXTUREFORMAT_RGBA = 5;
d.TEXTUREFORMAT_RED = 6;
d.TEXTUREFORMAT_R = 6;
d.TEXTUREFORMAT_R16_UNORM = 33322;
d.TEXTUREFORMAT_RG16_UNORM = 33324;
d.TEXTUREFORMAT_RGB16_UNORM = 32852;
d.TEXTUREFORMAT_RGBA16_UNORM = 32859;
d.TEXTUREFORMAT_R16_SNORM = 36760;
d.TEXTUREFORMAT_RG16_SNORM = 36761;
d.TEXTUREFORMAT_RGB16_SNORM = 36762;
d.TEXTUREFORMAT_RGBA16_SNORM = 36763;
d.TEXTUREFORMAT_RG = 7;
d.TEXTUREFORMAT_RED_INTEGER = 8;
d.TEXTUREFORMAT_R_INTEGER = 8;
d.TEXTUREFORMAT_RG_INTEGER = 9;
d.TEXTUREFORMAT_RGB_INTEGER = 10;
d.TEXTUREFORMAT_RGBA_INTEGER = 11;
d.TEXTURETYPE_UNSIGNED_BYTE = 0;
d.TEXTURETYPE_UNSIGNED_INT = 0;
d.TEXTURETYPE_FLOAT = 1;
d.TEXTURETYPE_HALF_FLOAT = 2;
d.TEXTURETYPE_BYTE = 3;
d.TEXTURETYPE_SHORT = 4;
d.TEXTURETYPE_UNSIGNED_SHORT = 5;
d.TEXTURETYPE_INT = 6;
d.TEXTURETYPE_UNSIGNED_INTEGER = 7;
d.TEXTURETYPE_UNSIGNED_SHORT_4_4_4_4 = 8;
d.TEXTURETYPE_UNSIGNED_SHORT_5_5_5_1 = 9;
d.TEXTURETYPE_UNSIGNED_SHORT_5_6_5 = 10;
d.TEXTURETYPE_UNSIGNED_INT_2_10_10_10_REV = 11;
d.TEXTURETYPE_UNSIGNED_INT_24_8 = 12;
d.TEXTURETYPE_UNSIGNED_INT_10F_11F_11F_REV = 13;
d.TEXTURETYPE_UNSIGNED_INT_5_9_9_9_REV = 14;
d.TEXTURETYPE_FLOAT_32_UNSIGNED_INT_24_8_REV = 15;
d.TEXTURE_NEAREST_SAMPLINGMODE = 1;
d.TEXTURE_BILINEAR_SAMPLINGMODE = 2;
d.TEXTURE_TRILINEAR_SAMPLINGMODE = 3;
d.TEXTURE_NEAREST_NEAREST_MIPLINEAR = 8;
d.TEXTURE_LINEAR_LINEAR_MIPNEAREST = 11;
d.TEXTURE_LINEAR_LINEAR_MIPLINEAR = 3;
d.TEXTURE_NEAREST_NEAREST_MIPNEAREST = 4;
d.TEXTURE_NEAREST_LINEAR_MIPNEAREST = 5;
d.TEXTURE_NEAREST_LINEAR_MIPLINEAR = 6;
d.TEXTURE_NEAREST_LINEAR = 7;
d.TEXTURE_NEAREST_NEAREST = 1;
d.TEXTURE_LINEAR_NEAREST_MIPNEAREST = 9;
d.TEXTURE_LINEAR_NEAREST_MIPLINEAR = 10;
d.TEXTURE_LINEAR_LINEAR = 2;
d.TEXTURE_LINEAR_NEAREST = 12;
d.TEXTURE_EXPLICIT_MODE = 0;
d.TEXTURE_SPHERICAL_MODE = 1;
d.TEXTURE_PLANAR_MODE = 2;
d.TEXTURE_CUBIC_MODE = 3;
d.TEXTURE_PROJECTION_MODE = 4;
d.TEXTURE_SKYBOX_MODE = 5;
d.TEXTURE_INVCUBIC_MODE = 6;
d.TEXTURE_EQUIRECTANGULAR_MODE = 7;
d.TEXTURE_FIXED_EQUIRECTANGULAR_MODE = 8;
d.TEXTURE_FIXED_EQUIRECTANGULAR_MIRRORED_MODE = 9;
d.SCALEMODE_FLOOR = 1;
d.SCALEMODE_NEAREST = 2;
d.SCALEMODE_CEILING = 3;
class N {
  /**
   * Use this list to define the list of mesh you want to render.
   */
  get renderList() {
    return this._renderList;
  }
  set renderList(e) {
    this._renderList !== e && (this._unObserveRenderList && (this._unObserveRenderList(), this._unObserveRenderList = null), e && (this._unObserveRenderList = Ye(e, this._renderListHasChanged)), this._renderList = e);
  }
  /**
   * If true, the object renderer will render all objects in linear space (default: false)
   */
  get renderInLinearSpace() {
    return this._renderInLinearSpace;
  }
  set renderInLinearSpace(e) {
    e !== this._renderInLinearSpace && (this._renderInLinearSpace = e, this._scene.markAllMaterialsAsDirty(64));
  }
  /**
   * Friendly name of the object renderer
   */
  get name() {
    return this._name;
  }
  set name(e) {
    if (this._name === e || (this._name = e, !this._scene))
      return;
    const t = this._scene.getEngine();
    for (let r = 0; r < this._renderPassIds.length; ++r) {
      const s = this._renderPassIds[r];
      t._renderPassNames[s] = `${this._name}#${r}`;
    }
  }
  /**
   * Gets the render pass ids used by the object renderer.
   */
  get renderPassIds() {
    return this._renderPassIds;
  }
  /**
   * Gets the current value of the refreshId counter
   */
  get currentRefreshId() {
    return this._currentRefreshId;
  }
  /**
   * Sets a specific material to be used to render a mesh/a list of meshes with this object renderer
   * @param mesh mesh or array of meshes
   * @param material material or array of materials to use for this render pass. If undefined is passed, no specific material will be used but the regular material instead (mesh.material). It's possible to provide an array of materials to use a different material for each rendering pass.
   */
  setMaterialForRendering(e, t) {
    let r;
    Array.isArray(e) ? r = e : r = [e];
    for (let s = 0; s < r.length; ++s)
      for (let i = 0; i < this.options.numPasses; ++i)
        r[s].setMaterialForRenderPass(this._renderPassIds[i], t !== void 0 ? Array.isArray(t) ? t[i] : t : void 0);
  }
  /**
   * Instantiates an object renderer.
   * @param name The friendly name of the object renderer
   * @param scene The scene the renderer belongs to
   * @param options The options used to create the renderer (optional)
   */
  constructor(e, t, r) {
    this._unObserveRenderList = null, this._renderListHasChanged = (s, i) => {
      const a = this._renderList ? this._renderList.length : 0;
      (i === 0 && a > 0 || a === 0) && this._scene.meshes.forEach((o) => {
        o._markSubMeshesAsLightDirty();
      });
    }, this.particleSystemList = null, this.getCustomRenderList = null, this.renderParticles = !0, this.renderSprites = !1, this.forceLayerMaskCheck = !1, this._renderInLinearSpace = !1, this.onBeforeRenderObservable = new O(), this.onAfterRenderObservable = new O(), this.onBeforeRenderingManagerRenderObservable = new O(), this.onAfterRenderingManagerRenderObservable = new O(), this.onFastPathRenderObservable = new O(), this._currentRefreshId = -1, this._refreshRate = 1, this._currentApplyByPostProcessSetting = !1, this._currentSceneCamera = null, this.name = e, this._scene = t, this.renderList = [], this._renderPassIds = [], this.options = {
      numPasses: 1,
      doNotChangeAspectRatio: !0,
      ...r
    }, this._createRenderPassId(), this.renderPassId = this._renderPassIds[0], this._renderingManager = new qe(t), this._renderingManager._useSceneAutoClearSetup = !0;
  }
  _releaseRenderPassId() {
    const e = this._scene.getEngine();
    for (let t = 0; t < this.options.numPasses; ++t)
      e.releaseRenderPassId(this._renderPassIds[t]);
    this._renderPassIds.length = 0;
  }
  _createRenderPassId() {
    this._releaseRenderPassId();
    const e = this._scene.getEngine();
    for (let t = 0; t < this.options.numPasses; ++t)
      this._renderPassIds[t] = e.createRenderPassId(`${this.name}#${t}`);
  }
  /**
   * Resets the refresh counter of the renderer and start back from scratch.
   * Could be useful to re-render if it is setup to render only once.
   */
  resetRefreshCounter() {
    this._currentRefreshId = -1;
  }
  /**
   * Defines the refresh rate of the rendering or the rendering frequency.
   * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
   */
  get refreshRate() {
    return this._refreshRate;
  }
  set refreshRate(e) {
    this._refreshRate = e, this.resetRefreshCounter();
  }
  /**
   * Indicates if the renderer should render the current frame.
   * The output is based on the specified refresh rate.
   * @returns true if the renderer should render the current frame
   */
  shouldRender() {
    return this._currentRefreshId === -1 ? (this._currentRefreshId = 1, !0) : this.refreshRate === this._currentRefreshId ? (this._currentRefreshId = 1, !0) : (this._currentRefreshId++, !1);
  }
  /**
   * This function will check if the renderer is ready to render (textures are loaded, shaders are compiled)
   * @param viewportWidth defines the width of the viewport
   * @param viewportHeight defines the height of the viewport
   * @returns true if all required resources are ready
   */
  isReadyForRendering(e, t) {
    this.prepareRenderList(), this.initRender(e, t);
    const r = this._checkReadiness();
    return this.finishRender(), r;
  }
  /**
   * Makes sure the list of meshes is ready to be rendered
   * You should call this function before "initRender", but if you know the render list is ok, you may call "initRender" directly
   */
  prepareRenderList() {
    const e = this._scene;
    if (this._waitingRenderList) {
      if (!this.renderListPredicate) {
        this.renderList = [];
        for (let t = 0; t < this._waitingRenderList.length; t++) {
          const r = this._waitingRenderList[t], s = e.getMeshById(r);
          s && this.renderList.push(s);
        }
      }
      this._waitingRenderList = void 0;
    }
    if (this.renderListPredicate) {
      this.renderList ? this.renderList.length = 0 : this.renderList = [];
      const t = this._scene.meshes;
      for (let r = 0; r < t.length; r++) {
        const s = t[r];
        this.renderListPredicate(s) && this.renderList.push(s);
      }
    }
    this._currentApplyByPostProcessSetting = this._scene.imageProcessingConfiguration.applyByPostProcess, this._scene.imageProcessingConfiguration._applyByPostProcess = !!this._renderInLinearSpace;
  }
  /**
   * This method makes sure everything is setup before "render" can be called
   * @param viewportWidth Width of the viewport to render to
   * @param viewportHeight Height of the viewport to render to
   */
  initRender(e, t) {
    const r = this._scene.getEngine(), s = this.activeCamera ?? this._scene.activeCamera;
    this._currentSceneCamera = this._scene.activeCamera, s && (s !== this._scene.activeCamera && (this._scene.setTransformMatrix(s.getViewMatrix(), s.getProjectionMatrix(!0)), this._scene.activeCamera = s), r.setViewport(s.rigParent ? s.rigParent.viewport : s.viewport, e, t)), this._defaultRenderListPrepared = !1;
  }
  /**
   * This method must be called after the "render" call(s), to complete the rendering process.
   */
  finishRender() {
    const e = this._scene;
    e.imageProcessingConfiguration._applyByPostProcess = this._currentApplyByPostProcessSetting, e.activeCamera = this._currentSceneCamera, this._currentSceneCamera && (this.activeCamera && this.activeCamera !== e.activeCamera && e.setTransformMatrix(this._currentSceneCamera.getViewMatrix(), this._currentSceneCamera.getProjectionMatrix(!0)), e.getEngine().setViewport(this._currentSceneCamera.viewport)), e.resetCachedMaterial();
  }
  /**
   * Renders all the objects (meshes, particles systems, sprites) to the currently bound render target texture.
   * @param passIndex defines the pass index to use (default: 0)
   * @param skipOnAfterRenderObservable defines a flag to skip raising the onAfterRenderObservable
   */
  render(e = 0, t = !1) {
    const r = this._scene, s = r.getEngine(), i = s.currentRenderPassId;
    if (s.currentRenderPassId = this._renderPassIds[e], this.onBeforeRenderObservable.notifyObservers(e), s.snapshotRendering && s.snapshotRenderingMode === 1)
      this.onFastPathRenderObservable.notifyObservers(e);
    else {
      let o = null;
      const h = this.renderList ? this.renderList : r.getActiveMeshes().data, l = this.renderList ? this.renderList.length : r.getActiveMeshes().length;
      this.getCustomRenderList && (o = this.getCustomRenderList(e, h, l)), o ? this._prepareRenderingManager(o, o.length, this.forceLayerMaskCheck) : (this._defaultRenderListPrepared || (this._prepareRenderingManager(h, l, !this.renderList || this.forceLayerMaskCheck), this._defaultRenderListPrepared = !0), o = h), this.onBeforeRenderingManagerRenderObservable.notifyObservers(e), this._renderingManager.render(this.customRenderFunction, o, this.renderParticles, this.renderSprites), this.onAfterRenderingManagerRenderObservable.notifyObservers(e);
    }
    t || this.onAfterRenderObservable.notifyObservers(e), s.currentRenderPassId = i;
  }
  /** @internal */
  _checkReadiness() {
    const e = this._scene, t = e.getEngine(), r = t.currentRenderPassId;
    let s = !0;
    e.getViewMatrix() || e.updateTransformMatrix();
    const i = this.options.numPasses;
    for (let o = 0; o < i && s; o++) {
      let h = null;
      const l = this.renderList ? this.renderList : e.getActiveMeshes().data, _ = this.renderList ? this.renderList.length : e.getActiveMeshes().length;
      t.currentRenderPassId = this._renderPassIds[o], this.onBeforeRenderObservable.notifyObservers(o), this.getCustomRenderList && (h = this.getCustomRenderList(o, l, _)), h || (h = l), this.options.doNotChangeAspectRatio || e.updateTransformMatrix(!0);
      for (let u = 0; u < h.length && s; ++u) {
        const f = h[u];
        if (!(!f.isEnabled() || f.isBlocked || !f.isVisible || !f.subMeshes)) {
          if (this.customIsReadyFunction) {
            if (!this.customIsReadyFunction(f, this.refreshRate, !0)) {
              s = !1;
              continue;
            }
          } else if (!f.isReady(!0)) {
            s = !1;
            continue;
          }
        }
      }
      this.onAfterRenderObservable.notifyObservers(o), i > 1 && (e.incrementRenderId(), e.resetCachedMaterial());
    }
    const a = this.particleSystemList || e.particleSystems;
    for (const o of a)
      o.isReady() || (s = !1);
    return t.currentRenderPassId = r, s;
  }
  _prepareRenderingManager(e, t, r) {
    const s = this._scene, i = s.activeCamera, a = this.cameraForLOD ?? i;
    this._renderingManager.reset();
    const o = s.getRenderId(), h = s.getFrameId();
    for (let _ = 0; _ < t; _++) {
      const u = e[_];
      if (u && !u.isBlocked) {
        if (this.customIsReadyFunction) {
          if (!this.customIsReadyFunction(u, this.refreshRate, !1)) {
            this.resetRefreshCounter();
            continue;
          }
        } else if (!u.isReady(this.refreshRate === 0)) {
          this.resetRefreshCounter();
          continue;
        }
        let f = null;
        if (a) {
          const p = u._internalAbstractMeshDataInfo._currentLOD.get(a);
          !p || p[1] !== h ? (f = s.customLODSelector ? s.customLODSelector(u, a) : u.getLOD(a), p ? (p[0] = f, p[1] = h) : u._internalAbstractMeshDataInfo._currentLOD.set(a, [f, h])) : f = p[0];
        } else
          f = u;
        if (!f)
          continue;
        f !== u && f.billboardMode !== 0 && f.computeWorldMatrix(), f._preActivateForIntermediateRendering(o);
        let c;
        if (r && i ? c = (u.layerMask & i.layerMask) === 0 : c = !1, u.isEnabled() && u.isVisible && u.subMeshes && !c) {
          if (f !== u && f._activate(o, !0), u._activate(o, !0) && u.subMeshes.length) {
            u.isAnInstance ? u._internalAbstractMeshDataInfo._actAsRegularMesh && (f = u) : f._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = !1, f._internalAbstractMeshDataInfo._isActiveIntermediate = !0, s._prepareSkeleton(f);
            for (let p = 0; p < f.subMeshes.length; p++) {
              const m = f.subMeshes[p];
              this._renderingManager.dispatch(m, f);
            }
          }
          u._postActivate();
        }
      }
    }
    const l = this.particleSystemList || s.particleSystems;
    for (let _ = 0; _ < l.length; _++) {
      const u = l[_], f = u.emitter;
      !u.isStarted() || !f || f.position && !f.isEnabled() || this._renderingManager.dispatchParticles(u);
    }
  }
  /**
   * Overrides the default sort function applied in the rendering group to prepare the meshes.
   * This allowed control for front to back rendering or reversely depending of the special needs.
   *
   * @param renderingGroupId The rendering group id corresponding to its index
   * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
   * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
   * @param transparentSortCompareFn The transparent queue comparison function use to sort.
   */
  setRenderingOrder(e, t = null, r = null, s = null) {
    this._renderingManager.setRenderingOrder(e, t, r, s);
  }
  /**
   * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
   *
   * @param renderingGroupId The rendering group id corresponding to its index
   * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
   * @param depth Automatically clears depth between groups if true and autoClear is true.
   * @param stencil Automatically clears stencil between groups if true and autoClear is true.
   */
  setRenderingAutoClearDepthStencil(e, t, r = !0, s = !0) {
    this._renderingManager.setRenderingAutoClearDepthStencil(e, t, r, s), this._renderingManager._useSceneAutoClearSetup = !1;
  }
  /**
   * Clones the renderer.
   * @returns the cloned renderer
   */
  clone() {
    const e = new N(this.name, this._scene, this.options);
    return this.renderList && (e.renderList = this.renderList.slice(0)), e;
  }
  /**
   * Dispose the renderer and release its associated resources.
   */
  dispose() {
    const e = this.renderList ? this.renderList : this._scene.getActiveMeshes().data, t = this.renderList ? this.renderList.length : this._scene.getActiveMeshes().length;
    for (let r = 0; r < t; r++) {
      const s = e[r];
      s.getMaterialForRenderPass(this.renderPassId) !== void 0 && s.setMaterialForRenderPass(this.renderPassId, void 0);
    }
    this.onBeforeRenderObservable.clear(), this.onAfterRenderObservable.clear(), this.onBeforeRenderingManagerRenderObservable.clear(), this.onAfterRenderingManagerRenderObservable.clear(), this.onFastPathRenderObservable.clear(), this._releaseRenderPassId(), this.renderList = null;
  }
  /** @internal */
  _rebuild() {
    this.refreshRate === N.REFRESHRATE_RENDER_ONCE && (this.refreshRate = N.REFRESHRATE_RENDER_ONCE);
  }
  /**
   * Clear the info related to rendering groups preventing retention point in material dispose.
   */
  freeRenderingGroups() {
    this._renderingManager && this._renderingManager.freeRenderingGroups();
  }
}
N.REFRESHRATE_RENDER_ONCE = 0;
N.REFRESHRATE_RENDER_ONEVERYFRAME = 1;
N.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = 2;
Y.prototype.setDepthStencilTexture = function(n, e) {
  this._engine.setDepthStencilTexture(this._samplers[n], this._uniforms[n], e, n);
};
class Z extends j {
  /**
   * Use this predicate to dynamically define the list of mesh you want to render.
   * If set, the renderList property will be overwritten.
   */
  get renderListPredicate() {
    return this._objectRenderer.renderListPredicate;
  }
  set renderListPredicate(e) {
    this._objectRenderer.renderListPredicate = e;
  }
  /**
   * Use this list to define the list of mesh you want to render.
   */
  get renderList() {
    return this._objectRenderer.renderList;
  }
  set renderList(e) {
    this._objectRenderer.renderList = e;
  }
  /**
   * Define the list of particle systems to render in the texture. If not provided, will render all the particle systems of the scene.
   * Note that the particle systems are rendered only if renderParticles is set to true.
   */
  get particleSystemList() {
    return this._objectRenderer.particleSystemList;
  }
  set particleSystemList(e) {
    this._objectRenderer.particleSystemList = e;
  }
  /**
   * Use this function to overload the renderList array at rendering time.
   * Return null to render with the current renderList, else return the list of meshes to use for rendering.
   * For 2DArray RTT, layerOrFace is the index of the layer that is going to be rendered, else it is the faceIndex of
   * the cube (if the RTT is a cube, else layerOrFace=0).
   * The renderList passed to the function is the current render list (the one that will be used if the function returns null).
   * The length of this list is passed through renderListLength: don't use renderList.length directly because the array can
   * hold dummy elements!
   */
  get getCustomRenderList() {
    return this._objectRenderer.getCustomRenderList;
  }
  set getCustomRenderList(e) {
    this._objectRenderer.getCustomRenderList = e;
  }
  /**
   * Define if particles should be rendered in your texture (default: true).
   */
  get renderParticles() {
    return this._objectRenderer.renderParticles;
  }
  set renderParticles(e) {
    this._objectRenderer.renderParticles = e;
  }
  /**
   * Define if sprites should be rendered in your texture (default: false).
   */
  get renderSprites() {
    return this._objectRenderer.renderSprites;
  }
  set renderSprites(e) {
    this._objectRenderer.renderSprites = e;
  }
  /**
   * Force checking the layerMask property even if a custom list of meshes is provided (ie. if renderList is not undefined) (default: false).
   */
  get forceLayerMaskCheck() {
    return this._objectRenderer.forceLayerMaskCheck;
  }
  set forceLayerMaskCheck(e) {
    this._objectRenderer.forceLayerMaskCheck = e;
  }
  /**
   * Define the camera used to render the texture.
   */
  get activeCamera() {
    return this._objectRenderer.activeCamera;
  }
  set activeCamera(e) {
    this._objectRenderer.activeCamera = e;
  }
  /**
   * Define the camera used to calculate the LOD of the objects.
   * If not defined, activeCamera will be used. If not defined nor activeCamera, scene's active camera will be used.
   */
  get cameraForLOD() {
    return this._objectRenderer.cameraForLOD;
  }
  set cameraForLOD(e) {
    this._objectRenderer.cameraForLOD = e;
  }
  /**
   * If true, all objects will be rendered in linear space (default: false)
   */
  get renderInLinearSpace() {
    return this._objectRenderer.renderInLinearSpace;
  }
  set renderInLinearSpace(e) {
    this._objectRenderer.renderInLinearSpace = e;
  }
  /**
   * Override the mesh isReady function with your own one.
   */
  get customIsReadyFunction() {
    return this._objectRenderer.customIsReadyFunction;
  }
  set customIsReadyFunction(e) {
    this._objectRenderer.customIsReadyFunction = e;
  }
  /**
   * Override the render function of the texture with your own one.
   */
  get customRenderFunction() {
    return this._objectRenderer.customRenderFunction;
  }
  set customRenderFunction(e) {
    this._objectRenderer.customRenderFunction = e;
  }
  /**
   * Post-processes for this render target
   */
  get postProcesses() {
    return this._postProcesses;
  }
  get _prePassEnabled() {
    return !!this._prePassRenderTarget && this._prePassRenderTarget.enabled;
  }
  /**
   * Set a after unbind callback in the texture.
   * This has been kept for backward compatibility and use of onAfterUnbindObservable is recommended.
   */
  set onAfterUnbind(e) {
    this._onAfterUnbindObserver && this.onAfterUnbindObservable.remove(this._onAfterUnbindObserver), this._onAfterUnbindObserver = this.onAfterUnbindObservable.add(e);
  }
  /**
   * An event triggered before rendering the texture
   */
  get onBeforeRenderObservable() {
    return this._objectRenderer.onBeforeRenderObservable;
  }
  /**
   * Set a before render callback in the texture.
   * This has been kept for backward compatibility and use of onBeforeRenderObservable is recommended.
   */
  set onBeforeRender(e) {
    this._onBeforeRenderObserver && this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver), this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(e);
  }
  /**
   * An event triggered after rendering the texture
   */
  get onAfterRenderObservable() {
    return this._objectRenderer.onAfterRenderObservable;
  }
  /**
   * Set a after render callback in the texture.
   * This has been kept for backward compatibility and use of onAfterRenderObservable is recommended.
   */
  set onAfterRender(e) {
    this._onAfterRenderObserver && this.onAfterRenderObservable.remove(this._onAfterRenderObserver), this._onAfterRenderObserver = this.onAfterRenderObservable.add(e);
  }
  /**
   * Set a clear callback in the texture.
   * This has been kept for backward compatibility and use of onClearObservable is recommended.
   */
  set onClear(e) {
    this._onClearObserver && this.onClearObservable.remove(this._onClearObserver), this._onClearObserver = this.onClearObservable.add(e);
  }
  /** @internal */
  get _waitingRenderList() {
    return this._objectRenderer._waitingRenderList;
  }
  /** @internal */
  set _waitingRenderList(e) {
    this._objectRenderer._waitingRenderList = e;
  }
  /**
   * Current render pass id of the render target texture. Note it can change over the rendering as there's a separate id for each face of a cube / each layer of an array layer!
   */
  get renderPassId() {
    return this._objectRenderer.renderPassId;
  }
  /**
   * Gets the render pass ids used by the render target texture. For a single render target the array length will be 1, for a cube texture it will be 6 and for
   * a 2D texture array it will return an array of ids the size of the 2D texture array
   */
  get renderPassIds() {
    return this._objectRenderer.renderPassIds;
  }
  /**
   * Gets the current value of the refreshId counter
   */
  get currentRefreshId() {
    return this._objectRenderer.currentRefreshId;
  }
  /**
   * Sets a specific material to be used to render a mesh/a list of meshes in this render target texture
   * @param mesh mesh or array of meshes
   * @param material material or array of materials to use for this render pass. If undefined is passed, no specific material will be used but the regular material instead (mesh.material). It's possible to provide an array of materials to use a different material for each rendering in the case of a cube texture (6 rendering) and a 2D texture array (as many rendering as the length of the array)
   */
  setMaterialForRendering(e, t) {
    this._objectRenderer.setMaterialForRendering(e, t);
  }
  /**
   * Define if the texture has multiple draw buffers or if false a single draw buffer.
   */
  get isMulti() {
    var e;
    return ((e = this._renderTarget) == null ? void 0 : e.isMulti) ?? !1;
  }
  /**
   * Gets render target creation options that were used.
   */
  get renderTargetOptions() {
    return this._renderTargetOptions;
  }
  /**
   * Gets the render target wrapper associated with this render target
   */
  get renderTarget() {
    return this._renderTarget;
  }
  _onRatioRescale() {
    this._sizeRatio && this.resize(this._initialSizeParameter);
  }
  /**
   * Gets or sets the size of the bounding box associated with the texture (when in cube mode)
   * When defined, the cubemap will switch to local mode
   * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
   * @example https://www.babylonjs-playground.com/#RNASML
   */
  set boundingBoxSize(e) {
    if (this._boundingBoxSize && this._boundingBoxSize.equals(e))
      return;
    this._boundingBoxSize = e;
    const t = this.getScene();
    t && t.markAllMaterialsAsDirty(1);
  }
  get boundingBoxSize() {
    return this._boundingBoxSize;
  }
  /**
   * In case the RTT has been created with a depth texture, get the associated
   * depth texture.
   * Otherwise, return null.
   */
  get depthStencilTexture() {
    var e;
    return ((e = this._renderTarget) == null ? void 0 : e._depthStencilTexture) ?? null;
  }
  /** @internal */
  constructor(e, t, r, s = !1, i = !0, a = 0, o = !1, h = j.TRILINEAR_SAMPLINGMODE, l = !0, _ = !1, u = !1, f = 5, c = !1, p, m, E = !1, T = !1) {
    let g, I = !0, F;
    if (typeof s == "object") {
      const A = s;
      s = !!A.generateMipMaps, i = A.doNotChangeAspectRatio ?? !0, a = A.type ?? 0, o = !!A.isCube, h = A.samplingMode ?? j.TRILINEAR_SAMPLINGMODE, l = A.generateDepthBuffer ?? !0, _ = !!A.generateStencilBuffer, u = !!A.isMulti, f = A.format ?? 5, c = !!A.delayAllocation, p = A.samples, m = A.creationFlags, E = !!A.noColorAttachment, T = !!A.useSRGBBuffer, g = A.colorAttachment, I = A.gammaSpace ?? I, F = A.existingObjectRenderer;
    }
    if (super(null, r, !s, void 0, h, void 0, void 0, void 0, void 0, f), this.ignoreCameraViewport = !1, this.onBeforeBindObservable = new O(), this.onAfterUnbindObservable = new O(), this.onClearObservable = new O(), this.onResizeObservable = new O(), this._cleared = !1, this.skipInitialClear = !1, this._samples = 1, this._canRescale = !0, this._renderTarget = null, this._dontDisposeObjectRenderer = !1, this.boundingBoxPosition = R.Zero(), this._disableEngineStages = !1, this._dumpToolsLoading = !1, r = this.getScene(), !r)
      return;
    const P = this.getScene().getEngine();
    this._gammaSpace = I, this._coordinatesMode = j.PROJECTION_MODE, this.name = e, this.isRenderTarget = !0, this._initialSizeParameter = t, this._dontDisposeObjectRenderer = !!F, this._processSizeParameter(t), this._objectRenderer = F ?? new N(e, r, {
      numPasses: o ? 6 : this.getRenderLayers() || 1,
      doNotChangeAspectRatio: i
    }), this._onBeforeRenderingManagerRenderObserver = this._objectRenderer.onBeforeRenderingManagerRenderObservable.add(() => {
      if (!this._disableEngineStages)
        for (const A of this._scene._beforeRenderTargetClearStage)
          A.action(this, this._currentFaceIndex, this._currentLayer);
      if (this.onClearObservable.hasObservers() ? this.onClearObservable.notifyObservers(P) : this.skipInitialClear || P.clear(this.clearColor || this._scene.clearColor, !0, !0, !0), this._doNotChangeAspectRatio || this._scene.updateTransformMatrix(!0), !this._disableEngineStages)
        for (const A of this._scene._beforeRenderTargetDrawStage)
          A.action(this, this._currentFaceIndex, this._currentLayer);
    }), this._onAfterRenderingManagerRenderObserver = this._objectRenderer.onAfterRenderingManagerRenderObservable.add(() => {
      var C;
      if (!this._disableEngineStages)
        for (const x of this._scene._afterRenderTargetDrawStage)
          x.action(this, this._currentFaceIndex, this._currentLayer);
      const A = ((C = this._texture) == null ? void 0 : C.generateMipMaps) ?? !1;
      if (this._texture && (this._texture.generateMipMaps = !1), this._postProcessManager ? this._postProcessManager._finalizeFrame(!1, this._renderTarget ?? void 0, this._currentFaceIndex, this._postProcesses, this.ignoreCameraViewport) : this._currentUseCameraPostProcess && this._scene.postProcessManager._finalizeFrame(!1, this._renderTarget ?? void 0, this._currentFaceIndex), !this._disableEngineStages)
        for (const x of this._scene._afterRenderTargetPostProcessStage)
          x.action(this, this._currentFaceIndex, this._currentLayer);
      this._texture && (this._texture.generateMipMaps = A), this._doNotChangeAspectRatio || this._scene.updateTransformMatrix(!0), this._currentDumpForDebug && (this._dumpTools ? this._dumpTools.DumpFramebuffer(this.getRenderWidth(), this.getRenderHeight(), P) : B.Error("dumpTools module is still being loaded. To speed up the process import dump tools directly in your project"));
    }), this._onFastPathRenderObserver = this._objectRenderer.onFastPathRenderObservable.add(() => {
      this.onClearObservable.hasObservers() ? this.onClearObservable.notifyObservers(P) : this.skipInitialClear || P.clear(this.clearColor || this._scene.clearColor, !0, !0, !0);
    }), this._resizeObserver = P.onResizeObservable.add(() => {
    }), this._generateMipMaps = !!s, this._doNotChangeAspectRatio = i, !u && (this._renderTargetOptions = {
      generateMipMaps: s,
      type: a,
      format: this._format ?? void 0,
      samplingMode: this.samplingMode,
      generateDepthBuffer: l,
      generateStencilBuffer: _,
      samples: p,
      creationFlags: m,
      noColorAttachment: E,
      useSRGBBuffer: T,
      colorAttachment: g,
      label: this.name
    }, this.samplingMode === j.NEAREST_SAMPLINGMODE && (this.wrapU = j.CLAMP_ADDRESSMODE, this.wrapV = j.CLAMP_ADDRESSMODE), c || (o ? (this._renderTarget = r.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions), this.coordinatesMode = j.INVCUBIC_MODE, this._textureMatrix = ue.Identity()) : this._renderTarget = r.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions), this._texture = this._renderTarget.texture, p !== void 0 && (this.samples = p)));
  }
  /**
   * Creates a depth stencil texture.
   * This is only available in WebGL 2 or with the depth texture extension available.
   * @param comparisonFunction Specifies the comparison function to set on the texture. If 0 or undefined, the texture is not in comparison mode (default: 0)
   * @param bilinearFiltering Specifies whether or not bilinear filtering is enable on the texture (default: true)
   * @param generateStencil Specifies whether or not a stencil should be allocated in the texture (default: false)
   * @param samples sample count of the depth/stencil texture (default: 1)
   * @param format format of the depth texture (default: 14)
   * @param label defines the label of the texture (for debugging purpose)
   */
  createDepthStencilTexture(e = 0, t = !0, r = !1, s = 1, i = 14, a) {
    var o;
    (o = this._renderTarget) == null || o.createDepthStencilTexture(e, t, r, s, i, a);
  }
  _processSizeParameter(e) {
    if (e.ratio) {
      this._sizeRatio = e.ratio;
      const t = this._getEngine();
      this._size = {
        width: this._bestReflectionRenderTargetDimension(t.getRenderWidth(), this._sizeRatio),
        height: this._bestReflectionRenderTargetDimension(t.getRenderHeight(), this._sizeRatio)
      };
    } else
      this._size = e;
  }
  /**
   * Define the number of samples to use in case of MSAA.
   * It defaults to one meaning no MSAA has been enabled.
   */
  get samples() {
    var e;
    return ((e = this._renderTarget) == null ? void 0 : e.samples) ?? this._samples;
  }
  set samples(e) {
    this._renderTarget && (this._samples = this._renderTarget.setSamples(e));
  }
  /**
   * Adds a post process to the render target rendering passes.
   * @param postProcess define the post process to add
   */
  addPostProcess(e) {
    if (!this._postProcessManager) {
      const t = this.getScene();
      if (!t)
        return;
      this._postProcessManager = new Ze(t), this._postProcesses = new Array();
    }
    this._postProcesses.push(e), this._postProcesses[0].autoClear = !1;
  }
  /**
   * Clear all the post processes attached to the render target
   * @param dispose define if the cleared post processes should also be disposed (false by default)
   */
  clearPostProcesses(e = !1) {
    if (this._postProcesses) {
      if (e)
        for (const t of this._postProcesses)
          t.dispose();
      this._postProcesses = [];
    }
  }
  /**
   * Remove one of the post process from the list of attached post processes to the texture
   * @param postProcess define the post process to remove from the list
   */
  removePostProcess(e) {
    if (!this._postProcesses)
      return;
    const t = this._postProcesses.indexOf(e);
    t !== -1 && (this._postProcesses.splice(t, 1), this._postProcesses.length > 0 && (this._postProcesses[0].autoClear = !1));
  }
  /**
   * Resets the refresh counter of the texture and start bak from scratch.
   * Could be useful to regenerate the texture if it is setup to render only once.
   */
  resetRefreshCounter() {
    this._objectRenderer.resetRefreshCounter();
  }
  /**
   * Define the refresh rate of the texture or the rendering frequency.
   * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
   */
  get refreshRate() {
    return this._objectRenderer.refreshRate;
  }
  set refreshRate(e) {
    this._objectRenderer.refreshRate = e;
  }
  /** @internal */
  _shouldRender() {
    return this._objectRenderer.shouldRender();
  }
  /**
   * Gets the actual render size of the texture.
   * @returns the width of the render size
   */
  getRenderSize() {
    return this.getRenderWidth();
  }
  /**
   * Gets the actual render width of the texture.
   * @returns the width of the render size
   */
  getRenderWidth() {
    return this._size.width ? this._size.width : this._size;
  }
  /**
   * Gets the actual render height of the texture.
   * @returns the height of the render size
   */
  getRenderHeight() {
    return this._size.width ? this._size.height : this._size;
  }
  /**
   * Gets the actual number of layers of the texture or, in the case of a 3D texture, return the depth.
   * @returns the number of layers
   */
  getRenderLayers() {
    const e = this._size.layers;
    if (e)
      return e;
    const t = this._size.depth;
    return t || 0;
  }
  /**
   * Don't allow this render target texture to rescale. Mainly used to prevent rescaling by the scene optimizer.
   */
  disableRescaling() {
    this._canRescale = !1;
  }
  /**
   * Get if the texture can be rescaled or not.
   */
  get canRescale() {
    return this._canRescale;
  }
  /**
   * Resize the texture using a ratio.
   * @param ratio the ratio to apply to the texture size in order to compute the new target size
   */
  scale(e) {
    const t = Math.max(1, this.getRenderSize() * e);
    this.resize(t);
  }
  /**
   * Get the texture reflection matrix used to rotate/transform the reflection.
   * @returns the reflection matrix
   */
  getReflectionTextureMatrix() {
    return this.isCube ? this._textureMatrix : super.getReflectionTextureMatrix();
  }
  /**
   * Resize the texture to a new desired size.
   * Be careful as it will recreate all the data in the new texture.
   * @param size Define the new size. It can be:
   *   - a number for squared texture,
   *   - an object containing { width: number, height: number }
   *   - or an object containing a ratio { ratio: number }
   */
  resize(e) {
    var s;
    const t = this.isCube;
    (s = this._renderTarget) == null || s.dispose(), this._renderTarget = null;
    const r = this.getScene();
    r && (this._processSizeParameter(e), t ? this._renderTarget = r.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions) : this._renderTarget = r.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions), this._texture = this._renderTarget.texture, this._renderTargetOptions.samples !== void 0 && (this.samples = this._renderTargetOptions.samples), this.onResizeObservable.hasObservers() && this.onResizeObservable.notifyObservers(this));
  }
  /**
   * Renders all the objects from the render list into the texture.
   * @param useCameraPostProcess Define if camera post processes should be used during the rendering
   * @param dumpForDebug Define if the rendering result should be dumped (copied) for debugging purpose
   */
  render(e = !1, t = !1) {
    this._render(e, t);
  }
  /**
   * This function will check if the render target texture can be rendered (textures are loaded, shaders are compiled)
   * @returns true if all required resources are ready
   */
  isReadyForRendering() {
    this._dumpToolsLoading || (this._dumpToolsLoading = !0, import("./dumpTools-d75efd6d.js").then((t) => this._dumpTools = t)), this._objectRenderer.prepareRenderList(), this.onBeforeBindObservable.notifyObservers(this), this._objectRenderer.initRender(this.getRenderWidth(), this.getRenderHeight());
    const e = this._objectRenderer._checkReadiness();
    return this.onAfterUnbindObservable.notifyObservers(this), this._objectRenderer.finishRender(), e;
  }
  _render(e = !1, t = !1) {
    const r = this.getScene();
    if (r) {
      if (this.useCameraPostProcesses !== void 0 && (e = this.useCameraPostProcesses), this._objectRenderer.prepareRenderList(), this.onBeforeBindObservable.notifyObservers(this), this._objectRenderer.initRender(this.getRenderWidth(), this.getRenderHeight()), (this.is2DArray || this.is3D) && !this.isMulti)
        for (let s = 0; s < this.getRenderLayers(); s++)
          this._renderToTarget(0, e, t, s), r.incrementRenderId(), r.resetCachedMaterial();
      else if (this.isCube && !this.isMulti)
        for (let s = 0; s < 6; s++)
          this._renderToTarget(s, e, t), r.incrementRenderId(), r.resetCachedMaterial();
      else
        this._renderToTarget(0, e, t);
      this.onAfterUnbindObservable.notifyObservers(this), this._objectRenderer.finishRender();
    }
  }
  _bestReflectionRenderTargetDimension(e, t) {
    const s = e * t, i = Qe(s + 128 * 128 / (128 + s));
    return Math.min(Ke(e), i);
  }
  /**
   * @internal
   * @param faceIndex face index to bind to if this is a cubetexture
   * @param layer defines the index of the texture to bind in the array
   */
  _bindFrameBuffer(e = 0, t = 0) {
    const r = this.getScene();
    if (!r)
      return;
    const s = r.getEngine();
    this._renderTarget && s.bindFramebuffer(this._renderTarget, this.isCube ? e : void 0, void 0, void 0, this.ignoreCameraViewport, 0, t);
  }
  _unbindFrameBuffer(e, t) {
    this._renderTarget && e.unBindFramebuffer(this._renderTarget, this.isCube, () => {
      this.onAfterRenderObservable.notifyObservers(t);
    });
  }
  /**
   * @internal
   */
  _prepareFrame(e, t, r, s) {
    this._postProcessManager ? this._prePassEnabled || this._postProcessManager._prepareFrame(this._texture, this._postProcesses) : (!s || !e.postProcessManager._prepareFrame(this._texture)) && this._bindFrameBuffer(t, r);
  }
  _renderToTarget(e, t, r, s = 0) {
    var o, h;
    const i = this.getScene();
    if (!i)
      return;
    const a = i.getEngine();
    this._currentFaceIndex = e, this._currentLayer = s, this._currentUseCameraPostProcess = t, this._currentDumpForDebug = r, this._prepareFrame(i, e, s, t), (o = a._debugPushGroup) == null || o.call(a, `render to face #${e} layer #${s}`, 2), this._objectRenderer.render(e + s, !0), (h = a._debugPopGroup) == null || h.call(a, 2), this._unbindFrameBuffer(a, e), this._texture && this.isCube && e === 5 && a.generateMipMapsForCubemap(this._texture, !0);
  }
  /**
   * Overrides the default sort function applied in the rendering group to prepare the meshes.
   * This allowed control for front to back rendering or reversely depending of the special needs.
   *
   * @param renderingGroupId The rendering group id corresponding to its index
   * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
   * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
   * @param transparentSortCompareFn The transparent queue comparison function use to sort.
   */
  setRenderingOrder(e, t = null, r = null, s = null) {
    this._objectRenderer.setRenderingOrder(e, t, r, s);
  }
  /**
   * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
   *
   * @param renderingGroupId The rendering group id corresponding to its index
   * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
   */
  setRenderingAutoClearDepthStencil(e, t) {
    this._objectRenderer.setRenderingAutoClearDepthStencil(e, t);
  }
  /**
   * Clones the texture.
   * @returns the cloned texture
   */
  clone() {
    const e = this.getSize(), t = new Z(this.name, e, this.getScene(), this._renderTargetOptions.generateMipMaps, this._doNotChangeAspectRatio, this._renderTargetOptions.type, this.isCube, this._renderTargetOptions.samplingMode, this._renderTargetOptions.generateDepthBuffer, this._renderTargetOptions.generateStencilBuffer, void 0, this._renderTargetOptions.format, void 0, this._renderTargetOptions.samples);
    return t.hasAlpha = this.hasAlpha, t.level = this.level, t.coordinatesMode = this.coordinatesMode, this.renderList && (t.renderList = this.renderList.slice(0)), t;
  }
  /**
   * Serialize the texture to a JSON representation we can easily use in the respective Parse function.
   * @returns The JSON representation of the texture
   */
  serialize() {
    if (!this.name)
      return null;
    const e = super.serialize();
    if (e.renderTargetSize = this.getRenderSize(), e.renderList = [], this.renderList)
      for (let t = 0; t < this.renderList.length; t++)
        e.renderList.push(this.renderList[t].id);
    return e;
  }
  /**
   *  This will remove the attached framebuffer objects. The texture will not be able to be used as render target anymore
   */
  disposeFramebufferObjects() {
    var e;
    (e = this._renderTarget) == null || e.dispose(!0);
  }
  /**
   * Release and destroy the underlying lower level texture aka internalTexture.
   */
  releaseInternalTexture() {
    var e;
    (e = this._renderTarget) == null || e.releaseTextures(), this._texture = null;
  }
  /**
   * Dispose the texture and release its associated resources.
   */
  dispose() {
    var r;
    this.onResizeObservable.clear(), this.onClearObservable.clear(), this.onAfterUnbindObservable.clear(), this.onBeforeBindObservable.clear(), this._postProcessManager && (this._postProcessManager.dispose(), this._postProcessManager = null), this._prePassRenderTarget && this._prePassRenderTarget.dispose(), this._objectRenderer.onBeforeRenderingManagerRenderObservable.remove(this._onBeforeRenderingManagerRenderObserver), this._objectRenderer.onAfterRenderingManagerRenderObservable.remove(this._onAfterRenderingManagerRenderObserver), this._objectRenderer.onFastPathRenderObservable.remove(this._onFastPathRenderObserver), this._dontDisposeObjectRenderer || this._objectRenderer.dispose(), this.clearPostProcesses(!0), this._resizeObserver && (this.getScene().getEngine().onResizeObservable.remove(this._resizeObserver), this._resizeObserver = null);
    const e = this.getScene();
    if (!e)
      return;
    let t = e.customRenderTargets.indexOf(this);
    t >= 0 && e.customRenderTargets.splice(t, 1);
    for (const s of e.cameras)
      t = s.customRenderTargets.indexOf(this), t >= 0 && s.customRenderTargets.splice(t, 1);
    (r = this._renderTarget) == null || r.dispose(), this._renderTarget = null, this._texture = null, super.dispose();
  }
  /** @internal */
  _rebuild() {
    this._objectRenderer._rebuild(), this._postProcessManager && this._postProcessManager._rebuild();
  }
  /**
   * Clear the info related to rendering groups preventing retention point in material dispose.
   */
  freeRenderingGroups() {
    this._objectRenderer.freeRenderingGroups();
  }
  /**
   * Gets the number of views the corresponding to the texture (eg. a MultiviewRenderTarget will have > 1)
   * @returns the view count
   */
  getViewCount() {
    return 1;
  }
}
Z.REFRESHRATE_RENDER_ONCE = N.REFRESHRATE_RENDER_ONCE;
Z.REFRESHRATE_RENDER_ONEVERYFRAME = N.REFRESHRATE_RENDER_ONEVERYFRAME;
Z.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = N.REFRESHRATE_RENDER_ONEVERYTWOFRAMES;
j._CreateRenderTargetTexture = (n, e, t, r, s) => new Z(n, e, t, r);
const ce = "postprocessVertexShader", Fe = `attribute vec2 position;uniform vec2 scale;varying vec2 vUV;const vec2 madd=vec2(0.5,0.5);
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
vUV=(position*madd+madd)*scale;gl_Position=vec4(position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;
de.ShadersStore[ce] || (de.ShadersStore[ce] = Fe);
const xt = { name: ce, shader: Fe }, Ie = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  postprocessVertexShader: xt
}, Symbol.toStringTag, { value: "Module" })), _e = {
  positions: [1, 1, -1, 1, -1, -1, 1, -1],
  indices: [0, 1, 2, 0, 2, 3]
};
class It {
  /**
   * Creates an effect renderer
   * @param engine the engine to use for rendering
   * @param options defines the options of the effect renderer
   */
  constructor(e, t = _e) {
    this._fullscreenViewport = new $e(0, 0, 1, 1);
    const r = t.positions ?? _e.positions, s = t.indices ?? _e.indices;
    this.engine = e, this._vertexBuffers = {
      [K.PositionKind]: new K(e, r, K.PositionKind, !1, !1, 2)
    }, this._indexBuffer = e.createIndexBuffer(s), this._onContextRestoredObserver = e.onContextRestoredObservable.add(() => {
      this._indexBuffer = e.createIndexBuffer(s);
      for (const i in this._vertexBuffers)
        this._vertexBuffers[i]._rebuild();
    });
  }
  /**
   * Sets the current viewport in normalized coordinates 0-1
   * @param viewport Defines the viewport to set (defaults to 0 0 1 1)
   */
  setViewport(e = this._fullscreenViewport) {
    this.engine.setViewport(e);
  }
  /**
   * Binds the embedded attributes buffer to the effect.
   * @param effect Defines the effect to bind the attributes for
   */
  bindBuffers(e) {
    this.engine.bindBuffers(this._vertexBuffers, this._indexBuffer, e);
  }
  /**
   * Sets the current effect wrapper to use during draw.
   * The effect needs to be ready before calling this api.
   * This also sets the default full screen position attribute.
   * @param effectWrapper Defines the effect to draw with
   */
  applyEffectWrapper(e) {
    this.engine.setState(!0), this.engine.depthCullingState.depthTest = !1, this.engine.stencilState.stencilTest = !1, this.engine.enableEffect(e.drawWrapper), this.bindBuffers(e.effect), e.onApplyObservable.notifyObservers({});
  }
  /**
   * Saves engine states
   */
  saveStates() {
    this._savedStateDepthTest = this.engine.depthCullingState.depthTest, this._savedStateStencilTest = this.engine.stencilState.stencilTest;
  }
  /**
   * Restores engine states
   */
  restoreStates() {
    this.engine.depthCullingState.depthTest = this._savedStateDepthTest, this.engine.stencilState.stencilTest = this._savedStateStencilTest;
  }
  /**
   * Draws a full screen quad.
   */
  draw() {
    this.engine.drawElementsType(0, 0, 6);
  }
  _isRenderTargetTexture(e) {
    return e.renderTarget !== void 0;
  }
  /**
   * renders one or more effects to a specified texture
   * @param effectWrapper the effect to renderer
   * @param outputTexture texture to draw to, if null it will render to the currently bound frame buffer
   */
  render(e, t = null) {
    if (!e.effect.isReady())
      return;
    this.saveStates(), this.setViewport();
    const r = t === null ? null : this._isRenderTargetTexture(t) ? t.renderTarget : t;
    r && this.engine.bindFramebuffer(r), this.applyEffectWrapper(e), this.draw(), r && this.engine.unBindFramebuffer(r), this.restoreStates();
  }
  /**
   * Disposes of the effect renderer
   */
  dispose() {
    const e = this._vertexBuffers[K.PositionKind];
    e && (e.dispose(), delete this._vertexBuffers[K.PositionKind]), this._indexBuffer && this.engine._releaseBuffer(this._indexBuffer), this._onContextRestoredObserver && (this.engine.onContextRestoredObservable.remove(this._onContextRestoredObserver), this._onContextRestoredObserver = null);
  }
}
class v {
  /**
   * Registers a shader code processing with an effect wrapper name.
   * @param effectWrapperName name of the effect wrapper. Use null for the fallback shader code processing. This is the shader code processing that will be used in case no specific shader code processing has been associated to an effect wrapper name
   * @param customShaderCodeProcessing shader code processing to associate to the effect wrapper name
   */
  static RegisterShaderCodeProcessing(e, t) {
    if (!t) {
      delete v._CustomShaderCodeProcessing[e ?? ""];
      return;
    }
    v._CustomShaderCodeProcessing[e ?? ""] = t;
  }
  static _GetShaderCodeProcessing(e) {
    return v._CustomShaderCodeProcessing[e] ?? v._CustomShaderCodeProcessing[""];
  }
  /**
   * Gets or sets the name of the effect wrapper
   */
  get name() {
    return this.options.name;
  }
  set name(e) {
    this.options.name = e;
  }
  /**
   * Get a value indicating if the effect is ready to be used
   * @returns true if the post-process is ready (shader is compiled)
   */
  isReady() {
    var e;
    return ((e = this._drawWrapper.effect) == null ? void 0 : e.isReady()) ?? !1;
  }
  /**
   * Get the draw wrapper associated with the effect wrapper
   * @returns the draw wrapper associated with the effect wrapper
   */
  get drawWrapper() {
    return this._drawWrapper;
  }
  /**
   * The underlying effect
   */
  get effect() {
    return this._drawWrapper.effect;
  }
  set effect(e) {
    this._drawWrapper.effect = e;
  }
  /**
   * Creates an effect to be rendered
   * @param creationOptions options to create the effect
   */
  constructor(e) {
    this.alphaMode = 0, this.onEffectCreatedObservable = new O(void 0, !0), this.onApplyObservable = new O(), this._shadersLoaded = !1, this._webGPUReady = !1, this._importPromises = [], this.options = {
      ...e,
      name: e.name || "effectWrapper",
      engine: e.engine,
      uniforms: e.uniforms || e.uniformNames || [],
      uniformNames: void 0,
      samplers: e.samplers || e.samplerNames || [],
      samplerNames: void 0,
      attributeNames: e.attributeNames || ["position"],
      uniformBuffers: e.uniformBuffers || [],
      defines: e.defines || "",
      useShaderStore: e.useShaderStore || !1,
      vertexUrl: e.vertexUrl || e.vertexShader || "postprocess",
      vertexShader: void 0,
      fragmentShader: e.fragmentShader || "pass",
      indexParameters: e.indexParameters,
      blockCompilation: e.blockCompilation || !1,
      shaderLanguage: e.shaderLanguage || 0,
      onCompiled: e.onCompiled || void 0,
      extraInitializations: e.extraInitializations || void 0,
      extraInitializationsAsync: e.extraInitializationsAsync || void 0,
      useAsPostProcess: e.useAsPostProcess ?? !1
    }, this.options.uniformNames = this.options.uniforms, this.options.samplerNames = this.options.samplers, this.options.vertexShader = this.options.vertexUrl, this.options.useAsPostProcess && (this.options.samplers.indexOf("textureSampler") === -1 && this.options.samplers.push("textureSampler"), this.options.uniforms.indexOf("scale") === -1 && this.options.uniforms.push("scale")), e.vertexUrl || e.vertexShader ? this._shaderPath = {
      vertexSource: this.options.vertexShader
    } : (this.options.useAsPostProcess || (this.options.uniforms.push("scale"), this.onApplyObservable.add(() => {
      this.effect.setFloat2("scale", 1, 1);
    })), this._shaderPath = {
      vertex: this.options.vertexShader
    }), this._shaderPath.fragmentSource = this.options.fragmentShader, this._shaderPath.spectorName = this.options.name, this.options.useShaderStore && (this._shaderPath.fragment = this._shaderPath.fragmentSource, this._shaderPath.vertex || (this._shaderPath.vertex = this._shaderPath.vertexSource), delete this._shaderPath.fragmentSource, delete this._shaderPath.vertexSource), this.onApplyObservable.add(() => {
      this.bind();
    }), this.options.useShaderStore || (this._onContextRestoredObserver = this.options.engine.onContextRestoredObservable.add(() => {
      this.effect._pipelineContext = null, this.effect._prepareEffect();
    })), this._drawWrapper = new Je(this.options.engine), this._webGPUReady = this.options.shaderLanguage === 1;
    const t = Array.isArray(this.options.defines) ? this.options.defines.join(`
`) : this.options.defines;
    this._postConstructor(this.options.blockCompilation, t, this.options.extraInitializations);
  }
  _gatherImports(e = !1, t) {
    this.options.useAsPostProcess && (e && this._webGPUReady ? t.push(Promise.all([import("./postprocess.vertex-7b338e9e.js")])) : t.push(Promise.all([Promise.resolve().then(() => Ie)])));
  }
  /** @internal */
  _postConstructor(e, t = null, r, s) {
    this._importPromises.length = 0, s && this._importPromises.push(...s);
    const i = this.options.engine.isWebGPU && !v.ForceGLSL;
    this._gatherImports(i, this._importPromises), r !== void 0 && r(i, this._importPromises), i && this._webGPUReady && (this.options.shaderLanguage = 1), e || this.updateEffect(t);
  }
  /**
   * Updates the effect with the current effect wrapper compile time values and recompiles the shader.
   * @param defines Define statements that should be added at the beginning of the shader. (default: null)
   * @param uniforms Set of uniform variables that will be passed to the shader. (default: null)
   * @param samplers Set of Texture2D variables that will be passed to the shader. (default: null)
   * @param indexParameters The index parameters to be used for babylons include syntax "#include<kernelBlurVaryingDeclaration>[0..varyingCount]". (default: undefined) See usage in babylon.blurPostProcess.ts and kernelBlur.vertex.fx
   * @param onCompiled Called when the shader has been compiled.
   * @param onError Called if there is an error when compiling a shader.
   * @param vertexUrl The url of the vertex shader to be used (default: the one given at construction time)
   * @param fragmentUrl The url of the fragment shader to be used (default: the one given at construction time)
   */
  updateEffect(e = null, t = null, r = null, s, i, a, o, h) {
    const l = v._GetShaderCodeProcessing(this.name);
    if (l != null && l.defineCustomBindings) {
      const f = (t == null ? void 0 : t.slice()) ?? [];
      f.push(...this.options.uniforms);
      const c = (r == null ? void 0 : r.slice()) ?? [];
      c.push(...this.options.samplers), e = l.defineCustomBindings(this.name, e, f, c), t = f, r = c;
    }
    this.options.defines = e || "";
    const _ = this._shadersLoaded || this._importPromises.length === 0 ? void 0 : async () => {
      await Promise.all(this._importPromises), this._shadersLoaded = !0;
    };
    let u;
    this.options.extraInitializationsAsync ? u = async () => {
      _ == null || _(), await this.options.extraInitializationsAsync();
    } : u = _, this.options.useShaderStore ? this._drawWrapper.effect = this.options.engine.createEffect({ vertex: o ?? this._shaderPath.vertex, fragment: h ?? this._shaderPath.fragment }, {
      attributes: this.options.attributeNames,
      uniformsNames: t || this.options.uniforms,
      uniformBuffersNames: this.options.uniformBuffers,
      samplers: r || this.options.samplers,
      defines: e !== null ? e : "",
      fallbacks: null,
      onCompiled: i ?? this.options.onCompiled,
      onError: a ?? null,
      indexParameters: s || this.options.indexParameters,
      processCodeAfterIncludes: l != null && l.processCodeAfterIncludes ? (f, c) => l.processCodeAfterIncludes(this.name, f, c) : null,
      processFinalCode: l != null && l.processFinalCode ? (f, c) => l.processFinalCode(this.name, f, c) : null,
      shaderLanguage: this.options.shaderLanguage,
      extraInitializationsAsync: u
    }, this.options.engine) : this._drawWrapper.effect = new Y(this._shaderPath, this.options.attributeNames, t || this.options.uniforms, r || this.options.samplerNames, this.options.engine, e, void 0, i || this.options.onCompiled, void 0, void 0, void 0, this.options.shaderLanguage, u), this.onEffectCreatedObservable.notifyObservers(this._drawWrapper.effect);
  }
  /**
   * Binds the data to the effect.
   */
  bind() {
    var e, t;
    this.options.useAsPostProcess && (this.options.engine.setAlphaMode(this.alphaMode), this.drawWrapper.effect.setFloat2("scale", 1, 1)), (t = (e = v._GetShaderCodeProcessing(this.name)) == null ? void 0 : e.bindCustomBindings) == null || t.call(e, this.name, this._drawWrapper.effect);
  }
  /**
   * Disposes of the effect wrapper
   * @param _ignored kept for backward compatibility
   */
  dispose(e = !1) {
    this._onContextRestoredObserver && (this.effect.getEngine().onContextRestoredObservable.remove(this._onContextRestoredObserver), this._onContextRestoredObserver = null), this.onEffectCreatedObservable.clear(), this._drawWrapper.dispose(!0);
  }
}
v.ForceGLSL = !1;
v._CustomShaderCodeProcessing = {};
b.prototype.setTextureFromPostProcess = function(n, e, t) {
  let r = null;
  e && (e._forcedOutputTexture ? r = e._forcedOutputTexture : e._textures.data[e._currentRenderTextureInd] && (r = e._textures.data[e._currentRenderTextureInd])), this._bindTexture(n, (r == null ? void 0 : r.texture) ?? null, t);
};
b.prototype.setTextureFromPostProcessOutput = function(n, e, t) {
  var r;
  this._bindTexture(n, ((r = e == null ? void 0 : e._outputTexture) == null ? void 0 : r.texture) ?? null, t);
};
Y.prototype.setTextureFromPostProcess = function(n, e) {
  this._engine.setTextureFromPostProcess(this._samplers[n], e, n);
};
Y.prototype.setTextureFromPostProcessOutput = function(n, e) {
  this._engine.setTextureFromPostProcessOutput(this._samplers[n], e, n);
};
class y {
  /**
   * Force all the postprocesses to compile to glsl even on WebGPU engines.
   * False by default. This is mostly meant for backward compatibility.
   */
  static get ForceGLSL() {
    return v.ForceGLSL;
  }
  static set ForceGLSL(e) {
    v.ForceGLSL = e;
  }
  /**
   * Registers a shader code processing with a post process name.
   * @param postProcessName name of the post process. Use null for the fallback shader code processing. This is the shader code processing that will be used in case no specific shader code processing has been associated to a post process name
   * @param customShaderCodeProcessing shader code processing to associate to the post process name
   */
  static RegisterShaderCodeProcessing(e, t) {
    v.RegisterShaderCodeProcessing(e, t);
  }
  /** Name of the PostProcess. */
  get name() {
    return this._effectWrapper.name;
  }
  set name(e) {
    this._effectWrapper.name = e;
  }
  /**
   * Type of alpha mode to use when performing the post process (default: Engine.ALPHA_DISABLE)
   */
  get alphaMode() {
    return this._effectWrapper.alphaMode;
  }
  set alphaMode(e) {
    this._effectWrapper.alphaMode = e;
  }
  /**
   * Number of sample textures (default: 1)
   */
  get samples() {
    return this._samples;
  }
  set samples(e) {
    this._samples = Math.min(e, this._engine.getCaps().maxMSAASamples), this._textures.forEach((t) => {
      t.setSamples(this._samples);
    });
  }
  /**
   * Gets the shader language type used to generate vertex and fragment source code.
   */
  get shaderLanguage() {
    return this._shaderLanguage;
  }
  /**
   * Returns the fragment url or shader name used in the post process.
   * @returns the fragment url or name in the shader store.
   */
  getEffectName() {
    return this._fragmentUrl;
  }
  /**
   * A function that is added to the onActivateObservable
   */
  set onActivate(e) {
    this._onActivateObserver && this.onActivateObservable.remove(this._onActivateObserver), e && (this._onActivateObserver = this.onActivateObservable.add(e));
  }
  /**
   * A function that is added to the onSizeChangedObservable
   */
  set onSizeChanged(e) {
    this._onSizeChangedObserver && this.onSizeChangedObservable.remove(this._onSizeChangedObserver), this._onSizeChangedObserver = this.onSizeChangedObservable.add(e);
  }
  /**
   * A function that is added to the onApplyObservable
   */
  set onApply(e) {
    this._onApplyObserver && this.onApplyObservable.remove(this._onApplyObserver), this._onApplyObserver = this.onApplyObservable.add(e);
  }
  /**
   * A function that is added to the onBeforeRenderObservable
   */
  set onBeforeRender(e) {
    this._onBeforeRenderObserver && this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver), this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(e);
  }
  /**
   * A function that is added to the onAfterRenderObservable
   */
  set onAfterRender(e) {
    this._onAfterRenderObserver && this.onAfterRenderObservable.remove(this._onAfterRenderObserver), this._onAfterRenderObserver = this.onAfterRenderObservable.add(e);
  }
  /**
   * The input texture for this post process and the output texture of the previous post process. When added to a pipeline the previous post process will
   * render it's output into this texture and this texture will be used as textureSampler in the fragment shader of this post process.
   */
  get inputTexture() {
    return this._textures.data[this._currentRenderTextureInd];
  }
  set inputTexture(e) {
    this._forcedOutputTexture = e;
  }
  /**
   * Since inputTexture should always be defined, if we previously manually set `inputTexture`,
   * the only way to unset it is to use this function to restore its internal state
   */
  restoreDefaultInputTexture() {
    this._forcedOutputTexture && (this._forcedOutputTexture = null, this.markTextureDirty());
  }
  /**
   * Gets the camera which post process is applied to.
   * @returns The camera the post process is applied to.
   */
  getCamera() {
    return this._camera;
  }
  /**
   * Gets the texel size of the postprocess.
   * See https://en.wikipedia.org/wiki/Texel_(graphics)
   */
  get texelSize() {
    return this._shareOutputWithPostProcess ? this._shareOutputWithPostProcess.texelSize : (this._forcedOutputTexture && this._texelSize.copyFromFloats(1 / this._forcedOutputTexture.width, 1 / this._forcedOutputTexture.height), this._texelSize);
  }
  /** @internal */
  constructor(e, t, r, s, i, a, o = 1, h, l, _ = null, u = 0, f = "postprocess", c, p = !1, m = 5, E, T) {
    this._parentContainer = null, this.width = -1, this.height = -1, this.nodeMaterialSource = null, this._outputTexture = null, this.autoClear = !0, this.forceAutoClearInAlphaMode = !1, this.animations = [], this.enablePixelPerfectMode = !1, this.forceFullscreenViewport = !0, this.scaleMode = 1, this.alwaysForcePOT = !1, this._samples = 1, this.adaptScaleToCurrentViewport = !1, this._webGPUReady = !1, this._reusable = !1, this._renderId = 0, this.externalTextureSamplerBinding = !1, this._textures = new ge(2), this._textureCache = [], this._currentRenderTextureInd = 0, this._scaleRatio = new X(1, 1), this._texelSize = X.Zero(), this.onActivateObservable = new O(), this.onSizeChangedObservable = new O(), this.onApplyObservable = new O(), this.onBeforeRenderObservable = new O(), this.onAfterRenderObservable = new O(), this.onDisposeObservable = new O();
    let g = 1, I = null, F;
    if (r && !Array.isArray(r)) {
      const P = r;
      r = P.uniforms ?? null, s = P.samplers ?? null, g = P.size ?? 1, a = P.camera ?? null, o = P.samplingMode ?? 1, h = P.engine, l = P.reusable, _ = Array.isArray(P.defines) ? P.defines.join(`
`) : P.defines ?? null, u = P.textureType ?? 0, f = P.vertexUrl ?? "postprocess", c = P.indexParameters, p = P.blockCompilation ?? !1, m = P.textureFormat ?? 5, E = P.shaderLanguage ?? 0, I = P.uniformBuffers ?? null, T = P.extraInitializations, F = P.effectWrapper;
    } else
      i && (typeof i == "number" ? g = i : g = { width: i.width, height: i.height });
    if (this._useExistingThinPostProcess = !!F, this._effectWrapper = F ?? new v({
      name: e,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: t,
      engine: h || (a == null ? void 0 : a.getScene().getEngine()),
      uniforms: r,
      samplers: s,
      uniformBuffers: I,
      defines: _,
      vertexUrl: f,
      indexParameters: c,
      blockCompilation: !0,
      shaderLanguage: E,
      extraInitializations: void 0
    }), this.name = e, this.onEffectCreatedObservable = this._effectWrapper.onEffectCreatedObservable, a != null ? (this._camera = a, this._scene = a.getScene(), a.attachPostProcess(this), this._engine = this._scene.getEngine(), this._scene.postProcesses.push(this), this.uniqueId = this._scene.getUniqueId()) : h && (this._engine = h, this._engine.postProcesses.push(this)), this._options = g, this.renderTargetSamplingMode = o || 1, this._reusable = l || !1, this._textureType = u, this._textureFormat = m, this._shaderLanguage = E || 0, this._samplers = s || [], this._samplers.indexOf("textureSampler") === -1 && this._samplers.push("textureSampler"), this._fragmentUrl = t, this._vertexUrl = f, this._parameters = r || [], this._parameters.indexOf("scale") === -1 && this._parameters.push("scale"), this._uniformBuffers = I || [], this._indexParameters = c, !this._useExistingThinPostProcess) {
      this._webGPUReady = this._shaderLanguage === 1;
      const P = [];
      this._gatherImports(this._engine.isWebGPU && !y.ForceGLSL, P), this._effectWrapper._webGPUReady = this._webGPUReady, this._effectWrapper._postConstructor(p, _, T, P);
    }
  }
  _gatherImports(e = !1, t) {
    e && this._webGPUReady ? t.push(Promise.all([import("./postprocess.vertex-7b338e9e.js")])) : t.push(Promise.all([Promise.resolve().then(() => Ie)]));
  }
  /**
   * Gets a string identifying the name of the class
   * @returns "PostProcess" string
   */
  getClassName() {
    return "PostProcess";
  }
  /**
   * Gets the engine which this post process belongs to.
   * @returns The engine the post process was enabled with.
   */
  getEngine() {
    return this._engine;
  }
  /**
   * The effect that is created when initializing the post process.
   * @returns The created effect corresponding to the postprocess.
   */
  getEffect() {
    return this._effectWrapper.drawWrapper.effect;
  }
  /**
   * To avoid multiple redundant textures for multiple post process, the output the output texture for this post process can be shared with another.
   * @param postProcess The post process to share the output with.
   * @returns This post process.
   */
  shareOutputWith(e) {
    return this._disposeTextures(), this._shareOutputWithPostProcess = e, this;
  }
  /**
   * Reverses the effect of calling shareOutputWith and returns the post process back to its original state.
   * This should be called if the post process that shares output with this post process is disabled/disposed.
   */
  useOwnOutput() {
    this._textures.length == 0 && (this._textures = new ge(2)), this._shareOutputWithPostProcess = null;
  }
  /**
   * Updates the effect with the current post process compile time values and recompiles the shader.
   * @param defines Define statements that should be added at the beginning of the shader. (default: null)
   * @param uniforms Set of uniform variables that will be passed to the shader. (default: null)
   * @param samplers Set of Texture2D variables that will be passed to the shader. (default: null)
   * @param indexParameters The index parameters to be used for babylons include syntax "#include<kernelBlurVaryingDeclaration>[0..varyingCount]". (default: undefined) See usage in babylon.blurPostProcess.ts and kernelBlur.vertex.fx
   * @param onCompiled Called when the shader has been compiled.
   * @param onError Called if there is an error when compiling a shader.
   * @param vertexUrl The url of the vertex shader to be used (default: the one given at construction time)
   * @param fragmentUrl The url of the fragment shader to be used (default: the one given at construction time)
   */
  updateEffect(e = null, t = null, r = null, s, i, a, o, h) {
    this._effectWrapper.updateEffect(e, t, r, s, i, a, o, h), this._postProcessDefines = Array.isArray(this._effectWrapper.options.defines) ? this._effectWrapper.options.defines.join(`
`) : this._effectWrapper.options.defines;
  }
  /**
   * The post process is reusable if it can be used multiple times within one frame.
   * @returns If the post process is reusable
   */
  isReusable() {
    return this._reusable;
  }
  /** invalidate frameBuffer to hint the postprocess to create a depth buffer */
  markTextureDirty() {
    this.width = -1;
  }
  _createRenderTargetTexture(e, t, r = 0) {
    for (let i = 0; i < this._textureCache.length; i++)
      if (this._textureCache[i].texture.width === e.width && this._textureCache[i].texture.height === e.height && this._textureCache[i].postProcessChannel === r && this._textureCache[i].texture._generateDepthBuffer === t.generateDepthBuffer && this._textureCache[i].texture.samples === t.samples)
        return this._textureCache[i].texture;
    const s = this._engine.createRenderTargetTexture(e, t);
    return this._textureCache.push({ texture: s, postProcessChannel: r, lastUsedRenderId: -1 }), s;
  }
  _flushTextureCache() {
    const e = this._renderId;
    for (let t = this._textureCache.length - 1; t >= 0; t--)
      if (e - this._textureCache[t].lastUsedRenderId > 100) {
        let r = !1;
        for (let s = 0; s < this._textures.length; s++)
          if (this._textures.data[s] === this._textureCache[t].texture) {
            r = !0;
            break;
          }
        r || (this._textureCache[t].texture.dispose(), this._textureCache.splice(t, 1));
      }
  }
  /**
   * Resizes the post-process texture
   * @param width Width of the texture
   * @param height Height of the texture
   * @param camera The camera this post-process is applied to. Pass null if the post-process is used outside the context of a camera post-process chain (default: null)
   * @param needMipMaps True if mip maps need to be generated after render (default: false)
   * @param forceDepthStencil True to force post-process texture creation with stencil depth and buffer (default: false)
   */
  resize(e, t, r = null, s = !1, i = !1) {
    this._textures.length > 0 && this._textures.reset(), this.width = e, this.height = t;
    let a = null;
    if (r) {
      for (let l = 0; l < r._postProcesses.length; l++)
        if (r._postProcesses[l] !== null) {
          a = r._postProcesses[l];
          break;
        }
    }
    const o = { width: this.width, height: this.height }, h = {
      generateMipMaps: s,
      generateDepthBuffer: i || a === this,
      generateStencilBuffer: (i || a === this) && this._engine.isStencilEnable,
      samplingMode: this.renderTargetSamplingMode,
      type: this._textureType,
      format: this._textureFormat,
      samples: this._samples,
      label: "PostProcessRTT-" + this.name
    };
    this._textures.push(this._createRenderTargetTexture(o, h, 0)), this._reusable && this._textures.push(this._createRenderTargetTexture(o, h, 1)), this._texelSize.copyFromFloats(1 / this.width, 1 / this.height), this.onSizeChangedObservable.notifyObservers(this);
  }
  _getTarget() {
    let e;
    if (this._shareOutputWithPostProcess)
      e = this._shareOutputWithPostProcess.inputTexture;
    else if (this._forcedOutputTexture)
      e = this._forcedOutputTexture, this.width = this._forcedOutputTexture.width, this.height = this._forcedOutputTexture.height;
    else {
      e = this.inputTexture;
      let t;
      for (let r = 0; r < this._textureCache.length; r++)
        if (this._textureCache[r].texture === e) {
          t = this._textureCache[r];
          break;
        }
      t && (t.lastUsedRenderId = this._renderId);
    }
    return e;
  }
  /**
   * Activates the post process by intializing the textures to be used when executed. Notifies onActivateObservable.
   * When this post process is used in a pipeline, this is call will bind the input texture of this post process to the output of the previous.
   * @param cameraOrScene The camera that will be used in the post process. This camera will be used when calling onActivateObservable. You can also pass the scene if no camera is available.
   * @param sourceTexture The source texture to be inspected to get the width and height if not specified in the post process constructor. (default: null)
   * @param forceDepthStencil If true, a depth and stencil buffer will be generated. (default: false)
   * @returns The render target wrapper that was bound to be written to.
   */
  activate(e, t = null, r) {
    var p, m;
    const s = e === null || e.cameraRigMode !== void 0 ? e || this._camera : null, i = (s == null ? void 0 : s.getScene()) ?? e, a = i.getEngine(), o = a.getCaps().maxTextureSize, h = (t ? t.width : this._engine.getRenderWidth(!0)) * this._options | 0, l = (t ? t.height : this._engine.getRenderHeight(!0)) * this._options | 0;
    let _ = this._options.width || h, u = this._options.height || l;
    const f = this.renderTargetSamplingMode !== 7 && this.renderTargetSamplingMode !== 1 && this.renderTargetSamplingMode !== 2;
    let c = null;
    if (!this._shareOutputWithPostProcess && !this._forcedOutputTexture) {
      if (this.adaptScaleToCurrentViewport) {
        const E = a.currentViewport;
        E && (_ *= E.width, u *= E.height);
      }
      (f || this.alwaysForcePOT) && (this._options.width || (_ = a.needPOTTextures ? Q(_, o, this.scaleMode) : _), this._options.height || (u = a.needPOTTextures ? Q(u, o, this.scaleMode) : u)), (this.width !== _ || this.height !== u || !(c = this._getTarget())) && this.resize(_, u, s, f, r), this._textures.forEach((E) => {
        E.samples !== this.samples && this._engine.updateRenderTargetTextureSampleCount(E, this.samples);
      }), this._flushTextureCache(), this._renderId++;
    }
    return c || (c = this._getTarget()), this.enablePixelPerfectMode ? (this._scaleRatio.copyFromFloats(h / _, l / u), this._engine.bindFramebuffer(c, 0, h, l, this.forceFullscreenViewport)) : (this._scaleRatio.copyFromFloats(1, 1), this._engine.bindFramebuffer(c, 0, void 0, void 0, this.forceFullscreenViewport)), (m = (p = this._engine)._debugInsertMarker) == null || m.call(p, `post process ${this.name} input`), this.onActivateObservable.notifyObservers(s), this.autoClear && (this.alphaMode === 0 || this.forceAutoClearInAlphaMode) && this._engine.clear(this.clearColor ? this.clearColor : i.clearColor, i._allowPostProcessClearColor, !0, !0), this._reusable && (this._currentRenderTextureInd = (this._currentRenderTextureInd + 1) % 2), c;
  }
  /**
   * If the post process is supported.
   */
  get isSupported() {
    return this._effectWrapper.drawWrapper.effect.isSupported;
  }
  /**
   * The aspect ratio of the output texture.
   */
  get aspectRatio() {
    return this._shareOutputWithPostProcess ? this._shareOutputWithPostProcess.aspectRatio : this._forcedOutputTexture ? this._forcedOutputTexture.width / this._forcedOutputTexture.height : this.width / this.height;
  }
  /**
   * Get a value indicating if the post-process is ready to be used
   * @returns true if the post-process is ready (shader is compiled)
   */
  isReady() {
    return this._effectWrapper.isReady();
  }
  /**
   * Binds all textures and uniforms to the shader, this will be run on every pass.
   * @returns the effect corresponding to this post process. Null if not compiled or not ready.
   */
  apply() {
    if (!this._effectWrapper.isReady())
      return null;
    this._engine.enableEffect(this._effectWrapper.drawWrapper), this._engine.setState(!1), this._engine.setDepthBuffer(!1), this._engine.setDepthWrite(!1), this.alphaConstants && this.getEngine().setAlphaConstants(this.alphaConstants.r, this.alphaConstants.g, this.alphaConstants.b, this.alphaConstants.a);
    let e;
    return this._shareOutputWithPostProcess ? e = this._shareOutputWithPostProcess.inputTexture : this._forcedOutputTexture ? e = this._forcedOutputTexture : e = this.inputTexture, this.externalTextureSamplerBinding || this._effectWrapper.drawWrapper.effect._bindTexture("textureSampler", e == null ? void 0 : e.texture), this._effectWrapper.drawWrapper.effect.setVector2("scale", this._scaleRatio), this.onApplyObservable.notifyObservers(this._effectWrapper.drawWrapper.effect), this._effectWrapper.bind(), this._effectWrapper.drawWrapper.effect;
  }
  _disposeTextures() {
    if (this._shareOutputWithPostProcess || this._forcedOutputTexture) {
      this._disposeTextureCache();
      return;
    }
    this._disposeTextureCache(), this._textures.dispose();
  }
  _disposeTextureCache() {
    for (let e = this._textureCache.length - 1; e >= 0; e--)
      this._textureCache[e].texture.dispose();
    this._textureCache.length = 0;
  }
  /**
   * Sets the required values to the prepass renderer.
   * @param prePassRenderer defines the prepass renderer to setup.
   * @returns true if the pre pass is needed.
   */
  setPrePassRenderer(e) {
    return this._prePassEffectConfiguration ? (this._prePassEffectConfiguration = e.addEffectConfiguration(this._prePassEffectConfiguration), this._prePassEffectConfiguration.enabled = !0, !0) : !1;
  }
  /**
   * Disposes the post process.
   * @param camera The camera to dispose the post process on.
   */
  dispose(e) {
    e = e || this._camera, this._useExistingThinPostProcess || this._effectWrapper.dispose(), this._disposeTextures();
    let t;
    if (this._scene && (t = this._scene.postProcesses.indexOf(this), t !== -1 && this._scene.postProcesses.splice(t, 1)), this._parentContainer) {
      const r = this._parentContainer.postProcesses.indexOf(this);
      r > -1 && this._parentContainer.postProcesses.splice(r, 1), this._parentContainer = null;
    }
    if (t = this._engine.postProcesses.indexOf(this), t !== -1 && this._engine.postProcesses.splice(t, 1), this.onDisposeObservable.notifyObservers(), !!e) {
      if (e.detachPostProcess(this), t = e._postProcesses.indexOf(this), t === 0 && e._postProcesses.length > 0) {
        const r = this._camera._getFirstPostProcess();
        r && r.markTextureDirty();
      }
      this.onActivateObservable.clear(), this.onAfterRenderObservable.clear(), this.onApplyObservable.clear(), this.onBeforeRenderObservable.clear(), this.onSizeChangedObservable.clear(), this.onEffectCreatedObservable.clear();
    }
  }
  /**
   * Serializes the post process to a JSON object
   * @returns the JSON object
   */
  serialize() {
    const e = pe.Serialize(this), t = this.getCamera() || this._scene && this._scene.activeCamera;
    return e.customType = "BABYLON." + this.getClassName(), e.cameraId = t ? t.id : null, e.reusable = this._reusable, e.textureType = this._textureType, e.fragmentUrl = this._fragmentUrl, e.parameters = this._parameters, e.samplers = this._samplers, e.uniformBuffers = this._uniformBuffers, e.options = this._options, e.defines = this._postProcessDefines, e.textureFormat = this._textureFormat, e.vertexUrl = this._vertexUrl, e.indexParameters = this._indexParameters, e;
  }
  /**
   * Clones this post process
   * @returns a new post process similar to this one
   */
  clone() {
    const e = this.serialize();
    e._engine = this._engine, e.cameraId = null;
    const t = y.Parse(e, this._scene, "");
    return t ? (t.onActivateObservable = this.onActivateObservable.clone(), t.onSizeChangedObservable = this.onSizeChangedObservable.clone(), t.onApplyObservable = this.onApplyObservable.clone(), t.onBeforeRenderObservable = this.onBeforeRenderObservable.clone(), t.onAfterRenderObservable = this.onAfterRenderObservable.clone(), t._prePassEffectConfiguration = this._prePassEffectConfiguration, t) : null;
  }
  /**
   * Creates a material from parsed material data
   * @param parsedPostProcess defines parsed post process data
   * @param scene defines the hosting scene
   * @param rootUrl defines the root URL to use to load textures
   * @returns a new post process
   */
  static Parse(e, t, r) {
    const s = tt(e.customType);
    if (!s || !s._Parse)
      return null;
    const i = t ? t.getCameraById(e.cameraId) : null;
    return s._Parse(e, i, t, r);
  }
  /**
   * @internal
   */
  static _Parse(e, t, r, s) {
    return pe.Parse(() => new y(e.name, e.fragmentUrl, e.parameters, e.samplers, e.options, t, e.renderTargetSamplingMode, e._engine, e.reusable, e.defines, e.textureType, e.vertexUrl, e.indexParameters, !1, e.textureFormat), e, r, s);
  }
}
L([
  w()
], y.prototype, "uniqueId", void 0);
L([
  w()
], y.prototype, "name", null);
L([
  w()
], y.prototype, "width", void 0);
L([
  w()
], y.prototype, "height", void 0);
L([
  w()
], y.prototype, "renderTargetSamplingMode", void 0);
L([
  et()
], y.prototype, "clearColor", void 0);
L([
  w()
], y.prototype, "autoClear", void 0);
L([
  w()
], y.prototype, "forceAutoClearInAlphaMode", void 0);
L([
  w()
], y.prototype, "alphaMode", null);
L([
  w()
], y.prototype, "alphaConstants", void 0);
L([
  w()
], y.prototype, "enablePixelPerfectMode", void 0);
L([
  w()
], y.prototype, "forceFullscreenViewport", void 0);
L([
  w()
], y.prototype, "scaleMode", void 0);
L([
  w()
], y.prototype, "alwaysForcePOT", void 0);
L([
  w("samples")
], y.prototype, "_samples", void 0);
L([
  w()
], y.prototype, "adaptScaleToCurrentViewport", void 0);
rt("BABYLON.PostProcess", y);
export {
  d as E,
  y as P,
  Z as R,
  ie as S,
  v as a,
  xe as b,
  Pe as c,
  se as d,
  It as e,
  Ft as t
};
