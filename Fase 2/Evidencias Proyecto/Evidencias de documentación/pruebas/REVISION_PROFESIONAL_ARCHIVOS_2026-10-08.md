# Estados y acciones del profesional sobre archivos — 8 de octubre

Solicitud de Sebastián: acciones coherentes con el flujo tras recibido para revisión.
Implementado: recibido -> confirmar recepción -> confirmado -> validar examen -> validado.
Desde recibido o confirmado se permite marcar con error, con motivo obligatorio de al menos
3 caracteres. Validado y error son estados finales; para corregir un error se sube una nueva
copia, conservando el archivo y la revisión original. Validado significa revisión humana del
documento en la demo; no significa diagnóstico, extracción ni scoring clínico.

El profesional vinculado ejecuta PATCH /api/v1/exam-documents/{id}/review con acción,
expected_revision, reason e Idempotency-Key. El backend exige exam:validate, feature,
client_id y vínculo activo y valida la transición. No basta con que el botón esté visible.
Paciente y profesional de otro tenant no pueden cambiar el estado. Escritura atómica del
estado, revisión, motivo, fecha, evento de auditoría y recibo de idempotencia. Control de
concurrencia por revisión: dos revisores simultáneos tienen un solo ganador. Bytes sin modificar.
Documentos anteriores sin campo revision siguen operativos como revisión 1, sin migración destructiva.

UI: los tres botones se habilitan según el estado; antes de confirmar no se puede validar.
Motivo mostrado al paciente cuando hay error. Historial desplegable con acción, fecha, actor
ficticio y observación. Estados y textos en es/en; se conservan temas y vistas móviles.

57 pruebas + 15 subpruebas aprobadas con MongoDB real, incluida suite previa, flujo/persistencia,
error/motivo, tenant/roles/features/vínculo, idempotencia/concurrencia/revisión y documento antiguo.
Resultado estructurado y salida completa: review-2026-10-08.xml/txt (texto con espacios finales
normalizados). Navegador completo aprobado sin errores de consola: confirmación, validación,
error sin motivo bloqueado, error con motivo guardado, estado visto por paciente, descarga,
cambio de perfil, es/en, temas y 390/428 px. Capturas en browser-review-2026-10-08/.

Cambio en rama local feature/wellq-evaluation-deploy. Sin push, PR nuevo ni URL pública.
Ngrok sigue pendiente de autenticación de la cuenta. Aceptación humana pendiente.
