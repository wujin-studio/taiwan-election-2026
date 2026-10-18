/* 入口驗證碼 + 開關站 + 引用聲明（放在 <head> 最前面同步載入） */
(function(){
  const SITE_OPEN=true;   // ← 改成 false 並部署，整站顯示「暫停開放」
  const HASH='6d19ca72de1fe7973e5a763cdbaf47af34674d4f45a8a2cacd881b751d680a4f'; // 驗證碼的 SHA-256
  const KEY='ec-gate-v1';
  const ok=()=>{try{return sessionStorage.getItem(KEY)===HASH||localStorage.getItem(KEY)===HASH}catch(e){return false}};
  const css=document.createElement('style');
  css.textContent=`html.ec-lock body>*:not(#ec-gate){display:none!important}html.ec-lock,html.ec-lock body{overflow:hidden!important}
#ec-gate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px max(16px,env(safe-area-inset-left));background:#faf7f1;font-family:"Noto Sans TC","Noto Sans CJK TC","PingFang TC",sans-serif;color:#23211d}
#ec-gate .bx{width:min(420px,100%);background:#fff;border:1px solid #e9e2d6;border-radius:26px;padding:30px 26px;box-shadow:0 30px 70px -40px #3b2a1a55;text-align:center}
#ec-gate .mk{width:44px;height:44px;border-radius:50%;background:#23211d;margin:0 auto 14px;position:relative;overflow:hidden}
#ec-gate .mk::after{content:"";position:absolute;left:-8px;right:-8px;top:50%;height:4px;background:#c2562e;transform:rotate(-11deg);box-shadow:0 0 0 2px #fff}
#ec-gate h1{font:900 26px/1.25 "Noto Serif TC","Noto Serif CJK TC",serif;margin:0 0 6px}
#ec-gate p{font-size:13.5px;line-height:1.7;color:#4a463f;margin:0 0 16px}
#ec-gate input{width:100%;font:800 26px/1 ui-monospace,monospace;letter-spacing:.35em;text-align:center;padding:14px;border:1.5px solid #d9d0c1;border-radius:14px;outline:0}
#ec-gate input:focus{border-color:#c2562e;box-shadow:0 0 0 3px #f6e3d8}
#ec-gate button{margin-top:12px;width:100%;min-height:48px;border:0;border-radius:999px;background:#23211d;color:#fff;font:800 16px "Noto Sans TC",sans-serif;cursor:pointer}
#ec-gate .err{color:#c2562e;font-weight:700;min-height:1.5em;margin:10px 0 0}
#ec-gate .dis{margin:18px 0 0;padding-top:14px;border-top:1px solid #e9e2d6;font-size:12px;color:#7c766c;text-align:left}
#ec-gate label.rm{display:flex;gap:6px;align-items:center;justify-content:center;font-size:12.5px;color:#7c766c;margin-top:10px}
.ec-disclaimer{position:relative;z-index:29;padding:6px max(16px,env(safe-area-inset-left));background:#23211dee;color:#f3eee5;font:600 12px/1.5 "Noto Sans TC",sans-serif;text-align:center}
.ec-disclaimer button{background:none;border:0;color:#e7a283;font:700 12px inherit;cursor:pointer;margin-left:8px}`;
  document.head.appendChild(css);
  const DIS='本站內容引用網路公開資料（新聞報導、政府統計、第三方監測與陣營公開素材），僅供分析參考，不代表任何政黨或候選人立場。';
  if(!SITE_OPEN){document.documentElement.classList.add('ec-lock');addEventListener('DOMContentLoaded',()=>{const g=document.createElement('div');g.id='ec-gate';g.innerHTML=`<div class="bx"><div class="mk"></div><h1>網站暫停開放</h1><p>本站目前暫停對外開放，請稍後再來。</p></div>`;document.body.appendChild(g)});return}
  function disclaimer(){if(document.querySelector('.ec-disclaimer'))return;if(document.body.classList.contains('home')){const n=document.getElementById('mapnote');if(n&&!n.dataset.dis){n.dataset.dis=1;n.insertAdjacentHTML('afterbegin','<b style="display:block;color:#23211d">'+DIS+'</b>')}return}let hide=false;try{hide=sessionStorage.getItem('ec-dis')==='1'}catch(e){}if(hide)return;const d=document.createElement('div');d.className='ec-disclaimer';d.setAttribute('role','note');d.innerHTML=DIS+'<button type="button" aria-label="收起聲明">收起</button>';d.querySelector('button').onclick=()=>{d.remove();try{sessionStorage.setItem('ec-dis','1')}catch(e){}dispatchEvent(new Event('resize'))};const top=document.querySelector('header.top');top?top.after(d):document.body.prepend(d)}
  if(ok()){addEventListener('DOMContentLoaded',disclaimer);return}
  document.documentElement.classList.add('ec-lock');
  async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  addEventListener('DOMContentLoaded',()=>{
    const g=document.createElement('div');g.id='ec-gate';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-labelledby','ec-gh');
    g.innerHTML=`<form class="bx" autocomplete="off"><div class="mk" aria-hidden="true"></div><h1 id="ec-gh">2026 選戰切一刀</h1><p>這是內部測試版本，請輸入驗證碼進入。</p>
      <label for="ec-code" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">驗證碼</label>
      <input id="ec-code" inputmode="numeric" pattern="[0-9]*" maxlength="12" placeholder="••••••" required>
      <label class="rm"><input type="checkbox" id="ec-rm" style="width:auto">在這台裝置記住我</label>
      <button type="submit">進入網站</button><p class="err" id="ec-err" aria-live="polite"></p>
      <p class="dis">${DIS}</p></form>`;
    document.body.appendChild(g);const f=g.querySelector('form'),inp=g.querySelector('#ec-code');setTimeout(()=>inp.focus(),50);
    f.addEventListener('submit',async e=>{e.preventDefault();let h='';try{h=await sha(inp.value.trim())}catch(err){}
      if(h===HASH){try{sessionStorage.setItem(KEY,HASH);if(g.querySelector('#ec-rm').checked)localStorage.setItem(KEY,HASH)}catch(e){}
        g.remove();document.documentElement.classList.remove('ec-lock');disclaimer();window.ECtrack&&ECtrack('gate_unlock');dispatchEvent(new Event('resize'))}
      else{g.querySelector('#ec-err').textContent='驗證碼不正確，請再試一次。';inp.select()}});
  });
})();
