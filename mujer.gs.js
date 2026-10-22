/**
 * LA LIGUILLA DE LA MUJER INVISIBLE · servidor
 * Micromachismos de «La mujer invisible» (Caroline Criado Perez).
 * Todos contra todos, todos los partidos de la jornada a la vez y las mismas preguntas para todos.
 * Cada pregunta da un punto al equipo que acierta antes (20 segundos). Victoria 3, empate 1, derrota 0.
 * Al acabar cada jornada el juego se para hasta que la profesora pulsa la siguiente.
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 10;
var T_PREGUNTA = 20000;   // 20 segundos para responder
var T_EXPLICA = 10000;    // la explicación se queda 10 segundos en pantalla
var N_PREG = 5;           // preguntas por jornada
var COLORES = ["#C8102E","#1565C0","#2E7D32","#F9A825","#6A1B9A","#EF6C00","#00838F","#AD1457","#4E342E","#37474F"];

var BLOQUES = [
  { t: "La ciudad y el transporte", q: [
    { p: "En Karlskoga (Suecia), ¿por dónde empezaban a quitar la nieve?", o: ["Por las aceras y los carriles bici", "Por las grandes vías de la ciudad", "Por los alrededores de los colegios", "Por los accesos a los hospitales"], c: 1, e: "Se empezaba por las arterias principales y se acababa en los caminos peatonales, que son los que más usan las mujeres." },
    { p: "¿Qué parte de los usuarios del transporte público en Francia son mujeres?", o: ["Un tercio", "La mitad", "Dos tercios", "Tres cuartos"], c: 2, e: "Las mujeres van más a pie y en transporte público, y los hombres usan más el coche, también cuando la familia solo tiene uno." },
    { p: "¿Por qué muchas encuestas de movilidad dejan fuera los trayectos de las mujeres?", o: ["Porque solo preguntan al cabeza de familia", "Porque se hacen en horario laboral", "Porque no cuentan los trayectos cortos a pie", "Porque ellas responden menos"], c: 2, e: "Esos trayectos cortos se consideran poco importantes para las infraestructuras, y son justo los que hacen ellas al cuidar." },
    { p: "¿Verdadero o falso? Una funcionaria de Filadelfia tenía que vigilar una y otra vez que los constructores no pusieran las cocinas en un tercer piso sin ascensor.", o: ["Verdadero", "Falso"], c: 0, e: "«¿Quién quiere subir a cuestas las bolsas de la compra y los cochecitos hasta un tercer piso?», preguntaba." },
    { p: "Según los datos de la app SafeCity, ¿cuál es el acoso más común?", o: ["Los silbidos", "Los insultos", "Las miradas lascivas", "Los tocamientos"], c: 3, e: "Los tocamientos van por delante de los silbidos y pasan sobre todo en autobuses llenos." }
  ]},
  { t: "Los aseos", q: [
    { p: "¿Cuánto más tiempo pueden tardar las mujeres en usar el aseo?", o: ["1,2 veces", "1,5 veces", "2,3 veces", "4 veces"], c: 2, e: "Por eso dar el mismo número de cubículos tampoco resuelve las colas." },
    { p: "¿Por qué repartir el mismo espacio entre los dos aseos perjudica a las mujeres?", o: ["Porque en el mismo espacio caben más urinarios que cubículos", "Porque ellas van más en grupo", "Porque sus aseos se limpian menos", "Porque están peor señalizados"], c: 0, e: "Con urinarios, en cada metro cuadrado pueden entrar a la vez muchos más hombres." },
    { p: "Las mujeres tardan más en el aseo por varios motivos. ¿Cuál de estos cuatro NO aparece en el libro?", o: ["Que tienen la regla", "Que van más acompañadas de niños y mayores", "Que miran más el móvil", "Que hay más mujeres que hombres entre las personas mayores y con discapacidad"], c: 2, e: "El libro da los otros tres motivos, y entre el 20 y el 25 % de las mujeres en edad fértil pueden tener la regla en cualquier momento." },
    { p: "En el Barbican de Londres pusieron los rótulos «neutro con urinarios» y «neutro con cubículos». ¿Qué pasó?", o: ["Se acabaron las colas", "Los hombres usaban los dos y las mujeres solo los de cubículos", "Las mujeres empezaron a usar los urinarios", "Se cerraron por las quejas"], c: 1, e: "En la práctica se ampliaron los aseos de los hombres y las mujeres siguieron haciendo cola." },
    { p: "¿Qué faltaba en los aseos neutros con urinario del Barbican?", o: ["Espejos", "Contenedores higiénicos", "Cambiadores de bebé", "Secadores de manos"], c: 1, e: "Se llamaban neutros y estaban pensados solo para los hombres." }
  ]},
  { t: "La oficina y la casa", q: [
    { p: "¿En quién se basa la fórmula de la temperatura de las oficinas?", o: ["En la media de toda la plantilla", "En un hombre de 40 años y 70 kilos", "En una mujer de 30 años", "En un hombre de 25 años y 80 kilos"], c: 1, e: "La fórmula es de los años sesenta y nadie la ha revisado." },
    { p: "¿Cuántos grados de más frío pasan de media las mujeres en una oficina estándar?", o: ["1 grado", "3 grados", "5 grados", "8 grados"], c: 2, e: "De ahí la imagen de oficinistas tapadas con mantas en pleno verano." },
    { p: "La temperatura de las oficinas se calcula con el gasto de energía de un hombre medio. ¿Cuánto más alto es ese gasto que el de una mujer joven que trabaja en una oficina?", o: ["Un 10 %", "Un 20 %", "Hasta un 35 %", "Un 50 %"], c: 2, e: "Por eso la temperatura que sale es demasiado baja para ellas." },
    { p: "¿Qué pasó en Islandia el 24 de octubre de 1975, el «Viernes Largo»?", o: ["Una huelga general de transportes", "Las mujeres dejaron de trabajar y el país se paralizó", "Se aprobó el permiso de paternidad", "Una mujer ganó las elecciones"], c: 1, e: "Se agotaron las salchichas, las oficinas se llenaron de niños y cerraron colegios, guarderías y fábricas." },
    { p: "En las parejas ricas que pagan servicio doméstico, ¿qué pasa con el trabajo de casa que queda?", o: ["Se reparte a medias", "Lo hace sobre todo el hombre", "Se reparte con la misma desigualdad de siempre", "Prácticamente desaparece"], c: 2, e: "Ni pagando ayuda cambia el reparto, y las mujeres siguen haciendo casi todo lo que queda." }
  ]},
  { t: "La tecnología", q: [
    { p: "¿Cuánto más probable era que el reconocimiento de voz de Google entendiera bien a un hombre?", o: ["Un 10 %", "Un 30 %", "Un 70 %", "Un 150 %"], c: 2, e: "Y era el mejor del mercado. El fallo se nota también en el navegador del coche." },
    { p: "¿Qué se le olvidó a la app de salud «integral» de Apple en 2014?", o: ["Medir el sueño", "Medir la tensión", "El ciclo menstrual", "Contar los pasos"], c: 2, e: "Medía hasta la ingesta de cobre y molibdeno." },
    { p: "¿Qué no sabía encontrar Siri cuando salió?", o: ["Prostíbulos", "Proveedores de Viagra", "Hospitales", "Servicios de aborto"], c: 3, e: "Tampoco entendía la frase «me han violado», aunque sí sabía qué hacer con un infarto." },
    { p: "¿Cuánto mide de media un móvil actual, según el libro?", o: ["10 cm", "12 cm", "14 cm", "17 cm"], c: 2, e: "Un hombre lo usa con una mano, y a muchas mujeres no les cabe ni en la mano ni en el bolsillo." },
    { p: "¿Verdadero o falso? Existe un teclado de piano más pequeño (7/8) que elimina las desventajas de las pianistas, y casi no se usa.", o: ["Verdadero", "Falso"], c: 0, e: "El teclado estándar está hecho para manos grandes y causa más lesiones a las pianistas." }
  ]},
  { t: "La ropa de trabajo y los coches", q: [
    { p: "¿Cuánto mide el maniquí que más se usa en las pruebas de choque para probar los coches?", o: ["1,65 m", "1,70 m", "1,77 m", "1,85 m"], c: 2, e: "Pesa 76 kilos y tiene músculos y columna de hombre." },
    { p: "¿Hasta qué año no empezó Estados Unidos a usar maniquíes femeninos?", o: ["1985", "1999", "2011", "2020"], c: 2, e: "Ya a principios de los ochenta se propuso usar uno de mujer y no se hizo caso." },
    { p: "Si una mujer tiene un accidente de coche, ¿cuánto más probable es que sufra lesiones graves?", o: ["Un 10 %", "Un 25 %", "Un 47 %", "Un 90 %"], c: 2, e: "Y es un 17 % más probable que muera, aunque se tengan en cuenta la altura, el peso y el cinturón." },
    { p: "¿Por qué el mono de trabajo de una pieza es un problema para las guardacostas?", o: ["Abriga demasiado", "Para orinar tienen que quitarse todo el equipo", "No tiene bolsillos", "Es de un solo color"], c: 1, e: "La doble cremallera delantera está pensada para el cuerpo de un hombre." },
    { p: "¿Qué pasó cuando el ejército australiano redujo la zancada que exigía a las mujeres?", o: ["Bajó el rendimiento de las tropas", "Bajaron las fracturas de pelvis", "Se dejaron de admitir mujeres", "No cambió nada"], c: 1, e: "Antes las obligaban a marchar con la zancada de los hombres, que es entre un 9 y un 10 % más larga." }
  ]},
  { t: "La vida pública", q: [
    { p: "¿Cuántas veces interrumpió Trump a Hillary Clinton en un debate de 90 minutos?", o: ["17", "31", "51", "80"], c: 2, e: "Ella lo interrumpió 17 veces." },
    { p: "¿Cuánto más probable es que un hombre interrumpa a una mujer que al revés?", o: ["Un poco más", "El doble", "El triple", "Lo mismo"], c: 1, e: "Un estudio de 2015 concluyó que las mujeres son «el género más interrumpido»." },
    { p: "¿Cómo llamaron a Kamala Harris por interrogar con dureza a Jeff Sessions?", o: ["Valiente", "Histérica", "Maleducada", "Arrogante"], c: 1, e: "Sus compañeros lo interrogaron con la misma dureza y a ninguno se le dijo nada." },
    { p: "¿Qué porcentaje de legisladoras de EE. UU. creía que sus líderes consultaban antes a los hombres?", o: ["10 %", "25 %", "40 %", "60 %"], c: 2, e: "Entre los legisladores hombres solo lo pensaba el 17 %." },
    { p: "¿Qué hizo el productor de la serie The Shield al ver que a las guionistas no las dejaban hablar?", o: ["Puso cuotas", "Prohibió interrumpir a quien presentara una idea", "Hizo reuniones solo de mujeres", "Despidió a dos guionistas"], c: 1, e: "Funcionó, y según él todo el equipo trabajó mejor." }
  ]},
  { t: "El lenguaje y la cultura", q: [
    { p: "¿Quién usa más los emojis?", o: ["Los hombres", "Las mujeres", "Igual unos que otras", "No hay datos"], c: 1, e: "El 78 % de las mujeres los usa con frecuencia, frente al 60 % de los hombres, y aun así hasta 2016 casi todos eran masculinos." },
    { p: "¿Verdadero o falso? En Reino Unido hay más estatuas de hombres llamados John que de mujeres históricas que no son de la realeza.", o: ["Verdadero", "Falso"], c: 0, e: "Las de mujeres de la realeza solo ganan gracias a la reina Victoria." },
    { p: "¿Qué porcentaje de las personas que salen en las noticias de prensa, radio y televisión de todo el mundo son mujeres?", o: ["12 %", "24 %", "37 %", "45 %"], c: 1, e: "Es exactamente el mismo dato que en 2010." },
    { p: "En los libros de texto de gramática de países como España o Estados Unidos, ¿cuántos hombres aparecen en los ejemplos por cada mujer?", o: ["Uno", "Dos", "Tres", "Diez"], c: 2, e: "Lo confirman treinta años de estudios en Alemania, Estados Unidos, Australia y España." },
    { p: "Cuando Andy Murray ganó Wimbledon en 2013, se dijo que acababa con 77 años de espera. ¿Qué se olvidó?", o: ["Que Virginia Wade había ganado en 1977", "Que el torneo no se jugó en la guerra", "Que era escocés", "Que había perdido la final anterior"], c: 0, e: "Murray sí corrigió a un periodista que lo llamó el primero en ganar dos oros olímpicos, recordándole a Venus y Serena." }
  ]},
  { t: "El trabajo", q: [
    { p: "En las evaluaciones de rendimiento, ¿qué calificativo apareció también en las de los hombres?", o: ["Mandón", "Emotivo", "Agresivo", "Estridente"], c: 2, e: "Salió dos veces, y en las dos era para pedirles que lo fueran más." },
    { p: "¿Qué pasó en la Filarmónica de Nueva York al hacer las audiciones detrás de una pantalla?", o: ["Nada", "Las mujeres llegaron a ser la mitad de las nuevas contrataciones", "Se contrató a menos gente", "Bajó el nivel"], c: 1, e: "Hoy más del 45 % de los músicos de esa orquesta son mujeres." },
    { p: "¿Qué palabra aparece más en las cartas de recomendación de las mujeres?", o: ["Excepcional", "Notable", "Ambiciosa", "Trabajadora"], c: 3, e: "A ellos se los describe como ambiciosos y seguros, y a ellas como cordiales y cariñosas." },
    { p: "¿Qué les pasa a las mujeres que se niegan a tomar notas o hacer el café en la oficina?", o: ["Nada", "Las llaman «antipáticas»", "Las ascienden", "Les bajan el sueldo"], c: 1, e: "Por eso acaban aceptando esas tareas, que no cuentan para ascender." },
    { p: "¿Verdadero o falso? Los alumnos de biología veían más listos a sus compañeros que a las alumnas con mejores notas.", o: ["Verdadero", "Falso"], c: 0, e: "Las alumnas valoraban a sus compañeros según lo que rendían de verdad. El libro lo llama sesgo de brillantez." }
  ]},
  { t: "La medicina", q: [
    { p: "¿Cuántas mujeres que sufren un infarto sienten el dolor de pecho «clásico»?", o: ["Una de cada ocho", "Una de cada cuatro", "La mitad", "Tres de cada cuatro"], c: 0, e: "Por eso sus síntomas se llaman «atípicos» y el infarto se les diagnostica tarde." },
    { p: "¿Qué es el síndrome de Yentl?", o: ["Una alergia más común en mujeres", "Que las diagnostican mal salvo que sus síntomas se parezcan a los de los hombres", "El miedo a ir al médico", "Un efecto secundario de la píldora"], c: 1, e: "Viene de la película en la que Barbra Streisand se hace pasar por hombre para poder estudiar." },
    { p: "¿Qué decidió la FDA en 1977 tras el escándalo de la talidomida?", o: ["Prohibir los fármacos para embarazadas", "Excluir de los ensayos a las mujeres en edad fértil", "Exigir ensayos con tantas mujeres como hombres", "Retirar todos los somníferos"], c: 1, e: "Nadie cuestionó que el hombre siguiera siendo la norma de los ensayos." },
    { p: "¿Por qué a muchas mujeres con angina las mandan a casa diciendo que no tienen nada?", o: ["Porque mienten", "Porque el angiograma busca arterias obstruidas y ellas no suelen tenerlas", "Porque no hay camas", "Porque llegan tarde"], c: 1, e: "Hay casos de mujeres con angiograma «normal» que sufrieron un infarto poco después del alta." },
    { p: "¿De qué palabra griega viene «histérica»?", o: ["Nervio", "Matriz", "Locura", "Llanto"], c: 1, e: "Hystera significa matriz, y la idea viene de los antiguos griegos." }
  ]}
];

function doGet(e)  { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true });
    if (p.a === "state") { var g0 = liga(p.c); avanzar(g0); return salida(vista(g0, p.t)); }
    if (!ACCIONES[p.a]) return salida({ error: "Acción desconocida" });
    return salida(ACCIONES[p.a](p));
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

// ── almacenamiento ──
function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(g) { P.setProperty("L_" + g.code, JSON.stringify(g)); }
function liga(c) {
  var g = leer("L_" + cod(c));
  if (!g) throw new Error("No existe ninguna liguilla con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now();
  for (var k in todo) {
    if (k.indexOf("L_") !== 0) continue;
    try { var g = JSON.parse(todo[k]); if (ahora - g.created > 3 * 24 * 3600 * 1000) P.deleteProperty(k); } catch (x) {}
  }
}

// Calendario de todos contra todos (método del círculo). Con número impar, uno descansa.
function calendario(ids) {
  var t = ids.slice();
  if (t.length % 2) t.push(null);
  var n = t.length, rondas = [];
  for (var r = 0; r < n - 1; r++) {
    var ronda = [];
    for (var i = 0; i < n / 2; i++) {
      var a = t[i], b = t[n - 1 - i];
      ronda.push(r % 2 ? [b, a] : [a, b]);
    }
    rondas.push(ronda);
    t.splice(1, 0, t.pop());
  }
  return rondas;
}

function todas() {
  var out = [];
  BLOQUES.forEach(function (b, bi) { b.q.forEach(function (q, qi) { out.push([bi, qi]); }); });
  return out;
}
function barajar(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

// Preguntas ya usadas en partidas anteriores. No vuelven a salir hasta que se acaba el banco.
function cicloLeer() { try { return JSON.parse(P.getProperty("CICLO") || "[]"); } catch (x) { return []; } }
function cicloSumar(lista) {
  var total = todas().length, c = cicloLeer();
  (lista || []).forEach(function (r) {
    var k = Array.isArray(r) ? r[0] + "_" + r[1] : String(r);
    var bq = k.split("_");
    if (BLOQUES[+bq[0]] && BLOQUES[+bq[0]].q[+bq[1]] && c.indexOf(k) < 0) c.push(k);
  });
  if (c.length >= total) c = [];
  P.setProperty("CICLO", JSON.stringify(c));
}

// Plan de preguntas: con 9 jornadas, un bloque por jornada; con menos, todos los bloques mezclados,
// primero las que no han salido en otras partidas.
function plan(nJornadas) {
  if (nJornadas >= BLOQUES.length) {
    return BLOQUES.map(function (b, bi) { return b.q.map(function (x, qi) { return [bi, qi]; }); });
  }
  var ciclo = cicloLeer(), need = nJornadas * N_PREG;
  var orden = barajar(BLOQUES.map(function (b, bi) { return bi; }));
  var nuevas = BLOQUES.map(function (b, bi) { return barajar(b.q.map(function (x, qi) { return qi; }).filter(function (qi) { return ciclo.indexOf(bi + "_" + qi) < 0; })); });
  var viejas = BLOQUES.map(function (b, bi) { return barajar(b.q.map(function (x, qi) { return qi; }).filter(function (qi) { return ciclo.indexOf(bi + "_" + qi) >= 0; })); });
  var lista = [];
  [nuevas, viejas].forEach(function (fuente) {
    var hay = true;
    while (lista.length < need && hay) {
      hay = false;
      orden.forEach(function (bi) { if (lista.length < need && fuente[bi].length) { lista.push([bi, fuente[bi].shift()]); hay = true; } });
    }
  });
  var out = [];
  for (var r = 0; r < nJornadas; r++) out.push(lista.slice(r * N_PREG, (r + 1) * N_PREG));
  return out;
}
function preguntaActual(g) {
  var ref = g.jq[g.q];
  return ref ? BLOQUES[ref[0]].q[ref[1]] : null;
}
function enJuego(g) {
  if (g.final) return g.final.vivos.slice();
  var ids = [];
  g.matches.forEach(function (m) { if (m.r === g.round && !m.closed) { ids.push(m.a); ids.push(m.b); } });
  return ids;
}

// Resuelve la pregunta: el punto es para quien acierta antes.
function resolver(g) {
  var q = preguntaActual(g);
  if (g.final) {
    var F = g.final, mejor = null, info = {};
    F.vivos.forEach(function (id) {
      var r = g.ans[id], ok = !!(r && r.o === q.c);
      info[id] = { ok: ok, t: r ? r.t : null };
      if (ok && (!mejor || r.t < g.ans[mejor].t)) mejor = id;
    });
    if (mejor) F.pts[mejor]++;
    F.h.push({ w: mejor || "-", info: info });
  } else {
    g.matches.forEach(function (m) {
      if (m.r !== g.round || m.closed) return;
      var A = g.ans[m.a], B = g.ans[m.b];
      var okA = A && A.o === q.c, okB = B && B.o === q.c;
      var gana = "-";
      if (okA && okB) gana = A.t <= B.t ? "a" : "b";
      else if (okA) gana = "a";
      else if (okB) gana = "b";
      if (gana === "a") m.sa++;
      if (gana === "b") m.sb++;
      m.h.push({ w: gana, ta: A ? A.t : null, tb: B ? B.t : null, oa: !!okA, ob: !!okB });
    });
  }
  g.phase = "rev"; g.revStart = Date.now();
}

// Pasa a la pregunta siguiente o cierra la jornada.
function siguiente(g) {
  g.ans = {};
  if (g.final) {
    var F = g.final;
    if (g.q + 1 >= g.jq.length) {
      var max = -1; F.vivos.forEach(function (id) { if (F.pts[id] > max) max = F.pts[id]; });
      var lideres = F.vivos.filter(function (id) { return F.pts[id] === max; });
      if (lideres.length === 1) { g.champ = lideres[0]; g.phase = "jfin"; g.status = "over"; return; }
      // siguen empatados: solo juegan los que van primeros, una pregunta más a muerte súbita
      F.vivos = lideres;
      var ex = extra(g); g.jq.push(ex); cicloSumar([ex]);
      g.sudden = true;
    }
  } else if (g.q + 1 >= g.jq.length) {
    g.matches.forEach(function (m) { if (m.r === g.round) m.closed = true; });
    g.phase = "jfin";
    if (g.round + 1 >= g.rounds.length) g.status = "over";
    return;
  }
  g.q++; g.phase = "q"; g.qStart = Date.now();
}
function extra(g) {
  var usadas = {};
  (g.usadas || []).concat(g.jq).forEach(function (r) { usadas[r[0] + "_" + r[1]] = 1; });
  var libres = todas().filter(function (r) { return !usadas[r[0] + "_" + r[1]]; });
  if (!libres.length) libres = todas().filter(function (r) { return g.jq.every(function (x) { return x[0] !== r[0] || x[1] !== r[1]; }); });
  if (!libres.length) libres = todas();
  return libres[Math.floor(Math.random() * libres.length)];
}

// Avanza las fases según el reloj cada vez que alguien consulta el estado.
function avanzar(g) {
  var cambia = false, ahora = Date.now();
  for (var vueltas = 0; vueltas < 3; vueltas++) {
    if (g.phase === "q") {
      var ids = enJuego(g), todos = ids.length > 0 && ids.every(function (id) { return g.ans[id]; });
      if (todos || ahora >= g.qStart + T_PREGUNTA) { resolver(g); cambia = true; continue; }
    }
    if (g.phase === "rev" && !g.paused && ahora >= g.revStart + T_EXPLICA) { siguiente(g); cambia = true; continue; }
    break;
  }
  if (cambia) guardar(g);
}

// Lo que ve cada pantalla: la respuesta buena solo después de cerrar la pregunta.
function vista(g, t) {
  var c = JSON.parse(JSON.stringify(g));
  delete c.admin; delete c.jq; delete c.plan; delete c.usadas;
  c.now = Date.now();
  c.T_PREGUNTA = T_PREGUNTA; c.T_EXPLICA = T_EXPLICA;
  c.bloques = BLOQUES.map(function (b) { return b.t; });
  c.nq = g.jq ? g.jq.length : 0;
  c.mezcla = g.rounds.length > 0 && g.rounds.length < BLOQUES.length;
  var ref = g.jq ? g.jq[g.q] : null, q = g.jq ? preguntaActual(g) : null;
  if (q && (g.phase === "q" || g.phase === "rev")) {
    c.pregunta = { p: q.p, o: q.o, b: BLOQUES[ref[0]].t };
    if (g.phase === "rev") { c.pregunta.c = q.c; c.pregunta.e = q.e; }
  }
  c.respondidos = Object.keys(g.ans || {});
  c.ciclo = cicloLeer();
  if (g.phase === "q") {
    c.ans = {};
    if (t && g.ans[t]) c.ans[t] = g.ans[t];
  }
  c.ok = true;
  return c;
}

var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    // la pantalla del proyector manda las preguntas que recuerda de otras partidas
    if (p && p.prev && p.prev.length) cicloSumar(p.prev);
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do {
      code = "";
      for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length));
    } while (P.getProperty("L_" + code));
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      status: "lobby", teams: [], rounds: [], round: -1, phase: "idle",
      q: 0, jq: [], plan: [], usadas: [], ans: {}, matches: [], paused: false, final: null, champ: null, created: Date.now()
    };
    guardar(g);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = liga(p.c);
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 24);
    if (!nombre) throw new Error("Escribe el nombre de vuestro equipo");
    for (var i = 0; i < g.teams.length; i++) if (g.teams[i].name.toLowerCase() === nombre.toLowerCase()) return { ok: true, team: g.teams[i] };
    if (g.status !== "lobby") throw new Error("La liguilla ya ha empezado y no admite equipos nuevos");
    if (g.teams.length >= MAX_EQUIPOS) throw new Error("La liguilla ya tiene " + MAX_EQUIPOS + " equipos, que es el máximo");
    var usados = g.teams.map(function (e) { return e.color; });
    var color = COLORES.filter(function (c) { return usados.indexOf(c) < 0; })[0] || COLORES[0];
    var e = { id: "e" + Date.now().toString(36) + Math.floor(Math.random() * 99), name: nombre, color: color };
    g.teams.push(e);
    guardar(g);
    return { ok: true, team: e };
  },

  "kick": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "lobby") throw new Error("Solo se pueden quitar equipos antes de empezar");
    g.teams = g.teams.filter(function (e) { return e.id !== p.t; });
    guardar(g);
    return { ok: true };
  },

  "start": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "lobby") return { ok: true };
    if (g.teams.length < 2) throw new Error("Hacen falta al menos dos equipos");
    var ids = barajar(g.teams.map(function (e) { return e.id; }));
    g.rounds = calendario(ids);
    g.plan = plan(g.rounds.length);
    g.status = "league";
    guardar(g);
    return { ok: true };
  },

  // Empieza la jornada siguiente con sus 5 preguntas.
  "round": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "league") throw new Error("La liguilla no está en marcha");
    if (g.phase === "q" || g.phase === "rev") throw new Error("La jornada todavía está en juego");
    if (g.round + 1 >= g.rounds.length) throw new Error("Ya se han jugado todas las jornadas");
    g.round++;
    var r = g.round;
    g.rounds[r].forEach(function (par, i) {
      if (!par[0] || !par[1]) return;
      g.matches.push({ r: r, i: i, a: par[0], b: par[1], sa: 0, sb: 0, h: [], closed: false });
    });
    g.jq = g.plan[r].slice();
    g.usadas = (g.usadas || []).concat(g.jq);
    cicloSumar(g.jq);
    g.q = 0; g.ans = {}; g.phase = "q"; g.qStart = Date.now(); g.paused = false;
    guardar(g);
    return { ok: true };
  },

  // Respuesta de un equipo: solo vale la primera y dentro de los 20 segundos.
  "ans": function (p) {
    var g = liga(p.c); avanzar(g);
    if (g.phase !== "q" || parseInt(p.q, 10) !== g.q) return { ok: true, late: true };
    if (enJuego(g).indexOf(p.t) < 0) throw new Error("Ahora no os toca jugar");
    if (g.ans[p.t]) return { ok: true };
    var o = parseInt(p.o, 10), q = preguntaActual(g);
    if (!(o >= 0 && o < q.o.length)) throw new Error("Respuesta no válida");
    var t = Date.now() - g.qStart;
    if (t > T_PREGUNTA) return { ok: true, late: true };
    g.ans[p.t] = { o: o, t: t };
    avanzar(g);
    guardar(g);
    return { ok: true };
  },

  // Botones de la profesora durante la explicación.
  "pause": function (p) {
    var g = liga(p.c); admin(g, p.k); avanzar(g);
    if (g.phase !== "rev") return { ok: true };
    g.paused = !g.paused;
    if (!g.paused) g.revStart = Date.now() - T_EXPLICA + 4000;   // al reanudar quedan 4 segundos
    guardar(g);
    return { ok: true };
  },
  "next": function (p) {
    var g = liga(p.c); admin(g, p.k); avanzar(g);
    if (g.phase === "rev") { g.paused = false; siguiente(g); guardar(g); }
    else if (g.phase === "q") { resolver(g); guardar(g); }
    return { ok: true };
  },

  // Desempate entre todos los equipos que acaban empatados en cabeza.
  "final": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "over" || g.champ || g.final) throw new Error("No hay desempate pendiente");
    var ids = g.teams.map(function (e) { return e.id; });
    var lista = String(p.ids || "").split(",").filter(function (x) { return ids.indexOf(x) >= 0; });
    if (lista.length < 2) throw new Error("Hacen falta al menos dos equipos para el desempate");
    var pts = {}; lista.forEach(function (id) { pts[id] = 0; });
    g.final = { teams: lista, vivos: lista.slice(), pts: pts, h: [] };
    g.status = "final";
    g.round = g.rounds.length;
    var usadas = {}; (g.usadas || []).forEach(function (r) { usadas[r[0] + "_" + r[1]] = 1; });
    var libres = barajar(todas().filter(function (r) { return !usadas[r[0] + "_" + r[1]]; }));
    var resto = barajar(todas().filter(function (r) { return usadas[r[0] + "_" + r[1]]; }));
    g.jq = libres.concat(resto).slice(0, N_PREG);
    cicloSumar(g.jq);
    g.q = 0; g.ans = {}; g.phase = "q"; g.qStart = Date.now(); g.paused = false; g.sudden = false;
    guardar(g);
    return { ok: true };
  },

  "end": function (p) {
    var g = liga(p.c); admin(g, p.k);
    g.matches.forEach(function (m) { m.closed = true; });
    g.status = "over"; g.phase = "jfin";
    guardar(g);
    return { ok: true };
  }
};
