# Bitácora de progreso — WellQ

Última actualización: 3 de octubre de 2026.
Estado verificado contra `origin/main` (`66c57b2`, incluye el fix de
nomenclatura de Aron y el archivo 1.4/presentación de Sebastián),
`origin/develop` (`fb4db39`, sin contenido relevante),
`origin/feature/wellq-base-de-fg-abc` (`38830fa`) y
`origin/feature/wellq-mvp-mongodb` (`5cd26c5`, MVP real MongoDB de
Sebastián — ver Novedades del 1-3 de octubre).

Esta bitácora registra estado real y verificable. Si algo no está en el
repositorio, aquí figura como pendiente, no como hecho.

## Equipo

**Líder de equipo: Vicente López.** Designado por Karina Álvarez el 7 de
septiembre de 2026 por correo. Canaliza la información con Alloxentric y
el contacto con los líderes de otros equipos.

Integrantes: Sebastián González Garrido, Vicente López, Aron Germain Navarro.

## Estado actual — 2026-10-03

MVP en pausa por instrucción de Sebastián, nueva fecha por definir. Hay código en ramas feature: dominio D/E, persistencia SQLite experimental y MVP FastAPI/MongoDB con interfaz web. `main` contiene documentación; no incluye aún esas implementaciones. PR #1 y #2 continúan abiertos en la revisión del 3 de octubre.

La nueva dirección es app móvil, portal médico propuesto y carga de archivos para un futuro análisis preliminar/prediagnóstico. Ver `BASES_PROYECTO_2026-10-03.md`. PostgreSQL/MongoDB en evaluación; detalle clínico diferido hasta `H-IA-01`.

Evidencia del alcance anterior: 22 pruebas de dominio reejecutadas el 3 de octubre, aprobadas. GitHub Actions del commit `5cd26c5` registra 37 pruebas y 15 subpruebas aprobadas (ejecución 37050645693). No acreditan el nuevo flujo clínico. Revisión humana del cambio documental pendiente.

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

## Novedades del 30 de septiembre (tarde) — revisión de código y proceso entre fases

