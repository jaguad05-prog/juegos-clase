/**
 * EL AHORCADO DE LOS MEDIOS · servidor · v1
 * Van saliendo los nombres de quien manda en cada grupo de comunicación y cada alumno,
 * desde su ordenador, adivina el apellido letra a letra. El primero que lo resuelve se lleva 10 puntos,
 * el segundo 5 y el tercero 3. Con tres aciertos la ronda se para y el proyector revela la empresa.
 * Los apellidos no salen nunca del servidor hasta que se revelan.
 */

var P = PropertiesService.getScriptProperties();
var PUNTOS = [10, 5, 3], MAX_FALLOS = 6, MAX_JUGADORES = 80;
var PARTICULAS = { "de": 1, "del": 1, "la": 1, "las": 1, "los": 1, "y": 1 };

// Orden de juego: primero los grupos audiovisuales, luego prensa y después medios digitales.
// Quien manda en dos grupos sale una sola vez y la revelación muestra los dos.
var NOMBRES = [
  { bloque: "Televisión", nombre: "José", apellido: "Creuheras", empresas: ["Atresmedia", "Grupo Planeta"] },
  { bloque: "Televisión", nombre: "Mario", apellido: "Rodríguez", empresas: ["Mediaset España"] },
  { bloque: "Televisión", nombre: "José Pablo", apellido: "López", empresas: ["RTVE"] },
  { bloque: "Televisión", nombre: "Joseph", apellido: "Oughourlian", empresas: ["PRISA"] },
  { bloque: "Televisión", nombre: "José Miguel", apellido: "Contreras", empresas: ["La Séptima", "infoLibre"] },
  { bloque: "Prensa", nombre: "Marco", apellido: "Pompignoli", empresas: ["Unidad Editorial"] },
  { bloque: "Prensa", nombre: "Manuel", apellido: "Mirat", empresas: ["Vocento"] },
  { bloque: "Prensa", nombre: "Javier", apellido: "Godó", empresas: ["Grupo Godó"] },
  { bloque: "Prensa", nombre: "Javier", apellido: "Moll", empresas: ["Prensa Ibérica"] },
  { bloque: "Prensa", nombre: "Íñigo", apellido: "de Yarza", empresas: ["Henneo"] },
  { bloque: "Prensa", nombre: "José", apellido: "Joly Martínez de Salazar", empresas: ["Grupo Joly"] },
  { bloque: "Medios digitales", nombre: "Jaume", apellido: "Roures", empresas: ["Público"] },
  { bloque: "Medios digitales", nombre: "Ignacio", apellido: "Escolar", empresas: ["elDiario.es"] },
  { bloque: "Medios digitales", nombre: "Pedro J.", apellido: "Ramírez", empresas: ["El Español"] },
  { bloque: "Medios digitales", nombre: "Eduardo", apellido: "Inda", empresas: ["OKDIARIO"] },
  { bloque: "Medios digitales", nombre: "José Antonio", apellido: "Sánchez", empresas: ["El Confidencial"] }
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
    if (p.a === "ping") return salida({ ok: true, juego: "ahorcado" });
    if (p.a === "state") return salida(estado(p));
    if (!ACCIONES[p.a]) return salida({ error: "Acción desconocida" });
    var lock = LockService.getScriptLock();
    lock.waitLock(25000);
    var res;
    try { res = ACCIONES[p.a](p); }
    finally { lock.releaseLock(); }
    if (res && res.ok && p.c) { try { res.state = estado(p); } catch (x) {} }
    return salida(res);
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

// ── almacenamiento ──
function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(k, o) { P.setProperty(k, JSON.stringify(o)); }
function partida(c) {
  var g = leer("G_" + cod(c));
  if (!g) throw new Error("No existe ninguna partida con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }
function sinTilde(s) { return String(s || "").toLowerCase().replace(/ñ/g, "\u0001").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\u0001/g, "ñ"); }
function normal(s) { return sinTilde(s).replace(/[^a-z0-9ñ]+/g, " ").trim(); }
function esLetra(ch) { return /[a-zñ]/.test(sinTilde(ch)); }

function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), borrar = {};
  for (var k in todo) if (k.indexOf("G_") === 0) {
    try { var g = JSON.parse(todo[k]); if (ahora - g.created > 24 * 3600 * 1000) borrar[g.code] = 1; } catch (x) {}
  }
  for (var k2 in todo) { var pt = k2.split("_"); if (pt.length >= 2 && borrar[pt[1]]) P.deleteProperty(k2); }
}

