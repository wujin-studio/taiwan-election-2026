/* city analysis page */
(async function(){
const {esc,st,srcs,party,item,fmt}=EC;
const app=document.getElementById('app');
let db;try{db=await EC.loadDB()}catch(e){app.innerHTML=`<p class="panel">${esc(e.message)}</p>`;return}
const qs=new URLSearchParams(location.search);
const R=db.region[qs.get('r')]||db.region.taipei;
const cands=R.candidates.map(id=>db.cand[id]);
const majors=cands.filter(c=>c.major),minors=cands.filter(c=>!c.major);
const polls=db.polls.filter(p=>p.region===R.id);
document.title=`${R.name}${R.office}選戰行銷分析｜2026 選戰切一刀`;
document.getElementById('back').href='./#'+R.id;
const c1=c=>c.palette[0]==='#ffffff'?(c.palette[1]||'#888'):(c.palette[0]||'#888');
const c2=c=>c.palette[1]&&c.palette[1]!=='#ffffff'?c.palette[1]+'33':'#eee';
const cvars=c=>`--c1:${c1(c)};--c2:${c2(c)}`;

const TABS=[['marketing','行銷橫切面'],['people-cand','候選人'],['eras','城市年代'],['demo','人口結構'],['media','媒體布局'],['polls','民調與事件'],['compare','橫向比較']];
const ORDER=['taipei','new-taipei','taoyuan','taichung','tainan','kaohsiung','pingtung','pingtung-city'];

app.innerHTML=`
<section class="hero">
  <div>
    <div class="kicker"><label class="sr" for="rsel">切換選區</label><select id="rsel">${ORDER.map(id=>`<option value="${id}" ${id===R.id?'selected':''}>${esc(db.region[id].name)}${db.region[id].office}</option>`).join('')}</select><span>2026 年 11 月 28 日投票・還有 ${Math.max(0,EC.daysTo(db.meta.electionDay))} 天</span></div>
    <h1>${esc(R.name)}<small>${R.office}選戰</small></h1>
    <p class="facts"><span><b>${fmt(R.population.value)}</b>人 ${st(R.population.status)}${srcs(R.population.src)}<span class="note">（${R.population.date} 戶籍）</span></span><span><b>${cands.length}</b>位參選人</span>${R.parent?`<span class="note">屏東縣轄市，人口包含在屏東縣內</span>`:''}</p>
  </div>
  <svg class="mini" id="mini" role="img" aria-label="${esc(R.name)}行政區界"></svg>
</section>
<nav class="tabs" role="tablist" aria-label="分析頁籤">${TABS.map(([id,l],i)=>`<button role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="false" data-tab="${id}">${l}</button>`).join('')}</nav>
${TABS.map(([id])=>`<section class="panel" role="tabpanel" id="p-${id}" aria-labelledby="t-${id}" hidden></section>`).join('')}
<footer class="panel note" style="padding-top:0">${esc(db.meta.neutrality)}　資料更新：${db.meta.asOf}｜版本 ${EC.BUILD}</footer>`;
document.getElementById('rsel').onchange=e=>location.href=`city.html?r=${e.target.value}`;

/* ---------------- tab routing (hash; back button works) */
const rendered={};
function select(id,push){
  if(!TABS.some(t=>t[0]===id)) id='marketing';
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===id));
  document.querySelectorAll('.panel[role=tabpanel]').forEach(p=>p.hidden=p.id!=='p-'+id);
  if(!rendered[id]){rendered[id]=true;RENDER[id](document.getElementById('p-'+id))}
  if(push) history.pushState(null,'','#'+id);
  const t=document.getElementById('t-'+id);t.scrollIntoView({block:'nearest',inline:'center'});
}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){select(b.dataset.tab,true);scrollTo({top:document.querySelector('.tabs').offsetTop-64,behavior:EC.reduced()?'auto':'smooth'})}});
document.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;const i=TABS.findIndex(t=>t[0]===document.querySelector('.tabs [aria-selected=true]').dataset.tab);const n=TABS[(i+(e.key==='ArrowRight'?1:TABS.length-1))%TABS.length][0];select(n,true);document.getElementById('t-'+n).focus()});
document.addEventListener('click',e=>{const j=e.target.closest('[data-jump]');if(j){select(j.dataset.jump,true);scrollTo({top:document.querySelector('.tabs').offsetTop-64})}});
addEventListener('popstate',()=>select(location.hash.slice(1),false));

/* ---------------- geometry */
let towns=null;
async function getTowns(){if(towns)return towns;const g=await (await fetch(`data/geo/towns-${R.county}.geojson`)).json();towns=R.town?{...g,features:g.features.filter(f=>f.properties.code===R.town)}:g;return towns}
getTowns().then(g=>{const svg=d3.select('#mini'),w=340,h=200;svg.attr('viewBox',`0 0 ${w} ${h}`);const pj=d3.geoMercator().fitExtent([[8,8],[w-8,h-8]],g),path=d3.geoPath(pj);svg.selectAll('path').data(g.features).join('path').attr('d',path).attr('fill','#e7cdb9');svg.append('title').text(`${R.name}行政區界（內政部國土測繪中心）`)}).catch(()=>{});

