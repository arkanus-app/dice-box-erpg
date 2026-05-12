import { j as h, s as o, a3 as z, a$ as W, O as U, E as Y, M as x, p as b, _ as v, b0 as G, V as O, T as S, b1 as k, b2 as j, b3 as q, G as H, R as Z } from "./Dice-f63fdd4d.js";
let P = !1;
class m {
  /**
   * Creates a Size object from the given width and height (floats).
   * @param width width of the new size
   * @param height height of the new size
   */
  constructor(e, t) {
    this.width = e, this.height = t;
  }
  /**
   * Returns a string with the Size width and height
   * @returns a string with the Size width and height
   */
  toString() {
    return `{W: ${this.width}, H: ${this.height}}`;
  }
  /**
   * "Size"
   * @returns the string "Size"
   */
  getClassName() {
    return "Size";
  }
  /**
   * Returns the Size hash code.
   * @returns a hash code for a unique width and height
   */
  getHashCode() {
    let e = this.width | 0;
    return e = e * 397 ^ (this.height | 0), e;
  }
  /**
   * Updates the current size from the given one.
   * @param src the given size
   */
  copyFrom(e) {
    this.width = e.width, this.height = e.height;
  }
  /**
   * Updates in place the current Size from the given floats.
   * @param width width of the new size
   * @param height height of the new size
   * @returns the updated Size.
   */
  copyFromFloats(e, t) {
    return this.width = e, this.height = t, this;
  }
  /**
   * Updates in place the current Size from the given floats.
   * @param width width to set
   * @param height height to set
   * @returns the updated Size.
   */
  set(e, t) {
    return this.copyFromFloats(e, t);
  }
  /**
   * Multiplies the width and height by numbers
   * @param w factor to multiple the width by
   * @param h factor to multiple the height by
   * @returns a new Size set with the multiplication result of the current Size and the given floats.
   */
  multiplyByFloats(e, t) {
    return new m(this.width * e, this.height * t);
  }
  /**
   * Clones the size
   * @returns a new Size copied from the given one.
   */
  clone() {
    return new m(this.width, this.height);
  }
  /**
   * True if the current Size and the given one width and height are strictly equal.
   * @param other the other size to compare against
   * @returns True if the current Size and the given one width and height are strictly equal.
   */
  equals(e) {
    return e ? this.width === e.width && this.height === e.height : !1;
  }
  /**
   * The surface of the Size : width * height (float).
   */
  get surface() {
    return this.width * this.height;
  }
  /**
   * Create a new size of zero
   * @returns a new Size set to (0.0, 0.0)
   */
  static Zero() {
    return new m(0, 0);
  }
  /**
   * Sums the width and height of two sizes
   * @param otherSize size to add to this size
   * @returns a new Size set as the addition result of the current Size and the given one.
   */
  add(e) {
    return new m(this.width + e.width, this.height + e.height);
  }
  /**
   * Subtracts the width and height of two
   * @param otherSize size to subtract to this size
   * @returns a new Size set as the subtraction result of  the given one from the current Size.
   */
  subtract(e) {
    return new m(this.width - e.width, this.height - e.height);
  }
  /**
   * Scales the width and height
   * @param scale the scale to multiply the width and height by
   * @returns a new Size set with the multiplication result of the current Size and the given floats.
   */
  scale(e) {
    return new m(this.width * e, this.height * e);
  }
  /**
   * Creates a new Size set at the linear interpolation "amount" between "start" and "end"
   * @param start starting size to lerp between
   * @param end end size to lerp between
   * @param amount amount to lerp between the start and end values
   * @returns a new Size set at the linear interpolation "amount" between "start" and "end"
   */
  static Lerp(e, t, i) {
    const n = e.width + (t.width - e.width) * i, l = e.height + (t.height - e.height) * i;
    return new m(n, l);
  }
}
class N {
  /**
   * | Value | Type               | Description |
   * | ----- | ------------------ | ----------- |
   * | 0     | CLAMP_ADDRESSMODE  |             |
   * | 1     | WRAP_ADDRESSMODE   |             |
   * | 2     | MIRROR_ADDRESSMODE |             |
   */
  get wrapU() {
    return this._wrapU;
  }
  set wrapU(e) {
    this._wrapU = e;
  }
  /**
   * | Value | Type               | Description |
   * | ----- | ------------------ | ----------- |
   * | 0     | CLAMP_ADDRESSMODE  |             |
   * | 1     | WRAP_ADDRESSMODE   |             |
   * | 2     | MIRROR_ADDRESSMODE |             |
   */
  get wrapV() {
    return this._wrapV;
  }
  set wrapV(e) {
    this._wrapV = e;
  }
  /**
   * How a texture is mapped.
   * Unused in thin texture mode.
   */
  get coordinatesMode() {
    return 0;
  }
  /**
   * Define if the texture is a cube texture or if false a 2d texture.
   */
  get isCube() {
    return this._texture ? this._texture.isCube : !1;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set isCube(e) {
    this._texture && (this._texture.isCube = e);
  }
  /**
   * Define if the texture is a 3d texture (webgl 2) or if false a 2d texture.
   */
  get is3D() {
    return this._texture ? this._texture.is3D : !1;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set is3D(e) {
    this._texture && (this._texture.is3D = e);
  }
  /**
   * Define if the texture is a 2d array texture (webgl 2) or if false a 2d texture.
   */
  get is2DArray() {
    return this._texture ? this._texture.is2DArray : !1;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set is2DArray(e) {
    this._texture && (this._texture.is2DArray = e);
  }
  /**
   * Get the class name of the texture.
   * @returns "ThinTexture"
   */
  getClassName() {
    return "ThinTexture";
  }
  static _IsRenderTargetWrapper(e) {
    return (e == null ? void 0 : e.shareDepth) !== void 0;
  }
  /**
   * Instantiates a new ThinTexture.
   * Base class of all the textures in babylon.
   * This can be used as an internal texture wrapper in AbstractEngine to benefit from the cache
   * @param internalTexture Define the internalTexture to wrap. You can also pass a RenderTargetWrapper, in which case the texture will be the render target's texture
   */
  constructor(e) {
    this._wrapU = 1, this._wrapV = 1, this.wrapR = 1, this.anisotropicFilteringLevel = 4, this.delayLoadState = 0, this._texture = null, this._engine = null, this._cachedSize = m.Zero(), this._cachedBaseSize = m.Zero(), this._initialSamplingMode = 2, this._texture = N._IsRenderTargetWrapper(e) ? e.texture : e, this._texture && (this._engine = this._texture.getEngine());
  }
  /**
   * Get if the texture is ready to be used (downloaded, converted, mip mapped...).
   * @returns true if fully ready
   */
  isReady() {
    return this.delayLoadState === 4 ? (this.delayLoad(), !1) : this._texture ? this._texture.isReady : !1;
  }
  /**
   * Triggers the load sequence in delayed load mode.
   */
  delayLoad() {
  }
  /**
   * Get the underlying lower level texture from Babylon.
   * @returns the internal texture
   */
  getInternalTexture() {
    return this._texture;
  }
  /**
   * Get the size of the texture.
   * @returns the texture size.
   */
  getSize() {
    if (this._texture) {
      if (this._texture.width)
        return this._cachedSize.width = this._texture.width, this._cachedSize.height = this._texture.height, this._cachedSize;
      if (this._texture._size)
        return this._cachedSize.width = this._texture._size, this._cachedSize.height = this._texture._size, this._cachedSize;
    }
    return this._cachedSize;
  }
  /**
   * Get the base size of the texture.
   * It can be different from the size if the texture has been resized for POT for instance
   * @returns the base size
   */
  getBaseSize() {
    return !this.isReady() || !this._texture ? (this._cachedBaseSize.width = 0, this._cachedBaseSize.height = 0, this._cachedBaseSize) : this._texture._size ? (this._cachedBaseSize.width = this._texture._size, this._cachedBaseSize.height = this._texture._size, this._cachedBaseSize) : (this._cachedBaseSize.width = this._texture.baseWidth, this._cachedBaseSize.height = this._texture.baseHeight, this._cachedBaseSize);
  }
  /**
   * Get the current sampling mode associated with the texture.
   */
  get samplingMode() {
    return this._texture ? this._texture.samplingMode : this._initialSamplingMode;
  }
  /**
   * Update the sampling mode of the texture.
   * Default is Trilinear mode.
   *
   * | Value | Type               | Description |
   * | ----- | ------------------ | ----------- |
   * | 1     | NEAREST_SAMPLINGMODE or NEAREST_NEAREST_MIPLINEAR  | Nearest is: mag = nearest, min = nearest, mip = linear |
   * | 2     | BILINEAR_SAMPLINGMODE or LINEAR_LINEAR_MIPNEAREST | Bilinear is: mag = linear, min = linear, mip = nearest |
   * | 3     | TRILINEAR_SAMPLINGMODE or LINEAR_LINEAR_MIPLINEAR | Trilinear is: mag = linear, min = linear, mip = linear |
   * | 4     | NEAREST_NEAREST_MIPNEAREST |             |
   * | 5    | NEAREST_LINEAR_MIPNEAREST |             |
   * | 6    | NEAREST_LINEAR_MIPLINEAR |             |
   * | 7    | NEAREST_LINEAR |             |
   * | 8    | NEAREST_NEAREST |             |
   * | 9   | LINEAR_NEAREST_MIPNEAREST |             |
   * | 10   | LINEAR_NEAREST_MIPLINEAR |             |
   * | 11   | LINEAR_LINEAR |             |
   * | 12   | LINEAR_NEAREST |             |
   *
   *    > _mag_: magnification filter (close to the viewer)
   *    > _min_: minification filter (far from the viewer)
   *    > _mip_: filter used between mip map levels
   *@param samplingMode Define the new sampling mode of the texture
   */
  updateSamplingMode(e) {
    this._texture && this._engine && this._engine.updateTextureSamplingMode(e, this._texture);
  }
  /**
   * Release and destroy the underlying lower level texture aka internalTexture.
   */
  releaseInternalTexture() {
    this._texture && (this._texture.dispose(), this._texture = null);
  }
  /**
   * Dispose the texture and release its associated resources.
   */
  dispose() {
    this._texture && (this.releaseInternalTexture(), this._engine = null);
  }
}
class d extends N {
  /**
   * Define if the texture is having a usable alpha value (can be use for transparency or glossiness for instance).
   */
  set hasAlpha(e) {
    this._hasAlpha !== e && (this._hasAlpha = e, this._scene && this._scene.markAllMaterialsAsDirty(1, (t) => t.hasTexture(this)));
  }
  get hasAlpha() {
    return this._hasAlpha;
  }
  /**
   * Defines if the alpha value should be determined via the rgb values.
   * If true the luminance of the pixel might be used to find the corresponding alpha value.
   */
  set getAlphaFromRGB(e) {
    this._getAlphaFromRGB !== e && (this._getAlphaFromRGB = e, this._scene && this._scene.markAllMaterialsAsDirty(1, (t) => t.hasTexture(this)));
  }
  get getAlphaFromRGB() {
    return this._getAlphaFromRGB;
  }
  /**
   * Define the UV channel to use starting from 0 and defaulting to 0.
   * This is part of the texture as textures usually maps to one uv set.
   */
  set coordinatesIndex(e) {
    this._coordinatesIndex !== e && (this._coordinatesIndex = e, this._scene && this._scene.markAllMaterialsAsDirty(1, (t) => t.hasTexture(this)));
  }
  get coordinatesIndex() {
    return this._coordinatesIndex;
  }
  /**
   * How a texture is mapped.
   *
   * | Value | Type                                | Description |
   * | ----- | ----------------------------------- | ----------- |
   * | 0     | EXPLICIT_MODE                       |             |
   * | 1     | SPHERICAL_MODE                      |             |
   * | 2     | PLANAR_MODE                         |             |
   * | 3     | CUBIC_MODE                          |             |
   * | 4     | PROJECTION_MODE                     |             |
   * | 5     | SKYBOX_MODE                         |             |
   * | 6     | INVCUBIC_MODE                       |             |
   * | 7     | EQUIRECTANGULAR_MODE                |             |
   * | 8     | FIXED_EQUIRECTANGULAR_MODE          |             |
   * | 9     | FIXED_EQUIRECTANGULAR_MIRRORED_MODE |             |
   */
  set coordinatesMode(e) {
    this._coordinatesMode !== e && (this._coordinatesMode = e, this._scene && this._scene.markAllMaterialsAsDirty(1, (t) => t.hasTexture(this)));
  }
  get coordinatesMode() {
    return this._coordinatesMode;
  }
  /**
   * | Value | Type               | Description |
   * | ----- | ------------------ | ----------- |
   * | 0     | CLAMP_ADDRESSMODE  |             |
   * | 1     | WRAP_ADDRESSMODE   |             |
   * | 2     | MIRROR_ADDRESSMODE |             |
   */
  get wrapU() {
    return this._wrapU;
  }
  set wrapU(e) {
    this._wrapU = e;
  }
  /**
   * | Value | Type               | Description |
   * | ----- | ------------------ | ----------- |
   * | 0     | CLAMP_ADDRESSMODE  |             |
   * | 1     | WRAP_ADDRESSMODE   |             |
   * | 2     | MIRROR_ADDRESSMODE |             |
   */
  get wrapV() {
    return this._wrapV;
  }
  set wrapV(e) {
    this._wrapV = e;
  }
  /**
   * Define if the texture is a cube texture or if false a 2d texture.
   */
  get isCube() {
    return this._texture ? this._texture.isCube : this._isCube;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set isCube(e) {
    this._texture ? this._texture.isCube = e : this._isCube = e;
  }
  /**
   * Define if the texture is a 3d texture (webgl 2) or if false a 2d texture.
   */
  get is3D() {
    return this._texture ? this._texture.is3D : !1;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set is3D(e) {
    this._texture && (this._texture.is3D = e);
  }
  /**
   * Define if the texture is a 2d array texture (webgl 2) or if false a 2d texture.
   */
  get is2DArray() {
    return this._texture ? this._texture.is2DArray : !1;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set is2DArray(e) {
    this._texture && (this._texture.is2DArray = e);
  }
  /**
   * Define if the texture contains data in gamma space (most of the png/jpg aside bump).
   * HDR texture are usually stored in linear space.
   * This only impacts the PBR and Background materials
   */
  get gammaSpace() {
    if (this._texture)
      this._texture._gammaSpace === null && (this._texture._gammaSpace = this._gammaSpace);
    else
      return this._gammaSpace;
    return this._texture._gammaSpace && !this._texture._useSRGBBuffer;
  }
  set gammaSpace(e) {
    var t;
    if (this._texture) {
      if (this._texture._gammaSpace === e)
        return;
      this._texture._gammaSpace = e;
    } else {
      if (this._gammaSpace === e)
        return;
      this._gammaSpace = e;
    }
    (t = this.getScene()) == null || t.markAllMaterialsAsDirty(1, (i) => i.hasTexture(this));
  }
  /**
   * Gets or sets whether or not the texture contains RGBD data.
   */
  get isRGBD() {
    return this._texture != null && this._texture._isRGBD;
  }
  set isRGBD(e) {
    var t;
    e !== this.isRGBD && (this._texture && (this._texture._isRGBD = e), (t = this.getScene()) == null || t.markAllMaterialsAsDirty(1, (i) => i.hasTexture(this)));
  }
  /**
   * Are mip maps generated for this texture or not.
   */
  get noMipmap() {
    return !1;
  }
  /**
   * With prefiltered texture, defined the offset used during the prefiltering steps.
   */
  get lodGenerationOffset() {
    return this._texture ? this._texture._lodGenerationOffset : 0;
  }
  set lodGenerationOffset(e) {
    this._texture && (this._texture._lodGenerationOffset = e);
  }
  /**
   * With prefiltered texture, defined the scale used during the prefiltering steps.
   */
  get lodGenerationScale() {
    return this._texture ? this._texture._lodGenerationScale : 0;
  }
  set lodGenerationScale(e) {
    this._texture && (this._texture._lodGenerationScale = e);
  }
  /**
   * With prefiltered texture, defined if the specular generation is based on a linear ramp.
   * By default we are using a log2 of the linear roughness helping to keep a better resolution for
   * average roughness values.
   */
  get linearSpecularLOD() {
    return this._texture ? this._texture._linearSpecularLOD : !1;
  }
  set linearSpecularLOD(e) {
    this._texture && (this._texture._linearSpecularLOD = e);
  }
  /**
   * In case a better definition than spherical harmonics is required for the diffuse part of the environment.
   * You can set the irradiance texture to rely on a texture instead of the spherical approach.
   * This texture need to have the same characteristics than its parent (Cube vs 2d, coordinates mode, Gamma/Linear, RGBD).
   */
  get irradianceTexture() {
    return this._texture ? this._texture._irradianceTexture : null;
  }
  set irradianceTexture(e) {
    this._texture && (this._texture._irradianceTexture = e);
  }
  /**
   * Define the unique id of the texture in the scene.
   */
  get uid() {
    return this._uid || (this._uid = W()), this._uid;
  }
  /**
   * Return a string representation of the texture.
   * @returns the texture as a string
   */
  toString() {
    return this.name;
  }
  /**
   * Get the class name of the texture.
   * @returns "BaseTexture"
   */
  getClassName() {
    return "BaseTexture";
  }
  /**
   * Callback triggered when the texture has been disposed.
   * Kept for back compatibility, you can use the onDisposeObservable instead.
   */
  set onDispose(e) {
    this._onDisposeObserver && this.onDisposeObservable.remove(this._onDisposeObserver), this._onDisposeObserver = this.onDisposeObservable.add(e);
  }
  /**
   * Define if the texture is preventing a material to render or not.
   * If not and the texture is not ready, the engine will use a default black texture instead.
   */
  get isBlocking() {
    return !0;
  }
  /**
   * Was there any loading error?
   */
  get loadingError() {
    return this._loadingError;
  }
  /**
   * If a loading error occurred this object will be populated with information about the error.
   */
  get errorObject() {
    return this._errorObject;
  }
  /**
   * Instantiates a new BaseTexture.
   * Base class of all the textures in babylon.
   * It groups all the common properties the materials, post process, lights... might need
   * in order to make a correct use of the texture.
   * @param sceneOrEngine Define the scene or engine the texture belongs to
   * @param internalTexture Define the internal texture associated with the texture
   */
  constructor(e, t = null) {
    super(null), this.metadata = null, this.reservedDataStore = null, this._hasAlpha = !1, this._getAlphaFromRGB = !1, this.level = 1, this._coordinatesIndex = 0, this.optimizeUVAllocation = !0, this._coordinatesMode = 0, this.wrapR = 1, this.anisotropicFilteringLevel = d.DEFAULT_ANISOTROPIC_FILTERING_LEVEL, this._isCube = !1, this._gammaSpace = !0, this.invertZ = !1, this.lodLevelInAlpha = !1, this.isRenderTarget = !1, this._prefiltered = !1, this._forceSerialize = !1, this.animations = [], this.onDisposeObservable = new U(), this._onDisposeObserver = null, this._scene = null, this._uid = null, this._parentContainer = null, this._loadingError = !1, e ? d._IsScene(e) ? this._scene = e : this._engine = e : this._scene = Y.LastCreatedScene, this._scene && (this.uniqueId = this._scene.getUniqueId(), this._scene.addTexture(this), this._engine = this._scene.getEngine()), this._texture = t, this._uid = null;
  }
  /**
   * Get the scene the texture belongs to.
   * @returns the scene or null if undefined
   */
  getScene() {
    return this._scene;
  }
  /** @internal */
  _getEngine() {
    return this._engine;
  }
  /**
   * Get the texture transform matrix used to offset tile the texture for instance.
   * @returns the transformation matrix
   */
  getTextureMatrix() {
    return x.IdentityReadOnly;
  }
  /**
   * Get the texture reflection matrix used to rotate/transform the reflection.
   * @returns the reflection matrix
   */
  getReflectionTextureMatrix() {
    return x.IdentityReadOnly;
  }
  /**
   * Gets a suitable rotate/transform matrix when the texture is used for refraction.
   * There's a separate function from getReflectionTextureMatrix because refraction requires a special configuration of the matrix in right-handed mode.
   * @returns The refraction matrix
   */
  getRefractionTextureMatrix() {
    return this.getReflectionTextureMatrix();
  }
  /**
   * Get if the texture is ready to be consumed (either it is ready or it is not blocking)
   * @returns true if ready, not blocking or if there was an error loading the texture
   */
  isReadyOrNotBlocking() {
    return !this.isBlocking || this.isReady() || this.loadingError;
  }
  /**
   * Scales the texture if is `canRescale()`
   * @param ratio the resize factor we want to use to rescale
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scale(e) {
  }
  /**
   * Get if the texture can rescale.
   */
  get canRescale() {
    return !1;
  }
  /**
   * @internal
   */
  _getFromCache(e, t, i, n, l, _) {
    const f = this._getEngine();
    if (!f)
      return null;
    const a = f._getUseSRGBBuffer(!!l, t), r = f.getLoadedTexturesCache();
    for (let u = 0; u < r.length; u++) {
      const c = r[u];
      if ((l === void 0 || a === c._useSRGBBuffer) && (n === void 0 || n === c.invertY) && c.url === e && c.generateMipMaps === !t && (!i || i === c.samplingMode) && (_ === void 0 || _ === c.isCube))
        return c.incrementReferences(), c;
    }
    return null;
  }
  /** @internal */
  _rebuild(e = !1) {
  }
  /**
   * Clones the texture.
   * @returns the cloned texture
   */
  clone() {
    return null;
  }
  /**
   * Get the texture underlying type (INT, FLOAT...)
   */
  get textureType() {
    return this._texture && this._texture.type !== void 0 ? this._texture.type : 0;
  }
  /**
   * Get the texture underlying format (RGB, RGBA...)
   */
  get textureFormat() {
    return this._texture && this._texture.format !== void 0 ? this._texture.format : 5;
  }
  /**
   * Indicates that textures need to be re-calculated for all materials
   */
  _markAllSubMeshesAsTexturesDirty() {
    const e = this.getScene();
    e && e.markAllMaterialsAsDirty(1);
  }
  /**
   * Reads the pixels stored in the webgl texture and returns them as an ArrayBuffer.
   * This will returns an RGBA array buffer containing either in values (0-255) or
   * float values (0-1) depending of the underlying buffer type.
   * @param faceIndex defines the face of the texture to read (in case of cube texture)
   * @param level defines the LOD level of the texture to read (in case of Mip Maps)
   * @param buffer defines a user defined buffer to fill with data (can be null)
   * @param flushRenderer true to flush the renderer from the pending commands before reading the pixels
   * @param noDataConversion false to convert the data to Uint8Array (if texture type is UNSIGNED_BYTE) or to Float32Array (if texture type is anything but UNSIGNED_BYTE). If true, the type of the generated buffer (if buffer==null) will depend on the type of the texture
   * @param x defines the region x coordinates to start reading from (default to 0)
   * @param y defines the region y coordinates to start reading from (default to 0)
   * @param width defines the region width to read from (default to the texture size at level)
   * @param height defines the region width to read from (default to the texture size at level)
   * @returns The Array buffer promise containing the pixels data.
   */
  readPixels(e = 0, t = 0, i = null, n = !0, l = !1, _ = 0, f = 0, a = Number.MAX_VALUE, r = Number.MAX_VALUE) {
    if (!this._texture)
      return null;
    const u = this._getEngine();
    if (!u)
      return null;
    const c = this.getSize();
    let R = c.width, p = c.height;
    t !== 0 && (R = R / Math.pow(2, t), p = p / Math.pow(2, t), R = Math.round(R), p = Math.round(p)), a = Math.min(R, a), r = Math.min(p, r);
    try {
      return this._texture.isCube ? u._readTexturePixels(this._texture, a, r, e, t, i, n, l, _, f) : u._readTexturePixels(this._texture, a, r, -1, t, i, n, l, _, f);
    } catch {
      return null;
    }
  }
  /**
   * @internal
   */
  _readPixelsSync(e = 0, t = 0, i = null, n = !0, l = !1) {
    if (!this._texture)
      return null;
    const _ = this.getSize();
    let f = _.width, a = _.height;
    const r = this._getEngine();
    if (!r)
      return null;
    t != 0 && (f = f / Math.pow(2, t), a = a / Math.pow(2, t), f = Math.round(f), a = Math.round(a));
    try {
      return this._texture.isCube ? r._readTexturePixelsSync(this._texture, f, a, e, t, i, n, l) : r._readTexturePixelsSync(this._texture, f, a, -1, t, i, n, l);
    } catch {
      return null;
    }
  }
  /** @internal */
  get _lodTextureHigh() {
    return this._texture ? this._texture._lodTextureHigh : null;
  }
  /** @internal */
  get _lodTextureMid() {
    return this._texture ? this._texture._lodTextureMid : null;
  }
  /** @internal */
  get _lodTextureLow() {
    return this._texture ? this._texture._lodTextureLow : null;
  }
  /**
   * Dispose the texture and release its associated resources.
   */
  dispose() {
    if (this._scene) {
      this._scene.stopAnimation && this._scene.stopAnimation(this), this._scene.removePendingData(this);
      const e = this._scene.textures.indexOf(this);
      if (e >= 0 && this._scene.textures.splice(e, 1), this._scene.onTextureRemovedObservable.notifyObservers(this), this._scene = null, this._parentContainer) {
        const t = this._parentContainer.textures.indexOf(this);
        t > -1 && this._parentContainer.textures.splice(t, 1), this._parentContainer = null;
      }
    }
    this.onDisposeObservable.notifyObservers(this), this.onDisposeObservable.clear(), this.metadata = null, super.dispose();
  }
  /**
   * Serialize the texture into a JSON representation that can be parsed later on.
   * @param allowEmptyName True to force serialization even if name is empty. Default: false
   * @returns the JSON representation of the texture
   */
  serialize(e = !1) {
    if (!this.name && !e)
      return null;
    const t = b.Serialize(this);
    return b.AppendSerializedAnimations(this, t), t;
  }
  /**
   * Helper function to be called back once a list of texture contains only ready textures.
   * @param textures Define the list of textures to wait for
   * @param callback Define the callback triggered once the entire list will be ready
   */
  static WhenAllReady(e, t) {
    let i = e.length;
    if (i === 0) {
      t();
      return;
    }
    for (let n = 0; n < e.length; n++) {
      const l = e[n];
      if (l.isReady())
        --i === 0 && t();
      else {
        const _ = l.onLoadObservable;
        _ ? _.addOnce(() => {
          --i === 0 && t();
        }) : --i === 0 && t();
      }
    }
  }
  static _IsScene(e) {
    return e.getClassName() === "Scene";
  }
}
d.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = 4;
h([
  o()
], d.prototype, "uniqueId", void 0);
h([
  o()
], d.prototype, "name", void 0);
h([
  o()
], d.prototype, "displayName", void 0);
h([
  o()
], d.prototype, "metadata", void 0);
h([
  o("hasAlpha")
], d.prototype, "_hasAlpha", void 0);
h([
  o("getAlphaFromRGB")
], d.prototype, "_getAlphaFromRGB", void 0);
h([
  o()
], d.prototype, "level", void 0);
h([
  o("coordinatesIndex")
], d.prototype, "_coordinatesIndex", void 0);
h([
  o()
], d.prototype, "optimizeUVAllocation", void 0);
h([
  o("coordinatesMode")
], d.prototype, "_coordinatesMode", void 0);
h([
  o()
], d.prototype, "wrapU", null);
h([
  o()
], d.prototype, "wrapV", null);
h([
  o()
], d.prototype, "wrapR", void 0);
h([
  o()
], d.prototype, "anisotropicFilteringLevel", void 0);
h([
  o()
], d.prototype, "isCube", null);
h([
  o()
], d.prototype, "is3D", null);
h([
  o()
], d.prototype, "is2DArray", null);
h([
  o()
], d.prototype, "gammaSpace", null);
h([
  o()
], d.prototype, "invertZ", void 0);
h([
  o()
], d.prototype, "lodLevelInAlpha", void 0);
h([
  o()
], d.prototype, "lodGenerationOffset", null);
h([
  o()
], d.prototype, "lodGenerationScale", null);
h([
  o()
], d.prototype, "linearSpecularLOD", null);
h([
  z()
], d.prototype, "irradianceTexture", null);
h([
  o()
], d.prototype, "isRenderTarget", void 0);
function F(g, e, t = !1) {
  const i = e.width, n = e.height;
  if (g instanceof Float32Array) {
    let r = g.byteLength / g.BYTES_PER_ELEMENT;
    const u = new Uint8Array(r);
    for (; --r >= 0; ) {
      let c = g[r];
      c < 0 ? c = 0 : c > 1 && (c = 1), u[r] = c * 255;
    }
    g = u;
  }
  const l = document.createElement("canvas");
  l.width = i, l.height = n;
  const _ = l.getContext("2d");
  if (!_)
    return null;
  const f = _.createImageData(i, n);
  if (f.data.set(g), _.putImageData(f, 0, 0), t) {
    const r = document.createElement("canvas");
    r.width = i, r.height = n;
    const u = r.getContext("2d");
    return u ? (u.translate(0, n), u.scale(1, -1), u.drawImage(l, 0, 0), r.toDataURL("image/png")) : null;
  }
  return l.toDataURL("image/png");
}
function X(g, e = 0, t = 0) {
  const i = g.getInternalTexture();
  if (!i)
    return null;
  const n = g._readPixelsSync(e, t);
  return n ? F(n, g.getSize(), i.invertY) : null;
}
async function J(g, e = 0, t = 0) {
  const i = g.getInternalTexture();
  if (!i)
    return null;
  const n = await g.readPixels(e, t);
  return n ? F(n, g.getSize(), i.invertY) : null;
}
class s extends d {
  /**
   * @internal
   */
  static _CreateVideoTexture(e, t, i, n = !1, l = !1, _ = s.TRILINEAR_SAMPLINGMODE, f = {}, a, r = 5) {
    throw v("VideoTexture");
  }
  /**
   * Are mip maps generated for this texture or not.
   */
  get noMipmap() {
    return this._noMipmap;
  }
  /** Returns the texture mime type if it was defined by a loader (undefined else) */
  get mimeType() {
    return this._mimeType;
  }
  /**
   * Is the texture preventing material to render while loading.
   * If false, a default texture will be used instead of the loading one during the preparation step.
   */
  set isBlocking(e) {
    this._isBlocking = e;
  }
  get isBlocking() {
    return this._isBlocking;
  }
  /**
   * Gets a boolean indicating if the texture needs to be inverted on the y axis during loading
   */
  get invertY() {
    return this._invertY;
  }
  /**
   * Instantiates a new texture.
   * This represents a texture in babylon. It can be easily loaded from a network, base64 or html input.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/materials/using/materials_introduction#texture
   * @param url defines the url of the picture to load as a texture
   * @param sceneOrEngine defines the scene or engine the texture will belong to
   * @param noMipmapOrOptions defines if the texture will require mip maps or not or set of all options to create the texture
   * @param invertY defines if the texture needs to be inverted on the y axis during loading
   * @param samplingMode defines the sampling mode we want for the texture while fetching from it (Texture.NEAREST_SAMPLINGMODE...)
   * @param onLoad defines a callback triggered when the texture has been loaded
   * @param onError defines a callback triggered when an error occurred during the loading session
   * @param buffer defines the buffer to load the texture from in case the texture is loaded from a buffer representation
   * @param deleteBuffer defines if the buffer we are loading the texture from should be deleted after load
   * @param format defines the format of the texture we are trying to load (Engine.TEXTUREFORMAT_RGBA...)
   * @param mimeType defines an optional mime type information
   * @param loaderOptions options to be passed to the loader
   * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
   * @param forcedExtension defines the extension to use to pick the right loader
   */
  constructor(e, t, i, n, l = s.TRILINEAR_SAMPLINGMODE, _ = null, f = null, a = null, r = !1, u, c, R, p, L) {
    super(t), this.url = null, this.uOffset = 0, this.vOffset = 0, this.uScale = 1, this.vScale = 1, this.uAng = 0, this.vAng = 0, this.wAng = 0, this.uRotationCenter = 0.5, this.vRotationCenter = 0.5, this.wRotationCenter = 0.5, this.homogeneousRotationInUVTransform = !1, this.inspectableCustomProperties = null, this._noMipmap = !1, this._invertY = !1, this._rowGenerationMatrix = null, this._cachedTextureMatrix = null, this._projectionModeMatrix = null, this._t0 = null, this._t1 = null, this._t2 = null, this._cachedUOffset = -1, this._cachedVOffset = -1, this._cachedUScale = 0, this._cachedVScale = 0, this._cachedUAng = -1, this._cachedVAng = -1, this._cachedWAng = -1, this._cachedReflectionProjectionMatrixId = -1, this._cachedURotationCenter = -1, this._cachedVRotationCenter = -1, this._cachedWRotationCenter = -1, this._cachedHomogeneousRotationInUVTransform = !1, this._cachedIdentity3x2 = !0, this._cachedReflectionTextureMatrix = null, this._cachedReflectionUOffset = -1, this._cachedReflectionVOffset = -1, this._cachedReflectionUScale = 0, this._cachedReflectionVScale = 0, this._cachedReflectionCoordinatesMode = -1, this._buffer = null, this._deleteBuffer = !1, this._format = null, this._delayedOnLoad = null, this._delayedOnError = null, this.onLoadObservable = new U(), this._isBlocking = !0, this.name = e || "", this.url = e;
    let A, w = !1, C = null, D = !0;
    typeof i == "object" && i !== null ? (A = i.noMipmap ?? !1, n = i.invertY ?? !P, l = i.samplingMode ?? s.TRILINEAR_SAMPLINGMODE, _ = i.onLoad ?? null, f = i.onError ?? null, a = i.buffer ?? null, r = i.deleteBuffer ?? !1, u = i.format, c = i.mimeType, R = i.loaderOptions, p = i.creationFlags, w = i.useSRGBBuffer ?? !1, C = i.internalTexture ?? null, D = i.gammaSpace ?? D, L = i.forcedExtension ?? L) : A = !!i, this._gammaSpace = D, this._noMipmap = A, this._invertY = n === void 0 ? !P : n, this._initialSamplingMode = l, this._buffer = a, this._deleteBuffer = r, this._mimeType = c, this._loaderOptions = R, this._creationFlags = p, this._useSRGBBuffer = w, this._forcedExtension = L, u && (this._format = u);
    const y = this.getScene(), B = this._getEngine();
    if (!B)
      return;
    B.onBeforeTextureInitObservable.notifyObservers(this);
    const I = () => {
      this._texture && (this._texture._invertVScale && (this.vScale *= -1, this.vOffset += 1), this._texture._cachedWrapU !== null && (this.wrapU = this._texture._cachedWrapU, this._texture._cachedWrapU = null), this._texture._cachedWrapV !== null && (this.wrapV = this._texture._cachedWrapV, this._texture._cachedWrapV = null), this._texture._cachedWrapR !== null && (this.wrapR = this._texture._cachedWrapR, this._texture._cachedWrapR = null)), this.onLoadObservable.hasObservers() && this.onLoadObservable.notifyObservers(this), _ && _(), !this.isBlocking && y && y.resetCachedMaterial();
    }, E = (M, T) => {
      this._loadingError = !0, this._errorObject = { message: M, exception: T }, f && f(M, T), s.OnTextureLoadErrorObservable.notifyObservers(this);
    };
    if (!this.url && !C) {
      this._delayedOnLoad = I, this._delayedOnError = E;
      return;
    }
    if (this._texture = C ?? this._getFromCache(this.url, A, l, this._invertY, w, this.isCube), this._texture)
      if (this._texture.isReady)
        G.SetImmediate(() => I());
      else {
        const M = this._texture.onLoadedObservable.add(I);
        this._texture.onErrorObservable.add((T) => {
          var V;
          E(T.message, T.exception), (V = this._texture) == null || V.onLoadedObservable.remove(M);
        });
      }
    else if (!y || !y.useDelayedTextureLoading) {
      try {
        this._texture = B.createTexture(this.url, A, this._invertY, y, l, I, E, this._buffer, void 0, this._format, this._forcedExtension, c, R, p, w);
      } catch (M) {
        throw E("error loading", M), M;
      }
      r && (this._buffer = null);
    } else
      this.delayLoadState = 4, this._delayedOnLoad = I, this._delayedOnError = E;
  }
  /**
   * Update the url (and optional buffer) of this texture if url was null during construction.
   * @param url the url of the texture
   * @param buffer the buffer of the texture (defaults to null)
   * @param onLoad callback called when the texture is loaded  (defaults to null)
   * @param forcedExtension defines the extension to use to pick the right loader
   */
  updateURL(e, t = null, i, n) {
    this.url && (this.releaseInternalTexture(), this.getScene().markAllMaterialsAsDirty(1, (l) => l.hasTexture(this))), (!this.name || this.name.startsWith("data:")) && (this.name = e), this.url = e, this._buffer = t, this._forcedExtension = n, this.delayLoadState = 4, i && (this._delayedOnLoad = i), this.delayLoad();
  }
  /**
   * Finish the loading sequence of a texture flagged as delayed load.
   * @internal
   */
  delayLoad() {
    if (this.delayLoadState !== 4)
      return;
    const e = this.getScene();
    e && (this.delayLoadState = 1, this._texture = this._getFromCache(this.url, this._noMipmap, this.samplingMode, this._invertY, this._useSRGBBuffer, this.isCube), this._texture ? this._delayedOnLoad && (this._texture.isReady ? G.SetImmediate(this._delayedOnLoad) : this._texture.onLoadedObservable.add(this._delayedOnLoad)) : (this._texture = e.getEngine().createTexture(this.url, this._noMipmap, this._invertY, e, this.samplingMode, this._delayedOnLoad, this._delayedOnError, this._buffer, null, this._format, this._forcedExtension, this._mimeType, this._loaderOptions, this._creationFlags, this._useSRGBBuffer), this._deleteBuffer && (this._buffer = null)), this._delayedOnLoad = null, this._delayedOnError = null);
  }
  _prepareRowForTextureGeneration(e, t, i, n) {
    e *= this._cachedUScale, t *= this._cachedVScale, e -= this.uRotationCenter * this._cachedUScale, t -= this.vRotationCenter * this._cachedVScale, i -= this.wRotationCenter, O.TransformCoordinatesFromFloatsToRef(e, t, i, this._rowGenerationMatrix, n), n.x += this.uRotationCenter * this._cachedUScale + this._cachedUOffset, n.y += this.vRotationCenter * this._cachedVScale + this._cachedVOffset, n.z += this.wRotationCenter;
  }
  /**
   * Get the current texture matrix which includes the requested offsetting, tiling and rotation components.
   * @param uBase The horizontal base offset multiplier (1 by default)
   * @returns the transform matrix of the texture.
   */
  getTextureMatrix(e = 1) {
    if (this.uOffset === this._cachedUOffset && this.vOffset === this._cachedVOffset && this.uScale * e === this._cachedUScale && this.vScale === this._cachedVScale && this.uAng === this._cachedUAng && this.vAng === this._cachedVAng && this.wAng === this._cachedWAng && this.uRotationCenter === this._cachedURotationCenter && this.vRotationCenter === this._cachedVRotationCenter && this.wRotationCenter === this._cachedWRotationCenter && this.homogeneousRotationInUVTransform === this._cachedHomogeneousRotationInUVTransform)
      return this._cachedTextureMatrix;
    this._cachedUOffset = this.uOffset, this._cachedVOffset = this.vOffset, this._cachedUScale = this.uScale * e, this._cachedVScale = this.vScale, this._cachedUAng = this.uAng, this._cachedVAng = this.vAng, this._cachedWAng = this.wAng, this._cachedURotationCenter = this.uRotationCenter, this._cachedVRotationCenter = this.vRotationCenter, this._cachedWRotationCenter = this.wRotationCenter, this._cachedHomogeneousRotationInUVTransform = this.homogeneousRotationInUVTransform, (!this._cachedTextureMatrix || !this._rowGenerationMatrix) && (this._cachedTextureMatrix = x.Zero(), this._rowGenerationMatrix = new x(), this._t0 = O.Zero(), this._t1 = O.Zero(), this._t2 = O.Zero()), x.RotationYawPitchRollToRef(this.vAng, this.uAng, this.wAng, this._rowGenerationMatrix), this.homogeneousRotationInUVTransform ? (x.TranslationToRef(-this._cachedURotationCenter, -this._cachedVRotationCenter, -this._cachedWRotationCenter, S.Matrix[0]), x.TranslationToRef(this._cachedURotationCenter, this._cachedVRotationCenter, this._cachedWRotationCenter, S.Matrix[1]), x.ScalingToRef(this._cachedUScale, this._cachedVScale, 0, S.Matrix[2]), x.TranslationToRef(this._cachedUOffset, this._cachedVOffset, 0, S.Matrix[3]), S.Matrix[0].multiplyToRef(this._rowGenerationMatrix, this._cachedTextureMatrix), this._cachedTextureMatrix.multiplyToRef(S.Matrix[1], this._cachedTextureMatrix), this._cachedTextureMatrix.multiplyToRef(S.Matrix[2], this._cachedTextureMatrix), this._cachedTextureMatrix.multiplyToRef(S.Matrix[3], this._cachedTextureMatrix), this._cachedTextureMatrix.setRowFromFloats(2, this._cachedTextureMatrix.m[12], this._cachedTextureMatrix.m[13], this._cachedTextureMatrix.m[14], 1)) : (this._prepareRowForTextureGeneration(0, 0, 0, this._t0), this._prepareRowForTextureGeneration(1, 0, 0, this._t1), this._prepareRowForTextureGeneration(0, 1, 0, this._t2), this._t1.subtractInPlace(this._t0), this._t2.subtractInPlace(this._t0), x.FromValuesToRef(this._t1.x, this._t1.y, this._t1.z, 0, this._t2.x, this._t2.y, this._t2.z, 0, this._t0.x, this._t0.y, this._t0.z, 0, 0, 0, 0, 1, this._cachedTextureMatrix));
    const t = this.getScene();
    if (!t)
      return this._cachedTextureMatrix;
    const i = this._cachedIdentity3x2;
    return this._cachedIdentity3x2 = this._cachedTextureMatrix.isIdentityAs3x2(), this.optimizeUVAllocation && i !== this._cachedIdentity3x2 && t.markAllMaterialsAsDirty(1, (n) => n.hasTexture(this)), this._cachedTextureMatrix;
  }
  /**
   * Get the current matrix used to apply reflection. This is useful to rotate an environment texture for instance.
   * @returns The reflection texture transform
   */
  getReflectionTextureMatrix() {
    const e = this.getScene();
    if (!e)
      return this._cachedReflectionTextureMatrix;
    if (this.uOffset === this._cachedReflectionUOffset && this.vOffset === this._cachedReflectionVOffset && this.uScale === this._cachedReflectionUScale && this.vScale === this._cachedReflectionVScale && this.coordinatesMode === this._cachedReflectionCoordinatesMode)
      if (this.coordinatesMode === s.PROJECTION_MODE) {
        if (this._cachedReflectionProjectionMatrixId === e.getProjectionMatrix().updateFlag)
          return this._cachedReflectionTextureMatrix;
      } else
        return this._cachedReflectionTextureMatrix;
    this._cachedReflectionTextureMatrix || (this._cachedReflectionTextureMatrix = x.Zero()), this._projectionModeMatrix || (this._projectionModeMatrix = x.Zero());
    const t = this._cachedReflectionCoordinatesMode !== this.coordinatesMode;
    switch (this._cachedReflectionUOffset = this.uOffset, this._cachedReflectionVOffset = this.vOffset, this._cachedReflectionUScale = this.uScale, this._cachedReflectionVScale = this.vScale, this._cachedReflectionCoordinatesMode = this.coordinatesMode, this.coordinatesMode) {
      case s.PLANAR_MODE: {
        x.IdentityToRef(this._cachedReflectionTextureMatrix), this._cachedReflectionTextureMatrix[0] = this.uScale, this._cachedReflectionTextureMatrix[5] = this.vScale, this._cachedReflectionTextureMatrix[12] = this.uOffset, this._cachedReflectionTextureMatrix[13] = this.vOffset;
        break;
      }
      case s.PROJECTION_MODE: {
        x.FromValuesToRef(0.5, 0, 0, 0, 0, -0.5, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 1, 1, this._projectionModeMatrix);
        const i = e.getProjectionMatrix();
        this._cachedReflectionProjectionMatrixId = i.updateFlag, i.multiplyToRef(this._projectionModeMatrix, this._cachedReflectionTextureMatrix);
        break;
      }
      default:
        x.IdentityToRef(this._cachedReflectionTextureMatrix);
        break;
    }
    return t && e.markAllMaterialsAsDirty(1, (i) => i.hasTexture(this)), this._cachedReflectionTextureMatrix;
  }
  /**
   * Clones the texture.
   * @returns the cloned texture
   */
  clone() {
    const e = {
      noMipmap: this._noMipmap,
      invertY: this._invertY,
      samplingMode: this.samplingMode,
      onLoad: void 0,
      onError: void 0,
      buffer: this._texture ? this._texture._buffer : void 0,
      deleteBuffer: this._deleteBuffer,
      format: this.textureFormat,
      mimeType: this.mimeType,
      loaderOptions: this._loaderOptions,
      creationFlags: this._creationFlags,
      useSRGBBuffer: this._useSRGBBuffer
    };
    return b.Clone(() => new s(this._texture ? this._texture.url : null, this.getScene(), e), this);
  }
  /**
   * Serialize the texture to a JSON representation we can easily use in the respective Parse function.
   * @returns The JSON representation of the texture
   */
  serialize() {
    var i, n;
    const e = this.name;
    s.SerializeBuffers || this.name.startsWith("data:") && (this.name = ""), this.name.startsWith("data:") && this.url === this.name && (this.url = "");
    const t = super.serialize(s._SerializeInternalTextureUniqueId);
    return t ? ((s.SerializeBuffers || s.ForceSerializeBuffers) && (typeof this._buffer == "string" && this._buffer.substring(0, 5) === "data:" ? (t.base64String = this._buffer, t.name = t.name.replace("data:", "")) : this.url && this.url.startsWith("data:") && this._buffer instanceof Uint8Array ? t.base64String = "data:image/png;base64," + k(this._buffer) : (s.ForceSerializeBuffers || this.url && this.url.startsWith("blob:") || this._forceSerialize) && (t.base64String = !this._engine || this._engine._features.supportSyncTextureRead ? X(this) : J(this))), t.invertY = this._invertY, t.samplingMode = this.samplingMode, t._creationFlags = this._creationFlags, t._useSRGBBuffer = this._useSRGBBuffer, s._SerializeInternalTextureUniqueId && (t.internalTextureUniqueId = (i = this._texture) == null ? void 0 : i.uniqueId), t.internalTextureLabel = (n = this._texture) == null ? void 0 : n.label, t.noMipmap = this._noMipmap, this.name = e, t) : null;
  }
  /**
   * Get the current class name of the texture useful for serialization or dynamic coding.
   * @returns "Texture"
   */
  getClassName() {
    return "Texture";
  }
  /**
   * Dispose the texture and release its associated resources.
   */
  dispose() {
    super.dispose(), this.onLoadObservable.clear(), this._delayedOnLoad = null, this._delayedOnError = null, this._buffer = null;
  }
  /**
   * Parse the JSON representation of a texture in order to recreate the texture in the given scene.
   * @param parsedTexture Define the JSON representation of the texture
   * @param scene Define the scene the parsed texture should be instantiated in
   * @param rootUrl Define the root url of the parsing sequence in the case of relative dependencies
   * @returns The parsed texture if successful
   */
  static Parse(e, t, i) {
    if (e.customType) {
      const r = j.Instantiate(e.customType).Parse(e, t, i);
      return e.samplingMode && r.updateSamplingMode && r._samplingMode && r._samplingMode !== e.samplingMode && r.updateSamplingMode(e.samplingMode), r;
    }
    if (e.isCube && !e.isRenderTarget)
      return s._CubeTextureParser(e, t, i);
    const n = e.internalTextureUniqueId !== void 0;
    if (!e.name && !e.isRenderTarget && !n)
      return null;
    let l;
    if (n) {
      const a = t.getEngine().getLoadedTexturesCache();
      for (const r of a)
        if (r.uniqueId === e.internalTextureUniqueId) {
          l = r;
          break;
        }
    }
    const _ = (a) => {
      if (a && a._texture && (a._texture._cachedWrapU = null, a._texture._cachedWrapV = null, a._texture._cachedWrapR = null), e.samplingMode) {
        const r = e.samplingMode;
        a && a.samplingMode !== r && a.updateSamplingMode(r);
      }
      if (a && e.animations)
        for (let r = 0; r < e.animations.length; r++) {
          const u = e.animations[r], c = H("BABYLON.Animation");
          c && a.animations.push(c.Parse(u));
        }
      a && a._texture && (n && !l && a._texture._setUniqueId(e.internalTextureUniqueId), a._texture.label = e.internalTextureLabel);
    };
    return b.Parse(() => {
      let a = !0;
      if (e.noMipmap && (a = !1), e.mirrorPlane) {
        const r = s._CreateMirror(e.name, e.renderTargetSize, t, a);
        return r._waitingRenderList = e.renderList, r.mirrorPlane = q.FromArray(e.mirrorPlane), _(r), r;
      } else if (e.isRenderTarget) {
        let r = null;
        if (e.isCube) {
          if (t.reflectionProbes)
            for (let u = 0; u < t.reflectionProbes.length; u++) {
              const c = t.reflectionProbes[u];
              if (c.name === e.name)
                return c.cubeTexture;
            }
        } else
          r = s._CreateRenderTargetTexture(e.name, e.renderTargetSize, t, a, e._creationFlags ?? 0), r._waitingRenderList = e.renderList;
        return _(r), r;
      } else if (e.isVideo) {
        const r = s._CreateVideoTexture(i + (e.url || e.name), i + (e.src || e.url), t, a, e.invertY, e.samplingMode, e.settings || {});
        return _(r), r;
      } else {
        let r;
        if (e.base64String && !l)
          r = s.CreateFromBase64String(e.base64String, e.base64String, t, !a, e.invertY, e.samplingMode, () => {
            _(r);
          }, e._creationFlags ?? 0, e._useSRGBBuffer ?? !1), r.name = e.name;
        else {
          let u;
          e.name && (e.name.indexOf("://") > 0 || e.name.startsWith("data:")) ? u = e.name : u = i + e.name, e.url && (e.url.startsWith("data:") || s.UseSerializedUrlIfAny) && (u = e.url);
          const c = {
            noMipmap: !a,
            invertY: e.invertY,
            samplingMode: e.samplingMode,
            onLoad: () => {
              _(r);
            },
            internalTexture: l
          };
          r = new s(u, t, c);
        }
        return r;
      }
    }, e, t);
  }
  /**
   * Creates a texture from its base 64 representation.
   * @param data Define the base64 payload without the data: prefix
   * @param name Define the name of the texture in the scene useful fo caching purpose for instance
   * @param scene Define the scene the texture should belong to
   * @param noMipmapOrOptions defines if the texture will require mip maps or not or set of all options to create the texture
   * @param invertY define if the texture needs to be inverted on the y axis during loading
   * @param samplingMode define the sampling mode we want for the texture while fetching from it (Texture.NEAREST_SAMPLINGMODE...)
   * @param onLoad define a callback triggered when the texture has been loaded
   * @param onError define a callback triggered when an error occurred during the loading session
   * @param format define the format of the texture we are trying to load (Engine.TEXTUREFORMAT_RGBA...)
   * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
   * @param forcedExtension defines the extension to use to pick the right loader
   * @returns the created texture
   */
  static CreateFromBase64String(e, t, i, n, l, _ = s.TRILINEAR_SAMPLINGMODE, f = null, a = null, r = 5, u, c) {
    return new s("data:" + t, i, n, l, _, f, a, e, !1, r, void 0, void 0, u, c);
  }
  /**
   * Creates a texture from its data: representation. (data: will be added in case only the payload has been passed in)
   * @param name Define the name of the texture in the scene useful fo caching purpose for instance
   * @param buffer define the buffer to load the texture from in case the texture is loaded from a buffer representation
   * @param scene Define the scene the texture should belong to
   * @param deleteBuffer define if the buffer we are loading the texture from should be deleted after load
   * @param noMipmapOrOptions defines if the texture will require mip maps or not or set of all options to create the texture
   * @param invertY define if the texture needs to be inverted on the y axis during loading
   * @param samplingMode define the sampling mode we want for the texture while fetching from it (Texture.NEAREST_SAMPLINGMODE...)
   * @param onLoad define a callback triggered when the texture has been loaded
   * @param onError define a callback triggered when an error occurred during the loading session
   * @param format define the format of the texture we are trying to load (Engine.TEXTUREFORMAT_RGBA...)
   * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
   * @param forcedExtension defines the extension to use to pick the right loader
   * @returns the created texture
   */
  static LoadFromDataString(e, t, i, n = !1, l, _ = !0, f = s.TRILINEAR_SAMPLINGMODE, a = null, r = null, u = 5, c, R) {
    return e.substring(0, 5) !== "data:" && (e = "data:" + e), new s(e, i, l, _, f, a, r, t, n, u, void 0, void 0, c, R);
  }
}
s.SerializeBuffers = !0;
s.ForceSerializeBuffers = !1;
s.OnTextureLoadErrorObservable = new U();
s._SerializeInternalTextureUniqueId = !1;
s._CubeTextureParser = (g, e, t) => {
  throw v("CubeTexture");
};
s._CreateMirror = (g, e, t, i) => {
  throw v("MirrorTexture");
};
s._CreateRenderTargetTexture = (g, e, t, i, n) => {
  throw v("RenderTargetTexture");
};
s.NEAREST_SAMPLINGMODE = 1;
s.NEAREST_NEAREST_MIPLINEAR = 8;
s.BILINEAR_SAMPLINGMODE = 2;
s.LINEAR_LINEAR_MIPNEAREST = 11;
s.TRILINEAR_SAMPLINGMODE = 3;
s.LINEAR_LINEAR_MIPLINEAR = 3;
s.NEAREST_NEAREST_MIPNEAREST = 4;
s.NEAREST_LINEAR_MIPNEAREST = 5;
s.NEAREST_LINEAR_MIPLINEAR = 6;
s.NEAREST_LINEAR = 7;
s.NEAREST_NEAREST = 1;
s.LINEAR_NEAREST_MIPNEAREST = 9;
s.LINEAR_NEAREST_MIPLINEAR = 10;
s.LINEAR_LINEAR = 2;
s.LINEAR_NEAREST = 12;
s.EXPLICIT_MODE = 0;
s.SPHERICAL_MODE = 1;
s.PLANAR_MODE = 2;
s.CUBIC_MODE = 3;
s.PROJECTION_MODE = 4;
s.SKYBOX_MODE = 5;
s.INVCUBIC_MODE = 6;
s.EQUIRECTANGULAR_MODE = 7;
s.FIXED_EQUIRECTANGULAR_MODE = 8;
s.FIXED_EQUIRECTANGULAR_MIRRORED_MODE = 9;
s.CLAMP_ADDRESSMODE = 0;
s.WRAP_ADDRESSMODE = 1;
s.MIRROR_ADDRESSMODE = 2;
s.UseSerializedUrlIfAny = !1;
h([
  o()
], s.prototype, "url", void 0);
h([
  o()
], s.prototype, "uOffset", void 0);
h([
  o()
], s.prototype, "vOffset", void 0);
h([
  o()
], s.prototype, "uScale", void 0);
h([
  o()
], s.prototype, "vScale", void 0);
h([
  o()
], s.prototype, "uAng", void 0);
h([
  o()
], s.prototype, "vAng", void 0);
h([
  o()
], s.prototype, "wAng", void 0);
h([
  o()
], s.prototype, "uRotationCenter", void 0);
h([
  o()
], s.prototype, "vRotationCenter", void 0);
h([
  o()
], s.prototype, "wRotationCenter", void 0);
h([
  o()
], s.prototype, "homogeneousRotationInUVTransform", void 0);
h([
  o()
], s.prototype, "isBlocking", null);
Z("BABYLON.Texture", s);
b._TextureParser = s.Parse;
export {
  d as B,
  s as T
};
