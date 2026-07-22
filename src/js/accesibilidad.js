import { resolvePath } from './auth.js';
const KEY = 'accesibilidad_prefs';
const defaults = {
  fontSize: 100, fontFamily: 'default', lineSpacing: false,
  highContrast: false, monochrome: false, contrastControls: false,
  stopMotion: false, reduceFlashes: false, focusVisible: false,
  targetSize: false, showSkipLinks: false,
  disableTooltips: false,
  audioMuted: false, subtitles: true, transcripts: false, audioDescription: false,
  keyboardShortcuts: true, noTiming: false
};
let prefs = { ...defaults };

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) prefs = { ...defaults, ...JSON.parse(saved) };
  } catch(e) {}
  apply();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch(e) {}
  apply();
}

function apply() {
  const html = document.documentElement;
  const body = document.body;
  html.style.fontSize = prefs.fontSize + '%';
  if (prefs.fontFamily === 'sans') {
    body.style.fontFamily = 'Arial, Helvetica, sans-serif';
  } else if (prefs.fontFamily === 'serif') {
    body.style.fontFamily = 'Georgia, "Times New Roman", serif';
  } else if (prefs.fontFamily === 'dyslexic') {
    body.style.fontFamily = '"OpenDyslexic", Arial, sans-serif';
  } else {
    body.style.fontFamily = '';
  }
  body.style.lineHeight = prefs.lineSpacing ? '2' : '';
  body.style.letterSpacing = prefs.lineSpacing ? '0.15em' : '';
  body.classList.toggle('high-contrast', prefs.highContrast);
  body.classList.toggle('monochrome', prefs.monochrome);
  body.classList.toggle('contrast-controls', prefs.contrastControls);
  body.classList.toggle('stop-motion', prefs.stopMotion);
  body.classList.toggle('reduce-flashes', prefs.reduceFlashes);
  body.classList.toggle('focus-visible', prefs.focusVisible);
  body.classList.toggle('target-size', prefs.targetSize);
  document.querySelectorAll('.skip-link').forEach(el => {
    el.style.display = prefs.showSkipLinks ? 'inline-block' : '';
    el.style.top = prefs.showSkipLinks ? '8px' : '';
  });
  document.querySelectorAll('audio, video').forEach(el => el.muted = !!prefs.audioMuted);
  document.querySelectorAll('track[kind="captions"]').forEach(track => {
    try { track.track.mode = prefs.subtitles ? 'showing' : 'hidden'; } catch(e) {}
  });
  document.querySelectorAll('track[kind="descriptions"]').forEach(track => {
    try { track.track.mode = prefs.audioDescription ? 'showing' : 'hidden'; } catch(e) {}
  });
  document.querySelectorAll('.video-transcript').forEach(el => {
    el.style.display = prefs.transcripts ? 'block' : 'none';
  });
  document.querySelectorAll('.audio-description').forEach(el => {
    el.style.display = prefs.audioDescription ? 'block' : 'none';
  });
  body.classList.toggle('no-timing', prefs.noTiming);
  let tooltipStyle = document.getElementById('tooltips-off');
  if (prefs.disableTooltips) {
    if (!tooltipStyle) {
      tooltipStyle = document.createElement('style');
      tooltipStyle.id = 'tooltips-off';
      tooltipStyle.textContent = '[data-tooltip]::after,[data-tooltip]::before{display:none!important}';
      document.head.appendChild(tooltipStyle);
    }
  } else {
    if (tooltipStyle) tooltipStyle.remove();
  }
}

function toggle(key) {
  prefs[key] = !prefs[key];
  save();
  return prefs[key];
}

function setVal(key, val) {
  prefs[key] = val;
  save();
}

function getPrefs() { return prefs; }

