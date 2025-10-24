// src/stores/authStore.js
import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import router from '@/router'; // (Criaremos este router no Passo 4)

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(email, password) {
            try {
                // Chama a rota POST /auth/login
                const response = await apiClient.post('/auth/login', { email, password });
                
                this.token = response.data.token;
                localStorage.setItem('token', response.data.token);
                
                // Redireciona para o dashboard
                router.push('/dashboard');
            } catch (error) {
                console.error('Erro no login:', error);
                alert(error.response?.data?.error || 'Erro ao fazer login.');
            }
        },
        
        async register(name, email, password) {
            try {
                // Chama a rota POST /auth/register
                const response = await apiClient.post('/auth/register', { name, email, password });
                alert(response.data.message);
                // Opcional: fazer login automático ou redirecionar
            } catch (error) {
                console.error('Erro no registro:', error);
                alert(error.response?.data?.error || 'Erro ao registrar.');
            }
        },

        logout() {
            this.token = null;
            localStorage.removeItem('token');
            router.push('/login'); // Redireciona para a página de login
        },
    },
});