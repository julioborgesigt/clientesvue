// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Vamos importar os componentes que criaremos no Passo 5
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }, // Esta rota exige login
    },
    // Redirecionamento padrão
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard',
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// "Guarda de Rota" - Protege a rota /dashboard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    if (to.meta.requiresAuth && !isAuthenticated) {
        // Se a rota exige auth e o usuário não está logado, vá para o login
        next('/login');
    } else if (to.path === '/login' && isAuthenticated) {
        // Se o usuário está logado e tenta ir para o login, vá para o dashboard
        next('/dashboard');
    } else {
        // Caso contrário, permita a navegação
        next();
    }
});

export default router;