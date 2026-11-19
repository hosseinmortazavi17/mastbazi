const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'));
const server=http.createServer((q,r)=>{if(q.url==='/health'){r.writeHead(200);return r.end('ok')}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});r.end(HTML)});
const wss=new WebSocketServer({server,maxPayload:4096});
const MAX=20,rooms={},J=JSON.stringify;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const Q={n:['حاضری توی یه جزیره‌ی دورافتاده با کی گیر کنی؟','حاضری با کی یه سفر طولانی بری؟','حاضری با کی هم‌اتاق بشی؟','کی بهترین کارگردان فیلم ترسناکه؟','کی بدترین راننده‌ی جمعه؟','کی همیشه دیر می‌رسه؟','کی از همه بیشتر غذا می‌خوره؟','کی بیشتر از همه تو گوشیش گمه؟','کی اگه ثروتمند بشه اول از همه ما رو فراموش می‌کنه؟','کی بهترین مشاور درد و دله؟','حاضری با کی یه شب تو خونه‌ی ارواح بمونی؟','کی تو بازی پانتومیم از همه بهتره؟','کی اگه تو فیلم بود نقش دلقک می‌شد؟','کی از همه بیشتر خوش‌شانسه؟','کی بیشتر از همه قول می‌ده و عمل نمی‌کنه؟','کی بهترین آشپزه؟','کی اگه گم بشه اول از همه پیداش می‌کنی؟','کی بیشتر از همه جیغ می‌زنه؟'],
s:['حاضری با کی توی آسانسور خراب گیر کنی؟','کی بیشتر از همه پشت سر بقیه حرف می‌زنه؟','کی بدترین دروغگوئه ولی بازم دروغ می‌گه؟','کی اول از همه ازدواج می‌کنه و زود پشیمون می‌شه؟','کی تو گروه پیام می‌بینه و جواب نمی‌ده 👻؟','کی تو رابطه بیشتر از همه عوضی‌بازی درمیاره؟','کی تو مهمونی اول از همه ضایع می‌شه و آبروریزی می‌کنه؟','کی بدترین سلیقه رو تو انتخاب پارتنر داره؟','کی استوری‌های کرشش رو بیشتر از همه چک می‌کنه؟','با کی لاس زدن بامزه‌تره 😏؟','کی بیشتر از همه تو سفر با یکی آشنا می‌شه و دیگه برنمی‌گرده؟','کی بیشتر از همه ژست می‌گیره و فکر می‌کنه خیلی خفنه؟','کی بیشتر از همه خودشیفته‌ست؟','کی بلده تو چشم آدم زل بزنه و دروغ بگه؟','کی بیشتر از همه شب‌ها استوری غمگین می‌ذاره و صبح می‌گه شوخی بود؟','کی بدترین دوست‌پسر/دوست‌دختر ممکنه بشه؟','کی تو دعوا اول از همه جبهه عوض می‌کنه؟','کی بیشتر از همه فیلمش زیاده ولی عملش صفره؟']};
const D={n:['مثل مرغ ۱۰ ثانیه قدقد کن 🐔','۱۰ ثانیه مثل ربات برقص 🤖','با لهجه‌ی عجیب اسم همه رو صدا بزن','۵ ثانیه مجسمه شو 🗿','یه جوک بگو و اگه کسی نخندید دوباره!'],
s:['آخرین پیام گوشیتو بلند بخون 📱','بدترین عکس گالریتو نشون بده 😭','یه سلفی زشت بگیر و یه ساعت بذار پروفایلت','با ناز و عشوه به نفر کناریت بگو چرا باهاش دوست شدی 😘','یه اعتراف شرم‌آور بکن 🙈','بدترین رفتارت تو یه رابطه رو بگو','یه حرفی که همیشه تو دلت بوده و به یکی از جمع نگفتی رو بگو','یه جمله‌ی عاشقانه‌ی چرت به یکی از جمع بگو 💔','آخرین جستجوی گوگلتو بلند بگو 🔍']};
const RANK=['فرشته‌ی کوچولو 😇','شیطون خفیف 😏','بدجنس بامزه 😈','استاد شیطنت 🔥','رئیس مافیا 👑'];
const open=R=>R.players.filter(p=>p.ws.readyState===1);
const need=R=>open(R).filter(p=>R.mode!=='roast'||p.id!==R.target);
const roast=R=>R.mode==='roast';
function view(R,p){const it=R.items[R.idx],n=need(R);return{code:R.code,you:p.id,host:R.hostId,max:MAX,players:R.players.map(x=>({id:x.id,name:x.name,on:x.ws.readyState===1})),phase:R.phase,mode:R.mode,rid:R.rid,target:R.target,q:R.q,qi:R.qi,qn:R.qn,done:R.done,idx:R.idx,total:R.items.length,coin:R.coin,item:R.phase==='reveal'&&it?{t:it.t,w:R.coin===true?it.w:null}:null,mySub:R.subs[p.id]!==undefined,need:n.length,got:n.filter(x=>R.subs[x.id]!==undefined).length,rank:R.rank,dare:R.dare,tally:R.tally,scores:R.final}}
const push=R=>R.players.forEach(p=>{try{p.ws.readyState===1&&p.ws.send(J(view(R,p)))}catch(e){}});
function finishWrite(R){const n=R.players.filter(p=>R.subs[p.id]!==undefined);R.items=shuffle(n.map(p=>({t:R.subs[p.id],w:p.name})));R.phase='reveal';R.idx=0;R.coin=null}
function check(R){if(R.phase!=='write')return;const n=need(R);if(n.length&&n.every(p=>R.subs[p.id]!==undefined))finishWrite(R)}
function ask(R){const pool=Q[R.mode==='spicy'?'s':'n'];let l=pool.filter(x=>!R.used.includes(x));if(!l.length){R.used=R.used.filter(x=>!pool.includes(x));l=pool}R.q=pick(l);R.used.push(R.q);R.subs={};R.items=[];R.coin=null;R.idx=0;R.rid++;R.phase='write'}
function tally(R){const c={};R.items.forEach(i=>c[i.t]=(c[i.t]||0)+1);R.tally=Object.entries(c).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n);R.tally.forEach(x=>R.scores[x.name]=(R.scores[x.name]||0)+x.n);R.dare=pick(D[R.mode==='spicy'?'s':'n']);R.phase='tally'}
const hb=setInterval(()=>wss.clients.forEach(w=>{if(w.alive===false)return w.terminate();w.alive=false;try{w.ping()}catch(e){}}),20000);
wss.on('connection',ws=>{let R=null,P=null;ws.alive=true;ws.on('pong',()=>ws.alive=true);ws.on('error',()=>{});
const err=t=>{try{ws.send(J({err:t}))}catch(e){}};
ws.on('close',()=>{if(!R||!P||P.ws!==ws)return;const RR=R,PP=P;try{check(RR);push(RR)}catch(e){}
if(!open(RR).length)setTimeout(()=>{if(!open(RR).length)delete rooms[RR.code]},3600000);
else if(PP.id===RR.hostId)setTimeout(()=>{if(PP.ws.readyState!==1&&RR.hostId===PP.id){const n=open(RR)[0];if(n){RR.hostId=n.id;push(RR)}}},45000)});
ws.on('message',d=>{try{let m;try{m=JSON.parse(d)}catch(e){return}
if(m.t==='create'||m.t==='join'){const name=String(m.name||'').trim().slice(0,14),k=String(m.k||'').slice(0,40);if(!name||!k)return err('اسم رو بنویس');
let RR;if(m.t==='create'){let code;do{code=String(Math.floor(1000+Math.random()*9000))}while(rooms[code]);RR=rooms[code]={code,hostId:null,players:[],phase:'lobby',mode:'roast',subs:{},items:[],done:[],idx:0,coin:null,rid:0,qi:0,qn:0,used:[],scores:{},final:null}}
else{RR=rooms[String(m.code||'').trim()];if(!RR)return err('اتاق پیدا نشد')}
let PP=RR.players.find(p=>p.k===k);
if(!PP){const same=RR.players.find(p=>p.name===name);if(same&&same.ws.readyState===1)return err('این اسم تو اتاق هست، یه اسم دیگه بذار');
if(same){PP=same;PP.k=k}else{if(RR.players.length>=MAX)return err('اتاق پر شده (حداکثر ۲۰ نفر)');PP={id:Math.random().toString(36).slice(2,8),name,k,ws};RR.players.push(PP);if(!RR.hostId)RR.hostId=PP.id}}
if(PP.ws!==ws&&PP.ws.readyState===1)try{PP.ws.close()}catch(e){}
PP.ws=ws;R=RR;P=PP;return push(R)}
if(!R||!P)return;const host=P.id===R.hostId;
if(m.t==='start'&&host&&R.phase==='lobby'){if(open(R).length<3)return err('حداقل ۳ نفر لازمه');
R.mode=['roast','who','spicy'].includes(m.mode)?m.mode:'roast';R.final=null;
if(roast(R)){let l=open(R).filter(p=>!R.done.includes(p.id));const t=R.players.find(p=>p.id===m.target&&p.ws.readyState===1)||(l.length?pick(l):null);if(!t)return err('نوبت همه تموم شده، دورها رو ریست کن');
R.target=t.id;R.subs={};R.items=[];R.coin=null;R.idx=0;R.rid++;R.phase='write'}
else{R.qn=[5,8,10].includes(m.rounds)?m.rounds:5;R.qi=1;R.scores={};R.target=null;ask(R)}}
else if(m.t==='submit'&&R.phase==='write'&&R.subs[P.id]===undefined&&(!roast(R)||P.id!==R.target)){
let v;if(roast(R)){v=String(m.v||'').trim().slice(0,200)}else{const c=R.players.find(p=>p.id===m.v&&p.id!==P.id);v=c&&c.name}
if(!v)return;R.subs[P.id]=v;check(R)}
else if(m.t==='flip'&&host&&R.phase==='reveal'&&R.coin===null)R.coin=Math.random()<.5;
else if(m.t==='next'&&host){
if(R.phase==='reveal'){R.idx++;R.coin=null;if(R.idx>=R.items.length){if(roast(R)){if(!R.done.includes(R.target))R.done.push(R.target);R.rank=pick(RANK);R.dare=pick(D.n);R.phase='end'}else tally(R)}}
else if(R.phase==='tally'){R.qi++;if(R.qi>R.qn){R.final=Object.entries(R.scores).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n);R.phase='end'}else ask(R)}}
else if(m.t==='force'&&host&&R.phase==='write'){if(!Object.keys(R.subs).length)return err('هنوز کسی ننوشته');finishWrite(R)}
else if(m.t==='lobby'&&host){R.phase='lobby';R.coin=null}
else if(m.t==='reset'&&host&&R.phase==='lobby')R.done=[];
else if(m.t==='kick'&&host&&m.id!==P.id){const x=R.players.find(p=>p.id===m.id);if(!x)return;R.players=R.players.filter(p=>p!==x);delete R.subs[x.id];R.done=R.done.filter(i=>i!==x.id);try{x.ws.send(J({kicked:1}));x.ws.close()}catch(e){}
if(R.phase!=='lobby'&&roast(R)&&R.target===x.id)R.phase='lobby';else check(R)}
else return;
push(R)}catch(e){console.error(e)}})});
process.on('uncaughtException',e=>console.error(e));
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('running'));
