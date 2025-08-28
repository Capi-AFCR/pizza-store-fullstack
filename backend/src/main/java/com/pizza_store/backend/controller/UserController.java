package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.User;
import com.pizza_store.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger LOGGER = Logger.getLogger(UserController.class.getName());

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        LOGGER.info("Fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/clients")
    public ResponseEntity<List<User>> getClientUsers() {
        LOGGER.info("Fetching client users");
        return ResponseEntity.ok(userService.getClientUsers());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            LOGGER.info("Creating user: " + user.getEmail());
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(201).body(createdUser);
        } catch (Exception e) {
            LOGGER.severe("Failed to create user: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to create user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            LOGGER.info("Updating user ID: " + id);
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            LOGGER.severe("Failed to update user: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            LOGGER.info("Deleting user ID: " + id);
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            LOGGER.severe("Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to delete user: " + e.getMessage());
        }
    }
}