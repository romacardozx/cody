package ar.edu.unsam.cody;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Full stack against the real PostgreSQL (make test starts it): controllers, services, JPA and the
 * sample data loaded by data.sql. Each test runs in a transaction that is rolled back.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ScenarioApiIntegrationTest {

    private static final String NEW_GRAPH = """
            {"name": "Integración — cuadrado", "description": "Cuatro nodos en ciclo", "type": "GRAPH",
             "graph": {"nodes": [{"id": "A", "label": "A", "x": 0, "y": 0}, {"id": "B", "label": "B", "x": 100, "y": 0},
                                 {"id": "C", "label": "C", "x": 100, "y": 100}, {"id": "D", "label": "D", "x": 0, "y": 100}],
                       "edges": [{"from": "A", "to": "B", "weight": 1}, {"from": "B", "to": "C", "weight": 1},
                                 {"from": "C", "to": "D", "weight": 1}, {"from": "D", "to": "A", "weight": 1}],
                       "startNodeId": "A", "directed": false}}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void sampleDataIsLoaded() throws Exception {
        mockMvc.perform(get("/api/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(30)))
                .andExpect(jsonPath("$[?(@.code == 'BFS')].available", contains(true)))
                .andExpect(jsonPath("$[?(@.code == 'A_STAR')].family", contains("GRAPH")))
                .andExpect(jsonPath("$[?(@.code == 'LINEAR_SEARCH')].family", contains("SEARCHING")))
                .andExpect(jsonPath("$[?(@.code == 'AVL_TREE')].family", contains("DATA_STRUCTURE")))
                .andExpect(jsonPath("$[?(@.code == 'SLIDING_WINDOW')].family", contains("CONCEPT")))
                .andExpect(jsonPath("$[?(@.code == 'QUICK_SORT')].available", contains(false)));

        mockMvc.perform(get("/api/scenarios").param("type", "GRAPH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[*].name", hasItem("Árbol de tres niveles")));
    }

    @Test
    void createReadUpdateAndDeleteAScenario() throws Exception {
        String created = mockMvc.perform(post("/api/scenarios").contentType(MediaType.APPLICATION_JSON).content(NEW_GRAPH))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.graph.nodes[2].id").value("C"))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/scenarios/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Integración — cuadrado"))
                .andExpect(jsonPath("$.graph.edges", hasSize(4)));

        mockMvc.perform(put("/api/scenarios/{id}", id).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Integración — arreglo\", \"type\": \"ARRAY\", \"array\": {\"values\": [3, 1, 2]}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("ARRAY"))
                .andExpect(jsonPath("$.array.values[0]").value(3))
                .andExpect(jsonPath("$.graph").doesNotExist());

        mockMvc.perform(delete("/api/scenarios/{id}", id)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/scenarios/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    void duplicatedNameIsRejected() throws Exception {
        mockMvc.perform(post("/api/scenarios").contentType(MediaType.APPLICATION_JSON)
                        .content(NEW_GRAPH.replace("Integración — cuadrado", "rombo con cola")))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void predictionsAreStoredAndShowUpInTheHistory() throws Exception {
        String scenarios = mockMvc.perform(get("/api/scenarios").param("type", "GRAPH"))
                .andReturn().getResponse().getContentAsString();
        java.util.List<Integer> ids = JsonPath.read(scenarios, "$[?(@.name == 'Rombo con cola')].id");
        String learner = "it-" + java.util.UUID.randomUUID();

        String started = mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"algorithmCode\": \"BFS\", \"scenarioId\": " + ids.getFirst()
                                + ", \"learnerId\": \"" + learner + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String sessionId = JsonPath.read(started, "$.sessionId");
        String questionId = JsonPath.read(started, "$.steps[-1].question.id");

        mockMvc.perform(post("/api/sessions/{id}/predictions", sessionId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"questionId\": \"" + questionId + "\", \"answer\": \"C\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/sessions").param("learnerId", learner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].scenarioName").value("Rombo con cola"))
                .andExpect(jsonPath("$[0].wrongCount").value(1));
        mockMvc.perform(get("/api/sessions/{id}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictions[0].choice").value("C"))
                .andExpect(jsonPath("$.predictions[0].correctAnswer").value("B"))
                .andExpect(jsonPath("$.predictions[0].explanation").isNotEmpty());
    }

    @Test
    void bfsRunsOnASampleScenario() throws Exception {
        String scenarios = mockMvc.perform(get("/api/scenarios").param("type", "GRAPH"))
                .andReturn().getResponse().getContentAsString();
        java.util.List<Integer> ids = JsonPath.read(scenarios, "$[?(@.name == 'Árbol de tres niveles')].id");
        Integer treeId = ids.getFirst();

        mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"algorithmCode\": \"BFS\", \"scenarioId\": " + treeId + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.steps[-1].question.options", containsInAnyOrder("A", "B")));
    }
}
