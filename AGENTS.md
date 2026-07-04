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
| `src/pages/index.html` | *(no usado — el portal es `index.html` raíz)* |
| `src/pages/dashboard.html` | Métricas, sensor grid, chart semanal, alertas recientes, export PDF/Excel (Tailwind + Alpine) |
| `src/pages/umbrales.html` | CRUD umbrales + IA "Sugerir valores" + resumen (Tailwind + Alpine) |
| `src/pages/consulta-datos.html` | Filtros + tabla dinámica + comparativa zonas + IA análisis + export (Tailwind + Alpine) |
| `src/pages/alertas.html` | Historial de alertas + simular alerta + resumen stats (Tailwind + Alpine) |
| `src/pages/reporte-fallas.html` | CRUD reportes + estado + mantenimientos + resumen (Tailwind + Alpine) |
| `src/pages/lecturas-manuales.html` | Registro lecturas + validación IA + lecturas recientes (Tailwind + Alpine) |
| `src/pages/sitemap.html` | Mapa del sitio (Tailwind) |
| `src/js/main.js` | Entry point ES module — importa Alpine y módulos compartidos |
| `src/js/utils.js` | Utilidades: `showNotification`, `confirmAction`, `initTooltips`, `getFromLS`, `saveToLS` |
| `src/js/auth.js` | Login, roles, nav dinámico, `protectPage()`, session timeout |
| `src/js/seed-data.js` | Genera datos demo al primer inicio + `simularAlerta()` |
| `src/js/accesibilidad.js` | Menú accesibilidad (♿), atajos teclado, tooltips, export PDF/Excel, panel ayuda (?), lista atajos (⌨) |
| `src/css/style.css` | Tailwind directives + WCAG custom CSS (tooltips, modos contraste/monocromo, accesibilidad) |
| `assets/img/` | Imágenes estáticas (logo, diagramas, red sensores) |
| `assets/video/` | Videos MP4 (monitoreo general + técnico) |
| `assets/captions/` | Archivos VTT (subtítulos y audiodescripciones) |
| `public/` | Archivos estáticos sin procesar (favicon, etc.) |
| `vite.config.js` | Multi-page build con 9 entradas HTML |
| `tailwind.config.js` | Colores extendidos, content paths |
| `postcss.config.js` | PostCSS con Tailwind + autoprefixer |

## Rutas (root-relative)
Todas las rutas en HTML usan paths absolutos desde la raíz del proyecto:
- `<link rel="stylesheet" href="/src/css/style.css">`
- `<script type="module" src="/src/js/main.js">`
- `<img src="/assets/img/logo-smai.png">`
- `<video src="/assets/video/Monitoreo ambiental...mp4">`
- `<track src="/assets/captions/captions-monitoreo.vtt">`
- Enlaces entre páginas: `/index.html`, `/src/pages/dashboard.html`, etc.
- Nav dinámico (`auth.js`): hrefs root-relative con `/index.html`, `/src/pages/*.html`

## Datos
Todas las claves de localStorage:
- `smai_lecturas` — array `[{fecha, sensor, valor, unidad, ubicacion, notas}]`
- `smai_umbrales` — array `[{parametro, ubicacion, minimo, maximo}]`
- `smai_reportes` — array `[{fecha, equipo, asunto, descripcion, estado}]`
- `smai_mantos` — array `[{fecha, equipo, accion}]`
- `smai_alertas` — array `[{fecha, parametro, valor, ubicacion, umbral, mensaje}]`
- `accesibilidad_prefs` — preferencias de accesibilidad
- `smai_seeded_v1` — flag para evitar doble seed

