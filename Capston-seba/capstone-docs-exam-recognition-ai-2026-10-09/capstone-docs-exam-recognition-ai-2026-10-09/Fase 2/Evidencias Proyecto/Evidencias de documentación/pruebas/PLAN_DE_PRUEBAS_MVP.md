# Plan de pruebas — MVP WellQ (MongoDB)

**Fase:** 2 — Pruebas
**Fuente:** código real de `feature/wellq-mvp-mongodb` (`mvp/app.py`, `prototype/domain.py`,
`tests/test_domain.py`, `tests/test_mvp.py`), revisado y ejecutado parcialmente el 7 de octubre
de 2026.

## 1. Objetivo y alcance

Verificar que los 9 endpoints del MVP (ver `Diagramas_Casos_de_Uso_y_Actividad_MVP.md`) cumplen
las reglas de negocio, RBAC, Multi-Tenancy y auditoría exigidas por el proyecto, usando siempre
**datos sintéticos** (política vigente, ver `PLAN_RESGUARDO_DATOS.md`) y nunca contra bases de
producción (`mvp/settings.py` ya lo impide en código: solo acepta nombres de base `wellq_demo*` o
`wellq_test*`).

No cubre: el motor de scoring clínico real (no implementado, `CLINICAL_CATALOG_PENDING`), ni la
propuesta de pivote a app móvil (sin resolver por el equipo).

## 2. Estrategia por niveles

| Nivel | Qué prueba | Dependencias | Estado hoy (7-oct) |
|---|---|---|---|
| **Unitario de dominio** | Reglas de negocio puras (`prototype/domain.py`: `transition`, `score_eligibility`) | Ninguna (sin DB, sin red) | **Ejecutado hoy, 22/22 OK** — ver §3 |
| **Integración API + BD** | Los 9 endpoints reales end-to-end contra MongoDB (`tests/test_mvp.py`) | MongoDB local corriendo | No ejecutable desde este entorno (sandbox sin MongoDB ni salida de red a instaladores) — ver §4 |
| **Manual / exploratorio** | UI estática (`/`, `/static/app.js`), flujo completo paciente→clínico a mano | Demo corriendo (`start-demo.ps1`) | Pendiente, a cargo de quien tenga la demo corriendo (hoy Sebastián) |

## 3. Lo que sí se verificó hoy, de forma real

Se copiaron `prototype/domain.py` y `tests/test_domain.py` (sin modificar) a un entorno aislado y
se ejecutaron con `unittest` — estas pruebas no tocan base de datos, así que sí se pudieron correr:

```
Ran 22 tests in 0.004s
OK
```

Las 22 pruebas cubren, entre otras cosas: que el paciente no puede confirmar un examen de otro
tenant ni de otro paciente (`NOT_FOUND` / `NO_PATIENT_ACCESS`), que permiso comercial (feature) y
permiso de rol son independientes, que un examen con baja confianza exige revisión explícita, que
un identity_match no resuelto bloquea la confirmación, y que el audit event nunca contiene valores
clínicos. **Resultado: la capa de reglas de negocio del MVP está sólida y 100% verificada hoy.**

## 4. Pendiente de ejecutar: pruebas de integración (`tests/test_mvp.py`)

