/**
 * COLOREAR LA CRÓNICA · servidor · v3 (antes «Marca la crónica»)
 * Cada alumno entra con su nombre y marca la crónica de El País (Real Madrid 5-1 PSV) en tres colores:
 * verde el desarrollo del titular, rojo las jugadas y amarillo el análisis.
 * Al entregar se corrige con la solución del profesor. Un trozo de la solución cuenta como encontrado
 * si el alumno marca al menos una parte con su color (+1). Cada trozo marcado con un color que no es el suyo resta 1.
 * Lo que la solución deja sin color no suma ni resta. Gana quien más puntos tiene y, si empatan, quien entregó antes.
 * La solución no sale del servidor hasta que el profesor la enseña.
 */

var P = PropertiesService.getScriptProperties();
var MAX_ALUMNOS = 80;
var MINIMO = 8;   // letras que tienen que coincidir para que una marca cuente sobre un trozo

var CRONICA = {
  "medio": "El País",
  "titulo": "El esplendor deslumbrante de Bellingham impulsa la goleada del Madrid al PSV",
  "subtitulo": "La salida del inglés en el segundo tiempo despertó a un equipo inoperante y sin alma que se vio por detrás en el marcador contra un débil rival y al que transformó el 5, que también dejó un golazo de volea",
  "parrafos": [
    "En el centro de esta galaxia feliz y contradictoria que es estos días el Real Madrid deslumbra como nunca el esplendor apabullante de Jude Bellingham. En el primer tiempo su ausencia resultó atronadora. El equipo era un espantajo sin alma ni sentido. Su entrada en el segundo devolvió la nitidez a un mundo borroso, e incluso la belleza, con un gol hermoso y devastador. Transformado por el inglés, el Madrid atrapó su décima victoria seguida, la quinta en la Champions y destrozó a un PSV que dominó hasta que apareció el 5.",
    "El Madrid se ha estado deslizando estas semanas sobre la delicada certeza de la victoria, apoyado en algunos mecanismos que funcionaban y en cierto espíritu de hermandad confiada. Pero todo eso sobre lo que se deslizaba es tan resbaladizo que un pequeño desajuste puede provocar un coscorrón. Basta que entre Militão todavía en proceso de afinarse, o que falte Bellingham, o que los jugadores se sientan ante una cita menor en la que pueden levantar el pie, mirar solo hacia delante, perseguir la alegría sin cargas de verse juntos arriba Mbappé, Diomande, Güler y Vinicius. Y cuando se acumula todo eso, sin la disciplina genial del inglés, sobreviene el derrumbe.",
    "Sobre todo cuando se encuentran con un rival ambicioso sin miedo. Esta vez fue el PSV, pero con esta versión desinflada del Madrid casi cualquiera puede desatar el pavor. El Real compareció como desarmado, con cuatro atacantes esperando el balón como en el recreo. Atrás, el resto veía cómo les caían encima los asaltos de un pelotón de apariencia vertiginosa. Provocaba la ilusión de que los madridistas estaban tallados en piedra. Como cuando Van Bommel pasó volando al lado de un Militão lentísimo. Se encontró solo ante Courtois y, tal vez por lo inesperado de la situación, echó la pelota fuera.",
    "El PSV alcanzaba sin demasiada dificultad los alrededores del área. Les bastaban tres pases sin retórica y dos carreras para atravesar la bruma de rivales pasmados. Al otro lado, el Madrid era un grupo meramente recreativo, de un barroquismo fallido. Representaban una función sin partitura, entre la improvisación, la dejadez y el absurdo. Lo único lógico en este desarrollo sin hilo fue que desembocara en un pisotón de Tchouameni a Mijnans en el área que pasó desapercibido para el árbitro. Lo avisaron más de un minuto después, cuando la jugada ya había muerto con un tiro de Güler. Se acercó a la pantalla, pitó penalti y Perisic adelantó al PSV, que en ese momento era lo único que parecía que podía pasar.",
    "La desorientación del Madrid había calado tan profundo que no había manera de que los jugadores escaparan de ella por sí mismos. La emergencia requirió de un calambrazo formidable de Mourinho en el descanso. Retiró a Militão, Rüdiger y Tchouameni y metió de golpe a Huijsen, Konaté y Bellingham. El inglés provocó una transformación asombrosa, como aquella que queda justo después de un eclipse: el mismo lugar, pero también, otro universo.",
    "Descorchó un partido nuevo que se derramó con el brío del champán levemente agitado. Todos parecieron transfigurados, empezando por Valverde, al que puso a correr desde el primer pase. Después de 45 minutos acogotado atrás, el uruguayo voló y dejó a Mbappé a un palmo de empatar. También despertó Vinicius, este de una hibernación. Alcanzó la línea de fondo y encontró al otro lado del área a Diomande, que se la dejó a Güler para un taconazo que terminó en un gol de Valverde.",
    "Desde que recibió el calambrazo del inglés, el Madrid se movía a un paso que podía producir un gol por minuto. Una entrada al área de Diomande con tiro de Güler, un remate en escorzo de Bellingham, un tiro al palo de Vinicius, un mano a mano fallido del brasileño... Era un empacho de highlights sobre el que se impuso la maravilla de Bellingham, que fingió entretenerse con los inofensivos malabares del día de su presentación y descerrajó una volea con el exterior desde fuera del área que terminó en la red. Y con todo en realidad. Aunque luego Mbappé marcó dos y Vinicius encontró por fin el tesoro extraviado del gol después de dos tiros al palo y semanas a la deriva. Todo bajo la luz abrasadora del sol de Bellingham."
  ]
};

