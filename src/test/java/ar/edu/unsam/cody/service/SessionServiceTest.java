package ar.edu.unsam.cody.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ar.edu.unsam.cody.dto.PredictionRequest;
import ar.edu.unsam.cody.dto.PredictionResponse;
import ar.edu.unsam.cody.dto.SessionResponse;
import ar.edu.unsam.cody.dto.StartSessionRequest;
import ar.edu.unsam.cody.dto.StepDto;
import ar.edu.unsam.cody.engine.graph.Bfs;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.repository.ScenarioRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SessionServiceTest {

    private static final long TRIANGLE = 1L;
    private static final long ARRAY = 2L;

    private ActiveSessionStore activeSessions;
    private SessionService service;

    @BeforeEach
    void setUp() {
        ScenarioRepository repository = mock(ScenarioRepository.class);
        when(repository.findById(TRIANGLE)).thenReturn(Optional.of(TestScenarios.triangleEntity(TRIANGLE)));
        when(repository.findById(ARRAY)).thenReturn(Optional.of(TestScenarios.arrayEntity(ARRAY)));
        when(repository.findById(99L)).thenReturn(Optional.empty());

        activeSessions = new ActiveSessionStore();
        ScenarioService scenarios = new ScenarioService(repository, activeSessions);
        service = new SessionService(new AlgorithmRegistry(List.of(new Bfs())), scenarios, activeSessions);
    }

    private SessionResponse startBfs() {
        return service.start(new StartSessionRequest("BFS", TRIANGLE));
    }

    @Test
    void startSendsStepsOnlyUpToTheFirstQuestion() {
        SessionResponse session = startBfs();

        assertThat(session.sessionId()).isNotNull();
        assertThat(session.scenarioId()).isEqualTo(TRIANGLE);
        assertThat(session.finished()).isFalse();
        StepDto last = session.steps().getLast();
        assertThat(last.question()).isNotNull();
        assertThat(session.steps().subList(0, session.steps().size() - 1))
                .allSatisfy(step -> assertThat(step.question()).isNull());
    }

    @Test
    void correctAnswerSendsTheRestOfTheTrace() {
        SessionResponse session = startBfs();
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
        SessionResponse session = startBfs();
        String questionId = session.steps().getLast().question().id();

        PredictionResponse response = service.answer(session.sessionId(), new PredictionRequest(questionId, "C"));

        assertThat(response.correct()).isFalse();
        assertThat(response.correctAnswer()).isEqualTo("B");
        assertThat(response.explanation()).contains("B");
        assertThat(response.wrongCount()).isEqualTo(1);
    }

    @Test
    void cannotAnswerTheSameQuestionTwice() {
        SessionResponse session = startBfs();
        String questionId = session.steps().getLast().question().id();
        service.answer(session.sessionId(), new PredictionRequest(questionId, "B"));

        assertThatThrownBy(() -> service.answer(session.sessionId(), new PredictionRequest(questionId, "B")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void answerMustBeOneOfTheOptions() {
        SessionResponse session = startBfs();
        String questionId = session.steps().getLast().question().id();

        assertThatThrownBy(() -> service.answer(session.sessionId(), new PredictionRequest(questionId, "Z")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void scenarioIsInUseUntilTheSessionFinishes() {
        SessionResponse session = startBfs();
        assertThat(activeSessions.hasUnfinishedSessionFor(TRIANGLE)).isTrue();

        service.answer(session.sessionId(), new PredictionRequest(session.steps().getLast().question().id(), "B"));

        assertThat(activeSessions.hasUnfinishedSessionFor(TRIANGLE)).isFalse();
    }

    @Test
    void unknownSessionIsNotFound() {
        assertThatThrownBy(() -> service.answer(UUID.randomUUID(), new PredictionRequest("q1", "B")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void unknownAlgorithmIsNotFound() {
        assertThatThrownBy(() -> service.start(new StartSessionRequest("QUICKSORT", TRIANGLE)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void unknownScenarioIsNotFound() {
        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", 99L)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void graphAlgorithmRejectsAnArrayScenario() {
        assertThatThrownBy(() -> service.start(new StartSessionRequest("BFS", ARRAY)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("grafo");
    }
}
