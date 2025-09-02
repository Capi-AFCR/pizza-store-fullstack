package com.pizza_store.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.pizza_store.backend.model.Order;
import com.pizza_store.backend.repository.OrderRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders/analytics")
@PreAuthorize("hasAuthority('ROLE_A')")
public class OrderAnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrderAnalytics(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        try {
            LocalDate start = startDate != null ? LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE) : LocalDate.now();

            List<Order> orders = orderRepository.findByCreatedAtBetween(start.atStartOfDay(), end.atTime(23, 59, 59));

            // Calculate metrics
            long totalOrders = orders.size();
            double totalRevenue = orders.stream()
                    .flatMap(order -> order.getItems().stream())
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum();
            double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            long scheduledOrders = orders.stream().filter(order -> order.getScheduledAt() != null).count();
            long customPizzaOrders = orders.stream().filter(Order::isCustomPizza).count();

            // Status distribution
            Map<String, Long> statusCounts = orders.stream()
                    .collect(Collectors.groupingBy(
                            order -> order.getStatus().toString(),
                            Collectors.counting()
                    ));

            // Daily orders
            Map<String, Long> dailyOrders = orders.stream()
                    .collect(Collectors.groupingBy(
                            order -> order.getCreatedAt().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            // Daily scheduled orders
            Map<String, Long> dailyScheduledOrders = orders.stream()
                    .filter(order -> order.getScheduledAt() != null)
                    .collect(Collectors.groupingBy(
                            order -> order.getScheduledAt().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            // Daily custom pizza orders
            Map<String, Long> dailyCustomPizzaOrders = orders.stream()
                    .filter(Order::isCustomPizza)
                    .collect(Collectors.groupingBy(
                            order -> order.getCreatedAt().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalOrders", totalOrders);
            analytics.put("totalRevenue", totalRevenue);
            analytics.put("averageOrderValue", averageOrderValue);
            analytics.put("scheduledOrders", scheduledOrders);
            analytics.put("customPizzaOrders", customPizzaOrders);
            analytics.put("statusCounts", statusCounts);
            analytics.put("dailyOrders", dailyOrders);
            analytics.put("dailyScheduledOrders", dailyScheduledOrders);
            analytics.put("dailyCustomPizzaOrders", dailyCustomPizzaOrders);

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch analytics: " + e.getMessage()));
        }
    }
}