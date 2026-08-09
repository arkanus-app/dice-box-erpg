var Ft = (() => {
  var se = import.meta.url;
  return function(Xe = {}) {
    var le, t = Xe, ue, Q, qe = new Promise((e, r) => {
      ue = e, Q = r;
    }), de = Object.assign({}, t), Pe = (e, r) => {
      throw r;
    }, B = "";
    function Ye(e) {
      return t.locateFile ? t.locateFile(e, B) : B + e;
    }
    var fe;
    typeof document < "u" && document.currentScript && (B = document.currentScript.src), se && (B = se), B.startsWith("blob:") ? B = "" : B = B.substr(0, B.replace(/[?#].*/, "").lastIndexOf("/") + 1), fe = (e) => fetch(e, { credentials: "same-origin" }).then((r) => r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status + " : " + r.url)));
    var Ze = t.print || console.log.bind(console), R = t.printErr || console.error.bind(console);
    Object.assign(t, de), de = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var $ = t.wasmBinary, L, ee = !1, re, O, g, F, k, D, h, ce, ve, ye, He;
    function pe() {
      var e = L.buffer;
      t.HEAP8 = O = new Int8Array(e), t.HEAP16 = F = new Int16Array(e), t.HEAPU8 = g = new Uint8Array(e), t.HEAPU16 = k = new Uint16Array(e), t.HEAP32 = D = new Int32Array(e), t.HEAPU32 = h = new Uint32Array(e), t.HEAPF32 = ce = new Float32Array(e), t.HEAPF64 = He = new Float64Array(e), t.HEAP64 = ve = new BigInt64Array(e), t.HEAPU64 = ye = new BigUint64Array(e);
    }
    var he = [], me = [], ze = [], ge = [];
    function er() {
      var e = t.preRun;
      e && (typeof e == "function" && (e = [e]), e.forEach(ar)), j(he);
    }
    function rr() {
      j(me);
    }
    function tr() {
      j(ze);
    }
    function nr() {
      var e = t.postRun;
      e && (typeof e == "function" && (e = [e]), e.forEach(ir)), j(ge);
    }
    function ar(e) {
      he.unshift(e);
    }
    function or(e) {
      me.unshift(e);
    }
    function ir(e) {
      ge.unshift(e);
    }
    var E = 0, U = null;
    function _r(e) {
      var r;
      E++, (r = t.monitorRunDependencies) == null || r.call(t, E);
    }
    function sr(e) {
      var n;
      if (E--, (n = t.monitorRunDependencies) == null || n.call(t, E), E == 0 && U) {
        var r = U;
        U = null, r();
      }
    }
    function Se(e) {
      var n;
      (n = t.onAbort) == null || n.call(t, e), e = "Aborted(" + e + ")", R(e), ee = !0, e += ". Build with -sASSERTIONS for more info.";
      var r = new WebAssembly.RuntimeError(e);
      throw Q(r), r;
    }
    var lr = "data:application/octet-stream;base64,", Ce = (e) => e.startsWith(lr);
    function ur() {
      if (t.locateFile) {
        var e = "HavokPhysics.wasm";
        return Ce(e) ? e : Ye(e);
      }
      return "HavokPhysics.wasm";
    }
    var te;
    function Ae(e) {
      if (e == te && $)
        return new Uint8Array($);
      throw "both async and sync fetching of the wasm failed";
    }
    function dr(e) {
      return $ ? Promise.resolve().then(() => Ae(e)) : fe(e).then((r) => new Uint8Array(r), () => Ae(e));
    }
    function Te(e, r, n) {
      return dr(e).then((a) => WebAssembly.instantiate(a, r)).then(n, (a) => {
        R(`failed to asynchronously prepare wasm: ${a}`), Se(a);
      });
    }
    function Pr(e, r, n, a) {
      return !e && typeof WebAssembly.instantiateStreaming == "function" && !Ce(r) && typeof fetch == "function" ? fetch(r, { credentials: "same-origin" }).then((i) => {
        var s = WebAssembly.instantiateStreaming(i, n);
        return s.then(a, function(l) {
          return R(`wasm streaming compile failed: ${l}`), R("falling back to ArrayBuffer instantiation"), Te(r, n, a);
        });
      }) : Te(r, n, a);
    }
    function fr() {
      return { env: Qe, wasi_snapshot_preview1: Qe };
    }
    function cr() {
      var e = fr();
      function r(a, i) {
        return o = a.exports, L = o.memory, pe(), De = o.__indirect_function_table, or(o.__wasm_call_ctors), sr(), o;
      }
      _r();
      function n(a) {
        r(a.instance);
      }
      if (t.instantiateWasm)
        try {
          return t.instantiateWasm(e, r);
        } catch (a) {
          R(`Module.instantiateWasm callback failed with error: ${a}`), Q(a);
        }
      return te ?? (te = ur()), Pr($, te, e, n).catch(Q), {};
    }
    function We(e) {
      this.name = "ExitStatus", this.message = `Program terminated with exit(${e})`, this.status = e;
    }
    var j = (e) => {
      e.forEach((r) => r(t));
    }, vr = t.noExitRuntime || !0, yr = () => {
      Se("");
    }, J = {}, ne = (e) => {
      for (; e.length; ) {
        var r = e.pop(), n = e.pop();
        n(r);
      }
    };
    function K(e) {
      return this.fromWireType(h[e >> 2]);
    }
    var I = {}, M = {}, X = {}, Ge, Be = (e) => {
      throw new Ge(e);
    }, be = (e, r, n) => {
      e.forEach((_) => X[_] = r);
      function a(_) {
        var u = n(_);
        u.length !== e.length && Be("Mismatched type converter count");
        for (var d = 0; d < e.length; ++d)
          T(e[d], u[d]);
      }
      var i = new Array(r.length), s = [], l = 0;
      r.forEach((_, u) => {
        M.hasOwnProperty(_) ? i[u] = M[_] : (s.push(_), I.hasOwnProperty(_) || (I[_] = []), I[_].push(() => {
          i[u] = M[_], ++l, l === s.length && a(i);
        }));
      }), s.length === 0 && a(i);
    }, Hr = (e) => {
      var r = J[e];
      delete J[e];
      var n = r.elements, a = n.length, i = n.map((_) => _.getterReturnType).concat(n.map((_) => _.setterArgumentType)), s = r.rawConstructor, l = r.rawDestructor;
      be([e], i, (_) => (n.forEach((u, d) => {
        var P = _[d], f = u.getter, c = u.getterContext, v = _[d + a], y = u.setter, p = u.setterContext;
        u.read = (H) => P.fromWireType(f(c, H)), u.write = (H, C) => {
          var m = [];
          y(p, H, v.toWireType(m, C)), ne(m);
        };
      }), [{ name: r.name, fromWireType: (u) => {
        for (var d = new Array(a), P = 0; P < a; ++P)
          d[P] = n[P].read(u);
        return l(u), d;
      }, toWireType: (u, d) => {
        if (a !== d.length)
          throw new TypeError(`Incorrect number of tuple elements for ${r.name}: expected=${a}, actual=${d.length}`);
        for (var P = s(), f = 0; f < a; ++f)
          n[f].write(P, d[f]);
        return u !== null && u.push(l, P), P;
      }, argPackAdvance: W, readValueFromPointer: K, destructorFunction: l }]));
    }, pr = (e) => {
      if (e === null)
        return "null";
      var r = typeof e;
      return r === "object" || r === "array" || r === "function" ? e.toString() : "" + e;
    }, hr = () => {
      for (var e = new Array(256), r = 0; r < 256; ++r)
        e[r] = String.fromCharCode(r);
      xe = e;
    }, xe, S = (e) => {
      for (var r = "", n = e; g[n]; )
        r += xe[g[n++]];
      return r;
    }, we, A = (e) => {
      throw new we(e);
    };
    function mr(e, r, n = {}) {
      var a = r.name;
      if (e || A(`type "${a}" must have a positive integer typeid pointer`), M.hasOwnProperty(e)) {
        if (n.ignoreDuplicateRegistrations)
          return;
        A(`Cannot register type '${a}' twice`);
      }
      if (M[e] = r, delete X[e], I.hasOwnProperty(e)) {
        var i = I[e];
        delete I[e], i.forEach((s) => s());
      }
    }
    function T(e, r, n = {}) {
      return mr(e, r, n);
    }
    var Ee = (e, r, n) => {
      switch (r) {
        case 1:
          return n ? (a) => O[a] : (a) => g[a];
        case 2:
          return n ? (a) => F[a >> 1] : (a) => k[a >> 1];
        case 4:
          return n ? (a) => D[a >> 2] : (a) => h[a >> 2];
        case 8:
          return n ? (a) => ve[a >> 3] : (a) => ye[a >> 3];
        default:
          throw new TypeError(`invalid integer width (${r}): ${e}`);
      }
    }, gr = (e, r, n, a, i) => {
      r = S(r);
      var s = r.indexOf("u") != -1;
      T(e, { name: r, fromWireType: (l) => l, toWireType: function(l, _) {
        if (typeof _ != "bigint" && typeof _ != "number")
          throw new TypeError(`Cannot convert "${pr(_)}" to ${this.name}`);
        return typeof _ == "number" && (_ = BigInt(_)), _;
      }, argPackAdvance: W, readValueFromPointer: Ee(r, n, !s), destructorFunction: null });
    }, W = 8, Sr = (e, r, n, a) => {
      r = S(r), T(e, { name: r, fromWireType: function(i) {
        return !!i;
      }, toWireType: function(i, s) {
        return s ? n : a;
      }, argPackAdvance: W, readValueFromPointer: function(i) {
        return this.fromWireType(g[i]);
      }, destructorFunction: null });
    }, ae = [], x = [], oe = (e) => {
      e > 9 && --x[e + 1] === 0 && (x[e] = void 0, ae.push(e));
    }, Cr = () => x.length / 2 - 5 - ae.length, Ar = () => {
      x.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Cr;
    }, V = { toValue: (e) => (e || A("Cannot use deleted val. handle = " + e), x[e]), toHandle: (e) => {
      switch (e) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const r = ae.pop() || x.length;
          return x[r] = e, x[r + 1] = 1, r;
        }
      }
    } }, Tr = { name: "emscripten::val", fromWireType: (e) => {
      var r = V.toValue(e);
      return oe(e), r;
    }, toWireType: (e, r) => V.toHandle(r), argPackAdvance: W, readValueFromPointer: K, destructorFunction: null }, Wr = (e) => T(e, Tr), Gr = (e, r, n) => {
      if (e[r].overloadTable === void 0) {
        var a = e[r];
        e[r] = function(...i) {
          return e[r].overloadTable.hasOwnProperty(i.length) || A(`Function '${n}' called with an invalid number of arguments (${i.length}) - expects one of (${e[r].overloadTable})!`), e[r].overloadTable[i.length].apply(this, i);
        }, e[r].overloadTable = [], e[r].overloadTable[a.argCount] = a;
      }
    }, Me = (e, r, n) => {
      t.hasOwnProperty(e) ? ((n === void 0 || t[e].overloadTable !== void 0 && t[e].overloadTable[n] !== void 0) && A(`Cannot register public name '${e}' twice`), Gr(t, e, e), t[e].overloadTable.hasOwnProperty(n) && A(`Cannot register multiple overloads of a function with the same number of arguments (${n})!`), t[e].overloadTable[n] = r) : (t[e] = r, t[e].argCount = n);
    }, Br = (e, r, n) => {
      switch (r) {
        case 1:
          return n ? function(a) {
            return this.fromWireType(O[a]);
          } : function(a) {
            return this.fromWireType(g[a]);
          };
        case 2:
          return n ? function(a) {
            return this.fromWireType(F[a >> 1]);
          } : function(a) {
            return this.fromWireType(k[a >> 1]);
          };
        case 4:
          return n ? function(a) {
            return this.fromWireType(D[a >> 2]);
          } : function(a) {
            return this.fromWireType(h[a >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${r}): ${e}`);
      }
    }, br = (e, r, n, a) => {
      r = S(r);
      function i() {
      }
      i.values = {}, T(e, { name: r, constructor: i, fromWireType: function(s) {
        return this.constructor.values[s];
      }, toWireType: (s, l) => l.value, argPackAdvance: W, readValueFromPointer: Br(r, n, a), destructorFunction: null }), Me(r, i);
    }, q = (e, r) => Object.defineProperty(r, "name", { value: e }), Re = (e) => {
      var r = Le(e), n = S(r);
      return b(r), n;
    }, Fe = (e, r) => {
      var n = M[e];
      return n === void 0 && A(`${r} has unknown type ${Re(e)}`), n;
    }, xr = (e, r, n) => {
      var a = Fe(e, "enum");
      r = S(r);
      var i = a.constructor, s = Object.create(a.constructor.prototype, { value: { value: n }, constructor: { value: q(`${a.name}_${r}`, function() {
      }) } });
      i.values[n] = s, i[r] = s;
    }, wr = (e, r) => {
      switch (r) {
        case 4:
          return function(n) {
            return this.fromWireType(ce[n >> 2]);
          };
        case 8:
          return function(n) {
            return this.fromWireType(He[n >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${r}): ${e}`);
      }
    }, Er = (e, r, n) => {
      r = S(r), T(e, { name: r, fromWireType: (a) => a, toWireType: (a, i) => i, argPackAdvance: W, readValueFromPointer: wr(r, n), destructorFunction: null });
    };
    function Mr(e) {
      for (var r = 1; r < e.length; ++r)
        if (e[r] !== null && e[r].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Rr = { ftf: function(e, r, n, a, i, s, l) {
      return function() {
        var _ = n(a), u = s.fromWireType(_);
        return u;
      };
    }, ftfn: function(e, r, n, a, i, s, l, _) {
      return function(u) {
        var d = _.toWireType(null, u), P = n(a, d), f = s.fromWireType(P);
        return f;
      };
    }, fffn: function(e, r, n, a, i, s, l, _) {
      return function(u) {
        var d = _.toWireType(null, u);
        n(a, d);
      };
    }, ftfnnnn: function(e, r, n, a, i, s, l, _, u, d, P) {
      return function(f, c, v, y) {
        var p = _.toWireType(null, f), H = u.toWireType(null, c), C = d.toWireType(null, v), m = P.toWireType(null, y), G = n(a, p, H, C, m), w = s.fromWireType(G);
        return w;
      };
    }, ftfnn: function(e, r, n, a, i, s, l, _, u) {
      return function(d, P) {
        var f = _.toWireType(null, d), c = u.toWireType(null, P), v = n(a, f, c), y = s.fromWireType(v);
        return y;
      };
    }, ftftt: function(e, r, n, a, i, s, l, _, u, d, P) {
      return function(f, c) {
        var v = _.toWireType(null, f), y = u.toWireType(null, c), p = n(a, v, y);
        d(v), P(y);
        var H = s.fromWireType(p);
        return H;
      };
    }, ftft: function(e, r, n, a, i, s, l, _, u) {
      return function(d) {
        var P = _.toWireType(null, d), f = n(a, P);
        u(P);
        var c = s.fromWireType(f);
        return c;
      };
    }, ftftn: function(e, r, n, a, i, s, l, _, u, d) {
      return function(P, f) {
        var c = _.toWireType(null, P), v = u.toWireType(null, f), y = n(a, c, v);
        d(c);
        var p = s.fromWireType(y);
        return p;
      };
    }, ftftnn: function(e, r, n, a, i, s, l, _, u, d, P) {
      return function(f, c, v) {
        var y = _.toWireType(null, f), p = u.toWireType(null, c), H = d.toWireType(null, v), C = n(a, y, p, H);
        P(y);
        var m = s.fromWireType(C);
        return m;
      };
    }, ftfttn: function(e, r, n, a, i, s, l, _, u, d, P, f) {
      return function(c, v, y) {
        var p = _.toWireType(null, c), H = u.toWireType(null, v), C = d.toWireType(null, y), m = n(a, p, H, C);
        P(p), f(H);
        var G = s.fromWireType(m);
        return G;
      };
    }, ftfttt: function(e, r, n, a, i, s, l, _, u, d, P, f, c) {
      return function(v, y, p) {
        var H = _.toWireType(null, v), C = u.toWireType(null, y), m = d.toWireType(null, p), G = n(a, H, C, m);
        P(H), f(C), c(m);
        var w = s.fromWireType(G);
        return w;
      };
    }, ftfnntn: function(e, r, n, a, i, s, l, _, u, d, P, f) {
      return function(c, v, y, p) {
        var H = _.toWireType(null, c), C = u.toWireType(null, v), m = d.toWireType(null, y), G = P.toWireType(null, p), w = n(a, H, C, m, G);
        f(m);
        var z = s.fromWireType(w);
        return z;
      };
    }, ftftttt: function(e, r, n, a, i, s, l, _, u, d, P, f, c, v, y) {
      return function(p, H, C, m) {
        var G = _.toWireType(null, p), w = u.toWireType(null, H), z = d.toWireType(null, C), Ke = P.toWireType(null, m), Mt = n(a, G, w, z, Ke);
        f(G), c(w), v(z), y(Ke);
        var Rt = s.fromWireType(Mt);
        return Rt;
      };
    } };
    function Fr(e, r, n, a) {
      const i = [r ? "t" : "f", n ? "t" : "f", a ? "t" : "f"];
      for (let s = r ? 1 : 2; s < e.length; ++s) {
        const l = e[s];
        let _ = "";
        l.destructorFunction === void 0 ? _ = "u" : l.destructorFunction === null ? _ = "n" : _ = "t", i.push(_);
      }
      return i.join("");
    }
    function Dr(e, r, n, a, i, s) {
      var l = r.length;
      l < 2 && A("argTypes array size mismatch! Must at least get return value and 'this' types!");
      for (var _ = r[1] !== null && n !== null, u = Mr(r), d = r[0].name !== "void", P = [e, A, a, i, ne, r[0], r[1]], f = 0; f < l - 2; ++f)
        P.push(r[f + 2]);
      if (!u)
        for (var f = _ ? 1 : 2; f < r.length; ++f)
          r[f].destructorFunction !== null && P.push(r[f].destructorFunction);
      var c = Fr(r, _, d, s), v = Rr[c](...P);
      return q(e, v);
    }
    var Ir = (e, r) => {
      for (var n = [], a = 0; a < e; a++)
        n.push(h[r + a * 4 >> 2]);
      return n;
    }, kr = (e, r, n) => {
      t.hasOwnProperty(e) || Be("Replacing nonexistent public symbol"), t[e].overloadTable !== void 0 && n !== void 0 ? t[e].overloadTable[n] = r : (t[e] = r, t[e].argCount = n);
    }, Y = [], De, Ur = (e) => {
      var r = Y[e];
      return r || (e >= Y.length && (Y.length = e + 1), Y[e] = r = De.get(e)), r;
    }, N = (e, r) => {
      e = S(e);
      function n() {
        return Ur(r);
      }
      var a = n();
      return typeof a != "function" && A(`unknown function pointer with signature ${e}: ${r}`), a;
    }, Vr = (e, r) => {
      var n = q(r, function(a) {
        this.name = r, this.message = a;
        var i = new Error(a).stack;
        i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return n.prototype = Object.create(e.prototype), n.prototype.constructor = n, n.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, n;
    }, Ie, Nr = (e, r) => {
      var n = [], a = {};
      function i(s) {
        if (!a[s] && !M[s]) {
          if (X[s]) {
            X[s].forEach(i);
            return;
          }
          n.push(s), a[s] = !0;
        }
      }
      throw r.forEach(i), new Ie(`${e}: ` + n.map(Re).join([", "]));
    }, Qr = (e) => {
      e = e.trim();
      const r = e.indexOf("(");
      return r !== -1 ? e.substr(0, r) : e;
    }, $r = (e, r, n, a, i, s, l, _) => {
      var u = Ir(r, n);
      e = S(e), e = Qr(e), i = N(a, i), Me(e, function() {
        Nr(`Cannot call ${e} due to unbound types`, u);
      }, r - 1), be([], u, (d) => {
        var P = [d[0], null].concat(d.slice(1));
        return kr(e, Dr(e, P, null, i, s, l), r - 1), [];
      });
    }, Lr = (e, r, n, a, i) => {
      r = S(r);
      var s = (P) => P;
      if (a === 0) {
        var l = 32 - 8 * n;
        s = (P) => P << l >>> l;
      }
      var _ = r.includes("unsigned"), u = (P, f) => {
      }, d;
      _ ? d = function(P, f) {
        return u(f, this.name), f >>> 0;
      } : d = function(P, f) {
        return u(f, this.name), f;
      }, T(e, { name: r, fromWireType: s, toWireType: d, argPackAdvance: W, readValueFromPointer: Ee(r, n, a !== 0), destructorFunction: null });
    }, Or = (e, r, n) => {
      var a = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], i = a[r];
      function s(l) {
        var _ = h[l >> 2], u = h[l + 4 >> 2];
        return new i(O.buffer, u, _);
      }
      n = S(n), T(e, { name: n, fromWireType: s, argPackAdvance: W, readValueFromPointer: s }, { ignoreDuplicateRegistrations: !0 });
    }, jr = (e, r, n, a) => {
      if (!(a > 0))
        return 0;
      for (var i = n, s = n + a - 1, l = 0; l < e.length; ++l) {
        var _ = e.charCodeAt(l);
        if (_ >= 55296 && _ <= 57343) {
          var u = e.charCodeAt(++l);
          _ = 65536 + ((_ & 1023) << 10) | u & 1023;
        }
        if (_ <= 127) {
          if (n >= s)
            break;
          r[n++] = _;
        } else if (_ <= 2047) {
          if (n + 1 >= s)
            break;
          r[n++] = 192 | _ >> 6, r[n++] = 128 | _ & 63;
        } else if (_ <= 65535) {
          if (n + 2 >= s)
            break;
          r[n++] = 224 | _ >> 12, r[n++] = 128 | _ >> 6 & 63, r[n++] = 128 | _ & 63;
        } else {
          if (n + 3 >= s)
            break;
          r[n++] = 240 | _ >> 18, r[n++] = 128 | _ >> 12 & 63, r[n++] = 128 | _ >> 6 & 63, r[n++] = 128 | _ & 63;
        }
      }
      return r[n] = 0, n - i;
    }, Jr = (e, r, n) => jr(e, g, r, n), Kr = (e) => {
      for (var r = 0, n = 0; n < e.length; ++n) {
        var a = e.charCodeAt(n);
        a <= 127 ? r++ : a <= 2047 ? r += 2 : a >= 55296 && a <= 57343 ? (r += 4, ++n) : r += 3;
      }
      return r;
    }, ke = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Ue = (e, r = 0, n = NaN) => {
      for (var a = r + n, i = r; e[i] && !(i >= a); )
        ++i;
      if (i - r > 16 && e.buffer && ke)
        return ke.decode(e.subarray(r, i));
      for (var s = ""; r < i; ) {
        var l = e[r++];
        if (!(l & 128)) {
          s += String.fromCharCode(l);
          continue;
        }
        var _ = e[r++] & 63;
        if ((l & 224) == 192) {
          s += String.fromCharCode((l & 31) << 6 | _);
          continue;
        }
        var u = e[r++] & 63;
        if ((l & 240) == 224 ? l = (l & 15) << 12 | _ << 6 | u : l = (l & 7) << 18 | _ << 12 | u << 6 | e[r++] & 63, l < 65536)
          s += String.fromCharCode(l);
        else {
          var d = l - 65536;
          s += String.fromCharCode(55296 | d >> 10, 56320 | d & 1023);
        }
      }
      return s;
    }, Xr = (e, r) => e ? Ue(g, e, r) : "", qr = (e, r) => {
      r = S(r);
      var n = r === "std::string";
      T(e, { name: r, fromWireType(a) {
        var i = h[a >> 2], s = a + 4, l;
        if (n)
          for (var _ = s, u = 0; u <= i; ++u) {
            var d = s + u;
            if (u == i || g[d] == 0) {
              var P = d - _, f = Xr(_, P);
              l === void 0 ? l = f : (l += String.fromCharCode(0), l += f), _ = d + 1;
            }
          }
        else {
          for (var c = new Array(i), u = 0; u < i; ++u)
            c[u] = String.fromCharCode(g[s + u]);
          l = c.join("");
        }
        return b(a), l;
      }, toWireType(a, i) {
        i instanceof ArrayBuffer && (i = new Uint8Array(i));
        var s, l = typeof i == "string";
        l || i instanceof Uint8Array || i instanceof Uint8ClampedArray || i instanceof Int8Array || A("Cannot pass non-string to std::string"), n && l ? s = Kr(i) : s = i.length;
        var _ = _e(4 + s + 1), u = _ + 4;
        if (h[_ >> 2] = s, n && l)
          Jr(i, u, s + 1);
        else if (l)
          for (var d = 0; d < s; ++d) {
            var P = i.charCodeAt(d);
            P > 255 && (b(u), A("String has UTF-16 code units that do not fit in 8 bits")), g[u + d] = P;
          }
        else
          for (var d = 0; d < s; ++d)
            g[u + d] = i[d];
        return a !== null && a.push(b, _), _;
      }, argPackAdvance: W, readValueFromPointer: K, destructorFunction(a) {
        b(a);
      } });
    }, Ve = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Yr = (e, r) => {
      for (var n = e, a = n >> 1, i = a + r / 2; !(a >= i) && k[a]; )
        ++a;
      if (n = a << 1, n - e > 32 && Ve)
        return Ve.decode(g.subarray(e, n));
      for (var s = "", l = 0; !(l >= r / 2); ++l) {
        var _ = F[e + l * 2 >> 1];
        if (_ == 0)
          break;
        s += String.fromCharCode(_);
      }
      return s;
    }, Zr = (e, r, n) => {
      if (n ?? (n = 2147483647), n < 2)
        return 0;
      n -= 2;
      for (var a = r, i = n < e.length * 2 ? n / 2 : e.length, s = 0; s < i; ++s) {
        var l = e.charCodeAt(s);
        F[r >> 1] = l, r += 2;
      }
      return F[r >> 1] = 0, r - a;
    }, zr = (e) => e.length * 2, et = (e, r) => {
      for (var n = 0, a = ""; !(n >= r / 4); ) {
        var i = D[e + n * 4 >> 2];
        if (i == 0)
          break;
        if (++n, i >= 65536) {
          var s = i - 65536;
          a += String.fromCharCode(55296 | s >> 10, 56320 | s & 1023);
        } else
          a += String.fromCharCode(i);
      }
      return a;
    }, rt = (e, r, n) => {
      if (n ?? (n = 2147483647), n < 4)
        return 0;
      for (var a = r, i = a + n - 4, s = 0; s < e.length; ++s) {
        var l = e.charCodeAt(s);
        if (l >= 55296 && l <= 57343) {
          var _ = e.charCodeAt(++s);
          l = 65536 + ((l & 1023) << 10) | _ & 1023;
        }
        if (D[r >> 2] = l, r += 4, r + 4 > i)
          break;
      }
      return D[r >> 2] = 0, r - a;
    }, tt = (e) => {
      for (var r = 0, n = 0; n < e.length; ++n) {
        var a = e.charCodeAt(n);
        a >= 55296 && a <= 57343 && ++n, r += 4;
      }
      return r;
    }, nt = (e, r, n) => {
      n = S(n);
      var a, i, s, l;
      r === 2 ? (a = Yr, i = Zr, l = zr, s = (_) => k[_ >> 1]) : r === 4 && (a = et, i = rt, l = tt, s = (_) => h[_ >> 2]), T(e, { name: n, fromWireType: (_) => {
        for (var u = h[_ >> 2], d, P = _ + 4, f = 0; f <= u; ++f) {
          var c = _ + 4 + f * r;
          if (f == u || s(c) == 0) {
            var v = c - P, y = a(P, v);
            d === void 0 ? d = y : (d += String.fromCharCode(0), d += y), P = c + r;
          }
        }
        return b(_), d;
      }, toWireType: (_, u) => {
        typeof u != "string" && A(`Cannot pass non-string to C++ string type ${n}`);
        var d = l(u), P = _e(4 + d + r);
        return h[P >> 2] = d / r, i(u, P + 4, d + r), _ !== null && _.push(b, P), P;
      }, argPackAdvance: W, readValueFromPointer: K, destructorFunction(_) {
        b(_);
      } });
    }, at = (e, r, n, a, i, s) => {
      J[e] = { name: S(r), rawConstructor: N(n, a), rawDestructor: N(i, s), elements: [] };
    }, ot = (e, r, n, a, i, s, l, _, u) => {
      J[e].elements.push({ getterReturnType: r, getter: N(n, a), getterContext: i, setterArgumentType: s, setter: N(l, _), setterContext: u });
    }, it = (e, r) => {
      r = S(r), T(e, { isVoid: !0, name: r, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (n, a) => {
      } });
    }, _t = 1, st = () => _t, lt = {}, ut = (e) => {
      var r = lt[e];
      return r === void 0 ? S(e) : r;
    }, ie = [], dt = (e, r, n, a, i) => (e = ie[e], r = V.toValue(r), n = ut(n), e(r, r[n], a, i)), Pt = (e) => {
      var r = ie.length;
      return ie.push(e), r;
    }, ft = (e, r) => {
      for (var n = new Array(e), a = 0; a < e; ++a)
        n[a] = Fe(h[r + a * 4 >> 2], "parameter " + a);
      return n;
    }, ct = Reflect.construct, vt = (e, r, n) => {
      var a = [], i = e.toWireType(a, n);
      return a.length && (h[r >> 2] = V.toHandle(a)), i;
    }, yt = (e, r, n) => {
      var a = ft(e, r), i = a.shift();
      e--;
      var s = new Array(e), l = (u, d, P, f) => {
        for (var c = 0, v = 0; v < e; ++v)
          s[v] = a[v].readValueFromPointer(f + c), c += a[v].argPackAdvance;
        var y = n === 1 ? ct(d, s) : d.apply(u, s);
        return vt(i, P, y);
      }, _ = `methodCaller<(${a.map((u) => u.name).join(", ")}) => ${i.name}>`;
      return Pt(q(_, l));
    }, Ht = (e) => {
      var r = V.toValue(e);
      ne(r), oe(e);
    }, pt = () => Date.now(), Ne = () => 2147483648, ht = () => Ne(), mt = () => performance.now(), gt = (e, r) => Math.ceil(e / r) * r, St = (e) => {
      var r = L.buffer, n = (e - r.byteLength + 65535) / 65536 | 0;
      try {
        return L.grow(n), pe(), 1;
      } catch {
      }
    }, Ct = (e) => {
      var r = g.length;
      e >>>= 0;
      var n = Ne();
      if (e > n)
        return !1;
      for (var a = 1; a <= 4; a *= 2) {
        var i = r * (1 + 0.2 / a);
        i = Math.min(i, e + 100663296);
        var s = Math.min(n, gt(Math.max(e, i), 65536)), l = St(s);
        if (l)
          return !0;
      }
      return !1;
    }, At = [null, [], []], Tt = (e, r) => {
      var n = At[e];
      r === 0 || r === 10 ? ((e === 1 ? Ze : R)(Ue(n)), n.length = 0) : n.push(r);
    }, Wt = (e, r, n, a) => {
      for (var i = 0, s = 0; s < n; s++) {
        var l = h[r >> 2], _ = h[r + 4 >> 2];
        r += 8;
        for (var u = 0; u < _; u++)
          Tt(e, g[l + u]);
        i += _;
      }
      return h[a >> 2] = i, 0;
    }, Gt = 0, Bt = () => vr || Gt > 0, bt = (e) => {
      var r;
      re = e, Bt() || ((r = t.onExit) == null || r.call(t, e), ee = !0), Pe(e, new We(e));
    }, xt = (e, r) => {
      re = e, bt(e);
    }, wt = (e) => {
      if (e instanceof We || e == "unwind")
        return re;
      Pe(1, e);
    };
    Ge = t.InternalError = class extends Error {
      constructor(r) {
        super(r), this.name = "InternalError";
      }
    }, hr(), we = t.BindingError = class extends Error {
      constructor(r) {
        super(r), this.name = "BindingError";
      }
    }, Ar(), Ie = t.UnboundTypeError = Vr(Error, "UnboundTypeError");
    var Qe = { _abort_js: yr, _embind_finalize_value_array: Hr, _embind_register_bigint: gr, _embind_register_bool: Sr, _embind_register_emval: Wr, _embind_register_enum: br, _embind_register_enum_value: xr, _embind_register_float: Er, _embind_register_function: $r, _embind_register_integer: Lr, _embind_register_memory_view: Or, _embind_register_std_string: qr, _embind_register_std_wstring: nt, _embind_register_value_array: at, _embind_register_value_array_element: ot, _embind_register_void: it, _emscripten_get_now_is_monotonic: st, _emval_call_method: dt, _emval_decref: oe, _emval_get_method_caller: yt, _emval_run_destructors: Ht, emscripten_date_now: pt, emscripten_get_heap_max: ht, emscripten_get_now: mt, emscripten_resize_heap: Ct, fd_write: Wt }, o = cr();
    t._HP_GetStatistics = (e) => (t._HP_GetStatistics = o.HP_GetStatistics)(e), t._HP_Shape_CreateSphere = (e, r, n) => (t._HP_Shape_CreateSphere = o.HP_Shape_CreateSphere)(e, r, n), t._HP_Shape_CreateCapsule = (e, r, n, a) => (t._HP_Shape_CreateCapsule = o.HP_Shape_CreateCapsule)(e, r, n, a), t._HP_Shape_CreateCylinder = (e, r, n, a) => (t._HP_Shape_CreateCylinder = o.HP_Shape_CreateCylinder)(e, r, n, a), t._HP_Shape_CreateBox = (e, r, n, a) => (t._HP_Shape_CreateBox = o.HP_Shape_CreateBox)(e, r, n, a), t._HP_Shape_CreateConvexHull = (e, r, n) => (t._HP_Shape_CreateConvexHull = o.HP_Shape_CreateConvexHull)(e, r, n), t._HP_Shape_CreateMesh = (e, r, n, a, i) => (t._HP_Shape_CreateMesh = o.HP_Shape_CreateMesh)(e, r, n, a, i), t._HP_Shape_CreateHeightField = (e, r, n, a, i) => (t._HP_Shape_CreateHeightField = o.HP_Shape_CreateHeightField)(e, r, n, a, i), t._HP_Shape_CreateContainer = (e) => (t._HP_Shape_CreateContainer = o.HP_Shape_CreateContainer)(e), t._HP_Shape_Release = (e) => (t._HP_Shape_Release = o.HP_Shape_Release)(e), t._HP_Shape_GetType = (e, r) => (t._HP_Shape_GetType = o.HP_Shape_GetType)(e, r), t._HP_Shape_AddChild = (e, r, n) => (t._HP_Shape_AddChild = o.HP_Shape_AddChild)(e, r, n), t._HP_Shape_RemoveChild = (e, r) => (t._HP_Shape_RemoveChild = o.HP_Shape_RemoveChild)(e, r), t._HP_Shape_GetNumChildren = (e, r) => (t._HP_Shape_GetNumChildren = o.HP_Shape_GetNumChildren)(e, r), t._HP_Shape_GetChildShape = (e, r, n) => (t._HP_Shape_GetChildShape = o.HP_Shape_GetChildShape)(e, r, n), t._HP_Shape_SetChildQSTransform = (e, r, n) => (t._HP_Shape_SetChildQSTransform = o.HP_Shape_SetChildQSTransform)(e, r, n), t._HP_Shape_GetChildQSTransform = (e, r, n) => (t._HP_Shape_GetChildQSTransform = o.HP_Shape_GetChildQSTransform)(e, r, n), t._HP_Shape_SetFilterInfo = (e, r) => (t._HP_Shape_SetFilterInfo = o.HP_Shape_SetFilterInfo)(e, r), t._HP_Shape_GetFilterInfo = (e, r) => (t._HP_Shape_GetFilterInfo = o.HP_Shape_GetFilterInfo)(e, r), t._HP_Shape_SetMaterial = (e, r) => (t._HP_Shape_SetMaterial = o.HP_Shape_SetMaterial)(e, r), t._HP_Shape_GetMaterial = (e, r) => (t._HP_Shape_GetMaterial = o.HP_Shape_GetMaterial)(e, r), t._HP_Shape_SetDensity = (e, r) => (t._HP_Shape_SetDensity = o.HP_Shape_SetDensity)(e, r), t._HP_Shape_GetDensity = (e, r) => (t._HP_Shape_GetDensity = o.HP_Shape_GetDensity)(e, r), t._HP_Shape_GetBoundingBox = (e, r, n) => (t._HP_Shape_GetBoundingBox = o.HP_Shape_GetBoundingBox)(e, r, n), t._HP_Shape_CastRay = (e, r, n, a, i) => (t._HP_Shape_CastRay = o.HP_Shape_CastRay)(e, r, n, a, i), t._HP_Shape_BuildMassProperties = (e, r) => (t._HP_Shape_BuildMassProperties = o.HP_Shape_BuildMassProperties)(e, r), t._HP_ShapePathIterator_GetNext = (e, r, n) => (t._HP_ShapePathIterator_GetNext = o.HP_ShapePathIterator_GetNext)(e, r, n), t._HP_Shape_SetTrigger = (e, r) => (t._HP_Shape_SetTrigger = o.HP_Shape_SetTrigger)(e, r), t._HP_Shape_CreateDebugDisplayGeometry = (e, r) => (t._HP_Shape_CreateDebugDisplayGeometry = o.HP_Shape_CreateDebugDisplayGeometry)(e, r), t._HP_DebugGeometry_GetInfo = (e, r) => (t._HP_DebugGeometry_GetInfo = o.HP_DebugGeometry_GetInfo)(e, r), t._HP_DebugGeometry_Release = (e) => (t._HP_DebugGeometry_Release = o.HP_DebugGeometry_Release)(e), t._HP_Body_Create = (e) => (t._HP_Body_Create = o.HP_Body_Create)(e), t._HP_Body_Release = (e) => (t._HP_Body_Release = o.HP_Body_Release)(e), t._HP_Body_SetShape = (e, r) => (t._HP_Body_SetShape = o.HP_Body_SetShape)(e, r), t._HP_Body_GetShape = (e, r) => (t._HP_Body_GetShape = o.HP_Body_GetShape)(e, r), t._HP_Body_SetMotionType = (e, r) => (t._HP_Body_SetMotionType = o.HP_Body_SetMotionType)(e, r), t._HP_Body_GetMotionType = (e, r) => (t._HP_Body_GetMotionType = o.HP_Body_GetMotionType)(e, r), t._HP_Body_SetEventMask = (e, r) => (t._HP_Body_SetEventMask = o.HP_Body_SetEventMask)(e, r), t._HP_Body_GetEventMask = (e, r) => (t._HP_Body_GetEventMask = o.HP_Body_GetEventMask)(e, r), t._HP_Body_SetMassProperties = (e, r) => (t._HP_Body_SetMassProperties = o.HP_Body_SetMassProperties)(e, r), t._HP_Body_GetMassProperties = (e, r) => (t._HP_Body_GetMassProperties = o.HP_Body_GetMassProperties)(e, r), t._HP_Body_SetLinearDamping = (e, r) => (t._HP_Body_SetLinearDamping = o.HP_Body_SetLinearDamping)(e, r), t._HP_Body_GetLinearDamping = (e, r) => (t._HP_Body_GetLinearDamping = o.HP_Body_GetLinearDamping)(e, r), t._HP_Body_SetAngularDamping = (e, r) => (t._HP_Body_SetAngularDamping = o.HP_Body_SetAngularDamping)(e, r), t._HP_Body_GetAngularDamping = (e, r) => (t._HP_Body_GetAngularDamping = o.HP_Body_GetAngularDamping)(e, r), t._HP_Body_SetGravityFactor = (e, r) => (t._HP_Body_SetGravityFactor = o.HP_Body_SetGravityFactor)(e, r), t._HP_Body_GetGravityFactor = (e, r) => (t._HP_Body_GetGravityFactor = o.HP_Body_GetGravityFactor)(e, r), t._HP_Body_GetWorld = (e, r) => (t._HP_Body_GetWorld = o.HP_Body_GetWorld)(e, r), t._HP_Body_SetPosition = (e, r) => (t._HP_Body_SetPosition = o.HP_Body_SetPosition)(e, r), t._HP_Body_GetPosition = (e, r) => (t._HP_Body_GetPosition = o.HP_Body_GetPosition)(e, r), t._HP_Body_SetOrientation = (e, r) => (t._HP_Body_SetOrientation = o.HP_Body_SetOrientation)(e, r), t._HP_Body_GetOrientation = (e, r) => (t._HP_Body_GetOrientation = o.HP_Body_GetOrientation)(e, r), t._HP_Body_SetQTransform = (e, r) => (t._HP_Body_SetQTransform = o.HP_Body_SetQTransform)(e, r), t._HP_Body_GetWorldTransformOffset = (e, r) => (t._HP_Body_GetWorldTransformOffset = o.HP_Body_GetWorldTransformOffset)(e, r), t._HP_Body_GetQTransform = (e, r) => (t._HP_Body_GetQTransform = o.HP_Body_GetQTransform)(e, r), t._HP_Body_SetLinearVelocity = (e, r) => (t._HP_Body_SetLinearVelocity = o.HP_Body_SetLinearVelocity)(e, r), t._HP_Body_GetLinearVelocity = (e, r) => (t._HP_Body_GetLinearVelocity = o.HP_Body_GetLinearVelocity)(e, r), t._HP_Body_SetAngularVelocity = (e, r) => (t._HP_Body_SetAngularVelocity = o.HP_Body_SetAngularVelocity)(e, r), t._HP_Body_GetAngularVelocity = (e, r) => (t._HP_Body_GetAngularVelocity = o.HP_Body_GetAngularVelocity)(e, r), t._HP_Body_ApplyImpulse = (e, r, n) => (t._HP_Body_ApplyImpulse = o.HP_Body_ApplyImpulse)(e, r, n), t._HP_Body_ApplyAngularImpulse = (e, r) => (t._HP_Body_ApplyAngularImpulse = o.HP_Body_ApplyAngularImpulse)(e, r), t._HP_Body_SetTargetQTransform = (e, r) => (t._HP_Body_SetTargetQTransform = o.HP_Body_SetTargetQTransform)(e, r), t._HP_Body_SetActivationState = (e, r) => (t._HP_Body_SetActivationState = o.HP_Body_SetActivationState)(e, r), t._HP_Body_GetActivationState = (e, r) => (t._HP_Body_GetActivationState = o.HP_Body_GetActivationState)(e, r), t._HP_Body_SetActivationControl = (e, r) => (t._HP_Body_SetActivationControl = o.HP_Body_SetActivationControl)(e, r), t._HP_Body_SetActivationPriority = (e, r) => (t._HP_Body_SetActivationPriority = o.HP_Body_SetActivationPriority)(e, r), t._HP_Constraint_Create = (e) => (t._HP_Constraint_Create = o.HP_Constraint_Create)(e), t._HP_Constraint_Release = (e) => (t._HP_Constraint_Release = o.HP_Constraint_Release)(e), t._HP_Constraint_SetParentBody = (e, r) => (t._HP_Constraint_SetParentBody = o.HP_Constraint_SetParentBody)(e, r), t._HP_Constraint_GetParentBody = (e, r) => (t._HP_Constraint_GetParentBody = o.HP_Constraint_GetParentBody)(e, r), t._HP_Constraint_SetChildBody = (e, r) => (t._HP_Constraint_SetChildBody = o.HP_Constraint_SetChildBody)(e, r), t._HP_Constraint_GetChildBody = (e, r) => (t._HP_Constraint_GetChildBody = o.HP_Constraint_GetChildBody)(e, r), t._HP_Constraint_SetAnchorInParent = (e, r, n, a) => (t._HP_Constraint_SetAnchorInParent = o.HP_Constraint_SetAnchorInParent)(e, r, n, a), t._HP_Constraint_SetAnchorInChild = (e, r, n, a) => (t._HP_Constraint_SetAnchorInChild = o.HP_Constraint_SetAnchorInChild)(e, r, n, a), t._HP_Constraint_SetCollisionsEnabled = (e, r) => (t._HP_Constraint_SetCollisionsEnabled = o.HP_Constraint_SetCollisionsEnabled)(e, r), t._HP_Constraint_GetCollisionsEnabled = (e, r) => (t._HP_Constraint_GetCollisionsEnabled = o.HP_Constraint_GetCollisionsEnabled)(e, r), t._HP_Constraint_GetAppliedImpulses = (e, r, n) => (t._HP_Constraint_GetAppliedImpulses = o.HP_Constraint_GetAppliedImpulses)(e, r, n), t._HP_Constraint_SetEnabled = (e, r) => (t._HP_Constraint_SetEnabled = o.HP_Constraint_SetEnabled)(e, r), t._HP_Constraint_GetEnabled = (e, r) => (t._HP_Constraint_GetEnabled = o.HP_Constraint_GetEnabled)(e, r), t._HP_Constraint_SetAxisMinLimit = (e, r, n) => (t._HP_Constraint_SetAxisMinLimit = o.HP_Constraint_SetAxisMinLimit)(e, r, n), t._HP_Constraint_GetAxisMinLimit = (e, r, n) => (t._HP_Constraint_GetAxisMinLimit = o.HP_Constraint_GetAxisMinLimit)(e, r, n), t._HP_Constraint_SetAxisMaxLimit = (e, r, n) => (t._HP_Constraint_SetAxisMaxLimit = o.HP_Constraint_SetAxisMaxLimit)(e, r, n), t._HP_Constraint_GetAxisMaxLimit = (e, r, n) => (t._HP_Constraint_GetAxisMaxLimit = o.HP_Constraint_GetAxisMaxLimit)(e, r, n), t._HP_Constraint_GetAxisMode = (e, r, n) => (t._HP_Constraint_GetAxisMode = o.HP_Constraint_GetAxisMode)(e, r, n), t._HP_Constraint_SetAxisMode = (e, r, n) => (t._HP_Constraint_SetAxisMode = o.HP_Constraint_SetAxisMode)(e, r, n), t._HP_Constraint_SetAxisFriction = (e, r, n) => (t._HP_Constraint_SetAxisFriction = o.HP_Constraint_SetAxisFriction)(e, r, n), t._HP_Constraint_GetAxisFriction = (e, r, n) => (t._HP_Constraint_GetAxisFriction = o.HP_Constraint_GetAxisFriction)(e, r, n), t._HP_Constraint_SetAxisMotorType = (e, r, n) => (t._HP_Constraint_SetAxisMotorType = o.HP_Constraint_SetAxisMotorType)(e, r, n), t._HP_Constraint_GetAxisMotorType = (e, r, n) => (t._HP_Constraint_GetAxisMotorType = o.HP_Constraint_GetAxisMotorType)(e, r, n), t._HP_Constraint_SetAxisMotorPositionTarget = (e, r, n) => (t._HP_Constraint_SetAxisMotorPositionTarget = o.HP_Constraint_SetAxisMotorPositionTarget)(e, r, n), t._HP_Constraint_GetAxisMotorPositionTarget = (e, r, n) => (t._HP_Constraint_GetAxisMotorPositionTarget = o.HP_Constraint_GetAxisMotorPositionTarget)(e, r, n), t._HP_Constraint_SetAxisMotorVelocityTarget = (e, r, n) => (t._HP_Constraint_SetAxisMotorVelocityTarget = o.HP_Constraint_SetAxisMotorVelocityTarget)(e, r, n), t._HP_Constraint_GetAxisMotorVelocityTarget = (e, r, n) => (t._HP_Constraint_GetAxisMotorVelocityTarget = o.HP_Constraint_GetAxisMotorVelocityTarget)(e, r, n), t._HP_Constraint_SetAxisMotorMaxForce = (e, r, n) => (t._HP_Constraint_SetAxisMotorMaxForce = o.HP_Constraint_SetAxisMotorMaxForce)(e, r, n), t._HP_Constraint_GetAxisMotorMaxForce = (e, r, n) => (t._HP_Constraint_GetAxisMotorMaxForce = o.HP_Constraint_GetAxisMotorMaxForce)(e, r, n), t._HP_Constraint_SetAxisMotorStiffness = (e, r, n) => (t._HP_Constraint_SetAxisMotorStiffness = o.HP_Constraint_SetAxisMotorStiffness)(e, r, n), t._HP_Constraint_GetAxisMotorStiffness = (e, r, n) => (t._HP_Constraint_GetAxisMotorStiffness = o.HP_Constraint_GetAxisMotorStiffness)(e, r, n), t._HP_Constraint_SetAxisMotorDamping = (e, r, n) => (t._HP_Constraint_SetAxisMotorDamping = o.HP_Constraint_SetAxisMotorDamping)(e, r, n), t._HP_Constraint_GetAxisMotorDamping = (e, r, n) => (t._HP_Constraint_GetAxisMotorDamping = o.HP_Constraint_GetAxisMotorDamping)(e, r, n), t._HP_Constraint_SetAxisStiffness = (e, r, n) => (t._HP_Constraint_SetAxisStiffness = o.HP_Constraint_SetAxisStiffness)(e, r, n), t._HP_Constraint_SetAxisDamping = (e, r, n) => (t._HP_Constraint_SetAxisDamping = o.HP_Constraint_SetAxisDamping)(e, r, n), t._HP_Constraint_SetAxisMotorTarget = (e, r, n) => (t._HP_Constraint_SetAxisMotorTarget = o.HP_Constraint_SetAxisMotorTarget)(e, r, n), t._HP_Constraint_GetAxisMotorTarget = (e, r, n) => (t._HP_Constraint_GetAxisMotorTarget = o.HP_Constraint_GetAxisMotorTarget)(e, r, n), t._HP_World_Create = (e) => (t._HP_World_Create = o.HP_World_Create)(e), t._HP_World_Release = (e) => (t._HP_World_Release = o.HP_World_Release)(e), t._HP_World_GetBodyBuffer = (e, r) => (t._HP_World_GetBodyBuffer = o.HP_World_GetBodyBuffer)(e, r), t._HP_World_SetGravity = (e, r) => (t._HP_World_SetGravity = o.HP_World_SetGravity)(e, r), t._HP_World_GetGravity = (e, r) => (t._HP_World_GetGravity = o.HP_World_GetGravity)(e, r), t._HP_World_AddBody = (e, r, n) => (t._HP_World_AddBody = o.HP_World_AddBody)(e, r, n), t._HP_World_RemoveBody = (e, r) => (t._HP_World_RemoveBody = o.HP_World_RemoveBody)(e, r), t._HP_World_GetNumBodies = (e, r) => (t._HP_World_GetNumBodies = o.HP_World_GetNumBodies)(e, r), t._HP_World_CastRayWithCollector = (e, r, n) => (t._HP_World_CastRayWithCollector = o.HP_World_CastRayWithCollector)(e, r, n), t._HP_World_PointProximityWithCollector = (e, r, n) => (t._HP_World_PointProximityWithCollector = o.HP_World_PointProximityWithCollector)(e, r, n), t._HP_World_ShapeProximityWithCollector = (e, r, n) => (t._HP_World_ShapeProximityWithCollector = o.HP_World_ShapeProximityWithCollector)(e, r, n), t._HP_World_ShapeCastWithCollector = (e, r, n) => (t._HP_World_ShapeCastWithCollector = o.HP_World_ShapeCastWithCollector)(e, r, n), t._HP_World_Step = (e, r) => (t._HP_World_Step = o.HP_World_Step)(e, r), t._HP_World_SetIdealStepTime = (e, r) => (t._HP_World_SetIdealStepTime = o.HP_World_SetIdealStepTime)(e, r), t._HP_World_SetSpeedLimit = (e, r, n) => (t._HP_World_SetSpeedLimit = o.HP_World_SetSpeedLimit)(e, r, n), t._HP_World_GetSpeedLimit = (e, r, n) => (t._HP_World_GetSpeedLimit = o.HP_World_GetSpeedLimit)(e, r, n), t._HP_World_GetNextCollisionEvent = (e, r) => (t._HP_World_GetNextCollisionEvent = o.HP_World_GetNextCollisionEvent)(e, r), t._HP_World_GetNextTriggerEvent = (e, r) => (t._HP_World_GetNextTriggerEvent = o.HP_World_GetNextTriggerEvent)(e, r), t._HP_QueryCollector_Create = (e, r) => (t._HP_QueryCollector_Create = o.HP_QueryCollector_Create)(e, r), t._HP_QueryCollector_Release = (e) => (t._HP_QueryCollector_Release = o.HP_QueryCollector_Release)(e), t._HP_QueryCollector_GetNumHits = (e, r) => (t._HP_QueryCollector_GetNumHits = o.HP_QueryCollector_GetNumHits)(e, r), t._HP_QueryCollector_GetCastRayResult = (e, r, n) => (t._HP_QueryCollector_GetCastRayResult = o.HP_QueryCollector_GetCastRayResult)(e, r, n), t._HP_QueryCollector_GetPointProximityResult = (e, r, n) => (t._HP_QueryCollector_GetPointProximityResult = o.HP_QueryCollector_GetPointProximityResult)(e, r, n), t._HP_QueryCollector_GetShapeProximityResult = (e, r, n) => (t._HP_QueryCollector_GetShapeProximityResult = o.HP_QueryCollector_GetShapeProximityResult)(e, r, n), t._HP_QueryCollector_GetShapeCastResult = (e, r, n) => (t._HP_QueryCollector_GetShapeCastResult = o.HP_QueryCollector_GetShapeCastResult)(e, r, n);
    var $e = t._main = (e, r) => ($e = t._main = o.main)(e, r), _e = (e) => (_e = o.malloc)(e), b = (e) => (b = o.free)(e);
    t._HP_Debug_StartRecordingStats = (e) => (t._HP_Debug_StartRecordingStats = o.HP_Debug_StartRecordingStats)(e), t._HP_Debug_StopRecordingStats = (e, r) => (t._HP_Debug_StopRecordingStats = o.HP_Debug_StopRecordingStats)(e, r);
    var Le = (e) => (Le = o.__getTypeName)(e), Z, Oe;
    U = function e() {
      Z || je(), Z || (U = e);
    };
    function Et() {
      var e = $e, r = 0, n = 0;
      try {
        var a = e(r, n);
        return xt(a, !0), a;
      } catch (i) {
        return wt(i);
      }
    }
    function je() {
      if (E > 0 || !Oe && (Oe = 1, er(), E > 0))
        return;
      function e() {
        var r;
        Z || (Z = 1, t.calledRun = 1, !ee && (rr(), tr(), ue(t), (r = t.onRuntimeInitialized) == null || r.call(t), Je && Et(), nr()));
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), e();
      }, 1)) : e();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    var Je = !0;
    return t.noInitialRun && (Je = !1), je(), le = qe, le;
  };
})();
export {
  Ft as H
};
