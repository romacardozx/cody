package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.engine.StepType;
import ar.edu.unsam.cody.model.LearningSession;
import ar.edu.unsam.cody.model.Prediction;
import java.time.LocalDateTime;
import java.util.List;

/**
 * A past session with every prediction, to review mistakes later.
 *
 * @param summary     the session data
 * @param predictions the answered questions, in step order
 */
public record SessionDetailDto(SessionSummaryDto summary, List<PredictionDto> predictions) {

    /**
     * One answered question.
     *
     * @param stepNumber     step where it was asked (starting at 1)
     * @param stepType       type of that step
     * @param prompt         the question
     * @param choice         what the user chose
     * @param correctAnswer  the right option
     * @param correct        whether the user got it right
     * @param explanation    why the right option is right
     * @param choiceFeedback why the choice was wrong, or {@code null}
     * @param answeredAt     when it was answered
     */
    public record PredictionDto(
            int stepNumber,
            StepType stepType,
            String prompt,
            String choice,
            String correctAnswer,
            boolean correct,
            String explanation,
            String choiceFeedback,
            LocalDateTime answeredAt) {

        static PredictionDto from(Prediction prediction) {
            return new PredictionDto(prediction.getStepNumber(), prediction.getStepType(), prediction.getPrompt(),
                    prediction.getChoice(), prediction.getCorrectAnswer(), prediction.isCorrect(),
                    prediction.getExplanation(), prediction.getChoiceFeedback(), prediction.getAnsweredAt());
        }
    }

    public static SessionDetailDto from(LearningSession session) {
        return new SessionDetailDto(SessionSummaryDto.from(session),
                session.getPredictions().stream().map(PredictionDto::from).toList());
    }
}
