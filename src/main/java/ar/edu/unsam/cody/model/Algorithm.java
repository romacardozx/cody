package ar.edu.unsam.cody.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Catalog entry of an algorithm: what the user reads about it. Loaded by data.sql.
 *
 * <p>The pseudocode is not stored here: it lives next to the engine implementation, because trace
 * steps point to its line numbers and both must change together.
 */
@Entity
@Table(name = "algorithm")
@Getter
@Setter
@NoArgsConstructor
public class Algorithm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Same code the engine uses, for example {@code "BFS"}. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlgorithmFamily family;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "time_complexity", nullable = false, length = 40)
    private String timeComplexity;

    @Column(name = "space_complexity", nullable = false, length = 40)
    private String spaceComplexity;

    /** Position in the catalog listing. */
    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
