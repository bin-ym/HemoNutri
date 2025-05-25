import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // Match AuthContext
});

api.interceptors.request.use(
  (config) => {
    console.log('api: Sending request', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('api: Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('api: Response received', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('api: Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;