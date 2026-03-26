
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHtml(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

function setHref(id, value) {
  const el = document.getElementById(id);
  if (el) el.href = value;
}


async function trackEvent(eventType, targetLabel = '', targetValue = '') {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        page_path: location.pathname,
        target_label: targetLabel,
        target_value: targetValue
      })
    });
  } catch (error) {
    console.warn('Analytics event failed', error);
  }
}


function iconForService(service = '') {
  const value = String(service).toLowerCase();
  if (value.includes('droplet') || value.includes('lekk')) return '💧';
  if (value.includes('layers') || value.includes('plat')) return '▭';
  if (value.includes('house') || value.includes('hell')) return '🏠';
  if (value.includes('gutter') || value.includes('goot')) return '↘';
  if (value.includes('zap') || value.includes('spoed')) return '⚡';
  return '🔨';
}

function serviceIconMarkup(service = {}) {
  if (service.icon_image) {
    return `<img src="${service.icon_image}" alt="${service.title || 'Dienst'}" class="service-icon-image">`;
  }
  const key = service.icon_key || service.title || '';
  return `<span aria-hidden="true">${iconForService(key)}</span>`;
}

function projectCard(project) {
  return `
    <article class="card project-card">
      ${project.hero_image ? `<img src="${project.hero_image}" alt="${project.title}" class="project-cover">` : '<div class="project-placeholder">Projectfoto</div>'}
      <div class="meta-line">
        <span class="tag">${project.service_type || 'Project'}</span>
        <span class="meta">${project.place}</span>
      </div>
      <h3>${project.title}</h3>
      <p class="meta">${project.short_description}</p>
      <a class="btn btn-secondary" href="/project/${project.slug}">Bekijk project</a>
    </article>`;
}

function reviewCard(review) {
  return `
    <article class="card review-card">
      <div class="review-top">
        <span class="tag">${'★'.repeat(review.stars || 5)}</span>
        <span class="quote-mark">“”</span>
      </div>
      <p>“${review.review_text}”</p>
      <div class="meta">${review.customer_name}${review.place ? ` — ${review.place}` : ''}</div>
    </article>`;
}

async function serviceCards() {
  const services = await getJson('/api/services');
  if (!Array.isArray(services) || !services.length) {
    return '<div class="empty-state card">Nog geen diensten toegevoegd.</div>';
  }
  return services.map((service) => `
    <article class="card service-card">
      <div class="service-icon">${serviceIconMarkup(service)}</div>
      <h3>${service.title || ''}</h3>
      <p class="meta">${service.description || ''}</p>
    </article>
  `).join('');
}

function bindMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
}

async function hydrateSettings() {
  const settings = await getJson('/api/settings');
  document.title = settings.business_name;
  setText('business-name', settings.business_name);
  setText('hero-eyebrow', settings.hero_eyebrow);
  setText('hero-title', settings.hero_title);
  setText('hero-subtitle', settings.hero_subtitle);
  setText('hero-note', settings.hero_note);
  setText('hero-point-1', settings.hero_point_1);
  setText('hero-point-2', settings.hero_point_2);
  setText('hero-point-3', settings.hero_point_3);
  setText('panel-kicker', settings.panel_kicker);
  setText('panel-title', settings.panel_title);
  setText('panel-text', settings.panel_text);
  setText('stat-1-title', settings.stat_1_title);
  setText('stat-1-text', settings.stat_1_text);
  setText('stat-2-title', settings.stat_2_title);
  setText('stat-2-text', settings.stat_2_text);
  setText('stat-3-title', settings.stat_3_title);
  setText('stat-3-text', settings.stat_3_text);
  setText('stat-4-title', settings.stat_4_title);
  setText('stat-4-text', settings.stat_4_text);
  setText('home-card-1-label', settings.home_card_1_label);
  setText('home-card-1-title', settings.home_card_1_title);
  setText('home-card-1-text', settings.home_card_1_text);
  setText('home-card-2-label', settings.home_card_2_label);
  setText('home-card-2-title', settings.home_card_2_title);
  setText('home-card-2-text', settings.home_card_2_text);
  setText('home-card-3-label', settings.home_card_3_label);
  setText('home-card-3-title', settings.home_card_3_title);
  setText('home-card-3-text', settings.home_card_3_text);
  setText('home-services-eyebrow', settings.home_services_eyebrow || 'Dienstenoverzicht');
  setText('home-services-title', settings.home_services_title || 'Onze diensten');
  setText('home-services-text', settings.home_services_text || 'Van kleine reparaties tot complete dakrenovaties. Geen moeilijke verhalen, wel een duidelijke aanpak.');
  setText('home-services-cta', settings.home_services_cta || 'Bekijk alle diensten');
setText('services-page-eyebrow', settings.services_page_eyebrow);
setText('services-page-title', settings.services_page_title);
setText('services-page-text', settings.services_page_text);
setText('services-cta-title', settings.services_cta_title);
setText('services-cta-text', settings.services_cta_text);
setText('projects-page-eyebrow', settings.projects_page_eyebrow);
setText('projects-page-title', settings.projects_page_title);
setText('projects-page-text', settings.projects_page_text);
setText('over-page-eyebrow', settings.over_page_eyebrow);
setText('over-page-title', settings.over_page_title);
setText('over-page-text', settings.over_page_text);
setText('over-value-1', settings.over_value_1);
setText('over-value-2', settings.over_value_2);
setText('over-value-3', settings.over_value_3);
setText('over-value-4', settings.over_value_4);
setText('over-value-5', settings.over_value_5);
setText('over-region-title', settings.over_region_title);
setText('over-region-text', settings.over_region_text);
setText('over-region-note', settings.over_region_note);
setText('over-cta-title', settings.over_cta_title);
setText('over-cta-text', settings.over_cta_text);
setText('contact-page-eyebrow', settings.contact_page_eyebrow);
setText('contact-page-title', settings.contact_page_title);
setText('contact-page-text', settings.contact_page_text);
setText('contact-strip-1', settings.contact_strip_1);
setText('contact-strip-2', settings.contact_strip_2);
setText('contact-strip-3', settings.contact_strip_3);
setText('contact-form-note', settings.contact_form_note);
setText('footer-region', settings.region_text);
  setText('contact-region', settings.region_text);
  setText('site-name', settings.business_name);
  setText('contact-phone-text', settings.phone);
  setText('contact-email-text', settings.email);
  setText('business-name-inline', settings.business_name);
  ['phone-btn', 'phone-btn-2', 'contact-phone'].forEach(id => setHref(id, `tel:${settings.phone}`));
  ['contact-email'].forEach(id => setHref(id, `mailto:${settings.email}`));
  const normalWa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hallo, ik heb een vraag over mijn dak.')}`;
  const urgentWa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hallo, ik heb spoed met mijn dak en zoek direct hulp.')}`;
  ['wa-btn', 'wa-btn-2', 'wa-float'].forEach(id => setHref(id, normalWa));
  setHref('wa-urgent', urgentWa);
  if (settings.emergency_enabled) {
    setHtml('emergency-badge', `<div class="badge badge-warn">${settings.emergency_text || 'Spoed bij lekkage of schade? App direct.'}</div>`);
  }
}

