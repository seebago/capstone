# Comprobación visual del MVP WellQ

Fecha: 2026-10-01. Autoría: Codex. Revisión humana de empresa/equipo pendiente.

## Referencia y alcance

Adaptación del módulo web de exámenes al lenguaje visual de la app real,
solicitada por el usuario; no es una clonación de sus pantallas de ajustes
ni la implementación de su navegación móvil completa.

Fuente: https://apps.apple.com/cl/app/wellq-app/id6755544981

Todos los archivos de evidencia están en
`../../../Evidencias de documentación/evidencias-mvp-2026-10-01/`.

- Source visual truth: `wellq-reference-0.png` (ajustes) y
  `wellq-reference-1.png` (recuperación), ambas 428 × 926 píxeles.
- Implementación: `clinician-mobile.png`, ancho 428 píxeles, captura de
  página completa, viewport CSS 428 × 926, deviceScaleFactor 1.
- Comparación conjunta: `comparison-mobile.png`, 916 × 1006 píxeles.
  Presenta los primeros 926 píxeles de ambas capturas a escala 1:1,
  sin estirar ni confundir la barra del sistema de la fuente con el MVP.
- Detalle legible: `detail-mobile.png` para tabla, botones e historial;
  `patient-review-desktop.png` para edición y cotejo explícito.
- Escritorio: `login-desktop.png`, `clinician-desktop.png` y
  `clinician-light-english.png`; viewport CSS 1365 × 1000, densidad 1.
- Estados: login, paciente editando, profesional validado, filtro activo,
  tema oscuro/claro e idioma español/inglés.

Las pantallas fuente y MVP representan funciones distintas. La comparación
juzga la línea visual solicitada (superficies, jerarquía, tarjetas y
acciones), no una igualdad píxel a píxel de módulos que no son equivalentes.

## Superficies de fidelidad

- Tipografía: sans serif, títulos fuertes, subtítulos claros y secundarios
  grises; Arial/Helvetica local. La familia exacta de la app no puede
  certificarse desde una captura; esa homologación queda como refinamiento.
- Espaciado: márgenes móviles 16–24 px, tarjetas de radio 16 px y separación
  suficiente entre bloques. En escritorio se emplean dos columnas para
  mantener visible la lista y el detalle. Sin desborde horizontal en 390/428 px.
- Colores: carbón #191919, tarjeta #202020, cian #00b8d0 y texto #e8e8e8
  inferidos de la referencia. Verde/ámbar distinguen estados. El tema claro
  es una variante de la demo, no un tema oficial comprobado.
- Recursos: icono oficial de App Store, con fuente y atribución en
  `mvp/static/assets/README.md`; no se dibujó ni generó otro logotipo.
  Se usa el icono público en lugar del pequeño símbolo interno de las capturas.
- Texto: contenido propio de exámenes, etiquetas de demo y ausencia de
  valoración clínica inventada. Traducciones y encabezados revisados.

## Hallazgos e iteraciones

1. El navegador integrado falló por ACL; la captura estaba bloqueada.
   Se retomó en Chromium de prueba tras la instrucción de continuar.
2. [P2, corregido] Durante el cambio oscuro → claro los fondos de botones
   transicionaban mientras el texto ya cambiaba, dejando contraste pobre.
   Se eliminó la transición de fondo y se oscureció el indicador verde
   del tema claro. Evidencia posterior: `clinician-light-english.png`.
3. Se repitió el recorrido, se recapturó y se compararon conjuntamente
   fuente y móvil. No quedan hallazgos P0/P1/P2 para el alcance definido.

## Pruebas y resultados

- Creación sintética con identidad por revisar y confianza baja.
- Corrección 5 → 7, cotejo, motivo y confirmación; propuesta original visible.
- Cambio de perfil, validación clínica y elegibilidad sin puntaje numérico.
- Filtro de validados, español/inglés, tema claro/oscuro.
- Vista móvil 428 y 390 px sin desborde horizontal.
- Perfil Beta no ve el examen Alpha; salir y recargar vuelve al login.
- Errores de consola y excepciones JS: ninguno.
- Resultado automatizado: `browser-results.json`, passed true.
- Verificación independiente: 37 pruebas de dominio/API/MongoDB y
  15 subpruebas aprobadas. No sustituyen las verificaciones visuales anteriores.

## Refinamientos no bloqueantes

[P3] Solicitar al equipo el kit de marca, tipografía y símbolo interno
originales para una futura integración con React/Flutter de producción.
No se añaden secciones de agenda/ejercicio que el Capstone no implementa.

Lista final: captura fuente [x], captura MVP [x], comparación conjunta [x],
contraste corregido [x], recorrido probado [x], documentación [x].

final result: passed
