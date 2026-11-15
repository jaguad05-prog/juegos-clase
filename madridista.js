// La gran carrera madridista: carrera por calles con rondas de fotos (avanza la mitad que acierta antes)
// y pruebas escritas que votan los equipos (3-2-1). Conexión por EventSource + POST, como Serpientes.
"use strict";
const fs = require("fs");
const path = require("path");

const conns = new Map();
const alConectar = [];
const io = {
  sockets: { sockets: conns },
  on(ev, f) { if (ev === "connection") alConectar.push(f); },
  emit(ev, d) { for (const [, s] of conns) s.emit(ev, d); },
};

const CLAVE = process.env.CLAVE_PANEL || 'madrid';
const META = Number(process.env.META) || 26;
const TIEMPO_FOTO = Number(process.env.TIEMPO_FOTO) || 45;

// Las fotos tienen nombres opacos (f01...) para que no se pueda adivinar quién es mirando el archivo.
const FOTOS = [
  { file: 'f01.jpg', nombre: 'Roberto Carlos', claves: ['roberto carlos', 'carlos'] },
  { file: 'f02.jpg', nombre: 'Arvydas Sabonis', claves: ['sabonis'] },
  { file: 'f03.jpg', nombre: 'Luis Figo', claves: ['figo'] },
  { file: 'f04.jpg', nombre: 'Zinedine Zidane', claves: ['zidane', 'zizou'] },
  { file: 'f05.jpg', nombre: 'Manuel Velázquez', claves: ['velazquez'] },
  { file: 'f06.jpg', nombre: 'Fernando Redondo', claves: ['redondo'] },
  { file: 'f07.jpg', nombre: 'Fernando Romay', claves: ['romay'] },
  { file: 'f08.jpg', nombre: 'Míchel', claves: ['michel'] },
  { file: 'f09.jpg', nombre: 'Emilio Butragueño', claves: ['butragueno', 'buitre'] },
  { file: 'f10.jpg', nombre: 'Santillana', claves: ['santillana'] },
  { file: 'f11.jpg', nombre: 'Juanito', claves: ['juanito'] },
  { file: 'f12.jpg', nombre: 'Pirri', claves: ['pirri'] },
  { file: 'f13.jpg', nombre: 'Misa Rodríguez', claves: ['misa'] },
  { file: 'f14.jpg', nombre: 'Amancio', claves: ['amancio'] },
  { file: 'f15.jpg', nombre: 'Ferenc Puskás', claves: ['puskas'] },
  { file: 'f16.jpg', nombre: 'Alfredo Di Stéfano', claves: ['stefano', 'di stefano'] }
];

