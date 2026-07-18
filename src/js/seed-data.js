const SEED_FLAG = 'smai_seeded_v1';

function seedUmbrales() {
  return [
    { parametro: 'temperatura', ubicacion: 'torre-norte', minimo: '18', maximo: '28' },
    { parametro: 'humedad', ubicacion: 'rio-principal', minimo: '45', maximo: '80' },
    { parametro: 'aqi', ubicacion: 'centro-urbano', minimo: '10', maximo: '70' },
    { parametro: 'ruido', ubicacion: 'zona-industrial', minimo: '40', maximo: '70' }
  ];
}

function seedLecturas() {
  const sensores = [
    { id: 'ST-001', param: 'temperatura', unidad: '°C (Temperatura)', base: 22, variacion: 5, ubicaciones: ['Torre Norte', 'Sector A', 'Azotea Edificio'] },
    { id: 'SH-002', param: 'humedad', unidad: '% (Humedad)', base: 60, variacion: 15, ubicaciones: ['Río Principal', 'Estación Sur', 'Zona Humedal'] },
    { id: 'SA-003', param: 'aqi', unidad: 'AQI (Calidad del Aire)', base: 45, variacion: 20, ubicaciones: ['Centro Urbano', 'Avenida Principal', 'Parque Central'] },
    { id: 'SR-004', param: 'ruido', unidad: 'dB (Ruido)', base: 55, variacion: 15, ubicaciones: ['Zona Industrial', 'Calle Comercial', 'Cercanías Taller'] }
  ];
  const lecturas = [];
  const now = new Date();
  for (let d = 30; d >= 0; d--) {
    sensores.forEach(s => {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const fecha = new Date(now);
        fecha.setDate(fecha.getDate() - d);
        fecha.setHours(7 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
        let valor = s.base + (Math.random() - 0.5) * s.variacion * 2;
        valor = Math.round(valor * 10) / 10;
        const ubic = s.ubicaciones[Math.floor(Math.random() * s.ubicaciones.length)];
        lecturas.push({
          fecha: fecha.toISOString(),
          sensor: s.id,
          valor,
          unidad: s.unidad,
          ubicacion: ubic,
          notas: Math.random() > 0.7 ? 'Lectura de rutina' : ''
        });
      }
    });
  }
  return lecturas;
}

function seedReportes() {
  return [
    { fecha: '2026-06-10', equipo: 'ST-001', asunto: 'Sensor de temperatura no reporta', descripcion: 'Desde el día 08 de junio el sensor ST-001 dejó de enviar lecturas. Se revisó conexión eléctrica sin éxito.', estado: 'Solucionado' },
    { fecha: '2026-06-12', equipo: 'SR-004', asunto: 'Lectura errática de ruido', descripcion: 'El sensor SR-004 muestra valores que fluctúan entre 20 dB y 110 dB sin causa aparente. Posible interferencia.', estado: 'Solucionado' },
    { fecha: '2026-06-15', equipo: 'SA-003', asunto: 'Batería baja', descripcion: 'El nivel de batería del sensor SA-003 está por debajo del 15%. Requiere reemplazo programado.', estado: 'Pendiente' },
    { fecha: '2026-06-18', equipo: 'SH-002', asunto: 'Carcasa dañada por humedad', descripcion: 'La carcasa del sensor SH-002 presenta filtraciones de agua. Posible daño interno.', estado: 'Pendiente' },
    { fecha: '2026-06-20', equipo: 'ST-001', asunto: 'Calibración requerida', descripcion: 'El sensor ST-001 presenta una desviación de +2°C vs patrón de referencia. Se necesita calibración.', estado: 'Solucionado' },
    { fecha: '2026-06-22', equipo: 'SR-004', asunto: 'Cable de alimentación roto', descripcion: 'El cable de alimentación del sensor SR-004 fue cortado durante trabajos de mantenimiento en la zona.', estado: 'Pendiente' },
    { fecha: '2026-06-24', equipo: 'SA-003', asunto: 'Sensor obstruido por polvo', descripcion: 'La entrada de aire del sensor SA-003 está obstruida por acumulación de polvo. Lecturas de AQI inconsistentes.', estado: 'Solucionado' },
    { fecha: '2026-06-25', equipo: 'SH-002', asunto: 'Fallo en comunicación', descripcion: 'El sensor SH-002 pierde conectividad cada 4-6 horas. Se reinicia temporalmente pero el problema persiste.', estado: 'Pendiente' }
  ];
}

function seedMantos() {
  return [
    { fecha: '2026-06-01', equipo: 'ST-001', accion: 'Limpieza general y verificación de conexiones' },
    { fecha: '2026-06-08', equipo: 'SA-003', accion: 'Reemplazo de filtro de aire y calibración' },
    { fecha: '2026-06-15', equipo: 'SR-004', accion: 'Ajuste de sensibilidad y cambio de batería' },
    { fecha: '2026-06-22', equipo: 'SH-002', accion: 'Sellado de carcasa y verificación de hermeticidad' }
  ];
}

