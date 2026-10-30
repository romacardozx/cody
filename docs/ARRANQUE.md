# Cody — Guía de arranque del proyecto

> TP Integrador · Programación III (Programación Avanzada) · ECyT-UNSAM · Q2 2026
> Entrega: **11/11/2026** · Revisión: **28/10/2026**

---

## 1. Qué estamos construyendo

**Pitch:** un visualizador de algoritmos donde el alumno no mira: **predice**. En los momentos clave la animación se frena y pregunta "¿qué pasa ahora?". Si acierta sigue; si falla, el sistema le explica por qué.

**Frase para la exposición:** *"Coddy te muestra el algoritmo; nosotros te hacemos pensarlo."*

**Cómo funciona:**

1. Los algoritmos corren **de verdad en Java** y generan una **traza**: lista de pasos, cada uno con una foto completa del estado.
2. El frontend (React) es un **reproductor genérico**: anima la traza y resalta la línea de código activa.
3. Las **preguntas se generan solas** desde la traza (por ejemplo, en Dijkstra: "¿qué nodo se visita ahora?", con los nodos de la frontera como opciones).
4. La respuesta **se valida en el servidor**: el cliente nunca recibe la respuesta correcta por adelantado.

**Alcance v1 (4 algoritmos, 2 renderizadores):**

| Algoritmo | Visualización |
|---|---|
| Ordenamiento burbuja | Arreglo |
| Búsqueda binaria | Arreglo |
| BFS | Grafo |
| Dijkstra | Grafo |

**Encuadre DUA (para la propuesta):**

| Principio | En el sistema |
|---|---|
| Representación | El mismo paso como animación, código resaltado, tabla de estado y explicación en palabras; velocidad regulable |
| Acción y expresión | Predecir con clic en el nodo o eligiendo opción; navegación por teclado |
| Compromiso | Escenarios propios, rachas, modo examen |

**Extras para el 30% de creatividad:** modo adaptativo (pregunta más donde más fallás), modo examen, cazador de bugs (detectar en qué paso una versión rota se desvía), estadísticas personales.

---

## 2. Requisitos del TP (según el enunciado)

> Fuente: *Trabajo Práctico Integrador — Lineamientos de entrega y evaluación*, v1.0.0, Programación III, ECyT-UNSAM. La columna "En Cody" dice cómo lo cubrimos.

### 2.1 Resumen rápido

- **Nombre del ZIP:** `P3-Q2-2026-<turno>-<equipo>-Cody`
- **Java 21** obligatorio. **Maven** para dependencias y build. **PostgreSQL** (la consigna sugiere SQL Server; se cambió para poder deployar gratis, ver sección 6).
- La demo se hace **desde VS Code**, en vivo, los tres presentes (máx. 15 min, tiempo parejo).
- **Revisión:** 28/10/2026 · **Entrega:** 11/11/2026 (fuera de fecha no se acepta).
- **Pesos de la nota:** Creatividad 30% · Funcionalidad 20% · Calidad de código 20% · Exposición 20% · UI 10%.
- **Nota individual**, en una instancia evaluatoria posterior a la exposición.

### 2.2 Objetivos (punto 1)

| Objetivo | En Cody |
|---|---|
| Aplicar fundamentos de programación backend en Java | Spring Boot + motor de algoritmos en Java puro |
| Variables, estructuras de control, estructuras de datos y POO | Interfaz `TraceableAlgorithm` + implementaciones (polimorfismo); grafos, colas, arreglos, mapas en el `engine` |
| Pensamiento crítico para resolver problemas | Los algoritmos y la generación de preguntas |
| Equipos de 3: compartir código, explicar soluciones, cumplir plazos | Repo compartido, reparto (sección 13), hitos (sección 14) |

### 2.3 Temática (punto 2)

| Exigencia | En Cody |
|---|---|
| Vinculado al **DUA** y la **Educación Asistida** | Encuadre DUA de la sección 1 |
| Problemática educativa **concreta y acotada** | Aprender algoritmos mirando no alcanza: hay que razonarlos. Cody obliga a predecir |
| Contemplar **distintas necesidades y formas de acceso** | Animación + código + tabla de estado + explicación en palabras; velocidad regulable; teclado |
| Alcance que se pueda planificar, desarrollar y **demostrar** en el período | 4 algoritmos, 2 renderizadores |

