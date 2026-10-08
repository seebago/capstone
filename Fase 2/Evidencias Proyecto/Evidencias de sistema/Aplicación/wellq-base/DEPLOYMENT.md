> Actualización posterior del 8 de octubre: la evaluación normal usa paciente → carga de archivo
> → clínico vinculado. No habilitar WELLQ_STRUCTURED_DEMO; ese modo reproduce únicamente
> fixtures de la API histórica. Carga binaria PDF/PNG/JPEG hasta 4 MiB; verificar también el
> límite efectivo del hosting. Ver NGROK.md y FLUJO_ARCHIVOS_NGROK_2026-10-08.md.

# Despliegue del MVP sintético para evaluación

Estado 2026-10-08: preparación local; sin despliegue público, push ni PR nuevo.
No acredita aprobación del motor definitivo (ADR-006/ST-022) ni del pivote móvil.

## Vercel + MongoDB Atlas: vía permanente propuesta

Importar el repositorio con Root Directory:
`Fase 2/Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base`.
El punto de entrada `app.py` exporta `app = create_app()`;
`requirements.txt` reutiliza las versiones de `requirements.lock.txt`.
No ejecutar `run_local.py` ni `start-demo.ps1` en Vercel; esos scripts escriben secretos locales.

Configurar en el gestor de secretos del hosting, sin pegarlos en chats ni Git:
- `WELLQ_MONGO_URI`: conexión TLS al cluster Atlas dedicado a pruebas sintéticas.
- `WELLQ_DATABASE`: `wellq_demo_evaluation` u otro nombre permitido `wellq_demo*`.
- `WELLQ_JWT_SECRET`: secreto aleatorio independiente de al menos 32 caracteres.
- `WELLQ_DEMO_PASSWORD`: contraseña de evaluación independiente de al menos 12 caracteres.
- `WELLQ_ALLOWED_HOSTS`: lista separada por comas de los dominios exactos autorizados,
  sin esquema, puerto ni comodines. Incluir explícitamente cada dominio de preview usado.

El nombre de BD permitido es una barrera de configuración: no prueba por sí solo que todos
los datos sean ficticios. No copiar bases existentes ni datos médicos reales.
Usar una cuenta Atlas propia del entorno de evaluación, con permisos necesarios sobre esa BD;
la inicialización crea colecciones, validadores e índices. Configurar el acceso de red antes
de desplegar; no habilitar acceso universal de forma automática para resolver un fallo.

Pendientes que requieren verificación real: acceso a cuenta/proyecto Vercel, cluster y permisos
Atlas, red entre Vercel y Atlas, ejecución de lifespan y primer arranque, índices/siembra bajo
arranques concurrentes, pooling/conexiones, límites del hosting y controles de intentos a nivel
plataforma. El limitador de login actual está en memoria por proceso, no es global.
La auditoría persistente cubre transiciones de examen; no se declara cobertura de todos los
logins/denegaciones ni outbox/WORM. Mantener acceso restringido a los evaluadores.

Tras autorización: desplegar primero preview y comprobar externamente `/api/health`, UI/assets,
login, paciente → corrección → confirmación → clínico → validación, idempotencia, aislamiento
Alpha/Beta, rechazo del paciente no vinculado, JWT y features. Reiniciar/crear una instancia nueva
y comprobar persistencia. Solo después promover y registrar la URL comprobada, SHA, fecha y resultados.
El ensayo local no verifica el build de Vercel ni la conectividad de Atlas.

## Ngrok: alternativa temporal para esta semana

Con la demo local saludable, y tras autorización para exponerla:

```powershell
ngrok http 8765 --host-header=rewrite
```

Conservar la protección de Host local predeterminada. No usar `ngrok http 8765` a secas.
Verificar la URL real del túnel desde fuera del equipo antes de compartirla.
La clave de `.runtime/access.txt` se entrega por un canal privado autorizado a los evaluadores;
no subirla al repositorio, informes públicos ni capturas. El equipo debe permanecer encendido;
cerrar el túnel al terminar. No es el despliegue permanente.

## Fuentes técnicas consultadas el 8 de octubre

- https://vercel.com/docs/frameworks/backend/fastapi
- https://vercel.com/docs/functions/runtimes/python
- https://vercel.com/marketplace/mongodbatlas/atlas
- https://www.mongodb.com/docs/atlas/security/ip-access-list/
