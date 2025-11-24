/**
 * @file authStore.js
 * @description Store Pinia para gerenciamento de autenticação de usuários
 * Controla login, logout, registro e validação de token
 */

import { defineStore } from 'pinia';
import apiClient, { initializeCsrf } from '@/api/axios';
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

                logger.log('Login bem-sucedido');  // ✅ Era logger.info()

                this.accessToken = response.data.accessToken;  // ✅
                
                this.refreshToken = response.data.refreshToken;  // ✅

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
         * IMPORTANTE: Retorna o recovery code que deve ser salvo pelo usuário
         * @async
         * @param {string} name - Nome completo do usuário
         * @param {string} email - Email do usuário
         * @param {string} password - Senha do usuário
         * @throws {Error} Se dados inválidos ou erro de rede
         * @returns {Promise<Object>} Objeto com success, message e recoveryCode
         * @example
         * const result = await authStore.register('João Silva', 'joao@example.com', 'SenhaForte123!')
         * console.log(result.recoveryCode) // A1B2-C3D4-E5F6-G7H8
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

                logger.log('Registro bem-sucedido');

                // Retorna os dados incluindo o recovery code
                return {
                    success: true,
                    message: response.data.message,
                    recoveryCode: response.data.recoveryCode,
                    warning: response.data.warning
                };
            } catch (error) {
                logger.error('Erro no registro:', error);
                const message = error.response?.data?.error || 'Erro ao registrar. Tente novamente.';
                notificationStore.error(message);
                throw error;
            }
        },

        /**
         * Primeiro login com código de recuperação
         * Usado após registro para validar o recovery code
         * @async
         * @param {string} email - Email do usuário
         * @param {string} password - Senha do usuário
         * @param {string} recoveryCode - Código de recuperação fornecido no registro
         * @returns {Promise<void>}
         * @example
         * await authStore.firstLogin('user@example.com', 'senha123', 'A1B2-C3D4-E5F6-G7H8')
         */
        async firstLogin(email, password, recoveryCode) {
            const notificationStore = useNotificationStore();
            try {
                // Sanitizar entrada
                const sanitizedEmail = email.trim().toLowerCase();
                const sanitizedCode = recoveryCode.trim().toUpperCase();

                // Validação básica
                if (!sanitizedEmail || !password || !sanitizedCode) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                // Chama a rota POST /auth/first-login
                const response = await apiClient.post('/auth/first-login', {
                    email: sanitizedEmail,
                    password,
                    recoveryCode: sanitizedCode
                });

                // Armazena os tokens (mesmo processo do login normal)
                this.accessToken = response.data.accessToken;
                this.refreshToken = response.data.refreshToken;
                this.token = response.data.accessToken;

                // Define expiração
                const expiry = Date.now() + (15 * 60 * 1000);
                this.tokenExpiry = expiry.toString();

                // Salva no sessionStorage
                sessionStorage.setItem('accessToken', response.data.accessToken);
                sessionStorage.setItem('refreshToken', response.data.refreshToken);
                sessionStorage.setItem('token', response.data.accessToken);
                sessionStorage.setItem('tokenExpiry', expiry.toString());

                logger.log('Primeiro login concluído com sucesso');
                notificationStore.success('Primeiro login concluído! Bem-vindo ao sistema.');

                // Redireciona para o dashboard
                router.push('/dashboard');
            } catch (error) {
                logger.error('Erro no primeiro login:', error);
                const message = error.response?.data?.error || 'Falha no primeiro login. Verifique seus dados.';
                notificationStore.error(message);
                throw error;
            }
        },

        /**
         * Reseta senha usando código de recuperação (quando esqueceu a senha)
         * @async
         * @param {string} email - Email do usuário
         * @param {string} recoveryCode - Código de recuperação
         * @param {string} newPassword - Nova senha
         * @returns {Promise<boolean>} True se reset bem-sucedido
         * @example
         * await authStore.resetPasswordWithCode('user@example.com', 'A1B2-C3D4-E5F6-G7H8', 'NovaSenha456!')
         */
        async resetPasswordWithCode(email, recoveryCode, newPassword) {
            const notificationStore = useNotificationStore();
            try {
                // Sanitizar entradas
                const sanitizedEmail = email.trim().toLowerCase();
                const sanitizedCode = recoveryCode.trim().toUpperCase();

                // Validação básica
                if (!sanitizedEmail || !sanitizedCode || !newPassword) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                // Chama a rota POST /auth/reset-password-with-code
                const response = await apiClient.post('/auth/reset-password-with-code', {
                    email: sanitizedEmail,
                    recoveryCode: sanitizedCode,
                    newPassword
                });

                logger.log('Senha resetada com sucesso');
                notificationStore.success(response.data.message || 'Senha resetada com sucesso!');

                return true;
            } catch (error) {
                logger.error('Erro ao resetar senha:', error);
                const message = error.response?.data?.error || 'Erro ao resetar senha. Verifique seus dados.';
                notificationStore.error(message);
                throw error;
            }
        },

        /**
         * Altera senha do usuário autenticado (quando lembra a senha atual)
         * @async
         * @param {string} currentPassword - Senha atual
         * @param {string} newPassword - Nova senha
         * @returns {Promise<boolean>} True se troca bem-sucedida
         * @example
         * await authStore.changePassword('SenhaAntiga123!', 'SenhaNova456!')
         */
        async changePassword(currentPassword, newPassword) {
            const notificationStore = useNotificationStore();
            try {
                // Validação básica
                if (!currentPassword || !newPassword) {
                    throw new Error('Ambas as senhas são obrigatórias');
                }

                if (currentPassword === newPassword) {
                    throw new Error('A nova senha não pode ser igual à senha atual');
                }

                // Chama a rota PUT /auth/change-password
                const response = await apiClient.put('/auth/change-password', {
                    currentPassword,
                    newPassword
                });

                logger.log('Senha alterada com sucesso');
                notificationStore.success(response.data.message || 'Senha alterada com sucesso!');

                // Força logout para fazer login novamente (por segurança)
                setTimeout(() => {
                    this.logout();
                }, 2000);

                return true;
            } catch (error) {
                logger.error('Erro ao alterar senha:', error);
                const message = error.response?.data?.error || 'Erro ao alterar senha.';
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
