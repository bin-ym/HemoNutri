import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token to every request
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

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check if the error is due to token expiration
      if (error.response.data.error === 'Token expired') {
        // Clear authentication data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        // Redirect to login page
        window.location.href = '/login';
        // Optionally, show an alert to inform the user
        alert('Your session has expired. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;