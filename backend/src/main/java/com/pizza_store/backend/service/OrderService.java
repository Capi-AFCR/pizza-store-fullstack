package com.pizza_store.backend.service;

import com.pizza_store.backend.model.*;
import com.pizza_store.backend.repository.OrderRepository;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public Order createOrder(Long userId, List<OrderItem> items) {
        double totalPrice = items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        String currentUser = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";

        Order order = new Order(userId, items, totalPrice, OrderStatus.PE);
        order.setCreatedBy(currentUser);
        order.setModifiedBy(currentUser);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
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

        // Validate status transitions
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
            throw new RuntimeException("Invalid status transition from " + order.getStatus() +
                    " to " + newStatus + " for role " + currentUserRole);
        }

        order.setStatus(newStatus);
        order.setModifiedBy(currentUserEmail);
        return orderRepository.save(order);
    }
}