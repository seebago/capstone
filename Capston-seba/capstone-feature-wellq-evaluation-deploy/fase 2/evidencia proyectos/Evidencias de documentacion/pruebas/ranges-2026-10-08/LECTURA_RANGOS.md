# Lectura local de referencias del documento — 2026-10-08

Solicitud del usuario: botón Revisar examen y ventana de lectura. Sin informe de referencia disponible se creó un PDF sintético kinesiológico descargable dentro del MVP. Todas sus referencias son inventadas para probar software; no son valores clínicos ni normas de movilidad/fuerza/dolor.

Implementado: lectura determinista local de PDF con texto en formato explícito `Medición | valor unidad | Referencia: mínimo-máximo unidad`. Compara solo unidades idénticas; admite límites inclusivos, negativos y decimales. No infiere valores, referencias, diagnóstico ni tratamiento. Fuera del formato: resultado sin mediciones, no conclusión. Imágenes y PDF escaneados necesitan OCR, no implementado. Límites: 20 páginas, 100 mediciones, 100000 caracteres y contenido descomprimido de página 1000000 bytes; esta comprobación ocurre tras descompresión, no sustituye aislamiento de proceso para PDF hostil. Mantiene límite de carga 4 MiB.

POST `/api/v1/exam-documents/{id}/range-review`: JWT demo, permiso exam:validate, feature clinical_tests, tenant y asociación activa más destinatario snapshot. Guarda última lectura con versión document-ranges-v1 y auditoría de actor/acción/fecha/origen/resultado. No modifica bytes, estado, revisión de validación ni automatiza confirmación humana. No llama proveedores externos.

Pruebas: 61 aprobadas + 15 subpruebas; MongoDB real, datos sintéticos, bases de test únicas. XML adjunto. Warning de deprecación Starlette/httpx preexistente. Navegador Chromium: carga paciente, entrega profesional vinculado, cuatro resultados, ausencia de botón clínico en paciente, español/inglés, claro/oscuro y móvil 390 px sin desbordamiento. Capturas y browser.json adjuntos. Ejecución reproducible: scripts/browser_ranges.py y pytest.

ST-004 sigue abierto para interpretación clínica/IA. La petición del usuario autoriza esta lectura y comparación acotada de demostración; no acredita aprobación del equipo, docente o Alloxentric. Sin push ni despliegue público. Validación humana pendiente.
