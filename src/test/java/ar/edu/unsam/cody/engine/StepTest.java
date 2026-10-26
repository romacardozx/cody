package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class StepTest {

    @Test
    void stepWithoutQuestionHasNoQuestion() {
        Step step = TestSteps.step(0, null);

        assertThat(step.hasQuestion()).isFalse();
        assertThat(step.question()).isNull();
    }

    @Test
    void stepWithQuestionHasQuestion() {
        Step step = TestSteps.step(0, TestSteps.question("q1"));

        assertThat(step.hasQuestion()).isTrue();
    }

    @Test
    void rejectsNegativeIndex() {
        assertThatThrownBy(() -> TestSteps.step(-1, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsCodeLineBelowOne() {
        assertThatThrownBy(() -> new Step(0, StepType.START, 0,
                Map.of("A", ElementState.DEFAULT), Map.of(), List.of(), Map.of(), "explicación", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsEmptyElementStates() {
        assertThatThrownBy(() -> new Step(0, StepType.START, 1,
                Map.of(), Map.of(), List.of(), Map.of(), "explicación", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankExplanation() {
        assertThatThrownBy(() -> new Step(0, StepType.START, 1,
                Map.of("A", ElementState.DEFAULT), Map.of(), List.of(), Map.of(), " ", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void collectionsAreCopiedAndImmutable() {
        Map<String, ElementState> states = new HashMap<>(Map.of("A", ElementState.DEFAULT));
        Step step = new Step(0, StepType.START, 1, states, Map.of(), List.of(), Map.of(), "explicación", null);

        states.put("B", ElementState.VISITED);

        assertThat(step.elementStates()).containsOnlyKeys("A");
        assertThatThrownBy(() -> step.elementStates().put("C", ElementState.CURRENT))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