/* ---------------- helpers */
const photo=(c,cls='sp-photo')=>c.photo?`<div class="${cls}"><img src="${c.photo.file}" alt="${esc(c.name)}" loading="lazy"></div>`:`<div class="${cls} mono" aria-label="照片缺漏">${esc(c.name[0])}<small>照片待補</small></div>`;
const sloganText=c=>c.slogan.status==='missing'?'目前未見已核實的正式口號':c.slogan.text;
const vote=p=>p.question==='vote';
function latestPhone(c){const ps=polls.filter(p=>p.mode==='phone'&&vote(p)&&p.results[c.id]!=null).sort((a,b)=>b.end.localeCompare(a.end));return ps[0]}

/* ================= RENDERERS ================= */
const RENDER={};

RENDER.marketing=el=>{
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">行銷橫切面</h2><p>先看口號本身：字面意思、情緒、品牌承諾，再看它對應到哪些城市條件，最後連到政見、媒體和數據。字義與情緒是編輯詮釋，不是陣營說法；有出處的事實都附「源」。</p></div></div>
  <div class="spreads">${majors.map(spread).join('')}</div>
  ${matrix()}
  ${minors.length?`<div class="sec"><h3 class="h-m">其他參選人</h3><p class="note">已完成登記；目前沒有看到正式口號或系統性的競選文宣報導。</p><div class="minors">${minors.map(c=>`<div><b>${esc(c.name)}</b>${party(c.party)}<p class="note" style="margin:.4em 0 0">${c.identity.map(x=>esc(x.text)).join('；')}</p></div>`).join('')}</div></div>`:''}`;
};
function spread(c){
  const a=c.analysis,none=c.slogan.status==='missing',vis=c.visuals;
  return `<article class="spread" style="${cvars(c)}">
  <div class="sp-head">${photo(c)}<div><h3 class="sp-name">${esc(c.name)}</h3><div class="sp-meta">${party(c.party)}${c.incumbent?'<span>現任</span>':''}<span>${c.photo?'照片：使用者提供，出處待補':'照片缺漏'}</span></div></div></div>
  <p class="slogan ${none?'none':''}">${esc(sloganText(c))}</p>
  <div class="slogan-meta">主口號 ${st(c.slogan.status)}${srcs(c.slogan.src)}${c.slogan.date?`<span>首見 ${c.slogan.date}</span>`:''}${c.slogan.en?`<span>英文：${esc(c.slogan.en)}</span>`:''}</div>
  ${c.slogan.note?`<p class="note" style="margin:.4em 0 0">${esc(c.slogan.note)}</p>`:''}
  ${c.subSlogans.length?`<ul class="subs">${c.subSlogans.map(s=>`<li>${esc(s.text)} ${st(s.status)}${srcs(s.src)}</li>`).join('')}</ul>`:''}
  ${c.timeline.length?`<ol class="tl" aria-label="口號與品牌時間軸">${c.timeline.map(t=>`<li><time>${esc(t.date||'日期待查')}</time><span>${esc(t.text)} ${st(t.status)}${srcs(t.src)}</span></li>`).join('')}</ol>`:''}
  ${vis.length?vis.map(v=>`<figure class="vis"><img src="${v.file}" alt="${esc(v.caption)}" loading="lazy"><figcaption><b>${esc(v.kind)}</b>｜${esc(v.caption)} ${st(v.status)}${srcs(v.src)}<br><span class="note">原圖由使用者提供；來源網址與使用授權尚未確認。</span></figcaption></figure>`).join(''):`<div class="vis none">原始主視覺圖檔缺漏：尚未取得可以入庫的陣營原圖，所以不放示意圖。</div>`}
  ${a?`<div class="decode">
    <div class="wide"><h4>字義</h4><p>${esc(a.meaning)}</p></div>
    <div><h4>情緒</h4><div class="chips">${a.emotion.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
    <div><h4>品牌承諾</h4><p>${esc(a.promise)}</p></div>
    <div class="wide"><h4>可能回應的生活情境</h4><ul>${a.needs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="wide"><h4>和城市條件的對應</h4><ul class="links">${a.cityLinks.map(l=>`<li><span class="k">${esc(l.kind)}</span><span>${esc(l.text)} ${st(l.status)}${srcs(l.src)}</span></li>`).join('')}</ul></div>
    <div class="wide"><h4>證據與限制</h4><p>${esc(a.limits)}</p></div>
  </div>`:''}
  <div class="jump"><button class="pill" data-jump="people-cand">政績與政見</button><button class="pill" data-jump="media">媒體布局</button><button class="pill" data-jump="polls">民調</button><button class="pill" data-jump="demo">人口數據</button></div>
  <p class="edit-note">「字義、情緒、生活情境」是編輯對文案的解讀，不代表候選人或陣營的說法，也不推論任何職業或年齡層的政治立場。</p>
  </article>`;
}
function matrix(){
  if(!R.needs||!majors.length) return '';
  return `<div class="sec"><div class="sec-h"><div><h3 class="h-m">城市需求 × 口號 × 政見</h3><p>每一列是一項城市需求，格子裡是候選人公開提出、對應這項需求的政見。空白只代表本站還沒查到，不等於候選人沒有立場。</p></div></div>
  <div class="scroll-x"><table class="mtx"><thead><tr><th scope="col">城市需求</th>${majors.map(c=>`<th scope="col" style="${cvars(c)}">${esc(c.name)}<div class="note" style="font-family:var(--sans);font-weight:700">「${esc(sloganText(c))}」</div></th>`).join('')}</tr></thead>
  <tbody>${R.needs.map(n=>`<tr><th scope="row">${esc(n.label)}</th>${majors.map(c=>{const v=(R.matrix[c.id]||{})[n.id];return v?`<td class="on" style="${cvars(c)}">${esc(v)}</td>`:`<td class="off">尚未查到對應政見</td>`}).join('')}</tr>`).join('')}</tbody></table></div>
  <p class="note">政見的核實狀態，見「候選人」頁籤。</p></div>`;
}

RENDER['people-cand']=el=>{
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">候選人：身分、政績、政見、爭議</h2><p>政績是已經完成的事；政見是還沒實施的承諾，標示目前階段。爭議只收錄有出處的內容，並列出回應（沒有取得的會寫明）。</p></div></div>
  <div class="cgrid">${cands.map(c=>`<article class="cbox" style="${cvars(c)}"><h3>${esc(c.name)} ${party(c.party)}${c.incumbent?'<span class="note">現任</span>':''}</h3>
    <ul>${c.identity.map(x=>`<li>${item(x)}</li>`).join('')}</ul>
    ${c.major||c.record.length||c.pledges.length?`
    <h4>政績（已完成）<em>${c.record.length} 項</em></h4>${c.record.length?`<ul>${c.record.map(x=>`<li class="done">${item(x)}</li>`).join('')}</ul>`:`<p class="empty">${c.incumbent?'尚未整理到有出處的政績條目':'非現任；政績欄位不適用'}</p>`}
    <h4>政見（尚未實施）<em>${c.pledges.length} 項</em></h4>${c.pledges.length?`<ul>${c.pledges.map(x=>`<li class="plan"><span class="stage">${esc(x.stage||'政見')}</span>${item(x)}</li>`).join('')}</ul>`:'<p class="empty">尚未查到具體政見報導</p>'}
    <h4>爭議與回應<em>${c.controversies.length} 項</em></h4>${c.controversies.length?`<ul>${c.controversies.map(x=>`<li class="dis">${item(x)}<span class="resp">${esc(x.response||'')}</span></li>`).join('')}</ul>`:'<p class="empty">本站尚未收錄有出處的爭議</p>'}`:`<p class="empty">目前沒有看到政見或競選活動的系統性報導。</p>`}
  </article>`).join('')}</div>`;
};

