'use strict';
const VERSION='4ef34ab2e020';
const CACHE='tripplanner-v8-'+VERSION;
const CORE=['./','./index.html','./offline.html','./manifest.json','./assets/icon.svg?v='+VERSION,'./assets/favicon.ico?v='+VERSION,'./assets/icon-180.png?v='+VERSION,'./assets/icon-192.png','./assets/icon-512.png','./assets/chiang-mai.jpg',
  './src/styles.css?v='+VERSION,'./src/theme.css?v='+VERSION,'./app-config.js?v='+VERSION,'./src/model.js?v='+VERSION,'./src/app.js?v='+VERSION];
const localUrl=relative=>new URL(relative,self.registration.scope).href;
const assetPaths=new Set(CORE.map(relative=>new URL(localUrl(relative)).pathname));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(localUrl))));});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&(key.startsWith('tripplanner-v8-')||key.startsWith('trip-planner-cache-'))).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6000);
      try{const response=await fetch(request,{signal:controller.signal});if(response.ok&&(url.pathname===new URL(self.registration.scope).pathname||url.pathname.endsWith('/index.html'))){await cache.put(localUrl('./index.html'),response.clone());}return response;}
      catch{return await cache.match(localUrl('./index.html'))||await cache.match(localUrl('./offline.html'))||new Response('TripPlanner: โปรดเชื่อมต่ออินเทอร์เน็ตอีกครั้ง',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
      finally{clearTimeout(timeout);}
    })());return;
  }
  if(!assetPaths.has(url.pathname))return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(request);if(cached)return cached;const response=await fetch(request);if(response.ok&&response.type==='basic')await cache.put(request,response.clone());return response;})());
});
