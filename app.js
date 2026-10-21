const $=s=>document.querySelector(s),app=$('#app'),CH=DATA.chapters;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const ALLQ=CH.flatMap(c=>c.q.map((x,i)=>({id:c.id+'-'+i,ch:c.id,t:x[0],o:x[1],a:x[2],e:x[3]})));
const QB=Object.fromEntries(ALLQ.map(q=>[q.id,q]));
const shuf=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
const seenMap=()=>{const h=store.get('hist',[]),m={};h.forEach(r=>r.qs.forEach(id=>{m[id]=(m[id]||0)+1}));return m};
const wshuf=a=>{const m=seenMap();return a.map(v=>[Math.random()/(1+(m[v.id]||0)*3),v]).sort((x,y)=>y[0]-x[0]).map(x=>x[1])};
const L='ABCD',pool=ch=>ch==='all'?ALLQ:ALLQ.filter(q=>q.ch==ch);
const chBtns=(sel)=>`<div class="row">${['all',...CH.map(c=>c.id)].map(v=>`<button data-sel="${v}" class="${v==sel?'on':''}">${v=='all'?'All chapters':'Ch. '+v}</button>`).join('')}</div>`;
const pages=[['','Home'],['practice','Practice'],['exam','Exam'],['review','Review'],['slides','Slides'],['summary','Summary']];
let S={},timer;

function route(){clearInterval(timer);const[p,arg]=location.hash.replace('#/','').split('/');
 $('#nav').innerHTML='<b>AbPsych Hub</b>'+pages.map(([h,n])=>`<a href="#/${h}" class="${h==(p||'')?'on':''}">${n}</a>`).join('');
 ({'':home,practice:()=>setup('p'),exam:()=>setup('e'),review:()=>review(arg),slides,summary}[p||'']||home)();scrollTo(0,0)}
addEventListener('hashchange',route);addEventListener('load',route);

function home(){const h=store.get('hist',[]);
 app.innerHTML=`<h1>Abnormal Psychology Study Hub</h1><p class="mut">DSM-5-TR based notes from Chapters 5-7: anxiety, trauma and OCD; somatic and dissociative; mood disorders and suicide.</p>
 <div class="grid">${[['practice','Practice test','Instant feedback after each answer.'],['exam','Exam mode','Timed, no hints, graded at the end.'],['review','Reviewable answers',h.length+' saved attempt(s).'],['slides','Raw slides','Original PDFs, view or download.'],['summary','Summary','Condensed notes per chapter.']].map(([r,t,d])=>`<a class="card" style="color:inherit;text-decoration:none" href="#/${r}"><h3>${t}</h3><span class="mut">${d}</span></a>`).join('')}</div>
 <p class="mut">${ALLQ.length} questions loaded. Verify the answer key against your sources before relying on it.</p>`}

function setup(m){S={m,sel:'all',n:10};draw()
 function draw(){const mx=pool(S.sel).length;S.n=Math.min(S.n,mx);
 app.innerHTML=`<h1>${m=='p'?'Practice test':'Exam mode'}</h1><p class="mut">${m=='p'?'See the correct answer and explanation after each question.':'Timed at 1 minute per question. Answers revealed only in review.'}</p>
 ${chBtns(S.sel)}<div class="row">Questions: <input type="number" id="n" min="1" max="${mx}" value="${S.n}" style="width:70px;font:inherit;padding:6px"> <span class="mut">of ${mx}</span></div><button class="p" id="go">Start</button>`;
 app.onclick=e=>{const b=e.target.closest('[data-sel]');if(b){S.n=+$('#n').value||S.n;S.sel=b.dataset.sel;draw()}if(e.target.id=='go'){S.n=Math.max(1,Math.min(+$('#n').value||1,mx));start()}}}}

function start(){S.qs=(S.m=='p'?wshuf(pool(S.sel)):shuf(pool(S.sel))).slice(0,S.n);S.i=0;S.ans={};S.fb=false;S.end=Date.now()+S.qs.length*60000;
 if(S.m=='e')timer=setInterval(tick,500);app.onclick=click;quiz()}
const tick=()=>{const r=Math.max(0,S.end-Date.now()),t=$('#t');if(t)t.textContent=`${Math.floor(r/60000)}:${String(Math.floor(r/1000)%60).padStart(2,'0')}`;if(!r)finish()};

