package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Product;
import com.pizza_store.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger LOGGER = Logger.getLogger(ProductController.class.getName());

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        LOGGER.info("Fetching all active products");
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            LOGGER.info("Creating product: " + product.getName());
            Product createdProduct = productService.createProduct(product);
            return ResponseEntity.status(201).body(createdProduct);
        } catch (Exception e) {
            LOGGER.severe("Failed to create product: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to create product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            LOGGER.info("Updating product ID: " + id);
            product.setId(id);
            Product updatedProduct = productService.updateProduct(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            LOGGER.severe("Failed to update product: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to update product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            LOGGER.info("Deleting product ID: " + id);
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (Exception e) {
            LOGGER.severe("Failed to delete product: " + e.getMessage());
            return ResponseEntity.status(400).body("Failed to delete product: " + e.getMessage());
        }
    }
}