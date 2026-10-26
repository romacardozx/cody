package ar.edu.unsam.cody.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Input data a user creates, edits and saves to run algorithms on: a graph (nodes with canvas
 * positions and edges) or an array of numbers.
 *
 * <p>Collections keep their order ({@code @OrderColumn}) because algorithms depend on it: BFS
 * explores neighbors in node order, and an array is meaningless without its order.
 */
@Entity
@Table(name = "scenario")
@Getter
@Setter
@NoArgsConstructor
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ScenarioType type;

    @ElementCollection
    @CollectionTable(name = "scenario_node", joinColumns = @JoinColumn(name = "scenario_id"))
    @OrderColumn(name = "item_order")
    private List<ScenarioNode> nodes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "scenario_edge", joinColumns = @JoinColumn(name = "scenario_id"))
    @OrderColumn(name = "item_order")
    private List<ScenarioEdge> edges = new ArrayList<>();

    /** Node where graph algorithms start; {@code null} for arrays. */
    @Column(name = "start_node_id", length = 20)
    private String startNodeId;

    @Column(nullable = false)
    private boolean directed;

    @ElementCollection
    @CollectionTable(name = "scenario_array_value", joinColumns = @JoinColumn(name = "scenario_id"))
    @OrderColumn(name = "item_order")
    @Column(name = "item_value", nullable = false)
    private List<Integer> arrayValues = new ArrayList<>();

    /** Value to look for (binary search); {@code null} when not searching. */
    private Integer target;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
