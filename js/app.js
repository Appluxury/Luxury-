'use strict';
/* VELARIS — app.js · Cosmos + Catálogo + Concierge + Admin */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=['Relojes','Chaquetas','Camisetas','Gafas','Accesorios'];
const SUB={Relojes:'Haute Horlogerie',Chaquetas:'Atelier Outerwear',Camisetas:'Essential Luxury',Gafas:'Eyewear Couture',Accesorios:'Leather & Fine Goods'};
const ASP=['Vista frontal','Detalle del material','Acabado artesanal','Perfil lateral','Firma de la maison','Interior y forro','En contexto','Presentación y estuche'];
const DET=['Silueta concebida en nuestro atelier.','Materia prima seleccionada con trazabilidad completa.','Acabado a mano por un único maestro artesano.','Proporciones equilibradas para una caída impecable.','Firma VELARIS grabada con discreción.','Interior cuidado con el mismo rigor que el exterior.','Diseñada para acompañar cada ocasión con discreción.','Entrega en estuche numerado con certificado de autenticidad.'];
const TPL='Estimado Concierge de VELARIS, solicito asistencia exclusiva para la pieza {nombre} (Ref: {sku}) de la colección {categoria}. Deseo coordinar los detalles de personalización y reserva privada. Quedo a su entera disposición.';
const INTRO='Estimado Concierge de VELARIS, solicito asistencia exclusiva para las siguientes piezas:';
const ph=(t,i)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F0F0F"/><stop offset="1" stop-color="hsl(${38+i*6},40%,22%)"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><rect x="36" y="36" width="728" height="928" fill="none" stroke="#E6CA65" stroke-opacity=".45"/><text x="400" y="500" fill="#D4AF37" font-family="Georgia,serif" font-size="52" text-anchor="middle">${t}</text><text x="400" y="560" fill="#FDFDFB" font-size="26" text-anchor="middle" opacity=".6">0${i+1} / 08</text></svg>`);
const SP=[['Relojes','Calibre Nocturne','VLR-001',18900,'oro rosa 18k y cristal de zafiro'],['Relojes','Tourbillon Aurea','VLR-002',42500,'platino y esfera de meteorito'],['Chaquetas','Biker Obsidiana','VCH-001',3450,'piel de cordero napa'],['Chaquetas','Abrigo Cachemir Noir','VCH-002',4900,'cachemira doble faz'],['Camisetas','Tee Mercerizada','VCA-001',390,'algodón egipcio mercerizado'],['Camisetas','Polo Seda Ivoire','VCA-002',520,'seda y algodón pima'],['Gafas','Aviator Champán','VGA-001',840,'titanio chapado en oro 18k'],['Gafas','Clubmaster Carey','VGA-002',690,'acetato italiano'],['Accesorios','Cartera Bespoke','VAC-001',1250,'piel de becerro de curtición vegetal'],['Accesorios','Foulard Seda Oro','VAC-002',480,'sarga de seda estampada a mano']];
const mk=(a,n)=>({id:'p'+n,cat:a[0],name:a[1],sku:a[2],price:a[3],cur:'EUR',stock:3,desc:'Pieza de la colección '+SUB[a[0]]+'.',imgs:ASP.map((t,i)=>({src:ph(a[1],i),txt:`${t} — ${a[1]}. Confeccionado en ${a[4]}. ${DET[i]}`}))});
const seed=()=>({cfg:{phone:'34602006585',user:'123',pass:'123',tpl:TPL,intro:INTRO,hv:'',hi:'',title:'El arte de lo irrepetible',sub:'Ultra Boutique · Colección Privada'},prods:SP.map(mk)});
const money=(n,c)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:c,maximumFractionDigits:0}).format(n);

/* Capa de datos asíncrona (localStorage). Para Supabase/Firebase: sustituye load()/save() por fetch() a tu tabla/colección con la misma firma. */
const KEY='velaris_v2';
const DB={
 async load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}},
 async save(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){toast('Memoria del navegador llena: usa archivos más ligeros o una URL.');return false}}
};
let tmr;const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tmr);tmr=setTimeout(()=>t.hidden=true,2800)};

