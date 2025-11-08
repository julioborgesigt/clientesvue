/**
 * @file authStore.js
 * @description Store Pinia para gerenciamento de autenticação de usuários
 * Controla login, logout, registro e validação de token
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import router from '@/router';
import { useNotificationStore } from './notificationStore';
import { logger } from '@/utils/logger';

/**
 * Store de Autenticação
 * @typedef {Object} AuthState
 * @property {string|null} token - Token JWT de autenticação
 * @property {string|null} tokenExpiry - Timestamp de expiração do token
 */

/**
 * Hook do store de autenticação
 * @returns {Object} Store de autenticação com state, getters e actions
 */
export const useAuthStore = defineStore('auth', {
    /**
     * Estado do store de autenticação
     * @returns {AuthState}
     */
    state: () => ({
        /** @type {string|null} Token JWT armazenado em sessionStorage */
        token: sessionStorage.getItem('token') || null,
        /** @type {string|null} Access token (15 minutos) */
        accessToken: sessionStorage.getItem('accessToken') || null,
        /** @type {string|null} Refresh token (7 dias) */
        refreshToken: sessionStorage.getItem('refreshToken') || null,
        /** @type {string|null} Timestamp de expiração do token (15 minutos após login) */
        tokenExpiry: sessionStorage.getItem('tokenExpiry') || null,
    }),

    getters: {
        /**
         * Verifica se o usuário está autenticado e se o token ainda é válido
         * @param {AuthState} state - Estado do store
         * @returns {boolean} True se autenticado e token não expirado
         */
        isAuthenticated: (state) => {
            if (!state.token) return false;

            // Verificar expiração do token
            if (state.tokenExpiry) {
                const now = Date.now();
                if (now > parseInt(state.tokenExpiry)) {
                    logger.warn('Token expirado');
                    return false;
                }
            }
            return true;
        },
    },

    actions: {
        /**
         * Realiza login do usuário
         * @async
         * @param {string} email - Email do usuário
         * @param {string} password - Senha do usuário
         * @throws {Error} Se credenciais inválidas ou erro de rede
         * @returns {Promise<void>}
         * @example
         * await authStore.login('user@example.com', 'password123')
         */
        async login(email, password) {
            const notificationStore = useNotificationStore();
            try {
                // Sanitizar entrada
                const sanitizedEmail = email.trim().toLowerCase();

                // Validação básica
                if (!sanitizedEmail || !password) {
                    throw new Error('Email e senha são obrigatórios');
                }

                // Chama a rota POST /auth/login
                const response = await apiClient.post('/auth/login', {
                    email: sanitizedEmail,
                    password
                });

                // Validar resposta (novo formato: accessToken + refreshToken)
                if (!response.data || !response.data.accessToken) {
                    throw new Error('Resposta inválida do servidor');
                }

                // Armazena ambos os tokens
                this.accessToken = response.data.accessToken;
                this.refreshToken = response.data.refreshToken;
                // Mantém compatibilidade com código legado
                this.token = response.data.accessToken;

                // Definir expiração (15 minutos conforme backend)
                const expiry = Date.now() + (15 * 60 * 1000);
                this.tokenExpiry = expiry.toString();

                // Usar sessionStorage ao invés de localStorage
                sessionStorage.setItem('accessToken', response.data.accessToken);
                sessionStorage.setItem('refreshToken', response.data.refreshToken);
                sessionStorage.setItem('token', response.data.accessToken); // Compatibilidade
                sessionStorage.setItem('tokenExpiry', expiry.toString());

                logger.info('Login bem-sucedido');

                // Redireciona para o dashboard
                router.push('/dashboard');
            } catch (error) {
                logger.error('Erro no login:', error);
                // Mensagem genérica para não expor detalhes
                const message = 'Falha na autenticação. Verifique suas credenciais e tente novamente.';
                notificationStore.error(message);
                throw error;
            }
        },

        /**
         * Registra um novo usuário no sistema
         * @async
         * @param {string} name - Nome completo do usuário
         * @param {string} email - Email do usuário
         * @param {string} password - Senha do usuário
         * @throws {Error} Se dados inválidos ou erro de rede
         * @returns {Promise<boolean>} True se registro bem-sucedido
         * @example
         * const success = await authStore.register('João Silva', 'joao@example.com', 'senha123')
         */
        async register(name, email, password) {
            const notificationStore = useNotificationStore();
            try {
                // Sanitizar entradas
                const sanitizedName = name.trim();
                const sanitizedEmail = email.trim().toLowerCase();

                // Validação básica
                if (!sanitizedName || !sanitizedEmail || !password) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                // Chama a rota POST /auth/register
                const response = await apiClient.post('/auth/register', {
                    name: sanitizedName,
                    email: sanitizedEmail,
                    password
                });

                notificationStore.success(response.data.message || 'Cadastro realizado com sucesso!');
                return true;
            } catch (error) {
                logger.error('Erro no registro:', error);
                // Mensagem genérica
                const message = 'Erro ao registrar. Tente novamente.';
                notificationStore.error(message);
                throw error;
            }
        },

        /**
         * Realiza logout do usuário
         * Limpa token, tokenExpiry e sessionStorage, depois redireciona para /login
         * @returns {void}
         * @example
         * authStore.logout()
         */
        logout() {
            this.token = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('tokenExpiry');
            router.push('/login');
        },

        /**
         * Verifica periodicamente se o token expirou
         * Se expirado ou inválido, faz logout automático
         * Deve ser chamado em intervalos regulares (ex: a cada minuto)
         * @returns {void}
         * @example
         * setInterval(() => authStore.checkTokenExpiry(), 60000) // Verifica a cada minuto
         */
        checkTokenExpiry() {
            if (!this.isAuthenticated) {
                logger.warn('Token inválido ou expirado, fazendo logout');
                this.logout();
            }
        }
    },
});
