package com.pizza_store.backend.config;

import com.pizza_store.backend.model.*;
import com.pizza_store.backend.repository.OrderRepository;
import com.pizza_store.backend.repository.ProductRepository;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize users
        if (userRepository.count() == 0) {
            User admin = new User("Admin User", "admin@example.com", passwordEncoder.encode("password"), Role.A, true);
            admin.setCreatedBy("system");
            admin.setModifiedBy("system");
            userRepository.save(admin);

            User delivery = new User("Delivery User", "delivery@example.com", passwordEncoder.encode("password"), Role.D, true);
            delivery.setCreatedBy("system");
            delivery.setModifiedBy("system");
            userRepository.save(delivery);

            User waiter = new User("Waiter User", "waiter@example.com", passwordEncoder.encode("password"), Role.W, true);
            waiter.setCreatedBy("system");
            waiter.setModifiedBy("system");
            userRepository.save(waiter);

            User client = new User("Client User", "client@example.com", passwordEncoder.encode("password"), Role.C, true);
            client.setCreatedBy("system");
            client.setModifiedBy("system");
            userRepository.save(client);
        }

        // Initialize products
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Mozzarella Sticks", "Crispy breaded mozzarella", 6.99, ProductCategory.AP, true, "https://via.placeholder.com/150?text=Mozzarella+Sticks"));
            productRepository.save(new Product("Margherita Pizza", "Tomato, mozzarella, basil", 12.99, ProductCategory.MC, true, "https://via.placeholder.com/150?text=Margherita+Pizza"));
            productRepository.save(new Product("Garlic Bread", "Toasted bread with garlic butter", 5.99, ProductCategory.SD, true, "https://via.placeholder.com/150?text=Garlic+Bread"));
            productRepository.save(new Product("Cola", "Refreshing cola drink", 2.99, ProductCategory.DR, true, "https://via.placeholder.com/150?text=Cola"));
            productRepository.save(new Product("Chocolate Lava Cake", "Warm chocolate cake with molten center", 4.99, ProductCategory.DE, true, "https://via.placeholder.com/150?text=Chocolate+Lava+Cake"));
        }

        // Initialize orders
        if (orderRepository.count() == 0) {
            User client = userRepository.findByEmail("client@example.com").orElse(null);
            if (client != null) {
                Order order = new Order(
                        client.getId(),
                        Arrays.asList(
                                new OrderItem(1L, 2, 6.99), // 2 Mozzarella Sticks
                                new OrderItem(2L, 1, 12.99) // 1 Margherita Pizza
                        ),
                        6.99 * 2 + 12.99, // Total price
                        OrderStatus.PE
                );
                order.setCreatedBy("client@example.com");
                order.setModifiedBy("client@example.com");
                orderRepository.save(order);
            }
        }
    }
}