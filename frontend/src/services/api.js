import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  initAdmin: () => api.post('/api/auth/init-admin'),
};

// Detection APIs
export const detectionAPI = {
  detectImage: (formData, config) => api.post('/api/predict/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  }),
  detectVideo: (formData, config) => api.post('/api/predict/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  }),
  detectWebcamFrame: (formData, config) => api.post('/api/predict/webcam/frame', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  }),
  getHistory: (params) => api.get('/api/predict/history', { params }),
  getModelInfo: () => api.get('/api/predict/model-info'),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  listModels: () => api.get('/api/admin/models'),
  switchModel: (data) => api.post('/api/admin/switch-model', data),
  deleteDetection: (id) => api.delete(`/api/admin/detection/${id}`),
};

// Health check
export const healthCheck = () => api.get('/api/health');

export default api;
