package ar.edu.unsam.cody.engine;

/** Visual state of a node or array element at a given step. The frontend maps each one to a style. */
public enum ElementState {
    /** Not touched yet. */
    DEFAULT,
    /** Waiting in the frontier (BFS queue, Dijkstra priority queue). */
    FRONTIER,
    /** The element the algorithm is working on right now. */
    CURRENT,
    /** Already processed. */
    VISITED,
    /** Being compared in this step. */
    COMPARING,
    /** Being swapped in this step. */
    SWAPPING,
    /** Already in its final sorted position. */
    SORTED,
    /** Out of the search range. */
    DISCARDED,
    /** The element that was searched for. */
    FOUND
}
