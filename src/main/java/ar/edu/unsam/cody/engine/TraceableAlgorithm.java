package ar.edu.unsam.cody.engine;

import java.util.List;

/**
 * An algorithm that, besides solving its problem, records every step it takes.
 *
 * <p>Implementations live in {@code engine.graph} or {@code engine.array}, must not depend on
 * Spring or JPA, and must be deterministic: the same input always produces the same trace. That
 * lets the server rebuild a trace instead of storing it, and makes the algorithms easy to test.
 *
 * @param <I> the kind of input the algorithm works on
 */
public interface TraceableAlgorithm<I extends AlgorithmInput> {

    /**
     * Unique code of the algorithm, the same one stored in the database catalog.
     *
     * @return the code, for example {@code "DIJKSTRA"}
     */
    String code();

    /**
     * Kind of input this algorithm expects, so callers can check it before running.
     *
     * @return {@code GraphInput.class} or {@code ArrayInput.class}
     */
    Class<I> inputType();

    /**
     * Pseudocode shown next to the animation. {@link Step#codeLine()} points into it (starting at
     * 1), so it lives with the implementation and both change together.
     *
     * @return the pseudocode lines, in Spanish
     */
    List<String> pseudocode();

    /**
     * The same algorithm as plain Java (no tracing), mapped line by line to the pseudocode.
     *
     * @return the Java listing
     */
    JavaListing javaListing();

    /**
     * Runs the algorithm over the given input.
     *
     * @param input the scenario to run on, already validated
     * @return the complete trace, from the first step to the last
     */
    Trace run(I input);
}
