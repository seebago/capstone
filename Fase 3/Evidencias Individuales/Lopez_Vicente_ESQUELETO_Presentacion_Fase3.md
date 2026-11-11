# Esqueleto de presentación individual — Vicente López, Fase 3 (defensa 12-dic-2026)

**Importante — corrige un supuesto equivocado:** el `GUION_EXPOSICION_20_MIN_FASE2_2026-10-24.md`
que ya existe en el repositorio fue escrito como una exposición **grupal**
(con minutos asignados a Vicente, Sebastián y Aron por separado). El
Programa de Asignatura PTY4614 dice explícitamente que la Evaluación 3 es
una **"Presentación individual Proyecto APT a comisión"**, con **nota
particular para cada integrante**. No se puede reutilizar ese guion tal
cual — cada integrante necesita su propio esqueleto de 20 minutos,
contando el proyecto completo desde su propio rol, no un fragmento.

**Duración:** máximo 20 minutos, incluyendo preguntas de la comisión
(docente(s) + Dirección de Carrera). Mapeado contra RA3 (IL 3.1, 3.2, 3.3)
— ver `RESUMEN_PAUTA_EVALUACION_3.md` en esta misma carpeta.

## Estructura propuesta (ajustar tiempos al ensayar)

| Minuto | Sección | Contenido | Mapea a |
|---|---|---|---|
| 0:00–1:30 | Portada y rol | Quién soy, mi rol (líder de equipo), WellQ Medical Exams y el encargo real de Alloxentric | IL 3.2 (formato) |
| 1:30–3:30 | Relevancia | Problema real que resuelve (trazabilidad clínica paciente-profesional, multi-tenant, datos sensibles Chile/UK) y por qué importa para el perfil de egreso | IL 3.1 |
| 3:30–5:00 | Objetivos | Objetivo general y específicos del proyecto | IL 3.1 |
| 5:00–7:00 | Metodología | Por qué se eligió documentar el proceso real en vez de simular Scrum; coordinación con dos asistentes de IA en paralelo; Git como fuente única de verdad | IL 3.1 |
| 7:00–11:00 | Desarrollo (mi aporte específico) | Liderazgo del equipo; organización del repositorio y bitácoras; verificación en vivo del MVP (bugs encontrados); triaje del informe de seguridad externo de Alloxentric (39 hallazgos, SEC-01 crítico) y plan de remediación; coordinación de evidencias de Fase 1/2/3 | IL 3.1, IL 3.3 (lenguaje técnico) |
| 11:00–13:00 | Evidencias | Mostrar en pantalla: bitácoras (`BITACORA_PROGRESO.md`, `BITACORA_ARQUITECTURA.md`, `BITACORA_STAKEHOLDERS.md`), el plan de remediación, commits propios en GitHub | IL 3.1 |
| 13:00–14:30 | Demo en vivo (plan B si falla) | Mismo plan B del guion de Fase 2: verificar `/api/health` antes de entrar a clases; si falla, usar capturas ya versionadas en `pruebas/` | IL 3.1, IL 3.3 |
| 14:30–17:00 | Intereses y proyecciones profesionales | Basado en mi diario 3.1 ya redactado: cómo WellQ confirmó y especializó mis intereses (seguridad/cumplimiento), qué fortalezas ejercité de verdad (trabajar contra OWASP, cerrar ciclo de vida de dependencias), qué debilidad de coordinación persistió (ver honestamente el estancamiento de `main` 17+ días), y mi proyección a 5 años | IL 1.2 / RA2 (coherencia con lo dicho en fases anteriores) |
| 17:00–18:30 | Cierre | Síntesis de 3 frases: qué se construyó, qué queda pendiente (SEC-01 sin confirmar, backend de Aron sin definir, pytest sin correr), próximos pasos reales | IL 3.1 |
| 18:30–20:00 | Preguntas de la comisión | Reservado — no se puede guionizar, pero preparar respuestas a: "¿dónde está la IA clínica?" (no implementada, fuera de alcance aprobado), "¿qué está realmente en Git vs. lo dicho de palabra?" (ser honesto: commits reales, ramas sin fusionar), "¿cuál es tu aporte verificable, no solo de coordinación?" (código de remediación de seguridad, documentación de arquitectura) | IL 3.3 |

## Pendiente antes de dar esto por listo

- [ ] Ensayar y ajustar tiempos reales (esto es un borrador, no un ensayo registrado — mismo criterio que el guion de Fase 2).
- [ ] Decidir si se usa apoyo audiovisual (el programa lo permite, no lo exige: "puede desarrollarse con apoyo de un recurso audiovisual si el proyecto lo requiere").
- [ ] Confirmar con Sebastián y Aron que cada uno entendió que su presentación también debe ser individual, no una porción de un guion compartido — esto no se puede asumir, hay que decírselo explícitamente.
- [ ] Conseguir la rúbrica detallada de "Ev For 3 - Autoevaluación" si existe como documento aparte en AVA (no estaba en el Programa de Asignatura).
- [ ] Actualizar el Informe Final (`Claude outputs/borrador_2.6_informe_final.md`) con los números de commit reales de `main` (confirmado: PR#5 fusionado en `1934056`, HEAD actual `9ea1ab5`) antes de usarlo como base de evidencias en la presentación.
