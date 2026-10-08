> Acceso actualizado: paciente y profesional entran mediante dos botones, sin clave de evaluación.
> El authtoken de ngrok sí sigue siendo necesario para crear el túnel y pertenece a la cuenta
> del servicio, no a los usuarios del MVP. Solo documentos ficticios.

# Configurar ngrok sin publicar el token

1. Crear/iniciar sesión en https://dashboard.ngrok.com/get-started/your-authtoken.
2. Copiar el authtoken de la cuenta.
3. Desde esta carpeta ejecutar `powershell -ExecutionPolicy Bypass -File .\configure-ngrok.ps1`.
   El asistente pide el token con entrada oculta; pegarlo ahí, nunca en el chat.
   Se guarda en `.runtime/ngrok.yml`, excluido de Git.
4. Con la demo saludable en 8765, ejecutar el mismo asistente con `-StartTunnel` o avisar al
   asistente para iniciar y verificar el enlace. Mantener el equipo encendido durante las pruebas.

La cuenta usa su autenticación propia de ngrok. El token no es una clave de paciente/médico: no hay contraseña en la pantalla de demostración.
No compartir el archivo de configuración de ngrok. Los evaluadores reciben la URL comprobada.
Para salir del túnel en una terminal interactiva usar Ctrl+C. No se instala un servicio del sistema.

Estado actual: intento bloqueado por ERR_NGROK_4018; sin URL pública verificada.
Agente portable instalado en el área qa-2026-10-08 del workspace (fuera de Git).
