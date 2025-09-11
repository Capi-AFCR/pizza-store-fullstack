package com.pizza_store.backend.controller;

import com.pizza_store.backend.service.LoyaltyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.pizza_store.backend.repository.UserRepository;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private static final Logger LOGGER = Logger.getLogger(LoyaltyController.class.getName());

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/points")
    public ResponseEntity<Integer> getPointsBalance() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Integer userId = Math.toIntExact(userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email))
                    .getId());
            LOGGER.info("Fetching loyalty points for user ID: " + userId);
            int points = loyaltyService.getPointsBalance(userId);
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            LOGGER.severe("Failed to fetch points: " + e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    @PostMapping("/redeem")
    public ResponseEntity<Double> redeemPoints(@RequestBody RedeemPointsRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Integer userId = Math.toIntExact(userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email))
                    .getId());
            LOGGER.info("Redeeming " + request.getPoints() + " points for user ID: " + userId);
            double discount = loyaltyService.redeemPoints(userId, request.getPoints());
            return ResponseEntity.ok(discount);
        } catch (Exception e) {
            LOGGER.severe("Failed to redeem points: " + e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }
}

class RedeemPointsRequest {
    private int points;

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}