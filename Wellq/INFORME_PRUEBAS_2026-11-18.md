# Informe de pruebas — WellQ app (`Wellq/`) — 18-11-2026

Rama: `feature/ux-responsive-seguridad-2026-11-18`. Es `fix/seguridad-wellq-app-aron-2026-11-18` rebaseada sobre `origin/develop` (`b7dd9c3`) más los cambios de este informe.
Autor de las pruebas: Claude (Opus 5.5), por encargo de Vicente López. **Pendiente de validación por un integrante humano.**
Datos: solo sintéticos (usuarios demo, PDF `FICTICIA`). Sin MongoDB, se usó el almacenamiento en memoria.

## 1. Resumen

| Área | Resultado |
|---|---|
| Pruebas automatizadas backend (`npm test`) | **21/21 OK** (13 previas + 8 nuevas) |
| Compilación frontend (`tsc --noEmit`, `vite build`) | OK |
| `npm run build` del frontend (`tsc -b`) | **Falla**, por 8 errores en `src/components/tabs/*` (archivos de Aron que no se importan en ninguna parte). No los introduce esta rama. |
| Flujo demo contra el servidor real (curl) | OK: login, listar, subir PDF, confirmar, validar |
| Flujo demo en navegador (escritorio 1280px) | OK: login paciente → confirmar (200) → cambio de rol → validar (200) |
| Layout móvil (375px) y escritorio (1100/1280/1440px) | OK, revisado a ojo con capturas |
| Chat flotante | OK: arrastre, apertura, cierre, conversación conservada, **0 llamadas de red** |
| Dark/light y es/en | OK en las pantallas revisadas |

## 2. Pruebas automatizadas (`Wellq/Back-end/test/security.test.ts`)

Comando: `cd Wellq/Back-end && npm ci && npm test` (node:test + tsx; no requiere MongoDB).

| Suite | Prueba | Resultado |
|---|---|---|
| autenticación | Login con contraseña incorrecta → 401 | OK |
| | El JWT trae `user_id`, `role` y `client_id` | OK |
| | Las 8 rutas de `/api/exams` sin token → 401 | OK |
| | Token firmado con otro secreto o con tenant alterado → 401 | OK |
| multi-tenancy | Listar ignora `?client_id=` | OK |
| | Leer examen y archivo de otro tenant → 404, en ambos sentidos | OK |
| | Modificar examen de otro tenant → 404 y el examen no cambia | OK |
| | Al subir se ignoran `client_id` y `patient_id` del body | OK |
| RBAC | Paciente no valida (403); clínico no confirma ni sube (403) | OK |
| | Flujo confirmar → validar; el actor sale del token | OK |
| auditoría | Intento cruzado registrado con las 5 dimensiones; entrada congelada | OK |
| | Login fallido auditado sin la contraseña | OK |
| **acceso directo por URL** (nueva) | GET directo sin token a `/api/exams`, `/demo-pdf`, `/:id`, `/:id/file` (ambos tenants), rutas inexistentes y `?client_id=` → 401. Rutas inexistentes también dan 401, así no se puede enumerar sin sesión. | OK |
| | Token en la URL (`?token=`, `?access_token=`) no sirve; con header sí (control positivo) | OK |
| | Header sin `Bearer`, `Bearer` vacío, `Basic`, `alg: none`, token vencido y emisor distinto → 401 | OK |
| | Token bien firmado pero con rol inventado (`admin`) → 401 | OK |
| | `/demo-pdf` y `/:id/file` con token respetan el tenant | OK |
| **validación de entrada** (nueva) | Subir HTML disfrazado (tipo distinto, firma no-PDF, no-base64, PNG declarado con PDF real) → 400 | OK |
| | `decision` desconocida → 400 `INVALID_DECISION` | OK |
| | `reason` que no es texto (p. ej. `{ "$gt": "" }`) → 400 | OK |

## 3. Pruebas manuales realizadas

**Contra el servidor real** (`PORT=5001`, sin MongoDB):
- Sin token: `/api/exams` → 401, `/api/exams/demo-pdf` → 401, `/api/exams/mem-eval-kine-1/file` → 401.
- Con token: `/demo-pdf` → 200 `application/pdf`.
- Paciente: lista 4 exámenes, sube un PDF real, confirma (`confirmed_by_patient`).
- Clínico: valida (`clinically_validated`).

**En navegador** (Vite 5174, proxy a 5001):
- Escritorio 1100–1440px:
  - Barra lateral en vez de barra inferior.
  - Tabla con columnas Fecha / Nombre / ID / Revisión / Estado, sin desbordar.
  - Vista clínica con KPIs en una fila y archivos en grilla de 2 columnas.
- Móvil 375px: una columna, barra inferior, sin scroll horizontal (`scrollWidth = 375`). Columnas ID y Revisión ocultas.
- Chat:
  - Se arrastra y no se abre al soltar.
  - Un clic lo abre; el aviso DEMO queda visible.
  - Enviar "kinesio" responde sin ninguna petición de red (revisado en la pestaña de red).
  - Al cerrar vuelve el ícono y la conversación se conserva (3 mensajes).
- Recargar la página vuelve al login, porque el JWT vive solo en memoria y no hay datos sin sesión.
- Cambio de rol desde Perfil:
  - Genera un nuevo `POST /api/auth/login`.
  - La vista clínica carga con el token del clínico.
- Inglés + light mode en móvil: textos nuevos traducidos, colores del tema claro.

