# Configurar ngrok sin publicar el token

1. Crear/iniciar sesión en https://dashboard.ngrok.com/get-started/your-authtoken.
2. Copiar el authtoken de la cuenta.
3. Desde esta carpeta ejecutar `powershell -ExecutionPolicy Bypass -File .\configure-ngrok.ps1`.
   El asistente pide el token con entrada oculta; pegarlo ahí, nunca en el chat.
   Se guarda en `.runtime/ngrok.yml`, excluido de Git.
4. Con la demo saludable en 8765, ejecutar el mismo asistente con `-StartTunnel` o avisar al
   asistente para iniciar y verificar el enlace. Mantener el equipo encendido durante las pruebas.

La cuenta usa su autenticación propia de ngrok. No confundir su token con la clave de los perfiles
 de paciente/médico en .runtime/access.txt. No compartir ninguno de estos archivos públicamente.
Los evaluadores reciben la URL comprobada y la clave de la demo por un canal privado.
Para salir del túnel en una terminal interactiva usar Ctrl+C. No se instala un servicio del sistema.

Estado actual: intento bloqueado por ERR_NGROK_4018; sin URL pública verificada.
Agente portable instalado en el área qa-2026-10-08 del workspace (fuera de Git).
