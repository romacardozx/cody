package ar.edu.unsam.cody.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ar.edu.unsam.cody.dto.ScenarioRequest;
import ar.edu.unsam.cody.dto.ScenarioResponse;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.ScenarioType;
import ar.edu.unsam.cody.service.ScenarioService;
import ar.edu.unsam.cody.service.TestScenarios;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ScenarioController.class)
class ScenarioControllerTest {

    private static final String GRAPH_BODY = """
            {"name": "Triángulo", "type": "GRAPH",
             "graph": {"nodes": [{"id": "A", "label": "A", "x": 0, "y": 0}, {"id": "B", "label": "B", "x": 1, "y": 1}],
                       "edges": [{"from": "A", "to": "B", "weight": 1}], "startNodeId": "A", "directed": false}}
            """;

    private static final ScenarioResponse SAVED = new ScenarioResponse(7L, "Triángulo", null, ScenarioType.GRAPH,
            TestScenarios.triangleGraph(), null, LocalDateTime.now(), LocalDateTime.now());

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ScenarioService scenarioService;

    @Test
    void listsScenariosFilteredByType() throws Exception {
        when(scenarioService.list(ScenarioType.GRAPH)).thenReturn(List.of(SAVED));

        mockMvc.perform(get("/api/scenarios").param("type", "GRAPH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(7))
                .andExpect(jsonPath("$[0].graph.nodes[0].id").value("A"));
    }

    @Test
    void unknownTypeFilterIsABadRequest() throws Exception {
        mockMvc.perform(get("/api/scenarios").param("type", "TREE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReturnsCreatedWithLocation() throws Exception {
        when(scenarioService.create(any(ScenarioRequest.class))).thenReturn(SAVED);

        mockMvc.perform(post("/api/scenarios").contentType(MediaType.APPLICATION_JSON).content(GRAPH_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/scenarios/7"))
                .andExpect(jsonPath("$.name").value("Triángulo"));
    }

    @Test
    void createValidatesTheShapeBeforeCallingTheService() throws Exception {
        mockMvc.perform(post("/api/scenarios").contentType(MediaType.APPLICATION_JSON).content("{\"name\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("El escenario necesita un nombre."))
                .andExpect(jsonPath("$.errors.type").isNotEmpty());
        verifyNoInteractions(scenarioService);
    }

    @Test
    void businessRuleFromTheServiceIsUnprocessableContent() throws Exception {
        when(scenarioService.create(any(ScenarioRequest.class)))
                .thenThrow(new BusinessRuleException("Ya existe un escenario llamado \"Triángulo\"."));

        mockMvc.perform(post("/api/scenarios").contentType(MediaType.APPLICATION_JSON).content(GRAPH_BODY))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("Ya existe un escenario llamado \"Triángulo\"."));
    }

    @Test
    void updateReturnsTheScenario() throws Exception {
        when(scenarioService.update(eq(7L), any(ScenarioRequest.class))).thenReturn(SAVED);

        mockMvc.perform(put("/api/scenarios/7").contentType(MediaType.APPLICATION_JSON).content(GRAPH_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }

    @Test
    void deleteReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/scenarios/7")).andExpect(status().isNoContent());
        verify(scenarioService).delete(7L);
    }

    @Test
    void missingScenarioIsNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("No existe el escenario 9.")).when(scenarioService).delete(9L);

        mockMvc.perform(delete("/api/scenarios/9"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("No existe el escenario 9."));
    }
}
