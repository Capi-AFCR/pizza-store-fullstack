package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Order;
import com.pizza_store.backend.model.OrderItem;
import com.pizza_store.backend.model.OrderStatus;
import com.pizza_store.backend.model.Product;
import com.pizza_store.backend.repository.ProductRepository;
import com.pizza_store.backend.repository.UserRepository;
import com.pizza_store.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger LOGGER = Logger.getLogger(OrderController.class.getName());

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            LOGGER.info("Creating order for user ID: " + orderRequest.getUserId());
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Long effectiveUserId = orderRequest.getUserId();
            if (effectiveUserId == null) {
                effectiveUserId = userRepository.findByEmail(currentUserEmail)
                        .map(user -> user.getId())
                        .orElseThrow(() -> new RuntimeException("User not found: " + currentUserEmail));
            }
            List<OrderItem> orderItems = orderRequest.getItems().stream()
                    .map(item -> {
                        Product product = productRepository.findById(item.getProductId())
                                .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
                        return new OrderItem(item.getProductId(), item.getQuantity(), product.getPrice());
                    })
                    .collect(Collectors.toList());
            Order order = orderService.createOrder(effectiveUserId, orderItems);
            return ResponseEntity.status(201).body(order);
        } catch (Exception e) {
            LOGGER.severe("Failed to create order: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to create order: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<Order>> getUserOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LOGGER.info("Fetching orders for user: " + email);
        Long userId = userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        LOGGER.info("Fetching all orders");
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        try {
            LOGGER.info("Updating order status for order ID: " + id);
            Order order = orderService.updateOrderStatus(id, request.getStatus());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            LOGGER.severe("Failed to update order status: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to update order status: " + e.getMessage());
        }
    }
}

class OrderRequest {
    private Long userId;
    private List<OrderItemRequest> items;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}

class OrderItemRequest {
    private Long productId;
    private Integer quantity;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

class UpdateOrderStatusRequest {
    private OrderStatus status;

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}