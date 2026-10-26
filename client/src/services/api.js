import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach token from localStorage for seamless cross-domain auth (Vercel)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pathfinder_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data;
    const message = errorData?.message || error.message || 'An unexpected error occurred.';
    
    // Attach structured errors if present
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = errorData;
    customError.errors = errorData?.errors;
    customError.lockReasons = errorData?.lockReasons;

    return Promise.reject(customError);
  }
);

/**
 * Builds an authenticated download URL that works in new browser tabs
 * by appending the JWT token as a query parameter.
 */
export function getAuthDownloadUrl(resourceId) {
  const token = localStorage.getItem('pathfinder_token');
  const base = import.meta.env.VITE_API_URL || '/api/v1';
  return `${base}/resources/${resourceId}/download${token ? `?token=${token}` : ''}`;
}
