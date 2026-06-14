import axios from 'axios';

// REACT_APP_API_URL = "https://xeno-crm-backend-lo8a.onrender.com/api"
// Use it directly as baseURL — routes just add /customers, /orders etc.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('xeno_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 = token expired, force re-login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('xeno_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;