package ar.edu.unsam.cody.controller;

import ar.edu.unsam.cody.dto.AlgorithmResponse;
import ar.edu.unsam.cody.service.AlgorithmCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only algorithm catalog. */
@RestController
@RequestMapping("/api/algorithms")
@Tag(name = "Algorithms", description = "Catálogo de algoritmos")
public class AlgorithmController {

    private final AlgorithmCatalogService catalogService;

    public AlgorithmController(AlgorithmCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    @Operation(summary = "Listar algoritmos", description = "Incluye los que todavía no están disponibles.")
    public ResponseEntity<List<AlgorithmResponse>> list() {
        return ResponseEntity.ok(catalogService.list());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Ver un algoritmo", description = "Con su pseudocódigo, si ya está disponible.")
    public ResponseEntity<AlgorithmResponse> get(@PathVariable String code) {
        return ResponseEntity.ok(catalogService.get(code));
    }
}
