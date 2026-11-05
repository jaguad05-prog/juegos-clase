/**
 * ANÁLISIS DE COLUMNA · servidor · v1
 *
 * Concurso por equipos sobre cuatro columnas de opinión tras el España-Francia.
 * Cada equipo contesta desde un móvil. En las casillas de «toca» señala frases de
 * la columna y en las de «elige» marca una opción. La puntuación es automática,
 * con el solucionario de DATOS: cada acierto suma 1, cada frase marcada por error
 * resta 1 y una pregunta nunca baja de cero. Antes de cada pregunta hay una
 * lectura de la columna sin reloj, que termina cuando el profesor lo indica.
 */
var DATOS = {"cols": [["En el fútbol mandan los que tocan la pelota, los que saben dar sentido al fútbol y eso, desde que arrancó este siglo hace ya unos cuantos años, es patrimonio de España.", "El baile que la Selección ha sido capaz de dar a la que todo el mundo señalaba como gran favorita al título es de esos que se recordará en los libros, escuelas y documentales que están tan de moda ahora.", "Desde el minuto uno al noventa, Francia no ha sido capaz de dar sentido a ese juego que había maravillado a todos, ante el argumento del toque con sentido y con calidad de España.", "Nada ha podido hacer.", "En un fútbol que se mueve alrededor de las grandes estrellas, que bien hacen en existir por cierto, se ha vuelto a demostrar que la pelota es patrimonio de los jugones.", "De un tal Dani Olmo, que ha dado una clase magistral de lo que es jugar al fútbol incluso sin tocar la pelota, pero es que cuando la toca asiste de la manera que lo ha hecho a Pedro Porro, ese que casi llora cuando escuchó su nombre en la lista de convocados para el Mundial.", "Esa humildad, feliz por el simple hecho de estar entre los elegidos, le ha hecho llegar aquí, hacerse con el puesto de titular y ser decisivo en toda una semifinal, como también un Rodrigo Hernández, cuya jerarquía ha llegado a tiempo para poner el orden y el sentido del juego de España desde que se inició la cita mundialista, perfectamente secundado por Fabian Ruiz o por los cuatro defensas, e incluso con Unai Simón y su magnífico juego con el pie.", "Y por si acaso ahí está Lamine para ser más listo que ningún otro.", "Estamos ante una España que ya ha hecho historia con independencia de lo que pase el domingo.", "Vino con el cartel de favorita, arrancó con dudas y con injustificada críticas, para hacer ante Francia una demostración que está fuera del alcance de cualquier otro equipo, que es otra cosa que dejar sin opción a una selección con jugadores como Olise, Mbappé, Dembelé y otros muchos.", "Ahora toca esperar el rival, que conocerá de sobra cómo juega la España de Luis de la Fuente, pero también sabe que es muy difícil de contrarrestar ese poderío que no acapara los focos, pero sí los triunfos y los éxitos."], ["España llegó a Nueva York dándose pases.", "Un rondo gigante, como la América del Norte que se ha recorrido casi enterita desde que llegó el 5 de junio a la ya lejana Chattanooga.", "Un partido memorable.", "Una auténtica exhibición.", "Una lección de fútbol de esas que quedan para siempre.", "Una superioridad aplastante.", "Pocas veces se ha visto en estas instancias de un Mundial tanta diferencia entre un equipo coral, con estructura, y otro que no sabía dónde meterse.", "España era la kryptonita de Francia.", "Capturó sus poderes.", "Mbappé, Dembélé, Barcola, Olise, Doué parecieron absolutamente normales.", "España ganó desde la conversación futbolística.", "Ese es su gran mérito.", "Antes de salir a calentar sobre el césped del AT&T Stadium de Dallas, que ya queda para el recuerdo, Rodri, Fabián, Merino, Laporte y Cubarsí hablaban de fútbol.", "Les gusta lo que hacen.", "Lo estudian, lo trabajan Y lo desarrollan.", "Francia quiso ganar desde las estrellas.", "España tiene un fenómeno, Lamine, que se ha puesto al servicio del equipo.", "Incluso desde tan arriba quedó la sensación de que se lo pasaron bien.", "Rodri fue el emperador, Dani Olmo, una especie de prestidigitador.", "Nada por aquí, nada por allá.", "Perseguían sombras.", "Nuestros jugadores eran inalcanzables.", "La pelota, más.", "Con estas señas de identidad se hizo grande la Selección.", "Y con estas señas ha recuperado un sitio en la élite."], ["Yo soy español", "Es el cántico de todos los rincones de España desde las 11 de la noche.", "Lo han vuelto a hacer.", "Han logrado levantar la moral de 49 millones de compatriotas que han aparcado definitivamente sus problemas para adherirse a este ejército de la ilusión que unos días viste de rojo y otros de blanco, pero que siempre nos hace sentir que formamos parte de algo grandioso que pasará a los libros de Historia.", "Qué manera de jugar, qué solidaridad entre todos ellos, qué equipo más coral y más comprometido.", "Si fuese una familia sería la más envidiada del barrio.", "No hay egos, no hay traiciones, todos se respetan y ayudan al compañero sin mirar su jerarquía futbolística.", "Todos reman en la misma dirección, esa que ha llevado su maravilloso velero hacia las aguas del río Hudson de Nueva York.", "Tengo el móvil colapsado de mensajes de orgullo, de satisfacción por haber tenido la suerte de haber nacido en este bendito país.", "Gracias Luis de la Gente por recuperar la pasión por La Roja, gracias chavales por rescatar las Memorias de África, con aquella final de Johannesburgo que los descreídos de mi generación creíamos que no volveríamos a ver.", "Gracias por hacer de la humildad un valor tan poderoso como la calidad individual.", "Esta España es el mejor EQUIPO con diferencia de este Mundial que nos tiene enganchados como hacía mucho tiempo.", "Sólo pienso en lo feliz que estará allá arriba mi padre, que con el gol de Iniesta me llamó entusiasmado porque pensó que se iría de este mundo sin tener una estrella en su pecho.", "Ahora vamos a por la segunda, sin miedo y con mucha fuerza, la que te da una nación entera que está dispuesta a dejarse el alma por alentarte en busca de la gloria.", "¡¡¡Vamooooooos!!!", "Precedentes felices", "Al Gallo francés le tenemos comida la moral, la cresta y hasta sus mediáticos cacareos.", "No olvidemos que en la histórica cita de Dallas aterrizamos habiendo salido victoriosos de nuestros tres últimos combates.", "Sucedió en la gloriosa semifinal de la Eurocopa de 2024 en Múnich.", "Aquel golazo de Lamine iluminó la bombilla y Jesús Navas (jugó por la ausencia del heroico Carvajal, que se sacrificó en los cuartos de final placando a Musiala para evitar la derrota) fagocitó a Mbappé, que dio una asistencia y poco más.", "Ese mismo verano, en la final olímpica de París dimos una zurra histórica a los Bleus, con un 3-5 para la memoria con un doblete de Fermín y otro orgásmico de Camello en la prórroga.", "Y ojo que Olise, Doué y compañía estaban esa tarde en el campo...", "Otro gallo desplumado.", "Y hace un año les metimos una manita formidable en Stuttgart, en las semifinales de la Nations League.", "Nico Williams se salió y Lamine volvió a ver puerta.", "Ellos no lo pueden soportar.", "Somos su kryptonita...", "El extremeño me ha arrebatado el corazón.", "Debo pedirle disculpas porque mi pasión por Carvajal me hizo criticar su convocatoria.", "Soy un necio.", "Este héroe de Don Benito se ha consagrado como el mejor lateral derecho del Mundial, con actuaciones deslumbrantes y dos goles como dos soles, que confirman su polivalencia y su capacidad para ser diferencial arriba y abajo.", "Su 0-2 acabó con la resistencia francesa, que fue nula por momentos.", "Mbappé, Olise y Dembélé ni la olieron.", "Deschamps estaba desesperado en el banquillo, sin soluciones.", "Y las pocas que llegaron se encontraron a un Unai Simón eléctrico que salvó varios goles jugando de líbero.", "Pero el MVP de Porro es más que merecido.", "¡Viva Don Benito!", "Entre olés", "Una gozada escuchar a miles de españoles en las gradas de Dallas coreando entre olés las combinaciones sincronizadas de los nuestros.", "El Toro desplumó al Gallo.", "Otra vez.", "Francia, a nuestros pies."], ["El fútbol yo creo que ha hablado muy claramente en un partido de máxima exigencia y entre dos selecciones muy poderosas.", "Vamos a comentar.", "Muy buenas a todos, ¿qué tal?", "Bueno, ya os dije después de comentar el partido de España contra Francia, de esa victoria clarísima por parte de España, de esa exhibición de Rodri, de Fabián, de Dani Olmo, que creo que hay que sacar conclusiones también en Clave Real Madrid.", "Yo ya sé que el Mundial es una competición diferente, que se juega durante un mes, que hay un contexto muy determinado, pero a Rodri Hernández le llevamos mucho tiempo viendo este tipo de partidos.", "Siendo sinceros, el Rodrigo Hernández que gana el Balón de Oro en 2024 para mí no lo merecía él, lo merecía Vinicius y en eso me mantengo, pero para mí claramente el que había merecido el Balón de Oro en 2023 era el propio Rodri y el que merecía el Balón de Plata muy probablemente en 2024 también era Rodri.", "Ese jugador lo estamos viendo en el Mundial.", "Yo os he comentado en varias ocasiones que el Madrid tenía en agenda a Rodri, que Rodri tiene mucho interés en fichar por el Real Madrid, tiene mucho interés en volver a España y en jugar en el Madrid y que el Madrid iba a evaluar o quería evaluar con atención su final de temporada y su Mundial.", "Bueno, pues yo creo que no hay nada más que evaluar, de verdad, creo que no hay nada más que evaluar.", "Cuando yo he reflexionado, he opinado sobre el posible fichaje de Rodri, he manifestado mis dudas.", "No voy a hacer como que no recuerdo las dudas que os expuse aquí.", "La edad del jugador que va a cumplir 30 años, la lesión de rodilla, una lesión de rodilla pues complicada que puede derivar en otras lesiones musculares, todo eso es verdad, formaba parte de mi razonamiento a la hora de dudar del fichaje.", "Yo ya he visto lo suficiente, yo he visto un jugador que ha vuelto a su mejor nivel, he visto un jugador que lleva casi cuatro semanas de máxima exigencia en cuanto a la competición y va a más, he visto un jugador que tiraniza los partidos, que es el que más pases progresivos da en todo el Mundial, que se juega lo que él quiere básicamente, un jugador que domina, que domina completamente y que fue muy relevante para que España hiciera parecer a Francia una selección vulgar, algo que lleva ocurriendo, por cierto, en los últimos tres años, que España, y creo que es gracias a su centrocampismo, hace parecer muy vulgares a sus rivales, muy vulgares.", "Obviamente no es sólo por Rodri, Rodri, Fabián, esa es la base del centro del campo y después la velocidad, el ritmo que le mete Daniel un poco más adelantado, esa para mí está siendo la clave, la clave absoluta está siendo esa.", "Ahora se está hablando mal de Mbappé, de Dembélé, de Olise, de Barcolá, de Duhé, se va a hablar mal de ellos, igual que se ha hablado mal, por cierto, de los atacantes del Real Madrid cuando han vivido partidos parecidos al que vivió Francia contra España.", "Y yo tengo la sensación de que, simplemente con dos cambios, si metes a Fabián y a Rodri en Francia y metes a Chouameni y a Rabiot en España, creo que el resultado habría sido opuesto en favor de Francia.", "Creo que habríamos visto un mejor partido de Mbappé, de Dembélé, de Olise, de Duhé, de los atacantes que tiene Francia, que seguramente son de más nivel que los atacantes que tiene España.", "Y es que en el alto nivel, el centro del campo es fundamental.", "El Real Madrid ha tenido a los mejores centrocampistas del mundo hasta hace poco.", "Casemiro, Modric, Kroos, ese centro del campo junto con Isco, bueno, marcó una era, evidentemente.", "Después el Madrid ha ido perdiéndolos poco a poco a estos jugadores y sustituyéndolos por otros que no tienen simplemente el mismo nivel, no tienen el nivel que tenían Modric y Kroos, como tampoco es algo que deba extrañarnos demasiado, es algo normal, es algo natural.", "Creo que el Madrid debe volver a procurar tener a los mejores centrocampistas del mundo y se da la circunstancia de que varios de los mejores centrocampistas del mundo son españoles.", "Llegamos un tiempo viéndolo.", "Podemos ponernos una venda o podemos aceptar una realidad que es muy clara y es que varios de los mejores centrocampistas del mundo están en España y el Real Madrid no tiene a ninguno.", "Pero se da la circunstancia de que este verano en concreto hay uno que quiere jugar en el Madrid cuyo precio no creo que fuese absolutamente prohibitivo, dado que sólo tiene un año de contrato más con el Manchester City y que está siendo una de las grandes estrellas del mundial, por si faltaba algo.", "Por si faltaba algo, está siendo una de las grandes estrellas del mundial.", "Creo que el Madrid debería volver a pensar lo de Rodri.", "Yo sé que hay ciertas dudas porque el estilo del Madrid es un estilo un poco más anárquico o no es tan definido y Rodri en determinados contextos de partido puede sufrir, si tiene que correr para atrás, si tiene que cubrir muchos campos, si tiene que hacer muchas ayudas defensivas, aunque bueno, es impresionante la cantidad de balones que está recuperando en el mundial, la cantidad de balones rechazados que le gana él no por casualidad, es impresionante cómo está dominando la frontal también, cómo está bloqueando tiros, es decir, a nivel defensivo el rendimiento está siendo espectacular.", "Un gol ha recibido España en todo el mundial.", "Pero es que creo que Rodri es un jugador de tal categoría que puede llevarte a jugar a lo que realmente le interesa el jugar y creo que Rodri es un jugador que es capaz de potenciar en gran medida a Vinicius, Mbappé, Bellingham, los atacantes del Real Madrid, que son los mejores atacantes del mundo.", "Sé que ha renovado Chameny, sé que a priori, pues eso complica las cosas, pero yo no me costaría, llegados a este punto ya, apostar por un Chameny y Rodri, que yo sé que también he visto o tengo muchas dudas sobre la compatibilidad de ambos, pero es que creo que Chameny también disfrutaría mucho jugando al lado de Rodri y que el Madrid desde luego ganaría muchísima seguridad con ese centro del campo.", "Puedes meter también a Bernardo al lado de Rodri, ya han jugado en el Manchester City, puedes meter a Arda Buller, puedes hacer muchas cosas porque es un jugador que realmente domina la escena, que domina los partidos, domina las competiciones y creo que lo estamos volviendo a ver.", "Después de un tiempo razonable, de convalecencia, después de una lesión, creo que lo estamos volviendo a ver con claridad.", "No sé, la información que tengo, por lo menos hasta la noche del partido, es que es un fichaje que no se va a hacer, pero creo que el Madrid debería planteárselo, creo que el Madrid debería darle una buena pensada.", "Evidentemente, no sería un argumento de peso para no fichar a Rodri el hecho de que, bueno, aparentemente o pudiese haberse comprometido con Riquelme, ya sabéis que Riquelme anunció su fichaje, hubo ahí un cierto desmentido, pero bueno, tampoco demasiado contundente, me da igual.", "O sea, creo que no debería ser un argumento de peso, desde luego, que Rodri, queriendo jugar en el Madrid, pues estuviese dispuesto a llegar a un acuerdo con Riquelme, que era un candidato a la presidencia del Madrid, aunque evidentemente un candidato pues con muchas menos posibilidades que Florentino, como vimos.", "Creo que eso no debería ser un argumento.", "Creo que en todo caso deberá ser una decisión futbolística y económica, pero es que todo confluye para mí en que Rodri pueda de verdad ser un fichaje de lujo para el Real Madrid e ir divisando opciones de otros centrocampistas en el futuro que tengan ese estilo, ese estilo que te permite controlar los partidos y que te permite que tus atacantes, que son los mejores jugadores del mundo, estén en ventaja en el partido.", "Hoy hemos visto una Francia que se ha parecido a la peor versión del Madrid en las últimas dos temporadas, con grandes jugadores arriba pero desconectados.", "Hoy hemos visto una España que se ha parecido mucho al PSG que lleva dominando dos años.", "Así que me gustaría saber también vuestra opinión y sin más me despido, espero vuestros comentarios.", "Si os ha gustado el vídeo, dejad un like, compartidlo y suscribíos al canal, los que no lo estáis.", "Un fuerte abrazo."]], "meta": [{"autor": "José Félix Díaz", "medio": "Director de As", "titulo": "Un histórico baile nos lleva a Nueva York"}, {"autor": "Juan Jiménez", "medio": "", "titulo": "Un rondo gigante hasta Nueva York"}, {"autor": "Tomás Roncero", "medio": "", "titulo": "¡Olé, olé, olé, olé y olé!"}, {"autor": "Ramón Álvarez de Mon", "medio": "Transcripción de su vídeo de YouTube", "titulo": "El fichaje de Rodri"}], "preg": [{"col": 0, "t": "Columna de José Félix Díaz", "min": 5, "cas": [{"tipo": "toca", "t": "Toca la frase que resume la idea", "ok": [0, 4], "max": 1, "neg": [1, 3, 5, 6, 8], "porque": "La idea es que el fútbol es de quien sabe jugar con la pelota y que España domina por eso. La dice al empezar y la repite con «la pelota es patrimonio de los jugones»."}, {"tipo": "toca", "t": "Toca las frases con hechos del partido", "ok": [5, 6], "max": 2, "neg": [0, 1, 4, 8], "porque": "Los hechos son la asistencia de Olmo a Porro, Porro titular y decisivo en la semifinal, el orden de Rodri y el juego con el pie de Unai Simón. «Se recordará en los libros» y «ya ha hecho historia» son valoraciones."}, {"tipo": "elige", "t": "¿Cómo empieza la columna?", "ops": ["Con el resultado del partido", "Con la idea que defiende", "Con una anécdota del vestuario", "Con una cita de un jugador"], "ok": 1, "max": 1, "porque": "Empieza con la idea, «en el fútbol mandan los que tocan la pelota», y deja el partido para después."}, {"tipo": "elige", "t": "¿Qué supone que la firme el director de As?", "ops": ["Su opinión compromete al periódico y por eso el tono es contenido", "Puede opinar sin dar datos", "No puede criticar a la selección"], "ok": 0, "max": 1, "porque": "Cuando firma el director, su opinión es también la voz del periódico, y por eso celebra con contención."}]}, {"col": 1, "t": "Columna de Juan Jiménez", "min": 5, "cas": [{"tipo": "toca", "t": "Toca la idea", "ok": [10], "max": 1, "neg": [2, 3, 4, 5, 7, 12, 18], "porque": "La idea es «España ganó desde la conversación futbolística», y todo lo demás la rodea."}, {"tipo": "toca", "t": "Toca el hecho que vio el autor", "ok": [12], "max": 1, "neg": [2, 3, 4, 5, 7, 10, 18], "porque": "El hecho observado es que, antes de calentar, Rodri, Fabián, Merino, Laporte y Cubarsí hablaban de fútbol. Sobre ese detalle sostiene su idea."}, {"tipo": "toca", "t": "Toca las valoraciones sin prueba", "ok": [2, 3, 4, 5], "max": 4, "neg": [0, 1, 7, 8, 12, 18, 19, 20], "porque": "«Un partido memorable», «una auténtica exhibición», «una lección de fútbol» y «una superioridad aplastante» son juicios sin ningún dato que los sostenga."}, {"tipo": "toca", "t": "Toca las metáforas o comparaciones", "ok": [1, 7, 8, 18, 19, 20], "max": 4, "neg": [2, 3, 4, 5, 10, 12], "porque": "Son metáforas o comparaciones el rondo gigante, la kryptonita, «capturó sus poderes», el emperador y el prestidigitador, «nada por aquí, nada por allá» y «perseguían sombras». Adornan la idea, pero no la demuestran."}]}, {"col": 2, "t": "Columna de Tomás Roncero", "min": 5, "cas": [{"tipo": "toca", "t": "Toca las frases de aficionado", "ok": [3, 8, 12, 13, 14, 36], "max": 3, "neg": [18, 20, 23, 31], "porque": "Escribe como aficionado cuando habla de los 49 millones de compatriotas, de su móvil colapsado y el «bendito país», del recuerdo de su padre, del «vamos a por la segunda», del «¡¡¡Vamooooooos!!!» y del «¡Viva Don Benito!»."}, {"tipo": "toca", "t": "Toca las frases que se burlan del rival", "ok": [16, 22, 25, 26, 32, 33, 39, 41], "max": 4, "neg": [18, 20, 23, 8, 12], "porque": "Se burla del rival con el gallo francés y su cresta, «otro gallo desplumado», «ellos no lo pueden soportar», «somos su kryptonita», «ni la olieron», Deschamps desesperado, «el Toro desplumó al Gallo» y «Francia, a nuestros pies»."}, {"tipo": "toca", "t": "Toca los datos que se pueden comprobar", "ok": [18, 20, 23, 30, 31], "max": 3, "neg": [3, 8, 12, 14, 16, 25], "porque": "Se pueden comprobar la semifinal de la Eurocopa 2024 en Múnich, el 3-5 de la final olímpica de París, la goleada de Stuttgart en la Nations League, los dos goles de Porro y su 0-2."}, {"tipo": "elige", "t": "¿Por qué se acepta este tono?", "ops": ["Porque juega la selección y todo el público va con el mismo equipo", "Porque es una crónica del partido", "Porque el autor es exfutbolista"], "ok": 0, "max": 1, "porque": "Se acepta porque juega la selección y el lector va con el mismo equipo. Con un club, ese tono se vería como periodismo de bufanda."}]}, {"col": 3, "t": "Transcripción del vídeo de Álvarez de Mon", "min": 5, "cas": [{"tipo": "toca", "t": "Toca los datos que se pueden comprobar", "ok": [11, 12, 24, 28], "max": 4, "neg": [15, 16, 33, 7, 0, 8, 29, 41], "porque": "Se pueden comprobar la edad y la lesión de rodilla, que es el que más pases progresivos da del Mundial, que le queda un año de contrato con el City y que España solo ha encajado un gol."}, {"tipo": "toca", "t": "Toca la afirmación imposible de comprobar", "ok": [15, 16], "max": 1, "neg": [11, 12, 24, 28], "porque": "Nadie puede comprobar qué habría pasado cambiando a Rodri y Fabián por Chouaméni y Rabiot. Suena a análisis, pero es un partido que no existe."}, {"tipo": "toca", "t": "Toca la información sin fuente", "ok": [7, 24, 33], "max": 2, "neg": [11, 12, 15, 28], "porque": "Da como ciertas, sin decir de dónde salen, varias cosas, que Rodri tiene mucho interés en fichar por el Madrid, que quiere jugar allí y «la información que tengo» de que el fichaje no se va a hacer."}, {"tipo": "toca", "t": "Toca dónde cambia de opinión", "ok": [9, 10, 11, 12], "max": 2, "neg": [5, 15, 33, 41], "porque": "Reconoce que dudaba por la edad y la rodilla, «no voy a hacer como que no recuerdo las dudas», y explica por qué ya no duda, «yo ya he visto lo suficiente»."}, {"tipo": "elige", "t": "¿A quién se dirige?", "ops": ["A la afición del Madrid", "A los lectores de un periódico", "A los técnicos de la selección"], "ok": 0, "max": 1, "porque": "Habla para la afición del Madrid. Saca conclusiones «en clave Real Madrid» y pide la opinión de quienes le siguen."}]}, {"col": null, "t": "Las cuatro columnas", "min": 6, "cas": [{"tipo": "empareja", "t": "Empareja cada columna con lo que hay detrás de su firma", "filas": ["Columna 1 · José Félix Díaz", "Columna 2 · Juan Jiménez", "Columna 3 · Tomás Roncero", "Columna 4 · Álvarez de Mon"], "ops": ["El periódico", "El estilo propio del autor", "El personaje de aficionado", "El canal y su audiencia"], "ok": [0, 1, 2, 3], "max": 4, "porque": "La 1 la firma el director y habla el periódico, la 2 se apoya en el estilo del autor, la 3 en su personaje de aficionado y la 4 en su canal y su audiencia."}, {"tipo": "elige", "t": "¿Cuál es la más emocional?", "ops": ["La 1", "La 2", "La 3", "La 4"], "ok": 2, "max": 1, "porque": "La de Roncero es la más emocional, con los olés, su padre y el «¡¡¡Vamooooooos!!!»."}, {"tipo": "elige", "t": "¿Cuál apoya su idea en algo que vio el autor y no en datos?", "ops": ["La 1", "La 2", "La 3", "La 4"], "ok": 1, "max": 1, "porque": "Juan Jiménez apoya su idea en lo que vio antes del partido, los jugadores hablando de fútbol."}, {"tipo": "varias", "t": "¿En cuáles reconoce el autor que dudaba o que se equivocó? Puede ser más de una", "ops": ["La 1", "La 2", "La 3", "La 4"], "ok": [2, 3], "max": 2, "porque": "Roncero pide perdón por criticar la convocatoria de Porro y Álvarez de Mon reconoce que dudaba del fichaje de Rodri."}, {"tipo": "elige", "t": "¿Cuál propone algo para el futuro además de valorar el partido?", "ops": ["La 1", "La 2", "La 3", "La 4"], "ok": 3, "max": 1, "porque": "Álvarez de Mon propone que el Madrid fiche a Rodri."}, {"tipo": "elige", "t": "¿Cuál da información sin decir de dónde sale?", "ops": ["La 1", "La 2", "La 3", "La 4"], "ok": 3, "max": 1, "porque": "Álvarez de Mon dice «la información que tengo» y da por hecho el interés de Rodri sin citar a nadie."}]}]};

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 30;

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "columna" });
    if (p.a === "datos") return salida(datosPublicos());
    if (!ACCIONES[p.a] && p.a !== "state") return salida({ error: "Acción desconocida" });
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try { return salida(p.a === "state" ? estado(p) : ACCIONES[p.a](p)); }
    finally { lock.releaseLock(); }
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

