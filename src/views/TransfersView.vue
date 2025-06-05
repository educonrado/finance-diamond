<template>
    <div class="transfers-page py-6 px-4 md:px-6">
        <h1 class="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">Transferencias</h1>

        <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6 mb-6">
            <h2 class="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                {{ isEditing ? 'Editar Transferencia' : 'Realizar Nueva Transferencia' }}
            </h2>

            <form @submit.prevent="handleTransfer">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="md:col-span-2 flex flex-col md:flex-row items-center gap-4">
                        <div class="flex-1 w-full">
                            <label for="from-account"
                                class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Cuenta
                                de Origen</label>
                            <select id="from-account" v-model="transferForm.fromAccountId"
                                class="block w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm
                         bg-background-input-light dark:bg-background-input-dark text-text-primary-light dark:text-text-primary-dark" required>
                                <option value="" disabled>Selecciona una cuenta</option>
                                <option v-for="account in filteredFromAccounts" :key="account.id" :value="account.id">
                                    {{ account.name }} ({{ formatCurrency(account.balance) }})
                                </option>
                            </select>
                        </div>

                        <button type="button" @click="swapAccounts"
                            class="mt-4 md:mt-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                            aria-label="Intercambiar cuentas">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                        </button>

                        <div class="flex-1 w-full">
                            <label for="to-account"
                                class="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Cuenta
                                de Destino</label>
                            <select id="to-account" v-model="transferForm.toAccountId"
                                class="block w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm
                         bg-background-input-light dark:bg-background-input-dark text-text-primary-light dark:text-text-primary-dark" required>
                                <option value="" disabled>Selecciona una cuenta</option>
                                <option v-for="account in filteredToAccounts" :key="account.id" :value="account.id">
                                    {{ account.name }} ({{ formatCurrency(account.balance) }})
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <BaseInput id="transfer-amount" label="Monto" type="number" v-model.number="transferForm.amount"
                            :required="true" step="0.01" placeholder="0.00" suffix="USD">
                            <template #prefix>
                                <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                            </template>
                        </BaseInput>
                    </div>
                    <div>
                        <BaseInput id="transfer-date" label="Fecha" type="date" v-model="transferForm.date"
                            :required="true" />
                    </div>
                </div>

                <div class="mb-4">
                    <BaseInput id="transfer-details" label="Detalles (Opcional)" type="text"
                        v-model="transferForm.details" placeholder="Ej. Transferencia para ahorros" />
                </div>

                <div v-if="errorMessage" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
                    {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="p-3 mb-4 rounded-md bg-success-light text-white font-medium">
                    {{ successMessage }}
                </div>

                <div class="flex justify-end space-x-3">
                    <button v-if="isEditing" type="button" @click="cancelEditing"
                        class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
                        Cancelar
                    </button>

                    <button type="submit"
                        class="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-200">
                        {{ isEditing ? 'Guardar Cambios' : 'Realizar Transferencia' }}
                    </button>
                </div>
            </form>
        </div>

        <div v-if="isLoading" class="text-center py-4">
            <LoadingSpinner />
            <p class="text-text-secondary-light dark:text-text-secondary-dark mt-2">Cargando transferencias...</p>
        </div>
        <div v-else-if="transfersStore.error" class="p-3 mb-4 rounded-md bg-destructive-light text-white font-medium">
            Error: {{ transfersStore.error }}
        </div>

        <div class="bg-background-card-light dark:bg-background-card-dark rounded-lg shadow-md p-4 md:p-6">
            <h2 class="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">Historial de
                Transferencias</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-border-light dark:divide-border-dark">
                    <thead class="bg-background-alt-light dark:bg-background-alt-dark">
                        <tr>
                            <th scope="col"
                                class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                Fecha
                            </th>
                            <th scope="col"
                                class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                Desde
                            </th>
                            <th scope="col"
                                class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                Hacia
                            </th>
                            <th scope="col"
                                class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                Monto
                            </th>
                            <th scope="col"
                                class="px-2 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                Detalles
                            </th>
                            <th scope="col" class="relative px-2 py-3 md:px-6 md:py-3"><span
                                    class="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        class="bg-background-card-light dark:bg-background-card-dark divide-y divide-border-light dark:divide-border-dark">
                        <tr v-if="filteredTransfers.length === 0">
                            <td colspan="6"
                                class="px-2 py-4 md:px-6 md:py-4 text-center text-text-secondary-light dark:text-text-secondary-dark">
                                No hay transferencias registradas.
                            </td>
                        </tr>
                        <tr v-for="transfer in filteredTransfers" :key="transfer.id">
                            <td
                                class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm text-text-primary-light dark:text-text-primary-dark">
                                {{ formatDate(transfer.date) }}
                            </td>
                            <td
                                class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                                {{accounts.find(acc => acc.id === transfer.fromAccountId)?.name || 'Cuenta Desconocida'
                                }}
                            </td>
                            <td
                                class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                                {{accounts.find(acc => acc.id === transfer.toAccountId)?.name || 'Cuenta Desconocida'
                                }}
                            </td>
                            <td
                                class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm text-text-primary-light dark:text-text-primary-dark">
                                {{ formatCurrency(transfer.amount) }}
                            </td>
                            <td
                                class="px-2 py-4 md:px-6 md:py-4 text-xs md:text-sm text-text-primary-light dark:text-text-primary-dark">
                                {{ transfer.details || '-' }}
                            </td>
                            <td class="px-2 py-4 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button @click="startEditing(transfer)"
                                    class="text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light">
                                    Editar
                                </button>
                                <button @click="handleDeleteTransfer(transfer.id)"
                                    class="text-destructive-light dark:text-destructive-dark hover:text-destructive-dark dark:hover:text-destructive-light ml-4">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAccountsStore } from '@/stores/accounts'; // Usando el alias @/
