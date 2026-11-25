/**
 * ORDENA LA CRÓNICA · servidor · v1
 * Cada equipo recibe los párrafos de una crónica desordenados y los lleva a las cajas numeradas.
 * Cuando ha puesto todos, se corrige: los bien puestos salen en verde y se quedan fijos, los mal puestos en rojo.
 * Los rojos no se mueven hasta que el equipo pulsa «Sacar los rojos» y vuelven a la columna de los sueltos.
 * Se juega primero la crónica 1 (Bellingham resucita al Real Madrid) y después la 2 (Hasta que Bellingham hizo magia), las dos del Real Madrid 5-1 PSV.
 * Dos modos: en clase (el profesor arranca el reloj para todos) y para casa (cada alumno entra con su nombre y su reloj empieza al entrar).
 * Gana quien termina antes con todo en verde. La solución nunca sale del servidor.
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 60;

var CRONICAS = {
  "c1": {
    "medio": "Crónica 1",
    "titulo": "Bellingham resucita al Real Madrid",
    "subtitulo": "El inglés, suplente, sale en el descanso con 0-1 para convertir a un equipo muerto ante el PSV en el viejo Rey de Europa. Vinicius se libera al cerrar la goleada y provoca el abrazo del grupo",
    "cajas": [
      "Idea del titular",
      "Alineaciones comentadas y contexto",
      "Alineaciones comentadas y contexto",
      "Desarrollo",
      "Desarrollo",
      "Desarrollo",
      "Final"
    ],
    "bloques": [
      {
        "id": "A",
        "texto": "Quedó claro pues que no era de esos días en que el Madrid se toma el asunto con rigor de inicio. Tampoco ayuda ese 4-3-3 con Diomande, Mbappé y Vinicius en ataque, ante la ausencia de Bellingham, que lo había jugado todo hasta la fecha. Por mucho que trabaje el marfileño, la inferioridad es manifiesta sin balón, y más ante un adversario con buen pie como el PSV. En su reválida personal, Vini quiso liderar la reacción. Estrelló en la cruceta en una diagonal de las suyas. Y facilitó con un estupendo primer toque el dos contra uno de Mbappé y Arda. Tocó mal Kylian y se fue al limbo la ocasión. Era el minuto 14 y parecía que cambiaba la película. Ya."
      },
      {
        "id": "B",
        "texto": "No se vayan todavía, aún hay más. Porque Bellingham volvió a zidanear con un pase a Vini, que había errado un par de ocasiones claras, y completó la manita. Jude corrió como un poseso a abrazar al 7, y tras él, el grupo entero. Se debe hacer de querer el brasileño. Bien está lo que bien acaba. Y para aspirar a todo, Junior será necesario. Mientras tanto, en la BMV, Jude es el Rey."
      },
      {
        "id": "C",
        "texto": "El correctivo fue tan serio que Mourinho asumió su apuesta fallida con triple cambio al descanso. Relevó a los dos centrales para defender hacia adelante y aclarar la salida del juego y, sobre todo, ingresó Bellingham, que lo primero que hizo fue servir un primer toque primoroso para dejar solo a Valverde. El centro del uruguayo fue tan tenso que no llegó por media talla. Con Arda y Bernardo en el doble pivote, el Madrid fue un huracán. Se contagiaron todos, el primero el turco, que facilitó el empate con un primer toque sutil para la llegada de Valverde, el falso lateral capaz de dominar el juego desde atrás. Pudieron anotar Vini, Bellingham con una tijera espectacular, Diomande, Mbappé, pero era de justicia que quien rompiera la baraja fuese Jude. Acompañó el ataque, controló al aire, se dio el autopase por arriba y desde la frontal conectó la volea con el exterior, cruzada, imposible. Un gol extraordinario para un futbolista descomunal."
      },
      {
        "id": "D",
        "texto": "Jude Bellingham. No busquen más. El fútbol del inglés, con el 5 a la espalda que inmortalizó Zidane, es capaz de resucitar a un muerto, que es lo que parecía el Real Madrid al descanso. El equipo blanco se fue al descanso por debajo en el marcador y zarandeado en el juego por un asombroso PSV, presionante a todo campo. Pero corrigió Mourinho, metió a Zinedine Bellingham junto a los centrales titulares y arrasó al equipo neerlandés. Goleó en medio partido por fútbol, por actitud y por acierto, redimiendo a quienes acababan de recibir pitos. Como Mbappé, autor de un doblete. Y también, por fin, como Vinicius, que cerró la goleada con un buen tanto y el abrazo colectivo de un equipo en racha. Cinco de cinco. Pie y medio en octavos."
      },
      {
        "id": "E",
        "texto": "No se quedó ahí el equipo blanco, incontenible con viento a favor. No había ni rastro del PSV desde que Perisic se quedara en el vestuario. Con el Madrid desbocado aparecieron las carencias del cuadro neerlandés,  especialmente en la salida. Estuvo a punto de liarla Geertruida, pero el pecado cayó en la cuenta de Sano, que regaló la pelota a Arda y el turco regaló el tercero a Mbappé. No se contuvo el Madrid, exacto en todos los sectores. Incluso al corregir desventajas como la de Konaté ante Van Bommel. La goleada era inevitable. Entraron Camavinga, que debió ser expulsado por una plancha temeraria, y Brahim. No tuvo minutos Espí, pese a su portada ante el Celta. Pero Mou tiene ángel, y Díaz sirvió un balón perfecto para que Mbappé recordase a Ronaldo Nazario. Regate en largo y 4-1."
      },
      {
        "id": "F",
        "texto": "Pese al buen sabor final, la primera mitad fue terrible. Y no es la primera vez. Sorprendió el riesgo asumido por el PSV. Tanto que cogió a contrapié a un Madrid repleto de rotaciones. Especialmente en defensa, con Rüdiger y Militao en el eje. A pares por toda la pradera del Bernabéu, los neerlandeses sumaron tres acciones de gol en diez minutos. La primera, por movilidad, no llegó Mijnans a cabecear el centro envenenado de Perisic. La segunda, por velocidad, Van Bommel dejó atrás a Militao, se plantó ante Courtois y remató al lateral de la red. Y la tercera, por osadía, se la apuntó Sergiño Dest, que superó con facilidad a su par, trazó la diagonal y remató al costado de la portería."
      },
      {
        "id": "G",
        "texto": "Empezó a recuperar la pelota prontísimo el PSV, por su ambición defensiva y por la falta de futbolistas que se ofrecieran en largo para lucharla, bajarla, jugar de espaldas. Y combinaron los neerlandeses, con sus volantes indetectables. Probó Sano de lejos, pero fue Mijnans quien rompió la baraja. Combinó con Van Bommel, buscó línea de fondo y recibió el pisotón imprudente de Tchouaméni en área. No lo vio Eskas en directo pero corrigió el VAR. Perisic, socio eterno de Modric en la generación dorada de Croacia, transformó el penalti y desató aún más al PSV, dueño y señor del partido. Perdonaron Van Bommel y Sano, solo en el área para el cabezazo. Y el Bernabéu señaló a Vinicius y Mbappé por su falta de intensidad, de coraje, de rebeldía. Lo mínimo, vaya. Perdían muchas. Casi todas. Y se quedaban mirando. No podía ni sospecharse lo que estaba por venir."
      }
    ],
    "solucion": [
      "D",
      "F",
      "A",
      "G",
      "C",
      "E",
      "B"
    ]
  },
  "c2": {
    "medio": "Crónica 2",
    "titulo": "Hasta que Bellingham hizo magia",
    "subtitulo": "El inglés, que hizo un gol prodigioso, transforma a un Madrid distraído en el primer tiempo y de ensueño en el segundo, en el que marcó cinco goles. Doblete de Mbappé.",
    "cajas": [
      "Idea del titular",
      "Alineaciones comentadas y contexto",
      "Alineaciones comentadas y contexto",
      "Alineaciones comentadas y contexto",
      "Desarrollo",
      "Desarrollo",
      "Desarrollo",
      "Desarrollo",
      "Final"
    ],
    "bloques": [
      {
        "id": "A",
        "texto": "La valentía del PSV estaba por encima de los galgos del Madrid en un partido jugado a la tremenda. El equipo de Mourinho, siempre al borde de una pérdida fatal muy cerca de Courtois; el de Bosz, menos expuesto a las contras blancas en los balones largos y a las ocurrencias de Vinicius, que necesita una reconquista. Pronto se procuró el brasileño un disparo cruzado, de izquierda a derecha, que tocó el palo. Pareció dispuesto a volver a camelarse al Bernabéu, pero se quedó ahí durante toda la primera mitad.\n\nEn el intercambio de golpes, desigual, porque los holandeses eran claramente mejores, el primero se lo llevó el Madrid y pareció justo. Tchouameni pisó imprudentemente a Mijnans muy dentro del área, infracción que se le pasó a Eskas, pero no al VAR. Penalti, transformación del veteranísimo Perisic y el Madrid, por enésima vez, autoexigiéndose una remontada. El Bernabéu, que ha visto tantas películas de acción con final feliz, no pareció inquietarse en exceso pese a que el equipo pasaba un calvario para cruzar el mediocampo. La presión del PSV ahogaba, la del Madrid andaba entre tibia e imperceptible. El resultado era que todo lo noticiable sucedía en su área: dos acometidas de Van Bommel, un tiro cruzado de Mijnans, un despeje salvador de Cucurella..."
      },
      {
        "id": "B",
        "texto": "En diez minutos tuvo tres goles a su alcance el PSV, en un cabezazo de Mijnans con mejor posición que postura; en una arrancada de Van Bommel, apellido ilustre, que dejó atrás a un Militao lejos de sí mismo y culminó con un mal remate, y en un disparo al lateral de la red de Dest, que luce el 8 para renegar de su papel de lateral."
      },
      {
        "id": "C",
        "texto": "La imagen resultó tan preocupante que Mourinho optó por medidas radicales: en el entretiempo cambió a los dos centrales y metió a Bellingham por Tchouameni, su único mediocentro de cierre. Ese desfibrilador le había funcionado hasta ahora. También esta vez, con Valverde como principal impulsor.\n\nÉl provocó la primera ocasión y le puso nombre al empate en una jugada de artesanía: centro pasado de Vinicius, toque de Diomande, taconazo de Güler y remate del uruguayo, que entró como una centella en el área. Al PSV le sobrevino, de improviso, el ganador de quince Champions y un imperio, británico por más señas."
      },
      {
        "id": "D",
        "texto": "Aquella juerga se alargó. Mbappé marcó a pase de un Güler empoderadísimo e hizo doblete en la recta final, Vinicius estrelló un balón en el palo y otro en el cuerpo de Kovar antes de cerrar la manita, a Bellingham le faltaron dos dedos para llegar a un envío letal del propio Vinicius... A los postres, Mourinho metió a Camavinga para evitar sorpresas (y casi se encuentra con otra, una roja que mereció) y ahorrarse otro milagro de Espí, porque esta vez el extintor fue Bellingham."
      },
      {
        "id": "E",
        "texto": "El PSV arruinó el sueño de la mejor generación de canteranos madridistas, Quinta que lo ganó todo menos una Copa de Europa. De aquello hace casi cuarenta años y aunque el club ha cerrado esa herida con nueve Champions de sutura, una visita del equipo holandés vuelve a hacer visible la cicatriz. Durante un tiempo, el primero, ese fantasma recorrió el Bernabéu, porque el Madrid volvió a tener un lado oscuro, con falta de fútbol e intensidad. Luego entró Bellingham y se hizo la luz. El equipo de Mourinho brindó un segundo acto excepcional: presionó, robó sin un mediocentro defensivo, creó, mandó, remató, goleó y borró del mapa a un grupo que antes había parecido una enorme amenaza."
      },
      {
        "id": "F",
        "texto": "Un Madrid reconfigurado se sintió en el alambre. Mourinho invierte a largo plazo. Ahorrar en otoño es florecer en primavera, parece indicar el plan. De ahí la redundancia en rotaciones extremas como esta. Cuatro defensas nuevos respecto al partido contra el Celta, eso sí, debidamente combinados: jugaron los centrales suplentes y los laterales titulares. Por delante, el motor habitual de dos velocidades (Tchouameni y Bernardo). Y arriba, el funambulismo de poner a Vinicius sin quitar a Diomande ni tocar a Mbappé. El excedente era un mediapunta y esta vez le tocó parar a Bellingham, que en cada partido se juega con Güler el MVP de la temporada. La maniobra afectó al equilibrio del equipo, especialmente en la salida de pelota."
      },
      {
        "id": "G",
        "texto": "Y es que el cambio de partido y hasta de planeta podría ser atribuible a Bellingham, cuya influencia en el juego fue descomunal, pero también tuvo que ver la voluntad general, con el regreso de un Madrid cardiaco, arrollador, casi enfurecido. En plena tormenta Kovar salvó tres goles en cuatro minutos, a tiros cercanos de Güler, Mbappé y Bellingham. Súbitamente, el PSV perdió el dominio, el encanto y el orden hasta que Kovar no pudo con el cuarto intento, un prodigio de Bellingham: control con la izquierda, toquecito sin dejar caer con la derecha y volea precisa desde fuera del área. Magia en tres actos. Un gol que no olvidará el Bernabéu."
      },
      {
        "id": "H",
        "texto": "La victoria reiteró el mensaje de que Bellingham y Güler son irremplazables, de que Konaté y Huijsen son irrenunciables, de que Diomande es intocable y de que, en el área, Mbappé es imparable. Vinicius le puso ganas y se llevó el premio del gol. Casos como el del PSV son recurrentes en las competiciones europeas: equipos muy dominantes en su Ligas (los holandeses han marcado en todos los partidos y son líderes), muy habituados a apropiarse de la pelota, que en la Champions se encuentran con la cruda realidad y pierden la alegría y, a menudo, los puntos. No fue este el caso. Bosz no movió un milímetro sus principios, con Dest y Kostic, extremos disfrazados de laterales, su cuarteto ofensivo habitual y una presión avanzadísima y fiera uno contra uno hasta las últimas consecuencias. Lo aprovechó ante un Madrid distraído y desmayado al principio y pagó luego por su valentía."
      },
      {
        "id": "I",
        "texto": "Lo mejor al descanso era el marcador, una vez más, porque nada había funcionado en el Madrid. Los centrales andaban inseguros; Tchouameni, el patrullero, desbordado; Arda Güler, impreciso; Mbappé, obcecado, y Diomande y Vinicius, anulados por un adversario que defendía excelentemente en campo contrario y también en su área."
      }
    ],
    "solucion": [
      "E",
      "H",
      "B",
      "F",
      "A",
      "I",
      "C",
      "G",
      "D"
    ]
  }
};

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "ordena" });
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

// Las partidas de clase duran un día; las de casa, un mes
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), borrar = {};
  for (var k in todo) if (k.indexOf("G_") === 0) {
    try {
      var g = JSON.parse(todo[k]), vida = (g.modo === "casa" ? 31 : 1) * 24 * 3600 * 1000;
      if (ahora - g.created > vida) borrar[g.code] = 1;
    } catch (x) {}
  }
  for (var k2 in todo) { var pt = k2.split("_"); if (pt.length >= 2 && borrar[pt[1]]) P.deleteProperty(k2); }
}

var ORDEN = Object.keys(CRONICAS);   // primero la crónica 1, después la 2

function cronicaPublica(id) {
  var c = CRONICAS[id];
  return { id: id, medio: c.medio, titulo: c.titulo, subtitulo: c.subtitulo, cajas: c.cajas, bloques: c.bloques };
}
// Resultados de cada crónica por separado
function rkey(code, cron) { return "R_" + code + "_" + cron; }
function terminados(R) {
  var out = [];
  for (var id in R) if (R[id].fin) out.push({ id: id, ms: R[id].ms, intentos: R[id].intentos });
  return out.sort(function (a, b) { return a.ms - b.ms; });
}
// En casa cada alumno va a su ritmo: su crónica es la primera que no ha terminado
function cronicaDe(g, id) {
  if (g.modo !== "casa") return g.cronica;
  var A = (leer("A_" + g.code) || {})[id] || {};
  return A.cron || ORDEN[0];
}
function inicioDe(g, id, cron) {
  if (g.modo !== "casa") return g.startedAt;
  var r = (leer(rkey(g.code, cron)) || {})[id] || {};
  return r.inicio || 0;
}

function estado(p) {
  var c = cod(p.c), g = partida(c);
  var J = leer("J_" + c) || {}, D = leer("D_" + c) || {};
  var esProfe = String(p.k || "") === g.admin, yo = D[String(p.dev || "")] || null;
  var resp = { ok: true, now: Date.now(), admin: esProfe };
  resp.game = {
    code: g.code, modo: g.modo || "clase", status: g.status, cronica: g.cronica, jugadas: g.jugadas || [],
    startedAt: g.startedAt, endedAt: g.endedAt || 0, players: Object.keys(J).length,
    opciones: ORDEN.map(function (k) { return { id: k, medio: CRONICAS[k].medio, titulo: CRONICAS[k].titulo, n: CRONICAS[k].solucion.length }; })
  };
  var porCron = {};
  ORDEN.forEach(function (k) { porCron[k] = leer(rkey(c, k)) || {}; });

  if (g.modo === "casa") {
    // Tabla del profesor: tiempos de cada crónica y total de las dos
    resp.alumnos = Object.keys(J).map(function (id) {
      var t = { id: id, name: J[id].name, total: 0, completas: 0, porCron: {} };
      ORDEN.forEach(function (k) {
        var r = porCron[k][id];
        if (r) t.porCron[k] = { fin: !!r.fin, ms: r.ms || 0, intentos: r.intentos || 0, aciertos: r.aciertos || 0, inicio: r.inicio || 0 };
        if (r && r.fin) { t.total += r.ms; t.completas++; }
      });
      return t;
    }).sort(function (a, b) { return (b.completas - a.completas) || (a.total - b.total) || a.name.localeCompare(b.name); });
  } else {
    var cr = g.cronica, R = cr ? porCron[cr] : {}, fin = terminados(R);
    resp.game.finished = fin.length;
    resp.podio = fin.map(function (f, i) { return { id: f.id, name: J[f.id] ? J[f.id].name : "?", ms: f.ms, intentos: f.intentos, puesto: i + 1 }; });
    resp.equipos = Object.keys(J).map(function (id) {
      var r = R[id] || {};
      return { id: id, name: J[id].name, aciertos: r.aciertos || 0, intentos: r.intentos || 0, fin: !!r.fin, ms: r.ms || 0 };
    });
    if (g.status !== "lobby" && cr) resp.game.texto = cronicaPublica(cr);
    if (g.status === "over" && cr) resp.game.solucion = CRONICAS[cr].solucion;
  }

  if (yo && J[yo]) {
    var mc = cronicaDe(g, yo), r = (mc && porCron[mc][yo]) || {};
    resp.me = { id: yo, name: J[yo].name, cronica: mc, fijos: r.fijos || {}, ultimo: r.ultimo || null, intentos: r.intentos || 0, fin: !!r.fin, ms: r.ms || 0, puesto: 0 };
    if (mc) terminados(porCron[mc]).forEach(function (f, i) { if (f.id === yo) resp.me.puesto = i + 1; });
    if (g.modo === "casa") {
      resp.me.inicio = r.inicio || 0;
      resp.me.texto = cronicaPublica(mc);
      resp.me.siguiente = ORDEN[ORDEN.indexOf(mc) + 1] || null;
      if (resp.me.siguiente) resp.me.siguienteMedio = CRONICAS[resp.me.siguiente].medio;
      resp.me.resumen = ORDEN.map(function (k) { var x = porCron[k][yo]; return { medio: CRONICAS[k].medio, fin: !!(x && x.fin), ms: (x && x.ms) || 0, intentos: (x && x.intentos) || 0 }; });
    }
  }
  return resp;
}

// Una ronda de clase o una crónica de casa empieza con el tablero limpio
function empezarCasa(g, id, cron) {
  var R = leer(rkey(g.code, cron)) || {};
  if (!R[id]) { R[id] = { intentos: 0, fijos: {}, inicio: Date.now() }; guardar(rkey(g.code, cron), R); }
  var A = leer("A_" + g.code) || {};
  A[id] = { cron: cron }; guardar("A_" + g.code, A);
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("G_" + code));
    var casa = p.modo === "casa";
    var g = { code: code, admin: String(Math.random()).slice(2) + String(Date.now()), created: Date.now(),
      modo: casa ? "casa" : "clase", status: casa ? "play" : "lobby", cronica: "", startedAt: 0, jugadas: [] };
    guardar("G_" + code, g); guardar("J_" + code, {}); guardar("D_" + code, {});
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del ordenador");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (!nombre) throw new Error(g.modo === "casa" ? "Escribe tu nombre" : "Escribe el nombre del equipo");
    var J = leer("J_" + g.code) || {}, D = leer("D_" + g.code) || {}, id = null;
    for (var k in J) if (normal(J[k].name) === normal(nombre)) id = k;
    if (!id) {
      if (Object.keys(J).length >= MAX_EQUIPOS) throw new Error("La partida está llena");
      id = "e" + (Object.keys(J).length + 1);
      J[id] = { name: nombre };
      guardar("J_" + g.code, J);
    }
    D[dev] = id; guardar("D_" + g.code, D);
    // en casa el reloj de la primera crónica arranca al entrar
    if (g.modo === "casa" && !(leer("A_" + g.code) || {})[id]) empezarCasa(g, id, ORDEN[0]);
    return { ok: true, id: id };
  },

  // Casa: el alumno pasa a la siguiente crónica cuando ha terminado la anterior
  "siguiente": function (p) {
    var g = partida(p.c), D = leer("D_" + g.code) || {}, id = D[String(p.dev || "")];
    if (!id) throw new Error("Este ordenador no está en la partida");
    if (g.modo !== "casa") throw new Error("Esto solo vale en las partidas para casa");
    var cron = cronicaDe(g, id), r = (leer(rkey(g.code, cron)) || {})[id] || {};
    if (!r.fin) throw new Error("Termina antes esta crónica");
    var sig = ORDEN[ORDEN.indexOf(cron) + 1];
    if (!sig) throw new Error("Ya has hecho todas las crónicas");
    empezarCasa(g, id, sig);
    return { ok: true };
  },

  // Clase: el profesor elige crónica y arranca el cronómetro
  "start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.modo === "casa") throw new Error("En las partidas para casa cada alumno empieza al entrar");
    if (!CRONICAS[p.cronica]) throw new Error("Elige una crónica");
    g.jugadas = g.jugadas || []; if (g.jugadas.indexOf(p.cronica) < 0) g.jugadas.push(p.cronica);
    g.cronica = p.cronica; g.status = "play"; g.startedAt = Date.now(); g.endedAt = 0;
    guardar("G_" + g.code, g); guardar(rkey(g.code, p.cronica), {});
    return { ok: true };
  },

  // El equipo manda su orden completo: { orden: ["E","B",...] } por caja
  "check": function (p) {
    var g = partida(p.c), D = leer("D_" + g.code) || {}, id = D[String(p.dev || "")];
    if (!id) throw new Error("Este ordenador no está en la partida");
    if (g.status !== "play") throw new Error("Ahora no se puede jugar");
    var cron = cronicaDe(g, id), C = CRONICAS[cron], orden = Array.isArray(p.orden) ? p.orden.map(String) : [];
    if (p.cronica && p.cronica !== cron) throw new Error("Esta crónica ya no está en juego");
    if (orden.length !== C.solucion.length) throw new Error("Faltan párrafos por colocar");
    var vistos = {};
    orden.forEach(function (x) { vistos[x] = 1; });
    if (Object.keys(vistos).length !== C.solucion.length) throw new Error("Hay párrafos repetidos");
    var R = leer(rkey(g.code, cron)) || {}, r = R[id] || { intentos: 0, fijos: {}, inicio: Date.now() };
    if (r.fin) return { ok: true, bien: C.solucion.map(function () { return true; }), fin: true };
    r.intentos++;
    var bien = orden.map(function (x, i) { return x === C.solucion[i]; });
    var n = 0;
    bien.forEach(function (b, i) { if (b) { n++; r.fijos[i] = orden[i]; } });
    r.aciertos = n; r.ultimo = { orden: orden, bien: bien };
    var res = { ok: true, bien: bien };
    if (n === C.solucion.length) {
      r.fin = true; r.ms = Date.now() - inicioDe(g, id, cron);
      res.fin = true; res.puesto = terminados(R).length + 1; res.ms = r.ms;
    }
    R[id] = r; guardar(rkey(g.code, cron), R);
    return res;
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "over"; g.endedAt = Date.now(); guardar("G_" + g.code, g);
    return { ok: true };
  },

  // Volver a la sala con los mismos equipos para jugar otra crónica
  "lobby": function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "lobby"; g.cronica = ""; g.startedAt = 0; g.endedAt = 0;
    guardar("G_" + g.code, g);
    return { ok: true };
  }
};
