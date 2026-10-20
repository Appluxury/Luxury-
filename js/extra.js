'use strict';
/* VELARIS — extra.js · 5 categorías × 6 piezas, dock inferior, edición en la propia página,
   letras brillantes y publicación a GitHub. Se carga DESPUÉS de app.js. */
(()=>{
document.head.append(Object.assign(document.createElement('link'),{rel:'stylesheet',href:'css/extra.css'}));

/* 1 · Catálogo: 5 categorías × 6 piezas (se pisa el ejemplo de app.js antes de que se use) */
const EM={Relojes:'⌚',Gafas:'🕶️',Chaquetas:'🧥',Zapatillas:'👟',Bolsos:'👜'};
const DAT={
 Relojes:['VLR',[['Calibre Nocturne',18900,'oro rosa 18k y cristal de zafiro'],['Tourbillon Aurea',42500,'platino y esfera de meteorito'],['Chronos Ébano',27800,'acero negro y cerámica'],['Regulador Perla',15400,'oro blanco y nácar'],['Cronógrafo Monaco',21900,'titanio y fibra de carbono'],['Skeleton Opale',36200,'zafiro transparente y oro 18k']]],
 Gafas:['VGA',[['Aviator Champán',840,'titanio chapado en oro 18k'],['Clubmaster Carey',690,'acetato italiano'],['Shield Obsidiana',910,'titanio y lentes espejo'],['Cat-Eye Ivoire',760,'acetato nacarado'],['Round Atelier',720,'metal pulido a mano'],['Wayfarer Noir',650,'acetato negro mate']]],
 Chaquetas:['VCH',[['Biker Obsidiana',3450,'piel de cordero napa'],['Abrigo Cachemir Noir',4900,'cachemira doble faz'],['Bomber Seda Nocturne',2980,'seda técnica y punto de lana'],['Parka Alpina Gris',3650,'plumón de oca y nailon técnico'],['Blazer Sartorial',2750,'lana virgen 150s'],['Trench Dorado',3200,'gabardina de algodón encerado']]],
 Zapatillas:['VZA',[['Court Ivoire',690,'piel de becerro italiana'],['Runner Aurum',780,'malla técnica y detalles en oro'],['High-Top Noir',720,'ante negro y suela de goma natural'],['Slip-On Calfskin',640,'piel napa y forro de seda'],['Trainer Obsidiana',810,'charol y cuero perforado'],['Low Perla',670,'piel nacarada y suela cosida']]],
 Bolsos:['VBO',[['Tote Atelier',2450,'piel de becerro grano fino'],['Clutch Obsidiana',1380,'piel de cocodrilo mate'],['Bandolera Cuir Noir',1890,'piel de ternera suave'],['Mochila Voyage',2100,'lona técnica y piel'],['Minaudière Oro',1650,'metal dorado y satén'],['Bolso Bespoke',1250,'curtición vegetal']]]};
CATS.splice(0,CATS.length,...Object.keys(DAT));
Object.keys(SUB).forEach(k=>delete SUB[k]);
Object.assign(SUB,{Relojes:'Haute Horlogerie',Gafas:'Eyewear Couture',Chaquetas:'Atelier Outerwear',Zapatillas:'Luxury Sneakers',Bolsos:'Maroquinerie'});
SP.splice(0,SP.length,...Object.entries(DAT).flatMap(([c,[k,L]])=>L.map(([n,p,m],i)=>[c,n,`${k}-00${i+1}`,p,m])));

/* 2 · Interfaz: menú, selector del admin, dock inferior, barra de edición, marca y botón en tarjetas */
$('#nav-cats').innerHTML=CATS.map(c=>`<li><button type="button" data-cat="${c}">${c}<small>${SUB[c]}</small></button></li>`).join('');
$('select[name=cat]').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
const dock=document.createElement('nav');dock.id='dock';dock.className='glass';dock.setAttribute('aria-label','Elegir categoría');
dock.innerHTML=CATS.map(c=>`<button type="button" data-cat="${c}"><i aria-hidden="true">${EM[c]}</i>${c}</button>`).join('')+'<button type="button" id="dock-wa"><i class="wi" aria-hidden="true"></i>WhatsApp</button>';
const bar=document.createElement('div');bar.id='edit-bar';bar.className='glass';bar.hidden=true;
bar.innerHTML='<b>Modo edición</b><button type="button" class="btn sm" data-eb="new">+ Pieza</button><button type="button" class="btn sm ghost" data-eb="hero">Portada y vídeo</button><button type="button" class="btn sm ghost" data-eb="conf">Ajustes</button><button type="button" class="btn sm" data-eb="pub">Publicar</button><button type="button" class="btn sm ghost" data-eb="out">Salir</button>';
document.body.append(dock,bar);
$('#tpl-card').content.querySelector('.card-body').insertAdjacentHTML('beforeend','<div class="row adm-only"><button type="button" class="btn sm ghost" data-ed>✎ Editar</button><button type="button" class="btn sm ghost" data-del>🗑 Eliminar</button></div>');
const brand=document.createElement('p');brand.className='logo brand';brand.setAttribute('aria-hidden','true');brand.textContent='VELARIS';$('.hero-copy').prepend(brand);
$$('.logo').forEach(el=>{const t=el.textContent;el.classList.add('split');if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',t);
 el.innerHTML=[...t].map((c,i)=>`<span class="lt" aria-hidden="true" style="--i:${i}">${c}</span>`).join('')});

/* 3 · Modo edición sobre la misma página */
const pan=k=>{gate();show('modal-admin');adm(k);if(k==='conf')fillGh()};
const mode=()=>{document.body.classList.toggle('edit',AUTH);bar.hidden=!AUTH;
 [['#hero-title','title'],['#hero-sub','sub']].forEach(([s,k])=>{const n=$(s);n.contentEditable=AUTH;n.onblur=()=>{if(!AUTH)return;S.cfg[k]=n.textContent.trim()||S.cfg[k];DB.save(S)}})};
const out=()=>{AUTH=false;ED=null;hide('modal-admin');mode()};
bar.addEventListener('click',e=>{const b=e.target.closest('[data-eb]');if(!b)return;const k=b.dataset.eb;
 if(k==='new'){pan('prods');edit()}else if(k==='pub')publish();else if(k==='out')out();else pan(k)});
$('#admin-login').addEventListener('submit',()=>setTimeout(()=>{if(AUTH){hide('modal-admin');mode()}},0));
$('#adm-logout').addEventListener('click',out);
$('#adm-cancel').addEventListener('click',()=>hide('modal-admin'));
$('#adm-form').addEventListener('submit',()=>setTimeout(()=>hide('modal-admin'),150));
$('#grid').addEventListener('click',async e=>{const b=e.target.closest('[data-ed],[data-del]');if(!b||!AUTH)return;const id=b.closest('.card').dataset.id;
 if(b.hasAttribute('data-ed')){gate();show('modal-admin');edit(fnd(id))}
 else if(confirm('¿Eliminar esta pieza?')){S.prods=S.prods.filter(p=>p.id!==id);O=O.filter(x=>x!==id);await DB.save(S);rdr()}});
const sync=()=>$$('#dock button[data-cat]').forEach(b=>b.classList.toggle('on',b.dataset.cat===F));
document.addEventListener('click',()=>setTimeout(sync,0));
$('#dock-wa').onclick=()=>$('#btn-conc').click();

/* 4 · Publicar en GitHub: data/store.json + img/*  (las credenciales del panel NO se publican) */
const GH='velaris_gh',gh=()=>{try{return JSON.parse(localStorage.getItem(GH))||{}}catch(e){return{}}};
$('#adm-conf .fg').insertAdjacentHTML('beforeend','<label>GitHub · usuario/repositorio<input id="gh-repo" placeholder="usuario/velaris" autocapitalize="off" autocomplete="off"></label><label>Rama<input id="gh-br" placeholder="main" autocapitalize="off" autocomplete="off"></label><label class="w">Token de GitHub (permiso Contents: lectura y escritura)<input id="gh-tok" type="password" autocomplete="off"></label>');
const fillGh=()=>{const g=gh();$('#gh-repo').value=g.repo||'';$('#gh-br').value=g.br||'main';$('#gh-tok').value=g.token||''};
$('[data-adm=conf]').addEventListener('click',fillGh);
$('#cf-save').addEventListener('click',()=>{try{localStorage.setItem(GH,JSON.stringify({repo:$('#gh-repo').value.trim(),br:$('#gh-br').value.trim()||'main',token:$('#gh-tok').value.trim()}))}catch(e){}});
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36)+s.length.toString(36)};
const put=async(g,path,b64)=>{const u=`https://api.github.com/repos/${g.repo}/contents/${path}`,h={Authorization:'Bearer '+g.token,Accept:'application/vnd.github+json'};
 const r=await fetch(`${u}?ref=${encodeURIComponent(g.br)}`,{headers:h});
 if(r.ok&&path.startsWith('img/'))return path;
 const w=await fetch(u,{method:'PUT',headers:h,body:JSON.stringify({message:'VELARIS · '+path,content:b64,branch:g.br,sha:r.ok?(await r.json()).sha:undefined})});
 if(!w.ok)throw new Error(w.status);return path};
