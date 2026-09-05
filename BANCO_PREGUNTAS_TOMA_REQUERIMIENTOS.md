# Banco de preguntas para la toma inicial de requerimientos de WellQ

**Versión:** 0.1 · **Fecha:** 5 de septiembre de 2026 · **Estado:** instrumento de levantamiento; respuestas pendientes.

## Propósito y uso

Se conserva el banco completo de 296 preguntas de la conversación «Iniciar proyecto WellQ», organizado en 20 categorías, y se agregan preguntas de cierre (297–320). No todas corresponden al MVP ni deben plantearse en una sola reunión. Las preguntas exploran necesidades; no constituyen requisitos aprobados.

Fuentes: Documento Central de Sincronización de WellQ (`Contexto_Sincronizacion_IA_WellQ_Capstone.pdf`), `guia-de-contexto-capstone.txt` y conversación de origen identificada al final de la [comparación de arquitecturas](COMPARACION_ARQUITECTURAS_WELLQ.md). El marco legal y sus fuentes verificadas se encuentran en ese documento.

Los estándares ya fijados son Multi-Tenancy, RBAC, Feature Gating, auditoría con cinco dimensiones, API-First, i18n y Light/Dark Mode. Se pregunta cómo aplicarlos al negocio, sin volverlos opcionales. Basic/Premium y los estados de examen son ejemplos, pendientes de validación.

Invitar a Max Khreimerman y Karina Álvarez, representantes clínicos y administrativos y, para temas específicos, responsables de infraestructura, comercial y privacidad. Confirmar quién tiene autoridad para aprobar cada respuesta.

Registrar cada respuesta con esta ficha:

| ID pregunta | Respuesta y evidencia | Requisito / historia | Criterio de aceptación observable | Prioridad | Responsable | Fecha de decisión | Estado |
|---|---|---|---|---|---|---|---|
| Q001 | Pendiente | Por definir | Por definir | Por acordar | Por asignar | Por acordar | Abierto |

Usar Q001–Q320 como identificadores estables. Estados sugeridos: abierto, respondido, por validar y aprobado. Registrar contradicciones y dependencias; una ausencia de respuesta no equivale a aprobación. No incorporar datos reales de pacientes en actas ni ejemplos del repositorio.

## 1. Objetivo y alcance del sistema

1. ¿Cuál es el problema principal que WellQ debe resolver?
2. ¿Qué proceso actual reemplaza o mejora WellQ?
3. ¿Quiénes son los usuarios principales del sistema?
4. ¿WellQ está pensado solo para clínicas y centros médicos, o también para empresas, laboratorios, mutualidades u otras organizaciones?
5. ¿Los pacientes tendrán acceso directo a la plataforma?
6. ¿Qué funcionalidades consideran imprescindibles para la primera versión?
7. ¿Qué funcionalidades pueden quedar para fases posteriores?
8. ¿Existe actualmente una aplicación, sistema o proceso que WellQ deba replicar o reemplazar?
9. ¿Cuál es el flujo completo esperado desde que se solicita un examen hasta que se entrega o consulta el resultado?
10. ¿Qué consideran ustedes que debería demostrar el MVP para considerarlo exitoso?

---

## 2. Tipos de usuarios y roles


11. ¿Qué tipos de usuarios existirán?
12. ¿Qué perfiles manejan actualmente?
13. ¿Existirá un administrador global de WellQ?
14. ¿Cada cliente tendrá su propio administrador?
15. ¿Qué puede hacer un médico?
16. ¿Qué puede hacer personal administrativo?
17. ¿Qué puede hacer un técnico o especialista?
18. ¿Qué puede hacer un paciente?
19. ¿Existen usuarios que puedan pertenecer a más de una clínica u organización?
20. ¿Una persona puede tener varios roles simultáneamente?
21. ¿Los permisos dependen únicamente del rol o también de la clínica, sede, área o examen?
22. ¿Quién puede crear usuarios?
23. ¿Quién puede asignar o modificar roles?
24. ¿Quién puede desactivar usuarios?
25. ¿Necesitan permisos temporales o accesos de emergencia?
26. ¿Es necesario registrar cuándo un administrador cambia permisos de otro usuario?

---

## 3. Clientes, organizaciones y Multi-Tenancy