## Requisitos Funcionales (RF1-RF20)
| RF | Descripción | Implementado en |
|----|-------------|-----------------|
| RF1 | Iniciar sesión con correo y contraseña | `login.html` + `auth.js` |
| RF2 | Cerrar sesión | `auth.js` (`SMAI.logout()`) |
| RF3 | Dashboard con resumen de lecturas | `dashboard.html` |
| RF4 | Registrar umbrales (min/max) | `umbrales.html` formulario |
| RF5 | Listar umbrales configurados | `umbrales.html` tabla |
| RF6 | Modificar umbrales existentes | `umbrales.html` botón Editar |
| RF7 | Eliminar umbrales | `umbrales.html` botón Eliminar |
| RF8 | Historial de alertas automáticas | `alertas.html` |
| RF9 | Filtrar datos históricos por fecha | `consulta-datos.html` |
| RF10 | Filtrar por ubicación | `consulta-datos.html` |
| RF11 | Limpiar filtros de búsqueda | `consulta-datos.html` botón Limpiar |
| RF12 | Generar reporte PDF descargable | `accesibilidad.js` (`SMAI.exportPDF()`) |
| RF13 | Tabla comparativa entre zonas | `consulta-datos.html` sección comparativa |
| RF14 | Interfaz responsive para móvil | `style.css` (breakpoints 768px/480px) |
| RF15 | Validar valores numéricos en lecturas | `lecturas-manuales.html` validación JS |
| RF16 | Reportar falla de equipo | `reporte-fallas.html` formulario |
| RF17 | Listar historial de reportes | `reporte-fallas.html` tabla |
| RF18 | Cambiar estado Pendiente↔Solucionado | `reporte-fallas.html` botón Solucionar/Reabrir |
| RF19 | Historial de mantenimientos por sensor | `reporte-fallas.html` tabla mantos |
| RF20 | Agregar registro de mantenimiento | `reporte-fallas.html` formulario manto |

## Métricas de Usabilidad (cuantitativas)
| Métrica | Objetivo |
|---------|----------|
| Tasa de finalización | 90% primer intento en registrar lectura o umbral |
| Tiempo en tarea | ≤2 min en filtrar+exportar PDF; ≤1 min en registrar lectura |
| Número de clics | ≤3 pasos para flujo principal (guardar lectura, ver alertas, bajar PDF) |
| Tasa de error | ≤5% en campos numéricos; ≤5% en credenciales |
| Puntuación SUS | ≥75 puntos |
| WCAG | Nivel AA (contraste 4.5:1, teclado, etiquetas, etc.) |

## Reparto WCAG por estudiante (asignacion-criterioWCAG-grupodesarrollo.docx)
### David Cevallos (Líder)
1. **Alternativas textuales y multimedia:** 1.1.1, 1.2.1, 1.2.2, 1.2.3, 1.2.4, 1.2.5
2. **Estructura semántica e idioma:** 1.3.1, 1.3.2, 1.3.3, 1.3.5, 3.1.1, 3.1.2, 4.1.2
3. **Color, contraste y texto:** 1.4.1, 1.4.3, 1.4.4, 1.4.5, 1.4.10, 1.4.11, 1.4.12, 1.4.13
4. **Tiempo, movimiento y orientación:** 1.3.4, 1.4.2, 2.2.1, 2.2.2, 2.3.1

### Alan Cobeña
5. **Teclado y foco:** 2.1.1, 2.1.2, 2.1.4, 2.4.3, 2.4.7, 2.4.11
6. **Navegación y consistencia:** 2.4.1, 2.4.2, 2.4.4, 2.4.5, 2.4.6, 3.2.1, 3.2.3, 3.2.4, 3.2.6
7. **Puntero, gestos y táctil:** 2.5.1, 2.5.2, 2.5.3, 2.5.4, 2.5.7, 2.5.8
8. **Formularios, errores y estados:** 3.2.2, 3.3.1, 3.3.2, 3.3.3, 3.3.4, 3.3.7, 3.3.8, 4.1.3

## Docs de diseño (~/Documentos/Usabilidad/)
Los 11 archivos .docx constituyen la especificación del proyecto. Correspondencia verificada al 100%:
- **F1-Contexto-uso-lleno.docx** — 3 perfiles de usuario con edades, dispositivos, necesidades
- **F2-Requisitos Cobeña-Cevallos.docx** — RF1-20, métricas cuantitativas y cualitativas
- **F3-Formulario-menu accesibilidad.docx** — Mapeo de 55 criterios WCAG a formularios
- **F4_Prototipo_sistema.docx** — 6 formularios con métricas + imagen del menú ♿ de 4 categorías
- **Menu_Accesibilidad_WCAG22-ultimo.docx** — Especificación detallada del menú flotante
- **Checklist_WCAG22_sistema_web.docx** — Checklist completa A+AA (~55 criterios)
- **asignacion-criterioWCAG-grupodesarrollo.docx** — Reparto David/Alán
- **generalidades.docx** — Flujo: captura→procesamiento→análisis IA→alertas→dashboard
- **indicaciones_1prueba.docx** — Evaluación: Semana 11, think-aloud, 12 criterios/estudiante

