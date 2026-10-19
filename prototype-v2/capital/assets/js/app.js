(()=>{
'use strict';
const D=window.CC, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
const ST={verified:'已核實',unverified:'未核實',missing:'缺漏'};
const st=s=>`<span class="st ${s}">${ST[s]||s}</span>`;
const srcs=ids=>{ids=(Array.isArray(ids)?ids:String(ids||'').split(' ')).filter(Boolean);return ids.length?`<button class="srcb" data-src="${ids.join(' ')}" aria-label="查看來源">源</button>`:''};
const CAMP=D.camps, cc=k=>CAMP[k].c;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- source popup ---------- */
const pop=$('#pop');
document.addEventListener('click',e=>{
  const b=e.target.closest('.srcb');
  if(b){e.stopPropagation();
    const ids=b.dataset.src.split(' ');
    pop.innerHTML=`<button class="x" aria-label="關閉">×</button>`+ids.map(id=>{const s=D.src[id];if(!s)return '';return `<p><b>${esc(s.p)}</b>${s.d?'｜'+esc(s.d):''}<br>${esc(s.t)}${s.u?`<br><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.u.replace(/^https?:\/\//,'').slice(0,64))}…</a>`:''}</p>`}).join('');
    pop.hidden=false;
    const r=b.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
    let x=Math.min(Math.max(16,r.left-w/2),innerWidth-w-16),y=r.bottom+8;if(y+h>innerHeight-30)y=Math.max(16,r.top-h-8);
    pop.style.left=x+'px';pop.style.top=y+'px';return}
  if(!e.target.closest('#pop')||e.target.closest('.x'))pop.hidden=true;
});
addEventListener('scroll',()=>{pop.hidden=true},{passive:true});

/* ---------- tickers ---------- */
const tk=(el,items)=>{const one=`<span>${items.map(t=>`<em>${t}</em><span>→</span>`).join('')}</span>`;el.innerHTML=one+one};
tk($('#tkTop'),['CAPITAL CURRENT','台北市長選舉 1994–2026','THE TAIPEI TIDE','11.28 VOTE','潮汐 × 洋流 × 暗流','DATA WITH SOURCES']);
tk($('#tkBot'),['本站引用網路公開資料・僅供分析參考','已核實 / 未核實 / 缺漏','NEUTRAL BY DESIGN','點「源」看出處','資料更新 '+D.asOf]);

/* ---------- countdown ---------- */
{const now=new Date(),t=new Date(D.voteDay+'T00:00:00+08:00');const d=Math.ceil((t-now)/864e5);$('#dday').textContent=d>0?d:'0'}

/* ---------- hero sea: animated stripe waves ---------- */
function sea(){
  const cv=$('#sea'),cx=cv.getContext('2d');let W,H,dpr;
  const size=()=>{dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)};
  size();addEventListener('resize',size);
  let t=0,vis=true;new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(cv);
  const draw=()=>{
    if(vis){cx.clearRect(0,0,W,H);
      const top=H*.69,rows=14;
      cx.fillStyle='#fff';
      for(let i=0;i<rows;i++){
        const p=i/rows, y0=top+Math.pow(p,1.35)*(H-top), th=2+p*p*22, amp=3+p*16, k=(0.006-p*.003), sp=t*(0.6+p*1.2);
        cx.beginPath();
        for(let x=-20;x<=W+20;x+=8){const y=y0+Math.sin(x*k+sp+i*1.7)*amp+Math.sin(x*k*2.3-sp*.7)*amp*.35;x===-20?cx.moveTo(x,y):cx.lineTo(x,y)}
        for(let x=W+20;x>=-20;x-=8){const y=y0+th+Math.sin(x*k+sp+i*1.7+.5)*amp+Math.sin(x*k*2.3-sp*.7)*amp*.35;cx.lineTo(x,y)}
        cx.closePath();cx.globalAlpha=.55+p*.45;cx.fill();
      }
      cx.globalAlpha=1;
      // splash curls
      cx.strokeStyle='#fff';cx.lineWidth=3;
      for(let j=0;j<5;j++){const x=(W*(.08+j*.22)+t*14)%(W+120)-60,y=top-6-Math.sin(t+j)*6;cx.beginPath();cx.arc(x,y,10+j%2*6,Math.PI*.9,Math.PI*2.1);cx.stroke()}
    }
    if(!reduce)t+=.012;requestAnimationFrame(draw)};
  draw();
}
sea();

/* ---------- wave separators ---------- */
const BG={o:'#ee5a1f',c:'#fff3e4',w:'#ffffff',n:'#0d1a2a'};
$$('.wave-sep').forEach((el,i)=>{
  const a=BG[el.dataset.from],b=BG[el.dataset.to];el.style.background=a;
  const W=1440,H=70,P=360;
  const path=(y,amp,ph)=>{let d=`M0 ${H} L0 ${y}`;for(let x=0;x<=W*2;x+=20)d+=` L${x} ${(y+Math.sin((x/P)*Math.PI*2+ph)*amp).toFixed(1)}`;return d+` L${W*2} ${H} Z`};
  const stripe=(y,amp,ph,th)=>{let d='',u='';for(let x=0;x<=W*2;x+=20){const yy=y+Math.sin((x/P)*Math.PI*2+ph)*amp;d+=(x?' L':'M')+x+' '+yy.toFixed(1);}for(let x=W*2;x>=0;x-=20){const yy=y+th+Math.sin((x/P)*Math.PI*2+ph)*amp;u+=` L${x} ${yy.toFixed(1)}`}return d+u+' Z'};
  const sc=(el.dataset.from==='o'||el.dataset.to==='o')?'#fff':(el.dataset.to==='n'||el.dataset.from==='n')?'#33c3dd':'#ee5a1f';
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><g class="wv" style="animation:wv${i%2} ${16+i*2}s linear infinite">
   <path d="${stripe(16,8,0,4)}" fill="${sc}" opacity=".9"/><path d="${stripe(28,9,.8,5)}" fill="${sc}" opacity=".7"/><path d="${path(40,10,1.6)}" fill="${b}"/></g></svg>`;
});
{const s=document.createElement('style');s.textContent='@keyframes wv0{to{transform:translateX(-720px)}}@keyframes wv1{from{transform:translateX(-720px)}to{transform:translateX(0)}}@media (prefers-reduced-motion:reduce){.wv{animation:none!important}}';document.head.appendChild(s)}

/* ---------- helpers for charts ---------- */
const svgIn=(sel,w,h)=>d3.select(sel).html('').append('svg').attr('viewBox',`0 0 ${w} ${h}`);
const onView=(el,fn,th=.25)=>{if(!('IntersectionObserver' in window)){fn();return}const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){fn();io.disconnect()}})},{threshold:th});io.observe(typeof el==='string'?$(el):el)};

/* ---------- 01 tide streamgraph ---------- */
const E=D.elections, keys=['kmt','np','oth','ind','dpp'];
const rows=E.map(e=>{const r={y:e.y};keys.forEach(k=>{r[k]=0;r[k+'_p']=0});e.c.forEach(([,k,v,p])=>{r[k]+=v;r[k+'_p']+=p});return r});
$('#campLegend').innerHTML=['kmt','dpp','ind','np','oth'].map(k=>`<span><i style="background:${cc(k)}"></i>${CAMP[k].n}</span>`).join('')+`<span class="note">${st('verified')}${srcs(['wiki-mayor','nccu-2018'])} 得票率；2006 年宋楚瑜以無黨籍參選，歸入「其他」</span>`;
function stream(){
  const w=1200,h=420,m={l:20,r:20,t:30,b:40};
  const svg=svgIn('#stream',w,h);
  const x=d3.scalePoint().domain(E.map(e=>e.y)).range([m.l+70,w-m.r-70]);
  const st_=d3.stack().keys(keys).offset(d3.stackOffsetSilhouette).order(d3.stackOrderNone)(rows);
  const y=d3.scaleLinear().domain([-800000,800000]).range([h-m.b,m.t]);
  const area=d3.area().x(d=>x(d.data.y)).y0(d=>y(d[0])).y1(d=>y(d[1])).curve(d3.curveMonotoneX);
  const clip=svg.append('clipPath').attr('id','tclip').append('rect').attr('x',0).attr('y',0).attr('height',h).attr('width',reduce?w:0);
  const g=svg.append('g').attr('clip-path','url(#tclip)');
  g.selectAll('path').data(st_).join('path').attr('d',area).attr('fill',d=>cc(d.key)).attr('stroke','#fff').attr('stroke-width',2);
  // stripe overlay for ocean feel
  const pat=svg.append('defs').append('pattern').attr('id','stp').attr('width',12).attr('height',12).attr('patternUnits','userSpaceOnUse').attr('patternTransform','rotate(-8)');
  pat.append('rect').attr('width',12).attr('height',2.2).attr('fill','rgba(255,255,255,.22)');
  g.selectAll('path.o').data(st_).join('path').attr('class','o').attr('d',area).attr('fill','url(#stp)');
  // year guides & labels
  const yl=svg.append('g');
  E.forEach(e=>{
    const X=x(e.y);
    yl.append('line').attr('x1',X).attr('x2',X).attr('y1',m.t-6).attr('y2',h-m.b+6).attr('stroke','#111').attr('stroke-dasharray','2 5').attr('opacity',.35);
    const t=yl.append('g').attr('transform',`translate(${X},${h-12})`).style('cursor','pointer').on('click',()=>pick(e.y));
    t.append('text').attr('text-anchor','middle').attr('font-family','Archivo Black').attr('font-size',20).text(e.y);
    const win=e.c[0];
    yl.append('text').attr('x',X).attr('y',m.t-10).attr('text-anchor','middle').attr('font-weight',900).attr('font-size',15).attr('fill',cc(win[1])).text(win[0]);
  });
  // labels inside biggest layers
  st_.forEach(layer=>{layer.forEach(d=>{const p=d.data[layer.key+'_p'];if(p>22){svg.append('text').attr('x',x(d.data.y)).attr('y',y((d[0]+d[1])/2)+5).attr('text-anchor','middle').attr('fill','#fff').attr('font-weight',900).attr('font-size',15).attr('pointer-events','none').text(p.toFixed(1)+'%')}})});
  svg.append('text').attr('x',w-m.r).attr('y',h-m.b+30).attr('text-anchor','end').attr('font-size',12).attr('fill','#7b7067').text('層的厚度＝得票數；數字＝得票率');
  // tooltip zones
  svg.append('g').selectAll('rect').data(E).join('rect').attr('x',d=>x(d.y)-60).attr('width',120).attr('y',m.t).attr('height',h-m.t-m.b).attr('fill','transparent').style('cursor','pointer').on('click',(ev,d)=>pick(d.y));
  onView('#stream',()=>clip.transition().duration(reduce?0:2200).ease(d3.easeCubicInOut).attr('width',w));
}
stream();

/* buoys + panel */
$('#buoys').innerHTML=E.map(e=>`<button class="buoy" role="tab" data-y="${e.y}" aria-selected="false">${e.y}<small>${esc(e.winner)}</small></button>`).join('');
$('#buoys').addEventListener('click',e=>{const b=e.target.closest('.buoy');if(b)pick(+b.dataset.y)});
function pick(y){
  const e=E.find(v=>v.y===y);
  $$('.buoy').forEach(b=>b.setAttribute('aria-selected',+b.dataset.y===y));
  const top=e.c[0][2],gap=e.c[0][2]-e.c[1][2];
  $('#yearPanel').innerHTML=`<div>
    <h3><span class="yr">${e.y}</span>${esc(e.winner)} 當選</h3>
    <p class="tide">${esc(e.tide)}</p>
    <div class="bars">${e.c.map(([n,k,v,p])=>`<div class="brow"><b>${esc(n)}</b><div class="btrack"><div class="bfill" data-w="${(v/top*100).toFixed(1)}" style="background:${cc(k)}">${fmt(v)}</div></div><span class="pct">${p.toFixed(2)}%</span></div>`).join('')}</div>
    <div class="ymeta"><div class="chip">投票率<b>${e.turnout?e.turnout+'%':'—'}</b></div><div class="chip">有效票<b>${fmt(e.valid)}</b></div><div class="chip">勝負差距<b>${fmt(gap)}</b></div></div>
    <p class="note">${st(e.status)}${srcs(e.src)} ${e.note?esc(e.note):''}</p>
  </div>
  <div class="gov">
    <h4>市長任內的城市變化：${esc(e.mayor.name)}（${esc(e.mayor.term)}）</h4>
    <ul>${e.gov.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>
    <p class="note">${e.gsrc?st('verified')+srcs(e.gsrc)+' 最後一項；其餘 ':''}${st('unverified')}${srcs(['general'])} 一般公開知識，尚未逐筆附原始出處。</p>
    <h4>競選口號</h4>
    <div class="slo">${st('missing')} 本站尚未找到可核實的 ${e.y} 年主口號原始出處，暫不列出，避免以訛傳訛。</div>
  </div>`;
  requestAnimationFrame(()=>$$('#yearPanel .bfill').forEach(b=>b.style.width=b.dataset.w+'%'));
}
pick(2022);

/* turnout & margin */
function turnout(){
  const w=560,h=220,m={l:40,r:16,t:16,b:30};const svg=svgIn('#turnout',w,h);
  const x=d3.scalePoint().domain(E.map(e=>e.y)).range([m.l,w-m.r]);const y=d3.scaleLinear().domain([60,85]).range([h-m.b,m.t]);
  svg.append('g').attr('transform',`translate(0,${h-m.b})`).call(d3.axisBottom(x).tickSize(0)).call(g=>g.select('.domain').remove()).selectAll('text').attr('font-size',12);
  svg.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d=>d+'%').tickSize(-(w-m.l-m.r))).call(g=>{g.select('.domain').remove();g.selectAll('line').attr('stroke','#eee')}).selectAll('text').attr('font-size',11);
  const line=d3.line().defined(d=>d.turnout!=null).x(d=>x(d.y)).y(d=>y(d.turnout)).curve(d3.curveMonotoneX);
  const p=svg.append('path').datum(E).attr('d',line).attr('fill','none').attr('stroke','#ee5a1f').attr('stroke-width',4);
  svg.selectAll('circle').data(E.filter(e=>e.turnout)).join('circle').attr('cx',d=>x(d.y)).attr('cy',d=>y(d.turnout)).attr('r',6).attr('fill','#fff').attr('stroke','#111').attr('stroke-width',2.5);
  svg.selectAll('text.v').data(E.filter(e=>e.turnout)).join('text').attr('class','v').attr('x',d=>x(d.y)).attr('y',d=>y(d.turnout)-12).attr('text-anchor','middle').attr('font-size',11).attr('font-weight',700).text(d=>d.turnout);
  const L=p.node().getTotalLength();p.attr('stroke-dasharray',L).attr('stroke-dashoffset',L);onView('#turnout',()=>p.transition().duration(1400).attr('stroke-dashoffset',0));
  $('#turnNote').innerHTML=`${st('verified')}${srcs(['wiki-mayor','wiki-1994'])} 2006 年投票率在來源表中未列出，標為${st('missing')}，圖上留空。`;
}
turnout();
function margin(){
  const w=560,h=220,m={l:56,r:16,t:16,b:30};const svg=svgIn('#margin',w,h);
  const data=E.map(e=>({y:e.y,v:e.c[0][2]-e.c[1][2],k:e.c[0][1]}));
  const x=d3.scaleBand().domain(data.map(d=>d.y)).range([m.l,w-m.r]).padding(.3);const y=d3.scaleLinear().domain([0,400000]).range([h-m.b,m.t]);
  svg.append('g').attr('transform',`translate(0,${h-m.b})`).call(d3.axisBottom(x).tickSize(0)).call(g=>g.select('.domain').remove()).selectAll('text').attr('font-size',12);
  svg.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d=>d/1e4+'萬').tickSize(-(w-m.l-m.r))).call(g=>{g.select('.domain').remove();g.selectAll('line').attr('stroke','#eee')}).selectAll('text').attr('font-size',11);
  const b=svg.selectAll('rect').data(data).join('rect').attr('x',d=>x(d.y)).attr('width',x.bandwidth()).attr('y',h-m.b).attr('height',0).attr('rx',6).attr('fill',d=>cc(d.k)).attr('stroke','#111').attr('stroke-width',2);
  svg.selectAll('text.v').data(data).join('text').attr('class','v').attr('x',d=>x(d.y)+x.bandwidth()/2).attr('y',d=>y(d.v)-6).attr('text-anchor','middle').attr('font-size',11).attr('font-weight',700).text(d=>d.v<1e4?fmt(d.v):(d.v/1e4).toFixed(1)+'萬');
  onView('#margin',()=>b.transition().duration(1000).delay((d,i)=>i*80).attr('y',d=>y(d.v)).attr('height',d=>h-m.b-y(d.v)));
}
margin();

/* ---------- 02 duel ---------- */
const U=D.duel;
const cand=c=>`<article class="cand reveal"><div class="top"><div class="ph"><img src="${c.photo}" alt="${esc(c.name)}"></div><div><div class="nm">${esc(c.name)}</div><span class="pt" style="background:${cc(c.camp)}">${esc(c.party)}</span> <span class="note">${esc(c.role)}</span><div class="slg">「${esc(c.slogan)}」<small>${esc(c.en)}｜${c.sd} 發表 ${st('verified')}${srcs(c.ssrc)}</small></div></div></div>
 <div class="kv" style="background-image:url('${c.kv}')" role="img" aria-label="${esc(c.slogan)} 主視覺"></div>
 <p class="rd"><b>口號解讀：</b>${esc(c.read)}</p>
 <ul>${c.pledges.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><p class="note" style="padding:0 16px 14px;margin:-8px 0 0">${st('verified')}${srcs(c.psrc)} 政見摘錄</p></article>`;
$('#vs').innerHTML=cand(U.chiang)+`<div class="vsmark">VS</div>`+cand(U.shen);
$('#others').innerHTML=`<b>其他登記參選人：</b>${U.others.names.map(esc).join('、')}｜${esc(U.others.note)} ${st(U.others.s)}${srcs(U.others.src)}`;
$('#needs').innerHTML=`<div class="need hd"><div>城市需求（證據）</div><div>蔣萬安</div><div>沈伯洋</div></div>`+U.needs.map(n=>`<div class="need reveal"><div class="k"><b>${esc(n.k)}</b><span>${esc(n.ev)}</span></div><div class="c1"><span class="lab" style="color:${cc('kmt')}">蔣萬安</span>${esc(n.chiang)}</div><div><span class="lab" style="color:${cc('dpp')}">沈伯洋</span>${esc(n.shen)}</div></div>`).join('')+`<p class="note">${st('verified')}${srcs(['bnext-tpe','ris-11509','ltn-corridor','pts-shezi','ltn-grandma'])} 需求證據與政見都來自出處；「尚未整理到」代表本站還沒找到，不代表該陣營沒有提出。</p>`;

function poll(){
  const w=560,h=230;const svg=svgIn('#poll',w,h);const P=U.poll.r;
  const seg=[['蔣萬安',P.chiang,cc('kmt')],['沈伯洋',P.shen,cc('dpp')],['未決定',P.und,'#cfc6bb']];
  const tot=seg.reduce((a,b)=>a+b[1],0);const x=d3.scaleLinear().domain([0,tot]).range([20,w-20]);
  let acc=0;const g=svg.append('g');
  seg.forEach(([n,v,c],i)=>{const x0=x(acc);acc+=v;const ww=x(acc)-x0;
    const r=g.append('rect').attr('x',x0).attr('y',40).attr('height',70).attr('width',0).attr('fill',c).attr('stroke','#111').attr('stroke-width',2.5);
    onView('#poll',()=>r.transition().delay(i*250).duration(900).attr('width',ww));
    g.append('text').attr('x',x0+ww/2).attr('y',86).attr('text-anchor','middle').attr('fill',i<2?'#fff':'#111').attr('font-family','Archivo Black').attr('font-size',30).text(v+'%');
    g.append('text').attr('x',x0+ww/2).attr('y',30).attr('text-anchor','middle').attr('font-weight',900).attr('font-size',14).text(n)});
  // debate expectation
  const D2=U.debate.r;const y2=150;
  svg.append('text').attr('x',20).attr('y',y2).attr('font-size',13).attr('font-weight',900).text('辯論表現看好度（不是投票意向）');
  [['沈伯洋',D2.shen,cc('dpp')],['蔣萬安',D2.chiang,cc('kmt')]].forEach(([n,v,c],i)=>{const yy=y2+14+i*30;
    svg.append('text').attr('x',20).attr('y',yy+16).attr('font-size',13).text(n);
    const r=svg.append('rect').attr('x',80).attr('y',yy).attr('height',22).attr('rx',5).attr('width',0).attr('fill',c).attr('opacity',.85);
    onView('#poll',()=>r.transition().delay(800).duration(900).attr('width',v/50*(w-160)));
    svg.append('text').attr('x',80+v/50*(w-160)+8).attr('y',yy+16).attr('font-size',13).attr('font-weight',700).text(v+'%')});
  $('#pollNote').innerHTML=`${esc(U.poll.who)}｜${U.poll.d}｜${esc(U.poll.method)}｜n=${fmt(U.poll.n)}｜±${U.poll.moe}｜${esc(U.poll.trend)} ${st(U.poll.s)}${srcs(U.poll.src)}<br>辯論看好度：${U.debate.d} ${st(U.debate.s)}${srcs(U.debate.src)}（原始報導待補）。三項合計 101% 為來源四捨五入。`;
}
poll();
function social(){
  const w=560,h=230;const svg=svgIn('#social',w,h);const S=U.social;
  const rows=[['沈伯洋',S.shen,cc('dpp')],['蔣萬安',S.chiang,cc('kmt')]];
  const x=d3.scaleLinear().domain([0,50000]).range([0,w-170]);
  svg.append('text').attr('x',0).attr('y',16).attr('font-size',13).attr('font-weight',900).text('一週提及量（則）');
  rows.forEach(([n,v,c],i)=>{const y=28+i*36;
    svg.append('text').attr('x',0).attr('y',y+19).attr('font-size',13).text(n);
    const r=svg.append('rect').attr('x',64).attr('y',y).attr('height',26).attr('rx',6).attr('width',0).attr('fill',c);
    onView('#social',()=>r.transition().delay(i*200).duration(1000).attr('width',x(v.m)));
    svg.append('text').attr('x',64+x(v.m)+8).attr('y',y+19).attr('font-size',13).attr('font-weight',700).text(fmt(v.m)+'（+'+v.chg+'%）')});
  svg.append('text').attr('x',0).attr('y',128).attr('font-size',13).attr('font-weight',900).text('情緒分布：正面／中立／負面');
  const sx=d3.scaleLinear().domain([0,100]).range([0,w-70]);const cols=['#2fa36b','#cfc6bb','#d0402b'];
  rows.forEach(([n,v],i)=>{const y=140+i*36;let a=0;
    svg.append('text').attr('x',0).attr('y',y+19).attr('font-size',13).text(n);
    v.sent.forEach((p,j)=>{const r=svg.append('rect').attr('x',64+sx(a)).attr('y',y).attr('height',26).attr('width',sx(p)).attr('fill',cols[j]).attr('opacity',0);onView('#social',()=>r.transition().delay(400+j*200).duration(600).attr('opacity',1));
      if(p>9)svg.append('text').attr('x',64+sx(a)+sx(p)/2).attr('y',y+18).attr('text-anchor','middle').attr('font-size',12).attr('font-weight',700).attr('fill',j===1?'#111':'#fff').text(p+'%');a+=p})});
  $('#socNote').innerHTML=`QSearch｜${S.period}｜本人發文：沈 FB ${S.shen.fb}／Threads ${S.shen.th} 則；蔣 FB ${S.chiang.fb}／Threads ${S.chiang.th} 則 ${st(S.s)}${srcs(S.src)}`;
}
social();
function dist(){
  const C=D.city;const data=C.districts;const w=1200,h=300,m={l:10,r:10,t:30,b:40};const svg=svgIn('#dist',w,h);
  const x=d3.scaleBand().domain(data.map(d=>d[0])).range([m.l,w-m.r]).padding(.22);const y=d3.scaleLinear().domain([0,300000]).range([h-m.b,m.t]);
  const b=svg.selectAll('rect').data(data).join('rect').attr('x',d=>x(d[0])).attr('width',x.bandwidth()).attr('y',h-m.b).attr('height',0).attr('rx',8).attr('fill','#ee5a1f').attr('stroke','#111').attr('stroke-width',2.5);
  // wave stripes on top of bars
  svg.selectAll('text.n').data(data).join('text').attr('class','n').attr('x',d=>x(d[0])+x.bandwidth()/2).attr('y',h-14).attr('text-anchor','middle').attr('font-weight',900).attr('font-size',15).text(d=>d[0]);
  svg.selectAll('text.v').data(data).join('text').attr('class','v').attr('x',d=>x(d[0])+x.bandwidth()/2).attr('y',d=>y(d[1])-8).attr('text-anchor','middle').attr('font-size',12).attr('font-weight',700).text(d=>(d[1]/1e4).toFixed(1)+'萬');
  onView('#dist',()=>b.transition().duration(900).delay((d,i)=>i*50).attr('y',d=>y(d[1])).attr('height',d=>h-m.b-y(d[1])));
  $('#distNote').innerHTML=`全市戶籍人口 ${fmt(C.pop.v)}（${C.pop.d}）${st('verified')}${srcs(C.pop.src)}｜65 歲以上 ${C.old.v}%（${C.old.t}）、15–64 歲 ${C.work.v}%（${C.work.t}）${st('verified')}${srcs(C.old.src)}。本站不以年齡或職業推論投票傾向。`;
}
dist();

/* ---------- 03 current ---------- */
const Cu=D.current;
$('#gallery').innerHTML=Cu.visuals.map(v=>`<figure class="gal reveal" data-f="${v.f}" data-t="${esc(v.t)}"><img src="${v.f}" alt="${esc(v.t)}" loading="lazy"><div><b>${esc(v.t)}</b>${esc(v.d)}<br>${st(v.s)}${srcs(v.src)}</div></figure>`).join('');
$('#gallery').addEventListener('click',e=>{if(e.target.closest('.srcb'))return;const g=e.target.closest('.gal');if(!g)return;const lb=document.createElement('div');lb.className='lb';lb.innerHTML=`<div><img src="${g.dataset.f}" alt=""><p>${g.dataset.t}｜點擊關閉</p></div>`;lb.onclick=()=>lb.remove();document.body.appendChild(lb)});
$('#diff').innerHTML=Cu.diff.map(d=>`<article class="dcard reveal"><div class="n">${d.n}</div><h4>${esc(d.t)}</h4><p>${esc(d.d)}</p>${st(d.s)}${srcs(d.src)}</article>`).join('');
$('#flowList').innerHTML=Cu.flow.map(f=>`<li class="reveal"><div class="k">${esc(f.k)}</div><div class="v" data-v="${esc(f.v)}">${esc(f.v)}</div><div class="s">${esc(f.sub)}</div>${st(f.s)}${srcs(f.src)}</li>`).join('');
// count up
onView('#flowList',()=>$$('#flowList .v').forEach(el=>{const raw=el.dataset.v,m=raw.match(/^([\d,]+)(.*)$/);if(!m||reduce)return;const n=+m[1].replace(/,/g,''),t0=performance.now();const step=t=>{const p=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(n*e))+m[2];if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}));
function flowCanvas(){
  const cv=$('#flowCv'),cx=cv.getContext('2d');let W,H;const dpr=Math.min(2,devicePixelRatio||1);
  const size=()=>{W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)};size();addEventListener('resize',size);
  const P=Array.from({length:150},()=>({x:Math.random(),l:Math.random(),s:.0008+Math.random()*.002,a:Math.random()*6}));
  let vis=false;new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(cv);let t=0;
  const draw=()=>{if(vis){cx.fillStyle='rgba(17,17,17,.22)';cx.fillRect(0,0,W,H);
    P.forEach(p=>{p.x+=p.s*(reduce?0:1);if(p.x>1)p.x=0;const X=p.x*W,Y=H*(.15+p.l*.7)+Math.sin(p.x*9+p.a+t)*18;cx.fillStyle=p.l>.5?'#ee5a1f':'#fff';cx.globalAlpha=.8;cx.fillRect(X,Y,3,3)});cx.globalAlpha=1;t+=.01}
    requestAnimationFrame(draw)};draw();
}
flowCanvas();
function growth(){
  const w=560,h=220,m={l:54,r:24,t:20,b:30};const svg=svgIn('#growth',w,h);const G=Cu.growth;
  const x=d3.scalePoint().domain(G.map(g=>g.d)).range([m.l,w-m.r]);const y=d3.scaleLinear().domain([0,180000]).range([h-m.b,m.t]);
  svg.append('g').attr('transform',`translate(0,${h-m.b})`).call(d3.axisBottom(x).tickSize(0).tickFormat(d=>d.replace('-','/'))).call(g=>g.select('.domain').remove()).selectAll('text').attr('font-size',12);
  svg.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d=>d/1e4+'萬').tickSize(-(w-m.l-m.r))).call(g=>{g.select('.domain').remove();g.selectAll('line').attr('stroke','#eee')}).selectAll('text').attr('font-size',11);
  const ar=svg.append('path').datum(G).attr('fill','rgba(238,90,31,.18)').attr('d',d3.area().x(d=>x(d.d)).y0(h-m.b).y1(d=>y(d.v)));
  const p=svg.append('path').datum(G).attr('fill','none').attr('stroke','#ee5a1f').attr('stroke-width',4).attr('stroke-dasharray','8 6').attr('d',d3.line().x(d=>x(d.d)).y(d=>y(d.v)));
  svg.selectAll('circle').data(G).join('circle').attr('cx',d=>x(d.d)).attr('cy',d=>y(d.v)).attr('r',7).attr('fill','#fff').attr('stroke','#111').attr('stroke-width',3);
  svg.selectAll('text.v').data(G).join('text').attr('class','v').attr('x',d=>x(d.d)).attr('y',d=>y(d.v)-14).attr('text-anchor',(d,i)=>i===G.length-1?'end':'middle').attr('font-size',12).attr('font-weight',700).text(d=>d.v?fmt(d.v)+'+':'啟動');
  d3.select('#growth').append('p').attr('class','note').html(`${st('verified')}${srcs(['setn-crew1','setn-crew2'])}`);
}
growth();
function claim(){
  const w=560,h=220,m={l:120,r:70,t:16,b:10};const svg=svgIn('#claim',w,h);
  const data=[['團隊目標',12888,'#cfc6bb'],['10/17 上午',13455,'#ff8a4c'],['10/18 截止',18249,'#ee5a1f']];
  const x=d3.scaleLinear().domain([0,20000]).range([m.l,w-m.r]);
  data.forEach(([n,v,c],i)=>{const y=m.t+i*62;
    svg.append('text').attr('x',m.l-10).attr('y',y+30).attr('text-anchor','end').attr('font-size',14).attr('font-weight',900).text(n);
    const r=svg.append('rect').attr('x',m.l).attr('y',y+8).attr('height',36).attr('rx',8).attr('width',0).attr('fill',c).attr('stroke','#111').attr('stroke-width',2.5);
    onView('#claim',()=>r.transition().delay(i*250).duration(900).attr('width',x(v)-m.l));
    svg.append('text').attr('x',x(v)+8).attr('y',y+32).attr('font-family','Archivo Black').attr('font-size',16).text(fmt(v))});
  svg.append('line').attr('x1',x(12888)).attr('x2',x(12888)).attr('y1',4).attr('y2',h-6).attr('stroke','#111').attr('stroke-dasharray','4 4');
  $('#claimNote').innerHTML=`${esc(Cu.claim.t)} ${st('verified')}${srcs(Cu.claim.src)}`;
}
claim();
$('#tlKey').innerHTML=Object.entries(Cu.tkind).map(([k,[n,c]])=>`<span><i style="background:${c}"></i>${n}</span>`).join('');
$('#timeline').innerHTML=Cu.timeline.map(e=>`<article class="tev"><span class="dot" style="background:${Cu.tkind[e.k][1]}"></span><div class="d">${e.d.replace('-','/')}</div><h4>${esc(e.t)}</h4><p>${esc(e.x)}</p>${st('verified')}${srcs(e.src)}</article>`).join('');
{const tl=$('#timeline');tl.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&tl.scrollWidth>tl.clientWidth){const max=tl.scrollWidth-tl.clientWidth;if((e.deltaY>0&&tl.scrollLeft<max-1)||(e.deltaY<0&&tl.scrollLeft>0)){tl.scrollLeft+=e.deltaY;e.preventDefault()}}},{passive:false})}

const R=[
  ['06/21',['社子串聯北士科','提出把社子與北士科串成產業聚落，並點出親水設施老舊、照明不足。'],['社子島已進入區段徵收','「也許不是很了解」，開發已報內政部審議。'],['pts-shezi']],
  ['10/13',['「到底要串什麼」','質疑首都科技廊帶；AI 分算力、軟體、應用三層，軟體公司開會「坐捷運或視訊也都 OK」。'],null,['ltn-corridor']],
  ['10/14',null,['「先做功課」','競辦發言人楊沛緰：企業需要研發空間、產學合作與技術驗證等實體條件。'],['ltn-corridor']],
  ['10/16',null,['雙北藍營議員圍攻','「淡海鄉親等了那麼多年，是在等一場視訊會議嗎？」並指民進黨政府也提過廊帶。'],['ltn-video']],
  ['10/17',['改提「創新街區」','引用 Innovation District 概念批評廊帶規劃。'],['「掉書袋」','蔣競辦：創新街區與 AI 廊帶概念相符。'],['ltn-district']],
  ['10/17',['社子島遶境','參加坤天亭遶境，阿嬤跪地請求照顧社子島居民（報導未記載沈的承諾）。'],['先安置後拆遷','防洪標準 200 年、戶戶安置、弱勢 24 年租金補貼、65 歲以上可租至終老。'],['ltn-grandma']]
];
const side=(s,k)=>s?`<div class="s"><b style="color:${cc(k)}">${k==='dpp'?'沈伯洋陣營':'蔣萬安陣營'}｜${esc(s[0])}</b>${esc(s[1])}</div>`:`<div class="s empty"></div>`;
$('#rounds').innerHTML=`<div class="rnd hd"><div class="d"></div><div class="s">沈伯洋陣營</div><div class="s">蔣萬安陣營／國民黨</div></div>`+R.map(r=>`<div class="rnd reveal"><div class="d">${r[0]}</div>${side(r[1],'dpp')}${side(r[2],'kmt')}</div>`).join('')+`<p class="note">${st('verified')}${srcs(['pts-shezi','ltn-corridor','ltn-video','ltn-district','ltn-grandma'])} 本站只並列雙方說法，不判定誰對。</p>`;

/* rings */
function rings(){
  const svg=d3.select('#rings');const c=300;const RS=[[0,62,'自家主場'],[1,130,'第三方評論'],[2,200,'網路節目／YouTube'],[3,270,'他溫層：國民黨籍主持人']];
  const cols=['#ee5a1f','#ffd9c4','#ffe9dc','#fff6ef'];
  [...RS].reverse().forEach(([i,r])=>svg.append('circle').attr('cx',c).attr('cy',c).attr('r',r).attr('fill',cols[i]).attr('stroke','#111').attr('stroke-width',2.5));
  // ripple
  const rp=svg.append('circle').attr('cx',c).attr('cy',c).attr('r',62).attr('fill','none').attr('stroke','#ee5a1f').attr('stroke-width',4);
  const rip=()=>{if(reduce)return;rp.attr('r',62).attr('opacity',1).transition().duration(2600).ease(d3.easeCubicOut).attr('r',280).attr('opacity',0).on('end',rip)};rip();
  RS.forEach(([i,r,n])=>{if(i===0){svg.append('text').attr('x',c).attr('y',c-6).attr('text-anchor','middle').attr('font-weight',900).attr('font-size',17).attr('fill','#fff').text(n);svg.append('text').attr('x',c).attr('y',c+16).attr('text-anchor','middle').attr('font-size',12).attr('fill','#fff').text('Threads 32／FB 33 則');return}
    svg.append('text').attr('x',c).attr('y',c-r+20).attr('text-anchor','middle').attr('font-weight',900).attr('font-size',14).text(n)});
  const IV=Cu.interviews;const byRing={};IV.forEach((v,i)=>(byRing[v.ring]=byRing[v.ring]||[]).push(i));
  const pos=IV.map((v,i)=>{const arr=byRing[v.ring],j=arr.indexOf(i),n=arr.length;const r=RS[v.ring][1]-34;const a=(Math.PI*.15)+(j+.5)/n*(Math.PI*1.7)+(v.ring*.4);return [c+Math.cos(a)*r,c+Math.sin(a)*r+10]});
  const g=svg.append('g').selectAll('g').data(IV).join('g').attr('transform',(d,i)=>`translate(${pos[i]})`).style('cursor','pointer').on('click',(e,d)=>hl(IV.indexOf(d)));
  g.append('circle').attr('r',15).attr('fill','#111').attr('stroke','#fff').attr('stroke-width',3);
  g.append('text').attr('text-anchor','middle').attr('y',5).attr('fill','#fff').attr('font-family','Archivo Black').attr('font-size',13).text((d,i)=>i+1);
  $('#iv').innerHTML=IV.map((v,i)=>`<article class="ivc" data-i="${i}"><h4>${i+1}. ${esc(v.ch)}<span>${esc(v.d)}</span></h4><p class="note" style="margin:0 0 4px">${esc(v.fmt)}｜${esc(v.who)}</p><p>${esc(v.note)}</p>${st(v.s)}${srcs(v.src)}</article>`).join('')+`<p class="note">${st('missing')} 各影片觀看數、留言組成尚未擷取，本站不推估「破圈」人數；能確認的只有上了哪些節目，以及 QSearch 顯示「少康戰情室專訪」成為熱議主題。</p>`;
  const hl=i=>{$$('.ivc').forEach(el=>el.classList.toggle('on',+el.dataset.i===i));g.select('circle').attr('fill',(d,j)=>j===i?'#ee5a1f':'#111')};
  $('#iv').addEventListener('click',e=>{const c=e.target.closest('.ivc');if(c&&!e.target.closest('.srcb'))hl(+c.dataset.i)});hl(0);
}
rings();

/* han */
const Hn=Cu.han;
$('#han').innerHTML=`<div class="hcol reveal"><h4>2018 韓流</h4>${Hn.han.map(([a,b])=>`<div class="it"><b>${esc(a)}</b>${esc(b)}</div>`).join('')}${st('unverified')}${srcs(['general'])}</div>
<div class="hcol mid reveal"><h4>相同的地方</h4>${Hn.same.map(([a,b,s])=>`<div class="it"><b>${esc(a)}</b>${esc(b)} ${srcs(s)}</div>`).join('')}</div>
<div class="hcol reveal"><h4>2026 洋流</h4>${Hn.yang.map(([a,b])=>`<div class="it"><b>${esc(a)}</b>${esc(b)}</div>`).join('')}${st('verified')}${srcs(['setn-crew2','et-sweep2','ltn-apology','bt-tvbs'])}</div>
<p class="note" style="grid-column:1/-1;color:#2a1408">${esc(Hn.note)}</p>`;

/* verify */
const S=U.social,P=U.poll.r;
$('#verify').innerHTML=`<div class="vbox reveal"><b>社群提及量</b><div class="big">${fmt(S.shen.m)}</div><p>沈伯洋 vs 蔣萬安 ${fmt(S.chiang.m)}，沈多 ${Math.round((S.shen.m/S.chiang.m-1)*100)}%（本站以來源數字計算）</p>${st('verified')}${srcs(S.src)}</div>
<div class="vbox reveal"><b>正面情緒占比</b><div class="big">${S.shen.sent[0]}% vs ${S.chiang.sent[0]}%</div><p>沈伯洋 vs 蔣萬安；負面占比 ${S.shen.sent[2]}% vs ${S.chiang.sent[2]}%</p>${st('verified')}${srcs(S.src)}</div>
<div class="vbox reveal"><b>投票支持度</b><div class="big">${P.shen}% vs ${P.chiang}%</div><p>沈伯洋 vs 蔣萬安；未決定 ${P.und}%。同機構差距 28 點 → 8 點</p>${st('verified')}${srcs(U.poll.src)}</div>
<div class="vconc reveal">讀法：聲量和正面情緒是沈伯洋領先，投票支持度仍是蔣萬安領先 8 點。洋流確實把熱度轉成可計數的行動（船員、認領、到場），但聲量和民調量的是不同的人和不同的問題；11/28 的開票才是最終驗證。</div>`;

/* ---------- 04 ops ---------- */
const O=D.ops,GC={A:'#7ff0c2',B:'#ffd23f',C:'#ff9e7a'};
$('#grades').innerHTML=Object.entries(O.grades).map(([k,v])=>`<div class="grade g${k}"><b>${k}</b>${esc(v)}</div>`).join('');
$('#opsList').innerHTML=O.items.map((it,i)=>`<article class="opi reveal" data-i="${i}"><span class="g" style="color:${GC[it.g]}">${it.g}</span><h4>${esc(it.t)}</h4><div class="w">${esc(it.who)}｜${esc(it.d)}</div><p>${esc(it.x)}</p>${srcs(it.src)}</article>`).join('');
$('#gap').innerHTML=`${st('missing')} ${esc(O.gap)}`;
$('#tips').innerHTML=O.tips.map((t,i)=>`<div><b>0${i+1}</b>${esc(t)}</div>`).join('');
function sonar(){
  const cv=$('#sonar'),cx=cv.getContext('2d');let S;const dpr=Math.min(2,devicePixelRatio||1);
  const size=()=>{S=cv.clientWidth;cv.width=S*dpr;cv.height=S*dpr;cx.setTransform(dpr,0,0,dpr,0,0)};size();addEventListener('resize',size);
  const B=O.items.map((it,i)=>({g:it.g,a:i/O.items.length*Math.PI*2+.4,r:it.g==='A'?.28:it.g==='B'?.55:.78,i}));
  let a=0,vis=false;new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(cv);
  const draw=()=>{if(vis){const c=S/2;cx.clearRect(0,0,S,S);
    cx.strokeStyle='rgba(51,195,221,.35)';cx.lineWidth=1;[.28,.55,.78,.98].forEach(r=>{cx.beginPath();cx.arc(c,c,r*c,0,Math.PI*2);cx.stroke()});
    cx.beginPath();cx.moveTo(c,0);cx.lineTo(c,S);cx.moveTo(0,c);cx.lineTo(S,c);cx.stroke();
    const gr=cx.createConicGradient?cx.createConicGradient(a-0.9,c,c):null;
    if(gr){gr.addColorStop(0,'rgba(51,195,221,0)');gr.addColorStop(.14,'rgba(51,195,221,.45)');gr.addColorStop(.15,'rgba(51,195,221,0)');cx.fillStyle=gr;cx.beginPath();cx.arc(c,c,c,0,Math.PI*2);cx.fill()}
    B.forEach(b=>{let d=((a-b.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);const glow=Math.max(.25,1-d/3);const x=c+Math.cos(b.a)*b.r*c,y=c+Math.sin(b.a)*b.r*c;
      cx.globalAlpha=glow;cx.fillStyle=GC[b.g];cx.beginPath();cx.arc(x,y,7,0,Math.PI*2);cx.fill();cx.globalAlpha=glow*.35;cx.beginPath();cx.arc(x,y,16,0,Math.PI*2);cx.fill();cx.globalAlpha=1;
      cx.fillStyle='#e9eef4';cx.font='700 12px Archivo Black';cx.fillText(b.g+(b.i+1),x+11,y-9)});
    cx.fillStyle='#8fa3b8';cx.font='11px Noto Sans TC';cx.fillText('A',c+.28*c-10,c-4);cx.fillText('B',c+.55*c-10,c-4);cx.fillText('C',c+.78*c-10,c-4);
    if(!reduce)a+=.012}
    requestAnimationFrame(draw)};draw();
}
sonar();
function opsBars(){
  const w=560,h=250;const svg=svgIn('#opsBars',w,h);
  const groups=[['異常帳號（組）',[['2025 全年',45000],['2026 Q1',13000]]],['爭議訊息（則）',[['2025 全年',2314000],['2026 Q1',860000]]]];
  groups.forEach(([n,arr],gi)=>{const y0=20+gi*115;const max=d3.max(arr,d=>d[1]);const x=d3.scaleLinear().domain([0,max]).range([0,w-210]);
    svg.append('text').attr('x',0).attr('y',y0).attr('fill','#e9eef4').attr('font-weight',900).attr('font-size',14).text(n);
    arr.forEach(([k,v],i)=>{const y=y0+12+i*40;
      svg.append('text').attr('x',0).attr('y',y+21).attr('fill','#b9c6d4').attr('font-size',13).text(k);
      const r=svg.append('rect').attr('x',84).attr('y',y).attr('height',30).attr('rx',6).attr('width',0).attr('fill',i?'#33c3dd':'#7ff0c2');
      onView('#opsBars',()=>r.transition().delay(gi*300+i*150).duration(900).attr('width',x(v)));
      svg.append('text').attr('x',84+x(v)+8).attr('y',y+21).attr('fill','#fff').attr('font-family','Archivo Black').attr('font-size',14).text(v>=1e4?(v/1e4).toFixed(v%1e4?1:0)+' 萬+':fmt(v))})});
  d3.select('#opsBars').append('p').attr('class','note').html(`國家安全局公布 ${srcs(['cna-nsb-2025','cna-nsb-q1'])}｜全年與單季的期間不同，不能當成增減趨勢；數字為發布機關說法，本站無法獨立查證。`);
}
opsBars();

/* ---------- 05 log ---------- */
$('#stLegend').innerHTML=`${st('verified')} 本站讀過原始報導或官方資料　${st('unverified')} 一般知識、單一轉述或使用者提供，待補原始出處　${st('missing')} 找不到可靠資料，不自行推估`;
$('#srcList').innerHTML=Object.entries(D.src).map(([k,s])=>`<li><b>${esc(s.p)}</b>${s.d?'（'+esc(s.d)+'）':''}｜${s.u?`<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>`:esc(s.t)}</li>`).join('');
$('#asof').textContent=D.asOf;

/* ---------- nav + reveal ---------- */
const secs=['tide','duel','current','ops','log'].map(id=>document.getElementById(id));
const nio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('.ports a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>nio.observe(s));
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>rio.observe(el));
})();
