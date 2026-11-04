/* Tarot Smith-Waite – chạy offline. Mỗi lần đẩy bản mới, phiên bản tự đổi để máy tải lại. */
const VERSION="tarot-54e03e33cf";
const FILES=["./", "index.html", "cards-major.js", "cards-wands-cups.js", "cards-swords-pents.js", "cards-enrich.js", "deck-extra.js", "deck-images.js", "ritual-art.js", "app.js", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>null)))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=="tarot-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open("tarot-fonts").then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n;}).catch(()=>r))));return;}
  if(u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(n=>{if(n.ok){const cp=n.clone();caches.open(VERSION).then(c=>c.put(e.request,cp));}return n;}).catch(()=>caches.match("index.html"))));});
