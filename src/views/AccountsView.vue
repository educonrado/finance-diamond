<!-- src/views/AccountsView.vue -->
<template>
  <div class="accounts-page py-6 px-4 md:px-6">
    <!-- Overlay de loading global -->
    <div v-if="isLoadingGlobal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <BillsStackSpinner />
      <span class="text-white text-lg mt-4 absolute top-2/3 w-full text-center">Cargando cuentas...</span>
    </div>

    <!-- Encabezado de la página y botón para añadir cuenta -->
    <div class="flex justify-end items-center mb-6">
      <button
        @click="openAccountModal()"
        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
        :disabled="isLoadingGlobal"
      >
        + 
      </button>
      <button
        v-if="canShowTransferButton"
        @click="openTransferModal"
        class="ml-3 px-6 py-3 bg-secondary-light dark:bg-secondary-dark text-white rounded-lg shadow-md hover:bg-secondary-dark dark:hover:bg-secondary-light transition-colors duration-200"
        :disabled="isLoadingGlobal"
      >
        Mover dinero a cuenta
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
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ successMessage }}</span>
        </div>
        <button @click="clearMessages()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Contenedor de la tabla de cuentas -->
    <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Nombre</th>
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Saldo Actual</th>
            <th scope="col" class="relative px-2 py-3 md:px-6 md:py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-background-card-light dark:bg-background-card-dark divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="account in accounts" :key="account.id">
            <td class="px-2 py-4 md:px-6 md:py-4 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              <span class="inline-block w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: account.color }"></span>
              {{ account.name }}
            </td>
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
          <tr v-if="accounts.length === 0 && !accountsStore.isLoading">
            <td colspan="3" class="px-6 py-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark italic">No hay cuentas registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Añadir/Editar Cuenta -->
    <Modal :is-visible="isModalVisible" :title="currentAccountId ? 'Editar Cuenta' : 'Añadir Cuenta'" @close="closeAccountModal">
      <div v-if="isSavingAccount">
        <BillsStackSpinner />
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
        <div class="mb-4" v-if="!currentAccountId">
          <BaseInput
            id="account-initial-balance"
            label="Saldo Inicial"
            type="number"
            v-model="accountForm.initialBalance"
            :required="true"
            step="0.01"
            placeholder="0.00"
            suffix="USD"
          >
            <template #prefix>
              <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </template>
          </BaseInput>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Color</label>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="color in availableColors"
              :key="color"
              @click="accountForm.color = color"
              class="w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200"
              :class="{ 'ring-2 ring-offset-2 ring-primary-light dark:ring-primary-dark': accountForm.color === color }"
              :style="{ backgroundColor: color, borderColor: color }"
            >
              <svg v-if="accountForm.color === color" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
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

    <!-- Modal para Transferencia entre Cuentas -->
    <Modal :is-visible="isTransferModalVisible" title="Mover Dinero entre Cuentas" @close="closeTransferModal">
      <div v-if="isSavingTransfer" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
    <BillsStackSpinner />
  </div>
  <TransferFormModal
    @saving="isSavingTransfer = true"
    @saved="isSavingTransfer = false; onTransferSuccess()"
    @close="closeTransferModal"
  />
    </Modal>

    <!-- Historial de transferencias internas -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Historial de movimientos entre cuentas</h3>
      <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Fecha</th>
              <th class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Origen</th>
              <th class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Destino</th>
              <th class="px-2 py-3 md:px-6 md:py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Monto</th>
              <th class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Detalles</th>
              <th class="px-2 py-3 md:px-6 md:py-3 text-center text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-background-card-light dark:bg-background-card-dark divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="transfer in filteredTransfers" :key="transfer.id">
              <td class="px-2 py-4 md:px-6 md:py-4 text-sm">{{ formatDate(transfer.date) }}</td>
              <td class="px-2 py-4 md:px-6 md:py-4 text-sm">
                {{ getAccountName(transfer.fromAccountId) }}
              </td>
              <td class="px-2 py-4 md:px-6 md:py-4 text-sm">
                {{ getAccountName(transfer.toAccountId) }}
              </td>
              <td class="px-2 py-4 md:px-6 md:py-4 text-right text-sm font-medium">{{ formatCurrency(transfer.amount) }}</td>
              <td class="px-2 py-4 md:px-6 md:py-4 text-sm">{{ transfer.details }}</td>
              <td class="px-2 py-4 md:px-6 md:py-4 text-center">
                <button
                  @click="confirmDeleteTransfer(transfer.id)"
                  class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light"
                  title="Eliminar transferencia"
                >
                  <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredTransfers.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark italic">No hay movimientos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Diálogo de Confirmación de Eliminación -->
    <ConfirmDialog
      :is-visible="isConfirmDeleteVisible"
      title="Confirmar Eliminación de Cuenta"
      message="¿Estás seguro de que quieres eliminar esta cuenta? Si la cuenta tiene transacciones asociadas, no podrá ser eliminada."
      @confirm="deleteConfirmedAccount"
      @cancel="cancelDeleteAccount"
    />
    <!-- Diálogo de Confirmación de Eliminación de Transferencia -->
    <ConfirmDialog
      :is-visible="isConfirmDeleteTransferVisible"
      title="Eliminar transferencia"
      message="¿Seguro que deseas eliminar esta transferencia? Esta acción revertirá los saldos de las cuentas involucradas."
      @confirm="deleteConfirmedTransfer"
      @cancel="cancelDeleteTransfer"
    />
    <div v-if="isDeletingAccount">
      <BillsStackSpinner />
    </div>
    <div v-if="isDeletingTransfer">
      <BillsStackSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountsStore } from '../stores/accounts';
