package ar.edu.unsam.cody.exception;

/** A requested resource does not exist. Mapped to HTTP 404. The message is shown to the user. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
