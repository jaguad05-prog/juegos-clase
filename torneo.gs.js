/**
 * LA CLASE CONTRA CHATGPT · servidor · v1
 *
 * Torneo de tres juegos. Cada juego lo gana la clase o ChatGPT y el torneo es
 * para quien gane dos.
 *  1. ¿Humano o máquina? Los equipos escriben tres entradillas, una a una, y
 *     luego votan en cada noticia cuál es la de ChatGPT. La ronda es de la clase
 *     si acierta más de la mitad de los equipos que votan.
 *  2. ChatGPT también juega. Cinco titulares, uno a uno, y luego cinco
 *     votaciones (3, 2 y 1 puntos). Si el de ChatGPT queda entre los cinco
 *     primeros, la noticia es de la máquina.
 *  3. ¿Vale para cualquiera? Los equipos marcan hasta seis expresiones del
 *     texto de ChatGPT que lo delatan y explican por qué. El profesor valida.
 *     Gana la clase si entre todos encuentran las que fije el profesor (6).
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 30;
var COLORES = ["#C8102E","#1565C0","#2E7D32","#8A4FBF","#E07A00","#0E8C8C","#B0306A","#5B6B00","#7A4A1E","#2F2F8F","#D4A017","#00796B","#E5533D","#4A90C2","#6B8E23","#B565A7","#A0522D","#3B3B3B","#F06292","#26A69A"];
var LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var DUR = { w1: 300, w2: 120, w3: 420 };

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "torneo" });
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

// ---------- utilidades ----------
function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(g) {
  var s = JSON.stringify(g);
  if (s.length > 900000) throw new Error("Demasiado texto para guardar");
  P.setProperty("T_" + g.code, s);
}
function partida(c) {
  var g = leer("T_" + cod(c));
  if (!g) throw new Error("No existe ninguna partida con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla del profesor puede hacer esto"); }
function normal(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function mezclar(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function txt(s, n) { return String(s || "").replace(/\r/g, "").trim().slice(0, n); }
function equipoDe(g, dev) { var t = g.devs[String(dev || "")]; return t && g.teams[t] ? t : null; }
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now();
  for (var k in todo) {
    if (k.indexOf("T_") === 0) {
      try { if (ahora - JSON.parse(todo[k]).created > 24 * 3600 * 1000) P.deleteProperty(k); } catch (x) {}
    }
  }
}
function abierto(g) { return g.deadline && Date.now() <= g.deadline + 15000; }

// ---------- texto del juego 3: palabras y expresiones buscadas ----------
function palabras(texto) { return String(texto || "").split(/\s+/).filter(function (w) { return w; }); }
function rangos(texto, objetivos) {
  var w = palabras(texto).map(normal);
  return objetivos.map(function (o) {
    var ow = palabras(o).map(normal).filter(function (x) { return x; });
    for (var i = 0; i + ow.length <= w.length; i++) {
      var ok = true;
      for (var j = 0; j < ow.length; j++) if (w[i + j] !== ow[j]) { ok = false; break; }
      if (ok) return { s: i, e: i + ow.length - 1, text: o };
    }
    return { s: -1, e: -1, text: o };
  });
}
function casar(m, rs) {
  var mejor = -1, max = 0;
  rs.forEach(function (r, i) {
    if (r.s < 0) return;
    var a = Math.max(m.s, r.s), b = Math.min(m.e, r.e), solape = b >= a ? b - a + 1 : 0;
    var largo = r.e - r.s + 1;
    if (solape >= Math.min(2, largo) && (m.e - m.s + 1) <= largo + 15 && solape > max) { max = solape; mejor = i; }
  });
  return mejor;
}

// ---------- puntos ----------
function sumar(g, tid, n) { g.pts[tid] = (g.pts[tid] || 0) + n; }

function resolver1(g, i) {
  var sh = g.g1.sh[i] || [], iaL = "";
  sh.forEach(function (x) { if (x.who === "ia") iaL = x.L; });
  var votos = g.g1.votes[i] || {}, votantes = 0, aciertos = 0, cuenta = {};
  for (var t in votos) {
    votantes++; cuenta[votos[t]] = (cuenta[votos[t]] || 0) + 1;
    if (votos[t] === iaL) { aciertos++; sumar(g, t, 1); }
  }
  g.g1.res[i] = { ia: iaL, votantes: votantes, aciertos: aciertos, cuenta: cuenta, clase: votantes > 0 && aciertos * 2 > votantes };
}
function resolver2(g, i) {
  var sh = g.g2.sh[i] || [], pts = {};
  sh.forEach(function (x) { pts[x.L] = 0; });
  var votos = g.g2.votes[i] || {};
  for (var t in votos) (votos[t] || []).forEach(function (L, k) { if (pts[L] !== undefined) pts[L] += 3 - k; });
  var lista = sh.map(function (x) { return { L: x.L, who: x.who, text: x.text, pts: pts[x.L] }; });
  lista.sort(function (a, b) { return b.pts - a.pts; });
  var iaPts = 0; lista.forEach(function (x) { if (x.who === "ia") iaPts = x.pts; });
  var pos = 1 + lista.filter(function (x) { return x.pts > iaPts; }).length;
  lista.forEach(function (x) { if (x.who !== "ia") sumar(g, x.who, x.pts); });
  g.g2.res[i] = { lista: lista, iaPos: pos, iaPts: iaPts, maquina: pos <= 5, votantes: Object.keys(votos).length };
}
function resolver3(g) {
  var encontrados = {};
  for (var key in g.g3.ok) {
    if (!g.g3.ok[key]) continue;
    var parts = key.split("|"), tid = parts[0], mi = parseInt(parts[1], 10);
    var m = (g.g3.marks[tid] || [])[mi];
    if (!m || m.target < 0) continue;
    encontrados[m.target] = encontrados[m.target] || {};
    encontrados[m.target][tid] = 1;
  }
  var porEquipo = {};
  for (var tg in encontrados) for (var t in encontrados[tg]) porEquipo[t] = (porEquipo[t] || 0) + 1;
  for (var t2 in porEquipo) sumar(g, t2, porEquipo[t2]);
  var n = Object.keys(encontrados).length;
  g.g3.res = { encontrados: Object.keys(encontrados).map(Number), n: n, meta: g.cfg.g3.meta, clase: n >= g.cfg.g3.meta, porEquipo: porEquipo };
}
function cerrarJuego(g, j) {
  var clase = 0, ia = 0;
  if (j === 1) for (var i = 0; i < 3; i++) { if (g.g1.res[i]) { if (g.g1.res[i].clase) clase++; else ia++; } }
  if (j === 2) for (var k = 0; k < 5; k++) { if (g.g2.res[k]) { if (g.g2.res[k].maquina) ia++; else clase++; } }
  if (j === 3) { if (g.g3.res && g.g3.res.clase) clase = 1; else ia = 1; }
  g.games[j] = { clase: clase, ia: ia, gana: clase > ia ? "clase" : "ia" };
}
function barajar(g, juego, i) {
  var textos = g["g" + juego].texts[i] || {}, lista = [];
  for (var t in textos) if (g.teams[t] && textos[t]) lista.push({ who: t, text: textos[t] });
  lista.push({ who: "ia", text: juego === 1 ? g.cfg.g1[i].ia : g.cfg.g2[i].ia });
  mezclar(lista).forEach(function (x, k) { x.L = LETRAS.charAt(k); });
  g["g" + juego].sh[i] = lista;
}

// ---------- estado ----------
function marcador(g) {
  var m = { clase: 0, ia: 0 };
  for (var j in g.games) { if (g.games[j].gana === "clase") m.clase++; else m.ia++; }
  return m;
}
function estado(p) {
  var g = partida(p.c);
  var profe = String(p.k || "") === g.admin;
  var tid = equipoDe(g, p.dev);
  var st = g.stage, i = g.idx;
  var r = {
    ok: true, now: Date.now(), code: g.code, stage: st, idx: i, deadline: g.deadline || 0,
    marcador: marcador(g), games: g.games, meta: g.cfg.g3.meta,
    teams: g.order.map(function (t) {
      var x = { id: t, name: g.teams[t].name, color: g.teams[t].color, pts: g.pts[t] || 0 };
      if (st === "w1") x.sent = !!(g.g1.texts[i] || {})[t];
      if (st === "w2") x.sent = !!(g.g2.texts[i] || {})[t];
      if (st === "v1") x.sent = !!(g.g1.votes[i] || {})[t];
      if (st === "v2") x.sent = !!(g.g2.votes[i] || {})[t];
      if (st === "w3") x.sent = (g.g3.marks[t] || []).length;
      var aw = (g.away || {})[st + "_" + i];
      if (aw && aw[t]) x.away = aw[t];
      return x;
    })
  };
  if (st === "w1") r.datos = g.cfg.g1[i].datos;
  if (st === "w2") r.noticia = g.cfg.g2[i].noticia;
  if (st === "v1" || st === "r1") {
    r.datos = g.cfg.g1[i].datos;
    r.opciones = (g.g1.sh[i] || []).map(function (x) { return { L: x.L, text: x.text, mine: x.who === tid }; });
  }
  if (st === "v2" || st === "r2") {
    r.noticia = g.cfg.g2[i].noticia;
    r.opciones = (g.g2.sh[i] || []).map(function (x) { return { L: x.L, text: x.text, mine: x.who === tid }; });
  }
  if (st === "r1") {
    var a = g.g1.res[i];
    r.res = { ia: a.ia, votantes: a.votantes, aciertos: a.aciertos, cuenta: a.cuenta, clase: a.clase,
      autores: (g.g1.sh[i] || []).map(function (x) { return { L: x.L, who: x.who === "ia" ? "ChatGPT" : (g.teams[x.who] ? g.teams[x.who].name : "") }; }) };
  }
  if (st === "r2") {
    var b = g.g2.res[i];
    r.res = { iaPos: b.iaPos, iaPts: b.iaPts, maquina: b.maquina, votantes: b.votantes,
      lista: b.lista.map(function (x) { return { L: x.L, text: x.text, pts: x.pts, ia: x.who === "ia", who: x.who === "ia" ? "ChatGPT" : (g.teams[x.who] ? g.teams[x.who].name : "") }; }) };
  }
  if (st === "w3" || st === "r3" || st === "final") r.texto3 = g.cfg.g3.texto;
  if (st === "r3" || st === "final") {
    r.objetivos = g.cfg.g3.objetivos;
    r.meta = g.cfg.g3.meta;
    r.res3 = g.g3.res || null;
  }
  if (profe) {
    r.profe = true;
    r.cfgResumen = { g1: g.cfg.g1.length, g2: g.cfg.g2.length };
    if (st === "r3") {
      r.marcas = [];
      g.order.forEach(function (t) {
        (g.g3.marks[t] || []).forEach(function (m, k) {
          r.marcas.push({ tid: t, team: g.teams[t].name, color: g.teams[t].color, mi: k, s: m.s, e: m.e, frag: m.frag, why: m.why, target: m.target,
            ok: g.g3.ok[t + "|" + k] === undefined ? null : g.g3.ok[t + "|" + k] });
        });
      });
    }
  }
  if (tid) {
    var yo = { id: tid, name: g.teams[tid].name, color: g.teams[tid].color, pts: g.pts[tid] || 0 };
    if (st === "w1") yo.texto = (g.g1.texts[i] || {})[tid] || "";
    if (st === "w2") yo.texto = (g.g2.texts[i] || {})[tid] || "";
    if (st === "v1" || st === "r1") yo.voto = (g.g1.votes[i] || {})[tid] || "";
    if (st === "v2" || st === "r2") yo.votos = (g.g2.votes[i] || {})[tid] || [];
    if (st === "w3" || st === "r3" || st === "final") {
      yo.marcas = (g.g3.marks[tid] || []).map(function (m, k) {
        var o = { s: m.s, e: m.e, frag: m.frag, why: m.why };
        if (st !== "w3") o.ok = g.g3.ok[tid + "|" + k];
        return o;
      });
    }
    r.me = yo;
  }
  return r;
}

// ---------- acciones ----------
function limpiarCfg(c) {
  c = c || {};
  var g1 = (c.g1 || []).slice(0, 3).map(function (x) { return { datos: txt(x.datos, 1500), ia: txt(x.ia, 1500) }; });
  var g2 = (c.g2 || []).slice(0, 6).map(function (x) { return { noticia: txt(x.noticia, 2500), ia: txt(x.ia, 300) }; });
  var g3 = c.g3 || {};
  var objetivos = (g3.objetivos || []).map(function (s) { return txt(s, 300); }).filter(function (s) { return s; }).slice(0, 20);
  var cfg = { g1: g1, g2: g2, g3: { texto: txt(g3.texto, 6000), objetivos: objetivos, meta: Math.max(1, Math.min(objetivos.length || 1, parseInt(g3.meta, 10) || 6)) } };
  if (cfg.g1.length !== 3) throw new Error("Faltan noticias del juego 1 (hacen falta 3)");
  if (cfg.g2.length < 5) throw new Error("Faltan noticias del juego 2 (hacen falta 5)");
  cfg.g1.forEach(function (x, k) { if (!x.datos || !x.ia) throw new Error("Juego 1, noticia " + (k + 1) + ": faltan los datos o la entradilla de ChatGPT"); });
  cfg.g2.forEach(function (x, k) { if (!x.noticia || !x.ia) throw new Error("Juego 2, noticia " + (k + 1) + ": falta la noticia o el titular de ChatGPT"); });
  if (!cfg.g3.texto || !objetivos.length) throw new Error("Juego 3: faltan el texto o las expresiones");
  var rs = rangos(cfg.g3.texto, objetivos), fuera = [];
  rs.forEach(function (r, k) { if (r.s < 0) fuera.push(k + 1); });
  if (fuera.length) throw new Error("Juego 3: no encuentro en el texto la expresión " + fuera.join(", ") + ". Cópiala tal cual del texto.");
  cfg.g3.rangos = rs;
  return cfg;
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var cfg = limpiarCfg(p.cfg);
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("T_" + code));
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()), created: Date.now(),
      cfg: cfg, stage: "lobby", idx: 0, deadline: 0,
      teams: {}, order: [], devs: {}, pts: {}, games: {},
      g1: { texts: {}, votes: {}, sh: {}, res: {} },
      g2: { texts: {}, votes: {}, sh: {}, res: {} },
      g3: { marks: {}, ok: {}, res: null }
    };
    guardar(g);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del móvil");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 30);
    if (!nombre) throw new Error("Escribe el nombre de tu equipo");
    var tid = null;
    for (var t in g.teams) if (normal(g.teams[t].name) === normal(nombre)) tid = t;
    if (!tid) {
      if (g.order.length >= MAX_EQUIPOS) throw new Error("Ya hay " + MAX_EQUIPOS + " equipos en la partida");
      tid = "t" + (g.order.length + 1);
      g.teams[tid] = { name: nombre, color: COLORES[g.order.length % COLORES.length] };
      g.order.push(tid);
    }
    g.devs[dev] = tid;
    guardar(g);
    return { ok: true, team: tid };
  },

  "write": function (p) {
    var g = partida(p.c), tid = equipoDe(g, p.dev);
    if (!tid) throw new Error("Vuelve a entrar con el nombre de tu equipo");
    var j = g.stage === "w1" ? 1 : g.stage === "w2" ? 2 : 0;
    if (!j || Number(p.idx) !== g.idx) throw new Error("Ya no se puede escribir en esta noticia");
    if (!abierto(g)) throw new Error("Se acabó el tiempo");
    var t = txt(p.text, j === 1 ? 900 : 200).replace(/\s+/g, " ");
    if (!t) throw new Error("El texto está vacío");
    var bolsa = g["g" + j].texts;
    bolsa[g.idx] = bolsa[g.idx] || {};
    bolsa[g.idx][tid] = t;
    guardar(g);
    return { ok: true };
  },

  // El móvil de un equipo ha cambiado de pantalla mientras escribía
  "away": function (p) {
    var g = partida(p.c), tid = equipoDe(g, p.dev);
    if (!tid) return { ok: true };
    if (["w1", "w2", "w3"].indexOf(g.stage) < 0 || Number(p.idx) !== g.idx || !abierto(g)) return { ok: true };
    g.away = g.away || {};
    var k = g.stage + "_" + g.idx;
    g.away[k] = g.away[k] || {};
    g.away[k][tid] = (g.away[k][tid] || 0) + 1;
    guardar(g);
    return { ok: true };
  },

  "vote1": function (p) {
    var g = partida(p.c), tid = equipoDe(g, p.dev);
    if (!tid) throw new Error("Vuelve a entrar con el nombre de tu equipo");
    if (g.stage !== "v1" || Number(p.idx) !== g.idx) throw new Error("La votación está cerrada");
    var op = (g.g1.sh[g.idx] || []).filter(function (x) { return x.L === p.L; })[0];
    if (!op) throw new Error("Esa opción no existe");
    if (op.who === tid) throw new Error("Esa es vuestra entradilla");
    g.g1.votes[g.idx] = g.g1.votes[g.idx] || {};
    g.g1.votes[g.idx][tid] = op.L;
    guardar(g);
    return { ok: true };
  },

  "vote2": function (p) {
    var g = partida(p.c), tid = equipoDe(g, p.dev);
    if (!tid) throw new Error("Vuelve a entrar con el nombre de tu equipo");
    if (g.stage !== "v2" || Number(p.idx) !== g.idx) throw new Error("La votación está cerrada");
    var sh = g.g2.sh[g.idx] || [], picks = [];
    (p.picks || []).slice(0, 3).forEach(function (L) {
      var op = sh.filter(function (x) { return x.L === L; })[0];
      if (!op) throw new Error("Esa opción no existe");
      if (op.who === tid) throw new Error("No podéis votar vuestro titular");
      if (picks.indexOf(L) < 0) picks.push(L);
    });
    if (!picks.length) throw new Error("Elige al menos un titular");
    g.g2.votes[g.idx] = g.g2.votes[g.idx] || {};
    g.g2.votes[g.idx][tid] = picks;
    guardar(g);
    return { ok: true };
  },

  "marks": function (p) {
    var g = partida(p.c), tid = equipoDe(g, p.dev);
    if (!tid) throw new Error("Vuelve a entrar con el nombre de tu equipo");
    if (g.stage !== "w3") throw new Error("Ya no se puede marcar");
    if (!abierto(g)) throw new Error("Se acabó el tiempo");
    var w = palabras(g.cfg.g3.texto), n = w.length;
    var lista = (p.marks || []).slice(0, 6).map(function (m) {
      var s = Math.max(0, Math.min(n - 1, parseInt(m.s, 10) || 0)), e = Math.max(0, Math.min(n - 1, parseInt(m.e, 10) || 0));
      if (e < s) { var x = s; s = e; e = x; }
      if (e - s > 40) throw new Error("Una de las marcas es demasiado larga");
      return { s: s, e: e, frag: w.slice(s, e + 1).join(" "), why: txt(m.why, 300) };
    });
    g.g3.marks[tid] = lista;
    guardar(g);
    return { ok: true };
  },

  // ----- solo el proyector -----
  "next": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var st = g.stage, i = g.idx, ahora = Date.now();
    if (st === "lobby") {
      if (!g.order.length) throw new Error("Todavía no ha entrado ningún equipo");
      g.stage = "w1"; g.idx = 0; g.deadline = ahora + DUR.w1 * 1000;
    } else if (st === "w1") {
      if (i < 2) { g.idx = i + 1; g.deadline = ahora + DUR.w1 * 1000; }
      else { g.stage = "v1"; g.idx = 0; g.deadline = 0; barajar(g, 1, 0); }
    } else if (st === "v1") {
      resolver1(g, i); g.stage = "r1";
    } else if (st === "r1") {
      if (i < 2) { g.stage = "v1"; g.idx = i + 1; barajar(g, 1, i + 1); }
      else { cerrarJuego(g, 1); g.stage = "end1"; }
    } else if (st === "end1") {
      g.stage = "w2"; g.idx = 0; g.deadline = ahora + DUR.w2 * 1000;
    } else if (st === "w2") {
      if (i < g.cfg.g2.length - 1) { g.idx = i + 1; g.deadline = ahora + DUR.w2 * 1000; }
      else { g.stage = "v2"; g.idx = 0; g.deadline = 0; barajar(g, 2, 0); }
    } else if (st === "v2") {
      resolver2(g, i); g.stage = "r2";
    } else if (st === "r2") {
      if (i < g.cfg.g2.length - 1) { g.stage = "v2"; g.idx = i + 1; barajar(g, 2, i + 1); }
      else { cerrarJuego(g, 2); g.stage = "end2"; }
    } else if (st === "end2") {
      g.stage = "w3"; g.idx = 0; g.deadline = ahora + DUR.w3 * 1000;
    } else if (st === "w3") {
      var rs = g.cfg.g3.rangos;
      for (var t in g.g3.marks) g.g3.marks[t].forEach(function (m) { m.target = casar(m, rs); });
      g.g3.ok = {};
      g.stage = "r3"; g.deadline = 0;
    } else if (st === "r3") {
      resolver3(g); cerrarJuego(g, 3); g.stage = "final";
    } else {
      throw new Error("El torneo ya ha terminado");
    }
    guardar(g);
    return { ok: true };
  },

  // Saltar al principio de un juego (por si se quiere jugar solo uno)
  "go": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var j = parseInt(p.j, 10), ahora = Date.now();
    if (j === 1) { g.stage = "w1"; g.idx = 0; g.deadline = ahora + DUR.w1 * 1000; g.g1 = { texts: {}, votes: {}, sh: {}, res: {} }; delete g.games[1]; }
    else if (j === 2) { g.stage = "w2"; g.idx = 0; g.deadline = ahora + DUR.w2 * 1000; g.g2 = { texts: {}, votes: {}, sh: {}, res: {} }; delete g.games[2]; }
    else if (j === 3) { g.stage = "w3"; g.idx = 0; g.deadline = ahora + DUR.w3 * 1000; g.g3 = { marks: {}, ok: {}, res: null }; delete g.games[3]; }
    else throw new Error("Juego desconocido");
    guardar(g);
    return { ok: true };
  },

  "more": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (!g.deadline) throw new Error("Ahora no corre el tiempo");
    g.deadline = Math.max(g.deadline, Date.now()) + (parseInt(p.s, 10) || 60) * 1000;
    guardar(g);
    return { ok: true };
  },

  "stop": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.deadline) g.deadline = Date.now() - 16000;
    guardar(g);
    return { ok: true };
  },

  // Validar una marca del juego 3: ok = true, false o null (sin decidir)
  "check": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.stage !== "r3") throw new Error("Ahora no se valida");
    var m = (g.g3.marks[p.t] || [])[parseInt(p.mi, 10)];
    if (!m) throw new Error("Esa marca no existe");
    if (p.target !== undefined && p.target !== null && p.target !== "") {
      var tg = parseInt(p.target, 10);
      if (tg >= -1 && tg < g.cfg.g3.objetivos.length) m.target = tg;
    }
    var key = p.t + "|" + parseInt(p.mi, 10);
    if (p.ok === null || p.ok === undefined) delete g.g3.ok[key]; else g.g3.ok[key] = !!p.ok;
    guardar(g);
    return { ok: true };
  },

  "adjust": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (!g.teams[p.t]) throw new Error("Ese equipo no existe");
    sumar(g, p.t, parseInt(p.d, 10) || 0);
    guardar(g);
    return { ok: true };
  },

  "kick": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (!g.teams[p.t]) throw new Error("Ese equipo no existe");
    delete g.teams[p.t];
    g.order = g.order.filter(function (t) { return t !== p.t; });
    for (var d in g.devs) if (g.devs[d] === p.t) delete g.devs[d];
    guardar(g);
    return { ok: true };
  }
};
