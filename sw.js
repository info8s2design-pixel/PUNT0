'use strict';
const CACHE='punt0-shell-v1.0.29';
const BASE=new URL('./',self.location.href);
const SHELL=new URL('index.html',BASE).href;
const ASSETS=['index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'].map(p=>new URL(p,BASE).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('punt0-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(req.mode==='navigate'){
  const refresh=(async()=>{const cache=await caches.open(CACHE);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);try{const response=await fetch(req,{signal:controller.signal,cache:'no-store'});if(response.ok&&response.headers.get('content-type')?.includes('text/html')){try{await cache.put(SHELL,response.clone())}catch{}}return response}finally{clearTimeout(timer)}})();
  event.waitUntil(refresh.catch(()=>{}));
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(SHELL);if(cached)return cached;try{return await refresh}catch{return new Response('<!doctype html><html lang="it"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PUNT0</title><body><h1>PUNT0</h1><p>Caricamento non riuscito. Controlla la connessione e riprova. I dati salvati restano sul dispositivo.</p><button onclick="location.reload()">Riprova</button></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})}})());return;
 }
 if(ASSETS.includes(url.href))event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response}catch(error){const cached=await cache.match(req);if(cached)return cached;throw error}})());
});
