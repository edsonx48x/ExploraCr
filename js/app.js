// ════════════════════════════════════════════
// ExploraCR — lógica principal
// Depende de data.js (lugares base) y store.js (guardado). El HTML llama a
// estas funciones desde sus botones (onclick), por eso son globales.
// ════════════════════════════════════════════
// Atajo: $('x') es lo mismo que document.getElementById('x')
const $=id=>document.getElementById(id);
// Escapa los caracteres especiales (<, >, &, comillas) del texto que escribe
// la gente, para que nadie pueda meter HTML o código en la página
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Pasa el texto a minúsculas y le quita las tildes, así el buscador
// encuentra 'José' aunque escriban 'jose'
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

// ─── CATEGORÍAS ──────────────────────────────
// Un solo lugar donde se define cada categoría: emoji, etiqueta, nombre en plural,
// clase de la etiqueta (css), fondo de la tarjeta y color del marcador del mapa
const CATS={
  restaurante:{emoji:'🍽️',tag:'🍽️ Restaurante',nombre:'Restaurantes',clase:'br',fondo:'var(--terracota-50)',color:'var(--terracota)'},
  cafeteria:{emoji:'☕',tag:'☕ Cafetería',nombre:'Cafeterías',clase:'bc',fondo:'var(--cafe-50)',color:'var(--cafe)'},
  hotel:{emoji:'🏨',tag:'🏨 Alojamiento',nombre:'Hoteles',clase:'bj',fondo:'var(--verde-100)',color:'var(--verde-700)'},
  paseo:{emoji:'🥾',tag:'🥾 Aventura',nombre:'Paseos',clase:'bs',fondo:'var(--ocre-50)',color:'var(--ocre)'},
  actividad:{emoji:'🧗',tag:'🧗 Actividad',nombre:'Actividades',clase:'ba',fondo:'var(--azul-50)',color:'var(--azul)'},
  turistico:{emoji:'📸',tag:'📸 Zona turística',nombre:'Zonas turísticas',clase:'bt',fondo:'var(--ciruela-50)',color:'var(--ciruela)'}
};
// Dirección de Google Maps para llegar a un lugar. Los lugares del sistema tienen
// coordenadas aproximadas, así que se busca por nombre y zona; los de usuarios y los
// resultados de "cerca de ti" usan sus coordenadas exactas
function urlLlegar(l){
  const destino=l.autor==='Sistema'?encodeURIComponent(l.nombre+', '+l.zona+', Costa Rica'):l.lat+','+l.lng;
  return 'https://www.google.com/maps/dir/?api=1&destination='+destino;
}

// ─── ESTADO ──────────────────────────────────
const PAGE=9; // tarjetas que se pintan por tanda
// Datos guardados en este navegador. 'lugares' junta los de data.js con los
// que agregaron los usuarios
let usuarios=Store.get('ecr_u',[]);
let reviews =Store.get('ecr_r',[]);
// Migración única: antes los lugares de usuarios tenían ids 10, 11... que ahora
// pertenecen a lugares del sistema. Se les da un id nuevo (y se actualizan sus reseñas)
{
  const propios=Store.get('ecr_l',[]);
  if(Store.get('ecr_v',0)<2){
    const mapaIds={};
    propios.forEach((l,i)=>{if(l.id<=LUGARES_BASE.reduce((m,x)=>Math.max(m,x.id),0)){mapaIds[l.id]=Date.now()+i;l.id=mapaIds[l.id];}});
    if(Object.keys(mapaIds).length){
      reviews.forEach(r=>{if(mapaIds[r.lugarId])r.lugarId=mapaIds[r.lugarId];});
      Store.set('ecr_l',propios);Store.set('ecr_r',reviews);
    }
    Store.set('ecr_v',2);
  }
}
let lugares =[...LUGARES_BASE,...Store.get('ecr_l',[])];
let usuarioActual=null;
// Recupera la sesión iniciada. Solo se guarda el id del usuario
// (antes se guardaba el objeto completo, con contraseña y foto)
{
  const s=Store.get('ecr_s',null);
  const id=s&&typeof s==='object'?s.id:s;
  usuarioActual=usuarios.find(u=>u.id===id)||null;
}
// catActiva: categoría elegida · query: texto del buscador · shown: tarjetas visibles
let catActiva='todos',query='',shown=PAGE;
// starA/starR: estrellas elegidas al agregar lugar / al escribir reseña
// detId: id del lugar que está abierto en el detalle
let starA=0,starR=0,detId=null;
// Objetos del mapa. Empiezan en null porque el mapa se crea hasta que se necesita
let mapa=null,cluster=null,marcUsr=null,iconos=null,pickHandler=null;
// Lista de {lugar, marcador} para poder mostrar u ocultar marcadores al filtrar
const marcadores=[];
// Cerca de mí: si está activo, las tarjetas y el mapa muestran solo los lugares
// dentro de 'radioKm' kilómetros de ti, del más cercano al más lejano
let cercaOn=false,radioKm=25;
// Cantidad de reseñas por lugar: { idLugar: cantidad }
let cntRv={};

