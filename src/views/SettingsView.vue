<template>
  <div class="p-6">
    <div
      v-if="isLoadingGlobal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
    >
      <BillsStackSpinner />
      <span class="text-white text-lg mt-4 absolute top-2/3 w-full text-center"
        >Cargando ajustes...</span
      >
    </div>
    <h1
      class="text-4xl font-bold mb-6 text-text-primary-light dark:text-text-primary-dark"
    >
      Configuración
    </h1>
    <p class="text-text-secondary-light dark:text-text-secondary-dark">
      Ajustes de la aplicación.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BillsStackSpinner from '../components/common/BillsStackSpinner.vue';
const isLoadingGlobal = ref(false); // Cambia a true para probar el overlay
</script>
