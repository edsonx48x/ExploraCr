// Copia los archivos de la página a la carpeta "www", que es la que Capacitor
// mete dentro de las apps de Android e iOS.
const fs=require('fs'),path=require('path');
const raiz=path.join(__dirname,'..'),destino=path.join(raiz,'www');
const archivos=['index.html','manifest.webmanifest','sw.js','css','js','icons'];
fs.rmSync(destino,{recursive:true,force:true});
fs.mkdirSync(destino);
archivos.forEach(a=>fs.cpSync(path.join(raiz,a),path.join(destino,a),{recursive:true}));
console.log('Listo: archivos copiados a www/');
