<!-- src/views/TransactionsView.vue -->
<template>
  <div class="transactions-page py-6 px-4 md:px-6">
    <div class="flex justify-end items-center mb-6">
      <button @click="openTransactionModal()"
        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200">
        + Añadir
      </button>
    </div>

    <!-- Mensaje de éxito como notificación flotante en la esquina superior derecha -->
    <Transition name="fade-message">
      <div v-if="successMessage" class="
        fixed top-20 right-8 z-50
        bg-white dark:bg-gray-800 text-gray-800 dark:text-white
        text-sm p-4 rounded-lg shadow-xl
        opacity-100 transition-opacity duration-500 ease-out
        max-w-xs flex items-center justify-between space-x-2
        border border-gray-200 dark:border-gray-700
        ">
        <div class="flex items-center space-x-2">
          <!-- Icono de éxito (checkmark) -->
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ successMessage }}</span>
        </div>
        <!-- Botón para cerrar la notificación manualmente -->
        <button @click="clearMessages()"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </Transition>

    <div
      class="relative bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col"
              class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Fecha</th>
            <th scope="col"
              class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Categoría</th>
            <th scope="col"
              class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider hidden md:table-cell">
              Cuenta</th>
            <th scope="col"
              class="px-2 py-3 md:px-6 md:py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Monto</th>
            <th scope="col"
              class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider hidden md:table-cell">
              Detalles</th>
            <th scope="col" class="relative px-2 py-3 md:px-6 md:py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody
          class="bg-background-card-light dark:bg-background-card-dark divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td
              class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm text-text-primary-light dark:text-text-primary-dark">
              {{ formatDate(transaction.date) }}
            </td>
            <td class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm text-text-primary-light dark:text-text-primary-dark"
              v-bind:title="transaction.details || 'Sin detalles'">
              <span :class="{
                'text-secondary-light dark:text-secondary-dark': transaction.type === 'Ingreso',
                'text-destructive-light dark:text-destructive-dark': transaction.type === 'Gasto',
              }" class="inline-flex items-center">
                {{ transaction.type === 'Ingreso' ? '▲' : '▼' }}
              </span>
              {{ getCategoryName(transaction.categoryId) }}
            </td>
            <td
              class="px-2 py-4 md:px-6 md:py-4 text-sm text-text-primary-light dark:text-text-primary-dark hidden md:table-cell">
              {{ getAccountName(transaction.accountId) }}</td>
            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium" :class="{
              'text-secondary-light dark:text-secondary-dark': transaction.type === 'Ingreso',
              'text-destructive-light dark:text-destructive-dark': transaction.type === 'Gasto',
            }">
              {{ formatCurrency(transaction.amount) }}
            </td>
            <td
              class="px-2 py-4 md:px-6 md:py-4 text-sm text-text-primary-light dark:text-text-primary-dark hidden md:table-cell">
              {{ transaction.details || '-' }}</td>
            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openTransactionModal(transaction)"
                class="text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light mr-1 md:mr-4">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                  </path>
                </svg>
                <span class="sr-only">Editar</span>
              </button>
              <button @click="confirmDeleteTransaction(transaction.id)"
                class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                  </path>
                </svg>
                <span class="sr-only">Eliminar</span>
              </button>
            </td>
          </tr>
          <tr v-if="transactions.length === 0 && !isLoadingGlobal">
            <td colspan="6"
              class="px-6 py-4 text-center text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark italic">
              No hay transacciones registradas.</td>
          </tr>
        </tbody>
      </table>

      <LoadingSpinner v-if="isLoadingGlobal" />
    </div>

    <Modal :is-visible="isModalVisible" :title="currentTransactionId ? 'Editar Transacción' : 'Añadir Transacción'"
      @close="closeTransactionModal">
      <!-- Mensajes de notificación dentro del modal (Solo errorMessage aquí) -->
      <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="saveTransaction">
        <!-- Nueva fila para Monto y Tipo -->
        <div class="flex flex-col md:flex-row md:space-x-4 mb-4">
          <div class="w-full md:w-1/2 mb-4 md:mb-0">
            <BaseInput id="transaction-amount" label="Valor" type="number" v-model="transactionForm.amount"
              :required="true" step="0.01" max="9999999.99" placeholder="0,00" suffix="USD">
              <template #prefix>
                <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
              </template>
            </BaseInput>
          </div>

          <div class="w-full md:w-1/2">
            <!-- Toggle Button Group para Tipo -->
            <label
              class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Tipo</label>
            <div class="flex rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600">
              <button type="button" @click="transactionForm.type = 'Ingreso'" :class="{
                'bg-primary-light text-white dark:bg-primary-dark': transactionForm.type === 'Ingreso',
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600': transactionForm.type !== 'Ingreso'
              }"
                class="flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50">
                Ingreso
              </button>
              <button type="button" @click="transactionForm.type = 'Gasto'" :class="{
                'bg-primary-light text-white dark:bg-primary-dark': transactionForm.type === 'Gasto',
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600': transactionForm.type !== 'Gasto'
              }"
                class="flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50">
                Gasto
              </button>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <BaseSelect id="transaction-category" label="Categoría" v-model="transactionForm.categoryId"
            :options="filteredCategories.map(cat => ({ text: cat.icon + ' ' + cat.name, value: cat.id }))"
            placeholder="Selecciona una categoría" :required="true" />
        </div>
        <div class="mb-4">
          <BaseSelect id="transaction-account" label="Cuenta" v-model="transactionForm.accountId"
            :options="accounts.map(acc => ({ text: acc.name, value: acc.id }))" placeholder="Selecciona una cuenta"
            :required="true" />
        </div>
        <div class="mb-6">
          <BaseInput id="transaction-details" label="Detalles (Opcional)" type="text" v-model="transactionForm.details"
            placeholder="Notas sobre la transacción" />
        </div>
        <div class="mb-4">
          <BaseInput id="transaction-date" label="Fecha" type="date" v-model="transactionForm.date" :required="true" />
        </div>
        <div class="flex justify-end space-x-3">
          <button type="button" @click="closeTransactionModal"
            class="px-4 py-2 rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            Cancelar
          </button>
          <button type="submit"
            class="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200">
            Guardar
          </button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog :is-visible="isConfirmDeleteVisible" title="Confirmar Eliminación"
      message="¿Estás seguro de que quieres eliminar esta transacción? Esta acción revertirá el saldo de la cuenta asociada."
      @confirm="deleteConfirmedTransaction" @cancel="cancelDeleteTransaction" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTransactionsStore } from '../stores/transactions';
