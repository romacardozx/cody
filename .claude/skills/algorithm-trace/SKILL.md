---
name: algorithm-trace
description: Usar al implementar o modificar un algoritmo del paquete engine, o al tocar TraceableAlgorithm, Trace, Step, StepType, ElementState, Question, GraphInput o ArrayInput. Define el contrato de la traza y cómo testearla.
---

# Contrato de la traza (paquete `ar.edu.unsam.cody.engine`)

- Implementar `TraceableAlgorithm<GraphInput>` o `TraceableAlgorithm<ArrayInput>`; sin Spring, JPA ni Lombok (lo verifica `EngineIsolationTest`).
- Métodos: `code()` (el del catálogo), `inputType()` (`GraphInput.class` / `ArrayInput.class`), `pseudocode()` (en español; `codeLine` apunta a estas líneas, por eso viven en la clase y no en la base), `javaListing()` (el mismo algoritmo en Java limpio, identificadores en inglés, con la línea de Java para cada línea de pseudocódigo) y `run(input)`.
- Armar la traza con `TraceRecorder`: `record(...)` por paso y `askOnLastStep(...)` para preguntar en el paso ANTERIOR al que revela la respuesta.
- Registrar el algoritmo con un `@Bean` en `config/EngineConfig`; `AlgorithmRegistry` lo encuentra solo.
- Recibe un `GraphInput` / `ArrayInput` (records del engine), nunca la entidad `Scenario`. El service convierte.
- Devuelve un `Trace`; su constructor valida los invariantes, así que una traza mal armada falla en el test del algoritmo.
- Cada `Step` es una foto COMPLETA: `elementStates` tiene TODOS los elementos en TODOS los pasos.
- `index` empieza en 0 y coincide con la posición; `codeLine` apunta al pseudocódigo de la entidad Algorithm (base 1).
- Ids estables: nodos por su `id`; elementos de arreglo `e0, e1, ...` por posición inicial (`ArrayInput.elementIds()`), nunca por valor.
- Determinista: misma entrada → misma traza (el server puede regenerarla en vez de guardarla).
- `Question` lleva `correctAnswer`, `explanation` (por qué es esa) y `optionFeedback` (por qué cada opción incorrecta no lo es). Nada de eso viaja antes de responder: el DTO no lo tiene y se valida con `Question.isCorrect`.
- Las explicaciones tienen que **enseñar** (el porqué, no solo el qué) y **nunca revelar la respuesta** antes de la pregunta: por ejemplo, no listar la cola en orden en el paso que pregunta.
- Si un paso no cambia nada pero enseña algo (un vecino ya descubierto), registrarlo igual (`StepType.SKIP`).
- Al cliente se le mandan los pasos con `Trace.stepsUntilNextQuestion(from)`: nunca pasos posteriores a una pregunta sin responder.
- Código y nombres en inglés; `explanation` y `Question.prompt` en español (los ve el usuario).
- Los nombres de `variables` son los del pseudocódigo y tienen que entenderse solos (`cola`, `actual`, `vecino`; nada de `u`, `v`). El frontend muestra al lado qué significa cada una (`VariablesPanel`).

# Puntos de pregunta por algoritmo
- Bubble sort (`BUBBLE_SORT`): ¿se intercambian estos dos? (opciones: "Sí" / "No")
- Binary search (`BINARY_SEARCH`): ¿izquierda o derecha?
- BFS (`BFS`): ¿qué nodo sale de la cola? (opciones: nodos de la frontera)
- Dijkstra (`DIJKSTRA`): ¿qué nodo de la frontera se visita? (opciones: nodos de la frontera)

# Cómo testear (TDD)
1. Test del resultado final (orden, camino, distancias).
2. Test de la forma de la traza: primer paso `START`, último `FINISH`, cantidad de preguntas, respuestas correctas.
3. Test de un caso borde (empates, grafo desconectado, arreglo de 1 elemento).

# Agregar un algoritmo nuevo
Clase en `engine/graph/` o `engine/array/`, test en `src/test/java/.../engine/<familia>/`, fila del catálogo en data.sql (INSERT idempotente) y un test de que `codeLine` cae dentro del pseudocódigo.
