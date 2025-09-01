package com.pizza_store.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Name cannot be empty")
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email must be valid")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Password cannot be empty")
    private String password;

    @Column(nullable = false)
    @NotNull(message = "Role cannot be null")
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    @NotNull(message = "Active status cannot be null")
    private Boolean active;

    @Column
    private String refreshToken;

    @Column
    private String resetToken;

    @Column(name = "loyalty_points", nullable = false)
    private int loyaltyPoints = 0;

    @Column(name = "created_by", nullable = false)
    @CreatedBy
    private String createdBy;

    @Column(name = "modified_by", nullable = false)
    @LastModifiedBy
    private String modifiedBy;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "modified_at", nullable = false)
    @LastModifiedDate
    private LocalDateTime modifiedAt;

    // Constructors
    public User() {
    }

    public User(String name, String email, String password, Role role, Boolean active) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.active = active;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public int getLoyaltyPoints() { return loyaltyPoints; }

    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getModifiedAt() {
        return modifiedAt;
    }

    public void setModifiedAt(LocalDateTime modifiedAt) {
        this.modifiedAt = modifiedAt;
    }

    public boolean isActive() {
        return this.getActive();
    }
}