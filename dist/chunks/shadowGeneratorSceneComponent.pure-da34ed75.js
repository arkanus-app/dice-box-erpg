import { S as d } from "./index-11ca32cf.js";
import { A as l } from "./babylonFileParser.function-d43bc945.js";
class S {
  /**
   * Creates a new instance of the component for the given scene
   * @param scene Defines the scene to register the component in
   */
  constructor(e) {
    this.name = d.NAME_SHADOWGENERATOR, this.scene = e;
  }
  /**
   * Registers the component in a given scene
   */
  register() {
    this.scene._gatherRenderTargetsStage.registerStep(d.STEP_GATHERRENDERTARGETS_SHADOWGENERATOR, this, this._gatherRenderTargets);
  }
  /**
   * Rebuilds the elements related to this component in case of
   * context lost for instance.
   */
  rebuild() {
  }
  /**
   * Serializes the component data to the specified json object
   * @param serializationObject The object to serialize to
   */
  serialize(e) {
    e.shadowGenerators = [];
    const t = this.scene.lights;
    for (const o of t) {
      if (o.doNotSerialize)
        continue;
      const r = o.getShadowGenerators();
      if (r) {
        const n = r.values();
        for (let s = n.next(); s.done !== !0; s = n.next()) {
          const a = s.value;
          a.doNotSerialize || e.shadowGenerators.push(a.serialize());
        }
      }
    }
  }
  /**
   * Adds all the elements from the container to the scene
   * @param container the container holding the elements
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addFromContainer(e) {
  }
  /**
   * Removes all the elements in the container from the scene
   * @param container contains the elements to remove
   * @param dispose if the removed element should be disposed (default: false)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeFromContainer(e, t) {
  }
  /**
   * Rebuilds the elements related to this component in case of
   * context lost for instance.
   */
  dispose() {
  }
  _gatherRenderTargets(e) {
    const t = this.scene;
    if (this.scene.shadowsEnabled)
      for (let o = 0; o < t.lights.length; o++) {
        const r = t.lights[o], n = r.getShadowGenerators();
        if (r.isEnabled() && r.shadowEnabled && n) {
          const s = n.values();
          for (let a = s.next(); a.done !== !0; a = s.next()) {
            const h = a.value.getShadowMap();
            t.textures.indexOf(h) !== -1 && e.push(h);
          }
        }
      }
  }
}
let c = !1;
function w(i) {
  c || (c = !0, l(d.NAME_SHADOWGENERATOR, (e, t) => {
    if (e.shadowGenerators !== void 0 && e.shadowGenerators !== null)
      for (let o = 0, r = e.shadowGenerators.length; o < r; o++) {
        const n = e.shadowGenerators[o];
        i._CascadedShadowGeneratorParser && n.className === "CascadedShadowGenerator" ? i._CascadedShadowGeneratorParser(n, t) : i.Parse(n, t);
      }
  }), i._SceneComponentInitialization = (e) => {
    let t = e._getComponent(d.NAME_SHADOWGENERATOR);
    t || (t = new S(e), e._addComponent(t));
  });
}
export {
  w as R,
  S
};
