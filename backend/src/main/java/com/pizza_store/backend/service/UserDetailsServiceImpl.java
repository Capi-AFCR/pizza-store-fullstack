package com.pizza_store.backend.service;

import com.pizza_store.backend.model.User;
import com.pizza_store.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.logging.Logger;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger LOGGER = Logger.getLogger(UserDetailsServiceImpl.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        LOGGER.info("Loading user by email: " + email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    LOGGER.severe("User not found with email: " + email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        String role = "ROLE_" + user.getRole();
        LOGGER.info("User found: " + user.getEmail() + ", active: " + user.getActive() + ", role: " + role);
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getActive() ? Collections.singletonList(new SimpleGrantedAuthority(role)) : Collections.emptyList()
        );
    }
}