function quiz(){const q=S.qs[S.i],a=S.ans[q.id],p=S.m=='p',last=S.i==S.qs.length-1;
 app.innerHTML=`<div class="row"><span class="tag">Ch. ${q.ch}</span><span class="mut">Question ${S.i+1} / ${S.qs.length}</span>${S.m=='e'?'<b id="t" style="margin-left:auto"></b>':''}</div>
 <div class="card"><h3>${esc(q.t)}</h3>${q.o.map((o,k)=>{let c='';if(p&&a!=null)c=k==q.a?'ok':k==a?'bad':'';else if(!p&&a==k)c='on';return`<button class="opt ${c}" data-o="${k}" ${p&&a!=null?'disabled':''}>${L[k]}. ${esc(o)}</button>`}).join('')}
 ${p&&a!=null?`<div class="why"><b>${a==q.a?'Correct.':'Correct answer: '+L[q.a]+'.'}</b> ${esc(q.e)}</div>`:''}</div>
 <div class="row">${S.m=='e'&&S.i>0?'<button data-nav="-1">Back</button>':''}${last?(S.m=='e'?'<button class="p" data-fin="1">Submit exam</button>':a!=null?'<button class="p" data-fin="1">Finish</button>':''):(S.m=='e'||a!=null?'<button class="p" data-nav="1">Next</button>':'')}</div>`;if(S.m=='e')tick()}

function click(e){const o=e.target.closest('[data-o]'),n=e.target.closest('[data-nav]');
 if(o){S.ans[S.qs[S.i].id]=+o.dataset.o;quiz()}else if(n){S.i+=+n.dataset.nav;quiz()}else if(e.target.dataset.fin)finish()}

function finish(){clearInterval(timer);const sc=S.qs.filter(q=>S.ans[q.id]===q.a).length;
 const rec={id:Date.now().toString(36),d:new Date().toLocaleString(),m:S.m,sel:S.sel,qs:S.qs.map(q=>q.id),ans:S.ans,sc};
 const h=store.get('hist',[]);h.unshift(rec);store.set('hist',h.slice(0,30));location.hash='#/review/'+rec.id}

function review(id){const h=store.get('hist',[]);
 if(!id){app.innerHTML=`<h1>Review answers</h1>${h.length?h.map(r=>`<a class="card" style="display:block;color:inherit;text-decoration:none" href="#/review/${r.id}"><b>${r.m=='e'?'Exam':'Practice'}</b> · ${r.sel=='all'?'All chapters':'Ch. '+r.sel} · ${r.sc}/${r.qs.length} (${Math.round(100*r.sc/r.qs.length)}%)<br><span class="mut">${esc(r.d)}</span></a>`).join(''):'<p class="mut">No attempts yet. Take a practice test or exam first.</p>'}${h.length?'<button id="clr">Clear history</button>':''}`;
  app.onclick=e=>{if(e.target.id=='clr'&&confirm('Delete all saved attempts?')){store.set('hist',[]);review()}};return}
 const r=h.find(x=>x.id==id);if(!r){location.hash='#/review';return}
 const pct=Math.round(100*r.sc/r.qs.length);
 app.innerHTML=`<a href="#/review">← All attempts</a><div class="card"><div class="big">${r.sc}/${r.qs.length} · ${pct}%</div><span class="mut">${r.m=='e'?'Exam':'Practice'} · ${esc(r.d)}</span></div>
 ${r.qs.map((qid,i)=>{const q=QB[qid],a=r.ans[qid],ok=a===q.a;return`<div class="card"><span class="tag" style="background:var(--${ok?'ok':'bad'})">${ok?'Correct':a==null?'Unanswered':'Wrong'}</span> <span class="mut">Ch. ${q.ch}</span><h3>${i+1}. ${esc(q.t)}</h3>${q.o.map((o,k)=>`<div class="opt ${k==q.a?'ok':k==a?'bad':''}" style="padding:6px 10px;border:1px solid var(--line);border-radius:6px;margin:4px 0">${L[k]}. ${esc(o)}${k==q.a?' ✓':''}${k==a&&!ok?' (your answer)':''}</div>`).join('')}<div class="why">${esc(q.e)}</div></div>`}).join('')}`}

function slides(){app.innerHTML=`<h1>Raw slides</h1><p class="mut">Original lecture PDFs. Inline viewer may not render on some mobile browsers; use Open or Download.</p>`+CH.map(c=>`<div class="card"><h3>Ch. ${c.id}: ${c.title}</h3><div class="row"><a class="btn p" href="${c.pdf}" target="_blank" rel="noopener">Open</a><a class="btn" href="${c.pdf}" download>Download</a><button data-v="${c.id}">Toggle viewer</button></div><div id="v${c.id}"></div></div>`).join('');
 app.onclick=e=>{const v=e.target.dataset.v;if(v){const d=$('#v'+v);d.innerHTML=d.innerHTML?'':`<iframe src="${CH.find(c=>c.id==v).pdf}" loading="lazy" title="Chapter ${v} slides"></iframe>`}}}

function summary(){app.innerHTML=`<h1>Summary</h1>`+CH.map(c=>`<div class="card"><h2>Ch. ${c.id}: ${c.title}</h2><ul>${c.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>`).join('')}


