package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.model.LearningSession;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A past session in the history list.
 *
 * @param id            session id
 * @param algorithmCode algorithm walked through
 * @param scenarioName  scenario name at the time
 * @param startedAt     when it started
 * @param finishedAt    when it ended, or {@code null} if it was left halfway
 * @param totalSteps    length of the trace
 * @param correctCount  right predictions
 * @param wrongCount    wrong predictions
 */
public record SessionSummaryDto(
        UUID id,
        String algorithmCode,
        String scenarioName,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        int totalSteps,
        int correctCount,
        int wrongCount) {

    public static SessionSummaryDto from(LearningSession session) {
        return new SessionSummaryDto(session.getId(), session.getAlgorithmCode(), session.getScenarioName(),
                session.getStartedAt(), session.getFinishedAt(), session.getTotalSteps(), session.getCorrectCount(),
                session.getWrongCount());
    }
}
