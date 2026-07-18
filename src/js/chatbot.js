const t = (key, params = {}) => {
  const fn = window.SMAI?.t;
  return fn ? fn(key, params) : key;
};

function lang() { return window.SMAI?.getLang?.() || 'es'; }
function inWord() { return lang() === 'en' ? 'in' : 'en'; }

const INTENTS = {
  saludo: [
    /\b(hola|buenos\s*(d[ií]as|tardes|noches)|hey|saludos|qu[eé]\s*tal|buen\s*d[ií]a)\b/i,
    /\b(hi|hello|good\s*(morning|afternoon|evening)|hey|greetings|what'?s\s*up|howdy)\b/i
  ],
  temperatura: [
    /\btemperatura(s)?\b/i, /\b(temp|t[eé]rmico)\b/i, /\b(c[aá]l(ido|iente|or)?|fr[ií]o)\b/i,
    /\bst[- ]?001\b/i,
    /\b(temperature|thermal|hot|cold)\b/i
  ],
  humedad: [
    /\bhumedad(es)?\b/i, /\bh[uú]medo\b/i, /\bsh[- ]?002\b/i,
    /\b(humidity|humid|damp|moist)\b/i
  ],
  calidad_aire: [
    /\b(calidad\s*del?\s*aire|aire|aqi|contaminaci[oó]n|part[ií]culas)\b/i,
    /\bsa[- ]?003\b/i,
    /\b(air\s*quality|air|aqi|pollution|particles)\b/i
  ],
  ruido: [
    /\bruido(s)?\b/i, /\b(decibelios|db|sonido|ruidoso)\b/i, /\bsr[- ]?004\b/i,
    /\b(noise|noises|decibels|db|sound|loud)\b/i
  ],
  alertas: [
    /\balerta(s)?\b/i, /\balarma(s)?\b/i, /\bnotificaci[oó]n(es)?\b/i,
    /\bactiv[oa]\b.*\b(alerta|alarma)\b/i,
    /\b(alerts?|alarms?|notifications?)\b/i
  ],
  umbrales: [
    /\bumbral(es)?\b/i, /\bl[ií]mite(s)?\b/i, /\brango(s)?\b/i, /\bconfiguraci[oó]n\b/i,
    /\b(thresholds?|limits?|ranges?|configuration)\b/i
  ],
  promedio: [
    /\bpromedio\b/i, /\bmedia(s)?\b/i, /\bmedi[oó]\b/i, /\bprom\b/i, /\bvalor\s*medio\b/i,
    /\b(average|mean|median|avg)\b/i
  ],
  ultimas_lecturas: [
    /\b[uú]ltimas?\s*lecturas?\b/i, /\breciente(s)?\b/i, /\b[uú]ltimos?\s*datos?\b/i,
    /\bnuevas?\s*lecturas?\b/i,
    /\b(latest\s*readings?|recent|last\s*data|new\s*readings?)\b/i
  ],
  reportes: [
    /\breporte(s)?\b/i, /\bfalla(s)?\b/i, /\bpendiente(s)?\b/i,
    /\bproblema(s)?\b/i, /\bincidente(s)?\b/i,
    /\b(reports?|failures?|pending|problems?|incidents?)\b/i
  ],
  mantenimientos: [
    /\bmantenimiento(s)?\b/i, /\bmanto(s)?\b/i, /\brevisi[oó]n(es)?\b/i,
    /\bcalibraci[oó]n\b/i,
    /\b(maintenances?|upkeep|inspections?|calibration)\b/i
  ],
  sensores: [
    /\bsensor(es)?\b/i, /\bdispositivo(s)?\b/i, /\b(equipo|equipos)\b/i,
    /\bcu[aá]ntos?\s*sensores\b/i,
    /\b(sensors?|devices?|equipment)\b/i
  ],
  estado_general: [
    /\bresumen\b/i, /\bestado\s*general\b/i, /\bc[oó]mo\s*est[aá]\b/i,
    /\bpanorama\b/i, /\bsistema\b/i,
    /\b(overview|general\s*status|how'?s\s*everything|status|system)\b/i
  ],
  ayuda: [
    /\b(qu[eé]\s*puedes\s*hacer|ayuda|comandos|qu[eé]\s*haces|funciones)\b/i,
    /\bc[oó]mo\s*funciona\b/i,
    /\b(what\s*can\s*you\s*do|help|commands|what\s*do\s*you\s*do|functions|how\s*does\s*it\s*work)\b/i
  ],
  despedida: [
    /\bgracias\b/i, /\badi[oós]\b/i, /\bchao?\b/i, /\bhasta\s*luego\b/i,
    /\bbye\b/i, /\bnos\s*vemos\b/i,
    /\b(thanks|thank\s*you|bye|goodbye|see\s*you|farewell)\b/i
  ],
  login: [
    /\binicio\s*de\s*sesi[oó]n\b/i, /\biniciar\s*sesi[oó]n\b/i, /\bingresar\b/i,
    /\blog(in|earse)\b/i, /\bacceder\b/i, /\bautenticar(se)?\b/i,
    /\b(log\s*in|login|sign\s*in|enter|access|authenticate)\b/i
  ],
  logout: [
    /\bcerrar\s*sesi[oó]n\b/i, /\blogout\b/i, /\bsalir\b/i, /\bdesconectar(se)?\b/i,
    /\bcambio\s*de\s*usuario\b/i, /\bcambiar\s*usuario\b/i,
    /\b(log\s*out|logout|sign\s*out|exit|disconnect|switch\s*user|change\s*user)\b/i
  ]
};

const SENSOR_INFO = {
  'ST-001': { nameKey: 'sensor.temp', unidad: '°C', icono: '🌡️', param: 'temperatura' },
  'SH-002': { nameKey: 'sensor.hum', unidad: '%', icono: '💧', param: 'humedad' },
  'SA-003': { nameKey: 'sensor.aqi', unidad: 'AQI', icono: '🌬️', param: 'aqi' },
  'SR-004': { nameKey: 'sensor.ruido', unidad: 'dB', icono: '🔊', param: 'ruido' }
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
  return user ? user.role : null;
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
  const locale = lang() === 'en' ? 'en-US' : 'es-EC';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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
    let estado = t('dash.sensor.normal');
    if (ultima && umbral) {
      const val = parseFloat(ultima.valor);
      const min = parseFloat(umbral.minimo);
      const max = parseFloat(umbral.maximo);
      if (val < min || val > max) estado = t('dash.sensor.alert');
    }
    return { id, info, ultima, total, estado };
  });
}

