package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.SessionDetailDto;
import ar.edu.unsam.cody.dto.SessionSummaryDto;
import ar.edu.unsam.cody.engine.Question;
import ar.edu.unsam.cody.engine.Step;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.LearningSession;
import ar.edu.unsam.cody.model.Prediction;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.repository.LearningSessionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The history of what each learner played: it records sessions and answers as they happen and
 * reads them back. Texts are stored with labels, so the history reads well on its own.
 */
@Service
public class LearningHistoryService {

    private final LearningSessionRepository history;

    public LearningHistoryService(LearningSessionRepository history) {
        this.history = history;
    }

    /**
     * Records a session that just started.
     *
     * @param session   the session in progress
     * @param scenario  the scenario it runs on
     * @param learnerId anonymous id of the browser, may be null
     */
    @Transactional
    void sessionStarted(ActiveSession session, Scenario scenario, String learnerId) {
        LocalDateTime now = LocalDateTime.now();
        history.save(LearningSession.builder()
                .id(session.id())
                .learnerId(learnerId)
                .algorithmCode(session.trace().algorithmCode())
                .scenarioId(scenario.getId())
                .scenarioName(scenario.getName())
                .totalSteps(session.trace().size())
                .startedAt(now)
                .finishedAt(session.finished() ? now : null)
                .build());
    }

    /**
     * Records an answered question, and the end of the session when it was the last one.
     *
     * @param session        the session in progress
     * @param question       the question answered
     * @param choice         the option chosen
     * @param correct        whether it was right
     * @param choiceFeedback why the choice was wrong, or {@code null}
     */
    @Transactional
    void questionAnswered(ActiveSession session, Question question, String choice, boolean correct,
            String choiceFeedback) {
        history.findById(session.id()).ifPresent(record -> {
            Step step = session.trace().findQuestionStep(question.id()).orElseThrow();
            Prediction prediction = Prediction.builder()
                    .questionId(question.id())
                    .stepNumber(step.index() + 1)
                    .stepType(step.type())
                    .prompt(question.prompt())
                    .choice(session.labelOf(choice))
                    .correctAnswer(session.labelOf(question.correctAnswer()))
                    .correct(correct)
                    .explanation(question.explanation())
                    .choiceFeedback(choiceFeedback)
                    .answeredAt(LocalDateTime.now())
                    .build();
            record.addPrediction(prediction);
            if (session.finished()) {
                record.setFinishedAt(prediction.getAnsweredAt());
            }
        });
    }

    /**
     * Past sessions of a learner, newest first (at most 50).
     *
     * @param learnerId anonymous id of the browser
     * @return the session summaries
     * @throws BusinessRuleException if no learner is given
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
}
