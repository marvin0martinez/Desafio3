// Estado de la aplicación
let currentProjects = [];
let currentPage = 'welcome';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    updateNavigation();
    checkAuthenticationStatus();

    // Cargar página inicial basada en autenticación
    if (authManager.isAuthenticated()) {
        await loadPage('dashboard');
    } else {
        await loadPage('welcome');
    }
}

function checkAuthenticationStatus() {
    // Verificar si el token ha expirado
    if (authManager.isAuthenticated()) {
        // Aquí podrías agregar verificación de expiración del token
        console.log('Usuario autenticado:', authManager.user);
    }
}

// Navegación
function updateNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    if (authManager.isAuthenticated()) {
        nav.innerHTML = `
            <a href="#" onclick="loadPage('dashboard')" class="nav-link">📊 Dashboard</a>
            <a href="#" onclick="loadPage('projects')" class="nav-link">📋 Proyectos</a>
            <a href="#" onclick="handleLogout()" class="nav-link logout">🚪 Cerrar Sesión</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="#" onclick="loadPage('login')" class="nav-link">🔐 Iniciar Sesión</a>
            <a href="#" onclick="loadPage('register')" class="nav-link">📝 Registrarse</a>
        `;
    }
}

// Cargar páginas
async function loadPage(page) {
    const content = document.getElementById('content');
    if (!content) return;

    currentPage = page;

    try {
        switch(page) {
            case 'login':
                content.innerHTML = await loadLoginPage();
                setupLoginForm();
                break;
            case 'register':
                content.innerHTML = await loadRegisterPage();
                setupRegisterForm();
                break;
            case 'dashboard':
                if (!authManager.isAuthenticated()) {
                    await loadPage('login');
                    return;
                }
                content.innerHTML = await loadDashboardPage();
                await setupDashboard();
                break;
            case 'projects':
                if (!authManager.isAuthenticated()) {
                    await loadPage('login');
                    return;
                }
                content.innerHTML = await loadProjectsPage();
                await setupProjectsPage();
                break;
            case 'welcome':
            default:
                content.innerHTML = await loadWelcomePage();
                break;
        }

        updateNavigation();
        updateActiveNavLink(page);

    } catch (error) {
        console.error('Error loading page:', error);
        content.innerHTML = `
            <div class="error-container">
                <h2>❌ Error al cargar la página</h2>
                <p>${error.message}</p>
                <button onclick="loadPage('welcome')" class="btn btn-primary">Volver al Inicio</button>
            </div>
        `;
    }
}

function updateActiveNavLink(activePage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.includes(getPageTitle(activePage))) {
            link.classList.add('active');
        }
    });
}

function getPageTitle(page) {
    const titles = {
        'dashboard': 'Dashboard',
        'projects': 'Proyectos',
        'login': 'Iniciar Sesión',
        'register': 'Registrarse'
    };
    return titles[page] || '';
}

