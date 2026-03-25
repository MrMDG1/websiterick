
async function api(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Verzoek mislukt');
  return json;
}

function notice(targetId, message, isError = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = `<div class="notice ${isError ? 'error' : ''}">${message}</div>`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function setActiveAdminLink() {
  const current = location.hash || '#dashboard';
  document.querySelectorAll('.admin-nav a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === current);
  });
}

async function loadSession() {
  const { user } = await api('/api/auth/me');
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  document.getElementById('user-info').textContent = `${user.username} (${user.role})`;
}

async function loadSettings() {
  const settings = await api('/api/settings');
  const siteNameEl = document.getElementById('site-name');
  if (siteNameEl) {
    siteNameEl.textContent = settings.business_name || 'Daksite Admin';
  }
  const form = document.getElementById('settings-form');
  for (const [key, value] of Object.entries(settings)) {
    if (!form.elements[key]) continue;
    if (form.elements[key].type === 'checkbox') form.elements[key].checked = !!value;
    else form.elements[key].value = value ?? '';
  }
}

async function loadProjects() {
  const projects = await api('/api/projects/admin/all/list');
  document.getElementById('project-count').textContent = projects.length;
  document.getElementById('project-table').innerHTML = projects.map((p) => `
    <tr>
      <td><strong>${escapeHtml(p.title)}</strong><div class="small">${escapeHtml(p.service_type || '')}</div></td>
      <td>${escapeHtml(p.place)}</td>
      <td>${p.is_published ? '<span class="status-pill status-live">Live</span>' : '<span class="status-pill status-draft">Concept</span>'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-small" data-project-edit="${p.id}">Bewerk</button>
          <button class="btn btn-secondary btn-small danger" data-project-delete="${p.id}">Verwijder</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4">Nog geen projecten</td></tr>';
}

async function loadReviews() {
  const reviews = await api('/api/reviews/admin/all/list');
  document.getElementById('review-count').textContent = reviews.length;
  document.getElementById('review-table').innerHTML = reviews.map((r) => `
    <tr>
      <td><strong>${escapeHtml(r.customer_name)}</strong><div class="small">${escapeHtml(r.review_text.slice(0, 60))}${r.review_text.length > 60 ? '…' : ''}</div></td>
      <td>${escapeHtml(r.place || '-')}</td>
      <td>${r.stars}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-small" data-review-edit="${r.id}">Bewerk</button>
          <button class="btn btn-secondary btn-small danger" data-review-delete="${r.id}">Verwijder</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4">Nog geen reviews</td></tr>';
}

async function loadServices() {
  const items = await api('/api/services/admin/all/list');
  const tbody = document.getElementById('services-table');
  if (tbody) {
    tbody.innerHTML = items.map((item) => `
      <tr>
        <td>${item.sort_order ?? ''}</td>
        <td><strong>${item.title}</strong><div class="meta">${item.description}</div></td>
        <td>${item.icon_image ? '<span class="tag">Upload</span>' : `<span class="tag">${item.icon_key || 'hammer'}</span>`}</td>
        <td>${item.is_published ? '<span class="tag">Live</span>' : '<span class="tag muted">Verborgen</span>'}</td>
        <td class="table-actions">
          <button class="btn btn-ghost" type="button" data-action="edit-service" data-id="${item.id}">Bewerken</button>
          <button class="btn btn-ghost" type="button" data-action="delete-service" data-id="${item.id}">Verwijderen</button>
        </td>
      </tr>`).join('');
  }
}

async function loadLeads() {
  const leads = await api('/api/contact/admin/all/list');
  document.getElementById('lead-count').textContent = leads.length;
  document.getElementById('lead-table').innerHTML = leads.map((lead) => `
    <tr>
      <td><strong>${escapeHtml(lead.name)}</strong><div class="small">${escapeHtml(lead.created_at)}</div></td>
      <td>${escapeHtml(lead.phone || '-')}</td>
      <td>${escapeHtml(lead.city || '-')}</td>
      <td>${escapeHtml(lead.message.slice(0, 80))}${lead.message.length > 80 ? '…' : ''}</td>
    </tr>
  `).join('') || '<tr><td colspan="4">Nog geen leads</td></tr>';
}

function resetProjectForm() {
  const form = document.getElementById('project-form');
  form.reset();
  form.dataset.mode = 'create';
  form.dataset.projectId = '';
  document.getElementById('project-form-title').textContent = 'Nieuw project';
  document.getElementById('project-submit').textContent = 'Project opslaan';
  document.getElementById('project-cancel').hidden = true;
}

function resetReviewForm() {
  const form = document.getElementById('review-form');
  form.reset();
  form.dataset.mode = 'create';
  form.dataset.reviewId = '';
  document.getElementById('review-form-title').textContent = 'Nieuwe review';
  document.getElementById('review-submit').textContent = 'Review opslaan';
  document.getElementById('review-cancel').hidden = true;
}

async function startEditProject(id) {
  const project = await api(`/api/projects/admin/${id}`);
  const form = document.getElementById('project-form');
  form.dataset.mode = 'edit';
  form.dataset.projectId = id;
  form.elements.title.value = project.title;
  form.elements.place.value = project.place;
  form.elements.region.value = project.region || '';
  form.elements.service_type.value = project.service_type || '';
  form.elements.short_description.value = project.short_description || '';
  form.elements.full_description.value = project.full_description || '';
  form.elements.is_featured.checked = !!project.is_featured;
  form.elements.is_published.checked = !!project.is_published;
  document.getElementById('project-form-title').textContent = 'Project bewerken';
  document.getElementById('project-submit').textContent = 'Wijzigingen opslaan';
  document.getElementById('project-cancel').hidden = false;
  window.location.hash = '#projects';
  setActiveAdminLink();
}

async function startEditReview(id) {
  const review = await api(`/api/reviews/admin/${id}`);
  const form = document.getElementById('review-form');
  form.dataset.mode = 'edit';
  form.dataset.reviewId = id;
  form.elements.customer_name.value = review.customer_name;
  form.elements.place.value = review.place || '';
  form.elements.review_text.value = review.review_text;
  form.elements.stars.value = String(review.stars || 5);
  form.elements.is_featured.checked = !!review.is_featured;
  form.elements.is_published.checked = !!review.is_published;
  document.getElementById('review-form-title').textContent = 'Review bewerken';
  document.getElementById('review-submit').textContent = 'Wijzigingen opslaan';
  document.getElementById('review-cancel').hidden = false;
  window.location.hash = '#reviews';
  setActiveAdminLink();
}

function bindProjectForm() {
  const form = document.getElementById('project-form');
  const cancel = document.getElementById('project-cancel');
  cancel.addEventListener('click', resetProjectForm);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(form);
      const mode = form.dataset.mode || 'create';
      const id = form.dataset.projectId;
      const url = mode === 'edit' ? `/api/projects/admin/update/${id}` : '/api/projects/admin/create';
      const res = await fetch(url, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      notice('project-status', mode === 'edit' ? 'Project bijgewerkt.' : 'Project opgeslagen.');
      resetProjectForm();
      await loadProjects();
    } catch (err) {
      notice('project-status', err.message, true);
    }
  });
}

