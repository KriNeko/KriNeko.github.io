var app=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function s(){return Object.create(null)}function l(t){t.forEach(n)}function i(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function o(t){const e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}function a(t,e){const n={};e=new Set(e);for(const s in t)e.has(s)||"$"===s[0]||(n[s]=t[s]);return n}function c(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function h(t){t.parentNode.removeChild(t)}function d(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function g(t){return document.createElement(t)}function f(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function m(t){return document.createTextNode(t)}function v(){return m(" ")}function p(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function w(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function $(t,e){for(const n in e)w(t,n,e[n])}function x(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function y(t,e){t.value=null==e?"":e}function b(t,e,n,s){t.style.setProperty(e,n,s?"important":"")}function C(t,e,n){t.classList[n?"add":"remove"](e)}let L;function k(t){L=t}const B=[],M=[],I=[],F=[],H=Promise.resolve();let P=!1;function _(){P||(P=!0,H.then(W))}function S(t){I.push(t)}let A=!1;const q=new Set;function W(){if(!A){A=!0;do{for(let t=0;t<B.length;t+=1){const e=B[t];k(e),R(e.$$)}for(k(null),B.length=0;M.length;)M.pop()();for(let t=0;t<I.length;t+=1){const e=I[t];q.has(e)||(q.add(e),e())}I.length=0}while(B.length);for(;F.length;)F.pop()();P=!1,A=!1,q.clear()}}function R(t){if(null!==t.fragment){t.update(),l(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(S)}}const Z=new Set;let N;function V(){N={r:0,c:[],p:N}}function E(){N.r||l(N.c),N=N.p}function T(t,e){t&&t.i&&(Z.delete(t),t.i(e))}function j(t,e,n,s){if(t&&t.o){if(Z.has(t))return;Z.add(t),N.c.push((()=>{Z.delete(t),s&&(n&&t.d(1),s())})),t.o(e)}}function z(t,e){const n={},s={},l={$$scope:1};let i=t.length;for(;i--;){const r=t[i],o=e[i];if(o){for(const t in r)t in o||(s[t]=1);for(const t in o)l[t]||(n[t]=o[t],l[t]=1);t[i]=o}else for(const t in r)l[t]=1}for(const t in s)t in n||(n[t]=void 0);return n}function D(t){t&&t.c()}function G(t,e,s){const{fragment:r,on_mount:o,on_destroy:a,after_update:c}=t.$$;r&&r.m(e,s),S((()=>{const e=o.map(n).filter(i);a?a.push(...e):l(e),t.$$.on_mount=[]})),c.forEach(S)}function O(t,e){const n=t.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function K(e,n,i,r,o,a,c=[-1]){const u=L;k(e);const d=n.props||{},g=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:o,bound:s(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:s(),dirty:c,skip_bound:!1};let f=!1;if(g.ctx=i?i(e,d,((t,n,...s)=>{const l=s.length?s[0]:n;return g.ctx&&o(g.ctx[t],g.ctx[t]=l)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](l),f&&function(t,e){-1===t.$$.dirty[0]&&(B.push(t),_(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}(e,t)),n})):[],g.update(),f=!0,l(g.before_update),g.fragment=!!r&&r(g.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);g.fragment&&g.fragment.l(t),t.forEach(h)}else g.fragment&&g.fragment.c();n.intro&&T(e.$$.fragment),G(e,n.target,n.anchor),W()}k(u)}class J{$destroy(){O(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Q=[];const U=new class{constructor(){this.notfoundCallback=()=>{},this.routers=[],this.pathInfoWritable=function(e,n=t){let s;const l=[];function i(t){if(r(e,t)&&(e=t,s)){const t=!Q.length;for(let t=0;t<l.length;t+=1){const n=l[t];n[1](),Q.push(n,e)}if(t){for(let t=0;t<Q.length;t+=2)Q[t][0](Q[t+1]);Q.length=0}}}return{set:i,update:function(t){i(t(e))},subscribe:function(r,o=t){const a=[r,o];return l.push(a),1===l.length&&(s=n(i)||t),r(e),()=>{const t=l.indexOf(a);-1!==t&&l.splice(t,1),0===l.length&&(s(),s=null)}}}}(this.path),this.path=null,this.pathInfo=null,this._setPath("")}getPath(){return this.pathInfo}getPathWritable(){return this.pathInfoWritable}setNotFound(t){this.notfoundCallback=t}add(t,e){this.routers.push({regexp:t,callback:e})}_setPath(t){this.path=t;const e=t.split("/").map(decodeURI).slice(1);this.pathInfo={path:t,parts:e},this.pathInfoWritable.set(this.pathInfo)}async go(t,e=t,n={},s=!0){if(t===this.path)return;const l=this.routers.find((e=>e.regexp.test(t)));if(!l)return this.notfoundCallback();this._setPath(t),s&&history.pushState(n,e,t),await(_(),H),l.callback()}goWithoutPushState(t,e=t,n={}){return this.go(t,e,n,!1)}};function Y(e){let n,s,i,r,o,a,d,f,m,$,x;return{c(){n=g("div"),s=g("div"),i=g("div"),i.textContent="Правила игры",r=v(),o=g("div"),o.textContent="Посмотреть игру",a=v(),d=g("div"),d.textContent="Контакты",f=v(),m=g("div"),m.innerHTML='<div class="a text_underline svelte-1sp00k">Регистрация</div> \n\t\t<div class="a text_underline svelte-1sp00k">Забыли пароль</div>',w(i,"class","a svelte-1sp00k"),C(i,"aActive","/game-rules"===U.path),w(o,"class","a svelte-1sp00k"),w(d,"class","a svelte-1sp00k"),w(s,"class","flex cgap30 svelte-1sp00k"),w(m,"class","flex cgap30 svelte-1sp00k"),w(n,"class","container flex svelte-1sp00k")},m(t,l){u(t,n,l),c(n,s),c(s,i),c(s,r),c(s,o),c(s,a),c(s,d),c(n,f),c(n,m),$||(x=[p(i,"click",e[0]),p(o,"click",e[1])],$=!0)},p(t,[e]){0&e&&C(i,"aActive","/game-rules"===U.path)},i:t,o:t,d(t){t&&h(n),$=!1,l(x)}}}function X(t){return[()=>U.go("/game-rules"),()=>U.go("/")]}class tt extends J{constructor(t){super(),K(this,t,X,Y,r,{})}}function et(e){let n;return{c(){n=g("div"),n.innerHTML='<div class="stat svelte-aub7nj"><div>Статистика сервера:</div> \n\t\t<div>Партий в архиве:  1108979</div> \n\t\t<div>Победила мафия:  385157</div> \n\t\t<div>Победили честные:  711679</div> \n\t\t<div>Ничьих:  10703</div> \n\t\t<div>Сейчас онлайн:  50</div> \n\t\t<div>Активных игроков:  88582</div></div>',w(n,"class","container svelte-aub7nj")},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&h(n)}}}class nt extends J{constructor(t){super(),K(this,t,null,et,r,{})}}function st(e){let n;return{c(){n=g("div"),n.innerHTML='<img src="assets/images/9bde4ef8e544bea24923045e23b45be9.png" class="svelte-1fipc58"/> \n\t\t\n\t\t<div class="abs gradient svelte-1fipc58"></div> \n\t\t\n\t\t<div class="containerLabel svelte-1fipc58"><div class="mafia svelte-1fipc58">MAFIA</div> \n\n\t\t\t<div class="online svelte-1fipc58">ONLINE</div></div>',w(n,"class","container svelte-1fipc58")},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&h(n)}}}class lt extends J{constructor(t){super(),K(this,t,null,st,r,{})}}function it(n){let s,l,i=[{width:"14"},{height:"14"},{viewBox:"0 0 14 14"},{xmlns:"http://www.w3.org/2000/svg"},{fill:"black"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"14"},{height:"14"},{viewBox:"0 0 14 14"},{xmlns:"http://www.w3.org/2000/svg"},{fill:"black"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function rt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class ot extends J{constructor(t){super(),K(this,t,rt,it,r,{})}}function at(n){let s,l,i=[{width:"23"},{height:"23"},{viewBox:"0 0 23 23"},{fill:"#FF0000"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"d","M13.6433 9.2217H23V13.0189H13.6433V23H9.35671V13.0189H0V9.2217H9.35671V0H13.6433V9.2217Z"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"23"},{height:"23"},{viewBox:"0 0 23 23"},{fill:"#FF0000"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function ct(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class ut extends J{constructor(t){super(),K(this,t,ct,at,r,{})}}function ht(n){let s,l,i=[{width:"33"},{height:"33"},{viewBox:"0 0 33 33"},{xmlns:"http://www.w3.org/2000/svg"},{fill:"#979797"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"d","M16.0806 13.1412L22.5213 6.35413L25.2757 8.96793L18.835 15.755L26.075 22.6256L23.1243 25.735L15.8843 18.8644L9.44355 25.6515L6.68918 23.0377L13.1299 16.2506L6.44074 9.90282L9.39142 6.79345L16.0806 13.1412Z"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"33"},{height:"33"},{viewBox:"0 0 33 33"},{xmlns:"http://www.w3.org/2000/svg"},{fill:"#979797"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function dt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class gt extends J{constructor(t){super(),K(this,t,dt,ht,r,{})}}function ft(t,e,n){const s=t.slice();return s[3]=e[n],s}function mt(t){let e,n;return e=new ut({props:{style:"width: 23rem; height: 23rem;"}}),{c(){D(e.$$.fragment)},m(t,s){G(e,t,s),n=!0},i(t){n||(T(e.$$.fragment,t),n=!0)},o(t){j(e.$$.fragment,t),n=!1},d(t){O(e,t)}}}function vt(t){let e,n;return e=new gt({props:{style:"width: 35rem; height: 35rem;"}}),{c(){D(e.$$.fragment)},m(t,s){G(e,t,s),n=!0},i(t){n||(T(e.$$.fragment,t),n=!0)},o(t){j(e.$$.fragment,t),n=!1},d(t){O(e,t)}}}function pt(e){let n,s,l,i,r,o,a,d,f,p,$,x,y,C,L,k,B,M,I,F,H,P,_,S,A,q,W,R,Z,N,V,E,z=e[0](e[3].date)+"",D=e[3].id+"",G=e[3].maxNumPlayers+"",O=e[3].maxNumPlayers-e[3].players.length+"",K=e[3].players.join(", ")+"";const J=[vt,mt],Q=[];return H=function(t,e){return t[3].hasSelf?0:1}(e),P=Q[H]=J[H](e),{c(){n=g("div"),s=g("div"),l=g("div"),i=g("div"),r=m(z),o=v(),a=g("div"),d=m("№"),f=m(D),p=v(),$=g("div"),x=m("Макс. игроков: "),y=m(G),C=v(),L=g("div"),k=m("Ожидает "),B=m(O),M=m(" участников\r\n\t\t\t\t\t\t"),I=g("div"),F=v(),P.c(),_=v(),S=g("div"),A=g("div"),q=v(),W=g("div"),R=v(),Z=g("div"),N=m(K),V=v(),w(l,"class","gameItemInfoLabel svelte-1wxg5uq"),b(I,"width","23rem"),w(L,"class","gameItemInfoAction svelte-1wxg5uq"),w(s,"class","gameItemInfo svelte-1wxg5uq"),w(A,"class","gameItemProgressTrack svelte-1wxg5uq"),w(W,"class","gameItemProgressThumb svelte-1wxg5uq"),b(W,"width",e[3].players.length/e[3].maxNumPlayers*100+"%"),w(S,"class","gameItemProgress svelte-1wxg5uq"),w(Z,"class","gameItemPlayers svelte-1wxg5uq"),w(n,"class","gameItem svelte-1wxg5uq")},m(t,e){u(t,n,e),c(n,s),c(s,l),c(l,i),c(i,r),c(l,o),c(l,a),c(a,d),c(a,f),c(l,p),c(l,$),c($,x),c($,y),c(s,C),c(s,L),c(L,k),c(L,B),c(L,M),c(L,I),c(L,F),Q[H].m(L,null),c(n,_),c(n,S),c(S,A),c(S,q),c(S,W),c(n,R),c(n,Z),c(Z,N),c(n,V),E=!0},p:t,i(t){E||(T(P),E=!0)},o(t){j(P),E=!1},d(t){t&&h(n),Q[H].d()}}}function wt(t){let e,n,s,l,i,r,o,a,f,p,$,x,y,C,L,k;r=new ot({props:{style:"width: 14px; height: 14px;"}});let B=t[1],M=[];for(let e=0;e<B.length;e+=1)M[e]=pt(ft(t,B,e));const I=t=>j(M[t],1,1,(()=>{M[t]=null}));return{c(){e=g("div"),n=g("div"),s=g("div"),s.textContent="Текущие игры",l=v(),i=g("button"),D(r.$$.fragment),o=m("создать"),a=v(),f=g("div"),p=v(),$=g("div"),x=v(),y=g("div"),C=v(),L=g("div");for(let t=0;t<M.length;t+=1)M[t].c();w(s,"class","currentGamesLabel svelte-1wxg5uq"),w(i,"class","createGameButton svelte-1wxg5uq"),w(n,"class","header svelte-1wxg5uq"),b(f,"height","17rem"),b($,"background","#FFFFFF"),b($,"mix-blend-mode","normal"),b($,"opacity","0.12"),b($,"width","100%"),b($,"height","1px"),b(y,"height","31rem"),w(L,"class","gameList svelte-1wxg5uq"),w(e,"class","container svelte-1wxg5uq")},m(t,h){u(t,e,h),c(e,n),c(n,s),c(n,l),c(n,i),G(r,i,null),c(i,o),c(e,a),c(e,f),c(e,p),c(e,$),c(e,x),c(e,y),c(e,C),c(e,L);for(let t=0;t<M.length;t+=1)M[t].m(L,null);k=!0},p(t,[e]){if(3&e){let n;for(B=t[1],n=0;n<B.length;n+=1){const s=ft(t,B,n);M[n]?(M[n].p(s,e),T(M[n],1)):(M[n]=pt(s),M[n].c(),T(M[n],1),M[n].m(L,null))}for(V(),n=B.length;n<M.length;n+=1)I(n);E()}},i(t){if(!k){T(r.$$.fragment,t);for(let t=0;t<B.length;t+=1)T(M[t]);k=!0}},o(t){j(r.$$.fragment,t),M=M.filter(Boolean);for(let t=0;t<M.length;t+=1)j(M[t]);k=!1},d(t){t&&h(e),O(r),d(M,t)}}}function $t(t){const e=()=>Date.now()-(1e6*Math.random()|0);return[t=>{const e=new Date(t),n=t=>(t+"").padStart(2,0);return[e.getDay()+1,e.getMonth(),n(e.getFullYear()%2e3)].map(n).join(".")+" "+[e.getHours(),e.getMinutes(),e.getSeconds()].map(n).join(":")},[{date:e(),id:35487,maxNumPlayers:11,players:["Lupusregina[beta]","Den Ri","Зомби Ich bin Roboter","Bunk Bunkovich","Aleksander irreligious86","Chingiz Mam"]},{date:e(),id:35488,maxNumPlayers:11,players:["Зомби Ich bin Roboter"]},{date:e(),id:35489,maxNumPlayers:9,players:["Bunk Bunkovich","Aleksander irreligious86"]},{date:e(),id:35490,maxNumPlayers:11,players:["Lupusregina[beta]","Den Ri","Зомби Ich bin Roboter","Bunk Bunkovich","Aleksander irreligious86","Chingiz Mam"],hasSelf:!0}]]}class xt extends J{constructor(t){super(),K(this,t,$t,wt,r,{})}}function yt(n){let s,l,i=[{width:"30"},{height:"30"},{viewBox:"0 0 30 30"},{xmlns:"http://www.w3.org/2000/svg"},{fill:"#979797"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M15.1125 3.63744C12.6 1.12494 8.8375 0.612443 5.8125 2.08744L11.2375 7.51244L7.4875 11.2624L2.0625 5.83744C0.600004 8.87494 1.1125 12.6124 3.625 15.1249C5.95 17.4499 9.35001 18.0624 12.2375 16.9749L23.625 28.3624C24.1125 28.8499 24.9 28.8499 25.3875 28.3624L28.2625 25.4874C28.75 24.9999 28.75 24.2124 28.2625 23.7249L16.925 12.3749C18.075 9.44994 17.475 5.99994 15.1125 3.63744Z"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"30"},{height:"30"},{viewBox:"0 0 30 30"},{xmlns:"http://www.w3.org/2000/svg"},{fill:"#979797"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function bt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class Ct extends J{constructor(t){super(),K(this,t,bt,yt,r,{})}}function Lt(n){let s,l,i=[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M24.0834 10L19.0834 15H22.8334C22.8334 19.1375 19.4709 22.5 15.3334 22.5C14.0709 22.5 12.8709 22.1875 11.8334 21.625L10.0084 23.45C11.5459 24.425 13.3709 25 15.3334 25C20.8584 25 25.3334 20.525 25.3334 15H29.0834L24.0834 10ZM7.83337 15C7.83337 10.8625 11.1959 7.5 15.3334 7.5C16.5959 7.5 17.7959 7.8125 18.8334 8.375L20.6584 6.55C19.1209 5.575 17.2959 5 15.3334 5C9.80837 5 5.33337 9.475 5.33337 15H1.58337L6.58337 20L11.5834 15H7.83337Z"),w(l,"fill","#979797"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function kt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class Bt extends J{constructor(t){super(),K(this,t,kt,Lt,r,{})}}function Mt(n){let s,l,i=[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M20.0416 17.5H19.0541L18.7041 17.1625C19.9291 15.7375 20.6666 13.8875 20.6666 11.875C20.6666 7.3875 17.0291 3.75 12.5416 3.75C8.05413 3.75 4.41663 7.3875 4.41663 11.875C4.41663 16.3625 8.05413 20 12.5416 20C14.5541 20 16.4041 19.2625 17.8291 18.0375L18.1666 18.3875V19.375L24.4166 25.6125L26.2791 23.75L20.0416 17.5ZM12.5416 17.5C9.42913 17.5 6.91663 14.9875 6.91663 11.875C6.91663 8.76249 9.42913 6.24999 12.5416 6.24999C15.6541 6.24999 18.1666 8.76249 18.1666 11.875C18.1666 14.9875 15.6541 17.5 12.5416 17.5Z"),w(l,"fill","#979797"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function It(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class Ft extends J{constructor(t){super(),K(this,t,It,Mt,r,{})}}function Ht(n){let s,l,i=[{width:"30"},{height:"30"},{viewBox:"0 0 30 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M15 26.6875L13.1875 25.0375C6.75 19.2 2.5 15.35 2.5 10.625C2.5 6.775 5.525 3.75 9.375 3.75C11.55 3.75 13.6375 4.7625 15 6.3625C16.3625 4.7625 18.45 3.75 20.625 3.75C24.475 3.75 27.5 6.775 27.5 10.625C27.5 15.35 23.25 19.2 16.8125 25.05L15 26.6875Z"),w(l,"fill","#979797"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"30"},{height:"30"},{viewBox:"0 0 30 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function Pt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class _t extends J{constructor(t){super(),K(this,t,Pt,Ht,r,{})}}function St(n){let s,l,i=[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M24.2373 16.17C24.2823 15.795 24.3123 15.405 24.3123 15C24.3123 14.595 24.2823 14.205 24.2223 13.83L26.7573 11.85C26.9823 11.67 27.0423 11.34 26.9073 11.085L24.5073 6.93C24.3573 6.66 24.0423 6.57 23.7723 6.66L20.7873 7.86C20.1573 7.38 19.4973 6.99 18.7623 6.69L18.3123 3.51C18.2673 3.21 18.0123 3 17.7123 3H12.9123C12.6123 3 12.3723 3.21 12.3273 3.51L11.8773 6.69C11.1423 6.99 10.4673 7.395 9.85227 7.86L6.86727 6.66C6.59727 6.555 6.28227 6.66 6.13227 6.93L3.73227 11.085C3.58227 11.355 3.64227 11.67 3.88227 11.85L6.41727 13.83C6.35727 14.205 6.31227 14.61 6.31227 15C6.31227 15.39 6.34227 15.795 6.40227 16.17L3.86727 18.15C3.64227 18.33 3.58227 18.66 3.71727 18.915L6.11727 23.07C6.26727 23.34 6.58227 23.43 6.85227 23.34L9.83727 22.14C10.4673 22.62 11.1273 23.01 11.8623 23.31L12.3123 26.49C12.3723 26.79 12.6123 27 12.9123 27H17.7123C18.0123 27 18.2673 26.79 18.2973 26.49L18.7473 23.31C19.4823 23.01 20.1573 22.605 20.7723 22.14L23.7573 23.34C24.0273 23.445 24.3423 23.34 24.4923 23.07L26.8923 18.915C27.0423 18.645 26.9823 18.33 26.7423 18.15L24.2373 16.17ZM15.3123 19.5C12.8373 19.5 10.8123 17.475 10.8123 15C10.8123 12.525 12.8373 10.5 15.3123 10.5C17.7873 10.5 19.8123 12.525 19.8123 15C19.8123 17.475 17.7873 19.5 15.3123 19.5Z"),w(l,"fill","#979797"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function At(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class qt extends J{constructor(t){super(),K(this,t,At,St,r,{})}}function Wt(n){let s,l,i=[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M15.6666 6.25C9.41663 6.25 4.07913 10.1375 1.91663 15.625C4.07913 21.1125 9.41663 25 15.6666 25C21.9166 25 27.2541 21.1125 29.4166 15.625C27.2541 10.1375 21.9166 6.25 15.6666 6.25ZM15.6666 21.875C12.2166 21.875 9.41663 19.075 9.41663 15.625C9.41663 12.175 12.2166 9.37501 15.6666 9.37501C19.1166 9.37501 21.9166 12.175 21.9166 15.625C21.9166 19.075 19.1166 21.875 15.6666 21.875ZM15.6666 11.875C13.5916 11.875 11.9166 13.55 11.9166 15.625C11.9166 17.7 13.5916 19.375 15.6666 19.375C17.7416 19.375 19.4166 17.7 19.4166 15.625C19.4166 13.55 17.7416 11.875 15.6666 11.875Z"),w(l,"fill","#979797"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"31"},{height:"30"},{viewBox:"0 0 31 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function Rt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class Zt extends J{constructor(t){super(),K(this,t,Rt,Wt,r,{})}}function Nt(n){let s,l,i=[{width:"30"},{height:"30"},{viewBox:"0 0 30 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M15 2.5C8.1 2.5 2.5 8.1 2.5 15C2.5 21.9 8.1 27.5 15 27.5C21.9 27.5 27.5 21.9 27.5 15C27.5 8.1 21.9 2.5 15 2.5ZM12.5 21.25L6.25 15L8.0125 13.2375L12.5 17.7125L21.9875 8.22498L23.75 9.99998L12.5 21.25Z"),w(l,"fill","#979797"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"30"},{height:"30"},{viewBox:"0 0 30 30"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function Vt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class Et extends J{constructor(t){super(),K(this,t,Vt,Nt,r,{})}}function Tt(n){let s,l,i=[{width:"19"},{height:"17"},{viewBox:"0 0 19 17"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},n[0]],r={};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return{c(){s=f("svg"),l=f("path"),w(l,"fill-rule","evenodd"),w(l,"clip-rule","evenodd"),w(l,"d","M18.5416 1.645L16.7204 0L9.49998 6.52167L2.27956 0L0.458313 1.645L7.67873 8.16667L0.458313 14.6883L2.27956 16.3333L9.49998 9.81167L16.7204 16.3333L18.5416 14.6883L11.3212 8.16667L18.5416 1.645Z"),w(l,"fill","white"),w(l,"fill-opacity","0.6"),$(s,r)},m(t,e){u(t,s,e),c(s,l)},p(t,[e]){$(s,r=z(i,[{width:"19"},{height:"17"},{viewBox:"0 0 19 17"},{fill:"none"},{xmlns:"http://www.w3.org/2000/svg"},1&e&&t[0]]))},i:t,o:t,d(t){t&&h(s)}}}function jt(t,n,s){const l=[];let i=a(n,l);return t.$$set=t=>{n=e(e({},n),o(t)),s(0,i=a(n,l))},[i]}class zt extends J{constructor(t){super(),K(this,t,jt,Tt,r,{})}}function Dt(t,e,n){const s=t.slice();return s[6]=e[n],s}function Gt(t){let e,n,s,l,i,r,o,a,d,f,p,$,y=t[6].author+"",b=t[6].message+"";return{c(){e=g("div"),n=g("div"),s=g("img"),i=v(),r=g("div"),o=g("div"),a=m(y),d=v(),f=g("div"),p=m(b),$=v(),s.src!==(l="assets/avatars/"+t[6].avatar)&&w(s,"src",l),w(s,"class","svelte-19mu4db"),w(n,"class","chatMessageAvatar svelte-19mu4db"),w(o,"class","chatMessageContentAuthor svelte-19mu4db"),w(f,"class","chatMessageContentData svelte-19mu4db"),w(r,"class","chatMessageContent svelte-19mu4db"),w(e,"class","chatMessage svelte-19mu4db")},m(t,l){u(t,e,l),c(e,n),c(n,s),c(e,i),c(e,r),c(r,o),c(o,a),c(r,d),c(r,f),c(f,p),c(e,$)},p(t,e){1&e&&s.src!==(l="assets/avatars/"+t[6].avatar)&&w(s,"src",l),1&e&&y!==(y=t[6].author+"")&&x(a,y),1&e&&b!==(b=t[6].message+"")&&x(p,b)},d(t){t&&h(e)}}}function Ot(t){let e,n,s,i,r,o,a,f,m,$,x,L,k,B,M,I,F,H,P,_,S,A,q,W,R,Z,N,V,E,z,K,J,Q,U,Y,X,tt,et,nt=t[0],st=[];for(let e=0;e<nt.length;e+=1)st[e]=Gt(Dt(t,nt,e));return _=new zt({props:{style:"width: 18rem; height: 16rem;"}}),q=new Ct({props:{style:"width: 30rem; height: 30rem;"}}),R=new Bt({props:{style:"width: 30rem; height: 30rem;"}}),N=new Ft({props:{style:"width: 30rem; height: 30rem;"}}),E=new _t({props:{style:"width: 30rem; height: 30rem;"}}),K=new qt({props:{style:"width: 30rem; height: 30rem;"}}),Q=new Zt({props:{style:"width: 30rem; height: 30rem;"}}),Y=new Et({props:{style:"width: 30rem; height: 30rem;"}}),{c(){e=g("div"),n=g("div"),n.innerHTML='<div class="currentGamesLabel svelte-19mu4db">Игроки онлайн</div>',s=v(),i=g("div"),r=v(),o=g("div"),a=v(),f=g("div"),m=v(),$=g("div"),x=g("div");for(let t=0;t<st.length;t+=1)st[t].c();L=v(),k=g("div"),B=v(),M=g("div"),I=g("div"),F=g("input"),H=v(),P=g("div"),D(_.$$.fragment),S=v(),A=g("div"),D(q.$$.fragment),W=v(),D(R.$$.fragment),Z=v(),D(N.$$.fragment),V=v(),D(E.$$.fragment),z=v(),D(K.$$.fragment),J=v(),D(Q.$$.fragment),U=v(),D(Y.$$.fragment),w(n,"class","header svelte-19mu4db"),b(i,"height","17rem"),b(o,"background","#FFFFFF"),b(o,"mix-blend-mode","normal"),b(o,"opacity","0.12"),b(o,"width","100%"),b(o,"height","1px"),b(f,"height","31rem"),w(x,"class","chatMessageList svelte-19mu4db"),w($,"class","chat svelte-19mu4db"),b(k,"height","40rem"),w(F,"placeholder","Введите сообщение"),w(F,"class","svelte-19mu4db"),w(P,"class","inputMessageClear svelte-19mu4db"),C(P,"inputMessageClearShow",t[1].length),w(I,"class","containerInput svelte-19mu4db"),w(A,"class","containerControlList svelte-19mu4db"),w(M,"class","containerControl svelte-19mu4db"),w(e,"class","container svelte-19mu4db")},m(l,h){u(l,e,h),c(e,n),c(e,s),c(e,i),c(e,r),c(e,o),c(e,a),c(e,f),c(e,m),c(e,$),c($,x);for(let t=0;t<st.length;t+=1)st[t].m(x,null);c(e,L),c(e,k),c(e,B),c(e,M),c(M,I),c(I,F),y(F,t[1]),c(I,H),c(I,P),G(_,P,null),c(M,S),c(M,A),G(q,A,null),c(A,W),G(R,A,null),c(A,Z),G(N,A,null),c(A,V),G(E,A,null),c(A,z),G(K,A,null),c(A,J),G(Q,A,null),c(A,U),G(Y,A,null),X=!0,tt||(et=[p(F,"input",t[3]),p(F,"keydown",t[4]),p(P,"click",t[5])],tt=!0)},p(t,[e]){if(1&e){let n;for(nt=t[0],n=0;n<nt.length;n+=1){const s=Dt(t,nt,n);st[n]?st[n].p(s,e):(st[n]=Gt(s),st[n].c(),st[n].m(x,null))}for(;n<st.length;n+=1)st[n].d(1);st.length=nt.length}2&e&&F.value!==t[1]&&y(F,t[1]),2&e&&C(P,"inputMessageClearShow",t[1].length)},i(t){X||(T(_.$$.fragment,t),T(q.$$.fragment,t),T(R.$$.fragment,t),T(N.$$.fragment,t),T(E.$$.fragment,t),T(K.$$.fragment,t),T(Q.$$.fragment,t),T(Y.$$.fragment,t),X=!0)},o(t){j(_.$$.fragment,t),j(q.$$.fragment,t),j(R.$$.fragment,t),j(N.$$.fragment,t),j(E.$$.fragment,t),j(K.$$.fragment,t),j(Q.$$.fragment,t),j(Y.$$.fragment,t),X=!1},d(t){t&&h(e),d(st,t),O(_),O(q),O(R),O(N),O(E),O(K),O(Q),O(Y),tt=!1,l(et)}}}function Kt(t,e,n){let s=[{avatar:"1.png",author:"Зомби Ich bin Roboter",message:"Q. What did the guy say to the horse when he walked into the bar? A. Why the long face??"},{avatar:"2.png",author:"Aleksander irreligious86",message:"What happens when you cross a singer and a rocking chair? — you rock to the beat."},{avatar:"3.png",author:"Bunk Bunkovich",message:"What do you call a lease of false teeth? — a dental rental"},{avatar:"3.png",author:"Bunk Bunkovich",message:"What do you call a lease of false teeth? — a dental rental"},{avatar:"3.png",author:"Bunk Bunkovich",message:"What do you call a lease of false teeth? — a dental rental"},{avatar:"3.png",author:"Bunk Bunkovich",message:"What do you call a lease of false teeth? — a dental rental"},{avatar:"3.png",author:"Bunk Bunkovich",message:"What do you call a lease of false teeth? — a dental rental"}],l="";function i(){l&&(s.push({avatar:"1.png",author:"Lupusregina[beta]",message:l}),n(0,s),n(1,l=""))}return[s,l,i,function(){l=this.value,n(1,l)},t=>13===t.which&&i(),()=>n(1,l="")]}class Jt extends J{constructor(t){super(),K(this,t,Kt,Ot,r,{})}}function Qt(t,e,n){const s=t.slice();return s[1]=e[n],s}function Ut(t){let e,n,s=t[1].name+"";return{c(){e=g("div"),n=m(s),w(e,"class","playerItem svelte-dm919q"),C(e,"playerItemActive",t[1].active)},m(t,s){u(t,e,s),c(e,n)},p(t,n){1&n&&C(e,"playerItemActive",t[1].active)},d(t){t&&h(e)}}}function Yt(e){let n,s,l,i,r,o,a,f,m,p,$=e[0],x=[];for(let t=0;t<$.length;t+=1)x[t]=Ut(Qt(e,$,t));return{c(){n=g("div"),s=g("div"),s.innerHTML='<div class="currentGamesLabel svelte-dm919q">Игроки онлайн</div>',l=v(),i=g("div"),r=v(),o=g("div"),a=v(),f=g("div"),m=v(),p=g("div");for(let t=0;t<x.length;t+=1)x[t].c();w(s,"class","header svelte-dm919q"),b(i,"height","17rem"),b(o,"background","#FFFFFF"),b(o,"mix-blend-mode","normal"),b(o,"opacity","0.12"),b(o,"width","100%"),b(o,"height","1px"),b(f,"height","31rem"),w(p,"class","playerList svelte-dm919q"),w(n,"class","container svelte-dm919q")},m(t,e){u(t,n,e),c(n,s),c(n,l),c(n,i),c(n,r),c(n,o),c(n,a),c(n,f),c(n,m),c(n,p);for(let t=0;t<x.length;t+=1)x[t].m(p,null)},p(t,[e]){if(1&e){let n;for($=t[0],n=0;n<$.length;n+=1){const s=Qt(t,$,n);x[n]?x[n].p(s,e):(x[n]=Ut(s),x[n].c(),x[n].m(p,null))}for(;n<x.length;n+=1)x[n].d(1);x.length=$.length}},i:t,o:t,d(t){t&&h(n),d(x,t)}}}function Xt(t){return[["Lupusregina[beta]","Den Ri","Зомби Ich bin Roboter","Bunk Bunkovich","Bakunov","Aleksander irreligious86","Pacificescape","Peach lasagna","Chingiz Mamiyev","Ilya Kozyura","Anton Miroshnichenko","Just_Miracle","Vladislav Stepanov","Marcello Giovanni","Robert Sabirov","Сергей Очеретенко","Aleksander irreligious86","Pacificescape","Peach lasagna","Chingiz Mamiyev","Ilya Kozyura"].map((t=>({name:t,active:Math.random()<.3})))]}class te extends J{constructor(t){super(),K(this,t,Xt,Yt,r,{})}}function ee(e){let n,s,l,i,r,o,a,d,f,m,p,$,x,y,b,C;return l=new tt({}),r=new lt({}),f=new xt({}),p=new Jt({}),x=new te({}),b=new nt({}),{c(){n=g("main"),s=g("div"),D(l.$$.fragment),i=v(),D(r.$$.fragment),o=v(),a=g("div"),d=g("div"),D(f.$$.fragment),m=v(),D(p.$$.fragment),$=v(),D(x.$$.fragment),y=v(),D(b.$$.fragment),w(s,"class","headerWrapper svelte-1cos8cd"),w(d,"class","bodyLeft svelte-1cos8cd"),w(a,"class","body svelte-1cos8cd")},m(t,e){u(t,n,e),c(n,s),G(l,s,null),c(n,i),G(r,n,null),c(n,o),c(n,a),c(a,d),G(f,d,null),c(d,m),G(p,d,null),c(a,$),G(x,a,null),c(n,y),G(b,n,null),C=!0},p:t,i(t){C||(T(l.$$.fragment,t),T(r.$$.fragment,t),T(f.$$.fragment,t),T(p.$$.fragment,t),T(x.$$.fragment,t),T(b.$$.fragment,t),C=!0)},o(t){j(l.$$.fragment,t),j(r.$$.fragment,t),j(f.$$.fragment,t),j(p.$$.fragment,t),j(x.$$.fragment,t),j(b.$$.fragment,t),C=!1},d(t){t&&h(n),O(l),O(r),O(f),O(p),O(x),O(b)}}}class ne extends J{constructor(t){super(),K(this,t,null,ee,r,{})}}function se(t,e,n){const s=t.slice();return s[1]=e[n],s}function le(e){let n,s,l,i,r,o,a,d=e[1].title+"",f=e[1].description+"";return{c(){n=g("div"),s=g("div"),l=m(d),i=v(),r=g("div"),o=m(f),a=v(),w(s,"class","gameRuleTitle svelte-ycteg7"),w(r,"class","gameRuleDescription svelte-ycteg7"),w(n,"class","gameRule")},m(t,e){u(t,n,e),c(n,s),c(s,l),c(n,i),c(n,r),c(r,o),c(n,a)},p:t,d(t){t&&h(n)}}}function ie(t){let e,n,s,l,i,r,o,a,f,m,p,$,x;s=new tt({});let y=t[0],C=[];for(let e=0;e<y.length;e+=1)C[e]=le(se(t,y,e));return{c(){e=g("main"),n=g("div"),D(s.$$.fragment),l=v(),i=g("img"),o=v(),a=g("div"),f=g("div"),m=g("div"),m.textContent="Правила",p=v(),$=g("div");for(let t=0;t<C.length;t+=1)C[t].c();w(n,"class","headerWrapper svelte-ycteg7"),i.src!==(r="assets/images/344f394f6a49712235dfe8689450ec83.jpg")&&w(i,"src","assets/images/344f394f6a49712235dfe8689450ec83.jpg"),b(i,"position","absolute"),b(i,"z-index","0"),b(i,"top","0px"),b(i,"opacity","0.2"),b(i,"width","100%"),w(m,"class","gameRuleLabel svelte-ycteg7"),w($,"class","gameRules svelte-ycteg7"),w(f,"class","content svelte-ycteg7"),w(a,"class","body svelte-ycteg7"),w(e,"class","svelte-ycteg7")},m(t,r){u(t,e,r),c(e,n),G(s,n,null),c(e,l),c(e,i),c(e,o),c(e,a),c(a,f),c(f,m),c(f,p),c(f,$);for(let t=0;t<C.length;t+=1)C[t].m($,null);x=!0},p(t,[e]){if(1&e){let n;for(y=t[0],n=0;n<y.length;n+=1){const s=se(t,y,n);C[n]?C[n].p(s,e):(C[n]=le(s),C[n].c(),C[n].m($,null))}for(;n<C.length;n+=1)C[n].d(1);C.length=y.length}},i(t){x||(T(s.$$.fragment,t),x=!0)},o(t){j(s.$$.fragment,t),x=!1},d(t){t&&h(e),O(s),d(C,t)}}}function re(t){return[[{title:"Как общаться с другими игроками?",description:"Если нажать на чей-то ник, то можно написать сообщение, адресованное именно ему, но доступное для чтения всем остальным присутствующим на улице. Если нажать на конверт, то сообщение будет приватным и окажется видным только Вам и адресату."},{title:"Как начать игру?",description:"На главной странице можно создать партию самому, нажав кнопку «Создать». Либо же присоединиться к уже созданной заявке, нажав на красный крест справа от заявки. Игра начинается с того момента, когда наберётся указанное максимальное количество игроков, либо же истечёт время ожидания, а игроков в заявке будет 7 или более."},{title:"Какие роли есть в игре?",description:"После начала партии случайным образом происходит распределение ролей. Выбор ролей ограничивается тремя: комиссар, мафия и честный человек."},{title:"Как проходит игра?",description:"\nПервые две минуты игры уходят на то, чтоб мафия могла обсудить план действий. Далее игра приобретает циклический характер:\nДень:\n   — Голосование, выбор посадки (днём честные жители, во время обсуждения, пытаются вычислить, кто в игре — мафия, и путём голосования выбирают, кого посадить в тюрьму)\nНочь:\n   — Ход комиссара (комиссар может проверить любого игрока и узнать его настоящую роль, а ночью мафия убивает честных жителей)\n   — Ход мафии (чтобы убить честного жителя, мафия должна консолидированно проголосовать за одного и того же игрока)\nИгра продолжается до тех пор, пока в городе не останутся только честные жители или мафиози."},{title:"Комиссар (ком, шериф)",description:"Комиссар в свой ход может узнать роль любого другого игрока. А затем известить о своей проверке всех остальных. Если комиссар оказывается под угрозой посадки, то он должен огласить свою роль. Комиссар играет за честных жителей."},{title:"Честный человек (чиж, мир)",description:"Знает только свою роль. Должен помнить, что в игре есть комиссар, словам которого можно доверять."},{title:"Мафия",description:"Мафия видит свою роль и роль напарника. В первые две минуты у них есть возможность обсудить план на игру с помощью приватных сообщений. Ночью для убийства необходимо, чтоб каждый мафиози выбрал одну и ту же жертву."},{title:"Задача в игре",description:"Для мафии — убить всех честных жителей, для честных жителей — посадить всю мафию в тюрьму. Игра продолжается до тех пор, пока в городе не останутся только честные жители или мафиози.\nЭто очень краткие правила игры в мафию, но их вполне хватит для понимания процесса игры."}]]}class oe extends J{constructor(t){super(),K(this,t,re,ie,r,{})}}function ae(t){let e,n,s;var l=t[0];return l&&(e=new l({})),{c(){e&&D(e.$$.fragment),n=m("")},m(t,l){e&&G(e,t,l),u(t,n,l),s=!0},p(t,[s]){if(l!==(l=t[0])){if(e){V();const t=e;j(t.$$.fragment,1,0,(()=>{O(t,1)})),E()}l?(e=new l({}),D(e.$$.fragment),T(e.$$.fragment,1),G(e,n.parentNode,n)):e=null}},i(t){s||(e&&T(e.$$.fragment,t),s=!0)},o(t){e&&j(e.$$.fragment,t),s=!1},d(t){t&&h(n),e&&O(e,t)}}}function ce(t,e,n){let s;U.add(/^\/$/,(()=>n(0,s=ne))),U.add(/^\/game-rules$/,(()=>n(0,s=oe))),window.addEventListener("popstate",(()=>U.goWithoutPushState(location.pathname))),U.goWithoutPushState("/");const l=new class{constructor(t,e){this.elStyle=document.createElement("style"),this.elStyle.type="text/css",this.elStyle.innerText=t,this.attached=!1,e&&e((()=>this.detach))}update(t){this.elStyle.innerText=t}attach(){this.attached||(this.attached=!0,(document.head||document.body).appendChild(this.elStyle))}detach(){this.attached&&(this.attached=!1,this.elStyle.parentNode.removeChild(this.elStyle))}}("\n\t:root {\n\t\t--widthRate: 1;\n\t}\n\thtml {\n\t\tfont-size: 1px;\n\t}\n");l.attach();const i=()=>{const t=window.innerWidth/1920;l.update(`\n\t\t:root {\n\t\t\t--widthRate: ${t};\n\t\t}\n\t\thtml {\n\t\t\tfont-size: ${t}px;\n\t\t}\n\t`)};return window.addEventListener("resize",i),i(),[s]}return new class extends J{constructor(t){super(),K(this,t,ce,ae,r,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
