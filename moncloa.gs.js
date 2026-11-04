/**
 * MUJERES Y PODER · LA CARRERA A LA MONCLOA · servidor · v2
 *
 * Todos los equipos contestan a la vez las mismas preguntas desde el móvil.
 * Acierto: una casilla. Fallo: se quedan donde están. Meta en la casilla 60 (se puede cambiar).
 * Bloques de seis preguntas: tras la 3.ª, mímica del equipo que va último; tras la 6.ª, una prueba para todos.
 * En las pruebas avanza una casilla la mitad primera que acierte (salvo teletipo, encuesta y columnista).
 * La partida termina cuando llega el tercer equipo.
 * El profesor puede sancionar a un equipo con preguntas sin jugar si usa IA.
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 30;
var T_OPC = 20000, T_ESC = 30000, T_EXPLICA = 10000, T_MIMICA = 60000, FALLOS_AHORCADO = 6, RONDAS_BULO = 5;
var PODIO = 3;
var COLORES = ["#C8102E","#1565C0","#2E7D32","#F9A825","#6A1B9A","#EF6C00","#00838F","#AD1457","#4E342E","#37474F",
  "#7CB342","#5E35B1","#D81B60","#00897B","#3949AB","#F4511E","#6D4C41","#8E24AA","#039BE5","#C0CA33",
  "#43A047","#E53935","#1E88E5","#FB8C00","#546E7A","#00ACC1","#9E9D24","#AB47BC","#26A69A","#795548"];

// ── banco de preguntas ──
// t: "o" opciones (c = índice de la buena) · "e" escrita (a = respuestas válidas) · "f" foto (a, y alt si no hay foto)
var BANCO = {
  pol: [
    { t: "o", p: "¿Qué día son las elecciones generales anticipadas?", o: ["23 de noviembre", "29 de noviembre", "30 de noviembre", "6 de diciembre"], c: 1, e: "Sánchez lo anunció el 5 de octubre de 2026." },
    { t: "o", p: "¿Qué derrota en el Congreso precipitó el adelanto electoral?", o: ["Los Presupuestos", "Una moción de censura", "Dos decretos de vivienda", "Una cuestión de confianza"], c: 2, e: "El Congreso tumbó dos decretos de vivienda el viernes anterior." },
    { t: "e", p: "¿Cuántos días pasan por ley entre el decreto de convocatoria y las elecciones?", a: ["54", "cincuenta y cuatro"], e: "Lo fija la ley electoral, la LOREG." },
    { t: "o", p: "¿Qué día empieza la campaña del 29N?", o: ["6 de noviembre", "13 de noviembre", "15 de noviembre", "20 de noviembre"], c: 1, e: "Arranca el 13 y se cierra el 27 a medianoche." },
    { t: "e", p: "¿Cuántos días dura la campaña electoral?", a: ["15", "quince"], e: "La jornada de reflexión es el 28." },
    { t: "o", p: "¿Quién asume las funciones del Congreso disuelto?", o: ["La Mesa del Congreso", "La Diputación Permanente", "La Comisión Constitucional", "El Senado"], c: 1, e: "Funciona hasta que se constituyen las nuevas Cortes." },
    { t: "o", p: "¿Quién firma el decreto de disolución de las Cortes?", o: ["El Rey", "El Congreso", "El Consejo de Estado", "La Junta Electoral"], c: 0, e: "Lo firma a propuesta del presidente del Gobierno." },
    { t: "o", p: "¿Qué artículo de la Constitución regula la disolución anticipada?", o: ["99", "113", "115", "155"], c: 2, e: "El 99 es la investidura y el 113 la moción de censura." },
    { t: "e", p: "¿Cuántos escaños tiene el Congreso?", a: ["350", "trescientos cincuenta"], e: "Se eligen en 52 circunscripciones." },
    { t: "e", p: "¿Cuántos escaños son mayoría absoluta en el Congreso?", a: ["176", "ciento setenta y seis"], e: "La mitad más uno de 350." },
    { t: "e", p: "¿Cómo se llama el método que reparte los escaños?", a: ["d hondt", "dhondt", "hondt", "ley d hondt"], s: "D'Hondt", e: "Lleva el nombre del jurista belga Victor d'Hondt." },
    { t: "o", p: "¿Cuál es la circunscripción en las elecciones generales?", o: ["La comunidad", "La provincia", "El municipio", "Toda España"], c: 1, e: "Ceuta y Melilla eligen un diputado cada una." },
    { t: "e", p: "¿Cuántos senadores elige cada provincia peninsular?", a: ["4", "cuatro"], e: "Las listas del Senado son abiertas." },
    { t: "o", p: "En la investidura, ¿cuántas horas después llega la segunda votación?", o: ["24", "48", "72", "96"], c: 1, e: "En la segunda basta la mayoría simple." },
    { t: "f", id: "saiz", a: ["saiz", "elma saiz"], alt: "¿Quién es la ministra de Inclusión y portavoz del Gobierno?", e: "Elma Saiz, ministra de Inclusión y portavoz del Gobierno." },
    { t: "f", id: "cuerpo", a: ["cuerpo", "carlos cuerpo"], alt: "¿Quién es el vicepresidente primero y ministro de Economía desde marzo de 2026?", e: "Carlos Cuerpo, vicepresidente primero y ministro de Economía." },
    { t: "f", id: "espana", a: ["espana", "arcadi espana"], alt: "¿Quién es el ministro de Hacienda desde marzo de 2026?", e: "Arcadi España, ministro de Hacienda desde marzo de 2026." },
    { t: "o", p: "¿Quién dejó Hacienda en marzo de 2026 para ser candidata en Andalucía?", o: ["María Jesús Montero", "Teresa Ribera", "María Luisa Carcedo", "Pilar Alegría"], c: 0, e: "Le pasó la cartera a Arcadi España." },
    { t: "o", p: "¿Quién es la candidata de Podemos al 29N?", o: ["Ione Belarra", "Irene Montero", "Mónica García", "Yolanda Díaz"], c: 1, e: "Lo hizo oficial en septiembre de 2026." },
    { t: "o", p: "¿Cómo se llama la nueva coalición de Sumar y sus aliados?", o: ["Sumar Más", "Unidas", "Frente Amplio", "Nueva Izquierda"], c: 2, e: "Reúne a IU, Más Madrid, Comuns y Movimiento Sumar, sin Podemos." },
    { t: "f", id: "diaz", a: ["yolanda diaz", "diaz"], alt: "¿Quién es la vicepresidenta del Gobierno y ministra de Trabajo?", e: "Yolanda Díaz, vicepresidenta del Gobierno y ministra de Trabajo." },
    { t: "f", id: "belarra", a: ["belarra", "ione belarra"], alt: "¿Quién es la secretaria general de Podemos?", e: "Ione Belarra, secretaria general de Podemos." },
    { t: "o", p: "¿Quién anunció en febrero de 2026 que no repetiría como candidata?", o: ["Irene Montero", "Ada Colau", "Mónica García", "Yolanda Díaz"], c: 3, e: "Lo comunicó con una carta y un vídeo en redes." },
    { t: "o", p: "¿A qué hora cierran los colegios electorales el 29N?", o: ["18:00", "19:00", "20:00", "21:00"], c: 2, e: "Abren a las 9:00 y cierran a las 20:00." },
    { t: "o", p: "¿Quién es el presidente del PP y su candidato al 29N?", o: ["Feijóo", "Moreno", "Tellado", "Bendodo"], c: 0, e: "Alberto Núñez Feijóo." },
    { t: "e", p: "¿Qué partido preside Santiago Abascal?", a: ["vox"], s: "Vox", e: "Santiago Abascal preside Vox." },
    { t: "o", p: "¿Qué partido encabeza la media de encuestas de finales de octubre?", o: ["PP", "PSOE", "Vox", "Sumar"], c: 0, e: "Media del 26 de octubre, PP 31 %, PSOE 27,3 % y Vox 18,9 %." }
  ],
  gen: [
    { t: "o", p: "¿En qué año votaron por primera vez las mujeres en unas generales?", o: ["1931", "1933", "1936", "1977"], c: 1, e: "El sufragio se aprobó en 1931 y se estrenó en 1933." },
    { t: "f", id: "campoamor", a: ["campoamor", "clara campoamor"], alt: "¿Quién defendió el voto femenino en las Cortes de 1931?", e: "Clara Campoamor, que defendió el voto femenino en las Cortes de 1931." },
    { t: "o", p: "¿Qué diputada se opuso en 1931 a dar ya el voto a las mujeres?", o: ["Clara Campoamor", "Victoria Kent", "Dolores Ibárruri", "Federica Montseny"], c: 1, e: "Temía que el voto femenino favoreciera a la derecha." },
    { t: "o", p: "¿Quién fue la primera ministra de España?", o: ["Victoria Kent Siano", "Margarita Nelken", "Federica Montseny", "Clara Campoamor"], c: 2, e: "Ministra de Sanidad en 1936." },
    { t: "o", p: "¿Quién fue la primera presidenta del Congreso?", o: ["Ana Pastor", "Luisa Fernanda Rudi", "Meritxell Batet", "Cristina Narbona Ruiz"], c: 1, e: "Lo presidió de 2000 a 2004, antes que Ana Pastor." },
    { t: "o", p: "¿Quién presidió por primera vez el Senado?", o: ["Esperanza Aguirre", "Cristina Narbona", "Pilar Llop", "Rosa Aguilar Rivero"], c: 0, e: "Fue presidenta del Senado en 1999." },
    { t: "o", p: "¿Quién fue la primera vicepresidenta del Gobierno?", o: ["Carmen Calvo", "Teresa Fernández de la Vega", "Soraya Sáenz de Santamaría Antón", "Nadia Calviño Santamaría"], c: 1, e: "Lo fue con Zapatero desde 2004." },
    { t: "f", id: "redondo", a: ["redondo", "ana redondo"], alt: "¿Quién es la ministra de Igualdad?", e: "Ana Redondo, ministra de Igualdad." },
    { t: "o", p: "¿Qué proporción mínima de cada sexo exige la Ley de Igualdad de 2007 en las listas?", o: ["30-70", "40-60", "45-55", "50-50"], c: 1, e: "Ley Orgánica 3/2007." },
    { t: "e", p: "¿Cómo se llaman las listas que alternan un hombre y una mujer?", a: ["cremallera"], e: "Listas cremallera." },
    { t: "o", p: "¿Qué añadió la ley de paridad de 2024 a las listas electorales?", o: ["La alternancia de sexos", "Un cupo del 30 %", "Listas abiertas en el Congreso", "Primarias obligatorias"], c: 0, e: "Ley Orgánica 2/2024." },
    { t: "o", p: "Según «La mujer invisible», ¿sobre qué cuerpo se diseñan los maniquíes de choque de los coches?", o: ["El de una mujer media", "El de un hombre medio", "El de un niño de 12 años", "Uno de cada sexo"], c: 1, e: "Por eso las mujeres sufren más lesiones graves." },
    { t: "o", p: "Según Criado Perez, ¿con qué metabolismo se fija la temperatura de las oficinas?", o: ["Hombre de 40 años y 70 kilos", "Mujer de 30 años y 60 kilos", "La temperatura media de toda la plantilla", "Persona joven y sedentaria"], c: 0, e: "Por eso tantas mujeres pasan frío en el trabajo." },
    { t: "e", p: "¿Cómo llama Criado Perez a la falta de datos sobre las mujeres? (tres palabras)", a: ["brecha de datos", "brecha de datos de genero"], s: "Brecha de datos", e: "En inglés, gender data gap." },
    { t: "o", p: "¿Qué es el techo de cristal?", o: ["Un sueldo menor por igual trabajo", "Un tope invisible para ascender", "Un trabajo que no se paga", "Una cuota en los consejos"], c: 1, e: "Una barrera que no se ve y frena el ascenso de las mujeres." },
    { t: "o", p: "¿Qué es el suelo pegajoso?", o: ["Lo que ata a los empleos peor pagados", "Un acoso en el trabajo", "Un despido tras volver de la baja por maternidad", "Un tope para ascender a jefa"], c: 0, e: "Cuidados y tareas que impiden salir de la base." },
    { t: "o", p: "¿Qué se conmemora el 25 de noviembre?", o: ["El voto femenino", "La lucha contra la violencia machista", "El Día Internacional de la Mujer Trabajadora", "La igualdad salarial"], c: 1, e: "Cae cuatro días antes del 29N." },
    { t: "o", p: "¿De qué año es la ley integral contra la violencia de género?", o: ["1999", "2004", "2007", "2011"], c: 1, e: "Ley Orgánica 1/2004." },
    { t: "o", p: "¿Qué mide el test de Bechdel?", o: ["Si dos mujeres hablan de algo que no sea un hombre", "Cuántas mujeres dirigen una película o una serie de ficción", "Cuánto tiempo hablan las mujeres en pantalla", "Si la protagonista es una mujer de más de 40"], c: 0, e: "Nació en un cómic de Alison Bechdel en 1985." },
    { t: "o", p: "¿Quién fue la primera directora de «El País»?", o: ["Pepa Bueno", "Soledad Gallego-Díaz", "Rosa Montero", "Maruja Torres Manzanera"], c: 1, e: "Llegó a la dirección en 2018." },
    { t: "f", id: "calaf", a: ["calaf", "rosa maria calaf"], alt: "¿Quién fue durante décadas corresponsal de TVE por todo el mundo y se apellida Calaf?", e: "Rosa María Calaf, corresponsal de TVE durante décadas." },
    { t: "e", p: "¿Cómo se llama el sesgo que toma al hombre como medida de todo?", a: ["androcentrismo"], e: "Androcentrismo." },
    { t: "o", p: "Un titular llama «Yolanda» a una política y «Feijóo» a un político. ¿Qué sesgo es?", o: ["Asimetría en el trato", "Falso equilibrio informativo", "Uso del masculino genérico", "Lenguaje sexista explícito"], c: 0, e: "A ellas por el nombre de pila y a ellos por el apellido." },
    { t: "o", p: "¿Qué día es el Día Internacional de la Mujer?", o: ["8 de marzo", "25 de noviembre", "11 de febrero", "15 de octubre"], c: 0, e: "El 8 de marzo, el 8M." },
    { t: "o", p: "¿Qué significa «sororidad»?", o: ["Solidaridad entre mujeres", "Igualdad salarial por ley", "Cuota de mujeres en listas", "Odio hacia los hombres"], c: 0, e: "Viene del latín soror, hermana." },
    { t: "o", p: "¿Quién fue la primera presidenta de la Comisión Europea?", o: ["Ursula von der Leyen", "Christine Lagarde", "Roberta Metsola", "Angela Merkel Kasner"], c: 0, e: "Preside la Comisión desde 2019." }
  ],
  mix: [
    { t: "o", p: "¿Qué presidente formó el primer Gobierno paritario?", o: ["Zapatero", "González", "Rajoy", "Sánchez"], c: 0, e: "En 2004, con ocho ministras y ocho ministros." },
    { t: "o", p: "¿En qué año formó Sánchez un Gobierno con más ministras que ministros?", o: ["2016", "2018", "2020", "2023"], c: 1, e: "Tras ganar la moción de censura a Rajoy." },
    { t: "e", p: "¿Cuántas mujeres han presidido el Gobierno de España?", a: ["0", "ninguna", "cero", "ninguno"], s: "Ninguna", e: "Ninguna." },
    { t: "o", p: "¿Qué ministra insistió en decir «ministros y ministras» al prometer el cargo en 2023?", o: ["Ana Redondo", "Yolanda Díaz", "Pilar Alegría", "Diana Morant"], c: 0, e: "La ministra de Igualdad." },
    { t: "o", p: "¿Cuál de ellas fue vicepresidenta primera del Gobierno?", o: ["Carmen Calvo", "Ana Pastor", "Meritxell Batet", "Cristina Narbona"], c: 0, e: "Lo fue de 2018 a 2021." },
    { t: "f", id: "ayuso", a: ["ayuso", "diaz ayuso", "isabel diaz ayuso"], alt: "¿Quién es la presidenta de la Comunidad de Madrid?", e: "Isabel Díaz Ayuso, presidenta de la Comunidad de Madrid." },
    { t: "f", id: "garcia", a: ["garcia", "monica garcia"], alt: "¿Quién es la ministra de Sanidad y líder de Más Madrid?", e: "Mónica García, ministra de Sanidad y líder de Más Madrid." },
    { t: "f", id: "armengol", a: ["armengol", "francina armengol"], alt: "¿Quién presidió el Congreso en la legislatura que acaba de terminar?", e: "Francina Armengol, presidenta del Congreso en la legislatura que acaba de terminar." },
    { t: "o", p: "¿Cuántas ministras tuvo el primer Gobierno de Sánchez, en 2018?", o: ["7", "9", "11", "13"], c: 2, e: "Once de diecisiete carteras, un récord entonces." },
    { t: "o", p: "¿Quién fue alcaldesa de Barcelona desde 2015?", o: ["Ada Colau", "Manuela Carmena", "Ana Botella", "Rita Barberá"], c: 0, e: "Gobernó hasta 2023." },
    { t: "o", p: "¿Quién fue la primera alcaldesa de Madrid?", o: ["Manuela Carmena", "Ana Botella", "Esperanza Aguirre", "Cristina Cifuentes"], c: 1, e: "Llegó a la alcaldía en 2011." },
    { t: "o", p: "A una candidata le preguntan cómo concilia con sus hijos y al candidato no. ¿Qué es?", o: ["Doble rasero", "Periodismo de servicio", "Pregunta de interés humano", "Equilibrio informativo"], c: 0, e: "La misma pregunta debería valer para los dos." },
    { t: "o", p: "¿Qué titular está bien escrito?", o: ["Marta, con vestido rojo, carga contra el alcalde", "La concejala Ruiz critica el plan de vivienda", "La guapa concejala madrileña ataca al alcalde", "Marta Ruiz, muy enfadada, arremete contra todos"], c: 1, e: "Apellido, hecho y sin alusiones al físico ni al estado de ánimo." },
    { t: "e", p: "¿Qué artículo de la Constitución prohíbe discriminar por razón de sexo?", a: ["14", "catorce", "articulo 14"], e: "El artículo 14, igualdad ante la ley." },
    { t: "o", p: "¿Qué candidata al 29N es hoy eurodiputada?", o: ["Ione Belarra", "Irene Montero", "Mónica García", "Verónica Martínez Barbero"], c: 1, e: "Es la candidata de Podemos." },
    { t: "o", p: "¿Cómo llamó Sánchez al Consejo extraordinario del 5 de octubre?", o: ["Consejo de Gobierno", "Consejo de Ministros y Ministras", "Consejo de Estado", "Gabinete de crisis del Gobierno de España"], c: 1, e: "Lo dijo al anunciar la disolución de las Cortes." },
    { t: "o", p: "¿Cuántas cabezas de lista del 29N son nuevas?", o: ["Dos de cada diez", "Cuatro de cada diez", "Seis de cada diez", "Ocho de cada diez"], c: 2, e: "Según las candidaturas publicadas en el BOE." },
    { t: "o", p: "En las listas del 29N, ¿qué pasa con las mujeres que encabezan candidaturas?", o: ["Suben", "Bajan", "Se mantienen igual", "No hay ninguna"], c: 0, e: "Hay más mujeres al frente que en 2023." },
    { t: "e", p: "¿Qué órgano comprueba que las listas cumplen la paridad?", a: ["junta electoral", "juntas electorales", "la junta electoral"], s: "Junta electoral", e: "Las juntas electorales validan avales y listas cremallera." }
  ]
};
var TEMAS = { pol: "Política y campaña del 29N", gen: "Género", mix: "Política y género" };
var FOTOS = ["saiz", "cuerpo", "espana", "diaz", "belarra", "campoamor", "redondo", "calaf", "ayuso", "garcia", "armengol"];

// La mímica: el profesor tiene la lista de libros y se la pasa al equipo que va último.

// ── pruebas ──
// La foto de portada está hecha pero fuera de la partida hasta que el profesor elija la prueba de salir.
var ORDEN_PRUEBAS = ["ordena", "sopa1", "ahorc1", "bulo", "encuesta", "teletipo", "caza", "ahorc2", "sopa2", "experta", "columnista"];
var PRUEBAS = {
  ordena: { tipo: "ordena", titulo: "Ordena la historia", txt: "Ordenad los hitos del más antiguo al más reciente. Solo hay un intento.",
    items: ["Las Cortes aprueban el voto femenino", "Federica Montseny, primera ministra", "Luisa Fernanda Rudi, primera presidenta del Congreso", "Primer Gobierno paritario, con Zapatero", "La ley de paridad obliga a las listas cremallera"] },
  sopa1: { tipo: "sopa", titulo: "Sopa de letras de política y género", txt: "Encontrad las ocho palabras, dos de ellas sin pista. Tocad la primera letra y después la última.",
    words: ["PARIDAD", "SUFRAGIO", "CREMALLERA", "BRECHA", "CUOTA", "ESCAÑO", "IGUALDAD", "MINISTRA"], ocultas: ["IGUALDAD", "PARIDAD"] },
  sopa2: { tipo: "sopa", titulo: "Sopa de letras de periodistas", txt: "Encontrad las ocho palabras, dos de ellas sin pista. Tocad la primera letra y después la última.",
    words: ["COLOMBINE", "CARABIAS", "CORRESPONSAL", "CRONICA", "COLUMNA", "REPORTERA", "SEUDONIMO", "REDACCION"], ocultas: ["COLOMBINE", "CARABIAS"] },
  ahorc1: { tipo: "ahorcado", titulo: "Ahorcado de género", txt: "Cuatro palabras seguidas. Cada fallo dibuja una parte del muñeco y, si se completa, quedáis fuera.",
    words: [["Micromachismo", "Machismo cotidiano y casi invisible"], ["Sufragismo", "Movimiento por el voto de las mujeres"],
            ["Manspreading", "Sentarse con las piernas muy abiertas en el transporte"], ["Heteropatriarcado", "Sistema de dominio masculino y heterosexual"]] },
  ahorc2: { tipo: "ahorcado", titulo: "Ahorcado de periodistas", txt: "Cuatro periodistas, con nombre y apellido. Cada fallo dibuja una parte del muñeco y, si se completa, quedáis fuera.",
    words: [["Julia Otero", "Voz de la radio, de «Julia en la onda»"], ["Paloma del Río", "Voz de la gimnasia y los Juegos Olímpicos en TVE"],
            ["Rosa Montero", "Columnista y novelista de El País"], ["María Antonia Iglesias", "Dirigió los informativos de TVE y fue tertuliana"]] },
  bulo: { tipo: "bulo", titulo: "Verdadero o bulo", txt: "Cinco frases, una detrás de otra. Podéis buscar donde queráis. Avanza la mitad que más acierte.",
    lista: [["Las mujeres votaron por primera vez en España en 1977", 0, "Bulo, fue en 1933."],
            ["Ninguna mujer ha presidido nunca el Congreso", 0, "Bulo, Rudi, Pastor, Batet y Armengol lo han presidido."],
            ["España nunca ha tenido una presidenta del Gobierno", 1, "Verdadero."],
            ["Desde 2024 la ley obliga a alternar hombres y mujeres en las listas", 1, "Verdadero, Ley Orgánica 2/2024."],
            ["Clara Campoamor votó en contra del voto femenino", 0, "Bulo, lo defendió. Quien se opuso fue Victoria Kent."],
            ["Federica Montseny fue la primera ministra de España", 1, "Verdadero, en 1936."],
            ["La ley integral contra la violencia de género es de 2004", 1, "Verdadero, Ley Orgánica 1/2004."],
            ["Esperanza Aguirre fue la primera presidenta del Senado", 1, "Verdadero, en 1999."],
            ["El primer Gobierno paritario de España lo formó Mariano Rajoy", 0, "Bulo, lo formó Zapatero en 2004."],
            ["Las elecciones generales anticipadas se celebran el 30 de noviembre", 0, "Bulo, son el 29 de noviembre."]] },
  encuesta: { tipo: "encuesta", titulo: "Encuesta a pie de calle", txt: "Salid a hacer una encuesta como la de Punto Pelota con esta pregunta. Tenéis que conseguir a cuatro personas y grabarlo en vídeo. No hay tiempo, la prueba sigue hasta que vuelvan todos los equipos y le enseñen el vídeo al profesor." },
  foto: { tipo: "foto", titulo: "La foto de portada", txt: "Salid y haced una foto que pueda abrir una noticia sobre mujeres y poder en la universidad. Subidla con su pie de foto. Después vota toda la clase, sin votaros a vosotros mismos." },
  teletipo: { tipo: "teletipo", titulo: "Teletipo urgente", txt: "Escribid solo el titular. Después vota toda la clase, sin votaros a vosotros mismos." },
  caza: { tipo: "caza", titulo: "Caza el sesgo", txt: "Marcad los fragmentos que tienen sesgo y enviad. Solo hay un intento.",
    frag: ["Laura, la candidata por Valladolid, presentó ayer su programa de vivienda junto a Ramírez, su rival en la provincia.",
           "Vestida con un elegante traje rojo,", "la madre de tres hijos defendió ampliar el parque público de alquiler.",
           "Ramírez propuso bajar el IVA de la construcción.", "La joven política, visiblemente nerviosa, no quiso responder a las preguntas.",
           "Los dos candidatos debatirán el jueves en la radio pública."],
    malos: [0, 1, 2, 4],
    porque: ["A ella se la nombra por el nombre de pila y a él por el apellido", "Alusión al físico y la ropa", "Se la define por su familia", "", "Condescendencia", ""] },
  experta: { tipo: "experta", titulo: "Busca la experta", txt: "Buscad una experta real en este tema. Escribid su nombre, su cargo, el móvil al que llamarla y el enlace donde la habéis encontrado." },
  columnista: { tipo: "columnista", titulo: "La columnista", txt: "Contad cuántas mujeres firman hoy en Opinión del periódico que os ha dado el profesor." }
};
// pruebas en las que se puede salir del juego para buscar (no se avisa al profesor)
var CON_BUSQUEDA = { bulo: 1, encuesta: 1, experta: 1, columnista: 1, foto: 1 };

// ── utilidades ──
function doGet(e)  { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "moncloa" });
    if (p.a === "state") { var g0 = partida(p.c); if (avanzar(g0)) guardar(g0); return salida(vista(g0, String(p.t || ""), String(p.k || ""))); }
    if (!ACCIONES[p.a]) return salida({ error: "Acción desconocida" });
    return salida(ACCIONES[p.a](p));
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(g) { P.setProperty("M_" + g.code, JSON.stringify(g)); }
function partida(c) {
  var g = leer("M_" + cod(c));
  if (!g) throw new Error("No existe ninguna partida con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla del profesor puede hacer esto"); }
function barajar(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now(), viejas = {};
  for (var k in todo) {
    if (k.indexOf("M_") !== 0) continue;
    try { var g = JSON.parse(todo[k]); if (ahora - g.created > 2 * 24 * 3600 * 1000) { P.deleteProperty(k); viejas[g.code] = 1; } } catch (x) {}
  }
  for (var k2 in todo) { if (k2.indexOf("MF_") === 0 && viejas[k2.split("_")[1]]) P.deleteProperty(k2); }
}
// minúsculas, sin tildes (la ñ se queda), sin signos
function normal(s) {
  return String(s || "").toLowerCase().replace(/ñ/g, "\u0001").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\u0001/g, "ñ").replace(/[^a-z0-9ñ]+/g, " ").trim();
}
function aceptada(resp, lista) {
  var r = " " + normal(resp) + " ";
  if (r.trim() === "") return false;
  for (var i = 0; i < lista.length; i++) {
    var x = normal(lista[i]);
    if (r.trim() === x || r.indexOf(" " + x + " ") >= 0) return true;
  }
  return false;
}
function mitad(n) { return Math.max(1, Math.ceil(n / 2)); }

// ── ciclos para no repetir entre partidas ──
function ciclo(nombre) { try { return JSON.parse(P.getProperty("CICLO_" + nombre) || "[]"); } catch (x) { return []; } }
function cicloSumar(nombre, claves, total) {
  var c = ciclo(nombre);
  (claves || []).forEach(function (k) { k = String(k); if (c.indexOf(k) < 0) c.push(k); });
  if (c.length >= total) c = [];
  P.setProperty("CICLO_" + nombre, JSON.stringify(c));
}
// orden de un tema: primero las que no han salido en otras partidas, luego las que sí
function ordenTema(tema) {
  var usadas = ciclo("q");
  var nuevas = [], viejas = [];
  BANCO[tema].forEach(function (x, i) { (usadas.indexOf(tema + "_" + i) < 0 ? nuevas : viejas).push(tema + "_" + i); });
  return barajar(nuevas).concat(barajar(viejas));
}
function totalPreguntas() { return BANCO.pol.length + BANCO.gen.length + BANCO.mix.length; }
function pregunta(ref) { var s = ref.split("_"); return BANCO[s[0]][+s[1]]; }
function elegirVarios(nombre, n, cuantos) {
  var c = ciclo(nombre), libres = [], usados = [];
  for (var i = 0; i < n; i++) (c.indexOf(String(i)) < 0 ? libres : usados).push(i);
  var lista = barajar(libres).concat(barajar(usados)).slice(0, cuantos);
  cicloSumar(nombre, lista, n);
  return lista;
}

// ── el programa de la partida ──
// Bloque de 8 pasos: 3 preguntas, mímica, 3 preguntas, prueba.
function paso(i) {
  var b = Math.floor(i / 8), w = i % 8;
  if (w === 3) return { k: "mim", b: b };
  if (w === 7) return ORDEN_PRUEBAS[b] ? { k: "pr", id: ORDEN_PRUEBAS[b], b: b } : { k: "skip" };
  return { k: "q", n: b * 6 + (w < 3 ? w : w - 1) };   // n empieza en 0
}
// Primero política, luego género y luego las mixtas. Ninguna pregunta se repite;
// al acabar el banco vuelven solo las que no acertó nadie, y después se acaba la partida.
function refPregunta(g) {
  var temas = ["pol", "gen", "mix"];
  for (var i = 0; i < temas.length; i++) if (g.cola[temas[i]].length) return g.cola[temas[i]].shift();
  while (g.fallidas && g.fallidas.length) {
    var r = g.fallidas.shift();
    if (g.repetidas.indexOf(r) < 0) { g.repetidas.push(r); return r; }
  }
  return null;
}

function activos(g) { return g.teams.filter(function (e) { return !e.place; }); }
function equipo(g, id) { for (var i = 0; i < g.teams.length; i++) if (g.teams[i].id === id) return g.teams[i]; return null; }
function terminar(g) { g.status = "over"; g.phase = "fin"; g.endedAt = Date.now(); }
function sumar(g, e, n) {
  if (!e || e.place || g.status !== "running") return;
  e.pos = Math.min(g.meta, e.pos + n);
  if (e.pos >= g.meta) {
    g.arrivals.push(e.id);
    e.place = g.arrivals.length;
    if (g.arrivals.length >= Math.min(PODIO, g.teams.length)) terminar(g);
  }
}

// Empieza el paso actual
function abrirPaso(g) {
  if (g.status !== "running") return;
  for (var guard = 0; guard < 4; guard++) {
    var s = paso(g.step);
    if (s.k === "skip") { g.step++; continue; }
    g.ans = {}; g.away = {}; g.pr = null; g.mim = null; g.last = null;
    if (s.k === "q") {
      var ref = refPregunta(g);
      if (!ref) { terminar(g); return; }
      g.qref = ref; g.qn = (g.qn || 0) + 1; g.asked.push(ref);
      cicloSumar("q", [ref], totalPreguntas());
      var q = pregunta(ref);
      g.phase = "q"; g.qStart = Date.now(); g.qDur = q.t === "o" ? T_OPC : T_ESC;
      if (q.t === "f" && g.fotos[q.id]) g.qDur = T_OPC;
    } else if (s.k === "mim") {
      var vivos = activos(g);
      if (vivos.length < 2) { g.step++; continue; }
      var min = Math.min.apply(null, vivos.map(function (e) { return e.pos; }));
      var ultimos = vivos.filter(function (e) { return e.pos === min; });
      var quien = ultimos[Math.floor(Math.random() * ultimos.length)];
      g.mim = { t: quien.id, start: 0, res: null };
      g.phase = "mim";
    } else {
      abrirPrueba(g, s.id);
    }
    return;
  }
}

function abrirPrueba(g, id) {
  var def = PRUEBAS[id], pr = { id: id, tipo: def.tipo, start: Date.now(), sub: "play", res: {}, closed: false, winners: [] };
  if (def.tipo === "ordena") {
    var idx = def.items.map(function (x, i) { return i; });
    do { barajar(idx); } while (idx.every(function (v, i) { return v === i; }));
    pr.mezcla = idx;
  }
  if (def.tipo === "sopa") pr.sopa = hacerSopa(def.words);
  if (def.tipo === "bulo") { pr.bulos = elegirVarios("bulo", def.lista.length, RONDAS_BULO); pr.ronda = 0; pr.rr = {}; pr.rstart = Date.now(); }
  if (def.tipo === "encuesta") pr.pregunta = g.cfg.encuesta;
  if (def.tipo === "experta") pr.tema = g.cfg.experta;
  if (def.tipo === "teletipo") { pr.texto = g.cfg.teletipo; pr.votes = {}; pr.sub = "write"; }
  if (def.tipo === "foto") { pr.votes = {}; pr.sub = "write"; }
  if (def.tipo === "columnista") { pr.periodico = g.cfg.periodico; pr.cifra = null; }
  g.pr = pr; g.phase = "pr";
}

// ── sopa de letras ──
function hacerSopa(words) {
  var N = 13, dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  for (var intento = 0; intento < 200; intento++) {
    var grid = [], pos = {}, ok = true;
    for (var r = 0; r < N; r++) { grid.push([]); for (var c = 0; c < N; c++) grid[r].push(""); }
    var lista = words.slice().sort(function (a, b) { return b.length - a.length; });
    for (var w = 0; w < lista.length && ok; w++) {
      var pal = lista[w], puesto = false;
      for (var t = 0; t < 300 && !puesto; t++) {
        var d = dirs[Math.floor(Math.random() * dirs.length)];
        var r0 = Math.floor(Math.random() * N), c0 = Math.floor(Math.random() * N);
        var r1 = r0 + d[0] * (pal.length - 1), c1 = c0 + d[1] * (pal.length - 1);
        if (r1 < 0 || r1 >= N || c1 < 0 || c1 >= N) continue;
        var cabe = true;
        for (var i = 0; i < pal.length; i++) { var ch = grid[r0 + d[0] * i][c0 + d[1] * i]; if (ch && ch !== pal[i]) { cabe = false; break; } }
        if (!cabe) continue;
        for (var j = 0; j < pal.length; j++) grid[r0 + d[0] * j][c0 + d[1] * j] = pal[j];
        pos[pal] = [r0, c0, r1, c1]; puesto = true;
      }
      if (!puesto) ok = false;
    }
    if (!ok) continue;
    var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var a = 0; a < N; a++) for (var b = 0; b < N; b++) if (!grid[a][b]) grid[a][b] = abc.charAt(Math.floor(Math.random() * abc.length));
    return { grid: grid.map(function (row) { return row.join(""); }), pos: pos, words: words.slice() };
  }
  throw new Error("No se pudo montar la sopa de letras");
}

// ── ahorcado ──
function letrasDe(sol) { return normal(sol).replace(/ /g, ""); }
function mascara(sol, usadas) {
  var out = "";
  for (var i = 0; i < sol.length; i++) {
    var ch = sol.charAt(i), n = normal(ch);
    if (ch === " ") out += " ";
    else if (!n) out += ch;
    else out += usadas.indexOf(n) >= 0 ? ch.toUpperCase() : "_";
  }
  return out;
}

// ── cierre de pruebas ──
function ganadoresPorVotos(g, pr, cupo) {
  var votos = contarVotos(pr);
  var con = Object.keys(pr.res).filter(function (t) { return equipo(g, t) && !equipo(g, t).place && !(pr.oculto || {})[t]; });
  con.sort(function (a, b) { return (votos[b] || 0) - (votos[a] || 0); });
  pr.votos = votos;
  if (!con.length) return [];
  var corte = votos[con[Math.min(cupo, con.length) - 1]] || 0;
  return con.filter(function (t, i) { return (votos[t] || 0) > 0 && (i < cupo || (votos[t] || 0) === corte); });
}
function cerrarPrueba(g) {
  var pr = g.pr; if (!pr || pr.closed) return;
  var def = PRUEBAS[pr.id], vivos = activos(g), cupo = mitad(vivos.length), gan = [];
  var vivo = function (t) { return equipo(g, t) && !equipo(g, t).place; };
  var porTiempo = function (filtro) {
    return Object.keys(pr.res).filter(function (t) { return vivo(t) && filtro(pr.res[t]); })
      .sort(function (a, b) { return pr.res[a].t - pr.res[b].t; });
  };
  if (def.tipo === "teletipo" || def.tipo === "foto") {
    gan = ganadoresPorVotos(g, pr, cupo);
  } else if (def.tipo === "encuesta") {
    gan = Object.keys(pr.res).filter(function (t) { return pr.res[t].ok && vivo(t); });
  } else if (def.tipo === "columnista") {
    if (pr.cifra === null || pr.cifra === undefined || isNaN(pr.cifra)) throw new Error("Escribe tu cifra antes de cerrar la prueba");
    var dif = {}, best = Infinity;
    Object.keys(pr.res).forEach(function (t) { if (!vivo(t)) return; dif[t] = Math.abs(pr.res[t].n - pr.cifra); if (dif[t] < best) best = dif[t]; });
    gan = Object.keys(dif).filter(function (t) { return dif[t] === best; });
  } else if (def.tipo === "bulo") {
    // la mitad que más acierta; si empatan a aciertos, la más rápida
    gan = Object.keys(pr.res).filter(function (t) { return vivo(t) && pr.res[t].n > 0; })
      .sort(function (a, b) { return pr.res[b].n - pr.res[a].n || pr.res[a].t - pr.res[b].t; }).slice(0, cupo);
  } else {
    gan = porTiempo(function (r) { return r.ok === true; }).slice(0, cupo);
  }
  pr.winners = gan;
  pr.closed = true; pr.sub = "fin";
  gan.forEach(function (t) { sumar(g, equipo(g, t), 1); });
  if (g.status === "running") g.phase = "prfin";
}
// ¿han terminado todos los que juegan?
function pruebaCompleta(g) {
  var pr = g.pr, vivos = activos(g);
  if (!pr || ["ordena", "sopa", "ahorcado", "caza"].indexOf(pr.tipo) < 0) return false;
  var hechos = vivos.filter(function (e) { var r = pr.res[e.id]; return r && r.fin; }).length;
  var ok = vivos.filter(function (e) { var r = pr.res[e.id]; return r && r.ok; }).length;
  return hechos >= vivos.length || ok >= mitad(vivos.length);
}
// Verdadero o bulo: cierra la frase y suma los aciertos
function cerrarFrase(g) {
  var pr = g.pr, def = PRUEBAS.bulo, sol = def.lista[pr.bulos[pr.ronda]][1];
  for (var t in pr.rr) {
    var r = pr.rr[t];
    r.ok = r.v === sol;
    var tot = pr.res[t] = pr.res[t] || { n: 0, t: 0 };
    if (r.ok) { tot.n++; tot.t += r.t; }
  }
  pr.sub = "ver";
}

// ── resolver preguntas ──
function resolver(g) {
  var quien = [];
  activos(g).forEach(function (e) {
    if (e.ban > 0) return;
    var r = g.ans[e.id];
    if (r && r.ok) { quien.push(e.id); }
  });
  g.teams.forEach(function (e) { if (e.ban > 0 && !e.place) e.ban--; });
  g.last = { ok: quien, ans: g.ans };
  if (!quien.length && g.repetidas.indexOf(g.qref) < 0 && g.fallidas.indexOf(g.qref) < 0) g.fallidas.push(g.qref);
  quien.forEach(function (t) { sumar(g, equipo(g, t), 1); });
  if (g.status === "running") { g.phase = "rev"; g.revStart = Date.now(); g.paused = false; }
}

function siguientePaso(g) {
  if (g.status !== "running") return;
  g.step++;
  abrirPaso(g);
}

// Avanza las fases según el reloj cada vez que alguien consulta el estado.
function avanzar(g) {
  var cambia = false, ahora = Date.now();
  for (var vueltas = 0; vueltas < 3; vueltas++) {
    if (g.status !== "running") break;
    if (g.phase === "q") {
      var juegan = activos(g).filter(function (e) { return !(e.ban > 0); });
      var todos = juegan.length > 0 && juegan.every(function (e) { return g.ans[e.id]; });
      if (todos || ahora >= g.qStart + g.qDur) { resolver(g); cambia = true; continue; }
    }
    if (g.phase === "rev" && !g.paused && ahora >= g.revStart + T_EXPLICA) { siguientePaso(g); cambia = true; continue; }
    if (g.phase === "pr" && !g.pr.closed && pruebaCompleta(g)) { cerrarPrueba(g); cambia = true; continue; }
    if (g.phase === "pr" && g.pr.tipo === "bulo" && g.pr.sub === "play") {
      var vivos = activos(g);
      if (vivos.length && vivos.every(function (e) { return g.pr.rr[e.id]; })) { cerrarFrase(g); cambia = true; continue; }
    }
    break;
  }
  return cambia;
}

// Lo que ve cada pantalla
function vista(g, t, k) {
  var prof = k && k === g.admin;
  var v = {
    ok: true, now: Date.now(), code: g.code, status: g.status, phase: g.phase, meta: g.meta, step: g.step,
    teams: g.teams, arrivals: g.arrivals, paused: !!g.paused, prof: !!prof,
    T_EXPLICA: T_EXPLICA, T_MIMICA: T_MIMICA, nextPrueba: null,
    quedan: g.cola ? g.cola.pol.length + g.cola.gen.length + g.cola.mix.length : totalPreguntas()
  };
  for (var i = g.step + 1; i < g.step + 9; i++) { var s0 = paso(i); if (s0.k === "pr") { v.nextPrueba = { titulo: PRUEBAS[s0.id].titulo }; break; } }
  if (g.phase === "q" || g.phase === "rev") {
    var q = pregunta(g.qref), tema = g.qref.split("_")[0];
    var pq = { n: g.qn, tipo: q.t, tema: TEMAS[tema], start: g.qStart, dur: g.qDur, repe: g.repetidas.indexOf(g.qref) >= 0 };
    if (q.t === "o") { pq.p = q.p; pq.o = q.o; }
    else if (q.t === "f") { if (g.fotos[q.id]) { pq.p = "¿Quién es?"; pq.img = g.fotos[q.id]; } else { pq.p = q.alt; } }
    else pq.p = q.p;
    if (g.phase === "rev") {
      pq.e = q.e; pq.sol = q.t === "o" ? q.o[q.c] : (q.t === "f" ? q.e.split(",")[0] : (q.s || q.a[0]));
      if (q.t === "o") pq.c = q.c;
      v.revStart = g.revStart; v.last = { ok: g.last.ok };
      if (prof) v.last.ans = g.last.ans;
      else if (g.last.ans[t]) v.last.mine = g.last.ans[t];
    }
    v.q = pq;
    v.answered = Object.keys(g.ans);
    if (t && g.ans[t]) v.mine = g.ans[t];
  }
  if (g.phase === "mim" && g.mim) v.mim = { t: g.mim.t, start: g.mim.start, res: g.mim.res };
  if ((g.phase === "pr" || g.phase === "prfin") && g.pr) v.pr = vistaPrueba(g, t, prof);
  if (prof) v.away = g.away || {};
  return v;
}

function vistaPrueba(g, t, prof) {
  var pr = g.pr, def = PRUEBAS[pr.id];
  var o = { id: pr.id, tipo: pr.tipo, titulo: def.titulo, txt: def.txt, sub: pr.sub, closed: pr.closed, winners: pr.winners, start: pr.start,
    cupo: mitad(activos(g).length), hechos: Object.keys(pr.res).filter(function (x) { return pr.res[x].fin || pr.res[x].sent; }) };
  var mio = pr.res[t];
  if (pr.tipo === "ordena") {
    o.items = pr.mezcla.map(function (i) { return def.items[i]; });
    if (pr.closed) o.sol = def.items;
  }
  if (pr.tipo === "sopa") {
    var ocultas = def.ocultas || [];
    o.grid = pr.sopa.grid; o.total = pr.sopa.words.length;
    o.words = pr.sopa.words.filter(function (w) { return ocultas.indexOf(w) < 0; });
    o.extra = ocultas.length;
    if (mio) { o.found = mio.found; o.foundPos = (mio.found || []).map(function (w) { return pr.sopa.pos[w]; }); }
    if (pr.closed || prof) { o.pos = pr.sopa.pos; o.todas = pr.sopa.words; }
    o.prog = {}; for (var x in pr.res) o.prog[x] = (pr.res[x].found || []).length;
  }
  if (pr.tipo === "ahorcado") {
    o.n = def.words.length; o.max = FALLOS_AHORCADO; o.prog = {};
    for (var y in pr.res) o.prog[y] = { w: pr.res[y].w, fails: pr.res[y].fails, out: !!pr.res[y].out, ok: !!pr.res[y].ok };
    if (mio && !mio.fin) {
      o.mask = mascara(def.words[mio.w][0], mio.letras); o.used = mio.letras; o.fails = mio.fails; o.w = mio.w;
    }
    if (mio && mio.out) { o.perdida = def.words[mio.w][0]; o.fails = mio.fails; }
    if (!mio) { o.mask = mascara(def.words[0][0], []); o.used = []; o.fails = 0; o.w = 0; }
    if (pr.closed) o.sols = def.words.map(function (w) { return w[0]; });
  }
  if (pr.tipo === "bulo") {
    var b = def.lista[pr.bulos[pr.ronda]];
    o.ronda = pr.ronda; o.rondas = pr.bulos.length; o.frase = b[0];
    o.respondidos = Object.keys(pr.rr);
    if (pr.sub === "ver" || pr.closed) { o.sol = b[1]; o.e = b[2]; o.okRonda = Object.keys(pr.rr).filter(function (x) { return pr.rr[x].ok; }); }
    o.aciertos = {}; for (var z in pr.res) o.aciertos[z] = pr.res[z].n;
    if (pr.rr[t]) o.mia = { v: pr.rr[t].v, ok: pr.rr[t].ok };
  }
  if (pr.tipo === "caza") { o.frag = def.frag; if (pr.closed) { o.malos = def.malos; o.porque = def.porque; } }
  if (pr.tipo === "encuesta") o.pregunta = pr.pregunta;
  if (pr.tipo === "experta") o.tema = pr.tema;
  if (pr.tipo === "columnista") { o.periodico = pr.periodico; if (pr.closed) o.cifra = pr.cifra; }
  if (pr.tipo === "teletipo" || pr.tipo === "foto") {
    if (pr.tipo === "teletipo") o.texto = pr.texto;
    if (pr.sub === "vote" || pr.sub === "fin") {
      var votos = contarVotos(pr);
      o.heads = pr.orden.filter(function (x) { return pr.res[x] && !pr.oculto[x]; }).map(function (x) {
        return { id: x, text: pr.res[x].text, mine: x === t, votes: (prof || pr.closed) ? (votos[x] || 0) : undefined };
      });
      if (prof || pr.closed) o.nvotes = Object.keys(pr.votes).length;
      if (pr.votes[t]) o.myvote = pr.votes[t];
    }
    if (prof && pr.sub === "write") o.heads = Object.keys(pr.res).sort(function (a, b) { return pr.res[a].t - pr.res[b].t; }).map(function (x) { return { id: x, text: pr.res[x].text }; });
  }
  if (prof) {
    o.res = pr.res;
    if (pr.tipo === "columnista") o.cifra = pr.cifra;
  } else if (mio) {
    o.mio = { ok: mio.ok, fin: mio.fin, sent: mio.sent, text: mio.text, n: mio.n, rej: mio.rej };
  }
  return o;
}
function contarVotos(pr) { var n = {}; for (var d in pr.votes) n[pr.votes[d]] = (n[pr.votes[d]] || 0) + 1; return n; }

// ── acciones ──
var ACCIONES = {
  "new": function (p) {
    limpiarViejas();
    if (p.prev && p.prev.length) cicloSumar("q", p.prev.filter(function (r) { try { return !!pregunta(String(r)); } catch (x) { return false; } }), totalPreguntas());
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", code;
    do { code = ""; for (var i = 0; i < 4; i++) code += letras.charAt(Math.floor(Math.random() * letras.length)); }
    while (P.getProperty("M_" + code));
    var fotos = {};
    FOTOS.forEach(function (id) { var u = String((p.fotos || {})[id] || "").trim(); if (/^(https?:\/\/|\/moncloa_fotos\/)/i.test(u)) fotos[id] = u.slice(0, 600); });
    var cfg = p.cfg || {};
    var g = {
      code: code, admin: String(Math.random()).slice(2) + String(Date.now()),
      created: Date.now(), status: "lobby", phase: "lobby",
      meta: Math.max(10, Math.min(120, parseInt(p.meta, 10) || 60)),
      teams: [], arrivals: [], step: 0, qn: 0, asked: [], fallidas: [], repetidas: [], ans: {}, away: {},
      fotos: fotos,
      cfg: {
        teletipo: String(cfg.teletipo || "").trim().slice(0, 1200),
        encuesta: String(cfg.encuesta || "").trim().slice(0, 300) || "¿Sabrías decir el nombre de alguna candidata a las elecciones del 29 de noviembre?",
        experta: String(cfg.experta || "").trim().slice(0, 120) || "Vivienda",
        periodico: String(cfg.periodico || "").trim().slice(0, 80)
      },
      cola: null
    };
    guardar(g);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c);
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 24);
    if (!nombre) throw new Error("Escribe el nombre de vuestro equipo");
    for (var i = 0; i < g.teams.length; i++) if (normal(g.teams[i].name) === normal(nombre)) return { ok: true, team: g.teams[i] };
    if (g.status !== "lobby") throw new Error("La partida ya ha empezado y no admite equipos nuevos");
    if (g.teams.length >= MAX_EQUIPOS) throw new Error("Ya hay " + MAX_EQUIPOS + " equipos, que es el máximo");
    var usados = g.teams.map(function (e) { return e.color; });
    var color = COLORES.filter(function (c) { return usados.indexOf(c) < 0; })[0] || COLORES[g.teams.length % COLORES.length];
    var e = { id: "e" + Date.now().toString(36) + Math.floor(Math.random() * 99), name: nombre, color: color, pos: 0, ban: 0, place: 0 };
    g.teams.push(e);
    guardar(g);
    return { ok: true, team: e };
  },

  "kick": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "lobby") throw new Error("Solo se pueden quitar equipos antes de empezar");
    g.teams = g.teams.filter(function (e) { return e.id !== p.t; });
    guardar(g);
    return { ok: true };
  },

  "start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "lobby") return { ok: true };
    if (g.teams.length < 2) throw new Error("Hacen falta al menos dos equipos");
    g.cola = { pol: ordenTema("pol"), gen: ordenTema("gen"), mix: ordenTema("mix") };
    g.status = "running"; g.startedAt = Date.now(); g.step = 0; g.qn = 0;
    abrirPaso(g);
    guardar(g);
    return { ok: true };
  },

  // Respuesta a una pregunta: solo vale la primera y dentro de tiempo
  "ans": function (p) {
    var g = partida(p.c); avanzar(g);
    var e = equipo(g, p.t);
    if (!e) throw new Error("Vuelve a entrar con el nombre del equipo");
    if (g.phase !== "q" || parseInt(p.n, 10) !== g.qn) { guardar(g); return { ok: true, late: true }; }
    if (e.place) throw new Error("Ya habéis llegado a la Moncloa");
    if (e.ban > 0) throw new Error("Estáis sancionados");
    if (g.ans[e.id]) return { ok: true };
    var q = pregunta(g.qref), ok = false, val;
    if (q.t === "o") { val = parseInt(p.o, 10); if (!(val >= 0 && val < q.o.length)) throw new Error("Respuesta no válida"); ok = val === q.c; }
    else { val = String(p.v || "").trim().slice(0, 80); if (!val) throw new Error("Escribe la respuesta"); ok = aceptada(val, q.a); }
    var tt = Date.now() - g.qStart;
    if (tt > g.qDur + 1500) { guardar(g); return { ok: true, late: true }; }
    g.ans[e.id] = { v: val, ok: ok, t: tt };
    avanzar(g);
    guardar(g);
    return { ok: true };
  },

  // El móvil avisa de que ha salido de la página del juego
  "away": function (p) {
    var g = partida(p.c), e = equipo(g, p.t);
    if (!e || g.status !== "running") return { ok: true };
    var vigilar = g.phase === "q" || (g.phase === "pr" && g.pr && !g.pr.closed && !CON_BUSQUEDA[g.pr.id]);
    if (!vigilar) return { ok: true };
    g.away = g.away || {};
    g.away[e.id] = (g.away[e.id] || 0) + 1;
    guardar(g);
    return { ok: true };
  },

  // ── mímica: el profesor pasa el libro; si otro equipo lo adivina, suman los dos ──
  "mim_go": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase !== "mim") return { ok: true };
    g.mim.start = Date.now(); guardar(g); return { ok: true };
  },
  "mim_res": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase !== "mim" || g.mim.res) return { ok: true };
    var quien = equipo(g, p.v);
    if (quien && quien.id !== g.mim.t) {
      g.mim.res = { ok: true, por: quien.id };
      sumar(g, equipo(g, g.mim.t), 1);
      sumar(g, quien, 1);
    } else g.mim.res = { ok: false };
    guardar(g);
    return { ok: true };
  },

  // ── pruebas ──
  "pr": function (p) {
    var g = partida(p.c); avanzar(g);
    var e = equipo(g, p.t), pr = g.pr;
    if (!e) throw new Error("Vuelve a entrar con el nombre del equipo");
    if (g.phase !== "pr" || !pr || pr.closed) return { ok: true, late: true };
    if (e.place) throw new Error("Ya habéis llegado a la Moncloa");
    var def = PRUEBAS[pr.id], r = pr.res[e.id], ahora = Date.now() - pr.start;
    switch (pr.tipo) {
      case "ordena": {
        if (r) return { ok: true };
        var orden = (p.orden || []).map(function (x) { return parseInt(x, 10); });
        var real = orden.map(function (i) { return pr.mezcla[i]; });
        var bien = real.length === def.items.length && real.every(function (v, i) { return v === i; });
        pr.res[e.id] = { ok: bien, fin: true, t: ahora };
        break;
      }
      case "caza": {
        if (r) return { ok: true };
        var marcas = (p.marcas || []).map(function (x) { return parseInt(x, 10); }).filter(function (x) { return x >= 0 && x < def.frag.length; });
        marcas = marcas.filter(function (x, i) { return marcas.indexOf(x) === i; }).sort();
        pr.res[e.id] = { ok: marcas.join(",") === def.malos.slice().sort().join(","), fin: true, t: ahora, marcas: marcas };
        break;
      }
      case "bulo": {
        if (pr.sub !== "play" || pr.rr[e.id] || parseInt(p.r, 10) !== pr.ronda) return { ok: true };
        var v = parseInt(p.v, 10);
        if (v !== 0 && v !== 1) throw new Error("Respuesta no válida");
        pr.rr[e.id] = { v: v, t: Date.now() - pr.rstart };
        break;
      }
      case "sopa": {
        if (!r) r = pr.res[e.id] = { found: [], fin: false, ok: false };
        if (r.fin) return { ok: true };
        var r1 = parseInt(p.r1, 10), c1 = parseInt(p.c1, 10), r2 = parseInt(p.r2, 10), c2 = parseInt(p.c2, 10), hall = null;
        for (var w in pr.sopa.pos) {
          var q = pr.sopa.pos[w];
          if ((q[0] === r1 && q[1] === c1 && q[2] === r2 && q[3] === c2) || (q[0] === r2 && q[1] === c2 && q[2] === r1 && q[3] === c1)) hall = w;
        }
        if (!hall) { guardar(g); return { ok: true, miss: true }; }
        if (r.found.indexOf(hall) < 0) r.found.push(hall);
        if (r.found.length >= pr.sopa.words.length) { r.fin = true; r.ok = true; r.t = ahora; }
        break;
      }
      case "ahorcado": {
        if (!r) r = pr.res[e.id] = { w: 0, letras: [], fails: 0, fin: false, ok: false, out: false };
        if (r.fin) return { ok: true };
        var l = normal(String(p.l || "")).replace(/ /g, "").charAt(0);
        if (!l) throw new Error("Elige una letra");
        var sol = letrasDe(def.words[r.w][0]);
        if (r.letras.indexOf(l) >= 0 || sol.indexOf(l) < 0) r.fails++;
        if (r.letras.indexOf(l) < 0) r.letras.push(l);
        var completa = sol.split("").every(function (ch) { return r.letras.indexOf(ch) >= 0; });
        if (completa) {
          if (r.w + 1 >= def.words.length) { r.fin = true; r.ok = true; r.t = ahora; }
          else { r.w++; r.letras = []; r.fails = 0; }
        } else if (r.fails >= FALLOS_AHORCADO) { r.fin = true; r.out = true; r.t = ahora; }
        break;
      }
      case "teletipo": case "foto": {
        if (pr.sub === "write") {
          var txt = String(p.text || "").trim().replace(/\s+/g, " ").slice(0, 160);
          if (!txt) throw new Error(pr.tipo === "foto" ? "Escribid el pie de foto" : "El titular está vacío");
          if (pr.tipo === "foto") {
            var img = String(p.img || "");
            if (img) {
              if (!/^data:image\/(jpeg|png|webp);base64,/.test(img)) throw new Error("La foto no es válida");
              if (img.length > 900000) throw new Error("La foto es demasiado grande");
              P.setProperty("MF_" + g.code + "_" + e.id, img);
            } else if (!r || !r.img) throw new Error("Falta la foto");
          }
          pr.res[e.id] = { text: txt, sent: true, t: r ? r.t : ahora, img: pr.tipo === "foto" ? true : undefined };
        } else if (pr.sub === "vote") {
          if (pr.votes[e.id]) throw new Error("Ya habéis votado");
          if (p.v === e.id) throw new Error("No podéis votaros a vosotros mismos");
          if (!pr.res[p.v] || pr.oculto[p.v]) throw new Error("Esa opción no existe");
          pr.votes[e.id] = p.v;
        }
        break;
      }
      case "experta": {
        if (r && r.ok === true) return { ok: true };
        var nom = String(p.nombre || "").trim().slice(0, 80), cargo = String(p.cargo || "").trim().slice(0, 120),
            tel = String(p.tel || "").trim().slice(0, 30), link = String(p.link || "").trim().slice(0, 400);
        if (!nom || !cargo || !tel || !link) throw new Error("Rellenad el nombre, el cargo, el móvil y el enlace");
        pr.res[e.id] = { nombre: nom, cargo: cargo, tel: tel, link: link, sent: true, ok: null, t: ahora, rej: false };
        break;
      }
      case "columnista": {
        var n = parseInt(p.n, 10);
        if (!(n >= 0 && n < 200)) throw new Error("Escribe un número");
        pr.res[e.id] = { n: n, sent: true, t: ahora };
        break;
      }
      case "encuesta": return { ok: true };
    }
    avanzar(g);
    guardar(g);
    return { ok: true };
  },

  // Foto subida por un equipo (para el proyector y la votación)
  "img": function (p) {
    var g = partida(p.c);
    var src = P.getProperty("MF_" + g.code + "_" + String(p.id || ""));
    return { ok: true, src: src || "" };
  },

  // El profesor: visto bueno de la experta y del vídeo de la encuesta
  "pr_ok": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var pr = g.pr; if (!pr || pr.closed) return { ok: true };
    if (pr.tipo === "experta") {
      var r = pr.res[p.t]; if (!r) return { ok: true };
      if (String(p.v) === "1") { r.ok = true; r.tok = Date.now(); r.rej = false; }
      else { r.ok = false; r.rej = true; r.sent = false; }
      var aprob = Object.keys(pr.res).filter(function (x) { return pr.res[x].ok === true; }).length;
      if (aprob >= mitad(activos(g).length)) cerrarPrueba(g);
    } else if (pr.tipo === "encuesta") {
      pr.res[p.t] = pr.res[p.t] || {};
      pr.res[p.t].ok = !pr.res[p.t].ok; pr.res[p.t].sent = pr.res[p.t].ok;
    }
    guardar(g);
    return { ok: true };
  },
  // Verdadero o bulo: enseñar la respuesta o pasar a la frase siguiente
  "pr_next": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var pr = g.pr; if (!pr || pr.tipo !== "bulo" || pr.closed) return { ok: true };
    if (pr.sub === "play") cerrarFrase(g);
    else if (pr.ronda + 1 >= pr.bulos.length) cerrarPrueba(g);
    else { pr.ronda++; pr.rr = {}; pr.sub = "play"; pr.rstart = Date.now(); }
    guardar(g);
    return { ok: true };
  },
  "pr_vote": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var pr = g.pr; if (!pr || (pr.tipo !== "teletipo" && pr.tipo !== "foto") || pr.sub !== "write") return { ok: true };
    var ids = Object.keys(pr.res);
    if (ids.length < 2) throw new Error("Hacen falta al menos dos envíos para votar");
    pr.orden = barajar(ids); pr.oculto = pr.oculto || {}; pr.sub = "vote"; pr.votes = {};
    guardar(g);
    return { ok: true };
  },
  "pr_hide": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var pr = g.pr; if (!pr || (pr.tipo !== "teletipo" && pr.tipo !== "foto")) return { ok: true };
    pr.oculto = pr.oculto || {};
    if (pr.oculto[p.t]) delete pr.oculto[p.t]; else pr.oculto[p.t] = 1;
    for (var d in pr.votes) if (pr.oculto[pr.votes[d]]) delete pr.votes[d];
    guardar(g);
    return { ok: true };
  },
  "pr_close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase === "pr" && g.pr && !g.pr.closed) {
      if (g.pr.tipo === "columnista" && p.n !== undefined && p.n !== "") g.pr.cifra = parseInt(p.n, 10);
      if (g.pr.tipo === "bulo" && g.pr.sub === "play") cerrarFrase(g);
      cerrarPrueba(g); guardar(g);
    }
    return { ok: true };
  },

  // Seguir: tras la explicación, la mímica o el resultado de una prueba
  "next": function (p) {
    var g = partida(p.c); admin(g, p.k); avanzar(g);
    if (g.status !== "running") return { ok: true };
    if (g.phase === "q") resolver(g);
    else if (g.phase === "rev" || g.phase === "mim" || g.phase === "prfin") siguientePaso(g);
    else if (g.phase === "pr") throw new Error("Cierra antes la prueba");
    guardar(g);
    return { ok: true };
  },
  "skip": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "running" && (g.phase === "pr" || g.phase === "mim")) { siguientePaso(g); guardar(g); }
    return { ok: true };
  },
  "pause": function (p) {
    var g = partida(p.c); admin(g, p.k); avanzar(g);
    if (g.phase !== "rev") return { ok: true };
    g.paused = !g.paused;
    if (!g.paused) g.revStart = Date.now() - T_EXPLICA + 4000;
    guardar(g);
    return { ok: true };
  },

  // Sanción por usar IA: n preguntas sin jugar (0 la quita)
  "ban": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var e = equipo(g, p.t); if (!e) throw new Error("Equipo no encontrado");
    e.ban = Math.max(0, Math.min(5, parseInt(p.n, 10) || 0));
    if (e.ban > 0 && g.phase === "q") delete g.ans[e.id];
    guardar(g);
    return { ok: true };
  },

  // Corrección manual de casillas
  "move": function (p) {
    var g = partida(p.c); admin(g, p.k);
    var e = equipo(g, p.t); if (!e || e.place) return { ok: true };
    var d = parseInt(p.d, 10) || 0;
    if (d > 0) sumar(g, e, d); else e.pos = Math.max(0, e.pos + d);
    guardar(g);
    return { ok: true };
  },

  "end": function (p) {
    var g = partida(p.c); admin(g, p.k);
    terminar(g);
    guardar(g);
    return { ok: true };
  }
};
