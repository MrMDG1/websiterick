const form = document.getElementById('login-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('login-status');
  status.innerHTML = '';
  const data = Object.fromEntries(new FormData(form).entries());
  const res = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  const json = await res.json();
  if (res.ok) {
    status.innerHTML = '<div class="notice">Inloggen gelukt. Doorsturen…</div>';
    setTimeout(() => { window.location.href = '/admin'; }, 500);
  } else {
    status.innerHTML = `<div class="notice error">${json.error}</div>`;
  }
});