import { useTransfersStore } from '@/stores/transfers'; // Usando el alias @/

import BaseInput from '@/components/common/BaseInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Transfer } from '@/types/Transfer';
import type { Account } from '@/types/Account';
import { Timestamp } from 'firebase/firestore'; // Importar Timestamp para manejar la fecha


// --- Stores de Pinia ---
const accountsStore = useAccountsStore();
const transfersStore = useTransfersStore();

// --- Estados del Formulario de Transferencia ---
const transferForm = ref({
    id: '', // Añadido para la edición
    amount: 0,
    fromAccountId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD para input type="date"
    details: '',
});

// --- Estados de UI y Mensajes ---
const isLoading = computed(() => accountsStore.isLoading || transfersStore.isLoading);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isEditing = ref(false); // Indica si estamos en modo edición
const currentTransfer = ref<Transfer | null>(null); // La transferencia que se está editando


// --- Computadas para los selectores de cuentas ---
const accounts = computed(() => accountsStore.accounts);

const filteredFromAccounts = computed(() => {
    return accounts.value.filter(account => account.id !== transferForm.value.toAccountId);
});

const filteredToAccounts = computed(() => {
    return accounts.value.filter(account => account.id !== transferForm.value.fromAccountId);
});

// --- Métodos de Ayuda ---
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
};

const formatDate = (dateValue: Date | Timestamp | string | undefined | null) => {
    if (!dateValue) return '';

    let dateToFormat: Date;

    if (dateValue instanceof Date) {
        dateToFormat = dateValue;
    } else if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
        dateToFormat = (dateValue as Timestamp).toDate();
    } else if (typeof dateValue === 'string') {
        dateToFormat = new Date(dateValue);
    } else {
        return '';
    }

    if (isNaN(dateToFormat.getTime())) {
        return '';
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return dateToFormat.toLocaleDateString('es-EC', options);
};

const clearMessages = () => {
    errorMessage.value = null;
    successMessage.value = null;
};

const showErrorMessage = (message: string) => {
    errorMessage.value = message;
    setTimeout(() => errorMessage.value = null, 5000); // Borrar después de 5 segundos
};

const showSuccessMessage = (message: string) => {
    successMessage.value = message;
    setTimeout(() => successMessage.value = null, 5000); // Borrar después de 5 segundos
};

