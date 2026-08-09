var E = (e, s, t) => {
  if (!s.has(e))
    throw TypeError("Cannot " + t);
};
var i = (e, s, t) => (E(e, s, "read from private field"), t ? t.call(e) : s.get(e)), h = (e, s, t) => {
  if (s.has(e))
    throw TypeError("Cannot add the same private member more than once");
  s instanceof WeakSet ? s.add(e) : s.set(e, t);
}, r = (e, s, t, c) => (E(e, s, "write to private field"), c ? c.call(e, t) : s.set(e, t), t);
var a = (e, s, t, c) => ({
  set _(d) {
    r(e, s, d, t);
  },
  get _() {
    return i(e, s, c);
  }
});
const H = "dice3dview:physics-hot-path", _ = () => {
  var e;
  return ((e = globalThis.performance) == null ? void 0 : e.now()) ?? Date.now();
}, R = () => globalThis.__DICE3DVIEW_PHYSICS_PROFILE__ === !0;
var n, u, o, p, m, M, f, y, P, C, S, l, b, g, x;
class w {
  constructor(s = _) {
    h(this, n, void 0);
    h(this, u, void 0);
    h(this, o, 0);
    h(this, p, 0);
    h(this, m, 0);
    h(this, M, 0);
    h(this, f, 0);
    h(this, y, 0);
    h(this, P, 0);
    h(this, C, 0);
    h(this, S, 0);
    h(this, l, 0);
    h(this, b, 0);
    h(this, g, 0);
    h(this, x, 0);
    r(this, n, s), r(this, u, s());
  }
  now() {
    return i(this, n).call(this);
  }
  recordBodies(s) {
    r(this, o, Math.max(i(this, o), s));
  }
  recordPhysicsStep(s, t, c) {
    a(this, m)._++;
    const d = Math.round(1e3 / Math.max(1e-3, c));
    d === 90 ? a(this, M)._++ : d === 120 ? a(this, f)._++ : d === 180 && a(this, y)._++, r(this, P, i(this, P) + t), r(this, C, i(this, C) + Math.max(0, s));
  }
  recordFrame(s) {
    const t = Math.max(0, s);
    a(this, p)._++, r(this, S, i(this, S) + t), r(this, l, Math.max(i(this, l), t));
  }
  recordCollision() {
    a(this, b)._++;
  }
  recordLaunchClearanceQuery() {
    a(this, g)._++;
  }
  recordLaunchPairCheck() {
    a(this, x)._++;
  }
  complete() {
    return Object.freeze({
      bodies: i(this, o),
      durationMs: Math.max(0, i(this, n).call(this) - i(this, u)),
      frames: i(this, p),
      physicsSteps: i(this, m),
      physicsSteps90Hz: i(this, M),
      physicsSteps120Hz: i(this, f),
      physicsSteps180Hz: i(this, y),
      guidanceCalls: i(this, P),
      guidanceMs: i(this, C),
      renderMs: i(this, S),
      maxRenderMs: i(this, l),
      collisionEvents: i(this, b),
      launchClearanceQueries: i(this, g),
      launchPairChecks: i(this, x)
    });
  }
}
n = new WeakMap(), u = new WeakMap(), o = new WeakMap(), p = new WeakMap(), m = new WeakMap(), M = new WeakMap(), f = new WeakMap(), y = new WeakMap(), P = new WeakMap(), C = new WeakMap(), S = new WeakMap(), l = new WeakMap(), b = new WeakMap(), g = new WeakMap(), x = new WeakMap();
const I = (e) => {
  var s;
  try {
    (s = globalThis.performance) == null || s.measure(H, {
      start: globalThis.performance.now() - e.durationMs,
      duration: e.durationMs,
      detail: e
    });
  } catch {
  }
};
export {
  H as PHYSICS_PERFORMANCE_ENTRY,
  w as PhysicsPerformanceRecorder,
  R as isPhysicsPerformanceProfilingEnabled,
  I as publishPhysicsPerformanceSnapshot
};
