package ar.edu.unsam.cody.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** An edge of a graph scenario. Columns avoid "from"/"to", which are reserved words in SQL. */
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioEdge {

    @Column(name = "from_node", nullable = false, length = 20)
    private String fromNode;

    @Column(name = "to_node", nullable = false, length = 20)
    private String toNode;

    /** Non-negative weight; BFS ignores it. */
    @Column(name = "weight", nullable = false)
    private int weight;
}
