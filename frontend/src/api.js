import axios from 'axios';

/**
 * Single axios instance for the whole frontend.
 * Set REACT_APP_API_URL in your .env files:
 *   .env.development  →  REACT_APP_API_URL=http://localhost:5000
 *   .env.production   →  REACT_APP_API_URL=https://your-backend.vercel.app
 *
 * Every component should import this instead of calling
 * axios directly with a hardcoded URL.
 */
const DEFAULT_API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/$/, ''),
});

// Attach the JWT on every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
