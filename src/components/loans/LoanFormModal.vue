<template>
  <Modal :is-visible="isVisible" title="Registrar Préstamo" @close="onClose">
    <form @submit.prevent="submitLoan">
      <div class="mb-4">
        <BaseInput id="loan-borrower" label="Nombre del Prestatario" v-model="form.borrower" required />
      </div>
      <div class="mb-4">
        <BaseInput id="loan-amount" label="Monto del Préstamo" v-model.number="form.amount" type="number" min="0.01" step="0.01" required />
      </div>
      <div class="mb-4">
        <BaseSelect id="loan-origin-account" label="Cuenta de Origen" v-model="form.originAccountId" :options="accountOptions.map(opt => ({ text: opt.label, value: opt.value }))" required />
      </div>
      <div class="mb-4">
        <BaseInput id="loan-date" label="Fecha del Préstamo" v-model="form.date" type="date" required />
      </div>
      <div class="mb-4">
        <BaseInput id="loan-due-date" label="Fecha de Compromiso de Pago" v-model="form.dueDate" type="date" />
      </div>
      <div class="mb-4">
        <BaseInput id="loan-details" label="Detalles/Concepto" v-model="form.details" type="text" />
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

const props = defineProps<{ isVisible: boolean }>();
const emits = defineEmits(['close', 'save']);

const accountsStore = useAccountsStore();
const accountOptions = computed(() => accountsStore.accounts.map(acc => ({ value: acc.id, label: acc.name })));

const form = ref({
  borrower: '',
  amount: 0 as number,
  originAccountId: '',
  date: new Date().toISOString().slice(0, 10),
  dueDate: '',
  details: '',
});
const error = ref('');

watch(() => props.isVisible, (val) => {
  if (val) resetForm();
});

function getDefaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function resetForm() {
  form.value = {
    borrower: '',
    amount: 0,
    originAccountId: '',
    date: new Date().toISOString().slice(0, 10),
    dueDate: getDefaultDueDate(),
    details: '',
  };
  error.value = '';
}

function submitLoan() {
  error.value = '';
  if (!form.value.borrower.trim()) {
    error.value = 'El nombre del prestatario es obligatorio.';
    return;
  }
  if (!form.value.amount || form.value.amount <= 0) {
    error.value = 'El monto debe ser mayor a cero.';
    return;
  }
  if (!form.value.originAccountId) {
    error.value = 'Debe seleccionar una cuenta de origen.';
    return;
  }
  if (!form.value.date) {
    error.value = 'Debe seleccionar la fecha del préstamo.';
    return;
  }
  emits('save', { ...form.value });
}
function onClose() {
  emits('close');
}
</script>
