const INTENTS = {
  saludo: [
    /\b(hola|buenos\s*(d[ií]as|tardes|noches)|hey|saludos|qu[eé]\s*tal|buen\s*d[ií]a)\b/i
  ],
  temperatura: [
    /\btemperatura(s)?\b/i, /\b(temp|t[eé]rmico)\b/i, /\b(c[aá]l(ido|iente|or)?|fr[ií]o)\b/i,
    /\bst[- ]?001\b/i
  ],
  humedad: [
    /\bhumedad(es)?\b/i, /\bh[uú]medo\b/i, /\bsh[- ]?002\b/i
  ],
  calidad_aire: [
    /\b(calidad\s*del?\s*aire|aire|aqi|contaminaci[oó]n|part[ií]culas)\b/i,
    /\bsa[- ]?003\b/i
  ],
  ruido: [
    /\bruido(s)?\b/i, /\b(decibelios|db|sonido|ruidoso)\b/i, /\bsr[- ]?004\b/i
  ],
  alertas: [
    /\balerta(s)?\b/i, /\balarma(s)?\b/i, /\bnotificaci[oó]n(es)?\b/i,
    /\bactiv[oa]\b.*\b(alerta|alarma)\b/i
  ],
  umbrales: [
    /\bumbral(es)?\b/i, /\bl[ií]mite(s)?\b/i, /\brango(s)?\b/i, /\bconfiguraci[oó]n\b/i
  ],
  promedio: [
    /\bpromedio\b/i, /\bmedia(s)?\b/i, /\bmedi[oó]\b/i, /\bprom\b/i, /\bvalor\s*medio\b/i
  ],
  ultimas_lecturas: [
    /\b[uú]ltimas?\s*lecturas?\b/i, /\breciente(s)?\b/i, /\b[uú]ltimos?\s*datos?\b/i,
    /\bnuevas?\s*lecturas?\b/i
  ],
  reportes: [
    /\breporte(s)?\b/i, /\bfalla(s)?\b/i, /\bpendiente(s)?\b/i,
    /\bproblema(s)?\b/i, /\bincidente(s)?\b/i
  ],
  mantenimientos: [
    /\bmantenimiento(s)?\b/i, /\bmanto(s)?\b/i, /\brevisi[oó]n(es)?\b/i,
    /\bcalibraci[oó]n\b/i
  ],
  sensores: [
    /\bsensor(es)?\b/i, /\bdispositivo(s)?\b/i, /\b(equipo|equipos)\b/i,
    /\bcu[aá]ntos?\s*sensores\b/i
  ],
  estado_general: [
    /\bresumen\b/i, /\bestado\s*general\b/i, /\bc[oó]mo\s*est[aá]\b/i,
    /\bpanorama\b/i, /\bsistema\b/i
  ],
  ayuda: [
    /\b(qu[eé]\s*puedes\s*hacer|ayuda|comandos|qu[eé]\s*haces|funciones)\b/i,
    /\bc[oó]mo\s*funciona\b/i
  ],
  despedida: [
    /\bgracias\b/i, /\badi[oós]\b/i, /\bchao?\b/i, /\bhasta\s*luego\b/i,
    /\bbye\b/i, /\bnos\s*vemos\b/i
  ],
  login: [
    /\binicio\s*de\s*sesi[oó]n\b/i, /\biniciar\s*sesi[oó]n\b/i, /\bingresar\b/i,
    /\blog(in|earse)\b/i, /\bacceder\b/i, /\bautenticar(se)?\b/i
  ],
  logout: [
    /\bcerrar\s*sesi[oó]n\b/i, /\blogout\b/i, /\bsalir\b/i, /\bdesconectar(se)?\b/i,
    /\bcambio\s*de\s*usuario\b/i, /\bcambiar\s*usuario\b/i
  ]
};

const SENSOR_INFO = {
  'ST-001': { nombre: 'Temperatura', unidad: '°C', icono: '🌡️', param: 'temperatura' },
  'SH-002': { nombre: 'Humedad', unidad: '%', icono: '💧', param: 'humedad' },
  'SA-003': { nombre: 'Calidad del Aire', unidad: 'AQI', icono: '🌬️', param: 'aqi' },
  'SR-004': { nombre: 'Ruido', unidad: 'dB', icono: '🔊', param: 'ruido' }
};

