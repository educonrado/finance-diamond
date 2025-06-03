<template>
  <div :class="{'dark': isDarkMode}" class="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
    <div v-if="isLoadingSetup" class="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-50">
      <p class="text-xl font-bold">Cargando configuración inicial...</p>
    </div>
    <div v-if="errorSetup" class="fixed top-0 left-0 right-0 p-4 bg-red-600 text-white z-50">
      {{ errorSetup }}
    </div>

    <MainLayout />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MainLayout from './layouts/MainLayout.vue';
import ToastContainer from './components/common/ToastContainer.vue';
import { useUserSetup } from './composables/useUserSetup'; // Importa el nuevo composable

// Para la gestión del modo oscuro (asumiendo que lo tienes implementado)
const isDarkMode = ref(false); // O el valor que corresponda a tu lógica

// Uso del nuevo composable
const { isLoadingSetup, errorSetup, setupUserCollections, USER_UID } = useUserSetup();

onMounted(async () => {
  // Llama a la función de configuración del usuario
  await setupUserCollections(USER_UID);

  // Lógica para detectar el modo oscuro del sistema o cargar preferencia del usuario
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  isDarkMode.value = prefersDark; // O tu lógica de carga de preferencia
});

</script>

<style>
</style>