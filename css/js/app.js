'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=['Relojes','Chaquetas','Camisetas','Gafas','Accesorios'];
const SUB={Relojes:'Haute Horlogerie',Chaquetas:'Atelier Outerwear',Camisetas:'Essential Luxury',Gafas:'Eyewear Couture',Accesorios:'Leather & Fine Goods'};
const ASP=['Vista frontal','Detalle del material','Acabado artesanal','Perfil lateral','Firma de la maison','Interior y forro','En contexto','Presentación y estuche'];
const DET=['Silueta concebida en nuestro atelier.','Materia prima seleccionada con trazabilidad completa.','Acabado a mano por un único maestro artesano.','Proporciones equilibradas para una caída impecable.','Firma VELARIS grabada con discreción.','Interior cuidado con el mismo rigor que el exterior.','Diseñada para acompañar cada ocasión con discreción.','Entrega en estuche numerado con certificado de autenticidad.'];
const TPL='Estimado Concierge de VELARIS, estoy interesado/a en adquirir la pieza exclusiva {nombre} (Ref: {sku}) de la colección {categoria}. Me gustaría recibir asistencia personal para concretar el pedido y detalles de entrega. Quedo a su disposición.';
const ph=(t,i)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#161616"/><stop offset="1" stop-color="hsl(${38+i*6},40%,24%)"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><rect x="36" y="36" width="728" height="928" fill="none" stroke="#D4AF37" stroke-opacity=".45"/><text x="400" y="500" fill="#D4AF37" font-family="Georgia,serif" font-size="52" text-anchor="middle">${t}</text><text x="400" y="560" fill="#F9F9F6" font-size="26" text-anchor="middle" opacity=".6">0${i+1} / 08</text></svg>`);
const SP=[['Relojes','Calibre Nocturne','VLR-001',18900,'oro rosa 18k y cristal de zafiro'],['Relojes','Tourbillon Aurea','VLR-002',42500,'platino y esfera de meteorito'],['Chaquetas','Biker Obsidiana','VCH-001',3450,'piel de cordero napa'],['Chaquetas','Abrigo Cachemir Noir','VCH-002',4900,'cachemira doble faz'],['Camisetas','Tee Mercerizada','VCA-001',390,'algodón egipcio mercerizado'],['Camisetas','Polo Seda Ivoire','VCA-002',520,'seda y algodón pima'],['Gafas','Aviator Champán','VGA-001',840,'titanio chapado en oro 18k'],['Gafas','Clubmaster Carey','VGA-002',690,'acetato italiano'],['Accesorios','Cartera Bespoke','VAC-001',1250,'piel de becerro de curtición vegetal'],['Accesorios','Foulard Seda Oro','VAC-002',480,'sarga de seda estampada a mano']];
const mk=(a,n)=>({id:'p'+n,cat:a[0],name:a[1],sku:a[2],price:a[3],cur:'EUR',stock:true,desc:'Pieza de la colección '+SUB[a[0]]+'.',imgs:ASP.map((t,i)=>({src:ph(a[1],i),txt:`${t} — ${a[1]}. Confeccionado en ${a[4]}. ${DET[i]}`}))});
const seed=()=>({cfg:{phone:'34602006585',tpl:TPL,pin:'1234',hv:'',hi:'',htt:'El arte de lo irrepetible',hs:'Ultra Boutique · Colección Privada'},prods:SP.map(mk)});
const money=(n,c)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:c,maximumFractionDigits:0}).format(n);

