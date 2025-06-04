<template>
  <div class="absolute inset-0 flex items-center justify-center bg-background-card-light dark:bg-background-card-dark bg-opacity-70 z-40 rounded-lg">
    <div
      class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary-light dark:text-primary-dark motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status">
      <span
        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Cargando...</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>