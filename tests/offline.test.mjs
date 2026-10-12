import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
test('worker precaches relative project paths including offline shell and icons',async()=>{
  const handlers={},urls=[];vm.runInNewContext(source,{URL,Set,self:{location:{origin:'https://basssg.github.io'},registration:{scope:'https://basssg.github.io/TripPlanner/'},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>({addAll:async value=>urls.push(...value)})}});
  let work;handlers.install({waitUntil:p=>work=p});await work;assert.ok(urls.every(url=>url.startsWith('https://basssg.github.io/TripPlanner/')));assert.ok(urls.some(url=>url.endsWith('/offline.html')));assert.ok(urls.some(url=>url.endsWith('/assets/icon-512.png')));
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
