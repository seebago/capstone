# WellQ Medical Exams

Plataforma SaaS para la gestión de procesos y exámenes médicos.
Proyecto Capstone — Duoc UC · Cliente: Alloxentric.

> **Estado: fase de definición y documentación.**
> A la fecha no existe código de aplicación en este repositorio.
> El estado real y verificable está en `BITACORA_PROGRESO.md`.

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
| `COMPARACION_ARQUITECTURAS_WELLQ.md` | Arquitectura propuesta v0.1. No ratificada. |
| `BANCO_PREGUNTAS_TOMA_REQUERIMIENTOS.md` | 320 preguntas de levantamiento. |
| `EVA1_CAPSTONE_Instrucciones.md` | Resumen de la evaluación de Fase 1. |
| `Documento_Maestro_*.docx` | Documento maestro del proyecto. |
| `Especificacion_Endpoints_*.docx` | Especificación técnica de endpoints de carga. |
| `Fase 1..3/` | Evidencias académicas por fase. |

## Requisitos arquitectónicos no negociables

Multi-tenancy por `client_id` con RLS, RBAC con permisos granulares,
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
autorice lo contrario por escrito.
