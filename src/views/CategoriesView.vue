<!-- src/views/CategoriesView.vue -->
<template>
  <div class="categories-page py-6 px-4 md:px-6">
    <div class="flex justify-end items-center mb-6">
      <button
        @click="openCategoryModal()"
        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
      >
        + Añadir
      </button>
    </div>

    <!-- Mensaje de éxito como notificación flotante en la esquina superior derecha -->
    <Transition name="fade-message">
      <div v-if="successMessage" class="
        fixed top-20 right-8 z-50
        bg-white dark:bg-gray-800 text-gray-800 dark:text-white
        text-sm p-4 rounded-lg shadow-xl
        opacity-100 transition-opacity duration-500 ease-out
        max-w-xs flex items-center justify-between space-x-2
        border border-gray-200 dark:border-gray-700
        ">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ successMessage }}</span>
        </div>
        <button @click="clearMessages()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Selector de tipo de categoría (Ingreso/Gasto) -->
    <div class="mb-6">
      <div class="flex w-full rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600">
        <button
          type="button"
          @click="currentCategoryType = 'Ingreso'"
          :class="{
            'bg-primary-light text-white dark:bg-primary-dark': currentCategoryType === 'Ingreso',
            'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600': currentCategoryType !== 'Ingreso'
          }"
          class="flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50"
        >
          Ingresos
        </button>
        <button
          type="button"
          @click="currentCategoryType = 'Gasto'"
          :class="{
            'bg-primary-light text-white dark:bg-primary-dark': currentCategoryType === 'Gasto',
            'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600': currentCategoryType !== 'Gasto'
          }"
          class="flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50"
        >
          Gastos
        </button>
      </div>
    </div>

    <!-- Contenedor de la tabla de categorías -->
    <div class="relative bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Categoría</th>
            <th scope="col" class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider hidden md:table-cell">Tipo</th>
            <th scope="col" class="relative px-2 py-3 md:px-6 md:py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-background-card-light dark:bg-background-card-dark divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="category in filteredCategories" :key="category.id">
            <td class="px-2 py-4 md:px-6 md:py-4 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              <span class="mr-2">{{ category.icon }}</span> {{ category.name }}
            </td>
            <td class="px-2 py-4 md:px-6 md:py-4 text-sm text-text-primary-light dark:text-text-primary-dark hidden md:table-cell">{{ category.type }}</td>
            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openCategoryModal(category)" class="text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light mr-1 md:mr-4">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span class="sr-only">Editar</span>
              </button>
              <button @click="confirmDeleteCategory(category.id)" class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                <span class="sr-only">Eliminar</span>
              </button>
            </td>
          </tr>
          <tr v-if="filteredCategories.length === 0 && !categoriesStore.isLoading">
            <td colspan="3" class="px-6 py-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark italic">No hay categorías registradas para este tipo.</td>
          </tr>
        </tbody>
      </table>
      <LoadingSpinner v-if="categoriesStore.isLoading" />
    </div>

    <!-- Modal para Añadir/Editar Categoría -->
    <Modal :is-visible="isModalVisible" :title="currentCategoryId ? 'Editar Categoría' : 'Añadir Categoría'" @close="closeCategoryModal">
      <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="saveCategory">
        <div class="mb-4">
          <BaseInput
            id="category-name"
            label="Nombre de la Categoría"
            type="text"
            v-model="categoryForm.name"
            :required="true"
            placeholder="Ej. Salario, Alquiler, Comida"
          />
        </div>
        
        <!-- Selector de Tipo: visible solo al AÑADIR una categoría -->
        <div class="mb-4" v-if="!currentCategoryId">
          <label class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Tipo</label>
          <div class="flex rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              type="button"
              @click="categoryForm.type = 'Ingreso'"
              :class="{
                'bg-primary-light text-white dark:bg-primary-dark': categoryForm.type === 'Ingreso',
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600': categoryForm.type !== 'Ingreso'
              }"
              class="flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50"
            >
              Ingreso
            </button>
            <button
              type="button"
              @click="categoryForm.type = 'Gasto'"
              :class="{
                'bg-primary-light text-white dark:bg-primary-dark': categoryForm.type === 'Gasto',
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600': categoryForm.type !== 'Gasto'
              }"
              class="flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50"
            >
              Gasto
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Ícono</label>
          <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 rounded-md border border-gray-300 dark:border-gray-600 custom-scrollbar">
            <button
              type="button"
              v-for="icon in availableIcons"
              :key="icon"
              @click="categoryForm.icon = icon"
              class="w-6 h-6 cursor-pointer flex items-center justify-center text-xl transition-all duration-200"
              :class="{ 'ring-2 ring-offset-2 ring-primary-light dark:ring-primary-dark': categoryForm.icon === icon }"
            >
              {{ icon }}
            </button>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeCategoryModal"
            class="px-4 py-2 rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>

    <!-- Diálogo de Confirmación de Eliminación -->
    <ConfirmDialog
      :is-visible="isConfirmDeleteVisible"
      title="Confirmar Eliminación de Categoría"
      message="¿Estás seguro de que quieres eliminar esta categoría? Si la categoría tiene transacciones asociadas, no podrá ser eliminada."
      @confirm="deleteConfirmedCategory"
      @cancel="cancelDeleteCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Modal from '../components/common/Modal.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseInput from '../components/common/BaseInput.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import { useCategoriesStore } from '../stores/categories';
