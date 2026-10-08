/**
 * LA CARRERA DE LA REDACCIÓN · servidor (Google Apps Script)
 *
 * Cómo instalarlo (solo la primera vez):
 *  1. Entra en https://script.google.com con tu cuenta de la UCM y pulsa "Nuevo proyecto".
 *  2. Borra lo que aparece, pega TODO este archivo y guarda (icono del disquete).
 *  3. Pulsa "Implementar" → "Nueva implementación" → rueda dentada → "Aplicación web".
 *     - Ejecutar como: Yo
 *     - Quién tiene acceso: Cualquier usuario
 *  4. Pulsa "Implementar", autoriza los permisos y copia la URL que termina en /exec.
 *  5. Pega esa URL en la pantalla de la carrera (casilla "Dirección del servidor").
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 10;
var COLORES = ["#C8102E","#1565C0","#2E7D32","#F9A825","#6A1B9A","#EF6C00","#00838F","#AD1457","#4E342E","#37474F"];

function doGet(e)  { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function responder(p) {
  try {
    if (p.a === "ping")  return salida({ ok: true });
    if (p.a === "state") return salida(estado(p.c));
    if (p.a === "qs")    return salida({ ok: true, qs: leer("Q_" + cod(p.c)) || [] });
    if (!ACCIONES[p.a])  return salida({ error: "Acción desconocida" });
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try { return salida(ACCIONES[p.a](p)); }
    finally { lock.releaseLock(); }
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

// ── almacenamiento ──
function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(k, o) {
  var s = JSON.stringify(o);
  if (s.length > 400000) throw new Error("Demasiado texto para guardar (" + k.charAt(0) + ")");
  P.setProperty(k, s);
}
function partida(c) {
  var g = leer("G_" + cod(c));
  if (!g) throw new Error("No existe ninguna carrera con el código " + cod(c));
  return g;
}
function equipo(g, t) {
  var e = leer("T_" + g.code + "_" + t);
  if (!e) throw new Error("Equipo no encontrado");
  return e;
}
function guardarEquipo(g, e) { e.upd = Date.now(); guardar("T_" + g.code + "_" + e.id, e); }
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }

// Lee todo de una sola vez para gastar poca cuota de Google.
function estado(c) {
  var todo = P.getProperties(), k = cod(c);
  if (!todo["G_" + k]) throw new Error("No existe ninguna carrera con el código " + k);
  var g = JSON.parse(todo["G_" + k]);
  var equipos = [];
  for (var i = 0; i < g.teams.length; i++) {
    var v = todo["T_" + g.code + "_" + g.teams[i]];
    if (v) equipos.push(JSON.parse(v));
  }
  var copia = JSON.parse(JSON.stringify(g));
  delete copia.admin;
  return { ok: true, now: Date.now(), game: copia, teams: equipos };
}

function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), borrar = {};
  for (var k in todo) {
    if (k.indexOf("G_") === 0) {
      try { var g = JSON.parse(todo[k]); if (ahora - g.created > 24 * 3600 * 1000) borrar[g.code] = 1; } catch (x) {}
    }
  }
  for (var k2 in todo) {
    var partes = k2.split("_");
    if (partes.length >= 2 && borrar[partes[1]]) P.deleteProperty(k2);
  }
}

// v2: la carrera no termina con el primero, sigue hasta que llegan tres equipos a la meta
// (o todos, si juegan menos de tres). Los que ya han llegado esperan en la meta.
var PODIO = 3;
function comprobarMeta(g, e) {
  if (g.status === "running" && e.pos >= g.meta && !e.finishedAt) {
    e.pos = g.meta;
    e.finishedAt = Date.now();
    e.phase = "done";
    g.arrivals = g.arrivals || [];
    if (g.arrivals.indexOf(e.id) < 0) g.arrivals.push(e.id);
    e.place = g.arrivals.length;
    if (!g.winner) g.winner = e.id;
    if (g.arrivals.length >= Math.min(PODIO, g.teams.length)) {
      g.status = "over";
      g.endedAt = Date.now();
    }
    guardar("G_" + g.code, g);
  }
}

// Evita contar dos veces la misma respuesta si el móvil reintenta el envío.
function repetido(e, p) {
  var n = parseInt(p.n, 10) || 0;
  if (n && n <= (e.seq || 0)) return true;
  if (n) e.seq = n;
  return false;
}

function enParada(g, e) {
  return e.stop < g.stops.length && e.pos >= g.stops[e.stop];
}

// ── acciones ──
var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do {
      code = "";
      for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length));
    } while (P.getProperty("G_" + code));
    var meta = Math.max(5, Math.min(60, parseInt(p.meta, 10) || 20));
    var stops = (p.stops || []).map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return x > 0 && x < meta; })
      .sort(function (a, b) { return a - b; });
    var tasks = (p.tasks || []).slice(0, stops.length).map(function (t) { return String(t).slice(0, 600); });
    while (tasks.length < stops.length) tasks.push("Escribid un titular informativo sobre la última noticia que hayáis leído.");
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      meta: meta, stops: stops, tasks: tasks, status: "lobby", teams: [],
      created: Date.now(), startedAt: 0, endedAt: 0, winner: null, arrivals: []
    };
    guardar("G_" + code, g);
    if (p.extra && p.extra.length) guardar("Q_" + code, p.extra);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c);
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 28);
    if (!nombre) throw new Error("Escribe el nombre de vuestra redacción");
    for (var i = 0; i < g.teams.length; i++) {
      var ex = leer("T_" + g.code + "_" + g.teams[i]);
      if (ex && ex.name.toLowerCase() === nombre.toLowerCase()) return { ok: true, team: ex };
    }
    if (g.status === "over") throw new Error("Esta carrera ya ha terminado");
    if (g.teams.length >= MAX_EQUIPOS) throw new Error("La carrera ya tiene " + MAX_EQUIPOS + " equipos");
    var id = "e" + (g.teams.length + 1);
    var e = {
      id: id, name: nombre, color: COLORES[g.teams.length % COLORES.length],
      pos: 0, floor: 0, ok: 0, ko: 0, stop: 0, phase: "run",
      texts: [], note: "", finishedAt: 0, upd: 0, seq: 0
    };
    g.teams.push(id);
    guardar("G_" + g.code, g);
    guardarEquipo(g, e);
    return { ok: true, team: e };
  },

  "start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "lobby") return { ok: true };
    if (!g.teams.length) throw new Error("Todavía no se ha apuntado ningún equipo");
    g.status = "running"; g.startedAt = Date.now();
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "ok": function (p) {
    var g = partida(p.c), e = equipo(g, p.t);
    if (g.status !== "running" || e.phase !== "run" || repetido(e, p)) return { ok: true, team: e, status: g.status };
    e.pos++; e.ok++;
    if (enParada(g, e)) { e.phase = "write"; e.note = ""; }
    comprobarMeta(g, e);
    guardarEquipo(g, e);
    return { ok: true, team: e, status: g.status };
  },

  "ko": function (p) {
    var g = partida(p.c), e = equipo(g, p.t);
    if (g.status !== "running" || e.phase !== "run" || repetido(e, p)) return { ok: true, team: e, status: g.status };
    e.ko++;
    e.pos = Math.max(e.floor, e.pos - 1);
    guardarEquipo(g, e);
    return { ok: true, team: e, status: g.status };
  },

  "send": function (p) {
    var g = partida(p.c), e = equipo(g, p.t);
    if (e.phase !== "write" && e.phase !== "revise") return { ok: true, team: e, status: g.status };
    var txt = String(p.text || "").trim().slice(0, 500);
    if (!txt) throw new Error("El texto está vacío");
    e.texts[e.stop] = txt;
    e.phase = "review"; e.sentAt = Date.now();
    guardarEquipo(g, e);
    return { ok: true, team: e, status: g.status };
  },

  "judge": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var e = equipo(g, p.t);
    if (e.phase !== "review") return { ok: true, team: e };
    if (String(p.v) === "1") {
      e.stop++; e.phase = "run"; e.note = "";
      e.pos++; e.floor = e.pos;
      if (enParada(g, e)) e.phase = "write";
      comprobarMeta(g, e);
    } else {
      e.phase = "revise";
      e.note = String(p.note || "").slice(0, 200);
    }
    guardarEquipo(g, e);
    return { ok: true, team: e };
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "over") { g.status = "over"; g.endedAt = Date.now(); guardar("G_" + g.code, g); }
    return { ok: true };
  }
};
