/**
 * SEO Y DISCOVER · servidor (Google Apps Script) · v1
 * Clase 9 · Parte 1 «Une el patrón», Parte 2 «Piensa como Google» y Parte 3 «Titula para SEO o Discover».
 * Los equipos juegan desde el móvil con el nombre de su equipo; la pantalla de la profesora dirige.
 */

var P = PropertiesService.getScriptProperties();
var COLORES = ["#C8102E", "#1565C0", "#2E7D32", "#B7791F", "#6A1B9A", "#EF6C00", "#00838F", "#AD1457", "#4E342E", "#37474F"];
var MAX_EQUIPOS = 10, MAX_BUSQUEDAS = 6, PUNTOS_PATRON = 10;

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "seo-discover" });
    if (p.a === "state") return salida(estado(p));
    if (!ACCIONES[p.a]) return salida({ error: "Acción desconocida" });
    var lock = LockService.getScriptLock();
     lock.waitLock(25000);
    var res;
    try { res = ACCIONES[p.a](p); }
    finally { lock.releaseLock(); }
    // v2: devuelve también la partida actualizada
    if (res && res.ok && p.c) { try { res.state = estado(p); } catch (x) {} }
    return salida(res);
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
function normal(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, " ").trim(); }
function equipoDe(g, dev) { var D = leer("D_" + g.code) || {}; return D[dev] ? D[dev].t : null; }
function sumar(g, tid, pts) { for (var i = 0; i < g.teams.length; i++) if (g.teams[i].id === tid) g.teams[i].pts = Math.max(0, g.teams[i].pts + pts); }

function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), borrar = {};
  for (var k in todo) if (k.indexOf("G_") === 0) {
    try { var g = JSON.parse(todo[k]); if (ahora - g.created > 24 * 3600 * 1000) borrar[g.code] = 1; } catch (x) {}
  }
  for (var k2 in todo) { var pt = k2.split("_"); if (pt.length >= 2 && borrar[pt[1]]) P.deleteProperty(k2); }
}

