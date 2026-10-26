# Proyecto: Cody — visualizador de algoritmos con predicción

Este repo NO tiene relación con tdl ni con el "Training Companion" de ~/CLAUDE.md: ignorar esas instrucciones acá.

## Stack
Java 21 · Spring Boot 4 · JPA/Hibernate · SQL Server · Maven · React+Vite · Motion · prism-react-renderer

## Comandos
Atajos en el Makefile (`make help`): make setup · make dev · make test · make build · make zip TURNO=.. EQUIPO=..
- Base de datos: docker compose up -d (requiere .env, copiar de .env.example)
- Backend: ./mvnw spring-boot:run -Dskip.yarn -Dskip.installnodeyarn
- Frontend dev: cd frontend && yarn dev (usar yarn, no npm)
- Tests + cobertura: ./mvnw verify
- Build completo: ./mvnw clean package

## Reglas
- motor/ es Java puro: sin anotaciones de Spring.
- TDD: test que falla primero, siempre en motor/.
- Controllers devuelven ResponseEntity<DTO>; nunca entidades.
- Errores vía @ControllerAdvice con mensajes claros en español.
- Javadoc en servicios y en cada algoritmo (complejidad incluida).
- Contrato de la traza: ver skill traza-algoritmos. No cambiarlo sin avisar.
- data.sql corre en cada arranque: todo INSERT idempotente (IF NOT EXISTS por clave natural).
- Comentarios y mensajes de UI en español.
- UI: respetar DESIGN.md y PRODUCT.md (Impeccable). No inventar estilos nuevos por pantalla.
- Al cerrar una tarea: explicar en 3-5 líneas qué se hizo y por qué (el equipo tiene que poder defenderlo).