27. ¿Qué representa exactamente un `client` o tenant en WellQ?
28. ¿Una clínica completa es un tenant?
29. ¿Una empresa con varias clínicas debería ser un solo tenant o varios?
30. ¿Una clínica puede tener múltiples sedes?
31. ¿Los datos deben compartirse entre distintas sedes del mismo cliente?
32. ¿Un profesional puede trabajar para varios tenants?
33. ¿Un paciente puede aparecer en más de una organización?
34. Si un paciente existe en dos clientes distintos, ¿deben considerarse registros completamente independientes?
35. ¿Existe algún usuario de Alloxentric que necesite consultar varios tenants?
36. ¿Soporte técnico podrá acceder a información de los clientes?
37. Si puede hacerlo, ¿qué controles y autorizaciones necesita ese acceso?
38. ¿Algún cliente requiere aislamiento físico superior al resto?
39. ¿Se espera que clientes grandes puedan solicitar infraestructura dedicada?

---

## 4. Pacientes

40. ¿Qué información básica necesita registrar WellQ de un paciente?
41. ¿Qué identificador se utilizará en Chile: RUT, pasaporte u otro?
42. ¿Qué identificadores se utilizarán en Reino Unido?
43. ¿Un paciente puede no tener identificación nacional disponible?
44. ¿Qué información demográfica es realmente necesaria?
45. ¿Se necesita registrar dirección?
46. ¿Teléfono?
47. ¿Correo electrónico?
48. ¿Fecha de nacimiento?
49. ¿Sexo o género?
50. ¿Información del empleador?
51. ¿Debe existir un identificador interno WellQ independiente del documento nacional?
52. ¿Cómo se manejarán registros duplicados de pacientes?
53. ¿Quién puede corregir datos identificatorios?
54. ¿Debe quedar registrado el historial de modificaciones de datos personales?

---

## 5. Exámenes médicos

Este es uno de los puntos más importantes que las fuentes todavía no describen en detalle.

55. ¿Qué tipos de exámenes manejará WellQ?
56. ¿Son exámenes laborales, clínicos, preventivos, diagnósticos o de otro tipo?
57. ¿Qué información contiene cada examen?
58. ¿Existe un catálogo fijo de tipos de examen?
59. ¿Los clientes pueden crear sus propios tipos de examen?
60. ¿Todos los exámenes tienen la misma estructura?
61. ¿Algunos contienen datos estructurados y otros documentos?
62. ¿Quién crea un examen?
63. ¿Quién carga el resultado?
64. ¿Quién lo revisa?
65. ¿Quién lo aprueba?
66. ¿Quién lo firma?
67. ¿Puede un resultado ser corregido después de su aprobación?
68. Si se modifica un resultado, ¿debe mantenerse la versión anterior?
69. ¿Necesitan estados como:

`Pendiente → En proceso → Revisado → Aprobado → Entregado`?

70. ¿Se pueden cancelar exámenes?
71. ¿Existe un motivo obligatorio de cancelación?
72. ¿Se necesitan observaciones internas?
73. ¿El paciente puede ver todas las observaciones o solo el resultado final?

---

## 6. Archivos y documentos médicos


74. ¿WellQ almacenará archivos?
75. ¿Qué formatos?

Por ejemplo:

- PDF;
- imágenes;
- JPG/PNG;
- Excel;
- DICOM;
- documentos escaneados.

76. ¿Cuál podría ser el tamaño máximo de un archivo?
77. ¿Cuántos documentos puede tener un examen?
78. ¿Los documentos deben visualizarse dentro de WellQ?
79. ¿Se deben poder descargar?
80. ¿Quién tiene permiso para descargarlos?
81. ¿Es necesario registrar cada visualización o descarga?
82. ¿Los documentos pueden reemplazarse?
83. ¿Debe mantenerse historial de versiones?
84. ¿Existen documentos que nunca puedan eliminarse?

---

## 7. Flujo clínico

85. ¿Cuál es el proceso real que sigue hoy un examen?
86. ¿Quién inicia el proceso?
87. ¿Qué persona interviene después?
88. ¿Existen etapas obligatorias?
89. ¿Qué eventos requieren aprobación humana?
90. ¿Hay exámenes que requieren revisión por dos profesionales?
91. ¿Existe firma médica?
92. ¿Necesitan firma electrónica?
93. ¿Hay resultados que deban bloquearse hasta una revisión?
94. ¿Existen valores críticos que deban generar una alerta?
95. ¿Qué ocurre cuando un resultado es anormal?
96. ¿Se debe notificar automáticamente a alguien?

---

## 8. Inteligencia Artificial


