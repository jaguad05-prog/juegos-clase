/**
 * CLASIFICACIÓN GENERAL · servidor · v1
 * Guarda los resultados de cada juego (orden de equipos) para sumar la clasificación general.
 * Puntos por juego: 6 al primero, 5 al segundo, 4, 3, 2 y 1 al resto. Se calculan en la página.
 */
var P = PropertiesService.getScriptProperties();
var CLAVE = "madrid";
function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) { var p = {}; try { p = JSON.parse(e.postData.contents); } catch (x) {} return responder(p); }
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function leer() { var v = P.getProperty("estado"); return v ? JSON.parse(v) : { equipos: [], juegos: {} }; }
function responder(p) {
  try {
    if (p.a === "get") return salida({ ok: true, estado: leer() });
    if (p.a === "save") {
      if (String(p.k) !== CLAVE) return salida({ error: "Clave incorrecta" });
      var e = p.estado || {};
      if (!Array.isArray(e.equipos) || typeof e.juegos !== "object") return salida({ error: "Datos incorrectos" });
      P.setProperty("estado", JSON.stringify({ equipos: e.equipos.slice(0, 40), juegos: e.juegos }));
      return salida({ ok: true, estado: leer() });
    }
    return salida({ error: "Acción desconocida" });
  } catch (err) { return salida({ error: String((err && err.message) || err) }); }
}
