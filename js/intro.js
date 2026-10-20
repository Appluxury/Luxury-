'use strict';
/* VELARIS — intro.js · secuencia de apertura (se carga con defer, después de app.js y extra.js) — versión optimizada */
(()=>{
const root=document.documentElement,vi=document.getElementById('vi'),stop=()=>root.classList.remove('vi-on');
if(!vi||getComputedStyle(vi).display==='none'){if(vi)vi.remove();stop();return}
try{sessionStorage.setItem('vi','1')}catch(e){}

const cv=document.getElementById('vfx'),ctx=cv.getContext('2d'),R=Math.random,spans=[...vi.querySelectorAll('.vword span')];
const lowEnd=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4||innerWidth<700;
let W=0,H=0,phase=0,fin=false,dead=false,TL=[],glints=[],last=0,tx=0,ty=0,mx=0,my=0,pmx=0,pmy=0,prev=0,frames=0,sumDt=0,heavy=!lowEnd,raf=0;

/* Canvas: DPR limitado (a 2x son 4 veces más píxeles y son solo partículas suaves) */
const rs=()=>{const d=Math.min(lowEnd?1:1.5,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)};
let rt=0;rs();addEventListener('resize',()=>{cancelAnimationFrame(rt);rt=requestAnimationFrame(rs)});

/* Sprites pre-renderizados: drawImage es mucho más barato que crear gradientes y arcos cada frame */
const GC=['248,231,161','212,175,55','255,251,232','168,132,44'];
const mk=(n,fn)=>{const c=document.createElement('canvas');c.width=c.height=n;fn(c.getContext('2d'),n/2,n);return c};
const dustSpr=GC.map(c=>mk(32,(x,h,n)=>{const g=x.createRadialGradient(h,h,0,h,h,h);g.addColorStop(0,`rgba(${c},1)`);g.addColorStop(.4,`rgba(${c},.55)`);g.addColorStop(1,`rgba(${c},0)`);x.fillStyle=g;x.fillRect(0,0,n,n)}));
const bokehSpr=mk(128,(x,h,n)=>{const g=x.createRadialGradient(h,h,0,h,h,h);g.addColorStop(0,'rgba(212,175,55,1)');g.addColorStop(1,'rgba(212,175,55,0)');x.fillStyle=g;x.fillRect(0,0,n,n)});

const ND=lowEnd?40:75;
const dust=Array.from({length:ND},(_,i)=>({x:R(),y:R(),v:.004+R()*.016,dx:(R()-.5)*.0022,s:.35+R()*1.15,p:R()*6.28,c:i%4}));
const bokeh=Array.from({length:lowEnd?3:6},()=>({x:R(),y:R(),r:44+R()*110,v:.0012+R()*.003,p:R()*6.28}));
const leaves=Array.from({length:lowEnd?0:8},()=>({x:R(),y:R(),rot:R()*6.28,vr:(R()-.5)*.24,vx:(R()-.5)*.006,v:.004+R()*.008,len:3+R()*5,w:.8+R()*1.2,p:R()*6.28}));
const glint=(x,y,s=1)=>glints.push({x,y,born:performance.now(),life:950+R()*550,r:(9+R()*15)*s,rot:R()*1.57});
const PX=[['vpe',7],['vpw',5],['vpd',3]].map(([id,s])=>[document.getElementById(id),s]);
if(matchMedia('(pointer:fine)').matches)addEventListener('mousemove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});
['touchmove','wheel'].forEach(n=>vi.addEventListener(n,e=>e.preventDefault(),{passive:false}));

const loop=now=>{if(dead)return;raf=requestAnimationFrame(loop);
 const dt=Math.min(.05,prev?(now-prev)/1000:.016);prev=now;
 /* Calidad adaptativa: si los primeros frames van lentos, se baja el detalle automáticamente */
 if(frames<90){frames++;sumDt+=dt;if(frames===90&&sumDt/90>.028){heavy=false}}
 ctx.clearRect(0,0,W,H);const t=now/1000;
 if(heavy){
  for(const k of bokeh){k.y-=k.v*dt;if(k.y<-.3){k.y=1.3;k.x=R()}
   ctx.globalAlpha=.026+.02*Math.sin(t*.4+k.p);const d=k.r*2;ctx.drawImage(bokehSpr,k.x*W-k.r,k.y*H-k.r,d,d)}
  for(const f of leaves){f.y-=f.v*dt;f.x+=f.vx*dt;f.rot+=f.vr*dt;if(f.y<-.05){f.y=1.05;f.x=R()}
   ctx.save();ctx.translate(f.x*W,f.y*H);ctx.rotate(f.rot);
   ctx.fillStyle=`rgba(212,175,55,${.05+.05*Math.abs(Math.sin(t*.7+f.p))})`;ctx.fillRect(-f.len/2,-f.w/2,f.len,f.w);ctx.restore()}
 }
 const nd=heavy?dust.length:dust.length>>1;
 for(let i=0;i<nd;i++){const o=dust[i];o.y-=o.v*dt;o.x+=o.dx*dt;if(o.y<-.02){o.y=1.02;o.x=R()}
  ctx.globalAlpha=.1+.36*Math.abs(Math.sin(t*.95+o.p));const d=o.s*3.4;ctx.drawImage(dustSpr[o.c],o.x*W-d/2,o.y*H-d/2,d,d)}
 ctx.globalAlpha=1;
 if(phase>=4&&!fin&&now-last>1900){last=now;glint(W/2+(R()-.5)*W*.4,H*.5+(R()-.5)*H*.26,.8)}
 for(let i=glints.length-1;i>=0;i--){const G=glints[i],q=(performance.now()-G.born)/G.life;if(q>=1){glints.splice(i,1);continue}
  const e=Math.sin(q*Math.PI),r=G.r*(.4+e*.9),s=r*.42;ctx.save();ctx.translate(G.x,G.y);ctx.rotate(G.rot);
  ctx.strokeStyle=`rgba(255,251,232,${.5*e})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
  ctx.strokeStyle=`rgba(248,231,161,${.26*e})`;ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(-s,-s);ctx.lineTo(s,s);ctx.moveTo(-s,s);ctx.lineTo(s,-s);ctx.stroke();
  ctx.fillStyle=`rgba(255,255,255,${.65*e})`;ctx.beginPath();ctx.arc(0,0,.9,0,6.283);ctx.fill();ctx.restore()}
 /* Parallax: solo toca el DOM si realmente hay movimiento */
 mx+=(tx-mx)*.06;my+=(ty-my)*.06;
 if(Math.abs(mx-pmx)>.0004||Math.abs(my-pmy)>.0004){pmx=mx;pmy=my;
  for(const [el,s] of PX)if(el)el.style.transform=`translate3d(${(mx*s).toFixed(2)}px,${(my*s).toFixed(2)}px,0)`}};

/* Línea de tiempo: marco → emblema → firma letra a letra → divisor → bloom → salida */
const at=(ms,fn)=>TL.push(setTimeout(fn,ms)),ph=(c,n)=>{vi.classList.add(c);phase=n};
const end=()=>{if(fin)return;fin=true;TL.forEach(clearTimeout);vi.classList.add('out');stop();setTimeout(()=>{dead=true;cancelAnimationFrame(raf);vi.remove()},1400)};
const run=()=>{
 prev=0;raf=requestAnimationFrame(loop);
 at(300,()=>ph('p1',1));
 at(800,()=>ph('p2',2));
 at(2400,()=>{
  /* una sola lectura de layout para todos los destellos (antes: una por letra) */
  const fs=parseFloat(getComputedStyle(spans[0]||vi).fontSize)||80,rects=spans.map(sp=>sp.getBoundingClientRect());
  ph('p4',4);
  rects.forEach((r,i)=>at(i*115+520,()=>glint(r.left+r.width/2,r.top+r.height*.36-fs*.5,.9)))});
 at(4300,()=>ph('p5',5));
 at(5200,()=>{ph('p6',6);glint(W/2,H*.5,1.1)});
 at(7800,end)};
document.getElementById('vskip').addEventListener('click',end);

/* Arranca cuando la tipografía y la página han terminado de cargar (con tope), para que la carga
   de imágenes/scripts de la web no compita con la animación y la trabe */
const fonts=document.fonts&&document.fonts.load?Promise.race([document.fonts.load('600 100px "Cormorant Garamond"'),new Promise(r=>setTimeout(r,1800))]):Promise.resolve();
const loaded=document.readyState==='complete'?Promise.resolve():Promise.race([new Promise(r=>addEventListener('load',r,{once:true})),new Promise(r=>setTimeout(r,2500))]);
const go=()=>requestAnimationFrame(()=>requestAnimationFrame(run));
Promise.all([fonts,loaded]).then(go,go);
})();
