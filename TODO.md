# PLEARNY Development TODO

## งานเดิมที่ส่งมอบแล้ว
- [x] นำเข้าโปรเจกต์ Next.js และติดตั้ง dependencies; ตรวจ `npm run dev`, lint และ production build ของเวอร์ชันก่อนหน้านี้
- [x] เผยแพร่เดโมสาธารณะและเพิ่มลิงก์เดโม/วิธีรันใน README ของ GitHub `ratiphongc-bit/PLEARNY` บน `main`

## บัญชี Manus และความคืบหน้าแยกผู้เล่น
- [x] ผู้เล่นเข้าสู่ระบบด้วย Manus OAuth จริงแทนปุ่ม Google/Phone แบบจำลอง; OAuth state ผูกกับ nonce แบบใช้ครั้งเดียว, ตรวจ callback ก่อนแลก code, สร้าง application session ที่ตรวจ HS256, expiry และ `appId`, ใช้ cookie `webdev_app_session` ที่รองรับ HTTPS Preview และมีทางออกจากระบบ; ตรวจ endpoint เริ่ม OAuth/callback origin และ attributes ของ state cookie แล้ว แต่ไม่ได้ consume token ของบัญชีจริงหรือสร้าง test profile ในฐานข้อมูลร่วม
- [x] API ของข้อมูลผู้เล่นปฏิเสธคำขอที่ไม่มี session ที่ตรวจสอบแล้ว; แยกข้อมูลด้วย Manus `openId`; สร้างโปรไฟล์ใหม่เฉพาะเมื่อยังไม่มี และบัญชีใหม่เริ่มที่ด่าน 1 โดยไม่มี XP/เหรียญ/ไอเทม/ความคืบหน้าจากบัญชีอื่น
- [x] เก็บความคืบหน้าใน managed MySQL ให้คงอยู่หลัง logout/restart และแยกต่อบัญชี; ห้ามเขียนค่าเริ่มต้นทับโปรไฟล์ที่มีอยู่
- [x] แยกผลการเล่นชั่วคราวใน browser ตาม `openId` และล้างผลค้างของบัญชีปัจจุบันเมื่อ logout เพื่อไม่ให้บัญชีใหม่เห็นผลเก่า

## แคมเปญ 12 ด่านและเกมเพลย์
- [x] ทำให้ด่านเดิม 1–6 เล่นและบันทึกผลได้จริง พร้อมเพิ่มด่าน 7–12; ทุกด่านมีคำถามคณิตศาสตร์ภาษาไทย 5 ข้อและระดับความยากไล่ขึ้นตามลำดับ
- [x] บัญชีใหม่เปิดได้เฉพาะด่าน 1; ต้องตอบถูกอย่างน้อย 3 ใน 5 ข้อจึงผ่านและปลดล็อกด่านถัดไป; ด่านที่เปิดแล้วเล่นซ้ำได้; คะแนน XP/เหรียญ/รางวัลและสถานะผ่านบันทึกในบัญชีผู้เล่น
- [x] แผนที่, หน้า home, lesson, play และ result ใช้ stage/progress จริง ไม่แสดงสถานะหรือผลรางวัลจากข้อมูล mock แบบ hardcode

## คลังไอเทมและการสวมใส่
- [x] แสดงรายการไอเทมที่ปลดล็อกและล็อกตามข้อมูลผู้เล่น; รางวัลใหม่จากการผ่านด่านเข้าคลังโดยไม่ทับของเดิม
- [x] ปุ่ม “สวมใส่” ทำงานเฉพาะไอเทมที่ปลดล็อก; สวมใส่ได้อย่างมากหนึ่งชิ้นต่อ slot (สัตว์เลี้ยง/ชุด/อุปกรณ์/เอฟเฟกต์), สลับหรือถอดได้ และสถานะคงอยู่หลังออกจากระบบ/เข้าใหม่
- [x] แสดงอุปกรณ์ที่สวมใส่อยู่บนตัวละครหรือ HUD ที่เกี่ยวข้อง และสะท้อนสถานะเดียวกันในทุกหน้า

