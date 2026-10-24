# Entrada de demostración sin clave — 8 de octubre de 2026

Solicitud directa de Sebastián: reemplazar login/clave de evaluación por dos botones.
Implementado: Entrar como paciente y Entrar como profesional. Ambos usan personas sintéticas
Alpha ya relacionadas en la BD. Cambiar perfil vuelve a la pantalla inicial; sin registro,
correo, contraseña ni autenticación de identidad real en esta entrada.

El backend mantiene contextos JWT internos para no eliminar RBAC, client_id, features y vínculos.
POST /api/demo/session admite exclusivamente role=patient o clinician, con identidades fijas
 de demo_alpha, sin admitir un ID/tenant arbitrario. No acredita identidad del humano que pulsa
el botón; la auditoría registra la persona ficticia seleccionada. El servidor revisa que la
persona siga activa y registra select_demo_profile con actor, acción, fecha, origen y resultado.
WELLQ_DEMO_ROLE_ACCESS tiene valor predeterminado false; run_local.py lo activa para esta demo.
El acceso sin clave está autorizado por el usuario para el MVP ficticio. No aplicar a usuarios
reales ni bases médicas reales. La ruta de contraseña histórica se conserva para pruebas/API,
pero no aparece en la UI ni se necesita en la evaluación actual.

52 pruebas y 15 subpruebas aprobadas con MongoDB real: perfiles fijos, roles, rechazo de admin,
rechazo de tenant impuesto, modo deshabilitado y persona revocada; se conserva toda la suite
 anterior. Navegador: dos botones sin inputs email/password, paciente carga PDF, profesional
recibe/descarga idénticos bytes, cambio de perfil, es/en, claro/oscuro y 390/428 px. Sin errores
de consola. Salida/XML profiles-2026-10-08.* y capturas browser-profiles-2026-10-08/.

La demo local fue reiniciada. Ngrok sigue pendiente del authtoken; sin URL pública comprobada.
El authtoken del servicio sigue siendo necesario y no es una clave de evaluación de la app.
Sin push ni PR nuevo. Validación humana pendiente; evidencias previas conservadas.
