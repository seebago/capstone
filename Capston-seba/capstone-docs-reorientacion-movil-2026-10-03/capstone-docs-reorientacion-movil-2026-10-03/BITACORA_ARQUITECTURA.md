# Bitácora de arquitectura — WellQ

## Actualización vigente de orientación — 2026-10-03

Por instrucción de Sebastián: producto principal móvil; portal médico web propuesto; flujo objetivo archivo → extracción → análisis preliminar/prediagnóstico → usuario y médico designado. El MVP existente queda en pausa y su nueva entrega por definir. PostgreSQL/MongoDB siguen en evaluación; no hay migración acordada. El detalle clínico se abordará al llegar a `H-IA-01`, avisando previamente a Sebastián.

Ver [bases actualizadas](BASES_PROYECTO_2026-10-03.md) y [evaluación de base de datos](EVALUACION_BD_2026-10-03.md). Esta orientación sustituye las prioridades internas incompatibles descritas abajo. El contenido anterior se conserva como antecedente; no acredita aprobación externa del cambio de alcance ni de fechas.

## Antecedentes anteriores al cambio de orientación

Última actualización: 25 de septiembre de 2026.

Registra qué está **decidido**, qué está **condicionado**, qué está
**postergado** y qué está **en contradicción**. El detalle técnico vive
en `COMPARACION_ARQUITECTURAS_WELLQ.md` v0.1.

## Advertencia de estado

La arquitectura v0.1 es una **propuesta redactada con asistencia de IA y
no ratificada** por el equipo ni por Alloxentric. Ninguna decisión está
implementada. Este documento no acredita implementación.

Max Khreimerman prepara además un backend y un frontend cuyo alcance no
está confirmado (ST-011). Si resulta ser la base del proyecto y no un
ejemplo, varias decisiones deberán revisarse contra lo que él entregue.

## Contradicciones abiertas

**AD-01 — El stack de la arquitectura v0.1 no coincide con el de la guía 1.5.**

| Componente | COMPARACION_ARQUITECTURAS_WELLQ.md | Plan de trabajo de la guía 1.5 |
|---|---|---|
| Backend | NestJS + TypeScript | FastAPI / Python |
| Frontend | React + TypeScript + Vite | Flutter |

Ambos documentos están vigentes en el repositorio y dicen cosas
distintas. Esto no es un detalle: cambia el lenguaje, el ecosistema de
librerías, el modelo de despliegue y el reparto de tareas del equipo.

Debe cerrarse antes de escribir la primera línea de código, y la decisión
debe tomar en cuenta qué entregue Max (ST-011). Mientras no se resuelva,
ninguna de las dos opciones puede darse por vigente.

**Actualización 25-09-2026 — evidencia nueva de Max, AD-01 en camino a
resolverse.** Max compartió `WellQ_Modelo_de_Datos.docx` (el modelo de
datos vigente de WellQ) y el Documento Maestro/especificaciones de
endpoints ya en el repositorio citan explícitamente "las convenciones
actuales de la API de WellQ (FastAPI, MongoDB, Google Cloud Storage)" y
"Flutter con Drift". Esto no es una tercera propuesta: es la descripción
de un sistema en producción (WellQ ya está en App Store y Play Store).
Karina confirmó en reunión que el proyecto del equipo es un módulo de
ese sistema, no un desarrollo greenfield — lo que resuelve ST-011 en el
mismo sentido.

**Ninguna de las dos opciones de AD-01 (NestJS/React ni FastAPI/Flutter
"genérico") queda vigente tal cual estaban escritas.** Se propone
adoptar **FastAPI + MongoDB + Google Cloud Storage + Flutter/Drift**
por ser lo que ya existe, coherente con la regla del proyecto de "no
reconstruir lo que ya existe". Esto es una **propuesta pendiente de
ratificación** de Karina (y, si es posible, de Max) antes de programar,
no una decisión cerrada unilateralmente — ver ADR-006. Detalle completo
y consecuencias en `PLAN_FASES_COMPONENTES.md` §1.

## Requisitos no negociables

Multi-tenancy por `client_id`, RBAC granular, feature gating validado en
backend, auditoría de cinco dimensiones, API-First, i18n y light/dark
mode. Vienen del cliente y no se reabren sin autorización.

## Decisiones propuestas

