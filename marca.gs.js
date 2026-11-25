/**
 * MARCA LA CRÓNICA · servidor · v1
 * Cada alumno entra con su nombre y marca la crónica del As (Real Madrid 5-1 PSV) en tres colores:
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
  "medio": "As",
  "titulo": "Hasta que Bellingham hizo magia",
  "subtitulo": "El inglés, que hizo un gol prodigioso, transforma a un Madrid distraído en el primer tiempo y de ensueño en el segundo, en el que marcó cinco goles. Doblete de Mbappé.",
  "parrafos": [
    "El PSV arruinó el sueño de la mejor generación de canteranos madridistas, Quinta que lo ganó todo menos una Copa de Europa. De aquello hace casi cuarenta años y aunque el club ha cerrado esa herida con nueve Champions de sutura, una visita del equipo holandés vuelve a hacer visible la cicatriz. Durante un tiempo, el primero, ese fantasma recorrió el Bernabéu, porque el Madrid volvió a tener un lado oscuro, con falta de fútbol e intensidad. Luego entró Bellingham y se hizo la luz. El equipo de Mourinho brindó un segundo acto excepcional: presionó, robó sin un mediocentro defensivo, creó, mandó, remató, goleó y borró del mapa a un grupo que antes había parecido una enorme amenaza.",
    "La victoria reiteró el mensaje de que Bellingham y Güler son irremplazables, de que Konaté y Huijsen son irrenunciables, de que Diomande es intocable y de que, en el área, Mbappé es imparable. Vinicius le puso ganas y se llevó el premio del gol. Casos como el del PSV son recurrentes en las competiciones europeas: equipos muy dominantes en su Ligas (los holandeses han marcado en todos los partidos y son líderes), muy habituados a apropiarse de la pelota, que en la Champions se encuentran con la cruda realidad y pierden la alegría y, a menudo, los puntos. No fue este el caso. Bosz no movió un milímetro sus principios, con Dest y Kostic, extremos disfrazados de laterales, su cuarteto ofensivo habitual y una presión avanzadísima y fiera uno contra uno hasta las últimas consecuencias. Lo aprovechó ante un Madrid distraído y desmayado al principio y pagó luego por su valentía.",
    "En diez minutos tuvo tres goles a su alcance el PSV, en un cabezazo de Mijnans con mejor posición que postura; en una arrancada de Van Bommel, apellido ilustre, que dejó atrás a un Militao lejos de sí mismo y culminó con un mal remate, y en un disparo al lateral de la red de Dest, que luce el 8 para renegar de su papel de lateral.",
    "Un Madrid reconfigurado se sintió en el alambre. Mourinho invierte a largo plazo. Ahorrar en otoño es florecer en primavera, parece indicar el plan. De ahí la redundancia en rotaciones extremas como esta. Cuatro defensas nuevos respecto al partido contra el Celta, eso sí, debidamente combinados: jugaron los centrales suplentes y los laterales titulares. Por delante, el motor habitual de dos velocidades (Tchouameni y Bernardo). Y arriba, el funambulismo de poner a Vinicius sin quitar a Diomande ni tocar a Mbappé. El excedente era un mediapunta y esta vez le tocó parar a Bellingham, que en cada partido se juega con Güler el MVP de la temporada. La maniobra afectó al equilibrio del equipo, especialmente en la salida de pelota.",
    "La valentía del PSV estaba por encima de los galgos del Madrid en un partido jugado a la tremenda. El equipo de Mourinho, siempre al borde de una pérdida fatal muy cerca de Courtois; el de Bosz, menos expuesto a las contras blancas en los balones largos y a las ocurrencias de Vinicius, que necesita una reconquista. Pronto se procuró el brasileño un disparo cruzado, de izquierda a derecha, que tocó el palo. Pareció dispuesto a volver a camelarse al Bernabéu, pero se quedó ahí durante toda la primera mitad.",
    "En el intercambio de golpes, desigual, porque los holandeses eran claramente mejores, el primero se lo llevó el Madrid y pareció justo. Tchouameni pisó imprudentemente a Mijnans muy dentro del área, infracción que se le pasó a Eskas, pero no al VAR. Penalti, transformación del veteranísimo Perisic y el Madrid, por enésima vez, autoexigiéndose una remontada. El Bernabéu, que ha visto tantas películas de acción con final feliz, no pareció inquietarse en exceso pese a que el equipo pasaba un calvario para cruzar el mediocampo. La presión del PSV ahogaba, la del Madrid andaba entre tibia e imperceptible. El resultado era que todo lo noticiable sucedía en su área: dos acometidas de Van Bommel, un tiro cruzado de Mijnans, un despeje salvador de Cucurella...",
    "Lo mejor al descanso era el marcador, una vez más, porque nada había funcionado en el Madrid. Los centrales andaban inseguros; Tchouameni, el patrullero, desbordado; Arda Güler, impreciso; Mbappé, obcecado, y Diomande y Vinicius, anulados por un adversario que defendía excelentemente en campo contrario y también en su área.",
    "La imagen resultó tan preocupante que Mourinho optó por medidas radicales: en el entretiempo cambió a los dos centrales y metió a Bellingham por Tchouameni, su único mediocentro de cierre. Ese desfibrilador le había funcionado hasta ahora. También esta vez, con Valverde como principal impulsor.",
    "Él provocó la primera ocasión y le puso nombre al empate en una jugada de artesanía: centro pasado de Vinicius, toque de Diomande, taconazo de Güler y remate del uruguayo, que entró como una centella en el área. Al PSV le sobrevino, de improviso, el ganador de quince Champions y un imperio, británico por más señas.",
    "Y es que el cambio de partido y hasta de planeta podría ser atribuible a Bellingham, cuya influencia en el juego fue descomunal, pero también tuvo que ver la voluntad general, con el regreso de un Madrid cardiaco, arrollador, casi enfurecido. En plena tormenta Kovar salvó tres goles en cuatro minutos, a tiros cercanos de Güler, Mbappé y Bellingham. Súbitamente, el PSV perdió el dominio, el encanto y el orden hasta que Kovar no pudo con el cuarto intento, un prodigio de Bellingham: control con la izquierda, toquecito sin dejar caer con la derecha y volea precisa desde fuera del área. Magia en tres actos. Un gol que no olvidará el Bernabéu.",
    "Aquella juerga se alargó. Mbappé marcó a pase de un Güler empoderadísimo e hizo doblete en la recta final, Vinicius estrelló un balón en el palo y otro en el cuerpo de Kovar antes de cerrar la manita, a Bellingham le faltaron dos dedos para llegar a un envío letal del propio Vinicius... A los postres, Mourinho metió a Camavinga para evitar sorpresas (y casi se encuentra con otra, una roja que mereció) y ahorrarse otro milagro de Espí, porque esta vez el extintor fue Bellingham."
  ]
};

// Solución: [párrafo, desde, hasta, color]  g = desarrollo del titular, r = jugada, y = análisis
var CLAVE = [[0, 444, 687, "g"], [1, 0, 245, "y"], [1, 246, 790, "y"], [2, 0, 78, "r"], [2, 79, 109, "y"], [2, 111, 141, "r"], [2, 161, 206, "y"], [2, 207, 280, "r"], [2, 282, 332, "y"], [3, 0, 733, "y"], [4, 0, 253, "y"], [4, 254, 285, "y"], [4, 317, 409, "r"], [4, 410, 510, "y"], [5, 136, 249, "r"], [5, 259, 298, "y"], [5, 360, 607, "y"], [5, 608, 761, "r"], [6, 0, 325, "y"], [7, 0, 188, "r"], [7, 189, 295, "y"], [8, 3, 211, "r"], [8, 212, 316, "y"], [9, 0, 242, "y"], [9, 243, 350, "r"], [9, 351, 411, "y"], [9, 412, 589, "r"], [9, 590, 610, "g"], [9, 611, 646, "y"], [10, 26, 287, "r"], [10, 288, 404, "r"], [10, 405, 482, "y"]];

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
  resp.game.texto = { medio: CRONICA.medio, titulo: CRONICA.titulo, subtitulo: CRONICA.subtitulo, parrafos: CRONICA.parrafos };
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
