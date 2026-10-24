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
        ├── Aplicación/           ← código (llega cuando una rama feature/* se integre)
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

- [ ] Vicente López
- [ ] Sebastián González
- [ ] Aron Germain

### Evidencias grupales → `Evidencias Grupales/`

- [ ] Informe de avance del equipo (si la pauta lo exige, con el mismo
      criterio usado en Fase 1)

## Nota sobre el código

El código real (MVP de Sebastián y la propuesta de pivote a app móvil)
vive por ahora en ramas `feature/*` y `docs/*`, no en `main` — están
pendientes de revisión e integración (ver `BITACORA_PROGRESO.md`). Este
índice no asume ese código como entregado hasta que se integre.
