import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('xeno_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If any response is 401, clear the stale token
// (this forces re-login if token expired mid-session)
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