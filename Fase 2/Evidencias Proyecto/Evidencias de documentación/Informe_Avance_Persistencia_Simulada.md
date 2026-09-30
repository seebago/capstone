# Informe de avance — Persistencia simulada (HITO 1)

Fecha: 30 de septiembre de 2026. Autor: Vicente López, con Claude.
Herramienta de IA usada: Claude (Anthropic), vía Vicente López.

## Qué se construyó

- `persistence/sqlite_repository.py`: repositorio con persistencia real en
  disco (SQLite) sobre las reglas de dominio de Sebastián
  (`prototype/domain.py`, commit `38830fa`, sin modificar). Implementa:
  - `apply_outcome()`: persiste la extracción actualizada y su evento de
    auditoría en una sola transacción SQLite, y encola un job en una
    tabla `outbox` cuando corresponde (`confirm` → `enqueue`,
    `reject` → `invalidate`, `discard`/`validate` → nada) — la versión
    simulada de "guarda el evento y encola el cálculo; no lo calcula
    sincrónicamente" (`ARQUITECTURA_BASE.md`).
  - Lecturas siempre acotadas por `client_id` en la consulta SQL
    (`get_extraction`, `list_extractions`, `list_audit_events`,
    `pending_outbox`) — nunca por un id suelto.
  - `save_eligibility()` / `get_eligibility()` para guardar y recuperar
    el resultado de `score_eligibility()`.
- `demo.py`: confirma un examen sintético, cierra la conexión (simula un
  reinicio del proceso), abre una conexión nueva sobre el mismo archivo
  y demuestra que el dato sigue ahí — y que un tenant distinto no lo ve.
- `tests/test_sqlite_repository.py`: 7 pruebas nuevas.

## Cómo se probó

```sh
cd wellq-persistencia
python -m unittest discover -s tests -v   # 7 pruebas, todas ok
python -m demo                             # corre y muestra el JSON de resultado
```

También se verificaron sin cambios las 22 pruebas originales de
`prototype/domain.py` (no se tocó ese archivo).

Casos cubiertos: persistencia + auditoría en una sola transacción;
outbox correcto por tipo de acción; lectura cruzada de tenant devuelve
`None`/lista vacía; snapshot de elegibilidad conserva tuplas al
recuperarse desde JSON; **el dato sobrevive a un reinicio real del
proceso** (archivo SQLite cerrado y reabierto, no solo un mismo objeto
en memoria); un fallo a mitad de transacción no deja escritura parcial
(rollback verificado).

## Qué NO cubre esta entrega

- No decide el motor de producción. Esto es una simulación con
  persistencia local (SQLite); ADR-006 (MongoDB vs. PostgreSQL+RLS)
  sigue abierto y sin ratificar por Karina/Max.
- No verifica JWT ni identidad real — el `client_id`/contexto lo sigue
  entregando quien llama, igual que en `prototype.domain`.
- No implementa idempotencia por clave de solicitud (PATCH repetido con
  la misma clave) ni CAS real contra escrituras concurrentes — solo el
  optimistic-concurrency que ya traía `transition()` vía
  `expected_revision`.
- No hay worker que drene la tabla `outbox`; solo queda encolado.
- No reemplaza ni modifica nada de la rama `feature/wellq-base-de-fg-abc`
  de Sebastián ni de la interfaz que está construyendo Aron/Sebastián.

## Decisiones/documentos fuente usados

- `prototype/domain.py` y `REVISION_38830fa_wellq-base.md` (commit
  `38830fa`) para los nombres de campo y las reglas a envolver.
- `BITACORA_ARQUITECTURA.md`, sección "Invariantes de diseño", para el
  criterio de que toda lectura debe filtrar por `client_id` en la
  consulta, nunca confiar en un id suelto.
- `PLAN_FASES_COMPONENTES.md` §6.2, que propuso exactamente este patrón
  (capa de reglas sin cambios + repositorio con persistencia local real).

## Pendiente para la siguiente fase

- Reemplazar esta simulación por el motor definitivo una vez se cierre
  ADR-006, reutilizando el mismo contrato de `SqliteRepository`
  (mismos métodos) para minimizar el cambio en quien lo consuma.
- Agregar idempotencia por clave de solicitud y un worker mínimo que
  procese `pending_outbox()`.
- Revisión cruzada por Sebastián/Aron antes de integrar a una rama
  compartida (regla de `AGENTS.md`: ninguna IA valida su propio trabajo;
  esto lo debe revisar una persona, no solo Claude).