// Solución: [párrafo, desde, hasta, color]  g = desarrollo del titular, r = jugada, y = análisis
// Bloques de la crónica, como en «Ordenar crónica»: párrafo en el que empieza cada uno
var SECCIONES = [[0, "Primer párrafo · Desarrollo del titular"], [1, "Contexto y alineaciones"], [2, "Desarrollo"], [6, "Final"]];

var CLAVE = [[0, 0, 525, "g"], [1, 0, 665, "y"], [2, 0, 432, "y"], [2, 433, 600, "r"], [3, 0, 340, "y"], [3, 341, 651, "r"], [3, 652, 712, "y"], [4, 0, 128, "r"], [4, 129, 440, "y"], [5, 0, 184, "y"], [5, 185, 477, "r"], [6, 111, 266, "y"], [6, 267, 510, "r"], [6, 535, 673, "r"], [6, 674, 724, "y"]];

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "marca" });
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
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla del profesor puede hacer esto"); }
function normal(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, " ").trim(); }

// Las partidas duran un mes, por si se deja para casa
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), borrar = {};
  for (var k in todo) if (k.indexOf("G_") === 0) {
    try { var g = JSON.parse(todo[k]); if (ahora - g.created > 31 * 24 * 3600 * 1000) borrar[g.code] = 1; } catch (x) {}
  }
  for (var k2 in todo) { var pt = k2.split("_"); if (pt.length >= 2 && borrar[pt[1]]) P.deleteProperty(k2); }
}

// ── corrección ──
// marcas: [[párrafo, desde, hasta, color], ...]
function limpiarMarcas(m) {
  var out = [];
  (Array.isArray(m) ? m : []).slice(0, 400).forEach(function (x) {
    if (!Array.isArray(x)) return;
    var p = Number(x[0]), s = Number(x[1]), e = Number(x[2]), c = String(x[3]);
    if (!(p >= 0 && p < CRONICA.parrafos.length) || "gry".indexOf(c) < 0 || c.length !== 1) return;
    var n = CRONICA.parrafos[p].length;
    s = Math.max(0, Math.min(n, Math.floor(s))); e = Math.max(0, Math.min(n, Math.floor(e)));
    if (e > s) out.push([p, s, e, c]);
  });
  return out;
}
function corregir(marcas) {
  var aciertos = 0, fallos = 0, det = [];
  CLAVE.forEach(function (k, i) {
    var min = Math.min(MINIMO, k[2] - k[1]), colores = {};
    marcas.forEach(function (m) {
      if (m[0] !== k[0]) return;
      var ov = Math.min(m[2], k[2]) - Math.max(m[1], k[1]);
      if (ov >= min) colores[m[3]] = 1;
    });
    var bien = !!colores[k[3]], mal = Object.keys(colores).filter(function (c) { return c !== k[3]; });
    if (bien) aciertos++;
    fallos += mal.length;
    det.push({ bien: bien, mal: mal });
  });
  return { aciertos: aciertos, fallos: fallos, puntos: aciertos - fallos, det: det };
}