function cod(c) { return String(c || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6); }
function leer(k) { var v = P.getProperty(k); return v ? JSON.parse(v) : null; }
function guardar(g) { P.setProperty("G_" + g.code, JSON.stringify(g)); }
function partida(c) {
  var g = leer("G_" + cod(c));
  if (!g) throw new Error("No existe ninguna partida con el código " + cod(c));
  return g;
}
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla del profesor puede hacer esto"); }
function normal(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }

function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now();
  for (var k in todo) if (k.indexOf("G_") === 0) {
    try { if (ahora - JSON.parse(todo[k]).created > 24 * 3600 * 1000) P.deleteProperty(k); } catch (x) {}
  }
}

// Lo que ven los móviles antes de cerrar cada pregunta, sin soluciones
function datosPublicos() {
  return {
    ok: true, cols: DATOS.cols, meta: DATOS.meta,
    preg: DATOS.preg.map(function (q) {
      return { col: q.col, t: q.t, min: q.min, cas: q.cas.map(function (c) {
        return { tipo: c.tipo, t: c.t, ops: c.ops, filas: c.filas, max: c.max };
      }) };
    })
  };
}

// ── puntuación automática de una casilla ──
function puntuar(c, v) {
  var r = { pts: 0, max: c.max, good: [], bad: [], miss: [] };
  if (c.tipo === "toca" || c.tipo === "varias") {
    var sel = Array.isArray(v) ? v : [];
    var neg = c.tipo === "varias" ? null : c.neg;
    sel.forEach(function (i) {
      if (c.ok.indexOf(i) >= 0) r.good.push(i);
      else if (neg === null || neg.indexOf(i) >= 0) r.bad.push(i);
    });
    r.miss = c.ok.filter(function (i) { return sel.indexOf(i) < 0; });
    r.pts = Math.min(r.good.length, c.max) - r.bad.length;
  } else if (c.tipo === "elige") {
    r.sel = (v === undefined || v === null) ? -1 : v;
    r.pts = v === c.ok ? 1 : 0;
  } else if (c.tipo === "empareja") {
    var a = Array.isArray(v) ? v : [];
    r.sel = c.ok.map(function (_, i) { return (a[i] === undefined || a[i] === null) ? -1 : a[i]; });
    r.pts = c.ok.filter(function (o, i) { return a[i] === o; }).length;
  }
  return r;
}

