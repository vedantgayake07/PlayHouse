const defaultRenderUrl = 'https://playhouse-api-50oa.onrender.com';
const rawBase = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? defaultRenderUrl : '')).replace(/\/+$/, '');
export const API_BASE = rawBase ? `${rawBase}/api` : '/api';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return rawBase ? `${rawBase}${url}` : url;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    me: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),
    changePassword: (passwords) => request('/auth/change-password', { method: 'PUT', body: passwords }),
    uploadAvatar: (formData) => request('/auth/avatar', { method: 'POST', body: formData })
  },

  // Media
  media: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/media?${q}`);
    },
    getById: (id) => request(`/media/${id}`),
    getDashboard: () => request('/media/dashboard'),
    search: (q, type) => {
      const params = new URLSearchParams({ q });
      if (type && type !== 'all') params.append('type', type);
      return request(`/media/search?${params.toString()}`);
    },
    upload: (formData, onProgress) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/media`);

        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          let responseData = {};
          try { responseData = JSON.parse(xhr.responseText); } catch (e) {}

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(responseData);
          } else {
            const err = new Error(responseData.message || `Upload failed with status ${xhr.status}`);
            err.data = responseData;
            reject(err);
          }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload.'));
        xhr.send(formData);
      });
    },
    update: (id, data) => request(`/media/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/media/${id}`, { method: 'DELETE' })
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`),
    create: (data) => request('/categories', { method: 'POST', body: data }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
  },

  // Favorites
  favorites: {
    getAll: (mediaType) => {
      const q = mediaType ? `?mediaType=${mediaType}` : '';
      return request(`/favorites${q}`);
    },
    toggle: (mediaId) => request('/favorites/toggle', { method: 'POST', body: { mediaId } }),
    remove: (mediaId) => request(`/favorites/${mediaId}`, { method: 'DELETE' })
  },

  // Playlists
  playlists: {
    getAll: (userOnly = false) => request(`/playlists?userOnly=${userOnly}`),
    getById: (id) => request(`/playlists/${id}`),
    create: (data) => request('/playlists', { method: 'POST', body: data }),
    update: (id, data) => request(`/playlists/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
    addItem: (playlistId, mediaId) => request(`/playlists/${playlistId}/items`, { method: 'POST', body: { mediaId } }),
    removeItem: (playlistId, mediaId) => request(`/playlists/${playlistId}/items/${mediaId}`, { method: 'DELETE' })
  },

  // Watch / Play History
  history: {
    getAll: () => request('/history'),
    record: (mediaId, progress, completed = 0) => request('/history', { method: 'POST', body: { mediaId, progress, completed } }),
    remove: (id) => request(`/history/${id}`, { method: 'DELETE' }),
    clear: () => request('/history/clear', { method: 'DELETE' })
  },

  // Ratings
  ratings: {
    rate: (mediaId, score, review) => request('/ratings', { method: 'POST', body: { mediaId, score, review } }),
    getByMediaId: (mediaId) => request(`/ratings/media/${mediaId}`)
  },

  // User Settings
  settings: {
    get: () => request('/user/settings'),
    update: (settings) => request('/user/settings', { method: 'PUT', body: settings })
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/users?${q}`);
    },
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    getAllMedia: (params) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/media?${q}`);
    },
    deleteMedia: (id) => request(`/admin/media/${id}`, { method: 'DELETE' })
  }
};
