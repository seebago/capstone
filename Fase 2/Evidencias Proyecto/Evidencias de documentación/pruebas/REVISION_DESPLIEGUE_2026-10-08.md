# Revisión del MVP y preparación de evaluación — 2026-10-08

## Estado comprobado

- `origin/main`: `7e9094f1b00c6f270958b3d1e88ef47cdd3d014d`. Documentación de Vicente:
  diagramas, nueve colecciones, cinco mockups con paleta provisional y plan de pruebas.
  No contiene `wellq-base` ni workflows del MVP.
- `origin/feature/wellq-mvp-mongodb`: `5cd26c5f1271a9c1a74a80619bc49c78e8830752`.
  Su árbol coincide exactamente con el checkout local previo `259c2fb`.
- PR #2 abierto, no fusionado, base `feature/wellq-base-de-fg-abc`, no `main`.
- ST-027 está en BITACORA_STAKEHOLDERS.md; búsqueda de issues GitHub por ST-027 sin resultados.
  Confirmado: care_team_links se siembra en initialize(), sin endpoint de asignación ni rol admin.
- Propuesta móvil/prediagnóstico permanece pendiente de decisión; no se implementó aquí.

## Cambios locales

Rama desde el main verificado: `feature/wellq-evaluation-deploy`.
Se reaplicaron los tres commits del MVP, conservando todos los archivos de main y todas las
 evidencias históricas. Solo hubo conflictos en Fase 2/README.md y .gitignore, reunidos preservando
ambos contenidos. Main y ramas previas permanecen sin cambios.

Añadidos: punto de entrada FastAPI para Vercel, requirements.txt, .env.example sin secretos,
lista de hosts exactos configurable (predeterminado local preservado), una prueba de acceso y
host autorizado, guía DEPLOYMENT.md. No se agregó funcionalidad clínica ni asignación administrativa.

## Ejecución real de pruebas

Python 3.12.10, MongoDB local real 8.0.26 en 127.0.0.1:27018; dependencias sin diferencias respecto
 a requirements.lock.txt. Cada fixture crea y elimina exclusivamente su wellq_test_<uuid>.
Primer intento: 15 errores de preparación por MongoDB no disponible (WinError 10061), no fallos
funcionales evaluados. Segundo intento, MongoDB disponible: **38 passed, 15 subtests passed**,
6.90 s, salida 0. 22 dominio + 15 integración originales + 1 nueva de hosts. Una advertencia
Starlette sobre deprecación de httpx; no bloquea las pruebas actuales.

Salida completa: pytest-2026-10-08.txt. Resultado estructurado: resultados-2026-10-08.xml.
Incluye JWT vencido/alterado, revocación de usuario, permisos, features, aislamiento entre tenants
 y pacientes no vinculados, auditoría atómica, concurrencia, reintentos y persistencia tras reinicio.

## Lineamientos y límites comprobados

client_id derivado del usuario autenticado y filtros por tenant/paciente; validadores e índices
MongoDB. RBAC paciente/clínico y JWT HS256 con issuer/audience/expiración. Feature gating en backend.
Auditoría de transiciones con cinco dimensiones y correcciones preservadas; sin outbox durable,
WORM ni cobertura universal de eventos de seguridad. UI es/en y temas claro/oscuro existentes.
No hay PDF, extracción IA, scoring numérico ni diagnóstico. La API usa códigos estables;
no se declara localización universal de backend ni traducciones ajenas a es/en.

## Bloqueos para publicación

Sin push, sin PR nuevo y sin despliegue público, según autorización solicitada por el usuario.
No hay CLI vercel/ngrok ni variables VERCEL/NGROK/WELLQ/MONGODB en este entorno.
No se verificaron cuenta/proyecto de hosting ni Atlas: no afirmar que no existan externamente.
Vercel + Atlas es viable como propuesta y requiere las verificaciones de DEPLOYMENT.md.
Ngrok con host rewrite es la vía temporal ya documentada por Vicente para testing inmediato.
ST-027 no impide probar los perfiles sintéticos sembrados; impide administración de vínculos reales.
Aceptación humana pendiente. Solo una URL verificada externamente puede cerrar ST-021/ST-026.

## Ensayo actual de navegador

Tras instalar Chromium en el área de QA local, scripts/browser_smoke.py terminó con salida 0:
passed=true; sin errores de consola. Se comprobó creación, cotejo, corrección, confirmación,
validación profesional, elegibilidad sin puntaje, filtros, es/en, temas claro/oscuro, 390/428 px,
aislamiento Alpha/Beta y cierre de sesión/recarga. JSON y capturas actuales en browser-2026-10-08/.
Las capturas anteriores de 2026-10-01 se conservaron sin sobrescribir. Este ensayo es local;
no acredita acceso externo ni constituye aceptación humana del diseño.

El punto de entrada app.py también se importó y verificó localmente con lifespan, health y UI mediante TestClient. Commit de preparación: 44668b0.

La salida textual conserva el contenido completo con espacios finales y terminadores de línea normalizados para revisión Git.
