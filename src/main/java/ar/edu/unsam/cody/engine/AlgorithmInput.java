package ar.edu.unsam.cody.engine;

/**
 * Input of an algorithm. It is the engine's own view of a scenario, independent from the JPA
 * entity: the service layer converts a {@code Scenario} into one of these before running.
 */
public sealed interface AlgorithmInput permits GraphInput, ArrayInput {
}
