# Informe de avance WellQ Fase 2

Proyecto Capstone · Módulo de exámenes médicos · 29 de septiembre de 2026

Destinatarios: equipo Capstone y docente. Elaboración asistida por Codex a solicitud del usuario. Revisión y validación humana pendientes.

## Resultado del avance

Se preparó una base ejecutable con datos sintéticos para confirmar exámenes y determinar qué marcadores son elegibles para puntuación. Se organizaron las prioridades en DE, FG y ABC, se documentó la arquitectura de integración y se aprobaron 22 pruebas locales. El resultado permite revisar reglas del dominio antes de conectar la infraestructura de WellQ.

La entrega no constituye todavía un backend integrado ni una base de datos operativa. No calcula puntajes clínicos, no procesa documentos reales y no realiza llamadas a inteligencia artificial. Por ello, no acredita el cumplimiento del Hito 1 que exige una base de datos operativa.

## Revisión y preservación del proyecto

Se revisaron el repositorio seebago/capstone, el Documento Maestro, las especificaciones, las bitácoras y las imágenes con la tabla A–G y la indicación DE-FG-ABC. La rama de Vicente contenía avances posteriores a main; se usó como base para preservar su documentación y evidencias.

| Referencia | Estado observado |
|---|---|
| main | 4a367cd |
| develop | fb4db39 |
| Rama de Vicente | docs/bitacoras-y-evidencias-vicente · 37f909b |
| Rama del avance | feature/wellq-base-de-fg-abc |

La rama nueva conserva el historial previo. No se sobrescribieron ramas existentes ni se modificaron los archivos sincronizados de referencia del proyecto.

## Criterio de arquitectura

El Documento Maestro describe FastAPI, MongoDB, Google Cloud Storage, Flutter con Drift y portal React. Las bitácoras mantienen pendiente la ratificación del stack y del aislamiento de datos. La base usa Python estándar y reglas independientes de framework; no selecciona ni despliega un motor de base de datos.

## Componentes y trabajo realizado

| Prioridad | Componente y alcance de esta entrega |
|---|---|
| DE | D · Confirmar, descartar, validar y rechazar. Conservación de propuesta y autoría. Comprobaciones de acceso, revisión vigente, identidad y baja confianza. Sin edición completa ni pantallas. |
| DE | E · Elegibilidad de marcadores y motivos de exclusión con versiones de catálogo y puntuación. Sin fórmula, agregación por pilares ni índice global. |
| FG | F · Reportería clínica documentada en el backlog. G · App paciente y cola offline documentadas. No se implementaron portal, PDF clínico ni Flutter. |
| ABC | A · Se preserva la especificación de carga existente. B · Extracción diferida, sin proveedor conectado. C · Modelo interno mínimo para el prototipo; no equivale al JSON canónico v1 completo. |

## Reglas verificadas

La confirmación del paciente basta para que un dato pueda entrar a puntuación; la validación clínica es una segunda revisión. El rechazo clínico lo excluye y produce una intención de invalidar el puntaje. La aplicación del paciente no recibe un puntaje en esta versión, conforme al Documento Maestro.

El acceso comprueba tenant, vínculo con el paciente, permiso y funcionalidad habilitada. Una extracción o revisión obsoleta se rechaza. Los campos de baja confianza necesitan revisión explícita y una identidad no resuelta impide confirmar. Los marcadores no reconocidos, sin unidad compatible o sin rango se excluyen con una razón.

## Pruebas y evidencia

| Verificación | Resultado y alcance |
|---|---|
| Pruebas locales | 22 pruebas aprobadas con unittest. Cubren reglas de dominio y entradas sintéticas. |
| Aislamiento y permisos | Acceso entre tenants, otro paciente del mismo tenant, relación clínica ausente y permisos o features faltantes rechazados. |
| Estado y calidad | Confirmaciones obsoletas, datos sin confirmar, descarte, rechazo, baja confianza y valores numéricos inválidos comprobados. |
| Demostración | Confirma un marcador inventado y devuelve elegibilidad. El puntaje permanece vacío de forma intencional. |
| Automatización | Workflow preparado para pruebas y demo en Python 3.12. Las verificaciones remotas se registran en el pull request. |

Estas pruebas no demuestran autenticación JWT, aislamiento en el motor de base de datos, persistencia, concurrencia real ni auditoría inmutable. Los eventos del prototipo contienen las cinco dimensiones de auditoría, pero todavía no se guardan en un servicio durable.

## Ubicación de las evidencias

La entrega se organiza dentro de Fase 2 / Evidencias Proyecto. La estructura académica anterior permanece disponible.

| Carpeta | Contenido |
|---|---|
| Evidencias de sistema / Aplicación / wellq-base | prototype: reglas y demo. tests: pruebas automatizadas. |
| Evidencias de documentación / arquitectura | Arquitectura base, matriz DE-FG-ABC y ADR-007 con decisiones y límites. |
| Evidencias de documentación | Este informe de actividades y resultados. |
| Fase 2 | README con índice y comandos de ejecución. |
| Raíz del repositorio | Bitácoras e índice general. Workflow en .github/workflows, ubicación requerida por GitHub. |

## Trazabilidad de los cambios

| Commit base | Contenido |
|---|---|
| 79bf0bc | feat(domain): add synthetic confirmation and scoring eligibility base |
| 0c5fce6 | docs(wellq): align architecture and delivery priorities with DE-FG-ABC |

La reubicación en Fase 2 y este informe se incorporan en un commit posterior. La publicación se realizará en la rama de trabajo y se verificará contra el remoto; no implica integración automática en main ni aprobación humana del aporte.

## Pendientes y siguiente entrega

El próximo avance debe ratificar el motor de base de datos y el mecanismo de aislamiento, conectar un repositorio de datos y demostrar que una confirmación persiste después de reiniciar. También debe resolver el vínculo entre clinic_id y client_id y obtener identidad y relación asistencial desde el servidor.

Después corresponde completar edición de marcadores, validación por campo, idempotencia, control atómico de concurrencia y outbox. El cálculo numérico requiere catálogo, rangos y pesos versionados y revisados clínicamente. Portal, app, carga y extracción se integran según el backlog, manteniendo las prioridades DE-FG-ABC.

## Fuentes del avance

Documento Maestro Proyecto Exámenes Médicos WellQ, secciones 1, 3, 6, 7 y 8; especificaciones de carga del repositorio; bitácoras y Plan de Fases y Componentes de la rama 37f909b; PDF central y guía de contexto del proyecto; imágenes de la conversación Iniciar proyecto y Git. Las decisiones abiertas permanecen registradas como pendientes.
