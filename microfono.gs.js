
/**
 * EL MICRÓFONO · servidor · v1
 * Juego de entrevistas para Periodismo Deportivo. Por equipos; cada equipo responde desde su móvil
 * y la profesora puntúa en el proyector. Tres retos que se alternan: la siguiente pregunta,
 * ¿dónde falló el periodista? y el titular. Desde la segunda ronda se puede lanzar la Gran Final
 * (4 rondas con los dos mejores, marcador a cero). La clave y el criterio de cada ronda no salen
 * nunca del servidor hacia los móviles de los equipos.
 * Puntuación: la pantalla genera un texto con la ronda, la clave y las respuestas; la profesora lo
 * pega en un chat con Claude y pega de vuelta la respuesta (Equipo:puntos:comentario). Sin API de pago.
 */

var P = PropertiesService.getScriptProperties();
var MAX_EQUIPOS = 14;

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return responder(p);
}
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function responder(p) {
  try {
    if (p.a === "ping") return salida({ ok: true, juego: "microfono" });
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
function guardarPartida(g) { guardar("G_" + g.code, g); }
function admin(g, k) { if (String(k) !== g.admin) throw new Error("Solo la pantalla de la profesora puede hacer esto"); }
function limpiarViejas() {
  var todo = P.getProperties(), ahora = Date.now();
  for (var k in todo) if (k.indexOf("G_") === 0) {
    try { var g = JSON.parse(todo[k]); if (ahora - g.created > 24 * 3600 * 1000) P.deleteProperty(k); } catch (x) {}
  }
}
function nuevoCodigo() {
  var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ", c = "";
  for (var i = 0; i < 4; i++) c += letras.charAt(Math.floor(Math.random() * letras.length));
  return c;
}
function nuevaClave() {
  var s = "abcdefghijklmnopqrstuvwxyz0123456789", k = "";
  for (var i = 0; i < 16; i++) k += s.charAt(Math.floor(Math.random() * s.length));
  return k;
}

// ── lógica del juego ──
function equiposActivos(g) {
  if (g.status === "final" || (g.status === "over" && g.finalists)) {
    return g.finalists.map(function (id) {
      var t = g.teams.filter(function (x) { return x.id === id; })[0];
      return { id: id, name: t ? t.name : "?", pts: g.fp[id] || 0 };
    });
  }
  return g.teams.map(function (t) { return { id: t.id, name: t.name, pts: t.pts }; });
}
function elegir(g, modo) {
  var pool = modo === 1 ? SITUACIONES : modo === 2 ? ENTREVISTAS_FALLO : ENTREVISTAS_TITULAR;
  var usados = g.used[modo] || [];
  var libres = [];
  for (var i = 0; i < pool.length; i++) if (usados.indexOf(i) < 0) libres.push(i);
  if (!libres.length) { usados = []; for (var j = 0; j < pool.length; j++) libres.push(j); }
  var idx = libres[Math.floor(Math.random() * libres.length)];
  usados.push(idx);
  g.used[modo] = usados;
  return pool[idx];
}
function abrirRonda(g, modo, contenido) {
  g.modo = modo;
  g.contenido = contenido;
  g.phase = "open";
  g.answers = {};
  g.verdicts = null;
  g.prompt = null;
}
function nombreModo(id) { for (var i = 0; i < MODOS.length; i++) if (MODOS[i].id === id) return MODOS[i].nombre; return ""; }

function construirPrompt(g) {
  var eq = equiposActivos(g), c = g.contenido, modo = g.modo;
  var lista = eq.map(function (e) {
    var r = String(g.answers[e.id] || "").trim();
    return "- " + e.name + ": " + (r || "(sin respuesta)");
  }).join("\n");
  var cabecera, criterio;
  if (modo === 1) {
    cabecera = "SITUACIÓN: " + c.texto;
    criterio = "CLAVE (lo que hace buena a una pregunta aquí): " + c.dardo + "\n\nCriterio de puntuación (0 a 3):\n3 = la pregunta persigue exactamente el hilo revelador; 2 = correcta pero no la mejor; 1 = floja o previsible; 0 = banal (\"¿qué sientes?\") o fuera de lugar.";
  } else if (modo === 2) {
    var tt = c.turnos.map(function (t, i) { return "P" + (i + 1) + ": " + t.p + "\nR" + (i + 1) + ": " + t.r; }).join("\n");
    cabecera = "ENTREVISTA (" + c.contexto + "):\n" + tt;
    criterio = "EL FALLO PRINCIPAL: la pregunta P" + (c.failIndex + 1) + " desaprovechó la respuesta anterior. " + c.explica + "\n\nCada equipo responde con el número de pregunta donde falló el periodista y la pregunta que ellos habrían hecho ahí.\nCriterio de puntuación (0 a 3), premia el criterio aunque no acierten el número exacto:\n3 = señala el fallo principal (P" + (c.failIndex + 1) + ") y su pregunta recoge bien el hilo; 2 = señala el fallo principal con pregunta floja, O señala una puerta secundaria real bien defendida; 1 = punto poco defendible o pregunta que no aporta; 0 = no había nada que profundizar ahí.";
  } else {
    var t3 = c.turnos.map(function (t) { return "P: " + t.p + "\nR: " + t.r; }).join("\n");
    cabecera = "ENTREVISTA (" + c.contexto + "):\n" + t3;
    criterio = "CLAVE (dónde está el buen titular): " + c.clave + "\n\nCriterio de puntuación (0 a 3):\n3 = pesca la idea más valiosa y tiene gancho propio; 2 = pesca lo importante pero sin gancho, o viceversa; 1 = anecdótico o tópico; 0 = banal o ignora lo jugoso.";
  }
  return "Eres el árbitro de \"El Micrófono\", un juego de clase de periodismo deportivo. Puntúa cada respuesta de 0 a 3 según el criterio.\n\n" +
    cabecera + "\n\n" + criterio + "\n\nRespuestas de los equipos:\n" + lista +
    "\n\nResponde ÚNICAMENTE con una línea por equipo, en este formato exacto y nada más (sin JSON, sin explicación aparte):\nNombreDelEquipo:puntos:comentario breve en español (máximo 15 palabras)\n\nEjemplo de una línea: Los Tiburones:2:Buena pregunta, pero deja parte del hilo sobre la mesa";
}

function leerNotas(texto, eq) {
  var res = {};
  String(texto || "").split("\n").forEach(function (linea) {
    linea = linea.trim();
    if (!linea) return;
    var partes = linea.split(":");
    if (partes.length < 2) return;
    var nombre = partes[0].replace(/^[\s\-\*•]+/, "").trim().toLowerCase();
    var pts = Math.max(0, Math.min(3, parseInt(partes[1], 10) || 0));
    var com = partes.slice(2).join(":").trim();
    for (var i = 0; i < eq.length; i++) {
      if (eq[i].name.trim().toLowerCase() === nombre) { res[eq[i].id] = { p: pts, c: com }; break; }
    }
  });
  return res;
}

var ACCIONES = {
  new: function (p) {
    limpiarViejas();
    var code;
    do { code = nuevoCodigo(); } while (leer("G_" + code));
    var g = {
      code: code, admin: nuevaClave(), created: Date.now(), status: "lobby",
      teams: [], nextId: 1, round: 0, modo: null, contenido: null, phase: null,
      answers: {}, verdicts: null, prompt: null, used: { 1: [], 2: [], 3: [] },
      finalIdx: 0, finalists: null, fp: {}, champion: null
    };
    guardarPartida(g);
    return { ok: true, c: code, k: g.admin };
  },
  join: function (p) {
    var g = partida(p.c);
    if (g.status === "over") throw new Error("La partida ya ha terminado");
    var nombre = String(p.n || "").replace(/[:\n\r]/g, " ").trim().slice(0, 24);
    if (!nombre) throw new Error("Escribe el nombre de tu equipo");
    var ya = g.teams.filter(function (t) { return t.name.toLowerCase() === nombre.toLowerCase(); })[0];
    if (ya) return { ok: true, t: ya.id, name: ya.name };
    if (g.status !== "lobby") throw new Error("La partida ya ha empezado. Pide a la profesora que te apunte antes de empezar.");
    if (g.teams.length >= MAX_EQUIPOS) throw new Error("Ya hay " + MAX_EQUIPOS + " equipos");
    var t = { id: g.nextId++, name: nombre, pts: 0 };
    g.teams.push(t);
    guardarPartida(g);
    return { ok: true, t: t.id, name: t.name };
  },
  remove: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "lobby") throw new Error("Solo se pueden quitar equipos antes de empezar");
    g.teams = g.teams.filter(function (t) { return t.id !== Number(p.t); });
    guardarPartida(g);
    return { ok: true };
  },
  start: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "lobby") throw new Error("La partida ya ha empezado");
    if (!g.teams.length) throw new Error("Todavía no hay ningún equipo");
    g.status = "play";
    g.round = 0;
    abrirRonda(g, MODOS[0].id, elegir(g, MODOS[0].id));
    guardarPartida(g);
    return { ok: true };
  },
  answer: function (p) {
    var g = partida(p.c);
    if (g.phase !== "open" || (g.status !== "play" && g.status !== "final")) throw new Error("La ronda está cerrada");
    var id = Number(p.t);
    var ok = equiposActivos(g).filter(function (e) { return e.id === id; })[0];
    if (!ok) throw new Error("Tu equipo no juega esta ronda");
    g.answers[id] = String(p.x || "").slice(0, 700);
    guardarPartida(g);
    return { ok: true };
  },
  close: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase !== "open") throw new Error("No hay ronda abierta");
    g.phase = "closed";
    g.prompt = construirPrompt(g);
    guardarPartida(g);
    return { ok: true };
  },
  reopen: function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.phase = "open"; g.prompt = null; g.verdicts = null;
    guardarPartida(g);
    return { ok: true };
  },
  notes: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase !== "closed") throw new Error("Primero cierra las respuestas");
    var eq = equiposActivos(g);
    var v = leerNotas(p.x, eq);
    if (!Object.keys(v).length) throw new Error("No he podido leer ninguna nota. El formato es Equipo:puntos:comentario, una línea por equipo.");
    eq.forEach(function (e) { if (!v[e.id]) v[e.id] = { p: 0, c: "(sin nota)" }; });
    g.verdicts = v; g.phase = "judged";
    guardarPartida(g);
    return { ok: true };
  },
  manual: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase !== "closed") throw new Error("Primero cierra las respuestas");
    var v = {};
    equiposActivos(g).forEach(function (e) { v[e.id] = { p: 0, c: "" }; });
    g.verdicts = v; g.phase = "judged";
    guardarPartida(g);
    return { ok: true };
  },
  adjust: function (p) {
    var g = partida(p.c); admin(g, p.k);
    var id = Number(p.t), d = Number(p.d) || 0;
    if (!g.verdicts || !g.verdicts[id]) throw new Error("Sin veredicto para ese equipo");
    g.verdicts[id].p = Math.max(0, Math.min(3, g.verdicts[id].p + d));
    guardarPartida(g);
    return { ok: true };
  },
  confirm: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.phase !== "judged" || !g.verdicts) throw new Error("No hay veredicto que confirmar");
    var enFinal = g.status === "final";
    equiposActivos(g).forEach(function (e) {
      var s = g.verdicts[e.id] ? g.verdicts[e.id].p : 0;
      if (enFinal) g.fp[e.id] = (g.fp[e.id] || 0) + s;
      else g.teams.forEach(function (t) { if (t.id === e.id) t.pts += s; });
    });
    if (enFinal) {
      g.finalIdx += 1;
      if (g.finalIdx >= GRAN_FINAL.length) {
        var a = g.finalists[0], b = g.finalists[1];
        g.champion = (g.fp[a] || 0) === (g.fp[b] || 0) ? "tie" : ((g.fp[a] || 0) > (g.fp[b] || 0) ? a : b);
        g.status = "over"; g.phase = null; g.contenido = null; g.verdicts = null; g.answers = {}; g.prompt = null;
      } else {
        abrirRonda(g, GRAN_FINAL[g.finalIdx].modo, GRAN_FINAL[g.finalIdx].contenido);
      }
    } else {
      g.round += 1;
      var modo = MODOS[g.round % 3].id;
      abrirRonda(g, modo, elegir(g, modo));
    }
    guardarPartida(g);
    return { ok: true };
  },
  final: function (p) {
    var g = partida(p.c); admin(g, p.k);
    if (g.status !== "play") throw new Error("La Gran Final solo se lanza durante el juego");
    if (g.teams.length < 2) throw new Error("Hacen falta al menos 2 equipos");
    var orden = g.teams.slice().sort(function (a, b) { return b.pts - a.pts; });
    g.finalists = [orden[0].id, orden[1].id];
    g.fp = {}; g.fp[orden[0].id] = 0; g.fp[orden[1].id] = 0;
    g.status = "final"; g.finalIdx = 0; g.champion = null;
    abrirRonda(g, GRAN_FINAL[0].modo, GRAN_FINAL[0].contenido);
    guardarPartida(g);
    return { ok: true };
  },
  end: function (p) {
    var g = partida(p.c); admin(g, p.k);
    g.status = "over"; g.phase = null;
    guardarPartida(g);
    return { ok: true };
  }
};

