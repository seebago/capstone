# WellQ: Vercel y Atlas — 9 de octubre de 2026

URL permanente comprobada: https://wellq-mvp.vercel.app

Proyecto Vercel `capstone-2a4b/wellq-mvp`, plan Hobby. Cluster Atlas `wellq-demo`, Free, Sao Paulo. Base exclusivamente sintética `wellq_demo_evaluation`; usuario limitado a lectura/escritura de esa base y al cluster de la demo. Red Atlas 0.0.0.0/0 autorizada explícitamente por Sebastián para conectividad desde Vercel. No datos médicos reales ni credenciales en repositorio o paquete desplegado.

Build real con Python 3.12 completado. Vercel no aceptó la inclusión `-r requirements.lock.txt` en su analizador inicial; requirements.txt ahora contiene las mismas versiones fijadas directamente. Se incluyeron explícitamente los módulos del visor PDF.js en la carpeta build, antes afectados por la exclusión genérica de Git.

Comprobación HTTP externa sin sesión Vercel: raíz 200; /api/health 200, MongoDB OK, synthetic_only=true; módulo PDF 200 text/javascript. Recorrido Chromium contra la URL pública aprobado: paciente carga PDF ficticio de dos páginas, profesional vinculado lo recibe, comparación de cuatro tipos de resultados, PDF completo visible con navegación, ES/EN, temas y móvil 390px sin desbordamiento ni errores JavaScript. Evidencias browser.json y capturas adjuntas.

Los dos botones seleccionan perfiles ficticios fijos; no verifican identidad humana. Solo demo académica. La comparación lee referencias explícitas del documento; no diagnostica ni incorpora IA clínica. ST-004, ST-027 y decisiones de infraestructura definitiva continúan pendientes de equipo.

Este alojamiento funciona fuera del PC local; apagarlo no detiene la aplicación. La disponibilidad depende de Vercel/Atlas, cuotas y mantenimiento de las cuentas. El código se desplegó desde la rama local feature/wellq-evaluation-deploy; la integración GitHub automática no pudo conectarse y no está habilitada. No se fusionó main.

Validación humana del aporte IA: pendiente integrante del equipo.
