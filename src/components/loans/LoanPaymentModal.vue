<template>
  <Modal :is-visible="isVisible" title="Registrar Abono" @close="onClose">
    <form @submit.prevent="submitPayment">
      <div class="mb-4">
        <BaseInput id="loan-payment-amount" label="Monto del Abono" v-model.number="form.amount" type="number" min="0.01" step="0.01" required />
      </div>
      <div class="mb-4">
        <BaseSelect id="loan-payment-account" label="Cuenta de Destino" v-model="form.accountId" :options="accountOptions.map(opt => ({ text: opt.label, value: opt.value }))" required />
      </div>
      <div class="mb-4">
        <BaseInput id="loan-payment-date" label="Fecha del Abono" v-model="form.date" type="date" required />
      </div>
      <div class="mb-4">
        <BaseInput id="loan-payment-details" label="Detalles del Abono" v-model="form.details" type="text" />
      </div>
      <div v-if="error" class="text-red-600 mb-2">{{ error }}</div>
      <div class="flex justify-end space-x-3">
        <button type="button" @click="onClose" class="px-4 py-2 border rounded">Cancelar</button>
        <button type="submit" class="px-4 py-2 bg-primary-light text-white rounded">Guardar</button>
      </div>
    </form>
  </Modal>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from '@/components/common/Modal.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseSelect from '@/components/common/BaseSelect.vue';
import { useAccountsStore } from '@/stores/accounts';

const props = defineProps<{ isVisible: boolean; maxAmount: number }>();
const emits = defineEmits(['close', 'save']);

const accountsStore = useAccountsStore();
const accountOptions = computed(() => accountsStore.accounts.map(acc => ({ value: acc.id, label: acc.name })));

const form = ref({
  amount: undefined as number | undefined,
  accountId: '',
  date: new Date().toISOString().slice(0, 10),
  details: '',
});
const error = ref('');

watch(() => props.isVisible, (val) => {
  if (val) resetForm();
});

function resetForm() {
  form.value = {
    amount: undefined,
    accountId: '',
    date: new Date().toISOString().slice(0, 10),
    details: '',
  };
  error.value = '';
}

function submitPayment() {
  error.value = '';
  if (!form.value.amount || form.value.amount <= 0) {
    error.value = 'El monto debe ser mayor a cero.';
    return;
  }
  if (form.value.amount > props.maxAmount) {
    error.value = 'El monto no puede exceder el monto restante.';
    return;
  }
  if (!form.value.accountId) {
    error.value = 'Debe seleccionar una cuenta de destino.';
    return;
  }
  if (!form.value.date) {
    error.value = 'Debe seleccionar la fecha del abono.';
    return;
  }
  emits('save', { ...form.value });
}
function onClose() {
  emits('close');
}
</script>