function estado(p) {
  var g = partida(p.c);
  var esProfe = String(p.k || "") === g.admin;
  var eq = equiposActivos(g);
  var resp = {
    ok: true, now: Date.now(),
    game: {
      code: g.code, status: g.status, round: g.round, finalIdx: g.finalIdx, finalTotal: GRAN_FINAL.length,
      modo: g.modo, modoNombre: g.modo ? nombreModo(g.modo) : "", phase: g.phase,
      champion: g.champion, canFinal: g.status === "play" && g.teams.length >= 2 && g.round >= 1 && g.phase === "open"
    },
    teams: g.teams.map(function (t) { return { id: t.id, name: t.name, pts: t.pts }; }),
    active: eq,
    answered: {}
  };
  eq.forEach(function (e) { resp.answered[e.id] = !!String(g.answers[e.id] || "").trim(); });
  if (g.contenido) {
    var c = g.contenido;
    resp.content = g.modo === 1 ? { texto: c.texto } : { contexto: c.contexto, turnos: c.turnos };
  }
  var yo = Number(p.t);
  if (yo) {
    resp.mine = { answer: g.answers[yo] || "" };
    if (g.verdicts && g.verdicts[yo] && g.phase === "judged") resp.mine.verdict = g.verdicts[yo];
  }
  if (esProfe) {
    resp.admin = true;
    resp.answers = g.answers;
    resp.verdicts = g.verdicts;
    resp.prompt = g.prompt;
    if (g.contenido && g.phase === "judged") {
      resp.clave = g.modo === 1 ? g.contenido.dardo : g.modo === 2 ? g.contenido.explica : g.contenido.clave;
    }
  }
  return resp;
}

