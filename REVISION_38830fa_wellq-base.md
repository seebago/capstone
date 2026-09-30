# Revisión técnica — `feature/wellq-base-de-fg-abc` (commit `38830fa`)

Fecha: 30 de septiembre de 2026. Revisor: Vicente López, con Claude.
Nivel: revisión de código a nivel senior (diseño, seguridad, cobertura de
pruebas), no solo "corre y los tests pasan".

Regla del proyecto respetada: ninguna IA valida su propio trabajo. Esta
revisión es de Claude (vía Vicente) sobre código generado por Codex (vía
Sebastián) — evaluador y autor son independientes. La validación humana
final (Sebastián/Aron/Vicente juntos) sigue pendiente.

## Alcance revisado

`prototype/domain.py` (209 líneas) y `tests/test_domain.py` (159 líneas),
línea por línea — no solo ejecutados. Ya se había verificado antes que las
22 pruebas pasan y que la demo corre (ver `BITACORA_PROGRESO.md`,
novedades del 29-30 de septiembre); esta revisión entra al contenido.

## Veredicto general

**Código sólido para lo que declara ser.** No es una demo improvisada:
tiene decisiones de diseño defendibles, coherentes con los requisitos no
negociables del proyecto (multi-tenancy, auditoría, denegar-por-defecto),
y las pruebas atacan el código en serio, no solo confirman el camino feliz.
Se detallan fortalezas y brechas reales abajo — ninguna brecha bloquea
avanzar, pero deben quedar registradas para no perderlas de vista.

## Fortalezas concretas

1. **Modelo inmutable (`@dataclass(frozen=True)`) con transiciones por
   `replace()`.** Evita mutación compartida y hace que cada `Outcome`
   sea un valor, no un efecto secundario — ideal para una capa que
   luego un adaptador de persistencia debe envolver sin sorpresas.

