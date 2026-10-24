# Bases del proyecto WellQ — revisión 2026-10-03

## Autoridad y estado

Dirección de trabajo indicada por Sebastián González el 3 de octubre de 2026. Esta revisión actualiza la orientación interna; no atribuye aprobación a Alloxentric, Karina o Max. Prevalece sobre planes internos anteriores en los puntos aquí cambiados. Las especificaciones del cliente y entregas académicas deben contrastarse posteriormente con este alcance.

## Producto y usuarios

El producto principal es una aplicación para teléfonos móviles. El paciente carga un archivo con resultados de un examen y consulta el resultado de su procesamiento. El equipo propone complementar la app con un portal web para el médico designado, conectado al mismo backend e identidad. La web actual es una demo técnica, no la definición del producto final.

Flutter es el candidato coherente con los antecedentes del WellQ existente; la integración y acceso al código real se deben confirmar. La tecnología del portal médico está por decidir. FastAPI puede reutilizarse como candidato de backend. La app y el portal consumen la API: no acceden directamente a la base de datos.

## Flujo objetivo

1. El usuario carga un archivo de resultados en la app móvil. Formatos, tamaños y tipos de examen se definirán.
2. El backend identifica al paciente y al médico designado, autoriza el acceso y almacena el original con trazabilidad.
3. Un proceso extrae y estructura los datos del archivo, mediante algoritmo y/o IA; registra origen, versión y errores.
4. Se comprueba la calidad de la extracción y se resuelven datos ambiguos según un flujo aún por diseñar.
5. Se genera el análisis preliminar que el usuario denomina «prediagnóstico».
6. El resultado se pone a disposición del usuario y del médico designado. El canal, momento de entrega y revisión profesional quedan por definir.

La extracción de valores, la interpretación clínica y la revisión médica son etapas distintas. La quinta etapa es una intención de producto, no una capacidad implementada ni validada. No se ha decidido si el paciente verá el análisis antes o después de la revisión del médico; tampoco se ha elegido modelo, algoritmo ni parámetros clínicos.

## MVP en pausa

Se pausa el desarrollo, despliegue y entrega del MVP actual por instrucción de Sebastián. Nueva fecha: por definir. Se conservan ramas, código, pruebas y PR existentes como antecedentes reutilizables. La pausa no convierte las fechas históricas de Alloxentric en una reprogramación aprobada: esa coordinación queda pendiente.

Referencia técnica: rama `feature/wellq-mvp-mongodb`, commit `5cd26c5f1271a9c1a74a80619bc49c78e8830752`. Sus pruebas acreditan el alcance sintético anterior, no el flujo nuevo de archivo y prediagnóstico.

## Base de datos

PostgreSQL y MongoDB están en evaluación. La recomendación técnica para un módulo con autonomía de almacenamiento es PostgreSQL con relaciones e información variable en JSONB. Si el módulo debe compartir directamente la persistencia MongoDB del WellQ existente, se recomienda MongoDB para evitar una segunda fuente de verdad. No se autoriza ni ejecuta migración. Ver `EVALUACION_BD_2026-10-03.md`.

Los originales PDF/imágenes se proponen en almacenamiento de objetos privado; la base guarda metadatos, referencias, resultados y versiones. La elección del motor no determina la precisión de la IA.

## Orden de trabajo y punto de aviso

- Ahora: consolidar estas bases, evaluar persistencia y confirmar límites de integración con WellQ.
- Después: especificar experiencia móvil, portal médico, carga de archivos y modelo de datos.
- Punto `H-IA-01`: antes de diseñar o implementar el algoritmo/modelo de interpretación clínica, avisar a Sebastián y desarrollar con él el alcance del prediagnóstico.
- Luego: implementación incremental, pruebas de extracción e interpretación, revisión profesional y nueva planificación de entrega.

Estado de `H-IA-01`: PENDIENTE. Para señalar que llegó ese momento, registrar `H-IA-01: LISTO_PARA_DEFINIR` junto con la evidencia de que la próxima tarea es definir el análisis clínico. No activar el hito solo por instalar una librería o mencionar IA.

En ese punto se definirán tipos de examen, información clínica necesaria, significado de la salida, incertidumbre, fallos, revisión profesional, evaluación con casos de referencia y condiciones de uso. La entrega al paciente antes/después de revisión será una decisión explícita. El detalle clínico se pospone por instrucción del usuario.

## Requisitos conservados

Aislamiento por cliente, identidad verificada, roles/permisos, control comercial en backend, auditoría, i18n y temas visuales. El vínculo con el médico designado debe autorizarse y ser trazable. Los datos de desarrollo siguen siendo sintéticos. RLS es una opción específica de PostgreSQL, no un requisito universal para MongoDB.

## Documentación y pruebas posteriores

El documento de diseño deberá reflejar app móvil + propuesta de portal + backend compartido + procesamiento de archivos. La matriz de pruebas deberá relacionar requisitos con carga, extracción, errores, vínculo médico, entrega y revisión, además de acceso, aislamiento y persistencia. Resultados existentes se identifican por commit y alcance; pruebas del nuevo flujo permanecen pendientes.
