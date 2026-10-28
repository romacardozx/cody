package ar.edu.unsam.cody.engine;

import java.util.List;
import java.util.Objects;

/**
 * Holds what every algorithm declares but does not compute (its code, input type, pseudocode and
 * Java listing), so each implementation only writes {@link #run}. Subclasses pass their constants
 * to the constructor:
 *
 * <pre>{@code
 * public Bfs() {
 *     super(CODE, GraphInput.class, PSEUDOCODE, JAVA);
 * }
 * }</pre>
 *
 * @param <I> the kind of input the algorithm works on
 */
public abstract class AbstractTraceableAlgorithm<I extends AlgorithmInput> implements TraceableAlgorithm<I> {

    private final String code;
    private final Class<I> inputType;
    private final List<String> pseudocode;
    private final JavaListing javaListing;

    protected AbstractTraceableAlgorithm(String code, Class<I> inputType, List<String> pseudocode,
            JavaListing javaListing) {
        this.code = Objects.requireNonNull(code);
        this.inputType = Objects.requireNonNull(inputType);
        this.pseudocode = List.copyOf(pseudocode);
        this.javaListing = Objects.requireNonNull(javaListing);
    }

    @Override
    public final String code() {
        return code;
    }

    @Override
    public final Class<I> inputType() {
        return inputType;
    }

    @Override
    public final List<String> pseudocode() {
        return pseudocode;
    }

    @Override
    public final JavaListing javaListing() {
        return javaListing;
    }
}
