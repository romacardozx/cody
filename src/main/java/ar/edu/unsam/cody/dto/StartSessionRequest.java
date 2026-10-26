package ar.edu.unsam.cody.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request to start walking through an algorithm on a saved scenario.
 *
 * @param algorithmCode code of the algorithm, for example {@code "BFS"}
 * @param scenarioId    id of the scenario to run on; its type must match the algorithm
 * @param learnerId     anonymous id of the browser, to group its history; optional
 */
public record StartSessionRequest(
        @NotBlank(message = "Indicá el algoritmo.") String algorithmCode,
        @NotNull(message = "Indicá el escenario.") Long scenarioId,
        @Size(max = 64, message = "El identificador del alumno tiene hasta 64 caracteres.") String learnerId) {

    /** Request without learner, for clients that do not keep a history. */
    public StartSessionRequest(String algorithmCode, Long scenarioId) {
        this(algorithmCode, scenarioId, null);
    }
}
