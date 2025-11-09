// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getEnv } from '@/utils/env';
import { logger } from '@/utils/logger';

// Contador de requisições pendentes para debugging
let pendingRequests = 0;

// CSRF Token management
let csrfToken = null;

/**
 * Busca o CSRF token do backend
 * @returns {Promise<string>} O token CSRF
 */
async function fetchCsrfToken() {
    try {
        const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');
        // Em desenvolvimento (VITE_API_URL vazio), usa URL relativa para proxy do Vite
        const csrfUrl = baseURL ? `${baseURL}/api/csrf-token` : '/api/csrf-token';

        logger.log('Buscando CSRF token de:', csrfUrl);

        const response = await axios.get(csrfUrl, {
            withCredentials: true  // Importante para cookies
        });

        if (response.data && response.data.csrfToken) {
            csrfToken = response.data.csrfToken;
            logger.log('CSRF token obtido com sucesso');
            logger.log('Cookies após buscar token:', document.cookie);
            return csrfToken;
        } else {
            throw new Error('Token CSRF não encontrado na resposta');
        }
    } catch (error) {
        logger.error('Erro ao buscar CSRF token:', error);
        logger.error('Detalhes do erro:', error.response?.data);
        throw error;
    }
}

/**
 * Inicializa o CSRF token na aplicação
 * Deve ser chamado no startup da aplicação
 */
export async function initializeCsrf() {
    try {
        await fetchCsrfToken();
    } catch (error) {
        logger.warn('Falha ao inicializar CSRF token:', error);
        // Não bloqueia a aplicação, tentará novamente nas requisições
    }
}

// Configuração do axios client
// Em desenvolvimento (VITE_API_URL vazio), usa URLs relativas com proxy do Vite
// Em produção, usa a URL completa do backend
const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');

const apiClient = axios.create({
    baseURL: baseURL || '', // Se vazio, usa URLs relativas
    timeout: parseInt(getEnv('VITE_API_TIMEOUT', '30000')), // 30 segundos padrão
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Necessário para cookies CSRF
});

// Interceptor: Adiciona o token a CADA requisição
apiClient.interceptors.request.use(
    async (config) => {
        pendingRequests++;

        // Adicionar CSRF token para requisições que precisam (POST, PUT, DELETE, PATCH)
        const needsCsrf = ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase());

        if (needsCsrf) {
            // Se não tiver token CSRF, tenta buscar
            if (!csrfToken) {
                try {
                    logger.log('Buscando CSRF token...');
                    await fetchCsrfToken();
                } catch (error) {
                    logger.error('Falha ao obter CSRF token:', error);
                }
            }

            // Adiciona o token CSRF no header
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
                logger.log('Token CSRF adicionado à requisição');
            } else {
                logger.warn('CSRF token não disponível para ' + config.method + ' ' + config.url);
            }
        }

        // Adicionar Authorization token se não for rota de autenticação
        if (!config.url.startsWith('/auth')) {
            const authStore = useAuthStore();
            const token = authStore.token;

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
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
    async (error) => {
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
                    // Pode ser token CSRF inválido
                    const errorMessage = error.response.data?.message || '';
                    if (errorMessage.includes('CSRF') || errorMessage.includes('csrf')) {
                        logger.warn('Token CSRF inválido, tentando renovar');
                        // Tenta buscar novo token CSRF
                        try {
                            await fetchCsrfToken();
                            // Pode-se tentar reenviar a requisição aqui se necessário
                        } catch (csrfError) {
                            logger.error('Falha ao renovar token CSRF');
                        }
                    } else {
                        logger.error('Acesso negado');
                    }
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
