# MVP de pruebas con MongoDB e interfaz

Inicio: 30 de septiembre de 2026. Actualización: 1 de octubre de 2026.
Próximo hito posible: sábado 3 de octubre.
Autoría: Codex a solicitud del usuario. Validación humana pendiente.

## Decisión y alcance

El usuario entregó `WellQ_Modelo_de_Datos.docx` y solicitó aplicar ese
modelo y construir una interfaz simple para probar el avance. Esta solicitud
autoriza implementar MongoDB en el entorno de demostración, superando el
bloqueo técnico del prototipo anterior para este alcance. No se atribuye
una ratificación de producción a Max o Karina ni se cierra la aprobación
de infraestructura, datos reales o parámetros clínicos.

Se leyó el documento completo y su diagrama. El documento describe el
modelo de WellQ, no un requerimiento para recrear todas sus funciones en
este Capstone. El MVP integra un subconjunto de entidades con las reglas
de confirmación ya publicadas y preserva los componentes restantes.
El documento original se conserva fuera de Git y no se publica.

## Correspondencia con el modelo recibido

| Colección | Campos reutilizados | Uso del MVP |
|---|---|---|
| patients | patient_id, first_name, last_name, contact, ids, metadata, state, status, created_at, updated_at | Pacientes ficticios Alpha/Beta; identidad separada del examen |
| clinics | name, address, state, metadata, created_at, updated_at | Sedes ficticias; clinic_id de demo identifica la relación |
| clinicians | first_name, last_name, clinic_id, clinic_ids, contact, specialties, state, validated | Perfiles de revisión asociados a una sede |
| cases | patient_id, title, status, start_date, diagnosis_codes, treatment_goals, timestamps | El examen debe referenciar un caso del mismo paciente y tenant |
| users | email, email_norm, password_hash, roles, state, subject.kind, subject.id, timestamps | Acceso y rol del usuario obtenidos del servidor |

`clinical_test` no aparece en la tabla de colecciones entregada; se agrega
como extensión del módulo descrito en el Documento Maestro. No se añade
una relación clínica inexistente por suposición: se modela explícitamente
en una colección nueva de demostración.

| Extensión | Justificación |
|---|---|
| client_id en cada documento | Aislamiento requerido por el Capstone. No es el client_id de oauth2_clients, que identifica una aplicación OAuth |
| tenants | Organización comercial y lista de funcionalidades habilitadas |
| care_team_links | Relación explícita paciente/profesional/sede; no asumir acceso por pertenecer a la misma clínica |
| clinical_tests | Examen, referencia al caso, extracción, propuesta, copia confirmada, correcciones, revisiones, historial y recibos idempotentes |
| security_events | Denegaciones de transiciones registradas sin valores clínicos |

Los identificadores string y las claves clinic_id/clinician_id/case_id
de demo son una convención de integración pendiente de homologar con los
identificadores exactos del backend de Max. El documento no fija su tipo
BSON. No se convierten ni migran identificadores reales.

No se replican por ahora: wearables, checkins, ejercicios/KineIA, agenda,
SOAP, RAG, comunicaciones, consentimientos legales ni OAuth de producción.
No son necesarios para demostrar el flujo prioritario de exámenes D/E.

## Persistencia y consistencia

MongoDB real con datos en disco. Cada consulta de dominio lleva client_id
y el conjunto de pacientes autorizados. Hay índices compuestos por tenant
y claves de entidad; el registro de examen comprueba la relación caso y
paciente. Las colecciones rechazan documentos sin client_id.

Cada transición escribe estado, autoría, correcciones, evento y recibo
idempotente en una sola actualización atómica del documento clinical_tests.
El filtro incluye revisión y extraction_id esperados. Dos solicitudes
simultáneas no pueden confirmar la misma revisión dos veces. No se promete
una transacción entre colecciones ni un outbox: no hay worker de puntaje
en este MVP y `score_status` declara catálogo pendiente o exclusión.

La propuesta original se preserva al corregir un valor. El historial guarda
el valor original/corregido en el registro clínico protegido; el evento de
auditoría solo contiene códigos y actores, sin valores ni motivo libre.
La revisión específica de identidad y baja confianza conserva autor, fecha,
motivo y la política versionada `demo-review-v1` con umbral 0.9. Es una
configuración de prueba, no un umbral clínico aprobado.

