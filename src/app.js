(function () {
  'use strict';
  const C = window.TRIP_APP_CONFIG;
  const M = window.TripModel;
  const $ = id => document.getElementById(id);
  const esc = M.escape;
  const paths = {
    compass:'<circle cx="12" cy="12" r="9"/><path d="m8 16 2-6 6-2-2 6Z"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/>',
    navigation:'<path d="m21 3-7 18-3-8-8-3Z"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4Z"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 2.5M12 17h.01"/>',
    settings:'<path d="m10 3-.5 2-2 1-2-.5L3 9l1.5 1.5v3L3 15l2.5 3.5 2-.5 2 1 .5 2h4l.5-2 2-1 2 .5L21 15l-1.5-1.5v-3L21 9l-2.5-3.5-2 .5-2-1-.5-2Z"/><circle cx="12" cy="12" r="3"/>',
    sparkles:'<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6ZM20 2v4M18 4h4"/>',
    route:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/>',
    wallet:'<path d="M20 7H5a2 2 0 0 1 0-4h13v4M5 7H3v13h17V7Z"/><path d="M20 11h-6v5h6M17 13.5h.01"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 6"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
    'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    cloud:'<path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10Z"/>',
    car:'<path d="m5 8 2-4h10l2 4M3 9h18v9H3ZM5 18v3M19 18v3M6 13h2M16 13h2M3 9l2-1h14l2 1"/>',
    train:'<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 10h14M9 3v7M15 3v7M8 14h.01M16 14h.01M8 18l-3 4M16 18l3 4M7 21h10"/>',
    plane:'<path d="m22 2-8 20-3-9L2 10Z"/><path d="m11 13 6-6"/>',
    bike:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-10 7 10H5M16 4h3l-2 13M8 7h5"/>',
    edit:'<path d="m16 3 5 5-12 12H4v-5ZM14 5l5 5"/>',
    share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-4m-6 8 6 4"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m21 16-6-6-12 11"/>',
    print:'<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7ZM17 11h.01"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    trash:'<path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    hotel:'<path d="M3 21V4h12v17M15 10h6v11M7 8h.01M11 8h.01M7 12h.01M11 12h.01M7 16h.01M11 16h.01M18 14h.01M18 18h.01M1 21h22"/>',
    food:'<path d="M5 3v7m-3-7v5a3 3 0 0 0 6 0V3M5 11v10M18 3c-4 0-4 10 0 10h2V3ZM20 13v8"/>',
    coffee:'<path d="M3 9h13v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM16 10h2a3 3 0 0 1 0 6h-2M5 3v3M10 2v4M14 3v3"/>',
    attraction:'<path d="m2 8 10-5 10 5ZM4 8v12M9 8v12M15 8v12M20 8v12M2 21h20"/>',
    activity:'<path d="m3 21 8-16 10 16ZM8 21l6-11M3 21h18"/>',
    transport:'<path d="m5 8 2-4h10l2 4M3 9h18v9H3ZM5 18v3M19 18v3M6 13h2M16 13h2"/>',
    shopping:'<path d="M4 8h16l-1 13H5ZM8 8V6a4 4 0 0 1 8 0v2"/>',
    bag:'<rect x="5" y="5" width="14" height="16" rx="3"/><path d="M9 5V3h6v2M9 5v16M15 5v16M8 23h.01M16 23h.01"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>'
  };
  function icon(name) {return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.activity) + '</svg>';}
  function hydrateIcons(parent = document) {parent.querySelectorAll('[data-icon]').forEach(el => {el.innerHTML = icon(el.dataset.icon);});}
  const state = {view:'planner',plan:null,activeDay:0,saved:[],interests:new Set(),busy:false,generation:0,resume:null,backend:null,storageRaw:'',storageNotice:'',imageUrl:'',installPrompt:null,locationUrl:'',locationRequest:0,originPlace:null,destinationPlace:null};
  const savedKey = 'tripplanner:v8:plans';
  const draftKey = 'tripplanner:v8:draft';
  let toastTimer, elapsedTimer, connectionPromise, connectionWindow, connectionOrigin, connectionNonce, bridgeFrame;
  const pending = new Map();
  const direct = !!(window.google && window.google.script && window.google.script.run);
  const channel = 'tripplanner-rpc-v1';
  function storageGet(key) {try {return localStorage.getItem(key);} catch {state.storageNotice = 'เบราว์เซอร์ไม่อนุญาตพื้นที่จัดเก็บ กรุณาส่งออก JSON เพื่อเก็บแผน'; return null;}}
  function storageSet(key,value) {try {localStorage.setItem(key,value); return true;} catch {state.storageNotice = 'บันทึกในเบราว์เซอร์ไม่สำเร็จ พื้นที่อาจเต็ม กรุณาส่งออก JSON เพื่อสำรองแผน'; return false;}}
  function notice(message,error = false) {clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.toggle('error',error);$('toast').hidden=false;toastTimer=setTimeout(() => {$('toast').hidden=true;},5500);}
  function uuid() {return crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)),b => b.toString(16).padStart(2,'0')).join('');}
  let clientId = storageGet('tripplanner:v8:client');
  if (!clientId || !/^[a-zA-Z0-9_-]{16,80}$/.test(clientId)) {clientId=uuid();storageSet('tripplanner:v8:client',clientId);}

  function readSaved() {
    const raw = storageGet(savedKey);
    if (raw) {
      try {
        const value = JSON.parse(raw);
        if (!Array.isArray(value)) throw new Error('storage');
        value.slice(0,C.maxSavedPlans).forEach(item => {try {state.saved.push(M.normalizePlan(item));} catch {state.storageRaw=raw;state.storageNotice='แผนบางรายการอ่านไม่ได้ ข้อมูลเดิมยังเก็บไว้ กรุณาดาวน์โหลดสำรอง';}});
      } catch {state.storageRaw=raw;state.storageNotice='ข้อมูลที่บันทึกไว้อ่านไม่ได้ ข้อมูลเดิมยังเก็บไว้ กรุณาดาวน์โหลดสำรอง';}
    }
    const legacy = storageGet('tripPlans');
    if (legacy && !storageGet('tripplanner:v8:migrated')) {
      try {
        const values = JSON.parse(legacy);
        if (Array.isArray(values)) values.slice(0,30).forEach(item => {
          try {const plan=M.normalizePlan(item);plan.id='legacy-'+String(item.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60);if(!state.saved.some(p => p.id===plan.id))state.saved.push(plan);}catch {/* Preserve legacy data in its original key. */}
        });
        if (persistSaved()) storageSet('tripplanner:v8:migrated','1');
      } catch {state.storageNotice='ข้อมูลแผนเวอร์ชันเดิมอ่านไม่ได้ แต่ยังอยู่ในพื้นที่จัดเก็บเดิม';}
    }
    updateSavedCount();
  }
  function persistSaved() {
    if (state.storageRaw && !storageSet('tripplanner:v8:recovery',state.storageRaw)) return false;
    const ok=storageSet(savedKey,JSON.stringify(state.saved.slice(0,C.maxSavedPlans)));
    updateSavedCount();return ok;
  }
  function updateSavedCount() {$('savedCount').textContent=state.saved.length;}
  function savePlan(plan) {
    const before=state.saved.slice();
    state.saved=state.saved.filter(p => p.id!==plan.id);state.saved.unshift(plan);
    if(state.saved.length>C.maxSavedPlans){const archive=JSON.stringify(state.saved.slice(C.maxSavedPlans));if(!storageSet('tripplanner:v8:archive:'+Date.now(),archive)){state.saved=before;$('savedState').innerHTML=icon('info')+'ยังไม่ได้บันทึก กรุณาส่งออก JSON';notice(state.storageNotice,true);return false;}state.saved=state.saved.slice(0,C.maxSavedPlans);}
    const ok=persistSaved();
    $('savedState').innerHTML=icon(ok?'check':'info')+esc(ok?'บันทึกในอุปกรณ์นี้แล้ว':'ยังไม่ได้บันทึก กรุณาส่งออก JSON');
    if(!ok) notice(state.storageNotice,true);
    return ok;
  }
  function formInput() {
    return {origin:$('atDestination').checked?'อยู่ที่ปลายทางแล้ว':$('origin').value,destination:$('destination').value,
      originPlace:$('atDestination').checked?null:state.originPlace,destinationPlace:state.destinationPlace,
      startDate:$('startDate').value,days:$('days').value,budget:$('budget').value,people:$('people').value,children:$('children').value,
      travelMode:document.querySelector('input[name="travelMode"]:checked').value,
      preferences:[...state.interests,$('preferences').value].filter(Boolean).join(' · '),clientId};
  }
  function updatePreview() {
    const input=formInput();const budget=Number(input.budget)||0,people=(Number(input.people)||0)+(Number(input.children)||0),days=Number(input.days)||0;
    $('previewOrigin').textContent=$('atDestination').checked?'อยู่ที่ปลายทาง':input.origin||'จุดเริ่มต้น';
    $('previewDestination').textContent=input.destination||'จุดหมายที่คุณเลือก';
    $('previewDays').textContent=M.fmt(days)+' วัน';$('previewPeople').textContent=M.fmt(people)+' คน';
    $('previewBudget').textContent=M.fmt(budget);$('previewPerPerson').textContent=people>0?'เฉลี่ย ฿'+M.fmt(Math.round(budget/people))+' / คน':'เพิ่มผู้ร่วมเดินทาง';
    $('origin').disabled=$('atDestination').checked;
    document.querySelectorAll('[data-place-open="origin"],[data-place-current="origin"]').forEach(button=>{button.disabled=$('atDestination').checked;});
    ['origin','destination'].forEach(key=>{const place=state[key+'Place'];const hint=$(key+'PlaceHint');hint.textContent=place?'✓ เลือกจุดบนแผนที่แล้ว · '+place.lat.toFixed(5)+', '+place.lng.toFixed(5):key==='origin'?'พิมพ์ชื่อสถานที่ หรือเลือกตำแหน่งที่แน่นอน':'ค้นชื่อสถานที่หรือจิ้มจุดหมายบนแผนที่';hint.classList.toggle('chosen',!!place);});
  }
  function saveDraft() {const value={...formInput(),origin:$('origin').value,originPlace:state.originPlace,preferences:$('preferences').value,interests:[...state.interests],atDestination:$('atDestination').checked};delete value.clientId;storageSet(draftKey,JSON.stringify(value));}
  function restoreDraft() {
    try {const value=JSON.parse(storageGet(draftKey)||'null');if(!value)return;
      ['origin','destination','startDate','days','budget','people','children','preferences'].forEach(key => {if(typeof value[key]==='string'||typeof value[key]==='number')$(key).value=value[key];});
      const mode=[...document.querySelectorAll('input[name="travelMode"]')].find(el=>el.value===value.travelMode);if(mode)mode.checked=true;
      $('atDestination').checked=value.atDestination===true;
      state.originPlace=M.normalizePlace(value.originPlace,$('origin').value);
      state.destinationPlace=M.normalizePlace(value.destinationPlace,$('destination').value);
      state.interests=new Set(Array.isArray(value.interests)?value.interests.filter(v=>typeof v==='string'):[]);
      document.querySelectorAll('[data-interest]').forEach(button=>button.setAttribute('aria-pressed',String(state.interests.has(button.dataset.interest))));
    }catch {/* Defaults remain usable if a draft was corrupted. */}
  }
  function setView(view) {
    state.view=view;$('plannerView').hidden=view!=='planner';$('savedView').hidden=view!=='saved';
    $('pageCrumb').textContent=view==='saved'?'ทริปที่บันทึกไว้':'วางแผนทริป';
    document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);if(el.tagName==='BUTTON'){if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');}});
    if(view==='saved')renderSaved();window.scrollTo({top:0,behavior:'smooth'});
  }
  function screen(name) {['formScreen','loadingScreen','resultScreen'].forEach(id=>{$(id).hidden=id!==name;});}

  window.addEventListener('message', event => {
    const message=event.data;
    if(!message||message.channel!==channel||message.nonce!==connectionNonce||!/^https:\/\/(?:[a-z0-9-]+\.)?googleusercontent\.com$/.test(event.origin)&&event.origin!=='https://script.google.com')return;
    if(message.ready===true&&pending.has('__connect')){
      connectionWindow=event.source;connectionOrigin=event.origin;
      const request=pending.get('__connect');pending.delete('__connect');clearTimeout(request.timer);request.resolve();return;
    }
    if(event.source!==connectionWindow||event.origin!==connectionOrigin||typeof message.id!=='string')return;
    const request=pending.get(message.id);if(!request)return;pending.delete(message.id);clearTimeout(request.timer);
    if(message.error)request.reject(new Error(message.error));else request.resolve(message.result);
  });
  function rpc(method,args=[]) {
    return new Promise((resolve,reject)=>{
      const id=uuid();const timer=setTimeout(()=>{pending.delete(id);reject(new Error('GAS ใช้เวลานานกว่าที่คาดไว้ คุณสามารถลองสร้างต่อได้ คำขอเดิมอาจยังทำงานอยู่'));},C.requestTimeoutMs);
      pending.set(id,{resolve,reject,timer});
      const success=value=>{clearTimeout(timer);pending.delete(id);resolve(value);};
      const failure=()=>{clearTimeout(timer);pending.delete(id);reject(new Error('เชื่อมต่อ GAS ไม่สำเร็จ กรุณาลองใหม่'));};
      if(direct){const runner=google.script.run.withSuccessHandler(success).withFailureHandler(failure);
        if(method==='getAppStatus')runner.getAppStatus();
        else if(method==='prepareTrip')runner.prepareTrip(args[0]);
        else if(method==='generateTripDays')runner.generateTripDays(args[0],args[1]);
        else if(method==='completeTrip')runner.completeTrip(args[0]);
        else failure();
      }else if(connectionWindow){connectionWindow.postMessage({channel,nonce:connectionNonce,id,method,args},connectionOrigin);}
      else failure();
    });
  }
  async function connect(force=false) {
    if(!navigator.onLine)throw new Error('คุณกำลังออฟไลน์ เปิดแผนเดิมได้ แต่สร้างแผนใหม่ต้องใช้อินเทอร์เน็ต');
    if(connectionPromise&&!force)return connectionPromise;
    connectionPromise=(async()=>{
      $('backendLabel').textContent='กำลังเชื่อมต่อ';$('backendDot').className='status-dot warning';
      if(!direct&&(!connectionWindow||force)){
        if(bridgeFrame)bridgeFrame.remove();connectionWindow=null;connectionOrigin=null;
        connectionNonce=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
        const url=new URL(C.gasUrl);
        if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/(exec|dev)$/.test(url.pathname))throw new Error('GAS URL ใน app-config.js ไม่ถูกต้อง');
        url.searchParams.set('bridge','1');url.searchParams.set('origin',location.origin);url.searchParams.set('nonce',connectionNonce);
        const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete('__connect');reject(new Error('ยังเชื่อมต่อ GAS ไม่ได้ กรุณาลองใหม่ หรือเปิดผ่าน GAS โดยตรง'));},C.connectTimeoutMs);pending.set('__connect',{resolve,reject,timer});});
        bridgeFrame=document.createElement('iframe');bridgeFrame.title='การเชื่อมต่อ TripPlanner';bridgeFrame.hidden=true;bridgeFrame.setAttribute('aria-hidden','true');bridgeFrame.src=url.href;document.body.append(bridgeFrame);
        await ready;
      }
      const status=await rpc('getAppStatus');
      if(!status||!status.success)throw new Error('GAS ยังไม่พร้อมใช้งาน');state.backend=status;
      $('backendDot').className='status-dot'+(!status.aiConfigured||!status.enabled?' warning':'');
      $('backendLabel').textContent=!status.enabled?'พักสร้างแผนใหม่':status.aiConfigured?'GAS พร้อมใช้งาน':'ยังไม่ตั้งค่าคีย์ AI';
      if(!status.aiConfigured){$('connectionMessage').textContent='ยังไม่ได้ตั้งค่าคีย์ AI ใน GAS เปิดการเชื่อมต่อ & API เพื่อดูรายการตั้งค่า';$('connectionBanner').hidden=false;}
      else if(!status.enabled){$('connectionMessage').textContent='เจ้าของแอปพักการสร้างแผนใหม่ แผนที่บันทึกแล้วยังเปิดอ่านได้';$('connectionBanner').hidden=false;}
      else $('connectionBanner').hidden=true;
      return status;
    })();
    try{return await connectionPromise;}catch(error){connectionPromise=null;state.backend=null;$('backendDot').className='status-dot error';$('backendLabel').textContent='ยังเชื่อมต่อไม่ได้';$('connectionMessage').textContent=error.message;$('connectionBanner').hidden=false;throw error;}
  }
  function checkedResult(value) {if(!value||!value.success){const error=new Error(value&&value.error||'GAS ไม่ได้ส่งผลลัพธ์ที่สมบูรณ์');error.code=value&&value.code;throw error;}return value;}
  function updateNetwork() {
    $('networkLabel').textContent=navigator.onLine?'ออนไลน์':'ออฟไลน์';$('networkPill').querySelector('.status-dot').className='status-dot'+(navigator.onLine?'':' warning');
    if(!navigator.onLine){$('connectionMessage').textContent='คุณกำลังออฟไลน์ แผนที่บันทึกไว้ยังเปิดอ่านได้ การสร้างแผนใหม่และ Maps ต้องใช้อินเทอร์เน็ต';$('connectionBanner').hidden=false;}
  }
  function step(id,kind) {$(id).className='loading-step '+kind;}
  async function generate(event) {
    event.preventDefault();if(state.busy)return;
    let params;try{params=M.validateInput(formInput());}catch(error){$('formError').textContent=error.message;$('formError').hidden=false;return;}
    if(!navigator.onLine){$('formError').textContent='กรุณาเชื่อมต่ออินเทอร์เน็ตเพื่อสร้างแผนใหม่ ทริปที่บันทึกไว้ยังเปิดอ่านได้';$('formError').hidden=false;return;}
    $('formError').hidden=true;state.busy=true;const generation=++state.generation;
    const signature=JSON.stringify(params);saveDraft();setView('planner');screen('loadingScreen');
    $('generateBtn').disabled=true;$('generateLabel').textContent='กำลังสร้างแผน…';
    $('loadingDestination').textContent=params.destination+' · '+params.days+' วัน · '+(params.people+params.children)+' คน';
    step('stepResearch','current');step('stepPlan','');step('stepFinish','');$('loadingProgress').max=params.days;$('loadingProgress').value=0;
    $('loadingDetail').textContent='กำลังเชื่อมต่อและค้นข้อมูลประกอบ';const began=Date.now();
    clearInterval(elapsedTimer);elapsedTimer=setInterval(()=>{$('loadingElapsed').textContent='ใช้เวลาแล้ว '+Math.floor((Date.now()-began)/1000)+' วินาที · ทริปยาวจะใช้เวลามากขึ้น';},1000);
    try {
      await connect();if(generation!==state.generation)return;
      let prepared;
      if(state.resume&&state.resume.signature===signature){prepared=state.resume.prepared;$('loadingDetail').textContent='กำลังสร้างต่อจากข้อมูลเดิม';}
      else {prepared=checkedResult(await rpc('prepareTrip',[params]));state.resume={signature,prepared};}
      if(generation!==state.generation)return;
      step('stepResearch','done');step('stepPlan','current');
      for(let start=1;start<=params.days;start+=prepared.chunkDays){
        if(generation!==state.generation)return;
        const end=Math.min(start+prepared.chunkDays-1,params.days);$('loadingDetail').textContent='กำลังวางเส้นทางวันที่ '+start+'–'+end+' จากทั้งหมด '+params.days+' วัน';
        checkedResult(await rpc('generateTripDays',[prepared.ticket,start]));
        if(generation!==state.generation)return;$('loadingProgress').value=end;
      }
      step('stepPlan','done');step('stepFinish','current');$('loadingDetail').textContent='กำลังรวมแผนและคำนวณค่าใช้จ่ายทั้งกลุ่ม';
      const result=checkedResult(await rpc('completeTrip',[prepared.ticket]));if(generation!==state.generation)return;
      state.plan=M.normalizePlan(result.plan);state.activeDay=0;state.resume=null;step('stepFinish','done');renderPlan();savePlan(state.plan);screen('resultScreen');$('resultTitle').focus();$('resultScreen').scrollIntoView({block:'start',behavior:'auto'});notice('แผนทริปพร้อมแล้ว ตรวจรายละเอียดก่อนเดินทางได้เลย');
    }catch(error){if(generation!==state.generation)return;if(error.code==='EXPIRED'||error.code==='INVALID_CHUNK')state.resume=null;screen('formScreen');$('formError').textContent=error.message;$('formError').hidden=false;$('formError').scrollIntoView({block:'center',behavior:'smooth'});}
    finally{if(generation===state.generation){state.busy=false;clearInterval(elapsedTimer);$('generateBtn').disabled=false;$('generateLabel').textContent=state.resume?'ลองสร้างแผนต่อ':'สร้างแผนทริปของฉัน';}}
  }
  function stopGeneration() {
    if(!state.busy)return;state.generation++;state.busy=false;clearInterval(elapsedTimer);$('generateBtn').disabled=false;$('generateLabel').textContent=state.resume?'ลองสร้างแผนต่อ':'สร้างแผนทริปของฉัน';screen('formScreen');notice('หยุดส่งคำขอวันถัดไปแล้ว คำขอที่ส่งไปยังอาจทำงานต่อ');
  }

  function renderPlan() {
    const p=state.plan;if(!p)return;$('resultTitle').textContent=p.tripTitle;$('resultSummary').textContent=p.summary;
    $('resultOrigin').textContent=p.origin;$('resultDestination').textContent=p.destination;
    $('resultDirections').hidden=p.origin==='อยู่ที่ปลายทางแล้ว';
    if(!$('resultDirections').hidden)$('resultDirections').href=M.directionsUrl(p.origin,p.destination,p.originPlace,p.destinationPlace);
    const dateRange=p.startDate?M.dateForDay(p.startDate,0)+(p.days.length>1?' – '+M.dateForDay(p.startDate,p.days.length-1):''):'เลือกวันเดินทางภายหลังได้';
    $('resultHeroMeta').innerHTML='<span>'+icon('calendar')+esc(p.days.length+' วัน · '+dateRange)+'</span><span>'+icon('users')+esc(p.totalTravelers+' คน')+'</span>';
    const expense=p.totalExpense,used=p.totalBudget>0?Math.round(expense.total/p.totalBudget*100):100;
    $('resultHeroEstimate').textContent='฿'+M.fmt(expense.total);
    $('resultHeroBudgetLine').textContent='จากงบที่ตั้งไว้ ฿'+M.fmt(p.totalBudget);
    $('resultHeroMeter').setAttribute('aria-valuenow',String(Math.min(100,Math.max(0,used))));
    $('resultHeroMeter').setAttribute('aria-valuetext',used+'% ของงบที่ตั้งไว้');
    $('resultHeroMeterFill').style.width=Math.min(100,Math.max(0,used))+'%';
    $('resultHeroBalance').textContent=(expense.remaining<0?'เกินงบ ':'เหลืองบ ' )+'฿'+M.fmt(Math.abs(expense.remaining));
    $('resultHeroBalance').classList.toggle('over',expense.remaining<0);
    $('planWarnings').innerHTML=p.warnings.map(w=>'<div class="notice">'+esc(w)+'</div>').join('');
    const stops=p.days.reduce((count,day)=>count+day.activities.length,0);
    const items=[['calendar','ระยะเวลา',p.days.length+' วัน',dateRange],['users','ผู้ร่วมเดินทาง',p.totalTravelers+' คน','ค่าใช้จ่ายคิดรวมทั้งกลุ่ม'],['pin','จุดแวะในแผน',stops+' แห่ง','จัดลำดับเส้นทางตามวัน']];
    $('tripStats').innerHTML=items.map(item=>'<div class="stat"><span class="stat-icon">'+icon(item[0])+'</span><div><span class="stat-label">'+esc(item[1])+'</span><strong>'+esc(item[2])+'</strong><small>'+esc(item[3])+'</small></div></div>').join('');
    $('dayTabs').innerHTML=p.days.map((day,i)=>'<button class="day-tab" id="dayTab-'+i+'" role="tab" aria-controls="dayPanel-'+i+'" aria-selected="'+(i===state.activeDay)+'" tabindex="'+(i===state.activeDay?'0':'-1')+'" data-day="'+i+'">วันที่ '+day.dayNumber+(p.startDate?'<small>'+esc(M.dateForDay(p.startDate,i))+'</small>':'')+'</button>').join('');
    $('dayPanels').innerHTML=p.days.map((day,i)=>renderDay(day,i)).join('');renderBudget();renderPacking();renderNotes();renderSources();
    const saved=state.saved.some(v=>v.id===p.id);$('savedState').innerHTML=icon(saved?'check':'info')+esc(saved?'บันทึกในอุปกรณ์นี้แล้ว':'พร้อมส่งออกหรือบันทึกแผน');
  }
  function renderDay(day,index) {
    const activities=day.activities.map((a,stop)=>'<article class="activity-card"><div class="activity-time"><span class="activity-stop">'+String(stop+1).padStart(2,'0')+'</span><strong>'+esc(a.time)+'</strong><small>'+esc(a.endTime)+'</small></div><div class="activity-body"><div class="activity-top"><span class="category-tag '+a.category+'">'+icon(a.category)+esc(M.categories[a.category])+'</span><span class="cost-tag">'+(a.cost===0?'ไม่มีค่าใช้จ่ายเพิ่ม':'฿'+M.fmt(a.cost))+'</span></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.description)+'</p><div class="activity-meta"><a href="'+esc(M.mapUrl(a.mapQuery))+'" target="_blank" rel="noopener noreferrer">'+icon('pin')+esc(a.location)+' ↗</a><span>'+esc(a.costNote||'ยอดประมาณการทั้งกลุ่ม')+'</span></div>'+(a.tips?'<div class="activity-tip">'+icon('info')+esc(a.tips)+'</div>':'')+(a.sourceIds.length?'<div class="source-ref">ข้อมูลประกอบ: '+a.sourceIds.map(s=>'<a href="#source-'+esc(s)+'">'+esc(s)+'</a>').join(' · ')+'</div>':'')+'</div></article>').join('');
    const a=day.accommodation;const stay=a?'<div class="hotel-card">'+icon('hotel')+'<div><span class="eyebrow muted">STAY FOR THE NIGHT</span><h3>'+esc(a.name)+'</h3><p>'+esc(a.highlights)+'</p><a href="'+esc(M.mapUrl(a.mapQuery))+'" target="_blank" rel="noopener noreferrer">ดูที่พักใน Google Maps ↗</a></div><span class="hotel-cost"><strong>฿'+M.fmt(a.pricePerNight)+'</strong>/ คืน ทั้งกลุ่ม</span></div>':'';
    const first=day.activities[0],last=day.activities[day.activities.length-1];
    const timeRange=first&&last?first.time+' – '+last.endTime:'';
    const dayMeta=day.activities.length+' จุดแวะ'+(timeRange?' · '+timeRange:'');
    return '<section class="day-panel" id="dayPanel-'+index+'" role="tabpanel" aria-labelledby="dayTab-'+index+'" '+(index!==state.activeDay?'hidden':'')+'><div class="day-heading"><div class="day-heading-copy"><span class="day-kicker">วันที่ '+String(day.dayNumber).padStart(2,'0')+' / '+state.plan.days.length+(state.plan.startDate?' · '+esc(M.dateForDay(state.plan.startDate,index)):'')+'</span><h2>'+esc(day.title||'วันที่ '+day.dayNumber)+'</h2><p>'+esc(day.theme)+'</p><span class="day-activity-count">'+icon('route')+esc(dayMeta)+'</span></div><div class="daily-total">ประมาณการวันนี้<strong>฿'+M.fmt(day.dailyExpense.total)+'</strong><small>ทั้งกลุ่ม</small></div></div><div class="timeline">'+activities+'</div>'+stay+'</section>';
  }
  function setDay(index,focus=false) {
    if(!state.plan||index<0||index>=state.plan.days.length)return;state.activeDay=index;
    document.querySelectorAll('[data-day]').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
    document.querySelectorAll('.day-panel').forEach((panel,i)=>{panel.hidden=i!==index;});if(focus)$('dayTab-'+index).focus();
    $('dayNavigation').scrollIntoView({block:'start',behavior:'auto'});
  }
  function renderBudget() {
    const p=state.plan,e=p.totalExpense;const used=p.totalBudget>0?Math.min(100,Math.round(e.total/p.totalBudget*100)):100;
    const labels={food:'อาหาร & คาเฟ่',transport:'การเดินทาง',attractions:'เที่ยวชม & กิจกรรม',accommodation:'ที่พัก',miscellaneous:'ช้อปปิ้ง & อื่น ๆ'};
    $('budgetPanel').innerHTML='<h3>งบประมาณของทริป'+icon('wallet')+'</h3><div class="budget-ring" style="--used:'+used+'%"><div><small>ประมาณการทั้งกลุ่ม</small><strong>฿'+M.fmt(e.total)+'</strong><small>จากงบ ฿'+M.fmt(p.totalBudget)+'</small></div></div>'+Object.keys(labels).map(k=>'<div class="budget-line"><span>'+labels[k]+'</span><strong>฿'+M.fmt(e[k])+'</strong></div>').join('')+'<div class="budget-line total"><span>รวมทั้งหมด</span><strong>฿'+M.fmt(e.total)+'</strong></div><div class="budget-line remaining '+(e.remaining<0?'over':'')+'"><span>'+(e.remaining<0?'เกินงบ':'งบคงเหลือ')+'</span><strong>฿'+M.fmt(Math.abs(e.remaining))+'</strong></div><p class="price-note">'+esc(p.priceNote)+'<br>ควรตรวจราคา เวลาเปิด และเส้นทางอีกครั้งก่อนออกเดินทาง</p>';
  }
  function renderPacking() {
    const p=state.plan,packed=new Set(p.packedItems);
    let reminderUi='';
    if(p.startDate){try{M.reminderIcs(p);reminderUi='<div class="calendar-reminder"><button class="button secondary" data-action="calendar-reminder">'+icon('calendar')+'เพิ่มเตือนก่อนทริปในปฏิทิน</button><small>เตือน 09:00 น. ก่อนเดินทาง 1 วัน · เปิดไฟล์ในแอปปฏิทินเพื่อยืนยัน</small></div>';}catch(error){reminderUi='<div class="calendar-reminder"><small>'+esc(error.message)+'</small></div>';}}
    $('packingPanel').innerHTML='<h3>พร้อมออกเดินทาง'+icon('bag')+'</h3>'+(p.packingList.length?p.packingList.map((item,index)=>'<label class="packing-item"><input type="checkbox" data-packed="'+index+'" '+(packed.has(item)?'checked':'')+'><span>'+esc(item)+'</span></label>').join(''):'<p class="small muted">ยังไม่มีรายการจัดกระเป๋าในแผนนี้</p>')+'<div class="packing-progress">เตรียมแล้ว '+p.packingList.filter(v=>packed.has(v)).length+' / '+p.packingList.length+' รายการ</div>'+reminderUi;
  }
  function renderNotes() {
    const p=state.plan;const section=(title,values)=>values.length?'<div class="panel travel-note-panel"><h3>'+esc(title)+'</h3><ul>'+values.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul></div>':'';
    $('travelNotes').innerHTML='<div class="travel-note-grid">'+section('เคล็ดลับให้เที่ยวคุ้มขึ้น',p.moneyTips)+section('ก่อนออกเดินทาง',p.importantNotes)+'</div>'+(p.weatherInfo?'<div class="panel travel-note-panel"><h3>อากาศ & ช่วงเวลาเดินทาง</h3><p>'+esc(p.weatherInfo)+'</p>'+(p.bestTimeToVisit?'<p>'+esc(p.bestTimeToVisit)+'</p>':'')+'<p class="small muted">ข้อมูลตามฤดูกาลจาก AI ควรตรวจพยากรณ์จริงใกล้วันเดินทาง</p></div>':'')+section('แอปที่มีประโยชน์',p.usefulApps.map(a=>a.name+' — '+a.purpose));
  }
  function renderSources() {
    const p=state.plan;$('sourcesPanel').innerHTML='<h3>แหล่งข้อมูลประกอบทริป</h3><p class="sources-intro">ผลค้นเว็บช่วยประกอบการวางแผน ราคาและรายละเอียดอาจเปลี่ยนแปลง การมีแหล่งข้อมูลไม่ได้หมายถึงยืนยันราคาแล้ว</p>'+(p.sources.length?'<ol class="source-list">'+p.sources.map(s=>'<li id="source-'+esc(s.id)+'"><span class="source-number">'+esc(s.id)+'</span><div><a href="'+esc(M.safeUrl(s.url))+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a><small>'+esc(new URL(s.url).hostname)+(s.retrievedAt?' · ค้นเมื่อ '+esc(new Date(s.retrievedAt).toLocaleDateString('th-TH')):'')+'</small></div></li>').join('')+'</ol>':'<p class="small muted">แผนนี้ไม่มีแหล่งข้อมูลเว็บประกอบ ใช้ความรู้ของ AI และราคาโดยประมาณ</p>');
  }
  function renderSaved() {
    const term=$('savedSearch').value.trim().toLocaleLowerCase('th-TH');const plans=state.saved.filter(p=>(p.tripTitle+' '+p.destination).toLocaleLowerCase('th-TH').includes(term));
    $('storageNotice').hidden=!state.storageNotice;$('storageNotice').textContent=state.storageNotice;
    if(state.storageRaw){const button=document.createElement('button');button.className='text-button';button.textContent='ดาวน์โหลดข้อมูลเดิม';button.dataset.action='recover-storage';$('storageNotice').append(button);}
    $('savedList').innerHTML=plans.length?plans.map(p=>'<article class="panel saved-card"><span class="saved-destination">'+icon('pin')+esc(p.destination)+'</span><button class="icon-button" data-delete="'+esc(p.id)+'" aria-label="ลบทริป '+esc(p.tripTitle)+'">'+icon('trash')+'</button><h3>'+esc(p.tripTitle)+'</h3><p>'+esc(p.summary.slice(0,120))+'</p><span class="saved-date">'+esc(new Date(p.createdAt).toLocaleDateString('th-TH'))+'</span><div class="saved-card-meta"><span>'+p.days.length+' วัน</span><span>'+p.totalTravelers+' คน</span><span>งบ ฿'+M.fmt(p.totalBudget)+'</span></div><button class="button secondary" data-open="'+esc(p.id)+'">เปิดแผนทริป '+icon('arrow-right')+'</button></article>').join(''):'<div class="empty-state">'+icon('bookmark')+'<h3>'+(term?'ยังไม่พบทริปที่ค้นหา':'เก็บทริปแรกของคุณไว้ที่นี่')+'</h3><p>'+(term?'ลองค้นชื่อทริปหรือจุดหมายอื่น':'สร้างแผนใหม่แล้วเราจะบันทึกให้อัตโนมัติ<br>หรือเพิ่มแผนจากไฟล์ JSON ที่เคยส่งออก')+'</p><button class="button primary" data-view="planner">วางแผนทริป '+icon('arrow-right')+'</button><button class="button ghost" data-action="import">นำเข้าแผน</button></div>';
  }
  function openSaved(id) {if(state.busy){notice('กำลังสร้างแผนใหม่ กรุณารอหรือหยุดสร้างวันถัดไปก่อน');return;}const p=state.saved.find(v=>v.id===id);if(!p)return;state.plan=p;state.activeDay=0;renderPlan();screen('resultScreen');setView('planner');$('resultTitle').focus();$('resultScreen').scrollIntoView({block:'start',behavior:'auto'});}

  function dialog(title,html) {$('dialogTitle').textContent=title;$('dialogBody').innerHTML=html;if(!$('appDialog').open)$('appDialog').showModal();}
  function closeDialog() {if($('appDialog').open)$('appDialog').close();}
  function showConnection() {
    const s=state.backend;
    const status=!navigator.onLine?'กำลังออฟไลน์':!s?'ยังเชื่อมต่อ GAS ไม่ได้':!s.enabled?'พักการสร้างแผนใหม่':s.aiConfigured?'เชื่อมต่อ GAS แล้ว พบคีย์ AI':'เชื่อมต่อ GAS แล้ว ยังไม่มีคีย์ AI';
    const rows=[['OPENROUTER_API_KEY','คีย์ AI หลัก (ยังรองรับ AI_API_KEY เดิม)',s?s.aiConfigured?'พบคีย์':'ยังไม่มี':'ยังตรวจไม่ได้'],['BRAVE_API_KEY','ค้นเว็บประกอบแผน ไม่บังคับ',s?s.searchConfigured?'พบคีย์':'ไม่ได้เปิด':'ยังตรวจไม่ได้'],['AI_MODEL','โมเดล OpenRouter',s?s.model:'ดูค่าเริ่มต้นใน Code.gs'],['MAX_DAILY_AI_REQUESTS','เพดานเรียก AI ต่อวันทั้งแอป',s?String(s.aiDailyLimit):'60'],['MAX_DAILY_SEARCH_REQUESTS','เพดานค้นเว็บต่อวันทั้งแอป',s?String(s.searchDailyLimit):'80'],['ALLOWED_PARENT_ORIGINS','โดเมนที่เชื่อมต่อกับ GAS ได้','GitHub Pages + localhost'],['APP_ENABLED','เปิด/พักการสร้างแผนใหม่',s?String(s.enabled):'true']];
    dialog('การเชื่อมต่อ & API','<div class="connection-status-card"><strong>'+esc(status)+'</strong><p>ตรวจเฉพาะสถานะการตั้งค่า คีย์ทั้งหมดอยู่บน GAS และไม่ส่งมาที่หน้าเว็บ</p></div><table class="settings-table"><thead><tr><th>ชื่อใน Script Properties</th><th>ใช้ทำอะไร</th><th>สถานะ / ค่า</th></tr></thead><tbody>'+rows.map(row=>'<tr><td><code>'+esc(row[0])+'</code></td><td>'+esc(row[1])+'</td><td class="model-name">'+esc(row[2])+'</td></tr>').join('')+'</tbody></table><p>แผนที่ใช้ OpenStreetMap และ Photon ไม่ต้องใส่ Google Maps API key ค้นหาและเลือกจุดในหน้าเว็บได้เลย บริการนี้ต้องออนไลน์ ส่วนพิกัดที่ยืนยันจะส่งไป GAS/AI เมื่อสร้างแผน</p><h3>ตั้งค่าที่เดียว แล้วใช้ได้ทั้งมือถือและคอม</h3><p>เปิด GAS → Project Settings → Script Properties เพื่อใส่หรือแก้คีย์ AI หากมี AI_API_KEY อยู่แล้ว ใช้ต่อได้ทันที อย่าใส่คีย์ใน GitHub หรือหน้าเว็บ</p><p>URL ของ GAS และลิงก์โปรเจกต์อยู่ด้านบนของ app-config.js ส่วนโมเดลและชื่อคีย์ทั้งหมดอยู่ด้านบนของ apps-script/Code.gs</p><a class="button primary" href="'+esc(C.gasEditorUrl)+'" target="_blank" rel="noopener noreferrer">เปิดตั้งค่าใน GAS ↗</a><button class="button secondary" data-action="reconnect">ตรวจการเชื่อมต่ออีกครั้ง</button><h3>การติดตั้งบนมือถือ</h3><p>Android ใช้เมนูเบราว์เซอร์ → ติดตั้งแอป / เพิ่มไปยังหน้าจอหลัก ส่วน iPhone เปิดใน Safari → แชร์ → เพิ่มไปยังหน้าจอหลัก แผนจะอยู่ในเบราว์เซอร์หรือแอปที่คุณใช้บันทึก</p>'+(state.installPrompt?'<button class="button secondary" data-action="install">ติดตั้ง TripPlanner</button>':'')+'<p class="small">TripPlanner v'+esc(C.version)+'</p>');
  }
  function showGuide() {
    dialog('วางแผน แล้วออกเดินทาง','<ol class="guide-steps"><li><strong>บอกจุดหมายและงบรวม</strong><br>กรอกต้นทาง ปลายทาง จำนวนวัน และผู้เดินทาง งบทุกยอดรวมทั้งกลุ่มและค่าที่พัก</li><li><strong>เลือกสไตล์ที่เข้ากับคุณ</strong><br>เลือกวิธีเดินทาง ความสนใจ และข้อจำกัด เช่น มีผู้สูงอายุหรืออาหารที่แพ้</li><li><strong>รอแผนตามขั้นตอนจริง</strong><br>เราจะค้นข้อมูล สร้างทีละช่วงวัน และรวมค่าใช้จ่าย ทริปยาวใช้เวลามากกว่า หากสะดุดให้กดลองสร้างต่อ</li><li><strong>ตรวจแผนก่อนใช้</strong><br>เลือกวัน เปิด Maps ดูแหล่งข้อมูล และเช็กงบ ราคาทุกยอดยังเป็นประมาณการ ควรตรวจเวลาเปิดและราคาจริงใกล้วันเดินทาง</li><li><strong>เก็บแผนไว้พกไปด้วย</strong><br>บันทึกให้อัตโนมัติในอุปกรณ์นี้ ส่งออก JSON เพื่อสำรองหรือย้ายอุปกรณ์ พิมพ์เป็น PDF และส่งออกภาพได้เป็นรายวัน</li></ol><p>แผนที่บันทึกแล้วเปิดอ่านออฟไลน์ได้ การสร้างแผนใหม่และเปิด Maps ต้องใช้อินเทอร์เน็ต ข้อมูลของคุณไม่ซิงก์ข้ามอุปกรณ์อัตโนมัติ</p><button class="button primary" data-action="close-dialog">เริ่มวางแผน</button>');
  }
  function deleteSaved(id) {
    const plan=state.saved.find(p=>p.id===id);if(!plan)return;
    dialog('นำทริปออกจากรายการ','<p>นำ “'+esc(plan.tripTitle)+'” ออกจากทริปที่บันทึกไว้ คุณสามารถดาวน์โหลดไฟล์สำรองก่อนนำออกได้</p><div class="delete-confirm"><button class="button secondary" data-backup="'+esc(id)+'">ดาวน์โหลดสำรอง</button><button class="button danger" data-confirm-delete="'+esc(id)+'">นำออกจากรายการ</button></div>');
  }
  function confirmDelete(id) {
    if(state.busy){notice('กำลังสร้างแผนอยู่ กรุณารอหรือหยุดสร้างวันถัดไปก่อน');return;}
    const before=state.saved.slice();const removed=before.find(p=>p.id===id);if(!removed)return;
    if(!storageSet('tripplanner:v8:removed:'+Date.now(),JSON.stringify(removed))){notice('สำรองรายการก่อนนำออกไม่สำเร็จ จึงยังเก็บรายการไว้',true);return;}
    state.saved=before.filter(p=>p.id!==id);if(!persistSaved()){state.saved=before;notice(state.storageNotice,true);return;}
    closeDialog();renderSaved();notice('นำทริปออกแล้ว มีไฟล์กู้คืนเก็บไว้ในเบราว์เซอร์');
  }
  function showRecovery() {
    const items=[],seen=new Set(state.saved.map(p=>p.id));
    try {Object.keys(localStorage).filter(key=>/^tripplanner:v8:(removed|archive|import-archive):/.test(key)).sort().reverse().forEach(key=>{
      try{const value=JSON.parse(localStorage.getItem(key));const plans=Array.isArray(value)?value:[value];plans.forEach(value=>{try{const plan=M.normalizePlan(value);if(!seen.has(plan.id)&&items.length<200){seen.add(plan.id);items.push(plan);}}catch{}});}catch{}
    });}catch{notice('อ่านข้อมูลกู้คืนไม่ได้',true);return;}
    state.recoveryItems=items;
    dialog('กู้คืนทริปในอุปกรณ์นี้',items.length?'<p>ทริปที่นำออกหรือเก็บเกิน 30 รายการยังมีสำเนาในเบราว์เซอร์นี้</p>'+items.map((plan,index)=>'<div class="recovery-row"><div><strong>'+esc(plan.tripTitle)+'</strong><p>'+esc(plan.destination)+' · '+plan.days.length+' วัน</p></div><button class="button secondary" data-restore="'+index+'">กู้คืน</button></div>').join(''):'<p>ยังไม่มีทริปที่ต้องกู้คืนในอุปกรณ์นี้</p>');
  }
  function download(content,name,type='application/json') {
    const blob=content instanceof Blob?content:new Blob([content],{type});const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function exportPlan(plan=state.plan) {if(!plan)return;download(JSON.stringify(plan,null,2),'TripPlanner-'+plan.destination.replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').slice(0,60)+'.json');}
  function showJsonExport() {
    if(!state.plan)return;const json=JSON.stringify(state.plan,null,2);
    if(state.imageUrl)URL.revokeObjectURL(state.imageUrl);state.imageUrl=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const name='TripPlanner-'+state.plan.destination.replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').slice(0,60)+'.json';
    dialog('ส่งออกแผนการเดินทาง','<p>ไฟล์นี้มีแผนครบทุกวัน ค่าใช้จ่าย แหล่งข้อมูล และรายการจัดกระเป๋า เก็บไว้สำรองหรือนำเข้าในอีกอุปกรณ์ได้</p><a class="button primary" href="'+state.imageUrl+'" download="'+esc(name)+'">'+icon('download')+'ดาวน์โหลด JSON</a><details class="json-details"><summary>ดูข้อมูลไฟล์</summary><textarea id="jsonPreview" readonly rows="12" aria-label="ข้อมูลแผน JSON"></textarea></details><p class="small">หากเบราว์เซอร์บล็อกดาวน์โหลดจาก GAS ให้คัดลอกข้อมูลไฟล์ หรือเปิดผ่าน GitHub Pages</p>');
    $('jsonPreview').value=json;
  }
  async function importPlans(file) {
    if(!file)return;if(file.size>2*1024*1024){notice('ไฟล์ใหญ่เกิน 2 MB กรุณาเลือกไฟล์แผน JSON',true);return;}
    try{const value=JSON.parse(await file.text());const values=Array.isArray(value)?value:value.plans||[value];
      if(!Array.isArray(values)||values.length>30)throw new Error('นำเข้าได้ไม่เกิน 30 แผนต่อครั้ง');
      const plans=values.map(value=>{const plan=M.normalizePlan(value);plan.id=uuid();return plan;});
      if(!plans.length)throw new Error('ไฟล์นี้ไม่มีแผนการเดินทาง');
      const before=state.saved.slice();state.saved=[...plans,...state.saved].slice(0,C.maxSavedPlans);
      if(before.length+plans.length>C.maxSavedPlans&&!storageSet('tripplanner:v8:import-archive:'+Date.now(),JSON.stringify(before))){state.saved=before;throw new Error('พื้นที่จัดเก็บไม่พอ กรุณาสำรองแผนเดิมก่อนนำเข้า');}
      if(!persistSaved()){state.saved=before;throw new Error(state.storageNotice);}
      setView('saved');notice('นำเข้าแล้ว '+plans.length+' แผน');
    }catch(error){notice(error.message||'อ่านไฟล์ JSON ไม่สำเร็จ',true);}
    finally{$('importFile').value='';}
  }
  async function copyPlan(text=M.planText(state.plan)) {
    try{await navigator.clipboard.writeText(text);notice('คัดลอกแผนพร้อมลิงก์ Maps แล้ว');}
    catch{dialog('คัดลอกแผนของคุณ','<p>เบราว์เซอร์นี้ไม่อนุญาตการคัดลอกอัตโนมัติ แตะช่องด้านล่าง เลือกทั้งหมด แล้วคัดลอก</p><textarea id="copyText" readonly rows="12" class="copy-text"></textarea>');$('copyText').value=text;$('copyText').style.cssText='width:100%;border:1px solid var(--line);border-radius:10px;padding:14px;font-size:12px;line-height:1.8';$('copyText').focus();$('copyText').select();}
  }
  async function sharePlan() {if(!state.plan)return;const text=M.planText(state.plan);if(navigator.share){try{await navigator.share({title:state.plan.tripTitle,text});return;}catch(error){if(error.name==='AbortError')return;}}await copyPlan(text);}

  function showLocation() {
    state.locationRequest++;state.locationUrl='';
    const embedded=window.top!==window.self;
    const hostTip=embedded?'<p class="small muted">หากหน้า GAS จำกัดสิทธิ์ตำแหน่ง ให้<a href="'+esc(C.webUrl)+'" target="_blank" rel="noopener noreferrer">เปิด TripPlanner บน GitHub Pages</a> แล้วกดรับตำแหน่งอีกครั้ง</p>':'';
    dialog('ส่งพิกัดปัจจุบันครั้งเดียว','<div class="location-card"><p>เมื่อกดรับตำแหน่ง เบราว์เซอร์จะขออนุญาตใช้ตำแหน่งของคุณ เราจะสร้างลิงก์ Google Maps เพื่อให้คุณเลือกแชร์เอง ไม่ติดตามต่อและไม่บันทึกพิกัดในแผนหรือ GAS</p><p class="small muted">ลิงก์เป็นพิกัด ณ เวลาที่กด ไม่อัปเดตตามการเดินทาง และผู้ที่ได้รับลิงก์เปิดดูภายหลังได้</p><div class="location-status" id="locationStatus" role="status">พร้อมขอตำแหน่งเมื่อคุณกดปุ่มด้านล่าง</div><button class="button primary" id="requestLocationButton" data-action="request-location">'+icon('navigation')+'รับตำแหน่งตอนนี้</button><div class="location-actions" id="locationActions" hidden><button class="button primary" data-action="share-location">'+icon('share')+'แชร์ลิงก์</button><button class="button secondary" data-action="copy-location">'+icon('copy')+'คัดลอกลิงก์</button><a class="button secondary" id="locationOpen" target="_blank" rel="noopener noreferrer">เปิด Google Maps ↗</a></div><input class="location-link" id="locationCopyFallback" type="text" readonly aria-label="ลิงก์ Google Maps สำหรับคัดลอกเอง" hidden>'+hostTip+'<p class="small muted">หากเบราว์เซอร์ไม่อนุญาตให้ใช้พิกัด ให้<a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">เปิด Google Maps</a> แล้วแชร์ตำแหน่งจากแอปแผนที่</p></div>');
  }
  async function requestLocation() {
    if(!$('appDialog').open)return;
    const button=$('requestLocationButton'),status=$('locationStatus');
    if(!button||!status)return;
    state.locationUrl='';$('locationActions').hidden=true;$('locationCopyFallback').value='';$('locationCopyFallback').hidden=true;$('locationOpen').removeAttribute('href');
    if(!window.isSecureContext||!navigator.geolocation){status.textContent='เบราว์เซอร์นี้ไม่รองรับตำแหน่งบนหน้านี้ กรุณาเปิดเว็บผ่าน HTTPS หรือเปิด Google Maps โดยตรง';return;}
    const policy=document.permissionsPolicy||document.featurePolicy;
    if(policy?.allowsFeature&&!policy.allowsFeature('geolocation')){status.textContent='หน้านี้ถูกจำกัดสิทธิ์ตำแหน่งจากการฝังหน้าเว็บ กรุณาเปิด TripPlanner บน GitHub Pages ผ่านลิงก์ด้านล่าง';return;}
    const request=++state.locationRequest;button.disabled=true;status.textContent='กำลังรอตำแหน่งจากเบราว์เซอร์…';
    try {
      const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:0}));
      if(request!==state.locationRequest||!$('appDialog').open)return;
      const {latitude,longitude,accuracy}=position.coords;
      if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude<-90||latitude>90||longitude<-180||longitude>180)throw new Error('พิกัดที่ได้รับไม่ถูกต้อง กรุณาลองใหม่');
      const coords=latitude.toFixed(6)+','+longitude.toFixed(6);
      state.locationUrl=M.mapUrl(coords);
      $('locationOpen').href=state.locationUrl;$('locationCopyFallback').value=state.locationUrl;$('locationCopyFallback').hidden=false;
      $('locationActions').hidden=false;
      const accuracyText=Number.isFinite(accuracy)?' · ความคลาดเคลื่อนประมาณ '+M.fmt(Math.round(accuracy))+' เมตร':'';
      status.textContent='ได้พิกัด '+coords+accuracyText+' · เลือกแชร์ลิงก์ด้านล่างเมื่อพร้อม';
    } catch(error) {
      if(request!==state.locationRequest||!$('appDialog').open)return;
      const denied=window.top!==window.self?'หน้าเว็บที่เปิดแบบฝังอาจไม่อนุญาตตำแหน่ง ให้ลองเปิด TripPlanner บน GitHub Pages หรือเช็กสิทธิ์ตำแหน่งในเบราว์เซอร์':'คุณยังไม่ได้อนุญาตตำแหน่ง หากต้องการลองใหม่ให้เปิดสิทธิ์ตำแหน่งของเว็บนี้ในเบราว์เซอร์';
      const messages={1:denied,2:'อุปกรณ์หาตำแหน่งไม่พบ ลองเปิด GPS หรือใช้ Google Maps โดยตรง',3:'หาตำแหน่งนานเกินไป กรุณาลองใหม่'};
      status.textContent=messages[error.code]||error.message||'หาตำแหน่งไม่สำเร็จ กรุณาลองใหม่';
    } finally {if(request===state.locationRequest&&$('appDialog').open)button.disabled=false;}
  }
  async function copyLocation() {
    if(!state.locationUrl)return;
    const url=state.locationUrl;
    try{await navigator.clipboard.writeText(url);if(state.locationUrl===url&&$('appDialog').open)$('locationStatus').textContent='คัดลอกลิงก์ตำแหน่งแล้ว ส่งให้คนในทริปได้เลย';}
    catch{if(state.locationUrl!==url||!$('appDialog').open)return;const input=$('locationCopyFallback');input.hidden=false;input.focus();input.select();$('locationStatus').textContent='คัดลอกอัตโนมัติไม่ได้ กรุณาคัดลอกลิงก์ที่เลือกไว้ในช่องด้านล่าง';}
  }
  async function shareLocation() {
    if(!state.locationUrl)return;
    const url=state.locationUrl;
    if(navigator.share){try{await navigator.share({title:'ตำแหน่งปัจจุบันของฉัน',url});if(state.locationUrl===url&&$('appDialog').open)$('locationStatus').textContent='ส่งลิงก์ตำแหน่งแล้ว';return;}catch(error){if(error.name==='AbortError')return;}}
    await copyLocation();
  }
  function exportCalendarReminder() {
    if(!state.plan)return;
    const name='TripPlanner-reminder-'+state.plan.startDate+'.ics';
    download(M.reminderIcs(state.plan),name,'text/calendar;charset=utf-8');
    notice('ดาวน์โหลดไฟล์เตือนแล้ว เปิดไฟล์และเพิ่มลงปฏิทินเพื่อรับแจ้งเตือน');
  }

  async function exportImage() {
    if(!state.plan)return;const plan=state.plan,day=plan.days[state.activeDay];dialog('ภาพแผนวันที่ '+day.dayNumber,'<p class="image-export-status">กำลังจัดภาพรายวัน…</p>');
    try {
      if(document.fonts)await document.fonts.ready;
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=14000;let ctx=canvas.getContext('2d');
      if(!ctx)throw new Error('เบราว์เซอร์ไม่รองรับการส่งออกภาพ');
      const records=[];let y=180;
      const font='"Noto Sans Thai", sans-serif';
      function text(value,size,color,bold=false,gap=12) {
        ctx.font=(bold?'600 ':'400 ')+size+'px '+font;let line='';
        const words=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('th',{granularity:'word'}).segment(String(value))].map(v=>v.segment):Array.from(String(value));
        words.forEach(word=>{if(ctx.measureText(line+word).width>928&&line){records.push({text:line,y,size,color,bold});y+=size*1.65;line=word;}else line+=word;});
        if(line){records.push({text:line,y,size,color,bold});y+=size*1.65;}y+=gap;
      }
      text('MAKE EVERY TRIP YOURS',16,'#cfb884',true,20);
      text(plan.tripTitle,40,'#dce5f0',true,8);
      text('วันที่ '+day.dayNumber+' · '+day.title+(plan.startDate?' · '+M.dateForDay(plan.startDate,state.activeDay):''),26,'#adcae5',true,10);
      text(plan.totalTravelers+' คน · รวมวันนี้ ฿'+M.fmt(day.dailyExpense.total)+' (ประมาณการทั้งกลุ่ม)',22,'#91a3b9',false,28);
      day.activities.forEach(a=>{text(a.time+'–'+a.endTime+'  '+a.title,27,'#dce5f0',true,4);text(a.description,22,'#a8bacf',false,5);text(a.location+' · ฿'+M.fmt(a.cost)+' '+(a.costNote||''),20,'#adcae5',false,5);if(a.tips)text('เคล็ดลับ: '+a.tips,19,'#c9bd9e',false,7);y+=24;});
      if(day.accommodation){text('คืนนี้: '+day.accommodation.name,26,'#dce5f0',true,6);text('฿'+M.fmt(day.accommodation.pricePerNight)+' / คืน สำหรับทั้งกลุ่ม',22,'#adcae5',false,20);}
      text('ค่าใช้จ่ายเป็นประมาณการ ควรตรวจราคา เวลาเปิด และเส้นทางก่อนเดินทาง',18,'#91a3b9',false,10);y+=50;
      if(y>14000)throw new Error('รายละเอียดวันนี้ยาวเกินขนาดภาพ กรุณาส่งออก PDF หรือ JSON');
      canvas.height=Math.ceil(y);ctx=canvas.getContext('2d');ctx.fillStyle='#0c121c';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#cfb884';ctx.fillRect(0,0,canvas.width,10);
      records.forEach(r=>{ctx.font=(r.bold?'600 ':'400 ')+r.size+'px '+font;ctx.fillStyle=r.color;ctx.fillText(r.text,76,r.y);});
      const wordmark=document.querySelector('.brand-wordmark svg');
      if(wordmark){const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('โหลดโลโก้สำหรับภาพไม่สำเร็จ'));image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(wordmark));});ctx.drawImage(image,64,40,350,350*64/Number(wordmark.getAttribute('viewBox').split(' ')[2]));}
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('สร้างไฟล์ภาพไม่สำเร็จ');
      state.imageUrl=URL.createObjectURL(blob);
      $('dialogBody').innerHTML='<p>ภาพนี้รวมกิจกรรมและที่พักของวันที่ '+day.dayNumber+' พร้อมยอดประมาณการทั้งกลุ่ม</p><img class="dialog-image" alt="แผนรายวันของ '+esc(plan.destination)+'" src="'+state.imageUrl+'"><a class="button primary" href="'+state.imageUrl+'" download="TripPlanner-day-'+day.dayNumber+'.png">'+icon('download')+'ดาวน์โหลดภาพ</a>';
    }catch(error){$('dialogBody').textContent=error.message;}
  }
  function editPlan() {if(state.busy)return;if(state.plan){const p=state.plan;$('destination').value=p.destination;$('origin').value=p.origin||'กรุงเทพมหานคร';state.originPlace=M.normalizePlace(p.originPlace,$('origin').value);state.destinationPlace=M.normalizePlace(p.destinationPlace,$('destination').value);$('atDestination').checked=p.origin==='อยู่ที่ปลายทางแล้ว';$('days').value=p.days.length;$('startDate').value=p.startDate;$('budget').value=p.totalBudget;$('people').value=p.adults;$('children').value=p.children;const mode=[...document.querySelectorAll('input[name="travelMode"]')].find(v=>v.value===p.travelMode);if(mode)mode.checked=true;}state.resume=null;updatePreview();screen('formScreen');setView('planner');$('destination').focus();}
  function applyPlace(key,place) {
    const normalized=M.normalizePlace(place,place.label);
    if(!normalized)return;
    $(key).value=normalized.label;state[key+'Place']=normalized;
    updatePreview();saveDraft();$('formError').hidden=true;notice((key==='origin'?'ตั้งจุดเริ่มต้น':'ตั้งจุดหมาย')+'จากแผนที่แล้ว');
  }
  function openPlacePicker(key,currentOnly=false) {
    if(key==='origin'&&$('atDestination').checked)return;
    const current=state[key+'Place']||{label:$(key).value};
    window.TripPlacePicker.open(key,current,applyPlace,currentOnly);
  }
  async function handleAction(action) {
    if(action==='guide')showGuide();
    if(action==='connection')showConnection();
    if(action==='close-dialog')closeDialog();
    if(action==='edit')editPlan();
    if(action==='stop')stopGeneration();
    if(action==='export')showJsonExport();
    if(action==='copy'&&state.plan)await copyPlan();
    if(action==='share')await sharePlan();
    if(action==='location')showLocation();
    if(action==='request-location')await requestLocation();
    if(action==='copy-location')await copyLocation();
    if(action==='share-location')await shareLocation();
    if(action==='calendar-reminder')exportCalendarReminder();
    if(action==='image')await exportImage();
    if(action==='print'&&state.plan)window.print();
    if(action==='import')$('importFile').click();
    if(action==='recovery')showRecovery();
    if(action==='recover-storage')download(state.storageRaw,'TripPlanner-recovery.json');
    if(action==='reconnect'){if(state.busy){notice('กำลังสร้างแผนอยู่ กรุณารอให้คำขอนี้เสร็จก่อน');return;}if(pending.has('__connect')){notice('กำลังเชื่อมต่อ GAS อยู่ กรุณารอสักครู่');return;}try{await connect(true);notice('ตรวจการเชื่อมต่อแล้ว');if($('appDialog').open)showConnection();}catch(error){notice(error.message,true);}}
    if(action==='update'){if(state.busy){notice('กำลังสร้างแผนอยู่ อัปเดตได้หลังสร้างเสร็จ');return;}const registration=await navigator.serviceWorker.getRegistration();if(registration?.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});else location.reload();}
    if(action==='install'&&state.installPrompt){await state.installPrompt.prompt();await state.installPrompt.userChoice;state.installPrompt=null;closeDialog();}
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.dataset.placeOpen){openPlacePicker(target.dataset.placeOpen);return;}
    if(target.dataset.placeCurrent){openPlacePicker(target.dataset.placeCurrent,true);return;}
    if(target.dataset.action){event.preventDefault();if(target.closest('.result-export'))target.closest('.result-export').open=false;handleAction(target.dataset.action).catch(error=>notice(error.message,true));}
    if(target.dataset.view){event.preventDefault();setView(target.dataset.view);}
    if(target.dataset.destination){$('destination').value=target.dataset.destination;state.destinationPlace=null;updatePreview();saveDraft();$('destination').focus();}
    if(target.dataset.interest){const value=target.dataset.interest;if(state.interests.has(value))state.interests.delete(value);else state.interests.add(value);target.setAttribute('aria-pressed',String(state.interests.has(value)));saveDraft();}
    if(target.dataset.step){const [id,delta]=target.dataset.step.split(':');const input=$(id);input.value=Math.max(Number(input.min),Math.min(Number(input.max),(Number(input.value)||0)+Number(delta)));updatePreview();saveDraft();}
    if(target.dataset.day!==undefined)setDay(Number(target.dataset.day));
    if(target.dataset.open)openSaved(target.dataset.open);
    if(target.dataset.delete)deleteSaved(target.dataset.delete);
    if(target.dataset.confirmDelete)confirmDelete(target.dataset.confirmDelete);
    if(target.dataset.backup){const plan=state.saved.find(p=>p.id===target.dataset.backup);exportPlan(plan);}
    if(target.dataset.restore!==undefined){const plan=state.recoveryItems?.[Number(target.dataset.restore)];if(plan&&savePlan(plan)){renderSaved();showRecovery();notice('กู้คืนทริปแล้ว');}}
  });
  $('dayTabs').addEventListener('keydown',event=>{let day=state.activeDay;if(event.key==='ArrowRight')day=(day+1)%state.plan.days.length;else if(event.key==='ArrowLeft')day=(day-1+state.plan.days.length)%state.plan.days.length;else if(event.key==='Home')day=0;else if(event.key==='End')day=state.plan.days.length-1;else return;event.preventDefault();setDay(day,true);});
  document.addEventListener('change',event=>{if(event.target.dataset.packed!==undefined&&state.plan){const item=state.plan.packingList[Number(event.target.dataset.packed)];const values=new Set(state.plan.packedItems);if(event.target.checked)values.add(item);else values.delete(item);state.plan.packedItems=[...values];savePlan(state.plan);renderPacking();}});
  $('tripForm').addEventListener('submit',generate);
  $('tripForm').addEventListener('input',event=>{if(event.target.id==='origin'||event.target.id==='destination')state[event.target.id+'Place']=null;updatePreview();saveDraft();$('formError').hidden=true;if(!state.busy)$('generateLabel').textContent='สร้างแผนทริปของฉัน';});
  $('tripForm').addEventListener('change',()=>{updatePreview();saveDraft();});
  $('savedSearch').addEventListener('input',renderSaved);
  $('importFile').addEventListener('change',event=>importPlans(event.target.files[0]));
  $('appDialog').addEventListener('click',event=>{if(event.target===$('appDialog')){const rect=$('appDialog').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog();}});
  $('appDialog').addEventListener('close',()=>{state.locationRequest++;state.locationUrl='';$('dialogBody').replaceChildren();if(state.imageUrl){URL.revokeObjectURL(state.imageUrl);state.imageUrl='';}});
  window.addEventListener('offline',updateNetwork);
  window.addEventListener('online',()=>{updateNetwork();if(state.backend?.aiConfigured&&state.backend.enabled)$('connectionBanner').hidden=true;connect().catch(()=>{});});
  window.addEventListener('beforeunload',event=>{if(state.busy){event.preventDefault();event.returnValue='';}});
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();state.installPrompt=event;});
  async function setupServiceWorker() {
    if(direct||!('serviceWorker'in navigator)||!['http:','https:'].includes(location.protocol))return;
    try{const registration=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});
      if(registration.waiting)$('updateBanner').hidden=false;
      registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)$('updateBanner').hidden=false;});});
      let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading||!navigator.serviceWorker.controller)return;reloading=true;if(registration.active&&registration.waiting===null&&$('updateBanner').hidden===false)location.reload();});
    }catch{state.storageNotice='ติดตั้งระบบออฟไลน์ไม่สำเร็จ แผนยังบันทึกได้ แต่อาจเปิดเว็บขณะไม่มีอินเทอร์เน็ตไม่ได้';}
  }
  hydrateIcons();readSaved();restoreDraft();updatePreview();updateNetwork();$('directGasLink').href=C.gasUrl;
  setupServiceWorker();connect().catch(()=>{});
})();
