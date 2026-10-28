# =============================================================================
#  Cody — project shortcuts
#
#  Run `make` (or `make help`) to see every command with a short explanation.
#
#  The one command most people need:
#      make up     -> checks the tools, starts the database, builds the app if
#                     the code changed, runs it and prints URLs and credentials
#      make down   -> stops the app and the database
#
#  Requirements: Docker running and Java 21. Node/yarn only for `make dev`
#  (the build downloads its own Node). On Windows use Git Bash or WSL.
# =============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

MVN        := ./mvnw
JAR        := target/cody.jar
RUN_DIR    := .run
PID_FILE   := $(RUN_DIR)/cody.pid
LOG_FILE   := $(RUN_DIR)/cody.log
# make up runs a copy of the jar, so building or testing while the app runs never touches it
RUN_JAR    := $(RUN_DIR)/cody.jar
APP_URL    := http://localhost:8080
VITE_URL   := http://localhost:5173
# Maven does not rebuild the React app in dev: Vite serves it with hot reload
SKIP_FRONT := -Dskip.yarn -Dskip.installnodeyarn
# Hides a harmless Node deprecation notice that Maven prints as "[ERROR]" and scares people
export NODE_OPTIONS := --no-deprecation

# Delivery ZIP name: make zip SHIFT=TN TEAM=MyTeam
SHIFT ?= SHIFT
TEAM  ?= TEAM
ZIP   := P3-Q2-2026-$(SHIFT)-$(TEAM)-Cody.zip

