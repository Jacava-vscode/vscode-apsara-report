const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN_STORAGE_KEY = 'apsara-auth-token';
const AUTH_STATE_KEY = 'apsara-auth-state';
const AUTH_PROFILE_KEY = 'apsara-auth-profile';

const getSessionStore = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
};

const readAuthToken = () => {
  const store = getSessionStore();
  if (!store) {
    return null;
  }
  try {
    return store.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const clearStoredAuth = () => {
  const store = getSessionStore();
  if (!store) {
    return;
  }
  try {
    store.removeItem(AUTH_TOKEN_STORAGE_KEY);
    store.removeItem(AUTH_STATE_KEY);
    store.removeItem(AUTH_PROFILE_KEY);
  } catch (error) {
    /* storage unavailable */
  }
};

const handleUnauthorized = () => {
  clearStoredAuth();
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.dispatchEvent(new CustomEvent('apsara:unauthorized'));
  } catch (error) {
    /* custom events unsupported */
  }
  const path = (window.location.pathname || '').toLowerCase();
  const isHome = !path || path === '/' || path.endsWith('/index.html');
  if (!isHome) {
    window.location.href = 'index.html';
  }
};

const buildHeaders = (headers = {}) => {
  const nextHeaders = { ...headers };
  if (!nextHeaders.Authorization) {
    const token = readAuthToken();
    if (token) {
      nextHeaders.Authorization = `Bearer ${token}`;
    }
  }
  return nextHeaders;
};

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

// Central fetch helper to ensure auth headers and 401 handling stay consistent.
const requestJson = async (path, options = {}) => {
  const { skipAuthHandling = false, skipSuccessCheck = false, absolute = false } = options;
  const fetchOptions = { ...options };
  delete fetchOptions.skipAuthHandling;
  delete fetchOptions.skipSuccessCheck;
  delete fetchOptions.absolute;

  fetchOptions.headers = buildHeaders(fetchOptions.headers || {});

  const targetUrl = absolute ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(targetUrl, fetchOptions);
  const data = await parseJsonSafely(response);

  const successFlag = data && Object.prototype.hasOwnProperty.call(data, 'success') ? data.success : undefined;

  if (!response.ok || (!skipSuccessCheck && successFlag === false)) {
    if (!skipAuthHandling && response.status === 401) {
      handleUnauthorized();
    }
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const API = {
  getAuthToken: readAuthToken,

  setAuthToken(token) {
    const store = getSessionStore();
    if (!store) {
      return;
    }
    try {
      if (token) {
        store.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      } else {
        store.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      /* storage unavailable */
    }
  },

  clearAuthState() {
    clearStoredAuth();
  },

  async getEquipment() {
    const payload = await requestJson('/equipment');
    return payload?.data || [];
  },

  async getEquipmentById(id) {
    const payload = await requestJson(`/equipment/${encodeURIComponent(id)}`);
    return payload?.data || null;
  },

  async addEquipment(equipmentData) {
    const payload = await requestJson('/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipmentData)
    });
    return payload?.data;
  },

  async updateEquipment(id, equipmentData) {
    const payload = await requestJson(`/equipment/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipmentData)
    });
    return payload?.data;
  },

  async deleteEquipment(id) {
    await requestJson(`/equipment/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return true;
  },

  async getStats() {
    const payload = await requestJson('/equipment/stats/summary');
    return payload?.data || {};
  },

  storage: {
    async getReport() {
      return requestJson('/storage', { skipSuccessCheck: true });
    },

    async getCluster(cluster) {
      return requestJson(`/storage/${encodeURIComponent(cluster)}`, { skipSuccessCheck: true });
    },

    async checkArchive() {
      return requestJson('/storage/check-archive', { skipSuccessCheck: true });
    },

    async refresh() {
      return requestJson('/storage/refresh', { method: 'POST', skipSuccessCheck: true });
    },

    async archive() {
      return requestJson('/storage/archive', { method: 'POST', skipSuccessCheck: true });
    }
  },

  auth: {
    async login(username, password) {
      const payload = await requestJson('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        skipAuthHandling: true
      });
      return payload?.data;
    },

    async logout(token) {
      if (!token) {
        clearStoredAuth();
        return;
      }
      await requestJson('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        skipAuthHandling: true
      }).catch(() => {
        /* ignore logout failures */
      });
      clearStoredAuth();
    },

    async me(token) {
      if (!token) {
        const error = new Error('Session token missing');
        error.status = 401;
        throw error;
      }
      const payload = await requestJson('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return payload?.data;
    },

    async listUsers(token) {
      const payload = await requestJson('/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return payload?.data || [];
    },

    async upsertUser(user, token) {
      const payload = await requestJson('/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });
      return payload?.data;
    },

    async deleteUser(username, token) {
      const normalized = typeof username === 'string' ? username.trim().toLowerCase() : '';
      if (!normalized) {
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
      }
      await requestJson(`/auth/users/${encodeURIComponent(normalized)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    }
  }
};

// Utility Functions
const Utils = {
  // Show alert message
  showAlert(message, type = 'success', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'error' : type === 'info' ? 'info' : 'success'}`;
    alert.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(alert);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      alert.remove();
    }, 5000);
  },

  // Format date
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const locale = window.I18n && typeof I18n.getLanguage === 'function'
      ? (I18n.getLanguage() === 'kh' ? 'km-KH' : 'en-US')
      : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Get status badge class
  getStatusBadgeClass(status) {
    switch (status) {
      case 'working':
        return 'badge-success';
      case 'maintenance':
        return 'badge-warning';
      case 'broken':
        return 'badge-danger';
      case 'done':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  },

  // Normalize free-text input by trimming whitespace
  normalizeText(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.trim();
  },

  // Ensure a value is present, otherwise return fallback (defaults to "N/A")
  withFallback(value, fallback = 'N/A') {
    if (value == null) {
      return fallback;
    }

    const stringValue = typeof value === 'string' ? value : String(value);
    const trimmed = stringValue.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  },

  // Convert File object to base64 data URL
  async fileToDataUrl(file) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  // Confirm dialog
  confirm(message) {
    return window.confirm(message);
  },
};