// Recalcula cuántas reseñas tiene cada lugar
function contarRv(){cntRv={};reviews.forEach(r=>{cntRv[r.lugarId]=(cntRv[r.lugarId]||0)+1;});}

// Guarda usuarios, reseñas y lugares de usuarios en localStorage.
// Solo se guardan los lugares que NO son del 'Sistema'. Devuelve false si falla
function save(){
  const r=[
    Store.set('ecr_u',usuarios),
    Store.set('ecr_r',reviews),
    Store.set('ecr_l',lugares.filter(l=>l.autor!=='Sistema'))
  ];
  if(r.includes(false)){toast('No se pudo guardar: almacenamiento lleno.','err');return false;}
  return true;
}

// ─── RESPONSIVE ──────────────────────────────
// mq detecta si la pantalla es de celular (menos de 640px de ancho)
const mq=window.matchMedia('(max-width:639px)');
// Muestra u oculta los botones del navbar según el tamaño de pantalla
// y si hay una sesión iniciada
function applyResponsive(){
  const mob=mq.matches;
  $('nav-links').style.display=mob?'none':'flex';
  $('nav-auth').style.display=(!mob&&!usuarioActual)?'flex':'none';
  $('nav-user').style.display=usuarioActual?'block':'none';
  $('btn-add-desk').style.display=mob?'none':'block';
}
mq.addEventListener('change',applyResponsive);

// ─── STATS / TOAST ───────────────────────────
// Actualiza los tres contadores de la portada (lugares, reseñas, usuarios)
function updStats(){
  $('st-p').textContent=lugares.length;
  $('st-r').textContent=reviews.length;
  $('st-u').textContent=usuarios.length;
}
// Mensaje temporal abajo de la pantalla. tipo: 'ok' (verde) o 'err' (rojo)
function toast(msg,tipo='ok'){
  const t=$('toast');
  t.style.background=tipo==='ok'?'var(--verde-900)':'var(--terracota-osc)';
  t.textContent=msg;
  t.style.display='block';
  t.className='toast';
  clearTimeout(t._t);
  t._t=setTimeout(()=>{t.className='toast out';setTimeout(()=>t.style.display='none',280);},2800);
}

// ─── MENÚ MÓVIL ──────────────────────────────
// Indica si el menú lateral del celular está abierto
let mobMenuOpen=false;
// Abre o cierra el menú lateral
function toggleMobMenu(){mobMenuOpen?closeMobMenu():openMobMenu();}
// Muestra el menú lateral, bloquea el scroll y convierte la hamburguesa en una X
function openMobMenu(){
  mobMenuOpen=true;
  const m=$('mob-menu');
  m.style.display='flex';
  void m.offsetWidth;
  m.classList.add('open');
  document.body.style.overflow='hidden';
  const bars=document.querySelectorAll('#ham-icon .ham-bar');
  bars[0].style.top='6px';bars[0].style.transform='rotate(45deg)';
  bars[1].style.opacity='0';
  bars[2].style.top='6px';bars[2].style.transform='rotate(-45deg)';
}
// Cierra el menú lateral, devuelve el scroll y regresa la hamburguesa a su forma
function closeMobMenu(){
  mobMenuOpen=false;
  const m=$('mob-menu');
  m.classList.remove('open');
  document.body.style.overflow='';
  const bars=document.querySelectorAll('#ham-icon .ham-bar');
  if(bars.length){
    bars[0].style.top='0';bars[0].style.transform='none';
    bars[1].style.opacity='1';
    bars[2].style.top='12px';bars[2].style.transform='none';
  }
  setTimeout(()=>{if(!mobMenuOpen)m.style.display='none';},300);
}
// Cierra el menú si se toca el fondo oscuro (fuera del panel)
function closeMobIfBg(e){if(e.target.classList.contains('mmenu')||e.target.classList.contains('mmenu-bg'))closeMobMenu();}

// ─── AUTH (local: solo guarda datos en este navegador) ───
// Inicia sesión: busca un usuario con ese correo y contraseña.
// (Es un login local, solo revisa los usuarios guardados en este navegador)
function doLogin(){
  const em=$('li-em').value.trim(),pw=$('li-pw').value,err=$('li-err');
  err.style.display='none';
  if(!em||!pw){err.textContent='Completá todos los campos.';err.style.display='block';return;}
  const u=usuarios.find(u=>u.email===em&&u.pass===pw);
  if(!u){err.textContent='Correo o contraseña incorrectos.';err.style.display='block';return;}
  iniciarSesion(u);cerrarM('login');toast('¡Bienvenido, '+u.nombre+'! 🌿');
}

