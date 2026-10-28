package ar.edu.unsam.cody.engine.graph;

import ar.edu.unsam.cody.engine.AbstractTraceableAlgorithm;
import ar.edu.unsam.cody.engine.ElementState;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.GraphInput.Edge;
import ar.edu.unsam.cody.engine.GraphInput.Node;
import ar.edu.unsam.cody.engine.JavaListing;
import ar.edu.unsam.cody.engine.StepType;
import ar.edu.unsam.cody.engine.Trace;
import ar.edu.unsam.cody.engine.TraceRecorder;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Breadth-first search from a start node.
 *
 * <p>Neighbors are explored in the order their nodes appear in {@link GraphInput#nodes()}, which
 * keeps the trace deterministic and lets the scenario author control it. The value of each node
 * is its level (number of edges from the start).
 *
 * <p>Before each dequeue with two or more nodes waiting, the user is asked which node leaves the
 * queue. The question goes on the previous step so the state shown does not reveal the answer,
 * and explanations never list the queue in order. Options are kept sorted here (traces must be
 * deterministic); the API shows them in a random order per session.
 *
 * <p>Complexity: O(V + E) time and O(V) extra space, with V nodes and E edges.
 */
public final class Bfs extends AbstractTraceableAlgorithm<GraphInput> {

    /** Code of the algorithm in the catalog. */
    public static final String CODE = "BFS";

    /** Pseudocode shown to the user; {@code Step.codeLine} points into it (starting at 1). */
    public static final List<String> PSEUDOCODE = List.of(
            "BFS(grafo, inicio):",
            "  cola ← [inicio]",
            "  marcar inicio como descubierto",
            "  mientras la cola tenga nodos:",
            "    actual ← sacar el primero de la cola",
            "    para cada vecino de actual:",
            "      si vecino no fue descubierto:",
            "        marcar vecino como descubierto",
            "        agregar vecino al final de la cola",
            "    marcar actual como visitado",
            "  fin: la cola quedó vacía");

    /** The same algorithm in plain Java, without tracing (Google style, 2-space indent). */
    public static final JavaListing JAVA = new JavaListing(
            List.of(
                    "List<String> bfs(Graph graph, String start) {",
                    "  Deque<String> queue = new ArrayDeque<>();",
                    "  Set<String> discovered = new HashSet<>();",
                    "  List<String> order = new ArrayList<>();",
                    "  queue.add(start);",
                    "  discovered.add(start);",
                    "  while (!queue.isEmpty()) {",
                    "    String current = queue.poll();",
                    "    for (String neighbor : graph.neighbors(current)) {",
                    "      if (!discovered.contains(neighbor)) {",
                    "        discovered.add(neighbor);",
                    "        queue.add(neighbor);",
                    "      }",
                    "    }",
                    "    order.add(current);",
                    "  }",
                    "  return order;",
                    "}"),
            // Java line for each of the 11 pseudocode lines
            List.of(1, 5, 6, 7, 8, 9, 10, 11, 12, 15, 17));

    private static final int LINE_START = 1;
    private static final int LINE_ENQUEUE_START = 2;
    private static final int LINE_DEQUEUE = 5;
    private static final int LINE_CHECK_NEIGHBOR = 7;
    private static final int LINE_ENQUEUE_NEIGHBOR = 9;
    private static final int LINE_VISIT = 10;
    private static final int LINE_FINISH = 11;

    private static final String QUESTION_PROMPT = "¿Qué nodo sale de la cola ahora?";

    public Bfs() {
        super(CODE, GraphInput.class, PSEUDOCODE, JAVA);
    }

    @Override
    public Trace run(GraphInput graph) {
        return new Run(graph).execute();
    }

    /** State of a single execution; a new one per call keeps {@link Bfs} stateless. */
    private static final class Run {

        private final GraphInput graph;
        private final Map<String, String> labels = new LinkedHashMap<>();
        private final Map<String, List<Edge>> adjacency = new LinkedHashMap<>();
        private final Map<String, ElementState> states = new LinkedHashMap<>();
        private final Map<String, Integer> levels = new LinkedHashMap<>();
        /** Step number (as the user sees it, starting at 1) in which each node entered the queue. */
        private final Map<String, Integer> enqueuedAtStep = new HashMap<>();
        private final Deque<String> queue = new ArrayDeque<>();
        private final List<String> visitOrder = new ArrayList<>();
        private final TraceRecorder recorder = new TraceRecorder(CODE);
        private String current;
        private String neighbor;

        Run(GraphInput graph) {
            this.graph = graph;
            for (Node node : graph.nodes()) {
                labels.put(node.id(), node.label());
                adjacency.put(node.id(), new ArrayList<>());
                states.put(node.id(), ElementState.DEFAULT);
            }
            buildAdjacency();
        }

        Trace execute() {
            String start = graph.startNodeId();
            record(StepType.START, LINE_START, List.of(), "Empezamos en " + label(start)
                    + ". BFS recorre el grafo por niveles: primero " + label(start)
                    + ", después sus vecinos, después los vecinos de esos, y así. Para no perder el orden usa una cola.");

            discover(start, 0);
            record(StepType.ENQUEUE, LINE_ENQUEUE_START, List.of(), label(start)
                    + " entra a la cola y queda descubierto. Es el nivel 0: está a 0 aristas del inicio.");

            while (!queue.isEmpty()) {
                askWhoLeavesTheQueue();
                int waiting = queue.size() - 1;
                current = queue.poll();
                states.put(current, ElementState.CURRENT);
                record(StepType.DEQUEUE, LINE_DEQUEUE, List.of(), switch (waiting) {
                    case 0 -> label(current) + " sale de la cola: era el único que estaba esperando.";
                    case 1 -> label(current) + " sale de la cola: entró antes que el otro nodo que espera, y la cola es FIFO.";
                    default -> label(current) + " sale de la cola: entró antes que los otros " + waiting
                            + " que esperan, y la cola es FIFO.";
                });

                for (Edge edge : adjacency.get(current)) {
                    neighbor = other(edge, current);
                    if (states.get(neighbor) == ElementState.DEFAULT) {
                        discover(neighbor, levels.get(current) + 1);
                        record(StepType.ENQUEUE, LINE_ENQUEUE_NEIGHBOR, List.of(edgeId(edge)),
                                label(neighbor) + " es vecino de " + label(current)
                                        + " y nadie lo había descubierto: lo marcamos y entra al final de la cola. Nivel "
                                        + levels.get(neighbor) + ", uno más que " + label(current) + ".");
                    } else {
                        record(StepType.SKIP, LINE_CHECK_NEIGHBOR, List.of(), label(neighbor)
                                + " también es vecino de " + label(current)
                                + ", pero ya estaba descubierto: no vuelve a entrar a la cola. Así ningún nodo se visita dos veces.");
                    }
                }
                neighbor = null;

                states.put(current, ElementState.VISITED);
                visitOrder.add(current);
                record(StepType.VISIT, LINE_VISIT, List.of(), label(current)
                        + " ya revisó a todos sus vecinos: queda visitado. " + waitingSummary());
                current = null;
            }

            record(StepType.FINISH, LINE_FINISH, List.of(), finishExplanation(start));
            return recorder.build();
        }

        private void buildAdjacency() {
            Map<String, Integer> position = new LinkedHashMap<>();
            graph.nodes().forEach(node -> position.put(node.id(), position.size()));
            for (Edge edge : graph.edges()) {
                adjacency.get(edge.from()).add(edge);
                if (!graph.directed() && !edge.from().equals(edge.to())) {
                    adjacency.get(edge.to()).add(edge);
                }
            }
            adjacency.forEach((id, edges) ->
                    edges.sort((a, b) -> Integer.compare(position.get(other(a, id)), position.get(other(b, id)))));
        }

        private void discover(String nodeId, int level) {
            queue.add(nodeId);
            states.put(nodeId, ElementState.FRONTIER);
            levels.put(nodeId, level);
            enqueuedAtStep.put(nodeId, recorder.size() + 1);
        }

        /** Asks on the step already recorded, before the dequeue reveals the answer. */
        private void askWhoLeavesTheQueue() {
            if (queue.size() < 2) {
                return;
            }
            String head = queue.peek();
            List<String> options = queue.stream().sorted().toList();
            List<String> others = queue.stream().skip(1).map(this::label).toList();
            String explanation = "Sale " + label(head) + " porque entró a la cola en el paso " + enqueuedAtStep.get(head)
                    + ", antes que " + String.join(", ", others)
                    + ". Una cola es FIFO: el primero que entra es el primero que sale.";
            Map<String, String> feedback = new LinkedHashMap<>();
            queue.stream().skip(1).forEach(id -> feedback.put(id, label(id) + " también está en la cola, pero entró después (paso "
                    + enqueuedAtStep.get(id) + "), así que todavía no es su turno."));
            recorder.askOnLastStep(QUESTION_PROMPT, options, head, explanation, feedback);
        }

        private void record(StepType type, int line, List<String> highlights, String explanation) {
            // Variable names are the pseudocode ones (user-facing); values are node ids the frontend maps to labels
            Map<String, String> variables = new LinkedHashMap<>();
            variables.put("cola", queue.toString());
            if (current != null) {
                variables.put("actual", current);
            }
            if (neighbor != null) {
                variables.put("vecino", neighbor);
            }
            recorder.record(type, line, states, levels, highlights, variables, explanation);
        }

        /** How many nodes wait, without saying in which order: that is what the next question asks. */
        private String waitingSummary() {
            return switch (queue.size()) {
                case 0 -> "La cola quedó vacía.";
                case 1 -> "Queda 1 nodo esperando en la cola.";
                default -> "Quedan " + queue.size() + " nodos esperando en la cola.";
            };
        }

        private String finishExplanation(String start) {
            List<String> unreachable = states.entrySet().stream()
                    .filter(entry -> entry.getValue() == ElementState.DEFAULT)
                    .map(entry -> label(entry.getKey()))
                    .toList();
            String summary = "La cola quedó vacía: no hay más nodos por descubrir. Orden de visita: "
                    + String.join(", ", visitOrder.stream().map(this::label).toList())
                    + ". El número de cada nodo es su nivel: la menor cantidad de aristas para llegar desde "
                    + label(start) + ".";
            return unreachable.isEmpty()
                    ? summary
                    : summary + " No se pudo llegar a " + String.join(", ", unreachable)
                            + ": no hay ningún camino desde " + label(start) + ".";
        }

        private String label(String nodeId) {
            return labels.get(nodeId);
        }

        private static String other(Edge edge, String nodeId) {
            return edge.from().equals(nodeId) ? edge.to() : edge.from();
        }

        private static String edgeId(Edge edge) {
            return edge.from() + "->" + edge.to();
        }
    }
}
