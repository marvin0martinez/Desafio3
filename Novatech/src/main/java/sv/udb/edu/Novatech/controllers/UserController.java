package sv.udb.edu.Novatech.controllers;

import sv.udb.edu.Novatech.entities.User;
import sv.udb.edu.Novatech.repositories.UserRepository;
import sv.udb.edu.Novatech.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(
            @RequestHeader("Authorization") String authorizationHeader) {

        String token = authorizationHeader.substring(7);
        String userEmail = jwtService.extractUsername(token);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setPassword(null);

        return ResponseEntity.ok(user);
    }
}