const SENSOR_LIST = ['ST-001', 'SH-002', 'SA-003', 'SR-004'];

const RESTRICTED = {
  admin: [],
  consultor: ['reportes', 'mantenimientos'],
  tecnico: ['umbrales']
};

function getFromLS(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch(e) { return fallback; }
}

function getUser() {
  try {
    const raw = localStorage.getItem('smai_user');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function getRole() {
  const user = getUser();
  return user ? user.role : 'admin';
}

function detectIntent(texto) {
  for (const [intent, patterns] of Object.entries(INTENTS)) {
    for (const regex of patterns) {
      if (regex.test(texto)) return intent;
    }
  }
  return null;
}

function isAllowed(intent, rol) {
  const blocked = RESTRICTED[rol] || [];
  return !blocked.includes(intent);
}

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getUltimaLectura(sensorId) {
  const lecturas = getFromLS('smai_lecturas');
  const filtradas = lecturas.filter(l => l.sensor === sensorId);
  if (!filtradas.length) return null;
  return filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
}

function getPromedio(sensorId) {
  const lecturas = getFromLS('smai_lecturas');
  const filtradas = lecturas.filter(l => l.sensor === sensorId);
  if (!filtradas.length) return null;
  const sum = filtradas.reduce((acc, l) => acc + parseFloat(l.valor), 0);
  return (sum / filtradas.length).toFixed(1);
}

function getUltimasLecturas(limit = 5) {
  const lecturas = getFromLS('smai_lecturas');
  return lecturas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limit);
}

function getAlertasRecientes(limit = 5) {
  const alertas = getFromLS('smai_alertas');
  return alertas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limit);
}

function getReportesPendientes() {
  const reportes = getFromLS('smai_reportes');
  return reportes.filter(r => r.estado === 'Pendiente');
}

function getUltimosMantos(equipo = null, limit = 5) {
  const mantos = getFromLS('smai_mantos');
  let filtrados = mantos;
  if (equipo) filtrados = mantos.filter(m => m.equipo === equipo);
  return filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limit);
}

function getEstadoSensores() {
  const lecturas = getFromLS('smai_lecturas');
  const umbrales = getFromLS('smai_umbrales');
  return SENSOR_LIST.map(id => {
    const info = SENSOR_INFO[id];
    const ultima = getUltimaLectura(id);
    const total = lecturas.filter(l => l.sensor === id).length;
    const umbral = umbrales.find(u => u.parametro === info.param);
    let estado = 'Normal';
    if (ultima && umbral) {
      const val = parseFloat(ultima.valor);
      const min = parseFloat(umbral.minimo);
      const max = parseFloat(umbral.maximo);
      if (val < min || val > max) estado = 'Alerta';
    }
    return { id, info, ultima, total, estado };
  });
}

function buildSensorStatusText(sensores) {
  return sensores.map(s => {
    const val = s.ultima ? `${s.ultima.valor}${s.info.unidad}` : 'Sin datos';
    return `${s.info.icono} **${s.id}** (${s.info.nombre}): ${val} — ${s.estado}`;
  }).join('\n');
}

