# Informe Final Proyecto APT — WellQ Medical Exams
**Borrador para revisión — 23-10-2026**

> Nota de método: todo lo que sigue está redactado a partir de hechos
> verificables en el repositorio (commits, PRs, bitácoras) a la fecha de
> este borrador. Donde algo no está confirmado o sigue en discusión, se
> dice explícitamente — no se presenta como terminado algo que no lo está,
> siguiendo la misma regla que usamos en toda la documentación del
> proyecto.

**Nombre del proyecto:** WellQ Medical Exams — módulo de gestión de exámenes médicos
**Área(s) de desempeño:** Desarrollo de software, arquitectura de sistemas, gestión de proyectos informáticos
**Competencias:** Construcción de modelos de datos, desarrollo de soluciones de software, gestión de proyectos, pruebas de certificación

---

## 1. Relevancia del proyecto APT

WellQ Medical Exams busca resolver un problema concreto del flujo clínico
de Alloxentric: hoy la recepción, confirmación y validación de exámenes
médicos entre paciente y profesional no tiene un circuito digital
trazable, auditable y aislado por cliente (multi-tenant). El proyecto
desarrolla un módulo que se integra al producto WellQ existente de
Alloxentric — no es un ejercicio académico aislado, sino un componente
real evaluado para una plataforma SaaS de exámenes médicos que opera
(o proyecta operar) entre Chile y Reino Unido.

Es relevante para el campo laboral porque obliga a resolver, en un caso
real y no hipotético, los problemas centrales de cualquier plataforma
SaaS B2B: aislamiento de datos entre clientes (multi-tenancy), control de
acceso basado en roles, trazabilidad de acciones críticas (auditoría), y
decisiones de arquitectura bajo restricciones reales de seguridad y
privacidad de datos médicos (Ley 20.584 en Chile, normativa UK).

El impacto directo es sobre el personal clínico y los pacientes que usan
WellQ: un clínico que hoy no tiene forma sistemática de confirmar y
validar un examen recibido, y un paciente cuyo documento médico necesita
quedar registrado con un historial de estados verificable. El aporte de
valor concreto, hasta ahora, es un prototipo funcional (no solo un diseño
en papel) desplegado y accesible públicamente para que Alloxentric lo
pruebe, con el ciclo completo paciente → profesional operativo de punta a
punta.

## 2. Objetivos

**Objetivo general:** Desarrollar y validar un módulo de gestión de
exámenes médicos para WellQ, con aislamiento multi-tenant, control de
acceso por roles y trazabilidad de acciones, desplegado en un entorno
accesible para pruebas de la contraparte (Alloxentric).

**Objetivos específicos:**
- Diseñar un modelo de datos que soporte el aislamiento entre clientes
  (`client_id`) y la relación paciente-profesional.
- Implementar autenticación/autorización basada en JWT y roles.
- Construir el flujo de carga, lectura, confirmación y validación de
  exámenes médicos (actualmente en formato PDF).
- Habilitar un entorno de demostración accesible por red (no solo local)
  para que Alloxentric pueda probar el sistema de forma continua.
- Documentar la arquitectura, los casos de uso y un plan de pruebas que
  reflejen el sistema real construido, no una versión idealizada de él.

## 3. Metodología

El equipo trabajó con un desarrollo iterativo e incremental, priorizando
en cada ciclo lo que fuera verificable contra código o documentación
real, en vez de ceremonias formales de una metodología ágil que no
reflejaran la forma de trabajo real (horarios distintos, sin reuniones
diarias fijas). Esta decisión fue explícita y documentada: en vez de
simular Scrum con ceremonias que no ocurrían, se documentó honestamente
el proceso real de coordinación (bitácoras compartidas en Git, revisión
cruzada por Pull Request, registro de decisiones pendientes).

Esta metodología fue pertinente porque el equipo trabaja con dos
asistentes de IA en paralelo (Codex para Sebastián, Claude para el resto
del equipo) sin supervisión cruzada constante — se formalizó un
protocolo de coordinación (`AGENTS.md` y `COORDINACION_TRABAJO_PARALELO.md`)
que define quién decide qué, evita que una IA tome decisiones de
arquitectura por su cuenta, y permite que el trabajo avance en paralelo
sin pisarse ni duplicarse, incluso cuando algún integrante se queda sin
cupo de su herramienta de IA.

GitHub fue la fuente única de verdad: toda decisión relevante se registra
en bitácoras versionadas (`BITACORA_PROGRESO.md`, `BITACORA_STAKEHOLDERS.md`,
`BITACORA_ARQUITECTURA.md`) y todo cambio de código pasa por rama y
revisión antes de integrarse a `main`.

## 4. Desarrollo

**Etapas principales:**

1. **Levantamiento y arquitectura** (septiembre): análisis de
   requerimientos, comparación de arquitecturas candidatas, definición de
   reglas de aislamiento multi-tenant, RBAC, feature gating y auditoría.
2. **Base de dominio y reglas de negocio** (fines de septiembre):
   implementación de las reglas D/E (confirmación, permisos,
   elegibilidad) con pruebas automatizadas, antes de construir cualquier
   API o base de datos.