97. ¿Qué problema concreto esperan resolver con Inteligencia Artificial?
98. ¿La IA es obligatoria para la primera versión?
99. ¿La IA procesará texto?
100. ¿Procesará documentos?
101. ¿Procesará imágenes médicas?
102. ¿Procesará resultados numéricos?
103. ¿Generará resúmenes?
104. ¿Detectará datos anómalos?
105. ¿Hará recomendaciones?
106. ¿Hará predicciones?
107. ¿Propondrá diagnósticos?
108. ¿La IA podrá modificar información del sistema?
109. ¿O solo sugerirá acciones a un humano?
110. ¿Toda salida de IA necesita aprobación humana?
111. ¿Debe almacenarse la respuesta generada por IA?
112. ¿Debe guardarse qué modelo generó cada resultado?
113. ¿Debe almacenarse el prompt utilizado?
114. ¿Es necesario explicar por qué una IA llegó a determinada conclusión?
115. ¿Está permitido utilizar servicios externos de IA?
116. ¿Existe algún proveedor ya aprobado por Alloxentric?
117. ¿Se permite enviar datos personales o médicos a proveedores externos?
118. ¿La empresa quiere utilizar información para entrenar modelos propios?
119. ¿La IA debe funcionar también sin conexión a Internet?
120. ¿Hay alguna funcionalidad de IA que explícitamente **no** deba desarrollar el equipo?

---

## 9. Planes comerciales y Feature Gating


121. ¿Qué planes comerciales existirán?
122. ¿Basic, Professional, Premium, Enterprise u otros?
123. ¿Cuáles deben estar implementados para la primera entrega?
124. ¿Qué funcionalidades incluye cada plan?
125. ¿Qué límites puede tener un plan?

Por ejemplo:

- cantidad de usuarios;
- pacientes;
- exámenes;
- almacenamiento;
- uso de IA;
- sedes.

126. ¿Una funcionalidad bloqueada debe ocultarse completamente?
127. ¿O debe mostrarse indicando que requiere un plan superior?
128. ¿Puede un cliente comprar features individuales?
129. ¿Pueden existir excepciones comerciales por cliente?
130. ¿Los cambios de plan son inmediatos?
131. ¿Qué ocurre al bajar de plan y tener más recursos de los permitidos?
132. ¿Qué ocurre cuando una suscripción vence?
133. ¿Se bloquea el acceso?
134. ¿Se mantiene acceso de solo lectura?
135. ¿Durante cuánto tiempo se conservan los datos?

---

## 10. Autenticación

136. ¿Los usuarios se registrarán por sí mismos o serán invitados?
137. ¿Quién crea la primera cuenta de una organización?
138. ¿Se necesita verificación de correo?
139. ¿Se requiere MFA?
140. ¿Qué métodos de MFA serían aceptables?
141. ¿Necesitan inicio de sesión con Google o Microsoft?
142. ¿Clientes empresariales necesitarán SSO?
143. ¿Necesitan integración con Microsoft Entra ID/Azure AD?
144. ¿Cuánto debe durar una sesión?
145. ¿Se permite iniciar sesión desde varios dispositivos?
146. ¿Un administrador debe poder cerrar remotamente una sesión?
147. ¿Se debe bloquear una cuenta después de varios intentos fallidos?
148. ¿Necesitan recuperación de contraseña?
149. ¿Debe registrarse el historial de inicios de sesión?

---

## 11. Auditoría


150. ¿Qué acciones deben auditarse?
151. ¿Solo modificaciones o también lecturas?
152. ¿Cada vez que alguien visualiza un examen debe generarse un evento?
153. ¿Cada descarga?
154. ¿Cada búsqueda de paciente?
155. ¿Cambios de roles y permisos?
156. ¿Inicio y cierre de sesión?
157. ¿Uso de funciones de IA?
158. ¿Cambios de plan?
159. ¿Acciones administrativas?
160. ¿Quién puede consultar la auditoría?
161. ¿Los clientes podrán ver su propia auditoría?
162. ¿Alloxentric tendrá una vista global?
163. ¿Cuánto tiempo deben conservarse estos registros?
164. ¿Necesitan exportarse?
165. ¿Existe algún formato de auditoría solicitado por clientes o reguladores?

---

## 12. Privacidad y datos personales


