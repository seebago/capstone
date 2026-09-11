# Plan de resguardo de datos — WellQ

Versión 1.0 · 11 de septiembre de 2026 · Responsable: Vicente López (líder de equipo)

WellQ tratará **datos de salud de personas en el Reino Unido**. Bajo UK GDPR
eso es *special category data*: la categoría con mayor nivel de protección
que existe. Este plan define qué resguardamos, qué controlamos nosotros y
qué depende de Alloxentric.

> **Alcance de este documento.** Es un plan de trabajo de ingeniería basado
> en la guía publicada de la ICO, no asesoría legal. Las decisiones jurídicas
> concretas las valida Alloxentric con su asesoría. Los puntos marcados con
> `*` son pendientes que no puede cerrar el equipo por sí solo.

---

## Principio rector

**La mejor protección de un dato personal es no tenerlo.**

Mientras el proyecto trabaje únicamente con datos sintéticos no hay datos
personales, y por lo tanto no hay transferencia restringida, no hay
condición del artículo 9 que satisfacer, ni derechos de titulares que
atender. Todo el riesgo regulatorio aparece el día que entra el primer
dato real.

Por eso la decisión más importante del plan es la más barata: **durante todo
el Capstone se trabaja con datos sintéticos**, y ningún dato real entra al
sistema sin pasar la compuerta de la sección 3.

Esto no es una limitación del proyecto: es el control de seguridad de mayor
retorno que tenemos disponible.

---

## 1. Controles que dependen solo de nosotros

Se implementan desde el MVP. No requieren autorización de nadie y son
evidencia directa de Security by Design y Privacy by Design.

| # | Control | Qué significa en la práctica |
|---|---|---|
| C-01 | Datos sintéticos por defecto | Generador de datos ficticios versionado en el repositorio. Ninguna captura, demo o prueba usa datos reales. |
| C-02 | Minimización antes de la IA | El AI Gateway seudonimiza y reduce el contenido antes de llamar al proveedor. Nada identificable sale del sistema. |
| C-03 | Seudonimizar no es anonimizar | Un UUID sigue siendo dato personal si permite reidentificar. Texto libre, fechas e imágenes pueden identificar aunque no haya nombre. |
| C-04 | Separación identidad / clínica | Los datos de identidad viven separados de los resultados clínicos y exigen un permiso propio para leerse. |
| C-05 | Aislamiento multi-tenant probado | `client_id` + RLS, y pruebas explícitas de que el cliente A no accede a datos de B, incluidas respuestas de error. |
| C-06 | Auditoría de cinco dimensiones | Quién, qué, cuándo, desde dónde y resultado. Append-only frente al rol de aplicación. |
| C-07 | Nada clínico en los registros técnicos | Ni en logs, ni en prompts guardados, ni en mensajes de error, ni en métricas. |
| C-08 | Secretos fuera del repositorio | Solo `.env.example`. La NVAPI key es secreto de servidor y nunca se expone al frontend. |
| C-09 | Cifrado en tránsito y en reposo | Y URLs firmadas de corta duración para los archivos de exámenes. |
| C-10 | Retención y borrado definidos | Se diseñan ahora, aunque se apliquen sobre datos sintéticos. Añadirlos después cuesta mucho más. |
| C-11 | Sin diagnóstico automático | Ya decidido. La IA extrae y estructura; la validación humana es obligatoria. |
| C-12 | Región de despliegue en Reino Unido o UE | Elegir la región en Vercel y en la base de datos **desde el primer despliegue**. Migrar datos de región después es caro y riesgoso. |

C-12 es el que más se olvida y el más caro de revertir. Conviene cerrarlo
junto con ST-002.

---

## 2. Qué cambia por ser Reino Unido

Confirmado por Karina Álvarez el 11 de septiembre (ST-016).

- **Marco aplicable al producto:** UK GDPR y Data Protection Act 2018,
  modificados por la Data (Use and Access) Act 2025.
- **Los datos de salud exigen doble base:** una base legal del artículo 6
  **y** una condición del artículo 9. El consentimiento no resuelve por sí
  solo toda finalidad clínica.
- **Algunas condiciones piden más.** Si se usa la condición (h) «salud o
  atención social» o (g) «interés público sustancial», se necesita además
  una condición del Schedule 1 de la DPA 2018 y un **appropriate policy
  document** que describa la condición usada, cómo se cumplen los
  principios y la política de retención y eliminación.
- **El régimen chileno deja de aplicar al producto.** Ley 19.628, Ley 21.719
  y los quince años de ficha clínica de la Ley 20.584 pasan a ser contexto.
  Vuelven a aplicar si el alcance se amplía a Chile.

### El punto que no es obvio

**Chile sigue importando, por el equipo.** Desarrollamos desde Chile. El día
que existan datos reales de personas en el Reino Unido, nuestro acceso
remoto desde Chile constituye una **transferencia restringida** bajo el
régimen británico.

