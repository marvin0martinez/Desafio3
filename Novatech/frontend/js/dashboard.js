const API_BASE_URL = 'http://localhost:8081/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    updateUserInfo();
    loadDashboardData();
    setupEventListeners();
});

function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (authManager.user) {
        const userName = authManager.user.name || authManager.user.email;
        userInfo.textContent = `Bienvenido, ${userName}`;
    }
}

function setupEventListeners() {
    // Event listener para el botón de prueba de API
    const testApiBtn = document.getElementById('testApiBtn');
    if (testApiBtn) {
        testApiBtn.addEventListener('click', testProtectedAPI);
    }
}

async function loadDashboardData() {
    try {
        showLoadingState();

        // Cargar proyectos
        const projects = await apiService.getProjects();
        const activeProjects = projects.filter(p =>
            p.status === 'ACTIVE' || p.status === 'IN_PROGRESS'
        ).length;

        // Actualizar UI
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('totalProjects').textContent = projects.length;

        // Actualizar estado del token
        updateTokenStatus(true);

        hideLoadingState();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        updateTokenStatus(false);
        hideLoadingState();

        showNotification('Error al cargar datos del dashboard: ' + error.message, 'error');
    }
}

function updateTokenStatus(isValid) {
    const tokenStatus = document.getElementById('tokenStatus');
    if (tokenStatus) {
        if (isValid) {
            tokenStatus.textContent = '✓ Válido';
            tokenStatus.className = 'status-valid';
        } else {
            tokenStatus.textContent = '✗ Inválido/Expirado';
            tokenStatus.className = 'status-invalid';
        }
    }
}

async function testProtectedAPI() {
    const responseDiv = document.getElementById('apiResponse');
    responseDiv.innerHTML = '';

    try {
        showLoadingState();
        const profile = await apiService.getUserProfile();

        responseDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ API Protegida funcionando correctamente</strong>
                <br><br>
                <strong>Usuario:</strong> ${profile.email || authManager.user.email}<br>
                <strong>Roles:</strong> ${(profile.roles || authManager.user.roles || ['USER']).join(', ')}<br>
                <strong>ID:</strong> ${profile.id || 'N/A'}<br>
                <strong>Nombre:</strong> ${profile.name || authManager.user.name || 'N/A'}
            </div>
        `;

        hideLoadingState();

    } catch (error) {
        responseDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ Error en API Protegida</strong>
                <br><br>
                <strong>Error:</strong> ${error.message}<br>
                <strong>Solución:</strong> Verifica tu autenticación o intenta recargar la página.
            </div>
        `;
        hideLoadingState();
    }
}

function showLoadingState() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.style.display = 'block';
    });

    const contentElements = document.querySelectorAll('.dashboard-content');
    contentElements.forEach(element => {
        element.style.opacity = '0.6';
    });
}

function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });

    const contentElements = document.querySelectorAll('.dashboard-content');
    contentElements.forEach(element => {
        element.style.opacity = '1';
    });
}

function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        max-width: 300px;
    `;

    if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else {
        notification.style.background = '#3498db';
    }

    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        authManager.clearAuth();
        window.location.href = '/login.html';
    }
}

// Función para navegar a proyectos
function goToProjects() {
    window.location.href = '/projects.html';
}