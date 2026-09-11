# Bitácora de stakeholders — WellQ

Última actualización: 10 de septiembre de 2026.

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

## Respondido

| ID | Asunto | Respuesta | Quién | Fecha | Qué falta |
|---|---|---|---|---|---|
| ST-013 | Líder de equipo | Vicente López | Karina | 2026-09-07 | — |
| ST-014 | Infraestructura de IA | API key gratuita de NVIDIA; Alloxentric usa DeepSeek | Karina | 2026-09-07 | Nada en lo técnico |
| ST-015 | Plataforma de despliegue | Vercel, recomendado | Karina | 2026-09-07 | Si la cuenta la provee Alloxentric o va en plan gratuito |

## Pendientes con Alloxentric

| ID | Asunto | Por qué bloquea | Estado |
|---|---|---|---|
| ST-011 | Alcance del backend y frontend que prepara Max: ¿ejemplo, base del proyecto o entorno completo? ¿Cuándo lo entrega? | Define si el equipo escribe código propio y con qué stack | **Abierto — prioritario** |
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