// Letras que hay que adivinar (las partículas como «de» salen ya puestas)
function letrasObjetivo(apellido) {
  var set = {};
  apellido.split(" ").forEach(function (w) {
    if (PARTICULAS[w.toLowerCase()]) return;
    w.split("").forEach(function (ch) { if (esLetra(ch)) set[sinTilde(ch)] = 1; });
  });
  return set;
}
// Plantilla del apellido: cada hueco es una letra, null si está oculta
function mascara(apellido, letras) {
  var vistas = {};
  (letras || []).forEach(function (l) { vistas[l] = 1; });
  return apellido.split(" ").map(function (w) {
    var fija = !!PARTICULAS[w.toLowerCase()];
    return w.split("").map(function (ch) {
      if (!esLetra(ch)) return ch;
      return (fija || vistas[sinTilde(ch)]) ? ch : null;
    });
  });
}
function resuelto(apellido, letras) {
  var obj = letrasObjetivo(apellido), vistas = {};
  (letras || []).forEach(function (l) { vistas[l] = 1; });
  for (var l in obj) if (!vistas[l]) return false;
  return true;
}

function actual(g) { return g.round >= 0 && g.round < NOMBRES.length ? NOMBRES[g.round] : null; }
function cerrarRonda(g) { g.status = "reveal"; g.revealedAt = Date.now(); }

// La ronda se para con tres aciertos o cuando ya no queda nadie jugando
function revisarFin(g, J, R) {
  if (g.status !== "play") return;
  if (g.winners.length >= PUNTOS.length) return cerrarRonda(g);
  var activos = 0;
  for (var id in J) { var r = R[id]; if (!r || !r.done) activos++; }
  if (Object.keys(J).length > 0 && activos === 0) cerrarRonda(g);
}

function ganar(g, J, id) {
  var puesto = g.winners.length;
  var pts = PUNTOS[puesto] || 0;
  g.winners.push({ id: id, name: J[id].name, pts: pts, ms: Date.now() - g.startedAt });
  J[id].pts += pts;
  return { puesto: puesto + 1, pts: pts };
}

function estado(p) {
  var c = cod(p.c), g = partida(c);
  var J = leer("J_" + c) || {}, D = leer("D_" + c) || {}, R = leer("R_" + c) || {};
  var esProfe = String(p.k || "") === g.admin, dev = String(p.dev || ""), yo = D[dev] || null;
  var n = actual(g), resp = { ok: true, now: Date.now() };
  var resueltos = 0, ahorcados = 0;
  for (var id in R) { if (R[id].done === "win") resueltos++; else if (R[id].done === "dead") ahorcados++; }
  resp.game = {
    code: g.code, status: g.status, round: g.round, total: NOMBRES.length,
    winners: g.winners, players: Object.keys(J).length, solved: resueltos, hanged: ahorcados, maxFallos: MAX_FALLOS
  };
  if (n) {
    var cuenta = {}; NOMBRES.forEach(function (x) { cuenta[x.bloque] = (cuenta[x.bloque] || 0) + 1; });
    var dentro = 0; for (var i = 0; i <= g.round; i++) if (NOMBRES[i].bloque === n.bloque) dentro++;
    resp.game.card = { bloque: n.bloque, nombre: n.nombre, enBloque: dentro, deBloque: cuenta[n.bloque], plantilla: mascara(n.apellido, []) };
    if (g.status === "reveal" || g.status === "over") { resp.game.card.apellido = n.apellido; resp.game.card.empresas = n.empresas; }
  }
  resp.ranking = Object.keys(J).map(function (id) { return { id: id, name: J[id].name, pts: J[id].pts }; })
    .sort(function (a, b) { return b.pts - a.pts || a.name.localeCompare(b.name); });
  if (yo && J[yo]) {
    var r = R[yo] || { letters: [], wrong: [], done: null };
    resp.me = { id: yo, name: J[yo].name, pts: J[yo].pts, letters: r.letters, wrong: r.wrong, done: r.done, puesto: r.puesto || 0, gained: r.gained || 0 };
    if (n) resp.me.plantilla = mascara(n.apellido, (g.status === "play") ? r.letters : letrasTodas(n.apellido));
  }
  if (esProfe) resp.progress = Object.keys(J).map(function (id) {
    var r = R[id] || { letters: [], wrong: [] };
    return { id: id, name: J[id].name, fallos: (r.wrong || []).length, done: r.done || null };
  });
  return resp;
}
function letrasTodas(ap) { return Object.keys(letrasObjetivo(ap)); }

