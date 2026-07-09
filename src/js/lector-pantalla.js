const SPEED_KEY = 'smai_reader_speed';

const READABLE_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'BUTTON', 'LABEL', 'TH', 'TD', 'FIGCAPTION', 'LEGEND'];
const HEADING_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

let state = {
  enabled: false,
  speaking: false,
  paused: false,
  currentIndex: -1,
  elements: [],
  utterance: null,
  highlightEl: null,
  hover: false,
  hoverTimeout: null
};

function getSpeed() {
  try { return parseFloat(localStorage.getItem(SPEED_KEY)) || 1; }
  catch(e) { return 1; }
}

function setSpeed(v) {
  localStorage.setItem(SPEED_KEY, v);
}

function getReadableElements() {
  const main = document.getElementById('main') || document.body;
  const all = main.querySelectorAll('*');
  const result = [];
  const seen = new Set();

  all.forEach(el => {
    if (el.offsetParent === null && !el.closest('[aria-live]')) return;
    if (el.closest('.skip-link') && el.style.display === 'none') return;
    if (READABLE_TAGS.includes(el.tagName) && el.textContent.trim()) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const text = el.textContent.trim();
      if (!text || text.length < 2) return;
      const key = text.slice(0, 40);
      if (seen.has(key)) return;
      seen.add(key);
      const role = getRole(el);
      result.push({ el, text, role });
    }
  });
  return result;
}

function getRole(el) {
  const tag = el.tagName;
  if (el.hasAttribute('aria-label')) return 'con etiqueta';
  if (HEADING_TAGS.includes(tag)) return `encabezado ${tag[1]}`;
  if (tag === 'P') return 'párrafo';
  if (tag === 'LI') return 'elemento de lista';
  if (tag === 'A') return 'enlace';
  if (tag === 'BUTTON') return 'botón';
  if (tag === 'LABEL') return 'etiqueta';
  if (tag === 'TH' || tag === 'TD') return 'celda de tabla';
  if (tag === 'FIGCAPTION') return 'descripción de imagen';
  if (tag === 'LEGEND') return 'leyenda';
  return 'contenido';
}

function getAltText(el) {
  const img = el.querySelector('img[alt]');
  if (img && img.alt) return 'Imagen: ' + img.alt;
  const figcaption = el.querySelector('figcaption');
  if (figcaption) return figcaption.textContent.trim();
  return '';
}

function buildElementText(el, role) {
  let txt = role ? `${role}: ` : '';
  const alt = getAltText(el);
  if (alt) {
    txt += alt;
  } else {
    txt += el.textContent.trim();
  }
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) txt = ariaLabel;
  return txt;
}

