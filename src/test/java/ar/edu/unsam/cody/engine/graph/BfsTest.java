package ar.edu.unsam.cody.engine.graph;

import static org.assertj.core.api.Assertions.assertThat;

import ar.edu.unsam.cody.engine.ElementState;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.GraphInput.Edge;
import ar.edu.unsam.cody.engine.GraphInput.Node;
import ar.edu.unsam.cody.engine.Question;
import ar.edu.unsam.cody.engine.Step;
import ar.edu.unsam.cody.engine.StepType;
import ar.edu.unsam.cody.engine.Trace;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BfsTest {

    private final Bfs bfs = new Bfs();

    /**
     * A - B - D - E
     *  \     /
     *   - C -
     */
    private static GraphInput diamondWithTail() {
        return graph(List.of("A", "B", "C", "D", "E"),
                List.of(edge("A", "B"), edge("A", "C"), edge("B", "D"), edge("C", "D"), edge("D", "E")),
                "A", false);
    }

    @Test
    void codeMatchesTheCatalog() {
        assertThat(bfs.code()).isEqualTo("BFS");
    }

    @Test
    void visitsNodesInBreadthFirstOrder() {
        Trace trace = bfs.run(diamondWithTail());

        assertThat(dequeueOrder(trace)).containsExactly("A", "B", "C", "D", "E");
    }

    @Test
    void finalStepHoldsTheLevelOfEachNode() {
        Trace trace = bfs.run(diamondWithTail());

        Step last = trace.steps().getLast();
        assertThat(last.values()).containsExactlyInAnyOrderEntriesOf(
                Map.of("A", 0, "B", 1, "C", 1, "D", 2, "E", 3));
        assertThat(last.elementStates().values()).containsOnly(ElementState.VISITED);
    }

    @Test
    void traceStartsWithAllNodesUntouchedAndEndsWithFinish() {
        Trace trace = bfs.run(diamondWithTail());

        Step first = trace.steps().getFirst();
        assertThat(first.type()).isEqualTo(StepType.START);
        assertThat(first.elementStates().values()).containsOnly(ElementState.DEFAULT);
        assertThat(trace.steps().getLast().type()).isEqualTo(StepType.FINISH);
        assertThat(trace.algorithmCode()).isEqualTo("BFS");
    }

    @Test
    void asksWhichNodeLeavesTheQueueAndTheNextStepConfirmsIt() {
        Trace trace = bfs.run(diamondWithTail());

        List<Step> questionSteps = trace.steps().stream().filter(Step::hasQuestion).toList();
        // Queue with 2+ nodes before dequeuing B ([B, C]) and C ([C, D])
        assertThat(questionSteps).hasSize(2);

        for (Step step : questionSteps) {
            Question question = step.question();
            Step next = trace.steps().get(step.index() + 1);
            assertThat(next.type()).isEqualTo(StepType.DEQUEUE);
            assertThat(next.variables()).containsEntry("u", question.correctAnswer());
        }
    }

    @Test
    void questionOptionsAreTheQueuedNodesSortedSoTheOrderGivesNothingAway() {
        Trace trace = bfs.run(diamondWithTail());

        Question first = trace.steps().stream().filter(Step::hasQuestion).findFirst().orElseThrow().question();
        assertThat(first.options()).containsExactly("B", "C");
        assertThat(first.correctAnswer()).isEqualTo("B");
        assertThat(first.prompt()).isNotBlank();
    }

    @Test
    void questionStepDoesNotRevealTheAnswer() {
        Trace trace = bfs.run(diamondWithTail());

        trace.steps().stream().filter(Step::hasQuestion).forEach(step ->
                assertThat(step.elementStates().values()).doesNotContain(ElementState.CURRENT));
    }

    @Test
    void enqueuingHighlightsTheEdgeUsed() {
        Trace trace = bfs.run(diamondWithTail());

        Step enqueueB = trace.steps().stream()
                .filter(step -> step.type() == StepType.ENQUEUE && step.elementStates().get("B") == ElementState.FRONTIER)
                .findFirst().orElseThrow();
        assertThat(enqueueB.highlights()).containsExactly("A->B");
    }

    @Test
    void questionExplainsFifoAndWhyEachWrongOptionIsWrong() {
        Trace trace = bfs.run(diamondWithTail());

        Question first = trace.steps().stream().filter(Step::hasQuestion).findFirst().orElseThrow().question();
        assertThat(first.explanation()).contains("FIFO").contains("paso");
        assertThat(first.optionFeedback()).containsOnlyKeys("C");
        assertThat(first.feedbackFor("C")).contains("después");
    }

    @Test
    void explanationsNeverRevealTheQueueOrderBeforeAQuestion() {
        Trace trace = bfs.run(diamondWithTail());

        trace.steps().stream().filter(Step::hasQuestion).forEach(step -> {
            String others = String.join("|", step.question().options());
            assertThat(step.explanation()).doesNotContainPattern("(" + others + "), (" + others + ")");
        });
    }

    @Test
    void alreadyDiscoveredNeighborsAreSkippedWithAStep() {
        Trace trace = bfs.run(diamondWithTail());

        // D is reached from B first; when C looks at D it is already discovered
        Step skipD = trace.steps().stream()
                .filter(step -> step.type() == StepType.SKIP && "D".equals(step.variables().get("v")))
                .findFirst().orElseThrow();
        assertThat(skipD.variables()).containsEntry("u", "C");
        assertThat(skipD.explanation()).contains("ya estaba descubierto");
        // Skipping never enqueues twice: every node is dequeued exactly once
        assertThat(dequeueOrder(trace)).doesNotHaveDuplicates();
    }

    @Test
    void javaListingCoversEveryPseudocodeLine() {
        assertThat(Bfs.JAVA.lineForPseudocode()).hasSize(Bfs.PSEUDOCODE.size());
        assertThat(bfs.javaListing().lines().get(Bfs.JAVA.javaLineFor(5) - 1)).contains("queue.poll()");
        assertThat(bfs.javaListing().lines().get(Bfs.JAVA.javaLineFor(9) - 1)).contains("queue.add(v)");
    }

    @Test
    void directedGraphOnlyFollowsEdgesForward() {
        GraphInput directed = graph(List.of("A", "B", "C"), List.of(edge("B", "A"), edge("A", "C")), "A", true);

        Trace trace = bfs.run(directed);

        assertThat(dequeueOrder(trace)).containsExactly("A", "C");
        assertThat(trace.steps().getLast().elementStates()).containsEntry("B", ElementState.DEFAULT);
    }

    @Test
    void unreachableNodesStayUntouchedAndHaveNoLevel() {
        GraphInput disconnected = graph(List.of("A", "B", "Z"), List.of(edge("A", "B")), "A", false);

        Trace trace = bfs.run(disconnected);

        Step last = trace.steps().getLast();
        assertThat(last.elementStates()).containsEntry("Z", ElementState.DEFAULT);
        assertThat(last.values()).doesNotContainKey("Z");
        assertThat(last.explanation()).contains("Z");
    }

    @Test
    void singleNodeGraphHasNoQuestions() {
        Trace trace = bfs.run(graph(List.of("A"), List.of(), "A", false));

        assertThat(trace.questionCount()).isZero();
        assertThat(trace.steps()).extracting(Step::type).containsExactly(
                StepType.START, StepType.ENQUEUE, StepType.DEQUEUE, StepType.VISIT, StepType.FINISH);
    }

    @Test
    void sameInputAlwaysProducesTheSameTrace() {
        assertThat(bfs.run(diamondWithTail())).isEqualTo(bfs.run(diamondWithTail()));
    }

    @Test
    void codeLinesPointInsideThePseudocode() {
        Trace trace = bfs.run(diamondWithTail());

        assertThat(trace.steps()).allSatisfy(step ->
                assertThat(step.codeLine()).isBetween(1, Bfs.PSEUDOCODE.size()));
    }

    private static List<String> dequeueOrder(Trace trace) {
        return trace.steps().stream()
                .filter(step -> step.type() == StepType.DEQUEUE)
                .map(step -> step.variables().get("u"))
                .toList();
    }

    private static GraphInput graph(List<String> ids, List<Edge> edges, String start, boolean directed) {
        return new GraphInput(ids.stream().map(id -> new Node(id, id)).toList(), edges, start, directed);
    }

    private static Edge edge(String from, String to) {
        return new Edge(from, to, 1);
    }
}
