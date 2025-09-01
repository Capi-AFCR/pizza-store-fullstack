package com.pizza_store.backend.service;

import com.pizza_store.backend.model.User;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class LoyaltyService {

    @Autowired
    private UserRepository userRepository;

    private static final int POINTS_PER_DOLLAR = 10; // 1 point per $10
    private static final int POINTS_FOR_DISCOUNT = 10; // 10 points = $5 discount
    private static final double DISCOUNT_AMOUNT = 5.00; // $5 discount

    public void awardPoints(int userId, double orderTotal) {
        User user = userRepository.findById((long) userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        int pointsEarned = (int) (orderTotal / POINTS_PER_DOLLAR);
        user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
        user.setModifiedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        userRepository.save(user);
    }

    public double redeemPoints(int userId, int pointsToRedeem) {
        User user = userRepository.findById((long) userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        if (pointsToRedeem < POINTS_FOR_DISCOUNT) {
            throw new RuntimeException("Minimum " + POINTS_FOR_DISCOUNT + " points required to redeem");
        }
        if (user.getLoyaltyPoints() < pointsToRedeem) {
            throw new RuntimeException("Insufficient points: " + user.getLoyaltyPoints() + " available");
        }
        int discountCount = pointsToRedeem / POINTS_FOR_DISCOUNT;
        double discount = discountCount * DISCOUNT_AMOUNT;
        user.setLoyaltyPoints(user.getLoyaltyPoints() - pointsToRedeem);
        user.setModifiedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        userRepository.save(user);
        return discount;
    }

    public int getPointsBalance(int userId) {
        User user = userRepository.findById((long) userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return user.getLoyaltyPoints();
    }
}