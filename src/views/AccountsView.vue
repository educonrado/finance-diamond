<!-- src/views/AccountsView.vue -->
<template>
  <div class="accounts-page py-6 px-4 md:px-6">
    <!-- Encabezado de la página y botón para añadir cuenta -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Cuentas</h1>
      <button
        @click="openAccountModal()"
        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
      >
        + Añadir
      </button>
    </div>

    <!-- Contenedor de la tabla de cuentas -->
    <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Nombre</th>
            <!-- ELIMINADO: Columna Tipo -->
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider hidden md:table-cell">Saldo Inicial</th>
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Saldo Actual</th>
            <th scope="col" class="relative px-2 py-3 md:px-6 md:py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-background-card-light dark:bg-background-card-dark divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="account in accounts" :key="account.id">
            <td class="px-2 py-4 md:px-6 md:py-4 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{{ account.name }}</td>
            <!-- ELIMINADO: Celda Tipo -->
            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-sm text-text-primary-light dark:text-text-primary-dark hidden md:table-cell">{{ formatCurrency(account.initialBalance) }}</td>
            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{{ formatCurrency(account.balance) }}</td>
            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openAccountModal(account)" class="text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light mr-1 md:mr-4">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span class="sr-only">Editar</span>
              </button>
              <button @click="confirmDeleteAccount(account.id)" class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                <span class="sr-only">Eliminar</span>
              </button>
            </td>
          </tr>
          <tr v-if="accounts.length === 0">
            <td colspan="3" class="px-6 py-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark italic">No hay cuentas registradas.</td> <!-- CORREGIDO: colspan a 3 -->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Añadir/Editar Cuenta -->
    <Modal :is-visible="isModalVisible" :title="currentAccountId ? 'Editar Cuenta' : 'Añadir Cuenta'" @close="closeAccountModal">
      <!-- Mensajes de notificación dentro del modal -->
      <div v-if="successMessage" class="p-3 mb-4 rounded-md bg-secondary-light text-white font-medium">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="saveAccount">
        <div class="mb-4">
          <BaseInput
            id="account-name"
            label="Nombre de la Cuenta"
            type="text"
            v-model="accountForm.name"
            :required="true"
            placeholder="Ej. Cuenta de Ahorros, Efectivo"
          />
        </div>
        <!-- ELIMINADO: Campo Tipo de Cuenta (BaseSelect) -->
        <div class="mb-4">
          <BaseInput
            id="account-initial-balance"
            label="Saldo Inicial"
            type="number"
            v-model="accountForm.initialBalance"
            :required="true"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        <!-- El Saldo Actual no se edita directamente aquí, se actualiza con transacciones -->
        <div class="mb-6" v-if="currentAccountId">
          <BaseInput
            id="account-balance"
            label="Saldo Actual"
            type="number"
            v-model="accountForm.balance"
            :disabled="true"
            placeholder="0.00"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeAccountModal"
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
      title="Confirmar Eliminación de Cuenta"
      message="¿Estás seguro de que quieres eliminar esta cuenta? Si la cuenta tiene transacciones asociadas, no podrá ser eliminada."
      @confirm="deleteConfirmedAccount"
      @cancel="cancelDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountsStore } from '../stores/accounts';
import Modal from '../components/common/Modal.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseInput from '../components/common/BaseInput.vue';
// BaseSelect ya no es necesario en este componente si no se usa para el tipo de cuenta.
// Si se usa en otros lugares, la importación puede permanecer, pero no es usada aquí.
// import BaseSelect from '../components/common/BaseSelect.vue'; 
import type { Account } from '../types/Account'; // Importa la interfaz de Cuenta

// --- Stores de Pinia ---
const accountsStore = useAccountsStore();

