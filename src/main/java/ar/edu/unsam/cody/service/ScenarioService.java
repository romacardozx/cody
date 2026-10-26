package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.ScenarioRequest;
import ar.edu.unsam.cody.dto.ScenarioResponse;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.exception.ResourceNotFoundException;
import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioEdge;
import ar.edu.unsam.cody.model.ScenarioNode;
import ar.edu.unsam.cody.model.ScenarioType;
import ar.edu.unsam.cody.repository.ScenarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scenario ABML (create, delete, update, list). Validates every scenario before saving it, so
 * the algorithms always receive consistent data.
 */
@Service
public class ScenarioService {

    private final ScenarioRepository scenarios;
    private final ActiveSessionStore activeSessions;

    public ScenarioService(ScenarioRepository scenarios, ActiveSessionStore activeSessions) {
        this.scenarios = scenarios;
        this.activeSessions = activeSessions;
    }

    /**
     * Lists scenarios by name, optionally of one type.
     *
     * <p>Complexity: O(n) over the stored scenarios (one query).
     *
     * @param type GRAPH, ARRAY or {@code null} for all
     * @return the scenarios, sorted by name
     */
    @Transactional(readOnly = true)
    public List<ScenarioResponse> list(ScenarioType type) {
        List<Scenario> found = type == null
                ? scenarios.findAllByOrderByNameAsc()
                : scenarios.findByTypeOrderByNameAsc(type);
        return found.stream().map(ScenarioResponse::from).toList();
    }

    /**
     * Gets one scenario.
     *
     * @param id the scenario id
     * @return the scenario
     * @throws ResourceNotFoundException if it does not exist
     */
    @Transactional(readOnly = true)
    public ScenarioResponse get(Long id) {
        return ScenarioResponse.from(findEntity(id));
    }

    /**
     * Creates a scenario.
     *
     * <p>Complexity: O(V + E) or O(n) to validate and copy, plus the inserts.
     *
     * @param request the new scenario
     * @return the saved scenario
     * @throws BusinessRuleException if a functional rule is broken or the name is taken
     */
    @Transactional
    public ScenarioResponse create(ScenarioRequest request) {
        ScenarioRules.validate(request);
        requireUniqueName(request.name(), null);
        Scenario scenario = new Scenario();
        apply(scenario, request);
        return ScenarioResponse.from(scenarios.save(scenario));
    }

    /**
     * Replaces the data of a scenario. Its type can change too.
     *
     * @param id      the scenario id
     * @param request the new data
     * @return the updated scenario
     * @throws ResourceNotFoundException if it does not exist
     * @throws BusinessRuleException     if a rule is broken, the name is taken or it is in use
     */
    @Transactional
    public ScenarioResponse update(Long id, ScenarioRequest request) {
        Scenario scenario = findEntity(id);
        requireNotInUse(id, "modificar");
        ScenarioRules.validate(request);
        requireUniqueName(request.name(), id);
        apply(scenario, request);
        return ScenarioResponse.from(scenarios.save(scenario));
    }

    /**
     * Deletes a scenario that nobody is using.
     *
     * @param id the scenario id
     * @throws ResourceNotFoundException if it does not exist
     * @throws BusinessRuleException     if a session in progress uses it
     */
    @Transactional
    public void delete(Long id) {
        Scenario scenario = findEntity(id);
        requireNotInUse(id, "borrar");
        scenarios.delete(scenario);
    }

    /**
     * Loads the entity for other services.
     *
     * @param id the scenario id
     * @return the entity
     * @throws ResourceNotFoundException if it does not exist
     */
    @Transactional(readOnly = true)
    public Scenario findEntity(Long id) {
        return scenarios.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el escenario " + id + "."));
    }

    private void requireUniqueName(String name, Long currentId) {
        scenarios.findByNameIgnoreCase(name.strip())
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("Ya existe un escenario llamado \"" + existing.getName() + "\".");
                });
    }

    private void requireNotInUse(Long id, String action) {
        if (activeSessions.hasUnfinishedSessionFor(id)) {
            throw new BusinessRuleException(
                    "No se puede " + action + " el escenario: hay una sesión en curso que lo usa.");
        }
    }

    /** Copies the request into the entity, clearing the data of the other type. */
    private static void apply(Scenario scenario, ScenarioRequest request) {
        scenario.setName(request.name().strip());
        scenario.setDescription(request.description() == null ? null : request.description().strip());
        scenario.setType(request.type());
        scenario.getNodes().clear();
        scenario.getEdges().clear();
        scenario.getArrayValues().clear();
        scenario.setStartNodeId(null);
        scenario.setDirected(false);
        scenario.setTarget(null);

        if (request.type() == ScenarioType.GRAPH) {
            request.graph().nodes().forEach(node ->
                    scenario.getNodes().add(new ScenarioNode(node.id(), node.label(), node.x(), node.y())));
            request.graph().edges().forEach(edge ->
                    scenario.getEdges().add(new ScenarioEdge(edge.from(), edge.to(), edge.weight())));
            scenario.setStartNodeId(request.graph().startNodeId());
            scenario.setDirected(request.graph().directed());
        } else {
            scenario.getArrayValues().addAll(request.array().values());
            scenario.setTarget(request.array().target());
        }
    }
}
