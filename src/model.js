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
    return {...input,destination,origin,budget,days,people,children,startDate,preferences:str(input.preferences,1200)};
  }
  function normalizePlan(value) {
    const raw = value && value.plan || value;
    if (!raw || typeof raw !== 'object' || !str(raw.destination,120) || !Array.isArray(raw.days) || !raw.days.length || raw.days.length > 30) throw new Error('ไฟล์นี้ไม่มีแผนการเดินทางที่รองรับ');
    const budget = money(raw.totalBudget);
    const sourceIds = new Set();
    const sources = list(raw.sources,12).map((s,i) => {const url = safeUrl(s.url); const id = /^S\d{1,2}$/.test(s.id) ? s.id : 'S' + (i+1); sourceIds.add(id); return {id,title:str(s.title,200),description:str(s.description,1000),url,retrievedAt:str(s.retrievedAt,40)};}).filter(s => s.url);
    const ids = value => strings(value,4).filter(id => sourceIds.has(id));
    const days = raw.days.map((d,index) => {
      if (!d || !Array.isArray(d.activities) || !d.activities.length || d.activities.length > 40) throw new Error('ข้อมูลกิจกรรมในแผนไม่ครบ');
      const activities = d.activities.map(a => {
        if (!a || !str(a.title,180)) throw new Error('ไม่พบชื่อกิจกรรมในแผน');
        const category = Object.hasOwn(categories,a.category) ? a.category : 'activity';
        return {time:str(a.time,10),endTime:str(a.endTime,10),title:str(a.title,180),description:str(a.description),location:str(a.location || a.title,240),
          mapQuery:str(a.mapQuery || a.location || a.title,240),category,cost:category === 'hotel' ? 0 : money(a.cost ?? 0),costNote:str(a.costNote,240),tips:str(a.tips,500),sourceIds:ids(a.sourceIds),priceStatus:'estimate'};
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
    const warnings = strings(raw.warnings,15);
    if (totalExpense.remaining < 0 && !warnings.some(w => w.includes('เกินงบ'))) warnings.push('ค่าใช้จ่ายประมาณการเกินงบ ' + fmt(Math.abs(totalExpense.remaining)) + ' บาท');
    if (totalExpense.transport === 0 && !warnings.some(w => w.includes('ยังไม่ได้แยกค่าเดินทาง'))) warnings.push('แผนนี้ยังไม่ได้แยกค่าเดินทางไว้ อาจมีค่าน้ำมัน ค่าที่จอดรถ หรือค่าโดยสารเพิ่มเติม');
    if (raw.schemaVersion !== 2) warnings.push('นำเข้าจากแผนเวอร์ชันก่อน ควรตรวจว่าค่าใช้จ่ายเป็นยอดรวมทั้งกลุ่มก่อนใช้งาน');
    return {schemaVersion:2,id:str(raw.id,80) || root.crypto?.randomUUID?.() || 'trip-' + Date.now(),createdAt:str(raw.createdAt,40) || new Date().toISOString(),
      tripTitle:raw.schemaVersion===2&&days.length>4?'ทริป '+str(raw.destination,120)+' '+days.length+' วัน':str(raw.tripTitle,200) || 'ทริป ' + raw.destination,
      destination:str(raw.destination,120),origin:str(raw.origin,120),
      summary:raw.schemaVersion===2&&days.length>4?'แผนเที่ยว '+str(raw.destination,120)+' '+days.length+' วัน สำหรับ '+(Number(raw.totalTravelers)||1)+' คน งบรวม ฿'+fmt(budget)+' พร้อมกิจกรรมรายวันและที่พัก '+(days.length-1)+' คืน':str(raw.summary,1500),
      startDate:str(raw.startDate,10),travelMode:str(raw.travelMode,30),totalBudget:budget,totalTravelers:integer(raw.totalTravelers || 1,1,50,'จำนวนผู้เดินทางในไฟล์ไม่ถูกต้อง'),
      adults:Number(raw.adults) || Number(raw.totalTravelers) || 1,children:Number(raw.children) || 0,
      weatherInfo:str(raw.weatherInfo,1000),bestTimeToVisit:str(raw.bestTimeToVisit,500),days,totalExpense,
      packingList:strings(raw.packingList),packedItems:strings(raw.packedItems),importantNotes:strings(raw.importantNotes,15),moneyTips:strings(raw.moneyTips,12),
      usefulApps:list(raw.usefulApps,8).map(a => ({name:str(a.name,100),purpose:str(a.purpose,250)})),sources,warnings,priceVerified:false,
      priceNote:'ค่าใช้จ่ายทุกยอดเป็นประมาณการสำหรับทั้งกลุ่ม ไม่ใช่ราคายืนยันการจอง',model:str(raw.model,120)};
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
  root.TripModel = {categories,fmt,escape,safeUrl,mapUrl,dayExpense,normalizePlan,validateInput,dateForDay,planText};
})(typeof window !== 'undefined' ? window : globalThis);
