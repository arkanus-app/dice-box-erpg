import{PARTICLE_MOMENTS as b,p as S,c as F}from"../dice3dview.es.js";const z=(v,t,s)=>.299*v+.587*t+.114*s,y=v=>Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,"0"),T=(v,t)=>{const[s,e,i,r]=S(v)??[1,1,1,1],n=z(s,e,i),a=Math.max(.05,z(t[0],t[1],t[2])),l=h=>n<=a?h*n/a:h+(1-h)*(n-a)/Math.max(.001,1-a)*.75;return`#${y(l(t[0]))}${y(l(t[1]))}${y(l(t[2]))}${y(r)}`},P=new WeakMap,O=(v,t)=>{const s=t.size??1,e=t.moments??{};if(!t.color&&!t.shape&&s===1&&!Object.values(e).includes(false))return v;const i=JSON.stringify([t.color??"",t.shape??"",s,b.map(c=>e[c]!==false)]);let r=P.get(v);r||P.set(v,r=new Map);const n=r.get(i);if(n)return n;const a=t.color?S(t.color):null,l={};v.auraSeconds!==void 0&&(l.auraSeconds=v.auraSeconds);for(const c of b){const u=v[c];!u||e[c]===false||(l[c]={...u,size:[u.size[0]*s,u.size[1]*s],...t.shape?{shape:t.shape}:{},...a?{colors:u.colors.map(f=>T(f,a)),...u.palette?{palette:u.palette.map(f=>T(f,a))}:{}}:{}})}const h=Object.freeze(l);return r.set(i,h),h},_=`attribute vec2 aCorner;
attribute vec3 aPos;
attribute float aSize;
attribute vec4 aColor;
attribute float aShape;
attribute float aAngle;
uniform mat4 uViewProj;
uniform float uPixelScale;
uniform vec2 uViewport;
varying vec4 vColor;
varying float vShape;
varying vec3 vTurn;
varying vec2 vCoord;
void main() {
vec4 clip = uViewProj * vec4(aPos, 1.0);
float pixels = max(1.0, aSize * uPixelScale / clip.w);
clip.xy += aCorner * pixels / uViewport * clip.w;
gl_Position = clip;
vColor = aColor;
vShape = aShape;
vTurn = vec3(cos(aAngle), sin(aAngle), abs(cos(aAngle * 1.7 + 0.6)));
vCoord = vec2(aCorner.x, -aCorner.y);
}`,W=`precision mediump float;
varying vec4 vColor;
varying float vShape;
varying vec3 vTurn;
varying vec2 vCoord;
uniform float uAdditive;
void main() {
vec2 p = vCoord;
vec2 q = vec2(p.x * vTurn.x + p.y * vTurn.y, p.y * vTurn.x - p.x * vTurn.y);
float r2 = dot(p, p);
float a = 0.0;
float shade = 1.0;
if(vShape < 0.5) {
a = pow(max(0.0, 1.0 - r2), 1.5);
} else if(vShape < 1.5) {
float along = max(0.0, 1.0 - abs(q.x));
float across = q.y * 6.0;
a = along * sqrt(along) * max(0.0, 1.0 - across * across);
} else if(vShape < 2.5) {
float core = max(0.0, 1.0 - r2 * 5.0);
float rays = max(0.0, 1.0 - abs(q.y) * 10.0) * (1.0 - abs(q.x)) + max(0.0, 1.0 - abs(q.x) * 10.0) * (1.0 - abs(q.y));
a = min(1.0, core * core + rays);
} else if(vShape < 3.5) {
float band = max(0.0, 1.0 - abs(sqrt(r2) - 0.72) * 5.0);
a = band * band;
} else if(vShape < 4.5) {
vec2 s = abs(q) / vec2(0.85, max(0.08, 0.5 * vTurn.z));
a = 1.0 - smoothstep(0.8, 1.0, max(s.x, s.y));
shade = 0.55 + 0.45 * vTurn.z;
} else {
float angle = atan(q.y, q.x);
float lumps = 0.78 + 0.22 * sin(angle * 3.0) * sin(angle * 5.0 + 1.3);
a = pow(max(0.0, 1.0 - r2 / (lumps * lumps)), 1.4);
}
if(a <= 0.003) discard;
vec4 c = vColor * a;
c.rgb *= shade;
gl_FragColor = uAdditive > 0.5 ? vec4(c.rgb, 0.0) : c;
}`,p=4e3,A=10,q=(v,t)=>v==="max"?t.value===t.sides:v==="min"?t.value===1:v.includes(t.value),E={up:0,out:1,sphere:2,back:3},I={soft:0,spark:1,star:2,ring:3,confetti:4,smoke:5},R=1;class L{#s=0;#h=new Float32Array(p);#i=new Float32Array(p);#l=new Float32Array(p);#c=new Float32Array(p);#u=new Float32Array(p);#p=new Float32Array(p);#n=new Float32Array(p);#d=new Float32Array(p);#f=new Float32Array(p);#g=new Float32Array(p);#r=new Float32Array(p);#m=new Float32Array(p);#t=new Float32Array(p*3);#o=new Uint16Array(p);#e=[];#M=new Map;#b=new WeakMap;#I=new WeakMap;#F=new Float32Array(p*A);#z=new Float32Array(p*A);#y=new Uint32Array(p);#R=(t,s)=>this.#i[t]-this.#i[s];#x=F("particles");#a=null;#v=1;#A=0;#T=new WeakMap;#S=new WeakMap;get count(){return this.#s}get auraSeconds(){return this.#a?.aura?Math.max(0,this.#a.auraSeconds??2.5):0}get hasTrail(){return!!(this.#a?.trail||this.#a?.ground)}configure(t,s,e){this.#a=t,this.#v=Math.max(0,s),this.#x=F(`${e}:particles`),this.#S=new WeakMap,this.#s===0&&this.#e.length>48&&(this.#e.length=0,this.#M.clear())}clear(){this.#s=0}trail(t,s,e,i,r,n){const a=this.#a?.trail;if(!a||i<=0)return;const l=Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]);this.#w(a,n,t,void 0,l,true)&&this.#C(this.#b,t,a,a.amount*this.#v*Math.min(1.5,l/6)*i,s,e,r*.55)}ground(t,s,e,i,r,n){const a=this.#a?.ground;if(!a||i<=0)return;const l=Math.sqrt(e[0]*e[0]+e[2]*e[2]);this.#w(a,n,t,void 0,l,true)&&this.#C(this.#I,t,a,a.amount*this.#v*(l*i),[s[0],.012,s[2]],e,r*.3,true)}aura(t,s,e,i,r,n,a=false){const l=this.#a?.aura;!l||e<=0||r<=0||!a&&!this.#w(l,n,t,void 0,void 0,true)||this.#C(this.#b,t,l,l.amount*this.#v*r*e,s,[0,0,0],i*.6)}burst(t,s,e,i={}){const r=this.#a?.[t];if(!r||!i.always&&!this.#w(r,i.subject,i.key,i.force,void 0,false))return;const n=Math.round(r.amount*this.#v*Math.max(0,i.strength??1));n>0&&this.#E(this.#q(r),n,s,[0,0,0],e*(t==="impact"||t==="collision"?.35:.5),false)}#w(t,s,e,i,r,n){const a=t.when;if(!a)return true;if(a.minForce!==void 0&&i!==void 0&&i<a.minForce||a.minSpeed!==void 0&&r!==void 0&&r<a.minSpeed)return false;if(s&&(a.sides||a.faces!==void 0)){const l="sides"in s?[s]:s,h=a.faces;if(!l.some(c=>(!a.sides||a.sides.includes(c.sides))&&(h===void 0||q(h,c))))return false}if(a.chance!==void 0&&a.chance<1){if(n&&e){let l=this.#S.get(e);l||this.#S.set(e,l=new Map);let h=l.get(t);if(h===void 0&&l.set(t,h=this.#x.next()<a.chance),!h)return false}else if(this.#x.next()>=a.chance)return false}if(a.cooldown&&e&&!n){let l=this.#T.get(e);l||this.#T.set(e,l=new Map);const h=l.get(t);if(h!==void 0&&this.#A-h<a.cooldown)return false;l.set(t,this.#A)}return true}update(t){if(!(t<=0)){this.#A+=t;for(let s=0;s<this.#s;s++){const e=this.#n[s]+t;if(e>=this.#d[s]){this.#k(this.#s-1,s),this.#s--,s--;continue}this.#n[s]=e;const i=this.#e[this.#o[s]];let r=this.#c[s],n=this.#u[s]-i.gravity*t,a=this.#p[s];if(i.drag>0){const h=Math.max(0,1-i.drag*t);r*=h,n*=h,a*=h}if(i.swirl!==0){const h=i.swirl*t,c=Math.cos(h),u=Math.sin(h),f=r*c-a*u;a=r*u+a*c,r=f}let l=this.#i[s]+n*t;l<.012&&(l=.012,n<0&&(n*=-.25),r*=.7,a*=.7),this.#h[s]=this.#h[s]+r*t,this.#i[s]=l,this.#l[s]=this.#l[s]+a*t,this.#c[s]=r,this.#u[s]=n,this.#p[s]=a,i.shape===R&&r*r+a*a>.0025?this.#r[s]=Math.atan2(a,r):this.#r[s]=this.#r[s]+this.#m[s]*t}}}build(){let t=0,s=0,e=0;for(let i=0;i<this.#s;i++){const r=this.#e[this.#o[i]];r.additive?this.#P(this.#F,t*A,i,r)&&t++:this.#y[e++]=i}e>1&&this.#y.subarray(0,e).sort(this.#R);for(let i=0;i<e;i++){const r=this.#y[i];this.#P(this.#z,s*A,r,this.#e[this.#o[r]])&&s++}return{additive:this.#F,additiveCount:t,alpha:this.#z,alphaCount:s}}#P(t,s,e,i){const r=this.#n[e]/this.#d[e],n=i.stops,a=n.length/4-1,l=r*a,h=Math.min(a-1,Math.floor(l)),c=a>0?l-h:0,u=Math.max(0,h)*4,f=Math.min(a,h+1)*4;let o=n[u+3]+(n[f+3]-n[u+3])*c;if(o*=Math.min(1,r/.06),i.flicker>0&&(o*=1-i.flicker*.5*(1+Math.sin(this.#n[e]*26+this.#g[e]))),o<=.004)return false;let d,x,g;return i.palette.length?(d=this.#t[e*3],x=this.#t[e*3+1],g=this.#t[e*3+2]):(d=n[u]+(n[f]-n[u])*c,x=n[u+1]+(n[f+1]-n[u+1])*c,g=n[u+2]+(n[f+2]-n[u+2])*c),t[s]=this.#h[e],t[s+1]=this.#i[e],t[s+2]=this.#l[e],t[s+3]=this.#f[e]*(1+(i.grow-1)*r),t[s+4]=d*o,t[s+5]=x*o,t[s+6]=g*o,t[s+7]=o,t[s+8]=i.shape,t[s+9]=this.#r[e],true}#C(t,s,e,i,r,n,a,l=false){const h=(t.get(s)??0)+i,c=Math.floor(h);t.set(s,h-c),c>0&&this.#E(this.#q(e),c,r,n,a,l)}#q(t){const s=this.#M.get(t);if(s!==void 0)return s;const e=t.colors.map(n=>S(n)??[1,1,1,1]),i=(t.palette??[]).map(n=>S(n)??[1,1,1,1]),r={options:t,stops:Float32Array.from(e.length>1?e.flat():[...e[0],...e[0]]),palette:Float32Array.from(i.flatMap(n=>[n[0],n[1],n[2]])),additive:(t.blend??"add")==="add",direction:E[t.direction??"sphere"]??2,gravity:t.gravity??0,drag:t.drag??0,swirl:t.swirl??0,grow:t.grow??.3,flicker:t.flicker??0,shape:I[t.shape??"soft"]??0,spin:t.spin??0};return this.#e.push(r),this.#M.set(t,this.#e.length-1),this.#e.length-1}#E(t,s,e,i,r,n){const a=this.#e[t],l=a.options,h=this.#x,c=Math.sqrt(i[0]*i[0]+i[1]*i[1]+i[2]*i[2]),u=a.palette.length/3;for(let f=0;f<s;f++){let o=this.#s;o<p?this.#s++:o=Math.floor(h.next()*p),this.#h[o]=e[0]+(h.next()*2-1)*r,this.#i[o]=n?e[1]:Math.max(.012,e[1]+(h.next()*2-1)*r),this.#l[o]=e[2]+(h.next()*2-1)*r;const d=h.range(l.speed[0],l.speed[1]);let x,g,M;const w=h.next()*Math.PI*2;if(a.direction===0){const m=d*.45*h.next();x=Math.cos(w)*m,M=Math.sin(w)*m,g=d*(.6+.4*h.next())}else if(a.direction===1)x=Math.cos(w)*d,M=Math.sin(w)*d,g=d*.25*h.next();else if(a.direction===3&&c>.001)x=-i[0]/c*d+Math.cos(w)*d*.35,g=-i[1]/c*d+(h.next()*2-1)*d*.35,M=-i[2]/c*d+Math.sin(w)*d*.35;else{const m=h.next()*2-1,C=Math.sqrt(1-m*m);x=Math.cos(w)*C*d,g=m*d,M=Math.sin(w)*C*d}if(n&&(g=0),this.#c[o]=x,this.#u[o]=g,this.#p[o]=M,this.#n[o]=0,this.#d[o]=h.range(l.life[0],l.life[1]),this.#f[o]=h.range(l.size[0],l.size[1]),this.#g[o]=h.next()*Math.PI*2,this.#r[o]=h.next()*Math.PI*2,this.#m[o]=a.spin*(.5+h.next())*(h.next()<.5?-1:1),u){const m=Math.floor(h.next()*u)*3;this.#t[o*3]=a.palette[m],this.#t[o*3+1]=a.palette[m+1],this.#t[o*3+2]=a.palette[m+2]}this.#o[o]=t}}#k(t,s){t!==s&&(this.#h[s]=this.#h[t],this.#i[s]=this.#i[t],this.#l[s]=this.#l[t],this.#c[s]=this.#c[t],this.#u[s]=this.#u[t],this.#p[s]=this.#p[t],this.#n[s]=this.#n[t],this.#d[s]=this.#d[t],this.#f[s]=this.#f[t],this.#g[s]=this.#g[t],this.#r[s]=this.#r[t],this.#m[s]=this.#m[t],this.#t[s*3]=this.#t[t*3],this.#t[s*3+1]=this.#t[t*3+1],this.#t[s*3+2]=this.#t[t*3+2],this.#o[s]=this.#o[t])}}export{p as PARTICLE_CAPACITY,W as PARTICLE_FRAGMENT,A as PARTICLE_STRIDE,_ as PARTICLE_VERTEX,L as ParticleSystem,I as SHAPES,O as customizeEffect};
