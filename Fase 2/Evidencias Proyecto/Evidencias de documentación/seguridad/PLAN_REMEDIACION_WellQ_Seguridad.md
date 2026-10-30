# Plan de Remediación — WellQ Medical Exams (Carga de Exámenes)
**Basado en:** `Informe_Revision_WellQ_Carga_Examenes.docx` (revisión del 29-10-2026, 39 hallazgos)
**Elaborado:** 30-10-2026, por Claude (vía Vicente López), para que el equipo de Alloxentric pueda tomarlo directo.
**Estado de SEC-01 (crítico):** gestionado aparte, de forma inmediata (desactivación de `WELLQ_DEMO_ROLE_ACCESS` en Vercel) — no se repite en este plan.

## Cómo usar este documento

Cada hallazgo tiene: **qué hacer**, **dónde** (archivo/línea, según el informe original), **criterio de aceptación** (cómo saber que quedó resuelto) y **responsable sugerido**. "WellQ/Alloxentric" significa que es una decisión de negocio o de infraestructura que no puede resolver el equipo Capstone por sí solo. El orden respeta la priorización del informe original (Antes de producción → Mejora continua), agrupado por categoría para facilitar el reparto de trabajo.

---

## Bloque A — Seguridad (Antes de producción)

| ID | Qué hacer | Dónde | Criterio de aceptación | Responsable sugerido |
|---|---|---|---|---|
| SEC-09 | Eliminar la siembra de usuarios demo en producción; deshabilitar `POST /api/session` (login clásico) si no se usa | `mvp/database.py` 63-72, `mvp/app.py` 134-145 | No existe ninguna cuenta con `WELLQ_DEMO_PASSWORD` en la base de producción; el endpoint devuelve 404/410 | Equipo Capstone |
| SEC-01 relacionado | Eliminar el endpoint de demo del código desplegable (no solo desactivarlo por variable) e implementar autenticación real (OIDC/OAuth2 con el proveedor de identidad de WellQ) + MFA obligatorio para profesionales | `mvp/app.py` 147-161 | El endpoint no existe en producción; login pasa por el proveedor de identidad real | **WellQ/Alloxentric** (requiere decidir proveedor de identidad) |
| SEC-02 | Cuota por usuario (archivos/día, MB totales) y límite de tasa distribuido (Redis/Upstash o WAF de Vercel) en carga, descarga y `range-review`; cachear `range-review` por hash del archivo | `mvp/app.py` 189-237, 298-314 | Pruebas automatizadas confirman rechazo tras exceder cuota; `range-review` repetido sobre el mismo archivo no reprocesa | Equipo Capstone |
| SEC-08 | Limitar intentos por cuenta y por IP real (`X-Forwarded-For` de confianza) en almacén compartido; backoff progresivo + CAPTCHA, o delegar en el proveedor de identidad | `mvp/app.py` 67, 134-145 | Un usuario legítimo no queda bloqueado por el tráfico de otros; el límite funciona igual con múltiples instancias serverless | Equipo Capstone / WellQ si se delega en IdP |
| SEC-03 | Escaneo antimalware (ClamAV o servicio gestionado) antes de liberar el archivo; rechazar/desarmar PDF con `/JS`, `/JavaScript`, `/OpenAction`, `/AA`, `/Launch`, `/EmbeddedFiles`, `/RichMedia` (CDR); re-codificar imágenes para quitar metadatos | `mvp/documents.py` 13-40, `mvp/app.py` 316-324 | Un PDF con JavaScript o adjunto embebido es rechazado o desarmado antes de llegar al profesional; test de regresión con el payload del informe | Equipo Capstone (priorizar el visor PDF.js sobre la descarga directa, ya es seguro) |
| SEC-04 | Actualizar: Pillow → 13.0.0, pypdf → 6.21.2+, pymongo → 4.18.3, dnspython → 2.9.0, certifi → 2026.10.18+, opentelemetry-api → 1.45.1. Agregar `pip-audit` + Dependabot/Renovate al pipeline; fijar hashes (`pip install --require-hashes`) | `requirements.txt`, `requirements.lock.txt` | `pip-audit` sin avisos de severidad alta/crítica | Equipo Capstone — **hacer esta semana, es rápido** |
| SEC-05 | `Image.open(buffer, formats=["PNG"])` o `["JPEG"]` según la extensión declarada, en vez de dejar que Pillow pruebe todos los decodificadores | `mvp/documents.py` línea 32 | Un archivo TIFF/BMP disfrazado de PNG es rechazado antes de invocar su decodificador | Equipo Capstone |
| SEC-06 | Ejecutar el análisis de PDF en un proceso/worker aislado con límite de memoria y tiempo; reducir `ZLIB_MAX_OUTPUT_LENGTH`; usar el tamaño comprimido como primer filtro | `mvp/range_review.py` 26-37, `mvp/documents.py` 23-28 | Un PDF adversarial no puede exceder un límite fijo de memoria/CPU por petición | Equipo Capstone |
| SEC-07 | `public_document` (vista del paciente) debe devolver solo acción, fecha y nombre visible del rol — nunca `actor_id` ni `origin` (IP). Mantener la auditoría completa en un canal interno separado | `mvp/app.py` 177-181, 225, 275 | La respuesta al paciente no contiene IP ni identificadores internos del profesional | Equipo Capstone |
| SEC-10 | Tokens de acceso cortos (5-15 min) + refresh token rotado y revocable; lista de revocación por `jti`; Argon2id o 600.000 iteraciones PBKDF2, con rehash al iniciar sesión | `mvp/security.py` 15-36 | Un token robado deja de servir tras logout o expiración corta; hash cumple el estándar OWASP vigente | Equipo Capstone |
| SEC-11 | Colección de auditoría separada, solo-inserción (o servicio WORM), que incluya también lecturas y descargas; alertas ante patrones anómalos | `mvp/app.py` 239-243, 316-324 | Se puede responder "quién accedió a este examen y cuándo" incluyendo lecturas, no solo cambios de estado | Equipo Capstone |
| SEC-12 | Mover la creación de esquema/índices a migraciones ejecutadas en el despliegue con un usuario administrador aparte; la app debe conectar con un usuario de solo lectura/escritura mínimo | `mvp/database.py` 16-72, `mvp/app.py` 58-64 | El usuario de MongoDB que usa la app en producción no tiene permisos de administración | Equipo Capstone / WellQ (gestión de credenciales Atlas) |