## Interfaz para probar el avance

Web servida por FastAPI, con español/inglés y temas claro/oscuro. Incluye
login por perfil, historial de exámenes, formulario sintético, edición del
valor, cotejo de identidad/confianza, confirmación/descarte, validación/
rechazo clínico y cronología. Paciente no ve puntuación; clínico puede
consultar elegibilidad y un aviso de catálogo pendiente.

Esta interfaz es un banco de pruebas del API. No reemplaza React del portal
de producción ni Flutter/Drift del paciente. No se solicitan claves de IA.

## Seguridad y límites conocidos

JWT con firma HS256, audiencia, emisor y expiración de 45 minutos. Estado
del usuario, rol, tenant, vínculo con paciente y features se consultan en
servidor, no se toman del cuerpo enviado por el navegador. Claves aleatorias
de demo fuera de Git, contraseñas con PBKDF2 y limitación local de login.

El MongoDB de demostración escucha solo en loopback y no tiene TLS ni
autenticación propia. El API tiene restricción de host local. Esto no es un
despliegue para red o datos reales. La auditoría persistente no es WORM ni
resistente al administrador del motor. La cobertura de denegaciones es
parcial. Logout borra el token del navegador; no revoca individualmente
un JWT ya emitido. La integración con identidad y OAuth de WellQ queda abierta.

El formulario solo admite dos marcadores ficticios; sin carga PDF, GCS,
LLM, puntaje médico ni extracción. La confirmación habilita elegibilidad;
el clínico valida como segunda puerta. Rechazo excluye el examen.

## Verificación

37 pruebas automatizadas aprobadas: 22 del dominio original y 15 de
integración con MongoDB real. Comprueban idempotencia, concurrencia,
preservación de la propuesta, rechazo clínico, JWT vencido/manipulado,
revocación del usuario, features, tenant cruzado y paciente sin vínculo.
La persistencia se verifica creando, confirmando, cerrando y abriendo otra
instancia del API contra la misma base. Las BD de prueba son aisladas y
se eliminan al finalizar; los datos de la demo permanecen.

El 1 de octubre se añadió una prueba del límite de bases de demostración
y rechazo de hosts externos. Resultado local: 37 passed, 15 subtests passed.
El script de arranque pasó el análisis de sintaxis de PowerShell; su
instalación completa en otro equipo sigue pendiente de ensayo.

## Adaptación visual solicitada el 1 de octubre

Referencia proporcionada por el usuario: [WellQ app en App Store](https://apps.apple.com/cl/app/wellq-app/id6755544981).
La ficha pública se consultó y se localizaron las URL de las capturas.
El navegador integrado falló al iniciarse por un error de ACL del entorno.
Se solicitó autorización para usar un navegador automatizado alternativo,
como exige la habilidad de diseño. Hasta disponer de captura y comparación
visual, no se declara que la interfaz actual reproduzca la identidad de
WellQ ni que la prueba de navegador esté aprobada. Estado detallado en
`wellq-base/design-qa.md`. La UI existente continúa como banco de pruebas.

## Guion y prioridades hasta el sábado

1. **Miércoles:** base MongoDB, API y recorrido de pruebas ejecutable.
2. **Jueves:** revisión del equipo del mapeo, permisos y alcance; confirmar
   si la docente requiere carga de archivo o basta captura estructurada.
3. **Viernes:** ensayo del recorrido paciente → clínico, reinicio y acceso
   desde el equipo que se usará para la entrega. Registrar hallazgos.
4. **Sábado 3:** presentar el recorrido comprobado y sus limitaciones.

No se promete completar A–G en tres días. Este incremento permite demostrar
una base operativa y revisión humana; aceptación del MVP y del alcance
académico corresponde a la docente y al equipo.

## Referencias técnicas consultadas

- Modelo recibido: WellQ_Modelo_de_Datos.docx, secciones 1–4 y 11.
- Documento Maestro y revisión del equipo `REVISION_38830fa_wellq-base.md`.
- FastAPI: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- MongoDB PyMongo: https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/
- MongoDB queries: https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/query/find/
