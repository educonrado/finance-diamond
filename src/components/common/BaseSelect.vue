<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1"
    >
      {{ label }}
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="updateValue"
      :required="required"
      class="block w-full px-3 py-2 rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light focus:ring-primary-light dark:focus:border-primary-dark dark:focus:ring-primary-dark bg-input-light dark:bg-input-dark text-text-primary-light dark:text-text-primary-dark"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  modelValue: { type: [String, Number], default: "" },
  options: {
    type: Array as () => { text: string; value: string | number }[],
    required: true,
  },
  placeholder: { type: String, default: "" },
  required: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const updateValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
};
</script>
