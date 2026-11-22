// ════════════════════════════════════════════
// CERCA DE TI
// Busca lugares REALES alrededor del usuario (restaurantes, cafeterías,
// actividades, zonas turísticas...) con los datos abiertos de OpenStreetMap,
// a través del servicio público Overpass. Se carga después de app.js y usa
// sus funciones (CATS, ensureMapa, mkIcon, esc, toast...) y las de geo.js.
//
// Privacidad: a Overpass solo se le envía la ubicación redondeada a unos
// 100 m y el radio de búsqueda. ExploraCR no guarda la ubicación.
// ════════════════════════════════════════════

// Servidores de Overpass: si el primero falla se prueba con el segundo
const OVERPASS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];

// Qué etiquetas de OpenStreetMap corresponden a cada categoría de ExploraCR
const OSM={
  restaurante:['["amenity"~"^(restaurant|fast_food|food_court)$"]'],
  cafeteria:['["amenity"="cafe"]','["shop"="coffee"]'],
  hotel:['["tourism"~"^(hotel|hostel|guest_house|motel|apartment|chalet)$"]'],
  paseo:['["natural"~"^(waterfall|peak|beach|hot_spring|volcano)$"]','["leisure"="nature_reserve"]'],
  actividad:['["tourism"~"^(zoo|theme_park|aquarium)$"]','["leisure"~"^(water_park|sports_centre|golf_course|miniature_golf)$"]','["amenity"~"^(cinema|bicycle_rental|boat_rental)$"]'],
  turistico:['["tourism"~"^(attraction|viewpoint|museum|gallery)$"]','["historic"~"^(monument|memorial|castle|ruins|archaeological_site)$"]','["leisure"="park"]']
};

// Nombre en español del tipo de lugar según sus etiquetas de OpenStreetMap
const TIPOS={
  amenity:{restaurant:'Restaurante',fast_food:'Comida rápida',food_court:'Plaza de comida',cafe:'Cafetería',cinema:'Cine',bicycle_rental:'Alquiler de bicicletas',boat_rental:'Alquiler de botes'},
  shop:{coffee:'Cafetería'},
  tourism:{hotel:'Hotel',hostel:'Hostal',guest_house:'Casa de huéspedes',motel:'Motel',apartment:'Apartamentos',chalet:'Cabañas',attraction:'Atractivo turístico',viewpoint:'Mirador',museum:'Museo',gallery:'Galería',zoo:'Zoológico',theme_park:'Parque temático',aquarium:'Acuario'},
  historic:{monument:'Monumento',memorial:'Memorial',castle:'Castillo',ruins:'Ruinas',archaeological_site:'Sitio arqueológico'},
  leisure:{park:'Parque',nature_reserve:'Reserva natural',water_park:'Parque acuático',sports_centre:'Centro deportivo',golf_course:'Campo de golf',miniature_golf:'Minigolf'},
  natural:{waterfall:'Catarata',peak:'Cima',beach:'Playa',hot_spring:'Aguas termales',volcano:'Volcán'}
};

// Estado de esta sección
let catCerca='restaurante';  // categoría elegida
let resCerca=[];             // últimos resultados
let capaCerca=null;          // capa del mapa con los marcadores de los resultados
let marcsCerca=[];           // marcadores de esa capa (para abrir sus ventanitas)
let tokenCerca=0;            // identifica la búsqueda vigente (si el usuario cambia de categoría, la anterior se descarta)
const cacheCerca=new Map();  // resultados ya consultados, para no repetir la consulta

// ─── Consulta a OpenStreetMap ────────────────
// Arma la consulta en el lenguaje de Overpass: todos los lugares con nombre
// de esa categoría dentro del radio (en metros) alrededor del punto
function consultaOverpass(cat,lat,lng,metros){
  const partes=OSM[cat].map(f=>`nwr${f}["name"](around:${metros},${lat},${lng});`).join('');
  return `[out:json][timeout:25];(${partes});out center 120;`;
}

