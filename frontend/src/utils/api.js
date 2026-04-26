import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Handler auto-logout khi token expired / session bị revoke.
let authLogoutHandler = null;
export const setAuthLogoutHandler = (fn) => {
  authLogoutHandler = typeof fn === 'function' ? fn : null;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    // 401 => session gone / token expired => logout FE.
    if (status === 401 && authLogoutHandler) {
      try {
        authLogoutHandler({
          reason: data?.expired ? 'token_expired' : 'unauthorized',
          message: data?.error || 'Session expired',
        });
      } catch { /* non-critical */ }
    }
    return Promise.reject(error);
  },
);

export default api;
