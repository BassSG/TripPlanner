import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
test('worker precaches relative project paths including offline shell and icons',async()=>{
  const handlers={},urls=[];vm.runInNewContext(source,{URL,Set,self:{location:{origin:'https://basssg.github.io'},registration:{scope:'https://basssg.github.io/TripPlanner/'},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>({addAll:async value=>urls.push(...value)})}});
  let work;handlers.install({waitUntil:p=>work=p});await work;assert.ok(urls.every(url=>url.startsWith('https://basssg.github.io/TripPlanner/')));assert.ok(urls.some(url=>url.endsWith('/offline.html')));assert.ok(urls.some(url=>url.endsWith('/assets/icon-512.png')));
});
test('offline worker serves the versioned browser and Apple icons in the generated page',async()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const iconLinks=[...html.matchAll(/href="(\.\/assets\/(?:icon\.svg|favicon\.ico|icon-180\.png)\?v=[^"]+)"/g)].map(match=>match[1]);
  assert.equal(iconLinks.length,3);
  const handlers={},stored=new Map(),scope='https://basssg.github.io/TripPlanner/';
  const cache={addAll:async urls=>urls.forEach(url=>stored.set(url,new Response('cached '+url))),match:async request=>stored.get(typeof request==='string'?request:request.url)};
  vm.runInNewContext(source,{URL,Set,Response,self:{location:{origin:'https://basssg.github.io'},registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>cache},fetch:async()=>{throw new Error('offline');}});
  let installation;handlers.install({waitUntil:promise=>installation=promise});await installation;
  for(const icon of iconLinks){
    const url=new URL(icon,scope).href;assert.ok(stored.has(url));
    let response;handlers.fetch({request:{url,method:'GET',mode:'no-cors'},respondWith:promise=>response=promise});
    assert.equal(await(await response).text(),'cached '+url);
  }
});
test('worker only removes its own old caches, preserving other applications',async()=>{
  const handlers={},deleted=[];vm.runInNewContext(source,{URL,Set,self:{location:{origin:'https://basssg.github.io'},registration:{scope:'https://basssg.github.io/TripPlanner/'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>handlers[name]=fn},caches:{keys:async()=>['tripplanner-v8-old','another-app-cache','trip-planner-cache-v1'],delete:async key=>deleted.push(key)}});
  let work;handlers.activate({waitUntil:p=>work=p});await work;assert.deepEqual(deleted,['tripplanner-v8-old','trip-planner-cache-v1']);
});
test('worker ignores cross-origin API and POST requests',()=>{
  const handlers={};vm.runInNewContext(source,{URL,Set,self:{location:{origin:'https://basssg.github.io'},registration:{scope:'https://basssg.github.io/TripPlanner/'},addEventListener:(name,fn)=>handlers[name]=fn}});
  let intercepted=false;const respondWith=()=>intercepted=true;handlers.fetch({request:{url:'https://script.google.com/macros/s/test/exec',method:'GET'},respondWith});handlers.fetch({request:{url:'https://basssg.github.io/TripPlanner/',method:'POST'},respondWith});assert.equal(intercepted,false);
});
test('offline navigation returns the app so saved local plans remain accessible',async()=>{
  const handlers={},cached=new Response('saved-plans-app',{status:200});vm.runInNewContext(source,{URL,Set,Response,AbortController,setTimeout,clearTimeout,self:{location:{origin:'https://basssg.github.io'},registration:{scope:'https://basssg.github.io/TripPlanner/'},addEventListener:(name,fn)=>handlers[name]=fn},fetch:async()=>{throw new Error('offline');},caches:{open:async()=>({match:async url=>url.endsWith('/index.html')?cached:undefined})}});
  let response;handlers.fetch({request:{url:'https://basssg.github.io/TripPlanner/',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal(await(await response).text(),'saved-plans-app');
});