function responder(texto, rol) {
  const intent = detectIntent(texto);

  if (!intent) {
    const logueado = !!getUser();
    let base = 'No entendí tu consulta. Puedes preguntarme sobre:\n\n' +
      '• Temperatura, humedad, calidad del aire o ruido\n' +
      '• Últimas lecturas o promedios\n' +
      '• Alertas activas\n' +
      '• Sensores disponibles\n' +
      '• Estado general del sistema\n';
    if (!logueado) {
      base += '\n• **Iniciar sesión** — acceder al sistema';
    }
    base += '\n\nEscribe **"¿Qué puedes hacer?"** para más ayuda.';
    return {
      texto: base,
      chips: logueado ? ['Temperatura', 'Alertas', 'Estado general'] : ['Iniciar sesión', 'Temperatura', 'Ayuda']
    };
  }

  if (!isAllowed(intent, rol)) {
    const roleName = { admin: 'Administrador', consultor: 'Consultor', tecnico: 'Técnico' }[rol] || rol;
    return {
      texto: `⛔ Como **${roleName}**, no tienes acceso a esta información.`,
      chips: ['Temperatura', 'Alertas', 'Ayuda']
    };
  }

  switch (intent) {
    case 'saludo': {
      const roleName = { admin: 'Administrador', consultor: 'Consultor', tecnico: 'Técnico' }[rol] || rol;
      const user = getUser();
      const nombre = user?.email?.split('@')[0] || 'usuario';
      return {
        texto: `¡Hola **${nombre}**! 👋 Soy el asistente SMAI. Estás autenticado como **${roleName}**.\n\n` +
          'Puedes consultarme sobre:\n' +
          '• **Lecturas** — temperatura, humedad, AQI, ruido\n' +
          (rol !== 'tecnico' ? '• **Umbrales** — límites configurados\n' : '') +
          (rol !== 'consultor' ? '• **Reportes** y **mantenimientos**\n' : '') +
          '• **Alertas** activas\n' +
          '• **Promedios** y últimas lecturas\n\n' +
          '¿En qué puedo ayudarte?',
        chips: ['Temperatura', 'Alertas', 'Estado general', 'Ayuda']
      };
    }

    case 'temperatura': {
      const ultima = getUltimaLectura('ST-001');
      if (!ultima) return { texto: 'No hay lecturas de temperatura registradas.', chips: ['Humedad', 'Alertas'] };
      const prom = getPromedio('ST-001');
      return {
        texto: `🌡️ **Temperatura** — Sensor ST-001\n\n` +
          `Última lectura: **${ultima.valor}°C** en ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `Promedio 30 días: **${prom}°C**`,
        chips: ['Humedad', 'Calidad del aire', 'Ruido', 'Alertas']
      };
    }

    case 'humedad': {
      const ultima = getUltimaLectura('SH-002');
      if (!ultima) return { texto: 'No hay lecturas de humedad registradas.', chips: ['Temperatura', 'Alertas'] };
      const prom = getPromedio('SH-002');
      return {
        texto: `💧 **Humedad** — Sensor SH-002\n\n` +
          `Última lectura: **${ultima.valor}%** en ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `Promedio 30 días: **${prom}%**`,
        chips: ['Temperatura', 'Calidad del aire', 'Ruido', 'Alertas']
      };
    }

    case 'calidad_aire': {
      const ultima = getUltimaLectura('SA-003');
      if (!ultima) return { texto: 'No hay lecturas de calidad del aire registradas.', chips: ['Temperatura', 'Humedad'] };
      const prom = getPromedio('SA-003');
      return {
        texto: `🌬️ **Calidad del Aire (AQI)** — Sensor SA-003\n\n` +
          `Última lectura: **${ultima.valor} AQI** en ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `Promedio 30 días: **${prom} AQI**`,
        chips: ['Temperatura', 'Humedad', 'Ruido', 'Alertas']
      };
    }

    case 'ruido': {
      const ultima = getUltimaLectura('SR-004');
      if (!ultima) return { texto: 'No hay lecturas de ruido registradas.', chips: ['Temperatura', 'Alertas'] };
      const prom = getPromedio('SR-004');
      return {
        texto: `🔊 **Ruido** — Sensor SR-004\n\n` +
          `Última lectura: **${ultima.valor} dB** en ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `Promedio 30 días: **${prom} dB**`,
        chips: ['Temperatura', 'Humedad', 'Calidad del aire', 'Alertas']
      };
    }

    case 'alertas': {
      const alertas = getAlertasRecientes(5);
      if (!alertas.length) {
        return { texto: '✅ No hay alertas registradas recientemente.', chips: ['Temperatura', 'Estado general'] };
      }
      const lines = alertas.map((a, i) =>
        `${i + 1}. ⚠ **${a.parametro}** — ${a.valor} en ${a.ubicacion}\n   _${formatFecha(a.fecha)}_`
      ).join('\n\n');
      return {
        texto: `🚨 **Últimas alertas** (${alertas.length}):\n\n${lines}`,
        chips: ['Temperatura', 'Estado general', 'Sensores']
      };
    }

    case 'umbrales': {
      const umbrales = getFromLS('smai_umbrales');
      if (!umbrales.length) {
        return { texto: 'No hay umbrales configurados.', chips: ['Temperatura', 'Alertas'] };
      }
      const lines = umbrales.map(u =>
        `• **${u.parametro}** en ${u.ubicacion}: ${u.minimo} — ${u.maximo}`
      ).join('\n');
      return {
        texto: `📏 **Umbrales configurados** (${umbrales.length}):\n\n${lines}`,
        chips: ['Temperatura', 'Alertas', 'Estado general']
      };
    }

    case 'promedio': {
      const proms = SENSOR_LIST.map(id => {
        const p = getPromedio(id);
        const info = SENSOR_INFO[id];
        return p ? `${info.icono} **${info.nombre}**: ${p}${info.unidad}` : null;
      }).filter(Boolean);
      if (!proms.length) return { texto: 'No hay datos suficientes para calcular promedios.', chips: ['Temperatura', 'Alertas'] };
      return {
        texto: `📊 **Promedios 30 días:**\n\n${proms.join('\n')}`,
        chips: ['Temperatura', 'Humedad', 'Calidad del aire', 'Ruido']
      };
    }

    case 'ultimas_lecturas': {
      const lecturas = getUltimasLecturas(5);
      if (!lecturas.length) return { texto: 'No hay lecturas registradas.', chips: ['Temperatura', 'Alertas'] };
      const lines = lecturas.map((l, i) =>
        `${i + 1}. ${SENSOR_INFO[l.sensor]?.icono || '📡'} **${l.sensor}**: ${l.valor} — ${l.ubicacion} (${formatFecha(l.fecha)})`
      ).join('\n');
      return {
        texto: `📋 **Últimas 5 lecturas:**\n\n${lines}`,
        chips: ['Temperatura', 'Humedad', 'Calidad del aire', 'Ruido', 'Promedio']
      };
    }

    case 'reportes': {
      const pendientes = getReportesPendientes();
      const total = getFromLS('smai_reportes');
      if (!total.length) return { texto: 'No hay reportes de falla registrados.', chips: ['Temperatura', 'Alertas', 'Mantenimientos'] };
      let respuesta = `📋 **Reportes de falla** (${total.length} total, ${pendientes.length} pendientes)\n\n`;
      if (pendientes.length) {
        respuesta += '**Pendientes:**\n' + pendientes.slice(0, 5).map((r, i) =>
          `${i + 1}. **${r.equipo}** — ${r.asunto} (${r.fecha})`
        ).join('\n');
      } else {
        respuesta += '✅ No hay reportes pendientes.';
      }
      return { texto: respuesta, chips: ['Mantenimientos', 'Temperatura', 'Alertas'] };
    }

    case 'mantenimientos': {
      const mantos = getUltimosMantos(null, 5);
      if (!mantos.length) return { texto: 'No hay mantenimientos registrados.', chips: ['Reportes', 'Temperatura', 'Alertas'] };
      const lines = mantos.map((m, i) =>
        `${i + 1}. **${m.equipo}** — ${m.accion} (${m.fecha})`
      ).join('\n');
      return {
        texto: `🔧 **Últimos mantenimientos:**\n\n${lines}`,
        chips: ['Reportes', 'Temperatura', 'Sensores']
      };
    }

    case 'sensores': {
      const estados = getEstadoSensores();
      const total = estados.length;
      const alertas = estados.filter(s => s.estado === 'Alerta').length;
      const lines = buildSensorStatusText(estados);
      return {
        texto: `📡 **Sensores del sistema** (${total})\n⚠ Alertas: ${alertas}\n\n${lines}`,
        chips: ['Temperatura', 'Humedad', 'Calidad del aire', 'Ruido', 'Estado general']
      };
    }

    case 'estado_general': {
      const estados = getEstadoSensores();
      const alertasCount = getFromLS('smai_alertas').length;
      const reportesPend = getReportesPendientes().length;
      const lines = buildSensorStatusText(estados);
      const enAlerta = estados.filter(s => s.estado === 'Alerta').length;
      return {
        texto: `📊 **Estado General del Sistema**\n\n` +
          `**Sensores:** ${estados.length} total, ${enAlerta} en alerta\n` +
          `**Alertas registradas:** ${alertasCount}\n` +
          `**Reportes pendientes:** ${reportesPend}\n\n` +
          `**Lecturas por sensor:**\n${lines}`,
        chips: ['Alertas', 'Temperatura', 'Sensores', 'Reportes']
      };
    }

    case 'ayuda': {
      return {
        texto: '🤖 **Comandos disponibles:**\n\n' +
          '• _Temperatura_ — última lectura y promedio\n' +
          '• _Humedad_ — última lectura y promedio\n' +
          '• _Calidad del aire_ — última lectura y promedio\n' +
          '• _Ruido_ — última lectura y promedio\n' +
          '• _Alertas_ — últimas alertas activas\n' +
          (rol !== 'tecnico' ? '• _Umbrales_ — límites configurados\n' : '') +
          '• _Promedio_ — promedios de todos los sensores\n' +
          '• _Últimas lecturas_ — las 5 más recientes\n' +
          (rol !== 'consultor' ? '• _Reportes_ — fallas pendientes\n' : '') +
          (rol !== 'consultor' ? '• _Mantenimientos_ — últimos registros\n' : '') +
          '• _Sensores_ — estado de cada dispositivo\n' +
          '• _Estado general_ — resumen completo del sistema',
        chips: ['Temperatura', 'Alertas', 'Estado general', 'Sensores']
      };
    }

    case 'despedida': {
      return {
        texto: '¡De nada! 😊 Estoy aquí para ayudarte con el monitoreo ambiental. Vuelve cuando necesites consultar algo.',
        chips: ['Temperatura', 'Alertas', 'Estado general']
      };
    }

    case 'login': {
      const logueado = !!getUser();
      if (logueado) {
        return {
          texto: 'Ya has iniciado sesión. Si quieres cambiar de usuario, escribe **"Cerrar sesión"**.',
          chips: ['Cerrar sesión', 'Temperatura', 'Alertas']
        };
      }
      return {
        texto: '🔐 Para iniciar sesión, dirígete a la página de **Inicio de Sesión** o haz clic en el botón de abajo.',
        accion: 'redirect',
        destino: '/src/pages/login.html',
        chips: ['Temperatura', 'Alertas', 'Ayuda']
      };
    }

    case 'logout': {
      const logueado = !!getUser();
      if (!logueado) {
        return {
          texto: 'No has iniciado sesión. Escribe **"Iniciar sesión"** para acceder al sistema.',
          chips: ['Iniciar sesión', 'Ayuda']
        };
      }
      return {
        texto: '¿Estás seguro de que quieres cerrar sesión?',
        accion: 'logout',
        chips: []
      };
    }

    default:
      return {
        texto: 'No entendí tu consulta. Escribe **"¿Qué puedes hacer?"** para ver los comandos disponibles.',
        chips: ['Ayuda', 'Temperatura', 'Alertas']
      };
  }
}

