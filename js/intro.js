'use strict';
/* VELARIS — intro.js · secuencia de apertura (se carga con defer, después de app.js y extra.js) */
(()=>{
const root=document.documentElement,vi=document.getElementById('vi'),stop=()=>root.classList.remove('vi-on');
if(!vi||getComputedStyle(vi).display==='none'){if(vi)vi.remove();stop();return}
try{sessionStorage.setItem('vi','1')}catch(e){}

const cv=document.getElementById('vfx'),ctx=cv.getContext('2d'),R=Math.random,spans=[...vi.querySelectorAll('.vword span')];
let W=0,H=0,phase=0,fin=false,dead=false,TL=[],glints=[],last=0,tx=0,ty=0,mx=0,my=0;
const rs=()=>{const d=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)};
rs();addEventListener('resize',rs);

/* Polvo de oro, bokeh, láminas y destellos */
const GC=['248,231,161','212,175,55','255,251,232','168,132,44'];
const dust=Array.from({length:95},(_,i)=>({x:R(),y:R(),v:.004+R()*.016,dx:(R()-.5)*.0022,s:.35+R()*1.15,p:R()*6.28,c:GC[i%4]}));
const bokeh=Array.from({length:7},()=>({x:R(),y:R(),r:44+R()*110,v:.0012+R()*.003,p:R()*6.28}));
const leaves=Array.from({length:10},()=>({x:R(),y:R(),rot:R()*6.28,vr:(R()-.5)*.004,vx:(R()-.5)*.006,v:.004+R()*.008,len:3+R()*5,w:.8+R()*1.2,p:R()*6.28}));
const glint=(x,y,s=1)=>glints.push({x,y,born:performance.now(),life:950+R()*550,r:(9+R()*15)*s,rot:R()*1.57});
const PX=[['vpe',7],['vpw',5],['vpd',3]].map(([id,s])=>[document.getElementById(id),s]);
if(matchMedia('(pointer:fine)').matches)addEventListener('mousemove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});
['touchmove','wheel'].forEach(n=>vi.addEventListener(n,e=>e.preventDefault(),{passive:false}));

const loop=now=>{if(dead)return;requestAnimationFrame(loop);ctx.clearRect(0,0,W,H);const t=now/1000;
 for(const k of bokeh){k.y-=k.v*.016;if(k.y<-.3){k.y=1.3;k.x=R()}
  const g=ctx.createRadialGradient(k.x*W,k.y*H,0,k.x*W,k.y*H,k.r);
  g.addColorStop(0,`rgba(212,175,55,${.026+.02*Math.sin(t*.4+k.p)})`);g.addColorStop(1,'rgba(212,175,55,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(k.x*W,k.y*H,k.r,0,6.283);ctx.fill()}
 for(const f of leaves){f.y-=f.v*.016;f.x+=f.vx*.016;f.rot+=f.vr;if(f.y<-.05){f.y=1.05;f.x=R()}
  ctx.save();ctx.translate(f.x*W,f.y*H);ctx.rotate(f.rot);
  ctx.fillStyle=`rgba(212,175,55,${.05+.05*Math.abs(Math.sin(t*.7+f.p))})`;ctx.fillRect(-f.len/2,-f.w/2,f.len,f.w);ctx.restore()}
 for(const o of dust){o.y-=o.v*.016;o.x+=o.dx*.016;if(o.y<-.02){o.y=1.02;o.x=R()}
  ctx.fillStyle=`rgba(${o.c},${.1+.36*Math.abs(Math.sin(t*.95+o.p))})`;ctx.beginPath();ctx.arc(o.x*W,o.y*H,o.s,0,6.283);ctx.fill()}
 if(phase>=4&&!fin&&now-last>1900){last=now;glint(W/2+(R()-.5)*W*.4,H*.5+(R()-.5)*H*.26,.8)}
 for(let i=glints.length-1;i>=0;i--){const G=glints[i],q=(now-G.born)/G.life;if(q>=1){glints.splice(i,1);continue}
  const e=Math.sin(q*Math.PI),r=G.r*(.4+e*.9),s=r*.42;ctx.save();ctx.translate(G.x,G.y);ctx.rotate(G.rot);
  ctx.strokeStyle=`rgba(255,251,232,${.5*e})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
  ctx.strokeStyle=`rgba(248,231,161,${.26*e})`;ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(-s,-s);ctx.lineTo(s,s);ctx.moveTo(-s,s);ctx.lineTo(s,-s);ctx.stroke();
  ctx.fillStyle=`rgba(255,255,255,${.65*e})`;ctx.beginPath();ctx.arc(0,0,.9,0,6.283);ctx.fill();ctx.restore()}
 mx+=(tx-mx)*.04;my+=(ty-my)*.04;
 for(const [el,s] of PX)if(el)el.style.transform=`translate3d(${(mx*s).toFixed(2)}px,${(my*s).toFixed(2)}px,0)`};
requestAnimationFrame(loop);

/* Línea de tiempo: marco → emblema → firma letra a letra → divisor → bloom → salida */
const at=(ms,fn)=>TL.push(setTimeout(fn,ms)),ph=(c,n)=>{vi.classList.add(c);phase=n};
const end=()=>{if(fin)return;fin=true;TL.forEach(clearTimeout);vi.classList.add('out');stop();setTimeout(()=>{dead=true;vi.remove()},1400)};
const run=()=>{
 at(300,()=>ph('p1',1));
 at(800,()=>ph('p2',2));
 at(2400,()=>{ph('p4',4);spans.forEach((sp,i)=>at(i*115+520,()=>{const r=sp.getBoundingClientRect();glint(r.left+r.width/2,r.top+r.height*.36,.9)}))});
 at(4300,()=>ph('p5',5));
 at(5200,()=>{ph('p6',6);glint(W/2,H*.5,1.1)});
 at(7800,end)};
document.getElementById('vskip').addEventListener('click',end);

/* Espera a la tipografía para que la firma aparezca ya con su letra de lujo */
const fonts=document.fonts&&document.fonts.load?Promise.race([document.fonts.load('600 100px "Cormorant Garamond"'),new Promise(r=>setTimeout(r,1800))]):Promise.resolve();
fonts.then(run,run);
})();
