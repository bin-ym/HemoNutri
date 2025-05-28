// frontend/src/services/api.js
const api = {
  async request(config) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    console.log('API request:', { url: config.url, method: config.method });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${config.url}`, {
        method: config.method || 'GET',
        headers,
        body: config.data ? JSON.stringify(config.data) : null,
      });

      console.log('API response:', { url: config.url, status: response.status });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login?session_expired=true';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { data: await response.json() };
    } catch (error) {
      console.error('API error:', error.message);
      throw error;
    }
  },
};

api.get = (url) => api.request({ url, method: 'GET' });
api.post = (url, data) => api.request({ url, method: 'POST', data });
api.put = (url, data) => api.request({ url, method: 'PUT', data });
api.delete = (url) => api.request({ url, method: 'DELETE' });

export default api;