function buildChatHTML(rol) {
  const roleName = { admin: 'Administrador', consultor: 'Consultor', tecnico: 'Técnico', invitado: 'Invitado' }[rol] || rol;
  const bienvenida = rol === 'invitado'
    ? '👋 ¡Bienvenido a SMAI! Soy el asistente virtual.\n\nPara usar el sistema, primero debes **iniciar sesión**.\n\n¿En qué puedo ayudarte?'
    : '👋 ¡Hola! Soy el asistente virtual de SMAI. Puedes preguntarme sobre lecturas, alertas, sensores y más.';
  const chipsIniciales = rol === 'invitado' ? ['Iniciar sesión', 'Temperatura', 'Ayuda'] : ['Temperatura', 'Alertas', 'Estado general', 'Ayuda'];
  return `
    <div id="chat-fab" role="button" tabindex="0" aria-label="Abrir chat con asistente SMAI" data-tooltip="Chat SMAI" class="tooltip-top">
      <span aria-hidden="true">💬</span>
    </div>
    <div id="chat-panel" role="dialog" aria-modal="true" aria-label="Asistente SMAI - Chat" hidden>
      <div id="chat-header">
        <div>
          <span class="chat-header-icon" aria-hidden="true">🤖</span>
          <span class="chat-header-title">Asistente SMAI</span>
          <span class="chat-header-badge">${roleName}</span>
        </div>
        <button id="chat-close" aria-label="Cerrar chat">&times;</button>
      </div>
      <div id="chat-msgs" role="log" aria-live="polite" aria-relevant="additions">
        <div class="chat-msg chat-msg-bot">
          <div class="chat-msg-content">${bienvenida}</div>
        </div>
      </div>
      <div id="chat-chips" data-chips="${chipsIniciales.join(',')}"></div>
      <div id="chat-input-area">
        <label for="chatInput" class="sr-only">Escribe tu mensaje</label>
        <input id="chatInput" type="text" placeholder="Escribe tu mensaje..." autocomplete="off">
        <button id="chat-send" aria-label="Enviar mensaje">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;
}

function scrollToBottom() {
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function addMessage(texto, tipo) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${tipo}`;
  const content = document.createElement('div');
  content.className = 'chat-msg-content';
  content.innerHTML = texto.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  div.appendChild(content);
  msgs.appendChild(div);
  scrollToBottom();
}

