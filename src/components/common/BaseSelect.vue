<!-- src/components/common/BaseSelect.vue -->
<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
      {{ label }}
    </label>
    <div class="mt-1 relative rounded-md shadow-sm">
            <select
        :id="id"
        :value="modelValue"
        @change="updateValue(($event.target as HTMLSelectElement).value)"
        :required="required"
        :disabled="disabled"
        class="block w-full rounded-md
               border-gray-300 dark:border-gray-600
               bg-background-input-light dark:bg-background-input-dark
               text-text-primary-light dark:text-text-primary-dark
               placeholder-gray-400 dark:placeholder-gray-500
               focus:ring-primary-light focus:border-primary-light
               dark:focus:ring-primary-dark dark:focus:border-primary-dark
               sm:text-sm
               py-2 px-3 appearance-none pr-8"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <template v-for="option in options" :key="option.value || option.text">
          <option
            v-if="!option.isSeparator"
            :value="option.value"
          >
            {{ option.text }}
          </option>
          <option
            v-else
            disabled
            class="bg-gray-100 dark:bg-gray-700 text-xs italic"
          >
            ── {{ option.text }} ──
          </option>
        </template>
      </select>
      <!-- Icono de flecha para el select -->
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
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
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array as () => Array<{ text: string; value?: string | number; isSeparator?: boolean }>,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
</style>
