# WellQ — reconocimiento de exámenes y evaluación de IA

Fecha: 9 octubre 2026. Estado: propuesta de trabajo futuro solicitada por Sebastián; pendiente de validación por equipo/Alloxentric. No afirma implementación de IA ni aprobación clínica. ST-004 permanece abierto.

## Punto de partida verificable

MVP FastAPI/MongoDB: paciente sube PDF/PNG/JPEG y el backend deriva destinatario del vínculo care_team_links. Profesional confirma recepción, valida o marca error. Revisar examen muestra lectura determinista local de PDF con texto, valores y referencias escritas en formato explícito; ventana con resultados verticales y archivo original completo mediante PDF.js local. No reconoce automáticamente cualquier informe, no hace OCR ni predice enfermedades. Evidencias: pruebas/viewer-2026-10-09 (62 pruebas y 15 subpruebas), rangos y revisión anteriores preservados.

## Objetivo de la siguiente etapa

Reconocer diferentes documentos que podrían subir pacientes de una clínica kinesiológica y ayudar al profesional a cotejar información con su fuente. Primero extraer y clasificar; comparar aritméticamente solo referencias identificadas y unidades compatibles. La eventual interpretación clínica exige definir finalidad, criterios y validación profesional separada. Dentro del rango no significa examen correcto ni ausencia de enfermedad.

## Documentos candidatos: catálogo por acordar

| Tipo candidato | Datos a identificar | Restricción |
|---|---|---|
| Evaluación funcional/kinesiológica | articulación, lado, movilidad, fuerza, dolor, escala, unidad, fecha y observación | No convertir límites de una escala en rango saludable; depende del instrumento y contexto |
| Laboratorio relacionado con atención | nombre del analito, valor, unidad, intervalo del laboratorio y calificadores | Usar referencias del propio informe; no extrapolar a diagnóstico kinesiológico |
| Informe escrito de imagen | modalidad, región, lateralidad, hallazgos y conclusión textual atribuida al autor | Extraer el informe; no diagnosticar a partir de radiografía/resonancia ni analizar DICOM en esta etapa |
| Imagen/escaneo de documento | texto y ubicación por OCR | Calidad, páginas, orientación y campos ambiguos se revisan manualmente |
| Desconocido o ilegible | motivo de no reconocimiento | No forzar clasificación ni inventar valores |

Estos tipos son candidatos de diseño, no necesidades ratificadas. Se necesita acordar cuáles son relevantes con la clínica y obtener muestras ficticias representativas.

## Pipeline propuesto

1. Validar formato real, tamaño y páginas; preservar original y huella. Ejecutar procesamiento pesado en trabajador aislado con tiempo/memoria limitados, fuera de la petición web.
2. Extraer texto PDF o hacer OCR sobre escaneos; conservar página y ubicación del texto fuente.
3. Clasificar tipo/instrumento/formato. Permitir desconocido y revisión humana.
4. Extraer hacia esquema validado: nombre original, código de catálogo si existe, valor original, comparador, unidad, intervalo original, página, fragmento fuente, método/versión y estado de revisión. Los ausentes quedan null.
5. Validar tipos, decimal/coma, límites unilaterales, signos < >, unidades, duplicados, lateralidad y referencias incoherentes. Normalizar solo conversiones aprobadas/versionadas.
6. Comparación determinista posterior a cotejo. No pedir al modelo que invente rangos o decida salud/enfermedad.
7. Mostrar propuesta al lado del archivo. Profesional puede corregir con motivo; original y propuesta se conservan, auditoría y versiones separadas. La lectura no reemplaza confirmación/validación.

## Dónde podría ayudar la IA

Como extractor/clasificador de texto o tablas heterogéneas, u opcionalmente lectura multimodal de documentos escaneados. Evaluar contra un baseline OCR + reglas por plantilla: incorporar IA solo si mejora resultados medidos. Mantener un adaptador servidor (AI Gateway) que se pueda desactivar y sustituir; límites de costo, timeout, reintentos y circuit breaker. JSON estricto validado por backend, fuente obligatoria de cada campo, salida desconocida ante ambigüedad. Texto del examen es entrada no confiable: nunca seguir instrucciones insertadas en PDF, invocar herramientas ni modificar vínculos/roles/tenant por contenido del documento.

