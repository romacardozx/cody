package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/** The engine is plain Java: it must not import Spring, JPA or the application layers. */
class EngineIsolationTest {

    private static final Path ENGINE_SOURCES = Path.of("src/main/java/ar/edu/unsam/cody/engine");

    private static final List<String> FORBIDDEN_IMPORTS = List.of(
            "import org.springframework",
            "import jakarta.persistence",
            "import lombok",
            "import ar.edu.unsam.cody.model",
            "import ar.edu.unsam.cody.service",
            "import ar.edu.unsam.cody.repository",
            "import ar.edu.unsam.cody.controller",
            "import ar.edu.unsam.cody.dto");

    @Test
    void engineSourcesDoNotImportFrameworkOrApplicationLayers() throws IOException {
        try (Stream<Path> files = Files.walk(ENGINE_SOURCES)) {
            List<String> violations = files
                    .filter(path -> path.toString().endsWith(".java"))
                    .flatMap(EngineIsolationTest::forbiddenImportsIn)
                    .toList();

            assertThat(violations).isEmpty();
        }
    }

    private static Stream<String> forbiddenImportsIn(Path file) {
        try {
            return Files.readAllLines(file).stream()
                    .map(String::strip)
                    .filter(line -> FORBIDDEN_IMPORTS.stream().anyMatch(line::startsWith))
                    .map(line -> file.getFileName() + ": " + line);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read " + file, e);
        }
    }
}
