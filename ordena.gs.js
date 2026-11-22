/**
 * ORDENA LA CRÓNICA · servidor · v1
 * Cada equipo recibe los párrafos de una crónica desordenados y los lleva a las cajas numeradas.
 * Cuando ha puesto todos, se corrige: los bien puestos salen en verde y se quedan fijos, los mal puestos en rojo.
 * Los rojos no se mueven hasta que el equipo pulsa «Sacar los rojos» y vuelven a la columna de los sueltos.
 * Se juega primero la crónica de Marca y después la de As.
 * Dos modos: en clase (el profesor arranca el reloj para todos) y para casa (cada alumno entra con su nombre y su reloj empieza al entrar).
 * Gana quien termina antes con todo en verde. La solución nunca sale del servidor.
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 60;

var CRONICAS = {
  marca: {
    medio: "Marca",
    titulo: "Carlos Espí saca al Madrid de otro lío",
    subtitulo: "El punta vuelve a anotar en el tramo final el gol del triunfo ante un Celta notable que puso en apuros a los blancos desde los cinco minutos, con gol de Durán. Bellingham brilla de nuevo",
    cajas: ["Idea del titular", "Alineaciones comentadas", "Desarrollo", "", "", "", "", "Final"],
    bloques: [
      { id: "A", texto: "Cambió Giráldez tras el descanso, a Jutglà por Hugo Álvarez. Pero cambió el Madrid, que salió más agresivo. Al minuto evitó Javi Rodríguez, el gol de Carreras, que apareció por sorpresa en el área pequeña. Metió intensidad el equipo blanco, hundiendo a su adversario, aunque tampoco hacía trabajar a Radu. Así que a los diez minutos, triple cambio. Valverde, Cucurella y Vinicius. Suplente en la primera justa con Diomande de igual a igual, saltó con media hora larga para sacar rebeldía, carácter y desborde. Que falta hacían." },
      { id: "B", texto: "Venía el Celta de Giráldez como un equipo más sólido que atrevido, cambiando el plan de pasados ejercicios. Sin ningún fichaje en el once y seis titulares formados en el Fortuna, el equipo gallego se comportó con inteligencia, cerrando espacios en defensa, prietas las filas, y desplegándose con movilidad en ataque." },
      { id: "C", texto: "No se puede negar que Mourinho lo puso todo para ganar. Metió primero a Endrick y después a Espí. Tampoco se achantó Giráldez, que refrescó el ataque con Driouech, Rueda y, sobre todo, con Aspas, ovacionado por la grada en su última visita al Bernabéu. Dejó un pase estupendo que no acertó a desviar en boca de gol Javi Rueda, que entró como un trueno. Perdonó el Celta que no se cerró, asumiendo riesgos, y lo pagó. En una transición salió Bellingham con elegancia, abrió a Vini y sirvió el centro templado para el cabezazo salvador de Espí. Héroe. Honor también para Junior, desequilibrante en ambos tantos para rescatar un partido complicadísimo por mérito del Celta. Pero el Madrid este año huele bien porque tiene pegada de sobra. Espí es un cañón." },
      { id: "D", texto: "Incomodó a un Madrid que creyó que podría gestionar el partido sin mucho esfuerzo, con su inercia ganadora, y le costó hasta generar ocasiones. Probó Diomande pronto, con un centro que no alcanzó a rematar en plancha Bernardo, pero el equipo de Mourinho no remató entre los tres palos hasta pasada la media hora. En cambio, los gallegos generaron varias acciones de mérito, casi siempre con Williot como protagonista. La más clara, rematando al lateral de la red un centro atrás de Carreira tras jugada larga y fluida. Las más frecuentes, a la espalda de Arnold, señalado por el Bernabéu." },
      { id: "E", texto: "Espí. Carlos Espí. El Real Madrid invocó a su solucionador de problemas y volvió a actuar como tal. Un partido complejo, trabado, bien trabajado y defendido por el Celta, cayó del lado blanco cuando apareció el ariete para cabecear un gran centro de Vinicius, que aceptó de buen grado su papel de revulsivo. La eficacia de Espí sacó a su equipo de otro lío, como ante el Espanyol o el Elche, y mantuvo la buena racha blanca desde el Metropolitano en un partido sin mucho brillo pero efica para dejar sin premio a un Celta al que este año no le sale la moneda de cara casi nunca. Esta vez jugó bien, y no fue bastante." },
      { id: "F", texto: "No se puede negar que Vinicius lo intentó. Perdió las primeras. Incluso salió Mourinho a animarle cuando perdió una pelota sencilla. El caso es que el Celta se había estirado para crear dos buenas opciones, un tiro de Jutglá desde la frontal, solo y fuera, y otro duro y esquinado de Durán que sacó a pasear la mano sagrada de Courtois, y ambas sirvieron de preámbulo del empate. Persistió Vinicius con una diagonal, metió en la frontal a Mbappé que la dejó muerta y Bellingham cruzó a la red. Intratable Jude." },
      { id: "G", texto: "Costó al Bernabéu entrar en partido, después del sobrecogedor homenaje a Jesús de Miguel y su familia. Una muestra de respeto abrumadora por parte de ambos clubes, jueces y aficionados. Después de una de las ovaciones más largas y sentidas que se recuerdan, el pitido inicial descorchó al Celta, que salió mandón y aprovechó las rotaciones del Madrid. Alargó la primera posesión hasta provocar un córner, atrajo al rival a su campo y sorprendió con un pase de primeras de Ilaix cruzado, excelente. Marcó Pablo Durán, que disfruta a campo abierto en Chamartín, pero sirvió con precisión Williot Swedberg, que se consagró un año atrás en el estadio blanco. Irrumpió en el área como un turista, a espaldas de Trent, y sirvió un caramelo bajo las piernas de Huijsen. Sorpresa." },
      { id: "H", texto: "Tan discreto estuvo el Madrid que Mou puso a calentar a medio banquillo desde el minuto 22. Faltaba movimiento, especialmente sin balón, y por eso el Celta sufría poco. Pero bastó una pelota filtrada en el área para que Mbappé sacara un penalti. Se escurrió de Javi Rodríguez, que le enganchó del brazo. Dónde vas. Penaltito, sí, pero mucho menos que el de Santander. Adrián Cordero pitó, no corrigió el VAR y Kylian se dispuso a cobrar la pieza. Ahí entendió el Bernabéu que la noche no venía fácil. El 10 remató fuerte, centrado, engañando a Radu, arriba. Nada. Pese al arreón de Bellingham, el más inspirado con la pelota, al descanso con 0-1." }
    ],
    solucion: ["E", "B", "G", "D", "H", "A", "F", "C"]
  },
  as: {
    medio: "As",
    titulo: "Espí siempre llega a tiempo",
    subtitulo: "Otro gol del valenciano, a cinco minutos del final, salva a un Madrid que tiró un tiempo. A un buen Celta solo le falló la puntería. Mbappé erró un penalti.",
    cajas: ["Idea del titular", "Alineaciones comentadas (Madrid)", "Alineaciones comentadas (Celta)", "Desarrollo", "", "", "", "", "Final"],
    bloques: [
      { id: "A", texto: "En la segunda mitad al Celta se le vino el Madrid encima. Aquel equipo alegre y atrevido de los inicios quedó encogido en dos líneas amuralladas, estrechas para no hundirse demasiado. Sobre su área cayó mas lluvia fina que granizada, pero se vio realmente sometido, más cuando Mourinho activó el plan de emergencia: de un golpe metió a Valverde y Cucurella por los dos laterales y a Vinicius por Bernardo Silva, para abrir aún más el campo. Una acrobacia arriesgada, con tres puntas y dos mediapuntas para pasar por el ojo de la aguja." },
      { id: "B", texto: "Al Celta, al que le aguarda una paliza similar, no se le hizo tan largo el parón porque tuvo Copa en Salamanca la semana pasada. Allí jugó con lo que parecía una alineación alternativa que quizá no lo fuera tanto, porque cuatro de aquel once repitieron en el Bernabéu. En el equipo vigués importan menos los nombres que el plan. Los tres centrales le permiten escalonar mucho a sus futbolistas, maniobra útil para eludir la primera presión del adversario con cierta facilidad." },
      { id: "C", texto: "Aún faltaba la última carga, la de Carlos Espí, clavo ardiendo que tantas veces ha sujetado al equipo. Diez minutos para la locura, con cuatro delanteros y dos mediapuntas para descamisarse. Y una vez más el estado de excepción acabó en estado de felicidad. Espí cazó un cabezazo a centro de Vinicius, que sacó como pudo Radu para que el valenciano mandase a la red el rechace. Lo nunca visto en el Madrid es lo siempre visto." },
      { id: "D", texto: "Ante los ojos de Nadal, tan irreductible como el Madrid y que en el club siempre tuvo voz y ahora tiene voto, Carlos Espí completó otro curso de salvamento y socorrismo. A cinco minutos del final le dio el triunfo a un Madrid que arregló en medio tiempo lo que estropeó en el otro medio. Fue ante un Celta magnífico en la primera mitad y superviviente en la segunda. En cualquier caso, no fue el Madrid de las últimas semanas. Entregó mucho atrás, anduvo desmadejado en el inicio y poco preciso en el agitado final, cuando sintió que un empate en casa en esta Liga resulta entre grave y crítico. Sin embargo, bastaron el alboroto de Vinicius, que fue suplente, y el oportunismo recurrente de Carlos Espí para sacarle del apuro y cazar al Barça al menos por un día en la enésima remontada de un equipo que si algo sabe es corregirse." },
      { id: "E", texto: "Ese Madrid de luto se alargó, aunque hubo algún movimiento esperanzador de Diomande, que tiene la irreverencia y el optimismo que un día derrochó Vinicius. Casi le sirvió el empate a Bernardo Silva. Fue la primera prueba de vida del equipo blanco, que no tranquilizó a Mourinho. A los veinte minutos tenía ya tres suplentes calentando. Su situación pudo empeorarla por tres veces Williot, en una incursión por la izquierda que culminó con un cruce de centro y remate que no fue ni lo uno ni lo otro, sino pifia, en un tiro al lateral de la red sin rivales en tres metros a la redonda y en un mano a mano que perdió ante Courtois, que siempre aparece en los títulos de crédito. Los lances ponían sobre la mesa la extrema vulnerabilidad defensiva del Madrid tras cada pérdida. Lo denunciaron los primeros pitos del Bernabéu." },
      { id: "F", texto: "La previa del partido tenía su punto de morbo e intriga. La cosa andaba en si los cinco goles anotados con Brasil serían suficiente penitencia para que Vinicius volviera a un once del Madrid con toda la competencia apta. La cuestión ahora es si resuelve o incomoda. Mourinho habló en la víspera de que no existen intocables en el grupo y hasta ahí quiso leer. Suficiente. En los partidos de Champions, para los que Vinicius sí estaba disponible, anunció su titularidad con sobrada antelación. Que no lo dijera en esta ocasión despejaba de manera implícita la incógnita. El frente de ataque había estado impecable en los cuatro partidos ligueros sin él y a Mourinho le pareció razonable mantenerlo, especialmente porque pretendía reformar otras zonas más castigadas por la ventana FIFA. De esos intocables que el portugués desmiente se quedaron fuera Valverde, Cucurella y Tchouameni, decisión de riesgo porque sus relevos (Trent, Carreras y Camavinga) han estado muy lejos de ellos, pero explicable porque al Madrid le esperan ocho partidos en 29 días." },
      { id: "G", texto: "El paso adelante del equipo blanco le abrió una ventana de contragolpe al Celta, que volvió a tomar aire. Jutglá y Pablo Durán rondaron el 0-2. Como tantas veces, una parada de Courtois fue la antesala de un gol del Madrid. Lo marcó Bellingham, tras arrancada de Vinicius y con Mbappé como estación de paso." },
      { id: "H", texto: "Se lo explicó pronto al Madrid cuando un cambio de juego de Ilaix Moriba desmontó el tinglado defensivo blanco. El resto, hasta llegar al gol, fue tan preciso como sencillo: pase profundo de Javi Galán, desmarque y centro raso de Williot (verdugo de Xabi Alonso con su doblete en el mismo escenario hace menos de un año) y remate a placer de Pablo Durán. Los parones siempre interrumpen algo, un sueño en el caso del Madrid, que había encadenado ocho victorias en ocho partidos entre las dos ventanas FIFA. El regreso le cogió en frío. El gol, también, aunque se vio venir pronto. El equipo no atendió al aviso de Mourinho, que explicó con acierto que en el Celta, un grupo con aire juvenil y canterano, los méritos superaban con mucho a los puntos." },
      { id: "I", texto: "El peligro de los de Mourinho no respondía a una labor coral, sino a ocurrencias, de Arda Güler y Mbappé, principalmente. En una de ellas, Javi Rodríguez agarró mínimamente al francés cuando se disponía a disparar. Penalti justito, pero pitable, que Mbappé lanzó al corazón del fondo norte. El error resumía bien una primera mitad desganada y desacertada de su equipo frente a un Celta superior, que hizo el mejor fútbol y tuvo las mejores oportunidades. Se le marcharon y lo lamentó luego." }
    ],
    solucion: ["D", "F", "B", "H", "E", "I", "A", "G", "C"]
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

var ORDEN = Object.keys(CRONICAS);   // primero Marca, después As

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
