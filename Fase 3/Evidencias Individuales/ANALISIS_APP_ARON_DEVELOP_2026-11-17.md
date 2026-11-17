# Análisis de la app de Aron (`develop`) para defensa — 17 de noviembre de 2026

Documento de estudio para que Vicente pueda explicar y defender ante la comisión lo que hay implementado en `Wellq/` dentro de la rama `develop`, basado en lectura directa del código fuente (no en suposiciones). Preparar esto es necesario porque la app no es la misma arquitectura descrita en AD-01 (FastAPI + MongoDB + RLS), y la comisión puede preguntar por los requisitos no negociables (Multi-Tenancy, RBAC, JWT, Feature Gating, Auditoría).

## 1. Qué es, en una frase

Un **prototipo de interfaz** (frontend React + backend Node de soporte) que simula el flujo de un paciente/clínico revisando exámenes médicos sintéticos — hecho por Aron, independiente del MVP FastAPI de Sebastián (`wellq-base`), que sigue intacto en `Fase 2/.../wellq-base/`.

## 2. Stack real (verificado en el código, no en el PLAN original)

| Capa | Tecnología | Evidencia |
|---|---|---|
| Frontend | React 19 + Vite 8 + TypeScript, sin librería de manejo de estado (todo con `useState`/`useEffect` en `App.tsx`) | `Wellq/Front-end/package.json` |
| Backend | Node.js + Express + TypeScript, Mongoose como ORM | `Wellq/Back-end/package.json`, `src/server.ts` |
| Base de datos | MongoDB **opcional**: si no conecta, cae a un arreglo en memoria con datos ficticios fijos (`memoryExams`) | `src/config/db.ts`, `src/routes/exams.routes.ts` líneas 36-100 |
| Estilos | CSS plano con variables (`App.css`, `index.css`), soporta tema claro/oscuro guardado en `localStorage` | `App.tsx` líneas 16-19 |
| i18n | Objeto de traducciones `es`/`en` en `locales/translations.ts`, sin textos hardcodeados visibles en los componentes revisados | `LoginView.tsx` (usa `t.xxx` en todo) |

**Importante:** esto corre independiente de `wellq-base` (el FastAPI de Sebastián). Son dos backends distintos en el mismo repo — no se integran entre sí.

## 3. Cómo correrlo (para practicar antes del sábado)

```
# Terminal 1
cd ~/Desktop/Capstone/Wellq/Back-end && npm run dev   # http://localhost:5000

# Terminal 2
cd ~/Desktop/Capstone/Wellq/Front-end && npm run dev # http://localhost:5173
```

El frontend ya tiene configurado un proxy de Vite (`vite.config.ts`) que reenvía `/api/*` al backend en el puerto 5000. No se necesita `.env`, ninguna de las dos apps lo requiere.

## 4. Flujo de pantallas

