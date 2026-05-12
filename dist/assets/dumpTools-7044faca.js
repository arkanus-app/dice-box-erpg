import { C as I, T as d, E as m, f as S, g as b } from "./offscreenCanvas.worker-e2a35027.js";
let l, c = null;
async function x() {
  return c || (c = new Promise((t, s) => {
    let a, e = null;
    const f = {
      preserveDrawingBuffer: !0,
      depth: !1,
      stencil: !1,
      alpha: !0,
      premultipliedAlpha: !1,
      antialias: !1,
      failIfMajorPerformanceCaveat: !1
    };
    import("./offscreenCanvas.worker-e2a35027.js").then(function(r) {
      return r.t;
    }).then(({ ThinEngine: r }) => {
      var i;
      const o = m.Instances.length;
      try {
        a = new OffscreenCanvas(100, 100), e = new r(a, !1, f);
      } catch {
        o < m.Instances.length && ((i = m.Instances.pop()) == null || i.dispose()), a = document.createElement("canvas"), e = new r(a, !1, f);
      }
      m.Instances.pop(), m.OnEnginesDisposedObservable.add((n) => {
        e && n !== e && !e.isDisposed && m.Instances.length === 0 && E();
      }), e.getCaps().parallelShaderCompile = void 0;
      const p = new S(e);
      import("./pass.fragment-db4dc3b5.js").then(({ passPixelShader: n }) => {
        if (!e) {
          s("Engine is not defined");
          return;
        }
        const g = new b({
          engine: e,
          name: n.name,
          fragmentShader: n.shader,
          samplerNames: ["textureSampler"]
        });
        l = {
          canvas: a,
          engine: e,
          renderer: p,
          wrapper: g
        }, t(l);
      });
    }).catch(s);
  })), await c;
}
async function v(t, s, a, e, f = "image/png", r, o) {
  const p = await a.readPixels(0, 0, t, s), i = new Uint8Array(p.buffer);
  D(t, s, i, e, f, r, !0, void 0, o);
}
function y(t, s, a, e = "image/png", f, r = !1, o = !1, p) {
  return new Promise((i) => {
    D(t, s, a, (n) => i(n), e, f, r, o, p);
  });
}
function D(t, s, a, e, f = "image/png", r, o = !1, p = !1, i) {
  x().then((n) => {
    if (n.engine.setSize(t, s, !0), a instanceof Float32Array) {
      const w = new Uint8Array(a.length);
      let u = a.length;
      for (; u--; ) {
        const h = a[u];
        w[u] = Math.round(I(h) * 255);
      }
      a = w;
    }
    const g = n.engine.createRawTexture(a, t, s, 5, !1, !o, 1);
    n.renderer.setViewport(), n.renderer.applyEffectWrapper(n.wrapper), n.wrapper.effect._bindTexture("textureSampler", g), n.renderer.draw(), p ? d.ToBlob(n.canvas, (w) => {
      const u = new FileReader();
      u.onload = (h) => {
        const A = h.target.result;
        e && e(A);
      }, u.readAsArrayBuffer(w);
    }, f, i) : d.EncodeScreenshotCanvasData(n.canvas, e, f, r, i), g.dispose();
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