// ── contenido del juego (situaciones, entrevistas y Gran Final) ──

var SITUACIONES = [
  {
    texto: "Rueda de prensa. El entrenador acaba de ganar la liga. Un periodista le felicita y él responde, cortante: “Ya era hora de que en este club alguien hiciera bien su trabajo.” Silencio en la sala.",
    dardo: "La frase esconde un dardo contra alguien (el técnico anterior, la directiva). La mejor pregunta va a por ese ‘alguien’, no a por lo genérico de ganar la liga.",
  },
  {
    texto: "Zona mixta. Un debutante de 18 años ha marcado el gol de la victoria. Dice, mirando al suelo: “Se lo dedico a alguien que hoy no ha podido venir.”",
    dardo: "La puerta abierta es ese ‘alguien que no ha podido venir’: quién es y por qué no vino. La banal sería ‘¿qué sientes al debutar con gol?’.",
  },
  {
    texto: "Una nadadora vuelve de una lesión de dos años y gana. “Ha habido días en que no me metía en el agua por entrenar, me metía por no quedarme en casa.”",
    dardo: "La puerta es ‘no quedarme en casa’: qué pasaba en casa, qué evitaba. La buena pregunta persigue eso, no el mérito deportivo.",
  },
  {
    texto: "Un veterano anuncia su retirada. “El cuerpo aguantaba. Lo que ya no aguantaba era todo lo demás.”",
    dardo: "El dardo es ‘todo lo demás’: qué hay detrás de esa frase. La banal se conforma con ‘¿cómo te sientes al retirarte?’.",
  },
  {
    texto: "Un jugador ficha por el rival de su equipo de toda la vida. “Yo he tomado esta decisión con la cabeza. Con el corazón habría hecho otra cosa.”",
    dardo: "La puerta es la contradicción cabeza/corazón: qué le pedía el corazón y quién o qué le empujó a la cabeza.",
  },
  {
    texto: "Una entrenadora gana un título con un equipo modesto. “Me dijeron que este equipo era un cementerio de carreras. Y mira.”",
    dardo: "El dardo: quién se lo dijo y por qué aceptó igualmente. La banal celebra el título sin tirar de ese hilo.",
  },
  {
    texto: "Un futbolista modesto que compagina con otro trabajo, tras eliminar a un grande. “Mañana a las seis y media me toca madrugar igual que siempre.”",
    dardo: "La puerta es la escena de ese madrugón y la doble vida. La buena pregunta pide el detalle concreto de ese día siguiente.",
  },
  {
    texto: "Un boxeador tras ganar la que dijo que sería su última pelea. “No sé hacer otra cosa. Ese es el problema, no el mérito.”",
    dardo: "El dardo: por qué es un problema, qué teme del vacío que viene. La banal felicita por la victoria.",
  },
  {
    texto: "Una jugadora critica en público las instalaciones de su club femenino. “Entrenamos donde nos dejan, no donde deberíamos.”",
    dardo: "La puerta: dónde entrenan exactamente y quién decide eso. La buena pregunta busca el hecho concreto, no la queja general.",
  },
  {
    texto: "Un atleta gana el bronce mundial y parece molesto. “Todos me hablan del bronce. Yo venía a por otra cosa.”",
    dardo: "El dardo: a por qué venía y por qué le sabe a poco. La banal felicita por la medalla.",
  },
  {
    texto: "Un capitán tras una derrota humillante. “Prefiero no decir lo que ha pasado en el vestuario. Ya se sabrá.”",
    dardo: "La puerta es qué ha pasado en el vestuario. La buena pregunta no se deja escudar en el ‘ya se sabrá’: insiste con tacto pero concreta.",
  },
  {
    texto: "Un joven promesa que se va a jugar al extranjero con 16 años. “En casa lo hemos hablado mucho. Al final, deciden otros.”",
    dardo: "El dardo: quiénes son ‘otros’ y qué opina él frente a lo que decidieron. La banal pregunta por la ilusión del fichaje.",
  },
  {
    texto: "Una ciclista campeona del mundo, escueta, casi incómoda con las preguntas. “Prefiero que se hable de la bici y no de mí.”",
    dardo: "Fuente que se resiste: la resistencia misma es la historia. La buena pregunta entra por lo concreto (la carrera, un momento) para ganarse el terreno, sin ir de frente a lo personal.",
  },
  {
    texto: "Un portero falla en la final y da la cara ante la prensa. “He visto el gol cuarenta veces desde ayer. No pienso verlo una más.”",
    dardo: "La puerta: qué ha sentido esas cuarenta veces y qué cambia a partir de ahora. La banal pregunta ‘¿te sientes culpable?’.",
  },
  {
    texto: "Un ídolo local vuelve tras un escándalo fiscal, recibido con pitos y aplausos. “Sé que me tengo que ganar otra vez a mucha gente. Empiezo hoy.”",
    dardo: "El dardo: cómo piensa ganársela y si se siente en deuda o injustamente tratado. La banal pregunta por el partido.",
  },
  {
    texto: "Te llega al micrófono, en zona mixta, un futbolista que acaba de ser campeón del mundo. Eufórico, sin aliento, la medalla todavía en la mano. Han pasado tres minutos desde el pitido final.",
    dardo: "No hay frase reveladora: el reto es NO caer en ‘¿qué sientes?’ en el momento más tópico posible, y sacar algo humano y concreto de alguien que aún no ha aterrizado (un detalle, un recuerdo, una persona).",
  },
];

