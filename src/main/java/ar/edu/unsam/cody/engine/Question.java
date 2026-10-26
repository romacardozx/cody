package ar.edu.unsam.cody.engine;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * A prediction the user has to make at a key step ("¿qué nodo se visita ahora?").
 *
 * <p>{@code correctAnswer}, {@code explanation} and {@code optionFeedback} never leave the server
 * before the user answers: the API exposes a DTO without them, and the answer is checked here with
 * {@link #isCorrect(String)}.
 *
 * @param id             unique id inside the trace
 * @param prompt         question shown to the user (in Spanish)
 * @param options        the possible answers, at least two and without repetitions
 * @param correctAnswer  the right option; must be one of {@code options}
 * @param explanation    why the correct answer is right, in Spanish
 * @param optionFeedback why each wrong option is wrong, keyed by option; may skip some options
 */
public record Question(
        String id,
        String prompt,
        List<String> options,
        String correctAnswer,
        String explanation,
        Map<String, String> optionFeedback) {

    public Question {
        requireNotBlank(id, "id");
        requireNotBlank(prompt, "prompt");
        requireNotBlank(explanation, "explanation");
        options = List.copyOf(options);
        optionFeedback = Map.copyOf(optionFeedback);
        Objects.requireNonNull(correctAnswer, "correctAnswer");
        if (options.size() < 2) {
            throw new IllegalArgumentException("A question needs at least two options");
        }
        if (new HashSet<>(options).size() != options.size()) {
            throw new IllegalArgumentException("Question options must be unique");
        }
        if (!options.contains(correctAnswer)) {
            throw new IllegalArgumentException("The correct answer must be one of the options");
        }
        for (String option : optionFeedback.keySet()) {
            if (!options.contains(option) || option.equals(correctAnswer)) {
                throw new IllegalArgumentException("Feedback is only for wrong options: " + option);
            }
        }
    }

    /**
     * Checks a user's answer.
     *
     * @param answer the option chosen by the user; may be {@code null}
     * @return {@code true} only when it matches the correct answer
     */
    public boolean isCorrect(String answer) {
        return correctAnswer.equals(answer);
    }

    /**
     * Explains why a wrong option is wrong.
     *
     * @param option the option the user chose
     * @return the feedback, or {@code null} if the option is right or has none
     */
    public String feedbackFor(String option) {
        return optionFeedback.get(option);
    }

    private static void requireNotBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " cannot be blank");
        }
    }
}
