# TripPlanner 8.3

เว็บวางแผนทริปภาษาไทย ใช้ **Google Apps Script → GitHub Pages** ตามลำดับเดิม

**เว็บใช้งาน:** [basssg.github.io/TripPlanner](https://basssg.github.io/TripPlanner/) · **GAS:** [เปิดโปรเจกต์](https://script.google.com/home/projects/1KMuYaHImc-CAzdRQwJye8kYO27sYch9QSjqb-_OaSDkfJFHZNTonprU6/edit)

## API และการตั้งค่า — เริ่มอ่านตรงนี้

คีย์ทั้งหมดใส่ที่ **GAS → Project Settings → Script Properties** เท่านั้น ไม่ใส่ใน GitHub, HTML, localStorage หรือ URL

| Script Property | ใช้กับอะไร | จำเป็น / ค่าเริ่มต้น |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | OpenRouter Chat Completions สำหรับสร้างแผน | จำเป็น; ยังรองรับ `AI_API_KEY` เดิม ถ้ามีทั้งสองชื่อจะใช้ชื่อใหม่นี้ก่อน |
| `AI_API_KEY` | ชื่อเก่าของคีย์ **OpenRouter** ไม่ใช่คีย์ Google AI Studio | ใช้ต่อได้โดยไม่ต้องย้ายคีย์ |
| `BRAVE_API_KEY` | Brave Search เพื่อหาแหล่งข้อมูลประกอบก่อนวางแผน | ไม่บังคับ; ถ้าไม่มีหรือค้นไม่ได้ ยังสร้างแผน AI ได้และแสดงข้อจำกัด |
| `AI_MODEL` | Model ID จาก OpenRouter | `google/gemini-3.8-flash` ตรวจว่ามีและรองรับ structured outputs จาก catalog เมื่อ 12 ต.ค. 2026 |
| `MAX_DAILY_AI_REQUESTS` | เพดานเรียก AI ของ **ทั้งแอป** ต่อวัน | `60`; ทุกการลองใหม่คิดเป็นคำขอหนึ่งครั้ง ตั้ง `0` เพื่อหยุดเรียก AI |
| `MAX_DAILY_SEARCH_REQUESTS` | เพดานค้น Brave ของทั้งแอปต่อวัน | `80`; ผลค้นที่มี cache ไม่เรียก API ซ้ำ |
| `ALLOWED_PARENT_ORIGINS` | รายชื่อ origin ที่เชื่อมกับ GAS ผ่าน iframe bridge ได้ คั่นด้วย comma | `https://basssg.github.io,http://localhost:4173,http://127.0.0.1:4173` |
| `APP_ENABLED` | เปิด/พักการสร้างแผนใหม่ | `true`; ตั้ง `false` เพื่อพัก โดยแผนในเครื่องยังเปิดได้ |

**ค่าตั้งเซิร์ฟเวอร์และชื่อคีย์อยู่ด้านบนของ `apps-script/Code.gs`** ส่วน **GAS URL, ลิงก์เว็บ GitHub Pages, ลิงก์โปรเจกต์ และค่าหน้าเว็บอยู่ด้านบนของ `app-config.js`** ไม่มีค่าลับในไฟล์เหล่านี้

- AI endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Search endpoint: `https://api.search.brave.com/res/v1/web/search`
- Brave ใช้ `search_lang=th` และ `country=ALL` เพราะรายการประเทศที่ API รองรับไม่มี `TH` (เป็นสาเหตุหนึ่งที่การค้นเดิมล้มเหลว)
- Google Maps ใช้ลิงก์ค้นสถานที่ตาม [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) จึงไม่ต้องมี Maps API key: พิมพ์ชื่อจุดหมายแล้วกด **ค้นจุดหมายใน Google Maps** หรือกดลิงก์สถานที่ในแผน Maps จะเปิดแยกต่างหาก
- การเลือกสถานที่ด้วยแผนที่/Autocomplete **ภายในหน้า TripPlanner** ยังไม่ได้เปิดใช้ เพราะต้องมี Google Maps JavaScript/Places API key ที่จำกัด HTTP referrer และเปิดบัญชีเรียกเก็บเงิน การเปิด Maps ภายนอกแล้วกลับมาใส่ชื่อสถานที่ทำงานได้ทันทีโดยไม่ต้องเพิ่มคีย์
- รูปและไอคอนเก็บใน repo; Google Fonts มี system font สำรอง ไม่ต้องมี API key
- เมนู **การเชื่อมต่อ & API** ในแอปแสดงว่าพบคีย์หรือไม่และชื่อโมเดล โดยไม่ส่งค่าคีย์มาที่เบราว์เซอร์
- ตัวนับรายวัน `TRIP_USAGE_AI` / `TRIP_USAGE_SEARCH` จัดการโดยระบบและรีเซ็ตตามวันที่เวลาไทย ไม่ต้องกรอกเอง

## ใช้งานได้อะไรบ้าง

- วางแผน 1–30 วัน สำหรับผู้ใหญ่และเด็ก รวมไม่เกิน 50 คน ระบุวันเริ่มเดินทางได้
- เลือกต้นทางหรืออยู่ที่ปลายทางแล้ว งบ **รวมทุกคน** วิธีเดินทาง ความสนใจ และเงื่อนไขส่วนตัว
- สร้างแผนทีละ 4 วัน แสดงสถานะตามงานจริง ลองสร้างต่อได้หากคำขอสะดุด โดยช่วงวันที่สร้างแล้วไม่เรียก AI ซ้ำ
- แผนรายวันพร้อมเวลา สถานที่ เคล็ดลับ ที่พัก และลิงก์ Maps; ไม่สร้างคะแนนรีวิวปลอม
- รวมค่าใช้จ่ายด้วยโค้ด ตัดการนับที่พักซ้ำ และไม่คิดที่พักคืนสุดท้าย แสดงส่วนที่เกินงบโดยไม่ลดตัวเลขให้ดูเหมือนพอ
- แสดงแหล่งข้อมูลค้นเว็บและเวลาที่ค้น **ทุกยอดยังเป็นราคาโดยประมาณ** ไม่มีข้อความอ้างว่าจองแล้วหรือยืนยันราคาแล้ว
- กรองแหล่งอ้างอิงให้เกี่ยวข้องกับจุดหมาย รวมถึงตอนเปิดแผนเก่า/นำเข้า หากผลค้นไม่ตรงจะไม่แสดงเป็นข้อมูลประกอบทริป
- บันทึกอัตโนมัติ ค้นและเปิดแผนเก่าได้ เช็กลิสต์จัดกระเป๋า นำเข้า/ส่งออก JSON แชร์และคัดลอกแผนทุกวันพร้อมลิงก์ Maps
- ปุ่ม **ส่งพิกัดตอนนี้** ขอสิทธิ์ตำแหน่งเมื่อกดเท่านั้น สร้างลิงก์ Google Maps แล้วให้เลือกแชร์/คัดลอกเองครั้งเดียว ไม่มีการติดตามสดหรือบันทึกพิกัดลงแผน, localStorage หรือ GAS; ต้องเปิดเว็บผ่าน HTTPS และอนุญาตตำแหน่งในเบราว์เซอร์ ผู้รับลิงก์เปิดดูพิกัด ณ เวลาที่แชร์ในภายหลังได้
- หากเปิดแอปผ่านหน้า GAS ที่ฝังใน iframe แล้วตำแหน่งถูกบล็อก ให้เปิดผ่าน GitHub Pages ตามลิงก์ในหน้าต่างแชร์พิกัด; สิทธิ์ของ iframe ขึ้นกับเบราว์เซอร์และนโยบายของ Google
- เมื่อกำหนดวันเริ่มเดินทาง สามารถดาวน์โหลดไฟล์ `.ics` เพื่อเพิ่มเตือนในแอปปฏิทินเวลา **09:00 น. ตามเวลาไทย ก่อนเดินทาง 1 วัน** ต้องเปิดไฟล์และยืนยันเพิ่มลงปฏิทินก่อนจึงจะได้รับแจ้งเตือน ทั้งนี้แอปปฏิทินและอุปกรณ์เป็นผู้จัดการแจ้งเตือน
- ส่งออก PNG เป็น **รายวัน**; พิมพ์ / Save as PDF ครบทุกวันผ่านหน้าพิมพ์ของเบราว์เซอร์
- ติดตั้งเป็น PWA ใน GitHub Pages; เปิดแอปและแผนที่บันทึกไว้แบบออฟไลน์ได้หลังโหลดครั้งแรก
- รองรับมือถือ แท็บเล็ต คอม การซูม คีย์บอร์ด screen reader และ reduced motion
- ธีมมืดเป็นค่าเริ่มต้น ใช้พื้นกรมท่าเข้ม สีฟ้าหม่น และทองอ่อน ตัวอักษรสีอ่อน และหน้าตั้งค่า/โหลด/ออฟไลน์ในธีมเดียวกัน; การพิมพ์ยังใช้พื้นขาวเพื่อประหยัดหมึก
- โลโก้และไอคอนใหม่ใช้ต้นฉบับเดียวกันทั้งเว็บและแอป มี SVG/PNG ขนาด 16–1024px พร้อม wordmark แบบเส้นเวกเตอร์และ favicon; รายละเอียดดู [BRAND.md](BRAND.md)

แผนบันทึกในเบราว์เซอร์ที่ใช้งาน **ไม่ซิงก์ข้ามอุปกรณ์** ให้ส่งออก JSON เพื่อสำรองหรือย้ายเครื่อง การสร้างแผนใหม่ Maps และแหล่งอ้างอิงต้องใช้อินเทอร์เน็ต แผนเก่าใน `tripPlans` จะย้ายเข้าเวอร์ชันใหม่ถ้าอยู่ใน origin เดียวกัน โดยเก็บข้อมูลเก่าไว้ การเปิดจาก GAS โดยตรงกับ GitHub Pages ใช้พื้นที่จัดเก็บคนละที่

การแจ้งเตือนแบบ Push ขณะปิดเว็บยังไม่ได้เปิดใช้: ต้องมีระบบเก็บการสมัครรับแจ้งเตือนอย่างปลอดภัยและเซิร์ฟเวอร์ส่ง Push พร้อม Service Worker; บน iPhone ต้องเพิ่มเว็บไปยังหน้าจอหลักก่อนรับ Web Push ได้ การแชร์พิกัดครั้งเดียวและไฟล์เตือนปฏิทินข้างต้นใช้งานได้โดยไม่เพิ่มบริการนี้

## ไฟล์ไหนแก้อะไร

| ไฟล์ | หน้าที่ |
| --- | --- |
| `app-config.js` | จุดตั้งค่า URL และค่าหน้าเว็บรวมด้านบน |
| `apps-script/Code.gs` | API / โมเดล / การตรวจข้อมูล / การสร้างแผน / เพดานคำขอ |
| `apps-script/Bridge.html` | การเชื่อมหน้าเว็บกับ `google.script.run` จำกัด origin, nonce และฟังก์ชันที่เรียกได้ |
| `src/index.html` | โครงหน้าเว็บต้นฉบับ |
| `src/styles.css` | ธีม responsive / animation / print |
| `src/theme.css` | สีธีมมืด ลดพื้นขาวและรักษาความชัดในการอ่าน |
| `src/model.js` | ตรวจข้อมูล นำเข้า คำนวณค่าใช้จ่าย และข้อความสำหรับแชร์ |
| `src/app.js` | ฟอร์ม การเชื่อมต่อ สร้างทริป บันทึก และส่งออก |
| `src/service-worker.js` | ต้นฉบับระบบออฟไลน์ |
| `index.html`, `apps-script/index.html`, `service-worker.js` | **ไฟล์สร้างอัตโนมัติ** ด้วย `npm run build` ไม่แก้แยกจาก `src/` |

ใช้ UI ต้นฉบับชุดเดียวสร้างทั้ง GitHub Pages และ GAS เพื่อป้องกันสองเวอร์ชันไม่ตรงกัน GAS ได้ HTML ที่รวม CSS/JS/รูปหลักไว้แล้ว จึงเปิดโดยตรงได้ด้วย ไม่มี framework หรือ npm dependency ที่ต้องอัปเดตเพื่อรันเว็บ

## พัฒนาและอัปเดต GAS → GitHub

ต้องมี Node.js 20+ และ `clasp` ที่ล็อกอินกับบัญชีผู้ดูแลโปรเจกต์ ไม่ต้อง `npm install` เพราะไม่มี dependency

```powershell
npm run build
npm run check
npm test
npm run dev
```

เปิด `http://127.0.0.1:4173/` สำหรับตรวจ UI เมื่อต้องการทดสอบ API ผ่านเครื่องนี้ GAS ต้องมี origin นี้ใน `ALLOWED_PARENT_ORIGINS` (มีให้แล้วในค่าเริ่มต้น)

1. แก้ `src/` หรือ `apps-script/Code.gs` แล้วรัน build/check/test ตามด้านบน
2. `.clasp.json` ระบุ Script ID เดิมและ `rootDir: apps-script` ใช้ `clasp status` ตรวจว่ามีแค่ `Code.gs`, `Bridge.html`, `index.html`, `appsscript.json`
3. `clasp push --force` อัปเดตโค้ดที่บันทึกบน GAS โดยไม่แตะ Script Properties `--force` ยืนยันการเขียน manifest เดิมของโปรเจกต์นี้
4. ทดสอบผ่าน GAS → Deploy → Test deployments (`/dev`) ซึ่งอ่านโค้ดที่บันทึกล่าสุด
5. เมื่อทดสอบผ่าน สร้างเวอร์ชันด้วย `clasp version "TripPlanner update"` แล้วอัปเดต **deployment เดิม** เพื่อคง URL

```powershell
clasp redeploy AKfycbzQvAenA1EFR85qv5CTy88BxJIR0EL0KKm7GWkY5lFnLWZJdQBpsV7rcjGumQyYCxvfgw --versionNumber VERSION_NUMBER --description "TripPlanner update"
```

6. Commit/push หรือรวม PR เข้า `main` GitHub Pages ใช้ `main /` และจะเผยแพร่เว็บใหม่ ระบบ CI ตรวจ build, secrets, ไอคอน และ regression tests

หากแก้ backend ผ่าน GAS Editor ก่อน ให้ `clasp pull` มารับ `Code.gs` ที่แก้แล้วก่อนทำขั้นตอนถัดไป ถ้าแก้ UI ให้แก้ต้นฉบับใน `src/` แล้ว build ก่อนส่งขึ้น GAS เพื่อไม่ให้หน้าเว็บสองฝั่งแยกกัน

ไอคอน PNG รวมอยู่ใน repo แล้ว หากแก้ artwork บน Windows ให้รัน `powershell -NoProfile -File scripts/icons.ps1` เพื่อสร้างใหม่

## เมื่อใช้งานติดขัด

| อาการ | ตรวจ / แก้ |
| --- | --- |
| หน้า GitHub เปิดได้แต่สร้างแผนไม่ได้ | เมนูการเชื่อมต่อ & API → ลองเชื่อมต่อใหม่ → ตรวจ GAS deployment URL และ origin ที่อนุญาต |
| `AI_AUTH` | คีย์ต้องเป็น OpenRouter; ตรวจคีย์ใน Script Properties |
| `AI_CREDIT` | เครดิต OpenRouter ไม่พอ ตรวจบัญชีที่ออกคีย์ |
| `AI_MODEL` / `AI_CONFIG` | เปลี่ยน `AI_MODEL` เป็นโมเดลใน [OpenRouter catalog](https://openrouter.ai/api/v1/models) ที่รองรับ `structured_outputs` และ `response_format` |
| `DAILY_LIMIT` | ถึงเพดานของแอป รอวันถัดไปตามเวลาไทย หรือผู้ดูแลปรับเพดานที่ต้องการ |
| ข้อมูลสร้างแผนหมดอายุ | ทริประหว่างสร้างเก็บชั่วคราว 30 นาที CacheService อาจคืนพื้นที่ก่อนกำหนด ให้เริ่มสร้างใหม่ แผนที่บันทึกแล้วไม่กระทบ |
| Safari / browser บล็อก iframe | กด **เปิดผ่าน GAS** ที่แถบแจ้งเตือนเพื่อใช้หน้าเดียวกันโดยตรง |
| บันทึกแผนไม่ได้ | แอปแจ้งให้ส่งออก JSON; ตรวจพื้นที่เบราว์เซอร์ โหมด private และการอนุญาต storage |
| บันทึกเก่าหายเมื่อสลับอุปกรณ์/เบราว์เซอร์ | พื้นที่เก็บอยู่คนละที่ นำเข้าไฟล์ JSON ที่สำรองไว้ |
| เห็นแจ้งว่ามีเวอร์ชันใหม่ | กด **อัปเดตตอนนี้** หลังสร้างแผนเสร็จ ระบบไม่บังคับ reload ระหว่างสร้างทริป |

เพดานคำขอของ GAS/OpenRouter/Brave ยังใช้ตามบัญชีผู้ให้บริการ แอปสาธารณะใช้เพดานรายวันทั้งแอปควบคุมจำนวนเรียก API; การจำกัดต่อเบราว์เซอร์ช่วยลดคำขอซ้ำ แต่ไม่ได้เป็นระบบล็อกอิน

## สิ่งที่แก้จากเวอร์ชันเดิม

- ชื่อฟังก์ชัน Gemini ทั้งที่เรียก OpenRouter → ตั้งค่าผู้ให้บริการและโมเดลชัดเจน รองรับคีย์เก่า
- ขอ JSON ด้วยข้อความอย่างเดียว / ตัดแผนเหลือ 4,000 ตัวอักษรก่อนรวมราคา → strict JSON schema, ตรวจจำนวนวันและเวลา, แยกช่วงวันโดยไม่ตัดแผนที่สร้างแล้ว
- ติ๊ก “ตรวจสอบราคาแล้ว” แม้ค้นไม่ได้ / ใช้ query ปี 2024–2025 → แสดงแหล่งข้อมูลจริง ใช้ปีของทริป ระบุข้อจำกัดและราคาโดยประมาณ
- ยอดเงินจาก AI ไม่ตรงกัน → คำนวณจากกิจกรรมและที่พักด้วยโค้ดทั้ง server และ client
- helper เรียกจาก browser ได้ → helpers ลงท้าย `_`, bridge เรียกได้เฉพาะฟังก์ชันที่กำหนด
- splash ปิดตามเวลา 2 วินาที → UI แสดงสถานะการเชื่อมต่อและ loading ตามขั้นตอนจริง พร้อมลองสร้างต่อ
- พาธ worker/cache เป็น `/` และ manifest ชี้ออกไป GAS → scope อยู่ใน `/TripPlanner/`, มี offline shell และไอคอนในเครื่อง ไม่ล้าง cache ของแอปอื่น
- ปิดซูม ปิด scroll และ selection → เปิดพฤติกรรมเบราว์เซอร์ปกติ พร้อม layout มือถือและ safe area

รายละเอียดการทดสอบและผลเผยแพร่ดู [VALIDATION.md](VALIDATION.md) รูป/ฟอนต์ดู [ASSETS.md](ASSETS.md)

อ้างอิงการเชื่อมต่อ: [Apps Script communication](https://developers.google.com/apps-script/guides/html/communication), [Apps Script web apps](https://developers.google.com/apps-script/guides/web), [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs), [Brave web search parameters](https://api-dashboard.search.brave.com/api-reference/web/search/get)