function cerrar(g) {
  var q = DATOS.preg[g.q], sel = g.sel[g.q] || {}, res = {};
  for (var dev in g.teams) {
    var mias = sel[dev] || {}, cas = [], tot = 0;
    q.cas.forEach(function (c, ci) { var r = puntuar(c, mias[ci]); cas.push(r); tot += r.pts; });
    tot = Math.max(0, tot);
    res[dev] = { pts: tot, cas: cas };
    g.total[dev] = (g.total[dev] || 0) + tot;
  }
  g.res[g.q] = res;
  g.status = "r";
}

function clasificacion(g) {
  var arr = Object.keys(g.teams).map(function (d) {
    var r = g.res[g.q] && g.res[g.q][d];
    return { dev: d, name: g.teams[d].name, total: g.total[d] || 0, ronda: r ? r.pts : 0 };
  });
  arr.sort(function (a, b) { return b.total - a.total || b.ronda - a.ronda || a.name.localeCompare(b.name); });
  var pos = 0, ant = null;
  arr.forEach(function (x, i) { if (ant === null || x.total !== ant) { pos = i + 1; ant = x.total; } x.pos = pos; });
  return arr;
}

function solucion(qi) {
  return DATOS.preg[qi].cas.map(function (c) { return { ok: c.ok, neg: c.neg || [], porque: c.porque }; });
}

