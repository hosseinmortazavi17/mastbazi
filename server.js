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
const o=t=>({t,k:'o'}),r=t=>({t,k:'r'}),e=t=>({t,k:'e'});
const DECK={n:[o('همه با هم یه صدای حیوون دربیارن 🐮'),o('{P} باید یه جوک بگه، اگه کسی نخندید دوباره!'),o('{P} به {Q} بگه چرا دوستشه ❤️'),o('{P} باید ۱۰ ثانیه مثل ربات برقصه 🤖'),o('همه اسم یه میوه بگن؛ هرکی مکث کنه یا تکرار کنه می‌بازه 🍉'),o('{P} و {Q} باید یه جمله رو همزمان بگن'),o('{P} باید از {Q} یه تعریف عجیب بکنه ✨'),o('هرکی آخرین نفر انگشتشو بذاره رو دماغش، بازنده‌ست 👃'),r('قانون: هر کس اسم کسی رو بگه باید قدقد کنه 🐔'),r('قانون: هر کس «آره» بگه باید ۱۰ ثانیه ساکت بشه 🤐'),r('قانون: چپ‌دست‌ها رئیسن، بقیه باید بهشون «قربان» بگن 🫡'),r('قانون: هر کس گوشی دستش بگیره باید ۳ بار «اشتباه کردم» بگه 📱'),e('قانون قدیمی‌ترین رو پاک کنید! 🧽'),e('یکی از قانون‌ها تموم شد، آزادین 🎉')],
s:[o('{P} آخرین پیام گوشیشو بلند می‌خونه 📱'),o('{P} بدترین عکس گالریشو نشون می‌ده 😭'),o('{P} یه اعتراف شرم‌آور می‌کنه 🙈'),o('{P} با ناز و عشوه به {Q} بگه چرا دوستشه 😘'),o('{P} یه نکته‌ی بدجنسانه ولی بامزه درباره‌ی {Q} بگه 😈'),o('{P} با صدای عاشقانه یه جمله‌ی چرت به {Q} بگه 💔'),o('{P} باید بدترین کارش تو یه رابطه رو بگه'),o('همه بگن آخرین استوری که مخفیانه دیدن مال کی بوده 👀'),o('آخرین جستجوی گوگل {P} رو بلند بخونه 🔍'),r('قانون: هر کس دروغ بگه و گرفته بشه، باید یه اعتراف بکنه 🤥'),r('قانون: هر کس «باشه» بگه باید یه خاطره‌ی خجالت‌آور تعریف کنه'),r('قانون: وقتی {P} حرف می‌زنه همه باید ادا دربیارن باورش دارن 🎭'),r('قانون: هر کس به گوشی نگاه کنه باید یه سلفی زشت بگیره 🤳'),e('قانون قبلی پاک شد، نفس بکشین 😮‍💨')]};
const open=R=>R.players.filter(p=>p.ws.readyState===1);
const need=R=>open(R).filter(p=>R.mode!=='roast'||p.id!==R.target);
const roast=R=>R.mode==='roast';
function view(R,p){const it=R.items[R.idx],n=need(R);return{code:R.code,you:p.id,host:R.hostId,max:MAX,players:R.players.map(x=>({id:x.id,name:x.name,on:x.ws.readyState===1})),phase:R.phase,mode:R.mode,rid:R.rid,target:R.target,q:R.q,qi:R.qi,qn:R.qn,done:R.done,idx:R.idx,total:R.items.length,coin:R.coin,item:R.phase==='reveal'&&it?{t:it.t,w:R.coin===true?it.w:null}:null,mySub:R.subs[p.id]!==undefined,need:n.length,got:n.filter(x=>R.subs[x.id]!==undefined).length,rank:R.rank,g:GM.includes(R.mode)&&R.phase!=='lobby'?gv(R,p):null,dare:R.dare,tally:R.tally,scores:R.final}}
const push=R=>R.players.forEach(p=>{try{p.ws.readyState===1&&p.ws.send(J(view(R,p)))}catch(e){}});
function finishWrite(R){const n=R.players.filter(p=>R.subs[p.id]!==undefined);R.items=shuffle(n.map(p=>({t:R.subs[p.id],w:p.name})));R.phase='reveal';R.idx=0;R.coin=null}
function check(R){if(R.phase==='ct_vote'||R.phase==='ct_sus')return ctCheck(R);if(R.phase!=='write')return;const n=need(R);if(n.length&&n.every(p=>R.subs[p.id]!==undefined))finishWrite(R)}
function ask(R){const pool=Q[R.mode==='spicy'?'s':'n'];let l=pool.filter(x=>!R.used.includes(x));if(!l.length){R.used=R.used.filter(x=>!pool.includes(x));l=pool}R.q=pick(l);R.used.push(R.q);R.subs={};R.items=[];R.coin=null;R.idx=0;R.rid++;R.phase='write'}
function tally(R){const c={};R.items.forEach(i=>c[i.t]=(c[i.t]||0)+1);R.tally=Object.entries(c).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n);R.tally.forEach(x=>R.scores[x.name]=(R.scores[x.name]||0)+x.n);R.dare=pick(D[R.mode==='spicy'?'s':'n']);R.phase='tally'}

