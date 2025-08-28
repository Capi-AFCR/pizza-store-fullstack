package com.pizza_store.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.logging.Logger;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = Logger.getLogger(JwtFilter.class.getName());

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        LOGGER.info("Processing request for: " + request.getRequestURI());

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                LOGGER.info("Extracted username from JWT: " + username);
            } catch (Exception e) {
                LOGGER.severe("Failed to extract username from JWT: " + e.getMessage());
            }
        } else {
            LOGGER.warning("No Bearer token found in Authorization header");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            try {
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    LOGGER.info("Successfully authenticated user: " + username + " with roles: " + userDetails.getAuthorities());
                } else {
                    LOGGER.warning("JWT validation failed for user: " + username);
                }
            } catch (Exception e) {
                LOGGER.severe("JWT validation error: " + e.getMessage());
            }
        } else if (username == null && jwt != null) {
            LOGGER.warning("No username extracted from JWT");
        }

        chain.doFilter(request, response);
    }
}