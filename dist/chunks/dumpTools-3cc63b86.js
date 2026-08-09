import { v as S, w as C, m as T, Q as d, n as D, U as x, W as O, X as g } from "./index-11ca32cf.js";
import { E as B, a as W } from "./postProcess.pure-bf549f59.js";
let p = null;
async function R() {
  var f;
  const e = ((f = g.LastCreatedEngine) == null ? void 0 : f.createCanvas(100, 100)) ?? new OffscreenCanvas(100, 100);
  e instanceof OffscreenCanvas && D.Warn("DumpData: OffscreenCanvas will be used for dumping data. This may result in lossy alpha values.");
  const { ThinEngine: s } = await import("./thinEngine-d9e66de7.js");
  if (!s.IsSupported)
    throw new Error("DumpData: No WebGL context available. Cannot dump data.");
  const a = {
    preserveDrawingBuffer: !0,
    depth: !1,
    stencil: !1,
    alpha: !0,
    premultipliedAlpha: !1,
    antialias: !1,
    failIfMajorPerformanceCaveat: !1
  }, n = new s(e, !1, a);
  g.Instances.pop(), g.OnEnginesDisposedObservable.add((i) => {
    n && i !== n && !n.isDisposed && g.Instances.length === 0 && A();
  }), n.getCaps().parallelShaderCompile = void 0;
  const t = new B(n), { passPixelShader: r } = await import("./pass.fragment-0e46c1ba.js"), c = new W({
    engine: n,
    name: r.name,
    fragmentShader: r.shader,
    samplerNames: ["textureSampler"]
  });
  return {
    canvas: e,
    dumpEngine: { engine: n, renderer: t, wrapper: c }
  };
}
async function F() {
  return p || (p = R()), await p;
}
let b = (() => {
  var e;
  let s = [], a;
  return e = class {
    /**
     * Encodes image data to the given mime type.
     * This is put into a helper class so we can apply the nativeOverride decorator to it.
     * @internal
     */
    static async EncodeImageAsync(t, r, c, f, i, l) {
      const u = await F(), o = u.dumpEngine;
      o.engine.setSize(r, c, !0);
      const m = o.engine.createRawTexture(t, r, c, 5, !1, !i, 1);
      return o.renderer.setViewport(), o.renderer.applyEffectWrapper(o.wrapper), o.wrapper.effect._bindTexture("textureSampler", m), o.renderer.draw(), m.dispose(), await new Promise((I, _) => {
        d.ToBlob(u.canvas, (w) => {
          w ? I(w) : _(new Error("EncodeImageAsync: Failed to convert canvas to blob."));
        }, f, l);
      });
    }
  }, (() => {
    const n = typeof Symbol == "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    a = [O], S(e, null, a, { kind: "method", name: "EncodeImageAsync", static: !0, private: !1, access: { has: (t) => "EncodeImageAsync" in t, get: (t) => t.EncodeImageAsync }, metadata: n }, null, s), n && Object.defineProperty(e, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: n }), C(e, s);
  })(), e;
})();
const z = b.EncodeImageAsync;
async function h(e, s, a, n, t = "image/png", r, c) {
  const f = await a.readPixels(0, 0, e, s), i = new Uint8Array(f.buffer);
  y(e, s, i, n, t, r, !0, void 0, c);
}
async function E(e, s, a, n = "image/png", t, r = !1, c = !1, f) {
  if (a instanceof Float32Array) {
    const u = new Uint8Array(a.length);
    let o = a.length;
    for (; o--; ) {
      const m = a[o];
      u[o] = Math.round(T(m) * 255);
    }
    a = u;
  }
  const i = await b.EncodeImageAsync(a, e, s, n, r, f);
  t !== void 0 && d.DownloadBlob(i, t), i.type !== n && D.Warn(`DumpData: The requested mimeType '${n}' is not supported. The result has mimeType '${i.type}' instead.`);
  const l = await i.arrayBuffer();
  return c ? l : `data:${n};base64,${x(l)}`;
}
function y(e, s, a, n, t = "image/png", r, c = !1, f = !1, i) {
  r === void 0 && !n && (r = ""), E(e, s, a, t, r, c, f, i).then((l) => {
    n && n(l);
  });
}
function A() {
  p && (p == null || p.then((e) => {
    e.canvas instanceof HTMLCanvasElement && e.canvas.remove(), e.dumpEngine && (e.dumpEngine.engine.dispose(), e.dumpEngine.renderer.dispose(), e.dumpEngine.wrapper.dispose());
  }), p = null);
}
const H = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpData: y,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpDataAsync: E,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpFramebuffer: h,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Dispose: A
};
let v = !1;
function L() {
  if (v)
    return;
  v = !0, (() => {
    d.DumpData = y, d.DumpDataAsync = E, d.DumpFramebuffer = h;
  })();
}
L();
export {
  A as Dispose,
  y as DumpData,
  E as DumpDataAsync,
  h as DumpFramebuffer,
  H as DumpTools,
  z as EncodeImageAsync,
  L as RegisterDumpTools
};
