// src/api/axiosClient.ts
import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // Utilise la variable d'environnement
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Intercepteur pour ajouter automatiquement le token d'authentification
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs d'authentification
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('nexsaas_user');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;