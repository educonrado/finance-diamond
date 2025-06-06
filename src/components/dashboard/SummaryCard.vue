<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2 transition-colors duration-200">
    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {{ title }}
    </h3>
    
    <div class="text-2xl font-bold transition-colors duration-200" :class="textColor">
      {{ value }}
    </div>
    
    <div 
      v-if="change" 
      :class="changeColorClass + ' text-sm font-semibold flex items-center gap-1'"
      :aria-label="changeAriaLabel"
    >
      <component :is="changeIcon" v-if="changeIcon" class="w-4 h-4" />
      {{ change }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Iconos opcionales (puedes usar Heroicons, Lucide, etc.)
// import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  title: string
  value: string | number
  change?: string | number
  color?: 'green' | 'red' | 'blue' | 'gray' | 'yellow' | 'purple'
  changeType?: 'positive' | 'negative' | 'neutral' // Alternativa más explícita
}>()

const textColor = computed(() => {
  const colorMap = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    gray: 'text-gray-600 dark:text-gray-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }
  return colorMap[props.color || 'gray']
})

// Función más robusta para detectar cambios negativos
const isNegativeChange = computed(() => {
  if (props.changeType) {
    return props.changeType === 'negative'
  }
  
  if (!props.change) return false
  
  const changeStr = props.change.toString().trim()
  
  // Detectar signo negativo al inicio
  if (changeStr.startsWith('-')) return true
  
  // Detectar palabras clave negativas
  const negativeKeywords = ['disminución', 'reducción', 'pérdida', 'menos', 'bajó', 'cayó']
  return negativeKeywords.some(keyword => 
    changeStr.toLowerCase().includes(keyword)
  )
})

const isPositiveChange = computed(() => {
  if (props.changeType) {
    return props.changeType === 'positive'
  }
  
  if (!props.change) return false
  
  const changeStr = props.change.toString().trim()
  
  // Si no es negativo y tiene contenido, asumimos positivo
  // (a menos que sea explícitamente neutral)
  return !isNegativeChange.value && changeStr !== '0' && changeStr !== '0%'
})

const changeColorClass = computed(() => {
  if (isNegativeChange.value) {
    return 'text-red-500 dark:text-red-400'
  } else if (isPositiveChange.value) {
    return 'text-green-500 dark:text-green-400'
  } else {
    return 'text-gray-500 dark:text-gray-400'
  }
})

// Iconos condicionales (requiere librería de iconos)
const changeIcon = computed(() => {
  // Descomenta si tienes iconos disponibles
  // if (isNegativeChange.value) return ArrowDownIcon
  // if (isPositiveChange.value) return ArrowUpIcon
  // return MinusIcon
  return null
})

// Accesibilidad mejorada
const changeAriaLabel = computed(() => {
  if (!props.change) return ''
  
  const changeStr = props.change.toString()
  if (isNegativeChange.value) {
    return `Cambio negativo: ${changeStr}`
  } else if (isPositiveChange.value) {
    return `Cambio positivo: ${changeStr}`
  } else {
    return `Cambio neutral: ${changeStr}`
  }
})

// Formatear valor si es número
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    // Puedes personalizar el formato según tus necesidades
    return props.value.toLocaleString('es-EC')
  }
  return props.value
})
</script>