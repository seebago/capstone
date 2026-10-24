# WellQ Medical Exams

Plataforma SaaS para la gestión de procesos y exámenes médicos.
Proyecto Capstone — Duoc UC · Cliente: Alloxentric.

**Estado al 24-10-2026:** MVP académico **sintético** de evaluación incorporado en `main` mediante [PR #8](https://github.com/seebago/capstone/pull/8). Backend FastAPI, MongoDB y frontend web de pruebas para carga y revisión de documentos. No equivale al módulo productivo de WellQ ni incorpora OCR general o IA clínica. Informes anteriores describen hitos históricos y deben leerse en su fecha.

> **¿Eres un asistente de IA?** Lee `AGENTS.md` antes de tocar nada.

## Equipo

| Integrante | Responsabilidad |
|---|---|
| Vicente López | **Líder de equipo** · metodología de bitácoras y trazabilidad de IA |
| Sebastián González Garrido | Implementación y pruebas del MVP académico de evaluación (PR #8); contribución técnica atribuible y documentada |
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

Requerimientos: multi-tenancy por `client_id`, RBAC con permisos, feature gating en backend, auditoría de cinco dimensiones, API-First, i18n y temas claro/oscuro. **La demo utiliza MongoDB**, por lo que no cuenta con RLS nativo de PostgreSQL; aplica filtros por tenant en código y pruebas. Auditoría de aplicación no equivale a WORM/inalterabilidad frente al administrador.

**Atención:** la ratificación del stack definitivo y de la integración con el producto WellQ existente sigue siendo una decisión del equipo/Alloxentric (ADR-006). La elección operativa de FastAPI/MongoDB para la demo no la cierra.

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
