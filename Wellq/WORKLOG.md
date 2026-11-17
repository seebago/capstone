# WORKLOG — trabajo en curso sobre `Wellq/`

Registro para coordinar personas y asistentes de IA (Claude, Codex, etc.) que
trabajan sobre el prototipo React + Express de `Wellq/`.

**Protocolo**

1. Antes de tocar archivos, agrega una entrada con estado `EN TRABAJO`,
   la rama, la fecha y la lista de archivos.
2. Si otro agente tiene una entrada `EN TRABAJO` de **hoy** sobre un archivo
   que necesitas, no lo sobreescribas: avisa al líder de equipo.
3. Al terminar, marca cada archivo como `TERMINADO` (o `PENDIENTE` con motivo)
   y apunta al commit.

Se eligió un archivo central en vez de comentarios `EN TRABAJO POR ...` dentro
de cada archivo fuente: así no se ensucia el código ni se generan conflictos
de merge en la cabecera de cada archivo.

---

## 2026-11-18 — Claude (Opus 5.5) — rama `feature/ux-responsive-seguridad-2026-11-18`

Estado: **TERMINADO** (push a `origin/feature/ux-responsive-seguridad-2026-11-18`, sin merge)

Base: `fix/seguridad-wellq-app-aron-2026-11-18` rebaseada sobre `origin/develop`
(`b7dd9c3`, que ya trae `BottomNav.tsx`, `types/index.ts` y
`locales/translations.ts` de Aron). Rebase sin conflictos.

| Archivo | Motivo | Estado |
|---|---|---|
| `Wellq/WORKLOG.md` | Este registro | TERMINADO |
| `Front-end/src/App.tsx` | Layout escritorio/móvil, chat flotante, cambio de rol con nuevo JWT, limpiar datos al perder sesión | TERMINADO |
| `Front-end/src/App.css` | Jerarquía visual, media queries ≥1025px, estilos del chat flotante | TERMINADO |
| `Front-end/src/components/BottomNav.tsx` | Quitar pestaña Chat (pasa a burbuja); en escritorio se muestra como sidebar | TERMINADO |
| `Front-end/src/components/ChatView.tsx` | Sin cambios: el modo flotante se resolvió con CSS en `App.css`; sigue 100 % simulado | NO MODIFICADO |
| `Front-end/src/components/ChatBubble.tsx` (nuevo) | FAB arrastrable que abre/cierra el chat | TERMINADO |
| `Front-end/src/components/ExamsView.tsx` | Orden visual: acción principal primero, tabla con más columnas en escritorio | TERMINADO |
| `Front-end/src/components/ClinicianView.tsx` | Orden visual (KPIs arriba) y quitar `document.write` (XSS) | TERMINADO |
| `Front-end/src/components/ProfileModal.tsx` | Orden visual: identidad y cerrar sesión claros | TERMINADO |
| `Back-end/src/routes/exams.routes.ts` | Validar `file_data` estricto (XSS almacenado), `decision`, `reason`; ruta del PDF demo | TERMINADO |
| `Back-end/test/security.test.ts` | Pruebas de acceso directo por URL y nuevas validaciones | TERMINADO |
| `Wellq/INFORME_PRUEBAS_2026-11-18.md` (nuevo) | Informe de pruebas | TERMINADO |
| `BITACORA_PROGRESO.md` (raíz) | Entrada del día y registro de aporte IA | TERMINADO |

Pendientes que **no** se tocaron (ver `INFORME_PRUEBAS_2026-11-18.md`, sección 5):
máquina de estados del flujo (P1), rate limit/helmet (P3), texto clínico del
chat (P5), nombre real en perfil demo (P6), `src/components/tabs/*` que rompe
`npm run build` (P7). Quien los tome, que agregue su propia entrada aquí.

---

## 2026-11-18 (tarde) — Claude (Opus 5.5) — misma rama `feature/ux-responsive-seguridad-2026-11-18`

Estado: **TERMINADO**. Seis ajustes de layout reportados al probar la app. Solo CSS y UI: no se tocó lógica de negocio ni de seguridad.

| # | Problema | Causa encontrada | Cambio | Commit |
|---|---|---|---|---|
| 1 | La sidebar de escritorio se mueve con el scroll | No se reprodujo en Chromium (ya era `position: fixed`) | `position: fixed` explícita bajo la topbar, alto propio `calc(100dvh - --topbar-h)`, scroll interno, `overscroll-behavior: contain`. Variables `--topbar-h` y `--sidebar-w` en `App.css` | `264881c` |
| 2 | El contenido de escritorio no ocupa todo el ancho | `.wellq-main-layout` heredaba `margin: 0 auto` y `max-width: 1440px`. Al ser un ítem flex con margen auto, se encogía al ancho de su contenido | `margin-right: 0`, `align-self: stretch`, `max-width: none` | `264881c` |
| 3 | "Menú" debe ir antes que "Exámenes" | Orden del DOM en `BottomNav.tsx` | `order: -1` en `.menu-trigger`, solo en escritorio; el orden en móvil no cambia | `264881c` |
| 4 | El swipe solo abría el menú | En el código **no había ningún gesto** de swipe | Nuevo `src/hooks/useHorizontalSwipe.ts`. En `App.tsx`, deslizar desde el borde derecho hacia la izquierda abre el menú (solo ≤1024px). En `MenuDrawer.tsx`, deslizar hacia la derecha cierra | `9636a6f` |
| 5 | La burbuja del chat queda mal al cambiar de breakpoint | Una sola posición global en `localStorage` | `ChatBubble.tsx` guarda la posición por breakpoint (`wellq-chat-fab-pos:mobile` / `:desktop`) y la recarga al cambiar de layout. Límites: no se pone sobre la sidebar, la barra inferior ni la topbar | `9f57afd` |
| 6 | El grid cambia entre filtros y al expandir o minimizar | La columna del nombre era `1fr`, cuyo mínimo es el contenido: los nombres largos la ensanchaban. En móvil la tarjeta se desbordaba y quedaba recortada | `minmax(0, 1fr)`, `min-width: 0` y `overflow-wrap: break-word`. Móvil: `92px / 1fr / 112px` | `b78dee8` |

Para otras IAs:
- El breakpoint de escritorio es `min-width: 1025px` en todo el CSS y en `ChatBubble`. Si se cambia, cámbialo en los dos lados.
- `--topbar-h` debe coincidir con el alto real de `.topbar-container`, que hoy mide unos 70px.
