// Elige el párrafo: Kahoot de la crónica (Clase 5). Cada alumno juega solo desde el móvil.
// Ritmo como en Kahoot: pregunta con 20 segundos → respuesta correcta → podio (se para y el profesor pregunta al primero)
// → el profesor sigue y sale el porqué → el profesor sigue y llega la siguiente pregunta.
// Puntos como en Kahoot: hasta 1000 por acierto según la rapidez. No cuenta para la clasificación general.
"use strict";
const conns = new Map(), alConectar = [];
const io = { on(ev, f) { if (ev === "connection") alConectar.push(f); }, emit(ev, d) { for (const [, s] of conns) s.emit(ev, d); } };
const CLAVE = process.env.CLAVE_PANEL || "madrid";
const TIEMPOS = [20, 10, 30, 0]; // segundos para contestar; 0 = sin límite
const R = 5; // segundos que se ve la respuesta correcta antes de pasar solo al podio
const REF = 60; // segundos de referencia para los puntos por rapidez cuando no hay límite
const TITULO = "Elige el párrafo";
const PREGUNTAS = [
 {
  "p": "Titular. ¿Cuál elegirías?",
  "o": [
   "El Real Madrid gana al PSV",
   "Gran partido del Real Madrid",
   "El PSV no es rival para el Real Madrid",
   "Hasta que Bellingham hizo magia"
  ],
  "c": 3,
  "e": "Resume la idea-fuerza, el partido cambió cuando entró Bellingham, y tiene mirada. A solo da el resultado, B es genérico y C contradice lo que pasó, porque el PSV fue mejor durante toda la primera parte."
 },
 {
  "p": "Subtítulo. ¿Cuál elegirías?",
  "o": [
   "El Real Madrid golea 5-1 al PSV en el Bernabéu",
   "El inglés, que hizo un gol prodigioso, transforma a un Madrid distraído en el primer tiempo y de ensueño en el segundo, en el que marcó cinco goles. Doblete de Mbappé.",
   "Los de Mourinho firman una gran segunda parte y consiguen una victoria muy importante en la Champions",
   "Valverde, Bellingham, Mbappé (2) y Vinicius marcan para el Madrid, y Perisic hizo el gol del PSV de penalti"
  ],
  "c": 1,
  "e": "Explica en qué consistió la magia del titular, cuenta cómo cambió el equipo de una parte a otra y añade el doblete de Mbappé. A solo da el marcador, C está lleno de tópicos y D es una lista de goleadores."
 },
 {
  "p": "Primer párrafo. ¿Cuál elegirías?",
  "o": [
   "El Real Madrid ganó 5-1 al PSV en el Santiago Bernabéu. Perisic adelantó a los holandeses de penalti y en la segunda parte marcaron Valverde, Bellingham, Mbappé, en dos ocasiones, y Vinicius.",
   "Noche mágica en el Bernabéu. El Real Madrid demostró una vez más por qué es el rey de Europa y pasó por encima de un PSV que no pudo hacer nada ante la grandeza del equipo blanco. La afición disfrutó de lo lindo.",
   "Durante un tiempo, el primero, ese fantasma recorrió el Bernabéu, porque el Madrid volvió a tener un lado oscuro, con falta de fútbol e intensidad. Luego entró Bellingham y se hizo la luz. El equipo de Mourinho brindó un segundo acto excepcional: presionó, robó sin un mediocentro defensivo, creó, mandó, remató, goleó y borró del mapa a un grupo que antes había parecido una enorme amenaza.",
   "El partido empezó con mucha intensidad. Nada más empezar, Mijnans remató de cabeza. Poco después, Van Bommel se plantó solo ante Courtois, pero falló. Más tarde Dest disparó al lateral de la red."
  ],
  "c": 2,
  "e": "Explica el titular y lo extiende, porque desarrolla la idea de que Bellingham cambió el partido. A es un acta, B se queda en tópicos y D empieza el minuto a minuto."
 },
 {
  "p": "Alineaciones y planteamiento. ¿Cuál elegirías?",
  "o": [
   "Mourinho salió con Courtois en la portería, cuatro defensas, Tchouameni y Bernardo en el medio, Güler por detrás y Diomande, Vinicius y Mbappé arriba.",
   "Mourinho apostó por once futbolistas, mientras que el PSV se presentó con los mismos.",
   "Mourinho hizo rotaciones pensando en los próximos partidos. Bellingham fue suplente y jugaron Militao y Vinicius.",
   "Un Madrid reconfigurado se sintió en el alambre. Mourinho invierte a largo plazo. Ahorrar en otoño es florecer en primavera, parece indicar el plan. […] El excedente era un mediapunta y esta vez le tocó parar a Bellingham. La maniobra afectó al equilibrio del equipo, especialmente en la salida de pelota."
  ],
  "c": 3,
  "e": "Explica por qué cambió el once y qué efecto tuvo en el juego. A es una lista, B no dice nada y C informa del cambio sin contar qué consecuencias tuvo."
 },
 {
  "p": "Primeros minutos. ¿Cuál elegirías?",
  "o": [
   "En diez minutos tuvo tres goles a su alcance el PSV, en un cabezazo de Mijnans con mejor posición que postura; en una arrancada de Van Bommel, apellido ilustre, que dejó atrás a un Militao lejos de sí mismo y culminó con un mal remate, y en un disparo al lateral de la red de Dest.",
   "El PSV salió muy bien y el Madrid lo pasó mal. Los holandeses tuvieron varias ocasiones y pudieron marcar. El Madrid no estaba bien.",
   "Primero cabeceó Mijnans. Después Van Bommel tiró fuera tras dejar atrás a Militao. Luego Dest disparó al lateral de la red. Más tarde Vinicius dio al palo.",
   "El PSV fue una apisonadora y el Madrid un juguete en sus manos, un equipo sin alma, sin ideas y sin orgullo que avergonzó a su afición."
  ],
  "c": 0,
  "e": "Elige tres jugadas que demuestran el dominio del PSV y cada una lleva un detalle que la interpreta. B es vago, C es una cronología vacía y D exagera y descalifica."
 },
 {
  "p": "Sigue el partido. ¿Cuál elegirías?",
  "o": [
   "Tchouameni cometió penalti sobre Mijnans. El árbitro no lo vio, pero el VAR sí. Perisic lo transformó y el PSV se adelantó 0-1.",
   "Tchouameni pisó imprudentemente a Mijnans muy dentro del área, infracción que se le pasó a Eskas, pero no al VAR. Penalti, transformación del veteranísimo Perisic y el Madrid, por enésima vez, autoexigiéndose una remontada.",
   "En el minuto 30 hubo un penalti. Lo tiró Perisic y fue gol. Luego siguió el partido y llegó el descanso.",
   "Polémica en el Bernabéu, porque el VAR se inventó un penalti de Tchouameni que nadie vio y que perjudicó al Madrid de forma escandalosa."
  ],
  "c": 1,
  "e": "Cuenta la jugada y dice qué significa, otra remontada obligada para el Madrid. A tiene solo la jugada, C es un acta sin protagonistas ni lectura y D es la opinión de un forofo que contradice lo que pasó."
 },
 {
  "p": "Segunda parte. ¿Cuál elegirías?",
  "o": [
   "Al descanso hubo tres cambios en el Madrid, los dos centrales y Tchouameni, que dejó su sitio a Bellingham.",
   "El fútbol tiene dos partes y en la segunda el Madrid dio la cara, como hacen siempre los grandes equipos.",
   "La imagen resultó tan preocupante que Mourinho optó por medidas radicales: en el entretiempo cambió a los dos centrales y metió a Bellingham por Tchouameni, su único mediocentro de cierre. Ese desfibrilador le había funcionado hasta ahora.",
   "En el minuto 46 entró Bellingham. En el 52, Valverde tuvo una ocasión. En el 55 llegó el empate y en el 60 hubo otra ocasión."
  ],
  "c": 2,
  "e": "Cuenta el cambio, explica por qué lo hizo Mourinho y el riesgo que asumió al quitar a su único mediocentro de cierre, y la imagen del desfibrilador retrata cómo estaba el equipo. A es una lista, B un tópico y D el minuto a minuto."
 },
 {
  "p": "Sigue el encuentro. ¿Cuál elegirías?",
  "o": [
   "El cambio de partido y hasta de planeta podría ser atribuible a Bellingham, cuya influencia en el juego fue descomunal, pero también tuvo que ver la voluntad general, con el regreso de un Madrid cardiaco, arrollador, casi enfurecido.",
   "Bellingham jugó la segunda parte y marcó un gol. Además, dio varios pases y tuvo un disparo que paró Kovar.",
   "Bellingham, que lleva el pelo más corto desde hace dos semanas, celebró el gol mirando a la grada, donde estaba su familia.",
   "Bellingham nació en Stourbridge en 2003, debutó con el Birmingham y llegó al Madrid desde el Dortmund en 2023."
  ],
  "c": 0,
  "e": "Dice lo que el jugador le dio al equipo y lo matiza con el empuje del resto. B se queda en estadística, C es una anécdota que no explica nada del partido y D es una biografía que no tiene que ver con lo que pasó."
 },
 {
  "p": "Partido. ¿Cuál elegirías?",
  "o": [
   "Bellingham marcó el 2-1 con un disparo desde fuera del área.",
   "¡Golazo! ¡Qué barbaridad! ¡Bellingham la clava y el Bernabéu se viene abajo! ¡Increíble!",
   "Bellingham recibió el balón, lo controló, lo levantó y chutó, y el balón entró en la portería de Kovar para el 2-1.",
   "Kovar no pudo con el cuarto intento, un prodigio de Bellingham: control con la izquierda, toquecito sin dejar caer con la derecha y volea precisa desde fuera del área. Magia en tres actos. Un gol que no olvidará el Bernabéu."
  ],
  "c": 3,
  "e": "Describe el gol paso a paso, le da valor y vuelve al titular con la palabra «magia». A es seco, B es una narración de radio y C describe sin ritmo y sin decir qué tuvo de especial."
 },
 {
  "p": "Final. ¿Cuál elegirías?",
  "o": [
   "El Real Madrid ganó 5-1 y suma tres puntos más en la Champions.",
   "Con esta victoria el Madrid sigue vivo en la Champions y ahora piensa en el próximo partido de Liga.",
   "A los postres, Mourinho metió a Camavinga para evitar sorpresas (y casi se encuentra con otra, una roja que mereció) y ahorrarse otro milagro de Espí, porque esta vez el extintor fue Bellingham.",
   "En definitiva, un partido para el recuerdo que demuestra que este Madrid puede con todo y que nadie debe darle por muerto."
  ],
  "c": 2,
  "e": "Termina en Bellingham, que es la idea-fuerza, y deja una imagen en la cabeza del lector, la del extintor. A no aporta nada, y B y D son tópicos que valdrían para cualquier partido."
 }
];

