package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Order;
import com.pizza_store.backend.model.OrderItem;
import com.pizza_store.backend.model.OrderStatus;
import com.pizza_store.backend.model.OrderStatusHistory;
import com.pizza_store.backend.repository.OrderStatusHistoryRepository;
import com.pizza_store.backend.repository.ProductRepository;
import com.pizza_store.backend.repository.UserRepository;
import com.pizza_store.backend.service.IngredientService;
import com.pizza_store.backend.service.LoyaltyService;
import com.pizza_store.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger LOGGER = Logger.getLogger(OrderController.class.getName());

    @Autowired
    private OrderService orderService;

    @Autowired
    private IngredientService ingredientService;

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            LOGGER.info("Creating order for user ID: " + orderRequest.getUserId());
            Order order = new Order();
            AtomicReference<Boolean> customPizza = new AtomicReference<>(false);
            order.setUserId((long) orderRequest.getUserId());
            List<OrderItem> orderItems = orderRequest.getItems();
            orderItems.forEach(orderItem -> {
                if (orderItem.getIngredients() != null && !orderItem.getIngredients().isEmpty()){
                    orderItem.setProductId(null);
                    customPizza.set(true);
                }
            });
            order.setItems(orderItems);
            double totalPrice = orderRequest.getItems().stream()
                    .mapToDouble(item -> item.getQuantity() * item.getPrice())
                    .sum();
            if (orderRequest.getLoyaltyPoints() > 0) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                Integer userId = Math.toIntExact(userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found: " + email))
                        .getId());
                double discount = loyaltyService.redeemPoints(userId, orderRequest.getLoyaltyPoints());
                totalPrice -= discount;
                if (totalPrice < 0) totalPrice = 0;
            }
            order.setTotalPrice(totalPrice);
            order.setStatus(OrderStatus.PE);
            if (orderRequest.getScheduledAt() != null) {
                order.setScheduledAt(LocalDateTime.parse(orderRequest.getScheduledAt()));
            }
            order.setCustomPizza(customPizza.get());
            Order createdOrder = orderService.createOrder(order);
            return ResponseEntity.status(201).body(createdOrder);
        } catch (Exception e) {
            LOGGER.severe("Failed to create order: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to create order: " + e.getMessage());
        }
    }

    @GetMapping("/client")
    public ResponseEntity<List<Order>> getClientOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LOGGER.info("Fetching orders for client: " + email);
        Long userId = userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        List<Order> ordersResponse = orderService.getClientOrders(userId);
        LOGGER.info("Fetched orders: " + ordersResponse);
        return ResponseEntity.ok(ordersResponse);
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

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            LOGGER.info("Updating order status for order ID: " + id + " by user: " + currentUserEmail);
            Order order = orderService.updateOrderStatus(id, request.getStatus());
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(id);
            history.setStatus(request.getStatus());
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
    private int userId;
    private List<OrderItem> items;
    private int loyaltyPoints;
    private String scheduledAt;

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }
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