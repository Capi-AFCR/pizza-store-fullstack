package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Order;
import com.pizza_store.backend.model.OrderStatusHistory;
import com.pizza_store.backend.repository.OrderRepository;
import com.pizza_store.backend.repository.OrderStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders/{id}/details")
public class OrderDetailsController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('A', 'C', 'K', 'D', 'W')")
    public ResponseEntity<Map<String, Object>> getOrderDetails(@PathVariable Long id) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + id));
            List<OrderStatusHistory> statusHistory = orderStatusHistoryRepository.findByOrderId(id);

            Map<String, Object> details = new HashMap<>();
            details.put("order", order);
            details.put("statusHistory", statusHistory);

            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Failed to fetch order details: " + e.getMessage()));
        }
    }
}