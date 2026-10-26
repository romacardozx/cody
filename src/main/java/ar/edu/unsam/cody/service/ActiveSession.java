package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.engine.Question;
import ar.edu.unsam.cody.engine.Step;
import ar.edu.unsam.cody.engine.Trace;
import java.util.List;
import java.util.UUID;

/**
 * In-memory progress of a user through a trace: which steps were already sent, which question is
 * pending and the score so far. Methods are synchronized because the same session could receive
 * two requests at once (double click).
 *
 * <p>Temporary: it will be replaced by the {@code Session} JPA entity.
 */
final class ActiveSession {

    private final UUID id;
    private final Long scenarioId;
    private final Trace trace;
    private int nextIndex;
    private Question pendingQuestion;
    private int correctCount;
    private int wrongCount;

    ActiveSession(UUID id, Long scenarioId, Trace trace) {
        this.id = id;
        this.scenarioId = scenarioId;
        this.trace = trace;
    }

    UUID id() {
        return id;
    }

    Long scenarioId() {
        return scenarioId;
    }

    Trace trace() {
        return trace;
    }

    synchronized int correctCount() {
        return correctCount;
    }

    synchronized int wrongCount() {
        return wrongCount;
    }

    synchronized Question pendingQuestion() {
        return pendingQuestion;
    }

    /**
     * Steps the client may receive now, up to and including the next question.
     *
     * @return the steps, empty if the whole trace was already sent
     */
    synchronized List<Step> nextSteps() {
        if (nextIndex >= trace.size()) {
            return List.of();
        }
        List<Step> steps = trace.stepsUntilNextQuestion(nextIndex);
        Step last = steps.getLast();
        nextIndex = last.index() + 1;
        pendingQuestion = last.hasQuestion() ? last.question() : null;
        return steps;
    }

    /**
     * Records the answer to the pending question and clears it.
     *
     * @param answer the chosen option
     * @return whether it was correct
     */
    synchronized boolean answer(String answer) {
        boolean correct = pendingQuestion.isCorrect(answer);
        if (correct) {
            correctCount++;
        } else {
            wrongCount++;
        }
        pendingQuestion = null;
        return correct;
    }

    synchronized boolean finished() {
        return pendingQuestion == null && nextIndex >= trace.size();
    }
}
