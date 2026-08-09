const l = Object.freeze({
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
}), h = new Set(Object.keys(l)), u = (e) => typeof e == "string" && h.has(e), y = (e) => {
  if (!u(e))
    throw new Error(`Unsupported system dice profile '${e}'.`);
  return l[e];
}, n = (e, r) => {
  if (typeof e != "string" || e.trim().length === 0)
    throw new Error(`${r} must be a non-empty string.`);
  return e;
}, p = (e) => {
  if (!e || typeof e != "object")
    throw new Error("System die must be an object.");
  const r = n(e.id, "System die id"), s = y(e.profileId);
  if (e.sides !== s.sides)
    throw new Error(
      `System dice profile '${e.profileId}' expects d${s.sides}, received d${String(e.sides)}.`
    );
  if (!Number.isInteger(e.value) || e.value < 1 || e.value > s.sides)
    throw new Error(
      `System die '${r}' value ${String(e.value)} is outside 1-${s.sides}.`
    );
  return e.sourceDieId !== void 0 && n(e.sourceDieId, "System sourceDieId"), { id: r, profile: s, profileId: e.profileId };
}, a = (e) => e === void 0 ? void 0 : new Set(e.map((r) => n(r, "keptIds entry"))), m = (e, r, s) => {
  var c;
  const { id: o, profile: i, profileId: t } = p(e), d = s === void 0 ? !!e.discarded : !s.has(o) && (e.sourceDieId === void 0 || !s.has(e.sourceDieId));
  return Object.freeze({
    id: o,
    sides: i.sides,
    value: e.value,
    discarded: d,
    theme: i.theme,
    themeColor: ((c = r.themeColors) == null ? void 0 : c[t]) ?? i.themeColor
  });
}, j = (e, r = {}) => m(e, r, a(r.keptIds)), b = (e, r = {}) => {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error("System presentation expects at least one die.");
  const s = a(r.keptIds), o = e.map((t) => m(t, r, s)), i = /* @__PURE__ */ new Set();
  for (const t of o) {
    if (i.has(t.id))
      throw new Error(`Duplicate system die id '${t.id}'.`);
    i.add(t.id);
  }
  return Object.freeze(o);
}, D = (e) => {
  if (!e || typeof e != "object")
    throw new Error("System display request must be an object.");
  const r = n(e.id, "System display request id");
  return Object.freeze({
    id: r,
    dice: b(e.dice, e),
    ...e.seed === void 0 ? {} : { seed: e.seed },
    ...e.mode === void 0 ? {} : { mode: e.mode }
  });
}, v = /* @__PURE__ */ new Set([2, 4, 6, 8, 10, 12, 20, 100]), f = (e) => e.physicalValue ?? e.rawValue ?? e.value, w = (e, r) => {
  const s = n(e.id, "Mixed die id"), o = e.sides, i = o === 3 ? 6 : o;
  if (typeof i != "number" || !v.has(i)) {
    if ((r.unsupportedDice ?? "omit") === "omit")
      return null;
    throw new Error(`Mixed die '${s}' uses unsupported generic sides '${String(o)}'.`);
  }
  const t = f(e), d = o === 3 ? 3 : i;
  if (!Number.isInteger(t) || t < 1 || t > d)
    throw new Error(`Mixed die '${s}' physical value ${String(t)} is outside 1-${d}.`);
  return Object.freeze({
    id: s,
    sides: i,
    value: t,
    discarded: e.discarded ?? e.included === !1,
    ...e.theme ?? r.theme ? { theme: e.theme ?? r.theme } : {},
    ...e.themeColor ?? r.themeColor ? { themeColor: e.themeColor ?? r.themeColor } : {}
  });
}, S = (e) => {
  if (e.unsupportedDice !== void 0 && e.unsupportedDice !== "omit" && e.unsupportedDice !== "error")
    throw new Error("unsupportedDice must be either 'omit' or 'error'.");
}, g = (e, r = {}) => {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error("Mixed presentation expects at least one die.");
  S(r);
  const s = a(r.keptIds), o = [];
  for (const t of e) {
    if (!t || typeof t != "object")
      throw new Error("Mixed die must be an object.");
    if (typeof t.profileId == "string") {
      const c = f(t);
      o.push(m({
        id: t.id,
        sides: typeof t.sides == "number" ? t.sides : Number.NaN,
        value: c,
        profileId: t.profileId,
        discarded: t.discarded
      }, r, s));
      continue;
    }
    const d = w(t, r);
    d !== null && o.push(d);
  }
  if (o.length === 0)
    throw new Error("Mixed presentation contains no supported 3D dice.");
  const i = /* @__PURE__ */ new Set();
  for (const t of o) {
    if (i.has(t.id))
      throw new Error(`Duplicate mixed die id '${t.id}'.`);
    i.add(t.id);
  }
  return Object.freeze(o);
}, E = (e) => {
  if (!e || typeof e != "object")
    throw new Error("Mixed display request must be an object.");
  const r = n(e.id, "Mixed display request id");
  return Object.freeze({
    id: r,
    dice: g(e.dice, e),
    ...e.seed === void 0 ? {} : { seed: e.seed },
    ...e.mode === void 0 ? {} : { mode: e.mode }
  });
};
export {
  l as SYSTEM_THEME_PROFILES,
  E as createMixedDisplayRequest,
  D as createSystemDisplayRequest,
  y as getSystemThemeProfile,
  u as isSystemDiceProfileId,
  g as toMixedResolvedDice,
  b as toSystemResolvedDice,
  j as toSystemResolvedDie
};
