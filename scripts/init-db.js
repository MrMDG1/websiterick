const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const db = require('../config/db');
const slugify = require('../utils/slugify');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'init.sql'), 'utf8');
db.exec(sql);

const upsertUser = db.prepare(`
  INSERT INTO users (username, password_hash, role)
  VALUES (?, ?, ?)
  ON CONFLICT(username) DO UPDATE SET
    password_hash = excluded.password_hash,
    role = excluded.role
`);

function ensureUser(username, password, role) {
  if (!username || !password) return;
  const hash = bcrypt.hashSync(password, 10);
  upsertUser.run(username, hash, role);
}

ensureUser(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, 'admin');
ensureUser(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD, 'editor');

[
  ["home_card_1_label", "Funnel"],
  ["home_card_1_title", "Bel of app direct"],
  ["home_card_1_text", "Op mobiel staat contact altijd binnen duimbereik."],
  ["home_card_2_label", "Bewijs"],
  ["home_card_2_title", "Projecten uit de praktijk"],
  ["home_card_2_text", "Nieuwe foto’s en afgeronde klussen werken als social proof."],
  ["home_card_3_label", "Groei"],
  ["home_card_3_title", "Klaar voor meer regio’s"],
  ["home_card_3_text", "De structuur is schaalbaar richting aannemer van de regio."]
].forEach(([column, defaultValue]) => {
  try {
    db.exec(`ALTER TABLE site_settings ADD COLUMN ${column} TEXT NOT NULL DEFAULT '${defaultValue.replace(/'/g, "''")}'`);
  } catch (error) {
    if (!String(error.message || '').includes('duplicate column name')) {
      console.warn('Migration warning:', error.message);
    }
  }
});

db.prepare(`
  UPDATE site_settings
  SET business_name = ?, phone = ?, whatsapp = ?, email = ?, region_text = ?, hero_title = ?, hero_subtitle = ?,
      home_card_1_label = ?, home_card_1_title = ?, home_card_1_text = ?,
      home_card_2_label = ?, home_card_2_title = ?, home_card_2_text = ?,
      home_card_3_label = ?, home_card_3_title = ?, home_card_3_text = ?,
      emergency_enabled = 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
`).run(
  'Dak & Renovatie Purmerend',
  process.env.PUBLIC_PHONE || '0612345678',
  process.env.PUBLIC_WHATSAPP || '31612345678',
  process.env.PUBLIC_EMAIL || 'info@dakrenovatiepurmerend.nl',
  'Purmerend, Zuidoostbeemster, Middenbeemster, Landsmeer, Monnickendam, Hoorn, Zaandam, Krommenie, Assendelft, Volendam, Amsterdam en Amstelveen',
  'Betrouwbare dakdekker in Purmerend en omgeving',
  'Voor dakrenovaties, lekkages, platte en hellende daken, dakgoten en spoedklussen. Snel contact, duidelijke afspraken en netjes uitgevoerd werk.',
  'Funnel',
  'Bel of app direct',
  'Op mobiel staat contact altijd binnen duimbereik.',
  'Bewijs',
  'Projecten uit de praktijk',
  'Nieuwe foto’s en afgeronde klussen werken als social proof.',
  'Groei',
  'Klaar voor meer regio’s',
  'De structuur is schaalbaar richting aannemer van de regio.'
);

const projects = [
  {
    title: 'Dakrenovatie in Purmerend',
    place: 'Purmerend',
    region: 'Purmerend',
    service_type: 'Dakrenovatie',
    short_description: 'Volledige renovatie van een verouderd dak met nette afwerking en duidelijke planning.',
    full_description: 'Voor deze woning in Purmerend hebben we het complete dak aangepakt vanwege slijtage en terugkerende problemen. Eerst hebben we de situatie goed bekeken en uitgelegd wat nodig was. Daarna is het werk stap voor stap netjes uitgevoerd, met aandacht voor een strakke afwerking en een duidelijke planning voor de klant.',
    is_featured: 1,
    is_published: 1
  },
  {
    title: 'Lekkage opgelost in Landsmeer',
    place: 'Landsmeer',
    region: 'Landsmeer',
    service_type: 'Daklekkage',
    short_description: 'Snelle aanpak van een lekkage om verdere waterschade te voorkomen.',
    full_description: 'Bij deze klus in Landsmeer was sprake van een lekkage die snel opgelost moest worden. Na een korte inspectie hebben we de oorzaak vastgesteld en gericht aangepakt, zodat verdere schade beperkt bleef en de klant weer gerust verder kon.',
    is_featured: 1,
    is_published: 1
  },
  {
    title: 'Plat dak vervangen in Hoorn',
    place: 'Hoorn',
    region: 'Hoorn',
    service_type: 'Platte daken',
    short_description: 'Vervanging van een versleten plat dak met aandacht voor nette details en waterafvoer.',
    full_description: 'Voor een pand in Hoorn hebben we een plat dak vervangen dat aan vernieuwing toe was. We hebben het oude dak zorgvuldig verwijderd, de ondergrond gecontroleerd en de nieuwe opbouw netjes aangebracht voor een duurzaam eindresultaat.',
    is_featured: 1,
    is_published: 1
  }
];

const insertProject = db.prepare(`
  INSERT INTO projects (title, slug, place, region, service_type, short_description, full_description, is_featured, is_published)
  VALUES (@title, @slug, @place, @region, @service_type, @short_description, @full_description, @is_featured, @is_published)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    place = excluded.place,
    region = excluded.region,
    service_type = excluded.service_type,
    short_description = excluded.short_description,
    full_description = excluded.full_description,
    is_featured = excluded.is_featured,
    is_published = excluded.is_published,
    updated_at = CURRENT_TIMESTAMP
`);

projects.forEach((project) => insertProject.run({ ...project, slug: slugify(project.title) }));

const reviews = [
  [1, 'Familie Jansen', 'Purmerend', 'Snelle reactie, duidelijke afspraken en het werk is netjes uitgevoerd.', 5, 1, 1],
  [2, 'Mevrouw De Vries', 'Landsmeer', 'Fijne communicatie en de lekkage was snel opgelost.', 5, 1, 1],
  [3, 'Familie Bakker', 'Hoorn', 'Net werk geleverd en goed meegedacht over de beste oplossing voor ons dak.', 5, 1, 1]
];

const upsertReview = db.prepare(`
  INSERT INTO reviews (id, customer_name, place, review_text, stars, is_featured, is_published)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    customer_name = excluded.customer_name,
    place = excluded.place,
    review_text = excluded.review_text,
    stars = excluded.stars,
    is_featured = excluded.is_featured,
    is_published = excluded.is_published
`);
reviews.forEach((review) => upsertReview.run(...review));

console.log('Database initialized successfully.');