// Crea una cuenta nueva después de validar los campos y guarda al usuario
function doRegistro(){
  const nom=$('rg-nom').value.trim(),ap=$('rg-ap').value.trim();
  const em=$('rg-em').value.trim(),pw=$('rg-pw').value,err=$('rg-err');
  err.style.display='none';
  if(!nom||!ap||!em||!pw){err.textContent='Completá todos los campos.';err.style.display='block';return;}
  if(pw.length<6){err.textContent='La contraseña debe tener al menos 6 caracteres.';err.style.display='block';return;}
  if(usuarios.find(u=>u.email===em)){err.textContent='Este correo ya está registrado.';err.style.display='block';return;}
  const u={id:Date.now(),nombre:nom,apellido:ap,email:em,pass:pw,bio:'',avatar:null};
  usuarios.push(u);save();iniciarSesion(u);cerrarM('registro');
  toast('¡Cuenta creada! Bienvenido, '+u.nombre+' 🎉');updStats();
}

// Devuelve las iniciales del usuario (ej. Ana García -> AG)
function iniciales(u){return (u.nombre[0]+(u.apellido?u.apellido[0]:'')).toUpperCase();}
// Dibuja el avatar dentro de un elemento: la foto si hay, o las iniciales si no
function pintarAv(el,u){
  el.innerHTML='';
  if(u.avatar){const i=document.createElement('img');i.src=u.avatar;i.alt='';el.appendChild(i);}
  else{const s=document.createElement('span');s.textContent=iniciales(u);el.appendChild(s);}
}

// Deja al usuario como activo y actualiza el navbar y el menú móvil con sus datos
function iniciarSesion(u){
  usuarioActual=u;
  Store.set('ecr_s',u.id);
  $('nav-uname').textContent=u.nombre;
  pintarAv($('nav-av'),u);
  $('mm-auth').style.display='none';
  $('mm-user').style.display='block';
  $('mm-logged').style.display='block';
  $('mm-name').textContent=u.nombre+' '+(u.apellido||'');
  $('mm-email').textContent=u.email;
  pintarAv($('mm-av'),u);
  applyResponsive();
}

// Cierra la sesión y regresa el navbar y el menú al estado de visitante
function cerrarSesion(){
  usuarioActual=null;
  Store.del('ecr_s');
  $('udrop').style.display='none';
  $('mm-auth').style.display='block';
  $('mm-user').style.display='none';
  $('mm-logged').style.display='none';
  applyResponsive();
  closeMobMenu();
  toast('Sesión cerrada. ¡Hasta pronto!');
}

// Abre o cierra el menú desplegable del usuario (escritorio)
function toggleUD(){const d=$('udrop');d.style.display=d.style.display==='none'?'block':'none';}
// Si se hace clic fuera del menú del usuario, se cierra
document.addEventListener('click',e=>{
  const ud=$('udrop'),nu=$('nav-user');
  if(ud&&nu&&!nu.contains(e.target))ud.style.display='none';
});

// ─── MODALES ─────────────────────────────────
// Abre el modal con id 'm-<n>' (cierra los demás) y bloquea el scroll de fondo
function abrirM(n){
  document.querySelectorAll('.mb').forEach(m=>m.style.display='none');
  const m=$('m-'+n);
  if(m){m.style.display='flex';const b=m.querySelector('.mx');if(b){b.classList.remove('asi');void b.offsetWidth;b.classList.add('asi');}}
  document.body.style.overflow='hidden';
}
// Cierra un modal y devuelve el scroll si ya no queda ninguno abierto
function cerrarM(n){
  const m=$('m-'+n);
  if(m)m.style.display='none';
  if(!document.querySelector('.mb[style*="flex"]'))document.body.style.overflow='';
}
// Cierra el modal si el clic fue en el fondo oscuro y no dentro de la ventana
function cmbg(e,n){if(e.target===$('m-'+n))cerrarM(n);}
// La tecla Escape cierra modales, el menú móvil y el modo de elegir en el mapa
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  document.querySelectorAll('.mb').forEach(m=>m.style.display='none');
  if(mobMenuOpen)closeMobMenu();
  if(pickHandler)finPick();
  document.body.style.overflow='';
});