function bindReviewForm() {
  const form = document.getElementById('review-form');
  const cancel = document.getElementById('review-cancel');
  cancel.addEventListener('click', resetReviewForm);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      data.is_featured = form.elements.is_featured.checked;
      data.is_published = form.elements.is_published.checked;
      const mode = form.dataset.mode || 'create';
      const id = form.dataset.reviewId;
      const url = mode === 'edit' ? `/api/reviews/admin/update/${id}` : '/api/reviews/admin/create';
      await api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      notice('review-status', mode === 'edit' ? 'Review bijgewerkt.' : 'Review opgeslagen.');
      resetReviewForm();
      await loadReviews();
    } catch (err) {
      notice('review-status', err.message, true);
    }
  });
}

function resetServiceForm() {
  const form = document.getElementById('service-form');
  if (!form) return;
  form.reset();
  form.dataset.mode = 'create';
  form.querySelector('[name=id]').value = '';
  document.getElementById('service-form-title').textContent = 'Nieuw dienstenblok';
  document.getElementById('service-form-reset')?.classList.add('hidden');
  const submit = form.querySelector('button[type=submit]');
  if (submit) submit.textContent = 'Dienstenblok opslaan';
}

function bindServiceForm() {
  const form = document.getElementById('service-form');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const id = fd.get('id');
    const mode = form.dataset.mode || 'create';
    const endpoint = mode === 'edit' && id ? `/api/services/admin/update/${id}` : '/api/services/admin/create';
    const result = await api(endpoint, { method: 'POST', body: fd });
    if (!result.error) {
      resetServiceForm();
      await loadServices();
    }
  });
  document.getElementById('service-form-reset')?.addEventListener('click', resetServiceForm);
}

