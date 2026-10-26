package ar.edu.unsam.cody.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Makes the browser revalidate the app's HTML on every visit, so a new build is seen right away
 * instead of an old cached index.html. Files under /assets have a content hash in their name and
 * can still be cached.
 */
@Component
public class NoCacheHtmlFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean page = !path.startsWith("/api") && !path.startsWith("/assets") && !path.startsWith("/swagger")
                && !path.startsWith("/v3/api-docs") && (path.endsWith("/") || path.endsWith(".html") || !path.contains("."));
        if (page) {
            response.setHeader("Cache-Control", "no-cache");
        }
        chain.doFilter(request, response);
    }
}
