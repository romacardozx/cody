package ar.edu.unsam.cody.engine;

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
     * Runs the algorithm over the given input.
     *
     * @param input the scenario to run on, already validated
     * @return the complete trace, from the first step to the last
     */
    Trace run(I input);
}