166. ¿En qué países se encontrarán los usuarios?
167. ¿En qué países se encontrarán los pacientes?
168. ¿WellQ funcionará inicialmente en Chile, Reino Unido o ambos?
169. ¿Existen otros países previstos?
170. ¿Quién será legalmente responsable de los datos?
171. ¿Alloxentric será responsable o encargado del tratamiento?
172. ¿Qué responsabilidad tendrá cada clínica?
173. ¿Existe actualmente una política de privacidad corporativa?
174. ¿Existe una política de retención?
175. ¿Qué información puede eliminarse?
176. ¿Qué información debe conservarse obligatoriamente?
177. ¿Qué datos deben anonimizarse?
178. ¿Qué datos deben seudonimizarse?
179. ¿Los datos podrán utilizarse para estadísticas?
180. ¿Podrán utilizarse para investigación?
181. ¿Podrán utilizarse para entrenar IA?
182. ¿El paciente podrá solicitar copia de su información?
183. ¿Puede solicitar correcciones?
184. ¿Puede solicitar eliminación?
185. ¿Qué proceso debe seguirse cuando termina el contrato de un cliente?

---

## 13. Chile y Reino Unido


186. ¿La sucursal chilena procesará datos de pacientes del Reino Unido?
187. ¿Personal ubicado en Chile tendrá acceso a datos alojados en UK?
188. ¿Personal de UK tendrá acceso a pacientes chilenos?
189. ¿Dónde quiere Alloxentric que residan físicamente los datos?
190. ¿Existen contratos o políticas que ya regulen transferencias internacionales?
191. ¿Cuentan con un DPO o responsable de privacidad?
192. ¿Existe asesoría jurídica especializada en protección de datos?
193. ¿Hay políticas internas de seguridad que debamos seguir?
194. ¿Alloxentric posee certificaciones como ISO 27001 u otras?
195. ¿Alguno de sus clientes exige requisitos adicionales de seguridad?

---

## 14. Infraestructura


196. ¿Alloxentric proporcionará infraestructura Cloud?
197. ¿Qué proveedor utiliza actualmente?
198. ¿AWS?
199. ¿Azure?
200. ¿Google Cloud?
201. ¿Otro?
202. ¿Existe alguna cuenta de desarrollo disponible?
203. ¿La Fase 1 debe funcionar exclusivamente de forma local?
204. ¿Se permite utilizar Supabase?
205. ¿Se permite Docker?
206. ¿Qué entornos esperan?

```text
Development
Testing
Staging
Production
```

207. ¿Necesitan disponibilidad 24/7?
208. ¿Cuál es el nivel de disponibilidad esperado?
209. ¿Existen requisitos de recuperación ante desastres?
210. ¿Con qué frecuencia deben realizarse backups?
211. ¿Cuánto tiempo pueden perderse datos ante un incidente?
212. ¿Cuánto tiempo puede permanecer caído el sistema?

---

## 15. Integraciones

213. ¿WellQ debe integrarse con algún sistema existente?
214. ¿Con sistemas clínicos?
215. ¿Laboratorios?
216. ¿Equipos médicos?
217. ¿ERP?
218. ¿CRM?
219. ¿Sistemas de recursos humanos?
220. ¿Servicios de correo?
221. ¿WhatsApp?
222. ¿SMS?
223. ¿Microsoft 365?
224. ¿Google Workspace?
225. ¿Existen APIs de Alloxentric que debamos utilizar?
226. ¿WellQ debe exponer API para terceros?
227. ¿Qué sistemas necesitarían consumirla?

---

## 16. Notificaciones

228. ¿Qué eventos deben generar notificaciones?
229. ¿Nuevo examen?
230. ¿Resultado disponible?
231. ¿Resultado crítico?
232. ¿Examen pendiente de revisión?
233. ¿Usuario creado?
234. ¿Problema de seguridad?
235. ¿Cambio de plan?
236. ¿Qué canales se necesitan?
237. ¿Correo?
238. ¿SMS?
239. ¿Push?
240. ¿WhatsApp?
241. ¿Las notificaciones deben ser configurables por usuario?

---

## 17. Interfaz y experiencia de usuario


242. ¿Qué idiomas deben estar disponibles inicialmente?
243. ¿Español e inglés?
244. ¿Cuál será el idioma predeterminado?
245. ¿El idioma depende del usuario o de la organización?
246. ¿Hay guía visual o branding de Alloxentric?
247. ¿Existen colores corporativos?
248. ¿Existe logotipo oficial de WellQ?
249. ¿Qué dispositivos deben soportarse?
250. ¿PC?
251. ¿Tablet?
252. ¿Smartphone?
253. ¿Necesitan aplicación móvil?
254. ¿La aplicación web debe ser responsive?
255. ¿Existen requisitos de accesibilidad?
256. ¿Debe funcionar Light/Dark Mode automáticamente según el dispositivo?