## Bugs/issues conocidos
- Dashboard: detección de alerta compara strings (no números) — falsos positivos posibles
- Login: no valida contraseña real, acepta cualquier valor
- `confirmAction()` no trapea foco dentro del diálogo (Tab puede salir)
- `SMAI.exportPDF/Excel` lee solo la primera tabla del DOM
- `analizarValor()` en lecturas incluye la misma lectura en el histórico, sesgando detección
- Sin service worker ni soporte offline

## WCAG — Checklist completo (Nivel A + AA)

### Principio 1 — Perceptible

#### 1.1.1 Contenido no textual ✅
Todas las imágenes tienen `<figure>`+`<figcaption>`. Iconos decorativos con `aria-hidden="true"`.
Imágenes estáticas (logo, diagramas, red sensores) en `assets/img/`.
Videos MP4 en `assets/video/`.
Archivos VTT en `assets/captions/`.

#### 1.2.1–1.2.5 Audio/Video ✅
- **1.2.1** Transcripciones: texto alternativo disponible en `.video-transcript` bajo cada video, visible desde el panel ♿.
- **1.2.2** Subtítulos grabados: pista `<track kind="captions" default>` en ambos videos con archivos VTT sincronizados.
- **1.2.3** Audiodescripción/alternativa: transcripción descriptiva incluida en el `.video-transcript` (narra contenido visual).
- **1.2.4** Subtítulos en directo: no aplica (sin streaming en vivo).
- **1.2.5** Audiodescripción: pista `<track kind="descriptions">` en ambos videos con archivos VTT descriptivos.
Archivos VTT:
- `assets/captions/captions-monitoreo.vtt` / `assets/captions/descriptions-monitoreo.vtt` — video general
- `assets/captions/captions-tecnico.vtt` / `assets/captions/descriptions-tecnico.vtt` — video para técnico

#### 1.3.1 Info y Relaciones ✅
- Tablas: `<th>` con `scope="col"`
- Navegación: `<ul>` dentro de `<nav>`
- Formularios: `aria-describedby` vincula texto auxiliar
- Contexto visual: textos explicativos con `aria-describedby`

#### 1.3.2 Secuencia Significativa ✅
DOM: `skip-link → header (h1 + nav) → main → footer`
Sin `tabindex` positivo, sin `order` en flex/grid.

#### 1.3.3 Características Sensoriales ✅
Instrucciones usan etiqueta textual (`"🚨 Simular alerta"`), no solo color/posición.
Badges: color + texto (`Normal`, `Alerta`).

#### 1.3.4 Orientación ✅
Sin restricción de orientación. Layout responsive flex/grid.

#### 1.3.5 Propósito del Input ✅
`login.html`: `autocomplete="username"` en email, `autocomplete="current-password"` en password.

#### 1.4.1 Uso del color ✅
Color nunca es único indicador. Badges: color + texto. Modo `body.monochrome` desatura todo.

#### 1.4.2 Control de audio ✅
No hay audio automático. No aplica.

#### 1.4.3 Contraste mínimo (4.5:1) ✅
- Texto `#1a2332` sobre `#f0f4f8` → 15.7:1
- Texto secundario `#495057` sobre `#f0f4f8` → 5.1:1
- `--danger` corregido a `#b02a37` (blanco sobre `#b02a37` → 4.5:1)
- Badges con colores corregidos (ver style.css)
- Panel ♿: opción "Alto contraste" (`body.high-contrast`)

#### 1.4.4 Cambio tamaño texto (200%) ✅
Todos los `font-size` en `rem`. Layout responsive colapsa a 1 columna en 768px.
Panel ♿: control deslizante "Tamaño de texto" (50%–200%).

#### 1.4.5 Imágenes de texto ✅
No se usan imágenes de texto. Solo 3 imágenes: logo y diagramas.

#### 1.4.10 Reflow ✅
Breakpoints 768px y 480px. Flex/grid con `flex-wrap`. Imágenes `max-width:100%`.

