package ar.edu.unsam.cody.model;

import ar.edu.unsam.cody.engine.StepType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A question the user answered: what was asked, what they chose, what was right and why. Texts are
 * stored as they were shown, so the history reads the same even if explanations change later.
 * The step type will feed the adaptive mode (ask more where the user fails more).
 */
@Entity
@Table(name = "prediction")
@Getter
@Setter
@NoArgsConstructor
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private LearningSession session;

    @Column(name = "question_id", nullable = false, length = 20)
    private String questionId;

    /** Step number as the user sees it (starting at 1). */
    @Column(name = "step_number", nullable = false)
    private int stepNumber;

    /** Type of the step that asked, e.g. VISIT before a dequeue. */
    @Enumerated(EnumType.STRING)
    @Column(name = "step_type", nullable = false, length = 20)
    private StepType stepType;

    @Column(nullable = false, length = 200)
    private String prompt;

    @Column(nullable = false, length = 40)
    private String choice;

    @Column(name = "correct_answer", nullable = false, length = 40)
    private String correctAnswer;

    @Column(nullable = false)
    private boolean correct;

    @Column(nullable = false, length = 800)
    private String explanation;

    @Column(name = "choice_feedback", length = 600)
    private String choiceFeedback;

    @Column(name = "answered_at", nullable = false)
    private LocalDateTime answeredAt;
}