// Cargar templates
async function loadLoginPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h2>🔐 Iniciar Sesión</h2>
                    <p>Accede a tu cuenta de NovaTech</p>
                </div>
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label for="email">📧 Email:</label>
                        <input type="email" id="email" name="email" required
                               placeholder="tu@email.com">
                    </div>
                    <div class="form-group">
                        <label for="password">🔒 Contraseña:</label>
                        <input type="password" id="password" name="password" required
                               placeholder="Tu contraseña" minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        🚀 Iniciar Sesión
                    </button>
                </form>
                <div class="auth-links">
                    <p>¿No tienes cuenta? <a href="#" onclick="loadPage('register')">Regístrate aquí</a></p>
                </div>
                <div id="loginMessage" class="message"></div>

                <div class="demo-accounts">
                    <h4>👥 Cuentas de Demo:</h4>
                    <div class="demo-account">
                        <strong>Admin:</strong> admin@novatech.com / admin123
                    </div>
                    <div class="demo-account">
                        <strong>Usuario:</strong> user@novatech.com / user123
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadRegisterPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h2>📝 Crear Cuenta</h2>
                    <p>Únete a NovaTech Solutions</p>
                </div>
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label for="regEmail">📧 Email:</label>
                        <input type="email" id="regEmail" name="email" required
                               placeholder="tu@email.com">
                    </div>
                    <div class="form-group">
                        <label for="regPassword">🔒 Contraseña:</label>
                        <input type="password" id="regPassword" name="password" required
                               placeholder="Mínimo 6 caracteres" minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="regName">👤 Nombre (opcional):</label>
                        <input type="text" id="regName" name="name"
                               placeholder="Tu nombre">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        🚀 Crear Cuenta
                    </button>
                </form>
                <div class="auth-links">
                    <p>¿Ya tienes cuenta? <a href="#" onclick="loadPage('login')">Inicia sesión aquí</a></p>
                </div>
                <div id="registerMessage" class="message"></div>
            </div>
        </div>
    `;
}

async function loadDashboardPage() {
    return `
        <div class="dashboard">
            <div class="dashboard-header">
                <div class="header-content">
                    <h2>📊 Panel de Control</h2>
                    <div class="user-info">
                        <span id="userWelcome">Bienvenido</span>
                        <button onclick="handleLogout()" class="btn btn-secondary btn-sm">🚪 Cerrar Sesión</button>
                    </div>
                </div>
            </div>

            <div class="dashboard-content">
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-info">
                            <h3 id="totalProjects">0</h3>
                            <p>Total Proyectos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <h3 id="activeProjects">0</h3>
                            <p>Proyectos Activos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔐</div>
                        <div class="stat-info">
                            <h3 id="tokenStatus">✓</h3>
                            <p>Estado Token</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-actions">
                    <button onclick="loadPage('projects')" class="btn btn-primary">
                        📋 Gestionar Proyectos
                    </button>
                    <button onclick="testProtectedAPI()" class="btn btn-secondary">
                        🧪 Probar API Protegida
                    </button>
                </div>

                <div id="apiResponse" class="api-response"></div>

                <div class="recent-activity">
                    <h3>📝 Actividad Reciente</h3>
                    <div id="recentActivity">
                        <p>Cargando actividad...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadProjectsPage() {
    return `
        <div class="projects-page">
            <div class="page-header">
                <div class="header-content">
                    <h2>📋 Gestión de Proyectos</h2>
                    <div class="header-actions">
                        <button onclick="showAddProjectForm()" class="btn btn-primary">
                            ➕ Nuevo Proyecto
                        </button>
                        <button onclick="loadPage('dashboard')" class="btn btn-secondary">
                            📊 Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div class="projects-content">
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="projectSearch" placeholder="🔍 Buscar proyectos...">
                    </div>
                    <div class="filter-box">
                        <select id="statusFilter">
                            <option value="">Todos los estados</option>
                            <option value="ACTIVE">Activo</option>
                            <option value="IN_PROGRESS">En Progreso</option>
                            <option value="COMPLETED">Completado</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div id="projectForm" class="project-form-container" style="display: none;">
                    <div class="form-card">
                        <h3 id="formTitle">Nuevo Proyecto</h3>
                        <form id="projectFormElement">
                            <input type="hidden" id="projectId">
                            <div class="form-group">
                                <label for="projectName">📛 Nombre:</label>
                                <input type="text" id="projectName" required
                                       placeholder="Nombre del proyecto">
                            </div>
                            <div class="form-group">
                                <label for="projectDescription">📝 Descripción:</label>
                                <textarea id="projectDescription" required
                                          placeholder="Descripción del proyecto" rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="projectStatus">📊 Estado:</label>
                                <select id="projectStatus">
                                    <option value="PLANNED">📋 Planificado</option>
                                    <option value="IN_PROGRESS">🚀 En Progreso</option>
                                    <option value="ACTIVE">✅ Activo</option>
                                    <option value="COMPLETED">🎉 Completado</option>
                                    <option value="CANCELLED">❌ Cancelado</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">💾 Guardar</button>
                                <button type="button" onclick="hideProjectForm()" class="btn btn-secondary">❌ Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="projectsContainer" class="projects-grid">
                    <p>Cargando proyectos...</p>
                </div>
            </div>
        </div>
    `;
}

