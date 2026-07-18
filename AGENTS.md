# SMAI - Sistema de Monitoreo Ambiental Inteligente

## Contexto del Proyecto
- **Materia:** Usabilidad / Accesibilidad Web (WCAG 2.2 Nivel A+AA)
- **Equipo:** Cevallos Conforme David (Líder/Backend) + Cobeña Naranjo Alan (Frontend/UX)
- **Evaluación:** Semana 11 (15-19 Jun 2026) — 1ª prueba con pensamiento en voz alta
- **Stack:** Vite + Tailwind CSS 3 + Alpine.js 3, HTML5 multi-page, sin backend
- **CDNs:** Chart.js 4, jsPDF 2.5 + autotable 3.8, SheetJS 0.18
- **Persistencia:** localStorage (datos) + sessionStorage (auto-fill filtros)
- **Repositorio:** `/home/david/Escritorio/Codigos/Usabilidad/`
- **Docs diseño:** `/home/david/Documentos/Usabilidad/` (11 archivos .docx)

## Roles
- `admin` — acceso total
- `consultor` — solo lectura (dashboard, consulta, alertas)
- `tecnico` — lecturas, reporte fallas, mantenimientos

## Estructura
| Archivo | Propósito |
|---|---|
| `index.html` | Portal principal (raíz del proyecto, entrada Vite) |
| `src/pages/login.html` | Login con selector de rol (Tailwind + Alpine) |
| `src/pages/dashboard.html` | Métricas, sensor grid, chart semanal, alertas recientes, export PDF/Excel |
| `src/pages/umbrales.html` | CRUD umbrales + IA "Sugerir valores" + resumen |
| `src/pages/consulta-datos.html` | Filtros + tabla dinámica + comparativa zonas + IA análisis + export |
| `src/pages/alertas.html` | Historial de alertas + simular alerta + resumen stats |
| `src/pages/reporte-fallas.html` | CRUD reportes + estado + mantenimientos + resumen |
| `src/pages/lecturas-manuales.html` | Registro lecturas + validación IA + lecturas recientes |
| `src/pages/sitemap.html` | Mapa del sitio |
| `src/js/main.js` | Entry point ES module — importa Alpine y módulos compartidos |
| `src/js/utils.js` | Utilidades: `showNotification`, `confirmAction`, `initTooltips`, `getFromLS`, `saveToLS` |
| `src/js/auth.js` | Login, roles, nav dinámico, `protectPage()`, session timeout |
| `src/js/seed-data.js` | Genera datos demo al primer inicio + `simularAlerta()` |
| `src/js/accesibilidad.js` | Menú accesibilidad (♿), atajos teclado, tooltips, export PDF/Excel, panel ayuda (?), lista atajos (⌨) |
| `src/js/chatbot.js` | Chatbot conversacional por rol con patrones regex |
| `src/js/i18n.js` | Internacionalización ES/EN con `data-i18n` |
| `src/js/lector-pantalla.js` | Lector de pantalla integrado |
| `src/css/style.css` | Tailwind directives + WCAG custom CSS (tooltips, modos contraste/monocromo, accesibilidad) |
| `assets/img/` | Imágenes estáticas (logo, diagramas, red sensores) |
| `assets/video/` | Video tutorial SMAI |
| `assets/captions/` | Archivos VTT (subtítulos y audiodescripción) |
| `public/assets/captions/` | Copia de VTT para inclusión en build de producción |
| `vite.config.js` | Multi-page build con 9 entradas HTML |
| `tailwind.config.js` | Colores extendidos, content paths |
| `postcss.config.js` | PostCSS con Tailwind + autoprefixer |

## Rutas (root-relative)
- Enlaces entre páginas: `/index.html`, `/src/pages/dashboard.html`, etc.
- Nav dinámico (`auth.js`): hrefs root-relative con `/index.html`, `/src/pages/*.html`

## Datos (localStorage)
- `smai_lecturas` — array `[{fecha, sensor, valor, unidad, ubicacion, notas}]`
- `smai_umbrales` — array `[{parametro, ubicacion, minimo, maximo}]`
- `smai_reportes` — array `[{fecha, equipo, asunto, descripcion, estado}]`
- `smai_mantos` — array `[{fecha, equipo, accion}]`
- `smai_alertas` — array `[{fecha, parametro, valor, ubicacion, umbral, mensaje}]`
- `accesibilidad_prefs` — preferencias de accesibilidad
- `smai_seeded_v1` — flag para evitar doble seed
- `smai_logged_in` / `smai_user` — sesión activa
- `smai_lang` — idioma seleccionado (es/en)

