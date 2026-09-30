# Base ejecutable D-E (datos sintéticos)

Desde la carpeta `wellq-base`, con Python 3.12+, biblioteca estándar y sin instalación de paquetes:

```sh
python -m unittest discover -s tests -v
python -m prototype.demo
```

La demo confirma un marcador inventado y obtiene su elegibilidad. Devuelve
`score: null` deliberadamente: no hay fórmula ni catálogo clínico aprobado.
No abre puertos, no usa archivos de pacientes, no llama a IA ni guarda datos.

## Implementado y límites

- D: funciones puras para confirmar, descartar, validar y rechazar; control
  de tenant, relación con paciente, permiso y feature; revisión esperada;
  comprobación de identidad y resolución explícita de baja confianza.
- E: compuerta de entrada y motivos de exclusión, con referencias a versiones.
  `confirmed` basta para ser elegible (§7.1 del Documento Maestro).
- C: modelos internos tipados para un panel numérico sintético; **no son el
  JSON canónico v1 completo**. Conservan propuesta y copia confirmada.
- Auditoría: eventos de éxito con cinco dimensiones e intención de encolar
  o invalidar puntaje. Son valores retornados, **no un outbox ni un log durable**.

`Context` representa datos ya verificados por un servidor futuro. No acepta
peticiones HTTP ni verifica JWT. No conectarlo directamente a una ruta pública.
`patient_ids` representa vínculo propio (paciente) o relación asistencial
(clínico); un adaptador debe obtenerlo de la autoridad real, nunca del body.

Las dataclasses son objetos internos, no validadores de JSON no confiable.
No hay persistencia, CAS atómico, idempotencia, edición de marcadores, catálogo
real, validación por campo, HTTP, Flutter, portal ni calculadora clínica.
La revisión esperada detecta entradas obsoletas; la concurrencia real requiere
compare-and-swap en la base de datos. Reintentos de HTTP necesitarán un almacén
idempotente por tenant/actor/ruta/clave y hash del payload.

El umbral `0.9`, los permisos y las features son convenciones de prueba,
pendientes de homologar. El rechazo clínico usa el estado interno `rejected`;
el adaptador deberá mapearlo al contrato definitivo. La demo es monoproceso
y no demuestra aislamiento en MongoDB/PostgreSQL, JWT ni auditoría inmutable.

## Integración siguiente

El servicio transaccional deberá guardar estado, ediciones, evento y outbox
en una unidad atómica; registrar denegaciones por una vía independiente del
rollback; enviar el job a un worker. La propuesta original se conserva.
El worker debe comprobar extracción/revisión vigentes antes de guardar un
snapshot para que un trabajo atrasado no publique datos rechazados.

Ver [arquitectura](../../../../Evidencias%20de%20documentaci%C3%B3n/arquitectura/ARQUITECTURA_BASE.md) y
[prioridades](../../../../Evidencias%20de%20documentaci%C3%B3n/arquitectura/PRIORIDADES_DE_FG_ABC.md) para el alcance restante.