2. **Denegar por existencia, no por permiso, entre tenants.**
   `authorize()` devuelve `NOT_FOUND` (no `FORBIDDEN`) cuando
   `client_id` no coincide. Es la decisión correcta: un `FORBIDDEN`
   confirmaría que el recurso existe en otro tenant, habilitando
   enumeración cruzada. Varias implementaciones júnior fallan
   exactamente aquí. Coincide con el invariante ya escrito en
   `BITACORA_ARQUITECTURA.md` ("un UUID difícil de adivinar no es
   autorización").

3. **Trampa de `bool` como `float` cazada explícitamente.** En Python,
   `isinstance(True, int)` es `True` y `isfinite(True)` no lanza. El
   código excluye `bool` a propósito (`isinstance(value, bool)`) antes
   de aceptar un valor numérico, y hay una prueba dedicada
   (`test_invalid_numeric_inputs_rejected`) que lo comprueba. Es un
   detalle que casi nunca aparece fuera de una revisión senior.

4. **Fecha/hora "naive" rechazada explícitamente**
   (`TIMEZONE_REQUIRED`). Evita el error clásico de auditoría con hora
   local ambigua — coherente con el requisito de timestamp ISO 8601 de
   `Especificación Técnica de Estándares Transversales`.

5. **El evento de auditoría no transporta valores clínicos.** Hay una
   prueba explícita que confirma que `value_canonical` y `proposal` no
   aparecen en el `AuditEvent` serializado. Esto es exactamente lo que
   pide el requisito de auditoría del proyecto (nunca loguear el dato
   clínico, solo el hecho de la acción).

6. **La doble puerta (paciente confirma → clínico valida) está
   correctamente modelada como máquina de estados**, no como un booleano
   suelto: cada acción exige el estado previo correcto
   (`awaiting_confirmation` para confirmar/descartar,
   `confirmed` para validar/rechazar) y la revisión clínica (`validate`)
   preserva la autoría del paciente (`confirmed_by` no se pierde) —
   probado explícitamente en `test_validation_preserves_patient_authorship`.

7. **Concurrencia optimista ya prevista**: `expected_extraction_id` +
   `expected_revision` como precondición de cada transición, con
   `EXTRACTION_SUPERSEDED` y `REVISION_CONFLICT` como errores distintos.
   Es la base correcta para el CAS/idempotencia que
   `ARQUITECTURA_BASE.md` promete para la siguiente entrega.

8. **`score_eligibility` nunca calcula un puntaje** — devuelve
   inclusión/exclusión con motivo explícito (`UNMAPPED`,
   `VALIDATION_FAILED`, `NON_NUMERIC`, `CENSORED_UNSUPPORTED`,
   `UNIT_NOT_SUPPORTED`, `REFERENCE_MISSING`) y nunca sustituye un dato
   ausente por cero, coherente con la regla #3 registrada en
   `ARQUITECTURA_BASE.md`. El paciente no puede leer el resultado aunque
   tenga el permiso asignado por error — probado explícitamente
   (`test_patient_cannot_read_score_even_with_permission`), que es
   precisamente el tipo de prueba adversarial que demuestra que el rol
   se aplica en el backend y no se confía en el permiso declarado.

## Brechas y deuda técnica real (para registrar, no para bloquear)

1. **La anulación de una discrepancia de identidad no deja rastro
   propio.** `identity_confirmed=True` permite confirmar aunque
   `identity_match` sea `"mismatch"` o `"unknown"`, pero el evento de
   auditoría resultante es igual a cualquier otro `"confirm"` — no
   registra que hubo una anulación de identidad ni quién la resolvió
   más allá del `actor_id` genérico. Para datos de salud esto debería
   ser un hecho auditable de primera clase (ej. una acción
   `"confirm_with_identity_override"` o un campo dedicado en el evento).
   **Se registra como pendiente para la fase D completa**, no para esta
   entrega.

2. **Lo mismo para la resolución de baja confianza por marcador.**
   `resolved_markers` permite pasar el umbral de confianza, pero no
   queda quién resolvió cada marcador ni por qué, más allá del evento
   genérico de confirmación. Mismo tratamiento que el punto anterior.

3. **`confidence_threshold` no está versionado.** `scoring_version` y
   `catalog_version` sí se versionan y viajan en `Eligibility`, pero el
   umbral de confianza (0.9 por defecto) se pasa suelto en cada llamada
   a `transition()`. Si en producción alguien cambia ese umbral sin
   dejarlo versionado, se pierde la trazabilidad de qué umbral aplicó a
   cada confirmación histórica — inconsistente con el resto del diseño,
   que sí es cuidadoso con la versión. Debe versionarse igual que el
   catálogo antes de salir de prototipo.

4. **Cobertura de pruebas: faltan casos negativos en `score_eligibility`
   análogos a los que sí existen en `transition`.** Hay pruebas de
   tenant cruzado y de rol paciente para `score_eligibility`, pero no de
   `PERMISSION_DENIED`/`FEATURE_NOT_INCLUDED` con rol clínico correcto
   pero sin el permiso/feature, ni de `VERSION_REQUIRED` (versión vacía),
   ni de `INVALID_ACTION` en `transition`. No son errores — son huecos de
   cobertura menores, fáciles de cerrar en la siguiente entrega.

5. **`DUPLICATE_MARKER` solo se valida sobre `proposal`, no sobre
   `confirmed`.** En el flujo actual `confirmed` siempre se deriva de
   `proposal` vía `replace()`, así que no es explotable hoy, pero es un
   invariante implícito que conviene dejar explícito cuando `confirmed`
   deje de ser un espejo automático de `proposal` (edición por campo,
   prevista para la siguiente fase).

## Conclusión

Esto no necesita rehacerse. Es una base de dominio correcta y bien
probada para D y la compuerta de E. Lo que falta —trazabilidad específica
de las dos anulaciones humanas (identidad y confianza), versionado del
umbral de confianza, y algunos casos negativos adicionales— se registra
como trabajo pendiente de la Fase 3 (confirmación completa) en
`PLAN_FASES_COMPONENTES.md`, no como corrección urgente.
