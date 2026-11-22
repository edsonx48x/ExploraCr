// ════════════════════════════════════════════
// Service worker de ExploraCR: deja la app funcionando sin internet.
//  - Archivos propios (HTML, CSS, JS, íconos): se guardan al instalar y se sirven
//    desde el caché; si hay internet se actualizan en segundo plano.
//  - Leaflet y fuentes (unpkg, Google Fonts): se guardan al usarlos la primera vez.
//  - Mapa (tiles) y búsqueda "cerca de ti" (Overpass): siempre van a internet.
// Para publicar una versión nueva, cambiá el número de VERSION.
// ════════════════════════════════════════════
const VERSION='exploracr-v1';
const PROPIOS=['./','index.html','css/styles.css','js/data.js','js/store.js','js/geo.js','js/app.js','js/cerca.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
const EXTERNOS=['unpkg.com','fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(PROPIOS)).then(()=>self.skipWaiting()));
});

// Borra los cachés de versiones anteriores
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const propio=u.origin===location.origin;
  if(!propio&&!EXTERNOS.includes(u.hostname))return; // tiles, Overpass, etc.: red normal
  e.respondWith(caches.open(VERSION).then(async c=>{
    const guardado=await c.match(r,{ignoreSearch:propio});
    const red=fetch(r).then(resp=>{if(resp.ok||resp.type==='opaque')c.put(r,resp.clone());return resp;}).catch(()=>null);
    if(guardado){e.waitUntil(red);return guardado;}      // rápido: caché, y se refresca atrás
    return (await red)||(r.mode==='navigate'?c.match('index.html'):Response.error());
  }));
});
