// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getAuth } from 'firebase/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { 
      title: 'Iniciar sesión',
      requiresGuest: true // Solo para usuarios no autenticados
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { 
      title: 'Panel de Control',
      requiresAuth: true 
    }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('../views/TransactionsView.vue'),
    meta: { 
      title: 'Transacciones',
      requiresAuth: true 
    }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/CategoriesView.vue'),
    meta: { 
      title: 'Categorías',
      requiresAuth: true 
    }
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('../views/AccountsView.vue'),
    meta: { 
      title: 'Cuentas',
      requiresAuth: true 
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { 
      title: 'Configuración',
      requiresAuth: true 
    }
  },
  // Ruta comodín para 404
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const user = auth.currentUser
  
  // Actualizar el título del documento
  document.title = to.meta.title ? `FinanceDiamond - ${to.meta.title}` : 'FinanceDiamond'
  
  // Si la ruta requiere autenticación y no hay usuario
  if (to.meta.requiresAuth && !user) {
    next({ name: 'login' })
    return
  }
  
  // Si la ruta es solo para invitados (login) y ya hay usuario autenticado
  if (to.meta.requiresGuest && user) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router