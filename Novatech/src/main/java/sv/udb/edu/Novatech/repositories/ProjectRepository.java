package sv.udb.edu.Novatech.repositories;

import sv.udb.edu.Novatech.entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    List<Project> findByUserEmail(String email);
}