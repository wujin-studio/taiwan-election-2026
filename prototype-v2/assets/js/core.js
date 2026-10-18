/* shared helpers — 2026 選戰切一刀 */
(function(){
const BUILD='v20-2026-10-18';
let DB=null;
async function loadDB(){
  if(DB) return DB;
  const r=await fetch('data/db.json?b='+BUILD,{cache:'no-cache'});
  if(!r.ok) throw new Error('資料庫載入失敗（HTTP '+r.status+'）');
  DB=await r.json();
  DB.cand=Object.fromEntries(DB.candidates.map(c=>[c.id,c]));
  DB.region=Object.fromEntries(DB.regions.map(r=>[r.id,r]));
  return DB;
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null?'—':Number(n).toLocaleString('zh-TW');
const ST_LABEL={verified:'已核實',unverified:'未核實',missing:'缺漏'};
const st=s=>`<span class="st ${s}" title="${esc(DB?.meta.status[s]||'')}">${ST_LABEL[s]||s}</span>`;
let srcN=0;
function srcs(list){
  if(!list||!list.length) return '';
  return list.map(id=>{const s=DB.sources[id];if(!s)return '';return `<button class="src" type="button" data-src="${esc(id)}" aria-label="來源：${esc(s.title)}">${s.url?'源':'註'}</button>`}).join('');
}
function party(p){return `<span class="party" style="--pc:${p.color}"><i aria-hidden="true"></i>${esc(p.short)}</span>`}
function item(x,opts={}){ // text + status + sources
  if(!x) return '';
  return `<span class="it">${esc(x.text)}${x.date&&opts.date!==false?` <span class="note">（${esc(x.date)}）</span>`:''} ${st(x.status)}${srcs(x.src)}${x.note?`<span class="note" style="display:block">${esc(x.note)}</span>`:''}</span>`;
}
/* popover */
let popEl=null;
function closePop(){if(popEl){popEl.remove();popEl=null}}
function openPop(anchor,html){
  closePop();
  popEl=document.createElement('div');popEl.className='pop';popEl.setAttribute('role','dialog');
  popEl.innerHTML='<button class="x" aria-label="關閉">×</button>'+html;
  document.body.appendChild(popEl);
  const r=anchor.getBoundingClientRect(),w=popEl.offsetWidth,h=popEl.offsetHeight;
  let x=Math.min(Math.max(16,r.left+r.width/2-w/2),innerWidth-w-16), y=r.bottom+8;
  if(y+h>innerHeight-12) y=Math.max(12,r.top-h-8);
  popEl.style.left=x+'px';popEl.style.top=y+'px';
  popEl.querySelector('.x').onclick=closePop;
  popEl.querySelector('.x').focus({preventScroll:true});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-src]');
  if(b){e.preventDefault();e.stopPropagation();const s=DB.sources[b.dataset.src];
    openPop(b,`<h4>${esc(s.title)}</h4><div class="meta">${esc(s.publisher)}${s.date?'｜'+esc(s.date):''}</div>${s.url?`<p style="margin:.5em 0 0"><a href="${esc(s.url)}" target="_blank" rel="noopener">開啟原始來源</a></p>`:'<p class="meta" style="margin:.5em 0 0">沒有可以公開連結的原文；請以「未核實」看待。</p>'}`);return}
  const d=e.target.closest('[data-pop]');
  if(d){e.preventDefault();e.stopPropagation();openPop(d,d.dataset.pop);return}
  if(popEl&&!e.target.closest('.pop')) closePop();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePop()});
addEventListener('scroll',()=>closePop(),{passive:true});
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const daysTo=d=>Math.ceil((new Date(d+'T00:00:00+08:00')-Date.now())/864e5);
window.EC={BUILD,loadDB,esc,fmt,st,srcs,party,item,openPop,closePop,reduced,daysTo,get db(){return DB}};
})();
