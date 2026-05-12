import { e as S, a as I } from "./postProcess-ee182885.js";
import { aS as b, $ as d, E as m } from "./Dice-b8dad4fa.js";
import "./texture-f572944e.js";
let l, c = null;
async function x() {
  return c || (c = new Promise((t, s) => {
    let a, e = null;
    const i = {
      preserveDrawingBuffer: !0,
      depth: !1,
      stencil: !1,
      alpha: !0,
      premultipliedAlpha: !1,
      antialias: !1,
      failIfMajorPerformanceCaveat: !1
    };
    import("./postProcess-ee182885.js").then((r) => r.t).then(({ ThinEngine: r }) => {
      var f;
      const o = m.Instances.length;
      try {
        a = new OffscreenCanvas(100, 100), e = new r(a, !1, i);
      } catch {
        o < m.Instances.length && ((f = m.Instances.pop()) == null || f.dispose()), a = document.createElement("canvas"), e = new r(a, !1, i);
      }
      m.Instances.pop(), m.OnEnginesDisposedObservable.add((n) => {
        e && n !== e && !e.isDisposed && m.Instances.length === 0 && E();
      }), e.getCaps().parallelShaderCompile = void 0;
      const p = new S(e);
      import("./pass.fragment-40176876.js").then(({ passPixelShader: n }) => {
        if (!e) {
          s("Engine is not defined");
          return;
        }
        const w = new I({
          engine: e,
          name: n.name,
          fragmentShader: n.shader,
          samplerNames: ["textureSampler"]
        });
        l = {
          canvas: a,
          engine: e,
          renderer: p,
          wrapper: w
        }, t(l);
      });
    }).catch(s);
  })), await c;
}
async function v(t, s, a, e, i = "image/png", r, o) {
  const p = await a.readPixels(0, 0, t, s), f = new Uint8Array(p.buffer);
  D(t, s, f, e, i, r, !0, void 0, o);
}
function y(t, s, a, e = "image/png", i, r = !1, o = !1, p) {
  return new Promise((f) => {
    D(t, s, a, (n) => f(n), e, i, r, o, p);
  });
}
function D(t, s, a, e, i = "image/png", r, o = !1, p = !1, f) {
  x().then((n) => {
    if (n.engine.setSize(t, s, !0), a instanceof Float32Array) {
      const g = new Uint8Array(a.length);
      let u = a.length;
      for (; u--; ) {
        const h = a[u];
        g[u] = Math.round(b(h) * 255);
      }
      a = g;
    }
    const w = n.engine.createRawTexture(a, t, s, 5, !1, !o, 1);
    n.renderer.setViewport(), n.renderer.applyEffectWrapper(n.wrapper), n.wrapper.effect._bindTexture("textureSampler", w), n.renderer.draw(), p ? d.ToBlob(n.canvas, (g) => {
      const u = new FileReader();
      u.onload = (h) => {
        const A = h.target.result;
        e && e(A);
      }, u.readAsArrayBuffer(g);
    }, i, f) : d.EncodeScreenshotCanvasData(n.canvas, e, i, r, f), w.dispose();
  });
}
function E() {
  l ? (l.wrapper.dispose(), l.renderer.dispose(), l.engine.dispose()) : c == null || c.then((t) => {
    t.wrapper.dispose(), t.renderer.dispose(), t.engine.dispose();
  }), c = null, l = null;
}
const T = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpData: D,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpDataAsync: y,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpFramebuffer: v,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Dispose: E
}, C = () => {
  d.DumpData = D, d.DumpDataAsync = y, d.DumpFramebuffer = v;
};
C();
export {
  E as Dispose,
  D as DumpData,
  y as DumpDataAsync,
  v as DumpFramebuffer,
  T as DumpTools
};
