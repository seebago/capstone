# Bitácora de stakeholders — WellQ

Última actualización: 30 de septiembre de 2026.

Registra decisiones que **no** puede tomar el equipo. Una ausencia de
respuesta no equivale a aprobación. No se inventa una respuesta para
avanzar: se registra el bloqueo y se pregunta.

Estados: `abierto` · `preguntado` · `parcial` · `respondido` · `validado`.

## Contrapartes

| Persona | Rol | Canal |
|---|---|---|
| Karina Álvarez | Docente a cargo **y** representante de Alloxentric | Correo y reunión de los lunes 17:00 |
| Max Khreimerman | Contraparte Alloxentric | Vía líder de equipo |

La información con Alloxentric se canaliza por el líder de equipo,
Vicente López.

## CoreStream (plataforma de gestión de Alloxentric)

El equipo fue incorporado a CoreStream (corestream.alloxentric.com),
donde Alloxentric gestiona los ~40 equipos/proyectos Capstone en curso.
Código de equipo/proyecto: **DEM_57**. Rol de Vicente: **TEAM_LEADER**.

Fechas hito comunicadas por Karina (correo "Fechas Hito Alloxentric",
21-09-2026):

| Hito | Fecha | Entregable |
|---|---|---|
| HITO 1 | 28 sep – 3 oct 2026 | MVP con base de datos operativa |
| HITO 2 | 26 – 31 oct 2026 | Todo el proyecto en Docker |
| HITO 3 (Duoc) | 16 – 28 nov 2026 | Proyecto entregado y documentado |
| HITO 3 (Utem) | 30 nov – 4 dic 2026 | Proyecto entregado y documentado |

Ver el plan de fases y componentes acotado a estos hitos en
`PLAN_FASES_COMPONENTES.md`.

## Respondido

| ID | Asunto | Respuesta | Quién | Fecha | Qué falta |
|---|---|---|---|---|---|
| ST-013 | Líder de equipo | Vicente López | Karina | 2026-09-07 | — |
| ST-014 | Infraestructura de IA | API key gratuita de NVIDIA; Alloxentric usa DeepSeek | Karina | 2026-09-07 | Nada en lo técnico |
| ST-015 | Plataforma de despliegue | Vercel, recomendado | Karina | 2026-09-07 | Si la cuenta la provee Alloxentric o va en plan gratuito |
| ST-011 | Alcance del backend/frontend de Max | Karina confirmó en reunión (CoreStream) que el proyecto es un módulo del WellQ existente, no un entorno de ejemplo aparte. Max compartió el modelo de datos real y el Documento Maestro/especificaciones ya en el repo describen el stack vigente (FastAPI, MongoDB, GCS, Flutter/Drift). | Karina / Max | 2026-09-25 | Ratificación formal del stack (ADR-006) y si el equipo tendrá acceso de lectura al backend real o trabajará contra un esquema espejo |

## Pendientes con Alloxentric

