// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'dashboard',
    // Asegúrate de que la ruta al archivo de la vista sea correcta
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Panel de Control' }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('../views/TransactionsView.vue'),
    meta: { title: 'Transacciones' }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/CategoriesView.vue'),
    meta: { title: 'Categorías' }
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('../views/AccountsView.vue'),
    meta: { title: 'Cuentas' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Configuración' }
  },
  // Ruta comodín para 404
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' }
  }
];

const router = createRouter({
  // ¡CAMBIO CLAVE AQUÍ! Usamos import.meta.env.BASE_URL para Vite
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Opcional: Actualizar el título del documento basado en la ruta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `FinanceDiamond - ${to.meta.title}` : 'FinanceDiamond';
  next();
});

export default router;