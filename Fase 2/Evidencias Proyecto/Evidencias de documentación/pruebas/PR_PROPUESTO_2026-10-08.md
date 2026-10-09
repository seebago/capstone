# PR propuesto (pendiente de autorización de publicación)

Título: Integrar MVP y carga de exámenes con entrega automática al médico vinculado
Base: main
Rama: feature/wellq-evaluation-deploy

Main tiene documentación actual de Fase 2 pero no el MVP. Esta rama reúne el código y las
 evidencias existentes con main 7e9094f y conserva la documentación de Vicente.

La vista del paciente ahora permite subir PDF/PNG/JPEG en vez de crear o confirmar valores.
Por ejemplo, un paciente Alpha adjunta un PDF sintético; el backend obtiene su identidad y
el vínculo con el clínico desde MongoDB y el profesional recibe/descarga el mismo archivo.
No hay selección de médico en el cliente; no tener vínculo bloquea la carga. Cada lectura
requiere tenant, rol, feature y vínculo activo. La carga conserva bytes/metadatos/auditoría
 en una inserción e idempotencia por clave. Los endpoints históricos de creación/confirmación
 quedan denegados por defecto para el paciente y disponibles solo como fixtures explícitos.

Prepara entrypoint y hosts exactos para Vercel, y asistente ngrok con captura local oculta del
authtoken. Sin secretos en Git. No hay administración de vínculos (ST-027), extracción,
interpretación clínica ni diagnóstico. No se incorpora el pivote móvil.

Entrada actual: dos botones paciente/profesional, sin correo ni clave, con personas ficticias
Alpha fijadas por el backend. Modo directo explícito, deshabilitado por defecto fuera del
arranque local. RBAC/tenant/vínculos se conservan; no autentica la identidad de un humano.

Validación local 8-oct: 57 pruebas + 15 subpruebas con MongoDB real. Navegador: carga paciente,
recepción/descarga idéntica por médico vinculado, aislamiento Alpha/Beta, i18n, temas y 390/428 px,
sin errores de consola. Evidencias de ambas iteraciones preservadas en Fase 2/pruebas.

Ngrok instalado; intento real rechazado ERR_NGROK_4018 porque aún falta configurar la cuenta.
Sin URL pública. Build cloud, red/Atlas, smoke externo, CI de rama publicada y aceptación humana
pendientes. Los PR anteriores se mantienen; revisar con el equipo cómo sustituir la cadena #1/#2.

Revisión profesional añadida: confirmar recepción antes de validar, o marcar error con motivo.
Estado y auditoría persistidos atómicamente con revisión e idempotencia; visibles al paciente.
Originales y evidencias anteriores conservados. Pruebas incluyen concurrencia, permisos y legado.