import { useTransfersStore } from '../stores/transfers';
import { useCreditCardsStore } from '../stores/creditCards';
import Modal from '../components/common/Modal.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BillsStackSpinner from '../components/common/BillsStackSpinner.vue';
import TransferFormModal from '../components/common/TransferFormModal.vue';
import type { Account } from '../types/Account';
import { Timestamp } from 'firebase/firestore';

// --- Stores de Pinia ---
const accountsStore = useAccountsStore();
const transfersStore = useTransfersStore();
const creditCardsStore = useCreditCardsStore();

const isSavingAccount = ref(false);
const isSavingTransfer = ref(false)

// --- Estados del Formulario y Modal ---
const isModalVisible = ref(false);
const currentAccountId = ref<string | null>(null);
const accountForm = ref({
  name: '',
  initialBalance: 0,
  balance: 0,
  color: '#60A5FA', // Color por defecto (azul)
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

// --- Estados del Diálogo de Confirmación ---
const isConfirmDeleteVisible = ref(false);
const accountToDeleteId = ref<string | null>(null);
const isDeletingAccount = ref(false);
const isDeletingTransfer = ref(false);

// --- Datos Reactivos del Store ---
const accounts = computed(() => accountsStore.accounts);
const creditCards = computed(() => creditCardsStore.creditCards);
const transfers = computed(() => transfersStore.transfers);

// --- Colores disponibles para el selector (paleta mejorada) ---
const availableColors = [
  '#60A5FA', // blue-400
  '#34D399', // green-400
  '#FCD34D', // yellow-300
  '#FB7185', // rose-400
  '#A78BFA', // violet-400
  '#F472B6', // pink-400
  '#A3A3A3', // gray-400
  '#F87171', // red-400
  '#10B981', // emerald-500
  '#F59E42', // orange-400
  '#6366F1', // indigo-500
  '#F43F5E', // pink-600
];
const isConfirmDeleteTransferVisible = ref(false);
const transferToDeleteId = ref<string | null>(null);

const confirmDeleteTransfer = (id: string) => {
  transferToDeleteId.value = id;
  isConfirmDeleteTransferVisible.value = true;
};

const deleteConfirmedTransfer = async () => {
  if (transferToDeleteId.value) {
    isDeletingTransfer.value = true;
    try {
      await transfersStore.deleteTransfer(transferToDeleteId.value);
      showSuccessMessage('Transferencia eliminada y saldos revertidos correctamente.');
    } catch (error: any) {
      showErrorMessage(error.message || 'Error al eliminar la transferencia.');
    } finally {
      isConfirmDeleteTransferVisible.value = false;
      transferToDeleteId.value = null;
      isDeletingTransfer.value = false;
    }
  }
};

const cancelDeleteTransfer = () => {
  isConfirmDeleteTransferVisible.value = false;
  transferToDeleteId.value = null;
};

// --- Propiedades Computadas para la UI ---
const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  return amount.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
};

const formatDate = (timestamp: Timestamp | Date) => {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short'
  }).format(date);
};

// --- Funciones de Control de Mensajes ---
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

// --- Funciones de Control de Modal y Formulario ---
const openAccountModal = (account?: Account) => {
  clearMessages();
  if (account) {
    currentAccountId.value = account.id;
    accountForm.value = { ...account };
  } else {
    currentAccountId.value = null;
    accountForm.value = {
      name: '',
      initialBalance: 0,
      balance: 0,
      color: availableColors[Math.floor(Math.random() * availableColors.length)],
    };
  }
  isModalVisible.value = true;
};