## Bloque B — Datos en duro (Antes de producción)

| ID | Qué hacer | Dónde | Criterio de aceptación | Responsable sugerido |
|---|---|---|---|---|
| HC-01 | Mover la siembra de tenants/usuarios/pacientes demo a un script de fixtures que solo corre en entornos de prueba, nunca en producción | `mvp/database.py` 41-72, `mvp/app.py` 152-157 | La base de producción arranca vacía, sin `demo_alpha`/`demo_beta` ni correos `@wellq.test` | Equipo Capstone |
| HC-02 | Eliminar valores por defecto inseguros (URI local, `testserver` en hosts permitidos, prefijo obligatorio `wellq_demo`/`wellq_test`); la app debe fallar al arrancar si falta una variable crítica. Agregar `WELLQ_ENV` explícito | `mvp/settings.py` 14, 19-20, 26-31 | Falta una variable de entorno crítica → la app no arranca (falla explícita, no un valor por defecto inseguro) | Equipo Capstone |
| HC-03 | Centralizar límites de negocio (tamaño máximo, páginas, intentos, expiración JWT, etc.) en `Settings`; exponer `/api/config` para que el frontend use esos valores en los textos | `documents.py`, `range_review.py`, `app.py`, `security.py`, `app.js` (múltiples líneas, ver informe) | Cambiar un límite requiere editar un solo lugar; los textos de la interfaz muestran el valor real, no uno hardcodeado | Equipo Capstone |
| HC-04 | Un único origen de verdad para la versión (paquete o variable de build); retirar el PDF de ejemplo del código de producción | `mvp/app.py` 66, 132, 296; `range_review.py` 77-82; `app.js` 15 | La versión no está repetida en el código; el PDF de ejemplo no se despliega a producción | Equipo Capstone |

## Bloque C — Multiidioma (Antes de producción — portugués es requisito confirmado)

