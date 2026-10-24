# Evaluación PostgreSQL y MongoDB para WellQ

Fecha: 2026-10-03. Estado: recomendación técnica, decisión definitiva pendiente. Alcance: app móvil para cargar resultados de exámenes y portal médico propuesto. No se realizaron benchmarks ni migraciones.

| Criterio | PostgreSQL | MongoDB | Implicación para WellQ |
|---|---|---|---|
| Pacientes, médicos, asignaciones, exámenes y revisiones | Claves foráneas, restricciones y relaciones verificadas por el motor | Referencias o documentos embebidos; consistencia entre referencias debe diseñarse | PostgreSQL facilita mantener relaciones consistentes |
| Resultados variables de extracción | JSONB junto con columnas relacionales e índices | Documentos BSON flexibles con validación de esquema opcional | Ambos sirven; usar IA no obliga a MongoDB |
| Aislamiento por cliente | RLS configurada explícitamente; roles privilegiados pueden eludirla | Filtros obligatorios en repositorios y autorización de aplicación; no equivalente directo a RLS SQL | PostgreSQL aporta una capa adicional, sin reemplazar controles API |
| Actualizaciones consistentes | Transacciones para cambios relacionados | Atomicidad por documento y transacciones multidocumento en despliegues compatibles | Ambos pueden satisfacer el flujo con diseño correcto |
| Historial e informes | SQL y relaciones adecuados para consultas transversales | Agregaciones y diseño orientado a patrones de lectura | Ventaja de simplicidad relacional para seguimiento médico |
| Integración existente | Requiere adaptador si WellQ comparte MongoDB | Coincide con el stack reportado en documentos y el MVP actual | Ventaja de MongoDB si compartir persistencia es obligatorio |
| Coste y rendimiento | Dependen de consultas, volumen, índices y operación | Dependen de consultas, volumen, índices y operación | Sin mediciones no se declara ganador por velocidad/precio |

## Recomendación

Con libertad de elección para la persistencia del módulo, recomendar PostgreSQL: el núcleo es relacional y JSONB conserva flexibilidad para la extracción. No hace falta operar dos motores solo para guardar JSON.

Si Alloxentric exige compartir colecciones/modelo operativo del WellQ existente, recomendar MongoDB y mantener un repositorio central que imponga tenant y vínculo médico. La compatibilidad pesa más que sustituir una base funcional por preferencia técnica. La documentación existente reporta MongoDB; debe confirmarse si es una restricción efectiva o si el módulo puede tener almacenamiento propio con integración API.

El MVP en MongoDB es evidencia reutilizable, no un compromiso irreversible. No migrarlo durante su pausa. Registrar la decisión final en ADR-006 una vez conocida la frontera de integración, propietario de cada dato y sincronización necesaria. Evitar duplicar identidades e historiales sin una fuente de verdad explícita.

## Diseño compartido propuesto

Guardar archivos originales en almacenamiento de objetos privado y sus referencias/metadatos en la base. Separar archivo, datos extraídos, análisis preliminar y revisión profesional, conservando versiones y procedencia. Ningún motor garantiza por sí solo auditoría inmutable, aislamiento correcto o precisión clínica. RLS requiere políticas y rol de ejecución adecuados; MongoDB requiere controles sistemáticos y pruebas negativas.

## Fuentes oficiales consultadas

- PostgreSQL, restricciones y claves foráneas: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL, seguridad por filas: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- PostgreSQL, JSON/JSONB: https://www.postgresql.org/docs/current/datatype-json.html
- MongoDB, atomicidad y transacciones: https://www.mongodb.com/docs/manual/core/write-operations-atomicity/
- MongoDB, validación de esquema: https://www.mongodb.com/docs/manual/core/schema-validation/

La recomendación es una inferencia de arquitectura aplicada al alcance, no una afirmación de los proveedores ni aprobación de Alloxentric.
