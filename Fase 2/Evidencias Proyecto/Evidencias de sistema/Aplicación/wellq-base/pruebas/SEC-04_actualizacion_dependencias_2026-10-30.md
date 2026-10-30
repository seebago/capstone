# SEC-04 — Actualización de dependencias vulnerables (30-10-2026)

Hallazgo original (informe de revisión de Alloxentric, 29-10-2026): 6 paquetes
con CVEs conocidos. Verificado con `pip-audit` contra PyPI real (no se asumieron
los números de versión del informe sin comprobarlos — dos de ellos resultaron
incorrectos, ver más abajo).

## Antes (`requirements.txt` original)

```
certifi==2026.7.22
dnspython==2.8.0
opentelemetry-api==1.45.0
pymongo==4.18.2
pypdf==6.19.0
Pillow==12.3.0
```

`pip-audit` reportó **55 vulnerabilidades conocidas en 6 paquetes**.

## Cambios aplicados

| Paquete | Antes | Después | Resultado |
|---|---|---|---|
| certifi | 2026.7.22 | **2026.10.23** | CVEs resueltos |
| pymongo | 4.18.2 | **4.18.3** | CVE resuelto |
| opentelemetry-api | 1.45.0 | **1.45.2** | CVE resuelto |
| pypdf | 6.19.0 | **6.21.4** | 8 CVEs resueltos |
| Pillow | 12.3.0 | *(sin cambio)* | **No se pudo corregir** |
| dnspython | 2.8.0 | *(sin cambio)* | **No se pudo corregir** |

## Por qué Pillow y dnspython quedan pendientes

El informe original decía que la versión corregida era Pillow 13.0.0 y
dnspython 2.9.0. **Verificado contra PyPI real: ninguna de esas dos versiones
existe todavía** — 12.3.0 y 2.8.0 son, respectivamente, las versiones más
nuevas publicadas al 30-10-2026. `pip-audit` confirma que el CVE existe para
la versión instalada, pero no hay una versión fijable disponible: el propio
mantenedor del paquete aún no publicó el parche en PyPI.

**No es un pendiente del equipo, es un pendiente del ecosistema.** Queda
como riesgo conocido y documentado (no oculto): se debe repetir
`pip-audit -r requirements.txt` periódicamente (sugerido: cada entrega) y
actualizar apenas exista una versión publicada.

## Verificación

- `pip-audit -r requirements.txt` tras el cambio: **40 vulnerabilidades en 2
  paquetes** (Pillow y dnspython, por la razón de arriba) — bajó de 55 a 40,
  los 4 paquetes restantes quedaron limpios.
- Pruebas automatizadas: las 25 pruebas que no requieren una conexión real a
  MongoDB pasaron sin cambios tras la actualización. Las 37 pruebas de
  integración (API + MongoDB) **no se pudieron ejecutar** en los entornos
  disponibles para esta sesión: ni el VM del dispositivo del usuario
  (arquitectura aarch64, sin mongod, descarga de MongoDB bloqueada por la
  lista blanca de red) ni el contenedor en la nube (x86_64, pero sin
  `mongod` disponible vía apt ni descarga directa posible) tienen un
  MongoDB real corriendo. **No se declara esta actualización completamente
  probada** — falta que alguien con el entorno local ya armado (el script
  `start-demo` del README, que sí descarga MongoDB) corra `pytest` antes de
  fusionar esta rama a `main`.

| Aporte IA | Evidencia | Validación humana |
|---|---|---|
| Claude (esta sesión): actualización verificada de 4 de 6 dependencias vulnerables, auditoría con pip-audit, intento de corrida de pruebas | `requirements.txt`, `requirements.lock.txt`, este archivo | **Pendiente: correr `pytest` con MongoDB real antes de fusionar** |
