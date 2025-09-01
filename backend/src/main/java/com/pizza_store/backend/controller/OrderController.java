package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Order;
import com.pizza_store.backend.model.OrderItem;
import com.pizza_store.backend.model.OrderStatus;
import com.pizza_store.backend.model.OrderStatusHistory;
import com.pizza_store.backend.model.Product;
import com.pizza_store.backend.repository.OrderStatusHistoryRepository;
import com.pizza_store.backend.repository.ProductRepository;
import com.pizza_store.backend.repository.UserRepository;
import com.pizza_store.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

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
            Order order = orderService.createOrder(effectiveUserId, orderItems, orderRequest.getLoyaltyPoints());
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(order.getId());
            history.setStatus(order.getStatus().name());
            history.setUpdatedAt(LocalDateTime.now());
            history.setUpdatedBy(currentUserEmail);
            orderStatusHistoryRepository.save(history);
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

    @GetMapping("/kitchen")
    public ResponseEntity<List<Order>> getKitchenOrders() {
        LOGGER.info("Fetching kitchen orders");
        return ResponseEntity.ok(orderService.getKitchenOrders());
    }

    @GetMapping("/delivery")
    public ResponseEntity<List<Order>> getDeliveryOrders() {
        LOGGER.info("Fetching delivery orders");
        return ResponseEntity.ok(orderService.getDeliveryOrders());
    }

    @GetMapping("/waiter")
    public ResponseEntity<List<Order>> getWaiterOrders() {
        LOGGER.info("Fetching waiter orders");
        return ResponseEntity.ok(orderService.getWaiterOrders());
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        LOGGER.info("Fetching all orders");
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            LOGGER.info("Updating order status for order ID: " + id + " by user: " + currentUserEmail);
            Order order = orderService.updateOrderStatus(id, request.getStatus());
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(id);
            history.setStatus(request.getStatus().name());
            history.setUpdatedAt(LocalDateTime.now());
            history.setUpdatedBy(currentUserEmail);
            orderStatusHistoryRepository.save(history);
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
    private int loyaltyPoints;

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

    public int getLoyaltyPoints() { return loyaltyPoints; }

    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
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