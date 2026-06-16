package com.example.receipeportal.controller;

import com.example.receipeportal.model.Recipe;
import com.example.receipeportal.repository.RecipeRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeRepository recipeRepository;

    public RecipeController(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }

    @GetMapping
    public List<Recipe> getAllRecipes(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return recipeRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrIngredientsContainingIgnoreCase(search, search, search);
        }
        return recipeRepository.findAll();
    }

    @PostMapping
    public Recipe createRecipe(@RequestBody Recipe recipe) {
        return recipeRepository.save(recipe);
    }
}