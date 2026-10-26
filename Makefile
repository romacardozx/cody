# Cody project shortcuts. List them all: make help
#
# Typical use:
#   make setup      (once: creates .env, installs the frontend, starts the database)
#   make dev        (backend + frontend in development mode)

SHELL := /bin/bash
MVN   := ./mvnw
# In development Maven does not rebuild the React app (Vite serves it)
SKIP_FRONT := -Dskip.yarn -Dskip.installnodeyarn

# Data for the delivery ZIP: make zip SHIFT=TN TEAM=MyTeam
SHIFT ?= SHIFT
TEAM  ?= TEAM
ZIP   := P3-Q2-2026-$(SHIFT)-$(TEAM)-Cody.zip

.DEFAULT_GOAL := help
.PHONY: help setup env install db-up db-down db-reset db-logs db-shell \
        backend frontend dev test build run clean zip

help: ## List the available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# --- Setup ---

setup: env install db-up ## First time: .env + frontend dependencies + database

env: ## Create .env from .env.example (if missing)
	@test -f .env || { cp .env.example .env && echo ".env created: change the passwords before continuing"; }

install: ## Install the frontend dependencies with yarn
	cd frontend && yarn install

# --- Database (SQL Server in Docker) ---

db-up: env ## Start SQL Server and create the cody database + cody_app login
	docker compose up -d --wait sqlserver
	docker compose run --rm sqlserver-init

db-down: ## Stop SQL Server (data is kept)
	docker compose down

db-reset: ## Wipe the database and create it again
	docker compose down -v
	$(MAKE) db-up

db-logs: ## Follow the SQL Server logs
	docker compose logs -f sqlserver

db-shell: ## Open sqlcmd on the cody database as cody_app
	@set -a; source .env; set +a; \
	docker exec -it cody-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U cody_app -P "$$DB_PASSWORD" -C -d cody

# --- Development ---

backend: ## Run Spring Boot on :8080 (without rebuilding the frontend)
	$(MVN) spring-boot:run $(SKIP_FRONT)

frontend: ## Run Vite on :5173 (proxies /api to :8080)
	cd frontend && yarn dev

dev: db-up ## Database + backend + frontend together (Ctrl+C stops everything)
	@trap 'kill 0' EXIT; \
	$(MVN) spring-boot:run $(SKIP_FRONT) & \
	(cd frontend && yarn dev) & \
	wait

# --- Quality ---

test: db-up ## Tests + coverage report (target/site/jacoco/index.html)
	$(MVN) verify $(SKIP_FRONT)

# --- Delivery ---

build: ## Build everything (backend + frontend) into a single .jar
	$(MVN) clean package -DskipTests

run: build db-up ## Run the final .jar, as in the demo (everything on :8080)
	java -jar target/cody-*.jar

clean: ## Delete build output (target/ and frontend/dist/)
	$(MVN) clean
	rm -rf frontend/dist

zip: ## Build the delivery ZIP with the source code: make zip SHIFT=TN TEAM=MyTeam
	@test "$(SHIFT)" != "SHIFT" -a "$(TEAM)" != "TEAM" || { echo "Missing: make zip SHIFT=<shift> TEAM=<team>"; exit 1; }
	git archive --format=zip --prefix=cody/ -o $(ZIP) HEAD
	@echo "Created $(ZIP) (committed files only: no .env, target or node_modules)"
