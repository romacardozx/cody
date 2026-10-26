package ar.edu.unsam.cody.engine;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Helper that algorithms use to build their {@link Trace} step by step.
 *
 * <p>It assigns step indexes and question ids, and lets an algorithm attach a question to the
 * step it already recorded. That matters because a question must be asked on the step BEFORE the
 * one that reveals the answer.
 */
public final class TraceRecorder {

    private final String algorithmCode;
    private final List<Step> steps = new ArrayList<>();
    private int questionCount;

    /**
     * Creates an empty recorder.
     *
     * @param algorithmCode code of the algorithm whose trace is being built
     */
    public TraceRecorder(String algorithmCode) {
        this.algorithmCode = algorithmCode;
    }

    /**
     * Appends a step. Collections are copied, so callers can keep mutating their own state.
     *
     * @param type          what happens in the step
     * @param codeLine      pseudocode line, starting at 1
     * @param elementStates state of every element
     * @param values        numbers shown on the elements
     * @param highlights    edges or elements to emphasize
     * @param variables     variables for the side panel
     * @param explanation   what happens, in Spanish
     */
    public void record(StepType type, int codeLine, Map<String, ElementState> elementStates,
            Map<String, Integer> values, List<String> highlights, Map<String, String> variables,
            String explanation) {
        steps.add(new Step(steps.size(), type, codeLine, elementStates, values, highlights, variables,
                explanation, null));
    }

    /**
     * Attaches a question to the last recorded step.
     *
     * @param prompt        question for the user, in Spanish
     * @param options       possible answers
     * @param correctAnswer the right option
     * @throws IllegalStateException if there is no step yet or the last one already has a question
     */
    public void askOnLastStep(String prompt, List<String> options, String correctAnswer) {
        if (steps.isEmpty()) {
            throw new IllegalStateException("Record a step before asking a question");
        }
        Step last = steps.getLast();
        if (last.hasQuestion()) {
            throw new IllegalStateException("Step " + last.index() + " already has a question");
        }
        questionCount++;
        Question question = new Question("q" + questionCount, prompt, options, correctAnswer);
        steps.set(last.index(), new Step(last.index(), last.type(), last.codeLine(), last.elementStates(),
                last.values(), last.highlights(), last.variables(), last.explanation(), question));
    }

    /**
     * Builds the trace. The {@link Trace} constructor validates the contract invariants.
     *
     * @return the finished trace
     */
    public Trace build() {
        return new Trace(algorithmCode, steps);
    }
}