| ID | Asunto | Por qué bloquea | Estado |
|---|---|---|---|
| ST-004 | Qué hará exactamente la IA en WellQ | La guía 1.5 ya sitúa la extracción con LLM en el objetivo general (A-15) | **Abierto — prioritario** |
| ST-002 | Quién paga la infraestructura, y dónde vive la base de datos si el despliegue es en Vercel | Cierra la decisión sobre Supabase | Parcial |
| ST-012 | Residencia de datos: Vercel y NVIDIA procesan fuera de Chile | Con datos sintéticos no hay problema; con datos reales abre la cadena UK/Chile | Abierto |
| ST-003 | Datos permitidos en desarrollo y demostraciones | Diseño de BD y demostraciones | Abierto |
| ST-001 | Alcance esperado el 12 de septiembre | Planificación de la semana | Abierto |
| ST-005 | Tiers comerciales reales | Feature gating no se puede modelar | Abierto |
| ST-006 | ¿WellQ custodia la ficha clínica oficial? | Retención de 15 años (Ley 20.584) y responsabilidad | Abierto |
| ST-007 | Auditoría: ¿append-only en el MVP o WORM desde el inicio? | Cambia el diseño de auditoría | Abierto |
| ST-008 | Entidades legales y países de operación | Transferencias UK↔Chile y base jurídica | Abierto |
| ST-009 | Anonimización de datos médicos | Diseño de las tablas de identidad | Abierto |
| ST-010 | Quién aprueba requerimientos y mantiene el sistema tras el Capstone | Gobierno del proyecto | Abierto |
| ST-016 | Motor de base de datos definitivo: MongoDB (alineado a WellQ real, según docs de Max) o PostgreSQL+RLS (alineado al brief del Capstone) — ADR-006 | Sebastián ya construyó y probó la capa de reglas (D/E); no puede persistir nada de HITO 1 sin esta decisión | **Abierto — urgente, bloquea HITO 1 en curso** |
| ST-017 | Qué significa exactamente el orden «DE-FG-ABC» mostrado en CoreStream: ¿orden de construcción, orden de reporte de avance en CoreStream, o agrupación en sprints? | El orden técnico defendible (A→C→D/G→E→F) no coincide literalmente con ese orden | **Abierto — prioritario** |
| ST-018 | Alcance exacto de "MVP con base de datos operativa" para HITO 1 (28 sep–3 oct): ¿solo el esquema, o esquema + al menos un endpoint funcionando de punta a punta? | Define qué se puede prometer para el 3 de octubre | **Abierto — urgente, hito en una semana** |
| ST-019 | El archivo `DART_14_1.1_Analisis_Documentacion...docx` subido a este chat corresponde a otro equipo (CoreStream DART 14) y a otro proyecto de Alloxentric (agente de voz, no WellQ). Confirmar si fue un error de navegación en CoreStream y si existe un archivo equivalente para el equipo DEM_57 | Evita construir sobre información que no es de este proyecto | Abierto |
| ST-020 | Descalce de calendario: el equipo recibió el modelo de datos completo y la confirmación de que el proyecto es un módulo del WellQ existente recién entre el 23 y el 29 de septiembre, con HITO 1 (Alloxentric) venciendo el 3 de octubre. La capa de reglas D/E ya está construida y probada (rama `feature/wellq-base-de-fg-abc`), pero una base de datos operativa real depende de ST-016, todavía sin resolver | Puede impedir cumplir HITO 1 en la fecha tal como está definido; corresponde informarlo con evidencia antes de la fecha, no explicarlo después | **Abierto — comunicar a Karina esta semana** |

## Pendientes académicos

| ID | Asunto | Estado |
|---|---|---|
| DOC-001 | ¿El informe de Fase 1 es uno por grupo o uno por integrante? La guía 1.5 quedó en Evidencias Grupales, pero los indicadores 2 y 3 de la rúbrica evalúan la relación con el perfil de egreso y los intereses **personales** de cada estudiante | **Abierto — afecta la entrega del 12** |
| DOC-002 | Fecha exacta de entrega: la plataforma dice «sin fecha» | Abierto |
| DOC-003 | Exposición: duración y si se exige archivo de presentación | Abierto |

## Registro de respuestas

Una respuesta sin criterio de aceptación observable no está cerrada.

| ID | Respuesta | Quién | Fecha | Requisito derivado | Criterio de aceptación |
|---|---|---|---|---|---|
| ST-013 | Vicente López es líder de equipo | Karina | 2026-09-07 | Canalización de información con Alloxentric | Correo del 7 de septiembre |
| ST-014 | IA vía NVIDIA, sin costo | Karina | 2026-09-07 | AI Gateway con proveedor NVIDIA (A-14) | Correo del 7 de septiembre con pasos de acceso |
| ST-015 | Vercel como plataforma de despliegue | Karina | 2026-09-07 | Decisión A-13, condicionada | Pendiente de confirmar quién provee la cuenta |
