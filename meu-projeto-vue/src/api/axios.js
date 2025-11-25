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
 * Limpa cookies CSRF do navegador
 * Necessário antes de buscar novo token para evitar desincronização
 * entre memória e cookies (problema comum em navegadores mobile)
 */
function clearCsrfCookie() {
    try {
        // Limpa cookie do domínio atual
        document.cookie = 'x-csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=none; Secure';

        // Limpa cookie do backend (domcloud.dev)
        const backendDomain = new URL(getEnv('VITE_API_URL', 'https://clientes.domcloud.dev')).hostname;
        document.cookie = `x-csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${backendDomain}; SameSite=none; Secure`;

        logger.log('🧹 Cookies CSRF limpos');
    } catch (error) {
        logger.warn('Erro ao limpar cookies CSRF:', error);
    }
}

/**
 * Busca o CSRF token do backend
 * @param {boolean} forceClear - Se true, limpa cookies antigos antes de buscar novo token
 */
async function fetchCsrfToken(forceClear = false) {
    try {
        // Limpa cookies antigos se solicitado (importante para mobile)
        if (forceClear) {
            clearCsrfCookie();
            // Aguarda um pouco para garantir que o navegador processou
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');
        const csrfUrl = `${baseURL}/api/csrf-token`;

        logger.log('🔐 Buscando CSRF token de:', csrfUrl);

        const response = await axios.get(csrfUrl, {
            withCredentials: true  // Importante para cookies
        });

        if (response.data && response.data.csrfToken) {
            csrfToken = response.data.csrfToken;
            logger.log('✅ CSRF token obtido:', csrfToken.substring(0, 20) + '...');
            return csrfToken;
        } else {
            logger.error('❌ Token CSRF não encontrado na resposta');
            throw new Error('Token CSRF não encontrado na resposta');
        }
    } catch (error) {
        logger.error('💥 Erro ao buscar CSRF token:', error);
        throw error;
    }
}

/**
 * Inicializa o CSRF token na aplicação
 * @param {boolean} forceClear - Se true, limpa cookies antigos antes de buscar novo token
 */
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
    withCredentials: true, // Necessário para cookies CSRF
});

// Interceptor: Adiciona o token JWT e CSRF a CADA requisição protegida
apiClient.interceptors.request.use(
    async (config) => {
        pendingRequests++;

        // Adicionar CSRF token para requisições de mutação
        const needsCsrf = ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase());
        if (needsCsrf) {
            // Buscar token CSRF se não tiver
            if (!csrfToken) {
                try {
                    await fetchCsrfToken();
                } catch (error) {
                    logger.warn('Não foi possível obter CSRF token:', error);
                }
            }

            // Adicionar token CSRF ao header
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
                logger.log('Token CSRF adicionado à requisição');
            }
        }

        // Rotas de autenticação públicas que NÃO precisam de JWT
        const publicAuthRoutes = [
            '/auth/login',
            '/auth/register',
            '/auth/first-login',
            '/auth/reset-password-with-code',
            '/auth/reset-password',
            '/api/csrf-token'
        ];

        // Verifica se é uma rota pública
        const isPublicRoute = publicAuthRoutes.some(route => config.url.startsWith(route));

        // Adicionar Authorization token para todas as rotas protegidas
        // (incluindo /auth/change-password e outras rotas protegidas)
        if (!isPublicRoute) {
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
                    // Pode ser CSRF token inválido - tentar renovar
                    logger.error('Acesso negado - pode ser CSRF token inválido');
                    const errorMessage = error.response.data?.error || '';
                    if (errorMessage.includes('csrf') || errorMessage.includes('CSRF')) {
                        logger.warn('Detectado erro de CSRF - renovando token');
                        clearCsrfCookie(); // Limpa cookies antigos (importante para mobile)
                        csrfToken = null; // Forçar renovação na próxima requisição
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

