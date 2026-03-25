
const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/event', (req, res) => {
  const { event_type, page_path, target_label, target_value } = req.body || {};
  if (!event_type) return res.status(400).json({ error: 'event_type is verplicht.' });

  const visitorId = req.analytics?.visitorId || null;
  const sessionId = req.sessionID || null;
  const userAgent = req.get('user-agent') || '';
  const ipAddress = req.ip || '';

  db.prepare(`
    INSERT INTO analytics_events (event_type, page_path, target_label, target_value, visitor_id, session_id, user_agent, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event_type,
    page_path || req.path || '/',
    target_label || '',
    target_value || '',
    visitorId,
    sessionId,
    userAgent,
    ipAddress
  );

  res.json({ ok: true });
});

router.get('/admin/summary', requireAuth, (req, res) => {
  const totalPageviews = db.prepare(`SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview'`).get().count;
  const uniqueVisitors = db.prepare(`SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events WHERE visitor_id IS NOT NULL AND visitor_id != ''`).get().count;
  const totalClicks = db.prepare(`SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'cta_click'`).get().count;
  const visitors7d = db.prepare(`SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events WHERE visitor_id IS NOT NULL AND visitor_id != '' AND created_at >= datetime('now','-7 day')`).get().count;

  const topPages = db.prepare(`
    SELECT page_path, COUNT(*) as count
    FROM analytics_events
    WHERE event_type = 'pageview'
    GROUP BY page_path
    ORDER BY count DESC
    LIMIT 10
  `).all();

  const topClicks = db.prepare(`
    SELECT COALESCE(target_label, 'Onbekend') as target_label, COUNT(*) as count
    FROM analytics_events
    WHERE event_type = 'cta_click'
    GROUP BY target_label
    ORDER BY count DESC
    LIMIT 10
  `).all();

  const recentActivity = db.prepare(`
    SELECT event_type, page_path, target_label, created_at
    FROM analytics_events
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  res.json({
    totals: {
      uniqueVisitors,
      totalPageviews,
      totalClicks,
      visitors7d
    },
    topPages,
    topClicks,
    recentActivity
  });
});

module.exports = router;
