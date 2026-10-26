package ar.edu.unsam.cody.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React app for its client-side routes. When the browser reloads a page like
 * {@code /algorithms/BFS}, the server has no such file: it forwards to index.html and the frontend
 * router takes over.
 */
@Controller
public class SpaForwardController {

    @GetMapping({"/algorithms", "/algorithms/{code}", "/scenarios", "/history", "/history/{id}", "/categories/{family}"})
    public String forwardToApp() {
        return "forward:/index.html";
    }
}
