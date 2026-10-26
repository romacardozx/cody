package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class QuestionTest {

    @Test
    void acceptsAnswerThatIsOneOfTheOptions() {
        Question question = new Question("q1", "¿Qué nodo sale de la cola?", List.of("A", "B"), "B",
                "Porque entró primero.", Map.of("A", "A entró después."));

        assertThat(question.isCorrect("B")).isTrue();
        assertThat(question.isCorrect("A")).isFalse();
        assertThat(question.isCorrect(null)).isFalse();
    }

    @Test
    void givesFeedbackOnlyForWrongOptions() {
        Question question = new Question("q1", "prompt", List.of("A", "B"), "B", "why", Map.of("A", "A no."));

        assertThat(question.feedbackFor("A")).isEqualTo("A no.");
        assertThat(question.feedbackFor("B")).isNull();
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "B"), "B", "why", Map.of("B", "x")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "B"), "B", "why", Map.of("Z", "x")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankExplanation() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "B"), "B", " ", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsCorrectAnswerOutsideTheOptions() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "B"), "C", "why", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsFewerThanTwoOptions() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A"), "A", "why", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsDuplicatedOptions() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "A"), "A", "why", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankIdOrPrompt() {
        assertThatThrownBy(() -> new Question(" ", "prompt", List.of("A", "B"), "A", "why", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Question("q1", "", List.of("A", "B"), "A", "why", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void optionsCannotBeModifiedFromOutside() {
        List<String> options = new ArrayList<>(List.of("A", "B"));
        Question question = new Question("q1", "prompt", options, "A", "why", Map.of());

        options.add("C");

        assertThat(question.options()).containsExactly("A", "B");
        assertThatThrownBy(() -> question.options().add("D"))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