## Revisión y Corrección de Bugs (18-Jul-2026)

Se realizó una revisión completa del proyecto verificando bugs, errores de lógica y problemas de accesibilidad. El build (`npm run build`) compila sin errores. A continuación el resumen de correcciones aplicadas:

### Bugs Corregidos

#### 1. i18n roto en 4 páginas (CRÍTICO)
Las páginas `alertas.html`, `reporte-fallas.html`, `lecturas-manuales.html` y `consulta-datos.html` usaban prefijos `data-i18n` que no existían en `i18n.js`. Al cambiar idioma a inglés, el texto no se traducía.

| Página | Claves incorrectas | Claves correctas |
|---|---|---|
| alertas.html | `alerts.*` | `alt.*` |
| reporte-fallas.html | `reports.*` | `rpt.*` |
| lecturas-manuales.html | `readings.*` | `rdg.*` |
| consulta-datos.html | `query.*` | `qry.*` |

#### 2. Claves i18n faltantes
Agregadas a `i18n.js` (es + en):
- `portal.transcript.aria`, `portal.audiodesc.aria`
- `thr.confirm.delete_title`, `thr.suggest.msg`
- `rpt.transcript.aria`, `rpt.audiodesc.aria`

#### 3. Claves JS incorrectas en lecturas-manuales.html
El JS usaba `rdg.validate.out_of_threshold`, `rdg.validate.out_of_range`, `rdg.validate.ok` pero `i18n.js` tiene `rdg.valid.*`.

#### 4. XSS en el chatbot (SEGURIDAD)
`chatbot.js:518` insertaba input del usuario con `innerHTML` sin sanitizar. Corregido con función `escapeHTML()` que usa `textContent` para sanitizar antes de formatear con `**bold**` y `<br>`.

#### 5. Falsos positivos en detección de alertas (LÓGICA)
`dashboard.html:174` y `lecturas-manuales.html:224` comparaban strings con `.includes()`, causando falsos positivos (ej. "125.5 °C" coincidía con "25.5"). Corregido con comparación numérica `parseFloat()`.

#### 6. Archivos VTT no incluidos en build (PRODUCCIÓN)
No existía directorio `public/`. Los `<track src>` no eran procesados por Vite. Creado `public/assets/captions/` con copia de los 8 archivos VTT.

#### 7. Falta `[x-cloak]` en CSS (ACCESIBILIDAD)
Todos los formularios usaban `x-cloak` pero no existía la regla CSS. Los formularios parpadeaban antes de que Alpine los ocultara. Agregado en `@layer base`.

#### 8. Focus trap ausente en confirmAction() (WCAG 2.1.2)
El diálogo de confirmación no atrapaba Tab. Corregido con ciclo de foco entre botones "Sí, confirmar" y "Cancelar".

#### 9. Selector CSS del nav activo roto (DISEÑO)
El selector `.app-header nav a.bg-primary\ text-white` nunca matcheaba. Cambiado a clase `.active-nav` y actualizado `auth.js` para usarla.

#### 10. Chatbot getRole() retornaba 'admin' por defecto (SEGURIDAD)
Un usuario no logueado podía acceder a funcionalidades de admin en el chat. Cambiado default a `null`.

#### 11. Diálogo timeout de sesión sin focus trap
El botón "Extender sesión" se enfocaba correctamente pero la referencia DOM se consultaba innecesariamente. Optimizado guardando la referencia.

#### 12. CSS `.stop-motion #reader-bar` oculta el lector
La regla `body.stop-motion #reader-bar { display: none !important; }` ocultaba la barra del lector de pantalla al activar "Detener animaciones", lo cual es contradictorio. Eliminada la regla.

### Bugs Pendientes (no corregidos, conocidos)
- Login: no valida contraseña real, acepta cualquier valor (es un demo)
- `SMAI.exportPDF/Excel` lee solo la primera tabla del DOM
- `analizarValor()` en lecturas incluye la misma lectura en el histórico, sesgando detección
- Sin service worker ni soporte offline
- Alpine.js no actualiza plantillas reactivamente al cambiar idioma (requiere recarga para contenido dinámico)

### Comportamiento esperado
- **localStorage persiste entre sesiones en dev** — al correr `npm run dev` después de haber iniciado sesión, se mantiene el estado. Esto es normal (es por dominio). Al deployear a otro dominio, no sucede.

## Build
- `npm run dev` — servidor de desarrollo Vite con HMR
- `npm run build` — producción en `dist/` (9 HTML + CSS + JS + assets + VTT)
- `npm run preview` — previsualización local del build
