package com.pizza_store.backend.service;

import com.pizza_store.backend.model.*;
import com.pizza_store.backend.repository.OrderRepository;
import com.pizza_store.backend.repository.OrderStatusHistoryRepository;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger LOGGER = Logger.getLogger(OrderService.class.getName());

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private IngredientService ingredientService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    private static final Map<String, List<String>> STATUS_TRANSITIONS = Map.of(
            "PE", List.of("AP","CA"),
            "AP", List.of("RE","CA"),
            "RE", List.of("OW","DN"),
            "OW", List.of("DY", "CA"),
            "DN", List.of("DY", "CA"),
            "DY", List.of(),
            "CA", List.of()
    );

    private static final Map<String, List<String>> ROLE_PERMISSIONS = Map.of(
            "ROLE_K", List.of("PE", "AP"),
            "ROLE_D", List.of("RE", "OW"),
            "ROLE_W", List.of("PE", "RE", "DN"),
            "ROLE_A", List.of("PE", "AP", "RE", "OW", "DN"),
            "ROLE_C", List.of("PE")
    );

    public Order createOrder(Order order) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        order.setCreatedBy(currentUser);
        order.setModifiedBy(currentUser);
        order.setCreatedAt(LocalDateTime.now());
        order.setModifiedAt(LocalDateTime.now());
        if (order.getScheduledAt() != null && order.getScheduledAt().isBefore(LocalDateTime.now().plusHours(1))) {
            throw new IllegalArgumentException("Scheduled time must be at least 1 hour in the future");
        }
        Order savedOrder = orderRepository.save(order);

        // Award loyalty points
        loyaltyService.awardPoints(Math.toIntExact(order.getUserId()), order.getTotalPrice());

        OrderStatusHistory history = new OrderStatusHistory(savedOrder.getId(), OrderStatus.PE, currentUser);
        orderStatusHistoryRepository.save(history);

        messagingTemplate.convertAndSend("/topic/orders/" + savedOrder.getId(),
                new OrderStatusUpdate(savedOrder.getId(), OrderStatus.PE.name(), LocalDateTime.now()));
        return savedOrder;
    }

    public List<Order> getClientOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getKitchenOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.PE || order.getStatus() == OrderStatus.AP)
                .collect(Collectors.toList());
    }

    public List<Order> getDeliveryOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.RE || order.getStatus() == OrderStatus.OW)
                .collect(Collectors.toList());
    }

    public List<Order> getWaiterOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.PE || order.getStatus() == OrderStatus.RE || order.getStatus() == OrderStatus.DN)
                .collect(Collectors.toList());
    }

    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .filter(auth -> auth.startsWith("ROLE_"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No role found for user"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));

        if (order.getStatus() == OrderStatus.DY || order.getStatus() == OrderStatus.CA) {
            throw new RuntimeException("Cannot update order status: order is already " +
                    (order.getStatus() == OrderStatus.DY ? "Delivered - Paid" : "Cancelled"));
        }

        if (!ROLE_PERMISSIONS.getOrDefault(role, List.of()).contains(order.getStatus().name())) {
            throw new IllegalStateException("User with role " + role + " cannot update order from status " + order.getStatus().name());
        }

        if (!STATUS_TRANSITIONS.getOrDefault(order.getStatus().name(), List.of()).contains(newStatus.name()) && !role.equals("ROLE_A")) {
            throw new IllegalArgumentException("Invalid status transition from " + order.getStatus().name() + " to " + newStatus.name());
        }

        order.setStatus(newStatus);
        order.setModifiedBy(currentUser);
        order.setModifiedAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);
        LOGGER.info("Order status updated: ID=" + id + ", status=" + newStatus);
        messagingTemplate.convertAndSend("/topic/orders/" + id,
                new OrderStatusUpdate(id, newStatus.name(), LocalDateTime.now()));
        return updatedOrder;
    }
}

class OrderStatusUpdate {
    private Long orderId;
    private String status;
    private LocalDateTime updatedAt;

    public OrderStatusUpdate(Long orderId, String status, LocalDateTime updatedAt) {
        this.orderId = orderId;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}