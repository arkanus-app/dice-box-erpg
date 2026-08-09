import { a5 as D, a6 as j, n as I, O as v, x as y, R as k, a7 as U, a8 as z, a as E, V as N, M as W, a9 as V, aa as G, ab as H, ac as $, t as K, ad as Y, X as q, v as A, w as J, z as X, ae as Z, I as F } from "./index-11ca32cf.js";
import { a as Q, P as ee } from "./postProcess.pure-bf549f59.js";
class S {
  /**
   * Use this list to define the list of mesh you want to render.
   */
  get renderList() {
    return this._renderList;
  }
  set renderList(e) {
    this._renderList !== e && (this._unObserveRenderList && (this._unObserveRenderList(), this._unObserveRenderList = null), e && (this._unObserveRenderList = D(e, this._renderListHasChanged)), this._renderList = e);
  }
  /**
   * If true, the object renderer will render all objects without any image processing applied.
   * If false (default value), the renderer will use the current setting of the scene's image processing configuration.
   */
  get disableImageProcessing() {
    return this._disableImageProcessing;
  }
  set disableImageProcessing(e) {
    e !== this._disableImageProcessing && (this._disableImageProcessing = e, this._scene.markAllMaterialsAsDirty(64));
  }
  /**
   * Specifies to disable depth pre-pass if true (default: false)
   */
  get disableDepthPrePass() {
    return this._disableDepthPrePass;
  }
  set disableDepthPrePass(e) {
    this._disableDepthPrePass = e, this._renderingManager.disableDepthPrePass = e;
  }
  /**
   * Friendly name of the object renderer
   */
  get name() {
    return this._name;
  }
  set name(e) {
    if (this._name !== e) {
      if (this._name = e, this._sceneUBOs)
        for (let t = 0; t < this._sceneUBOs.length; ++t)
          this._sceneUBOs[t].name = `Scene ubo #${t} for ${this.name}`;
      if (this._scene)
        for (let t = 0; t < this._renderPassIds.length; ++t) {
          const r = this._renderPassIds[t];
          this._engine._renderPassNames[r] = `${this._name}#${t}`;
        }
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
   * Gets the array of active meshes
   * @returns an array of AbstractMesh
   */
  getActiveMeshes() {
    return this._activeMeshes;
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
      for (let n = 0; n < this.options.numPasses; ++n) {
        let a = r[s];
        r[s].isAnInstance && (a = r[s].sourceMesh), a.setMaterialForRenderPass(this._renderPassIds[n], t !== void 0 ? Array.isArray(t) ? t[n] : t : void 0);
      }
  }
  /** @internal */
  _freezeActiveMeshes(e) {
    this._freezeActiveMeshesCancel = j(() => this._checkReadiness(), () => {
      if (this._freezeActiveMeshesCancel = null, e)
        for (let t = 0; t < this._activeMeshes.length; t++)
          this._activeMeshes.data[t]._freeze();
      this._prepareRenderingManager(0, !0), this._isFrozen = !0;
    }, (t, r) => {
      this._freezeActiveMeshesCancel = null, r ? (I.Error("ObjectRenderer: Timeout while waiting for the renderer to be ready."), t && I.Error(t)) : (I.Error("ObjectRenderer: An unexpected error occurred while waiting for the renderer to be ready."), t && (I.Error(t), t.stack && I.Error(t.stack)));
    });
  }
  /** @internal */
  _unfreezeActiveMeshes() {
    var e;
    (e = this._freezeActiveMeshesCancel) == null || e.call(this), this._freezeActiveMeshesCancel = null;
    for (let t = 0; t < this._activeMeshes.length; t++)
      this._activeMeshes.data[t]._unFreeze();
    this._isFrozen = !1;
  }
  /**
   * Instantiates an object renderer.
   * @param name The friendly name of the object renderer
   * @param scene The scene the renderer belongs to
   * @param options The options used to create the renderer (optional)
   */
  constructor(e, t, r) {
    this._unObserveRenderList = null, this._renderListHasChanged = (s, n) => {
      const a = this._renderList ? this._renderList.length : 0;
      if (n === 0 && a > 0 || a === 0)
        for (const h of this._scene.meshes)
          h._markSubMeshesAsLightDirty();
    }, this.particleSystemList = null, this.getCustomRenderList = null, this.renderMeshes = !0, this.renderDepthOnlyMeshes = !0, this.renderOpaqueMeshes = !0, this.renderAlphaTestMeshes = !0, this.renderTransparentMeshes = !0, this.renderParticles = !0, this.renderSprites = !1, this.forceLayerMaskCheck = !1, this.enableBoundingBoxRendering = !1, this.enableOutlineRendering = !0, this._disableImageProcessing = !1, this.dontSetTransformationMatrix = !1, this._disableDepthPrePass = !1, this.onBeforeRenderObservable = new v(), this.onAfterRenderObservable = new v(), this.onBeforeRenderingManagerRenderObservable = new v(), this.onAfterRenderingManagerRenderObservable = new v(), this.onInitRenderingObservable = new v(), this.onFinishRenderingObservable = new v(), this.onFastPathRenderObservable = new v(), this._currentRefreshId = -1, this._refreshRate = 1, this._currentApplyByPostProcessSetting = !1, this._activeMeshes = new y(256), this._activeBoundingBoxes = new y(32), this._currentFrameId = -1, this._currentSceneUBOIndex = 0, this._isFrozen = !1, this._freezeActiveMeshesCancel = null, this._currentSceneCamera = null, this.name = e, this._scene = t, this._engine = this._scene.getEngine(), this._useUBO = this._engine.supportsUniformBuffers, this.renderList = [], this._renderPassIds = [], this.options = {
      numPasses: 1,
      doNotChangeAspectRatio: !0,
      enableClusteredLights: !1,
      ...r
    }, this._createRenderPassId(), this.renderPassId = this._renderPassIds[0], this._renderingManager = new k(t), this._renderingManager._useSceneAutoClearSetup = !0, this.options.enableClusteredLights && this.onInitRenderingObservable.add(() => {
      for (const s of this._scene.lights)
        s.getTypeID() === U.LIGHTTYPEID_CLUSTERED_CONTAINER && s.isSupported && s._updateBatches(this.activeCamera).render();
    }), this._scene.addObjectRenderer(this);
  }
  _releaseRenderPassId() {
    for (let e = 0; e < this.options.numPasses; ++e)
      this._engine.releaseRenderPassId(this._renderPassIds[e]);
    this._renderPassIds.length = 0;
  }
  _createRenderPassId() {
    this._releaseRenderPassId();
    for (let e = 0; e < this.options.numPasses; ++e)
      this._renderPassIds[e] = this._engine.createRenderPassId(`${this.name}#${e}`);
  }
  _createSceneUBO(e, t) {
    const r = this._scene.getEngine(), s = new z(r, void 0, t, e, void 0, !1);
    return s.addUniform("viewProjection", 16), t && s.addUniform("viewProjectionR", 16), s.addUniform("view", 16), s.addUniform("projection", 16), s.addUniform("vEyePosition", 4), s.addUniform("inverseProjection", 16), s;
  }
  _getSceneUBO() {
    var s;
    this._currentFrameId !== this._engine.frameId && (this._currentSceneUBOIndex = 0, this._currentFrameId = this._engine.frameId), this._sceneUBOs || (this._sceneUBOs = [], this._sceneUBOIsMultiview = []);
    const e = this._engine._currentRenderTarget, t = !!(e && ((s = e.texture) != null && s.isMultiview)) || !!this._scene._multiviewSceneUboIsActive;
    if (this._currentSceneUBOIndex >= this._sceneUBOs.length) {
      const n = this._sceneUBOs.length;
      this._sceneUBOs.push(this._createSceneUBO(`Scene ubo #${n} for ${this.name}`, t)), this._sceneUBOIsMultiview.push(t);
    } else
      this._sceneUBOIsMultiview[this._currentSceneUBOIndex] !== t && (this._sceneUBOs[this._currentSceneUBOIndex].dispose(), this._sceneUBOs[this._currentSceneUBOIndex] = this._createSceneUBO(`Scene ubo #${this._currentSceneUBOIndex} for ${this.name}`, t), this._sceneUBOIsMultiview[this._currentSceneUBOIndex] = t);
    const r = this._sceneUBOs[this._currentSceneUBOIndex++];
    return r.unbindEffect(), r;
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
   * When snapshot rendering is active, this always returns true to ensure render pass
   * topology stays consistent between the recording frame and playback frames.
   * @returns true if the renderer should render the current frame
   */
  shouldRender() {
    return this._engine.snapshotRendering ? !0 : this._currentRefreshId === -1 ? (this._currentRefreshId = 1, !0) : this.refreshRate === this._currentRefreshId ? (this._currentRefreshId = 1, !0) : (this._currentRefreshId++, !1);
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
    this._currentApplyByPostProcessSetting = this._scene.imageProcessingConfiguration.applyByPostProcess, this._disableImageProcessing && (this._scene.imageProcessingConfiguration._applyByPostProcess = this._disableImageProcessing);
  }
  /**
   * This method makes sure everything is setup before "render" can be called
   * @param viewportWidth Width of the viewport to render to
   * @param viewportHeight Height of the viewport to render to
   */
  initRender(e, t) {
    const r = this.activeCamera ?? this._scene.activeCamera;
    this._currentSceneCamera = this._scene.activeCamera, this._useUBO && (this._currentSceneUBO = this._scene.getSceneUniformBuffer(), this._currentSceneUBO.unbindEffect(), this._scene.setSceneUniformBuffer(this._getSceneUBO())), this.onInitRenderingObservable.notifyObservers(this), r && (this.dontSetTransformationMatrix || this._scene.setTransformMatrix(r.getViewMatrix(), r.getProjectionMatrix(!0)), this._scene._activeCamera = r, this._engine.setViewport(r.rigParent ? r.rigParent.viewport : r.viewport, e, t)), this._useUBO && this._scene.finalizeSceneUbo(), this._defaultRenderListPrepared = !1;
  }
  /**
   * This method must be called after the "render" call(s), to complete the rendering process.
   */
  finishRender() {
    const e = this._scene;
    this._useUBO && this._scene.setSceneUniformBuffer(this._currentSceneUBO), this._disableImageProcessing && (e.imageProcessingConfiguration._applyByPostProcess = this._currentApplyByPostProcessSetting), e._activeCamera = this._currentSceneCamera, this._currentSceneCamera && (this.activeCamera && this.activeCamera !== e.activeCamera && e.setTransformMatrix(this._currentSceneCamera.getViewMatrix(), this._currentSceneCamera.getProjectionMatrix(!0)), this._engine.setViewport(this._currentSceneCamera.viewport)), e.resetCachedMaterial(), this.onFinishRenderingObservable.notifyObservers(this);
  }
  /**
   * Renders all the objects (meshes, particles systems, sprites) to the currently bound render target texture.
   * @param passIndex defines the pass index to use (default: 0)
   * @param skipOnAfterRenderObservable defines a flag to skip raising the onAfterRenderObservable
   */
  render(e = 0, t = !1) {
    var n, a;
    const r = this._engine.currentRenderPassId;
    if (this._engine.currentRenderPassId = this._renderPassIds[e], this.onBeforeRenderObservable.notifyObservers(e), this._engine.snapshotRendering && this._engine.snapshotRenderingMode === 1)
      this.onFastPathRenderObservable.notifyObservers(e);
    else {
      const h = this._prepareRenderingManager(e), c = (a = (n = this._scene).getOutlineRenderer) == null ? void 0 : a.call(n), g = c == null ? void 0 : c.enabled;
      c && (c.enabled = this.enableOutlineRendering), this.onBeforeRenderingManagerRenderObservable.notifyObservers(e), this._renderingManager.render(this.customRenderFunction, h, this.renderParticles, this.renderSprites, this.renderDepthOnlyMeshes, this.renderOpaqueMeshes, this.renderAlphaTestMeshes, this.renderTransparentMeshes, this.customRenderTransparentSubMeshes), this.onAfterRenderingManagerRenderObservable.notifyObservers(e), c && (c.enabled = g);
    }
    t || this.onAfterRenderObservable.notifyObservers(e), this._engine.currentRenderPassId = r;
  }
  /** @internal */
  _checkReadiness() {
    const e = this._scene, t = this._engine.currentRenderPassId;
    let r = !0;
    e.getViewMatrix() || e.updateTransformMatrix();
    const s = this.options.numPasses;
    for (let a = 0; a < s && r; a++) {
      const h = this.renderList ? this.renderList : e.frameGraph ? e.meshes : e.getActiveMeshes().data, c = this.renderList || e.frameGraph ? h.length : e.getActiveMeshes().length;
      this._engine.currentRenderPassId = this._renderPassIds[a], this.onBeforeRenderObservable.notifyObservers(a);
      let g = null, d = c;
      this.getCustomRenderList && (g = this.getCustomRenderList(a, h, c), g && (d = g.length)), g || (g = h), this.options.doNotChangeAspectRatio || e.updateTransformMatrix(!0);
      for (let u = 0; u < d && r; ++u) {
        const R = g[u];
        if (!(!R.isEnabled() || R.isBlocked || !R.isVisible || !R.subMeshes)) {
          if (this.customIsReadyFunction) {
            if (!this.customIsReadyFunction(R, this.refreshRate, !0)) {
              r = !1;
              continue;
            }
          } else if (!R.isReady(!0)) {
            r = !1;
            continue;
          }
        }
      }
      this.onAfterRenderObservable.notifyObservers(a), s > 1 && (e.incrementRenderId(), e.resetCachedMaterial());
    }
    const n = this.particleSystemList || e.particleSystems;
    for (const a of n)
      a.isReady() || (r = !1);
    return this._engine.currentRenderPassId = t, r;
  }
  _prepareRenderingManager(e = 0, t = !1) {
    var R;
    const r = this._scene;
    let s = null, n, a;
    const h = this.renderList ? this.renderList : r.frameGraph ? r.meshes : r.getActiveMeshes().data, c = this.renderList || r.frameGraph ? h.length : r.getActiveMeshes().length;
    if (this.getCustomRenderList && (s = this.getCustomRenderList(e, h, c)), s)
      n = s.length, a = this.forceLayerMaskCheck;
    else {
      if (this._defaultRenderListPrepared && !t && !this._engine.isWebGPU)
        return h;
      this._defaultRenderListPrepared = !0, s = h, n = c, a = !this.renderList || this.forceLayerMaskCheck;
    }
    const g = r.activeCamera, d = this.cameraForLOD ?? g, u = (R = r.getBoundingBoxRenderer) == null ? void 0 : R.call(r);
    if (r._activeMeshesFrozen && this._isFrozen) {
      if (this._renderingManager.resetSprites(), this.enableBoundingBoxRendering && u) {
        u.reset();
        for (let _ = 0; _ < this._activeBoundingBoxes.length; _++) {
          const l = this._activeBoundingBoxes.data[_];
          u.renderList.push(l);
        }
      }
      return s;
    }
    if (this._renderingManager.reset(), this._activeMeshes.reset(), this._activeBoundingBoxes.reset(), u && u.reset(), this.renderMeshes) {
      const _ = r.getRenderId(), l = r.getFrameId();
      for (let p = 0; p < n; p++) {
        const i = s[p];
        if (i && !i.isBlocked) {
          if (this.customIsReadyFunction) {
            if (!this.customIsReadyFunction(i, this.refreshRate, !1)) {
              this.resetRefreshCounter();
              continue;
            }
          } else if (!i.isReady(this.refreshRate === 0)) {
            this.resetRefreshCounter();
            continue;
          }
          let o;
          if (d) {
            const b = i._internalAbstractMeshDataInfo._currentLOD.get(d);
            !b || b[1] !== l ? (o = r.customLODSelector ? r.customLODSelector(i, d) : i.getLOD(d), b ? (b[0] = o, b[1] = l) : i._internalAbstractMeshDataInfo._currentLOD.set(d, [o, l])) : o = b[0];
          } else
            o = i;
          if (!o)
            continue;
          o !== i && o.billboardMode !== 0 && o.computeWorldMatrix(), o._preActivateForIntermediateRendering(_);
          let P;
          if (a && g ? P = (i.layerMask & g.layerMask) === 0 : P = !1, i.isEnabled() && i.isVisible && i.subMeshes && !P) {
            if (this._activeMeshes.push(i), o._internalAbstractMeshDataInfo._wasActiveLastFrame = !0, o !== i && o._activate(_, !0), this.enableBoundingBoxRendering && u && u._preActiveMesh(i), i._activate(_, !0) && i.subMeshes.length) {
              i.isAnInstance ? i._internalAbstractMeshDataInfo._actAsRegularMesh && (o = i) : o._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = !1, o._internalAbstractMeshDataInfo._isActiveIntermediate = !0, r._prepareSkeleton(o);
              for (let b = 0; b < o.subMeshes.length; b++) {
                const M = o.subMeshes[b];
                this.enableBoundingBoxRendering && u && u._evaluateSubMesh(i, M), this._renderingManager.dispatch(M, o);
              }
            }
            i._postActivate();
          }
        }
      }
    }
    if (this.enableBoundingBoxRendering && u && t)
      for (let _ = 0; _ < u.renderList.length; _++) {
        const l = u.renderList.data[_];
        this._activeBoundingBoxes.push(l);
      }
    if (this._scene.particlesEnabled && this.renderParticles) {
      this._scene.onBeforeParticlesRenderingObservable.notifyObservers(this._scene);
      const _ = this.particleSystemList || r.particleSystems;
      for (let l = 0; l < _.length; l++) {
        const p = _[l], i = p.emitter;
        !p.isStarted() || !i || i.position && !i.isEnabled() || this._renderingManager.dispatchParticles(p);
      }
      this._scene.onAfterParticlesRenderingObservable.notifyObservers(this._scene);
    }
    return s;
  }
  /**
   * Gets the rendering manager
   */
  get renderingManager() {
    return this._renderingManager;
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
    const e = new S(this.name, this._scene, this.options);
    return this.renderList && (e.renderList = this.renderList.slice(0)), e;
  }
  /**
   * Dispose the renderer and release its associated resources.
   */
  dispose() {
    const e = this.renderList ? this.renderList : this._scene.getActiveMeshes().data, t = this.renderList ? this.renderList.length : this._scene.getActiveMeshes().length;
    for (let r = 0; r < t; r++) {
      const s = e[r];
      s && s.getMaterialForRenderPass(this.renderPassId) !== void 0 && s.setMaterialForRenderPass(this.renderPassId, void 0);
    }
    if (this.onInitRenderingObservable.clear(), this.onFinishRenderingObservable.clear(), this.onBeforeRenderObservable.clear(), this.onAfterRenderObservable.clear(), this.onBeforeRenderingManagerRenderObservable.clear(), this.onAfterRenderingManagerRenderObservable.clear(), this.onFastPathRenderObservable.clear(), this._releaseRenderPassId(), this.renderList = null, this._sceneUBOs)
      for (const r of this._sceneUBOs)
        r.dispose();
    this._sceneUBOs = void 0, this._scene.removeObjectRenderer(this);
  }
  /** @internal */
  _rebuild() {
    this.refreshRate === S.REFRESHRATE_RENDER_ONCE && (this.refreshRate = S.REFRESHRATE_RENDER_ONCE);
  }
  /**
   * Clear the info related to rendering groups preventing retention point in material dispose.
   */
  freeRenderingGroups() {
    this._renderingManager && this._renderingManager.freeRenderingGroups();
  }
}
S.REFRESHRATE_RENDER_ONCE = 0;
S.REFRESHRATE_RENDER_ONEVERYFRAME = 1;
S.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = 2;
class T extends E {
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
   * Define if bounding box rendering should be enabled (still subject to Mesh.showBoundingBox or scene.forceShowBoundingBoxes). (Default: false).
   */
  get enableBoundingBoxRendering() {
    return this._objectRenderer.enableBoundingBoxRendering;
  }
  set enableBoundingBoxRendering(e) {
    this._objectRenderer.enableBoundingBoxRendering = e;
  }
  /**
   * Define if outline/overlay rendering should be enabled (still subject to Mesh.renderOutline/Mesh.renderOverlay). (Default: true).
   */
  get enableOutlineRendering() {
    return this._objectRenderer.enableOutlineRendering;
  }
  set enableOutlineRendering(e) {
    this._objectRenderer.enableOutlineRendering = e;
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
   * If true, the renderer will render all objects without any image processing applied.
   * If false (default value), the renderer will use the current setting of the scene's image processing configuration.
   */
  get disableImageProcessing() {
    return this._objectRenderer.disableImageProcessing;
  }
  set disableImageProcessing(e) {
    this._objectRenderer.disableImageProcessing = e;
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
  constructor(e, t, r, s = !1, n = !0, a = 0, h = !1, c = E.TRILINEAR_SAMPLINGMODE, g = !0, d = !1, u = !1, R = 5, _ = !1, l, p, i = !1, o = !1) {
    let P, b = !0, M, C = !1;
    if (typeof s == "object") {
      const f = s;
      s = !!f.generateMipMaps, n = f.doNotChangeAspectRatio ?? !0, a = f.type ?? 0, h = !!f.isCube, c = f.samplingMode ?? E.TRILINEAR_SAMPLINGMODE, g = f.generateDepthBuffer ?? !0, d = !!f.generateStencilBuffer, u = !!f.isMulti, R = f.format ?? 5, _ = !!f.delayAllocation, l = f.samples, p = f.creationFlags, i = !!f.noColorAttachment, o = !!f.useSRGBBuffer, P = f.colorAttachment, b = f.gammaSpace ?? b, M = f.existingObjectRenderer, C = !!f.enableClusteredLights;
    }
    if (super(null, r, !s, void 0, c, void 0, void 0, void 0, void 0, R), this.ignoreCameraViewport = !1, this.onBeforeBindObservable = new v(), this.onAfterUnbindObservable = new v(), this.onClearObservable = new v(), this.onResizeObservable = new v(), this._cleared = !1, this.skipInitialClear = !1, this._samples = 1, this._canRescale = !0, this._renderTarget = null, this._dontDisposeObjectRenderer = !1, this.boundingBoxPosition = N.Zero(), this._disableEngineStages = !1, this._dumpToolsLoading = !1, r = this.getScene(), !r)
      return;
    const L = this.getScene().getEngine();
    this._gammaSpace = b, this._coordinatesMode = E.PROJECTION_MODE, this.name = e, this.isRenderTarget = !0, this._initialSizeParameter = t, this._dontDisposeObjectRenderer = !!M, this._processSizeParameter(t), this._objectRenderer = M ?? new S(e, r, {
      numPasses: h ? 6 : this.getRenderLayers() || 1,
      doNotChangeAspectRatio: n,
      enableClusteredLights: C
    }), this._onBeforeRenderingManagerRenderObserver = this._objectRenderer.onBeforeRenderingManagerRenderObservable.add(() => {
      const f = this._scene;
      if (!this._disableEngineStages)
        for (const x of f._beforeRenderTargetClearStage)
          x.action(this, this._currentFaceIndex, this._currentLayer);
      if (this.onClearObservable.hasObservers() ? this.onClearObservable.notifyObservers(L) : this.skipInitialClear || L.clear(this.clearColor ?? f.clearColor, !0, !0, !0), this._doNotChangeAspectRatio || f.updateTransformMatrix(!0), !this._disableEngineStages)
        for (const x of f._beforeRenderTargetDrawStage)
          x.action(this, this._currentFaceIndex, this._currentLayer);
      L._debugPushGroup && L._debugPushGroup(`Render to ${this.name} (face #${this._currentFaceIndex} layer #${this._currentLayer})`);
    }), this._onAfterRenderingManagerRenderObserver = this._objectRenderer.onAfterRenderingManagerRenderObservable.add(() => {
      var x;
      if (L._debugPopGroup && L._debugPopGroup(), !this._disableEngineStages)
        for (const B of this._scene._afterRenderTargetDrawStage)
          B.action(this, this._currentFaceIndex, this._currentLayer);
      const f = ((x = this._texture) == null ? void 0 : x.generateMipMaps) ?? !1;
      if (this._texture && (this._texture.generateMipMaps = !1), this._postProcessManager ? this._postProcessManager._finalizeFrame(!1, this._renderTarget ?? void 0, this._currentFaceIndex, this._postProcesses, this.ignoreCameraViewport) : this._currentUseCameraPostProcess && this._scene.postProcessManager._finalizeFrame(!1, this._renderTarget ?? void 0, this._currentFaceIndex), !this._disableEngineStages)
        for (const B of this._scene._afterRenderTargetPostProcessStage)
          B.action(this, this._currentFaceIndex, this._currentLayer);
      this._texture && (this._texture.generateMipMaps = f), this._doNotChangeAspectRatio || this._scene.updateTransformMatrix(!0), this._currentDumpForDebug && (this._dumpTools ? this._dumpTools.DumpFramebuffer(this.getRenderWidth(), this.getRenderHeight(), L) : I.Error("dumpTools module is still being loaded. To speed up the process import dump tools directly in your project"));
    }), this._onFastPathRenderObserver = this._objectRenderer.onFastPathRenderObservable.add(() => {
      this.onClearObservable.hasObservers() ? this.onClearObservable.notifyObservers(L) : this.skipInitialClear || L.clear(this.clearColor || this._scene.clearColor, !0, !0, !0);
    }), this._resizeObserver = L.onResizeObservable.add(() => {
    }), this._generateMipMaps = !!s, this._doNotChangeAspectRatio = n, !u && (this._renderTargetOptions = {
      generateMipMaps: s,
      type: a,
      format: this._format ?? void 0,
      samplingMode: this.samplingMode,
      generateDepthBuffer: g,
      generateStencilBuffer: d,
      samples: l,
      creationFlags: p,
      noColorAttachment: i,
      useSRGBBuffer: o,
      colorAttachment: P,
      label: this.name
    }, this.samplingMode === E.NEAREST_SAMPLINGMODE && (this.wrapU = E.CLAMP_ADDRESSMODE, this.wrapV = E.CLAMP_ADDRESSMODE), _ || (h ? (this._renderTarget = r.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions), this.coordinatesMode = E.INVCUBIC_MODE, this._textureMatrix = W.Identity()) : this._renderTarget = r.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions), this._texture = this._renderTarget.texture, l !== void 0 && (this.samples = l)));
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
  createDepthStencilTexture(e = 0, t = !0, r = !1, s = 1, n = 14, a) {
    var h;
    (h = this._renderTarget) == null || h.createDepthStencilTexture(e, t, r, s, n, a);
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
      this._postProcessManager = new V(t), this._postProcesses = new Array();
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
    this._dumpToolsLoading || (this._dumpToolsLoading = !0, import("./dumpTools-3cc63b86.js").then((t) => this._dumpTools = t)), this._objectRenderer.prepareRenderList(), this.onBeforeBindObservable.notifyObservers(this), this._objectRenderer.initRender(this.getRenderWidth(), this.getRenderHeight());
    const e = this._objectRenderer._checkReadiness();
    return this.onAfterUnbindObservable.notifyObservers(this), this._objectRenderer.finishRender(), e;
  }
  _render(e = !1, t = !1) {
    const r = this.getScene();
    if (!r)
      return;
    this.useCameraPostProcesses !== void 0 && (e = this.useCameraPostProcesses);
    const s = r.getEngine();
    if (s._debugPushGroup && s._debugPushGroup(`Render to ${this.name}`), this._objectRenderer.prepareRenderList(), this.onBeforeBindObservable.notifyObservers(this), this._objectRenderer.initRender(this.getRenderWidth(), this.getRenderHeight()), (this.is2DArray || this.is3D) && !this.isMulti)
      for (let n = 0; n < this.getRenderLayers(); n++)
        this._renderToTarget(0, e, t, n), r.incrementRenderId(), r.resetCachedMaterial();
    else if (this.isCube && !this.isMulti)
      for (let n = 0; n < 6; n++)
        this._renderToTarget(n, e, t), r.incrementRenderId(), r.resetCachedMaterial();
    else
      this._renderToTarget(0, e, t);
    this.onAfterUnbindObservable.notifyObservers(this), this._objectRenderer.finishRender(), s._debugPopGroup && s._debugPopGroup();
  }
  _bestReflectionRenderTargetDimension(e, t) {
    const s = e * t, n = G(s + 128 * 128 / (128 + s));
    return Math.min(H(e), n);
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
    this._postProcessManager ? this._prePassEnabled || this._postProcessManager._prepareFrame(this._texture, this._postProcesses) || this._bindFrameBuffer(t, r) : (!s || !e.postProcessManager._prepareFrame(this._texture)) && this._bindFrameBuffer(t, r);
  }
  _renderToTarget(e, t, r, s = 0) {
    const n = this.getScene();
    if (!n)
      return;
    const a = n.getEngine();
    this._currentFaceIndex = e, this._currentLayer = s, this._currentUseCameraPostProcess = t, this._currentDumpForDebug = r, this._prepareFrame(n, e, s, t), this._objectRenderer.render(e + s, !0), this._unbindFrameBuffer(a, e), this._texture && this.isCube && e === 5 && a.generateMipMapsForCubemap(this._texture, !0);
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
    const e = this.getSize(), t = new T(this.name, e, this.getScene(), this._renderTargetOptions.generateMipMaps, this._doNotChangeAspectRatio, this._renderTargetOptions.type, this.isCube, this._renderTargetOptions.samplingMode, this._renderTargetOptions.generateDepthBuffer, this._renderTargetOptions.generateStencilBuffer, void 0, this._renderTargetOptions.format, void 0, this._renderTargetOptions.samples);
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
T.REFRESHRATE_RENDER_ONCE = S.REFRESHRATE_RENDER_ONCE;
T.REFRESHRATE_RENDER_ONEVERYFRAME = S.REFRESHRATE_RENDER_ONEVERYFRAME;
T.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = S.REFRESHRATE_RENDER_ONEVERYTWOFRAMES;
let w = !1;
function se() {
  w || (w = !0, $(), K.prototype.setDepthStencilTexture = function(O, e) {
    this._engine.setDepthStencilTexture(this._samplers[O], this._uniforms[O], e, O);
  }, E._CreateRenderTargetTexture = (O, e, t, r, s) => new T(O, e, t, r));
}
Object.getOwnPropertyDescriptor(T.prototype, "noPrePassRenderer") || Object.defineProperty(T.prototype, "noPrePassRenderer", Y("RenderTargetTexture", "noPrePassRenderer"));
class m extends Q {
  _gatherImports(e, t) {
    e ? (this._webGPUReady = !0, t.push(Promise.all([import("./kernelBlur.fragment-ab6bbc9e.js"), import("./kernelBlur.vertex-e6bc69e5.js")]))) : t.push(Promise.all([import("./kernelBlur.fragment-103a3ea4.js"), import("./kernelBlur.vertex-4f0f3e17.js")]));
  }
  /**
   * Constructs a new blur post process
   * @param name Name of the effect
   * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
   * @param direction Direction in which to apply the blur
   * @param kernel Kernel size of the blur
   * @param options Options to configure the effect
   */
  constructor(e, t = null, r, s, n) {
    const a = !!(n != null && n.blockCompilation);
    super({
      ...n,
      name: e,
      engine: t || q.LastCreatedEngine,
      useShaderStore: !0,
      useAsPostProcess: !0,
      fragmentShader: m.FragmentUrl,
      uniforms: m.Uniforms,
      samplers: m.Samplers,
      vertexUrl: m.VertexUrl,
      blockCompilation: !0
    }), this._packedFloat = !1, this._staticDefines = "", this.textureWidth = 0, this.textureHeight = 0, this._staticDefines = n ? Array.isArray(n.defines) ? n.defines.join(`
`) : n.defines || "" : "", this.options.blockCompilation = a, r !== void 0 && (this.direction = r), s !== void 0 && (this.kernel = s);
  }
  /**
   * Sets the length in pixels of the blur sample region
   */
  set kernel(e) {
    this._idealKernel !== e && (e = Math.max(e, 1), this._idealKernel = e, this._kernel = this._nearestBestKernel(e), this.options.blockCompilation || this._updateParameters());
  }
  /**
   * Gets the length in pixels of the blur sample region
   */
  get kernel() {
    return this._idealKernel;
  }
  /**
   * Sets whether or not the blur needs to unpack/repack floats
   */
  set packedFloat(e) {
    this._packedFloat !== e && (this._packedFloat = e, this.options.blockCompilation || this._updateParameters());
  }
  /**
   * Gets whether or not the blur is unpacking/repacking floats
   */
  get packedFloat() {
    return this._packedFloat;
  }
  bind(e = !1) {
    super.bind(e), this._drawWrapper.effect.setFloat2("delta", 1 / this.textureWidth * this.direction.x, 1 / this.textureHeight * this.direction.y);
  }
  /** @internal */
  _updateParameters(e, t) {
    const r = this._kernel, s = (r - 1) / 2;
    let n = [], a = [], h = 0;
    for (let i = 0; i < r; i++) {
      const o = i / (r - 1), P = this._gaussianWeight(o * 2 - 1);
      n[i] = i - s, a[i] = P, h += P;
    }
    for (let i = 0; i < a.length; i++)
      a[i] /= h;
    const c = [], g = [], d = [];
    for (let i = 0; i <= s; i += 2) {
      const o = Math.min(i + 1, Math.floor(s));
      if (i === o)
        d.push({ o: n[i], w: a[i] });
      else {
        const b = o === s, M = a[i] + a[o] * (b ? 0.5 : 1), C = n[i] + 1 / (1 + a[i] / a[o]);
        C === 0 ? (d.push({ o: n[i], w: a[i] }), d.push({ o: n[i + 1], w: a[i + 1] })) : (d.push({ o: C, w: M }), d.push({ o: -C, w: M }));
      }
    }
    for (let i = 0; i < d.length; i++)
      g[i] = d[i].o, c[i] = d[i].w;
    n = g, a = c;
    const u = this.options.engine.getCaps().maxVaryingVectors - (this.options.shaderLanguage === 1 ? 1 : 0), R = Math.max(u, 0) - 1;
    let _ = Math.min(n.length, R), l = "";
    l += this._staticDefines, this._staticDefines.indexOf("DOF") != -1 && (l += `#define CENTER_WEIGHT ${this._glslFloat(a[_ - 1])}
`, _--);
    for (let i = 0; i < _; i++)
      l += `#define KERNEL_OFFSET${i} ${this._glslFloat(n[i])}
`, l += `#define KERNEL_WEIGHT${i} ${this._glslFloat(a[i])}
`;
    let p = 0;
    for (let i = R; i < n.length; i++)
      l += `#define KERNEL_DEP_OFFSET${p} ${this._glslFloat(n[i])}
`, l += `#define KERNEL_DEP_WEIGHT${p} ${this._glslFloat(a[i])}
`, p++;
    this.packedFloat && (l += "#define PACKEDFLOAT 1"), this.options.blockCompilation = !1, this.updateEffect(l, null, null, {
      varyingCount: _,
      depCount: p
    }, e, t);
  }
  /**
   * Best kernels are odd numbers that when divided by 2, their integer part is even, so 5, 9 or 13.
   * Other odd kernels optimize correctly but require proportionally more samples, even kernels are
   * possible but will produce minor visual artifacts. Since each new kernel requires a new shader we
   * want to minimize kernel changes, having gaps between physical kernels is helpful in that regard.
   * The gaps between physical kernels are compensated for in the weighting of the samples
   * @param idealKernel Ideal blur kernel.
   * @returns Nearest best kernel.
   */
  _nearestBestKernel(e) {
    const t = Math.round(e);
    for (const r of [t, t - 1, t + 1, t - 2, t + 2])
      if (r % 2 !== 0 && Math.floor(r / 2) % 2 === 0 && r > 0)
        return Math.max(r, 3);
    return Math.max(t, 3);
  }
  /**
   * Calculates the value of a Gaussian distribution with sigma 3 at a given point.
   * @param x The point on the Gaussian distribution to sample.
   * @returns the value of the Gaussian function at x.
   */
  _gaussianWeight(e) {
    const t = 0.3333333333333333, r = Math.sqrt(2 * Math.PI) * t, s = -(e * e / (2 * t * t));
    return 1 / r * Math.exp(s);
  }
  /**
   * Generates a string that can be used as a floating point number in GLSL.
   * @param x Value to print.
   * @param decimalFigures Number of decimal places to print the number to (excluding trailing 0s).
   * @returns GLSL float string.
   */
  _glslFloat(e, t = 8) {
    return e.toFixed(t).replace(/0+$/, "");
  }
}
m.VertexUrl = "kernelBlur";
m.FragmentUrl = "kernelBlur";
m.Uniforms = ["delta", "direction"];
m.Samplers = ["circleOfConfusionSampler"];
let ie = (() => {
  var O;
  let e = ee, t = [], r, s, n;
  return O = class extends e {
    /** The direction in which to blur the image. */
    get direction() {
      return this._effectWrapper.direction;
    }
    set direction(h) {
      this._effectWrapper.direction = h;
    }
    /**
     * Sets the length in pixels of the blur sample region
     */
    set kernel(h) {
      this._effectWrapper.kernel = h;
    }
    /**
     * Gets the length in pixels of the blur sample region
     */
    get kernel() {
      return this._effectWrapper.kernel;
    }
    /**
     * Sets whether or not the blur needs to unpack/repack floats
     */
    set packedFloat(h) {
      this._effectWrapper.packedFloat = h;
    }
    /**
     * Gets whether or not the blur is unpacking/repacking floats
     */
    get packedFloat() {
      return this._effectWrapper.packedFloat;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "BlurPostProcess" string
     */
    getClassName() {
      return "BlurPostProcess";
    }
    /**
     * Creates a new instance BlurPostProcess
     * @param name The name of the effect.
     * @param direction The direction in which to blur the image.
     * @param kernel The size of the kernel to be used when computing the blur. eg. Size of 3 will blur the center pixel by 2 pixels surrounding it.
     * @param options The required width/height ratio to downsize to before computing the render pass. (Use 1.0 for full size)
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param defines
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
     * @param textureFormat Format of textures used when performing the post process. (default: TEXTUREFORMAT_RGBA)
     */
    constructor(h, c, g, d, u = null, R = E.BILINEAR_SAMPLINGMODE, _, l, p = 0, i = "", o = !1, P = 5) {
      const b = typeof d == "number" ? o : !!d.blockCompilation, M = {
        uniforms: m.Uniforms,
        samplers: m.Samplers,
        size: typeof d == "number" ? d : void 0,
        camera: u,
        samplingMode: R,
        engine: _,
        reusable: l,
        textureType: p,
        vertexUrl: m.VertexUrl,
        indexParameters: { varyingCount: 0, depCount: 0 },
        textureFormat: P,
        defines: i,
        ...d,
        blockCompilation: !0
      };
      super(h, m.FragmentUrl, {
        effectWrapper: typeof d == "number" || !d.effectWrapper ? new m(h, _, void 0, void 0, M) : void 0,
        ...M
      }), J(this, t), this._effectWrapper.options.blockCompilation = b, this.direction = c, this.onApplyObservable.add(() => {
        this._effectWrapper.textureWidth = this._outputTexture ? this._outputTexture.width : this.width, this._effectWrapper.textureHeight = this._outputTexture ? this._outputTexture.height : this.height;
      }), this.kernel = g;
    }
    /**
     * Updates the effect with the current post process compile time values and recompiles the shader
     * @param _defines the post process defines
     * @param _uniforms the post process uniforms
     * @param _samplers the post process samplers
     * @param _indexParameters the index parameters
     * @param onCompiled callback called when the shader is compiled
     * @param onError callback called if there is an error
     */
    updateEffect(h = null, c = null, g = null, d, u, R) {
      this._effectWrapper._updateParameters(u, R);
    }
    /**
     * @internal
     */
    static _Parse(h, c, g, d) {
      return X.Parse(() => new O(h.name, h.direction, h.kernel, h.options, c, h.renderTargetSamplingMode, g.getEngine(), h.reusable, h.textureType, void 0, !1), h, g, d);
    }
  }, (() => {
    const a = typeof Symbol == "function" && Symbol.metadata ? Object.create(e[Symbol.metadata] ?? null) : void 0;
    r = [Z()], s = [F()], n = [F()], A(O, null, r, { kind: "getter", name: "direction", static: !1, private: !1, access: { has: (h) => "direction" in h, get: (h) => h.direction }, metadata: a }, null, t), A(O, null, s, { kind: "setter", name: "kernel", static: !1, private: !1, access: { has: (h) => "kernel" in h, set: (h, c) => {
      h.kernel = c;
    } }, metadata: a }, null, t), A(O, null, n, { kind: "setter", name: "packedFloat", static: !1, private: !1, access: { has: (h) => "packedFloat" in h, set: (h, c) => {
      h.packedFloat = c;
    } }, metadata: a }, null, t), a && Object.defineProperty(O, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: a });
  })(), O;
})();
export {
  ie as B,
  S as O,
  se as R,
  m as T,
  T as a
};