### 2.4 Requisitos del proyecto (punto 3)

| # | Requisito | En Cody |
|---|---|---|
| 3.1 | **ABML** (alta, baja, modificación, listar) con buenas prácticas, comentarios y **especificando el desempeño** | ABML de Escenario y Algoritmo; desempeño = complejidad de cada algoritmo en el Javadoc (**confirmar con el profe**) |
| 3.2 | **Interfaz simple con menú de opciones** | Menú principal en React: algoritmos, mis escenarios, estadísticas |
| 3.3 | Arquitectura empresarial en **paquetes y clases**, separación de responsabilidades, **visibilidad** y **encapsulamiento** | Paquetes por capa (sección 7); atributos `private`, records inmutables |
| 3.3 | **Inyección de dependencias / IoC**, configuración de componentes, organización en capas | Servicios y repositorios inyectados por constructor |
| 3.3 | Spring MVC (**Controllers, Model, Views** cuando corresponda) | Controllers REST; las vistas son React (**confirmar con el profe**) |
| 3.3 | Acceso a datos con **JPA/Hibernate** y consultas | Repositorios JPA + consultas derivadas para estadísticas |
| 3.3 | API REST: **recursos, endpoints, DTO, ResponseEntity, validaciones** | Endpoints de la sección 9; DTOs; nunca exponer entidades |
| 3.3 | Opcional: **Swagger/OpenAPI** y pruebas con **Postman** | springdoc + colección de Postman para la demo |
| 3.3 | **Validación, manejo de errores y pruebas automatizadas** (Spring Boot Test, MockMvc, JaCoCo) | `@Valid`, `@ControllerAdvice`, tests del engine + MockMvc + JaCoCo |
| 3.4 | **Validaciones funcionales** (no de tipo de dato) para evitar excepciones | Lista de la sección 9 |
| 3.5 | **Código comentado** explicando procedimientos y módulos | Javadoc en servicios y algoritmos |

### 2.5 Especificaciones técnicas (punto 4)

| Especificación | En Cody |
|---|---|
| Java compatible con la versión de Spring Boot | Java 21 |
| **Spring Boot** como framework principal | ✔ |
| Laboratorio en **VS Code** | Demo desde VS Code |
| Arquitectura **en capas**: presentación/controladores, negocio, datos | controller / service / repository (+ engine) |
| **Maven** para dependencias, configuración y build | Maven + `frontend-maven-plugin` |
| Persistencia: **JPA/Hibernate + SQL Server + SSMS** ("se podrá utilizar") | JPA/Hibernate ✔ · motor PostgreSQL para poder deployar gratis (ver sección 6) |
| Pruebas de endpoints: **Postman**; automatizadas: **Spring Boot Test + JUnit 5** | ✔ |
| Pruebas de controladores: **MockMvc + JUnit 5** | ✔ |
| Documentación de la API: **Swagger/OpenAPI** | springdoc |
| **Exposición**: ejecución, funcionamiento e interacción con la base y los servicios | Guion: crear escenario → recorrerlo prediciendo → mostrar datos en DBeaver (o `make sql`) → endpoint en Swagger/Postman |

### 2.6 Entrega (punto 5)

- Exportado en **.zip** con el **código fuente** (documentación opcional).
- **Debe compilar y funcionar** correctamente.
- **No se aceptan** proyectos: incompletos · con fallos de funcionamiento o de lógica · **desarrollados en otras tecnologías** · con comportamientos inesperados · entregados fuera de fecha.

> ⚠️ "Otras tecnologías": el backend es 100% Java/Spring Boot, pero **confirmar en la revisión que el frontend en React está aceptado**.

### 2.7 Consignas (punto 6)

- Cada equipo propone uno o más proyectos de la categoría asignada y elige uno.
- La propuesta debe ser **aprobada por el docente antes de empezar a desarrollar**.
- Puede rechazarse si: no se ajusta a la categoría · no cumple los requisitos · **es equivalente a la de otro equipo** (→ presentarla cuanto antes).
- Una vez aprobada: planificar, diseñar, codificar, ejecutar y probar.
- **Definir y cargar la información de cada escenario** para mejorar la experiencia de usuario → `data.sql` con escenarios precargados.

