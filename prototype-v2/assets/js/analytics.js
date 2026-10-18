/* Google Analytics 4 — 只在正式網域載入；填入評估 ID 即啟用 */
(function(){
  const GA_ID='G-8XGKPEX940';
  const PROD_HOSTS=['taiwan-election-2026.onrender.com'];
  const on=GA_ID&&PROD_HOSTS.includes(location.hostname);
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){dataLayer.push(arguments)};
  if(on){
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
    gtag('js',new Date());gtag('config',GA_ID,{anonymize_ip:true});
  }
  const ev=(name,params)=>{if(on)gtag('event',name,params||{})};
  window.ECtrack=ev;
  const page=()=>location.pathname.split('/').pop()||'index.html';
  const region=()=>{const m=/[?&]r=([a-z-]+)/.exec(location.search);return m?m[1]:(location.hash||'').slice(1)};
  document.addEventListener('click',e=>{
    const t=e.target;
    const r=t.closest('[data-r]');if(r&&page().startsWith('index'))ev('select_region',{region:r.dataset.r});
    const tab=t.closest('[data-tab]');if(tab)ev('view_tab',{region:region(),tab:tab.dataset.tab});
    const tk=t.closest('[data-tk]');if(tk)ev('takeover_action',{action:tk.dataset.tk});
    const op=t.closest('[data-open]');if(op)ev('open_candidate',{candidate:op.dataset.open,region:region()});
    const src=t.closest('[data-src]');if(src)ev('view_source',{source:src.dataset.src,page:page()});
    if(t.closest('#cmpOpen'))ev('open_compare');
    const seg=t.closest('.seg button');if(seg)ev('toggle_view',{value:seg.dataset.v||seg.dataset.h||seg.dataset.mc||seg.dataset.ln||seg.dataset.u||'',region:region()});
  },true);
  addEventListener('pagehide',()=>{if(page().startsWith('city'))ev('city_leave',{region:region()})});
})();
