import axios, { AxiosError } from "axios";

// La env var VITE_API_URL debe contener SOLO la URL del servidor (sin /api)
// Ejemplos:
//   Local:      http://localhost:5001
//   Staging:    https://hana-api-staging.onrender.com
//   Producción: https://api.hana.cl
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agrega el JWT a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hana_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira / es inválido, limpia y redirige a login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hana_token");
      localStorage.removeItem("hana_user");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;