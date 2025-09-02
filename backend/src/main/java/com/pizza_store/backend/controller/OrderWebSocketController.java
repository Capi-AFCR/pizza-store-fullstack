package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class OrderWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendOrderUpdate(Order order) {
        messagingTemplate.convertAndSend("/topic/orders", order);
    }
}