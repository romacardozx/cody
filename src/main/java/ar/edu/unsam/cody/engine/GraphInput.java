package ar.edu.unsam.cody.engine;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * A graph to run BFS or Dijkstra on.
 *
 * <p>The constructor only checks structural integrity (unique ids, edges between existing nodes).
 * Business rules such as "at least two nodes" or "no negative weights for Dijkstra" are checked by
 * the service layer, which can return a clear message to the user.
 *
 * @param nodes       the nodes; ids must be unique
 * @param edges       the edges between existing nodes
 * @param startNodeId the node where the traversal starts
 * @param directed    whether edges go only from {@code from} to {@code to}
 */
public record GraphInput(List<Node> nodes, List<Edge> edges, String startNodeId, boolean directed)
        implements AlgorithmInput {

    /**
     * A graph node.
     *
     * @param id    stable identifier, never derived from the label
     * @param label text shown to the user
     */
    public record Node(String id, String label) {

        public Node {
            Objects.requireNonNull(id, "id");
            Objects.requireNonNull(label, "label");
        }
    }

    /**
     * A weighted edge. BFS ignores the weight.
     *
     * @param from   id of the source node
     * @param to     id of the target node
     * @param weight the edge weight
     */
    public record Edge(String from, String to, int weight) {

        public Edge {
            Objects.requireNonNull(from, "from");
            Objects.requireNonNull(to, "to");
        }
    }

    public GraphInput {
        nodes = List.copyOf(nodes);
        edges = List.copyOf(edges);
        Objects.requireNonNull(startNodeId, "startNodeId");
        if (nodes.isEmpty()) {
            throw new IllegalArgumentException("A graph needs at least one node");
        }

        Set<String> ids = new HashSet<>();
        for (Node node : nodes) {
            if (!ids.add(node.id())) {
                throw new IllegalArgumentException("Duplicated node id: " + node.id());
            }
        }
        for (Edge edge : edges) {
            if (!ids.contains(edge.from()) || !ids.contains(edge.to())) {
                throw new IllegalArgumentException(
                        "Edge " + edge.from() + "->" + edge.to() + " references an unknown node");
            }
        }
        if (!ids.contains(startNodeId)) {
            throw new IllegalArgumentException("Unknown start node: " + startNodeId);
        }
    }
}