// Envía la consulta; si un servidor no responde en 20 s o da error, prueba el siguiente
async function overpass(consulta){
  let ultimo;
  for(const url of OVERPASS){
    const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),20000);
    try{
      const r=await fetch(url,{method:'POST',body:'data='+encodeURIComponent(consulta),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:ctl.signal});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const datos=await r.json();
      if(!Array.isArray(datos.elements))throw new Error('respuesta inesperada');
      return datos;
    }catch(e){ultimo=e;}
    finally{clearTimeout(t);}
  }
  throw ultimo;
}

// Primera letra en mayúscula
const capital=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;

// Tipo de lugar en español (y el tipo de cocina si es restaurante)
function etiquetaTipo(t){
  for(const k of Object.keys(TIPOS)){
    const v=t[k];
    if(v&&TIPOS[k][v]){
      let s=TIPOS[k][v];
      if(t.cuisine&&(v==='restaurant'||v==='fast_food'))s+=' · '+capital(t.cuisine.split(';')[0].replace(/_/g,' '));
      return s;
    }
  }
  return 'Lugar';
}

// Convierte la respuesta de Overpass en una lista simple, sin repetidos y
// ordenada del más cercano al más lejano (máximo 30)
function procesarCerca(datos){
  const vistos=new Set(),out=[];
  datos.elements.forEach(e=>{
    const t=e.tags||{};
    if(!t.name)return;
    const lat=e.lat??(e.center&&e.center.lat),lng=e.lon??(e.center&&e.center.lon);
    if(lat==null||lng==null)return;
    const clave=t.name.toLowerCase()+'|'+lat.toFixed(3)+'|'+lng.toFixed(3);
    if(vistos.has(clave))return;
    vistos.add(clave);
    out.push({
      nombre:t.name,lat,lng,
      tipo:etiquetaTipo(t),
      dir:[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' '),
      km:distKm(ubi,{lat,lng})
    });
  });
  return out.sort((a,b)=>a.km-b.km).slice(0,30);
}

// ─── Pantalla ────────────────────────────────
// Elige la categoría (restaurantes, cafeterías...). Si ya buscó antes, busca de nuevo
function selCatCerca(cat){
  catCerca=cat;
  document.querySelectorAll('#cerca-cats .cb').forEach(b=>b.classList.toggle('active',b.dataset.cc===cat));
  if(ubi)buscarCerca();
}

// Botón de la portada: baja a esta sección y empieza la búsqueda
function irCerca(){
  $('cerca').scrollIntoView({behavior:'smooth'});
  buscarCerca();
}

// Dibuja las tarjetas con los resultados y el texto de resumen
function renderCerca(){
  const info=$('cerca-info'),grid=$('cerca-grid'),c=CATS[catCerca];
  const radio=+$('cerca-radio').value;
  $('cerca-mapa-btn').style.display=resCerca.length?'inline-flex':'none';
  if(!resCerca.length){
    grid.innerHTML='';
    info.textContent=`No encontramos ${c.nombre.toLowerCase()} en ese radio. Probá con un radio mayor o con otra categoría.`;
    return;
  }
  info.textContent=`${resCerca.length} resultado${resCerca.length!==1?'s':''} a menos de ${radio>=1000?radio/1000+' km':radio+' m'} de ti, del más cercano al más lejano.`;
  grid.innerHTML=resCerca.map((r,i)=>`
    <div class="cc">
      <span class="sello" style="width:40px;height:40px;font-size:19px">${c.emoji}</span>
      <div class="cc-info">
        <p class="cc-nom">${esc(r.nombre)}</p>
        <p class="cc-sub">${esc(r.tipo)}${r.dir?' · '+esc(r.dir):''}</p>
        <p class="pc-km">a ${fmtKm(r.km)}</p>
      </div>
      <div class="cc-acc">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}" target="_blank" rel="noopener" class="btn btn-sm" style="font-size:12px;padding:7px 14px">🗺️ Llegar</a>
        <button class="lnk" style="font-size:12px" onclick="verCercaEnMapa(${i})">Ver en el mapa</button>
      </div>
    </div>`).join('');
}

