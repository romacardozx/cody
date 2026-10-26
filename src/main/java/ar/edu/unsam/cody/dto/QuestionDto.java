package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.engine.Question;
import java.util.List;

/**
 * Public view of a question. It deliberately has no correct answer: that stays on the server.
 *
 * @param id      question id, sent back when answering
 * @param prompt  question text
 * @param options possible answers
 */
public record QuestionDto(String id, String prompt, List<String> options) {

    public static QuestionDto from(Question question) {
        return new QuestionDto(question.id(), question.prompt(), question.options());
    }
}
