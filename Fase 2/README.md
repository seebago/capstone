# WellQ — avances de Fase 2

## MVP actual: MongoDB e interfaz de pruebas

Actualización: 1 de octubre de 2026. Código y documentación preparados con
asistencia de Codex; aceptación académica y revisión humana pendientes.

- [Abrir y ejecutar la demo](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/README.md>).
- [Informe del avance y guion de presentación](<Evidencias Proyecto/Evidencias de documentación/INFORME_AVANCE_MVP_2026-10-01.md>).
- [Aplicación del modelo de datos y arquitectura del MVP](<Evidencias Proyecto/Evidencias de documentación/MVP_MongoDB_Interfaz_2026-09-30.md>).
- [Verificación visual](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/design-qa.md>).
- [Capturas y resultados](<Evidencias Proyecto/Evidencias de documentación/evidencias-mvp-2026-10-01>).

El MVP agrega MongoDB real, acceso por perfiles, revisión/corrección del
paciente y validación del profesional. La interfaz sigue el estilo oscuro
y turquesa observado en la app oficial de WellQ. Usa datos ficticios.

Verificación: 37 pruebas de dominio/API/MongoDB, 15 subpruebas y recorrido
completo de navegador aprobados. Sin carga de PDF, extracción IA ni puntaje
clínico numérico. No es un despliegue de producción ni cubre todo A–G.

### Ejecutar en Windows

Desde `Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base`:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

Abre http://127.0.0.1:8765 y usa la clave local de `.runtime/access.txt`.
Requisitos, puertos, persistencia y pruebas adicionales están en el README
de la aplicación. Las claves y los archivos de ejecución quedan fuera de Git.

## Arquitectura y prioridades conservadas

- [Arquitectura base](<Evidencias Proyecto/Evidencias de documentación/arquitectura/ARQUITECTURA_BASE.md>).
- [Prioridades DE → FG → ABC](<Evidencias Proyecto/Evidencias de documentación/arquitectura/PRIORIDADES_DE_FG_ABC.md>).

El incremento desarrolla la base de D y E; no cambia esa priorización.
El modelo original recibido no se publica ni se modifica.

## Entrega anterior: base sintética del 30 de septiembre

- [Prototipo de dominio](<Evidencias Proyecto/Evidencias de sistema/Aplicación/wellq-base/prototype/README.md>).
- [Informe histórico PDF](<Evidencias Proyecto/Evidencias de documentación/Informe_Avance_WellQ_Fase_2.pdf>).
- [Informe histórico Markdown](<Evidencias Proyecto/Evidencias de documentación/Informe_Avance_WellQ_Fase_2.md>).

Las referencias a ausencia de API, persistencia e interfaz en esos informes
corresponden al prototipo anterior. Se preservan como evidencia histórica.
Sus 22 pruebas se ejecutan con `python -m unittest discover -s tests -p test_domain.py`
desde `wellq-base`; las 37 del MVP, con `python -m pytest -q` y MongoDB activo.

Los workflows permanecen en `.github/workflows/`, ubicación requerida por
GitHub. Las ramas y bitácoras generales del equipo no se sobrescriben.
