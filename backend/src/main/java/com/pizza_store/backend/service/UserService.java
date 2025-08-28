package com.pizza_store.backend.service;

import com.pizza_store.backend.model.Role;
import com.pizza_store.backend.model.User;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        String currentUser = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        user.setCreatedBy(currentUser);
        user.setModifiedBy(currentUser);
        return userRepository.save(user);
    }

    public User registerUser(String name, String email, String password, String role) {
        User user = new User(name, email, passwordEncoder.encode(password), Role.valueOf(role.replace("ROLE_", "")), true);
        String currentUser = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        user.setCreatedBy(currentUser);
        user.setModifiedBy(currentUser);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getClientUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.C)
                .collect(Collectors.toList());
    }

    public User updateUser(Long id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        user.setRole(updatedUser.getRole());
        user.setActive(updatedUser.isActive());
        user.setModifiedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setModifiedBy(email);
        userRepository.save(user);
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setModifiedBy(user.getEmail());
        userRepository.save(user);
    }
}