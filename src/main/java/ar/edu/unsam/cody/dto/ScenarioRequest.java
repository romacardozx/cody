package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.model.ScenarioType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Data to create or update a scenario. Exactly one of {@code graph} or {@code array} must be
 * present, matching {@code type}.
 *
 * @param name        unique name shown in the scenario list
 * @param description optional short description
 * @param type        GRAPH or ARRAY
 * @param graph       the graph, when type is GRAPH
 * @param array       the array, when type is ARRAY
 */
public record ScenarioRequest(
        @NotBlank(message = "El escenario necesita un nombre.") @Size(max = 80, message = "El nombre tiene hasta 80 caracteres.") String name,
        @Size(max = 300, message = "La descripción tiene hasta 300 caracteres.") String description,
        @NotNull(message = "Indicá si el escenario es un grafo o un arreglo.") ScenarioType type,
        @Valid GraphDto graph,
        @Valid ArrayDto array) {
}
