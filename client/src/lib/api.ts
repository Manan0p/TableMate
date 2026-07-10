import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if not already there, avoiding infinite loops
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Extract error message or use default
    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    // Show toast for error unless it's a 401 on an auth route (handled locally)
    const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
    const isLoginAttempt = error.config?.url?.includes('/auth/login');
    if (!(error.response?.status === 401 && isAuthRoute) || isLoginAttempt) {
       // Only toast non-validation errors globally. Form validations are handled by React Hook Form.
       if (error.response?.status !== 400) {
         toast.error(message);
       }
    }

    return Promise.reject(error);
  }
);

export default api;
