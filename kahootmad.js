// Kahoot madridista: los dos Kahoot «Universidad Europea» jugados por equipos desde el móvil.
// Puntos como en Kahoot: hasta 1000 por acierto según la rapidez. El resultado final pasa a la clasificación general.
"use strict";
const conns = new Map(), alConectar = [];
const io = { sockets: { sockets: conns }, on(ev, f) { if (ev === "connection") alConectar.push(f); }, emit(ev, d) { for (const [, s] of conns) s.emit(ev, d); } };
const CLAVE = process.env.CLAVE_PANEL || "madrid";
const T = 20; // segundos por pregunta
const QUIZ = {"1": {"titulo": "Universidad Europea 1", "preguntas": [{"p": "El primer párrafo de una crónica debe", "o": ["Empezar así: \"En el primer minuto del partido...\"", "Contar que el estadio estaba lleno, hacía sol...", "Extender la idea del titular y tu visión del partido", "¿Se puede pedir comodín?"], "c": [2], "img": "https://images-cdn.kahoot.it/62c81eb6-2e24-4b7e-ae4c-561344a80fad"}, {"p": "El segundo entrenador del Real Madrid se llama:", "o": ["Mourinho Jose", "Joao Tralhao", "Segundo de la tarde, Toro", "Sami Khedira"], "c": [1], "img": "https://images-cdn.kahoot.it/6c8de006-33d7-41df-820a-17b383c1a978"}, {"p": "En una crónica hay que contar", "o": ["Todas las jugadas", "Mi vida, que es súper interesante", "Jugadas e ideas claves", "Las jugadas, las alineaciones, las tarjetas..."], "c": [2], "img": ""}, {"p": "El entrenador del Real Madrid de baloncesto es Sergio Scariolo", "o": ["Verdadero", "Falso"], "c": [1], "img": ""}, {"p": "En una crónica, de los jugadores", "o": ["Son importantes y claves. Por tanto, habrá que hablar de ellos", "Hay que nombrarlos a todos", "Con poner quien marca los goles, vale", "Con decir que ha jugado bien o mal, es suficiente"], "c": [0, 2], "img": "https://images-cdn.kahoot.it/8cae67ac-2150-4f27-8350-5333055ef920"}, {"p": "Este periodista se llama y presenta:", "o": ["Manolo Lama, Deportes Cope", "José Aguado, Universidad Europea", "Manu Carreño, Cadena Ser", "Josep Pedrerol, El Chiringuito"], "c": [3], "img": "https://images-cdn.kahoot.it/2520a3d5-c10a-4ed7-a271-52707fe14afc"}, {"p": "El máximo goleador del Real Madrid es", "o": ["Raúl González", "Alfredo di Stéfano", "Cristiano Ronaldo", "Álvaro Morata"], "c": [2], "img": "https://images-cdn.kahoot.it/d1f8db57-4a68-4e6c-8106-72d2b9949c8e"}, {"p": "Con este titular: El Real Madrid agujerea la muralla del Arsenal", "o": ["El Madrid presenta su candidatura a la Champions. Lo hizo ante el Arsenal", "El Arsenal - Real Madrid se jugó a las 21: 00 horas...", "El Real Madrid jugó con Courtois en la portería, en defensa...", "En el primer minuto, el primer remate del Arsenal llegó manso a Courtois..."], "c": [0], "img": ""}, {"p": "Cuál de estas futbolistas no es del Real Madrid", "o": ["Linda Caicedo", "Toletti", "Alba Redondo", "Merle Frohms"], "c": [2], "img": "https://images-cdn.kahoot.it/fca7286c-09a7-4c45-9447-287fcfc98fe2"}, {"p": "Los jefes de Prensa del vestuario del Real Madrid son", "o": ["Es Juan Camilo Carbajosa, que también dirige el Master", "Carlos Carbajosa y Juan Camilo", "Va, paso, imposible, no voy a ganar", "Oussama y Lorena"], "c": [1], "img": ""}]}, "2": {"titulo": "Universidad Europea 2", "preguntas": [{"p": "Antes de internet, ¿qué posición tenía el cronista ante el lector?", "o": ["Dominante, era un oráculo", "De igualdad", "De inferioridad", "Irrelevante"], "c": [0], "img": "https://images-cdn.kahoot.it/129641c3-f4aa-450d-884b-713aef1d0d32"}, {"p": "¿Por qué el cronista de papel llega hoy el último?", "o": ["Los partidos acaban tarde", "Ya no se leen crónicas", "El partido ya se ha comentado en todas partes", "Escribe más despacio"], "c": [2], "img": "https://images-cdn.kahoot.it/4c6c90e6-ea15-404b-b85b-5b635fc8e952"}, {"p": "Según el cronista, ¿quién sabe más que nadie de lo suyo?", "o": ["El aficionado a la política", "El aficionado al deporte", "El entrenador", "El aficionado a la economía"], "c": [1], "img": "https://images-cdn.kahoot.it/981dcfea-d056-411f-bc2b-9d2f326c0cd4"}, {"p": "¿Qué debe añadir la crónica de hoy a lo que ya sabe el lector?", "o": ["El resultado repetido", "El minuto a minuto completo", "Análisis, opinión y anticipación", "Las alineaciones completas"], "c": [2], "img": "https://images-cdn.kahoot.it/5a5b8e07-6711-45a8-8032-6bbccf0614ee"}, {"p": "¿Cómo se llama lo que el cronista tiene que descubrir en cada partido?", "o": ["La jugada secreta", "El dato escondido", "El minuto clave", "El guion oculto"], "c": [3], "img": "https://images-cdn.kahoot.it/03ea62bd-b694-487c-be73-a2a161940012"}, {"p": "¿Cuántas cosas debe recoger una buena crónica?", "o": ["Tres o cuatro, muy precisas", "Solo el resultado", "Todas las jugadas", "Una docena"], "c": [0], "img": "https://images-cdn.kahoot.it/1dc63917-f024-4839-add1-3cb31b0d68c0"}, {"p": "¿Cuáles son las cuatro preguntas de la crónica?", "o": ["Resultado, goles, tarjetas y cambios", "Qué pasó, por qué, qué puede pasar y por qué", "Quién, cuándo, dónde y cómo", "Quién marcó, cuándo, cómo y dónde"], "c": [1], "img": "https://images-cdn.kahoot.it/caf4afc7-bdb4-4c1e-bf48-122fc404fd15"}, {"p": "¿Qué es la idea-fuerza?", "o": ["El resultado final", "El titular SEO", "La respuesta a qué ha pasado de verdad hoy", "El nombre del mejor jugador"], "c": [2], "img": "https://images-cdn.kahoot.it/08714545-2127-4c73-9871-bb50abb4aca2"}, {"p": "¿Cuál es un buen titular de crónica?", "o": ["Empate 2-2 en el estadio del colista", "El líder empata contra el colista", "Los dos equipos suman un punto", "El colista retrata la flaqueza del líder"], "c": [3], "img": "https://images-cdn.kahoot.it/459a8d7d-fdc1-4819-9336-831cfa8d3afb"}, {"p": "¿Qué hace el subtítulo?", "o": ["Amplía el titular sin repetirlo", "Repite el resultado", "Cita al entrenador", "Resume las alineaciones"], "c": [0], "img": "https://images-cdn.kahoot.it/1adf265f-695a-4de7-aeb4-71767761104c"}, {"p": "¿Cuál es la regla de oro del primer párrafo?", "o": ["Dar las alineaciones", "Poder leerse sin seguir leyendo", "Enumerar todos los goles", "Empezar con una cita"], "c": [1], "img": "https://images-cdn.kahoot.it/798fa04f-d485-4c8f-bad8-a07cadeb7b65"}, {"p": "¿Cómo se tratan las alineaciones en la crónica?", "o": ["Se ponen al final en una lista", "Se interpretan", "Se omiten siempre", "Se copian completas"], "c": [1], "img": "https://images-cdn.kahoot.it/8fe7a2d1-d6d1-4c3c-a4ad-927c8b9da962"}, {"p": "¿Qué hay que evitar en el desarrollo?", "o": ["El minuto a minuto sin análisis", "Explicar qué significa cada jugada", "Elegir solo las jugadas importantes", "Detenerse en un jugador"], "c": [0], "img": "https://images-cdn.kahoot.it/371f816e-c7f3-4cb1-8223-1c6d50635ce0"}, {"p": "¿Qué debe hacer el cierre?", "o": ["Repetir el resultado", "Anunciar el próximo partido", "Dar las estadísticas", "Dejar una idea que conecte con el titular"], "c": [3], "img": "https://images-cdn.kahoot.it/d0beb9b6-eeae-4a3d-a165-ce5fdaa98ef1"}, {"p": "¿Cuál es la fórmula SEO clásica de una crónica?", "o": ["Crónica del partido de hoy", "Todo sobre la jornada", "El colista retrata la flaqueza del líder", "Equipo A - Equipo B: resultado, resumen y goles"], "c": [3], "img": "https://images-cdn.kahoot.it/145fe765-903f-42f2-bacb-c27ae331cf78"}, {"p": "«Los equipos empataron 2-2. Los goles fueron de X e Y». ¿Qué le pasa a este arranque?", "o": ["Es demasiado largo", "Le falta el titular", "Es un acta que no interpreta nada", "Tiene demasiada opinión"], "c": [2], "img": "https://images-cdn.kahoot.it/85411f0e-cf59-4ae6-88b1-7dac409a413b"}, {"p": "«El entrenador salió con portero, lateral, central…». ¿Qué le pasa?", "o": ["Es una lista que el lector ya vio en la app", "Es demasiado analítico", "Está muy bien", "Le faltan cifras"], "c": [0], "img": "https://images-cdn.kahoot.it/208fb897-7e4c-4190-8fd8-da3805512ec9"}, {"p": "¿Qué frase de la crónica es la que el lector se va a llevar?", "o": ["La del titular SEO", "La primera", "La última", "La de las alineaciones"], "c": [2], "img": "https://images-cdn.kahoot.it/6283e330-ea00-405d-91c5-5d22461d1e5a"}, {"p": "¿Cómo funcionan titular y subtítulo?", "o": ["Se leen por separado", "El titular explica el subtítulo", "Se leen juntos y el segundo contextualiza", "El subtítulo repite el titular"], "c": [2], "img": "https://images-cdn.kahoot.it/90080117-75c5-4f4c-b57d-4fdfd85c7a10"}, {"p": "«El partido terminó en empate y ambos sumaron un punto» es un mal cierre porque…", "o": ["Tiene opinión", "Es demasiado largo", "No aporta nada y podría no estar", "Conecta con el titular"], "c": [2], "img": "https://images-cdn.kahoot.it/a9f45f24-e3ec-437c-8c87-92a095374923"}]}}
;

