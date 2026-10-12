(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = window.TRIP_APP_CONFIG;
  let map, marker, mode, selected, onSelect, searchController, reverseController, requestNumber = 0;
  const dialog = $('placeDialog');
  const valid = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  const rounded = (lat, lng) => ({lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6))});
  const fallbackName = (lat, lng) => `พิกัด ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  const status = (message, error = false) => { $('placeStatus').textContent = message; $('placeStatus').classList.toggle('error', error); };
  function label(properties) {
    const parts = [properties.name, properties.street, properties.city || properties.locality || properties.district, properties.state, properties.country]
      .filter(value => typeof value === 'string' && value.trim());
    return [...new Set(parts)].join(', ').slice(0, 120);
  }
  function featurePlace(feature) {
    const coordinates = feature?.geometry?.coordinates;
    const lng = Number(coordinates?.[0]), lat = Number(coordinates?.[1]);
    if (!valid(lat, lng)) return null;
    return {...rounded(lat, lng), label: label(feature.properties || {}) || fallbackName(lat, lng)};
  }
  function setPlace(place, zoom = 15) {
    if (!place || !valid(place.lat, place.lng)) return;
    selected = {...rounded(place.lat, place.lng), label: String(place.label || fallbackName(place.lat, place.lng)).slice(0, 120)};
    $('placeName').value = selected.label;
    $('placeCoordinates').textContent = `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`;
    $('placeConfirm').disabled = false;
    map.setView([selected.lat, selected.lng], zoom);
    if (marker) marker.setLatLng([selected.lat, selected.lng]);
    else marker = window.L.circleMarker([selected.lat, selected.lng], {radius: 10, color: '#fff', weight: 3, fillColor: '#cbab6d', fillOpacity: 1}).addTo(map);
  }
  async function photon(url, controller) {
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {signal: controller.signal, headers: {'Accept': 'application/json'}});
      if (!response.ok) throw new Error(`บริการค้นหาสถานที่ตอบกลับ ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.features)) throw new Error('ข้อมูลสถานที่ไม่ถูกต้อง');
      return data.features;
    } finally { clearTimeout(timer); }
  }
  function renderResults(places) {
    const host = $('placeResults');
    host.replaceChildren();
    if (!places.length) { const empty = document.createElement('p'); empty.textContent = 'ไม่พบสถานที่ ลองคำค้นอื่น หรือจิ้มจุดบนแผนที่'; host.append(empty); return; }
    places.forEach((place, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'place-result';
      button.textContent = place.label;
      button.addEventListener('click', () => {requestNumber++; reverseController?.abort(); setPlace(place, 15); status('เลือกแล้ว ตรวจชื่อสถานที่และกดใช้จุดนี้'); host.querySelectorAll('button').forEach(el => el.classList.remove('active')); button.classList.add('active'); });
      host.append(button);
      if (index === 0) map.setView([place.lat, place.lng], 13);
    });
  }
  async function search(event) {
    event.preventDefault();
    const query = $('placeSearch').value.trim();
    if (query.length < 2) { status('กรุณาพิมพ์ชื่อสถานที่อย่างน้อย 2 ตัวอักษร', true); $('placeSearch').focus(); return; }
    searchController?.abort();
    const controller = new AbortController(); searchController = controller;
    const serial = ++requestNumber;
    $('placeSearchButton').disabled = true; status('กำลังค้นหาสถานที่…'); $('placeResults').replaceChildren();
    try {
      const url = new URL(C.placeSearchUrl + '/api/');
      url.searchParams.set('q', query); url.searchParams.set('limit', '8');
      const places = (await photon(url, controller)).map(featurePlace).filter(Boolean);
      if (!dialog.open || serial !== requestNumber) return;
      renderResults(places);
      status(places.length ? `พบ ${places.length} สถานที่ แตะรายการหรือจิ้มบนแผนที่` : 'ไม่พบสถานที่ ลองคำค้นอื่นหรือจิ้มบนแผนที่', !places.length);
    } catch (error) {
      if (error.name !== 'AbortError' && dialog.open && serial === requestNumber) status('ค้นหาไม่สำเร็จ ลองอีกครั้ง หรือจิ้มจุดบนแผนที่โดยตรง', true);
    } finally { if (searchController === controller) $('placeSearchButton').disabled = false; }
  }
  async function chooseCoordinates(lat, lng, source) {
    if (!valid(lat, lng)) return;
    searchController?.abort();
    reverseController?.abort();
    const controller = new AbortController(); reverseController = controller;
    const serial = ++requestNumber;
    setPlace({lat, lng, label: fallbackName(lat, lng)}, map.getZoom() < 13 ? 15 : map.getZoom());
    $('placeResults').replaceChildren();
    status(source === 'current' ? 'ได้ตำแหน่งปัจจุบันแล้ว กำลังค้นชื่อบริเวณนี้…' : 'วางหมุดแล้ว กำลังค้นชื่อบริเวณนี้…');
    try {
      const url = new URL(C.placeSearchUrl + '/reverse');
      url.searchParams.set('lat', String(lat)); url.searchParams.set('lon', String(lng)); url.searchParams.set('limit', '1');
      const place = (await photon(url, controller)).map(featurePlace).find(Boolean);
      if (!dialog.open || serial !== requestNumber) return;
      if (place && $('placeName').value === fallbackName(lat, lng)) { selected.label = place.label; $('placeName').value = place.label; }
      status('ตรวจชื่อจุดที่เลือก แล้วกดใช้จุดนี้');
    } catch (error) {
      if (error.name !== 'AbortError' && dialog.open && serial === requestNumber) status('ค้นชื่อบริเวณนี้ไม่ได้ คุณแก้ชื่อจุดเองแล้วกดใช้จุดนี้ได้');
    }
  }
  async function useCurrent() {
    if (!map) return;
    if (!window.isSecureContext || !navigator.geolocation) { status('เบราว์เซอร์ไม่รองรับตำแหน่ง กรุณาจิ้มบนแผนที่หรือเปิดผ่าน HTTPS', true); return; }
    const policy = document.permissionsPolicy || document.featurePolicy;
    if (policy?.allowsFeature && !policy.allowsFeature('geolocation')) { status('หน้านี้ถูกจำกัดสิทธิ์ตำแหน่ง กรุณาเปิด TripPlanner บน GitHub Pages', true); return; }
    const button = $('placeCurrent'); button.disabled = true; status('กำลังขอตำแหน่งจากเบราว์เซอร์…');
    const serial = ++requestNumber;
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy: true, timeout: 15000, maximumAge: 0}));
      if (!dialog.open || serial !== requestNumber) return;
      await chooseCoordinates(position.coords.latitude, position.coords.longitude, 'current');
    } catch (error) {
      if (dialog.open && serial === requestNumber) status(error.code === 1 ? 'ไม่ได้รับสิทธิ์ตำแหน่ง คุณยังค้นหาหรือจิ้มบนแผนที่ได้' : 'รับตำแหน่งไม่สำเร็จ ลองอีกครั้งหรือเลือกบนแผนที่', true);
    } finally { button.disabled = false; }
  }
  function ensureMap() {
    if (map) return;
    if (!window.L) { status('โหลดแผนที่ไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ', true); return; }
    map = window.L.map('placeMap', {zoomControl: true}).setView([13.7563, 100.5018], 6);
    window.L.tileLayer(C.mapTileUrl, {maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'}).addTo(map);
    map.on('click', event => chooseCoordinates(event.latlng.lat, event.latlng.lng, 'map'));
  }
  function open(target, current, callback, currentOnly = false) {
    mode = target; onSelect = callback; selected = null; requestNumber++;
    searchController?.abort(); reverseController?.abort();
    $('placeDialogTitle').textContent = target === 'origin' ? 'เลือกจุดเริ่มเดินทาง' : 'เลือกจุดหมายของทริป';
    $('placeSearch').value = current?.label && !current?.lat ? current.label : '';
    $('placeName').value = ''; $('placeCoordinates').textContent = ''; $('placeResults').replaceChildren();
    $('placeConfirm').disabled = true; $('placeConfirm').textContent = target === 'origin' ? 'ใช้เป็นจุดเริ่มต้น' : 'ใช้เป็นจุดหมาย';
    status('ค้นหาสถานที่หรือจิ้มบนแผนที่');
    dialog.showModal(); ensureMap();
    if (map) {
      setTimeout(() => {if(!dialog.open)return;map.invalidateSize(); if (current && valid(current.lat, current.lng)) setPlace(current, 15); else if (!currentOnly && $('placeSearch').value.trim().length >= 2) search({preventDefault(){}});}, 50);
    }
    if (currentOnly) useCurrent(); else $('placeSearch').focus();
  }
  $('placeSearchForm').addEventListener('submit', search);
  $('placeCurrent').addEventListener('click', useCurrent);
  $('placeClose').addEventListener('click', () => dialog.close());
  $('placeConfirm').addEventListener('click', () => {
    if (!selected) return;
    const name = $('placeName').value.trim();
    if (name.length < 2) {status('กรุณาตั้งชื่อสถานที่อย่างน้อย 2 ตัวอักษร', true); $('placeName').focus(); return;}
    onSelect(mode, {...selected, label: name.slice(0, 120)});
    dialog.close();
  });
  dialog.addEventListener('close', () => {requestNumber++; searchController?.abort(); reverseController?.abort();});
  dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
  window.TripPlacePicker = {open};
})();
