/**
 * Skill_Map Auth Handler & Route Protection Module
 */

class AuthManager {
  static getUser() {
    const userStr = localStorage.getItem('skill_map_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated() {
    return !!localStorage.getItem('skill_map_token');
  }

  static checkAuth() {
    const isPublicPage = window.location.pathname.endsWith('login.html') ||
                         window.location.pathname.endsWith('register.html') ||
                         window.location.pathname.endsWith('index.html') ||
                         window.location.pathname === '/';

    if (!this.isAuthenticated() && !isPublicPage) {
      window.location.href = '/login.html';
    } else if (this.isAuthenticated() && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html'))) {
      window.location.href = '/dashboard.html';
    }
  }

  static async login(email, password) {
    try {
      const data = await APIClient.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('skill_map_token', data.token);
        localStorage.setItem('skill_map_user', JSON.stringify(data.user));
        return data;
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: err.message || 'Invalid credentials'
      });
      throw err;
    }
  }

  static logout() {
    localStorage.removeItem('skill_map_token');
    localStorage.removeItem('skill_map_user');
    window.location.href = '/login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  AuthManager.checkAuth();
});

window.AuthManager = AuthManager;