let S,O=[],P=null,I=0,F='Todas',ED=null,AUTH=false,dt;
const fnd=id=>S.prods.find(p=>p.id===id),ol=()=>O.map(fnd).filter(Boolean),slides=()=>P?P.imgs.filter(m=>m.src):[];
const first=p=>(p.imgs.find(m=>m.src)||{}).src||'';
const rd=f=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});
const shrink=async(f,mx=1400)=>{const u=await rd(f);if(!f.type.startsWith('image/')||f.type==='image/svg+xml')return u;return new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,mx/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.82))};i.onerror=()=>r(u);i.src=u})};

/* WhatsApp Concierge */
const wa=t=>window.open('https://wa.me/'+String(S.cfg.phone).replace(/\D/g,'')+'?text='+encodeURIComponent(t),'_blank','noopener');
const one=p=>S.cfg.tpl.replaceAll('{nombre}',p.name).replaceAll('{sku}',p.sku).replaceAll('{categoria}',p.cat);
const msgO=()=>`${S.cfg.intro}\n\n${ol().map((p,i)=>`${i+1}. ${p.name} (Ref: ${p.sku}) — ${money(p.price,p.cur)}`).join('\n')}\n\n${$('#order-total').textContent}.\n\nDeseo coordinar los detalles de personalización y reserva privada. Quedo a su entera disposición.`;

/* Capas */
const lock=()=>document.body.style.overflow=$$('.ov').some(o=>!o.hidden)?'hidden':'';
const show=id=>{$('#'+id).hidden=false;lock()},hide=id=>{$('#'+id).hidden=true;lock()};

/* Universo: estrellas titilantes, polvo estelar dorado y nebulosas con paralaje táctil/scroll */
const cv=$('#cosmos'),cx=cv.getContext('2d'),R=Math.random,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let W=innerWidth,H=innerHeight,stars=[],dust=[],neb=[],px=0,py=0,tx=0,ty=0,sy=0;
const rs=()=>{const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)};
const init=()=>{const n=Math.round(Math.min(260,Math.max(160,W*H/6000)));
 stars=Array.from({length:n},()=>({x:R()*W,y:R()*H,z:.15+R()*.85,r:.3+R()*1.1,p:R()*6.28,s:.4+R()*1.6}));
 dust=Array.from({length:70},()=>({x:R()*W,y:R()*H,z:.3+R()*.7,r:.8+R()*2,vx:(R()-.5)*.2,vy:-.08-R()*.25,a:.25+R()*.5}));
 neb=Array.from({length:5},(_,i)=>({x:R()*W,y:R()*H,z:.2+R()*.5,r:260+R()*320,vx:(R()-.5)*.12,vy:(R()-.5)*.08,c:i%2?'rgba(212,175,55,.055)':'rgba(70,50,110,.09)'}))};
const wrap=(v,m)=>((v%m)+m)%m;
const draw=t=>{px+=(tx-px)*.05;py+=(ty-py)*.05;cx.clearRect(0,0,W,H);cx.globalCompositeOperation='source-over';
 for(const n of neb){n.x=wrap(n.x+n.vx,W);n.y=wrap(n.y+n.vy,H);const x=n.x-px*40*n.z,y=n.y-py*40*n.z-sy*.06*n.z,g=cx.createRadialGradient(x,y,0,x,y,n.r);g.addColorStop(0,n.c);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(x-n.r,y-n.r,n.r*2,n.r*2)}
 for(const s of stars){const x=wrap(s.x-px*70*s.z,W),y=wrap(s.y-py*70*s.z-sy*.35*s.z,H),a=(.3+.7*(.5+.5*Math.sin(t*.001*s.s+s.p)))*(.4+.6*s.z);cx.fillStyle=`rgba(253,253,251,${a})`;cx.beginPath();cx.arc(x,y,s.r*(.6+s.z),0,6.283);cx.fill()}
 cx.globalCompositeOperation='lighter';
 for(const d of dust){d.x=wrap(d.x+d.vx,W);d.y=wrap(d.y+d.vy,H);const x=wrap(d.x-px*110*d.z,W),y=wrap(d.y-py*110*d.z-sy*.5*d.z,H),g=cx.createRadialGradient(x,y,0,x,y,d.r*4);g.addColorStop(0,`rgba(230,202,101,${d.a})`);g.addColorStop(1,'rgba(212,175,55,0)');cx.fillStyle=g;cx.fillRect(x-d.r*4,y-d.r*4,d.r*8,d.r*8)}
 if(!reduce)requestAnimationFrame(draw)};
