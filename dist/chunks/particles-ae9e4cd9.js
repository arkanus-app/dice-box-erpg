var ht=(c,e,s)=>{if(!e.has(c))throw TypeError("Cannot "+s)};var t=(c,e,s)=>(ht(c,e,"read from private field"),s?s.call(c):e.get(c)),f=(c,e,s)=>{if(e.has(c))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(c):e.set(c,s)},R=(c,e,s,a)=>(ht(c,e,"write to private field"),a?a.call(c,s):e.set(c,s),s);var ot=(c,e,s,a)=>({set _(n){R(c,e,n,s)},get _(){return t(c,e,a)}}),S=(c,e,s)=>(ht(c,e,"access private method"),s);import{PARTICLE_MOMENTS as dt,p as it,c as gt}from"../dice3dview.es.js";const pt=(c,e,s)=>.299*c+.587*e+.114*s,st=c=>Math.round(Math.max(0,Math.min(1,c))*255).toString(16).padStart(2,"0"),vt=(c,e)=>{const[s,a,n,l]=it(c)??[1,1,1,1],r=pt(s,a,n),i=Math.max(.05,pt(e[0],e[1],e[2])),o=h=>r<=i?h*r/i:h+(1-h)*(r-i)/Math.max(.001,1-i)*.75;return`#${st(o(e[0]))}${st(o(e[1]))}${st(o(e[2]))}${st(l)}`},mt=new WeakMap,bt=(c,e)=>{const s=e.size??1,a=e.moments??{};if(!e.color&&!e.shape&&s===1&&!Object.values(a).includes(false))return c;const n=JSON.stringify([e.color??"",e.shape??"",s,dt.map(d=>a[d]!==false)]);let l=mt.get(c);l||mt.set(c,l=new Map);const r=l.get(n);if(r)return r;const i=e.color?it(e.color):null,o={};c.auraSeconds!==void 0&&(o.auraSeconds=c.auraSeconds);for(const d of dt){const g=c[d];!g||a[d]===false||(o[d]={...g,size:[g.size[0]*s,g.size[1]*s],...e.shape?{shape:e.shape}:{},...i?{colors:g.colors.map(w=>vt(w,i)),...g.palette?{palette:g.palette.map(w=>vt(w,i))}:{}}:{}})}const h=Object.freeze(o);return l.set(n,h),h},zt=`attribute vec3 aPos;
attribute float aSize;
attribute vec4 aColor;
attribute float aShape;
attribute float aAngle;
uniform mat4 uViewProj;
uniform float uPointScale;
uniform float uMaxPoint;
varying vec4 vColor;
varying float vShape;
varying vec3 vTurn;
void main() {
gl_Position = uViewProj * vec4(aPos, 1.0);
gl_PointSize = clamp(aSize * uPointScale / gl_Position.w, 1.0, uMaxPoint);
vColor = aColor;
vShape = aShape;
vTurn = vec3(cos(aAngle), sin(aAngle), abs(cos(aAngle * 1.7 + 0.6)));
}`,Ft=`precision mediump float;
varying vec4 vColor;
varying float vShape;
varying vec3 vTurn;
uniform float uAdditive;
void main() {
vec2 p = gl_PointCoord * 2.0 - 1.0;
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
}`,m=4e3,lt=10,xt=(c,e)=>c==="max"?e.value===e.sides:c==="min"?e.value===1:c.includes(e.value),wt={up:0,out:1,sphere:2,back:3},St={soft:0,spark:1,star:2,ring:3,confetti:4,smoke:5},At=1;var A,q,E,I,_,k,O,F,W,N,D,T,V,x,L,P,H,Y,nt,j,Q,B,y,$,J,Z,K,G,X,U,at,tt,ct,et,ft,rt,Mt;class Tt{constructor(){f(this,G);f(this,U);f(this,tt);f(this,et);f(this,rt);f(this,A,0);f(this,q,new Float32Array(m));f(this,E,new Float32Array(m));f(this,I,new Float32Array(m));f(this,_,new Float32Array(m));f(this,k,new Float32Array(m));f(this,O,new Float32Array(m));f(this,F,new Float32Array(m));f(this,W,new Float32Array(m));f(this,N,new Float32Array(m));f(this,D,new Float32Array(m));f(this,T,new Float32Array(m));f(this,V,new Float32Array(m));f(this,x,new Float32Array(m*3));f(this,L,new Uint16Array(m));f(this,P,[]);f(this,H,new Map);f(this,Y,new WeakMap);f(this,nt,new WeakMap);f(this,j,new Float32Array(m*lt));f(this,Q,new Float32Array(m*lt));f(this,B,gt("particles"));f(this,y,null);f(this,$,1);f(this,J,0);f(this,Z,new WeakMap);f(this,K,new WeakMap)}get count(){return t(this,A)}get auraSeconds(){return t(this,y)?.aura?Math.max(0,t(this,y).auraSeconds??2.5):0}get hasTrail(){return!!(t(this,y)?.trail||t(this,y)?.ground)}configure(e,s,a){R(this,y,e),R(this,$,Math.max(0,s)),R(this,B,gt(`${a}:particles`)),R(this,K,new WeakMap),t(this,A)===0&&t(this,P).length>48&&(t(this,P).length=0,t(this,H).clear())}clear(){R(this,A,0)}trail(e,s,a,n,l,r){const i=t(this,y)?.trail;if(!i||n<=0)return;const o=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);S(this,G,X).call(this,i,r,e,void 0,o,true)&&S(this,U,at).call(this,t(this,Y),e,i,i.amount*t(this,$)*Math.min(1.5,o/6)*n,s,a,l*.55)}ground(e,s,a,n,l,r){const i=t(this,y)?.ground;if(!i||n<=0)return;const o=Math.sqrt(a[0]*a[0]+a[2]*a[2]);S(this,G,X).call(this,i,r,e,void 0,o,true)&&S(this,U,at).call(this,t(this,nt),e,i,i.amount*t(this,$)*(o*n),[s[0],.012,s[2]],a,l*.3,true)}aura(e,s,a,n,l,r,i=false){const o=t(this,y)?.aura;!o||a<=0||l<=0||!i&&!S(this,G,X).call(this,o,r,e,void 0,void 0,true)||S(this,U,at).call(this,t(this,Y),e,o,o.amount*t(this,$)*l*a,s,[0,0,0],n*.6)}burst(e,s,a,n={}){const l=t(this,y)?.[e];if(!l||!n.always&&!S(this,G,X).call(this,l,n.subject,n.key,n.force,void 0,false))return;const r=Math.round(l.amount*t(this,$)*Math.max(0,n.strength??1));r>0&&S(this,et,ft).call(this,S(this,tt,ct).call(this,l),r,s,[0,0,0],a*(e==="impact"||e==="collision"?.35:.5),false)}update(e){if(!(e<=0)){R(this,J,t(this,J)+e);for(let s=0;s<t(this,A);s++){const a=t(this,F)[s]+e;if(a>=t(this,W)[s]){S(this,rt,Mt).call(this,t(this,A)-1,s),ot(this,A)._--,s--;continue}t(this,F)[s]=a;const n=t(this,P)[t(this,L)[s]];let l=t(this,_)[s],r=t(this,k)[s]-n.gravity*e,i=t(this,O)[s];if(n.drag>0){const h=Math.max(0,1-n.drag*e);l*=h,r*=h,i*=h}if(n.swirl!==0){const h=n.swirl*e,d=Math.cos(h),g=Math.sin(h),w=l*d-i*g;i=l*g+i*d,l=w}let o=t(this,E)[s]+r*e;o<.012&&(o=.012,r<0&&(r*=-.25),l*=.7,i*=.7),t(this,q)[s]=t(this,q)[s]+l*e,t(this,E)[s]=o,t(this,I)[s]=t(this,I)[s]+i*e,t(this,_)[s]=l,t(this,k)[s]=r,t(this,O)[s]=i,n.shape===At&&l*l+i*i>.0025?t(this,T)[s]=Math.atan2(i,l):t(this,T)[s]=t(this,T)[s]+t(this,V)[s]*e}}}build(){let e=0,s=0;for(let a=0;a<t(this,A);a++){const n=t(this,P)[t(this,L)[a]],l=t(this,F)[a]/t(this,W)[a],r=n.stops,i=r.length/4-1,o=l*i,h=Math.min(i-1,Math.floor(o)),d=i>0?o-h:0,g=Math.max(0,h)*4,w=Math.min(i,h+1)*4;let u=r[g+3]+(r[w+3]-r[g+3])*d;if(u*=Math.min(1,l/.06),n.flicker>0&&(u*=1-n.flicker*.5*(1+Math.sin(t(this,F)[a]*26+t(this,D)[a]))),u<=.004)continue;let v,C,b;n.palette.length?(v=t(this,x)[a*3],C=t(this,x)[a*3+1],b=t(this,x)[a*3+2]):(v=r[g]+(r[w]-r[g])*d,C=r[g+1]+(r[w+1]-r[g+1])*d,b=r[g+2]+(r[w+2]-r[g+2])*d);const M=n.additive?t(this,j):t(this,Q),p=(n.additive?e++:s++)*lt;M[p]=t(this,q)[a],M[p+1]=t(this,E)[a],M[p+2]=t(this,I)[a],M[p+3]=t(this,N)[a]*(1+(n.grow-1)*l),M[p+4]=v*u,M[p+5]=C*u,M[p+6]=b*u,M[p+7]=u,M[p+8]=n.shape,M[p+9]=t(this,T)[a]}return{additive:t(this,j),additiveCount:e,alpha:t(this,Q),alphaCount:s}}}A=new WeakMap,q=new WeakMap,E=new WeakMap,I=new WeakMap,_=new WeakMap,k=new WeakMap,O=new WeakMap,F=new WeakMap,W=new WeakMap,N=new WeakMap,D=new WeakMap,T=new WeakMap,V=new WeakMap,x=new WeakMap,L=new WeakMap,P=new WeakMap,H=new WeakMap,Y=new WeakMap,nt=new WeakMap,j=new WeakMap,Q=new WeakMap,B=new WeakMap,y=new WeakMap,$=new WeakMap,J=new WeakMap,Z=new WeakMap,K=new WeakMap,G=new WeakSet,X=function(e,s,a,n,l,r){const i=e.when;if(!i)return true;if(i.minForce!==void 0&&n!==void 0&&n<i.minForce||i.minSpeed!==void 0&&l!==void 0&&l<i.minSpeed)return false;if(s&&(i.sides||i.faces!==void 0)){const o="sides"in s?[s]:s,h=i.faces;if(!o.some(d=>(!i.sides||i.sides.includes(d.sides))&&(h===void 0||xt(h,d))))return false}if(i.chance!==void 0&&i.chance<1){if(r&&a){let o=t(this,K).get(a);o||t(this,K).set(a,o=new Map);let h=o.get(e);if(h===void 0&&o.set(e,h=t(this,B).next()<i.chance),!h)return false}else if(t(this,B).next()>=i.chance)return false}if(i.cooldown&&a&&!r){let o=t(this,Z).get(a);o||t(this,Z).set(a,o=new Map);const h=o.get(e);if(h!==void 0&&t(this,J)-h<i.cooldown)return false;o.set(e,t(this,J))}return true},U=new WeakSet,at=function(e,s,a,n,l,r,i,o=false){const h=(e.get(s)??0)+n,d=Math.floor(h);e.set(s,h-d),d>0&&S(this,et,ft).call(this,S(this,tt,ct).call(this,a),d,l,r,i,o)},tt=new WeakSet,ct=function(e){const s=t(this,H).get(e);if(s!==void 0)return s;const a=e.colors.map(r=>it(r)??[1,1,1,1]),n=(e.palette??[]).map(r=>it(r)??[1,1,1,1]),l={options:e,stops:Float32Array.from(a.length>1?a.flat():[...a[0],...a[0]]),palette:Float32Array.from(n.flatMap(r=>[r[0],r[1],r[2]])),additive:(e.blend??"add")==="add",direction:wt[e.direction??"sphere"]??2,gravity:e.gravity??0,drag:e.drag??0,swirl:e.swirl??0,grow:e.grow??.3,flicker:e.flicker??0,shape:St[e.shape??"soft"]??0,spin:e.spin??0};return t(this,P).push(l),t(this,H).set(e,t(this,P).length-1),t(this,P).length-1},et=new WeakSet,ft=function(e,s,a,n,l,r){const i=t(this,P)[e],o=i.options,h=t(this,B),d=Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]),g=i.palette.length/3;for(let w=0;w<s;w++){let u=t(this,A);u<m?ot(this,A)._++:u=Math.floor(h.next()*m),t(this,q)[u]=a[0]+(h.next()*2-1)*l,t(this,E)[u]=r?a[1]:Math.max(.012,a[1]+(h.next()*2-1)*l),t(this,I)[u]=a[2]+(h.next()*2-1)*l;const v=h.range(o.speed[0],o.speed[1]);let C,b,M;const p=h.next()*Math.PI*2;if(i.direction===0){const z=v*.45*h.next();C=Math.cos(p)*z,M=Math.sin(p)*z,b=v*(.6+.4*h.next())}else if(i.direction===1)C=Math.cos(p)*v,M=Math.sin(p)*v,b=v*.25*h.next();else if(i.direction===3&&d>.001)C=-n[0]/d*v+Math.cos(p)*v*.35,b=-n[1]/d*v+(h.next()*2-1)*v*.35,M=-n[2]/d*v+Math.sin(p)*v*.35;else{const z=h.next()*2-1,ut=Math.sqrt(1-z*z);C=Math.cos(p)*ut*v,b=z*v,M=Math.sin(p)*ut*v}if(r&&(b=0),t(this,_)[u]=C,t(this,k)[u]=b,t(this,O)[u]=M,t(this,F)[u]=0,t(this,W)[u]=h.range(o.life[0],o.life[1]),t(this,N)[u]=h.range(o.size[0],o.size[1]),t(this,D)[u]=h.next()*Math.PI*2,t(this,T)[u]=h.next()*Math.PI*2,t(this,V)[u]=i.spin*(.5+h.next())*(h.next()<.5?-1:1),g){const z=Math.floor(h.next()*g)*3;t(this,x)[u*3]=i.palette[z],t(this,x)[u*3+1]=i.palette[z+1],t(this,x)[u*3+2]=i.palette[z+2]}t(this,L)[u]=e}},rt=new WeakSet,Mt=function(e,s){e!==s&&(t(this,q)[s]=t(this,q)[e],t(this,E)[s]=t(this,E)[e],t(this,I)[s]=t(this,I)[e],t(this,_)[s]=t(this,_)[e],t(this,k)[s]=t(this,k)[e],t(this,O)[s]=t(this,O)[e],t(this,F)[s]=t(this,F)[e],t(this,W)[s]=t(this,W)[e],t(this,N)[s]=t(this,N)[e],t(this,D)[s]=t(this,D)[e],t(this,T)[s]=t(this,T)[e],t(this,V)[s]=t(this,V)[e],t(this,x)[s*3]=t(this,x)[e*3],t(this,x)[s*3+1]=t(this,x)[e*3+1],t(this,x)[s*3+2]=t(this,x)[e*3+2],t(this,L)[s]=t(this,L)[e])};export{m as PARTICLE_CAPACITY,Ft as PARTICLE_FRAGMENT,lt as PARTICLE_STRIDE,zt as PARTICLE_VERTEX,Tt as ParticleSystem,St as SHAPES,bt as customizeEffect};
