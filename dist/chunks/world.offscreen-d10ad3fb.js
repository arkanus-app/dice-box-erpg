var k = Object.defineProperty;
var u = (s, e, t) => e in s ? k(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var o = (s, e, t) => (u(s, typeof e != "symbol" ? e + "" : e, t), t), m = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var a = (s, e, t) => (m(s, e, "read from private field"), t ? t.call(s) : e.get(s)), h = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, p = (s, e, t, r) => (m(s, e, "write to private field"), r ? r.call(s, t) : e.set(s, t), t);
var f = (s, e, t) => (m(s, e, "access private method"), t);
function v() {
  return new Worker("" + new URL("../assets/offscreenCanvas.worker-e2a35027.js", import.meta.url).href, { type: "module" });
}
var n, i, l, g;
class w {
  // roll group callback
  constructor(e) {
    // initialize the babylon scene
    h(this, l);
    o(this, "initialized", !1);
    o(this, "offscreenWorkerInit", !1);
    o(this, "themeLoadedInit", !1);
    o(this, "pendingThemePromises", {});
    h(this, n, void 0);
    h(this, i, void 0);
    // onInitComplete = () => {} // init callback
    o(this, "onRollResult", () => {
    });
    // individual die callback
    o(this, "onRollError", () => {
    });
    o(this, "onRollComplete", () => {
    });
    this.onInitComplete = e.onInitComplete, p(this, n, e.canvas.transferControlToOffscreen()), p(this, i, new v()), a(this, i).init = new Promise((t, r) => {
      this.offscreenWorkerInit = t;
    }), this.initialized = f(this, l, g).call(this, e);
  }
  updateConfig(e) {
    a(this, i).postMessage({ action: "updateConfig", options: e });
  }
  resize(e) {
    a(this, i).postMessage({ action: "resize", options: e });
  }
  async loadTheme(e) {
    if (this.pendingThemePromises[e.theme])
      return this.pendingThemePromises[e.theme].promise;
    const t = {};
    return t.promise = new Promise((r, d) => {
      t.resolve = r, t.reject = d, a(this, i).postMessage({ action: "loadTheme", options: e });
    }), this.pendingThemePromises[e.theme] = t, t.promise;
  }
  clear() {
    a(this, i).postMessage({ action: "clearDice" });
  }
  dispose() {
    this.clear(), a(this, i).terminate();
  }
  add(e) {
    a(this, i).postMessage({ action: "addDie", options: e });
  }
  addNonDie(e) {
    a(this, i).postMessage({ action: "addNonDie", options: e });
  }
  remove(e) {
    a(this, i).postMessage({ action: "removeDie", options: e });
  }
}
n = new WeakMap(), i = new WeakMap(), l = new WeakSet(), g = async function(e) {
  return a(this, i).postMessage({
    action: "init",
    canvas: a(this, n),
    width: e.canvas.clientWidth,
    height: e.canvas.clientHeight,
    options: e.options
  }, [a(this, n)]), a(this, i).onmessage = (t) => {
    var r, d;
    switch (t.data.action) {
      case "init-complete":
        this.offscreenWorkerInit();
        break;
      case "theme-loaded":
        t.data.id && ((r = this.pendingThemePromises[t.data.id]) == null || r.resolve(t.data.id), delete this.pendingThemePromises[t.data.id]);
        break;
      case "theme-load-error":
        if (t.data.id) {
          const c = new Error(t.data.message || `Unable to load theme '${t.data.id}'`);
          c.stack = t.data.stack || c.stack, (d = this.pendingThemePromises[t.data.id]) == null || d.reject(c), delete this.pendingThemePromises[t.data.id];
        }
        break;
      case "roll-result":
        this.onRollResult(t.data.die);
        break;
      case "roll-error":
        this.onRollError(t.data.error);
        break;
      case "roll-complete":
        this.onRollComplete();
        break;
      case "die-removed":
        this.onDieRemoved(t.data.rollId);
        break;
    }
  }, await a(this, i).init, this.onInitComplete(!0), !0;
};
export {
  w as default
};
