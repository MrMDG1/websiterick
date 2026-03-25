const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const base = path.parse(file.originalname).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'icon';
    cb(null, `${Date.now()}-${base}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.mimetype))
});

function boolish(v) {
  return v === 'on' || v === '1' || v === 1 || v === true ? 1 : 0;
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM services WHERE is_published = 1 ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
});

router.get('/admin/all/list', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
});

router.get('/admin/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Dienst niet gevonden.' });
  res.json(row);
});

router.post('/admin/create', requireAuth, upload.single('icon_image_file'), (req, res) => {
  const { title, description, icon_key, sort_order } = req.body;
  const is_published = boolish(req.body.is_published);
  if (!title || !description) return res.status(400).json({ error: 'Titel en beschrijving zijn verplicht.' });
  const file = req.file;
  const iconImage = file ? `/uploads/${file.filename}` : null;
  const info = db.prepare(`
    INSERT INTO services (title, description, icon_key, icon_image, sort_order, is_published, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(title, description, icon_key || 'hammer', iconImage, Number(sort_order || 0), is_published);
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid);
  res.json({ ok: true, service: row });
});

router.post('/admin/update/:id', requireAuth, upload.single('icon_image_file'), (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Dienst niet gevonden.' });
  const { title, description, icon_key, sort_order, remove_icon_image } = req.body;
  const is_published = boolish(req.body.is_published);
  let iconImage = existing.icon_image;
  if (remove_icon_image === 'on' || remove_icon_image === '1') iconImage = null;
  if (req.file) iconImage = `/uploads/${req.file.filename}`;
  db.prepare(`
    UPDATE services
    SET title = ?, description = ?, icon_key = ?, icon_image = ?, sort_order = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title || existing.title, description || existing.description, icon_key || 'hammer', iconImage, Number(sort_order || 0), is_published, req.params.id);
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json({ ok: true, service: row });
});

router.post('/admin/delete/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Dienst niet gevonden.' });
  if (existing.icon_image) {
    const full = path.join(__dirname, '..', 'public', existing.icon_image.replace(/^\//, ''));
    if (fs.existsSync(full)) { try { fs.unlinkSync(full); } catch (_) {} }
  }
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