import { useCategoriesStore } from '../stores/categories';
import { useAccountsStore } from '../stores/accounts';
import Modal from '../components/common/Modal.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import type { Transaction } from '../types/Transaction';
import { Timestamp } from 'firebase/firestore';
import { parseLocalDateString } from '../utils/dateUtils';
// --- Stores de Pinia ---
const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const accountsStore = useAccountsStore();

// --- Estados del Formulario y Modal ---
const isModalVisible = ref(false);
const currentTransactionId = ref<string | null>(null);
const transactionForm = ref({
  date: new Date().toISOString().slice(0, 10),
  type: 'Ingreso' as 'Ingreso' | 'Gasto',
  categoryId: '',
  accountId: '',
  amount: 0,
  details: '',
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

const isConfirmDeleteVisible = ref(false);
const transactionToDeleteId = ref<string | null>(null);

const transactions = computed(() => transactionsStore.transactions);
const categories = computed(() => categoriesStore.categories);
const accounts = computed(() => accountsStore.accounts);

const isLoadingGlobal = computed(() => {
  return transactionsStore.isLoading || accountsStore.isLoading || categoriesStore.isLoading;
});

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === transactionForm.value.type);
});

const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name || 'Categoría desconocida';
};

const getAccountName = (accountId: string) => {
  return accounts.value.find(a => a.id === accountId)?.name || 'Cuenta desconocida';
};

const formatDate = (timestamp: Timestamp | Date) => {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short'
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
};

const clearMessages = () => {
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  successMessage.value = null;
  errorMessage.value = null;
};