function seedAlertas(lecturas, umbrales) {
  const paramMap = { 'ST-001': 'temperatura', 'SH-002': 'humedad', 'SA-003': 'aqi', 'SR-004': 'ruido' };
  const paramNames = { temperatura: 'Temperatura (°C)', humedad: 'Humedad (%)', aqi: 'Calidad del Aire (AQI)', ruido: 'Ruido (dB)' };
  const alertas = [];
  lecturas.forEach(l => {
    const p = paramMap[l.sensor];
    if (!p) return;
    umbrales.forEach(u => {
      if (u.parametro === p) {
        const min = parseFloat(u.minimo);
        const max = parseFloat(u.maximo);
        if (l.valor < min || l.valor > max) {
          alertas.push({
            fecha: l.fecha,
            parametro: paramNames[p] || p,
            valor: l.valor + ' ' + l.unidad,
            ubicacion: l.ubicacion,
            umbral: min + ' - ' + max,
            mensaje: 'Valor fuera de rango: ' + l.valor + ' (límites: ' + min + ' - ' + max + ')'
          });
        }
      }
    });
  });
  return alertas;
}

export function seedDemoData() {
  const umbrales = seedUmbrales();
  const lecturas = seedLecturas();
  const reportes = seedReportes();
  const mantos = seedMantos();
  const alertas = seedAlertas(lecturas, umbrales);

  try {
    localStorage.setItem('smai_umbrales', JSON.stringify(umbrales));
    localStorage.setItem('smai_lecturas', JSON.stringify(lecturas));
    localStorage.setItem('smai_reportes', JSON.stringify(reportes));
    localStorage.setItem('smai_mantos', JSON.stringify(mantos));
    localStorage.setItem('smai_alertas', JSON.stringify(alertas));
    localStorage.setItem(SEED_FLAG, 'true');
  } catch(e) {
    console.warn('Error al guardar datos demo:', e);
  }

  return { umbrales: umbrales.length, lecturas: lecturas.length, reportes: reportes.length, mantos: mantos.length, alertas: alertas.length };
}

function t(key, params) {
  let str = window.SMAI?.t?.(key) || key;
  if (params) Object.entries(params).forEach(([k, v]) => { str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v); });
  return str;
}

const SEED_PARAM_MAP = {
  'Temperatura (°C)': 'sensor.temp',
  'Humedad (%)': 'sensor.hum',
  'Calidad del Aire (AQI)': 'sensor.aqi',
  'Ruido (dB)': 'sensor.ruido'
};

const SEED_LOCATION_MAP = {
  'Torre Norte': 'location.torre-norte',
  'Río Principal': 'location.rio-principal',
  'Centro Urbano': 'location.centro-urbano',
  'Zona Industrial': 'location.zona-industrial',
  'Sector A': 'seed.loc.sector_a',
  'Azotea Edificio': 'seed.loc.azotea',
  'Estación Sur': 'seed.loc.estacion_sur',
  'Zona Humedal': 'seed.loc.zona_humedal',
  'Avenida Principal': 'seed.loc.avenida',
  'Parque Central': 'seed.loc.parque',
  'Calle Comercial': 'seed.loc.calle',
  'Cercanías Taller': 'seed.loc.cercanias'
};

export function translateSeed(val) {
  if (!val) return val;
  if (SEED_PARAM_MAP[val]) return t(SEED_PARAM_MAP[val]);
  if (SEED_LOCATION_MAP[val]) return t(SEED_LOCATION_MAP[val]);
  return val;
}

export function simularAlerta() {
  const params = [
    { nombre: t('sensor.temp'), sensor: 'ST-001', valor: (Math.random() * 30 + 15).toFixed(1), unidad: '°C', ubicacion: t('location.torre-norte') },
    { nombre: t('sensor.hum'), sensor: 'SH-002', valor: (Math.random() * 60 + 30).toFixed(1), unidad: '%', ubicacion: t('location.rio-principal') },
    { nombre: t('sensor.aqi'), sensor: 'SA-003', valor: Math.floor(Math.random() * 150 + 20), unidad: 'AQI', ubicacion: t('location.centro-urbano') },
    { nombre: t('sensor.ruido'), sensor: 'SR-004', valor: (Math.random() * 60 + 30).toFixed(1), unidad: 'dB', ubicacion: t('location.zona-industrial') }
  ];
  const p = params[Math.floor(Math.random() * params.length)];
  const alerta = {
    fecha: new Date().toISOString(),
    parametro: p.nombre,
    valor: p.valor + ' ' + p.unidad,
    ubicacion: p.ubicacion,
    umbral: t('seed.configured_limits'),
    mensaje: '⚠ ' + t('seed.sim_alert') + ': ' + p.nombre + ' = ' + p.valor + ' en ' + p.ubicacion
  };
  const lista = JSON.parse(localStorage.getItem('smai_alertas')) || [];
  lista.push(alerta);
  localStorage.setItem('smai_alertas', JSON.stringify(lista));
  window.showNotification?.(alerta.mensaje, 'error');
  return alerta;
}

// Auto-seed on first load
if (!localStorage.getItem(SEED_FLAG)) {
  const res = seedDemoData();
  console.log('[Seed] Datos demo cargados:', res.lecturas + ' lecturas, ' + res.umbrales + ' umbrales, ' + res.reportes + ' reportes, ' + res.mantos + ' mantenimientos, ' + res.alertas + ' alertas');
}
