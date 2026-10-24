# WellQ Medical Exams — Proyecto Capstone (Alloxentric · DuocUC/Utem)

Última actualización: 30 de septiembre de 2026.

## Estado del proyecto

WellQ es un módulo de la plataforma real de Alloxentric (no un proyecto de
ejemplo aislado): confirmado por Karina Álvarez en CoreStream el 25 de
septiembre (ST-011). El equipo trabaja con el modelo de datos y el
Documento Maestro reales compartidos por Max Khreimerman.

A esta fecha existe:

- Documentación de arquitectura, plan de fases y bitácoras vivas (este
  repositorio, ver tabla más abajo).
- Una capa de reglas de dominio (componentes D y E) construida y probada
  por Sebastián González, en revisión.
- Una capa de persistencia simulada (SQLite, esquema pensado para migrar
  sin tocar las reglas de dominio) construida y probada por Vicente López,
  en revisión.
- Evidencias individuales de Fase 1 de los tres integrantes.

**Todavía no existe un backend desplegado ni una base de datos real
conectada en producción.** El motor de base de datos definitivo
(MongoDB vs. PostgreSQL+RLS, ver ADR-006 en `BITACORA_ARQUITECTURA.md`) no
está ratificado — es el pendiente más urgente y bloqueante del proyecto
(`ST-016`).

> **¿Eres un asistente de IA?** Lee `AGENTS.md` antes de tocar nada.

## Equipo

| Integrante | Rol | Responsabilidad actual |
|---|---|---|
| Vicente López | Líder de equipo (`TEAM_LEADER` en CoreStream) | Coordinación con Alloxentric/Karina, arquitectura, documentación, capa de persistencia simulada |
| Sebastián González Garrido | Desarrollo | Reglas de dominio (componentes D/E: confirmación, validación, elegibilidad) |
| Aron Germain Navarro | Desarrollo | Por confirmar alcance de componente asignado |

Contraparte académica: Karina Álvarez (docente a cargo y representante de
Alloxentric). Contraparte de negocio: Max Khreimerman (Alloxentric).
Reunión de requerimientos: lunes 17:00–17:30. La información con
Alloxentric se canaliza por el líder de equipo.

## CoreStream e hitos

Equipo registrado en CoreStream (plataforma de gestión de Alloxentric)
con código **DEM_57**.

| Hito | Fecha | Entregable |
|---|---|---|
| HITO 1 | 28 sep – 3 oct 2026 | MVP con base de datos operativa |
| HITO 2 | 26 – 31 oct 2026 | Todo el proyecto en Docker |
| HITO 3 (Duoc) | 16 – 28 nov 2026 | Proyecto entregado y documentado |
| HITO 3 (Utem) | 30 nov – 4 dic 2026 | Proyecto entregado y documentado |

Karina confirmó (30-09) que el calendario académico (Duoc/Utem) y el
calendario de Alloxentric deben cumplirse en paralelo, sin extensión
(`ST-020`). El detalle de fases y componentes acotado a estos hitos está en
`PLAN_FASES_COMPONENTES.md`.

## Código: dónde está y por qué no está todavía en `main`

Existen dos ramas de funcionalidad con código probado que **todavía no se
integran a `main` a propósito**, para dejarlas madurar y revisarlas antes
de mezclarlas:

- `feature/wellq-base-de-fg-abc` (Sebastián): reglas de dominio D/E, 22
  pruebas. Revisión senior completa en `REVISION_38830fa_wellq-base.md`.
  Tiene un Pull Request abierto (#1) hacia `main`, pendiente de aprobación.
- `feature/wellq-persistencia-simulada` (Vicente): capa de persistencia
  SQLite que envuelve las reglas de dominio sin modificarlas, 7 pruebas
  propias (29 en total al combinarse con la rama anterior). Ver
  `Informe_Avance_Persistencia_Simulada.md`.

Criterio de integración (§6.4 de `PLAN_FASES_COMPONENTES.md`): una fase se
mezcla a `main` solo cuando está "bien integrada" — revisada, probada, y
sin dejar a otra fase en curso sin base para continuar. Mientras tanto,
`main` se mantiene con la documentación y evidencias al día mediante la
rama `docs/bitacoras-y-evidencias-vicente`, para que cualquiera que abra el
repositorio (incluyendo evaluadores externos) vea el estado real del
proyecto sin depender de ramas de trabajo en curso.

## Contenido del repositorio

| Ruta | Qué es |
|---|---|
| `AGENTS.md` | Protocolo obligatorio para asistentes de IA. |
| `BITACORA_PROGRESO.md` | Estado, avances, bloqueos y aportes de IA. |
| `BITACORA_ARQUITECTURA.md` | Decisiones técnicas, su estado y contradicciones abiertas. |
| `BITACORA_STAKEHOLDERS.md` | Preguntas abiertas con Alloxentric y la docente. |
| `PLAN_FASES_COMPONENTES.md` | Plan de fases y componentes (A-G), acotado a los HITOs de Alloxentric. |
| `PLAN_RESGUARDO_DATOS.md` | Plan de protección de datos y compuerta previa a usar datos reales. |
| `ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md` | Investigación de la app WellQ real: marca/diseño y marco legal UK. |
| `REVISION_38830fa_wellq-base.md` | Revisión de código senior de la capa de reglas de dominio. |
| `Informe_Avance_Persistencia_Simulada.md` | Informe de avance de la capa de persistencia simulada. |
| `Informe_para_Sebastian_Interfaz_Privacidad_Vercel.md` | Informe puntual: interfaz, política de privacidad real de WellQ, despliegue en Vercel. |
| `COMPARACION_ARQUITECTURAS_WELLQ.md` | Arquitectura propuesta v0.1. No ratificada. |
| `BANCO_PREGUNTAS_TOMA_REQUERIMIENTOS.md` | 320 preguntas de levantamiento. |
| `EVA1_CAPSTONE_Instrucciones.md` | Resumen de la evaluación de Fase 1. |
| `Documento_Maestro_*.docx` | Documento maestro del proyecto. |
| `Especificacion_Endpoints_*.docx` | Especificación técnica de endpoints de carga. |
| `prototype/` | Reglas de dominio (D/E) y demo — rama `feature/wellq-base-de-fg-abc`. |
| `persistence/` | Capa de persistencia SQLite simulada — rama `feature/wellq-persistencia-simulada`. |
| `Fase 1..3/` | Evidencias académicas por fase, de los tres integrantes. |

## Estado del stack técnico

El stack vigente, según los documentos internos de Max (no públicos):
FastAPI, MongoDB, GCS (almacenamiento de archivos) y Flutter/Drift en el
cliente móvil. Esto está en tensión con el brief original del Capstone
(PostgreSQL + Row-Level Security) — la ratificación formal de motor de
base de datos es **ADR-006**, todavía abierto y urgente (`ST-016`,
`ST-022`). Hasta que se cierre, todo el trabajo de persistencia se hace
contra una simulación local (SQLite) con una interfaz de repositorio
diseñada para ser reemplazada sin tocar las reglas de negocio.

## Requisitos arquitectónicos no negociables

Multi-tenancy por `client_id` con RLS, RBAC con permisos granulares,
feature gating validado en backend, auditoría de cinco dimensiones,
API-First, i18n y light/dark mode. Se evalúan explícitamente en cada
funcionalidad nueva, incluso mientras el motor de base de datos no está
decidido.

## Cómo trabajamos

Ramas: `main` estable, `develop` integración, y ramas cortas
`feature/*`, `fix/*`, `docs/*`, `refactor/*`, `chore/*`.
No se trabaja directo sobre `main` salvo autorización explícita. Se
integra por Pull Request con revisión de al menos otro integrante.

Commits en formato Conventional Commits:

```
feat(tenant): add client_id isolation
docs(bitacora): register stakeholder pendings
```

Antes de empezar una tarea: `git fetch`, revisar `git status` y la rama
actual, y confirmar que no se pisa trabajo de otro integrante.

## Reglas de datos y secretos

No se versionan secretos, API keys, archivos `.env` reales ni datos de
pacientes. En el repositorio solo va `.env.example` sin valores.
Desarrollo y demostraciones usan datos sintéticos hasta que Alloxentric
autorice lo contrario por escrito. El detalle está en
`PLAN_RESGUARDO_DATOS.md`: WellQ trata datos de salud del Reino Unido, que
bajo UK GDPR son special category data.

Nota pendiente de revisar: algunas evidencias individuales de Fase 1
incluyen el RUT de los integrantes en texto plano, por ser un requisito
del formato académico de la guía — es una decisión consciente, no un
descuido, pero vale la pena revisarla si estas evidencias se hacen
públicas fuera del contexto académico.
