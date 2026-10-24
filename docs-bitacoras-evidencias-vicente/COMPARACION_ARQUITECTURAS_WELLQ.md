# Comparación de arquitecturas y definición WellQ v0.1

**Proyecto:** WellQ medical exams / Capstone para Alloxentric
**Versión:** 0.1 · **Fecha de corte:** 5 de septiembre de 2026
**Estado:** propuesta técnica consolidada para revisión del equipo y Alloxentric. No acredita implementación ni aprobación jurídica o productiva.

## 1. Propósito, fuentes y alcance

Este documento consolida la arquitectura inicial de ChatGPT y los aportes atribuidos a Gemini en la conversación «Iniciar proyecto WellQ». Define una base viable para tres integrantes: Vicente López, Sebastián González y Aron Germain, con evolución explícita hacia mayores garantías de seguridad.

Las fuentes del proyecto fijan aislamiento por `client_id`, RBAC granular validado mediante JWT, Feature Gating en backend, auditoría de cinco dimensiones e interfaz i18n con Light/Dark Mode. La guía complementaria exige API-First y frontend desacoplado. Infraestructura, alcance de IA, tiers y tratamiento de datos médicos permanecen abiertos para Max Khreimerman y Karina Álvarez.

**Trazabilidad y limitación de origen:** se revisaron el PDF central y la guía de contexto disponibles en el proyecto, así como la conversación completa accesible. El archivo adjunto original de Gemini no está disponible en esta sesión; su propuesta y las afirmaciones que se corrigen se reconstruyen desde la comparación detallada conservada en esa conversación, no desde una nueva lectura directa del adjunto. Las fuentes legales y técnicas enlazadas se verificaron de forma independiente. No se atribuyen a Gemini citas textuales no comprobadas.

En este documento, **adoptada para v0.1** significa decisión de esta propuesta documental. Su incorporación al baseline del equipo se ratificará mediante revisión. **Condicionada** requiere una respuesta de negocio, infraestructura o privacidad antes de producción. **Postergada** conserva una alternativa sin comprometer su implementación.

## 2. Comparación y decisiones

| Área | Propuesta inicial ChatGPT | Gemini, según conversación de origen | Decisión WellQ v0.1 y motivo |
|---|---|---|---|
| Arquitectura | API-First, frontend separado | API-First y API Gateway | Adoptar API-First y monolito modular; gateway de infraestructura según hosting |
| API | REST + OpenAPI | REST | Adoptar REST versionada y contrato OpenAPI |
| Frontend | React + TypeScript + Vite | Next.js | Adoptar React/Vite; no hay necesidad confirmada de SSR |
| Backend | NestJS + TypeScript | NestJS | Adoptar NestJS y módulos con límites explícitos |
| Persistencia | PostgreSQL, inicialmente Supabase | PostgreSQL | Adoptar PostgreSQL; hosting definitivo condicionado |
| Multi-Tenancy | Esquema compartido, client_id + RLS | Schema-per-Tenant + RLS | Adoptar client_id + RLS en MVP; menor coste de migración y operación |
| Autenticación | Supabase Auth + JWT | Keycloak/Auth0 | Recomendar Supabase Auth para MVP, sujeto a autorización de proveedor/región |
| RBAC | Roles y permisos | JWT y Guards | Adoptar permisos por membresía y tenant, comprobados en backend |
| Feature Gating | Middleware/Guards | Guards y HTTP 402 | Adoptar guard comercial separado y HTTP 403 con código de dominio |
| Identidad y clínica | Separación lógica | Separación física | Adoptar separación lógica con acceso diferenciado y UUID |
| Auditoría | Append-only | SQS/Kinesis, hashes y S3 Object Lock | Adoptar append-only acotado para MVP; WORM condicionado al riesgo y aceptación |
| IA | AI Gateway | Gateway de sanitización | Adoptar interfaz de gateway con minimización y políticas; casos de uso pendientes |
| Cifrado | Medidas generales | Claves por tenant | TLS y cifrado en reposo; claves por tenant postergadas |
| Cloud | Sin definir | AWS | No cerrar proveedor, región ni presupuesto sin stakeholders |
| Git | Git Flow ligero | GitHub Flow adaptado | Ramas cortas y PR; develop cuando el equipo la establezca |
| Legal | UK/Chile por precisar | UK GDPR, DPA y leyes chilenas | Actualizar DUAA, vigencias y obligaciones condicionales |

