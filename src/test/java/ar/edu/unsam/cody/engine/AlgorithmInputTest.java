package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ar.edu.unsam.cody.engine.GraphInput.Edge;
import ar.edu.unsam.cody.engine.GraphInput.Node;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class AlgorithmInputTest {

    private static final List<Node> NODES = List.of(new Node("A", "A"), new Node("B", "B"));

    @Test
    void validGraphKeepsItsData() {
        GraphInput graph = new GraphInput(NODES, List.of(new Edge("A", "B", 3)), "A", false);

        assertThat(graph.nodes()).hasSize(2);
        assertThat(graph.edges()).containsExactly(new Edge("A", "B", 3));
        assertThat(graph.startNodeId()).isEqualTo("A");
    }

    @Test
    void graphRejectsDuplicatedNodeIds() {
        List<Node> nodes = List.of(new Node("A", "A"), new Node("A", "otro"));

        assertThatThrownBy(() -> new GraphInput(nodes, List.of(), "A", false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void graphRejectsEdgesToUnknownNodes() {
        assertThatThrownBy(() -> new GraphInput(NODES, List.of(new Edge("A", "Z", 1)), "A", false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void graphRejectsUnknownStartNode() {
        assertThatThrownBy(() -> new GraphInput(NODES, List.of(), "Z", false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void graphRejectsEmptyNodeList() {
        assertThatThrownBy(() -> new GraphInput(List.of(), List.of(), "A", false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void graphListsAreCopied() {
        List<Edge> edges = new ArrayList<>(List.of(new Edge("A", "B", 1)));
        GraphInput graph = new GraphInput(NODES, edges, "A", true);

        edges.clear();

        assertThat(graph.edges()).hasSize(1);
    }

    @Test
    void arrayInputWithoutTargetIsForSorting() {
        ArrayInput input = new ArrayInput(List.of(5, 3, 1));

        assertThat(input.values()).containsExactly(5, 3, 1);
        assertThat(input.target()).isNull();
        assertThat(input.hasTarget()).isFalse();
    }

    @Test
    void arrayInputWithTargetIsForSearching() {
        ArrayInput input = new ArrayInput(List.of(1, 3, 5), 3);

        assertThat(input.hasTarget()).isTrue();
        assertThat(input.target()).isEqualTo(3);
    }

    @Test
    void arrayInputRejectsEmptyValues() {
        assertThatThrownBy(() -> new ArrayInput(List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void arrayInputRejectsNullElements() {
        List<Integer> values = new ArrayList<>();
        values.add(1);
        values.add(null);

        assertThatThrownBy(() -> new ArrayInput(values))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void elementIdsAreStableAndIndependentFromValues() {
        ArrayInput input = new ArrayInput(List.of(7, 7, 2));

        assertThat(input.elementIds()).containsExactly("e0", "e1", "e2");
    }
}
