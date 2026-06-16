package com.example.receipeportal.repository;

import com.example.receipeportal.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrIngredientsContainingIgnoreCase(String title, String description, String ingredients);
}