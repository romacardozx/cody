package ar.edu.unsam.cody.engine;

import java.util.List;
import java.util.stream.IntStream;

/**
 * An array to sort (bubble sort) or to search in (binary search).
 *
 * <p>Values can repeat, so elements are identified by their initial position ({@code e0},
 * {@code e1}, ...) and not by their value. Those ids are the keys of
 * {@link Step#elementStates()} and stay attached to the element when it moves.
 *
 * @param values the array values; not empty and without {@code null} elements
 * @param target the value to search for, or {@code null} when the algorithm does not search
 */
public record ArrayInput(List<Integer> values, Integer target) implements AlgorithmInput {

    public ArrayInput {
        values = List.copyOf(values);
        if (values.isEmpty()) {
            throw new IllegalArgumentException("The array cannot be empty");
        }
    }

    /**
     * Creates an input without target, for sorting algorithms.
     *
     * @param values the array values
     */
    public ArrayInput(List<Integer> values) {
        this(values, null);
    }

    /**
     * Tells whether this input carries a value to search for.
     *
     * @return {@code true} when {@link #target()} is not {@code null}
     */
    public boolean hasTarget() {
        return target != null;
    }

    /**
     * Stable ids of the elements, in their initial order.
     *
     * @return {@code e0}, {@code e1}, ... one per value
     */
    public List<String> elementIds() {
        return IntStream.range(0, values.size()).mapToObj(i -> "e" + i).toList();
    }
}