// --- Lógica del Formulario de Transferencia (Creación y Edición) ---
const handleTransfer = async () => {
    clearMessages();

    // Validaciones
    if (!transferForm.value.amount || transferForm.value.amount <= 0) {
        showErrorMessage('El monto de la transferencia debe ser un número positivo.');
        return;
    }
    if (!transferForm.value.fromAccountId) {
        showErrorMessage('Debe seleccionar una cuenta de origen.');
        return;
    }
    if (!transferForm.value.toAccountId) {
        showErrorMessage('Debe seleccionar una cuenta de destino.');
        return;
    }
    if (transferForm.value.fromAccountId === transferForm.value.toAccountId) {
        showErrorMessage('Las cuentas de origen y destino no pueden ser la misma.');
        return;
    }

    try {
        if (isEditing.value && currentTransfer.value) {
            // Actualizar una transferencia existente
            await transfersStore.updateTransfer(transferForm.value.id, {
                amount: transferForm.value.amount,
                fromAccountId: transferForm.value.fromAccountId,
                toAccountId: transferForm.value.toAccountId,
                date: new Date(transferForm.value.date), // Asegúrate de enviar un objeto Date
                details: transferForm.value.details,
            });
            showSuccessMessage('Transferencia actualizada correctamente.');
        } else {
            // Añadir una nueva transferencia
            await transfersStore.addTransfer({
                amount: transferForm.value.amount,
                fromAccountId: transferForm.value.fromAccountId,
                toAccountId: transferForm.value.toAccountId,
                date: new Date(transferForm.value.date), // Asegúrate de enviar un objeto Date
                details: transferForm.value.details,
            });
            showSuccessMessage('Transferencia registrada correctamente.');
        }

        // Después de añadir/actualizar, resetea el formulario y el estado de edición
        resetForm();
        isEditing.value = false;
        currentTransfer.value = null;
    } catch (error: any) {
        console.error('Error al procesar transferencia:', error);
        showErrorMessage(`Error al procesar la transferencia: ${error.message || 'Error desconocido'}`);
    }
};

const startEditing = (transfer: Transfer) => {
    currentTransfer.value = transfer;
    isEditing.value = true;
    clearMessages(); // Limpia cualquier mensaje de error/éxito previo

    // Cargar los datos de la transferencia en el formulario principal
    transferForm.value = {
        id: transfer.id,
        amount: transfer.amount,
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        date: transfer.date instanceof Date
            ? transfer.date.toISOString().split('T')[0]
            : (transfer.date as Timestamp).toDate().toISOString().split('T')[0],
        details: transfer.details || '',
    };

    // Opcional: Desplazar la vista al formulario para que el usuario lo vea
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEditing = () => {
    isEditing.value = false;
    currentTransfer.value = null;
    resetForm(); // Limpia el formulario y lo prepara para una nueva creación
    clearMessages();
};

const resetForm = () => {
    transferForm.value = {
        id: '',
        amount: 0,
        fromAccountId: '',
        toAccountId: '',
        date: new Date().toISOString().split('T')[0],
        details: '',
    };
};

const handleDeleteTransfer = async (transferId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transferencia? Esta acción no se puede deshacer y los saldos de las cuentas se revertirán.')) {
        clearMessages();
        try {
            await transfersStore.deleteTransfer(transferId);
            showSuccessMessage('Transferencia eliminada correctamente.');
        } catch (error: any) {
            console.error('Error al eliminar transferencia:', error);
            showErrorMessage(`Error al eliminar la transferencia: ${error.message || 'Error desconocido'}`);
        }
    }
};

const swapAccounts = () => {
    const from = transferForm.value.fromAccountId;
    transferForm.value.fromAccountId = transferForm.value.toAccountId;
    transferForm.value.toAccountId = from;
};

// --- Computed para la lista de transferencias filtradas/ordenadas ---
const filteredTransfers = computed(() => {
    // Ordenar las transferencias de la más reciente a la más antigua por fecha
    return [...transfersStore.transfers].sort((a, b) => {
        const getTimeValue = (dateLike: Date | Timestamp) => {
            if (dateLike instanceof Date) {
                return dateLike.getTime();
            } else if (typeof dateLike === 'object' && dateLike !== null && 'toDate' in dateLike && typeof dateLike.toDate === 'function') {
                return (dateLike as Timestamp).toDate().getTime();
            }
            return 0;
        };

        const timeA = getTimeValue(a.date);
        const timeB = getTimeValue(b.date);

        return timeB - timeA;
    });
});

// --- Ciclo de Vida ---
onMounted(async () => {
    await accountsStore.fetchAccounts();
    await transfersStore.fetchTransfers();
});
</script>