// ─── PERFIL ──────────────────────────────────
// Llena el modal de perfil con los datos del usuario y sus reseñas, y lo abre
function abrirPerfil(){
  $('udrop').style.display='none';
  if(!usuarioActual)return;
  const u=usuarioActual;
  $('pf-nom').textContent=u.nombre+' '+(u.apellido||'');
  $('pf-em').textContent=u.email;
  $('pf-ni').value=u.nombre;
  $('pf-ai').value=u.apellido||'';
  $('pf-bio').value=u.bio||'';
  const av=$('pf-av');
  pintarAv(av,u);
  const eo=document.createElement('div');eo.className='eo';eo.textContent='📷';av.appendChild(eo);
  const misR=reviews.filter(r=>r.userId===u.id);
  $('pf-stats').textContent=`${misR.length} reseña${misR.length!==1?'s':''} publicada${misR.length!==1?'s':''}`;
  renderMisRv(misR);
  abrirM('perfil');
}

// Guarda los cambios de nombre, apellido y bio
function guardarPerfil(){
  if(!usuarioActual)return;
  usuarioActual.nombre=$('pf-ni').value.trim()||usuarioActual.nombre;
  usuarioActual.apellido=$('pf-ai').value.trim();
  usuarioActual.bio=$('pf-bio').value.trim();
  save();iniciarSesion(usuarioActual);
  cerrarM('perfil');toast('Perfil actualizado ✓');
}

// Cambia la foto de perfil: la reduce de tamaño y la guarda
async function cambiarAv(e){
  const file=e.target.files[0];
  if(!file||!usuarioActual)return;
  try{
    usuarioActual.avatar=await reducirImagen(file);
    save();iniciarSesion(usuarioActual);abrirPerfil();toast('Foto actualizada ✓');
  }catch(_){toast('No se pudo leer la imagen.','err');}
  e.target.value='';
}

// Dibuja en el perfil la lista de reseñas que escribió el usuario
function renderMisRv(lista){
  const c=$('mis-rv');
  if(!lista.length){c.innerHTML='<p style="color:var(--tinta-tenue);font-size:13px">Aún no has publicado reseñas.</p>';return;}
  c.innerHTML=lista.map(r=>{
    const l=lugares.find(x=>x.id===r.lugarId);
    return `<div style="background:var(--crema-claro);border-radius:10px;padding:12px 14px">
      <p style="font-weight:600;font-size:13px;color:var(--verde-900);margin-bottom:2px">${l?esc(l.nombre):'Lugar eliminado'}</p>
      <p style="color:var(--ocre);font-size:12px;margin-bottom:4px">${'★'.repeat(r.estrellas)}${'☆'.repeat(5-r.estrellas)}</p>
      <p style="font-size:13px;color:var(--tinta)">${esc(r.texto)}</p>
    </div>`;
  }).join('');
}

// ─── ESTRELLAS ───────────────────────────────
// Marcan las estrellas hasta el valor v (SA: agregar lugar, SR: reseña)
function setSA(v){starA=v;document.querySelectorAll('#sa-w .sb').forEach(s=>s.classList.toggle('on',+s.dataset.v<=v));}
function setSR(v){starR=v;document.querySelectorAll('#sr-w .sb').forEach(s=>s.classList.toggle('on',+s.dataset.v<=v));}

// ─── AGREGAR LUGAR ───────────────────────────
// Escribe las coordenadas en los campos del formulario de agregar lugar
function setCoords(lat,lng){$('ad-lat').value=(+lat).toFixed(5);$('ad-lng').value=(+lng).toFixed(5);}

// Rellena las coordenadas con la ubicación actual del usuario (GPS)
function coordsGPS(){
  if(!navigator.geolocation){toast('Tu navegador no soporta GPS.','err');return;}
  toast('Buscando ubicación...');
  navigator.geolocation.getCurrentPosition(
    p=>{setCoords(p.coords.latitude,p.coords.longitude);toast('📍 Ubicación cargada');},
    ()=>toast('No se pudo obtener tu ubicación.','err'),
    {timeout:10000}
  );
}

// Cierra el modal, deja tocar el mapa y vuelve con las coordenadas cargadas.
function elegirEnMapa(){
  const m=ensureMapa();if(!m)return;
  cerrarM('agregar');
  $('pick-banner').style.display='flex';
  m.getContainer().style.cursor='crosshair';
  $('mapa').scrollIntoView({behavior:'smooth'});
  pickHandler=e=>{setCoords(e.latlng.lat,e.latlng.lng);finPick();abrirM('agregar');};
  m.once('click',pickHandler);
}
// Termina el modo 'elegir en el mapa': quita el clic, el cursor y el aviso
function finPick(){
  if(!pickHandler||!mapa)return;
  mapa.off('click',pickHandler);
  pickHandler=null;
  mapa.getContainer().style.cursor='';
  $('pick-banner').style.display='none';
}
// Cancela la selección en el mapa y vuelve al formulario
function cancelarPick(){finPick();abrirM('agregar');}

