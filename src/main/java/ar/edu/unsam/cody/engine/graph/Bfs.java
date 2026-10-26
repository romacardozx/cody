package ar.edu.unsam.cody.engine.graph;

import ar.edu.unsam.cody.engine.ElementState;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.GraphInput.Edge;
import ar.edu.unsam.cody.engine.GraphInput.Node;
import ar.edu.unsam.cody.engine.StepType;
import ar.edu.unsam.cody.engine.Trace;
import ar.edu.unsam.cody.engine.TraceRecorder;
import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
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
 * and the options are sorted alphabetically so their order gives nothing away.
 *
 * <p>Complexity: O(V + E) time and O(V) extra space, with V nodes and E edges.
 */
public final class Bfs implements TraceableAlgorithm<GraphInput> {

    /** Code of the algorithm in the catalog. */
    public static final String CODE = "BFS";

    /** Pseudocode shown to the user; {@code Step.codeLine} points into it (starting at 1). */
    public static final List<String> PSEUDOCODE = List.of(
            "BFS(G, s):",
            "  encolar s; marcar s como descubierto",
            "  mientras la cola no esté vacía:",
            "    u ← desencolar()",
            "    para cada vecino v de u:",
            "      si v no fue descubierto:",
            "        encolar v; marcar v como descubierto",
            "    marcar u como visitado",
            "  fin");

    private static final int LINE_START = 1;
    private static final int LINE_ENQUEUE_START = 2;
    private static final int LINE_DEQUEUE = 4;
    private static final int LINE_ENQUEUE_NEIGHBOR = 7;
    private static final int LINE_VISIT = 8;
    private static final int LINE_FINISH = 9;

    private static final String QUESTION_PROMPT = "¿Qué nodo sale de la cola ahora?";

    @Override
    public String code() {
        return CODE;
    }

    @Override
    public Class<GraphInput> inputType() {
        return GraphInput.class;
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
        private final Deque<String> queue = new ArrayDeque<>();
        private final List<String> visitOrder = new ArrayList<>();
        private final TraceRecorder recorder = new TraceRecorder(CODE);
        private String current;

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
            record(StepType.START, LINE_START, List.of(), "Empezamos BFS desde " + label(start) + ".");

            discover(start, 0);
            record(StepType.ENQUEUE, LINE_ENQUEUE_START, List.of(),
                    label(start) + " entra a la cola: es el nodo inicial, nivel 0.");

            while (!queue.isEmpty()) {
                askWhoLeavesTheQueue();
                current = queue.poll();
                states.put(current, ElementState.CURRENT);
                record(StepType.DEQUEUE, LINE_DEQUEUE, List.of(),
                        label(current) + " sale de la cola: es el que llegó primero (FIFO).");

                for (Edge edge : adjacency.get(current)) {
                    String neighbor = other(edge, current);
                    if (states.get(neighbor) == ElementState.DEFAULT) {
                        discover(neighbor, levels.get(current) + 1);
                        record(StepType.ENQUEUE, LINE_ENQUEUE_NEIGHBOR, List.of(edgeId(edge)),
                                label(neighbor) + " no estaba descubierto: entra al final de la cola con nivel "
                                        + levels.get(neighbor) + ".");
                    }
                }

                states.put(current, ElementState.VISITED);
                visitOrder.add(current);
                record(StepType.VISIT, LINE_VISIT, List.of(),
                        label(current) + " ya revisó a todos sus vecinos: queda visitado.");
                current = null;
            }

            record(StepType.FINISH, LINE_FINISH, List.of(), finishExplanation());
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
        }

        private void askWhoLeavesTheQueue() {
            if (queue.size() < 2) {
                return;
            }
            List<String> options = queue.stream().sorted().toList();
            recorder.askOnLastStep(QUESTION_PROMPT, options, queue.peek());
        }

        private void record(StepType type, int line, List<String> highlights, String explanation) {
            Map<String, String> variables = new LinkedHashMap<>();
            // Variables, options and highlights use node ids; the frontend maps them to labels
            variables.put("cola", queue.toString());
            if (current != null) {
                variables.put("u", current);
            }
            recorder.record(type, line, states, levels, highlights, variables, explanation);
        }

        private String finishExplanation() {
            List<String> unreachable = states.entrySet().stream()
                    .filter(entry -> entry.getValue() == ElementState.DEFAULT)
                    .map(entry -> label(entry.getKey()))
                    .toList();
            String order = "La cola quedó vacía. Orden de visita: "
                    + String.join(", ", visitOrder.stream().map(this::label).toList()) + ".";
            return unreachable.isEmpty()
                    ? order
                    : order + " No se pudo llegar a: " + String.join(", ", unreachable) + ".";
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
