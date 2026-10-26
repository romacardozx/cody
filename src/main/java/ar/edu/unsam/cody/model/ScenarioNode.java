package ar.edu.unsam.cody.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** A node of a graph scenario, with its position on the canvas. */
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioNode {

    /** Stable id inside the scenario ("A", "B", ...); edges reference it. */
    @Column(name = "node_id", nullable = false, length = 20)
    private String nodeId;

    @Column(name = "label", nullable = false, length = 40)
    private String label;

    /** Horizontal position on the canvas, in canvas units. */
    @Column(name = "x", nullable = false)
    private double x;

    /** Vertical position on the canvas, in canvas units. */
    @Column(name = "y", nullable = false)
    private double y;
}
