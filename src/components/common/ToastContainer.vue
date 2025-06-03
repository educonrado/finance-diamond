<template>
  <div class="fixed top-4 right-4 z-50 space-y-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="p-4 rounded-lg shadow-lg flex items-center justify-between w-full max-w-xs transition-opacity duration-300 ease-out"
      :class="{
        'bg-secondary-light text-white': toast.type === 'success', // Verde esmeralda
        'bg-destructive-light text-white': toast.type === 'error', // Rojo suave
        'bg-primary-light text-white': toast.type === 'info', // Azul profundo
      }"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span>{{ toast.message }}</span>
      <button
        @click="removeToast(toast.id)"
        class="ml-4 text-white opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-1"
      >
        <svg
          class="w-4 h-4"
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
  </div>
</template>

<script setup lang="ts">
import { useToast } from "../../composables/useToast";

const { toasts, removeToast } = useToast();
</script>
