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
    try {
      const doc = new jspdf.jsPDF();
      doc.text('SMAI - Reporte de ' + source, 10, 10);
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
      window.showNotification?.('Reporte PDF descargado correctamente.', 'success');
    } catch(e) {
      window.showNotification?.('Error al generar PDF. Asegúrese de tener conexión a internet.', 'error');
    }
  };

  SMAI.exportExcel = function(source) {
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
      window.showNotification?.('Reporte Excel descargado correctamente.', 'success');
    } catch(e) {
      window.showNotification?.('Error al generar Excel. Asegúrese de tener conexión a internet.', 'error');
    }
  };
}

function buildMenu() {
  const container = document.createElement('div');
  container.id = 'accesibilidad-menu';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Menú de accesibilidad');

  const btn = document.createElement('button');
  btn.id = 'accesibilidad-toggle';
  btn.innerHTML = '♿ Accesibilidad';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'accesibilidad-panel');

  const panel = document.createElement('div');
  panel.id = 'accesibilidad-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Opciones de accesibilidad');
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
    { title: 'Opciones de texto', items: [
      { label: 'Tamaño de texto', type: 'range', key: 'fontSize', min: 50, max: 200, step: 10, unit: '%' },
      { label: 'Tipografía legible', type: 'select', key: 'fontFamily', options: [
        { value: 'default', text: 'Original' },
        { value: 'sans', text: 'Sans-Serif (Arial)' },
        { value: 'serif', text: 'Serif (Georgia)' },
        { value: 'dyslexic', text: 'OpenDyslexic (lectura fácil)' }
      ]},
      { label: 'Espaciado ampliado', type: 'toggle', key: 'lineSpacing' },
    ]},
    { title: 'Opciones de color', items: [
      { label: 'Alto contraste', type: 'toggle', key: 'highContrast' },
      { label: 'Modo monocromo', type: 'toggle', key: 'monochrome' },
      { label: 'Contraste en controles', type: 'toggle', key: 'contrastControls' },
    ]},
    { title: 'Movimiento', items: [
      { label: 'Detener animaciones', type: 'toggle', key: 'stopMotion' },
      { label: 'Reducir destellos', type: 'toggle', key: 'reduceFlashes' },
    ]},
    { title: 'Navegación', items: [
      { label: 'Mostrar saltos de navegación', type: 'toggle', key: 'showSkipLinks' },
      { label: 'Resaltar foco', type: 'toggle', key: 'focusVisible' },
      { label: 'Objetivos grandes', type: 'toggle', key: 'targetSize' },
      { label: 'Desactivar tooltips', type: 'toggle', key: 'disableTooltips' },
    ]},
    { title: 'Formularios', items: [
      { label: 'Desactivar atajos teclado', type: 'toggle', key: 'keyboardShortcuts' },
      { label: 'Modo sin prisas', type: 'toggle', key: 'noTiming' },
    ]},
    { title: 'Lector de pantalla', items: [
      { label: 'Activar lector', type: 'readerToggle', key: 'readerEnabled' },
    ]},
  ];

  const hasMedia = document.querySelector('audio, video');
  if (hasMedia) {
    groups.push({
      title: 'Auditiva',
      items: [
        { label: 'Silenciar audio', type: 'toggle', key: 'audioMuted' },
        { label: 'Activar subtítulos', type: 'toggle', key: 'subtitles' },
        { label: 'Activar transcripciones', type: 'toggle', key: 'transcripts' },
        { label: 'Activar audiodescripción', type: 'toggle', key: 'audioDescription' },
      ]
    });
  }

  groups.forEach(group => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = group.title;
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
        span.textContent = item.label;
        label.appendChild(cb);
        label.appendChild(span);
        wrapper.appendChild(label);
      } else if (item.type === 'range') {
        const label = document.createElement('label');
        label.style.display = 'block';
        const span = document.createElement('span');
        span.textContent = item.label + ': ' + prefs[item.key] + item.unit;
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = item.min; inp.max = item.max;
        inp.step = item.step; inp.value = prefs[item.key];
        inp.addEventListener('input', () => {
          prefs[item.key] = parseInt(inp.value);
          span.textContent = item.label + ': ' + prefs[item.key] + item.unit;
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
        span.textContent = item.label;
        label.appendChild(cb);
        label.appendChild(span);
        wrapper.appendChild(label);
      } else if (item.type === 'select') {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.innerHTML = item.label;
        const sel = document.createElement('select');
        sel.style.display = 'block';
        sel.style.marginTop = '4px';
        sel.style.width = '100%';
        item.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value; o.textContent = opt.text;
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
  resetBtn.textContent = 'Restablecer valores';
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
    '1': '/index.html', '2': '/src/pages/dashboard.html', '3': '/src/pages/umbrales.html',
    '4': '/src/pages/consulta-datos.html', '5': '/src/pages/alertas.html', '6': '/src/pages/reporte-fallas.html',
    '7': '/src/pages/lecturas-manuales.html'
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
  const helpBtn = document.createElement('button');
  helpBtn.id = 'help-button';
  helpBtn.innerHTML = '?';
  helpBtn.setAttribute('aria-label', 'Ayuda contextual');
  helpBtn.setAttribute('title', 'Ayuda');

  const helpPanel = document.createElement('div');
  helpPanel.id = 'help-panel';

  const pageHelp = {
    'index.html': { title: 'Ayuda - Página de Inicio', content: 'Seleccione un módulo desde las tarjetas del portal o usando el menú de navegación superior.' },
    'dashboard.html': { title: 'Ayuda - Dashboard', content: 'Panel principal del sistema. Muestra un resumen general con el total de lecturas registradas, sensores activos, alertas vigentes y días con datos. La grilla de sensores despliega la última lectura de cada equipo y su estado. El gráfico de tendencias semanales permite detectar patrones. Use los botones de exportación para descargar reportes en PDF o Excel.' },
    'umbrales.html': { title: 'Ayuda - Gestión de Umbrales', content: 'Presione "+ Nuevo umbral" para agregar un límite de alerta. Use los botones Editar y Eliminar en la tabla para modificar umbrales existentes.' },
    'consulta-datos.html': { title: 'Ayuda - Consulta de Datos', content: 'Use los filtros de fecha, parámetro y ubicación para buscar datos históricos. Puede descargar los resultados en PDF o Excel.' },
    'reporte-fallas.html': { title: 'Ayuda - Reporte de Fallas', content: 'Seleccione el equipo/sensor dañado, ingrese un asunto y descripción del problema.' },
    'lecturas-manuales.html': { title: 'Ayuda - Lecturas Manuales', content: 'Seleccione el sensor, ingrese el valor numérico de la lectura, la unidad y la ubicación.' },
    'login.html': { title: 'Ayuda - Inicio de Sesión', content: 'Ingrese su correo electrónico y contraseña. Para esta demo use cualquier correo y seleccione su rol.' }
  };

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const helpInfo = pageHelp[currentPage] || pageHelp['index.html'];

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-close-help';
  closeBtn.setAttribute('aria-label', 'Cerrar ayuda');
  closeBtn.innerHTML = '&times;';
  helpPanel.appendChild(closeBtn);

  const title = document.createElement('h3');
  title.textContent = helpInfo.title;
  helpPanel.appendChild(title);

  const para = document.createElement('p');
  para.textContent = helpInfo.content;
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
  const btn = document.createElement('button');
  btn.id = 'shortcuts-button';
  btn.innerHTML = '&#x2328;';
  btn.setAttribute('aria-label', 'Atajos de teclado');
  btn.setAttribute('title', 'Mostrar atajos de teclado');

  const panel = document.createElement('div');
  panel.id = 'shortcuts-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Lista de atajos de teclado');

  const navPages = [
    { href: 'index.html', label: 'Inicio' },
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'umbrales.html', label: 'Umbrales' },
    { href: 'consulta-datos.html', label: 'Consulta de Datos' },
    { href: 'alertas.html', label: 'Alertas' },
    { href: 'reporte-fallas.html', label: 'Reporte de Fallas' },
    { href: 'lecturas-manuales.html', label: 'Lecturas Manuales' }
  ];

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-close-shortcuts';
  closeBtn.setAttribute('aria-label', 'Cerrar atajos');
  closeBtn.innerHTML = '&times;';
  panel.appendChild(closeBtn);

  const title = document.createElement('h3');
  title.textContent = 'Atajos de teclado';
  panel.appendChild(title);

  const para = document.createElement('p');
  para.textContent = 'Use estas combinaciones para navegar rápidamente entre secciones.';
  panel.appendChild(para);

  const table = document.createElement('table');
  table.className = 'shortcuts-table';
  table.innerHTML =
    '<thead><tr><th scope="col">Alt+</th><th scope="col">Ctrl+Shift+</th><th scope="col">Sección</th></tr></thead>' +
    '<tbody>' + navPages.map((p, i) =>
      '<tr><td>Alt+' + (i+1) + '</td><td>Ctrl+Shift+' + (i+1) + '</td><td>' + p.label + '</td></tr>'
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
}
