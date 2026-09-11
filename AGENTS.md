# Protocolo para asistentes de IA — WellQ

Este repositorio lo trabajan varias personas y varios asistentes de IA.
**Lee este archivo completo antes de proponer o modificar cualquier cosa.**

`AGENTS.md` es una convención que reconocen distintas herramientas. Si
trabajas con una que busca otro nombre, este archivo sigue siendo la
fuente: léelo igual.

## Los cuatro pasos obligatorios antes de tocar nada

1. Lee `BITACORA_PROGRESO.md` — estado real, bloqueos y quién hizo qué.
2. Lee `BITACORA_STAKEHOLDERS.md` — qué está decidido y qué está abierto.
3. Lee `BITACORA_ARQUITECTURA.md` — decisiones vigentes y contradicciones.
4. Ejecuta `git log --oneline -15`, `git status` y `git branch -r`.

No propongas ni implementes nada antes de completar estos cuatro pasos.
Si no puedes ejecutar comandos, dilo explícitamente y pide que te peguen
la salida, en vez de suponer el estado del repositorio.

## Reglas

**Verifica antes de afirmar.**
Toda afirmación sobre el estado del repositorio se comprueba contra
`git log` o `git ls-files`. No describas el procedimiento que *debería*
haberse seguido como si se hubiera seguido. Ver OM-01: ya ocurrió.

**No inventes requerimientos.**
Si una decisión depende de Alloxentric o de la docente, va a
`BITACORA_STAKEHOLDERS.md` como pendiente. Una ausencia de respuesta no
equivale a una aprobación.

**No reconstruyas lo que ya existe.**
Preserva el trabajo de Sebastián González, Vicente López y Aron Germain,
y el de otros asistentes. Ante un conflicto, analiza ambos cambios e
intenta conservar los dos.

**Ninguna IA valida su propio trabajo.**
Registra tu aporte en el registro de aportes de IA de
`BITACORA_PROGRESO.md`, con evidencia (commit o archivo), y deja la
columna de validación a un integrante humano.

**Nunca versiones secretos.**
Ni API keys —incluida la NVAPI key de NVIDIA—, ni `.env` reales, ni
datos de pacientes. En el repositorio solo va `.env.example` sin valores.

**Respeta la arquitectura no negociable.**
Multi-tenancy por `client_id`, RBAC, feature gating validado en backend,
auditoría de cinco dimensiones, API-First, i18n y light/dark mode. Si lo
que te piden contradice alguno, detente y explica el problema antes de
implementarlo.

**No hay funciones clínicas de IA sin aprobación.**
El alcance de la IA está abierto (ST-004). No implementes diagnóstico,
predicción ni recomendación clínica.

**Cambios pequeños y trazables.**
Rama corta desde la integración vigente, commit en Conventional Commits,
Pull Request. Nada directo a `main`. Nada de `reset --hard`, `clean`
destructivo ni `push --force` sin autorización explícita.

## Al terminar

1. Actualiza la bitácora que corresponda.
2. Agrega tu fila al registro de aportes de IA.
3. Deja claro qué probaste y qué no.
4. Si algo quedó solo en local, dilo: sin push, la tarea no está cerrada.

## Contactos

| Rol | Persona |
|---|---|
| Líder de equipo | Vicente López |
| Equipo | Sebastián González, Aron Germain |
| Docente y representante de Alloxentric | Karina Álvarez |
| Contraparte Alloxentric | Max Khreimerman |

La información con Alloxentric se canaliza por el líder de equipo.
