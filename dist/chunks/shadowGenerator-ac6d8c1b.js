import { O as R, V as L, M as O, a as M, F as w, R as D, b as C, D as V, L as N, c as y, B as W, d as z, e as v, f as X, g as p, P as K, h as Q, i as Y, A as j, G as Z, _ as q, C as U, E as $ } from "./index-11ca32cf.js";
import { R as J, a as F, B as k } from "./blurPostProcess.pure-005fd63c.js";
import { P as G } from "./postProcess.pure-bf549f59.js";
import { R as ee } from "./shadowGeneratorSceneComponent.pure-da34ed75.js";
import "./babylonFileParser.function-d43bc945.js";
class n {
  /**
   * Gets the bias: offset applied on the depth preventing acnea (in light direction).
   */
  get bias() {
    return this._bias;
  }
  /**
   * Sets the bias: offset applied on the depth preventing acnea (in light direction).
   */
  set bias(e) {
    this._bias = e;
  }
  /**
   * Gets the normalBias: offset applied on the depth preventing acnea (along side the normal direction and proportional to the light/normal angle).
   */
  get normalBias() {
    return this._normalBias;
  }
  /**
   * Sets the normalBias: offset applied on the depth preventing acnea (along side the normal direction and proportional to the light/normal angle).
   */
  set normalBias(e) {
    this._normalBias = e;
  }
  /**
   * Gets the blur box offset: offset applied during the blur pass.
   * Only useful if useKernelBlur = false
   */
  get blurBoxOffset() {
    return this._blurBoxOffset;
  }
  /**
   * Sets the blur box offset: offset applied during the blur pass.
   * Only useful if useKernelBlur = false
   */
  set blurBoxOffset(e) {
    this._blurBoxOffset !== e && (this._blurBoxOffset = e, this._disposeBlurPostProcesses());
  }
  /**
   * Gets the blur scale: scale of the blurred texture compared to the main shadow map.
   * 2 means half of the size.
   */
  get blurScale() {
    return this._blurScale;
  }
  /**
   * Sets the blur scale: scale of the blurred texture compared to the main shadow map.
   * 2 means half of the size.
   */
  set blurScale(e) {
    this._blurScale !== e && (this._blurScale = e, this._disposeBlurPostProcesses());
  }
  /**
   * Gets the blur kernel: kernel size of the blur pass.
   * Only useful if useKernelBlur = true
   */
  get blurKernel() {
    return this._blurKernel;
  }
  /**
   * Sets the blur kernel: kernel size of the blur pass.
   * Only useful if useKernelBlur = true
   */
  set blurKernel(e) {
    this._blurKernel !== e && (this._blurKernel = e, this._disposeBlurPostProcesses());
  }
  /**
   * Gets whether the blur pass is a kernel blur (if true) or box blur.
   * Only useful in filtered mode (useBlurExponentialShadowMap...)
   */
  get useKernelBlur() {
    return this._useKernelBlur;
  }
  /**
   * Sets whether the blur pass is a kernel blur (if true) or box blur.
   * Only useful in filtered mode (useBlurExponentialShadowMap...)
   */
  set useKernelBlur(e) {
    this._useKernelBlur !== e && (this._useKernelBlur = e, this._disposeBlurPostProcesses());
  }
  /**
   * Gets the depth scale used in ESM mode.
   */
  get depthScale() {
    return this._depthScale !== void 0 ? this._depthScale : this._light.getDepthScale();
  }
  /**
   * Sets the depth scale used in ESM mode.
   * This can override the scale stored on the light.
   */
  set depthScale(e) {
    this._depthScale = e;
  }
  _validateFilter(e) {
    return e;
  }
  /**
   * Gets the current mode of the shadow generator (normal, PCF, ESM...).
   * The returned value is a number equal to one of the available mode defined in ShadowMap.FILTER_x like _FILTER_NONE
   */
  get filter() {
    return this._filter;
  }
  /**
   * Sets the current mode of the shadow generator (normal, PCF, ESM...).
   * The returned value is a number equal to one of the available mode defined in ShadowMap.FILTER_x like _FILTER_NONE
   */
  set filter(e) {
    if (e = this._validateFilter(e), this._light.needCube()) {
      if (e === n.FILTER_BLUREXPONENTIALSHADOWMAP) {
        this.useExponentialShadowMap = !0;
        return;
      } else if (e === n.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP) {
        this.useCloseExponentialShadowMap = !0;
        return;
      } else if (e === n.FILTER_PCF || e === n.FILTER_PCSS) {
        this.usePoissonSampling = !0;
        return;
      }
    }
    if ((e === n.FILTER_PCF || e === n.FILTER_PCSS) && !this._scene.getEngine()._features.supportShadowSamplers) {
      this.usePoissonSampling = !0;
      return;
    }
    this._filter !== e && (this._filter = e, this._disposeBlurPostProcesses(), this._applyFilterValues(), this._light._markMeshesAsLightDirty());
  }
  /**
   * Gets if the current filter is set to Poisson Sampling.
   */
  get usePoissonSampling() {
    return this.filter === n.FILTER_POISSONSAMPLING;
  }
  /**
   * Sets the current filter to Poisson Sampling.
   */
  set usePoissonSampling(e) {
    const t = this._validateFilter(n.FILTER_POISSONSAMPLING);
    !e && this.filter !== n.FILTER_POISSONSAMPLING || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets if the current filter is set to ESM.
   */
  get useExponentialShadowMap() {
    return this.filter === n.FILTER_EXPONENTIALSHADOWMAP;
  }
  /**
   * Sets the current filter is to ESM.
   */
  set useExponentialShadowMap(e) {
    const t = this._validateFilter(n.FILTER_EXPONENTIALSHADOWMAP);
    !e && this.filter !== n.FILTER_EXPONENTIALSHADOWMAP || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets if the current filter is set to filtered ESM.
   */
  get useBlurExponentialShadowMap() {
    return this.filter === n.FILTER_BLUREXPONENTIALSHADOWMAP;
  }
  /**
   * Gets if the current filter is set to filtered  ESM.
   */
  set useBlurExponentialShadowMap(e) {
    const t = this._validateFilter(n.FILTER_BLUREXPONENTIALSHADOWMAP);
    !e && this.filter !== n.FILTER_BLUREXPONENTIALSHADOWMAP || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets if the current filter is set to "close ESM" (using the inverse of the
   * exponential to prevent steep falloff artifacts).
   */
  get useCloseExponentialShadowMap() {
    return this.filter === n.FILTER_CLOSEEXPONENTIALSHADOWMAP;
  }
  /**
   * Sets the current filter to "close ESM" (using the inverse of the
   * exponential to prevent steep falloff artifacts).
   */
  set useCloseExponentialShadowMap(e) {
    const t = this._validateFilter(n.FILTER_CLOSEEXPONENTIALSHADOWMAP);
    !e && this.filter !== n.FILTER_CLOSEEXPONENTIALSHADOWMAP || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets if the current filter is set to filtered "close ESM" (using the inverse of the
   * exponential to prevent steep falloff artifacts).
   */
  get useBlurCloseExponentialShadowMap() {
    return this.filter === n.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP;
  }
  /**
   * Sets the current filter to filtered "close ESM" (using the inverse of the
   * exponential to prevent steep falloff artifacts).
   */
  set useBlurCloseExponentialShadowMap(e) {
    const t = this._validateFilter(n.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP);
    !e && this.filter !== n.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets if the current filter is set to "PCF" (percentage closer filtering).
   */
  get usePercentageCloserFiltering() {
    return this.filter === n.FILTER_PCF;
  }
  /**
   * Sets the current filter to "PCF" (percentage closer filtering).
   */
  set usePercentageCloserFiltering(e) {
    const t = this._validateFilter(n.FILTER_PCF);
    !e && this.filter !== n.FILTER_PCF || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets the PCF or PCSS Quality.
   * Only valid if usePercentageCloserFiltering or usePercentageCloserFiltering is true.
   */
  get filteringQuality() {
    return this._filteringQuality;
  }
  /**
   * Sets the PCF or PCSS Quality.
   * Only valid if usePercentageCloserFiltering or usePercentageCloserFiltering is true.
   */
  set filteringQuality(e) {
    this._filteringQuality !== e && (this._filteringQuality = e, this._disposeBlurPostProcesses(), this._applyFilterValues(), this._light._markMeshesAsLightDirty());
  }
  /**
   * Gets if the current filter is set to "PCSS" (contact hardening).
   */
  get useContactHardeningShadow() {
    return this.filter === n.FILTER_PCSS;
  }
  /**
   * Sets the current filter to "PCSS" (contact hardening).
   */
  set useContactHardeningShadow(e) {
    const t = this._validateFilter(n.FILTER_PCSS);
    !e && this.filter !== n.FILTER_PCSS || (this.filter = e ? t : n.FILTER_NONE);
  }
  /**
   * Gets the Light Size (in shadow map uv unit) used in PCSS to determine the blocker search area and the penumbra size.
   * Using a ratio helps keeping shape stability independently of the map size.
   *
   * It does not account for the light projection as it was having too much
   * instability during the light setup or during light position changes.
   *
   * Only valid if useContactHardeningShadow is true.
   */
  get contactHardeningLightSizeUVRatio() {
    return this._contactHardeningLightSizeUVRatio;
  }
  /**
   * Sets the Light Size (in shadow map uv unit) used in PCSS to determine the blocker search area and the penumbra size.
   * Using a ratio helps keeping shape stability independently of the map size.
   *
   * It does not account for the light projection as it was having too much
   * instability during the light setup or during light position changes.
   *
   * Only valid if useContactHardeningShadow is true.
   */
  set contactHardeningLightSizeUVRatio(e) {
    this._contactHardeningLightSizeUVRatio = e;
  }
  /** Gets or sets the actual darkness of a shadow */
  get darkness() {
    return this._darkness;
  }
  set darkness(e) {
    this.setDarkness(e);
  }
  /**
   * Returns the darkness value (float). This can only decrease the actual darkness of a shadow.
   * 0 means strongest and 1 would means no shadow.
   * @returns the darkness.
   */
  getDarkness() {
    return this._darkness;
  }
  /**
   * Sets the darkness value (float). This can only decrease the actual darkness of a shadow.
   * @param darkness The darkness value 0 means strongest and 1 would means no shadow.
   * @returns the shadow generator allowing fluent coding.
   */
  setDarkness(e) {
    return e >= 1 ? this._darkness = 1 : e <= 0 ? this._darkness = 0 : this._darkness = e, this;
  }
  /** Gets or sets the ability to have transparent shadow */
  get transparencyShadow() {
    return this._transparencyShadow;
  }
  set transparencyShadow(e) {
    this.setTransparencyShadow(e);
  }
  /**
   * Sets the ability to have transparent shadow (boolean).
   * @param transparent True if transparent else False
   * @returns the shadow generator allowing fluent coding
   */
  setTransparencyShadow(e) {
    return this._transparencyShadow = e, this;
  }
  /**
   * Gets the main RTT containing the shadow map (usually storing depth from the light point of view).
   * @returns The render target texture if present otherwise, null
   */
  getShadowMap() {
    return this._shadowMap;
  }
  /**
   * Gets the RTT used during rendering (can be a blurred version of the shadow map or the shadow map itself).
   * @returns The render target texture if the shadow map is present otherwise, null
   */
  getShadowMapForRendering() {
    return this._shadowMap2 ? this._shadowMap2 : this._shadowMap;
  }
  /**
   * Gets the class name of that object
   * @returns "ShadowGenerator"
   */
  getClassName() {
    return n.CLASSNAME;
  }
  /**
   * Helper function to add a mesh and its descendants to the list of shadow casters.
   * @param mesh Mesh to add
   * @param includeDescendants boolean indicating if the descendants should be added. Default to true
   * @returns the Shadow Generator itself
   */
  addShadowCaster(e, t = !0) {
    if (!this._shadowMap)
      return this;
    if (this._shadowMap.renderList || (this._shadowMap.renderList = []), this._shadowMap.renderList.indexOf(e) === -1 && this._shadowMap.renderList.push(e), t)
      for (const i of e.getChildMeshes())
        this._shadowMap.renderList.indexOf(i) === -1 && this._shadowMap.renderList.push(i);
    return this;
  }
  /**
   * Helper function to remove a mesh and its descendants from the list of shadow casters
   * @param mesh Mesh to remove
   * @param includeDescendants boolean indicating if the descendants should be removed. Default to true
   * @returns the Shadow Generator itself
   */
  removeShadowCaster(e, t = !0) {
    if (!this._shadowMap || !this._shadowMap.renderList)
      return this;
    const i = this._shadowMap.renderList.indexOf(e);
    if (i !== -1 && this._shadowMap.renderList.splice(i, 1), t)
      for (const s of e.getChildren())
        this.removeShadowCaster(s);
    return this;
  }
  /**
   * Returns the associated light object.
   * @returns the light generating the shadow
   */
  getLight() {
    return this._light;
  }
  /**
   * Gets the shader language used in this generator.
   */
  get shaderLanguage() {
    return this._shaderLanguage;
  }
  _getCamera() {
    return this._camera ?? this._scene.activeCamera;
  }
  /**
   * Gets or sets the size of the texture what stores the shadows
   */
  get mapSize() {
    return this._mapSize;
  }
  set mapSize(e) {
    this._mapSize = e, this._light._markMeshesAsLightDirty(), this.recreateShadowMap();
  }
  /**
   * Gets or sets the light that is casting the shadows
   */
  get light() {
    return this._light;
  }
  set light(e) {
    this._light !== e && (this.dispose(!1), this._light = e, this._createInstance());
  }
  /**
   * Gets or sets a value indicating whether the shadow map should use full float texture type (instead of half float, which is the default).
   * Use this option when you need more precision (for self shadowing, for instance).
   */
  get useFloat32TextureType() {
    return this._usefullFloatFirst;
  }
  set useFloat32TextureType(e) {
    this._usefullFloatFirst !== e && (this.dispose(!1), this._usefullFloatFirst = e, this._createInstance());
  }
  /**
   * Gets or sets the camera associated with this shadow generator.
   * When null, the scene's active camera is used at render time.
   */
  get camera() {
    return this._camera;
  }
  set camera(e) {
    this._camera !== e && (this.dispose(!1), this._camera = e, this._createInstance());
  }
  /**
   * Gets or sets a value indicating whether the shadow map should use a red-channel-only texture format.
   * Using a single-channel format reduces memory usage when color data is not needed.
   */
  get useRedTextureFormat() {
    return this._useRedTextureType;
  }
  set useRedTextureFormat(e) {
    this._useRedTextureType !== e && (this.dispose(!1), this._useRedTextureType = e, this._createInstance());
  }
  /**
   * Creates a ShadowGenerator object.
   * A ShadowGenerator is the required tool to use the shadows.
   * Each light casting shadows needs to use its own ShadowGenerator.
   * Documentation : https://doc.babylonjs.com/features/featuresDeepDive/lights/shadows
   * @param mapSize The size of the texture what stores the shadows. Example : 1024.
   * @param light The light object generating the shadows.
   * @param usefullFloatFirst By default the generator will try to use half float textures but if you need precision (for self shadowing for instance), you can use this option to enforce full float texture.
   * @param camera Camera associated with this shadow generator (default: null). If null, takes the scene active camera at the time we need to access it
   * @param useRedTextureType Forces the generator to use a Red instead of a RGBA type for the shadow map texture format (default: false)
   * @param forceGLSL defines a boolean indicating if the shader must be compiled in GLSL even if we are using WebGPU
   */
  constructor(e, t, i, s, a, r = !1) {
    this.onBeforeShadowMapRenderObservable = new R(), this.onAfterShadowMapRenderObservable = new R(), this.onBeforeShadowMapRenderMeshObservable = new R(), this.onAfterShadowMapRenderMeshObservable = new R(), this.doNotSerialize = !1, this._bias = 5e-5, this._normalBias = 0, this._blurBoxOffset = 1, this._blurScale = 2, this._blurKernel = 1, this._useKernelBlur = !1, this._filter = n.FILTER_NONE, this._filteringQuality = n.QUALITY_HIGH, this._contactHardeningLightSizeUVRatio = 0.1, this._darkness = 0, this._transparencyShadow = !1, this.enableSoftTransparentShadow = !1, this.useOpacityTextureForTransparentShadow = !1, this.frustumEdgeFalloff = 0, this._shaderLanguage = 0, this.forceBackFacesOnly = !1, this._lightDirection = L.Zero(), this._viewMatrix = O.Zero(), this._projectionMatrix = O.Zero(), this._transformMatrix = O.Zero(), this._cachedPosition = new L(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), this._cachedDirection = new L(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), this._currentFaceIndex = 0, this._currentFaceIndexCache = 0, this._defaultTextureMatrix = O.Identity(), this._shadersLoaded = !1, this._mapSize = e, this._light = t, this._usefullFloatFirst = !!i, this._scene = t.getScene(), this._camera = s ?? null, this._useRedTextureType = !!a, this._forceGLSL = r, this._createInstance();
  }
  _createInstance() {
    this._initShaderSourceAsync(this._forceGLSL);
    let e = this._light._shadowGenerators;
    e || (e = this._light._shadowGenerators = /* @__PURE__ */ new Map()), e.set(this._camera, this), this.id = this._light.id, this._useUBO = this._scene.getEngine().supportsUniformBuffers, this._useUBO && (this._sceneUBOs = [this._scene.createSceneUniformBuffer(`Scene for Shadow Generator (light "${this._light.name}")`, { forceMono: !0 })]), ee(n), n._SceneComponentInitialization(this._scene), J();
    const t = this._scene.getEngine().getCaps();
    this._usefullFloatFirst ? t.textureFloatRender && t.textureFloatLinearFiltering ? this._textureType = 1 : t.textureHalfFloatRender && t.textureHalfFloatLinearFiltering ? this._textureType = 2 : this._textureType = 0 : t.textureHalfFloatRender && t.textureHalfFloatLinearFiltering ? this._textureType = 2 : t.textureFloatRender && t.textureFloatLinearFiltering ? this._textureType = 1 : this._textureType = 0, this._initializeGenerator(), this._applyFilterValues();
  }
  _initializeGenerator() {
    this._light._markMeshesAsLightDirty(), this._initializeShadowMap();
  }
  _createTargetRenderTexture() {
    var t;
    const e = this._scene.getEngine();
    (t = this._shadowMap) == null || t.dispose(), e._features.supportDepthStencilTexture ? (this._shadowMap = new F(this._light.name + "_shadowMap", this._mapSize, this._scene, !1, !0, this._textureType, this._light.needCube(), void 0, !1, !1, void 0, this._useRedTextureType ? 6 : 5), this._shadowMap.createDepthStencilTexture(e.useReverseDepthBuffer ? 516 : 513, !0, void 0, void 0, void 0, `DepthStencilForShadowGenerator-${this._light.name}`)) : this._shadowMap = new F(this._light.name + "_shadowMap", this._mapSize, this._scene, !1, !0, this._textureType, this._light.needCube()), this._shadowMap.noPrePassRenderer = !0;
  }
  _initializeShadowMap() {
    if (this._createTargetRenderTexture(), this._shadowMap === null)
      return;
    this._shadowMap.wrapU = M.CLAMP_ADDRESSMODE, this._shadowMap.wrapV = M.CLAMP_ADDRESSMODE, this._shadowMap.anisotropicFilteringLevel = 1, this._shadowMap.updateSamplingMode(M.BILINEAR_SAMPLINGMODE), this._shadowMap.renderParticles = !1, this._shadowMap.ignoreCameraViewport = !0, this._storedUniqueId && (this._shadowMap.uniqueId = this._storedUniqueId), this._shadowMap.customRenderFunction = (s, a, r, h) => this._renderForShadowMap(s, a, r, h), this._shadowMap.customIsReadyFunction = (s, a, r) => {
      if (!r || !s.subMeshes)
        return !0;
      let h = !0;
      for (const u of s.subMeshes) {
        const c = u.getRenderingMesh(), o = this._scene.getEngine(), S = u.getMaterial();
        if (!S || u.verticesCount === 0 || this.customAllowRendering && !this.customAllowRendering(u))
          continue;
        const _ = c._getInstancesRenderList(u._id, !!u.getReplacementMesh());
        if (_.mustReturn)
          continue;
        const m = o.getCaps().instancedArrays && (_.visibleInstances[u._id] !== null && _.visibleInstances[u._id] !== void 0 || c.hasThinInstances), g = S.needAlphaBlendingForMesh(c);
        h = this.isReady(u, m, g) && h;
      }
      return h;
    };
    const e = this._scene.getEngine();
    this._shadowMap.onBeforeBindObservable.add(() => {
      var s;
      this._currentSceneUBO = this._scene.getSceneUniformBuffer(), e._enableGPUDebugMarkers && ((s = e._debugPushGroup) == null || s.call(e, `Shadow map generation for pass id ${e.currentRenderPassId}`));
    }), this._shadowMap.onBeforeRenderObservable.add((s) => {
      this._sceneUBOs && this._scene.setSceneUniformBuffer(this._sceneUBOs[0]), this._currentFaceIndex = s, this._filter === n.FILTER_PCF && e.setColorWrite(!1), this.getTransformMatrix(), w.eyeAtCamera = !1, this._scene.setTransformMatrix(this._viewMatrix, this._projectionMatrix), this._sceneUBOs && (this._scene.getSceneUniformBuffer().unbindEffect(), this._scene.finalizeSceneUbo());
    }), this._shadowMap.onAfterUnbindObservable.add(() => {
      var a, r;
      if (this._sceneUBOs && this._scene.setSceneUniformBuffer(this._currentSceneUBO), w.eyeAtCamera = !0, this._scene.updateTransformMatrix(), this._filter === n.FILTER_PCF && e.setColorWrite(!0), !this.useBlurExponentialShadowMap && !this.useBlurCloseExponentialShadowMap) {
        (a = e._debugPopGroup) == null || a.call(e);
        return;
      }
      const s = this.getShadowMapForRendering();
      s && (this._scene.postProcessManager.directRender(this._blurPostProcesses, s.renderTarget, !0), e.unBindFramebuffer(s.renderTarget, !0)), e._enableGPUDebugMarkers && ((r = e._debugPopGroup) == null || r.call(e));
    });
    const t = new U(0, 0, 0, 0), i = new U(1, 1, 1, 1);
    this._shadowMap.onClearObservable.add((s) => {
      this._filter === n.FILTER_PCF ? s.clear(i, !1, !0, !1) : this.useExponentialShadowMap || this.useBlurExponentialShadowMap ? s.clear(t, !0, !0, !1) : s.clear(i, !0, !0, !1);
    }), this._shadowMap.onResizeObservable.add((s) => {
      this._storedUniqueId = this._shadowMap.uniqueId, this._mapSize = s.getRenderSize(), this._light._markMeshesAsLightDirty(), this.recreateShadowMap();
    });
    for (let s = D.MIN_RENDERINGGROUPS; s < D.MAX_RENDERINGGROUPS; s++)
      this._shadowMap.setRenderingAutoClearDepthStencil(s, !1);
  }
  async _initShaderSourceAsync(e = !1) {
    this._scene.getEngine().isWebGPU && !e && !n.ForceGLSL ? (this._shaderLanguage = 1, await Promise.all([
      import("./shadowMap.fragment-dab0d0e7.js"),
      import("./shadowMap.vertex-e2baf5b0.js"),
      import("./depthBoxBlur.fragment-2e57062c.js"),
      import("./shadowMapFragmentSoftTransparentShadow-ac54c744.js")
    ])) : await Promise.all([
      import("./shadowMap.fragment-5866d0d0.js"),
      import("./shadowMap.vertex-b606702f.js"),
      import("./depthBoxBlur.fragment-236dd146.js"),
      import("./shadowMapFragmentSoftTransparentShadow-94bfdc42.js")
    ]), this._shadersLoaded = !0;
  }
  _initializeBlurRTTAndPostProcesses() {
    const e = this._scene.getEngine(), t = this._mapSize / this.blurScale;
    (!this.useKernelBlur || this.blurScale !== 1) && (this._shadowMap2 = new F(this._light.name + "_shadowMap2", t, this._scene, !1, !0, this._textureType, void 0, void 0, !1), this._shadowMap2.wrapU = M.CLAMP_ADDRESSMODE, this._shadowMap2.wrapV = M.CLAMP_ADDRESSMODE, this._shadowMap2.updateSamplingMode(M.BILINEAR_SAMPLINGMODE)), this.useKernelBlur ? (this._kernelBlurXPostprocess = new k(this._light.name + "KernelBlurX", new C(1, 0), this.blurKernel, 1, null, M.BILINEAR_SAMPLINGMODE, e, !1, this._textureType), this._kernelBlurXPostprocess.width = t, this._kernelBlurXPostprocess.height = t, this._kernelBlurXPostprocess.externalTextureSamplerBinding = !0, this._kernelBlurXPostprocess.onApplyObservable.add((i) => {
      i.setTexture("textureSampler", this._shadowMap);
    }), this._kernelBlurYPostprocess = new k(this._light.name + "KernelBlurY", new C(0, 1), this.blurKernel, 1, null, M.BILINEAR_SAMPLINGMODE, e, !1, this._textureType), this._kernelBlurXPostprocess.autoClear = !1, this._kernelBlurYPostprocess.autoClear = !1, this._textureType === 0 && (this._kernelBlurXPostprocess.packedFloat = !0, this._kernelBlurYPostprocess.packedFloat = !0), this._blurPostProcesses = [this._kernelBlurXPostprocess, this._kernelBlurYPostprocess]) : (this._boxBlurPostprocess = new G(this._light.name + "DepthBoxBlur", "depthBoxBlur", ["screenSize", "boxOffset"], [], 1, null, M.BILINEAR_SAMPLINGMODE, e, !1, "#define OFFSET " + this._blurBoxOffset, this._textureType, void 0, void 0, void 0, void 0, this._shaderLanguage), this._boxBlurPostprocess.externalTextureSamplerBinding = !0, this._boxBlurPostprocess.onApplyObservable.add((i) => {
      i.setFloat2("screenSize", t, t), i.setTexture("textureSampler", this._shadowMap);
    }), this._boxBlurPostprocess.autoClear = !1, this._blurPostProcesses = [this._boxBlurPostprocess]);
  }
  _renderForShadowMap(e, t, i, s) {
    let a;
    if (s.length)
      for (a = 0; a < s.length; a++)
        this._renderSubMeshForShadowMap(s.data[a]);
    for (a = 0; a < e.length; a++)
      this._renderSubMeshForShadowMap(e.data[a]);
    for (a = 0; a < t.length; a++)
      this._renderSubMeshForShadowMap(t.data[a]);
    if (this._transparencyShadow)
      for (a = 0; a < i.length; a++)
        this._renderSubMeshForShadowMap(i.data[a], !0);
    else
      for (a = 0; a < i.length; a++)
        i.data[a].getEffectiveMesh()._internalAbstractMeshDataInfo._isActiveIntermediate = !1;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _bindCustomEffectForRenderSubMeshForShadowMap(e, t, i) {
    t.setMatrix("viewProjection", this.getTransformMatrix());
  }
  _renderSubMeshForShadowMap(e, t = !1) {
    var m;
    const i = e.getRenderingMesh(), s = e.getEffectiveMesh(), a = this._scene, r = a.getEngine(), h = e.getMaterial();
    if (s._internalAbstractMeshDataInfo._isActiveIntermediate = !1, !h || e.verticesCount === 0 || e._renderId === a.getRenderId())
      return;
    const u = a.useRightHandedSystem, c = s._getWorldMatrixDeterminant() < 0;
    let f = h._getEffectiveOrientation(i);
    (c && !u || !c && u) && (f = f === 0 ? 1 : 0);
    const o = f === 0;
    r.setState(h.backFaceCulling, void 0, void 0, o, h.cullBackFaces);
    const S = i._getInstancesRenderList(e._id, !!e.getReplacementMesh());
    if (S.mustReturn)
      return;
    const _ = r.getCaps().instancedArrays && (S.visibleInstances[e._id] !== null && S.visibleInstances[e._id] !== void 0 || i.hasThinInstances);
    if (!(this.customAllowRendering && !this.customAllowRendering(e)))
      if (this.isReady(e, _, t)) {
        e._renderId = a.getRenderId();
        const g = h.shadowDepthWrapper, P = (g == null ? void 0 : g.getEffect(e, this, r.currentRenderPassId)) ?? e._getDrawWrapper(), l = V.GetEffect(P);
        r.enableEffect(P), _ || i._bind(e, l, h.fillMode), this.getTransformMatrix(), l.setFloat3("biasAndScaleSM", this.bias, this.normalBias, this.depthScale), this.getLight().getTypeID() === N.LIGHTTYPEID_DIRECTIONALLIGHT ? l.setVector3("lightDataSM", this._cachedDirection) : l.setVector3("lightDataSM", this._cachedPosition.subtractToRef(this._scene.floatingOriginOffset, y.Vector3[0]));
        const B = this._getCamera();
        if (l.setFloat2("depthValuesSM", this.getLight().getDepthMinZ(B), this.getLight().getDepthMinZ(B) + this.getLight().getDepthMaxZ(B)), t && this.enableSoftTransparentShadow && l.setFloat2("softTransparentShadowSM", s.visibility * h.alpha, (m = this._opacityTexture) != null && m.getAlphaFromRGB ? 1 : 0), g)
          e._setMainDrawWrapperOverride(P), g.standalone ? g.baseMaterial.bindForSubMesh(s.getWorldMatrix(), i, e) : h.bindForSubMesh(s.getWorldMatrix(), i, e), e._setMainDrawWrapperOverride(null);
        else {
          this._opacityTexture && (l.setTexture("diffuseSampler", this._opacityTexture), l.setMatrix("diffuseMatrix", this._opacityTexture.getTextureMatrix() || this._defaultTextureMatrix)), W(i, l), z(i, l), i.morphTargetManager && i.morphTargetManager.isUsingTextureForTargets && i.morphTargetManager._bind(l);
          const E = e.getMesh().bakedVertexAnimationManager;
          E && E.isEnabled && E.bind(l, _), v(l, h, a);
        }
        !this._useUBO && !g && this._bindCustomEffectForRenderSubMeshForShadowMap(e, l, s), X(l, this._scene.getSceneUniformBuffer()), this._scene.getSceneUniformBuffer().bindUniformBuffer();
        const x = s.getWorldMatrix();
        _ && (s.getMeshUniformBuffer().bindToEffect(l, "Mesh"), s.transferToEffect(x)), this.forceBackFacesOnly && r.setState(!0, 0, !1, !0, h.cullBackFaces), this.onBeforeShadowMapRenderMeshObservable.notifyObservers(i), this.onBeforeShadowMapRenderObservable.notifyObservers(l), i._processRendering(s, e, l, h.fillMode, S, _, (E, d) => {
          s !== i && !E ? (i.getMeshUniformBuffer().bindToEffect(l, "Mesh"), i.transferToEffect(d)) : (s.getMeshUniformBuffer().bindToEffect(l, "Mesh"), s.transferToEffect(E ? d : x));
        }), this.forceBackFacesOnly && r.setState(!0, 0, !1, !1, h.cullBackFaces), this.onAfterShadowMapRenderObservable.notifyObservers(l), this.onAfterShadowMapRenderMeshObservable.notifyObservers(i);
      } else
        this._shadowMap && this._shadowMap.resetRefreshCounter();
  }
  _applyFilterValues() {
    this._shadowMap && (this.filter === n.FILTER_NONE || this.filter === n.FILTER_PCSS ? this._shadowMap.updateSamplingMode(M.NEAREST_SAMPLINGMODE) : this._shadowMap.updateSamplingMode(M.BILINEAR_SAMPLINGMODE));
  }
  /**
   * Forces all the attached effect to compile to enable rendering only once ready vs. lazily compiling effects.
   * @param onCompiled Callback triggered at the and of the effects compilation
   * @param options Sets of optional options forcing the compilation with different modes
   */
  forceCompilation(e, t) {
    const i = {
      useInstances: !1,
      ...t
    }, s = this.getShadowMap();
    if (!s) {
      e && e(this);
      return;
    }
    const a = s.renderList;
    if (!a) {
      e && e(this);
      return;
    }
    const r = [];
    for (const c of a)
      r.push(...c.subMeshes);
    if (r.length === 0) {
      e && e(this);
      return;
    }
    let h = 0;
    const u = () => {
      var c;
      if (!(!this._scene || !this._scene.getEngine())) {
        for (; this.isReady(r[h], i.useInstances, ((c = r[h].getMaterial()) == null ? void 0 : c.needAlphaBlendingForMesh(r[h].getMesh())) ?? !1); )
          if (h++, h >= r.length) {
            e && e(this);
            return;
          }
        setTimeout(u, 16);
      }
    };
    u();
  }
  /**
   * Forces all the attached effect to compile to enable rendering only once ready vs. lazily compiling effects.
   * @param options Sets of optional options forcing the compilation with different modes
   * @returns A promise that resolves when the compilation completes
   */
  async forceCompilationAsync(e) {
    return await new Promise((t) => {
      this.forceCompilation(() => {
        t();
      }, e);
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _isReadyCustomDefines(e, t, i) {
  }
  _prepareShadowDefines(e, t, i, s) {
    i.push("#define SM_LIGHTTYPE_" + this._light.getClassName().toUpperCase()), i.push("#define SM_FLOAT " + (this._textureType !== 0 ? "1" : "0")), i.push("#define SM_ESM " + (this.useExponentialShadowMap || this.useBlurExponentialShadowMap ? "1" : "0")), i.push("#define SM_DEPTHTEXTURE " + (this.usePercentageCloserFiltering || this.useContactHardeningShadow ? "1" : "0"));
    const a = e.getMesh();
    return i.push("#define SM_NORMALBIAS " + (this.normalBias && a.isVerticesDataPresent(p.NormalKind) ? "1" : "0")), i.push("#define SM_DIRECTIONINLIGHTDATA " + (this.getLight().getTypeID() === N.LIGHTTYPEID_DIRECTIONALLIGHT ? "1" : "0")), i.push("#define SM_USEDISTANCE " + (this._light.needCube() ? "1" : "0")), i.push("#define SM_SOFTTRANSPARENTSHADOW " + (this.enableSoftTransparentShadow && s ? "1" : "0")), this._isReadyCustomDefines(i, e, t), i;
  }
  /**
   * Determine whether the shadow generator is ready or not (mainly all effects and related post processes needs to be ready).
   * @param subMesh The submesh we want to render in the shadow map
   * @param useInstances Defines whether will draw in the map using instances
   * @param isTransparent Indicates that isReady is called for a transparent subMesh
   * @returns true if ready otherwise, false
   */
  isReady(e, t, i) {
    if (!this._shadersLoaded)
      return !1;
    const s = e.getMaterial(), a = s == null ? void 0 : s.shadowDepthWrapper;
    if (this._opacityTexture = null, !s)
      return !1;
    const r = [];
    if (this._prepareShadowDefines(e, t, r, i), a) {
      if (!a.isReadyForSubMesh(e, r, this, t, this._scene.getEngine().currentRenderPassId))
        return !1;
    } else {
      const h = e._getDrawWrapper(void 0, !0);
      let u = h.effect, c = h.defines;
      const f = [p.PositionKind], o = e.getMesh();
      let S = !1, _ = !1, m = !1;
      const g = !1;
      this.normalBias && o.isVerticesDataPresent(p.NormalKind) && (f.push(p.NormalKind), r.push("#define NORMAL"), S = !0, o.nonUniformScaling && r.push("#define NONUNIFORMSCALING"));
      const P = s.needAlphaTestingForMesh(o);
      if ((P || s.needAlphaBlendingForMesh(o)) && (this.useOpacityTextureForTransparentShadow ? this._opacityTexture = s.opacityTexture : this._opacityTexture = s.getAlphaTestTexture(), this._opacityTexture)) {
        if (!this._opacityTexture.isReady())
          return !1;
        const d = s.alphaCutOff ?? n.DEFAULT_ALPHA_CUTOFF;
        r.push("#define ALPHATEXTURE"), P && r.push(`#define ALPHATESTVALUE ${d}${d % 1 === 0 ? "." : ""}`), o.isVerticesDataPresent(p.UVKind) && (f.push(p.UVKind), r.push("#define UV1"), _ = !0), o.isVerticesDataPresent(p.UV2Kind) && this._opacityTexture.coordinatesIndex === 1 && (f.push(p.UV2Kind), r.push("#define UV2"), m = !0);
      }
      const l = new $();
      if (o.useBones && o.computeBonesUsingShaders && o.skeleton) {
        f.push(p.MatricesIndicesKind), f.push(p.MatricesWeightsKind), o.numBoneInfluencers > 4 && (f.push(p.MatricesIndicesExtraKind), f.push(p.MatricesWeightsExtraKind));
        const d = o.skeleton;
        r.push("#define NUM_BONE_INFLUENCERS " + o.numBoneInfluencers), o.numBoneInfluencers > 0 && l.addCPUSkinningFallback(0, o), d.isUsingTextureForMatrices ? r.push("#define BONETEXTURE") : r.push("#define BonesPerMesh " + (d.bones.length + 1));
      } else
        r.push("#define NUM_BONE_INFLUENCERS 0");
      const B = o.morphTargetManager ? K(
        o.morphTargetManager,
        r,
        f,
        o,
        !0,
        // usePositionMorph
        S,
        // useNormalMorph
        !1,
        // useTangentMorph
        _,
        // useUVMorph
        m,
        // useUV2Morph
        g
        // useColorMorph
      ) : 0;
      if (Q(s, this._scene, r), t && (r.push("#define INSTANCES"), Y(f), e.getRenderingMesh().hasThinInstances && r.push("#define THIN_INSTANCES")), this.customShaderOptions && this.customShaderOptions.defines)
        for (const d of this.customShaderOptions.defines)
          r.indexOf(d) === -1 && r.push(d);
      const x = o.bakedVertexAnimationManager;
      x && x.isEnabled && (r.push("#define BAKED_VERTEX_ANIMATION_TEXTURE"), t && f.push("bakedVertexAnimationSettingsInstanced"));
      const E = r.join(`
`);
      if (c !== E) {
        c = E;
        let d = "shadowMap";
        const A = [
          "world",
          "mBones",
          "viewProjection",
          "diffuseMatrix",
          "lightDataSM",
          "depthValuesSM",
          "biasAndScaleSM",
          "morphTargetInfluences",
          "morphTargetCount",
          "boneTextureInfo",
          "softTransparentShadowSM",
          "morphTargetTextureInfo",
          "morphTargetTextureIndices",
          "bakedVertexAnimationSettings",
          "bakedVertexAnimationTextureSizeInverted",
          "bakedVertexAnimationTime",
          "bakedVertexAnimationTexture"
        ], I = ["diffuseSampler", "boneSampler", "morphTargets", "bakedVertexAnimationTexture"], H = ["Scene", "Mesh"];
        if (j(A), this.customShaderOptions) {
          if (d = this.customShaderOptions.shaderName, this.customShaderOptions.attributes)
            for (const T of this.customShaderOptions.attributes)
              f.indexOf(T) === -1 && f.push(T);
          if (this.customShaderOptions.uniforms)
            for (const T of this.customShaderOptions.uniforms)
              A.indexOf(T) === -1 && A.push(T);
          if (this.customShaderOptions.samplers)
            for (const T of this.customShaderOptions.samplers)
              I.indexOf(T) === -1 && I.push(T);
        }
        const b = this._scene.getEngine();
        u = b.createEffect(d, {
          attributes: f,
          uniformsNames: A,
          uniformBuffersNames: H,
          samplers: I,
          defines: E,
          fallbacks: l,
          onCompiled: null,
          onError: null,
          indexParameters: { maxSimultaneousMorphTargets: B },
          shaderLanguage: this._shaderLanguage
        }, b), h.setEffect(u, c);
      }
      if (!u.isReady())
        return !1;
    }
    return (this.useBlurExponentialShadowMap || this.useBlurCloseExponentialShadowMap) && (!this._blurPostProcesses || !this._blurPostProcesses.length) && this._initializeBlurRTTAndPostProcesses(), !(this._kernelBlurXPostprocess && !this._kernelBlurXPostprocess.isReady() || this._kernelBlurYPostprocess && !this._kernelBlurYPostprocess.isReady() || this._boxBlurPostprocess && !this._boxBlurPostprocess.isReady());
  }
  /**
   * Prepare all the defines in a material relying on a shadow map at the specified light index.
   * @param defines Defines of the material we want to update
   * @param lightIndex Index of the light in the enabled light list of the material
   */
  prepareDefines(e, t) {
    const i = this._scene, s = this._light;
    !i.shadowsEnabled || !s.shadowEnabled || (e["SHADOW" + t] = !0, this.useContactHardeningShadow ? (e["SHADOWPCSS" + t] = !0, this._filteringQuality === n.QUALITY_LOW ? e["SHADOWLOWQUALITY" + t] = !0 : this._filteringQuality === n.QUALITY_MEDIUM && (e["SHADOWMEDIUMQUALITY" + t] = !0)) : this.usePercentageCloserFiltering ? (e["SHADOWPCF" + t] = !0, this._filteringQuality === n.QUALITY_LOW ? e["SHADOWLOWQUALITY" + t] = !0 : this._filteringQuality === n.QUALITY_MEDIUM && (e["SHADOWMEDIUMQUALITY" + t] = !0)) : this.usePoissonSampling ? e["SHADOWPOISSON" + t] = !0 : this.useExponentialShadowMap || this.useBlurExponentialShadowMap ? e["SHADOWESM" + t] = !0 : (this.useCloseExponentialShadowMap || this.useBlurCloseExponentialShadowMap) && (e["SHADOWCLOSEESM" + t] = !0), s.needCube() && (e["SHADOWCUBE" + t] = !0));
  }
  /**
   * Binds the shadow related information inside of an effect (information like near, far, darkness...
   * defined in the generator but impacting the effect).
   * @param lightIndex Index of the light in the enabled light list of the material owning the effect
   * @param effect The effect we are binding the information for
   */
  bindShadowLight(e, t) {
    const i = this._light, s = this._scene;
    if (!s.shadowsEnabled || !i.shadowEnabled)
      return;
    const a = this._getCamera(), r = this.getShadowMap();
    if (!r)
      return;
    if (!i.needCube()) {
      const u = s.floatingOriginOffset, c = this.getTransformMatrix(), f = s.floatingOriginMode ? Z(u, this._viewMatrix, this._projectionMatrix, y.Matrix[0]) : c;
      t.setMatrix("lightMatrix" + e, f);
    }
    const h = this.getShadowMapForRendering();
    this._filter === n.FILTER_PCF ? (t.setDepthStencilTexture("shadowTexture" + e, h), i._uniformBuffer.updateFloat4("shadowsInfo", this.getDarkness(), r.getSize().width, 1 / r.getSize().width, this.frustumEdgeFalloff, e)) : this._filter === n.FILTER_PCSS ? (t.setDepthStencilTexture("shadowTexture" + e, h), t.setTexture("depthTexture" + e, h), i._uniformBuffer.updateFloat4("shadowsInfo", this.getDarkness(), 1 / r.getSize().width, this._contactHardeningLightSizeUVRatio * r.getSize().width, this.frustumEdgeFalloff, e)) : (t.setTexture("shadowTexture" + e, h), i._uniformBuffer.updateFloat4("shadowsInfo", this.getDarkness(), this.blurScale / r.getSize().width, this.depthScale, this.frustumEdgeFalloff, e)), i._uniformBuffer.updateFloat2("depthValues", this.getLight().getDepthMinZ(a), this.getLight().getDepthMinZ(a) + this.getLight().getDepthMaxZ(a), e);
  }
  /**
   * Gets the view matrix used to render the shadow map.
   */
  get viewMatrix() {
    return this._viewMatrix;
  }
  /**
   * Gets the projection matrix used to render the shadow map.
   */
  get projectionMatrix() {
    return this._projectionMatrix;
  }
  /**
   * Gets the transformation matrix used to project the meshes into the map from the light point of view.
   * (eq to shadow projection matrix * light transform matrix)
   * @returns The transform matrix used to create the shadow map
   */
  getTransformMatrix() {
    const e = this._scene;
    if (this._currentRenderId === e.getRenderId() && this._currentFaceIndexCache === this._currentFaceIndex)
      return this._transformMatrix;
    this._currentRenderId = e.getRenderId(), this._currentFaceIndexCache = this._currentFaceIndex;
    let t = this._light.position;
    if (this._light.computeTransformedInformation() && (t = this._light.transformedPosition), L.NormalizeToRef(this._light.getShadowDirection(this._currentFaceIndex), this._lightDirection), Math.abs(L.Dot(this._lightDirection, L.Up())) === 1 && (this._lightDirection.z = 1e-13), this._light.needProjectionMatrixCompute() || !this._cachedPosition || !this._cachedDirection || !t.equals(this._cachedPosition) || !this._lightDirection.equals(this._cachedDirection)) {
      this._cachedPosition.copyFrom(t), this._cachedDirection.copyFrom(this._lightDirection), O.LookAtLHToRef(t, t.add(this._lightDirection), L.Up(), this._viewMatrix);
      const i = this.getShadowMap();
      if (i) {
        const s = i.renderList;
        s && this._light.setShadowProjectionMatrix(this._projectionMatrix, this._viewMatrix, s);
      }
      this._viewMatrix.multiplyToRef(this._projectionMatrix, this._transformMatrix);
    }
    return this._transformMatrix;
  }
  /**
   * Recreates the shadow map dependencies like RTT and post processes. This can be used during the switch between
   * Cube and 2D textures for instance.
   */
  recreateShadowMap() {
    const e = this._shadowMap;
    if (!e)
      return;
    const t = e.renderList;
    if (this._disposeRTTandPostProcesses(), this._initializeGenerator(), this.filter = this._filter, this._applyFilterValues(), t) {
      this._shadowMap.renderList || (this._shadowMap.renderList = []);
      for (const i of t)
        this._shadowMap.renderList.push(i);
    } else
      this._shadowMap.renderList = null;
  }
  _disposeBlurPostProcesses() {
    this._shadowMap2 && (this._shadowMap2.dispose(), this._shadowMap2 = null), this._boxBlurPostprocess && (this._boxBlurPostprocess.dispose(), this._boxBlurPostprocess = null), this._kernelBlurXPostprocess && (this._kernelBlurXPostprocess.dispose(), this._kernelBlurXPostprocess = null), this._kernelBlurYPostprocess && (this._kernelBlurYPostprocess.dispose(), this._kernelBlurYPostprocess = null), this._blurPostProcesses = [];
  }
  _disposeRTTandPostProcesses() {
    this._shadowMap && (this._shadowMap.dispose(), this._shadowMap = null), this._disposeBlurPostProcesses();
  }
  _disposeSceneUBOs() {
    if (this._sceneUBOs) {
      for (const e of this._sceneUBOs)
        e.dispose();
      this._sceneUBOs = [];
    }
  }
  /**
   * Disposes the ShadowGenerator.
   * @param clearObservables Defines whether to clear the observables or not (true by default).
   * Returns nothing.
   */
  dispose(e = !0) {
    if (this._disposeRTTandPostProcesses(), this._disposeSceneUBOs(), this._light) {
      if (this._light._shadowGenerators) {
        const t = this._light._shadowGenerators.entries();
        for (let i = t.next(); i.done !== !0; i = t.next()) {
          const [s, a] = i.value;
          a === this && this._light._shadowGenerators.delete(s);
        }
        this._light._shadowGenerators.size === 0 && (this._light._shadowGenerators = null);
      }
      this._light._markMeshesAsLightDirty();
    }
    e && (this.onBeforeShadowMapRenderMeshObservable.clear(), this.onBeforeShadowMapRenderObservable.clear(), this.onAfterShadowMapRenderMeshObservable.clear(), this.onAfterShadowMapRenderObservable.clear());
  }
  /**
   * Serializes the shadow generator setup to a json object.
   * @returns The serialized JSON object
   */
  serialize() {
    var i;
    const e = {}, t = this.getShadowMap();
    if (!t)
      return e;
    if (e.className = this.getClassName(), e.lightId = this._light.id, e.cameraId = (i = this._camera) == null ? void 0 : i.id, e.id = this.id, e.mapSize = t.getRenderSize(), e.forceBackFacesOnly = this.forceBackFacesOnly, e.darkness = this.getDarkness(), e.transparencyShadow = this._transparencyShadow, e.frustumEdgeFalloff = this.frustumEdgeFalloff, e.bias = this.bias, e.normalBias = this.normalBias, e.usePercentageCloserFiltering = this.usePercentageCloserFiltering, e.useContactHardeningShadow = this.useContactHardeningShadow, e.contactHardeningLightSizeUVRatio = this.contactHardeningLightSizeUVRatio, e.filteringQuality = this.filteringQuality, e.useExponentialShadowMap = this.useExponentialShadowMap, e.useBlurExponentialShadowMap = this.useBlurExponentialShadowMap, e.useCloseExponentialShadowMap = this.useBlurExponentialShadowMap, e.useBlurCloseExponentialShadowMap = this.useBlurExponentialShadowMap, e.usePoissonSampling = this.usePoissonSampling, e.depthScale = this.depthScale, e.blurBoxOffset = this.blurBoxOffset, e.blurKernel = this.blurKernel, e.blurScale = this.blurScale, e.useKernelBlur = this.useKernelBlur, e.renderList = [], t.renderList)
      for (let s = 0; s < t.renderList.length; s++) {
        const a = t.renderList[s];
        e.renderList.push(a.id);
      }
    return e;
  }
  /**
   * Parses a serialized ShadowGenerator and returns a new ShadowGenerator.
   * @param parsedShadowGenerator The JSON object to parse
   * @param scene The scene to create the shadow map for
   * @param constr A function that builds a shadow generator or undefined to create an instance of the default shadow generator
   * @returns The parsed shadow generator
   */
  static Parse(e, t, i) {
    const s = t.getLightById(e.lightId), a = e.cameraId !== void 0 ? t.getCameraById(e.cameraId) : null, r = i ? i(e.mapSize, s, a) : new n(e.mapSize, s, void 0, a), h = r.getShadowMap();
    if (e.renderList.length && h) {
      const u = new Set(e.renderList);
      let c = h.renderList;
      c || (c = h.renderList = []);
      const f = t.meshes;
      for (const o of f)
        u.has(o.id) && c.push(o);
    }
    return e.id !== void 0 && (r.id = e.id), r.forceBackFacesOnly = !!e.forceBackFacesOnly, e.darkness !== void 0 && r.setDarkness(e.darkness), e.transparencyShadow && r.setTransparencyShadow(!0), e.frustumEdgeFalloff !== void 0 && (r.frustumEdgeFalloff = e.frustumEdgeFalloff), e.bias !== void 0 && (r.bias = e.bias), e.normalBias !== void 0 && (r.normalBias = e.normalBias), e.usePercentageCloserFiltering ? r.usePercentageCloserFiltering = !0 : e.useContactHardeningShadow ? r.useContactHardeningShadow = !0 : e.usePoissonSampling ? r.usePoissonSampling = !0 : e.useExponentialShadowMap ? r.useExponentialShadowMap = !0 : e.useBlurExponentialShadowMap ? r.useBlurExponentialShadowMap = !0 : e.useCloseExponentialShadowMap ? r.useCloseExponentialShadowMap = !0 : e.useBlurCloseExponentialShadowMap ? r.useBlurCloseExponentialShadowMap = !0 : e.useVarianceShadowMap ? r.useExponentialShadowMap = !0 : e.useBlurVarianceShadowMap && (r.useBlurExponentialShadowMap = !0), e.contactHardeningLightSizeUVRatio !== void 0 && (r.contactHardeningLightSizeUVRatio = e.contactHardeningLightSizeUVRatio), e.filteringQuality !== void 0 && (r.filteringQuality = e.filteringQuality), e.depthScale && (r.depthScale = e.depthScale), e.blurScale && (r.blurScale = e.blurScale), e.blurBoxOffset && (r.blurBoxOffset = e.blurBoxOffset), e.useKernelBlur && (r.useKernelBlur = e.useKernelBlur), e.blurKernel && (r.blurKernel = e.blurKernel), r;
  }
}
n.CLASSNAME = "ShadowGenerator";
n.ForceGLSL = !1;
n.FILTER_NONE = 0;
n.FILTER_EXPONENTIALSHADOWMAP = 1;
n.FILTER_POISSONSAMPLING = 2;
n.FILTER_BLUREXPONENTIALSHADOWMAP = 3;
n.FILTER_CLOSEEXPONENTIALSHADOWMAP = 4;
n.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP = 5;
n.FILTER_PCF = 6;
n.FILTER_PCSS = 7;
n.QUALITY_HIGH = 0;
n.QUALITY_MEDIUM = 1;
n.QUALITY_LOW = 2;
n.DEFAULT_ALPHA_CUTOFF = 0.5;
n._SceneComponentInitialization = (te) => {
  throw q("ShadowGeneratorSceneComponent");
};
n._CascadedShadowGeneratorParser = null;
export {
  n as ShadowGenerator
};
