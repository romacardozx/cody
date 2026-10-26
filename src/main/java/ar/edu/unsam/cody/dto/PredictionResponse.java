package ar.edu.unsam.cody.dto;

import java.util.List;

/**
 * Result of answering a question.
 *
 * @param correct       whether the answer was right
 * @param correctAnswer the right option, revealed only after answering
 * @param explanation   feedback for the user, in Spanish
 * @param steps         next steps, up to and including the next question
 * @param finished      {@code true} when the trace is over
 * @param correctCount  correct answers so far in this session
 * @param wrongCount    wrong answers so far in this session
 */
public record PredictionResponse(
        boolean correct,
        String correctAnswer,
        String explanation,
        List<StepDto> steps,
        boolean finished,
        int correctCount,
        int wrongCount) {
}
