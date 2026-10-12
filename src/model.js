(function (root) {
  'use strict';
  const categories = {food:'อาหาร',coffee:'คาเฟ่',attraction:'เที่ยวชม',activity:'กิจกรรม',transport:'เดินทาง',hotel:'ที่พัก',shopping:'ช้อปปิ้ง'};
  const buckets = {food:'food',coffee:'food',transport:'transport',attraction:'attractions',activity:'attractions',shopping:'miscellaneous'};
  const str = (value, max = 1200) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  const list = (value, max = 30) => Array.isArray(value) ? value.slice(0, max) : [];
  const strings = (value, max = 30) => list(value, max).map(item => str(item,600)).filter(Boolean);
  function money(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 10000000) throw new Error('พบค่าใช้จ่ายที่ไม่ถูกต้องในแผน');
    return Math.round(n * 100) / 100;
  }
  const round = n => Math.round(n * 100) / 100;
  const emptyExpense = () => ({food:0,transport:0,attractions:0,accommodation:0,miscellaneous:0,total:0});
  const fmt = value => new Intl.NumberFormat('th-TH',{maximumFractionDigits:2}).format(Number(value) || 0);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeUrl(value) {try {const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';} catch {return '';}}
  const mapUrl = query => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(query,240));
  function directionsUrl(origin, destination, originPlace, destinationPlace) {
    const from = originPlace ? originPlace.lat + ',' + originPlace.lng : str(origin,120);
    const to = destinationPlace ? destinationPlace.lat + ',' + destinationPlace.lng : str(destination,120);
    return 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(from) + '&destination=' + encodeURIComponent(to);
  }
  function normalizePlace(value, expectedLabel) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const lat = value.lat, lng = value.lng, label = str(value.label,120);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || !label || label !== str(expectedLabel,120)) return null;
    return {label,lat:Math.round(lat*1000000)/1000000,lng:Math.round(lng*1000000)/1000000};
  }
  function sourceMatchesDestination(source,destination) {
    const aliases={'เชียงใหม่':['chiangmai'],'กาญจนบุรี':['kanchanaburi'],'กระบี่':['krabi'],'กรุงเทพมหานคร':['bangkok'],'กรุงเทพ':['bangkok'],'โตเกียว':['tokyo'],'ญี่ปุ่น':['japan']};
    const label=str(destination,120).replace(/^(?:จังหวัด|จ\.|เมือง)\s*/,'').split(/[,/()]/)[0].trim(),first=label.split(/\s+/)[0];
    const names=[label.replace(/\s+(?:ประเทศไทย|thailand|ญี่ปุ่น|japan)$/i,'')];if(aliases[first])names.push(first,...aliases[first]);
    const compact=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
    let url=source.url||'';try{url=decodeURIComponent(url);}catch{}
    const haystack=compact((source.title||'')+' '+(source.description||'')+' '+url);
    return names.map(compact).filter(name=>name.length>=2).some(name=>haystack.includes(name));
  }
  function dayExpense(day) {
    const expense = emptyExpense();
    day.activities.forEach(a => {const bucket = buckets[a.category]; if (bucket) expense[bucket] = round(expense[bucket] + money(a.cost));});
    expense.accommodation = day.accommodation ? money(day.accommodation.pricePerNight) : 0;
    expense.total = round(expense.food + expense.transport + expense.attractions + expense.accommodation + expense.miscellaneous);
    return expense;
  }
  function integer(value, min, max, message) {const n = Number(value); if (!Number.isInteger(n) || n < min || n > max) throw new Error(message); return n;}
  function validateInput(input) {
    const destination = str(input.destination,120), origin = str(input.origin,120);
    if (destination.length < 2) throw new Error('กรุณาระบุจุดหมายอย่างน้อย 2 ตัวอักษร');
    if (!origin) throw new Error('กรุณาระบุจุดเริ่มต้น หรือเลือกอยู่ที่ปลายทางแล้ว');
    const budget = Number(input.budget);
    if (!Number.isFinite(budget) || budget < 500 || budget > 10000000) throw new Error('งบรวมต้องอยู่ระหว่าง 500 ถึง 10,000,000 บาท');
    const days = integer(input.days,1,30,'จำนวนวันต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 30');
    const people = integer(input.people,1,50,'ผู้ใหญ่ต้องอยู่ระหว่าง 1 ถึง 50 คน');
    const children = integer(input.children || 0,0,50,'จำนวนเด็กต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 50');
    if (people + children > 50) throw new Error('รองรับผู้เดินทางรวมไม่เกิน 50 คน');
    const startDate = str(input.startDate,10);
    if (startDate) {const date = new Date(startDate + 'T12:00:00Z'); if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== startDate) throw new Error('วันที่เดินทางไม่ถูกต้อง');}
    if (!['car','public','flight','motorcycle','flexible'].includes(input.travelMode)) throw new Error('กรุณาเลือกวิธีเดินทาง');
    return {...input,destination,origin,originPlace:normalizePlace(input.originPlace,origin),destinationPlace:normalizePlace(input.destinationPlace,destination),budget,days,people,children,startDate,preferences:str(input.preferences,1200)};
  }
  function normalizePlan(value) {
    const raw = value && value.plan || value;
    if (!raw || typeof raw !== 'object' || !str(raw.destination,120) || !Array.isArray(raw.days) || !raw.days.length || raw.days.length > 30) throw new Error('ไฟล์นี้ไม่มีแผนการเดินทางที่รองรับ');
    const budget = money(raw.totalBudget);
    const sourceIds = new Set();
    const originalSources = list(raw.sources,12);
    const sources = originalSources.map((s,i) => {const url = safeUrl(s.url); const id = /^S\d{1,2}$/.test(s.id) ? s.id : 'S' + (i+1); return {id,title:str(s.title,200),description:str(s.description,1000),url,retrievedAt:str(s.retrievedAt,40)};}).filter(s => s.url && sourceMatchesDestination(s,raw.destination));
    sources.forEach(s=>sourceIds.add(s.id));
    const ids = value => strings(value,4).filter(id => sourceIds.has(id));
    const activityIds = new Set();
    const days = raw.days.map((d,index) => {
      if (!d || !Array.isArray(d.activities) || !d.activities.length || d.activities.length > 40) throw new Error('ข้อมูลกิจกรรมในแผนไม่ครบ');
      const activities = d.activities.map((a,stop) => {
        if (!a || !str(a.title,180)) throw new Error('ไม่พบชื่อกิจกรรมในแผน');
        const category = Object.hasOwn(categories,a.category) ? a.category : 'activity';
        let id=/^[a-zA-Z0-9_-]{1,80}$/.test(a.id || '') ? a.id : 'day'+(index+1)+'-stop'+(stop+1);
        if(activityIds.has(id))id='day'+(index+1)+'-stop'+(stop+1)+'-'+activityIds.size;
        activityIds.add(id);
        return {id,time:str(a.time,10),endTime:str(a.endTime,10),title:str(a.title,180),description:str(a.description),location:str(a.location || a.title,240),
          mapQuery:str(a.mapQuery || a.location || a.title,240),category,cost:category === 'hotel' ? 0 : money(a.cost ?? 0),costNote:str(a.costNote,240),tips:str(a.tips,500),sourceIds:ids(a.sourceIds),priceStatus:'estimate',edited:a.edited===true};
      });
      const stay = d.accommodation;
      const accommodation = index < raw.days.length - 1 && stay && str(stay.name,200) ? {name:str(stay.name,200),type:str(stay.type,80),pricePerNight:money(stay.pricePerNight ?? 0),
        mapQuery:str(stay.mapQuery || stay.name,240),highlights:str(stay.highlights,500),sourceIds:ids(stay.sourceIds),priceStatus:'estimate'} : null;
      const day = {dayNumber:index+1,title:str(d.title,180),theme:str(d.theme,200),activities,accommodation};
      day.dailyExpense = dayExpense(day);
      return day;
    });
    const totalExpense = emptyExpense();
    days.forEach(d => Object.keys(totalExpense).forEach(key => {totalExpense[key] = round(totalExpense[key] + d.dailyExpense[key]);}));
    totalExpense.remaining = round(budget - totalExpense.total);
    const warnings = strings(raw.warnings,15).filter(w=>!w.includes('ค่าใช้จ่ายประมาณการเกินงบ')&&!w.includes('แผนนี้ยังไม่ได้แยกค่าเดินทาง')&&!w.includes('แก้แผนด้วยตนเอง'));
    if(raw.userEdited===true)warnings.push('แก้แผนด้วยตนเองแล้ว โปรดตรวจหมายเหตุที่ AI สร้างไว้เดิม เพราะอาจไม่ตรงกับแผนล่าสุด');
    if(originalSources.length&&!sources.length&&!warnings.some(w=>w.includes('ผลค้นเว็บไม่ตรง')))warnings.push('ผลค้นเว็บไม่ตรงกับจุดหมายนี้ จึงไม่ใช้เป็นแหล่งอ้างอิง แผนยังใช้ราคาโดยประมาณ');
    if (totalExpense.remaining < 0 && !warnings.some(w => w.includes('เกินงบ'))) warnings.push('ค่าใช้จ่ายประมาณการเกินงบ ' + fmt(Math.abs(totalExpense.remaining)) + ' บาท');
    if (totalExpense.transport === 0 && !warnings.some(w => w.includes('ยังไม่ได้แยกค่าเดินทาง'))) warnings.push('แผนนี้ยังไม่ได้แยกค่าเดินทางไว้ อาจมีค่าน้ำมัน ค่าที่จอดรถ หรือค่าโดยสารเพิ่มเติม');
    if (raw.schemaVersion !== 2) warnings.push('นำเข้าจากแผนเวอร์ชันก่อน ควรตรวจว่าค่าใช้จ่ายเป็นยอดรวมทั้งกลุ่มก่อนใช้งาน');
    return {schemaVersion:2,id:str(raw.id,80) || root.crypto?.randomUUID?.() || 'trip-' + Date.now(),createdAt:str(raw.createdAt,40) || new Date().toISOString(),
      tripTitle:raw.schemaVersion===2&&days.length>4?'ทริป '+str(raw.destination,120)+' '+days.length+' วัน':str(raw.tripTitle,200) || 'ทริป ' + raw.destination,
      destination:str(raw.destination,120),origin:str(raw.origin,120),originPlace:normalizePlace(raw.originPlace,raw.origin),destinationPlace:normalizePlace(raw.destinationPlace,raw.destination),
      summary:raw.schemaVersion===2&&days.length>4?'แผนเที่ยว '+str(raw.destination,120)+' '+days.length+' วัน สำหรับ '+(Number(raw.totalTravelers)||1)+' คน งบรวม ฿'+fmt(budget)+' พร้อมกิจกรรมรายวันและที่พัก '+(days.length-1)+' คืน':str(raw.summary,1500),
      startDate:str(raw.startDate,10),travelMode:str(raw.travelMode,30),totalBudget:budget,totalTravelers:integer(raw.totalTravelers || 1,1,50,'จำนวนผู้เดินทางในไฟล์ไม่ถูกต้อง'),
      adults:Number(raw.adults) || Number(raw.totalTravelers) || 1,children:Number(raw.children) || 0,
      weatherInfo:str(raw.weatherInfo,1000),bestTimeToVisit:str(raw.bestTimeToVisit,500),days,totalExpense,
      packingList:strings(raw.packingList),packedItems:strings(raw.packedItems),completedStopIds:[...new Set(list(raw.completedStopIds,1200).filter(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id)))].filter(id=>days.some(day=>day.activities.some(a=>a.id===id))),importantNotes:strings(raw.importantNotes,15),moneyTips:strings(raw.moneyTips,12),
      usefulApps:list(raw.usefulApps,8).map(a => ({name:str(a.name,100),purpose:str(a.purpose,250)})),sources,warnings,userEdited:raw.userEdited===true,priceVerified:false,
      priceNote:'ค่าใช้จ่ายทุกยอดเป็นประมาณการสำหรับทั้งกลุ่ม ไม่ใช่ราคายืนยันการจอง',model:str(raw.model,120)};
  }
  function changeActivity(plan,dayIndex,stopIndex,change,values={}) {
    if(!plan||!Array.isArray(plan.days)||!Number.isInteger(dayIndex)||dayIndex<0||dayIndex>=plan.days.length)throw new Error('ไม่พบวันที่ต้องการแก้ไข');
    const copy=JSON.parse(JSON.stringify(plan)),activities=copy.days[dayIndex].activities;
    if(change==='add'){
      if(activities.length>=40)throw new Error('หนึ่งวันเพิ่มได้ไม่เกิน 40 จุดแวะ');
      activities.push({id:'custom-'+(root.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),time:'18:00',endTime:'19:00',title:'จุดแวะใหม่',location:copy.destination,mapQuery:copy.destination,description:'',category:'activity',cost:0,costNote:'',tips:'',sourceIds:[],edited:true});
    }else{
      if(!Number.isInteger(stopIndex)||stopIndex<0||stopIndex>=activities.length)throw new Error('ไม่พบจุดแวะที่ต้องการแก้ไข');
      if(change==='delete'){
        if(activities.length===1)throw new Error('ต้องเหลืออย่างน้อยหนึ่งจุดแวะต่อวัน');
        activities.splice(stopIndex,1);
      }else if(change==='move'){
        const next=stopIndex+Number(values.direction);
        if(!Number.isInteger(next)||next<0||next>=activities.length)throw new Error('ย้ายจุดแวะต่อไม่ได้');
        const left=activities[stopIndex],right=activities[next];
        const slot={time:left.time,endTime:left.endTime};left.time=right.time;left.endTime=right.endTime;right.time=slot.time;right.endTime=slot.endTime;
        [activities[stopIndex],activities[next]]=[right,left];
      }else if(change==='edit'){
        const title=str(values.title,180),location=str(values.location,240),description=str(values.description,1200);
        const time=str(values.time,10),endTime=str(values.endTime,10),cost=Number(values.cost);
        if(title.length<2||location.length<2)throw new Error('กรุณาระบุชื่อและสถานที่อย่างน้อย 2 ตัวอักษร');
        if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||endTime<=time)throw new Error('เวลาเริ่มและสิ้นสุดไม่ถูกต้อง');
        if(!Number.isFinite(cost)||cost<0||cost>10000000)throw new Error('ค่าใช้จ่ายต้องอยู่ระหว่าง 0 ถึง 10,000,000 บาท');
        if(!Object.hasOwn(categories,values.category))throw new Error('กรุณาเลือกประเภทกิจกรรม');
        if(values.category==='hotel'&&cost!==0)throw new Error('กิจกรรมเช็กอินที่พักคิดค่าใช้จ่าย 0 บาท กรุณาแก้ราคาจากบัตรที่พักด้านล่าง');
        const activity=activities[stopIndex];
        Object.assign(activity,{title,location,description,time,endTime,category:values.category,cost:values.category==='hotel'?0:cost,
          mapQuery:location,costNote:str(values.costNote,240),tips:str(values.tips,500),sourceIds:[],edited:true});
      }else throw new Error('คำสั่งแก้ไขไม่ถูกต้อง');
    }
    copy.userEdited=true;
    return normalizePlan(copy);
  }
  function changeStay(plan,dayIndex,values) {
    if(!plan?.days?.[dayIndex]?.accommodation || dayIndex>=plan.days.length-1)throw new Error('วันนี้ไม่มีที่พักค้างคืนในแผน');
    const name=str(values.name,200),price=Number(values.pricePerNight);
    if(name.length<2)throw new Error('กรุณาระบุชื่อที่พักอย่างน้อย 2 ตัวอักษร');
    if(!Number.isFinite(price)||price<0||price>10000000)throw new Error('ราคาที่พักต้องอยู่ระหว่าง 0 ถึง 10,000,000 บาท');
    const copy=JSON.parse(JSON.stringify(plan));
    Object.assign(copy.days[dayIndex].accommodation,{name,pricePerNight:price,mapQuery:str(values.mapQuery,240)||name,highlights:str(values.highlights,500),sourceIds:[],priceStatus:'estimate'});
    copy.userEdited=true;
    return normalizePlan(copy);
  }
  function changeBudget(plan,value) {
    const budget=Number(value);
    if(!Number.isFinite(budget)||budget<500||budget>10000000)throw new Error('งบรวมต้องอยู่ระหว่าง 500 ถึง 10,000,000 บาท');
    return normalizePlan({...plan,totalBudget:budget,userEdited:true});
  }
  function dateForDay(startDate,index) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || '')) return '';
    const date = new Date(startDate + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime())) return '';
    date.setUTCDate(date.getUTCDate() + index);
    return new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',timeZone:'Asia/Bangkok'}).format(date);
  }
  function planText(plan) {
    const lines = [plan.tripTitle,'จุดหมาย: ' + plan.destination,'ผู้เดินทาง ' + plan.totalTravelers + ' คน · ' + plan.days.length + ' วัน',
      'งบรวม ฿' + fmt(plan.totalBudget) + ' · ค่าใช้จ่ายประมาณการ ฿' + fmt(plan.totalExpense.total),plan.summary,''];
    if (plan.origin !== 'อยู่ที่ปลายทางแล้ว') lines.push('เส้นทางต้นทาง–ปลายทาง: ' + directionsUrl(plan.origin,plan.destination,plan.originPlace,plan.destinationPlace),'');
    plan.days.forEach((day,index) => {
      lines.push('วันที่ ' + day.dayNumber + (plan.startDate ? ' (' + dateForDay(plan.startDate,index) + ')' : '') + ' — ' + day.title);
      day.activities.forEach(a => lines.push(a.time + '–' + a.endTime + ' ' + a.title + ' · ฿' + fmt(a.cost), a.description, mapUrl(a.mapQuery)));
      if (day.accommodation) lines.push('ที่พัก: ' + day.accommodation.name + ' · ฿' + fmt(day.accommodation.pricePerNight) + '/คืน (ทั้งกลุ่ม)');
      lines.push('รวมวันนี้: ฿' + fmt(day.dailyExpense.total),'');
    });
    lines.push(plan.priceNote,'',...plan.importantNotes);
    if (plan.sources.length) lines.push('','แหล่งข้อมูลประกอบ:',...plan.sources.map(s => s.title + ' ' + s.url));
    return lines.join('\n');
  }
  function reminderIcs(plan, now = new Date()) {
    const startDate = plan && plan.startDate;
    if (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new Error('กรุณาระบุวันเริ่มเดินทางที่ถูกต้องก่อนเพิ่มการแจ้งเตือน');
    }
    const tripDate = new Date(startDate + 'T00:00:00.000Z');
    if (!Number.isFinite(tripDate.getTime()) || tripDate.toISOString().slice(0, 10) !== startDate) {
      throw new Error('วันเริ่มเดินทางไม่ถูกต้อง กรุณาตรวจวันที่อีกครั้ง');
    }
    // Thailand is UTC+7: 09:00 on the previous calendar day is 02:00 UTC.
    const reminder = new Date(tripDate.getTime() - 86400000);
    reminder.setUTCHours(2, 0, 0, 0);
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
      throw new Error('ไม่สามารถตรวจเวลาปัจจุบันเพื่อสร้างการแจ้งเตือนได้');
    }
    if (reminder.getTime() <= now.getTime()) {
      throw new Error('เวลาแจ้งเตือน 09:00 น. ก่อนวันเดินทางผ่านไปแล้ว กรุณาเลือกวันเดินทางใหม่');
    }
    const utc = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const cleanText = value => String(value ?? '').replace(/\r\n|\r|\n/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
    const encoder = new TextEncoder();
    const fold = line => {
      let result = '', bytes = 0;
      for (const character of line) {
        const length = encoder.encode(character).length;
        if (bytes + length > 75) { result += '\r\n '; bytes = 1; }
        result += character;
        bytes += length;
      }
      return result;
    };
    const destination = str(plan.destination, 120) || 'จุดหมายของคุณ';
    const title = str(plan.tripTitle, 200) || 'ทริป ' + destination;
    const summary = 'เตรียมเดินทาง: ' + title;
    const description = 'พรุ่งนี้เริ่มเดินทางไป' + destination + ' (' + startDate + ')\nเปิด TripPlanner เพื่อตรวจแผนและรายการจัดกระเป๋า';
    const identifier = String(plan.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'trip';
    const uid = 'reminder-' + identifier + '-' + startDate.replace(/-/g, '') + '@tripplanner.basssg.github.io';
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TripPlanner//Trip Reminder//TH', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:' + uid, 'DTSTAMP:' + utc(now),
      'DTSTART:' + utc(reminder), 'DTEND:' + utc(new Date(reminder.getTime() + 15 * 60000)),
      'SUMMARY:' + cleanText(summary), 'DESCRIPTION:' + cleanText(description),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + cleanText(summary),
      'TRIGGER;VALUE=DATE-TIME:' + utc(reminder), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'
    ];
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  root.TripModel = {categories,fmt,escape,safeUrl,mapUrl,directionsUrl,normalizePlace,sourceMatchesDestination,dayExpense,normalizePlan,changeActivity,changeStay,changeBudget,validateInput,dateForDay,planText,reminderIcs};
})(typeof window !== 'undefined' ? window : globalThis);
