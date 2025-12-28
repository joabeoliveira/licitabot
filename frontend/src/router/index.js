import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../store/auth'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { guest: true }
    },
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/radar',
        name: 'Radar',
        component: () => import('../views/Radar.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/precificacao',
        name: 'Precificacao',
        component: () => import('../views/Precificacao.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/conformidade',
        name: 'Conformidade',
        component: () => import('../views/Conformidade.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/automacao',
        name: 'Automacao',
        component: () => import('../views/Automacao.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const { isAuthenticated } = useAuth();
    const isAuthed = isAuthenticated();

    if (to.meta.requiresAuth && !isAuthed) {
        next('/login');
    } else if (to.meta.guest && isAuthed) {
        next('/');
    } else {
        next();
    }
});

export default router
