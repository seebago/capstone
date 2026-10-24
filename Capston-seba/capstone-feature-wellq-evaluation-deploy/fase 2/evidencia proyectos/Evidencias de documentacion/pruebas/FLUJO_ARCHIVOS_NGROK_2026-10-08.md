# MVP: carga del paciente y entrega automática al clínico

Cambio solicitado por Sebastián el 8 de octubre: paciente solo sube el archivo y el destinatario
se deriva de la relación de atención guardada en el backend/BD. No elige médico, tenant ni paciente.

## Implementado y probado localmente

La UI del paciente muestra carga y archivos enviados; se retira el formulario de valores/caso.
PDF sin contraseña, PNG y JPEG, máximo 4 MiB. La comprobación de formato/contenido es en backend.
La carga se recibe como cuerpo binario con Content-Type, X-File-Name codificado e Idempotency-Key;
no usa multipart ni constituye todavía el contrato de producción de carga del WellQ real.
POST /api/v1/exam-documents; GET /api/v1/exam-documents;
GET /api/v1/exam-documents/{document_id}/file (JWT obligatorio, descarga como attachment).

patient_id/client_id provienen del usuario autenticado. El backend consulta care_team_links activos
 y clínicos activos del mismo tenant. Se guarda la lista de clínicos vinculados en el momento de
la carga. Cada lectura exige además que la relación siga activa. No hay vínculo => 409
NO_TREATING_CLINICIAN; no se almacena ni se entrega a otro médico por defecto.
Los bytes, metadatos y auditoría de carga se insertan juntos en exam_documents (client_id obligatorio).
El clínico vinculado recibe el archivo sin esperar una confirmación de valores por el paciente.
No se extraen ni interpretan datos clínicos. Recibido no equivale a validado.

El formulario de creación estructurada desaparece de la UI. Los endpoints históricos para crear
y confirmar valores se deniegan por defecto a pacientes; WELLQ_STRUCTURED_DEMO=true es una
compuerta exclusivamente para reproducir las pruebas anteriores en entorno sintético aislado.
No habilitar esa variable en la evaluación por ngrok. El dominio, el código previo y sus evidencias
se conservan. La consulta de documentos aplica JWT/RBAC/features/tenant/vínculo; auditoría con
actor, acción, fecha, origen y resultado. Se conserva i18n es/en y temas claro/oscuro.

ST-027 sigue parcialmente pendiente: se consume la asociación real desde la BD, pero no se creó
un rol ni endpoint de administración para asignarla. La demo usa vínculos sintéticos sembrados.
La administración deberá definirse con el sistema completo/equipo clínico.

## Verificación del 8 de octubre

50 pruebas y 15 subpruebas aprobadas contra MongoDB real. Salida y XML: uploads-2026-10-08.*.
Incluye archivos vacíos/corruptos/cifrados, MIME y nombres inválidos, tamaño, PNG/JPEG/PDF,
identidad/destino falsificados, roles/features, aislamiento, revocación del vínculo, persistencia
y reintentos. Se mantienen las pruebas originales en modo de fixture estructurado explícito.
Navegador: paciente carga PDF sintético, clínico Alpha recibe y descarga exactamente los mismos
bytes, Beta no ve el archivo, UI de valores ausente en paciente, es/en, claro/oscuro, 390/428 px,
logout/recarga. Sin errores de consola. Evidencias en browser-uploads-2026-10-08/.
Una descarga inicial fue cancelada en el entorno de QA; se ajustó el enlace/vida del blob y se
usó directorio temporal de trabajo; ensayo completo posterior aprobado.

## Ngrok: intento real y bloqueo

Agente 3.39.11 descargado desde el sitio oficial en qa-2026-10-08/ngrok (fuera del repositorio).
ngrok http 8765 --host-header=rewrite llegó al servicio, rechazado ERR_NGROK_4018 por falta
 de autenticación. No hay URL pública y no se declara despliegue completado.
El flag de rewrite sigue aceptado, con aviso de deprecación en esta versión.
El usuario autorizó exponer el MVP por ngrok. Falta configurar su cuenta/authtoken de forma privada.
configure-ngrok.ps1 pide el token con entrada oculta y guarda .runtime/ngrok.yml excluido de Git;
su sintaxis PowerShell fue comprobada sin ejecutar la captura de un secreto.
La opción -StartTunnel comprueba health y usa --inspect=false para no capturar cuerpos/credenciales
 en la inspección HTTP local de ngrok. Se verificará externamente el enlace una vez autenticado.

No publicar secretos ni datos médicos reales. La validación de formatos no es un escáner antivirus
ni prueba que el contenido sea ficticio: la evaluación debe usar exclusivamente archivos sintéticos.
Aceptación humana pendiente. Sin push/PR nuevo: autorización de publicación de Git aún pendiente.