var ENTREVISTAS_FALLO = [
  {
    contexto: "Entrevista a una atleta tras una temporada irregular.",
    turnos: [
      { p: "¿Cómo empezó la temporada?", r: "Con muchas dudas. El invierno se me hizo eterno, entrenando sola casi siempre." },
      { p: "¿A qué se debió esa irregularidad en los resultados?", r: "A muchas cosas. Cambié de entrenador en enero, y adaptarse lleva su tiempo." },
      { p: "¿Cómo fue la relación con el nuevo técnico?", r: "Buena, exigente. Ha habido meses en que me costaba hasta levantarme, necesité ayuda para llevarlo, y no solo física... pero bueno, deportivamente he acabado contenta." },
      { p: "¿Cuáles son tus objetivos para el año que viene?", r: "Pelear por el podio y mantenerme sana toda la temporada." },
      { p: "¿Cómo ves a tus rivales?", r: "Muy fuertes, como siempre. Habrá que trabajar más que nunca." },
      { p: "¿Un sueño por cumplir?", r: "El campeonato de mi país en casa, delante de mi gente." },
    ],
    failIndex: 3,
    explica: "En la respuesta 3 soltó ‘necesité ayuda, y no solo física’ — una puerta enorme. La pregunta 4 se fue a los objetivos deportivos en vez de tirar de ese hilo humano.",
  },
  {
    contexto: "Entrevista a un futbolista que acaba de renovar con su club.",
    turnos: [
      { p: "¿Contento con la renovación?", r: "Muy contento, este club es mi casa desde que llegué con 19 años." },
      { p: "¿Fue una negociación larga?", r: "Bastante. Se alargó más de lo que la gente cree, hubo idas y venidas." },
      { p: "¿Hubo dudas en algún momento?", r: "Sí, hubo un momento en verano en que estuve a punto de irme, la verdad. Muy a punto." },
      { p: "¿Qué te gusta de esta ciudad?", r: "El clima, la gente... se vive muy bien aquí." },
      { p: "¿Cómo te llevas con la afición?", r: "De maravilla, siempre me han apoyado en lo bueno y en lo malo." },
      { p: "¿Objetivos para la temporada?", r: "Pelear por todo, como siempre." },
    ],
    failIndex: 3,
    explica: "En la respuesta 3 soltó ‘estuve a punto de irme en verano, muy a punto’ — la noticia de la entrevista. La pregunta 4 cambió a algo intrascendente (la ciudad) y desperdició el hilo.",
  },
  {
    contexto: "Entrevista a una entrenadora recién ascendida al primer equipo.",
    turnos: [
      { p: "¿Cómo afrontas este salto al primer equipo?", r: "Con ilusión y con muchísimo respeto. Es un sueño." },
      { p: "¿Te esperabas este ascenso tan pronto?", r: "No tan pronto, pero llevo veinte años preparándome para esto." },
      { p: "¿Ha sido un camino difícil?", r: "Mucho. Sé que muchos no confiaban en que una mujer llevara este vestuario, y me lo hicieron saber más de una vez. Pero aquí estoy." },
      { p: "¿Qué sistema de juego prefieres?", r: "Me gusta un equipo valiente, que proponga y no especule." },
      { p: "¿Cómo está el vestuario tras el cambio?", r: "Unido y con ganas de demostrar cosas." },
      { p: "¿Un referente en los banquillos?", r: "He aprendido de muchos, pero mi estilo es mío." },
    ],
    failIndex: 3,
    explica: "En la respuesta 3 dijo ‘muchos no confiaban en que una mujer llevara este vestuario, y me lo hicieron saber’ — una puerta enorme sobre lo que ha vivido. La pregunta 4 se fue a la táctica y la dejó pasar.",
  },
  {
    contexto: "Entrevista a un veterano que vuelve tras una grave lesión.",
    turnos: [
      { p: "¿Cómo fue el momento de la lesión?", r: "Noté el crujido y supe que era grave. Se me pasó todo por la cabeza en un segundo." },
      { p: "¿Cómo han sido estos meses de recuperación?", r: "Largos y solitarios. Muchas horas en el gimnasio viendo entrenar a los demás." },
      { p: "¿Hubo un momento de bajón?", r: "Hubo un momento en que el médico me dijo que quizá no volvería a jugar, y eso te cambia por dentro, te cambia la forma de ver la vida." },
      { p: "¿Te encuentras ya al cien por cien físicamente?", r: "Casi. Me falta ritmo de competición, pero las sensaciones son buenas." },
      { p: "¿Cómo te ha recibido el vestuario?", r: "Muy bien, son como una familia. Me han hecho el camino más fácil." },
      { p: "¿Qué esperas de lo que queda de temporada?", r: "Ayudar al equipo en lo que pueda, sumar." },
    ],
    failIndex: 3,
    explica: "En la respuesta 3 soltó ‘el médico me dijo que quizá no volvería, y eso te cambia por dentro’. La pregunta 4 se fue a lo físico y perdió lo humano, que era el oro.",
  },
  {
    contexto: "Entrevista a una joven promesa tras su primera convocatoria internacional.",
    turnos: [
      { p: "¿Cómo recibiste la noticia de la convocatoria?", r: "Estaba en casa. Me llamó el seleccionador y no me lo creía, tuve que sentarme." },
      { p: "¿Qué supone para ti este primer paso?", r: "Un sueño. Sobre todo por mi familia, que ha sacrificado muchísimo; hubo años muy complicados en casa, años que no olvidaré nunca." },
      { p: "¿Cómo es el ambiente en la concentración?", r: "Muy bueno, los veteranos ayudan mucho a los que llegamos nuevos." },
      { p: "¿Con quién te llevas mejor del grupo?", r: "Con todos, la verdad, pero los del centro del campo hacemos piña." },
      { p: "¿Te ves titular?", r: "Yo trabajo para ello, pero la decisión es del míster." },
      { p: "¿Un objetivo con la selección?", r: "Un día jugar un Mundial. Es lo máximo." },
    ],
    failIndex: 2,
    explica: "En la respuesta 2 dijo ‘hubo años muy complicados en casa, años que no olvidaré’ — la historia estaba ahí. La pregunta 3 se fue al ambiente del grupo y la desaprovechó.",
  },
];

