<template>
  <div class="loans-page py-6 px-4 md:px-6">
    <Transition name="fade-message">
      <div v-if="successMessage" class="fixed top-20 right-8 z-50 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm p-4 rounded-lg shadow-xl opacity-100 transition-opacity duration-500 ease-out max-w-xs flex items-center justify-between space-x-2 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{{ successMessage }}</span>
        </div>
        <button @click="clearMessages" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </Transition>
    <Transition name="fade-message">
      <div v-if="errorMessage" class="fixed top-32 right-8 z-50 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg shadow-xl opacity-100 transition-opacity duration-500 ease-out max-w-xs flex items-center justify-between space-x-2 border border-red-200 dark:border-red-700">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          <span>{{ errorMessage }}</span>
        </div>
        <button @click="clearMessages" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </Transition>
    <div class="flex justify-end items-center mb-6">
      
      <button @click="openLoanModal" class="bg-primary-light dark:bg-primary-dark text-white font-semibold py-2 px-6 rounded-md shadow-lg hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
          >
        + Registrar Préstamo
      </button>
    </div>
    <!-- Lista de préstamos activos -->
    <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 mb-8">
      <h2 class="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Préstamos Activos</h2>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-2 text-left">Prestatario</th>
            <th class="px-4 py-2 text-right">Monto Prestado</th>
            <th class="px-4 py-2 text-right">Monto Restante</th>
            <th class="px-4 py-2 text-center">Fecha Compromiso</th>
            <th class="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in activeLoans" :key="loan.id" class="border-b hover:bg-gray-50 transition-colors">
            <td class="px-4 py-2">{{ loan.borrower }}</td>
            <td class="px-4 py-2 text-right">{{ formatCurrency(loan.amount) }}</td>
            <td class="px-4 py-2 text-right">{{ formatCurrency(loan.remaining) }}</td>
            <td class="px-4 py-2 text-center">{{ formatDate(loan.dueDate) }}</td>
            <td class="px-4 py-2 text-center">
              <button @click="openPaymentModal(loan)" class="text-green-600 hover:underline mr-2">Abono</button>
              <button @click="confirmForgiveLoan(loan)" class="text-yellow-600 hover:underline mr-2">Condonar</button>
              <button @click="confirmDeleteLoan(loan)" class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span class="sr-only">Eliminar</span>
              </button>
            </td>
          </tr>
          <tr v-if="activeLoans.length === 0">
            <td colspan="5" class="px-4 py-2 text-center text-gray-500 italic">No hay préstamos activos.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Historial -->
    <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Historial de Préstamos</h2>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-2 text-left">Prestatario</th>
            <th class="px-4 py-2 text-right">Monto Prestado</th>
            <th class="px-4 py-2 text-right">Monto Restante</th>
            <th class="px-4 py-2 text-center">Fecha Compromiso</th>
            <th class="px-4 py-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in historyLoans" :key="loan.id" class="border-b hover:bg-gray-50 transition-colors">
            <td class="px-4 py-2">{{ loan.borrower }}</td>
            <td class="px-4 py-2 text-right">{{ formatCurrency(loan.amount) }}</td>
            <td class="px-4 py-2 text-right">{{ formatCurrency(loan.remaining) }}</td>
            <td class="px-4 py-2 text-center">{{ formatDate(loan.dueDate) }}</td>
            <td class="px-4 py-2 text-center">{{ loan.status }}</td>
          </tr>
          <tr v-if="historyLoans.length === 0">
            <td colspan="5" class="px-4 py-2 text-center text-gray-500 italic">No hay préstamos en el historial.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Modales -->
    <LoanFormModal :is-visible="showLoanModal" @close="closeLoanModal" @save="saveLoan" />
    <LoanPaymentModal :is-visible="showPaymentModal" :max-amount="selectedLoan?.remaining || 0" @close="closePaymentModal" @save="savePayment" />
    <LoanForgiveConfirm :is-visible="showForgiveModal" @cancel="closeForgiveModal" @confirm="forgiveLoan" />
    <ConfirmDialog
      :is-visible="showDeleteModal"
      title="Eliminar Préstamo"
      message="¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer."
      @confirm="deleteLoan"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLoansStore } from '@/stores/loans';
import { useAccountsStore } from '@/stores/accounts';
import type { Loan } from '@/types/Loan';
import LoanFormModal from '@/components/loans/LoanFormModal.vue';
import LoanPaymentModal from '@/components/loans/LoanPaymentModal.vue';
import LoanForgiveConfirm from '@/components/loans/LoanForgiveConfirm.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const loansStore = useLoansStore();
const accountsStore = useAccountsStore();

