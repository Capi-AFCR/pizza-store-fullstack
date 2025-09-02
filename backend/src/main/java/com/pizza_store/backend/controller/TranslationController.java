package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Translation;
import com.pizza_store.backend.repository.TranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/translations")
public class TranslationController {

    private static final Logger LOGGER = Logger.getLogger(TranslationController.class.getName());

    @Autowired
    private TranslationRepository translationRepository;

    @GetMapping
    @Cacheable(value = "translations", key = "#language")
    public ResponseEntity<List<Translation>> getTranslations(@RequestParam String language) {
        LOGGER.info("Fetching translations for language: " + language);
        List<Translation> translations = translationRepository.findByLanguage(language);
        return ResponseEntity.ok(translations);
    }

    @PostMapping
    @CacheEvict(value = "translations", key = "#translation.language")
    public ResponseEntity<Translation> saveTranslation(@RequestBody Translation translation) {
        try {
            LOGGER.info("Saving translation for key: " + translation.getKey() + ", language: " + translation.getLanguage());
            Translation savedTranslation = translationRepository.save(translation);
            return ResponseEntity.status(201).body(savedTranslation);
        } catch (Exception e) {
            LOGGER.severe("Failed to save translation: " + e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }
}