const closeAccountModal = () => {
  isModalVisible.value = false;
  currentAccountId.value = null;
  accountForm.value = {
    name: '',
    initialBalance: 0,
    balance: 0,
    color: availableColors[Math.floor(Math.random() * availableColors.length)],
  };
  clearMessages();
};

const isLoadingGlobal = computed(() => accountsStore.isLoading || transfersStore.isLoading);

const saveAccount = async () => {
  clearMessages();
  if (isLoadingGlobal.value) return;
  if (!accountForm.value.name.trim()) {
    showErrorMessage('El nombre de la cuenta es obligatorio.');
    return;
  }
  // Solo validar y usar initialBalance si estamos creando una nueva cuenta
  let parsedInitialBalance = 0;
  if (!currentAccountId.value) {
    parsedInitialBalance = parseFloat(accountForm.value.initialBalance.toString());
    if (isNaN(parsedInitialBalance) || parsedInitialBalance < 0) {
      showErrorMessage('El saldo inicial debe ser un número válido y no negativo.');
      return;
    }
  }

  if (!accountForm.value.color) {
    showErrorMessage('Debe seleccionar un color para la cuenta.');
    return;
  }
  isSavingAccount.value = true;
  try {
    if (currentAccountId.value) {
      // Al editar, solo se actualiza el nombre y el color.
      await accountsStore.updateAccount(currentAccountId.value, {
        name: accountForm.value.name,
        color: accountForm.value.color,
      });
      showSuccessMessage('Cuenta actualizada correctamente.');
    } else {
      // Al añadir, se envían todos los datos incluyendo el saldo inicial
      await accountsStore.addAccount({
        name: accountForm.value.name,
        initialBalance: parsedInitialBalance,
        color: accountForm.value.color,
      });
      showSuccessMessage('Cuenta guardada correctamente.');
    }
    closeAccountModal();
  } catch (error: any) {
    showErrorMessage(`Error al guardar la cuenta: ${error.message}`);
  } finally {
    isSavingAccount.value = false;
  }
};

// --- Funciones de Eliminación ---
const confirmDeleteAccount = (id: string) => {
  accountToDeleteId.value = id;
  isConfirmDeleteVisible.value = true;
};

const deleteConfirmedAccount = async () => {
  if (accountToDeleteId.value) {
    isDeletingAccount.value = true;
    try {
      await accountsStore.deleteAccount(accountToDeleteId.value);
      showSuccessMessage('Cuenta eliminada correctamente.');
    } catch (error: any) {
      showErrorMessage(`Error al eliminar la cuenta: ${error.message}`);
    } finally {
      isConfirmDeleteVisible.value = false;
      accountToDeleteId.value = null;
      isDeletingAccount.value = false;
    }
  }
};

const cancelDeleteAccount = () => {
  isConfirmDeleteVisible.value = false;
  accountToDeleteId.value = null;
};

// --- Lógica de Inicialización ---
onMounted(async () => {
  await accountsStore.fetchAccounts();
  await creditCardsStore.fetchCreditCards();
  await transfersStore.fetchTransfers();
});

// --- Transferencias internas ---
const isTransferModalVisible = ref(false);
const canShowTransferButton = computed(() => {
  // Solo mostrar si hay al menos dos cuentas de dinero disponible (no tarjetas de crédito)
  // Si tienes un campo type, ajústalo aquí. Por ahora, asume que todas las accounts son válidas.
  return accounts.value.length >= 2;
});
const openTransferModal = () => {
  isTransferModalVisible.value = true;
};
const closeTransferModal = () => {
  isTransferModalVisible.value = false;
};
const onTransferSuccess = () => {
  closeTransferModal();
  showSuccessMessage('Transferencia realizada correctamente.');
};

// --- Historial de transferencias internas ---
const filteredTransfers = computed(() => {
  // Solo transferencias internas (tipo "transferencia")
  // Si tu modelo tiene un campo type, filtra por type === 'transfer'
  // Por ahora, asume que todas las transferencias en el store son internas
  return transfers.value;
});

// --- Utilidad para mostrar nombre de cuenta en historial ---
const getAccountName = (id: string) => {
  const allAccounts = [...accounts.value, ...creditCards.value];
  const found = allAccounts.find(acc => acc.id === id);
  return found ? found.name : 'Cuenta desconocida';
};
</script>

<style scoped>
/* Estilos para la transición de la notificación flotante */
.fade-message-enter-active, .fade-message-leave-active {
  transition: opacity 0.5s ease-out;
}
.fade-message-enter-from, .fade-message-leave-to {
  opacity: 0;
}
.fade-message-enter-to, .fade-message-leave-from {
  opacity: 1;
}
</style>