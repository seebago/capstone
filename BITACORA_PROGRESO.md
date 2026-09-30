# Bitácora de progreso — WellQ

Última actualización: 30 de septiembre de 2026.
Estado verificado contra `origin` en el commit `37f909b` (rama
`docs/bitacoras-y-evidencias-vicente`), `origin/develop` (`fb4db39`,
sin contenido relevante) y `origin/feature/wellq-base-de-fg-abc`
(`38830fa`, aporte de Sebastián — ver más abajo).

Esta bitácora registra estado real y verificable. Si algo no está en el
repositorio, aquí figura como pendiente, no como hecho.

## Equipo

**Líder de equipo: Vicente López.** Designado por Karina Álvarez el 7 de
septiembre de 2026 por correo. Canaliza la información con Alloxentric y
el contacto con los líderes de otros equipos.

Integrantes: Sebastián González Garrido, Vicente López, Aron Germain Navarro.

## Estado actual

Fase de definición y documentación. **No existe código de aplicación en
este repositorio.** Lo que hay es documentación de arquitectura,
especificaciones técnicas, el banco de preguntas de levantamiento y las
evidencias académicas de Fase 1.

| Área | Estado | Nota |
|---|---|---|
| Multi-tenancy | Diseñado, no implementado | COMPARACION §4 |
| RBAC | Modelo conceptual | COMPARACION §5 |
| Feature gating | Diseñado | COMPARACION §6 |
| Auditoría | Diseñada | COMPARACION §8 |
| API de carga de exámenes | Especificada, no implementada | Especificacion_Endpoints |
| Frontend | No iniciado | Max prepara una base (ST-011) |
| Base de datos | Sin migraciones ni proyecto creado | — |
| Pruebas | No existen | — |
| CI/CD | No configurado | — |

## Documentos incorporados al repositorio

| Fecha | Documento | Autor |
|---|---|---|
| 2026-08-22 | Estructura de carpetas de evidencias por fase | Sebastián |
| 2026-09-05 | COMPARACION_ARQUITECTURAS_WELLQ.md (v0.1) | Sebastián |
| 2026-09-05 | BANCO_PREGUNTAS_TOMA_REQUERIMIENTOS.md (320 preguntas) | Sebastián |
| 2026-09-05 | EVA1_CAPSTONE_Instrucciones.md | Sebastián |
| 2026-09-07 al 09 | Documento_Maestro_Proyecto_Examenes_Medicos_WellQ.docx | Sebastián |
| 2026-09-07 al 09 | Especificacion_Endpoints_Carga_Examenes_Medicos.docx | Sebastián |
| 2026-09-07 al 09 | Especificación Técnica de Estándares Transversales y Capacidades Comerciales.docx | Sebastián |
| 2026-09-07 al 09 | WellQ_Clinical_Test_Upload_API_Specification.docx | Sebastián |
| 2026-09-10 | Guía 1.5 Definición Proyecto APT (Evidencias Grupales) | Sebastián |
| 2026-09-10 | AGENTS.md, bitácoras, README y .gitignore | Vicente, con Claude |

## Novedades del 7 al 10 de septiembre

- Reunión de levantamiento con Karina Álvarez y Max Khreimerman (7 de septiembre).
- Vicente López designado líder de equipo.
- Acceso a IA gratuita vía NVIDIA (`build.nvidia.com`, base URL
  `integrate.api.nvidia.com/v1`). Alloxentric usa DeepSeek. **Resuelve el
  costo de la IA, no su finalidad.**
- Vercel recomendado por Karina como plataforma de despliegue.
- Max prepara un backend y un frontend. Alcance sin confirmar (ST-011).
- La guía 1.5 quedó redactada y ubicada en `Fase 1/Evidencias Grupales/`,
  lo que implica tratarla como entregable grupal. DOC-001 sigue sin
  respuesta formal.

## Novedades del 21 al 25 de septiembre

- Equipo incorporado a CoreStream (código DEM_57, Vicente como
  TEAM_LEADER). Karina comunicó las fechas de los 3 hitos de Alloxentric
  (ver `BITACORA_STAKEHOLDERS.md`, sección CoreStream). HITO 1 vence el
  3 de octubre y pide "MVP con base de datos operativa".
- Karina mostró en CoreStream una priorización de 7 componentes
  ("DE-FG-ABC") para el módulo de exámenes médicos.
- Vicente solicitó a Max el modelo de datos de WellQ para alinear
  variables. Max lo compartió (`WellQ_Modelo_de_Datos.docx`).
- Se verificó `git fetch --all`: no hay commits de implementación de
  ningún integrante. Apareció `origin/develop` con dos commits
  triviales de `.gitignore`, sin código.
- Se leyeron íntegros los 6 documentos aportados (el modelo de datos de
  Max y los 4 documentos técnicos ya presentes en el repositorio desde
  el 7-09). Un sexto documento subido a la conversación
  (`DART_14_1.1...docx`) resultó pertenecer a otro equipo/proyecto de
  Alloxentric — registrado como ST-019, no se usó en el análisis.
