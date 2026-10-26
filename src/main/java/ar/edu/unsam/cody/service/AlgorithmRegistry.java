package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Finds engine algorithms by code. Spring injects every {@link TraceableAlgorithm} bean, so new
 * algorithms are picked up without touching this class.
 */
@Component
public class AlgorithmRegistry {

    private final Map<String, TraceableAlgorithm<?>> algorithmsByCode;

    public AlgorithmRegistry(List<TraceableAlgorithm<?>> algorithms) {
        this.algorithmsByCode = algorithms.stream()
                .collect(Collectors.toUnmodifiableMap(TraceableAlgorithm::code, Function.identity()));
    }

    /**
     * Looks up an algorithm.
     *
     * @param code algorithm code, for example {@code "BFS"}
     * @return the algorithm
     * @throws ResourceNotFoundException if no algorithm has that code
     */
    public TraceableAlgorithm<?> get(String code) {
        TraceableAlgorithm<?> algorithm = algorithmsByCode.get(code);
        if (algorithm == null) {
            throw new ResourceNotFoundException("No existe el algoritmo " + code + ".");
        }
        return algorithm;
    }
}