## หัวใจและ streak (กำลังพัฒนา)
- [x] บัญชีใหม่เริ่มด้วยหัวใจ 5/5; เมื่อตอบผิดให้หักหัวใจ 1 ดวงทันทีหลัง server ตรวจคำตอบ; ฟื้น 1 ดวงทุก 30 นาทีจนเต็ม 5; เมื่อหัวใจเป็น 0 ห้ามเริ่ม attempt ใหม่ แต่อนุญาตให้จบ attempt ที่เริ่มไปแล้ว; คำตอบที่บันทึกแล้วห้ามหักซ้ำเมื่อ retry request
- [x] ทำ daily streak แยกตาม Manus `openId`; ส่งคำตอบครบ 5 ข้อ (ผ่านหรือไม่ผ่าน) ถือว่าเล่นในวันนั้น; วันแรกเริ่ม 1, เล่นวันถัดไปเพิ่ม 1, ขาดวันเริ่มใหม่ที่ 1, เล่นซ้ำวันเดียวกันไม่เพิ่ม; ใช้วันปฏิทิน `Asia/Bangkok`; เก็บ current streak, longest streak และวันที่เล่นล่าสุดใน managed MySQL
- [x] แสดงหัวใจ/เวลาฟื้นในหน้าเล่นและ HUD; แสดง streak ปัจจุบัน/สถิติสูงสุดบน HUD และหน้า profile; บัญชีอื่นต้องไม่เห็นหรือเปลี่ยนค่าของผู้เล่น
- [x] เพิ่ม additive migration ที่รักษา profiles เดิม; ตรวจ logic ด้วย tests แบบไม่เขียนข้อมูลผู้เล่นจริงลงฐานข้อมูลที่ใช้ร่วมกับ production

## Python และการเผยแพร่เดิม
- [x] เพิ่ม FastAPI service ภายใน container สำหรับ catalog/สร้างคำถาม/ตรวจคำตอบ/คำนวณคะแนน; service รับคำขอจาก Next.js ภายในเท่านั้น; สัดส่วน Python อยู่ประมาณ 10.02% ของ first-party JS/TS/Python source bytes (คำนวณจาก tracked และ untracked source ปัจจุบัน; ไม่นับ assets/build/dependencies)
- [x] ลงทะเบียน diagnostics สำหรับ TypeScript และ Python; `npm run lint`, TypeScript check, `npm run test:python` (5 tests), `npm run test:player`, production build และ `GET /manus-routes.json` ผ่าน; smoke test Next.js/FastAPI/health และ API ที่ไม่มี session ได้ผลตามคาด
- [x] แก้ Dockerfile ตามผล publish จริง: hosted build ไม่พบ `@tailwindcss/postcss` เพราะ `npm ci` ภายใต้ `NODE_ENV=production` ละ devDependencies; เปลี่ยนเป็น `npm ci --include=dev` และตรวจคำสั่งนี้ด้วย `NODE_ENV=production` พร้อม lint, Python tests, TypeScript check และ production build ที่ผ่าน
- [x] เผยแพร่ checkpoint `f16aaffef59bbf50094ca94c3d3426c71497d213` สำเร็จ; GitHub `main` อยู่ที่ commit `793e384cacd9e7891b4b6e67ce67bb69f7d04515`; เดโมตอบ HTTP 200, `/api/health` เป็น `ok`, `/api/auth/me` ตอบ 401 เมื่อไม่มี session ตามคาด

## ส่งมอบการเพิ่มหัวใจ/streak
- [x] ตรวจ lint, TypeScript, Python tests และ production build หลัง implementation; ตรวจ Preview โดยไม่สร้าง/ลบ player profile ทดสอบในฐานข้อมูลร่วม (GET `/login`, `/home` และ `/manus-routes.json` ตอบ HTTP 200; ไม่เรียก route ที่เขียนข้อมูลผู้เล่น)
- [x] commit/push source ที่เพิ่ม heart/streak ไปยัง GitHub `main`, บันทึก checkpoint ของ Manus, publish เวอร์ชันใหม่ และตรวจ HTTP readiness ก่อนส่งลิงก์ (GitHub heart/streak source commit=`c2673c8bbfa9ef020e57c9b81aa1a305007e7d27`; Manus feature checkpoint/published version=`fb0f53e746124ea377fc23158c206193bda0028b`; `/api/health` และ `/home` ตอบ HTTP 200 ที่ `https://plearny-l37tbtr8.manus.space`)
