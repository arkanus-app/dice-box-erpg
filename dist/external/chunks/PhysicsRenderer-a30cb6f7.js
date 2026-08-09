var Ae = Object.defineProperty;
var Ee = (o, i, t) => i in o ? Ae(o, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[i] = t;
var Gt = (o, i, t) => (Ee(o, typeof i != "symbol" ? i + "" : i, t), t), Dt = (o, i, t) => {
  if (!i.has(o))
    throw TypeError("Cannot " + t);
};
var h = (o, i, t) => (Dt(o, i, "read from private field"), t ? t.call(o) : i.get(o)), y = (o, i, t) => {
  if (i.has(o))
    throw TypeError("Cannot add the same private member more than once");
  i instanceof WeakSet ? i.add(o) : i.set(o, t);
}, L = (o, i, t, e) => (Dt(o, i, "write to private field"), e ? e.call(o, t) : i.set(o, t), t);
var Ot = (o, i, t, e) => ({
  set _(s) {
    L(o, i, s, t);
  },
  get _() {
    return h(o, i, e);
  }
}), D = (o, i, t) => (Dt(o, i, "access private method"), t);
import Ce from "@babylonjs/havok";
import "@babylonjs/core/Physics/physicsEngineComponent";
import { HavokPlugin as Ie } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { PhysicsBody as Kt } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType as N, PhysicsActivationControl as j, PhysicsEventType as Yt } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsShapeBox as be, PhysicsShapeConvexHull as Qt } from "@babylonjs/core/Physics/v2/physicsShape";
import { Quaternion as V, Vector3 as S } from "@babylonjs/core/Maths/math.vector";
import { K as ye, D as Wt, d as Ut, h as De, c as J, g as Pe, a as Le, b as Te, e as we, f as Fe } from "./index-5be182d3.js";
import { CreateBox as ke } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Materials/Textures/dynamicTexture";
import "@babylonjs/core/Materials/Textures/texture";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/Builders/planeBuilder";
import "@babylonjs/core/Meshes/mesh";
import "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import "@babylonjs/core/Meshes/Builders/discBuilder";
import "@babylonjs/core/Meshes/transformNode";
import "@babylonjs/core/Materials/material";
import "@babylonjs/core/Materials/materialPluginBase";
import "@babylonjs/core/Engines/engine";
import "@babylonjs/core/scene";
import "@babylonjs/core/Cameras/targetCamera";
import "@babylonjs/core/Lights/directionalLight";
import "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/core/Meshes/Builders/groundBuilder";
const ze = (o) => {
  const i = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
  for (const n of o) {
    const a = i.get(n.parentDieId) ?? [];
    a.push(n), i.set(n.parentDieId, a), t.set(n.dieId, n);
  }
  const e = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  return Object.freeze({
    settle: (n) => {
      if (e.has(n))
        return { completed: null, spawned: [] };
      e.add(n);
      const a = (i.get(n) ?? []).filter((r) => s.has(r.dieId) ? !1 : (s.add(r.dieId), !0));
      return {
        completed: t.get(n) ?? null,
        spawned: Object.freeze(a)
      };
    }
  });
}, Jt = {
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
}, U = (o = {}) => ({
  ...Jt,
  ...o
}), Re = {
  2: U({
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
  4: U({
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
  6: U({
    minElapsedMs: 540,
    forceGuideElapsedMs: 1400,
    durationMs: 1850,
    angularStrength: 7.2,
    maxAngularVelocity: 6.1,
    maxLandingVerticalSpeed: 2.5
  }),
  8: U(),
  10: U({
    forceGuideElapsedMs: 1300,
    durationMs: 1750,
    angularStrength: 8,
    maxAngularVelocity: 7.2,
    settleMaxAngularAcceleration: 36,
    landingBrakeStart: 0.85,
    maxLandingVerticalSpeed: 2.2
  }),
  12: U(),
  20: U({
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
  100: U({
    forceGuideElapsedMs: 1300,
    durationMs: 1750,
    angularStrength: 8,
    maxAngularVelocity: 7.2,
    settleMaxAngularAcceleration: 36,
    landingBrakeStart: 0.85,
    maxLandingVerticalSpeed: 2.2
  })
}, Ne = {
  2: 0.7,
  4: 0.82,
  6: 1,
  8: 0.92,
  10: 0.88,
  12: 1.08,
  20: 1.18,
  100: 0.88
}, k = (o, i, t) => Math.max(i, Math.min(t, o)), _e = Math.PI * 2, He = 0.72, Pt = 2.6, vt = (o) => k(o, 0, 1), K = (o) => {
  const i = vt(o);
  return i * i * (3 - 2 * i);
}, O = (o, i, t) => o + (i - o) * t, Ve = (o) => Re[o] ?? Jt, Ge = (o) => Ne[o] ?? 1, Bt = (o, i) => V.Dot(o, i) < 0 ? i.scale(-1) : i.clone(), Oe = (o, i) => {
  const e = Bt(o, i).normalize().multiply(o.conjugate()).normalize();
  e.w < 0 && e.scaleInPlace(-1);
  const s = 2 * Math.acos(k(e.w, -1, 1));
  if (s < 1e-4)
    return null;
  const n = Math.sqrt(Math.max(1e-6, 1 - e.w * e.w));
  return {
    angle: s,
    axis: new S(
      e.x / n,
      e.y / n,
      e.z / n
    ).normalize()
  };
}, Ye = (o, i) => {
  const t = i === 4 ? S.Down() : S.Up();
  return {
    localNormal: t.applyRotationQuaternion(o.conjugate()).normalize(),
    restDirection: t
  };
}, bt = (o, i, t) => {
  const e = o.clone().normalize(), s = i.applyRotationQuaternion(e).normalize(), n = t.clone().normalize(), a = V.Identity();
  V.FromUnitVectorsToRef(s, n, a);
  const r = a.multiply(e).normalize(), d = Oe(e, r);
  return d ? { angle: d.angle, axis: d.axis, targetQuaternion: r } : { angle: 0, axis: S.Zero(), targetQuaternion: e };
}, Qe = (o, i, t, e) => {
  const s = o.clone().normalize(), n = bt(s, i, t), a = Math.min(
    n.angle,
    Math.max(0, Number.isFinite(e) ? e : 0)
  ), r = Math.max(0, n.angle - a);
  return r <= 1e-4 ? {
    angle: 0,
    axis: S.Zero(),
    targetQuaternion: s,
    remainingAngle: n.angle
  } : {
    angle: r,
    axis: n.axis,
    targetQuaternion: V.RotationAxis(n.axis, r).multiply(s).normalize(),
    remainingAngle: a
  };
}, We = (o, i, t, e) => {
  const s = Math.max(0, o - i), n = Math.max(1e-3, Math.abs(e)), a = Number.isFinite(t) ? t : 0;
  return k((a + Math.sqrt(Math.max(0, a * a + 2 * n * s))) / n, 0.05, 4);
}, Ue = (o, i, t) => {
  const e = i.length();
  return !Number.isFinite(e) || e < 1e-4 || !Number.isFinite(t) ? o.clone().normalize() : V.RotationAxis(
    i.scale(1 / e),
    -e * Math.max(0, t)
  ).multiply(o).normalize();
}, Ze = (o, i, t) => {
  const e = new S(i.x, 0, i.z), s = k(
    Number.isFinite(t) ? Math.max(0, t) : 0,
    0,
    0.2
  );
  if (e.lengthSquared() <= 1e-8 || s <= 1e-4)
    return o.clone().normalize();
  e.normalize();
  const n = S.Cross(S.Up(), e).normalize();
  return V.RotationAxis(n, s).multiply(o).normalize();
}, Vt = (o) => {
  const i = new S(o.x, 0, o.z);
  return i.lengthSquared() <= 1e-8 ? S.Right() : (i.normalize(), S.Cross(S.Up(), i).normalize());
}, qe = (o, i, t, e, s) => {
  const n = Vt(i), a = Math.max(0.45, Number.isFinite(e) ? e : 0), r = Math.max(0, Number.isFinite(t) ? t : 0), l = Math.min(s === 2 ? 1.8 : 5.5, r / a * 0.28);
  if (l <= 1e-4)
    return o.clone();
  const u = S.Dot(o, n) < 0 ? -1 : 1;
  return o.add(n.scale(l * u));
}, $e = (o, i, t, e, s = 5.8) => {
  const n = Math.max(0.05, Number.isFinite(t) ? t : 0), a = k(
    (Number.isFinite(s) ? Math.max(0, s) : 0) / 5.8,
    0,
    1.5
  );
  if (a <= 0)
    return S.Zero();
  const r = (e === 2 ? 2.5 : e === 20 ? 2.45 : 2.35) * a, d = e === 2 ? 22 : 20, l = k(
    _e * r / n,
    Math.min(12, d * a),
    d * Math.max(0.35, a)
  ), c = Vt(i), u = new S(i.x, 0, i.z);
  u.lengthSquared() <= 1e-8 ? u.copyFrom(S.Forward()) : u.normalize();
  const g = o.lengthSquared() > 1e-8 ? o.normalizeToNew() : c, x = S.Dot(g, c) < -1e-4 ? -1 : 1, b = k(S.Dot(g, u), -0.28, 0.28), m = k(S.Dot(g, S.Up()), -0.22, 0.22);
  return c.scale(x).add(u.scale(b)).add(S.Up().scale(m)).normalize().scale(l);
}, te = (o, i, t) => {
  const e = k(o, 0, 1), s = He, n = k(i, 0, 1), a = Math.max(0, Number.isFinite(t) ? t : 0), r = s + (1 - s) / 2, d = (1 - s) / 2, l = a > Pt ? Pt * r / Math.max(
    1e-4,
    a - Pt * d
  ) : 1, c = Math.min(n, l), u = 1 / (s + (1 - s) * (1 + c) / 2);
  if (e <= s)
    return {
      rotationProgress: u * e,
      velocityScale: u
    };
  const g = (e - s) / (1 - s), E = K(g), x = Math.pow(g, 3) - Math.pow(g, 4) / 2;
  return {
    rotationProgress: u * (s + (1 - s) * (g - (1 - c) * x)),
    velocityScale: u * (1 - (1 - c) * E)
  };
}, je = (o, i, t, e, s) => {
  const n = i.clone();
  if (n.lengthSquared() <= 1e-8)
    return o.clone();
  n.normalize();
  const a = Math.max(1, t.durationMs * 0.6), r = K(e / a), d = t.landingSpinRetention * 3.2 * (1 - r), l = S.Dot(o, n), c = Math.abs(l);
  if (c >= d || d <= 1e-4)
    return o.clone();
  const u = l < -1e-4 ? -1 : 1, g = t.flightMaxAngularAcceleration * 12 * Math.max(1e-4, s / 1e3);
  return o.add(n.scale(
    u * Math.min(d - c, g)
  ));
}, Xe = (o, i, t, e, s = 0) => {
  const n = i.length();
  if (!Number.isFinite(n) || n < 1e-4)
    return o.clone().normalize();
  const a = Math.max(0, Number.isFinite(e) ? e : 0), r = a > 0 ? k((Number.isFinite(t) ? t : 0) / a, 0, 1) : 1, { rotationProgress: d } = te(
    r,
    s,
    n
  );
  return V.RotationAxis(
    i.scale(1 / n),
    n * a * d
  ).multiply(o).normalize();
}, Zt = (o, i, t, e = 0) => {
  const s = Math.max(0, Number.isFinite(t) ? t : 0), n = s > 0 ? k((Number.isFinite(i) ? i : 0) / s, 0, 1) : 1;
  return o.scale(
    te(
      n,
      e,
      o.length()
    ).velocityScale
  );
}, Ke = (o, i, t, e, s, n = 0) => {
  const a = K(
    (vt(s) - e.landingBrakeStart) / Math.max(1e-3, 1 - e.landingBrakeStart)
  ), r = Math.max(
    o.y,
    -e.maxLandingVerticalSpeed
  ), d = Math.max(
    0.5,
    Math.hypot(o.x, o.z)
  ), l = new S(
    (t.x - i.x) / 0.28,
    0,
    (t.z - i.z) / 0.28
  );
  l.length() > d && l.normalize().scaleInPlace(d);
  const c = Math.max(
    0,
    Number.isFinite(n) ? n : 0
  );
  if (l.length() < c) {
    const u = new S(o.x, 0, o.z), E = l.lengthSquared() > 1e-8 && S.Dot(l, u) > 0 ? l : u;
    E.lengthSquared() > 1e-8 && l.copyFrom(E.normalize().scale(c));
  }
  return new S(
    O(o.x, l.x, a),
    O(o.y, r, a),
    O(o.z, l.z, a)
  );
}, Je = (o, i, t, e, s, n, a, r, d, l) => {
  const c = t.applyRotationQuaternion(e).normalize(), u = bt(
    i,
    t,
    c
  ), g = o.subtract(s), E = k(
    S.Dot(g, c),
    -r.maxAngularVelocity,
    r.maxAngularVelocity
  );
  if (u.angle <= 1e-4)
    return {
      ...u,
      velocity: s.add(c.scale(E)),
      correctionVelocity: S.Zero()
    };
  const x = K(d), b = Math.max(
    0.05,
    Number.isFinite(a) ? a : 0
  ), m = Math.max(
    r.flightAngularStrength * O(0.35, 1, x),
    3 / b
  ), M = Math.min(
    r.maxAngularVelocity,
    u.angle * m
  ), f = 8 * u.angle / (b * b), C = Math.max(
    r.flightMaxAngularAcceleration,
    Math.min(r.settleMaxAngularAcceleration, f)
  ), I = Math.max(0, C) * Math.max(1e-4, l / 1e3), p = S.Dot(n, u.axis), A = k(
    p + k(
      M - p,
      -I,
      I
    ),
    -r.maxAngularVelocity,
    r.maxAngularVelocity
  ), T = u.axis.scale(A);
  return {
    ...u,
    velocity: s.add(c.scale(E)).add(T),
    correctionVelocity: T
  };
}, ve = (o, i, t, e, s, n, a, r) => {
  const d = bt(i, t, e), l = K(n), c = r === "flight" ? 1 : wt(O(
    s.settleAngularDampingStart,
    s.settleAngularDampingEnd,
    l
  ), a), u = o.scale(c), g = r === "settle" ? s.settleDeadZoneAngle : 1e-4;
  if (d.angle <= g)
    return { ...d, velocity: u };
  const E = r === "flight" ? s.flightAngularStrength * O(0.35, 1, l) : s.angularStrength * O(0.3, 1, l), x = Math.min(s.maxAngularVelocity, d.angle * E), b = S.Dot(u, d.axis), m = r === "flight" ? s.flightMaxAngularAcceleration : O(s.flightMaxAngularAcceleration, s.settleMaxAngularAcceleration, l), M = Math.max(0, m) * Math.max(1e-4, a / 1e3), f = k(
    x - b,
    -M,
    M
  );
  return u.addInPlace(d.axis.scale(f)), { ...d, velocity: u };
}, Be = (o, i, t) => {
  const e = t ? i.forcedLockMaxAngularSpeed : i.finalLockMaxAngularSpeed;
  return Math.max(
    i.finalLockDurationMs,
    Math.max(0, o) / Math.max(0.05, e) * 1e3
  );
}, wt = (o, i) => Math.pow(k(o, 0, 1), Math.max(0.01, i / (1e3 / 60))), tn = (o, i, t, e) => {
  const s = K((t - 0.18) / 0.82), n = O(i.linearDampingStart, i.linearDampingEnd, s), a = wt(n, e), r = wt(O(0.98, n, s), e);
  return new S(
    o.x * a,
    o.y * r,
    o.z * a
  );
}, en = (o, i, t, e) => o >= Math.max(0, i) * 0.75 || t <= e.maxGuideStartHeight, nn = (o, i) => {
  if (o.elapsedMs < i.minElapsedMs)
    return !1;
  const t = o.positionY <= i.maxGuideStartHeight;
  return o.timeoutRemainingMs < i.timeoutWindowMs ? !0 : o.elapsedMs >= i.forceGuideElapsedMs ? o.groundImpactCount >= i.minGroundImpacts || t : !(o.groundImpactCount < i.minGroundImpacts || o.firstGroundImpactElapsedMs !== void 0 && o.elapsedMs - o.firstGroundImpactElapsedMs < i.bounceGraceMs);
}, sn = (o, i) => {
  if (o.elapsedMs < i.minFinalLockElapsedMs)
    return !1;
  const t = o.positionY <= i.maxLockHeight, e = o.lastBodyContactElapsedMs !== void 0 && o.elapsedMs - o.lastBodyContactElapsedMs < i.bodyContactSettleDelayMs && (o.bodyContactElapsedMs ?? 0) < i.bodyContactSettleDelayMs, s = o.hasGroundContact || o.groundContactElapsedMs > 180;
  return t && s && !e && o.angle < i.angleThreshold && o.linearSpeed <= i.maxSettleLinearVelocity && o.angularSpeed <= i.maxSettleAngularVelocity && o.stableElapsedMs >= i.stableDurationMs;
}, ee = 1 / 90, ut = 1e3 / 90, ne = 1 / 180, se = 1e3 / 180, oe = 1 / 120, ie = 1e3 / 120, ae = 24, yt = 1.04, on = -2, Lt = 11.5, re = (o) => {
  const i = Number.isFinite(o) ? Math.max(0, Math.floor(o)) : 0;
  return i <= 1 ? {
    seconds: ee,
    milliseconds: ut
  } : i <= ae ? {
    seconds: ne,
    milliseconds: se
  } : {
    seconds: oe,
    milliseconds: ie
  };
}, an = (o) => {
  const i = Number.isFinite(o.activeBodyCount) ? Math.max(0, Math.floor(o.activeBodyCount)) : 0;
  return i <= 1 ? re(i) : (Number.isFinite(o.totalBodyCount) ? Math.max(i, Math.floor(o.totalBodyCount)) : i) > ae || !o.requiresDenseResolution ? {
    seconds: oe,
    milliseconds: ie
  } : {
    seconds: ne,
    milliseconds: se
  };
}, rn = (o, i, t) => {
  for (const e of t)
    if (!le(
      o,
      i,
      e.position,
      e.radius
    ))
      return !1;
  return !0;
}, le = (o, i, t, e) => {
  const s = Number.isFinite(i) ? Math.max(0, i) : 0, n = Number.isFinite(e) ? Math.max(0, e) : 0, a = (s + n) * yt, r = o.x - t.x, d = o.y - t.y, l = o.z - t.z;
  return r * r + d * d + l * l >= a * a;
}, ln = 1e-3, qt = (o, i, t) => {
  const e = Number.isFinite(i) ? Math.max(0, i) : 0;
  for (const s of t) {
    const n = Number.isFinite(s.radius) ? Math.max(0, s.radius) : 0, a = (e + n) * yt, r = o.x - s.position.x, d = o.z - s.position.z;
    if (r * r + d * d < a * a)
      return !1;
  }
  return !0;
}, $t = (o, i, t) => Math.max(i, Math.min(t, Number.isFinite(o) ? o : 0)), cn = (o, i, t, e) => {
  const s = (l, c) => ({
    x: $t(l, e.minX, e.maxX),
    y: o.y,
    z: $t(c, e.minZ, e.maxZ)
  }), n = s(o.x, o.z);
  if (qt(n, i, t))
    return n;
  const a = Number.isFinite(i) ? Math.max(0.01, i) : 0.01, r = a * 2 * yt, d = Math.PI * (3 - Math.sqrt(5));
  for (let l = 1; l <= 96; l++) {
    const c = r * Math.sqrt(l), u = d * l, g = s(
      n.x + Math.cos(u) * c,
      n.z + Math.sin(u) * c
    );
    if (qt(g, a, t))
      return g;
  }
  return n;
}, dn = (o, i, t, e, s, n) => {
  const a = (l, c) => {
    let u = l.y;
    const g = Number.isFinite(e) ? Math.max(0, e) : 0;
    for (const x of s) {
      const b = Number.isFinite(x.radius) ? Math.max(0, x.radius) : 0, m = (g + b) * yt, M = l.x - x.position.x, f = l.z - x.position.z, C = M * M + f * f, I = m * m;
      if (C >= I)
        continue;
      const p = Math.sqrt(
        Math.max(0, I - C)
      );
      u = Math.max(
        u,
        x.position.y + p + ln
      );
    }
    if (!Number.isFinite(u) || u > c)
      return;
    const E = { x: l.x, y: u, z: l.z };
    return rn(E, g, s) ? E : void 0;
  }, r = a(o, n);
  if (r)
    return { position: r, origin: "source" };
  const d = a({
    x: i.x,
    y: Math.max(i.y, n),
    z: i.z
  }, Number.POSITIVE_INFINITY);
  return d ? { position: d, origin: "overhead" } : {
    position: a(t, Number.POSITIVE_INFINITY) ?? { ...t },
    origin: "edge"
  };
}, hn = (o, i = Lt) => {
  const t = Number.isFinite(i) ? Math.max(Lt, i) : Lt;
  return !Number.isFinite(o.x) || !Number.isFinite(o.y) || !Number.isFinite(o.z) || o.y < on || Math.abs(o.x) > t || Math.abs(o.z) > t;
}, un = 0.25, pn = 0.1, mn = 0.54, ct = 1, ce = 2, Q = {
  left: 4,
  right: 8,
  north: 16,
  south: 32
}, Ft = ct | ce | Q.left | Q.right | Q.north | Q.south, gn = (o) => Ft & ~Q[o], jt = 2, Xt = -2, Mn = (o) => {
  const { bounds: i } = o, t = un, e = Math.max(0.01, i.right - i.left), s = Math.max(0.01, i.south - i.north), n = (i.left + i.right) / 2, a = (i.north + i.south) / 2, r = Number.isFinite(o.largestRadius) ? Math.max(0, o.largestRadius) : 0, d = Number.isFinite(o.startingHeight) ? Math.max(0, o.startingHeight) : 0, l = Math.max(12, d + 5 + r), c = l - Xt, u = (l + Xt) / 2, g = {
    name: "display-floor",
    size: {
      // Keep the large safety apron from v2.0.2. The walls define the
      // playable viewport, while the wider floor catches any temporary
      // solver overlap instead of allowing an endless fall.
      width: Math.max(24, e + t * 2),
      height: jt,
      depth: Math.max(24, s + t * 2)
    },
    position: new S(n, -jt / 2, a)
  }, E = {
    name: "display-wall-north",
    size: { width: e + t * 2, height: c, depth: t },
    position: new S(n, u, i.north - t / 2)
  }, x = {
    name: "display-wall-south",
    size: { width: e + t * 2, height: c, depth: t },
    position: new S(n, u, i.south + t / 2)
  }, b = {
    name: "display-wall-west",
    size: { width: t, height: c, depth: s + t * 2 },
    position: new S(i.left - t / 2, u, a)
  }, m = {
    name: "display-wall-east",
    size: { width: t, height: c, depth: s + t * 2 },
    position: new S(i.right + t / 2, u, a)
  };
  return { floor: g, walls: [E, x, b, m] };
}, fn = (o, i, t, e, s) => {
  const n = ke(i, t, o);
  n.position.copyFrom(e), n.isVisible = !1, n.isPickable = !1;
  const a = new Kt(n, N.STATIC, !1, o), r = be.FromMesh(n);
  return r.material = s, a.shape = r, a.setMassProperties({ mass: 0 }), { body: a, mesh: n };
}, Y = ut * 3.5, F = S.Zero(), kt = V.Identity(), Sn = (o, i, t) => ({
  disposeExisting: !t,
  totalBodyCount: (t ? Math.max(0, o) : 0) + Math.max(0, i)
}), v = (o, i) => (i.copyFrom(o.node.rotationQuaternion ?? kt), i.normalize()), Tt = (o) => {
  const i = o.node.rotationQuaternion;
  return i != null && Number.isFinite(i.x) && Number.isFinite(i.y) && Number.isFinite(i.z) && Number.isFinite(i.w) && i.lengthSquared() > 1e-12;
};
var w, Z, X, et, z, P, q, _, $, G, H, nt, B, dt, st, zt, pt, de, mt, he, gt, ue, Mt, ot, Rt, it, Nt, ft, pe, at, _t, St, me, xt, ge, At, Me, Et, fe, Ct, Se, It, xe, tt, ht, rt, Ht;
class qn extends ye {
  constructor() {
    super(...arguments);
    y(this, B);
    y(this, st);
    y(this, pt);
    y(this, mt);
    y(this, gt);
    y(this, ot);
    y(this, it);
    y(this, ft);
    y(this, at);
    y(this, St);
    y(this, xt);
    y(this, At);
    y(this, Et);
    y(this, Ct);
    y(this, It);
    y(this, tt);
    y(this, rt);
    Gt(this, "mode", "physics");
    y(this, w, []);
    y(this, Z, /* @__PURE__ */ new Map());
    y(this, X, /* @__PURE__ */ new Map());
    y(this, et, []);
    y(this, z, void 0);
    y(this, P, void 0);
    y(this, q, "");
    y(this, _, 0);
    y(this, $, ut);
    y(this, G, 0);
    y(this, H, void 0);
    y(this, nt, /* @__PURE__ */ new WeakMap());
    y(this, Mt, (t) => t.lastBodyCollisionElapsedMs !== void 0 && t.elapsedMs - t.lastBodyCollisionElapsedMs <= Math.max(Y, t.profile.bodyContactSettleDelayMs));
  }
  async init(t) {
    await super.init(t);
    const e = t.options.physicsWasmUrl || `${t.options.origin}${t.options.assetPath}havok/HavokPhysics.wasm`, s = await Ce({ locateFile: () => e }), n = new Ie(!0, s);
    L(this, z, n), this.scene.enablePhysics(new S(0, -9.81 * t.options.gravity, 0), n);
    const a = this.scene.getPhysicsEngine();
    a == null || a.setTimeStep(ee), a == null || a.setSubTimeStep(ut), this.buildBounds();
  }
  async createTimelineEntries(t, e, s, n, a) {
    const r = await super.createTimelineEntries(t, e, s, n, a);
    for (const d of r.entries)
      h(this, nt).set(d, {
        position: d.start.clone(),
        velocity: d.launchVelocity.clone()
      });
    return r;
  }
  animate(t, e, s = this.options.settleTimeout, n = 1e3) {
    return this.createBodies(t), D(this, B, dt).call(this, e, s);
  }
  animateAdditional(t, e, s) {
    var n, a;
    if (this.createBodies(t, !0), s <= 0) {
      if (e.aborted)
        return Promise.reject(new Wt());
      for (const r of t) {
        const d = h(this, Z).get(r);
        if (!d)
          continue;
        const { body: l, entry: c, shape: u } = d;
        c.node.setEnabled(!0), c.node.position.copyFrom(c.end), c.node.rotationQuaternion = c.target.clone(), c.node.computeWorldMatrix(!0), u.filterMembershipMask = ct, u.filterCollideMask = Ft, l.setMotionType(N.ANIMATED), l.disablePreStep = !1, l.setTargetTransform(c.end, c.target), l.setMotionType(N.STATIC), l.disablePreStep = !0, d.launched = !0, d.collisionsArmed = !0, d.state = "complete", d.locked = !0, L(this, G, Math.max(0, h(this, G) - 1));
        try {
          (n = h(this, z)) == null || n.setActivationControl(l, j.ALWAYS_INACTIVE);
        } catch {
        }
      }
      return (a = this.scene) == null || a.render(), Promise.resolve();
    }
    return D(this, B, dt).call(this, e, s);
  }
  async displayInitialAndExplosionTimeline(t) {
    var x, b;
    let e = 0;
    for (; ((b = (x = t.plan.phases[e]) == null ? void 0 : x.actions[0]) == null ? void 0 : b.kind) === "explode"; )
      e++;
    if (e === 0)
      return super.displayInitialAndExplosionTimeline(t);
    const s = /* @__PURE__ */ new Map(), n = [], a = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
    for (const [m, M] of t.handles) {
      a.set(m, M.entries);
      for (const f of M.entries)
        r.set(f, m);
    }
    for (let m = 0; m < e; m++) {
      const M = t.plan.phases[m], f = M.actions.reduce((I, p) => {
        var A;
        return p.kind !== "explode" ? I : I + (((A = t.plan.definitions.get(p.dieId)) == null ? void 0 : A.sides) === 100 ? 2 : 1);
      }, 0);
      let C = 0;
      for (let I = 0; I < M.actions.length; I++) {
        const p = M.actions[I];
        if (p.kind !== "explode")
          continue;
        const A = t.plan.definitions.get(p.dieId), T = {
          ...A,
          value: p.value,
          discarded: p.discarded
        }, R = await this.createTimelineEntries(
          T,
          t.configs.get(A.theme),
          C,
          f,
          `${t.plan.seed}:${M.id}:${p.dieId}`
        );
        C += R.entries.length;
        for (const lt of R.entries)
          lt.launchDelayMs = 0, lt.node.setEnabled(!1);
        t.handles.set(p.dieId, R), a.set(p.dieId, R.entries);
        for (const lt of R.entries)
          r.set(lt, p.dieId);
        const W = { phaseIndex: m, actionIndex: I, action: p, handle: R };
        s.set(p.dieId, W), n.push(W);
      }
    }
    const d = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), c = ze(n.map((m) => ({
      phaseIndex: m.phaseIndex,
      actionIndex: m.actionIndex,
      parentDieId: m.action.parentDieId,
      dieId: m.action.dieId
    }))), u = (m) => {
      const M = t.handles.get(m.action.parentDieId);
      if (this.options.timeline.effects.explode.origin !== "source" || !(M != null && M.entries[0]))
        return;
      const f = t.plan.phases[m.phaseIndex], C = Fe(
        `${t.plan.seed}:${f.id}:${m.action.dieId}:source`
      );
      for (let I = 0; I < m.handle.entries.length; I++) {
        const p = m.handle.entries[I], A = M.entries[I % M.entries.length];
        p.start.set(
          A.node.position.x + C.range(-1, 1) * this.options.timeline.effects.explode.spread,
          A.node.position.y + A.supportHeight + p.supportHeight + this.options.timeline.effects.explode.burstHeight,
          A.node.position.z + C.range(-1, 1) * this.options.timeline.effects.explode.spread
        ), p.node.position.copyFrom(p.start);
        const T = p.end.subtract(p.start).normalize();
        p.launchVelocity.copyFrom(
          T.scale(Math.max(2.4, this.options.throwForce * 0.55))
        ), p.launchVelocity.y = Math.max(
          2.8,
          this.options.timeline.effects.explode.burstHeight * 2
        );
      }
    }, g = (m) => {
      for (const M of m) {
        const f = s.get(M.dieId);
        f && (u(f), this.createBodies(f.handle.entries, !0));
      }
    }, E = (m) => {
      d.add(m);
      const M = r.get(m);
      if (!M || l.has(M) || (a.get(M) ?? []).some((I) => !d.has(I)))
        return;
      l.add(M);
      const C = c.settle(M);
      C.completed && Ut(
        this.options.onTimelineProgress,
        t.progress.completePhaseAction(
          C.completed.phaseIndex,
          C.completed.actionIndex
        )
      ), g(C.spawned);
    };
    return Ut(this.options.onTimelineProgress, t.progress.initial()), this.createBodies(t.initialEntries), await D(this, B, dt).call(this, t.signal, this.options.settleTimeout, E), e;
  }
  animateTimelineReroll(t, e, s, n) {
    var r;
    const a = [];
    for (const d of t) {
      const l = h(this, Z).get(d);
      l && a.push(l);
    }
    for (const d of a) {
      d.body.setMotionType(N.ANIMATED), d.body.disablePreStep = !1;
      try {
        (r = h(this, z)) == null || r.setActivationControl(d.body, j.ALWAYS_ACTIVE);
      } catch {
      }
    }
    return super.animateTimelineReroll(t, e, s, n).finally(() => {
      var d;
      for (const l of a) {
        l.body.setTargetTransform(
          l.entry.node.position,
          l.entry.node.rotationQuaternion ?? kt
        ), l.body.setLinearVelocity(F), l.body.setAngularVelocity(F), l.body.setMotionType(N.STATIC), l.body.disablePreStep = !0;
        try {
          (d = h(this, z)) == null || d.setActivationControl(l.body, j.ALWAYS_INACTIVE);
        } catch {
        }
      }
    });
  }
  createBodies(t, e = !1) {
    var r, d, l;
    const s = Sn(h(this, w).length, t.length, e);
    s.disposeExisting && this.disposeDynamicBodies();
    const n = re(s.totalBodyCount);
    L(this, $, n.milliseconds);
    const a = (r = this.scene) == null ? void 0 : r.getPhysicsEngine();
    a == null || a.setTimeStep(n.seconds), a == null || a.setSubTimeStep(n.milliseconds), L(this, _, t.reduce(
      (c, u) => Math.max(c, u.horizontalRadius),
      e ? h(this, _) : 0
    )), this.buildBounds(void 0, void 0, h(this, _)), e && D(this, Ct, Se).call(this, t);
    for (const c of t) {
      if (h(this, Z).has(c) || h(this, X).has(c.node.name))
        throw new Error(`Duplicate physics body identity '${c.node.name}'.`);
      h(this, P) && (J(c.end, h(this, P), c.horizontalRadius), c.node.position.copyFrom(c.start));
      const u = Ve(c.sides), g = c.launchVelocity.clone(), E = We(
        c.node.position.y,
        c.supportHeight,
        g.y,
        9.81 * this.options.gravity
      ), x = new S(
        g.x * E,
        c.end.y - c.node.position.y,
        g.z * E
      ), b = Math.max(0, this.options.spinForce * 0.05), m = new S(
        c.spinX * b,
        c.spinY * b,
        c.spinZ * b
      ), M = qe(
        m,
        x,
        Math.hypot(g.x, g.z),
        c.horizontalRadius,
        c.sides
      ), f = $e(
        M,
        x,
        E,
        c.sides,
        this.options.spinForce
      ), C = Ze(
        c.target,
        x,
        u.landingApproachAngle
      ), I = Ue(
        C,
        f,
        E
      );
      c.node.rotationQuaternion = I, c.node.computeWorldMatrix(!0);
      const p = Ye(c.target, c.sides), A = new Kt(c.node, N.DYNAMIC, !1, this.scene), T = D(this, Et, fe).call(this, c);
      T.material = { friction: this.options.friction, restitution: this.options.restitution }, T.filterMembershipMask = 0, T.filterCollideMask = 0, A.shape = T, A.setMassProperties({ mass: this.options.mass * Ge(c.sides) }), A.setMotionType(N.ANIMATED), A.setLinearDamping(this.options.linearDamping), A.setAngularDamping(0), A.setLinearVelocity(F), A.setAngularVelocity(F), c.node.setEnabled(!1);
      try {
        (d = h(this, z)) == null || d.setActivationControl(A, j.ALWAYS_INACTIVE);
      } catch {
      }
      const R = {
        body: A,
        shape: T,
        entry: c,
        profile: u,
        localFaceNormal: p.localNormal,
        restDirection: p.restDirection,
        flightStartQuaternion: I.clone(),
        launchAngularVelocity: f.clone(),
        launchLinearVelocity: g.clone(),
        launchDelayMs: c.launchDelayMs,
        settleRollAxis: Vt(x).scale(0.35).add(p.restDirection.scale(0.65)).normalize(),
        flightDurationMs: E * 1e3,
        currentQuaternionScratch: V.Identity(),
        lockRotationScratch: V.Identity(),
        lockPositionScratch: S.Zero(),
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
        flightCorrectionVelocity: S.Zero(),
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
        lockDurationMs: u.finalLockDurationMs,
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
      A.setCollisionCallbackEnabled(!0), R.collisionObserver = A.getCollisionObservable().add((W) => {
        D(this, It, xe).call(this, R, W), W.type !== Yt.COLLISION_FINISHED && this.options.onCollision({
          action: "collision",
          body0Id: W.collider.transformNode.name,
          body1Id: W.collidedAgainst.transformNode.name,
          force: Math.abs(W.impulse)
        });
      }), h(this, w).push(R), h(this, Z).set(c, R), h(this, X).set(c.node.name, R), Ot(this, G)._++;
    }
    (l = h(this, H)) == null || l.recordBodies(h(this, w).length);
  }
  buildBounds(t, e, s = h(this, _)) {
    var E;
    if (!this.context || !this.scene || !this.options || !h(this, z) || !this.scene.getPhysicsEngine())
      return;
    const n = this.context.canvas, a = Math.max(1, (t ?? n.clientWidth) || n.width || 300), r = Math.max(1, (e ?? n.clientHeight) || n.height || 150), d = Le({
      width: a,
      height: r,
      cameraHeight: Te,
      cameraFov: we,
      wallPadding: this.options.wallPadding,
      minimumRadius: s
    }), l = [
      a,
      r,
      this.options.wallPadding,
      this.options.startingHeight,
      this.options.friction,
      this.options.restitution,
      s
    ].join("|");
    if (l === h(this, q))
      return;
    D(this, tt, ht).call(this);
    const c = this.scene, u = (x, b, m, M, f) => {
      const C = fn(
        c,
        x,
        b,
        m,
        M
      );
      C.body.shape && (C.body.shape.filterMembershipMask = f, C.body.shape.filterCollideMask = ct), h(this, et).push(C);
    }, g = Mn({
      bounds: d,
      startingHeight: this.options.startingHeight,
      largestRadius: s
    });
    try {
      u(g.floor.name, g.floor.size, g.floor.position, {
        friction: this.options.friction,
        restitution: this.options.restitution
      }, ce);
      const [x, b, m, M] = g.walls;
      for (const [f, C] of [
        [x, Q.north],
        [b, Q.south],
        [m, Q.left],
        [M, Q.right]
      ])
        u(f.name, f.size, f.position, {
          friction: pn,
          restitution: mn
        }, C);
    } catch (x) {
      throw D(this, tt, ht).call(this), L(this, P, void 0), L(this, q, ""), x;
    }
    (E = this.environment) == null || E.ensureGroundCoverage(g.floor.size.width, g.floor.size.depth), L(this, P, d), L(this, q, l);
  }
  resize(t, e) {
    super.resize(t, e), this.buildBounds(t, e, h(this, _)), D(this, rt, Ht).call(this);
  }
  async updateOptions(t) {
    var e, s;
    await super.updateOptions(t), (s = (e = this.scene) == null ? void 0 : e.getPhysicsEngine()) == null || s.setGravity(new S(0, -9.81 * t.gravity, 0)), L(this, q, ""), this.buildBounds(void 0, void 0, h(this, _)), D(this, rt, Ht).call(this);
  }
  disposeDynamicBodies() {
    var t;
    for (const { body: e, collisionObserver: s } of h(this, w).splice(0)) {
      s && e.getCollisionObservable().remove(s), e.setCollisionCallbackEnabled(!1);
      try {
        (t = e.shape) == null || t.dispose();
      } catch {
      }
      e.dispose();
    }
    h(this, Z).clear(), h(this, X).clear(), L(this, G, 0), L(this, H, void 0);
  }
  clear() {
    this.disposeDynamicBodies(), L(this, _, 0), super.clear();
  }
  dispose() {
    this.disposeDynamicBodies(), D(this, tt, ht).call(this), L(this, P, void 0), L(this, q, ""), L(this, _, 0), L(this, z, void 0), super.dispose();
  }
}
w = new WeakMap(), Z = new WeakMap(), X = new WeakMap(), et = new WeakMap(), z = new WeakMap(), P = new WeakMap(), q = new WeakMap(), _ = new WeakMap(), $ = new WeakMap(), G = new WeakMap(), H = new WeakMap(), nt = new WeakMap(), B = new WeakSet(), dt = function(t, e, s) {
  return globalThis.__DICE3DVIEW_PHYSICS_PROFILE__ === !0 ? import("./physicsPerformance-9d14f224.js").then((a) => {
    const r = new a.PhysicsPerformanceRecorder();
    return D(this, st, zt).call(this, t, e, s, {
      recorder: r,
      publish: () => a.publishPhysicsPerformanceSnapshot(r.complete())
    });
  }) : D(this, st, zt).call(this, t, e, s);
}, st = new WeakSet(), zt = function(t, e, s, n) {
  const a = this.engine, r = this.scene, d = Math.max(250, e), l = n == null ? void 0 : n.recorder;
  return L(this, H, l), l == null || l.recordBodies(h(this, w).length), new Promise((c, u) => {
    let g = !1;
    const E = r.onBeforePhysicsObservable.add(() => {
      const f = (l == null ? void 0 : l.now()) ?? 0;
      for (const C of h(this, w))
        D(this, ft, pe).call(this, C, h(this, $), d);
      l && l.recordPhysicsStep(
        l.now() - f,
        h(this, w).length,
        h(this, $)
      );
    }), x = r.onAfterPhysicsObservable.add(() => {
      for (const f of h(this, w))
        f.state === "commit" && D(this, At, Me).call(this, f);
    }), b = (f) => {
      g || (g = !0, a.stopRenderLoop(M), r.onBeforePhysicsObservable.remove(E), r.onAfterPhysicsObservable.remove(x), t.removeEventListener("abort", m), l && (n == null || n.publish(), h(this, H) === l && L(this, H, void 0)), f ? u(f) : c());
    }, m = () => b(new Wt()), M = () => {
      const f = (l == null ? void 0 : l.now()) ?? 0;
      if (t.aborted)
        return m();
      D(this, pt, de).call(this);
      let C = !1, I;
      for (const p of h(this, w))
        p.state === "finalLock" && p.forcedLock && (C = !0), !(p.locked || p.state === "commit") && p.launched && (D(this, it, Nt).call(this, p) || !Tt(p.entry) ? D(this, xt, ge).call(this, p) : p.elapsedMs >= d + p.profile.timeoutExtensionMs && !h(this, Mt).call(this, p) && (I === void 0 || p.entry.node.position.y < I.entry.node.position.y) && (I = p));
      if (!C && I && D(this, at, _t).call(this, I, !0), r.render(), l == null || l.recordFrame(l.now() - f), s)
        try {
          for (const p of h(this, w))
            !p.locked || p.settledReported || (p.settledReported = !0, s(p.entry));
        } catch (p) {
          b(p);
          return;
        }
      h(this, G) === 0 && b();
    };
    t.addEventListener("abort", m, { once: !0 }), a.runRenderLoop(M);
  });
}, pt = new WeakSet(), de = function() {
  var a;
  let t = 0, e = !1;
  for (const r of h(this, w))
    r.locked || r.state === "commit" || r.state === "complete" || (t++, (!r.launched || r.groundImpactCount + r.bodySupportImpactCount === 0) && (e = !0));
  const s = an({
    totalBodyCount: h(this, w).length,
    activeBodyCount: t,
    requiresDenseResolution: e
  });
  if (Math.abs(h(this, $) - s.milliseconds) <= 1e-6)
    return;
  L(this, $, s.milliseconds);
  const n = (a = this.scene) == null ? void 0 : a.getPhysicsEngine();
  n == null || n.setTimeStep(s.seconds), n == null || n.setSubTimeStep(s.milliseconds);
}, mt = new WeakSet(), he = function(t) {
  var r;
  if (t.launched)
    return;
  const { body: e, entry: s, profile: n, shape: a } = t;
  s.node.setEnabled(!0), s.node.computeWorldMatrix(!0), a.filterMembershipMask = ct, a.filterCollideMask = gn(s.launchEdge), e.setMotionType(N.DYNAMIC), e.disablePreStep = !0, e.setLinearDamping(this.options.linearDamping), e.setAngularDamping(0);
  try {
    (r = h(this, z)) == null || r.setActivationControl(e, j.ALWAYS_ACTIVE);
  } catch {
  }
  e.setLinearVelocity(t.launchLinearVelocity), e.setAngularVelocity(Zt(
    t.launchAngularVelocity,
    0,
    t.flightDurationMs / 1e3,
    n.landingSpinRetention
  )), t.launched = !0, D(this, ot, Rt).call(this, t);
}, gt = new WeakSet(), ue = function(t) {
  var e, s;
  (e = h(this, H)) == null || e.recordLaunchClearanceQuery();
  for (const n of h(this, w))
    if (!(n === t || !n.launched) && ((s = h(this, H)) == null || s.recordLaunchPairCheck(), !le(
      t.entry.node.position,
      t.entry.horizontalRadius,
      n.entry.node.position,
      n.entry.horizontalRadius
    )))
      return !1;
  return !0;
}, Mt = new WeakMap(), ot = new WeakSet(), Rt = function(t) {
  t.collisionsArmed || !t.launched || h(this, P) && !De(
    t.entry.node.position,
    h(this, P),
    t.entry.horizontalRadius,
    t.entry.launchEdge
  ) || (t.shape.filterCollideMask = Ft, t.collisionsArmed = !0);
}, it = new WeakSet(), Nt = function(t) {
  const e = t.entry.node.position;
  if (!t.collisionsArmed)
    return !Number.isFinite(e.x) || !Number.isFinite(e.y) || !Number.isFinite(e.z) || e.y < -2;
  const s = h(this, P) ? Math.max(
    11.5,
    Math.abs(h(this, P).left),
    Math.abs(h(this, P).right),
    Math.abs(h(this, P).north),
    Math.abs(h(this, P).south)
  ) + t.entry.horizontalRadius + 1 : void 0;
  return hn(e, s);
}, ft = new WeakSet(), pe = function(t, e, s) {
  var g;
  if (t.locked || t.state === "commit" || t.state === "complete")
    return;
  if (!t.launched) {
    if (t.launchDelayElapsedMs += e, t.launchDelayElapsedMs + 1e-6 < t.launchDelayMs || !D(this, gt, ue).call(this, t))
      return;
    D(this, mt, he).call(this, t);
  }
  D(this, ot, Rt).call(this, t);
  const { body: n, entry: a, profile: r } = t;
  if (D(this, it, Nt).call(this, t) || !Tt(a))
    return;
  t.elapsedMs += e;
  const d = Math.max(0, s - t.elapsedMs), l = t.lastGroundContactElapsedMs !== void 0 && t.elapsedMs - t.lastGroundContactElapsedMs <= Y;
  l || (t.groundContactStartedElapsedMs = void 0);
  const c = t.lastBodyContactElapsedMs !== void 0 && t.elapsedMs - t.lastBodyContactElapsedMs <= Y;
  c || (t.bodyContactStartedElapsedMs = void 0, t.bodySupport = void 0);
  const u = t.lastBodyCollisionElapsedMs !== void 0 && t.elapsedMs - t.lastBodyCollisionElapsedMs <= Y;
  if (u || (t.bodyCollisionStartedElapsedMs = void 0), t.state === "freeFall") {
    const E = Math.max(0, t.elapsedMs - e) / 1e3, x = t.flightDurationMs / 1e3, b = Xe(
      t.flightStartQuaternion,
      t.launchAngularVelocity,
      E,
      x,
      r.landingSpinRetention
    ), m = Zt(
      t.launchAngularVelocity,
      E,
      x,
      r.landingSpinRetention
    ), M = Je(
      n.getAngularVelocity() ?? F,
      v(a, t.currentQuaternionScratch),
      t.localFaceNormal,
      b,
      m,
      t.flightCorrectionVelocity,
      Math.max(0, x - E),
      r,
      Math.min(1, t.elapsedMs / Math.max(1, t.flightDurationMs)),
      e
    );
    t.flightCorrectionVelocity = M.correctionVelocity, n.setAngularVelocity(M.velocity);
    const f = n.getLinearVelocity();
    if (f) {
      const T = Ke(
        f,
        a.node.position,
        a.end,
        r,
        Math.min(1, t.elapsedMs / Math.max(1, t.flightDurationMs)),
        Math.max(
          2.2,
          Math.hypot(
            t.launchLinearVelocity.x,
            t.launchLinearVelocity.z
          ) * 0.4
        )
      );
      (t.wallImpactCount > 0 || t.groundImpactCount > 0 || t.lastBodyCollisionElapsedMs !== void 0) && (T.x = f.x, T.z = f.z), n.setLinearVelocity(T);
    }
    if (t.groundImpactCount + t.bodySupportImpactCount === 0 && d >= r.timeoutWindowMs)
      return;
    const C = t.firstGroundImpactElapsedMs, I = t.firstBodySupportImpactElapsedMs, p = C === void 0 ? I : I === void 0 ? C : Math.min(C, I), A = t.guidanceStartInput;
    if (A.elapsedMs = t.elapsedMs, A.firstGroundImpactElapsedMs = p, A.groundImpactCount = t.groundImpactCount + t.bodySupportImpactCount, A.positionY = a.node.position.y, A.timeoutRemainingMs = d, !nn(A, r))
      return;
    t.state = "guidedSettle", t.guidanceElapsedMs = 0, n.setAngularDamping(this.options.angularDamping);
  }
  if (t.state === "guidedSettle") {
    t.guidanceElapsedMs += e;
    const E = 1 - Math.min(1, d / Math.max(1, r.timeoutWindowMs)), x = Math.max(
      Math.min(1, t.guidanceElapsedMs / r.durationMs),
      E
    ), b = v(a, t.currentQuaternionScratch), m = je(
      n.getAngularVelocity() ?? F,
      t.settleRollAxis,
      r,
      t.guidanceElapsedMs,
      e
    ), M = ve(
      m,
      b,
      t.localFaceNormal,
      t.restDirection,
      r,
      x,
      e,
      "settle"
    );
    n.setAngularVelocity(M.velocity);
    let f = n.getLinearVelocity() ?? F;
    (l || c || t.groundImpactCount + t.bodySupportImpactCount > 0 || a.node.position.y <= r.maxGuideStartHeight) && (f = tn(
      f,
      r,
      x,
      e
    ), n.setLinearVelocity(f));
    const C = l && t.groundContactStartedElapsedMs !== void 0 ? t.elapsedMs - t.groundContactStartedElapsedMs : 0, I = c && ((g = t.bodySupport) == null ? void 0 : g.locked) === !0, p = u && t.bodyCollisionStartedElapsedMs !== void 0 ? t.elapsedMs - t.bodyCollisionStartedElapsedMs : 0, A = t.finalLockInput;
    A.angle = M.angle, A.angularSpeed = M.velocity.length(), A.elapsedMs = t.elapsedMs, A.groundContactElapsedMs = C, A.hasGroundContact = l || I, A.bodyContactElapsedMs = p, A.lastBodyContactElapsedMs = t.lastBodyCollisionElapsedMs, A.linearSpeed = f.length(), A.positionY = a.node.position.y, A.stableElapsedMs = r.stableDurationMs;
    const T = sn(A, r);
    t.stableElapsedMs = T ? t.stableElapsedMs + e : 0, T && t.stableElapsedMs >= r.stableDurationMs && D(this, at, _t).call(this, t, !1);
    return;
  }
  if (t.state === "finalLock") {
    if (t.forcedLock && t.forcedLockBodyCollision) {
      D(this, St, me).call(this, t);
      return;
    }
    t.lockElapsedMs += e;
    const E = Math.min(1, t.lockElapsedMs / Math.max(1, t.lockDurationMs)), x = K(E), b = t.lockSourceQuaternion ?? v(a, t.currentQuaternionScratch), m = t.lockTargetQuaternion ?? b, M = V.SlerpToRef(b, m, x, t.lockRotationScratch).normalize(), f = t.lockSourcePosition ?? a.node.position, C = t.lockTargetPosition ?? f, I = S.LerpToRef(f, C, x, t.lockPositionScratch);
    n.setTargetTransform(I, M), E >= 1 && (t.state = "commit");
  }
}, at = new WeakSet(), _t = function(t, e) {
  if (t.locked || t.state === "finalLock" || t.state === "commit" || t.state === "complete" || !e && t.state !== "guidedSettle")
    return;
  const s = v(t.entry, t.currentQuaternionScratch);
  if (!e) {
    t.body.setLinearVelocity(F), t.body.setAngularVelocity(F), t.state = "commit";
    return;
  }
  const n = Qe(
    s,
    t.localFaceNormal,
    t.restDirection,
    e ? t.profile.settleDeadZoneAngle : t.profile.angleThreshold
  ), a = t.entry.node.position.clone(), r = t.lastGroundContactElapsedMs !== void 0 && t.elapsedMs - t.lastGroundContactElapsedMs <= Y, d = e ? new S(
    a.x,
    r ? t.entry.supportHeight : Math.max(t.entry.supportHeight, a.y),
    a.z
  ) : a.clone();
  e && h(this, P) && J(
    d,
    h(this, P),
    t.entry.horizontalRadius
  ), t.state = "finalLock", t.forcedLock = e, t.forcedLockBodyCollision = !1, t.lockElapsedMs = 0, t.lockDurationMs = Be(n.angle, t.profile, e), t.lockSourcePosition = a, t.lockTargetPosition = d, t.lockSourceQuaternion = s.clone(), t.lockTargetQuaternion = Bt(s, n.targetQuaternion), t.body.setLinearVelocity(F), t.body.setAngularVelocity(F), t.body.setMotionType(N.ANIMATED), t.body.setTargetTransform(a, s);
}, St = new WeakSet(), me = function(t) {
  var a, r, d;
  const { body: e } = t, s = ((a = e.getLinearVelocity()) == null ? void 0 : a.clone()) ?? F, n = ((r = e.getAngularVelocity()) == null ? void 0 : r.clone()) ?? F;
  e.setMotionType(N.DYNAMIC), e.disablePreStep = !0;
  try {
    (d = h(this, z)) == null || d.setActivationControl(e, j.ALWAYS_ACTIVE);
  } catch {
  }
  e.setLinearVelocity(s), e.setAngularVelocity(n), t.state = "guidedSettle", t.forcedLock = !1, t.forcedLockBodyCollision = !1, t.stableElapsedMs = 0, t.lockElapsedMs = 0, t.lockSourcePosition = void 0, t.lockTargetPosition = void 0, t.lockSourceQuaternion = void 0, t.lockTargetQuaternion = void 0;
}, xt = new WeakSet(), ge = function(t) {
  if (t.locked || t.state === "commit" || t.state === "complete")
    return;
  const { body: e, entry: s } = t, n = s.end.clone();
  h(this, P) && J(n, h(this, P), s.horizontalRadius);
  const a = Tt(s) ? bt(
    v(s, t.currentQuaternionScratch),
    t.localFaceNormal,
    t.restDirection
  ).targetQuaternion : s.target.clone();
  e.setMotionType(N.ANIMATED), e.setLinearVelocity(F), e.setAngularVelocity(F), s.node.position.copyFrom(n), s.node.rotationQuaternion = a, s.node.computeWorldMatrix(!0), e.disablePreStep = !1, t.state = "commit";
}, At = new WeakSet(), Me = function(t) {
  var s;
  if (t.state !== "commit")
    return;
  const { body: e } = t;
  e.disablePreStep = !0, e.setLinearVelocity(F), e.setAngularVelocity(F), e.setMotionType(N.STATIC);
  try {
    (s = h(this, z)) == null || s.setActivationControl(e, j.ALWAYS_INACTIVE);
  } catch {
  }
  t.state = "complete", t.locked = !0, L(this, G, Math.max(0, h(this, G) - 1));
}, Et = new WeakSet(), fe = function(t) {
  if (t.physicsCollider) {
    const s = t.physicsCollider.clone(`${t.node.name}-physics-collider`, null, !1);
    if (!s)
      throw new Error(`Unable to clone physics collider for '${t.node.name}'.`);
    s.setEnabled(!0), s.isVisible = !1, s.position.setAll(0), s.rotationQuaternion = kt.clone(), s.scaling.set(
      t.node.scaling.x * this.options.colliderScale,
      t.node.scaling.y * this.options.colliderScale,
      t.node.scaling.z * this.options.colliderScale
    ), s.computeWorldMatrix(!0);
    try {
      return new Qt(s, this.scene);
    } finally {
      s.dispose(!1, !1);
    }
  }
  const e = "getVerticesData" in t.node ? t.node : t.node.getChildMeshes(!1)[0];
  if (!e)
    throw new Error(`Unable to create physics shape for '${t.node.name}'.`);
  return e.computeWorldMatrix(!0), new Qt(e, this.scene);
}, Ct = new WeakSet(), Se = function(t) {
  const e = h(this, w).map((n) => ({
    position: n.entry.node.position,
    radius: n.entry.horizontalRadius
  })), s = h(this, w).map((n) => ({
    position: n.entry.node.position,
    radius: n.entry.horizontalRadius
  }));
  for (const n of t) {
    const a = h(this, nt).get(n);
    if (h(this, P)) {
      const l = cn(
        n.end,
        n.horizontalRadius,
        s,
        Pe(h(this, P), n.horizontalRadius)
      );
      n.end.set(l.x, n.supportHeight, l.z);
    }
    const r = Math.max(n.start.y, this.options.startingHeight), d = dn(
      n.start,
      { x: n.end.x, y: r, z: n.end.z },
      (a == null ? void 0 : a.position) ?? n.start,
      n.horizontalRadius,
      e,
      r
    );
    if (n.start.set(d.position.x, d.position.y, d.position.z), n.node.position.copyFrom(n.start), d.origin === "overhead")
      n.launchVelocity.set(0, -Math.max(1.4, this.options.throwForce * 0.25), 0);
    else if (d.origin === "edge" && a)
      n.launchVelocity.copyFrom(a.velocity);
    else if (d.origin === "source") {
      const l = n.end.x - n.start.x, c = n.end.z - n.start.z, u = Math.hypot(l, c);
      if (u > 1e-4) {
        const g = Math.max(
          2.4,
          Math.hypot(n.launchVelocity.x, n.launchVelocity.z)
        );
        n.launchVelocity.x = l / u * g, n.launchVelocity.z = c / u * g;
      }
    }
    e.push({ position: n.start, radius: n.horizontalRadius }), s.push({ position: n.end, radius: n.horizontalRadius });
  }
}, It = new WeakSet(), xe = function(t, e) {
  var l, c;
  if (e.type === Yt.COLLISION_FINISHED)
    return;
  (l = h(this, H)) == null || l.recordCollision();
  const s = t.entry.node.name, n = e.collider.transformNode.name, a = e.collidedAgainst.transformNode.name, r = n === s ? a : n;
  if (r === "display-floor") {
    (t.lastGroundContactElapsedMs === void 0 || t.elapsedMs - t.lastGroundContactElapsedMs > Y) && (t.groundImpactCount++, t.firstGroundImpactElapsedMs ?? (t.firstGroundImpactElapsedMs = t.elapsedMs), t.groundContactStartedElapsedMs = t.elapsedMs), t.lastGroundContactElapsedMs = t.elapsedMs;
    return;
  }
  if (r.startsWith("display-wall-")) {
    (t.lastWallImpactElapsedMs === void 0 || t.elapsedMs - t.lastWallImpactElapsedMs > Y) && t.wallImpactCount++, t.lastWallImpactElapsedMs = t.elapsedMs;
    return;
  }
  const d = h(this, X).get(r);
  if (r !== s && d) {
    t.state === "finalLock" && t.forcedLock && (t.forcedLockBodyCollision = !0), (t.lastBodyCollisionElapsedMs === void 0 || t.elapsedMs - t.lastBodyCollisionElapsedMs > Y) && (t.bodyCollisionStartedElapsedMs = t.elapsedMs), t.lastBodyCollisionElapsedMs = t.elapsedMs;
    const g = Math.abs(((c = e.normal) == null ? void 0 : c.y) ?? 0), E = e.point, x = E != null && E.y <= t.entry.node.position.y - Math.min(0.06, t.entry.supportHeight * 0.08), b = d.entry.node.position.y + 0.02 < t.entry.node.position.y;
    if (g < 0.45 || !x || !b)
      return;
    const m = t.lastBodyContactElapsedMs === void 0 || t.elapsedMs - t.lastBodyContactElapsedMs > Y, M = en(
      t.elapsedMs,
      t.flightDurationMs,
      t.entry.node.position.y,
      t.profile
    );
    m && (t.bodyContactStartedElapsedMs = t.elapsedMs), M && (m || t.bodySupportImpactCount === 0) && (t.bodySupportImpactCount++, t.firstBodySupportImpactElapsedMs ?? (t.firstBodySupportImpactElapsedMs = t.elapsedMs)), t.bodySupport = d, t.lastBodyContactElapsedMs = t.elapsedMs;
  }
}, tt = new WeakSet(), ht = function() {
  var t;
  for (const { body: e, mesh: s } of h(this, et).splice(0)) {
    try {
      (t = e.shape) == null || t.dispose();
    } catch {
    }
    e.dispose(), s.dispose();
  }
}, rt = new WeakSet(), Ht = function() {
  var t, e;
  if (h(this, P))
    for (const s of h(this, w)) {
      const { body: n, entry: a } = s;
      J(a.end, h(this, P), a.horizontalRadius);
      const r = s.collisionsArmed && (s.locked || s.state === "finalLock" || s.state === "commit" || s.state === "complete") ? J(
        a.node.position,
        h(this, P),
        a.horizontalRadius
      ) : !1;
      if (s.state === "finalLock") {
        const l = Math.max(
          1,
          s.lockDurationMs - s.lockElapsedMs
        ), c = ((t = s.lockTargetPosition) == null ? void 0 : t.clone()) ?? new S(a.node.position.x, a.supportHeight, a.node.position.z), u = J(
          c,
          h(this, P),
          a.horizontalRadius
        );
        (r || u) && (s.lockSourcePosition = a.node.position.clone(), s.lockTargetPosition = c, s.lockSourceQuaternion = v(
          a,
          s.currentQuaternionScratch
        ).clone(), s.lockDurationMs = l, s.lockElapsedMs = 0);
      }
      if (!r)
        continue;
      a.node.computeWorldMatrix(!0);
      const d = n.getPrestepType();
      try {
        n.disablePreStep = !1, (e = h(this, z)) == null || e.setPhysicsBodyTransformation(n, a.node);
      } catch {
      } finally {
        n.setPrestepType(d);
      }
    }
};
export {
  qn as PhysicsRenderer,
  qn as default,
  Sn as planPhysicsBodyBuild
};