Chile no figura en la lista de adecuación del Reino Unido. Por lo tanto esa
transferencia necesita una salvaguarda del artículo 46 —un IDTA, o cláusulas
contractuales con el UK Addendum— y, antes de usarla, una evaluación de
riesgo de transferencia, que tras la DUAA se denomina *data protection test*.

Lo mismo hay que mapear para Vercel y para NVIDIA: dónde procesan realmente,
con qué subencargados y bajo qué compromisos de retención y entrenamiento.

**Mientras trabajemos con datos sintéticos, nada de esto se activa.** Es
exactamente por eso que el principio rector es el que es.

---

## 3. La compuerta: antes de cualquier dato real

Ningún dato personal real entra al sistema hasta que **todas** las filas
estén en sí. No es una recomendación: es la condición de entrada.

| # | Requisito | Estado |
|---|---|---|
| G-01 | Está definido quién es responsable del tratamiento y quién encargado, con contrato del artículo 28 entre ellos | `*` Pendiente |
| G-02 | Está documentada la base del artículo 6 y la condición del artículo 9, por finalidad | `*` Pendiente |
| G-03 | Si corresponde, existe la condición del Schedule 1 y el appropriate policy document | `*` Pendiente |
| G-04 | Se realizó la evaluación de impacto (DPIA) y está aprobada | `*` Pendiente |
| G-05 | Está resuelto si corresponde nombrar un DPO, con la decisión documentada | `*` Pendiente |
| G-06 | Existe el mecanismo de transferencia para el acceso del equipo desde Chile, con su data protection test | `*` Pendiente |
| G-07 | Está mapeado dónde procesan Vercel, NVIDIA y cualquier otro proveedor, con sus contratos | `*` Pendiente |
| G-08 | Está definida la retención del registro clínico bajo reglas británicas | `*` Pendiente |
| G-09 | Existe procedimiento de brechas: quién evalúa, quién notifica a la ICO y en qué plazo | `*` Pendiente |
| G-10 | Existe procedimiento para atender derechos: acceso, rectificación, supresión y portabilidad | `*` Pendiente |
| G-11 | Los controles C-01 a C-12 están implementados y probados | En curso |
| G-12 | Alloxentric autorizó por escrito el paso a datos reales | `*` Pendiente |

Las diez filas con `*` no las puede cerrar el equipo: dependen de
Alloxentric y de su asesoría jurídica. Están registradas en
`BITACORA_STAKEHOLDERS.md` para que no se pierdan.

---

## 4. Pendientes que hay que levantar con Alloxentric

Estas son las preguntas concretas que el líder de equipo debe canalizar.
No se responden por inferencia ni por analogía con otro proyecto.

1. ¿Qué entidad legal es responsable del tratamiento y cuál es encargada?
2. ¿Qué finalidad exacta tiene cada tratamiento, y qué base y condición la sustentan?
3. ¿Quién realiza la evaluación de impacto y quién la aprueba?
4. ¿Existe DPO, o se evaluó y se concluyó que no corresponde?
5. ¿Cómo se cubre el acceso del equipo desde Chile?
6. ¿Qué proveedores y regiones están autorizados, y bajo qué contratos?
7. ¿Cuánto tiempo se conserva cada categoría de dato, y cómo se elimina?
8. ¿Quién responde ante una brecha y en qué plazo interno debe escalarse?
9. ¿Qué datos se pueden usar en desarrollo, pruebas y demostraciones?
10. ¿Hay alguna finalidad prevista que convierta a WellQ en dispositivo médico? Hoy no, porque no diagnostica ni recomienda tratamiento, pero conviene dejarlo dicho.

---

## 5. Cómo se mantiene vivo este plan

- **Dueño:** el líder de equipo. Hoy, Vicente López.
- **Revisión:** en la reunión de los lunes con Alloxentric, revisando qué
  filas de la compuerta cambiaron de estado.
- **Trazabilidad:** cada pendiente con `*` tiene su ID en
  `BITACORA_STAKEHOLDERS.md`. Una respuesta verbal se registra el mismo día
  y se pide confirmación escrita cuando cambia el marco legal.
- **Regla para las IAs:** ningún asistente implementa una funcionalidad que
  mueva datos personales reales sin que la compuerta esté cerrada. Está en
  `AGENTS.md`.

## Fuentes

- ICO, *A guide to international transfers* — mecanismos de transferencia, IDTA y data protection test.
- ICO, *What are the rules on special category data?* — doble base del artículo 6 y 9, condiciones del Schedule 1 y appropriate policy document.
- ICO, *Data Use and Access Act 2025* — modificaciones vigentes al marco.
- `COMPARACION_ARQUITECTURAS_WELLQ.md` §4, §7, §8, §9 y §11 — diseño técnico subyacente.

Consultadas al 11 de septiembre de 2026.
