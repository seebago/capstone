# Plan de fases y componentes — WellQ (módulo Exámenes Médicos)

Última actualización: 25 de septiembre de 2026, por Vicente López con Claude.

Este documento traduce el Documento Maestro de Alloxentric (los 7
componentes A–G) y la priorización que Karina mostró en CoreStream
(«DE-FG-ABC») en un plan ejecutable por el equipo (Sebastián, Vicente,
Aron), acotado a los hitos del Capstone. No reemplaza el Documento
Maestro; lo recorta a lo que es defendible construir en las próximas
semanas con tres personas.

## 0. Qué cambió esta sesión (25-09-2026)

- `git fetch --all` sobre `origin`: no hay commits de implementación de
  ningún integrante desde el último estado verificado (`3056608`).
  Apareció una rama nueva `origin/develop` con dos commits triviales
  (crear y luego borrar un `.gitignore`); no contiene código ni avances
  de los componentes A–G. No hay nada que perder ni que fusionar todavía.
- Se leyeron íntegros los 6 documentos que Vicente subió: el modelo de
  datos que envió Max, y los 4 documentos técnicos que ya estaban en el
  repositorio (Documento Maestro, Especificación de Endpoints,
  Estándares Transversales, Clinical Test Upload API). El sexto
  documento (`DART_14_1.1...`) **no pertenece a este proyecto** — ver
  advertencia abajo.
- Este hallazgo resuelve, en la práctica, **ST-011 y AD-01**: Max no está
  preparando un entorno de ejemplo. WellQ ya es un producto en
  producción (la app de la App Store / Play Store), y el proyecto
  Capstone es el módulo «carga, extracción y puntuación de exámenes
  médicos» descrito en el Documento Maestro, que se integra al backend
  existente. El detalle está en `BITACORA_ARQUITECTURA.md` (AD-01) y
  `BITACORA_STAKEHOLDERS.md` (ST-011).

## ⚠️ Advertencia: el documento `DART_14_1.1...docx` no es de WellQ

El sexto archivo subido (`DART_14_1.1_Analisis_Documentacion_
Alcance_Tecnico_Inicial.docx`) es la evidencia técnica de **otro equipo
Capstone** («CoreStream · DART 14», integrantes Fernando Olguea, David
Sepúlveda y Juan Díaz) sobre **otro proyecto de Alloxentric**: un agente
de voz en tiempo real (LiveKit → STT → LLM → TTS, con Speechmatics,
DeepSeek Flash, ElevenLabs, Asterisk y Redis). No menciona exámenes
médicos, WellQ, ni ninguno de los componentes A–G.

Esto probablemente ocurrió al navegar «Mis Archivos» en CoreStream —
la plataforma aloja documentos de los ~40 equipos que trabajan con
Alloxentric (el listado de Workbench que Vicente vio incluye WellQ GLP-1,
WellQ Admin, VoxReady, AgeCare, etc., además de DEM_57). **No se usó
para este plan.** Se registra en `BITACORA_STAKEHOLDERS.md` como
pendiente de confirmar con Karina, por si el archivo correcto de
CoreStream para el equipo DEM_57 quedó mal subido o mal referenciado.

## 1. La arquitectura real de WellQ (evidencia nueva)

El Documento Maestro y la Especificación de Endpoints —ambos fechados
después de la arquitectura v0.1 y el plan de trabajo de la guía 1.5, y
ambos citando «las convenciones actuales de la API de WellQ»— coinciden
en:

| Capa | Stack confirmado por los documentos de Max |
|---|---|
| Backend | **FastAPI** (Python) |
| Base de datos | **MongoDB**, con ODM Bunnet para la mayoría de colecciones y acceso directo por `pymongo` para las de alto volumen (checkins, métricas, logs) |
| Almacenamiento de archivos | **Google Cloud Storage**, URLs firmadas |
| App del paciente | **Flutter**, con **Drift** (SQLite local) para la cola offline de subida |
| Portal clínico | React (stack actual del portal, según el Documento Maestro §3) |

Esto **no es una propuesta del equipo**: es la descripción de un sistema
que ya está en producción, con datos reales de pacientes, clínicas y
ejercicios (`WellQ_Modelo_de_Datos.docx` documenta más de 30
colecciones con datos vigentes: `patients`, `cases`, `appointments`,
`exercises_catalog`, el motor `KineIA` de visión computacional, un
asistente conversacional con RAG, etc.).

### Consecuencia para AD-01

La contradicción registrada en `BITACORA_ARQUITECTURA.md` (NestJS/React
vs. FastAPI/Flutter) queda resuelta a favor de **FastAPI + MongoDB +
Flutter/Drift**, porque es lo que ya corre en producción y a lo que hay
que integrarse — no tendría sentido escribir un backend NestJS paralelo,
ni reemplazar PostgreSQL por algo que WellQ no usa. Se propone como
decisión, no se declara cerrada: falta la ratificación de Karina y,
idealmente, de Max, antes de escribir código (regla del proyecto: no
cambiar tecnología fundamental sin autorización). Ver ADR-006 en
`BITACORA_ARQUITECTURA.md`.

