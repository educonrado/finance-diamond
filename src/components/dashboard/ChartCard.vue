<template>
  <div class="chart-card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header con título -->
    <div class="px-6 pt-6 pb-4 flex-shrink-0">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ title }}
      </h3>
      <div v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ subtitle }}
      </div>
    </div>
    
    <!-- Contenido del slot - Área principal para gráficas -->
    <div class="flex-1 min-h-0 px-6 pb-6">
      <div class="w-full h-full min-h-[300px]">
        <slot />
      </div>
    </div>
    
    <!-- Footer opcional -->
    <div v-if="$slots.footer" class="px-6 pb-6 pt-0 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div class="pt-4">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  minHeight?: string
  fullHeight?: boolean
}

// Definir props con valores por defecto
const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  minHeight: '300px',
  fullHeight: false
})

// Definir slots con tipos
defineSlots<{
  default(): any
  footer?(): any
}>()
</script>

<style scoped>
.chart-card {
  transition: box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Dark mode hover effect */
@media (prefers-color-scheme: dark) {
  .chart-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* Asegurar que el contenido de la gráfica use todo el espacio disponible */
.chart-card :deep(canvas),
.chart-card :deep(svg),
.chart-card :deep(.chart-container),
.chart-card :deep(.recharts-wrapper) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
}

/* Para gráficas responsivas */
.chart-card :deep(.chart-responsive) {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Evitar overflow en gráficas */
.chart-card :deep(.chart-content) {
  overflow: visible;
}

/* Optimización para Chart.js */
.chart-card :deep(.chartjs-render-monitor) {
  width: 100% !important;
  height: 100% !important;
}

/* Optimización para D3 */
.chart-card :deep(.d3-chart) {
  width: 100%;
  height: 100%;
}
</style>