let S;
function nuevo() {
  if (S && S.timer) clearTimeout(S.timer);
  S = { fase: "lobby", T: S ? S.T : 20, idx: -1, jug: new Map(), resp: {}, inicio: 0, finTs: 0, timer: null, cnt: 0 };
}
nuevo();
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const preg = () => PREGUNTAS[S.idx];
const ranking = () => [...S.jug.values()].map(e => ({ id: e.id, nombre: e.nombre, pts: e.pts, conectado: !!e.sock })).sort((a, b) => b.pts - a.pts || a.nombre.localeCompare(b.nombre));

function lanzar() {
  S.idx++;
  if (S.idx >= PREGUNTAS.length) return terminar();
  S.fase = "pregunta"; S.resp = {}; S.inicio = Date.now(); S.finTs = S.T ? S.inicio + S.T * 1000 : 0;
  if (S.timer) clearTimeout(S.timer);
  if (S.T) S.timer = setTimeout(cerrar, S.T * 1000 + 300);
  emitir();
}
function cerrar() {
  if (S.fase !== "pregunta") return;
  if (S.timer) clearTimeout(S.timer);
  S.fase = "correcta"; S.finTs = Date.now() + R * 1000;
  Object.entries(S.resp).forEach(([id, r]) => { const e = S.jug.get(id); if (e) e.pts += r.pts; });
  S.timer = setTimeout(() => { if (S.fase === "correcta") { S.fase = "podio"; S.finTs = 0; emitir(); } }, R * 1000);
  emitir();
}
function avanzar() {
  if (S.fase === "pregunta") return cerrar();
  if (S.fase === "correcta") { if (S.timer) clearTimeout(S.timer); S.fase = "podio"; S.finTs = 0; return emitir(); }
  if (S.fase === "podio") { S.fase = "porque"; return emitir(); }
  if (S.fase === "porque") return lanzar();
}
function terminar() { if (S.timer) clearTimeout(S.timer); S.fase = "fin"; emitir(); }

