package ar.edu.unsam.cody.exception;

/**
 * The request is well formed but breaks a functional rule (section 3.4 of the assignment), for
 * example a graph with a single node. Mapped to HTTP 422. The message is shown to the user.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