1. **LoginView**: sin usuario/contraseña. Es un selector de rol: boto�nn "Entrar como paciente" o "Entrar como clínico" (`LoginView.tsx`). No hay autenticación real — es puro UI.
2. Tras elegir rol, entra a la app con `BottomNav` con dos pestañas: **Exams** (`ExamsView`/`ClinicianView` según rol) y **Chat** (`ChatView`).
3. `ExamsView` / `ClinicianView`: lista de exámenes traídos de `GET /api/exams?client_id=clinic-alpha` (cliente **hardcodeado** en el frontend, ver hallazgo #2 abajo). Permite subir un documento (`UploadModal`), ver el PDF (`PdfViewer`), confirmar/validar según rol.
4. `ChatView`: asistente conversacional que se presenta como "WellQ AI Clinical Assistant" y responde preguntas sobre síntomas/resultados con interpretaciones simuladas (ya documentado en `BITACORA_STAKEHOLDERS.md` como ST-032).
5. `MenuDrawer`, `ProfileModal`, `TopBar`: navegación auxiliar, cambio de idioma/tema, logout.

## 5. Endpoints del backend (`Wellq/Back-end/src/routes/exams.routes.ts`)

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/exams/demo-pdf` | Sirve el PDF ficticio de ejemplo |
| GET | `/api/exams` | Lista exámenes filtrados por `client_id` (query param) |
| GET | `/api/exams/:id` | Un examen por id |
| GET | `/api/exams/:id/file` | Descarga/visualiza el archivo asociado |
| POST | `/api/exams/upload` | Sube un nuevo documento (PDF/imagen) |
| POST | `/api/exams/:id/range-review` | Ejecuta la comparación de rangos de referencia |
| PATCH | `/api/exams/:id/confirm` | El paciente confirma el examen |
| PATCH | `/api/exams/:id/validate` | El clínico valida el examen |

## 6. Hallazgos importantes para la defensa (léelos bien, te los pueden preguntar)

**6.1 — No hay autenticación ni RBAC real, aunque la dependencia está instalada.**
`jsonwebtoken` figura en `package.json` del backend, pero no se usa en ningún archivo (`grep` de "jwt"/"auth"/"token" en todo `src/` no encontró nada). El login es un botón que fija un rol en el estado de React, sin verificación de servidor.

**6.2 — El aislamiento multi-tenant es decorativo, no real.**
El frontend manda siempre `client_id=clinic-alpha` fijo en el código (`App.tsx`, función `fetchExams`). El backend sí filtra `GET /api/exams` por ese `client_id`, pero:
- Viene de un **query param que cualquiera puede cambiar** (sin JWT que lo certifique).
- `GET /api/exams/:id` y `GET /api/exams/:id/file` **no filtran por `client_id` en absoluto** — cualquiera que tenga o adivine un id puede ver el examen de "otro cliente". Esto contradice directamente el requisito no negociable de Multi-Tenancy por `client_id` con aislamiento a nivel de API.

**6.3 — No hay auditoría inmutable real.**
El modelo `Exam` tiene un campo `audit_trail`, pero es solo un array dentro del mismo documento mutable — no es un registro separado, trazable e inalterable como pide la arquitectura.

**6.4 — El asistente de IA clínica (`ChatView`) no está aprobado.**
Ya documentado como ST-032 en `BITACORA_STAKEHOLDERS.md`. Responde con interpretaciones clínicas simuladas de marcadores (ej. hemoglobina), colisionando con ST-004 (abierto).

**6.5 — Higiene de repositorio.**
~217 archivos de build (`dist/`) comiteados sin `.gitignore` en `Wellq/`.

## 7. Qué decir si la comisión pregunta por esto (sugerencia, ajústalo a tu estilo)

> "Esta interfaz es un prototipo de experiencia de usuario (Fase 3, en evaluación de flujo paciente/clínico), construido en paralelo al MVP base del proyecto. La arquitectura de seguridad obligatoria del proyecto — multi-tenancy real con Row-Level Security, RBAC con JWT, auditoría inmutable — está definida como decisión arquitectónica (AD-01) sobre el stack FastAPI + MongoDB + PostgreSQL/RLS, y es ahí donde se está implementando y verificando, no en este prototipo de UI. Identificamos como equipo que este prototipo todavía no integra esas capas de seguridad, y lo tenemos registrado como pendiente antes de considerarlo parte de la base de producción."

Esta respuesta es honesta: no inventa una integración que no existe, y muestra que el equipo sabe diagnosticar su propio código — que es parte de lo que evalúa RA3.

## 8. Preguntas probables y cómo responderlas

- **"¿Cómo evitan que un cliente vea los datos de otro?"** → Hoy: no completamente, es un hallazgo abierto (6.2). En el stack base sí se diseñó con `client_id` + RLS en PostgreSQL (ver `BITACORA_ARQUITECTURA.md`).
- **"¿Dónde está el JWT?"** → Instalado como dependencia pero no implementado en este prototipo; el login es solo selección de rol sin verificación de servidor.
- **"¿La IA da diagnósticos reales?"** → No, son respuestas de ejemplo con datos sintéticos fijos; la IA clínica real sigue sin aprobación de Alloxentric (ST-004).
- **"¿Por qué hay dos backends (FastAPI y Node)?"** → Son dos iniciativas en paralelo dentro del mismo repo: `wellq-base` (FastAPI, acordado en AD-01) y este prototipo de Node que sirve de soporte a la interfaz de Aron. Está documentado como contradicción arquitectónica abierta, pendiente de decisión de equipo.
