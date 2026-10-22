/**
 * LA LIGUILLA SIN PRUEBAS · servidor (v2)
 * Todos contra todos. Cada jornada es de preguntas o de penaltis.
 * En las jornadas de preguntas todos los partidos ven la misma pregunta a la vez en el proyector y en los móviles,
 * y el gol es para el equipo que acierta antes (20 segundos por pregunta).
 * Los penaltis son al mejor de 5, con muerte súbita si hay empate.
 * Las preguntas no se repiten de una partida a otra hasta que se han usado todas las del banco.
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 12;
var T_PREGUNTA = 20000;   // 20 segundos para responder
var T_REV = 6000;         // la respuesta buena se queda 6 segundos en pantalla
var COLORES = ["#C8102E","#1565C0","#2E7D32","#F9A825","#6A1B9A","#EF6C00","#00838F","#AD1457","#4E342E","#37474F","#558B2F","#5D4037"];
var BANCO = [{"id": "N06", "cat": "Noticias", "q": "¿Cuántos Mundiales masculinos de fútbol tiene ya España? (escribe el número)", "r": ["2", "dos"], "s": "Dos"}, {"id": "N07", "cat": "Noticias", "q": "¿Quién es el seleccionador de España campeón del mundo en 2026?", "o": ["Luis de la Fuente", "Vicente del Bosque", "Luis Enrique", "Julen Lopetegui"], "c": 0}, {"id": "N40", "cat": "Noticias", "q": "¿Quién es el seleccionador español sub-21?", "o": ["David Gordo", "Santi Denia", "Julen Lopetegui", "Luis de la Fuente"], "c": 0}, {"id": "N41", "cat": "Noticias", "q": "¿Quién es la seleccionadora de la selección española femenina?", "o": ["Sonia Bermúdez", "Montse Tomé", "Jorge Vilda", "Iraia Iturregi"], "c": 0}, {"id": "N42", "cat": "Noticias", "q": "¿Cuál es el apellido del seleccionador español de baloncesto? (Chus...)", "r": ["Mateo", "Chus Mateo"], "s": "Chus Mateo"}, {"id": "N43", "cat": "Noticias", "q": "¿Quién es el entrenador de Carlos Alcaraz?", "o": ["Samuel López", "Juan Carlos Ferrero", "Toni Nadal", "Carlos Moyá"], "c": 0}, {"id": "N44", "cat": "Noticias", "q": "¿Quién entrena al Málaga CF?", "o": ["Juan Francisco Funes", "Sergio Pellicer", "Pepe Mel", "Rubén Baraja"], "c": 0}, {"id": "N45", "cat": "Noticias", "q": "¿Quién entrena al Deportivo de La Coruña?", "o": ["Antonio Hidalgo", "Imanol Idiakez", "Óscar Gilsanz", "Rubén de la Barrera"], "c": 0}, {"id": "N46", "cat": "Noticias", "q": "¿Cuál es el apellido del entrenador del Valencia CF? (Javier «El Vasco»...)", "r": ["Aguirre", "Javier Aguirre"], "s": "Javier Aguirre"}, {"id": "N47", "cat": "Noticias", "q": "¿Quién entrena al Racing de Santander?", "o": ["José Alberto López", "José Luis Oltra", "Guillermo Fernández Romo", "Paco Jémez"], "c": 0}, {"id": "N48", "cat": "Noticias", "q": "¿Quién entrena al Real Madrid de baloncesto?", "o": ["Pedro Martínez", "Chus Mateo", "Pablo Laso", "Sergio Scariolo"], "c": 0}, {"id": "N49", "cat": "Noticias", "q": "¿Quién entrena al Barça de baloncesto?", "o": ["Aleksander Sekulic", "Joan Peñarroya", "Sarunas Jasikevicius", "Roger Grimau"], "c": 0}, {"id": "N50", "cat": "Noticias", "q": "¿Quién entrena al Barça femenino?", "o": ["Pere Romeu", "Jonatan Giráldez", "Lluís Cortés", "Sonia Bermúdez"], "c": 0}, {"id": "N51", "cat": "Noticias", "q": "¿Quién entrena al Real Madrid femenino?", "o": ["Pau Quesada", "Alberto Toril", "David Aznar", "Pere Romeu"], "c": 0}, {"id": "N52", "cat": "Noticias", "q": "¿Quién narra el ciclismo en Televisión Española?", "o": ["Carlos de Andrés", "Javier Ares", "Antonio Alix", "Juanma Castaño"], "c": 0}, {"id": "N53", "cat": "Noticias", "q": "¿Cuál es el apellido del narrador de fútbol de Movistar Plus+ que se llama Carlos?", "r": ["Martinez", "Carlos Martinez"], "s": "Carlos Martínez"}, {"id": "N32", "cat": "Noticias", "q": "¿En qué equipo juega Aubameyang, que se ha lesionado de la rodilla?", "o": ["Deportivo", "Olympique de Marsella", "Sevilla", "Barça"], "c": 0}, {"id": "N33", "cat": "Noticias", "q": "¿Cuál es el apellido del presidente de LaLiga?", "r": ["Tebas", "Javier Tebas"], "s": "Javier Tebas"}, {"id": "N15", "cat": "Noticias", "q": "¿Qué equipo ganó la Champions League 2026?", "o": ["PSG", "Arsenal", "Real Madrid", "Bayern de Múnich"], "c": 0}, {"id": "N16", "cat": "Noticias", "q": "¿Cómo se decidió la final de la Champions 2026 entre PSG y Arsenal?", "o": ["En la tanda de penaltis", "En los 90 minutos", "En la prórroga, sin penaltis", "Con un gol de oro"], "c": 0}, {"id": "H01", "cat": "Historia", "q": "¿Dónde ganó España su primer Mundial de fútbol?", "o": ["Sudáfrica 2010", "Alemania 2006", "Brasil 2014", "Corea y Japón 2002"], "c": 0}, {"id": "H02", "cat": "Historia", "q": "¿Quién marcó el gol de la final del Mundial 2010? (apellido)", "r": ["Iniesta", "Andres Iniesta"], "s": "Andrés Iniesta"}, {"id": "H03", "cat": "Historia", "q": "¿Contra quién ganó España la final del Mundial 2010?", "o": ["Países Bajos", "Alemania", "Italia", "Portugal"], "c": 0}, {"id": "H04", "cat": "Historia", "q": "¿Qué selección ganó la Eurocopa 2024?", "o": ["España", "Inglaterra", "Francia", "Alemania"], "c": 0}, {"id": "H05", "cat": "Historia", "q": "¿Qué selección ganó el Mundial femenino de 2023?", "o": ["España", "Inglaterra", "Estados Unidos", "Suecia"], "c": 0}, {"id": "H06", "cat": "Historia", "q": "¿Quién marcó el gol de España en la final del Mundial femenino 2023? (apellido)", "r": ["Carmona", "Olga Carmona"], "s": "Olga Carmona"}, {"id": "H07", "cat": "Historia", "q": "¿En qué país se jugó el primer Mundial, en 1930?", "r": ["Uruguay"], "s": "Uruguay"}, {"id": "H08", "cat": "Historia", "q": "¿En qué año se celebraron los Juegos Olímpicos de Barcelona?", "r": ["1992", "92"], "s": "1992"}, {"id": "H09", "cat": "Historia", "q": "¿Cómo se llamaba la mascota de los Juegos de Barcelona 92?", "r": ["Cobi"], "s": "Cobi"}, {"id": "H10", "cat": "Historia", "q": "¿Cómo se llamaba la mascota del Mundial de España 1982?", "o": ["Naranjito", "Cobi", "Curro", "Pique"], "c": 0}, {"id": "H11", "cat": "Historia", "q": "¿Con qué países organizará España el Mundial 2030?", "o": ["Portugal y Marruecos", "Francia e Italia", "Portugal y Argelia", "Marruecos y Túnez"], "c": 0}, {"id": "H12", "cat": "Historia", "q": "¿Dónde se celebrarán los Juegos Olímpicos de 2028?", "o": ["Los Ángeles", "Brisbane", "París", "Madrid"], "c": 0}, {"id": "H13", "cat": "Historia", "q": "¿Contra qué selección marcó Maradona la «mano de Dios» en México 86?", "o": ["Inglaterra", "Alemania", "Italia", "Bélgica"], "c": 0}, {"id": "H14", "cat": "Historia", "q": "¿En qué Mundial se usó el VAR por primera vez?", "o": ["Rusia 2018", "Brasil 2014", "Catar 2022", "Sudáfrica 2010"], "c": 0}, {"id": "H15", "cat": "Historia", "q": "¿Cuántas Champions (Copas de Europa) tiene el Real Madrid? (escribe el número)", "r": ["15", "quince"], "s": "15"}, {"id": "H16", "cat": "Historia", "q": "¿Quién gritó «¡Iniesta de mi vida!» en la final de 2010?", "o": ["José Antonio Camacho", "Andrés Montes", "José María García", "Manolo Lama"], "c": 0}, {"id": "H17", "cat": "Historia", "q": "¿Qué periodista popularizó la expresión «tiki-taka»?", "o": ["Andrés Montes", "José Ramón de la Morena", "Josep Pedrerol", "Paco González"], "c": 0}, {"id": "H20", "cat": "Historia", "q": "¿Qué selección tiene más Mundiales de fútbol?", "r": ["Brasil"], "s": "Brasil"}, {"id": "H21", "cat": "Historia", "q": "¿En qué equipo debutó Pau Gasol en la NBA?", "o": ["Memphis Grizzlies", "Los Angeles Lakers", "San Antonio Spurs", "Chicago Bulls"], "c": 0}, {"id": "H19", "cat": "Historia", "q": "¿Cuánto mide una maratón?", "o": ["42,195 km", "40 km", "21,097 km", "50 km"], "c": 0}, {"id": "D01", "cat": "Deportistas", "q": "¿Cuántos Roland Garros ganó Rafa Nadal? (escribe el número)", "r": ["14", "catorce"], "s": "14"}, {"id": "D02", "cat": "Deportistas", "q": "¿Dónde se retiró Rafa Nadal, en noviembre de 2024?", "o": ["En la Copa Davis de Málaga", "En Roland Garros", "En el Open de Madrid", "En Wimbledon"], "c": 0}, {"id": "D03", "cat": "Deportistas", "q": "¿Cuántos Tours de Francia seguidos ganó Miguel Induráin?", "o": ["Cinco", "Tres", "Cuatro", "Siete"], "c": 0}, {"id": "D04", "cat": "Deportistas", "q": "¿Con qué escudería fue Fernando Alonso campeón del mundo de Fórmula 1?", "o": ["Renault", "Ferrari", "McLaren", "Aston Martin"], "c": 0}, {"id": "D05", "cat": "Deportistas", "q": "¿Cuántos anillos de la NBA ganó Pau Gasol?", "o": ["Dos", "Uno", "Tres", "Ninguno"], "c": 0}, {"id": "D06", "cat": "Deportistas", "q": "¿En qué deporte fue campeona olímpica Carolina Marín?", "r": ["badminton"], "s": "Bádminton"}, {"id": "D07", "cat": "Deportistas", "q": "¿Cuántos Balones de Oro ganó Alexia Putellas?", "o": ["Dos", "Uno", "Tres", "Cuatro"], "c": 0}, {"id": "D08", "cat": "Deportistas", "q": "¿Quién ganó el Balón de Oro femenino en 2023, 2024 y 2025?", "o": ["Aitana Bonmatí", "Alexia Putellas", "Salma Paralluelo", "Sam Kerr"], "c": 0}, {"id": "D09", "cat": "Deportistas", "q": "¿Cuántos Balones de Oro tiene Leo Messi? (escribe el número)", "r": ["8", "ocho"], "s": "Ocho"}, {"id": "D10", "cat": "Deportistas", "q": "¿Quién tiene el récord mundial de los 100 metros lisos (9,58)? (apellido)", "r": ["Bolt", "Usain Bolt"], "s": "Usain Bolt"}, {"id": "D12", "cat": "Deportistas", "q": "¿Cuántos Mundiales ganó Pelé?", "o": ["Tres", "Dos", "Uno", "Cuatro"], "c": 0}, {"id": "D13", "cat": "Deportistas", "q": "¿Cuántos anillos de la NBA ganó Michael Jordan con los Bulls?", "o": ["Seis", "Cinco", "Cuatro", "Siete"], "c": 0}, {"id": "D14", "cat": "Deportistas", "q": "¿Qué Grand Slam ganó Carlos Alcaraz en 2022, el primero de su carrera?", "o": ["US Open", "Wimbledon", "Roland Garros", "Open de Australia"], "c": 0}, {"id": "D15", "cat": "Deportistas", "q": "¿En qué deporte destaca Kilian Jornet?", "o": ["Carreras de montaña", "Esquí de fondo", "Escalada en roca", "Triatlón"], "c": 0}, {"id": "D16", "cat": "Deportistas", "q": "¿En qué deporte ganó Saúl Craviotto sus medallas olímpicas?", "o": ["Piragüismo", "Remo", "Vela", "Natación"], "c": 0}, {"id": "D17", "cat": "Deportistas", "q": "¿Qué golfista español ganó el Masters de Augusta en 2023? (apellido)", "r": ["Rahm", "Jon Rahm"], "s": "Jon Rahm"}, {"id": "D18", "cat": "Deportistas", "q": "¿En qué prueba fue campeón olímpico Fermín Cacho en Barcelona 92?", "o": ["1.500 metros", "Maratón", "800 metros", "5.000 metros"], "c": 0}, {"id": "D19", "cat": "Deportistas", "q": "¿Qué nadadora española fue campeona olímpica de 200 mariposa en Río 2016?", "o": ["Mireia Belmonte", "Teresa Perales", "Ona Carbonell", "Gemma Mengual"], "c": 0}, {"id": "D20", "cat": "Deportistas", "q": "¿Cuál es el apellido del presentador de «El Chiringuito de Jugones»?", "r": ["Pedrerol", "Josep Pedrerol"], "s": "Josep Pedrerol"}, {"id": "R01", "cat": "Reglas", "q": "¿Cuántos jugadores tiene en el campo cada equipo de balonmano?", "o": ["Siete", "Seis", "Cinco", "Once"], "c": 0}, {"id": "R02", "cat": "Reglas", "q": "¿Cuántos jugadores tiene en pista cada equipo de voleibol?", "o": ["Seis", "Cinco", "Siete", "Cuatro"], "c": 0}, {"id": "R03", "cat": "Reglas", "q": "¿Sobre qué superficie se juega Wimbledon?", "r": ["hierba", "cesped"], "s": "Hierba"}, {"id": "R04", "cat": "Reglas", "q": "¿De qué color es el maillot del líder de la Vuelta a España?", "r": ["rojo"], "s": "Rojo"}, {"id": "R05", "cat": "Reglas", "q": "¿De qué color es el maillot del líder del Giro de Italia?", "r": ["rosa"], "s": "Rosa"}, {"id": "R06", "cat": "Reglas", "q": "¿Cuántos puntos vale un ensayo en rugby?", "o": ["Cinco", "Tres", "Siete", "Dos"], "c": 0}, {"id": "R07", "cat": "Reglas", "q": "¿Cuántos torneos forman el Grand Slam de tenis?", "o": ["Cuatro", "Tres", "Cinco", "Seis"], "c": 0}, {"id": "R08", "cat": "Reglas", "q": "¿Cuánto dura un partido de baloncesto FIBA sin prórroga?", "o": ["40 minutos", "48 minutos", "60 minutos", "36 minutos"], "c": 0}, {"id": "R09", "cat": "Reglas", "q": "¿Cuántos jugadores tiene en el agua cada equipo de waterpolo?", "o": ["Siete", "Seis", "Cinco", "Ocho"], "c": 0}, {"id": "R10", "cat": "Reglas", "q": "¿Qué deporte se juega con «stick» y una pelota pequeña sobre hierba artificial?", "r": ["hockey", "hockey hierba"], "s": "Hockey"}, {"id": "R11", "cat": "Reglas", "q": "En tenis, ¿cómo se llama un saque que el rival no llega a tocar?", "r": ["ace"], "s": "Ace"}, {"id": "R12", "cat": "Reglas", "q": "¿Cada cuántos años se celebran los Juegos Olímpicos de verano?", "o": ["Cuatro", "Dos", "Tres", "Cinco"], "c": 0}, {"id": "R13", "cat": "Reglas", "q": "¿Desde cuántos metros se tira un penalti en fútbol?", "r": ["11", "once"], "s": "11"}, {"id": "R14", "cat": "Reglas", "q": "¿A qué distancia debe ponerse la barrera en una falta de fútbol?", "o": ["9,15 metros", "7 metros", "11 metros", "5 metros"], "c": 0}, {"id": "R15", "cat": "Reglas", "q": "¿Hay fuera de juego si el balón viene de un saque de banda?", "o": ["No", "Sí", "Solo en el área", "Solo en la segunda parte"], "c": 0}, {"id": "R16", "cat": "Reglas", "q": "¿Vale un gol marcado directamente de saque de banda?", "o": ["No", "Sí", "Solo si toca al portero", "Solo en fútbol sala"], "c": 0}, {"id": "R17", "cat": "Reglas", "q": "¿Cuántos cambios puede hacer cada equipo en un partido de LaLiga?", "o": ["Cinco", "Tres", "Cuatro", "Siete"], "c": 0}, {"id": "R18", "cat": "Reglas", "q": "¿Cuántas tarjetas amarillas suponen la expulsión en un mismo partido de fútbol?", "o": ["Dos", "Tres", "Una", "Cuatro"], "c": 0}, {"id": "R19", "cat": "Reglas", "q": "¿Cuántos jugadores tiene en pista cada equipo de fútbol sala?", "o": ["Cinco", "Seis", "Siete", "Cuatro"], "c": 0}, {"id": "R20", "cat": "Reglas", "q": "¿Cuántos puntos vale un tiro libre en baloncesto?", "o": ["Uno", "Dos", "Tres", "Medio"], "c": 0}, {"id": "R21", "cat": "Reglas", "q": "¿Cuántos segundos tiene un equipo de baloncesto para tirar a canasta?", "r": ["24", "veinticuatro"], "s": "24"}, {"id": "R22", "cat": "Reglas", "q": "¿Con cuántas faltas personales queda eliminado un jugador en baloncesto FIBA?", "o": ["Cinco", "Seis", "Cuatro", "Tres"], "c": 0}, {"id": "R23", "cat": "Reglas", "q": "¿En cuántos cuartos se divide un partido de baloncesto?", "o": ["Cuatro", "Dos", "Tres", "Cinco"], "c": 0}, {"id": "R24", "cat": "Reglas", "q": "¿Cuántos toques puede dar un equipo de voleibol antes de pasar la pelota?", "o": ["Tres", "Dos", "Cuatro", "Uno"], "c": 0}, {"id": "R25", "cat": "Reglas", "q": "¿A cuántos puntos se juega un set de voleibol, salvo el quinto?", "r": ["25", "veinticinco"], "s": "25"}, {"id": "R26", "cat": "Reglas", "q": "¿Cuánto dura un partido de balonmano?", "o": ["60 minutos", "80 minutos", "90 minutos", "40 minutos"], "c": 0}, {"id": "R27", "cat": "Reglas", "q": "¿Cuántos pasos puede dar un jugador de balonmano con el balón en la mano?", "o": ["Tres", "Dos", "Cinco", "Ninguno"], "c": 0}, {"id": "R28", "cat": "Reglas", "q": "¿Desde cuántos metros se lanza un penalti en balonmano?", "o": ["Siete", "Nueve", "Seis", "Once"], "c": 0}, {"id": "R29", "cat": "Reglas", "q": "En rugby, ¿hacia dónde se puede pasar el balón con la mano?", "o": ["Hacia atrás o en horizontal", "Solo hacia delante", "Hacia cualquier lado", "No se puede pasar con la mano"], "c": 0}, {"id": "R30", "cat": "Reglas", "q": "¿Cuántos puntos vale una transformación en rugby?", "o": ["Dos", "Tres", "Uno", "Cinco"], "c": 0}, {"id": "R31", "cat": "Reglas", "q": "En tenis, ¿cómo se llama el marcador cuando los dos jugadores están 40-40?", "r": ["iguales", "deuce"], "s": "Iguales"}, {"id": "R32", "cat": "Reglas", "q": "En tenis, ¿qué se juega cuando un set llega a 6-6?", "o": ["Un tie-break", "Otro set", "Un punto de oro", "Nada, gana quien sacó"], "c": 0}, {"id": "R33", "cat": "Reglas", "q": "En pádel, ¿cómo tiene que ser el saque?", "o": ["Por debajo de la cintura", "Por encima de la cabeza", "Con bote en la pared", "Sin bote"], "c": 0}, {"id": "R34", "cat": "Reglas", "q": "¿Cuántas vallas hay que saltar en los 110 metros vallas?", "r": ["10", "diez"], "s": "Diez"}, {"id": "R35", "cat": "Reglas", "q": "¿Cuántos metros mide una vuelta a la pista de atletismo?", "r": ["400", "cuatrocientos"], "s": "400"}, {"id": "R36", "cat": "Reglas", "q": "¿Cuántos corredores forman un equipo de relevos 4x100?", "o": ["Cuatro", "Cinco", "Seis", "Ocho"], "c": 0}, {"id": "R37", "cat": "Reglas", "q": "¿Qué estilo de natación se nada boca arriba?", "r": ["espalda"], "s": "Espalda"}, {"id": "R38", "cat": "Reglas", "q": "En golf, ¿cómo se llama terminar un hoyo con un golpe menos que el par?", "r": ["birdie"], "s": "Birdie"}, {"id": "R39", "cat": "Reglas", "q": "En Fórmula 1, ¿qué bandera indica el final de la carrera?", "o": ["La de cuadros", "La roja", "La azul", "La amarilla"], "c": 0}, {"id": "R40", "cat": "Reglas", "q": "En Fórmula 1, ¿qué indica la bandera amarilla?", "o": ["Peligro: prohibido adelantar", "Fin de la carrera", "Dejar pasar a un coche más rápido", "Pista mojada"], "c": 0}, {"id": "R41", "cat": "Reglas", "q": "¿Qué premia el maillot de lunares del Tour de Francia?", "o": ["Al mejor escalador", "Al líder", "Al mejor sprinter", "Al mejor joven"], "c": 0}, {"id": "R42", "cat": "Reglas", "q": "¿Cuántos minutos dura un asalto de boxeo profesional?", "o": ["Tres", "Dos", "Cinco", "Uno"], "c": 0}, {"id": "R43", "cat": "Reglas", "q": "En judo, ¿cómo se llama el punto que da la victoria inmediata?", "r": ["ippon"], "s": "Ippon"}];

function doGet(e)  { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping")  return salida({ ok: true });
    if (p.a === "state") { var g0 = liga(p.c); avanzar(g0); return salida(vista(g0, p.t)); }
    if (!ACCIONES[p.a])  return salida({ error: "Acción desconocida" });
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
function partido(g, r, i) {
  for (var j = 0; j < g.matches.length; j++) if (g.matches[j].r === +r && g.matches[j].i === +i) return g.matches[j];
  return null;
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
function barajar(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

// ── preguntas ──
function porId(id) { for (var i = 0; i < BANCO.length; i++) if (BANCO[i].id === id) return BANCO[i]; return null; }
function idsBanco() { return BANCO.map(function (q) { return q.id; }); }
function norm(s) {
  return " " + String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]+/g, " ").replace(/\b(el|la|los|las|the|un|una|de|del)\b/g, " ")
    .replace(/\s+/g, " ").trim() + " ";
}
function correctaCorta(resp, variantes) {
  var r = norm(resp);
  if (r.trim().length === 0) return false;
  var rt = r.trim().split(" ");
  return variantes.some(function (v) {
    var n = norm(v); if (!n.trim()) return false;
    if (r === n || (r.indexOf(n) >= 0 && r.length <= n.length + 22)) return true;
    var nt = n.trim().split(" ");
    return nt.length > 1 && rt.every(function (w) { return nt.indexOf(w) >= 0; }) && rt.indexOf(nt[nt.length - 1]) >= 0;
  });
}

// Preguntas ya usadas en partidas anteriores. No vuelven a salir hasta que se acaba el banco.
function cicloLeer() { try { return JSON.parse(P.getProperty("CICLO") || "[]"); } catch (x) { return []; } }
function cicloGuardar(c) { P.setProperty("CICLO", JSON.stringify(c)); }
function cicloSumar(lista) {
  var todas = idsBanco(), c = cicloLeer();
  (lista || []).forEach(function (id) { if (todas.indexOf(id) >= 0 && c.indexOf(id) < 0) c.push(id); });
  if (c.length >= todas.length) c = [];
  cicloGuardar(c);
}
function elegirPreguntas(g, n) {
  var todas = idsBanco(), ciclo = cicloLeer(), liga = g.usadas || [];
  var libres = barajar(todas.filter(function (id) { return ciclo.indexOf(id) < 0 && liga.indexOf(id) < 0; }));
  var out = libres.slice(0, n);
  if (out.length < n) {
    // se ha acabado el banco: empieza una vuelta nueva con las que no han salido en esta liguilla
    var resto = barajar(todas.filter(function (id) { return out.indexOf(id) < 0 && liga.indexOf(id) < 0; }));
    if (resto.length < n - out.length) resto = resto.concat(barajar(todas.filter(function (id) { return out.indexOf(id) < 0 && resto.indexOf(id) < 0; })));
    var extra = resto.slice(0, n - out.length);
    out = out.concat(extra);
    ciclo = extra.slice();
  } else {
    ciclo = ciclo.concat(out);
    if (ciclo.length >= todas.length) ciclo = [];
  }
  cicloGuardar(ciclo);
  g.usadas = liga.concat(out);
  return out.map(function (id) {
    var q = porId(id);
    return { id: id, perm: q.o ? barajar(q.o.map(function (x, i) { return i; })) : null };
  });
}
function preguntaPublica(item, rev) {
  var q = porId(item.id);
  var o = { id: q.id, cat: q.cat, q: q.q };
  if (q.r) o.escribe = true;
  else o.o = item.perm.map(function (i) { return q.o[i]; });
  if (rev) {
    if (q.r) o.s = q.s;
    else { o.c = item.perm.indexOf(q.c); o.s = q.o[q.c]; }
  }
  return o;
}

// Equipos que juegan la pregunta en marcha
function enJuego(g) {
  var ids = [];
  g.matches.forEach(function (m) { if (m.r === g.qz.r && m.type === "preguntas" && !m.closed) { ids.push(m.a); ids.push(m.b); } });
  return ids;
}
// El gol es para el que acierta antes
function resolver(g) {
  var Z = g.qz;
  g.matches.forEach(function (m) {
    if (m.r !== Z.r || m.type !== "preguntas" || m.closed) return;
    var A = Z.ans[m.a], B = Z.ans[m.b];
    var okA = !!(A && A.ok), okB = !!(B && B.ok), gana = "-";
    if (okA && okB) gana = A.t <= B.t ? "a" : "b";
    else if (okA) gana = "a";
    else if (okB) gana = "b";
    if (gana === "a") m.sa++;
    if (gana === "b") m.sb++;
    m.h.push({ w: gana, ta: A ? A.t : null, tb: B ? B.t : null, oa: okA, ob: okB });
  });
  Z.phase = "rev"; Z.revStart = Date.now();
}
function siguiente(g) {
  var Z = g.qz;
  Z.ans = {};
  if (Z.k + 1 >= Z.items.length) {
    g.matches.forEach(function (m) { if (m.r === Z.r && m.type === "preguntas") m.closed = true; });
    Z.phase = "fin";
    return;
  }
  Z.k++; Z.phase = "q"; Z.qStart = Date.now();
}
function avanzar(g) {
  var Z = g.qz; if (!Z) return;
  var cambia = false, ahora = Date.now();
  for (var vueltas = 0; vueltas < 3; vueltas++) {
    if (Z.phase === "q") {
      var ids = enJuego(g), todos = ids.length > 0 && ids.every(function (id) { return Z.ans[id]; });
      if (todos || ahora >= Z.qStart + T_PREGUNTA) { resolver(g); cambia = true; continue; }
    }
    if (Z.phase === "rev" && ahora >= Z.revStart + T_REV) { siguiente(g); cambia = true; continue; }
    break;
  }
  if (cambia) guardar(g);
}

// Lo que ven las pantallas: la respuesta buena solo después de cerrar la pregunta.
function vista(g, t) {
  var league = JSON.parse(JSON.stringify(g));
  delete league.admin; delete league.usadas; delete league.matches; delete league.qz; delete league.equipos;
  var out = { ok: true, now: Date.now(), league: league, teams: g.equipos, matches: g.matches,
    T_PREGUNTA: T_PREGUNTA, T_REV: T_REV, nbanco: BANCO.length, ciclo: cicloLeer() };
  var Z = g.qz;
  if (Z && Z.r === g.round && g.playing) {
    var z = { r: Z.r, k: Z.k, n: Z.items.length, phase: Z.phase, qStart: Z.qStart, revStart: Z.revStart, resp: Object.keys(Z.ans || {}) };
    if (Z.phase === "q" || Z.phase === "rev") z.q = preguntaPublica(Z.items[Z.k], Z.phase === "rev");
    if (t && Z.ans[t]) z.mia = { o: Z.ans[t].o, w: Z.ans[t].w, ok: Z.phase === "rev" ? Z.ans[t].ok : undefined };
    out.qz = z;
  }
  return out;
}

// ── penaltis ──
var MISMO_LADO = { TL: "BL", BL: "TL", TR: "BR", BR: "TR" };
function lanzador(m) { return (m.pen.k % 2 === 0) ? m.pen.first : (m.pen.first === "a" ? "b" : "a"); }
function tiros(m, lado) { var n = 0; m.pen.shots.forEach(function (s) { if (s.s === lado) n++; }); return n; }
function finPenaltis(m) {
  var ta = tiros(m, "a"), tb = tiros(m, "b"), N = m.pen.n || 5;
  if (ta < N || tb < N) {
    var restA = N - ta, restB = N - tb;
    if (m.sa + restA < m.sb || m.sb + restB < m.sa) return true;
    return false;
  }
  if (ta === tb && m.sa !== m.sb) return true;
  if (m.pen.k >= 30) return true;
  return false;
}
function nuevaTanda() { return { k: 0, n: 5, first: Math.random() < 0.5 ? "a" : "b", shots: [], pick: { a: null, b: null } }; }
function campeon(g, m) { g.champ = m.sa > m.sb ? m.a : m.b; g.status = "over"; g.playing = false; }

// ── acciones ──
var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    // la pantalla del proyector manda las preguntas que recuerda de otras partidas
    if (p.prev && p.prev.length) cicloSumar(p.prev);
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do {
      code = "";
      for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length));
    } while (P.getProperty("L_" + code));
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      status: "lobby", teams: [], equipos: [], rounds: [], round: -1, playing: false, jor: [],
      matches: [], qz: null, usadas: [], created: Date.now()
    };
    guardar(g);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = liga(p.c);
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 24);
    if (!nombre) throw new Error("Escribe el nombre de vuestro equipo");
    for (var i = 0; i < g.equipos.length; i++) if (g.equipos[i].name.toLowerCase() === nombre.toLowerCase()) return { ok: true, team: g.equipos[i] };
    if (g.status !== "lobby") throw new Error("La liguilla ya ha empezado y no admite equipos nuevos");
    if (g.teams.length >= MAX_EQUIPOS) throw new Error("La liguilla ya tiene " + MAX_EQUIPOS + " equipos");
    var id = "e" + (g.teams.length + 1);
    var e = { id: id, name: nombre, color: COLORES[g.teams.length % COLORES.length] };
    g.teams.push(id); g.equipos.push(e);
    guardar(g);
    return { ok: true, team: e };
  },

  "start": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "lobby") return { ok: true };
    if (g.teams.length < 2) throw new Error("Hacen falta al menos dos equipos");
    g.rounds = calendario(barajar(g.teams.slice()));
    g.status = "league";
    guardar(g);
    return { ok: true };
  },

  // Empieza la jornada siguiente: preguntas o penaltis.
  "round": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "league") throw new Error("La liguilla no está en marcha");
    if (g.playing) throw new Error("Primero hay que cerrar la jornada en juego");
    if (g.round + 1 >= g.rounds.length) throw new Error("Ya se han jugado todas las jornadas");
    g.round++;
    var r = g.round, tipo = p.type === "penaltis" ? "penaltis" : "preguntas";
    var n = Math.max(3, Math.min(20, parseInt(p.n, 10) || 8));
    g.jor[r] = { type: tipo, n: n, start: Date.now() };
    g.rounds[r].forEach(function (par, i) {
      if (!par[0] || !par[1]) return;
      var m = { r: r, i: i, a: par[0], b: par[1], type: tipo, n: n, sa: 0, sb: 0, h: [], closed: false };
      if (tipo === "penaltis") m.pen = nuevaTanda();
      g.matches.push(m);
    });
    g.qz = tipo === "preguntas" ? { r: r, items: elegirPreguntas(g, n), k: 0, phase: "q", qStart: Date.now(), ans: {} } : null;
    g.playing = true;
    guardar(g);
    return { ok: true, round: r };
  },

  // Respuesta a la pregunta en marcha: solo vale la primera y dentro de los 20 segundos.
  "ans": function (p) {
    var g = liga(p.c); avanzar(g);
    var Z = g.qz;
    if (!Z || Z.phase !== "q" || parseInt(p.q, 10) !== Z.k) return { ok: true, late: true };
    if (enJuego(g).indexOf(p.t) < 0) throw new Error("Ahora no os toca jugar");
    if (Z.ans[p.t]) return { ok: true };
    var t = Date.now() - Z.qStart;
    if (t > T_PREGUNTA) return { ok: true, late: true };
    var item = Z.items[Z.k], q = porId(item.id), r;
    if (q.r) {
      var w = String(p.w || "").slice(0, 80);
      r = { ok: correctaCorta(w, q.r), t: t, w: w };
    } else {
      var o = parseInt(p.o, 10);
      if (!(o >= 0 && o < item.perm.length)) throw new Error("Respuesta no válida");
      r = { ok: item.perm[o] === q.c, t: t, o: o };
    }
    Z.ans[p.t] = r;
    avanzar(g);
    guardar(g);
    return { ok: true };
  },

  // La profesora cierra la pregunta ya o pasa a la siguiente sin esperar.
  "next": function (p) {
    var g = liga(p.c); admin(g, p.k); avanzar(g);
    var Z = g.qz; if (!Z) return { ok: true };
    if (Z.phase === "q") resolver(g);
    else if (Z.phase === "rev") siguiente(g);
    guardar(g);
    return { ok: true };
  },

  // Penalti: cada equipo manda la esquina elegida.
  "pen": function (p) {
    var g = liga(p.c), m = partido(g, p.r, p.i);
    if (!m || m.closed || m.type !== "penaltis") return { ok: true, match: m };
    var lado = m.a === p.t ? "a" : m.b === p.t ? "b" : null;
    if (!lado) throw new Error("Este partido no es vuestro");
    if (parseInt(p.k, 10) !== m.pen.k) return { ok: true, match: m };
    if (["TL", "TR", "BL", "BR"].indexOf(p.dir) < 0) throw new Error("Esquina no válida");
    m.pen.pick[lado] = { ok: String(p.ok) === "1" || p.ok === true, dir: p.dir };
    if (m.pen.pick.a && m.pen.pick.b) {
      var s = lanzador(m), kp = s === "a" ? "b" : "a";
      var tiro = m.pen.pick[s], parada = m.pen.pick[kp];
      var cubre = [parada.dir];
      var estira = parada.ok && !tiro.ok;
      if (estira) cubre.push(MISMO_LADO[parada.dir]);
      var gol = cubre.indexOf(tiro.dir) < 0;
      if (gol) m["s" + s]++;
      m.pen.shots.push({ s: s, shoot: tiro.dir, keep: parada.dir, okS: tiro.ok, okK: parada.ok, estira: estira, goal: gol, k: m.pen.k });
      m.pen.k++;
      m.pen.pick = { a: null, b: null };
      if (finPenaltis(m)) m.closed = true;
    }
    if (m.final && m.closed) campeon(g, m);
    guardar(g);
    return { ok: true, match: m };
  },

  // La profesora corrige un marcador.
  "score": function (p) {
    var g = liga(p.c); admin(g, p.k);
    var m = partido(g, p.r, p.i);
    if (!m) throw new Error("Partido no encontrado");
    m.sa = Math.max(0, parseInt(p.sa, 10) || 0);
    m.sb = Math.max(0, parseInt(p.sb, 10) || 0);
    if (p.closed != null) m.closed = String(p.closed) === "1" || p.closed === true;
    if (m.final && m.closed && m.sa !== m.sb) campeon(g, m);
    guardar(g);
    return { ok: true, match: m };
  },

  // Cierra la jornada: los partidos sin terminar se quedan con el marcador que tengan.
  "close": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (!g.playing) return { ok: true };
    var r = g.round;
    if (g.status === "final") {
      var mf = partido(g, r, 0);
      if (mf && mf.sa !== mf.sb) { mf.closed = true; campeon(g, mf); guardar(g); return { ok: true }; }
      throw new Error("El desempate sigue empatado, hay que seguir tirando");
    }
    g.matches.forEach(function (m) { if (m.r === r) m.closed = true; });
    g.qz = null;
    g.playing = false;
    if (g.round + 1 >= g.rounds.length) g.status = "over";
    guardar(g);
    return { ok: true };
  },

  // Desempate a penaltis por el título si hay empate a puntos en cabeza al terminar.
  "final": function (p) {
    var g = liga(p.c); admin(g, p.k);
    if (g.status !== "over" || g.champ) throw new Error("La liguilla todavía no ha terminado");
    if (!p.ta || !p.tb || p.ta === p.tb || g.teams.indexOf(p.ta) < 0 || g.teams.indexOf(p.tb) < 0) throw new Error("Equipos no válidos");
    var r = g.rounds.length;
    g.matches = g.matches.filter(function (m) { return !m.final; });
    g.matches.push({ r: r, i: 0, a: p.ta, b: p.tb, type: "penaltis", final: true, n: 5, sa: 0, sb: 0, h: [], closed: false, pen: nuevaTanda() });
    g.round = r; g.playing = true; g.status = "final"; g.fin = { a: p.ta, b: p.tb }; g.qz = null;
    guardar(g);
    return { ok: true };
  },

  "end": function (p) {
    var g = liga(p.c); admin(g, p.k);
    g.status = "over"; g.playing = false; g.qz = null;
    g.matches.forEach(function (m) { m.closed = true; });
    guardar(g);
    return { ok: true };
  }
};
