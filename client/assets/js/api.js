/**
 * Centralized API Client Module for Skill_Map
 * Injects JWT authorization header and standardizes responses
 */

const API_BASE_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api';

class APIClient {
  static getToken() {
    return localStorage.getItem('skill_map_token');
  }

  static getHeaders(isMultiPart = false) {
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isMultiPart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.isMultiPart),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid
          if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
            console.warn('Session expired. Redirecting to login.');
            localStorage.removeItem('skill_map_token');
            localStorage.removeItem('skill_map_user');
            window.location.href = '/login.html';
          }
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, body, isMultiPart = false) {
    return this.request(endpoint, {
      method: 'POST',
      body: isMultiPart ? body : JSON.stringify(body),
      isMultiPart
    });
  }

  static put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

window.APIClient = APIClient;
