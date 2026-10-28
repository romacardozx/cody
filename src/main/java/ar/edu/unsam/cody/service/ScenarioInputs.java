package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.engine.AlgorithmInput;
import ar.edu.unsam.cody.engine.ArrayInput;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioType;
import java.util.Map;

/**
 * The one place that pairs the engine's inputs with the scenario types, and turns a stored
 * scenario into the input an algorithm runs on. A new kind of input means one entry in
 * {@link #SCENARIO_TYPE} and one branch in {@link #convert}; the switch makes the compiler point
 * at the missing branch.
 */
final class ScenarioInputs {

    private static final Map<Class<? extends AlgorithmInput>, ScenarioType> SCENARIO_TYPE = Map.of(
            GraphInput.class, ScenarioType.GRAPH,
            ArrayInput.class, ScenarioType.ARRAY);

    private ScenarioInputs() {
    }

    /**
     * Scenario type an engine input is built from.
     *
     * @param inputType an {@link AlgorithmInput} class
     * @return its scenario type
     */
    static ScenarioType scenarioTypeFor(Class<? extends AlgorithmInput> inputType) {
        return SCENARIO_TYPE.get(inputType);
    }

    /**
     * Converts a scenario into the input the algorithm declares, checking that they fit.
     *
     * <p>Complexity: O(V + E) for graphs, O(n) for arrays (a copy).
     *
     * @param algorithm the algorithm to run
     * @param scenario  the stored scenario
     * @return the engine input
     * @throws BusinessRuleException if the scenario is of another type
     */
    static AlgorithmInput inputFor(TraceableAlgorithm<?> algorithm, Scenario scenario) {
        ScenarioType expected = scenarioTypeFor(algorithm.inputType());
        if (scenario.getType() != expected) {
            throw new BusinessRuleException("El algoritmo " + algorithm.code() + " necesita un escenario con "
                    + describe(expected) + "; \"" + scenario.getName() + "\" no lo es.");
        }
        return convert(expected, scenario);
    }

    private static AlgorithmInput convert(ScenarioType type, Scenario scenario) {
        return switch (type) {
            case GRAPH -> new GraphInput(
                    scenario.getNodes().stream().map(node -> new GraphInput.Node(node.getNodeId(), node.getLabel())).toList(),
                    scenario.getEdges().stream()
                            .map(edge -> new GraphInput.Edge(edge.getFromNode(), edge.getToNode(), edge.getWeight()))
                            .toList(),
                    scenario.getStartNodeId(),
                    scenario.isDirected());
            case ARRAY -> new ArrayInput(scenario.getArrayValues(), scenario.getTarget());
        };
    }

    /** How the error message names each type, for the user. */
    private static String describe(ScenarioType type) {
        return switch (type) {
            case GRAPH -> "un grafo";
            case ARRAY -> "un arreglo";
        };
    }
}
