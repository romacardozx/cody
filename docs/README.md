# Cody

Visualizador de algoritmos donde no mirás: **predecís**. La animación se frena en los momentos clave, te pregunta qué pasa ahora y te explica por qué.

TP Integrador · Programación III · ECyT-UNSAM · 2026.

## Levantarlo

Necesitás **Docker** (abierto) y **Java 21**. Después, desde la carpeta del proyecto:

```bash
make up
```

Revisa que estén las herramientas, levanta PostgreSQL, compila si hace falta, arranca la app y te muestra en consola las URLs y las credenciales de la base. Para apagar todo: `make down`.

| Comando | Para qué |
|---|---|
| `make` | Lista todos los comandos con su explicación |
| `make up` / `make down` | Levantar / apagar todo |
| `make status` | Ver qué está corriendo |
| `make info` | Volver a ver URLs y credenciales |
| `make logs` | Ver los logs de la app |
| `make dev` | Programar: backend + frontend con recarga en vivo (en :5173) |
| `make test` | Tests + reporte de cobertura |
| `make sql` | Consola SQL sobre la base |
| `make zip SHIFT=TN TEAM=X` | ZIP de entrega |

La primera vez en una máquina nueva descarga la imagen de PostgreSQL y las dependencias: hacelo con buena conexión, no el día de la demo. En Windows, usá Git Bash o WSL para tener `make`.

Más detalle en [ARRANQUE.md](ARRANQUE.md) y en [DESIGN.md](../DESIGN.md).
