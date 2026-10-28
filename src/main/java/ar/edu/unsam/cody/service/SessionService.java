package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.PredictionRequest;
import ar.edu.unsam.cody.dto.PredictionResponse;
import ar.edu.unsam.cody.dto.SessionResponse;
import ar.edu.unsam.cody.dto.StartSessionRequest;
import ar.edu.unsam.cody.dto.StepDto;
import ar.edu.unsam.cody.engine.AlgorithmInput;
import ar.edu.unsam.cody.engine.Question;
import ar.edu.unsam.cody.engine.Trace;
import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioNode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Runs algorithms on saved scenarios and walks the user through their traces, question by
 * question.
 *
 * <p>The full trace stays on the server. The client only receives steps up to the next pending
 * question, and answers are checked here, so the correct answer is never exposed in advance.
 *
 * <p>Progress lives in memory while the session is played ({@link ActiveSessionStore}); every
 * session and answer is also recorded by {@link LearningHistoryService}.
 */
@Service
public class SessionService {

    private final AlgorithmRegistry algorithms;
    private final ScenarioService scenarios;
    private final ActiveSessionStore activeSessions;
    private final LearningHistoryService history;

    public SessionService(AlgorithmRegistry algorithms, ScenarioService scenarios, ActiveSessionStore activeSessions,
            LearningHistoryService history) {
        this.algorithms = algorithms;
        this.scenarios = scenarios;
        this.activeSessions = activeSessions;
        this.history = history;
    }

    /**
     * Starts a session: loads the scenario, runs the algorithm and returns the first steps.
     *
     * <p>Complexity: that of the algorithm (O(V + E) for BFS) plus loading the scenario.
     *
     * @param request algorithm code, scenario id and optional learner id
     * @return the session id and the steps up to the first question
     * @throws ResourceNotFoundException if the algorithm or the scenario do not exist
     * @throws BusinessRuleException     if the scenario type does not fit the algorithm
     */
    @Transactional
    public SessionResponse start(StartSessionRequest request) {
        TraceableAlgorithm<?> algorithm = algorithms.get(request.algorithmCode());
        Scenario scenario = scenarios.findEntity(request.scenarioId());
        Trace trace = run(algorithm, ScenarioInputs.inputFor(algorithm, scenario));

        ActiveSession session = new ActiveSession(UUID.randomUUID(), scenario.getId(), trace, labelsOf(scenario));
        activeSessions.save(session);
        List<StepDto> steps = StepDto.fromAll(session.nextSteps(), shuffleSeed(session));
        history.sessionStarted(session, scenario, request.learnerId());

        return new SessionResponse(session.id(), trace.algorithmCode(), scenario.getId(), trace.size(), steps,
                session.finished());
    }

    /**
     * Checks the answer to the pending question and returns the next steps.
     *
     * <p>Complexity: O(k), with k the number of steps returned.
     *
     * @param sessionId the session
     * @param request   question id and chosen option
     * @return whether it was correct, the right answer and the following steps
     * @throws ResourceNotFoundException if the session does not exist
     * @throws BusinessRuleException     if there is no such pending question or the option is invalid
     */
    @Transactional
    public PredictionResponse answer(UUID sessionId, PredictionRequest request) {
        ActiveSession session = activeSessions.find(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la sesión " + sessionId + "."));

        boolean correct;
        Question question;
        synchronized (session) {
            question = session.pendingQuestion();
            if (question == null || !question.id().equals(request.questionId())) {
                throw new BusinessRuleException("Esa pregunta ya fue respondida o no es la que está pendiente.");
            }
            if (!question.options().contains(request.answer())) {
                throw new BusinessRuleException("La respuesta tiene que ser una de las opciones: "
                        + String.join(", ", question.options()) + ".");
            }
            correct = session.answer(request.answer());
        }

        List<StepDto> steps = StepDto.fromAll(session.nextSteps(), shuffleSeed(session));
        String choiceFeedback = correct ? null : question.feedbackFor(request.answer());
        history.questionAnswered(session, question, request.answer(), correct, choiceFeedback);
        return new PredictionResponse(correct, question.correctAnswer(), question.explanation(), choiceFeedback, steps,
                session.finished(), session.correctCount(), session.wrongCount());
    }

    /** Each session shows question options in its own random order (see QuestionDto). */
    private static long shuffleSeed(ActiveSession session) {
        return session.id().getLeastSignificantBits();
    }

    private static Map<String, String> labelsOf(Scenario scenario) {
        return scenario.getNodes().stream()
                .collect(Collectors.toMap(ScenarioNode::getNodeId, ScenarioNode::getLabel, (a, b) -> a));
    }

    /** Captures the wildcard so the input can be cast to the type the algorithm declares. */
    private static <I extends AlgorithmInput> Trace run(TraceableAlgorithm<I> algorithm, AlgorithmInput input) {
        return algorithm.run(algorithm.inputType().cast(input));
    }
}
