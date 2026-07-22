const AUTH_KEY = 'smai_logged_in';
const USER_KEY = 'smai_user';

export function resolvePath(rootPath) {
  const isSubPage = window.location.pathname.includes('/src/pages/');
  if (!isSubPage) return '.' + rootPath;
  if (rootPath.startsWith('/src/pages/')) return './' + rootPath.split('/').pop();
  return '../..' + rootPath;
}

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

function getNavKeys(role) {
  const t = window.SMAI?.t || (k => k);
  const NAV = {
    admin: [
      { href: resolvePath('/index.html'), labelKey: 'nav.home' },
      { href: resolvePath('/src/pages/dashboard.html'), labelKey: 'nav.dashboard' },
      { href: resolvePath('/src/pages/umbrales.html'), labelKey: 'nav.thresholds' },
      { href: resolvePath('/src/pages/consulta-datos.html'), labelKey: 'nav.query' },
      { href: resolvePath('/src/pages/alertas.html'), labelKey: 'nav.alerts' },
      { href: resolvePath('/src/pages/reporte-fallas.html'), labelKey: 'nav.reports' },
      { href: resolvePath('/src/pages/lecturas-manuales.html'), labelKey: 'nav.readings' }
    ],
    consultor: [
      { href: resolvePath('/index.html'), labelKey: 'nav.home' },
      { href: resolvePath('/src/pages/dashboard.html'), labelKey: 'nav.dashboard' },
      { href: resolvePath('/src/pages/consulta-datos.html'), labelKey: 'nav.query' },
      { href: resolvePath('/src/pages/alertas.html'), labelKey: 'nav.alerts' }
    ],
    tecnico: [
      { href: resolvePath('/index.html'), labelKey: 'nav.home' },
      { href: resolvePath('/src/pages/lecturas-manuales.html'), labelKey: 'nav.readings' },
      { href: resolvePath('/src/pages/reporte-fallas.html'), labelKey: 'nav.reports' }
    ]
  };
  return (NAV[role] || NAV.admin).map(l => ({ href: l.href, label: t(l.labelKey) }));
}

const SHORTCUTS = {};
function buildShortcuts() {
  SHORTCUTS[resolvePath('/index.html')] = 'Alt+1 / Ctrl+Shift+1';
  SHORTCUTS[resolvePath('/src/pages/dashboard.html')] = 'Alt+2 / Ctrl+Shift+2';
  SHORTCUTS[resolvePath('/src/pages/umbrales.html')] = 'Alt+3 / Ctrl+Shift+3';
  SHORTCUTS[resolvePath('/src/pages/consulta-datos.html')] = 'Alt+4 / Ctrl+Shift+4';
  SHORTCUTS[resolvePath('/src/pages/alertas.html')] = 'Alt+5 / Ctrl+Shift+5';
  SHORTCUTS[resolvePath('/src/pages/reporte-fallas.html')] = 'Alt+6 / Ctrl+Shift+6';
  SHORTCUTS[resolvePath('/src/pages/lecturas-manuales.html')] = 'Alt+7 / Ctrl+Shift+7';
}

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
  window.location.href = resolvePath('/index.html');
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
    const t = window.SMAI?.t || (k => k);
    window.showNotification?.(t('notif.login'), 'error');
    setTimeout(() => { window.location.href = resolvePath('/index.html'); }, 1500);
  }
}

export function buildNav() {
  const nav = document.querySelector('nav[aria-label="Navegación principal"], nav[aria-label="Main navigation"]');
  if (!nav) return;
  const role = getRole();
  const t = window.SMAI?.t || (k => k);
  if (!role) { nav.innerHTML = ''; return; }
  const links = getNavKeys(role);
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
      a.className += ' active-nav';
    } else {
      a.className += ' text-white/80 hover:text-white hover:bg-white/20';
    }
    const sh = SHORTCUTS[link.href];
    if (sh) a.setAttribute('data-tooltip', link.label + ' (' + sh + ')');
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);

  // Right group: lang toggle + user info + logout
  const rightGroup = document.createElement('div');
  rightGroup.className = 'flex items-center gap-1 ml-auto';

  // Language toggle
  if (window.SMAI?.buildLangToggle) {
    const langBtn = window.SMAI.buildLangToggle();
    rightGroup.appendChild(langBtn);
  }

  if (isLoggedIn()) {
    const user = getUser();
    const userSpan = document.createElement('span');
    userSpan.className = 'text-xs text-white/50 mr-1 hidden sm:inline';
    userSpan.textContent = user ? `${user.email}` : '';
    rightGroup.appendChild(userSpan);
    const roleBadge = document.createElement('span');
    const roleNameKey = { admin: 'chat.role.admin', consultor: 'chat.role.consultor', tecnico: 'chat.role.tecnico' }[user?.role];
    const roleName = roleNameKey ? t(roleNameKey) : user?.role || '';
    roleBadge.className = 'text-[10px] px-1.5 py-0.5 rounded-full bg-white/15 text-white/70 mr-1';
    roleBadge.textContent = roleName;
    rightGroup.appendChild(roleBadge);
    const logoutBtn = document.createElement('button');
    logoutBtn.setAttribute('data-action', 'logout');
    logoutBtn.setAttribute('aria-label', t('nav.logout'));
    logoutBtn.setAttribute('data-tooltip', t('nav.logout'));
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
    window.location.href = resolvePath('/src/pages/login.html');
    return;
  }
  const main = document.getElementById('main');
  if (main) main.removeAttribute('hidden');
  if (!hasAccess(page)) {
    const t = window.SMAI?.t || (k => k);
    window.showNotification?.(t('notif.login'), 'error');
    setTimeout(() => { window.location.href = resolvePath('/index.html'); }, 1500);
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
  if (isNoTiming()) {
    clearTimers();
    const overlay = document.getElementById('sessionTimeout');
    if (overlay) overlay.remove();
    return;
  }
  clearTimers();
  const overlay = document.getElementById('sessionTimeout');
  if (overlay) overlay.remove();
  _timeoutId = setTimeout(showWarning, 900000);
}

function showWarning() {
  if (isNoTiming()) { clearTimers(); return; }
  const t = window.SMAI?.t || (k => k);
  const div = document.createElement('div');
  div.className = 'session-timeout';
  div.id = 'sessionTimeout';
  div.setAttribute('timeout', '');
  div.innerHTML = `
    <div class="session-timeout-dialog" role="dialog" aria-modal="true" aria-label="${t('timeout.title')}">
      <h3>⏰ ${t('timeout.title')}</h3>
      <p>${t('timeout.msg')}</p>
      <div class="countdown" id="countdownDisplay">2:00</div>
      <button class="btn btn-primary" id="extendBtn" timeout>${t('timeout.extend')}</button>
    </div>`;
  document.body.appendChild(div);
  const extendBtn = document.getElementById('extendBtn');
  extendBtn.focus();
  extendBtn.addEventListener('click', extendSession);
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
  buildShortcuts();
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
  // Rebuild nav on language change
  window.addEventListener('langchange', () => { buildNav(); });
});