# Terminal colors for the messages below
B := \033[1m
G := \033[32m
Y := \033[33m
R := \033[31m
C := \033[36m
D := \033[2m
N := \033[0m

.PHONY: help up down restart status info logs doctor dev backend frontend install \
        env db db-down db-reset db-logs sql test build rebuild clean zip port-free

# Prints every target that has a "##" description, grouped by the "##@" headings
help: ## Muestra esta ayuda
	@printf "\n$(B)Cody$(N) — comandos disponibles. Uso: $(C)make <comando>$(N)\n"
	@awk 'BEGIN {FS = ":.*##"} \
	  /^##@/ { printf "\n$(B)%s$(N)\n", substr($$0, 5) } \
	  /^[a-zA-Z_-]+:.*##/ { printf "  $(C)%-10s$(N) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@printf "\n$(D)Primera vez: make up  ·  Ver qué está corriendo: make status$(N)\n\n"

##@ Lo principal

# Full startup. Each step is skipped when it is not needed (DB already up, jar
# already newer than the code, app already answering on port 8080).
up: doctor env db $(JAR) ## Levanta TODO (base + app) y muestra URLs y credenciales
	@mkdir -p $(RUN_DIR)
	@# Running from an older build (code changed since): stop it so the new one starts below
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null && [ $(JAR) -nt $(RUN_JAR) ]; then \
	  printf "$(Y)Hay una versión nueva compilada: reiniciando la app...$(N)\n"; \
	  kill $$(cat $(PID_FILE)); \
	  while curl -fs -o /dev/null $(APP_URL)/api/algorithms; do sleep 0.5; done; \
	fi
	@if curl -fs -o /dev/null $(APP_URL)/api/algorithms; then \
	  printf "$(Y)La app ya estaba corriendo.$(N)\n"; \
	else \
	  printf "Arrancando la app (los logs van a $(LOG_FILE))"; \
	  cp $(JAR) $(RUN_JAR); \
	  nohup java -jar $(RUN_JAR) > $(LOG_FILE) 2>&1 & echo $$! > $(PID_FILE); \
	  for i in $$(seq 1 90); do \
	    if curl -fs -o /dev/null $(APP_URL)/api/algorithms; then break; fi; \
	    if ! kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
	      printf "\n$(R)La app se cerró al arrancar. Últimas líneas del log:$(N)\n"; tail -n 25 $(LOG_FILE); exit 1; \
	    fi; \
	    printf "."; sleep 1; \
	  done; \
	  curl -fs -o /dev/null $(APP_URL)/api/algorithms || { printf "\n$(R)No respondió en 90 s. Revisá: make logs$(N)\n"; exit 1; }; \
	  printf " $(G)lista$(N)\n"; \
	fi
	@$(MAKE) --no-print-directory info

down: ## Apaga la app y la base (los datos de la base se conservan)
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
	  kill $$(cat $(PID_FILE)) && printf "App detenida.\n"; \
	else \
	  printf "$(D)La app no estaba corriendo (o se levantó con otro comando).$(N)\n"; \
	fi
	@rm -f $(PID_FILE)
	@docker compose down
	@printf "$(G)Todo apagado.$(N) Para volver: make up\n"

restart: down up ## Apaga y vuelve a levantar todo

status: ## Muestra qué está corriendo: base, app y servidor de desarrollo
	@printf "\n$(B)Estado$(N)\n"
	@health=$$(docker inspect -f '{{.State.Health.Status}}' cody-sqlserver 2>/dev/null); \
	case "$$health" in \
	  healthy)   printf "  Base de datos   $(G)lista$(N) en localhost:1433\n" ;; \
	  starting)  printf "  Base de datos   $(Y)arrancando$(N)\n" ;; \
	  unhealthy) printf "  Base de datos   $(R)con problemas$(N): probá make db-logs\n" ;; \
	  *)         printf "  Base de datos   $(D)apagada$(N)\n" ;; \
	esac
	@curl -fs -o /dev/null $(APP_URL)/api/algorithms \
	  && printf "  App             $(G)corriendo$(N) en $(APP_URL)\n" \
	  || printf "  App             $(D)apagada$(N)\n"
	@curl -fs -o /dev/null $(VITE_URL) \
	  && printf "  Vite (dev)      $(G)corriendo$(N) en $(VITE_URL)\n" \
	  || printf "  Vite (dev)      $(D)apagado$(N)\n"
	@printf "\n"

# Reads the passwords from .env so the summary always matches what is configured
info: ## Muestra URLs, credenciales de la base y comandos útiles
	@set -a; source .env; set +a; \
	printf "\n$(B)$(G)● Cody está corriendo$(N)\n\n"; \
	printf "  $(B)App$(N)            $(C)$(APP_URL)$(N)\n"; \
	printf "  $(B)Swagger (API)$(N)  $(C)$(APP_URL)/swagger-ui.html$(N)\n"; \
	printf "  $(B)OpenAPI JSON$(N)   $(C)$(APP_URL)/v3/api-docs$(N)\n\n"; \
	printf "  $(B)Base de datos$(N)  SQL Server en Docker (contenedor cody-sqlserver)\n"; \
	printf "    Servidor     localhost,1433\n"; \
	printf "    Base         cody\n"; \
	printf "    Usuario app  cody_app  /  $$DB_PASSWORD\n"; \
	printf "    Admin        sa        /  $$SA_PASSWORD\n"; \
	printf "    JDBC         jdbc:sqlserver://localhost:1433;databaseName=cody;encrypt=true;trustServerCertificate=true\n"; \
	printf "    $(D)En SSMS o VS Code (mssql) marcá \"Trust server certificate\". Las claves salen de .env.$(N)\n\n"; \
	printf "  $(D)make logs$(N) ver logs · $(D)make sql$(N) consola SQL · $(D)make status$(N) estado · $(D)make down$(N) apagar\n\n"

logs: ## Sigue los logs de la app levantada con make up (Ctrl+C para salir)
	@test -f $(LOG_FILE) || { printf "Todavía no hay logs. Levantá la app con: make up\n"; exit 1; }
	@tail -n 50 -f $(LOG_FILE)

# Checks the tools before starting, with a hint on how to fix each problem
doctor: ## Revisa que estén Docker y Java 21 (y te dice cómo arreglarlo si no)
	@ok=1; \
	if ! command -v docker >/dev/null; then \
	  printf "$(R)✗ Docker no está instalado.$(N) Instalá Docker Desktop: https://docs.docker.com/get-docker/\n"; ok=0; \
	elif ! docker info >/dev/null 2>&1; then \
	  printf "$(R)✗ Docker está instalado pero apagado.$(N) Abrí Docker Desktop y esperá a que diga \"running\".\n"; ok=0; \
	fi; \
	if ! command -v java >/dev/null; then \
	  printf "$(R)✗ Java no está instalado.$(N) Instalá Java 21 (por ejemplo, Eclipse Temurin 21).\n"; ok=0; \
	else \
	  version=$$(java -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -1); \
	  if [ "$${version:-0}" -lt 21 ]; then \
	    printf "$(R)✗ Tenés Java $$version y el proyecto usa Java 21.$(N)\n"; ok=0; \
	  fi; \
	fi; \
	[ $$ok -eq 1 ] && printf "$(G)✓$(N) Docker y Java 21 listos\n" || exit 1

##@ Desarrollo (para programar)

# Spring Boot fails with a cryptic error if :8080 is taken; say it plainly instead
port-free:
	@if curl -fs -o /dev/null $(APP_URL)/api/algorithms; then \
	  printf "$(Y)La app ya está corriendo en $(APP_URL) (la levantaste con make up).$(N)\n"; \
	  printf "Para programar, primero apagala: $(C)make down$(N)\n"; exit 1; \
	fi

dev: doctor env db port-free ## Base + backend + frontend con recarga en vivo (Ctrl+C corta todo)
	@printf "\n$(B)Modo desarrollo$(N): abrí $(C)$(VITE_URL)$(N) (el frontend se recarga solo al guardar)\n"
	@printf "$(D)Backend en $(APP_URL) · Swagger en $(APP_URL)/swagger-ui.html · Ctrl+C para cortar$(N)\n\n"
	@trap 'kill 0' EXIT; \
	$(MVN) -q spring-boot:run $(SKIP_FRONT) & \
	(cd frontend && yarn dev) & \
	wait

backend: env db port-free ## Solo el backend en :8080 (sin recompilar el frontend)
	$(MVN) spring-boot:run $(SKIP_FRONT)

frontend: ## Solo el frontend (Vite) en :5173, con proxy de /api a :8080
	cd frontend && yarn dev

install: ## Instala las dependencias del frontend (yarn)
	cd frontend && yarn install

##@ Base de datos

env: ## Crea el archivo .env (contraseñas) a partir de .env.example, si no existe
	@test -f .env || { cp .env.example .env && printf "$(Y).env creado$(N) con contraseñas de ejemplo (cambialas si querés).\n"; }

db: env ## Levanta SQL Server en Docker y crea la base "cody" y el usuario "cody_app"
	@docker compose up -d --wait sqlserver
	@docker compose run --rm sqlserver-init > /dev/null
	@printf "$(G)✓$(N) Base de datos lista en localhost:1433\n"

db-down: ## Apaga solo la base (los datos se conservan)
	docker compose down

db-reset: ## BORRA todos los datos de la base y la crea de nuevo (pide confirmación)
	@read -p "Esto borra todos los datos de la base. ¿Seguro? [s/N] " answer; [ "$$answer" = "s" ] || exit 1
	docker compose down -v
	@$(MAKE) --no-print-directory db

db-logs: ## Sigue los logs de SQL Server
	docker compose logs -f sqlserver

sql: ## Abre una consola SQL (sqlcmd) sobre la base "cody"
	@set -a; source .env; set +a; \
	docker exec -it cody-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U cody_app -P "$$DB_PASSWORD" -C -d cody

##@ Calidad y entrega

# verify also packages target/cody.jar, but without rebuilding the frontend (SKIP_FRONT): that jar
# would carry an old frontend, so it is deleted and the next build/up makes a complete one
test: env db ## Corre todos los tests y genera el reporte de cobertura (JaCoCo)
	$(MVN) verify $(SKIP_FRONT)
	@rm -f $(JAR)
	@printf "\nReporte de cobertura: $(C)target/site/jacoco/index.html$(N)\n"

# The jar depends on the sources: make rebuilds it only when something changed.
# Maven stamps the jar with a fixed 1980 date (reproducible builds), so `touch` gives it the real
# build time; otherwise make would think it is always older than the code.
$(JAR): pom.xml $(shell find src frontend/src -type f 2>/dev/null) frontend/package.json frontend/index.html
	@printf "Compilando la app (backend + frontend). La primera vez tarda porque descarga dependencias...\n"
	$(MVN) -q clean package -DskipTests
	@touch $(JAR)
	@printf "$(G)✓$(N) $(JAR) listo\n"

build: $(JAR) ## Compila backend + frontend en un único .jar (solo si cambió el código)

rebuild: ## Fuerza una compilación completa desde cero
	$(MVN) -q clean package -DskipTests
	@touch $(JAR)

clean: ## Borra lo compilado (target/ y frontend/dist/)
	$(MVN) -q clean
	rm -rf frontend/dist

zip: ## Arma el ZIP de entrega: make zip SHIFT=TN TEAM=MiEquipo
	@test "$(SHIFT)" != "SHIFT" -a "$(TEAM)" != "TEAM" || { printf "Falta indicar turno y equipo: make zip SHIFT=<turno> TEAM=<equipo>\n"; exit 1; }
	git archive --format=zip --prefix=cody/ -o $(ZIP) HEAD
	@printf "$(G)✓$(N) $(ZIP) creado (solo lo commiteado: sin .env, target ni node_modules)\n"