// --- Estados del Formulario y Modal ---
const isModalVisible = ref(false);
const currentAccountId = ref<string | null>(null); // ID de la cuenta si estamos editando
const accountForm = ref({
  name: '',
  // ELIMINADO: type: 'Efectivo', // Ya no se necesita el tipo
  initialBalance: 0,
  balance: 0, // Se inicializará con initialBalance al guardar, o se cargará al editar
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

// --- Estados del Diálogo de Confirmación ---
const isConfirmDeleteVisible = ref(false);
const accountToDeleteId = ref<string | null>(null);

// --- Datos Reactivos del Store ---
const accounts = computed(() => accountsStore.accounts);

// --- Opciones para el selector de tipo de cuenta (ELIMINADO ya que 'type' se quitó) ---
// const accountTypes = ref([
//   'Efectivo',
//   'Cuenta Bancaria',
//   'Tarjeta de Crédito',
//   'Billetera Digital',
//   'Inversión',
//   'Otro'
// ]);

// --- Propiedades Computadas para la UI ---

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

// Abre el modal de cuenta (para añadir o editar)
const openAccountModal = (account?: Account) => {
  clearMessages(); // Limpia cualquier mensaje anterior
  if (account) {
    currentAccountId.value = account.id;
    accountForm.value = { ...account }; // Carga todos los campos de la cuenta
  } else {
    // Resetear formulario para nueva cuenta
    currentAccountId.value = null;
    accountForm.value = {
      name: '',
      // ELIMINADO: type: 'Efectivo', // Ya no se necesita el tipo
      initialBalance: 0,
      balance: 0, // Se actualizará al guardar
    };
  }
  isModalVisible.value = true;
};

// Cierra el modal y resetea el formulario
const closeAccountModal = () => {
  isModalVisible.value = false;
  currentAccountId.value = null;
  // Resetear formulario a valores iniciales (para nueva cuenta)
  accountForm.value = {
    name: '',
    // ELIMINADO: type: 'Efectivo', // Ya no se necesita el tipo
    initialBalance: 0,
    balance: 0,
  };
  clearMessages(); // Asegura que los mensajes se limpien al cerrar
};

// Guarda o actualiza una cuenta
const saveAccount = async () => {
  clearMessages(); // Limpia mensajes al intentar guardar

  // --- Validación del Formulario ---
  if (!accountForm.value.name.trim()) {
    showErrorMessage('El nombre de la cuenta es obligatorio.');
    return;
  }
  // ELIMINADO: Validación del tipo de cuenta
  // if (!accountForm.value.type.trim()) {
  //   showErrorMessage('El tipo de cuenta es obligatorio.');
  //   return;
  // }
  if (accountForm.value.initialBalance < 0) { // Permitir 0 como saldo inicial
    showErrorMessage('El saldo inicial no puede ser negativo.');
    return;
  }

  try {
    const accountDataToSave = {
      name: accountForm.value.name,
      initialBalance: parseFloat(accountForm.value.initialBalance.toFixed(2)), // Asegura 2 decimales
      // 'balance' no se envía directamente si es una nueva cuenta, el store lo maneja
      // Si es una edición, 'balance' ya está en accountForm.value y se pasará como parte de Partial<Account>
    };

    if (currentAccountId.value) {
      // Editar cuenta
      await accountsStore.updateAccount(currentAccountId.value, accountDataToSave);
      showSuccessMessage('Cuenta actualizada correctamente.');
    } else {
      // Añadir nueva cuenta
      // Para addAccount, solo necesitamos name, initialBalance. Balance se calcula en el store.
      await accountsStore.addAccount({
        name: accountDataToSave.name,
        initialBalance: accountDataToSave.initialBalance,
      });
      showSuccessMessage('Cuenta guardada correctamente.');
    }
    closeAccountModal(); // Cierra el modal después de guardar
  } catch (error: any) {
    console.error('Error al guardar/actualizar cuenta:', error);
    showErrorMessage(`Error al guardar la cuenta: ${error.message}`);
  }
};

// --- Funciones de Eliminación ---

// Muestra el diálogo de confirmación para eliminar
const confirmDeleteAccount = (id: string) => {
  accountToDeleteId.value = id;
  isConfirmDeleteVisible.value = true;
};

// Elimina la cuenta después de la confirmación
const deleteConfirmedAccount = async () => {
  if (accountToDeleteId.value) {
    try {
      await accountsStore.deleteAccount(accountToDeleteId.value);
      showSuccessMessage('Cuenta eliminada correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      // El store ya maneja el mensaje de error si hay transacciones asociadas
      showErrorMessage(`Error al eliminar la cuenta: ${error.message}`);
    } finally {
      isConfirmDeleteVisible.value = false;
      accountToDeleteId.value = null;
    }
  }
};

// Cancela la eliminación
const cancelDeleteAccount = () => {
  isConfirmDeleteVisible.value = false;
  accountToDeleteId.value = null;
};

// --- Lógica de Inicialización ---

onMounted(async () => {
  await accountsStore.fetchAccounts(); // Cargar cuentas al inicio
  // ELIMINADO: Establecer el tipo de cuenta por defecto si no hay ninguna seleccionada
  // if (!accountForm.value.type && accountTypes.value.length > 0) {
  //   accountForm.value.type = accountTypes.value[0];
  // }
});
</script>
