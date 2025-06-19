<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <BillsStackSpinner />
      <span class="text-white text-lg mt-4 absolute top-2/3 w-full text-center">Iniciando sesión...</span>
    </div>
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <!-- Logo o icono de la app -->
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          FinanceDiamond
        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          Inicia sesión para gestionar tus finanzas
        </p>
      </div>

      <div class="mt-8 space-y-6">
        <!-- Mensaje de error -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Formulario de prueba con email/password -->
        <div class="space-y-4 mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
          <input
            v-model="emailTest"
            type="email"
            placeholder="Email de prueba"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <input
            v-model="passwordTest"
            type="password"
            placeholder="Contraseña de prueba"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <button
            @click="handleTestLogin"
            :disabled="isLoading"
            class="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Login de Prueba
          </button>
        </div>

        <!-- Botón de Google Sign In -->
        <div>
          <button
            @click="handleGoogleSignIn"
            :disabled="isLoading"
            class="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="-ml-1 mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>

        <!-- Información adicional -->
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Al iniciar sesión, aceptas nuestros términos de servicio
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import BillsStackSpinner from '../components/common/BillsStackSpinner.vue'

const { signInWithGoogle, signInWithEmailPassword, isLoading, error } = useAuth()
const emailTest = ref('')
const passwordTest = ref('')

const handleGoogleSignIn = async () => {
  await signInWithGoogle()
}

const handleTestLogin = async () => {
  try {
    await signInWithEmailPassword(emailTest.value, passwordTest.value)
  } catch (err) {
    // El error ya se maneja en el composable
    console.error('Error en login de prueba')
  }
}
</script>