/**
 * LA GUERRA DE PORTADAS · servidor (Google Apps Script) · v1
 *
 * Cada equipo entra desde sus móviles con el nombre del equipo. En cada ronda
 * escribe el titular un solo miembro del equipo (rota), y después vota toda la
 * clase desde su móvil sin saber de quién es cada titular. Nadie puede votar
 * el titular de su propio equipo. Cada voto es un punto para el equipo.
 */

var P = PropertiesService.getScriptProperties();
var COLORES = ["#C8102E", "#1565C0", "#2E7D32", "#B7791F", "#6A1B9A", "#EF6C00", "#00838F", "#AD1457", "#4E342E", "#37474F"];
var MAX_EQUIPOS = 10;

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "guerra" });
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

// ── almacenamiento ──
function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(k, o) {
  var s = JSON.stringify(o);
  if (s.length > 400000) throw new Error("Demasiado texto para guardar");
  P.setProperty(k, s);
}
function partida(c) {
  var g = leer("G_" + cod(c));
  if (!g) throw new Error("No existe ninguna partida con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }
function dispositivos(g) { return leer("D_" + g.code) || {}; }
function votos(g) { return leer("V_" + g.code) || {}; }
function normal(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function mezclar(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function letra(i) { return "ABCDEFGHIJKL".charAt(i); }

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

// Todo lo que ve una pantalla o un móvil, leído de una sola vez.
function estado(p) {
  var todo = P.getProperties(), c = cod(p.c);
  if (!todo["G_" + c]) throw new Error("No existe ninguna partida con el código " + c);
  var g = JSON.parse(todo["G_" + c]);
  var D = todo["D_" + c] ? JSON.parse(todo["D_" + c]) : {};
  var V = todo["V_" + c] ? JSON.parse(todo["V_" + c]) : {};
  var esProfe = String(p.k || "") === g.admin;
  var dev = String(p.dev || "");
  var yo = D[dev] || null;

  var miembros = {};
  for (var d in D) miembros[D[d].t] = (miembros[D[d].t] || 0) + 1;
  var equipos = g.teams.map(function (t) {
    return { id: t.id, name: t.name, color: t.color, pts: t.pts, devs: miembros[t.id] || 0, sent: !!g.heads[t.id], writing: !!g.writer[t.id] };
  });

  var r = {
    ok: true, now: Date.now(),
    game: { code: g.code, status: g.status, round: g.round, maxRounds: g.maxRounds, story: g.story, storyIdx: g.storyIdx, used: g.used },
    teams: equipos,
    totalDevs: Object.keys(D).length,
    votesCast: Object.keys(V).length
  };

  // Titulares anónimos durante la votación: solo letra y texto
  if (g.status === "vote" || g.status === "results") {
    r.ballot = g.order.map(function (tid, i) {
      var b = { L: letra(i), text: g.heads[tid].text };
      if (esProfe) { b.team = tid; b.disq = !!g.disq[tid]; }
      if (yo && yo.t === tid) b.mine = true;
      return b;
    });
  }
  if (g.status === "results" || g.status === "over") r.last = g.last || null;

  if (yo) {
    var mio = null;
    for (var i = 0; i < g.teams.length; i++) if (g.teams[i].id === yo.t) mio = g.teams[i];
    r.me = {
      team: yo.t, teamName: mio ? mio.name : "", color: mio ? mio.color : "#333",
      writer: g.writer[yo.t] === dev, someoneWriting: !!g.writer[yo.t],
      head: g.heads[yo.t] ? g.heads[yo.t].text : "",
      voted: V[dev] ? letraDe(g, V[dev]) : ""
    };
  }
  if (esProfe) r.votesByTeam = contar(V);
  return r;
}
function letraDe(g, tid) { var i = g.order.indexOf(tid); return i < 0 ? "" : letra(i); }
function contar(V) { var n = {}; for (var d in V) n[V[d]] = (n[V[d]] || 0) + 1; return n; }

// ── acciones ──
var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      created: Date.now(), status: "lobby", round: 0, maxRounds: Math.max(1, Math.min(20, parseInt(p.rounds, 10) || 10)),
      story: null, storyIdx: -1, used: [], teams: [], heads: {}, writer: {}, order: [], disq: {}, last: null
    };
    guardar("G_" + code, g);
    guardar("D_" + code, {});
    guardar("V_" + code, {});
    guardar("W_" + code, {});
    return { ok: true, code: code, admin: g.admin };
  },

  // Un móvil entra con el nombre de su equipo. Si el equipo no existe, se crea.
  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del móvil");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 30);
    if (!nombre) throw new Error("Escribe el nombre de vuestro equipo");
    if (g.status === "over") throw new Error("Esta partida ya ha terminado");
    var D = dispositivos(g), t = null;
    for (var i = 0; i < g.teams.length; i++) if (normal(g.teams[i].name) === normal(nombre)) t = g.teams[i];
    if (!t) {
      if (g.teams.length >= MAX_EQUIPOS) throw new Error("Ya hay " + MAX_EQUIPOS + " equipos. Revisad que el nombre esté bien escrito.");
      t = { id: "e" + (g.teams.length + 1), name: nombre, color: COLORES[g.teams.length % COLORES.length], pts: 0 };
      g.teams.push(t);
      guardar("G_" + g.code, g);
    }
    D[dev] = { t: t.id };
    guardar("D_" + g.code, D);
    return { ok: true, team: t };
  },

  // La profesora empieza una ronda con una noticia
  "round": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "write" || g.status === "vote") throw new Error("Termina la ronda en curso antes de empezar otra");
    if (!g.teams.length) throw new Error("Todavía no ha entrado ningún equipo");
    var s = p.story || {};
    g.story = {
      tag: String(s.tag || "").slice(0, 30), title: String(s.title || "").slice(0, 120), text: String(s.text || "").slice(0, 900)
    };
    if (!g.story.text) throw new Error("Falta el texto de la noticia");
    g.storyIdx = parseInt(p.idx, 10); if (isNaN(g.storyIdx)) g.storyIdx = -1;
    if (g.storyIdx >= 0 && g.used.indexOf(g.storyIdx) < 0) g.used.push(g.storyIdx);
    g.round++; g.status = "write"; g.heads = {}; g.writer = {}; g.order = []; g.disq = {};
    guardar("G_" + g.code, g);
    guardar("V_" + g.code, {});
    return { ok: true };
  },

  // Un móvil se ofrece para escribir el titular de su equipo en esta ronda
  "claim": function (p) {
    var g = partida(p.c), dev = String(p.dev || "");
    var D = dispositivos(g), yo = D[dev];
    if (!yo) throw new Error("Este móvil no está en ningún equipo");
    if (g.status !== "write") throw new Error("Ahora no se está escribiendo");
    var t = yo.t;
    if (g.writer[t] && g.writer[t] !== dev) throw new Error("Ya está escribiendo otro compañero de vuestro equipo");
    if (g.writer[t] === dev) return { ok: true };
    // Rota: quien ya escribió espera a que escriban los demás del equipo
    var W = leer("W_" + g.code) || {};
    var hechos = W[t] || [];
    var companeros = Object.keys(D).filter(function (d) { return D[d].t === t; });
    var pendientes = companeros.filter(function (d) { return hechos.indexOf(d) < 0; });
    if (hechos.indexOf(dev) >= 0 && pendientes.length) throw new Error("Tú ya escribiste en otra ronda, esta vez le toca a otro compañero");
    if (!pendientes.length) hechos = [];
    hechos.push(dev); W[t] = hechos;
    guardar("W_" + g.code, W);
    g.writer[t] = dev;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // El que escribe suelta el turno sin enviar
  "release": function (p) {
    var g = partida(p.c), dev = String(p.dev || ""), D = dispositivos(g), yo = D[dev];
    if (!yo || g.status !== "write" || g.writer[yo.t] !== dev || g.heads[yo.t]) return { ok: true };
    delete g.writer[yo.t];
    var W = leer("W_" + g.code) || {};
    W[yo.t] = (W[yo.t] || []).filter(function (d) { return d !== dev; });
    guardar("W_" + g.code, W);
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "send": function (p) {
    var g = partida(p.c), dev = String(p.dev || ""), D = dispositivos(g), yo = D[dev];
    if (!yo) throw new Error("Este móvil no está en ningún equipo");
    if (g.status !== "write") throw new Error("El tiempo de escribir ya se ha cerrado");
    if (g.writer[yo.t] !== dev) throw new Error("El titular lo escribe otro compañero");
    var txt = String(p.text || "").trim().replace(/\s+/g, " ").slice(0, 160);
    if (!txt) throw new Error("El titular está vacío");
    g.heads[yo.t] = { text: txt };
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // La profesora cierra la escritura y abre la votación
  "vote_open": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "write") throw new Error("No hay ninguna ronda escribiéndose");
    var ids = Object.keys(g.heads);
    if (ids.length < 2) throw new Error("Hacen falta al menos dos titulares para votar");
    g.order = mezclar(ids);
    g.status = "vote";
    guardar("G_" + g.code, g);
    guardar("V_" + g.code, {});
    return { ok: true };
  },

  "vote": function (p) {
    var g = partida(p.c), dev = String(p.dev || ""), D = dispositivos(g), yo = D[dev];
    if (!yo) throw new Error("Este móvil no está en ningún equipo");
    if (g.status !== "vote") throw new Error("La votación está cerrada");
    var i = "ABCDEFGHIJKL".indexOf(String(p.L || "").toUpperCase());
    var tid = g.order[i];
    if (!tid) throw new Error("Ese titular no existe");
    if (tid === yo.t) throw new Error("No podéis votar el titular de vuestro equipo");
    var V = votos(g);
    V[dev] = tid;
    guardar("V_" + g.code, V);
    return { ok: true, L: letra(i) };
  },

  // Descalificar o rehabilitar un titular (vale 0 puntos)
  "disq": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "vote" && g.status !== "write") throw new Error("Solo se descalifica antes de cerrar la ronda");
    var i = "ABCDEFGHIJKL".indexOf(String(p.L || "").toUpperCase());
    var tid = g.order[i] || p.t;
    if (!tid) throw new Error("Ese titular no existe");
    if (g.disq[tid]) delete g.disq[tid]; else g.disq[tid] = 1;
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Cierra la votación, reparte los puntos y desvela de quién era cada titular
  "close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "vote") throw new Error("No hay ninguna votación abierta");
    var n = contar(votos(g));
    var res = g.order.map(function (tid, i) {
      var v = n[tid] || 0, pts = g.disq[tid] ? 0 : v;
      for (var j = 0; j < g.teams.length; j++) if (g.teams[j].id === tid) g.teams[j].pts += pts;
      return { L: letra(i), team: tid, text: g.heads[tid].text, votes: v, pts: pts, disq: !!g.disq[tid] };
    });
    res.sort(function (a, b) { return b.pts - a.pts || b.votes - a.votes; });
    g.last = { round: g.round, results: res };
    g.status = (g.round >= g.maxRounds) ? "over" : "results";
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "vote") throw new Error("Cierra la votación antes de terminar");
    g.status = "over";
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Sumar o quitar un punto a mano (por si hay que corregir algo)
  "adjust": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var d = parseInt(p.d, 10) || 0;
    for (var j = 0; j < g.teams.length; j++) if (g.teams[j].id === p.t) g.teams[j].pts = Math.max(0, g.teams[j].pts + d);
    guardar("G_" + g.code, g);
    return { ok: true };
  }
};
