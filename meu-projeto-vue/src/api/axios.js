// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getEnv } from '@/utils/env';
import { logger } from '@/utils/logger';

// Contador de requisições pendentes para debugging
let pendingRequests = 0;

// Configuração do axios client
const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');

logger.log('=== CONFIGURAÇÃO AXIOS ===');
logger.log('API URL:', baseURL);
logger.log('Modo:', import.meta.env.DEV ? 'DESENVOLVIMENTO' : 'PRODUÇÃO');

const apiClient = axios.create({
    baseURL: baseURL,
    timeout: parseInt(getEnv('VITE_API_TIMEOUT', '30000')), // 30 segundos padrão
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Recomendado para segurança
    },
});

// Interceptor: Adiciona o token JWT a CADA requisição protegida
apiClient.interceptors.request.use(
    (config) => {
        pendingRequests++;

        // Adicionar Authorization token se não for rota de autenticação
        if (!config.url.startsWith('/auth')) {
            const authStore = useAuthStore();
            const token = authStore.token;

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
                logger.log('Token JWT adicionado à requisição');
            } else {
                // Bloquear requisição se não tiver token em rotas protegidas
                pendingRequests--;
                logger.warn('Tentativa de requisição sem token');
                return Promise.reject(new Error('Token não encontrado'));
            }
        }

        return config;
    },
    (error) => {
        pendingRequests--;
        return Promise.reject(error);
    }
);

// Interceptor: Lida com respostas e erros
apiClient.interceptors.response.use(
    (response) => {
        pendingRequests--;

        // Validar estrutura básica da resposta
        if (!response.data && response.status !== 204) {
            logger.warn('Resposta sem dados');
        }

        return response;
    },
    (error) => {
        pendingRequests--;

        // Tratamento de erros melhorado
        if (error.response) {
            const status = error.response.status;

            switch (status) {
                case 401:
                    // Token inválido ou expirado
                    logger.warn('Não autorizado - redirecionando para login');
                    const authStore = useAuthStore();
                    authStore.logout();
                    break;

                case 403:
                    logger.error('Acesso negado');
                    break;

                case 404:
                    logger.error('Recurso não encontrado');
                    break;

                case 422:
                    logger.error('Dados inválidos');
                    break;

                case 429:
                    logger.error('Muitas requisições - aguarde antes de tentar novamente');
                    break;

                case 500:
                case 502:
                case 503:
                    logger.error('Erro no servidor - tente novamente mais tarde');
                    break;

                default:
                    logger.error(`Erro ${status}`);
            }
        } else if (error.code === 'ECONNABORTED') {
            logger.error('Requisição expirou - timeout');
        } else if (error.message === 'Network Error') {
            logger.error('Erro de conexão - verifique sua internet');
        } else if (error.message === 'Token não encontrado') {
            // Erro customizado do interceptor de request
            logger.error('Token ausente para rota protegida');
        }

        return Promise.reject(error);
    }
);

// Exportar função para verificar requisições pendentes
export const hasPendingRequests = () => pendingRequests > 0;

export default apiClient;

