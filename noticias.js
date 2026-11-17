// Tu noticia · recibe las noticias que publican los alumnos y se las enseña al profesor
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MINIMO = 500;
const FICHERO = path.join(__dirname, "data", "noticias.json");
// La clave del panel del profesor no está escrita aquí: solo su huella
const HUELLA = "d4837ccf11d67cbfa9503909a2a6da7dd15a98b3e0b37bedb7f9767cd8572464";

// Copia de cada noticia en el Google Drive del profesor (Apps Script). La dirección y la clave
// están en las variables de entorno de Render, así no quedan a la vista en GitHub.
const DRIVE_URL = process.env.NOTICIAS_DRIVE_URL || "";
const DRIVE_CLAVE = process.env.NOTICIAS_DRIVE_CLAVE || "";

let noticias = {};
try { noticias = JSON.parse(fs.readFileSync(FICHERO, "utf8")); } catch (e) {}
let pendiente = null;
function guardar() {
  if (pendiente) return;
  pendiente = setTimeout(() => { pendiente = null; fs.writeFile(FICHERO, JSON.stringify(noticias), () => {}); }, 1000);
}

const huella = (t) => crypto.createHash("sha256").update(String(t || "").trim().toLowerCase()).digest("hex");
const claveOk = (c) => huella(c) === HUELLA;
const idDe = (n) => String(n || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const textoPlano = (h) => String(h || "").replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|div|li)>/gi, " ").replace(/<[^>]*>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&[a-z]+;|&#\d+;/gi, "x");
const contar = (blocks) => (blocks || []).filter((b) => b && b.type === "text").map((b) => textoPlano(b.content)).join(" ")
  .split(/\s+/).filter((w) => /[0-9A-Za-zÀ-ÿ]/.test(w)).length;
const archivoDe = (n) => String(n || "alumno").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-noticia";

async function aDrive(id, intento = 1) {
  const n = noticias[id];
  if (!n) return;
  if (!DRIVE_URL) { n.drive = "sin configurar"; return; }
  const fecha = n.fecha;
  try {
    const r = await fetch(DRIVE_URL, { method: "POST", headers: { "Content-Type": "text/plain" }, redirect: "follow",
      body: JSON.stringify({ clave: DRIVE_CLAVE, archivo: archivoDe(n.nombre), html: n.html }) });
    const d = JSON.parse(await r.text());
    if (!d.ok) throw new Error(d.error || "error");
    if (noticias[id] && noticias[id].fecha === fecha) { noticias[id].drive = "ok"; guardar(); }
  } catch (e) {
    if (noticias[id] && noticias[id].fecha === fecha) noticias[id].drive = "error";
    if (intento < 4) setTimeout(() => aDrive(id, intento + 1), 20000 * intento);
  }
}

const hora = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });

function responder(res, obj) {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function accion(nombre, d) {
  if (nombre === "publicar") {
    const id = idDe(d.nombre);
    if (!id) return { ok: false, error: "falta el nombre" };
    const art = d.article || {};
    const palabras = contar(art.blocks);
    if (palabras < MINIMO) return { ok: false, error: `la noticia tiene ${palabras} palabras y hacen falta ${MINIMO}` };
    if (typeof d.html !== "string" || !d.html) return { ok: false, error: "la noticia llegó vacía" };
    const antes = noticias[id];
    noticias[id] = {
      id, nombre: String(d.nombre).trim().slice(0, 80), titulo: String(art.title || "").slice(0, 300),
      seccion: String(art.section || ""), palabras, html: d.html, article: art,
      fecha: new Date().toISOString(), envios: (antes ? antes.envios : 0) + 1, drive: "enviando",
    };
    guardar();
    aDrive(id);
    return { ok: true, hora: hora() };
  }
  if (nombre === "entrar") return { ok: claveOk(d.clave) };
  if (!claveOk(d.clave)) return { ok: false, error: "clave incorrecta" };
  if (nombre === "lista") {
    return { ok: true, noticias: Object.values(noticias).map(({ html, article, ...r }) => r).sort((a, b) => b.fecha.localeCompare(a.fecha)) };
  }
  if (nombre === "ver") {
    const n = noticias[d.id];
    return n ? { ok: true, noticia: { id: n.id, nombre: n.nombre, titulo: n.titulo, seccion: n.seccion, palabras: n.palabras, fecha: n.fecha, envios: n.envios, drive: n.drive, html: n.html } } : { ok: false, error: "no está" };
  }
  if (nombre === "borrar") {
    delete noticias[d.id];
    guardar();
    return { ok: true };
  }
  return { ok: false, error: "acción desconocida" };
}

function handle(req, res, url) {
  const m = url.pathname.match(/^\/api\/noticias\/(publicar|entrar|lista|ver|borrar)\/?$/);
  if (!m) return false;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return true; }
  const trozos = []; let tam = 0, cortado = false;
  req.on("data", (c) => {
    tam += c.length;
    if (tam > 40e6) { cortado = true; responder(res, { ok: false, error: "la noticia pesa demasiado, quita alguna foto" }); req.destroy(); return; }
    trozos.push(c);
  });
  req.on("end", () => {
    if (cortado) return;
    let d = {};
    try { d = JSON.parse(Buffer.concat(trozos).toString("utf8") || "{}"); } catch (e) { return responder(res, { ok: false, error: "datos mal enviados" }); }
    try { responder(res, accion(m[1], d)); } catch (e) { responder(res, { ok: false, error: String((e && e.message) || e) }); }
  });
  return true;
}

module.exports = { handle, idDe, contar };
