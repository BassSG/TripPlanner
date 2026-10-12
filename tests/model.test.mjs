import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/model.js';
const M=globalThis.TripModel;
const plan=()=>({schemaVersion:2,id:'test-trip',tripTitle:'Trip',destination:'เชียงใหม่',totalBudget:5000,totalTravelers:2,days:[1,2].map(day=>({dayNumber:day,title:'วันที่ '+day,activities:[{title:'อาหารเช้า',time:'08:00',endTime:'09:00',category:'food',cost:100,location:'เชียงใหม่'},{title:'ที่พัก',time:'17:00',endTime:'18:00',category:'hotel',cost:999}],accommodation:{name:'Hotel',pricePerNight:900}})),packingList:['เสื้อ'],sources:[]});
test('import recalculates expenses, excludes duplicate lodging, and final-night stay',()=>{const p=M.normalizePlan(plan());assert.equal(p.totalExpense.total,1100);assert.equal(p.days[1].accommodation,null);assert.equal(p.totalExpense.remaining,3900);});
test('invalid imported data does not silently become an empty successful plan',()=>{for(const value of [{}, {...plan(),days:[]},{...plan(),totalBudget:-1},{...plan(),days:[{activities:[]}]},{...plan(),totalTravelers:100}])assert.throws(()=>M.normalizePlan(value));});
test('import and display prevent HTML and unsafe link injection',()=>{const p=plan();p.tripTitle='<img src=x onerror=alert(1)>';p.sources=[{id:'S1',url:'javascript:alert(1)',title:'bad'}];const result=M.normalizePlan(p);assert.equal(result.sources.length,0);assert.ok(M.escape(result.tripTitle).startsWith('&lt;'));assert.equal(M.safeUrl('https://user:password@example.com'), '');assert.equal(M.safeUrl('javascript:alert(1)'),'');assert.ok(M.mapUrl('" onerror="bad').includes('%22'));});
test('legacy saved plan envelopes migrate without claiming prices verified',()=>{const legacy=plan();delete legacy.schemaVersion;legacy.priceVerified=true;const p=M.normalizePlan({id:123,plan:legacy});assert.equal(p.schemaVersion,2);assert.equal(p.priceVerified,false);assert.ok(p.warnings.some(w=>w.includes('เวอร์ชันก่อน')));});
test('calendar dates cross month and year boundaries without timezone drift',()=>{assert.ok(M.dateForDay('2026-12-31',1).includes('ม.ค.'));assert.ok(M.dateForDay('2026-02-28',1).includes('มี.ค.'));assert.equal(M.dateForDay('',2),'');});
test('copied itinerary includes every day and safe Maps links',()=>{const text=M.planText(M.normalizePlan(plan()));assert.ok(text.includes('วันที่ 1'));assert.ok(text.includes('วันที่ 2'));assert.ok(text.includes('https://www.google.com/maps/search/?api=1&query='));assert.ok(text.includes('ประมาณการ'));});
test('frontend integer and group-size validation matches server expectations',()=>{const input={destination:'กระบี่',origin:'กรุงเทพ',budget:'10000',days:'3',people:'2',children:'0',travelMode:'car'};assert.equal(M.validateInput(input).budget,10000);assert.throws(()=>M.validateInput({...input,days:2.5}));assert.throws(()=>M.validateInput({...input,people:49,children:2}));assert.throws(()=>M.validateInput({...input,startDate:'2026-02-30'}));});
test('selected map coordinates survive validation and saved plans only with matching labels',()=>{
  const input={destination:'กระบี่',origin:'กรุงเทพ',budget:10000,days:3,people:2,children:0,travelMode:'car',originPlace:{label:'กรุงเทพ',lat:13.756331,lng:100.501765},destinationPlace:{label:'กระบี่',lat:8.0863,lng:98.9063}};
  const checked=M.validateInput(input);assert.equal(checked.originPlace.lat,13.756331);assert.equal(checked.destinationPlace.lng,98.9063);
  assert.equal(M.validateInput({...input,destination:'ระยอง'}).destinationPlace,null);
  assert.equal(M.normalizePlace({label:'กรุงเทพ',lng:100},'กรุงเทพ'),null);
  assert.equal(M.normalizePlace({label:'กรุงเทพ',lat:99,lng:100},'กรุงเทพ'),null);
  const saved=M.normalizePlan({...plan(),origin:'กรุงเทพ',originPlace:input.originPlace,destinationPlace:{label:'เชียงใหม่',lat:18.7883,lng:98.9853}});
  assert.equal(saved.originPlace.lng,100.501765);assert.equal(saved.destinationPlace.lat,18.7883);
  assert.ok(M.directionsUrl(saved.origin,saved.destination,saved.originPlace,saved.destinationPlace).includes('origin=13.756331%2C100.501765'));
});
test('saved/imported plans remove unrelated sources and dangling source references',()=>{const p=plan();p.sources=[{id:'S1',title:'Kanchanaburi',url:'https://example.com/kanchanaburi'},{id:'S2',title:'Chiang Mai travel',url:'https://example.com/chiang-mai'}];p.days[0].activities[0].sourceIds=['S1','S2'];const result=M.normalizePlan(p);assert.equal(result.sources.length,1);assert.equal(result.sources[0].id,'S2');assert.deepEqual(result.days[0].activities[0].sourceIds,['S2']);assert.equal(M.sourceMatchesDestination({title:'Tokyo highlights',url:'https://example.com/tokyo'},'โตเกียว ญี่ปุ่น'),true);});

