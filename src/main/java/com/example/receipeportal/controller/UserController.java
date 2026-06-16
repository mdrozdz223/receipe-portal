package com.example.receipeportal.controller;

import com.example.receipeportal.model.User;
import com.example.receipeportal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Błąd: Taki użytkownik już istnieje!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("ROLE_USER");
        }

        userRepository.save(user);
        return ResponseEntity.ok("Użytkownik dodany pomyślnie.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        User userToDelete = userRepository.findById(id).orElse(null);
        if (userToDelete == null) {
            return ResponseEntity.notFound().build();
        }
        if ("admin".equals(userToDelete.getUsername())) {
            return ResponseEntity.badRequest().body("Błąd: Nie można usunąć głównego konta administratora!");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Użytkownik został usunięty.");
    }
}