### 2.8 Evaluación (punto 7)

- **Quien no se presente el día de la exposición queda descalificado** y no puede aprobar ni promocionar. Lo mismo para la evaluación individual.
- Criterios:

| Criterio | Peso | Qué miran |
|---|---|---|
| Funcionalidad | 20% | Cumple todos los requisitos |
| Calidad del código | 20% | Estructura, comentarios, buenas prácticas |
| Interfaz de usuario | 10% | Intuitiva y fácil de usar |
| Creatividad y funcionalidades adicionales | **30%** | Funcionalidades no requeridas |
| Exposición oral | 20% | **Máx. 15 min**, tiempo **equitativo**, **todos exponen** |

### 2.9 Fechas (puntos 8 y 9)

- **Revisión** (inspección y corrección): **28/10/2026**
- **Entrega final:** **11/11/2026**

### 2.10 Lineamientos (punto 10)

- Nombre del ZIP: `P3-<cuatrimestre>-<año>-<turno>-<equipo>-<nombre de proyecto>` (ejemplo del enunciado: `P3-Q2-2026-TN-Softech-SIGVeterinaria`).
- Entregar en el **campus virtual**, en la práctica designada.
- Si no se entrega o **se sube otro documento por error, se anula sin excepción** → verificar la entrega después de subirla.
- **Java 21** en el proyecto.

### 2.11 Condiciones de aprobación (punto 11)

Se desaprueba si:

- [ ] a. **No compila.**
- [ ] b. No se identifican los **atributos necesarios** para resolver lo pedido.
- [ ] c. **Tipos de datos inadecuados** o no cumple las condiciones mínimas del enunciado (→ enums para estados, `LocalDateTime` para fechas, tipos numéricos correctos para pesos y distancias).
- [ ] d. **Entrega vacía** o se envía otro documento por error.
- [ ] e. El equipo **no está registrado** en la planilla, no tiene nombre o no eligió proyecto.

## 3. Stack

| Capa | Tecnología |
|---|---|
| Lenguaje | Java 21 |
| Backend | Spring Boot (Web, Data JPA, Validation) |
| Base de datos | PostgreSQL (Docker en local; Neon o Supabase en producción) |
| Build | Maven (con `frontend-maven-plugin` para empaquetar el React) |
| API docs | springdoc-openapi (Swagger UI) |
| Tests | JUnit 5, Spring Boot Test, MockMvc, JaCoCo |
| Frontend | React + Vite |
| Animación | Motion (`motion/react`) |
| Código resaltado | Resaltador propio de ~20 líneas (`lib/highlight.js`): pseudocódigo y Java sin cargar una librería |

> **Versión de Spring Boot:** usar la estable que ofrezca start.spring.io con Java 21. Si es 4.x, verificar que la versión de springdoc sea la compatible con esa línea (springdoc tiene líneas distintas para Boot 3 y Boot 4).

---

## 4. Requisitos en cada máquina

- [ ] **JDK 21** (Temurin recomendado) → `java -version`
- [ ] **Maven 3.9+** (o usar el wrapper `./mvnw`) → `mvn -v`
- [ ] **Node LTS** (solo para desarrollo del frontend) → `node -v`
- [ ] **Docker** (PostgreSQL corre en un contenedor, ver sección 6) + **DBeaver**, **pgAdmin** o la extensión **PostgreSQL** de VS Code para administrarlo
- [ ] **VS Code** con: Extension Pack for Java, Spring Boot Extension Pack, ESLint
- [ ] **Git** + acceso al repo del equipo
- [ ] **Claude Code** instalado
- [ ] **Python 3.10+** (requisito de graphify)

---

## 5. Crear el proyecto

### 5.1 Backend

En **start.spring.io**:

- Project: Maven · Language: Java · Java: **21**
- Group: `ar.edu.unsam` · Artifact: `cody`
- Dependencias: **Spring Web**, **Spring Data JPA**, **PostgreSQL Driver**, **Validation**, **Spring Boot DevTools**

Agregar a mano en el `pom.xml`: `springdoc-openapi-starter-webmvc-ui` y el plugin de **JaCoCo**.

### 5.2 Frontend

Dentro del repo, al lado del `pom.xml`:

```bash
yarn create vite frontend --template react
cd frontend
yarn add motion prism-react-renderer
```

`frontend/vite.config.js` (proxy a Spring Boot en desarrollo):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8080" } },
});
```

### 5.3 Empaquetar todo en un solo `.jar`

En el `pom.xml`, `frontend-maven-plugin` instala Node y Yarn, corre `yarn install` y `yarn build`; después se copia `frontend/dist` a `target/classes/static`:

```xml
<plugin>
  <groupId>com.github.eirslett</groupId>
  <artifactId>frontend-maven-plugin</artifactId>
  <version><!-- última versión en Maven Central --></version>
  <configuration>
    <workingDirectory>frontend</workingDirectory>
    <nodeVersion><!-- misma LTS que usan en desarrollo, ej. v22.x.x --></nodeVersion>
  </configuration>
  <executions>
    <execution><id>install-node</id><goals><goal>install-node-and-npm</goal></goals></execution>
    <execution><id>npm-install</id><goals><goal>npm</goal></goals><configuration><arguments>install</arguments></configuration></execution>
    <execution><id>npm-build</id><goals><goal>npm</goal></goals><configuration><arguments>run build</arguments></configuration></execution>
  </executions>
</plugin>

<plugin>
  <artifactId>maven-resources-plugin</artifactId>
  <executions>
    <execution>
      <id>copy-frontend</id>
      <phase>process-resources</phase>
      <goals><goal>copy-resources</goal></goals>
      <configuration>
        <outputDirectory>${project.build.outputDirectory}/static</outputDirectory>
        <resources><resource><directory>frontend/dist</directory></resource></resources>
      </configuration>
    </execution>
  </executions>
