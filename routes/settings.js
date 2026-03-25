const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  res.json(settings);
});

router.post('/admin/update', requireAuth, (req, res) => {
  const { business_name, phone, whatsapp, email, region_text, hero_title, hero_subtitle, home_card_1_label, home_card_1_title, home_card_1_text, home_card_2_label, home_card_2_title, home_card_2_text, home_card_3_label, home_card_3_title, home_card_3_text, emergency_enabled } = req.body;
  db.prepare(`
    UPDATE site_settings
    SET business_name = ?, phone = ?, whatsapp = ?, email = ?, region_text = ?, hero_title = ?, hero_subtitle = ?,
        home_card_1_label = ?, home_card_1_title = ?, home_card_1_text = ?,
        home_card_2_label = ?, home_card_2_title = ?, home_card_2_text = ?,
        home_card_3_label = ?, home_card_3_title = ?, home_card_3_text = ?,
        emergency_enabled = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    business_name, phone, whatsapp, email, region_text, hero_title, hero_subtitle,
    home_card_1_label, home_card_1_title, home_card_1_text,
    home_card_2_label, home_card_2_title, home_card_2_text,
    home_card_3_label, home_card_3_title, home_card_3_text,
    emergency_enabled ? 1 : 0
  );

  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  res.json({ ok: true, settings });
});

module.exports = router;