function vista(rol, id) {
  const q = S.idx >= 0 && S.idx < PREGUNTAS.length ? preg() : null;
  const out = { fase: S.fase, titulo: TITULO, idx: S.idx, total: PREGUNTAS.length, finTs: S.finTs, tiempo: S.T, tiempos: TIEMPOS,
    ranking: ranking(), respondidas: Object.keys(S.resp).length };
  if (q && S.fase !== "lobby" && S.fase !== "fin") {
    out.pregunta = { p: q.p, o: q.o };
    if (S.fase !== "pregunta") {
      out.pregunta.c = q.c;
      out.conteo = q.o.map((_, i) => Object.values(S.resp).filter(r => r.op === i).length);
    }
    if (S.fase === "porque") out.pregunta.e = q.e;
  }
  if (id && S.jug.has(id)) {
    const r = S.resp[id], e = S.jug.get(id);
    out.mi = { nombre: e.nombre, pts: e.pts, respondido: r ? r.op : null, puesto: ranking().findIndex(x => x.id === id) + 1 };
    if (r && S.fase !== "pregunta") { out.mi.ok = r.ok; out.mi.ganados = r.pts; }
  }
  return out;
}
function emitir() { for (const [, s] of conns) s.emit("estado", vista(s.data.rol, s.data.id)); }

