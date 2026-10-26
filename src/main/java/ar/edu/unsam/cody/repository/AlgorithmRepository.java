package ar.edu.unsam.cody.repository;

import ar.edu.unsam.cody.model.Algorithm;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Data access for the algorithm catalog. */
public interface AlgorithmRepository extends JpaRepository<Algorithm, Long> {

    List<Algorithm> findAllByOrderByDisplayOrderAsc();

    Optional<Algorithm> findByCode(String code);
}
