// client/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// ✅ Use request interceptor to attach latest token
api.interceptors.request.use(
  (config) => {
    // always fetch the latest token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default api;
