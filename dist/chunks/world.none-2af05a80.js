var g = Object.defineProperty;
var I = (t, e, o) => e in t ? g(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var p = (t, e, o) => (I(t, typeof e != "symbol" ? e + "" : e, o), o), R = (t, e, o) => {
  if (!e.has(t))
    throw TypeError("Cannot " + o);
};
var s = (t, e, o) => (R(t, e, "read from private field"), o ? o.call(t) : e.get(t)), a = (t, e, o) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, o);
}, r = (t, e, o, n) => (R(t, e, "write to private field"), n ? n.call(t, o) : e.set(t, o), o);
var d = (t, e, o, n) => ({
  set _(l) {
    r(t, e, l, o);
  },
  get _() {
    return s(t, e, n);
  }
});
import { D as C } from "./Dice-f63fdd4d.js";
var v, i, m, h, f, c;
class y {
  constructor(e) {
    p(this, "config");
    a(this, v, void 0);
    p(this, "initialized", !1);
    a(this, i, {});
    a(this, m, 0);
    a(this, h, 0);
    a(this, f, []);
    a(this, c, void 0);
    p(this, "noop", () => {
    });
    this.onInitComplete = e.onInitComplete || this.noop, this.onThemeLoaded = e.onThemeLoaded || this.noop, this.onRollResult = e.onRollResult || this.noop, this.onRollError = e.onRollError || this.noop, this.onRollComplete = e.onRollComplete || this.noop, this.onDieRemoved = e.onDieRemoved || this.noop, this.initialized = this.initScene(e);
  }
  async initScene(e) {
    this.config = e.options, this.onInitComplete();
  }
  resize() {
  }
  loadTheme() {
    return Promise.resolve();
  }
  updateConfig(e) {
    Object.assign(this.config, e);
  }
  addNonDie(e) {
    console.log("die", e), clearTimeout(s(this, c));
    const { id: o, value: n, ...l } = e, u = {
      id: o,
      value: n,
      config: l
    };
    s(this, i)[o] = u, s(this, f).push(setTimeout(() => {
      this.handleAsleep(u);
    }, d(this, m)._++ * this.config.delay)), r(this, c, setTimeout(() => {
      this.onRollComplete();
    }, 500));
  }
  add(e) {
    console.log("add die"), this.addNonDie(e);
  }
  remove(e) {
    console.log("remove die");
    const o = s(this, i)[e.id];
    o.hasOwnProperty("d10Instance") && (delete s(this, i)[o.d10Instance.id], d(this, h)._--), delete s(this, i)[e.id], d(this, h)._--, this.onDieRemoved(e.rollId);
  }
  clear() {
    !Object.keys(s(this, i)).length && !s(this, h) || (s(this, f).forEach((e) => clearTimeout(e)), Object.values(s(this, i)).forEach((e) => {
      e.mesh && e.mesh.dispose();
    }), r(this, i, {}), r(this, m, 0), r(this, h, 0), clearTimeout(s(this, c)));
  }
  dispose() {
    this.clear();
  }
  async handleAsleep(e) {
    var o, n;
    e.asleep = !0;
    try {
      await C.getRollResult(e);
    } catch (l) {
      this.onRollError(l);
      return;
    }
    if (e.d10Instance || e.dieParent) {
      if ((o = e == null ? void 0 : e.d10Instance) != null && o.asleep || (n = e == null ? void 0 : e.dieParent) != null && n.asleep) {
        const l = e.config.sides === 100 ? e : e.dieParent, u = e.config.sides === 10 ? e : e.d10Instance;
        u.value === 0 && l.value === 0 ? l.value = 100 : l.value = l.value + u.value, this.onRollResult({
          rollId: l.config.rollId,
          value: l.value
        });
      }
    } else
      e.config.sides === 10 && e.value === 0 && (e.value = 10), this.onRollResult({
        rollId: e.config.rollId,
        value: e.value
      });
    d(this, h)._++;
  }
}
v = new WeakMap(), i = new WeakMap(), m = new WeakMap(), h = new WeakMap(), f = new WeakMap(), c = new WeakMap();
export {
  y as default
};
