# WellQ Medical Exams

Aplicación móvil para cargar resultados de exámenes y consultar su procesamiento, con portal web para médicos propuesto por el equipo.
Proyecto Capstone — Duoc UC · Cliente: Alloxentric.

> **Estado al 3 de octubre de 2026:** bases en actualización y MVP existente en pausa. El código está en ramas feature; la nueva entrega está por definir.

## Actualización vigente de orientación — 2026-10-03

Por instrucción de Sebastián: producto principal móvil; portal médico web propuesto; flujo objetivo archivo → extracción → análisis preliminar/prediagnóstico → usuario y médico designado. El MVP existente queda en pausa y su nueva entrega por definir. PostgreSQL/MongoDB siguen en evaluación; no hay migración acordada. El detalle clínico se abordará al llegar a `H-IA-01`, avisando previamente a Sebastián.

Ver [bases actualizadas](BASES_PROYECTO_2026-10-03.md) y [evaluación de base de datos](EVALUACION_BD_2026-10-03.md). Esta orientación sustituye las prioridades internas incompatibles descritas abajo. El contenido anterior se conserva como antecedente; no acredita aprobación externa del cambio de alcance ni de fechas.

> **¿Eres un asistente de IA?** Lee `AGENTS.md` antes de tocar nada.

## Equipo

| Integrante | Responsabilidad |
|---|---|
| Vicente López | **Líder de equipo** · metodología de bitácoras y trazabilidad de IA |
| Sebastián González Garrido | Por acordar |
| Aron Germain Navarro | Por acordar |

Contraparte: Karina Álvarez (docente a cargo y representante de
Alloxentric) y Max Khreimerman (Alloxentric).
Reunión de requerimientos: lunes 17:00–17:30.
La información con Alloxentric se canaliza por el líder de equipo.

## Contenido del repositorio

| Ruta | Qué es |
|---|---|
| `AGENTS.md` | Protocolo obligatorio para asistentes de IA. |
| `BITACORA_PROGRESO.md` | Estado, avances, bloqueos y aportes de IA. |
| `BITACORA_ARQUITECTURA.md` | Decisiones técnicas, su estado y contradicciones abiertas. |
| `BITACORA_STAKEHOLDERS.md` | Preguntas abiertas con Alloxentric y la docente. |
| `PLAN_RESGUARDO_DATOS.md` | Plan de protección de datos y compuerta previa a usar datos reales. |
| `COMPARACION_ARQUITECTURAS_WELLQ.md` | Arquitectura propuesta v0.1. No ratificada. |
| `BANCO_PREGUNTAS_TOMA_REQUERIMIENTOS.md` | 320 preguntas de levantamiento. |
| `EVA1_CAPSTONE_Instrucciones.md` | Resumen de la evaluación de Fase 1. |
| `Documento_Maestro_*.docx` | Documento maestro del proyecto. |
| `Especificacion_Endpoints_*.docx` | Especificación técnica de endpoints de carga. |
| `Fase 1..3/` | Evidencias académicas por fase. |

## Requisitos arquitectónicos no negociables

Multi-tenancy por `client_id` (RLS si se elige PostgreSQL), RBAC con permisos granulares,
feature gating validado en backend, auditoría de cinco dimensiones,
API-First, i18n y light/dark mode.

**Atención:** el stack de backend y frontend está en contradicción entre
documentos. Ver AD-01 en `BITACORA_ARQUITECTURA.md` antes de programar.

## Cómo trabajamos

Ramas: `main` estable, `develop` integración, y ramas cortas
`feature/*`, `fix/*`, `docs/*`, `refactor/*`, `chore/*`.
No se trabaja directo sobre `main`. Se integra por Pull Request con
revisión de al menos otro integrante.

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
