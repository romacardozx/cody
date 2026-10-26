package ar.edu.unsam.cody.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Array of a scenario, used both in requests and responses.
 *
 * @param values the numbers, in order
 * @param target value to search for, or {@code null} when not searching
 */
public record ArrayDto(
        @NotEmpty(message = "El arreglo no puede estar vacío.") List<@NotNull(message = "El arreglo no puede tener huecos.") Integer> values,
        Integer target) {
}
