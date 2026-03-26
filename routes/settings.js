const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  res.json(settings);
});

router.post('/admin/update', requireAuth, (req, res) => {
  const {
    business_name, phone, whatsapp, email, region_text,
    hero_eyebrow, hero_title, hero_subtitle, hero_note, emergency_text,
    hero_point_1, hero_point_2, hero_point_3,
    panel_kicker, panel_title, panel_text,
    stat_1_title, stat_1_text, stat_2_title, stat_2_text,
    stat_3_title, stat_3_text, stat_4_title, stat_4_text,
    home_card_1_label, home_card_1_title, home_card_1_text,
    home_card_2_label, home_card_2_title, home_card_2_text,
    home_card_3_label, home_card_3_title, home_card_3_text,
    home_services_eyebrow, home_services_title, home_services_text, home_services_cta,
    services_page_eyebrow, services_page_title, services_page_text, services_cta_title, services_cta_text,
    projects_page_eyebrow, projects_page_title, projects_page_text,
    over_page_eyebrow, over_page_title, over_page_text,
    over_value_1, over_value_2, over_value_3, over_value_4, over_value_5,
    over_region_title, over_region_text, over_region_note, over_cta_title, over_cta_text,
    contact_page_eyebrow, contact_page_title, contact_page_text, contact_strip_1, contact_strip_2, contact_strip_3, contact_form_note,
    emergency_enabled
  } = req.body;

  db.prepare(`
    UPDATE site_settings
    SET business_name = ?, phone = ?, whatsapp = ?, email = ?, region_text = ?,
        hero_eyebrow = ?, hero_title = ?, hero_subtitle = ?, hero_note = ?, emergency_text = ?,
        hero_point_1 = ?, hero_point_2 = ?, hero_point_3 = ?,
        panel_kicker = ?, panel_title = ?, panel_text = ?,
        stat_1_title = ?, stat_1_text = ?, stat_2_title = ?, stat_2_text = ?,
        stat_3_title = ?, stat_3_text = ?, stat_4_title = ?, stat_4_text = ?,
        home_card_1_label = ?, home_card_1_title = ?, home_card_1_text = ?,
        home_card_2_label = ?, home_card_2_title = ?, home_card_2_text = ?,
        home_card_3_label = ?, home_card_3_title = ?, home_card_3_text = ?,
        home_services_eyebrow = ?, home_services_title = ?, home_services_text = ?, home_services_cta = ?,
        services_page_eyebrow = ?, services_page_title = ?, services_page_text = ?, services_cta_title = ?, services_cta_text = ?,
        projects_page_eyebrow = ?, projects_page_title = ?, projects_page_text = ?,
        over_page_eyebrow = ?, over_page_title = ?, over_page_text = ?,
        over_value_1 = ?, over_value_2 = ?, over_value_3 = ?, over_value_4 = ?, over_value_5 = ?,
        over_region_title = ?, over_region_text = ?, over_region_note = ?, over_cta_title = ?, over_cta_text = ?,
        contact_page_eyebrow = ?, contact_page_title = ?, contact_page_text = ?, contact_strip_1 = ?, contact_strip_2 = ?, contact_strip_3 = ?, contact_form_note = ?,
        emergency_enabled = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    business_name, phone, whatsapp, email, region_text,
    hero_eyebrow, hero_title, hero_subtitle, hero_note, emergency_text,
    hero_point_1, hero_point_2, hero_point_3,
    panel_kicker, panel_title, panel_text,
    stat_1_title, stat_1_text, stat_2_title, stat_2_text,
    stat_3_title, stat_3_text, stat_4_title, stat_4_text,
    home_card_1_label, home_card_1_title, home_card_1_text,
    home_card_2_label, home_card_2_title, home_card_2_text,
    home_card_3_label, home_card_3_title, home_card_3_text,
    home_services_eyebrow, home_services_title, home_services_text, home_services_cta,
    services_page_eyebrow, services_page_title, services_page_text, services_cta_title, services_cta_text,
    projects_page_eyebrow, projects_page_title, projects_page_text,
    over_page_eyebrow, over_page_title, over_page_text,
    over_value_1, over_value_2, over_value_3, over_value_4, over_value_5,
    over_region_title, over_region_text, over_region_note, over_cta_title, over_cta_text,
    contact_page_eyebrow, contact_page_title, contact_page_text, contact_strip_1, contact_strip_2, contact_strip_3, contact_form_note,
    emergency_enabled ? 1 : 0
  );

  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  res.json({ ok: true, settings });
});

module.exports = router;