/* Capa de datos asíncrona. Para Supabase/Firebase basta reemplazar load/save por fetch() a tu tabla/colección con la misma firma. */
const DB={
 async load(){try{return JSON.parse(localStorage.getItem('velaris_v1'))}catch(e){return null}},
 async save(d){try{localStorage.setItem('velaris_v1',JSON.stringify(d));return true}catch(e){alert('Memoria del navegador llena. Usa archivos más ligeros o una URL externa.');return false}}
};
let S,O=[],P=null,I=0,F='Todos',ED=null,TAB='p',AUTH=false;
const fnd=id=>S.prods.find(p=>p.id===id);
const ol=()=>O.map(fnd).filter(Boolean);
const rd=f=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});
const shrink=async(f,mx=1400)=>{const u=await rd(f);if(!f.type.startsWith('image/')||f.type==='image/svg+xml')return u;return new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,mx/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.82))};i.onerror=()=>r(u);i.src=u})};

/* WhatsApp Concierge */
const wa=t=>window.open('https://wa.me/'+String(S.cfg.phone).replace(/\D/g,'')+'?text='+encodeURIComponent(t),'_blank','noopener');
const one=p=>S.cfg.tpl.replaceAll('{nombre}',p.name).replaceAll('{sku}',p.sku).replaceAll('{categoria}',p.cat);
const msgO=()=>{const l=ol(),t={};l.forEach(p=>t[p.cur]=(t[p.cur]||0)+p.price);return `Estimado Concierge de VELARIS, deseo solicitar las siguientes piezas exclusivas:\n\n${l.map((p,i)=>`${i+1}. ${p.name} (Ref: ${p.sku}) — ${money(p.price,p.cur)}`).join('\n')}\n\nTotal estimado: ${Object.entries(t).map(([c,v])=>money(v,c)).join(' + ')}\n\nQuedo a su disposición para concretar el pedido y los detalles de entrega. Muchas gracias.`};

/* Render público */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
const rO=()=>{const l=ol();$('#oc').textContent=l.length;$('#ob').innerHTML=l.length?l.map(p=>`<div class="ar2"><img src="${E(p.imgs.find(m=>m.src)?.src||'')}" alt=""><span>${E(p.name)}<small>${E(p.sku)}</small></span><b>${money(p.price,p.cur)}</b><button class="btn sm ghost" data-act="rem" data-v="${p.id}">✕</button></div>`).join('')+'<button class="btn" data-act="send">Procesar Pedido Demo</button>':'<p class="em">Su selección está vacía.</p>'};
const rdr=()=>{const c=S.cfg,hv=$('#hv');
 $('#htt').textContent=c.htt;$('#hs').textContent=c.hs;$('#hi').style.backgroundImage=c.hi?`url("${c.hi}")`:'';
 if(c.hv){if(hv.dataset.s!==c.hv){hv.dataset.s=c.hv;hv.src=c.hv}hv.hidden=false;const pr=hv.play();if(pr)pr.catch(()=>hv.hidden=true)}else{delete hv.dataset.s;hv.removeAttribute('src');hv.hidden=true}
 $('#nav').innerHTML=['Todos',...CATS].map(k=>`<button class="${k===F?'on':''}" data-act="filter" data-v="${k}">${k}</button>`).join('');
 $('#grid').innerHTML=S.prods.filter(p=>F==='Todos'||p.cat===F).map(p=>`<article class="card glass rv"><div class="ci" data-act="view" data-v="${p.id}"><img loading="lazy" src="${E(p.imgs.find(m=>m.src)?.src||'')}" alt="${E(p.name)}">${p.stock?'':'<span class="tag">Agotado</span>'}</div><div class="cb"><p class="ey">${SUB[p.cat]}</p><h3>${E(p.name)}</h3><p class="pr">${money(p.price,p.cur)}<small>${E(p.sku)}</small></p><button class="btn" data-act="wa" data-v="${p.id}">Solicitar Atelier / WhatsApp VIP</button><div class="row"><button class="btn sm ghost" data-act="view" data-v="${p.id}">Ver pieza</button><button class="btn sm ghost" data-act="add" data-v="${p.id}">+ Pedido</button></div></div></article>`).join('')||'<p class="em">Sin piezas en esta categoría.</p>';
 $$('.rv:not(.in)').forEach(n=>io.observe(n));rO()};

