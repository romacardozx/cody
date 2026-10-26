package ar.edu.unsam.cody.service;

import ar.edu.unsam.cody.dto.ArrayDto;
import ar.edu.unsam.cody.dto.GraphDto;
import ar.edu.unsam.cody.dto.GraphDto.EdgeDto;
import ar.edu.unsam.cody.dto.GraphDto.NodeDto;
import ar.edu.unsam.cody.dto.ScenarioRequest;
import ar.edu.unsam.cody.exception.BusinessRuleException;
import ar.edu.unsam.cody.model.ScenarioType;
import java.util.HashSet;
import java.util.Set;

/**
 * Functional validations of a scenario (section 3.4 of the assignment). They run before saving so
 * algorithms never receive data that would make them fail, and every message is meant for the
 * user.
 *
 * <p>Complexity: O(V + E) for graphs and O(1) for arrays.
 */
final class ScenarioRules {

    static final int MIN_NODES = 2;
    static final int MAX_NODES = 26;
    static final int MAX_ARRAY_SIZE = 30;

    private ScenarioRules() {
    }

    /**
     * Checks that the request is consistent with its type and that its data makes sense.
     *
     * @param request the scenario to validate
     * @throws BusinessRuleException with a message for the user on the first rule broken
     */
    static void validate(ScenarioRequest request) {
        if (request.type() == ScenarioType.GRAPH) {
            if (request.graph() == null) {
                throw new BusinessRuleException("Un escenario de grafo necesita nodos y aristas.");
            }
            if (request.array() != null) {
                throw new BusinessRuleException("Un escenario de grafo no lleva arreglo.");
            }
            validateGraph(request.graph());
        } else {
            if (request.array() == null) {
                throw new BusinessRuleException("Un escenario de arreglo necesita valores.");
            }
            if (request.graph() != null) {
                throw new BusinessRuleException("Un escenario de arreglo no lleva grafo.");
            }
            validateArray(request.array());
        }
    }

    private static void validateGraph(GraphDto graph) {
        int size = graph.nodes().size();
        if (size < MIN_NODES || size > MAX_NODES) {
            throw new BusinessRuleException(
                    "El grafo necesita entre " + MIN_NODES + " y " + MAX_NODES + " nodos (tiene " + size + ").");
        }

        Set<String> ids = new HashSet<>();
        for (NodeDto node : graph.nodes()) {
            if (!ids.add(node.id())) {
                throw new BusinessRuleException("Hay dos nodos con el id " + node.id() + ".");
            }
        }

        Set<String> seenEdges = new HashSet<>();
        for (EdgeDto edge : graph.edges()) {
            if (!ids.contains(edge.from()) || !ids.contains(edge.to())) {
                throw new BusinessRuleException(
                        "La arista " + edge.from() + " → " + edge.to() + " usa un nodo que no existe.");
            }
            if (edge.from().equals(edge.to())) {
                throw new BusinessRuleException("La arista de " + edge.from() + " no puede volver al mismo nodo.");
            }
            if (edge.weight() < 0) {
                throw new BusinessRuleException(
                        "La arista " + edge.from() + " → " + edge.to() + " tiene peso negativo; usá pesos de 0 en adelante.");
            }
            String key = graph.directed() || edge.from().compareTo(edge.to()) < 0
                    ? edge.from() + "|" + edge.to()
                    : edge.to() + "|" + edge.from();
            if (!seenEdges.add(key)) {
                throw new BusinessRuleException("La arista " + edge.from() + " → " + edge.to() + " está repetida.");
            }
        }

        if (!ids.contains(graph.startNodeId())) {
            throw new BusinessRuleException("El nodo inicial " + graph.startNodeId() + " no existe en el grafo.");
        }
    }

    private static void validateArray(ArrayDto array) {
        if (array.values().size() > MAX_ARRAY_SIZE) {
            throw new BusinessRuleException("El arreglo puede tener hasta " + MAX_ARRAY_SIZE + " valores.");
        }
    }
}