RENDER.eras=el=>{
  const eras=[...R.eras].sort((a,b)=>a.year-b.year),cats=[...new Set(eras.map(e=>e.cat))];
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">城市年代軸 1970–2026</h2><p>建設、交通、產業、商業、科技、觀光、服務一層層堆疊出今天的城市需求。拖動年份，看到那一年為止已經發生的事。</p></div></div>
  <div class="era-ctl"><output id="eraY">2026</output><input type="range" id="eraR" min="1970" max="2026" step="1" value="2026" aria-label="年份"><div class="cats" id="cats">${cats.map(c=>`<button aria-pressed="true" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
  <div class="era-axis"><svg id="eraAxis"></svg></div>
  <div class="era-list" id="eraList">${eras.map((e,i)=>`<article data-i="${i}"><time>${e.year}</time><span class="cat">${esc(e.cat)}</span><h4>${esc(e.title)}</h4>${e.detail?`<p>${esc(e.detail)}</p>`:''}<p style="margin-top:6px">${st(e.status)}${srcs(e.src)}</p></article>`).join('')}</div>
  <p class="note">年代條目多數為編輯依公開史料整理（標「未核實」），尚待逐條補上原始出處；有官方或報導來源的已標「已核實」。</p>
  <div class="sec"><h3 class="h-m">由年代堆疊出的城市需求</h3><div class="chips" style="margin-top:10px">${R.needs.map(n=>`<span style="background:var(--terra-soft)">${esc(n.label)}</span>`).join('')}</div></div>
  ${R.zones?`<div class="sec"><h3 class="h-m">產業空間分工</h3><p class="note">晶圓製造和封裝測試是不同環節，請勿混為一談。</p><div class="zones">${R.zones.map(z=>`<div><b>${esc(z.name)}</b><span class="role">${esc(z.role)}</span><p class="note" style="margin:0">${esc(z.detail)} ${st(z.status)}${srcs(z.src)}</p></div>`).join('')}</div></div>`:''}`;
  const svg=d3.select('#eraAxis'),W=el.querySelector('.era-axis').clientWidth||900,H=110;svg.attr('viewBox',`0 0 ${W} ${H}`);
  const x=d3.scaleLinear([1970,2026],[16,W-16]);
  svg.append('line').attr('x1',16).attr('x2',W-16).attr('y1',60).attr('y2',60).attr('stroke','#23211d');
  svg.selectAll('text.tick').data(d3.range(1970,2030,10).concat([2026]).filter((v,i,a)=>a.indexOf(v)===i&&v<=2026)).join('text').attr('x',x).attr('y',92).attr('text-anchor','middle').attr('font-size',12).attr('fill','#7c766c').attr('font-family','var(--serif)').text(d=>d);
  const dots=svg.selectAll('g.e').data(eras).join('g').attr('transform',(d,i)=>`translate(${x(d.year)},${60-(i%3)*16-10})`);
  dots.append('line').attr('y1',0).attr('y2',d=>0).attr('stroke','#23211d33');
  dots.append('circle').attr('r',7).attr('fill','#c2562e').attr('stroke','#fff').attr('stroke-width',2).style('cursor','pointer').attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.year} ${d.title}`)
    .on('click keydown',function(ev,d){if(ev.type==='keydown'&&ev.key!=='Enter')return;EC.openPop(this,`<h4>${d.year}｜${esc(d.title)}</h4><div class="meta">${esc(d.cat)}</div><p>${esc(d.detail||'')}</p>`)});
  const upd=()=>{const y=+el.querySelector('#eraR').value;el.querySelector('#eraY').textContent=y;const on=new Set([...el.querySelectorAll('#cats [aria-pressed=true]')].map(b=>b.dataset.cat));
    el.querySelectorAll('#eraList article').forEach(a=>{const e=eras[a.dataset.i];a.classList.toggle('dim',e.year>y||!on.has(e.cat))});dots.style('opacity',d=>d.year<=y&&on.has(d.cat)?1:.15)};
  el.querySelector('#eraR').oninput=upd;el.querySelector('#cats').onclick=e=>{const b=e.target.closest('button');if(!b)return;b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true');upd()};
};

RENDER.demo=async el=>{
  const ds=R.districts||[],total=ds.reduce((s,d)=>s+d.pop,0);
  const age=R.age||{status:'missing'};
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">人口、行政區、年齡、職業</h2><p>只用官方統計，並標示月份。缺的資料留白並說明原因，不用全國比例代替縣市，也不從產業結構推算職業比例。</p></div></div>
  <div class="kpis"><div><span class="num">${fmt(R.population.value)}</span> 人 ${st(R.population.status)}${srcs(R.population.src)}<div class="note">${R.population.date} 戶籍人口｜${esc(R.population.note||'')}</div></div></div>
  ${R.parent?`<div class="gap" style="margin:16px 0"><b>屏東市是屏東縣的縣轄市</b>行政區人口來自屏東縣 33 鄉鎮市的官方表，屏東市本身沒有更細的區級分層；人口包含在屏東縣內，不可以和屏東縣重複加總。</div>`:''}
  ${ds.length&&!R.parent?`<div class="pgrid sec" style="margin-top:20px"><div class="choro"><svg id="choro" role="img" aria-label="${esc(R.name)}各行政區人口分布圖"></svg><div class="legend"><span>少</span><i style="background:linear-gradient(90deg,#f3e6d9,#c2562e)"></i><span>多（人口數，線性色階）</span></div></div>
   <div><h3 class="h-m">各區人口 <span class="note" style="font-family:var(--sans)">${ds.length} 區｜合計 ${fmt(total)}｜戶政司 ODRP048 民國114年（2025 年底）</span> ${st('verified')}${srcs(['ris-048'])}</h3><div class="bars" id="bars">${[...ds].sort((a,b)=>b.pop-a.pop).map(d=>`<button data-d="${esc(d.name)}"><span>${esc(d.name)}</span><span><i class="b" style="display:block;width:${(d.pop/Math.max(...ds.map(x=>x.pop))*100).toFixed(1)}%"></i></span><span class="v">${fmt(d.pop)}</span></button>`).join('')}</div><p class="note">長條長度和人口數成正比，從 0 起算。點選行政區可以看數值、定義與來源。</p></div></div>`:''}
  <div class="sec"><h3 class="h-m">年齡結構</h3>${age.shares?`<div class="agebar">${[['0-14','#8ba387'],['15-64','#6b7d8e'],['65+','#c2562e']].map(([k,c])=>age.shares[k]!=null?`<div style="flex:${age.shares[k]};background:${c}">${k}　${age.shares[k]}%</div>`:'').join('')}<div style="flex:${(100-(age.shares['15-64']||0)-(age.shares['65+']||0)).toFixed(2)};background:repeating-linear-gradient(-11deg,#e9e2d6 0 6px,#f3eee5 6px 12px);color:#7c766c">0–14 未公布</div></div><p class="note">${age.date}｜${esc(age.note)} ${st(age.status)}${srcs(age.src)}</p>`:`<div class="gap"><b>年齡結構缺漏</b>${esc(age.note||'尚未取得官方年齡結構')}。待匯入：內政部戶政司「各縣市人口按性別及五歲年齡組」，資料到手後會畫成人口金字塔。</div>`}</div>
  <div class="sec"><h3 class="h-m">職業結構（職業別 ≠ 產業別）</h3><div class="gap"><b>各職業比例缺漏 ${st('missing')}${srcs(R.occupation.src)}</b>${esc(R.occupation.note)}。補上之後會呈現：主管及監督人員、專業人員、技術員及助理專業人員、事務支援人員、服務及銷售工作人員、農林漁牧業生產人員、技藝／機械設備操作及組裝／基層技術工及勞力工的百分比。</div></div>
  ${(R.facts||R.migration)?`<div class="sec"><h3 class="h-m">戶政月報指標</h3><ul class="facts-list">${[...(R.migration||[]),...(R.facts||[])].map(f=>`<li>${item(f)}</li>`).join('')}</ul></div>`:''}`;
  if(!ds.length||R.parent) return;
  const g=await getTowns(),svg=d3.select('#choro'),W=el.querySelector('.choro').clientWidth-24||600;const b0=d3.geoPath(d3.geoMercator().fitWidth(W-20,g)).bounds(g),H=Math.max(260,Math.min(560,b0[1][1]-b0[0][1]+20));
  svg.attr('viewBox',`0 0 ${W} ${H}`);const pj=d3.geoMercator().fitExtent([[10,10],[W-10,H-10]],g),path=d3.geoPath(pj);
  const pop=Object.fromEntries(ds.map(d=>[d.name,d.pop])),mx=d3.max(ds,d=>d.pop),col=d3.scaleLinear([0,mx],['#f3e6d9','#c2562e']);
  const show=(node,name)=>{const v=pop[name];const area=d3.geoArea(g.features.find(f=>f.properties.name===name));EC.openPop(node,`<h4>${esc(R.name)}${esc(name)}</h4><p style="margin:.3em 0"><b class="num" style="font-size:22px">${fmt(v)}</b> 人（占全市 ${(v/total*100).toFixed(1)}%）</p><div class="meta">定義：戶籍登記人口，民國114年（2025）年底。<br>來源：內政部戶政司 ODRP048。邊界：國土測繪中心鄉鎮市區界。</div>`);
    svg.selectAll('path').classed('hl',d=>d.properties.name===name);el.querySelectorAll('#bars button').forEach(b=>b.classList.toggle('hl',b.dataset.d===name))};
  svg.selectAll('path').data(g.features).join('path').attr('d',path).attr('fill',d=>pop[d.properties.name]!=null?col(pop[d.properties.name]):'#eee').attr('tabindex',0).attr('aria-label',d=>`${d.properties.name} ${fmt(pop[d.properties.name])}人`)
   .on('click',function(e,d){e.stopPropagation();show(this,d.properties.name)}).on('keydown',function(e,d){if(e.key==='Enter')show(this,d.properties.name)});
  el.querySelector('#bars').onclick=e=>{const b=e.target.closest('[data-d]');if(b){e.stopPropagation();show(b,b.dataset.d)}};
};

RENDER.media=el=>{
  const withM=majors.filter(c=>c.metrics);
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">媒體布局</h2><p>16 種渠道 × 候選人：實心點是有出處的觀察，空心點是使用者整理但還沒核對原文。空格代表本站還沒查到，不等於沒有使用這個渠道。</p></div></div>
  <div class="scroll-x"><table class="chm"><thead><tr><th scope="col">渠道</th>${majors.map(c=>`<th scope="col" style="${cvars(c)}">${esc(c.name)}</th>`).join('')}</tr></thead><tbody>
  ${db.channels.map(ch=>`<tr><th scope="row">${esc(ch.label)}</th>${majors.map(c=>{const ts=c.tactics.filter(t=>t.ch===ch.id);return ts.length?`<td style="${cvars(c)}">${ts.map(t=>`<button class="dot ${t.status}" data-pop="${esc(`<h4>${esc(c.name)}｜${esc(ch.label)}</h4><p>${esc(t.text)}</p><div class='meta'>${t.status==='verified'?'已核實':'未核實'}｜來源：${t.src.map(s=>esc(db.sources[s].publisher+' '+(db.sources[s].date||''))).join('、')}</div>${t.src.map(s=>db.sources[s].url?`<p style='margin:.4em 0 0'><a href='${esc(db.sources[s].url)}' target='_blank' rel='noopener'>開啟原始來源</a></p>`:'').join('')}`)}"><i></i><span>${esc(t.text.length>26?t.text.slice(0,26)+'…':t.text)}</span></button>`).join('<br>')}</td>`:`<td class="no">—</td>`}).join('')}</tr>`).join('')}
  </tbody></table></div>
  <div class="sec"><div class="sec-h"><div><h3 class="h-m">社群聲量與互動（第三方監測）</h3><p>聲量是跨 Threads、Facebook、媒體、論壇的提及篇數，不等於支持度；情緒是 AI 分類，可能誤判反諷。這裡沒有放粉絲數和互動率，因為還沒取得可以核實的官方帳號數據。</p></div></div>
  ${withM.length?`<div class="mgrid">${metricCards(withM)}</div>`:`<div class="gap"><b>社群數據缺漏 ${st('missing')}</b>本選區還沒取得可以引用的第三方監測週報。官方帳號粉絲數、發文數、平均互動、互動率、留言情緒、觸及與觀看，都要先核對官方帳號、遵守平台規範後才能補上；本站不使用搜尋頁面推估。</div>`}</div>
  <div class="sec gap"><b>尚未入站分析的指標</b>粉絲數、互動率（互動 ÷ 粉絲）、觸及、觀看、廣告投放金額（可以從 Meta 廣告檔案庫查證）。每一項補上時，都會附上抓取日期、帳號 ID 與定義。</div>`;
};
function metricCards(list){
  const per=(k,fn,label,unit='')=>{const vals=list.map(c=>[c,fn(c.metrics)]).filter(x=>x[1]!=null);if(!vals.length)return '';const mx=Math.max(...vals.map(x=>x[1]));return `<div class="mcard"><h4>${label}</h4>${vals.map(([c,v])=>`<div class="hbar" style="${cvars(c)}"><span>${esc(c.name)}</span><span class="t"><i style="width:${(v/mx*100).toFixed(1)}%"></i></span><span class="v">${fmt(v)}${unit}</span></div>`).join('')}<p class="note">${esc(list[0].metrics.period)}｜長條從 0 起算 ${st('verified')}${srcs(list[0].metrics.src)}</p></div>`};
  return per('m',m=>m.mentions,'聲量（提及篇數）')+per('p',m=>m.posts?m.posts.facebook+m.posts.threads:m.postsTotal,'本人帳號發文數','則')+per('fb',m=>m.avgComments?.facebook,'Facebook 平均每篇留言')+per('th',m=>m.avgComments?.threads,'Threads 平均每篇留言')+
  `<div class="mcard"><h4>情緒分布（正面／中立／負面）</h4>${list.map(c=>`<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><b>${esc(c.name)}</b><span class="note">${c.metrics.sentiment.join('／')}%</span></div><div class="senti">${c.metrics.sentiment.map(v=>`<i style="width:${v}%"></i>`).join('')}</div></div>`).join('')}<p class="note">AI 情緒分類；各平台用戶組成不同，不代表民意分布 ${srcs(list[0].metrics.src)}</p></div>`+
  (list.some(c=>c.metrics.channelShare)?`<div class="mcard"><h4>聲量來源渠道占比</h4>${list.map(c=>`<div style="margin:8px 0"><b style="font-size:13px">${esc(c.name)}</b>${Object.entries(c.metrics.channelShare).map(([k,v])=>`<div class="hbar" style="${cvars(c)}"><span>${{threads:'Threads',facebook:'Facebook',media:'媒體',forums:'論壇'}[k]}</span><span class="t"><i style="width:${v}%"></i></span><span class="v">${v}%</span></div>`).join('')}</div>`).join('')}</div>`:'');
}

RENDER.polls=el=>{
  const groups=[['phone','電話調查（機率抽樣）','可以計算抽樣誤差；不同機構的題目、加權方式不同，不能直接連成趨勢。'],['online-panel','網路問卷（非機率樣本）','樣本來自網路固定樣本或自選參與，宣稱的誤差不能比照電話民調，和電話民調分開看。']];
  const Q=db.questionTypes;
  const card=p=>{const tot=Object.entries(p.results);return `<article class="pcard ${p.mode!=='phone'?'online':''}"><h4>${esc(p.pollster)}</h4><span class="qtype ${p.question!=='vote'?'alt':''}">${esc(Q[p.question])}</span> ${st(p.status)}${srcs(p.src)}
    ${tot.map(([id,v])=>{const c=db.cand[id];const m=p.margin;return `<div class="pbar" style="--pc:${c.party.color}"><span>${esc(c.name)}</span><span class="t"><i style="width:${v}%"></i>${m&&p.question==='vote'?`<s style="left:${Math.max(0,v-m)}%;width:${2*m}%" title="±${m} 誤差範圍"></s>`:''}</span><span class="v">${v}%</span></div>`}).join('')}
    ${p.undecided!=null?`<div class="pbar" style="--pc:#bdb5a8"><span>未決定</span><span class="t"><i style="width:${p.undecided}%"></i></span><span class="v">${p.undecided}%</span></div>`:''}
    <p class="pmeta">調查 ${p.start.slice(5).replace('-','/')}–${p.end.slice(5).replace('-','/')}｜${esc(p.method)}｜有效樣本 ${fmt(p.sample)}｜誤差 ${p.margin?'±'+p.margin:'不適用／未提供'}<br>委託／出資：${esc(p.commissioner)}${p.notes?'<br>'+esc(p.notes):''}</p></article>`};
  const gapNote=db.pollGaps[R.id];
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">民調與事件</h2><p>和總表、候選人卡讀同一個資料庫。每份民調都列出機構、委託方、日期、方法、樣本、誤差與題型；支持度、看好度、好感度、辯論表現、施政滿意度分開標示。長條從 0 起算，灰框是 ±誤差範圍。</p></div></div>
  ${polls.length?`<div class="pgroups">${groups.map(([m,t,d])=>{const ps=polls.filter(p=>p.mode===m).sort((a,b)=>b.end.localeCompare(a.end));return ps.length?`<section class="pgroup"><h3>${t}</h3><p class="note">${d}</p><div class="pcards">${ps.map(card).join('')}</div></section>`:''}).join('')}</div>`:`<div class="gap"><b>民調缺漏 ${st('missing')}</b>${esc(gapNote||'未找到公開的正式民調')}。</div>`}
  <div class="sec"><div class="sec-h"><div><h3 class="h-m">事件 × 民調時間軸</h3><p>上排是候選人公開事件，下排是民調實施期間。兩者時間相近，不代表事件造成了民調變化。</p></div></div><div class="evt"><svg id="evt"></svg></div></div>
  ${(()=>{const o=db.optIn.results.find(x=>x.region===R.id);return o?`<details class="optin"><summary>附錄：自願網路投票（不具代表性）</summary><p class="note">${esc(db.optIn.warning)}</p><p>${esc(db.optIn.source)}｜${db.optIn.dates}｜參與 ${fmt(o.n)} 票 ${st(db.optIn.status)}${srcs(db.optIn.src)}</p>${Object.entries(o.r).map(([id,v])=>`<div class="pbar" style="--pc:#a39d93"><span>${esc(db.cand[id].name)}</span><span class="t"><i style="width:${v}%"></i></span><span class="v">${v}%</span></div>`).join('')}</details>`:''})()}`;
  // timeline
  const ev=db.events.filter(e=>e.region===R.id),W=Math.max(640,el.querySelector('.evt').clientWidth-16),H=180,svg=d3.select('#evt').attr('viewBox',`0 0 ${W} ${H}`);
  const all=[...ev.map(e=>e.date.length===7?e.date+'-15':e.date),...polls.flatMap(p=>[p.start,p.end])].map(d=>new Date(d));
  if(!all.length){svg.append('text').attr('x',20).attr('y',40).attr('class','lane').text('沒有可以標在時間軸上的事件或民調');return}
  const x=d3.scaleTime([d3.min(all.concat([new Date('2026-05-01')])),new Date('2026-11-28')],[80,W-20]);
  svg.append('g').attr('transform',`translate(0,${H-24})`).call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat('%-m月'))).call(g=>g.selectAll('text').attr('font-size',12)).call(g=>g.select('.domain').attr('stroke','#23211d'));
  svg.append('text').attr('class','lane').attr('x',0).attr('y',50).text('事件');svg.append('text').attr('class','lane').attr('x',0).attr('y',112).text('民調');
  svg.append('line').attr('x1',x(new Date('2026-11-28'))).attr('x2',x(new Date('2026-11-28'))).attr('y1',20).attr('y2',H-24).attr('stroke','#c2562e').attr('stroke-dasharray','3 3');
  svg.append('text').attr('x',x(new Date('2026-11-28'))-4).attr('y',30).attr('text-anchor','end').attr('font-size',11).attr('fill','#c2562e').text('投票日');
  svg.selectAll('circle.e').data(ev).join('circle').attr('cx',d=>x(new Date(d.date.length===7?d.date+'-15':d.date))).attr('cy',(d,i)=>34+(i%3)*14).attr('r',7).attr('fill',d=>c1(db.cand[d.cand])).attr('stroke','#fff').attr('stroke-width',2).attr('tabindex',0)
    .on('click',function(e,d){e.stopPropagation();EC.openPop(this,`<h4>${esc(d.date)}｜${esc(db.cand[d.cand].name)}</h4><p>${esc(d.text)}</p><div class="meta">${d.status==='verified'?'已核實':'未核實'}</div>`)});
  svg.selectAll('rect.pm').data(polls).join('rect').attr('class','pm').attr('x',d=>x(new Date(d.start))).attr('width',d=>Math.max(6,x(new Date(d.end))-x(new Date(d.start)))).attr('y',(d,i)=>98+(i%3)*12).attr('height',9).attr('rx',3).attr('fill',d=>d.mode==='phone'?'#6b7d8e':'#a497c6')
    .on('click',function(e,d){e.stopPropagation();EC.openPop(this,`<h4>${esc(d.pollster)}</h4><div class="meta">${esc(Q[d.question])}｜${esc(db.modes[d.mode])}｜${d.start}–${d.end}</div><p>${Object.entries(d.results).map(([id,v])=>esc(db.cand[id].name)+' '+v+'%').join('、')}</p>`)});
  svg.append('g').attr('font-size',11).attr('fill','#7c766c').call(g=>{g.append('rect').attr('x',W-230).attr('y',2).attr('width',10).attr('height',8).attr('fill','#6b7d8e');g.append('text').attr('x',W-216).attr('y',9).text('電話調查');g.append('rect').attr('x',W-150).attr('y',2).attr('width',10).attr('height',8).attr('fill','#a497c6');g.append('text').attr('x',W-136).attr('y',9).text('網路問卷')});
};

