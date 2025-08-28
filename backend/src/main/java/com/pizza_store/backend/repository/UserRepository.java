package com.pizza_store.backend.repository;

import com.pizza_store.backend.model.Role;
import com.pizza_store.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    List<User> findByRole(Role role);
    List<User> findByActive(Boolean active);
}