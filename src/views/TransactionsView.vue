<!-- src/views/TransactionsView.vue -->
<template>
  <div class="transactions-page p-6">
    <!-- Encabezado de la página y botón para añadir transacción -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Transacciones</h1>
      <button
        @click="openTransactionModal()"
        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
      >
        Añadir Transacción
      </button>
    </div>

    <!-- Contenedor de la tabla de transacciones -->
    <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-6 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Fecha</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Tipo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Categoría</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Cuenta</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Monto</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Detalles</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-background-card-light dark:bg-background-card-dark divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark">{{ formatDate(transaction.date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="{
                  'text-secondary-light dark:text-secondary-dark': transaction.type === 'Ingreso',
                  'text-destructive-light dark:text-destructive-dark': transaction.type === 'Gasto',
                }"
                class="inline-flex items-center"
              >
                {{ transaction.type === 'Ingreso' ? '⬆️' : '⬇️' }} {{ transaction.type }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark">{{ getCategoryName(transaction.categoryId) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark">{{ getAccountName(transaction.accountId) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              :class="{
                'text-secondary-light dark:text-secondary-dark': transaction.type === 'Ingreso',
                'text-destructive-light dark:text-destructive-dark': transaction.type === 'Gasto',
              }"
            >
              {{ formatCurrency(transaction.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark">{{ transaction.details || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openTransactionModal(transaction)" class="text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light mr-4">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span class="sr-only">Editar</span>
              </button>
              <button @click="confirmDeleteTransaction(transaction.id)" class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                <span class="sr-only">Eliminar</span>
              </button>
            </td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark italic">No hay transacciones registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Añadir/Editar Transacción -->
    <Modal :is-visible="isModalVisible" :title="currentTransactionId ? 'Editar Transacción' : 'Añadir Transacción'" @close="closeTransactionModal">
      <!-- Mensajes de notificación dentro del modal -->
      <div v-if="successMessage" class="p-3 mb-4 rounded-md bg-secondary-light text-white font-medium">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="saveTransaction">
        <div class="mb-4">
          <BaseInput
            id="transaction-date"
            label="Fecha"
            type="date"
            v-model="transactionForm.date"
            :required="true"
          />
        </div>
        <div class="mb-4">
          <BaseSelect
            id="transaction-type"
            label="Tipo"
            v-model="transactionForm.type"
            :options="[{ text: 'Ingreso', value: 'Ingreso' }, { text: 'Gasto', value: 'Gasto' }]"
            :required="true"
          />
        </div>
        <div class="mb-4">
          <BaseSelect
            id="transaction-category"
            label="Categoría"
            v-model="transactionForm.categoryId"
            :options="filteredCategories.map(cat => ({ text: cat.name, value: cat.id }))"
            placeholder="Selecciona una categoría"
            :required="true"
          />
        </div>
        <div class="mb-4">
          <BaseSelect
            id="transaction-account"
            label="Cuenta"
            v-model="transactionForm.accountId"
            :options="accounts.map(acc => ({ text: acc.name, value: acc.id }))"
            placeholder="Selecciona una cuenta"
            :required="true"
          />
        </div>
        <div class="mb-4">
          <BaseInput
            id="transaction-amount"
            label="Monto"
            type="number"
            v-model="transactionForm.amount"
            :required="true"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        <div class="mb-6">
          <BaseInput
            id="transaction-details"
            label="Detalles (Opcional)"
            type="text"
            v-model="transactionForm.details"
            placeholder="Notas sobre la transacción"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeTransactionModal"
            class="px-4 py-2 rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>

    <!-- Diálogo de Confirmación de Eliminación -->
    <ConfirmDialog
      :is-visible="isConfirmDeleteVisible"
      title="Confirmar Eliminación"
      message="¿Estás seguro de que quieres eliminar esta transacción? Esta acción revertirá el saldo de la cuenta asociada."
      @confirm="deleteConfirmedTransaction"
      @cancel="cancelDeleteTransaction"
    />
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
import type { Transaction } from '../types/Transaction'; // Importa la interfaz de Transacción
import { Timestamp } from 'firebase/firestore'; // Importa Timestamp de Firebase
import { USER_UID } from '../composables/useUserSetup'; // Importa el UID quemado

// --- Stores de Pinia ---
const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const accountsStore = useAccountsStore();

// --- Estados del Formulario y Modal ---
const isModalVisible = ref(false);
const currentTransactionId = ref<string | null>(null); // ID de la transacción si estamos editando
const transactionForm = ref({
  date: new Date().toISOString().slice(0, 10), // Fecha actual por defecto (YYYY-MM-DD)
  description: '',
  type: 'Gasto' as 'Ingreso' | 'Gasto', // Tipo por defecto
  categoryId: '',
  accountId: '',
  amount: 0,
  details: '', // Campo opcional
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

// --- Estados del Diálogo de Confirmación ---
const isConfirmDeleteVisible = ref(false);
const transactionToDeleteId = ref<string | null>(null);

// --- Datos Reactivos de los Stores ---
const transactions = computed(() => transactionsStore.transactions);
const categories = computed(() => categoriesStore.categories);
const accounts = computed(() => accountsStore.accounts);

// --- Propiedades Computadas para la UI ---

// Filtra las categorías según el tipo de transacción seleccionado
const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === transactionForm.value.type);
});

// Obtiene el nombre de la categoría dado su ID
const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name || 'Categoría desconocida';
};

// Obtiene el nombre de la cuenta dado su ID
const getAccountName = (accountId: string) => {
  return accounts.value.find(a => a.id === accountId)?.name || 'Cuenta desconocida';
};

// Formatea la fecha a 'DD/MM'
const formatDate = (timestamp: Timestamp | Date) => {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit' }).format(date);
};

// Formatea el monto a formato de moneda '$XX.XX'
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
};

// --- Funciones de Control de Modal y Formulario ---

// Limpia los mensajes de notificación
const clearMessages = () => {
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  successMessage.value = null;
  errorMessage.value = null;
};

// Muestra un mensaje de éxito
const showSuccessMessage = (message: string) => {
  clearMessages();
  successMessage.value = message;
  messageTimeout = setTimeout(() => {
    successMessage.value = null;
  }, 3000); // Ocultar después de 3 segundos
};

// Muestra un mensaje de error
const showErrorMessage = (message: string) => {
  clearMessages();
  errorMessage.value = message;
  messageTimeout = setTimeout(() => {
    errorMessage.value = null;
  }, 5000); // Ocultar después de 5 segundos
};

// Abre el modal de transacción (para añadir o editar)
const openTransactionModal = (transaction?: Transaction) => {
  clearMessages(); // Limpia cualquier mensaje anterior
  if (transaction) {
    currentTransactionId.value = transaction.id;
    // Convertir Timestamp a string 'YYYY-MM-DD' para el input type="date"
    const dateValue = transaction.date instanceof Timestamp
      ? transaction.date.toDate()
      : new Date(transaction.date);
    
    // Asegurarse de que la fecha sea válida antes de formatear
    const dateString = isNaN(dateValue.getTime()) ? new Date().toISOString().slice(0, 10) : dateValue.toISOString().slice(0, 10);

    transactionForm.value = {
      date: dateString,
      description: transaction.description,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      amount: transaction.amount,
      details: transaction.details || '',
    };
  } else {
    // Resetear formulario para nueva transacción
    currentTransactionId.value = null;
    transactionForm.value = {
      date: new Date().toISOString().slice(0, 10), // Fecha actual por defecto
      description: '',
      type: 'Gasto', // Por defecto a Gasto
      categoryId: filteredCategories.value.length > 0 ? filteredCategories.value[0].id : '', // Primera categoría filtrada
      accountId: accounts.value.length > 0 ? accounts.value[0].id : '', // Primera cuenta
      amount: 0,
      details: '',
    };
  }
  isModalVisible.value = true;
};

// Cierra el modal y resetea el formulario
const closeTransactionModal = () => {
  isModalVisible.value = false;
  currentTransactionId.value = null;
  // Resetear formulario a valores iniciales (para nueva transacción)
  transactionForm.value = {
    date: new Date().toISOString().slice(0, 10),
    description: '',
    type: 'Gasto',
    categoryId: '',
    accountId: '',
    amount: 0,
    details: '',
  };
  clearMessages(); // Asegura que los mensajes se limpien al cerrar
};

// Guarda o actualiza una transacción
const saveTransaction = async () => {
  clearMessages(); // Limpia mensajes al intentar guardar

  // --- Validación del Formulario ---
  if (transactionForm.value.amount <= 0) {
    showErrorMessage('El monto debe ser mayor que cero.');
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
    // Asegurarse de que transactionForm.value.date es una cadena válida antes de crear el objeto Date
    let dateToParse = transactionForm.value.date;
    if (typeof dateToParse !== 'string' || !dateToParse) {
      // Si no es una cadena o está vacía, usar la fecha actual como fallback
      dateToParse = new Date().toISOString().slice(0, 10);
      console.warn('transactionForm.value.date era inválido o vacío, usando la fecha actual como predeterminada.');
    }

    const transactionDate = new Date(dateToParse);
    if (isNaN(transactionDate.getTime())) {
      showErrorMessage('Fecha inválida. Por favor, selecciona una fecha válida.');
      return;
    }

    const transactionData = {
      ...transactionForm.value,
      date: transactionDate, // Pasa el objeto Date
      amount: parseFloat(transactionForm.value.amount.toFixed(2)), // Asegura 2 decimales
    };

    if (currentTransactionId.value) {
      // Editar transacción
      await transactionsStore.updateTransaction(currentTransactionId.value, transactionData);
      showSuccessMessage('Transacción actualizada correctamente.');
    } else {
      // Añadir nueva transacción
      await transactionsStore.addTransaction(transactionData);
      showSuccessMessage('Transacción guardada correctamente.');
    }
    closeTransactionModal(); // Cierra el modal después de guardar
  } catch (error: any) {
    console.error('Error al guardar/actualizar transacción:', error);
    showErrorMessage(`Error al guardar la transacción: ${error.message}`);
  }
};

// --- Funciones de Eliminación ---

// Muestra el diálogo de confirmación para eliminar
const confirmDeleteTransaction = (id: string) => {
  transactionToDeleteId.value = id;
  isConfirmDeleteVisible.value = true;
};

// Elimina la transacción después de la confirmación
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

// Cancela la eliminación
const cancelDeleteTransaction = () => {
  isConfirmDeleteVisible.value = false;
  transactionToDeleteId.value = null;
};

// --- Lógica de Inicialización ---

onMounted(async () => {
  // Cargar todas las categorías y cuentas al inicio
  await categoriesStore.fetchCategories();
  await accountsStore.fetchAccounts();
  await transactionsStore.fetchTransactions(); // Cargar transacciones

  // Establecer valores por defecto para los selectores si están vacíos
  if (filteredCategories.value.length > 0 && !transactionForm.value.categoryId) {
    transactionForm.value.categoryId = filteredCategories.value[0].id;
  }
  if (accounts.value.length > 0 && !transactionForm.value.accountId) {
    transactionForm.value.accountId = accounts.value[0].id;
  }
});

// Observar cambios en el tipo de transacción para actualizar las categorías filtradas
watch(() => transactionForm.value.type, (newType) => {
  // Cuando el tipo cambia, resetea la categoría seleccionada si la actual no es válida para el nuevo tipo
  const currentCategoryIsValid = filteredCategories.value.some(cat => cat.id === transactionForm.value.categoryId);
  if (!currentCategoryIsValid && filteredCategories.value.length > 0) {
    transactionForm.value.categoryId = filteredCategories.value[0].id; // Selecciona la primera categoría del nuevo tipo
  } else if (filteredCategories.value.length === 0) {
    transactionForm.value.categoryId = ''; // No hay categorías para este tipo
  }
});
</script>
