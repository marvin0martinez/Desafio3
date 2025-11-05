package sv.udb.edu.Novatech.controllers;

import sv.udb.edu.Novatech.dtos.AuthRequest;
import sv.udb.edu.Novatech.dtos.AuthResponse;
import sv.udb.edu.Novatech.entities.User;
import sv.udb.edu.Novatech.repositories.UserRepository;
import sv.udb.edu.Novatech.services.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"})
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAndGetToken(@Valid @RequestBody AuthRequest authRequest) {
        try {
            System.out.println("Intento de login para: " + authRequest.getEmail());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            if (authentication.isAuthenticated()) {
                User user = userRepository.findByEmail(authRequest.getEmail())
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

                // Generar token con el email
                String token = jwtService.generateToken(authRequest.getEmail());
                System.out.println("Token generado para: " + authRequest.getEmail());

                AuthResponse response = new AuthResponse(
                        token,
                        user.getEmail(),
                        user.getName(),
                        user.getRoles()
                );
                response.setType("Bearer");

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Credenciales inválidas");
            }
        } catch (Exception e) {
            System.err.println("Error en login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body("Error de autenticación: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody AuthRequest authRequest) {
        try {
            System.out.println("Intento de registro para: " + authRequest.getEmail());

            // Verificar si el usuario ya existe
            if (userRepository.existsByEmail(authRequest.getEmail())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "El email ya está en uso");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validaciones básicas
            if (authRequest.getPassword() == null || authRequest.getPassword().length() < 6) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "La contraseña debe tener al menos 6 caracteres");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Crear nuevo usuario
            User user = new User();
            user.setName(authRequest.getName() != null ? authRequest.getName() : authRequest.getEmail().split("@")[0]);
            user.setEmail(authRequest.getEmail());
            user.setPassword(passwordEncoder.encode(authRequest.getPassword()));
            user.setRoles(Arrays.asList("ROLE_USER"));

            User savedUser = userRepository.save(user);
            System.out.println("Usuario registrado exitosamente: " + savedUser.getEmail());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario registrado exitosamente");
            response.put("email", user.getEmail());
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error en registro: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error en registro: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Endpoint para verificar que el servicio está funcionando
    @GetMapping("/status")
    public ResponseEntity<?> status() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "active");
        response.put("service", "auth-service");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    // Endpoint simple para probar CORS
    @GetMapping("/test-cors")
    public ResponseEntity<?> testCors() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "CORS está funcionando correctamente");
        response.put("cors", "enabled");
        return ResponseEntity.ok(response);
    }
}