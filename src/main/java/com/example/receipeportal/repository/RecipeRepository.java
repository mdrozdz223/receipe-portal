package com.example.receipeportal.repository;

import com.example.receipeportal.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    Page<Recipe> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrIngredientsContainingIgnoreCase(
            String title, String description, String ingredients, Pageable pageable);
}