function buildSensorStatusText(sensores) {
  return sensores.map(s => {
    const val = s.ultima ? `${s.ultima.valor}${s.info.unidad}` : t('dash.sensor.no_data');
    return `${s.info.icono} **${s.id}** (${t(s.info.nameKey)}): ${val} — ${s.estado}`;
  }).join('\n');
}

function responder(texto, rol) {
  const intent = detectIntent(texto);

  if (!intent) {
    const logueado = !!getUser();
    let base = t('chat.unknown');
    if (!logueado) {
      base += t('chat.unknown.login');
    }
    base += t('chat.unknown.help');
    return {
      texto: base,
      chips: logueado
        ? [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status')]
        : [t('nav.login'), t('chat.cmd.temp'), t('chat.help_title')]
    };
  }

  if (!isAllowed(intent, rol)) {
    const roleName = t('chat.role.' + rol) || rol;
    return {
      texto: t('chat.no_permission', {role: roleName}),
      chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.help_title')]
    };
  }

  switch (intent) {
    case 'saludo': {
      const roleName = t('chat.role.' + rol) || rol;
      const user = getUser();
      const nombre = user?.email?.split('@')[0] || (lang() === 'en' ? 'user' : 'usuario');
      let texto = t('chat.greeting', {name: nombre, role: roleName});
      if (rol !== 'tecnico') texto += t('chat.greeting.thresholds');
      if (rol !== 'consultor') texto += t('chat.greeting.reports');
      texto += t('chat.greeting.alerts');
      return {
        texto,
        chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status'), t('chat.help_title')]
      };
    }

    case 'temperatura': {
      const ultima = getUltimaLectura('ST-001');
      if (!ultima) return { texto: t('chat.no_readings', {param: t('sensor.temp')}), chips: [t('chat.cmd.hum'), t('chat.cmd.alerts')] };
      const prom = getPromedio('ST-001');
      return {
        texto: `🌡️ **${t('sensor.temp')}** — ST-001\n\n` +
          `${t('chat.last_reading')} **${ultima.valor}°C** ${inWord()} ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `${t('chat.avg_30')} **${prom}°C**`,
        chips: [t('chat.cmd.hum'), t('chat.cmd.aqi'), t('chat.cmd.ruido'), t('chat.cmd.alerts')]
      };
    }

    case 'humedad': {
      const ultima = getUltimaLectura('SH-002');
      if (!ultima) return { texto: t('chat.no_readings', {param: t('sensor.hum')}), chips: [t('chat.cmd.temp'), t('chat.cmd.alerts')] };
      const prom = getPromedio('SH-002');
      return {
        texto: `💧 **${t('sensor.hum')}** — SH-002\n\n` +
          `${t('chat.last_reading')} **${ultima.valor}%** ${inWord()} ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `${t('chat.avg_30')} **${prom}%**`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.aqi'), t('chat.cmd.ruido'), t('chat.cmd.alerts')]
      };
    }

    case 'calidad_aire': {
      const ultima = getUltimaLectura('SA-003');
      if (!ultima) return { texto: t('chat.no_readings', {param: t('sensor.aqi')}), chips: [t('chat.cmd.temp'), t('chat.cmd.hum')] };
      const prom = getPromedio('SA-003');
      return {
        texto: `🌬️ **${t('sensor.aqi')} (AQI)** — SA-003\n\n` +
          `${t('chat.last_reading')} **${ultima.valor} AQI** ${inWord()} ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `${t('chat.avg_30')} **${prom} AQI**`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.hum'), t('chat.cmd.ruido'), t('chat.cmd.alerts')]
      };
    }

    case 'ruido': {
      const ultima = getUltimaLectura('SR-004');
      if (!ultima) return { texto: t('chat.no_readings', {param: t('sensor.ruido')}), chips: [t('chat.cmd.temp'), t('chat.cmd.alerts')] };
      const prom = getPromedio('SR-004');
      return {
        texto: `🔊 **${t('sensor.ruido')}** — SR-004\n\n` +
          `${t('chat.last_reading')} **${ultima.valor} dB** ${inWord()} ${ultima.ubicacion} (${formatFecha(ultima.fecha)})\n` +
          `${t('chat.avg_30')} **${prom} dB**`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.hum'), t('chat.cmd.aqi'), t('chat.cmd.alerts')]
      };
    }

    case 'alertas': {
      const alertas = getAlertasRecientes(5);
      if (!alertas.length) {
        return { texto: t('chat.no_alerts'), chips: [t('chat.cmd.temp'), t('chat.cmd.status')] };
      }
      const lines = alertas.map((a, i) =>
        `${i + 1}. ⚠ **${a.parametro}** — ${a.valor} ${inWord()} ${a.ubicacion}\n   _${formatFecha(a.fecha)}_`
      ).join('\n\n');
      return {
        texto: `🚨 **${t('chat.recent_alerts')}** (${alertas.length}):\n\n${lines}`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.status'), t('chat.cmd.sensors')]
      };
    }

    case 'umbrales': {
      const umbrales = getFromLS('smai_umbrales');
      if (!umbrales.length) {
        return { texto: t('chat.no_thresholds'), chips: [t('chat.cmd.temp'), t('chat.cmd.alerts')] };
      }
      const lines = umbrales.map(u =>
        `• **${u.parametro}** ${inWord()} ${u.ubicacion}: ${u.minimo} — ${u.maximo}`
      ).join('\n');
      return {
        texto: `📏 **${t('chat.config_thresholds')}** (${umbrales.length}):\n\n${lines}`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status')]
      };
    }

    case 'promedio': {
      const proms = SENSOR_LIST.map(id => {
        const p = getPromedio(id);
        const info = SENSOR_INFO[id];
        return p ? `${info.icono} **${t(info.nameKey)}**: ${p}${info.unidad}` : null;
      }).filter(Boolean);
      if (!proms.length) return { texto: t('chat.no_avg'), chips: [t('chat.cmd.temp'), t('chat.cmd.alerts')] };
      return {
        texto: `📊 **${t('chat.avg_30_title')}**\n\n${proms.join('\n')}`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.hum'), t('chat.cmd.aqi'), t('chat.cmd.ruido')]
      };
    }

    case 'ultimas_lecturas': {
      const lecturas = getUltimasLecturas(5);
      if (!lecturas.length) return { texto: t('chat.no_data_readings'), chips: [t('chat.cmd.temp'), t('chat.cmd.alerts')] };
      const lines = lecturas.map((l, i) =>
        `${i + 1}. ${SENSOR_INFO[l.sensor]?.icono || '📡'} **${l.sensor}**: ${l.valor} — ${l.ubicacion} (${formatFecha(l.fecha)})`
      ).join('\n');
      return {
        texto: `📋 **${t('chat.last_5')}**\n\n${lines}`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.hum'), t('chat.cmd.aqi'), t('chat.cmd.ruido'), t('chat.cmd.avg')]
      };
    }

    case 'reportes': {
      const pendientes = getReportesPendientes();
      const total = getFromLS('smai_reportes');
      if (!total.length) return { texto: t('chat.no_reports'), chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.maint')] };
      let respuesta = `📋 **${t('chat.reports_title')}** (${total.length} total, ${pendientes.length} ${t('chat.reports_pending')})\n\n`;
      if (pendientes.length) {
        respuesta += `**${t('rpt.stat.pending')}:**\n` + pendientes.slice(0, 5).map((r, i) =>
          `${i + 1}. **${r.equipo}** — ${r.asunto} (${r.fecha})`
        ).join('\n');
      } else {
        respuesta += t('chat.no_pending');
      }
      return { texto: respuesta, chips: [t('chat.cmd.maint'), t('chat.cmd.temp'), t('chat.cmd.alerts')] };
    }

    case 'mantenimientos': {
      const mantos = getUltimosMantos(null, 5);
      if (!mantos.length) return { texto: t('chat.no_maint'), chips: [t('chat.cmd.reports'), t('chat.cmd.temp'), t('chat.cmd.alerts')] };
      const lines = mantos.map((m, i) =>
        `${i + 1}. **${m.equipo}** — ${m.accion} (${m.fecha})`
      ).join('\n');
      return {
        texto: `🔧 **${t('chat.last_maint')}**\n\n${lines}`,
        chips: [t('chat.cmd.reports'), t('chat.cmd.temp'), t('chat.cmd.sensors')]
      };
    }

    case 'sensores': {
      const estados = getEstadoSensores();
      const total = estados.length;
      const alertas = estados.filter(s => s.estado === t('dash.sensor.alert')).length;
      const lines = buildSensorStatusText(estados);
      return {
        texto: `📡 **${t('chat.sensors_title')}** (${total})\n⚠ ${t('chat.sensors_alerts')} ${alertas}\n\n${lines}`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.hum'), t('chat.cmd.aqi'), t('chat.cmd.ruido'), t('chat.cmd.status')]
      };
    }

    case 'estado_general': {
      const estados = getEstadoSensores();
      const alertasCount = getFromLS('smai_alertas').length;
      const reportesPend = getReportesPendientes().length;
      const lines = buildSensorStatusText(estados);
      const enAlerta = estados.filter(s => s.estado === t('dash.sensor.alert')).length;
      return {
        texto: `📊 **${t('chat.system_status')}**\n\n` +
          `**${t('chat.system_sensors')}** ${estados.length}, ${enAlerta} ${t('chat.sensors_alerts')}\n` +
          `**${t('chat.system_alerts')}** ${alertasCount}\n` +
          `**${t('chat.system_reports')}** ${reportesPend}\n\n` +
          `**${t('chat.system_readings')}**\n${lines}`,
        chips: [t('chat.cmd.alerts'), t('chat.cmd.temp'), t('chat.cmd.sensors'), t('chat.cmd.reports')]
      };
    }

    case 'ayuda': {
      return {
        texto: `🤖 **${t('chat.help_title')}:**\n\n` +
          `• _${t('chat.cmd.temp')}_ — ${t('chat.cmd.temp.desc')}\n` +
          `• _${t('chat.cmd.hum')}_ — ${t('chat.cmd.hum.desc')}\n` +
          `• _${t('chat.cmd.aqi')}_ — ${t('chat.cmd.aqi.desc')}\n` +
          `• _${t('chat.cmd.ruido')}_ — ${t('chat.cmd.ruido.desc')}\n` +
          `• _${t('chat.cmd.alerts')}_ — ${t('chat.cmd.alerts.desc')}\n` +
          (rol !== 'tecnico' ? `• _${t('chat.cmd.thresholds')}_ — ${t('chat.cmd.thresholds.desc')}\n` : '') +
          `• _${t('chat.cmd.avg')}_ — ${t('chat.cmd.avg.desc')}\n` +
          `• _${t('chat.cmd.recent')}_ — ${t('chat.cmd.recent.desc')}\n` +
          (rol !== 'consultor' ? `• _${t('chat.cmd.reports')}_ — ${t('chat.cmd.reports.desc')}\n` : '') +
          (rol !== 'consultor' ? `• _${t('chat.cmd.maint')}_ — ${t('chat.cmd.maint.desc')}\n` : '') +
          `• _${t('chat.cmd.sensors')}_ — ${t('chat.cmd.sensors.desc')}\n` +
          `• _${t('chat.cmd.status')}_ — ${t('chat.cmd.status.desc')}`,
        chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status'), t('chat.cmd.sensors')]
      };
    }

    case 'despedida': {
      return {
        texto: t('chat.goodbye'),
        chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status')]
      };
    }

    case 'login': {
      const logueado = !!getUser();
      if (logueado) {
        return {
          texto: t('chat.already_logged'),
          chips: [t('nav.logout'), t('chat.cmd.temp'), t('chat.cmd.alerts')]
        };
      }
      return {
        texto: t('chat.login_redirect'),
        accion: 'redirect',
        destino: '/src/pages/login.html',
        chips: [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.help_title')]
      };
    }

    case 'logout': {
      const logueado = !!getUser();
      if (!logueado) {
        return {
          texto: t('chat.not_logged'),
          chips: [t('nav.login'), t('chat.help_title')]
        };
      }
      return {
        texto: t('chat.logout_confirm'),
        accion: 'logout',
        chips: []
      };
    }

    default:
      return {
        texto: t('chat.unknown') + t('chat.unknown.help'),
        chips: [t('chat.help_title'), t('chat.cmd.temp'), t('chat.cmd.alerts')]
      };
  }
}

function buildChatHTML(rol) {
  const roleName = t('chat.role.' + rol) || rol;
  const bienvenida = rol === 'invitado'
    ? t('chat.welcome.guest')
    : t('chat.welcome.user');
  const chipsIniciales = rol === 'invitado'
    ? [t('nav.login'), t('chat.cmd.temp'), t('chat.help_title')]
    : [t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status'), t('chat.help_title')];
  return `
    <div id="chat-fab" role="button" tabindex="0" aria-label="${t('chat.label')}" data-tooltip="Chat SMAI" class="tooltip-top">
      <span aria-hidden="true">💬</span>
    </div>
    <div id="chat-panel" role="dialog" aria-modal="true" aria-label="${t('chat.title')} - Chat" hidden>
      <div id="chat-header">
        <div>
          <span class="chat-header-icon" aria-hidden="true">🤖</span>
          <span class="chat-header-title">${t('chat.title')}</span>
          <span class="chat-header-badge">${roleName}</span>
        </div>
        <button id="chat-close" aria-label="${t('chat.close')}">&times;</button>
      </div>
      <div id="chat-msgs" role="log" aria-live="polite" aria-relevant="additions">
        <div class="chat-msg chat-msg-bot">
          <div class="chat-msg-content">${bienvenida}</div>
        </div>
      </div>
      <div id="chat-chips" data-chips="${chipsIniciales.join(',')}"></div>
      <div id="chat-input-area">
        <label for="chatInput" class="sr-only">${t('chat.input_label')}</label>
        <input id="chatInput" type="text" placeholder="${t('chat.input_placeholder')}" autocomplete="off">
        <button id="chat-send" aria-label="${t('chat.send')}">
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

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addMessage(texto, tipo) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${tipo}`;
  const content = document.createElement('div');
  content.className = 'chat-msg-content';
  const safe = escapeHTML(texto);
  content.innerHTML = safe.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
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
  const askLabel = t('chat.chip_ask');
  chips.forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'chat-chip';
    btn.textContent = label;
    btn.setAttribute('aria-label', `${askLabel} ${label}`);
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
      setChips([t('chat.cmd.temp'), t('chat.cmd.alerts'), t('chat.cmd.status'), t('chat.help_title')]);
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

  document.addEventListener('click', e => {
    if (isOpen && !e.target.closest('#chat-container') && !e.target.closest('#chat-fab')) {
      closePanel();
    }
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
