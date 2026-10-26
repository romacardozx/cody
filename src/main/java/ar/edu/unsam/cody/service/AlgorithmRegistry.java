package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
     * Looks up an algorithm that must exist.
     *
     * @param code algorithm code, for example {@code "BFS"}
     * @return the algorithm
     * @throws ResourceNotFoundException if the engine does not implement that code
     */
    public TraceableAlgorithm<?> get(String code) {
        return find(code).orElseThrow(() ->
                new ResourceNotFoundException("El algoritmo " + code + " no existe o todavía no está disponible."));
    }

    /**
     * Looks up an algorithm that may not be implemented yet.
     *
     * @param code algorithm code
     * @return the algorithm, or empty
     */
    public Optional<TraceableAlgorithm<?>> find(String code) {
        return Optional.ofNullable(algorithmsByCode.get(code));
    }
}
