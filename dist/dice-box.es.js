var G = Object.defineProperty;
var H = (s, e, t) => e in s ? G(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var y = (s, e, t) => (H(s, typeof e != "symbol" ? e + "" : e, t), t), S = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var l = (s, e, t) => (S(s, e, "read from private field"), t ? t.call(s) : e.get(s)), c = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, f = (s, e, t, i) => (S(s, e, "write to private field"), i ? i.call(s, t) : e.set(s, t), t);
var D = (s, e, t, i) => ({
  set _(o) {
    f(s, e, o, t);
  },
  get _() {
    return l(s, e, i);
  }
}), u = (s, e, t) => (S(s, e, "access private method"), t);
function J(s) {
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
function he(s, e, t) {
  return s * (1 - t) + e * t;
}
const Y = (s) => {
  let e;
  return function() {
    let t = this, i = arguments;
    e && window.cancelAnimationFrame(e), e = window.requestAnimationFrame(function() {
      s.apply(t, i);
    });
  };
}, K = (s = { dedupe: !1 }) => {
  const { dedupe: e } = s;
  let t = [], i;
  const o = (n) => (e && (t = []), t.push(n), i || (i = a()), i.finally(() => {
    i = void 0;
  })), a = async () => {
    const n = [];
    for (; t.length; ) {
      const r = t.shift();
      n.push(await r());
    }
    return n;
  };
  return { push: o, queue: t, flush: () => i || Promise.resolve([]) };
}, de = (s) => JSON.parse(JSON.stringify(s)), X = (s) => {
  let e = !1, t = s.slice(s.startsWith("#") ? 1 : 0);
  t.length === 3 ? t = [...t].map((o) => o + o).join("") : t.length === 8 && (e = !0), t = parseInt(t, 16);
  let i = {
    r: t >>> 16,
    g: (t & 65280) >>> 8,
    b: t & 255
  };
  return e && (i.r = t >>> 24, i.g = (t & 16711680) >>> 16, i.b = (t & 65280) >>> 8, i.a = t & 255), i;
};
function Z() {
  try {
    const s = document.createElement("canvas");
    return !!window.WebGLRenderingContext && (s.getContext("webgl") || s.getContext("experimental-webgl"));
  } catch {
    return !1;
  }
}
const ee = /* @__PURE__ */ new Set([4, 6, 8, 10, 12, 20, 100]), te = (s) => {
  const e = Number(s);
  if (!ee.has(e))
    throw new Error(`Unsupported display die: d${s}. Supported dice are d4, d6, d8, d10, d12, d20, and d100.`);
  return e;
}, ie = (s, e) => {
  const t = Number(s);
  if (!Number.isFinite(t) || !Number.isInteger(t))
    throw new Error(`Display die d${e} is missing an integer value.`);
  if (t < 1 || t > e)
    throw new Error(`Display die d${e} value ${t} is outside 1-${e}.`);
  return t;
}, se = (s = {}, e = {}) => {
  if (!s || typeof s != "object")
    throw new Error("displayRoll expects a request object.");
  if (!Array.isArray(s.dice) || s.dice.length === 0)
    throw new Error("displayRoll expects at least one resolved die.");
  const t = s.theme || e.theme || "default", i = s.themeColor || e.themeColor || "#2e8555", o = s.id || `display-roll-${Date.now()}`;
  return {
    id: o,
    seed: typeof s.seed == "string" ? s.seed : o,
    theme: t,
    themeColor: i,
    dice: s.dice.map((a, n) => {
      if (!a || typeof a != "object")
        throw new Error(`Display die at index ${n} must be an object.`);
      const r = te(a.sides), h = ie(a.value, r), $ = a.theme || t, R = a.themeColor || i;
      return {
        id: a.id || `${o}-die-${n}`,
        index: n,
        sides: r,
        value: h,
        faceValue: r === 100 ? Math.floor((h - 1) / 10) * 10 : h,
        discarded: !!a.discarded,
        theme: $,
        themeColor: R
      };
    })
  };
}, oe = (s) => Number(s == null ? void 0 : s.sides) === 100 ? 2 : 1, ae = (s) => s.reduce((e, t) => e + oe(t), 0), ne = (s, e) => ({
  id: s.id,
  dice: e.map(({ collectionId: t, groupId: i, id: o, meshName: a, rollId: n, ...r }) => r)
}), le = {
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
  offscreen: !0,
  assetPath: "/assets/dice-box/",
  origin: typeof window < "u" ? window.location.origin : "",
  maxDice: 999,
  antialias: !0,
  shadowResolution: 1024,
  gravity: 1
};
var v, x, b, p, d, C, T, m, g, w, O, F, j, V, I, Q, L, q, N, M, k, _, P, U, E, W;
class fe {
  constructor(e = {}) {
    c(this, O);
    c(this, j);
    c(this, I);
    c(this, L);
    c(this, N);
    c(this, k);
    c(this, P);
    c(this, E);
    y(this, "rollCollectionData", {});
    y(this, "rollDiceData", {});
    y(this, "themesLoadedData", {});
    c(this, v, 0);
    c(this, x, 0);
    c(this, b, 0);
    c(this, p, 0);
    c(this, d, {});
    c(this, C, void 0);
    c(this, T, void 0);
    c(this, m, void 0);
    c(this, g, !0);
    c(this, w, !1);
    y(this, "noop", () => {
    });
    if (typeof e != "object")
      throw new Error("DiceBox config options must be an object.");
    const { onCollision: t, onThemeConfigLoaded: i, onThemeLoaded: o, ...a } = e;
    this.config = { ...le, ...a }, this.config.maxDice = u(this, E, W).call(this, this.config.maxDice), this.onThemeLoaded = o || this.noop, this.onThemeConfigLoaded = i || this.noop, this.onCollision = t || this.noop, this.canvas = J({
      selector: this.config.container,
      id: this.config.id
    }), this.isVisible = !0, Z() || f(this, g, !1), this.loadThemeQueue = K();
  }
  resizeWorld() {
    const e = () => {
      l(this, w) || !this.canvas || l(this, d).resize({ width: this.canvas.clientWidth, height: this.canvas.clientHeight });
    };
    l(this, m) && window.removeEventListener("resize", l(this, m)), f(this, m, Y(e)), window.addEventListener("resize", l(this, m));
  }
  async init() {
    if (l(this, w))
      throw new Error("Cannot init a disposed DiceBox.");
    await u(this, O, F).call(this), this.resizeWorld(), l(this, d).onRollResult = (e) => {
      u(this, N, M).call(this, e);
    }, l(this, d).onRollError = (e) => {
      u(this, k, _).call(this, e);
    }, await Promise.all([l(this, C)]), await this.loadThemeQueue.push(() => this.loadTheme(this.config.theme));
    for (const e of this.config.preloadThemes)
      await this.loadThemeQueue.push(() => this.loadTheme(e));
    return this;
  }
  async getThemeConfig(e) {
    let t = `${this.config.origin}${this.config.assetPath}themes/${e}`;
    this.config.externalThemes[e] && (t = this.config.externalThemes[e]);
    const i = await fetch(`${t}/theme.config.json`).then((n) => {
      if (n.ok) {
        const r = n.headers.get("content-type");
        if (r && r.indexOf("application/json") !== -1 || n.type && n.type === "basic")
          return n.json();
        throw new Error(`Incorrect contentType: ${r}. Expected "application/json" or "basic"`);
      }
      throw new Error(`Unable to fetch config file for theme: '${e}'. Request rejected with status ${n.status}: ${n.statusText}`);
    });
    if (!i)
      throw new Error("No theme config data to work with.");
    let o = "default", a = `${this.config.origin}${this.config.assetPath}themes/default/default.json`;
    if (i.hasOwnProperty("meshFile") && (o = i.meshFile.replace(/(.*)\..{2,4}$/, "$1"), a = `${t}/${i.meshFile}`), !i.hasOwnProperty("diceAvailable"))
      throw new Error('A theme must define "diceAvailable".');
    if (i.hasOwnProperty("extends")) {
      const n = await this.loadTheme(i.extends);
      if (n.hasOwnProperty("extends"))
        throw new Error("Cannot extend a theme that extends another theme.");
      const r = {};
      i.diceAvailable.forEach((h) => {
        r[h] = i.systemName;
      }), n.diceExtended = { ...n.diceExtended, ...r }, this.config.theme = i.extends;
    }
    return Object.assign(i, {
      basePath: t,
      meshFilePath: a,
      meshName: o,
      theme: e
    }), i;
  }
  async loadTheme(e) {
    if (this.themesLoadedData[e])
      return this.themesLoadedData[e];
    try {
      const t = await this.getThemeConfig(e);
      return this.themesLoadedData[e] = t, this.onThemeConfigLoaded(t), await l(this, d).loadTheme(t), this.onThemeLoaded(t), t;
    } catch (t) {
      throw delete this.themesLoadedData[e], t;
    }
  }
  async updateConfig(e = {}) {
    const t = { ...this.config, ...e };
    if (e.maxDice !== void 0 && (t.maxDice = u(this, E, W).call(this, e.maxDice)), this.config = t, e.theme) {
      const o = (await this.loadThemeQueue.push(() => this.loadTheme(t.theme))).at(-1);
      o.hasOwnProperty("extends") && (this.config.theme = o.extends);
    }
    l(this, d).updateConfig(t);
  }
  clear() {
    var e, t;
    D(this, p)._++, Object.values(this.rollCollectionData).forEach((i) => {
      i.reject(new Error("Display roll was cleared before completion."));
    }), u(this, P, U).call(this), (t = (e = l(this, d)).clear) == null || t.call(e);
  }
  dispose() {
    var e, t;
    l(this, w) || (this.clear(), f(this, w, !0), l(this, m) && (window.removeEventListener("resize", l(this, m)), f(this, m, null)), (t = (e = l(this, d)).dispose) == null || t.call(e));
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
    if (l(this, w))
      throw new Error("Cannot display a roll after DiceBox.dispose().");
    const t = se(e, this.config), i = ae(t.dice);
    if (i > this.config.maxDice)
      throw new Error(`Display roll exceeds maxDice (${this.config.maxDice}). Requested ${i} dice bodies.`);
    this.clear();
    const o = D(this, v)._++, a = l(this, p), n = new re({
      id: o,
      token: a,
      request: t,
      rolls: []
    });
    return this.rollCollectionData[o] = n, u(this, j, V).call(this, o).catch((r) => {
      const h = this.rollCollectionData[o];
      h && h.token === a && (h.reject(r), delete this.rollCollectionData[o]);
    }), n.promise;
  }
}
v = new WeakMap(), x = new WeakMap(), b = new WeakMap(), p = new WeakMap(), d = new WeakMap(), C = new WeakMap(), T = new WeakMap(), m = new WeakMap(), g = new WeakMap(), w = new WeakMap(), O = new WeakSet(), F = async function() {
  f(this, C, new Promise((i) => {
    f(this, T, i);
  }));
  const e = () => {
    l(this, T).call(this);
  }, t = {
    canvas: this.canvas,
    options: this.config,
    onInitComplete: e
  };
  if (l(this, g))
    if ("OffscreenCanvas" in window && "transferControlToOffscreen" in this.canvas && this.config.offscreen) {
      const i = await import("./world.offscreen.js").then((o) => o.default);
      f(this, d, new i(t));
    } else {
      this.config.offscreen && (console.warn("This browser does not support OffscreenCanvas. Using standard canvas fallback."), this.config.offscreen = !1);
      const i = await import("./world.onscreen.js").then((o) => o.default);
      f(this, d, new i(t));
    }
  else {
    const i = await import("./world.none.js").then((o) => o.default);
    f(this, d, new i(t));
  }
}, j = new WeakSet(), V = async function(e) {
  const t = this.rollCollectionData[e];
  if (!t)
    return;
  const i = new Set(t.request.dice.map((o) => o.theme));
  i.add(t.request.theme);
  for (const o of i)
    await this.loadThemeQueue.push(() => this.loadTheme(o));
  await u(this, I, Q).call(this, t);
}, I = new WeakSet(), Q = async function(e) {
  let t = !0;
  for (const i of e.request.dice) {
    if (e.token !== l(this, p))
      return;
    const o = await u(this, L, q).call(this, i, e), a = {
      sides: i.sides,
      data: i.sides === 100 ? void 0 : i.data,
      dieType: `d${i.sides}`,
      groupId: e.id,
      collectionId: e.id,
      rollId: D(this, x)._++,
      id: D(this, b)._++,
      displayId: i.id,
      theme: o.theme,
      themeColor: i.themeColor,
      meshName: o.meshName,
      forcedValue: i.value,
      forcedFaceValue: i.faceValue,
      forcedDiscarded: i.discarded,
      newStartPoint: t,
      colorSuffix: o.colorSuffix
    };
    this.rollDiceData[a.rollId] = a, e.rolls.push(a), l(this, g) ? l(this, d).add(a) : l(this, d).addNonDie({ ...a, value: a.forcedValue }), t = !1;
  }
}, L = new WeakSet(), q = async function(e) {
  var A, B;
  let t = e.theme, i = this.themesLoadedData[t], o = i.meshName, a = (i == null ? void 0 : i.diceAvailable) || [], n = i.diceExtended || {}, r = (A = i == null ? void 0 : i.material) == null ? void 0 : A.type;
  const h = `d${e.sides}`, $ = Object.keys(n);
  if (!a.includes(h) && $.includes(h) && (t = n[h], await this.loadThemeQueue.push(() => this.loadTheme(t)), i = this.themesLoadedData[t], o = i.meshName, a = (i == null ? void 0 : i.diceAvailable) || [], r = (B = i == null ? void 0 : i.material) == null ? void 0 : B.type), !a.includes(h) && !$.includes(h))
    throw new Error(`${h} is unavailable in '${e.theme}' theme.`);
  let R = "";
  if (r === "color") {
    const z = X(e.themeColor);
    R = z.r * 0.299 + z.g * 0.587 + z.b * 0.114 > 175 ? "_dark" : "_light";
  }
  return {
    theme: t,
    meshName: o,
    colorSuffix: R
  };
}, N = new WeakSet(), M = function(e) {
  const t = this.rollDiceData[e.rollId];
  if (!t)
    return;
  const i = this.rollCollectionData[t.collectionId];
  if (!(!i || i.token !== l(this, p)) && (t.value = e.value, i.completedRolls++, i.completedRolls === i.rolls.length)) {
    const o = ne(i.request, i.rolls);
    i.resolve(o), delete this.rollCollectionData[i.id];
  }
}, k = new WeakSet(), _ = function(e) {
  const t = e instanceof Error ? e : new Error((e == null ? void 0 : e.message) || String(e));
  e != null && e.stack && !t.stack && (t.stack = e.stack), Object.values(this.rollCollectionData).forEach((i) => {
    i.token === l(this, p) && (i.reject(t), delete this.rollCollectionData[i.id]);
  });
}, P = new WeakSet(), U = function() {
  f(this, v, 0), f(this, x, 0), f(this, b, 0), this.rollCollectionData = {}, this.rollDiceData = {};
}, E = new WeakSet(), W = function(e) {
  const t = Number(e);
  if (!Number.isInteger(t) || t < 1)
    throw new Error('Config option "maxDice" must be a positive integer.');
  return t;
};
class re {
  constructor(e) {
    Object.assign(this, e), this.rolls = e.rolls || [], this.completedRolls = 0, this.promise = new Promise((t, i) => {
      this.resolve = t, this.reject = i;
    });
  }
}
export {
  de as d,
  fe as default,
  he as l
};
//# sourceMappingURL=dice-box.es.js.map
