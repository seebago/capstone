# ANEXO TÉCNICO — Informe Final de Fase 2 (2.6/2.7)
**Proyecto:** WellQ Medical Exams · **Corte:** 24 de octubre de 2026 · **Integrante:** Sebastián González Garrido · **Carrera correcta:** Ingeniería en Informática.

> Documento complementario de integración y evidencia: no sustituye la pauta oficial ni el informe grupal 2.6 de Vicente. Se basa en el contenido de GitHub y en resultados de CI, distinguiendo entre lo construido, lo probado y lo pendiente.

## 1. Resumen factual del aporte de Sebastián
Se desarrolló un **MVP académico con datos sintéticos** para la recepción y revisión de documentos médicos en WellQ. En la versión incorporada a `main`, el backend emplea Python/FastAPI con MongoDB; el usuario paciente de demostración carga PDF/PNG/JPEG, el backend determina el profesional vinculado y este revisa el documento, pudiendo confirmar recepción, validar o indicar error con motivo. Existe un visor PDF.js y lectura determinista y limitada de ciertos textos PDF con referencias explícitas. No existen diagnóstico, prediagnóstico clínico, OCR general, ni inferencia de IA clínica implementados.

El código histórico del PR #5 fue recuperado en PR #8, **fusionado a `main` el 24-10-2026**, merge `1934056bc4a4feddcd6f284306ec773012097b1d`. El PR original #5 se cerró sin fusión; no describirlo como mergeado. El diario 2.1 y guía grupal 2.4 del PR #6 estaban incorporados en `main` con los mismos SHA de contenido antes del merge del MVP; tampoco se debe describir PR #6 como fusionado.

## 2. Matriz de evidencias verificables
| Afirmación acotada | Fuente directa | Tipo de verificación | Límite |
|---|---|---|---|
| Código MVP implementado y versionado en `main` | [PR #8](https://github.com/seebago/capstone/pull/8), merge `1934056` | GitHub: merge exitoso | No equivale a producto validado por Alloxentric |
| Base FastAPI/MongoDB y controles por rol/tenant | `Fase 2/Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/mvp/` | Revisión de código fuente | Acceso de demo con perfiles ficticios; no identidad humana real |
| Carga de documentos PDF/PNG/JPEG y flujo de revisión | `mvp/app.py`, `mvp/documents.py`, frontend en `mvp/static` | Código de aplicación en PR #8 | No administra todos los vínculos pacientes/profesionales (ST-027) |
| Evidencias de pruebas automatizadas | [GitHub Actions del PR #8](https://github.com/seebago/capstone/pull/8/checks) | Workflows `domain` e `integration` en estado `success` | Resultados específicos de 62 tests + 15 subpruebas corresponden a reporte histórico del 9-10 |
| Despliegue Vercel+Atlas | `pruebas/vercel-2026-10-09/PUBLICACION_VERIFICADA.md` | Acta y capturas del 9-10-2026 | Disponibilidad del servicio el 24-10 **no verificada** |
| Diario 2.1 y guía grupal 2.4 en `main` | Archivos `.docx` bajo `Fase 2/Evidencias Individuales/` y `Evidencias Grupales/` | SHA de blob de PR #6 igual a `main` | El 2.1 se inspeccionó visualmente (2 páginas) y no mostró carrera incorrecta; no se modificó |
| Reflexión individual 2.6 de Sebastián | [PR #7](https://github.com/seebago/capstone/pull/7), merge `1f5ecce` | GitHub | Opiniones personales requieren ratificación de Sebastián |
| Guía 2.4 grupal | `Fase 2/Evidencias Grupales/2.4_GuiaEstudiante_Fase2_DesarrolloProyectoAPT.docx` | Lectura de `word/document.xml` del DOCX | Describe corte al 10-10; conservarla como documento histórico, no como estado al 24-10 |

## 3. Aporte funcional real del MVP
1. Persistencia de la demostración en MongoDB y API basada en FastAPI.
2. Sesiones JWT de demostración, separación por tenant `client_id`, permisos por rol y control de funciones en backend.
3. Carga y preservación de bytes originales del archivo de examen, sin permitir que el paciente elija arbitrariamente otro profesional mediante campos en la solicitud.
4. Derivación según vínculos ya registrados; confirmación, validación o error por el profesional, con revisiones e historial.
5. Interfaz web de prueba con idiomas español/inglés, temas claro/oscuro y diseño móvil; visor del archivo original.
6. Pruebas de dominio/integración automatizadas y registros históricos de navegación.

## 4. Diferencia entre evidencia de funcionamiento y objetivos pendientes
**Implementado como demo:** carga y lectura limitada de documentos, revisión profesional, flujo de estados, controles básicos de acceso e historial.

**No implementado/ni acreditado:** reconocimiento general de todo tipo de exámenes, OCR completo, modelo clínico IA, prediagnóstico o recomendación terapéutica, integración con identidad real de usuarios, integración con el producto WellQ operativo, auditoría WORM, control comercial de producción, despliegue con datos personales reales, administración completa de vínculos paciente-profesional. El motor definitivo de la solución requiere ratificación (ADR-006).

**Seguridad y privacidad:** solo datos sintéticos. El acceso por botones de paciente/profesional **no autentica la identidad humana**. La configuración de red Atlas usada para la demo debe endurecerse antes de escenarios reales. Nunca cargar documentos médicos reales para la exposición.

## 5. Informe 2.4 y denominación de carrera
La guía grupal 2.4 se redactó con corte declarado 10-10-2026 y menciona funciones entonces pendientes de fusión. No reescribirla retroactivamente como si representara el corte del 24-10. Este anexo actualiza los hechos posteriores. La denominación académica que corresponde a Sebastián es **Ingeniería en Informática**. En el cuerpo visible del 2.4 no se detectó una denominación explícita de carrera distinta; **el texto indexado y las dos páginas renderizadas del diario 2.1 se revisaron**, sin hallar una carrera distinta en el encabezado visible. Los originales se conservaron sin alteración.

## 6. Aporte personal y reflexión
La versión en español y la traducción al inglés de Sebastián están en `Fase 2/Evidencias Individuales/Gonzalez_Sebastian_2.6_ReflexionIndividual_Fase2.md`. Integrar esas respuestas en el apartado individual del informe final, sin atribuir a Vicente o Aron afirmaciones que no hayan ratificado.

## 7. Nota para el expositor y el evaluador
Decir **"desarrollamos y desplegamos una demo académica de carga y revisión de documentos con datos ficticios"**, no **"WellQ diagnostica enfermedades con IA"**. Exhibir un PDF ficticio. Mostrar las pruebas y una ruta de código legible. Ante pregunta por el motor de datos: MongoDB fue una decisión operativa de demostración, la arquitectura final se define con Alloxentric.

## 8. Revisión final indispensable del equipo
- Confirmar y trasladar estas afirmaciones al informe de Vicente cuando el borrador 2.6 esté disponible.
- Ratificar las reflexiones auténticas de cada integrante (Vicente, Sebastián y Aron); no inventar texto personal.
- Reconfirmar únicamente que la versión del diario 2.1 elegida para entrega coincida con el original revisado: 1.288.671 bytes y encabezado sin carrera incorrecta.
- Usar solo capturas y métricas de pruebas cuya fuente esté adjunta.
- Ejecutar un ensayo de navegación de la URL antes de presentarla en vivo; contar con capturas de respaldo si Vercel no responde.

**Generado con asistencia de ChatGPT a solicitud de Sebastián. Validación académica y personal pendiente.**