| ID | Qué hacer | Dónde | Criterio de aceptación | Responsable sugerido |
|---|---|---|---|---|
| I18N-01 | Mover a archivos de traducción por idioma (`es.json`, `en.json`, `pt.json`, o formato ARB/ICU si se alinea con la app Flutter real); lista de idiomas/locales en configuración, no hardcodeada; detección inicial con `navigator.language` | `app.js` 1-14, 48, 52; `index.html` línea 4; `range_review.py` línea 11 | Agregar un idioma nuevo no requiere tocar código, solo agregar un archivo de traducción | Equipo Capstone — **confirmar con Alloxentric si pt-BR o pt-PT** |
| I18N-02 | Mover los 10 textos fuera del diccionario (listados en el informe) al sistema de traducción | `app.js` líneas 19, 25, 29, 39, 41, 43-45 | Ningún texto de la interfaz queda en inglés cuando el idioma activo es portugués/español | Equipo Capstone |
| I18N-03 | Agregar traducción a los 5 códigos de error sin texto (`IDEMPOTENCY_KEY_REQUIRED`, `LOCAL_DEMO_ONLY`, `STRUCTURED_DEMO_DISABLED`, `DEMO_OPERATION_LIMIT`, `UNKNOWN_MARKER`); agregar prueba que falle si un código del backend no tiene traducción en todos los idiomas | `mvp/app.py`, `prototype/domain.py` | Prueba automatizada verde: todos los códigos de error tienen traducción en los 3 idiomas | Equipo Capstone |
| I18N-04 | Patrones de reconocimiento de rangos por idioma (agregar portugués: "Referência", "até", etc.) y parser numérico según el locale del documento (separador de miles) | `mvp/range_review.py` 9-11 | Un examen en portugués con formato numérico local se lee correctamente, no queda "sin mediciones" | Equipo Capstone |
| I18N-05 | Unificar el diccionario (hoy fragmentado en 7 `Object.assign`); traducir atributos ARIA; usar `Intl.NumberFormat` para unidades | `index.html` línea 4; `app.js` 2-14, 70 | Un solo punto de verdad para las traducciones; sin atributos de accesibilidad hardcodeados en inglés | Equipo Capstone |

## Bloque D — Calidad y funcionalidad (mezcla Antes de producción / Mejora continua)

| ID | Qué hacer | Dónde | Criterio de aceptación | Responsable sugerido | Cuándo |
|---|---|---|---|---|---|
| QA-02 | Mover archivos a almacenamiento de objetos (S3/GCS) cifrado, con URLs firmadas de corta duración y política de retención; en MongoDB solo metadatos | `mvp/app.py` 227-234 | Ningún documento MongoDB contiene el binario del examen | **WellQ/Alloxentric** (requiere elegir proveedor de storage) | Antes de producción |
| QA-03 | Calcular acceso del profesional con el vínculo vigente en cada consulta (no fijado al momento de carga); modelar versiones del documento | `mvp/app.py` 183-187, 199-204 | Un profesional vinculado después de la carga sí ve el historial | Equipo Capstone | Antes de producción |
| QA-04 | Retirar el flujo legado de marcadores sintéticos (`prototype/`, 5 endpoints, ~60 claves de traducción) de la rama de producción | `mvp/app.py` 326-448, `prototype/` | El código desplegado no incluye el flujo anterior desactivado por variable | Equipo Capstone | Antes de producción |
| QA-01 | `run_in_threadpool` para pymongo/pypdf/Pillow dentro del handler async, o driver asíncrono de pymongo | `mvp/app.py` 189-237 | El servidor sigue respondiendo a otras peticiones mientras procesa una carga grande | Equipo Capstone | Mejora continua |
| QA-05 | Formatear con Prettier/Black; separar routers FastAPI; CI con `ruff`, `bandit`, `pip-audit`; separar requirements de producción/desarrollo | `app.js`, `app.py`, `requirements.txt` | CI verde con linters; `requirements.txt` de producción sin `pytest`/herramientas de desarrollo | Equipo Capstone | Mejora continua |
| QA-06 | Verificar `Content-Type` antes de parsear JSON; mapear 413 a `FILE_TOO_LARGE`; declarar `uploadKey` al inicio del archivo | `app.js` 56, 59, 139 | Un error no-JSON (ej. 413 de Vercel) muestra un mensaje útil, no genérico | Equipo Capstone | Mejora continua |
| QA-07 | Paginación por cursor, proyecciones, `$lookup`/`$in`; caché corta del contexto de sesión | `mvp/app.py` 169-175, 199-202, 239-243 | Listar documentos no degrada con volumen real de datos | Equipo Capstone | Mejora continua |
| QA-08 | Un único README vigente + registro de cambios separado | `README.md`, `DEPLOYMENT.md`, `NGROK.md` | La documentación no contradice el estado real del código (ej. número de pruebas, si se pide clave) | Equipo Capstone | Mejora continua |
| QA-09 | Agregar pruebas de cuotas, archivos maliciosos, completitud de traducciones, inyección de operadores, frontend y carga | `tests/` | Cobertura de pruebas incluye los escenarios de seguridad nuevos de este plan | Equipo Capstone | Mejora continua |