/* Overlays */
const sync=()=>document.body.style.overflow=$('.ov.on')?'hidden':'';
const on=id=>{$('#'+id).classList.add('on');sync()},off=id=>{$('#'+id).classList.remove('on');sync()};

/* Carrusel sincronizado (imagen + descripción con cross-fade) y zoom */
let Z={s:1,x:0,y:0};
const tf=()=>$('#li').style.transform=`translate3d(${Z.x}px,${Z.y}px,0) scale(${Z.s})`;
const zr=()=>{Z={s:1,x:0,y:0};tf()};
const paint=full=>{const L=P.imgs.filter(m=>m.src);if(!L.length)return;I=(I+L.length)%L.length;const m=L[I];
 $('#pi').src=$('#li').src=m.src;
 ['pd','ld'].forEach(k=>{const e=$('#'+k);if(full){e.textContent=m.txt}else{e.classList.add('o');setTimeout(()=>{e.textContent=m.txt;e.classList.remove('o')},250)}});
 if(full)['pt','lt'].forEach(k=>$('#'+k).innerHTML=L.map((x,i)=>`<img src="${E(x.src)}" data-act="thumb" data-v="${i}" alt="">`).join(''));
 $$('.th img').forEach(t=>t.classList.toggle('on',+t.dataset.v===I));zr()};
const open=id=>{P=fnd(id);if(!P)return;I=0;$('#pc').textContent=SUB[P.cat];$('#pn').textContent=P.name;$('#pr').textContent=money(P.price,P.cur)+' · '+P.sku;
 $('.stage').querySelectorAll('.ar').forEach(a=>a.remove());
 $('.stage').insertAdjacentHTML('beforeend','<button class="ar l" data-act="prev">‹</button><button class="ar r" data-act="next">›</button>');
 on('pm');paint(true)};
const ls=$('#ls'),ptr=new Map();let d0=0,s0=1;
const dist=()=>{const [a,b]=[...ptr.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
ls.onpointerdown=e=>{ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});ls.setPointerCapture(e.pointerId);if(ptr.size===2){d0=dist();s0=Z.s}};
ls.onpointermove=e=>{const p=ptr.get(e.pointerId);if(!p)return;const n={x:e.clientX,y:e.clientY};if(ptr.size===2){ptr.set(e.pointerId,n);Z.s=Math.min(5,Math.max(1,s0*dist()/d0))}else{if(Z.s>1){Z.x+=n.x-p.x;Z.y+=n.y-p.y}ptr.set(e.pointerId,n)}tf()};
ls.onpointerup=ls.onpointercancel=e=>{ptr.delete(e.pointerId);if(Z.s<=1.02)zr()};
ls.ondblclick=()=>{if(Z.s>1)zr();else{Z.s=2.5;tf()}};
ls.onwheel=e=>{e.preventDefault();Z.s=Math.min(5,Math.max(1,Z.s-e.deltaY/300));if(Z.s===1)Z.x=Z.y=0;tf()};

