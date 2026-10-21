"use strict";
// Serpientes y escaleras en red · módulo para el servidor de Render (sin dependencias)
const fs=require('fs'),crypto=require('crypto');
const QS=require('./serpientes_preguntas.json');
const ESCALERAS={3:22,8:20,21:29}, SERPIENTES={26:1,19:7,16:9};
const COL=['#E08A4B','#5B8FB9','#C05F7A','#6FA86B','#9B7BC0','#D4B23F'];
const rooms=new Map();
const conns=new Map();   // cid -> conexión SSE
const fotoTok=new Map();      // token aleatorio -> {buf,type}
const fotoCache=new Map();    // título wiki -> {buf,type}|null
const OKDESC=/period|present|escritor|locutor|corresponsal|columnist|directora|reportera|comunicad/i;
async function getJ(u){const c=new AbortController();const t=setTimeout(()=>c.abort(),3500);
  try{const r=await fetch(u,{signal:c.signal,headers:{'User-Agent':'serpientes-escaleras-clase/1.0'}});return r.ok?await r.json():null;}catch(e){return null;}finally{clearTimeout(t);}}
async function getB(u){const c=new AbortController();const t=setTimeout(()=>c.abort(),4500);
  try{const r=await fetch(u,{signal:c.signal,headers:{'User-Agent':'serpientes-escaleras-clase/1.0'}});if(!r.ok)return null;
    return {buf:Buffer.from(await r.arrayBuffer()),type:r.headers.get('content-type')||'image/jpeg'};}catch(e){return null;}finally{clearTimeout(t);}}
