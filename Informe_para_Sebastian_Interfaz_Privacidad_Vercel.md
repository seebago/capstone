# Informe para Sebastián — Interfaz, política de privacidad real de WellQ y despliegue en Vercel

De: Vicente López (con apoyo de Claude) · 30 de septiembre de 2026

Te dejo esto resumido para que lo veas antes del lunes. El detalle completo con fuentes está commiteado en el repo (`ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md` y `PLAN_FASES_COMPONENTES.md` §7-9), esto es la versión corta para decidir rápido.

---

## 1. Interfaz — la paleta de tu demo no coincide con la app real

Investigué la app WellQ real (sitio oficial, ficha de Google Play y de App Store) para sacar colores y diseño de referencia. Hallazgo:

- **Tu demo** usa un tema **oscuro, verde/negro**.
- **La app real de WellQ** (según las capturas de Google Play) usa un tema **claro, azul y blanco**, tipografía sans-serif contemporánea, mucho espacio en blanco, estética clínica.

No son el mismo lenguaje visual. No es un error tuyo — nadie te había pasado esta comparación todavía — pero antes de que sigas invirtiendo tiempo de diseño en el tema oscuro, hay que decidir:

- **¿Alineamos la paleta a la real (claro/azul/blanco)?** Es lo más defendible si el argumento ante Karina/Max es "usamos el mismo lenguaje visual de WellQ".
- **¿Dejamos el tema oscuro a propósito?** También es válido si lo justificamos como demostración de soporte Light/Dark Mode (que es un requisito no negociable del proyecto) — pero entonces el tema claro también tiene que existir como opción, no solo el oscuro.

**No hay colores hex exactos confirmados** — no hay forma de sacar el código de color preciso desde afuera, solo la descripción de la interfaz. Mi recomendación: en vez de reconstruir la paleta mirando capturas de tienda, pedirle a Max el kit de marca real (logo, tipografía, tokens de color) si vamos a usar WellQ como referencia visual. Es la fuente correcta, no una reconstrucción a ojo.

## 2. Política de privacidad pública de WellQ Ltd — esto nos sirve para los pendientes legales

Su política de privacidad es pública y dice cosas muy concretas que nos sirven de referencia real (no son las nuestras automáticamente, pero es la interpretación legal más autorizada que existe sobre el mismo tipo de dato):

| Dato | Lo que declara WellQ Ltd |
|---|---|
| Empresa | WellQ Ltd, registrada en Inglaterra y Gales, N° 16517552, Mildenhall, Suffolk |
| Registro regulador | ICO (regulador de protección de datos UK) N° ZB953651 |
| Base legal para datos de salud | Artículo 9(2)(h) UK GDPR — "necesario para medicina preventiva u ocupacional, provisión de salud" |
| Dónde viven los datos | Microsoft Azure, **dentro del Reino Unido**, sin transferencias internacionales rutinarias |
| Estándar de seguridad clínica | Siguen **DCB0129** (el estándar de NHS Digital para software de salud) |
| ¿Es un dispositivo médico? | No — lo declaran explícitamente: "herramienta de bienestar digital... no toma decisiones diagnósticas o prescriptivas" |
| ISO 27001 | **Todavía no la tienen** (están en beta) |

Por qué importa para nosotros: el motor de puntuación que describe el Documento Maestro usa exactamente el mismo criterio ("no es diagnóstico, no decide solo") — no es casualidad, es la misma obligación legal aplicada al mismo tipo de dato. Y el hecho de que WellQ real todavía no tenga ISO 27001 nos da un piso realista: a un proyecto Capstone no se le puede exigir más nivel de certificación del que tiene hoy el propio WellQ en producción.

Lo que esto NO resuelve: nada sobre Chile ni la Ley 20.584 (ficha clínica) — eso lo sigue debiendo Alloxentric/Karina.

## 3. Vercel — es más complicado de lo que parece, y hay que preguntarle a Karina el lunes

Karina pidió desplegar el MVP en Vercel para que otros usuarios lo prueben. Reviso la documentación oficial de Vercel y hay un problema técnico real:

**Las funciones de Vercel corren con sistema de archivos de solo lectura.** Solo tienen un directorio temporal (`/tmp`) de 500 MB que se reinicia entre invocaciones — no está garantizado que persista entre visitas de distintos usuarios ni entre reinicios. Esto significa que **una base de datos como archivo (SQLite, lo que armé anoche para simular la persistencia) no sirve una vez desplegada ahí** — funciona perfecto en nuestras laptops y en las pruebas automáticas, pero no en Vercel.

Para que funcione de verdad en Vercel hace falta conectar la app a una base de datos externa alcanzable por internet (por ejemplo MongoDB Atlas o un Postgres gestionado tipo Neon/Supabase, ambos con capa gratuita). Es totalmente posible, pero significa que antes de desplegar tenemos que:

1. Elegir un motor (todavía no está cerrado si va a ser Mongo o Postgres — ver ADR-006 en la bitácora de arquitectura).
2. Crear esa base de datos gratuita en la nube.
3. Conectar el backend a ella en vez de a un archivo local.

**No es imposible, pero no es "subir la carpeta y listo".** Por eso, mi sugerencia: **dejarlo como pendiente para preguntarle a Karina el lunes** — puntualmente, si:

- Vercel es un requisito estricto, o
- Sirve alguna alternativa más simple para que otros hagan testing esta semana (por ejemplo, un túnel temporal tipo ngrok corriendo desde nuestras máquinas, o una demo grabada/interactiva sin backend real, o desplegar en una plataforma con disco persistente como Render/Railway en vez de Vercel).

Así no perdemos tiempo armando la infraestructura de Vercel si hay una vía más rápida que a ella también le sirva para esta semana.

---

## Antes del lunes, lo que te pido concretamente

1. Decime si el tema oscuro es intencional o si lo cambiamos a la paleta real (claro/azul/blanco) — para no rehacer el trabajo de diseño dos veces.
2. Revisa el detalle legal completo en `ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md` (ya está en el repo) por si hay algo que quieras agregar antes de mostrárselo a Karina.
3. Tenemos la pregunta de Vercel lista para el lunes — no hace falta que avances la infraestructura de despliegue hasta que hablemos con ella, salvo que prefieras adelantar la elección del motor de base de datos (Mongo vs. Postgres) en paralelo, que de todas formas la necesitamos tarde o temprano.
