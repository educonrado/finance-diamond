<template>
  <div class="credit-cards-page py-6 px-4 md:px-6 bg-background-light dark:bg-background-dark min-h-screen">
    <div class="flex justify-end items-center mb-6">
      <button @click="openCardModal()"
        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
        :disabled="isLoadingGlobal"
      >
        + Nueva Tarjeta
      </button>
    </div>

    <!-- Toast de éxito -->
    <Transition name="fade-message">
      <div v-if="successMessage" class="fixed top-20 right-8 z-50 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm p-4 rounded-lg shadow-xl opacity-100 transition-opacity duration-500 ease-out max-w-xs flex items-center justify-between space-x-2 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{{ successMessage }}</span>
        </div>
        <button @click="clearMessages()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </Transition>

    <div class="relative">
      <div v-if="isLoadingGlobal" class="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
        <BillsStackSpinner />
        <p class="text-text-secondary-light dark:text-text-secondary-dark mt-2 absolute top-2/3 w-full text-center">Cargando tarjetas de crédito...</p>
      </div>
      <div v-else-if="creditCardsStore.error" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
        Error al cargar: {{ creditCardsStore.error }}
      </div>
      <div v-else-if="creditCards.length === 0" class="text-center py-8 bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md">
        <p class="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-4">No tienes tarjetas de crédito registradas.</p>
        <button @click="openCardModal()"
          class="bg-primary-light dark:bg-primary-dark text-white font-semibold py-2 px-6 rounded-md shadow-lg hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
          :disabled="isLoadingGlobal"
        >
          + Añadir mi primera tarjeta
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="card in creditCards" :key="card.id"
          class="bg-background-card-light dark:bg-background-card-dark p-4 rounded-xl shadow-lg flex flex-col justify-between h-full">
          <div @click="openCardModal(card)" class="credit-card-display relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-md cursor-pointer transform hover:-translate-y-1 transition-transform duration-200">
            <div class="absolute inset-0 z-10">
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" class="w-full h-full">
                <path d="M50 0 C 80 15, 100 40, 100 60 L 0 60 L 0 0 Z" fill="#00000022"></path>
                <path d="M0 0 C 20 10, 40 5, 50 15 C 60 25, 80 20, 100 30 L 100 0 Z" fill="#ffffff11"></path>
              </svg>
            </div>
            <div class="relative z-20 p-4 h-full flex flex-col justify-between text-white">
              <div class="flex justify-between items-center mb-2">
                <span class="text-base md:text-sm lg:text-sm font-semibold truncate">{{ card.name || 'Sin alias' }}</span>
                <img :src="cardTypeOptions.find(opt => opt.value === card.cardType)?.icon || '/icons/card.svg'" :alt="card.cardType" class="h-8 w-auto object-contain ml-2" />
              </div>
              <div class="text-base md:text-sm lg:text-sm font-mono tracking-wider mt-4 break-all">
                <span class="opacity-80">**** **** **** </span>
                <span class="font-bold">{{ card.id.slice(-4) }}</span>
              </div>
              <div class="flex justify-between items-end text-sm mt-4">
                <div>
                  <p class="font-light opacity-70 uppercase text-xs">Corte</p>
                  <p class="font-semibold text-base">{{ formatDateDay(card.billingCycleDay) }}</p>
                </div>
                <div>
                  <p class="font-light opacity-70 uppercase text-xs">Pago</p>
                  <p class="font-semibold text-base">{{ formatDateDay(card.paymentDueDay) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md shadow-inner text-sm">
            <div class="flex justify-between items-center mb-2">
              <span class="text-text-secondary-light dark:text-text-secondary-dark font-medium">Límite:</span>
              <span class="font-bold text-text-primary-light dark:text-text-primary-dark">{{ formatCurrency(card.creditLimit) }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-text-secondary-light dark:text-text-secondary-dark font-medium">Usado:</span>
              <span :class="['font-bold', getDebtTextColorClass(card.balance)]">{{ formatCurrency(Math.abs(card.balance)) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-text-secondary-light dark:text-text-secondary-dark font-medium">Alias:</span>
              <span class="font-bold text-text-primary-light dark:text-text-primary-dark">{{ card.name || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para guardar tarjeta -->
    <Modal :is-visible="isModalVisible" :title="currentCardId ? 'Editar Tarjeta de Crédito' : 'Añadir Nueva Tarjeta'" @close="closeCardModal">
      <div v-if="isSavingCard">
        <BillsStackSpinner />
      </div>
      <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="saveCreditCard">
        <div class="mb-4">
          <label class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Tipo de Tarjeta</label>
          <div class="flex gap-4">
            <button v-for="option in cardTypeOptions" :key="option.value" type="button" @click="!isLoadingGlobal && (cardForm.cardType = option.value as CreditCardAccount['cardType'])" :class="{'ring-2 ring-primary-light dark:ring-primary-dark': cardForm.cardType === option.value, 'opacity-50 cursor-not-allowed': isLoadingGlobal}" class="w-14 h-10 flex items-center justify-center rounded-lg cursor-pointer bg-background-card-light dark:bg-background-card-dark transition-all duration-200 relative overflow-hidden">
              <img :src="option.icon" :alt="option.text" class="w-10 h-8 object-contain" />
            </button>
          </div>
        </div>
        <div class="mb-4">
          <BaseInput id="card-name" label="Alias" type="text" v-model="cardForm.name" placeholder="Alias" :disabled="isLoadingGlobal" />
        </div>
        <div class="mb-4">
          <BaseInput id="credit-limit" label="Límite de Crédito" type="number" v-model.number="cardForm.creditLimit" :required="true" step="0.01" placeholder="0.00" suffix="USD" :disabled="isLoadingGlobal">
            <template #prefix>
              <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </template>
          </BaseInput>
        </div>
        <div class="mb-4">
          <BaseInput id="initial-amount-used" label="Monto Inicial Usado" type="number" v-model.number="cardForm.initialAmountUsed" :required="false" step="0.01" placeholder="0.00" suffix="USD" :disabled="isLoadingGlobal">
            <template #prefix>
              <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </template>
          </BaseInput>
        </div>
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <div class="w-full">
            <BaseSelect id="billing-cycle-day" label="Día de Corte" v-model.number="cardForm.billingCycleDay" :options="dayOptions" :required="true" :disabled="isLoadingGlobal" />
          </div>
          <div class="w-full">
            <BaseSelect id="payment-due-date-day" label="Día de Pago" v-model.number="cardForm.paymentDueDay" :options="dayOptions" :required="true" :disabled="isLoadingGlobal" />
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button v-if="currentCardId" type="button" @click="confirmDeleteCard(currentCardId!)" :disabled="isLoadingGlobal" class="relative px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-dark dark:hover:bg-destructive-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            <span>Eliminar</span>
          </button>
          <button type="button" @click="closeCardModal" :disabled="isLoadingGlobal" class="px-4 py-2 rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Cancelar
          </button>
          <button type="submit" :disabled="isLoadingGlobal" class="relative px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            <span>Guardar</span>
          </button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog :is-visible="isConfirmDeleteVisible" title="Confirmar Eliminación de Tarjeta" message="¿Estás seguro de que quieres eliminar esta tarjeta de crédito? Esto también eliminará las transacciones asociadas a ella. Esta acción es irreversible." @confirm="deleteConfirmedCard" @cancel="cancelDeleteCard" />
    <div v-if="isDeletingCard">
      <BillsStackSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCreditCardsStore } from '../stores/creditCards';
import Modal from '../components/common/Modal.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue';
import BillsStackSpinner from '../components/common/BillsStackSpinner.vue';
import type { CreditCardAccount } from '../types/CreditCardAccount';

const creditCardsStore = useCreditCardsStore();

const isModalVisible = ref(false);
const currentCardId = ref<string | null>(null);
const cardForm = ref({
  name: '',
  cardType: undefined as CreditCardAccount['cardType'],
  creditLimit: 0,
  initialAmountUsed: 0,
  billingCycleDay: 1,
  paymentDueDay: 1,
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

const isConfirmDeleteVisible = ref(false);
const cardToDeleteId = ref<string | null>(null);

const creditCards = computed(() => creditCardsStore.creditCards);
const isLoadingGlobal = computed(() => creditCardsStore.isLoading);
const isSavingCard = ref(false);
const isDeletingCard = ref(false);

const cardTypeOptions = [
  { value: 'Visa', text: 'Visa', icon: '/icons/visa.svg' },
  { value: 'MasterCard', text: 'MasterCard', icon: '/icons/mastercard.svg' },
  { value: 'American Express', text: 'American Express', icon: '/icons/amex.svg' },
  { value: 'Discover', text: 'Discover', icon: '/icons/discover.svg' },
  { value: 'Diners Club', text: 'Diners Club', icon: '/icons/diners.svg' },
  { value: 'Other', text: 'Otras', icon: '/icons/card.svg' },
];

const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  text: (i + 1).toString(),
}));

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

const formatDateDay = (day: number) => {
  return day ? day.toString().padStart(2, '0') : '--';
};

const getDebtTextColorClass = (balance: number) => {
  return balance > 0 ? 'text-red-500' : 'text-green-500';
};

const clearMessages = () => {
  if (messageTimeout) clearTimeout(messageTimeout);
  successMessage.value = null;
  errorMessage.value = null;
};
const showSuccessMessage = (message: string) => {
  clearMessages();
  successMessage.value = message;
  messageTimeout = setTimeout(() => { successMessage.value = null; }, 3000);
};
const showErrorMessage = (message: string) => {
  clearMessages();
  errorMessage.value = message;
  messageTimeout = setTimeout(() => { errorMessage.value = null; }, 5000);
};

const openCardModal = (card?: CreditCardAccount) => {
  clearMessages();
  if (isLoadingGlobal.value) return;
  if (card) {
    currentCardId.value = card.id;
    cardForm.value = {
      name: card.name,
      cardType: card.cardType,
      creditLimit: card.creditLimit,
      initialAmountUsed: Math.abs(card.balance) || 0,
      billingCycleDay: card.billingCycleDay,
      paymentDueDay: card.paymentDueDay,
    };
  } else {
    currentCardId.value = null;
    cardForm.value = {
      name: '',
      cardType: undefined,
      creditLimit: 0,
      initialAmountUsed: 0,
      billingCycleDay: 1,
      paymentDueDay: 1,
    };
  }
  isModalVisible.value = true;
};

const closeCardModal = () => {
  isModalVisible.value = false;
  currentCardId.value = null;
  cardForm.value = {
    name: '',
    cardType: undefined,
    creditLimit: 0,
    initialAmountUsed: 0,
    billingCycleDay: 1,
    paymentDueDay: 1,
  };
  clearMessages();
};

const saveCreditCard = async () => {
  clearMessages();
  if (isLoadingGlobal.value) return;

  // Validaciones antes de mostrar el spinner
  if (!cardForm.value.cardType) {
    showErrorMessage('Debe seleccionar el tipo de tarjeta.');
    return;
  }
  if (!cardForm.value.creditLimit || cardForm.value.creditLimit <= 0) {
    showErrorMessage('El límite de crédito debe ser mayor que cero.');
    return;
  }
  if (!cardForm.value.billingCycleDay || cardForm.value.billingCycleDay < 1 || cardForm.value.billingCycleDay > 31) {
    showErrorMessage('El día de corte debe estar entre 1 y 31.');
    return;
  }
  if (!cardForm.value.paymentDueDay || cardForm.value.paymentDueDay < 1 || cardForm.value.paymentDueDay > 31) {
    showErrorMessage('El día de pago debe estar entre 1 y 31.');
    return;
  }

  isSavingCard.value = true;
  try {
    if (currentCardId.value) {
      await creditCardsStore.updateCreditCard(currentCardId.value, {
        name: cardForm.value.name,
        cardType: cardForm.value.cardType,
        creditLimit: cardForm.value.creditLimit,
        billingCycleDay: cardForm.value.billingCycleDay,
        paymentDueDay: cardForm.value.paymentDueDay,
      });
      showSuccessMessage('Tarjeta actualizada correctamente.');
    } else {
      await creditCardsStore.addCreditCard({
        name: cardForm.value.name,
        cardType: cardForm.value.cardType,
        creditLimit: cardForm.value.creditLimit,
        billingCycleDay: cardForm.value.billingCycleDay,
        paymentDueDay: cardForm.value.paymentDueDay,
        initialAmountUsed: cardForm.value.initialAmountUsed,
        initialBalance: cardForm.value.initialAmountUsed ?? 0,
        color: '#1976d2',
      });
      showSuccessMessage('Tarjeta añadida correctamente.');
    }
    await creditCardsStore.fetchCreditCards();
    closeCardModal();
  } catch (error: any) {
    showErrorMessage(`Error al guardar la tarjeta: ${error.message}`);
  } finally {
    isSavingCard.value = false;
  }
};

const confirmDeleteCard = (id: string) => {
  if (isLoadingGlobal.value) return;
  cardToDeleteId.value = id;
  isConfirmDeleteVisible.value = true;
};

const deleteConfirmedCard = async () => {
  if (isLoadingGlobal.value) return;
  if (!cardToDeleteId.value) return;
  isConfirmDeleteVisible.value = false;
  isDeletingCard.value = true;
  try {
    await creditCardsStore.deleteCreditCard(cardToDeleteId.value);
    showSuccessMessage('Tarjeta eliminada correctamente.');
    closeCardModal();
    await creditCardsStore.fetchCreditCards();
  } catch (error: any) {
    showErrorMessage(`Error al eliminar la tarjeta: ${error.message}`);
  } finally {
    isDeletingCard.value = false;
    cardToDeleteId.value = null;
  }
};

const cancelDeleteCard = () => {
  isConfirmDeleteVisible.value = false;
  cardToDeleteId.value = null;
};

onMounted(async () => {
  await creditCardsStore.fetchCreditCards();
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