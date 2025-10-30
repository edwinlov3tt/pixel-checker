/**
 * API Client Service
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
const TOKEN_KEY = 'pixel_checker_token';

export const tokenManager = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY)
};

// API request helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  const token = tokenManager.get();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      tokenManager.remove();
      // Don't redirect - let components handle it
      throw new Error('Unauthorized');
    }

    // Parse JSON response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store token
    if (data.token) {
      tokenManager.set(data.token);
    }

    return data;
  },

  async register(userData) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    return data;
  },

  async getCurrentUser() {
    return await apiRequest('/auth/me');
  },

  logout() {
    tokenManager.remove();
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!tokenManager.get();
  }
};

// Sites API
export const sitesAPI = {
  async getAll() {
    const data = await apiRequest('/sites');
    return data.sites;
  },

  async getById(id) {
    const data = await apiRequest(`/sites/${id}`);
    return data.site;
  },

  async create(siteData) {
    const data = await apiRequest('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData)
    });
    return data.site;
  },

  async update(id, updates) {
    const data = await apiRequest(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.site;
  },

  async delete(id) {
    const data = await apiRequest(`/sites/${id}`, {
      method: 'DELETE'
    });
    return data.site;
  },

  async getStatus(id) {
    const data = await apiRequest(`/sites/${id}/status`);
    return data.status;
  },

  async getHeartbeats(id, limit = 50) {
    const data = await apiRequest(`/sites/${id}/heartbeats?limit=${limit}`);
    return data.heartbeats;
  }
};

// Export default API object
export default {
  auth: authAPI,
  sites: sitesAPI,
  tokenManager
};
