'use strict';
const CACHE='punt0-shell-v1.0.23';
const BASE=new URL('./',self.location.href);
const SHELL=new URL('index.html',BASE).href;
const ASSETS=['index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'].map(p=>new URL(p,BASE).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('punt0-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok&&response.headers.get('content-type')?.includes('text/html'))await cache.put(SHELL,response.clone());return response}catch(error){const cached=await cache.match(SHELL);if(cached)return cached;throw error}})());return;
 }
 if(ASSETS.includes(url.href))event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response}catch(error){const cached=await cache.match(req);if(cached)return cached;throw error}})());
});