var ENTREVISTAS_TITULAR = [
  {
    contexto: "Entrevista a un futbolista modesto que compagina el fútbol con su trabajo de taxista, tras eliminar a un Primera en Copa.",
    turnos: [
      { p: "¿Se esperaban ganar?", r: "Para nada. Somos de cuarta, ellos de Primera. Pero en un partido puede pasar cualquier cosa." },
      { p: "¿Cómo fue el gol?", r: "Un córner, salté más que el central y la metí de cabeza. Todavía no lo he visto por la tele, me da cosa." },
      { p: "¿Cómo compagina el fútbol con su trabajo?", r: "Conduzco el taxi de noche. La noche del partido, después de celebrarlo, me tocó turno igual. Acabé de currar a las seis de la mañana." },
      { p: "¿Le reconocieron los clientes esa noche?", r: "Toda la noche. ‘Pero si tú marcaste el gol’, me decían. Uno hasta me pidió una foto con el taxímetro puesto." },
      { p: "¿Qué dice su familia de todo esto?", r: "Mi mujer alucina. Mi hijo pequeño lo flipa más con el taxi que con el fútbol, la verdad." },
      { p: "¿Y ahora, con el premio de jugar la siguiente ronda?", r: "A seguir. El lunes vuelvo al taxi, campeones o no. Esto no paga las facturas." },
      { p: "¿Un sueño?", r: "Llegar lo más lejos posible. Y que dure, porque esto no se repite todos los días." },
    ],
    clave: "El titular está en la doble vida: héroe de Copa que vuelve al taxi de noche. Lo jugoso es la escena del taxímetro y ‘el lunes vuelvo al taxi’, no el resultado ni cómo fue el gol.",
  },
  {
    contexto: "Entrevista a una nadadora que ha vuelto a competir tras dos años parada por lesión.",
    turnos: [
      { p: "¿Qué se siente al volver a competir?", r: "Es raro. Dos años fuera son muchos. Hay días que aún no me lo creo." },
      { p: "¿Cómo fue la lesión?", r: "Una rotura en el hombro. Operación y a empezar de cero, brazada a brazada." },
      { p: "¿El momento más duro de la recuperación?", r: "Cuando el fisio se fue de vacaciones y me quedé sola con los ejercicios. Lloré más por soledad que por dolor." },
      { p: "¿Pensó en dejarlo?", r: "Cada día durante un año. Lo que me sujetó fue una lista de motivos que pegué en el espejo del baño." },
      { p: "¿Qué ponía en esa lista?", r: "Cosas pequeñas. ‘El olor a cloro por la mañana.’ ‘La primera brazada.’ Tonterías que resultaron no serlo." },
      { p: "¿Cómo la recibió el equipo?", r: "De maravilla. Me habían guardado mi taquilla de siempre, con mi nombre y todo." },
      { p: "¿Objetivos ahora?", r: "Ir paso a paso. No me pongo metas grandes, ya aprendí que eso no depende solo de una." },
    ],
    clave: "El titular está en la lista pegada en el espejo del baño, o en ‘lloré más por soledad que por dolor’. Lo valioso es el detalle concreto y humano, no el genérico ‘es difícil volver’ ni el dato de la operación.",
  },
  {
    contexto: "Entrevista a un boxeador antes de su última pelea, tras la cual se retira.",
    turnos: [
      { p: "¿Nervioso ante la última pelea?", r: "Menos de lo que pensaba. Después de tantos años, el ring es el sitio donde más tranquilo estoy." },
      { p: "¿Por qué lo deja ahora?", r: "Porque llego tarde a todo. Al cumpleaños de mi hija llegué cuando ya soplaba las velas." },
      { p: "¿Ha boxeado en muchos sitios?", r: "En seis países. Empecé en un gimnasio sin calefacción y acabé peleando en pabellones llenos." },
      { p: "¿Su mejor recuerdo sobre el ring?", r: "Mi primera victoria por título. Mi padre aún vivía y estaba en primera fila." },
      { p: "¿Qué es lo que más le ha costado de esta vida?", r: "Lo de fuera del ring. Las giras te comen las relaciones. He perdido gente por no estar." },
      { p: "¿Tiene algún plan para después?", r: "Abrir un gimnasio en mi barrio. Que los críos tengan lo que yo no tuve." },
      { p: "¿Cómo quiere que le recuerden?", r: "Como alguien que dio la cara. Dentro y fuera, aunque fuera llegara tarde." },
    ],
    clave: "El titular está en ‘al cumpleaños de mi hija llegué cuando ya soplaba las velas’ o ‘he perdido gente por no estar’: el coste personal. No en el dato de los seis países ni en el gimnasio futuro.",
  },
  {
    contexto: "Entrevista a una entrenadora que ha ganado un título con un equipo al que llamaban ‘cementerio de carreras’.",
    turnos: [
      { p: "¿Esperaba ganar el título?", r: "Nadie lo esperaba. Cuando firmé, un colega me dijo que este banquillo era donde iban a morir las carreras." },
      { p: "¿Por qué aceptó entonces?", r: "Precisamente por eso. Si nadie espera nada de ti, tienes toda la libertad del mundo para trabajar en paz." },
      { p: "¿Cuál fue el punto de inflexión de la temporada?", r: "Una remontada en diciembre. A partir de ahí el equipo se creyó que podía." },
      { p: "¿Cambió algo en el vestuario al llegar?", r: "Quité los espejos. Sonará raro, pero quería que se miraran entre ellos, no a sí mismos." },
      { p: "¿Cómo se lo tomaron los jugadores?", r: "Al principio con cachondeo. Luego dejaron de preguntar por los espejos." },
      { p: "¿Y funcionó?", r: "Ganamos el título, así que algo hicimos bien. Aunque los espejos los volvieron a poner en cuanto me descuidé." },
      { p: "¿Qué viene ahora?", r: "Disfrutarlo poco, que en esto se te olvida rápido lo de ayer." },
    ],
    clave: "El titular está en ‘quité los espejos del vestuario’ (detalle único y revelador) o en la idea de la libertad de que no esperen nada de ti. No en el genérico ‘nadie esperaba el título’ ni en la remontada.",
  },
];

