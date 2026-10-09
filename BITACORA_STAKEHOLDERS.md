# Bitácora de stakeholders — WellQ

Última actualización: 7 de octubre de 2026.

> **Giro importante (3 de octubre, en sala de clases).** El profesor
> aclaró presencialmente que el equipo debe priorizar el **cronograma de
> DuocUC**, no el de Alloxentric. El profesor está intercediendo
> internamente por la sobrecarga que Alloxentric ha puesto sobre los
> equipos, señalando que no corresponde presionar a estudiantes con
> plazos de ritmo empresarial. El equipo cumplirá con Alloxentric, pero
> sin apurarse ni sacrificar calidad — ver ST-020 actualizado más abajo.
>
> **Precisión importante (5 de octubre, reunión con Karina).** Lo
> anterior **no** significa que el despliegue pueda esperar. Karina fue
> enfática: Alloxentric necesita poder testear cada funcionalidad a
> medida que se construye, no solo al final — el despliegue es continuo,
> no un evento único al cierre. La fecha de **entrega final del MVP**
> quedó acordada entre semana 12 y semana 15 (ver ST-024 actualizado),
> pero el **despliegue para testing** debe estar disponible ya. Si
> Vercel no resulta viable, Karina autorizó explícitamente usar **Ngrok**
> como alternativa.

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

**Mantención programada (correo de Karina, 3-10-2026):** CoreStream
estará con intermitencias por migración desde hoy 18:00 hasta el lunes
mediodía. No usar la plataforma en esa ventana para evitar pérdida de
datos. Si a alguien le falta la invitación, revisar spam. Dudas por
canal interno después del lunes mediodía.

**Documentación fija para HITO 3 (correo de Karina, 3-10-2026), aplica
igual para Duoc y Utem:** Manual de Usuario, Manual de Administrador,
Manual de Desarrollo, Diagrama de BD físico (con relaciones e índices),
Lista de endpoints (parámetros, tipos y mensajes de error), y descripción
del motor de logs con la estructura de los mensajes logueados (para
troubleshooting). Registrado también en `PLAN_FASES_COMPONENTES.md`.

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
| ST-023 | El tema oscuro verde/negro de la demo que construye Sebastián no coincide con la app real de WellQ (tema claro, azul/blanco, según Google Play). Confirmar si es intencional o si conviene alinear la paleta — idealmente pidiendo a Max el kit de marca real en vez de reconstruirlo por inspección de capturas | Evita rehacer trabajo de diseño dos veces | Abierto — ver `ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md` §1 |
| ST-020 | Descalce de calendario entre Duoc y Alloxentric | El equipo lo informó directamente al profesor en clase (3-10). Respuesta: **el profesor indicó seguir el cronograma de DuocUC como prioridad**, no el de Alloxentric — reconoce que no corresponde exigirle a estudiantes un ritmo empresarial, y está gestionando esto internamente con Alloxentric. El equipo sí cumplirá con Alloxentric, pero a su propio ritmo, sin sacrificar calidad. **Matiz confirmado con Karina el 5-10: esto fija la fecha de entrega FINAL (semana 12-15), no exime de desplegar y mostrar avances de forma continua mientras tanto** | **Respondido (3-10, precisado 5-10) — reemplaza la resolución del 30-09 ("ambos cronogramas en paralelo"). Prioridad: Duoc para la nota; testing continuo para Alloxentric** |
| ST-021 | Karina pidió desplegar el MVP para que Alloxentric pueda testearlo | El sistema de archivos de las funciones de Vercel es de solo lectura (confirmado en la documentación oficial, ver `ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md`); la simulación SQLite en disco no persiste una vez desplegada — hace falta un motor de base de datos alcanzable por red, o un túnel (Ngrok) hacia un backend corriendo localmente | **Abierto — urgente de nuevo (5-10): Karina exige testing continuo de cada funcionalidad, no solo al cierre. Autorizó Ngrok como alternativa si Vercel no resulta viable esta semana** **Hallazgo 7-10, revisando el codigo para el plan de pruebas**: el middleware de `mvp/app.py` rechaza con 403 `LOCAL_DEMO_ONLY` cualquier request cuyo header `Host` no sea `127.0.0.1`/`localhost` — es una medida de seguridad deliberada de Sebastian (probada en `test_demo_configuration_and_host_guard`), pero bloquea Ngrok tal como se le indico el 5-10 (`ngrok http 8765`, sin mas). **Corregido**: usar `ngrok http 8765 --host-header=rewrite`, que reescribe el header antes de reenviar, sin tocar el codigo del MVP. Ver `PLAN_DE_PRUEBAS_MVP.md` §5. |
| ST-022 | Cuál motor usar para ese despliegue: MongoDB Atlas (free tier, alineado al stack real de WellQ, y es lo que Sebastián ya dejó corriendo en `feature/wellq-mvp-mongodb`) o Postgres gestionado (Neon/Supabase, alineado al brief original) — mientras ADR-006 no se ratifica formalmente | Bloquea el despliegue pedido por Karina, no solo el diseño de datos | Abierto — de facto encaminado a MongoDB por el MVP de Sebastián, falta ratificación formal. **Con Ngrok como alternativa (ST-021), esta decisión ya no bloquea el testing inmediato**: se puede exponer el MongoDB local de la demo sin esperar un motor en la nube |
| ST-024 | Karina pide (correo 3-10) una fecha estimada, vía formulario, de cuándo se podrán entregar enlaces para testing de usuarios | Define el compromiso formal del equipo con Alloxentric | **Respondido (5-10, en reunión): entrega final del MVP entre semana 12 y semana 15 del calendario Duoc (aprox. 9-nov a 6-dic-2026, coincide con la ventana de HITO 3 — confirmar fechas exactas contra el calendario oficial). Falta enviar el formulario formalmente si no se hizo en la reunión** |
| ST-025 | Karina pide (correo 3-10) un documento de Gap Analysis tras mostrar el MVP en reunión, con nombre de archivo `ID EQUIPO_NOMBRE PROYECTO_FECHA ENTREGA` (ej. `DEM_57_WELLQ_<fecha>`), enviado por correo | Acredita avance real vs. requerimientos para proyectar fechas por ítem | **Abierto — falta definir con el equipo cuándo se muestra el MVP y confirmar el nombre exacto del proyecto para el archivo** |
| ST-026 | Karina pide (correo 3-10) que el enlace de Vercel (y usuario/contraseña si aplica) quede en la descripción del grupo de WhatsApp y fijado en el chat | Visibilidad para Alloxentric una vez desplegado | Abierto — depende de que exista un despliegue real (ST-021/022) |
| ST-027 | El MVP (`feature/wellq-mvp-mongodb`) **no tiene endpoint para asignar un paciente a un clínico**: la relación (`care_team_links`) solo existe como dato sembrado a mano en `mvp/database.py:initialize()` (un paciente por clínico, por tenant demo, más un paciente deliberadamente sin vincular para probar aislamiento). Confirmado revisando el código el 6-10 al armar el diagrama de casos de uso. | Sin esta asignación, `GET /api/patients` y el acceso del clínico a exámenes (`context_for` en `mvp/app.py`) dependen de datos hardcodeados — no hay forma real de dar de alta la relación paciente-clínico en producción, ni un rol de administración para crearla | **Abierto — no se incluyó como caso de uso en el diagrama porque no está implementado; evaluar si entra al alcance de Fase 2 o queda como deuda técnica documentada** |

