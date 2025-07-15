<template>
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js'
import type { Transaction } from '@/types/Transaction'
import type { Category } from '@/types/Category'
import { isSameMonth } from 'date-fns'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = defineProps<{
    transactions: Transaction[]
    categories: Category[]
    selectedMonth: number
    selectedYear: number
    maxCategories?: number
    transactionType?: string // 'income' | 'expense' | undefined
}>()

const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            right: 20,
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
                title: (tooltipItems: any[]) => {
                    return tooltipItems[0]?.label || ''
                },
                label: (ctx: any) => {
                    const value = ctx.raw || 0
                    return `Total: $${value.toLocaleString('es-EC', {
                        minimumFractionDigits: 2,
                    })}`
                },
            },
        },
    },
    scales: {
        x: {
            beginAtZero: true,
            ticks: {
                color: '#6B7280',
                callback: (value: any) => `$${Number(value).toLocaleString('es-EC')}`,
            },
            grid: {
                color: 'rgba(156, 163, 175, 0.2)',
            },
        },
        y: {
            ticks: {
                color: '#6B7280',
                font: {
                    size: 12,
                },
                maxRotation: 0,
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
    return date.toDate() // Firebase Timestamp
}

// Crear un mapa de categorías para búsqueda rápida
const categoryMap = computed(() => {
    const map = new Map<string, Category>()
    props.categories.forEach(category => {
        map.set(category.id, category)
    })
    return map
})

const chartData = computed(() => {
    if (!props.transactions?.length || !props.categories?.length) {
        return null
    }

    const targetDate = new Date(props.selectedYear, props.selectedMonth - 1)

    // Filtrar transacciones del mes seleccionado y por tipo
    const filteredTransactions = props.transactions.filter((transaction) => {
        try {
            const transactionDate = normalizeDate(transaction.date)
            // Determinar tipo de filtro
            let typeMatch = true
            if (props.transactionType === 'income') {
                typeMatch = transaction.type === 'Ingreso'
            } else if (props.transactionType === 'expense') {
                typeMatch = transaction.type === 'Gasto'
            }
            return (
                typeMatch &&
                isSameMonth(transactionDate, targetDate) &&
                transaction.amount > 0 &&
                transaction.categoryId
            )
        } catch (error) {
            console.warn('Error parsing transaction date:', transaction.date)
            return false
        }
    })

    if (!filteredTransactions.length) {
        return null
    }

    // Agrupar por categoría
    const categoryTotals = new Map<string, number>()

    filteredTransactions.forEach((transaction) => {
        const current = categoryTotals.get(transaction.categoryId) || 0
        categoryTotals.set(transaction.categoryId, current + Math.abs(transaction.amount))
    })

    // Ordenar y limitar categorías
    const maxCategories = props.maxCategories || 6
    const sortedCategories = Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1]) // Ordenar por monto descendente
        .slice(0, maxCategories)

    if (!sortedCategories.length) {
        return null
    }

    // Generar colores dinámicos
    const generateColors = (count: number, isIncome = false) => {
        if (isIncome) {
            // Paleta de verdes y azules suaves para ingresos
            const incomeColors = [
                '#34D399', // green-400
                '#6EE7B7', // green-300
                '#A7F3D0', // green-200
                '#60A5FA', // blue-400
                '#93C5FD', // blue-300
                '#C7D2FE', // indigo-200
                '#F0FDFA', // teal-50
                '#D1FAE5', // emerald-100
            ]
            return Array.from({ length: count }, (_, i) => incomeColors[i % incomeColors.length])
        } else {
            const baseColors = [
                '#EF4444', // red-500
                '#F97316', // orange-500
                '#EAB308', // yellow-500
                '#22C55E', // green-500
                '#3B82F6', // blue-500
                '#8B5CF6', // violet-500
                '#EC4899', // pink-500
                '#6B7280', // gray-500
            ]
            return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length])
        }
    }

    const isIncomeChart = props.transactionType === 'income'
    const labels = sortedCategories.map(([categoryId]) => {
        const category = categoryMap.value.get(categoryId)
        return category?.name || 'Categoría desconocida'
    })

    const data = sortedCategories.map(([, amount]) => amount)
    const colors = generateColors(sortedCategories.length, isIncomeChart)

    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: colors,
                borderRadius: 8,
                borderSkipped: false,
                borderWidth: 0,
                barThickness: 'flex' as const,
                maxBarThickness: 40,
            },
        ],
    }
})
</script>