// ════════════════════════════════════════════
// GEO: ubicación del usuario y cálculo de distancias
// Se carga antes de app.js. La ubicación solo vive en memoria mientras la
// página está abierta: no se guarda en el navegador ni en ningún servidor.
// ════════════════════════════════════════════

// Ubicación actual del usuario: {lat, lng}, o null si aún no la dio
let ubi=null;

// Distancia en kilómetros entre dos puntos {lat,lng} (fórmula de Haversine)
function distKm(a,b){
  const R=6371,rad=x=>x*Math.PI/180;
  const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

// Texto corto para una distancia: "350 m", "2.4 km", "18 km"
function fmtKm(km){
  if(km<1)return (Math.max(10,Math.round(km*100)*10))+' m';
  if(km<10)return km.toFixed(1)+' km';
  return Math.round(km)+' km';
}

// Pide la ubicación al navegador y devuelve una promesa con {lat,lng}.
// Si ya la tenemos la reutiliza, salvo que se pida refrescarla (forzar=true).
// Si el usuario niega el permiso, avisa con un mensaje y la promesa falla.
let _pidiendoUbi=null;
function pedirUbicacion(forzar=false){
  if(!forzar&&ubi)return Promise.resolve(ubi);
  if(_pidiendoUbi)return _pidiendoUbi;
  if(!navigator.geolocation){
    toast('Tu navegador no soporta GPS.','err');
    return Promise.reject(new Error('sin-gps'));
  }
  toast('Buscando tu ubicación...');
  _pidiendoUbi=new Promise((res,rej)=>{
    navigator.geolocation.getCurrentPosition(
      p=>{ubi={lat:p.coords.latitude,lng:p.coords.longitude};res(ubi);},
      err=>{
        toast(err&&err.code===1?'Necesitamos tu permiso para usar la ubicación.':'No se pudo obtener tu ubicación.','err');
        rej(err);
      },
      {timeout:10000,maximumAge:60000}
    );
  });
  // al terminar (bien o mal) se libera, para poder volver a pedirla
  const libre=()=>{_pidiendoUbi=null;};
  _pidiendoUbi.then(libre,libre);
  return _pidiendoUbi;
}
