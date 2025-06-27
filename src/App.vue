<template>
  <div :class="{'dark': isDarkMode}" class="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
    <!-- Loading inicial de Firebase Auth -->
    <div v-if="isAuthLoading" class="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-lg font-medium">Verificando autenticación...</p>
      </div>
    </div>

    <!-- Loading de setup del usuario -->
    <div v-else-if="isLoadingSetup" class="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-xl font-bold">Cargando configuración inicial...</p>
      </div>
    </div>

    <!-- Error de setup -->
    <div v-if="errorSetup" class="fixed top-0 left-0 right-0 p-4 bg-red-600 text-white z-50">
      {{ errorSetup }}
    </div>

    <!-- Contenido principal -->
    <div v-if="!isAuthLoading">
      <!-- Si el usuario está autenticado, mostrar MainLayout -->
      <MainLayout v-if="isAuthenticated" />
      
      <!-- Si no está autenticado, el router manejará mostrar LoginView -->
      <router-view v-else />
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import { useUserSetup } from './composables/useUserSetup'
import { useAuth } from './composables/useAuth'

// Router
const router = useRouter()

// Autenticación
const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

// Setup del usuario
const { isLoadingSetup, errorSetup, setupUserCollections } = useUserSetup()

// Modo oscuro
const isDarkMode = ref(false)

watch(user, async (newUser) => {
  if (newUser) {
    await setupUserCollections(newUser.uid)
    // Redirigir SOLO si está en login
    if (router.currentRoute.value.name === 'login') {
      router.push({ name: 'dashboard' })
    }
  } else {
    // Redirigir si la ruta requiere autenticación
    if (router.currentRoute.value.meta?.requiresAuth) {
      router.push({ name: 'login' })
    }
  }
}, { immediate: true })

onMounted(async () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode.value = prefersDark
})
</script>

<style>
</style>