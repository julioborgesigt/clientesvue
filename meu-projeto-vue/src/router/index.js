// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore'; // Importar notificationStore
import { logger } from '@/utils/logger';

const AuthView = () => import('../views/AuthView.vue');
const LoginForm = () => import('../components/auth/LoginForm.vue');
const RegisterForm = () => import('../components/auth/RegisterForm.vue');
const RecoveryCodeForm = () => import('../components/auth/RecoveryCodeForm.vue');
const FirstLoginForm = () => import('../components/auth/FirstLoginForm.vue');
const ForgotPasswordForm = () => import('../components/auth/ForgotPasswordForm.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const AdminView = () => import('../views/AdminView.vue');

const routes = [
    {
        path: '/auth',
        component: AuthView,
        children: [
            { path: 'login', name: 'Login', component: LoginForm },
            { path: 'register', name: 'Register', component: RegisterForm },
            { path: 'recovery-code', name: 'RecoveryCode', component: RecoveryCodeForm },
            { path: 'first-login', name: 'FirstLogin', component: FirstLoginForm },
            { path: 'forgot-password', name: 'ForgotPassword', component: ForgotPasswordForm },
        ],
    },
    { path: '/login', redirect: '/auth/login' },
    { path: '/register', redirect: '/auth/register' },
    { path: '/first-login', redirect: '/auth/first-login' },
    { path: '/forgot-password', redirect: '/auth/forgot-password' },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true },
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminView,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: '/', redirect: '/auth/login' },
    { path: '/:pathMatch(.*)*', redirect: '/auth/login' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    const { isAuthenticated, isAdmin } = authStore;

    const authPaths = ['/auth/login', '/auth/register', '/auth/recovery-code', '/auth/first-login', '/auth/forgot-password'];
    const isAuthRoute = authPaths.includes(to.path);

    // 1. Rota requer admin e usuário não é admin
    if (to.meta.requiresAdmin && !isAdmin) {
        const userEmail = authStore.user?.email || 'desconhecido';

        if (authStore.user) {
            notificationStore.error(
                `Acesso negado. Apenas administradores podem acessar esta área.`
            );
        } else {
            notificationStore.error('Você precisa estar logado como administrador.');
        }

        logger.warn(`Tentativa de acesso admin negada para o usuário: ${userEmail}`);
        return next('/dashboard');
    }

    // 2. Rota requer autenticação e usuário não está logado
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/auth/login');
    }

    // 3. Usuário logado tentando acessar páginas de login/registro
    if (isAuthRoute && isAuthenticated) {
        return next('/dashboard');
    }

    // 4. Caso padrão
    next();
});

export default router;