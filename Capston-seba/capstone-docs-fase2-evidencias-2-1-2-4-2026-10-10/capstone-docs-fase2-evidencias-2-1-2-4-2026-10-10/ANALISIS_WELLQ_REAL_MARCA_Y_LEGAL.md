# Análisis de la app WellQ real: marca, tecnología y marco legal UK

Fecha: 30 de septiembre de 2026, por Vicente López con Claude.
Fuente: investigación web de fuentes públicas del propio WellQ Ltd
(sitio oficial, ficha de Google Play, ficha de App Store y su política
de privacidad publicada). Nada de esto proviene de las bitácoras
internas del equipo ni de documentos de Max — es lo que WellQ Ltd
publica de cara al público.

## 1. Marca y diseño

**Importante primero**: no encontré una forma de extraer códigos de
color exactos (hex) de las capturas de pantalla reales de la app — las
herramientas de investigación web disponibles describen texto e
interfaz, no leen píxeles de imágenes de terceros. Lo que sigue es
descripción por fuente, no una paleta verificada pixel a pixel.

| Fuente | Lo observado |
|---|---|
| Sitio oficial [wellq.co.uk](https://www.wellq.co.uk/) | Tema **claro**, tono `#F6F8F9` como color de marca, acentos teal/cyan en logos de partners, construido en WordPress/Elementor. Esto es el sitio de marketing, no la app. |
| Ficha de Google Play (`com.wellq.app`) | Capturas con **tema claro**, paleta **azul y blanco**, tipografía sans-serif contemporánea, estética clínica/profesional con harto espacio en blanco. |
| Ficha de App Store Chile (`id6755544981`) | No expone capturas analizables por texto; confirma que la app es solo en **inglés** y clasificación 18+. |

**Hallazgo que hay que comunicar al equipo, en especial a Sebastián**:
la demo que está construyendo usa un tema **oscuro verde/negro**
("wellQ" con fondo `#0A1D27`-ish según la captura que compartió
Vicente). Eso **no coincide** con lo que la app real de WellQ muestra
públicamente (tema claro, azul/blanco). Si el objetivo es "usar los
mismos colores y diseño" de la app real, el tema debería ser claro, no
oscuro — a menos que el tema oscuro sea una decisión consciente del
equipo (ej. diferenciarse visualmente del original, o mostrar soporte
de light/dark mode como exige el brief). Antes de invertir más tiempo
de diseño, vale la pena decidir esto explícitamente.

**Recomendación**: no adivinar la paleta exacta a partir de capturas de
tienda de aplicaciones. Pedir a Max el kit de marca real (logo,
tipografía, tokens de color) si va a usarse como referencia de diseño —
es la fuente correcta, no una reconstrucción por inspección.

## 2. Producto y arquitectura (confirma lo ya registrado)

- WellQ se describe como "intelligence layer for musculoskeletal
  health": seguimiento de recuperación entre visitas, evaluación de
  movimiento por visión computacional, predicciones de riesgo
  (abandono, recaída, adherencia), integraciones con wearables (Apple
  Health, Oura, WHOOP).
- Tres planes comerciales: Core, Pro, Enterprise — los wearables están
  en Pro/Enterprise, coherente con el requisito de feature gating por
  plan que ya maneja el proyecto.
- Ningún dato técnico de stack backend en el sitio público (normal:
  ese tipo de información no se publica de cara al cliente). La
  confirmación de FastAPI/MongoDB/GCS/Flutter-Drift sigue viniendo solo
  de los documentos internos que compartió Max, no de fuentes públicas.
- Developer registrado: **WellQ Ltd**, Mildenhall, Bury St Edmunds,
  Reino Unido — confirma que es una empresa real, no un proyecto
  conceptual, y ubica la sede exacta en Suffolk, Inglaterra.

## 3. Marco legal UK (fuente: política de privacidad publicada de WellQ Ltd)

Esto es oro para cerrar los pendientes legales del equipo (ST-008,
ST-012, `PLAN_RESGUARDO_DATOS.md`): es la propia interpretación legal
que WellQ Ltd hace de su negocio, bajo las mismas leyes que aplicarán al
módulo que este equipo construye.

| Punto | Lo que declara WellQ Ltd |
|---|---|
| Identidad legal | **WellQ Ltd**, registrada en Inglaterra y Gales, N° de compañía **16517552**. Oficina registrada: Suite A, 82 James Carter Road, Mildenhall, IP28 7DE. |
| Registro ante el regulador | **ICO Registration: ZB953651** (Information Commissioner's Office, el regulador de protección de datos del Reino Unido) |
| Leyes citadas | UK GDPR, Data Protection Act 2018, UK Medical Devices Regulations 2002 (modificado), PECR 2003 |
| Dato de salud | Lo trata explícitamente como **special category data bajo UK GDPR**, procesado solo con **consentimiento explícito** del paciente |
| Base jurídica como encargado (processor) | **Artículo 9(2)(h) UK GDPR** — "necesario para medicina preventiva u ocupacional, provisión de salud o cuidado social" |
| Base jurídica como responsable (controller) | Art. 6(1)(b) ejecución de contrato, 6(1)(c) cumplimiento legal, 6(1)(f) interés legítimo |
| Hosting / residencia de datos | **Microsoft Azure, dentro del Reino Unido**. Declaran explícitamente: **"no transfiere datos personales fuera del Reino Unido de forma rutinaria"** |
| Transferencias internacionales | Cuando ocurren: decisiones de adecuación, UK IDTA o cláusulas contractuales tipo |
| Retención | Datos de cuenta/contrato: 6 años (por HMRC); logs técnicos: 12 meses; datos de paciente como processor: según instrucción del proveedor de salud; datos de wearables: hasta que se retire el consentimiento o se borre la cuenta; cuentas eliminadas: 30 días de recuperación antes de borrado definitivo; datos anonimizados: indefinido |
| Derechos del titular | Acceso, rectificación, supresión, restricción, oposición, portabilidad, retiro de consentimiento; **Art. 22 UK GDPR**: "ninguna decisión significativa sobre un paciente se toma únicamente por procesamiento automatizado" |
| Seguridad clínica | Opera un **Clinical Safety Framework conforme a DCB0129** (el estándar de seguridad clínica de NHS Digital para software de salud), con un registro de riesgos y un Clinical Safety Officer nombrado |
| Clasificación regulatoria | Declaran explícitamente que **NO están clasificados como dispositivo médico**: "operado como herramienta de bienestar digital y compromiso de rehabilitación... no toma decisiones diagnósticas o prescriptivas" |
| Certificaciones de seguridad | **No mencionan ISO 27001** todavía; dicen estar comprometidos a pentesting y gestión de vulnerabilidades "a medida que la plataforma avanza más allá de su fase beta actual" |

### Por qué importa para este proyecto

1. **Art. 9(2)(h) y "no decisión automatizada" son exactamente el
   patrón que ya sigue el Documento Maestro** para el motor de
   puntuación (E): el puntaje es para un profesional de salud, nunca
   para el paciente, y nunca decide solo. Esto no es una coincidencia —
   es la misma obligación legal aplicada al mismo tipo de dato. Se
   puede citar como respaldo cuando se redacte el ADR de alcance de IA
   (ADR-005).
2. **DCB0129** es nuevo para las bitácoras del equipo — no estaba
   registrado. No es obligatorio para un proyecto académico, pero si el
   sistema eventualmente se conecta con el WellQ real (que sí lo
   declara), vale la pena que quede anotado como estándar de referencia
   para cuando el componente E (puntuación) deje de ser sintético.
3. **"No clasificado como dispositivo médico"** es exactamente la
   misma postura que ya adoptó el Documento Maestro para el motor de
   puntuación propio del equipo ("no constituye diagnóstico ni
   recomendación terapéutica"). Coherente, no contradictorio.
4. **Azure UK, sin transferencias rutinarias fuera del Reino Unido**: es
   el estándar que el equipo debería intentar igualar si more adelante
   se maneja información real. Con datos sintéticos (política vigente
   del equipo, `PLAN_RESGUARDO_DATOS.md`) esto no aplica todavía, pero
   marca el objetivo cuando se cierre esa compuerta.
5. **No tienen ISO 27001 ni certificación formal todavía** — es una
   señal de que el estándar exigible a un proyecto Capstone razonablemente
   no debería ser más estricto que el que tiene hoy el propio WellQ Ltd
   en producción.

### Qué esto NO resuelve

- No dice nada sobre Chile ni sobre la Ley 20.584 (ficha clínica) — eso
  sigue siendo un vacío que solo Alloxentric/Karina pueden llenar
  (ST-006, ST-008 en su parte chilena).
- Es la postura legal de WellQ Ltd sobre **su** plataforma, no una
  garantía de que el módulo construido por este equipo herede
  automáticamente esa cobertura legal — si el módulo se integra al
  WellQ real, probablemente sí; si queda como proyecto académico
  independiente, el equipo necesita su propia base jurídica (siguen
  abiertos ST-003, ST-009, ST-012).

## Fuentes

- [WellQ — Intelligence Layer for MSK Health](https://www.wellq.co.uk/)
- [WellQ — Apps on Google Play](https://play.google.com/store/apps/details?id=com.wellq.app)
- [WellQ app — App Store (Chile)](https://apps.apple.com/cl/app/wellq-app/id6755544981)
- [WellQ — Privacy Policy](https://www.wellq.co.uk/privacy-policy)
- [Vercel Docs — Runtimes (sistema de archivos de funciones)](https://vercel.com/docs/functions/runtimes)
