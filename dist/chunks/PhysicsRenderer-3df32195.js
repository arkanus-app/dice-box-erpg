var is = Object.defineProperty;
var ns = (o, t, e) => t in o ? is(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var ie = (o, t, e) => (ns(o, typeof t != "symbol" ? t + "" : t, e), e), vt = (o, t, e) => {
  if (!t.has(o))
    throw TypeError("Cannot " + e);
};
var m = (o, t, e) => (vt(o, t, "read from private field"), e ? e.call(o) : t.get(o)), D = (o, t, e) => {
  if (t.has(o))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(o) : t.set(o, e);
}, R = (o, t, e, s) => (vt(o, t, "write to private field"), s ? s.call(o, e) : t.set(o, e), e);
var ne = (o, t, e, s) => ({
  set _(i) {
    R(o, t, i, e);
  },
  get _() {
    return m(o, t, s);
  }
}), E = (o, t, e) => (vt(o, t, "access private method"), e);
import { H as os } from "./havok-e246cb5e.js";
import { _ as Ee, V as _, ak as it, S as Te, n as F, O as tt, am as dt, an as rt, c as b, M as at, ao as B, g as $t, ap as rs, aq as as, F as It, ar as ct, as as oe, at as pt, au as ls, C as hs, av as cs, aw as re, ax as ae, ay as ds, az as nt, aA as ps, aB as us, aC as _s, aD as gs, aE as fs } from "./index-11ca32cf.js";
let ms = class ke {
  /**
   *
   * @returns version
   */
  getPluginVersion() {
    return this._physicsPlugin.getPluginVersion();
  }
  /**
   * @virtual
   * Factory used to create the default physics plugin.
   * @returns The default physics plugin
   */
  static DefaultPluginFactory() {
    throw Ee("CannonJSPlugin");
  }
  /**
   * Creates a new Physics Engine
   * @param gravity defines the gravity vector used by the simulation
   * @param _physicsPlugin defines the plugin to use (CannonJS by default)
   */
  constructor(t, e = ke.DefaultPluginFactory()) {
    if (this._physicsPlugin = e, this._impostors = [], this._joints = [], this._subTimeStep = 0, this._uniqueIdCounter = 0, !this._physicsPlugin.isSupported())
      throw new Error("Physics Engine " + this._physicsPlugin.name + " cannot be found. Please make sure it is included.");
    t = t || new _(0, -9.807, 0), this.setGravity(t), this.setTimeStep();
  }
  /**
   * Sets the gravity vector used by the simulation
   * @param gravity defines the gravity vector to use
   */
  setGravity(t) {
    this.gravity = t, this._physicsPlugin.setGravity(this.gravity);
  }
  /**
   * Set the time step of the physics engine.
   * Default is 1/60.
   * To slow it down, enter 1/600 for example.
   * To speed it up, 1/30
   * @param newTimeStep defines the new timestep to apply to this world.
   */
  setTimeStep(t = 1 / 60) {
    this._physicsPlugin.setTimeStep(t);
  }
  /**
   * Get the time step of the physics engine.
   * @returns the current time step
   */
  getTimeStep() {
    return this._physicsPlugin.getTimeStep();
  }
  /**
   * Set the sub time step of the physics engine.
   * Default is 0 meaning there is no sub steps
   * To increase physics resolution precision, set a small value (like 1 ms)
   * @param subTimeStep defines the new sub timestep used for physics resolution.
   */
  setSubTimeStep(t = 0) {
    this._subTimeStep = t;
  }
  /**
   * Get the sub time step of the physics engine.
   * @returns the current sub time step
   */
  getSubTimeStep() {
    return this._subTimeStep;
  }
  /**
   * Release all resources
   */
  dispose() {
    for (const t of this._impostors)
      t.dispose();
    this._physicsPlugin.dispose();
  }
  /**
   * Gets the name of the current physics plugin
   * @returns the name of the plugin
   */
  getPhysicsPluginName() {
    return this._physicsPlugin.name;
  }
  /**
   * Adding a new impostor for the impostor tracking.
   * This will be done by the impostor itself.
   * @param impostor the impostor to add
   */
  addImpostor(t) {
    this._impostors.push(t), t.uniqueId = this._uniqueIdCounter++, t.parent || this._physicsPlugin.generatePhysicsBody(t);
  }
  /**
   * Remove an impostor from the engine.
   * This impostor and its mesh will not longer be updated by the physics engine.
   * @param impostor the impostor to remove
   */
  removeImpostor(t) {
    const e = this._impostors.indexOf(t);
    e > -1 && this._impostors.splice(e, 1).length && this.getPhysicsPlugin().removePhysicsBody(t);
  }
  /**
   * Add a joint to the physics engine
   * @param mainImpostor defines the main impostor to which the joint is added.
   * @param connectedImpostor defines the impostor that is connected to the main impostor using this joint
   * @param joint defines the joint that will connect both impostors.
   */
  addJoint(t, e, s) {
    const i = {
      mainImpostor: t,
      connectedImpostor: e,
      joint: s
    };
    s.physicsPlugin = this._physicsPlugin, this._joints.push(i), this._physicsPlugin.generateJoint(i);
  }
  /**
   * Removes a joint from the simulation
   * @param mainImpostor defines the impostor used with the joint
   * @param connectedImpostor defines the other impostor connected to the main one by the joint
   * @param joint defines the joint to remove
   */
  removeJoint(t, e, s) {
    const i = this._joints.filter(function(n) {
      return n.connectedImpostor === e && n.joint === s && n.mainImpostor === t;
    });
    i.length && this._physicsPlugin.removeJoint(i[0]);
  }
  /**
   * Called by the scene. No need to call it.
   * @param delta defines the timespan between frames
   */
  _step(t) {
    for (const e of this._impostors)
      e.isBodyInitRequired() && this._physicsPlugin.generatePhysicsBody(e);
    t > 0.1 ? t = 0.1 : t <= 0 && (t = 1 / 60), this._physicsPlugin.executeStep(t, this._impostors);
  }
  /**
   * Gets the current plugin used to run the simulation
   * @returns current plugin
   */
  getPhysicsPlugin() {
    return this._physicsPlugin;
  }
  /**
   * Gets the list of physic impostors
   * @returns an array of PhysicsImpostor
   */
  getImpostors() {
    return this._impostors;
  }
  /**
   * Gets the impostor for a physics enabled object
   * @param object defines the object impersonated by the impostor
   * @returns the PhysicsImpostor or null if not found
   */
  getImpostorForPhysicsObject(t) {
    for (let e = 0; e < this._impostors.length; ++e)
      if (this._impostors[e].object === t)
        return this._impostors[e];
    return null;
  }
  /**
   * Gets the impostor for a physics body object
   * @param body defines physics body used by the impostor
   * @returns the PhysicsImpostor or null if not found
   */
  getImpostorWithPhysicsBody(t) {
    for (let e = 0; e < this._impostors.length; ++e)
      if (this._impostors[e].physicsBody === t)
        return this._impostors[e];
    return null;
  }
  /**
   * Does a raycast in the physics world
   * @param from when should the ray start?
   * @param to when should the ray end?
   * @returns PhysicsRaycastResult
   */
  raycast(t, e) {
    return this._physicsPlugin.raycast(t, e);
  }
  /**
   * Does a raycast in the physics world
   * @param from when should the ray start?
   * @param to when should the ray end?
   * @param result resulting PhysicsRaycastResult
   * @returns true if the ray hits an impostor, else false
   */
  raycastToRef(t, e, s) {
    return this._physicsPlugin.raycastToRef(t, e, s);
  }
};
class ys {
  constructor() {
    this._hasHit = !1, this._hitNormal = _.Zero(), this._hitPoint = _.Zero(), this._triangleIndex = -1;
  }
  /**
   * Gets the hit point.
   */
  get hitPoint() {
    return this._hitPoint;
  }
  /**
   * Gets the hit normal.
   */
  get hitNormal() {
    return this._hitNormal;
  }
  /**
   * Gets if there was a hit
   */
  get hasHit() {
    return this._hasHit;
  }
  /**
   * The index of the original triangle which was hit. Will be -1 if contact point is not on a mesh shape
   */
  get triangleIndex() {
    return this._triangleIndex;
  }
  /**
   * Sets the hit data
   * @param hitNormal defines the normal in world space
   * @param hitPoint defines the point in world space
   * @param triangleIndex defines the index of the triangle in case of mesh shape
   */
  setHitData(t, e, s) {
    this._hasHit = !0, this._hitNormal.set(t.x, t.y, t.z), this._hitPoint.set(e.x, e.y, e.z), this._triangleIndex = s ?? -1;
  }
  /**
   * Resets all the values to default
   */
  reset() {
    this._hasHit = !1, this._hitNormal.setAll(0), this._hitPoint.setAll(0), this._triangleIndex = -1, this.body = void 0, this.bodyIndex = void 0, this.shape = void 0;
  }
}
class Re extends ys {
  constructor() {
    super(...arguments), this._hitDistance = 0, this._rayFromWorld = _.Zero(), this._rayToWorld = _.Zero();
  }
  /**
   * Gets the distance from the hit
   */
  get hitDistance() {
    return this._hitDistance;
  }
  /**
   * Gets the hit normal/direction in the world
   */
  get hitNormalWorld() {
    return this._hitNormal;
  }
  /**
   * Gets the hit point in the world
   */
  get hitPointWorld() {
    return this._hitPoint;
  }
  /**
   * Gets the ray "start point" of the ray in the world
   */
  get rayFromWorld() {
    return this._rayFromWorld;
  }
  /**
   * Gets the ray "end point" of the ray in the world
   */
  get rayToWorld() {
    return this._rayToWorld;
  }
  /**
   * Sets the distance from the start point to the hit point
   * @param distance defines the distance to set
   */
  setHitDistance(t) {
    this._hitDistance = t;
  }
  /**
   * Calculates the distance manually
   */
  calculateHitDistance() {
    this._hitDistance = _.Distance(this._rayFromWorld, this._hitPoint);
  }
  /**
   * Resets all the values to default
   * @param from The from point on world space
   * @param to The to point on world space
   */
  reset(t = _.Zero(), e = _.Zero()) {
    super.reset(), this._rayFromWorld.copyFrom(t), this._rayToWorld.copyFrom(e), this._hitDistance = 0;
  }
}
class qt {
  /**
   *
   * @returns physics plugin version
   */
  getPluginVersion() {
    return this._physicsPlugin.getPluginVersion();
  }
  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * Factory used to create the default physics plugin.
   * @returns The default physics plugin
   */
  static DefaultPluginFactory() {
    throw Ee("");
  }
  /**
   * Creates a new Physics Engine
   * @param gravity defines the gravity vector used by the simulation
   * @param _physicsPlugin defines the plugin to use (CannonJS by default)
   */
  constructor(t, e = qt.DefaultPluginFactory()) {
    this._physicsPlugin = e, this._physicsBodies = [], this._subTimeStep = 0, t = t || new _(0, -9.807, 0), this.setGravity(t), this.setTimeStep();
  }
  /**
   * Sets the gravity vector used by the simulation
   * @param gravity defines the gravity vector to use
   */
  setGravity(t) {
    this.gravity = t, this._physicsPlugin.setGravity(this.gravity);
  }
  /**
   * Set the time step of the physics engine.
   * Default is 1/60.
   * To slow it down, enter 1/600 for example.
   * To speed it up, 1/30
   * Unit is seconds.
   * @param newTimeStep defines the new timestep to apply to this world.
   */
  setTimeStep(t = 1 / 60) {
    this._physicsPlugin.setTimeStep(t);
  }
  /**
   * Get the time step of the physics engine.
   * @returns the current time step
   */
  getTimeStep() {
    return this._physicsPlugin.getTimeStep();
  }
  /**
   * Set the sub time step of the physics engine.
   * Default is 0 meaning there is no sub steps
   * To increase physics resolution precision, set a small value (like 1 ms)
   * @param subTimeStep defines the new sub timestep used for physics resolution.
   */
  setSubTimeStep(t = 0) {
    this._subTimeStep = t;
  }
  /**
   * Get the sub time step of the physics engine.
   * @returns the current sub time step
   */
  getSubTimeStep() {
    return this._subTimeStep;
  }
  /**
   * Release all resources
   */
  dispose() {
    this._physicsPlugin.dispose();
  }
  /**
   * Gets the name of the current physics plugin
   * @returns the name of the plugin
   */
  getPhysicsPluginName() {
    return this._physicsPlugin.name;
  }
  /**
   * Set the maximum allowed linear and angular velocities
   * @param maxLinearVelocity maximum allowed linear velocity
   * @param maxAngularVelocity maximum allowed angular velocity
   */
  setVelocityLimits(t, e) {
    this._physicsPlugin.setVelocityLimits(t, e);
  }
  /**
   * @returns maximum allowed linear velocity
   */
  getMaxLinearVelocity() {
    return this._physicsPlugin.getMaxLinearVelocity();
  }
  /**
   * @returns maximum allowed angular velocity
   */
  getMaxAngularVelocity() {
    return this._physicsPlugin.getMaxAngularVelocity();
  }
  /**
   * Called by the scene. No need to call it.
   * @param delta defines the timespan between frames
   */
  _step(t) {
    t > 0.1 ? t = 0.1 : t <= 0 && (t = 1 / 60), this._physicsPlugin.executeStep(t, this._physicsBodies);
  }
  /**
   * Add a body as an active component of this engine
   * @param physicsBody The body to add
   */
  addBody(t) {
    this._physicsBodies.push(t);
  }
  /**
   * Removes a particular body from this engine
   * @param physicsBody The body to remove from the simulation
   */
  removeBody(t) {
    const e = this._physicsBodies.indexOf(t);
    e > -1 && this._physicsBodies.splice(e, 1);
  }
  /**
   * @returns an array of bodies added to this engine
   */
  getBodies() {
    return this._physicsBodies;
  }
  /**
   * Gets the current plugin used to run the simulation
   * @returns current plugin
   */
  getPhysicsPlugin() {
    return this._physicsPlugin;
  }
  /**
   * Does a raycast in the physics world
   * @param from when should the ray start?
   * @param to when should the ray end?
   * @param result resulting PhysicsRaycastResult or array of PhysicsRaycastResults
   * @param query raycast query object
   * If result is an empty array, it will be populated with every detected raycast hit.
   * If result is a populated array, it will only fill the PhysicsRaycastResults present in the array.
   */
  raycastToRef(t, e, s, i) {
    this._physicsPlugin.raycast(t, e, s, i);
  }
  /**
   * Does a raycast in the physics world
   * @param from when should the ray start?
   * @param to when should the ray end?
   * @param query raycast query object
   * @returns PhysicsRaycastResult
   */
  raycast(t, e, s) {
    const i = new Re();
    return this._physicsPlugin.raycast(t, e, i, s), i;
  }
  /**
   * Does a raycast through multiple objects in the physics world
   * @param from when should the ray start?
   * @param to when should the ray end?
   * @param query raycast query object
   * @returns array of PhysicsRaycastResult
   */
  raycastMulti(t, e, s) {
    const i = [];
    return this._physicsPlugin.raycast(t, e, i, s), i;
  }
}
class Ms {
  /**
   * Creates a new instance of the component for the given scene
   * @param scene Defines the scene to register the component in
   */
  constructor(t) {
    this.name = Te.NAME_PHYSICSENGINE, this.scene = t, this.scene.onBeforePhysicsObservable = new tt(), this.scene.onAfterPhysicsObservable = new tt(), this.scene.getDeterministicFrameTime = () => this.scene._physicsEngine ? this.scene._physicsEngine.getTimeStep() * 1e3 : 1e3 / 60;
  }
  /**
   * Registers the component in a given scene
   */
  register() {
  }
  /**
   * Rebuilds the elements related to this component in case of
   * context lost for instance.
   */
  rebuild() {
  }
  /**
   * Disposes the component and the associated resources
   */
  dispose() {
    this.scene.onBeforePhysicsObservable.clear(), this.scene.onAfterPhysicsObservable.clear(), this.scene._physicsEngine && this.scene.disablePhysicsEngine();
  }
}
let le = !1;
function Is() {
  le || (le = !0, it.prototype.getPhysicsEngine = function() {
    return this._physicsEngine ?? null;
  }, it.prototype.enablePhysics = function(o = null, t) {
    if (this._physicsEngine)
      return !0;
    let e = this._getComponent(Te.NAME_PHYSICSENGINE);
    e || (e = new Ms(this), this._addComponent(e));
    try {
      if (!t || (t == null ? void 0 : t.getPluginVersion()) === 1)
        this._physicsEngine = new ms(o, t);
      else if ((t == null ? void 0 : t.getPluginVersion()) === 2)
        this._physicsEngine = new qt(o, t);
      else
        throw new Error("Unsupported Physics plugin version.");
      return this._physicsTimeAccumulator = 0, !0;
    } catch (s) {
      return F.Error(s.message), !1;
    }
  }, it.prototype.disablePhysicsEngine = function() {
    this._physicsEngine && (this._physicsEngine.dispose(), this._physicsEngine = null);
  }, it.prototype.isPhysicsEnabled = function() {
    return !!this._physicsEngine;
  }, it.prototype.deleteCompoundImpostor = function(o) {
    const t = o.parts[0].mesh;
    t.physicsImpostor && (t.physicsImpostor.dispose(
      /*true*/
    ), t.physicsImpostor = null);
  }, it.prototype._advancePhysicsEngineStep = function(o) {
    if (this._physicsEngine) {
      const t = this._physicsEngine.getSubTimeStep();
      if (t > 0)
        for (this._physicsTimeAccumulator += o; this._physicsTimeAccumulator > t; )
          this.onBeforePhysicsObservable.notifyObservers(this), this._physicsEngine._step(t / 1e3), this.onAfterPhysicsObservable.notifyObservers(this), this._physicsTimeAccumulator -= t;
      else
        this.onBeforePhysicsObservable.notifyObservers(this), this._physicsEngine._step(o / 1e3), this.onAfterPhysicsObservable.notifyObservers(this);
    }
  });
}
Is();
class G {
  /**
   * Initializes the physics joint
   * @param type The type of the physics joint
   * @param jointData The data for the physics joint
   */
  constructor(t, e) {
    this.type = t, this.jointData = e, e.nativeParams = e.nativeParams || {};
  }
  /**
   * Gets the physics joint
   */
  get physicsJoint() {
    return this._physicsJoint;
  }
  /**
   * Sets the physics joint
   */
  set physicsJoint(t) {
    this._physicsJoint = t;
  }
  /**
   * Sets the physics plugin
   */
  set physicsPlugin(t) {
    this._physicsPlugin = t;
  }
  /**
   * Execute a function that is physics-plugin specific.
   * @param {Function} func the function that will be executed.
   *                        It accepts two parameters: the physics world and the physics joint
   */
  executeNativeFunction(t) {
    t(this._physicsPlugin.world, this._physicsJoint);
  }
}
G.DistanceJoint = 0;
G.HingeJoint = 1;
G.BallAndSocketJoint = 2;
G.WheelJoint = 3;
G.SliderJoint = 4;
G.PrismaticJoint = 5;
G.UniversalJoint = 6;
G.Hinge2Joint = G.WheelJoint;
G.PointToPointJoint = 8;
G.SpringJoint = 9;
G.LockJoint = 10;
let he = !1;
function As() {
  he || (he = !0, Object.defineProperty(dt.prototype, "physicsImpostor", {
    get: function() {
      return this._physicsImpostor;
    },
    set: function(o) {
      this._physicsImpostor !== o && (this._disposePhysicsObserver && this.onDisposeObservable.remove(this._disposePhysicsObserver), this._physicsImpostor = o, o && (this._disposePhysicsObserver = this.onDisposeObservable.add(() => {
        this.physicsImpostor && (this.physicsImpostor.dispose(
          /*!doNotRecurse*/
        ), this.physicsImpostor = null);
      })));
    },
    enumerable: !0,
    configurable: !0
  }), dt.prototype.getPhysicsImpostor = function() {
    return this.physicsImpostor;
  }, dt.prototype.applyImpulse = function(o, t) {
    return this.physicsImpostor ? (this.physicsImpostor.applyImpulse(o, t), this) : this;
  }, dt.prototype.setPhysicsLinkWith = function(o, t, e, s) {
    return !this.physicsImpostor || !o.physicsImpostor ? this : (this.physicsImpostor.createJoint(o.physicsImpostor, G.HingeJoint, {
      mainPivot: t,
      connectedPivot: e,
      nativeParams: s
    }), this);
  });
}
As();
let ce = !1;
function Cs() {
  ce || (ce = !0, Object.defineProperty(rt.prototype, "physicsBody", {
    get: function() {
      return this._physicsBody;
    },
    set: function(o) {
      this._physicsBody !== o && (this._disposePhysicsObserver && this.onDisposeObservable.remove(this._disposePhysicsObserver), this._physicsBody = o, o && (this._disposePhysicsObserver = this.onDisposeObservable.add(() => {
        this.physicsBody && (this.physicsBody.dispose(
          /*!doNotRecurse*/
        ), this.physicsBody = null);
      })));
    },
    enumerable: !0,
    configurable: !0
  }), rt.prototype.getPhysicsBody = function() {
    return this.physicsBody;
  }, rt.prototype.applyImpulse = function(o, t) {
    if (!this.physicsBody)
      throw new Error("No Physics Body for TransformNode");
    return this.physicsBody.applyImpulse(o, t), this;
  }, rt.prototype.applyAngularImpulse = function(o) {
    if (!this.physicsBody)
      throw new Error("No Physics Body for TransformNode");
    return this.physicsBody.applyAngularImpulse(o), this;
  }, rt.prototype.applyTorque = function(o) {
    if (!this.physicsBody)
      throw new Error("No Physics Body for TransformNode");
    return this.physicsBody.applyTorque(o), this;
  });
}
Cs();
var de;
(function(o) {
  o[o.FREE = 0] = "FREE", o[o.LIMITED = 1] = "LIMITED", o[o.LOCKED = 2] = "LOCKED";
})(de || (de = {}));
var pe;
(function(o) {
  o[o.LINEAR_X = 0] = "LINEAR_X", o[o.LINEAR_Y = 1] = "LINEAR_Y", o[o.LINEAR_Z = 2] = "LINEAR_Z", o[o.ANGULAR_X = 3] = "ANGULAR_X", o[o.ANGULAR_Y = 4] = "ANGULAR_Y", o[o.ANGULAR_Z = 5] = "ANGULAR_Z", o[o.LINEAR_DISTANCE = 6] = "LINEAR_DISTANCE";
})(pe || (pe = {}));
var ue;
(function(o) {
  o[o.BALL_AND_SOCKET = 1] = "BALL_AND_SOCKET", o[o.DISTANCE = 2] = "DISTANCE", o[o.HINGE = 3] = "HINGE", o[o.SLIDER = 4] = "SLIDER", o[o.LOCK = 5] = "LOCK", o[o.PRISMATIC = 6] = "PRISMATIC", o[o.SIX_DOF = 7] = "SIX_DOF";
})(ue || (ue = {}));
var _e;
(function(o) {
  o[o.SPHERE = 0] = "SPHERE", o[o.CAPSULE = 1] = "CAPSULE", o[o.CYLINDER = 2] = "CYLINDER", o[o.BOX = 3] = "BOX", o[o.CONVEX_HULL = 4] = "CONVEX_HULL", o[o.CONTAINER = 5] = "CONTAINER", o[o.MESH = 6] = "MESH", o[o.HEIGHTFIELD = 7] = "HEIGHTFIELD";
})(_e || (_e = {}));
var ge;
(function(o) {
  o[o.NONE = 0] = "NONE", o[o.VELOCITY = 1] = "VELOCITY", o[o.POSITION = 2] = "POSITION";
})(ge || (ge = {}));
var xt;
(function(o) {
  o.COLLISION_STARTED = "COLLISION_STARTED", o.COLLISION_CONTINUED = "COLLISION_CONTINUED", o.COLLISION_FINISHED = "COLLISION_FINISHED", o.TRIGGER_ENTERED = "TRIGGER_ENTERED", o.TRIGGER_EXITED = "TRIGGER_EXITED";
})(xt || (xt = {}));
var N;
(function(o) {
  o[o.STATIC = 0] = "STATIC", o[o.ANIMATED = 1] = "ANIMATED", o[o.DYNAMIC = 2] = "DYNAMIC";
})(N || (N = {}));
var K;
(function(o) {
  o[o.DISABLED = 0] = "DISABLED", o[o.TELEPORT = 1] = "TELEPORT", o[o.ACTION = 2] = "ACTION";
})(K || (K = {}));
var Z;
(function(o) {
  o[o.SIMULATION_CONTROLLED = 0] = "SIMULATION_CONTROLLED", o[o.ALWAYS_ACTIVE = 1] = "ALWAYS_ACTIVE", o[o.ALWAYS_INACTIVE = 2] = "ALWAYS_INACTIVE";
})(Z || (Z = {}));
class te {
  /**
   * Constructs a new physics shape.
   * @param options The options for the physics shape. These are:
   *  * type: The type of the shape. This can be one of the following: SPHERE, BOX, CAPSULE, CYLINDER, CONVEX_HULL, MESH, HEIGHTFIELD, CONTAINER
   *  * parameters: The parameters of the shape.
   *  * pluginData: The plugin data of the shape. This is used if you already have a reference to the object on the plugin side.
   * You need to specify either type or pluginData.
   * @param scene The scene the shape belongs to.
   *
   * This code is useful for creating a new physics shape with the given type, options, and scene.
   * It also checks that the physics engine and plugin version are correct.
   * If not, it throws an error. This ensures that the shape is created with the correct parameters and is compatible with the physics engine.
   */
  constructor(t, e) {
    if (this._pluginData = void 0, this._isTrigger = !1, this._isDisposed = !1, !e)
      return;
    const s = e.getPhysicsEngine();
    if (!s)
      throw new Error("No Physics Engine available.");
    if (s.getPluginVersion() != 2)
      throw new Error("Plugin version is incorrect. Expected version 2.");
    const i = s.getPhysicsPlugin();
    if (!i)
      throw new Error("No Physics Plugin available.");
    if (this._physicsPlugin = i, t.pluginData !== void 0 && t.pluginData !== null)
      this._pluginData = t.pluginData, this._type = this._physicsPlugin.getShapeType(this);
    else if (t.type !== void 0 && t.type !== null) {
      this._type = t.type;
      const n = t.parameters ?? {};
      this._physicsPlugin.initShape(this, t.type, n);
    }
  }
  /**
   * Returns the string "PhysicsShape".
   * @returns "PhysicsShape"
   */
  getClassName() {
    return "PhysicsShape";
  }
  /**
   * Returns the type of the physics shape.
   * @returns The type of the physics shape.
   */
  get type() {
    return this._type;
  }
  /**
   * Set the membership mask of a shape. This is a bitfield of arbitrary
   * "categories" to which the shape is a member. This is used in combination
   * with the collide mask to determine if this shape should collide with
   * another.
   *
   * @param membershipMask Bitfield of categories of this shape.
   */
  set filterMembershipMask(t) {
    this._physicsPlugin.setShapeFilterMembershipMask(this, t);
  }
  /**
   * Get the membership mask of a shape.
   * @returns Bitmask of categories which this shape is a member of.
   */
  get filterMembershipMask() {
    return this._physicsPlugin.getShapeFilterMembershipMask(this);
  }
  /**
   * Sets the collide mask of a shape. This is a bitfield of arbitrary
   * "categories" to which this shape collides with. Given two shapes,
   * the engine will check if the collide mask and membership overlap:
   * shapeA.filterMembershipMask & shapeB.filterCollideMask
   *
   * If this value is zero (i.e. shapeB only collides with categories
   * which shapeA is _not_ a member of) then the shapes will not collide.
   *
   * Note, the engine will also perform the same test with shapeA and
   * shapeB swapped; the shapes will not collide if either shape has
   * a collideMask which prevents collision with the other shape.
   *
   * @param collideMask Bitmask of categories this shape should collide with
   */
  set filterCollideMask(t) {
    this._physicsPlugin.setShapeFilterCollideMask(this, t);
  }
  /**
   *
   * @returns Bitmask of categories that this shape should collide with
   */
  get filterCollideMask() {
    return this._physicsPlugin.getShapeFilterCollideMask(this);
  }
  /**
   *
   * @param material
   */
  set material(t) {
    this._physicsPlugin.setMaterial(this, t), this._material = t;
  }
  /**
   * Returns the material of the physics shape.
   * @returns The material of the physics shape.
   */
  get material() {
    return this._material || (this._material = this._physicsPlugin.getMaterial(this)), this._material;
  }
  /**
   * Sets the density of the physics shape.
   * @param density The density of the physics shape.
   */
  set density(t) {
    this._physicsPlugin.setDensity(this, t);
  }
  /**
   * Returns the density of the physics shape.
   * @returns The density of the physics shape.
   */
  get density() {
    return this._physicsPlugin.getDensity(this);
  }
  /**
   * Utility to add a child shape to this container,
   * automatically computing the relative transform between
   * the container shape and the child instance.
   *
   * @param parentTransform The transform node associated with this shape
   * @param newChild The new PhysicsShape to add
   * @param childTransform The transform node associated with the child shape
   */
  addChildFromParent(t, e, s) {
    const i = s.computeWorldMatrix(!0), n = t.computeWorldMatrix(!0), r = b.Matrix[0];
    i.multiplyToRef(at.Invert(n), r);
    const a = b.Vector3[0], l = b.Quaternion[0], c = b.Vector3[1];
    r.decompose(c, l, a), this._physicsPlugin.addChild(this, e, a, l, c);
  }
  /**
   * Adds a child shape to a container with an optional transform
   * @param newChild The new PhysicsShape to add
   * @param translation Optional position of the child shape relative to this shape
   * @param rotation Optional rotation of the child shape relative to this shape
   * @param scale Optional scale of the child shape relative to this shape
   */
  addChild(t, e, s, i) {
    this._physicsPlugin.addChild(this, t, e, s, i);
  }
  /**
   * Removes a child shape from this shape.
   * @param childIndex The index of the child shape to remove
   */
  removeChild(t) {
    this._physicsPlugin.removeChild(this, t);
  }
  /**
   * Returns the number of children of a physics shape.
   * @returns The number of children of a physics shape.
   */
  getNumChildren() {
    return this._physicsPlugin.getNumChildren(this);
  }
  /**
   * Returns the bounding box of the physics shape.
   * @returns The bounding box of the physics shape.
   */
  getBoundingBox() {
    return this._physicsPlugin.getBoundingBox(this);
  }
  set isTrigger(t) {
    this._isTrigger !== t && (this._isTrigger = t, this._physicsPlugin.setTrigger(this, t));
  }
  get isTrigger() {
    return this._isTrigger;
  }
  /**
   * Dispose the shape and release its associated resources.
   */
  dispose() {
    this._isDisposed || (this._physicsPlugin.disposeShape(this), this._isDisposed = !0);
  }
}
class ee extends te {
  /**
   *
   * @param center local center of the box
   * @param rotation local orientation
   * @param extents size of the box in each direction
   * @param scene scene to attach to
   */
  constructor(t, e, s, i) {
    super({ type: 3, parameters: { center: t, rotation: e, extents: s } }, i);
  }
  /**
   *
   * @param mesh
   * @returns PhysicsShapeBox
   */
  static FromMesh(t) {
    const e = t.getBoundingInfo(), s = e.boundingBox.center, i = e.boundingBox.extendSize.scale(2);
    return new ee(s, B.Identity(), i, t.getScene());
  }
}
class fe extends te {
  /**
   *
   * @param mesh the mesh to be used as topology infos for the convex hull
   * @param scene scene to attach to
   */
  constructor(t, e) {
    super({ type: 4, parameters: { mesh: t } }, e);
  }
}
class me extends dt {
  /**
   * Creates a new InstancedMesh object from the mesh source.
   * @param name defines the name of the instance
   * @param source the mesh to create the instance from
   */
  constructor(t, e) {
    super(t, e.getScene()), this._indexInSourceMeshInstanceArray = -1, this._distanceToCamera = 0, e.addInstance(this), this._sourceMesh = e, this._unIndexed = e._unIndexed, this.position.copyFrom(e.position), this.rotation.copyFrom(e.rotation), this.scaling.copyFrom(e.scaling), e.rotationQuaternion && (this.rotationQuaternion = e.rotationQuaternion.clone()), this.animations = e.animations.slice();
    for (const s of e.getAnimationRanges())
      s != null && this.createAnimationRange(s.name, s.from, s.to);
    if (this.infiniteDistance = e.infiniteDistance, this.setPivotMatrix(e.getPivotMatrix()), !e.skeleton && !e.morphTargetManager && e.hasBoundingInfo) {
      const s = e.getBoundingInfo();
      this.buildBoundingInfo(s.minimum, s.maximum);
    } else
      this.refreshBoundingInfo(!0, !0);
    this._syncSubMeshes();
  }
  /**
   * @returns the string "InstancedMesh".
   */
  getClassName() {
    return "InstancedMesh";
  }
  /** Gets the list of lights affecting that mesh */
  get lightSources() {
    return this._sourceMesh._lightSources;
  }
  /** @internal */
  _resyncLightSources() {
  }
  /** @internal */
  _resyncLightSource() {
  }
  /** @internal */
  _removeLightSource() {
  }
  // Methods
  /**
   * If the source mesh receives shadows
   */
  get receiveShadows() {
    return this._sourceMesh.receiveShadows;
  }
  set receiveShadows(t) {
    var e;
    ((e = this._sourceMesh) == null ? void 0 : e.receiveShadows) !== t && F.Warn("Setting receiveShadows on an instanced mesh has no effect");
  }
  /**
   * The material of the source mesh
   */
  get material() {
    return this._sourceMesh.material;
  }
  set material(t) {
    var e;
    ((e = this._sourceMesh) == null ? void 0 : e.material) !== t && F.Warn("Setting material on an instanced mesh has no effect");
  }
  /**
   * Visibility of the source mesh
   */
  get visibility() {
    return this._sourceMesh.visibility;
  }
  set visibility(t) {
    var e;
    ((e = this._sourceMesh) == null ? void 0 : e.visibility) !== t && F.Warn("Setting visibility on an instanced mesh has no effect");
  }
  /**
   * Skeleton of the source mesh
   */
  get skeleton() {
    return this._sourceMesh.skeleton;
  }
  set skeleton(t) {
    var e;
    ((e = this._sourceMesh) == null ? void 0 : e.skeleton) !== t && F.Warn("Setting skeleton on an instanced mesh has no effect");
  }
  /**
   * Rendering ground id of the source mesh
   */
  get renderingGroupId() {
    return this._sourceMesh.renderingGroupId;
  }
  set renderingGroupId(t) {
    !this._sourceMesh || t === this._sourceMesh.renderingGroupId || F.Warn("Note - setting renderingGroupId of an instanced mesh has no effect on the scene");
  }
  /**
   * @returns the total number of vertices (integer).
   */
  getTotalVertices() {
    return this._sourceMesh ? this._sourceMesh.getTotalVertices() : 0;
  }
  /**
   * Returns a positive integer : the total number of indices in this mesh geometry.
   * @returns the number of indices or zero if the mesh has no geometry.
   */
  getTotalIndices() {
    return this._sourceMesh.getTotalIndices();
  }
  /**
   * The source mesh of the instance
   */
  get sourceMesh() {
    return this._sourceMesh;
  }
  /**
   * Gets the mesh internal Geometry object
   */
  get geometry() {
    return this._sourceMesh._geometry;
  }
  /**
   * Creates a new InstancedMesh object from the mesh model.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/instances
   * @param name defines the name of the new instance
   * @returns a new InstancedMesh
   */
  createInstance(t) {
    return this._sourceMesh.createInstance(t);
  }
  /**
   * Is this node ready to be used/rendered
   * @param completeCheck defines if a complete check (including materials and lights) has to be done (false by default)
   * @returns is it ready
   */
  isReady(t = !1) {
    return this._sourceMesh.isReady(t, !0);
  }
  /**
   * Returns an array of integers or a typed array (Int32Array, Uint32Array, Uint16Array) populated with the mesh indices.
   * @param kind kind of verticies to retrieve (eg. positions, normals, uvs, etc.)
   * @param copyWhenShared If true (default false) and and if the mesh geometry is shared among some other meshes, the returned array is a copy of the internal one.
   * @param forceCopy defines a boolean forcing the copy of the buffer no matter what the value of copyWhenShared is
   * @returns a float array or a Float32Array of the requested kind of data : positions, normals, uvs, etc.
   */
  getVerticesData(t, e, s) {
    return this._sourceMesh.getVerticesData(t, e, s);
  }
  /** @internal */
  copyVerticesData(t, e) {
    this._sourceMesh.copyVerticesData(t, e);
  }
  /** @internal */
  getVertexBuffer(t, e) {
    return this._sourceMesh.getVertexBuffer(t, e);
  }
  /**
   * Sets the vertex data of the mesh geometry for the requested `kind`.
   * If the mesh has no geometry, a new Geometry object is set to the mesh and then passed this vertex data.
   * The `data` are either a numeric array either a Float32Array.
   * The parameter `updatable` is passed as is to the underlying Geometry object constructor (if initially none) or updater.
   * The parameter `stride` is an optional positive integer, it is usually automatically deducted from the `kind` (3 for positions or normals, 2 for UV, etc).
   * Note that a new underlying VertexBuffer object is created each call.
   * If the `kind` is the `PositionKind`, the mesh BoundingInfo is renewed, so the bounding box and sphere, and the mesh World Matrix is recomputed.
   *
   * Possible `kind` values :
   * - VertexBuffer.PositionKind
   * - VertexBuffer.UVKind
   * - VertexBuffer.UV2Kind
   * - VertexBuffer.UV3Kind
   * - VertexBuffer.UV4Kind
   * - VertexBuffer.UV5Kind
   * - VertexBuffer.UV6Kind
   * - VertexBuffer.ColorKind
   * - VertexBuffer.MatricesIndicesKind
   * - VertexBuffer.MatricesIndicesExtraKind
   * - VertexBuffer.MatricesWeightsKind
   * - VertexBuffer.MatricesWeightsExtraKind
   *
   * Returns the Mesh.
   * @param kind defines vertex data kind
   * @param data defines the data source
   * @param updatable defines if the data must be flagged as updatable (false as default)
   * @param stride defines the vertex stride (optional)
   * @returns the current mesh
   */
  setVerticesData(t, e, s, i) {
    return this.sourceMesh && this.sourceMesh.setVerticesData(t, e, s, i), this.sourceMesh;
  }
  /**
   * Updates the existing vertex data of the mesh geometry for the requested `kind`.
   * If the mesh has no geometry, it is simply returned as it is.
   * The `data` are either a numeric array either a Float32Array.
   * No new underlying VertexBuffer object is created.
   * If the `kind` is the `PositionKind` and if `updateExtends` is true, the mesh BoundingInfo is renewed, so the bounding box and sphere, and the mesh World Matrix is recomputed.
   * If the parameter `makeItUnique` is true, a new global geometry is created from this positions and is set to the mesh.
   *
   * Possible `kind` values :
   * - VertexBuffer.PositionKind
   * - VertexBuffer.UVKind
   * - VertexBuffer.UV2Kind
   * - VertexBuffer.UV3Kind
   * - VertexBuffer.UV4Kind
   * - VertexBuffer.UV5Kind
   * - VertexBuffer.UV6Kind
   * - VertexBuffer.ColorKind
   * - VertexBuffer.MatricesIndicesKind
   * - VertexBuffer.MatricesIndicesExtraKind
   * - VertexBuffer.MatricesWeightsKind
   * - VertexBuffer.MatricesWeightsExtraKind
   *
   * Returns the Mesh.
   * @param kind defines vertex data kind
   * @param data defines the data source
   * @param updateExtends defines if extends info of the mesh must be updated (can be null). This is mostly useful for "position" kind
   * @param makeItUnique defines it the updated vertex buffer must be flagged as unique (false by default)
   * @returns the source mesh
   */
  updateVerticesData(t, e, s, i) {
    return this.sourceMesh && this.sourceMesh.updateVerticesData(t, e, s, i), this.sourceMesh;
  }
  /**
   * Sets the mesh indices.
   * Expects an array populated with integers or a typed array (Int32Array, Uint32Array, Uint16Array).
   * If the mesh has no geometry, a new Geometry object is created and set to the mesh.
   * This method creates a new index buffer each call.
   * Returns the Mesh.
   * @param indices the source data
   * @param totalVertices defines the total number of vertices referenced by indices (could be null)
   * @returns source mesh
   */
  setIndices(t, e = null) {
    return this.sourceMesh && this.sourceMesh.setIndices(t, e), this.sourceMesh;
  }
  /**
   * Boolean : True if the mesh owns the requested kind of data.
   * @param kind defines which buffer to check (positions, indices, normals, etc). Possible `kind` values :
   * - VertexBuffer.PositionKind
   * - VertexBuffer.UVKind
   * - VertexBuffer.UV2Kind
   * - VertexBuffer.UV3Kind
   * - VertexBuffer.UV4Kind
   * - VertexBuffer.UV5Kind
   * - VertexBuffer.UV6Kind
   * - VertexBuffer.ColorKind
   * - VertexBuffer.MatricesIndicesKind
   * - VertexBuffer.MatricesIndicesExtraKind
   * - VertexBuffer.MatricesWeightsKind
   * - VertexBuffer.MatricesWeightsExtraKind
   * @returns true if data kind is present
   */
  isVerticesDataPresent(t) {
    return this._sourceMesh.isVerticesDataPresent(t);
  }
  /**
   * @returns an array of indices (IndicesArray).
   */
  getIndices() {
    return this._sourceMesh.getIndices();
  }
  /** @internal */
  get _positions() {
    return this._sourceMesh._positions;
  }
  /** @internal */
  refreshBoundingInfo(t = !1, e = !1) {
    if (this.hasBoundingInfo && this.getBoundingInfo().isLocked)
      return this;
    let s;
    typeof t == "object" ? s = t : s = {
      applySkeleton: t,
      applyMorph: e
    };
    const i = this._sourceMesh.geometry ? this._sourceMesh.geometry.boundingBias : null;
    return this._refreshBoundingInfo(this._sourceMesh._getData(s, null, $t.PositionKind), i), this;
  }
  /** @internal */
  _preActivate() {
    return this._currentLOD && this._currentLOD._preActivate(), this;
  }
  /**
   * @internal
   */
  _activate(t, e) {
    if (super._activate(t, e), this._sourceMesh.subMeshes || F.Warn("Instances should only be created for meshes with geometry."), this._currentLOD) {
      if (this._currentLOD._getWorldMatrixDeterminant() >= 0 != this._getWorldMatrixDeterminant() >= 0)
        return this._internalAbstractMeshDataInfo._actAsRegularMesh = !0, !0;
      if (this._internalAbstractMeshDataInfo._actAsRegularMesh = !1, this._currentLOD._registerInstanceForRenderId(this, t), e) {
        if (!this._currentLOD._internalAbstractMeshDataInfo._isActiveIntermediate)
          return this._currentLOD._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = !0, !0;
      } else if (!this._currentLOD._internalAbstractMeshDataInfo._isActive)
        return this._currentLOD._internalAbstractMeshDataInfo._onlyForInstances = !0, !0;
    }
    return !1;
  }
  /** @internal */
  _postActivate() {
    this._sourceMesh.edgesShareWithInstances && this._sourceMesh._edgesRenderer && this._sourceMesh._edgesRenderer.isEnabled && this._sourceMesh._renderingGroup ? (this._sourceMesh._renderingGroup._edgesRenderers.pushNoDuplicate(this._sourceMesh._edgesRenderer), this._sourceMesh._edgesRenderer.customInstances.push(this.getWorldMatrix())) : this._edgesRenderer && this._edgesRenderer.isEnabled && this._sourceMesh._renderingGroup && this._sourceMesh._renderingGroup._edgesRenderers.push(this._edgesRenderer);
  }
  /** @internal */
  getWorldMatrix() {
    if (this._currentLOD && this._currentLOD !== this._sourceMesh && this._currentLOD.billboardMode !== rt.BILLBOARDMODE_NONE && this._currentLOD._masterMesh !== this) {
      this._billboardWorldMatrix || (this._billboardWorldMatrix = new at());
      const t = this._currentLOD._masterMesh;
      return this._currentLOD._masterMesh = this, b.Vector3[7].copyFrom(this._currentLOD.position), this._currentLOD.position.set(0, 0, 0), this._billboardWorldMatrix.copyFrom(this._currentLOD.computeWorldMatrix(!0)), this._currentLOD.position.copyFrom(b.Vector3[7]), this._currentLOD._masterMesh = t, this._billboardWorldMatrix;
    }
    return super.getWorldMatrix();
  }
  /** @internal */
  get isAnInstance() {
    return !0;
  }
  /**
   * Returns the current associated LOD AbstractMesh.
   * @param camera defines the camera to use to pick the LOD level
   * @returns a Mesh or `null` if no LOD is associated with the AbstractMesh
   */
  getLOD(t) {
    if (!t)
      return this;
    const e = this.sourceMesh.getLODLevels();
    if (!e || e.length === 0)
      this._currentLOD = this.sourceMesh;
    else {
      const s = this.getBoundingInfo();
      this._currentLOD = this.sourceMesh.getLOD(t, s.boundingSphere);
    }
    return this._currentLOD;
  }
  /**
   * @internal
   */
  _preActivateForIntermediateRendering(t) {
    return this.sourceMesh._preActivateForIntermediateRendering(t);
  }
  /** @internal */
  _syncSubMeshes() {
    if (this.releaseSubMeshes(), this._sourceMesh.subMeshes)
      for (let t = 0; t < this._sourceMesh.subMeshes.length; t++)
        this._sourceMesh.subMeshes[t].clone(this, this._sourceMesh);
    return this;
  }
  /** @internal */
  _generatePointsArray() {
    return this._sourceMesh._generatePointsArray();
  }
  /** @internal */
  _updateBoundingInfo() {
    return this.hasBoundingInfo ? this.getBoundingInfo().update(this.worldMatrixFromCache) : this.buildBoundingInfo(this.absolutePosition, this.absolutePosition, this.worldMatrixFromCache), this._updateSubMeshesBoundingInfo(this.worldMatrixFromCache), this;
  }
  /**
   * Creates a new InstancedMesh from the current mesh.
   *
   * Returns the clone.
   * @param name the cloned mesh name
   * @param newParent the optional Node to parent the clone to.
   * @param doNotCloneChildren if `true` the model children aren't cloned.
   * @param newSourceMesh if set this mesh will be used as the source mesh instead of ths instance's one
   * @returns the clone
   */
  clone(t, e = null, s, i) {
    const n = (i || this._sourceMesh).createInstance(t);
    if (rs.DeepCopy(this, n, [
      "name",
      "subMeshes",
      "uniqueId",
      "parent",
      "lightSources",
      "receiveShadows",
      "material",
      "visibility",
      "skeleton",
      "sourceMesh",
      "isAnInstance",
      "facetNb",
      "isFacetDataEnabled",
      "isBlocked",
      "useBones",
      "hasInstances",
      "collider",
      "edgesRenderer",
      "forward",
      "up",
      "right",
      "absolutePosition",
      "absoluteScaling",
      "absoluteRotationQuaternion",
      "isWorldMatrixFrozen",
      "nonUniformScaling",
      "behaviors",
      "worldMatrixFromCache",
      "hasThinInstances",
      "hasBoundingInfo",
      "geometry"
    ], []), e && (n.parent = e), !s)
      for (let r = 0; r < this.getScene().meshes.length; r++) {
        const a = this.getScene().meshes[r];
        a.parent === this && a.clone(a.name, n);
      }
    return n.computeWorldMatrix(!0), this.onClonedObservable.notifyObservers(n), n;
  }
  /**
   * Disposes the InstancedMesh.
   * Returns nothing.
   * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
   * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
   */
  dispose(t, e = !1) {
    this._sourceMesh.removeInstance(this), super.dispose(t, e);
  }
  /**
   * @internal
   */
  _serializeAsParent(t) {
    super._serializeAsParent(t), t.parentId = this._sourceMesh.uniqueId, t.parentInstanceIndex = this._indexInSourceMeshInstanceArray;
  }
  /**
   * Instantiate (when possible) or clone that node with its hierarchy
   * @param newParent defines the new parent to use for the instance (or clone)
   * @param options defines options to configure how copy is done
   * @param onNewNodeCreated defines an option callback to call when a clone or an instance is created
   * @returns an instance (or a clone) of the current node with its hierarchy
   */
  instantiateHierarchy(t = null, e, s) {
    const i = this.clone("Clone of " + (this.name || this.id), t || this.parent, !0, e && e.newSourcedMesh);
    i && s && s(this, i);
    for (const n of this.getChildTransformNodes(!0))
      n.instantiateHierarchy(i, e, s);
    return i;
  }
}
class Ss {
  /**
   * Constructor of the mesh accumulator
   * @param mesh - The mesh used to compute the world matrix.
   * @param collectIndices - use mesh indices
   * @param scene - The scene used to determine the right handed system.
   *
   * Merge mesh and its children so whole hierarchy can be used as a mesh shape or convex hull
   */
  constructor(t, e, s) {
    this._vertices = [], this._indices = [], this._isRightHanded = s.useRightHandedSystem, this._collectIndices = e;
  }
  /**
   * Adds a mesh to the physics engine.
   * @param mesh The mesh to add.
   * @param includeChildren Whether to include the children of the mesh.
   *
   * This method adds a mesh to the physics engine by computing the world matrix,
   * multiplying it with the body from world matrix, and then transforming the
   * coordinates of the mesh's vertices. It also adds the indices of the mesh
   * to the physics engine. If includeChildren is true, it will also add the
   * children of the mesh to the physics engine, ignoring any children which
   * have a physics impostor. This is useful for creating a physics engine
   * that accurately reflects the mesh and its children.
   */
  addNodeMeshes(t, e) {
    t.computeWorldMatrix(!0);
    const s = b.Matrix[0];
    if (at.ScalingToRef(t.absoluteScaling.x, t.absoluteScaling.y, t.absoluteScaling.z, s), t instanceof ct ? this._addMesh(t, s) : t instanceof me && this._addMesh(t.sourceMesh, s), e) {
      const i = b.Matrix[1];
      t.computeWorldMatrix().invertToRef(i);
      const n = b.Matrix[2];
      i.multiplyToRef(s, n);
      const a = t.getChildMeshes(!1).filter((l) => !l.physicsBody);
      for (const l of a) {
        const c = l.computeWorldMatrix(), h = b.Matrix[3];
        c.multiplyToRef(n, h), l instanceof ct ? this._addMesh(l, h) : l instanceof me && this._addMesh(l.sourceMesh, h);
      }
    }
  }
  _addMesh(t, e) {
    const s = t.getVerticesData($t.PositionKind) || [], i = s.length / 3, n = this._vertices.length;
    for (let r = 0; r < i; r++) {
      const a = new _(s[r * 3 + 0], s[r * 3 + 1], s[r * 3 + 2]);
      this._vertices.push(_.TransformCoordinates(a, e));
    }
    if (this._collectIndices) {
      const r = t.getIndices();
      if (r)
        for (let a = 0; a < r.length; a += 3)
          this._isRightHanded ? (this._indices.push(r[a + 0] + n), this._indices.push(r[a + 1] + n), this._indices.push(r[a + 2] + n)) : (this._indices.push(r[a + 2] + n), this._indices.push(r[a + 1] + n), this._indices.push(r[a + 0] + n));
    }
  }
  /**
   * Allocate and populate the vertex positions inside the physics plugin.
   *
   * @param plugin - The plugin to allocate the memory in.
   * @returns An array of floats, whose backing memory is inside the plugin. The array contains the
   * positions of the mesh vertices, where a position is defined by three floats. You must call
   * freeBuffer() on the returned array once you have finished with it, in order to free the
   * memory inside the plugin..
   */
  getVertices(t) {
    const e = this._vertices.length * 3, i = e * 4, n = t._malloc(i), r = new Float32Array(t.HEAPU8.buffer, n, e);
    for (let a = 0; a < this._vertices.length; a++)
      r[a * 3 + 0] = this._vertices[a].x, r[a * 3 + 1] = this._vertices[a].y, r[a * 3 + 2] = this._vertices[a].z;
    return { offset: n, numObjects: e };
  }
  /**
   * Releases a buffer allocated in the physics plugin.
   * @param plugin - The plugin that owns the allocation.
   * @param arr - The plugin memory reference to release.
   */
  freeBuffer(t, e) {
    t._free(e.offset);
  }
  /**
   * Allocate and populate the triangle indices inside the physics plugin
   *
   * @param plugin - The plugin to allocate the memory in.
   * @returns A new Int32Array, whose backing memory is inside the plugin. The array contains the indices
   * of the triangle positions, where a single triangle is defined by three indices. You must call
   * freeBuffer() on this array once you have finished with it, to free the memory inside the plugin..
   */
  getTriangles(t) {
    const s = this._indices.length * 4, i = t._malloc(s), n = new Int32Array(t.HEAPU8.buffer, i, this._indices.length);
    for (let r = 0; r < this._indices.length; r++)
      n[r] = this._indices[r];
    return { offset: i, numObjects: this._indices.length };
  }
}
class ye {
  constructor(t) {
    this.hpBodyId = t, this.userMassProps = { centerOfMass: void 0, mass: void 0, inertia: void 0, inertiaOrientation: void 0 };
  }
}
class Me {
  constructor() {
    this.bodyId = BigInt(0), this.position = new _(), this.normal = new _();
  }
}
class Ie {
  constructor() {
    this.contactOnA = new Me(), this.contactOnB = new Me(), this.impulseApplied = 0, this.type = 0;
  }
  /**
   * Reads a collision event from Havok memory into an existing event object.
   * @param buffer - The Havok memory buffer to read from.
   * @param offset - The byte offset of the event data.
   * @param eventOut - The collision event object to update.
   */
  static readToRef(t, e, s) {
    const i = new Int32Array(t, e), n = new Float32Array(t, e), r = 2;
    s.contactOnA.bodyId = BigInt(i[r]), s.contactOnA.position.set(n[r + 8], n[r + 9], n[r + 10]), s.contactOnA.normal.set(n[r + 11], n[r + 12], n[r + 13]);
    const a = 18;
    s.contactOnB.bodyId = BigInt(i[a]), s.contactOnB.position.set(n[a + 8], n[a + 9], n[a + 10]), s.contactOnB.normal.set(n[a + 11], n[a + 12], n[a + 13]), s.impulseApplied = n[a + 13 + 3], s.type = i[0];
  }
}
class Ae {
  constructor() {
    this.bodyIdA = BigInt(0), this.bodyIdB = BigInt(0), this.type = 0;
  }
  /**
   * Reads a trigger event from Havok memory into an existing event object.
   * @param buffer - The Havok memory buffer to read from.
   * @param offset - The byte offset of the event data.
   * @param eventOut - The trigger event object to update.
   */
  static readToRef(t, e, s) {
    const i = new Int32Array(t, e);
    s.type = i[0], s.bodyIdA = BigInt(i[2]), s.bodyIdB = BigInt(i[6]);
  }
}
class xs {
  /**
   * Finds an existing world region that contains the given world position,
   * or creates a new world region centered at that position.
   *
   * When floatingOriginMode is enabled, we use multiple Havok worlds to maintain
   * float32 precision across a large world. Each world region has its own fixed
   * floating origin, and bodies within that region are simulated relative to it.
   *
   * @param worldPosition - The world position of the body being created
   * @returns The world region to use for this body
   */
  _getOrCreateWorldRegion(t) {
    const e = It.getScene();
    if (!(e != null && e.floatingOriginMode))
      return this._worldRegions[0];
    for (const n of this._worldRegions)
      if (_.Distance(t, n.floatingOrigin) <= this._floatingOriginWorldRadius)
        return n;
    const s = this._hknp.HP_World_Create()[1];
    this._hknp.HP_World_SetGravity(s, this._currentGravity), this._hknp.HP_World_SetSpeedLimit(s, this.getMaxLinearVelocity(), this.getMaxAngularVelocity());
    const i = {
      world: s,
      floatingOrigin: t.clone(),
      gravity: [...this._currentGravity]
    };
    return this._worldRegions.push(i), i;
  }
  /**
   * Checks if a body's world position has left its current region and, if so,
   * moves it to the correct region (existing or newly created).
   * This preserves linear and angular velocity across the transition.
   *
   * @param pluginData - The plugin data for the body (or instance) to check
   */
  _reRegionBodyPluginData(t) {
    const e = t.worldRegion;
    if (!e)
      return;
    const s = this._hknp.HP_Body_GetQTransform(t.hpBodyId)[1], i = s[0], n = s[1], r = b.Vector3[2];
    if (r.set(i[0] + e.floatingOrigin._x, i[1] + e.floatingOrigin._y, i[2] + e.floatingOrigin._z), _.Distance(r, e.floatingOrigin) <= this._floatingOriginWorldRadius * 1.2)
      return;
    const l = this._hknp.HP_Body_GetLinearVelocity(t.hpBodyId)[1], c = this._hknp.HP_Body_GetAngularVelocity(t.hpBodyId)[1], h = b.Vector3[3];
    h.set(r._x + l[0], r._y + l[1], r._z + l[2]);
    let d = this._findExistingRegion(h);
    if ((!d || d === e) && (d = this._findExistingRegion(r)), (!d || d === e) && (d = this._getOrCreateWorldRegion(r)), d === e)
      return;
    this._hknp.HP_World_RemoveBody(e.world, t.hpBodyId);
    const p = d.floatingOrigin, u = [r._x - p._x, r._y - p._y, r._z - p._z];
    this._hknp.HP_Body_SetQTransform(t.hpBodyId, [u, n]), this._hknp.HP_World_AddBody(d.world, t.hpBodyId, !1), this._hknp.HP_Body_SetLinearVelocity(t.hpBodyId, l), this._hknp.HP_Body_SetAngularVelocity(t.hpBodyId, c), t.worldRegion = d, t.worldTransformOffset = this._hknp.HP_Body_GetWorldTransformOffset(t.hpBodyId)[1], this._releaseWorldRegionIfEmpty(e);
  }
  /**
   * Searches existing world regions for one that contains the given position.
   * @param worldPosition - The world position to find a region for
   * @returns null if no existing region contains it (does NOT create a new one).
   */
  _findExistingRegion(t) {
    const e = It.getScene();
    if (!(e != null && e.floatingOriginMode))
      return this._worldRegions[0];
    for (const s of this._worldRegions)
      if (_.Distance(t, s.floatingOrigin) <= this._floatingOriginWorldRadius)
        return s;
    return null;
  }
  /**
   * Releases a non-default world region when it no longer contains any bodies.
   * @param worldRegion - The world region to release if empty
   */
  _releaseWorldRegionIfEmpty(t) {
    const e = this._worldRegions.indexOf(t);
    e <= 0 || this._hknp.HP_World_GetNumBodies(t.world)[1] !== 0 || (this._hknp.HP_World_Release(t.world), this._worldRegions.splice(e, 1));
  }
  /**
   * Releases world regions that became candidates for removal while bodies were being removed.
   * This must run after collision and trigger notifications to avoid releasing a world while its native events are being read.
   */
  _releasePendingWorldRegions() {
    for (const t of this._worldRegionsPendingRelease)
      this._releaseWorldRegionIfEmpty(t);
    this._worldRegionsPendingRelease.clear();
  }
  constructor(t = !0, e = HK, s = {}) {
    if (this._useDeltaForWorldStep = t, this._hknp = {}, this.name = "HavokPlugin", this._multiQueryCollector = void 0, this._fixedTimeStep = 1 / 60, this._maxQueryCollectorHits = 1, this._tmpVec3 = as(3, _.Zero), this._bodies = /* @__PURE__ */ new Map(), this._shapes = /* @__PURE__ */ new Map(), this._bodyCollisionObservable = /* @__PURE__ */ new Map(), this._constraintToBodyIdPair = /* @__PURE__ */ new Map(), this._bodyCollisionEndedObservable = /* @__PURE__ */ new Map(), this._worldRegions = [], this._worldRegionsPendingRelease = /* @__PURE__ */ new Set(), this._currentGravity = [0, -9.81, 0], this._floatingOriginWorldRadius = 1e5, this.onCollisionObservable = new tt(), this.onCollisionEndedObservable = new tt(), this.onTriggerCollisionObservable = new tt(), typeof e == "function") {
      F.Error("Havok is not ready. Please make sure you await HK() before using the plugin.");
      return;
    } else
      this._hknp = e;
    if (!this.isSupported()) {
      F.Error("Havok is not available. Please make sure you included the js file.");
      return;
    }
    this.world = this._hknp.HP_World_Create()[1], this._worldRegions.push({
      world: this.world,
      floatingOrigin: _.Zero(),
      gravity: [...this._currentGravity]
    }), this._queryCollector = this._hknp.HP_QueryCollector_Create(1)[1], this.setMaxQueryCollectorHits(s.maxQueryCollectorHits ?? 1), this._floatingOriginWorldRadius = s.floatingOriginWorldRadius ?? 1e5;
  }
  /**
   * If this plugin is supported
   * @returns true if its supported
   */
  isSupported() {
    return this._hknp !== void 0;
  }
  /**
   * Sets the gravity of the physics world.
   *
   * @param gravity - The gravity vector to set.
   * @param worldPosition - Optional world position to specify which region's gravity to set.
   *                        If provided, only the region containing this position will be updated.
   *                        If not provided, all regions will be updated (default behavior).
   *                        This is useful for planetary scenarios where gravity direction varies by location.
   */
  setGravity(t, e) {
    const s = this._bVecToV3(t);
    if (e) {
      const i = this._getOrCreateWorldRegion(e);
      i.gravity = s, this._hknp.HP_World_SetGravity(i.world, s);
    } else {
      this._currentGravity = s;
      for (const i of this._worldRegions)
        i.gravity = s, this._hknp.HP_World_SetGravity(i.world, s);
    }
  }
  /**
   * Gets the gravity of the physics world or a specific region.
   *
   * @param worldPosition - Optional world position to get the gravity for that region.
   *                        If not provided, returns the default gravity.
   * @returns The gravity vector.
   */
  getGravity(t) {
    if (t) {
      const e = this._getOrCreateWorldRegion(t);
      return new _(e.gravity[0], e.gravity[1], e.gravity[2]);
    }
    return new _(this._currentGravity[0], this._currentGravity[1], this._currentGravity[2]);
  }
  /**
   * Sets the fixed time step for the physics engine.
   *
   * @param timeStep - The fixed time step to use for the physics engine.
   *
   */
  setTimeStep(t) {
    this._fixedTimeStep = t;
  }
  /**
   * Gets the fixed time step used by the physics engine.
   *
   * @returns The fixed time step used by the physics engine.
   *
   */
  getTimeStep() {
    return this._fixedTimeStep;
  }
  /**
   * Sets the maximum number of raycast hits to process.
   *
   * @param maxQueryCollectorHits - The maximum number of raycast hits to process.
   */
  setMaxQueryCollectorHits(t) {
    t !== this._maxQueryCollectorHits && (this._multiQueryCollector && (this._hknp.HP_QueryCollector_Release(this._multiQueryCollector), this._multiQueryCollector = void 0), t > 1 && (this._multiQueryCollector = this._hknp.HP_QueryCollector_Create(t)[1]));
  }
  /**
   * Gets the maximum number of raycast hits to process.
   *
   * @returns The maximum number of raycast hits to process.
   */
  getMaxQueryCollectorHits() {
    return this._maxQueryCollectorHits;
  }
  /**
   * Executes a single step of the physics engine.
   *
   * @param delta The time delta in seconds since the last step.
   * @param physicsBodies An array of physics bodies to be simulated.
   *
   * This method is useful for simulating the physics engine. It sets the physics body transformation,
   * steps the world, syncs the physics body, and notifies collisions. This allows for the physics engine
   * to accurately simulate the physics bodies in the world.
   */
  executeStep(t, e) {
    var i;
    if (this._worldRegions.length > 1 || (i = It.getScene()) != null && i.floatingOriginMode)
      for (const n of e)
        if (n._pluginDataInstances.length > 0)
          for (const r of n._pluginDataInstances)
            this._reRegionBodyPluginData(r);
        else
          n._pluginData && this._reRegionBodyPluginData(n._pluginData);
    for (const n of e)
      n.disablePreStep || this.setPhysicsBodyTransformation(n, n.transformNode);
    const s = this._useDeltaForWorldStep ? t : this._fixedTimeStep;
    for (const n of this._worldRegions)
      this._hknp.HP_World_SetIdealStepTime(n.world, s), this._hknp.HP_World_Step(n.world, s);
    for (const n of e)
      n.disableSync || this.sync(n);
    for (const n of this._worldRegions)
      this._notifyCollisions(n.world), this._notifyTriggers(n.world);
    this._releasePendingWorldRegions();
  }
  /**
   * Returns the version of the physics engine plugin.
   *
   * @returns The version of the physics engine plugin.
   *
   * This method is useful for determining the version of the physics engine plugin that is currently running.
   */
  getPluginVersion() {
    return 2;
  }
  /**
   * Set the maximum allowed linear and angular velocities
   * @param maxLinearVelocity maximum allowed linear velocity
   * @param maxAngularVelocity maximum allowed angular velocity
   */
  setVelocityLimits(t, e) {
    for (const s of this._worldRegions)
      this._hknp.HP_World_SetSpeedLimit(s.world, t, e);
  }
  /**
   * @returns maximum allowed linear velocity
   */
  getMaxLinearVelocity() {
    return this._hknp.HP_World_GetSpeedLimit(this.world)[1];
  }
  /**
   * @returns maximum allowed angular velocity
   */
  getMaxAngularVelocity() {
    return this._hknp.HP_World_GetSpeedLimit(this.world)[2];
  }
  /**
   * Initializes a physics body with the given position and orientation.
   *
   * @param body - The physics body to initialize.
   * @param motionType - The motion type of the body.
   * @param position - The position of the body.
   * @param orientation - The orientation of the body.
   * This code is useful for initializing a physics body with the given position and orientation.
   * It creates a plugin data for the body and adds it to the world. It then converts the position
   * and orientation to a transform and sets the body's transform to the given values.
   */
  initBody(t, e, s, i) {
    t._pluginData = new ye(this._hknp.HP_Body_Create()[1]), this._internalSetMotionType(t._pluginData, e);
    const n = this._getOrCreateWorldRegion(s);
    t._pluginData.worldRegion = n;
    const r = n.floatingOrigin, a = [[s._x - r._x, s._y - r._y, s._z - r._z], this._bQuatToV4(i)];
    this._hknp.HP_Body_SetQTransform(t._pluginData.hpBodyId, a), this._hknp.HP_World_AddBody(n.world, t._pluginData.hpBodyId, t.startAsleep), this._bodies.set(t._pluginData.hpBodyId[0], { body: t, index: 0 });
  }
  /**
   * Removes a body from the world. To dispose of a body, it is necessary to remove it from the world first.
   *
   * @param body - The body to remove.
   */
  removeBody(t) {
    if (t._pluginDataInstances && t._pluginDataInstances.length > 0)
      for (const e of t._pluginDataInstances)
        this._bodyCollisionObservable.delete(e.hpBodyId[0]), this._hknp.HP_World_RemoveBody(e.worldRegion.world, e.hpBodyId), this._bodies.delete(e.hpBodyId[0]), this._worldRegionsPendingRelease.add(e.worldRegion);
    t._pluginData && (this._bodyCollisionObservable.delete(t._pluginData.hpBodyId[0]), this._hknp.HP_World_RemoveBody(t._pluginData.worldRegion.world, t._pluginData.hpBodyId), this._bodies.delete(t._pluginData.hpBodyId[0]), this._worldRegionsPendingRelease.add(t._pluginData.worldRegion));
  }
  /**
   * Initializes the body instances for a given physics body and mesh.
   *
   * @param body - The physics body to initialize.
   * @param motionType - How the body will be handled by the engine
   * @param mesh - The mesh to initialize.
   *
   * This code is useful for creating a physics body from a mesh. It creates a
   * body instance for each instance of the mesh and adds it to the world. It also
   * sets the position of the body instance to the position of the mesh instance.
   * This allows for the physics engine to accurately simulate the mesh in the
   * world.
   */
  initBodyInstances(t, e, s) {
    var r;
    const i = ((r = s._thinInstanceDataStorage) == null ? void 0 : r.instancesCount) ?? 0, n = s._thinInstanceDataStorage.matrixData;
    if (n) {
      this._createOrUpdateBodyInstances(t, e, n, 0, i, !1);
      for (let a = 0; a < t._pluginDataInstances.length; a++) {
        const l = t._pluginDataInstances[a];
        this._bodies.set(l.hpBodyId[0], { body: t, index: a });
      }
    }
  }
  _createOrUpdateBodyInstances(t, e, s, i, n, r) {
    const a = b.Quaternion[0], l = at.Identity(), c = b.Vector3[0];
    for (let h = i; h < n; h++) {
      c.set(s[h * 16 + 12], s[h * 16 + 13], s[h * 16 + 14]);
      let d, p;
      r ? (p = t._pluginDataInstances[h], d = p.hpBodyId) : (d = this._hknp.HP_Body_Create()[1], p = new ye(d), t._pluginDataInstances.length && (p.userMassProps = t._pluginDataInstances[0].userMassProps));
      const u = this._getOrCreateWorldRegion(c), g = u.floatingOrigin, I = [c._x - g._x, c._y - g._y, c._z - g._z];
      l.setRowFromFloats(0, s[h * 16 + 0], s[h * 16 + 1], s[h * 16 + 2], 0), l.setRowFromFloats(1, s[h * 16 + 4], s[h * 16 + 5], s[h * 16 + 6], 0), l.setRowFromFloats(2, s[h * 16 + 8], s[h * 16 + 9], s[h * 16 + 10], 0), B.FromRotationMatrixToRef(l, a);
      const y = [I, [a.x, a.y, a.z, a.w]];
      this._hknp.HP_Body_SetQTransform(d, y), r || (this._internalSetMotionType(p, e), this._internalUpdateMassProperties(p), t._pluginDataInstances.push(p), p.worldRegion = u, this._hknp.HP_World_AddBody(u.world, d, t.startAsleep), p.worldTransformOffset = this._hknp.HP_Body_GetWorldTransformOffset(d)[1]);
    }
  }
  /**
   * Update the internal body instances for a given physics body to match the instances in a mesh.
   * @param body the body that will be updated
   * @param mesh the mesh with reference instances
   */
  updateBodyInstances(t, e) {
    var a, l;
    const s = ((a = e._thinInstanceDataStorage) == null ? void 0 : a.instancesCount) ?? 0, i = e._thinInstanceDataStorage.matrixData;
    if (!i)
      return;
    const n = t._pluginDataInstances.length, r = this.getMotionType(t);
    if (s > n) {
      this._createOrUpdateBodyInstances(t, r, i, n, s, !1);
      const c = this._hknp.HP_Body_GetShape(t._pluginDataInstances[0].hpBodyId)[1];
      c[0] || (c[0] = (l = t.shape) == null ? void 0 : l._pluginData[0]);
      for (let h = n; h < s; h++)
        this._hknp.HP_Body_SetShape(t._pluginDataInstances[h].hpBodyId, c), this._internalUpdateMassProperties(t._pluginDataInstances[h]), this._bodies.set(t._pluginDataInstances[h].hpBodyId[0], { body: t, index: h });
    } else if (s < n) {
      const c = n - s;
      for (let h = 0; h < c; h++) {
        const d = t._pluginDataInstances.pop();
        this._bodies.delete(d.hpBodyId[0]), this._hknp.HP_World_RemoveBody(d.worldRegion.world, d.hpBodyId), this._worldRegionsPendingRelease.add(d.worldRegion), this._hknp.HP_Body_Release(d.hpBodyId);
      }
      this._createOrUpdateBodyInstances(t, r, i, 0, s, !0);
    }
  }
  /**
   * Synchronizes the transform of a physics body with its transform node.
   * @param body - The physics body to synchronize.
   *
   * This function is useful for keeping the physics body's transform in sync with its transform node.
   * This is important for ensuring that the physics body is accurately represented in the physics engine.
   */
  sync(t) {
    this.syncTransform(t, t.transformNode);
  }
  /**
   * Synchronizes the transform of a physics body with the transform of its
   * corresponding transform node.
   *
   * @param body - The physics body to synchronize.
   * @param transformNode - The destination Transform Node.
   *
   * This code is useful for synchronizing the position and orientation of a
   * physics body with the position and orientation of its corresponding
   * transform node. This is important for ensuring that the physics body and
   * the transform node are in the same position and orientation in the scene.
   * This is necessary for the physics engine to accurately simulate the
   * physical behavior of the body.
   */
  syncTransform(t, e) {
    var s;
    if (t._pluginDataInstances.length) {
      const i = e, n = i._thinInstanceDataStorage.matrixData;
      if (!n)
        return;
      const r = t._pluginDataInstances.length;
      for (let a = 0; a < r; a++) {
        const l = t._pluginDataInstances[a], c = l.worldRegion.floatingOrigin, h = this._hknp.HP_World_GetBodyBuffer(l.worldRegion.world)[1], d = l.worldTransformOffset, p = new Float32Array(this._hknp.HEAPU8.buffer, h + d, 16), u = a * 16;
        for (let g = 0; g < 15; g++)
          (g & 3) != 3 && (n[u + g] = p[g]);
        n[u + 12] += c._x, n[u + 13] += c._y, n[u + 14] += c._z, n[u + 15] = 1;
      }
      i.thinInstanceBufferUpdated("matrix");
    } else
      try {
        const i = this._hknp.HP_Body_GetQTransform(t._pluginData.hpBodyId)[1], n = i[0], r = i[1], a = b.Quaternion[0], l = t._pluginData.worldRegion.floatingOrigin;
        a.set(r[0], r[1], r[2], r[3]);
        const c = n[0] + l._x, h = n[1] + l._y, d = n[2] + l._z, p = e.parent;
        if (p && !p.getWorldMatrix().isIdentity()) {
          p.computeWorldMatrix(!0), b.Vector3[1].copyFrom(e.scaling), a.normalize();
          const u = b.Matrix[0], g = b.Vector3[0];
          g.copyFromFloats(c, h, d), at.ComposeToRef(e.absoluteScaling, a, g, u);
          const I = b.Matrix[1];
          p.getWorldMatrix().invertToRef(I);
          const y = b.Matrix[2];
          u.multiplyToRef(I, y), y.decomposeToTransformNode(e), (s = e.rotationQuaternion) == null || s.normalize(), e.scaling.copyFrom(b.Vector3[1]);
        } else
          e.position.set(c, h, d), e.rotationQuaternion ? e.rotationQuaternion.copyFrom(a) : a.toEulerAnglesToRef(e.rotation);
      } catch (i) {
        F.Error(`Syncing transform failed for node ${e.name}: ${i.message}...`);
      }
  }
  /**
   * Sets the shape of a physics body.
   * @param body - The physics body to set the shape for.
   * @param shape - The physics shape to set.
   *
   * This function is used to set the shape of a physics body. It is useful for
   * creating a physics body with a specific shape, such as a box or a sphere,
   * which can then be used to simulate physical interactions in a physics engine.
   * This function is especially useful for meshes with multiple instances, as it
   * will set the shape for each instance of the mesh.
   */
  setShape(t, e) {
    var r, a;
    const s = e && e._pluginData ? e._pluginData : BigInt(0);
    if (!(t.transformNode instanceof ct) || !((r = t.transformNode._thinInstanceDataStorage) != null && r.matrixData)) {
      this._hknp.HP_Body_SetShape(t._pluginData.hpBodyId, s), this._internalUpdateMassProperties(t._pluginData);
      return;
    }
    const n = ((a = t.transformNode._thinInstanceDataStorage) == null ? void 0 : a.instancesCount) ?? 0;
    for (let l = 0; l < n; l++)
      this._hknp.HP_Body_SetShape(t._pluginDataInstances[l].hpBodyId, s), this._internalUpdateMassProperties(t._pluginDataInstances[l]);
  }
  /**
   * Returns a reference to the first instance of the plugin data for a physics body.
   * @param body
   * @param instanceIndex
   * @returns a reference to the first instance
   */
  _getPluginReference(t, e) {
    var s;
    return (s = t._pluginDataInstances) != null && s.length ? t._pluginDataInstances[e ?? 0] : t._pluginData;
  }
  /**
   * Gets the shape of a physics body. This will create a new shape object
   *
   * @param body - The physics body.
   * @returns The shape of the physics body.
   *
   */
  getShape(t) {
    const e = this._getPluginReference(t), s = this._hknp.HP_Body_GetShape(e.hpBodyId)[1];
    if (s != 0) {
      const i = t.transformNode.getScene();
      return new te({ pluginData: s }, i);
    }
    return null;
  }
  /**
   * Gets the type of a physics shape.
   * @param shape - The physics shape to get the type for.
   * @returns The type of the physics shape.
   *
   */
  getShapeType(t) {
    return t.type ? t.type : this._hknp.HP_Shape_GetType(t._pluginData);
  }
  /**
   * Sets the event mask of a physics body.
   * @param body - The physics body to set the event mask for.
   * @param eventMask - The event mask to set.
   * @param instanceIndex - The index of the instance to set the event mask for
   *
   * This function is useful for setting the event mask of a physics body, which is used to determine which events the body will respond to. This is important for ensuring that the physics engine is able to accurately simulate the behavior of the body in the game world.
   */
  setEventMask(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_SetEventMask(i.hpBodyId, e);
    }, s);
  }
  /**
   * Retrieves the event mask of a physics body.
   *
   * @param body - The physics body to retrieve the event mask from.
   * @param instanceIndex - The index of the instance to retrieve the event mask from.
   * @returns The event mask of the physics body.
   *
   */
  getEventMask(t, e) {
    const s = this._getPluginReference(t, e);
    return this._hknp.HP_Body_GetEventMask(s.hpBodyId)[1];
  }
  _fromMassPropertiesTuple(t) {
    return {
      centerOfMass: _.FromArray(t[0]),
      mass: t[1],
      inertia: _.FromArray(t[2]),
      inertiaOrientation: B.FromArray(t[3])
    };
  }
  _internalUpdateMassProperties(t) {
    const e = this._internalComputeMassProperties(t), s = t.userMassProps;
    s.centerOfMass && (e[0] = s.centerOfMass.asArray()), s.mass != null && (e[1] = s.mass), s.inertia && (e[2] = s.inertia.asArray()), s.inertiaOrientation && (e[3] = s.inertiaOrientation.asArray()), this._hknp.HP_Body_SetMassProperties(t.hpBodyId, e);
  }
  _internalSetMotionType(t, e) {
    switch (e) {
      case 0:
        this._hknp.HP_Body_SetMotionType(t.hpBodyId, this._hknp.MotionType.STATIC);
        break;
      case 1:
        this._hknp.HP_Body_SetMotionType(t.hpBodyId, this._hknp.MotionType.KINEMATIC);
        break;
      case 2:
        this._hknp.HP_Body_SetMotionType(t.hpBodyId, this._hknp.MotionType.DYNAMIC);
        break;
    }
  }
  /**
   * sets the motion type of a physics body.
   * @param body - The physics body to set the motion type for.
   * @param motionType - The motion type to set.
   * @param instanceIndex - The index of the instance to set the motion type for. If undefined, the motion type of all the bodies will be set.
   */
  setMotionType(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._internalSetMotionType(i, e);
    }, s);
  }
  /**
   * Gets the motion type of a physics body.
   * @param body - The physics body to get the motion type from.
   * @param instanceIndex - The index of the instance to get the motion type from. If not specified, the motion type of the first instance will be returned.
   * @returns The motion type of the physics body.
   */
  getMotionType(t, e) {
    const s = this._getPluginReference(t, e), i = this._hknp.HP_Body_GetMotionType(s.hpBodyId)[1];
    switch (i) {
      case this._hknp.MotionType.STATIC:
        return 0;
      case this._hknp.MotionType.KINEMATIC:
        return 1;
      case this._hknp.MotionType.DYNAMIC:
        return 2;
    }
    throw new Error("Unknown motion type: " + i);
  }
  /**
   * sets the activation control mode of a physics body, for instance if you need the body to never sleep.
   * @param body - The physics body to set the activation control mode.
   * @param controlMode - The activation control mode.
   */
  setActivationControl(t, e) {
    switch (e) {
      case 1:
        this._hknp.HP_Body_SetActivationControl(t._pluginData.hpBodyId, this._hknp.ActivationControl.ALWAYS_ACTIVE);
        break;
      case 2:
        this._hknp.HP_Body_SetActivationControl(t._pluginData.hpBodyId, this._hknp.ActivationControl.ALWAYS_INACTIVE);
        break;
      case 0:
        this._hknp.HP_Body_SetActivationControl(t._pluginData.hpBodyId, this._hknp.ActivationControl.SIMULATION_CONTROLLED);
        break;
    }
  }
  _internalComputeMassProperties(t) {
    const e = this._hknp.HP_Body_GetShape(t.hpBodyId);
    if (e[0] == this._hknp.Result.RESULT_OK) {
      const s = this._hknp.HP_Shape_BuildMassProperties(e[1]);
      if (s[0] == this._hknp.Result.RESULT_OK)
        return s[1];
    }
    return [[0, 0, 0], 1, [1, 1, 1], [0, 0, 0, 1]];
  }
  /**
   * Computes the mass properties of a physics body, from it's shape
   *
   * @param body - The physics body to copmute the mass properties of
   * @param instanceIndex - The index of the instance to compute the mass properties of.
   * @returns The mass properties of the physics body.
   */
  computeMassProperties(t, e) {
    const s = this._getPluginReference(t, e), i = this._internalComputeMassProperties(s);
    return this._fromMassPropertiesTuple(i);
  }
  /**
   * Sets the mass properties of a physics body.
   *
   * @param body - The physics body to set the mass properties of.
   * @param massProps - The mass properties to set.
   * @param instanceIndex - The index of the instance to set the mass properties of. If undefined, the mass properties of all the bodies will be set.
   * This function is useful for setting the mass properties of a physics body,
   * such as its mass, inertia, and center of mass. This is important for
   * accurately simulating the physics of the body in the physics engine.
   *
   */
  setMassProperties(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      i.userMassProps = e, this._internalUpdateMassProperties(i);
    }, s);
  }
  /**
   * Gets the mass properties of a physics body.
   * @param body - The physics body to get the mass properties from.
   * @param instanceIndex - The index of the instance to get the mass properties from. If not specified, the mass properties of the first instance will be returned.
   * @returns The mass properties of the physics body.
   */
  getMassProperties(t, e) {
    const s = this._getPluginReference(t, e), i = this._hknp.HP_Body_GetMassProperties(s.hpBodyId)[1];
    return this._fromMassPropertiesTuple(i);
  }
  /**
   * Sets the linear damping of the given body.
   * @param body - The body to set the linear damping for.
   * @param damping - The linear damping to set.
   * @param instanceIndex - The index of the instance to set the linear damping for. If not specified, the linear damping of the first instance will be set.
   *
   * This method is useful for controlling the linear damping of a body in a physics engine.
   * Linear damping is a force that opposes the motion of the body, and is proportional to the velocity of the body.
   * This method allows the user to set the linear damping of a body, which can be used to control the motion of the body.
   */
  setLinearDamping(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_SetLinearDamping(i.hpBodyId, e);
    }, s);
  }
  /**
   * Gets the linear damping of the given body.
   * @param body - The body to get the linear damping from.
   * @param instanceIndex - The index of the instance to get the linear damping from. If not specified, the linear damping of the first instance will be returned.
   * @returns The linear damping of the given body.
   *
   * This method is useful for getting the linear damping of a body in a physics engine.
   * Linear damping is a force that opposes the motion of the body and is proportional to the velocity of the body.
   * It is used to simulate the effects of air resistance and other forms of friction.
   */
  getLinearDamping(t, e) {
    const s = this._getPluginReference(t, e);
    return this._hknp.HP_Body_GetLinearDamping(s.hpBodyId)[1];
  }
  /**
   * Sets the angular damping of a physics body.
   * @param body - The physics body to set the angular damping for.
   * @param damping - The angular damping value to set.
   * @param instanceIndex - The index of the instance to set the angular damping for. If not specified, the angular damping of the first instance will be set.
   *
   * This function is useful for controlling the angular velocity of a physics body.
   * By setting the angular damping, the body's angular velocity will be reduced over time, allowing for more realistic physics simulations.
   */
  setAngularDamping(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_SetAngularDamping(i.hpBodyId, e);
    }, s);
  }
  /**
   * Gets the angular damping of a physics body.
   * @param body - The physics body to get the angular damping from.
   * @param instanceIndex - The index of the instance to get the angular damping from. If not specified, the angular damping of the first instance will be returned.
   * @returns The angular damping of the body.
   *
   * This function is useful for retrieving the angular damping of a physics body,
   * which is used to control the rotational motion of the body. The angular damping is a value between 0 and 1, where 0 is no damping and 1 is full damping.
   */
  getAngularDamping(t, e) {
    const s = this._getPluginReference(t, e);
    return this._hknp.HP_Body_GetAngularDamping(s.hpBodyId)[1];
  }
  /**
   * Sets the linear velocity of a physics body.
   * @param body - The physics body to set the linear velocity of.
   * @param linVel - The linear velocity to set.
   * @param instanceIndex - The index of the instance to set the linear velocity of. If not specified, the linear velocity of the first instance will be set.
   *
   * This function is useful for setting the linear velocity of a physics body, which is necessary for simulating
   * motion in a physics engine. The linear velocity is the speed and direction of the body's movement.
   */
  setLinearVelocity(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_SetLinearVelocity(i.hpBodyId, this._bVecToV3(e));
    }, s);
  }
  /**
   * Gets the linear velocity of a physics body and stores it in a given vector.
   * @param body - The physics body to get the linear velocity from.
   * @param linVel - The vector to store the linear velocity in.
   * @param instanceIndex - The index of the instance to get the linear velocity from. If not specified, the linear velocity of the first instance will be returned.
   *
   * This function is useful for retrieving the linear velocity of a physics body,
   * which can be used to determine the speed and direction of the body. This
   * information can be used to simulate realistic physics behavior in a game.
   */
  getLinearVelocityToRef(t, e, s) {
    const i = this._getPluginReference(t, s), n = this._hknp.HP_Body_GetLinearVelocity(i.hpBodyId)[1];
    this._v3ToBvecRef(n, e);
  }
  /*
   * Apply an operation either to all instances of a body, if instanceIndex is not specified, or to a specific instance.
   */
  _applyToBodyOrInstances(t, e, s) {
    var i;
    if (((i = t._pluginDataInstances) == null ? void 0 : i.length) > 0 && s === void 0)
      for (let n = 0; n < t._pluginDataInstances.length; n++)
        e(t._pluginDataInstances[n]);
    else
      e(this._getPluginReference(t, s));
  }
  /**
   * Applies an impulse to a physics body at a given location.
   * @param body - The physics body to apply the impulse to.
   * @param impulse - The impulse vector to apply.
   * @param location - The location in world space to apply the impulse.
   * @param instanceIndex - The index of the instance to apply the impulse to. If not specified, the impulse will be applied to all instances.
   *
   * This method is useful for applying an impulse to a physics body at a given location.
   * This can be used to simulate physical forces such as explosions, collisions, and gravity.
   */
  applyImpulse(t, e, s, i) {
    this._applyToBodyOrInstances(t, (n) => {
      const r = n.worldRegion.floatingOrigin;
      this._hknp.HP_Body_ApplyImpulse(n.hpBodyId, this._bVecToV3WithOffset(s, r), this._bVecToV3(e));
    }, i);
  }
  /**
   * Applies an angular impulse(torque) to a physics body
   * @param body - The physics body to apply the impulse to.
   * @param angularImpulse - The torque value
   * @param instanceIndex - The index of the instance to apply the impulse to. If not specified, the impulse will be applied to all instances.
   */
  applyAngularImpulse(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_ApplyAngularImpulse(i.hpBodyId, this._bVecToV3(e));
    }, s);
  }
  /**
   * Applies a force to a physics body at a given location.
   * @param body - The physics body to apply the impulse to.
   * @param force - The force vector to apply.
   * @param location - The location in world space to apply the impulse.
   * @param instanceIndex - The index of the instance to apply the force to. If not specified, the force will be applied to all instances.
   *
   * This method is useful for applying a force to a physics body at a given location.
   * This can be used to simulate physical forces such as explosions, collisions, and gravity.
   */
  applyForce(t, e, s, i) {
    e.scaleToRef(this.getTimeStep(), this._tmpVec3[0]), this.applyImpulse(t, this._tmpVec3[0], s, i);
  }
  /**
   * Applies a torque to a physics body.
   * @param body - The physics body to apply the torque to.
   * @param torque - The torque vector.
   * @param instanceIndex - The index of the instance to apply the torque to. If not specified, the torque will be applied to all instances.
   *
   * This method is useful for applying a torque to a physics body.
   * This can be used to simulate rotational forces such as motors, angular momentum, and rotational dynamics.
   */
  applyTorque(t, e, s) {
    e.scaleToRef(this.getTimeStep(), this._tmpVec3[0]), this.applyAngularImpulse(t, this._tmpVec3[0], s);
  }
  /**
   * Sets the angular velocity of a physics body.
   *
   * @param body - The physics body to set the angular velocity of.
   * @param angVel - The angular velocity to set.
   * @param instanceIndex - The index of the instance to set the angular velocity of. If not specified, the angular velocity of the first instance will be set.
   *
   * This function is useful for setting the angular velocity of a physics body in a physics engine.
   * This allows for more realistic simulations of physical objects, as they can be given a rotational velocity.
   */
  setAngularVelocity(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_SetAngularVelocity(i.hpBodyId, this._bVecToV3(e));
    }, s);
  }
  /**
   * Gets the angular velocity of a body.
   * @param body - The body to get the angular velocity from.
   * @param angVel - The vector3 to store the angular velocity.
   * @param instanceIndex - The index of the instance to get the angular velocity from. If not specified, the angular velocity of the first instance will be returned.
   *
   * This method is useful for getting the angular velocity of a body in a physics engine. It
   * takes the body and a vector3 as parameters and stores the angular velocity of the body
   * in the vector3. This is useful for getting the angular velocity of a body in order to
   * calculate the motion of the body in the physics engine.
   */
  getAngularVelocityToRef(t, e, s) {
    const i = this._getPluginReference(t, s), n = this._hknp.HP_Body_GetAngularVelocity(i.hpBodyId)[1];
    this._v3ToBvecRef(n, e);
  }
  /**
   * Sets the transformation of the given physics body to the given transform node.
   * @param body The physics body to set the transformation for.
   * @param node The transform node to set the transformation from.
   * Sets the transformation of the given physics body to the given transform node.
   *
   * This function is useful for setting the transformation of a physics body to a
   * transform node, which is necessary for the physics engine to accurately simulate
   * the motion of the body. It also takes into account instances of the transform
   * node, which is necessary for accurate simulation of multiple bodies with the
   * same transformation.
   */
  setPhysicsBodyTransformation(t, e) {
    var s;
    if (t.getPrestepType() == K.TELEPORT) {
      const i = t.transformNode;
      if (t.numInstances > 0) {
        const r = i._thinInstanceDataStorage.matrixData;
        if (!r)
          return;
        const a = t.numInstances;
        this._createOrUpdateBodyInstances(t, t.getMotionType(), r, 0, a, !0);
      } else {
        const n = t._pluginData;
        if (n.worldRegion && (this._worldRegions.length > 1 || (s = It.getScene()) != null && s.floatingOriginMode)) {
          const a = b.Vector3[3];
          e.parent ? (e.computeWorldMatrix(!0), a.copyFrom(e.absolutePosition)) : a.copyFrom(e.position);
          const l = n.worldRegion;
          if (_.Distance(a, l.floatingOrigin) > this._floatingOriginWorldRadius * 1.2) {
            const h = this._getOrCreateWorldRegion(a);
            if (h !== l) {
              const d = this._hknp.HP_Body_GetLinearVelocity(n.hpBodyId)[1], p = this._hknp.HP_Body_GetAngularVelocity(n.hpBodyId)[1];
              this._hknp.HP_World_RemoveBody(l.world, n.hpBodyId), this._hknp.HP_World_AddBody(h.world, n.hpBodyId, !1), this._hknp.HP_Body_SetLinearVelocity(n.hpBodyId, d), this._hknp.HP_Body_SetAngularVelocity(n.hpBodyId, p), n.worldRegion = h, n.worldTransformOffset = this._hknp.HP_Body_GetWorldTransformOffset(n.hpBodyId)[1], this._releaseWorldRegionIfEmpty(l);
            }
          }
        }
        const r = t._pluginData.worldRegion.floatingOrigin;
        this._hknp.HP_Body_SetQTransform(t._pluginData.hpBodyId, this._getTransformInfos(e, r));
      }
    } else
      t.getPrestepType() == K.ACTION ? this.setTargetTransform(t, e.absolutePosition, e.absoluteRotationQuaternion) : t.getPrestepType() == K.DISABLED ? F.Warn("Prestep type is set to DISABLED. Unable to set physics body transformation.") : F.Warn("Invalid prestep type set to physics body.");
  }
  /**
   * Set the target transformation (position and rotation) of the body, such that the body will set its velocity to reach that target
   * @param body The physics body to set the target transformation for.
   * @param position The target position
   * @param rotation The target rotation
   * @param instanceIndex The index of the instance in an instanced body
   */
  setTargetTransform(t, e, s, i) {
    this._applyToBodyOrInstances(t, (n) => {
      const r = n.worldRegion.floatingOrigin;
      this._hknp.HP_Body_SetTargetQTransform(n.hpBodyId, [this._bVecToV3WithOffset(e, r), this._bQuatToV4(s)]);
    }, i);
  }
  /**
   * Sets the gravity factor of a body
   * @param body the physics body to set the gravity factor for
   * @param factor the gravity factor
   * @param instanceIndex the index of the instance in an instanced body
   */
  setGravityFactor(t, e, s) {
    this._applyToBodyOrInstances(t, (i) => {
      this._hknp.HP_Body_SetGravityFactor(i.hpBodyId, e);
    }, s);
  }
  /**
   * Get the gravity factor of a body
   * @param body the physics body to get the gravity factor from
   * @param instanceIndex the index of the instance in an instanced body. If not specified, the gravity factor of the first instance will be returned.
   * @returns the gravity factor
   */
  getGravityFactor(t, e) {
    const s = this._getPluginReference(t, e);
    return this._hknp.HP_Body_GetGravityFactor(s.hpBodyId)[1];
  }
  /**
   * Disposes a physics body.
   *
   * @param body - The physics body to dispose.
   *
   * This method is useful for releasing the resources associated with a physics body when it is no longer needed.
   * This is important for avoiding memory leaks in the physics engine.
   */
  disposeBody(t) {
    if (t._pluginDataInstances && t._pluginDataInstances.length > 0)
      for (const e of t._pluginDataInstances)
        this._hknp.HP_Body_Release(e.hpBodyId), e.hpBodyId = void 0;
    t._pluginData && (this._hknp.HP_Body_Release(t._pluginData.hpBodyId), t._pluginData.hpBodyId = void 0);
  }
  _createOptionsFromGroundMesh(t) {
    const e = t.groundMesh;
    if (!e)
      return;
    let s = e.getVerticesData($t.PositionKind);
    const i = e.computeWorldMatrix(!0), n = [];
    let r;
    for (r = 0; r < s.length; r += 3)
      _.FromArrayToRef(s, r, b.Vector3[0]), _.TransformCoordinatesToRef(b.Vector3[0], i, b.Vector3[1]), b.Vector3[1].toArray(n, r);
    s = n;
    const a = ~~(Math.sqrt(s.length / 3) - 1), l = e.getBoundingInfo(), c = Math.min(l.boundingBox.extendSizeWorld.x, l.boundingBox.extendSizeWorld.z), h = l.boundingBox.minimumWorld.x, d = l.boundingBox.minimumWorld.y, p = l.boundingBox.minimumWorld.z, u = new Float32Array((a + 1) * (a + 1)), g = c * 2 / a;
    for (let I = 0; I < u.length; I++)
      u[I] = d;
    for (let I = 0; I < s.length; I = I + 3) {
      const y = Math.round((s[I + 0] - h) / g), C = a - Math.round((s[I + 2] - p) / g), A = s[I + 1] - d;
      u[C * (a + 1) + y] = A;
    }
    t.numHeightFieldSamplesX = a + 1, t.numHeightFieldSamplesZ = a + 1, t.heightFieldSizeX = l.boundingBox.extendSizeWorld.x * 2, t.heightFieldSizeZ = l.boundingBox.extendSizeWorld.z * 2, t.heightFieldData = u;
  }
  /**
   * Initializes a physics shape with the given type and parameters.
   * @param shape - The physics shape to initialize.
   * @param type - The type of shape to initialize.
   * @param options - The parameters for the shape.
   *
   * This code is useful for initializing a physics shape with the given type and parameters.
   * It allows for the creation of a sphere, box, capsule, container, cylinder, mesh, and heightfield.
   * Depending on the type of shape, different parameters are required.
   * For example, a sphere requires a radius, while a box requires extents and a rotation.
   */
  initShape(t, e, s) {
    switch (e) {
      case 0:
        {
          const i = s.radius || 1, n = s.center ? this._bVecToV3(s.center) : [0, 0, 0];
          t._pluginData = this._hknp.HP_Shape_CreateSphere(n, i)[1];
        }
        break;
      case 3:
        {
          const i = s.rotation ? this._bQuatToV4(s.rotation) : [0, 0, 0, 1], n = s.extents ? this._bVecToV3(s.extents) : [1, 1, 1], r = s.center ? this._bVecToV3(s.center) : [0, 0, 0];
          t._pluginData = this._hknp.HP_Shape_CreateBox(r, i, n)[1];
        }
        break;
      case 1:
        {
          const i = s.pointA ? this._bVecToV3(s.pointA) : [0, 0, 0], n = s.pointB ? this._bVecToV3(s.pointB) : [0, 1, 0], r = s.radius || 0;
          t._pluginData = this._hknp.HP_Shape_CreateCapsule(i, n, r)[1];
        }
        break;
      case 5:
        t._pluginData = this._hknp.HP_Shape_CreateContainer()[1];
        break;
      case 2:
        {
          const i = s.pointA ? this._bVecToV3(s.pointA) : [0, 0, 0], n = s.pointB ? this._bVecToV3(s.pointB) : [0, 1, 0], r = s.radius || 0;
          t._pluginData = this._hknp.HP_Shape_CreateCylinder(i, n, r)[1];
        }
        break;
      case 4:
      case 6:
        {
          const i = s.mesh;
          if (i) {
            const n = !!s.includeChildMeshes, r = e != 4, a = new Ss(i, r, i == null ? void 0 : i.getScene());
            a.addNodeMeshes(i, n);
            const l = a.getVertices(this._hknp), c = l.numObjects / 3;
            if (e == 4)
              t._pluginData = this._hknp.HP_Shape_CreateConvexHull(l.offset, c)[1];
            else {
              const h = a.getTriangles(this._hknp), d = h.numObjects / 3;
              t._pluginData = this._hknp.HP_Shape_CreateMesh(l.offset, c, h.offset, d)[1], a.freeBuffer(this._hknp, h);
            }
            a.freeBuffer(this._hknp, l);
          } else
            throw new Error("No mesh provided to create physics shape.");
        }
        break;
      case 7:
        if (s.groundMesh && this._createOptionsFromGroundMesh(s), s.numHeightFieldSamplesX && s.numHeightFieldSamplesZ && s.heightFieldSizeX && s.heightFieldSizeZ && s.heightFieldData) {
          const i = s.numHeightFieldSamplesX * s.numHeightFieldSamplesZ, n = i * 4, r = this._hknp._malloc(n), a = new Float32Array(this._hknp.HEAPU8.buffer, r, i);
          for (let h = 0; h < s.numHeightFieldSamplesX; h++)
            for (let d = 0; d < s.numHeightFieldSamplesZ; d++) {
              const p = d * s.numHeightFieldSamplesX + h, u = (s.numHeightFieldSamplesX - 1 - h) * s.numHeightFieldSamplesZ + d;
              a[p] = s.heightFieldData[u];
            }
          const l = s.heightFieldSizeX / (s.numHeightFieldSamplesX - 1), c = s.heightFieldSizeZ / (s.numHeightFieldSamplesZ - 1);
          t._pluginData = this._hknp.HP_Shape_CreateHeightField(s.numHeightFieldSamplesX, s.numHeightFieldSamplesZ, [l, 1, c], r)[1], this._hknp._free(r);
        } else
          throw new Error("Missing required heightfield parameters");
        break;
      default:
        throw new Error("Unsupported Shape Type.");
    }
    this._shapes.set(t._pluginData[0], t);
  }
  /**
   * Sets the shape filter membership mask of a body
   * @param shape - The physics body to set the shape filter membership mask for.
   * @param membershipMask - The shape filter membership mask to set.
   */
  setShapeFilterMembershipMask(t, e) {
    const s = this._hknp.HP_Shape_GetFilterInfo(t._pluginData)[1][1];
    this._hknp.HP_Shape_SetFilterInfo(t._pluginData, [e, s]);
  }
  /**
   * Gets the shape filter membership mask of a body
   * @param shape - The physics body to get the shape filter membership mask from.
   * @returns The shape filter membership mask of the given body.
   */
  getShapeFilterMembershipMask(t) {
    return this._hknp.HP_Shape_GetFilterInfo(t._pluginData)[1][0];
  }
  /**
   * Sets the shape filter collide mask of a body
   * @param shape - The physics body to set the shape filter collide mask for.
   * @param collideMask - The shape filter collide mask to set.
   */
  setShapeFilterCollideMask(t, e) {
    const s = this._hknp.HP_Shape_GetFilterInfo(t._pluginData)[1][0];
    this._hknp.HP_Shape_SetFilterInfo(t._pluginData, [s, e]);
  }
  /**
   * Gets the shape filter collide mask of a body
   * @param shape - The physics body to get the shape filter collide mask from.
   * @returns The shape filter collide mask of the given body.
   */
  getShapeFilterCollideMask(t) {
    return this._hknp.HP_Shape_GetFilterInfo(t._pluginData)[1][1];
  }
  /**
   * Sets the material of a physics shape.
   * @param shape - The physics shape to set the material of.
   * @param material - The material to set.
   *
   */
  setMaterial(t, e) {
    const s = e.friction ?? 0.5, i = e.staticFriction ?? s, n = e.restitution ?? 0, r = e.frictionCombine ?? 1, a = e.restitutionCombine ?? 2, l = [i, s, n, this._materialCombineToNative(r), this._materialCombineToNative(a)];
    this._hknp.HP_Shape_SetMaterial(t._pluginData, l);
  }
  /**
   * Gets the material associated with a physics shape.
   * @param shape - The shape to get the material from.
   * @returns The material associated with the shape.
   */
  getMaterial(t) {
    const e = this._hknp.HP_Shape_GetMaterial(t._pluginData)[1];
    return {
      staticFriction: e[0],
      friction: e[1],
      restitution: e[2],
      frictionCombine: this._nativeToMaterialCombine(e[3]),
      restitutionCombine: this._nativeToMaterialCombine(e[4])
    };
  }
  /**
   * Sets the density of a physics shape.
   * @param shape - The physics shape to set the density of.
   * @param density - The density to set.
   *
   */
  setDensity(t, e) {
    this._hknp.HP_Shape_SetDensity(t._pluginData, e);
  }
  /**
   * Calculates the density of a given physics shape.
   *
   * @param shape - The physics shape to calculate the density of.
   * @returns The density of the given physics shape.
   *
   */
  getDensity(t) {
    return this._hknp.HP_Shape_GetDensity(t._pluginData)[1];
  }
  /**
   * Gets the transform infos of a given transform node.
   * This code is useful for getting the position and orientation of a given transform node.
   * It first checks if the node has a rotation quaternion, and if not, it creates one from the node's rotation.
   * It then creates an array containing the position and orientation of the node and returns it.
   * @param node - The transform node.
   * @param offset - The floating origin offset to apply.
   * @returns An array containing the position and orientation of the node.
   */
  _getTransformInfos(t, e) {
    if (t.parent)
      return t.computeWorldMatrix(!0), [this._bVecToV3WithOffset(t.absolutePosition, e), this._bQuatToV4(t.absoluteRotationQuaternion)];
    let s = b.Quaternion[0];
    if (t.rotationQuaternion)
      s = t.rotationQuaternion;
    else {
      const n = t.rotation;
      B.FromEulerAnglesToRef(n.x, n.y, n.z, s);
    }
    return [this._bVecToV3WithOffset(t.position, e), this._bQuatToV4(s)];
  }
  /**
   * Adds a child shape to the given shape.
   * @param shape - The parent shape.
   * @param newChild - The child shape to add.
   * @param translation - The relative translation of the child from the parent shape
   * @param rotation - The relative rotation of the child from the parent shape
   * @param scale - The relative scale scale of the child from the parent shaep
   *
   */
  addChild(t, e, s, i, n) {
    const r = [
      s ? this._bVecToV3(s) : [0, 0, 0],
      i ? this._bQuatToV4(i) : [0, 0, 0, 1],
      n ? this._bVecToV3(n) : [1, 1, 1]
    ];
    this._hknp.HP_Shape_AddChild(t._pluginData, e._pluginData, r);
  }
  /**
   * Removes a child shape from a parent shape.
   * @param shape - The parent shape.
   * @param childIndex - The index of the child shape to remove.
   *
   */
  removeChild(t, e) {
    this._hknp.HP_Shape_RemoveChild(t._pluginData, e);
  }
  /**
   * Returns the number of children of the given shape.
   *
   * @param shape - The shape to get the number of children from.
   * @returns The number of children of the given shape.
   *
   */
  getNumChildren(t) {
    return this._hknp.HP_Shape_GetNumChildren(t._pluginData)[1];
  }
  /**
   * Marks the shape as a trigger
   * @param shape the shape to mark as a trigger
   * @param isTrigger if the shape is a trigger
   */
  setTrigger(t, e) {
    this._hknp.HP_Shape_SetTrigger(t._pluginData, e);
  }
  /**
   * Calculates the bounding box of a given physics shape.
   *
   * @param _shape - The physics shape to calculate the bounding box for.
   * @returns The calculated bounding box.
   *
   * This method is useful for physics engines as it allows to calculate the
   * boundaries of a given shape. Knowing the boundaries of a shape is important
   * for collision detection and other physics calculations.
   */
  getBoundingBox(t) {
    const e = this._hknp.HP_Shape_GetBoundingBox(t._pluginData, [
      [0, 0, 0],
      [0, 0, 0, 1]
    ])[1];
    return b.Vector3[0].set(e[0][0], e[0][1], e[0][2]), b.Vector3[1].set(e[1][0], e[1][1], e[1][2]), new oe(b.Vector3[0], b.Vector3[1], at.IdentityReadOnly);
  }
  /**
   * Calculates the world bounding box of a given physics body.
   *
   * @param body - The physics body to calculate the bounding box for.
   * @returns The calculated bounding box.
   *
   * This method is useful for physics engines as it allows to calculate the
   * boundaries of a given body.
   */
  getBodyBoundingBox(t) {
    const e = this.getBoundingBox(t.shape);
    return new oe(e.minimum, e.maximum, t.transformNode.getWorldMatrix());
  }
  /**
   * Gets the geometry of a physics body.
   *
   * @param body - The physics body.
   * @returns An object containing the positions and indices of the body's geometry.
   *
   */
  getBodyGeometry(t) {
    var h;
    const e = ((h = t._pluginDataInstances) == null ? void 0 : h.length) > 0 ? t._pluginDataInstances[0] : t._pluginData, s = this._hknp.HP_Body_GetShape(e.hpBodyId)[1], i = this._hknp.HP_Shape_CreateDebugDisplayGeometry(s);
    if (i[0] != this._hknp.Result.RESULT_OK)
      return { positions: [], indices: [] };
    const n = this._hknp.HP_DebugGeometry_GetInfo(i[1])[1], r = new Float32Array(this._hknp.HEAPU8.buffer, n[0], n[1] * 3), a = new Uint32Array(this._hknp.HEAPU8.buffer, n[2], n[3] * 3), l = r.slice(0), c = a.slice(0);
    return this._hknp.HP_DebugGeometry_Release(i[1]), { positions: l, indices: c };
  }
  /**
   * Releases a physics shape from the physics engine.
   *
   * @param shape - The physics shape to be released.
   *
   * This method is useful for releasing a physics shape from the physics engine, freeing up resources and preventing memory leaks.
   */
  disposeShape(t) {
    this._shapes.delete(t._pluginData[0]), this._hknp.HP_Shape_Release(t._pluginData), t._pluginData = void 0;
  }
  // constraint
  /**
   * Initializes a physics constraint with the given parameters.
   *
   * @param constraint - The physics constraint to be initialized.
   * @param body - The main body
   * @param childBody - The child body.
   * @param instanceIndex - If this body is instanced, the index of the instance to which the constraint will be applied. If not specified, no constraint will be applied.
   * @param childInstanceIndex - If the child body is instanced, the index of the instance to which the constraint will be applied. If not specified, no constraint will be applied.
   *
   * This function is useful for setting up a physics constraint in a physics engine.
   */
  initConstraint(t, e, s, i, n) {
    const r = t.type, a = t.options;
    if (!r || !a) {
      F.Warn("No constraint type or options. Constraint is invalid.");
      return;
    }
    if (e._pluginDataInstances.length > 0 && i === void 0 || s._pluginDataInstances.length > 0 && n === void 0) {
      F.Warn("Body is instanced but no instance index was specified. Constraint will not be applied.");
      return;
    }
    t._pluginData = t._pluginData ?? [];
    const l = this._hknp.HP_Constraint_Create()[1];
    t._pluginData.push(l);
    const c = this._getPluginReference(e, i).hpBodyId, h = this._getPluginReference(s, n).hpBodyId;
    this._hknp.HP_Constraint_SetParentBody(l, c), this._hknp.HP_Constraint_SetChildBody(l, h), this._constraintToBodyIdPair.set(l[0], [c[0], h[0]]);
    const d = a.pivotA ? this._bVecToV3(a.pivotA) : this._bVecToV3(_.Zero()), p = a.axisA ?? new _(1, 0, 0), u = this._tmpVec3[0];
    a.perpAxisA ? u.copyFrom(a.perpAxisA) : p.getNormalToRef(u), this._hknp.HP_Constraint_SetAnchorInParent(l, d, this._bVecToV3(p), this._bVecToV3(u));
    const g = a.pivotB ? this._bVecToV3(a.pivotB) : this._bVecToV3(_.Zero()), I = a.axisB ?? new _(1, 0, 0), y = this._tmpVec3[0];
    if (a.perpAxisB ? y.copyFrom(a.perpAxisB) : I.getNormalToRef(y), this._hknp.HP_Constraint_SetAnchorInChild(l, g, this._bVecToV3(I), this._bVecToV3(y)), t._initOptions || (t._initOptions = {
      axisA: p.clone(),
      axisB: I.clone(),
      perpAxisA: u.clone(),
      perpAxisB: y.clone(),
      pivotA: new _(d[0], d[1], d[2]),
      pivotB: new _(g[0], g[1], g[2])
    }), r == 5)
      this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_X, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_X, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED);
    else if (r == 2) {
      const A = a.maxDistance || 0, M = this._hknp.ConstraintAxis.LINEAR_DISTANCE;
      this._hknp.HP_Constraint_SetAxisMode(l, M, this._hknp.ConstraintAxisLimitMode.LIMITED), this._hknp.HP_Constraint_SetAxisMinLimit(l, M, A), this._hknp.HP_Constraint_SetAxisMaxLimit(l, M, A);
    } else if (r == 3)
      this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_X, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED);
    else if (r == 6)
      this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_X, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED);
    else if (r == 4)
      this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.ANGULAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED);
    else if (r == 1)
      this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_X, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Y, this._hknp.ConstraintAxisLimitMode.LOCKED), this._hknp.HP_Constraint_SetAxisMode(l, this._hknp.ConstraintAxis.LINEAR_Z, this._hknp.ConstraintAxisLimitMode.LOCKED);
    else if (r == 7) {
      const A = t;
      for (const M of A.limits) {
        const x = this._constraintAxisToNative(M.axis);
        (M.minLimit ?? -1) == 0 && (M.maxLimit ?? -1) == 0 ? this._hknp.HP_Constraint_SetAxisMode(l, x, this._hknp.ConstraintAxisLimitMode.LOCKED) : (M.minLimit != null && (this._hknp.HP_Constraint_SetAxisMode(l, x, this._hknp.ConstraintAxisLimitMode.LIMITED), this._hknp.HP_Constraint_SetAxisMinLimit(l, x, M.minLimit)), M.maxLimit != null && (this._hknp.HP_Constraint_SetAxisMode(l, x, this._hknp.ConstraintAxisLimitMode.LIMITED), this._hknp.HP_Constraint_SetAxisMaxLimit(l, x, M.maxLimit))), M.stiffness && this._hknp.HP_Constraint_SetAxisStiffness(l, x, M.stiffness), M.damping && this._hknp.HP_Constraint_SetAxisDamping(l, x, M.damping);
      }
    } else
      throw new Error("Unsupported Constraint Type.");
    const C = !!a.collision;
    this._hknp.HP_Constraint_SetCollisionsEnabled(l, C), this._hknp.HP_Constraint_SetEnabled(l, !0);
  }
  /**
   * Get a list of all the pairs of bodies that are connected by this constraint.
   * @param constraint the constraint to search from
   * @returns a list of parent, child pairs
   */
  getBodiesUsingConstraint(t) {
    const e = [];
    for (const s of t._pluginData) {
      const i = this._constraintToBodyIdPair.get(s[0]);
      if (i) {
        const n = this._bodies.get(i[0]), r = this._bodies.get(i[1]);
        n && r && e.push({ parentBody: n.body, parentBodyIndex: n.index, childBody: r.body, childBodyIndex: r.index });
      }
    }
    return e;
  }
  /**
   * Adds a constraint to the physics engine.
   *
   * @param body - The main body to which the constraint is applied.
   * @param childBody - The body to which the constraint is applied.
   * @param constraint - The constraint to be applied.
   * @param instanceIndex - If this body is instanced, the index of the instance to which the constraint will be applied. If not specified, no constraint will be applied.
   * @param childInstanceIndex - If the child body is instanced, the index of the instance to which the constraint will be applied. If not specified, no constraint will be applied.
   */
  addConstraint(t, e, s, i, n) {
    this.initConstraint(s, t, e, i, n);
  }
  /**
   * Enables or disables a constraint in the physics engine.
   * @param constraint - The constraint to enable or disable.
   * @param isEnabled - Whether the constraint should be enabled or disabled.
   *
   */
  setEnabled(t, e) {
    for (const s of t._pluginData)
      this._hknp.HP_Constraint_SetEnabled(s, e);
  }
  /**
   * Gets the enabled state of the given constraint.
   * @param constraint - The constraint to get the enabled state from.
   * @returns The enabled state of the given constraint.
   *
   */
  getEnabled(t) {
    const e = t._pluginData && t._pluginData[0];
    return e ? this._hknp.HP_Constraint_GetEnabled(e)[1] : !1;
  }
  /**
   * Enables or disables collisions for the given constraint.
   * @param constraint - The constraint to enable or disable collisions for.
   * @param isEnabled - Whether collisions should be enabled or disabled.
   *
   */
  setCollisionsEnabled(t, e) {
    for (const s of t._pluginData)
      this._hknp.HP_Constraint_SetCollisionsEnabled(s, e);
  }
  /**
   * Gets whether collisions are enabled for the given constraint.
   * @param constraint - The constraint to get collisions enabled for.
   * @returns Whether collisions are enabled for the given constraint.
   *
   */
  getCollisionsEnabled(t) {
    const e = t._pluginData && t._pluginData[0];
    return e ? this._hknp.HP_Constraint_GetCollisionsEnabled(e)[1] : !1;
  }
  /**
   * Sets the friction of the given axis of the given constraint.
   *
   * @param constraint - The constraint to set the friction of.
   * @param axis - The axis of the constraint to set the friction of.
   * @param friction - The friction to set.
   *
   */
  setAxisFriction(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisFriction(i, this._constraintAxisToNative(e), s);
  }
  /**
   * Gets the friction value of the specified axis of the given constraint.
   *
   * @param constraint - The constraint to get the axis friction from.
   * @param axis - The axis to get the friction from.
   * @returns The friction value of the specified axis.
   *
   */
  getAxisFriction(t, e) {
    const s = t._pluginData && t._pluginData[0];
    return s ? this._hknp.HP_Constraint_GetAxisFriction(s, this._constraintAxisToNative(e))[1] : null;
  }
  /**
   * Sets the limit mode of the specified axis of the given constraint.
   * @param constraint - The constraint to set the axis mode of.
   * @param axis - The axis to set the limit mode of.
   * @param limitMode - The limit mode to set.
   */
  setAxisMode(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisMode(i, this._constraintAxisToNative(e), this._limitModeToNative(s));
  }
  /**
   * Gets the axis limit mode of the given constraint.
   *
   * @param constraint - The constraint to get the axis limit mode from.
   * @param axis - The axis to get the limit mode from.
   * @returns The axis limit mode of the given constraint.
   *
   */
  getAxisMode(t, e) {
    const s = t._pluginData && t._pluginData[0];
    if (s) {
      const i = this._hknp.HP_Constraint_GetAxisMode(s, this._constraintAxisToNative(e))[1];
      return this._nativeToLimitMode(i);
    }
    return null;
  }
  /**
   * Sets the minimum limit of the given axis of the given constraint.
   * @param constraint - The constraint to set the minimum limit of.
   * @param axis - The axis to set the minimum limit of.
   * @param limit - The minimum limit to set.
   *
   */
  setAxisMinLimit(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisMinLimit(i, this._constraintAxisToNative(e), s);
  }
  /**
   * Gets the minimum limit of the specified axis of the given constraint.
   * @param constraint - The constraint to get the minimum limit from.
   * @param axis - The axis to get the minimum limit from.
   * @returns The minimum limit of the specified axis of the given constraint.
   *
   */
  getAxisMinLimit(t, e) {
    const s = t._pluginData && t._pluginData[0];
    return s ? this._hknp.HP_Constraint_GetAxisMinLimit(s, this._constraintAxisToNative(e))[1] : null;
  }
  /**
   * Sets the maximum limit of the given axis of the given constraint.
   * @param constraint - The constraint to set the maximum limit of the given axis.
   * @param axis - The axis to set the maximum limit of.
   * @param limit - The maximum limit to set.
   *
   */
  setAxisMaxLimit(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisMaxLimit(i, this._constraintAxisToNative(e), s);
  }
  /**
   * Gets the maximum limit of the given axis of the given constraint.
   *
   * @param constraint - The constraint to get the maximum limit from.
   * @param axis - The axis to get the maximum limit from.
   * @returns The maximum limit of the given axis of the given constraint.
   *
   */
  getAxisMaxLimit(t, e) {
    const s = t._pluginData && t._pluginData[0];
    return s ? this._hknp.HP_Constraint_GetAxisMaxLimit(s, this._constraintAxisToNative(e))[1] : null;
  }
  /**
   * Sets the motor type of the given axis of the given constraint.
   * @param constraint - The constraint to set the motor type of.
   * @param axis - The axis of the constraint to set the motor type of.
   * @param motorType - The motor type to set.
   *
   */
  setAxisMotorType(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisMotorType(i, this._constraintAxisToNative(e), this._constraintMotorTypeToNative(s));
  }
  /**
   * Gets the motor type of the specified axis of the given constraint.
   * @param constraint - The constraint to get the motor type from.
   * @param axis - The axis of the constraint to get the motor type from.
   * @returns The motor type of the specified axis of the given constraint.
   *
   */
  getAxisMotorType(t, e) {
    const s = t._pluginData && t._pluginData[0];
    return s ? this._nativeToMotorType(this._hknp.HP_Constraint_GetAxisMotorType(s, this._constraintAxisToNative(e))[1]) : null;
  }
  /**
   * Sets the target of an axis motor of a constraint.
   *
   * @param constraint - The constraint to set the axis motor target of.
   * @param axis - The axis of the constraint to set the motor target of.
   * @param target - The target of the axis motor.
   *
   */
  setAxisMotorTarget(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisMotorTarget(i, this._constraintAxisToNative(e), s);
  }
  /**
   * Gets the target of the motor of the given axis of the given constraint.
   *
   * @param constraint - The constraint to get the motor target from.
   * @param axis - The axis of the constraint to get the motor target from.
   * @returns The target of the motor of the given axis of the given constraint.
   *
   */
  getAxisMotorTarget(t, e) {
    return t._pluginData && t._pluginData[0] ? this._hknp.HP_Constraint_GetAxisMotorTarget(t._pluginData, this._constraintAxisToNative(e))[1] : null;
  }
  /**
   * Sets the maximum force that can be applied by the motor of the given constraint axis.
   * @param constraint - The constraint to set the motor max force for.
   * @param axis - The axis of the constraint to set the motor max force for.
   * @param maxForce - The maximum force that can be applied by the motor.
   *
   */
  setAxisMotorMaxForce(t, e, s) {
    for (const i of t._pluginData)
      this._hknp.HP_Constraint_SetAxisMotorMaxForce(i, this._constraintAxisToNative(e), s);
  }
  /**
   * Gets the maximum force of the motor of the given constraint axis.
   *
   * @param constraint - The constraint to get the motor maximum force from.
   * @param axis - The axis of the constraint to get the motor maximum force from.
   * @returns The maximum force of the motor of the given constraint axis.
   *
   */
  getAxisMotorMaxForce(t, e) {
    const s = t._pluginData && t._pluginData[0];
    return s ? this._hknp.HP_Constraint_GetAxisMotorMaxForce(s, this._constraintAxisToNative(e))[1] : null;
  }
  /**
   * Disposes a physics constraint.
   *
   * @param constraint - The physics constraint to dispose.
   *
   * This method is useful for releasing the resources associated with a physics constraint, such as
   * the Havok constraint, when it is no longer needed. This is important for avoiding memory leaks.
   */
  disposeConstraint(t) {
    for (const e of t._pluginData)
      this._hknp.HP_Constraint_SetEnabled(e, !1), this._hknp.HP_Constraint_Release(e);
    t._pluginData.length = 0;
  }
  _populateHitData(t, e) {
    var c, h, d;
    const s = this._bodies.get(t[0][0]);
    e.body = s == null ? void 0 : s.body, e.bodyIndex = s == null ? void 0 : s.index;
    const i = this._shapes.get(t[1][0]);
    e.shape = i;
    const n = t[3], r = t[4], a = t[5], l = ((d = (h = (c = s == null ? void 0 : s.body) == null ? void 0 : c._pluginData) == null ? void 0 : h.worldRegion) == null ? void 0 : d.floatingOrigin) ?? this._worldRegions[0].floatingOrigin;
    e.setHitData({ x: r[0], y: r[1], z: r[2] }, { x: n[0] + l._x, y: n[1] + l._y, z: n[2] + l._z }, a);
  }
  /**
   * Performs a raycast from a given start point to a given end point and stores the result in a given PhysicsRaycastResult object.
   *
   * @param from - The start point of the raycast.
   * @param to - The end point of the raycast.
   * @param result - The PhysicsRaycastResult object (or array of PhysicsRaycastResults) to store the result of the raycast.
   * @param query - The raycast query options. See [[IRaycastQuery]] for more information.
   *
   * Performs a raycast. It takes in two points, from and to, and a PhysicsRaycastResult object to store the result of the raycast.
   * It then performs the raycast and stores the hit data in the PhysicsRaycastResult object.
   * If result is an empty array, it will be populated with every detected raycast hit.
   * If result is a populated array, it will only fill the PhysicsRaycastResults present in the array.
   */
  raycast(t, e, s, i) {
    var M, x;
    const n = (i == null ? void 0 : i.membership) ?? -1, r = (i == null ? void 0 : i.collideWith) ?? -1, a = (i == null ? void 0 : i.shouldHitTriggers) ?? !1, l = i != null && i.ignoreBody ? [BigInt(i.ignoreBody._pluginData.hpBodyId[0])] : [BigInt(0)], c = Array.isArray(s) ? s : [s];
    for (const f of c)
      f.reset(t, e);
    if (this._worldRegions.length === 0)
      return;
    const h = ((x = (M = i == null ? void 0 : i.ignoreBody) == null ? void 0 : M._pluginData) == null ? void 0 : x.worldRegion) ?? this._worldRegions[0], d = h.floatingOrigin, p = h.world, u = this._bVecToV3WithOffset(t, d), g = this._bVecToV3WithOffset(e, d), I = [u, g, [n, r], a, l], y = c.length === 1 || !this._multiQueryCollector ? this._queryCollector : this._multiQueryCollector;
    this._hknp.HP_World_CastRayWithCollector(p, y, I);
    const C = this._hknp.HP_QueryCollector_GetNumHits(y)[1];
    if (C <= 0)
      return;
    if (!c.length)
      for (let f = 0; f < C; f++) {
        const S = new Re();
        S.reset(t, e), c.push(S);
      }
    const A = new Array(C);
    for (let f = 0; f < C; f++) {
      const [, S] = this._hknp.HP_QueryCollector_GetCastRayResult(y, f)[1], P = S[3];
      this._tmpVec3[0].set(u[0] - P[0], u[1] - P[1], u[2] - P[2]);
      const T = this._tmpVec3[0].lengthSquared();
      A[f] = {
        hitData: S,
        distance: T
      };
    }
    A.sort((f, S) => f.distance - S.distance);
    for (let f = 0; f < Math.min(C, c.length); f++) {
      const S = c[f], P = A[f];
      this._populateHitData(P.hitData, S), S.setHitDistance(Math.sqrt(P.distance));
    }
  }
  /**
   * Given a point, returns the closest physics
   * body to that point.
   * @param query the query to perform. @see IPhysicsPointProximityQuery
   * @param result contact point on the hit shape, in world space
   */
  pointProximity(t, e) {
    var h, d, p, u;
    const s = ((h = t == null ? void 0 : t.collisionFilter) == null ? void 0 : h.membership) ?? -1, i = ((d = t == null ? void 0 : t.collisionFilter) == null ? void 0 : d.collideWith) ?? -1;
    e.reset();
    const n = t.ignoreBody ? [BigInt(t.ignoreBody._pluginData.hpBodyId[0])] : [BigInt(0)];
    if (this._worldRegions.length === 0)
      return;
    const r = ((u = (p = t.ignoreBody) == null ? void 0 : p._pluginData) == null ? void 0 : u.worldRegion) ?? this._worldRegions[0], a = r.floatingOrigin, l = r.world, c = [this._bVecToV3WithOffset(t.position, a), t.maxDistance, [s, i], t.shouldHitTriggers, n];
    if (this._hknp.HP_World_PointProximityWithCollector(l, this._queryCollector, c), this._hknp.HP_QueryCollector_GetNumHits(this._queryCollector)[1] > 0) {
      const [g, I] = this._hknp.HP_QueryCollector_GetPointProximityResult(this._queryCollector, 0)[1];
      this._populateHitData(I, e), e.setHitDistance(g);
    }
  }
  /**
   * Given a shape in a specific position and orientation, returns the closest point to that shape.
   * @param query the query to perform. @see IPhysicsShapeProximityCastQuery
   * @param inputShapeResult contact point on input shape, in input shape space
   * @param hitShapeResult contact point on hit shape, in world space
   */
  shapeProximity(t, e, s) {
    var h, d;
    e.reset(), s.reset();
    const i = t.shape._pluginData, n = t.ignoreBody ? [BigInt(t.ignoreBody._pluginData.hpBodyId[0])] : [BigInt(0)];
    if (this._worldRegions.length === 0)
      return;
    const r = ((d = (h = t.ignoreBody) == null ? void 0 : h._pluginData) == null ? void 0 : d.worldRegion) ?? this._worldRegions[0], a = r.floatingOrigin, l = r.world, c = [i, this._bVecToV3WithOffset(t.position, a), this._bQuatToV4(t.rotation), t.maxDistance, t.shouldHitTriggers, n];
    if (this._hknp.HP_World_ShapeProximityWithCollector(l, this._queryCollector, c), this._hknp.HP_QueryCollector_GetNumHits(this._queryCollector)[1] > 0) {
      const [p, u, g] = this._hknp.HP_QueryCollector_GetShapeProximityResult(this._queryCollector, 0)[1];
      this._populateHitData(u, e), this._populateHitData(g, s), e.setHitDistance(p), s.setHitDistance(p);
    }
  }
  /**
   * Given a shape in a specific orientation, cast it from the start to end position specified by the query, and return the first hit.
   * @param query the query to perform. @see IPhysicsShapeCastQuery
   * @param inputShapeResult contact point on input shape, in input shape space
   * @param hitShapeResult contact point on hit shape, in world space
   */
  shapeCast(t, e, s) {
    var h, d;
    e.reset(), s.reset();
    const i = t.shape._pluginData, n = t.ignoreBody ? [BigInt(t.ignoreBody._pluginData.hpBodyId[0])] : [BigInt(0)];
    if (this._worldRegions.length === 0)
      return;
    const r = ((d = (h = t.ignoreBody) == null ? void 0 : h._pluginData) == null ? void 0 : d.worldRegion) ?? this._worldRegions[0], a = r.floatingOrigin, l = r.world, c = [
      i,
      this._bQuatToV4(t.rotation),
      this._bVecToV3WithOffset(t.startPosition, a),
      this._bVecToV3WithOffset(t.endPosition, a),
      t.shouldHitTriggers,
      n
    ];
    if (this._hknp.HP_World_ShapeCastWithCollector(l, this._queryCollector, c), this._hknp.HP_QueryCollector_GetNumHits(this._queryCollector)[1] > 0) {
      const [p, u, g] = this._hknp.HP_QueryCollector_GetShapeCastResult(this._queryCollector, 0)[1];
      this._populateHitData(u, e), this._populateHitData(g, s), e.setHitFraction(p), s.setHitFraction(p);
    }
  }
  /**
   * Return the collision observable for a particular physics body.
   * @param body the physics body
   * @param instanceIndex - optionally, the index of the instance in the body
   * @returns the collision observable for the body
   */
  getCollisionObservable(t, e) {
    const i = this._getPluginReference(t, e).hpBodyId[0];
    let n = this._bodyCollisionObservable.get(i);
    return n || (n = new tt(), this._bodyCollisionObservable.set(i, n)), n;
  }
  /**
   * Return the collision ended observable for a particular physics body.
   * @param body the physics body
   * @param instanceIndex - optionally, the index of the instance in the body
   * @returns the collision ended observable for the body
   */
  getCollisionEndedObservable(t, e) {
    const i = this._getPluginReference(t, e).hpBodyId[0];
    let n = this._bodyCollisionEndedObservable.get(i);
    return n || (n = new tt(), this._bodyCollisionEndedObservable.set(i, n)), n;
  }
  /**
   * Enable collision to be reported for a body when a callback is setup on the world
   * @param body the physics body
   * @param enabled whether to enable or disable collision events
   */
  setCollisionCallbackEnabled(t, e) {
    const s = this._hknp.EventType.COLLISION_STARTED.value | this._hknp.EventType.COLLISION_CONTINUED.value | this._hknp.EventType.COLLISION_FINISHED.value;
    if (t._pluginDataInstances && t._pluginDataInstances.length)
      for (let i = 0; i < t._pluginDataInstances.length; i++) {
        const n = t._pluginDataInstances[i];
        this._hknp.HP_Body_SetEventMask(n.hpBodyId, e ? s : 0);
      }
    else
      t._pluginData && this._hknp.HP_Body_SetEventMask(t._pluginData.hpBodyId, e ? s : 0);
  }
  /**
   * Enable collision ended to be reported for a body when a callback is setup on the world
   * @param body the physics body
   * @param enabled whether to enable or disable collision ended events
   */
  setCollisionEndedCallbackEnabled(t, e) {
    const s = this._getPluginReference(t);
    let i = this._hknp.HP_Body_GetEventMask(s.hpBodyId)[1];
    if (i = e ? i | this._hknp.EventType.COLLISION_FINISHED.value : i & ~this._hknp.EventType.COLLISION_FINISHED.value, t._pluginDataInstances && t._pluginDataInstances.length)
      for (let n = 0; n < t._pluginDataInstances.length; n++) {
        const r = t._pluginDataInstances[n];
        this._hknp.HP_Body_SetEventMask(r.hpBodyId, i);
      }
    else
      t._pluginData && this._hknp.HP_Body_SetEventMask(t._pluginData.hpBodyId, i);
  }
  _notifyTriggers(t) {
    const e = t ?? this.world;
    let s = this._hknp.HP_World_GetTriggerEvents(e)[1];
    const i = new Ae();
    for (; s; ) {
      Ae.readToRef(this._hknp.HEAPU8.buffer, s, i);
      const n = this._bodies.get(i.bodyIdA), r = this._bodies.get(i.bodyIdB);
      if (n && r) {
        const a = {
          collider: n.body,
          colliderIndex: n.index,
          collidedAgainst: r.body,
          collidedAgainstIndex: r.index,
          type: this._nativeTriggerCollisionValueToCollisionType(i.type)
        };
        this.onTriggerCollisionObservable.notifyObservers(a);
      }
      s = this._hknp.HP_World_GetNextTriggerEvent(e, s);
    }
  }
  /**
   * Runs thru all detected collisions and filter by body
   * @param world optional world to check collisions for (defaults to main world)
   */
  _notifyCollisions(t) {
    const e = t ?? this.world;
    let s = this._hknp.HP_World_GetCollisionEvents(e)[1];
    const i = new Ie(), n = Number(e), a = (this._worldRegions.find((l) => Number(l.world) === n) ?? this._worldRegions[0]).floatingOrigin;
    for (; s; ) {
      Ie.readToRef(this._hknp.HEAPU8.buffer, s, i);
      const l = this._bodies.get(i.contactOnA.bodyId), c = this._bodies.get(i.contactOnB.bodyId);
      if (i.contactOnA.position.addInPlace(a), i.contactOnB.position.addInPlace(a), l && c) {
        const h = {
          collider: l.body,
          colliderIndex: l.index,
          collidedAgainst: c.body,
          collidedAgainstIndex: c.index,
          type: this._nativeCollisionValueToCollisionType(i.type)
        };
        if (h.type === "COLLISION_FINISHED")
          this.onCollisionEndedObservable.notifyObservers(h);
        else {
          i.contactOnB.position.subtractToRef(i.contactOnA.position, this._tmpVec3[0]);
          const d = _.Dot(this._tmpVec3[0], i.contactOnA.normal);
          h.point = i.contactOnA.position, h.distance = d, h.impulse = i.impulseApplied, h.normal = i.contactOnA.normal, this.onCollisionObservable.notifyObservers(h);
        }
        if (this._bodyCollisionObservable.size && h.type !== "COLLISION_FINISHED") {
          const d = this._bodyCollisionObservable.get(i.contactOnA.bodyId), p = this._bodyCollisionObservable.get(i.contactOnB.bodyId);
          i.contactOnA.position.subtractToRef(i.contactOnB.position, this._tmpVec3[0]);
          const u = _.Dot(this._tmpVec3[0], i.contactOnB.normal);
          if (d && d.notifyObservers(h), p) {
            const g = {
              collider: c.body,
              colliderIndex: c.index,
              collidedAgainst: l.body,
              collidedAgainstIndex: l.index,
              point: i.contactOnB.position,
              distance: u,
              impulse: i.impulseApplied,
              normal: i.contactOnB.normal,
              type: this._nativeCollisionValueToCollisionType(i.type)
            };
            p.notifyObservers(g);
          }
        } else if (this._bodyCollisionEndedObservable.size) {
          const d = this._bodyCollisionEndedObservable.get(i.contactOnA.bodyId), p = this._bodyCollisionEndedObservable.get(i.contactOnB.bodyId);
          i.contactOnA.position.subtractToRef(i.contactOnB.position, this._tmpVec3[0]);
          const u = _.Dot(this._tmpVec3[0], i.contactOnB.normal);
          if (d && d.notifyObservers(h), p) {
            const g = {
              collider: c.body,
              colliderIndex: c.index,
              collidedAgainst: l.body,
              collidedAgainstIndex: l.index,
              point: i.contactOnB.position,
              distance: u,
              impulse: i.impulseApplied,
              normal: i.contactOnB.normal,
              type: this._nativeCollisionValueToCollisionType(i.type)
            };
            p.notifyObservers(g);
          }
        }
      }
      s = this._hknp.HP_World_GetNextCollisionEvent(n, s);
    }
  }
  /**
   * Gets the number of bodies in the world
   */
  get numBodies() {
    return this._hknp.HP_World_GetNumBodies(this.world)[1];
  }
  /**
   * Dispose the world and free resources
   */
  dispose() {
    this._queryCollector && (this._hknp.HP_QueryCollector_Release(this._queryCollector), this._queryCollector = void 0), this._multiQueryCollector && (this._hknp.HP_QueryCollector_Release(this._multiQueryCollector), this._multiQueryCollector = void 0);
    for (const t of this._worldRegions)
      t.world && this._hknp.HP_World_Release(t.world);
    this._worldRegions.length = 0, this._worldRegionsPendingRelease.clear(), this.world = void 0;
  }
  _v3ToBvecRef(t, e) {
    e.set(t[0], t[1], t[2]);
  }
  _bVecToV3(t) {
    return [t._x, t._y, t._z];
  }
  /**
   * Converts a Vector3 to Havok format with floating origin offset subtracted.
   * Use this for world-space positions being sent to Havok.
   * @param v - The vector to convert
   * @param offset - Optional offset to use. If not provided, no offset is applied.
   * @returns The converted vector
   */
  _bVecToV3WithOffset(t, e) {
    return e ? [t._x - e._x, t._y - e._y, t._z - e._z] : [t._x, t._y, t._z];
  }
  _bQuatToV4(t) {
    return [t._x, t._y, t._z, t._w];
  }
  _constraintMotorTypeToNative(t) {
    switch (t) {
      case 2:
        return this._hknp.ConstraintMotorType.POSITION;
      case 1:
        return this._hknp.ConstraintMotorType.VELOCITY;
    }
    return this._hknp.ConstraintMotorType.NONE;
  }
  _nativeToMotorType(t) {
    switch (t) {
      case this._hknp.ConstraintMotorType.POSITION:
        return 2;
      case this._hknp.ConstraintMotorType.VELOCITY:
        return 1;
    }
    return 0;
  }
  _materialCombineToNative(t) {
    switch (t) {
      case 0:
        return this._hknp.MaterialCombine.GEOMETRIC_MEAN;
      case 1:
        return this._hknp.MaterialCombine.MINIMUM;
      case 2:
        return this._hknp.MaterialCombine.MAXIMUM;
      case 3:
        return this._hknp.MaterialCombine.ARITHMETIC_MEAN;
      case 4:
        return this._hknp.MaterialCombine.MULTIPLY;
    }
  }
  _nativeToMaterialCombine(t) {
    switch (t) {
      case this._hknp.MaterialCombine.GEOMETRIC_MEAN:
        return 0;
      case this._hknp.MaterialCombine.MINIMUM:
        return 1;
      case this._hknp.MaterialCombine.MAXIMUM:
        return 2;
      case this._hknp.MaterialCombine.ARITHMETIC_MEAN:
        return 3;
      case this._hknp.MaterialCombine.MULTIPLY:
        return 4;
      default:
        return;
    }
  }
  _constraintAxisToNative(t) {
    switch (t) {
      case 0:
        return this._hknp.ConstraintAxis.LINEAR_X;
      case 1:
        return this._hknp.ConstraintAxis.LINEAR_Y;
      case 2:
        return this._hknp.ConstraintAxis.LINEAR_Z;
      case 3:
        return this._hknp.ConstraintAxis.ANGULAR_X;
      case 4:
        return this._hknp.ConstraintAxis.ANGULAR_Y;
      case 5:
        return this._hknp.ConstraintAxis.ANGULAR_Z;
      case 6:
        return this._hknp.ConstraintAxis.LINEAR_DISTANCE;
    }
  }
  _nativeToLimitMode(t) {
    switch (t) {
      case this._hknp.ConstraintAxisLimitMode.FREE:
        return 0;
      case this._hknp.ConstraintAxisLimitMode.LIMITED:
        return 1;
      case this._hknp.ConstraintAxisLimitMode.LOCKED:
        return 2;
    }
    return 0;
  }
  _limitModeToNative(t) {
    switch (t) {
      case 0:
        return this._hknp.ConstraintAxisLimitMode.FREE;
      case 1:
        return this._hknp.ConstraintAxisLimitMode.LIMITED;
      case 2:
        return this._hknp.ConstraintAxisLimitMode.LOCKED;
    }
  }
  _nativeCollisionValueToCollisionType(t) {
    switch (t) {
      case this._hknp.EventType.COLLISION_STARTED.value:
        return "COLLISION_STARTED";
      case this._hknp.EventType.COLLISION_FINISHED.value:
        return "COLLISION_FINISHED";
      case this._hknp.EventType.COLLISION_CONTINUED.value:
        return "COLLISION_CONTINUED";
    }
    return "COLLISION_STARTED";
  }
  _nativeTriggerCollisionValueToCollisionType(t) {
    switch (t) {
      case 8:
        return "TRIGGER_ENTERED";
      case 16:
        return "TRIGGER_EXITED";
    }
    return "TRIGGER_ENTERED";
  }
}
class Nt {
  /**
   * Disable pre-step that consists in updating Physics Body from Transform Node Translation/Orientation.
   * True by default for maximum performance.
   */
  get disablePreStep() {
    return this._prestepType == K.DISABLED;
  }
  set disablePreStep(t) {
    this._prestepType = t ? K.DISABLED : K.TELEPORT;
  }
  /**
   * Constructs a new physics body for the given node.
   * @param transformNode - The Transform Node to construct the physics body for. For better performance, it is advised that this node does not have a parent.
   * @param motionType - The motion type of the physics body. The options are:
   *  - PhysicsMotionType.STATIC - Static bodies are not moving and unaffected by forces or collisions. They are good for level boundaries or terrain.
   *  - PhysicsMotionType.DYNAMIC - Dynamic bodies are fully simulated. They can move and collide with other objects.
   *  - PhysicsMotionType.ANIMATED - They behave like dynamic bodies, but they won't be affected by other bodies, but still push other bodies out of the way.
   * @param startsAsleep - Whether the physics body should start in a sleeping state (not a guarantee). Defaults to false.
   * @param scene - The scene containing the physics engine.
   *
   * This code is useful for creating a physics body for a given Transform Node in a scene.
   * It checks the version of the physics engine and the physics plugin, and initializes the body accordingly.
   * It also sets the node's rotation quaternion if it is not already set. Finally, it adds the body to the physics engine.
   */
  constructor(t, e, s, i) {
    if (this._pluginData = void 0, this._pluginDataInstances = [], this._collisionCBEnabled = !1, this._collisionEndedCBEnabled = !1, this.disableSync = !1, this._isDisposed = !1, this._shape = null, this._prestepType = K.DISABLED, !i)
      return;
    const n = i.getPhysicsEngine();
    if (!n)
      throw new Error("No Physics Engine available.");
    if (this._physicsEngine = n, n.getPluginVersion() != 2)
      throw new Error("Plugin version is incorrect. Expected version 2.");
    const r = n.getPhysicsPlugin();
    if (!r)
      throw new Error("No Physics Plugin available.");
    this._physicsPlugin = r, t.rotationQuaternion || (t.rotationQuaternion = B.FromEulerAngles(t.rotation.x, t.rotation.y, t.rotation.z)), this.startAsleep = s, this.disableSync = e == 0;
    const a = t;
    a.hasThinInstances ? this._physicsPlugin.initBodyInstances(this, e, a) : (t.parent && t.computeWorldMatrix(!0), this._physicsPlugin.initBody(this, e, t.absolutePosition, t.absoluteRotationQuaternion)), this.transformNode = t, t.physicsBody = this, n.addBody(this), this._nodeDisposeObserver = t.onDisposeObservable.add(() => {
      this.dispose();
    });
  }
  /**
   * Returns the string "PhysicsBody".
   * @returns "PhysicsBody"
   */
  getClassName() {
    return "PhysicsBody";
  }
  /**
   * Clone the PhysicsBody to a new body and assign it to the transformNode parameter
   * @param transformNode transformNode that will be used for the cloned PhysicsBody
   * @returns the newly cloned PhysicsBody
   */
  clone(t) {
    const e = new Nt(t, this.getMotionType(), this.startAsleep, this.transformNode.getScene());
    return e.shape = this.shape, e.setMassProperties(this.getMassProperties()), e.setLinearDamping(this.getLinearDamping()), e.setAngularDamping(this.getAngularDamping()), e;
  }
  /**
   * If a physics body is connected to an instanced node, update the number physic instances to match the number of node instances.
   */
  updateBodyInstances() {
    const t = this.transformNode;
    t.hasThinInstances && this._physicsPlugin.updateBodyInstances(this, t);
  }
  /**
   * This returns the number of internal instances of the physics body
   */
  get numInstances() {
    return this._pluginDataInstances.length;
  }
  /**
   * Get the motion type of the physics body. Can be STATIC, DYNAMIC, or ANIMATED.
   */
  get motionType() {
    return this._physicsPlugin.getMotionType(this);
  }
  /**
   * Sets the shape of the physics body.
   * @param shape - The shape of the physics body.
   *
   * This method is useful for setting the shape of the physics body, which is necessary for the physics engine to accurately simulate the body's behavior.
   * The shape is used to calculate the body's mass, inertia, and other properties.
   */
  set shape(t) {
    this._shape = t, t && this._physicsPlugin.setShape(this, t);
  }
  /**
   * Retrieves the physics shape associated with this object.
   *
   * @returns The physics shape associated with this object, or `undefined` if no
   * shape is associated.
   *
   * This method is useful for retrieving the physics shape associated with this object,
   * which can be used to apply physical forces to the object or to detect collisions.
   */
  get shape() {
    return this._shape;
  }
  /**
   * Returns the bounding box of the physics body.
   * @returns The bounding box of the physics body.
   */
  getBoundingBox() {
    return this._physicsPlugin.getBodyBoundingBox(this);
  }
  /**
   * Sets the event mask for the physics engine.
   *
   * @param eventMask - A bitmask that determines which events will be sent to the physics engine.
   * @param instanceIndex - If this body is instanced, the index of the instance to set the event mask for.
   *
   * This method is useful for setting the event mask for the physics engine, which determines which events
   * will be sent to the physics engine. This allows the user to control which events the physics engine will respond to.
   */
  setEventMask(t, e) {
    this._physicsPlugin.setEventMask(this, t, e);
  }
  /**
   * Gets the event mask of the physics engine.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the event mask for.
   * @returns The event mask of the physics engine.
   *
   * This method is useful for getting the event mask of the physics engine,
   * which is used to determine which events the engine will respond to.
   * This is important for ensuring that the engine is responding to the correct events and not
   * wasting resources on unnecessary events.
   */
  getEventMask(t) {
    return this._physicsPlugin.getEventMask(this, t);
  }
  /**
   * Sets the motion type of the physics body. Can be STATIC, DYNAMIC, or ANIMATED.
   * @param motionType - The motion type to set.
   * @param instanceIndex - If this body is instanced, the index of the instance to set the motion type for. If body is instanced but instanceIndex is undefined, the motion type will be set for all instances.
   */
  setMotionType(t, e) {
    this.disableSync = e === void 0 && t == 0, this._physicsPlugin.setMotionType(this, t, e);
  }
  /**
   * Gets the motion type of the physics body. Can be STATIC, DYNAMIC, or ANIMATED.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the motion type for.
   * @returns The motion type of the physics body.
   */
  getMotionType(t) {
    return this._physicsPlugin.getMotionType(this, t);
  }
  /**
   * Set the prestep type of the body
   * @param prestepType prestep type provided by PhysicsPrestepType
   */
  setPrestepType(t) {
    this._prestepType = t;
  }
  /**
   * Get the current prestep type of the body
   * @returns the type of prestep associated with the body and its instance index
   */
  getPrestepType() {
    return this._prestepType;
  }
  /**
   * Computes the mass properties of the physics object, based on the set of physics shapes this body uses.
   * This method is useful for computing the initial mass properties of a physics object, such as its mass,
   * inertia, and center of mass; these values are important for accurately simulating the physics of the
   * object in the physics engine, and computing values based on the shape will provide you with reasonable
   * initial values, which you can then customize.
   * @param instanceIndex - The index of the instance to compute the mass properties for.
   * @returns The mass properties of the object.
   */
  computeMassProperties(t) {
    return this._physicsPlugin.computeMassProperties(this, t);
  }
  /**
   * Sets the mass properties of the physics object.
   *
   * @param massProps - The mass properties to set.
   * @param instanceIndex - The index of the instance to set the mass properties for. If not defined, the mass properties will be set for all instances.
   *
   * This method is useful for setting the mass properties of a physics object, such as its mass,
   * inertia, and center of mass. This is important for accurately simulating the physics of the object in the physics engine.
   */
  setMassProperties(t, e) {
    this._physicsPlugin.setMassProperties(this, t, e);
  }
  /**
   * Retrieves the mass properties of the object.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the mass properties for.
   * @returns The mass properties of the object.
   *
   * This method is useful for physics simulations, as it allows the user to
   * retrieve the mass properties of the object, such as its mass, center of mass,
   * and moment of inertia. This information is necessary for accurate physics
   * simulations.
   */
  getMassProperties(t) {
    return this._physicsPlugin.getMassProperties(this, t);
  }
  /**
   * Sets the linear damping of the physics body.
   *
   * @param damping - The linear damping value.
   * @param instanceIndex - If this body is instanced, the index of the instance to set the linear damping for.
   *
   * This method is useful for controlling the linear damping of the physics body,
   * which is the rate at which the body's velocity decreases over time. This is useful for simulating
   * the effects of air resistance or other forms of friction.
   */
  setLinearDamping(t, e) {
    this._physicsPlugin.setLinearDamping(this, t, e);
  }
  /**
   * Gets the linear damping of the physics body.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the linear damping for.
   * @returns The linear damping of the physics body.
   *
   * This method is useful for retrieving the linear damping of the physics body, which is the amount of
   * resistance the body has to linear motion. This is useful for simulating realistic physics behavior
   * in a game.
   */
  getLinearDamping(t) {
    return this._physicsPlugin.getLinearDamping(this, t);
  }
  /**
   * Sets the angular damping of the physics body.
   * @param damping The angular damping of the body.
   * @param instanceIndex - If this body is instanced, the index of the instance to set the angular damping for.
   *
   * This method is useful for controlling the angular velocity of a physics body.
   * By setting the damping, the body's angular velocity will be reduced over time, simulating the effect of friction.
   * This can be used to create realistic physical behavior in a physics engine.
   */
  setAngularDamping(t, e) {
    this._physicsPlugin.setAngularDamping(this, t, e);
  }
  /**
   * Gets the angular damping of the physics body.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the angular damping for.
   *
   * @returns The angular damping of the physics body.
   *
   * This method is useful for getting the angular damping of the physics body,
   * which is the rate of reduction of the angular velocity over time.
   * This is important for simulating realistic physics behavior in a game.
   */
  getAngularDamping(t) {
    return this._physicsPlugin.getAngularDamping(this, t);
  }
  /**
   * Sets the linear velocity of the physics object.
   * @param linVel - The linear velocity to set.
   * @param instanceIndex - If this body is instanced, the index of the instance to set the linear velocity for.
   *
   * This method is useful for setting the linear velocity of a physics object,
   * which is necessary for simulating realistic physics in a game engine.
   * By setting the linear velocity, the physics object will move in the direction and speed specified by the vector.
   * This allows for realistic physics simulations, such as simulating the motion of a ball rolling down a hill.
   */
  setLinearVelocity(t, e) {
    this._physicsPlugin.setLinearVelocity(this, t, e);
  }
  /**
   * Gets the linear velocity of the physics body and stores it in the given vector3.
   * @param linVel - The vector3 to store the linear velocity in.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the linear velocity for.
   *
   * This method is useful for getting the linear velocity of a physics body in a physics engine.
   * This can be used to determine the speed and direction of the body, which can be used to calculate the motion of the body.
   */
  getLinearVelocityToRef(t, e) {
    this._physicsPlugin.getLinearVelocityToRef(this, t, e);
  }
  /**
   * Gets the linear velocity of the physics body as a new vector3.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the linear velocity for.
   * @returns The linear velocity of the physics body.
   *
   * This method is useful for getting the linear velocity of a physics body in a physics engine.
   * This can be used to determine the speed and direction of the body, which can be used to calculate the motion of the body.
   */
  getLinearVelocity(t) {
    const e = new _();
    return this.getLinearVelocityToRef(e, t), e;
  }
  /**
   * Sets the angular velocity of the physics object.
   * @param angVel - The angular velocity to set.
   * @param instanceIndex - If this body is instanced, the index of the instance to set the angular velocity for.
   *
   * This method is useful for setting the angular velocity of a physics object, which is necessary for
   * simulating realistic physics behavior. The angular velocity is used to determine the rate of rotation of the object,
   * which is important for simulating realistic motion.
   */
  setAngularVelocity(t, e) {
    this._physicsPlugin.setAngularVelocity(this, t, e);
  }
  /**
   * Gets the angular velocity of the physics body and stores it in the given vector3.
   * @param angVel - The vector3 to store the angular velocity in.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the angular velocity for.
   *
   * This method is useful for getting the angular velocity of a physics body, which can be used to determine the body's
   * rotational speed. This information can be used to create realistic physics simulations.
   */
  getAngularVelocityToRef(t, e) {
    this._physicsPlugin.getAngularVelocityToRef(this, t, e);
  }
  /**
   * Gets the angular velocity of the physics body as a new vector3.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the angular velocity for.
   * @returns The angular velocity of the physics body.
   *
   * This method is useful for getting the angular velocity of a physics body, which can be used to determine the body's
   * rotational speed. This information can be used to create realistic physics simulations.
   */
  getAngularVelocity(t) {
    const e = new _();
    return this.getAngularVelocityToRef(e, t), e;
  }
  /**
   * Applies an impulse to the physics object.
   *
   * @param impulse The impulse vector.
   * @param location The location of the impulse.
   * @param instanceIndex For a instanced body, the instance to where the impulse should be applied. If not specified, the impulse is applied to all instances.
   *
   * This method is useful for applying an impulse to a physics object, which can be used to simulate physical forces such as gravity,
   * collisions, and explosions. This can be used to create realistic physics simulations in a game or other application.
   */
  applyImpulse(t, e, s) {
    this._physicsPlugin.applyImpulse(this, t, e, s);
  }
  /**
   * Add torque to a physics body
   * @param angularImpulse The angular impulse vector.
   * @param instanceIndex For a instanced body, the instance to where the impulse should be applied. If not specified, the impulse is applied to all instances.
   */
  applyAngularImpulse(t, e) {
    this._physicsPlugin.applyAngularImpulse(this, t, e);
  }
  /**
   * Applies a torque to the physics body.
   *
   * @param torque The torque vector.
   * @param instanceIndex For a instanced body, the instance to where the torque should be applied. If not specified, the torque is applied to all instances.
   *
   * This method is useful for applying a torque to a physics body, which can be used to simulate rotational forces such as motors,
   * angular momentum, and rotational dynamics. This can be used to create realistic physics simulations in a game or other application.
   */
  applyTorque(t, e) {
    this._physicsPlugin.applyTorque(this, t, e);
  }
  /**
   * Applies a force to the physics object.
   *
   * @param force The force vector.
   * @param location The location of the force.
   * @param instanceIndex For a instanced body, the instance to where the force should be applied. If not specified, the force is applied to all instances.
   *
   * This method is useful for applying a force to a physics object, which can be used to simulate physical forces such as gravity,
   * collisions, and explosions. This can be used to create realistic physics simulations in a game or other application.
   */
  applyForce(t, e, s) {
    this._physicsPlugin.applyForce(this, t, e, s);
  }
  /**
   * Retrieves the geometry of the body from the physics plugin.
   *
   * @returns The geometry of the body.
   *
   * This method is useful for retrieving the geometry of the body from the physics plugin, which can be used for various physics calculations.
   */
  getGeometry() {
    return this._physicsPlugin.getBodyGeometry(this);
  }
  /**
   * Returns an observable that will be notified for when a collision starts or continues for this PhysicsBody
   * @param instanceIndex - optionally, the index of the instance in the body
   * @returns Observable
   */
  getCollisionObservable(t) {
    return this._physicsPlugin.getCollisionObservable(this, t);
  }
  /**
   * Returns an observable that will be notified when the body has finished colliding with another body
   * @param instanceIndex - optionally, the index of the instance in the body
   * @returns Observable
   */
  getCollisionEndedObservable(t) {
    return this._physicsPlugin.getCollisionEndedObservable(this, t);
  }
  /**
   * Enable or disable collision callback for this PhysicsBody.
   * @param enabled true if PhysicsBody's collision will rise a collision event and notifies the observable
   */
  setCollisionCallbackEnabled(t) {
    this._collisionCBEnabled = t, this._physicsPlugin.setCollisionCallbackEnabled(this, t);
  }
  /**
   * Enable or disable collision ended callback for this PhysicsBody.
   * @param enabled true if PhysicsBody's collision ended will rise a collision event and notifies the observable
   */
  setCollisionEndedCallbackEnabled(t) {
    this._collisionEndedCBEnabled = t, this._physicsPlugin.setCollisionEndedCallbackEnabled(this, t);
  }
  /**
   * Get the center of the object in world space.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the center for.
   * @returns geometric center of the associated mesh
   */
  getObjectCenterWorld(t) {
    const e = new _();
    return this.getObjectCenterWorldToRef(e, t);
  }
  /**
   * Get the center of the object in world space.
   * @param ref - The vector3 to store the result in.
   * @param instanceIndex - If this body is instanced, the index of the instance to get the center for.
   * @returns geometric center of the associated mesh
   */
  getObjectCenterWorldToRef(t, e) {
    var s;
    if (((s = this._pluginDataInstances) == null ? void 0 : s.length) > 0) {
      const i = e || 0, n = this.transformNode._thinInstanceDataStorage.matrixData;
      n && t.set(n[i * 16 + 12], n[i * 16 + 13], n[i * 16 + 14]);
    } else
      t.copyFrom(this.transformNode.position);
    return t;
  }
  /**
   * Adds a constraint to the physics engine.
   *
   * @param childBody - The body to which the constraint will be applied.
   * @param constraint - The constraint to be applied.
   * @param instanceIndex - If this body is instanced, the index of the instance to which the constraint will be applied. If not specified, no constraint will be applied.
   * @param childInstanceIndex - If the child body is instanced, the index of the instance to which the constraint will be applied. If not specified, no constraint will be applied.
   *
   */
  addConstraint(t, e, s, i) {
    this._physicsPlugin.addConstraint(this, t, e, s, i);
  }
  /**
   * Sync with a bone
   * @param bone The bone that the impostor will be synced to.
   * @param boneMesh The mesh that the bone is influencing.
   * @param jointPivot The pivot of the joint / bone in local space.
   * @param distToJoint Optional distance from the impostor to the joint.
   * @param adjustRotation Optional quaternion for adjusting the local rotation of the bone.
   * @param boneAxis Optional vector3 axis the bone is aligned with
   */
  syncWithBone(t, e, s, i, n, r) {
    const a = this.transformNode;
    if (a.rotationQuaternion)
      if (n) {
        const h = b.Quaternion[0];
        t.getRotationQuaternionToRef(1, e, h), h.multiplyToRef(n, a.rotationQuaternion);
      } else
        t.getRotationQuaternionToRef(1, e, a.rotationQuaternion);
    const l = b.Vector3[0], c = b.Vector3[1];
    r || (r = b.Vector3[2], r.x = 0, r.y = 1, r.z = 0), t.getDirectionToRef(r, e, c), t.getAbsolutePositionToRef(e, l), i == null && s && (i = s.length()), i != null && (l.x += c.x * i, l.y += c.y * i, l.z += c.z * i), a.setAbsolutePosition(l);
  }
  /**
   * Executes a callback on the body or all of the instances of a body
   * @param callback the callback to execute
   */
  iterateOverAllInstances(t) {
    var e;
    if (((e = this._pluginDataInstances) == null ? void 0 : e.length) > 0)
      for (let s = 0; s < this._pluginDataInstances.length; s++)
        t(this, s);
    else
      t(this, void 0);
  }
  /**
   * Sets the gravity factor of the physics body
   * @param factor the gravity factor to set
   * @param instanceIndex the instance of the body to set, if undefined all instances will be set
   */
  setGravityFactor(t, e) {
    this._physicsPlugin.setGravityFactor(this, t, e);
  }
  /**
   * Gets the gravity factor of the physics body
   * @param instanceIndex the instance of the body to get, if undefined the value of first instance will be returned
   * @returns the gravity factor
   */
  getGravityFactor(t) {
    return this._physicsPlugin.getGravityFactor(this, t);
  }
  /**
   * Set the target transformation (position and rotation) of the body, such that the body will set its velocity to reach that target
   * @param position The target position
   * @param rotation The target rotation
   * @param instanceIndex The index of the instance in an instanced body
   */
  setTargetTransform(t, e, s) {
    this._physicsPlugin.setTargetTransform(this, t, e, s);
  }
  /**
   * Returns if the body has been disposed.
   * @returns true if disposed, false otherwise.
   */
  get isDisposed() {
    return this._isDisposed;
  }
  /**
   * Disposes the body from the physics engine.
   *
   * This method is useful for cleaning up the physics engine when a body is no longer needed. Disposing the body will free up resources and prevent memory leaks.
   */
  dispose() {
    this._isDisposed || (this._collisionCBEnabled && this.setCollisionCallbackEnabled(!1), this._collisionEndedCBEnabled && this.setCollisionEndedCallbackEnabled(!1), this._nodeDisposeObserver && (this.transformNode.onDisposeObservable.remove(this._nodeDisposeObserver), this._nodeDisposeObserver = null), this._physicsEngine.removeBody(this), this._physicsPlugin.removeBody(this), this._physicsPlugin.disposeBody(this), this.transformNode.physicsBody = null, this._pluginData = null, this._pluginDataInstances.length = 0, this._isDisposed = !0, this.shape = null);
  }
}
const Ps = (o) => {
  const t = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
  for (const n of o) {
    const r = t.get(n.parentDieId) ?? [];
    r.push(n), t.set(n.parentDieId, r), e.set(n.dieId, n);
  }
  const s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
  return Object.freeze({
    settle: (n) => {
      if (s.has(n))
        return { completed: null, spawned: [] };
      s.add(n);
      const r = (t.get(n) ?? []).filter((a) => i.has(a.dieId) ? !1 : (i.add(a.dieId), !0));
      return {
        completed: e.get(n) ?? null,
        spawned: Object.freeze(r)
      };
    }
  });
}, Le = {
  minElapsedMs: 500,
  forceGuideElapsedMs: 1320,
  minGroundImpacts: 1,
  bounceGraceMs: 130,
  durationMs: 1800,
  // Minor collision-induced lean must not delay semantic phases once the
  // authoritative face is still clearly the resolved top face.
  angleThreshold: Math.PI / 12,
  settleDeadZoneAngle: Math.PI / 18,
  landingSpinRetention: 0.28,
  landingApproachAngle: 0.12,
  finalLockDurationMs: 220,
  angularStrength: 7.2,
  maxAngularVelocity: 7,
  linearDampingStart: 0.985,
  linearDampingEnd: 0.955,
  settleAngularDampingStart: 0.998,
  settleAngularDampingEnd: 0.965,
  maxLockHeight: 2.05,
  maxGuideStartHeight: 3.2,
  bodyContactSettleDelayMs: 180,
  timeoutWindowMs: 650,
  timeoutExtensionMs: 900,
  flightAngularStrength: 0.72,
  flightMaxAngularAcceleration: 2.2,
  settleMaxAngularAcceleration: 32,
  stableDurationMs: 180,
  minFinalLockElapsedMs: 2300,
  maxSettleLinearVelocity: 0.28,
  maxSettleAngularVelocity: 0.38,
  finalLockMaxAngularSpeed: 0.75,
  forcedLockMaxAngularSpeed: 1.8,
  landingBrakeStart: 0.86,
  maxLandingVerticalSpeed: 2.6
}, j = (o = {}) => ({
  ...Le,
  ...o
}), bs = {
  2: j({
    minElapsedMs: 450,
    forceGuideElapsedMs: 1120,
    durationMs: 1450,
    // A coin face remains unambiguous with a modest natural tilt. Accepting
    // that cone prevents a readable d2 resting against another coin from
    // waiting for the timeout before its semantic follow-up can begin.
    angleThreshold: Math.PI / 9,
    angularStrength: 4.2,
    maxAngularVelocity: 5.2,
    landingSpinRetention: 0.1,
    landingApproachAngle: 0.055,
    linearDampingStart: 0.98,
    linearDampingEnd: 0.94,
    settleAngularDampingStart: 0.996,
    settleAngularDampingEnd: 0.955,
    maxGuideStartHeight: 2.6,
    flightMaxAngularAcceleration: 1.6,
    settleMaxAngularAcceleration: 12,
    stableDurationMs: 220,
    minFinalLockElapsedMs: 1900,
    settleDeadZoneAngle: Math.PI / 12,
    maxSettleLinearVelocity: 0.22,
    maxSettleAngularVelocity: 0.28,
    finalLockMaxAngularSpeed: 0.6,
    landingBrakeStart: 0.8,
    maxLandingVerticalSpeed: 1.4
  }),
  4: j({
    minElapsedMs: 580,
    forceGuideElapsedMs: 1500,
    durationMs: 1900,
    angularStrength: 4.6,
    maxAngularVelocity: 5.5,
    landingSpinRetention: 0.18,
    landingApproachAngle: 0.08,
    linearDampingStart: 0.983,
    linearDampingEnd: 0.95,
    settleAngularDampingStart: 0.997,
    settleAngularDampingEnd: 0.962,
    maxGuideStartHeight: 2.8,
    settleMaxAngularAcceleration: 18,
    stableDurationMs: 200,
    minFinalLockElapsedMs: 2400,
    maxSettleLinearVelocity: 0.24,
    maxSettleAngularVelocity: 0.32,
    landingBrakeStart: 0.83,
    maxLandingVerticalSpeed: 2
  }),
  6: j({
    minElapsedMs: 540,
    forceGuideElapsedMs: 1400,
    durationMs: 1850,
    angularStrength: 7.2,
    maxAngularVelocity: 6.1,
    maxLandingVerticalSpeed: 2.5
  }),
  8: j(),
  10: j({
    forceGuideElapsedMs: 1300,
    durationMs: 1750,
    angularStrength: 8,
    maxAngularVelocity: 7.2,
    settleMaxAngularAcceleration: 36,
    landingBrakeStart: 0.85,
    maxLandingVerticalSpeed: 2.2
  }),
  12: j(),
  20: j({
    minElapsedMs: 460,
    forceGuideElapsedMs: 1220,
    durationMs: 1700,
    angularStrength: 8,
    maxAngularVelocity: 7.8,
    landingSpinRetention: 0.32,
    landingApproachAngle: 0.19,
    minFinalLockElapsedMs: 2400,
    flightMaxAngularAcceleration: 2.8,
    settleMaxAngularAcceleration: 36,
    landingBrakeStart: 0.92,
    maxLandingVerticalSpeed: 3.6
  }),
  100: j({
    forceGuideElapsedMs: 1300,
    durationMs: 1750,
    angularStrength: 8,
    maxAngularVelocity: 7.2,
    settleMaxAngularAcceleration: 36,
    landingBrakeStart: 0.85,
    maxLandingVerticalSpeed: 2.2
  })
}, Ds = {
  2: 0.7,
  4: 0.82,
  6: 1,
  8: 0.92,
  10: 0.88,
  12: 1.08,
  20: 1.18,
  100: 0.88
}, H = (o, t, e) => Math.max(t, Math.min(e, o)), Es = Math.PI * 2, Ts = 0.72, Gt = 2.6, Oe = (o) => H(o, 0, 1), st = (o) => {
  const t = Oe(o);
  return t * t * (3 - 2 * t);
}, U = (o, t, e) => o + (t - o) * e, ks = (o) => bs[o] ?? Le, Rs = (o) => Ds[o] ?? 1, we = (o, t) => B.Dot(o, t) < 0 ? t.scale(-1) : t.clone(), Ls = (o, t) => {
  const s = we(o, t).normalize().multiply(o.conjugate()).normalize();
  s.w < 0 && s.scaleInPlace(-1);
  const i = 2 * Math.acos(H(s.w, -1, 1));
  if (i < 1e-4)
    return null;
  const n = Math.sqrt(Math.max(1e-6, 1 - s.w * s.w));
  return {
    angle: i,
    axis: new _(
      s.x / n,
      s.y / n,
      s.z / n
    ).normalize()
  };
}, Os = (o, t) => {
  const e = t === 4 ? _.Down() : _.Up();
  return {
    localNormal: e.applyRotationQuaternion(o.conjugate()).normalize(),
    restDirection: e
  };
}, Vt = (o, t, e) => {
  const s = o.clone().normalize(), i = t.applyRotationQuaternion(s).normalize(), n = e.clone().normalize(), r = B.Identity();
  B.FromUnitVectorsToRef(i, n, r);
  const a = r.multiply(s).normalize(), l = Ls(s, a);
  return l ? { angle: l.angle, axis: l.axis, targetQuaternion: a } : { angle: 0, axis: _.Zero(), targetQuaternion: s };
}, ws = (o, t, e, s) => {
  const i = o.clone().normalize(), n = Vt(i, t, e), r = Math.min(
    n.angle,
    Math.max(0, Number.isFinite(s) ? s : 0)
  ), a = Math.max(0, n.angle - r);
  return a <= 1e-4 ? {
    angle: 0,
    axis: _.Zero(),
    targetQuaternion: i,
    remainingAngle: n.angle
  } : {
    angle: a,
    axis: n.axis,
    targetQuaternion: B.RotationAxis(n.axis, a).multiply(i).normalize(),
    remainingAngle: r
  };
}, Hs = (o, t, e, s) => {
  const i = Math.max(0, o - t), n = Math.max(1e-3, Math.abs(s)), r = Number.isFinite(e) ? e : 0;
  return H((r + Math.sqrt(Math.max(0, r * r + 2 * n * i))) / n, 0.05, 4);
}, Bs = (o, t, e) => {
  const s = t.length();
  return !Number.isFinite(s) || s < 1e-4 || !Number.isFinite(e) ? o.clone().normalize() : B.RotationAxis(
    t.scale(1 / s),
    -s * Math.max(0, e)
  ).multiply(o).normalize();
}, Ns = (o, t, e) => {
  const s = new _(t.x, 0, t.z), i = H(
    Number.isFinite(e) ? Math.max(0, e) : 0,
    0,
    0.2
  );
  if (s.lengthSquared() <= 1e-8 || i <= 1e-4)
    return o.clone().normalize();
  s.normalize();
  const n = _.Cross(_.Up(), s).normalize();
  return B.RotationAxis(n, i).multiply(o).normalize();
}, se = (o) => {
  const t = new _(o.x, 0, o.z);
  return t.lengthSquared() <= 1e-8 ? _.Right() : (t.normalize(), _.Cross(_.Up(), t).normalize());
}, Vs = (o, t, e, s, i) => {
  const n = se(t), r = Math.max(0.45, Number.isFinite(s) ? s : 0), a = Math.max(0, Number.isFinite(e) ? e : 0), c = Math.min(i === 2 ? 1.8 : 5.5, a / r * 0.28);
  if (c <= 1e-4)
    return o.clone();
  const d = _.Dot(o, n) < 0 ? -1 : 1;
  return o.add(n.scale(c * d));
}, Fs = (o, t, e, s, i = 5.8) => {
  const n = Math.max(0.05, Number.isFinite(e) ? e : 0), r = H(
    (Number.isFinite(i) ? Math.max(0, i) : 0) / 5.8,
    0,
    1.5
  );
  if (r <= 0)
    return _.Zero();
  const a = (s === 2 ? 2.5 : s === 20 ? 2.45 : 2.35) * r, l = s === 2 ? 22 : 20, c = H(
    Es * a / n,
    Math.min(12, l * r),
    l * Math.max(0.35, r)
  ), h = se(t), d = new _(t.x, 0, t.z);
  d.lengthSquared() <= 1e-8 ? d.copyFrom(_.Forward()) : d.normalize();
  const p = o.lengthSquared() > 1e-8 ? o.normalizeToNew() : h, g = _.Dot(p, h) < -1e-4 ? -1 : 1, I = H(_.Dot(p, d), -0.28, 0.28), y = H(_.Dot(p, _.Up()), -0.22, 0.22);
  return h.scale(g).add(d.scale(I)).add(_.Up().scale(y)).normalize().scale(c);
}, He = (o, t, e) => {
  const s = H(o, 0, 1), i = Ts, n = H(t, 0, 1), r = Math.max(0, Number.isFinite(e) ? e : 0), a = i + (1 - i) / 2, l = (1 - i) / 2, c = r > Gt ? Gt * a / Math.max(
    1e-4,
    r - Gt * l
  ) : 1, h = Math.min(n, c), d = 1 / (i + (1 - i) * (1 + h) / 2);
  if (s <= i)
    return {
      rotationProgress: d * s,
      velocityScale: d
    };
  const p = (s - i) / (1 - i), u = st(p), g = Math.pow(p, 3) - Math.pow(p, 4) / 2;
  return {
    rotationProgress: d * (i + (1 - i) * (p - (1 - h) * g)),
    velocityScale: d * (1 - (1 - h) * u)
  };
}, vs = (o, t, e, s, i) => {
  const n = t.clone();
  if (n.lengthSquared() <= 1e-8)
    return o.clone();
  n.normalize();
  const r = Math.max(1, e.durationMs * 0.6), a = st(s / r), l = e.landingSpinRetention * 3.2 * (1 - a), c = _.Dot(o, n), h = Math.abs(c);
  if (h >= l || l <= 1e-4)
    return o.clone();
  const d = c < -1e-4 ? -1 : 1, p = e.flightMaxAngularAcceleration * 12 * Math.max(1e-4, i / 1e3);
  return o.add(n.scale(
    d * Math.min(l - h, p)
  ));
}, Gs = (o, t, e, s, i = 0) => {
  const n = t.length();
  if (!Number.isFinite(n) || n < 1e-4)
    return o.clone().normalize();
  const r = Math.max(0, Number.isFinite(s) ? s : 0), a = r > 0 ? H((Number.isFinite(e) ? e : 0) / r, 0, 1) : 1, { rotationProgress: l } = He(
    a,
    i,
    n
  );
  return B.RotationAxis(
    t.scale(1 / n),
    n * r * l
  ).multiply(o).normalize();
}, Ce = (o, t, e, s = 0) => {
  const i = Math.max(0, Number.isFinite(e) ? e : 0), n = i > 0 ? H((Number.isFinite(t) ? t : 0) / i, 0, 1) : 1;
  return o.scale(
    He(
      n,
      s,
      o.length()
    ).velocityScale
  );
}, Ws = (o, t, e, s, i, n = 0) => {
  const r = st(
    (Oe(i) - s.landingBrakeStart) / Math.max(1e-3, 1 - s.landingBrakeStart)
  ), a = Math.max(
    o.y,
    -s.maxLandingVerticalSpeed
  ), l = Math.max(
    0.5,
    Math.hypot(o.x, o.z)
  ), c = new _(
    (e.x - t.x) / 0.28,
    0,
    (e.z - t.z) / 0.28
  );
  c.length() > l && c.normalize().scaleInPlace(l);
  const h = Math.max(
    0,
    Number.isFinite(n) ? n : 0
  );
  if (c.length() < h) {
    const d = new _(o.x, 0, o.z), u = c.lengthSquared() > 1e-8 && _.Dot(c, d) > 0 ? c : d;
    u.lengthSquared() > 1e-8 && c.copyFrom(u.normalize().scale(h));
  }
  return new _(
    U(o.x, c.x, r),
    U(o.y, a, r),
    U(o.z, c.z, r)
  );
}, zs = (o, t, e, s, i, n, r, a, l, c) => {
  const h = e.applyRotationQuaternion(s).normalize(), d = Vt(
    t,
    e,
    h
  ), p = o.subtract(i), u = H(
    _.Dot(p, h),
    -a.maxAngularVelocity,
    a.maxAngularVelocity
  );
  if (d.angle <= 1e-4)
    return {
      ...d,
      velocity: i.add(h.scale(u)),
      correctionVelocity: _.Zero()
    };
  const g = st(l), I = Math.max(
    0.05,
    Number.isFinite(r) ? r : 0
  ), y = Math.max(
    a.flightAngularStrength * U(0.35, 1, g),
    3 / I
  ), C = Math.min(
    a.maxAngularVelocity,
    d.angle * y
  ), A = 8 * d.angle / (I * I), M = Math.max(
    a.flightMaxAngularAcceleration,
    Math.min(a.settleMaxAngularAcceleration, A)
  ), x = Math.max(0, M) * Math.max(1e-4, c / 1e3), f = _.Dot(n, d.axis), S = H(
    f + H(
      C - f,
      -x,
      x
    ),
    -a.maxAngularVelocity,
    a.maxAngularVelocity
  ), P = d.axis.scale(S);
  return {
    ...d,
    velocity: i.add(h.scale(u)).add(P),
    correctionVelocity: P
  };
}, Qs = (o, t, e, s, i, n, r, a) => {
  const l = Vt(t, e, s), c = st(n), h = a === "flight" ? 1 : Qt(U(
    i.settleAngularDampingStart,
    i.settleAngularDampingEnd,
    c
  ), r), d = o.scale(h), p = a === "settle" ? i.settleDeadZoneAngle : 1e-4;
  if (l.angle <= p)
    return { ...l, velocity: d };
  const u = a === "flight" ? i.flightAngularStrength * U(0.35, 1, c) : i.angularStrength * U(0.3, 1, c), g = Math.min(i.maxAngularVelocity, l.angle * u), I = _.Dot(d, l.axis), y = a === "flight" ? i.flightMaxAngularAcceleration : U(i.flightMaxAngularAcceleration, i.settleMaxAngularAcceleration, c), C = Math.max(0, y) * Math.max(1e-4, r / 1e3), A = H(
    g - I,
    -C,
    C
  );
  return d.addInPlace(l.axis.scale(A)), { ...l, velocity: d };
}, Us = (o, t, e) => {
  const s = e ? t.forcedLockMaxAngularSpeed : t.finalLockMaxAngularSpeed;
  return Math.max(
    t.finalLockDurationMs,
    Math.max(0, o) / Math.max(0.05, s) * 1e3
  );
}, Qt = (o, t) => Math.pow(H(o, 0, 1), Math.max(0.01, t / (1e3 / 60))), Ys = (o, t, e, s) => {
  const i = st((e - 0.18) / 0.82), n = U(t.linearDampingStart, t.linearDampingEnd, i), r = Qt(n, s), a = Qt(U(0.98, n, i), s);
  return new _(
    o.x * r,
    o.y * a,
    o.z * r
  );
}, Zs = (o, t, e, s) => o >= Math.max(0, t) * 0.75 || e <= s.maxGuideStartHeight, Ks = (o, t) => {
  if (o.elapsedMs < t.minElapsedMs)
    return !1;
  const e = o.positionY <= t.maxGuideStartHeight;
  return o.timeoutRemainingMs < t.timeoutWindowMs ? !0 : o.elapsedMs >= t.forceGuideElapsedMs ? o.groundImpactCount >= t.minGroundImpacts || e : !(o.groundImpactCount < t.minGroundImpacts || o.firstGroundImpactElapsedMs !== void 0 && o.elapsedMs - o.firstGroundImpactElapsedMs < t.bounceGraceMs);
}, Xs = (o, t) => {
  if (o.elapsedMs < t.minFinalLockElapsedMs)
    return !1;
  const e = o.positionY <= t.maxLockHeight, s = o.lastBodyContactElapsedMs !== void 0 && o.elapsedMs - o.lastBodyContactElapsedMs < t.bodyContactSettleDelayMs && (o.bodyContactElapsedMs ?? 0) < t.bodyContactSettleDelayMs, i = o.hasGroundContact || o.groundContactElapsedMs > 180;
  return e && i && !s && o.angle < t.angleThreshold && o.linearSpeed <= t.maxSettleLinearVelocity && o.angularSpeed <= t.maxSettleAngularVelocity && o.stableElapsedMs >= t.stableDurationMs;
}, Be = 1 / 90, Pt = 1e3 / 90, Ne = 1 / 180, Ve = 1e3 / 180, Fe = 1 / 120, ve = 1e3 / 120, Ge = 24, Ft = 1.04, js = -2, Wt = 11.5, We = (o) => {
  const t = Number.isFinite(o) ? Math.max(0, Math.floor(o)) : 0;
  return t <= 1 ? {
    seconds: Be,
    milliseconds: Pt
  } : t <= Ge ? {
    seconds: Ne,
    milliseconds: Ve
  } : {
    seconds: Fe,
    milliseconds: ve
  };
}, Js = (o) => {
  const t = Number.isFinite(o.activeBodyCount) ? Math.max(0, Math.floor(o.activeBodyCount)) : 0;
  return t <= 1 ? We(t) : (Number.isFinite(o.totalBodyCount) ? Math.max(t, Math.floor(o.totalBodyCount)) : t) > Ge || !o.requiresDenseResolution ? {
    seconds: Fe,
    milliseconds: ve
  } : {
    seconds: Ne,
    milliseconds: Ve
  };
}, $s = (o, t, e) => {
  for (const s of e)
    if (!ze(
      o,
      t,
      s.position,
      s.radius
    ))
      return !1;
  return !0;
}, ze = (o, t, e, s) => {
  const i = Number.isFinite(t) ? Math.max(0, t) : 0, n = Number.isFinite(s) ? Math.max(0, s) : 0, r = (i + n) * Ft, a = o.x - e.x, l = o.y - e.y, c = o.z - e.z;
  return a * a + l * l + c * c >= r * r;
}, qs = 1e-3, Se = (o, t, e) => {
  const s = Number.isFinite(t) ? Math.max(0, t) : 0;
  for (const i of e) {
    const n = Number.isFinite(i.radius) ? Math.max(0, i.radius) : 0, r = (s + n) * Ft, a = o.x - i.position.x, l = o.z - i.position.z;
    if (a * a + l * l < r * r)
      return !1;
  }
  return !0;
}, xe = (o, t, e) => Math.max(t, Math.min(e, Number.isFinite(o) ? o : 0)), ti = (o, t, e, s) => {
  const i = (c, h) => ({
    x: xe(c, s.minX, s.maxX),
    y: o.y,
    z: xe(h, s.minZ, s.maxZ)
  }), n = i(o.x, o.z);
  if (Se(n, t, e))
    return n;
  const r = Number.isFinite(t) ? Math.max(0.01, t) : 0.01, a = r * 2 * Ft, l = Math.PI * (3 - Math.sqrt(5));
  for (let c = 1; c <= 96; c++) {
    const h = a * Math.sqrt(c), d = l * c, p = i(
      n.x + Math.cos(d) * h,
      n.z + Math.sin(d) * h
    );
    if (Se(p, r, e))
      return p;
  }
  return n;
}, ei = (o, t, e, s, i, n) => {
  const r = (c, h) => {
    let d = c.y;
    const p = Number.isFinite(s) ? Math.max(0, s) : 0;
    for (const g of i) {
      const I = Number.isFinite(g.radius) ? Math.max(0, g.radius) : 0, y = (p + I) * Ft, C = c.x - g.position.x, A = c.z - g.position.z, M = C * C + A * A, x = y * y;
      if (M >= x)
        continue;
      const f = Math.sqrt(
        Math.max(0, x - M)
      );
      d = Math.max(
        d,
        g.position.y + f + qs
      );
    }
    if (!Number.isFinite(d) || d > h)
      return;
    const u = { x: c.x, y: d, z: c.z };
    return $s(u, p, i) ? u : void 0;
  }, a = r(o, n);
  if (a)
    return { position: a, origin: "source" };
  const l = r({
    x: t.x,
    y: Math.max(t.y, n),
    z: t.z
  }, Number.POSITIVE_INFINITY);
  return l ? { position: l, origin: "overhead" } : {
    position: r(e, Number.POSITIVE_INFINITY) ?? { ...e },
    origin: "edge"
  };
}, si = (o, t = Wt) => {
  const e = Number.isFinite(t) ? Math.max(Wt, t) : Wt;
  return !Number.isFinite(o.x) || !Number.isFinite(o.y) || !Number.isFinite(o.z) || o.y < js || Math.abs(o.x) > e || Math.abs(o.z) > e;
};
function Qe(o) {
  let e = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
  const s = [
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0
  ], i = [], n = o.width || o.size || 1, r = o.height || o.size || 1, a = o.depth || o.size || 1, l = o.wrap || !1;
  let c = o.topBaseAt === void 0 ? 1 : o.topBaseAt, h = o.bottomBaseAt === void 0 ? 0 : o.bottomBaseAt;
  c = (c + 4) % 4, h = (h + 4) % 4;
  const d = [2, 0, 3, 1], p = [2, 0, 1, 3];
  let u = d[c], g = p[h], I = [
    1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    -1,
    -1,
    1,
    -1,
    -1,
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    1,
    1,
    1,
    -1,
    1,
    1,
    -1,
    -1,
    1,
    -1,
    -1,
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    -1,
    1,
    -1,
    1,
    1,
    -1,
    1,
    1,
    1,
    1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    1
  ];
  if (l) {
    e = [2, 3, 0, 2, 0, 1, 4, 5, 6, 4, 6, 7, 9, 10, 11, 9, 11, 8, 12, 14, 15, 12, 13, 14], I = [
      -1,
      1,
      1,
      1,
      1,
      1,
      1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1,
      -1,
      -1,
      1,
      -1,
      -1,
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1,
      1,
      1,
      -1,
      1,
      -1,
      -1,
      1,
      -1,
      1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      -1,
      -1,
      1,
      -1,
      -1,
      -1
    ];
    let P = [
      [1, 1, 1],
      [-1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1]
    ], T = [
      [-1, -1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [-1, -1, -1]
    ];
    const L = [17, 18, 19, 16], v = [22, 23, 20, 21];
    for (; u > 0; )
      P.unshift(P.pop()), L.unshift(L.pop()), u--;
    for (; g > 0; )
      T.unshift(T.pop()), v.unshift(v.pop()), g--;
    P = P.flat(), T = T.flat(), I = I.concat(P).concat(T), e.push(L[0], L[2], L[3], L[0], L[1], L[2]), e.push(v[0], v[2], v[3], v[0], v[1], v[2]);
  }
  const y = [n / 2, r / 2, a / 2], C = I.reduce((P, T, L) => P.concat(T * y[L % 3]), []), A = o.sideOrientation === 0 ? 0 : o.sideOrientation || pt.DEFAULTSIDE, M = o.faceUV || new Array(6), x = o.faceColors, f = [];
  for (let P = 0; P < 6; P++)
    M[P] === void 0 && (M[P] = new ls(0, 0, 1, 1)), x && x[P] === void 0 && (x[P] = new hs(1, 1, 1, 1));
  for (let P = 0; P < 6; P++)
    if (i.push(M[P].z, M[P].w), i.push(M[P].x, M[P].w), i.push(M[P].x, M[P].y), i.push(M[P].z, M[P].y), x)
      for (let T = 0; T < 4; T++)
        f.push(x[P].r, x[P].g, x[P].b, x[P].a);
  pt._ComputeSides(A, C, e, s, i, o.frontUVs, o.backUVs);
  const S = new pt();
  if (S.indices = e, S.positions = C, S.normals = s, S.uvs = i, x) {
    const P = A === pt.DOUBLESIDE ? f.concat(f) : f;
    S.colors = P;
  }
  return S;
}
function Ue(o, t = {}, e = null) {
  const s = new ct(o, e);
  return t.sideOrientation = ct._GetDefaultSideOrientation(t.sideOrientation), s._originalBuilderSideOrientation = t.sideOrientation, Qe(t).applyToMesh(s, t.updatable), s;
}
let Pe = !1;
function ii() {
  Pe || (Pe = !0, pt.CreateBox = Qe, ct.CreateBox = (o, t, e = null, s, i) => Ue(o, {
    size: t,
    sideOrientation: i,
    updatable: s
  }, e));
}
ii();
const ni = 0.25, oi = 0.1, ri = 0.54, At = 1, Ye = 2, X = {
  left: 4,
  right: 8,
  north: 16,
  south: 32
}, Ut = At | Ye | X.left | X.right | X.north | X.south, ai = (o) => Ut & ~X[o], be = 2, De = -2, li = (o) => {
  const { bounds: t } = o, e = ni, s = Math.max(0.01, t.right - t.left), i = Math.max(0.01, t.south - t.north), n = (t.left + t.right) / 2, r = (t.north + t.south) / 2, a = Number.isFinite(o.largestRadius) ? Math.max(0, o.largestRadius) : 0, l = Number.isFinite(o.startingHeight) ? Math.max(0, o.startingHeight) : 0, c = Math.max(12, l + 5 + a), h = c - De, d = (c + De) / 2, p = {
    name: "display-floor",
    size: {
      // Keep the large safety apron from v2.0.2. The walls define the
      // playable viewport, while the wider floor catches any temporary
      // solver overlap instead of allowing an endless fall.
      width: Math.max(24, s + e * 2),
      height: be,
      depth: Math.max(24, i + e * 2)
    },
    position: new _(n, -be / 2, r)
  }, u = {
    name: "display-wall-north",
    size: { width: s + e * 2, height: h, depth: e },
    position: new _(n, d, t.north - e / 2)
  }, g = {
    name: "display-wall-south",
    size: { width: s + e * 2, height: h, depth: e },
    position: new _(n, d, t.south + e / 2)
  }, I = {
    name: "display-wall-west",
    size: { width: e, height: h, depth: i + e * 2 },
    position: new _(t.left - e / 2, d, r)
  }, y = {
    name: "display-wall-east",
    size: { width: e, height: h, depth: i + e * 2 },
    position: new _(t.right + e / 2, d, r)
  };
  return { floor: p, walls: [u, g, I, y] };
}, hi = (o, t, e, s, i) => {
  const n = Ue(t, e, o);
  n.position.copyFrom(s), n.isVisible = !1, n.isPickable = !1;
  const r = new Nt(n, N.STATIC, !1, o), a = ee.FromMesh(n);
  return a.material = i, r.shape = a, r.setMassProperties({ mass: 0 }), { body: r, mesh: n };
}, Y = Pt * 3.5, w = _.Zero(), Yt = B.Identity(), ci = (o, t, e) => ({
  disposeExisting: !e,
  totalBodyCount: (e ? Math.max(0, o) : 0) + Math.max(0, t)
}), ot = (o, t) => (t.copyFrom(o.node.rotationQuaternion ?? Yt), t.normalize()), zt = (o) => {
  const t = o.node.rotationQuaternion;
  return t != null && Number.isFinite(t.x) && Number.isFinite(t.y) && Number.isFinite(t.z) && Number.isFinite(t.w) && t.lengthSquared() > 1e-12;
};
var O, J, et, ut, V, k, $, W, q, Q, z, _t, lt, Ct, gt, Zt, bt, Ze, Dt, Ke, Et, Xe, Tt, ft, Kt, mt, Xt, kt, je, yt, jt, Rt, Je, Lt, $e, Ot, qe, wt, ts, Ht, es, Bt, ss, ht, St, Mt, Jt;
class _i extends cs {
  constructor() {
    super(...arguments);
    D(this, lt);
    D(this, gt);
    D(this, bt);
    D(this, Dt);
    D(this, Et);
    D(this, ft);
    D(this, mt);
    D(this, kt);
    D(this, yt);
    D(this, Rt);
    D(this, Lt);
    D(this, Ot);
    D(this, wt);
    D(this, Ht);
    D(this, Bt);
    D(this, ht);
    D(this, Mt);
    ie(this, "mode", "physics");
    D(this, O, []);
    D(this, J, /* @__PURE__ */ new Map());
    D(this, et, /* @__PURE__ */ new Map());
    D(this, ut, []);
    D(this, V, void 0);
    D(this, k, void 0);
    D(this, $, "");
    D(this, W, 0);
    D(this, q, Pt);
    D(this, Q, 0);
    D(this, z, void 0);
    D(this, _t, /* @__PURE__ */ new WeakMap());
    D(this, Tt, (e) => e.lastBodyCollisionElapsedMs !== void 0 && e.elapsedMs - e.lastBodyCollisionElapsedMs <= Math.max(Y, e.profile.bodyContactSettleDelayMs));
  }
  async init(e) {
    await super.init(e);
    const s = e.options.physicsWasmUrl || `${e.options.origin}${e.options.assetPath}havok/HavokPhysics.wasm`, i = await os({ locateFile: () => s }), n = new xs(!0, i);
    R(this, V, n), this.scene.enablePhysics(new _(0, -9.81 * e.options.gravity, 0), n);
    const r = this.scene.getPhysicsEngine();
    r == null || r.setTimeStep(Be), r == null || r.setSubTimeStep(Pt), this.buildBounds();
  }
  async createTimelineEntries(e, s, i, n, r) {
    const a = await super.createTimelineEntries(e, s, i, n, r);
    for (const l of a.entries)
      m(this, _t).set(l, {
        position: l.start.clone(),
        velocity: l.launchVelocity.clone()
      });
    return a;
  }
  animate(e, s, i = this.options.settleTimeout, n = 1e3) {
    return this.createBodies(e), E(this, lt, Ct).call(this, s, i);
  }
  animateAdditional(e, s, i) {
    var n, r;
    if (this.createBodies(e, !0), i <= 0) {
      if (s.aborted)
        return Promise.reject(new re());
      for (const a of e) {
        const l = m(this, J).get(a);
        if (!l)
          continue;
        const { body: c, entry: h, shape: d } = l;
        h.node.setEnabled(!0), h.node.position.copyFrom(h.end), h.node.rotationQuaternion = h.target.clone(), h.node.computeWorldMatrix(!0), d.filterMembershipMask = At, d.filterCollideMask = Ut, c.setMotionType(N.ANIMATED), c.disablePreStep = !1, c.setTargetTransform(h.end, h.target), c.setMotionType(N.STATIC), c.disablePreStep = !0, l.launched = !0, l.collisionsArmed = !0, l.state = "complete", l.locked = !0, R(this, Q, Math.max(0, m(this, Q) - 1));
        try {
          (n = m(this, V)) == null || n.setActivationControl(c, Z.ALWAYS_INACTIVE);
        } catch {
        }
      }
      return (r = this.scene) == null || r.render(), Promise.resolve();
    }
    return E(this, lt, Ct).call(this, s, i);
  }
  async displayInitialAndExplosionTimeline(e) {
    var g, I;
    let s = 0;
    for (; ((I = (g = e.plan.phases[s]) == null ? void 0 : g.actions[0]) == null ? void 0 : I.kind) === "explode"; )
      s++;
    if (s === 0)
      return super.displayInitialAndExplosionTimeline(e);
    const i = /* @__PURE__ */ new Map(), n = [], r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
    for (const [y, C] of e.handles) {
      r.set(y, C.entries);
      for (const A of C.entries)
        a.set(A, y);
    }
    for (let y = 0; y < s; y++) {
      const C = e.plan.phases[y], A = C.actions.reduce((x, f) => {
        var S;
        return f.kind !== "explode" ? x : x + (((S = e.plan.definitions.get(f.dieId)) == null ? void 0 : S.sides) === 100 ? 2 : 1);
      }, 0);
      let M = 0;
      for (let x = 0; x < C.actions.length; x++) {
        const f = C.actions[x];
        if (f.kind !== "explode")
          continue;
        const S = e.plan.definitions.get(f.dieId), P = {
          ...S,
          value: f.value,
          discarded: f.discarded
        }, T = await this.createTimelineEntries(
          P,
          e.configs.get(S.theme),
          M,
          A,
          `${e.plan.seed}:${C.id}:${f.dieId}`
        );
        M += T.entries.length;
        for (const v of T.entries)
          v.launchDelayMs = 0, v.node.setEnabled(!1);
        e.handles.set(f.dieId, T), r.set(f.dieId, T.entries);
        for (const v of T.entries)
          a.set(v, f.dieId);
        const L = { phaseIndex: y, actionIndex: x, action: f, handle: T };
        i.set(f.dieId, L), n.push(L);
      }
    }
    const l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), h = Ps(n.map((y) => ({
      phaseIndex: y.phaseIndex,
      actionIndex: y.actionIndex,
      parentDieId: y.action.parentDieId,
      dieId: y.action.dieId
    }))), d = (y) => {
      const C = e.handles.get(y.action.parentDieId);
      if (this.options.timeline.effects.explode.origin !== "source" || !(C != null && C.entries[0]))
        return;
      const A = e.plan.phases[y.phaseIndex], M = fs(
        `${e.plan.seed}:${A.id}:${y.action.dieId}:source`
      );
      for (let x = 0; x < y.handle.entries.length; x++) {
        const f = y.handle.entries[x], S = C.entries[x % C.entries.length];
        f.start.set(
          S.node.position.x + M.range(-1, 1) * this.options.timeline.effects.explode.spread,
          S.node.position.y + S.supportHeight + f.supportHeight + this.options.timeline.effects.explode.burstHeight,
          S.node.position.z + M.range(-1, 1) * this.options.timeline.effects.explode.spread
        ), f.node.position.copyFrom(f.start);
        const P = f.end.subtract(f.start).normalize();
        f.launchVelocity.copyFrom(
          P.scale(Math.max(2.4, this.options.throwForce * 0.55))
        ), f.launchVelocity.y = Math.max(
          2.8,
          this.options.timeline.effects.explode.burstHeight * 2
        );
      }
    }, p = (y) => {
      for (const C of y) {
        const A = i.get(C.dieId);
        A && (d(A), this.createBodies(A.handle.entries, !0));
      }
    }, u = (y) => {
      l.add(y);
      const C = a.get(y);
      if (!C || c.has(C) || (r.get(C) ?? []).some((x) => !l.has(x)))
        return;
      c.add(C);
      const M = h.settle(C);
      M.completed && ae(
        this.options.onTimelineProgress,
        e.progress.completePhaseAction(
          M.completed.phaseIndex,
          M.completed.actionIndex
        )
      ), p(M.spawned);
    };
    return ae(this.options.onTimelineProgress, e.progress.initial()), this.createBodies(e.initialEntries), await E(this, lt, Ct).call(this, e.signal, this.options.settleTimeout, u), s;
  }
  animateTimelineReroll(e, s, i, n) {
    var a;
    const r = [];
    for (const l of e) {
      const c = m(this, J).get(l);
      c && r.push(c);
    }
    for (const l of r) {
      l.body.setMotionType(N.ANIMATED), l.body.disablePreStep = !1;
      try {
        (a = m(this, V)) == null || a.setActivationControl(l.body, Z.ALWAYS_ACTIVE);
      } catch {
      }
    }
    return super.animateTimelineReroll(e, s, i, n).finally(() => {
      var l;
      for (const c of r) {
        c.body.setTargetTransform(
          c.entry.node.position,
          c.entry.node.rotationQuaternion ?? Yt
        ), c.body.setLinearVelocity(w), c.body.setAngularVelocity(w), c.body.setMotionType(N.STATIC), c.body.disablePreStep = !0;
        try {
          (l = m(this, V)) == null || l.setActivationControl(c.body, Z.ALWAYS_INACTIVE);
        } catch {
        }
      }
    });
  }
  createBodies(e, s = !1) {
    var a, l, c;
    const i = ci(m(this, O).length, e.length, s);
    i.disposeExisting && this.disposeDynamicBodies();
    const n = We(i.totalBodyCount);
    R(this, q, n.milliseconds);
    const r = (a = this.scene) == null ? void 0 : a.getPhysicsEngine();
    r == null || r.setTimeStep(n.seconds), r == null || r.setSubTimeStep(n.milliseconds), R(this, W, e.reduce(
      (h, d) => Math.max(h, d.horizontalRadius),
      s ? m(this, W) : 0
    )), this.buildBounds(void 0, void 0, m(this, W)), s && E(this, Ht, es).call(this, e);
    for (const h of e) {
      if (m(this, J).has(h) || m(this, et).has(h.node.name))
        throw new Error(`Duplicate physics body identity '${h.node.name}'.`);
      m(this, k) && (nt(h.end, m(this, k), h.horizontalRadius), h.node.position.copyFrom(h.start));
      const d = ks(h.sides), p = h.launchVelocity.clone(), u = Hs(
        h.node.position.y,
        h.supportHeight,
        p.y,
        9.81 * this.options.gravity
      ), g = new _(
        p.x * u,
        h.end.y - h.node.position.y,
        p.z * u
      ), I = Math.max(0, this.options.spinForce * 0.05), y = new _(
        h.spinX * I,
        h.spinY * I,
        h.spinZ * I
      ), C = Vs(
        y,
        g,
        Math.hypot(p.x, p.z),
        h.horizontalRadius,
        h.sides
      ), A = Fs(
        C,
        g,
        u,
        h.sides,
        this.options.spinForce
      ), M = Ns(
        h.target,
        g,
        d.landingApproachAngle
      ), x = Bs(
        M,
        A,
        u
      );
      h.node.rotationQuaternion = x, h.node.computeWorldMatrix(!0);
      const f = Os(h.target, h.sides), S = new Nt(h.node, N.DYNAMIC, !1, this.scene), P = E(this, wt, ts).call(this, h);
      P.material = { friction: this.options.friction, restitution: this.options.restitution }, P.filterMembershipMask = 0, P.filterCollideMask = 0, S.shape = P, S.setMassProperties({ mass: this.options.mass * Rs(h.sides) }), S.setMotionType(N.ANIMATED), S.setLinearDamping(this.options.linearDamping), S.setAngularDamping(0), S.setLinearVelocity(w), S.setAngularVelocity(w), h.node.setEnabled(!1);
      try {
        (l = m(this, V)) == null || l.setActivationControl(S, Z.ALWAYS_INACTIVE);
      } catch {
      }
      const T = {
        body: S,
        shape: P,
        entry: h,
        profile: d,
        localFaceNormal: f.localNormal,
        restDirection: f.restDirection,
        flightStartQuaternion: x.clone(),
        launchAngularVelocity: A.clone(),
        launchLinearVelocity: p.clone(),
        launchDelayMs: h.launchDelayMs,
        settleRollAxis: se(g).scale(0.35).add(f.restDirection.scale(0.65)).normalize(),
        flightDurationMs: u * 1e3,
        currentQuaternionScratch: B.Identity(),
        lockRotationScratch: B.Identity(),
        lockPositionScratch: _.Zero(),
        guidanceStartInput: {
          elapsedMs: 0,
          firstGroundImpactElapsedMs: void 0,
          groundImpactCount: 0,
          positionY: 0,
          timeoutRemainingMs: 0
        },
        finalLockInput: {
          angle: 0,
          angularSpeed: 0,
          elapsedMs: 0,
          groundContactElapsedMs: 0,
          hasGroundContact: !1,
          bodyContactElapsedMs: 0,
          lastBodyContactElapsedMs: void 0,
          linearSpeed: 0,
          positionY: 0,
          stableElapsedMs: 0
        },
        flightCorrectionVelocity: _.Zero(),
        launchDelayElapsedMs: 0,
        launched: !1,
        collisionsArmed: !1,
        collisionObserver: void 0,
        state: "freeFall",
        locked: !1,
        elapsedMs: 0,
        guidanceElapsedMs: 0,
        stableElapsedMs: 0,
        lockElapsedMs: 0,
        lockDurationMs: d.finalLockDurationMs,
        lockSourcePosition: void 0,
        lockTargetPosition: void 0,
        lockSourceQuaternion: void 0,
        lockTargetQuaternion: void 0,
        groundImpactCount: 0,
        firstGroundImpactElapsedMs: void 0,
        groundContactStartedElapsedMs: void 0,
        lastGroundContactElapsedMs: void 0,
        bodySupportImpactCount: 0,
        firstBodySupportImpactElapsedMs: void 0,
        bodyContactStartedElapsedMs: void 0,
        lastBodyContactElapsedMs: void 0,
        lastBodyCollisionElapsedMs: void 0,
        bodyCollisionStartedElapsedMs: void 0,
        bodySupport: void 0,
        wallImpactCount: 0,
        lastWallImpactElapsedMs: void 0,
        forcedLock: !1,
        forcedLockBodyCollision: !1,
        settledReported: !1
      };
      S.setCollisionCallbackEnabled(!0), T.collisionObserver = S.getCollisionObservable().add((L) => {
        E(this, Bt, ss).call(this, T, L), L.type !== xt.COLLISION_FINISHED && this.options.onCollision({
          action: "collision",
          body0Id: L.collider.transformNode.name,
          body1Id: L.collidedAgainst.transformNode.name,
          force: Math.abs(L.impulse)
        });
      }), m(this, O).push(T), m(this, J).set(h, T), m(this, et).set(h.node.name, T), ne(this, Q)._++;
    }
    (c = m(this, z)) == null || c.recordBodies(m(this, O).length);
  }
  buildBounds(e, s, i = m(this, W)) {
    var u;
    if (!this.context || !this.scene || !this.options || !m(this, V) || !this.scene.getPhysicsEngine())
      return;
    const n = this.context.canvas, r = Math.max(1, (e ?? n.clientWidth) || n.width || 300), a = Math.max(1, (s ?? n.clientHeight) || n.height || 150), l = us({
      width: r,
      height: a,
      cameraHeight: _s,
      cameraFov: gs,
      wallPadding: this.options.wallPadding,
      minimumRadius: i
    }), c = [
      r,
      a,
      this.options.wallPadding,
      this.options.startingHeight,
      this.options.friction,
      this.options.restitution,
      i
    ].join("|");
    if (c === m(this, $))
      return;
    E(this, ht, St).call(this);
    const h = this.scene, d = (g, I, y, C, A) => {
      const M = hi(
        h,
        g,
        I,
        y,
        C
      );
      M.body.shape && (M.body.shape.filterMembershipMask = A, M.body.shape.filterCollideMask = At), m(this, ut).push(M);
    }, p = li({
      bounds: l,
      startingHeight: this.options.startingHeight,
      largestRadius: i
    });
    try {
      d(p.floor.name, p.floor.size, p.floor.position, {
        friction: this.options.friction,
        restitution: this.options.restitution
      }, Ye);
      const [g, I, y, C] = p.walls;
      for (const [A, M] of [
        [g, X.north],
        [I, X.south],
        [y, X.left],
        [C, X.right]
      ])
        d(A.name, A.size, A.position, {
          friction: oi,
          restitution: ri
        }, M);
    } catch (g) {
      throw E(this, ht, St).call(this), R(this, k, void 0), R(this, $, ""), g;
    }
    (u = this.environment) == null || u.ensureGroundCoverage(p.floor.size.width, p.floor.size.depth), R(this, k, l), R(this, $, c);
  }
  resize(e, s) {
    super.resize(e, s), this.buildBounds(e, s, m(this, W)), E(this, Mt, Jt).call(this);
  }
  async updateOptions(e) {
    var s, i;
    await super.updateOptions(e), (i = (s = this.scene) == null ? void 0 : s.getPhysicsEngine()) == null || i.setGravity(new _(0, -9.81 * e.gravity, 0)), R(this, $, ""), this.buildBounds(void 0, void 0, m(this, W)), E(this, Mt, Jt).call(this);
  }
  disposeDynamicBodies() {
    var e;
    for (const { body: s, collisionObserver: i } of m(this, O).splice(0)) {
      i && s.getCollisionObservable().remove(i), s.setCollisionCallbackEnabled(!1);
      try {
        (e = s.shape) == null || e.dispose();
      } catch {
      }
      s.dispose();
    }
    m(this, J).clear(), m(this, et).clear(), R(this, Q, 0), R(this, z, void 0);
  }
  clear() {
    this.disposeDynamicBodies(), R(this, W, 0), super.clear();
  }
  dispose() {
    this.disposeDynamicBodies(), E(this, ht, St).call(this), R(this, k, void 0), R(this, $, ""), R(this, W, 0), R(this, V, void 0), super.dispose();
  }
}
O = new WeakMap(), J = new WeakMap(), et = new WeakMap(), ut = new WeakMap(), V = new WeakMap(), k = new WeakMap(), $ = new WeakMap(), W = new WeakMap(), q = new WeakMap(), Q = new WeakMap(), z = new WeakMap(), _t = new WeakMap(), lt = new WeakSet(), Ct = function(e, s, i) {
  return globalThis.__DICE3DVIEW_PHYSICS_PROFILE__ === !0 ? import("./physicsPerformance-9d14f224.js").then((r) => {
    const a = new r.PhysicsPerformanceRecorder();
    return E(this, gt, Zt).call(this, e, s, i, {
      recorder: a,
      publish: () => r.publishPhysicsPerformanceSnapshot(a.complete())
    });
  }) : E(this, gt, Zt).call(this, e, s, i);
}, gt = new WeakSet(), Zt = function(e, s, i, n) {
  const r = this.engine, a = this.scene, l = Math.max(250, s), c = n == null ? void 0 : n.recorder;
  return R(this, z, c), c == null || c.recordBodies(m(this, O).length), new Promise((h, d) => {
    let p = !1;
    const u = a.onBeforePhysicsObservable.add(() => {
      const A = (c == null ? void 0 : c.now()) ?? 0;
      for (const M of m(this, O))
        E(this, kt, je).call(this, M, m(this, q), l);
      c && c.recordPhysicsStep(
        c.now() - A,
        m(this, O).length,
        m(this, q)
      );
    }), g = a.onAfterPhysicsObservable.add(() => {
      for (const A of m(this, O))
        A.state === "commit" && E(this, Ot, qe).call(this, A);
    }), I = (A) => {
      p || (p = !0, r.stopRenderLoop(C), a.onBeforePhysicsObservable.remove(u), a.onAfterPhysicsObservable.remove(g), e.removeEventListener("abort", y), c && (n == null || n.publish(), m(this, z) === c && R(this, z, void 0)), A ? d(A) : h());
    }, y = () => I(new re()), C = () => {
      const A = (c == null ? void 0 : c.now()) ?? 0;
      if (e.aborted)
        return y();
      E(this, bt, Ze).call(this);
      let M = !1, x;
      for (const f of m(this, O))
        f.state === "finalLock" && f.forcedLock && (M = !0), !(f.locked || f.state === "commit") && f.launched && (E(this, mt, Xt).call(this, f) || !zt(f.entry) ? E(this, Lt, $e).call(this, f) : f.elapsedMs >= l + f.profile.timeoutExtensionMs && !m(this, Tt).call(this, f) && (x === void 0 || f.entry.node.position.y < x.entry.node.position.y) && (x = f));
      if (!M && x && E(this, yt, jt).call(this, x, !0), a.render(), c == null || c.recordFrame(c.now() - A), i)
        try {
          for (const f of m(this, O))
            !f.locked || f.settledReported || (f.settledReported = !0, i(f.entry));
        } catch (f) {
          I(f);
          return;
        }
      m(this, Q) === 0 && I();
    };
    e.addEventListener("abort", y, { once: !0 }), r.runRenderLoop(C);
  });
}, bt = new WeakSet(), Ze = function() {
  var r;
  let e = 0, s = !1;
  for (const a of m(this, O))
    a.locked || a.state === "commit" || a.state === "complete" || (e++, (!a.launched || a.groundImpactCount + a.bodySupportImpactCount === 0) && (s = !0));
  const i = Js({
    totalBodyCount: m(this, O).length,
    activeBodyCount: e,
    requiresDenseResolution: s
  });
  if (Math.abs(m(this, q) - i.milliseconds) <= 1e-6)
    return;
  R(this, q, i.milliseconds);
  const n = (r = this.scene) == null ? void 0 : r.getPhysicsEngine();
  n == null || n.setTimeStep(i.seconds), n == null || n.setSubTimeStep(i.milliseconds);
}, Dt = new WeakSet(), Ke = function(e) {
  var a;
  if (e.launched)
    return;
  const { body: s, entry: i, profile: n, shape: r } = e;
  i.node.setEnabled(!0), i.node.computeWorldMatrix(!0), r.filterMembershipMask = At, r.filterCollideMask = ai(i.launchEdge), s.setMotionType(N.DYNAMIC), s.disablePreStep = !0, s.setLinearDamping(this.options.linearDamping), s.setAngularDamping(0);
  try {
    (a = m(this, V)) == null || a.setActivationControl(s, Z.ALWAYS_ACTIVE);
  } catch {
  }
  s.setLinearVelocity(e.launchLinearVelocity), s.setAngularVelocity(Ce(
    e.launchAngularVelocity,
    0,
    e.flightDurationMs / 1e3,
    n.landingSpinRetention
  )), e.launched = !0, E(this, ft, Kt).call(this, e);
}, Et = new WeakSet(), Xe = function(e) {
  var s, i;
  (s = m(this, z)) == null || s.recordLaunchClearanceQuery();
  for (const n of m(this, O))
    if (!(n === e || !n.launched) && ((i = m(this, z)) == null || i.recordLaunchPairCheck(), !ze(
      e.entry.node.position,
      e.entry.horizontalRadius,
      n.entry.node.position,
      n.entry.horizontalRadius
    )))
      return !1;
  return !0;
}, Tt = new WeakMap(), ft = new WeakSet(), Kt = function(e) {
  e.collisionsArmed || !e.launched || m(this, k) && !ds(
    e.entry.node.position,
    m(this, k),
    e.entry.horizontalRadius,
    e.entry.launchEdge
  ) || (e.shape.filterCollideMask = Ut, e.collisionsArmed = !0);
}, mt = new WeakSet(), Xt = function(e) {
  const s = e.entry.node.position;
  if (!e.collisionsArmed)
    return !Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.z) || s.y < -2;
  const i = m(this, k) ? Math.max(
    11.5,
    Math.abs(m(this, k).left),
    Math.abs(m(this, k).right),
    Math.abs(m(this, k).north),
    Math.abs(m(this, k).south)
  ) + e.entry.horizontalRadius + 1 : void 0;
  return si(s, i);
}, kt = new WeakSet(), je = function(e, s, i) {
  var p;
  if (e.locked || e.state === "commit" || e.state === "complete")
    return;
  if (!e.launched) {
    if (e.launchDelayElapsedMs += s, e.launchDelayElapsedMs + 1e-6 < e.launchDelayMs || !E(this, Et, Xe).call(this, e))
      return;
    E(this, Dt, Ke).call(this, e);
  }
  E(this, ft, Kt).call(this, e);
  const { body: n, entry: r, profile: a } = e;
  if (E(this, mt, Xt).call(this, e) || !zt(r))
    return;
  e.elapsedMs += s;
  const l = Math.max(0, i - e.elapsedMs), c = e.lastGroundContactElapsedMs !== void 0 && e.elapsedMs - e.lastGroundContactElapsedMs <= Y;
  c || (e.groundContactStartedElapsedMs = void 0);
  const h = e.lastBodyContactElapsedMs !== void 0 && e.elapsedMs - e.lastBodyContactElapsedMs <= Y;
  h || (e.bodyContactStartedElapsedMs = void 0, e.bodySupport = void 0);
  const d = e.lastBodyCollisionElapsedMs !== void 0 && e.elapsedMs - e.lastBodyCollisionElapsedMs <= Y;
  if (d || (e.bodyCollisionStartedElapsedMs = void 0), e.state === "freeFall") {
    const u = Math.max(0, e.elapsedMs - s) / 1e3, g = e.flightDurationMs / 1e3, I = Gs(
      e.flightStartQuaternion,
      e.launchAngularVelocity,
      u,
      g,
      a.landingSpinRetention
    ), y = Ce(
      e.launchAngularVelocity,
      u,
      g,
      a.landingSpinRetention
    ), C = zs(
      n.getAngularVelocity() ?? w,
      ot(r, e.currentQuaternionScratch),
      e.localFaceNormal,
      I,
      y,
      e.flightCorrectionVelocity,
      Math.max(0, g - u),
      a,
      Math.min(1, e.elapsedMs / Math.max(1, e.flightDurationMs)),
      s
    );
    e.flightCorrectionVelocity = C.correctionVelocity, n.setAngularVelocity(C.velocity);
    const A = n.getLinearVelocity();
    if (A) {
      const P = Ws(
        A,
        r.node.position,
        r.end,
        a,
        Math.min(1, e.elapsedMs / Math.max(1, e.flightDurationMs)),
        Math.max(
          2.2,
          Math.hypot(
            e.launchLinearVelocity.x,
            e.launchLinearVelocity.z
          ) * 0.4
        )
      );
      (e.wallImpactCount > 0 || e.groundImpactCount > 0 || e.lastBodyCollisionElapsedMs !== void 0) && (P.x = A.x, P.z = A.z), n.setLinearVelocity(P);
    }
    if (e.groundImpactCount + e.bodySupportImpactCount === 0 && l >= a.timeoutWindowMs)
      return;
    const M = e.firstGroundImpactElapsedMs, x = e.firstBodySupportImpactElapsedMs, f = M === void 0 ? x : x === void 0 ? M : Math.min(M, x), S = e.guidanceStartInput;
    if (S.elapsedMs = e.elapsedMs, S.firstGroundImpactElapsedMs = f, S.groundImpactCount = e.groundImpactCount + e.bodySupportImpactCount, S.positionY = r.node.position.y, S.timeoutRemainingMs = l, !Ks(S, a))
      return;
    e.state = "guidedSettle", e.guidanceElapsedMs = 0, n.setAngularDamping(this.options.angularDamping);
  }
  if (e.state === "guidedSettle") {
    e.guidanceElapsedMs += s;
    const u = 1 - Math.min(1, l / Math.max(1, a.timeoutWindowMs)), g = Math.max(
      Math.min(1, e.guidanceElapsedMs / a.durationMs),
      u
    ), I = ot(r, e.currentQuaternionScratch), y = vs(
      n.getAngularVelocity() ?? w,
      e.settleRollAxis,
      a,
      e.guidanceElapsedMs,
      s
    ), C = Qs(
      y,
      I,
      e.localFaceNormal,
      e.restDirection,
      a,
      g,
      s,
      "settle"
    );
    n.setAngularVelocity(C.velocity);
    let A = n.getLinearVelocity() ?? w;
    (c || h || e.groundImpactCount + e.bodySupportImpactCount > 0 || r.node.position.y <= a.maxGuideStartHeight) && (A = Ys(
      A,
      a,
      g,
      s
    ), n.setLinearVelocity(A));
    const M = c && e.groundContactStartedElapsedMs !== void 0 ? e.elapsedMs - e.groundContactStartedElapsedMs : 0, x = h && ((p = e.bodySupport) == null ? void 0 : p.locked) === !0, f = d && e.bodyCollisionStartedElapsedMs !== void 0 ? e.elapsedMs - e.bodyCollisionStartedElapsedMs : 0, S = e.finalLockInput;
    S.angle = C.angle, S.angularSpeed = C.velocity.length(), S.elapsedMs = e.elapsedMs, S.groundContactElapsedMs = M, S.hasGroundContact = c || x, S.bodyContactElapsedMs = f, S.lastBodyContactElapsedMs = e.lastBodyCollisionElapsedMs, S.linearSpeed = A.length(), S.positionY = r.node.position.y, S.stableElapsedMs = a.stableDurationMs;
    const P = Xs(S, a);
    e.stableElapsedMs = P ? e.stableElapsedMs + s : 0, P && e.stableElapsedMs >= a.stableDurationMs && E(this, yt, jt).call(this, e, !1);
    return;
  }
  if (e.state === "finalLock") {
    if (e.forcedLock && e.forcedLockBodyCollision) {
      E(this, Rt, Je).call(this, e);
      return;
    }
    e.lockElapsedMs += s;
    const u = Math.min(1, e.lockElapsedMs / Math.max(1, e.lockDurationMs)), g = st(u), I = e.lockSourceQuaternion ?? ot(r, e.currentQuaternionScratch), y = e.lockTargetQuaternion ?? I, C = B.SlerpToRef(I, y, g, e.lockRotationScratch).normalize(), A = e.lockSourcePosition ?? r.node.position, M = e.lockTargetPosition ?? A, x = _.LerpToRef(A, M, g, e.lockPositionScratch);
    n.setTargetTransform(x, C), u >= 1 && (e.state = "commit");
  }
}, yt = new WeakSet(), jt = function(e, s) {
  if (e.locked || e.state === "finalLock" || e.state === "commit" || e.state === "complete" || !s && e.state !== "guidedSettle")
    return;
  const i = ot(e.entry, e.currentQuaternionScratch);
  if (!s) {
    e.body.setLinearVelocity(w), e.body.setAngularVelocity(w), e.state = "commit";
    return;
  }
  const n = ws(
    i,
    e.localFaceNormal,
    e.restDirection,
    s ? e.profile.settleDeadZoneAngle : e.profile.angleThreshold
  ), r = e.entry.node.position.clone(), a = e.lastGroundContactElapsedMs !== void 0 && e.elapsedMs - e.lastGroundContactElapsedMs <= Y, l = s ? new _(
    r.x,
    a ? e.entry.supportHeight : Math.max(e.entry.supportHeight, r.y),
    r.z
  ) : r.clone();
  s && m(this, k) && nt(
    l,
    m(this, k),
    e.entry.horizontalRadius
  ), e.state = "finalLock", e.forcedLock = s, e.forcedLockBodyCollision = !1, e.lockElapsedMs = 0, e.lockDurationMs = Us(n.angle, e.profile, s), e.lockSourcePosition = r, e.lockTargetPosition = l, e.lockSourceQuaternion = i.clone(), e.lockTargetQuaternion = we(i, n.targetQuaternion), e.body.setLinearVelocity(w), e.body.setAngularVelocity(w), e.body.setMotionType(N.ANIMATED), e.body.setTargetTransform(r, i);
}, Rt = new WeakSet(), Je = function(e) {
  var r, a, l;
  const { body: s } = e, i = ((r = s.getLinearVelocity()) == null ? void 0 : r.clone()) ?? w, n = ((a = s.getAngularVelocity()) == null ? void 0 : a.clone()) ?? w;
  s.setMotionType(N.DYNAMIC), s.disablePreStep = !0;
  try {
    (l = m(this, V)) == null || l.setActivationControl(s, Z.ALWAYS_ACTIVE);
  } catch {
  }
  s.setLinearVelocity(i), s.setAngularVelocity(n), e.state = "guidedSettle", e.forcedLock = !1, e.forcedLockBodyCollision = !1, e.stableElapsedMs = 0, e.lockElapsedMs = 0, e.lockSourcePosition = void 0, e.lockTargetPosition = void 0, e.lockSourceQuaternion = void 0, e.lockTargetQuaternion = void 0;
}, Lt = new WeakSet(), $e = function(e) {
  if (e.locked || e.state === "commit" || e.state === "complete")
    return;
  const { body: s, entry: i } = e, n = i.end.clone();
  m(this, k) && nt(n, m(this, k), i.horizontalRadius);
  const r = zt(i) ? Vt(
    ot(i, e.currentQuaternionScratch),
    e.localFaceNormal,
    e.restDirection
  ).targetQuaternion : i.target.clone();
  s.setMotionType(N.ANIMATED), s.setLinearVelocity(w), s.setAngularVelocity(w), i.node.position.copyFrom(n), i.node.rotationQuaternion = r, i.node.computeWorldMatrix(!0), s.disablePreStep = !1, e.state = "commit";
}, Ot = new WeakSet(), qe = function(e) {
  var i;
  if (e.state !== "commit")
    return;
  const { body: s } = e;
  s.disablePreStep = !0, s.setLinearVelocity(w), s.setAngularVelocity(w), s.setMotionType(N.STATIC);
  try {
    (i = m(this, V)) == null || i.setActivationControl(s, Z.ALWAYS_INACTIVE);
  } catch {
  }
  e.state = "complete", e.locked = !0, R(this, Q, Math.max(0, m(this, Q) - 1));
}, wt = new WeakSet(), ts = function(e) {
  if (e.physicsCollider) {
    const i = e.physicsCollider.clone(`${e.node.name}-physics-collider`, null, !1);
    if (!i)
      throw new Error(`Unable to clone physics collider for '${e.node.name}'.`);
    i.setEnabled(!0), i.isVisible = !1, i.position.setAll(0), i.rotationQuaternion = Yt.clone(), i.scaling.set(
      e.node.scaling.x * this.options.colliderScale,
      e.node.scaling.y * this.options.colliderScale,
      e.node.scaling.z * this.options.colliderScale
    ), i.computeWorldMatrix(!0);
    try {
      return new fe(i, this.scene);
    } finally {
      i.dispose(!1, !1);
    }
  }
  const s = "getVerticesData" in e.node ? e.node : e.node.getChildMeshes(!1)[0];
  if (!s)
    throw new Error(`Unable to create physics shape for '${e.node.name}'.`);
  return s.computeWorldMatrix(!0), new fe(s, this.scene);
}, Ht = new WeakSet(), es = function(e) {
  const s = m(this, O).map((n) => ({
    position: n.entry.node.position,
    radius: n.entry.horizontalRadius
  })), i = m(this, O).map((n) => ({
    position: n.entry.node.position,
    radius: n.entry.horizontalRadius
  }));
  for (const n of e) {
    const r = m(this, _t).get(n);
    if (m(this, k)) {
      const c = ti(
        n.end,
        n.horizontalRadius,
        i,
        ps(m(this, k), n.horizontalRadius)
      );
      n.end.set(c.x, n.supportHeight, c.z);
    }
    const a = Math.max(n.start.y, this.options.startingHeight), l = ei(
      n.start,
      { x: n.end.x, y: a, z: n.end.z },
      (r == null ? void 0 : r.position) ?? n.start,
      n.horizontalRadius,
      s,
      a
    );
    if (n.start.set(l.position.x, l.position.y, l.position.z), n.node.position.copyFrom(n.start), l.origin === "overhead")
      n.launchVelocity.set(0, -Math.max(1.4, this.options.throwForce * 0.25), 0);
    else if (l.origin === "edge" && r)
      n.launchVelocity.copyFrom(r.velocity);
    else if (l.origin === "source") {
      const c = n.end.x - n.start.x, h = n.end.z - n.start.z, d = Math.hypot(c, h);
      if (d > 1e-4) {
        const p = Math.max(
          2.4,
          Math.hypot(n.launchVelocity.x, n.launchVelocity.z)
        );
        n.launchVelocity.x = c / d * p, n.launchVelocity.z = h / d * p;
      }
    }
    s.push({ position: n.start, radius: n.horizontalRadius }), i.push({ position: n.end, radius: n.horizontalRadius });
  }
}, Bt = new WeakSet(), ss = function(e, s) {
  var c, h;
  if (s.type === xt.COLLISION_FINISHED)
    return;
  (c = m(this, z)) == null || c.recordCollision();
  const i = e.entry.node.name, n = s.collider.transformNode.name, r = s.collidedAgainst.transformNode.name, a = n === i ? r : n;
  if (a === "display-floor") {
    (e.lastGroundContactElapsedMs === void 0 || e.elapsedMs - e.lastGroundContactElapsedMs > Y) && (e.groundImpactCount++, e.firstGroundImpactElapsedMs ?? (e.firstGroundImpactElapsedMs = e.elapsedMs), e.groundContactStartedElapsedMs = e.elapsedMs), e.lastGroundContactElapsedMs = e.elapsedMs;
    return;
  }
  if (a.startsWith("display-wall-")) {
    (e.lastWallImpactElapsedMs === void 0 || e.elapsedMs - e.lastWallImpactElapsedMs > Y) && e.wallImpactCount++, e.lastWallImpactElapsedMs = e.elapsedMs;
    return;
  }
  const l = m(this, et).get(a);
  if (a !== i && l) {
    e.state === "finalLock" && e.forcedLock && (e.forcedLockBodyCollision = !0), (e.lastBodyCollisionElapsedMs === void 0 || e.elapsedMs - e.lastBodyCollisionElapsedMs > Y) && (e.bodyCollisionStartedElapsedMs = e.elapsedMs), e.lastBodyCollisionElapsedMs = e.elapsedMs;
    const p = Math.abs(((h = s.normal) == null ? void 0 : h.y) ?? 0), u = s.point, g = u != null && u.y <= e.entry.node.position.y - Math.min(0.06, e.entry.supportHeight * 0.08), I = l.entry.node.position.y + 0.02 < e.entry.node.position.y;
    if (p < 0.45 || !g || !I)
      return;
    const y = e.lastBodyContactElapsedMs === void 0 || e.elapsedMs - e.lastBodyContactElapsedMs > Y, C = Zs(
      e.elapsedMs,
      e.flightDurationMs,
      e.entry.node.position.y,
      e.profile
    );
    y && (e.bodyContactStartedElapsedMs = e.elapsedMs), C && (y || e.bodySupportImpactCount === 0) && (e.bodySupportImpactCount++, e.firstBodySupportImpactElapsedMs ?? (e.firstBodySupportImpactElapsedMs = e.elapsedMs)), e.bodySupport = l, e.lastBodyContactElapsedMs = e.elapsedMs;
  }
}, ht = new WeakSet(), St = function() {
  var e;
  for (const { body: s, mesh: i } of m(this, ut).splice(0)) {
    try {
      (e = s.shape) == null || e.dispose();
    } catch {
    }
    s.dispose(), i.dispose();
  }
}, Mt = new WeakSet(), Jt = function() {
  var e, s;
  if (m(this, k))
    for (const i of m(this, O)) {
      const { body: n, entry: r } = i;
      nt(r.end, m(this, k), r.horizontalRadius);
      const a = i.collisionsArmed && (i.locked || i.state === "finalLock" || i.state === "commit" || i.state === "complete") ? nt(
        r.node.position,
        m(this, k),
        r.horizontalRadius
      ) : !1;
      if (i.state === "finalLock") {
        const c = Math.max(
          1,
          i.lockDurationMs - i.lockElapsedMs
        ), h = ((e = i.lockTargetPosition) == null ? void 0 : e.clone()) ?? new _(r.node.position.x, r.supportHeight, r.node.position.z), d = nt(
          h,
          m(this, k),
          r.horizontalRadius
        );
        (a || d) && (i.lockSourcePosition = r.node.position.clone(), i.lockTargetPosition = h, i.lockSourceQuaternion = ot(
          r,
          i.currentQuaternionScratch
        ).clone(), i.lockDurationMs = c, i.lockElapsedMs = 0);
      }
      if (!a)
        continue;
      r.node.computeWorldMatrix(!0);
      const l = n.getPrestepType();
      try {
        n.disablePreStep = !1, (s = m(this, V)) == null || s.setPhysicsBodyTransformation(n, r.node);
      } catch {
      } finally {
        n.setPrestepType(l);
      }
    }
};
export {
  _i as PhysicsRenderer,
  _i as default,
  ci as planPhysicsBodyBuild
};
