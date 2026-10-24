# Guion de exposición — WellQ, Informe Final Fase 2
**Duración total:** 20 minutos. **Audiencia:** docente/evaluación Duoc UC. **Estado:** guía preparada; tiempos propuestos, no ensayo registrado.

| Minuto | Diapositiva | Quién (propuesta, confirmar) | Qué explicar / mostrar |
|---|---|---|---|
| 0:00–1:30 | 1. Portada y objetivo | Vicente | Proyecto WellQ Medical Exams, necesidad de gestionar exámenes y objetivos de la Fase 2 |
| 1:30–3:30 | 2. Alcance y cambio de enfoque | Vicente | Del prototipo de marcadores al flujo de documentos; decisión de alcance de IA pendiente |
| 3:30–5:30 | 3. Requisitos y seguridad | Vicente / Sebastián | Multi-tenancy, roles, auditoría, feature gating, solo datos sintéticos |
| 5:30–7:30 | 4. Arquitectura de la demo | Sebastián | FastAPI, MongoDB, frontend web, Vercel y Atlas para evaluación; no stack final ratificado |
| 7:30–11:00 | 5. Flujo operativo | Sebastián | Paciente ficticio carga PDF → profesional vinculado lo recibe → confirma/valida/marca error |
| 11:00–13:30 | 6. Demostración visual | Sebastián | PDF ficticio y visor lado a lado; cambio de perfil e historial. Si falla cloud, capturas registradas |
| 13:30–15:00 | 7. Pruebas y control de calidad | Sebastián | Workflows dominio/integración verdes, casos de seguridad, límites conocidos |
| 15:00–16:30 | 8. Gestión y aportes grupales | Aron / Vicente | Aportes verificables de cada integrante; no adjudicar trabajo sin commit/evidencia |
| 16:30–18:30 | 9. Riesgos, aprendizajes y pendientes | Aron / Vicente | No hay IA clínica, OCR general, usuarios reales ni servicio productivo; documentación y ratificaciones abiertas |
| 18:30–20:00 | 10. Conclusiones | Equipo | Cierre y reflexión individual (incluidas traducciones al inglés exigidas por la pauta) |

## Demostración segura (plan B)
1. Abrir URL histórica https://wellq-mvp.vercel.app y verificar /api/health **justo antes de la clase**. No asegurar acceso actual sin comprobarlo.
2. Usar exclusivamente archivo PDF de prueba `evaluacion-kinesiologica-FICTICIA.pdf` y perfiles demo Alpha.
3. En pantalla, enseñar carga, recepción, estado de revisión y visor. Nunca introducir información clínica real.
4. Si el hosting falla, usar imágenes ya versionadas en `pruebas/vercel-2026-10-09/`, `viewer-2026-10-09/` y `dashboard-2026-10-09/`. Anunciar claramente que son capturas históricas.
5. Pregunta probable: “¿Dónde está la IA?”. Respuesta: “El MVP actual usa extracción/comparación determinista limitada; el componente de IA clínica no está implementado ni aprobado”.
6. Pregunta probable: “¿Qué está entregado en Git?”. Respuesta: “MVP fusionado en PR #8, reflexiones de Sebastián en PR #7, documentos previos preservados; informe 2.6 requiere consolidación y revisión de equipo”.

**Nota:** a Vicente y Aron les corresponde validar sus propios aportes y sus respuestas personales. Este guion no atribuye tareas no verificadas ni demuestra que la exposición ya haya sido ensayada.