async function loadWelcomePage() {
    return `
        <div class="welcome-section">
            <div class="welcome-hero">
                <h1>🚀 NovaTech Solutions</h1>
                <p class="hero-subtitle">Sistema seguro de gestión de proyectos con autenticación JWT</p>

                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🔐</div>
                        <h3>Autenticación Segura</h3>
                        <p>Login y registro con tokens JWT para máxima seguridad</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📋</div>
                        <h3>Gestión de Proyectos</h3>
                        <p>Crea, edita y administra tus proyectos fácilmente</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Dashboard Interactivo</h3>
                        <p>Visualiza estadísticas y métricas importantes</p>
                    </div>
                </div>

                <div class="auth-buttons">
                    <button onclick="loadPage('login')" class="btn btn-primary btn-large">
                        🔐 Iniciar Sesión
                    </button>
                    <button onclick="loadPage('register')" class="btn btn-secondary btn-large">
                        📝 Registrarse
                    </button>
                </div>

                <div class="tech-stack">
                    <h3>🛠️ Tecnologías Utilizadas</h3>
                    <div class="tech-tags">
                        <span class="tech-tag">Spring Boot</span>
                        <span class="tech-tag">JWT</span>
                        <span class="tech-tag">JavaScript</span>
                        <span class="tech-tag">HTML5</span>
                        <span class="tech-tag">CSS3</span>
                        <span class="tech-tag">REST API</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configuración de formularios
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const message = document.getElementById('loginMessage');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            showMessage(message, 'Iniciando sesión...', 'info');

            const response = await apiService.login(credentials);
            authManager.setAuth(response.token, {
                email: response.email,
                name: response.name || response.email,
                roles: response.roles || ['USER']
            });

            showMessage(message, '✅ Inicio de sesión exitoso! Redirigiendo...', 'success');
            setTimeout(() => loadPage('dashboard'), 1000);

        } catch (error) {
            showMessage(message, '❌ Error al iniciar sesión: ' + error.message, 'error');
        }
    });
}

function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    const message = document.getElementById('registerMessage');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name') || formData.get('email').split('@')[0]
        };

        try {
            showMessage(message, 'Creando cuenta...', 'info');
            await apiService.register(userData);

            showMessage(message, '✅ Registro exitoso! Redirigiendo al login...', 'success');
            setTimeout(() => loadPage('login'), 2000);

        } catch (error) {
            showMessage(message, '❌ Error al registrarse: ' + error.message, 'error');
        }
    });
}

// Dashboard
async function setupDashboard() {
    const userWelcome = document.getElementById('userWelcome');
    if (authManager.user && userWelcome) {
        userWelcome.textContent = `Bienvenido, ${authManager.user.name || authManager.user.email}`;
    }

    await loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Cargar proyectos para estadísticas
        const projects = await apiService.getProjects();
        const activeProjects = projects.filter(p =>
            p.status === 'ACTIVE' || p.status === 'IN_PROGRESS'
        ).length;

        // Actualizar UI
        const totalProjectsElem = document.getElementById('totalProjects');
        const activeProjectsElem = document.getElementById('activeProjects');

        if (totalProjectsElem) totalProjectsElem.textContent = projects.length;
        if (activeProjectsElem) activeProjectsElem.textContent = activeProjects;

        // Actualizar actividad reciente
        await updateRecentActivity(projects);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function updateRecentActivity(projects) {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;

    const recentProjects = projects.slice(0, 5); // Últimos 5 proyectos

    if (recentProjects.length === 0) {
        activityContainer.innerHTML = '<p>No hay actividad reciente.</p>';
        return;
    }

    activityContainer.innerHTML = recentProjects.map(project => `
        <div class="activity-item">
            <div class="activity-icon">📋</div>
            <div class="activity-content">
                <strong>${project.name}</strong>
                <span class="activity-status status-${project.status.toLowerCase()}">
                    ${getStatusText(project.status)}
                </span>
                <small>${formatDate(project.createdAt)}</small>
            </div>
        </div>
    `).join('');
}

// Projects Page
async function setupProjectsPage() {
    await loadProjects();
    setupProjectForm();
}

async function loadProjects() {
    try {
        currentProjects = await apiService.getProjects();
        renderProjects(currentProjects);
    } catch (error) {
        console.error('Error loading projects:', error);
        const container = document.getElementById('projectsContainer');
        if (container) {
            container.innerHTML = `<p class="error">Error al cargar proyectos: ${error.message}</p>`;
        }
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📋 No hay proyectos</h3>
                <p>Comienza creando tu primer proyecto.</p>
                <button onclick="showAddProjectForm()" class="btn btn-primary">Crear Primer Proyecto</button>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-header">
                <h4 class="project-title">${project.name}</h4>
                <span class="status-badge status-${project.status.toLowerCase()}">
                    ${getStatusText(project.status)}
                </span>
            </div>
            <p class="project-description">${project.description || 'Sin descripción'}</p>
            <div class="project-meta">
                <small>Creado: ${formatDate(project.createdAt)}</small>
            </div>
            <div class="project-actions">
                <button onclick="editProject(${project.id})" class="btn btn-secondary btn-sm">Editar</button>
                <button onclick="deleteProject(${project.id})" class="btn btn-danger btn-sm">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function setupProjectForm() {
    const form = document.getElementById('projectFormElement');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = document.getElementById('projectId').value;
        const projectData = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            status: document.getElementById('projectStatus').value
        };

        try {
            if (projectId) {
                await apiService.updateProject(projectId, projectData);
            } else {
                await apiService.createProject(projectData);
            }

            hideProjectForm();
            form.reset();
            document.getElementById('projectId').value = '';
            await loadProjects();

        } catch (error) {
            alert('Error al guardar proyecto: ' + error.message);
        }
    });
}

// Funciones compartidas
function showAddProjectForm() {
    document.getElementById('formTitle').textContent = 'Nuevo Proyecto';
    document.getElementById('projectId').value = '';
    document.getElementById('projectFormElement').reset();
    document.getElementById('projectForm').style.display = 'block';
}

function hideProjectForm() {
    document.getElementById('projectForm').style.display = 'none';
}

async function editProject(id) {
    try {
        const project = currentProjects.find(p => p.id === id);
        if (project) {
            document.getElementById('formTitle').textContent = 'Editar Proyecto';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectForm').style.display = 'block';
        }
    } catch (error) {
        alert('Error al cargar proyecto: ' + error.message);
    }
}

async function deleteProject(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        try {
            await apiService.deleteProject(id);
            await loadProjects();
        } catch (error) {
            alert('Error al eliminar proyecto: ' + error.message);
        }
    }
}

async function testProtectedAPI() {
    const responseDiv = document.getElementById('apiResponse');
    if (!responseDiv) return;

    try {
        const profile = await apiService.getUserProfile();
        responseDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ API Protegida funcionando</strong><br>
                Usuario: ${profile.email}<br>
                Roles: ${profile.roles || 'Usuario'}
            </div>
        `;
    } catch (error) {
        responseDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ Error en API Protegida</strong><br>
                ${error.message}
            </div>
        `;
    }
}

// Utilidades
function showMessage(element, text, type) {
    if (!element) return;

    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function getStatusText(status) {
    const statusMap = {
        'PLANNED': 'Planificado',
        'IN_PROGRESS': 'En Progreso',
        'ACTIVE': 'Activo',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-ES');
}

function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        authManager.clearAuth();
        loadPage('welcome');
    }
}

// Funciones globales para uso en HTML
window.loadPage = loadPage;
window.handleLogout = handleLogout;
window.showAddProjectForm = showAddProjectForm;
window.hideProjectForm = hideProjectForm;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.testProtectedAPI = testProtectedAPI;