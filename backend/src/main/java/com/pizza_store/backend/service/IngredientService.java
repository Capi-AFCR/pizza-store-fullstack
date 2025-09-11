package com.pizza_store.backend.service;

import com.pizza_store.backend.model.Ingredient;
import com.pizza_store.backend.model.IngredientCategory;
import com.pizza_store.backend.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredientService {

    @Autowired
    private IngredientRepository ingredientRepository;

    public List<Ingredient> getActiveIngredientsByCategory(IngredientCategory category) {
        return ingredientRepository.findByCategoryAndIsActiveTrue(category);
    }
}