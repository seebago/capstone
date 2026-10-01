# WellQ MVP local con MongoDB

Demostración con datos ficticios del módulo de exámenes. FastAPI sirve una
interfaz web de pruebas y persiste en MongoDB. El prototipo anterior se
conserva en `prototype/`; el adaptador está en `mvp/`.

## Inicio en Windows

Requiere Python 3.12+, Windows compatible con MongoDB 8.0 e internet en el
primer arranque. Desde esta carpeta:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

El script crea un entorno Python aislado y descarga MongoDB Community 8.0.26
desde el sitio oficial en `.runtime`. No instala servicios del sistema.
Ambos servidores escuchan exclusivamente en localhost (MongoDB 27018 y
web 8765). Los procesos permanecen activos al cerrar la terminal.

Abre **http://127.0.0.1:8765**. La clave aleatoria local aparece al terminar
el script y en `.runtime/access.txt`. Elige paciente Alpha o profesional
Alpha para recorrer el mismo examen. Beta permite comprobar aislamiento.

La base `wellq_demo` y el directorio `.runtime/mongo-data` conservan los
datos. Si ya existe un MongoDB en el puerto 27018, el script usa esa instancia
con una base de demostración. No borrar `.runtime/config.json`: contiene la
clave de acceso creada originalmente. No publicar `.runtime` ni sus claves.
Esta distribución solo acepta nombres de BD `wellq_demo*` o `wellq_test*`.

## Recorrido para la presentación

1. Entrar como paciente Alpha y crear un examen ficticio. Elegir confianza
   baja para demostrar revisión humana, o alta para un recorrido breve.
2. Abrirlo, corregir el valor si corresponde y escribir el motivo. Si hay
   baja confianza o identidad por revisar, marcar el cotejo explícito.
3. Confirmar: el estado, autor, correcciones e historial quedan persistidos.
4. Salir y entrar como profesional Alpha. Ver el examen y validarlo o
   rechazarlo. Comprobar elegibilidad; no existe puntaje clínico numérico.
5. Entrar como Beta: no ve el examen Alpha. Reiniciar la aplicación y volver
   a Alpha: los datos permanecen.

Interfaz en español/inglés, filtros de estado y modo oscuro predeterminado,
adaptado a las capturas oficiales de WellQ. Incluye modo claro opcional. Es una pantalla de pruebas
web, no reemplaza Flutter/Drift ni adopta un nuevo frontend de producción.

## Arranque manual y pruebas

```powershell
python -m venv .runtime/venv
.runtime/venv/Scripts/python -m pip install -r requirements.lock.txt
# Iniciar MongoDB en localhost:27018 con un directorio de datos persistente.
.runtime/venv/Scripts/python run_local.py
# En otra terminal, desde esta misma carpeta:
.runtime/venv/Scripts/python -m pytest -q
```

Las pruebas de integración requieren MongoDB real. Crean y eliminan solo
una BD de prueba con nombre aleatorio `wellq_test_*`. No utilizan mocks ni
la BD de la demostración. `WELLQ_TEST_MONGO_URI` permite cambiar el puerto.
Las pruebas originales sin DB siguen funcionando con
`python -m unittest discover -s tests -p test_domain.py`.

## Alcance y límites

- Colecciones del documento reutilizadas parcialmente: `patients`,
  `clinics`, `clinicians`, `cases`, `users`. Campos y relaciones mapeados
  en la documentación del MVP en Fase 2.
- Extensiones de demostración: `tenants`, `care_team_links`, `clinical_tests`,
  `security_events`. `client_id` comercial es distinto al client_id OAuth.
- JWT con vencimiento, usuario activo consultado en cada petición, permisos
  por rol, feature gating y consultas acotadas por tenant y vínculo paciente.
- Confirmación, corrección numérica y revisión clínica con actualización
  atómica de estado + auditoría + recibo idempotente en un documento MongoDB.
- La auditoría es historial de aplicación; no es WORM ni resistente al
  administrador de MongoDB. No hay API para borrarla. Algunas denegaciones
  de dominio quedan en `security_events`; la cobertura de denegaciones no
  es aún completa. Logout limpia la sesión del navegador; JWT vence a los
  45 minutos y no tiene revocación individual por logout.
- MongoDB local no habilita autenticación ni TLS: solo datos sintéticos,
  acceso por loopback, no exponer a red ni usar como despliegue productivo.
- Sin archivos reales, GCS, extracción IA, puntaje, app móvil ni PDF clínico.
  El endpoint `/api/v1/demo/clinical-tests` es una entrada sintética; no
  implementa el contrato de carga de 11 endpoints. La revisión clínica se
  demuestra en PATCH; el adaptador de producción deberá mapear `/validate`.
- Un máximo de 100 exámenes visibles y 30 recibos por examen en esta demo.
  No incluye paginación ni catálogo médico. Dos marcadores inventados y una
  unidad ficticia impiden confundir el flujo con una calculadora médica.

Para detener la demo, identificar los procesos propios registrados en
`.runtime/app.pid` y `.runtime/mongo.pid`; comprobar su ejecutable antes de
detenerlos. No detener instancias ajenas. No borrar el directorio de datos.

## Verificación visual y ensayo de navegador

El resultado y las diferencias intencionales con la app están en
[design-qa.md](design-qa.md). Las capturas y el informe final están en
`../../../Evidencias de documentación/evidencias-mvp-2026-10-01` y
`../../../Evidencias de documentación/INFORME_AVANCE_MVP_2026-10-01.md`.

Para repetir el ensayo con la demo ya iniciada:

```powershell
.runtime/venv/Scripts/python -m pip install -r requirements.browser.txt
.runtime/venv/Scripts/python -m playwright install chromium
.runtime/venv/Scripts/python scripts/browser_smoke.py
```

El ensayo usa la clave local sin imprimirla, crea un nuevo examen ficticio
Alpha, recorre paciente/profesional/Beta y conserva el resultado en la base
de demo. Guarda capturas y `browser-results.json` en `.runtime/browser-evidence`.
No descarga ni controla perfiles personales del navegador. La prueba de
navegador es adicional a las 37 pruebas automatizadas de dominio/API/MongoDB.
