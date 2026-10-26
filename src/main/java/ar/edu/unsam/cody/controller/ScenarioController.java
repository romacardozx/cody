package ar.edu.unsam.cody.controller;

import ar.edu.unsam.cody.dto.ScenarioRequest;
import ar.edu.unsam.cody.dto.ScenarioResponse;
import ar.edu.unsam.cody.model.ScenarioType;
import ar.edu.unsam.cody.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Scenario ABML: graphs and arrays that users create to run algorithms on. */
@RestController
@RequestMapping("/api/scenarios")
@Tag(name = "Scenarios", description = "Alta, baja, modificación y listado de escenarios")
public class ScenarioController {

    private static final String GRAPH_EXAMPLE = """
            {
              "name": "Mi triángulo",
              "description": "Tres nodos conectados",
              "type": "GRAPH",
              "graph": {
                "nodes": [
                  {"id": "A", "label": "A", "x": 100, "y": 100},
                  {"id": "B", "label": "B", "x": 300, "y": 100},
                  {"id": "C", "label": "C", "x": 200, "y": 260}
                ],
                "edges": [
                  {"from": "A", "to": "B", "weight": 1},
                  {"from": "B", "to": "C", "weight": 1},
                  {"from": "A", "to": "C", "weight": 1}
                ],
                "startNodeId": "A",
                "directed": false
              }
            }
            """;

    private static final String ARRAY_EXAMPLE = """
            {
              "name": "Mi arreglo",
              "type": "ARRAY",
              "array": {"values": [5, 1, 4, 2, 8], "target": null}
            }
            """;

    private final ScenarioService scenarioService;

    public ScenarioController(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @GetMapping
    @Operation(summary = "Listar escenarios", description = "Ordenados por nombre; se pueden filtrar por tipo.")
    public ResponseEntity<List<ScenarioResponse>> list(@RequestParam(required = false) ScenarioType type) {
        return ResponseEntity.ok(scenarioService.list(type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver un escenario")
    public ResponseEntity<ScenarioResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(scenarioService.get(id));
    }

    @PostMapping
    @Operation(summary = "Crear un escenario")
    public ResponseEntity<ScenarioResponse> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = {
                    @ExampleObject(name = "Grafo", value = GRAPH_EXAMPLE),
                    @ExampleObject(name = "Arreglo", value = ARRAY_EXAMPLE)}))
            @Valid @RequestBody ScenarioRequest request) {
        ScenarioResponse created = scenarioService.create(request);
        return ResponseEntity.created(URI.create("/api/scenarios/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar un escenario", description = "Reemplaza todos sus datos.")
    public ResponseEntity<ScenarioResponse> update(@PathVariable Long id, @Valid @RequestBody ScenarioRequest request) {
        return ResponseEntity.ok(scenarioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Borrar un escenario", description = "No se puede si hay una sesión en curso que lo usa.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scenarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
