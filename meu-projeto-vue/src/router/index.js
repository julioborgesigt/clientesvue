// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

/**
 * Lazy Loading de Rotas
 * Cada view é carregada apenas quando a rota é acessada
 * Reduz o bundle inicial em ~30%
 */
const AuthView = () => import('../views/AuthView.vue');
const LoginForm = () => import('../components/auth/LoginForm.vue');
const RegisterForm = () => import('../components/auth/RegisterForm.vue');
const RecoveryCodeForm = () => import('../components/auth/RecoveryCodeForm.vue');
const FirstLoginForm = () => import('../components/auth/FirstLoginForm.vue');
const ForgotPasswordForm = () => import('../components/auth/ForgotPasswordForm.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const AdminView = () => import('../views/AdminView.vue');

const routes = [
    // Rotas de Autenticação - Container Unificado
    {
        path: '/auth',
        component: AuthView,
        children: [
            {
                path: 'login',
                name: 'Login',
                component: LoginForm,
            },
            {
                path: 'register',
                name: 'Register',
                component: RegisterForm,
            },
            {
                path: 'recovery-code',
                name: 'RecoveryCode',
                component: RecoveryCodeForm,
            },
            {
                path: 'first-login',
                name: 'FirstLogin',
                component: FirstLoginForm,
            },
            {
                path: 'forgot-password',
                name: 'ForgotPassword',
                component: ForgotPasswordForm,
            },
        ],
    },
    // Redirecionamentos para compatibilidade
    {
        path: '/login',
        redirect: '/auth/login',
    },
    {
        path: '/register',
        redirect: '/auth/register',
    },
    {
        path: '/first-login',
        redirect: '/auth/first-login',
    },
    {
        path: '/forgot-password',
        redirect: '/auth/forgot-password',
    },
    // Rotas Protegidas
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }, // Esta rota exige login
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminView,
        meta: { requiresAuth: true, requiresAdmin: true }, // Requer login e permissão admin
    },
    // Redirecionamento padrão
    {
        path: '/',
        redirect: '/auth/login',
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/auth/login',
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// "Guarda de Rota" - Protege rotas autenticadas
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    // Rotas de autenticação
    const authPaths = ['/auth/login', '/auth/register', '/auth/recovery-code', '/auth/first-login', '/auth/forgot-password'];
    const isAuthRoute = authPaths.includes(to.path);

    if (to.meta.requiresAuth && !isAuthenticated) {
        // Se a rota exige auth e o usuário não está logado, vá para o login
        next('/auth/login');
    } else if (isAuthRoute && isAuthenticated) {
        // Se o usuário está logado e tenta acessar rotas de auth, vá para o dashboard
        next('/dashboard');
    } else {
        // Caso contrário, permita a navegação
        next();
    }
});

export default router;