addEventListener('resize',()=>{rs();init();if(reduce)draw(0)});
addEventListener('scroll',()=>sy=scrollY,{passive:true});
addEventListener('touchmove',e=>{const t=e.touches[0];tx=(t.clientX/W-.5)*2;ty=(t.clientY/H-.5)*2},{passive:true});
const gl=$('#glow');
addEventListener('pointermove',e=>{gl.style.transform=`translate3d(${e.clientX-160}px,${e.clientY-160}px,0)`;tx=(e.clientX/W-.5)*2;ty=(e.clientY/H-.5)*2;const c=e.target.closest&&e.target.closest('.card,.btn');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}},{passive:true});

/* Render público */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
const reveal=()=>$$('.rv:not(.in)').forEach(n=>io.observe(n));
const rO=()=>{const l=ol(),t={};$('#order-count').textContent=l.length;
 $('#order-list').innerHTML=l.map(p=>{t[p.cur]=(t[p.cur]||0)+p.price;return `<li><img src="${E(first(p))}" alt=""><span>${E(p.name)}<small>${E(p.sku)}</small></span><b>${money(p.price,p.cur)}</b><button type="button" class="btn sm ghost" data-rm="${p.id}" aria-label="Quitar">✕</button></li>`}).join('');
 $('#order-empty').hidden=l.length>0;const to=$('#order-total');to.hidden=!l.length;to.textContent='Total estimado: '+Object.entries(t).map(([c,v])=>money(v,c)).join(' + ')};
const rdr=()=>{const c=S.cfg,hv=$('#hero-video');
 $('#hero-title').textContent=c.title;$('#hero-sub').textContent=c.sub;
 $('#hero-fallback').style.backgroundImage=c.hi?`url("${c.hi}")`:'';
 if(c.hv){if(hv.dataset.s!==c.hv){hv.dataset.s=c.hv;hv.src=c.hv}hv.hidden=false;const p=hv.play();if(p)p.catch(()=>hv.hidden=true)}else{delete hv.dataset.s;hv.removeAttribute('src');hv.load();hv.hidden=true}
 $('#cat-tabs').innerHTML=['Todas',...CATS].map(k=>`<button type="button" role="tab" class="tab${k===F?' on':''}" data-cat="${k}">${k}</button>`).join('');
 $$('#nav-cats button').forEach(b=>b.classList.toggle('on',b.dataset.cat===F));
 const g=$('#grid'),t=$('#tpl-card'),L=S.prods.filter(p=>F==='Todas'||p.cat===F);g.innerHTML='';
 L.forEach(p=>{const n=t.content.firstElementChild.cloneNode(true),im=n.querySelector('img');n.dataset.id=p.id;n.classList.add('rv');im.src=first(p);im.alt=p.name;n.querySelector('p[data-cat]').textContent=SUB[p.cat];n.querySelector('[data-name]').textContent=p.name;n.querySelector('[data-price]').textContent=money(p.price,p.cur);n.querySelector('[data-sku]').textContent=p.sku;n.querySelector('.badge').hidden=p.stock>0;g.append(n)});
 $('#grid-empty').hidden=L.length>0;reveal();rO()};

