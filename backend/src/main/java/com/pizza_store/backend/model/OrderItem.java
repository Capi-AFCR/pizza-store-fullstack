package com.pizza_store.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

@Embeddable
public class OrderItem {

    @Column(name = "product_id")
    private Long productId; //null for custom pizzas

    @Column
    private List<Integer> ingredients; // For custom pizzas

    @Column(nullable = false)
    @NotNull(message = "Quantity cannot be null")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @Column(nullable = false)
    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be positive")
    private Double price;

    // Constructors
    public OrderItem() {
    }

    public OrderItem(Long productId, List<Integer> ingredients, Integer quantity, Double price) {
        this.productId = productId;
        this.ingredients = ingredients;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and Setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public List<Integer> getIngredients() { return ingredients; }

    public void setIngredients(List<Integer> ingredients) { this.ingredients = ingredients; }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

}