function showTyping() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-bot chat-typing';
  div.id = 'chat-typing-indicator';
  div.innerHTML = '<div class="chat-msg-content"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
  msgs.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('chat-typing-indicator');
  if (el) el.remove();
}

function setChips(chips) {
  const container = document.getElementById('chat-chips');
  if (!container) return;
  container.innerHTML = '';
  chips.forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'chat-chip';
    btn.textContent = label;
    btn.setAttribute('aria-label', `Preguntar sobre ${label}`);
    btn.addEventListener('click', () => {
      document.getElementById('chatInput').value = label;
      handleSend();
    });
    container.appendChild(btn);
  });
}

function handleSend() {
  const input = document.getElementById('chatInput');
  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';
  addMessage(texto, 'user');
  setChips([]);
  const rol = getRole();
  const delay = 300 + Math.random() * 500;
  showTyping();
  setTimeout(() => {
    hideTyping();
    const resp = responder(texto, rol);
    addMessage(resp.texto, 'bot');
    setChips(resp.chips || []);
    if (resp.accion === 'redirect' && resp.destino) {
      setTimeout(() => { window.location.href = resp.destino; }, 1500);
    }
    if (resp.accion === 'logout') {
      setTimeout(() => {
        localStorage.removeItem('smai_logged_in');
        localStorage.removeItem('smai_user');
        window.location.href = '/index.html';
      }, 1500);
    }
  }, delay);
}

function initChat() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'login.html') return;
  if (document.getElementById('chat-fab')) return;

  const user = getUser();
  const sinSesion = !user;

  if (sinSesion && page !== 'index.html') return;

  const rol = user ? (user.role || 'admin') : 'invitado';

  const container = document.createElement('div');
  container.id = 'chat-container';
  container.innerHTML = buildChatHTML(rol);
  document.body.appendChild(container);

  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chatInput');

  let isOpen = false;

  function openPanel() {
    isOpen = true;
    panel.hidden = false;
    fab.style.display = 'none';
    setTimeout(() => {
      input.focus();
      scrollToBottom();
    }, 100);
    const chipsData = document.getElementById('chat-chips')?.getAttribute('data-chips');
    if (chipsData) {
      setChips(chipsData.split(','));
    } else {
      setChips(['Temperatura', 'Alertas', 'Estado general', 'Ayuda']);
    }
  }

  function closePanel() {
    isOpen = false;
    panel.hidden = true;
    fab.style.display = '';
    fab.focus();
  }

  fab.addEventListener('click', openPanel);
  fab.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
  });

  closeBtn.addEventListener('click', closePanel);

  sendBtn.addEventListener('click', handleSend);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  panel.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const focusable = panel.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', initChat);
