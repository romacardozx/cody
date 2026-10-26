package ar.edu.unsam.cody.repository;

import ar.edu.unsam.cody.model.Scenario;
import ar.edu.unsam.cody.model.ScenarioType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Data access for scenarios. Queries are derived from the method names. */
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {

    List<Scenario> findAllByOrderByNameAsc();

    List<Scenario> findByTypeOrderByNameAsc(ScenarioType type);

    Optional<Scenario> findByNameIgnoreCase(String name);
}
