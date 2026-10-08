# Shortly — Short URL & QR Code

## 1. เตรียมฐานข้อมูล

สร้างฐานข้อมูลและตาราง `users`, `short_urls`, `click_logs` ตาม SQL ที่ให้ไว้ก่อนหน้านี้

สามารถเปิดไฟล์ `database.sql` ใน MySQL Workbench แล้วกด Execute ได้เลย

## 2. ตั้งค่าเชื่อมต่อ MySQL

คัดลอก `.env.example` เป็น `.env` แล้วแก้ค่า `DB_PASSWORD` ให้ตรงกับรหัสผ่าน MySQL ของเครื่อง

```powershell
Copy-Item .env.example .env
```

ถ้าใช้ MySQL ที่พอร์ตอื่น ให้แก้ `DB_PORT` ด้วย

## 3. ติดตั้งและรัน

```powershell
npm install
npm start
```

เปิดเว็บที่ <http://localhost:3000>

หรือดับเบิลคลิก `start.bat` เพื่อให้โปรเจกต์ติดตั้ง dependencies และเริ่มเซิร์ฟเวอร์อัตโนมัติ

## ฟังก์ชันที่มีให้แล้ว

- สมัครสมาชิกและเข้าสู่ระบบ
- สร้าง Short URL จาก URL ต้นฉบับ
- สร้าง QR Code แบบอัตโนมัติ
- คัดลอก Short URL และดาวน์โหลด QR Code
- Redirect ผ่าน `/s/:short_code`
- บันทึกประวัติการคลิกลง `click_logs`
- แสดงประวัติ Short URL และจำนวนคลิก

## โครงสร้าง Frontend (React)

```text
frontend/
├─ index.html
└─ src/
   ├─ main.jsx                # จุดเริ่มต้น React
   ├─ App.jsx                 # จัดการ state หลักของเว็บ
   ├─ api.js                  # เรียก REST API ของ Node.js
   ├─ styles.css              # CSS ของ React frontend
   └─ components/
      ├─ AuthPanel.jsx        # Login และ Register
      ├─ CreateUrlForm.jsx    # ฟอร์มสร้าง Short URL ในหน้าเดียว
      ├─ ShortUrlResult.jsx   # ผลลัพธ์ Short URL และ QR Code
      └─ HistoryTable.jsx     # ประวัติและจำนวนคลิก

├─ dist/                      # ไฟล์ React ที่ build แล้วสำหรับ Express

backend/
├─ server.js                  # Express server และ static file server
└─ db.js                      # MySQL connection pool

api/
└─ routes.js                  # API routes และ Short URL redirect
```

## คำสั่งสำหรับ React

รัน Frontend แบบ Development:

```powershell
npm run client:dev
```

แล้วเปิด <http://localhost:5173> โดยต้องเปิด Backend ที่พอร์ต 3000 ควบคู่กัน

สร้างไฟล์ Production:

```powershell
npm run build
npm start
```

จากนั้นเปิด <http://localhost:3000>
```
