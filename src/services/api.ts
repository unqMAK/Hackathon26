import axios from 'axios';

// Use relative URL so it works in both development (via Vite proxy) and production
export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user?.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                // Invalid JSON in localStorage, ignore
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

