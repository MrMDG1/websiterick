const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const reviewRoutes = require('./routes/reviews');
const settingsRoutes = require('./routes/settings');
const contactRoutes = require('./routes/contact');
const { requireAuth } = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

function runStartupMigrations() {
  const migrationStatements = [
    `ALTER TABLE site_settings ADD COLUMN home_card_1_label TEXT NOT NULL DEFAULT 'Funnel'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_1_title TEXT NOT NULL DEFAULT 'Bel of app direct'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_1_text TEXT NOT NULL DEFAULT 'Op mobiel staat contact altijd binnen duimbereik.'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_2_label TEXT NOT NULL DEFAULT 'Bewijs'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_2_title TEXT NOT NULL DEFAULT 'Projecten uit de praktijk'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_2_text TEXT NOT NULL DEFAULT 'Nieuwe foto’s en afgeronde klussen werken als social proof.'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_3_label TEXT NOT NULL DEFAULT 'Groei'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_3_title TEXT NOT NULL DEFAULT 'Klaar voor meer regio’s'`,
    `ALTER TABLE site_settings ADD COLUMN home_card_3_text TEXT NOT NULL DEFAULT 'De structuur is schaalbaar richting aannemer van de regio.'`
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
}

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('trust proxy', 1);
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
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);

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
