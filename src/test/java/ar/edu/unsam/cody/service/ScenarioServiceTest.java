package ar.edu.unsam.cody.service;

import static ar.edu.unsam.cody.service.TestScenarios.arrayRequest;
import static ar.edu.unsam.cody.service.TestScenarios.graphRequest;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ar.edu.unsam.cody.dto.ScenarioResponse;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioType;
import ar.edu.unsam.cody.repository.ScenarioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ScenarioServiceTest {

    private ScenarioRepository repository;
    private ActiveSessionStore activeSessions;
    private ScenarioService service;

    @BeforeEach
    void setUp() {
        repository = mock(ScenarioRepository.class);
        activeSessions = mock(ActiveSessionStore.class);
        service = new ScenarioService(repository, activeSessions);
        when(repository.save(any(Scenario.class))).thenAnswer(invocation -> {
            Scenario scenario = invocation.getArgument(0);
            if (scenario.getId() == null) {
                scenario.setId(10L);
            }
            return scenario;
        });
    }

    @Test
    void createsAGraphScenario() {
        when(repository.findByNameIgnoreCase("Triángulo")).thenReturn(Optional.empty());

        ScenarioResponse created = service.create(graphRequest("  Triángulo  "));

        assertThat(created.id()).isEqualTo(10L);
        assertThat(created.name()).isEqualTo("Triángulo");
        assertThat(created.type()).isEqualTo(ScenarioType.GRAPH);
        assertThat(created.graph().nodes()).extracting(node -> node.id()).containsExactly("A", "B", "C");
        assertThat(created.array()).isNull();
    }

    @Test
    void createsAnArrayScenario() {
        when(repository.findByNameIgnoreCase("Nums")).thenReturn(Optional.empty());

        ScenarioResponse created = service.create(arrayRequest("Nums"));

        assertThat(created.array().values()).containsExactly(5, 1, 4);
        assertThat(created.graph()).isNull();
    }

    @Test
    void rejectsADuplicatedNameIgnoringCase() {
        when(repository.findByNameIgnoreCase("triángulo")).thenReturn(Optional.of(TestScenarios.triangleEntity(1)));

        assertThatThrownBy(() -> service.create(graphRequest("triángulo")))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("Ya existe");
        verify(repository, never()).save(any());
    }

    @Test
    void doesNotSaveAnInvalidScenario() {
        assertThatThrownBy(() -> service.create(TestScenarios.graphRequest(
                new ar.edu.unsam.cody.dto.GraphDto(List.of(TestScenarios.node("A")), List.of(), "A", false))))
                .isInstanceOf(BusinessRuleException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void updateKeepsItsOwnName() {
        Scenario existing = TestScenarios.triangleEntity(1);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.findByNameIgnoreCase("Triángulo")).thenReturn(Optional.of(existing));

        ScenarioResponse updated = service.update(1L, graphRequest("Triángulo"));

        assertThat(updated.id()).isEqualTo(1L);
    }

    @Test
    void updateCanChangeTheTypeAndClearsTheOldData() {
        Scenario existing = TestScenarios.triangleEntity(1);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.findByNameIgnoreCase("Ahora arreglo")).thenReturn(Optional.empty());

        ScenarioResponse updated = service.update(1L, arrayRequest("Ahora arreglo"));

        assertThat(updated.type()).isEqualTo(ScenarioType.ARRAY);
        assertThat(existing.getNodes()).isEmpty();
        assertThat(existing.getEdges()).isEmpty();
        assertThat(existing.getStartNodeId()).isNull();
    }

    @Test
    void cannotUpdateOrDeleteAScenarioInUse() {
        when(repository.findById(1L)).thenReturn(Optional.of(TestScenarios.triangleEntity(1)));
        when(activeSessions.hasUnfinishedSessionFor(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("sesión en curso");
        assertThatThrownBy(() -> service.update(1L, graphRequest("x")))
                .isInstanceOf(BusinessRuleException.class);
        verify(repository, never()).delete(any());
    }

    @Test
    void deletesAScenarioNotInUse() {
        Scenario existing = TestScenarios.triangleEntity(1);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.delete(1L);

        verify(repository).delete(existing);
    }

    @Test
    void missingScenarioIsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L)).isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listsByTypeWhenAsked() {
        when(repository.findByTypeOrderByNameAsc(ScenarioType.ARRAY)).thenReturn(List.of(TestScenarios.arrayEntity(2)));
        when(repository.findAllByOrderByNameAsc())
                .thenReturn(List.of(TestScenarios.arrayEntity(2), TestScenarios.triangleEntity(1)));

        assertThat(service.list(ScenarioType.ARRAY)).hasSize(1);
        assertThat(service.list(null)).hasSize(2);
    }
}
