package ar.edu.unsam.cody.service;

import static org.assertj.core.api.Assertions.assertThat;

import ar.edu.unsam.cody.engine.GraphInput;
import ar.edu.unsam.cody.engine.Trace;
import ar.edu.unsam.cody.engine.graph.Bfs;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ActiveSessionStoreTest {

    private static final Duration IDLE_LIMIT = Duration.ofMinutes(60);

    /** A clock the test moves by hand. */
    private static final class ManualClock extends Clock {
        private Instant now = Instant.parse("2026-10-28T10:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }

    private final ManualClock clock = new ManualClock();
    private final ActiveSessionStore store = new ActiveSessionStore(clock, IDLE_LIMIT);

    private static ActiveSession newSession() {
        GraphInput triangle = new GraphInput(
                List.of(new GraphInput.Node("A", "A"), new GraphInput.Node("B", "B"), new GraphInput.Node("C", "C")),
                List.of(new GraphInput.Edge("A", "B", 1), new GraphInput.Edge("A", "C", 1)),
                "A", false);
        Trace trace = new Bfs().run(triangle);
        return new ActiveSession(UUID.randomUUID(), 1L, trace, Map.of());
    }

    @Test
    void forgetsSessionsIdleForLongerThanTheLimit() {
        ActiveSession abandoned = newSession();
        store.save(abandoned);

        clock.advance(IDLE_LIMIT.plusMinutes(1));
        store.save(newSession()); // any new session triggers the cleanup

        assertThat(store.find(abandoned.id())).isEmpty();
        assertThat(store.hasUnfinishedSessionFor(1L)).isTrue(); // only the new one is left
    }

    @Test
    void keepsSessionsInUse() {
        ActiveSession playing = newSession();
        store.save(playing);

        clock.advance(IDLE_LIMIT.minusMinutes(5));
        assertThat(store.find(playing.id())).isPresent(); // looking it up counts as activity
        clock.advance(Duration.ofMinutes(30));
        store.save(newSession());

        assertThat(store.find(playing.id())).isPresent();
    }
}
