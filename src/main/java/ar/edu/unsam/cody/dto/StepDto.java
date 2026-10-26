package ar.edu.unsam.cody.dto;

import ar.edu.unsam.cody.engine.ElementState;
import ar.edu.unsam.cody.engine.Step;
import ar.edu.unsam.cody.engine.StepType;
import java.util.List;
import java.util.Map;

/**
 * Public view of a trace step. Same data as {@link Step}, but the question is a
 * {@link QuestionDto} without the correct answer.
 *
 * @param index         position in the trace
 * @param type          what happens in the step
 * @param codeLine      pseudocode line to highlight
 * @param elementStates state of every element
 * @param values        numbers shown on the elements
 * @param highlights    edges or elements to emphasize
 * @param variables     variables for the side panel
 * @param explanation   what happens, in Spanish
 * @param question      question asked at this step, or {@code null}
 */
public record StepDto(
        int index,
        StepType type,
        int codeLine,
        Map<String, ElementState> elementStates,
        Map<String, Integer> values,
        List<String> highlights,
        Map<String, String> variables,
        String explanation,
        QuestionDto question) {

    /**
     * Builds the public view of a step.
     *
     * @param step the engine step
     * @param seed per-session seed used to shuffle question options
     * @return the step without the correct answer
     */
    public static StepDto from(Step step, long seed) {
        return new StepDto(step.index(), step.type(), step.codeLine(), step.elementStates(), step.values(),
                step.highlights(), step.variables(), step.explanation(),
                step.hasQuestion() ? QuestionDto.from(step.question(), seed) : null);
    }

    public static List<StepDto> fromAll(List<Step> steps, long seed) {
        return steps.stream().map(step -> from(step, seed)).toList();
    }
}