---

## 18. Búsqueda, reportes y estadísticas

257. ¿Cómo necesitan buscar pacientes?
258. ¿Por nombre?
259. ¿Identificación?
260. ¿Número interno?
261. ¿Empresa?
262. ¿Fecha?
263. ¿Se deben buscar exámenes por rango de fechas?
264. ¿Necesitan filtros avanzados?
265. ¿Qué reportes requiere cada tipo de usuario?
266. ¿Los reportes pueden exportarse?
267. ¿PDF?
268. ¿Excel?
269. ¿CSV?
270. ¿Necesitan dashboards con estadísticas?
271. ¿Qué indicadores esperan visualizar?

---

## 19. Rendimiento y volumen

272. ¿Cuántos clientes esperan inicialmente?
273. ¿Cuántos usuarios por cliente?
274. ¿Cuántos pacientes?
275. ¿Cuántos exámenes mensuales?
276. ¿Cuántos documentos se almacenarán?
277. ¿Qué tamaño promedio tienen los archivos?
278. ¿Cuántos usuarios pueden trabajar simultáneamente?
279. ¿Cuál es el tiempo máximo aceptable de carga de una página?
280. ¿Cuánto puede tardar una búsqueda?
281. ¿La cantidad de datos crecerá significativamente durante los próximos años?

---

## 20. Requisitos de la entrega Capstone


282. ¿Qué esperan ver funcionalmente el **12 de septiembre de 2026 (fecha por confirmar)**?
283. ¿Debe existir una aplicación funcional o basta un prototipo?
284. ¿Qué módulos son obligatorios para esa fecha?
285. ¿Qué diagramas requieren?
286. ¿Qué nivel de detalle esperan en el IEEE 830?
287. ¿Necesitan casos de uso?
288. ¿Historias de usuario?
289. ¿Mockups?
290. ¿ERD?
291. ¿Diagrama de arquitectura?
292. ¿Pruebas?
293. ¿Deployment funcional?
294. ¿Existen rúbricas o criterios específicos de evaluación?
295. ¿Hay fechas intermedias de revisión?
296. ¿Qué esperan de cada integrante individualmente?

---

## 21. Preguntas adicionales de cierre y validación

297. ¿WellQ será custodio de la ficha clínica oficial, repositorio de resultados o solo visualizador, y quién será el prestador responsable?
298. ¿Se tratarán datos de menores o personas representadas y cómo se comprobarán la representación y los permisos?
299. ¿Qué base jurídica sustenta cada finalidad y, en UK, qué condición adicional permite tratar datos de salud?
300. ¿Quién realizará la evaluación de impacto y determinará si corresponde nombrar un DPO?
301. ¿Qué ajustes deben estar listos para la entrada en vigor de la Ley 21.719 el 1 de diciembre de 2026?
302. ¿Quién evalúa y notifica incidentes en cada país, cómo se escala al responsable y qué plazos contractuales internos se necesitan?
303. ¿Qué entidades legales, países, proveedores y accesos remotos participan en cada flujo internacional, incluidos backups y soporte?
304. ¿Qué mecanismo de transferencia y evaluación de riesgo respaldarán cada flujo, y quién los aprobará?
305. ¿Se acepta auditoría append-only con límites frente a administradores para el MVP, o se requiere WORM desde la primera entrega?
306. ¿Qué operaciones deben bloquearse si no puede persistirse la auditoría, y qué alertas se esperan?
307. ¿Cómo se concilian retención, solicitudes de eliminación, corrección de resultados y conservación de evidencia?
308. ¿Qué datos se permiten en desarrollo, pruebas y demostraciones, y quién aprueba su anonimización cuando no sean sintéticos?
309. ¿Qué roles necesitan MFA, cómo se recupera una cuenta y quién puede aprobar excepciones?
310. ¿En cuánto tiempo deben hacerse efectivos la baja de usuarios, la revocación de permisos y los cambios de plan?
311. ¿Qué aprobaciones, límites de tiempo y trazabilidad requiere un acceso de soporte o emergencia?
312. ¿Cómo se resolverán intentos simultáneos de editar, aprobar o firmar el mismo resultado?
313. ¿Cómo se previenen duplicados cuando una integración reintenta enviar un examen o una notificación?
314. ¿Se requieren HL7/FHIR o DICOM, en qué versión y con qué muestras, documentación y entornos de prueba?
315. ¿Qué metadatos identificatorios, malware o contenido sensible pueden contener los archivos y cómo deben inspeccionarse?
316. ¿Qué información puede aparecer en correos o mensajes, y cómo se comprobará que el destinatario sigue autorizado al abrir un enlace?
317. ¿Qué conjuntos de evaluación, umbrales de calidad y revisión humana demostrarán que la IA es aceptable para su finalidad?
318. ¿Qué debe ocurrir si la IA falla, entrega información errónea, supera la cuota o recibe instrucciones maliciosas dentro de un documento?
319. ¿Quién mantendrá el sistema, custodiará las cuentas, pagará los servicios y atenderá incidentes tras el Capstone?
320. ¿Quién aprueba el IEEE 830 y el MVP, con qué evidencia, y cómo se gestionarán cambios de alcance después de esa aprobación?

