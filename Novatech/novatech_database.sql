-- =============================================
-- BASE DE DATOS: novatech_db
-- PARA WAMPSERVER MYSQL
-- =============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `novatech_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `novatech_db`;

-- =============================================
-- TABLA: users
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: user_roles (para los roles del usuario)
-- =============================================
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` BIGINT NOT NULL,
  `roles` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`user_id`, `roles`),
  CONSTRAINT `fk_user_roles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: projects
-- =============================================
CREATE TABLE IF NOT EXISTS `projects` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
  `user_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_projects_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INSERTAR USUARIOS DE PRUEBA
-- =============================================

-- Insertar usuario Administrador
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'Administrador', 'admin@novatech.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuWk6K7aNJknJhMv6UZRQFc2ZJYz3UJO'); -- password: admin123

-- Insertar usuario normal
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`) VALUES
(2, 'Usuario Demo', 'user@novatech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1t5f6cOaiCI7Qj6P6K7bBQ6YnjF4zKq'); -- password: user123

-- =============================================
-- INSERTAR ROLES DE USUARIOS
-- =============================================

-- Roles para el administrador
INSERT IGNORE INTO `user_roles` (`user_id`, `roles`) VALUES
(1, 'ROLE_ADMIN'),
(1, 'ROLE_USER');

-- Rol para el usuario normal
INSERT IGNORE INTO `user_roles` (`user_id`, `roles`) VALUES
(2, 'ROLE_USER');

-- =============================================
-- INSERTAR PROYECTOS DE PRUEBA
-- =============================================

-- Proyectos para el administrador
INSERT IGNORE INTO `projects` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `user_id`) VALUES
(1, 'Sistema de Autenticación JWT', 'Desarrollo de un sistema seguro de autenticación usando JSON Web Tokens para la aplicación NovaTech.', '2024-01-15', '2024-02-28', 'COMPLETED', 1),
(2, 'API REST Spring Boot', 'Implementación de una API REST completa con Spring Boot para la gestión de proyectos.', '2024-02-01', NULL, 'IN_PROGRESS', 1),
(3, 'Frontend JavaScript', 'Desarrollo del cliente web con JavaScript puro para consumir la API de NovaTech.', '2024-01-20', '2024-03-15', 'IN_PROGRESS', 1);

-- Proyectos para el usuario normal
INSERT IGNORE INTO `projects` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `user_id`) VALUES
(4, 'Documentación Técnica', 'Creación de documentación técnica completa del sistema NovaTech.', '2024-01-10', NULL, 'PLANNED', 2),
(5, 'Pruebas de Integración', 'Implementación de pruebas de integración para los módulos principales del sistema.', '2024-02-15', '2024-03-30', 'PLANNED', 2);

-- =============================================
-- CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =============================================
CREATE INDEX `idx_users_email` ON `users` (`email`);
CREATE INDEX `idx_projects_user_id` ON `projects` (`user_id`);
CREATE INDEX `idx_projects_status` ON `projects` (`status`);
CREATE INDEX `idx_user_roles_user_id` ON `user_roles` (`user_id`);

-- =============================================
-- VERIFICACIÓN DE LA BASE DE DATOS
-- =============================================

SELECT '=== TABLAS CREADAS ===' AS '';
SHOW TABLES;

SELECT '=== ESTRUCTURA DE TABLAS ===' AS '';
DESCRIBE users;
DESCRIBE user_roles;
DESCRIBE projects;

SELECT '=== USUARIOS REGISTRADOS ===' AS '';
SELECT u.id, u.name, u.email, GROUP_CONCAT(ur.roles) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY u.id;

SELECT '=== PROYECTOS CREADOS ===' AS '';
SELECT p.id, p.name, p.status, p.start_date, u.name as user_name
FROM projects p
JOIN users u ON p.user_id = u.id
ORDER BY p.id;

SELECT '=== BASE DE DATOS CONFIGURADA EXITOSAMENTE ===' AS '';