<!-- src/components/CurrencyInput.vue -->
<template>
    <div class="relative w-full">
        <label v-if="label" :for="id" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ label }}
        </label>

        <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                $
            </span>
            <input :id="id" type="tel" inputmode="decimal" :placeholder="placeholder || '0,00'"
                class="block w-full pl-7 pr-16 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :value="formattedValue" @input="handleInput" @blur="formatOnBlur" />
            <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                {{ suffix }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineProps, defineEmits } from 'vue'

const props = defineProps<{
    id: string
    modelValue: string | number | null
    label?: string
    suffix?: string
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

// Interno: sin formato
const rawValue = ref(String(props.modelValue ?? ''))

watch(() => props.modelValue, (val) => {
    rawValue.value = String(val ?? '')
})

// Mostrar con formato solo al blur
const formattedValue = computed(() => {
    const num = parseFloat(rawValue.value.replace(',', '.'))
    return isNaN(num)
        ? rawValue.value
        : num.toLocaleString('es-EC', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
})

const handleInput = (e: Event) => {
    const input = (e.target as HTMLInputElement).value
    const cleaned = input.replace(/[^0-9.,]/g, '').replace(',', '.')
    rawValue.value = cleaned
    emit('update:modelValue', cleaned)
}

const formatOnBlur = () => {
    const num = parseFloat(rawValue.value)
    if (!isNaN(num)) {
        rawValue.value = num.toFixed(2)
        emit('update:modelValue', rawValue.value)
    }
}
</script>