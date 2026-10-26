package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.engine.Question;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.SplittableRandom;

/**
 * Public view of a question. It deliberately has no correct answer: that stays on the server.
 *
 * @param id      question id, sent back when answering
 * @param prompt  question text
 * @param options possible answers, in random order
 */
public record QuestionDto(String id, String prompt, List<String> options) {

    /**
     * Builds the public view with the options shuffled.
     *
     * <p>The engine keeps options in a fixed order (traces must be deterministic), and that order
     * could hint at the answer. Shuffling here with a seed tied to the session and the question
     * gives a different order in each session, but the same one if the step is sent again.
     *
     * @param question the engine question
     * @param seed     per-session seed
     * @return the question without its answer and with shuffled options
     */
    public static QuestionDto from(Question question, long seed) {
        List<String> options = new ArrayList<>(question.options());
        // SplittableRandom mixes its seed well, so nearby seeds still give unrelated orders
        Collections.shuffle(options, new SplittableRandom(seed ^ question.id().hashCode()));
        return new QuestionDto(question.id(), question.prompt(), List.copyOf(options));
    }
}
