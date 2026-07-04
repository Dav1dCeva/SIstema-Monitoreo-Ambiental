const AUTH_KEY = 'smai_logged_in';
const USER_KEY = 'smai_user';

const ACCESS = {
  'index.html':           ['admin','consultor','tecnico'],
  'dashboard.html':       ['admin','consultor'],
  'umbrales.html':        ['admin'],
  'consulta-datos.html':  ['admin','consultor'],
  'alertas.html':         ['admin','consultor'],
  'reporte-fallas.html':  ['admin','tecnico'],
  'lecturas-manuales.html': ['admin','tecnico'],
  'login.html':           ['admin','consultor','tecnico'],
  'sitemap.html':         ['admin','consultor','tecnico']
};

const NAV = {
  admin: [
    { href: '/index.html', label: 'Inicio' },
    { href: '/src/pages/dashboard.html', label: 'Dashboard' },
    { href: '/src/pages/umbrales.html', label: 'Umbrales' },
    { href: '/src/pages/consulta-datos.html', label: 'Consultar datos' },
    { href: '/src/pages/alertas.html', label: 'Alertas' },
    { href: '/src/pages/reporte-fallas.html', label: 'Reportar falla' },
    { href: '/src/pages/lecturas-manuales.html', label: 'Lecturas manuales' }
  ],
  consultor: [
    { href: '/index.html', label: 'Inicio' },
    { href: '/src/pages/dashboard.html', label: 'Dashboard' },
    { href: '/src/pages/consulta-datos.html', label: 'Consultar datos' },
    { href: '/src/pages/alertas.html', label: 'Alertas' }
  ],
  tecnico: [
    { href: '/index.html', label: 'Inicio' },
    { href: '/src/pages/lecturas-manuales.html', label: 'Lecturas manuales' },
    { href: '/src/pages/reporte-fallas.html', label: 'Reportar falla' }
  ]
};

export function login(email, role) {
  try {
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify({ email, role, loginTime: new Date().toISOString() }));
  } catch(e) {}
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  } catch(e) {}
  window.location.href = '/index.html';
}

export function isLoggedIn() {
  try { return localStorage.getItem(AUTH_KEY) === 'true'; }
  catch(e) { return false; }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

export function getRole() {
  const user = getUser();
  return user ? user.role : null;
}

export function hasAccess(page) {
  const role = getRole();
  if (!role) return false;
  const clean = page.startsWith('/') ? page.split('/').pop() : page;
  const allowed = ACCESS[clean];
  return allowed && allowed.includes(role);
}

export function requireAccess() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'login.html') return;
  if (isLoggedIn() && !hasAccess(page)) {
    window.showNotification?.('No tienes permisos para acceder a esta sección.', 'error');
    setTimeout(() => { window.location.href = '/index.html'; }, 1500);
  }
}

const SHORTCUTS = {
  '/index.html': 'Alt+1 / Ctrl+Shift+1',
  '/src/pages/dashboard.html': 'Alt+2 / Ctrl+Shift+2',
  '/src/pages/umbrales.html': 'Alt+3 / Ctrl+Shift+3',
  '/src/pages/consulta-datos.html': 'Alt+4 / Ctrl+Shift+4',
  '/src/pages/alertas.html': 'Alt+5 / Ctrl+Shift+5',
  '/src/pages/reporte-fallas.html': 'Alt+6 / Ctrl+Shift+6',
  '/src/pages/lecturas-manuales.html': 'Alt+7 / Ctrl+Shift+7'
};

export function buildNav() {
  const nav = document.querySelector('nav[aria-label="Navegación principal"]');
  if (!nav) return;
  const role = getRole();
  if (!role) { nav.innerHTML = ''; return; }
  const links = NAV[role] || NAV.admin;
  const currentPage = window.location.pathname;
  nav.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'flex gap-1 flex-wrap items-center list-none p-0 m-0';
  links.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    a.className = 'px-3 py-1.5 rounded no-underline text-sm transition-all duration-150 inline-block';
    if (link.href === currentPage) {
      a.className += ' bg-white/25 text-white font-semibold';
    } else {
      a.className += ' text-white/80 hover:text-white hover:bg-white/15';
    }
    const sh = SHORTCUTS[link.href];
    if (sh) a.setAttribute('data-tooltip', 'Ir a ' + link.label + ' (' + sh + ')');
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);
  const rightGroup = document.createElement('div');
  rightGroup.className = 'flex items-center gap-1 ml-auto';
  if (isLoggedIn()) {
    const user = getUser();
    const userSpan = document.createElement('span');
    userSpan.className = 'text-xs text-white/50 mr-1 hidden sm:inline';
    userSpan.textContent = user ? `${user.email}` : '';
    rightGroup.appendChild(userSpan);
    const roleBadge = document.createElement('span');
    const roleName = { admin: 'Admin', consultor: 'Consultor', tecnico: 'Técnico' }[user?.role] || user?.role || '';
    roleBadge.className = 'text-[10px] px-1.5 py-0.5 rounded-full bg-white/15 text-white/70 mr-1';
    roleBadge.textContent = roleName;
    rightGroup.appendChild(roleBadge);
    const logoutBtn = document.createElement('button');
    logoutBtn.setAttribute('data-action', 'logout');
    logoutBtn.setAttribute('aria-label', 'Cerrar sesión');
    logoutBtn.setAttribute('data-tooltip', 'Cerrar sesión');
    logoutBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
    logoutBtn.className = 'w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all duration-150 border-none cursor-pointer';
    rightGroup.appendChild(logoutBtn);
  }
  nav.appendChild(rightGroup);
}

