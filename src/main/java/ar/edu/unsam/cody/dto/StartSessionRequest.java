package ar.edu.unsam.cody.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

/**
 * Request to start walking through an algorithm.
 *
 * <p>For now the scenario travels inline; once the Scenario ABML exists this will take a
 * {@code scenarioId} instead.
 *
 * @param algorithmCode code of the algorithm, for example {@code "BFS"}
 * @param graph         the graph to run on (graph algorithms only)
 */
public record StartSessionRequest(
        @NotBlank(message = "Indicá el algoritmo.") String algorithmCode,
        @Valid GraphRequest graph) {
}
