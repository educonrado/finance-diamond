<template>
    <div class="credit-cards p-6 bg-gray-100 min-h-screen">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                class="card-container bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 p-4"
                v-for="card in creditCards"
                :key="card.id"
            >
                <!-- Diseño de la tarjeta de crédito -->
                <div
                    class="credit-card rounded-lg p-6 shadow-md"
                    :style="{ background: card.gradient }"
                >
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-semibold text-white">{{ card.name }}</h2>
                        <p class="text-sm text-gray-200">**** **** **** {{ card.id }}</p>
                    </div>
                    <div class="mt-6">
                        <p class="text-sm text-gray-300">Nombre del Titular</p>
                        <p class="text-lg font-bold text-white">{{ card.cardholder }}</p>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-sm text-gray-300">Válido hasta</p>
                        <p class="text-lg font-bold text-white">12/25</p>
                    </div>
                </div>

                <!-- Detalles financieros -->
                <div class="financial-details mt-4">
                    <p class="text-sm text-gray-500">Saldo Actual:</p>
                    <p
                        class="text-lg font-bold"
                        :class="card.currentBalance < 0 ? 'text-red-600' : 'text-green-600'"
                    >
                        {{ currency(card.currentBalance) }}
                    </p>
                    <p class="text-sm text-gray-500 mt-2">Fecha de Corte:</p>
                    <p class="text-md">{{ card.cutOffDate }}</p>
                    <p class="text-sm text-gray-500 mt-2">Fecha de Pago:</p>
                    <p class="text-md">{{ calculatePaymentDate(card.cutOffDate) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface CreditCard {
    id: number;
    name: string;
    cardholder: string; // Nueva propiedad para el nombre del titular
    cutOffDate: string;
    currentBalance: number;
    gradient: string;
}

const creditCards = ref<CreditCard[]>([
    {
        id: 1,
        name: 'Tarjeta Visa',
        cardholder: 'Juan Pérez', // Nombre del titular
        cutOffDate: '15 de cada mes',
        currentBalance: -1500.0,
        gradient: 'linear-gradient(135deg, #1e3a8a, #111827)', // Azul oscuro a negro
    },
    {
        id: 2,
        name: 'Tarjeta MasterCard',
        cardholder: 'María López', // Nombre del titular
        cutOffDate: '20 de cada mes',
        currentBalance: -2500.5,
        gradient: 'linear-gradient(135deg, #b91c1c, #4b5563)', // Rojo oscuro a gris
    },
    {
        id: 3,
        name: 'Tarjeta American Express',
        cardholder: 'Carlos García', // Nombre del titular
        cutOffDate: '10 de cada mes',
        currentBalance: -3200.75,
        gradient: 'linear-gradient(135deg, #0f766e, #1f2937)', // Verde oscuro a gris oscuro
    },
]);

// Función para calcular la fecha de pago (ejemplo simple)
const calculatePaymentDate = (cutOffDate: string): string => {
    return `5 días después de ${cutOffDate}`;
};

// Función para formatear moneda
const currency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value);
};
</script>