package ar.edu.unsam.cody.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Caching rules for the React app so a new build is seen on the next visit:
 * <ul>
 *   <li>Pages (index.html and the client routes) are never reused without asking the server.</li>
 *   <li>Files under /assets have a content hash in their name: a new build means new names, so
 *       they can be cached for a year.</li>
 * </ul>
 * Last-Modified is disabled in application.properties because the jar dates every file in 1980.
 */
@Component
public class StaticCacheFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith("/assets/")) {
            response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (isPage(path)) {
            response.setHeader("Cache-Control", "no-store");
        }
        chain.doFilter(request, response);
    }

    private static boolean isPage(String path) {
        boolean backend = path.startsWith("/api") || path.startsWith("/swagger") || path.startsWith("/v3/api-docs");
        return !backend && (path.endsWith("/") || path.endsWith(".html") || !path.contains("."));
    }
}
