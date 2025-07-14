<template>
  <form @submit.prevent="handleTransfer">
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <BillsStackSpinner />
      <span class="text-white text-lg mt-4 absolute top-2/3 w-full text-center">Procesando transferencia...</span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label for="from-account" class="block text-sm font-medium mb-1">Cuenta de Origen</label>
        <select id="from-account" v-model="transferForm.fromAccountId" required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none">
          <option value="" disabled>Selecciona una cuenta</option>
          <option v-for="account in filteredFromAccounts" :key="account.id" :value="account.id">
            {{ account.name }} ({{ formatCurrency(account.balance) }})
          </option>
        </select>
      </div>
      <div>
        <label for="to-account" class="block text-sm font-medium mb-1">Cuenta de Destino</label>
        <select id="to-account" v-model="transferForm.toAccountId" required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none">
          <option value="" disabled>Selecciona una cuenta</option>
          <option v-for="account in filteredToAccounts" :key="account.id" :value="account.id">
            {{ account.name }} ({{ formatCurrency(account.balance) }})
          </option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <BaseInput id="transfer-amount" label="Monto" type="number" v-model.number="transferForm.amount"
          :required="true" step="0.01" placeholder="0.00" suffix="USD">
          <template #prefix>
            <span class="text-gray-500 sm:text-sm">$</span>
          </template>
        </BaseInput>
      </div>
      <div>
        <BaseInput id="transfer-date" label="Fecha" type="date" v-model="transferForm.date" :required="true" />
      </div>
    </div>

    <div class="mb-4">
      <BaseInput id="transfer-details" label="Detalles" type="text"
        v-model="transferForm.details" placeholder="Ej. Transferencia para ahorros" />
    </div>

    <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="p-3 mb-4 rounded-md bg-success-light text-white font-medium">
      {{ successMessage }}
    </div>

    <div class="flex justify-end space-x-3">
      <button type="button" @click="$emit('close')"
        class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200">
        Cancelar
      </button>
      <button type="submit"
        class="px-6 py-3 bg-primary-light text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors duration-200">
        Realizar Transferencia
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import { useCreditCardsStore } from '@/stores/creditCards';
import { useTransfersStore } from '@/stores/transfers';
import BaseInput from '@/components/common/BaseInput.vue';
import BillsStackSpinner from '@/components/common/BillsStackSpinner.vue';
import type { Account } from '@/types/Account';

const accountsStore = useAccountsStore();
const creditCardsStore = useCreditCardsStore();
const transfersStore = useTransfersStore();

const transferForm = ref({
  amount: 0,
  fromAccountId: '',
  toAccountId: '',
  date: new Date().toISOString().split('T')[0],
  details: '',
});

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);

const accounts = computed(() => accountsStore.accounts);
const creditCards = computed(() => creditCardsStore.creditCards);

// --- Unifica todas las cuentas para búsqueda y validación ---
const allAccounts = computed(() => [
  ...accounts.value,
  ...creditCards.value,
]);

const findAccountById = (id: string) => allAccounts.value.find(acc => acc.id === id);

// --- Filtrado de cuentas según reglas ---
const filteredFromAccounts = computed(() => {
  // Solo cuentas de dinero disponible (no tarjetas de crédito)
  // Si tienes un campo type, usa acc.type === 'bank' || acc.type === 'cash'
  return accounts.value.filter(acc =>
    !('cardType' in acc) // O ajusta según tu modelo
  );
});
const filteredToAccounts = computed(() => {
  // Todas las cuentas (dinero disponible + tarjetas de crédito)
  return allAccounts.value;
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const clearMessages = () => {
  errorMessage.value = null;
  successMessage.value = null;
};

const emit = defineEmits(['saved', 'close']);

const handleTransfer = async () => {
  clearMessages();
  isLoading.value = true;

  if (!transferForm.value.amount || transferForm.value.amount <= 0) {
    errorMessage.value = 'El monto de la transferencia debe ser un número positivo.';
    isLoading.value = false;
    return;
  }
  if (!transferForm.value.fromAccountId) {
    errorMessage.value = 'Debe seleccionar una cuenta de origen.';
    isLoading.value = false;
    return;
  }
  if (!transferForm.value.toAccountId) {
    errorMessage.value = 'Debe seleccionar una cuenta de destino.';
    isLoading.value = false;
    return;
  }
  if (transferForm.value.fromAccountId === transferForm.value.toAccountId) {
    errorMessage.value = 'Las cuentas de origen y destino no pueden ser la misma.';
    isLoading.value = false;
    return;
  }

  // --- Validar existencia en ambas listas ---
  const fromAccount = findAccountById(transferForm.value.fromAccountId);
  const toAccount = findAccountById(transferForm.value.toAccountId);

  if (!fromAccount || !toAccount) {
    errorMessage.value = 'Una de las cuentas seleccionadas no existe.';
    isLoading.value = false;
    return;
  }

  try {
    await transfersStore.addTransfer({
      amount: transferForm.value.amount,
      fromAccountId: transferForm.value.fromAccountId,
      toAccountId: transferForm.value.toAccountId,
      date: new Date(transferForm.value.date),
      details: transferForm.value.details,
    });
    successMessage.value = 'Transferencia registrada correctamente.';
    setTimeout(() => {
      successMessage.value = null;
      emit('saved');
    }, 1000);
    // Limpia el formulario
    transferForm.value = {
      amount: 0,
      fromAccountId: '',
      toAccountId: '',
      date: new Date().toISOString().split('T')[0],
      details: '',
    };
  } catch (error: any) {
    errorMessage.value = `Error al procesar la transferencia: ${error.message || 'Error desconocido'}`;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (accountsStore.accounts.length === 0) await accountsStore.fetchAccounts();
  if (creditCardsStore.creditCards.length === 0) await creditCardsStore.fetchCreditCards();
});
</script>