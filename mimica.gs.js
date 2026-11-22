/**
 * MÍMICA DE LIBROS · servidor · v1
 *
 * Juego por equipos de libros de periodismo narrativo. En cada turno un equipo
 * representa un libro elegido al azar. El mimo lo ve en su móvil (solo el
 * primer móvil que lo pide en ese turno). En el proyector sale una línea por
 * palabra del título y la profesora va destapando las palabras que aciertan.
 * Puntos: si acierta otro equipo, 1 para el que representa y 1 para el que
 * acierta; si acierta el propio equipo del mimo, 2 para ese equipo.
 */

var P = PropertiesService.getScriptProperties();

var LIBROS = [
  ["A sangre fría", "Truman Capote"],
  ["Relato de un náufrago", "Gabriel García Márquez"],
  ["Todos los hombres del presidente", "Bob Woodward y Carl Bernstein"],
  ["Hacia rutas salvajes", "Jon Krakauer"],
  ["Mal de altura", "Jon Krakauer"],
  ["Miedo y asco en Las Vegas", "Hunter S. Thompson"],
  ["La guerra del fútbol", "Ryszard Kapuściński"],
  ["Los hombres que miraban fijamente a las cabras", "Jon Ronson"],
  ["Lo que hay que tener", "Tom Wolfe"],
  ["La canción del verdugo", "Norman Mailer"],
  ["Diez días que estremecieron el mundo", "John Reed"],
  ["Homenaje a Cataluña", "George Orwell"],
  ["Sin blanca en París y Londres", "George Orwell"],
  ["La guerra no tiene rostro de mujer", "Svetlana Alexiévich"],
  ["Los muchachos de zinc", "Svetlana Alexiévich"],
  ["Los suicidas del fin del mundo", "Leila Guerriero"],
  ["La llamada", "Leila Guerriero"],
  ["Dios es redondo", "Juan Villoro"],
  ["A sangre y fuego", "Manuel Chaves Nogales"],
  ["Anatomía de un instante", "Javier Cercas"],
  ["La España vacía", "Sergio del Molino"]
];

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "mimica" });
    if (p.a === "state") return salida(estado(p));
    if (!ACCIONES[p.a]) return salida({ error: "Acción desconocida" });
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try { return salida(ACCIONES[p.a](p)); }
    finally { lock.releaseLock(); }
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(k, o) { P.setProperty(k, JSON.stringify(o)); }
function partida(c) {
  var g = leer("G_" + cod(c));
  if (!g) throw new Error("No existe ninguna partida con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla del profesor puede hacer esto"); }
function mezclar(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now();
  for (var k in todo) {
    if (k.indexOf("G_") === 0) {
      try { if (ahora - JSON.parse(todo[k]).created > 24 * 3600 * 1000) P.deleteProperty(k); } catch (x) {}
    }
  }
}
function libro(g) { return LIBROS[g.order[g.idx]]; }
function palabras(t) { return t.split(/\s+/).filter(Boolean); }

function estado(p) {
  var g = partida(p.c);
  var esProfe = String(p.k || "") === g.admin;
  var dev = String(p.dev || "");
  var r = {
    ok: true, code: g.code, status: g.status,
    teams: g.teams, turn: g.turn,
    n: g.idx + 1, total: g.order.length,
    hasMimo: !!g.mimoDev, last: g.last
  };
  if (g.status === "play" || g.status === "solved") {
    var b = libro(g), w = palabras(b[0]);
    r.words = w.map(function (x, i) { return (g.status === "solved" || g.rev[i]) ? { t: x } : { len: x.length }; });
    r.authorShown = g.status === "solved" || g.hint;
    if (r.authorShown) r.author = b[1];
    if (esProfe || (dev && dev === g.mimoDev)) { r.title = b[0]; r.author = b[1]; r.isMimo = dev === g.mimoDev; }
  }
  return r;
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var nombres = (p.teams || []).map(function (s) { return String(s || "").trim().slice(0, 30); }).filter(Boolean);
    if (nombres.length < 2) throw new Error("Hacen falta al menos dos equipos");
    if (nombres.length > 10) throw new Error("Como mucho diez equipos");
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var orden = []; for (var j = 0; j < LIBROS.length; j++) orden.push(j);
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()), created: Date.now(),
      teams: nombres.map(function (n) { return { name: n, pts: 0 }; }),
      order: mezclar(orden), idx: 0, turn: 0, status: "play", rev: {}, hint: false, mimoDev: null, last: null
    };
    guardar("G_" + code, g);
    return { ok: true, code: code, admin: g.admin };
  },

  // El primer móvil que lo pide en este turno se queda con el libro
  "claim": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del móvil");
    if (g.status !== "play") throw new Error("Espera a que empiece el siguiente turno");
    if (g.mimoDev && g.mimoDev !== dev) throw new Error("Este turno ya tiene mimo");
    g.mimoDev = dev;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "reveal": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "play") return { ok: true };
    var i = parseInt(p.i, 10), n = palabras(libro(g)[0]).length;
    if (!(i >= 0 && i < n)) throw new Error("Esa palabra no existe");
    if (g.rev[i]) delete g.rev[i]; else g.rev[i] = 1;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "hint": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.hint = !g.hint;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Acierto: who = índice del equipo que acierta
  "point": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "play") throw new Error("Este libro ya está resuelto");
    var w = parseInt(p.who, 10);
    if (!(w >= 0 && w < g.teams.length)) throw new Error("Ese equipo no existe");
    var b = libro(g), r = { title: b[0], author: b[1], mimo: g.turn, who: w };
    if (w === g.turn) { g.teams[w].pts += 2; r.pts = [[w, 2]]; }
    else { g.teams[g.turn].pts += 1; g.teams[w].pts += 1; r.pts = [[g.turn, 1], [w, 1]]; }
    g.last = r; g.status = "solved";
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "pass": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "play") throw new Error("Este libro ya está resuelto");
    var b = libro(g);
    g.last = { title: b[0], author: b[1], mimo: g.turn, who: -1, pts: [] };
    g.status = "solved";
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "next": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "play") throw new Error("Primero di quién ha acertado o pasa el libro");
    if (g.idx + 1 >= g.order.length) { g.status = "done"; }
    else { g.idx++; g.turn = (g.turn + 1) % g.teams.length; g.status = "play"; }
    g.rev = {}; g.hint = false; g.mimoDev = null; g.last = null;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Corregir a mano la puntuación de un equipo
  "adj": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var t = parseInt(p.t, 10), d = parseInt(p.d, 10);
    if (!(t >= 0 && t < g.teams.length) || !(d === 1 || d === -1)) throw new Error("Corrección no válida");
    g.teams[t].pts = Math.max(0, g.teams[t].pts + d);
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Liberar el libro si el mimo se ha equivocado de móvil
  "freemimo": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.mimoDev = null;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "done";
    guardar("G_" + g.code, g);
    return { ok: true };
  }
};
