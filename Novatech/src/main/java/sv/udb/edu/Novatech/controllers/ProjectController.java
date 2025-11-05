package sv.udb.edu.Novatech.controllers;

import sv.udb.edu.Novatech.entities.Project;
import sv.udb.edu.Novatech.entities.User;
import sv.udb.edu.Novatech.repositories.ProjectRepository;
import sv.udb.edu.Novatech.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // Obtener proyectos del usuario autenticado
    @GetMapping
    public ResponseEntity<List<Project>> getMyProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // en tu UserDetails usamos email como username

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        List<Project> projects = projectRepository.findByUserId(user.getId());
        return ResponseEntity.ok(projects);
    }

    // Crear nuevo proyecto asignado al usuario autenticado
    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project incoming) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        Project p = new Project();
        p.setName(incoming.getName());
        p.setDescription(incoming.getDescription());
        p.setStartDate(incoming.getStartDate() == null ? LocalDate.now() : incoming.getStartDate());
        p.setStatus(incoming.getStatus() == null ? Project.ProjectStatus.PLANNED : incoming.getStatus());
        p.setUser(user);

        Project saved = projectRepository.save(p);
        return ResponseEntity.ok(saved);
    }

    // Opcional: eliminar un proyecto (solo si pertenece al usuario)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = optionalProject.get();
        if (project.getUser() == null || !project.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(403).build();
        }

        projectRepository.delete(project);
        return ResponseEntity.ok().build();
    }
}