| ID | Decisión | Estado | Ratifica |
|---|---|---|---|
| A-01 | API-First, REST versionada con contrato OpenAPI | Propuesta | Equipo |
| A-02 | Backend: NestJS o FastAPI | **En contradicción (AD-01)** | Equipo |
| A-03 | Frontend: React/Vite o Flutter | **En contradicción (AD-01)** | Equipo |
| A-04 | PostgreSQL con `client_id` + RLS, esquema compartido | **En tensión con A-16** — ver nota | Equipo |
| A-16 | MongoDB, alineado al stack real de WellQ (Max, 25-09) | **Nueva, en tensión con A-04** | Equipo, pendiente de ratificar |
| A-05 | Supabase como hosting inicial | Condicionada a ST-002 | Alloxentric |
| A-06 | Supabase Auth tras interfaz `IdentityProvider` | Condicionada a ST-002 | Alloxentric |
| A-07 | Feature gating con HTTP 403 + código de dominio, no 402 | Propuesta | Equipo |
| A-08 | Auditoría append-only con outbox transaccional | Condicionada a ST-007 | Alloxentric |
| A-09 | Separación lógica de identidad y datos clínicos | Propuesta | Equipo |
| A-10 | AI Gateway con adaptador simulado hasta aprobar caso de uso | Condicionada a ST-004 | Alloxentric |
| A-13 | Despliegue en Vercel | Nueva, condicionada a ST-002 | Karina lo recomendó el 7 de septiembre |
| A-14 | NVIDIA como proveedor de inferencia tras el AI Gateway | Nueva, condicionada a ST-004 | Karina habilitó el acceso |
| A-15 | Extracción estructurada de exámenes mediante LLM multimodal | **Nueva, condicionada a ST-004** | Alloxentric |
| A-11 | Schema-per-tenant y claves por tenant | Postergada | Reabrir por contrato o amenaza |
| A-12 | Almacenamiento WORM para auditoría | Postergada | Reabrir por ST-007 |

## Notas sobre A-13, A-14 y A-15

**Vercel.** Aloja bien un frontend. Un backend y una base PostgreSQL
necesitan solución aparte, así que Vercel no reemplaza por sí solo la
decisión de hosting de datos: la complementa.

**NVIDIA.** El acceso queda detrás del AI Gateway, nunca invocado
directamente desde el frontend. La NVAPI key es un secreto de servidor y
no se versiona.

**A-04 vs. A-16.** El brief del Capstone pide RLS de PostgreSQL como
solución preferida de multi-tenancy; el WellQ real usa MongoDB, que no
tiene RLS nativo. El propio documento de Alloxentric ("Estándares
Transversales y Capacidades Comerciales") solo exige que el `client_id`
viaje "en cada transacción de la base de datos y en cada llamada a la
API" — no prescribe el motor. Si se ratifica A-16, el aislamiento por
tenant debe garantizarse en la capa de aplicación (filtro obligatorio de
tenant inyectado por middleware/repositorio base, nunca dejado al
criterio de quien escribe la query) y verificarse con pruebas
automatizadas de "cliente A no accede a datos del cliente B", ya que el
motor de base de datos no lo impone por sí solo. Detalle en
`PLAN_FASES_COMPONENTES.md` §1.

**A-15 es la decisión más sensible del proyecto.** La guía 1.5 sitúa la
extracción de datos desde exámenes médicos mediante un LLM multimodal en
el centro del objetivo general, mientras el alcance de la IA sigue sin
aprobación del cliente (ST-004). El plan de trabajo ya incorpora dos
resguardos correctos —usar datos ficticios o anonimizados, y no incluir
diagnóstico automático ni recomendaciones terapéuticas— que deben
mantenerse. Enviar datos clínicos identificables a un proveedor externo
exige base jurídica, contrato y minimización, ninguno de los cuales
existe hoy.

## Invariantes de diseño a respetar al implementar

- Toda entidad de cliente lleva `client_id NOT NULL`.
- Referencias compuestas `(client_id, id)` para impedir referencias cruzadas entre tenants.
- El `client_id` efectivo se deriva de identidad verificada en backend, nunca de una cabecera, URL o cuerpo.
- Contexto de tenant local a la transacción, nunca a nivel de sesión de una conexión reutilizada.
- `FORCE ROW LEVEL SECURITY`; el rol de runtime sin `BYPASSRLS` ni propiedad de tablas.
- Denegar por defecto: una tabla nueva sin política no queda accesible.
- Un UUID difícil de adivinar no es autorización.

## ADR pendientes de redactar

| ADR | Tema | Depende de |
|---|---|---|
| ADR-001 | Stack: backend y frontend definitivos | AD-01, ST-011 |
| ADR-002 | Estrategia de multi-tenancy | — |
| ADR-003 | Proveedor de identidad y hosting | ST-002 |
| ADR-004 | Modelo de auditoría | ST-007 |
| ADR-005 | Alcance y frontera de IA | ST-004 |
| ADR-006 | Motor de base de datos: MongoDB (alineado a WellQ real) vs. PostgreSQL+RLS (alineado al brief del Capstone) | AD-01, A-04, A-16 |

Formato: contexto, problema, alternativas, decisión, consecuencias.
Ubicación: `docs/adr/`.

## Registro de cambios

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-09-05 | Arquitectura v0.1 propuesta | Sebastián, con ChatGPT y Gemini |
| 2026-09-07 | Incorporación de Vercel (A-13) y NVIDIA (A-14) | Vicente, con Claude |
| 2026-09-10 | Detección de AD-01 y registro de A-15 | Vicente, con Claude |
| 2026-09-25 | Evidencia de Max (modelo de datos + documentos técnicos) apunta AD-01 hacia FastAPI+MongoDB+Flutter/Drift; registro de A-16, tensión A-04 vs A-16 y ADR-006 | Vicente, con Claude |
