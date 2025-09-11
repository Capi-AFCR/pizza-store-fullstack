package com.pizza_store.backend.repository;

import com.pizza_store.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByCreatedAtBetween(LocalDateTime localDateTime, LocalDateTime localDateTime1);
}