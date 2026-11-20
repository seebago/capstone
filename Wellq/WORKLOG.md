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

---

## 2026-11-19 — Claude (Opus 5.5) — despliegue en Vercel (misma rama `feature/ux-responsive-seguridad-2026-11-18`)

Estado: **DESPLEGADO**. Persistencia en MongoDB Atlas conectada el 2026-11-19 (ver la actualización al final).

| Qué | URL pública | Proyecto Vercel (cuenta `vicentelopezhandres-7712`) |
|---|---|---|
| Frontend (React + Vite) | https://wellq-app-xi.vercel.app | `wellq-app` (raíz `Wellq/Front-end`) |
| Backend (Express) | https://wellq-api.vercel.app (`/api/health`) | `wellq-api` (raíz `Wellq/Back-end`) |

**Cómo quedó:**
- **Backend:**
  - `Back-end/api/index.ts` es una Vercel Function que envuelve `createApp()` sin cambiar la lógica.
  - Espera la conexión a MongoDB antes de atender y siembra los exámenes sintéticos si `SEED_DEMO_DATA=1` y la colección está vacía.
  - `vercel.json` manda todas las rutas a esa función.
  - El PDF demo tiene una copia en `Back-end/assets/`.
- **Frontend:**
  - `vercel.json` con `vite build`. `tsc -b` falla por `src/components/tabs/*`, que no se usa.
  - Un rewrite envía `/api/*` a `https://wellq-api.vercel.app`, igual que el proxy de Vite en desarrollo, así que el código React no cambió.
  - CORS del backend restringido a `https://wellq-app-xi.vercel.app` con `CORS_ORIGINS`.
- **Variables en Vercel (`wellq-api`), solo nombres:**

  | Variable | Tipo | Estado |
  |---|---|---|
  | `JWT_SECRET` | sensitive | Configurada |
  | `CORS_ORIGINS` | plain | Configurada |
  | `SEED_DEMO_DATA` | plain | Configurada |
  | `MONGODB_TIMEOUT_MS` | plain | Configurada |
  | `MONGODB_URI` | sensitive | Configurada (creada por la integración de Atlas) |

  Ningún secreto está en el repo.
- **Despliegue:** se hace con la CLI, sin integración Git, porque el repo es de otra cuenta de GitHub. Para redesplegar:

  ```bash
  cd Wellq/Back-end && npx vercel@latest deploy --prod
  ```

  ```bash
  cd Wellq/Front-end && npx vercel@latest deploy --prod
  ```

  Hace falta `npx vercel login` con la cuenta de Vicente. `.vercel/` es local y está ignorado.
- **Arreglos necesarios para desplegar:**
  - El modelo `Exam` de Mongo no aceptaba `pendiente`/`no_realizado` ni `status_category`, que usa la UI.
  - `db.ts` imprimía la URI de conexión, que puede traer credenciales.
  - El título de la pestaña era "temp-vite".

**Probado contra las URLs públicas:**
- **Navegador:** login paciente → listar → confirmar (200) → chat (aviso DEMO) → cambiar a clínico → validar (200).
- **curl:**
  - 401 sin token en `/api/exams`, `/demo-pdf` y `/:id/file`.
  - 404 entre tenants y 403 cuando el paciente intenta validar.
  - CORS rechaza otros orígenes.
  - Subir un PDF da 201.
- **Siembra en Mongo:** probada en local con un `mongod` y dos procesos separados que simulan dos instancias. Los 5 exámenes sintéticos quedaron sembrados; lo confirmado en una instancia se ve y se valida en la otra.

**Riesgo (sin `MONGODB_URI`):** el backend está en modo memoria. Cada instancia serverless tiene su propia copia de los datos sintéticos. Medido: tras una ráfaga de 20 peticiones concurrentes, 18 vieron el estado inicial y no el validado. Con Atlas configurado este riesgo desaparece.

### Actualización 2026-11-19 (noche): MongoDB Atlas conectado

- Vicente conectó **MongoDB Atlas** (plan Free, `iad1`) a `wellq-api` mediante la integración de Vercel, que creó `MONGODB_URI` (sensitive) en Production y Preview. Se verificó solo que la variable existe, sin leer su valor.
- Al redesplegar, el primer arranque sembró los 5 exámenes sintéticos en Atlas (log `[Seed]`, una sola vez). El backend ya no usa el modo memoria: los ids son ObjectId de Mongo.
- **Flujo en navegador** contra https://wellq-app-xi.vercel.app: login paciente → confirmar (200) → cambiar a clínico → validar (200) → "Validados 1". Todo quedó guardado en Atlas.
- **Prueba de concurrencia** (la que antes falló con 18 de 20 peticiones viendo el estado inicial): **20/20 y luego 50/50** peticiones simultáneas ven el mismo estado (`clinically_validated`).
- **Aislamiento y datos:**
  - Alpha ve 4 exámenes, sin duplicados de la siembra; beta ve 1, solo de `clinic-beta`.
  - Beta leyendo un examen de alpha recibe 404; sin token, 401.
  - Sin errores ni warnings en los logs.
- **Protección DDoS de Vercel:** tras más de 70 peticiones en segundos desde una misma IP, Vercel respondió `403 Security Checkpoint` (`x-vercel-mitigated: challenge`, `retry-after: 30`). No viene de la app y se libera solo. El uso normal de la demo no lo activa. **No hagas pruebas de carga contra estas URLs el día de la presentación.**
- **Reset del estado demo:**

  ```bash
  cd Wellq/Back-end && MONGODB_URI='<URI de Atlas>' npm run reset-demo -- --yes
  ```

  Deja los 5 exámenes sintéticos como al inicio, solo de `clinic-alpha` y `clinic-beta`, y no toca `audit_events`. La URI se copia desde Vercel → Storage → MongoDB Atlas (o desde Atlas → Connect); no va al repo. Probado en local.
- Tras estas pruebas, **el examen de kinesiología quedó validado en Atlas**. Antes de presentar hay que correr el reset, o usar el flujo "subir examen", que crea uno nuevo en `Por confirmar`.
