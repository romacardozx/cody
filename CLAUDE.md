# Proyecto: Cody — visualizador de algoritmos con predicción

Este repo NO tiene relación con tdl ni con el "Training Companion" de ~/CLAUDE.md: ignorar esas instrucciones acá.

## Stack
Java 21 · Spring Boot 4 · JPA/Hibernate · Lombok · SQL Server (Docker) · Maven · React+Vite · Motion

## Comandos
Atajos en el Makefile (`make help`): make setup · make dev · make test · make build · make zip SHIFT=.. TEAM=..
- Base de datos: docker compose up -d (requiere .env, copiar de .env.example)
- Backend: ./mvnw spring-boot:run -Dskip.yarn -Dskip.installnodeyarn
- Frontend dev: cd frontend && yarn dev (usar yarn, no npm)
- Tests + cobertura: ./mvnw verify
- Build completo: ./mvnw clean package

## Git
- Se trabaja en `develop`; `main` solo recibe merges estables.

## Idioma
- **Código en inglés**: clases, métodos, variables, paquetes, comentarios, Javadoc, tests, commits.
- **Base de datos en inglés**: tablas, columnas, datos de catálogo (códigos como `DIJKSTRA`).
- **API en inglés**: rutas (`/api/scenarios`), campos de los DTO.
- **Español solo para lo que ve el usuario**: textos de la UI, preguntas, explicaciones de los pasos y mensajes de error que muestra la página.
- La documentación del proyecto (docs/, este archivo) sigue en español.

## Reglas
- engine/ es Java puro: sin anotaciones de Spring ni de JPA.
- TDD: test que falla primero, siempre en engine/.
- Controllers devuelven ResponseEntity<DTO>; nunca entidades.
- Errores vía @ControllerAdvice con mensajes claros (en español, los ve el usuario).
- Javadoc en servicios y en cada algoritmo (complejidad incluida).
- Contrato de la traza: ver skill algorithm-trace. No cambiarlo sin avisar.
- data.sql corre en cada arranque: todo INSERT idempotente (IF NOT EXISTS por clave natural).
- UI: respetar DESIGN.md y PRODUCT.md (Impeccable). No inventar estilos nuevos por pantalla.
- Al cerrar una tarea: explicar en 3-5 líneas qué se hizo y por qué (el equipo tiene que poder defenderlo).
