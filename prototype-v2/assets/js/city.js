/* city analysis page */
(async function(){
const {esc,st,srcs,party,item,fmt}=EC;
const app=document.getElementById('app');
let db;try{db=await EC.loadDB()}catch(e){app.innerHTML=`<p class="panel">${esc(e.message)}</p>`;return}
const qs=new URLSearchParams(location.search);
const R=db.region[qs.get('r')]||db.region[EC.storedRegion()]||db.region.taipei;
let cutFlag=qs.get('cut')==='1';try{if(sessionStorage.getItem('ec-cut')==='1'){cutFlag=true;sessionStorage.removeItem('ec-cut')}}catch(e){}
const cands=R.candidates.map(id=>db.cand[id]);
const majors=cands.filter(c=>c.major),minors=cands.filter(c=>!c.major);
const polls=db.polls.filter(p=>p.region===R.id);
document.title=`${R.name}${R.office}選戰行銷分析｜2026 選戰切一刀`;
document.getElementById('back').href='./#'+R.id;
const c1=c=>c.palette[0]==='#ffffff'?(c.palette[1]||'#888'):(c.palette[0]||'#888');
const c2=c=>c.palette[1]&&c.palette[1]!=='#ffffff'?c.palette[1]+'33':'#eee';
const cvars=c=>`--c1:${c1(c)};--c2:${c2(c)}`;

const TABS=[['marketing','行銷橫切面'],['mix','整合比對'],['chain','數據→需求→口號'],['people-cand','候選人'],['eras','城市年代'],['demo','人口結構'],['media','媒體布局'],['polls','民調與事件'],['compare','橫向比較']];
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
document.getElementById('rsel').onchange=e=>EC.goCity(e.target.value);

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
  const M=majors.map(c=>{const ch=new Set(c.tactics.map(t=>t.ch));return {c,
    slogNeeds:R.needs.filter(n=>hitM(c,n).length).length,polNeeds:R.needs.filter(n=>(R.matrix[c.id]||{})[n.id]).length,
    pV:c.pledges.filter(p=>p.status==='verified').length,pU:c.pledges.filter(p=>p.status!=='verified').length,
    rec:c.record.length,ch:ch.size,evt:c.timeline.length,vis:c.visuals.length,
    mentions:c.metrics?c.metrics.mentions:null,neg:c.metrics?c.metrics.sentiment[2]:null,
    poll:latestPhoneM(c),online:latestOnlineM(c)}});
  el.innerHTML=`<div class="dash-h"><div><h2 class="h-l">行銷橫切面</h2><p class="note">${majors.length} 位主要參選人並排比對；圖表都來自本站資料庫的比對結果。點候選人看完整口號解析。</p></div>
    ${minors.length?`<button class="pill" data-minors>另 ${minors.length} 位參選人</button>`:''}</div>
  <div class="dash">
    <section class="dc heads" aria-label="候選人主口號">${M.map(m=>headCard(m)).join('')}</section>
    <section class="dc insight" aria-label="比對結論"><h3>比對結論</h3>${insight(M)}<p class="note">由下方圖表的數據自動彙整，非陣營說法；不推論任何族群的投票傾向。</p></section>
    <section class="dc heat" aria-label="口號與需求對應熱圖"><div class="dc-h"><h3>口號 × 城市需求</h3><span class="legend3"><i class="s"></i>口號字面（候選人色）<i class="p"></i>政見<i class="d"></i>數據已核實</span></div>${heat()}</section>
    <section class="dc power" aria-label="行銷力道對照"><div class="dc-h"><h3>行銷布局對照</h3><span class="note">每列各自以最大值為滿格，從 0 起算</span></div>${power(M)}</section>
    <section class="dc pulse" aria-label="民調與聲量"><div class="dc-h"><h3>民調與聲量快照</h3><button class="lnk" data-jump="polls">全部民調</button></div>${pulse(M)}</section>
  </div>
  <aside class="drawer" id="drawer" aria-hidden="true"><div class="dw-in"><button class="pill dw-x" data-close>關閉</button><div id="dwBody"></div></div></aside><div class="dw-scrim" data-close></div>`;
  el.addEventListener('click',e=>{
    const o=e.target.closest('[data-open]');if(o){openDrawer(el,db.cand[o.dataset.open]);return}
    if(e.target.closest('[data-minors]')){openDrawer(el,null);return}
    if(e.target.closest('[data-close]'))closeDrawer(el);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer(el)});
  requestAnimationFrame(()=>el.querySelector('.dash').classList.add('go'));
};
const hitM=(c,n)=>(n.keywords||[]).filter(k=>[c.slogan.status!=='missing'?c.slogan.text:'',...c.subSlogans.map(x=>x.text)].join('｜').includes(k));
const latestPhoneM=c=>polls.filter(p=>p.mode==='phone'&&p.question==='vote'&&p.results[c.id]!=null).sort((a,b)=>b.end.localeCompare(a.end))[0];
const latestOnlineM=c=>polls.filter(p=>p.mode!=='phone'&&p.question==='vote'&&p.results[c.id]!=null).sort((a,b)=>b.end.localeCompare(a.end))[0];
function headCard(m){const c=m.c,none=c.slogan.status==='missing';
  return `<button class="hc" style="${cvars(c)}" data-open="${c.id}" aria-label="看${esc(c.name)}完整解析">
   ${c.photo?`<img src="${c.photo.file}" alt="" loading="lazy">`:`<span class="mono">${esc(c.name[0])}</span>`}
   <span class="hc-t"><span class="hc-n">${esc(c.name)} ${party(c.party)}${c.incumbent?'<em>現任</em>':''}</span>
   <span class="hc-s ${none?'none':''}">${esc(none?'未見正式口號':c.slogan.text)}</span>
   <span class="hc-m">${st(c.slogan.status)}<span class="hc-go">完整解析</span></span></span></button>`}
function insight(M){
  const L=[];const by=k=>[...M].sort((a,b)=>b[k]-a[k]);
  const tot=R.needs.length;
  M.forEach(m=>{const hits=R.needs.filter(n=>hitM(m.c,n).length).map(n=>n.label);
    L.push(`<b>${esc(m.c.name)}</b>的口號字面回應 <b class="num">${m.slogNeeds}</b>/${tot} 項需求${hits.length?`（${hits.map(esc).join('、')}）`:''}；政見對應 ${m.polNeeds} 項。`)});
  const none=R.needs.filter(n=>M.every(m=>!hitM(m.c,n).length&&!(R.matrix[m.c.id]||{})[n.id])).map(n=>n.label);
  const onlyPol=R.needs.filter(n=>M.some(m=>(R.matrix[m.c.id]||{})[n.id])&&M.every(m=>!hitM(m.c,n).length)).map(n=>n.label);
  if(onlyPol.length)L.push(`口號都沒提、但政見有處理的需求：${onlyPol.map(esc).join('、')}。`);
  if(none.length)L.push(`<span class="warn">雙方口號與政見都尚未查到對應：${none.map(esc).join('、')}。</span>`);
  const chM=by('ch');if(M.length>1&&chM[0].ch!==chM[1].ch)L.push(`已收錄的媒體渠道：${esc(chM[0].c.name)} ${chM[0].ch} 種、${esc(chM[1].c.name)} ${chM[1].ch} 種。`);
  const mm=M.filter(m=>m.mentions!=null);if(mm.length>1){const s=[...mm].sort((a,b)=>b.mentions-a.mentions);L.push(`社群聲量（10/5–11）：${esc(s[0].c.name)} ${fmt(s[0].mentions)} 篇，是 ${esc(s[1].c.name)} 的 ${(s[0].mentions/s[1].mentions).toFixed(1)} 倍；聲量不等於支持。`)}
  const pp=M.filter(m=>m.poll);if(pp.length>1&&pp[0].poll===pp[1].poll){const p=pp[0].poll,s=[...pp].sort((a,b)=>p.results[b.c.id]-p.results[a.c.id]),gap=p.results[s[0].c.id]-p.results[s[1].c.id];const age=Math.round((Date.now()-new Date(p.end))/864e5);L.push(`最新電話民調（${esc(p.pollster)}，委託／出資：${esc(p.commissioner)}，${p.end}）：${esc(s[0].c.name)} 領先 ${gap.toFixed(1)} 個百分點${p.margin&&gap<=2*p.margin?'，在兩倍誤差範圍內':''}${age>60?`<span class="warn">；這份調查距今 ${age} 天，不能代表現況</span>`:''}。${M.some(m=>m.online)?'網路問卷結果另列，不能和電話民調直接比較。':''}`)}
  else if(!pp.length)L.push(`本選區沒有可以引用的電話民調。`);
  return `<ul>${L.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}
function heat(){
  const okEv=n=>(n.evidence||[]).some(x=>x.status==='verified');
  return `<div class="hm" style="--n:${majors.length}"><div class="hm-r hm-hd"><span></span>${majors.map(c=>`<span style="${cvars(c)}"><i></i>${esc(c.name)}</span>`).join('')}</div>
  ${R.needs.map((n,i)=>`<div class="hm-r" style="--i:${i}"><span class="hm-n" data-pop="${esc(`<h4>${esc(n.label)}</h4><p>${(n.evidence||[]).map(x=>esc(x.text)).join('<br>')}</p>`)}">${esc(n.label)}</span>${majors.map(c=>{const h=hitM(c,n),p=(R.matrix[c.id]||{})[n.id];
    return `<span class="hm-c" style="${cvars(c)}" data-pop="${esc(`<h4>${esc(c.name)}｜${esc(n.label)}</h4><p>口號：${h.length?esc(h.join('、')):'未提及'}<br>政見：${p?esc(p):'尚未查到'}<br>數據：${okEv(n)?'已核實':'待核實'}</p>`)}"><i class="s ${h.length?'on':''}"></i><i class="p ${p?'on':''}"></i><i class="d ${okEv(n)?'on':''}"></i><small>${p?esc(p.length>14?p.slice(0,14)+'…':p):''}</small></span>`}).join('')}</div>`).join('')}</div>`;
}
function power(M){
  const rows=[['口號回應需求','slogNeeds','項'],['政見對應需求','polNeeds','項'],['已核實政見','pV','項'],['未核實政見','pU','項'],['已完成政績','rec','項'],['媒體渠道','ch','種'],['品牌時間軸事件','evt','則'],['主視覺原圖','vis','張']];
  return `<div class="pw">${rows.map(([l,k,u],ri)=>{const mx=Math.max(1,...M.map(m=>m[k]));return `<div class="pw-r"><span class="pw-l">${l}</span><span class="pw-b">${M.map((m,ci)=>`<span class="pw-bar" style="${cvars(m.c)}"><i style="--w:${(m[k]/mx*100).toFixed(1)}%;--d:${ri*60+ci*30}ms"></i><b>${m[k]}${u}</b></span>`).join('')}</span></div>`}).join('')}</div>
  <div class="pw-key">${M.map(m=>`<span style="${cvars(m.c)}"><i></i>${esc(m.c.name)}</span>`).join('')}</div>`;
}
function pulse(M){
  const p=M.find(m=>m.poll)?.poll,o=M.find(m=>m.online)?.online;
  const bars=(poll,lab)=>poll?`<div class="pu"><div class="pu-h">${lab}｜${esc(poll.pollster)} ${poll.end.slice(5).replace('-','/')} ${st(poll.status)}${srcs(poll.src)}</div>${M.filter(m=>poll.results[m.c.id]!=null).map(m=>{const v=poll.results[m.c.id];return `<div class="pu-r" style="--pc:${m.c.party.color}"><span>${esc(m.c.name)}</span><span class="pu-t"><i style="--w:${v}%"></i>${poll.margin?`<s style="left:${Math.max(0,v-poll.margin)}%;width:${2*poll.margin}%"></s>`:''}</span><b>${v}%</b></div>`}).join('')}<div class="note">${esc(poll.method)}｜n=${fmt(poll.sample)}｜${poll.margin?'±'+poll.margin:'誤差不適用'}</div></div>`:'';
  const mm=M.filter(m=>m.mentions!=null);
  return (bars(p,'電話民調・投票支持')||`<div class="gap"><b>電話民調缺漏</b>${esc(db.pollGaps[R.id]||'本選區沒有電話民調')}</div>`)+bars(o,'網路問卷（非機率）')+
   (mm.length?`<div class="pu"><div class="pu-h">社群聲量 10/5–11（提及篇數）${srcs(mm[0].c.metrics.src)}</div>${mm.map(m=>`<div class="pu-r" style="--pc:${c1(m.c)}"><span>${esc(m.c.name)}</span><span class="pu-t"><i style="--w:${(m.mentions/Math.max(...mm.map(x=>x.mentions))*100).toFixed(1)}%"></i></span><b>${fmt(m.mentions)}</b></div>`).join('')}<div class="note">負面情緒占比：${mm.map(m=>esc(m.c.name)+' '+m.neg+'%').join('、')}（AI 分類）</div></div>`:'');
}
function openDrawer(el,c){
  const d=el.querySelector('#drawer');
  el.querySelector('#dwBody').innerHTML=c?spread(c):`<h3 class="h-m">其他參選人</h3><p class="note">已完成登記；目前沒有看到正式口號或系統性的競選文宣報導。</p><div class="minors">${minors.map(c=>`<div><b>${esc(c.name)}</b>${party(c.party)}<p class="note" style="margin:.4em 0 0">${c.identity.map(x=>esc(x.text)).join('；')}</p></div>`).join('')}</div>`;
  d.classList.add('open');d.setAttribute('aria-hidden','false');el.querySelector('.dw-scrim').classList.add('on');document.body.style.overflow='hidden';d.querySelector('.dw-in').scrollTop=0;d.querySelector('.dw-x').focus();
}
function closeDrawer(el){const d=el.querySelector('#drawer');if(!d||!d.classList.contains('open'))return;d.classList.remove('open');d.setAttribute('aria-hidden','true');el.querySelector('.dw-scrim').classList.remove('on');document.body.style.overflow=''}
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
  <div class="jump"><button class="pill terra" data-close data-jump="chain">用數據應證這句口號</button><button class="pill" data-jump="people-cand">政績與政見</button><button class="pill" data-jump="media">媒體布局</button><button class="pill" data-jump="polls">民調</button><button class="pill" data-jump="demo">人口數據</button></div>
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


/* ================= 整合比對：行政區 × 人口 × 建設 × 口號 × 政績政見 ================= */
const ALIAS={'北士科':['北投','士林'],'內湖':['內湖'],'南港':['南港'],'動物園':['文山'],'松山機場':['松山'],'松機':['松山'],'亞灣':['前鎮','苓雅'],'亞洲新灣區':['前鎮','苓雅'],'淡海':['淡水'],'林口':['林口'],'板橋':['板橋'],
 '龍潭':['龍潭'],'楊梅':['楊梅'],'觀音':['觀音'],'新屋':['新屋'],'中壢':['中壢'],'航空城':['大園','蘆竹'],'西屯':['西屯'],'山線':['豐原','后里','東勢','石岡','新社'],'海線':['大甲','大安','清水','梧棲','沙鹿','龍井'],
 '屯區':['太平','大里','霧峰','烏日'],'中火':['龍井'],'永康':['永康'],'南科':['新市','善化','安定'],'楠梓':['楠梓'],'路竹':['路竹'],'橋頭':['橋頭'],'旗津':['旗津'],'岡山':['岡山'],'小港':['小港'],'萬年溪':['屏東市'],'勝利星村':['屏東市'],'六塊厝':['屏東市']};
const short=n=>n.replace(/(區|鄉|鎮|市)$/,'');
function tagD(text){const set=new Set();(R.districts||[]).forEach(d=>{const k=short(d.name);if(k.length>=2&&text.includes(k))set.add(d.name)});
  Object.entries(ALIAS).forEach(([k,v])=>{if(text.includes(k))v.forEach(x=>{const d=(R.districts||[]).find(d=>short(d.name)===x||d.name===x);if(d)set.add(d.name)})});return [...set]}
RENDER.mix=async el=>{
  const ds=R.districts||[];
  if(!ds.length){el.innerHTML='<div class="gap"><b>沒有行政區資料</b></div>';return}
  const items=majors.flatMap(c=>[...c.record.map(x=>({c,kind:'政績',x})),...c.pledges.map(x=>({c,kind:'政見',x}))]).map(o=>({...o,d:tagD(o.x.text+(o.x.stage||''))}));
  const front=(R.frontier||[]).map(f=>({...f,d:f.districts&&f.districts.length?(f.districts.map(x=>(ds.find(d=>short(d.name)===x||d.name===x)||{}).name).filter(Boolean)):[]}));
  const total=ds.reduce((a,d)=>a+d.pop,0),rank=[...ds].sort((a,b)=>b.pop-a.pop);
  el.innerHTML=`<div class="dash-h"><div><h2 class="h-l">整合比對</h2><p class="note">點地圖或下方行政區：人口、建設現況、候選人政績與政見會一起連動。圖釘是發展前沿；政見與行政區的對應用地名比對（含北士科→北投、士林這類別名），屬編輯整理。</p></div>
   <div class="seg" role="group" aria-label="地圖顏色"><button aria-pressed="true" data-mc="pop">人口數</button><button aria-pressed="false" data-mc="hit">候選人提及次數</button></div></div>
  <div class="mix">
   <section class="dc mx-map"><svg id="mxMap" role="img" aria-label="${esc(R.name)}行政區地圖"></svg><div class="mx-leg" id="mxLeg"></div>
     <div class="mx-dl" id="mxDl">${rank.map(d=>`<button data-d="${esc(d.name)}">${esc(short(d.name))}</button>`).join('')}</div></section>
   <section class="dc mx-mid" id="mxMid"></section>
   <section class="dc mx-cands" id="mxC"></section>
  </div>`;
  const g=await getTowns();const geo=R.parent?(await (await fetch(`data/geo/towns-${R.county}.geojson`)).json()):g;
  const box=el.querySelector('.mx-map'),W=box.clientWidth-24||520;const b0=d3.geoPath(d3.geoMercator().fitWidth(W-16,geo)).bounds(geo),H=Math.max(300,Math.min(520,b0[1][1]-b0[0][1]+16));
  const svg=d3.select('#mxMap').attr('viewBox',`0 0 ${W} ${H}`),pj=d3.geoMercator().fitExtent([[8,8],[W-8,H-8]],geo),path=d3.geoPath(pj);
  const pop=Object.fromEntries(ds.map(d=>[d.name,d.pop]));
  const hits=Object.fromEntries(ds.map(d=>[d.name,items.filter(o=>o.d.includes(d.name)).length+front.filter(f=>f.d.includes(d.name)).length]));
  const paths=svg.append('g').selectAll('path').data(geo.features).join('path').attr('d',path).attr('tabindex',0).attr('class','mx-p')
    .attr('aria-label',d=>`${d.properties.name} ${fmt(pop[d.properties.name])}人`);
  const KC={'產業':'#c2562e','交通':'#6b7d8e','能源':'#c9a227','土地':'#8ba387','科技':'#a497c6','觀光':'#e2457f'};
  const pins=[];front.forEach(f=>f.d.forEach((dn,j)=>{const ft=geo.features.find(x=>x.properties.name===dn);if(ft){const [x,y]=path.centroid(ft);pins.push({f,x:x+(j%2?5:-5)*(pins.filter(p=>p.dn===dn).length),y,dn})}}));
  svg.append('g').selectAll('g').data(pins).join('g').attr('class','pin').attr('transform',d=>`translate(${d.x},${d.y})`).style('animation-delay',(d,i)=>i*90+'ms')
    .call(g=>{g.append('circle').attr('r',7).attr('fill',d=>KC[d.f.kind]||'#c2562e').attr('stroke','#fff').attr('stroke-width',2);g.append('title').text(d=>d.f.name)})
    .on('click',function(e,d){e.stopPropagation();sel(d.dn)});
  el.querySelector('#mxLeg').innerHTML=Object.entries(KC).filter(([k])=>front.some(f=>f.kind===k&&f.d.length)).map(([k,c])=>`<span><i style="background:${c}"></i>${k}</span>`).join('')+`<span class="note">圖釘＝發展前沿</span><span id="mxScale" class="note"></span>`;
  let mode='pop';
  const color=()=>{const v=mode==='pop'?pop:hits,vals=Object.values(v),mx=d3.max(vals)||1,mn=mode==='pop'?d3.min(vals):0,sc=d3.scaleLinear([mn,mx],mode==='pop'?['#f6ebdf','#b4471f']:['#f1f3f5','#2f4456']);
    paths.transition().duration(EC.reduced()?0:600).attr('fill',d=>v[d.properties.name]!=null?sc(v[d.properties.name]):'#eee');
    el.querySelector('#mxScale').textContent=mode==='pop'?`色深＝人口（${fmt(mn)}–${fmt(mx)}，線性色階）`:`色深＝政績政見與建設提及數（0–${mx}）`};
  color();
  el.querySelector('.dash-h .seg').onclick=e=>{const b=e.target.closest('[data-mc]');if(!b)return;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));mode=b.dataset.mc;color()};
  const cityMid=()=>{const L=R.labor;return `<div class="mx-lab"><h4>全${esc(R.short)}勞動力（2025）${st(L.status)}${srcs(L.src)}</h4><div class="stack sm">${[['emp','就業','#6b7d8e'],['unemp','失業','#c2562e'],['nlf','非勞動力','#d9d0c1']].map(([k,l,c])=>`<div style="flex:${L[k]};background:${c}"><span>${l} ${fmt(L[k])}千</span></div>`).join('')}</div>
    ${R.occupation&&R.occupation.values?`<div class="stack sm occ">${db.occGroups.filter(x=>R.occupation.values[x.id]).map((x,i)=>`<div style="flex:${R.occupation.values[x.id][0]};background:${['#2c3e50','#6b7d8e'][i]}"><span>${esc(x.label.slice(0,4))} ${R.occupation.values[x.id][0]}千</span></div>`).join('')}<div class="unk" style="flex:${R.occupation.total-db.occGroups.filter(x=>R.occupation.values[x.id]).reduce((a,x)=>a+R.occupation.values[x.id][0],0)}"><span>其餘職業待匯入</span></div></div>`:`<p class="note">職業人數：待匯入主計總處縣市別原表 ${st('missing')}</p>`}
    <p class="note">勞動力與職業只有縣市層級，沒有行政區別資料。</p></div>`};
  function sel(name){
    paths.classed('on',d=>d.properties.name===name).classed('off',d=>!!name&&d.properties.name!==name);el.querySelectorAll('#mxDl button').forEach(b=>b.classList.toggle('on',b.dataset.d===name));
    const mid=el.querySelector('#mxMid'),cc=el.querySelector('#mxC');
    if(!name){
      mid.innerHTML=`<h3>${esc(R.name)}全區</h3><div class="mx-k"><span class="num">${fmt(total)}</span> 人 ${st('verified')}${srcs(['ris-048'])}<div class="note">${ds.length} 個行政區｜2025 年底戶籍</div></div>
       <div class="mx-top"><h4>人口前五大區</h4>${rank.slice(0,5).map(d=>`<button class="mx-bar" data-d="${esc(d.name)}"><span>${esc(short(d.name))}</span><span class="t"><i style="width:${(d.pop/rank[0].pop*100).toFixed(1)}%"></i></span><b>${fmt(d.pop)}</b></button>`).join('')}</div>
       ${cityMid()}<div class="mx-front"><h4>全市發展前沿 ${front.length} 項</h4>${front.map(f=>`<div class="fr"><i style="background:${KC[f.kind]||'#c2562e'}"></i><b>${esc(f.name)}</b><span>${esc(f.stage)}${f.d.length?'｜'+f.d.map(short).join('、'):'｜全市'}</span></div>`).join('')}</div>`;
    }else{
      const p=pop[name],r=rank.findIndex(d=>d.name===name)+1,fr=front.filter(f=>f.d.includes(name));
      mid.innerHTML=`<h3>${esc(name)}<button class="lnk" data-clear>看全區</button></h3><div class="mx-k"><span class="num">${fmt(p)}</span> 人 ${st('verified')}${srcs(['ris-048'])}<div class="note">占全${esc(R.short)} ${(p/total*100).toFixed(1)}%｜${ds.length} 區中第 ${r} 大</div></div>
       <div class="mx-share"><i style="width:${(p/total*100).toFixed(2)}%"></i></div>
       <div class="mx-front"><h4>此區發展前沿 ${fr.length} 項</h4>${fr.length?fr.map(f=>`<div class="fr"><i style="background:${KC[f.kind]||'#c2562e'}"></i><b>${esc(f.name)}</b><span>${esc(f.stage)}｜${esc(f.detail)}</span> ${st(f.status)}${srcs(f.src)}</div>`).join(''):'<p class="note">本站尚未收錄這一區的重大建設或產業據點。</p>'}</div>${cityMid()}`;
    }
    cc.innerHTML=`<div class="mx-ch"><h3>${name?esc(short(name))+' 與候選人':'候選人口號、政績、政見'}</h3></div><div class="mx-cg" style="--n:${majors.length}">${majors.map(c=>{const mine=items.filter(o=>o.c===c),rel=name?mine.filter(o=>o.d.includes(name)):mine;
      const sl=sloganText(c),slHit=name&&sl.includes(short(name));
      return `<div class="mx-col" style="${cvars(c)}"><div class="mx-who">${c.photo?`<img src="${c.photo.file}" alt="">`:`<span class="mono">${esc(c.name[0])}</span>`}<div><b>${esc(c.name)}</b>${party(c.party)}</div></div>
        <p class="mx-sl ${slHit?'hit':''}">「${esc(sl)}」</p>
        <div class="mx-cnt"><b class="num">${rel.length}</b> 項${name?'提到這一區':'政績與政見'}<span class="note">（政績 ${rel.filter(o=>o.kind==='政績').length}・政見 ${rel.filter(o=>o.kind==='政見').length}）</span></div>
        <ul>${mine.map(o=>{const on=!name||o.d.includes(name);return `<li class="${on?'':'dim'} ${o.kind==='政績'?'rec':'pl'}"><span class="k">${o.kind}</span>${esc(o.x.text)} ${st(o.x.status)}${srcs(o.x.src)}${o.d.length?`<span class="dz">${o.d.map(x=>esc(short(x))).join('・')}</span>`:'<span class="dz all">全市</span>'}</li>`}).join('')||'<li class="dim">尚未收錄</li>'}</ul></div>`}).join('')}</div>
      ${name&&items.filter(o=>o.d.includes(name)).length===0&&fr0(name)?`<p class="warn note">有建設正在這一區進行，但兩位候選人的政績政見都還沒查到直接提及。</p>`:''}`;
  }
  const fr0=n=>front.some(f=>f.d.includes(n));
  paths.on('click',(e,d)=>sel(d.properties.name)).on('keydown',(e,d)=>{if(e.key==='Enter')sel(d.properties.name)});
  el.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(b&&el.contains(b)&&!b.closest('.bars')){sel(b.dataset.d)}if(e.target.closest('[data-clear]'))sel(null)});
  const top=front.flatMap(f=>f.d)[0];sel(R.parent?'屏東市':null);
};

/* ================= 數據 → 需求 → 口號（交叉應證） ================= */
const sloganBag=c=>[c.slogan.status!=='missing'?c.slogan.text:'',...c.subSlogans.map(x=>x.text)].join('｜');
const hit=(c,n)=>(n.keywords||[]).filter(k=>sloganBag(c).includes(k));
const pol=(c,n)=>(R.matrix[c.id]||{})[n.id];
const LBL={pop15:'15 歲以上人口',lf:'勞動力',emp:'就業者',unemp:'失業者',lfpr:'勞動力參與率',ur:'失業率'};
const SEVEN=['taipei','new-taipei','taoyuan','taichung','tainan','kaohsiung','pingtung'];
RENDER.chain=el=>{
  el.innerHTML=`<div class="sec-h"><div><h2 class="h-l">數據 → 需求 → 口號</h2><p>左邊是有出處的城市數據，中間是從數據推出的城市需求，右邊是候選人。實線代表口號字面就回應了這項需求，虛線代表口號沒提但政見有對應。點任何節點看依據。</p></div>
   <div class="seg" role="group" aria-label="連線類型"><button aria-pressed="true" data-ln="all">全部</button><button aria-pressed="false" data-ln="slogan">只看口號</button><button aria-pressed="false" data-ln="policy">只看政見</button></div></div>
  <div class="flow" id="flow"></div>
  <div class="sec"><div class="sec-h"><div><h3 class="h-m">口號應證表</h3><p>每格三個訊號：口號字面有提到、政見有對應、需求有已核實數據支撐。這是對照，不是評分；空白不代表候選人沒有立場。</p></div></div><div class="scroll-x">${verifyTable()}</div></div>
  <div class="sec"><div class="sec-h"><div><h3 class="h-m">跨縣市比對</h3><p>同一個指標，把 ${esc(R.short)} 放回七個縣市裡看。長條從 0 起算；虛線是全國。</p></div>
   <label class="sel">指標 <select id="mSel">${Object.entries({lfpr:'勞動力參與率（%）',ur:'失業率（%）',emp:'就業者（千人）',lf:'勞動力（千人）',pop15:'15 歲以上人口（千人）',popreg:'戶籍人口（人）'}).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label></div>
   <div class="xcity" id="xcity"></div><p class="note">勞動力資料：勞動部統計年報表 2-3（主計總處人力資源調查，2025 年平均）${st('verified')}${srcs(['mol-23'])}；戶籍人口：戶政司 ODRP048（2025 年底）${srcs(['ris-048'])}。${R.parent?'屏東市沒有市級勞動力調查，這裡以屏東縣代表。':''}</p></div>
  <div class="sec"><div class="sec-h"><div><h3 class="h-m">誰在工作、做什麼</h3><p>勞動力結構和職業結構（職業別 ≠ 產業別）。可以切換人數和百分比。</p></div><div class="seg" role="group" aria-label="單位"><button aria-pressed="true" data-u="n">人數</button><button aria-pressed="false" data-u="p">百分比</button></div></div>
   <div class="labor" id="labor"></div><div id="occ"></div></div>
  <div class="sec"><div class="sec-h"><div><h3 class="h-m">發展前沿</h3><p>正在發生、會製造新需求的建設與產業。依階段由左到右排列。</p></div></div><div class="front" id="front"></div></div>`;
  drawFlow(el,'all');
  el.querySelector('.sec-h .seg').onclick=e=>{const b=e.target.closest('[data-ln]');if(!b)return;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));drawFlow(el,b.dataset.ln)};
  const ms=el.querySelector('#mSel');ms.onchange=()=>drawX(el,ms.value);drawX(el,'lfpr');
  let unit='n';const useg=el.querySelectorAll('.seg')[1];useg.onclick=e=>{const b=e.target.closest('[data-u]');if(!b)return;useg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));unit=b.dataset.u;drawLabor(el,unit)};drawLabor(el,unit);
  drawFront(el);
};
function verifyTable(){
  return `<table class="vt"><thead><tr><th scope="col">需求</th>${majors.map(c=>`<th scope="col" style="${cvars(c)}">${esc(c.name)}<div class="note">「${esc(sloganText(c))}」</div></th>`).join('')}</tr></thead><tbody>
  ${R.needs.map(n=>{const ev=n.evidence||[],okEv=ev.some(x=>x.status==='verified');return `<tr><th scope="row">${esc(n.label)}<div class="note">${ev.map(x=>esc(x.text)+' '+st(x.status)+srcs(x.src)).join('<br>')}</div></th>${majors.map(c=>{const h=hit(c,n),p=pol(c,n);return `<td style="${cvars(c)}"><div class="sig"><span class="${h.length?'on':''}" title="口號">口號${h.length?'：'+esc(h.join('、')):''}</span><span class="${p?'on':''}" title="政見">政見${p?'：'+esc(p):''}</span><span class="${okEv?'on':''}" title="數據">數據${okEv?'已核實':'待核實'}</span></div></td>`}).join('')}</tr>`}).join('')}
  <tr class="sum"><th scope="row">口號回應的需求數</th>${majors.map(c=>`<td style="${cvars(c)}"><b class="num">${R.needs.filter(n=>hit(c,n).length).length}</b> / ${R.needs.length}　<span class="note">政見對應 ${R.needs.filter(n=>pol(c,n)).length} 項</span></td>`).join('')}</tr></tbody></table>
  <p class="note">「口號」訊號用關鍵詞比對主口號與次口號（例如「順」對應通勤），關鍵詞由編輯設定，屬詮釋；不推論任何族群的投票傾向。</p>`;
}
function drawFlow(el,mode){
  const box=el.querySelector('#flow'),W=Math.max(box.clientWidth,320),narrow=W<640;
  const ev=R.needs.flatMap(n=>(n.evidence||[]).map((e,i)=>({...e,need:n.id,id:n.id+'-'+i})));
  const cols=narrow?[14,W*.36,W-16]:[24,W*.47,W-24],rowH=narrow?46:40;
  const H=Math.max(ev.length,R.needs.length,majors.length)*rowH+40;
  const y=(arr,i)=>20+(H-40)*(i+.5)/arr.length;
  const nodesE=ev.map((e,i)=>({...e,x:cols[0],y:y(ev,i)})),nodesN=R.needs.map((n,i)=>({...n,x:cols[1],y:y(R.needs,i)})),nodesC=majors.map((c,i)=>({c,x:cols[2],y:y(majors,i)}));
  const links=[];
  nodesE.forEach(e=>{const n=nodesN.find(n=>n.id===e.need);links.push({a:e,b:n,kind:'ev',col:e.status==='verified'?'#8ba387':'#d9b25b'})});
  nodesN.forEach(n=>nodesC.forEach(C=>{const h=hit(C.c,n),p=pol(C.c,n);if(h.length&&mode!=='policy')links.push({a:n,b:C,kind:'slogan',col:c1(C.c),txt:'口號關鍵詞：'+h.join('、')});else if(p&&mode!=='slogan')links.push({a:n,b:C,kind:'policy',col:c1(C.c),txt:'政見：'+p})}));
  const curve=l=>{const x0=l.a.x+(l.kind==='ev'?6:70),x1=l.b.x-(l.kind==='ev'?70:8),m=(x0+x1)/2;return `M${x0},${l.a.y}C${m},${l.a.y} ${m},${l.b.y} ${x1},${l.b.y}`};
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="數據到需求到候選人的對應流程圖">${links.map((l,i)=>`<path class="lk ${l.kind}" d="${curve(l)}" stroke="${l.col}" style="animation-delay:${i*35}ms" ${l.txt?`data-pop="${esc(`<h4>${esc(l.a.label)} → ${esc(l.b.c.name)}</h4><p>${esc(l.txt)}</p>`)}"`:''}/>`).join('')}
   ${nodesE.map(e=>`<g class="nd" transform="translate(${e.x},${e.y})" data-pop="${esc(`<h4>城市數據</h4><p>${esc(e.text)}</p><div class='meta'>${e.status==='verified'?'已核實':'未核實'}｜${e.src.map(s=>esc(db.sources[s].title)).join('、')}</div>`)}"><circle r="6" fill="${e.status==='verified'?'#8ba387':'#d9b25b'}"/>${narrow?'':`<text x="12" y="4" class="ev">${esc(e.text.length>24?e.text.slice(0,24)+'…':e.text)}</text>`}</g>`).join('')}
   ${nodesN.map(n=>`<g class="nd need" transform="translate(${n.x},${n.y})" data-pop="${esc(`<h4>${esc(n.label)}</h4><p>${(n.evidence||[]).map(x=>esc(x.text)).join('<br>')}</p>`)}"><rect x="-70" y="-15" width="140" height="30" rx="15"/><text text-anchor="middle" y="5">${esc(n.label.length>9?n.label.slice(0,9)+'…':n.label)}</text></g>`).join('')}
   ${nodesC.map(C=>`<g class="nd cand" transform="translate(${C.x},${C.y})" data-pop="${esc(`<h4>${esc(C.c.name)}</h4><p>「${esc(sloganText(C.c))}」</p>`)}"><circle r="9" fill="${c1(C.c)}"/><text x="-14" y="-12" text-anchor="end" class="cn">${esc(C.c.name)}</text><text x="-14" y="6" text-anchor="end" class="cs">${esc(sloganText(C.c).slice(0,narrow?6:12))}</text></g>`).join('')}</svg>
   <div class="flow-key"><span><i style="background:#8ba387"></i>已核實數據</span><span><i style="background:#d9b25b"></i>未核實</span><span><b class="ln"></b>口號字面回應</span><span><b class="ln d"></b>只有政見回應</span>${narrow?'<span>點左側圓點看數據內容</span>':''}</div>`;
}
function drawX(el,key){
  const box=el.querySelector('#xcity'),me=R.parent||R.id;
  const val=id=>key==='popreg'?db.region[id].population.value:db.laborAll[id][key];
  const rows=SEVEN.map(id=>({id,v:val(id),name:db.region[id].short})).sort((a,b)=>b.v-a.v),mx=d3.max(rows,r=>r.v),nat=key==='popreg'?null:db.laborAll.national[key];
  const pct=key==='lfpr'||key==='ur',fmtV=v=>pct?v.toFixed(key==='ur'?1:1)+'%':fmt(v);
  const natLine=nat!=null&&pct?`<i class="nat" style="left:${(nat/mx*100).toFixed(2)}%"></i>`:'';
  box.innerHTML=rows.map(r=>`<div class="xr ${r.id===me?'me':''}"><span>${esc(r.name)}</span><span class="t">${r===rows[0]?natLine:''}<i style="width:${(r.v/mx*100).toFixed(2)}%"></i></span><span class="v">${fmtV(r.v)}</span></div>`).join('')+(nat!=null&&pct?`<p class="note">全國：${fmtV(nat)}</p>`:'');
  box.querySelectorAll('.xr .t i:not(.nat)').forEach((b,i)=>{b.style.animationDelay=i*50+'ms'});
}
function drawLabor(el,unit){
  const L=R.labor,box=el.querySelector('#labor');
  const parts=[['emp','就業者','#6b7d8e'],['unemp','失業者','#c2562e'],['nlf','非勞動力','#d9d0c1']];
  const tot=L.pop15;
  box.innerHTML=`<div class="lab-h"><b>${esc(L.scope)}</b> 15 歲以上人口 <span class="num">${fmt(L.pop15)}</span> 千人｜勞參率 ${L.lfpr}%｜失業率 ${L.ur}% ${st(L.status)}${srcs(L.src)}</div>
  <div class="stack">${parts.map(([k,l,c])=>`<div style="flex:${L[k]};background:${c}" data-pop="${esc(`<h4>${l}</h4><p><b>${fmt(L[k])}</b> 千人（占 15 歲以上 ${(L[k]/tot*100).toFixed(1)}%）</p><div class='meta'>2025 年平均｜勞動部統計年報表 2-3</div>`)}"><span>${l}<br>${unit==='n'?fmt(L[k])+' 千人':(L[k]/tot*100).toFixed(1)+'%'}</span></div>`).join('')}</div>`;
  const O=R.occupation,ob=el.querySelector('#occ');
  if(O&&O.values){const g=db.occGroups;const known=g.filter(x=>O.values[x.id]),sumK=known.reduce((s,x)=>s+O.values[x.id][0],0);
    ob.innerHTML=`<h4 class="occ-h">就業者職業結構（${O.year}）${st(O.status)}${srcs(O.src)}</h4><div class="stack occ">${known.map((x,i)=>`<div style="flex:${O.values[x.id][0]};background:${['#2c3e50','#6b7d8e','#8ba387','#a497c6','#e7a283','#c9b27c','#c2562e'][g.indexOf(x)]}" data-pop="${esc(`<h4>${x.label}</h4><p><b>${O.values[x.id][0]}</b> 千人（${O.values[x.id][1]}%）</p>`)}"><span>${esc(x.label)}<br>${unit==='n'?O.values[x.id][0]+' 千人':O.values[x.id][1]+'%'}</span></div>`).join('')}<div class="unk" style="flex:${O.total-sumK}"><span>其餘五類待匯入<br>${unit==='n'?fmt(O.total-sumK)+' 千人':((O.total-sumK)/O.total*100).toFixed(1)+'%'}</span></div></div><p class="note">${esc(O.note)}</p>`;
  }else ob.innerHTML=`<div class="gap" style="margin-top:14px"><b>職業人數缺漏 ${st('missing')}</b>${esc((O&&O.note)||'')}。原表到手後，這裡會顯示七類職業的人數與百分比，並和城市發展前沿逐項對照。</div>`;
}
function drawFront(el){
  const B=[['倡議／主張',/倡議|主張|中央政策/],['規劃',/規劃|推動|開發/],['施工／延宕',/施工|延宕|申請|試行|部分/],['營運',/營運|量產/]];
  const items=R.frontier||[];const bucket=f=>{const i=B.findIndex(b=>b[1].test(f.stage));return i<0?1:i};
  el.querySelector('#front').innerHTML=items.length?B.map((b,i)=>`<div class="fcol"><h4>${b[0]}</h4>${items.filter(f=>bucket(f)===i).map(f=>`<article><span class="fk">${esc(f.kind)}</span><b>${esc(f.name)}</b><p>${esc(f.stage)}｜${esc(f.detail)}</p>${st(f.status)}${srcs(f.src)}</article>`).join('')||'<p class="note">—</p>'}</div>`).join(''):'<div class="gap"><b>尚未整理發展前沿</b></div>';
}

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
if(cutFlag&&!EC.reduced()){
  history.replaceState(null,'',`city.html?r=${R.id}${location.hash}`);
  const W=innerWidth,H=innerHeight,d=Math.tan(11*Math.PI/180)*W/2;
  const a=document.createElement('div');a.className='arrive';
  a.innerHTML=`<div class="h" style="clip-path:polygon(0 0,${W}px 0,${W}px ${H/2-d}px,0 ${H/2+d}px)"><b>${esc(R.name)}</b></div><div class="h" style="clip-path:polygon(0 ${H/2+d}px,${W}px ${H/2-d}px,${W}px ${H}px,0 ${H}px)"><b>${esc(R.name)}</b></div>`;
  document.body.appendChild(a);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const [t,b]=a.children,nx=Math.sin(11*Math.PI/180),ny=Math.cos(11*Math.PI/180),m=Math.max(W,H)*.8;t.style.transform=`translate(${-nx*m}px,${-ny*m}px)`;b.style.transform=`translate(${nx*m}px,${ny*m}px)`;setTimeout(()=>a.remove(),800)}));
}
})();
