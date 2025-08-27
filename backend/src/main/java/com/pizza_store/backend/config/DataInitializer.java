package com.pizza_store.backend.config;

import com.pizza_store.backend.model.Role;
import com.pizza_store.backend.model.User;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Insert admin user
            User admin = new User(
                    "Admin User",
                    "admin@example.com",
                    passwordEncoder.encode("password"),
                    Role.A,
                    true
            );
            admin.setCreatedBy("system");
            admin.setModifiedBy("system");
            userRepository.save(admin);

            // Insert delivery user
            User delivery = new User(
                    "Delivery User",
                    "delivery@example.com",
                    passwordEncoder.encode("password"),
                    Role.D,
                    true
            );
            delivery.setCreatedBy("system");
            delivery.setModifiedBy("system");
            userRepository.save(delivery);

            // Insert waiter user
            User waiter = new User(
                    "Waiter User",
                    "waiter@example.com",
                    passwordEncoder.encode("password"),
                    Role.W,
                    true
            );
            waiter.setCreatedBy("system");
            waiter.setModifiedBy("system");
            userRepository.save(waiter);

            // Insert client user
            User client = new User(
                    "Client User",
                    "client@example.com",
                    passwordEncoder.encode("password"),
                    Role.C,
                    true
            );
            client.setCreatedBy("system");
            client.setModifiedBy("system");
            userRepository.save(client);
        }
    }
}