const showSuccessMessage = (message: string) => {
  clearMessages();
  successMessage.value = message;
  messageTimeout = setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

const showErrorMessage = (message: string) => {
  clearMessages();
  errorMessage.value = message;
  messageTimeout = setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
};

const openTransactionModal = (transaction?: Transaction) => {
  clearMessages();
  if (transaction) {
    currentTransactionId.value = transaction.id;
    const dateValue = transaction.date instanceof Timestamp
      ? transaction.date.toDate()
      : new Date(transaction.date);

    const dateString = isNaN(dateValue.getTime()) ? new Date().toISOString().slice(0, 10) : dateValue.toISOString().slice(0, 10);

    transactionForm.value = {
      date: dateString,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      amount: transaction.amount,
      details: transaction.details || '',
    };
  } else {
    currentTransactionId.value = null;
    transactionForm.value = {
      date: new Date().toISOString().slice(0, 10),
      type: 'Ingreso',
      categoryId: filteredCategories.value.length > 0 ? filteredCategories.value[0].id : '',
      accountId: accounts.value.length > 0 ? accounts.value[0].id : '',
      amount: 0,
      details: '',
    };
  }
  isModalVisible.value = true;
};

const closeTransactionModal = () => {
  isModalVisible.value = false;
  currentTransactionId.value = null;
  transactionForm.value = {
    date: new Date().toISOString().slice(0, 10),
    type: 'Ingreso',
    categoryId: '',
    accountId: '',
    amount: 0,
    details: '',
  };
};

const saveTransaction = async () => {
  clearMessages();

  // --- Validación del Formulario ---
  // Convertir amount a número antes de la validación y toFixed
  const parsedAmount = parseFloat(transactionForm.value.amount.toString());

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    showErrorMessage('El monto debe ser un número válido y mayor que cero.');
    return;
  }
  if (!transactionForm.value.type) {
    showErrorMessage('El tipo de transacción es obligatorio.');
    return;
  }
  if (!transactionForm.value.categoryId) {
    showErrorMessage('La categoría es obligatoria.');
    return;
  }
  if (!transactionForm.value.accountId) {
    showErrorMessage('La cuenta es obligatoria.');
    return;
  }

  try {
    let dateToParse = transactionForm.value.date;
    if (typeof dateToParse !== 'string' || !dateToParse) {
      dateToParse = new Date().toISOString().slice(0, 10);
      console.warn('transactionForm.value.date era inválido o vacío, usando la fecha actual como predeterminada.');
    }

    const transactionDate = parseLocalDateString(dateToParse);
    if (isNaN(transactionDate.getTime())) {
      showErrorMessage('Fecha inválida. Por favor, selecciona una fecha válida.');
      return;
    }

    const transactionData = {
      ...transactionForm.value,
      date: transactionDate,
      amount: parseFloat(parsedAmount.toFixed(2)), // Usar parsedAmount aquí
    };

    if (currentTransactionId.value) {
      await transactionsStore.updateTransaction(currentTransactionId.value, transactionData);
      showSuccessMessage('Transacción actualizada correctamente.');
    } else {
      await transactionsStore.addTransaction(transactionData);
      showSuccessMessage('Transacción guardada correctamente.');
    }
    closeTransactionModal();
  } catch (error: any) {
    console.error('Error al guardar/actualizar transacción:', error);
    showErrorMessage(`Error al guardar la transacción: ${error.message}`);
  }
};

const confirmDeleteTransaction = (id: string) => {
  transactionToDeleteId.value = id;
  isConfirmDeleteVisible.value = true;
};

const deleteConfirmedTransaction = async () => {
  if (transactionToDeleteId.value) {
    try {
      await transactionsStore.deleteTransaction(transactionToDeleteId.value);
      showSuccessMessage('Transacción eliminada correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar transacción:', error);
      showErrorMessage(`Error al eliminar la transacción: ${error.message}`);
    } finally {
      isConfirmDeleteVisible.value = false;
      transactionToDeleteId.value = null;
    }
  }
};

const cancelDeleteTransaction = () => {
  isConfirmDeleteVisible.value = false;
  transactionToDeleteId.value = null;
};

onMounted(async () => {
  await categoriesStore.fetchCategories();
  await accountsStore.fetchAccounts();
  await transactionsStore.fetchTransactions();

  if (filteredCategories.value.length > 0 && !transactionForm.value.categoryId) {
    transactionForm.value.categoryId = filteredCategories.value[0].id;
  }
  if (accounts.value.length > 0 && !transactionForm.value.accountId) {
    transactionForm.value.accountId = accounts.value[0].id;
  }
});
watch(() => transactionForm.value.type, (newType) => {
  const currentCategoryIsValid = filteredCategories.value.some(cat => cat.id === transactionForm.value.categoryId);
  if (!currentCategoryIsValid && filteredCategories.value.length > 0) {
    transactionForm.value.categoryId = filteredCategories.value[0].id;
  } else if (filteredCategories.value.length === 0) {
    transactionForm.value.categoryId = '';
  }
});
</script>

<style scoped>
/* Estilos para la transición de la notificación flotante */
.fade-message-enter-active,
.fade-message-leave-active {
  transition: opacity 0.5s ease-out;
}

.fade-message-enter-from,
.fade-message-leave-to {
  opacity: 0;
}

.fade-message-enter-to,
.fade-message-leave-from {
  opacity: 1;
}
</style>
