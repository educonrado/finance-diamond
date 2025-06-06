<template>
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js'
import { format, subMonths, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Transaction } from '@/types/Transaction'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Title)

const props = defineProps<{
    transactions: Transaction[]
    selectedMonth: number
    selectedYear: number
}>()

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index' as const,
    },
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                color: '#4B5563',
                usePointStyle: true,
                padding: 20,
            },
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const label = context.dataset.label || ''
                    const value = context.parsed.y || 0
                    return `${label}: $${value.toLocaleString('es-EC', {
                        minimumFractionDigits: 2,
                    })}`
                },
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#6B7280',
                callback: (value: any) => `$${Number(value).toLocaleString('es-EC')}`,
            },
            grid: {
                color: 'rgba(156, 163, 175, 0.2)',
            },
        },
        x: {
            ticks: {
                color: '#6B7280',
            },
            grid: {
                display: false,
            },
        },
    },
}

// Función auxiliar para normalizar fechas
const normalizeDate = (date: Transaction['date']): Date => {
    if (date instanceof Date) return date
    if (typeof date === 'string') return new Date(date)
    return date.toDate() // Asumiendo que es un Timestamp de Firebase
}

const chartData = computed(() => {
    if (!props.transactions?.length) return null

    const months: string[] = []
    const incomeData: number[] = []
    const expenseData: number[] = []

    // Generar datos para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const targetDate = subMonths(new Date(props.selectedYear, props.selectedMonth - 1), i)
        const label = format(targetDate, 'MMM yyyy', { locale: es })
        months.push(label)

        let income = 0
        let expenses = 0

        // Filtrar transacciones del mes actual
        const monthTransactions = props.transactions.filter((transaction) => {
            try {
                const transactionDate = normalizeDate(transaction.date)
                return isSameMonth(transactionDate, targetDate)
            } catch (error) {
                console.warn('Error parsing transaction date:', transaction.date)
                return false
            }
        })

        // Calcular totales
        monthTransactions.forEach((transaction) => {
            const amount = Math.abs(transaction.amount) // Asegurar valores positivos
            if (transaction.type === 'Ingreso') {
                income += amount
            } else if (transaction.type === 'Gasto') {
                expenses += amount
            }
        })

        incomeData.push(income)
        expenseData.push(expenses)
    }

    return {
        labels: months,
        datasets: [
            {
                label: 'Ingresos',
                data: incomeData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Gastos',
                data: expenseData,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#EF4444',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                tension: 0.4,
                fill: true,
            },
        ],
    }
})
</script>