// Busca lugares reales cerca del usuario para la categoría y el radio elegidos
async function buscarCerca(forzarUbi=false){
  const info=$('cerca-info'),grid=$('cerca-grid');
  const mio=++tokenCerca;
  try{await pedirUbicacion(forzarUbi===true);}
  catch(e){
    info.textContent='Necesitamos tu ubicación para buscar lugares cerca. Activá el permiso de ubicación en tu navegador y volvé a intentarlo.';
    return;
  }
  if(mio!==tokenCerca)return;
  renderCards(); // las tarjetas de arriba ya pueden mostrar su distancia

  const metros=+$('cerca-radio').value;
  const lat=+ubi.lat.toFixed(3),lng=+ubi.lng.toFixed(3); // ≈110 m de precisión
  const clave=`${catCerca}|${lat}|${lng}|${metros}`;
  let lista=cacheCerca.get(clave);
  if(!lista){
    info.textContent='Buscando alrededor de ti…';
    $('cerca-mapa-btn').style.display='none';
    grid.innerHTML='<div class="sk"></div><div class="sk"></div>';
    try{
      lista=procesarCerca(await overpass(consultaOverpass(catCerca,lat,lng,metros)));
      cacheCerca.set(clave,lista);
    }catch(e){
      if(mio!==tokenCerca)return;
      grid.innerHTML='';
      info.innerHTML='No pudimos consultar OpenStreetMap en este momento. <button class="lnk" onclick="buscarCerca()">Reintentar</button>';
      return;
    }
    if(mio!==tokenCerca)return;
  }
  resCerca=lista;
  renderCerca();
  if(mapa)pintarCercaEnMapa(null,false); // si el mapa ya existe, lo mantiene al día
}

// ─── Mapa ────────────────────────────────────
// Dibuja los resultados en el mapa (capa aparte, sin mezclarse con los lugares
// de ExploraCR). Si se indica un número, abre la ventanita de ese lugar.
// 'acercar' ajusta el mapa para que se vean todos los resultados.
function pintarCercaEnMapa(idx,acercar){
  const m=ensureMapa();
  if(!m)return;
  if(capaCerca)m.removeLayer(capaCerca);
  capaCerca=L.layerGroup().addTo(m);
  const c=CATS[catCerca];
  marcsCerca=resCerca.map(r=>{
    const mk=L.marker([r.lat,r.lng],{icon:mkIcon(c.color,c.emoji,28),title:r.nombre}).bindPopup(()=>`<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:170px">
      <div style="font-weight:700;font-size:14px;margin-bottom:3px">${c.emoji} ${esc(r.nombre)}</div>
      <div style="font-size:11px;color:var(--tinta-suave);margin-bottom:8px">${esc(r.tipo)} · a ${fmtKm(r.km)}</div>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}" target="_blank" rel="noopener" style="font-size:12px;background:var(--verde-700);color:var(--papel);padding:5px 12px;border-radius:20px;text-decoration:none;font-weight:600">Llegar</a>
    </div>`,{className:'map-popup',maxWidth:240});
    mk.addTo(capaCerca);
    return mk;
  });
  if(ubi)ponerMarcadorUsuario(false);
  if(idx!=null&&marcsCerca[idx]){
    m.setView([resCerca[idx].lat,resCerca[idx].lng],17,{animate:true});
    marcsCerca[idx].openPopup();
  }else if(acercar&&resCerca.length){
    const puntos=resCerca.map(r=>[r.lat,r.lng]);
    if(ubi)puntos.push([ubi.lat,ubi.lng]);
    m.fitBounds(L.latLngBounds(puntos).pad(.15),{maxZoom:16});
  }
}

// Botón "Ver en el mapa": baja al mapa y muestra todos los resultados (o uno solo)
function verCercaEnMapa(idx){
  $('mapa').scrollIntoView({behavior:'smooth'});
  pintarCercaEnMapa(idx==null?null:idx,idx==null);
}