const activeLoans = computed(() => loansStore.loans.filter(l => l.status === 'Activo'));
const historyLoans = computed(() => loansStore.loans.filter(l => l.status !== 'Activo'));

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
};
const formatDate = (date?: any) => {
  if (!date) return '--';
  // Si es string, intenta parsear a Date
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else if (date?.toDate) {
    d = date.toDate();
  } else {
    return '--';
  }
  return isNaN(d.getTime()) ? '--' : d.toLocaleDateString('es-EC');
};

const showLoanModal = ref(false);
const showPaymentModal = ref(false);
const showForgiveModal = ref(false);
const showDeleteModal = ref(false);
const selectedLoan = ref<Loan | null>(null);
const loanToDelete = ref<Loan | null>(null);
const successMessage = ref('');
const errorMessage = ref('');
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

function openLoanModal() {
  showLoanModal.value = true;
}
function openPaymentModal(loan: Loan) {
  selectedLoan.value = loan;
  showPaymentModal.value = true;
}
function confirmForgiveLoan(loan: Loan) {
  selectedLoan.value = loan;
  showForgiveModal.value = true;
}
function confirmDeleteLoan(loan: Loan) {
  loanToDelete.value = loan;
  showDeleteModal.value = true;
}
function closeLoanModal() {
  showLoanModal.value = false;
}
function closePaymentModal() {
  showPaymentModal.value = false;
  selectedLoan.value = null;
}
function closeForgiveModal() {
  showForgiveModal.value = false;
  selectedLoan.value = null;
}
function closeDeleteModal() {
  showDeleteModal.value = false;
  loanToDelete.value = null;
}
function showSuccess(msg: string) {
  clearMessages();
  successMessage.value = msg;
  messageTimeout = setTimeout(() => { successMessage.value = ''; }, 3000);
}
function showError(msg: string) {
  clearMessages();
  errorMessage.value = msg;
  messageTimeout = setTimeout(() => { errorMessage.value = ''; }, 5000);
}
function clearMessages() {
  if (messageTimeout) clearTimeout(messageTimeout);
  successMessage.value = '';
  errorMessage.value = '';
}

async function saveLoan(form: any) {
  try {
    await loansStore.addLoan({
      borrower: form.borrower,
      amount: form.amount,
      originAccountId: form.originAccountId,
      date: new Date(form.date),
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      details: form.details,
    });
    const acc = accountsStore.accounts.find(a => a.id === form.originAccountId);
    if (acc) {
      await accountsStore.updateAccountBalance(acc.id, acc.balance - form.amount);
    }
    closeLoanModal();
    await loansStore.fetchLoans();
    await accountsStore.fetchAccounts();
    showSuccess('Préstamo registrado correctamente.');
  } catch (e: any) {
    showError(e?.message || 'Error al registrar el préstamo.');
  }
}

async function savePayment(form: any) {
  try {
    if (!selectedLoan.value) return;
    await loansStore.addPayment(selectedLoan.value.id, {
      amount: form.amount,
      accountId: form.accountId,
      date: new Date(form.date),
      details: form.details,
    });
    const acc = accountsStore.accounts.find(a => a.id === form.accountId);
    if (acc) {
      await accountsStore.updateAccountBalance(acc.id, acc.balance + form.amount);
    }
    closePaymentModal();
    await loansStore.fetchLoans();
    await accountsStore.fetchAccounts();
    showSuccess('Abono registrado correctamente.');
  } catch (e: any) {
    showError(e?.message || 'Error al registrar el abono.');
  }
}

async function forgiveLoan() {
  try {
    if (!selectedLoan.value) return;
    await loansStore.forgiveLoan(selectedLoan.value.id);
    closeForgiveModal();
    await loansStore.fetchLoans(); // <-- refresca la lista tras condonar
    showSuccess('Préstamo condonado correctamente.');
  } catch (e: any) {
    showError(e?.message || 'Error al condonar el préstamo.');
  }
}

async function deleteLoan() {
  if (!loanToDelete.value) return;
  try {
    await loansStore.deleteLoan(loanToDelete.value.id);
    showSuccess('Préstamo eliminado correctamente.');
    await loansStore.fetchLoans();
  } catch (e: any) {
    showError(e?.message || 'Error al eliminar el préstamo.');
  } finally {
    closeDeleteModal();
  }
}

onMounted(() => {
  loansStore.fetchLoans();
  accountsStore.fetchAccounts();
});
</script>

<style scoped>
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
