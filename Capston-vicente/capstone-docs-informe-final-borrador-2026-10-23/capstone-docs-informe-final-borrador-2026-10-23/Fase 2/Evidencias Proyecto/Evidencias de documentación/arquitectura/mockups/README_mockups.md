# Mockups de interfaz — MVP WellQ

**Fase:** 2 — Requerimientos y diseño
**Fuente de contenido:** mismos flujos y datos sintéticos del MVP real (`feature/wellq-mvp-mongodb`),
coherentes con `Diagramas_Casos_de_Uso_y_Actividad_MVP.md` y `Diagrama_Clases_y_Modelo_BD_MVP.md`.

## Alcance y paleta (importante)

**La paleta de colores es provisional.** Vicente está solicitando a Max el kit de marca real de
WellQ. Mientras tanto, estos mockups usan un tema **claro, azul/blanco**, similar a lo que la app
real muestra públicamente en Google Play / App Store (ver `ANALISIS_WELLQ_REAL_MARCA_Y_LEGAL.md`),
como aproximación razonable — **no son los colores oficiales**. Cada pantalla incluye un aviso
visible de esto. Pendiente: reemplazar tokens de color en `_base.css` apenas llegue el kit real
(ver `ST-023` en `BITACORA_STAKEHOLDERS.md`).

Esto también deja resuelta la nota de arquitectura sobre Light/Dark Mode: al estar construido con
variables CSS (`_base.css`), cambiar de tema es cuestión de redefinir esas variables, no de
rehacer las pantallas — el mismo patrón que exige el proyecto para producción.

## Pantallas incluidas (5)

| Archivo | Caso de uso | Rol | Qué muestra |
|---|---|---|---|
| `01_login.png` | UC-01 | Paciente/Clínico | Inicio de sesión, `POST /api/session` |
| `02_paciente_dashboard.png` | UC-02, UC-03 | Paciente | Lista de exámenes propios + crear examen sintético |
| `03_paciente_confirmar.png` | UC-04, UC-05 | Paciente | Confirmar/descartar extracción, con la regla real de confianza < 0.9 |
| `04_clinico_dashboard.png` | UC-02 | Clínico | Pacientes a cargo (solo los de su `care_team_link` activo) |
| `05_clinico_validar.png` | UC-06, UC-07, UC-08 | Clínico | Validar/rechazar + nota de `CLINICAL_CATALOG_PENDING` (sin inventar un puntaje) |

Cada pantalla referencia su endpoint real al pie, para trazabilidad directa con el código y el
diagrama de casos de uso. No se modeló ninguna pantalla para `CareTeamLink` (asignar paciente a
clínico) porque esa funcionalidad no existe en el MVP — ver `ST-027`.

## Fuente editable

`_base.css` + 5 archivos `.html` autocontenidos (sin dependencias externas), renderizados a PNG
con Playwright a 390×844 (@2x). Se incluyen ambos formatos para poder ajustar texto o colores sin
rehacer el diseño desde cero.
