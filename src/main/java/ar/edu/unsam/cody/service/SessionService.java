package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.PredictionRequest;
import ar.edu.unsam.cody.dto.PredictionResponse;
import ar.edu.unsam.cody.dto.SessionResponse;
import ar.edu.unsam.cody.dto.StartSessionRequest;
import ar.edu.unsam.cody.dto.StepDto;
import ar.edu.unsam.cody.engine.AlgorithmInput;
import ar.edu.unsam.cody.engine.ArrayInput;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.Question;
import ar.edu.unsam.cody.engine.Trace;
import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.dto.SessionDetailDto;
import ar.edu.unsam.cody.dto.SessionSummaryDto;
import ar.edu.unsam.cody.engine.Step;
import ar.edu.unsam.cody.model.LearningSession;
import ar.edu.unsam.cody.model.Prediction;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioNode;
import ar.edu.unsam.cody.repository.LearningSessionRepository;
import ar.edu.unsam.cody.model.ScenarioType;
import java.time.LocalDateTime;
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
 * <p>Progress lives in memory while the session is played; every session and prediction is also
 * stored in the database, which is what the history shows.
 */
@Service
public class SessionService {

    private final AlgorithmRegistry algorithms;
    private final ScenarioService scenarios;
    private final ActiveSessionStore activeSessions;
    private final LearningSessionRepository history;

    public SessionService(AlgorithmRegistry algorithms, ScenarioService scenarios, ActiveSessionStore activeSessions,
            LearningSessionRepository history) {
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
        Trace trace = run(algorithm, inputFor(algorithm, scenario));

        ActiveSession session = new ActiveSession(UUID.randomUUID(), scenario.getId(), trace, labelsOf(scenario));
        activeSessions.save(session);
        List<StepDto> steps = StepDto.fromAll(session.nextSteps());

        LearningSession record = new LearningSession();
        record.setId(session.id());
        record.setLearnerId(request.learnerId());
        record.setAlgorithmCode(trace.algorithmCode());
        record.setScenarioId(scenario.getId());
        record.setScenarioName(scenario.getName());
        record.setTotalSteps(trace.size());
        record.setStartedAt(LocalDateTime.now());
        record.setFinishedAt(session.finished() ? record.getStartedAt() : null);
        history.save(record);

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

        List<StepDto> steps = StepDto.fromAll(session.nextSteps());
        String choiceFeedback = correct ? null : question.feedbackFor(request.answer());
        record(session, question, request.answer(), correct, choiceFeedback);
        return new PredictionResponse(correct, question.correctAnswer(), question.explanation(), choiceFeedback, steps,
                session.finished(), session.correctCount(), session.wrongCount());
    }

    /**
     * Past sessions of a learner, newest first (at most 50).
     *
     * @param learnerId anonymous id of the browser
     * @return the session summaries
     */
    @Transactional(readOnly = true)
    public List<SessionSummaryDto> historyOf(String learnerId) {
        if (learnerId == null || learnerId.isBlank()) {
            throw new BusinessRuleException("Indicá de qué alumno querés el historial.");
        }
        return history.findTop50ByLearnerIdOrderByStartedAtDesc(learnerId).stream()
                .map(SessionSummaryDto::from)
                .toList();
    }

    /**
     * One past session with every prediction and its explanation.
     *
     * @param sessionId the session
     * @return the session and its predictions
     * @throws ResourceNotFoundException if it was never stored
     */
    @Transactional(readOnly = true)
    public SessionDetailDto detail(UUID sessionId) {
        return history.findWithPredictionsById(sessionId)
                .map(SessionDetailDto::from)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la sesión " + sessionId + "."));
    }

    /** Stores an answered question; texts use labels so the history reads well on its own. */
    private void record(ActiveSession session, Question question, String choice, boolean correct, String choiceFeedback) {
        history.findById(session.id()).ifPresent(record -> {
            Step step = session.trace().findQuestionStep(question.id()).orElseThrow();
            Prediction prediction = new Prediction();
            prediction.setQuestionId(question.id());
            prediction.setStepNumber(step.index() + 1);
            prediction.setStepType(step.type());
            prediction.setPrompt(question.prompt());
            prediction.setChoice(session.labelOf(choice));
            prediction.setCorrectAnswer(session.labelOf(question.correctAnswer()));
            prediction.setCorrect(correct);
            prediction.setExplanation(question.explanation());
            prediction.setChoiceFeedback(choiceFeedback);
            prediction.setAnsweredAt(LocalDateTime.now());
            record.addPrediction(prediction);
            if (session.finished()) {
                record.setFinishedAt(prediction.getAnsweredAt());
            }
        });
    }

    private static Map<String, String> labelsOf(Scenario scenario) {
        return scenario.getNodes().stream()
                .collect(Collectors.toMap(ScenarioNode::getNodeId, ScenarioNode::getLabel, (a, b) -> a));
    }

    /** Converts the scenario into the input the algorithm declares, checking that they fit. */
    private static AlgorithmInput inputFor(TraceableAlgorithm<?> algorithm, Scenario scenario) {
        if (algorithm.inputType() == GraphInput.class) {
            requireType(algorithm, scenario, ScenarioType.GRAPH, "un grafo");
            return new GraphInput(
                    scenario.getNodes().stream().map(node -> new GraphInput.Node(node.getNodeId(), node.getLabel())).toList(),
                    scenario.getEdges().stream()
                            .map(edge -> new GraphInput.Edge(edge.getFromNode(), edge.getToNode(), edge.getWeight()))
                            .toList(),
                    scenario.getStartNodeId(),
                    scenario.isDirected());
        }
        requireType(algorithm, scenario, ScenarioType.ARRAY, "un arreglo");
        return new ArrayInput(scenario.getArrayValues(), scenario.getTarget());
    }

    private static void requireType(TraceableAlgorithm<?> algorithm, Scenario scenario, ScenarioType expected,
            String description) {
        if (scenario.getType() != expected) {
            throw new BusinessRuleException("El algoritmo " + algorithm.code() + " necesita un escenario con "
                    + description + "; \"" + scenario.getName() + "\" no lo es.");
        }
    }

    /** Captures the wildcard so the input can be cast to the type the algorithm declares. */
    private static <I extends AlgorithmInput> Trace run(TraceableAlgorithm<I> algorithm, AlgorithmInput input) {
        return algorithm.run(algorithm.inputType().cast(input));
    }
}
