package com.pizza_store.backend.controller;

import com.pizza_store.backend.config.JwtUtil;
import com.pizza_store.backend.model.Role;
import com.pizza_store.backend.model.User;
import com.pizza_store.backend.repository.UserRepository;
import com.pizza_store.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = Logger.getLogger(AuthController.class.getName());

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            LOGGER.info("Attempting registration for user: " + registerRequest.getEmail());
            User user = new User(
                    registerRequest.getName(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getRole(),
                    true
            );
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication() != null &&
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                            .stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_A"));
            User savedUser = userService.createUser(user, isAdmin);
            LOGGER.info("Registration successful for user: " + registerRequest.getEmail());
            return ResponseEntity.status(201).body("User registered successfully");
        } catch (Exception e) {
            LOGGER.severe("Registration failed: " + e.getMessage());
            return ResponseEntity.status(400).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LOGGER.info("Attempting login for user: " + loginRequest.getUsername());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String accessToken = jwtUtil.generateToken(userDetails.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken();

            // Save refresh token
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            LOGGER.info("Login successful for user: " + loginRequest.getUsername());
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, "ROLE_" + user.getRole()));
        } catch (AuthenticationException e) {
            LOGGER.severe("Login failed for user: " + loginRequest.getUsername() + ", error: " + e.getMessage());
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest refreshRequest) {
        try {
            LOGGER.info("Attempting token refresh for user: " + refreshRequest.getEmail());
            User user = userRepository.findByEmail(refreshRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getRefreshToken() != null && user.getRefreshToken().equals(refreshRequest.getRefreshToken())) {
                String accessToken = jwtUtil.generateToken(user.getEmail());
                String newRefreshToken = jwtUtil.generateRefreshToken();
                user.setRefreshToken(newRefreshToken);
                userRepository.save(user);
                LOGGER.info("Token refresh successful for user: " + refreshRequest.getEmail());
                return ResponseEntity.ok(new AuthResponse(accessToken, newRefreshToken, "ROLE_" + user.getRole()));
            } else {
                LOGGER.warning("Invalid refresh token for user: " + refreshRequest.getEmail());
                return ResponseEntity.status(401).body("Invalid refresh token");
            }
        } catch (RuntimeException e) {
            LOGGER.severe("Token refresh failed: " + e.getMessage());
            return ResponseEntity.status(401).body("Refresh failed: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            LOGGER.info("Processing forgot password for email: " + request.getEmail());
            String resetToken = userService.generateResetToken(request.getEmail());
            LOGGER.info("Reset token generated for email: " + request.getEmail());
            return ResponseEntity.ok("Password reset token generated: " + resetToken);
        } catch (Exception e) {
            LOGGER.severe("Forgot password failed: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to generate reset token: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            LOGGER.info("Processing password reset for token: " + request.getResetToken());
            userService.resetPassword(request.getResetToken(), request.getNewPassword());
            LOGGER.info("Password reset successful");
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            LOGGER.severe("Password reset failed: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to reset password: " + e.getMessage());
        }
    }
}

class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

class LoginRequest {
    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String role;

    public AuthResponse(String accessToken, String refreshToken, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getRole() {
        return role;
    }
}

class RefreshRequest {
    private String email;
    private String refreshToken;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}

class ForgotPasswordRequest {
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

class ResetPasswordRequest {
    private String resetToken;
    private String newPassword;

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}