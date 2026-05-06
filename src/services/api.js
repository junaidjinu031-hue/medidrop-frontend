import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Helper to get cookie value
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const pharmacyService = {
  getAll: () => api.get('/pharmacies/'),
  getById: (id) => api.get(`/pharmacies/${id}/`),
  create: (data) => api.post('/pharmacies/', data),
  update: (id, data) => api.patch(`/pharmacies/${id}/`, data),
  delete: (id) => api.delete(`/pharmacies/${id}/`),
};

export const medicineService = {
  getAll: (pharmacyId) => {
    const params = pharmacyId ? { pharmacy: pharmacyId } : {};
    return api.get('/medicines/', { params });
  },
  getById: (id) => api.get(`/medicines/${id}/`),
  create: (data) => api.post('/medicines/', data),
  update: (id, data) => api.patch(`/medicines/${id}/`, data),
  delete: (id) => api.delete(`/medicines/${id}/`),
};

export const medicalKitService = {
  getAll: () => api.get('/kits/'),
  getById: (id) => api.get(`/kits/${id}/`),
};

export const deliverySlotService = {
  getAll: (pharmacyId, deliveryType) => {
    const params = {};
    if (pharmacyId) params.pharmacy = pharmacyId;
    if (deliveryType) params.delivery_type = deliveryType;
    return api.get('/slots/', { params });
  },
  create: (data) => api.post('/slots/', data),
};

export const lockerService = {
  getAll: () => api.get('/lockers/'),
};

export const orderService = {
  create: (orderData) => api.post('/orders/', orderData),
  getAll: (phone) => {
    const params = phone ? { contact_phone: phone } : {};
    return api.get('/orders/', { params });
  },
  getById: (id) => api.get(`/orders/${id}/`),
  updateStatus: (id, status) => api.post(`/orders/${id}/update_status/`, { status }),
  update: (id, data) => api.patch(`/orders/${id}/`, data),
  cancel: (id) => api.post(`/orders/${id}/cancel/`),
};

export const userService = {
  getAll: (role) => {
    const params = role ? { role } : {};
    return api.get('/users/', { params });
  },
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
};

