package com.pizza_store.backend.repository;

import com.pizza_store.backend.model.Translation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TranslationRepository extends JpaRepository<Translation, Long> {
    List<Translation> findByLanguage(String language);
}