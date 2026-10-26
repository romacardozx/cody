package ar.edu.unsam.cody.engine;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * The full trace of one algorithm run.
 *
 * <p>The constructor enforces the contract invariants, so a broken algorithm fails fast in its
 * own tests instead of in the frontend:
 * <ol>
 *   <li>at least one step;</li>
 *   <li>each step's index matches its position;</li>
 *   <li>every step describes the same set of elements (complete snapshots);</li>
 *   <li>question ids are unique.</li>
 * </ol>
 *
 * @param algorithmCode code of the algorithm that produced it
 * @param steps         the steps, in order
 */
public record Trace(String algorithmCode, List<Step> steps) {

    public Trace {
        if (algorithmCode == null || algorithmCode.isBlank()) {
            throw new IllegalArgumentException("algorithmCode cannot be blank");
        }
        steps = List.copyOf(steps);
        if (steps.isEmpty()) {
            throw new IllegalArgumentException("A trace needs at least one step");
        }

        Set<String> elementIds = steps.getFirst().elementStates().keySet();
        Set<String> questionIds = new HashSet<>();
        for (int i = 0; i < steps.size(); i++) {
            Step step = steps.get(i);
            if (step.index() != i) {
                throw new IllegalArgumentException("Step at position " + i + " has index " + step.index());
            }
            if (!step.elementStates().keySet().equals(elementIds)) {
                throw new IllegalArgumentException("Step " + i + " is not a complete snapshot of the elements");
            }
            if (step.hasQuestion() && !questionIds.add(step.question().id())) {
                throw new IllegalArgumentException("Duplicated question id: " + step.question().id());
            }
        }
    }

    /**
     * Number of steps.
     *
     * @return the trace length
     */
    public int size() {
        return steps.size();
    }

    /**
     * Number of steps that ask the user something.
     *
     * @return how many questions the trace has
     */
    public long questionCount() {
        return steps.stream().filter(Step::hasQuestion).count();
    }

    /**
     * Steps the client may receive starting at {@code fromIndex}: up to and including the next
     * step with a question, or up to the end if there are no more questions. The client never gets
     * steps beyond an unanswered question, so it cannot peek at the answer.
     *
     * <p>Complexity: O(k), with k the number of returned steps.
     *
     * @param fromIndex index of the first step to send
     * @return the steps to send, never empty
     * @throws IndexOutOfBoundsException if {@code fromIndex} is not a valid step index
     */
    public List<Step> stepsUntilNextQuestion(int fromIndex) {
        Objects.checkIndex(fromIndex, steps.size());
        int end = fromIndex;
        while (end < steps.size() - 1 && !steps.get(end).hasQuestion()) {
            end++;
        }
        return steps.subList(fromIndex, end + 1);
    }

    /**
     * Finds the step that asks a given question.
     *
     * @param questionId id of the question
     * @return the step, or empty if no step asks that question
     */
    public Optional<Step> findQuestionStep(String questionId) {
        return steps.stream()
                .filter(step -> step.hasQuestion() && step.question().id().equals(questionId))
                .findFirst();
    }
}
