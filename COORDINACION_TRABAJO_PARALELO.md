# Coordinación de trabajo en paralelo entre asistentes de IA — WellQ

Fecha: 9 de octubre de 2026. Autor: Claude (vía Vicente López).
Estado: propuesta de protocolo para el equipo; aplica desde que se
fusiona a `main`.

## Objetivo

Este repositorio lo trabajan dos personas con asistentes de IA distintos
en paralelo: Sebastián González con Codex, Vicente López (y el resto del
equipo) con Claude. Hasta ahora eso ha funcionado por buena voluntad y
coordinación manual por WhatsApp. Este documento lo hace explícito para
que:

1. Ninguna IA invente trabajo por su cuenta ni decida cosas que le
   corresponden al equipo o a Alloxentric — eso ya lo exige `AGENTS.md`,
   este documento lo refuerza específicamente para el escenario de
   **dos asistentes trabajando sin supervisión cruzada al mismo tiempo**.
2. El trabajo avance en paralelo sin pisarse: mientras Sebastián no tenga
   cupo de Codex (como ocurrió 3-9 de octubre), Vicente pueda encargarle
   tareas a Claude que *adelanten* el camino de Sebastián sin tocar su
   código ni duplicar su trabajo cuando retome.

**Este documento no reemplaza `AGENTS.md`.** `AGENTS.md` son las reglas
no negociables (arquitectura, seguridad, qué no inventar). Este
documento es el protocolo operativo de *quién hace qué y cuándo* para
que esas reglas se cumplan también cuando dos IAs trabajan sin que haya
una persona mirando las dos pantallas a la vez.

## Antes de tocar nada (además de los 4 pasos de `AGENTS.md`)

5. Lee este archivo completo, en particular la tabla de tareas más abajo.
6. Si vas a tomar una tarea de la tabla: confirma que no tiene ya un
   responsable con trabajo en curso (rama abierta, commit reciente). Si
   lo tiene, no la dupliques — elige otra o pregúntale a tu integrante
   humano antes de avanzar.
7. Si vas a tomar una tarea **que no está en la tabla**, porque te la
   pidieron directamente, agrégala a la tabla con tu nombre antes de
   empezar (no después), para que el otro asistente la vea en su próxima
   sesión.

## Reparto de responsabilidad por defecto

No es una regla rígida — el equipo puede reasignar cualquier tarea — pero
evita choques si no se dice lo contrario:

- **Código del MVP en ejecución** (`mvp/`, `prototype/`, dependencias,
  despliegue): Sebastián/Codex. Claude puede *leerlo, probarlo y
  reportar hallazgos* (como el 9-10, ver bugs reportados abajo), pero no
  lo modifica sin que Sebastián lo revise primero — es su código y debe
  poder seguir construyéndolo sin reconciliar cambios ajenos a mitad de
  camino.
- **Documentación, bitácoras, diagramas, mockups, plan de pruebas,
  IEEE 830/historias de usuario**: Vicente/Claude, por defecto, porque no
  tocan el código en ejecución y así no bloquean a Sebastián.
- **Decisiones de arquitectura (ADR), de alcance de IA (ST-004), de
  motor de base de datos (ST-022), de proveedor de IA**: ninguna de las
  dos IAs decide. Van a `BITACORA_STAKEHOLDERS.md` como abiertas hasta
  que el equipo o Alloxentric las resuelvan.

## Cola de tareas compartida

Se actualiza cada vez que una IA toma, avanza o cierra algo. "Estado"
usa: `Pendiente` (nadie la tomó), `En curso` (alguien la tomó, rama
abierta), `Bloqueada` (depende de otra tarea o de una decisión humana),
`Lista para revisión` (pusheada, falta validación humana), `Cerrada`
(validada por un humano).

