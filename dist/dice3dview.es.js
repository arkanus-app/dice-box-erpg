var ae = Object.defineProperty;
var re = (s, e, t) => e in s ? ae(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var b = (s, e, t) => (re(s, typeof e != "symbol" ? e + "" : e, t), t), U = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var n = (s, e, t) => (U(s, e, "read from private field"), t ? t.call(s) : e.get(s)), l = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, f = (s, e, t, i) => (U(s, e, "write to private field"), i ? i.call(s, t) : e.set(s, t), t);
var C = (s, e, t, i) => ({
  set _(o) {
    f(s, e, o, t);
  },
  get _() {
    return n(s, e, i);
  }
}), d = (s, e, t) => (U(s, e, "access private method"), t);
function le(s) {
  const { selector: e, id: t } = s;
  let i = document.body, o = document.createElement("canvas");
  if (o.id = t, o.classList.add("dice-box-canvas"), e) {
    if (typeof e != "string")
      throw new Error("You must provide a DOM selector as the first argument in order to render the Dice Box");
    if (i = document.querySelector(e), !(i != null && i.nodeName))
      throw new Error(`DiceBox target DOM node: '${e}' not found or not available yet. Try invoking inside a DOMContentLoaded event`);
  }
  return i.appendChild(o), o;
}
function Ce(s, e, t) {
  return s * (1 - t) + e * t;
}
const ce = (s) => {
  let e;
  return function() {
    let t = this, i = arguments;
    e && window.cancelAnimationFrame(e), e = window.requestAnimationFrame(function() {
      s.apply(t, i);
    });
  };
}, Ee = (s) => JSON.parse(JSON.stringify(s)), de = (s) => {
  let e = !1, t = s.slice(s.startsWith("#") ? 1 : 0);
  t.length === 3 ? t = [...t].map((o) => o + o).join("") : t.length === 8 && (e = !0), t = parseInt(t, 16);
  let i = {
    r: t >>> 16,
    g: (t & 65280) >>> 8,
    b: t & 255
  };
  return e && (i.r = t >>> 24, i.g = (t & 16711680) >>> 16, i.b = (t & 65280) >>> 8, i.a = t & 255), i;
};
function he() {
  try {
    const s = document.createElement("canvas");
    return !!window.WebGLRenderingContext && (s.getContext("webgl") || s.getContext("experimental-webgl"));
  } catch {
    return !1;
  }
}
const fe = /* @__PURE__ */ new Set([4, 6, 8, 10, 12, 20, 100]), ue = /* @__PURE__ */ new Set(["physics", "visual"]), me = (s) => {
  const e = Number(s);
  if (!fe.has(e))
    throw new Error(`Unsupported display die: d${s}. Supported dice are d4, d6, d8, d10, d12, d20, and d100.`);
  return e;
}, we = (s, e) => {
  const t = Number(s);
  if (!Number.isFinite(t) || !Number.isInteger(t))
    throw new Error(`Display die d${e} is missing an integer value.`);
  if (t < 1 || t > e)
    throw new Error(`Display die d${e} value ${t} is outside 1-${e}.`);
  return t;
}, G = (s, e = "physics") => {
  const t = s ?? e;
  if (!ue.has(t))
    throw new Error(`Invalid forcedResultMode '${t}'. Supported modes are 'physics' and 'visual'.`);
  return t;
}, pe = (s = {}, e = {}) => {
  if (!s || typeof s != "object")
    throw new Error("displayRoll expects a request object.");
  if (!Array.isArray(s.dice) || s.dice.length === 0)
    throw new Error("displayRoll expects at least one resolved die.");
  const t = s.theme || e.theme || "default", i = s.themeColor || e.themeColor || "#2e8555", o = s.id || `display-roll-${Date.now()}`, r = G(s.forcedResultMode, e.forcedResultMode);
  return {
    id: o,
    seed: typeof s.seed == "string" ? s.seed : o,
    theme: t,
    themeColor: i,
    forcedResultMode: r,
    dice: s.dice.map((a, c) => {
      if (!a || typeof a != "object")
        throw new Error(`Display die at index ${c} must be an object.`);
      const u = me(a.sides), m = we(a.value, u), j = a.theme || t, L = a.themeColor || i, ne = G(a.forcedResultMode, r);
      return {
        id: a.id || `${o}-die-${c}`,
        index: c,
        sides: u,
        value: m,
        faceValue: u === 100 ? Math.floor((m - 1) / 10) * 10 : m,
        discarded: !!a.discarded,
        theme: j,
        themeColor: L,
        forcedResultMode: ne
      };
    })
  };
}, ge = (s) => Number(s == null ? void 0 : s.sides) === 100 ? 2 : 1, ye = (s) => s.reduce((e, t) => e + ge(t), 0), De = (s, e) => ({
  id: s.id,
  dice: e.map(({ collectionId: t, groupId: i, id: o, meshName: r, rollId: a, ...c }) => c)
}), ve = {
  id: `dice-canvas-${Date.now()}`,
  container: null,
  enableShadows: !0,
  shadowTransparency: 0.8,
  lightIntensity: 1,
  delay: 10,
  scale: 5,
  theme: "default",
  preloadThemes: [],
  externalThemes: {},
  themeColor: "#2e8555",
  offscreen: !1,
  assetPath: "/assets/dice-box/",
  origin: typeof window < "u" ? window.location.origin : "",
  maxDice: 999,
  antialias: !0,
  shadowResolution: 1024,
  gravity: 1.85,
  mass: 1.08,
  startingHeight: 6.4,
  spinForce: 5.8,
  throwForce: 4.55,
  wallPadding: 1.35,
  colliderScale: 1.02,
  spawnSpacing: 0.72,
  spawnHeightStep: 0.18,
  friction: 0.86,
  restitution: 0.16,
  linearDamping: 0.28,
  angularDamping: 0.24,
  settleTimeout: 4200,
  forcedResultMode: "physics"
};
var E, T, R, p, h, S, $, w, y, g, D, v, x, k, J, I, K, M, Y, N, Q, z, X, A, Z, W, ee, F, te, B, ie, O, q, V, se, P, H, _, oe;
class Te {
  constructor(e = {}) {
    l(this, k);
    l(this, I);
    l(this, M);
    l(this, N);
    l(this, z);
    l(this, A);
    l(this, W);
    l(this, F);
    l(this, B);
    l(this, O);
    l(this, V);
    l(this, P);
    l(this, _);
    b(this, "rollCollectionData", {});
    b(this, "rollDiceData", {});
    b(this, "themesLoadedData", {});
    l(this, E, 0);
    l(this, T, 0);
    l(this, R, 0);
    l(this, p, 0);
    l(this, h, {});
    l(this, S, void 0);
    l(this, $, void 0);
    l(this, w, void 0);
    l(this, y, !0);
    l(this, g, !1);
    l(this, D, /* @__PURE__ */ new Map());
    l(this, v, /* @__PURE__ */ new Map());
    l(this, x, /* @__PURE__ */ new Map());
    b(this, "noop", () => {
    });
    if (typeof e != "object")
      throw new Error("DiceBox config options must be an object.");
    const { onCollision: t, onThemeConfigLoaded: i, onThemeLoaded: o, ...r } = e;
    this.config = { ...ve, ...r }, this.onThemeLoaded = o || this.noop, this.onThemeConfigLoaded = i || this.noop, this.onCollision = t || this.noop, this.canvas = le({
      selector: this.config.container,
      id: this.config.id
    }), this.isVisible = !0, he() || f(this, y, !1), r.offscreen === void 0 && (this.config.offscreen = d(this, V, se).call(this)), this.config.maxDice = d(this, O, q).call(this, this.config.maxDice);
  }
  resizeWorld() {
    const e = () => {
      n(this, g) || !this.canvas || n(this, h).resize({ width: this.canvas.clientWidth, height: this.canvas.clientHeight });
    };
    n(this, w) && window.removeEventListener("resize", n(this, w)), f(this, w, ce(e)), window.addEventListener("resize", n(this, w));
  }
  async init() {
    if (n(this, g))
      throw new Error("Cannot init a disposed DiceBox.");
    return await d(this, k, J).call(this), this.resizeWorld(), n(this, h).onRollResult = (e) => {
      d(this, W, ee).call(this, e);
    }, n(this, h).onRollError = (e) => {
      d(this, F, te).call(this, e);
    }, await Promise.all([n(this, S)]), await d(this, P, H).call(this, [this.config.theme, ...this.config.preloadThemes]), this;
  }
  async getThemeConfig(e) {
    if (this.themesLoadedData[e])
      return this.themesLoadedData[e];
    const t = n(this, D).get(e);
    if (t)
      return t;
    const i = d(this, I, K).call(this, e);
    n(this, D).set(e, i);
    try {
      return await i;
    } finally {
      n(this, D).delete(e);
    }
  }
  async loadTheme(e) {
    if (this.themesLoadedData[e])
      return this.themesLoadedData[e];
    const t = n(this, v).get(e);
    if (t)
      return t;
    const i = d(this, M, Y).call(this, e);
    n(this, v).set(e, i);
    try {
      return await i;
    } catch (o) {
      throw delete this.themesLoadedData[e], o;
    } finally {
      n(this, v).delete(e);
    }
  }
  async updateConfig(e = {}) {
    const t = { ...this.config, ...e };
    if (e.maxDice !== void 0 && (t.maxDice = d(this, O, q).call(this, e.maxDice)), e.offscreen === void 0 && !("offscreen" in e) && (t.offscreen = this.config.offscreen), this.config = t, e.theme) {
      const i = await this.loadTheme(t.theme);
      i.hasOwnProperty("extends") && (this.config.theme = i.extends);
    }
    n(this, h).updateConfig(t);
  }
  clear() {
    var e, t;
    C(this, p)._++, Object.values(this.rollCollectionData).forEach((i) => {
      i.reject(new Error("Display roll was cleared before completion."));
    }), d(this, B, ie).call(this), (t = (e = n(this, h)).clear) == null || t.call(e);
  }
  dispose() {
    var e, t;
    n(this, g) || (this.clear(), f(this, g, !0), n(this, w) && (window.removeEventListener("resize", n(this, w)), f(this, w, null)), (t = (e = n(this, h)).dispose) == null || t.call(e));
  }
  hide(e) {
    e ? (this.canvas.dataset.hideClass = e, this.canvas.classList.add(e)) : this.canvas.style.display = "none", this.isVisible = !1;
  }
  show() {
    var t;
    const e = (t = this.canvas.dataset) == null ? void 0 : t.hideClass;
    e ? (delete this.canvas.dataset.hideClass, this.canvas.classList.remove(e)) : this.canvas.style.display = "block", this.isVisible = !0, this.resizeWorld();
  }
  async displayRoll(e) {
    if (n(this, g))
      throw new Error("Cannot display a roll after DiceBox.dispose().");
    const t = pe(e, this.config), i = ye(t.dice);
    if (i > this.config.maxDice)
      throw new Error(`Display roll exceeds maxDice (${this.config.maxDice}). Requested ${i} dice bodies.`);
    this.clear();
    const o = C(this, E)._++, r = n(this, p), a = new xe({
      id: o,
      token: r,
      request: t,
      rolls: []
    });
    return this.rollCollectionData[o] = a, d(this, N, Q).call(this, o).catch((c) => {
      const u = this.rollCollectionData[o];
      u && u.token === r && (u.reject(c), delete this.rollCollectionData[o]);
    }), a.promise;
  }
}
E = new WeakMap(), T = new WeakMap(), R = new WeakMap(), p = new WeakMap(), h = new WeakMap(), S = new WeakMap(), $ = new WeakMap(), w = new WeakMap(), y = new WeakMap(), g = new WeakMap(), D = new WeakMap(), v = new WeakMap(), x = new WeakMap(), k = new WeakSet(), J = async function() {
  f(this, S, new Promise((i) => {
    f(this, $, i);
  }));
  const e = () => {
    n(this, $).call(this);
  }, t = {
    canvas: this.canvas,
    options: this.config,
    onInitComplete: e,
    onCollision: (i) => this.onCollision(i)
  };
  if (n(this, y))
    if ("OffscreenCanvas" in window && "transferControlToOffscreen" in this.canvas && this.config.offscreen) {
      const i = await import("./chunks/world.offscreen-812ade94.js").then((o) => o.default);
      f(this, h, new i(t));
    } else {
      this.config.offscreen && (console.warn("This browser does not support OffscreenCanvas. Using standard canvas fallback."), this.config.offscreen = !1);
      const i = await import("./chunks/world.onscreen-e470226e.js").then((o) => o.default);
      f(this, h, new i(t));
    }
  else {
    const i = await import("./chunks/world.none-2af05a80.js").then((o) => o.default);
    f(this, h, new i(t));
  }
}, I = new WeakSet(), K = async function(e) {
  let t = `${this.config.origin}${this.config.assetPath}themes/${e}`;
  this.config.externalThemes[e] && (t = this.config.externalThemes[e]);
  const i = await fetch(`${t}/theme.config.json`).then((a) => {
    if (a.ok) {
      const c = a.headers.get("content-type");
      if (c && c.indexOf("application/json") !== -1 || a.type && a.type === "basic")
        return a.json();
      throw new Error(`Incorrect contentType: ${c}. Expected "application/json" or "basic"`);
    }
    throw new Error(`Unable to fetch config file for theme: '${e}'. Request rejected with status ${a.status}: ${a.statusText}`);
  });
  if (!i)
    throw new Error("No theme config data to work with.");
  let o = "default", r = `${this.config.origin}${this.config.assetPath}themes/default/default.json`;
  if (i.hasOwnProperty("meshFile") && (o = i.meshFile.replace(/(.*)\..{2,4}$/, "$1"), r = `${t}/${i.meshFile}`), !i.hasOwnProperty("diceAvailable"))
    throw new Error('A theme must define "diceAvailable".');
  if (i.hasOwnProperty("extends")) {
    const a = await this.loadTheme(i.extends);
    if (a.hasOwnProperty("extends"))
      throw new Error("Cannot extend a theme that extends another theme.");
    const c = {};
    i.diceAvailable.forEach((u) => {
      c[u] = i.systemName;
    }), a.diceExtended = { ...a.diceExtended, ...c }, a.diceExtendedSet = new Set(Object.keys(a.diceExtended)), this.config.theme = i.extends;
  }
  return Object.assign(i, {
    basePath: t,
    meshFilePath: r,
    meshName: o,
    theme: e,
    diceAvailableSet: new Set(i.diceAvailable || []),
    diceExtended: i.diceExtended || {},
    diceExtendedSet: new Set(Object.keys(i.diceExtended || {}))
  }), i;
}, M = new WeakSet(), Y = async function(e) {
  const t = await this.getThemeConfig(e);
  return this.themesLoadedData[e] = t, this.onThemeConfigLoaded(t), await n(this, h).loadTheme(t), this.onThemeLoaded(t), t;
}, N = new WeakSet(), Q = async function(e) {
  const t = this.rollCollectionData[e];
  if (!t)
    return;
  const i = new Set(t.request.dice.map((o) => o.theme));
  i.add(t.request.theme), await d(this, P, H).call(this, i), t.token === n(this, p) && await d(this, z, X).call(this, t);
}, z = new WeakSet(), X = async function(e) {
  let t = !0;
  for (const i of e.request.dice) {
    if (e.token !== n(this, p))
      return;
    const o = await d(this, A, Z).call(this, i), r = {
      sides: i.sides,
      data: i.sides === 100 ? void 0 : i.data,
      dieType: `d${i.sides}`,
      groupId: e.id,
      collectionId: e.id,
      rollId: C(this, T)._++,
      id: C(this, R)._++,
      displayId: i.id,
      theme: o.theme,
      themeColor: i.themeColor,
      meshName: o.meshName,
      forcedValue: i.value,
      forcedFaceValue: i.faceValue,
      forcedDiscarded: i.discarded,
      forcedResultMode: i.forcedResultMode,
      newStartPoint: t,
      colorSuffix: o.colorSuffix
    };
    this.rollDiceData[r.rollId] = r, e.rolls.push(r), n(this, y) ? n(this, h).add(r) : n(this, h).addNonDie({ ...r, value: r.forcedValue }), t = !1;
  }
}, A = new WeakSet(), Z = async function(e) {
  var j, L;
  let t = e.theme, i = await this.loadTheme(t), o = i.meshName, r = (i == null ? void 0 : i.diceAvailableSet) || new Set((i == null ? void 0 : i.diceAvailable) || []), a = i.diceExtended || {}, c = i.diceExtendedSet || new Set(Object.keys(a)), u = (j = i == null ? void 0 : i.material) == null ? void 0 : j.type;
  const m = `d${e.sides}`;
  if (!r.has(m) && c.has(m) && (t = a[m], i = await this.loadTheme(t), o = i.meshName, r = (i == null ? void 0 : i.diceAvailableSet) || new Set((i == null ? void 0 : i.diceAvailable) || []), u = (L = i == null ? void 0 : i.material) == null ? void 0 : L.type), !r.has(m) && !c.has(m))
    throw new Error(`${m} is unavailable in '${e.theme}' theme.`);
  return {
    theme: t,
    meshName: o,
    colorSuffix: d(this, _, oe).call(this, t, e.themeColor, u)
  };
}, W = new WeakSet(), ee = function(e) {
  const t = this.rollDiceData[e.rollId];
  if (!t)
    return;
  const i = this.rollCollectionData[t.collectionId];
  if (!(!i || i.token !== n(this, p)) && (t.value = e.value, i.completedRolls++, i.completedRolls === i.rolls.length)) {
    const o = De(i.request, i.rolls);
    i.resolve(o), delete this.rollCollectionData[i.id];
  }
}, F = new WeakSet(), te = function(e) {
  const t = e instanceof Error ? e : new Error((e == null ? void 0 : e.message) || String(e));
  e != null && e.stack && !t.stack && (t.stack = e.stack), Object.values(this.rollCollectionData).forEach((i) => {
    i.token === n(this, p) && (i.reject(t), delete this.rollCollectionData[i.id]);
  });
}, B = new WeakSet(), ie = function() {
  f(this, E, 0), f(this, T, 0), f(this, R, 0), this.rollCollectionData = {}, this.rollDiceData = {};
}, O = new WeakSet(), q = function(e) {
  const t = Number(e);
  if (!Number.isInteger(t) || t < 1)
    throw new Error('Config option "maxDice" must be a positive integer.');
  return t;
}, V = new WeakSet(), se = function() {
  var e;
  return n(this, y) && typeof window < "u" && "OffscreenCanvas" in window && typeof ((e = this.canvas) == null ? void 0 : e.transferControlToOffscreen) == "function";
}, P = new WeakSet(), H = async function(e) {
  const t = [...new Set(Array.from(e || []).filter(Boolean))];
  return t.length ? Promise.all(t.map((i) => this.loadTheme(i))) : [];
}, _ = new WeakSet(), oe = function(e, t, i) {
  if (i !== "color")
    return "";
  const o = `${e}|${t}|${i}`;
  if (n(this, x).has(o))
    return n(this, x).get(o);
  const r = de(t), a = r.r * 0.299 + r.g * 0.587 + r.b * 0.114 > 175 ? "_dark" : "_light";
  return n(this, x).set(o, a), a;
};
class xe {
  constructor(e) {
    Object.assign(this, e), this.rolls = e.rolls || [], this.completedRolls = 0, this.promise = new Promise((t, i) => {
      this.resolve = t, this.reject = i;
    });
  }
}
export {
  Ee as d,
  Te as default,
  Ce as l
};