async function hydrateHome() {
  const [projects, reviews] = await Promise.all([
    getJson('/api/projects/featured'),
    getJson('/api/reviews/featured')
  ]);
  const pWrap = document.getElementById('featured-projects');
  if (pWrap) pWrap.innerHTML = projects.length ? projects.map(projectCard).join('') : '<div class="empty-state card">Nog geen projecten toegevoegd.</div>';
  const rWrap = document.getElementById('featured-reviews');
  if (rWrap) rWrap.innerHTML = reviews.length ? reviews.map(reviewCard).join('') : '<div class="empty-state card">Nog geen reviews toegevoegd.</div>';
}

async function hydrateServices() {
  const wrap = document.getElementById('services-grid');
  if (!wrap) return;
  try {
    const cards = await serviceCards();
    wrap.innerHTML = cards;
  } catch (error) {
    console.warn('Diensten laden mislukt:', error);
    wrap.innerHTML = "<div class=\'empty-state card\'>Diensten konden niet geladen worden.</div>";
  }
}

async function hydrateProjectsPage() {
  const projects = await getJson('/api/projects');
  const wrap = document.getElementById('all-projects');
  if (wrap) wrap.innerHTML = projects.length ? projects.map(projectCard).join('') : '<div class="empty-state card">Nog geen projecten toegevoegd.</div>';
}

async function hydrateProjectPage() {
  const slug = location.pathname.split('/').pop() || '';
  const project = await getJson(`/api/projects/${slug}`);
  setText('project-service', project.service_type || 'Project');
  document.title = `${project.title} | Dak & Renovatie Purmerend`;
  setText('project-title', project.title);
  setText('project-place', project.place);
  setText('project-short', project.short_description);
  const imageWrap = document.getElementById('project-image-wrap');
  if (imageWrap && project.hero_image) imageWrap.innerHTML = `<img src="${project.hero_image}" alt="${project.title}" class="project-detail-image">`;
  const full = document.getElementById('project-full');
  if (full) full.innerHTML = `<p>${project.full_description || ''}</p>`;
  const gallery = document.getElementById('project-gallery');
  if (gallery) {
    gallery.innerHTML = project.images?.length ? `<div class="project-gallery-grid">${project.images.map((image) => `<img src="${image.image_path}" alt="${project.title}" class="project-gallery-image">`).join('')}</div>` : '<div class="meta">Nog geen extra projectfoto’s toegevoegd.</div>';
  }
}


function bindTrackables() {
  document.querySelectorAll('[data-track]').forEach((el) => {
    if (el.dataset.trackBound === '1') return;
    el.dataset.trackBound = '1';
    el.addEventListener('click', () => {
      trackEvent('cta_click', el.dataset.track || el.textContent.trim(), el.getAttribute('href') || '');
    });
  });
}

function bindContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('contact-status');
    status.innerHTML = '';
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const json = await res.json();
    status.innerHTML = `<div class="notice ${res.ok ? '' : 'error'}">${json.message || json.error}</div>`;
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (res.ok) { trackEvent('cta_click', 'Contactformulier verzonden', 'contact_form'); form.reset(); }
  });
}

(async function init() {
  setText('year', new Date().getFullYear());
  bindMobileMenu();
  bindTrackables();
  const page = document.body.dataset.page;
  try {
    await hydrateSettings();
    if (page === 'home') {
      await Promise.all([hydrateHome(), hydrateServices()]);
    }
    if (page === 'diensten') {
      await hydrateServices();
    }
    if (page === 'projecten') await hydrateProjectsPage();
    if (page === 'project') await hydrateProjectPage();
  } catch (e) {
    console.warn(e);
  }
  bindContactForm();
})();
