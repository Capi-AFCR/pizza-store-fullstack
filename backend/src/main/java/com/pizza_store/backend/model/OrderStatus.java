package com.pizza_store.backend.model;

public enum OrderStatus {
    PE, // PENDING
    AP, // ACCEPTED - PREPARING
    RE, // READY
    OW, // ON THE WAY (APPLY FOR DELIVERIES)
    DN, // DELIVERED - NOT PAID (APPLY ON SITE),
    DY, // DELIVERED - PAID (FINAL STATUS)
    CA  // CANCELLED
}