/* Galería sincronizada (foto + descripción con cross-fade) y visor con zoom */
let Z={s:1,x:0,y:0};
const tf=()=>{$('#lb-img').style.transform=`translate3d(${Z.x}px,${Z.y}px,0) scale(${Z.s})`;$('#lb-zreset').textContent=Z.s.toFixed(1).replace('.0','')+'×'};
const zr=()=>{Z={s:1,x:0,y:0};tf()};
const zs=v=>{Z.s=Math.min(5,Math.max(1,v));if(Z.s===1)Z.x=Z.y=0;tf()};
const paint=full=>{const L=slides();if(!L.length){$('#gal-desc').textContent=P.desc;return}I=(I+L.length)%L.length;const m=L[I],txt=m.txt||P.desc;
 $('#gal-img').src=$('#lb-img').src=m.src;$('#gal-img').alt=$('#lb-img').alt=P.name;
 $('#gal-count').textContent=$('#lb-count').textContent=`${I+1} / ${L.length}`;
 const ds=[$('#gal-desc'),$('#lb-desc')];clearTimeout(dt);
 if(full)ds.forEach(d=>{d.textContent=txt;d.classList.remove('out')});
 else{ds.forEach(d=>d.classList.add('out'));dt=setTimeout(()=>ds.forEach(d=>{d.textContent=txt;d.classList.remove('out')}),280)}
 if(full)['gal-thumbs','lb-thumbs'].forEach(k=>$('#'+k).innerHTML=L.map((x,i)=>`<img src="${E(x.src)}" data-t="${i}" alt="Foto ${i+1}">`).join(''));
 $$('.thumbs img').forEach(t=>t.classList.toggle('on',+t.dataset.t===I));zr()};
const openP=id=>{P=fnd(id);if(!P)return;I=0;$('#pm-cat').textContent=SUB[P.cat];$('#pm-name').textContent=P.name;$('#pm-price').textContent=money(P.price,P.cur);$('#pm-sku').textContent=P.sku+(P.stock>0?'':' · Agotado');show('modal-product');paint(true)};
const add=id=>{if(!O.includes(id))O.push(id);rO();toast('Añadido al pedido VIP')};
const st=$('#lb-stage'),ptr=new Map();let d0=0,s0=1;
const dist=()=>{const [a,b]=[...ptr.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
st.addEventListener('pointerdown',e=>{ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});st.setPointerCapture(e.pointerId);if(ptr.size===2){d0=dist();s0=Z.s}});
st.addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);if(!p)return;const n={x:e.clientX,y:e.clientY};if(ptr.size===2){ptr.set(e.pointerId,n);zs(s0*dist()/d0)}else{if(Z.s>1){Z.x+=n.x-p.x;Z.y+=n.y-p.y;tf()}ptr.set(e.pointerId,n)}});
const up=e=>{ptr.delete(e.pointerId);if(Z.s<=1.02)zr()};
st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
st.addEventListener('dblclick',()=>Z.s>1?zr():zs(2.5));
st.addEventListener('wheel',e=>{e.preventDefault();zs(Z.s-e.deltaY/300)},{passive:false});
$('#lb-zin').onclick=()=>zs(Z.s+.5);$('#lb-zout').onclick=()=>zs(Z.s-.5);$('#lb-zreset').onclick=zr;
$('#gal-prev').onclick=$('#lb-prev').onclick=()=>{I--;paint()};
$('#gal-next').onclick=$('#lb-next').onclick=()=>{I++;paint()};
const openLb=()=>{show('lightbox');zr()};
$('#gal-stage').addEventListener('click',e=>{if(!e.target.closest('.ar'))openLb()});
$('#gal-stage').addEventListener('keydown',e=>{if(e.key==='Enter')openLb()});
$('#pm-wa').onclick=$('#lb-wa').onclick=()=>wa(one(P));
$('#pm-add').onclick=()=>add(P.id);

/* Pedido VIP y Concierge */
$('#btn-order').onclick=()=>{rO();show('modal-order')};
$('#order-send').onclick=()=>O.length?wa(msgO()):toast('Añada primero alguna pieza a su pedido.');
$('#order-clear').onclick=()=>{O=[];rO()};
$('#btn-conc').onclick=()=>wa('Estimado Concierge de VELARIS, solicito asistencia exclusiva para conocer las piezas disponibles. Quedo a su entera disposición.');

/* Eventos globales */
document.addEventListener('click',e=>{const t=e.target;
 const c=t.closest('button[data-cat]');if(c){F=c.dataset.cat;rdr();$('#catalogo').scrollIntoView({behavior:'smooth'});return}
 const th=t.closest('.thumbs img');if(th){I=+th.dataset.t;paint();return}
 const rm=t.closest('[data-rm]');if(rm){O=O.filter(x=>x!==rm.dataset.rm);rO();return}
 const cl=t.closest('[data-close]');if(cl){hide(cl.closest('.ov').id);return}
 if(t.matches('.ov:not(.lb)'))hide(t.id)});
