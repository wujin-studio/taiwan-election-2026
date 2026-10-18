/* home: real-boundary 3D map → slogan takeover → the cut */
(async function(){
const {esc,party,fmt,reduced}=EC;
const $=s=>document.querySelector(s);
let db;
try{db=await EC.loadDB()}catch(e){$('#loading').textContent=e.message;return}

const ORDER=['taipei','new-taipei','taoyuan','taichung','tainan','kaohsiung','pingtung','pingtung-city'];
const regions=ORDER.map(id=>db.region[id]);
const mainOf=r=>r.candidates.map(id=>db.cand[id]).filter(c=>c.major);
// screen offsets (px) for crowded labels: [dx,dy]
const LBL={'taipei':[30,-38],'new-taipei':[62,20],'taoyuan':[-62,-8],'taichung':[-70,0],'tainan':[-74,-14],'kaohsiung':[-86,26],'pingtung':[66,44],'pingtung-city':[84,-30]};

/* ---------- side list + chips */
$('#dday').textContent=Math.max(0,EC.daysTo(db.meta.electionDay));
$('#regionList').innerHTML=regions.map(r=>{const m=mainOf(r);return `<li><button data-r="${r.id}"><span class="rn">${esc(r.name)}<small>${r.office}・${r.candidates.length} 人</small></span><span class="rs">${m.map(c=>esc(c.name)+'「'+esc(c.slogan.status==='missing'?'未見口號':c.slogan.text)+'」').join('　')}</span><span class="go">切入</span></button></li>`}).join('');
$('#mchips').innerHTML=regions.map(r=>`<button data-r="${r.id}">${esc(r.short)}</button>`).join('');
document.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b&&!busy)openRegion(b.dataset.r)});

/* ---------- compare drawer (collapsed by default) */
const cmp=$('#cmp'),scrim=$('#scrim'),cmpOpen=$('#cmpOpen');
$('#cmpBody').innerHTML=regions.map(r=>`<h3>${esc(r.name)}${r.office}<a href="city.html?r=${r.id}">看分析</a></h3>`+r.candidates.map(id=>{const c=db.cand[id];const none=c.slogan.status==='missing';return `<div class="crow"><div class="who"><b>${esc(c.name)}</b>${party(c.party)}${c.incumbent?'<span class="note">現任</span>':''}</div><q class="${none?'none':''}">${esc(none?'未見正式口號':c.slogan.text)}</q></div>`}).join('')).join('')+`<p class="note" style="margin-top:18px">主口號依各陣營公開文宣或報導整理；狀態與來源見 <a href="overview.html">27 人總表</a>。</p>`;
function setCmp(open){cmp.classList.toggle('open',open);scrim.classList.toggle('on',open);cmp.setAttribute('aria-hidden',!open);cmpOpen.setAttribute('aria-expanded',open);if(open)$('#cmpClose').focus();else cmpOpen.focus({preventScroll:true})}
cmpOpen.onclick=()=>setCmp(true);$('#cmpClose').onclick=()=>setCmp(false);scrim.onclick=()=>setCmp(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cmp.classList.contains('open'))setCmp(false)});

/* ---------- geometry */
const topo=await (await fetch('taiwan-counties.topo.json')).json();
const counties=topojson.feature(topo,topo.objects.map).features.filter(f=>!['09007','09020'].includes(f.properties.id));
const ptc=(await (await fetch('data/geo/pingtung-city.geojson')).json()).features[0];
const regionOfCounty=Object.fromEntries(regions.filter(r=>!r.town).map(r=>[r.county,r.id]));
const proj=d3.geoMercator().center([120.62,23.62]).scale(285).translate([0,0]);

let map=null;
try{
  const lite=/lite=1/.test(location.search)||(navigator.deviceMemory&&navigator.deviceMemory<=2);
  if(lite) throw new Error('lite');
  map=make3D();
}catch(err){map=make2D();$('#mapnote').textContent+=' （目前為 2D 降級版本）'}
$('#loading').remove();

