package ar.edu.unsam.cody.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ar.edu.unsam.cody.dto.GraphRequest;
import ar.edu.unsam.cody.dto.GraphRequest.EdgeRequest;
import ar.edu.unsam.cody.dto.GraphRequest.NodeRequest;
import ar.edu.unsam.cody.dto.PredictionRequest;
import ar.edu.unsam.cody.dto.PredictionResponse;
import ar.edu.unsam.cody.dto.SessionResponse;
import ar.edu.unsam.cody.dto.StartSessionRequest;
import ar.edu.unsam.cody.dto.StepDto;
import ar.edu.unsam.cody.engine.graph.Bfs;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SessionServiceTest {

    private final SessionService service = new SessionService(new AlgorithmRegistry(List.of(new Bfs())));

    /** A - B, A - C: before dequeuing B the queue is [B, C], so there is exactly one question. */
    private static StartSessionRequest bfsRequest() {
        GraphRequest graph = new GraphRequest(
                List.of(new NodeRequest("A", "A"), new NodeRequest("B", "B"), new NodeRequest("C", "C")),
                List.of(new EdgeRequest("A", "B", 1), new EdgeRequest("A", "C", 1)),
                "A", false);
        return new StartSessionRequest("BFS", graph);
    }

    @Test
    void startSendsStepsOnlyUpToTheFirstQuestion() {
        SessionResponse session = service.start(bfsRequest());

        assertThat(session.sessionId()).isNotNull();
        assertThat(session.finished()).isFalse();
        StepDto last = session.steps().getLast();
        assertThat(last.question()).isNotNull();
        assertThat(session.steps().subList(0, session.steps().size() - 1))
                .allSatisfy(step -> assertThat(step.question()).isNull());
    }

    @Test
    void correctAnswerSendsTheRestOfTheTrace() {
        SessionResponse session = service.start(bfsRequest());
        String questionId = session.steps().getLast().question().id();

        PredictionResponse response = service.answer(session.sessionId(), new PredictionRequest(questionId, "B"));

        assertThat(response.correct()).isTrue();
        assertThat(response.correctAnswer()).isEqualTo("B");
        assertThat(response.finished()).isTrue();
        assertThat(response.steps()).isNotEmpty();
        assertThat(response.correctCount()).isEqualTo(1);
        assertThat(response.wrongCount()).isZero();
    }

    @Test
    void wrongAnswerIsCountedAndRevealsTheCorrectOne() {
        SessionResponse session = service.start(bfsRequest());
        String questionId = session.steps().getLast().question().id();

        PredictionResponse response = service.answer(session.sessionId(), new PredictionRequest(questionId, "C"));

        assertThat(response.correct()).isFalse();
        assertThat(response.correctAnswer()).isEqualTo("B");
        assertThat(response.explanation()).contains("B");
        assertThat(response.wrongCount()).isEqualTo(1);
    }

    @Test
    void cannotAnswerTheSameQuestionTwice() {
        SessionResponse session = service.start(bfsRequest());
        String questionId = session.steps().getLast().question().id();
        service.answer(session.sessionId(), new PredictionRequest(questionId, "B"));

        assertThatThrownBy(() -> service.answer(session.sessionId(), new PredictionRequest(questionId, "B")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void answerMustBeOneOfTheOptions() {
        SessionResponse session = service.start(bfsRequest());
        String questionId = session.steps().getLast().question().id();

        assertThatThrownBy(() -> service.answer(session.sessionId(), new PredictionRequest(questionId, "Z")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void unknownSessionIsNotFound() {
        assertThatThrownBy(() -> service.answer(UUID.randomUUID(), new PredictionRequest("q1", "B")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void unknownAlgorithmIsNotFound() {
        StartSessionRequest request = new StartSessionRequest("QUICKSORT", bfsRequest().graph());

        assertThatThrownBy(() -> service.start(request)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void graphAlgorithmNeedsAGraph() {
        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", null)))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void graphNeedsAtLeastTwoNodes() {
        GraphRequest single = new GraphRequest(List.of(new NodeRequest("A", "A")), List.of(), "A", false);

        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", single)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("2 nodos");
    }

    @Test
    void edgesMustReferenceExistingNodes() {
        GraphRequest graph = new GraphRequest(
                List.of(new NodeRequest("A", "A"), new NodeRequest("B", "B")),
                List.of(new EdgeRequest("A", "Z", 1)), "A", false);

        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", graph)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Z");
    }

    @Test
    void nodeIdsMustBeUnique() {
        GraphRequest graph = new GraphRequest(
                List.of(new NodeRequest("A", "A"), new NodeRequest("A", "Otro")), List.of(), "A", false);

        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", graph)))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void startNodeMustExist() {
        GraphRequest graph = new GraphRequest(
                List.of(new NodeRequest("A", "A"), new NodeRequest("B", "B")), List.of(), "Z", false);

        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", graph)))
                .isInstanceOf(BusinessRuleException.class);
    }
}
