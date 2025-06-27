<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{{ title }}</p>
        
        <!-- Estado de carga -->
        <div v-if="loading" class="flex items-center space-x-2">
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-24"></div>
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
        </div>
        
        <!-- Valor cargado -->
        <div v-else class="flex items-baseline space-x-2">
          <span class="text-2xl font-bold" :class="colorClasses">{{ value }}</span>
          <span v-if="change" class="text-sm font-medium" :class="changeColorClasses">
            {{ change }}
          </span>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string
  color: 'blue' | 'green' | 'red' | 'gray'
  change?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const colorClasses = computed(() => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400'
  }
  return colors[props.color]
})

const changeColorClasses = computed(() => {
  if (!props.change) return ''
  
  const isPositive = props.change.startsWith('+')
  return isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400'
})

const iconBackgroundClasses = computed(() => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900',
    green: 'bg-green-100 dark:bg-green-900',
    red: 'bg-red-100 dark:bg-red-900',
    gray: 'bg-gray-100 dark:bg-gray-700'
  }
  return colors[props.color]
})

const iconClasses = computed(() => {
  const colors = {
    blue: 'bg-blue-600 dark:bg-blue-400',
    green: 'bg-green-600 dark:bg-green-400',
    red: 'bg-red-600 dark:bg-red-400',
    gray: 'bg-gray-600 dark:bg-gray-400'
  }
  return colors[props.color]
})
</script>