#### 1.4.11 Contraste no textual ✅
- Bordes input `#6b7b96` (3.93:1)
- Botón warning `#b38600` (3.11:1)
- Botones secundarios `#495057` sobre `#f0f4f8` (5.1:1)
- Badges con borde `1px solid`
- Barras sin datos `#808080`
- Panel ♿: "Contraste en controles" (`body.contrast-controls`)

#### 1.4.12 Espaciado de texto ✅
Sin `overflow:hidden` en contenedores. Soporta line-height/letter-spacing extra.
Panel ♿: "Espaciado ampliado" (`line-height: 2`, `letter-spacing: 0.15em`).

#### 1.4.13 Contenido hover/foco ✅
Tooltips con `data-tooltip`: Escape los oculta, flecha `::before` conecta elemento, modo persistente con `.tooltip-show`.

### Principio 2 — Operable

#### 2.1.1 Teclado ✅
Todos los controles son elementos HTML nativos (`<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`).
Sin `<div>`/`<span>` con onclick. Sin `tabindex > 0`.

#### 2.1.2 Sin trampas de foco ✅
Modales (confirmación, timeout, ayuda, atajos) cierran con Escape. El foco puede salir con Tab.

#### 2.1.4 Atajos del teclado ✅
`Alt+N` / `Ctrl+Shift+N` (N=1..7). Requieren tecla modificadora.
Panel ♿: "Desactivar atajos teclado" los deshabilita.

#### 2.2.1 Tiempo ajustable ✅
15 min inactividad → aviso 2 min → cierre. "Modo sin prisas" desactiva timeout. "Extender sesión" reinicia.

#### 2.2.2 Pausar/Detener/Ocultar ✅
Sin contenido en movimiento. No aplica.
Panel ♿: "Detener animaciones" (`body.stop-motion`).

#### 2.3.1 Tres destellos ✅
Sin contenido que destelle. No aplica.

#### 2.4.1 Evitar bloques ✅
Skip link `<a href="#main" class="skip-link">` en las 9 páginas.
Botón ♿ insertado justo después del skip-link en el DOM (primer elemento enfocable tras saltar navegación).
Landmarks ARIA: `role="region"` con `aria-label` en paneles.

#### 2.4.2 Titulado de páginas ✅
9 títulos únicos y descriptivos (ej: "Dashboard - Monitoreo Ambiental").

#### 2.4.3 Orden del foco ✅
Orden DOM lógico. Sin `tabindex` positivo.

#### 2.4.4 Propósito de los enlaces ✅
Sin "clic aquí". Todos los enlaces tienen texto descriptivo.

#### 2.4.5 Múltiples vías ✅
Menú nav + portal cards + sitemap.html + atajos teclado + botón ayuda.

#### 2.4.6 Encabezados y etiquetas ✅
Jerarquía h1→h2→h3 lógica. Todos los inputs con `<label for>`.

#### 2.4.7 Foco visible ✅
`:focus` en inputs, botones, nav, skip-link. Sin `outline:none`.
Panel ♿: "Resaltar foco" (`body.focus-visible` con outline 3px amarillo).

#### 2.4.11 Foco no oculto ✅
Header es static (no sticky). Sin riesgo de cobertura.

#### 2.5.1/2.5.2 Gestos/Cancelación ✅
Sin drag ni multi-touch. Botones usan `click` (no mousedown).

#### 2.5.3 Etiqueta en el nombre ✅
Botones con icono tienen texto visible. `aria-label` en ? y ⌨.

#### 2.5.4/2.5.7 Movimiento/Arrastre ✅
No aplica. Sin APIs de movimiento ni drag & drop.

#### 2.5.8 Tamaño interacción ✅
Checkboxes panel ♿: 24×24px (corregido). `.target-size` activa min 44×44px.

### Principio 3 — Comprensible

#### 3.1.1 Idioma página ✅
`<html lang="es">` en todas las páginas.

#### 3.1.2 Idioma partes ✅
Todo el contenido en español. Anglicismos técnicos aceptados.

#### 3.2.1/3.2.2 Foco/Entrada ✅
Sin navegación automática al enfocar o escribir.

#### 3.2.3/3.2.4/3.2.6 Consistencia ✅
Mismo menú por rol. Mismos iconos/nombres. Botón ayuda (?) misma posición.