$('#grid').addEventListener('click',e=>{const card=e.target.closest('.card');if(!card)return;const id=card.dataset.id;
 if(e.target.closest('[data-wa]'))wa(one(fnd(id)));else if(e.target.closest('[data-add]'))add(id);else if(e.target.closest('[data-open]'))openP(id)});
$('#grid').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('figure[data-open]'))openP(e.target.closest('.card').dataset.id)});
addEventListener('keydown',e=>{const o=$$('.ov').filter(x=>!x.hidden).pop();if(!o)return;if(e.key==='Escape')hide(o.id);if(P&&(o.id==='modal-product'||o.id==='lightbox')){if(e.key==='ArrowRight'){I++;paint()}if(e.key==='ArrowLeft'){I--;paint()}}});

/* Panel de administración */
const hs=()=>$('#hr-status').textContent=`Vídeo: ${S.cfg.hv?'cargado':'sin cargar'} · Imagen de respaldo: ${S.cfg.hi?'personalizada':'por defecto'}.`;
const alist=()=>{$('#adm-form').hidden=true;$('#adm-listbox').hidden=false;$('#adm-list').innerHTML=S.prods.map(p=>`<li><img src="${E(first(p))}" alt=""><span>${E(p.name)}<small>${p.cat} · ${E(p.sku)} · ${money(p.price,p.cur)} · stock ${p.stock}</small></span><button type="button" class="btn sm ghost" data-ed="${p.id}">Editar</button><button type="button" class="btn sm ghost" data-del="${p.id}">Eliminar</button></li>`).join('')||'<li class="empty">Sin piezas. Crea la primera.</li>'};
const adm=k=>{$$('[data-adm]').forEach(b=>b.classList.toggle('on',b.dataset.adm===k));['prods','hero','conf'].forEach(v=>$('#adm-'+v).hidden=v!==k);const c=S.cfg;
 if(k==='hero'){$('#hr-title').value=c.title;$('#hr-sub').value=c.sub;$('#hr-url').value=c.hv.startsWith('data:')?'':c.hv;hs()}
 if(k==='conf'){$('#cf-phone').value=c.phone;$('#cf-user').value=c.user;$('#cf-pass').value=c.pass;$('#cf-tpl').value=c.tpl;$('#cf-intro').value=c.intro}
 if(k==='prods'){ED=null;alist()}};
const gate=()=>{$('#admin-login').hidden=AUTH;$('#admin-panel').hidden=!AUTH;if(AUTH)adm('prods')};
$('#btn-admin').onclick=()=>{gate();show('modal-admin')};
$('#admin-login').addEventListener('submit',e=>{e.preventDefault();if($('#lg-user').value===S.cfg.user&&$('#lg-pass').value===S.cfg.pass){AUTH=true;$('#lg-err').hidden=true;e.target.reset();gate()}else $('#lg-err').hidden=false});
$('#adm-logout').onclick=()=>{AUTH=false;ED=null;gate()};
$$('[data-adm]').forEach(b=>b.onclick=()=>adm(b.dataset.adm));

const form=$('#adm-form');
const slotsR=()=>{const ul=$('#slots'),t=$('#tpl-slot');ul.innerHTML='';ED.imgs.forEach((m,i)=>{const n=t.content.firstElementChild.cloneNode(true),im=n.querySelector('img');n.dataset.i=i;n.querySelector('.slot-n b').textContent=i+1;im.hidden=!m.src;if(m.src)im.src=m.src;n.querySelector('.slot-empty').hidden=!!m.src;n.querySelector('[data-slot-txt]').value=m.txt;ul.append(n)})};
const edit=p=>{ED=p?JSON.parse(JSON.stringify(p)):{id:'p'+Date.now(),cat:CATS[0],name:'',sku:'',price:0,cur:'EUR',stock:1,desc:'',imgs:[]};ED._new=!p;
 while(ED.imgs.length<8)ED.imgs.push({src:'',txt:''});
 $('#adm-form-title').textContent=p?'Editar pieza':'Nueva pieza';const f=form.elements;['cat','name','sku','price','cur','stock','desc'].forEach(k=>f[k].value=ED[k]);
 $('#adm-listbox').hidden=true;form.hidden=false;slotsR();$('#adm-prods').scrollTop=0};