async function bajaFoto(p){
  if(process.env.FOTO_TEST)return {buf:fs.readFileSync(process.env.FOTO_TEST),type:'image/png'};
  if(fotoCache.has(p.wiki))return fotoCache.get(p.wiki);
  let url=null;
  const j=await getJ('https://es.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(p.wiki));
  if(j&&j.thumbnail&&OKDESC.test((j.description||'')+' '+(j.extract||'').slice(0,300)))url=j.thumbnail.source;
  if(!url){
    const q=await getJ('https://es.wikipedia.org/w/rest.php/v1/search/page?limit=3&q='+encodeURIComponent(p.name+' periodista'));
    const hit=q&&q.pages&&q.pages.find(x=>x.thumbnail&&OKDESC.test(x.description||'')&&norm(p.name).split(' ').every(w=>norm(x.title).includes(w)));
    if(hit)url=(hit.thumbnail.url.startsWith('//')?'https:':'')+hit.thumbnail.url;
  }
  const img=url?await getB(url):null;
  fotoCache.set(p.wiki,img);return img;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function code(){const L='ABCDEFGHJKMNPQRSTUVWXYZ';let c;do{c='';for(let i=0;i<4;i++)c+=L[Math.floor(Math.random()*L.length)];}while(rooms.has(c));return c;}
function norm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
function lev(a,b){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
function aciertaP(text,ap){
  const t=norm(text);if(t.length<3)return false;
  const toks=t.split(' ').concat([t.replace(/ /g,'')]);
  return ap.some(a=>{const tol=a.length<=3?0:a.length<=7?1:2;return toks.some(k=>k.length>=3&&lev(k,a)<=tol);});
}

function newRoom(){
  const r={code:code(),hostToken:crypto.randomBytes(8).toString('hex'),host:null,teams:[],phase:'lobby',turn:0,dice:0,aviso:null,
    q:null,priv:null,rev:null,fx:null,fxn:0,winner:null,gen:0,next:null,last:Date.now(),
    bagT:[],deck:{G:[],R:[],P:[]}};
  rooms.set(r.code,r);return r;
}
function resetGame(r){
  r.teams.forEach(t=>t.pos=1);r.phase='lobby';r.turn=0;r.dice=0;r.aviso=null;r.q=null;r.priv=null;r.rev=null;r.winner=null;r.gen++;r.bagT=[];r.deck={G:[],R:[],P:[]};
}
function snap(r,you){
  return {t:'state',code:r.code,phase:r.phase,turn:r.turn,dice:r.dice,aviso:r.aviso,fx:r.fx,winner:r.winner,you,
    teams:r.teams.map(t=>({id:t.id,name:t.name,color:t.color,pos:t.pos,on:!!t.ws})),q:r.q,rev:r.rev,
    rem:(r.phase==='question'&&r.qEnd)?Math.max(0,Math.round(r.qEnd-Date.now())):0};
}
function send(ws,o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));}
function bc(r){
  r.last=Date.now();
  send(r.host,snap(r,null));
  r.teams.forEach(t=>send(t.ws,snap(r,t.id)));
}
function fx(r,k){r.fx={n:++r.fxn,k};}
const SP=+process.env.SPEED||1;
const QTIME=+process.env.QTIME||30;
function after(r,ms,fn){const g=r.gen;setTimeout(()=>{if(r.gen===g)fn();},ms/SP);}

function siguiente(r){
  r.turn=(r.turn+1)%r.teams.length;r.phase='roll';r.q=null;r.priv=null;r.rev=null;r.aviso=null;r.dice=0;bc(r);
}
function repite(r){r.phase='roll';r.q=null;r.priv=null;r.rev=null;r.aviso=null;r.dice=0;bc(r);}
function fin(r,i){r.phase='end';r.winner=i;r.q=null;r.rev=null;fx(r,'win');bc(r);}

function tira(r){
  r.phase='rolling';r.dice=1+Math.floor(Math.random()*6);r.aviso=null;fx(r,'dado');bc(r);
  after(r,1250,()=>mueve(r,r.dice));
}
function mueve(r,n){
  const t=r.teams[r.turn];let d=t.pos+n,reb=false;
  if(d>30){d=60-d;reb=true;}
  t.pos=d;r.phase='moved';r.aviso=reb?{k:'reb',a:d}:null;bc(r);
  if(d===30)return after(r,520,()=>fin(r,r.turn));
  const salto=ESCALERAS[d]||SERPIENTES[d];
  if(salto){
    const esc=!!ESCALERAS[d];
    r.aviso={k:esc?'sube':'baja',a:d,b:salto};fx(r,esc?'esc':'ser');bc(r);
    return after(r,1200,()=>{
      t.pos=salto;bc(r);
      if(salto===30)return after(r,700,()=>fin(r,r.turn));
      if(!esc)return after(r,1600,()=>siguiente(r));
      after(r,1700,()=>pregunta(r));
    });
  }
  after(r,1400,()=>pregunta(r));
}
function tipo(r){
  if(!r.bagT.length)r.bagT=shuffle(['G','G','R','R','P']);
  return r.bagT.pop();
}
let qid=0;
async function pregunta(r){
  const g=r.gen;
  const tp=tipo(r);
  let q,priv,pp=null;
  if(tp==='P'){
    if(!r.deck.P.length)r.deck.P=shuffle([...Array(QS.p.length).keys()]);
    pp=QS.p[r.deck.P.pop()];
    q={kind:'p',cat:'P',text:pp.q};priv={kind:'p',ap:pp.ap,name:pp.name};
  }else{
    if(!r.deck[tp].length)r.deck[tp]=shuffle(QS.mc.map((x,i)=>i).filter(i=>QS.mc[i].c===tp));
    const x=QS.mc[r.deck[tp].pop()];
    const opts=shuffle(x.o.map((o,k)=>({o,ok:k===0})));
    q={kind:'mc',cat:tp,text:x.q,options:opts.map(z=>z.o)};
    priv={kind:'mc',idx:opts.findIndex(z=>z.ok)};
  }
  if(pp){const img=await bajaFoto(pp);if(img){const tk=crypto.randomBytes(6).toString('hex');fotoTok.set(tk,img);q.photo='/foto/'+tk;
    if(fotoTok.size>60)fotoTok.delete(fotoTok.keys().next().value);}}
  if(r.gen!==g)return;
  r.q=q;r.priv=priv;r.qid=++qid;r.qEnd=Date.now()+QTIME*1000/SP;
  r.phase='question';r.rev=null;r.aviso=null;bc(r);
  const id=r.qid;
  after(r,QTIME*1000,()=>{if(r.phase==='question'&&r.qid===id)cierra(r,{ok:false,timeout:true,kind:priv.kind});});
}
function cierra(r,rev){
  r.rev=rev;r.phase='reveal';r.qEnd=0;fx(r,rev.ok?'ok':'ko');bc(r);
  const ok=rev.ok;
  r.next=()=>ok?repite(r):siguiente(r);
  after(r,5000,()=>r.next&&r.next());
}
function responde(r,m){
  if(r.phase!=='question'||!r.priv)return;
  const p=r.priv;let ok;
  if(p.kind==='mc'){
    const i=m.i;if(!Number.isInteger(i)||i<0||i>3)return;
    ok=i===p.idx;
  }else{
    const t=String(m.text||'').slice(0,60);if(!t.trim())return;
    ok=aciertaP(t,p.ap);
  }
  cierra(r,{ok,kind:p.kind});
}


function onMessage(ws,m){
  if(!m||typeof m.t!=='string')return;
  if(m.t==='host'){
    let r=m.code&&rooms.get(String(m.code).toUpperCase());
    if(r&&r.hostToken!==m.token)r=null;
    if(!r)r=newRoom();
    r.host=ws;ws.room=r;ws.role='host';
    send(ws,{t:'hello',role:'host',code:r.code,token:r.hostToken});bc(r);return;
  }
  if(m.t==='join'){
    const r=rooms.get(String(m.code||'').toUpperCase().trim());
    if(!r)return send(ws,{t:'err',m:'No existe esa sala. Revisad el código.'});
    let tm=m.token&&r.teams.find(x=>x.token===m.token);
    if(tm){tm.ws=ws;}
    else{
      if(r.phase!=='lobby')return send(ws,{t:'err',m:'La partida ya ha empezado.'});
      if(r.teams.length>=6)return send(ws,{t:'err',m:'La sala está completa (6 equipos).'});
      const name=String(m.name||'').trim().slice(0,22)||('Equipo '+(r.teams.length+1));
      const used=new Set(r.teams.map(x=>x.color));
      tm={id:crypto.randomBytes(3).toString('hex'),token:crypto.randomBytes(8).toString('hex'),name,color:COL.find(c=>!used.has(c)),pos:1,ws};
      r.teams.push(tm);
    }
    ws.room=r;ws.role='team';ws.tm=tm;
    send(ws,{t:'hello',role:'team',code:r.code,token:tm.token,id:tm.id});bc(r);return;
  }
  const r=ws.room;if(!r)return;
  if(ws.role==='host'){
    if(m.t==='start'&&r.phase==='lobby'&&r.teams.length>=2){r.phase='roll';r.turn=0;bc(r);}
    else if(m.t==='skip'&&(r.phase==='roll'||r.phase==='question'))siguiente(r);
    else if(m.t==='cont'&&r.phase==='reveal'&&r.next){r.gen++;r.next();}
    else if(m.t==='reset'){resetGame(r);bc(r);}
    else if(m.t==='kick'&&r.phase==='lobby'){r.teams=r.teams.filter(x=>x.id!==m.id);bc(r);}
  }else if(ws.role==='team'){
    const cur=r.teams[r.turn];if(!cur||cur!==ws.tm)return;
    if(m.t==='roll'&&r.phase==='roll')tira(r);
    else if(m.t==='ans')responde(r,m);
  }
}
function onClose(ws){
  const r=ws.room;if(!r)return;
  if(ws.role==='host'&&r.host===ws)r.host=null;
  if(ws.role==='team'&&ws.tm&&ws.tm.ws===ws){ws.tm.ws=null;bc(r);}
}
// transporte SSE: el servidor empuja por /stream y el cliente envía por /msg
function handle(req,res,url){
  const P='/api/serpientes';
  if(!url.pathname.startsWith(P))return false;
  const sub=url.pathname.slice(P.length);
  if(sub.startsWith('/foto/')){
    const f=fotoTok.get(sub.slice(6));if(!f){res.writeHead(404);res.end();return true;}
    res.writeHead(200,{'Content-Type':f.type,'Cache-Control':'no-store'});res.end(f.buf);return true;
  }
  if(sub==='/stream'){
    const cid=String(url.searchParams.get('cid')||'').slice(0,40);if(!cid){res.writeHead(400);res.end();return true;}
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
    res.write('retry: 1500\n\n');
    const old=conns.get(cid);if(old){old.readyState=3;try{old.res.end();}catch(e){}}
    const ws={res,readyState:1,room:null,role:null,tm:null,
      send(str){try{res.write('data: '+str+'\n\n');}catch(e){}}};
    conns.set(cid,ws);
    const hb=setInterval(()=>{try{res.write(': ping\n\n');}catch(e){}},20000);
    req.on('close',()=>{clearInterval(hb);ws.readyState=3;if(conns.get(cid)===ws)conns.delete(cid);onClose(ws);});
    return true;
  }
  if(sub==='/msg'&&req.method==='POST'){
    let body='';
    req.on('data',c=>{body+=c;if(body.length>4096)req.destroy();});
    req.on('end',()=>{
      let m;try{m=JSON.parse(body);}catch(e){}
      const ws=m&&conns.get(String(m.cid));
      if(!ws){res.writeHead(409);return res.end('sin conexión');}
      try{onMessage(ws,m);}catch(e){console.error('serpientes',e);}
      res.writeHead(204);res.end();
    });
    return true;
  }
  res.writeHead(404);res.end();return true;
}
setInterval(()=>{const now=Date.now();rooms.forEach((r,k)=>{if(now-r.last>6*3600*1000)rooms.delete(k);});},600000).unref();
module.exports={handle};