#### 3.3.1/3.3.2/3.3.3 Errores ✅
Mensajes descriptivos con ejemplos. `role="alert"` en contenedores de error.
Foco movido al campo con error.

#### 3.3.4 Prevención errores ✅
`confirmAction()` antes de acciones destructivas (eliminar, limpiar, restaurar demo).

#### 3.3.7 Entrada redundante ✅
sessionStorage auto-fill: filtros consulta, equipo reporte, ubicación/notas lecturas.

#### 3.3.8 Autenticación accesible ✅
Inputs estándar, `autocomplete`, sin CAPTCHA, sin timeout en login.

### Principio 4 — Robusto

#### 4.1.2 Nombre, función, valor ✅
Todos los controles tienen nombre y rol: `<button>` con texto, `<label for>`, `role="dialog"`, `role="alert"`, `role="status"`.

#### 4.1.3 Mensaje de estado ✅
Notificaciones: `aria-live="polite"` + `role="status"`.
Errores: `role="alert"`.
Diálogos: `role="dialog" aria-modal="true"`.

## Menú de Accesibilidad Flotante (Panel ♿)

Basado en `Menu_Accesibilidad_WCAG22-ultimo.docx`. Organizado en 4 categorías:

### Visual — baja visión, daltonismo, ceguera
| Opción | Criterio | Implementación |
|--------|----------|----------------|
| Tamaño de texto (range 50–200%) | 1.4.4 | `html.style.fontSize` |
| Tipografía legible (select) | 1.4.12 | Sans-Serif / Serif / OpenDyslexic |
| Espaciado ampliado (toggle) | 1.4.12 | `line-height: 2` + `letter-spacing: 0.15em` |
| Alto contraste (toggle) | 1.4.3 | `body.high-contrast` (fondo negro, texto blanco) |
| Modo monocromo (toggle) | 1.4.1 | `filter: grayscale(100%)` |
| Contraste en controles (toggle) | 1.4.11 | `body.contrast-controls` (bordes reforzados) |

### Auditiva — sordera, hipoacusia (solo visible si hay `<audio>`/`<video>` en DOM)
| Opción | Criterio | Implementación |
|--------|----------|----------------|
| Silenciar audio (toggle) | 1.4.2 | `audio/video muted` |
| Activar subtítulos (toggle) | 1.2.2 | Placeholder listo para cuando haya videos |
| Activar transcripciones (toggle) | 1.2.1 | Placeholder listo para cuando haya videos |
| Activar audiodescripción (toggle) | 1.2.5 | Placeholder listo para cuando haya videos |
Toda la categoría Auditiva se oculta automáticamente si no hay elementos `<audio>` o `<video>` en el DOM.

### Motriz — dificultades motricidad fina, teclado
| Opción | Criterio | Implementación |
|--------|----------|----------------|
| Resaltar foco (toggle) | 2.4.7 | `body.focus-visible` (outline 3px amarillo) |
| Objetivos grandes (toggle) | 2.5.8 | `body.target-size` (min 44×44px) |
| Tooltips persistentes (toggle) | 1.4.13 | Click mantiene tooltip visible |
| Skip link siempre visible | 2.4.1 | Muestra enlaces de salto |

### Cognitiva — TDAH, dislexia, ansiedad
| Opción | Criterio | Implementación |
|--------|----------|----------------|
| Detener animaciones (toggle) | 2.2.2 | `body.stop-motion` (duración 0) |
| Reducir destellos (toggle) | 2.3.1 | `body.reduce-flashes` |
| Modo sin prisas (toggle) | 2.2.1 | `body.no-timing` desactiva timeout sesión |
| Desactivar atajos teclado (toggle) | 2.1.4 | `keyboardShortcuts: false` |
| Restablecer valores | — | Recarga configuración por defecto |

## Atajos de teclado
- `Alt+1` / `Ctrl+Shift+1` — Inicio
- `Alt+2` / `Ctrl+Shift+2` — Dashboard
- `Alt+3` / `Ctrl+Shift+3` — Umbrales
- `Alt+4` / `Ctrl+Shift+4` — Consulta Datos
- `Alt+5` / `Ctrl+Shift+5` — Alertas
- `Alt+6` / `Ctrl+Shift+6` — Reporte Fallas
- `Alt+7` / `Ctrl+Shift+7` — Lecturas Manuales

