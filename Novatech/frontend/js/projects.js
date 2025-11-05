const API_BASE_URL = 'http://localhost:8081/api';

let currentProjects = [];
let editingProjectId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    loadProjects();
    setupProjectForm();
    setupEventListeners();
});

function setupEventListeners() {
    // Buscar proyectos
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }

    // Filtrar por estado
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProjects);
    }
}

function setupProjectForm() {
    const form = document.getElementById('projectFormElement');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject();
    });
}

async function loadProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    try {
        container.innerHTML = '<p class="loading">Cargando proyectos...</p>';

        currentProjects = await apiService.getProjects();
        renderProjects(currentProjects);

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>❌ Error al cargar proyectos: ${error.message}</p>
                <button onclick="loadProjects()" class="btn btn-secondary">Reintentar</button>
            </div>
        `;
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📋 No hay proyectos</h3>
                <p>No se han creado proyectos aún. ¡Crea el primero!</p>
                <button onclick="showAddProjectForm()" class="btn btn-primary">Crear Primer Proyecto</button>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-header">
                <h4 class="project-title">${escapeHtml(project.name)}</h4>
                <span class="status-badge status-${(project.status || 'ACTIVE').toLowerCase()}">
                    ${getStatusText(project.status)}
                </span>
            </div>
            <div class="project-body">
                <p class="project-description">${escapeHtml(project.description || 'Sin descripción')}</p>
                <div class="project-meta">
                    <small><strong>Creado:</strong> ${formatDate(project.createdAt || new Date())}</small>
                    ${project.updatedAt ? `<br><small><strong>Actualizado:</strong> ${formatDate(project.updatedAt)}</small>` : ''}
                </div>
            </div>
            <div class="project-actions">
                <button onclick="editProject(${project.id})" class="btn btn-secondary btn-sm">✏️ Editar</button>
                <button onclick="deleteProject(${project.id})" class="btn btn-danger btn-sm">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

async function saveProject() {
    const form = document.getElementById('projectFormElement');
    if (!form) return;

    const projectId = document.getElementById('projectId').value;
    const projectData = {
        name: document.getElementById('projectName').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        status: document.getElementById('projectStatus').value
    };

    // Validaciones
    if (!projectData.name) {
        alert('El nombre del proyecto es requerido');
        return;
    }

    if (!projectData.description) {
        alert('La descripción del proyecto es requerida');
        return;
    }

    try {
        if (projectId) {
            // Actualizar proyecto existente
            await apiService.updateProject(projectId, projectData);
            showNotification('Proyecto actualizado exitosamente', 'success');
        } else {
            // Crear nuevo proyecto
            await apiService.createProject(projectData);
            showNotification('Proyecto creado exitosamente', 'success');
        }

        hideProjectForm();
        form.reset();
        document.getElementById('projectId').value = '';
        editingProjectId = null;

        await loadProjects();

    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('Error al guardar proyecto: ' + error.message, 'error');
    }
}

function showAddProjectForm() {
    document.getElementById('formTitle').textContent = 'Nuevo Proyecto';
    document.getElementById('projectId').value = '';
    document.getElementById('projectFormElement').reset();
    document.getElementById('projectStatus').value = 'ACTIVE';
    document.getElementById('projectForm').style.display = 'block';
    editingProjectId = null;

    // Enfocar el primer campo
    setTimeout(() => {
        const nameInput = document.getElementById('projectName');
        if (nameInput) nameInput.focus();
    }, 100);
}

function hideProjectForm() {
    document.getElementById('projectForm').style.display = 'none';
    document.getElementById('projectFormElement').reset();
    document.getElementById('projectId').value = '';
    editingProjectId = null;
}

async function editProject(id) {
    try {
        const project = currentProjects.find(p => p.id === id);

        if (project) {
            document.getElementById('formTitle').textContent = 'Editar Proyecto';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name || '';
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStatus').value = project.status || 'ACTIVE';
            document.getElementById('projectForm').style.display = 'block';
            editingProjectId = id;

            // Enfocar el primer campo
            setTimeout(() => {
                const nameInput = document.getElementById('projectName');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    } catch (error) {
        console.error('Error loading project for edit:', error);
        showNotification('Error al cargar proyecto: ' + error.message, 'error');
    }
}

async function deleteProject(id) {
    const project = currentProjects.find(p => p.id === id);
    const projectName = project ? project.name : 'este proyecto';

    if (!confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`)) {
        return;
    }

    try {
        await apiService.deleteProject(id);
        showNotification('Proyecto eliminado exitosamente', 'success');
        await loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Error al eliminar proyecto: ' + error.message, 'error');
    }
}



function filterProjects() {
    const searchTerm = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    let filtered = currentProjects;

    // Filtrar por búsqueda
    if (searchTerm) {
        filtered = filtered.filter(project =>
            project.name.toLowerCase().includes(searchTerm) ||
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filtrar por estado
    if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
    }

    renderProjects(filtered);
}

function getStatusText(status) {
    const statusMap = {
        'ACTIVE': 'Activo',
        'INACTIVE': 'Inactivo',
        'COMPLETED': 'Completado',
        'PLANNED': 'Planificado',
        'IN_PROGRESS': 'En Progreso',
        'CANCELLED': 'Cancelado',
        'PENDING': 'Pendiente'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'No definida';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showNotification(message, type = 'info') {
    // Implementación simple de notificación
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        font-weight: bold;
    `;

    if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else {
        notification.style.background = '#3498db';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        authManager.clearAuth();
        window.location.href = '/login.html';
    }
}