export function protectPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  if (page === 'login.html') return;
  if (!isLoggedIn()) {
    window.location.href = '/src/pages/login.html';
    return;
  }
  const main = document.getElementById('main');
  if (main) main.removeAttribute('hidden');
  if (!hasAccess(page)) {
    window.showNotification?.('No tienes permisos para acceder a esta sección.', 'error');
    setTimeout(() => { window.location.href = '/index.html'; }, 1500);
  }
}

export function updateAuthUI() {
  const loggedIn = isLoggedIn();
  document.querySelectorAll('[data-auth="login"]').forEach(el => {
    el.style.display = loggedIn ? 'none' : '';
  });
  buildNav();
}

// Session timeout
let _timeoutId = null, _warnId = null, _countdownId = null;
let _lastActivity = Date.now();

function isNoTiming() {
  try {
    const prefs = JSON.parse(localStorage.getItem('accesibilidad_prefs'));
    return prefs?.noTiming === true;
  } catch(e) { return false; }
}

function clearTimers() {
  if (_timeoutId) { clearTimeout(_timeoutId); _timeoutId = null; }
  if (_warnId) { clearTimeout(_warnId); _warnId = null; }
  if (_countdownId) { clearInterval(_countdownId); _countdownId = null; }
}

function resetActivity() {
  _lastActivity = Date.now();
  if (isNoTiming()) return;
  clearTimers();
  const overlay = document.getElementById('sessionTimeout');
  if (overlay) overlay.remove();
  _timeoutId = setTimeout(showWarning, 900000);
}

function showWarning() {
  if (isNoTiming()) return;
  const div = document.createElement('div');
  div.className = 'session-timeout';
  div.id = 'sessionTimeout';
  div.setAttribute('timeout', '');
  div.innerHTML = `
    <div class="session-timeout-dialog" role="dialog" aria-modal="true" aria-label="Sesión próxima a expirar">
      <h3>⏰ Sesión próxima a expirar</h3>
      <p>Por inactividad, su sesión cerrará en:</p>
      <div class="countdown" id="countdownDisplay">2:00</div>
      <button class="btn btn-primary" id="extendBtn" timeout>Extender sesión</button>
    </div>`;
  document.body.appendChild(div);
  document.getElementById('extendBtn').focus();
  document.getElementById('extendBtn').addEventListener('click', extendSession);
  document.addEventListener('keydown', timeoutKeydown);
  let segundos = 120;
  _countdownId = setInterval(() => {
    segundos--;
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    const cd = document.getElementById('countdownDisplay');
    if (cd) cd.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    if (segundos <= 0) { clearInterval(_countdownId); logout(); }
  }, 1000);
}

function timeoutKeydown(e) {
  if (e.key === 'Escape') extendSession();
}

function extendSession() {
  clearTimers();
  document.removeEventListener('keydown', timeoutKeydown);
  const overlay = document.getElementById('sessionTimeout');
  if (overlay) overlay.remove();
  _timeoutId = setTimeout(showWarning, 900000);
}

let _throttleTimer = null;
function onActivity() {
  if (isNoTiming()) return;
  const now = Date.now();
  if (now - _lastActivity < 30000) return;
  _lastActivity = now;
  resetActivity();
}

export function initSessionTimer() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'login.html' || !isLoggedIn()) return;
  resetActivity();
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
  events.forEach(e => document.addEventListener(e, onActivity, true));
  document.addEventListener('mousemove', () => {
    if (_throttleTimer) return;
    _throttleTimer = setTimeout(() => { _throttleTimer = null; onActivity(); }, 10000);
  }, true);
}

// Auto-init: nav + session + logout listener
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  initSessionTimer();
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-action="logout"]');
    if (target) {
      e.preventDefault();
      clearTimers();
      logout();
    }
  });
});
