<template>
    <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  } from 'chart.js'
  import type { Account } from '@/types/Account'
  
  // CategoryScale no es necesario para gráficos de dona
  ChartJS.register(Title, Tooltip, Legend, ArcElement)
  
  const props = defineProps<{
    accounts: Account[]
  }>()
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Permite mejor control del tamaño
    plugins: {
      legend: {
        position: 'right' as const, // TypeScript necesita el 'as const'
        labels: {
          color: '#4B5563',
          usePointStyle: true, // Mejora visual
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label || ''
            const value = tooltipItem.raw || 0
            const total = tooltipItem.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: $${value.toLocaleString('es-EC', {
              minimumFractionDigits: 2,
            })} (${percentage}%)`
          },
        },
      },
    },
  }
  
  const chartData = computed(() => {
    if (!props.accounts?.length) return null
  
    const validAccounts = props.accounts.filter(acc => acc.balance > 0)
    const sortedAccounts = [...validAccounts].sort((a, b) => b.balance - a.balance)
    const total = sortedAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  
    if (total === 0) return null
  
    let cumulativePercent = 0
    const labels: string[] = []
    const data: number[] = []
    const backgroundColor: string[] = []
  
    // Incluir cuentas hasta alcanzar 80% del total o máximo 5 cuentas
    for (const account of sortedAccounts) {
      const accountPercent = (account.balance / total) * 100
      cumulativePercent += accountPercent
  
      if (labels.length < 5 && cumulativePercent <= 85) {
        labels.push(account.name)
        data.push(account.balance)
        backgroundColor.push(account.color || '#6B7280') // Color por defecto
      } else {
        break
      }
    }
  
    // Agrupar cuentas restantes como "Otras"
    const includedTotal = data.reduce((sum, val) => sum + val, 0)
    const othersTotal = total - includedTotal
  
    if (othersTotal > 0) {
      labels.push('Otras cuentas')
      data.push(othersTotal)
      backgroundColor.push('#9CA3AF')
    }
  
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverBorderWidth: 3,
        },
      ],
    }
  })
  </script>