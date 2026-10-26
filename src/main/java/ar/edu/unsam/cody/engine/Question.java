package ar.edu.unsam.cody.engine;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;

/**
 * A prediction the user has to make at a key step ("¿qué nodo se visita ahora?").
 *
 * <p>{@code correctAnswer} never leaves the server: the API exposes a DTO without it, and the
 * answer is checked here with {@link #isCorrect(String)}.
 *
 * @param id            unique id inside the trace
 * @param prompt        question shown to the user (in Spanish)
 * @param options       the possible answers, at least two and without repetitions
 * @param correctAnswer the right option; must be one of {@code options}
 */
public record Question(String id, String prompt, List<String> options, String correctAnswer) {

    public Question {
        requireNotBlank(id, "id");
        requireNotBlank(prompt, "prompt");
        options = List.copyOf(options);
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

    private static void requireNotBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " cannot be blank");
        }
    }
}
