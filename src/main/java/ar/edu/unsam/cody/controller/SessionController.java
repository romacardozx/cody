package ar.edu.unsam.cody.controller;

import ar.edu.unsam.cody.dto.PredictionRequest;
import ar.edu.unsam.cody.dto.PredictionResponse;
import ar.edu.unsam.cody.dto.SessionResponse;
import ar.edu.unsam.cody.dto.StartSessionRequest;
import ar.edu.unsam.cody.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Walking through an algorithm: start a session and answer its questions. */
@RestController
@RequestMapping("/api/sessions")
@Tag(name = "Sessions", description = "Recorrer un algoritmo prediciendo sus pasos")
public class SessionController {

    private static final String BFS_EXAMPLE = """
            {"algorithmCode": "BFS", "scenarioId": 1}
            """;

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    @Operation(summary = "Empezar una sesión",
            description = "Ejecuta el algoritmo sobre un escenario guardado y devuelve los pasos hasta la primera pregunta.")
    public ResponseEntity<SessionResponse> start(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(
                    examples = @ExampleObject(name = "BFS", value = BFS_EXAMPLE)))
            @Valid @RequestBody StartSessionRequest request) {
        SessionResponse session = sessionService.start(request);
        return ResponseEntity.created(URI.create("/api/sessions/" + session.sessionId())).body(session);
    }

    @PostMapping("/{sessionId}/predictions")
    @Operation(summary = "Responder la pregunta pendiente",
            description = "Valida la predicción y devuelve los pasos hasta la siguiente pregunta.")
    public ResponseEntity<PredictionResponse> answer(
            @PathVariable UUID sessionId, @Valid @RequestBody PredictionRequest request) {
        return ResponseEntity.ok(sessionService.answer(sessionId, request));
    }
}
