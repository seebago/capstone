# Aporte individual verificable — Sebastián González Garrido
Fecha de preparación: 24 de octubre de 2026. Asignatura: Capstone, Ingeniería en Informática (Duoc UC).
Estado: respuestas individuales redactadas para incorporación al informe 2.6/2.7; redacción asistida por ChatGPT. La autoría de las opiniones personales debe ser ratificada por Sebastián, y la revisión académica corresponde al equipo/docente. No acredita validación humana del código generado por IA.

## 1. ¿El proyecto confirmó o cambió tus intereses profesionales?
El desarrollo de WellQ confirmó mi interés por el desarrollo de software, especialmente backend, bases de datos y arquitectura de sistemas. Además, amplió mi interés por el despliegue de aplicaciones en la nube y la integración de tecnologías que permitan resolver problemas reales.

## 2. ¿Qué te gustaría seguir profundizando después de esto?
Me gustaría profundizar en arquitectura de software, servicios cloud, seguridad de datos y desarrollo de APIs. También me interesa continuar explorando la inteligencia artificial aplicada al procesamiento de documentos, especialmente la extracción automatizada de información con supervisión humana.

## 3. Conclusión y reflexión personal — español
WellQ me permitió aplicar conocimientos de ingeniería informática en un proyecto con requerimientos reales, participando en el desarrollo y las pruebas de un prototipo funcional. Uno de los principales desafíos fue adaptar el desarrollo a cambios de alcance, manteniendo seguridad, trazabilidad y coherencia técnica. Destaco la importancia de validar el funcionamiento mediante pruebas, documentar los avances y coordinar el trabajo del equipo. Aprendí que un prototipo funcional no equivale a un producto terminado: es necesario reconocer sus límites y dejar claras las tareas pendientes.

## 3. Individual conclusion and reflection — English (proposed translation)
WellQ allowed me to apply software engineering knowledge to a project with real-world requirements by contributing to the development and testing of a functional prototype. One of the main challenges was adapting the implementation to changes in scope while maintaining security, traceability, and technical consistency. This experience reinforced the importance of automated testing, clear documentation, and team coordination. I also learned that a functional prototype is not the same as a finished product: limitations must be clearly communicated, and pending work must remain visible.

## Evidencia técnica atribuible a Sebastián — verificación documental en GitHub
- PR #5, commit `ba56ff3516a514f72e2d521fb764d23147599fb6`: MVP de demostración con backend FastAPI, MongoDB, carga de PDF/PNG/JPEG, selección de perfiles ficticios paciente/profesional, flujo de revisión profesional y visor PDF.js. El PR original #5 se cerró sin merge. **El 24 de octubre se recuperó y fusionó mediante PR #8 a `main`** (merge commit `1934056bc4a4feddcd6f284306ec773012097b1d`).
- Evidencia registrada el 9 de octubre: 62 pruebas y 15 subpruebas backend, además de pruebas Chromium, según el texto de la PR y los archivos de resultados. Son resultados históricos declarados, **no pruebas reejecutadas en esta revisión**.
- Despliegue Vercel+Atlas documentado en `pruebas/vercel-2026-10-09/PUBLICACION_VERIFICADA.md` dentro del commit indicado. Se usaron exclusivamente datos sintéticos. Disponibilidad actual del despliegue no verificada aquí.
- PR #6, commit `f3285df6a51d20d894bd1df3c2edb96176ce93ba`: evidencia 2.1 y documento 2.4. Sus archivos están presentes en `main` con los mismos SHA de contenido que los archivos del PR; por ello no se requiere duplicarlos.
- El código descrito no implementa IA clínica, OCR general, diagnóstico o prediagnóstico; esos elementos permanecen como posibles fases posteriores sujetas a decisiones de alcance y validación.
- La carrera debe figurar como **Ingeniería en Informática** en las evidencias. **No se ha acreditado una corrección del texto interno del DOCX 2.1 ni 2.4**; revisarlos antes de entrega.
- El archivo grupal `BORRADOR_2.6_InformeFinal_WellQ.md` y la rama indicada por Vicente no estaban disponibles en la revisión del repositorio. Este documento no sustituye el informe de grupo ni valida afirmaciones que no se hayan contrastado con evidencia.

## Referencias
- https://github.com/seebago/capstone/pull/5
- https://github.com/seebago/capstone/pull/6
- https://github.com/seebago/capstone/pull/8
- https://github.com/seebago/capstone/commit/ba56ff3516a514f72e2d521fb764d23147599fb6
- https://github.com/seebago/capstone/commit/f3285df6a51d20d894bd1df3c2edb96176ce93ba

## Registro de apoyo IA
| Fecha | Herramienta | Aporte | Validación humana | Estado |
|---|---|---|---|---|
| 2026-10-24 | ChatGPT vía Sebastián | Respuestas individuales y síntesis con referencias y límites de GitHub, sin modificar los Word originales | Pendiente Sebastián/Vicente | Texto listo para revisión personal e incorporación en informe grupal |
