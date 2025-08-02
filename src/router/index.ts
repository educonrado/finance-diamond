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
      requiresGuest: true
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
  {
    path: '/creditcards',
    name: 'creditcards',
    component: () => import('../views/CreditCardsView.vue'),
    meta: {
      title: 'Tarjetas de Crédito',
      requiresAuth: true
    }
  },
  {
    path: '/loans',
    name: 'loans',
    component: () => import('@/views/LoansView.vue'),
    meta: {
      title: 'Préstamos',
      requiresAuth: true
    }
  },
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

  document.title = to.meta.title ? `FinanceDiamond - ${to.meta.title}` : 'FinanceDiamond'

  if (to.meta.requiresAuth && !user) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresGuest && user) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router