| ID | Tarea | Para quién | Depende de / bloquea | Estado |
|---|---|---|---|---|
| T-01 | Subir la rama `feature/wellq-evaluation-deploy` a GitHub (ST-028) — hoy el código en producción (Vercel/Ngrok) no existe en el repo | Sebastián / Codex | Bloquea que cualquiera revise o continúe ese código | Lista para revisión (Sebastián/Codex; rama publicada y QA público aprobado; validación humana pendiente) |
| T-02 | Corregir bug: "Cambiar perfil" deja la pantalla de selección superpuesta sobre el nuevo dashboard (no es problema de backend — ver `BITACORA_PROGRESO.md`, Novedades del 9-10 noche) | Sebastián / Codex | — | Lista para revisión (Sebastián/Codex; rama publicada y QA público aprobado; validación humana pendiente) |
| T-03 | Corregir bug: contadores resumen e historial del profesional leen el endpoint viejo `/api/v1/clinical-tests` en vez de `/api/v1/exam-documents` | Sebastián / Codex | — | Lista para revisión (Sebastián/Codex; rama publicada y QA público aprobado; validación humana pendiente) |
| T-04 | Catálogo de 2-3 tipos de documento candidatos + ejemplos sintéticos representativos (primera entrega de `PLAN_RECONOCIMIENTO_EXAMENES_IA.md`) | Claude / Vicente | Esto desbloquea la Fase 1 del plan de Sebastián para que no tenga que detenerse a definirlo él solo | **En curso** (Claude, 9-10 noche) |
| T-05 | IEEE 830 / Historias de usuario sobre el flujo real de carga de PDF (no sobre el MVP de marcadores, ya superado) | Claude / Vicente | — | Pendiente |
| T-06 | Decidir si se actualizan los diagramas de casos de uso/clases y los mockups del 6-7 de octubre (describen el flujo de marcadores) al nuevo flujo de PDF, o se dejan como registro histórico | Propone Claude, decide el equipo | Depende de una decisión del equipo, no solo técnica | Pendiente de decisión |
| T-07 | Parsers por formato + OCR local para los tipos de documento acordados (segunda etapa del plan de Sebastián) | Sebastián / Codex | Depende de T-04 | Bloqueada |
| T-08 | Experimento controlado de extracción con IA vs. baseline de reglas (tercera etapa) | Sebastián / Codex | Depende de T-07, de ST-004 (alcance de IA) y de elegir proveedor — ninguna IA elige proveedor sin aprobación | Bloqueada |
| T-09 | Ratificar formalmente el motor de base de datos (ADR-006/ST-022) — hoy "de facto" MongoDB por el MVP de Sebastián, sin ratificación del equipo/Karina | Humano (equipo) | Bloquea cerrar ST-022 en firme | Pendiente de decisión humana |

Cuando Sebastián retome con Codex, lo primero que debería hacer (según
`AGENTS.md`) es leer `BITACORA_PROGRESO.md` y esta tabla — así ve de
inmediato qué se adelantó mientras no tenía cupo, sin tener que
reconstruirlo preguntando por WhatsApp.

## Lo que ninguna IA decide por su cuenta, ni siquiera "para avanzar"

Esto repite y concreta reglas de `AGENTS.md` para el caso de dos
asistentes sin supervisión cruzada constante:

- No implementar ni simular diagnóstico, predicción o recomendación
  clínica, aunque parezca un atajo razonable para "completar" el flujo
  de IA — ST-004 sigue abierto y solo el equipo/Alloxentric lo cierran.
- No elegir proveedor de IA (NVIDIA u otro), cargar credenciales, ni
  activar llamadas a un servicio externo con datos del documento — eso
  es T-08, bloqueada hasta decisión humana.
- No fusionar a `main` ni tomar como válido código o documentación del
  otro integrante sin que una persona lo revise — cada aporte de IA
  pasa por el registro de `BITACORA_PROGRESO.md` sin autovalidarse.
- No sobrescribir ni "limpiar" secciones de la bitácora escritas por el
  otro asistente o integrante, aunque parezcan desordenadas o
  redundantes — se agrega, no se borra (salvo error evidente y
  reportado).
- No marcar una tarea de la tabla de arriba como `Cerrada` sin push real
  y sin validación humana registrada — local no cuenta como terminado,
  igual que en `AGENTS.md`.
- No tomar una tarea que ya tiene responsable en curso en la tabla sin
  coordinarlo primero con un humano.

## Al cerrar una tarea de este documento

1. Actualiza su fila en la tabla de arriba (`Estado`, y quién la cerró).
2. Sigue el cierre normal de `AGENTS.md`: bitácora correspondiente,
   registro de aportes de IA, commit, push.
3. Si al cerrarla descubriste que bloquea o desbloquea otra fila,
   actualiza también esa columna — así el otro asistente no tiene que
   deducirlo.

