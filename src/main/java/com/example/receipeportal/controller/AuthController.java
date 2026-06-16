package com.example.receipeportal.controller;

import com.example.receipeportal.model.User;
import com.example.receipeportal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Błąd: Taki użytkownik już istnieje!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setRole("ROLE_USER");

        userRepository.save(user);

        return ResponseEntity.ok("Rejestracja zakończona sukcesem!");
    }
}