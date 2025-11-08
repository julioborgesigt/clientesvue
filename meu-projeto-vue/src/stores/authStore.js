// src/stores/authStore.js
import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import router from '@/router';
import { useNotificationStore } from './notificationStore';
import { logger } from '@/utils/logger';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: sessionStorage.getItem('token') || null,
        tokenExpiry: sessionStorage.getItem('tokenExpiry') || null,
    }),
    getters: {
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

                // Validar resposta
                if (!response.data || !response.data.token) {
                    throw new Error('Resposta inválida do servidor');
                }

                this.token = response.data.token;

                // Definir expiração (1 hora)
                const expiry = Date.now() + (60 * 60 * 1000);
                this.tokenExpiry = expiry.toString();

                // Usar sessionStorage ao invés de localStorage
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('tokenExpiry', expiry.toString());

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

        logout() {
            this.token = null;
            this.tokenExpiry = null;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('tokenExpiry');
            router.push('/login');
        },

        // Verificar token periodicamente
        checkTokenExpiry() {
            if (!this.isAuthenticated) {
                logger.warn('Token inválido ou expirado, fazendo logout');
                this.logout();
            }
        }
    },
});