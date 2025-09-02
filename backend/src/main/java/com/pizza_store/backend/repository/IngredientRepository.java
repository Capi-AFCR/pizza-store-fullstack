package com.pizza_store.backend.repository;

import com.pizza_store.backend.model.Ingredient;
import com.pizza_store.backend.model.IngredientCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {
    List<Ingredient> findByCategoryAndIsActiveTrue(IngredientCategory category);
}