Estas 15 pruebas sí requieren una instancia real de MongoDB (`Settings` lo exige, sin mock — ver
el propio comentario del archivo: *"Integration tests against a REAL local MongoDB, never
production databases"*). Este entorno de Claude no tiene MongoDB ni salida de red hacia los
instaladores oficiales, así que no se pudieron ejecutar aquí. **Quien tenga la demo de Sebastián
corriendo puede hacerlo en un minuto:**

```
cd wellq-base
python -m pytest tests/test_mvp.py -v
```

| Prueba | Qué verifica |
|---|---|
| `test_health_and_ui` | Health check y que la UI estática carga |
| `test_auth_required_and_forged_tenant_input` | Sin token = 401; forzar `client_id` ajeno = 422; paciente ajeno = 404 |
| `test_contract_types_and_case_relationship` | Validación estricta de tipos (Pydantic `strict=True`) |
| `test_create_idempotency` | Misma `Idempotency-Key` = misma respuesta; payload distinto con misma key = 409 |
| `test_clinician_cannot_create_and_pending_hidden` | Clínico no puede crear examen; no ve exámenes pendientes de confirmación |
| `test_cross_tenant_and_unlinked_patient_denied` | **Cliente A no accede a datos del Cliente B** (requisito obligatorio del proyecto) + paciente sin `care_team_link` denegado |
| `test_human_review_corrections_and_atomic_audit` | Corrección manual de marcador + auditoría atómica completa |
| `test_repeat_confirmation_exactly_once_and_conflict` | Reintento idempotente vs. conflicto real |
| `test_concurrent_confirms_have_single_winner` | Dos confirmaciones simultáneas → solo una gana (200/409) |
| `test_clinical_review_preserves_confirmation_and_rejection_excludes` | Flujo completo confirmar → validar/rechazar → elegibilidad |
| `test_feature_gate_and_live_user_revocation` | Quitar feature o desactivar usuario corta el acceso **en caliente** |
| `test_expired_and_tampered_tokens` | Token vencido o alterado = 401 |
| `test_persists_across_app_restart` | Los datos sobreviven un reinicio del proceso |
| `test_database_requires_tenant_field` | MongoDB rechaza a nivel de esquema un documento sin `client_id` |
| `test_demo_configuration_and_host_guard` | Ver hallazgo crítico en §5 |

**Acción pedida al equipo**: que quien corra esto pegue la salida completa de `pytest` (pantallazo
o texto) en `Fase 2/Evidencias Proyecto/Evidencias de documentación/pruebas/` como evidencia real
de ejecución — no basta con que el código exista, según la regla del proyecto ("no declarar una
tarea terminada si no ha sido probada").

## 5. Hallazgo crítico — bloquea el plan de despliegue por Ngrok

Revisando `mvp/app.py` para este plan de pruebas se encontró lo siguiente (y está probado a
propósito en `test_demo_configuration_and_host_guard`, **no es un bug accidental**, es una medida
de seguridad deliberada de Sebastián):

```python
if request.headers.get('host', '').split(':')[0] not in {'127.0.0.1', 'localhost', 'testserver'}:
    return JSONResponse({'detail': 'LOCAL_DEMO_ONLY'}, status_code=403)
```

**Esto significa que, tal como está, el MVP rechazará con 403 cualquier request que llegue a
través de un túnel Ngrok**, porque Ngrok reenvía el header `Host` original (algo como
`xxxx.ngrok-free.app`), no `127.0.0.1`. Es decir: el comando que se le pasó a Sebastián el 5-10
(`ngrok http 8765`, sin más) **no habría funcionado** — Karina habría recibido un 403 en vez de la
demo.

**Solución sin tocar el código de Sebastián** (preserva su barrera de seguridad intencional, que
en sí es correcta para evitar exponer accidentalmente una demo con datos sintéticos como si fuera
producción):

```
ngrok http 8765 --host-header=rewrite
```

El flag `--host-header=rewrite` hace que Ngrok reescriba el header `Host` a `127.0.0.1:8765` antes
de reenviar la petición, pasando el guard sin modificar una sola línea del MVP. Se registra este
hallazgo en `BITACORA_STAKEHOLDERS.md` (ST-021) y se corrige la instrucción que se le había dado a
Sebastián.

## 6. Marco legal y de privacidad aplicable a las pruebas

Según la política de privacidad pública de WellQ Ltd (la empresa real, ver
`ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md`), el dato de salud se trata como **special category data
bajo UK GDPR**, con base jurídica Art. 9(2)(h), consentimiento explícito del paciente, y
prohibición de decisiones automatizadas sin intervención humana (Art. 22 UK GDPR) — exactamente
el patrón que ya sigue este MVP (el score nunca decide solo, siempre pasa por un clínico).

Para las pruebas, esto se traduce en reglas concretas, ya cumplidas por el diseño actual pero que
hay que mantener como checklist antes de cualquier despliegue para testing externo (Ngrok o
Vercel):

- [ ] **Nunca** cargar un dato real de paciente en las pruebas, ni siquiera de prueba manual —
  solo los sintéticos que ya sembr a `database.py:initialize()` (`patient_alpha`, etc.).
- [ ] La base de datos usada debe llamarse `wellq_demo*` o `wellq_test*` — `Settings.__post_init__`
  ya lo fuerza en código, no depender solo de la disciplina del equipo.
- [ ] El túnel Ngrok debe cerrarse cuando no se esté usando activamente para testing (no dejarlo
  corriendo indefinidamente expuesto a internet).
- [ ] Si en algún momento se evalúa cargar un dato real (no planeado hoy), eso requiere primero
  resolver la base jurídica propia del equipo (ST-003/009/012, **siguen abiertos**) — WellQ Ltd
  tiene registro ICO (ZB953651) y consentimiento explícito como base; este equipo, como proyecto
  académico, **no tiene ninguno de los dos todavía**.
- [ ] Lo de Chile (Ley 19.628, Ley 20.584) sigue sin aclarar (ST-006/008) — no asumir cobertura
  legal por analogía con el caso UK.

No se inventa cumplimiento donde no lo hay: estos puntos quedan como checklist de verificación,
no como afirmación de que ya está resuelto.

## 7. Próximos pasos

1. Que alguien con la demo corriendo (Sebastián, mañana) ejecute `pytest tests/test_mvp.py -v` y
   suba la evidencia real de ejecución.
2. Repetir el despliegue Ngrok con `--host-header=rewrite` (corrige el plan anterior).
3. Definir "Casos de prueba" y "Resultados de las pruebas" como documentos separados si la pauta
   de Fase 2 los pide como entregables distintos de este plan (ver `PLAN_FASES_COMPONENTES.md` §10).
4. Una vez exista IEEE 830 / Historias de Usuario, enlazar cada requisito con su prueba
   correspondiente en una matriz de trazabilidad formal.
