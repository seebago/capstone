# Fase 2 — WellQ (DuocUC)

Índice y checklist de esta fase. El detalle completo de cada documento
(qué cubre, quién lo hace, semana estimada) está en
`PLAN_FASES_COMPONENTES.md` §10 del repositorio raíz — este README es
solo el mapa de carpetas y el estado de avance.

## Estructura de carpetas

```
Fase 2/
├── Evidencias Grupales/          ← entregables de equipo (ej. informes de avance)
├── Evidencias Individuales/      ← autoevaluación/reflexión de cada integrante
└── Evidencias Proyecto/
    ├── Evidencias de documentación/
    │   ├── arquitectura/         ← IEEE 830, HU, diagramas, modelo de BD, mockups
    │   ├── pruebas/              ← plan de pruebas, casos de prueba, resultados
    │   └── metodologia/          ← actas de reunión, backlog, plan del proyecto
    └── Evidencias de sistema/
        ├── Aplicación/           ← MVP sintético integrado en main (PR #8)
        └── Base de datos/        ← modelo/scripts de BD cuando ADR-006 esté ratificado
```

## Nomenclatura de evidencias individuales

Igual que en Fase 1 (corregido el 3-10, ver `BITACORA_STAKEHOLDERS.md`
DOC-004): el nombre va con el apellido primero.

```
Apellido_Nombre_2.X_APT122_<descripción>.docx
```

## Checklist de documentos (ver PLAN_FASES_COMPONENTES.md §10 para el detalle)

### Requerimientos y diseño → `Evidencias de documentación/arquitectura/`

- [ ] Documento de requerimientos IEEE 830 / Historias de Usuario
- [ ] Diagrama de casos de uso
- [ ] Diagrama de clases
- [ ] Diagramas de actividad
- [ ] Modelo de base de datos
- [ ] Mockups de interfaz

### Pruebas → `Evidencias de documentación/pruebas/`

- [ ] Plan de pruebas
- [ ] Casos de prueba (ya existe una base real: 37+ pruebas automatizadas
      de Sebastián — falta formalizarlas como casos de prueba documentados)
- [ ] Resultados de las pruebas

### Gestión y metodología → `Evidencias de documentación/metodologia/`

- [ ] Documentación de metodología elegida (backlog, sprints, etc.)
- [ ] Actas de reunión
- [ ] Resolución de conflictos (si corresponde)
- [ ] Plan del proyecto
- [x] Documentación de stakeholders — ya cubierta por `BITACORA_STAKEHOLDERS.md`
- [x] Business Model Canvas — **no aplica**, WellQ no es un emprendimiento
      del equipo (confirmado, ver `PLAN_FASES_COMPONENTES.md` §10)

### Evidencias individuales → `Evidencias Individuales/`

- [x] Vicente López — diario 2.1 publicado
- [x] Sebastián González — diario 2.1 y reflexión 2.6 auxiliar registrados
- [ ] Aron Germain

### Evidencias grupales → `Evidencias Grupales/`

- [ ] Informe de avance del equipo (si la pauta lo exige, con el mismo
      criterio usado en Fase 1)

## Nota sobre el código

El MVP sintético de Sebastián **ya está en `main`** desde el 24-10-2026 por [PR #8](https://github.com/seebago/capstone/pull/8), con pruebas CI de dominio y MongoDB aprobadas para el commit de la PR. La app móvil es un rumbo/propuesta distinta, no una funcionalidad implementada en esta entrega. Cualquier afirmación del informe final debe separar prototipo, propuesta y pendiente; no hay IA clínica ni diagnóstico. La revisión académica del material sigue siendo responsabilidad del equipo.

## Implementación reunida para revisión (8 de octubre)

## MVP actual: MongoDB e interfaz de pruebas

Actualización: 1 de octubre de 2026. Código y documentación preparados con
asistencia de Codex; aceptación académica y revisión humana pendientes.

- [Abrir y ejecutar la demo](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/README.md>).
- [Informe del avance y guion de presentación](<Evidencias Proyecto/Evidencias de documentación/INFORME_AVANCE_MVP_2026-10-01.md>).
- [Aplicación del modelo de datos y arquitectura del MVP](<Evidencias Proyecto/Evidencias de documentación/MVP_MongoDB_Interfaz_2026-09-30.md>).
- [Verificación visual](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/design-qa.md>).
- [Capturas y resultados](<Evidencias Proyecto/Evidencias de documentación/evidencias-mvp-2026-10-01>).

El MVP agrega MongoDB real, acceso por perfiles, revisión/corrección del
paciente y validación del profesional. La interfaz sigue el estilo oscuro
y turquesa observado en la app oficial de WellQ. Usa datos ficticios.

Verificación: 37 pruebas de dominio/API/MongoDB, 15 subpruebas y recorrido
completo de navegador aprobados. Sin carga de PDF, extracción IA ni puntaje
clínico numérico. No es un despliegue de producción ni cubre todo A–G.

### Ejecutar en Windows

Desde `Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base`:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

Abre http://127.0.0.1:8765 y usa la clave local de `.runtime/access.txt`.
Requisitos, puertos, persistencia y pruebas adicionales están en el README
de la aplicación. Las claves y los archivos de ejecución quedan fuera de Git.

## Arquitectura y prioridades conservadas

- [Arquitectura base](<Evidencias Proyecto/Evidencias de documentación/arquitectura/ARQUITECTURA_BASE.md>).
- [Prioridades DE → FG → ABC](<Evidencias Proyecto/Evidencias de documentación/arquitectura/PRIORIDADES_DE_FG_ABC.md>).

El incremento desarrolla la base de D y E; no cambia esa priorización.
El modelo original recibido no se publica ni se modifica.

## Entrega anterior: base sintética del 30 de septiembre

- [Prototipo de dominio](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/prototype/README.md>).
- [Informe histórico PDF](<Evidencias Proyecto/Evidencias de documentación/Informe_Avance_WellQ_Fase_2.pdf>).
- [Informe histórico Markdown](<Evidencias Proyecto/Evidencias de documentación/Informe_Avance_WellQ_Fase_2.md>).

Las referencias a ausencia de API, persistencia e interfaz en esos informes
corresponden al prototipo anterior. Se preservan como evidencia histórica.
Sus 22 pruebas se ejecutan con `python -m unittest discover -s tests -p test_domain.py`
desde `wellq-base`; las 37 del MVP, con `python -m pytest -q` y MongoDB activo.

Los workflows permanecen en `.github/workflows/`, ubicación requerida por
GitHub. Las ramas y bitácoras generales del equipo no se sobrescriben.

La rama histórica `feature/wellq-evaluation-deploy` fue recuperada mediante PR #8 y fusionada a `main` el 24-10-2026 (merge `1934056bc4a4feddcd6f284306ec773012097b1d`). Ver [revisión y despliegue](<Evidencias Proyecto/Evidencias de documentación/pruebas/REVISION_DESPLIEGUE_2026-10-08.md>).
