package com.pizza_store.backend.service;

import com.pizza_store.backend.model.Order;
import com.pizza_store.backend.model.OrderItem;
import com.pizza_store.backend.model.OrderStatus;
import com.pizza_store.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

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

    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (order.getStatus() == OrderStatus.DY || order.getStatus() == OrderStatus.CA) {
            throw new RuntimeException("Cannot update order status: order is already " +
                    (order.getStatus() == OrderStatus.DY ? "Delivered - Paid" : "Cancelled"));
        }
        order.setStatus(status);
        String currentUser = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        order.setModifiedBy(currentUser);
        return orderRepository.save(order);
    }
}