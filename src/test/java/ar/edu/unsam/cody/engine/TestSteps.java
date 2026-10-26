package ar.edu.unsam.cody.engine;

import java.util.List;
import java.util.Map;

/** Small factory of valid steps and questions so contract tests stay short. */
final class TestSteps {

    private TestSteps() {
    }

    static Step step(int index, Question question) {
        return new Step(index, StepType.VISIT, 1,
                Map.of("A", ElementState.DEFAULT, "B", ElementState.DEFAULT),
                Map.of(), List.of(), Map.of(), "explicación", question);
    }

    static Question question(String id) {
        return new Question(id, "¿Qué nodo se visita ahora?", List.of("A", "B"), "A", "Porque sí.", Map.of());
    }
}
