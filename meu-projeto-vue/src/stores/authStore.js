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
 * Decodifica um token JWT para extrair seu payload.
 * @param {string | null} token O token JWT.
 * @returns {object | null} O payload do token decodificado ou nulo se inválido.
 */
function decodeJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        logger.error('Falha ao decodificar o token JWT:', e);
        return null;
    }
}

/**
 * Store de Autenticação
 * @typedef {Object} AuthState
 * @property {string|null} accessToken - Token de acesso (15 minutos)
 * @property {string|null} refreshToken - Token de refresh (7 dias)
 * @property {string|null} tokenExpiry - Timestamp de expiração do token
 * @property {object|null} user - Informações do usuário decodificadas do token
 */

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: sessionStorage.getItem('accessToken') || null,
        refreshToken: sessionStorage.getItem('refreshToken') || null,
        tokenExpiry: sessionStorage.getItem('tokenExpiry') || null,
        user: (() => {
            try {
                const userData = sessionStorage.getItem('user');
                return userData ? JSON.parse(userData) : null;
            } catch (e) {
                logger.error('Erro ao parsear dados do usuário do sessionStorage:', e);
                return null;
            }
        })(),
    }),

    getters: {
        /**
         * Verifica se o usuário está autenticado e se o token não expirou.
         * @param {AuthState} state - O estado do store.
         * @returns {boolean} True se autenticado.
         */
        isAuthenticated: (state) => {
            if (!state.accessToken || !state.tokenExpiry) return false;
            const now = Date.now();
            return now < parseInt(state.tokenExpiry);
        },

        /**
         * Verifica se o usuário autenticado é um administrador.
         * @param {AuthState} state - O estado do store.
         * @returns {boolean} True se for administrador.
         */
        isAdmin: (state) => {
            return !!state.user && state.user.AdminIsTrue === true;
        },
    },

    actions: {
        /**
         * Define o estado de autenticação e armazena os dados na sessão.
         * @private
         * @param {string} accessToken - O token de acesso.
         * @param {string} refreshToken - O token de refresh.
         */
        setAuthState(accessToken, refreshToken) {
            const decodedUser = decodeJwt(accessToken);
            const expiry = decodedUser.exp ? decodedUser.exp * 1000 : Date.now() + 15 * 60 * 1000;

            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.user = decodedUser;
            this.tokenExpiry = expiry.toString();

            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);
            sessionStorage.setItem('user', JSON.stringify(decodedUser));
            sessionStorage.setItem('tokenExpiry', expiry.toString());
        },

        async login(email, password) {
            const notificationStore = useNotificationStore();
            try {
                const sanitizedEmail = email.trim().toLowerCase();
                if (!sanitizedEmail || !password) {
                    throw new Error('Email e senha são obrigatórios');
                }

                const response = await apiClient.post('/auth/login', {
                    email: sanitizedEmail,
                    password,
                });

                if (!response.data || !response.data.accessToken) {
                    throw new Error('Resposta inválida do servidor');
                }

                this.setAuthState(response.data.accessToken, response.data.refreshToken);

                logger.log('Login bem-sucedido');
                router.push('/dashboard');
            } catch (error) {
                logger.error('Erro no login:', error);
                if (error.response?.status === 403 && error.response?.data?.error?.toLowerCase().includes('primeiro login')) {
                    notificationStore.warning('Complete o primeiro login com seu código de recuperação.');
                    router.push({
                        name: 'FirstLogin',
                        state: { email: email.trim().toLowerCase() },
                    });
                } else {
                    const message = error.response?.data?.error || 'Email ou senha incorretos.';
                    notificationStore.error(message);
                }
                throw error;
            }
        },

        async register(name, email, password) {
            const notificationStore = useNotificationStore();
            try {
                const sanitizedName = name.trim();
                const sanitizedEmail = email.trim().toLowerCase();

                if (!sanitizedName || !sanitizedEmail || !password) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                const response = await apiClient.post('/auth/register', {
                    name: sanitizedName,
                    email: sanitizedEmail,
                    password,
                });

                logger.log('Registro bem-sucedido');
                return {
                    success: true,
                    message: response.data.message,
                    recoveryCode: response.data.recoveryCode,
                    warning: response.data.warning,
                };
            } catch (error) {
                logger.error('Erro no registro:', error);
                const message = error.response?.data?.error || 'Erro ao registrar. Tente novamente.';
                notificationStore.error(message);
                throw error;
            }
        },

        async firstLogin(email, password, recoveryCode) {
            const notificationStore = useNotificationStore();
            try {
                const sanitizedEmail = email.trim().toLowerCase();
                const sanitizedCode = recoveryCode.trim().toUpperCase();

                if (!sanitizedEmail || !password || !sanitizedCode) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                const response = await apiClient.post('/auth/first-login', {
                    email: sanitizedEmail,
                    password,
                    recoveryCode: sanitizedCode,
                });

                this.setAuthState(response.data.accessToken, response.data.refreshToken);

                logger.log('Primeiro login concluído com sucesso');
                notificationStore.success('Bem-vindo ao sistema!');
                router.push('/dashboard');
            } catch (error) {
                logger.error('Erro no primeiro login:', error);
                const message = error.response?.data?.error || 'Código de recuperação inválido.';
                notificationStore.error(message);
                throw error;
            }
        },

        async resetPasswordWithCode(email, recoveryCode, newPassword) {
            const notificationStore = useNotificationStore();
            try {
                const sanitizedEmail = email.trim().toLowerCase();
                const sanitizedCode = recoveryCode.trim().toUpperCase();

                if (!sanitizedEmail || !sanitizedCode || !newPassword) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                const response = await apiClient.post('/auth/reset-password-with-code', {
                    email: sanitizedEmail,
                    recoveryCode: sanitizedCode,
                    newPassword,
                });

                logger.log('Senha resetada com sucesso');
                notificationStore.success(response.data.message || 'Senha alterada com sucesso!');
                return true;
            } catch (error) {
                logger.error('Erro ao resetar senha:', error);
                const message = error.response?.data?.error || 'Código de recuperação inválido.';
                notificationStore.error(message);
                throw error;
            }
        },

        async changePassword(currentPassword, newPassword) {
            const notificationStore = useNotificationStore();
            try {
                if (!currentPassword || !newPassword) {
                    throw new Error('Ambas as senhas são obrigatórias');
                }
                if (currentPassword === newPassword) {
                    throw new Error('A nova senha não pode ser igual à senha atual');
                }

                const response = await apiClient.put('/auth/change-password', {
                    currentPassword,
                    newPassword,
                });

                logger.log('Senha alterada com sucesso');
                notificationStore.success(response.data.message || 'Senha alterada! Faça login novamente.');

                setTimeout(() => {
                    this.logout();
                }, 2000);

                return true;
            } catch (error) {
                logger.error('Erro ao alterar senha:', error);
                const message = error.response?.data?.error || 'Senha atual incorreta.';
                notificationStore.error(message);
                throw error;
            }
        },

        logout() {
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            this.user = null;

            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('tokenExpiry');
            sessionStorage.removeItem('user');

            router.push('/login');
        },

        checkTokenExpiry() {
            if (!this.isAuthenticated) {
                logger.warn('Token inválido ou expirado, fazendo logout');
                this.logout();
            }
        },
    },
});
