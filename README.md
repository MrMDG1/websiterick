# Daksite scaffold v1.2

Deze versie combineert twee dingen:
- **content v1**: ingevulde basiscontent voor de dakdekker-site
- **scaffold v1.2**: uitgebreidere adminflow met edit/delete en lead-overzicht

## Nieuw in v1.2
- content ingevuld voor Purmerend en omgeving
- betere home, diensten, projecten, over en contact pagina's
- projecten bewerken en verwijderen
- reviews bewerken en verwijderen
- leads zichtbaar in admin
- project gallery upload (extra foto's)
- `init-db` werkt users en basiscontent netjes bij

## Starten
```bash
npm install
copy .env.example .env
npm run init-db
npm start
```

## URLs
- website: `http://localhost:3000`
- login: `http://localhost:3000/login.html`
- admin: `http://localhost:3000/admin`

## Let op
Als je van v1.1 komt en je database wilt houden, probeer dan eerst gewoon:
```bash
npm run init-db
npm start
```

Wil je echt schoon starten:
- verwijder `database/site.db`
- run opnieuw `npm run init-db`

## Extra `.env` velden
Je kunt optioneel ook dit invullen:
```env
PUBLIC_PHONE=0612345678
PUBLIC_WHATSAPP=31612345678
PUBLIC_EMAIL=info@jouwdomein.nl
```

## v1.4 live-ready extra's
- SEO basis toegevoegd (meta descriptions, canonical, OG tags)
- `robots.txt` en `sitemap.xml` toegevoegd
- `site.webmanifest` + SVG favicon toegevoegd
- Contactpagina en contactflow visueel aangescherpt
- Productie-cookies veiliger wanneer `NODE_ENV=production`
- Extra cache-instellingen voor statische assets in productie

## Livegang checklist
1. Hernoem `.env.example` naar `.env`
2. Vul echte contactgegevens in
3. Zet `NODE_ENV=production`
4. Kies een sterke `SESSION_SECRET`
5. Gebruik HTTPS / reverse proxy in productie
6. Pas `robots.txt`, `sitemap.xml` en canonicals aan naar je echte domein
7. Voeg echte projectfoto's toe