// soloProyector: los alumnos no ven el texto, solo lo ve quien tenga abierto el panel (el proyector).
// escribible: los equipos tienen un cuadro para escribir su respuesta.
// formato: libre (un cuadro), titular (título y subtítulo), noticia (título, subtítulo y texto) o tuit.
// modo: votan (los equipos votan 3-2-1 y los tres más votados avanzan 3, 2 y 1) o profesor (el profesor da de 0 a 3 casillas a cada equipo).
// minPalabras: en las pruebas que se votan, las respuestas con menos palabras no entran en la votación.
// Las pruebas de proyector (el himno) dan 1 casilla solo a los equipos que el profesor marca como participantes.
let PRUEBAS = [
  { id: 'p1', v: 1, escribible: true, modo: 'votan', formato: 'titular', texto: 'Os pido una previa del Real Madrid - Real Sociedad.\nPero tenéis que basarla en un jugador de la Real Sociedad buscando un dato o algo que pueda ser noticia.\nHay que hacer un título y un subtítulo.' },
  { id: 'p2', v: 1, escribible: true, modo: 'profesor', formato: 'libre', texto: 'Tienes que conseguir un correo o un teléfono con el que se podría llamar a una de las jugadoras de la selección nacional de fútbol sala.' },
  { id: 'p3', v: 1, escribible: true, modo: 'profesor', formato: 'noticia', texto: 'Tenéis que encontrar a alguien (no valen compañeros) que se identifique y os cuente el momento deportivo que más le emocionó (tenéis que grabar su voz).\nHacer título, subtítulo y el primer párrafo de 100 palabras que tiene que ser una escena, no una narración.' },
  { id: 'himno', v: 1, escribible: false, soloProyector: true, video: '/madridista_himno.mp4', texto: 'Tenéis que cantar el himno del Real Madrid.' },
  { id: 'p5', v: 1, escribible: true, modo: 'profesor', formato: 'noticia', texto: 'Me tenéis que vender un reportaje de un deportista al que se pueda llamar y hablar con él.\nNecesito tema y modo de contacto.\nO un reportaje de deportes con un protagonista al que llamar.' },
  { id: 'p7', v: 1, escribible: true, modo: 'votan', formato: 'tuit', texto: 'Tenéis que escribir un tuit respondiendo a esta declaración inventada de Gavi y buscando la polémica:\n«Jamás sería del Madrid, son unos lloricas increíbles».' },
  { id: 'p6', v: 1, escribible: true, modo: 'votan', minPalabras: 250, formato: 'noticia', texto: 'Me tenéis que hacer una crónica de esta carrera de 250 palabras.\nTítulo, subtítulo, primer párrafo y texto.' }
];

// Las pruebas editadas desde el panel se guardan en data/madridista_pruebas.json (se pierden si Render vuelve a desplegar).
const ARCH_PRUEBAS = path.join(__dirname, 'data', 'madridista_pruebas.json');
try { if (fs && fs.existsSync(ARCH_PRUEBAS)) PRUEBAS = JSON.parse(fs.readFileSync(ARCH_PRUEBAS, 'utf8')); } catch (e) {}
PRUEBAS.forEach(p => { if (p.activa === undefined) p.activa = true; });

function guardarPruebas(lista) {
  if (!Array.isArray(lista)) return false;
  const limpia = lista.slice(0, 40).map((p, i) => {
    const proy = p.tipo === 'proyector';
    return { id: String(p.id || ('n' + Date.now() + i)).slice(0, 40), v: 1, escribible: !proy, soloProyector: proy,
      modo: p.tipo === 'profesor' ? 'profesor' : 'votan', minPalabras: Math.max(0, Math.min(3000, parseInt(p.minPalabras, 10) || 0)), formato: ['libre', 'titular', 'noticia', 'tuit'].includes(p.formato) ? p.formato : 'libre',
      video: String(p.video || '').slice(0, 300), texto: String(p.texto || '').slice(0, 3000), activa: p.activa !== false };
  }).filter(p => p.texto.trim());
  if (!limpia.length) return false;
  PRUEBAS = limpia;
  try { if (fs) fs.writeFileSync(ARCH_PRUEBAS, JSON.stringify(PRUEBAS, null, 1)); } catch (e) {}
  return true;
}

/* ---------- utilidades ---------- */
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

function acierta(resp, claves) {
  const r = norm(resp);
  if (!r) return false;
  const toks = r.split(' ');
  for (const k of claves) {
    const nk = norm(k);
    const tol = nk.length >= 8 ? 2 : nk.length >= 5 ? 1 : 0;
    if (lev(r, nk) <= tol) return true;
    if (nk.includes(' ')) { if (r.includes(nk)) return true; continue; }
    if (toks.some(t => lev(t, nk) <= tol)) return true;
  }
  return false;
}

