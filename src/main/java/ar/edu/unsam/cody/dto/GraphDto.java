package ar.edu.unsam.cody.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Graph of a scenario, used both in requests and responses. Bean Validation only checks the shape;
 * functional rules (at least two nodes, edges between existing nodes, ...) live in
 * {@code ScenarioRules}.
 *
 * @param nodes       graph nodes, in order (BFS explores neighbors in this order)
 * @param edges       graph edges; may be empty
 * @param startNodeId id of the node where algorithms start
 * @param directed    whether edges have a direction
 */
public record GraphDto(
        @NotEmpty(message = "El grafo necesita nodos.") List<@Valid NodeDto> nodes,
        @NotNull(message = "La lista de aristas es obligatoria (puede estar vacía).") List<@Valid EdgeDto> edges,
        @NotBlank(message = "Indicá el nodo inicial.") String startNodeId,
        boolean directed) {

    /**
     * A node of the graph.
     *
     * @param id    stable identifier, referenced by edges
     * @param label text shown to the user
     * @param x     horizontal position on the canvas
     * @param y     vertical position on the canvas
     */
    public record NodeDto(
            @NotBlank(message = "Cada nodo necesita un id.") @Size(max = 20, message = "El id de un nodo tiene hasta 20 caracteres.") String id,
            @NotBlank(message = "Cada nodo necesita una etiqueta.") @Size(max = 40, message = "La etiqueta tiene hasta 40 caracteres.") String label,
            double x,
            double y) {
    }

    /**
     * An edge of the graph.
     *
     * @param from   source node id
     * @param to     target node id
     * @param weight edge weight (ignored by BFS)
     */
    public record EdgeDto(
            @NotBlank(message = "Cada arista necesita un nodo de origen.") String from,
            @NotBlank(message = "Cada arista necesita un nodo de destino.") String to,
            int weight) {
    }
}
