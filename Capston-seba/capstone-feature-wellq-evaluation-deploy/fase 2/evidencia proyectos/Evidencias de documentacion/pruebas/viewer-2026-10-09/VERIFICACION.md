# Revisión y archivo lado a lado — 9 octubre 2026

Solicitud del usuario: resultados en columna vertical y archivo completo al costado.
Implementado: tarjetas verticales izquierda, visor PDF.js local derecha, navegación todas las páginas, descarga original; imágenes originales visibles. Vista móvil apilada. Obtiene bytes por endpoint autenticado existente, sin URLs con JWT ni proveedores externos. Revoca blob y destruye visor al cerrar/cambiar perfil. No modifica documento ni algoritmo de rangos.

Dependencia local PDF.js 6.4.299 Apache-2.0, procedencia/hash en vendor/pdfjs/PROVENANCE.md. Assets cmap/fuentes/wasm locales. MIME mjs corregido para Windows. CSP mantiene frame-ancestors none y object-src none; worker-src self. Browser confirma canvas con píxeles del documento, columnas laterales desktop, recorrido páginas 1 y 2, imágenes de evidencia, idiomas/temas/móvil sin overflow ni errores JS. Pytest: 62 aprobadas y 15 subpruebas; warning Starlette/httpx anterior. Evidencia XML. Validación humana pendiente. Sin push ni despliegue público.
