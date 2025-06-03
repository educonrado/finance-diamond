<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center"
  >
    <h1
      class="text-8xl font-extrabold text-primary-light dark:text-primary-dark mb-4"
    >
      404
    </h1>
    <h2
      class="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-4"
    >
      Página no encontrada
    </h2>
    <p
      class="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-8"
    >
      Lo sentimos, la página que buscas no existe.
    </p>
    <router-link
      to="/"
      class="px-6 py-3 rounded-md bg-primary-light dark:bg-primary-dark text-white font-medium hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
    >
      Volver al Panel
    </router-link>
  </div>
</template>

<script setup lang="ts"></script>
