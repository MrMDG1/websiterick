const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

function normalizeFlags(body) {
  return {
    is_featured: body.is_featured === 'on' || body.is_featured === '1' || body.is_featured === 1 || body.is_featured === true ? 1 : 0,
    is_published: body.is_published === 'on' || body.is_published === '1' || body.is_published === 1 || body.is_published === true ? 1 : 0
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews WHERE is_published = 1 ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/featured', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews WHERE is_published = 1 AND is_featured = 1 ORDER BY created_at DESC LIMIT 6').all();
  res.json(rows);
});

router.get('/admin/all/list', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/admin/:id', requireAuth, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review niet gevonden.' });
  res.json(review);
});

router.post('/admin/create', requireAuth, (req, res) => {
  const { customer_name, place, review_text, stars } = req.body;
  const { is_featured, is_published } = normalizeFlags(req.body);
  if (!customer_name || !review_text) {
    return res.status(400).json({ error: 'Naam en review zijn verplicht.' });
  }
  const info = db.prepare(`
    INSERT INTO reviews (customer_name, place, review_text, stars, is_featured, is_published)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(customer_name, place || '', review_text, Number(stars || 5), is_featured, is_published);
  const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid);
  res.json({ ok: true, review: created });
});

router.post('/admin/update/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Review niet gevonden.' });
  const { customer_name, place, review_text, stars } = req.body;
  const { is_featured, is_published } = normalizeFlags(req.body);
  db.prepare(`
    UPDATE reviews
    SET customer_name = ?, place = ?, review_text = ?, stars = ?, is_featured = ?, is_published = ?
    WHERE id = ?
  `).run(customer_name, place || '', review_text, Number(stars || 5), is_featured, is_published, req.params.id);
  const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  res.json({ ok: true, review: updated });
});

router.post('/admin/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