### Tensión nueva: multi-tenancy sin PostgreSQL/RLS

Los requisitos no negociables del proyecto piden aislamiento por
`client_id` "tanto a nivel de API como de base de datos", con RLS de
PostgreSQL como solución preferida. MongoDB no tiene RLS nativo. El
propio documento de Alloxentric («Estándares Transversales») solo exige
que el `client_id` viaje "en cada transacción de la base de datos y en
cada llamada a la API" — no prescribe el motor. Además, el modelo de
datos actual de WellQ usa `clinic_id`, no `client_id`, y no muestra
evidencia de una capa de aislamiento multi-tenant explícita (WellQ
parece operar hoy como una instancia por clínica, no como SaaS
multi-tenant clásico).

Esto es una decisión de arquitectura pendiente, no un defecto: el
componente que este equipo construye sí debe traer aislamiento por
tenant (es un requisito no negociable del Capstone), y como MongoDB no
impone RLS a nivel de motor, el aislamiento tendría que garantizarse en
la capa de aplicación (filtro obligatorio de `client_id`/`tenant_id` en
cada query, inyectado por un middleware o un repositorio base — nunca
confiado al desarrollador de turno) y reforzarse con pruebas
automatizadas que verifiquen que el cliente A nunca ve datos del
cliente B. Se registra como ADR-006 y como pregunta a Karina/Max.

## 2. Los 7 componentes (fuente: Documento Maestro §1.1)

| # | Componente | Qué hace | Estado de partida |
|---|---|---|---|
| A | API de carga | 11 endpoints v1.0: iniciar, refrescar, completar, estado, listar, detalle, editar, eliminar, descargar, listado clínico, revisión | Especificado, sin implementar |
| B | Motor de extracción | LLM multimodal lee el PDF/imagen → JSON estructurado (marcadores, valores, unidades, rangos, descripción) | Nuevo — **fuera de alcance de la spec v1.0**, depende de ST-004 |
| C | Esquema JSON canónico | Contrato de datos normalizado (sangre, orina, imagenología), versionado, unidades canónicas, confianza por campo | Nuevo |
| D | Confirmación y validación | El paciente confirma/corrige en la app; el clínico valida en el portal; nada entra al puntaje sin confirmar | Nuevo |
| E | Motor de puntuación | Subscore 0–100 por marcador, agregación ponderada por pilar (hueso/músculo/articulación/cardio), índice global, versionado y auditable | Nuevo (existen fórmulas de pilar previas que complementa) |
| F | Reportería (portal clínico) | Reporte tabulado por examen + vista longitudinal por marcador, banderas clínicas, exportación PDF | Nuevo |
| G | App del paciente | Cola offline en Drift, worker de subida, pantalla de confirmación, visualización de exámenes propios | Parcialmente especificado (worker de subida) |

El propio Documento Maestro (§1.3) propone un orden de construcción
**A → B+C → D+G → E → F**, con una duración total estimada de 18 a 21
semanas para un equipo con backend, Flutter y frontend de portal
trabajando en paralelo. Ese es el plan completo de Alloxentric para el
producto — no cabe en un Capstone de tres personas con un hito en una
semana.

## 3. La prioridad de Karina («DE-FG-ABC») frente al orden técnico

CoreStream mostró el orden **D → E → F → G → A → B → C**. Ese orden
tiene sentido como **prioridad de valor/demostración** (validación y
puntuación primero, porque son el corazón clínico del producto) pero
**no puede ser el orden de construcción real**: D (confirmación) no
existe sin un dato que confirmar, E (puntuación) no existe sin un
esquema que puntuar, y ninguno de los dos existe sin C (el esquema) y A
(la API que recibe el archivo).

**Se registra como pregunta abierta para Karina (ver
`BITACORA_STAKEHOLDERS.md`)**: si «DE-FG-ABC» es el orden en que
CoreStream espera ver *tickets/avances reportados* (por ejemplo, porque
otros equipos ya tienen A/B/C resuelto y a este equipo le corresponde
construir sobre eso), o si es literalmente el orden de implementación
esperado. Mientras no se aclare, este plan prioriza por **dependencia
técnica**, y marca en cada fase con qué letra de Karina coincide.

## 4. Plan de fases acotado a los hitos de Duoc

| Hito | Fecha | Definición de Alloxentric |
|---|---|---|
| HITO 1 | 28 sep – 3 oct 2026 | MVP con base de datos operativa |
| HITO 2 | 26 – 31 oct 2026 | Todo el proyecto en Docker |
| HITO 3 (Duoc) | 16 – 28 nov 2026 | Proyecto entregado y documentado |
| HITO 3 (Utem) | 30 nov – 4 dic 2026 | Proyecto entregado y documentado |

