# ADR-007: base sintética de dominio con prioridad DE-FG-ABC

Fecha: 2026-09-29. Estado: implementada como prototipo local; ratificación
humana pendiente. No cierra ADR-006, ST-004, ST-016, ST-017 ni ST-018.

## Contexto

El usuario solicita crear una base inicial y subir avances preservando el
repositorio. Hay un conflicto histórico de stack y una indicación docente
DE-FG-ABC. El Documento Maestro permite estructurar confirmación/puntuación
sobre datos ya extraídos. El plan anterior privilegiaba C/A como dependencia.

## Alternativas

1. Backend y DB completos ahora: exigiría adoptar decisiones pendientes.
2. Solo planificación: no produciría una base ejecutable para contrastar reglas.
3. Prototipo puro con fixture sintético: demuestra D y la frontera de E sin
   proveedor ni BD; permite adaptar después al backend existente.

## Decisión de esta entrega

Opción 3, dentro de la solicitud explícita de crear la base inicial.
Python estándar por coherencia con el stack descrito, sin FastAPI ni ODM.
DE primero como prioridad, C mínimo como apoyo; FG y ABC en backlog.
La clasificación DE-FG-ABC queda adoptada para esta entrega, pero no se
atribuye a la docente una interpretación de sprints o dependencias no confirmada.

## Consecuencias

- No se cambia tecnología fundamental, no se conecta con producción y no
  se replica la aplicación existente.
- Pruebas de autorización/estado aportan evidencia de dominio, no de JWT,
  persistencia, aislamiento del motor ni cumplimiento de HITO 1.
- Motor de puntaje completo y parámetros requieren revisión clínica.
- La integración siguiente necesita catálogo, DTO canónico, autenticación,
  transacciones/CAS, idempotencia, outbox y almacenamiento durable.
- La revisión humana del aporte queda pendiente en BITACORA_PROGRESO.