function initExports() {
  window.SMAI = window.SMAI || {};
  SMAI.exportPDF = function(source) {
    const t = window.SMAI?.t || (k => k);
    try {
      const doc = new jspdf.jsPDF();
      doc.text('SMAI - ' + source, 10, 10);
      const rows = [];
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        const header = [];
        tables[0].querySelectorAll('thead th').forEach(th => header.push(th.textContent));
        rows.push(header);
        tables[0].querySelectorAll('tbody tr').forEach(tr => {
          const row = [];
          tr.querySelectorAll('td').forEach(td => row.push(td.textContent.trim()));
          if (row.length > 0) rows.push(row);
        });
      }
      if (rows.length > 1) {
        doc.autoTable({ head: [rows[0]], body: rows.slice(1) });
      }
      doc.save('reporte_' + source + '_' + new Date().toISOString().slice(0,10) + '.pdf');
      window.showNotification?.(t('notif.pdf_success'), 'success');
    } catch(e) {
      window.showNotification?.(t('notif.pdf_error'), 'error');
    }
  };

  SMAI.exportExcel = function(source) {
    const t = window.SMAI?.t || (k => k);
    try {
      const data = [];
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        const header = [];
        tables[0].querySelectorAll('thead th').forEach(th => header.push(th.textContent));
        data.push(header);
        tables[0].querySelectorAll('tbody tr').forEach(tr => {
          const row = [];
          tr.querySelectorAll('td').forEach(td => row.push(td.textContent.trim()));
          if (row.length > 0) data.push(row);
        });
      }
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      XLSX.writeFile(wb, 'reporte_' + source + '_' + new Date().toISOString().slice(0,10) + '.xlsx');
      window.showNotification?.(t('notif.excel_success'), 'success');
    } catch(e) {
      window.showNotification?.(t('notif.excel_error'), 'error');
    }
  };
}

function buildMenu() {
  const t = window.SMAI?.t || (k => k);
  const container = document.createElement('div');
  container.id = 'accesibilidad-menu';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', t('acc.title'));

  const btn = document.createElement('button');
  btn.id = 'accesibilidad-toggle';
  btn.innerHTML = '♿ ' + t('acc.title');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'accesibilidad-panel');

  const panel = document.createElement('div');
  panel.id = 'accesibilidad-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', t('acc.panel_label'));
  panel.style.display = 'none';

  btn.addEventListener('click', () => {
    const open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : 'block';
    btn.setAttribute('aria-expanded', !open);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.style.display !== 'none') {
      panel.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#accesibilidad-menu') && panel.style.display !== 'none') {
      panel.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  const groups = [
    { titleKey: 'acc.text_opts', items: [
      { labelKey: 'acc.font_size', type: 'range', key: 'fontSize', min: 50, max: 200, step: 10, unit: '%' },
      { labelKey: 'acc.font_family', type: 'select', key: 'fontFamily', options: [
        { value: 'default', textKey: 'acc.font.original' },
        { value: 'sans', textKey: 'acc.font.sans' },
        { value: 'serif', textKey: 'acc.font.serif' },
        { value: 'dyslexic', textKey: 'acc.font.dyslexic' }
      ]},
      { labelKey: 'acc.line_spacing', type: 'toggle', key: 'lineSpacing' },
    ]},
    { titleKey: 'acc.color_opts', items: [
      { labelKey: 'acc.high_contrast', type: 'toggle', key: 'highContrast' },
      { labelKey: 'acc.monochrome', type: 'toggle', key: 'monochrome' },
      { labelKey: 'acc.contrast_controls', type: 'toggle', key: 'contrastControls' },
    ]},
    { titleKey: 'acc.motion_opts', items: [
      { labelKey: 'acc.stop_anim', type: 'toggle', key: 'stopMotion' },
      { labelKey: 'acc.reduce_flashes', type: 'toggle', key: 'reduceFlashes' },
    ]},
    { titleKey: 'acc.nav_opts', items: [
      { labelKey: 'acc.show_skip', type: 'toggle', key: 'showSkipLinks' },
      { labelKey: 'acc.focus_highlight', type: 'toggle', key: 'focusVisible' },
      { labelKey: 'acc.large_targets', type: 'toggle', key: 'targetSize' },
      { labelKey: 'acc.disable_tooltips', type: 'toggle', key: 'disableTooltips' },
    ]},
    { titleKey: 'acc.form_opts', items: [
      { labelKey: 'acc.disable_shortcuts', type: 'toggle', key: 'keyboardShortcuts' },
      { labelKey: 'acc.no_timing', type: 'toggle', key: 'noTiming' },
    ]},
    { titleKey: 'acc.reader_opts', items: [
      { labelKey: 'acc.enable_reader', type: 'readerToggle', key: 'readerEnabled' },
    ]},
  ];

  const hasMedia = document.querySelector('audio, video');
  if (hasMedia) {
    groups.push({
      titleKey: 'acc.audio_opts',
      items: [
        { labelKey: 'acc.mute_audio', type: 'toggle', key: 'audioMuted' },
        { labelKey: 'acc.enable_subtitles', type: 'toggle', key: 'subtitles' },
        { labelKey: 'acc.enable_transcripts', type: 'toggle', key: 'transcripts' },
        { labelKey: 'acc.enable_audiodesc', type: 'toggle', key: 'audioDescription' },
      ]
    });
  }

  groups.forEach(group => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = t(group.titleKey);
    legend.setAttribute('data-i18n', group.titleKey);
    fieldset.appendChild(legend);

    group.items.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.className = 'acc-item';

      if (item.type === 'toggle') {
        const label = document.createElement('label');
        label.className = 'acc-toggle';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = prefs[item.key];
        cb.addEventListener('change', () => {
          prefs[item.key] = cb.checked;
          save();
        });
        const span = document.createElement('span');
        span.textContent = t(item.labelKey);
        span.setAttribute('data-i18n', item.labelKey);
        label.appendChild(cb);
        label.appendChild(span);
        wrapper.appendChild(label);
      } else if (item.type === 'range') {
        const label = document.createElement('label');
        label.style.display = 'block';
        const span = document.createElement('span');
        span.textContent = t(item.labelKey) + ': ' + prefs[item.key] + item.unit;
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = item.min; inp.max = item.max;
        inp.step = item.step; inp.value = prefs[item.key];
        inp.addEventListener('input', () => {
          prefs[item.key] = parseInt(inp.value);
          span.textContent = t(item.labelKey) + ': ' + prefs[item.key] + item.unit;
          save();
        });
        label.appendChild(span);
        label.appendChild(inp);
        wrapper.appendChild(label);
      } else if (item.type === 'readerToggle') {
        const label = document.createElement('label');
        label.className = 'acc-toggle';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'reader-toggle-cb';
        cb.checked = false;
        cb.addEventListener('change', () => {
          if (cb.checked) {
            SMAI.enableReader?.();
          } else {
            SMAI.disableReader?.();
          }
        });
        const span = document.createElement('span');
        span.textContent = t(item.labelKey);
        label.appendChild(cb);
        label.appendChild(span);
        wrapper.appendChild(label);
      } else if (item.type === 'select') {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.textContent = t(item.labelKey);
        const sel = document.createElement('select');
        sel.style.display = 'block';
        sel.style.marginTop = '4px';
        sel.style.width = '100%';
        item.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value; o.textContent = t(opt.textKey);
          if (opt.value === prefs[item.key]) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', () => {
          prefs[item.key] = sel.value;
          save();
        });
        label.appendChild(sel);
        wrapper.appendChild(label);
      }
      fieldset.appendChild(wrapper);
    });
    panel.appendChild(fieldset);
  });

  const resetBtn = document.createElement('button');
  resetBtn.textContent = t('acc.reset');
  resetBtn.className = 'btn btn-sm';
  resetBtn.style.marginTop = '12px';
  resetBtn.addEventListener('click', () => {
    prefs = { ...defaults };
    save();
    location.reload();
  });
  panel.appendChild(resetBtn);
  container.appendChild(btn);
  container.appendChild(panel);

  const skipLink = document.querySelector('.skip-link');
  if (skipLink?.parentNode) {
    skipLink.parentNode.insertBefore(container, skipLink.nextSibling);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }
}