function tabla(c) {
  var J = leer("J_" + c) || {};
  return Object.keys(J).map(function (id) {
    var a = J[id];
    return { id: id, name: a.name, entregado: !!a.entregado, puntos: a.puntos || 0, aciertos: a.aciertos || 0, fallos: a.fallos || 0, ms: a.ms || 0, inicio: a.inicio };
  }).sort(function (x, y) {
    return (y.entregado - x.entregado) || (y.puntos - x.puntos) || (x.ms - y.ms) || x.name.localeCompare(y.name);
  });
}

function estado(p) {
  var c = cod(p.c), g = partida(c);
  var J = leer("J_" + c) || {}, D = leer("D_" + c) || {};
  var esProfe = String(p.k || "") === g.admin, yo = D[String(p.dev || "")] || null;
  var resp = { ok: true, now: Date.now(), admin: esProfe };
  resp.game = { code: g.code, status: g.status, players: Object.keys(J).length, total: CLAVE.length,
    cuenta: { g: CLAVE.filter(function (k) { return k[3] === "g"; }).length, r: CLAVE.filter(function (k) { return k[3] === "r"; }).length, y: CLAVE.filter(function (k) { return k[3] === "y"; }).length } };
  resp.game.texto = { medio: CRONICA.medio, titulo: CRONICA.titulo, subtitulo: CRONICA.subtitulo, parrafos: CRONICA.parrafos, secciones: SECCIONES };
  var tb = tabla(c);
  resp.alumnos = tb.map(function (a) { return { name: a.name, entregado: a.entregado, puntos: a.puntos, aciertos: a.aciertos, fallos: a.fallos, ms: a.ms }; });
  if (g.status === "sol") resp.game.clave = CLAVE;
  if (yo && J[yo]) {
    var a = J[yo];
    resp.me = { name: a.name, inicio: a.inicio, entregado: !!a.entregado, puntos: a.puntos || 0, aciertos: a.aciertos || 0, fallos: a.fallos || 0, ms: a.ms || 0, marcas: a.marcas || [] };
    if (a.entregado) tb.forEach(function (x, i) { if (x.id === yo) resp.me.puesto = i + 1; });
    if (a.entregado && g.status === "sol") resp.me.det = corregir(a.marcas || []).det;
  }
  return resp;
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var g = { code: code, admin: String(Math.random()).slice(2) + String(Date.now()), created: Date.now(), status: "play" };
    guardar("G_" + code, g); guardar("J_" + code, {}); guardar("D_" + code, {});
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del ordenador");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (!nombre) throw new Error("Escribe tu nombre");
    var J = leer("J_" + g.code) || {}, D = leer("D_" + g.code) || {}, id = null;
    for (var k in J) if (normal(J[k].name) === normal(nombre)) id = k;
    if (!id) {
      if (Object.keys(J).length >= MAX_ALUMNOS) throw new Error("La partida está llena");
      id = "a" + (Object.keys(J).length + 1);
      J[id] = { name: nombre, inicio: Date.now() };   // el reloj de cada alumno empieza al entrar
      guardar("J_" + g.code, J);
    }
    D[dev] = id; guardar("D_" + g.code, D);
    return { ok: true, id: id };
  },

  // El alumno entrega sus marcas, una sola vez
  "entregar": function (p) {
    var g = partida(p.c), D = leer("D_" + g.code) || {}, id = D[String(p.dev || "")];
    if (!id) throw new Error("Este ordenador no está en la partida");
    if (g.status === "sol") throw new Error("El profesor ya ha enseñado la solución");
    var J = leer("J_" + g.code) || {}, a = J[id];
    if (a.entregado) throw new Error("Ya has entregado");
    var marcas = limpiarMarcas(p.marcas);
    if (!marcas.length) throw new Error("No has marcado nada");
    var r = corregir(marcas);
    a.entregado = true; a.marcas = marcas; a.aciertos = r.aciertos; a.fallos = r.fallos; a.puntos = r.puntos;
    a.ms = Date.now() - a.inicio;
    guardar("J_" + g.code, J);
    return { ok: true, puntos: r.puntos };
  },

  // El profesor enseña la solución: se cierran las entregas y cada alumno ve su corrección
  "solucion": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "sol"; guardar("G_" + g.code, g);
    return { ok: true };
  },
  "reabrir": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "play"; guardar("G_" + g.code, g);
    return { ok: true };
  }
};