let S;
function nuevo(conservarResultados) {
  const res = S ? S.resultados : {};
  if (S && S.timer) clearTimeout(S.timer);
  S = { fase: "lobby", quiz: S ? S.quiz : "1", idx: -1, equipos: new Map(), resp: {}, inicio: 0, finTs: 0, timer: null, cnt: 0, resultados: conservarResultados ? res : {} };
}
nuevo();
const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const preg = () => QUIZ[S.quiz].preguntas[S.idx];
const ranking = () => [...S.equipos.values()].map(e => ({ id: e.id, nombre: e.nombre, pts: e.pts, conectado: !!e.sock })).sort((a, b) => b.pts - a.pts || a.nombre.localeCompare(b.nombre));

function lanzar() {
  S.idx++;
  if (S.idx >= QUIZ[S.quiz].preguntas.length) return terminar();
  S.fase = "pregunta"; S.resp = {}; S.inicio = Date.now(); S.finTs = S.inicio + T * 1000;
  if (S.timer) clearTimeout(S.timer);
  S.timer = setTimeout(cerrar, T * 1000 + 300);
  emitir();
}
function cerrar() {
  if (S.fase !== "pregunta") return;
  if (S.timer) clearTimeout(S.timer);
  S.fase = "resultado";
  Object.entries(S.resp).forEach(([id, r]) => { const e = S.equipos.get(id); if (e) e.pts += r.pts; });
  emitir();
}
function terminar() {
  if (S.timer) clearTimeout(S.timer);
  S.fase = "fin";
  S.resultados[S.quiz] = ranking().map(x => ({ nombre: x.nombre, valor: x.pts }));
  emitir();
}
function vista(rol, eqId) {
  const prof = rol === "prof", q = S.idx >= 0 && S.idx < QUIZ[S.quiz].preguntas.length ? preg() : null;
  const out = { fase: S.fase, quiz: S.quiz, titulo: QUIZ[S.quiz].titulo, quizzes: Object.keys(QUIZ).map(k => ({ id: k, titulo: QUIZ[k].titulo, n: QUIZ[k].preguntas.length })),
    idx: S.idx, total: QUIZ[S.quiz].preguntas.length, finTs: S.finTs, tiempo: T, ranking: ranking(), respondidas: Object.keys(S.resp).length, yo: eqId || null };
  if (q && (S.fase === "pregunta" || S.fase === "resultado")) {
    out.pregunta = { p: q.p, o: q.o, img: q.img };
    if (S.fase === "resultado") {
      out.pregunta.c = q.c;
      out.conteo = q.o.map((_, i) => Object.values(S.resp).filter(r => r.op === i).length);
    }
  }
  if (eqId && S.equipos.has(eqId)) {
    const r = S.resp[eqId], e = S.equipos.get(eqId);
    out.mi = { nombre: e.nombre, pts: e.pts, respondido: r ? r.op : null };
    if (r && S.fase === "resultado") { out.mi.ok = r.ok; out.mi.ganados = r.pts; }
    out.mi.puesto = ranking().findIndex(x => x.id === eqId) + 1;
  }
  return out;
}
function emitir() { for (const [, s] of conns) s.emit("estado", vista(s.data.rol, s.data.eqId)); }

