# Bitácora de progreso — WellQ

Última actualización: 11 de septiembre de 2026.
Estado verificado contra `origin/main` en el commit `4a367cd`.

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

1. Corregir los antecedentes personales de la guía 1.5 (falta Vicente).
2. Resolver la contradicción de stack entre la arquitectura v0.1 y el
   plan de trabajo de la 1.5 (AD-01).
3. Confirmar con Max el alcance de su backend y frontend (ST-011).
4. Completar la evidencia 1.3 una vez cerrada la guía 1.5.
5. Recién después: flujo vertical mínimo con datos sintéticos.
