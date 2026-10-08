const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

function getBaseUrl(req) {
  return (process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function makeShortCode(length = 7) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  next();
}

async function createUniqueShortCode(pool) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = makeShortCode();
    const [rows] = await pool.query('SELECT short_url_id FROM short_urls WHERE short_code = ? LIMIT 1', [code]);
    if (rows.length === 0) return code;
  }
  throw new Error('ไม่สามารถสร้างรหัส Short URL ที่ไม่ซ้ำได้');
}

function createApiRouter(pool) {
  const router = express.Router();

  router.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, database: 'connected' });
    } catch (error) {
      res.status(500).json({ ok: false, database: 'disconnected', message: error.message });
    }
  });

  router.get('/me', (req, res) => res.json({ user: req.session.user || null }));

  router.post('/auth/register', async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password || password.length < 6) {
        return res.status(400).json({ message: 'กรุณากรอก username, email และ password อย่างน้อย 6 ตัวอักษร' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username.trim(), email.trim().toLowerCase(), passwordHash]
      );
      req.session.user = { user_id: result.insertId, username: username.trim(), email: email.trim().toLowerCase() };
      res.status(201).json({ user: req.session.user });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Username หรือ Email นี้ถูกใช้งานแล้ว' });
      next(error);
    }
  });

  router.post('/auth/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const [rows] = await pool.execute(
        'SELECT user_id, username, email, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1',
        [username, username]
      );
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
        return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
      }
      req.session.user = { user_id: user.user_id, username: user.username, email: user.email };
      res.json({ user: req.session.user });
    } catch (error) { next(error); }
  });

  router.post('/auth/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

  router.get('/urls', requireAuth, async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        `SELECT su.short_url_id, su.original_url, su.short_code, su.qr_image_path,
                su.created_at, su.expires_at, su.is_active, COUNT(cl.click_id) AS click_count
         FROM short_urls su
         LEFT JOIN click_logs cl ON cl.short_url_id = su.short_url_id
         WHERE su.user_id = ?
         GROUP BY su.short_url_id, su.original_url, su.short_code, su.qr_image_path,
                  su.created_at, su.expires_at, su.is_active
         ORDER BY su.created_at DESC`,
        [req.session.user.user_id]
      );
      res.json({ urls: rows.map((row) => ({ ...row, click_count: Number(row.click_count), short_url: `${getBaseUrl(req)}/s/${row.short_code}` })) });
    } catch (error) { next(error); }
  });

  router.post('/urls', requireAuth, async (req, res, next) => {
    try {
      const { originalUrl } = req.body;
      if (!originalUrl || !isValidHttpUrl(originalUrl.trim())) {
        return res.status(400).json({ message: 'กรุณากรอก URL ที่ขึ้นต้นด้วย http:// หรือ https://' });
      }
      const shortCode = await createUniqueShortCode(pool);
      const [result] = await pool.execute(
        'INSERT INTO short_urls (user_id, original_url, short_code) VALUES (?, ?, ?)',
        [req.session.user.user_id, originalUrl.trim(), shortCode]
      );
      const shortUrl = `${getBaseUrl(req)}/s/${shortCode}`;
      const qrCode = await QRCode.toDataURL(shortUrl, { width: 320, margin: 2 });
      res.status(201).json({ id: result.insertId, original_url: originalUrl.trim(), short_code: shortCode, short_url: shortUrl, qr_code: qrCode });
    } catch (error) { next(error); }
  });

  router.get('/urls/:id/qr', requireAuth, async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT short_code FROM short_urls WHERE short_url_id = ? AND user_id = ? LIMIT 1',
        [req.params.id, req.session.user.user_id]
      );
      if (!rows[0]) return res.status(404).json({ message: 'ไม่พบ Short URL' });
      const shortUrl = `${getBaseUrl(req)}/s/${rows[0].short_code}`;
      res.json({ qr_code: await QRCode.toDataURL(shortUrl, { width: 320, margin: 2 }), short_url: shortUrl });
    } catch (error) { next(error); }
  });

  return router;
}

function createRedirectRouter(pool) {
  const router = express.Router();
  router.get('/:code', async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT short_url_id, original_url, expires_at, is_active FROM short_urls WHERE short_code = ? LIMIT 1',
        [req.params.code]
      );
      const record = rows[0];
      if (!record || !record.is_active || (record.expires_at && new Date(record.expires_at) < new Date())) {
        return res.status(404).send('ไม่พบ Short URL หรือ Short URL หมดอายุแล้ว');
      }
      await pool.execute(
        'INSERT INTO click_logs (short_url_id, ip_address, user_agent) VALUES (?, ?, ?)',
        [record.short_url_id, req.ip, req.get('user-agent') || null]
      );
      res.redirect(record.original_url);
    } catch (error) { next(error); }
  });
  return router;
}

module.exports = { createApiRouter, createRedirectRouter };