// Valida el formulario y crea el lugar nuevo. Lo guarda, lo agrega al mapa
// y a las tarjetas, y limpia el formulario
function guardarLugar(){
  if(!usuarioActual){abrirM('login');return;}
  const nom=$('ad-nom').value.trim(),cat=$('ad-cat').value,zona=$('ad-zona').value.trim();
  const lat=parseFloat($('ad-lat').value),lng=parseFloat($('ad-lng').value);
  const desc=$('ad-desc').value.trim(),prec=$('ad-precio').value.trim()||'—';
  const err=$('ad-err');
  err.style.display='none';
  const fallo=t=>{err.textContent=t;err.style.display='block';};
  if(!nom||!cat||!zona||!desc)return fallo('Completá los campos obligatorios.');
  if(isNaN(lat)||isNaN(lng)||Math.abs(lat)>90||Math.abs(lng)>180)
    return fallo('Indicá la ubicación: elegila en el mapa, usá tu GPS o escribí las coordenadas.');
  if(!starA)return fallo('Seleccioná una calificación.');
  if(!CATS[cat])return fallo('Elegí una categoría.');
  const nuevo={id:Date.now(),cat,nombre:nom,desc,tag:CATS[cat].tag,estrellas:starA,lat,lng,zona,precio:prec,emoji:CATS[cat].emoji,autor:usuarioActual.nombre};
  lugares.push(nuevo);
  if(!save()){lugares.pop();return;}
  agregarMarcador(nuevo);renderCards();
  cerrarM('agregar');
  ['ad-nom','ad-zona','ad-desc','ad-precio','ad-lat','ad-lng'].forEach(id=>$(id).value='');
  $('ad-cat').value='';
  starA=0;document.querySelectorAll('#sa-w .sb').forEach(s=>s.classList.remove('on'));
  toast('¡Lugar publicado! 🌿');updStats();
}

// ─── RESEÑAS ─────────────────────────────────
// HTML del formulario para escribir una reseña. Se arma aquí porque se vuelve
// a dibujar cada vez que se abre un lugar (así siempre empieza limpio)
const FORM_RV=`<div style="display:flex;flex-direction:column;gap:14px">
  <div><label class="lbl" style="margin-bottom:8px">Tu calificación</label>
    <div id="sr-w" style="display:flex;gap:6px">${[1,2,3,4,5].map(n=>`<span class="sb" data-v="${n}" onclick="setSR(${n})">★</span>`).join('')}</div>
  </div>
  <div><label class="lbl">Tu experiencia</label><textarea class="inp" id="rv-txt" rows="4" maxlength="500" placeholder="Contá tu experiencia en este lugar..."></textarea></div>
  <p id="rv-err" style="color:var(--terracota-osc);font-size:13px;display:none"></p>
  <button onclick="pubReview()" class="btn">Publicar reseña</button>
</div>`;

// Publica una reseña del usuario en el lugar abierto y actualiza pantallas y contadores
function pubReview(){
  if(!usuarioActual){toast('Inicia sesión para publicar.','err');return;}
  const txt=$('rv-txt').value.trim(),err=$('rv-err');
  err.style.display='none';
  if(!starR){err.textContent='Seleccioná una calificación.';err.style.display='block';return;}
  if(!txt){err.textContent='Escribí tu experiencia.';err.style.display='block';return;}
  reviews.push({id:Date.now(),lugarId:detId,userId:usuarioActual.id,usuario:usuarioActual.nombre+' '+(usuarioActual.apellido||''),estrellas:starR,texto:txt,fecha:new Date().toISOString()});
  save();contarRv();
  $('rv-txt').value='';starR=0;
  document.querySelectorAll('#sr-w .sb').forEach(s=>s.classList.remove('on'));
  const c=$('rc-'+detId);if(c)c.textContent='('+(cntRv[detId]||0)+')';
  renderDetRv(detId);renderRvHome();swTab('rv');
  toast('Reseña publicada ✓');updStats();
}

// Dibuja las reseñas de un lugar dentro del modal de detalle
function renderDetRv(lid){
  const lista=reviews.filter(r=>r.lugarId===lid);
  const c=$('rv-list');
  if(!lista.length){c.innerHTML='<p style="color:var(--tinta-tenue);text-align:center;padding:20px 0;font-size:13px">Aún no hay reseñas. ¡Sé el primero!</p>';return;}
  c.innerHTML=[...lista].reverse().map(r=>`
    <div class="rcard" style="background:var(--crema-claro);border-radius:10px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div class="av" style="width:32px;height:32px;font-size:12px">${esc(r.usuario[0].toUpperCase())}</div>
        <div style="flex:1;min-width:0">
          <p style="font-weight:600;font-size:13px;color:var(--tinta-fuerte);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.usuario)}</p>
          <p style="font-size:11px;color:var(--tinta-tenue)">${new Date(r.fecha).toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'})}</p>
        </div>
        <span style="color:var(--ocre);font-size:12px;flex-shrink:0">${'★'.repeat(r.estrellas)}</span>
      </div>
      <p style="font-size:13px;color:var(--tinta);line-height:1.5">${esc(r.texto)}</p>
    </div>`).join('');
}

