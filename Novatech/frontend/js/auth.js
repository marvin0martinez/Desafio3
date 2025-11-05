class AuthManager {
    constructor() {
        this.token = localStorage.getItem('jwtToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    isAuthenticated() {
        return !!this.token;
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
    }

    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }
}

const authManager = new AuthManager();

// Función para manejar login en páginas individuales
async function handleLogin(event) {
    if (event) event.preventDefault();

    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const messageDiv = document.getElementById('message');

    if (!username || !password) {
        showMessage(messageDiv, 'Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const credentials = {
            email: username,
            password: password
        };

        const response = await apiService.login(credentials);
        authManager.setAuth(response.token, {
            email: response.email,
            name: response.name || response.email,
            roles: response.roles || ['USER']
        });

        showMessage(messageDiv, 'Inicio de sesión exitoso! Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1000);

    } catch (error) {
        showMessage(messageDiv, 'Error al iniciar sesión: ' + error.message, 'error');
    }
}

// Función para manejar registro en páginas individuales
async function handleRegister(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const messageDiv = document.getElementById('message');

    if (!email || !password) {
        showMessage(messageDiv, 'Por favor completa todos los campos', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageDiv, 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        const userData = {
            email: email,
            password: password,
            name: email.split('@')[0] // Nombre por defecto
        };

        await apiService.register(userData);
        showMessage(messageDiv, 'Registro exitoso! Redirigiendo al login...', 'success');

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);

    } catch (error) {
        showMessage(messageDiv, 'Error al registrarse: ' + error.message, 'error');
    }
}

// Función para logout
function handleLogout() {
    authManager.clearAuth();
    window.location.href = '/index.html';
}

// Función para mostrar mensajes
function showMessage(element, text, type) {
    if (!element) return;

    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';

    // Auto-ocultar mensajes de éxito después de 5 segundos
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Verificar autenticación al cargar páginas protegidas
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;

    // Páginas que requieren autenticación
    const protectedPages = ['/dashboard.html', '/projects.html'];

    if (protectedPages.includes(currentPage) && !authManager.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Páginas de auth - redirigir si ya está autenticado
    const authPages = ['/login.html', '/register.html', '/index.html'];
    if (authPages.includes(currentPage) && authManager.isAuthenticated()) {
        window.location.href = '/dashboard.html';
        return;
    }

    // Configurar formularios si existen en la página
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Mostrar información del usuario si está logueado
    updateUserInfo();
});

// Actualizar información del usuario en la UI
function updateUserInfo() {
    const userInfoElement = document.getElementById('userInfo');
    const userWelcomeElement = document.getElementById('userWelcome');

    if (authManager.isAuthenticated() && authManager.user) {
        const userName = authManager.user.name || authManager.user.email;

        if (userInfoElement) {
            userInfoElement.textContent = `Bienvenido, ${userName}`;
        }

        if (userWelcomeElement) {
            userWelcomeElement.textContent = `Bienvenido, ${userName}`;
        }
    }
}