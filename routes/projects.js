const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const slugify = require('../utils/slugify');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBase = slugify(path.parse(file.originalname).name) || 'upload';
    cb(null, `${Date.now()}-${safeBase}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

function normalizeFlags(body) {
  return {
    is_featured: body.is_featured === 'on' || body.is_featured === '1' || body.is_featured === 1 || body.is_featured === true ? 1 : 0,
    is_published: body.is_published === 'on' || body.is_published === '1' || body.is_published === 1 || body.is_published === true ? 1 : 0
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE is_published = 1 ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/featured', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE is_published = 1 AND is_featured = 1 ORDER BY created_at DESC LIMIT 6').all();
  res.json(rows);
});

router.get('/admin/all/list', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/admin/:id', requireAuth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project niet gevonden.' });
  const images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC').all(req.params.id);
  res.json({ ...project, images });
});

router.get('/:slug', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE slug = ? AND is_published = 1').get(req.params.slug);
  if (!project) return res.status(404).json({ error: 'Project niet gevonden.' });
  const images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC').all(project.id);
  res.json({ ...project, images });
});

router.post('/admin/create', requireAuth, upload.fields([{ name: 'hero_image', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]), (req, res) => {
  const { title, place, region, service_type, short_description, full_description } = req.body;
  const { is_featured, is_published } = normalizeFlags(req.body);
  if (!title || !place || !short_description) {
    return res.status(400).json({ error: 'Titel, plaats en korte omschrijving zijn verplicht.' });
  }
  const slug = slugify(title);
  const heroFile = req.files?.hero_image?.[0];
  const heroImage = heroFile ? `/uploads/${heroFile.filename}` : null;

  try {
    const info = db.prepare(`
      INSERT INTO projects (title, slug, place, region, service_type, short_description, full_description, hero_image, is_featured, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, slug, place, region || '', service_type || '', short_description, full_description || '', heroImage, is_featured, is_published);

    const gallery = req.files?.gallery || [];
    const insertImage = db.prepare('INSERT INTO project_images (project_id, image_path, sort_order) VALUES (?, ?, ?)');
    gallery.forEach((file, index) => insertImage.run(info.lastInsertRowid, `/uploads/${file.filename}`, index));

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.json({ ok: true, project: created });
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Er bestaat al een project met deze titel/slug.' });
    }
    throw err;
  }
});

router.post('/admin/update/:id', requireAuth, upload.fields([{ name: 'hero_image', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]), (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project niet gevonden.' });

  const { title, place, region, service_type, short_description, full_description } = req.body;
  const { is_featured, is_published } = normalizeFlags(req.body);
  const heroFile = req.files?.hero_image?.[0];
  const heroImage = heroFile ? `/uploads/${heroFile.filename}` : existing.hero_image;
  const slug = slugify(title || existing.title);

  try {
    db.prepare(`
      UPDATE projects
      SET title = ?, slug = ?, place = ?, region = ?, service_type = ?, short_description = ?, full_description = ?, hero_image = ?, is_featured = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, slug, place, region || '', service_type || '', short_description, full_description || '', heroImage, is_featured, is_published, req.params.id);

    const gallery = req.files?.gallery || [];
    const currentCount = db.prepare('SELECT COUNT(*) as c FROM project_images WHERE project_id = ?').get(req.params.id).c;
    const insertImage = db.prepare('INSERT INTO project_images (project_id, image_path, sort_order) VALUES (?, ?, ?)');
    gallery.forEach((file, index) => insertImage.run(req.params.id, `/uploads/${file.filename}`, currentCount + index));

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json({ ok: true, project: updated });
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Er bestaat al een project met deze titel/slug.' });
    }
    throw err;
  }
});

router.post('/admin/delete/:id', requireAuth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project niet gevonden.' });
  const images = db.prepare('SELECT * FROM project_images WHERE project_id = ?').all(req.params.id);
  [...images.map((row) => row.image_path), project.hero_image].filter(Boolean).forEach((filePath) => {
    const fullPath = path.join(__dirname, '..', 'public', filePath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); } catch (_) {}
    }
  });
  db.prepare('DELETE FROM project_images WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