## Bloque E — Cumplimiento normativo (Antes de producción — requiere decisión de Alloxentric/legal)

| ID | Qué hacer | Dónde | Criterio de aceptación | Responsable sugerido |
|---|---|---|---|---|
| REG-01 | Pantalla de aviso de privacidad y consentimiento explícito antes de la carga, versionado y almacenado junto con el documento | `mvp/static/index.html`, `mvp/app.py` 189-237 | No se puede cargar un examen sin un registro de consentimiento con versión, fecha y usuario | **WellQ/Alloxentric** (texto legal) + Equipo Capstone (implementación) |
| REG-02 | Endpoints para exportar, rectificar, suprimir o bloquear datos; plazos de retención/borrado automático definidos con el área legal | API completa | Un paciente puede ejercer derechos ARCO/portabilidad desde la plataforma | **WellQ/Alloxentric** (define retención, considerando normativa de fichas clínicas) + Equipo Capstone |
| REG-03 | Documentar región de MongoDB Atlas y funciones de Vercel; firmar DPA con los proveedores; registrar transferencias internacionales | `DEPLOYMENT.md` | Documento de transferencias internacionales firmado y accesible | **WellQ/Alloxentric** |
| REG-04 | Realizar DPIA; clasificar formalmente si el comparador de rangos cuenta como apoyo a decisión clínica | `mvp/range_review.py` | DPIA documentada y clasificación regulatoria registrada | **WellQ/Alloxentric** (legal/regulatorio) |

## Bloque F — Defensa en profundidad (Mejora continua, bajo costo)

| ID | Qué hacer | Dónde |
|---|---|---|
| SEC-13 | Agregar `Strict-Transport-Security`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restrictiva, `Cross-Origin-Opener-Policy: same-origin` | `mvp/app.py` 69-77 |
| SEC-14 | Respuesta mínima en `/api/health` (`{"status":"ok"}`); detalle solo para usuarios internos; limitar tasa | `mvp/app.py` 129-132 |
| SEC-15 | Normalizar nombres de archivo (NFKC), lista blanca de caracteres, quitar metadatos EXIF al re-codificar imágenes | `mvp/documents.py` línea 15 |
| SEC-16 | Verificar hashes SHA-256 al descargar MongoDB/ngrok en scripts; rutas fijas; no usar estos scripts fuera de entorno local | `start-demo.ps1` línea 18, `configure-ngrok.ps1` 25-39 |
| SEC-17 | Mover URLs de infraestructura fuera de la documentación pública del repo; mantener repo privado | `DEPLOYMENT.md`, `NGROK.md` |

---

## Preguntas que solo Alloxentric puede responder (bloquean varios ítems de este plan)

Tomadas directo de la sección 12 del informe original — sin estas respuestas, varios ítems de los Bloques A, D y E no se pueden cerrar:

1. ¿Región de MongoDB Atlas y de las funciones de Vercel? ¿DPA firmados?
2. ¿Se subió alguna vez un examen real a `wellq-mvp.vercel.app` o al túnel ngrok?
3. ¿Proveedor de identidad en producción? ¿Este backend se integra con el backend Flutter real de WellQ o queda separado?
4. ¿Quién es el responsable del tratamiento (WELLQ LTD, cada clínica, o ambos)? ¿Plazo de retención de exámenes?
5. ¿Variantes de idioma exactas: pt-BR o pt-PT, es-CL o español neutro, en-GB o en-US?
6. ¿La comparación de rangos se muestra al paciente o solo al profesional? ¿Se planea OCR para imágenes/PDF escaneados?
7. ¿Volumen esperado (archivos/mes y tamaño) para dimensionar cuotas y almacenamiento?

## Checklist de cierre (antes de dar por resuelto este plan)

- [ ] SEC-01 confirmado cerrado (gestionado aparte, verificar que el endpoint de demo ya no responde en producción)
- [ ] Bloque A (Seguridad) completo y con pruebas de regresión por cada hallazgo
- [ ] Bloque B (Datos en duro) completo
- [ ] Bloque C (Multiidioma) completo, incluyendo portugués
- [ ] Bloque D priorizado según lo que decida el equipo (Antes de producción vs Mejora continua)
- [ ] Bloque E coordinado con Alloxentric/legal — no se avanza solo en lo técnico
- [ ] Las 7 preguntas abiertas respondidas por Alloxentric y registradas en `BITACORA_STAKEHOLDERS.md`
- [ ] Nueva revisión de seguridad antes de ir a producción con datos reales (no basta con esta primera pasada)
