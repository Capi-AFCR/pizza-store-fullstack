package com.pizza_store.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class AuditingConfig {

    @Bean
    public org.springframework.data.domain.AuditorAware<String> auditorProvider() {
        return () -> {
            try {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                return java.util.Optional.ofNullable(username);
            } catch (Exception e) {
                return java.util.Optional.of("system"); // Fallback for unauthenticated actions
            }
        };
    }
}