/* Panel de administración */
const lst=()=>`<div class="row"><button class="btn" data-act="new">+ Nueva pieza</button></div>`+S.prods.map(p=>`<div class="ar2"><img src="${E(p.imgs.find(m=>m.src)?.src||'')}" alt=""><span>${E(p.name)}<small>${p.cat} · ${E(p.sku)} · ${money(p.price,p.cur)}</small></span><button class="btn sm ghost" data-act="edit" data-v="${p.id}">Editar</button><button class="btn sm ghost" data-act="del" data-v="${p.id}">Eliminar</button></div>`).join('');
const edit=()=>`<h3 class="gt">${ED._new?'Nueva pieza':'Editar pieza'}</h3><div class="fg"><label>Categoría<select data-k="cat">${CATS.map(c=>`<option ${c===ED.cat?'selected':''}>${c}</option>`).join('')}</select></label><label>Nombre<input data-k="name" value="${E(ED.name)}"></label><label>Referencia (SKU)<input data-k="sku" value="${E(ED.sku)}"></label><label>Precio<input type="number" data-k="price" value="${E(ED.price)}"></label><label>Divisa<select data-k="cur">${['EUR','USD','GBP','CHF'].map(c=>`<option ${c===ED.cur?'selected':''}>${c}</option>`).join('')}</select></label><label><span>Disponibilidad</span><span><input type="checkbox" data-k="stock" ${ED.stock?'checked':''}> Disponible</span></label><label class="w">Descripción general<textarea data-k="desc">${E(ED.desc)}</textarea></label></div><h3>Galería · 8 ranuras</h3><div class="slots">${ED.imgs.map((m,i)=>`<div class="slot"><div class="sp">${m.src?`<img src="${E(m.src)}" alt="">`:'<span>Vacía</span>'}</div><div class="row"><label class="btn sm">${m.src?'Cambiar foto':'Subir foto'}<input type="file" accept="image/*" hidden data-u="${i}"></label><button class="btn sm ghost" data-act="rm" data-v="${i}">Quitar</button></div><textarea data-s="${i}" placeholder="Descripción de la foto ${i+1}">${E(m.txt)}</textarea></div>`).join('')}</div><div class="row"><button class="btn" data-act="save">Guardar pieza</button><button class="btn ghost" data-act="cancel">Cancelar</button></div>`;
const hero=()=>{const c=S.cfg;return `<h3 class="gt">Portada de VELARIS</h3><div class="fg"><label class="w">Título<input data-g="htt" value="${E(c.htt)}"></label><label class="w">Subtítulo<input data-g="hs" value="${E(c.hs)}"></label><label class="w">Vídeo por URL (opcional)<input data-g="hv" value="${E(c.hv.startsWith('data:')?'':c.hv)}" placeholder="https://…/video.mp4"></label></div><div class="row"><label class="btn">Subir/Cambiar vídeo<input type="file" accept="video/*" hidden data-u="hv"></label><button class="btn ghost" data-act="rmv">Quitar vídeo</button><label class="btn">Subir/Cambiar portada<input type="file" accept="image/*" hidden data-u="hi"></label><button class="btn ghost" data-act="rmi">Quitar portada</button></div><p class="em">Estado: vídeo ${c.hv?'cargado':'sin cargar'} · imagen de respaldo ${c.hi?'personalizada':'por defecto'}. Los vídeos subidos desde el iPad se guardan en el navegador (máx. ~3,5 MB); para vídeos largos usa una URL.</p>`};
const conc=()=>{const c=S.cfg;return `<h3 class="gt">Concierge VIP</h3><div class="fg"><label>WhatsApp (con prefijo, sin +)<input data-g="phone" value="${E(c.phone)}" inputmode="tel"></label><label>Clave del panel<input data-g="pin" value="${E(c.pin)}"></label><label class="w">Plantilla del mensaje (usa {nombre}, {sku} y {categoria})<textarea data-g="tpl" style="min-height:140px">${E(c.tpl)}</textarea></label></div>`};
const adm=()=>{const ab=$('#ab'),y=ab.scrollTop;
 if(!AUTH){$('#at').innerHTML='';ab.innerHTML='<div class="pinb"><h3 class="gt">Acceso privado</h3><input id="pin" type="password" inputmode="numeric" placeholder="Clave"><button class="btn" data-act="pin">Entrar</button></div>';return}
 $('#at').innerHTML=[['p','Piezas'],['h','Portada'],['c','Concierge']].map(([k,n])=>`<button class="btn sm ${TAB===k?'':'ghost'}" data-act="tab" data-v="${k}">${n}</button>`).join('');
 ab.innerHTML=ED?edit():TAB==='p'?lst():TAB==='h'?hero():conc();ab.scrollTop=y};

