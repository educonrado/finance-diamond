<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Encabezado y Selectores -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Resumen Financiero</h1>
      <div class="flex gap-2">
        <select v-model="selectedMonth"
          class="form-select border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white">
          <option v-for="(month, index) in months" :key="index" :value="index + 1">
            {{ month }}
          </option>
        </select>
        <select v-model="selectedYear"
          class="form-select border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white">
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard title="Balance Total" :value="formattedBalance" color="blue" />
      <SummaryCard title="Ingresos del Mes" :value="formattedIncome" color="green" :change="incomeChange" />
      <SummaryCard title="Gastos del Mes" :value="formattedExpenses" color="red" :change="expenseChange" />
      <SummaryCard title="Margen Neto" :value="formattedNet" :color="netIsPositive ? 'green' : 'red'" />
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Donut Chart -->
      <ChartCard title="Balance por Cuentas">
        <DonutChart :accounts="accountsStore.accounts" />
      </ChartCard>


      <ChartCard title="Ingresos vs Gastos (6 meses)">
        <LineChart :transactions="transactionsStore.transactions" :selectedMonth="selectedMonth"
          :selectedYear="selectedYear" />
      </ChartCard>
    </div>

    <ChartCard title="Categorías con Mayor Gasto">
      <BarChart :transactions="transactionsStore.transactions" :categories="categoriesStore.categories"
        :selectedMonth="selectedMonth" :selectedYear="selectedYear" />
    </ChartCard>


    <!-- Botones flotantes con menú expandible -->
    <div class="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      <!-- Overlay para cerrar menú -->
      <div v-if="isMenuOpen" @click="closeMenu" class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm -z-10"
        aria-hidden="true"></div>

      <!-- Botones secundarios (aparecen cuando está expandido) -->
      <Transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-75 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-4">
        <div v-if="isMenuOpen" class="flex flex-col items-end gap-3">
          <!-- Botón Nueva Transferencia -->
          <button @click="goToNewTransfer"
            class="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Crear nueva transferencia entre cuentas">
            <span class="hidden sm:inline whitespace-nowrap">Nueva Transferencia</span>
            <span class="sm:hidden">Transferencia</span>
            <div
              class="w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </button>

          <!-- Botón Nueva Transacción -->
          <button @click="goToNewTransaction"
            class="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Crear nueva transacción de ingreso o gasto">
            <span class="hidden sm:inline whitespace-nowrap">Nueva Transacción</span>
            <span class="sm:hidden">Transacción</span>
            <div
              class="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </button>
        </div>
      </Transition>

      <!-- Botón principal (FAB) -->
      <button @click="toggleMenu" :class="[
        'relative w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center group',
        isMenuOpen && 'rotate-45'
      ]" :aria-label="isMenuOpen ? 'Cerrar menú de acciones' : 'Abrir menú de acciones rápidas'"
        :aria-expanded="isMenuOpen">
        <!-- Icono que rota -->
        <svg class="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>

        <!-- Efecto de ripple -->
        <div
          class="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200">
        </div>
      </button>

      <!-- Indicador de acceso rápido (opcional) -->
      <div v-if="!hasSeenTooltip && !isMenuOpen"
        class="absolute -top-2 -left-20 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg animate-pulse">
        Acciones rápidas
        <div class="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'

// Imports de componentes (crear luego)
import SummaryCard from '../components/dashboard/SummaryCard.vue';
import LineChart from '@/components/dashboard/LineChart.vue';
import BarChart from '@/components/dashboard/BarChart.vue';
import { getMonthlyIncomeAndExpenses } from '@/utils/financeUtils'

import { useTransactionsStore } from '@/stores/transactions'
import type { Category } from '../types/Category';
import { useCategoriesStore } from '@/stores/categories';

// Pinia Stores
const categoriesStore = useCategoriesStore();

const transactionsStore = useTransactionsStore()
await transactionsStore.fetchTransactions()


// Fecha actual
const now = new Date()
// Estado del menú
const isMenuOpen = ref(false)
const hasSeenTooltip = ref(true) // Cambiar a false si quieres mostrar el tooltip
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())

// Opciones de selección
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

// Store
const accountsStore = useAccountsStore()
await accountsStore.fetchAccounts()

// Valores simulados (próximamente se calcularán desde transacciones)
const totalBalance = computed(() =>
  accountsStore.accounts.reduce((sum, acc) => sum + acc.balance, 0)
)

const formattedBalance = computed(() =>
  totalBalance.value.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
)

const monthlyData = computed(() =>
  getMonthlyIncomeAndExpenses(transactionsStore.transactions, selectedMonth.value, selectedYear.value)
)

const formattedIncome = computed(() =>
  monthlyData.value.income.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
)

const formattedExpenses = computed(() =>
  monthlyData.value.expenses.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
)

const formattedNet = computed(() =>
  (monthlyData.value.income - monthlyData.value.expenses).toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
  })
)

const netIsPositive = computed(() => monthlyData.value.income - monthlyData.value.expenses >= 0)

const incomeChange = '+5.2%'
const expenseChange = '-3.1%'

// Navegación
const router = useRouter()
const goToNewTransaction = () => {
  closeMenu()
  router.push('/transactions/new') // Asumiendo ruta anidada para crear
}

const goToNewTransfer = () => {
  closeMenu()
  router.push('/transfers/new') // Asumiendo ruta anidada para crear
}

// Control del menú
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  hasSeenTooltip.value = true
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Cerrar menú con tecla Escape
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
