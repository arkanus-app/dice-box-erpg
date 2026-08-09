var Yt = Object.defineProperty;
var Jt = (t, e, i) => e in t ? Yt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var L = (t, e, i) => (Jt(t, typeof e != "symbol" ? e + "" : e, i), i), Je = (t, e, i) => {
  if (!e.has(t))
    throw TypeError("Cannot " + i);
};
var h = (t, e, i) => (Je(t, e, "read from private field"), i ? i.call(t) : e.get(t)), S = (t, e, i) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, i);
}, z = (t, e, i, n) => (Je(t, e, "write to private field"), n ? n.call(t, i) : e.set(t, i), i);
var _ = (t, e, i) => (Je(t, e, "access private method"), i);
import { Quaternion as V, Vector3 as F, Matrix as pt } from "@babylonjs/core/Maths/math.vector";
import { Color3 as R, Color4 as ei } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture as Pt } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture as be } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial as De } from "@babylonjs/core/Materials/standardMaterial";
import { CreatePlane as ti } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { Mesh as je } from "@babylonjs/core/Meshes/mesh";
import { CreateCylinder as ii } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateDisc as Le } from "@babylonjs/core/Meshes/Builders/discBuilder";
import { TransformNode as ni } from "@babylonjs/core/Meshes/transformNode";
import { Material as si } from "@babylonjs/core/Materials/material";
import { MaterialPluginBase as oi } from "@babylonjs/core/Materials/materialPluginBase";
import { Engine as ri } from "@babylonjs/core/Engines/engine";
import { Scene as ai } from "@babylonjs/core/scene";
import { TargetCamera as ci } from "@babylonjs/core/Cameras/targetCamera";
import { DirectionalLight as li } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight as di } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateGround as hi } from "@babylonjs/core/Meshes/Builders/groundBuilder";
const fi = (t, e) => {
  if (typeof document > "u")
    throw new Error("DiceResultViewer requires a browser document.");
  const i = typeof t == "string" ? document.querySelector(t) : t;
  if (!i)
    throw new Error(`DiceResultViewer target '${typeof t == "string" ? t : "<element>"}' was not found.`);
  const n = document.getElementById(e);
  n instanceof HTMLCanvasElement && n.remove();
  const s = document.createElement("canvas");
  return s.id = e, s.classList.add("dice-box-canvas"), i.append(s), s;
}, mi = /* @__PURE__ */ new Set([2, 4, 6, 8, 10, 12, 20, 100]), ui = /* @__PURE__ */ new Set(["kinematic", "physics"]), Ot = (t) => {
  const e = Number(t);
  if (!mi.has(e))
    throw new Error(`Unsupported display die: d${String(t)}. Supported dice are d2, d4, d6, d8, d10, d12, d20, and d100.`);
  return e;
}, st = (t, e) => {
  const i = Number(t);
  if (!Number.isFinite(i) || !Number.isInteger(i))
    throw new Error(`Display die d${e} is missing an integer value.`);
  if (i < 1 || i > e)
    throw new Error(`Display die d${e} value ${i} is outside 1-${e}.`);
  return i;
}, jt = (t, e = "kinematic") => {
  const i = t ?? e;
  if (typeof i != "string" || !ui.has(i))
    throw new Error(`Invalid display mode '${String(i)}'. Supported modes are 'kinematic' and 'physics'.`);
  return i;
}, pi = (t, e, i, n) => {
  if (!t || typeof t != "object")
    throw new Error(`Display die at index ${e} must be an object.`);
  const s = Ot(t.sides);
  return Object.freeze({
    id: t.id || `${i.id}-die-${e}`,
    sides: s,
    value: st(t.value, s),
    discarded: !!t.discarded,
    theme: t.theme || n.theme,
    themeColor: t.themeColor || n.themeColor
  });
}, wt = (t, e) => {
  if (!t || typeof t != "object")
    throw new Error("display expects a request object.");
  if (typeof t.id != "string" || t.id.trim().length === 0)
    throw new Error("display expects a non-empty request id.");
  if (!Array.isArray(t.dice) || t.dice.length === 0)
    throw new Error("display expects at least one resolved die.");
  const i = {
    id: t.id,
    seed: typeof t.seed == "string" ? t.seed : t.id,
    mode: jt(t.mode, e.mode),
    dice: Object.freeze(t.dice.map((n, s) => pi(n, s, t, e)))
  };
  return Object.freeze(i);
}, gt = (t) => t.reduce((e, i) => e + (i.sides === 100 ? 2 : 1), 0), kt = "DISPLAY_CANCELLED";
class W extends Error {
  constructor(i = "Display presentation was cancelled.") {
    super(i);
    L(this, "code", kt);
    this.name = "DisplayCancelledError";
  }
}
const ot = (t) => t instanceof W || typeof t == "object" && t !== null && "code" in t && t.code === kt, wi = (t, e) => {
  throw ot(t) || e ? new W() : t;
}, Ae = (t, e) => {
  if (typeof t != "string" || t.trim().length === 0)
    throw new Error(`${e} must be a non-empty string.`);
  return t;
}, gi = (t, e) => {
  if (!t || typeof t != "object")
    throw new Error("displayTimeline expects a request object.");
  const i = Ae(t.id, "displayTimeline request id");
  if (!Array.isArray(t.dice) || t.dice.length === 0)
    throw new Error("displayTimeline expects at least one die definition.");
  if (!Array.isArray(t.events) || t.events.length === 0)
    throw new Error("displayTimeline expects a non-empty event journal.");
  const n = /* @__PURE__ */ new Set(), s = t.dice.map((o, c) => {
    if (!o || typeof o != "object")
      throw new Error(`Timeline die at index ${c} must be an object.`);
    const l = Ae(o.id, `Timeline die at index ${c} id`);
    if (n.has(l))
      throw new Error(`Timeline die id '${l}' is duplicated.`);
    return n.add(l), Object.freeze({
      id: l,
      sides: Ot(o.sides),
      theme: o.theme || e.theme,
      themeColor: o.themeColor || e.themeColor
    });
  });
  return Object.freeze({
    id: i,
    dice: Object.freeze(s),
    events: Object.freeze(t.events.map((o) => Object.freeze({ ...o }))),
    seed: typeof t.seed == "string" ? t.seed : i,
    mode: jt(t.mode, e.mode)
  });
}, yi = (t) => t.type === "reroll" ? t.reason.startsWith("unique") ? "unique" : "reroll" : t.type === "transform" ? t.reason === "compound" || t.reason === "penetrate" ? t.reason : void 0 : t.type === "exclude" ? t.reason === "compound-absorbed" ? "compound" : t.reason : t.type === "classify" ? t.outcome === "critical-success" ? "criticalSuccess" : t.outcome === "critical-failure" ? "criticalFailure" : t.outcome : t.type === "explode" ? "explode" : void 0, ze = (t, e, i, n) => Object.freeze({
  id: t,
  effect: e,
  delayMs: n.effects[e].delayMs,
  durationMs: n.effects[e].durationMs,
  actions: Object.freeze(i),
  eventSequences: Object.freeze([...new Set(i.flatMap((s) => s.eventSequences))].sort((s, o) => s - o))
}), yt = (t, e, i = t.discarded) => Object.freeze({
  id: t.definition.id,
  sides: t.definition.sides,
  value: e,
  discarded: i,
  theme: t.definition.theme,
  themeColor: t.definition.themeColor
}), bi = (t, e, i) => {
  const n = new Map(t.dice.map((a) => [a.id, a]));
  let s = 0;
  const o = /* @__PURE__ */ new Map();
  for (const a of t.events) {
    if (!a || typeof a != "object")
      throw new Error("Timeline events must be objects.");
    if (!["roll", "reroll", "explode", "transform", "include", "exclude", "classify"].includes(a.type))
      throw new Error(`Timeline event has unsupported type '${String(a.type)}'.`);
    if (!Number.isInteger(a.sequence) || a.sequence <= s)
      throw new Error(`Timeline event sequence must contain strictly increasing positive integers; received ${String(a.sequence)} after ${s}.`);
    if (s = a.sequence, a.subject !== void 0 && a.subject !== "die")
      throw new Error(`Timeline event ${a.sequence} has unsupported subject '${String(a.subject)}'.`);
    if (Ae(a.dieId, `Timeline event ${a.sequence} dieId`), Ae(a.sourceNodeId, `Timeline event ${a.sequence} sourceNodeId`), !Number.isInteger(a.rollIndex) || a.rollIndex < 0)
      throw new Error(`Timeline event ${a.sequence} rollIndex must be a non-negative integer.`);
    const p = n.get(a.dieId);
    if (!p)
      throw new Error(`Timeline event ${a.sequence} references unknown die '${a.dieId}'.`);
    if (a.parentDieId !== null && (typeof a.parentDieId != "string" || !n.has(a.parentDieId)))
      throw new Error(`Timeline event ${a.sequence} references unknown parent '${a.parentDieId}'.`);
    if (a.type === "roll") {
      if (o.has(a.dieId))
        throw new Error(`Timeline die '${a.dieId}' has more than one initial roll.`);
      st(a.value, p.sides), o.set(a.dieId, a);
    }
    if (a.type === "reroll" && !["reroll", "reroll-once", "unique", "unique-once"].includes(a.reason))
      throw new Error(`Timeline reroll ${a.sequence} has unsupported reason '${String(a.reason)}'.`);
    if (a.type === "explode" && (Ae(a.childDieId, `Timeline explosion ${a.sequence} childDieId`), !["explode", "compound", "penetrate"].includes(a.reason)))
      throw new Error(`Timeline explosion ${a.sequence} has unsupported reason '${String(a.reason)}'.`);
    if (a.type === "transform" && !["minimum", "maximum", "penetrate", "compound"].includes(a.reason))
      throw new Error(`Timeline transform ${a.sequence} has unsupported reason '${String(a.reason)}'.`);
    if (a.type === "exclude" && !["drop", "keep", "compound-absorbed"].includes(a.reason))
      throw new Error(`Timeline exclusion ${a.sequence} has unsupported reason '${String(a.reason)}'.`);
    if (a.type === "include" && !Number.isFinite(a.contribution))
      throw new Error(`Timeline inclusion ${a.sequence} has a non-finite contribution.`);
    if (a.type === "classify" && ![
      "success",
      "failure",
      "neutral",
      "critical-success",
      "critical-failure"
    ].includes(a.outcome))
      throw new Error(`Timeline classification ${a.sequence} has unsupported outcome '${String(a.outcome)}'.`);
  }
  for (const a of n.keys())
    if (!o.has(a))
      throw new Error(`Timeline die '${a}' is missing its initial roll event.`);
  const c = /* @__PURE__ */ new Map();
  for (const [a, p] of n) {
    const $ = o.get(a);
    c.set(a, {
      definition: p,
      roll: $,
      parentDieId: $.parentDieId,
      depth: -1,
      physicalValue: $.value,
      discarded: !1
    });
  }
  const l = (a, p = /* @__PURE__ */ new Set()) => {
    if (a.depth >= 0)
      return a.depth;
    if (p.has(a.definition.id))
      throw new Error(`Timeline explosion lineage contains a cycle at '${a.definition.id}'.`);
    return p.add(a.definition.id), a.parentDieId === null ? a.depth = 0 : a.depth = l(c.get(a.parentDieId), p) + 1, p.delete(a.definition.id), a.depth;
  };
  for (const a of c.values())
    l(a);
  const r = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  for (const a of t.events) {
    const p = c.get(a.dieId);
    if (a.parentDieId !== p.parentDieId)
      throw new Error(`Timeline event ${a.sequence} has inconsistent parentDieId for '${a.dieId}'.`);
    if (a.rollIndex !== p.roll.rollIndex || a.sourceNodeId !== p.roll.sourceNodeId)
      throw new Error(`Timeline event ${a.sequence} has inconsistent roll/source identity for '${a.dieId}'.`);
    if (a.type === "roll") {
      d.set(a.dieId, a.value);
      continue;
    }
    const $ = d.get(a.dieId);
    if ($ === void 0)
      throw new Error(`Timeline event ${a.sequence} occurs before the initial roll of '${a.dieId}'.`);
    if (a.type === "reroll") {
      if (a.from !== $)
        throw new Error(`Timeline reroll ${a.sequence} expected from ${$}, received ${a.from}.`);
      st(a.to, p.definition.sides), d.set(a.dieId, a.to), p.physicalValue = a.to;
    } else if (a.type === "transform") {
      if (a.from !== $)
        throw new Error(`Timeline transform ${a.sequence} expected from ${$}, received ${a.from}.`);
      if (!Number.isFinite(a.to))
        throw new Error(`Timeline transform ${a.sequence} has a non-finite target.`);
      d.set(a.dieId, a.to);
    } else if (a.type === "explode") {
      const H = c.get(a.childDieId);
      if (!H)
        throw new Error(`Timeline explosion ${a.sequence} references unknown child '${a.childDieId}'.`);
      if (H.parentDieId !== a.dieId)
        throw new Error(`Timeline explosion ${a.sequence} child '${a.childDieId}' does not reference parent '${a.dieId}'.`);
      if (r.has(a.childDieId))
        throw new Error(`Timeline child '${a.childDieId}' has multiple explosion events.`);
      if (a.value !== d.get(a.childDieId))
        throw new Error(`Timeline explosion ${a.sequence} value does not match child '${a.childDieId}'.`);
      r.set(a.childDieId, a);
    } else
      a.type === "exclude" ? p.discarded = !0 : a.type === "include" && (p.discarded = !1);
  }
  for (const a of c.values())
    if (a.parentDieId !== null && !r.has(a.definition.id))
      throw new Error(`Timeline generated die '${a.definition.id}' is missing its explosion event.`);
  const f = /* @__PURE__ */ new Map();
  for (const a of t.events)
    if (a.type === "reroll") {
      const p = f.get(a.dieId) ?? [];
      p.push(a), f.set(a.dieId, p);
    }
  const m = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
  for (const a of c.values()) {
    let p = a.roll.value, $ = p, H = !1;
    const ie = f.get(a.definition.id) ?? [];
    for (let B = 0; B < ie.length; B++) {
      const G = ie[B], Y = G.reason.startsWith("unique") ? "unique" : "reroll";
      if (!e.effects[Y].enabled) {
        p = G.to, H || ($ = p);
        continue;
      }
      H = !0;
      let b = G.to;
      const I = [G.sequence];
      for (let O = B + 1; O < ie.length; O++) {
        const j = ie[O], se = j.reason.startsWith("unique") ? "unique" : "reroll";
        if (e.effects[se].enabled)
          break;
        b = j.to, I.push(j.sequence);
      }
      u.set(G.sequence, Object.freeze({
        kind: "reroll",
        effect: Y,
        dieId: G.dieId,
        from: p,
        to: b,
        eventSequences: Object.freeze(I)
      })), p = b;
    }
    m.set(a.definition.id, $);
  }
  const y = /* @__PURE__ */ new Set();
  if (e.enabled)
    for (const a of t.events) {
      if (a.type !== "exclude")
        continue;
      const p = a.reason === "compound-absorbed" ? "compound" : a.reason;
      e.effects[p].enabled && y.add(a.dieId);
    }
  const x = [...c.values()].filter((a) => a.depth === 0 || !e.effects.explode.enabled), D = Object.freeze(x.map((a) => yt(
    a,
    m.get(a.definition.id),
    y.has(a.definition.id) ? !1 : a.discarded
  ))), M = [];
  if (e.enabled) {
    if (e.effects.explode.enabled) {
      const b = Math.max(...[...c.values()].map((I) => I.depth));
      for (let I = 1; I <= b; I++) {
        const O = [...c.values()].filter((j) => j.depth === I).map((j) => Object.freeze({
          kind: "explode",
          effect: "explode",
          dieId: j.definition.id,
          parentDieId: j.parentDieId,
          value: m.get(j.definition.id),
          discarded: y.has(j.definition.id) ? !1 : j.discarded,
          eventSequences: Object.freeze([
            j.roll.sequence,
            r.get(j.definition.id).sequence
          ])
        }));
        O.length && M.push(ze(`explode-depth-${I}`, "explode", O, e));
      }
    }
    const a = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
    for (const b of t.events) {
      const I = u.get(b.sequence);
      if (!I)
        continue;
      const O = p.get(I.dieId) ?? 0;
      p.set(I.dieId, O + 1);
      const j = a.get(O) ?? [];
      j.push({ sequence: b.sequence, action: I }), a.set(O, j);
    }
    for (const [b, I] of [...a.entries()].sort(([O], [j]) => O - j)) {
      const O = /* @__PURE__ */ new Map();
      for (const j of I) {
        const se = O.get(j.action.effect) ?? [];
        se.push(j), O.set(j.action.effect, se);
      }
      for (const [j, se] of [...O.entries()].sort(([, Ye], [, Kt]) => Ye[0].sequence - Kt[0].sequence))
        M.push(ze(
          `reroll-round-${b}-${j}`,
          j,
          se.map((Ye) => Ye.action),
          e
        ));
    }
    const $ = t.events.filter((b) => b.type === "transform"), H = /* @__PURE__ */ new Map();
    for (const b of $) {
      if (b.reason !== "compound" && b.reason !== "penetrate" || !e.effects[b.reason].enabled)
        continue;
      const I = H.get(b.reason) ?? [];
      I.push(Object.freeze({
        kind: "transform",
        effect: b.reason,
        dieId: b.dieId,
        from: b.from,
        to: b.to,
        eventSequences: Object.freeze([b.sequence])
      })), H.set(b.reason, I);
    }
    for (const [b, I] of H)
      M.push(ze(`transform-${b}`, b, I, e));
    const ie = t.events.filter((b) => b.type === "exclude"), B = /* @__PURE__ */ new Map();
    for (const b of ie) {
      const I = b.reason === "compound-absorbed" ? "compound" : b.reason;
      if (!e.effects[I].enabled)
        continue;
      const O = B.get(I) ?? [];
      O.push(Object.freeze({
        kind: "selection",
        effect: I,
        dieId: b.dieId,
        discarded: !0,
        eventSequences: Object.freeze([b.sequence])
      })), B.set(I, O);
    }
    for (const [b, I] of B)
      M.push(ze(`selection-${b}`, b, I, e));
    const G = t.events.filter((b) => b.type === "classify"), Y = /* @__PURE__ */ new Map();
    for (const b of G) {
      const I = yi(b);
      if (!e.effects[I].enabled)
        continue;
      const O = e.effects[I], j = "pulses" in O ? O.pulses : 1, se = Y.get(I) ?? [];
      se.push(Object.freeze({
        kind: "classify",
        effect: I,
        dieId: b.dieId,
        pulses: j,
        eventSequences: Object.freeze([b.sequence])
      })), Y.set(I, se);
    }
    for (const [b, I] of Y)
      M.push(ze(`classify-${b}`, b, I, e));
  }
  const v = new Set(M.flatMap((a) => a.eventSequences)), g = new Set(D.map((a) => a.id)), w = /* @__PURE__ */ new Map();
  for (const a of M)
    for (const p of a.actions)
      p.kind === "explode" && w.set(p.dieId, a.id);
  const T = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Map();
  for (const a of t.events) {
    if (v.has(a.sequence))
      continue;
    const p = g.has(a.dieId) ? void 0 : w.get(a.dieId);
    if (!p) {
      T.add(a.sequence);
      continue;
    }
    const $ = C.get(p) ?? [];
    $.push(a.sequence), C.set(p, $);
  }
  const E = M.map((a) => {
    const p = C.get(a.id);
    return p != null && p.length ? Object.freeze({
      ...a,
      eventSequences: Object.freeze(
        [.../* @__PURE__ */ new Set([...a.eventSequences, ...p])].sort(($, H) => $ - H)
      )
    }) : a;
  }), k = Math.max(0, i) + E.reduce(
    (a, p) => a + e.phaseGapMs + p.delayMs + p.durationMs,
    0
  ), A = !e.enabled || t.events.length > e.maxEvents || k > e.maxDurationMs, Z = Object.freeze([...c.values()].map((a) => yt(a, a.physicalValue)));
  return Object.freeze({
    id: t.id,
    seed: t.seed,
    mode: t.mode,
    definitions: n,
    initialDice: D,
    finalDice: Z,
    phases: Object.freeze(A ? [] : E),
    initialEventSequences: Object.freeze(A ? t.events.map((a) => a.sequence) : [...T].sort((a, p) => a - p)),
    allEventSequences: Object.freeze(t.events.map((a) => a.sequence)),
    eventCount: t.events.length,
    estimatedDurationMs: k,
    degraded: A
  });
}, bt = (t) => {
  try {
    console.error("[DiceResultViewer] onTimelineProgress callback failed:", t);
  } catch {
  }
}, Me = (t, e) => {
  try {
    const i = t(e);
    i && typeof i.then == "function" && Promise.resolve(i).catch(bt);
  } catch (i) {
    bt(i);
  }
}, At = (t) => {
  const e = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), n = [...t.definitions.keys()], s = (l, r, d, f, m) => Object.freeze({
    id: t.id,
    stage: l,
    phaseIndex: r,
    phaseCount: t.phases.length,
    phaseId: d,
    effect: f,
    revealedDieIds: Object.freeze([...m]),
    dice: Object.freeze(n.flatMap((u) => {
      const y = e.get(u);
      return y ? [Object.freeze({ ...y })] : [];
    })),
    completedEventSequences: Object.freeze([...i].sort((u, y) => u - y))
  }), o = (l) => {
    e.set(l.id, Object.freeze({
      id: l.id,
      value: l.value,
      discarded: l.discarded ?? !1
    }));
  }, c = (l) => {
    if (l.kind === "explode")
      o({ id: l.dieId, value: l.value, discarded: l.discarded });
    else if (l.kind === "reroll") {
      const r = e.get(l.dieId);
      r && o({ ...r, value: l.to });
    } else if (l.kind === "selection") {
      const r = e.get(l.dieId);
      r && o({ ...r, discarded: l.discarded });
    }
    for (const r of l.eventSequences)
      i.add(r);
  };
  return Object.freeze({
    initial: () => {
      const l = t.degraded ? t.finalDice : t.initialDice;
      for (const r of l)
        o(r);
      for (const r of t.initialEventSequences)
        i.add(r);
      return s("initial", null, null, null, l.map((r) => r.id));
    },
    completePhaseAction: (l, r) => {
      const d = t.phases[l];
      if (!d)
        throw new Error(`Timeline phase index ${l} is out of range.`);
      const f = d.actions[r];
      if (!f)
        throw new Error(`Timeline phase action index ${r} is out of range.`);
      return c(f), s(
        "phase",
        l,
        `${d.id}:${f.dieId}`,
        d.effect,
        [f.dieId]
      );
    },
    completePhase: (l) => {
      const r = t.phases[l];
      if (!r)
        throw new Error(`Timeline phase index ${l} is out of range.`);
      for (const d of r.actions)
        c(d);
      for (const d of r.eventSequences)
        i.add(d);
      return s(
        "phase",
        l,
        r.id,
        r.effect,
        [...new Set(r.actions.map((d) => d.dieId))]
      );
    },
    complete: () => {
      for (const l of t.finalDice)
        o(l);
      for (const l of t.allEventSequences)
        i.add(l);
      return s("complete", null, null, null, []);
    }
  });
}, xi = (t, e) => {
  if (t.effect === "compound")
    return e.effects.compound.showBadge ? `Σ ${t.to}` : null;
  if (!e.effects.penetrate.showBadge)
    return null;
  const i = Math.abs(t.from - t.to);
  return i > 0 ? `−${i}` : null;
}, Mi = (t) => {
  let e = 2166136261;
  for (let i = 0; i < t.length; i++)
    e ^= t.charCodeAt(i), e = Math.imul(e, 16777619);
  return e >>> 0;
}, Fe = (t) => {
  let e = Mi(t) || 2654435769;
  const i = () => {
    e += 1831565813;
    let n = e;
    return n = Math.imul(n ^ n >>> 15, n | 1), n ^= n + Math.imul(n ^ n >>> 7, n | 61), ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
  return {
    next: i,
    range: (n, s) => n + (s - n) * i()
  };
}, Ft = (t, e) => /^(?:data:|https?:|\/)/.test(e) ? e : `${t}/${e}`, vi = (t) => /\/coin-[12]\.svg(?:\?|$)/.test(t), Rt = (t, e) => {
  try {
    return R.FromHexString(t);
  } catch {
    return R.FromHexString(e);
  }
}, Ht = (t, e) => t.colorize ? e : t.edgeColor || e, xt = (t, e, i) => `${t}|${e.toLowerCase()}|${String(i)}`, Nt = (t, e, i, n) => {
  const s = new Pt(e, { width: 256, height: 256 }, t, !1), o = s.getContext();
  return o.clearRect(0, 0, 256, 256), o.save(), o.font = "bold 148px sans-serif", o.textAlign = "center", o.textBaseline = "middle", o.lineJoin = "round", n && (o.translate(128, 128), o.rotate(Math.PI), o.translate(-128, -128)), o.strokeStyle = "#111827", o.lineWidth = 12, o.strokeText(String(i), 128, 139), o.fillStyle = "#f8fafc", o.fillText(String(i), 128, 139), o.restore(), s.hasAlpha = !0, s.update(!1), s;
}, Mt = (t, e, i, n, s, o, c) => {
  const l = n[s], r = new De(e, t);
  r.specularColor = new R(0.3, 0.3, 0.3);
  const d = l.texture ? Ft(i, l.texture) : "";
  if (n.colorize) {
    const f = c ? new R(0.45, 0.45, 0.45) : Rt(o, "#2e8555");
    r.disableLighting = !0, r.diffuseColor = f, r.emissiveColor = f;
  } else {
    const f = d ? new be(d, t, !1, !1) : Nt(t, `${e}-fallback`, l.value, s === "front");
    f.hasAlpha = !0, s === "front" && (f.wAng = Math.PI), r.diffuseColor = c ? new R(0.45, 0.45, 0.45) : R.White(), r.emissiveColor = new R(0.22, 0.22, 0.22), r.diffuseTexture = f, r.emissiveTexture = f;
  }
  return r.freeze(), r;
}, vt = (t, e, i, n, s) => {
  const o = n[s], c = o.texture ? Ft(i, o.texture) : "", l = c && !vi(c) ? new be(c, t, !1, !0) : Nt(t, `${e}-fallback`, o.value, s === "front");
  l.hasAlpha = !0, s === "front" && (l.wAng = Math.PI);
  const r = new De(e, t);
  return r.backFaceCulling = !1, r.disableLighting = !0, r.diffuseColor = R.White(), r.diffuseTexture = l, r.emissiveColor = R.White(), r.emissiveTexture = l, r.specularColor = R.Black(), r.transparencyMode = si.MATERIAL_ALPHABLEND, r.useAlphaFromDiffuseTexture = !0, r.freeze(), r;
}, Lt = (t) => t === 1 ? V.Identity() : V.RotationAxis(F.Forward(), Math.PI), Ti = (t, e) => t * e * 0.14 / 2;
var he, ae, X, We, qt;
class Ei {
  constructor(e) {
    S(this, We);
    S(this, he, /* @__PURE__ */ new Map());
    S(this, ae, /* @__PURE__ */ new Map());
    S(this, X, void 0);
    z(this, X, e);
  }
  create(e, i, n) {
    const s = xt(e.theme, i.themeColor, i.discarded), o = _(this, We, qt).call(this, e, i.themeColor, i.discarded), c = h(this, ae).get(s), l = (c == null ? void 0 : c.pop()) ?? o.root.clone(`coin-${i.id}`, null, !1);
    l.name = `coin-${i.id}`, l.metadata = { displayFactory: "coin", poolKey: s }, l.setEnabled(!0), l.scaling.setAll(n * 0.14), l.rotationQuaternion = V.Identity();
    const r = l.getChildMeshes(!1);
    for (const d of r)
      d.visibility = i.discarded ? 0.42 : 1;
    return {
      root: l,
      meshes: r,
      supportHeight: Ti(o.thickness, n),
      horizontalRadius: o.diameter * n * 0.14 / 2,
      targetQuaternion: Lt(i.value)
    };
  }
  release(e) {
    var s;
    const i = typeof ((s = e.metadata) == null ? void 0 : s.poolKey) == "string" ? e.metadata.poolKey : void 0;
    if (!i) {
      e.dispose(!1, !1);
      return;
    }
    e.setEnabled(!1), e.position.set(0, -100, 0), e.rotationQuaternion = V.Identity();
    const n = h(this, ae).get(i) ?? [];
    n.push(e), h(this, ae).set(i, n);
  }
  dispose() {
    for (const e of h(this, ae).values())
      for (const i of e)
        i.dispose(!1, !1);
    h(this, ae).clear();
    for (const e of h(this, he).values()) {
      e.root.dispose(!1, !0);
      for (const i of e.materials)
        i.dispose(!0, !0);
    }
    h(this, he).clear();
  }
}
he = new WeakMap(), ae = new WeakMap(), X = new WeakMap(), We = new WeakSet(), qt = function(e, i, n) {
  const s = xt(e.theme, i, n), o = h(this, he).get(s);
  if (o)
    return o;
  const c = e.coin, l = Math.max(0.3, Number(c.diameter) || 1), r = Math.max(0.04, Number(c.thickness) || 0.12), d = s.replace(/[^a-z0-9-]+/gi, "-"), f = new ni(`coin-template-${d}`, h(this, X)), m = new De(`coin-edge-${d}`, h(this, X)), u = n ? new R(0.45, 0.45, 0.45) : Rt(Ht(c, i), "#2e8555");
  m.diffuseColor = c.colorize ? u.scale(0.72) : u, m.emissiveColor = m.diffuseColor.scale(0.12), m.specularColor = new R(0.65, 0.65, 0.65), m.freeze();
  const y = Mt(
    h(this, X),
    `coin-front-${d}`,
    e.basePath,
    c,
    "front",
    i,
    n
  ), x = Mt(
    h(this, X),
    `coin-back-${d}`,
    e.basePath,
    c,
    "back",
    i,
    n
  ), D = c.colorize ? vt(h(this, X), `coin-front-artwork-${d}`, e.basePath, c, "front") : null, M = c.colorize ? vt(h(this, X), `coin-back-artwork-${d}`, e.basePath, c, "back") : null, v = ii(`${f.name}-edge`, { diameter: l, height: r, tessellation: 48, cap: 0 }, h(this, X));
  v.material = m, v.parent = f;
  const g = l * 0.48, w = Le(`${f.name}-front`, { radius: g, tessellation: 48, sideOrientation: 2 }, h(this, X));
  w.rotation.x = Math.PI / 2, w.position.y = r / 2 + 1e-3, w.material = y, w.parent = f;
  const T = Le(`${f.name}-back`, { radius: g, tessellation: 48, sideOrientation: 2 }, h(this, X));
  if (T.rotation.x = -Math.PI / 2, T.position.y = -r / 2 - 1e-3, T.material = x, T.parent = f, D) {
    const E = Le(
      `${f.name}-front-artwork`,
      { radius: g, tessellation: 48, sideOrientation: 2 },
      h(this, X)
    );
    E.rotation.x = Math.PI / 2, E.position.y = r / 2 + 3e-3, E.material = D, E.parent = f;
  }
  if (M) {
    const E = Le(
      `${f.name}-back-artwork`,
      { radius: g, tessellation: 48, sideOrientation: 2 },
      h(this, X)
    );
    E.rotation.x = -Math.PI / 2, E.position.y = -r / 2 - 3e-3, E.material = M, E.parent = f;
  }
  f.setEnabled(!1);
  const C = {
    root: f,
    materials: [
      m,
      y,
      x,
      ...D ? [D] : [],
      ...M ? [M] : []
    ],
    diameter: l,
    thickness: r
  };
  return h(this, he).set(s, C), C;
};
class $i extends oi {
  constructor(e) {
    super(e, "dice-color-texture-mask", 200, {}, !0, !0);
  }
  getCustomCode(e) {
    return e !== "fragment" ? null : {
      CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
#ifdef DIFFUSE
	baseColor.rgb = mix(diffuseColor, baseColor.rgb, baseColor.a);
	baseColor.a = 1.0;
	diffuseColor = vec3(1.0);
#endif
`
    };
  }
}
const rt = (t) => t.meshFilePath, Tt = (t, e, i) => `${rt(t)}|${e}|${i}`, et = (t, e) => /^(?:data:|https?:|\/)/.test(e) ? e : `${t}/${e}`, Ii = (t) => {
  const e = t.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(e))
    return !1;
  const i = Number.parseInt(e.slice(0, 2), 16), n = Number.parseInt(e.slice(2, 4), 16), s = Number.parseInt(e.slice(4, 6), 16);
  return i * 0.299 + n * 0.587 + s * 0.114 > 175;
}, tt = (t, e, i, n) => {
  const s = (e == null ? void 0 : e[i * 3 + n]) ?? i * 3 + n;
  return new F(t[s * 3] ?? 0, t[s * 3 + 1] ?? 0, t[s * 3 + 2] ?? 0);
}, Si = (t, e) => {
  const i = t.getVerticesData("position");
  if (!i)
    return null;
  const n = t.getIndices(), s = tt(i, n, e, 0), o = tt(i, n, e, 1), c = tt(i, n, e, 2), l = F.Cross(o.subtract(s), c.subtract(s));
  if (l.lengthSquared() < 1e-10)
    return null;
  const r = s.add(o).add(c).scale(1 / 3);
  return F.Dot(l, r) < 0 && l.scaleInPlace(-1), l.normalize();
}, Et = (t, e, i, n) => {
  const s = F.Zero();
  let o = 0;
  for (const [l, r] of Object.entries(e)) {
    if (Number(r) !== i)
      continue;
    const d = Si(t, Number(l));
    d && (s.addInPlace(d), o++);
  }
  if (o === 0 || s.lengthSquared() < 1e-10)
    throw new Error(`No orientation was found for face ${i}.`);
  const c = n ? F.Down() : F.Up();
  return V.FromUnitVectorsToRef(s.normalize(), c, V.Identity()).normalize();
}, $t = (t, e) => {
  const i = t.getVerticesData("position");
  if (!(i != null && i.length))
    throw new Error(`Collider '${t.name}' has no positions.`);
  const n = pt.Identity();
  pt.FromQuaternionToRef(e, n);
  let s = Number.POSITIVE_INFINITY;
  for (let o = 0; o < i.length; o += 3) {
    const c = F.TransformCoordinates(new F(
      i[o] ?? 0,
      i[o + 1] ?? 0,
      i[o + 2] ?? 0
    ), n);
    s = Math.min(s, c.y);
  }
  if (!Number.isFinite(s))
    throw new Error(`Collider '${t.name}' has invalid positions.`);
  return Math.max(0, -s);
};
var re, fe, me, ce, le, Ge, Vt, Qe, Zt;
class Di {
  constructor(e) {
    S(this, Ge);
    S(this, Qe);
    S(this, re, void 0);
    S(this, fe, /* @__PURE__ */ new Map());
    S(this, me, /* @__PURE__ */ new Map());
    S(this, ce, /* @__PURE__ */ new Map());
    S(this, le, /* @__PURE__ */ new Map());
    z(this, re, e);
  }
  load(e) {
    const i = rt(e), n = h(this, fe).get(i);
    if (n)
      return n;
    const s = _(this, Ge, Vt).call(this, e);
    return h(this, fe).set(i, s), s.catch(() => h(this, fe).delete(i)), s;
  }
  async create(e, i, n, s, o, c, l) {
    var v;
    const r = await this.load(e), d = `d${n}`, f = r.visualMeshes.get(d), m = r.colliderMeshes.get(d), u = r.faceMaps[d];
    if (!f || !m || !u)
      throw new Error(`${d} is unavailable in theme '${e.theme}'.`);
    const y = `${rt(e)}|${d}`, x = ((v = h(this, le).get(y)) == null ? void 0 : v.pop()) ?? f.clone(`${e.theme}-${d}-${o}`, null, !1);
    if (!x)
      throw new Error(`Unable to instantiate ${d}.`);
    x.name = `${e.theme}-${d}-${o}`, x.metadata = { ...x.metadata, displayFactory: "polyhedron", poolKey: y }, x.setEnabled(!0), x.isPickable = !1, x.doNotSyncBoundingInfo = !1, x.unfreezeWorldMatrix(), x.scaling.setAll(c), x.rotationQuaternion = V.Identity(), x.material = _(this, Qe, Zt).call(this, e, i.themeColor, i.discarded);
    const D = Tt(e, d, s);
    let M = h(this, ce).get(D);
    if (!M) {
      const g = Et(m, u, s, n === 4);
      M = {
        supportHeight: $t(m, g),
        targetQuaternion: g
      }, h(this, ce).set(D, M);
    }
    return {
      mesh: x,
      physicsCollider: m,
      supportHeight: M.supportHeight * c * l,
      horizontalRadius: m.getBoundingInfo().boundingSphere.radius * c * l,
      targetQuaternion: M.targetQuaternion.clone()
    };
  }
  async getOrientation(e, i, n) {
    const s = await this.load(e), o = `d${i}`, c = s.colliderMeshes.get(o), l = s.faceMaps[o];
    if (!c || !l)
      throw new Error(`${o} is unavailable in theme '${e.theme}'.`);
    const r = Tt(e, o, n);
    let d = h(this, ce).get(r);
    if (!d) {
      const f = Et(c, l, n, i === 4);
      d = {
        supportHeight: $t(c, f),
        targetQuaternion: f
      }, h(this, ce).set(r, d);
    }
    return {
      supportHeight: d.supportHeight,
      targetQuaternion: d.targetQuaternion.clone()
    };
  }
  release(e) {
    var s;
    const i = typeof ((s = e.metadata) == null ? void 0 : s.poolKey) == "string" ? e.metadata.poolKey : void 0;
    if (!i) {
      e.dispose(!1, !1);
      return;
    }
    e.setEnabled(!1), e.position.set(0, -100, 0), e.rotationQuaternion = V.Identity(), e.scaling.setAll(1);
    const n = h(this, le).get(i) ?? [];
    n.push(e), h(this, le).set(i, n);
  }
  dispose() {
    for (const e of h(this, le).values())
      for (const i of e)
        i.dispose(!1, !1);
    h(this, le).clear();
    for (const e of h(this, me).values())
      e.dispose(!0, !0);
    h(this, me).clear(), h(this, ce).clear(), h(this, fe).clear();
  }
}
re = new WeakMap(), fe = new WeakMap(), me = new WeakMap(), ce = new WeakMap(), le = new WeakMap(), Ge = new WeakSet(), Vt = async function(e) {
  const i = await fetch(e.meshFilePath);
  if (!i.ok)
    throw new Error(`Unable to fetch dice model '${e.meshFilePath}'.`);
  const n = await i.json();
  if (!n.colliderFaceMap)
    throw new Error(`Dice model '${e.meshFilePath}' has no colliderFaceMap.`);
  const s = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const c of n.meshes) {
    const l = { ...c };
    delete l.physicsImpostor;
    const r = je.Parse(l, h(this, re), ""), d = r.name;
    r.name = `${e.meshName}_${d}`, r.setEnabled(!1), r.isPickable = !1, r.freezeNormals(), r.computeWorldMatrix(!0), d.endsWith("_collider") ? o.set(d.replace("_collider", ""), r) : s.set(d, r);
  }
  return !s.has("d100") && s.has("d10") && s.set("d100", s.get("d10")), !o.has("d100") && o.has("d10") && o.set("d100", o.get("d10")), { visualMeshes: s, colliderMeshes: o, faceMaps: n.colliderFaceMap };
}, Qe = new WeakSet(), Zt = function(e, i, n) {
  const s = `${e.theme}|${i}|${n}`, o = h(this, me).get(s);
  if (o)
    return o;
  const c = new De(`display-material-${s}`, h(this, re)), l = n ? new R(0.45, 0.45, 0.45) : R.FromHexString(i);
  c.diffuseColor = e.material.type === "color" || n ? l : R.White(), c.emissiveColor = l.scale(0.18), c.specularColor = n ? new R(0.1, 0.1, 0.1) : new R(0.35, 0.35, 0.35);
  const r = e.material.diffuseTexture, d = typeof r == "string" ? r : r == null ? void 0 : r[Ii(i) ? "dark" : "light"];
  return d && (c.diffuseTexture = new be(et(e.basePath, d), h(this, re), !1, !0), c.diffuseTexture.level = e.material.diffuseLevel ?? 1, e.material.type === "color" && new $i(c)), e.material.bumpTexture && (c.bumpTexture = new be(et(e.basePath, e.material.bumpTexture), h(this, re), !1, !0), c.bumpTexture.level = e.material.bumpLevel ?? 1), e.material.specularTexture && (c.specularTexture = new be(et(e.basePath, e.material.specularTexture), h(this, re), !1, !0)), c.freeze(), h(this, me).set(s, c), c;
};
const ve = 30, Re = 0.28, qe = 24;
var ne, J, K, Te, He, Ne, ct;
const ut = class ut {
  constructor(e, i) {
    S(this, Ne);
    L(this, "engine");
    L(this, "scene");
    L(this, "camera");
    L(this, "lights");
    S(this, ne, void 0);
    S(this, J, void 0);
    S(this, K, void 0);
    S(this, Te, 0);
    S(this, He, void 0);
    z(this, He, i), this.engine = new ri(e, i.antialias, {
      alpha: !0,
      preserveDrawingBuffer: !1,
      stencil: !0,
      disableWebGL2Support: !1
    }), this.scene = new ai(this.engine), this.scene.clearColor = new ei(0, 0, 0, 0), this.scene.skipPointerMovePicking = !0, this.camera = new ci("display-camera", new F(0, ve, 0), this.scene), this.camera.setTarget(F.Zero()), this.camera.fov = Re, this.scene.activeCamera = this.camera;
    const n = new li("display-directional", new F(-0.35, -1, 0.25), this.scene);
    n.position = new F(4, 12, -4), n.intensity = 0.72 * i.lightIntensity;
    const s = new di("display-hemispheric", F.Up(), this.scene);
    s.intensity = 0.42 * i.lightIntensity, this.lights = { directional: n, hemispheric: s }, z(this, J, hi("display-ground", { width: qe, height: qe }, this.scene)), h(this, J).receiveShadows = i.enableShadows, z(this, ne, new De("display-ground-material", this.scene)), h(this, ne).diffuseColor = new R(0.05, 0.05, 0.05), h(this, ne).specularColor = R.Black(), h(this, ne).alpha = i.enableShadows ? 0.14 : 0, h(this, J).material = h(this, ne);
  }
  static async create(e, i) {
    var s;
    const n = new ut(e, i);
    return await _(s = n, Ne, ct).call(s, i), n;
  }
  addShadowCaster(e) {
    var i;
    (i = h(this, K)) == null || i.addShadowCaster(e);
  }
  async update(e) {
    z(this, He, e), this.lights.directional.intensity = 0.72 * e.lightIntensity, this.lights.hemispheric.intensity = 0.42 * e.lightIntensity, await _(this, Ne, ct).call(this, e);
  }
  resize() {
    this.engine.resize();
  }
  ensureGroundCoverage(e, i) {
    h(this, J).scaling.x = Math.max(1, e / qe), h(this, J).scaling.z = Math.max(1, i / qe);
  }
  dispose() {
    var e;
    this.engine.stopRenderLoop(), (e = h(this, K)) == null || e.dispose(), z(this, K, void 0), this.scene.dispose(), this.engine.dispose();
  }
};
ne = new WeakMap(), J = new WeakMap(), K = new WeakMap(), Te = new WeakMap(), He = new WeakMap(), Ne = new WeakSet(), ct = async function(e) {
  var i, n;
  if (!e.enableShadows) {
    (i = h(this, K)) == null || i.dispose(), z(this, K, void 0), z(this, Te, 0), h(this, J).receiveShadows = !1, h(this, ne).alpha = 0;
    return;
  }
  if (!h(this, K) || h(this, Te) !== e.shadowResolution) {
    (n = h(this, K)) == null || n.dispose(), await import("@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent");
    const { ShadowGenerator: s } = await import("@babylonjs/core/Lights/Shadows/shadowGenerator"), o = new s(e.shadowResolution, this.lights.directional);
    o.useBlurExponentialShadowMap = !0, o.blurKernel = 16;
    for (const c of this.scene.meshes)
      c !== h(this, J) && c.isEnabled() && c.isVisible && o.addShadowCaster(c);
    z(this, K, o), z(this, Te, e.shadowResolution);
  }
  h(this, K).darkness = e.shadowTransparency, h(this, J).receiveShadows = !0, h(this, ne).alpha = 0.14;
};
let at = ut;
const It = 0.55, lt = 0.06, Ve = (t, e) => Number.isFinite(t) && t > 0 ? t : e, _e = (t) => Number.isFinite(t) ? Math.max(0, t ?? 0) : 0, te = (t, e, i) => Math.max(e, Math.min(i, t)), Xe = (t) => {
  const e = Ve(t.width, 1), i = Ve(t.height, 1), n = Ve(t.cameraHeight, 1), s = te(Ve(t.cameraFov, 0.28), 0.01, Math.PI - 0.01), o = Number.isFinite(t.planeY) ? Math.min(t.planeY ?? 0, n - 0.01) : 0, c = Math.max(0.01, n - o), l = e / i, r = c * Math.tan(s / 2), d = r * l, f = _e(t.wallPadding), m = _e(t.minimumRadius), u = Math.max(It, m + lt), y = Math.max(It, m + lt), x = Math.max(u, d - f), D = Math.max(y, r - f);
  return {
    width: e,
    height: i,
    aspect: l,
    planeY: o,
    visibleHalfX: d,
    visibleHalfZ: r,
    halfX: x,
    halfZ: D,
    left: -x,
    right: x,
    north: -D,
    south: D
  };
}, xe = (t, e, i = lt) => {
  const n = _e(e) + _e(i), s = t.left + n, o = t.right - n, c = t.north + n, l = t.south - n, r = (t.left + t.right) / 2, d = (t.north + t.south) / 2;
  return {
    minX: s <= o ? s : r,
    maxX: s <= o ? o : r,
    minZ: c <= l ? c : d,
    maxZ: c <= l ? l : d
  };
}, dt = (t, e, i) => {
  const n = xe(e, i), s = te(Number.isFinite(t.x) ? t.x : 0, n.minX, n.maxX), o = te(Number.isFinite(t.z) ? t.z : 0, n.minZ, n.maxZ), c = s !== t.x || o !== t.z;
  return t.x = s, t.z = o, c;
}, Ce = (t) => 1 - Math.pow(1 - t, 3), it = (t) => Math.max(0, Math.min(1, t)), zi = Math.PI * (3 - Math.sqrt(5)), Ci = 2.8, Pi = ve * 0.27, Oi = 2, ji = 2.4, nt = (t, e, i) => {
  const n = Fe(`${t}:launch-edge`);
  return ["left", "right", "north", "south"][Math.min(3, Math.floor(n.next() * 4))];
}, ht = (t, e, i) => {
  const n = Math.max(
    0.01,
    t.spawnSpacing,
    t.objectRadius * 2.1,
    t.scale * 0.286
  ), s = Math.max(0, i - e), o = Math.max(1, Math.floor(s / n) + 1), l = o * Oi, r = t.index % l, d = Math.floor(r / o), f = r % o, m = (o - 1) * n, u = (e + i - m) / 2;
  return {
    tangent: te(u + f * n, e, i),
    row: d,
    wave: Math.floor(t.index / l),
    waveCapacity: l,
    spacing: n
  };
}, St = (t, e) => {
  const i = Fe(`${t}:launch-dynamics`), n = Number.isFinite(e) ? te(e, 0, 1) : 0, s = i.next() < n, o = s ? i.range(0.55, 1) : 0, c = 0.9 + 0.18 * ((i.next() + i.next()) / 2), l = (10 + (s ? 46 * o : 0)) * Math.PI / 180;
  return {
    aggressive: s,
    intensity: o,
    energyScale: c + (s ? 0.62 * o : 0),
    headingRadians: (i.next() + i.next() - 1) * l
  };
}, Dt = (t) => {
  let e = t;
  for (; e > Math.PI; )
    e -= Math.PI * 2;
  for (; e < -Math.PI; )
    e += Math.PI * 2;
  return e;
}, ki = (t, e, i, n, s) => {
  const o = Ai(t, e, n), c = Math.hypot(o.x, o.z);
  if (c <= 1e-6)
    return o;
  const l = e.x - t.x, r = e.z - t.z, d = Math.abs(l) >= Math.abs(r) ? l >= 0 ? 0 : Math.PI : r >= 0 ? Math.PI / 2 : -Math.PI / 2, f = Math.atan2(o.z, o.x), m = (i.next() + i.next() - 1) * 4 * Math.PI / 180, u = Dt(
    f + s.headingRadians + m - d
  ), y = 45 * Math.PI / 180, x = d + te(
    u,
    -y,
    y
  ), D = 0.96 + 0.08 * ((i.next() + i.next()) / 2);
  let M = Math.min(19.5, c * s.energyScale * D);
  const v = Math.cos(Dt(f - d)) * c, g = Math.cos(x - d) * M;
  return g > 1e-6 && g < v && (M = Math.min(19.5, M * v / g)), new F(
    Math.cos(x) * M,
    o.y,
    Math.sin(x) * M
  );
}, Ai = (t, e, i) => {
  const n = Number.isFinite(i) ? Math.max(0, i) : 0, s = new F(e.x - t.x, 0, e.z - t.z), o = s.length();
  if (o <= 1e-4 || n <= 0)
    return F.Zero();
  const c = Math.min(2, n / 4.55), l = (3.4 + Math.min(o, 3.3) * 0.5) * Math.min(1.15, n / 6.4), r = Math.min(
    17.5,
    Math.max(o * n * 0.22, l)
  );
  return s.normalize().scaleInPlace(r), s.y = -Math.min(6, (1.4 + n * 0.38) * Math.sqrt(c)), s;
}, Fi = (t, e) => {
  const i = Math.max(0.78, t.scale * (t.coin ? 0.25 : 0.29)), n = Math.min(i, 7.2 / Math.sqrt(Math.max(1, t.count))), s = t.count === 1 ? e.range(0.15, 0.55) : n * Math.sqrt(t.index + 0.65), o = t.index * zi + e.range(-0.38, 0.38), c = n * 0.16, l = Math.cos(o) * s + e.range(-c, c), r = Math.sin(o) * s + e.range(-c, c), d = t.count === 1 ? 0.55 + c : n * Math.sqrt(t.count - 0.35) + c, f = xe(t.bounds, t.objectRadius), m = Math.max(0, (f.maxX - f.minX) / 2), u = Math.max(0, (f.maxZ - f.minZ) / 2), y = new F(
    l * Math.min(1, m / Math.max(0.01, d)),
    t.coin ? t.scale * 0.01 : t.scale * 0.12,
    r * Math.min(1, u / Math.max(0.01, d))
  );
  return dt(y, t.bounds, t.objectRadius), y;
}, Ri = (t, e, i) => {
  const n = t.launchEdge === "left", s = t.launchEdge === "right", o = t.launchEdge === "north", c = Number.isFinite(t.startingHeight) ? t.startingHeight : 7.6, l = te(
    c + Math.min(t.index, 3) * Math.max(0, t.spawnHeightStep),
    Ci,
    Pi
  ), r = xe(t.bounds, t.objectRadius), d = Xe({
    width: t.bounds.width,
    height: t.bounds.height,
    cameraHeight: ve,
    cameraFov: Re,
    planeY: l,
    minimumRadius: t.objectRadius
  }), f = xe(d, t.objectRadius), m = Math.max(r.minX, f.minX), u = Math.min(r.maxX, f.maxX), y = Math.max(r.minZ, f.minZ), x = Math.min(r.maxZ, f.maxZ), D = m <= u ? m : 0, M = m <= u ? u : 0, v = y <= x ? y : 0, g = y <= x ? x : 0, w = t.objectRadius * (1 + Math.max(0, t.spawnOverscan));
  if (n || s) {
    const $ = ht(t, v, g), H = n ? -d.visibleHalfX - w - $.row * $.spacing : d.visibleHalfX + w + $.row * $.spacing, ie = Math.max(0, r.maxX - r.minX), B = Math.min(3.1, ie * 0.46), G = Math.max(1e-4, r.maxX - r.minX), Y = te(
      (e.x - r.minX) / G,
      0,
      1
    );
    if (n) {
      const O = Math.min(r.maxX, H + B);
      e.x = O + (r.maxX - O) * Y;
    } else {
      const O = Math.max(r.minX, H - B);
      e.x = r.minX + (O - r.minX) * Y;
    }
    const b = $.tangent, I = Math.abs(e.x - H);
    return e.z = te(
      e.z,
      Math.max(r.minZ, b - I),
      Math.min(r.maxZ, b + I)
    ), dt(e, t.bounds, t.objectRadius), new F(
      H,
      l,
      b
    );
  }
  const T = ht(t, D, M), C = o ? -d.visibleHalfZ - w - T.row * T.spacing : d.visibleHalfZ + w + T.row * T.spacing, E = Math.max(0, r.maxZ - r.minZ), k = Math.min(3.1, E * 0.46), A = Math.max(1e-4, r.maxZ - r.minZ), Z = te(
    (e.z - r.minZ) / A,
    0,
    1
  );
  if (o) {
    const $ = Math.min(r.maxZ, C + k);
    e.z = $ + (r.maxZ - $) * Z;
  } else {
    const $ = Math.max(r.minZ, C - k);
    e.z = r.minZ + ($ - r.minZ) * Z;
  }
  const a = T.tangent, p = Math.abs(e.z - C);
  return e.x = te(
    e.x,
    Math.max(r.minX, a - p),
    Math.min(r.maxX, a + p)
  ), dt(e, t.bounds, t.objectRadius), new F(
    a,
    l,
    C
  );
}, vn = (t, e, i, n) => {
  const s = xe(e, i);
  return n === "left" ? t.x >= s.minX : n === "right" ? t.x <= s.maxX : n === "north" ? t.z >= s.minZ : t.z <= s.maxZ;
};
class Hi {
  constructor() {
    L(this, "mode", "kinematic");
    L(this, "context");
    L(this, "options");
    L(this, "engine");
    L(this, "scene");
    L(this, "environment");
    L(this, "polyhedra");
    L(this, "coinFactory");
    L(this, "activeNodes", []);
    L(this, "timelineTemporaryNodes", []);
    L(this, "initialized", !1);
  }
  async init(e) {
    var s, o;
    if (this.initialized)
      return;
    this.context = e, this.options = e.options;
    const i = Math.max(1, e.canvas.clientWidth || ((s = e.canvas.parentElement) == null ? void 0 : s.clientWidth) || 300), n = Math.max(1, e.canvas.clientHeight || ((o = e.canvas.parentElement) == null ? void 0 : o.clientHeight) || 150);
    e.canvas.width = i, e.canvas.height = n, this.environment = await at.create(e.canvas, e.options), this.engine = this.environment.engine, this.scene = this.environment.scene, this.polyhedra = new Di(this.scene), this.coinFactory = new Ei(this.scene), this.scene.render(), this.initialized = !0;
  }
  async display(e, i) {
    if (this.assertReady(), this.clear(), i.aborted)
      throw new W();
    const n = /* @__PURE__ */ new Map();
    for (const m of new Set(e.dice.map((u) => u.theme))) {
      const u = await this.context.loadTheme(m);
      n.set(m, u), e.dice.some((y) => y.theme === m && y.sides !== 2) && await this.ensurePolyhedralTheme(u), this.options.onThemeLoaded(u);
    }
    if (i.aborted)
      throw new W();
    const s = Fe(e.seed), o = this.context.canvas, c = nt(
      e.seed,
      Math.max(1, o.clientWidth || o.width || 300),
      Math.max(1, o.clientHeight || o.height || 150)
    ), l = St(
      e.seed,
      this.options.aggressiveThrowChance
    ), r = [], d = e.dice.reduce((m, u) => m + (u.sides === 100 ? 2 : 1), 0);
    let f = 0;
    for (const m of e.dice) {
      const u = n.get(m.theme);
      if (m.sides === 2) {
        r.push(this.createCoinEntry(u, m, f++, d, s, c, l));
        continue;
      }
      if (m.sides === 100) {
        const y = Math.floor((m.value - 1) / 10) * 10, x = m.value - y;
        r.push(await this.createDieEntry(u, m, 100, y, `${m.id}-tens`, f++, d, s, c, l)), r.push(await this.createDieEntry(u, m, 10, x, `${m.id}-ones`, f++, d, s, c, l));
        continue;
      }
      r.push(await this.createDieEntry(u, m, m.sides, m.value, m.id, f++, d, s, c, l));
    }
    await this.animate(r, i);
  }
  async displayTimeline(e, i) {
    var m, u, y, x, D, M, v;
    if (this.assertReady(), this.clear(), i.aborted)
      throw new W();
    const n = /* @__PURE__ */ new Map();
    for (const g of e.definitions.values()) {
      if (n.has(g.theme))
        continue;
      const w = await this.context.loadTheme(g.theme);
      n.set(g.theme, w), [...e.definitions.values()].some((T) => T.theme === g.theme && T.sides !== 2) && await this.ensurePolyhedralTheme(w), this.options.onThemeLoaded(w);
    }
    if (i.aborted)
      throw new W();
    const s = /* @__PURE__ */ new Map(), o = At(e), c = [], l = e.initialDice.reduce((g, w) => g + (w.sides === 100 ? 2 : 1), 0);
    let r = 0;
    for (const g of e.initialDice) {
      const w = g, T = await this.createTimelineEntries(
        w,
        n.get(w.theme),
        r,
        l,
        `${e.seed}:initial`
      );
      r += T.entries.length, s.set(g.id, T), c.push(...T.entries);
    }
    const d = {
      plan: e,
      configs: n,
      handles: s,
      progress: o,
      initialEntries: c,
      signal: i
    };
    let f = await this.displayInitialAndExplosionTimeline(d);
    for (; f < e.phases.length; f++) {
      const g = e.phases[f], w = () => {
        Me(this.options.onTimelineProgress, o.completePhase(f));
      };
      if (await this.waitForTimeline(this.options.timeline.phaseGapMs + g.delayMs, i), ((m = g.actions[0]) == null ? void 0 : m.kind) === "explode") {
        await this.displayExplosionPhase(d, f);
        continue;
      }
      if (((u = g.actions[0]) == null ? void 0 : u.kind) === "reroll") {
        const E = [];
        for (const k of g.actions) {
          if (k.kind !== "reroll")
            continue;
          const A = s.get(k.dieId);
          A && (await this.updateTimelineTargets(A, k.to), E.push(...A.entries));
        }
        E.length && await this.animateTimelineReroll(E, g.effect, g.durationMs, i), w();
        continue;
      }
      if (((y = g.actions[0]) == null ? void 0 : y.kind) === "selection") {
        const E = [];
        for (const k of g.actions) {
          if (k.kind !== "selection")
            continue;
          const A = (x = s.get(k.dieId)) == null ? void 0 : x.entries;
          A && E.push(...A);
        }
        E.length && await this.fadeTimelineEntries(E, 0.42, g.durationMs, i), w();
        continue;
      }
      if (((D = g.actions[0]) == null ? void 0 : D.kind) === "transform") {
        const E = [], k = [];
        for (const A of g.actions) {
          if (A.kind !== "transform")
            continue;
          const Z = (M = s.get(A.dieId)) == null ? void 0 : M.entries;
          if (!Z)
            continue;
          E.push(...Z);
          const a = xi(A, this.options.timeline), p = a ? this.createTimelineBadge(Z[0], a, g.effect) : void 0;
          p && k.push(p);
        }
        try {
          E.length && await this.pulseTimelineEntries(E, g.effect, g.durationMs, 1, i);
        } finally {
          for (const A of k)
            this.disposeTimelineTemporaryNode(A);
        }
        w();
        continue;
      }
      const T = [];
      let C = 1;
      for (const E of g.actions) {
        const k = (v = s.get(E.dieId)) == null ? void 0 : v.entries;
        k && (T.push(...k), E.kind === "classify" && (C = Math.max(C, E.pulses)));
      }
      T.length && await this.pulseTimelineEntries(T, g.effect, g.durationMs, C, i), w();
    }
    Me(this.options.onTimelineProgress, o.complete());
  }
  async displayInitialAndExplosionTimeline(e) {
    var n, s;
    await this.animate(e.initialEntries, e.signal), Me(this.options.onTimelineProgress, e.progress.initial());
    let i = 0;
    for (; ((s = (n = e.plan.phases[i]) == null ? void 0 : n.actions[0]) == null ? void 0 : s.kind) === "explode"; ) {
      const o = e.plan.phases[i];
      await this.waitForTimeline(
        this.options.timeline.phaseGapMs + o.delayMs,
        e.signal
      ), await this.displayExplosionPhase(e, i), i++;
    }
    return i;
  }
  async displayExplosionPhase(e, i) {
    const { configs: n, handles: s, plan: o, progress: c, signal: l } = e, r = o.phases[i], d = /* @__PURE__ */ new Map();
    for (const w of r.actions) {
      if (w.kind !== "explode")
        continue;
      const T = s.get(w.parentDieId);
      T && d.set(w.parentDieId, T);
    }
    const f = [...d.values()].flatMap((w) => w.entries), m = /* @__PURE__ */ new Map();
    for (const w of d.values()) {
      const T = w.die.sides === 2 ? Ht(w.theme.coin, w.die.themeColor) : w.die.themeColor;
      for (const C of w.entries)
        m.set(C, T);
    }
    const u = Math.min(220, r.durationMs * 0.25);
    f.length && u > 0 && await this.pulseTimelineEntries(
      f,
      r.effect,
      u,
      1,
      l,
      (w) => m.get(w)
    );
    const y = [], x = r.actions.filter((w) => w.kind === "explode").length, D = x > 1 ? Math.min(120, Math.max(0, r.durationMs - u) * 0.6 / (x - 1)) : 0, M = r.actions.reduce((w, T) => {
      var C;
      return T.kind !== "explode" ? w : w + (((C = o.definitions.get(T.dieId)) == null ? void 0 : C.sides) === 100 ? 2 : 1);
    }, 0);
    let v = 0, g = 0;
    for (const w of r.actions) {
      if (w.kind !== "explode")
        continue;
      const T = o.definitions.get(w.dieId), C = {
        ...T,
        value: w.value,
        discarded: w.discarded
      }, E = await this.createTimelineEntries(
        C,
        n.get(T.theme),
        v,
        M,
        `${o.seed}:${r.id}:${w.dieId}`
      );
      for (const A of E.entries)
        A.launchDelayMs = Math.max(
          A.launchDelayMs,
          g * D
        );
      g++, v += E.entries.length;
      const k = s.get(w.parentDieId);
      if (this.options.timeline.effects.explode.origin === "source" && (k != null && k.entries[0])) {
        const A = Fe(`${o.seed}:${r.id}:${w.dieId}:source`);
        for (let Z = 0; Z < E.entries.length; Z++) {
          const a = E.entries[Z], p = k.entries[Z % k.entries.length];
          a.start.set(
            p.node.position.x + A.range(-1, 1) * this.options.timeline.effects.explode.spread,
            p.node.position.y + p.supportHeight + a.supportHeight + this.options.timeline.effects.explode.burstHeight,
            p.node.position.z + A.range(-1, 1) * this.options.timeline.effects.explode.spread
          ), a.node.position.copyFrom(a.start);
          const $ = a.end.subtract(a.start).normalize();
          a.launchVelocity.copyFrom($.scale(Math.max(2.4, this.options.throwForce * 0.55))), a.launchVelocity.y = Math.max(2.8, this.options.timeline.effects.explode.burstHeight * 2);
        }
      }
      s.set(w.dieId, E), y.push(...E.entries);
    }
    y.length && await this.animateAdditional(y, l, Math.max(0, r.durationMs - u)), Me(this.options.onTimelineProgress, c.completePhase(i));
  }
  async createTimelineEntries(e, i, n, s, o) {
    const c = Fe(o), l = this.context.canvas, r = nt(
      o,
      Math.max(1, l.clientWidth || l.width || 300),
      Math.max(1, l.clientHeight || l.height || 150)
    ), d = St(o, this.options.aggressiveThrowChance), f = [];
    if (e.sides === 2)
      f.push(this.createCoinEntry(i, e, n, s, c, r, d));
    else if (e.sides === 100) {
      const m = Math.floor((e.value - 1) / 10) * 10, u = e.value - m;
      f.push(await this.createDieEntry(i, e, 100, m, `${e.id}-tens`, n, s, c, r, d)), f.push(await this.createDieEntry(i, e, 10, u, `${e.id}-ones`, n + 1, s, c, r, d));
    } else
      f.push(await this.createDieEntry(i, e, e.sides, e.value, e.id, n, s, c, r, d));
    return { die: e, theme: i, entries: f };
  }
  async updateTimelineTargets(e, i) {
    if (e.die.sides === 2) {
      e.entries[0].target = Lt(i);
      return;
    }
    const n = e.die.sides === 100 ? [Math.floor((i - 1) / 10) * 10, i - Math.floor((i - 1) / 10) * 10] : [i];
    for (let s = 0; s < e.entries.length; s++) {
      const o = e.die.sides === 100 ? s === 0 ? 100 : 10 : e.die.sides, c = await this.polyhedra.getOrientation(e.theme, o, n[s]);
      e.entries[s].target = c.targetQuaternion;
    }
  }
  animateAdditional(e, i, n) {
    var s;
    if (n <= 0) {
      if (i.aborted)
        return Promise.reject(new W());
      for (const o of e)
        o.node.setEnabled(!0), o.node.position.copyFrom(o.end), o.node.rotationQuaternion = o.target.clone();
      return (s = this.scene) == null || s.render(), Promise.resolve();
    }
    return this.animate(e, i, n, 1);
  }
  animateTimelineReroll(e, i, n, s) {
    const o = i === "unique" ? this.options.timeline.effects.unique : this.options.timeline.effects.reroll, c = e.map((r) => ({
      position: r.node.position.clone(),
      rotation: (r.node.rotationQuaternion ?? V.Identity()).clone(),
      edge: this.createTimelineEdgePoint(r, i)
    })), l = Math.max(1, n);
    return this.runTimelineAnimation(l, s, (r) => {
      const d = Ce(r);
      for (let f = 0; f < e.length; f++) {
        const m = e[f], u = c[f];
        if (o.style === "edge")
          if (r < 0.25)
            F.LerpToRef(u.position, u.edge, Ce(r / 0.25), m.node.position);
          else {
            const M = (r - 0.25) / 0.75;
            F.LerpToRef(u.edge, u.position, Ce(M), m.node.position), m.node.position.y += Math.sin(M * Math.PI) * o.hopHeight;
          }
        else {
          const M = o.style === "spin" ? 0.35 : 1;
          m.node.position.copyFrom(u.position), m.node.position.y += Math.sin(r * Math.PI) * o.hopHeight * M;
        }
        const x = V.RotationAxis(F.Up(), Math.PI * 2 * o.intensity * r).multiply(m.target), D = r < 0.82 ? x : V.Slerp(x, m.target, (r - 0.82) / 0.18);
        m.node.rotationQuaternion = V.Slerp(u.rotation, D, d);
      }
    });
  }
  createTimelineEdgePoint(e, i) {
    const n = this.context.canvas, s = Math.max(1, n.clientWidth || n.width || 300), o = Math.max(1, n.clientHeight || n.height || 150), c = Xe({
      width: s,
      height: o,
      cameraHeight: ve,
      cameraFov: Re,
      planeY: e.node.position.y,
      minimumRadius: e.horizontalRadius
    }), l = nt(`${e.node.name}:${i}:reentry`), r = e.horizontalRadius * 1.4, d = e.node.position.clone();
    return l === "left" ? d.x = -c.visibleHalfX - r : l === "right" ? d.x = c.visibleHalfX + r : l === "north" ? d.z = -c.visibleHalfZ - r : d.z = c.visibleHalfZ + r, d.y += Math.max(0.4, e.supportHeight), d;
  }
  createTimelineBadge(e, i, n) {
    const s = ti(`timeline-badge-${Date.now()}`, { width: 2.2, height: 0.8 }, this.scene);
    s.billboardMode = je.BILLBOARDMODE_ALL, s.position.copyFrom(e.node.position), s.position.y += e.supportHeight + 1.1, s.isPickable = !1;
    const o = new Pt(`${s.name}-texture`, { width: 512, height: 192 }, this.scene, !1);
    o.hasAlpha = !0;
    const c = o.getContext();
    c.clearRect(0, 0, 512, 192), c.fillStyle = "rgba(15, 23, 42, 0.88)", c.beginPath(), c.roundRect(12, 12, 488, 168, 36), c.fill(), c.strokeStyle = this.options.timeline.effects[n].color, c.lineWidth = 8, c.stroke(), c.fillStyle = "#ffffff", c.font = "bold 96px sans-serif", c.textAlign = "center", c.textBaseline = "middle", c.fillText(i, 256, 100), o.update(!1);
    const l = new De(`${s.name}-material`, this.scene);
    return l.diffuseTexture = o, l.emissiveTexture = o, l.opacityTexture = o, l.disableLighting = !0, l.backFaceCulling = !1, l.diffuseTexture.wrapU = be.CLAMP_ADDRESSMODE, l.diffuseTexture.wrapV = be.CLAMP_ADDRESSMODE, s.material = l, this.timelineTemporaryNodes.push(s), s;
  }
  disposeTimelineTemporaryNode(e) {
    var n;
    const i = this.timelineTemporaryNodes.indexOf(e);
    i >= 0 && this.timelineTemporaryNodes.splice(i, 1), (n = e.material) == null || n.dispose(!0, !0), e.dispose(!1, !1);
  }
  fadeTimelineEntries(e, i, n, s) {
    const o = e.flatMap((l) => this.getTimelineMeshes(l)), c = o.map((l) => l.visibility);
    return this.runTimelineAnimation(Math.max(1, n), s, (l) => {
      for (let r = 0; r < o.length; r++)
        o[r].visibility = c[r] + (i - c[r]) * l;
    });
  }
  async pulseTimelineEntries(e, i, n, s, o, c) {
    if (n <= 0)
      return;
    const l = this.options.timeline.effects[i], { HighlightLayer: r } = await import("./timelineHighlightRuntime-80d343e1.js"), d = new r(`timeline-${i}-${Date.now()}`, this.scene, { blurTextureSizeRatio: 0.25 });
    for (const f of e)
      for (const m of this.getTimelineMeshes(f)) {
        if (!(m instanceof je))
          continue;
        let u;
        try {
          u = R.FromHexString((c == null ? void 0 : c(f)) || l.color);
        } catch {
          try {
            u = R.FromHexString(l.color);
          } catch {
            u = R.White();
          }
        }
        d.addMesh(m, u);
      }
    return this.runTimelineAnimation(Math.max(1, n), o, (f) => {
      d.blurHorizontalSize = 0.5 + Math.sin(f * Math.PI * Math.max(1, s)) ** 2 * 2.5 * l.intensity, d.blurVerticalSize = d.blurHorizontalSize;
    }).finally(() => d.dispose());
  }
  getTimelineMeshes(e) {
    const i = e.node.getChildMeshes(!1);
    return e.node instanceof je ? [e.node, ...i.filter((n) => n !== e.node)] : i;
  }
  waitForTimeline(e, i) {
    return e <= 0 ? i.aborted ? Promise.reject(new W()) : Promise.resolve() : this.runTimelineAnimation(e, i, () => {
    });
  }
  runTimelineAnimation(e, i, n) {
    const s = this.engine, o = this.scene, c = performance.now();
    return new Promise((l, r) => {
      let d = !1;
      const f = (y) => {
        d || (d = !0, s.stopRenderLoop(u), i.removeEventListener("abort", m), y ? r(y) : l());
      }, m = () => f(new W()), u = () => {
        if (i.aborted)
          return m();
        const y = it((performance.now() - c) / Math.max(1, e));
        n(y), o.render(), y >= 1 && f();
      };
      i.addEventListener("abort", m, { once: !0 }), s.runRenderLoop(u);
    });
  }
  async ensurePolyhedralTheme(e) {
    await this.polyhedra.load(e);
  }
  createCoinEntry(e, i, n, s, o, c, l) {
    var d;
    const r = this.coinFactory.create(e, i, this.options.scale);
    this.activeNodes.push(r.root);
    for (const f of r.meshes)
      (d = this.environment) == null || d.addShadowCaster(f);
    return this.createTrajectory(
      r.root,
      r.targetQuaternion,
      n,
      s,
      o,
      c,
      l,
      !0,
      2,
      r.supportHeight,
      r.horizontalRadius
    );
  }
  async createDieEntry(e, i, n, s, o, c, l, r, d, f) {
    var u;
    const m = await this.polyhedra.create(
      e,
      i,
      n,
      s,
      o,
      this.options.scale,
      this.options.colliderScale
    );
    return (u = this.environment) == null || u.addShadowCaster(m.mesh), this.activeNodes.push(m.mesh), this.createTrajectory(
      m.mesh,
      m.targetQuaternion,
      c,
      l,
      r,
      d,
      f,
      !1,
      n,
      m.supportHeight,
      m.horizontalRadius,
      m.physicsCollider
    );
  }
  createTrajectory(e, i, n, s, o, c, l, r, d, f, m, u) {
    const y = this.context.canvas, x = Math.max(1, y.clientWidth || y.width || 300), D = Math.max(1, y.clientHeight || y.height || 150), M = Xe({
      width: x,
      height: D,
      cameraHeight: ve,
      cameraFov: Re,
      wallPadding: this.options.wallPadding,
      minimumRadius: m
    }), v = {
      index: n,
      count: s,
      scale: this.options.scale,
      startingHeight: this.options.startingHeight,
      coin: r,
      objectRadius: m,
      bounds: M,
      launchEdge: c,
      spawnSpacing: this.options.spawnSpacing,
      spawnHeightStep: this.options.spawnHeightStep,
      spawnOverscan: this.options.spawnOverscan
    }, g = Fi(v, o);
    g.y = f;
    const w = Ri(v, g), T = V.RotationAxis(F.Up(), o.range(-Math.PI, Math.PI)).multiply(i).normalize(), C = (Y, b) => o.range(Y, b) * Math.PI * (o.next() < 0.5 ? -1 : 1), E = C(r ? 8 : 3, r ? 14 : 7), k = C(2, 7), A = C(2, 7), Z = ki(
      w,
      g,
      o,
      this.options.throwForce,
      l
    ), a = xe(M, m), p = xe(Xe({
      width: x,
      height: D,
      cameraHeight: ve,
      cameraFov: Re,
      planeY: w.y,
      minimumRadius: m
    }), m), $ = c === "left" || c === "right" ? {
      minimum: Math.max(a.minZ, p.minZ),
      maximum: Math.min(a.maxZ, p.maxZ)
    } : {
      minimum: Math.max(a.minX, p.minX),
      maximum: Math.min(a.maxX, p.maxX)
    };
    $.minimum > $.maximum && ($.minimum = 0, $.maximum = 0);
    const H = ht(v, $.minimum, $.maximum), ie = H.spacing / ji * 1e3 * 1.12, B = Math.max(0, this.options.delay), G = Math.max(
      0,
      ie - H.waveCapacity * B
    );
    return e.position.copyFrom(w), e.rotationQuaternion = V.Identity(), {
      node: e,
      ...u ? { physicsCollider: u } : {},
      sides: d,
      start: w,
      end: g,
      launchVelocity: Z,
      supportHeight: f,
      horizontalRadius: m,
      launchEdge: c,
      launchDelayMs: n * B + H.wave * G,
      target: T,
      spinX: E,
      spinY: k,
      spinZ: A
    };
  }
  animate(e, i, n = this.options.duration, s = 250) {
    const o = this.engine, c = this.scene, l = Math.max(s, n), r = l + e.reduce(
      (f, m) => Math.max(f, m.launchDelayMs),
      0
    ), d = performance.now();
    for (const f of e)
      f.node.setEnabled(f.launchDelayMs <= 0);
    return new Promise((f, m) => {
      let u = !1;
      const y = (M) => {
        u || (u = !0, o.stopRenderLoop(D), i.removeEventListener("abort", x), M ? m(M) : f());
      }, x = () => y(new W()), D = () => {
        if (i.aborted)
          return x();
        const M = performance.now() - d;
        for (const v of e) {
          const g = it((M - v.launchDelayMs) / l);
          if (M < v.launchDelayMs)
            continue;
          v.node.setEnabled(!0);
          const w = Ce(g);
          v.node.position.set(
            v.start.x + (v.end.x - v.start.x) * w,
            v.start.y + (v.end.y - v.start.y) * w + Math.sin(g * Math.PI) * 2.4,
            v.start.z + (v.end.z - v.start.z) * w
          );
          const T = V.RotationYawPitchRoll(
            v.spinY * g,
            v.spinX * g,
            v.spinZ * g
          ), C = Ce(it((g - 0.84) / 0.16));
          v.node.rotationQuaternion = V.Slerp(T, v.target, C);
        }
        c.render(), M >= r && y();
      };
      i.addEventListener("abort", x, { once: !0 }), o.runRenderLoop(D);
    });
  }
  async updateOptions(e) {
    var i;
    this.options = e, await ((i = this.environment) == null ? void 0 : i.update(e));
  }
  resize(e, i) {
    var n;
    !this.context || !this.engine || (this.context.canvas.width = Math.max(1, e), this.context.canvas.height = Math.max(1, i), (n = this.environment) == null || n.resize());
  }
  clear() {
    var e, i, n, s, o, c, l;
    (e = this.engine) == null || e.stopRenderLoop();
    for (const r of this.timelineTemporaryNodes.splice(0))
      (i = r.material) == null || i.dispose(!0, !0), r.dispose(!1, !1);
    for (const r of this.activeNodes.splice(0))
      ((n = r.metadata) == null ? void 0 : n.displayFactory) === "coin" ? (s = this.coinFactory) == null || s.release(r) : r instanceof je && ((o = r.metadata) == null ? void 0 : o.displayFactory) === "polyhedron" ? (c = this.polyhedra) == null || c.release(r) : r.dispose(!1, !1);
    (l = this.scene) == null || l.render();
  }
  dispose() {
    var e, i, n;
    this.clear(), (e = this.coinFactory) == null || e.dispose(), (i = this.polyhedra) == null || i.dispose(), (n = this.environment) == null || n.dispose(), this.initialized = !1;
  }
  assertReady() {
    if (!this.initialized || !this.scene || !this.engine || !this.options || !this.context)
      throw new Error("Renderer must be initialized before display().");
  }
}
const Ni = Hi, Pe = Object.freeze({
  front: Object.freeze({ value: 1, texture: "coin-1.svg" }),
  back: Object.freeze({ value: 2, texture: "coin-2.svg" }),
  colorize: !0,
  edgeColor: "#c89b3c",
  diameter: 1,
  thickness: 0.12
}), Ue = (t) => t !== null && typeof t == "object" && !Array.isArray(t), Li = (t, e) => {
  if (t !== void 0 && (typeof t != "number" || !Number.isFinite(t) || t < 0))
    throw new Error(`${e} must be a finite non-negative number.`);
}, zt = (t, e, i) => {
  if (!Ue(t) || t.value !== e || typeof t.texture != "string")
    throw new Error(`${i} must define value ${e} and a texture string.`);
  return t;
}, qi = (t, e) => {
  if (!Ue(t) || t.type !== "color" && t.type !== "standard")
    throw new Error(`Theme '${e}' material.type must be 'color' or 'standard'.`);
  const i = t.diffuseTexture;
  if (i !== void 0 && typeof i != "string" && (!Ue(i) || typeof i.light != "string" || typeof i.dark != "string"))
    throw new Error(`Theme '${e}' material.diffuseTexture must be a string or light/dark map.`);
  for (const n of ["bumpTexture", "specularTexture"])
    if (t[n] !== void 0 && typeof t[n] != "string")
      throw new Error(`Theme '${e}' material.${n} must be a string.`);
  for (const n of ["diffuseLevel", "bumpLevel", "specularPower"])
    Li(t[n], `Theme '${e}' material.${n}`);
  return t;
}, Vi = (t, e) => {
  if (!t || typeof t != "object")
    throw new Error(`Theme '${e}' returned an invalid configuration.`);
  const i = t;
  if (qi(i.material, e), !Array.isArray(i.diceAvailable) || i.diceAvailable.some((n) => typeof n != "string" || n.trim().length === 0))
    throw new Error(`Theme '${e}' must define material and diceAvailable.`);
  if (i.meshFile !== void 0 && (typeof i.meshFile != "string" || i.meshFile.trim().length === 0))
    throw new Error(`Theme '${e}' meshFile must be a non-empty string.`);
  if (i.coin !== void 0) {
    if (!Ue(i.coin))
      throw new Error(`Theme '${e}' coin must be an object.`);
    if (zt(i.coin.front, 1, `Theme '${e}' coin.front`), zt(i.coin.back, 2, `Theme '${e}' coin.back`), i.coin.colorize !== void 0 && typeof i.coin.colorize != "boolean")
      throw new Error(`Theme '${e}' coin.colorize must be a boolean.`);
    if (i.coin.edgeColor !== void 0 && typeof i.coin.edgeColor != "string")
      throw new Error(`Theme '${e}' coin.edgeColor must be a string.`);
    for (const n of ["diameter", "thickness"]) {
      const s = i.coin[n];
      if (s !== void 0 && (typeof s != "number" || !Number.isFinite(s) || s <= 0))
        throw new Error(`Theme '${e}' coin.${n} must be a positive finite number.`);
    }
  }
  return i;
};
var ue, q, Ke, Xt;
class Zi {
  constructor(e) {
    S(this, Ke);
    S(this, ue, /* @__PURE__ */ new Map());
    S(this, q, void 0);
    z(this, q, e);
  }
  updateOptions(e) {
    const i = e.assetPath !== h(this, q).assetPath || e.origin !== h(this, q).origin || e.externalThemes !== h(this, q).externalThemes;
    z(this, q, e), i && h(this, ue).clear();
  }
  load(e) {
    const i = h(this, ue).get(e);
    if (i)
      return i;
    const n = _(this, Ke, Xt).call(this, e);
    return h(this, ue).set(e, n), n.catch(() => h(this, ue).delete(e)), n;
  }
}
ue = new WeakMap(), q = new WeakMap(), Ke = new WeakSet(), Xt = async function(e) {
  const i = h(this, q).externalThemes[e], n = i ? i.replace(/\/$/, "") : `${h(this, q).origin}${h(this, q).assetPath}themes/${e}`.replace(/\/$/, ""), s = await fetch(`${n}/theme.config.json`);
  if (!s.ok)
    throw new Error(`Unable to fetch config for theme '${e}' (${s.status} ${s.statusText}).`);
  const o = Vi(await s.json(), e), c = typeof o.meshFile == "string" ? o.meshFile : "default.json", l = c.replace(/\.[^.]+$/, ""), r = `${h(this, q).origin}${h(this, q).assetPath}themes/default`.replace(/\/$/, ""), d = o.coin ?? {
    ...Pe,
    front: { ...Pe.front, texture: `${r}/${Pe.front.texture}` },
    back: { ...Pe.back, texture: `${r}/${Pe.back.texture}` }
  }, f = Object.freeze({
    ...o,
    theme: e,
    basePath: n,
    meshName: l,
    meshFilePath: typeof o.meshFile == "string" ? `${n}/${c}` : `${h(this, q).origin}${h(this, q).assetPath}themes/default/default.json`,
    coin: Object.freeze({
      ...d,
      front: Object.freeze({ ...d.front }),
      back: Object.freeze({ ...d.back })
    })
  });
  return h(this, q).onThemeConfigLoaded(f), f;
};
const Ze = () => {
}, Q = (t, e, i = 1) => ({
  enabled: !0,
  delayMs: 0,
  durationMs: t,
  intensity: i,
  color: e
}), Bt = Object.freeze({
  enabled: !0,
  maxEvents: 500,
  maxDurationMs: 12e3,
  phaseGapMs: 180,
  effects: Object.freeze({
    explode: Object.freeze({ ...Q(900, "#ffb020"), origin: "source", burstHeight: 1.6, spread: 0.8 }),
    compound: Object.freeze({ ...Q(320, "#d8b4fe"), showBadge: !0 }),
    penetrate: Object.freeze({ ...Q(300, "#fbbf24"), showBadge: !0 }),
    reroll: Object.freeze({ ...Q(750, "#60a5fa"), style: "hop", hopHeight: 2.2 }),
    unique: Object.freeze({ ...Q(750, "#a78bfa"), style: "hop", hopHeight: 2.2 }),
    keep: Object.freeze(Q(200, "#86efac")),
    drop: Object.freeze(Q(200, "#94a3b8")),
    success: Object.freeze(Q(250, "#22c55e")),
    failure: Object.freeze(Q(250, "#ef4444")),
    neutral: Object.freeze(Q(250, "#94a3b8", 0.35)),
    criticalSuccess: Object.freeze({ ...Q(250, "#facc15"), pulses: 2 }),
    criticalFailure: Object.freeze({ ...Q(250, "#dc2626"), pulses: 2 })
  })
}), _t = (t = Bt, e = {}) => {
  const i = e.effects ?? {}, n = (s, o) => ({ ...s, ...o ?? {} });
  return {
    enabled: e.enabled ?? t.enabled,
    maxEvents: e.maxEvents ?? t.maxEvents,
    maxDurationMs: e.maxDurationMs ?? t.maxDurationMs,
    phaseGapMs: e.phaseGapMs ?? t.phaseGapMs,
    effects: {
      explode: n(t.effects.explode, i.explode),
      compound: n(t.effects.compound, i.compound),
      penetrate: n(t.effects.penetrate, i.penetrate),
      reroll: n(t.effects.reroll, i.reroll),
      unique: n(t.effects.unique, i.unique),
      keep: n(t.effects.keep, i.keep),
      drop: n(t.effects.drop, i.drop),
      success: n(t.effects.success, i.success),
      failure: n(t.effects.failure, i.failure),
      neutral: n(t.effects.neutral, i.neutral),
      criticalSuccess: n(t.effects.criticalSuccess, i.criticalSuccess),
      criticalFailure: n(t.effects.criticalFailure, i.criticalFailure)
    }
  };
}, N = (t, e) => {
  if (!Number.isFinite(t) || t < 0)
    throw new Error(`Viewer option ${e} must be a finite non-negative number.`);
}, Oe = (t, e) => {
  if (!Number.isFinite(t) || t <= 0)
    throw new Error(`Viewer option ${e} must be a positive finite number.`);
}, Ct = (t, e) => {
  if (typeof t != "boolean")
    throw new Error(`Viewer option ${e} must be a boolean.`);
}, oe = (t, e, i = !1) => {
  if (typeof t != "string" || !i && t.trim().length === 0)
    throw new Error(`Viewer option ${e} must be ${i ? "a string" : "a non-empty string"}.`);
}, Xi = (t) => {
  if (typeof t.enabled != "boolean")
    throw new Error("Viewer option timeline.enabled must be a boolean.");
  if (!Number.isInteger(t.maxEvents) || t.maxEvents < 1)
    throw new Error("Viewer option timeline.maxEvents must be a positive integer.");
  if (!Number.isFinite(t.maxDurationMs) || t.maxDurationMs <= 0)
    throw new Error("Viewer option timeline.maxDurationMs must be a positive finite number.");
  N(t.phaseGapMs, "timeline.phaseGapMs");
  for (const [e, i] of Object.entries(t.effects)) {
    if (typeof i.enabled != "boolean")
      throw new Error(`Viewer option timeline.effects.${e}.enabled must be a boolean.`);
    if (N(i.delayMs, `timeline.effects.${e}.delayMs`), N(i.durationMs, `timeline.effects.${e}.durationMs`), !Number.isFinite(i.intensity) || i.intensity < 0 || i.intensity > 1)
      throw new Error(`Viewer option timeline.effects.${e}.intensity must be between 0 and 1.`);
    if (typeof i.color != "string" || i.color.trim().length === 0)
      throw new Error(`Viewer option timeline.effects.${e}.color must be a non-empty string.`);
  }
  if (!["source", "edge"].includes(t.effects.explode.origin))
    throw new Error("Viewer option timeline.effects.explode.origin must be source or edge.");
  N(t.effects.explode.burstHeight, "timeline.effects.explode.burstHeight"), N(t.effects.explode.spread, "timeline.effects.explode.spread");
  for (const e of ["reroll", "unique"]) {
    const i = t.effects[e];
    if (!["hop", "edge", "spin"].includes(i.style))
      throw new Error(`Viewer option timeline.effects.${e}.style must be hop, edge, or spin.`);
    N(i.hopHeight, `timeline.effects.${e}.hopHeight`);
  }
  for (const e of ["criticalSuccess", "criticalFailure"]) {
    const i = t.effects[e].pulses;
    if (!Number.isInteger(i) || i < 1)
      throw new Error(`Viewer option timeline.effects.${e}.pulses must be a positive integer.`);
  }
  for (const e of ["compound", "penetrate"])
    if (typeof t.effects[e].showBadge != "boolean")
      throw new Error(`Viewer option timeline.effects.${e}.showBadge must be a boolean.`);
}, Ut = (t) => ({
  id: t.id ?? `dice-canvas-${Date.now()}`,
  container: t.container ?? null,
  assetPath: t.assetPath ?? "/assets/dice-box/",
  origin: t.origin ?? (typeof window > "u" ? "" : window.location.origin),
  mode: t.mode ?? "kinematic",
  theme: t.theme ?? "default",
  preloadThemes: [...t.preloadThemes ?? []],
  externalThemes: { ...t.externalThemes ?? {} },
  themeColor: t.themeColor ?? "#2e8555",
  maxDice: t.maxDice ?? 120,
  enableShadows: t.enableShadows ?? !0,
  shadowTransparency: t.shadowTransparency ?? 0.8,
  shadowResolution: t.shadowResolution ?? 1024,
  lightIntensity: t.lightIntensity ?? 1,
  antialias: t.antialias ?? !0,
  scale: t.scale ?? 5,
  duration: t.duration ?? 1100,
  delay: t.delay ?? 10,
  gravity: t.gravity ?? 1.3,
  mass: t.mass ?? 1.08,
  startingHeight: t.startingHeight ?? 7.6,
  spinForce: t.spinForce ?? 5.8,
  throwForce: t.throwForce ?? 6.4,
  aggressiveThrowChance: t.aggressiveThrowChance ?? t.wallBounceChance ?? 0.12,
  wallBounceChance: t.wallBounceChance ?? t.aggressiveThrowChance ?? 0.12,
  wallPadding: t.wallPadding ?? 0.25,
  colliderScale: t.colliderScale ?? 1.02,
  spawnSpacing: t.spawnSpacing ?? 1.72,
  spawnHeightStep: t.spawnHeightStep ?? 0,
  spawnOverscan: t.spawnOverscan ?? 0.15,
  friction: t.friction ?? 0.54,
  restitution: t.restitution ?? 0.29,
  linearDamping: t.linearDamping ?? 0.1,
  angularDamping: t.angularDamping ?? 0.08,
  settleTimeout: t.settleTimeout ?? 4200,
  physicsWasmUrl: t.physicsWasmUrl ?? "",
  onCollision: t.onCollision ?? Ze,
  onThemeConfigLoaded: t.onThemeConfigLoaded ?? Ze,
  onThemeLoaded: t.onThemeLoaded ?? Ze,
  onTimelineProgress: t.onTimelineProgress ?? Ze,
  timeline: _t(Bt, t.timeline)
}), Bi = (t, e) => {
  let i = {
    ...t,
    ...e,
    timeline: _t(t.timeline, e.timeline)
  };
  e.aggressiveThrowChance !== void 0 ? i = { ...i, wallBounceChance: e.aggressiveThrowChance } : e.wallBounceChance !== void 0 && (i = { ...i, aggressiveThrowChance: e.wallBounceChance });
  const n = Ut(i);
  return Wt(n), n;
}, Wt = (t) => {
  oe(t.id, "id"), oe(t.assetPath, "assetPath", !0), oe(t.origin, "origin", !0), oe(t.theme, "theme"), oe(t.themeColor, "themeColor"), oe(t.physicsWasmUrl, "physicsWasmUrl", !0);
  for (const [e, i] of t.preloadThemes.entries())
    oe(i, `preloadThemes[${e}]`);
  for (const [e, i] of Object.entries(t.externalThemes))
    oe(e, "externalThemes key"), oe(i, `externalThemes.${e}`);
  if (!Number.isInteger(t.maxDice) || t.maxDice < 1)
    throw new Error("Viewer option maxDice must be a positive integer.");
  if (t.mode !== "kinematic" && t.mode !== "physics")
    throw new Error(`Unsupported display mode '${String(t.mode)}'.`);
  if (!Number.isFinite(t.aggressiveThrowChance) || t.aggressiveThrowChance < 0 || t.aggressiveThrowChance > 1)
    throw new Error("Viewer option aggressiveThrowChance must be between 0 and 1.");
  if (Ct(t.enableShadows, "enableShadows"), Ct(t.antialias, "antialias"), !Number.isFinite(t.shadowTransparency) || t.shadowTransparency < 0 || t.shadowTransparency > 1)
    throw new Error("Viewer option shadowTransparency must be between 0 and 1.");
  if (!Number.isInteger(t.shadowResolution) || t.shadowResolution < 1)
    throw new Error("Viewer option shadowResolution must be a positive integer.");
  N(t.lightIntensity, "lightIntensity"), Oe(t.scale, "scale"), N(t.duration, "duration"), N(t.delay, "delay"), N(t.gravity, "gravity"), Oe(t.mass, "mass"), Oe(t.startingHeight, "startingHeight"), N(t.spinForce, "spinForce"), N(t.throwForce, "throwForce"), N(t.wallPadding, "wallPadding"), Oe(t.colliderScale, "colliderScale"), N(t.spawnSpacing, "spawnSpacing"), N(t.spawnHeightStep, "spawnHeightStep"), N(t.spawnOverscan, "spawnOverscan"), N(t.friction, "friction"), N(t.restitution, "restitution"), N(t.linearDamping, "linearDamping"), N(t.angularDamping, "angularDamping"), Oe(t.settleTimeout, "settleTimeout");
  for (const [e, i] of [
    ["onCollision", t.onCollision],
    ["onThemeConfigLoaded", t.onThemeConfigLoaded],
    ["onThemeLoaded", t.onThemeLoaded],
    ["onTimelineProgress", t.onTimelineProgress]
  ])
    if (typeof i != "function")
      throw new Error(`Viewer option ${e} must be a function.`);
  Xi(t.timeline);
};
var P, de, U, Ee, ee, pe, we, ge, $e, Ie, Be, ye, ke;
class _i {
  constructor(e = {}) {
    S(this, Ie);
    S(this, ye);
    L(this, "canvas");
    S(this, P, void 0);
    S(this, de, void 0);
    S(this, U, void 0);
    S(this, Ee, void 0);
    S(this, ee, void 0);
    S(this, pe, void 0);
    S(this, we, void 0);
    S(this, ge, !1);
    S(this, $e, !1);
    z(this, P, Ut(e)), Wt(h(this, P)), this.canvas = fi(h(this, P).container, h(this, P).id), z(this, de, new Zi(h(this, P)));
  }
  async init() {
    return _(this, ye, ke).call(this), h(this, ge) ? this : (await Promise.all([
      _(this, Ie, Be).call(this, h(this, P).mode),
      ...[h(this, P).theme, ...h(this, P).preloadThemes].map((e) => h(this, de).load(e))
    ]), z(this, pe, () => this.resize()), window.addEventListener("resize", h(this, pe), { passive: !0 }), typeof ResizeObserver < "u" && (z(this, we, new ResizeObserver(() => this.resize())), h(this, we).observe(this.canvas.parentElement ?? this.canvas)), this.resize(), z(this, ge, !0), this);
  }
  async display(e) {
    _(this, ye, ke).call(this);
    const i = wt(e, h(this, P)), n = gt(i.dice);
    if (n > h(this, P).maxDice)
      throw new Error(`Display exceeds maxDice (${h(this, P).maxDice}). Requested ${n} visual bodies.`);
    this.clear();
    const s = new AbortController();
    z(this, ee, s);
    const o = performance.now();
    try {
      h(this, ge) || await this.init();
      const c = await _(this, Ie, Be).call(this, i.mode);
      if (s.signal.aborted)
        throw new W();
      await c.display(i, s.signal);
    } catch (c) {
      if (ot(c) || s.signal.aborted)
        throw new W();
      console.error("[DiceResultViewer] Presentation failed:", c);
    } finally {
      h(this, ee) === s && z(this, ee, void 0);
    }
    return Object.freeze({
      id: i.id,
      dice: Object.freeze(i.dice.map((c) => Object.freeze({ ...c }))),
      durationMs: Math.max(0, performance.now() - o)
    });
  }
  async displayTimeline(e) {
    _(this, ye, ke).call(this);
    const i = gi(e, h(this, P)), n = gt(i.dice);
    if (n > h(this, P).maxDice)
      throw new Error(`Display exceeds maxDice (${h(this, P).maxDice}). Requested ${n} visual bodies.`);
    const s = bi(
      i,
      h(this, P).timeline,
      i.mode === "physics" ? h(this, P).settleTimeout : h(this, P).duration
    );
    this.clear();
    const o = new AbortController();
    z(this, ee, o);
    const c = performance.now();
    try {
      h(this, ge) || await this.init();
      const l = await _(this, Ie, Be).call(this, i.mode);
      if (o.signal.aborted)
        throw new W();
      if (s.degraded) {
        const r = wt({
          id: s.id,
          seed: `${s.seed}:flat`,
          mode: s.mode,
          dice: s.finalDice
        }, h(this, P));
        await l.display(r, o.signal);
        const d = At(s);
        Me(h(this, P).onTimelineProgress, d.initial()), Me(h(this, P).onTimelineProgress, d.complete());
      } else
        await l.displayTimeline(s, o.signal);
    } catch (l) {
      !ot(l) && !o.signal.aborted && console.error("[DiceResultViewer] Timeline presentation failed:", l), wi(l, o.signal.aborted);
    } finally {
      h(this, ee) === o && z(this, ee, void 0);
    }
    return Object.freeze({
      id: s.id,
      dice: Object.freeze(s.finalDice.map((l) => Object.freeze({ ...l }))),
      durationMs: Math.max(0, performance.now() - c),
      eventCount: s.eventCount,
      phaseCount: s.phases.length,
      degraded: s.degraded
    });
  }
  clear() {
    var e, i;
    (e = h(this, ee)) == null || e.abort(), z(this, ee, void 0), (i = h(this, U)) == null || i.clear();
  }
  async updateOptions(e) {
    var n;
    _(this, ye, ke).call(this);
    const i = Bi(h(this, P), e);
    z(this, P, i), h(this, de).updateOptions(h(this, P)), await ((n = h(this, U)) == null ? void 0 : n.updateOptions(h(this, P))), e.theme && await h(this, de).load(e.theme);
  }
  resize() {
    var n, s, o;
    const e = Math.max(1, this.canvas.clientWidth || ((n = this.canvas.parentElement) == null ? void 0 : n.clientWidth) || 300), i = Math.max(1, this.canvas.clientHeight || ((s = this.canvas.parentElement) == null ? void 0 : s.clientHeight) || 150);
    (o = h(this, U)) == null || o.resize(e, i);
  }
  dispose() {
    var e, i;
    h(this, $e) || (this.clear(), h(this, pe) && window.removeEventListener("resize", h(this, pe)), (e = h(this, we)) == null || e.disconnect(), z(this, we, void 0), (i = h(this, U)) == null || i.dispose(), this.canvas.remove(), z(this, $e, !0));
  }
}
P = new WeakMap(), de = new WeakMap(), U = new WeakMap(), Ee = new WeakMap(), ee = new WeakMap(), pe = new WeakMap(), we = new WeakMap(), ge = new WeakMap(), $e = new WeakMap(), Ie = new WeakSet(), Be = async function(e) {
  var n;
  if (h(this, U) && h(this, Ee) === e)
    return h(this, U);
  (n = h(this, U)) == null || n.dispose();
  const i = e === "physics" ? new (await import("./PhysicsRenderer-a30cb6f7.js")).PhysicsRenderer() : new Ni();
  z(this, U, i), z(this, Ee, e);
  try {
    return await i.init({
      canvas: this.canvas,
      options: h(this, P),
      loadTheme: (s) => h(this, de).load(s)
    }), i;
  } catch (s) {
    throw i.dispose(), h(this, U) === i && (z(this, U, void 0), z(this, Ee, void 0)), s;
  }
}, ye = new WeakSet(), ke = function() {
  if (h(this, $e))
    throw new Error("Cannot use a disposed DiceResultViewer.");
};
const Tn = _i, Gt = Object.freeze({
  "vampire-v5-normal-d10": Object.freeze({
    theme: "vampire-v5-normal",
    themeColor: "#20242e",
    sides: 10
  }),
  "vampire-v5-hunger-d10": Object.freeze({
    theme: "vampire-v5-hunger",
    themeColor: "#761827",
    sides: 10
  }),
  "assimilation-d6": Object.freeze({
    theme: "assimilation",
    themeColor: "#123b4a",
    sides: 6
  }),
  "assimilation-d10": Object.freeze({
    theme: "assimilation",
    themeColor: "#123b4a",
    sides: 10
  }),
  "assimilation-d12": Object.freeze({
    theme: "assimilation",
    themeColor: "#123b4a",
    sides: 12
  }),
  "fate-df": Object.freeze({
    theme: "fate",
    themeColor: "#315d9b",
    sides: 6
  }),
  "daggerheart-hope-d12": Object.freeze({
    theme: "default-v2",
    themeColor: "#ff0a7a",
    sides: 12
  }),
  "daggerheart-fear-d12": Object.freeze({
    theme: "default-v2",
    themeColor: "#00f585",
    sides: 12
  })
}), Ui = new Set(Object.keys(Gt)), Wi = (t) => typeof t == "string" && Ui.has(t), Gi = (t) => {
  if (!Wi(t))
    throw new Error(`Unsupported system dice profile '${t}'.`);
  return Gt[t];
}, Se = (t, e) => {
  if (typeof t != "string" || t.trim().length === 0)
    throw new Error(`${e} must be a non-empty string.`);
  return t;
}, Qi = (t) => {
  if (!t || typeof t != "object")
    throw new Error("System die must be an object.");
  const e = Se(t.id, "System die id"), i = Gi(t.profileId);
  if (t.sides !== i.sides)
    throw new Error(
      `System dice profile '${t.profileId}' expects d${i.sides}, received d${String(t.sides)}.`
    );
  if (!Number.isInteger(t.value) || t.value < 1 || t.value > i.sides)
    throw new Error(
      `System die '${e}' value ${String(t.value)} is outside 1-${i.sides}.`
    );
  return t.sourceDieId !== void 0 && Se(t.sourceDieId, "System sourceDieId"), { id: e, profile: i, profileId: t.profileId };
}, ft = (t) => t === void 0 ? void 0 : new Set(t.map((e) => Se(e, "keptIds entry"))), mt = (t, e, i) => {
  var l;
  const { id: n, profile: s, profileId: o } = Qi(t), c = i === void 0 ? !!t.discarded : !i.has(n) && (t.sourceDieId === void 0 || !i.has(t.sourceDieId));
  return Object.freeze({
    id: n,
    sides: s.sides,
    value: t.value,
    discarded: c,
    theme: s.theme,
    themeColor: ((l = e.themeColors) == null ? void 0 : l[o]) ?? s.themeColor
  });
}, En = (t, e = {}) => mt(t, e, ft(e.keptIds)), Ki = (t, e = {}) => {
  if (!Array.isArray(t) || t.length === 0)
    throw new Error("System presentation expects at least one die.");
  const i = ft(e.keptIds), n = t.map((o) => mt(o, e, i)), s = /* @__PURE__ */ new Set();
  for (const o of n) {
    if (s.has(o.id))
      throw new Error(`Duplicate system die id '${o.id}'.`);
    s.add(o.id);
  }
  return Object.freeze(n);
}, $n = (t) => {
  if (!t || typeof t != "object")
    throw new Error("System display request must be an object.");
  const e = Se(t.id, "System display request id");
  return Object.freeze({
    id: e,
    dice: Ki(t.dice, t),
    ...t.seed === void 0 ? {} : { seed: t.seed },
    ...t.mode === void 0 ? {} : { mode: t.mode }
  });
}, Yi = /* @__PURE__ */ new Set([2, 4, 6, 8, 10, 12, 20, 100]), Qt = (t) => t.physicalValue ?? t.rawValue ?? t.value, Ji = (t, e) => {
  const i = Se(t.id, "Mixed die id"), n = t.sides, s = n === 3 ? 6 : n;
  if (typeof s != "number" || !Yi.has(s)) {
    if ((e.unsupportedDice ?? "omit") === "omit")
      return null;
    throw new Error(`Mixed die '${i}' uses unsupported generic sides '${String(n)}'.`);
  }
  const o = Qt(t), c = n === 3 ? 3 : s;
  if (!Number.isInteger(o) || o < 1 || o > c)
    throw new Error(`Mixed die '${i}' physical value ${String(o)} is outside 1-${c}.`);
  return Object.freeze({
    id: i,
    sides: s,
    value: o,
    discarded: t.discarded ?? t.included === !1,
    ...t.theme ?? e.theme ? { theme: t.theme ?? e.theme } : {},
    ...t.themeColor ?? e.themeColor ? { themeColor: t.themeColor ?? e.themeColor } : {}
  });
}, en = (t) => {
  if (t.unsupportedDice !== void 0 && t.unsupportedDice !== "omit" && t.unsupportedDice !== "error")
    throw new Error("unsupportedDice must be either 'omit' or 'error'.");
}, tn = (t, e = {}) => {
  if (!Array.isArray(t) || t.length === 0)
    throw new Error("Mixed presentation expects at least one die.");
  en(e);
  const i = ft(e.keptIds), n = [];
  for (const o of t) {
    if (!o || typeof o != "object")
      throw new Error("Mixed die must be an object.");
    if (typeof o.profileId == "string") {
      const l = Qt(o);
      n.push(mt({
        id: o.id,
        sides: typeof o.sides == "number" ? o.sides : Number.NaN,
        value: l,
        profileId: o.profileId,
        discarded: o.discarded
      }, e, i));
      continue;
    }
    const c = Ji(o, e);
    c !== null && n.push(c);
  }
  if (n.length === 0)
    throw new Error("Mixed presentation contains no supported 3D dice.");
  const s = /* @__PURE__ */ new Set();
  for (const o of n) {
    if (s.has(o.id))
      throw new Error(`Duplicate mixed die id '${o.id}'.`);
    s.add(o.id);
  }
  return Object.freeze(n);
}, In = (t) => {
  if (!t || typeof t != "object")
    throw new Error("Mixed display request must be an object.");
  const e = Se(t.id, "Mixed display request id");
  return Object.freeze({
    id: e,
    dice: tn(t.dice, t),
    ...t.seed === void 0 ? {} : { seed: t.seed },
    ...t.mode === void 0 ? {} : { mode: t.mode }
  });
};
export {
  W as D,
  Ni as K,
  Gt as S,
  Xe as a,
  ve as b,
  dt as c,
  Me as d,
  Re as e,
  Fe as f,
  xe as g,
  vn as h,
  _i as i,
  Tn as j,
  kt as k,
  ot as l,
  Bt as m,
  In as n,
  $n as o,
  Gi as p,
  Wi as q,
  En as r,
  Ki as s,
  tn as t
};
