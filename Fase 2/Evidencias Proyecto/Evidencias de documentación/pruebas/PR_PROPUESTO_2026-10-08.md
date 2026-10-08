# PR propuesto (pendiente de autorización para publicar)

Título: Integrar MVP MongoDB con evidencias actuales y preparar evaluación en Vercel
Base: main
Rama: feature/wellq-evaluation-deploy

Main contiene la documentación reciente de Fase 2 pero no el MVP MongoDB ni sus pruebas.
Esta rama reúne la implementación existente y sus evidencias con el main 7e9094f, preservando
la documentación de Vicente y las evidencias históricas. Conserva el recorrido sintético
paciente → corrección → confirmación → validación profesional.

Prepara un punto de entrada FastAPI, dependencias y configuración para Vercel; permite hosts
exactos autorizados sin quitar la protección local predeterminada. Incluye guía Vercel + Atlas
y alternativa ngrok con --host-header=rewrite. No incorpora el pivote móvil, funciones clínicas
ni el endpoint de asociación paciente-clínico pendiente ST-027.

Validación local del 8 de octubre: 38 pruebas y 15 subpruebas aprobadas con MongoDB real y
versiones de dependencias coincidentes con el lock; ensayo de navegador aprobado, sin errores
de consola, es/en, claro/oscuro y 390/428 px. Importación del entrypoint y lifespan comprobados.
Salida completa, XML y capturas en las evidencias de pruebas de Fase 2.

Pendiente: aceptación humana, CI de esta rama una vez publicada, cuentas/red/Atlas, build real
de Vercel y smoke test externo. No hay URL pública ni despliegue cloud verificado.
El limitador de login es por proceso; la auditoría cubre transiciones, sin cobertura universal
ni outbox/WORM. No se declara aptitud para datos médicos reales.

Colaboración: PR #2 sigue abierto sobre feature/wellq-base-de-fg-abc. La nueva propuesta reúne
los mismos avances sobre main; revisar con el equipo la sustitución de la cadena #1/#2 antes
de fusionar. No se cierran ni modifican esos PRs automáticamente.
