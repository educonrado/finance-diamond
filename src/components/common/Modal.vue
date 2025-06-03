<template>
  <transition name="modal-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div
        class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-xl p-6 w-full max-w-md"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h3
            class="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark"
          >
            {{ title }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  isVisible: boolean;
  title: string;
}>();

const emit = defineEmits(["close"]);
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
