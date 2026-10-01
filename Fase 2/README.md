# Avance WellQ de Fase 2

## Nuevo MVP MongoDB e interfaz del 30 de septiembre

[Iniciar el MVP local](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/README.md>)
y [modelo aplicado, pruebas y límites](<Evidencias Proyecto/Evidencias de documentación/MVP_MongoDB_Interfaz_2026-09-30.md>).
El incremento agrega persistencia real, autenticación de demo e interfaz de
confirmación y revisión. El informe previo y el prototipo se conservan como
evidencia histórica; la descripción de ausencia de DB corresponde a esa
entrega anterior, no al nuevo MVP.

## Contenido de esta entrega

- [Aplicación y pruebas](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/prototype/README.md>): prototipo sintético D/E.
- [Informe PDF](<Evidencias Proyecto/Evidencias de documentación/Informe_Avance_WellQ_Fase_2.pdf>): actividades, evidencias, resultados y pendientes.
- [Arquitectura](<Evidencias Proyecto/Evidencias de documentación/arquitectura/ARQUITECTURA_BASE.md>).
- [Prioridades DE-FG-ABC](<Evidencias Proyecto/Evidencias de documentación/arquitectura/PRIORIDADES_DE_FG_ABC.md>).

## Ejecutar

Desde la raíz del repositorio:

```sh
cd "Fase 2/Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base"
python -m unittest discover -s tests -v
python -m prototype.demo
```

Estado: 22 pruebas locales aprobadas. D implementa reglas parciales de
confirmación/revisión; E solo elegibilidad, sin cálculo clínico. No hay
API, persistencia, interfaz ni conexiones a producción. La carpeta Base de
datos conserva su estructura original: todavía no hay una BD operativa.

El workflow permanece en `.github/workflows/`, ubicación requerida por GitHub.
Las bitácoras y el README general permanecen en la raíz como índice del equipo.
La revisión humana y la ratificación de decisiones pendientes siguen abiertas.

## Alcance de la publicación del 30 de septiembre

Esta publicación contiene exclusivamente Fase 2 y el workflow de pruebas.
Se aplica sobre main sin integrar la rama documental de Vicente ni publicar
las modificaciones locales de las bitácoras de la raíz. Esa rama se conserva
en el remoto como referencia del contexto. Los hashes citados en el informe
son los commits locales de preparación; la publicación por el conector
GitHub se registra en un commit independiente y su pull request.
