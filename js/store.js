// ════════════════════════════════════════════
// STORE: funciones de apoyo para guardar datos en el navegador
// ════════════════════════════════════════════

// Envoltorio de localStorage. Guarda y lee objetos como JSON y no se rompe
// si el navegador está lleno, bloqueado (modo privado) o el dato está dañado.
const Store={
  // Lee una clave. Si no existe o falla, devuelve el valor por defecto (def)
  get(k,def){
    try{const v=JSON.parse(localStorage.getItem(k));return v??def;}
    catch(e){return def;}
  },
  // Guarda un valor. Devuelve true si se pudo y false si no
  set(k,v){
    try{localStorage.setItem(k,JSON.stringify(v));return true;}
    catch(e){return false;}
  },
  // Borra una clave
  del(k){try{localStorage.removeItem(k);}catch(e){}}
};

// Recibe una foto (archivo), la recorta al centro en cuadrado y la achica
// a 160px máximo. Devuelve una promesa con la imagen en texto (base64).
// Sirve para que la foto de perfil no ocupe casi todo el localStorage.
function reducirImagen(file,max=160){
  return new Promise((res,rej)=>{
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{
      const lado=Math.min(img.width,img.height);          // lado del cuadrado central
      const c=document.createElement('canvas');
      c.width=c.height=Math.min(max,lado);
      // dibuja solo la parte central de la foto, ya reducida
      c.getContext('2d').drawImage(img,(img.width-lado)/2,(img.height-lado)/2,lado,lado,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg',.8));                   // JPEG al 80% de calidad
    };
    img.onerror=()=>{URL.revokeObjectURL(url);rej();};
    img.src=url;
  });
}