NVIDIA figura como proveedor candidato en A-14/ST-014 de las bitácoras, no como integración existente. Evaluar proveedor/modelo, costo real, residencia, retención y permisos antes de elegir; no asumir gratuidad, calidad clínica ni disponibilidad. No se requiere configurar claves para esta propuesta documental. No enviar documentos reales a un proveedor externo.

## Invariantes WellQ

client_id derivado del contexto servidor en toda lectura/escritura/trabajo en cola; rol y vínculo activo controlados antes de lectura y al entregar resultados; feature gating de extracción habilitado por tenant en backend; JWT interno de demo no autentica identidad humana real. Auditoría actor/acción/fecha/origen/resultado más versión de extractor, sin copiar datos clínicos en logs. Español/inglés y temas claro/oscuro. Secretos exclusivamente servidor fuera de Git. Ninguna nueva ruta pública de archivos. Exclusivamente datos ficticios durante evaluación.

## Evaluación y criterios de aceptación propuestos

Crear conjunto de prueba sintético por tipo: PDF texto, tablas distintas, escaneos, páginas múltiples, mala calidad, unidades incompatibles, referencias ausentes, duplicados y documento con instrucciones maliciosas. Separar diseño y evaluación para evitar medir solo las plantillas del desarrollador. Anotar verdad de referencia con revisor humano. Medir exactitud por campo, omisiones, valores inventados, cobertura, clasificación desconocida, tiempo, costo y correcciones del profesional. Umbrales por acordar antes de habilitar el extractor; no atribuir confiabilidad clínica a un porcentaje inventado.

Criterios mínimos: fuente verificable por cada campo; ausencia explícita sin inventar; ningún resultado automático marca un examen validado; originales inmutables; separación de tenants/pacientes probada; aislamiento de procesamiento pesado; error legible y opción manual; cambios auditados; evaluación humana registrada. La aceptación del módulo y cualquier función clínica sigue pendiente del equipo/cliente.

## Secuencia de trabajo sugerida

- Primera entrega: acordar 2–3 tipos, catálogo y ejemplos sintéticos; especificar contrato de extracción y criterios de evaluación.
- Segunda: parsers por formato + OCR local para documentos; ensayar completitud/proveniencia y fallos.
- Tercera: experimento controlado con adaptador IA y misma batería de evaluación; decidir si se incorpora.
- Cuarta: integrar propuesta/corrección profesional con versiones y feature gating; pruebas de permisos, persistencia y navegador.
- Interpretación/prediagnóstico: backlog independiente, sin activar antes de decisión clínica explícita y validación.

## Compartir la demo ahora

Usuario autorizó publicación temporal por ngrok el 9 octubre. App verificada localmente en 127.0.0.1:8765. A la fecha de este documento falta configurar authtoken local de ngrok: no existe URL pública verificada todavía. configure-ngrok.ps1 solicita token oculto y lo guarda en .runtime/ngrok.yml excluido de Git. Al abrir usar host-header rewrite e inspección desactivada. El enlace depende de que equipo, MongoDB, app y agente permanezcan activos; no equivale a hosting permanente. Probar carga sintética y revisión a través del HTTPS público antes de anunciarlo.

## Fuentes y documentación relacionada

- [PDF.js oficial](https://mozilla.github.io/pdf.js/): renderizado PDF, no OCR ni diagnóstico.
- [ngrok: compartir localhost](https://ngrok.com/docs/start): túnel al servicio local.
- BITACORA_STAKEHOLDERS.md: ST-004/ST-014/ST-021/ST-027.
- BITACORA_ARQUITECTURA.md: A-10/A-14/A-15.
- Pruebas/ranges-2026-10-08 y pruebas/viewer-2026-10-09.

Aporte preparado con Codex; validación por integrante humano pendiente.
