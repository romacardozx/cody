package ar.edu.unsam.cody.dto;

import java.util.List;
import java.util.UUID;

/**
 * A session that just started.
 *
 * @param sessionId     id to use when answering
 * @param algorithmCode the algorithm being walked through
 * @param totalSteps    length of the whole trace, so the player can show progress
 * @param steps         steps up to and including the first question (or the whole trace if none)
 * @param finished      {@code true} when there is nothing left to answer
 */
public record SessionResponse(
        UUID sessionId,
        String algorithmCode,
        int totalSteps,
        List<StepDto> steps,
        boolean finished) {
}