## Botones flotantes
| Botón | Posición | Función |
|-------|----------|---------|
| ♿ | bottom:20px; right:20px | Menú accesibilidad |
| ? | bottom:80px; right:20px | Ayuda contextual |
| ⌨ | bottom:80px; right:76px | Tabla de atajos |

## Videos implementados
| Video | Ubicación | Rol |
|-------|-----------|-----|
| `Monitoreo ambiental inteligente en Colombia(720P_HD).mp4` | `index.html` (card con `<video>`) | Todos |
| `Técnico en Monitoreo Ambiental(720P_HD).mp4` | `lecturas-manuales.html` (card condicional) | `tecnico` |

Ambos videos incluyen:
- Pista de subtítulos (`<track kind="captions">`) con archivo VTT
- Pista de audiodescripción (`<track kind="descriptions">`) con archivo VTT
- Transcripción textual en `.video-transcript` (toggleable desde ♿)
- La categoría Auditiva del panel ♿ aparece automáticamente al detectar `<video>` en el DOM

## Diseño Visual Moderno (Jul 2026)

Se aplicó un rediseño completo con paleta ambiental teal/verde. Todos los componentes CSS están en `src/css/style.css` en `@layer components`.

### Paleta de colores (`tailwind.config.js`)
| Token | Color | Contraste WCAG AA |
|-------|-------|-------------------|
| `primary` | `#0f766e` (teal-700) | 5.2:1 con blanco ✅ |
| `primaryLight` | `#14b8a6` | — |
| `primaryDark` | `#115e59` | — |
| `surface` | `#f8fafc` | — |
| `card` | `#ffffff` | — |
| `border` | `#e2e8f0` | — |
| `muted` | `#64748b` | — |
| `danger` | `#b91c1c` | — |
| `warning` | `#b45309` | — |
| `success` | `#15803d` | — |

### Componentes modernos (`style.css`)
- **`.app-header`** — gradiente `primary→primaryDark`, sombra `shadow-nav`, padding 16px, nav items blancos con opacidad
- **`.card-modern`** — fondo blanco, borde `border`, sombra `shadow-card`, `border-radius: 10px`, hover lift con `shadow-card-hover`, transición 200ms
- **`.stat-card`** — borde izquierdo coloreado (4px), padding 14px, texto centrado, flex-1, ancho mínimo 120px
- **`.context-bar`** — barra informativa: fondo `#f0fdfa`, borde izquierdo `primary 3px`, padding 10px 14px, texto `muted`, border-radius
- **`.btn-modern`** (base) — padding 8px 18px, border-radius 8px, font-semibold, cursor pointer, transición 150ms, `text-decoration: none`
  - `.btn-primary` — primary sólido, hover primaryDark
  - `.btn-success` — success sólido, hover `#166534`
  - `.btn-danger` — danger sólido, hover `#991b1b`
  - `.btn-warning` — warning sólido, hover `#92400e`
  - `.btn-ghost` — gris outline, hover fondo gris claro
- **`.badge`** (moderno) — sin borde, colores suaves, padding 3px 10px, border-radius 9999px, font-xs semibold
  - `.badge-success` — bg verde claro, texto verde oscuro
  - `.badge-danger` — bg rojo claro, texto rojo oscuro
  - `.badge-warning` — bg ámbar claro, texto ámbar oscuro
  - `.badge-secondary` — bg gris claro, texto gris oscuro

### Header
- `bg-gradient-to-r from-primary to-primaryDark` con sombra `shadow-nav`
- Título blanco, nav links en `text-white/80` con hover `bg-white/15` y active `bg-white/25`
- Padding: `px-6 py-4`

### Tipografía
- **Inter** importada desde Google Fonts via `@import` en `style.css`
- Font family global: `Inter, system-ui, sans-serif`

### Inputs / Formularios
- Borde `border-2 border-border` (por defecto)
- Focus: `border-primary` + `ring-1 ring-primary` + `outline-none`
- Select y textarea mismo estilo consistente

