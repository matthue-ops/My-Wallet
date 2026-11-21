// Increment the cache version when publishing a new app release.
const CACHE='my-wallet-shell-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
 // Wait for the user to approve an update instead of interrupting their work.
});
self.addEventListener('message',event=>{
 if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('my-wallet-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(request);
   if(response.ok){
    const cache=await caches.open(CACHE);
    await cache.put(request,response.clone());
   }
   return response;
  }catch(error){
   const cached=await caches.match(request);
   if(cached)return cached;
   if(request.mode==='navigate'){
    const fallback=await caches.match('./index.html');
    if(fallback)return fallback;
   }
   return Response.error();
  }
 })());
});