## Preparación y cierre de las reuniones

Solicitar ejemplos sintéticos de un examen completo, formularios actuales, catálogo de exámenes, matriz de perfiles, matriz comercial, políticas aplicables, contratos de infraestructura y rúbrica de evaluación. Si un documento contiene datos reales, solicitar una versión adecuada para el levantamiento.

Al cierre, leer los acuerdos, separar hechos de supuestos y asignar responsable y plazo a cada pendiente. Transformar las respuestas en requisitos funcionales y no funcionales, historias, criterios de aceptación y decisiones de arquitectura. Confirmar la entrega del 12 de septiembre de 2026, citada en el contexto, y su alcance actual.

## Preguntas prioritarias para la primera reunión

Propuesta para 60 minutos: negocio y flujo (15), usuarios y alcance (15), datos e infraestructura (15), IA y planes (10), acuerdos y responsables (5). Las preguntas siguientes guían la conversación; sus referencias permiten continuar con el banco completo.

| Prioridad | Pregunta principal | Referencias |
|---|---|---|
| 1 | ¿Qué problema debe resolver WellQ y cómo se medirá el éxito? | Q001–Q002, Q010 |
| 2 | ¿Cómo transcurre hoy un examen desde su solicitud hasta su entrega? | Q009, Q085–Q096 |
| 3 | ¿Qué tipos de examen, resultados y archivos se manejarán? | Q055–Q061, Q074–Q077 |
| 4 | ¿Quiénes usarán el sistema y qué puede hacer cada rol? | Q011–Q026 |
| 5 | ¿Los pacientes tendrán acceso y a qué información? | Q005, Q018, Q073 |
| 6 | ¿Qué representa un tenant y cómo se relaciona con sus sedes? | Q027–Q031 |
| 7 | ¿Puede un usuario trabajar para varios clientes y cómo cambia de contexto? | Q019, Q032, Q035–Q037 |
| 8 | ¿Qué funcionalidades son imprescindibles para el MVP y cuáles se postergan? | Q006–Q007, Q282–Q284 |
| 9 | ¿Qué debe demostrarse el 12 de septiembre y quién lo aprueba? | Q282–Q296, Q320 |
| 10 | ¿Qué hará exactamente la IA y es necesaria para la primera entrega? | Q097–Q108, Q120 |
| 11 | ¿La IA dará recomendaciones clínicas y quién revisará sus resultados? | Q105–Q110, Q317–Q318 |
| 12 | ¿Qué planes, funcionalidades y límites hay que implementar? | Q121–Q135 |
| 13 | ¿Se operará en Chile, UK o ambos y qué entidades legales participan? | Q166–Q172, Q186–Q188, Q303 |
| 14 | ¿WellQ custodiará la ficha clínica oficial y quién responde por ella? | Q170–Q176, Q297 |
| 15 | ¿Dónde se alojarán los datos y quién proporcionará la infraestructura? | Q189–Q190, Q196–Q206 |
| 16 | ¿Qué datos se podrán usar en desarrollo y demostraciones? | Q177–Q178, Q308 |
| 17 | ¿Qué proveedores externos y transferencias de datos están autorizados? | Q115–Q118, Q190, Q303–Q304 |
| 18 | ¿Qué integraciones son obligatorias para el primer flujo completo? | Q213–Q227, Q314 |
| 19 | ¿Qué nivel de auditoría y controles de acceso debe demostrar el MVP? | Q139–Q149, Q150–Q165, Q305–Q311 |
| 20 | ¿Quién resolverá los pendientes, aprobará requisitos y mantendrá el sistema? | Q191–Q193, Q295–Q296, Q319–Q320 |