HITO 1 pide explícitamente "base de datos operativa", no los 7
componentes. Eso apunta directo al **componente C** (esquema) y a un
recorte mínimo del **componente A** (solo lo necesario para probar que
la base de datos recibe y persiste un registro), no al pipeline
completo de extracción y puntuación.

### Fase 1 — HITO 1: esquema y persistencia mínima (objetivo: 28 sep – 3 oct)

Componentes: **C** (principal) + un subconjunto de **A**.

- Definir el esquema JSON canónico de `clinical_test` (componente C),
  reutilizando nombres de campo ya presentes en el modelo de datos real
  de WellQ donde exista equivalencia (p. ej. `patient_id`, `clinic_id`,
  `created_at`, `updated_at`, convención `snake_case`), para no inventar
  variables que ya existen.
- Levantar una base de datos operativa con ese esquema. **Decisión
  pendiente de ratificar con Karina**: MongoDB (alineado con el WellQ
  real) o PostgreSQL (alineado con el requisito no negociable de RLS
  del brief del Capstone). Ver ADR-006.
- Implementar, como máximo, 2–3 de los 11 endpoints de la
  especificación (`POST /clinical-tests` iniciar, `GET /clinical-tests`
  listar, `GET /clinical-tests/{id}` detalle) con datos sintéticos, para
  demostrar que la base de datos está operativa de extremo a extremo.
- Aplicar el filtro de aislamiento por tenant desde el primer endpoint
  (aunque sea con un solo tenant de prueba), para no tener que
  reintroducirlo después.
- **No** construir el motor de extracción (B), el de puntuación (E), el
  portal (F) ni la app completa (G) en esta fase.

### Fase 2 — hacia HITO 2: API de carga completa + esqueleto de app

Componentes: **A** completo + inicio de **G**.

- Completar los 11 endpoints de la especificación de carga.
- Escenarios de aislamiento multi-tenant como prueba automatizada
  obligatoria ("cliente A no accede a datos del cliente B").
- Cola offline mínima en la app (Drift) y worker de subida (parte de G
  ya especificada), suficiente para subir un archivo real desde el
  teléfono al backend.
- Dockerizar backend + base de datos para cumplir HITO 2.

### Fase 3 — Confirmación y esquema completo (D, C completo, resto de G)

- Pantalla de confirmación/corrección en la app (D del lado paciente).
- Validación clínica en el portal (D del lado clínico) — puede ser una
  vista mínima si el portal completo (F) todavía no existe.
- Esquema canónico ampliado a los tres tipos de examen (sangre, orina,
  imagenología).

### Fase 4 — Motor de puntuación (E)

- Requiere que ST-004 (alcance de la IA) y la validación clínica de las
  fórmulas de pilar estén resueltas — de lo contrario se construye un
  motor con pesos no validados. Registrar esa dependencia explícitamente
  si el equipo decide avanzar en paralelo con datos de prueba.

### Fase 5 — Reportería en portal clínico (F) y motor de extracción con LLM (B)

- B se deja para el final a propósito: el propio Documento Maestro lo
  marca "fuera de alcance en la v1.0 actual" y depende de ST-004
  (aprobación del alcance de IA, todavía abierta). Construir A–D–E–F–G
  primero con datos ya estructurados (carga manual o semilla sintética)
  permite demostrar el flujo completo sin necesitar la aprobación de IA
  todavía pendiente.
- Si Alloxentric aprueba antes el alcance de IA, B puede adelantarse.

### Hacia HITO 3 (Duoc y Utem)

- Endurecimiento, batería de evaluación del extractor (si B se
  implementó), pruebas E2E, documentación final (IEEE 830, ERD,
  bitácoras cerradas) y empaquetado para entrega.

## 5. Qué necesita confirmación antes de programar (no se asume)

1. Motor de base de datos para el componente C: MongoDB (alineado a
   WellQ real) vs. PostgreSQL+RLS (alineado al brief del Capstone) —
   **ADR-006**, requiere a Karina y, si es posible, a Max.
2. Qué significa exactamente «DE-FG-ABC» en CoreStream: orden de
   construcción, orden de reporte de avance, o agrupación en sprints.
3. Alcance exacto de "MVP con base de datos operativa" para HITO 1: ¿el
   esquema solo, o el esquema + un endpoint funcional end-to-end?
4. Si el archivo `DART_14...` correspondía a otro equipo por error de
   navegación en CoreStream, o si hay un archivo equivalente
   (`DEM_57_1.1...`) que el equipo todavía no ha creado.
5. Confirmar con Max si el modelo de datos compartido (`WellQ_Modelo_
   de_Datos.docx`) es el estado vigente de producción o una versión de
   referencia, y si el equipo tendrá acceso de lectura al backend real
   o trabajará contra un esquema espejo/sintético.

Todo esto se traslada a `BITACORA_STAKEHOLDERS.md`.