- Esta lectura resuelve, en la práctica, ST-011 (Max no prepara un
  ejemplo: WellQ ya es un producto en producción del que este proyecto
  es un módulo) y mueve AD-01 hacia FastAPI+MongoDB+Flutter/Drift,
  pendiente de ratificación (ver `BITACORA_ARQUITECTURA.md`, ADR-006).
- Se creó `PLAN_FASES_COMPONENTES.md`: plan de fases de los componentes
  A–G acotado a los hitos de Duoc/Utem, con la Fase 1 (HITO 1)
  enfocada en el componente C (esquema) y un subconjunto mínimo de A.

## Novedades del 29-30 de septiembre — aporte de Sebastián

Sebastián publicó la rama `feature/wellq-base-de-fg-abc` (commit
`38830fa`, sobre `main`, sin tocar la rama de Vicente ni `develop`).
Verificado por Vicente con Claude: se hizo `git checkout` del commit en
un worktree aparte, se corrió `python -m unittest discover -s tests -v`
(22 pruebas, todas `ok`) y `python -m prototype.demo` (ejecuta y
devuelve JSON con `score: null` de forma intencional). El workflow de
GitHub Actions (`domain.yml`) corre exactamente esos dos comandos en
Python 3.12, así que debería quedar en verde.

**Qué construyó, en concreto:**

- Reglas de dominio en Python puro (sin framework, sin DB, sin API) para
  el componente **D** (confirmación del paciente / validación clínica:
  doble puerta, preservación de la propuesta original, rechazo de datos
  sin confirmar, aislamiento por tenant/paciente/permiso) y una
  **compuerta de elegibilidad** del componente **E** (qué marcadores
  pueden entrar a puntuación y por qué se excluyen otros — sin fórmula
  ni cálculo clínico real).
- 22 pruebas automatizadas, verificadas localmente por Claude, cubriendo
  aislamiento cruzado de tenant/paciente, permisos y feature gating,
  confirmaciones obsoletas, baja confianza, y las reglas de negocio de D/E.
- Reordenó el backlog de fases como **DE → FG → ABC** en
  `PRIORIDADES_DE_FG_ABC.md`, explícitamente sobre la tabla A–G del
  Documento Maestro y la instrucción de Karina, y citando
  `PLAN_FASES_COMPONENTES.md` (commit `37f909b`) como antecedente.
- `ARQUITECTURA_BASE.md`, ADR-007 e Informe de Avance Fase 2 (md + pdf).
- **Lo dice el propio informe, sin que haga falta que Claude lo señale**:
  "La entrega no constituye todavía un backend integrado ni una base de
  datos operativa (...) no acredita el cumplimiento del Hito 1". La
  carpeta `Fase 2/.../Base de datos/` sigue con solo un `.gitkeep`.

**Lo que falta para que HITO 1 quede realmente cumplido:** una base de
datos operativa conectada (Mongo o Postgres) que persista al menos la
confirmación de un examen de prueba y sobreviva a un reinicio. Eso
requiere cerrar primero ADR-006 / ST-016 (motor de base de datos), que
sigue sin ratificar por Karina/Max — es decir, el bloqueo no es solo de
tiempo, es también de una decisión de arquitectura pendiente.

**Riesgo de calendario registrado como ST-020** (ver
`BITACORA_STAKEHOLDERS.md`): el equipo recibió el modelo de datos y la
confirmación de que el proyecto es un módulo de WellQ existente recién
entre el 23 y el 29 de septiembre — es decir, 1 semana o menos antes del
cierre de HITO 1 (3 de octubre). El Informe de Avance de Sebastián ya
dice esto mismo con otras palabras ("no acredita el cumplimiento").

## Pendiente

- **Vicente no figura en los antecedentes personales de la guía 1.5.**
  La tabla registra solo a Sebastián González y Aron Germain, con un solo
  RUT. Debe corregirse antes de la entrega del 12 de septiembre.
- Evidencia 1.3 de Vicente: no puede completarse hasta que la guía 1.5
  esté cerrada, porque autoevalúa ese informe.
- Abstract en español e inglés, conclusiones individuales y reflexión en
  inglés (exigidos por la pauta de EVA1).
- Documento IEEE 830, historias de usuario, ERD y diagramas.
- Vaciar las respuestas de la reunión del 7 de septiembre en
  `BITACORA_STAKEHOLDERS.md`.

## Bloqueos

| # | Bloqueo | Depende de | Impacto |
|---|---|---|---|
| B1 | Alcance del backend/frontend de Max | Max | No conviene escribir código antes de saberlo |
| B2 | Stack real del proyecto: la arquitectura v0.1 y el plan de trabajo de la 1.5 se contradicen | Equipo | Ver AD-01 en la bitácora de arquitectura |
| B3 | Alcance real de la IA | Alloxentric | El acceso técnico existe; falta la finalidad aprobada |
| B4 | Fase 1 individual o grupal | Karina | Afecta el entregable del 12 de septiembre |
| B5 | Infraestructura y quién paga | Karina / Max | Define hosting y ubicación de la base de datos |