function barajar(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* ---------- estado ---------- */
let S;
function nuevo() {
  if (S && S.timer) clearTimeout(S.timer);
  S = { fase: 'lobby', equipos: new Map(), podio: [], n: 0, sigTipo: 'foto', mazoF: [], jugadas: [], ronda: null, timer: null, cnt: 0 };
}
nuevo();

const activos = () => [...S.equipos.values()].filter(e => !e.fin);
const porToken = t => [...S.equipos.values()].find(e => e.token === t);

const quedanPruebas = () => PRUEBAS.filter(p => p.activa && !S.jugadas.includes(p.id));
function sacar(tipo) {
  if (tipo === 'foto') { if (!S.mazoF.length) S.mazoF = barajar(FOTOS); return S.mazoF.pop(); }
  const quedan = quedanPruebas();
  if (!quedan.length) return null;
  const p = quedan[0]; // las pruebas salen en el orden de la lista
  S.jugadas.push(p.id);
  return p;
}

function siguiente() {
  if (S.fase === 'fin' || S.fase === 'lobby') return;
  if (S.ronda && S.ronda.abierta) return;
  if (S.timer) clearTimeout(S.timer);
  const act = activos().length;
  if (!act) return;
  const tipo = S.sigTipo; S.sigTipo = tipo === 'foto' ? 'prueba' : 'foto';
  S.n++;
  if (tipo === 'foto') {
    const f = sacar('foto');
    S.ronda = { n: S.n, tipo, foto: f, abierta: true, cupo: Math.max(1, Math.ceil(act / 2)), ganadores: [], fallados: [], finTs: Date.now() + TIEMPO_FOTO * 1000 };
    S.timer = setTimeout(cerrar, TIEMPO_FOTO * 1000);
  } else {
    const p = sacar('prueba');
    if (!p) { S.n--; return terminar(); }
    S.ronda = { n: S.n, tipo, prueba: p, abierta: true, etapa: p.escribible ? 'escribir' : 'unica', respuestas: {}, votos: {}, puntos: {}, premios: {} };
  }
  S.fase = tipo;
  emitir();
}

function palabras(t) {
  let o; try { o = JSON.parse(t); } catch (e) {}
  const txt = o && typeof o === 'object' ? String(o.texto || '') : String(t || '');
  return txt.trim() ? txt.trim().split(/\s+/).length : 0;
}
const valeRespuesta = (r, id) => !!r.respuestas[id] && palabras(r.respuestas[id]) >= (r.prueba.minPalabras || 0);
const candidatos = () => { const r = S.ronda; return activos().filter(e => valeRespuesta(r, e.id)); };
function todosVotaron() {
  const r = S.ronda, cand = candidatos().map(e => e.id);
  return activos().every(e => cand.filter(id => id !== e.id).length === 0 || r.votos[e.id]);
}
function repartirVotos(r) {
  const pts = {};
  Object.values(r.votos).forEach(ids => ids.forEach((id, k) => { pts[id] = (pts[id] || 0) + [3, 2, 1][k]; }));
  r.puntos = pts;
  const orden = Object.entries(pts).filter(([id, p]) => p > 0 && S.equipos.has(id)).sort((a, b) => b[1] - a[1]);
  orden.forEach(([id, p], i) => {
    const rango = orden.findIndex(x => x[1] === p);
    if (rango < 3) r.premios[id] = [3, 2, 1][rango];
  });
}

// sin pruebas pendientes: se acaba la carrera y el podio lo completan los mejor colocados
function terminar() {
  if (S.timer) clearTimeout(S.timer);
  if (S.ronda) S.ronda.abierta = false;
  [...S.equipos.values()].filter(e => !S.podio.includes(e.id)).sort((a, b) => b.pos - a.pos)
    .slice(0, Math.max(0, 3 - S.podio.length)).forEach(e => S.podio.push(e.id));
  S.fase = 'fin';
  emitir();
}

// el profesor pasa la ronda actual sin puntos y sale otra del mismo tipo
function saltar() {
  const r = S.ronda;
  if (!r || !r.abierta) return;
  if (S.timer) clearTimeout(S.timer);
  r.abierta = false;
  S.sigTipo = r.tipo; S.n--;
  S.fase = 'entre';
  siguiente();
}

function cerrar() {
  const r = S.ronda;
  if (!r || !r.abierta) return;
  if (S.timer) clearTimeout(S.timer);
  if (r.tipo === 'prueba' && r.etapa === 'votar') {
    // se enseñan los votos antes de sumar: el profesor pulsa otra vez para dar las casillas
    repartirVotos(r); r.etapa = 'resultado';
    return emitir();
  }
  if (r.tipo === 'prueba' && r.etapa === 'escribir' && r.prueba.modo !== 'profesor') {
    r.etapa = 'votar';
    if (todosVotaron()) return cerrar();
    return emitir();
  }
  r.abierta = false; r.etapa = 'cerrada';
  const llegan = [];
  if (r.tipo === 'foto') {
    r.ganadores.forEach(id => { const e = S.equipos.get(id); if (e) { e.pos += 1; llegan.push(e); } });
  } else {
    Object.entries(r.premios).sort((a, b) => b[1] - a[1]).forEach(([id, pts]) => {
      const e = S.equipos.get(id); if (e && pts > 0) { e.pos += pts; llegan.push(e); }
    });
  }
  llegan.forEach(e => {
    if (e.pos >= META) { e.pos = META; if (!e.fin) { e.fin = true; S.podio.push(e.id); } }
  });
  if (r.tipo === 'prueba' && !quedanPruebas().length) return terminar();
  S.fase = S.podio.length >= 3 ? 'fin' : 'entre';
  emitir();
}

/* ---------- vista de cada cliente ---------- */
function vista(rol, eqId) {
  const r = S.ronda;
  const prof = rol === 'prof';
  const out = {
    fase: S.fase, meta: META, tiempoFoto: TIEMPO_FOTO, podio: S.podio, n: S.n,
    equipos: [...S.equipos.values()].map(e => ({
      id: e.id, nombre: e.nombre, pos: e.pos, fin: e.fin, conectado: !!e.sock,
      respondio: r && r.tipo === 'prueba' ? r.respuestas[e.id] !== undefined : (r && r.tipo === 'foto' ? r.ganadores.includes(e.id) : false)
    })),
    yo: eqId || null, ronda: null
  };
  if (r) {
    const base = { n: r.n, tipo: r.tipo, abierta: r.abierta };
    if (r.tipo === 'foto') {
      Object.assign(base, { foto: '/madridista_fotos/' + r.foto.file, cupo: r.cupo, ganadores: r.ganadores, fallados: r.fallados || [], finTs: r.finTs });
      if (!r.abierta || prof) base.nombre = r.foto.nombre;
      base.revelado = !r.abierta;
    } else {
      const p = r.prueba;
      base.prueba = { id: p.id, v: p.v, escribible: p.escribible, soloProyector: !!p.soloProyector, formato: p.formato || 'libre', modo: p.modo || 'votan', minPalabras: p.minPalabras || 0 };
      if (prof || !p.soloProyector) base.prueba.texto = p.texto;
      if (prof && p.video) base.prueba.video = p.video;
      base.etapa = r.etapa;
      if (prof) {
        base.respuestas = r.respuestas; base.nVotaron = Object.keys(r.votos).length; base.premios = r.premios;
        if (!r.abierta || r.etapa === 'resultado') { base.puntos = r.puntos; base.votos = r.votos; }
      } else if (eqId) {
        base.miRespuesta = r.respuestas[eqId] ?? null;
        if (r.etapa === 'votar') {
          base.candidatos = candidatos().filter(e => e.id !== eqId).map(e => ({ id: e.id, nombre: e.nombre, texto: r.respuestas[e.id] }));
          base.miVoto = r.votos[eqId] || null;
        }
        if (!r.abierta || r.etapa === 'resultado') { base.premios = r.premios; base.puntos = r.puntos; }
      }
    }
    out.ronda = base;
  }
  return out;
}

function emitir() {
  for (const [, s] of io.sockets.sockets) {
    s.emit('estado', vista(s.data.rol, s.data.eqId));
  }
}

/* ---------- sockets ---------- */
io.on('connection', sock => {
  sock.data = { rol: 'alumno', eqId: null };

  sock.on('unirse', ({ nombre, token }) => {
    nombre = String(nombre || '').trim().slice(0, 28);
    token = String(token || '').slice(0, 60);
    let e = token ? porToken(token) : null;
    if (!e) {
      if (!nombre) return sock.emit('error_msg', 'Escribe el nombre de tu equipo.');
      if ([...S.equipos.values()].some(x => norm(x.nombre) === norm(nombre))) return sock.emit('error_msg', 'Ese nombre ya está cogido.');
      if (S.equipos.size >= 15) return sock.emit('error_msg', 'Ya hay 15 equipos.');
      e = { id: String(++S.cnt), nombre, token: token || ('t' + Math.random().toString(36).slice(2) + Date.now()), pos: 0, fin: false, sock: null };
      S.equipos.set(e.id, e);
    }
    e.sock = sock; sock.data.eqId = e.id;
    sock.emit('unido', { token: e.token, nombre: e.nombre });
    emitir();
  });

  sock.on('respuesta', texto => {
    const e = S.equipos.get(sock.data.eqId); const r = S.ronda;
    if (!e || e.fin || !r || !r.abierta) return;
    texto = String(texto || '').slice(0, 8000);
    if (r.tipo === 'foto') {
      // una sola respuesta por equipo y foto: si falla, ya no puede volver a contestar
      if (r.ganadores.includes(e.id) || r.fallados.includes(e.id) || !texto.trim()) return;
      if (acierta(texto, r.foto.claves)) {
        r.ganadores.push(e.id);
        sock.emit('resultado', { ok: true, puesto: r.ganadores.length });
      } else { r.fallados.push(e.id); sock.emit('resultado', { ok: false }); }
      const todos = activos().every(q => r.ganadores.includes(q.id) || r.fallados.includes(q.id));
      if (r.ganadores.length >= r.cupo || todos) { emitir(); cerrar(); return; }
      emitir();
    } else if (r.prueba.escribible && r.etapa === 'escribir') {
      r.respuestas[e.id] = texto;
      emitir();
    }
  });

  /* panel del profesor */
  sock.on('auth', clave => {
    if (clave === CLAVE) { sock.data.rol = 'prof'; sock.emit('auth_ok'); sock.emit('estado', vista('prof', null)); }
    else sock.emit('auth_error');
  });
  const prof = fn => (...a) => { if (sock.data.rol === 'prof') fn(...a); };
  sock.on('empezar', prof(() => { if (S.fase === 'lobby' && S.equipos.size) { S.fase = 'entre'; siguiente(); } }));
  sock.on('siguiente', prof(() => { if (S.fase === 'entre') siguiente(); }));
  sock.on('cerrar', prof(cerrar));
  sock.on('saltar', prof(saltar));
  sock.on('premio', prof(({ id, pts }) => {
    const r = S.ronda;
    if (!r || !r.abierta || r.tipo !== 'prueba' || r.prueba.modo !== 'profesor' || !r.prueba.escribible || !S.equipos.has(id)) return;
    pts = Math.max(0, Math.min(3, Number(pts) || 0));
    if (pts) r.premios[id] = pts; else delete r.premios[id];
    emitir();
  }));
  sock.on('participa', prof(({ id, si }) => {
    const r = S.ronda;
    if (!r || !r.abierta || r.tipo !== 'prueba' || r.prueba.escribible || !S.equipos.has(id)) return;
    if (si) r.premios[id] = 1; else delete r.premios[id];
    emitir();
  }));
  sock.on('get_pruebas', prof(() => sock.emit('pruebas', PRUEBAS)));
  sock.on('guardar_pruebas', prof(lista => {
    if (guardarPruebas(lista)) { for (const [, x] of io.sockets.sockets) if (x.data.rol === 'prof') x.emit('pruebas', PRUEBAS); sock.emit('guardado', true); }
    else sock.emit('guardado', false);
  }));
  sock.on('votar', ids => {
    const e = S.equipos.get(sock.data.eqId); const r = S.ronda;
    if (!e || e.fin || !r || !r.abierta || r.tipo !== 'prueba' || r.etapa !== 'votar' || !Array.isArray(ids)) return;
    const cand = candidatos().filter(x => x.id !== e.id).map(x => x.id);
    ids = ids.map(String).filter((id, i, a) => a.indexOf(id) === i && cand.includes(id)).slice(0, 3);
    if (ids.length !== Math.min(3, cand.length)) return;
    r.votos[e.id] = ids;
    if (todosVotaron()) return cerrar();
    emitir();
  });
  sock.on('mover', prof(({ id, delta }) => {
    const e = S.equipos.get(id); if (!e) return;
    e.pos = Math.max(0, Math.min(META, e.pos + (delta > 0 ? 1 : -1)));
    if (e.pos >= META && !e.fin) { e.fin = true; S.podio.push(e.id); if (S.podio.length >= 3) S.fase = 'fin'; }
    emitir();
  }));
  sock.on('expulsar', prof(id => { S.equipos.delete(id); S.podio = S.podio.filter(x => x !== id); emitir(); }));
  sock.on('reiniciar', prof(() => { nuevo(); io.emit('reinicio'); emitir(); }));

  sock.on('disconnect', () => {
    const e = S.equipos.get(sock.data.eqId);
    if (e && e.sock === sock) { e.sock = null; emitir(); }
  });
});


function handle(req, res, url) {
  const P = "/api/madridista";
  if (!url.pathname.startsWith(P)) return false;
  const sub = url.pathname.slice(P.length);
  if (sub === "/stream") {
    const cid = String(url.searchParams.get("cid") || "").slice(0, 60);
    if (!cid) { res.writeHead(400); res.end(); return true; }
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Accel-Buffering": "no" });
    res.write("retry: 1500\n\n");
    const viejo = conns.get(cid);
    if (viejo) { conns.delete(cid); try { viejo._res.end(); } catch (e) {} if (viejo.h.disconnect) viejo.h.disconnect(); }
    const sock = { id: cid, data: {}, h: {}, _res: res,
      on(ev, f) { this.h[ev] = f; },
      emit(ev, d) { try { res.write("data: " + JSON.stringify({ ev, d }) + "\n\n"); } catch (e) {} } };
    conns.set(cid, sock);
    alConectar.forEach(f => f(sock));
    const hb = setInterval(() => { try { res.write(": ping\n\n"); } catch (e) {} }, 20000);
    req.on("close", () => {
      clearInterval(hb);
      if (conns.get(cid) === sock) { conns.delete(cid); if (sock.h.disconnect) sock.h.disconnect(); }
    });
    return true;
  }
  if (sub === "/clasificacion") {
    // orden final para la clasificación general: primero el podio, después el resto por casilla
    const todos = [...S.equipos.values()];
    const orden = S.podio.map((id, i) => S.equipos.get(id)).filter(Boolean).map((e, i) => ({ nombre: e.nombre, valor: 100000 - i }))
      .concat(todos.filter(e => !S.podio.includes(e.id)).sort((a, b) => b.pos - a.pos).map(e => ({ nombre: e.nombre, valor: e.pos })));
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ ok: true, fase: S.fase, orden }));
    return true;
  }
  if (sub === "/msg" && req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 400000) req.destroy(); });
    req.on("end", () => {
      let m; try { m = JSON.parse(body); } catch (e) {}
      const sock = m && conns.get(String(m.cid));
      if (!sock) { res.writeHead(409); return res.end("sin conexión"); }
      try { const f = sock.h[String(m.ev)]; if (f) f(m.d); } catch (e) { console.error("madridista", e); }
      res.writeHead(204); res.end();
    });
    return true;
  }
  res.writeHead(404); res.end(); return true;
}

module.exports = { handle };
