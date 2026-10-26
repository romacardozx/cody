# Atajos del proyecto Cody. Ver todos: make help
#
# Uso típico:
#   make setup      (una vez: crea .env, instala el frontend, levanta la base)
#   make dev        (backend + frontend en modo desarrollo)

SHELL := /bin/bash
MVN   := ./mvnw
# En desarrollo no se recompila el React desde Maven (lo sirve Vite)
SKIP_FRONT := -Dskip.yarn -Dskip.installnodeyarn

# Datos para el ZIP de entrega: make zip TURNO=TN EQUIPO=MiEquipo
TURNO  ?= TURNO
EQUIPO ?= EQUIPO
ZIP    := P3-Q2-2026-$(TURNO)-$(EQUIPO)-Cody.zip

.DEFAULT_GOAL := help
.PHONY: help setup env install db-up db-down db-reset db-logs db-shell \
        backend frontend dev test build run clean zip

help: ## Lista los comandos disponibles
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# --- Preparación ---

setup: env install db-up ## Primera vez: .env + dependencias del frontend + base de datos

env: ## Crea .env a partir de .env.example (si no existe)
	@test -f .env || { cp .env.example .env && echo ".env creado: cambiá las contraseñas antes de seguir"; }

install: ## Instala las dependencias del frontend con yarn
	cd frontend && yarn install

# --- Base de datos (SQL Server en Docker) ---

db-up: env ## Levanta SQL Server y crea la base cody + login cody_app
	docker compose up -d --wait sqlserver
	docker compose run --rm sqlserver-init

db-down: ## Apaga SQL Server (los datos se conservan)
	docker compose down

db-reset: ## Borra la base por completo y la vuelve a crear
	docker compose down -v
	$(MAKE) db-up

db-logs: ## Muestra los logs de SQL Server
	docker compose logs -f sqlserver

db-shell: ## Abre sqlcmd contra la base cody como cody_app
	@set -a; source .env; set +a; \
	docker exec -it cody-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U cody_app -P "$$DB_PASSWORD" -C -d cody

# --- Desarrollo ---

backend: ## Corre Spring Boot en :8080 (sin recompilar el frontend)
	$(MVN) spring-boot:run $(SKIP_FRONT)

frontend: ## Corre Vite en :5173 (proxy de /api a :8080)
	cd frontend && yarn dev

dev: db-up ## Base + backend + frontend juntos (Ctrl+C corta todo)
	@trap 'kill 0' EXIT; \
	$(MVN) spring-boot:run $(SKIP_FRONT) & \
	(cd frontend && yarn dev) & \
	wait

# --- Calidad ---

test: db-up ## Tests + reporte de cobertura (target/site/jacoco/index.html)
	$(MVN) verify $(SKIP_FRONT)

# --- Entrega ---

build: ## Compila todo (backend + frontend) en un único .jar
	$(MVN) clean package -DskipTests

run: build db-up ## Corre el .jar final, como en la demo (todo en :8080)
	java -jar target/cody-*.jar

clean: ## Borra lo compilado (target/ y frontend/dist/)
	$(MVN) clean
	rm -rf frontend/dist

zip: ## Arma el ZIP de entrega con el código fuente: make zip TURNO=TN EQUIPO=MiEquipo
	@test "$(TURNO)" != "TURNO" -a "$(EQUIPO)" != "EQUIPO" || { echo "Falta: make zip TURNO=<turno> EQUIPO=<equipo>"; exit 1; }
	git archive --format=zip --prefix=cody/ -o $(ZIP) HEAD
	@echo "Generado $(ZIP) (solo lo commiteado: sin .env, target ni node_modules)"
