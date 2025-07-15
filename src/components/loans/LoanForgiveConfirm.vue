<template>
  <ConfirmDialog :is-visible="isVisible" title="Condonar Préstamo" message="¿Seguro que deseas condonar este préstamo? Esta acción no afectará tus cuentas bancarias y no podrá deshacerse." @confirm="onConfirm" @cancel="onCancel" />
</template>
<script setup lang="ts">
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
const props = defineProps<{ isVisible: boolean }>();
const emits = defineEmits(['confirm', 'cancel']);
function onConfirm() { emits('confirm'); }
function onCancel() { emits('cancel'); }
</script>
