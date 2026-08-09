import { X as C, z as V, v as R, w as D, I as T, S as A, af as X, C as U, O as b, g as E, ag as ne, ah as P, P as ae, i as oe, h as he, A as le, D as de, B as fe, d as ce, e as ue, E as _e, _ as ge, ai as me, y as W, a as y, Q as pe, J as Ee, aj as be, b as v, n as xe, p as Se, ak as ye, N as Re } from "./index-11ca32cf.js";
import { A as Me } from "./babylonFileParser.function-d43bc945.js";
import { O as Te, a as se, T as Q, B as Z } from "./blurPostProcess.pure-005fd63c.js";
import { a as j, P as q } from "./postProcess.pure-bf549f59.js";
class O extends j {
  _gatherImports(e, t) {
    e ? (this._webGPUReady = !0, t.push(Promise.all([import("./pass.fragment-075cb7dd.js")]))) : t.push(Promise.all([import("./pass.fragment-0e46c1ba.js")])), super._gatherImports(e, t);
  }
  /**
   * Constructs a new pass post process
   * @param name Name of the effect
   * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
   * @param options Options to configure the effect
   */
  constructor(e, t = null, s) {
    const n = {
      name: e,
      engine: t || C.LastCreatedEngine,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: O.FragmentUrl,
      ...s
    };
    n.engine || (n.engine = C.LastCreatedEngine), super(n);
  }
}
O.FragmentUrl = "pass";
class H extends j {
  _gatherImports(e, t) {
    e ? (this._webGPUReady = !0, t.push(Promise.all([import("./passCube.fragment-d328ea22.js")]))) : t.push(Promise.all([import("./passCube.fragment-4b5dd62a.js")])), super._gatherImports(e, t);
  }
  /**
   * Creates the PassCubePostProcess
   * @param name Name of the effect
   * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
   * @param options Options to configure the effect
   */
  constructor(e, t = null, s) {
    super({
      ...s,
      name: e,
      engine: t || C.LastCreatedEngine,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: H.FragmentUrl,
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
H.FragmentUrl = "passCube";
class K extends q {
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
  constructor(e, t, s = null, n, a, l, o = 0, h = !1) {
    const r = {
      size: typeof t == "number" ? t : void 0,
      camera: s,
      samplingMode: n,
      engine: a,
      reusable: l,
      textureType: o,
      blockCompilation: h,
      ...t
    };
    super(e, O.FragmentUrl, {
      effectWrapper: typeof t == "number" || !t.effectWrapper ? new O(e, a, r) : void 0,
      ...r
    });
  }
  /**
   * @internal
   */
  static _Parse(e, t, s, n) {
    return V.Parse(() => new K(e.name, e.options, t, e.renderTargetSamplingMode, e._engine, e.reusable), e, s, n);
  }
}
(() => {
  var f;
  let e = q, t = [], s;
  return f = class extends e {
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
    set face(a) {
      this._effectWrapper.face = a;
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
    constructor(a, l, o = null, h, r, c, u = 0, i = !1) {
      const d = {
        size: typeof l == "number" ? l : void 0,
        camera: o,
        samplingMode: h,
        engine: r,
        reusable: c,
        textureType: u,
        blockCompilation: i,
        ...l
      };
      super(a, O.FragmentUrl, {
        effectWrapper: typeof l == "number" || !l.effectWrapper ? new H(a, r, d) : void 0,
        ...d
      }), D(this, t);
    }
    /**
     * @internal
     */
    static _Parse(a, l, o, h) {
      return V.Parse(() => new f(a.name, a.options, l, a.renderTargetSamplingMode, a._engine, a.reusable), a, o, h);
    }
  }, (() => {
    const n = typeof Symbol == "function" && Symbol.metadata ? Object.create(e[Symbol.metadata] ?? null) : void 0;
    s = [T()], R(f, null, s, { kind: "getter", name: "face", static: !1, private: !1, access: { has: (a) => "face" in a, get: (a) => a.face }, metadata: n }, null, t), n && Object.defineProperty(f, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: n });
  })(), f;
})();
class Le {
  /**
   * Creates a new instance of the component for the given scene
   * @param scene Defines the scene to register the component in
   */
  constructor(e) {
    this.name = A.NAME_EFFECTLAYER, this._renderEffects = !1, this._needStencil = !1, this._previousStencilState = !1, this.scene = e || C.LastCreatedScene, this.scene && (this._engine = this.scene.getEngine());
  }
  /**
   * Registers the component in a given scene
   */
  register() {
    this.scene._isReadyForMeshStage.registerStep(A.STEP_ISREADYFORMESH_EFFECTLAYER, this, this._isReadyForMesh), this.scene._cameraDrawRenderTargetStage.registerStep(A.STEP_CAMERADRAWRENDERTARGET_EFFECTLAYER, this, this._renderMainTexture), this.scene._beforeCameraDrawStage.registerStep(A.STEP_BEFORECAMERADRAW_EFFECTLAYER, this, this._setStencil), this.scene._afterRenderingGroupDrawStage.registerStep(A.STEP_AFTERRENDERINGGROUPDRAW_EFFECTLAYER_DRAW, this, this._drawRenderingGroup), this.scene._afterCameraDrawStage.registerStep(A.STEP_AFTERCAMERADRAW_EFFECTLAYER, this, this._setStencilBack), this.scene._afterCameraDrawStage.registerStep(A.STEP_AFTERCAMERADRAW_EFFECTLAYER_DRAW, this, this._drawCamera);
  }
  /**
   * Rebuilds the elements related to this component in case of
   * context lost for instance.
   */
  rebuild() {
    const e = this.scene.effectLayers;
    for (const t of e)
      t._rebuild();
  }
  /**
   * Serializes the component data to the specified json object
   * @param serializationObject The object to serialize to
   */
  serialize(e) {
    e.effectLayers = [];
    const t = this.scene.effectLayers;
    for (const s of t)
      s.serialize && e.effectLayers.push(s.serialize());
  }
  /**
   * Adds all the elements from the container to the scene
   * @param container the container holding the elements
   */
  addFromContainer(e) {
    if (e.effectLayers)
      for (const t of e.effectLayers)
        this.scene.addEffectLayer(t);
  }
  /**
   * Removes all the elements in the container from the scene
   * @param container contains the elements to remove
   * @param dispose if the removed element should be disposed (default: false)
   */
  removeFromContainer(e, t) {
    if (e.effectLayers)
      for (const s of e.effectLayers)
        this.scene.removeEffectLayer(s), t && s.dispose();
  }
  /**
   * Disposes the component and the associated resources.
   */
  dispose() {
    const e = this.scene.effectLayers;
    for (; e.length; )
      e[0].dispose();
  }
  _isReadyForMesh(e, t) {
    const s = this._engine.currentRenderPassId, n = this.scene.effectLayers;
    for (const a of n) {
      if (!a.hasMesh(e))
        continue;
      const l = a._mainTexture;
      this._engine.currentRenderPassId = l.renderPassId;
      for (const o of e.subMeshes)
        if (!a.isReady(o, t))
          return this._engine.currentRenderPassId = s, !1;
    }
    return this._engine.currentRenderPassId = s, !0;
  }
  _renderMainTexture(e) {
    this._renderEffects = !1, this._needStencil = !1;
    let t = !1;
    const s = this.scene.effectLayers;
    if (s && s.length > 0) {
      this._previousStencilState = this._engine.getStencilBuffer();
      for (const n of s)
        if (n.shouldRender() && (!n.camera || n.camera.cameraRigMode === X.RIG_MODE_NONE && e === n.camera || n.camera.cameraRigMode !== X.RIG_MODE_NONE && n.camera._rigCameras.indexOf(e) > -1)) {
          this._renderEffects = !0, this._needStencil = this._needStencil || n.needStencil();
          const a = n._mainTexture;
          a._shouldRender() && (this.scene.incrementRenderId(), a.render(!1, !1), t = !0);
        }
      this.scene.incrementRenderId();
    }
    return t;
  }
  _setStencil() {
    this._needStencil && this._engine.setStencilBuffer(!0);
  }
  _setStencilBack() {
    this._needStencil && this._engine.setStencilBuffer(this._previousStencilState);
  }
  _draw(e) {
    if (this._renderEffects) {
      this._engine.setDepthBuffer(!1);
      const t = this.scene.effectLayers;
      for (let s = 0; s < t.length; s++) {
        const n = t[s];
        n.renderingGroupId === e && n.shouldRender() && n.render();
      }
      this._engine.setDepthBuffer(!0);
    }
  }
  _drawCamera() {
    this._renderEffects && this._draw(-1);
  }
  _drawRenderingGroup(e) {
    !this.scene._isInIntermediateRendering() && this._renderEffects && this._draw(e);
  }
}
let $ = !1;
function re(f) {
  $ || ($ = !0, Me(A.NAME_EFFECTLAYER, (e, t, s, n) => {
    if (e.effectLayers) {
      s.effectLayers || (s.effectLayers = []);
      for (let a = 0; a < e.effectLayers.length; a++) {
        const l = f.Parse(e.effectLayers[a], t, n);
        s.effectLayers.push(l);
      }
    }
  }), f._SceneComponentInitialization = (e) => {
    let t = e._getComponent(A.NAME_EFFECTLAYER);
    t || (t = new Le(e), e._addComponent(t));
  });
}
class L extends j {
  constructor(e, t = null, s, n, a) {
    super({
      ...a,
      name: e,
      engine: t || C.LastCreatedEngine,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: L.FragmentUrl,
      uniforms: L.Uniforms
    }), this.direction = s, this.kernel = n, this.textureWidth = 0, this.textureHeight = 0;
  }
  _gatherImports(e, t) {
    e ? (this._webGPUReady = !0, t.push(import("./glowBlurPostProcess.fragment-c5e949d6.js"))) : t.push(import("./glowBlurPostProcess.fragment-28eb760a.js")), super._gatherImports(e, t);
  }
  bind() {
    super.bind(), this._drawWrapper.effect.setFloat2("screenSize", this.textureWidth, this.textureHeight), this._drawWrapper.effect.setVector2("direction", this.direction), this._drawWrapper.effect.setFloat("blurWidth", this.kernel);
  }
}
L.FragmentUrl = "glowBlurPostProcess";
L.Uniforms = ["screenSize", "direction", "blurWidth"];
class w {
  /**
   * Gets/sets the camera attached to the layer.
   */
  get camera() {
    return this._options.camera;
  }
  set camera(e) {
    this._options.camera = e;
  }
  /**
   * Gets the rendering group id the layer should render in.
   */
  get renderingGroupId() {
    return this._options.renderingGroupId;
  }
  set renderingGroupId(e) {
    this._options.renderingGroupId = e;
  }
  /**
   * Gets the object renderer used to render objects in the layer
   */
  get objectRenderer() {
    return this._objectRenderer;
  }
  /**
   * Gets the shader language used in this material.
   */
  get shaderLanguage() {
    return this._shaderLanguage;
  }
  /**
   * Sets a specific material to be used to render a mesh/a list of meshes in the layer
   * @param mesh mesh or array of meshes
   * @param material material to use by the layer when rendering the mesh(es). If undefined is passed, the specific material created by the layer will be used.
   */
  setMaterialForRendering(e, t) {
    if (this._objectRenderer.setMaterialForRendering(e, t), Array.isArray(e))
      for (let s = 0; s < e.length; ++s) {
        const n = e[s];
        t ? this._materialForRendering[n.uniqueId] = [n, t] : delete this._materialForRendering[n.uniqueId];
      }
    else
      t ? this._materialForRendering[e.uniqueId] = [e, t] : delete this._materialForRendering[e.uniqueId];
  }
  /**
   * Gets the intensity of the effect for a specific mesh.
   * @param mesh The mesh to get the effect intensity for
   * @returns The intensity of the effect for the mesh
   */
  getEffectIntensity(e) {
    return this._effectIntensity[e.uniqueId] ?? 1;
  }
  /**
   * Sets the intensity of the effect for a specific mesh.
   * @param mesh The mesh to set the effect intensity for
   * @param intensity The intensity of the effect for the mesh
   */
  setEffectIntensity(e, t) {
    this._effectIntensity[e.uniqueId] = t;
  }
  /**
   * Instantiates a new effect Layer
   * @param name The name of the layer
   * @param scene The scene to use the layer in
   * @param forceGLSL Use the GLSL code generation for the shader (even on WebGPU). Default is false
   * @param dontCheckIfReady Specifies if the layer should disable checking whether all the post processes are ready (default: false). To save performance, this should be set to true and you should call `isReady` manually before rendering to the layer.
   * @param _additionalImportShadersAsync Additional shaders to import when the layer is created
   */
  constructor(e, t, s = !1, n = !1, a) {
    this._additionalImportShadersAsync = a, this._vertexBuffers = {}, this._dontCheckIfReady = !1, this._shouldRender = !0, this._emissiveTextureAndColor = { texture: null, color: new U() }, this._effectIntensity = {}, this._postProcesses = [], this.neutralColor = new U(), this.isEnabled = !0, this.disableBoundingBoxesFromEffectLayer = !1, this.onDisposeObservable = new b(), this.onBeforeRenderLayerObservable = new b(), this.onBeforeComposeObservable = new b(), this.onBeforeRenderMeshToEffect = new b(), this.onAfterRenderMeshToEffect = new b(), this.onAfterComposeObservable = new b(), this.onBeforeBlurObservable = new b(), this.onAfterBlurObservable = new b(), this._shaderLanguage = 0, this._materialForRendering = {}, this._shadersLoaded = !1, this.name = e, this._scene = t || C.LastCreatedScene, this._dontCheckIfReady = n, this._scene.getEngine().isWebGPU && !s && !w.ForceGLSL && (this._shaderLanguage = 1), this._engine = this._scene.getEngine(), this._mergeDrawWrapper = [], this._generateIndexBuffer(), this._generateVertexBuffer();
  }
  /**
   * Get the effect name of the layer.
   * @returns The effect name
   */
  getEffectName() {
    return "";
  }
  /**
   * Checks for the readiness of the element composing the layer.
   * @param _subMesh the mesh to check for
   * @param _useInstances specify whether or not to use instances to render the mesh
   * @returns true if ready otherwise, false
   */
  isReady(e, t) {
    return !0;
  }
  /**
   * Returns whether or not the layer needs stencil enabled during the mesh rendering.
   * @returns true if the effect requires stencil during the main canvas render pass.
   */
  needStencil() {
    return !1;
  }
  /** @internal */
  _createMergeEffect() {
    throw new Error("Effect Layer: no merge effect defined");
  }
  /** @internal */
  _createTextureAndPostProcesses() {
  }
  /** @internal */
  _internalCompose(e, t) {
  }
  /** @internal */
  _setEmissiveTextureAndColor(e, t, s) {
  }
  /** @internal */
  _numInternalDraws() {
    return 1;
  }
  /** @internal */
  _init(e) {
    this._options = {
      mainTextureRatio: 0.5,
      mainTextureFixedSize: 0,
      mainTextureType: 0,
      mainTextureFormat: 5,
      alphaBlendingMode: 2,
      camera: null,
      renderingGroupId: -1,
      ...e
    }, this._createObjectRenderer();
  }
  _generateIndexBuffer() {
    const e = [];
    e.push(0), e.push(1), e.push(2), e.push(0), e.push(2), e.push(3), this._indexBuffer = this._engine.createIndexBuffer(e);
  }
  _generateVertexBuffer() {
    const e = [];
    e.push(1, 1), e.push(-1, 1), e.push(-1, -1), e.push(1, -1);
    const t = new E(this._engine, e, E.PositionKind, !1, !1, 2);
    this._vertexBuffers[E.PositionKind] = t;
  }
  _createObjectRenderer() {
    this._objectRenderer = new Te(`ObjectRenderer for thin effect layer ${this.name}`, this._scene, {
      doNotChangeAspectRatio: !0
    }), this._objectRenderer.activeCamera = this._options.camera, this._objectRenderer.renderParticles = !1, this._objectRenderer.renderList = null;
    const e = ne(this._scene.getBoundingBoxRenderer);
    let t = !1;
    e && (this._objectRenderer.onBeforeRenderObservable.add(() => {
      t = this._scene.getBoundingBoxRenderer().enabled, this._scene.getBoundingBoxRenderer().enabled = !this.disableBoundingBoxesFromEffectLayer && t;
    }), this._objectRenderer.onAfterRenderObservable.add(() => {
      this._scene.getBoundingBoxRenderer().enabled = t;
    })), this._objectRenderer.customIsReadyFunction = (s, n, a) => {
      if ((a || n === 0) && s.subMeshes)
        for (let l = 0; l < s.subMeshes.length; ++l) {
          const o = s.subMeshes[l], h = o.getMaterial(), r = o.getRenderingMesh();
          if (!h)
            continue;
          const u = r._getInstancesRenderList(o._id, !!o.getReplacementMesh()).hardwareInstancedRendering[o._id] || r.hasThinInstances;
          if (this._setEmissiveTextureAndColor(r, o, h), !this._isSubMeshReady(o, u, this._emissiveTextureAndColor.texture))
            return !1;
        }
      return !0;
    }, this._objectRenderer.customRenderFunction = (s, n, a, l) => {
      this.onBeforeRenderLayerObservable.notifyObservers(this);
      let o;
      const h = this._scene.getEngine();
      if (l.length) {
        for (h.setColorWrite(!1), o = 0; o < l.length; o++)
          this._renderSubMesh(l.data[o]);
        h.setColorWrite(!0);
      }
      for (o = 0; o < s.length; o++)
        this._renderSubMesh(s.data[o]);
      for (o = 0; o < n.length; o++)
        this._renderSubMesh(n.data[o]);
      const r = h.getAlphaMode();
      for (o = 0; o < a.length; o++) {
        const c = a.data[o], u = c.getMaterial();
        if (u && u.needDepthPrePass) {
          const i = u.getScene().getEngine();
          i.setColorWrite(!1), this._renderSubMesh(c), i.setColorWrite(!0);
        }
        this._renderSubMesh(c, !0);
      }
      h.setAlphaMode(r);
    };
  }
  /** @internal */
  _addCustomEffectDefines(e) {
  }
  /** @internal */
  _internalIsSubMeshReady(e, t, s) {
    var F;
    const n = this._scene.getEngine(), a = e.getMesh(), l = (F = a._internalAbstractMeshDataInfo._materialForRenderPass) == null ? void 0 : F[n.currentRenderPassId];
    if (l)
      return l.isReadyForSubMesh(a, e, t);
    const o = e.getMaterial();
    if (!o)
      return !1;
    if (this._useMeshMaterial(e.getRenderingMesh())) {
      o._glowModeEnabled = !0;
      const S = o.isReadyForSubMesh(e.getMesh(), e, t);
      return o._glowModeEnabled = !1, S;
    }
    const h = [], r = [E.PositionKind];
    let c = !1, u = !1;
    const i = !1;
    if (o) {
      const S = o.needAlphaTestingForMesh(a), B = o.getAlphaTestTexture(), I = B && B.hasAlpha && (o.useAlphaFromDiffuseTexture || o._useAlphaFromAlbedoTexture);
      B && (S || I) && (h.push("#define DIFFUSE"), a.isVerticesDataPresent(E.UV2Kind) && B.coordinatesIndex === 1 ? (h.push("#define DIFFUSEUV2"), u = !0) : a.isVerticesDataPresent(E.UVKind) && (h.push("#define DIFFUSEUV1"), c = !0), S && (h.push("#define ALPHATEST"), h.push("#define ALPHATESTVALUE 0.4")), B.gammaSpace || h.push("#define DIFFUSE_ISLINEAR"));
      const G = o.opacityTexture;
      G && (h.push("#define OPACITY"), a.isVerticesDataPresent(E.UV2Kind) && G.coordinatesIndex === 1 ? (h.push("#define OPACITYUV2"), u = !0) : a.isVerticesDataPresent(E.UVKind) && (h.push("#define OPACITYUV1"), c = !0));
    }
    s && (h.push("#define EMISSIVE"), a.isVerticesDataPresent(E.UV2Kind) && s.coordinatesIndex === 1 ? (h.push("#define EMISSIVEUV2"), u = !0) : a.isVerticesDataPresent(E.UVKind) && (h.push("#define EMISSIVEUV1"), c = !0), s.gammaSpace || h.push("#define EMISSIVE_ISLINEAR")), a.useVertexColors && a.isVerticesDataPresent(E.ColorKind) && a.hasVertexAlpha && o.transparencyMode !== P.MATERIAL_OPAQUE && (r.push(E.ColorKind), h.push("#define VERTEXALPHA")), c && (r.push(E.UVKind), h.push("#define UV1")), u && (r.push(E.UV2Kind), h.push("#define UV2"));
    const d = new _e();
    if (a.useBones && a.computeBonesUsingShaders) {
      r.push(E.MatricesIndicesKind), r.push(E.MatricesWeightsKind), a.numBoneInfluencers > 4 && (r.push(E.MatricesIndicesExtraKind), r.push(E.MatricesWeightsExtraKind)), h.push("#define NUM_BONE_INFLUENCERS " + a.numBoneInfluencers);
      const S = a.skeleton;
      S && S.isUsingTextureForMatrices ? h.push("#define BONETEXTURE") : h.push("#define BonesPerMesh " + (S ? S.bones.length + 1 : 0)), a.numBoneInfluencers > 0 && d.addCPUSkinningFallback(0, a);
    } else
      h.push("#define NUM_BONE_INFLUENCERS 0");
    const g = a.morphTargetManager ? ae(
      a.morphTargetManager,
      h,
      r,
      a,
      !0,
      // usePositionMorph
      !1,
      // useNormalMorph
      !1,
      // useTangentMorph
      c,
      // useUVMorph
      u,
      // useUV2Morph
      i
      // useColorMorph
    ) : 0;
    t && (h.push("#define INSTANCES"), oe(r), e.getRenderingMesh().hasThinInstances && h.push("#define THIN_INSTANCES"));
    const _ = a.bakedVertexAnimationManager;
    _ && _.isEnabled && (h.push("#define BAKED_VERTEX_ANIMATION_TEXTURE"), t && r.push("bakedVertexAnimationSettingsInstanced")), he(o, this._scene, h), this._addCustomEffectDefines(h);
    const m = e._getDrawWrapper(void 0, !0), x = m.defines, p = h.join(`
`);
    if (x !== p) {
      const S = [
        "world",
        "mBones",
        "viewProjection",
        "glowColor",
        "morphTargetInfluences",
        "morphTargetCount",
        "boneTextureInfo",
        "diffuseMatrix",
        "emissiveMatrix",
        "opacityMatrix",
        "opacityIntensity",
        "morphTargetTextureInfo",
        "morphTargetTextureIndices",
        "bakedVertexAnimationSettings",
        "bakedVertexAnimationTextureSizeInverted",
        "bakedVertexAnimationTime",
        "bakedVertexAnimationTexture",
        "glowIntensity"
      ];
      le(S), m.setEffect(this._engine.createEffect("glowMapGeneration", r, S, ["diffuseSampler", "emissiveSampler", "opacitySampler", "boneSampler", "morphTargets", "bakedVertexAnimationTexture"], p, d, void 0, void 0, { maxSimultaneousMorphTargets: g }, this._shaderLanguage, this._shadersLoaded ? void 0 : async () => {
        await this._importShadersAsync(), this._shadersLoaded = !0;
      }), p);
    }
    return m.effect.isReady() && (this._dontCheckIfReady || !this._dontCheckIfReady && this.isLayerReady());
  }
  /** @internal */
  _isSubMeshReady(e, t, s) {
    return this._internalIsSubMeshReady(e, t, s);
  }
  async _importShadersAsync() {
    var e;
    this._shaderLanguage === 1 ? await Promise.all([import("./glowMapGeneration.vertex-50141570.js"), import("./glowMapGeneration.fragment-786b9a0e.js")]) : await Promise.all([import("./glowMapGeneration.vertex-4ab54063.js"), import("./glowMapGeneration.fragment-0a373b90.js")]), (e = this._additionalImportShadersAsync) == null || e.call(this);
  }
  /** @internal */
  _internalIsLayerReady() {
    let e = !0;
    for (let s = 0; s < this._postProcesses.length; s++)
      e = this._postProcesses[s].isReady() && e;
    const t = this._numInternalDraws();
    for (let s = 0; s < t; ++s) {
      let n = this._mergeDrawWrapper[s];
      n || (n = this._mergeDrawWrapper[s] = new de(this._engine), n.setEffect(this._createMergeEffect())), e = n.effect.isReady() && e;
    }
    return e;
  }
  _disposeMergeEffects() {
    for (const e of this._mergeDrawWrapper)
      e.dispose();
    this._mergeDrawWrapper = [];
  }
  /**
   * Checks if the layer is ready to be used.
   * @returns true if the layer is ready to be used
   */
  isLayerReady() {
    return this._internalIsLayerReady();
  }
  /**
   * Renders the glowing part of the scene by blending the blurred glowing meshes on top of the rendered scene.
   * @returns true if the rendering was successful
   */
  compose() {
    if (!this._dontCheckIfReady && !this.isLayerReady())
      return !1;
    const e = this._scene.getEngine(), t = this._numInternalDraws();
    this.onBeforeComposeObservable.notifyObservers(this);
    const s = e.getAlphaMode();
    for (let n = 0; n < t; ++n) {
      const a = this._mergeDrawWrapper[n];
      e.enableEffect(a), e.setState(!1), e.bindBuffers(this._vertexBuffers, this._indexBuffer, a.effect), e.setAlphaMode(this._options.alphaBlendingMode), this._internalCompose(a.effect, n);
    }
    return e.setAlphaMode(s), this.onAfterComposeObservable.notifyObservers(this), !0;
  }
  /** @internal */
  _internalHasMesh(e) {
    return this.renderingGroupId === -1 || e.renderingGroupId === this.renderingGroupId;
  }
  /**
   * Determine if a given mesh will be used in the current effect.
   * @param mesh mesh to test
   * @returns true if the mesh will be used
   */
  hasMesh(e) {
    return this._internalHasMesh(e);
  }
  /** @internal */
  _internalShouldRender() {
    return this.isEnabled && this._shouldRender;
  }
  /**
   * Returns true if the layer contains information to display, otherwise false.
   * @returns true if the glow layer should be rendered
   */
  shouldRender() {
    return this._internalShouldRender();
  }
  /** @internal */
  _shouldRenderMesh(e) {
    return !0;
  }
  /** @internal */
  _internalCanRenderMesh(e, t) {
    return !t.needAlphaBlendingForMesh(e);
  }
  /** @internal */
  _canRenderMesh(e, t) {
    return this._internalCanRenderMesh(e, t);
  }
  _renderSubMesh(e, t = !1) {
    var _;
    if (!this._internalShouldRender())
      return;
    const s = e.getMaterial(), n = e.getMesh(), a = e.getReplacementMesh(), l = e.getRenderingMesh(), o = e.getEffectiveMesh(), h = this._scene, r = h.getEngine();
    if (o._internalAbstractMeshDataInfo._isActiveIntermediate = !1, !s || !this._canRenderMesh(l, s))
      return;
    let c = s._getEffectiveOrientation(l);
    o._getWorldMatrixDeterminant() < 0 && (c = c === P.ClockWiseSideOrientation ? P.CounterClockWiseSideOrientation : P.ClockWiseSideOrientation);
    const i = c === P.ClockWiseSideOrientation, d = l._getInstancesRenderList(e._id, !!a);
    if (d.mustReturn || !this._shouldRenderMesh(l))
      return;
    const g = d.hardwareInstancedRendering[e._id] || l.hasThinInstances;
    if (this._setEmissiveTextureAndColor(l, e, s), this.onBeforeRenderMeshToEffect.notifyObservers(n), this._useMeshMaterial(l))
      e.getMaterial()._glowModeEnabled = !0, l.render(e, t, a || void 0), e.getMaterial()._glowModeEnabled = !1;
    else if (this._isSubMeshReady(e, g, this._emissiveTextureAndColor.texture)) {
      const m = (_ = o._internalAbstractMeshDataInfo._materialForRenderPass) == null ? void 0 : _[r.currentRenderPassId];
      let x = e._getDrawWrapper();
      if (!x && m && (x = m._getDrawWrapper()), !x)
        return;
      const p = x.effect;
      r.enableEffect(x), r.setState(s.backFaceCulling, s.zOffset, void 0, i, s.cullBackFaces, s.stencil, s.zOffsetUnits);
      const Y = r.getDepthWrite(), F = r.getColorWrite(), S = r.getDepthFunction() || 0;
      if (s.disableDepthWrite ? r.setDepthWrite(!1) : s.forceDepthWrite && r.setDepthWrite(!0), s.disableColorWrite && r.setColorWrite(!1), s.depthFunction !== 0 && r.setDepthFunction(s.depthFunction), g || l._bind(e, p, s.fillMode), m ? m.bindForSubMesh(o.getWorldMatrix(), o, e) : (p.setMatrix("viewProjection", h.getTransformMatrix()), p.setMatrix("world", o.getWorldMatrix()), p.setFloat4("glowColor", this._emissiveTextureAndColor.color.r, this._emissiveTextureAndColor.color.g, this._emissiveTextureAndColor.color.b, this._emissiveTextureAndColor.color.a)), !m) {
        const B = s.needAlphaTestingForMesh(o), I = s.getAlphaTestTexture(), G = I && I.hasAlpha && (s.useAlphaFromDiffuseTexture || s._useAlphaFromAlbedoTexture);
        if (I && (B || G)) {
          p.setTexture("diffuseSampler", I);
          const z = I.getTextureMatrix();
          z && p.setMatrix("diffuseMatrix", z);
        }
        const N = s.opacityTexture;
        if (N) {
          p.setTexture("opacitySampler", N), p.setFloat("opacityIntensity", N.level);
          const z = N.getTextureMatrix();
          z && p.setMatrix("opacityMatrix", z);
        }
        this._emissiveTextureAndColor.texture && (p.setTexture("emissiveSampler", this._emissiveTextureAndColor.texture), p.setMatrix("emissiveMatrix", this._emissiveTextureAndColor.texture.getTextureMatrix())), fe(l, p), ce(l, p), l.morphTargetManager && l.morphTargetManager.isUsingTextureForTargets && l.morphTargetManager._bind(p);
        const k = e.getMesh().bakedVertexAnimationManager;
        k && k.isEnabled && k.bind(p, g), t && r.setAlphaMode(s.alphaMode), p.setFloat("glowIntensity", this.getEffectIntensity(l)), ue(p, s, h);
      }
      l._processRendering(o, e, p, s.fillMode, d, g, (B, I) => p.setMatrix("world", I)), (s.disableDepthWrite || s.forceDepthWrite) && r.setDepthWrite(Y), s.disableColorWrite && r.setColorWrite(F), s.depthFunction !== 0 && r.setDepthFunction(S);
    } else
      this._objectRenderer.resetRefreshCounter();
    this.onAfterRenderMeshToEffect.notifyObservers(n);
  }
  /** @internal */
  _useMeshMaterial(e) {
    return !1;
  }
  /** @internal */
  _rebuild() {
    const e = this._vertexBuffers[E.PositionKind];
    e && e._rebuild(), this._generateIndexBuffer();
  }
  /**
   * Dispose the effect layer and free resources.
   */
  dispose() {
    const e = this._vertexBuffers[E.PositionKind];
    e && (e.dispose(), this._vertexBuffers[E.PositionKind] = null), this._indexBuffer && (this._scene.getEngine()._releaseBuffer(this._indexBuffer), this._indexBuffer = null), this._disposeMergeEffects(), this._objectRenderer.dispose(), this.onDisposeObservable.notifyObservers(this), this.onDisposeObservable.clear(), this.onBeforeRenderLayerObservable.clear(), this.onBeforeComposeObservable.clear(), this.onBeforeRenderMeshToEffect.clear(), this.onAfterRenderMeshToEffect.clear(), this.onAfterComposeObservable.clear();
  }
}
w.ForceGLSL = !1;
let ie = (() => {
  var f;
  let e = [], t, s, n, a, l, o;
  return f = class {
    get _shouldRender() {
      return this._thinEffectLayer._shouldRender;
    }
    set _shouldRender(r) {
      this._thinEffectLayer._shouldRender = r;
    }
    get _emissiveTextureAndColor() {
      return this._thinEffectLayer._emissiveTextureAndColor;
    }
    set _emissiveTextureAndColor(r) {
      this._thinEffectLayer._emissiveTextureAndColor = r;
    }
    get _effectIntensity() {
      return this._thinEffectLayer._effectIntensity;
    }
    set _effectIntensity(r) {
      this._thinEffectLayer._effectIntensity = r;
    }
    /**
     * Force all the effect layers to compile to glsl even on WebGPU engines.
     * False by default. This is mostly meant for backward compatibility.
     */
    static get ForceGLSL() {
      return w.ForceGLSL;
    }
    static set ForceGLSL(r) {
      w.ForceGLSL = r;
    }
    /**
     * The name of the layer
     */
    get name() {
      return this._thinEffectLayer.name;
    }
    set name(r) {
      this._thinEffectLayer.name = r;
    }
    /**
     * The clear color of the texture used to generate the glow map.
     */
    get neutralColor() {
      return this._thinEffectLayer.neutralColor;
    }
    set neutralColor(r) {
      this._thinEffectLayer.neutralColor = r;
    }
    /**
     * Specifies whether the highlight layer is enabled or not.
     */
    get isEnabled() {
      return this._thinEffectLayer.isEnabled;
    }
    set isEnabled(r) {
      this._thinEffectLayer.isEnabled = r;
    }
    /**
     * Gets the camera attached to the layer.
     */
    get camera() {
      return this._thinEffectLayer.camera;
    }
    /**
     * Gets the rendering group id the layer should render in.
     */
    get renderingGroupId() {
      return this._thinEffectLayer.renderingGroupId;
    }
    set renderingGroupId(r) {
      this._thinEffectLayer.renderingGroupId = r;
    }
    /**
     * Specifies if the bounding boxes should be rendered normally or if they should undergo the effect of the layer
     */
    get disableBoundingBoxesFromEffectLayer() {
      return this._thinEffectLayer.disableBoundingBoxesFromEffectLayer;
    }
    set disableBoundingBoxesFromEffectLayer(r) {
      this._thinEffectLayer.disableBoundingBoxesFromEffectLayer = r;
    }
    /**
     * Gets the main texture where the effect is rendered
     */
    get mainTexture() {
      return this._mainTexture;
    }
    get _shaderLanguage() {
      return this._thinEffectLayer.shaderLanguage;
    }
    /**
     * Gets the shader language used in this material.
     */
    get shaderLanguage() {
      return this._thinEffectLayer.shaderLanguage;
    }
    /**
     * Sets a specific material to be used to render a mesh/a list of meshes in the layer
     * @param mesh mesh or array of meshes
     * @param material material to use by the layer when rendering the mesh(es). If undefined is passed, the specific material created by the layer will be used.
     */
    setMaterialForRendering(r, c) {
      this._thinEffectLayer.setMaterialForRendering(r, c);
    }
    /**
     * Gets the intensity of the effect for a specific mesh.
     * @param mesh The mesh to get the effect intensity for
     * @returns The intensity of the effect for the mesh
     */
    getEffectIntensity(r) {
      return this._thinEffectLayer.getEffectIntensity(r);
    }
    /**
     * Sets the intensity of the effect for a specific mesh.
     * @param mesh The mesh to set the effect intensity for
     * @param intensity The intensity of the effect for the mesh
     */
    setEffectIntensity(r, c) {
      this._thinEffectLayer.setEffectIntensity(r, c);
    }
    /**
     * Instantiates a new effect Layer and references it in the scene.
     * @param name The name of the layer
     * @param scene The scene to use the layer in
     * @param forceGLSL Use the GLSL code generation for the shader (even on WebGPU). Default is false
     * @param thinEffectLayer The thin instance of the effect layer (optional)
     */
    constructor(r, c, u = !1, i) {
      this._effectLayerOptions = D(this, e), this._mainTextureCreatedSize = { width: 0, height: 0 }, this._maxSize = 0, this._mainTextureDesiredSize = { width: 0, height: 0 }, this._postProcesses = [], this._textures = [], this.uniqueId = me.UniqueId, this.onDisposeObservable = new b(), this.onBeforeRenderMainTextureObservable = new b(), this.onBeforeComposeObservable = new b(), this.onBeforeRenderMeshToEffect = new b(), this.onAfterRenderMeshToEffect = new b(), this.onAfterComposeObservable = new b(), this.onSizeChangedObservable = new b(), this._internalThinEffectLayer = !i, i || (i = new w(r, c, u, !1, this._importShadersAsync.bind(this)), i.getEffectName = this.getEffectName.bind(this), i.isReady = this.isReady.bind(this), i._createMergeEffect = this._createMergeEffect.bind(this), i._createTextureAndPostProcesses = this._createTextureAndPostProcesses.bind(this), i._internalCompose = this._internalRender.bind(this), i._setEmissiveTextureAndColor = this._setEmissiveTextureAndColor.bind(this), i._numInternalDraws = this._numInternalDraws.bind(this), i._addCustomEffectDefines = this._addCustomEffectDefines.bind(this), i.hasMesh = this.hasMesh.bind(this), i.shouldRender = this.shouldRender.bind(this), i._shouldRenderMesh = this._shouldRenderMesh.bind(this), i._canRenderMesh = this._canRenderMesh.bind(this), i._useMeshMaterial = this._useMeshMaterial.bind(this)), this._thinEffectLayer = i, this.name = r, this._scene = c || C.LastCreatedScene, re(f), f._SceneComponentInitialization(this._scene), this._engine = this._scene.getEngine(), this._maxSize = this._engine.getCaps().maxTextureSize, this._scene.addEffectLayer(this), this._thinEffectLayer.onDisposeObservable.add(() => {
        this.onDisposeObservable.notifyObservers(this);
      }), this._thinEffectLayer.onBeforeRenderLayerObservable.add(() => {
        this.onBeforeRenderMainTextureObservable.notifyObservers(this);
      }), this._thinEffectLayer.onBeforeComposeObservable.add(() => {
        this.onBeforeComposeObservable.notifyObservers(this);
      }), this._thinEffectLayer.onBeforeRenderMeshToEffect.add((d) => {
        this.onBeforeRenderMeshToEffect.notifyObservers(d);
      }), this._thinEffectLayer.onAfterRenderMeshToEffect.add((d) => {
        this.onAfterRenderMeshToEffect.notifyObservers(d);
      }), this._thinEffectLayer.onAfterComposeObservable.add(() => {
        this.onAfterComposeObservable.notifyObservers(this);
      });
    }
    get _shadersLoaded() {
      return this._thinEffectLayer._shadersLoaded;
    }
    set _shadersLoaded(r) {
      this._thinEffectLayer._shadersLoaded = r;
    }
    /**
     * Number of times _internalRender will be called. Some effect layers need to render the mesh several times, so they should override this method with the number of times the mesh should be rendered
     * @returns Number of times a mesh must be rendered in the layer
     */
    _numInternalDraws() {
      return this._internalThinEffectLayer ? 1 : this._thinEffectLayer._numInternalDraws();
    }
    /**
     * Initializes the effect layer with the required options.
     * @param options Sets of none mandatory options to use with the layer (see IEffectLayerOptions for more information)
     */
    _init(r) {
      this._effectLayerOptions = {
        mainTextureRatio: 0.5,
        alphaBlendingMode: 2,
        camera: null,
        renderingGroupId: -1,
        mainTextureType: 0,
        mainTextureFormat: 5,
        generateStencilBuffer: !1,
        ...r
      }, this._setMainTextureSize(), this._thinEffectLayer._init(r), this._createMainTexture(), this._createTextureAndPostProcesses();
    }
    /**
     * Sets the main texture desired size which is the closest power of two
     * of the engine canvas size.
     */
    _setMainTextureSize() {
      this._effectLayerOptions.mainTextureFixedSize ? (this._mainTextureDesiredSize.width = this._effectLayerOptions.mainTextureFixedSize, this._mainTextureDesiredSize.height = this._effectLayerOptions.mainTextureFixedSize) : (this._mainTextureDesiredSize.width = this._engine.getRenderWidth() * this._effectLayerOptions.mainTextureRatio, this._mainTextureDesiredSize.height = this._engine.getRenderHeight() * this._effectLayerOptions.mainTextureRatio, this._mainTextureDesiredSize.width = this._engine.needPOTTextures ? W(this._mainTextureDesiredSize.width, this._maxSize) : this._mainTextureDesiredSize.width, this._mainTextureDesiredSize.height = this._engine.needPOTTextures ? W(this._mainTextureDesiredSize.height, this._maxSize) : this._mainTextureDesiredSize.height), this._mainTextureDesiredSize.width = Math.floor(this._mainTextureDesiredSize.width), this._mainTextureDesiredSize.height = Math.floor(this._mainTextureDesiredSize.height);
    }
    /**
     * Creates the main texture for the effect layer.
     */
    _createMainTexture() {
      this._mainTexture = new se("EffectLayerMainRTT", {
        width: this._mainTextureDesiredSize.width,
        height: this._mainTextureDesiredSize.height
      }, this._scene, {
        type: this._effectLayerOptions.mainTextureType,
        format: this._effectLayerOptions.mainTextureFormat,
        samplingMode: y.TRILINEAR_SAMPLINGMODE,
        generateStencilBuffer: this._effectLayerOptions.generateStencilBuffer,
        existingObjectRenderer: this._thinEffectLayer.objectRenderer
      }), this._mainTexture.activeCamera = this._effectLayerOptions.camera, this._mainTexture.wrapU = y.CLAMP_ADDRESSMODE, this._mainTexture.wrapV = y.CLAMP_ADDRESSMODE, this._mainTexture.anisotropicFilteringLevel = 1, this._mainTexture.updateSamplingMode(y.BILINEAR_SAMPLINGMODE), this._mainTexture.renderParticles = !1, this._mainTexture.renderList = null, this._mainTexture.ignoreCameraViewport = !0, this._mainTexture.onClearObservable.add((r) => {
        r.clear(this.neutralColor, !0, !0, !0);
      });
    }
    /**
     * Adds specific effects defines.
     * @param defines The defines to add specifics to.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _addCustomEffectDefines(r) {
    }
    /**
     * Checks for the readiness of the element composing the layer.
     * @param subMesh the mesh to check for
     * @param useInstances specify whether or not to use instances to render the mesh
     * @param emissiveTexture the associated emissive texture used to generate the glow
     * @returns true if ready otherwise, false
     */
    _isReady(r, c, u) {
      return this._internalThinEffectLayer ? this._thinEffectLayer._internalIsSubMeshReady(r, c, u) : this._thinEffectLayer._isSubMeshReady(r, c, u);
    }
    async _importShadersAsync() {
    }
    _arePostProcessAndMergeReady() {
      return this._internalThinEffectLayer ? this._thinEffectLayer._internalIsLayerReady() : this._thinEffectLayer.isLayerReady();
    }
    /**
     * Checks if the layer is ready to be used.
     * @returns true if the layer is ready to be used
     */
    isLayerReady() {
      return this._arePostProcessAndMergeReady() && this._mainTexture.isReady();
    }
    /**
     * Renders the glowing part of the scene by blending the blurred glowing meshes on top of the rendered scene.
     */
    render() {
      this._thinEffectLayer.compose() && (this._setMainTextureSize(), (this._mainTextureCreatedSize.width !== this._mainTextureDesiredSize.width || this._mainTextureCreatedSize.height !== this._mainTextureDesiredSize.height) && this._mainTextureDesiredSize.width !== 0 && this._mainTextureDesiredSize.height !== 0 && (this.onSizeChangedObservable.notifyObservers(this), this._disposeTextureAndPostProcesses(), this._createMainTexture(), this._createTextureAndPostProcesses(), this._mainTextureCreatedSize.width = this._mainTextureDesiredSize.width, this._mainTextureCreatedSize.height = this._mainTextureDesiredSize.height));
    }
    /**
     * Determine if a given mesh will be used in the current effect.
     * @param mesh mesh to test
     * @returns true if the mesh will be used
     */
    hasMesh(r) {
      return this._internalThinEffectLayer ? this._thinEffectLayer._internalHasMesh(r) : this._thinEffectLayer.hasMesh(r);
    }
    /**
     * Returns true if the layer contains information to display, otherwise false.
     * @returns true if the glow layer should be rendered
     */
    shouldRender() {
      return this._internalThinEffectLayer ? this._thinEffectLayer._internalShouldRender() : this._thinEffectLayer.shouldRender();
    }
    /**
     * Returns true if the mesh should render, otherwise false.
     * @param mesh The mesh to render
     * @returns true if it should render otherwise false
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRenderMesh(r) {
      return this._internalThinEffectLayer ? !0 : this._thinEffectLayer._shouldRenderMesh(r);
    }
    /**
     * Returns true if the mesh can be rendered, otherwise false.
     * @param mesh The mesh to render
     * @param material The material used on the mesh
     * @returns true if it can be rendered otherwise false
     */
    _canRenderMesh(r, c) {
      return this._internalThinEffectLayer ? this._thinEffectLayer._internalCanRenderMesh(r, c) : this._thinEffectLayer._canRenderMesh(r, c);
    }
    /**
     * Returns true if the mesh should render, otherwise false.
     * @returns true if it should render otherwise false
     */
    _shouldRenderEmissiveTextureForMesh() {
      return !0;
    }
    /**
     * Defines whether the current material of the mesh should be use to render the effect.
     * @param mesh defines the current mesh to render
     * @returns true if the mesh material should be use
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _useMeshMaterial(r) {
      return this._internalThinEffectLayer ? !1 : this._thinEffectLayer._useMeshMaterial(r);
    }
    /**
     * Rebuild the required buffers.
     * @internal Internal use only.
     */
    _rebuild() {
      this._thinEffectLayer._rebuild();
    }
    /**
     * Dispose only the render target textures and post process.
     */
    _disposeTextureAndPostProcesses() {
      this._mainTexture.dispose();
      for (let r = 0; r < this._postProcesses.length; r++)
        this._postProcesses[r] && this._postProcesses[r].dispose();
      this._postProcesses = [];
      for (let r = 0; r < this._textures.length; r++)
        this._textures[r] && this._textures[r].dispose();
      this._textures = [];
    }
    /**
     * Dispose the highlight layer and free resources.
     */
    dispose() {
      this._thinEffectLayer.dispose(), this._disposeTextureAndPostProcesses(), this._scene.removeEffectLayer(this), this.onDisposeObservable.clear(), this.onBeforeRenderMainTextureObservable.clear(), this.onBeforeComposeObservable.clear(), this.onBeforeRenderMeshToEffect.clear(), this.onAfterRenderMeshToEffect.clear(), this.onAfterComposeObservable.clear(), this.onSizeChangedObservable.clear();
    }
    /**
     * Gets the class name of the effect layer
     * @returns the string with the class name of the effect layer
     */
    getClassName() {
      return "EffectLayer";
    }
    /**
     * Creates an effect layer from parsed effect layer data
     * @param parsedEffectLayer defines effect layer data
     * @param scene defines the current scene
     * @param rootUrl defines the root URL containing the effect layer information
     * @returns a parsed effect Layer
     */
    static Parse(r, c, u) {
      return pe.Instantiate(r.customType).Parse(r, c, u);
    }
  }, (() => {
    const h = typeof Symbol == "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    t = [T()], s = [Ee()], n = [T()], a = [be()], l = [T()], o = [T()], R(f, null, t, { kind: "getter", name: "name", static: !1, private: !1, access: { has: (r) => "name" in r, get: (r) => r.name }, metadata: h }, null, e), R(f, null, s, { kind: "getter", name: "neutralColor", static: !1, private: !1, access: { has: (r) => "neutralColor" in r, get: (r) => r.neutralColor }, metadata: h }, null, e), R(f, null, n, { kind: "getter", name: "isEnabled", static: !1, private: !1, access: { has: (r) => "isEnabled" in r, get: (r) => r.isEnabled }, metadata: h }, null, e), R(f, null, a, { kind: "getter", name: "camera", static: !1, private: !1, access: { has: (r) => "camera" in r, get: (r) => r.camera }, metadata: h }, null, e), R(f, null, l, { kind: "getter", name: "renderingGroupId", static: !1, private: !1, access: { has: (r) => "renderingGroupId" in r, get: (r) => r.renderingGroupId }, metadata: h }, null, e), R(f, null, o, { kind: "getter", name: "disableBoundingBoxesFromEffectLayer", static: !1, private: !1, access: { has: (r) => "disableBoundingBoxesFromEffectLayer" in r, get: (r) => r.disableBoundingBoxesFromEffectLayer }, metadata: h }, null, e), h && Object.defineProperty(f, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: h });
  })(), /**
   * @internal
   */
  f._SceneComponentInitialization = (h) => {
    throw ge("EffectLayerSceneComponent");
  }, f;
})();
re(ie);
class M extends w {
  /**
   * Specifies the horizontal size of the blur.
   */
  set blurHorizontalSize(e) {
    this._horizontalBlurPostprocess.kernel = e, this._options.blurHorizontalSize = e;
  }
  /**
   * Specifies the vertical size of the blur.
   */
  set blurVerticalSize(e) {
    this._verticalBlurPostprocess.kernel = e, this._options.blurVerticalSize = e;
  }
  /**
   * Gets the horizontal size of the blur.
   */
  get blurHorizontalSize() {
    return this._horizontalBlurPostprocess.kernel;
  }
  /**
   * Gets the vertical size of the blur.
   */
  get blurVerticalSize() {
    return this._verticalBlurPostprocess.kernel;
  }
  /**
   * Gets the stencil reference value used for the meshes rendered by the highlight layer.
   */
  get stencilReference() {
    return this._instanceGlowingMeshStencilReference << 8 - this.numStencilBits;
  }
  /**
   * Instantiates a new highlight Layer and references it to the scene..
   * @param name The name of the layer
   * @param scene The scene to use the layer in
   * @param options Sets of none mandatory options to use with the layer (see IHighlightLayerOptions for more information)
   * @param dontCheckIfReady Specifies if the layer should disable checking whether all the post processes are ready (default: false). To save performance, this should be set to true and you should call `isReady` manually before rendering to the layer.
   */
  constructor(e, t, s, n = !1) {
    super(e, t, s !== void 0 ? !!s.forceGLSL : !1), this.innerGlow = !0, this.outerGlow = !0, this._instanceGlowingMeshStencilReference = M.GlowingMeshStencilReference++, this._meshes = {}, this._excludedMeshes = {}, this._mainObjectRendererRenderPassId = -1, this.numStencilBits = 8, this.neutralColor = M.NeutralColor, this._options = {
      mainTextureRatio: 0.5,
      blurTextureSizeRatio: 0.5,
      mainTextureFixedSize: 0,
      blurHorizontalSize: 1,
      blurVerticalSize: 1,
      alphaBlendingMode: 2,
      camera: null,
      renderingGroupId: -1,
      forceGLSL: !1,
      mainTextureType: 0,
      mainTextureFormat: 5,
      isStroke: !1,
      ...s
    }, this._init(this._options), this._shouldRender = !1, n && this._createTextureAndPostProcesses();
  }
  /**
   * Gets the class name of the effect layer
   * @returns the string with the class name of the effect layer
   */
  getClassName() {
    return "HighlightLayer";
  }
  async _importShadersAsync() {
    this._shaderLanguage === 1 ? await Promise.all([
      import("./glowMapMerge.fragment-63ff5077.js"),
      import("./glowMapMerge.vertex-4fefa2d9.js"),
      import("./glowBlurPostProcess.fragment-c5e949d6.js")
    ]) : await Promise.all([import("./glowMapMerge.fragment-fb2bdee0.js"), import("./glowMapMerge.vertex-d840f0e9.js"), import("./glowBlurPostProcess.fragment-28eb760a.js")]), await super._importShadersAsync();
  }
  getEffectName() {
    return M.EffectName;
  }
  _numInternalDraws() {
    return 2;
  }
  _createMergeEffect() {
    return this._engine.createEffect("glowMapMerge", [E.PositionKind], ["offset"], ["textureSampler"], this._options.isStroke ? `#define STROKE 
` : void 0, void 0, void 0, void 0, void 0, this._shaderLanguage, this._shadersLoaded ? void 0 : async () => {
      await this._importShadersAsync(), this._shadersLoaded = !0;
    });
  }
  _createTextureAndPostProcesses() {
    this._options.alphaBlendingMode === 2 ? (this._downSamplePostprocess = new O("HighlightLayerPPP", this._scene.getEngine()), this._horizontalBlurPostprocess = new L("HighlightLayerHBP", this._scene.getEngine(), new v(1, 0), this._options.blurHorizontalSize), this._verticalBlurPostprocess = new L("HighlightLayerVBP", this._scene.getEngine(), new v(0, 1), this._options.blurVerticalSize), this._postProcesses = [this._downSamplePostprocess, this._horizontalBlurPostprocess, this._verticalBlurPostprocess]) : (this._horizontalBlurPostprocess = new Q("HighlightLayerHBP", this._scene.getEngine(), new v(1, 0), this._options.blurHorizontalSize / 2), this._verticalBlurPostprocess = new Q("HighlightLayerVBP", this._scene.getEngine(), new v(0, 1), this._options.blurVerticalSize / 2), this._postProcesses = [this._horizontalBlurPostprocess, this._verticalBlurPostprocess]);
  }
  needStencil() {
    return !0;
  }
  isReady(e, t) {
    const s = e.getMaterial(), n = e.getRenderingMesh();
    if (!s || !n || !this._meshes)
      return !1;
    let a = null;
    const l = this._meshes[n.uniqueId];
    return l && l.glowEmissiveOnly && s && (a = s.emissiveTexture), super._isSubMeshReady(e, t, a);
  }
  _canRenderMesh(e, t) {
    return !0;
  }
  _internalCompose(e, t) {
    this.bindTexturesForCompose(e);
    const s = this._engine;
    s.cacheStencilState(), s.setStencilOperationPass(7681), s.setStencilOperationFail(7680), s.setStencilOperationDepthFail(7680), s.setStencilMask(0), s.setStencilBuffer(!0), s.setStencilFunctionReference(this._instanceGlowingMeshStencilReference << 8 - this.numStencilBits), s.setStencilFunctionMask(255 - ((1 << 8 - this.numStencilBits) - 1)), this.outerGlow && t === 0 && (e.setFloat("offset", 0), s.setStencilFunction(517), s.drawElementsType(P.TriangleFillMode, 0, 6)), this.innerGlow && t === 1 && (e.setFloat("offset", 1), s.setStencilFunction(514), s.drawElementsType(P.TriangleFillMode, 0, 6)), s.restoreStencilState();
  }
  _setEmissiveTextureAndColor(e, t, s) {
    const n = this._meshes[e.uniqueId];
    n ? this._emissiveTextureAndColor.color.set(n.color.r, n.color.g, n.color.b, 1) : this._emissiveTextureAndColor.color.set(this.neutralColor.r, this.neutralColor.g, this.neutralColor.b, this.neutralColor.a), n && n.glowEmissiveOnly && s ? (this._emissiveTextureAndColor.texture = s.emissiveTexture, this._emissiveTextureAndColor.color.set(1, 1, 1, 1)) : this._emissiveTextureAndColor.texture = null;
  }
  shouldRender() {
    return !!(this._meshes && super.shouldRender());
  }
  _shouldRenderMesh(e) {
    return this._excludedMeshes && this._excludedMeshes[e.uniqueId] ? !1 : super.hasMesh(e);
  }
  _addCustomEffectDefines(e) {
    e.push("#define HIGHLIGHT");
  }
  /**
   * Add a mesh in the exclusion list to prevent it to impact or being impacted by the highlight layer.
   * @param mesh The mesh to exclude from the highlight layer
   */
  addExcludedMesh(e) {
    if (!this._excludedMeshes)
      return;
    if (!this._excludedMeshes[e.uniqueId]) {
      const s = {
        mesh: e,
        beforeBind: null,
        afterRender: null,
        stencilState: !1
      };
      s.beforeBind = e.onBeforeBindObservable.add((n) => {
        this._mainObjectRendererRenderPassId !== -1 && this._mainObjectRendererRenderPassId !== this._engine.currentRenderPassId || (s.stencilState = n.getEngine().getStencilBuffer(), n.getEngine().setStencilBuffer(!1));
      }), s.afterRender = e.onAfterRenderObservable.add((n) => {
        this._mainObjectRendererRenderPassId !== -1 && this._mainObjectRendererRenderPassId !== this._engine.currentRenderPassId || n.getEngine().setStencilBuffer(s.stencilState);
      }), this._excludedMeshes[e.uniqueId] = s;
    }
  }
  /**
   * Remove a mesh from the exclusion list to let it impact or being impacted by the highlight layer.
   * @param mesh The mesh to highlight
   */
  removeExcludedMesh(e) {
    if (!this._excludedMeshes)
      return;
    const t = this._excludedMeshes[e.uniqueId];
    t && (t.beforeBind && e.onBeforeBindObservable.remove(t.beforeBind), t.afterRender && e.onAfterRenderObservable.remove(t.afterRender)), this._excludedMeshes[e.uniqueId] = null;
  }
  hasMesh(e) {
    return !this._meshes || !super.hasMesh(e) ? !1 : !!this._meshes[e.uniqueId];
  }
  /**
   * Add a mesh in the highlight layer in order to make it glow with the chosen color.
   * @param mesh The mesh to highlight
   * @param color The color of the highlight
   * @param glowEmissiveOnly Extract the glow from the emissive texture
   */
  addMesh(e, t, s = !1) {
    if (!this._meshes)
      return;
    const n = this._meshes[e.uniqueId];
    n ? n.color = t : (this._meshes[e.uniqueId] = {
      mesh: e,
      color: t,
      // Lambda required for capture due to Observable this context
      observerHighlight: e.onBeforeBindObservable.add((a) => {
        this._mainObjectRendererRenderPassId !== -1 && this._mainObjectRendererRenderPassId !== this._engine.currentRenderPassId || this.isEnabled && (this._excludedMeshes && this._excludedMeshes[a.uniqueId] ? this._defaultStencilReference(a) : a.getScene().getEngine().setStencilFunctionReference(this._instanceGlowingMeshStencilReference << 8 - this.numStencilBits));
      }),
      observerDefault: e.onAfterRenderObservable.add((a) => {
        this._mainObjectRendererRenderPassId !== -1 && this._mainObjectRendererRenderPassId !== this._engine.currentRenderPassId || this.isEnabled && this._defaultStencilReference(a);
      }),
      glowEmissiveOnly: s
    }, e.onDisposeObservable.add(() => {
      this._disposeMesh(e);
    })), this._shouldRender = !0;
  }
  /**
   * Remove a mesh from the highlight layer in order to make it stop glowing.
   * @param mesh The mesh to highlight
   */
  removeMesh(e) {
    if (!this._meshes)
      return;
    const t = this._meshes[e.uniqueId];
    t && (t.observerHighlight && e.onBeforeBindObservable.remove(t.observerHighlight), t.observerDefault && e.onAfterRenderObservable.remove(t.observerDefault), delete this._meshes[e.uniqueId]), this._shouldRender = !1;
    for (const s in this._meshes)
      if (this._meshes[s]) {
        this._shouldRender = !0;
        break;
      }
  }
  /**
   * Remove all the meshes currently referenced in the highlight layer
   */
  removeAllMeshes() {
    if (this._meshes) {
      for (const e in this._meshes)
        if (Object.prototype.hasOwnProperty.call(this._meshes, e)) {
          const t = this._meshes[e];
          t && this.removeMesh(t.mesh);
        }
    }
  }
  _defaultStencilReference(e) {
    e.getScene().getEngine().setStencilFunctionReference(M.NormalMeshStencilReference << 8 - this.numStencilBits);
  }
  _disposeMesh(e) {
    this.removeMesh(e), this.removeExcludedMesh(e);
  }
  dispose() {
    if (this._meshes) {
      for (const e in this._meshes) {
        const t = this._meshes[e];
        t && t.mesh && (t.observerHighlight && t.mesh.onBeforeBindObservable.remove(t.observerHighlight), t.observerDefault && t.mesh.onAfterRenderObservable.remove(t.observerDefault));
      }
      this._meshes = null;
    }
    if (this._excludedMeshes) {
      for (const e in this._excludedMeshes) {
        const t = this._excludedMeshes[e];
        t && (t.beforeBind && t.mesh.onBeforeBindObservable.remove(t.beforeBind), t.afterRender && t.mesh.onAfterRenderObservable.remove(t.afterRender));
      }
      this._excludedMeshes = null;
    }
    super.dispose();
  }
}
M.EffectName = "HighlightLayer";
M.NeutralColor = new U(0, 0, 0, 0);
M.GlowingMeshStencilReference = 2;
M.NormalMeshStencilReference = 1;
class J extends q {
  constructor(e, t, s, n, a = null, l = y.BILINEAR_SAMPLINGMODE, o, h) {
    const r = {
      uniforms: L.Uniforms,
      size: typeof n == "number" ? n : void 0,
      camera: a,
      samplingMode: l,
      engine: o,
      reusable: h,
      ...n
    };
    super(e, L.FragmentUrl, {
      effectWrapper: typeof n == "number" || !n.effectWrapper ? new L(e, o, t, s, r) : void 0,
      ...r
    }), this.direction = t, this.kernel = s, this.onApplyObservable.add(() => {
      this._effectWrapper.textureWidth = this.width, this._effectWrapper.textureHeight = this.height;
    });
  }
  _gatherImports(e, t) {
    e ? (this._webGPUReady = !0, t.push(import("./glowBlurPostProcess.fragment-c5e949d6.js"))) : t.push(import("./glowBlurPostProcess.fragment-28eb760a.js")), super._gatherImports(e, t);
  }
}
let ee = (() => {
  var f;
  let e = ie, t = [], s, n, a, l, o, h, r = [], c = [];
  return f = class extends e {
    /**
     * The neutral color used during the preparation of the glow effect.
     * This is black by default as the blend operation is a blend operation.
     */
    static get NeutralColor() {
      return M.NeutralColor;
    }
    static set NeutralColor(i) {
      M.NeutralColor = i;
    }
    /**
     * Specifies whether or not the inner glow is ACTIVE in the layer.
     */
    get innerGlow() {
      return this._thinEffectLayer.innerGlow;
    }
    set innerGlow(i) {
      this._thinEffectLayer.innerGlow = i;
    }
    /**
     * Specifies whether or not the outer glow is ACTIVE in the layer.
     */
    get outerGlow() {
      return this._thinEffectLayer.outerGlow;
    }
    set outerGlow(i) {
      this._thinEffectLayer.outerGlow = i;
    }
    /**
     * Specifies the horizontal size of the blur.
     */
    set blurHorizontalSize(i) {
      this._thinEffectLayer.blurHorizontalSize = i;
    }
    /**
     * Specifies the vertical size of the blur.
     */
    set blurVerticalSize(i) {
      this._thinEffectLayer.blurVerticalSize = i;
    }
    /**
     * Gets the horizontal size of the blur.
     */
    get blurHorizontalSize() {
      return this._thinEffectLayer.blurHorizontalSize;
    }
    /**
     * Gets the vertical size of the blur.
     */
    get blurVerticalSize() {
      return this._thinEffectLayer.blurVerticalSize;
    }
    /**
     * Number of stencil bits used by the highlight layer (default: 8).
     * The layer uses the numStencilBits highest bits of the stencil buffer.
     */
    get numStencilBits() {
      return this._thinEffectLayer.numStencilBits;
    }
    set numStencilBits(i) {
      this._thinEffectLayer.numStencilBits = i;
    }
    /**
     * Gets the stencil reference value used for the meshes rendered by the highlight layer.
     */
    get stencilReference() {
      return this._thinEffectLayer.stencilReference;
    }
    /**
     * Instantiates a new highlight Layer and references it to the scene..
     * @param name The name of the layer
     * @param scene The scene to use the layer in
     * @param options Sets of none mandatory options to use with the layer (see IHighlightLayerOptions for more information)
     */
    constructor(i, d, g) {
      super(i, d, g !== void 0 ? !!g.forceGLSL : !1, new M(i, d, g)), this.onBeforeBlurObservable = (D(this, t), new b()), this.onAfterBlurObservable = new b(), this._options = D(this, r, void 0), this._downSamplePostprocess = D(this, c), this._engine.isStencilEnable || xe.Warn("Rendering the Highlight Layer requires the stencil to be active on the canvas. var engine = new Engine(canvas, antialias, { stencil: true }"), this._options = {
        mainTextureRatio: 0.5,
        blurTextureSizeRatio: 0.5,
        mainTextureFixedSize: 0,
        blurHorizontalSize: 1,
        blurVerticalSize: 1,
        alphaBlendingMode: 2,
        camera: null,
        renderingGroupId: -1,
        mainTextureType: 0,
        mainTextureFormat: 5,
        forceGLSL: !1,
        isStroke: !1,
        generateStencilBuffer: !1,
        ...g
      }, this._init(this._options), this._shouldRender = !1;
    }
    /**
     * Get the effect name of the layer.
     * @returns The effect name
     */
    getEffectName() {
      return f.EffectName;
    }
    _numInternalDraws() {
      return 2;
    }
    /**
     * Create the merge effect. This is the shader use to blit the information back
     * to the main canvas at the end of the scene rendering.
     * @returns The effect created
     */
    _createMergeEffect() {
      return this._thinEffectLayer._createMergeEffect();
    }
    /**
     * Creates the render target textures and post processes used in the highlight layer.
     */
    _createTextureAndPostProcesses() {
      let i = this._mainTextureDesiredSize.width * this._options.blurTextureSizeRatio, d = this._mainTextureDesiredSize.height * this._options.blurTextureSizeRatio;
      i = this._engine.needPOTTextures ? W(i, this._maxSize) : i, d = this._engine.needPOTTextures ? W(d, this._maxSize) : d;
      let g;
      this._engine.getCaps().textureHalfFloatRender ? g = 2 : g = 0, this._blurTexture = new se("HighlightLayerBlurRTT", {
        width: i,
        height: d
      }, this._scene, !1, !0, g), this._blurTexture.wrapU = y.CLAMP_ADDRESSMODE, this._blurTexture.wrapV = y.CLAMP_ADDRESSMODE, this._blurTexture.anisotropicFilteringLevel = 16, this._blurTexture.updateSamplingMode(y.TRILINEAR_SAMPLINGMODE), this._blurTexture.renderParticles = !1, this._blurTexture.ignoreCameraViewport = !0, this._textures = [this._blurTexture], this._thinEffectLayer.bindTexturesForCompose = (_) => {
        _.setTexture("textureSampler", this._blurTexture);
      }, this._thinEffectLayer._createTextureAndPostProcesses(), this._options.alphaBlendingMode === 2 ? (this._downSamplePostprocess = new K("HighlightLayerPPP", {
        size: this._options.blurTextureSizeRatio,
        samplingMode: y.BILINEAR_SAMPLINGMODE,
        engine: this._scene.getEngine(),
        effectWrapper: this._thinEffectLayer._postProcesses[0]
      }), this._downSamplePostprocess.externalTextureSamplerBinding = !0, this._downSamplePostprocess.onApplyObservable.add((_) => {
        _.setTexture("textureSampler", this._mainTexture);
      }), this._horizontalBlurPostprocess = new J("HighlightLayerHBP", new v(1, 0), this._options.blurHorizontalSize, {
        samplingMode: y.BILINEAR_SAMPLINGMODE,
        engine: this._scene.getEngine(),
        effectWrapper: this._thinEffectLayer._postProcesses[1]
      }), this._horizontalBlurPostprocess.onApplyObservable.add((_) => {
        _.setFloat2("screenSize", i, d);
      }), this._verticalBlurPostprocess = new J("HighlightLayerVBP", new v(0, 1), this._options.blurVerticalSize, {
        samplingMode: y.BILINEAR_SAMPLINGMODE,
        engine: this._scene.getEngine(),
        effectWrapper: this._thinEffectLayer._postProcesses[2]
      }), this._verticalBlurPostprocess.onApplyObservable.add((_) => {
        _.setFloat2("screenSize", i, d);
      }), this._postProcesses = [this._downSamplePostprocess, this._horizontalBlurPostprocess, this._verticalBlurPostprocess]) : (this._horizontalBlurPostprocess = new Z("HighlightLayerHBP", new v(1, 0), this._options.blurHorizontalSize / 2, {
        size: {
          width: i,
          height: d
        },
        samplingMode: y.BILINEAR_SAMPLINGMODE,
        engine: this._scene.getEngine(),
        textureType: g,
        effectWrapper: this._thinEffectLayer._postProcesses[0]
      }), this._horizontalBlurPostprocess.width = i, this._horizontalBlurPostprocess.height = d, this._horizontalBlurPostprocess.externalTextureSamplerBinding = !0, this._horizontalBlurPostprocess.onApplyObservable.add((_) => {
        _.setTexture("textureSampler", this._mainTexture);
      }), this._verticalBlurPostprocess = new Z("HighlightLayerVBP", new v(0, 1), this._options.blurVerticalSize / 2, {
        size: {
          width: i,
          height: d
        },
        samplingMode: y.BILINEAR_SAMPLINGMODE,
        engine: this._scene.getEngine(),
        textureType: g
      }), this._postProcesses = [this._horizontalBlurPostprocess, this._verticalBlurPostprocess]), this._mainTexture.onAfterUnbindObservable.add(() => {
        this.onBeforeBlurObservable.notifyObservers(this);
        const _ = this._blurTexture.renderTarget;
        _ && (this._scene.postProcessManager.directRender(this._postProcesses, _, !0), this._engine.unBindFramebuffer(_, !0)), this.onAfterBlurObservable.notifyObservers(this);
      }), this._postProcesses.map((_) => {
        _.autoClear = !1;
      }), this._mainTextureCreatedSize.width = this._mainTextureDesiredSize.width, this._mainTextureCreatedSize.height = this._mainTextureDesiredSize.height;
    }
    /**
     * @returns whether or not the layer needs stencil enabled during the mesh rendering.
     */
    needStencil() {
      return this._thinEffectLayer.needStencil();
    }
    /**
     * Checks for the readiness of the element composing the layer.
     * @param subMesh the mesh to check for
     * @param useInstances specify whether or not to use instances to render the mesh
     * @returns true if ready otherwise, false
     */
    isReady(i, d) {
      return this._thinEffectLayer.isReady(i, d);
    }
    /**
     * Implementation specific of rendering the generating effect on the main canvas.
     * @param effect The effect used to render through
     * @param renderIndex
     */
    _internalRender(i, d) {
      this._thinEffectLayer._internalCompose(i, d);
    }
    /**
     * @returns true if the layer contains information to display, otherwise false.
     */
    shouldRender() {
      return this._thinEffectLayer.shouldRender();
    }
    /**
     * Returns true if the mesh should render, otherwise false.
     * @param mesh The mesh to render
     * @returns true if it should render otherwise false
     */
    _shouldRenderMesh(i) {
      return this._thinEffectLayer._shouldRenderMesh(i);
    }
    /**
     * Returns true if the mesh can be rendered, otherwise false.
     * @param mesh The mesh to render
     * @param material The material used on the mesh
     * @returns true if it can be rendered otherwise false
     */
    _canRenderMesh(i, d) {
      return this._thinEffectLayer._canRenderMesh(i, d);
    }
    /**
     * Adds specific effects defines.
     * @param defines The defines to add specifics to.
     */
    _addCustomEffectDefines(i) {
      this._thinEffectLayer._addCustomEffectDefines(i);
    }
    /**
     * Sets the required values for both the emissive texture and and the main color.
     * @param mesh
     * @param subMesh
     * @param material
     */
    _setEmissiveTextureAndColor(i, d, g) {
      this._thinEffectLayer._setEmissiveTextureAndColor(i, d, g);
    }
    /**
     * Add a mesh in the exclusion list to prevent it to impact or being impacted by the highlight layer.
     * @param mesh The mesh to exclude from the highlight layer
     */
    addExcludedMesh(i) {
      this._thinEffectLayer.addExcludedMesh(i);
    }
    /**
     * Remove a mesh from the exclusion list to let it impact or being impacted by the highlight layer.
     * @param mesh The mesh to highlight
     */
    removeExcludedMesh(i) {
      this._thinEffectLayer.removeExcludedMesh(i);
    }
    /**
     * Determine if a given mesh will be highlighted by the current HighlightLayer
     * @param mesh mesh to test
     * @returns true if the mesh will be highlighted by the current HighlightLayer
     */
    hasMesh(i) {
      return this._thinEffectLayer.hasMesh(i);
    }
    /**
     * Add a mesh in the highlight layer in order to make it glow with the chosen color.
     * @param mesh The mesh to highlight
     * @param color The color of the highlight
     * @param glowEmissiveOnly Extract the glow from the emissive texture
     */
    addMesh(i, d, g = !1) {
      this._thinEffectLayer.addMesh(i, d, g);
    }
    /**
     * Remove a mesh from the highlight layer in order to make it stop glowing.
     * @param mesh The mesh to highlight
     */
    removeMesh(i) {
      this._thinEffectLayer.removeMesh(i);
    }
    /**
     * Remove all the meshes currently referenced in the highlight layer
     */
    removeAllMeshes() {
      this._thinEffectLayer.removeAllMeshes();
    }
    /**
     * Free any resources and references associated to a mesh.
     * Internal use
     * @param mesh The mesh to free.
     * @internal
     */
    _disposeMesh(i) {
      this._thinEffectLayer._disposeMesh(i);
    }
    /**
     * Gets the class name of the effect layer
     * @returns the string with the class name of the effect layer
     */
    getClassName() {
      return "HighlightLayer";
    }
    /**
     * Serializes this Highlight layer
     * @returns a serialized Highlight layer object
     */
    serialize() {
      const i = V.Serialize(this);
      i.customType = "BABYLON.HighlightLayer", i.meshes = [];
      const d = this._thinEffectLayer._meshes;
      if (d)
        for (const _ in d) {
          const m = d[_];
          m && i.meshes.push({
            glowEmissiveOnly: m.glowEmissiveOnly,
            color: m.color.asArray(),
            meshId: m.mesh.id
          });
        }
      i.excludedMeshes = [];
      const g = this._thinEffectLayer._excludedMeshes;
      if (g)
        for (const _ in g) {
          const m = g[_];
          m && i.excludedMeshes.push(m.mesh.id);
        }
      return i;
    }
    /**
     * Creates a Highlight layer from parsed Highlight layer data
     * @param parsedHightlightLayer defines the Highlight layer data
     * @param scene defines the current scene
     * @param rootUrl defines the root URL containing the Highlight layer information
     * @returns a parsed Highlight layer
     */
    static Parse(i, d, g) {
      const _ = V.Parse(() => new f(i.name, d, i.options), i, d, g);
      let m;
      for (m = 0; m < i.excludedMeshes.length; m++) {
        const x = d.getMeshById(i.excludedMeshes[m]);
        x && _.addExcludedMesh(x);
      }
      for (m = 0; m < i.meshes.length; m++) {
        const x = i.meshes[m], p = d.getMeshById(x.meshId);
        p && _.addMesh(p, Se.FromArray(x.color), x.glowEmissiveOnly);
      }
      return _;
    }
  }, (() => {
    const u = typeof Symbol == "function" && Symbol.metadata ? Object.create(e[Symbol.metadata] ?? null) : void 0;
    s = [T()], n = [T()], a = [T()], l = [T()], o = [T()], h = [T("options")], R(f, null, s, { kind: "getter", name: "innerGlow", static: !1, private: !1, access: { has: (i) => "innerGlow" in i, get: (i) => i.innerGlow }, metadata: u }, null, t), R(f, null, n, { kind: "getter", name: "outerGlow", static: !1, private: !1, access: { has: (i) => "outerGlow" in i, get: (i) => i.outerGlow }, metadata: u }, null, t), R(f, null, a, { kind: "getter", name: "blurHorizontalSize", static: !1, private: !1, access: { has: (i) => "blurHorizontalSize" in i, get: (i) => i.blurHorizontalSize }, metadata: u }, null, t), R(f, null, l, { kind: "getter", name: "blurVerticalSize", static: !1, private: !1, access: { has: (i) => "blurVerticalSize" in i, get: (i) => i.blurVerticalSize }, metadata: u }, null, t), R(f, null, o, { kind: "getter", name: "numStencilBits", static: !1, private: !1, access: { has: (i) => "numStencilBits" in i, get: (i) => i.numStencilBits }, metadata: u }, null, t), R(null, null, h, { kind: "field", name: "_options", static: !1, private: !1, access: { has: (i) => "_options" in i, get: (i) => i._options, set: (i, d) => {
      i._options = d;
    } }, metadata: u }, r, c), u && Object.defineProperty(f, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: u });
  })(), /**
   * Effect Name of the highlight layer.
   */
  f.EffectName = "HighlightLayer", f;
})(), te = !1;
function Ie() {
  te || (te = !0, ye.prototype.getHighlightLayerByName = function(f) {
    var e;
    for (let t = 0; t < ((e = this.effectLayers) == null ? void 0 : e.length); t++)
      if (this.effectLayers[t].name === f && this.effectLayers[t].getEffectName() === ee.EffectName)
        return this.effectLayers[t];
    return null;
  }, Re("BABYLON.HighlightLayer", ee));
}
Ie();
export {
  ee as HighlightLayer
};
