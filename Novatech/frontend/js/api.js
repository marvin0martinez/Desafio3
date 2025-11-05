const API_BASE_URL = 'http://localhost:8081/api';

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = Object.assign({
            'Content-Type': 'application/json'
        }, authManager.getAuthHeader(), options.headers || {});

        const cfg = {
            method: options.method || 'GET',
            headers,
            mode: 'cors'
        };

        if (options.body) {
            cfg.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }

        const res = await fetch(url, cfg);
        if (!res.ok) {
            // manejo de errores
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        // si respuesta no tiene body (204) evitar JSON.parse
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await res.json();
        } else {
            return null;
        }
    }


    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async getProjects() {
        return this.request('/projects');
    }

    async createProject(project) {
        return this.request('/projects', {
            method: 'POST',
            body: project
        });
    }

    async updateProject(id, project) {
        return this.request(`/projects/${id}`, {
            method: 'PUT',
            body: project
        });
    }

    async deleteProject(id) {
        return this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    async getUserProfile() {
        return this.request('/users/profile');
    }

    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }
}

const apiService = new ApiService();