function highlight(el) {
  if (state.highlightEl) {
    state.highlightEl.style.outline = '';
    state.highlightEl.style.backgroundColor = '';
  }
  if (el) {
    el.style.outline = '3px solid #ff0';
    el.style.backgroundColor = 'rgba(255,255,0,0.15)';
    state.highlightEl = el;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function speakNow(text, callback) {
  if (!text || !state.enabled) return;
  if (!window.speechSynthesis) { console.warn('speechSynthesis no disponible'); return; }
  window.speechSynthesis.cancel();
  state.speaking = true;
  state.paused = false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  u.rate = getSpeed();
  u.volume = 1;
  u.onend = () => {
    state.speaking = false;
    if (callback) callback();
  };
  u.onerror = (e) => { state.speaking = false; console.warn('Speech error:', e.error); };
  state.utterance = u;
  window.speechSynthesis.speak(u);
}

function readElement(index) {
  if (index < 0 || index >= state.elements.length) return;
  state.currentIndex = index;
  const { el, text, role } = state.elements[index];
  highlight(el);
  const msg = buildElementText(el, role);
  updateStatus(msg);
  speakNow(msg);
}

function readNext() {
  if (state.currentIndex < state.elements.length - 1) {
    readElement(state.currentIndex + 1);
  } else {
    updateStatus('Fin de la página.');
  }
}

function readPrev() {
  if (state.currentIndex > 0) {
    readElement(state.currentIndex - 1);
  } else {
    updateStatus('Principio de la página.');
  }
}

function readPage() {
  state.elements = getReadableElements();
  if (!state.elements.length) {
    updateStatus('No hay contenido legible.');
    return;
  }
  readElement(0);
}

function readSelection() {
  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : '';
  if (!text) { updateStatus('No hay texto seleccionado.'); return; }
  speakNow(text);
}

function pauseReader() {
  if (!state.speaking || state.paused) return;
  window.speechSynthesis.pause();
  state.paused = true;
  updateBtn('reader-play', '▶');
}

function resumeReader() {
  if (!state.paused) return;
  window.speechSynthesis.resume();
  state.paused = false;
  updateBtn('reader-play', '⏸');
}

function stopReader() {
  window.speechSynthesis.cancel();
  state.speaking = false;
  state.paused = false;
  highlight(null);
  updateBtn('reader-play', '▶');
  updateStatus('');
}

function togglePlay() {
  if (!state.speaking) {
    if (state.currentIndex >= 0) {
      readElement(state.currentIndex);
    } else {
      readPage();
    }
  } else if (state.paused) {
    resumeReader();
  } else {
    pauseReader();
  }
}

function updateStatus(msg) {
  const el = document.getElementById('reader-status');
  if (el) el.textContent = msg;
}

function updateBtn(id, html) {
  const btn = document.getElementById(id);
  if (btn) btn.innerHTML = html;
}

function buildReaderUI() {
  const container = document.createElement('div');
  container.id = 'reader-bar';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Lector de pantalla');
  container.style.display = 'none';
  container.innerHTML = `
    <div id="reader-inner">
      <span id="reader-label">🔊 Lector</span>
      <button id="reader-prev" aria-label="Elemento anterior" title="Elemento anterior (Ctrl+Shift+Arriba)">⏮</button>
      <button id="reader-play" aria-label="Reproducir o pausar" title="Reproducir / Pausar (Ctrl+Shift+Espacio)">▶</button>
      <button id="reader-stop" aria-label="Detener" title="Detener (Ctrl+Shift+Escape)">⏹</button>
      <button id="reader-next" aria-label="Elemento siguiente" title="Elemento siguiente (Ctrl+Shift+Abajo)">⏭</button>
      <label class="reader-speed-label">
        Vel:
        <input type="range" id="reader-speed" min="0.3" max="2" step="0.1" value="${getSpeed()}" aria-label="Velocidad de lectura">
        <span id="reader-speed-val">${getSpeed().toFixed(1)}x</span>
      </label>
      <button id="reader-hover" aria-label="Leer al pasar el mouse" aria-pressed="false" title="Leer al pasar el mouse">🖱 Leer hover</button>
      <button id="reader-page" aria-label="Leer página completa">📄 Leer página</button>
      <button id="reader-selection" aria-label="Leer selección">📝 Leer selección</button>
      <span id="reader-status" aria-live="polite" role="status" class="sr-only"></span>
    </div>
  `;
  document.body.appendChild(container);
  return container;
}

function initReaderUIEvents() {
  document.getElementById('reader-play').addEventListener('click', togglePlay);
  document.getElementById('reader-stop').addEventListener('click', stopReader);
  document.getElementById('reader-next').addEventListener('click', () => {
    state.elements = getReadableElements();
    readNext();
  });
  document.getElementById('reader-prev').addEventListener('click', () => {
    state.elements = getReadableElements();
    readPrev();
  });
  document.getElementById('reader-hover').addEventListener('click', toggleHoverMode);
  document.getElementById('reader-page').addEventListener('click', readPage);
  document.getElementById('reader-selection').addEventListener('click', readSelection);

  const speedInput = document.getElementById('reader-speed');
  speedInput.addEventListener('input', () => {
    const v = parseFloat(speedInput.value);
    setSpeed(v);
    document.getElementById('reader-speed-val').textContent = v.toFixed(1) + 'x';
    if (state.speaking && !state.paused) {
      const idx = state.currentIndex;
      if (idx >= 0 && idx < state.elements.length) {
        const { el, text, role } = state.elements[idx];
        const msg = buildElementText(el, role);
        speakNow(msg);
      }
    }
  });
}

function setupReaderKeyboard() {
  document.addEventListener('keydown', e => {
    if (!state.enabled) return;
    if (e.ctrlKey && e.shiftKey) {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          e.preventDefault();
          stopReader();
          break;
        case 'ArrowUp':
          e.preventDefault();
          state.elements = getReadableElements();
          readPrev();
          break;
        case 'ArrowDown':
          e.preventDefault();
          state.elements = getReadableElements();
          readNext();
          break;
      }
    }
  });
}

function clickToRead(e) {
  if (!state.enabled) return;
  let el = e.target.closest(READABLE_TAGS.join(','));
  if (!el) {
    el = e.target.closest('[aria-label]');
  }
  if (!el) return;
  const idx = state.elements.findIndex(item => item.el === el);
  if (idx >= 0) {
    readElement(idx);
  } else {
    const role = getRole(el);
    const msg = buildElementText(el, role);
    highlight(el);
    updateStatus(msg);
    speakNow(msg);
  }
}

function hoverToRead(e) {
  if (!state.enabled || !state.hover) return;
  clearTimeout(state.hoverTimeout);
  state.hoverTimeout = setTimeout(() => {
    let el = e.target.closest(READABLE_TAGS.join(','));
    if (!el || !el.textContent.trim()) return;
    if (el.closest('#reader-bar') || el.closest('#accesibilidad-menu')) return;
    const idx = state.elements.findIndex(item => item.el === el);
    if (idx >= 0) {
      readElement(idx);
    } else {
      const role = getRole(el);
      const msg = buildElementText(el, role);
      highlight(el);
      updateStatus(msg);
      speakNow(msg);
    }
  }, 400);
}

export function toggleHoverMode() {
  state.hover = !state.hover;
  const btn = document.getElementById('reader-hover');
  if (btn) {
    btn.classList.toggle('active', state.hover);
    btn.setAttribute('aria-pressed', state.hover);
  }
  if (state.hover) {
    document.addEventListener('mouseover', hoverToRead);
  } else {
    document.removeEventListener('mouseover', hoverToRead);
    clearTimeout(state.hoverTimeout);
  }
}

export function enableReader() {
  if (state.enabled) return;
  state.enabled = true;

  let bar = document.getElementById('reader-bar');
  if (!bar) {
    bar = buildReaderUI();
    initReaderUIEvents();
    setupReaderKeyboard();
  }
  bar.style.display = 'block';

  state.elements = getReadableElements();

  document.addEventListener('click', clickToRead);
  if (state.hover) {
    document.addEventListener('mouseover', hoverToRead);
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.getVoices();

  const firstHeading = document.querySelector('h1, h2');
  const msg = firstHeading ? firstHeading.textContent.trim() : '';
  const text = msg ? 'Lector de pantalla activado. Página: ' + msg : 'Lector de pantalla activado.';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  u.rate = getSpeed();
  u.volume = 1;
  state.utterance = u;
  state.speaking = true;
  u.onend = () => { state.speaking = false; };
  u.onerror = (e) => { state.speaking = false; console.warn('Speech error:', e); };
  window.speechSynthesis.speak(u);
}

export function disableReader() {
  state.enabled = false;
  stopReader();
  const bar = document.getElementById('reader-bar');
  if (bar) bar.style.display = 'none';
  document.removeEventListener('click', clickToRead);
  document.removeEventListener('mouseover', hoverToRead);
  clearTimeout(state.hoverTimeout);
  if (state.highlightEl) {
    state.highlightEl.style.outline = '';
    state.highlightEl.style.backgroundColor = '';
    state.highlightEl = null;
  }
}

export function isReaderEnabled() {
  return state.enabled;
}

window.SMAI = window.SMAI || {};
SMAI.enableReader = enableReader;
SMAI.disableReader = disableReader;
SMAI.toggleHoverMode = toggleHoverMode;

export function initReader() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'login.html') return;
}