</plugin>
```

**Cómo se trabaja:**

| Momento | Comando |
|---|---|
| Levantar todo (demo) | `make up` → base + `target/cody.jar` en `localhost:8080`, muestra URLs y credenciales. `make down` apaga |
| Desarrollo | `make dev` → backend en `localhost:8080` + Vite en `localhost:5173` (proxy a 8080, recarga en vivo) |
| Solo backend / solo frontend | `make backend` / `make frontend` |
| Ver todos los comandos | `make` |

---

## 6. Base de datos

### PostgreSQL en Docker

```bash
cp .env.example .env        # y cambiar la contraseña
docker compose up -d        # levanta PostgreSQL 17; la primera vez crea la base cody y el usuario cody_app
```

- `compose.yaml` tiene un solo servicio, `postgres`, con volumen persistente. La imagen crea la base y el usuario sola (variables `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`): no hace falta script de inicio.
- Spring Boot lee el mismo `.env` (`spring.config.import=optional:file:.env[.properties]`), así que no hace falta exportar nada.
- Conectarse desde DBeaver, pgAdmin o VS Code: `localhost:5432`, base `cody`, usuario `cody_app`. O `make sql` para una consola `psql`.
- Borrar todo y empezar de cero: `make db-reset` (o `docker compose down -v`).
- **Por qué PostgreSQL y no SQL Server:** ningún servicio gratuito sin tarjeta ofrece SQL Server, y PostgreSQL sí (Neon, Supabase). Así el mismo motor corre en local y en producción.

### Producción (Vercel)

`Dockerfile.vercel` arma la imagen (backend + React en un jar) y Vercel la detecta sola. La base va afuera, en un PostgreSQL gratuito (Neon o Supabase). En el proyecto de Vercel se cargan:

| Variable | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>:5432/<base>?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | usuario de la base |
| `DB_PASSWORD` | su contraseña |

Las tablas y los datos de ejemplo los crea la app al arrancar, igual que en local.

### `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cody
spring.datasource.username=cody_app
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true
```

La contraseña sale del `.env` (`DB_PASSWORD`), que **nunca** se commitea.

**Datos de ejemplo** (punto 6 del enunciado: "definir la información de cada escenario"): `src/main/resources/data.sql` con los 4 algoritmos y 3 o 4 escenarios precargados para que la demo arranque con contenido.

**`data.sql` tiene que ser idempotente.** Con `ddl-auto=update` + `spring.sql.init.mode=always`, el script corre en **cada** arranque: un `INSERT` común duplica filas o rompe por clave única. Reglas:

1. Cada `INSERT` va protegido: `INSERT INTO tabla (...) SELECT ... WHERE NOT EXISTS (SELECT 1 FROM tabla WHERE codigo = 'X');`. Solo para tablas que ya existan como entidad: PostgreSQL rechaza la sentencia si falta una tabla, aunque no fuera a insertar nada.
2. Buscar por **clave natural** (`codigo`, `nombre`), nunca por el id autogenerado.
3. No insertar ids a mano (PostgreSQL usa `IDENTITY`; un id forzado deja atrás la secuencia y el próximo `INSERT` de la app choca).
4. Una sentencia por bloque terminada en `;`: Spring separa el script por `;`, así que nada de bloques `DO` o funciones con varias sentencias.

---

## 7. Estructura del repo

```
cody/
├── CLAUDE.md                               ← único .md del proyecto en la raíz (lo lee Claude Code)
├── PRODUCT.md                              ← contexto del producto (lo genera Impeccable; va en la raíz porque ahí lo busca)
├── DESIGN.md                               ← sistema visual (lo genera Impeccable; ídem)
├── Makefile                                ← atajos: make help
├── compose.yaml                            ← PostgreSQL en Docker
├── .env.example                            ← copiar a .env
├── docs/
│   ├── README.md
│   ├── ARRANQUE.md
│   └── lineamientos_y_pautas_para_el_tpi_unsam.md
├── pom.xml
├── .claude/
│   └── skills/
│       └── algorithm-trace/SKILL.md       ← skill propia (sección 11)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Player.jsx                 ← play/pausa/avance/retroceso/velocidad
│       │   ├── GraphView.jsx              ← SVG + Motion
│       │   ├── ArrayView.jsx              ← barras con layout de Motion
│       │   ├── CodePanel.jsx              ← prism-react-renderer + línea activa
│       │   ├── VariablesPanel.jsx
│       │   └── QuestionCard.jsx
│       ├── pages/
│       └── api/
└── src/
    ├── main/java/ar/edu/unsam/cody/
    │   ├── controller/
    │   ├── service/
    │   ├── repository/
    │   ├── model/                          ← entidades JPA
    │   ├── dto/
    │   ├── exception/                      ← @ControllerAdvice
    │   ├── config/
    │   └── engine/                         ← el corazón: sin Spring, Java puro
    │       ├── TraceableAlgorithm.java     ← interfaz
    │       ├── Trace, Step, StepType, ElementState, Question
    │       ├── AlgorithmInput, GraphInput, ArrayInput
    │       ├── graph/  (Bfs.java, Dijkstra.java)
    │       └── array/  (BubbleSort.java, BinarySearch.java)
    └── test/java/ar/edu/unsam/cody/
        ├── engine/                         ← tests unitarios del contrato y de cada algoritmo
        └── controller/                     ← MockMvc
```

**Regla clave:** el paquete `engine` no depende de Spring, JPA ni Lombok (lo verifica `EngineIsolationTest`). Se testea con JUnit puro, rápido y sin base de datos.

**Idioma:** todo el código, la base y la API van en inglés. En español solo lo que ve el usuario: textos de la UI, preguntas, explicaciones y mensajes de error.

---

## 8. El contrato de la traza

Todo depende de esto. Se define **primero** y no se cambia sin acordarlo entre los tres. Código real en `src/main/java/ar/edu/unsam/cody/engine/`.

```java
public interface TraceableAlgorithm<I extends AlgorithmInput> {
    String code();          // "DIJKSTRA"
    Class<I> inputType();   // GraphInput.class o ArrayInput.class
    List<String> pseudocode(); // líneas a las que apunta Step.codeLine
    JavaListing javaListing(); // el algoritmo en Java + línea de Java por cada línea de pseudocódigo
    Trace run(I input);     // traza completa
}

// Entrada propia del engine: el service convierte la entidad Scenario en uno de estos
public sealed interface AlgorithmInput permits GraphInput, ArrayInput {}
public record GraphInput(List<Node> nodes, List<Edge> edges, String startNodeId, boolean directed) {}
public record ArrayInput(List<Integer> values, Integer target) {}   // target: solo búsqueda binaria

