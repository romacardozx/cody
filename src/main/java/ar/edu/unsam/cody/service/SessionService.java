package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.GraphRequest;
import ar.edu.unsam.cody.dto.GraphRequest.EdgeRequest;
import ar.edu.unsam.cody.dto.GraphRequest.NodeRequest;
import ar.edu.unsam.cody.dto.PredictionRequest;
import ar.edu.unsam.cody.dto.PredictionResponse;
import ar.edu.unsam.cody.dto.SessionResponse;
import ar.edu.unsam.cody.dto.StartSessionRequest;
import ar.edu.unsam.cody.dto.StepDto;
import ar.edu.unsam.cody.engine.AlgorithmInput;
import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.Question;
import ar.edu.unsam.cody.engine.Trace;
import ar.edu.unsam.cody.engine.TraceableAlgorithm;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Runs algorithms and walks the user through their traces, question by question.
 *
 * <p>The full trace stays on the server. The client only receives steps up to the next pending
 * question, and answers are checked here, so the correct answer is never exposed in advance.
 *
 * <p>Sessions are kept in memory for now (they are lost on restart); they will move to the
 * database with the {@code Session} entity.
 */
@Service
public class SessionService {

    private static final int MIN_NODES = 2;

    private final AlgorithmRegistry algorithms;
    private final Map<UUID, ActiveSession> sessions = new ConcurrentHashMap<>();

    public SessionService(AlgorithmRegistry algorithms) {
        this.algorithms = algorithms;
    }

    /**
     * Starts a session: validates the scenario, runs the algorithm and returns the first steps.
     *
     * <p>Complexity: that of the algorithm (O(V + E) for BFS) plus O(V + E) for validation.
     *
     * @param request algorithm and scenario
     * @return the session id and the steps up to the first question
     * @throws ResourceNotFoundException if the algorithm does not exist
     * @throws BusinessRuleException     if the scenario breaks a functional rule
     */
    public SessionResponse start(StartSessionRequest request) {
        TraceableAlgorithm<?> algorithm = algorithms.get(request.algorithmCode());
        Trace trace = run(algorithm, inputFor(algorithm, request));

        ActiveSession session = new ActiveSession(UUID.randomUUID(), trace);
        sessions.put(session.id(), session);
        List<StepDto> steps = StepDto.fromAll(session.nextSteps());
        return new SessionResponse(session.id(), trace.algorithmCode(), trace.size(), steps, session.finished());
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
    public PredictionResponse answer(UUID sessionId, PredictionRequest request) {
        ActiveSession session = sessions.get(sessionId);
        if (session == null) {
            throw new ResourceNotFoundException("No existe la sesión " + sessionId + ".");
        }

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
        String explanation = correct
                ? "¡Correcto!"
                : "No era esa. La respuesta correcta es " + question.correctAnswer() + ".";
        return new PredictionResponse(correct, question.correctAnswer(), explanation, steps, session.finished(),
                session.correctCount(), session.wrongCount());
    }

    private AlgorithmInput inputFor(TraceableAlgorithm<?> algorithm, StartSessionRequest request) {
        if (algorithm.inputType() == GraphInput.class) {
            if (request.graph() == null) {
                throw new BusinessRuleException("El algoritmo " + algorithm.code() + " necesita un grafo.");
            }
            return toGraphInput(request.graph());
        }
        throw new BusinessRuleException("El algoritmo " + algorithm.code() + " todavía no se puede ejecutar.");
    }

    /** Functional validations of a graph (section 3.4), with messages for the user. */
    private static GraphInput toGraphInput(GraphRequest graph) {
        if (graph.nodes().size() < MIN_NODES) {
            throw new BusinessRuleException("El grafo necesita al menos " + MIN_NODES + " nodos.");
        }
        Set<String> ids = new HashSet<>();
        for (NodeRequest node : graph.nodes()) {
            if (!ids.add(node.id())) {
                throw new BusinessRuleException("Hay dos nodos con el id " + node.id() + ".");
            }
        }
        for (EdgeRequest edge : graph.edges()) {
            if (!ids.contains(edge.from()) || !ids.contains(edge.to())) {
                throw new BusinessRuleException("La arista " + edge.from() + " → " + edge.to()
                        + " usa un nodo que no existe.");
            }
        }
        if (!ids.contains(graph.startNodeId())) {
            throw new BusinessRuleException("El nodo inicial " + graph.startNodeId() + " no existe en el grafo.");
        }

        return new GraphInput(
                graph.nodes().stream().map(node -> new GraphInput.Node(node.id(), node.label())).toList(),
                graph.edges().stream().map(edge -> new GraphInput.Edge(edge.from(), edge.to(), edge.weight())).toList(),
                graph.startNodeId(),
                graph.directed());
    }

    /** Captures the wildcard so the input can be cast to the type the algorithm declares. */
    private static <I extends AlgorithmInput> Trace run(TraceableAlgorithm<I> algorithm, AlgorithmInput input) {
        return algorithm.run(algorithm.inputType().cast(input));
    }
}
