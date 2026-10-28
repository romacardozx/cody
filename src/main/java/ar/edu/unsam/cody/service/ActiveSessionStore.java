package ar.edu.unsam.cody.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Keeps the sessions in progress, in memory. It is its own component so both the session service
 * (which creates them) and the scenario service (which must not delete a scenario in use) can
 * share it without depending on each other.
 *
 * <p>Sessions nobody touched for {@link #DEFAULT_IDLE_LIMIT} are forgotten, so the map does not
 * grow forever with tabs people closed. Everything already answered is in the history (database).
 */
@Component
public class ActiveSessionStore {

    /** How long a session may sit idle before it is dropped. */
    static final Duration DEFAULT_IDLE_LIMIT = Duration.ofHours(1);

    private final Map<UUID, ActiveSession> sessions = new ConcurrentHashMap<>();
    private final Clock clock;
    private final Duration idleLimit;

    @Autowired
    public ActiveSessionStore() {
        this(Clock.systemUTC(), DEFAULT_IDLE_LIMIT);
    }

    ActiveSessionStore(Clock clock, Duration idleLimit) {
        this.clock = clock;
        this.idleLimit = idleLimit;
    }

    /**
     * Stores a new session and drops the idle ones.
     *
     * <p>Complexity: O(n), with n the sessions in memory (the cleanup).
     */
    void save(ActiveSession session) {
        Instant now = clock.instant();
        sessions.values().removeIf(existing -> existing.idleSince(now).compareTo(idleLimit) > 0);
        session.touch(now);
        sessions.put(session.id(), session);
    }

    /** Finds a session; finding it counts as activity. */
    Optional<ActiveSession> find(UUID id) {
        ActiveSession session = sessions.get(id);
        if (session != null) {
            session.touch(clock.instant());
        }
        return Optional.ofNullable(session);
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
