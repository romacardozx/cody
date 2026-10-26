package ar.edu.unsam.cody.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * The user's answer to the pending question of a session.
 *
 * @param questionId id of the question being answered
 * @param answer     the chosen option
 */
public record PredictionRequest(
        @NotBlank(message = "Indicá qué pregunta estás respondiendo.") String questionId,
        @NotBlank(message = "Elegí una respuesta.") String answer) {
}
