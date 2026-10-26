package ar.edu.unsam.cody.repository;

import ar.edu.unsam.cody.model.LearningSession;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/** Data access for the history of sessions and predictions. */
public interface LearningSessionRepository extends JpaRepository<LearningSession, UUID> {

    /** Sessions of one learner, newest first (summary only; predictions load lazily). */
    List<LearningSession> findTop50ByLearnerIdOrderByStartedAtDesc(String learnerId);

    /** One session with its predictions in a single query. */
    @EntityGraph(attributePaths = "predictions")
    Optional<LearningSession> findWithPredictionsById(UUID id);
}
