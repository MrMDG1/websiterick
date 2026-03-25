CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'editor')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  business_name TEXT NOT NULL DEFAULT 'Dak & Renovatie Purmerend',
  phone TEXT NOT NULL DEFAULT '0612345678',
  whatsapp TEXT NOT NULL DEFAULT '31612345678',
  email TEXT NOT NULL DEFAULT 'info@dakrenovatiepurmerend.nl',
  region_text TEXT NOT NULL DEFAULT 'Purmerend, Beemster, Landsmeer, Hoorn, Zaandam en omgeving',
  hero_title TEXT NOT NULL DEFAULT 'Betrouwbare dakdekker in Purmerend en omgeving',
  hero_subtitle TEXT NOT NULL DEFAULT 'Voor dakrenovaties, lekkages, platte en hellende daken, dakgoten en spoedklussen. Snel contact, duidelijke afspraken en netjes uitgevoerd werk.',
  emergency_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  place TEXT NOT NULL,
  region TEXT,
  service_type TEXT,
  short_description TEXT NOT NULL,
  full_description TEXT,
  hero_image TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  image_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  place TEXT,
  review_text TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 5,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  city TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (id) VALUES (1);