// Dibuja las 6 reseñas más recientes en la sección de comunidad
function renderRvHome(){
  const grid=$('rv-grid'),empty=$('rv-empty');
  if(!reviews.length){grid.style.display='none';empty.style.display='block';return;}
  grid.style.display='';empty.style.display='none';
  grid.innerHTML=[...reviews].reverse().slice(0,6).map(r=>{
    const l=lugares.find(x=>x.id===r.lugarId);
    return `<div class="rcard reveal">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div class="av">${esc(r.usuario[0].toUpperCase())}</div>
        <div style="min-width:0">
          <p style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.usuario)}</p>
          <p style="color:var(--ocre);font-size:12px">${'★'.repeat(r.estrellas)}${'☆'.repeat(5-r.estrellas)}</p>
        </div>
      </div>
      <p style="font-size:13px;color:var(--tinta);line-height:1.5;margin-bottom:10px">"${esc(r.texto)}"</p>
      ${l?`<p style="font-size:12px;color:var(--verde-700);font-weight:600">${l.emoji} ${esc(l.nombre)}</p>`:''}
    </div>`;
  }).join('');
  obsReveal();
}

// Cambia entre las pestañas 'Reseñas' y 'Escribir reseña'.
// Si no hay sesión, en vez del formulario muestra un aviso para iniciar sesión
function swTab(t){
  ['rv','wr'].forEach(x=>{
    $('tab-'+x).classList.toggle('active',x===t);
    $('tc-'+x).style.display=x===t?'block':'none';
  });
  if(t==='wr'&&!usuarioActual){
    $('tc-wr').innerHTML=`<div style="text-align:center;padding:28px 0"><p style="font-size:32px;margin-bottom:10px">🔒</p><p style="font-weight:600;margin-bottom:8px">Inicia sesión para escribir</p><button onclick="cerrarM('detalle');abrirM('login')" class="btn">Iniciar sesión</button></div>`;
  }
}

// ─── TARJETAS (paginadas) ────────────────────
// Devuelve los lugares que cumplen la categoría y el texto buscado. Con "Cerca de mí"
// activo, además filtra por radio y ordena por distancia (sin tocar los datos guardados)
function listaFiltrada(){
  const q=norm(query);
  let r=lugares.filter(l=>(catActiva==='todos'||l.cat===catActiva)&&(!q||norm(l.nombre+' '+l.zona+' '+l.desc).includes(q)));
  if(cercaOn&&ubi){
    r=r.map(l=>({l,d:distKm(ubi,l)})).filter(x=>x.d<=radioKm).sort((a,b)=>a.d-b.d).map(x=>x.l);
  }
  return r;
}

// Devuelve el HTML de la tarjeta de un lugar
function cardHTML(l){
  const stars='★'.repeat(l.estrellas)+'☆'.repeat(5-l.estrellas);
  // Arriba: sello con el emoji, etiqueta, nombre y estrellas. Abajo: descripción, zona, precio y botón
  return `<div class="pc reveal" onclick="abrirDetalle(${l.id})">
    <div class="pc-head" style="background:${(CATS[l.cat]||CATS.turistico).fondo}">
      <div class="pc-top">
        <span class="sello">${l.emoji}</span>
        <span class="tag ${(CATS[l.cat]||CATS.turistico).clase}">${esc(l.tag)}</span>
      </div>
      <h3 class="pc-nom">${esc(l.nombre)}</h3>
      <p class="pc-est">${stars} <span id="rc-${l.id}">(${cntRv[l.id]||0})</span></p>
    </div>
    <div class="pc-body">
      <p class="pc-desc">${esc(l.desc)}</p>
      <div class="pc-pie">
        <div style="min-width:0">
          <p class="pc-zona">📍 ${esc(l.zona)}</p>
          <p class="pc-precio">${esc(l.precio)}</p>
          ${ubi?`<p class="pc-km">a ${fmtKm(distKm(ubi,l))}</p>`:''}
        </div>
        <a href="${urlLlegar(l)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="btn btn-sm" style="font-size:12px;padding:7px 14px;white-space:nowrap;flex-shrink:0">🗺️ Llegar</a>
      </div>
    </div>
  </div>`;
}

