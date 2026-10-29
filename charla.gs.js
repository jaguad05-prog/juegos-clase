/**
 * EL TITULAR DE LA CHARLA · servidor · v1
 *
 * Cada alumno entra desde su móvil con su nombre y escribe un titular sobre la
 * charla. Los titulares salen en el proyector sin nombre según llegan. Después
 * vota toda la clase (un voto por móvil, nunca el propio) y al cerrar se ve la
 * clasificación con los autores de los tres primeros.
 */

var P = PropertiesService.getScriptProperties();
var MAX_ALUMNOS = 120;

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "charla" });
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
function guardar(k, o) {
  var s = JSON.stringify(o);
  if (s.length > 400000) throw new Error("Demasiado texto para guardar");
  P.setProperty(k, s);
}
function partida(c) {
  var g = leer("G_" + cod(c));
  if (!g) throw new Error("No existe ninguna sesión con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }
function normal(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function mezclar(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function numero(g, dev) { var i = g.order.indexOf(dev); return i < 0 ? 0 : i + 1; }

function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now();
  for (var k in todo) {
    if (k.indexOf("G_") === 0) {
      try {
        var g = JSON.parse(todo[k]);
        if (ahora - g.created > 24 * 3600 * 1000) P.deleteProperty(k);
      } catch (x) {}
    }
  }
}

function contar(g) {
  var n = {};
  for (var d in g.votes) n[g.votes[d]] = (n[g.votes[d]] || 0) + 1;
  return n;
}

function estado(p) {
  var g = partida(p.c);
  var esProfe = String(p.k || "") === g.admin;
  var dev = String(p.dev || "");
  var yo = g.people[dev] || null;

  var r = {
    ok: true, now: Date.now(),
    game: { code: g.code, status: g.status, round: g.round, topic: g.topic },
    people: Object.keys(g.people).length,
    sent: Object.keys(g.heads).length,
    votesCast: Object.keys(g.votes).length
  };

  // Titulares sin nombre: en el proyector salen en cuanto llegan
  var ids = (g.status === "write") ? Object.keys(g.heads).sort(function (a, b) { return g.heads[a].t - g.heads[b].t; }) : g.order;
  if (esProfe || g.status === "vote") {
    r.heads = ids.filter(function (d) { return esProfe || !g.hidden[d]; }).map(function (d) {
      var h = { n: g.status === "write" ? 0 : numero(g, d), id: esProfe ? d : undefined, text: g.heads[d].text };
      if (esProfe) h.hidden = !!g.hidden[d];
      if (d === dev) h.mine = true;
      return h;
    });
  }
  if (esProfe && g.status === "vote") r.votesBy = contar(g);
  if (g.status === "results") r.last = g.last;

  if (yo) {
    r.me = {
      name: yo.name,
      head: g.heads[dev] ? g.heads[dev].text : "",
      hidden: !!g.hidden[dev],
      voted: g.votes[dev] ? numero(g, g.votes[dev]) : 0
    };
  }
  return r;
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      created: Date.now(), status: "write", round: 1,
      topic: String(p.topic || "").trim().slice(0, 140),
      people: {}, heads: {}, hidden: {}, order: [], votes: {}, last: null
    };
    guardar("G_" + code, g);
    return { ok: true, code: code, admin: g.admin };
  },

  "topic": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.topic = String(p.topic || "").trim().slice(0, 140);
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del móvil");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (!nombre) throw new Error("Escribe tu nombre");
    if (!g.people[dev]) {
      if (Object.keys(g.people).length >= MAX_ALUMNOS) throw new Error("La sesión está llena");
      for (var d in g.people) if (normal(g.people[d].name) === normal(nombre)) throw new Error("Ya hay alguien con ese nombre, añade tu apellido");
    }
    g.people[dev] = { name: nombre };
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Enviar o corregir el titular mientras la escritura está abierta
  "send": function (p) {
    var g = partida(p.c), dev = String(p.dev || "");
    if (!g.people[dev]) throw new Error("Vuelve a entrar con tu nombre");
    if (g.status !== "write") throw new Error("El tiempo de escribir ya se ha cerrado");
    var txt = String(p.text || "").trim().replace(/\s+/g, " ").slice(0, 160);
    if (!txt) throw new Error("El titular está vacío");
    var antes = g.heads[dev];
    g.heads[dev] = { text: txt, t: antes ? antes.t : Date.now() };
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Ocultar o recuperar un titular (no sale en pantalla ni se puede votar)
  "hide": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (!g.heads[p.id]) throw new Error("Ese titular no existe");
    if (g.hidden[p.id]) delete g.hidden[p.id]; else g.hidden[p.id] = 1;
    if (g.status === "vote" && g.hidden[p.id]) {
      for (var d in g.votes) if (g.votes[d] === p.id) delete g.votes[d];
    }
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "vote_open": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "write") throw new Error("La votación ya está abierta");
    var ids = Object.keys(g.heads).filter(function (d) { return !g.hidden[d]; });
    if (ids.length < 2) throw new Error("Hacen falta al menos dos titulares para votar");
    g.order = mezclar(Object.keys(g.heads));
    g.status = "vote";
    g.votes = {};
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "vote": function (p) {
    var g = partida(p.c), dev = String(p.dev || "");
    if (!g.people[dev]) throw new Error("Vuelve a entrar con tu nombre");
    if (g.status !== "vote") throw new Error("La votación está cerrada");
    var id = g.order[(parseInt(p.n, 10) || 0) - 1];
    if (!id || g.hidden[id]) throw new Error("Ese titular no existe");
    if (id === dev) throw new Error("No puedes votar tu propio titular");
    g.votes[dev] = id;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "vote") throw new Error("No hay ninguna votación abierta");
    var n = contar(g);
    var res = g.order.filter(function (d) { return !g.hidden[d]; }).map(function (d) {
      return { n: numero(g, d), text: g.heads[d].text, votes: n[d] || 0, name: g.people[d] ? g.people[d].name : "" };
    });
    res.sort(function (a, b) { return b.votes - a.votes || a.n - b.n; });
    g.last = { round: g.round, topic: g.topic, results: res, total: Object.keys(g.votes).length };
    g.status = "results";
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Otra ronda con los mismos alumnos (otro momento de la charla)
  "again": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "vote") throw new Error("Cierra la votación antes de empezar otra ronda");
    g.round++; g.status = "write"; g.heads = {}; g.hidden = {}; g.order = []; g.votes = {}; g.last = null;
    if (p.topic !== undefined) g.topic = String(p.topic || "").trim().slice(0, 140);
    guardar("G_" + g.code, g);
    return { ok: true };
  }
};