/* ================= 3D (Three.js) ================= */
function make3D(){
  const host=$('#map3d');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  if(!renderer.getContext()) throw new Error('no webgl');
  const lowEnd=(navigator.hardwareConcurrency||4)<=4&&matchMedia('(pointer:coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,lowEnd?1.5:2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(30,1,0.1,400);
  camera.up.set(0,0,1);
  scene.add(new THREE.HemisphereLight(0xfffaf0,0xd8cbb8,1.05));
  const sun=new THREE.DirectionalLight(0xffffff,1.55);sun.position.set(-9,-14,24);sun.castShadow=true;
  sun.shadow.mapSize.set(lowEnd?1024:2048,lowEnd?1024:2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:70});sun.shadow.bias=-0.0006;sun.shadow.radius=5;
  scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.ShadowMaterial({opacity:.16}));ground.position.z=-0.01;ground.receiveShadow=true;scene.add(ground);

  const P=([lon,lat])=>{const [x,y]=proj([lon,lat]);return new THREE.Vector2(x,-y)};
  function shapesOf(geom){
    const polys=geom.type==='Polygon'?[geom.coordinates]:geom.coordinates;
    return polys.map(rings=>{const s=new THREE.Shape(rings[0].map(P));rings.slice(1).forEach(h=>s.holes.push(new THREE.Path(h.map(P))));return s});
  }
  const COL={base:0xe6dfd2,act:0xeac7ae,hover:0xe7a283,sel:0xc2562e,dim:0xeee9e0,city:0xd9a45f};
  const groups={};const pickables=[];const allMeshes=[];
  function addFeature(f,key,depth,z,color,interactive){
    const g=new THREE.Group();g.position.z=z;
    const geo=new THREE.ExtrudeGeometry(shapesOf(f.geometry),{depth,bevelEnabled:false,curveSegments:1});
    const mat=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:0});
    const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo,25),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.9}));g.add(edge);
    scene.add(g);mesh.userData={key,interactive,base:color};allMeshes.push(mesh);
    if(interactive){pickables.push(mesh);groups[key]={g,mesh,edge,depth}}
    return g;
  }
  counties.forEach(f=>{const r=regionOfCounty[f.properties.id];addFeature(f,r||f.properties.id,0.32,0,r?COL.act:COL.base,!!r)});
  addFeature(ptc,'pingtung-city',0.34,0.33,COL.city,true);

  // anchors
  const anchor={};
  regions.forEach(r=>{const f=r.town?ptc:counties.find(c=>c.properties.id===r.county);const [x,y]=proj(d3.geoCentroid(f));anchor[r.id]=new THREE.Vector3(x,-y,0.7)});
  anchor['new-taipei'].set(...(()=>{const [x,y]=proj([121.62,24.98]);return [x,-y,.7]})());
  anchor['kaohsiung'].set(...(()=>{const [x,y]=proj([120.42,22.78]);return [x,-y,.7]})());
  const others=counties.filter(f=>!regionOfCounty[f.properties.id]&&!['10020','10018'].includes(f.properties.id)).map(f=>{const [x,y]=proj(d3.geoCentroid(f));return {name:f.properties.name,v:new THREE.Vector3(x,-y,.4)}});

  // labels
  const L=$('#labels'),SV=$('#leaders');
  L.innerHTML=regions.map(r=>`<button class="lb" data-r="${r.id}" aria-label="${esc(r.name)}，${r.candidates.length} 位參選人">${esc(r.short)}<small>${r.candidates.length}人</small></button>`).join('')+others.map(o=>`<span class="cl" aria-hidden="true">${esc(o.name)}</span>`).join('');
  const lbEls=[...L.querySelectorAll('.lb')],clEls=[...L.querySelectorAll('.cl')];

  // camera framing
  const home={tx:0.45,ty:-1.1,dist:30,tilt:0.62};let cam={...home};
  function fit(){
    const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
    const portrait=w/h<0.8;home.dist=portrait?Math.min(64,27/(w/h)*.62+14):Math.max(25,29.5*(1.25/(w/h))**.35);
    if(!sel) cam={...home};camera.updateProjectionMatrix();draw();
  }
  function placeCam(){const {tx,ty,dist,tilt}=cam;camera.position.set(tx,ty-Math.sin(tilt)*dist,Math.cos(tilt)*dist);camera.lookAt(tx,ty,0)}
  const v=new THREE.Vector3();
  function screen(p){v.copy(p).project(camera);return [(v.x+1)/2*host.clientWidth,(1-v.y)/2*host.clientHeight]}
  function drawLabels(){
    let lines='';
    regions.forEach((r,i)=>{const g=groups[r.id];const p=anchor[r.id].clone();p.z+=g?g.g.position.z+(g.g.scale.z-1)*g.depth:0;const [x,y]=screen(p);const [dx,dy]=LBL[r.id]||[0,0];const sc=sel?0.82:1;
      const W=host.clientWidth,hw=(lbEls[i].offsetWidth||60)/2+6;const lx=Math.min(W-hw,Math.max(hw,x+dx*sc)),ly=y+dy*sc;lbEls[i].style.transform=`translate(${lx}px,${ly}px) translate(-50%,-50%)`;lines+=`<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke="#23211d" stroke-opacity=".38" stroke-width="1"/><circle cx="${x}" cy="${y}" r="3" fill="#23211d"/>`});
    SV.innerHTML=lines;
    const show=host.clientWidth>700&&!sel;others.forEach((o,i)=>{const [x,y]=screen(o.v);clEls[i].style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;clEls[i].style.opacity=show?1:0});
  }
  function draw(){placeCam();renderer.render(scene,camera);drawLabels()}

  // animation loop on demand
  let anims=[];
  function animate(fn,ms){return new Promise(res=>{const t0=performance.now();anims.push({fn,ms:reduced()?1:ms,t0,res});if(anims.length===1)requestAnimationFrame(tick)})}
  function tick(t){anims=anims.filter(a=>{const k=Math.min(1,(t-a.t0)/a.ms);a.fn(k);if(k>=1){a.res();return false}return true});draw();if(anims.length)requestAnimationFrame(tick)}
  const easeOut=k=>1-Math.pow(1-k,3), back=k=>{const c=1.7;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2)};

  // hover
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let hover=null,sel=null;
  function pick(e){const r=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);const h=ray.intersectObjects(pickables,false)[0];return h?h.object.userData.key:null}
  function paint(){allMeshes.forEach(m=>{const k=m.userData.key;let c=m.userData.base;if(sel){c=k===sel?COL.sel:(m.userData.interactive?COL.dim:0xefebe4)}else if(k===hover&&m.userData.interactive)c=COL.hover;m.material.color.setHex(c)});lbEls.forEach(b=>b.classList.toggle('on',b.dataset.r===(sel||hover)))}
  renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||sel)return;const k=pick(e);if(k!==hover){hover=k;renderer.domElement.style.cursor=k?'pointer':'default';paint();draw()}});
  renderer.domElement.addEventListener('pointerleave',()=>{if(!sel){hover=null;paint();draw()}});
  let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
  renderer.domElement.addEventListener('click',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;const k=pick(e);if(k&&!busy)openRegion(k)});

  addEventListener('resize',fit);fit();paint();
  // entry: gentle settle
  if(!reduced()){const d0=home.dist;cam.dist=d0*1.18;cam.tilt=.5;animate(k=>{cam.dist=d0*(1.18-.18*easeOut(k));cam.tilt=.5+.12*easeOut(k)},1100)}

  return {
    async focus(id){
      const prev=sel;sel=id;paint();
      const g=groups[id];const f=id==='pingtung-city'?ptc:counties.find(c=>regionOfCounty[c.properties.id]===id);
      const [[x0,y0],[x1,y1]]=d3.geoPath(proj).bounds(f);const cx=(x0+x1)/2,cy=-(y0+y1)/2,span=Math.max(x1-x0,(y1-y0)*camera.aspect*.8);
      const from={...cam},to={tx:cx,ty:cy,dist:Math.max(13,Math.min(30,span*2.4+9)),tilt:.78};
      if(prev&&prev!==id&&groups[prev]){const pg=groups[prev].g;const z0=pg.position.z,s0=pg.scale.z;animate(k=>{pg.position.z=z0+((prev==='pingtung-city'?.33:0)-z0)*k;pg.scale.z=s0+(1-s0)*k},300)}
      const z0=g.g.position.z,base=id==='pingtung-city'?.33:0;
      sun.shadow.camera.updateProjectionMatrix();ground.material.opacity=.16;
      await Promise.all([
        animate(k=>{const e=easeOut(k);for(const p in to)cam[p]=from[p]+(to[p]-from[p])*e},900),
        animate(k=>{const e=back(k);g.g.position.z=z0+(base+.8-z0)*e;g.g.scale.z=1+1.3*e;ground.material.opacity=.16+.16*Math.min(1,k)},820)
      ]);
    },
    async reset(){
      if(!sel)return;const g=groups[sel],base=sel==='pingtung-city'?.33:0;const from={...cam},z0=g.g.position.z,s0=g.g.scale.z;sel=null;paint();
      await Promise.all([animate(k=>{const e=easeOut(k);for(const p in home)cam[p]=from[p]+(home[p]-from[p])*e},700),animate(k=>{g.g.position.z=z0+(base-z0)*k;g.g.scale.z=s0+(1-s0)*k;ground.material.opacity=.32-.16*k},500)]);
    }
  };
}

