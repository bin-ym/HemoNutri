import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // Normalize URL: remove leading slashes and ensure correct path
    config.url = config.url.replace(/^\/+/, "").replace(/^api\//, "");
    console.log(`[${new Date().toISOString()}] api: Sending request`, {
      url: `${config.baseURL}/${config.url}`,
      method: config.method,
      headers: { ...config.headers, Authorization: token ? `Bearer ${token}` : "No token" },
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
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error(`[${new Date().toISOString()}] api: Response error:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.error || "Unauthorized";
      if (errorMessage === "token_expired" || errorMessage === "invalid_token") {
        localStorage.clear();
        window.location.href = "/login";
        alert("Your session has expired. Please log in again.");
      } else {
        return Promise.reject(new Error("Access denied"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;