io.on("connection", sock => {
  sock.data = { rol: "alumno", id: null };
  sock.on("unirse", ({ nombre, token } = {}) => {
    nombre = String(nombre || "").trim().replace(/\s+/g, " ").slice(0, 28); token = String(token || "").slice(0, 60);
    let e = token ? [...S.jug.values()].find(x => x.token === token) : null;
    if (!e) {
      if (!nombre) return sock.emit("error_msg", "Escribe tu nombre.");
      e = [...S.jug.values()].find(x => norm(x.nombre) === norm(nombre));
      if (e && e.sock && e.sock !== sock) return sock.emit("error_msg", "Ese nombre ya está dentro desde otro móvil. Prueba con tu nombre y tu apellido.");
      if (!e) {
        if (S.jug.size >= 80) return sock.emit("error_msg", "La partida está llena.");
        e = { id: String(++S.cnt), nombre, token: "t" + Math.random().toString(36).slice(2) + Date.now(), pts: 0, sock: null };
        S.jug.set(e.id, e);
      }
    }
    e.sock = sock; sock.data.id = e.id;
    sock.emit("unido", { token: e.token, nombre: e.nombre });
    emitir();
  });
  sock.on("responder", op => {
    const e = S.jug.get(sock.data.id); if (!e || S.fase !== "pregunta" || S.resp[e.id]) return;
    const q = preg(); op = Number(op); if (!(op >= 0 && op < q.o.length)) return;
    const lim = S.T || REF, t = Math.min(1, (Date.now() - S.inicio) / (lim * 1000)), ok = op === q.c;
    S.resp[e.id] = { op, ok, pts: ok ? Math.round(1000 * (1 - t / 2)) : 0 };
    const activos = [...S.jug.values()].filter(x => x.sock).length;
    if (Object.keys(S.resp).length >= activos) return cerrar();
    emitir();
  });
  sock.on("auth", clave => { if (clave === CLAVE) { sock.data.rol = "prof"; sock.emit("auth_ok"); sock.emit("estado", vista("prof", null)); } else sock.emit("auth_error"); });
  const prof = fn => (...a) => { if (sock.data.rol === "prof") fn(...a); };
  sock.on("segundos", prof(n => { n = Number(n); if (S.fase === "lobby" && TIEMPOS.includes(n)) { S.T = n; emitir(); } }));
  sock.on("empezar", prof(() => { if (S.fase === "lobby" && S.jug.size) lanzar(); }));
  sock.on("avanzar", prof(avanzar));
  sock.on("terminar", prof(terminar));
  sock.on("expulsar", prof(id => { if (S.jug.delete(id)) { delete S.resp[id]; emitir(); } }));
  sock.on("reiniciar", prof(() => { nuevo(); io.emit("reinicio"); emitir(); }));
  sock.on("disconnect", () => { const e = S.jug.get(sock.data.id); if (e && e.sock === sock) { e.sock = null; emitir(); } });
});

function handle(req, res, url) {
  const P = "/api/kahootcronica";
  if (!url.pathname.startsWith(P)) return false;
  const sub = url.pathname.slice(P.length);
  if (sub === "/stream") {
    const cid = String(url.searchParams.get("cid") || "").slice(0, 60);
    if (!cid) { res.writeHead(400); res.end(); return true; }
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Accel-Buffering": "no" });
    res.write("retry: 1500\n\n");
    const viejo = conns.get(cid);
    if (viejo) { conns.delete(cid); try { viejo._res.end(); } catch (e) {} if (viejo.h.disconnect) viejo.h.disconnect(); }
    const sock = { id: cid, data: {}, h: {}, _res: res, on(ev, f) { this.h[ev] = f; }, emit(ev, d) { try { res.write("data: " + JSON.stringify({ ev, d }) + "\n\n"); } catch (e) {} } };
    conns.set(cid, sock); alConectar.forEach(f => f(sock));
    const hb = setInterval(() => { try { res.write(": ping\n\n"); } catch (e) {} }, 20000);
    req.on("close", () => { clearInterval(hb); if (conns.get(cid) === sock) { conns.delete(cid); if (sock.h.disconnect) sock.h.disconnect(); } });
    return true;
  }
  if (sub === "/msg" && req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 20000) req.destroy(); });
    req.on("end", () => {
      let m; try { m = JSON.parse(body); } catch (e) {}
      const sock = m && conns.get(String(m.cid));
      if (!sock) { res.writeHead(409); return res.end("sin conexión"); }
      try { const f = sock.h[String(m.ev)]; if (f) f(m.d); } catch (e) { console.error("kahootcronica", e); }
      res.writeHead(204); res.end();
    });
    return true;
  }
  res.writeHead(404); res.end(); return true;
}
module.exports = { handle };
