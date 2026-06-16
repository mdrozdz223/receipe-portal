package com.example.receipeportal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "receipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tytuł nie może być pusty")
    @Size(min = 3, message = "Tytuł musi mieć minimum 3 znaki")
    private String title;

    @NotBlank(message = "Opis nie może być pusty")
    private String description;

    @NotBlank(message = "Składniki nie mogą być puste")
    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @NotBlank(message = "Instrukcje nie mogą być puste")
    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String image;

    public Recipe() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}