RENDER.compare=el=>{
  const rows=[
    ['主口號',c=>`<span class="big">${esc(sloganText(c))}</span><br>${st(c.slogan.status)}${srcs(c.slogan.src)}`],
    ['次口號',c=>c.subSlogans.slice(0,3).map(s=>esc(s.text)).join('<br>')||'—'],
    ['情緒',c=>c.analysis?c.analysis.emotion.join('、'):'—'],
    ['品牌承諾',c=>c.analysis?esc(c.analysis.promise):'—'],
    ['主色',c=>c.palette.map(p=>`<i style="display:inline-block;width:22px;height:22px;border-radius:6px;background:${p};border:1px solid #0002;margin-right:4px"></i>`).join('')],
    ['已完成政績',c=>c.record.length?c.record.length+' 項':(c.incumbent?'尚未整理':'不適用')],
    ['政見（已收錄）',c=>c.pledges.length+' 項，已核實 '+c.pledges.filter(p=>p.status==='verified').length],
    ['媒體手法（已收錄）',c=>c.tactics.length+' 種'],
    ['社群聲量 10/5–11',c=>c.metrics?fmt(c.metrics.mentions)+' 篇':'缺漏'],
    ['最新電話民調（投票支持）',c=>{const p=latestPhone(c);return p?`<b class="num" style="font-size:20px">${p.results[c.id]}%</b><br><span class="note">${esc(p.pollster)} ${p.end}</span>`:'無'}],
  ];
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">候選人橫向比較</h2><p>同一套欄位並排，數字只在同一份調查或同一份監測報告裡比較。</p></div></div>
  <div class="scroll-x"><table class="cmpt"><thead><tr><th></th>${majors.map(c=>`<th style="${cvars(c)};border-top:6px solid var(--c1)">${esc(c.name)}<br>${party(c.party)}</th>`).join('')}</tr></thead><tbody>${rows.map(([l,f])=>`<tr><th scope="row">${l}</th>${majors.map(c=>`<td>${f(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
};

select(location.hash.slice(1)||'marketing',false);

/* arrival: the second half of the cut */
if(qs.get('cut')==='1'&&!EC.reduced()){
  history.replaceState(null,'',`city.html?r=${R.id}${location.hash}`);
  const W=innerWidth,H=innerHeight,d=Math.tan(11*Math.PI/180)*W/2;
  const a=document.createElement('div');a.className='arrive';
  a.innerHTML=`<div class="h" style="clip-path:polygon(0 0,${W}px 0,${W}px ${H/2-d}px,0 ${H/2+d}px)"><b>${esc(R.name)}</b></div><div class="h" style="clip-path:polygon(0 ${H/2+d}px,${W}px ${H/2-d}px,${W}px ${H}px,0 ${H}px)"><b>${esc(R.name)}</b></div>`;
  document.body.appendChild(a);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const [t,b]=a.children,nx=Math.sin(11*Math.PI/180),ny=Math.cos(11*Math.PI/180),m=Math.max(W,H)*.8;t.style.transform=`translate(${-nx*m}px,${-ny*m}px)`;b.style.transform=`translate(${nx*m}px,${ny*m}px)`;setTimeout(()=>a.remove(),800)}));
}
})();