/* ================= 2D fallback (SVG) ================= */
function make2D(){
  const host=$('#map3d');host.innerHTML='<svg id="map2d" role="img" aria-label="臺灣縣市地圖（2D）"></svg>';
  const svg=d3.select('#map2d');const w=host.clientWidth,h=host.clientHeight;svg.attr('viewBox',`0 0 ${w} ${h}`);
  const pj=d3.geoMercator().fitExtent([[w*.1,h*.06],[w*.92,h*.94]],{type:'FeatureCollection',features:counties});const path=d3.geoPath(pj);
  const g=svg.append('g');
  g.selectAll('path.c').data(counties).join('path').attr('d',path).attr('fill',d=>regionOfCounty[d.properties.id]?'#eac7ae':'#e6dfd2').attr('stroke','#fff').attr('data-k',d=>regionOfCounty[d.properties.id]||'').style('cursor',d=>regionOfCounty[d.properties.id]?'pointer':'default').on('click',(e,d)=>{const k=regionOfCounty[d.properties.id];if(k&&!busy)openRegion(k)});
  g.append('path').datum(ptc).attr('d',path).attr('fill','#d9a45f').attr('stroke','#fff').attr('data-k','pingtung-city').style('cursor','pointer').on('click',()=>{if(!busy)openRegion('pingtung-city')});
  $('#labels').innerHTML=regions.map(r=>{const f=r.town?ptc:counties.find(c=>c.properties.id===r.county);const [x,y]=path.centroid(f);const [dx,dy]=LBL[r.id];return `<button class="lb" data-r="${r.id}" style="transform:translate(${x+dx}px,${y+dy}px) translate(-50%,-50%)">${esc(r.short)}<small>${r.candidates.length}人</small></button>`}).join('');
  return {async focus(id){g.selectAll('[data-k]').attr('fill',function(){const k=this.dataset.k;return k===id?'#c2562e':(k?'#eee9e0':'#e6dfd2')}).style('filter',function(){return this.dataset.k===id?'drop-shadow(8px 14px 6px #6b4a3366)':'none'}).attr('transform',function(){return this.dataset.k===id?'translate(-6,-12)':null});await new Promise(r=>setTimeout(r,reduced()?0:500))},
          async reset(){g.selectAll('[data-k]').attr('fill',function(){return this.dataset.k==='pingtung-city'?'#d9a45f':(this.dataset.k?'#eac7ae':'#e6dfd2')}).style('filter','none').attr('transform',null)}};
}

