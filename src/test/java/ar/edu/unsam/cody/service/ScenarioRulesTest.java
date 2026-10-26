package ar.edu.unsam.cody.service;

import static ar.edu.unsam.cody.service.TestScenarios.graphRequest;
import static ar.edu.unsam.cody.service.TestScenarios.node;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ar.edu.unsam.cody.dto.ArrayDto;
import ar.edu.unsam.cody.dto.GraphDto;
import ar.edu.unsam.cody.dto.GraphDto.EdgeDto;
import ar.edu.unsam.cody.dto.ScenarioRequest;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.model.ScenarioType;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class ScenarioRulesTest {

    private static final List<GraphDto.NodeDto> AB = List.of(node("A"), node("B"));

    @Test
    void acceptsValidGraphAndArray() {
        assertThatCode(() -> ScenarioRules.validate(graphRequest("ok"))).doesNotThrowAnyException();
        assertThatCode(() -> ScenarioRules.validate(TestScenarios.arrayRequest("ok"))).doesNotThrowAnyException();
    }

    @Test
    void graphNeedsAtLeastTwoNodes() {
        GraphDto single = new GraphDto(List.of(node("A")), List.of(), "A", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(single)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("entre 2 y 26 nodos");
    }

    @Test
    void graphHasANodeLimit() {
        List<GraphDto.NodeDto> many = IntStream.range(0, 27).mapToObj(i -> node("N" + i)).toList();

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(new GraphDto(many, List.of(), "N0", false))))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void nodeIdsMustBeUnique() {
        GraphDto graph = new GraphDto(List.of(node("A"), node("A")), List.of(), "A", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(graph)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("dos nodos");
    }

    @Test
    void edgesMustReferenceExistingNodes() {
        GraphDto graph = new GraphDto(AB, List.of(new EdgeDto("A", "Z", 1)), "A", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(graph)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("Z");
    }

    @Test
    void edgesCannotLoopOnTheSameNode() {
        GraphDto graph = new GraphDto(AB, List.of(new EdgeDto("A", "A", 1)), "A", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(graph)))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void weightsCannotBeNegative() {
        GraphDto graph = new GraphDto(AB, List.of(new EdgeDto("A", "B", -1)), "A", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(graph)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("negativo");
    }

    @Test
    void undirectedEdgesCannotRepeatInEitherDirection() {
        GraphDto graph = new GraphDto(AB, List.of(new EdgeDto("A", "B", 1), new EdgeDto("B", "A", 2)), "A", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(graph)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("repetida");
    }

    @Test
    void directedEdgesCanGoBothWays() {
        GraphDto graph = new GraphDto(AB, List.of(new EdgeDto("A", "B", 1), new EdgeDto("B", "A", 2)), "A", true);

        assertThatCode(() -> ScenarioRules.validate(graphRequest(graph))).doesNotThrowAnyException();
    }

    @Test
    void startNodeMustExist() {
        GraphDto graph = new GraphDto(AB, List.of(), "Z", false);

        assertThatThrownBy(() -> ScenarioRules.validate(graphRequest(graph)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("inicial");
    }

    @Test
    void typeMustMatchTheData() {
        ScenarioRequest graphWithoutGraph = new ScenarioRequest("x", null, ScenarioType.GRAPH, null, null);
        ScenarioRequest graphWithArray = new ScenarioRequest("x", null, ScenarioType.GRAPH,
                TestScenarios.triangleGraph(), new ArrayDto(List.of(1), null));
        ScenarioRequest arrayWithoutArray = new ScenarioRequest("x", null, ScenarioType.ARRAY, null, null);

        assertThatThrownBy(() -> ScenarioRules.validate(graphWithoutGraph)).isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> ScenarioRules.validate(graphWithArray)).isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> ScenarioRules.validate(arrayWithoutArray)).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void arrayHasASizeLimit() {
        ScenarioRequest big = new ScenarioRequest("x", null, ScenarioType.ARRAY, null,
                new ArrayDto(Collections.nCopies(31, 1), null));

        assertThatThrownBy(() -> ScenarioRules.validate(big)).isInstanceOf(BusinessRuleException.class);
    }
}