$('#adm-new').onclick=()=>edit();
$('#adm-cancel').onclick=()=>{ED=null;alist()};
$('#adm-list').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.ed)edit(fnd(b.dataset.ed));
 if(b.dataset.del&&confirm('¿Eliminar esta pieza?')){S.prods=S.prods.filter(p=>p.id!==b.dataset.del);O=O.filter(x=>x!==b.dataset.del);await DB.save(S);rdr();alist()}});
$('#slots').addEventListener('click',e=>{const li=e.target.closest('.slot');if(!li)return;const i=+li.dataset.i,a=ED.imgs;
 if(e.target.closest('[data-slot-del]'))a[i]={src:'',txt:''};
 else if(e.target.closest('[data-slot-up]')&&i>0)[a[i-1],a[i]]=[a[i],a[i-1]];
 else if(e.target.closest('[data-slot-down]')&&i<7)[a[i+1],a[i]]=[a[i],a[i+1]];
 else return;slotsR()});
$('#slots').addEventListener('input',e=>{const li=e.target.closest('.slot');if(li&&e.target.matches('[data-slot-txt]'))ED.imgs[+li.dataset.i].txt=e.target.value});
$('#slots').addEventListener('change',async e=>{const li=e.target.closest('.slot'),f=e.target.files&&e.target.files[0];if(!li||!f||!e.target.matches('[data-slot-file]'))return;ED.imgs[+li.dataset.i].src=await shrink(f);slotsR()});
form.addEventListener('submit',async e=>{e.preventDefault();const f=form.elements;['cat','name','sku','cur','desc'].forEach(k=>ED[k]=f[k].value.trim());ED.price=+f.price.value||0;ED.stock=Math.max(0,parseInt(f.stock.value)||0);
 const {_new,...p}=ED;if(_new)S.prods.push(p);else S.prods[S.prods.findIndex(x=>x.id===p.id)]=p;
 await DB.save(S);ED=null;rdr();alist();toast('Pieza guardada')});

const sv=async()=>{await DB.save(S);rdr();hs()};
[['hr-title','title'],['hr-sub','sub'],['hr-url','hv']].forEach(([id,k])=>$('#'+id).addEventListener('change',e=>{S.cfg[k]=e.target.value.trim();sv()}));
$('#hr-video').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(f.size>3.5e6){toast('El vídeo supera ~3,5 MB: usa un clip corto o una URL.');e.target.value='';return}S.cfg.hv=await rd(f);e.target.value='';$('#hr-url').value='';sv()});
$('#hr-img').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;S.cfg.hi=await shrink(f,2000);e.target.value='';sv()});
$('#hr-video-del').onclick=()=>{S.cfg.hv='';$('#hr-url').value='';sv()};
$('#hr-img-del').onclick=()=>{S.cfg.hi='';sv()};
$('#cf-save').onclick=async()=>{const g=id=>$('#'+id).value.trim(),u=g('cf-user'),pw=g('cf-pass'),tel=g('cf-phone').replace(/\D/g,'');
 if(!u||!pw||!tel){toast('Usuario, contraseña y WhatsApp son obligatorios.');return}
 Object.assign(S.cfg,{phone:tel,user:u,pass:pw,tpl:g('cf-tpl')||TPL,intro:g('cf-intro')||INTRO});await DB.save(S);toast('Ajustes guardados')};
$('#cf-reset').onclick=async()=>{if(!confirm('Se borrarán tus cambios y volverán los datos de ejemplo.'))return;S=seed();O=[];await DB.save(S);rdr();adm('conf');toast('Datos restaurados')};

/* Arranque */
(async()=>{S=(await DB.load())||seed();S.cfg={...seed().cfg,...S.cfg};
 $$('.hero-copy,.sec-head,.conc-card').forEach(n=>n.classList.add('rv'));
 $('#hero-video').addEventListener('error',e=>e.target.hidden=true);
 rdr();rs();init();reduce?draw(0):requestAnimationFrame(draw)})();
