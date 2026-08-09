import { O as A, D as Ae, t as N, u as Re, g as F, v as p, w as n, x as Pe, b as Te, y as Se, z as we, H as Ie, I as _, J as ze, K as Oe, N as Me } from "./index-11ca32cf.js";
const G = {
  positions: [1, 1, -1, 1, -1, -1, 1, -1],
  indices: [0, 1, 2, 0, 2, 3]
};
class Ee {
  /**
   * Creates an effect renderer
   * @param engine the engine to use for rendering
   * @param options defines the options of the effect renderer
   */
  constructor(t, i = G) {
    this._fullscreenViewport = new Re(0, 0, 1, 1);
    const r = i.positions ?? G.positions, b = i.indices ?? G.indices;
    this.engine = t, this._vertexBuffers = {
      // Note, always assumes stride of 2.
      [F.PositionKind]: new F(t, r, F.PositionKind, !1, !1, 2)
    }, this._indexBuffer = t.createIndexBuffer(b), this._indexBufferLength = b.length, this._onContextRestoredObserver = t.onContextRestoredObservable.add(() => {
      this._indexBuffer = t.createIndexBuffer(b);
      for (const x in this._vertexBuffers)
        this._vertexBuffers[x]._rebuild();
    });
  }
  /**
   * Sets the current viewport in normalized coordinates 0-1
   * @param viewport Defines the viewport to set (defaults to 0 0 1 1)
   */
  setViewport(t = this._fullscreenViewport) {
    this.engine.setViewport(t);
  }
  /**
   * Binds the embedded attributes buffer to the effect.
   * @param effect Defines the effect to bind the attributes for
   */
  bindBuffers(t) {
    this.engine.bindBuffers(this._vertexBuffers, this._indexBuffer, t);
  }
  /**
   * Sets the current effect wrapper to use during draw.
   * The effect needs to be ready before calling this api.
   * This also sets the default full screen position attribute.
   * @param effectWrapper Defines the effect to draw with
   * @param depthTest Whether to enable depth testing (default: false)
   * @param stencilTest Whether to enable stencil testing (default: false)
   */
  applyEffectWrapper(t, i = !1, r = !1) {
    this.engine.setState(!0), this.engine.depthCullingState.depthTest = i, this.engine.stencilState.stencilTest = r, this.engine.enableEffect(t.drawWrapper), this.bindBuffers(t.effect), t.onApplyObservable.notifyObservers({});
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
    this.engine.drawElementsType(0, 0, this._indexBufferLength);
  }
  _isRenderTargetTexture(t) {
    return t.renderTarget !== void 0;
  }
  /**
   * renders one or more effects to a specified texture
   * @param effectWrapper the effect to renderer
   * @param outputTexture texture to draw to, if null it will render to the currently bound frame buffer
   */
  render(t, i = null) {
    if (!t.effect.isReady())
      return;
    this.saveStates(), this.setViewport();
    const r = i === null ? null : this._isRenderTargetTexture(i) ? i.renderTarget : i;
    r && this.engine.bindFramebuffer(r), this.applyEffectWrapper(t), this.draw(), r && this.engine.unBindFramebuffer(r), this.restoreStates();
  }
  /**
   * Disposes of the effect renderer
   */
  dispose() {
    const t = this._vertexBuffers[F.PositionKind];
    t && (t.dispose(), delete this._vertexBuffers[F.PositionKind]), this._indexBuffer && this.engine._releaseBuffer(this._indexBuffer), this._onContextRestoredObserver && (this.engine.onContextRestoredObservable.remove(this._onContextRestoredObserver), this._onContextRestoredObserver = null);
  }
}
class g {
  /**
   * Registers a shader code processing with an effect wrapper name.
   * @param effectWrapperName name of the effect wrapper. Use null for the fallback shader code processing. This is the shader code processing that will be used in case no specific shader code processing has been associated to an effect wrapper name
   * @param customShaderCodeProcessing shader code processing to associate to the effect wrapper name
   */
  static RegisterShaderCodeProcessing(t, i) {
    if (!i) {
      delete g._CustomShaderCodeProcessing[t ?? ""];
      return;
    }
    g._CustomShaderCodeProcessing[t ?? ""] = i;
  }
  static _GetShaderCodeProcessing(t) {
    return g._CustomShaderCodeProcessing[t] ?? g._CustomShaderCodeProcessing[""];
  }
  /**
   * Gets or sets the name of the effect wrapper
   */
  get name() {
    return this.options.name;
  }
  set name(t) {
    this.options.name = t;
  }
  /**
   * Get a value indicating if the effect is ready to be used
   * @returns true if the post-process is ready (shader is compiled)
   */
  isReady() {
    var t;
    return ((t = this._drawWrapper.effect) == null ? void 0 : t.isReady()) ?? !1;
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
  set effect(t) {
    this._drawWrapper.effect = t;
  }
  /**
   * Creates an effect to be rendered
   * @param creationOptions options to create the effect
   */
  constructor(t) {
    this.alphaMode = 0, this.onEffectCreatedObservable = new A(void 0, !0), this.onApplyObservable = new A(), this._shadersLoaded = !1, this._webGPUReady = !1, this._importPromises = [], this.options = {
      ...t,
      name: t.name || "effectWrapper",
      engine: t.engine,
      uniforms: t.uniforms || t.uniformNames || [],
      uniformNames: void 0,
      samplers: t.samplers || t.samplerNames || [],
      samplerNames: void 0,
      attributeNames: t.attributeNames || ["position"],
      uniformBuffers: t.uniformBuffers || [],
      defines: t.defines || "",
      useShaderStore: t.useShaderStore || !1,
      vertexUrl: t.vertexUrl || t.vertexShader || "postprocess",
      vertexShader: void 0,
      fragmentShader: t.fragmentShader || "pass",
      indexParameters: t.indexParameters,
      blockCompilation: t.blockCompilation || !1,
      shaderLanguage: t.shaderLanguage || 0,
      onCompiled: t.onCompiled || void 0,
      extraInitializations: t.extraInitializations || void 0,
      extraInitializationsAsync: t.extraInitializationsAsync || void 0,
      useAsPostProcess: t.useAsPostProcess ?? !1,
      allowEmptySourceTexture: t.allowEmptySourceTexture ?? !1
    }, this.options.uniformNames = this.options.uniforms, this.options.samplerNames = this.options.samplers, this.options.vertexShader = this.options.vertexUrl, this.options.useAsPostProcess && (!this.options.allowEmptySourceTexture && this.options.samplers.indexOf("textureSampler") === -1 && this.options.samplers.push("textureSampler"), this.options.uniforms.indexOf("scale") === -1 && this.options.uniforms.push("scale")), t.vertexUrl || t.vertexShader ? this._shaderPath = {
      vertexSource: this.options.vertexShader
    } : (this.options.useAsPostProcess || (this.options.uniforms.push("scale"), this.onApplyObservable.add(() => {
      this.effect.setFloat2("scale", 1, 1);
    })), this._shaderPath = {
      vertex: this.options.vertexShader
    }), this._shaderPath.fragmentSource = this.options.fragmentShader, this._shaderPath.spectorName = this.options.name, this.options.useShaderStore && (this._shaderPath.fragment = this._shaderPath.fragmentSource, this._shaderPath.vertex || (this._shaderPath.vertex = this._shaderPath.vertexSource), delete this._shaderPath.fragmentSource, delete this._shaderPath.vertexSource), this.onApplyObservable.add(() => {
      this.bind();
    }), this.options.useShaderStore || (this._onContextRestoredObserver = this.options.engine.onContextRestoredObservable.add(() => {
      this.effect._pipelineContext = null, this.effect._prepareEffect();
    })), this._drawWrapper = new Ae(this.options.engine), this._webGPUReady = this.options.shaderLanguage === 1;
    const i = Array.isArray(this.options.defines) ? this.options.defines.join(`
`) : this.options.defines;
    this._postConstructor(this.options.blockCompilation, i, this.options.extraInitializations);
  }
  _gatherImports(t = !1, i) {
  }
  /** @internal */
  _postConstructor(t, i = null, r, b) {
    this._importPromises.length = 0, b && this._importPromises.push(...b);
    const x = this.options.engine.isWebGPU && !g.ForceGLSL;
    this._gatherImports(x, this._importPromises), this.options.useShaderStore && this._shaderPath.vertex === "postprocess" && this._importPromises.push(x && this._webGPUReady ? import("./postprocess.vertex-906bd9da.js") : import("./postprocess.vertex-57909a00.js")), r !== void 0 && r(x, this._importPromises), x && this._webGPUReady && (this.options.shaderLanguage = 1), t || this.updateEffect(i);
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
  updateEffect(t = null, i = null, r = null, b, x, M, E, L) {
    const c = g._GetShaderCodeProcessing(this.name);
    if (c != null && c.defineCustomBindings) {
      const T = (i == null ? void 0 : i.slice()) ?? [];
      T.push(...this.options.uniforms);
      const S = (r == null ? void 0 : r.slice()) ?? [];
      S.push(...this.options.samplers), t = c.defineCustomBindings(this.name, t, T, S), i = T, r = S;
    }
    this.options.defines = t || "";
    const R = this._shadersLoaded || this._importPromises.length === 0 ? void 0 : async () => {
      await Promise.all(this._importPromises), this._shadersLoaded = !0;
    };
    let I;
    this.options.extraInitializationsAsync ? I = async () => {
      await (R == null ? void 0 : R()), await this.options.extraInitializationsAsync();
    } : I = R, this.options.useShaderStore ? this._drawWrapper.effect = this.options.engine.createEffect({ vertex: E ?? this._shaderPath.vertex, fragment: L ?? this._shaderPath.fragment }, {
      attributes: this.options.attributeNames,
      uniformsNames: i || this.options.uniforms,
      uniformBuffersNames: this.options.uniformBuffers,
      samplers: r || this.options.samplers,
      defines: t !== null ? t : "",
      fallbacks: null,
      onCompiled: x ?? this.options.onCompiled,
      onError: M ?? null,
      indexParameters: b || this.options.indexParameters,
      processCodeAfterIncludes: c != null && c.processCodeAfterIncludes ? (T, S) => c.processCodeAfterIncludes(this.name, T, S) : null,
      processFinalCode: c != null && c.processFinalCode ? (T, S) => c.processFinalCode(this.name, T, S) : null,
      shaderLanguage: this.options.shaderLanguage,
      extraInitializationsAsync: I
    }, this.options.engine) : this._drawWrapper.effect = new N(this._shaderPath, this.options.attributeNames, i || this.options.uniforms, r || this.options.samplerNames, this.options.engine, t, void 0, x || this.options.onCompiled, void 0, void 0, void 0, this.options.shaderLanguage, I), this.onEffectCreatedObservable.notifyObservers(this._drawWrapper.effect);
  }
  /**
   * Binds the data to the effect.
   * @param noDefaultBindings if true, the default bindings (scale and alpha mode) will not be set.
   */
  bind(t = !1) {
    var i, r;
    this.options.useAsPostProcess && !t && (this.options.engine.setAlphaMode(this.alphaMode), this.drawWrapper.effect.setFloat2("scale", 1, 1)), (r = (i = g._GetShaderCodeProcessing(this.name)) == null ? void 0 : i.bindCustomBindings) == null || r.call(i, this.name, this._drawWrapper.effect);
  }
  /**
   * Disposes of the effect wrapper
   * @param _ignored kept for backward compatibility
   */
  dispose(t = !1) {
    this._onContextRestoredObserver && (this.effect.getEngine().onContextRestoredObservable.remove(this._onContextRestoredObserver), this._onContextRestoredObserver = null), this.onEffectCreatedObservable.clear(), this._drawWrapper.dispose(!0);
  }
}
g.ForceGLSL = !1;
g._CustomShaderCodeProcessing = {};
let We = (() => {
  var u;
  let t = [], i, r = [], b = [], x, M, E = [], L = [], c, R = [], I = [], T, S = [], D = [], q, j = [], H = [], K, Y = [], J = [], Z, $ = [], Q = [], X, ee, te = [], se = [], ie, re = [], ae = [], ne, he = [], oe = [], le, ue = [], de = [], fe, pe = [], ce = [], _e, ge = [], me = [], xe, be = [], Ce = [];
  return u = class {
    /**
     * Force all the postprocesses to compile to glsl even on WebGPU engines.
     * False by default. This is mostly meant for backward compatibility.
     */
    static get ForceGLSL() {
      return g.ForceGLSL;
    }
    static set ForceGLSL(e) {
      g.ForceGLSL = e;
    }
    /**
     * Registers a shader code processing with a post process name.
     * @param postProcessName name of the post process. Use null for the fallback shader code processing. This is the shader code processing that will be used in case no specific shader code processing has been associated to a post process name
     * @param customShaderCodeProcessing shader code processing to associate to the post process name
     */
    static RegisterShaderCodeProcessing(e, s) {
      g.RegisterShaderCodeProcessing(e, s);
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
      this._samples = Math.min(e, this._engine.getCaps().maxMSAASamples), this._textures.forEach((s) => {
        s.setSamples(this._samples);
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
    constructor(e, s, a, h, o, f, C = 1, m, v, P = null, w = 0, z = "postprocess", O, W = !1, B = 5, y, ve) {
      this._parentContainer = (n(this, t), null), this.uniqueId = n(this, r, void 0), this.width = (n(this, b), n(this, E, -1)), this.height = (n(this, L), n(this, R, -1)), this.nodeMaterialSource = (n(this, I), null), this._outputTexture = null, this.renderTargetSamplingMode = n(this, S, void 0), this.clearColor = (n(this, D), n(this, j, void 0)), this.autoClear = (n(this, H), n(this, Y, !0)), this.forceAutoClearInAlphaMode = (n(this, J), n(this, $, !1)), this.alphaConstants = (n(this, Q), n(this, te, void 0)), this.animations = (n(this, se), []), this.enablePixelPerfectMode = n(this, re, !1), this.forceFullscreenViewport = (n(this, ae), n(this, he, !0)), this.inspectableCustomProperties = n(this, oe), this.scaleMode = n(this, ue, 1), this.alwaysForcePOT = (n(this, de), n(this, pe, !1)), this._samples = (n(this, ce), n(this, ge, 1)), this.adaptScaleToCurrentViewport = (n(this, me), n(this, be, !1)), this.doNotSerialize = (n(this, Ce), !1), this._webGPUReady = !1, this._reusable = !1, this._renderId = 0, this.externalTextureSamplerBinding = !1, this._textures = new Pe(2), this._textureCache = [], this._currentRenderTextureInd = 0, this._scaleRatio = new Te(1, 1), this._texelSize = Te.Zero(), this.onActivateObservable = new A(), this.onSizeChangedObservable = new A(), this.onApplyObservable = new A(), this.onBeforeRenderObservable = new A(), this.onAfterRenderObservable = new A(), this.onDisposeObservable = new A(), Be();
      let U = 1, V = null, k;
      if (a && !Array.isArray(a)) {
        const l = a;
        a = l.uniforms ?? null, h = l.samplers ?? null, U = l.size ?? 1, f = l.camera ?? null, C = l.samplingMode ?? 1, m = l.engine, v = l.reusable, P = Array.isArray(l.defines) ? l.defines.join(`
`) : l.defines ?? null, w = l.textureType ?? 0, z = l.vertexUrl ?? "postprocess", O = l.indexParameters, W = l.blockCompilation ?? !1, B = l.textureFormat ?? 5, y = l.shaderLanguage ?? 0, V = l.uniformBuffers ?? null, ve = l.extraInitializations, k = l.effectWrapper;
      } else
        o && (typeof o == "number" ? U = o : U = { width: o.width, height: o.height });
      if (this._useExistingThinPostProcess = !!k, this._effectWrapper = k ?? new g({
        name: e,
        useShaderStore: !0,
        useAsPostProcess: !0,
        fragmentShader: s,
        engine: m || (f == null ? void 0 : f.getScene().getEngine()),
        uniforms: a,
        samplers: h,
        uniformBuffers: V,
        defines: P,
        vertexUrl: z,
        indexParameters: O,
        blockCompilation: !0,
        shaderLanguage: y,
        extraInitializations: void 0
      }), this.name = e, this.onEffectCreatedObservable = this._effectWrapper.onEffectCreatedObservable, f != null ? (this._camera = f, this._scene = f.getScene(), f.attachPostProcess(this), this._engine = this._scene.getEngine(), this._scene.addPostProcess(this), this.uniqueId = this._scene.getUniqueId()) : m && (this._engine = m, this._engine.postProcesses.push(this)), this._options = U, this.renderTargetSamplingMode = C || 1, this._reusable = v || !1, this._textureType = w, this._textureFormat = B, this._shaderLanguage = y || 0, this._samplers = h || [], this._samplers.indexOf("textureSampler") === -1 && this._samplers.push("textureSampler"), this._fragmentUrl = s, this._vertexUrl = z, this._parameters = a || [], this._parameters.indexOf("scale") === -1 && this._parameters.push("scale"), this._uniformBuffers = V || [], this._indexParameters = O, !this._useExistingThinPostProcess) {
        this._webGPUReady = this._shaderLanguage === 1;
        const l = [];
        this._gatherImports(this._engine.isWebGPU && !u.ForceGLSL, l), this._effectWrapper._webGPUReady = this._webGPUReady, this._effectWrapper._postConstructor(W, P, ve, l);
      }
    }
    _gatherImports(e = !1, s) {
      e && this._webGPUReady ? s.push(Promise.all([import("./postprocess.vertex-906bd9da.js")])) : s.push(Promise.all([import("./postprocess.vertex-57909a00.js")]));
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
      this._textures.length == 0 && (this._textures = new Pe(2)), this._shareOutputWithPostProcess = null;
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
    updateEffect(e = null, s = null, a = null, h, o, f, C, m) {
      this._effectWrapper.updateEffect(e, s, a, h, o, f, C, m), this._postProcessDefines = Array.isArray(this._effectWrapper.options.defines) ? this._effectWrapper.options.defines.join(`
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
    _createRenderTargetTexture(e, s, a = 0) {
      for (let o = 0; o < this._textureCache.length; o++)
        if (this._textureCache[o].texture.width === e.width && this._textureCache[o].texture.height === e.height && this._textureCache[o].postProcessChannel === a && this._textureCache[o].texture._generateDepthBuffer === s.generateDepthBuffer && this._textureCache[o].texture.samples === s.samples)
          return this._textureCache[o].texture;
      const h = this._engine.createRenderTargetTexture(e, s);
      return this._textureCache.push({ texture: h, postProcessChannel: a, lastUsedRenderId: -1 }), h;
    }
    _flushTextureCache() {
      const e = this._renderId;
      for (let s = this._textureCache.length - 1; s >= 0; s--)
        if (e - this._textureCache[s].lastUsedRenderId > 100) {
          let a = !1;
          for (let h = 0; h < this._textures.length; h++)
            if (this._textures.data[h] === this._textureCache[s].texture) {
              a = !0;
              break;
            }
          a || (this._textureCache[s].texture.dispose(), this._textureCache.splice(s, 1));
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
    resize(e, s, a = null, h = !1, o = !1) {
      this._textures.length > 0 && this._textures.reset(), this.width = e, this.height = s;
      let f = null;
      if (a) {
        for (let v = 0; v < a._postProcesses.length; v++)
          if (a._postProcesses[v] !== null) {
            f = a._postProcesses[v];
            break;
          }
      }
      const C = { width: this.width, height: this.height }, m = {
        generateMipMaps: h,
        generateDepthBuffer: o || f === this,
        generateStencilBuffer: (o || f === this) && this._engine.isStencilEnable,
        samplingMode: this.renderTargetSamplingMode,
        type: this._textureType,
        format: this._textureFormat,
        samples: this._samples,
        label: "PostProcessRTT-" + this.name
      };
      this._textures.push(this._createRenderTargetTexture(C, m, 0)), this._reusable && this._textures.push(this._createRenderTargetTexture(C, m, 1)), this._texelSize.copyFromFloats(1 / this.width, 1 / this.height), this.onSizeChangedObservable.notifyObservers(this);
    }
    _getTarget() {
      let e;
      if (this._shareOutputWithPostProcess)
        e = this._shareOutputWithPostProcess.inputTexture;
      else if (this._forcedOutputTexture)
        e = this._forcedOutputTexture, this.width = this._forcedOutputTexture.width, this.height = this._forcedOutputTexture.height;
      else {
        e = this.inputTexture;
        let s;
        for (let a = 0; a < this._textureCache.length; a++)
          if (this._textureCache[a].texture === e) {
            s = this._textureCache[a];
            break;
          }
        s && (s.lastUsedRenderId = this._renderId);
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
    activate(e, s = null, a) {
      var W, B;
      const h = e === null || e.cameraRigMode !== void 0 ? e || this._camera : null, o = (h == null ? void 0 : h.getScene()) ?? e, f = o.getEngine(), C = f.getCaps().maxTextureSize, m = (s ? s.width : this._engine.getRenderWidth(!0)) * this._options | 0, v = (s ? s.height : this._engine.getRenderHeight(!0)) * this._options | 0;
      let P = this._options.width || m, w = this._options.height || v;
      const z = this.renderTargetSamplingMode !== 7 && this.renderTargetSamplingMode !== 1 && this.renderTargetSamplingMode !== 2;
      let O = null;
      if (!this._shareOutputWithPostProcess && !this._forcedOutputTexture) {
        if (this.adaptScaleToCurrentViewport) {
          const y = f.currentViewport;
          y && (P *= y.width, w *= y.height);
        }
        (z || this.alwaysForcePOT) && (this._options.width || (P = f.needPOTTextures ? Se(P, C, this.scaleMode) : P), this._options.height || (w = f.needPOTTextures ? Se(w, C, this.scaleMode) : w)), (this.width !== P || this.height !== w || !(O = this._getTarget())) && this.resize(P, w, h, z, a), this._textures.forEach((y) => {
          y.samples !== this.samples && this._engine.updateRenderTargetTextureSampleCount(y, this.samples);
        }), this._flushTextureCache(), this._renderId++;
      }
      return O || (O = this._getTarget()), this.enablePixelPerfectMode ? (this._scaleRatio.copyFromFloats(m / P, v / w), this._engine.bindFramebuffer(O, 0, m, v, this.forceFullscreenViewport)) : (this._scaleRatio.copyFromFloats(1, 1), this._engine.bindFramebuffer(O, 0, void 0, void 0, this.forceFullscreenViewport)), (B = (W = this._engine)._debugInsertMarker) == null || B.call(W, `post process ${this.name} input`), this.onActivateObservable.notifyObservers(h), this.autoClear && (this.alphaMode === 0 || this.forceAutoClearInAlphaMode) && this._engine.clear(this.clearColor ? this.clearColor : o.clearColor, o._allowPostProcessClearColor, !0, !0), this._reusable && (this._currentRenderTextureInd = (this._currentRenderTextureInd + 1) % 2), O;
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
      this._engine.enableEffect(this._effectWrapper.drawWrapper), this._engine.setState(!1), this._engine.setDepthBuffer(!1), this._engine.setDepthWrite(!1), this.alphaConstants && this.getEngine().setAlphaConstants(this.alphaConstants.r, this.alphaConstants.g, this.alphaConstants.b, this.alphaConstants.a), this._engine.setAlphaMode(this.alphaMode);
      let e;
      return this._shareOutputWithPostProcess ? e = this._shareOutputWithPostProcess.inputTexture : this._forcedOutputTexture ? e = this._forcedOutputTexture : e = this.inputTexture, this.externalTextureSamplerBinding || this._effectWrapper.drawWrapper.effect._bindTexture("textureSampler", e == null ? void 0 : e.texture), this._effectWrapper.drawWrapper.effect.setVector2("scale", this._scaleRatio), this.onApplyObservable.notifyObservers(this._effectWrapper.drawWrapper.effect), this._effectWrapper.bind(!0), this._effectWrapper.drawWrapper.effect;
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
      e = e || this._camera, this._useExistingThinPostProcess || this._effectWrapper.dispose(), this._disposeTextures(), this._scene && this._scene.removePostProcess(this);
      let s;
      if (this._parentContainer && (s = this._parentContainer.postProcesses.indexOf(this), s > -1 && this._parentContainer.postProcesses.splice(s, 1), this._parentContainer = null), s = this._engine.postProcesses.indexOf(this), s !== -1 && this._engine.postProcesses.splice(s, 1), this.onDisposeObservable.notifyObservers(), !!e) {
        if (e.detachPostProcess(this), s = e._postProcesses.indexOf(this), s === 0 && e._postProcesses.length > 0) {
          const a = this._camera._getFirstPostProcess();
          a && a.markTextureDirty();
        }
        this.onActivateObservable.clear(), this.onAfterRenderObservable.clear(), this.onApplyObservable.clear(), this.onBeforeRenderObservable.clear(), this.onSizeChangedObservable.clear(), this.onEffectCreatedObservable.clear();
      }
    }
    /**
     * Serializes the post process to a JSON object
     * @returns the JSON object
     */
    serialize() {
      const e = we.Serialize(this), s = this.getCamera() || this._scene && this._scene.activeCamera;
      return e.customType = "BABYLON." + this.getClassName(), e.cameraId = s ? s.id : null, e.reusable = this._reusable, e.textureType = this._textureType, e.fragmentUrl = this._fragmentUrl, e.parameters = this._parameters, e.samplers = this._samplers, e.uniformBuffers = this._uniformBuffers, e.options = this._options, e.defines = this._postProcessDefines, e.textureFormat = this._textureFormat, e.vertexUrl = this._vertexUrl, e.indexParameters = this._indexParameters, e;
    }
    /**
     * Clones this post process
     * @returns a new post process similar to this one
     */
    clone() {
      const e = this.serialize();
      e._engine = this._engine, e.cameraId = null;
      const s = u.Parse(e, this._scene, "");
      return s ? (s.onActivateObservable = this.onActivateObservable.clone(), s.onSizeChangedObservable = this.onSizeChangedObservable.clone(), s.onApplyObservable = this.onApplyObservable.clone(), s.onBeforeRenderObservable = this.onBeforeRenderObservable.clone(), s.onAfterRenderObservable = this.onAfterRenderObservable.clone(), s._prePassEffectConfiguration = this._prePassEffectConfiguration, s) : null;
    }
    /**
     * Creates a material from parsed material data
     * @param parsedPostProcess defines parsed post process data
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures
     * @returns a new post process
     */
    static Parse(e, s, a) {
      const h = Ie(e.customType);
      if (!h || !h._Parse)
        return null;
      const o = s ? s.getCameraById(e.cameraId) : null;
      return h._Parse(e, o, s, a);
    }
    /**
     * @internal
     */
    static _Parse(e, s, a, h) {
      return we.Parse(() => new u(e.name, e.fragmentUrl, e.parameters, e.samplers, e.options, s, e.renderTargetSamplingMode, e._engine, e.reusable, e.defines, e.textureType, e.vertexUrl, e.indexParameters, !1, e.textureFormat), e, a, h);
    }
  }, (() => {
    const d = typeof Symbol == "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    i = [_()], x = [_()], M = [_()], c = [_()], T = [_()], q = [ze()], K = [_()], Z = [_()], X = [_()], ee = [_()], ie = [_()], ne = [_()], le = [_()], fe = [_()], _e = [_("samples")], xe = [_()], p(u, null, x, { kind: "getter", name: "name", static: !1, private: !1, access: { has: (e) => "name" in e, get: (e) => e.name }, metadata: d }, null, t), p(u, null, X, { kind: "getter", name: "alphaMode", static: !1, private: !1, access: { has: (e) => "alphaMode" in e, get: (e) => e.alphaMode }, metadata: d }, null, t), p(null, null, i, { kind: "field", name: "uniqueId", static: !1, private: !1, access: { has: (e) => "uniqueId" in e, get: (e) => e.uniqueId, set: (e, s) => {
      e.uniqueId = s;
    } }, metadata: d }, r, b), p(null, null, M, { kind: "field", name: "width", static: !1, private: !1, access: { has: (e) => "width" in e, get: (e) => e.width, set: (e, s) => {
      e.width = s;
    } }, metadata: d }, E, L), p(null, null, c, { kind: "field", name: "height", static: !1, private: !1, access: { has: (e) => "height" in e, get: (e) => e.height, set: (e, s) => {
      e.height = s;
    } }, metadata: d }, R, I), p(null, null, T, { kind: "field", name: "renderTargetSamplingMode", static: !1, private: !1, access: { has: (e) => "renderTargetSamplingMode" in e, get: (e) => e.renderTargetSamplingMode, set: (e, s) => {
      e.renderTargetSamplingMode = s;
    } }, metadata: d }, S, D), p(null, null, q, { kind: "field", name: "clearColor", static: !1, private: !1, access: { has: (e) => "clearColor" in e, get: (e) => e.clearColor, set: (e, s) => {
      e.clearColor = s;
    } }, metadata: d }, j, H), p(null, null, K, { kind: "field", name: "autoClear", static: !1, private: !1, access: { has: (e) => "autoClear" in e, get: (e) => e.autoClear, set: (e, s) => {
      e.autoClear = s;
    } }, metadata: d }, Y, J), p(null, null, Z, { kind: "field", name: "forceAutoClearInAlphaMode", static: !1, private: !1, access: { has: (e) => "forceAutoClearInAlphaMode" in e, get: (e) => e.forceAutoClearInAlphaMode, set: (e, s) => {
      e.forceAutoClearInAlphaMode = s;
    } }, metadata: d }, $, Q), p(null, null, ee, { kind: "field", name: "alphaConstants", static: !1, private: !1, access: { has: (e) => "alphaConstants" in e, get: (e) => e.alphaConstants, set: (e, s) => {
      e.alphaConstants = s;
    } }, metadata: d }, te, se), p(null, null, ie, { kind: "field", name: "enablePixelPerfectMode", static: !1, private: !1, access: { has: (e) => "enablePixelPerfectMode" in e, get: (e) => e.enablePixelPerfectMode, set: (e, s) => {
      e.enablePixelPerfectMode = s;
    } }, metadata: d }, re, ae), p(null, null, ne, { kind: "field", name: "forceFullscreenViewport", static: !1, private: !1, access: { has: (e) => "forceFullscreenViewport" in e, get: (e) => e.forceFullscreenViewport, set: (e, s) => {
      e.forceFullscreenViewport = s;
    } }, metadata: d }, he, oe), p(null, null, le, { kind: "field", name: "scaleMode", static: !1, private: !1, access: { has: (e) => "scaleMode" in e, get: (e) => e.scaleMode, set: (e, s) => {
      e.scaleMode = s;
    } }, metadata: d }, ue, de), p(null, null, fe, { kind: "field", name: "alwaysForcePOT", static: !1, private: !1, access: { has: (e) => "alwaysForcePOT" in e, get: (e) => e.alwaysForcePOT, set: (e, s) => {
      e.alwaysForcePOT = s;
    } }, metadata: d }, pe, ce), p(null, null, _e, { kind: "field", name: "_samples", static: !1, private: !1, access: { has: (e) => "_samples" in e, get: (e) => e._samples, set: (e, s) => {
      e._samples = s;
    } }, metadata: d }, ge, me), p(null, null, xe, { kind: "field", name: "adaptScaleToCurrentViewport", static: !1, private: !1, access: { has: (e) => "adaptScaleToCurrentViewport" in e, get: (e) => e.adaptScaleToCurrentViewport, set: (e, s) => {
      e.adaptScaleToCurrentViewport = s;
    } }, metadata: d }, be, Ce), d && Object.defineProperty(u, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: d });
  })(), u;
})(), ye = !1;
function Be() {
  ye || (ye = !0, Oe.prototype.setTextureFromPostProcess = function(u, t, i) {
    let r = null;
    t && (t._forcedOutputTexture ? r = t._forcedOutputTexture : t._textures.data[t._currentRenderTextureInd] && (r = t._textures.data[t._currentRenderTextureInd])), this._bindTexture(u, (r == null ? void 0 : r.texture) ?? null, i);
  }, Oe.prototype.setTextureFromPostProcessOutput = function(u, t, i) {
    var r;
    this._bindTexture(u, ((r = t == null ? void 0 : t._outputTexture) == null ? void 0 : r.texture) ?? null, i);
  }, N.prototype.setTextureFromPostProcess = function(u, t) {
    this._engine.setTextureFromPostProcess(this._samplers[u], t, u);
  }, N.prototype.setTextureFromPostProcessOutput = function(u, t) {
    this._engine.setTextureFromPostProcessOutput(this._samplers[u], t, u);
  }, Me("BABYLON.PostProcess", We));
}
export {
  Ee as E,
  We as P,
  g as a
};
