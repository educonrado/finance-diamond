<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1"
    >
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      :required="required"
      :step="step"
      class="block w-full px-3 py-2 rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light focus:ring-primary-light dark:focus:border-primary-dark dark:focus:ring-primary-dark bg-input-light dark:bg-input-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  modelValue: { type: [String, Number], default: "" },
  placeholder: { type: String, default: "" },
  required: { type: Boolean, default: false },
  step: { type: String, default: undefined }, // Para number inputs
});

const emit = defineEmits(["update:modelValue"]);

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit(
    "update:modelValue",
    props.type === "number" ? parseFloat(target.value) : target.value
  );
};
</script>