function estado(p) {
  var todo = P.getProperties(), c = cod(p.c);
  if (!todo["G_" + c]) throw new Error("No existe ninguna partida con el código " + c);
  var g = JSON.parse(todo["G_" + c]);
  var D = todo["D_" + c] ? JSON.parse(todo["D_" + c]) : {};
  var M = todo["M_" + c] ? JSON.parse(todo["M_" + c]) : {};   // respuestas de la parte 1
  var B = todo["B_" + c] ? JSON.parse(todo["B_" + c]) : {};   // búsquedas de la ronda
  var T = todo["T_" + c] ? JSON.parse(todo["T_" + c]) : {};   // titulares de la parte 3
  var esProfe = String(p.k || "") === g.admin, dev = String(p.dev || ""), yo = D[dev] || null;
  var miembros = {};
  for (var d in D) miembros[D[d].t] = (miembros[D[d].t] || 0) + 1;
  var copia = JSON.parse(JSON.stringify(g)); delete copia.admin;
  if (!esProfe && g.status === "match") delete copia.key;
  var r = {
    ok: true, now: Date.now(), game: copia,
    teams: g.teams.map(function (t) {
      return { id: t.id, name: t.name, color: t.color, pts: t.pts, devs: miembros[t.id] || 0,
        answered: M[t.id] ? Object.keys(M[t.id]).length : 0, searches: (B[t.id] || []).length, titled: !!T[t.id] };
    }),
    totalDevs: Object.keys(D).length
  };
  if (esProfe || g.status === "t_review") r.titles = T;
  if (esProfe) { r.answers = M; r.searches = B; }
  if (yo) {
    var mio = null;
    for (var i = 0; i < g.teams.length; i++) if (g.teams[i].id === yo.t) mio = g.teams[i];
    r.me = { team: yo.t, teamName: mio ? mio.name : "", color: mio ? mio.color : "#333", answers: M[yo.t] || {}, searches: B[yo.t] || [], title: T[yo.t] || "" };
  }
  return r;
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var g = { code: code, admin: String(Math.random()).slice(2) + String(Date.now()), created: Date.now(),
      status: "lobby", teams: [], p1: null, key: null, revealed: 0, round: -1, sit: null, slots: 0, open: 0, awards: {} };
    guardar("G_" + code, g); guardar("D_" + code, {}); guardar("M_" + code, {}); guardar("B_" + code, {}); guardar("T_" + code, {});
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del móvil");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 30);
    if (!nombre) throw new Error("Escribe el nombre de vuestro equipo");
    if (g.status === "over") throw new Error("Esta partida ya ha terminado");
    var D = leer("D_" + g.code) || {}, t = null;
    for (var i = 0; i < g.teams.length; i++) if (normal(g.teams[i].name) === normal(nombre)) t = g.teams[i];
    if (!t) {
      if (g.teams.length >= MAX_EQUIPOS) throw new Error("Ya hay " + MAX_EQUIPOS + " equipos. Revisad que el nombre esté bien escrito.");
      t = { id: "e" + (g.teams.length + 1), name: nombre, color: COLORES[g.teams.length % COLORES.length], pts: 0 };
      g.teams.push(t); guardar("G_" + g.code, g);
    }
    D[dev] = { t: t.id }; guardar("D_" + g.code, D);
    return { ok: true, team: t };
  },

  // PARTE 1 · Une el patrón: la pantalla envía titulares y patrones (sin la solución)
  "match_start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var c = p.content || {};
    g.p1 = { heads: (c.heads || []).slice(0, 12).map(function (h) { return String(h).slice(0, 220); }),
             pats: (c.pats || []).slice(0, 8).map(function (x) { return { L: String(x.L).slice(0, 1), name: String(x.name).slice(0, 60), desc: String(x.desc).slice(0, 140) }; }) };
    g.status = "match"; g.key = null; g.revealed = 0;
    guardar("G_" + g.code, g); guardar("M_" + g.code, {});
    return { ok: true };
  },
  "match": function (p) {
    var g = partida(p.c), t = equipoDe(g, String(p.dev || ""));
    if (!t) throw new Error("Este móvil no está en ningún equipo");
    if (g.status !== "match") throw new Error("Ya no se pueden cambiar las respuestas");
    var i = parseInt(p.i, 10), L = String(p.L || "").toUpperCase().slice(0, 1);
    if (!(i >= 1 && i <= g.p1.heads.length)) throw new Error("Ese titular no existe");
    var M = leer("M_" + g.code) || {};
    M[t] = M[t] || {};
    if (L) M[t][i] = L; else delete M[t][i];
    guardar("M_" + g.code, M);
    return { ok: true };
  },
  // Cierra la parte 1 con la solución y reparte los puntos
  "match_close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "match") throw new Error("La parte 1 no está abierta");
    g.key = p.key || {};
    var M = leer("M_" + g.code) || {};
    g.p1score = {};
    g.teams.forEach(function (t) {
      var a = M[t.id] || {}, n = 0;
      for (var i in g.key) if (a[i] && a[i] === g.key[i]) n++;
      g.p1score[t.id] = n; t.pts += n * PUNTOS_PATRON;
    });
    g.status = "match_reveal"; g.revealed = 0;
    guardar("G_" + g.code, g);
    return { ok: true };
  },
  "match_reveal": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.revealed = Math.max(0, Math.min(g.p1.heads.length, parseInt(p.n, 10) || 0));
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // PARTE 2 · Piensa como Google
  "search_start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "match") throw new Error("Cierra antes la parte 1");
    g.round = parseInt(p.round, 10) || 0;
    g.sit = { tag: String(p.tag || "").slice(0, 30), text: String(p.text || "").slice(0, 300), trap: !!p.trap };
    g.slots = Math.max(1, Math.min(8, parseInt(p.slots, 10) || 1));
    g.status = "search"; g.open = 0; g.awards = {}; g.panel = [];
    guardar("G_" + g.code, g); guardar("B_" + g.code, {});
    return { ok: true };
  },
  "add": function (p) {
    var g = partida(p.c), t = equipoDe(g, String(p.dev || ""));
    if (!t) throw new Error("Este móvil no está en ningún equipo");
    if (g.status !== "search") throw new Error("Ya no se pueden añadir búsquedas");
    var txt = String(p.text || "").trim().replace(/\s+/g, " ").slice(0, 90);
    if (!txt) throw new Error("Escribe la búsqueda");
    var B = leer("B_" + g.code) || {};
    B[t] = B[t] || [];
    if (B[t].some(function (x) { return normal(x) === normal(txt); })) throw new Error("Esa búsqueda ya la tenéis");
    if (B[t].length >= MAX_BUSQUEDAS) throw new Error("Máximo " + MAX_BUSQUEDAS + " búsquedas por equipo");
    B[t].push(txt); guardar("B_" + g.code, B);
    return { ok: true };
  },
  "remove": function (p) {
    var g = partida(p.c), t = equipoDe(g, String(p.dev || ""));
    if (!t || g.status !== "search") return { ok: true };
    var B = leer("B_" + g.code) || {}, i = parseInt(p.i, 10);
    if (B[t] && B[t][i] !== undefined) { B[t].splice(i, 1); guardar("B_" + g.code, B); }
    return { ok: true };
  },
  // La profesora cierra las búsquedas y empieza a destapar el panel
  "search_close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "search") throw new Error("No hay ninguna ronda abierta");
    g.status = "reveal"; g.open = 0;
    guardar("G_" + g.code, g);
    return { ok: true };
  },
  // Destapa casillas: la pantalla manda el texto y los puntos de lo que se ve
  "open": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "reveal") throw new Error("Primero cierra las búsquedas");
    var antes = g.open || 0;
    g.panel = (p.panel || []).slice(0, 8).map(function (x) { return { text: String(x.text).slice(0, 120), pts: parseInt(x.pts, 10) || 0 }; });
    g.open = g.panel.length;
    // Puntos automáticos para los equipos con una búsqueda parecida (la profesora puede corregirlos)
    var auto = p.auto || {};
    for (var s = antes; s < g.open; s++) {
      (auto[s] || []).forEach(function (t) {
        g.awards[s] = g.awards[s] || [];
        if (g.awards[s].indexOf(t) < 0 && g.teams.some(function (x) { return x.id === t; })) { g.awards[s].push(t); sumar(g, t, g.panel[s].pts); }
      });
    } if (p.note) g.note = String(p.note).slice(0, 500); else delete g.note;
    guardar("G_" + g.code, g);
    return { ok: true };
  },
  // Da (o quita) los puntos de una casilla a un equipo
  "award": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "reveal") throw new Error("Ahora no se puede puntuar");
    var s = parseInt(p.s, 10), slot = g.panel[s];
    if (!slot) throw new Error("Esa casilla aún no está destapada");
    var t = String(p.t || "");
    g.awards[s] = g.awards[s] || [];
    var i = g.awards[s].indexOf(t);
    if (i >= 0) { g.awards[s].splice(i, 1); sumar(g, t, -slot.pts); }
    else { g.awards[s].push(t); sumar(g, t, slot.pts); }
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  // PARTE 3 · Titula para SEO o Discover: un material por ronda, un titular por equipo
  "t_start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var m = p.mat || {};
    g.mat = { n: parseInt(p.n, 10) || 0, kind: String(m.kind || "").slice(0, 10), label: String(m.label || "").slice(0, 60),
      title: String(m.title || "").slice(0, 160), lead: String(m.lead || "").slice(0, 300), body: (m.body || []).slice(0, 14).map(function (x) { return String(x).slice(0, 700); }),
      handle: String(m.handle || "").slice(0, 40), meta: String(m.meta || "").slice(0, 120), caption: String(m.caption || "").slice(0, 160),
      task: String(m.task || "").slice(0, 200) };
    g.suceso = String(p.suceso || "").slice(0, 300);
    g.status = "t_write"; g.tscore = null; g.tref = "";
    guardar("G_" + g.code, g); guardar("T_" + g.code, {});
    return { ok: true };
  },
  "t_send": function (p) {
    var g = partida(p.c), t = equipoDe(g, String(p.dev || ""));
    if (!t) throw new Error("Este móvil no está en ningún equipo");
    if (g.status !== "t_write") throw new Error("Ya no se puede enviar el titular");
    var txt = String(p.text || "").trim().replace(/\s+/g, " ").slice(0, 200);
    if (!txt) throw new Error("Escribe el titular");
    var T = leer("T_" + g.code) || {}; T[t] = txt; guardar("T_" + g.code, T);
    return { ok: true };
  },
  // La pantalla corrige sola y manda las notas; luego la profesora puede cambiarlas
  "t_close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "t_write") throw new Error("No hay ningún titular abierto");
    g.tscore = {};
    var sc = p.scores || {};
    g.teams.forEach(function (t) { var n = Math.max(0, parseInt(sc[t.id], 10) || 0); g.tscore[t.id] = n; t.pts += n; });
    g.tref = String(p.ref || "").slice(0, 200);
    g.status = "t_review";
    guardar("G_" + g.code, g);
    return { ok: true };
  },
  "t_adjust": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "t_review") throw new Error("Ahora no se puede corregir");
    var t = String(p.t || ""), d = parseInt(p.d, 10) || 0, antes = g.tscore[t] || 0, nuevo = Math.max(0, antes + d);
    g.tscore[t] = nuevo; sumar(g, t, nuevo - antes);
    guardar("G_" + g.code, g);
    return { ok: true };
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "over"; guardar("G_" + g.code, g);
    return { ok: true };
  },
  "adjust": function (p) {
    var g = partida(p.c); admin(g, p.k);
    sumar(g, String(p.t || ""), parseInt(p.d, 10) || 0);
    guardar("G_" + g.code, g);
    return { ok: true };
  }
};
