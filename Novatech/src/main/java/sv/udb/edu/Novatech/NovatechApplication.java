package sv.udb.edu.Novatech;

import sv.udb.edu.Novatech.entities.User;
import sv.udb.edu.Novatech.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@SpringBootApplication
public class NovatechApplication implements CommandLineRunner {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(NovatechApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Crear usuario de prueba si no existe
		if (userRepository.findByEmail("admin@novatech.com").isEmpty()) {
			User admin = new User();
			admin.setName("Administrador");
			admin.setEmail("admin@novatech.com");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setRoles(Arrays.asList("ROLE_ADMIN", "ROLE_USER"));
			userRepository.save(admin);

			User user = new User();
			user.setName("Usuario Demo");
			user.setEmail("user@novatech.com");
			user.setPassword(passwordEncoder.encode("user123"));
			user.setRoles(Arrays.asList("ROLE_USER"));
			userRepository.save(user);

			System.out.println("Usuarios de prueba creados:");
			System.out.println("Admin: admin@novatech.com / admin123");
			System.out.println("User: user@novatech.com / user123");
		}
	}
}