var ACCIONES = {
  "new": function () {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var g = { code: code, admin: String(Math.random()).slice(2) + String(Date.now()), created: Date.now(),
      status: "lobby", round: -1, winners: [], startedAt: 0 };
    guardar("G_" + code, g); guardar("J_" + code, {}); guardar("D_" + code, {}); guardar("R_" + code, {});
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del ordenador");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 30);
    if (!nombre) throw new Error("Escribe tu nombre");
    if (g.status === "over") throw new Error("Esta partida ya ha terminado");
    var J = leer("J_" + g.code) || {}, D = leer("D_" + g.code) || {}, id = null;
    for (var k in J) if (normal(J[k].name) === normal(nombre)) id = k;
    if (!id) {
      if (Object.keys(J).length >= MAX_JUGADORES) throw new Error("La partida está llena");
      id = "j" + (Object.keys(J).length + 1);
      J[id] = { name: nombre, pts: 0 };
      guardar("J_" + g.code, J);
    }
    D[dev] = id; guardar("D_" + g.code, D);
    return { ok: true, id: id };
  },

  // Saca el siguiente nombre (o el primero)
  "next": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "play") throw new Error("Revela antes este nombre");
    if (g.round + 1 >= NOMBRES.length) { g.status = "over"; guardar("G_" + g.code, g); return { ok: true }; }
    g.round++; g.status = "play"; g.winners = []; g.startedAt = Date.now();
    guardar("G_" + g.code, g); guardar("R_" + g.code, {});
    return { ok: true };
  },

  // Una letra
  "letter": function (p) {
    var g = partida(p.c), D = leer("D_" + g.code) || {}, id = D[String(p.dev || "")];
    if (!id) throw new Error("Este ordenador no está en la partida");
    if (g.status !== "play") throw new Error("Ahora no se puede jugar");
    var L = sinTilde(String(p.l || "").slice(0, 1));
    if (!/^[a-zñ]$/.test(L)) throw new Error("Esa letra no vale");
    var J = leer("J_" + g.code) || {}, R = leer("R_" + g.code) || {};
    var r = R[id] || { letters: [], wrong: [], done: null };
    if (r.done) return { ok: true };
    if (r.letters.indexOf(L) >= 0 || r.wrong.indexOf(L) >= 0) return { ok: true };
    var n = actual(g), obj = letrasObjetivo(n.apellido), res = { ok: true, hit: !!obj[L] };
    if (obj[L]) {
      r.letters.push(L);
      if (resuelto(n.apellido, r.letters)) { var w = ganar(g, J, id); r.done = "win"; r.puesto = w.puesto; r.gained = w.pts; res.win = w; }
    } else {
      r.wrong.push(L);
      if (r.wrong.length >= MAX_FALLOS) r.done = "dead";
    }
    R[id] = r;
    revisarFin(g, J, R);
    guardar("R_" + g.code, R); guardar("J_" + g.code, J); guardar("G_" + g.code, g);
    return res;
  },

  // Resolver el apellido entero; si falla, cuenta como un fallo
  "solve": function (p) {
    var g = partida(p.c), D = leer("D_" + g.code) || {}, id = D[String(p.dev || "")];
    if (!id) throw new Error("Este ordenador no está en la partida");
    if (g.status !== "play") throw new Error("Ahora no se puede jugar");
    var txt = normal(p.text || "");
    if (!txt) throw new Error("Escribe el apellido");
    var J = leer("J_" + g.code) || {}, R = leer("R_" + g.code) || {};
    var r = R[id] || { letters: [], wrong: [], done: null };
    if (r.done) return { ok: true };
    var n = actual(g), res = { ok: true };
    if (txt === normal(n.apellido)) {
      r.letters = letrasTodas(n.apellido);
      var w = ganar(g, J, id); r.done = "win"; r.puesto = w.puesto; r.gained = w.pts; res.win = w; res.hit = true;
    } else {
      r.wrong.push("·"); res.hit = false;
      if (r.wrong.length >= MAX_FALLOS) r.done = "dead";
    }
    R[id] = r;
    revisarFin(g, J, R);
    guardar("R_" + g.code, R); guardar("J_" + g.code, J); guardar("G_" + g.code, g);
    return res;
  },

  // La profesora revela sin esperar a los tres aciertos
  "reveal": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "play") throw new Error("No hay ningún nombre en juego");
    cerrarRonda(g); guardar("G_" + g.code, g);
    return { ok: true };
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "over"; guardar("G_" + g.code, g);
    return { ok: true };
  },

  "adjust": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var J = leer("J_" + g.code) || {}, t = String(p.t || "");
    if (J[t]) { J[t].pts = Math.max(0, J[t].pts + (parseInt(p.d, 10) || 0)); guardar("J_" + g.code, J); }
    return { ok: true };
  }
};
