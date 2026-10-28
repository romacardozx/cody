package ar.edu.unsam.cody.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ar.edu.unsam.cody.engine.AlgorithmInput;
import ar.edu.unsam.cody.engine.ArrayInput;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.graph.Bfs;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.model.ScenarioType;
import org.junit.jupiter.api.Test;

class ScenarioInputsTest {

    @Test
    void knowsWhichScenarioTypeEachEngineInputComesFrom() {
        assertThat(ScenarioInputs.scenarioTypeFor(GraphInput.class)).isEqualTo(ScenarioType.GRAPH);
        assertThat(ScenarioInputs.scenarioTypeFor(ArrayInput.class)).isEqualTo(ScenarioType.ARRAY);
    }

    @Test
    void convertsAGraphScenarioForAGraphAlgorithm() {
        AlgorithmInput input = ScenarioInputs.inputFor(new Bfs(), TestScenarios.triangleEntity(1));

        assertThat(input).isInstanceOfSatisfying(GraphInput.class, graph -> {
            assertThat(graph.nodes()).hasSize(3);
            assertThat(graph.startNodeId()).isEqualTo("A");
        });
    }

    @Test
    void rejectsAScenarioOfTheWrongType() {
        assertThatThrownBy(() -> ScenarioInputs.inputFor(new Bfs(), TestScenarios.arrayEntity(2)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("El algoritmo BFS necesita un escenario con un grafo; \"Arreglo\" no lo es.");
    }
}