La simplicidad operativa no elimina controles obligatorios. Una solución dedicada tampoco elimina errores de autorización, credenciales comprometidas o accesos privilegiados. La selección debe justificarse por amenazas, escala, contrato y capacidad de operación.

## 3. Arquitectura de referencia y stack recomendado

```text
Navegador: React + TypeScript + Vite
    | HTTPS / REST / contrato OpenAPI
    v
NestJS
    Autenticación -> TenantContext -> RBAC -> Feature Gate
    -> validación de entrada -> servicios de dominio
       |-> PostgreSQL: client_id + RLS
       |      identidad / clínica / membresías / planes
       |-> auditoría durable y outbox
       |      -> AuditSink -> append-only; WORM en evolución
       |-> AI Gateway -> políticas -> proveedor aprobado
       |-> almacenamiento privado de documentos, si se confirma
Proveedor de identidad -> JWT verificado por NestJS
```

**Frontend:** React, TypeScript, Vite, React Router, TanStack Query, react-i18next y variables CSS para temas. La recomendación responde al carácter autenticado del producto; reexaminar Next.js si aparece un caso concreto de SSR o portal público. Evitar caché pública de contenido clínico; separar claves de caché por tenant y limpiarlas al cambiar de organización o cerrar sesión.

**Backend:** NestJS, REST y OpenAPI; módulos `auth`, `tenants`, `users`, `roles`, `plans`, `features`, `patients`, `exams`, `audit` e `ai`. Los módulos encapsulan reglas; no se requieren microservicios para la primera entrega. Establecer validación de DTO, paginación, límites de peticiones y errores estables sin datos clínicos.

**Datos y operación:** PostgreSQL y migraciones SQL versionadas, proveedor de identidad abstraído y almacenamiento de objetos privado si se necesitan adjuntos. Supabase es una recomendación inicial, no una autorización para subir datos reales. Seleccionar ORM y versiones al implementar, comprobando compatibilidad con RLS y transacciones; fijar versiones y lockfiles. CI verificará contratos, migraciones, pruebas de aislamiento y compilación. Desarrollo y demostraciones usarán datos sintéticos por defecto.

La interfaz soportará idioma por usuario con fallback acordado, fechas y números localizados, zona horaria explícita y modo claro/oscuro. Español/inglés, accesibilidad, dispositivos y navegadores concretos se validan en el banco de preguntas.

## 4. Multi-Tenancy: client_id + RLS para el MVP

### 4.1 Invariantes de diseño

- Cada entidad perteneciente a un cliente incluye `client_id NOT NULL`; se documentan como excepciones los catálogos globales y la identidad de autenticación.
- Un usuario puede tener varias membresías `(user_id, client_id)`. Seleccionar un tenant en la UI es una solicitud: el backend comprueba membresía vigente antes de fijar TenantContext.
- Nunca confiar en un `client_id` arbitrario de cabecera, URL o cuerpo. El valor efectivo se deriva de identidad verificada y autorización del servidor; si aparece en la entrada, validar coincidencia o rechazarlo.
- RLS cubre lectura y escritura con condiciones para filas existentes y nuevas. Denegar por defecto; prohibir reasignar registros a otro tenant.
- Usar claves únicas y referencias compuestas `(client_id, id)` para impedir, por ejemplo, que un examen de A referencie un paciente de B. Indexar según consultas reales, incluyendo el tenant.
- Aplicar aislamiento también a adjuntos, exportaciones, búsquedas, cachés, trabajos en segundo plano y notificaciones. Un UUID difícil de adivinar no es autorización.

