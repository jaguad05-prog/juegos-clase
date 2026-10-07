/**
 * LA LIGUILLA · servidor (Google Apps Script)
 * Guarda en directo los equipos, el calendario, los partidos y los penaltis.
 * Se instala una vez en script.google.com como "Aplicación web"
 * (Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario).
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 12;
var COLORES = ["#C8102E","#1565C0","#2E7D32","#F9A825","#6A1B9A","#EF6C00","#00838F","#AD1457","#4E342E","#37474F","#558B2F","#5D4037"];

function doGet(e)  { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping")  return salida({ ok: true });
    if (p.a === "state") return salida(estado(p.c));
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
  if (s.length > 8800) throw new Error("Demasiados datos para guardar");
  P.setProperty(k, s);
}
function liga(c) {
  var g = leer("L_" + cod(c));
  if (!g) throw new Error("No existe ninguna liguilla con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }
function claveP(g, r, i) { return "M_" + g.code + "_" + r + "_" + i; }

function estado(c) {
  var todo = P.getProperties(), k = cod(c);
  if (!todo["L_" + k]) throw new Error("No existe ninguna liguilla con el código " + k);
  var g = JSON.parse(todo["L_" + k]);
  var equipos = [], partidos = [];
  for (var i = 0; i < g.teams.length; i++) {
    var v = todo["E_" + g.code + "_" + g.teams[i]];
    if (v) equipos.push(JSON.parse(v));
  }
  for (var key in todo) if (key.indexOf("M_" + g.code + "_") === 0) partidos.push(JSON.parse(todo[key]));
  var copia = JSON.parse(JSON.stringify(g));
  delete copia.admin;
  return { ok: true, now: Date.now(), league: copia, teams: equipos, matches: partidos };
}

function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), borrar = {};
  for (var k in todo) {
    if (k.indexOf("L_") === 0) {
      try { var g = JSON.parse(todo[k]); if (ahora - g.created > 3 * 24 * 3600 * 1000) borrar[g.code] = 1; } catch (x) {}
    }
  }
  for (var k2 in todo) {
    var partes = k2.split("_");
    if (partes.length >= 2 && borrar[partes[1]]) P.deleteProperty(k2);
  }
}

// Calendario de todos contra todos (método del círculo). Con número impar, uno descansa.
function calendario(ids) {
  var t = ids.slice();
  if (t.length % 2) t.push(null);
  var n = t.length, rondas = [];
  for (var r = 0; r < n - 1; r++) {
    var ronda = [];
    for (var i = 0; i < n / 2; i++) {
      var a = t[i], b = t[n - 1 - i];
      ronda.push(r % 2 ? [b, a] : [a, b]);
    }
    rondas.push(ronda);
    t.splice(1, 0, t.pop());
  }
  return rondas;
}

// ── penaltis ──
var MISMO_LADO = { TL: "BL", BL: "TL", TR: "BR", BR: "TR" };
function lanzador(m) { return (m.pen.k % 2 === 0) ? m.pen.first : (m.pen.first === "a" ? "b" : "a"); }
function tiros(m, lado) { var n = 0; m.pen.shots.forEach(function (s) { if (s.s === lado) n++; }); return n; }
function finPenaltis(m) {
  var ta = tiros(m, "a"), tb = tiros(m, "b"), N = m.pen.n || 5;
  if (ta < N || tb < N) {
    var restA = N - ta, restB = N - tb;
    if (m.sa + restA < m.sb || m.sb + restB < m.sa) return true;
    return false;
  }
  if (ta === tb && m.sa !== m.sb) return true;
  if (m.pen.k >= 30) return true;
  return false;
}

// ── acciones ──
var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do {
      code = "";
      for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length));
    } while (P.getProperty("L_" + code));
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      status: "lobby", teams: [], rounds: [], round: -1, playing: false, jor: [],
      seed: Math.floor(Math.random() * 1e9), created: Date.now()
    };
    guardar("L_" + code, g);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = liga(p.c);
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 24);
    if (!nombre) throw new Error("Escribe el nombre de vuestro equipo");
    for (var i = 0; i < g.teams.length; i++) {
      var ex = leer("E_" + g.code + "_" + g.teams[i]);
      if (ex && ex.name.toLowerCase() === nombre.toLowerCase()) return { ok: true, team: ex };
    }
    if (g.status !== "lobby") throw new Error("La liguilla ya ha empezado y no admite equipos nuevos");
    if (g.teams.length >= MAX_EQUIPOS) throw new Error("La liguilla ya tiene " + MAX_EQUIPOS + " equipos");
    var id = "e" + (g.teams.length + 1);
    var e = { id: id, name: nombre, color: COLORES[g.teams.length % COLORES.length] };
    g.teams.push(id);
    guardar("L_" + g.code, g);
    guardar("E_" + g.code + "_" + id, e);
    return { ok: true, team: e };
  },

  "start": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "lobby") return { ok: true };
    if (g.teams.length < 2) throw new Error("Hacen falta al menos dos equipos");
    var ids = g.teams.slice();
    for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
    g.rounds = calendario(ids);
    g.status = "league";
    guardar("L_" + g.code, g);
    return { ok: true };
  },

  // Empieza la jornada siguiente con el tipo elegido: preguntas, penaltis o prueba.
  "round": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "league") throw new Error("La liguilla no está en marcha");
    if (g.playing) throw new Error("Primero hay que cerrar la jornada en juego");
    if (g.round + 1 >= g.rounds.length) throw new Error("Ya se han jugado todas las jornadas");
    g.round++;
    var r = g.round, tipo = ["preguntas", "penaltis", "prueba"].indexOf(p.type) >= 0 ? p.type : "preguntas";
    var n = Math.max(3, Math.min(20, parseInt(p.n, 10) || 8));
    g.jor[r] = { type: tipo, n: n, task: String(p.task || "").slice(0, 600), start: Date.now() };
    g.rounds[r].forEach(function (par, i) {
      if (!par[0] || !par[1]) return;
      var m = { r: r, i: i, a: par[0], b: par[1], type: tipo, n: n, sa: 0, sb: 0, ia: 0, ib: 0, closed: false };
      if (tipo === "penaltis") m.pen = { k: 0, n: 5, first: Math.random() < 0.5 ? "a" : "b", shots: [], pick: { a: null, b: null } };
      guardar(claveP(g, r, i), m);
    });
    g.playing = true;
    guardar("L_" + g.code, g);
    return { ok: true, round: r };
  },

  // Respuesta en un partido de preguntas: cada acierto es un gol.
  "ans": function (p) {
    var g = liga(p.c), m = leer(claveP(g, p.r, p.i));
    if (!m || m.closed || m.type !== "preguntas") return { ok: true, match: m };
    var lado = m.a === p.t ? "a" : m.b === p.t ? "b" : null;
    if (!lado) throw new Error("Este partido no es vuestro");
    var q = parseInt(p.q, 10);
    if (q !== m["i" + lado]) return { ok: true, match: m };
    m["i" + lado]++;
    if (String(p.ok) === "1" || p.ok === true) m["s" + lado]++;
    if (m.ia >= m.n && m.ib >= m.n) m.closed = true;
    guardar(claveP(g, p.r, p.i), m);
    return { ok: true, match: m };
  },

  // Penalti: cada equipo manda si acertó la pregunta y la esquina elegida.
  "pen": function (p) {
    var g = liga(p.c), m = leer(claveP(g, p.r, p.i));
    if (!m || m.closed || m.type !== "penaltis") return { ok: true, match: m };
    var lado = m.a === p.t ? "a" : m.b === p.t ? "b" : null;
    if (!lado) throw new Error("Este partido no es vuestro");
    if (parseInt(p.k, 10) !== m.pen.k) return { ok: true, match: m };
    if (["TL", "TR", "BL", "BR"].indexOf(p.dir) < 0) throw new Error("Esquina no válida");
    m.pen.pick[lado] = { ok: String(p.ok) === "1" || p.ok === true, dir: p.dir };
    if (m.pen.pick.a && m.pen.pick.b) {
      var s = lanzador(m), kp = s === "a" ? "b" : "a";
      var tiro = m.pen.pick[s], parada = m.pen.pick[kp];
      var cubre = [parada.dir];
      var estira = parada.ok && !tiro.ok;
      if (estira) cubre.push(MISMO_LADO[parada.dir]);
      var gol = cubre.indexOf(tiro.dir) < 0;
      if (gol) m["s" + s]++;
      m.pen.shots.push({ s: s, shoot: tiro.dir, keep: parada.dir, okS: tiro.ok, okK: parada.ok, estira: estira, goal: gol, k: m.pen.k });
      m.pen.k++;
      m.pen.pick = { a: null, b: null };
      if (finPenaltis(m)) m.closed = true;
    }
    guardar(claveP(g, p.r, p.i), m);
    if (m.final && m.closed) campeon(g, m);
    return { ok: true, match: m };
  },

  // Prueba: cada equipo apunta el resultado. Si los dos coinciden, vale; si no, decide la profesora.
  "rep": function (p) {
    var g = liga(p.c), m = leer(claveP(g, p.r, p.i));
    if (!m || m.closed || m.type !== "prueba") return { ok: true, match: m };
    var lado = m.a === p.t ? "a" : m.b === p.t ? "b" : null;
    if (!lado) throw new Error("Este partido no es vuestro");
    var nos = Math.max(0, parseInt(p.nos, 10) || 0), ellos = Math.max(0, parseInt(p.ellos, 10) || 0);
    m.rep = m.rep || {};
    m.rep[lado] = lado === "a" ? { sa: nos, sb: ellos } : { sa: ellos, sb: nos };
    if (m.rep.a && m.rep.b) {
      if (m.rep.a.sa === m.rep.b.sa && m.rep.a.sb === m.rep.b.sb) {
        m.sa = m.rep.a.sa; m.sb = m.rep.a.sb; m.closed = true; m.conflict = false;
      } else m.conflict = true;
    }
    guardar(claveP(g, p.r, p.i), m);
    return { ok: true, match: m };
  },

  // La profesora pone el resultado de una prueba (o corrige cualquier marcador).
  "score": function (p) {
    var g = liga(p.c); admin(g, p.k);
    var m = leer(claveP(g, p.r, p.i));
    if (!m) throw new Error("Partido no encontrado");
    m.sa = Math.max(0, parseInt(p.sa, 10) || 0);
    m.sb = Math.max(0, parseInt(p.sb, 10) || 0);
    if (p.closed != null) m.closed = String(p.closed) === "1" || p.closed === true;
    if (m.closed) m.conflict = false;
    guardar(claveP(g, p.r, p.i), m);
    if (m.final && m.closed && m.sa !== m.sb) campeon(g, m);
    return { ok: true, match: m };
  },

  // Cierra la jornada: los partidos sin terminar se quedan con el marcador que tengan.
  "close": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (!g.playing) return { ok: true };
    var r = g.round;
    if (g.status === "final") {
      var mf = leer(claveP(g, r, 0));
      if (mf && mf.sa !== mf.sb) { mf.closed = true; guardar(claveP(g, r, 0), mf); campeon(g, mf); return { ok: true }; }
      throw new Error("El desempate sigue empatado, hay que seguir tirando");
    }
    g.rounds[r].forEach(function (par, i) {
      var m = leer(claveP(g, r, i));
      if (m && !m.closed) { m.closed = true; guardar(claveP(g, r, i), m); }
    });
    g.playing = false;
    if (g.round + 1 >= g.rounds.length) g.status = "over";
    guardar("L_" + g.code, g);
    return { ok: true };
  },

  // Desempate a penaltis por el título si hay empate a puntos en cabeza al terminar.
  "final": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "over" || g.champ) throw new Error("La liguilla todavía no ha terminado");
    if (!p.ta || !p.tb || p.ta === p.tb || g.teams.indexOf(p.ta) < 0 || g.teams.indexOf(p.tb) < 0) throw new Error("Equipos no válidos");
    var r = g.rounds.length;
    var m = { r: r, i: 0, a: p.ta, b: p.tb, type: "penaltis", final: true, n: 5, sa: 0, sb: 0, ia: 0, ib: 0, closed: false,
      pen: { k: 0, n: 5, first: Math.random() < 0.5 ? "a" : "b", shots: [], pick: { a: null, b: null } } };
    guardar(claveP(g, r, 0), m);
    g.round = r; g.playing = true; g.status = "final"; g.fin = { a: p.ta, b: p.tb };
    guardar("L_" + g.code, g);
    return { ok: true };
  },

  "end": function (p) {
    var g = liga(p.c); admin(g, p.k);
    g.status = "over"; g.playing = false;
    guardar("L_" + g.code, g);
    return { ok: true };
  }
};

function campeon(g, m) {
  g.champ = m.sa > m.sb ? m.a : m.b;
  g.status = "over"; g.playing = false;
  guardar("L_" + g.code, g);
}
