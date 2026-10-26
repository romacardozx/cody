package ar.edu.unsam.cody.engine;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * One step of a trace: a COMPLETE snapshot of the algorithm state, not just what changed. Going
 * back in the player is simply showing the previous step.
 *
 * @param index         position in the trace, starting at 0
 * @param type          what happens in this step
 * @param codeLine      pseudocode line to highlight, starting at 1
 * @param elementStates state of every node or array element, keyed by its stable id
 * @param values        numbers shown on the elements: distances, array contents, etc. An element
 *                      without a value (for example, an unreachable node in Dijkstra) has no key
 * @param highlights    ids of edges or elements to emphasize in this step
 * @param variables     algorithm variables for the side panel, e.g. {@code "u" -> "B"}
 * @param explanation   what happens, in Spanish, for the user
 * @param question      prediction asked at this step, or {@code null} if there is none
 */
public record Step(
        int index,
        StepType type,
        int codeLine,
        Map<String, ElementState> elementStates,
        Map<String, Integer> values,
        List<String> highlights,
        Map<String, String> variables,
        String explanation,
        Question question) {

    public Step {
        Objects.requireNonNull(type, "type");
        elementStates = Map.copyOf(elementStates);
        values = Map.copyOf(values);
        highlights = List.copyOf(highlights);
        variables = Map.copyOf(variables);
        if (index < 0) {
            throw new IllegalArgumentException("Step index cannot be negative");
        }
        if (codeLine < 1) {
            throw new IllegalArgumentException("Code lines start at 1");
        }
        if (elementStates.isEmpty()) {
            throw new IllegalArgumentException("A step must include the state of every element");
        }
        if (explanation == null || explanation.isBlank()) {
            throw new IllegalArgumentException("Every step needs an explanation");
        }
    }

    /**
     * Tells whether the user has to answer a question at this step.
     *
     * @return {@code true} when {@link #question()} is not {@code null}
     */
    public boolean hasQuestion() {
        return question != null;
    }
}
