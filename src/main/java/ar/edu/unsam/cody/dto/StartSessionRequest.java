package ar.edu.unsam.cody.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request to start walking through an algorithm on a saved scenario.
 *
 * @param algorithmCode code of the algorithm, for example {@code "BFS"}
 * @param scenarioId    id of the scenario to run on; its type must match the algorithm
 */
public record StartSessionRequest(
        @NotBlank(message = "Indicá el algoritmo.") String algorithmCode,
        @NotNull(message = "Indicá el escenario.") Long scenarioId) {
}
