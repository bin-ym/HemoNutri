import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    config.url = config.url.replace(/^\/+/, '');
    const fullUrl = `${config.baseURL}/${config.url}`;
    console.log(`[${new Date().toISOString()}] api: Sending request`, {
      fullUrl,
      method: config.method,
      headers: { ...config.headers, Authorization: token ? `Bearer ${token}` : 'No token' },
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error(`[${new Date().toISOString()}] api: Request error:`, error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[${new Date().toISOString()}] api: Response received`, {
      url: response.config.url,
      fullUrl: `${response.config.baseURL}/${response.config.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error(`[${new Date().toISOString()}] api: Response error:`, {
      url: error.config?.url,
      fullUrl: error.config ? `${error.config.baseURL}/${error.config.url}` : 'N/A',
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.error || 'Unauthorized';
      const originalRequest = error.config;
      if ((errorMessage.includes('token_expired') || errorMessage.includes('invalid_token')) && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const { token } = refreshResponse.data;
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        return Promise.reject(new Error('Access denied'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;