## Evidencias individuales — Fase 1

| Evidencia | Sebastián | Vicente | Aron |
|---|---|---|---|
| 1.1 Autoevaluación de competencias | Entregada | Entregada | Entregada |
| 1.2 Diario de reflexión | Entregada | Entregada | Entregada |
| 1.3 Autoevaluación Definición Proyecto APT | Entregada | Pendiente | Pendiente |

Convención de nombres acordada, para que ordenen por número de evidencia:

```
Apellido_Nombre_1.1_APT122_AutoevaluacionCompetenciasFase1.docx
```

## Registro de aportes de IA

Cada intervención de una IA se registra aquí antes de integrarse. Una IA
no valida su propio trabajo: la columna «Validado por» la firma un
integrante humano. El protocolo completo está en `AGENTS.md`.

| Fecha | Herramienta | Aporte | Evidencia | Validado por | Estado |
|---|---|---|---|---|---|
| 2026-09-05 | ChatGPT + Gemini (vía Sebastián) | Arquitectura v0.1 y banco de 320 preguntas | commit 9fcc830 | Pendiente | Por revisar |
| 2026-09-05 | Claude (vía Vicente) | Auditoría inicial del repositorio | Esta bitácora | Vicente | Validado |
| 2026-09-07 | Claude (vía Vicente) | Guion de la reunión de requerimientos | — | Vicente | Validado |
| 2026-09-07 al 09 | Sin declarar (vía Sebastián) | Documento maestro, especificaciones de endpoints y estándares | commits cf60388 a 4b56276 | Pendiente | Por revisar |
| 2026-09-10 | Claude (vía Vicente) | Evidencias 1.1 y 1.2 de Vicente, AGENTS.md y bitácoras | commit 92ca76c | Vicente | Validado |
| 2026-09-11 | Claude (vía Vicente) | Evidencia 1.3 y registro de las respuestas de Karina | commits 2c64da7 y siguiente | Vicente | En revisión |
| 2026-09-25 | Claude (vía Vicente) | Análisis de los 6 documentos subidos, verificación de git, `PLAN_FASES_COMPONENTES.md`, actualización de AD-01/ST-011 y registro de ST-016 a ST-019 | Este commit | Vicente | Pendiente |
| 2026-09-29/30 | Codex (vía Sebastián) | Base de dominio D/E, 22 pruebas, workflow CI, `PRIORIDADES_DE_FG_ABC.md`, ADR-007, Informe de Avance Fase 2 | rama `feature/wellq-base-de-fg-abc`, commit `38830fa` | Verificado por Vicente con Claude (pruebas re-ejecutadas, ok); validación humana de fondo pendiente | En revisión |

## Oportunidades de mejora detectadas

**OM-01 — Documentación que describe un repositorio que no existe.**
`COMPARACION_ARQUITECTURAS_WELLQ.md` §13 afirma que la entrega se hizo
desde la rama `docs/contenido-extra-wellq` hacia una carpeta
`contenido extra/` mediante Pull Request. Verificado contra `git log`: no
existe esa rama, no existe esa carpeta y no hubo Pull Request. Los
archivos están en la raíz y se subieron por la interfaz web de GitHub.

Regla adoptada: toda afirmación sobre el estado del repositorio se
verifica contra `git log` antes de integrarse.

**OM-02 — Trabajo que existe pero que el repositorio no ve.**
El 7 de septiembre se reportó un documento con preguntas que no estaba en
`origin/main` ni en ninguna rama ni PR. Karina también menciona en su
correo que compartió información por WhatsApp antes de oficializarla.

Regla adoptada: lo que se comparte por canal informal se sube al
repositorio o se registra en la bitácora el mismo día.

**OM-03 — Documentos de IA sin trazabilidad de origen.**
Entre el 7 y el 10 de septiembre se incorporaron varios documentos
técnicos extensos sin registro de qué herramienta los generó ni quién
validó su contenido. No se cuestiona su calidad: el problema es que no se
puede reconstruir cómo se llegó a esas decisiones.

Regla adoptada: todo documento generado con asistencia de IA se registra
en el registro de aportes antes de integrarse.

## Próximos pasos

1. Ratificar con Karina (y, si es posible, Max) el motor de base de
   datos para el componente C: MongoDB vs. PostgreSQL+RLS (ADR-006,
   ST-016) — bloquea empezar a programar.
2. Aclarar con Karina el significado de «DE-FG-ABC» (ST-017) y el
   alcance exacto esperado para HITO 1 (ST-018).
3. Confirmar si `DART_14_1.1...docx` fue un error de navegación en
   CoreStream (ST-019).
4. Implementar la Fase 1 de `PLAN_FASES_COMPONENTES.md`: esquema JSON
   canónico (componente C) + 2-3 endpoints mínimos (componente A) con
   datos sintéticos, antes del 3 de octubre.
5. Registrar en CoreStream (equipo DEM_57) el avance a medida que se
   complete, no solo en este repositorio.