function initKeyboardShortcuts() {
  const shortcuts = {
    '1': resolvePath('/index.html'), '2': resolvePath('/src/pages/dashboard.html'), '3': resolvePath('/src/pages/umbrales.html'),
    '4': resolvePath('/src/pages/consulta-datos.html'), '5': resolvePath('/src/pages/alertas.html'), '6': resolvePath('/src/pages/reporte-fallas.html'),
    '7': resolvePath('/src/pages/lecturas-manuales.html')
  };
  document.addEventListener('keydown', e => {
    const p = getPrefs();
    if (!p.keyboardShortcuts) return;
    const alt = e.altKey && !e.ctrlKey && !e.metaKey;
    const ctrlShift = e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey;
    if (alt || ctrlShift) {
      const url = shortcuts[e.key];
      if (url) {
        e.preventDefault();
        window.location.href = url;
      }
    }
  });
}

function buildHelpButton() {
  const t = window.SMAI?.t || (k => k);
  const helpBtn = document.createElement('button');
  helpBtn.id = 'help-button';
  helpBtn.innerHTML = '?';
  helpBtn.setAttribute('aria-label', t('acc.title'));
  helpBtn.setAttribute('title', '?');

  const helpPanel = document.createElement('div');
  helpPanel.id = 'help-panel';

  const pageHelp = {
    'index.html': { titleKey: 'help.title', contentKey: 'help.home' },
    'dashboard.html': { titleKey: 'help.dashboard.title', contentKey: 'help.dashboard' },
    'umbrales.html': { titleKey: 'help.thresholds.title', contentKey: 'help.thresholds' },
    'consulta-datos.html': { titleKey: 'help.query.title', contentKey: 'help.query' },
    'reporte-fallas.html': { titleKey: 'help.reports.title', contentKey: 'help.reports' },
    'lecturas-manuales.html': { titleKey: 'help.readings.title', contentKey: 'help.readings' },
    'login.html': { titleKey: 'help.login.title', contentKey: 'help.login' }
  };

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const helpInfo = pageHelp[currentPage] || pageHelp['index.html'];

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-close-help';
  closeBtn.setAttribute('aria-label', '×');
  closeBtn.innerHTML = '&times;';
  helpPanel.appendChild(closeBtn);

  const title = document.createElement('h3');
  title.textContent = t(helpInfo.titleKey);
  helpPanel.appendChild(title);

  const para = document.createElement('p');
  para.textContent = t(helpInfo.contentKey);
  helpPanel.appendChild(para);

  helpBtn.addEventListener('click', () => {
    const isOpen = helpPanel.style.display !== 'none';
    helpPanel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) closeBtn.focus();
  });

  closeBtn.addEventListener('click', () => {
    helpPanel.style.display = 'none';
    helpBtn.focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && helpPanel.style.display !== 'none') {
      helpPanel.style.display = 'none';
      helpBtn.focus();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#help-button') && !e.target.closest('#help-panel')) {
      helpPanel.style.display = 'none';
    }
  });

  document.body.appendChild(helpBtn);
  document.body.appendChild(helpPanel);
}

