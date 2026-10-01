# Comprobación visual del MVP WellQ

Fecha: 2026-10-01. Autoría: Codex. Revisión humana pendiente.

## Referencia y alcance

- Fuente: https://apps.apple.com/cl/app/wellq-app/id6755544981
- Objetivo: adaptar la interfaz web de exámenes al estilo de la app real.
- Implementación local: http://127.0.0.1:8765
- Estado: login y flujo paciente → confirmación → revisión profesional.
- Captura fuente: pendiente. Se localizaron las imágenes públicas, pero no se visualizaron.
- Captura implementación: pendiente.
- Viewport, dimensiones y normalización de densidad: pendientes de captura.
- Comparación conjunta y comparación de regiones: no realizadas.

## Hallazgos

- [P1] Verificación visual bloqueada. El navegador integrado no inicia por
  `apply deny-read ACLs`. Pendiente autorización solicitada para un navegador
  de prueba alternativo; no se sustituye la comprobación visual por tests HTTP.
- Tipografía, ritmo de espaciado, colores, fidelidad de recursos y contenido:
  pendientes de cotejar visualmente con la referencia.
- Interacciones en navegador, vista móvil y errores de consola: pendientes.

## Evidencia independiente

37 pruebas de dominio/API/MongoDB y 15 subpruebas aprobadas localmente.
Estas pruebas no constituyen aprobación de diseño ni prueba de navegador.

## Lista de implementación

1. Abrir capturas oficiales de la app en navegador autorizado.
2. Ajustar la interfaz existente a su lenguaje visual.
3. Probar el recorrido completo, móvil, traducciones y consola.
4. Comparar ambas capturas juntas y corregir hallazgos P0/P1/P2.

Historial de comparación: ninguna iteración visual realizada todavía.

final result: blocked
