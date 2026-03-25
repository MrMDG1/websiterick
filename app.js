const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const reviewRoutes = require('./routes/reviews');
const serviceRoutes = require('./routes/services');
const settingsRoutes = require('./routes/settings');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const { requireAuth } = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

function runStartupMigrations() {
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_key TEXT NOT NULL DEFAULT 'hammer',
      icon_image TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);
    db.exec(`CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      page_path TEXT NOT NULL DEFAULT '/',
      target_label TEXT,
      target_value TEXT,
      visitor_id TEXT,
      session_id TEXT,
      user_agent TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);
  } catch (error) {
    console.warn('Analytics migration warning:', error.message);
  }
  const migrationStatements = [
    `ALTER TABLE site_settings ADD COLUMN home_card_1_label TEXT NOT NULL DEFAULT 'Funnel'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_1_title TEXT NOT NULL DEFAULT 'Bel of app direct'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_1_text TEXT NOT NULL DEFAULT 'Op mobiel staat contact altijd binnen duimbereik.'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_2_label TEXT NOT NULL DEFAULT 'Bewijs'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_2_title TEXT NOT NULL DEFAULT 'Projecten uit de praktijk'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_2_text TEXT NOT NULL DEFAULT 'Nieuwe foto’s en afgeronde klussen werken als social proof.'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_3_label TEXT NOT NULL DEFAULT 'Groei'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_3_title TEXT NOT NULL DEFAULT 'Klaar voor meer regio’s'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_3_text TEXT NOT NULL DEFAULT 'De structuur is schaalbaar richting aannemer van de regio.'`,
    `ALTER TABLE site_settings ADD COLUMN hero_eyebrow TEXT NOT NULL DEFAULT 'Betrouwbare dakpartner in de regio'`,
    `ALTER TABLE site_settings ADD COLUMN hero_note TEXT NOT NULL DEFAULT 'Meestal eerste reactie dezelfde dag. Bij spoed graag direct bellen of WhatsAppen.'`,
    `ALTER TABLE site_settings ADD COLUMN emergency_text TEXT NOT NULL DEFAULT 'Spoed bij lekkage of schade? App direct.'`,
    `ALTER TABLE site_settings ADD COLUMN hero_point_1 TEXT NOT NULL DEFAULT 'Purmerend als hoofdregio'`,
    `ALTER TABLE site_settings ADD COLUMN hero_point_2 TEXT NOT NULL DEFAULT 'Echte projectfoto’s'`,
    `ALTER TABLE site_settings ADD COLUMN hero_point_3 TEXT NOT NULL DEFAULT 'Snelle reactie bij lekkage'`,
    `ALTER TABLE site_settings ADD COLUMN panel_kicker TEXT NOT NULL DEFAULT 'Waarom dit werkt'`,
    `ALTER TABLE site_settings ADD COLUMN panel_title TEXT NOT NULL DEFAULT 'Een site die vertrouwen geeft vóór het eerste gesprek'`,
    `ALTER TABLE site_settings ADD COLUMN panel_text TEXT NOT NULL DEFAULT 'Geen schreeuwerige bouwsite, maar een rustige, nette voorkant die laat zien dat het werk geregeld wordt.'`,
    `ALTER TABLE site_settings ADD COLUMN stat_1_title TEXT NOT NULL DEFAULT 'Snel bereikbaar'`,
    `ALTER TABLE site_settings ADD COLUMN stat_1_text TEXT NOT NULL DEFAULT 'WhatsApp, bellen en formulier zonder drempels.'`,
    `ALTER TABLE site_settings ADD COLUMN stat_2_title TEXT NOT NULL DEFAULT 'Echte projecten'`,
    `ALTER TABLE site_settings ADD COLUMN stat_2_text TEXT NOT NULL DEFAULT 'Nieuwe klussen zijn direct bewijs op de site.'`,
    `ALTER TABLE site_settings ADD COLUMN stat_3_title TEXT NOT NULL DEFAULT 'Regiofocus'`,
    `ALTER TABLE site_settings ADD COLUMN stat_3_text TEXT NOT NULL DEFAULT 'Purmerend en omgeving'`,
    `ALTER TABLE site_settings ADD COLUMN stat_4_title TEXT NOT NULL DEFAULT 'Duidelijke afspraken'`,
    `ALTER TABLE site_settings ADD COLUMN stat_4_text TEXT NOT NULL DEFAULT 'Rust, overzicht en een nette presentatie.'`,
    `ALTER TABLE site_settings ADD COLUMN services_page_eyebrow TEXT NOT NULL DEFAULT 'Onze diensten'`,
    `ALTER TABLE site_settings ADD COLUMN services_page_title TEXT NOT NULL DEFAULT 'Dakwerk in Purmerend en omgeving'`,
    `ALTER TABLE site_settings ADD COLUMN services_page_text TEXT NOT NULL DEFAULT 'Wij helpen met dakrenovaties, lekkages, platte en hellende daken, dakgoten en spoedklussen. Duidelijk advies, nette uitvoering en snelle communicatie.'`,
    `ALTER TABLE site_settings ADD COLUMN services_cta_title TEXT NOT NULL DEFAULT 'Twijfel je welke oplossing past bij jouw dak?'`,
    `ALTER TABLE site_settings ADD COLUMN services_cta_text TEXT NOT NULL DEFAULT 'Neem contact op, dan kijken we mee en geven we duidelijk advies.'`,
    `ALTER TABLE site_settings ADD COLUMN projects_page_eyebrow TEXT NOT NULL DEFAULT 'Projecten uit de praktijk'`,
    `ALTER TABLE site_settings ADD COLUMN projects_page_title TEXT NOT NULL DEFAULT 'Echte klussen uit de regio'`,
    `ALTER TABLE site_settings ADD COLUMN projects_page_text TEXT NOT NULL DEFAULT 'Bekijk recent uitgevoerd werk in Purmerend en omliggende plaatsen. Zo zie je direct wat voor werkzaamheden we uitvoeren en hoe we te werk gaan.'`,
    `ALTER TABLE site_settings ADD COLUMN over_page_eyebrow TEXT NOT NULL DEFAULT 'Over ons'`,
    `ALTER TABLE site_settings ADD COLUMN over_page_title TEXT NOT NULL DEFAULT 'Degelijk dakwerk, duidelijke communicatie'`,
    `ALTER TABLE site_settings ADD COLUMN over_page_text TEXT NOT NULL DEFAULT 'Geen moeilijke verhalen, maar gewoon eerlijk advies en werk waar je op kunt vertrouwen. We denken praktisch mee en leveren het netjes op.'`,
    `ALTER TABLE site_settings ADD COLUMN over_value_1 TEXT NOT NULL DEFAULT 'Eerlijk advies'`,
    `ALTER TABLE site_settings ADD COLUMN over_value_2 TEXT NOT NULL DEFAULT 'Duidelijke afspraken'`,
    `ALTER TABLE site_settings ADD COLUMN over_value_3 TEXT NOT NULL DEFAULT 'Netjes werken'`,
    `ALTER TABLE site_settings ADD COLUMN over_value_4 TEXT NOT NULL DEFAULT 'Snel contact'`,
    `ALTER TABLE site_settings ADD COLUMN over_value_5 TEXT NOT NULL DEFAULT 'Oplossingsgericht meedenken'`,
    `ALTER TABLE site_settings ADD COLUMN over_region_title TEXT NOT NULL DEFAULT 'Werkgebied'`,
    `ALTER TABLE site_settings ADD COLUMN over_region_text TEXT NOT NULL DEFAULT 'Purmerend en omgeving'`,
    `ALTER TABLE site_settings ADD COLUMN over_region_note TEXT NOT NULL DEFAULT 'Van Purmerend tot Landsmeer, Hoorn, Zaandam en omliggende plaatsen.'`,
    `ALTER TABLE site_settings ADD COLUMN over_cta_title TEXT NOT NULL DEFAULT 'Een vakman zoeken die meedenkt en doorpakt?'`,
    `ALTER TABLE site_settings ADD COLUMN over_cta_text TEXT NOT NULL DEFAULT 'Neem gerust contact op voor advies of een afspraak.'`,
    `ALTER TABLE site_settings ADD COLUMN contact_page_eyebrow TEXT NOT NULL DEFAULT 'Contact opnemen'`,
    `ALTER TABLE site_settings ADD COLUMN contact_page_title TEXT NOT NULL DEFAULT 'Vraag advies of plan een afspraak'`,
    `ALTER TABLE site_settings ADD COLUMN contact_page_text TEXT NOT NULL DEFAULT 'Heb je een vraag, schade aan je dak of plannen voor renovatie? Neem gerust contact op. We helpen je graag verder.'`,
    `ALTER TABLE site_settings ADD COLUMN contact_strip_1 TEXT NOT NULL DEFAULT 'Reactie meestal dezelfde dag'`,
    `ALTER TABLE site_settings ADD COLUMN contact_strip_2 TEXT NOT NULL DEFAULT 'Spoed via WhatsApp of bellen'`,
    `ALTER TABLE site_settings ADD COLUMN contact_strip_3 TEXT NOT NULL DEFAULT 'Werkzaam in Purmerend en omgeving'`,
    `ALTER TABLE site_settings ADD COLUMN contact_form_note TEXT NOT NULL DEFAULT 'Liever direct schakelen? Bel of app voor de snelste reactie.'`
  ];
  for (const statement of migrationStatements) {
    try {
      db.exec(statement);
    } catch (error) {
      if (!String(error.message || '').includes('duplicate column name')) {
        console.warn('Migration warning:', error.message);
      }
    }
  }

  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM services').get().c;
    if (!count) {
      const insert = db.prepare(`INSERT INTO services (title, description, icon_key, sort_order, is_published, updated_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`);
      [
        ['Dakrenovatie', 'Voor daken die verouderd zijn of toe zijn aan een nette vernieuwing.', 'hammer', 1],
        ['Daklekkage oplossen', 'Snelle inspectie en gerichte oplossing om verdere schade te voorkomen.', 'droplet', 2],
        ['Platte daken', 'Onderhoud, herstel en renovatie van platte daken met duidelijke aanpak.', 'layers', 3],
        ['Hellende daken', 'Herstel, renovatie en onderhoud van hellende daken met nette afwerking.', 'house', 4],
        ['Dakgoten', 'Voor een goede waterafvoer en een nette afwerking rondom het dak.', 'gutter', 5],
        ['Spoedservice', 'Bij acute schade of lekkage moet er snel worden geschakeld.', 'zap', 6]
      ].forEach(row => insert.run(...row));
    }
  } catch (error) {
    console.warn('Service seed warning:', error.message);
  }
}

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('trust proxy', 1);

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map(part => part.trim()).filter(Boolean).map(part => {
      const index = part.indexOf('=');
      if (index === -1) return [part, ''];
      return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
    })
  );
}

app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie || '');
  let visitorId = cookies.daksite_vid;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookie('daksite_vid', visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }
  req.analytics = { visitorId };
  next();
});

app.use((req, res, next) => {
  const pathName = req.path || '/';
  const skip = pathName.startsWith('/api/') ||
    pathName.startsWith('/css/') ||
    pathName.startsWith('/js/') ||
    pathName.startsWith('/images/') ||
    pathName.startsWith('/uploads/') ||
    pathName === '/favicon.ico' ||
    pathName === '/robots.txt' ||
    pathName === '/sitemap.xml' ||
    pathName === '/site.webmanifest';
  const wantsHtml = (req.get('accept') || '').includes('text/html');
  if (req.method === 'GET' && !skip && wantsHtml) {
    try {
      db.prepare(`
        INSERT INTO analytics_events (event_type, page_path, visitor_id, session_id, user_agent, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('pageview', pathName, req.analytics?.visitorId || '', req.sessionID || '', req.get('user-agent') || '', req.ip || '');
    } catch (error) {
      console.warn('Analytics pageview warning:', error.message);
    }
  }
  next();
});

app.use(session({
  name: 'daksite.sid',
  secret: process.env.SESSION_SECRET || 'vervang-dit-lokaal',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '7d' : 0
}));

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/project/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Er ging iets mis op de server.' });
});

// Optional startup sanity check
try {
  db.prepare('SELECT 1').get();
  runStartupMigrations();
} catch (error) {
  console.warn('Database not initialized yet. Run: npm install && copy .env.example .env && npm run init-db');
}

app.listen(PORT, () => {
  console.log(`Daksite scaffold draait op http://localhost:${PORT}`);
});
