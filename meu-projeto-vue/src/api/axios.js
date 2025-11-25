// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getEnv } from '@/utils/env';
import { logger } from '@/utils/logger';

// --- Refresh Token Logic ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// --- CSRF Token management ---
let csrfToken = null;

function clearCsrfCookie() {
    try {
        document.cookie = 'x-csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=none; Secure';
        const backendDomain = new URL(getEnv('VITE_API_URL', 'https://clientes.domcloud.dev')).hostname;
        document.cookie = `x-csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${backendDomain}; SameSite=none; Secure`;
        logger.log('🧹 Cookies CSRF limpos');
    } catch (error) {
        logger.warn('Erro ao limpar cookies CSRF:', error);
    }
}

async function fetchCsrfToken(forceClear = false) {
    try {
        if (forceClear) {
            clearCsrfCookie();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');
        const csrfUrl = `${baseURL}/api/csrf-token`;
        logger.log('🔐 Buscando CSRF token de:', csrfUrl);
        const response = await axios.get(csrfUrl, { withCredentials: true });
        if (response.data && response.data.csrfToken) {
            csrfToken = response.data.csrfToken;
            logger.log('✅ CSRF token obtido');
            return csrfToken;
        } else {
            throw new Error('Token CSRF não encontrado na resposta');
        }
    } catch (error) {
        logger.error('💥 Erro ao buscar CSRF token:', error);
        throw error;
    }
}

export async function initializeCsrf(forceClear = false) {
    try {
        if (forceClear) {
            clearCsrfCookie();
            csrfToken = null;
        }
        await fetchCsrfToken(forceClear);
        logger.log('CSRF inicializado com sucesso');
    } catch (error) {
        logger.warn('Falha ao inicializar CSRF token:', error);
    }
}

const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');
const apiClient = axios.create({
    baseURL: baseURL,
    timeout: parseInt(getEnv('VITE_API_TIMEOUT', '30000')),
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(async (config) => {
    const needsCsrf = ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase());
    if (needsCsrf) {
        if (!csrfToken) {
            try {
                await fetchCsrfToken();
            } catch (error) {
                logger.warn('Não foi possível obter CSRF token:', error);
            }
        }
        if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken;
        }
    }

    const publicAuthRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/first-login',
        '/auth/reset-password-with-code',
        '/auth/refresh', // Refresh route is public in a sense
        '/api/csrf-token'
    ];
    const isPublicRoute = publicAuthRoutes.some(route => config.url.includes(route));

    if (!isPublicRoute) {
        const authStore = useAuthStore();
        if (authStore.accessToken) {
            config.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
        } else {
            logger.warn('Tentativa de requisição protegida sem token.');
            // This will be caught by the response interceptor if the server returns 401
        }
    }
    return config;
}, error => Promise.reject(error));

// Response Interceptor
apiClient.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        const authStore = useAuthStore();

        // Handle 401 Unauthorized errors for token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent refresh loops if the refresh endpoint itself fails
            if (originalRequest.url.includes('/auth/refresh')) {
                logger.error('Refresh token falhou. Deslogando.');
                authStore.logout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                apiClient.post('/auth/refresh', { refreshToken: authStore.refreshToken })
                    .then(response => {
                        const newAccessToken = response.data.accessToken;
                        authStore.setAuthState(newAccessToken, authStore.refreshToken);
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        processQueue(null, newAccessToken);
                        resolve(apiClient(originalRequest));
                    })
                    .catch(err => {
                        processQueue(err, null);
                        logger.error('Não foi possível renovar o token. Deslogando.', err);
                        authStore.logout();
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        // Other error handling
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 403:
                    logger.error('Acesso negado (403). Pode ser um erro de CSRF.');
                    if (error.response.data?.error?.includes('csrf')) {
                        logger.warn('Detectado erro de CSRF - forçando renovação.');
                        csrfToken = null;
                    }
                    break;
                case 404: logger.error('Recurso não encontrado (404)'); break;
                case 422: logger.error('Dados inválidos (422)'); break;
                case 429: logger.error('Muitas requisições (429)'); break;
                case 500: case 502: case 503: logger.error('Erro no servidor (5xx)'); break;
            }
        } else if (error.code === 'ECONNABORTED') {
            logger.error('Requisição expirou (timeout).');
        } else if (error.message === 'Network Error') {
            logger.error('Erro de conexão.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