PostgreSQL permite que superusuarios y roles BYPASSRLS eludan RLS; el propietario normalmente también puede eludirla. El rol de ejecución de WellQ debe carecer de esos privilegios, y las tablas que corresponda usarán FORCE ROW LEVEL SECURITY. RLS no cubre por sí sola todas las operaciones administrativas. [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

### 4.2 Ruta de acceso recomendada

El navegador usa Auth para autenticarse y la API WellQ para operaciones de negocio. Se propone conectar NestJS con un rol SQL limitado y establecer usuario/tenant verificados mediante contexto **local a cada transacción**; todas las consultas de esa operación deben usar la misma transacción. Esto requiere políticas SQL propias: una conexión SQL directa no recibe automáticamente los claims de Supabase Auth.

No conservar contexto de tenant a nivel de sesión de una conexión reutilizada. Si se elige la Data API como alternativa, propagar el JWT del usuario y trasladar a políticas o funciones los controles de negocio necesarios para que un acceso directo no evada el Feature Gate.

En Supabase, no usar `service_role` como credencial de operaciones normales de usuario ni exponerla en frontend. Revisar permisos de esquemas, vistas, funciones y Storage; no confiar en metadatos editables por usuarios para autorizar. Los claims pueden quedar desactualizados hasta renovar el token. [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### 4.3 Criterios de aceptación antes de incorporar datos reales

| Escenario | Evidencia esperada |
|---|---|
| Usuario de A intenta leer, editar o exportar un recurso de B | Ningún dato de B revelado o modificado, incluidas respuestas de error |
| Petición manipula client_id o patient_id | Rechazo; referencias entre tenants imposibles |
| Tabla nueva carece de política | No queda accesible por omisión |
| Conexión del pool pasa de A a B | Contexto A no persiste |
| Miembro revocado conserva un JWT aún válido | Acceso sensible rechazado por estado vigente |
| Job, archivo o URL firmada de B se solicita desde A | Autorización y límites temporales verificados |
| Vista, función o rol privilegiado elude RLS | Ruta excluida del acceso ordinario y sometida a revisión específica |

Schema-per-Tenant y Database-per-Tenant son alternativas, no peldaños obligatorios ni una migración automática. Reabrir la decisión por contrato, residencia, cargas medibles o amenaza concreta. Requerirán diseño de migración, exportación/restauración por tenant, enrutamiento y costes. Schema-per-Tenant sigue siendo separación lógica dentro del mismo motor; no equivale a aislamiento físico.

## 5. Autenticación y RBAC

Supabase Auth se recomienda inicialmente detrás de una interfaz `IdentityProvider`, con futura integración OIDC/SSO mediante Auth0, Keycloak o Entra ID si se confirma la necesidad. Un cambio de proveedor implica plan de migración de identidades y sesiones.

Validar firma, algoritmo permitido, emisor, audiencia y expiración del JWT; controlar rotación de claves. La identidad autenticada (`sub`) no determina por sí sola el tenant ni el permiso. No tratar como autorización los metadatos que un usuario pueda editar. Definir expiración corta, renovación y comprobación de membresías/sesiones para revocaciones sensibles.

Modelo conceptual:

```text
users -> memberships(user_id, client_id, status)
memberships -> membership_roles -> roles(client_id)
roles -> role_permissions -> permissions
```

Los catálogos globales de permisos son administrados por la plataforma; la asignación de roles tiene alcance de tenant. Ejemplos: `exam:read`, `exam:create`, `exam:approve`, `patient:identity:read`, `users:manage`, `audit:read` y `ai:use`. Son propuestas, pendientes de matriz validada.

Cada operación exige membresía activa, permiso, pertenencia del recurso al tenant y restricciones clínicas aplicables. Los roles no sustituyen reglas como autoría, estado del examen, sede o doble aprobación. Ocultar botones mejora la experiencia, pero la decisión de seguridad corresponde al servidor.

Se propone MFA obligatorio para administradores y acceso a datos clínicos reales, sujeto a concretar métodos y recuperación. Es una decisión de seguridad basada en riesgo, no una transcripción literal de una ley que imponga TOTP. Soporte y emergencia requieren autorización limitada, motivo, caducidad y auditoría; no acceso transversal permanente por defecto.

## 6. Feature Gating separado del permiso

```text
Acceso = identidad válida
       + membresía/tenant autorizado
       + permiso RBAC
       + feature contratada y cuota disponible
       + reglas de dominio satisfechas
```

Modelar `plans`, `features`, `plan_features`, `subscriptions` y excepciones por cliente con vigencia. Basic/Premium son ejemplos, no planes aprobados. Verificar cambios de plan y cuotas en backend, también en jobs y exportaciones; consumir cuotas de forma atómica para evitar excedentes por concurrencia.

Para funcionalidad no contratada: HTTP 403 con `FEATURE_NOT_INCLUDED`; para falta de permiso: HTTP 403 con `PERMISSION_DENIED`. HTTP 402 permanece reservado para uso futuro en el estándar y no es un requisito de cumplimiento SaaS. [RFC 9110, sección 15.5.3](https://www.rfc-editor.org/rfc/rfc9110.html#name-402-payment-required).

```json
{
  "error": "FEATURE_NOT_INCLUDED",
  "feature": "advanced_ai",
  "requestId": "identificador-de-correlacion"
}
```

Acordar downgrade, gracia, suspensión, cuotas, compra de complementos y acceso de lectura/exportación. No borrar datos automáticamente por cambiar de plan.

## 7. Separación lógica de identidad y datos clínicos

El identificador de autenticación de un usuario y el identificador de un paciente son conceptos distintos. Un paciente puede no tener cuenta. Si tiene acceso, una relación explícita y validada lo vincula con su registro dentro del tenant.

| Entidad propuesta | Contenido y controles |
|---|---|
| patients | client_id, patient_id interno y estado |
| patient_identities | client_id, patient_id, nombre, documento y contacto mínimos; permiso específico |
| medical_exams / exam_results | client_id, patient_id, examen, resultado y versiones; evitar repetir identificadores |
| medical_documents | client_id, examen y referencia a objeto privado; política de acceso independiente |
| patient_user_links | Vínculo verificado entre cuenta y paciente, si se aprueba portal |
| audit_events | Referencias técnicas y acciones; evitar copias de informes clínicos |

Las relaciones clínicas conservan el mismo `client_id`. No fusionar automáticamente pacientes de dos tenants por RUT ni usar un documento nacional como clave pública. El UUID es seudónimo, no anonimización: datos y vínculos siguen sujetos a protección. Texto libre, fechas e imágenes pueden identificar incluso sin nombre.

Aplicar mínimo privilegio, cifrado en tránsito y reposo, gestión de secretos y revisión de descargas. No duplicar informes en logs, prompts, errores o métricas. Si se necesitan archivos, incorporar inspección de tipo/tamaño, malware, metadatos y URLs firmadas de corta duración.

Un Identity Vault separado físicamente y claves por tenant se evaluarán según amenaza y contrato. La separación lógica propuesta requiere permisos reales, no solo tablas con nombres distintos.

## 8. Auditoría append-only y evolución a WORM

### 8.1 Garantía y límite del MVP

El requisito de origen es auditoría inmutable. La implementación propuesta para MVP ofrece **append-only frente al rol de aplicación**, con separación de permisos y detección de alteraciones; no demuestra inmutabilidad ante administrador de base de datos o infraestructura.

Esta diferencia debe aceptarse explícitamente para la entrega. Si Alloxentric exige resistencia a esos actores desde el inicio, WORM deja de estar postergado. No declarar cumplida la inmutabilidad fuerte por crear una tabla de logs.

Cada evento contiene las cinco dimensiones obligatorias y contexto mínimo:

| Dimensión | Campos propuestos |
|---|---|
| Quién | actor_id, tipo de actor, client_id cuando corresponda |
| Qué | action, resource_type, resource_id |
| Cuándo | occurred_at y recorded_at en UTC |
| Desde dónde | IP obtenida mediante proxies de confianza, canal y user_agent minimizado |
| Resultado | success/denied/error y código sin datos clínicos |
| Correlación e integridad | event_id, request_id, versión del evento; hashes si se implementa cadena verificable |

Eventos de autenticación sin tenant validado se registran en un ámbito de seguridad separado, no bajo un client_id proporcionado por el atacante. Auditar transacciones, cambios de permisos/plan, accesos sensibles, descargas y uso de IA; confirmar alcance de lecturas con stakeholders.

Revocar UPDATE, DELETE y TRUNCATE al escritor; permitir inserción mediante ruta controlada y lectura con rol separado. No conceder propiedad de tablas o DDL al rol de runtime. Correcciones se expresan como nuevos eventos enlazados al original.

### 8.2 Durabilidad, orden y fallos

Para modificaciones clínicas, persistir evento/outbox en la misma transacción que el cambio: evitar el hueco entre guardar un resultado y enviar un mensaje. Un worker entrega el evento a AuditSink con reintentos, identificadores idempotentes, supervisión de retraso y cola de fallos. La tabla/outbox del MVP permanece separada del dominio operacional; el servicio de persistencia paralelo previsto por la guía se materializa en la evolución.

Los intentos rechazados o transacciones revertidas necesitan una ruta durable independiente del rollback. Si falla el registro obligatorio de una acción crítica, rechazar la operación y alertar; documentar tratamiento de lecturas y eventos no críticos. No descartar fallos silenciosamente.

Una cadena de hashes detecta cambios solo bajo un modelo de confianza definido: especificar serialización canónica, orden por partición, concurrencia, verificador y anclaje externo. Si el atacante puede reescribir toda la cadena, el hash local no impide la alteración. Los campos de hash no son garantía por sí solos.

### 8.3 Evolución productiva

```text
Transacción + outbox -> cola durable -> Audit Processor
    -> archivo WORM con retención definida
    -> índice de consulta reconstruible
```

S3 Object Lock es una opción si se adopta AWS; requiere versionado y política de retención. Governance permite bypass con privilegios específicos; Compliance impide sobrescribir o borrar versiones protegidas durante la retención incluso al usuario raíz. Elegir modalidad, legal hold y vencimientos antes de cargar información. [AWS: Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html).

WORM preserva lo recibido, pero no prueba que se hayan enviado todos los eventos. Mantener reconciliación entre outbox, cola, archivo e índice; probar pérdida, duplicación, restauración y alertas. Retención de auditoría y ficha clínica se definen por separado, incluyendo minimización y derechos de titulares.

## 9. AI Gateway

Toda llamada de IA se concentra detrás del gateway. El MVP puede demostrar esta frontera con un adaptador simulado hasta aprobar caso de uso, proveedor y datos.

Flujo propuesto: autorización RBAC/feature/cuota -> política por finalidad y tenant -> minimización/seudonimización -> proveedor aprobado -> validación de salida -> revisión humana cuando corresponda -> auditoría mínima.

Controles: lista de proveedores y regiones permitidos; secretos solo en servidor; timeout, límites de coste y reintentos acotados; salida estructurada; separación de instrucciones y documentos no confiables; impedir que un texto procesado autorice acciones. Un detector de identificadores puede fallar y no certifica anonimización.

| Nivel de uso | Ejemplos por validar | Tratamiento propuesto |
|---|---|---|
| Administrativo | OCR y clasificación | Evaluar sensibilidad de entrada y errores; no presumir riesgo bajo por el nombre |
| Apoyo clínico | Resumen y señalamiento de valores | Revisión humana y trazabilidad de versión/modelo; no reemplazar resultado original |
| Decisión clínica | Diagnóstico, predicción, tratamiento | Postergada hasta evaluación clínica, jurídica y regulatoria |

Registrar proveedor, versión de modelo y plantilla, finalidad, actor, tenant, coste/latencia y aprobación; guardar prompts completos solo si la finalidad y retención lo justifican, con acceso restringido. No habilitar entrenamiento con datos de pacientes por defecto.

Enviar datos a IA externa no está universalmente prohibido por el mero hecho de usar una API, pero exige base jurídica, contratos, minimización, transferencias válidas, seguridad y controles de retención/entrenamiento. WellQ propone bloquear datos identificables por defecto hasta esa validación. La consideración como dispositivo médico depende de finalidad prevista y funcionalidad; no basta con estar en un entorno sanitario. [MHRA: software applications](https://www.gov.uk/government/publications/medical-devices-software-applications-apps), [MHRA: software e IA](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device).

## 10. Correcciones importantes a la comparación de Gemini

Las atribuciones siguientes provienen de la revisión preservada en la conversación. Se corrigen también simplificaciones de los borradores de ChatGPT.

| Afirmación o simplificación reportada | Corrección que se adopta |
|---|---|
| RLS tiene riesgo alto y Database-per-Tenant riesgo nulo | No existen garantías de riesgo cero; comparar amenazas y operación verificable |
| Schema-per-Tenant equivale a separación física | Es separación lógica; comparte motor y puede compartir privilegios |
| HTTP 402 es la respuesta SaaS obligatoria | Usar 403 y código de dominio; ver sección 6 |
| PHI implica aplicar HIPAA | Usar datos de salud / special category data; HIPAA requiere análisis de alcance estadounidense |
| Publicación de Ley 21.719 el 14 de noviembre de 2024 | Publicada el 13 de diciembre de 2024; reforma principal vigente desde el 1 de diciembre de 2026 |
| Chile exige un plazo general de 72 horas | El futuro art. 14 sexies establece reporte sin dilaciones indebidas cuando concurre su supuesto |
| UK se agota en UK GDPR y DPA 2018 | Incorporar modificaciones DUAA 2025 y guía vigente |
| DPIA y DPO siempre obligatorios por ser software médico | Evaluar los supuestos legales concretos, incluida escala y riesgo |
| La ley exige literalmente TOTP/MFA | MFA se justifica como control de riesgo de WellQ |
| Todo dato debe conservarse 15 años | El mínimo chileno citado corresponde a ficha clínica bajo responsabilidad del prestador |
| Separar identificadores vuelve anónimos los datos | Es seudonimización si se puede reidentificar |
| Toda IA sanitaria es automáticamente dispositivo médico | Evaluar finalidad y funcionalidad; sección 9 |
| Nunca pueden salir datos clínicos hacia un proveedor externo | La legitimidad depende de tratamiento, contrato y salvaguardas; política interna por defecto restrictiva |
| Append-only o una cadena hash equivalen a WORM | Explicitar amenaza, privilegios, durabilidad y controles externos |
| Cambiar el proveedor o aislamiento no exige rehacer nada | Las interfaces ayudan, pero la migración tiene costes y debe diseñarse y probarse |

Los fundamentos técnicos se enlazan en las secciones 4, 6, 8 y 9; los legales se presentan a continuación.

## 11. Marco legal UK/Chile actualizado

Esta sección fija una base de diseño a la fecha de corte; las obligaciones concretas dependen de entidades, finalidades, contratos y datos aún por levantar. La nacionalidad de la empresa no basta para decidir todo el alcance territorial.

### 11.1 Reino Unido

Considerar **UK GDPR y Data Protection Act 2018, modificados por Data (Use and Access) Act 2025**. El DUAA modifica, no sustituye, el marco. La ICO indica que las disposiciones de protección de datos están vigentes desde el 19 de junio de 2026; no extender esa afirmación indiscriminadamente a toda disposición institucional del Act. [ICO: actualización DUAA](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-law-enforcement-agencies/), [ICO: calendario de entrada en vigor](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/02/statement-on-the-commencement-of-the-data-use-and-access-act-duaa/).

Los datos de salud son special category data: identificar una base del artículo 6 y una condición del artículo 9, además de condiciones complementarias DPA cuando apliquen. El consentimiento no es una solución universal para toda finalidad clínica. Documentar finalidad y base antes de tratar datos. [ICO: reglas sobre categorías especiales](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/).

Realizar evaluación inicial de DPIA y desarrollarla antes de tratamientos probablemente de alto riesgo. La obligación de DPO incluye autoridades públicas y ciertos tratamientos principales de observación sistemática o categorías especiales a gran escala; no se deduce solo de que el producto sea médico. Documentar decisión, responsable y escala. [ICO: DPIA](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-impact-assessments/), [ICO: DPO](https://ico.org.uk/DPOs).

Para brechas notificables, el responsable informa a la ICO sin demora indebida y, cuando sea factible, dentro de 72 horas desde conocimiento; si no hay probabilidad de riesgo para derechos y libertades, opera la excepción a notificar. El encargado avisa al responsable sin demora indebida; alto riesgo puede exigir comunicación a afectados. Registrar evaluación aunque no se notifique. [ICO: brechas de datos](https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/).

Propuesta de trabajo: inventario de tratamientos, contratos controller/processor, atención de derechos y reclamaciones, política de retención y revisión de decisiones automatizadas bajo el marco modificado. No asumir que supervisión nominal convierte una decisión automatizada en revisión humana significativa.

### 11.2 Chile

Al 5 de septiembre de 2026, considerar la Ley 19.628 vigente y normativa sanitaria aplicable. La Ley 21.719 fue publicada el 13 de diciembre de 2024; sus modificaciones principales entran en vigor el **1 de diciembre de 2026**. Existen disposiciones preparatorias anteriores: no confundir el comienzo del régimen general con toda actividad de implementación. [BCN: Ley 19.628](https://www.bcn.cl/leychile/Navegar?dt=open&idLey=19628), [BCN: Ley 21.719](https://www.bcn.cl/leychile/navegar?idNorma=1209272).

El artículo 14 sexies del régimen reformado exige reportar a la Agencia sin dilaciones indebidas cuando existe riesgo razonable para derechos y libertades; prevé comunicación a titulares en supuestos que incluyen datos sensibles. No establece allí un plazo general de 72 horas. Revisar instrucciones aplicables y obligaciones sectoriales al desplegar. [BCN: artículo 14 sexies](https://www.bcn.cl/leychile/navegar?idNorma=1209272).

La Ley 20.584, artículo 13, obliga a los prestadores a conservar la ficha clínica por al menos quince años. Determinar si WellQ la custodia y qué papel contractual cumple Alloxentric antes de aplicar ese plazo a una categoría de datos; no trasladarlo automáticamente a logs, cuentas o copias temporales. [BCN: Ley 20.584](https://www.bcn.cl/leychile/navegar?idNorma=1039348&idParte=9252051&idVersion=2024-05-28).

Propuesta de trabajo: matriz por finalidad y categoría, derechos, retención, incidentes y transferencias, preparada para la transición de diciembre. Validar custodio, acceso de pacientes y representantes, firma y corrección de resultados con asesoría sanitaria. No se declara que este diseño por sí solo acredite cumplimiento.

### 11.3 Transferencias y residencia

Mapear Chile -> UK, UK -> Chile y cada flujo a cloud, IA, correo, soporte, telemetría y backups. Incluir ubicación del operador y entidades legales, además de región del servidor. Un acceso remoto de otra organización puede constituir transferencia restringida; no todo acceso de un empleado de la misma entidad se clasifica igual.

Chile no figura en la lista de adecuación UK consultada. Para transferencias restringidas UK -> Chile, analizar salvaguardas como IDTA o cláusulas UE con UK Addendum y evaluación de transferencia. Tras DUAA, la legislación denomina esa evaluación data protection test; la ICO sigue usando TRA. Un contrato de encargado por sí solo no resuelve toda transferencia. [ICO: países con adecuación](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/adequacy-regulations/is-the-restricted-transfer-covered-by-adequacy-regulations/), [ICO: salvaguardas y evaluación](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/how-do-we-comply-with-the-transfer-rules-if-were-initiating-the-restricted-transfer/).

Para Chile -> extranjero, validar el régimen aplicable a la fecha efectiva del tratamiento y los instrumentos vigentes; no suponer que un mecanismo británico cumple automáticamente el régimen chileno. No se adoptan aquí cláusulas modelo chilenas específicas sin comprobar instrumento y aplicabilidad.

Antes de producción debe existir un registro de flujos con origen, destinatario, finalidad, datos mínimos, región, subencargados, retención, mecanismo jurídico, medidas adicionales y aprobador. Elegir región cloud después de cerrar este mapa.

## 12. Decisiones postergadas y disparadores de revisión

| Decisión pendiente | Información necesaria | Quién debe participar |
|---|---|---|
| AWS/Azure/GCP/Supabase, región y presupuesto | Provisión de entornos, contratos, residencia, costes | Max, Karina y responsable de infraestructura |
| Aislamiento dedicado / claves por tenant | Requisito contractual, amenaza o límite medido | Equipo técnico y seguridad |
| WORM en la primera entrega o fase posterior | Aceptación del límite append-only y retención | Alloxentric, seguridad y privacidad |
| SSO / proveedor de identidad definitivo | Directorio corporativo, protocolos y recuperación | Clientes y seguridad |
| IA, proveedor y datos autorizados | Finalidad, evaluación, revisión humana y contrato | Negocio, clínica y privacidad |
| Planes y cuotas | Matriz comercial y reglas de cambios de plan | Responsable comercial |
| Portal paciente y firma | Actores, representación y responsabilidad clínica | Stakeholder clínico |
| DICOM / HL7 / FHIR e integraciones | Casos de uso, versiones y sistemas reales | Dueños de integración |
| Retención, bases jurídicas y transferencias | Papel de cada entidad y mapa de datos | Privacidad y asesoría jurídica |
| SLO, RPO y RTO | Volumen, criticidad y presupuesto | Operaciones y negocio |

Estas decisiones no se cierran por inferencia de un análisis de IA. El [banco de preguntas](BANCO_PREGUNTAS_TOMA_REQUERIMIENTOS.md) identifica qué levantar.

## 13. Estrategia Git y ubicación documental

`contenido extra/` se ubica en la raíz porque la comparación y el banco complementan todas las fases. Se preserva la estructura de evidencias existente.

**Estado observado:** el remoto oficial `seebago/capstone` solo contiene la rama `main` a la fecha de preparación. Esta entrega usa `docs/contenido-extra-wellq` basada en ella y propone un PR hacia `main`, sin push directo ni merge automático. Si el equipo establece `develop` antes de integrar, revisar base y cambiar destino del PR.

**Modelo recomendado para el equipo:** `main` para versiones estables y `develop` para integración cuando se acuerde; ramas cortas `feature/*`, `fix/*` y `docs/*` desde la integración vigente. No crear `develop` unilateralmente solo para esta documentación.

Reglas propuestas: protección de ramas, PR y al menos una revisión de otro integrante, checks aplicables y Conventional Commits. Son recomendaciones; este documento no afirma que las protecciones ya estén configuradas. Repartir trabajo por módulos/documentos, mantener PR acotados y coordinar ediciones compartidas. No versionar secretos ni datos de pacientes.

Commit previsto:

```text
docs: add architecture comparison and requirements question bank
```

## 14. Próximos pasos y evidencia de aceptación

| Orden | Acción | Resultado verificable |
|---|---|---|
| 1 | Primera reunión con las 20 preguntas prioritarias | Alcance, responsables y pendientes fechados |
| 2 | Confirmar entrega del 12 de septiembre de 2026 citada en contexto | MVP y criterios de evaluación acordados |
| 3 | Ratificar decisiones y excepciones de v0.1 | Registro de aprobación, especialmente auditoría y hosting |
| 4 | Redactar IEEE 830, historias y criterios de aceptación | Trazabilidad pregunta -> requisito -> prueba |
| 5 | Diseñar ERD y matrices RBAC/features | client_id, claves compuestas, permisos y planes revisados |
| 6 | Modelar amenazas y flujos UK/Chile | Riesgos, medidas y decisiones de privacidad asignadas |
| 7 | Implementar un flujo vertical con datos sintéticos | Login -> tenant -> examen -> permiso/feature -> auditoría |
| 8 | Probar aislamiento y fallos | Casos de sección 4, revocaciones, concurrencia y pérdida de auditoría |
| 9 | Preparar operación y entrega | Backups restaurados en prueba, CI y responsables de soporte |
| 10 | Autorizar paso a datos reales | Evidencias técnicas, clínicas y jurídicas acordadas |

Este PR es documental: describe controles y pruebas futuras, no afirma haber implementado ni probado el sistema.

## 15. Fuentes de contexto y control de cambios

- **S1:** `Contexto_Sincronizacion_IA_WellQ_Capstone.pdf`, Documento Central de Sincronización: estándares, stakeholders y acciones inmediatas. Disponible como fuente de solo lectura del proyecto ChatGPT Capstone.
- **S2:** `guia-de-contexto-capstone.txt`, guía complementaria sobre API-First, RLS, auditoría y trabajo colaborativo. Sus indicaciones históricas se usan como contexto, no como evidencia de tareas ya ejecutadas.
- **S3:** [Conversación «Iniciar proyecto WellQ»](https://chatgpt.com/c/6a96036c-a018-83e9-94de-a31251c7527e), propuesta inicial, revisión indirecta de Gemini y banco original completo. Requiere acceso a la conversación.
- **S4:** Fuentes primarias técnicas y jurídicas enlazadas junto a cada afirmación; consulta al 5 de septiembre de 2026.

Los archivos fuente no se copian ni alteran en esta entrega. Al recuperar el adjunto original de Gemini, contrastar las atribuciones de las secciones 2 y 10 y registrar cualquier diferencia. Al cambiar alcance, ley, proveedor o garantías, actualizar versión, fecha, decisión afectada y evidencia de aprobación.
