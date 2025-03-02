// ชื่อของ cache
const CACHE_NAME = 'trip-planner-cache-v1';

// ไฟล์ที่ต้องการ cache สำหรับการใช้งานออฟไลน์
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://s21-kling.klingai.com/bs2/upload-ylab-stunt-sgp/se/ai_portal_sgp_mmu_txt2img_aiweb_v15/53e5aa90-d7b3-457c-8217-5266265c1a5a_image.png?x-kcdn-pid=112372'
  // เพิ่ม URL ของทรัพยากรอื่น ๆ ที่ต้องการให้ทำงานแบบออฟไลน์ได้
];

// ติดตั้ง service worker และ cache ทรัพยากร
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// จัดการ network requests
self.addEventListener('fetch', event => {
  // หมายเหตุ: ไม่สามารถ cache และทำงานแบบออฟไลน์กับ iframe ของ Google Apps Script ได้
  // จึงต้องจัดการให้แสดงหน้าออฟไลน์เมื่อไม่มีอินเทอร์เน็ต
  
  // ตรวจสอบว่าเป็น request ไปยัง Google Apps Script หรือไม่
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // กรณีไม่มีอินเทอร์เน็ต ให้แสดงหน้าออฟไลน์
          return caches.match('/offline.html');
        })
    );
  } else {
    // สำหรับทรัพยากรอื่น ๆ ใช้ cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // ส่งคืนจาก cache ถ้ามี
          if (response) {
            return response;
          }
          
          // ถ้าไม่มีใน cache ให้ fetch จากเครือข่าย
          return fetch(event.request)
            .then(response => {
              // ตรวจสอบว่า response ถูกต้องหรือไม่
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // โคลน response เพื่อเก็บใน cache
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  }
});

// จัดการ cache เวอร์ชันเก่า
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // ลบ cache เก่าที่ไม่ได้ใช้แล้ว
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
