package ar.edu.unsam.cody.engine;

/**
 * What happens in a step. Used to pick the animation and, later, to measure in which kind of step
 * each user makes more mistakes (adaptive mode).
 */
public enum StepType {
    /** Initial state, before the first operation. */
    START,
    /** A node is added to the frontier (queue or priority queue). */
    ENQUEUE,
    /** A node leaves the frontier and becomes the current one. */
    DEQUEUE,
    /** A node is marked as visited. */
    VISIT,
    /** Dijkstra tries to improve the distance of a neighbor. */
    RELAX,
    /** Two array elements are compared. */
    COMPARE,
    /** Two array elements swap places. */
    SWAP,
    /** An element reaches its final position in the sorted array. */
    MARK_SORTED,
    /** Binary search discards half of the range. */
    NARROW_RANGE,
    /** The searched value was found. */
    FOUND,
    /** The algorithm ended (with or without finding what it looked for). */
    FINISH
}
