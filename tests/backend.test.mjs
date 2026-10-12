import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash,randomUUID} from 'node:crypto';
const source=readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8');
const input={destination:'เชียงใหม่',origin:'กรุงเทพมหานคร',budget:10000,days:3,people:2,children:0,travelMode:'car',startDate:'2026-12-01',preferences:'ธรรมชาติ',clientId:'testclient1234567890'};
function chunk(start=1,count=3) {
  return {tripTitle:'ทริปเชียงใหม่',summary:'เที่ยวเมืองและธรรมชาติ',weatherInfo:'อากาศตามฤดูกาล',bestTimeToVisit:'ปลายปี',importantNotes:['ตรวจเวลาเปิด'],packingList:['เสื้อกันหนาว'],moneyTips:['เดินเที่ยวในเมือง'],usefulApps:[],
    days:Array.from({length:count},(_,i)=>({dayNumber:start+i,title:'เมืองเชียงใหม่ '+(start+i),theme:'ธรรมชาติ',activities:[
      {time:'08:00',endTime:'09:00',title:'อาหารเช้า',description:'อาหารท้องถิ่น',location:'เชียงใหม่',mapQuery:'อาหารเช้า เชียงใหม่',category:'food',cost:200,costNote:'ทั้งกลุ่ม',tips:'',sourceIds:['S1','UNKNOWN']},
      {time:'10:00',endTime:'11:30',title:'ชมวัด',description:'เดินชมสถาปัตยกรรม',location:'วัดเชียงมั่น',mapQuery:'วัดเชียงมั่น เชียงใหม่',category:'attraction',cost:100,costNote:'ทั้งกลุ่ม',tips:'',sourceIds:[]},
      {time:'17:00',endTime:'18:00',title:'เช็กอินที่พัก',description:'พักผ่อน',location:'โรงแรม',mapQuery:'โรงแรม เชียงใหม่',category:'hotel',cost:999,costNote:'',tips:'',sourceIds:[]}
    ],accommodation:{name:'โรงแรม',type:'โรงแรม',pricePerNight:900,mapQuery:'โรงแรม เชียงใหม่',highlights:'ใกล้เมือง',sourceIds:[]}}))};
}
function setup(options={}) {
  const props=new Map(Object.entries({AI_API_KEY:'test-only-key',...options.properties}));
  const cache=new Map(),calls=[],logs=[];
  const response=(status,body)=>({getResponseCode:()=>status,getContentText:()=>typeof body==='string'?body:JSON.stringify(body)});
  const ctx={console:{warn:message=>logs.push(message)},PropertiesService:{getScriptProperties:()=>({getProperty:key=>props.has(key)?props.get(key):null,setProperty:(key,value)=>props.set(key,value)})},
    CacheService:{getScriptCache:()=>({get:key=>cache.get(key)||null,put:(key,value)=>cache.set(key,value),remove:key=>cache.delete(key)})},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
    Utilities:{getUuid:randomUUID,sleep:()=>{},DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,value)=>[...createHash('sha256').update(value).digest()],newBlob:value=>({getBytes:()=>Buffer.from(value)}),formatDate:(date,zone,format)=>format==='yyyy-MM-dd'?'2026-10-12':format==='yyyyMMddHH'?'2026101214':'2026-10-12'},
    UrlFetchApp:{fetch:(url,settings)=>{calls.push({url,settings});if(options.fetch)return options.fetch(url,settings,response);if(url.includes('brave'))return response(200,{web:{results:[{title:'Chiang Mai official travel',description:'Travel information เชียงใหม่',url:'https://example.com/travel'}]}});const prompt=JSON.parse(settings.payload).messages[1].content;const match=prompt.match(/สร้างเฉพาะวันที่ (\d+) ถึง (\d+)/);return response(200,{choices:[{finish_reason:'stop',message:{content:JSON.stringify(chunk(Number(match[1]),Number(match[2])-Number(match[1])+1))}}]});}}
  };
  vm.createContext(ctx);vm.runInContext(source,ctx);
  return {ctx,props,cache,calls,logs,response};
}
test('legacy AI_API_KEY still works, diagnostics never expose credentials',()=>{
  const {ctx}=setup();const status=ctx.getAppStatus();assert.equal(status.aiConfigured,true);assert.equal(status.searchConfigured,false);assert.ok(!JSON.stringify(status).includes('test-only-key'));assert.equal(status.version,'8.3.0');
});
test('reject fractional, infinite, negative and excessive input before charging API',()=>{
  const {ctx,calls}=setup();for(const values of [{days:2.5},{days:31},{people:-2},{children:-1},{budget:Infinity},{people:49,children:2},{startDate:'2026-02-30'},{travelMode:'<script>'}]){const result=ctx.prepareTrip({...input,...values});assert.equal(result.success,false);assert.equal(result.code,'VALIDATION');}assert.equal(calls.length,0);
});
test('missing key and disabled app return actionable errors without calling APIs',()=>{
  assert.equal(setup({properties:{AI_API_KEY:''}}).ctx.prepareTrip(input).code,'MISSING_KEY');assert.equal(setup({properties:{APP_ENABLED:'false'}}).ctx.prepareTrip(input).code,'PAUSED');
});
test('full pipeline returns all days, sums group costs and never claims verified prices',()=>{
  const {ctx,calls}=setup({properties:{BRAVE_API_KEY:'test-search-key'}});const result=ctx.generateFullPlan(input);assert.equal(result.success,true);assert.equal(result.plan.days.length,3);assert.equal(result.plan.days[0].dailyExpense.total,1200);assert.equal(result.plan.days[2].accommodation,null);assert.equal(result.plan.totalExpense.total,2700);assert.equal(result.plan.totalExpense.remaining,7300);assert.equal(result.priceVerified,false);assert.equal(result.plan.priceVerified,false);assert.equal(result.plan.days[0].activities[2].cost,0);assert.equal(result.plan.days[0].activities[0].sourceIds.length,1);assert.equal(calls.filter(c=>c.url.includes('openrouter')).length,1);
});
test('30 day trip is chunked, complete, and duplicate chunks do not charge again',()=>{
  const {ctx,calls}=setup();const prepared=ctx.prepareTrip({...input,days:30,budget:100000});assert.equal(prepared.success,true);for(let day=1;day<=30;day+=4)assert.equal(ctx.generateTripDays(prepared.ticket,day).success,true);const callCount=calls.length;assert.equal(ctx.generateTripDays(prepared.ticket,1).cached,true);assert.equal(calls.length,callCount);const plan=ctx.completeTrip(prepared.ticket).plan;assert.equal(plan.days.length,30);assert.equal(plan.days[29].dayNumber,30);assert.equal(plan.totalExpense.total,35100);assert.ok(plan.tripTitle.includes('30 วัน'));assert.ok(plan.summary.includes('30 วัน'));
});
test('incomplete JSON or missing days cannot produce a successful partial itinerary',()=>{
  for(const payload of ['{invalid',JSON.stringify(chunk(1,1))]){const {ctx,calls}=setup({fetch:(_,settings,response)=>response(200,{choices:[{finish_reason:'stop',message:{content:payload}}]})});const prepared=ctx.prepareTrip(input);const result=ctx.generateTripDays(prepared.ticket,1);assert.equal(result.success,false);assert.equal(calls.length,2);assert.equal(ctx.completeTrip(prepared.ticket).success,false);}
});
test('activities with overlapping or invalid times are retried and rejected',()=>{
  const bad=chunk();bad.days[0].activities[1].time='08:30';const {ctx}=setup({fetch:(_,settings,response)=>response(200,{choices:[{finish_reason:'stop',message:{content:JSON.stringify(bad)}}]})});const prepared=ctx.prepareTrip(input);assert.equal(ctx.generateTripDays(prepared.ticket,1).code,'INVALID_PLAN');
});
test('last day of an intermediate chunk still requires lodging; correction names the missing day',()=>{
  const bad=chunk(1,4);bad.days[3].accommodation=null;const {ctx,calls}=setup({fetch:(_,settings,response)=>response(200,{choices:[{finish_reason:'stop',message:{content:JSON.stringify(bad)}}]})});const prepared=ctx.prepareTrip({...input,days:5});const result=ctx.generateTripDays(prepared.ticket,1);assert.equal(result.code,'INVALID_PLAN');assert.ok(result.error.includes('วันที่ 4'));const repair=JSON.parse(calls[1].settings.payload);assert.ok(repair.messages[1].content.includes('วันที่ 4'));assert.equal(ctx.completeTrip(prepared.ticket).success,false);
});
test('upstream secret-bearing errors are redacted, credit error is actionable',()=>{
  const {ctx,logs}=setup({fetch:(_,settings,response)=>response(402,'SECRET_KEY test-only-key upstream dump')});const prepared=ctx.prepareTrip(input);const result=ctx.generateTripDays(prepared.ticket,1);assert.equal(result.code,'AI_CREDIT');assert.ok(!JSON.stringify(result).includes('SECRET'));assert.ok(!logs.join('').includes('test-only-key'));
});
test('Brave failures and empty results never imply price verification',()=>{
  const {ctx}=setup({properties:{BRAVE_API_KEY:'test-search-key'},fetch:(url,settings,response)=>url.includes('brave')?response(401,'sensitive-key'):response(200,{})});const prepared=ctx.prepareTrip(input);assert.equal(prepared.success,true);assert.equal(prepared.sources.length,0);assert.ok(prepared.warnings.length>0);
});
test('Brave uses supported search_lang and current trip year; deduplicates sources',()=>{
  const {ctx,calls}=setup({properties:{BRAVE_API_KEY:'test-search-key'}});const prepared=ctx.prepareTrip(input);assert.equal(prepared.sources.length,1);for(const call of calls){const url=new URL(call.url);assert.equal(url.searchParams.get('search_lang'),'th');assert.equal(url.searchParams.get('country'),'ALL');assert.ok(url.searchParams.get('q').includes('2026'));assert.equal(url.searchParams.has('lang'),false);}
});
test('search results for a different province never become itinerary sources',()=>{
  const {ctx}=setup({properties:{BRAVE_API_KEY:'test-search-key'}});const prepared=ctx.prepareTrip({...input,destination:'กาญจนบุรี'});assert.equal(prepared.success,true);assert.equal(prepared.sources.length,0);assert.ok(prepared.warnings.some(w=>w.includes('ผลค้นเว็บไม่ตรง')));assert.equal(ctx.sourceMatchesDestination_({title:'Kanchanaburi travel guide',url:'https://example.com/kanchanaburi'},'กาญจนบุรี'),true);
});
test('persistent daily ceiling survives cache loss and resets on a new Thai date',()=>{
  const {ctx,props,cache,calls}=setup({properties:{MAX_DAILY_AI_REQUESTS:'1'}});const prepared=ctx.prepareTrip({...input,days:5});assert.equal(ctx.generateTripDays(prepared.ticket,1).success,true);assert.equal(ctx.generateTripDays(prepared.ticket,5).code,'DAILY_LIMIT');assert.equal(calls.length,1);cache.clear();assert.throws(()=>ctx.reserveUsage_('AI',1));props.set('TRIP_USAGE_AI',JSON.stringify({date:'2026-10-11',count:999}));assert.doesNotThrow(()=>ctx.reserveUsage_('AI',1));
});
test('budget overruns are truthful, estimates are never scaled to fake affordability',()=>{
  const {ctx}=setup();const result=ctx.generateFullPlan({...input,budget:500});assert.equal(result.success,true);assert.equal(result.plan.totalExpense.total,2700);assert.ok(result.plan.warnings.some(w=>w.includes('เกินงบ')));assert.equal(result.plan.totalExpense.remaining,-2200);
});
test('malformed tickets and chunks fail without requests',()=>{
  const {ctx,calls}=setup();assert.equal(ctx.generateTripDays('../../secret',1).code,'EXPIRED');const prepared=ctx.prepareTrip(input);assert.equal(ctx.generateTripDays(prepared.ticket,2).code,'INVALID_CHUNK');assert.equal(calls.length,0);
});
test('API helper functions remain private to google.script.run',()=>{
  const allowed=new Set(['doGet','getAppStatus','prepareTrip','generateTripDays','completeTrip','generateFullPlan']);for(const match of source.matchAll(/^function (\w+)\(/gm))assert.ok(allowed.has(match[1])||match[1].endsWith('_'),match[1]);
});