- Se hizo una revisión técnica línea por línea (no solo "corre y pasan
  los tests") de `domain.py` y `test_domain.py` del commit `38830fa`.
  Resultado completo en `REVISION_38830fa_wellq-base.md`: el diseño es
  sólido (inmutabilidad, denegar por `NOT_FOUND` entre tenants en vez de
  `FORBIDDEN`, auditoría sin valores clínicos, doble puerta D bien
  modelada); quedan como deuda técnica documentada, no como bloqueo: la
  anulación de discrepancia de identidad y de baja confianza no dejan
  rastro de auditoría propio, y el umbral de confianza no está
  versionado como sí lo están `scoring_version`/`catalog_version`.
- Vicente y Sebastián acordaron simular la base de datos con los
  nombres de variable del modelo real, en vez de esperar a ADR-006 para
  empezar a integrar. Se documentó en `PLAN_FASES_COMPONENTES.md` §6:
  la capa de reglas ya construida (`domain.py`) se envuelve en un
  repositorio con persistencia local real (no solo memoria), para que
  cuente como evidencia de HITO 1 sin declarar cerrado el motor
  definitivo.
- Se formalizó un checklist de "fase bien integrada" antes de pasar a
  la siguiente, y una plantilla de informe de avance para que Aron o
  Sebastián la usen cada vez que cierren un avance, y quede para
  revisión en GitHub (`PLAN_FASES_COMPONENTES.md` §6.4-6.6).

## Novedades del 30 de septiembre (noche) — persistencia, marca real y Vercel

- **Avance técnico**: se construyó `persistence/sqlite_repository.py`,
  un repositorio con persistencia real en disco sobre `prototype/domain.py`
  de Sebastián (sin modificarlo). 7 pruebas nuevas, 29 en total
  verificadas en el árbol real del repositorio (incluidas las 22 de
  Sebastián, sin cambios). Publicado en la rama nueva
  `feature/wellq-persistencia-simulada` (commits `34a26fe` y `e3dba1e`,
  este último corrige un descuido: se habían colado archivos
  `__pycache__` en el primer commit; se agregó `.gitignore` — el
  repositorio no tenía uno). Detalle en
  `Informe_Avance_Persistencia_Simulada.md`.
- **Investigación de la app WellQ real**: sitio oficial, ficha de Google
  Play, ficha de App Store y política de privacidad publicada. Hallazgo
  a comunicar al equipo: la demo de Sebastián usa tema oscuro
  verde/negro; la app real de WellQ muestra tema claro azul/blanco — no
  coinciden (ST-023). También se extrajo el marco legal UK completo que
  WellQ Ltd declara sobre sí misma (empresa registrada, ICO
  ZB953651, Art. 9(2)(h) UK GDPR, hosting Azure UK sin transferencias
  rutinarias, DCB0129 como estándar de seguridad clínica, no
  clasificados como dispositivo médico, sin ISO 27001 aún). Todo en
  `ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md`, con fuentes.
- **Despliegue en Vercel**: Karina pidió desplegar el MVP para pruebas
  de terceros. Se confirmó contra la documentación oficial de Vercel
  que las funciones corren con sistema de archivos de solo lectura
  (salvo un `/tmp` efímero de 500 MB) — la simulación SQLite en disco
  de esta misma noche **no sirve una vez desplegada**. Se registró
  ST-021/ST-022 (urgentes) y se detalló la alternativa en
  `PLAN_FASES_COMPONENTES.md` §8: elegir ahora un motor alcanzable por
  red (MongoDB Atlas o Postgres gestionado, capa gratuita) solo para
  destrabar el despliegue, dejando ADR-006 formalmente abierto.
- **Calendario dual confirmado por Karina**: los cronogramas de Duoc y
  de Alloxentric deben cumplirse en paralelo, sin extensión — Alloxentric
  quiere ver ritmo de entrega real. Registrado como contexto en ST-020
  (ya no es solo un riesgo, es una instrucción explícita a sostener).

## Novedades del 30 de septiembre (noche) — main quedó al día con la documentación

- Vicente pidió explícitamente arreglar `main`, agregar sus propias
  evidencias y **no** mezclar todavía las ramas `feature/wellq-base-de-fg-abc`
  ni `feature/wellq-persistencia-simulada` (deben madurar y revisarse
  antes de integrarse). Esto es casi con certeza el "error" que Karina
  reportó al equipo sin detallarlo: `main` (comprobado con
  `git ls-tree -r`) no tenía `README.md`, `AGENTS.md`, ninguna bitácora,
  `PLAN_FASES_COMPONENTES.md`, `PLAN_RESGUARDO_DATOS.md`, ni las
  evidencias individuales de Fase 1 de Vicente — solo las de Sebastián y
  Aron estaban presentes.
- Antes de tocar `main` se hizo una fusión de prueba descartable (rama
  local `_merge_check_main`, nunca subida, luego eliminada) fusionando
  en orden `docs/bitacoras-y-evidencias-vicente` →
  `feature/wellq-base-de-fg-abc` → `feature/wellq-persistencia-simulada`
  para confirmar que las tres ramas son compatibles entre sí (un solo
  conflicto menor en `.gitignore`, resuelto quedándose con la versión
  más completa) y que las 29 pruebas y ambos demos siguen pasando en el
  árbol combinado. Esa fusión de prueba **no se subió a ningún lado**.
- Se actualizó `README.md` para reflejar el estado real (equipo, hitos
  CoreStream, por qué el código todavía vive en ramas `feature/*` y no
  en `main`) y se fusionó `docs/bitacoras-y-evidencias-vicente` en
  `main` sin conflictos — esto trae README, AGENTS.md, todas las
  bitácoras, los planes, el análisis de marca/legal, la revisión de
  código senior, el informe para Sebastián y las tres evidencias de
  Fase 1 de Vicente.
- Se eliminó de `main` el archivo duplicado
  `WellQ_Clinical_Test_Upload_API_Specification (1).docx` (idéntico byte
  a byte al original, mismo SHA1) — quedaba por un upload repetido.
- **Las dos ramas feature quedaron intactas a propósito**, en los mismos
  commits de siempre (`38830fa` y `e3dba1e`): no se integraron a `main`
  en esta acción. Quedan para revisión e integración posterior, per
  §6.4 de `PLAN_FASES_COMPONENTES.md`.
- Commits locales en `main`: fusión de `docs/bitacoras-y-evidencias-vicente`
  (sin historial de merge commit propio porque fue fast-forward-compatible
  con contenido nuevo) y `chore(cleanup): eliminar duplicado de
  WellQ_Clinical_Test_Upload_API_Specification.docx`. Pendiente `git push
  origin main` desde la máquina de Vicente (el shell remoto usado por
  Claude no tiene credenciales de GitHub configuradas).

## Novedades del 1-3 de octubre — MVP MongoDB de Sebastián, giro de prioridad del profesor, y entrada a Fase 2

- **Avance de Sebastián (vía Codex), rama `feature/wellq-mvp-mongodb`,
  push del 1-oct:** MVP real con FastAPI + MongoDB real (no simulado),
  basado en un documento nuevo que Max le envió (`WellQ_Modelo_de_Datos.docx`,
  mantenido fuera de Git a propósito). Aislamiento multi-tenant real vía
  schema validator de Mongo e índices únicos por `client_id`, JWT
  HS256 con expiración e issuer/audience, confirmación/validación/
  rechazo con escritura atómica, interfaz web simple de prueba. 37
  pruebas (22 de dominio + 15 de integración Mongo), CI verde. Revisado
  por Claude a nivel de código (JWT, hashing de contraseñas, índices de
  aislamiento) — sólido. Pendiente: todavía no tiene Pull Request, y
  parte del `main` viejo (anterior a la corrección del 30-09), así que
  al integrarla habrá que rebasarla sobre el `main` actual, no
  mezclarla tal cual. Intentó además alinear la interfaz visualmente
  con la app real de WellQ (ST-023) pero quedó bloqueado por un error
  de su navegador automatizado — lo dejó documentado honestamente como
  "blocked" en `design-qa.md` en vez de forzarlo.
- **Giro importante en clase (3-10):** el equipo le planteó al profesor
  la sobrecarga de sostener ambos cronogramas (Duoc + Alloxentric) en
  paralelo. El profesor respondió que **el cronograma de DuocUC es la
  prioridad** — Alloxentric no puede exigir ritmo empresarial a
  estudiantes, y lo está resolviendo internamente. Esto **reemplaza**
  la resolución del 30-09 ("ambos cronogramas en paralelo, sin
  extensión"). El equipo seguirá cumpliendo con Alloxentric, pero sin
  apuro. Actualizado en `BITACORA_STAKEHOLDERS.md` (ST-020) y
  `PLAN_FASES_COMPONENTES.md` §9.
- **Correo de Karina del 3-10** con varios pedidos concretos, registrados
  como ST-024 a ST-026 en `BITACORA_STAKEHOLDERS.md`: fecha estimada del
  MVP (formulario — el equipo acordó responder con una fecha realista
  cerca de fin de semestre, según el cronograma de clases, sin presión),
  documento de Gap Analysis tras mostrar el MVP (nombre de archivo
  `ID EQUIPO_NOMBRE PROYECTO_FECHA`), enlace de Vercel en la
  descripción/fijado del WhatsApp del equipo una vez desplegado.
  También: CoreStream con intermitencias por migración (hoy 18:00 a
  lunes mediodía — no usar la plataforma en esa ventana) y la lista fija
  de documentación para HITO 3 (manuales de usuario/admin/desarrollo,
  diagrama de BD físico, lista de endpoints, motor de logs) — ambos
  registrados en `BITACORA_STAKEHOLDERS.md` y `PLAN_FASES_COMPONENTES.md` §11.
- **Entramos a Fase 2 de DuocUC.** Recién ahora corresponde abordar
  diseño e interfaz (coincide con el intento de Sebastián de alinear la
  paleta visual). Checklist completo de los documentos nuevos que pide
  la guía (IEEE 830/HU, diagramas de casos de uso/clases/actividad,
  modelo de BD, mockups, plan/casos/resultados de pruebas,
  documentación de metodología, actas de reunión, plan del proyecto) en
  `PLAN_FASES_COMPONENTES.md` §10. Confirmado con Vicente: WellQ **no**
  es un emprendimiento del equipo (es una rama de un producto existente
  de Alloxentric), así que no corresponde agregar un Business Model
  Canvas.
- **Orden de GitHub:** el profesor avisó que el formato de entregas
  individuales no se entendía bien — debían nombrarse
  `Apellido_Nombre_X.X_APT122...` y solo Vicente cumplía. Aron ya
  corrigió sus archivos 1.1/1.2 (renombrados) y subió 1.3 con el
  formato correcto, todo el 3-10. **Falta que Sebastián renombre sus
  evidencias de Fase 1** (hoy tienen el nombre al final, no al inicio).
  Sebastián también subió el archivo grupal 1.4 de Fase 1 (que el
  equipo debía generar por su cuenta, no el docente) y una presentación
  PDF de la Evaluación 1.

## Pendiente

- **Falta que Sebastián renombre sus evidencias individuales de Fase 1**
  al formato `Apellido_Nombre_X.X_APT122...` (ver DOC-004 en
  `BITACORA_STAKEHOLDERS.md`).
- Definir con el equipo la fecha exacta a comprometer en el formulario
  de Karina (ST-024) y el nombre exacto del proyecto para el archivo de
  Gap Analysis (ST-025).
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
| 1.1 Autoevaluación de competencias | Entregada (nombre pendiente de corregir) | Entregada | Entregada (corregida 3-10) |
| 1.2 Diario de reflexión | Entregada (nombre pendiente de corregir) | Entregada | Entregada (corregida 3-10) |
| 1.3 Autoevaluación Definición Proyecto APT | Entregada (nombre pendiente de corregir) | Entregada | Entregada (3-10) |
| 1.4 Formativa (Evidencia Grupal) | Entregada (3-10, por Sebastián) | — | — |

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
| 2026-09-30 (noche) | Claude (vía Vicente) | Repositorio SQLite con persistencia real sobre domain.py, 7 pruebas nuevas; investigación de marca/legal de WellQ real; análisis de la restricción de Vercel y ST-021/022 | rama `feature/wellq-persistencia-simulada`, commits `34a26fe`/`e3dba1e` | Pendiente de revisión por Sebastián/Aron antes de integrar | En revisión |
| 2026-09-30 (noche) | Claude (vía Vicente) | Informe para Sebastián (interfaz/privacidad/Vercel), subida a GitHub; auditoría completa de `main` (sin secretos, sin binarios grandes, CI verde) y corrección: README actualizado + fusión de `docs/bitacoras-y-evidencias-vicente` en `main` + eliminación de archivo duplicado. Ramas feature dejadas intencionalmente sin integrar | `main`, commits `7fc7e1c`/`8d53031`, pusheados | Vicente | Validado |
| 2026-10-01 | Codex (vía Sebastián) | MVP real FastAPI + MongoDB, JWT, aislamiento multi-tenant, 37 pruebas, interfaz web de prueba | rama `feature/wellq-mvp-mongodb`, commit `87b272d`/`5cd26c5` | Revisado por Claude a nivel de código (sólido); validación humana de fondo y PR pendientes | En revisión |
| 2026-10-03 | Claude (vía Vicente) | Registro del giro de prioridad (cronograma Duoc), de los pedidos del correo de Karina (ST-024 a 026), del checklist de documentos de Fase 2 y HITO 3, y del estado de la nomenclatura de evidencias | `BITACORA_STAKEHOLDERS.md`, `BITACORA_PROGRESO.md`, `PLAN_FASES_COMPONENTES.md` | Vicente | Pendiente |

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

## Próximos pasos registrados el 3 de octubre

La implementación y entrega del MVP quedan en pausa por la instrucción más reciente de Sebastián; las tareas documentales siguen vigentes. La elección del motor continúa abierta, sin preferencia automática por el MVP existente.

> Actualizado 03-10-2026 tras el giro de prioridad hacia el cronograma
> de DuocUC — ver Novedades del 1-3 de octubre. El orden ya no está
> forzado por el vencimiento de HITO 1 de Alloxentric.

1. **Sebastián**: renombrar sus evidencias individuales de Fase 1 al
   formato `Apellido_Nombre_X.X_APT122...` (DOC-004).
2. Fijar con el equipo la fecha a comprometer en el formulario de
   Karina (ST-024) y el nombre exacto del proyecto para el documento de
   Gap Analysis (ST-025), y enviarlos.
3. Empezar los documentos de Fase 2 (`PLAN_FASES_COMPONENTES.md` §10):
   priorizar IEEE 830/Historias de Usuario y el modelo de BD (conceptual,
   aunque ADR-006 no esté ratificado), ya que son base para los
   diagramas de clases/casos de uso/actividad y para los mockups.
4. Documentar honestamente el proceso de trabajo real del equipo
   (reuniones espontáneas por los horarios de cada uno) en vez de
   simular ceremonias SCRUM que no ocurrieron — ver nota de agenda en
   `PLAN_FASES_COMPONENTES.md` §10.
5. Revisar a nivel senior y con pruebas re-ejecutadas el MVP MongoDB de
   Sebastián (rama `feature/wellq-mvp-mongodb`) antes de abrir su Pull
   Request, y planear el rebase sobre el `main` ya corregido.
6. Ratificar con Karina (y, si es posible, Max) el motor de base de
   datos definitivo (ADR-006, ST-016/022) — de facto encaminado a
   MongoDB por el MVP de Sebastián, falta la ratificación formal.
7. Aclarar con Karina el significado de «DE-FG-ABC» (ST-017) y el
   alcance exacto esperado para HITO 1 (ST-018) — ya sin la urgencia
   de antes, pero sigue sin responderse.
8. Confirmar si `DART_14_1.1...docx` fue un error de navegación en
   CoreStream (ST-019).
9. Una vez haya despliegue real en Vercel, poner el enlace (y
   usuario/contraseña si aplica) en la descripción y el chat fijado del
   WhatsApp del equipo (ST-026).
10. Registrar en CoreStream (equipo DEM_57) el avance a medida que se
    complete, no solo en este repositorio — recordar que CoreStream
    tendrá intermitencias hasta el lunes mediodía.

## Aporte de IA — reorientación 2026-10-03

| Fecha | Herramienta | Aporte | Evidencia | Validado por | Estado |
|---|---|---|---|---|---|
| 2026-10-03 | Codex vía Sebastián | Bases móviles, pausa del MVP, comparación PostgreSQL/MongoDB y punto H-IA-01 | BASES_PROYECTO_2026-10-03.md; EVALUACION_BD_2026-10-03.md; rama docs/reorientacion-movil-2026-10-03 | Pendiente | Para revisión humana |

## Corrección de verificación del 3 de octubre

El PR #2 del MVP ya existe (abierto), y design-qa.md en 5cd26c5 informa ensayo aprobado; la referencia anterior a ausencia de PR y estado blocked queda superada. El aislamiento MongoDB depende de las consultas y autorización por tenant/vínculo; el schema validator y los índices por sí solos no impiden lecturas cruzadas.