const publish=async()=>{const g=gh();g.br=g.br||'main';
 if(!g.repo||!g.token){toast('Falta repositorio o token: rellénalos en Ajustes.');pan('conf');return}
 const up=async s=>{if(!/^data:(image|video)\//.test(s||'')||s.startsWith('data:image/svg'))return s;const b=s.slice(s.indexOf(',')+1);return put(g,`img/${hash(b)}.${s.startsWith('data:video')?'mp4':'jpg'}`,b)};
 try{toast('Publicando… no cierres esta pestaña');
  const {user,pass,...cfg}=S.cfg;cfg.hi=await up(cfg.hi);cfg.hv=await up(cfg.hv);
  const prods=[];for(const p of S.prods){const imgs=[];for(const m of p.imgs)imgs.push({...m,src:await up(m.src)});prods.push({...p,imgs})}
  await put(g,'data/store.json',btoa(unescape(encodeURIComponent(JSON.stringify({cfg,prods})))));
  S.prods=prods;Object.assign(S.cfg,{hi:cfg.hi,hv:cfg.hv});await DB.save(S);
  toast('✓ Publicado. Se verá en unos 60 segundos.')}
 catch(e){toast('No se pudo publicar (error '+e.message+'). Revisa repositorio, rama y token.')}};

/* 5 · Arranque: borrador local del admin → contenido publicado → ejemplo */
(async()=>{let d=await DB.load();
 if(!(d&&d.prods&&d.prods.every(p=>CATS.includes(p.cat)))){try{const r=await fetch('data/store.json?v='+Date.now());d=r.ok?await r.json():null}catch(e){d=null}}
 S=d&&d.prods?d:seed();S.cfg={...seed().cfg,...S.cfg};
 if(S.cfg.tpl===TPL)S.cfg.tpl='💎 '+TPL+' 🙏';
 if(S.cfg.intro===INTRO)S.cfg.intro='💎 '+INTRO;
 rdr();mode();sync()})();
})();
