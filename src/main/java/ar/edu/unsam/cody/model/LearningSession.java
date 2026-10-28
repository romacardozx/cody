package ar.edu.unsam.cody.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One walk of a user through an algorithm on a scenario, with its predictions. It is the
 * permanent record behind the history page; the trace itself is not stored because algorithms are
 * deterministic and can rebuild it.
 *
 * <p>The scenario is kept as a snapshot (id and name, no foreign key) so the history survives
 * if the scenario is later edited or deleted.
 */
@Entity
@Table(name = "learning_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE) // for the builder only
@Builder
public class LearningSession {

    /** Same id the API gives the client when the session starts. */
    @Id
    private UUID id;

    /** Anonymous id of the browser that played it (there is no login yet); may be null. */
    @Column(name = "learner_id", length = 64)
    private String learnerId;

    @Column(name = "algorithm_code", nullable = false, length = 30)
    private String algorithmCode;

    @Column(name = "scenario_id")
    private Long scenarioId;

    @Column(name = "scenario_name", nullable = false, length = 80)
    private String scenarioName;

    @Column(name = "total_steps", nullable = false)
    private int totalSteps;

    @Column(name = "correct_count", nullable = false)
    private int correctCount;

    @Column(name = "wrong_count", nullable = false)
    private int wrongCount;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    /** When the last step was sent; null while the session is in progress. */
    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    @Builder.Default
    private List<Prediction> predictions = new ArrayList<>();

    /**
     * Records an answered question and updates the score.
     *
     * @param prediction the answer to add
     */
    public void addPrediction(Prediction prediction) {
        prediction.setSession(this);
        predictions.add(prediction);
        if (prediction.isCorrect()) {
            correctCount++;
        } else {
            wrongCount++;
        }
    }
}