### Botones en páginas convertidas
- Dashboard: `btn-success` (PDF), `btn-primary` (Excel), `btn-danger` (simular alerta)
- Umbrales: `btn-primary` (+ Nuevo), `btn-success` (Sugerir), `btn-success` (Guardar), `btn-ghost` (Cancelar), `btn-warning` (Editar), `btn-danger` (Eliminar)
- Consulta datos: `btn-success` (PDF), `btn-primary` (Excel), `btn-primary` (filtros), `btn-ghost` (limpiar)
- Alertas: `btn-danger` (simular alerta)
- Reporte fallas: `btn-primary` (nuevo reporte, registrar manto), `btn-success` (guardar), `btn-ghost` (cancelar), `btn-warning` (solucionar/reabrir), `btn-danger` (eliminar)
- Lecturas manuales: `btn-primary` (nueva lectura), `btn-success` (guardar), `btn-ghost` (cancelar)

## Build

## Plan: Chatbot Conversacional por Rol (Pendiente)

### Archivo nuevo: `src/js/chatbot.js`
Motor de chatbot con reconocimiento de intenciones mediante patrones regex (sin API externa). Exporta:
- `processMessage(texto, rol)` → analiza texto, identifica intent, consulta localStorage, devuelve respuesta
- `init(rol)` → inyecta botón flotante 💬 + panel chat en DOM

### Intenciones a reconocer (~15 patrones)
| Intención | Ejemplos | Consulta |
|-----------|----------|----------|
| `saludo` | "hola", "buenos días" | Saludo + sugerencias |
| `temperatura` | "temp en torre norte" | Última lectura ST-001 |
| `humedad` | "humedad del río" | Última lectura SH-002 |
| `calidad_aire` | "calidad del aire" | Última lectura SA-003 |
| `ruido` | "ruido zona industrial" | Última lectura SR-004 |
| `alertas` | "alertas activas hoy" | `smai_alertas` filtrado |
| `umbrales` | "qué umbrales hay" | `smai_umbrales` |
| `promedio` | "promedio temperatura" | Promedio por sensor |
| `ultimas_lecturas` | "últimas lecturas" | Últimas 5 lecturas |
| `reportes` | "reportes pendientes" | `smai_reportes` filtrado |
| `mantenimientos` | "último manto ST-001" | `smai_mantos` filtrado |
| `sensores` | "qué sensores hay" | Lista fija + estado |
| `estado_general` | "resumen del sistema" | Todas las fuentes |
| `ayuda` | "qué puedes hacer" | Lista de comandos |
| `despedida` | "gracias", "adiós" | Cierre cordial |

### Lógica por rol
- **Admin**: todas las intenciones, respuestas completas
- **Consultor**: solo lecturas, alertas, umbrales, promedios (sin reportes/mantos)
- **Tecnico**: lecturas, reportes, mantenimientos, alertas (sin umbrales)

### UI: Panel flotante tipo chat
- **Botón** 💬 en esquina inferior izquierda (no conflictúa con ♿ ? ⌨ a la derecha)
- **Panel** ~380×500px, overlay semi-transparente
- Header: "Asistente SMAI" + badge rol + botón cerrar
- Burbujas: usuario derecha (verde), bot izquierda (gris)
- Input + Enter + botón enviar
- Chips de acceso rápido bajo input ("Temperatura", "Alertas", "Estado general")
- Mensaje bienvenida contextual según rol
- Auto-scroll, indicador "escribiendo..." (delay 300-800ms simulado)

### CSS a agregar en `style.css`
- `.chat-fab` — botón flotante 56×56px, fondo primary
- `.chat-overlay` / `.chat-panel` — overlay + contenedor
- `.chat-header` — gradiente primary→primaryDark
- `.chat-msgs` — scroll, gap entre mensajes
- `.chat-msg-user` / `.chat-msg-bot` — burbujas
- `.chat-chips` — botones rápidos flex-wrap
- `.chat-input-area` — input + botón enviar

### Integración
- `chatbot.js` importado desde `main.js` (como `accesibilidad.js`)
- Se auto-inicializa verificando `smai_user` en localStorage
- Sin modificar cada HTML individual

### WCAG
- `aria-label`, `role="dialog"`, `aria-modal`
- Foco atrapado dentro del panel, cierra con Escape
- Input con `<label>` oculto accesible
- Mensajes con `aria-live="polite"`
- `npm run dev` — servidor de desarrollo Vite con HMR
- `npm run build` — producción en `dist/` (9 HTML + CSS + JS + assets)
- `npm run preview` — previsualización local del build
