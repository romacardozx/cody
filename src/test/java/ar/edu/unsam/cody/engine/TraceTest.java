package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class TraceTest {

    @Test
    void rejectsEmptyTrace() {
        assertThatThrownBy(() -> new Trace("BFS", List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankAlgorithmCode() {
        assertThatThrownBy(() -> new Trace("", List.of(TestSteps.step(0, null))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsIndexesThatDoNotMatchTheirPosition() {
        assertThatThrownBy(() -> new Trace("BFS", List.of(TestSteps.step(0, null), TestSteps.step(2, null))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsStepsThatAreNotACompleteSnapshot() {
        Step first = TestSteps.step(0, null);
        Step missingElement = new Step(1, StepType.VISIT, 2,
                Map.of("A", ElementState.VISITED), Map.of(), List.of(), Map.of(), "explicación", null);

        assertThatThrownBy(() -> new Trace("BFS", List.of(first, missingElement)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsDuplicatedQuestionIds() {
        List<Step> steps = List.of(
                TestSteps.step(0, TestSteps.question("q1")),
                TestSteps.step(1, TestSteps.question("q1")));

        assertThatThrownBy(() -> new Trace("BFS", steps))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void countsQuestions() {
        Trace trace = new Trace("BFS", List.of(
                TestSteps.step(0, null),
                TestSteps.step(1, TestSteps.question("q1")),
                TestSteps.step(2, null),
                TestSteps.step(3, TestSteps.question("q2"))));

        assertThat(trace.questionCount()).isEqualTo(2);
        assertThat(trace.size()).isEqualTo(4);
    }

    @Test
    void stepsUntilNextQuestionStopsAtTheQuestionIncludingIt() {
        Trace trace = new Trace("BFS", List.of(
                TestSteps.step(0, null),
                TestSteps.step(1, TestSteps.question("q1")),
                TestSteps.step(2, null),
                TestSteps.step(3, TestSteps.question("q2")),
                TestSteps.step(4, null)));

        assertThat(trace.stepsUntilNextQuestion(0)).extracting(Step::index).containsExactly(0, 1);
        assertThat(trace.stepsUntilNextQuestion(2)).extracting(Step::index).containsExactly(2, 3);
        assertThat(trace.stepsUntilNextQuestion(4)).extracting(Step::index).containsExactly(4);
    }

    @Test
    void stepsUntilNextQuestionRejectsIndexOutOfRange() {
        Trace trace = new Trace("BFS", List.of(TestSteps.step(0, null)));

        assertThatThrownBy(() -> trace.stepsUntilNextQuestion(1))
                .isInstanceOf(IndexOutOfBoundsException.class);
        assertThatThrownBy(() -> trace.stepsUntilNextQuestion(-1))
                .isInstanceOf(IndexOutOfBoundsException.class);
    }

    @Test
    void findsQuestionById() {
        Question q1 = TestSteps.question("q1");
        Trace trace = new Trace("BFS", List.of(TestSteps.step(0, null), TestSteps.step(1, q1)));

        assertThat(trace.findQuestionStep("q1")).map(Step::index).contains(1);
        assertThat(trace.findQuestionStep("missing")).isEmpty();
    }
}
