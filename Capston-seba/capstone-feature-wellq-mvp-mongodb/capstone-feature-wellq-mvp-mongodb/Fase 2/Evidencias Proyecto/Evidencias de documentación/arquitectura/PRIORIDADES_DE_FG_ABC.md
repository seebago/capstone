# WellQ: base inicial y prioridades DE-FG-ABC

Fecha: 2026-09-29. Estado: propuesta de ejecución y prototipo sintético,
pendiente de revisión humana. No acredita aprobación de Alloxentric.

## Fuente y decisión de trabajo

La tabla §1.1 del `Documento_Maestro_Proyecto_Examenes_Medicos_WellQ.docx`
define A–G. Las dos imágenes de la conversación «Iniciar proyecto y Git»
reproducen esa tabla y la instrucción docente `DE-FG-ABC`. El pedido del
usuario del 29 de septiembre requiere incorporar esa estructura.

Se organiza el backlog en **DE → FG → ABC**. Se trata como prioridad de
entrega para esta base; no se presenta como una respuesta formal a ST-017.
El contrato mínimo C y fixtures sintéticos habilitan D/E desde el principio;
no se necesita terminar la carga A ni llamar a un LLM B para demostrarlos.
Esto ajusta el plan anterior que empezaba por C/A, sin borrar su historial.

## Matriz de alcance y aceptación

| Bloque | Componente | Primera entrega verificable | Dependencias y siguiente paso | Estado de esta base |
|---|---|---|---|---|
| 1: DE | D. Confirmación y validación | Paciente confirma/descarta; clínico relacionado valida/rechaza; preservar propuesta y autoría; impedir valores sin resolver | C mínimo; luego edición, validación por campo, JWT, persistencia, CAS e idempotencia | Reglas puras y pruebas; sin pantallas ni endpoints |
| 1: DE | E. Puntuación | Solo `confirmed`/`clinically_validated`; motivos explícitos de exclusión; versiones de entrada | Catálogo/rangos/pesos aprobados; fórmula, cobertura, snapshots y recálculo | Compuerta de elegibilidad; **no se calcula puntaje** |
| 2: FG | F. Reportería clínica | Tabla por examen, historia por marcador, cobertura/desglose; PDF con autorización y auditoría | D/E persistidos; relación asistencial; contrato de reporte | Diseñado, sin UI ni PDF |
| 2: FG | G. App paciente | Ver exámenes propios y confirmar; cola Drift con recuperación y reintentos | D y contrato A; integración Flutter existente | Diseñado; sin app nueva ni worker |
| 3: ABC | A. API de carga | Implementar los 11 endpoints existentes, cuarentena y finalización idempotente | FastAPI/GCS según documentación; ratificar entorno, JWT y DB | Se reutiliza la especificación; sin servidor |
| 3: ABC | B. Extracción | Adaptador tras gateway; salida validada contra C, evaluación y revisión humana | ST-004, proveedor/región, catálogo y conjunto de evaluación | Diferido; sin llamadas a IA |
| 3: ABC | C. JSON canónico completo | Sangre, orina e imagen, versiones, unidades, confianza por campo y procedencia | Contrato §6, catálogo y adaptadores | Modelo interno reducido para habilitar DE; no contrato v1 completo |

## Hitos y dependencias

El HITO 1 registrado (28 sep–3 oct) pide base de datos operativa. **Esta
entrega no cumple todavía ese criterio**: el prototipo no persiste datos.
La siguiente entrega debe resolver ADR-006/ST-016 y conectar un repositorio
de datos con un flujo D de extremo a extremo, conservando el orden DE-FG-ABC.
No afirmar que la demo equivale al MVP solicitado por la profesora.

Secuencia propuesta:

1. Revisar esta base: reglas D/E y alcance; asignar responsables humanos.
2. Ratificar backend/DB y acceso al entorno de Max; definir vínculo
   `clinic_id` ↔ `client_id` y resolver identidad/membresía desde servidor.
3. Persistir extracción sintética, confirmación y outbox; demostrar lectura
   tras reinicio e impedir acceso entre tenants y entre pacientes.
4. Agregar correcciones con historial y catálogo; idempotencia, CAS y
   workers; E numérico solo con parámetros versionados y revisados.
5. F/G con respuestas sintéticas primero y luego API integrada; textos
   externos al código, inglés inicial según el contexto registrado, i18n
   preparado y temas claro/oscuro. La app paciente no muestra puntajes.
6. Completar A/B/C: mantener estados de subida y extracción separados;
   la caída del extractor no debe impedir guardar un archivo validado.

HITO 2 (26–31 oct): contenedores y ejecución reproducible de la integración.
HITO 3 Duoc (16–28 nov): E2E, documentación, evidencias y entrega. Fechas
tomadas de la bitácora existente; no se han reconfirmado con la docente.

## Historias y criterios para el siguiente PR

| ID | Historia | Aceptación observable |
|---|---|---|
| DE-01 | Como paciente confirmo una transcripción de mi examen | Valor, unidad, referencia e identidad pendientes bloquean; propuesta original permanece |
| DE-02 | Como clínico reviso un examen de mi paciente | Sin relación asistencial se rechaza; validación conserva confirmación del paciente |
| DE-03 | Como sistema evito un puntaje obsoleto | Rechazo/reprocesamiento invalida snapshots; job atrasado no publica; versión cambia al corregir |
| DE-04 | Como revisor explico un cálculo | Incluidos/excluidos con razón; catálogo y scoring versionados; no numérico mientras no exista política aprobada |
| FG-01 | Como clínico comparo exámenes | Series separan unidades incompatibles y cambios de versión; cobertura visible |
| FG-02 | Como paciente recupero una subida interrumpida | Un solo clinical_test_id; no borrar archivo local con processing/rejected |
| ABC-01 | Como integrador mantengo contratos existentes | Los 11 endpoints A conservan nombres/semántica; C v1 completo se valida antes de B |

No se asignan nombres, fechas de aprobación ni cierres de pendientes sin
evidencia. El reparto entre los tres integrantes se acuerda en revisión.