public record Trace(String algorithmCode, List<Step> steps) {
    List<Step> stepsUntilNextQuestion(int fromIndex);  // lo que se le manda al cliente
    Optional<Step> findQuestionStep(String questionId);
}

public record Step(
    int index,                                // posición en la traza, desde 0
    StepType type,                            // START, DEQUEUE, VISIT, RELAX, COMPARE, SWAP, ...
    int codeLine,                             // línea del pseudocódigo a resaltar, desde 1
    Map<String, ElementState> elementStates,  // foto COMPLETA: DEFAULT, FRONTIER, CURRENT, VISITED, ...
    Map<String, Integer> values,              // distancias, contenido del arreglo, etc.
    List<String> highlights,                  // aristas o elementos destacados
    Map<String, String> variables,            // para el panel: u = B, dist[C] = 3
    String explanation,                       // en español
    Question question                         // null si en este paso no se pregunta
) {}

public record Question(String id, String prompt, List<String> options, String correctAnswer,
                       String explanation, Map<String, String> optionFeedback) {
    boolean isCorrect(String answer);
}
// correctAnswer, explanation y optionFeedback quedan en el servidor hasta que el alumno responde.
```

**Decisiones tomadas** (corrigen problemas del borrador original):

- La interfaz se llama `TraceableAlgorithm` para no chocar con la entidad JPA `Algorithm`.
- El engine recibe `GraphInput` / `ArrayInput`, no la entidad: así sigue siendo Java puro.
- La respuesta correcta vive en `Question.correctAnswer` y se filtra en el DTO.
- Los estados son un enum (`ElementState`), no `String` (punto 11.c: tipos de datos adecuados).
- Los algoritmos son **deterministas**: el servidor puede regenerar la traza de una sesión en vez de guardarla.

**Invariantes** (los valida el constructor de `Trace`):

1. Cada paso es una **foto completa**: todos los pasos describen el mismo conjunto de elementos.
2. Los elementos tienen **ids estables**: nodos por su `id`, arreglos `e0, e1, ...` por posición inicial (puede haber valores repetidos).
3. Los `index` coinciden con la posición y los ids de pregunta no se repiten.
4. El servidor envía los pasos **solo hasta la próxima pregunta** (`stepsUntilNextQuestion`); el resto llega después de responder.
5. Cada algoritmo tiene un test que verifica su resultado final **y** la forma de su traza.

---

## 9. Modelo de datos (ABML)

| Entidad (tabla) | Para qué |
|---|---|
| **Algorithm** (`algorithm`) | Catálogo (solo lectura, lo carga `data.sql`): code, name, family, description, complejidades. El pseudocódigo NO va acá: lo define cada algoritmo del engine, porque los pasos apuntan a sus líneas |
| **Scenario** (`scenario` + `scenario_node`, `scenario_edge`, `scenario_array_value`) | Grafos o arreglos que el alumno crea, edita y guarda (nodos con `x, y`). ABML completo |
| **AppUser** (`app_user`) | `User` es palabra reservada en SQL (en PostgreSQL y en SQL Server) |
| **LearningSession** (`learning_session`) | Cada recorrido de un algoritmo: alumno (id anónimo del navegador), escenario (copia del nombre, sin FK), aciertos, errores, inicio y fin. No se llama `Session` para no confundirla con la de Hibernate |
| **Prediction** (`prediction`) | Qué se preguntó, en qué paso y tipo de paso, qué respondió, la correcta, si acertó y las dos explicaciones, tal como se mostraron |
| **Mastery** (`mastery`) | Nivel del usuario por algoritmo y tipo de paso |

**Validaciones funcionales (punto 3.4)**, implementadas en `ScenarioRules` y `SessionService`: grafo de 2 a 26 nodos con ids únicos; aristas entre nodos existentes, sin lazos, sin repetidas y con peso ≥ 0; nodo inicial existente; arreglo de 1 a 30 valores; nombre de escenario único; el tipo de escenario tiene que coincidir con el algoritmo; no responder dos veces la misma pregunta; no modificar ni borrar un escenario con una sesión en curso. Pendiente: arreglo ordenado para búsqueda binaria.

### Endpoints iniciales

```
GET    /api/algorithms              GET /api/algorithms/{code}
GET    /api/scenarios?type=GRAPH    GET /api/scenarios/{id}      POST /api/scenarios
PUT    /api/scenarios/{id}      DELETE /api/scenarios/{id}
POST   /api/sessions                       { algorithmCode, scenarioId } → pasos hasta la 1ª pregunta
POST   /api/sessions/{id}/predictions      { questionId, answer } → correct, explanation, pasos siguientes
GET    /api/sessions?learnerId=…              historial del alumno (últimas 50)
GET    /api/sessions/{id}                     una sesión pasada con sus predicciones
GET    /api/users/{id}/mastery
```

---

## 10. Skills de Claude Code

> Antes de instalar cualquiera: **leer su `SKILL.md`**. Son instrucciones que el agente va a seguir.

### 10.1 Las que instalamos

| Área | Skill | Instalación |
|---|---|---|
| Spring Boot | `spring-boot-patterns` (decebals) | `npx -y skills add decebals/claude-code-java --skill spring-boot-patterns --agent claude-code` |
| Proceso y TDD | Superpowers (obra) | `/plugin install superpowers@claude-plugins-official` |
| Diseño de UI | **Impeccable** (pbakaus) | Ya en el repo (`.claude/skills/impeccable`, agentes en `.claude/agents`, hooks del detector en `.claude/settings.json`). El binario se descarga solo la primera vez. CLI opcional: `yarn global add impeccable` y `impeccable telemetry off` |
| Testing de la UI | `webapp-testing` (Anthropic) | `npx skills add anthropics/skills@webapp-testing` |
| Animación | `motion` (comunidad) | `npx -y skills add secondsky/claude-skills --skill motion --agent claude-code` |
| Algoritmos | **Skill propia** `algorithm-trace` | Ya creada (sección 11) |

**Cómo usarlas:**

- **Superpowers** marca el ritmo: brainstorming → plan → TDD (rojo, verde, refactor) → revisión. Ideal para el `engine`: cada algoritmo arranca con un test que falla.
- **spring-boot-patterns** para controllers, DTOs, servicios y repositorios.
- **Impeccable** (extiende la `frontend-design` de Anthropic con referencias de tipografía, color, espaciado, **motion**, interacción y redacción de UI, más un detector de patrones típicos de UI hecha por IA). Uso:
  - `/impeccable init` **una sola vez**, con la estética acordada entre los tres (oscura, técnica, tipo editor de código). Genera `PRODUCT.md` y `DESIGN.md`, que se commitean: así las pantallas de los tres comparten el mismo estilo.
  - `/impeccable hooks on`: revisa cada edición de UI mientras el agente trabaja. Corre como código, sin modelo, así que no consume tokens.
  - `/impeccable animate` sobre `VistaGrafo` y `VistaArreglo` (trabaja junto con la skill `motion`).
  - `/impeccable audit` y `/impeccable polish` antes del congelado del 10/11.
  - Los comandos se usan cuando hacen falta, no en cada componente: sus referencias pesan en el contexto.
- **webapp-testing** para verificar que animación, línea de código y panel de variables estén sincronizados.

**Descartadas a propósito:** `frontend-design` de Anthropic (Impeccable la incluye y la extiende; **no instalar las dos**, se superponen y compiten por activarse); `java-development-skill` (asume MyBatis-Plus, nosotros usamos JPA); Motion AI Kit (es paga, parte de Motion+); `vercel-react-best-practices` (mayormente Next.js; nosotros usamos Vite).

### 10.2 Ahorro de tokens

**caveman** (JuliusBrussee): hace que Claude responda en estilo telegráfico, sin relleno. El código, los comandos y los errores quedan intactos.

```bash
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

