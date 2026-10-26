package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioType;
import java.time.LocalDateTime;
import java.util.List;

/**
 * A saved scenario. Only the field matching {@code type} is filled; the other one is {@code null}.
 *
 * @param id          database id
 * @param name        unique name
 * @param description short description, may be {@code null}
 * @param type        GRAPH or ARRAY
 * @param graph       the graph, when type is GRAPH
 * @param array       the array, when type is ARRAY
 * @param createdAt   creation time
 * @param updatedAt   last modification time
 */
public record ScenarioResponse(
        Long id,
        String name,
        String description,
        ScenarioType type,
        GraphDto graph,
        ArrayDto array,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ScenarioResponse from(Scenario scenario) {
        GraphDto graph = null;
        ArrayDto array = null;
        if (scenario.getType() == ScenarioType.GRAPH) {
            graph = new GraphDto(
                    scenario.getNodes().stream()
                            .map(node -> new GraphDto.NodeDto(node.getNodeId(), node.getLabel(), node.getX(), node.getY()))
                            .toList(),
                    scenario.getEdges().stream()
                            .map(edge -> new GraphDto.EdgeDto(edge.getFromNode(), edge.getToNode(), edge.getWeight()))
                            .toList(),
                    scenario.getStartNodeId(),
                    scenario.isDirected());
        } else {
            array = new ArrayDto(List.copyOf(scenario.getArrayValues()), scenario.getTarget());
        }
        return new ScenarioResponse(scenario.getId(), scenario.getName(), scenario.getDescription(),
                scenario.getType(), graph, array, scenario.getCreatedAt(), scenario.getUpdatedAt());
    }
}
