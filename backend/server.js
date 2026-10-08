const path = require('node:path');
const express = require('express');
const session = require('express-session');
const pool = require('./db');
const { createApiRouter, createRedirectRouter } = require('../api/routes');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'shorturl-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));

app.use('/api', createApiRouter(pool));
app.use('/s', createRedirectRouter(pool));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์', detail: error.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Short URL app is running on port ${port}`);
});