## Pendientes académicos

| ID | Asunto | Estado |
|---|---|---|
| DOC-001 | ¿El informe de Fase 1 es uno por grupo o uno por integrante? La guía 1.5 quedó en Evidencias Grupales, pero los indicadores 2 y 3 de la rúbrica evalúan la relación con el perfil de egreso y los intereses **personales** de cada estudiante | **Abierto — afecta la entrega del 12** |
| DOC-002 | Fecha exacta de entrega: la plataforma dice «sin fecha» | Abierto |
| DOC-003 | Exposición: duración y si se exige archivo de presentación | Abierto |
| DOC-004 | El profesor señaló que el formato de GitHub "no se entendía bien" y que había errores de formato en las entregas individuales: deben nombrarse `Apellido_Nombre_X.X_APT122...`. Solo Vicente cumplía el formato. Aron ya corrigió sus archivos 1.1/1.2 y subió 1.3 con el formato correcto (commits del 3-10). **Falta que Sebastián renombre sus evidencias individuales de Fase 1** (hoy están como `1.1_APT122_..._Sebastian_Gonzalez_Garrido.docx`, con el nombre al final y no al inicio) | **Abierto — pendiente solo de Sebastián** |

## Registro de respuestas

Una respuesta sin criterio de aceptación observable no está cerrada.

| ID | Respuesta | Quién | Fecha | Requisito derivado | Criterio de aceptación |
|---|---|---|---|---|---|
| ST-013 | Vicente López es líder de equipo | Karina | 2026-09-07 | Canalización de información con Alloxentric | Correo del 7 de septiembre |
| ST-014 | IA vía NVIDIA, sin costo | Karina | 2026-09-07 | AI Gateway con proveedor NVIDIA (A-14) | Correo del 7 de septiembre con pasos de acceso |
| ST-015 | Vercel como plataforma de despliegue | Karina | 2026-09-07 | Decisión A-13, condicionada | Pendiente de confirmar quién provee la cuenta |
| ST-020 | Prioridad: cronograma de DuocUC, no el de Alloxentric | Profesor (en clase) | 2026-10-03 | El equipo avanza al ritmo de Duoc; cumple con Alloxentric sin apuro | Comunicación verbal en clase; reemplaza la resolución anterior (30-09) |
| ST-024 | Entrega final del MVP: semana 12 a 15 de Duoc (aprox. 9-nov a 6-dic-2026) | Karina | 2026-10-05 | Fecha formal para el formulario de Alloxentric | Acordado en reunión; falta confirmar fecha exacta y enviar el formulario si no se hizo en la reunión |
| ST-021 | Despliegue continuo para testing; Ngrok autorizado si Vercel no resulta viable | Karina | 2026-10-05 | El equipo debe tener algo testeable por Alloxentric ya, no solo al final | Acordado en reunión; falta el despliegue real |


## Alcance solicitado por usuario — 8 de octubre

Usuario solicita lectura de archivos y prediagnóstico para contexto kinesiológico, pero no dispone de referencias. Se implementa lectura aritmética local y un ejemplo enteramente ficticio, sin emitir prediagnóstico. ST-004 no se cierra: falta definir/ratificar tipo de examen, formato real, referencias clínicas, finalidad interpretativa y criterios de evaluación profesional antes de inferencia clínica. No se solicitó ni obtuvo aprobación de Karina/Max/equipo en este chat.
