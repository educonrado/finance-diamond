<!-- src/components/common/BaseInput.vue -->
<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
      {{ label }}
    </label>
    <div class="mt-1 relative rounded-md shadow-sm">
      <!-- Input field -->
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="updateValue(($event.target as HTMLInputElement).value)"
        :required="required"
        :placeholder="placeholder"
        :disabled="disabled"
        :step="step"
        :max="max"
        class="block w-full rounded-md
               border-gray-300 dark:border-gray-600
               bg-background-input-light dark:bg-background-input-dark
               text-text-primary-light dark:text-text-primary-dark
               placeholder-gray-400 dark:placeholder-gray-500
               focus:ring-primary-light focus:border-primary-light
               dark:focus:ring-primary-dark dark:focus:border-primary-dark
               sm:text-sm
               py-2 px-3"
        :class="{
            'pl-10': $slots.prefix, // Añade padding izquierdo si hay prefijo
            'pr-10': suffix // Añade padding derecho si hay sufijo
        }"
      />
      <!-- Prefijo (ej. $) -->
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix"></slot>
      </div>
      <!-- Sufijo (ej. USD) -->
      <div v-if="suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-gray-500 dark:text-gray-400 sm:text-sm">{{ suffix }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  step: { // Para inputs de tipo number
    type: [String, Number],
    default: undefined,
  },
  max: { // Para inputs de tipo number
    type: [String, Number],
    default: undefined,
  },
  suffix: { // Propiedad para el texto del sufijo
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (value: string | number) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
</style>
