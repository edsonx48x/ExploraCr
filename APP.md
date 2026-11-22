# ExploraCR como app de Android e iOS

La app es la misma página envuelta con Capacitor. Si cambiás algo de `index.html`, `css` o `js`, volvés a compilar y listo.

## Android (sin instalar nada)
1. Subí estos archivos al repo en GitHub: `package.json`, `capacitor.config.json`, `scripts/`, `.gitignore` y `.github/workflows/android.yml`.
2. En GitHub, pestaña Actions → "Android APK" → Run workflow.
3. Cuando termine (unos 5 minutos), entrá a esa ejecución y bajá `ExploraCR-apk` de Artifacts. Adentro está `app-debug.apk`.
4. Pasalo al celular e instalalo (hay que permitir "instalar apps desconocidas").

Ese APK sirve para probar y compartir. Para Google Play hace falta firmar la app y una cuenta de desarrollador (pago único de 25 USD).

## iOS (necesita una Mac)
Apple solo deja compilar en Mac con Xcode. En la Mac:
1. `npm install`, `npm run web`, `npx cap add ios`, `npx cap sync ios`
2. En `ios/App/App/Info.plist` agregá la clave `NSLocationWhenInUseUsageDescription` con el texto "Para mostrarte lugares cerca de ti".
3. `npx cap open ios`, elegí tu equipo en Signing & Capabilities y dale Run.
Para instalarla en un iPhone sin cable por mucho tiempo, o publicar en App Store, hace falta una cuenta Apple Developer (99 USD al año).
