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

## Evidencia histórica de la base de dominio

# Avance WellQ de Fase 2

## Nuevo MVP MongoDB e interfaz del 30 de septiembre

[Iniciar el MVP local](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/README.md>)
y [modelo aplicado, pruebas y límites](<Evidencias Proyecto/Evidencias de documentación/MVP_MongoDB_Interfaz_2026-09-30.md>).
El incremento agrega persistencia real, autenticación de demo e interfaz de
confirmación y revisión. El informe previo y el prototipo se conservan como
evidencia histórica; la descripción de ausencia de DB corresponde a esa
entrega anterior, no al nuevo MVP.

## Contenido de esta entrega

- [Aplicación y pruebas](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/prototype/README.md>): prototipo sintético D/E.
- [Informe PDF](<Evidencias Proyecto/Evidencias de documentación/Informe_Avance_WellQ_Fase_2.pdf>): actividades, evidencias, resultados y pendientes.
- [Arquitectura](<Evidencias Proyecto/Evidencias de documentación/arquitectura/ARQUITECTURA_BASE.md>).
- [Prioridades DE-FG-ABC](<Evidencias Proyecto/Evidencias de documentación/arquitectura/PRIORIDADES_DE_FG_ABC.md>).

## Ejecutar

Desde la raíz del repositorio:

```sh
cd "Fase 2/Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base"
python -m unittest discover -s tests -v
python -m prototype.demo
```

Estado: 22 pruebas locales aprobadas. D implementa reglas parciales de
confirmación/revisión; E solo elegibilidad, sin cálculo clínico. No hay
API, persistencia, interfaz ni conexiones a producción. La carpeta Base de
datos conserva su estructura original: todavía no hay una BD operativa.

El workflow permanece en `.github/workflows/`, ubicación requerida por GitHub.
Las bitácoras y el README general permanecen en la raíz como índice del equipo.
La revisión humana y la ratificación de decisiones pendientes siguen abiertas.

## Alcance de la publicación del 30 de septiembre

Esta publicación contiene exclusivamente Fase 2 y el workflow de pruebas.
Se aplica sobre main sin integrar la rama documental de Vicente ni publicar
las modificaciones locales de las bitácoras de la raíz. Esa rama se conserva
en el remoto como referencia del contexto. Los hashes citados en el informe
son los commits locales de preparación; la publicación por el conector
GitHub se registra en un commit independiente y su pull request.