var MODOS = [
  { id: 1, nombre: "La siguiente pregunta" },
  { id: 2, nombre: "¿Dónde falló el periodista?" },
  { id: 3, nombre: "El titular" },
];

var GRAN_FINAL = [
  {
    modo: 1,
    contenido: {
      texto: "Un tenista acaba de ganar su primer gran torneo. En la entrevista a pie de pista, aún con la copa en la mano, suelta: “He estado a punto de dejarlo dos veces este año. Hoy me alegro de no haberlo hecho.”",
      dardo: "El dardo es ‘a punto de dejarlo dos veces este año’: qué pasó esas dos veces, qué le hizo seguir. La banal celebra el título.",
    },
  },
  {
    modo: 2,
    contenido: {
      contexto: "Entrevista a un futbolista internacional tras un partido polémico.",
      turnos: [
        { p: "¿Cómo valora el partido?", r: "Complicado. El campo estaba en mal estado y eso nos igualó con ellos." },
        { p: "¿Fue justo el resultado?", r: "En el fútbol el resultado casi nunca es justo, pero se acepta." },
        { p: "¿Qué le dijo el árbitro en la jugada del penalti?", r: "Prefiero no entrar en eso. Ya hubo bastante lío. Con el árbitro tuve un rifirrafe feo que no me enorgullece." },
        { p: "¿Cómo se prepara el próximo partido?", r: "Con tranquilidad, recuperando a los lesionados." },
        { p: "¿Llega bien el equipo físicamente?", r: "Vamos justos, pero el parón vendrá bien." },
        { p: "¿Un mensaje para la afición?", r: "Que confíe, que esto es largo." },
      ],
      failIndex: 3,
      explica: "En la respuesta 3 reconoció ‘tuve un rifirrafe feo con el árbitro que no me enorgullece’ — una confesión jugosa. La pregunta 4 se fue a la preparación del próximo partido y la dejó escapar.",
    },
  },
  {
    modo: 3,
    contenido: {
      contexto: "Entrevista a una gimnasta que se retira a los 22 años en la cima de su carrera.",
      turnos: [
        { p: "¿Por qué retirarse tan joven y en lo más alto?", r: "Porque quiero irme entera. He visto a compañeras irse rotas y no quiero eso para mí." },
        { p: "¿Qué ha sido lo más difícil?", r: "Los desayunos. Suena tonto, pero pesar la comida a los 12 años te marca para siempre." },
        { p: "¿Cómo fue crecer en el gimnasio?", r: "Entré con seis años. El gimnasio ha sido mi casa, mi colegio y mi familia, todo a la vez." },
        { p: "¿Su mejor recuerdo?", r: "Una medalla, sí, pero sobre todo la cara de mi madre en la grada ese día." },
        { p: "¿Y ahora qué?", r: "Ir a la universidad. Quiero estudiar algo que no tenga nada que ver con esto." },
        { p: "¿Volvería a empezar?", r: "Sí, pero me dejaría desayunar tranquila alguna vez." },
        { p: "¿Un consejo para las que vienen?", r: "Que disfruten, que esto se acaba antes de lo que crees." },
      ],
      clave: "El titular está en ‘quiero irme entera, he visto a compañeras irse rotas’ o en ‘pesar la comida a los 12 años te marca’: el coste físico y mental. No en el genérico ‘me retiro joven’ ni en la medalla.",
    },
  },
  {
    modo: 1,
    contenido: {
      texto: "Un entrenador dimite en rueda de prensa por sorpresa, tras ganar el último partido. Dice, sereno: “Se gana, se dimite y ya está. Hay cosas dentro del club que no se ven desde fuera y que yo ya no puedo seguir tapando.”",
      dardo: "El dardo es ‘cosas que no se ven y que yo ya no puedo seguir tapando’: qué está tapando, qué pasa dentro del club. La banal pregunta por su futuro o por el partido ganado.",
    },
  },
];

