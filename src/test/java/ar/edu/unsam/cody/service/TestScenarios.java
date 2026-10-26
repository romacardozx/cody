package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.ArrayDto;
import ar.edu.unsam.cody.dto.GraphDto;
import ar.edu.unsam.cody.dto.GraphDto.EdgeDto;
import ar.edu.unsam.cody.dto.GraphDto.NodeDto;
import ar.edu.unsam.cody.dto.ScenarioRequest;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioEdge;
import ar.edu.unsam.cody.model.ScenarioNode;
import ar.edu.unsam.cody.model.ScenarioType;
import java.util.List;

/** Valid scenarios for service tests. */
public final class TestScenarios {

    private TestScenarios() {
    }

    /** A - B, A - C: before dequeuing B the queue is [B, C], so BFS asks exactly one question. */
    public static GraphDto triangleGraph() {
        return new GraphDto(
                List.of(node("A"), node("B"), node("C")),
                List.of(new EdgeDto("A", "B", 1), new EdgeDto("A", "C", 1)),
                "A", false);
    }

    public static ScenarioRequest graphRequest(String name) {
        return new ScenarioRequest(name, "descripción", ScenarioType.GRAPH, triangleGraph(), null);
    }

    public static ScenarioRequest graphRequest(GraphDto graph) {
        return new ScenarioRequest("Grafo", null, ScenarioType.GRAPH, graph, null);
    }

    public static ScenarioRequest arrayRequest(String name) {
        return new ScenarioRequest(name, null, ScenarioType.ARRAY, null, new ArrayDto(List.of(5, 1, 4), null));
    }

    /** The entity equivalent to {@link #triangleGraph()}. */
    public static Scenario triangleEntity(long id) {
        Scenario scenario = new Scenario();
        scenario.setId(id);
        scenario.setName("Triángulo");
        scenario.setType(ScenarioType.GRAPH);
        scenario.getNodes().addAll(List.of(
                new ScenarioNode("A", "A", 0, 0), new ScenarioNode("B", "B", 1, 0), new ScenarioNode("C", "C", 0, 1)));
        scenario.getEdges().addAll(List.of(new ScenarioEdge("A", "B", 1), new ScenarioEdge("A", "C", 1)));
        scenario.setStartNodeId("A");
        return scenario;
    }

    public static Scenario arrayEntity(long id) {
        Scenario scenario = new Scenario();
        scenario.setId(id);
        scenario.setName("Arreglo");
        scenario.setType(ScenarioType.ARRAY);
        scenario.getArrayValues().addAll(List.of(5, 1, 4));
        return scenario;
    }

    public static NodeDto node(String id) {
        return new NodeDto(id, id, 0, 0);
    }
}
