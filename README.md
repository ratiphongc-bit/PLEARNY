# PLEARNY

เกมผจญภัยคณิตศาสตร์ภาษาไทยสำหรับนักเรียนประถม: มี 12 ด่าน, ความคืบหน้าแยกตามบัญชี Manus, ไอเทมที่ปลดล็อก/สวมใส่ได้ 
- **Demo:** https://plearny-l37tbtr8.manus.space
- **GitHub:** https://github.com/ratiphongc-bit/PLEARNY

## รันในเครื่อง

ต้องมี Node.js 22+, npm 10.9.2 และ Python 3.10+ พร้อม venv/pip เมื่อติดตั้ง FastAPI ครั้งแรก

```bash
npm install
npm run dev
```

`npm run dev` จะเริ่ม Next.js ที่ `http://localhost:3000` และ Python game service ภายในเครื่องที่ `127.0.0.1:8000` พร้อมกัน ส่วนพอร์ต Python ไม่เปิดให้ browser หรือเครือข่ายภายนอกเข้าถึงโดยตรง

โมเดล 3D โหลดจาก public storage URL ของเดโมและส่ง CORS สำหรับ local origin แล้ว จึงต้องมีอินเทอร์เน็ตเพื่อแสดงตัวละครเมื่อรันในเครื่อง

ถ้า Python ยังไม่มี FastAPI/Uvicorn สคริปต์จะติดตั้งเวอร์ชันที่ pin ไว้ใน `requirements.txt` ลง `.venv` ให้อัตโนมัติเมื่อเริ่ม dev; รันชุดทดสอบได้ด้วย `npm run test:python`

การ build/เริ่มโหมด production:

```bash
npm run build
npm run start
```

## Environment และข้อมูลผู้เล่น

Manus Webdev จัดเตรียมค่า `MANUS_PROJECT_ID`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL`, `MANUS_JWT_SECRET` และ `DATABASE_URL` ให้กับ runtime; ไม่ใส่ค่าจริงหรือ token ลง GitHub เดโมใช้ Manus OAuth และ managed MySQL โปรไฟล์/ความคืบหน้าสร้างเฉพาะเมื่อผู้เล่นล็อกอินครั้งแรก และมี key แยกด้วย Manus `openId` บัญชีใหม่เริ่มที่ด่าน 1

สำหรับการรันนอก Manus ให้คัดลอก `.env.example` เป็น `.env.local` และใส่ค่าจาก environment ที่ได้รับอนุญาต ฐานข้อมูล development และ production ของโปรเจกต์ Manus ใช้ข้อมูลชุดเดียวกัน จึงควรทดสอบด้วยบัญชี/ข้อมูลที่ไม่ก่อผลกระทบกับผู้เล่นจริง

## โครงสร้างหลัก

- `src/app/(student)/` — หน้า home, map, lesson, play, result, inventory และ profile
- `src/app/api/` — Manus OAuth/session, API ของผู้เล่น/ด่าน และ health check
- `src/lib/player/store.ts` — MySQL profile, progress, rewards และ equipment
- `backend/main.py` — FastAPI service สำหรับแคตตาล็อกด่าน, สร้างโจทย์, ตรวจคำตอบและ scoring
- `requirements.txt` — dependency versions ของ Python ที่ pin ไว้
- `scripts/run-dev.mjs`, `scripts/run-prod.mjs` — เปิด Python service และ Next.js ให้ทำงานร่วมกัน
- `public/manus-routes.json` — route manifest สำหรับหน้าเว็บ
