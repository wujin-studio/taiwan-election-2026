(function(){
"use strict";
const css=document.createElement("style");css.textContent=`
#crossLab{margin:18px 0 36px;color:#292b35}
#crossLab .xTitle{font-size:clamp(25px,3vw,39px);letter-spacing:-1px;margin:5px 0 9px}
#crossLab .xLead{font-size:13px;color:#777a84;line-height:1.8}
#crossLab .xControls{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
#crossLab .xControls button{border:1px solid #e7ded5;border-radius:22px;padding:9px 13px;background:#fff;font-size:12px;font-weight:800}
#crossLab .xControls button.on{background:#292c36;color:white}
#crossLab .xPanel{background:white;border:1px solid #e8e1d9;border-radius:18px;padding:20px;margin:13px 0}
#crossLab .xPanel h4{font-size:19px;margin:0 0 12px}
#crossLab .xBars{display:grid;gap:15px;perspective:850px}
#crossLab .xBarLabel{display:flex;justify-content:space-between;gap:8px;font-size:13px;font-weight:800;margin-bottom:7px}
#crossLab .xTrack{height:25px;background:#f1eee9;border-radius:7px;position:relative;transform:rotateX(12deg);transform-style:preserve-3d;box-shadow:0 6px 10px #b9b4af22}
#crossLab .xFill{height:100%;background:linear-gradient(180deg,#f4ac8a,#d66d51);border-radius:6px;position:relative;transition:width .6s ease}
#crossLab .xFill:after{content:"";position:absolute;left:4px;right:0;top:-6px;height:6px;transform:skewX(-40deg);transform-origin:bottom;background:#f5c3ac}
#crossLab .xBars .xBar:nth-child(even) .xFill{background:linear-gradient(180deg,#c1cee0,#849ebd)}
#crossLab .xBars .xBar:nth-child(even) .xFill:after{background:#d9e0ec}
#crossLab .xHint{font-size:11px;color:#898992;line-height:1.8;margin-top:12px}
#crossLab .xInsight{border-left:3px solid #e78461;padding:9px 14px;margin:12px 0;background:#faf7f3;border-radius:0 9px 9px 0}
#crossLab .xInsight b{font-size:14px}
#crossLab .xInsight p{font-size:13px;line-height:1.8;color:#696c75;margin:5px 0}
#crossLab .xTimeline{display:flex;gap:9px;overflow-x:auto;padding:10px 0}
#crossLab .xTime{min-width:170px;max-width:210px;flex:none;border-top:4px solid #dc8b70;background:#f8f5f1;padding:13px;border-radius:8px;font-size:12px;line-height:1.6}
#crossLab .xTime strong{display:block;margin-bottom:5px}
#crossLab .xTime p{margin:0;color:#696c75}
#crossLab .xTable{width:100%;border-collapse:collapse;font-size:12px}
#crossLab .xTable th,#crossLab .xTable td{padding:11px 6px;border-bottom:1px solid #eee9e4;text-align:left;vertical-align:top}
#crossLab .xTable th{color:#9b705e}
#crossLab .xNote{font-size:11px;color:#8b8990;line-height:1.8}
`;document.head.append(css);
let state={city:null,metric:"mentions"},cache=null;
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=x=>Number(x).toLocaleString("zh-TW",{maximumFractionDigits:1});
async function load(){if(cache)return cache;const names=["campaign-research.json","city-deep-research.json","media-observations-2026.json","election-polls.json"];const result=await Promise.all(names.map(n=>fetch("./"+n).then(r=>r.ok?r.json():null).catch(()=>null)));cache={campaign:result[0],deep:result[1],media:result[2],polls:result[3]};return cache}
function bars(items,unit,maximum){const max=maximum||Math.max(1,...items.map(x=>x.value));return '<div class="xBars">'+items.map((x,i)=>'<div class="xBar"><div class="xBarLabel"><span>'+safe(x.label)+'</span><span>'+fmt(x.value)+safe(unit)+'</span></div><div class="xTrack"><div class="xFill" style="width:'+Math.min(100,100*x.value/max)+'%"></div></div></div>').join("")+'</div>'}
function panel(title,body,foot){return '<section class="xPanel"><h4>'+safe(title)+'</h4>'+body+(foot?'<p class="xHint">'+safe(foot)+'</p>':'')+'</section>'}
function render(container,city,d){state.city=city;const cr=d.campaign?.regions?.find(r=>r.city===city),dr=d.deep?.regions?.find(r=>r.city===city),mr=d.media?.observations?.filter(r=>r.city===city)||[],pr=d.polls?.regions?.find(r=>r.city===city);
const people=cr?.people||[];let html='<h3 class="xTitle">'+safe(city)+'｜行銷策略交叉分析</h3><p class="xLead">以候選人、競選口號、媒體傳播與城市需求交叉閱讀。立體圖表採視覺深度效果，數值依原始統計比例，不以3D面積誤導。</p>';
if(mr.length){const keys=[["mentions","跨平台提及"," 篇"],["posts","候選人發文"," 篇"],["fbAvgComments","FB 平均留言"," 則"],["threadsAvgComments","Threads 平均留言"," 則"],["positivePct","正向內容分類","%"],["negativePct","負向內容分類","%"]];html+='<div class="xControls">'+keys.filter(([k])=>mr.some(r=>r[k]!=null)).map(([k,t])=>'<button data-xmetric="'+k+'" class="'+(state.metric===k?"on":"")+'">'+t+'</button>').join("")+'</div>';const chosen=keys.find(x=>x[0]===state.metric&&mr.some(r=>r[x[0]]!=null))||keys.find(x=>mr.some(r=>r[x[0]]!=null));state.metric=chosen[0];html+=panel(chosen[1],bars(mr.filter(r=>r[chosen[0]]!=null).map(r=>({label:r.candidate,value:r[chosen[0]]})),chosen[2],chosen[0].endsWith("Pct")?100:null),"2026/10/05–10/11 監測資料；跨平台提及與官方發文不能視為同一口徑。");
if(mr.length>=2){const [a,b]=mr;let insight=[];if(a.mentions!=null&&b.mentions!=null){const delta=Math.abs(a.mentions-b.mentions),lead=a.mentions>b.mentions?a:b;insight.push('<div class="xInsight"><b>聲量差距 '+fmt(delta)+' 篇</b><p>'+safe(lead.candidate)+'在此監測週提及量較高。單次聲量不等於支持度，也不表示活動帶來投票轉換。</p></div>')}if(a.posts!=null&&b.posts!=null){const lead=a.posts>b.posts?a:b;insight.push('<div class="xInsight"><b>內容供給差異</b><p>'+safe(lead.candidate)+'在觀測平台發文較多；須同時對照第三方新聞、民間二創與留言深度，避免把高頻率誤判為高效率。</p></div>')}if(a.channels&&b.channels){const diff=Math.abs(a.channels.threads-b.channels.threads);insight.push('<div class="xInsight"><b>Threads 討論來源差 '+fmt(diff)+' 個百分點</b><p>反映跨平台討論來源結構不同，不代表Threads粉絲數或觸及率高低。</p></div>')}html+=panel("媒體布局｜交叉解讀",insight.join(""),"以上是描述性分析與研究假說，並非因果結論。")}}
else{html+=panel("媒體數據完整度","<p class='xNote'>此選區尚無可核實的同口徑跨平台監測數據。以下提供已建檔的競選媒體布局與政策策略比較，不製造粉絲數、互動率或聲量排名。</p>")}
if(people.length){html+=panel("候選人 × 口號 × 傳播工具","<table class='xTable'><thead><tr><th>候選人</th><th>品牌主張</th><th>已建檔媒體操作</th></tr></thead><tbody>"+people.map(p=>"<tr><td><b>"+safe(p.name)+"</b></td><td>"+safe(p.slogan)+"</td><td>"+safe((p.media||[]).join("；"))+"</td></tr>").join("")+"</tbody></table>","此為候選人宣傳方式的分類，不代表實際曝光或成效。")}
if(dr){html+=panel("城市需求 × 政策定位","<table class='xTable'><thead><tr><th>候選人</th><th>切入需求</th><th>政策訴求</th></tr></thead><tbody>"+dr.candidates.map(p=>"<tr><td><b>"+safe(p.name)+"</b></td><td>"+safe(p.need)+"</td><td>"+safe(p.details)+"</td></tr>").join("")+"</tbody></table>");html+=panel("城市發展歷程｜政策背景","<div class='xTimeline'>"+(dr.eras||[]).map(e=>"<div class='xTime'><strong>"+safe(e.period)+"</strong><p>"+safe(e.summary)+"</p></div>").join("")+"</div>")}
if(pr?.polls?.length){const p=pr.polls[pr.polls.length-1];html+=panel("最近一筆已建檔民調｜"+p.end,bars(Object.entries(p.results).map(([name,value])=>({label:name,value})),"%",100),p.pollster+"｜"+p.method+"｜樣本 "+(p.sample||"未列")+"；僅此一筆，不推估民調走勢。")}
html+='<p class="xNote">數據品質：僅有臺北、新北已建檔週期性媒體監測；其餘城市的媒體聲量、粉絲數與互動率尚未核實。歷史事件、民調與媒體曝光的時間差仍需逐筆比對。</p>';container.innerHTML=html;container.querySelectorAll("[data-xmetric]").forEach(b=>b.onclick=()=>{state.metric=b.dataset.xmetric;render(container,city,d)})}
function setup(){const tabs=document.getElementById("tabs");if(!tabs||tabs.querySelector("#crossTab"))return;const button=document.createElement("button");button.id="crossTab";button.textContent="╱ 策略交叉分析";button.onclick=async()=>{const c=document.getElementById("content");if(!c)return;const city=(document.getElementById("cityTitle")?.textContent||"").split("｜")[0].trim();if(!city)return;tabs.querySelectorAll("button").forEach(b=>b.classList.remove("active"));button.classList.add("active");c.replaceChildren();const div=document.createElement("div");div.id="crossLab";c.append(div);render(div,city,await load())};tabs.prepend(button)}
new MutationObserver(()=>{if(document.getElementById("tabs"))setup()}).observe(document.body,{childList:true,subtree:true});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();