- Activar: `/caveman` · Desactivar: `stop caveman`
- **`/caveman-compress CLAUDE.md`**: reescribe el `CLAUDE.md` en estilo comprimido y conserva el original legible. **Es la parte que más rinde**, porque el `CLAUDE.md` se lee en cada sesión.

**graphify** (safishamsi): indexa el repo en un grafo de conocimiento (el código se parsea localmente con tree-sitter, incluido Java) y Claude consulta el grafo en vez de releer archivos.

```bash
# Instalar la CLI según el README de safishamsi/graphify (Python 3.10+), luego:
graphify install            # registra /graphify en Claude Code
```

```
/graphify .                 # primera construcción (cuesta tokens una vez)
/graphify . --update        # re-extrae solo lo que cambió
graphify hook install       # reconstruye en cada commit
```

**Trade-offs honestos:**

- caveman solo comprime **lo que Claude escribe**, que es la porción chica del consumo. Mediciones independientes reportan ahorros reales mucho menores que el 75% publicitado. Lo que sí rinde es `caveman-compress` sobre el `CLAUDE.md`.
- **No usar caveman cuando estén aprendiendo algo.** La nota es individual y hay defensa oral: si Claude no explica el porqué, nadie va a poder defender el código. caveman para tareas mecánicas (fixes, renombres, boilerplate); modo normal para el `engine` y las decisiones de diseño.
- graphify rinde cuando el repo crece. **Activarlo después de la revisión del 28/10**, no el primer día con 10 archivos.
- La mayor palanca de ahorro no es ninguna skill: **sesiones cortas y enfocadas**, una tarea por sesión, y un `CLAUDE.md` chico.

