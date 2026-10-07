// Juegos de clase · servidor para Render
// Ejecuta el mismo código de los servidores de Google Apps Script (Guerra de Titulares,
// Juego de SEO y Carrera de la Redacción), pero en memoria, sin las esperas de Google.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PORT = process.env.PORT || 3000;
const PUB = __dirname;
const DATA = path.join(__dirname, "data");
try { fs.mkdirSync(DATA, { recursive: true }); } catch (e) {}

// ── cada juego en su propia caja, con las piezas de Google que usa ──
function cargarJuego(nombre) {
  const fichero = path.join(DATA, nombre + ".json");
  let store = {};
  try { store = JSON.parse(fs.readFileSync(fichero, "utf8")); } catch (e) {}
  let pendiente = null;
  const guardarDisco = () => {
    if (pendiente) return;
    pendiente = setTimeout(() => {
      pendiente = null;
      fs.writeFile(fichero, JSON.stringify(store), () => {});
    }, 1500);
  };
  const props = {
    getProperty: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setProperty: (k, v) => { store[k] = String(v); guardarDisco(); return props; },
    deleteProperty: (k) => { delete store[k]; guardarDisco(); return props; },
    getProperties: () => Object.assign({}, store),
  };
  const ctx = {
    PropertiesService: { getScriptProperties: () => props },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock() { return true; }, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (s) => ({ body: s, setMimeType() { return this; } }),
    },
    Logger: { log() {} },
    console,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, nombre + ".gs.js"), "utf8"), ctx, { filename: nombre });
  return (bodyText) => ctx.doPost({ postData: { contents: bodyText }, parameter: {} }).body;
}

const JUEGOS = {
  guerra: cargarJuego("guerra"),
  seo: cargarJuego("seo"),
  carrera: cargarJuego("carrera"),
};

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp",
};

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const m = url.pathname.match(/^\/api\/(guerra|seo|carrera)\/?$/);
  if (m) {
    cors(res);
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on("end", () => {
      if (req.method === "GET") body = JSON.stringify(Object.fromEntries(url.searchParams));
      let out;
      try { out = JUEGOS[m[1]](body || "{}"); }
      catch (e) { out = JSON.stringify({ error: String((e && e.message) || e) }); }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(out);
    });
    return;
  }
  if (url.pathname === "/salud") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }

  let p = decodeURIComponent(url.pathname);
  if (p === "/" || p === "") p = "/index.html";
  const file = path.normalize(path.join(PUB, p));
  if (!file.startsWith(PUB) || !/\.(html|jpg|jpeg|png|svg|ico|webp)$/i.test(file)) { res.writeHead(404); return res.end("No encontrado"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("No encontrado"); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": TIPOS[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400" });
    res.end(data);
  });
});

server.listen(PORT, () => console.log("Juegos de clase en el puerto " + PORT));
