package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.model.AlgorithmFamily;
import ar.edu.unsam.cody.model.ScenarioType;
import java.util.List;

/**
 * Catalog entry of an algorithm, enriched with what the engine knows about it.
 *
 * @param code            algorithm code
 * @param name            display name
 * @param family          SORTING, SEARCHING or GRAPH
 * @param scenarioType    kind of scenario it runs on
 * @param description     what it does
 * @param timeComplexity  time complexity, e.g. {@code "O(V + E)"}
 * @param spaceComplexity extra space complexity
 * @param available       {@code true} when the engine already implements it
 * @param pseudocode      lines that trace steps point to; empty when not available
 * @param javaCode        the algorithm in plain Java; empty when not available
 * @param javaLines       entry i is the Java line for pseudocode line i + 1; empty when not available
 */
public record AlgorithmResponse(
        String code,
        String name,
        AlgorithmFamily family,
        ScenarioType scenarioType,
        String description,
        String timeComplexity,
        String spaceComplexity,
        boolean available,
        List<String> pseudocode,
        List<String> javaCode,
        List<Integer> javaLines) {
}
