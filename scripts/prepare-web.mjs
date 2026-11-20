import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const webDir = resolve(root, "www");
const assetsDir = resolve(root, "assets");
await mkdir(webDir, { recursive: true });
await mkdir(assetsDir, { recursive: true });

// Use the exact iPhone home-screen artwork as the Android launcher icon source.
await copyFile(resolve(root, "apple-touch-icon.png"), resolve(assetsDir, "icon.png"));

let html = await readFile(resolve(root, "index.html"), "utf8");

// PWA assets and service workers are for the browser version, not the native WebView.
html = html.replace(/<link[^>]+rel=["']manifest["'][^>]*>\s*/i, "");
html = html.replace(/<link[^>]+apple-touch-icon[^>]*>\s*/i, "");

const serviceWorkerGuard = 'if ("serviceWorker" in navigator) {';
if (!html.includes(serviceWorkerGuard)) {
  throw new Error("Не найден блок регистрации Service Worker: проверьте index.html");
}
html = html.replace(
  serviceWorkerGuard,
  'if (!window.Capacitor?.isNativePlatform?.() && "serviceWorker" in navigator) {'
);

const installButtonDecl = 'const installAppBtn = document.getElementById("installAppBtn");';
if (!html.includes(installButtonDecl)) {
  throw new Error("Не найдена кнопка установки сайта в index.html");
}
html = html.replace(
  installButtonDecl,
  installButtonDecl + '\nif (window.Capacitor?.isNativePlatform?.()) installAppBtn.hidden = true;'
);

await writeFile(resolve(webDir, "index.html"), html, "utf8");
for (const file of [
  "favicon.svg",
  "apple-touch-icon.png",
  "4568EABA-61D0-4512-982E-D2756D728869.png"
]) {
  await copyFile(resolve(root, file), resolve(webDir, file));
}
console.log("Android web bundle prepared in ./www");
