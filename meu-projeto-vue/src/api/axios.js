// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // (Criaremos este store no Passo 3)

const apiClient = axios.create({
    baseURL: 'https://clientes.domcloud.dev', // A URL do seu backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Adiciona o token a CADA requisição
apiClient.interceptors.request.use(
    (config) => {
        // Só adicione o token se a rota não for de autenticação
        if (!config.url.startsWith('/auth')) {
            const authStore = useAuthStore();
            const token = authStore.token;
            
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor: Lida com erros 401 (Não Autorizado)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Se a API retornar 401, o token é inválido.
            const authStore = useAuthStore();
            authStore.logout(); // Limpa o estado e redireciona
        }
        return Promise.reject(error);
    }
);

export default apiClient;