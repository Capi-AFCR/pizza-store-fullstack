package com.pizza_store.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/translations", "/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/refresh", "/ws/**").permitAll()
                        .requestMatchers("/api/users").hasAuthority("ROLE_A")
                        .requestMatchers("/api/users/clients").hasAnyAuthority("ROLE_A", "ROLE_W")
                        .requestMatchers("/api/users/email/**").hasAnyAuthority("ROLE_A", "ROLE_C", "ROLE_K", "ROLE_D", "ROLE_W")
                        .requestMatchers("/api/products").hasAnyAuthority("ROLE_A", "ROLE_C", "ROLE_K", "ROLE_D", "ROLE_W")
                        .requestMatchers("/api/products/**").hasAnyAuthority("ROLE_A", "ROLE_C", "ROLE_K", "ROLE_D", "ROLE_W")
                        .requestMatchers("/api/loyalty/**").hasAuthority("ROLE_C") // Restrict to ROLE_C
                        .requestMatchers("/api/ingredients/category/**").hasAnyAuthority("ROLE_A", "ROLE_C", "ROLE_W")
                        .requestMatchers("/api/orders").hasAnyAuthority("ROLE_A", "ROLE_C", "ROLE_W")
                        .requestMatchers("/api/orders/**").hasAnyAuthority("ROLE_A", "ROLE_C", "ROLE_W")
                        .requestMatchers("/api/orders/client").hasAuthority("ROLE_C")
                        .requestMatchers("/api/orders/kitchen").hasAuthority("ROLE_K")
                        .requestMatchers("/api/orders/delivery").hasAuthority("ROLE_D")
                        .requestMatchers("/api/orders/waiter").hasAuthority("ROLE_W")
                        .requestMatchers("/api/orders/analytics").hasAuthority("ROLE_A")
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        source.registerCorsConfiguration("/ws/**", configuration); // Explicitly for WebSocket
        return source;
    }
}