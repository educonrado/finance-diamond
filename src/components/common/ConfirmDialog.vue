<template>
  <transition name="modal-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div
        class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-xl p-6 w-full max-w-sm"
        @click.stop
      >
        <h3
          class="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-4"
        >
          {{ title }}
        </h3>
        <p class="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          {{ message }}
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-red-700 dark:hover:bg-red-400 transition-colors duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  isVisible: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits(["confirm", "cancel"]);
</script>

<style scoped>
/* Reutiliza los estilos de transición del modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
