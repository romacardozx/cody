package ar.edu.unsam.cody.dto;

import static org.assertj.core.api.Assertions.assertThat;

import ar.edu.unsam.cody.engine.Question;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.LongStream;
import org.junit.jupiter.api.Test;

class QuestionDtoTest {

    private static final Question QUESTION =
            new Question("q1", "¿Qué nodo sale?", List.of("A", "B", "C", "D"), "A", "Porque entró primero.", Map.of());

    @Test
    void keepsTheSameOptionsWithoutTheAnswer() {
        QuestionDto dto = QuestionDto.from(QUESTION, 42L);

        assertThat(dto.options()).containsExactlyInAnyOrder("A", "B", "C", "D");
        assertThat(dto.id()).isEqualTo("q1");
    }

    @Test
    void sameSessionSeedGivesTheSameOrder() {
        assertThat(QuestionDto.from(QUESTION, 7L).options()).isEqualTo(QuestionDto.from(QUESTION, 7L).options());
    }

    @Test
    void theCorrectAnswerIsNotAlwaysFirst() {
        Set<Integer> positions = new HashSet<>();
        LongStream.range(0, 200).forEach(seed -> positions.add(QuestionDto.from(QUESTION, seed).options().indexOf("A")));

        // Over many sessions the right option shows up in every position
        assertThat(positions).containsExactlyInAnyOrder(0, 1, 2, 3);
    }
}