/* ================= takeover ================= */
const tk=$('#tk');let busy=false,timer=null,subTimer=null,idx=0,cards=[],curRegion=null;
const lum=hex=>{const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;const f=c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4;return .2126*f(r)+.7152*f(g)+.0722*f(b)};
function cardColors(c){const bg=c.palette[0]||'#e9e2d6';const dark=lum(bg)<.42;return {bg,fg:dark?'#ffffff':'#23211d',chip:dark?'#ffffff26':'#00000010'}}
function buildCards(r){
  const out=mainOf(r).map(c=>({type:'cand',c}));
  const minors=r.candidates.map(id=>db.cand[id]).filter(c=>!c.major);
  if(minors.length) out.push({type:'minor',list:minors});
  return out;
}
function photoHTML(c){
  if(c.photo) return `<figure class="tk-photo" style="margin:0"><img src="${c.photo.file}" alt="${esc(c.name)}照片（使用者提供，出處待補）"></figure>`;
  const vis=c.visuals.find(v=>/主視覺|識別|橫幅|海報/.test(v.kind));
  return `<figure class="tk-photo mono" style="margin:0" aria-label="${esc(c.name)}照片缺漏">${esc(c.name[0])}<figcaption class="cap">照片待補</figcaption></figure>`;
}
function renderCard(i){
  const it=cards[i],r=curRegion;let html,col;
  if(it.type==='cand'){const c=it.c;col=cardColors(c);const none=c.slogan.status==='missing';
    const subs=c.subSlogans.length?c.subSlogans:[{text:c.slogan.status==='verified'?'主口號已核實':'主口號待核實',status:c.slogan.status}];
    const vis=c.visuals[0];
    html=`<div class="tk-who"><span class="tk-region">${esc(r.name)}${r.office}參選人${c.incumbent?'・現任':''}</span><h2 class="tk-name">${esc(c.name)}</h2><span class="tk-party" style="--pc:${c.party.color}"><i aria-hidden="true"></i>${esc(c.party.name)}</span><span class="tk-status">主口號${{verified:'已核實',unverified:'未核實（使用者提供或報導轉述）',missing:'缺漏'}[c.slogan.status]}</span></div>
      ${photoHTML(c)}
      <p class="tk-slogan ${none?'none':''}" data-fit>${esc(none?'目前未見已核實的正式口號':c.slogan.text)}</p>
      <div class="tk-foot"><div class="tk-sub" aria-live="polite" data-subs='${esc(JSON.stringify(subs.map(s=>s.text)))}'><span>${esc(subs[0].text)}</span></div>
      ${vis?`<figure class="tk-vis" style="margin:0"><img src="${vis.file}" alt="${esc(vis.caption)}"><figcaption>${esc(vis.kind)}｜使用者提供</figcaption></figure>`:''}</div>`;
  }else{col={bg:'#23211d',fg:'#fff',chip:'#ffffff1a'};
    html=`<div class="tk-who"><span class="tk-region">${esc(r.name)}${r.office}</span><h2 class="tk-name">另有 ${it.list.length} 位參選人</h2></div>
      <div class="tk-minor">${it.list.map(c=>`<div><b>${esc(c.name)}</b>${esc(c.party.name)}<br><span style="opacity:.7">目前未見正式口號</span></div>`).join('')}</div><div class="tk-foot"><div class="tk-sub"><span>登記名單：中央社 2026/9/4</span></div></div>`;
  }
  const el=document.createElement('div');el.className='tk-card enter';el.style.cssText=`--bg:${col.bg};--fg:${col.fg};--chip:${col.chip}`;el.innerHTML=html;
  return {el,col};
}
function fitText(el){
  const maxH=el.clientHeight||innerHeight*.4,maxW=el.clientWidth;el.style.display='block';el.style.overflow='hidden';el.style.height=maxH+'px';
  let lo=20,hi=Math.min(innerWidth<700?150:300,maxH);el.style.lineHeight='1.04';
  for(let n=0;n<14;n++){const mid=(lo+hi)/2;el.style.fontSize=mid+'px';(el.scrollWidth<=maxW+1&&el.scrollHeight<=maxH+1)?lo=mid:hi=mid}
  el.style.fontSize=Math.floor(lo)+'px';el.style.height='';el.style.display='';el.style.overflow='';
}
function controls(n,light){return `<div class="tk-ctrl"><div class="tk-dots ${light?'light':''}" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i class="${i===idx?'on':''}"></i>`).join('')}</div><div class="tk-btns"><button class="pill" data-tk="close">回地圖</button><button class="pill" data-tk="next">${idx<n-1?'下一張':'切入分析'}</button><button class="pill solid" data-tk="cut">直接切入</button></div></div>`}
function show(i){
  clearTimeout(timer);clearInterval(subTimer);idx=i;
  const old=tk.querySelector('.tk-card');if(old){old.classList.remove('enter');old.classList.add('leave');setTimeout(()=>old.remove(),reduced()?0:300)}
  const {el,col}=renderCard(i);tk.appendChild(el);tk.querySelector('.tk-ctrl')?.remove();tk.insertAdjacentHTML('beforeend',controls(cards.length,col.fg==='#ffffff'));
  const s=el.querySelector('[data-fit]');if(s){requestAnimationFrame(()=>fitText(s))}
  const sub=el.querySelector('[data-subs]');if(sub){const list=JSON.parse(sub.dataset.subs);let k=0;if(list.length>1)subTimer=setInterval(()=>{k=(k+1)%list.length;sub.innerHTML=`<span>${esc(list[k])}</span>`},1300)}
  timer=setTimeout(()=>i<cards.length-1?show(i+1):cut(),reduced()?3200:(cards[i].type==='minor'?2200:3000));
}
async function openRegion(id){
  if(busy)return;busy=true;curRegion=db.region[id];
  document.querySelectorAll('.regions button').forEach(b=>b.classList.toggle('on',b.dataset.r===id));
  if(location.hash!=='#'+id) history.pushState({r:id},'','#'+id);
  await map.focus(id);
  cards=buildCards(curRegion);tk.hidden=false;tk.innerHTML='';document.body.style.overflow='hidden';
  show(0);tk.focus?.();busy=false;
}
function closeTk(fromPop){
  clearTimeout(timer);clearInterval(subTimer);tk.hidden=true;tk.innerHTML='';map.reset();
  document.querySelectorAll('.regions button.on').forEach(b=>b.classList.remove('on'));
  if(!fromPop&&location.hash) history.back();
}
tk.addEventListener('click',e=>{const b=e.target.closest('[data-tk]');
  if(b){const a=b.dataset.tk;if(a==='close')closeTk();else if(a==='cut')cut();else if(a==='next'){idx<cards.length-1?show(idx+1):cut()}return}
  if(e.target.closest('.tk-card')&&!tk.querySelector('.half')) idx<cards.length-1?show(idx+1):cut();
});
document.addEventListener('keydown',e=>{if(tk.hidden)return;if(e.key==='Escape')closeTk();if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();idx<cards.length-1?show(idx+1):cut()}});
addEventListener('popstate',()=>{if(!tk.hidden&&!location.hash)closeTk(true)});

/* the cut: blade line across, then two halves slide apart */
function cut(){
  clearTimeout(timer);clearInterval(subTimer);if(tk.querySelector('.half'))return;
  const r=curRegion,go=()=>{try{sessionStorage.setItem('ec-cut','1')}catch(e){}EC.goCity(r.id,'&cut=1')};
  if(reduced()){go();return}
  const card=tk.querySelector('.tk-card');tk.querySelector('.tk-ctrl')?.remove();
  const W=innerWidth,H=innerHeight,d=Math.tan(11*Math.PI/180)*W/2;
  tk.insertAdjacentHTML('afterbegin',`<div class="cut-reveal"><b>${esc(r.name)}</b></div>`);
  tk.insertAdjacentHTML('beforeend',`<svg class="cutline" viewBox="0 0 ${W} ${H}"><line x1="-20" y1="${H/2+d+4}" x2="${W+20}" y2="${H/2-d-4}" stroke-dasharray="${W*1.1}" stroke-dashoffset="${W*1.1}"><animate attributeName="stroke-dashoffset" to="0" dur=".32s" fill="freeze"/></line></svg>`);
  setTimeout(()=>{
    const top=card.cloneNode(true),bot=card.cloneNode(true);[top,bot].forEach(x=>{x.classList.remove('enter','leave');x.classList.add('half')});
    top.style.clipPath=`polygon(0 0,${W}px 0,${W}px ${H/2-d}px,0 ${H/2+d}px)`;bot.style.clipPath=`polygon(0 ${H/2+d}px,${W}px ${H/2-d}px,${W}px ${H}px,0 ${H}px)`;
    card.replaceWith(top);tk.appendChild(bot);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const nx=Math.sin(11*Math.PI/180),ny=Math.cos(11*Math.PI/180),m=Math.max(W,H)*.75;top.style.transform=`translate(${-nx*m}px,${-ny*m}px)`;bot.style.transform=`translate(${nx*m}px,${ny*m}px)`;tk.querySelector('.cutline').style.opacity=0}));
    setTimeout(go,640);
  },340);
}

/* returning from a city page (#hash): show the region lifted, no takeover */
if(location.hash){const id=location.hash.slice(1);if(db.region[id]){history.replaceState(null,'',location.pathname+location.search);map.focus(id).then(()=>setTimeout(()=>map.reset(),900))}}
})();