---

## 11. Skill propia: `algorithm-trace`

Está en `.claude/skills/algorithm-trace/SKILL.md` (se commitea, así la usan los tres). Resume el contrato de la sección 8, los puntos de pregunta de cada algoritmo, cómo testear con TDD y dónde va cada archivo al agregar un algoritmo. Si cambia el contrato, actualizarla en el mismo commit.

---

## 12. `CLAUDE.md` del repo

Está en la raíz y es corto a propósito: se lee en cada sesión. Tiene el stack, los comandos (Makefile), la convención de idioma y las reglas del proyecto. Después se puede pasar por `/caveman-compress`.

---

## 13. Reparto inicial

Todos tocan algo del `engine`: en la defensa individual van a preguntar por los algoritmos.

| Persona | Responsable de | Además |
|---|---|---|
| **1** | Entidades, repositorios, ABML de Scenario y Algorithm, `data.sql` | BFS en el engine |
| **2** | Motor: contrato de la traza, Dijkstra, generación de preguntas, validación | Tests y JaCoCo |
| **3** | Frontend: reproductor, vistas de grafo y arreglo, código resaltado | BubbleSort y BinarySearch en el engine |

---

## 14. Hitos

| Fecha | Hito | Listo cuando |
|---|---|---|
| **Lun 26/10** | Arranque | Equipo en la planilla · propuesta enviada · confirmación escrita del uso de IA pedida · repo creado · skills instaladas · `/impeccable init` hecho y `PRODUCT.md`/`DESIGN.md` commiteados |
| **Mié 28/10** | Revisión | Proyecto Maven + SQL Server conectado · contrato de la traza · **BFS devolviendo su traza por la API** con tests · ABML de Escenario · dudas para el profe anotadas |
| **Lun 2/11** | Núcleo | Predicciones con validación y explicación · vista de grafo animada · código con línea resaltada |
| **Vie 6/11** | Completo | Los 4 algoritmos · vista de arreglo · modo adaptativo · graphify activo |
| **Lun 9/11** | Calidad | MockMvc + JaCoCo · Swagger · Javadoc · `data.sql` con escenarios lindos para la demo · `/impeccable audit` + `polish` sobre la UI |
| **Mar 10/11** | Congelado | ZIP descargado y probado **en otra máquina desde cero** · ensayo cronometrado (≈5 min cada uno) |
| **Mié 11/11** | Entrega | Subido al campus en la sección correcta, verificado |

---

## 15. Checklist de entrega

- [ ] `./mvnw clean package` compila sin errores en una máquina limpia
- [ ] Java 21 en el `pom.xml`
- [ ] ABML completo de Escenario (y Algoritmo)
- [ ] Validaciones funcionales con mensajes claros
- [ ] Manejo de errores centralizado
- [ ] Tests unitarios del motor + MockMvc de los controllers
- [ ] Reporte de JaCoCo generado
- [ ] Código comentado / Javadoc
- [ ] `data.sql` con datos de ejemplo
- [ ] Swagger accesible
- [ ] Sin contraseñas en el repo
- [ ] ZIP con el nombre `P3-Q2-2026-<turno>-<equipo>-Cody`
- [ ] Los tres pueden explicar cualquier algoritmo del motor
