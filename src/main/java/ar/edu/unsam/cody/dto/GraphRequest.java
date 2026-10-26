package ar.edu.unsam.cody.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Graph sent by the client. Bean Validation only checks the shape; functional rules (at least two
 * nodes, edges between existing nodes, ...) are checked by the service.
 *
 * @param nodes       graph nodes
 * @param edges       graph edges; may be empty
 * @param startNodeId id of the node where the algorithm starts
 * @param directed    whether edges have a direction
 */
public record GraphRequest(
        @NotEmpty(message = "El grafo necesita nodos.") List<@Valid NodeRequest> nodes,
        @NotNull(message = "La lista de aristas es obligatoria (puede estar vacía).") List<@Valid EdgeRequest> edges,
        @NotBlank(message = "Indicá el nodo inicial.") String startNodeId,
        boolean directed) {

    /**
     * A node of the graph.
     *
     * @param id    stable identifier
     * @param label text shown to the user
     */
    public record NodeRequest(
            @NotBlank(message = "Cada nodo necesita un id.") String id,
            @NotBlank(message = "Cada nodo necesita una etiqueta.") String label) {
    }

    /**
     * An edge of the graph.
     *
     * @param from   source node id
     * @param to     target node id
     * @param weight edge weight (ignored by BFS)
     */
    public record EdgeRequest(
            @NotBlank(message = "Cada arista necesita un nodo de origen.") String from,
            @NotBlank(message = "Cada arista necesita un nodo de destino.") String to,
            int weight) {
    }
}
