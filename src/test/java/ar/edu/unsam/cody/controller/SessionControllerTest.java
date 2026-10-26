package ar.edu.unsam.cody.controller;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ar.edu.unsam.cody.config.EngineConfig;
import ar.edu.unsam.cody.service.AlgorithmRegistry;
import ar.edu.unsam.cody.service.SessionService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SessionController.class)
@Import({SessionService.class, AlgorithmRegistry.class, EngineConfig.class})
class SessionControllerTest {

    private static final String BFS_SESSION = """
            {
              "algorithmCode": "BFS",
              "graph": {
                "nodes": [{"id": "A", "label": "A"}, {"id": "B", "label": "B"}, {"id": "C", "label": "C"}],
                "edges": [{"from": "A", "to": "B", "weight": 1}, {"from": "A", "to": "C", "weight": 1}],
                "startNodeId": "A",
                "directed": false
              }
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void startReturnsCreatedWithStepsUpToTheFirstQuestion() throws Exception {
        mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON).content(BFS_SESSION))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").isNotEmpty())
                .andExpect(jsonPath("$.algorithmCode").value("BFS"))
                .andExpect(jsonPath("$.finished").value(false))
                .andExpect(jsonPath("$.steps[-1].question.options[0]").value("B"));
    }

    @Test
    void correctAnswerNeverTravelsToTheClientBeforeAnswering() throws Exception {
        mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON).content(BFS_SESSION))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.steps[-1].question", not(hasKey("correctAnswer"))))
                .andExpect(jsonPath("$.steps[*].question", everyItem(not(hasKey("correctAnswer")))));
    }

    @Test
    void answeringReturnsTheResultAndTheNextSteps() throws Exception {
        String body = mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON).content(BFS_SESSION))
                .andReturn().getResponse().getContentAsString();
        String sessionId = JsonPath.read(body, "$.sessionId");
        String questionId = JsonPath.read(body, "$.steps[-1].question.id");

        mockMvc.perform(post("/api/sessions/{id}/predictions", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"questionId\": \"" + questionId + "\", \"answer\": \"C\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.correctAnswer").value("B"))
                .andExpect(jsonPath("$.finished").value(true));
    }

    @Test
    void invalidBodyReturnsBadRequestWithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON).content("{\"algorithmCode\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.algorithmCode").isNotEmpty());
    }

    @Test
    void businessRuleViolationReturnsUnprocessableEntityWithSpanishMessage() throws Exception {
        String singleNode = """
                {"algorithmCode": "BFS",
                 "graph": {"nodes": [{"id": "A", "label": "A"}], "edges": [], "startNodeId": "A", "directed": false}}
                """;

        mockMvc.perform(post("/api/sessions").contentType(MediaType.APPLICATION_JSON).content(singleNode))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("El grafo necesita al menos 2 nodos."));
    }

    @Test
    void unknownSessionReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/sessions/{id}/predictions", "00000000-0000-0000-0000-000000000000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"questionId\": \"q1\", \"answer\": \"B\"}"))
                .andExpect(status().isNotFound());
    }
}