test('calendar reminder fires at 09:00 Bangkok the day before travel, across year and leap boundaries',()=>{
  const now=new Date('2026-12-01T00:00:00Z');
  const ics=M.reminderIcs({...plan(),startDate:'2027-01-01'},now);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.includes('DTSTART:20261231T020000Z\r\n'));
  assert.ok(ics.includes('DTEND:20261231T021500Z\r\n'));
  assert.ok(ics.includes('BEGIN:VALARM\r\nACTION:DISPLAY\r\n'));
  assert.ok(ics.includes('TRIGGER;VALUE=DATE-TIME:20261231T020000Z\r\n'));
  assert.ok(ics.includes('DTSTAMP:20261201T000000Z\r\n'));
  assert.ok(M.reminderIcs({...plan(),startDate:'2028-03-01'},now).includes('DTSTART:20280229T020000Z\r\n'));
});

test('calendar reminder escapes untrusted text and folds Thai UTF-8 lines at 75 octets',()=>{
  const title='ทาง,ทดสอบ;ต่อ\\ท้าย\r\nBEGIN:VTODO\n'+'เชียงใหม่'.repeat(24)+'🛫';
  const ics=M.reminderIcs({...plan(),tripTitle:title,startDate:'2027-02-15'},new Date('2027-01-01T00:00:00Z'));
  const unfolded=ics.replace(/\r\n[ \t]/g,'');
  assert.ok(unfolded.includes('ทาง\\,ทดสอบ\\;ต่อ\\\\ท้าย\\nBEGIN:VTODO\\n'));
  assert.ok(!unfolded.includes('\r\nBEGIN:VTODO'));
  assert.ok(!ics.replace(/\r\n/g,'').includes('\n'));
  for(const line of ics.split('\r\n').filter(Boolean)) assert.ok(Buffer.byteLength(line,'utf8')<=75,'ICS line exceeds 75 UTF-8 bytes');
  assert.equal((unfolded.match(/BEGIN:VALARM/g)||[]).length,1);
});

test('calendar reminder rejects missing, invalid, and already elapsed dates with clear Thai errors',()=>{
  for(const startDate of ['', '2027-02-30', '2027-13-01', '2027-01-1']) {
    assert.throws(()=>M.reminderIcs({...plan(),startDate},new Date('2026-01-01T00:00:00Z')),/วันเริ่มเดินทาง/);
  }
  assert.throws(()=>M.reminderIcs({...plan(),startDate:'2027-01-01'},new Date('2026-12-31T02:00:00Z')),/ผ่านไปแล้ว/);
  assert.throws(()=>M.reminderIcs({...plan(),startDate:'2027-01-01'},new Date('invalid')),/เวลาปัจจุบัน/);
});