/* Eventos */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,v=b.dataset.v;
 const A={
  filter:()=>{F=v;rdr();$('#cat').scrollIntoView({behavior:'smooth'})},
  view:()=>open(v),
  wa:()=>{const p=v?fnd(v):P;if(p)wa(one(p))},
  add:()=>{const id=v||P.id;if(!O.includes(id))O.push(id);rO();const t=b.textContent;b.textContent='✓ Añadido';setTimeout(()=>b.textContent=t,1200)},
  close:()=>off(v),lb:()=>{on('lb');paint(true)},
  prev:()=>{I--;paint()},next:()=>{I++;paint()},thumb:()=>{I=+v;paint()},
  order:()=>{rO();on('od')},rem:()=>{O=O.filter(x=>x!==v);rO()},
  send:()=>wa(msgO()),
  admin:()=>{on('ad');adm()},
  pin:()=>{const i=$('#pin');if(i.value===String(S.cfg.pin)){AUTH=true;adm()}else{i.value='';i.placeholder='Clave incorrecta'}},
  tab:()=>{TAB=v;ED=null;adm()},
  new:()=>{ED={_new:1,id:'p'+Date.now(),cat:CATS[0],name:'',sku:'',price:0,cur:'EUR',stock:true,desc:'',imgs:ASP.map(()=>({src:'',txt:''}))};adm()},
  edit:()=>{ED=JSON.parse(JSON.stringify(fnd(v)));adm()},
  del:async()=>{if(!confirm('¿Eliminar esta pieza?'))return;S.prods=S.prods.filter(p=>p.id!==v);O=O.filter(x=>x!==v);await DB.save(S);rdr();adm()},
  rm:()=>{ED.imgs[+v]={src:'',txt:''};adm()},
  cancel:()=>{ED=null;adm()},
  save:async()=>{if(!ED.name.trim()){alert('Indica un nombre para la pieza.');return}const{_new,...p}=ED;p.price=+p.price||0;if(_new)S.prods.push(p);else S.prods[S.prods.findIndex(x=>x.id===p.id)]=p;await DB.save(S);ED=null;rdr();adm()},
  rmv:async()=>{S.cfg.hv='';await DB.save(S);rdr();adm()},
  rmi:async()=>{S.cfg.hi='';await DB.save(S);rdr();adm()}
 };if(A[a])A[a]()});
document.addEventListener('input',e=>{const t=e.target,d=t.dataset;if(!ED)return;if(d.k)ED[d.k]=t.type==='checkbox'?t.checked:t.value;if(d.s!==undefined)ED.imgs[+d.s].txt=t.value});
document.addEventListener('change',async e=>{const t=e.target,d=t.dataset;
 if(d.g){S.cfg[d.g]=t.value;await DB.save(S);rdr();return}
 const f=t.files&&t.files[0];if(!d.u||!f)return;
 if(ED&&/^\d$/.test(d.u)){ED.imgs[+d.u].src=await shrink(f);adm();return}
 if(d.u==='hv'){if(f.size>3.5e6){alert('El vídeo supera el límite del navegador (~3,5 MB). Usa un clip corto o pega una URL.');return}S.cfg.hv=await rd(f)}else S.cfg.hi=await shrink(f,2000);
 await DB.save(S);rdr();adm()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=$$('.ov.on').pop();if(o)off(o.id)}if(P&&$('#pm').classList.contains('on')||$('#lb').classList.contains('on')){if(e.key==='ArrowRight'){I++;paint()}if(e.key==='ArrowLeft'){I--;paint()}}});
const gl=$('#glow');
addEventListener('pointermove',e=>{gl.style.transform=`translate3d(${e.clientX-150}px,${e.clientY-150}px,0)`;const c=e.target.closest&&e.target.closest('.card,.btn');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}},{passive:true});
$('#hv').onerror=e=>e.target.hidden=true;
(async()=>{S=(await DB.load())||seed();rdr()})();
