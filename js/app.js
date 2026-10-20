'use strict';
/* VELARIS · app.js · catálogo, reseñas, WhatsApp y panel privado */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],
E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
money=(n,c)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:c,maximumFractionDigits:0}).format(n),
CATS=[['Relojes','Alta relojería'],['Chaquetas','Abrigos y chaquetas'],['Gafas','Gafas de autor'],['Zapatos','Calzado de maison'],['Accesorios','Piel y complementos']],
SUB=Object.fromEntries(CATS),
FIELDS=[['brand','Nombre de la marca (arriba y abajo)'],['ann','Barra superior'],['title','Título de portada'],['sub','Subtítulo de portada'],['del','Plazo de entrega'],
['t1','Garantía 1 (Título|Texto)'],['t2','Garantía 2 (Título|Texto)'],['t3','Garantía 3 (Título|Texto)'],['t4','Garantía 4 (Título|Texto)'],
['s1','Paso 1 (Título|Texto)'],['s2','Paso 2 (Título|Texto)'],['s3','Paso 3 (Título|Texto)'],['s4','Paso 4 (Título|Texto)']],
TPL='Estimado asesor de VELARIS, solicito asistencia exclusiva para la pieza {nombre} (Ref: {sku}) de la colección {categoria}. Deseo coordinar los detalles de personalización y reserva privada. Quedo a su entera disposición.',
INTRO='Estimado asesor de VELARIS, solicito asistencia exclusiva para las siguientes piezas:',
ICO={
Relojes:'<rect x="345" y="170" width="110" height="220" rx="30"/><rect x="345" y="610" width="110" height="220" rx="30"/><circle cx="400" cy="500" r="150"/><circle cx="400" cy="500" r="124" fill="#07130f"/><circle cx="400" cy="500" r="104" fill="none" stroke="url(#g)" stroke-width="12" stroke-dasharray="3 51.45"/><path d="M400 500V430M400 500l50-28" stroke="url(#g)" stroke-width="9" stroke-linecap="round" fill="none"/><rect x="548" y="486" width="26" height="28" rx="6"/>',
Chaquetas:'<path d="M310 220L400 190L490 220L650 340L610 480L545 445V790H255V445L190 480L150 340Z"/><path d="M400 195V790M360 215L400 300L440 215" fill="none" stroke="#07130f" stroke-width="6"/>',
Gafas:'<rect x="150" y="430" width="230" height="160" rx="75"/><rect x="420" y="430" width="230" height="160" rx="75"/><rect x="172" y="452" width="186" height="116" rx="58" fill="#07130f"/><rect x="442" y="452" width="186" height="116" rx="58" fill="#07130f"/><path d="M380 480Q400 455 420 480M150 460L95 430M650 460L705 430" fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round"/>',
Zapatos:'<path d="M150 610V470Q150 440 185 440H330Q380 540 500 560Q660 575 690 650V710H150Z"/><path d="M150 690H690M320 470l40 30M360 450l40 40M400 470l30 20" stroke="#07130f" stroke-width="7" fill="none"/>',
Accesorios:'<rect x="190" y="370" width="420" height="280" rx="26"/><path d="M190 470H610" stroke="#07130f" stroke-width="6"/><rect x="210" y="390" width="380" height="240" rx="16" fill="none" stroke="#07130f" stroke-width="3" stroke-dasharray="10 8"/><circle cx="400" cy="470" r="22" fill="#07130f"/>'},
art=(c,i)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><radialGradient id="b" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="hsl(${156+i*7},36%,${19+i*2}%)"/><stop offset="1" stop-color="#06100c"/></radialGradient><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="120" y1="150" x2="680" y2="850"><stop offset="0" stop-color="#f0dfaa"/><stop offset=".5" stop-color="#b08d4b"/><stop offset="1" stop-color="#6b5124"/></linearGradient></defs><rect width="800" height="1000" fill="url(#b)"/><ellipse cx="400" cy="860" rx="230" ry="24" fill="#000" opacity=".5"/><g fill="url(#g)" transform="rotate(${[0,-5,4][i%3]} 400 500)">${ICO[c]||ICO.Accesorios}</g><text x="400" y="940" fill="#d8bd7e" font-family="Georgia,serif" font-size="24" letter-spacing="10" text-anchor="middle" opacity=".7">VELARIS</text></svg>`),
SP=[['Relojes','Calibre Nocturne','VLR-001',18900,'Caja de oro rosa de 18 quilates y cristal de zafiro.'],['Relojes','Tourbillon Aurea','VLR-002',42500,'Caja de platino y esfera de meteorito.'],
['Chaquetas','Biker Obsidiana','VCH-001',3450,'Piel de cordero napa con acabado mate.'],['Chaquetas','Abrigo Cachemir Noir','VCH-002',4900,'Cachemira doble faz de caída larga.'],
['Gafas','Aviator Champán','VGA-001',840,'Montura de titanio chapada en oro de 18 quilates.'],['Gafas','Clubmaster Carey','VGA-002',690,'Acetato italiano en tono carey.'],
['Zapatos','Oxford Cordovan','VZA-001',1150,'Piel de becerro con suela de cuero cosida.'],['Zapatos','Derby Piel Noir','VZA-002',980,'Piel negra pulida a mano.'],
['Accesorios','Cartera Bespoke','VAC-001',1250,'Piel de becerro de curtición vegetal.'],['Accesorios','Foulard Seda Oro','VAC-002',480,'Sarga de seda estampada a mano.']],
seed=()=>({t:0,rev:[],cfg:{phone:'34602006585',user:'123',pass:'123',tpl:TPL,intro:INTRO,mode:'image',hv:'',hi:'',brand:'VELARIS',
ann:'Entrega en 7 a 14 días hábiles. Envío desde nuestro almacén en Alemania.',title:'El arte de lo irrepetible',sub:'Maison de lujo con atención privada',del:'7 a 14 días hábiles',
t1:'Fábrica de cinco estrellas|Cada pieza se confecciona en una fábrica de máxima categoría.',t2:'Solo alta gama|No trabajamos calidad baja ni media: únicamente piezas premium.',
t3:'Almacén en Alemania|Su pedido llega a nuestro almacén y sale desde allí hacia su casa.',t4:'Atención privada|Un asesor le acompaña por WhatsApp en cada paso.',
s1:'Reserva por WhatsApp|Elija su pieza y confirme precio y detalles con su asesor.',s2:'Confección|Su pedido se encarga a la fábrica y se elabora en 1 a 3 días.',
s3:'Almacén en Alemania|La pieza original llega a nuestro almacén.',s4:'Entrega a domicilio|Se la enviamos a su casa. En total, de 7 a 14 días hábiles.'},
prods:SP.map((a,n)=>({id:'p'+n,cat:a[0],name:a[1],sku:a[2],price:a[3],cur:'EUR',stock:3,desc:a[4],imgs:[0,1,2].map(i=>art(a[0],i))}))}),
KEY='velaris_v3';
let S,O=[],P=null,I=0,F='Todas',ED=null,AUTH=false,tm,sx=null;

const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tm);tm=setTimeout(()=>t.hidden=true,2800)},
DB={async load(){let l=null,r=null;try{l=JSON.parse(localStorage.getItem(KEY))}catch(e){}try{const x=await fetch('data/store.json',{cache:'no-store'});if(x.ok)r=await x.json()}catch(e){}return[l,r].filter(Boolean).sort((a,b)=>(b.t||0)-(a.t||0))[0]||null},
save(){S.t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Memoria del navegador llena: use fotos más ligeras o una URL.')}}},
fnd=id=>S.prods.find(p=>p.id===id),im=p=>(p.imgs||[]).filter(Boolean),first=p=>im(p)[0]||art(p.cat,0),
sp=k=>String(S.cfg[k]||'').split('|'),
rv=id=>S.rev.filter(r=>!id||r.pid===id),
avg=l=>l.reduce((a,r)=>a+r.stars,0)/(l.length||1),
st=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n)),
rt=id=>{const l=rv(id);return l.length?`<span class="stars" aria-label="${avg(l).toFixed(1)} de 5">${st(avg(l))}</span><small>${avg(l).toFixed(1)} (${l.length})</small>`:''},
rcard=r=>`<blockquote class="rc"><p class="stars">${st(r.stars)}</p><p class="t">${E(r.txt)}</p><footer><b>${E(r.name)}</b>${r.ver?' <span class="vf">✓ Compra verificada</span>':''}<small>${E(r.date||'')}</small></footer>${r.pid&&fnd(r.pid)?`<em>${E(fnd(r.pid).name)}</em>`:''}</blockquote>`,
rd=f=>new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f)}),
shrink=async(f,mx=1400)=>{const u=await rd(f);return new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,mx/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.82))};i.onerror=()=>r(u);i.src=u})},
wa=t=>window.open('https://wa.me/'+String(S.cfg.phone).replace(/\D/g,'')+'?text='+encodeURIComponent(t),'_blank','noopener'),
one=p=>S.cfg.tpl.replaceAll('{nombre}',p.name).replaceAll('{sku}',p.sku).replaceAll('{categoria}',p.cat),
lock=()=>document.body.style.overflow=$$('.ov').some(o=>!o.hidden)?'hidden':'',
show=id=>{$('#'+id).hidden=false;lock()},hide=id=>{$('#'+id).hidden=true;lock()};

/* Pintado de la web */
const rO=()=>{const l=O.map(fnd).filter(Boolean),t={};$('#oc').textContent=l.length;
 $('#ol').innerHTML=l.map(p=>{t[p.cur]=(t[p.cur]||0)+p.price;return `<li><img src="${E(first(p))}" alt=""><span>${E(p.name)}<small>${E(p.sku)}</small></span><b>${money(p.price,p.cur)}</b><button class="x2" data-rm="${p.id}" aria-label="Quitar">✕</button></li>`}).join('');
 $('#oe').hidden=!!l.length;$('#ot').textContent=l.length?'Total estimado: '+Object.entries(t).map(([c,v])=>money(v,c)).join(' + '):''},
render=()=>{const c=S.cfg,hv=$('#hv');
 $$('[data-k]').forEach(n=>n.textContent=c[n.dataset.k]);document.title=c.brand;
 $('#hi').style.backgroundImage=c.hi?`url("${c.hi}")`:'';
 if(c.mode==='video'&&c.hv){if(hv.dataset.s!==c.hv){hv.dataset.s=c.hv;hv.src=c.hv}hv.hidden=false;const p=hv.play();p&&p.catch(()=>hv.hidden=true)}else{hv.hidden=true;hv.removeAttribute('src');delete hv.dataset.s}
 $('#trust').innerHTML=[1,2,3,4].map(i=>{const[a,b]=sp('t'+i);return `<div><b>${E(a)}</b><span>${E(b)}</span></div>`}).join('');
 $('#steps').innerHTML=[1,2,3,4].map(i=>{const[a,b]=sp('s'+i);return `<li><i>${i}</i><h3>${E(a)}</h3><p>${E(b)}</p></li>`}).join('');
 $('#tabs').innerHTML=['Todas',...CATS.map(x=>x[0])].map(k=>`<button class="tab${k===F?' on':''}" data-c="${k}">${k}</button>`).join('');
 $('#nav').innerHTML=CATS.map(x=>`<button class="${x[0]===F?'on':''}" data-c="${x[0]}">${x[0]}</button>`).join('');
 const L=S.prods.filter(p=>F==='Todas'||p.cat===F);
 $('#grid').innerHTML=L.map(p=>{const g=im(p);return `<article class="card" data-id="${p.id}"><div class="ph" data-o tabindex="0" role="button" aria-label="Ver ${E(p.name)}"><img src="${E(first(p))}" alt="${E(p.name)}" loading="lazy">${g[1]?`<img class="b" src="${E(g[1])}" alt="" loading="lazy">`:''}${p.stock>0?'':'<span class="bd">Agotado</span>'}</div><div class="ci"><p class="eb">${E(SUB[p.cat]||p.cat)}</p><h3>${E(p.name)}</h3><p class="pr">${money(p.price,p.cur)}</p><p class="rt">${rt(p.id)}</p><button class="btn" data-wa>Consultar por WhatsApp</button><div class="ln"><button class="lnk" data-o>Ver pieza</button><button class="lnk" data-add>Añadir al pedido</button></div></div></article>`}).join('');
 $('#empty').hidden=!!L.length;
 const R=S.rev;$('#revs').hidden=!R.length;$('#rsum').innerHTML=R.length?`${avg(R).toFixed(1)} de 5 <span class="stars">${st(avg(R))}</span><small>${R.length} opiniones</small>`:'';
 $('#rlist').innerHTML=[...R].reverse().slice(0,9).map(rcard).join('');rO()};

/* Ficha de pieza y pedido */
const paint=()=>{const L=im(P).length?im(P):[art(P.cat,0)];I=(I+L.length)%L.length;$('#gi').src=L[I];$('#gi').alt=P.name;$('#gc').textContent=`${I+1} / ${L.length}`;$('#gc').hidden=L.length<2;
 $('#gt').innerHTML=L.length>1?L.map((s,i)=>`<img src="${E(s)}" data-t="${i}" class="${i===I?'on':''}" alt="Foto ${i+1}">`).join(''):'';$('#gs').classList.remove('z');$$('.ga').forEach(b=>b.hidden=L.length<2)},
openP=id=>{P=fnd(id);if(!P)return;I=0;$('#pc').textContent=SUB[P.cat]||P.cat;$('#pn').textContent=P.name;$('#pp').textContent=money(P.price,P.cur);$('#pk').textContent=P.sku+(P.stock>0?'':' (agotado)');$('#pd').textContent=P.desc;$('#prt').innerHTML=rt(P.id);
 const l=rv(P.id);$('#prv').innerHTML=l.length?'<h4>Opiniones sobre esta pieza</h4>'+l.map(rcard).join(''):'';paint();show('mp')},
add=id=>{if(!O.includes(id))O.push(id);rO();toast('Añadido a su pedido')},
msgO=()=>`${S.cfg.intro}\n\n${O.map(fnd).filter(Boolean).map((p,i)=>`${i+1}. ${p.name} (Ref: ${p.sku}), ${money(p.price,p.cur)}`).join('\n')}\n\n${$('#ot').textContent}.\n\nQuedo a su entera disposición.`,
gs=$('#gs');
gs.addEventListener('pointerdown',e=>sx=e.clientX);
gs.addEventListener('pointerup',e=>{if(sx==null)return;const d=e.clientX-sx;sx=null;
 if(Math.abs(d)>45){I+=d<0?1:-1;paint()}
 else if(!e.target.closest('.ga')){const r=gs.getBoundingClientRect();gs.style.setProperty('--ox',(e.clientX-r.left)/r.width*100+'%');gs.style.setProperty('--oy',(e.clientY-r.top)/r.height*100+'%');gs.classList.toggle('z')}});
$('#gp').onclick=()=>{I--;paint()};$('#gn').onclick=()=>{I++;paint()};
$('#pw').onclick=()=>wa(one(P));$('#pa').onclick=()=>add(P.id);
$('#b-ord').onclick=()=>{rO();show('mo')};
$('#b-wa').onclick=$('#fab').onclick=$('#b-cc').onclick=()=>wa(`Estimado asesor de ${S.cfg.brand}, solicito asistencia exclusiva para conocer las piezas disponibles. Quedo a su entera disposición.`);
$('#os').onclick=()=>O.length?wa(msgO()):toast('Añada primero alguna pieza a su pedido.');
$('#ox').onclick=()=>{O=[];rO()};

document.addEventListener('click',e=>{const t=e.target,c=t.closest('[data-c]');
 if(c){F=c.dataset.c;render();$('#cat').scrollIntoView({behavior:'smooth'});return}
 const cd=t.closest('.card');
 if(cd){const id=cd.dataset.id;if(t.closest('[data-wa]'))wa(one(fnd(id)));else if(t.closest('[data-add]'))add(id);else if(t.closest('[data-o]'))openP(id);return}
 const th=t.closest('#gt img');if(th){I=+th.dataset.t;paint();return}
 const rm=t.closest('[data-rm]');if(rm){O=O.filter(x=>x!==rm.dataset.rm);rO();return}
 const x=t.closest('[data-x]');if(x){hide(x.closest('.ov').id);return}
 if(t.classList.contains('ov'))hide(t.id)});
addEventListener('keydown',e=>{const o=$$('.ov').filter(x=>!x.hidden).pop();
 if(!o){if(e.key==='Enter'&&e.target.matches('.ph'))openP(e.target.closest('.card').dataset.id);return}
 if(e.key==='Escape')hide(o.id);
 if(o.id==='mp'){if(e.key==='ArrowRight'){I++;paint()}if(e.key==='ArrowLeft'){I--;paint()}}});

/* Panel privado */
const hs=()=>$('#hst').textContent=`Vídeo: ${S.cfg.hv?'cargado':'sin cargar'}. Imagen: ${S.cfg.hi?'cargada':'por defecto'}. Se muestra: ${S.cfg.mode==='video'&&S.cfg.hv?'el vídeo':'la imagen'}.`,
sv=()=>{DB.save();render();hs()},
plist=()=>{$('#pf').hidden=true;$('#pl').hidden=false;$('#pls').innerHTML=S.prods.map(p=>`<li><img src="${E(first(p))}" alt=""><span>${E(p.name)}<small>${E(p.cat)}, ${E(p.sku)}, ${money(p.price,p.cur)}, stock ${p.stock}</small></span><button class="btn sm ghost" data-e="${p.id}">Editar</button><button class="btn sm ghost" data-del="${p.id}">Eliminar</button></li>`).join('')||'<li class="mut">Todavía no hay piezas.</li>'},
rlist=()=>{$('#rls').innerHTML=S.rev.map(r=>`<li><span>${E(r.name)}, ${st(r.stars)}${r.ver?', verificada':''}<small>${E(r.txt.slice(0,70))}</small></span><button class="btn sm ghost" data-rdel="${r.id}">Eliminar</button></li>`).join('')||'<li class="mut">Todavía no hay reseñas.</li>'},
slots=()=>{$('#sl').innerHTML=ED.imgs.map((s,i)=>`<li data-i="${i}"><div class="sp">${s?`<img src="${E(s)}" alt="">`:'Vacía'}</div><label class="btn sm">Subir foto<input type="file" accept="image/*" hidden data-f></label><button type="button" class="btn sm ghost" data-d>Quitar</button><input data-u placeholder="o URL o ruta de la foto" value="${s.startsWith('data:')?'':E(s)}"></li>`).join('')},
edit=p=>{ED=p?JSON.parse(JSON.stringify(p)):{id:'p'+Date.now(),cat:CATS[0][0],name:'',sku:'',price:0,cur:'EUR',stock:1,desc:'',imgs:[]};ED._n=!p;ED.imgs=ED.imgs.filter(Boolean);while(ED.imgs.length<6)ED.imgs.push('');
 const f=$('#pf').elements;['cat','name','sku','price','cur','stock','desc'].forEach(k=>f[k].value=ED[k]);$('#pft').textContent=p?'Editar pieza':'Nueva pieza';$('#pl').hidden=true;$('#pf').hidden=false;slots()},
adm=k=>{$$('[data-a]').forEach(b=>b.classList.toggle('on',b.dataset.a===k));['p','h','r','t','s'].forEach(v=>$('#a-'+v).hidden=v!==k);const c=S.cfg;
 if(k==='p'){ED=null;plist()}
 if(k==='h'){$('#hm').value=c.mode;$('#hu').value=c.hv.startsWith('data:')?'':c.hv;$('#hn').value=c.hi.startsWith('data:')?'':c.hi;hs()}
 if(k==='r'){$('#rp').innerHTML='<option value="">Toda la tienda</option>'+S.prods.map(p=>`<option value="${p.id}">${E(p.name)}</option>`).join('');$('#rd').value=new Date().toLocaleDateString('es-ES',{month:'long',year:'numeric'});rlist()}
 if(k==='t')$('#tf').innerHTML=FIELDS.map(([f,l])=>`<label>${l}<input data-k2="${f}" value="${E(c[f])}"></label>`).join('');
 if(k==='s')['phone','user','pass','tpl','intro'].forEach(x=>$('#c-'+x).value=c[x])},
gate=()=>{$('#lf').hidden=AUTH;$('#ap').hidden=!AUTH;if(AUTH)adm('p')};
$('#b-adm').onclick=()=>{gate();show('ma')};
$('#lf').addEventListener('submit',e=>{e.preventDefault();if($('#lu').value===S.cfg.user&&$('#lp').value===S.cfg.pass){AUTH=true;$('#le').hidden=true;e.target.reset();gate()}else $('#le').hidden=false});
$('#lo').onclick=()=>{AUTH=false;ED=null;gate()};
$$('[data-a]').forEach(b=>b.onclick=()=>adm(b.dataset.a));

$('#new').onclick=()=>edit();
$('#cancel').onclick=()=>{ED=null;plist()};
$('#pls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.e)edit(fnd(b.dataset.e));
 if(b.dataset.del&&confirm('¿Eliminar esta pieza?')){S.prods=S.prods.filter(p=>p.id!==b.dataset.del);O=O.filter(x=>x!==b.dataset.del);DB.save();render();plist()}});
$('#sl').addEventListener('click',e=>{if(e.target.closest('[data-d]')){ED.imgs[+e.target.closest('li').dataset.i]='';slots()}});
$('#sl').addEventListener('change',async e=>{const li=e.target.closest('li');if(!li)return;const i=+li.dataset.i;
 if(e.target.matches('[data-f]')){const f=e.target.files[0];if(f){ED.imgs[i]=await shrink(f);slots()}}
 else if(e.target.matches('[data-u]')){ED.imgs[i]=e.target.value.trim();slots()}});
$('#pf').addEventListener('submit',e=>{e.preventDefault();const f=e.target.elements;['cat','name','sku','cur','desc'].forEach(k=>ED[k]=f[k].value.trim());ED.price=+f.price.value||0;ED.stock=Math.max(0,parseInt(f.stock.value)||0);
 const{_n,...p}=ED;p.imgs=p.imgs.filter(Boolean);_n?S.prods.push(p):S.prods[S.prods.findIndex(x=>x.id===p.id)]=p;DB.save();ED=null;render();plist();toast('Pieza guardada')});

$('#rf').addEventListener('submit',e=>{e.preventDefault();const f=e.target.elements;S.rev.push({id:'r'+Date.now(),pid:f.pid.value,name:f.name.value.trim(),stars:+f.stars.value,txt:f.txt.value.trim(),date:f.date.value.trim(),ver:f.ver.checked});DB.save();e.target.reset();adm('r');render();toast('Reseña añadida')});
$('#rls').addEventListener('click',e=>{const b=e.target.closest('[data-rdel]');if(b&&confirm('¿Eliminar esta reseña?')){S.rev=S.rev.filter(r=>r.id!==b.dataset.rdel);DB.save();render();rlist()}});

$('#hm').onchange=e=>{S.cfg.mode=e.target.value;sv()};
$('#hu').onchange=e=>{S.cfg.hv=e.target.value.trim();sv()};
$('#hn').onchange=e=>{S.cfg.hi=e.target.value.trim();sv()};
$('#hvf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(f.size>3e6){toast('El vídeo pesa más de 3 MB: súbalo a GitHub y pegue su ruta.');return}S.cfg.hv=await rd(f);S.cfg.mode='video';$('#hm').value='video';$('#hu').value='';sv()};
$('#hif').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;S.cfg.hi=await shrink(f,2200);S.cfg.mode='image';$('#hm').value='image';$('#hn').value='';sv()};
$('#hvd').onclick=()=>{S.cfg.hv='';$('#hu').value='';sv()};
$('#hid').onclick=()=>{S.cfg.hi='';$('#hn').value='';sv()};
$('#tf').addEventListener('change',e=>{const k=e.target.dataset.k2;if(k){S.cfg[k]=e.target.value;sv()}});

$('#cs').onclick=()=>{const g=k=>$('#c-'+k).value.trim(),ph=g('phone').replace(/\D/g,'');if(!ph||!g('user')||!g('pass')){toast('WhatsApp, usuario y contraseña son obligatorios.');return}
 Object.assign(S.cfg,{phone:ph,user:g('user'),pass:g('pass'),tpl:g('tpl')||TPL,intro:g('intro')||INTRO});DB.save();toast('Ajustes guardados')};
$('#ce').onclick=()=>{DB.save();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='store.json';a.click();toast('store.json listo: súbalo a la carpeta data de GitHub')};
$('#ci').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const o=JSON.parse(await f.text());S={...seed(),...o};S.cfg={...seed().cfg,...o.cfg};DB.save();render();adm('s');toast('Datos importados')}catch(x){toast('El archivo no es válido.')}};
$('#cr').onclick=()=>{if(!confirm('Se restaurarán los datos de ejemplo y se perderán sus cambios.'))return;S=seed();O=[];DB.save();render();adm('s');toast('Datos restaurados')};

/* Arranque */
(async()=>{S=await DB.load()||seed();S.cfg={...seed().cfg,...S.cfg};S.rev=S.rev||[];S.prods=S.prods||[];
 $('#pf').elements.cat.innerHTML=CATS.map(c=>`<option>${E(c[0])}</option>`).join('');render()})();
