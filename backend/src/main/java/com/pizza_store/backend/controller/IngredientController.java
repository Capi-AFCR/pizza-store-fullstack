package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Ingredient;
import com.pizza_store.backend.model.IngredientCategory;
import com.pizza_store.backend.service.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    @Autowired
    private IngredientService ingredientService;

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Ingredient>> getIngredientsByCategory(@PathVariable IngredientCategory category) {
        try {
            List<Ingredient> ingredients = ingredientService.getActiveIngredientsByCategory(category);
            return ResponseEntity.ok(ingredients);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }
}