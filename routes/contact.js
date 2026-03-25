const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', (req, res) => {
  const { name, phone, email, city, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Naam en bericht zijn verplicht.' });
  }
  db.prepare('INSERT INTO leads (name, phone, email, city, message) VALUES (?, ?, ?, ?, ?)').run(name, phone || '', email || '', city || '', message);
  res.json({ ok: true, message: 'Bericht ontvangen. We nemen zo snel mogelijk contact op.' });
});

router.get('/admin/all/list', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});

module.exports = router;