io.on("connection", sock => {
  sock.data = { rol: "alumno", eqId: null };
  sock.on("unirse", ({ nombre, token } = {}) => {
    nombre = String(nombre || "").trim().replace(/\s+/g, " ").slice(0, 28); token = String(token || "").slice(0, 60);
    let e = token ? [...S.equipos.values()].find(x => x.token === token) : null;
    if (!e) {
      if (!nombre) return sock.emit("error_msg", "Escribe el nombre de tu equipo.");
      e = [...S.equipos.values()].find(x => norm(x.nombre) === norm(nombre));
      if (e && e.sock && e.sock !== sock) return sock.emit("error_msg", "Ese equipo ya está dentro desde otro móvil.");
      if (!e) {
        if (S.equipos.size >= 30) return sock.emit("error_msg", "Ya hay 30 equipos.");
        e = { id: String(++S.cnt), nombre, token: "t" + Math.random().toString(36).slice(2) + Date.now(), pts: 0, sock: null };
        S.equipos.set(e.id, e);
      }
    }
    e.sock = sock; sock.data.eqId = e.id;
    sock.emit("unido", { token: e.token, nombre: e.nombre });
    emitir();
  });
  sock.on("responder", op => {
    const e = S.equipos.get(sock.data.eqId); if (!e || S.fase !== "pregunta" || S.resp[e.id]) return;
    const q = preg(); op = Number(op); if (!(op >= 0 && op < q.o.length)) return;
    const t = Math.min(1, (Date.now() - S.inicio) / (T * 1000)), ok = q.c.includes(op);
    S.resp[e.id] = { op, ok, pts: ok ? Math.round(1000 * (1 - t / 2)) : 0 };
    const activos = [...S.equipos.values()].filter(x => x.sock).length;
    if (Object.keys(S.resp).length >= activos) return cerrar();
    emitir();
  });
  sock.on("auth", clave => { if (clave === CLAVE) { sock.data.rol = "prof"; sock.emit("auth_ok"); sock.emit("estado", vista("prof", null)); } else sock.emit("auth_error"); });
  const prof = fn => (...a) => { if (sock.data.rol === "prof") fn(...a); };
  sock.on("quiz", prof(q => { if (S.fase === "lobby" && QUIZ[q]) { S.quiz = String(q); emitir(); } }));
  sock.on("empezar", prof(() => { if (S.fase === "lobby" && S.equipos.size) lanzar(); }));
  sock.on("cerrar", prof(cerrar));
  sock.on("siguiente", prof(() => { if (S.fase === "resultado") lanzar(); }));
  sock.on("terminar", prof(terminar));
  sock.on("expulsar", prof(id => { const e = S.equipos.get(id); if (e) { S.equipos.delete(id); delete S.resp[id]; emitir(); } }));
  sock.on("reiniciar", prof(() => { nuevo(true); io.emit("reinicio"); emitir(); }));
  sock.on("disconnect", () => { const e = S.equipos.get(sock.data.eqId); if (e && e.sock === sock) { e.sock = null; emitir(); } });
});

function handle(req, res, url) {
  const P = "/api/kahootmad";
  if (!url.pathname.startsWith(P)) return false;
  const sub = url.pathname.slice(P.length);
  if (sub === "/clasificacion") {
    const q = String(url.searchParams.get("quiz") || "1");
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ ok: true, titulo: QUIZ[q] ? QUIZ[q].titulo : "", orden: S.resultados[q] || [] }));
    return true;
  }
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
      try { const f = sock.h[String(m.ev)]; if (f) f(m.d); } catch (e) { console.error("kahootmad", e); }
      res.writeHead(204); res.end();
    });
    return true;
  }
  res.writeHead(404); res.end(); return true;
}
module.exports = { handle };