import type { Category } from '../types/Category';

// Pinia Stores
const categoriesStore = useCategoriesStore();

// Category Filter States
const currentCategoryType = ref<'Ingreso' | 'Gasto'>('Gasto');

// Reactive Data from Store
const categories = computed(() => categoriesStore.categories);

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === currentCategoryType.value);
});

// Form and Modal States
const isModalVisible = ref(false);
const currentCategoryId = ref<string | null>(null);
const categoryForm = ref({
  name: '',
  type: 'Gasto' as 'Ingreso' | 'Gasto',
  icon: '❓',
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

// Confirmation Dialog States
const isConfirmDeleteVisible = ref(false);
const categoryToDeleteId = ref<string | null>(null);

// Available Icons for the selector (Expanded for more variety)
const availableIcons = [
  '💰', '🏠', '🍔', '🚌', '🎁', '💻', '💡', '📚', '🏥', '🎉', '✈️', '🛒', '☕', '🐾', '👕', '📱', '🎮', '🛠️', '💧', '⚡', '🌳', '❤️', '❓',
  '🚗', '⛽',  '💅', '💇', '🏋️', '🎵', '🎬', '🏖️', '🎓', '💍', '💼', '🧾', '🏦', '💳', '💵', '🪙', '📧', '📞', '💡', '🧹', '🧺', '📦', '🔑', '🌈', '🚀'
];

// Message Control Functions
const clearMessages = () => {
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  successMessage.value = null;
  errorMessage.value = null;
};

const showSuccessMessage = (message: string) => {
  clearMessages();
  successMessage.value = message;
  messageTimeout = setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

const showErrorMessage = (message: string) => {
  clearMessages();
  errorMessage.value = message;
  messageTimeout = setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
};

// Modal and Form Control Functions
const openCategoryModal = (category?: Category) => {
  clearMessages();
  if (category) {
    currentCategoryId.value = category.id;
    categoryForm.value = { 
      ...category, 
      icon: category.icon || '❓' 
    };
  } else {
    currentCategoryId.value = null;
    categoryForm.value = {
      name: '',
      type: currentCategoryType.value,
      icon: availableIcons[Math.floor(Math.random() * availableIcons.length)],
    };
  }
  isModalVisible.value = true;
};

const closeCategoryModal = () => {
  isModalVisible.value = false;
  currentCategoryId.value = null;
  categoryForm.value = {
    name: '',
    type: 'Gasto',
    icon: '❓',
  };
};

const saveCategory = async () => {
  clearMessages();

  if (!categoryForm.value.name.trim()) {
    showErrorMessage('El nombre de la categoría es obligatorio.');
    return;
  }
  if (!categoryForm.value.icon) {
    showErrorMessage('Debe seleccionar un ícono para la categoría.');
    return;
  }

  try {
    if (currentCategoryId.value) {
      await categoriesStore.updateCategory(currentCategoryId.value, {
        name: categoryForm.value.name,
        icon: categoryForm.value.icon,
      });
      showSuccessMessage('Categoría actualizada correctamente.');
    } else {
      await categoriesStore.addCategory({
        name: categoryForm.value.name,
        type: categoryForm.value.type,
        icon: categoryForm.value.icon,
      });
      showSuccessMessage('Categoría guardada correctamente.');
    }
    closeCategoryModal();
  } catch (error: any) {
    console.error('Error al guardar/actualizar categoría:', error);
    showErrorMessage(`Error al guardar la categoría: ${error.message}`);
  }
};

// Deletion Functions
const confirmDeleteCategory = (id: string) => {
  categoryToDeleteId.value = id;
  isConfirmDeleteVisible.value = true;
};

const deleteConfirmedCategory = async () => {
  if (categoryToDeleteId.value) {
    try {
      await categoriesStore.deleteCategory(categoryToDeleteId.value);
      showSuccessMessage('Categoría eliminada correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      showErrorMessage(`Error al eliminar la categoría: ${error.message}`);
    } finally {
      isConfirmDeleteVisible.value = false;
      categoryToDeleteId.value = null;
    }
  }
};

const cancelDeleteCategory = () => {
  isConfirmDeleteVisible.value = false;
  categoryToDeleteId.value = null;
};

// Initialization Logic
onMounted(async () => {
  await categoriesStore.fetchCategories();
});
</script>

<style scoped>
/* Estilos para la transición de la notificación flotante */
.fade-message-enter-active, .fade-message-leave-active {
  transition: opacity 0.5s ease-out;
}
.fade-message-enter-from, .fade-message-leave-to {
  opacity: 0;
}
.fade-message-enter-to, .fade-message-leave-from {
  opacity: 1;
}

/* Estilos personalizados para la barra de desplazamiento */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px; /* Ancho de la barra de desplazamiento */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; /* Fondo de la pista de la barra de desplazamiento */
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #333; /* Fondo de la pista en modo oscuro */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888; /* Color del "pulgar" de la barra de desplazamiento */
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #555; /* Color del "pulgar" en modo oscuro */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555; /* Color del "pulgar" al pasar el ratón */
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #777; /* Color del "pulgar" al pasar el ratón en modo oscuro */
}
</style>
