package com.example.receipeportal;

import com.example.receipeportal.model.Recipe;
import com.example.receipeportal.model.User;
import com.example.receipeportal.repository.RecipeRepository;
import com.example.receipeportal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ReceipePortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReceipePortalApplication.class, args);
    }

    @Bean
    public CommandLineRunner loadTestData(RecipeRepository recipeRepository,
                                          UserRepository userRepository,
                                          org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            if (recipeRepository.count() == 0) {
                Recipe recipe = new Recipe();
                recipe.setTitle("Spaghetti Bolognese");
                recipe.setDescription("Klasyczny włoski makaron z gęstym sosem mięsnym.");
                recipe.setIngredients("500g makaronu, 500g mięsa mielonego, pomidory, czosnek");
                recipe.setInstructions("1. Ugotuj makaron. 2. Zrób sos. 3. Wymieszaj.");
                recipeRepository.save(recipe);
            }

            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
                System.out.println("Utworzono konto administratora (login: admin, hasło: admin123)");
            }
        };
    }
}