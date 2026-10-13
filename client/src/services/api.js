import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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
