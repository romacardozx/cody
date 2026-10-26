package ar.edu.unsam.cody.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ar.edu.unsam.cody.dto.AlgorithmResponse;
import ar.edu.unsam.cody.engine.graph.Bfs;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.Algorithm;
import ar.edu.unsam.cody.model.AlgorithmFamily;
import ar.edu.unsam.cody.model.ScenarioType;
import ar.edu.unsam.cody.repository.AlgorithmRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class AlgorithmCatalogServiceTest {

    private final AlgorithmRepository repository = mock(AlgorithmRepository.class);
    private final AlgorithmCatalogService service =
            new AlgorithmCatalogService(repository, new AlgorithmRegistry(List.of(new Bfs())));

    @Test
    void marksImplementedAlgorithmsAsAvailableWithTheirPseudocode() {
        when(repository.findAllByOrderByDisplayOrderAsc())
                .thenReturn(List.of(algorithm("BFS", AlgorithmFamily.GRAPH), algorithm("BUBBLE_SORT", AlgorithmFamily.SORTING)));

        List<AlgorithmResponse> catalog = service.list();

        assertThat(catalog.get(0).available()).isTrue();
        assertThat(catalog.get(0).pseudocode()).isEqualTo(Bfs.PSEUDOCODE);
        assertThat(catalog.get(0).javaCode()).isEqualTo(Bfs.JAVA.lines());
        assertThat(catalog.get(0).javaLines()).hasSize(Bfs.PSEUDOCODE.size());
        assertThat(catalog.get(0).scenarioType()).isEqualTo(ScenarioType.GRAPH);
        assertThat(catalog.get(1).available()).isFalse();
        assertThat(catalog.get(1).pseudocode()).isEmpty();
        assertThat(catalog.get(1).scenarioType()).isEqualTo(ScenarioType.ARRAY);
    }

    @Test
    void unknownCodeIsNotFound() {
        when(repository.findByCode("NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get("NOPE")).isInstanceOf(ResourceNotFoundException.class);
    }

    private static Algorithm algorithm(String code, AlgorithmFamily family) {
        Algorithm algorithm = new Algorithm();
        algorithm.setCode(code);
        algorithm.setName(code);
        algorithm.setFamily(family);
        algorithm.setDescription("d");
        algorithm.setTimeComplexity("O(n)");
        algorithm.setSpaceComplexity("O(1)");
        return algorithm;
    }
}
