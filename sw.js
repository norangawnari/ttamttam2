/* 땀땀 자수 작업대 — 오프라인 저장 */
const VER='ttamttam-app-3cb76f11ef', FONT_CACHE='ttamttam-fonts-v1';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ttamttam-')&&k!==VER&&k!==FONT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
const timeout=(ms)=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms));
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url); if(url.origin!==location.origin) return;
  if(req.mode==='navigate'){
    // 인터넷이 되면 새 판을 받아 저장하고, 안 되거나 느리면 저장해 둔 화면
    e.respondWith(Promise.race([fetch(req),timeout(3500)]).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(VER).then(c=>c.put('index.html',cp)); } return r; })
      .catch(()=>caches.match('index.html').then(r=>r||caches.match('./')).then(r=>r||fetch(req))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{
    if(r&&r.ok){ const cp=r.clone(); caches.open(url.pathname.indexOf('/fonts/')>=0?FONT_CACHE:VER).then(c=>c.put(req,cp)); } return r; })));
});