3. **MVP con persistencia real** (1-3 de octubre): API FastAPI + MongoDB,
   autenticación JWT, aislamiento multi-tenant verificado con pruebas
   automatizadas (37 pruebas en esa versión).
4. **Despliegue continuo** (5-9 de octubre): a pedido explícito de
   Alloxentric (vía Karina), se priorizó tener algo testeable de forma
   continua en vez de esperar al cierre — primero un túnel Ngrok,
   después un despliegue permanente en Vercel + MongoDB Atlas.
5. **Pivote de flujo de producto** (9 de octubre): el flujo cambió de un
   MVP de marcadores sintéticos a un flujo real de carga de exámenes en
   PDF, lectura estructurada, comparación con valores de referencia y
   confirmación/validación profesional — manteniéndose explícitamente
   fuera de alcance cualquier diagnóstico o lectura asistida por IA, que
   sigue sin autorización formal de Alloxentric.
6. **Verificación en vivo y coordinación en paralelo** (9-16 de octubre):
   se probó el flujo completo paciente-profesional sobre el MVP ya
   desplegado (no solo revisando código), lo que permitió encontrar y
   reportar dos errores de interfaz antes de una demostración real; en
   paralelo, se formalizó el protocolo de coordinación entre los dos
   asistentes de IA del equipo.

**Dificultades y facilitadores:** el principal facilitador fue tener
acceso al modelo de datos real de Alloxentric desde etapas tempranas, lo
que evitó diseñar sobre supuestos. Las principales dificultades fueron:
(a) un descalce de calendario entre el cronograma académico de Duoc y
el ritmo que pedía Alloxentric, resuelto por indicación del profesor de
priorizar Duoc sin dejar de cumplir con pruebas continuas para
Alloxentric; (b) un bloqueo de una semana en la disponibilidad de cupo de
IA de uno de los integrantes, que se abordó adelantando documentación y
diseño que no dependía de ese código; (c) un cambio de alcance de
producto implementado antes de ser ratificado formalmente por el equipo,
que se documentó como pendiente de decisión en vez de darlo por aprobado
o descartarlo sin análisis.

**Ajustes realizados:** se formalizó un reparto de responsabilidades por
defecto (código del MVP a cargo de Sebastián; documentación, pruebas y
coordinación a cargo de Vicente; diagramas y casos de prueba formales
como refuerzo de Aron), y un protocolo explícito de qué decisiones no
puede tomar ninguna IA por su cuenta — ambos quedaron registrados en el
repositorio, no solo acordados verbalmente.

## 5. Evidencias

**Evidencias disponibles en el repositorio** (`https://github.com/seebago/capstone`):

- Documentación de arquitectura: comparación de arquitecturas, ADR-007,
  modelo de datos, diagramas de casos de uso/actividad/clases.
- Base de dominio con pruebas automatizadas (reglas D/E).
- Prototipo de API FastAPI + MongoDB con autenticación JWT y aislamiento
  multi-tenant, con batería de pruebas automatizadas.
- Plan de pruebas formal del MVP.
- Bitácoras de progreso, arquitectura y stakeholders, con registro
  explícito de qué fue hecho por humano y qué por asistente de IA.

**Evidencia de despliegue:** demo pública en `https://wellq-mvp.vercel.app`
(MongoDB Atlas), verificada en vivo simulando el flujo completo como
paciente y como profesional.

**Limitación que este informe no oculta:** a la fecha de este borrador,
el código del despliegue más reciente y las evidencias de Fase 2 existen
en Pull Requests (#5 y #6) que están en proceso de integrarse a `main`.
[ACTUALIZAR esta sección con los números de commit reales una vez
fusionados — avísenme cuando esté hecho para dejarlo exacto antes de
entregar.]

## 6. Intereses y proyecciones profesionales

*(Sección pendiente de completar — ver preguntas más abajo. Cada
integrante responde la suya; si la pauta exige una sola voz grupal,
estructuro esto como subsecciones por integrante.)*

---

## Preguntas para completar tu parte (Vicente)

1. **Intereses profesionales**: ¿este proyecto te confirmó, cambió o
   amplió tus intereses profesionales? ¿Siguen siendo los mismos que
   planteaste al inicio de la asignatura, o no?
2. **Proyecciones**: ¿qué te gustaría seguir profundizando después de
   esto (ej. arquitectura de software, liderazgo técnico, seguridad,
   gestión de proyectos) y cómo te proyectas laboralmente?
3. Para tu **Conclusión individual** y **Reflexión** (ambas solo en
   inglés, según exige la pauta): puedo partir de lo que ya escribiste en
   tu 2.1 — ¿te parece si reutilizo ese contenido real (coordinación,
   pivote sin aprobar, protocolo entre IAs) traducido y adaptado al cierre
   de fase, o prefieres agregar algo distinto que no esté ahí?

Para Sebastián y Aron dejo las mismas 3 preguntas anotadas como tarea en
`COORDINACION_TRABAJO_PARALELO.md` — sin sus respuestas no puedo escribir
sus conclusiones/reflexiones sin inventarlas, y eso es justo lo que la
pauta penaliza (evaluación individual de este punto).
