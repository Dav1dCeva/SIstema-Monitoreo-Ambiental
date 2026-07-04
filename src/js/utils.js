export function showNotification(message, type = 'success') {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-5 right-5 z-[10001] flex flex-col gap-2 max-w-[400px]';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `notification notification-${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

window.showNotification = showNotification;

export function confirmAction(title, message) {
  return new Promise(resolve => {
    const prevFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title);
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="btn-group">
          <button class="px-4 py-1.5 rounded text-sm font-semibold cursor-pointer bg-green-600 text-white hover:opacity-85 border-none" id="confirm-yes">Sí, confirmar</button>
          <button class="px-4 py-1.5 rounded text-sm font-semibold cursor-pointer bg-gray-600 text-white hover:opacity-85 border-none" id="confirm-no">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirm-yes').focus();

    function cleanup() {
      document.removeEventListener('keydown', handler);
      overlay.remove();
      if (prevFocus) prevFocus.focus();
    }

    document.getElementById('confirm-yes').addEventListener('click', () => { cleanup(); resolve(true); });
    document.getElementById('confirm-no').addEventListener('click', () => { cleanup(); resolve(false); });
    overlay.addEventListener('click', e => { if (e.target === overlay) { cleanup(); resolve(false); } });
    function handler(e) { if (e.key === 'Escape') { cleanup(); resolve(false); } }
    document.addEventListener('keydown', handler);
  });
}

window.confirmAction = confirmAction;

export function initTooltips() {
  if (window._tooltipsInited) return;

  let tooltipsDisabled = false;
  try {
    const prefs = JSON.parse(localStorage.getItem('accesibilidad_prefs'));
    tooltipsDisabled = prefs?.disableTooltips === true;
  } catch(e) {}

  if (tooltipsDisabled) {
    const style = document.createElement('style');
    style.id = 'tooltips-off';
    style.textContent = '[data-tooltip]::after,[data-tooltip]::before{display:none!important}';
    document.head.appendChild(style);
    window._tooltipsInited = true;
    return;
  }

  window._tooltipsInited = true;

  function checkOverflow(el) {
    el.classList.remove('tooltip-top');
    const rect = el.getBoundingClientRect();
    const tooltipH = 80;
    if (rect.bottom + tooltipH > window.innerHeight) {
      el.classList.add('tooltip-top');
    }
  }

  document.addEventListener('mouseenter', e => {
    const el = e.target.closest('[data-tooltip]');
    if (el) checkOverflow(el);
  }, true);

  document.addEventListener('focus', e => {
    const el = e.target.closest('[data-tooltip]');
    if (el) checkOverflow(el);
  }, true);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-tooltip].tooltip-show').forEach(el => el.classList.remove('tooltip-show'));
      const focused = document.activeElement?.closest('[data-tooltip]');
      if (focused) focused.blur();
    }
  });
}

export function autoFill(formId, fields) {
  let saved = {};
  try {
    const raw = sessionStorage.getItem('autofill_' + formId);
    if (raw) saved = JSON.parse(raw);
  } catch(e) {}
  let hasData = false;
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    if (saved[f.id]) {
      el.value = saved[f.id];
      hasData = true;
    }
    el.addEventListener('input', () => {
      saved[f.id] = el.value;
      try { sessionStorage.setItem('autofill_' + formId, JSON.stringify(saved)); } catch(e) {}
    });
  });
  return hasData;
}

export function getFromLS(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch(e) { return fallback; }
}

export function saveToLS(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
}