// Muestra u oculta el botón 'Ver más' y actualiza el texto 'Mostrando X de Y'
function actualizarMas(total){
  const b=$('btn-more'),resto=total-shown;
  b.style.display=resto>0?'inline-block':'none';
  if(resto>0)b.textContent=`Ver más lugares (${resto})`;
  $('res-info').textContent=total?`Mostrando ${Math.min(shown,total)} de ${total} lugares`:'';
}

// Dibuja desde cero las primeras tarjetas (PAGE) de la lista filtrada
function renderCards(){
  shown=PAGE;
  $('shimmer-g').style.display='none';
  const grid=$('grid-l');
  grid.style.display='grid';
  const lista=listaFiltrada();
  if(!lista.length){
    grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:52px 0;color:var(--tinta-tenue)"><p style="font-size:36px;margin-bottom:10px">🔍</p><p style="font-weight:600">No hay lugares que coincidan.'+(cercaOn?'<br><span style="font-weight:400;font-size:13px">Probá con un radio más grande.</span>':'')+'</p></div>';
  }else{
    grid.innerHTML=lista.slice(0,shown).map(cardHTML).join('');
  }
  actualizarMas(lista.length);
  obsReveal();
}

// Agrega la siguiente tanda de tarjetas sin volver a dibujar las anteriores
function verMas(){
  const lista=listaFiltrada(),ini=shown;
  shown+=PAGE;
  $('grid-l').insertAdjacentHTML('beforeend',lista.slice(ini,shown).map(cardHTML).join(''));
  actualizarMas(lista.length);
  obsReveal();
}

// Cambia la categoría activa y actualiza tarjetas y mapa
function filtrar(cat){
  catActiva=cat;
  document.querySelectorAll('#filtros .cb[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
  renderCards();aplicarFiltroMapa();
}

// Activa o desactiva "Cerca de mí": pide la ubicación y ordena por distancia
async function toggleCerca(){
  if(cercaOn)cercaOn=false;
  else{
    try{await pedirUbicacion();}catch(e){return;}
    cercaOn=true;
  }
  $('chip-cerca').classList.toggle('active',cercaOn);
  $('fila-radio').style.display=cercaOn?'flex':'none';
  renderCards();aplicarFiltroMapa();
}
// Cambia el radio de "Cerca de mí" (en km)
function cambiarRadio(){
  radioKm=+$('radio-lugares').value;
  renderCards();aplicarFiltroMapa();
}

// Buscador: espera 180ms después de la última tecla para no filtrar en cada letra
let tBuscar;
function buscar(){
  clearTimeout(tBuscar);
  tBuscar=setTimeout(()=>{query=$('q').value.trim();renderCards();aplicarFiltroMapa();},180);
}

// ─── DETALLE ─────────────────────────────────
// Abre el modal de detalle de un lugar (datos, reseñas y formulario)
function abrirDetalle(id){
  const l=lugares.find(x=>x.id===id);
  if(!l)return;
  detId=id;
  $('det-nom').textContent=l.nombre;
  $('det-zona').textContent='📍 '+l.zona;
  $('det-desc').textContent=l.desc;
  $('det-precio').textContent=l.precio;
  $('det-maps').href=urlLlegar(l);
  const dt=$('det-tag');
  dt.className='tag '+(CATS[l.cat]||CATS.turistico).clase;
  dt.style.cssText='margin-bottom:8px;display:inline-block';
  dt.textContent=l.tag;
  renderDetRv(id);
  $('tc-wr').innerHTML=FORM_RV;
  starR=0;swTab('rv');abrirM('detalle');
}

// ─── MAPA (se crea solo cuando hace falta) ───
// Crea un ícono circular de color con un emoji para los marcadores del mapa
function mkIcon(color,emoji,size=34){
  return L.divIcon({className:'',html:`<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size>34?20:16}px;box-shadow:0 4px 10px rgba(58,44,20,.28);border:2.5px solid var(--papel)">${emoji}</div>`,iconSize:[size,size],iconAnchor:[size/2,size/2]});
}

// Crea el mapa la primera vez que se necesita y devuelve el objeto del mapa.
// Si ya existe, solo lo devuelve. Si Leaflet no cargó, muestra un aviso y devuelve null
function ensureMapa(){
  if(mapa)return mapa;
  if(!window.L){
    $('map').innerHTML='<p style="padding:40px 16px;text-align:center;color:var(--tinta-tenue)">No se pudo cargar el mapa. Revisá tu conexión.</p>';
    return null;
  }
  iconos={usuario:mkIcon('var(--tinta-fuerte)','📍',40)};
  Object.keys(CATS).forEach(k=>iconos[k]=mkIcon(CATS[k].color,CATS[k].emoji));
  mapa=L.map('map').setView([9.9281,-84.0907],7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19}).addTo(mapa);
  cluster=L.markerClusterGroup?L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:45}):L.layerGroup();
  mapa.addLayer(cluster);
  lugares.forEach(crearMarcador);
  aplicarFiltroMapa();
  return mapa;
}

