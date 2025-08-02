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
    <CategoriesView />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BillsStackSpinner from '../components/common/BillsStackSpinner.vue';
import CategoriesView from './CategoriesView.vue';
const isLoadingGlobal = ref(false); // Cambia a true para probar el overlay
</script>
