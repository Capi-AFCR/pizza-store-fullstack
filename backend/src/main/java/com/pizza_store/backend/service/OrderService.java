package com.pizza_store.backend.service;

import com.pizza_store.backend.model.*;
import com.pizza_store.backend.repository.OrderRepository;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (order.getStatus() == OrderStatus.DY || order.getStatus() == OrderStatus.CA) {
            throw new RuntimeException("Cannot update order status: order is already " +
                    (order.getStatus() == OrderStatus.DY ? "Delivered - Paid" : "Cancelled"));
        }
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        Role currentUserRole = userRepository.findByEmail(currentUserEmail)
                .map(User::getRole)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentUserEmail));
        boolean isValidTransition = false;
        switch (order.getStatus()) {
            case PE:
                if (newStatus == OrderStatus.CA && (currentUserRole == Role.A || currentUserRole == Role.W)) {
                    isValidTransition = true;
                } else if (newStatus == OrderStatus.AP && (currentUserRole == Role.A || currentUserRole == Role.K)) {
                    isValidTransition = true;
                }
                break;
            case AP:
                if ((newStatus == OrderStatus.CA || newStatus == OrderStatus.RE) &&
                        (currentUserRole == Role.A || currentUserRole == Role.K)) {
                    isValidTransition = true;
                }
                break;
            case RE:
                if ((newStatus == OrderStatus.OW && (currentUserRole == Role.A || currentUserRole == Role.D)) ||
                        (newStatus == OrderStatus.DN && (currentUserRole == Role.A || currentUserRole == Role.W))) {
                    isValidTransition = true;
                }
                break;
            case OW:
                if ((newStatus == OrderStatus.DY || newStatus == OrderStatus.CA) &&
                        (currentUserRole == Role.A || currentUserRole == Role.D)) {
                    isValidTransition = true;
                }
                break;
            case DN:
                if ((newStatus == OrderStatus.DY || newStatus == OrderStatus.CA) &&
                        (currentUserRole == Role.A || currentUserRole == Role.W)) {
                    isValidTransition = true;
                }
                break;
            default:
                throw new RuntimeException("Invalid current status: " + order.getStatus());
        }
        if (!isValidTransition) {
            throw new RuntimeException("Invalid status transition from " + order.getStatus() + " to " + newStatus + " for role " + currentUserRole);
        }
        order.setStatus(newStatus);
        order.setModifiedBy(currentUserEmail);
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