function bindSettingsForm() {
  const form = document.getElementById('settings-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      data.emergency_enabled = form.elements.emergency_enabled.checked;
      await api('/api/settings/admin/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      notice('settings-status', 'Instellingen opgeslagen.');
      await loadSettings();
    } catch (err) {
      notice('settings-status', err.message, true);
    }
  });
}

function bindTables() {
  document.body.addEventListener('click', async (e) => {
    const projectEdit = e.target.closest('[data-project-edit]');
    if (projectEdit) return startEditProject(projectEdit.dataset.projectEdit);
    const projectDelete = e.target.closest('[data-project-delete]');
    if (projectDelete) {
      if (!confirm('Project verwijderen?')) return;
      await api(`/api/projects/admin/delete/${projectDelete.dataset.projectDelete}`, { method: 'POST' });
      notice('project-status', 'Project verwijderd.');
      resetProjectForm();
      return loadProjects();
    }
    const reviewEdit = e.target.closest('[data-review-edit]');
    if (reviewEdit) return startEditReview(reviewEdit.dataset.reviewEdit);
    const reviewDelete = e.target.closest('[data-review-delete]');
    if (reviewDelete) {
      if (!confirm('Review verwijderen?')) return;
      await api(`/api/reviews/admin/delete/${reviewDelete.dataset.reviewDelete}`, { method: 'POST' });
      notice('review-status', 'Review verwijderd.');
      resetReviewForm();
      return loadReviews();
    }
  });
}


function bindQuickActions() {
  document.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-jump');
      const target = document.querySelector(targetSelector);
      if (!target) return;
      window.location.hash = targetSelector;
      target.classList.add('admin-section-highlight');
      setTimeout(() => target.classList.remove('admin-section-highlight'), 1400);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveAdminLink();
    });
  });

  window.addEventListener('hashchange', () => {
    setActiveAdminLink();
  });
}

function bindLogout() {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
}

(async function init() {
  try {
    await loadSession();
  } catch (err) {
    console.error('Sessie laden mislukt:', err);
    window.location.href = '/login.html';
    return;
  }

  bindProjectForm();
  bindReviewForm();
  bindServiceForm();
  bindSettingsForm();
  bindTables();
  bindLogout();
  bindQuickActions();
  setActiveAdminLink();
  window.addEventListener('hashchange', setActiveAdminLink);

  try { await loadSettings(); } catch (err) { console.error('loadSettings fout:', err); }
  try { await loadProjects(); } catch (err) { console.error('loadProjects fout:', err); }
  try { await loadReviews(); } catch (err) { console.error('loadReviews fout:', err); }
  try { await loadServices(); } catch (err) { console.error('loadServices fout:', err); }
  try { await loadLeads(); } catch (err) { console.error('loadLeads fout:', err); }
  try { await loadAnalytics(); } catch (err) { console.error('loadAnalytics fout:', err); }
})();
