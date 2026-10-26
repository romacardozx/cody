package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class QuestionTest {

    @Test
    void acceptsAnswerThatIsOneOfTheOptions() {
        Question question = new Question("q1", "¿Qué nodo sale de la cola?", List.of("A", "B"), "B");

        assertThat(question.isCorrect("B")).isTrue();
        assertThat(question.isCorrect("A")).isFalse();
        assertThat(question.isCorrect(null)).isFalse();
    }

    @Test
    void rejectsCorrectAnswerOutsideTheOptions() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "B"), "C"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsFewerThanTwoOptions() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A"), "A"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsDuplicatedOptions() {
        assertThatThrownBy(() -> new Question("q1", "prompt", List.of("A", "A"), "A"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankIdOrPrompt() {
        assertThatThrownBy(() -> new Question(" ", "prompt", List.of("A", "B"), "A"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Question("q1", "", List.of("A", "B"), "A"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void optionsCannotBeModifiedFromOutside() {
        List<String> options = new ArrayList<>(List.of("A", "B"));
        Question question = new Question("q1", "prompt", options, "A");

        options.add("C");

        assertThat(question.options()).containsExactly("A", "B");
        assertThatThrownBy(() -> question.options().add("D"))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