function buildShortcutsButton() {
  const t = window.SMAI?.t || (k => k);
  const btn = document.createElement('button');
  btn.id = 'shortcuts-button';
  btn.innerHTML = '&#x2328;';
  btn.setAttribute('aria-label', t('shortcuts.title'));
  btn.setAttribute('title', t('shortcuts.title'));

  const panel = document.createElement('div');
  panel.id = 'shortcuts-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', t('shortcuts.title'));

  const navPages = [
    { href: 'index.html', labelKey: 'shortcuts.home' },
    { href: 'dashboard.html', labelKey: 'shortcuts.dashboard' },
    { href: 'umbrales.html', labelKey: 'shortcuts.thresholds' },
    { href: 'consulta-datos.html', labelKey: 'shortcuts.query' },
    { href: 'alertas.html', labelKey: 'shortcuts.alerts' },
    { href: 'reporte-fallas.html', labelKey: 'shortcuts.reports' },
    { href: 'lecturas-manuales.html', labelKey: 'shortcuts.readings' }
  ];

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-close-shortcuts';
  closeBtn.setAttribute('aria-label', '×');
  closeBtn.innerHTML = '&times;';
  panel.appendChild(closeBtn);

  const title = document.createElement('h3');
  title.textContent = t('shortcuts.title');
  panel.appendChild(title);

  const para = document.createElement('p');
  para.textContent = t('shortcuts.desc');
  panel.appendChild(para);

  const table = document.createElement('table');
  table.className = 'shortcuts-table';
  table.innerHTML =
    `<thead><tr><th scope="col">${t('shortcuts.col.alt')}</th><th scope="col">${t('shortcuts.col.ctrl')}</th><th scope="col">${t('shortcuts.col.section')}</th></tr></thead>` +
    '<tbody>' + navPages.map((p, i) =>
      `<tr><td>Alt+${i+1}</td><td>Ctrl+Shift+${i+1}</td><td>${t(p.labelKey)}</td></tr>`
    ).join('') + '</tbody>';
  panel.appendChild(table);

  btn.addEventListener('click', () => {
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) closeBtn.focus();
  });

  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
    btn.focus();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#shortcuts-button') && !e.target.closest('#shortcuts-panel')) {
      panel.style.display = 'none';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.style.display !== 'none') {
      panel.style.display = 'none';
      btn.focus();
    }
  });

  document.body.appendChild(btn);
  document.body.appendChild(panel);
}

// Init everything
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  load();
  buildMenu();
  buildHelpButton();
  buildShortcutsButton();
  initKeyboardShortcuts();
  initExports();
  if (window.initTooltips) window.initTooltips();

  // Rebuild accessibility panel on language change
  window.addEventListener('langchange', () => {
    const oldPanel = document.getElementById('accesibilidad-menu');
    if (oldPanel) oldPanel.remove();
    const oldHelp = document.getElementById('help-button');
    if (oldHelp) oldHelp.remove();
    const oldHelpPanel = document.getElementById('help-panel');
    if (oldHelpPanel) oldHelpPanel.remove();
    const oldShortcuts = document.getElementById('shortcuts-button');
    if (oldShortcuts) oldShortcuts.remove();
    const oldShortcutsPanel = document.getElementById('shortcuts-panel');
    if (oldShortcutsPanel) oldShortcutsPanel.remove();
    buildMenu();
    buildHelpButton();
    buildShortcutsButton();
  });
}
