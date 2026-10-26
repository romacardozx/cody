package ar.edu.unsam.cody.config;

import ar.edu.unsam.cody.engine.graph.Bfs;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers the engine algorithms as Spring beans.
 *
 * <p>The engine classes stay free of Spring annotations; this is the only place where they meet
 * the container. Adding an algorithm means adding a {@code @Bean} method here.
 */
@Configuration
public class EngineConfig {

    @Bean
    public Bfs bfs() {
        return new Bfs();
    }
}
