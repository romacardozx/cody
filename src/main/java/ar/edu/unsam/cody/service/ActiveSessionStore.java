package ar.edu.unsam.cody.service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Keeps the sessions in progress, in memory. It is its own component so both the session service
 * (which creates them) and the scenario service (which must not delete a scenario in use) can
 * share it without depending on each other.
 *
 * <p>Temporary: sessions will move to the database with the {@code Session} entity.
 */
@Component
public class ActiveSessionStore {

    private final Map<UUID, ActiveSession> sessions = new ConcurrentHashMap<>();

    void save(ActiveSession session) {
        sessions.put(session.id(), session);
    }

    Optional<ActiveSession> find(UUID id) {
        return Optional.ofNullable(sessions.get(id));
    }

    /**
     * Tells whether someone is still walking through a scenario.
     *
     * <p>Complexity: O(n), with n the sessions in memory.
     *
     * @param scenarioId the scenario
     * @return {@code true} if an unfinished session uses it
     */
    public boolean hasUnfinishedSessionFor(Long scenarioId) {
        return sessions.values().stream()
                .anyMatch(session -> session.scenarioId().equals(scenarioId) && !session.finished());
    }
}