// ===== بازی‌های جمعی =====
const GM=['kings','pan','tod','court'];
const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const KR={A:['آبشار 🌊','همه با هم شروع کنن به نوشیدن؛ کارت‌کش هر وقت خواست می‌ایسته، نفر بعدی و همین‌طور تا آخر'],'2':['تو 👉','یه نفر رو انتخاب کن که بنوشه'],'3':['من 🙋','خودت بنوش'],'4':['زمین 🖐️','آخرین نفری که دستش رو بزنه زمین می‌نوشه'],'5':['آقایون 🧔','همه‌ی آقایون بنوشن'],'6':['خانم‌ها 💃','همه‌ی خانم‌ها بنوشن'],'7':['بهشت ☝️','آخرین نفری که دستش رو ببره بالا می‌نوشه'],'8':['رفیق 🤝','یه نفر رو انتخاب کن؛ هر وقت یکیتون نوشید، اون یکی هم می‌نوشه'],'9':['قافیه 🎤','یه کلمه بگو؛ به نوبت قافیه بگید، اولین کسی که نتونه می‌نوشه'],'10':['دسته‌بندی 🗂️','یه موضوع بگو (مثلا میوه)؛ به نوبت مثال بزنید، اولین کسی که نتونه می‌نوشه'],J:['قانون‌ساز 📜','یه قانون بساز که تا آخر بازی بمونه؛ هر کس نقضش کنه می‌نوشه'],Q:['ملکه‌ی سؤال ❓','هر کس به سؤال تو جواب بده می‌نوشه؛ تا کارت ملکه‌ی بعدی'],K:['پادشاه 👑','یه کم نوشیدنی بریز تو جام وسط؛ چهارمین پادشاه کل جام رو می‌نوشه!']};
const BW=['سوسک','خروپف','سوتی دادن','آبروریزی','لاس زدن','پیام اشتباهی','دوست‌دختر سابق','گوزیدن','دستشویی عمومی','عروسی بدون دعوت','کلاه گذاشتن','جوراب بوگندو','سلفی ژکوند','مامان‌بزرگ عصبانی','بوی عرق','قهر کردن','فیلتر عکس','پشت سر حرف زدن','ناخن جویدن','تظاهر به مریضی','رفیق نیمه‌راه','عطسه‌ی ناگهانی','دروغ مصلحتی','خودشیفته','رانندگی تو ترافیک','پیاز خرد کردن','لباس زیر','حموم نرفتن','ماچ آبدار','فال‌گوش ایستادن','مهمون ناخونده','چاق شدن بعد عید','آینه‌ی آسانسور','تف کردن تو دریا','غیبت تو گروه','شب‌بیداری تا صبح'];
const CR={n:['دزدیدن آخرین تکه‌ی پیتزا از یخچال 🍕','فرستادن استیکر اشتباهی تو گروه خانوادگی','خروپف وسط یه جلسه‌ی خیلی مهم 😴','پیچوندن همه‌ی دوستاش با بهونه‌ی بیماری','دزدیدن شارژر همه‌ی مهمونی‌ها 🔌','گفتن «دارم میام» وقتی هنوز تو تخته','فروختن راز دوستش برای یه بسته چیپس 🥔','لو دادن سورپرایز تولد جلوی خود شخص 🎂'],
s:['دیدن پیام‌ها و جواب ندادن عمدی 👻','لایک کردن عکس سه سال پیش کرشش 💘','گذاشتن استوری غمگین فقط برای حرص دادن ex','سلفی با ژست خفن تو دستشویی عمومی 🤳','نقش بازی کردن تو یه رابطه‌ی فیک','پشت سر دوستاش تو گروه بدگویی کردن','زدن بوس هوایی به عکس خودش تو آینه 😘','جا زدن خودش به‌جای آدم مهم تو مهمونی','سابقه‌ی طولانی سوتی دادن و انکار کردن','قول دادن به ۳ نفر برای یه شب']};
const TDP={n:{t:['بامزه‌ترین سوتی عمرت چی بوده؟','آخرین باری که دروغ گفتی کی بود؟','از کی تو این جمع بیشتر می‌ترسی؟','خجالت‌آورترین لقبی که تو بچگی داشتی؟','چه غذایی رو قایمکی می‌خوری؟','بدترین هدیه‌ای که گرفتی چی بوده؟','آخرین بار کی گریه کردی و چرا؟','کدوم یکی از جمع رو بیشتر دوست داری؟'],d:['۱۰ ثانیه مثل مرغ قدقد کن 🐔','مثل ربات برقص 🤖','با لهجه‌ی عجیب اسم همه رو صدا بزن','۵ ثانیه مجسمه شو 🗿','یه جوک بگو، اگه کسی نخندید تکرار!','از کنار یه نفر یه چیز بدزد... بعدش پس بده!','یه آهنگ رو با غر غر بخون 🎤','با ادا یه فیلم رو نشون بده']},
s:{t:['خجالت‌آورترین پیامی که اشتباهی فرستادی چی بود؟','کی رو تو این جمع کرش داشتی یا داری؟ 😏','بدترین دروغی که تو رابطه گفتی؟','کدوم یکی از جمع رو بیشتر پشت سرش حرف زدی؟','آخرین چیزی که تو گوگل سرچ کردی و خجالت‌آور بود؟','بدترین قرار عمرت چی بود؟','کدوم عکس گالریت رو هیچ‌وقت نشون نمی‌دی؟','چیزی که هیچ‌وقت به هیچ‌کس تو این جمع نگفتی؟','کی تو جمع بدترین سلیقه‌ی لباس رو داره؟ رک بگو!','عوضی‌ترین کاری که تو یه رابطه کردی؟'],d:['آخرین پیام گوشیتو بلند بخون 📱','بدترین عکس گالریتو نشون بده 😭','سلفی زشت بگیر و یه ساعت بذار پروفایلت','با ناز و عشوه به نفر کناریت بگو چرا دوستشه 😘','یه اعتراف شرم‌آور بکن 🙈','با صدای عاشقانه یه جمله‌ی چرت به یه نفر بگو 💔','آخرین جستجوی گوگلتو بلند بگو 🔍','بدترین کارت تو رابطه رو بلند تعریف کن','یه نفر رو انتخاب کن و ازش بدجنسانه‌ترین تعریف عمرشو بکن 😈','به یکی از جمع زنگ بزن و بگو دلم برات تنگ شده!']}};
const PEN=['یه شات ... آب بخور و قیافه‌ی مست بگیر 🥴','۲۰ ثانیه مثل گربه میو کن 🐱','یه استیکر زشت تو گروه بفرست','جلوی همه بگو «من ترسوترین آدم دنیام»','با صدای بلند «بابا بزرگ» بخون 🎶'];
const isOn=(R,id)=>R.players.some(p=>p.id===id&&p.ws.readyState===1);
const nextOpen=(R,id)=>{const l=open(R),i=l.findIndex(p=>p.id===id);return(l[(i+1)%l.length]||l[0]).id};
const teamOf=(R,id)=>{const t=R.pn.teams[id];return t!==undefined?t:R.players.findIndex(p=>p.id===id)%2};
function pnDesc(R){const n=R.pn;n.team=n.turn%2;let m=open(R).filter(p=>teamOf(R,p.id)===n.team);if(!m.length){n.turn++;n.team=n.turn%2;m=open(R).filter(p=>teamOf(R,p.id)===n.team)}n.desc=m.length?m[n.tix[n.team]++%m.length].id:null}
function pnEnd(R){const n=R.pn;n.tid++;clearTimeout(n.tm);if(R.phase==='pn_turn'&&n.cur)n.pool.unshift(n.cur);n.cur=null;n.turn++;R.phase='pn_ready';pnDesc(R)}
function ctNew(R){const c=R.ct,op=open(R);let l=op.filter(p=>!c.dd.includes(p.id));if(!l.length){c.dd=[];l=op}const d=pick(l);c.dd.push(d.id);const o=shuffle(op.filter(p=>p!==d)).map(p=>p.id);
c.def=d.id;c.pro=o[0];c.law=o.length>=3?o[1]:null;c.jury=o.slice(c.law?2:1);c.cor=c.jury.length>=3?pick(c.jury):null;c.want=Math.random()<.5?'g':'i';
let cl=CR[c.lvl].filter(x=>!c.uc.includes(x));if(!cl.length){c.uc=[];cl=CR[c.lvl]}const cr=pick(cl);c.uc.push(cr);c.crime=d.name+' متهمه به '+cr;
c.votes={};c.sus={};c.verdict=null;c.rv=null;c.tally=null;c.i++;R.phase='ct_intro'}
function ctVerdict(R){const c=R.ct;let g=0,i=0;Object.values(c.votes).forEach(v=>v==='g'?g++:i++);c.tally={g,i};c.verdict=g>i?'g':'i';R.phase='ct_verdict'}
function ctReveal(R){const c=R.ct,d={},pun=[];const add=(id,v)=>{if(!id)return;c.sc[id]=(c.sc[id]||0)+v;d[id]=(d[id]||0)+v};
if(c.verdict==='g'){add(c.pro,2);pun.push(c.def)}else{add(c.law||c.def,2);if(c.law)add(c.def,1);pun.push(c.pro)}
c.jury.forEach(j=>{if(c.votes[j]===c.verdict)add(j,1)});let caught=false;
if(c.cor){const cnt={};Object.values(c.sus).forEach(x=>cnt[x]=(cnt[x]||0)+1);const mx=Math.max(0,...Object.values(cnt)),tops=Object.keys(cnt).filter(k=>cnt[k]===mx);caught=tops.length===1&&tops[0]===c.cor;
if(caught){pun.push(c.cor);Object.entries(c.sus).forEach(([k,v])=>{if(v===c.cor)add(k,1)})}else add(c.cor,c.verdict===c.want?3:1)}
const dares={};pun.forEach(id=>dares[id]=pick(D[c.lvl]));c.rv={cor:c.cor,caught,pun,dares,d};R.phase='ct_reveal'}
function ctCheck(R){const c=R.ct;if(!c)return;if(R.phase==='ct_vote'){const j=c.jury.filter(i=>isOn(R,i));if(j.length&&j.every(i=>c.votes[i]))ctVerdict(R)}
else if(R.phase==='ct_sus'){const o=open(R);if(o.length&&o.every(p=>c.sus[p.id]))ctReveal(R)}}
function init(R,m){const op=open(R),lvl=m.lvl==='s'?'s':'n';R.final=null;R.target=null;
if(R.mode==='kings'){R.k={deck:shuffle(SUITS.flatMap(s=>RANKS.map(r=>({r,s})))),card:null,by:null,cur:R.hostId,n:0,kings:0,rules:[],loser:null};R.phase='k'}
else if(R.mode==='pan'){if(op.length<4)return'برای پانتومیم حداقل ۴ نفر لازمه';const t={};R.players.forEach((p,i)=>t[p.id]=i%2);R.pn={words:[],mine:{},teams:t,pool:[],cur:null,rnd:1,turn:0,tix:[0,0],team:0,desc:null,deadline:0,dur:[45,60,90].includes(m.dur)?m.dur:60,scores:[0,0],tid:0,tm:null};R.phase='pn_setup'}
else if(R.mode==='tod'){R.td={lvl,sp:R.hostId,tg:null,ch:null,text:null,n:0,used:[]};R.phase='td'}
else if(R.mode==='court'){if(op.length<3)return'برای دادگاه حداقل ۳ نفر لازمه';R.ct={lvl,n:[3,5,8].includes(m.cases)?m.cases:3,i:0,sc:{},dd:[],uc:[]};ctNew(R)}}
function gv(R,p){const id=p.id;
if(R.mode==='kings'){const k=R.k;return{card:k.card,left:k.deck.length,kings:k.kings,rules:k.rules,cur:k.cur,by:k.by,loser:k.loser}}
if(R.mode==='pan'){const n=R.pn,t={};R.players.forEach(x=>t[x.id]=teamOf(R,x.id));return{words:n.words.length,mine:n.mine[id]||0,teams:t,rnd:n.rnd,team:n.team,desc:n.desc,deadline:n.deadline,now:Date.now(),dur:n.dur,scores:n.scores,cur:id===n.desc&&R.phase==='pn_turn'?n.cur:null,left:n.pool.length+(R.phase==='pn_turn'?1:0)}}
if(R.mode==='tod'){const t=R.td;return{lvl:t.lvl,sp:t.sp,tg:t.tg,ch:t.ch,text:t.text,n:t.n}}
if(R.mode==='court'){const c=R.ct,role=id===c.def?'def':id===c.pro?'pro':id===c.law?'law':id===c.cor?'cor':'jury',vd=['ct_verdict','ct_sus','ct_reveal'].includes(R.phase);
return{i:c.i,n:c.n,crime:c.crime,def:c.def,pro:c.pro,law:c.law,jury:c.jury,role,want:id===c.cor?c.want:null,myVote:c.votes[id]||null,mySus:c.sus[id]||null,got:Object.keys(c.votes).length,need:c.jury.filter(j=>isOn(R,j)).length,susGot:Object.keys(c.sus).length,susNeed:open(R).length,tally:vd?c.tally:null,verdict:vd?c.verdict:null,rv:R.phase==='ct_reveal'?c.rv:null,sc:c.sc}}
return null}
function G(R,P,m,host){const a=m.a,id=P.id;
if(R.mode==='kings'){const k=R.k;
if(a==='kd'&&R.phase==='k'&&(host||id===k.cur)){if(!k.deck.length){k.loser=null;R.phase='k_end';return 1}const c=k.deck.pop();k.card={r:c.r,s:c.s,t:KR[c.r][0],d:KR[c.r][1]};k.by=k.cur;k.n++;
if(c.r==='K'&&++k.kings>=4){k.loser=k.by;R.phase='k_end';return 1}k.cur=nextOpen(R,k.cur);return 1}
if(a==='kr'&&k.by===id&&k.card&&k.card.r==='J'){const v=String(m.v||'').trim().slice(0,80);if(!v)return 0;k.rules.push(v);if(k.rules.length>5)k.rules.shift();return 1}return 0}
if(R.mode==='pan'){const n=R.pn;
if(a==='pw'&&R.phase==='pn_setup'){const w=String(m.v||'').trim().slice(0,24);if(!w||(n.mine[id]||0)>=5||n.words.includes(w))return 0;n.words.push(w);n.mine[id]=(n.mine[id]||0)+1;return 1}
if(a==='pb'&&host&&R.phase==='pn_setup'){shuffle(BW.filter(w=>!n.words.includes(w))).slice(0,8).forEach(w=>n.words.push(w));return 1}
if(a==='pt'&&host&&R.phase==='pn_setup'){n.teams[m.id]=1-teamOf(R,m.id);return 1}
if(a==='pr'&&host&&R.phase==='pn_setup'){shuffle(R.players).forEach((p,i)=>n.teams[p.id]=i%2);return 1}
if(a==='ps'&&host&&R.phase==='pn_setup'){if(n.words.length<4)return 0;if([0,1].some(t=>!open(R).some(p=>teamOf(R,p.id)===t)))return 0;n.pool=shuffle(n.words);n.rnd=1;n.turn=0;n.scores=[0,0];pnDesc(R);R.phase='pn_ready';return 1}
if(a==='pg'&&R.phase==='pn_ready'&&(host||id===n.desc)){n.cur=n.pool.pop();n.deadline=Date.now()+n.dur*1000;const tid=++n.tid;n.tm=setTimeout(()=>{if(R.pn&&R.pn.tid===tid&&R.phase==='pn_turn'){pnEnd(R);push(R)}},n.dur*1000+200);R.phase='pn_turn';return 1}
if(a==='po'&&R.phase==='pn_turn'&&id===n.desc){n.scores[n.team]++;if(n.pool.length)n.cur=n.pool.pop();else{n.cur=null;n.tid++;clearTimeout(n.tm);R.phase='pn_round'}return 1}
if(a==='pk'&&R.phase==='pn_turn'&&id===n.desc){n.pool.unshift(n.cur);n.cur=n.pool.pop();return 1}
if(a==='pe'&&host&&R.phase==='pn_turn'){pnEnd(R);return 1}
if(a==='pn'&&host&&R.phase==='pn_round'){if(n.rnd>=3){R.phase='pn_end';return 1}n.rnd++;n.pool=shuffle(n.words);n.turn++;pnDesc(R);R.phase='pn_ready';return 1}return 0}
if(R.mode==='tod'){const t=R.td;
if(a==='ts'&&R.phase==='td'&&t.tg===null&&(host||id===t.sp)){const l=open(R).filter(p=>p.id!==t.sp);if(!l.length)return 0;t.tg=pick(l).id;t.ch=null;t.text=null;t.n++;return 1}
if(a==='tc'&&t.tg===id&&t.ch===null&&(m.v==='t'||m.v==='d')){const pool=TDP[t.lvl][m.v];let l=pool.filter(x=>!t.used.includes(x));if(!l.length){t.used=t.used.filter(x=>!pool.includes(x));l=pool}t.text=pick(l);t.used.push(t.text);t.ch=m.v;return 1}
if(a==='tp'&&t.tg===id&&(t.ch==='t'||t.ch==='d')){t.ch='p';t.text='ترسو! '+pick(PEN);return 1}
if(a==='td'&&t.ch&&(host||id===t.tg)){t.sp=t.tg;t.tg=null;t.ch=null;t.text=null;return 1}return 0}
if(R.mode==='court'){const c=R.ct;
if(a==='cv'&&R.phase==='ct_vote'&&c.jury.includes(id)&&!c.votes[id]&&(m.v==='g'||m.v==='i')){c.votes[id]=m.v;ctCheck(R);return 1}
if(a==='cs'&&R.phase==='ct_sus'&&!c.sus[id]&&c.jury.includes(m.v)&&m.v!==id){c.sus[id]=m.v;ctCheck(R);return 1}
if(a==='cn'&&host){const ph=R.phase;
if(ph==='ct_intro')R.phase='ct_pro';else if(ph==='ct_pro')R.phase='ct_def';else if(ph==='ct_def')R.phase='ct_vote';else if(ph==='ct_vote')ctVerdict(R);
else if(ph==='ct_verdict'){if(c.cor)R.phase='ct_sus';else ctReveal(R)}else if(ph==='ct_sus')ctReveal(R);
else if(ph==='ct_reveal'){if(c.i>=c.n)R.phase='ct_end';else ctNew(R)}else return 0;return 1}return 0}
return 0}
const hb=setInterval(()=>wss.clients.forEach(w=>{if(w.alive===false)return w.terminate();w.alive=false;try{w.ping()}catch(e){}}),20000);
wss.on('connection',ws=>{let R=null,P=null;ws.alive=true;ws.on('pong',()=>ws.alive=true);ws.on('error',()=>{});
const err=t=>{try{ws.send(J({err:t}))}catch(e){}};
ws.on('close',()=>{if(!R||!P||P.ws!==ws)return;const RR=R,PP=P;try{check(RR);push(RR)}catch(e){}
if(!open(RR).length)setTimeout(()=>{if(!open(RR).length)delete rooms[RR.code]},3600000);
else if(PP.id===RR.hostId)setTimeout(()=>{if(PP.ws.readyState!==1&&RR.hostId===PP.id){const n=open(RR)[0];if(n){RR.hostId=n.id;push(RR)}}},45000)});
ws.on('message',d=>{try{let m;try{m=JSON.parse(d)}catch(e){return}
if(m.t==='create'||m.t==='join'){const name=String(m.name||'').trim().slice(0,14),k=String(m.k||'').slice(0,40);if(!name||!k)return err('اسم رو بنویس');
let RR;if(m.t==='create'){let code;do{code=String(Math.floor(1000+Math.random()*9000))}while(rooms[code]);RR=rooms[code]={code,hostId:null,players:[],phase:'lobby',mode:'roast',subs:{},items:[],done:[],idx:0,coin:null,rid:0,qi:0,qn:0,used:[],scores:{},final:null,rules:[],n:0,card:null,deck:[]}}
else{RR=rooms[String(m.code||'').trim()];if(!RR)return err('اتاق پیدا نشد')}
let PP=RR.players.find(p=>p.k===k);
if(!PP){const same=RR.players.find(p=>p.name===name);if(same&&same.ws.readyState===1)return err('این اسم تو اتاق هست، یه اسم دیگه بذار');
if(same){PP=same;PP.k=k}else{if(RR.players.length>=MAX)return err('اتاق پر شده (حداکثر ۲۰ نفر)');PP={id:Math.random().toString(36).slice(2,8),name,k,ws};RR.players.push(PP);if(!RR.hostId)RR.hostId=PP.id}}
if(PP.ws!==ws&&PP.ws.readyState===1)try{PP.ws.close()}catch(e){}
PP.ws=ws;R=RR;P=PP;return push(R)}
if(!R||!P)return;const host=P.id===R.hostId;
if(m.t==='start'&&host&&R.phase==='lobby'){if(open(R).length<3)return err('حداقل ۳ نفر لازمه');
R.mode=['roast','who','spicy',...GM].includes(m.mode)?m.mode:'roast';R.final=null;
if(GM.includes(R.mode)){const e=init(R,m);if(e)return err(e)}
else if(roast(R)){let l=open(R).filter(p=>!R.done.includes(p.id));const t=R.players.find(p=>p.id===m.target&&p.ws.readyState===1)||(l.length?pick(l):null);if(!t)return err('نوبت همه تموم شده، دورها رو ریست کن');
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
else if(m.t==='g'){if(!G(R,P,m,host))return}
else if(m.t==='lobby'&&host){if(R.pn&&R.pn.tm){clearTimeout(R.pn.tm);R.pn.tid=-1}R.phase='lobby';R.coin=null}
else if(m.t==='reset'&&host&&R.phase==='lobby')R.done=[];
else if(m.t==='kick'&&host&&m.id!==P.id){const x=R.players.find(p=>p.id===m.id);if(!x)return;R.players=R.players.filter(p=>p!==x);delete R.subs[x.id];R.done=R.done.filter(i=>i!==x.id);try{x.ws.send(J({kicked:1}));x.ws.close()}catch(e){}
if(R.phase!=='lobby'&&roast(R)&&R.target===x.id)R.phase='lobby';else check(R)}
else return;
push(R)}catch(e){console.error(e)}})});
process.on('uncaughtException',e=>console.error(e));
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('running'));