function llena(v) {
  if (Array.isArray(v)) return v.some(function (x) { return x !== null && x !== undefined; });
  return v !== null && v !== undefined;
}

function estado(p) {
  var g = partida(p.c);
  if (g.status === "q" && Date.now() > g.deadline + 1500) { cerrar(g); guardar(g); }
  var esProfe = String(p.k || "") === g.admin;
  var dev = String(p.dev || "");
  var r = { ok: true, now: Date.now(), code: g.code, status: g.status, q: g.q, deadline: g.deadline, nq: DATOS.preg.length };
  var cl = (g.status === "r" || g.status === "fin") ? clasificacion(g) : null;
  if (esProfe) {
    var sel = g.sel[g.q] || {}, done = g.done[g.q] || {};
    r.teams = Object.keys(g.teams).map(function (d) {
      var mias = sel[d] || {}, n = 0;
      for (var ci in mias) if (llena(mias[ci])) n++;
      return { name: g.teams[d].name, done: !!done[d], tocadas: n, total: g.total[d] || 0 };
    });
    if (cl) {
      r.clas = cl.map(function (x) { return { name: x.name, total: x.total, ronda: x.ronda, pos: x.pos }; });
      if (g.status === "r") {
        r.sol = solucion(g.q);
        var res = g.res[g.q] || {}, nT = Object.keys(res).length;
        r.medias = DATOS.preg[g.q].cas.map(function (c, ci) {
          var s = 0; for (var d in res) s += Math.max(0, res[d].cas[ci].pts);
          return nT ? Math.round(10 * s / nT) / 10 : 0;
        });
      }
    }
  }
  var yo = g.teams[dev];
  if (yo) {
    r.me = { name: yo.name, sel: (g.sel[g.q] || {})[dev] || {}, done: !!((g.done[g.q] || {})[dev]), total: g.total[dev] || 0 };
    if (g.status === "r") { r.me.res = (g.res[g.q] || {})[dev] || null; r.sol = solucion(g.q); }
    if (cl) cl.forEach(function (x) { if (x.dev === dev) r.me.pos = x.pos; });
    r.nteams = Object.keys(g.teams).length;
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
      status: "lobby", q: -1, deadline: 0, teams: {}, sel: {}, done: {}, res: {}, total: {} };
    guardar(g);
    return { ok: true, code: code, admin: g.admin };
  },

  "join": function (p) {
    var g = partida(p.c), dev = String(p.dev || "").slice(0, 40);
    if (!dev) throw new Error("Falta el identificador del móvil");
    var nombre = String(p.name || "").trim().replace(/\s+/g, " ").slice(0, 30);
    if (!nombre) throw new Error("Escribe el nombre del equipo");
    if (!g.teams[dev]) {
      if (Object.keys(g.teams).length >= MAX_EQUIPOS) throw new Error("La partida está llena");
      for (var d in g.teams) if (normal(g.teams[d].name) === normal(nombre)) throw new Error("Ya hay un equipo con ese nombre");
    }
    g.teams[dev] = { name: nombre };
    guardar(g);
    return { ok: true };
  },

  // guarda lo que el equipo ha marcado en una casilla (se guarda en cada toque)
  "sel": function (p) {
    var g = partida(p.c), dev = String(p.dev || "");
    if (!g.teams[dev]) throw new Error("Vuelve a entrar con el nombre del equipo");
    if (g.status !== "q" || Number(p.q) !== g.q || Date.now() > g.deadline + 1500) throw new Error("El tiempo de esta pregunta se ha acabado");
    var c = DATOS.preg[g.q].cas[Number(p.ci)];
    if (!c) throw new Error("Esa casilla no existe");
    var v = p.v;
    if (c.tipo === "toca" || c.tipo === "varias") v = (Array.isArray(v) ? v : []).map(Number).filter(function (x, i, a) { return x >= 0 && a.indexOf(x) === i; }).slice(0, 60);
    else if (c.tipo === "elige") v = (v === null || v === undefined || v === "") ? null : Number(v);
    else if (c.tipo === "empareja") v = (Array.isArray(v) ? v : []).slice(0, c.ok.length).map(function (x) { return (x === null || x === "" || x === undefined) ? null : Number(x); });
    g.sel[g.q] = g.sel[g.q] || {};
    g.sel[g.q][dev] = g.sel[g.q][dev] || {};
    g.sel[g.q][dev][Number(p.ci)] = v;
    guardar(g);
    return { ok: true };
  },

  "done": function (p) {
    var g = partida(p.c), dev = String(p.dev || "");
    if (!g.teams[dev]) throw new Error("Vuelve a entrar con el nombre del equipo");
    if (g.status !== "q") throw new Error("No hay ninguna pregunta abierta");
    g.done[g.q] = g.done[g.q] || {};
    if (p.undo) delete g.done[g.q][dev]; else g.done[g.q][dev] = 1;
    guardar(g);
    return { ok: true };
  },

  "start": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "q" || g.status === "l") throw new Error("Ya hay una pregunta en marcha");
    var qi = (p.q === undefined || p.q === null) ? g.q + 1 : Number(p.q);
    if (!DATOS.preg[qi]) throw new Error("No hay más preguntas");
    if (!Object.keys(g.teams).length) throw new Error("Todavía no ha entrado ningún equipo");
    if (g.res[qi]) {   // si se repite una pregunta, se descuentan sus puntos anteriores
      for (var d in g.res[qi]) g.total[d] = (g.total[d] || 0) - g.res[qi][d].pts;
      delete g.res[qi];
    }
    g.q = qi; g.sel[qi] = {}; g.done[qi] = {};
    if (DATOS.preg[qi].col !== null) { g.status = "l"; g.deadline = 0; }   // lectura sin reloj, la cierra el profesor
    else { g.status = "q"; g.deadline = Date.now() + DATOS.preg[qi].min * 60000; }
    guardar(g);
    return { ok: true };
  },

  // fin de la lectura: se abren las casillas y empieza el reloj
  "go": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "l") throw new Error("No hay ninguna lectura en marcha");
    g.status = "q"; g.deadline = Date.now() + DATOS.preg[g.q].min * 60000;
    guardar(g);
    return { ok: true };
  },

  "extend": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "q") throw new Error("No hay ninguna pregunta en marcha");
    g.deadline += (Number(p.s) || 60) * 1000;
    guardar(g);
    return { ok: true };
  },

  "close": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "q") throw new Error("No hay ninguna pregunta en marcha");
    cerrar(g); guardar(g);
    return { ok: true };
  },

  "final": function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status === "q" || g.status === "l") throw new Error("Cierra antes la pregunta");
    g.status = "fin"; guardar(g);
    return { ok: true };
  },

  "kick": function (p) {
    var g = partida(p.c); admin(g, p.k);
    for (var d in g.teams) if (g.teams[d].name === p.name) { delete g.teams[d]; delete g.total[d]; }
    guardar(g);
    return { ok: true };
  }
};
