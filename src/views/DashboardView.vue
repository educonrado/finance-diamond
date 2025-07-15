<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Overlay de carga global -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <BillsStackSpinner />
      <span class="text-white text-lg mt-4 absolute top-2/3 w-full text-center">Cargando datos...</span>
    </div>

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

    <!-- KPIs con estados de carga -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <SummaryCard 
        title="Ingresos del Mes" 
        :value="transactionsLoaded ? formattedIncome : '--'" 
        color="green" 
        
        :loading="!transactionsLoaded" 
      />
      <SummaryCard 
        title="Gastos del Mes" 
        :value="transactionsLoaded ? formattedExpenses : '--'" 
        color="red" 
        
        :loading="!transactionsLoaded" 
      />
      <SummaryCard 
        title="Tarjetas de Crédito" 
        :value="totalCreditCardDebt ? formattedCreditCardDebt : '--'" 
        color="red" 
        :loading="!accountsLoaded" 
      />
      <SummaryCard 
        title="Balance Total" 
        :value="accountsLoaded ? formattedBalance : '--'" 
        color="blue" 
        :loading="!accountsLoaded" 
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Donut Chart -->
      <ChartCard title="Balance por Cuentas">
        <div v-if="!accountsLoaded" class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-32 w-32 mx-auto mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400">Cargando cuentas...</p>
          </div>
        </div>
        <DonutChart v-else :accounts="accountsStore.accounts.filter(acc => acc.includeInTotal !== false)" />
      </ChartCard>

      <ChartCard title="Ingresos vs Gastos (6 meses)">
        <div v-if="!transactionsLoaded" class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32 w-full mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400">Cargando transacciones...</p>
          </div>
        </div>
        <LineChart 
          v-else 
          :transactions="transactionsStore.transactions" 
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear" 
        />
      </ChartCard>
    </div>

    <ChartCard title="Categorías con Mayor Ingreso">
      <div v-if="!transactionsLoaded || !categoriesLoaded" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-pulse space-y-2">
            <div class="bg-gray-200 dark:bg-gray-700 rounded h-8 w-full"></div>
            <div class="bg-gray-200 dark:bg-gray-700 rounded h-6 w-3/4"></div>
            <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2"></div>
          </div>
          <p class="text-gray-500 dark:text-gray-400 mt-4">Cargando datos...</p>
        </div>
      </div>
      <BarChart 
        v-else 
        :transactions="transactionsStore.transactions" 
        :categories="categoriesStore.categories"
        :selectedMonth="selectedMonth" 
        :selectedYear="selectedYear" 
        transactionType="income"
      />
    </ChartCard>

    <ChartCard title="Categorías con Mayor Gasto">
      <div v-if="!transactionsLoaded || !categoriesLoaded" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-pulse space-y-2">
            <div class="bg-gray-200 dark:bg-gray-700 rounded h-8 w-full"></div>
            <div class="bg-gray-200 dark:bg-gray-700 rounded h-6 w-3/4"></div>
            <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2"></div>
          </div>
          <p class="text-gray-500 dark:text-gray-400 mt-4">Cargando datos...</p>
        </div>
      </div>
      <BarChart 
        v-else 
        :transactions="transactionsStore.transactions" 
        :categories="categoriesStore.categories"
        :selectedMonth="selectedMonth" 
        :selectedYear="selectedYear"
        transactionType="expense" 
      />
    </ChartCard>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useTransactionsStore } from '@/stores/transactions'
import { useCategoriesStore } from '@/stores/categories'
import { useCreditCardsStore } from '@/stores/creditCards'
import { getMonthlyIncomeAndExpenses } from '@/utils/financeUtils'
import BillsStackSpinner from '../components/common/BillsStackSpinner.vue'

// Imports de componentes
const SummaryCard = defineAsyncComponent(() => import('../components/dashboard/SummaryCard.vue'))
const LineChart = defineAsyncComponent(() => import('@/components/dashboard/LineChart.vue'))
const BarChart = defineAsyncComponent(() => import('@/components/dashboard/BarChart.vue'))
const DonutChart = defineAsyncComponent(() => import('@/components/dashboard/DonutChart.vue'))
const ChartCard = defineAsyncComponent(() => import('@/components/dashboard/ChartCard.vue'))

// Estados de carga
const accountsLoaded = ref(false)
const transactionsLoaded = ref(false)
const categoriesLoaded = ref(false)

// Computed para indicador de carga general
const isLoading = computed(() => !accountsLoaded.value || !transactionsLoaded.value || !categoriesLoaded.value)

// Pinia Stores
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const creditCardsStore = useCreditCardsStore()

// Fecha actual
const now = new Date()

// Estado del menú
const isMenuOpen = ref(false)
const hasSeenTooltip = ref(true)
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())

// Opciones de selección
const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

// Computeds financieros
const totalBalance = computed(() =>
  accountsStore.accounts.filter(acc => acc.includeInTotal !== false).reduce((sum, acc) => sum + acc.balance, 0)
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

// Cambios simulados (podrías calcularlos realmente)
const incomeChange = '0%'
const expenseChange = '0%'

// Navegación
const router = useRouter()

const goToNewTransaction = () => {
  closeMenu()
  router.push('/transactions')
}

const goToNewTransfer = () => {
  closeMenu()
  router.push('/accounts')
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

// Función para cargar datos de forma asíncrona
const loadData = async () => {
  try {
    // Cargar cuentas
    await accountsStore.fetchAccounts()
    accountsLoaded.value = true
    
    // Cargar transacciones
    await transactionsStore.fetchTransactions()
    transactionsLoaded.value = true
    
    // Cargar categorías
    await categoriesStore.fetchCategories()
    categoriesLoaded.value = true
    
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
    // Aquí podrías mostrar un toast de error o manejar el error de otra forma
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // Iniciar carga de datos sin bloquear
  loadData()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const totalCreditCardDebt = computed(() => {
  // Suma absoluta de los balances negativos de tarjetas de crédito
  return categoriesLoaded.value && accountsLoaded.value
    ? creditCardsStore.creditCards.reduce((sum: number, card: any) => sum + Math.abs(card.balance || 0), 0)
    : 0;
});

const formattedCreditCardDebt = computed(() =>
  totalCreditCardDebt.value.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
);
</script>