## 4. Rutas protegidas en el frontend

La app no usa React Router: no hay rutas de URL, solo estado.
- **Sin sesión:** `App.tsx` devuelve únicamente `LoginView` cuando `isLoggedIn` es falso. No hay ninguna URL del frontend que muestre datos sin sesión.
- **Fin de sesión:** el JWT vive en memoria. Al recargar, al cerrar sesión o ante un 401 del backend se vuelve al login y se vacía la lista de exámenes. El vaciado ante 401 es nuevo.
- **Límite:** la protección real es la del backend. El frontend solo evita mostrar pantallas vacías.

## 5. Vulnerabilidades y hallazgos

### Arreglados en esta rama

| # | Hallazgo | Arreglo |
|---|---|---|
| V1 | **XSS almacenado contra el clínico.** El backend aceptaba cualquier `file_data`, y `ClinicianView` lo escribía con `document.write` dentro de un `<iframe>` en una ventana del mismo origen. | Backend: el data URL debe ser base64 del mismo tipo declarado y con firma real de PDF/PNG/JPEG. Frontend: se abre como Blob con tipo validado. |
| V2 | El cambio de rol en Perfil solo cambiaba la vista; el token seguía siendo del rol anterior. El backend respondía 403, así que no había fuga, pero la demo se veía rota. | El cambio de rol ahora inicia sesión de nuevo y obtiene un JWT nuevo. |
| V3 | Ante un 401 se cerraba la sesión, pero los exámenes quedaban en memoria. | Se vacían. |
| V4 | Una `decision` desconocida terminaba como "rechazado"; `reason` no se validaba. | 400. |
| V5 | `DEMO_PDF_PATH` apuntaba a `front-end/` en minúscula, lo que fallaría en Linux o en un deploy. | Se corrigió a `Front-end/`. |

### Pendientes (documentados, NO arreglados: requieren decisión del equipo)

| # | Hallazgo | Riesgo | Propuesta |
|---|---|---|---|
| P1 | **No hay máquina de estados en el backend.** El clínico puede validar un examen que el paciente no confirmó. El paciente puede volver a "confirmar" un examen ya validado y lo regresa a `confirmed_by_patient`. | Integridad del flujo de doble verificación. | Devolver 409 en transiciones inválidas. Es una regla de negocio, así que la deben aprobar el equipo o Alloxentric. |
| P2 | `public/evaluacion-kinesiologica-FICTICIA.pdf` es accesible sin login. El botón "Descargar examen ficticio" y el visor lo usan directamente, no `/api/exams/demo-pdf`. | Bajo: es un documento ficticio. | Aceptarlo como material demo o servirlo solo por la API. |
| P3 | CORS `*`, sin límite de intentos en `/api/auth/login` y sin cabeceras de seguridad (helmet/CSP). | Fuerza bruta de la contraseña demo; endurecimiento general. | `express-rate-limit` y `helmet`; restringir el origen en el deploy. |
| P4 | La contraseña demo está en el frontend (entrada con dos botones). | No es autenticación de identidad real. | Decisión vigente para la demo; un formulario real queda para después. |
| P5 | El chat simulado contiene frases de orientación clínica ("Se recomienda continuar los ejercicios…"). | Roza ST-004 (sin recomendación clínica), aunque sea texto fijo. | Que el equipo revise el texto; no se cambió para no tocar contenido sin aprobación. |
| P6 | `ProfileModal` muestra al paciente demo como "Aron Germain Navarro", con NHS y fecha de nacimiento inventados. | Usar el nombre real de un integrante en datos "sintéticos". | Reemplazar por un nombre ficticio. |
| P7 | `src/components/tabs/*` no se usa y rompe `npm run build`. `PrescriptionsTab` también usa `document.write` con datos interpolados. | Build roto; posible XSS si se reactivan. | Que Aron decida si se borran o se arreglan. |
| P8 | Auditoría fail-open y sin inmutabilidad real a nivel de BD. | Ya documentado en la entrega anterior. | Sigue pendiente (A-08 / ST-007). |

## 6. Pendiente de probar a mano antes del sábado 21

1. Correr en una máquina limpia (de preferencia la de la presentación). En el Mac de Vicente el puerto 5000 lo ocupa AirPlay, por eso se usa 5001:
   ```bash
   cd Wellq/Back-end && npm ci && PORT=5001 npm run dev
   ```
   ```bash
   cd Wellq/Front-end && npm ci && VITE_API_TARGET=http://localhost:5001 npm run dev
   ```
2. **Subir un archivo con el selector de la UI** (clic real en "Subir archivo de examen"). Se probó la misma llamada a la API, no el diálogo de archivos.
3. "Descargar archivo" en la vista clínica: el navegador integrado bloquea las ventanas emergentes, así que no se vio abrir. Revisar en Chrome/Safari que el PDF abra en otra pestaña.
4. Arrastrar la burbuja del chat **con el dedo en un celular real**. Solo se probó con mouse y emulación móvil.
5. Rango 1025–1100px y tablets: revisar que la tabla de escritorio no se apriete demasiado.
6. Con MongoDB real (Atlas o local): repetir login → subir → confirmar → validar. Esta ronda se probó solo en memoria; la ronda anterior sí probó MongoDB local.
7. Marcar con error y rechazar desde la UI clínica: solo están cubiertos por la API.
8. Que un integrante humano valide este informe y la fila de aporte IA en `BITACORA_PROGRESO.md`.
