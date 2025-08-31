package com.pizza_store.backend.controller;

import com.pizza_store.backend.model.Translation;
import com.pizza_store.backend.repository.TranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/translations")
public class TranslationController {

    private static final Logger LOGGER = Logger.getLogger(TranslationController.class.getName());

    @Autowired
    private TranslationRepository translationRepository;

    @GetMapping
    public ResponseEntity<List<Translation>> getTranslations(@RequestParam String language) {
        LOGGER.info("Fetching translations for language: " + language);
        List<Translation> translations = translationRepository.findByLanguage(language);
        return ResponseEntity.ok(translations);
    }
}