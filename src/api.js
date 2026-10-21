import axios from "axios";

const API_URL = "https://interviewflow-backend-073x.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Authorization token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("interviewflow_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enables string coercion: `${api}/path` evaluates directly to "https://interviewflow-backend-073x.onrender.com/path"
api.toString = () => API_URL;
api.valueOf = () => API_URL;

export { API_URL, api };
export default api;