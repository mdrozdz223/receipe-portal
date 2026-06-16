package com.example.receipeportal.controller;

import com.example.receipeportal.model.User;
import com.example.receipeportal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        User userToDelete = userRepository.findById(id).orElse(null);

        if (userRepository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if ("admin".equals(userToDelete.getUsername())) {
            return ResponseEntity.badRequest().body("Błąd: Nie można usunąć głównego konta administratora!");
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("Użytkownik został usunięty.");
    }
}