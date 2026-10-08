# ShortURL — Short URL & QR Code System

ระบบสร้าง Short URL และ QR Code สำหรับจัดเก็บประวัติการสร้างลิงก์และนับจำนวนการเปิดใช้งาน พัฒนาด้วย React, Node.js/Express และ MySQL

## ฟังก์ชันของระบบ

- สมัครสมาชิกและเข้าสู่ระบบ
- กรอก URL ต้นฉบับที่ขึ้นต้นด้วย `http://` หรือ `https://`
- สร้าง Short URL และ QR Code อัตโนมัติ
- คลิก Short URL เพื่อ Redirect ไปยัง URL ต้นฉบับ
- ดาวน์โหลด QR Code และเปิด QR Code เพื่อใช้งานได้
- บันทึกประวัติ Short URL แยกตามผู้ใช้
- นับจำนวนครั้งที่มีการเปิด Short URL
- ออกจากระบบ

## เทคโนโลยีที่ใช้

- Frontend: React 19 + Vite
- Backend: Node.js + Express
- Database: MySQL 8.x
- Database driver: `mysql2`
- QR Code: `qrcode`
- Authentication: Express Session + bcrypt
- UI Font: Mitr

## โครงสร้างโปรเจกต์

```text
ShortURL/
├─ frontend/
│  ├─ index.html
│  └─ src/
│     ├─ App.jsx
│     ├─ api.js
│     ├─ main.jsx
│     ├─ styles.css
│     └─ components/
│        ├─ AuthPanel.jsx
│        ├─ CreateUrlForm.jsx
│        ├─ HistoryTable.jsx
│        └─ ShortUrlResult.jsx
├─ backend/
│  ├─ db.js
│  └─ server.js
├─ api/
│  └─ routes.js
├─ database.sql
├─ package.json
├─ vite.config.mjs
├─ start.bat
└─ .env.example
```

## ฐานข้อมูล

ไฟล์ `database.sql` จะสร้างฐานข้อมูล `shorturl` และตารางหลักดังนี้:

- `users` — ข้อมูลผู้ใช้และรหัสผ่านที่เข้ารหัสแล้ว
- `short_urls` — URL ต้นฉบับ, Short Code, QR Code และข้อมูลเจ้าของ
- `click_logs` — ประวัติการเปิด Short URL และจำนวนคลิก

## การติดตั้งและรันในเครื่อง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. สร้างฐานข้อมูล

เปิด `database.sql` ใน MySQL Workbench แล้วกด Execute

### 3. ตั้งค่า Environment Variables

```powershell
Copy-Item .env.example .env
```

แก้ค่าใน `.env` ให้ตรงกับ MySQL ในเครื่อง:

```env
PORT=3000
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=shorturl
DB_USER=root
DB_PASSWORD=รหัสผ่าน MySQL
```

### 4. Build และเริ่มระบบ

```bash
npm run build
npm start
```

เปิดเว็บที่ <http://localhost:3000>

หรือใช้ `start.bat` เพื่อเริ่มระบบอัตโนมัติ

## คำสั่งที่ใช้บ่อย

```bash
npm run build       # Build React สำหรับ Production
npm start           # เริ่ม Express server
npm run dev         # เริ่ม Backend แบบ watch mode
npm run client:dev  # เปิด Vite Frontend ที่พอร์ต 5173
```

## API หลัก

```text
POST /api/auth/register  สมัครสมาชิก
POST /api/auth/login     เข้าสู่ระบบ
POST /api/auth/logout    ออกจากระบบ
GET  /api/auth/me        ตรวจสอบผู้ใช้ปัจจุบัน
GET  /api/health         ตรวจสอบการเชื่อมต่อฐานข้อมูล
POST /api/urls           สร้าง Short URL และ QR Code
GET  /api/urls           ดูประวัติ Short URL ของผู้ใช้
GET  /s/:shortCode       Redirect ไปยัง URL ต้นฉบับและบันทึกจำนวนคลิก
```

## Deploy ด้วย Railway

โปรเจกต์ใช้ Node.js Service และ MySQL Service อยู่ใน Railway Project เดียวกัน:

```text
ShortURL (Node.js + React) → MySQL (Railway)
```

ตั้งค่า Service ของเว็บ:

```text
Build Command: npm install && npm run build
Start Command: npm start
```

ตัวแปรสำคัญของ Service `ShortURL`:

```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=root
DB_PASSWORD=${{MySQL.MYSQL_ROOT_PASSWORD}}
DB_NAME=shorturl
SESSION_SECRET=
```

นำไฟล์ `database.sql` ไปรันบน MySQL Service ของ Railway ก่อนใช้งาน แล้วตรวจสอบการเชื่อมต่อผ่าน:

```text
GET https://<railway-domain>/api/health
```

ผลลัพธ์ที่คาดหวัง:

```json
{"ok":true,"database":"connected"}
```

## ความปลอดภัย

- ห้าม Commit ไฟล์ `.env` หรือรหัสผ่านขึ้น GitHub
- ใช้ `.env.example` สำหรับตัวอย่างชื่อ Variables เท่านั้น
- ควรปิด Public Access ของ MySQL หลัง Import ฐานข้อมูลเสร็จ
- ควรใช้ `SESSION_SECRET` ที่เดายากในการ Deploy จริง
