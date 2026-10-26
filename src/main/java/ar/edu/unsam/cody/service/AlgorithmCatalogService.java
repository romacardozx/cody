package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.AlgorithmResponse;
import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.Algorithm;
import ar.edu.unsam.cody.repository.AlgorithmRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Algorithm catalog: joins what the database says about each algorithm (name, description,
 * complexity) with what the engine provides (whether it is implemented, its pseudocode).
 */
@Service
public class AlgorithmCatalogService {

    private final AlgorithmRepository algorithms;
    private final AlgorithmRegistry registry;

    public AlgorithmCatalogService(AlgorithmRepository algorithms, AlgorithmRegistry registry) {
        this.algorithms = algorithms;
        this.registry = registry;
    }

    /**
     * Lists every algorithm in catalog order, implemented or not.
     *
     * @return the catalog
     */
    @Transactional(readOnly = true)
    public List<AlgorithmResponse> list() {
        return algorithms.findAllByOrderByDisplayOrderAsc().stream().map(this::toResponse).toList();
    }

    /**
     * Gets one algorithm.
     *
     * @param code algorithm code
     * @return the catalog entry
     * @throws ResourceNotFoundException if the code is not in the catalog
     */
    @Transactional(readOnly = true)
    public AlgorithmResponse get(String code) {
        return algorithms.findByCode(code)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el algoritmo " + code + "."));
    }

    private AlgorithmResponse toResponse(Algorithm algorithm) {
        Optional<TraceableAlgorithm<?>> engine = registry.find(algorithm.getCode());
        return new AlgorithmResponse(
                algorithm.getCode(),
                algorithm.getName(),
                algorithm.getFamily(),
                algorithm.getFamily().scenarioType(),
                algorithm.getDescription(),
                algorithm.getTimeComplexity(),
                algorithm.getSpaceComplexity(),
                engine.isPresent(),
                engine.map(TraceableAlgorithm::pseudocode).orElse(List.of()));
    }
}