// HTML de la ventanita que sale al tocar un marcador
function popupHTML(l){
  return `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px">
    <div style="font-weight:700;font-size:14px;margin-bottom:3px">${l.emoji} ${esc(l.nombre)}</div>
    <div style="font-size:11px;color:var(--tinta-suave);margin-bottom:6px">📍 ${esc(l.zona)}</div>
    <div style="font-size:12px;color:var(--tinta);margin-bottom:8px">${esc(l.desc)}</div>
    <div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap">
      <button onclick="abrirDetalle(${l.id});mapa.closePopup()" style="font-size:12px;background:var(--verde-100);color:var(--verde-800);padding:5px 10px;border-radius:20px;border:none;cursor:pointer;font-family:inherit;font-weight:600">Ver reseñas</button>
      <a href="${urlLlegar(l)}" target="_blank" rel="noopener" style="font-size:12px;background:var(--verde-700);color:var(--papel);padding:5px 10px;border-radius:20px;text-decoration:none;font-weight:600">Llegar</a>
    </div>
  </div>`;
}

// Crea el marcador de un lugar (todavía no lo pone en el mapa)
function crearMarcador(l){
  // el contenido del popup se genera solo al abrirlo
  const m=L.marker([l.lat,l.lng],{icon:iconos[l.cat],title:l.nombre}).bindPopup(()=>popupHTML(l),{className:'map-popup',maxWidth:240});
  marcadores.push({lugar:l,marcador:m});
}

// Agrega el marcador de un lugar nuevo (solo si el mapa ya existe)
function agregarMarcador(l){
  if(!mapa)return;
  crearMarcador(l);
  aplicarFiltroMapa();
}

// Deja en el mapa solo los marcadores que coinciden con el filtro y el buscador
function aplicarFiltroMapa(){
  if(!mapa)return;
  const ids=new Set(listaFiltrada().map(l=>l.id));
  const arr=marcadores.filter(x=>ids.has(x.lugar.id)).map(x=>x.marcador);
  cluster.clearLayers();
  cluster.addLayers?cluster.addLayers(arr):arr.forEach(m=>cluster.addLayer(m));
}

// Pone (o actualiza) el marcador de "estás aquí". Si centrar=true, además
// acerca el mapa a esa posición y muestra la ventanita
function ponerMarcadorUsuario(centrar=true){
  const m=ensureMapa();if(!m||!ubi)return;
  if(marcUsr)m.removeLayer(marcUsr);
  marcUsr=L.marker([ubi.lat,ubi.lng],{icon:iconos.usuario,zIndexOffset:1000}).addTo(m).bindPopup('<b>📍 Estás aquí</b>');
  $('gps-badge').style.display='inline-flex';
  if(centrar){
    marcUsr.openPopup();
    m.setView([ubi.lat,ubi.lng],13,{animate:true});
    $('mapa').scrollIntoView({behavior:'smooth'});
  }
}

// Botón "Centrar aquí": pide la ubicación (siempre fresca) y la muestra en el mapa
async function obtenerUbi(){
  try{await pedirUbicacion(true);}catch(e){return;}
  ponerMarcadorUsuario(true);
  renderCards();
  toast('📍 Ubicación activa en el mapa');
}

// ─── REVEAL (un solo observador) ─────────────
// Un solo observador para todas las animaciones de aparición.
// Cuando un elemento entra en pantalla le pone la clase 'vis' y deja de vigilarlo
const ob='IntersectionObserver' in window?new IntersectionObserver((en,o)=>{
  en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');o.unobserve(e.target);}});
},{threshold:.08}):null;
// Le pide al observador que vigile los elementos con clase 'reveal' que aún no aparecieron
function obsReveal(){
  document.querySelectorAll('.reveal:not(.vis)').forEach(el=>ob?ob.observe(el):el.classList.add('vis'));
}

// ─── INIT ────────────────────────────────────
// Arranque: cuando la página termina de cargar se inicia todo lo demás
window.addEventListener('DOMContentLoaded',()=>{
  contarRv();
  if(usuarioActual)iniciarSesion(usuarioActual);
  applyResponsive();
  renderCards();
  renderRvHome();
  updStats();
  obsReveal();
  // el mapa solo se crea cuando la sección está por aparecer
  if('IntersectionObserver' in window){
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){ensureMapa();o.disconnect();}},{rootMargin:'400px'});
    o.observe($('mapa'));
  }else ensureMapa();
});
